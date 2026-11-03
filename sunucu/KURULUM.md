# Ödeme kurulumu (PayTR)

Sitede sepet, ödeme sayfası, sözleşme onayları ve sonuç sayfaları hazır. Online ödemeyi açmak için yalnızca aşağıdaki adımlar kalıyor. Bunlar tamamlanana kadar ödeme adımı siparişi eksiksiz şekilde WhatsApp'a gönderir.

```
Müşteri  →  Sepet  →  Ödeme sayfası (bilgiler + onaylar)
                         │
                         ▼
             Cloudflare Worker  ── fiyatları siteden doğrular, PayTR token alır
                         │
                         ▼
             PayTR ödeme ekranı (sitenin içinde)
                         │
            ┌────────────┴────────────┐
            ▼                         ▼
   /p/odeme-basarili.html    PayTR → Worker /paytr-bildirim
                                      │
                                      ▼
                         Google E-Tablo + e-posta bildirimi
```

## 1. PayTR

1. PayTR mağaza başvurusu onaylandıktan sonra **Mağaza Paneli → Destek & Kurulum → Entegrasyon Bilgileri**'nden şunları alın: **Mağaza No**, **Mağaza Parola**, **Mağaza Gizli Anahtar**.
2. Entegrasyon türü olarak **iFrame API**'yi seçin.
3. **Bildirim URL** alanına 2. adımda alacağınız Worker adresinin sonuna `/paytr-bildirim` ekleyerek yazın:
   `https://seckin-optik-odeme.KULLANICI.workers.dev/paytr-bildirim`

> Bu üç bilgi gizlidir. Sohbete, e-postaya veya GitHub'a yazmayın; yalnızca Cloudflare'in "Secret" alanına girin.

## 2. Ödeme sunucusu (Cloudflare Worker, ücretsiz)

1. [dash.cloudflare.com](https://dash.cloudflare.com) üzerinden ücretsiz hesap açın.
2. **Workers & Pages → Create → Create Worker**. Ad: `seckin-optik-odeme` → **Deploy**.
3. **Edit code** butonuna basın, içeriği silip `sunucu/worker.js` dosyasının tamamını yapıştırın → **Deploy**.
4. **Settings → Variables and Secrets**:

   | Ad | Tür | Değer |
   | --- | --- | --- |
   | `MERCHANT_ID` | Secret | PayTR Mağaza No |
   | `MERCHANT_KEY` | Secret | PayTR Mağaza Parola |
   | `MERCHANT_SALT` | Secret | PayTR Mağaza Gizli Anahtar |
   | `SITE` | Text | `https://seckin-optik.blogspot.com` |
   | `IZINLI_KOKENLER` | Text | `https://seckin-optik.blogspot.com` (alan adı bağlanırsa virgülle ekleyin) |
   | `TEST_MODE` | Text | `1` (önce test), canlıya geçerken `0` |
   | `SHEET_WEBHOOK` | Text | 3. adımdaki Apps Script adresi |
   | `SHEET_SECRET` | Secret | Apps Script'teki `GIZLI` ile aynı metin |

5. İsteğe bağlı: **Storage & Databases → KV → Create namespace** (`SIPARISLER`), sonra Worker → **Settings → Bindings → KV namespace** → değişken adı `SIPARISLER`.
6. Tarayıcıda Worker adresini açın: "Seçkin Optik ödeme sunucusu çalışıyor." yazısını görmelisiniz.

## 3. Sipariş tablosu (Google E-Tablo)

1. Google Drive'da yeni bir E-Tablo açın: "Seçkin Optik Siparişler".
2. **Uzantılar → Apps Script**. İçeriği silip `sunucu/siparis-tablosu.gs` dosyasını yapıştırın.
3. `GIZLI` değerini uzun, rastgele bir metinle değiştirin (Worker'daki `SHEET_SECRET` ile aynı). `BILDIRIM_EPOSTA` adresini kontrol edin.
4. **Dağıt → Yeni dağıtım → Web uygulaması**. "Şu kullanıcı olarak çalıştır: Ben", "Erişimi olan: Herkes" → **Dağıt**, izinleri onaylayın.
5. Çıkan `https://script.google.com/macros/s/.../exec` adresini Worker'daki `SHEET_WEBHOOK` alanına yazın.

Her sipariş tabloya "Ödeme bekleniyor" olarak düşer, ödeme onaylanınca satır yeşile döner ve e-posta gelir.

## 4. Siteyi bağlama

Blogger → **Tema → HTML'yi düzenle**. `window.SO_AYAR` satırını bulun ve değiştirin:

```js
window.SO_AYAR = { satisAktif: true, sunucu: "https://seckin-optik-odeme.KULLANICI.workers.dev" };
```

Kaydedin. Ödeme adımında artık PayTR ödeme ekranı açılır.

## 5. Test

1. `TEST_MODE = 1` iken siteden sipariş verin. PayTR'ın test kartını kullanın (PayTR panelinde **Test Kartları** bölümünde yazar).
2. Tabloda satırın "ÖDENDİ" olduğunu ve e-postanın geldiğini kontrol edin.
3. Her şey doğruysa PayTR panelinden mağazayı canlıya alın ve Worker'da `TEST_MODE = 0` yapın.

## Güvenlik notları

- Fiyatlar müşterinin tarayıcısından alınmaz; Worker her siparişte ürün fiyatını sitedeki ürün yazısından kendisi okur.
- PayTR bildirimleri imza (hash) ile doğrulanır; sahte bildirimler reddedilir.
- Kart bilgileri yalnızca PayTR'da işlenir; site ve Worker kart bilgisini hiç görmez.
- Worker'ı yerelde test etmek için: `cd sunucu && node test.mjs`
