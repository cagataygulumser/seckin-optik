/* Seçkin Optik — ek özellikler | github.com/cagataygulumser/seckin-optik
   Favoriler · akıllı arama · çerçeve şekli filtresi · gözlük asistanı · sanal deneme · cam gösterimi
   Google puanı ve Instagram bantları · randevu / iletişim formları · vitrin QR etiketleri · çerez tercihi · dil anahtarı
   tema/seckin.js ve tema/sepet.js'ten sonra yüklenir; window.SO üzerinden çalışır. */
(function () {
  "use strict";
  var SO = window.SO; if (!SO) return;
  var cs = document.currentScript;
  var KOK = ((cs && cs.src) || "").replace(/tema\/[^\/]*$/, "");
  var B = document.body, A = SO.AYAR, esc = SO.esc, tl = SO.tl, norm = SO.norm;
  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  function oku(k, v) { try { var x = localStorage.getItem(k); return x ? JSON.parse(x) : v; } catch (e) { return v; } }
  function yaz(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function yol(u) { try { return new URL(u, location.href).pathname; } catch (e) { return u; } }
  function olay(ad, veri) { try { if (window.gtag) window.gtag("event", ad, veri || {}); } catch (e) {} }
  function el(html) { var d = document.createElement("div"); d.innerHTML = html; return d.firstElementChild; }
  var QS = new URLSearchParams(location.search);

  /* Mağaza bilgileri (Google işletme kaydından; değişirse buradan güncelleyin) */
  var MAGAZA = {
    google: { puan: 4.5, adet: 22, yer: "ChIJn3y57c-psRQRSnoF9DHAw0M" },
    saat: "Pazartesi – Cumartesi 08:30 – 20:00 · Pazar kapalı",
    instagram: "seckinoptik17"
  };
  var SEKIL = { pilot: "Pilot", "cat-eye": "Cat eye", kare: "Kare", koseli: "Köşeli", yuvarlak: "Yuvarlak", oval: "Oval", clubmaster: "Clubmaster" };
  var IK = {
    kalp: "<svg fill='none' stroke='currentColor' stroke-linejoin='round' stroke-width='1.9' viewBox='0 0 24 24'><path d='M12 20.5s-7.5-4.6-9.3-9.2C1.3 7.600 3.700 4.500 7 4.500c2 0 3.600 1 5 2.800 1.400-1.800 3-2.800 5-2.800 3.300 0 5.700 3.100 4.300 6.800C19.500 15.900 12 20.500 12 20.500z'/></svg>",
    gozluk: "<svg fill='none' stroke='currentColor' stroke-linecap='round' stroke-width='1.9' viewBox='0 0 24 24'><circle cx='6.5' cy='13' r='4'/><circle cx='17.5' cy='13' r='4'/><path d='M10.5 12.500c.9-.8 2.100-.8 3 0M2.500 12l1.500-5M21.500 12L20 7'/></svg>",
    kamera: "<svg fill='none' stroke='currentColor' stroke-linejoin='round' stroke-width='1.9' viewBox='0 0 24 24'><path d='M4 7h3l2-3h6l2 3h3v12H4z'/><circle cx='12' cy='13' r='3.500'/></svg>",
    kapat: "<svg fill='none' stroke='currentColor' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24'><path d='M6 6l12 12M18 6L6 18'/></svg>",
    yildiz: "<svg viewBox='0 0 24 24' fill='currentColor'><path d='M12 2.500l2.900 6.200 6.600.800-4.900 4.600 1.300 6.600L12 17.400 6.100 20.700l1.300-6.600L2.500 9.500l6.600-.800z'/></svg>",
    ok: "<svg fill='none' stroke='currentColor' stroke-width='2' viewBox='0 0 24 24'><path d='M5 12h14M13 6l6 6-6 6'/></svg>"
  };

  /* ================= FAVORİLER ================= */
  var FAV = oku("so_fav", []);
  function favVar(u) { return FAV.indexOf(yol(u)) > -1; }
  function favDegis(u) { var y = yol(u), i = FAV.indexOf(y); if (i > -1) FAV.splice(i, 1); else FAV.push(y); yaz("so_fav", FAV); favGuncelle(); olay(i > -1 ? "favori_cikar" : "favori_ekle", { sayfa: y }); return i < 0; }
  function favGuncelle() {
    var r = $("#so-fav-say"); if (r) { r.textContent = FAV.length; r.classList.toggle("gizli", !FAV.length); }
    $$(".so-kalp").forEach(function (b) { var v = favVar(b.getAttribute("data-url")); b.classList.toggle("dolu", v); b.setAttribute("aria-pressed", v ? "true" : "false"); b.setAttribute("aria-label", v ? "Favorilerden çıkar" : "Favorilere ekle"); });
  }
  function favKur() {
    var arac = $(".ust-arac"); if (arac && !$("#so-fav")) {
      var a = el("<a aria-label='Favorilerim' class='ikon-btn so-fav' href='/search?fav=1' id='so-fav'>" + IK.kalp + "<span class='so-fav-say gizli' id='so-fav-say'>0</span></a>");
      arac.insertBefore(a, $("#ust-wa") || arac.firstChild);
    }
    favGuncelle();
  }
  function kartlariSusle() {
    $$(".kart[data-url]").forEach(function (k) {
      if ($(".so-kalp", k)) return;
      var b = el("<button class='so-kalp' type='button'>" + IK.kalp + "</button>"); b.setAttribute("data-url", k.getAttribute("data-url")); k.appendChild(b);
    });
    favGuncelle();
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest(".so-kalp"); if (!b) return;
    e.preventDefault(); e.stopPropagation(); favDegis(b.getAttribute("data-url"));
    if (QS.get("fav") && SO.liste) SO.liste.ciz();
  });

  /* ================= AKILLI ARAMA ================= */
  var SOZ = {
    cinsiyet: { kadin: ["kadin", "bayan", "kiz"], erkek: ["erkek", "bay"], cocuk: ["cocuk", "junior", "kids"], unisex: ["unisex"] },
    renk: { siyah: ["siyah", "black"], kahve: ["kahve", "kahverengi", "brown"], fume: ["fume", "gri", "grey", "gray"], yesil: ["yesil", "green"], mavi: ["mavi", "blue", "lacivert"], sari: ["sari", "yellow"], mor: ["mor", "lila", "purple"], kirmizi: ["kirmizi", "bordo", "red"], pembe: ["pembe", "pink"], altin: ["altin", "gold", "dore"], gumus: ["gumus", "silver"], seffaf: ["seffaf", "transparan"], beyaz: ["beyaz", "white"], cokrenkli: ["cokrenkli", "desenli", "leopar", "havana", "bal"] },
    malzeme: { metal: ["metal"], asetat: ["asetat", "kemik", "plastik"], titanyum: ["titanyum", "titanium"] },
    sekil: { pilot: ["pilot", "damla", "aviator"], "cat-eye": ["cateye", "kedi", "kedigozu", "kelebek"], kare: ["kare", "square"], koseli: ["koseli", "dikdortgen"], yuvarlak: ["yuvarlak", "round"], oval: ["oval"], clubmaster: ["clubmaster", "club"] },
    ozellik: { polarize: ["polarize", "polarized", "polarli"], indirim: ["indirim", "indirimli", "kampanya", "ucuz"], yeni: ["yeni", "yenigelen"], degrade: ["degrade", "gecisli"], mineral: ["mineral"], organik: ["organik"] }
  };
  function mesafe(a, b) { /* Levenshtein, kısa kelimeler için */
    if (a === b) return 0; var m = a.length, n = b.length; if (Math.abs(m - n) > 2) return 3;
    var d = [], i, j; for (i = 0; i <= m; i++) d[i] = [i]; for (j = 1; j <= n; j++) d[0][j] = j;
    for (i = 1; i <= m; i++) for (j = 1; j <= n; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return d[m][n];
  }
  function benzer(k, aday) { return k === aday || (k.length >= 4 && mesafe(k, aday) <= (k.length >= 7 ? 2 : 1)); }
  var _coz = {};
  function sorguCoz(q, urunler) {
    if (_coz[q]) return _coz[q];
    var ham = String(q || "").toLocaleLowerCase("tr-TR"), K = { olcut: [], serbest: [], etiket: [] };
    /* fiyat: "5000 altı", "5000 tl üstü", "2000-6000" */
    var f = ham.match(/(\d[\d.]*)\s*(?:tl|₺)?\s*(?:-|–|ile)\s*(\d[\d.]*)\s*(?:tl|₺)?(?:\s*arasi|\s*arası)?/);
    if (f && +f[1].replace(/\./g, "") >= 300) { var a1 = +f[1].replace(/\./g, ""), a2 = +f[2].replace(/\./g, ""); K.olcut.push(function (u) { return u.fiyat >= a1 && u.fiyat <= a2; }); K.etiket.push(tl(a1) + " – " + tl(a2)); ham = ham.replace(f[0], " "); }
    f = ham.match(/(\d[\d.]*)\s*(?:tl|₺|lira)?\s*(alti|altı|altinda|altında|ustu|üstü|uzeri|üzeri|ustunde|üstünde)/);
    if (f) { var s1 = +f[1].replace(/\./g, ""), alt = /alt/.test(f[2]); K.olcut.push(function (u) { return alt ? u.fiyat <= s1 : u.fiyat >= s1; }); K.etiket.push(tl(s1) + (alt ? " altı" : " üstü")); ham = ham.replace(f[0], " "); }
    /* ölçü: 53 21 145 */
    f = ham.match(/\b(\d{2})[\s\-\/□](\d{2})(?:[\s\-\/](\d{3}))?\b/);
    if (f) { var o1 = f[1], o2 = f[2]; K.olcut.push(function (u) { var p = (u.olcu || "").split(/[-\/ ]+/); return p[0] === o1 && p[1] === o2; }); K.etiket.push(o1 + "-" + o2 + " ölçü"); ham = ham.replace(f[0], " "); }
    var kelimeler = ham.replace(/cat[\s-]*eye/g, "cateye").replace(/kedi\s*gözü/g, "kedigozu").replace(/çok\s*renkli/g, "cokrenkli").split(/[^0-9a-zçğıöşü\/]+/i).map(norm).filter(Boolean);
    var markalar = {}; (urunler || []).forEach(function (u) { if (u.marka) markalar[norm(u.marka)] = u.marka; });
    var bos = { gunes: 1, gozluk: 1, gozlugu: 1, gozlukleri: 1, model: 1, modeli: 1, icin: 1, ve: 1, bir: 1, cerceve: 1, cam: 1, camli: 1, renk: 1, renkli: 1, tl: 1, lira: 1 };
    for (var i = 0; i < kelimeler.length; i++) {
      var k = kelimeler[i], bulundu = false, iki = kelimeler[i + 1] ? k + kelimeler[i + 1] : "";
      if (bos[k]) continue;
      /* marka (iki kelimelik markalar dahil: "ray ban", "gigi studios") */
      Object.keys(markalar).forEach(function (mk) {
        if (bulundu) return;
        if ((iki && benzer(iki, mk)) || benzer(k, mk) || (k.length >= 4 && mk.indexOf(k) === 0)) {
          var ad = markalar[mk]; K.olcut.push(function (u) { return u.marka === ad; }); K.etiket.push(ad); bulundu = true; if (iki && benzer(iki, mk)) i++;
        }
      });
      if (bulundu) continue;
      Object.keys(SOZ).forEach(function (grup) {
        if (bulundu) return;
        Object.keys(SOZ[grup]).forEach(function (deger) {
          if (bulundu) return;
          if (SOZ[grup][deger].some(function (x) { return benzer(k, x); })) {
            bulundu = true;
            if (grup === "cinsiyet") { K.olcut.push(function (u) { return SO.katlari(u).indexOf(deger) > -1; }); K.etiket.push(SO.KAT[deger]); }
            else if (grup === "renk") { K.olcut.push(function (u) { return SOZ.renk[deger].some(function (x) { return norm([u.renk, u.cerceveRenk, u.camRenk].join(" ")).indexOf(x) > -1; }); }); K.etiket.push(deger === "cokrenkli" ? "Çok renkli" : ({ fume: "Füme", yesil: "Yeşil", sari: "Sarı", kirmizi: "Kırmızı", altin: "Altın", gumus: "Gümüş", seffaf: "Şeffaf" }[deger] || deger.charAt(0).toUpperCase() + deger.slice(1))); }
            else if (grup === "malzeme") { K.olcut.push(function (u) { return SOZ.malzeme[deger].some(function (x) { return norm(u.cerceve).indexOf(x) > -1; }); }); K.etiket.push(deger.charAt(0).toUpperCase() + deger.slice(1)); }
            else if (grup === "sekil") { K.olcut.push(function (u) { return u.sekil === deger || norm(u.baslik + " " + u.cam).indexOf(norm(deger)) > -1; }); K.etiket.push(SEKIL[deger]); }
            else if (deger === "polarize") { K.olcut.push(function (u) { return /evet|var|polar/i.test(u.polarize) || /polarize/i.test(u.baslik); }); K.etiket.push("Polarize"); }
            else if (deger === "indirim") { K.olcut.push(function (u) { return SO.indirimYuzde(u) > 0; }); K.etiket.push("İndirimli"); }
            else if (deger === "yeni") { K.olcut.push(function (u) { return u.yeni; }); K.etiket.push("Yeni"); }
            else { K.olcut.push(function (u) { return norm(u.cam + " " + u.baslik).indexOf(deger) > -1; }); K.etiket.push(deger.charAt(0).toUpperCase() + deger.slice(1)); }
          }
        });
      });
      if (!bulundu) K.serbest.push(k);
    }
    /* tüm ölçütlere uyan yoksa en yakınları göster */
    var tam = (urunler || []).filter(function (u) { return uyum(u, K) === 1; });
    K.gevsek = !tam.length && (K.olcut.length + K.serbest.length) > 1;
    _coz[q] = K; return K;
  }
  function uyum(u, K) {
    var top = K.olcut.length + K.serbest.length; if (!top) return 1;
    var metin = norm([u.baslik, u.marka, u.model, u.renk, u.camRenk, u.cerceve, (u.etiketler || []).join(" "), u.barkod].join(" ")), n = 0;
    K.olcut.forEach(function (f) { if (f(u)) n++; });
    K.serbest.forEach(function (s) { if (metin.indexOf(s) > -1) n++; });
    return n / top;
  }
  window.SO_ARA = function (u, q, urunler) { var K = sorguCoz(q, urunler); var p = uyum(u, K); return K.gevsek ? p >= 0.5 : p === 1; };
  function aramaRozet() {
    var L = SO.liste; if (!L) return; var kutu = $("#so-anlasilan"), q = L.D.q;
    if (!q) { if (kutu) kutu.remove(); return; }
    var K = sorguCoz(q, L.urunler); if (!K.etiket.length) { if (kutu) kutu.remove(); return; }
    if (!kutu) { kutu = el("<p class='so-anlasilan' id='so-anlasilan'></p>"); var sb = $("#sonuc-bilgi"); sb.parentNode.insertBefore(kutu, sb); }
    kutu.innerHTML = "<span>Aranan:</span>" + K.etiket.map(function (e) { return "<b>" + esc(e) + "</b>"; }).join("") + (K.gevsek ? "<em>Tümüne uyan model yok; en yakınlar gösteriliyor.</em>" : "");
  }

  /* ================= SÜZGEÇ: favoriler + çerçeve şekli ================= */
  var SUZ = { fav: !!QS.get("fav"), sekil: (QS.get("sekil") || "").toLowerCase() };
  window.SO_SUZ = function (u) {
    if (SUZ.fav && !favVar(u.url)) return false;
    if (SUZ.sekil && u.sekil !== SUZ.sekil) return false;
    return true;
  };
  var _listeKuruldu = false;
  function listeHazir() {
    var L = SO.liste;
    kartlariSusle();
    if (!L) return;
    aramaRozet();
    if (_listeKuruldu) return; _listeKuruldu = true;
    /* şekil çipleri: yalnızca ürünlerde bulunan şekiller */
    var var_ = {}; L.urunler.forEach(function (u) { if (SEKIL[u.sekil]) var_[u.sekil] = (var_[u.sekil] || 0) + 1; });
    var anahtar = Object.keys(SEKIL).filter(function (k) { return var_[k]; });
    var filtre = $(".filtre");
    if (anahtar.length > 1 && filtre && !SUZ.fav) {
      var satir = el("<div class='so-sekiller' id='so-sekiller'><span>Çerçeve şekli</span><button class='cip2' data-sekil='' type='button'>Hepsi</button>" +
        anahtar.map(function (k) { return "<button class='cip2' data-sekil='" + k + "' type='button'>" + sekilIkon(k) + SEKIL[k] + "</button>"; }).join("") +
        "<a href='/p/yuz-sekli-rehberi.html'>Yüzüme hangisi uyar?</a></div>");
      filtre.parentNode.insertBefore(satir, filtre.nextSibling);
      var isaret = function () { $$(".cip2", satir).forEach(function (c) { c.classList.toggle("aktif", c.getAttribute("data-sekil") === SUZ.sekil); }); };
      satir.addEventListener("click", function (e) { var c = e.target.closest(".cip2"); if (!c) return; SUZ.sekil = c.getAttribute("data-sekil"); isaret(); L.D.goster = A.sayfaBasi; L.ciz(); olay("sekil_filtre", { sekil: SUZ.sekil || "hepsi" }); });
      isaret();
    }
    if (SUZ.fav) {
      var lu = $("#liste-ust"), lb = $("#liste-baslik"); if (lu) lu.textContent = "Favoriler"; if (lb) lb.textContent = "Favorilerim";
      var kol = $("#koleksiyon"); if (kol) kol.style.paddingTop = "40px";
    }
    if (SUZ.fav || SUZ.sekil) L.ciz();
    if (SUZ.sekil && B.classList.contains("v-ana")) { var k2 = $("#koleksiyon"); if (k2) setTimeout(function () { k2.scrollIntoView(); }, 60); }
  }
  function sekilIkon(k) {
    var p = { pilot: "M3 9c0-1 1-2 3-2h3c1.500 0 2 .800 2 2 0 3-1.500 6-4 6S3 12 3 9zm10 0c0-1.200.500-2 2-2h3c2 0 3 1 3 2 0 3-1.500 6-4 6s-4-3-4-6z", "cat-eye": "M2 8l8 1c.600 3-1 6-4 6S2 12 2 8zm20 0l-8 1c-.600 3 1 6 4 6s4-3 4-7z", kare: "M3 8h7v7H3zm11 0h7v7h-7z", koseli: "M2 9h8v5H2zm12 0h8v5h-8z", yuvarlak: "M6.500 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm11 0a4 4 0 1 0 0 8 4 4 0 0 0 0-8z", oval: "M6.500 9C4 9 2.500 10.300 2.500 12s1.500 3 4 3 4-1.300 4-3-1.500-3-4-3zm11 0c-2.500 0-4 1.300-4 3s1.500 3 4 3 4-1.300 4-3-1.500-3-4-3z", clubmaster: "M2 8h8c0 4-1.500 7-4 7s-4-3-4-7zm12 0h8c0 4-1.500 7-4 7s-4-3-4-7z" }[k];
    return p ? "<svg fill='none' stroke='currentColor' stroke-linejoin='round' stroke-width='1.600' viewBox='0 0 24 24'><path d='" + p + "'/></svg>" : "";
  }

  /* ================= GÖZLÜK ASİSTANI ================= */
  var AST = { adim: 0, cevap: {} };
  var SORU = [
    { k: "kim", s: "Gözlük kimin için?", o: [["kadin", "Kadın"], ["erkek", "Erkek"], ["cocuk", "Çocuk"], ["", "Fark etmez"]] },
    { k: "yuz", s: "Yüz şekliniz hangisine yakın?", not: "Emin değilseniz saçınızı toplayıp aynada yüz hattınıza bakın.", o: [["oval", "Oval"], ["yuvarlak", "Yuvarlak"], ["kare", "Kare"], ["kalp", "Kalp"], ["uzun", "Uzun"], ["", "Bilmiyorum"]] },
    { k: "tarz", s: "Nasıl bir görünüm istiyorsunuz?", o: [["klasik", "Klasik, zamansız"], ["iddiali", "İddialı, dikkat çeken"], ["hafif", "Hafif ve rahat"], ["", "Fark etmez"]] },
    { k: "kullanim", s: "En çok nerede kullanacaksınız?", o: [["surus", "Araç kullanırken, denizde"], ["sehir", "Şehirde, günlük"], ["", "Her yerde"]] },
    { k: "butce", s: "Bütçeniz ne kadar?", o: [["3000", "3.000 TL'ye kadar"], ["7000", "7.000 TL'ye kadar"], ["15000", "15.000 TL'ye kadar"], ["", "Fark etmez"]] }
  ];
  /* yüz şekline göre dengeleyen çerçeve şekilleri */
  var YUZ_UYUM = { oval: ["pilot", "kare", "koseli", "cat-eye", "clubmaster", "yuvarlak", "oval"], yuvarlak: ["koseli", "kare", "clubmaster", "cat-eye"], kare: ["yuvarlak", "oval", "pilot", "cat-eye"], kalp: ["pilot", "oval", "yuvarlak", "clubmaster"], uzun: ["kare", "pilot", "cat-eye", "koseli"] };
  var TARZ_UYUM = { klasik: ["pilot", "clubmaster", "kare", "oval"], iddiali: ["cat-eye", "koseli", "kare"], hafif: ["pilot", "oval", "yuvarlak"] };
  function asistanAc() {
    var m = $("#so-ast");
    if (!m) { m = el("<div class='so-pencere gizli' id='so-ast' role='dialog' aria-modal='true' aria-label='Gözlük asistanı'><div class='so-pencere-kutu'><button aria-label='Kapat' class='ikon-btn so-pencere-kapat' data-so-kapat='1' type='button'>" + IK.kapat + "</button><div id='so-ast-ic'></div></div></div>"); document.body.appendChild(m); m.addEventListener("click", function (e) { if (e.target === m || e.target.closest("[data-so-kapat]")) pencereKapat(m); }); }
    AST.adim = 0; AST.cevap = {}; asistanCiz(); pencereAc(m); olay("asistan_ac");
  }
  function pencereAc(m) { m.classList.remove("gizli"); document.documentElement.style.overflow = "hidden"; }
  function pencereKapat(m) { m.classList.add("gizli"); document.documentElement.style.overflow = ""; if (m.id === "so-deneme") denemeDur(); }
  document.addEventListener("keydown", function (e) { if (e.key !== "Escape") return; $$(".so-pencere:not(.gizli)").forEach(pencereKapat); });
  function asistanCiz() {
    var ic = $("#so-ast-ic"), q = SORU[AST.adim];
    if (q) {
      ic.innerHTML = "<p class='eyebrow'>Gözlük asistanı · " + (AST.adim + 1) + " / " + SORU.length + "</p><div class='so-ilerleme'><i style='width:" + Math.round(AST.adim / SORU.length * 100) + "%'></i></div><h2>" + q.s + "</h2>" + (q.not ? "<p class='so-ast-not'>" + q.not + "</p>" : "") +
        "<div class='so-secenekler'>" + q.o.map(function (o) { return "<button data-d='" + o[0] + "' type='button'>" + (q.k === "yuz" && o[0] ? yuzIkon(o[0]) : "") + "<span>" + o[1] + "</span></button>"; }).join("") + "</div>" +
        (AST.adim ? "<button class='so-geri' id='so-ast-geri' type='button'>← Önceki soru</button>" : "");
      $(".so-secenekler", ic).addEventListener("click", function (e) { var b = e.target.closest("button"); if (!b) return; AST.cevap[q.k] = b.getAttribute("data-d"); AST.adim++; asistanCiz(); });
      var g = $("#so-ast-geri"); if (g) g.addEventListener("click", function () { AST.adim--; asistanCiz(); });
      return;
    }
    ic.innerHTML = "<p class='eyebrow'>Gözlük asistanı</p><h2>Size uygun modeller</h2><p class='so-ast-not'>Öneriler hazırlanıyor…</p>";
    SO.feedGetir().then(function (hepsi) {
      var c = AST.cevap, ur = hepsi.filter(function (u) { return u.urun && u.stok !== "yok"; });
      ur.forEach(function (u) {
        var p = 0, neden = [];
        if (c.kim) { if (SO.katlari(u).indexOf(c.kim) > -1) { p += 4; } else p -= 6; }
        if (c.yuz && YUZ_UYUM[c.yuz] && u.sekil) { var i = YUZ_UYUM[c.yuz].indexOf(u.sekil); if (i > -1) { p += 3 - Math.min(i, 2) * .5; neden.push((SEKIL[u.sekil] || "") + " hat, " + ({ oval: "oval", yuvarlak: "yuvarlak", kare: "kare", kalp: "kalp", uzun: "uzun" }[c.yuz]) + " yüzü dengeler"); } else p -= 1; }
        if (c.tarz && TARZ_UYUM[c.tarz] && u.sekil) { if (TARZ_UYUM[c.tarz].indexOf(u.sekil) > -1) { p += 2; } if (c.tarz === "hafif" && /metal|titan/i.test(u.cerceve)) { p += 1.5; neden.push("hafif metal çerçeve"); } if (c.tarz === "iddiali" && /asetat|kemik/i.test(u.cerceve)) p += 1; }
        if (c.kullanim === "surus") { if (/evet|var|polar/i.test(u.polarize)) { p += 3; neden.push("polarize cam, yansımayı keser"); } else if (/mineral/i.test(u.cam)) { p += 1; neden.push("mineral cam, çizilmeye dayanıklı"); } }
        if (c.kullanim === "sehir" && /organik|degrade/i.test(u.cam)) { p += 1; neden.push("hafif cam, gün boyu rahat"); }
        if (c.butce) { if (u.fiyat <= +c.butce) p += 2; else if (u.fiyat <= +c.butce * 1.15) p -= 1; else p -= 50; }
        if (SO.indirimYuzde(u)) p += .3;
        u._ap = p; u._neden = neden;
      });
      ur.sort(function (a, b) { return b._ap - a._ap; });
      var sec = ur.filter(function (u) { return u._ap > -3; }).slice(0, 4);
      olay("asistan_sonuc", { adet: sec.length });
      if (!sec.length) { ic.innerHTML = "<p class='eyebrow'>Gözlük asistanı</p><h2>Bu ölçütlere uyan model bulamadık</h2><p class='so-ast-not'>Aradığınızı WhatsApp'tan yazın; mağazadaki diğer modellerden önerelim.</p><div class='so-ast-alt'><a class='btn btn-ana' href='" + SO.waLink("Merhaba, bana uygun bir güneş gözlüğü arıyorum.") + "' rel='noopener' target='_blank'>WhatsApp'tan yazın</a><button class='btn btn-cizgi' id='so-ast-bastan' type='button'>Baştan başla</button></div>"; }
      else ic.innerHTML = "<p class='eyebrow'>Gözlük asistanı</p><h2>Size uygun modeller</h2><div class='so-ast-sonuc'>" + sec.map(function (u) {
        return "<a class='so-ast-kart' href='" + esc(u.url) + "'><img alt='' loading='lazy' src='" + esc(SO.kucult(u.resimler[0], 400) || "") + "'/><span><small>" + esc(u.marka) + "</small><b>" + esc(u.model || u.baslik) + "</b>" + (u._neden.length ? "<i>" + esc(u._neden.slice(0, 2).join(" · ")) + "</i>" : "") + "<strong>" + tl(u.fiyat) + "</strong></span></a>";
      }).join("") + "</div><div class='so-ast-alt'><button class='btn btn-cizgi' id='so-ast-bastan' type='button'>Baştan başla</button><a class='btn btn-acik' href='" + SO.waLink("Merhaba, gözlük asistanındaki önerilerle ilgili optisyene danışmak istiyorum.") + "' rel='noopener' target='_blank'>Optisyene danış</a></div>";
      var bb = $("#so-ast-bastan"); if (bb) bb.addEventListener("click", function () { AST.adim = 0; AST.cevap = {}; asistanCiz(); });
    });
  }
  function yuzIkon(k) {
    var p = { oval: "M12 3c4 0 6 3.500 6 8.500S15.500 21 12 21s-6-4.500-6-9.500S8 3 12 3z", yuvarlak: "M12 4a8 8 0 1 1 0 16 8 8 0 0 1 0-16z", kare: "M6.500 4h11c.800 0 1.500.700 1.500 1.500V15c0 3-3 5-7 5s-7-2-7-5V5.500C5 4.700 5.700 4 6.500 4z", kalp: "M5 6c0-1.500 3-2.500 7-2.500s7 1 7 2.500c0 6-3.500 14.500-7 14.500S5 12 5 6z", uzun: "M12 2c3.300 0 5 3 5 10s-1.700 10-5 10-5-3-5-10 1.700-10 5-10z" }[k];
    return "<svg fill='none' stroke='currentColor' stroke-width='1.600' viewBox='0 0 24 24'><path d='" + p + "'/></svg>";
  }
  function asistanKur() {
    if ($("#so-ast-dugme") || $("#so-odeme")) return;
    var d = el("<button aria-label='Gözlük asistanı: bana uygun modeli bul' class='so-ast-dugme' id='so-ast-dugme' title='Gözlük asistanı' type='button'>" + IK.gozluk + "</button>");
    document.body.appendChild(d); d.addEventListener("click", asistanAc);
    /* ana sayfa bandı */
    var kat = $(".kategoriler");
    if (B.classList.contains("v-ana") && kat && !$("#so-ast-bant")) {
      var bant = el("<div class='so-ast-bant' id='so-ast-bant'><div><p class='eyebrow'>Gözlük asistanı</p><h3>Hangi model size uyar?</h3><p>Beş kısa soruya yanıt verin; yüz şeklinize, kullanımınıza ve bütçenize göre modelleri sıralayalım.</p></div><button class='btn btn-ana' type='button'>Asistanı başlat</button></div>");
      kat.parentNode.appendChild(bant); $("button", bant).addEventListener("click", asistanAc);
    }
    if (location.hash === "#asistan") asistanAc();
    document.addEventListener("click", function (e) { var a = e.target.closest && e.target.closest("[data-asistan]"); if (a) { e.preventDefault(); asistanAc(); } });
  }

  /* ================= SANAL DENEME ================= */
  var DN = { lm: null, mod: null, img: null, hazir: false, raf: 0, akis: null, olcek: 1, u: null, sonLm: null, foto: null, tamam: false };
  var MP = "0.10.14", UA = navigator.userAgent || "";
  var IOS = /iP(hone|ad|od)/.test(UA) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1), SAFARI = /Safari/.test(UA) && !/Chrome|CriOS|FxiOS|EdgiOS|Android/.test(UA);
  function sureli(p, ms, msg) { return new Promise(function (res, rej) { var t = setTimeout(function () { rej(new Error(msg)); }, ms); p.then(function (v) { clearTimeout(t); res(v); }, function (e) { clearTimeout(t); rej(e); }); }); }
  function denemeYukle() {
    if (DN.lm) return Promise.resolve(DN.lm); if (DN.yukleniyor) return DN.yukleniyor;
    var y = import("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@" + MP + "/vision_bundle.mjs").then(function (v) {
      return v.FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@" + MP + "/wasm").then(function (fs) {
        var sec = function (d) { return { baseOptions: { modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task", delegate: d }, runningMode: "VIDEO", numFaces: 1 }; };
        var ilk = (IOS || SAFARI) ? "CPU" : "GPU", iki = ilk === "GPU" ? "CPU" : "GPU";
        return v.FaceLandmarker.createFromOptions(fs, sec(ilk)).catch(function () { return v.FaceLandmarker.createFromOptions(fs, sec(iki)); });
      }).then(function (lm) { DN.lm = lm; return lm; });
    });
    DN.yukleniyor = sureli(y, 45000, "Yüz tanıma bu bağlantıda yüklenemedi; tekrar deneyin ya da \"Fotoğraf yükle\" kullanın.").catch(function (e) { DN.yukleniyor = null; throw e; });
    return DN.yukleniyor;
  }
  function denemeDurum(t) { var s = $("#so-dn-durum"); if (s) { s.textContent = t; s.style.display = t ? "" : "none"; } }
  function denemeAc(u, oto) {
    DN.u = u; DN.olcek = 1; DN.tamam = false;
    var m = $("#so-deneme");
    if (!m) {
      m = el("<div class='so-pencere so-deneme gizli' id='so-deneme' role='dialog' aria-modal='true' aria-label='Sanal deneme'><div class='so-pencere-kutu genis'><button aria-label='Kapat' class='ikon-btn so-pencere-kapat' data-so-kapat='1' type='button'>" + IK.kapat + "</button>" +
        "<div class='so-dn-sahne'><video autoplay id='so-dn-video' muted playsinline></video><canvas id='so-dn-tuval'></canvas><div class='so-dn-durum' id='so-dn-durum'>Hazırlanıyor…</div></div>" +
        "<div class='so-dn-panel'><p class='eyebrow'>Sanal deneme</p><h2 id='so-dn-baslik'></h2><p class='so-dn-kunye' id='so-dn-kunye'></p>" +
        "<label class='so-dn-ayar'>Boyut ince ayarı <input id='so-dn-olcek' max='120' min='80' type='range' value='100'/><span id='so-dn-olcek-d'>%100</span></label>" +
        "<div class='so-dn-btnler'><button class='btn btn-ana' id='so-dn-cek' type='button'>Fotoğraf çek</button><label class='btn btn-cizgi' for='so-dn-dosya'>Fotoğraf yükle</label><input accept='image/*' hidden id='so-dn-dosya' type='file'/><button class='btn btn-cizgi' id='so-dn-kamera' type='button'>Kamerayı aç</button></div>" +
        "<p class='so-dn-not'>Görüntü cihazınızda kalır, hiçbir yere gönderilmez. Çerçeve gerçek ölçeğinde çizilir; göz bebeği mesafesi (ortalama 63 mm) referans alınır.</p></div></div></div>");
      document.body.appendChild(m);
      m.addEventListener("click", function (e) { if (e.target === m || e.target.closest("[data-so-kapat]")) pencereKapat(m); });
      $("#so-dn-olcek").addEventListener("input", function () { DN.olcek = +this.value / 100; $("#so-dn-olcek-d").textContent = "%" + this.value; if (DN.mod === "foto") denemeFotoCiz(); });
      $("#so-dn-cek").addEventListener("click", denemeCek);
      $("#so-dn-dosya").addEventListener("change", function () { if (this.files && this.files[0]) denemeDosya(this.files[0]); });
      $("#so-dn-kamera").addEventListener("click", denemeKamera);
    }
    $("#so-dn-baslik").textContent = (u.marka + " " + (u.model || "")).trim();
    $("#so-dn-kunye").textContent = (u.olcu ? u.olcu.replace(/[-\/ ]+/g, " · ") + " mm · " : "") + (u.cerceveRenk || u.renk || "");
    DN.hazir = false; var im = new Image(); im.crossOrigin = "anonymous"; im.onload = function () { DN.img = im; DN.hazir = true; if (DN.mod === "foto") denemeFotoCiz(); }; var dp = String(u.deneme).split("|"); DN.gen = +dp[1] || 0; im.src = KOK + "img/tryon/" + dp[0].trim();
    pencereAc(m); olay("sanal_deneme_ac", { model: u.model });
    if (oto && (IOS || SAFARI)) denemeDurum("Başlamak için \"Kamerayı aç\" düğmesine dokunun"); else denemeKamera();
  }
  function denemeDur() { if (DN.raf) cancelAnimationFrame(DN.raf); DN.raf = 0; if (DN.akis) { DN.akis.getTracks().forEach(function (t) { t.stop(); }); DN.akis = null; } DN.mod = null; }
  function denemeKamera() {
    denemeDur(); DN.mod = "video"; var video = $("#so-dn-video"), tuval = $("#so-dn-tuval"); video.style.display = ""; denemeDurum("Kamera izni bekleniyor…");
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { denemeDurum("Bu tarayıcı kamerayı desteklemiyor. \"Fotoğraf yükle\" ile deneyebilirsiniz."); return; }
    var kam = navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 960 } }, audio: false })
      .catch(function (e) { if (/OverconstrainedError|NotReadable/.test(String(e && e.name))) return navigator.mediaDevices.getUserMedia({ video: true, audio: false }); throw e; });
    kam.then(function () { if (DN.mod === "video") denemeDurum("Yüz tanıma yükleniyor…"); }, function () {});
    Promise.all([kam, denemeYukle()]).then(function (r) {
      var akis = r[0], lm = r[1];
      if (DN.mod !== "video") { akis.getTracks().forEach(function (t) { t.stop(); }); throw new Error("iptal"); }
      lm.setOptions({ runningMode: "VIDEO" }); denemeDurum("Kamera açılıyor…");
      DN.akis = akis; video.srcObject = akis; video.setAttribute("playsinline", ""); video.muted = true;
      return new Promise(function (res, rej) {
        var bitti = false, son = function () { if (!bitti && video.videoWidth > 0) { bitti = true; res(); } };
        video.onloadedmetadata = function () { var p = video.play(); if (p && p.catch) p.catch(function () {}); son(); };
        video.onloadeddata = son; video.onplaying = son; video.onresize = son;
        setTimeout(function () { if (!bitti) { if (video.videoWidth > 0) son(); else rej(new Error("Kamera görüntüsü alınamadı. \"Fotoğraf yükle\" ile deneyebilirsiniz.")); } }, 12000);
      });
    }).then(function () {
      tuval.width = video.videoWidth; tuval.height = video.videoHeight; denemeDurum("Yüzünüzü kameraya çevirin");
      var fw = Math.min(640, video.videoWidth), fh = Math.round(video.videoHeight * fw / video.videoWidth);
      var kare = document.createElement("canvas"); kare.width = fw; kare.height = fh; var kc = kare.getContext("2d", { willReadFrequently: true });
      var son = -1, sonZ = 0;
      (function dongu() {
        if (DN.mod !== "video") return;
        var simdi = performance.now(); if (simdi <= sonZ) simdi = sonZ + 1;
        if (video.currentTime !== son && video.readyState >= 2) {
          son = video.currentTime; sonZ = simdi; var lms = null;
          try { kc.drawImage(video, 0, 0, fw, fh); var r = DN.lm.detectForVideo(kare, simdi); lms = (r.faceLandmarks && r.faceLandmarks[0]) || null; } catch (e) {}
          DN.sonLm = lms; denemeCiz(tuval, video, lms, true);
        }
        DN.raf = requestAnimationFrame(dongu);
      })();
    }).catch(function (e) {
      var n = String(e && e.name || ""); if (String(e && e.message) === "iptal") return;
      denemeDurum(/NotAllowed|Permission|Security/.test(n) ? "Kamera izni verilmedi. Tarayıcı ayarlarından izin verin ya da \"Fotoğraf yükle\" kullanın." : /NotFound|NotReadable|Overconstrained|Abort/.test(n) ? "Kamera açılamadı. \"Fotoğraf yükle\" ile deneyebilirsiniz." : "Yüklenemedi: " + (e && e.message ? e.message : e));
    });
  }
  function denemeDosya(dosya) {
    denemeDur(); DN.mod = "foto"; var video = $("#so-dn-video"), tuval = $("#so-dn-tuval"); video.style.display = "none"; denemeDurum("Fotoğraf işleniyor…");
    var im = new Image(); im.onload = function () {
      var W = Math.min(1280, im.width), H = Math.round(im.height * W / im.width); tuval.width = W; tuval.height = H; DN.foto = im;
      denemeYukle().then(function (lm) { lm.setOptions({ runningMode: "IMAGE" }); var g = document.createElement("canvas"); g.width = W; g.height = H; g.getContext("2d").drawImage(im, 0, 0, W, H); var r = lm.detect(g); DN.sonLm = (r.faceLandmarks && r.faceLandmarks[0]) || null; denemeDurum(DN.sonLm ? "" : "Fotoğrafta yüz bulunamadı; yüzün karşıdan göründüğü bir fotoğraf deneyin."); denemeFotoCiz(); })
        .catch(function (e) { denemeDurum(e && e.message ? e.message : "Yüklenemedi."); });
    }; im.src = URL.createObjectURL(dosya);
  }
  function denemeFotoCiz() { var t = $("#so-dn-tuval"); if (t && DN.foto) denemeCiz(t, DN.foto, DN.sonLm, false); }
  function denemeCiz(tuval, kaynak, lms, ayna) {
    var c = tuval.getContext("2d"), W = tuval.width, H = tuval.height;
    c.save(); c.clearRect(0, 0, W, H);
    if (ayna) { c.translate(W, 0); c.scale(-1, 1); }
    c.drawImage(kaynak, 0, 0, W, H);
    if (lms && DN.hazir && DN.u) {
      var L = lms[468] || lms[133], R = lms[473] || lms[362];
      var lx = L.x * W, ly = L.y * H, rx = R.x * W, ry = R.y * H, ipd = Math.hypot(rx - lx, ry - ly), pmm = ipd / 63;
      var o = (DN.u.olcu || "").split(/[-\/ ]+/), cam = +o[0] || 52, kopru = +o[1] || 18, gen = DN.gen || (2 * cam + kopru + 10);
      var dw = gen * pmm * DN.olcek, dh = dw * DN.img.height / DN.img.width;
      var cx = (lx + rx) / 2, cy = (ly + ry) / 2, aci = Math.atan2(ry - ly, rx - lx);
      var cl = lms[234], cr = lms[454], don = cl && cr ? Math.abs((cl.x + cr.x) / 2 - lms[1].x) * 3 : 0;
      c.translate(cx, cy); c.rotate(aci); c.scale(Math.max(.75, 1 - don), 1);
      c.drawImage(DN.img, -dw / 2, -dh * .5, dw, dh);
      if (ayna && !DN.tamam) { DN.tamam = true; denemeDurum(""); }
    } else if (ayna && DN.tamam) { DN.tamam = false; denemeDurum("Yüz aranıyor…"); }
    c.restore();
  }
  function denemeCek() {
    var t = $("#so-dn-tuval"); if (!t) return; olay("sanal_deneme_foto", { model: DN.u && DN.u.model });
    t.toBlob(function (blob) {
      var ad = "seckin-optik-" + norm((DN.u.marka || "") + "-" + (DN.u.model || "")) + "-deneme.png", dosya = new File([blob], ad, { type: "image/png" });
      if (navigator.canShare && navigator.canShare({ files: [dosya] })) { navigator.share({ files: [dosya], title: DN.u.baslik }).catch(function () {}); return; }
      var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = ad; document.body.appendChild(a); a.click(); a.remove();
    }, "image/png");
  }

  /* ================= ÜRÜN SAYFASI EKLERİ ================= */
  var _urunKuruldu = false;
  function urunHazir() {
    var u = window.SO_URUN; if (!u || _urunKuruldu) return; _urunKuruldu = true;
    var btnler = $(".urun-btnler"), galeri = $("#g-ana");
    /* favori */
    if (btnler) { var k = el("<button class='so-kalp urun' type='button'>" + IK.kalp + "<span>Favorilere ekle</span></button>"); k.setAttribute("data-url", u.url); btnler.appendChild(k); favGuncelle(); }
    /* sanal deneme */
    if (u.deneme && galeri) {
      var d = el("<button class='btn btn-koyu so-dn-ac' type='button'>" + IK.kamera + "<span>Sanal deneme</span></button>");
      galeri.parentNode.appendChild(d); d.addEventListener("click", function () { denemeAc(u); });
      if (/[?&#]deneme/.test(location.search + location.hash)) denemeAc(u, true);
    }
    /* ölçü rehberi bağlantısı */
    var os = $(".olcu-sema"); if (os) os.insertAdjacentHTML("afterend", "<p class='so-olcu-link'><a href='/p/olcu-rehberi.html'>Bu ölçüler ne anlama geliyor?</a></p>");
    /* cam gösterimi */
    var bilgi = $(".urun-bilgi"); if (bilgi) bilgi.insertAdjacentHTML("beforeend", camGosterim(u));
    var kay = $("#so-cam-kaydir"); if (kay) { var sahne = $("#so-cam-sahne"); var ayarla = function () { sahne.style.setProperty("--b", kay.value + "%"); }; kay.addEventListener("input", ayarla); ayarla(); }
    kartlariSusle();
  }
  function camGosterim(u) {
    var polar = /evet|var|polar/i.test(u.polarize) || /polarize/i.test(u.baslik);
    var h = "<section class='so-cam'><h3>Bu cam ne sağlar?</h3><ul class='so-cam-liste'>";
    if (/uv\s*400/i.test(u.filtre)) h += "<li><b>UV400</b><span>400 nanometreye kadar olan ultraviyole ışınların tamamını keser. Camın koyuluğu değil, bu filtre gözü korur.</span></li>";
    if (polar) h += "<li><b>Polarize</b><span>Deniz, ıslak yol ve araç camı gibi yüzeylerden yansıyan parlamayı süzer; renkler ve kontrast netleşir.</span></li>";
    if (/mineral/i.test(u.cam)) h += "<li><b>Mineral cam</b><span>Çizilmeye karşı dayanıklıdır ve optik netliği yüksektir; organik cama göre biraz daha ağırdır.</span></li>";
    if (/organik/i.test(u.cam)) h += "<li><b>Organik cam</b><span>Hafiftir, uzun süre kullanımda burunda baskı yapmaz; darbeye karşı dayanıklıdır.</span></li>";
    if (/degrade/i.test(u.cam)) h += "<li><b>Degrade</b><span>Üstten alta açılan ton; yukarıdan gelen ışığı keserken aşağıya, gösterge paneline rahat bakılır.</span></li>";
    h += "</ul>";
    if (polar) h += "<div class='so-cam-sahne' id='so-cam-sahne' style='--b:50%'>" + sahneSVG(true) + "<div class='so-cam-ust'>" + sahneSVG(false) + "</div><span class='so-cam-et sol'>Polarize değil</span><span class='so-cam-et sag'>Polarize</span><i class='so-cam-cizgi'></i><input aria-label='Karşılaştırma kaydırıcısı' id='so-cam-kaydir' max='100' min='0' type='range' value='50'/></div><p class='so-cam-not'>Temsili gösterimdir; kaydırarak yansımanın nasıl azaldığını görün.</p>";
    return h + "</section>";
  }
  function sahneSVG(polar) {
    var p = polar;
    return "<svg aria-hidden='true' preserveAspectRatio='xMidYMid slice' viewBox='0 0 600 300'><defs><linearGradient id='g" + (p ? "p" : "n") + "s' x1='0' x2='0' y1='0' y2='1'><stop offset='0' stop-color='" + (p ? "#3F7FC4" : "#A9CBEA") + "'/><stop offset='1' stop-color='" + (p ? "#9CC6EC" : "#E3EEF8") + "'/></linearGradient><linearGradient id='g" + (p ? "p" : "n") + "d' x1='0' x2='0' y1='0' y2='1'><stop offset='0' stop-color='" + (p ? "#0E5C9E" : "#7FAED2") + "'/><stop offset='1' stop-color='" + (p ? "#06315C" : "#4F86B4") + "'/></linearGradient></defs>" +
      "<rect fill='url(#g" + (p ? "p" : "n") + "s)' height='150' width='600'/><circle cx='430' cy='62' fill='" + (p ? "#FFE9A8" : "#FFFFFF") + "' r='" + (p ? 24 : 34) + "'/>" + (p ? "" : "<circle cx='430' cy='62' fill='#fff' opacity='.5' r='70'/>") +
      "<path d='M0 128l90-34 70 22 80-40 90 38 110-30 160 44v22H0z' fill='" + (p ? "#2F5F4A" : "#8FA79B") + "'/>" +
      "<rect fill='url(#g" + (p ? "p" : "n") + "d)' height='150' width='600' y='150'/>" +
      (p ? "<path d='M40 190h80M210 215h110M90 250h140M380 200h60M420 262h120M300 235h50' stroke='#5FA3DA' stroke-linecap='round' stroke-width='3' opacity='.6'/>" :
        "<path d='M330 152h200l60 148H250z' fill='#fff' opacity='.55'/><path d='M360 165h140M330 190h190M300 220h240M280 255h280M400 180h60M350 240h120' stroke='#fff' stroke-linecap='round' stroke-width='7' opacity='.9'/><rect fill='#fff' height='150' opacity='.18' width='600' y='150'/>") +
      "<path d='M120 196l60 0-12 16H132z' fill='" + (p ? "#fff" : "#E9EEF3") + "'/><path d='M150 196v-44l26 36z' fill='" + (p ? "#E94F37" : "#D9A59C") + "'/></svg>";
  }

  /* ================= ANA SAYFA BANTLARI ================= */
  function bantlarKur() {
    if (!B.classList.contains("v-ana")) return;
    var magaza = $("#magaza"); if (!magaza) return;
    /* Google puanı */
    if (MAGAZA.google && MAGAZA.google.puan && !$("#so-google")) {
      var g = MAGAZA.google, yor = "https://search.google.com/local/reviews?placeid=" + g.yer, yazl = "https://search.google.com/local/writereview?placeid=" + g.yer, dolu = Math.floor(g.puan + .25);
      var s = el("<section class='bolum so-bant-bolum' id='so-google'><div class='kap'><div class='so-google'><div class='so-google-puan'><b>" + String(g.puan).replace(".", ",") + "</b><span class='so-yildizlar' aria-label='5 üzerinden " + g.puan + "'>" + [1, 2, 3, 4, 5].map(function (i) { return i <= dolu ? "<i class='dolu'>" + IK.yildiz + "</i>" : (i - g.puan <= .75 ? "<i>" + IK.yildiz.replace("fill='currentColor'", "fill='url(#so-yari)'").replace("<path", "<defs><linearGradient id='so-yari'><stop offset='50%' stop-color='#F5A623'/><stop offset='50%' stop-color='#D5DBE6'/></linearGradient></defs><path") + "</i>" : "<i>" + IK.yildiz + "</i>"); }).join("") + "</span><small>Google'da " + g.adet + " değerlendirme</small></div>" +
        "<div class='so-google-metin'><p class='eyebrow'>Müşterilerimiz ne diyor?</p><h3>Çanakkale'de mağazamızı ziyaret edenlerin değerlendirmeleri Google'da.</h3><div class='hero-btn'><a class='btn btn-ana' href='" + yor + "' rel='noopener' target='_blank'>Yorumları oku</a><a class='btn btn-cizgi' href='" + yazl + "' rel='noopener' target='_blank'>Siz de değerlendirin</a></div></div></div></div></section>");
      magaza.parentNode.insertBefore(s, magaza);
    }
    /* Instagram */
    if (MAGAZA.instagram && !$("#so-insta")) {
      var profil = "https://www.instagram.com/" + MAGAZA.instagram + "/";
      var ib = el("<section class='bolum so-bant-bolum' id='so-insta'><div class='kap'><div class='bolum-bas'><div><p class='eyebrow'>Instagram</p><h2>@" + MAGAZA.instagram + "</h2></div><a class='btn btn-cizgi' href='" + profil + "' rel='noopener' target='_blank'>Takip et</a></div><div class='so-insta' id='so-insta-izgara'></div></div></section>");
      magaza.parentNode.insertBefore(ib, magaza);
      fetch(KOK + "instagram.json").then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function (j) {
        var gs = (j.gonderiler || []).slice(0, 6); if (!gs.length) throw 0;
        $("#so-insta-izgara").innerHTML = gs.map(function (x) { return "<a href='" + esc(x.url || profil) + "' rel='noopener' target='_blank'><img alt='" + esc(x.alt || "Seçkin Optik Instagram gönderisi") + "' loading='lazy' src='" + esc(/^https?:/.test(x.gorsel) ? x.gorsel : KOK + x.gorsel) + "'/></a>"; }).join("");
      }).catch(function () {
        var iz = $("#so-insta-izgara"); if (iz) { iz.className = "so-insta-bos"; iz.innerHTML = "<p>Yeni gelen modeller, mağazadan kareler ve kampanyalar Instagram hesabımızda.</p>"; }
      });
    }
  }

  /* ================= FORMLAR: randevu, iletişim ================= */
  function alanHTML(ad, etiket, tip, ek) {
    ek = ek || {}; var ic;
    if (tip === "select") ic = "<select id='sf-" + ad + "' name='" + ad + "'" + (ek.gerekli === false ? "" : " required") + "><option value=''>Seçin</option>" + ek.secenek.map(function (o) { return "<option>" + esc(o) + "</option>"; }).join("") + "</select>";
    else if (tip === "textarea") ic = "<textarea id='sf-" + ad + "' name='" + ad + "' rows='3'" + (ek.gerekli === false ? "" : " required") + (ek.ph ? " placeholder='" + esc(ek.ph) + "'" : "") + "></textarea>";
    else ic = "<input id='sf-" + ad + "' name='" + ad + "' type='" + tip + "'" + (ek.gerekli === false ? "" : " required") + (ek.ph ? " placeholder='" + esc(ek.ph) + "'" : "") + (ek.min ? " min='" + ek.min + "'" : "") + (ek.ac ? " autocomplete='" + ek.ac + "'" : "") + "/>";
    return "<label class='od-alan" + (ek.genis ? " genis" : "") + "' for='sf-" + ad + "'><span>" + etiket + (ek.gerekli === false ? " <i>(isteğe bağlı)</i>" : "") + "</span>" + ic + "<em class='od-hata'></em></label>";
  }
  function formDogrula(f) {
    var ok = true, ilk = null;
    $$(".od-alan", f).forEach(function (l) { l.classList.remove("hatali"); var i = $("input,select,textarea", l); if (i.required && !i.value.trim()) { l.classList.add("hatali"); $(".od-hata", l).textContent = "Bu alanı doldurun"; ok = false; ilk = ilk || i; } });
    var t = $("#sf-telefon", f); if (t && t.value.trim()) { var n = t.value.replace(/\D/g, "").replace(/^90/, "").replace(/^0/, ""); if (!/^5\d{9}$/.test(n)) { var l = t.closest(".od-alan"); l.classList.add("hatali"); $(".od-hata", l).textContent = "Geçerli bir cep telefonu yazın (05xx…)"; ok = false; ilk = ilk || t; } }
    if (ilk) ilk.focus(); return ok;
  }
  function randevuKur() {
    var k = $("#so-randevu"); if (!k || k.getAttribute("data-kuruldu")) return; k.setAttribute("data-kuruldu", "1");
    var bugun = new Date(), p = function (n) { return ("0" + n).slice(-2); }, min = bugun.getFullYear() + "-" + p(bugun.getMonth() + 1) + "-" + p(bugun.getDate());
    var saatler = []; for (var s = 9; s <= 19; s++) { saatler.push(p(s) + ":00"); if (s < 19) saatler.push(p(s) + ":30"); }
    k.innerHTML = "<form class='od-form so-form' id='so-randevu-form' novalidate><section class='od-kutu'><div class='od-alanlar'>" +
      alanHTML("hizmet", "Ne için gelmek istiyorsunuz?", "select", { genis: true, secenek: ["Güneş gözlüğü seçimi ve danışmanlık", "Çerçeve ayarı ve bakım", "Cam danışmanlığı ve ölçüm", "Satın aldığım ürünle ilgili destek", "Diğer"] }) +
      alanHTML("tarih", "Tarih", "date", { min: min }) + alanHTML("saat", "Saat", "select", { secenek: saatler }) +
      alanHTML("ad", "Ad soyad", "text", { ac: "name" }) + alanHTML("telefon", "Cep telefonu", "tel", { ac: "tel", ph: "05xx xxx xx xx" }) +
      alanHTML("not", "Notunuz", "textarea", { genis: true, gerekli: false, ph: "Varsa model, reçete ya da özel isteğiniz" }) +
      "</div><p class='od-hata-genel gizli' id='so-randevu-hata'></p><button class='btn btn-ana btn-tam' type='submit'>Randevu talebini WhatsApp ile gönder</button><p class='od-kucuk merkez'>Mağazamız " + MAGAZA.saat + ". Talebiniz WhatsApp'a hazır mesaj olarak aktarılır; uygunluk durumunu aynı gün yanıtlarız.</p></section></form>";
    var f = $("#so-randevu-form");
    f.addEventListener("submit", function (e) {
      e.preventDefault(); if (!formDogrula(f)) return;
      var d = {}; ["hizmet", "tarih", "saat", "ad", "telefon", "not"].forEach(function (a) { d[a] = $("#sf-" + a, f).value.trim(); });
      var t = new Date(d.tarih + "T12:00:00"), h = $("#so-randevu-hata");
      if (t.getDay() === 0) { h.textContent = "Pazar günleri kapalıyız; lütfen başka bir gün seçin."; h.classList.remove("gizli"); return; }
      h.classList.add("gizli");
      var gun = t.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric", weekday: "long" });
      var m = ["Merhaba, mağazanızdan randevu almak istiyorum.", "", "Konu: " + d.hizmet, "Tarih: " + gun, "Saat: " + d.saat, "Ad soyad: " + d.ad, "Telefon: " + d.telefon]; if (d.not) m.push("Not: " + d.not);
      olay("randevu_talep", { hizmet: d.hizmet }); window.open(SO.waLink(m.join("\n")), "_blank", "noopener");
      k.innerHTML = "<div class='od-kutu sonuc-kutu'><h2>Randevu talebiniz hazırlandı</h2><p>WhatsApp'ta açılan mesajı gönderdiğinizde talebiniz bize ulaşır. " + esc(gun) + ", " + esc(d.saat) + " için uygunluk durumunu aynı gün yanıtlarız.</p><a class='btn btn-cizgi' href='/'>Ana sayfaya dön</a></div>";
    });
  }
  function iletisimKur() {
    var k = $("#so-iletisim-form");
    if (!k && /\/p\/iletisim/.test(location.pathname)) { var gv = $(".yazi-govde"), h2 = gv && gv.querySelector("h2"); if (gv) { k = el("<div id='so-iletisim-form'></div>"); var bs = el("<h2>Bize yazın</h2>"); if (h2) { gv.insertBefore(bs, h2); gv.insertBefore(k, h2); } else { gv.appendChild(bs); gv.appendChild(k); } } }
    if (!k || k.getAttribute("data-kuruldu")) return; k.setAttribute("data-kuruldu", "1");
    k.innerHTML = "<form class='od-form so-form' id='so-ilt-form' novalidate><section class='od-kutu'><div class='od-alanlar'>" +
      alanHTML("ad", "Ad soyad", "text", { ac: "name" }) + alanHTML("telefon", "Cep telefonu", "tel", { ac: "tel", ph: "05xx xxx xx xx", gerekli: false }) +
      alanHTML("konu", "Konu", "select", { genis: true, secenek: ["Ürün ve stok bilgisi", "Sipariş ve kargo", "İade ve değişim", "Mağaza ve randevu", "Diğer"] }) +
      alanHTML("mesaj", "Mesajınız", "textarea", { genis: true }) +
      "</div><div class='so-form-btnler'><button class='btn btn-ana' data-kanal='wa' type='submit'>WhatsApp ile gönder</button><button class='btn btn-cizgi' data-kanal='eposta' type='submit'>E-posta ile gönder</button></div></section></form>";
    var f = $("#so-ilt-form"), kanal = "wa";
    $$("button[data-kanal]", f).forEach(function (b) { b.addEventListener("click", function () { kanal = b.getAttribute("data-kanal"); }); });
    f.addEventListener("submit", function (e) {
      e.preventDefault(); if (!formDogrula(f)) return;
      var d = {}; ["ad", "telefon", "konu", "mesaj"].forEach(function (a) { d[a] = $("#sf-" + a, f).value.trim(); });
      var m = ["Konu: " + d.konu, "Ad soyad: " + d.ad]; if (d.telefon) m.push("Telefon: " + d.telefon); m.push("", d.mesaj);
      olay("iletisim_form", { kanal: kanal, konu: d.konu });
      if (kanal === "wa") window.open(SO.waLink("Merhaba Seçkin Optik,\n" + m.join("\n")), "_blank", "noopener");
      else location.href = "mailto:info@seckinoptik.com.tr?subject=" + encodeURIComponent("Web sitesi: " + d.konu) + "&body=" + encodeURIComponent(m.join("\n"));
    });
  }

  /* ================= VİTRİN QR ETİKETLERİ ================= */
  function betikYukle(src) { return new Promise(function (res, rej) { var s = document.createElement("script"); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s); }); }
  function qrKur() {
    var k = $("#so-vitrin-qr"); if (!k || k.getAttribute("data-kuruldu")) return; k.setAttribute("data-kuruldu", "1");
    var yazi = k.closest(".yazi"); if (yazi) yazi.classList.add("genis");
    k.innerHTML = "<p class='sonuc-bilgi'>Ürünler yükleniyor…</p>";
    Promise.all([SO.feedGetir(), betikYukle("https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.js")]).then(function (r) {
      var ur = r[0].filter(function (u) { return u.urun; }), secili = {}; ur.forEach(function (u, i) { secili[i] = u.stok !== "yok"; });
      function qr(url) { var q = window.qrcode(0, "M"); q.addData(url); q.make(); return q.createSvgTag({ cellSize: 4, margin: 0, scalable: true }); }
      function ciz() {
        var fiyatli = $("#qr-fiyat").checked;
        $("#qr-sayfa").innerHTML = ur.map(function (u, i) { if (!secili[i]) return ""; return "<div class='qr-etiket'><div class='qr-kod'>" + qr(u.url.split("?")[0] + "?k=vitrin") + "</div><div class='qr-metin'><small>" + esc(u.marka) + "</small><b>" + esc(u.model || u.baslik) + "</b>" + (fiyatli ? "<strong>" + tl(u.fiyat) + "</strong>" : "") + "<span>Okutun, sitede inceleyin</span></div></div>"; }).join("");
        $("#qr-say").textContent = ur.filter(function (u, i) { return secili[i]; }).length + " etiket";
      }
      k.innerHTML = "<div class='qr-arac'><div class='qr-sec'><div class='qr-ust'><b>Etiket basılacak ürünler</b><label class='onay-kutu'><input checked id='qr-fiyat' type='checkbox'/><span>Fiyatı etikete yaz</span></label></div><ul id='qr-liste'>" +
        ur.map(function (u, i) { return "<li><label class='onay-kutu'><input data-i='" + i + "' type='checkbox'" + (secili[i] ? " checked" : "") + "/><span>" + esc((u.marka + " " + (u.model || u.baslik)).trim()) + (u.stok === "yok" ? " <i>(tükendi)</i>" : "") + "</span></label></li>"; }).join("") +
        "</ul><div class='qr-alt'><span id='qr-say'></span><button class='btn btn-ana' id='qr-yazdir' type='button'>Yazdır</button></div></div><div class='qr-sayfa' id='qr-sayfa'></div></div>";
      $("#qr-liste").addEventListener("change", function (e) { var i = e.target.getAttribute("data-i"); if (i != null) { secili[i] = e.target.checked; ciz(); } });
      $("#qr-fiyat").addEventListener("change", ciz);
      $("#qr-yazdir").addEventListener("click", function () { B.classList.add("qr-yazdir"); window.print(); setTimeout(function () { B.classList.remove("qr-yazdir"); }, 500); });
      ciz();
    }).catch(function () { k.innerHTML = "<p class='sonuc-bilgi'>Etiketler hazırlanamadı. Sayfayı yenileyin.</p>"; });
  }

  /* ================= ÇEREZ TERCİHİ + GA4 (AYAR.ga4 doluysa etkin) ================= */
  function ga4Yukle() {
    if (!A.ga4 || window.__soGa) return; window.__soGa = 1;
    window.dataLayer = window.dataLayer || []; window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date()); window.gtag("config", A.ga4, { anonymize_ip: true });
    var s = document.createElement("script"); s.async = true; s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(A.ga4); document.head.appendChild(s);
  }
  function cerezKur() {
    if (!A.ga4) return; /* ölçüm kodu yokken sorulacak bir tercih de yok */
    var t = oku("so_cerez", "");
    if (t === "kabul") { ga4Yukle(); return; } if (t === "red") return;
    var c = el("<div class='so-cerez' id='so-cerez' role='dialog' aria-label='Çerez tercihi'><p>Siteyi geliştirmek için ölçüm çerezleri kullanıyoruz. <a href='/p/kvkk.html'>Ayrıntılar</a></p><div><button class='btn btn-ana btn-sm' data-c='kabul' type='button'>Kabul et</button><button class='btn btn-cizgi btn-sm' data-c='red' type='button'>Reddet</button></div></div>");
    document.body.appendChild(c); B.classList.add("cerez-acik");
    c.addEventListener("click", function (e) { var b = e.target.closest("[data-c]"); if (!b) return; var v = b.getAttribute("data-c"); yaz("so_cerez", v); c.remove(); B.classList.remove("cerez-acik"); if (v === "kabul") ga4Yukle(); });
  }

  /* ================= DİL ANAHTARI (TR | EN) ================= */
  function dilKur() {
    if ($("#so-dil")) return;
    var dil = oku("so_dil", "tr"), arac = $(".ust-arac");
    var h = "<span class='so-dil' id='so-dil' role='group' aria-label='Dil'><button data-dil='tr' type='button'>TR</button><i>|</i><button data-dil='en' type='button'>EN</button></span>";
    if (arac) arac.insertBefore(el(h), arac.firstChild);
    var ac = $(".alt-cizgi"); if (ac) ac.appendChild(el(h.replace("id='so-dil'", "")));
    function isaret() { $$(".so-dil button").forEach(function (b) { b.classList.toggle("aktif", b.getAttribute("data-dil") === dil); }); }
    isaret();
    document.addEventListener("click", function (e) {
      var b = e.target.closest && e.target.closest(".so-dil button"); if (!b) return;
      var yeni = b.getAttribute("data-dil"); if (yeni === dil) return; yaz("so_dil", yeni); olay("dil_degis", { dil: yeni }); location.reload();
    });
    if (dil === "en") betikYukle(KOK + "tema/dil.js").catch(function () {});
  }

  /* ================= BAŞLAT ================= */
  function sayfaHazir() { randevuKur(); iletisimKur(); qrKur(); urunHazir(); }
  favKur(); dilKur(); asistanKur(); bantlarKur(); cerezKur(); listeHazir(); sayfaHazir();
  document.addEventListener("so:liste", listeHazir);
  document.addEventListener("so:urun", urunHazir);
  document.addEventListener("so:sayfa", sayfaHazir);
  if (QS.get("k") === "vitrin") olay("vitrin_qr_okutma", { sayfa: location.pathname });
  SO.asistan = asistanAc; SO.deneme = denemeAc; SO.fav = { liste: function () { return FAV.slice(); }, degis: favDegis };
})();
