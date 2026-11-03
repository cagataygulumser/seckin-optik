/**
 * Seçkin Optik — sipariş tablosu (Google Apps Script)
 * Ödeme sunucusu her siparişi buraya gönderir; bu betik Google E-Tablo'ya satır yazar
 * ve ödeme onaylanınca mağazaya e-posta atar.
 *
 * Kurulum: sunucu/KURULUM.md → "3. Sipariş tablosu"
 */
const GIZLI = "BURAYA-UZUN-RASTGELE-BIR-METIN-YAZIN";      // Worker'daki SHEET_SECRET ile aynı olmalı
const BILDIRIM_EPOSTA = "info@seckinoptik.com.tr";          // Yeni ödemeler bu adrese bildirilir
const SAYFA_ADI = "Siparişler";
const BASLIKLAR = ["Sipariş no", "Tarih", "Durum", "Tutar (TL)", "Ödenen (TL)", "Ödeme tipi", "Taksit", "Ad soyad", "Telefon", "E-posta", "İl", "İlçe", "Adres", "Fatura", "Firma / VD / VKN", "Ürünler", "Not", "İleti izni", "Test", "Hata"];

function doPost(e) {
  let d;
  try { d = JSON.parse(e.postData.contents); } catch (h) { return cevap("gecersiz"); }
  if (d.gizli !== GIZLI) return cevap("yetkisiz");
  if (d.tur === "iade") return iadeKaydet(d);

  const kilit = LockService.getScriptLock();
  kilit.waitLock(20000);
  try {
    const sayfa = sayfaGetir();
    const satir = satirBul(sayfa, d.siparisNo);
    const m = d.musteri || {};
    const durumYazi = { "odeme-bekliyor": "Ödeme bekleniyor", "odendi": "ÖDENDİ", "basarisiz": "Başarısız" }[d.durum] || d.durum;

    if (satir) {
      sayfa.getRange(satir, 3).setValue(durumYazi);
      if (d.odenen != null) sayfa.getRange(satir, 5).setValue(d.odenen);
      if (d.odemeTipi) sayfa.getRange(satir, 6).setValue(d.odemeTipi);
      if (d.taksit) sayfa.getRange(satir, 7).setValue(d.taksit);
      if (d.hataMesaji) sayfa.getRange(satir, 20).setValue(d.hataKodu + " " + d.hataMesaji);
      renklendir(sayfa, satir, d.durum);
    } else {
      sayfa.appendRow([
        d.siparisNo, new Date(d.tarih || Date.now()), durumYazi, d.toplam || "", d.odenen || "", d.odemeTipi || "", d.taksit || "",
        m.ad || "", m.telefon || "", m.eposta || "", m.il || "", m.ilce || "", m.adres || "",
        m.faturaTuru === "kurumsal" ? "Kurumsal" : "Bireysel",
        m.faturaTuru === "kurumsal" ? [m.firma, m.vergiDairesi, m.vergiNo].join(" / ") : "",
        (d.sepet || []).map(s => s.ad + " × " + s.adet + " (" + s.fiyat + " TL)").join("\n"),
        m.not || "", m.ileti ? "Evet" : "Hayır", d.test ? "TEST" : "", "",
      ]);
      renklendir(sayfa, sayfa.getLastRow(), d.durum);
    }

    if (d.durum === "odendi") epostaGonder(sayfa, d.siparisNo);
  } finally {
    kilit.releaseLock();
  }
  return cevap("ok");
}

function sayfaGetir() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let s = ss.getSheetByName(SAYFA_ADI);
  if (!s) {
    s = ss.insertSheet(SAYFA_ADI);
    s.appendRow(BASLIKLAR);
    s.getRange(1, 1, 1, BASLIKLAR.length).setFontWeight("bold").setBackground("#02122C").setFontColor("#FFFFFF");
    s.setFrozenRows(1);
  }
  return s;
}
function satirBul(s, no) {
  const son = s.getLastRow(); if (son < 2) return 0;
  const nolar = s.getRange(2, 1, son - 1, 1).getValues();
  for (let i = 0; i < nolar.length; i++) if (nolar[i][0] === no) return i + 2;
  return 0;
}
function renklendir(s, satir, durum) {
  const renk = durum === "odendi" ? "#DCFAE6" : durum === "basarisiz" ? "#FEE4E2" : "#FFFFFF";
  s.getRange(satir, 1, 1, BASLIKLAR.length).setBackground(renk);
}
function epostaGonder(s, no) {
  const satir = satirBul(s, no); if (!satir) return;
  const v = s.getRange(satir, 1, 1, BASLIKLAR.length).getValues()[0];
  const metin = BASLIKLAR.map((b, i) => b + ": " + v[i]).join("\n");
  MailApp.sendEmail(BILDIRIM_EPOSTA, "Yeni sipariş ödendi: " + no + " · " + v[4] + " TL", metin + "\n\nTablo: " + SpreadsheetApp.getActiveSpreadsheet().getUrl());
}
function cevap(t) { return ContentService.createTextOutput(t); }

/* ---------- İade talepleri ---------- */
const IADE_BASLIK = ["Tarih", "Sipariş no", "Ad soyad", "Telefon", "E-posta", "Ürün", "Neden", "Açıklama", "Durum", "Kargo kodu", "İade tarihi", "İade tutarı (TL)"];
function iadeKaydet(d) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let s = ss.getSheetByName("İadeler");
  if (!s) {
    s = ss.insertSheet("İadeler"); s.appendRow(IADE_BASLIK);
    s.getRange(1, 1, 1, IADE_BASLIK.length).setFontWeight("bold").setBackground("#02122C").setFontColor("#FFFFFF"); s.setFrozenRows(1);
    s.getRange("I2:I").setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(["Talep alındı", "Kargo kodu gönderildi", "Ürün ulaştı", "İade yapıldı", "Reddedildi"]).build());
  }
  s.appendRow([new Date(d.tarih), d.siparisNo, d.ad, d.telefon, d.eposta, d.urun, d.neden, d.aciklama, "Talep alındı", "", "", ""]);
  const v = [d.tarih, d.siparisNo, d.ad, d.telefon, d.eposta, d.urun, d.neden, d.aciklama];
  MailApp.sendEmail(BILDIRIM_EPOSTA, "Yeni iade talebi: " + d.siparisNo, IADE_BASLIK.slice(0, 8).map((b, i) => b + ": " + v[i]).join("\n"));
  return cevap("ok");
}
