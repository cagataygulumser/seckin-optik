/**
 * Seçkin Optik — PayTR ödeme sunucusu (Cloudflare Worker)
 *
 * Uçlar
 *   POST /odeme-baslat   Sitedeki ödeme sayfası çağırır. Sepeti ve müşteri bilgisini alır,
 *                        fiyatları SİTEDEN kendisi doğrular, PayTR iFrame token'ı üretir.
 *   POST /paytr-bildirim PayTR panelindeki "Bildirim URL". Ödeme sonucunu doğrular, siparişi günceller.
 *   GET  /               Sağlık kontrolü.
 *
 * Ortam değişkenleri (Cloudflare → Worker → Settings → Variables)
 *   MERCHANT_ID      (gizli)  PayTR mağaza no
 *   MERCHANT_KEY     (gizli)  PayTR mağaza parola
 *   MERCHANT_SALT    (gizli)  PayTR mağaza gizli anahtar
 *   SITE             https://seckin-optik.blogspot.com   (sonda / olmadan)
 *   IZINLI_KOKENLER  https://seckin-optik.blogspot.com,https://www.seckinoptik.com.tr
 *   TEST_MODE        1 = test, 0 = canlı
 *   SHEET_WEBHOOK    (isteğe bağlı) Google Apps Script web uygulaması adresi
 *   SHEET_SECRET     (isteğe bağlı, gizli) Apps Script'teki GIZLI ile aynı
 * KV bağlaması (isteğe bağlı): SIPARISLER
 */

const PAYTR_TOKEN_URL = "https://www.paytr.com/odeme/api/get-token";
const MAKS_ADET = 5;
const MAKS_KALEM = 20;
let urunOnbellek = { zaman: 0, veri: null };

export default {
  async fetch(istek, env, ctx) {
    const url = new URL(istek.url);
    const koken = istek.headers.get("Origin") || "";
    const cors = corsBasliklari(koken, env);

    if (istek.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });

    try {
      if (url.pathname === "/odeme-baslat" && istek.method === "POST") {
        if (!izinliMi(koken, env)) return json({ hata: "Bu kaynaktan istek kabul edilmiyor" }, 403, cors);
        return await odemeBaslat(istek, env, ctx, cors);
      }
      if (url.pathname === "/paytr-bildirim" && istek.method === "POST") {
        return await paytrBildirim(istek, env, ctx);
      }
      if (url.pathname === "/" && istek.method === "GET") {
        return new Response("Seçkin Optik ödeme sunucusu çalışıyor.", { headers: { "Content-Type": "text/plain; charset=utf-8" } });
      }
      return json({ hata: "Bulunamadı" }, 404, cors);
    } catch (h) {
      console.error(h);
      return json({ hata: "Sunucu hatası" }, 500, cors);
    }
  },
};

/* ------------------------------------------------------------------ */
async function odemeBaslat(istek, env, ctx, cors) {
  const govde = await istek.json().catch(() => null);
  if (!govde || !Array.isArray(govde.sepet) || !govde.musteri) return json({ hata: "Eksik bilgi" }, 400, cors);

  const m = temizMusteri(govde.musteri);
  const eksik = musteriHatasi(m);
  if (eksik) return json({ hata: eksik }, 400, cors);
  if (!govde.sepet.length || govde.sepet.length > MAKS_KALEM) return json({ hata: "Sepet geçersiz" }, 400, cors);

  // Fiyatlar tarayıcıdan değil, sitenin kendisinden alınır.
  const urunler = await urunleriGetir(env);
  const sepet = [];
  for (const k of govde.sepet) {
    const yol = yolu(k.url);
    const u = urunler.get(yol);
    if (!u) return json({ hata: "Sepetteki bir ürün artık satışta değil" }, 409, cors);
    if (u.stok === "yok") return json({ hata: `${u.ad} şu an stokta yok` }, 409, cors);
    const adet = Math.max(1, Math.min(MAKS_ADET, parseInt(k.adet, 10) || 1));
    sepet.push({ ad: u.ad, fiyat: u.fiyat, adet, url: env.SITE + yol });
  }
  const toplam = sepet.reduce((t, s) => t + s.fiyat * s.adet, 0);
  const tutarKurus = Math.round(toplam * 100);
  if (tutarKurus <= 0) return json({ hata: "Tutar geçersiz" }, 400, cors);

  const siparisNo = siparisNoUret();
  const userIp = istek.headers.get("CF-Connecting-IP") || "127.0.0.1";
  const sepetB64 = b64Metin(JSON.stringify(sepet.map((s) => [s.ad, s.fiyat.toFixed(2), s.adet])));
  const noInstallment = "0", maxInstallment = "0", currency = "TL";
  const testMode = env.TEST_MODE === "0" ? "0" : "1";

  const hashStr = env.MERCHANT_ID + userIp + siparisNo + m.eposta + tutarKurus + sepetB64 + noInstallment + maxInstallment + currency + testMode;
  const paytrToken = await hmacB64(env.MERCHANT_KEY, hashStr + env.MERCHANT_SALT);

  const form = new URLSearchParams({
    merchant_id: env.MERCHANT_ID,
    user_ip: userIp,
    merchant_oid: siparisNo,
    email: m.eposta,
    payment_amount: String(tutarKurus),
    paytr_token: paytrToken,
    user_basket: sepetB64,
    debug_on: env.DEBUG_ON === "1" ? "1" : "0",
    no_installment: noInstallment,
    max_installment: maxInstallment,
    user_name: m.ad,
    user_address: `${m.adres}, ${m.ilce} / ${m.il}`,
    user_phone: m.telefon,
    merchant_ok_url: env.SITE + "/p/odeme-basarili.html",
    merchant_fail_url: env.SITE + "/p/odeme-basarisiz.html",
    timeout_limit: "30",
    currency,
    test_mode: testMode,
    lang: "tr",
  });

  const yanit = await fetch(PAYTR_TOKEN_URL, { method: "POST", body: form });
  const sonuc = await yanit.json().catch(() => ({ status: "failed", reason: "PayTR yanıtı okunamadı" }));
  if (sonuc.status !== "success") {
    console.error("PayTR token hatası", sonuc.reason);
    return json({ hata: "Ödeme başlatılamadı: " + (sonuc.reason || "bilinmeyen hata") }, 502, cors);
  }

  const kayit = {
    siparisNo, durum: "odeme-bekliyor", tarih: new Date().toISOString(),
    toplam, sepet, musteri: m, test: testMode === "1",
  };
  ctx.waitUntil(kaydet(env, kayit));
  return json({ token: sonuc.token, siparisNo, toplam }, 200, cors);
}

/* ------------------------------------------------------------------ */
async function paytrBildirim(istek, env, ctx) {
  const f = await istek.formData();
  const oid = f.get("merchant_oid") || "";
  const status = f.get("status") || "";
  const totalAmount = f.get("total_amount") || "";
  const gelenHash = f.get("hash") || "";

  const beklenen = await hmacB64(env.MERCHANT_KEY, oid + env.MERCHANT_SALT + status + totalAmount);
  if (!esitMi(beklenen, gelenHash)) {
    return new Response("PAYTR notification failed: bad hash", { status: 400 });
  }

  let kayit = env.SIPARISLER ? await env.SIPARISLER.get(oid, "json") : null;
  if (kayit && (kayit.durum === "odendi" || kayit.durum === "basarisiz")) return new Response("OK"); // tekrar eden bildirim
  kayit = kayit || { siparisNo: oid };
  kayit.durum = status === "success" ? "odendi" : "basarisiz";
  kayit.odenen = Number(totalAmount) / 100;
  kayit.odemeTipi = f.get("payment_type") || "";
  kayit.taksit = f.get("installment_count") || "";
  kayit.hataKodu = f.get("failed_reason_code") || "";
  kayit.hataMesaji = f.get("failed_reason_msg") || "";
  kayit.bildirimTarihi = new Date().toISOString();
  await kaydet(env, kayit);
  return new Response("OK"); // PayTR yalnızca düz "OK" bekler
}

/* ------------------------------------------------------------------ */
async function kaydet(env, kayit) {
  if (env.SIPARISLER) await env.SIPARISLER.put(kayit.siparisNo, JSON.stringify(kayit), { expirationTtl: 60 * 60 * 24 * 400 });
  if (env.SHEET_WEBHOOK) {
    await fetch(env.SHEET_WEBHOOK, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gizli: env.SHEET_SECRET || "", ...kayit }),
      redirect: "follow",
    }).catch((h) => console.error("Tablo kaydı başarısız", h));
  }
}

async function urunleriGetir(env) {
  if (urunOnbellek.veri && Date.now() - urunOnbellek.zaman < 5 * 60 * 1000) return urunOnbellek.veri;
  const harita = new Map();
  let bas = 1;
  for (let sayfa = 0; sayfa < 20; sayfa++) {
    const r = await fetch(`${env.SITE}/feeds/posts/default?alt=json&max-results=150&start-index=${bas}`, { cf: { cacheTtl: 120 } });
    const j = await r.json();
    const girdiler = (j.feed && j.feed.entry) || [];
    for (const g of girdiler) {
      const link = (g.link || []).find((l) => l.rel === "alternate");
      const html = (g.content && g.content.$t) || "";
      const div = html.match(/<div[^>]*class="so-urun"[^>]*>/i);
      if (!link || !div) continue;
      const d = {};
      for (const a of div[0].matchAll(/data-([a-z-]+)="([^"]*)"/gi)) d[a[1].toLowerCase()] = htmlCoz(a[2]);
      const fiyat = sayi(d["fiyat"]);
      if (!isFinite(fiyat) || fiyat <= 0) continue;
      const ad = `${d["marka"] || ""} ${d["model"] || g.title.$t}`.trim().slice(0, 120);
      harita.set(yolu(link.href), { ad, fiyat: Math.round(fiyat * 100) / 100, stok: (d["stok"] || "var").toLowerCase() });
    }
    if (girdiler.length < 150) break;
    bas += 150;
  }
  urunOnbellek = { zaman: Date.now(), veri: harita };
  return harita;
}

/* ---------------- yardımcılar ---------------- */
function temizMusteri(m) {
  const t = (v, n = 200) => String(v || "").replace(/[<>]/g, "").trim().slice(0, n);
  const tel = t(m.telefon, 20).replace(/\D/g, "").replace(/^90/, "").replace(/^0/, "");
  return {
    ad: t(m.ad, 60), telefon: tel ? "0" + tel : "", eposta: t(m.eposta, 100).toLowerCase(),
    il: t(m.il, 40), ilce: t(m.ilce, 60), adres: t(m.adres, 300),
    faturaTuru: m.faturaTuru === "kurumsal" ? "kurumsal" : "bireysel",
    firma: t(m.firma, 120), vergiDairesi: t(m.vergiDairesi, 60), vergiNo: t(m.vergiNo, 11).replace(/\D/g, ""),
    not: t(m.not, 400), ileti: !!m.ileti,
  };
}
function musteriHatasi(m) {
  if (m.ad.split(/\s+/).filter(Boolean).length < 2) return "Ad soyad eksik";
  if (!/^05\d{9}$/.test(m.telefon)) return "Telefon geçersiz";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(m.eposta)) return "E-posta geçersiz";
  if (!m.il || m.ilce.length < 2 || m.adres.length < 10) return "Adres eksik";
  return "";
}
function yolu(u) { try { return new URL(String(u || ""), "https://site.invalid").pathname; } catch { return String(u || ""); } }
function sayi(v) {
  if (v == null || v === "") return NaN;
  v = String(v).trim();
  if (/,\d{1,2}$/.test(v)) v = v.replace(/\./g, "").replace(",", ".");
  return parseFloat(v.replace(/[^\d.]/g, ""));
}
function htmlCoz(s) { return s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">"); }
function siparisNoUret() {
  // PayTR merchant_oid: yalnızca harf ve rakam
  const t = new Date(), p = (n) => String(n).padStart(2, "0");
  const r = crypto.getRandomValues(new Uint8Array(4));
  const ek = Array.from(r, (b) => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[b % 32]).join("");
  return `SO${String(t.getUTCFullYear()).slice(2)}${p(t.getUTCMonth() + 1)}${p(t.getUTCDate())}${p(t.getUTCHours())}${p(t.getUTCMinutes())}${ek}`;
}
function b64Metin(s) {
  const bayt = new TextEncoder().encode(s);
  let ikili = ""; for (const b of bayt) ikili += String.fromCharCode(b);
  return btoa(ikili);
}
async function hmacB64(anahtar, mesaj) {
  const k = await crypto.subtle.importKey("raw", new TextEncoder().encode(anahtar), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const imza = new Uint8Array(await crypto.subtle.sign("HMAC", k, new TextEncoder().encode(mesaj)));
  let ikili = ""; for (const b of imza) ikili += String.fromCharCode(b);
  return btoa(ikili);
}
function esitMi(a, b) {
  if (a.length !== b.length) return false;
  let f = 0; for (let i = 0; i < a.length; i++) f |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return f === 0;
}
function izinliMi(koken, env) {
  const liste = (env.IZINLI_KOKENLER || env.SITE || "").split(",").map((s) => s.trim().replace(/\/$/, "")).filter(Boolean);
  return liste.includes(koken.replace(/\/$/, ""));
}
function corsBasliklari(koken, env) {
  const h = { "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type", "Vary": "Origin" };
  if (izinliMi(koken, env)) h["Access-Control-Allow-Origin"] = koken;
  return h;
}
function json(veri, durum, cors) {
  return new Response(JSON.stringify(veri), { status: durum, headers: { "Content-Type": "application/json; charset=utf-8", ...(cors || {}) } });
}

// Testler için dışa açılanlar
export const _test = { hmacB64, b64Metin, sayi, temizMusteri, musteriHatasi, siparisNoUret };
