# Seçkin Optik — web sitesi

Çanakkale Seçkin Optik'in Blogger üzerinde çalışan mağaza sitesi: **seckin-optik.blogspot.com**

## Klasörler

| Klasör | İçerik |
| --- | --- |
| `tema/blogger-tema.xml` | Blogger'a yüklenen tema iskeleti (Tema → HTML'yi düzenle) |
| `tema/seckin.css` | Tüm stiller |
| `tema/seckin.js` | Mağaza, filtreler, ürün sayfası, PayTR satın alma penceresi |
| `img/logo/` | Logo (renkli, beyaz), gözlük işareti, favicon |
| `img/urunler/` | Ürün fotoğrafları |

Site dosyaları jsDelivr üzerinden yüklenir:
`https://cdn.jsdelivr.net/gh/cagataygulumser/seckin-optik@SURUM/...`

## Tasarımı güncelleme

1. `tema/seckin.css` veya `tema/seckin.js` dosyasını değiştir, commit et.
2. Yeni bir sürüm etiketi ver (ör. `v2.0.1`).
3. Blogger temasında `@v2.0.0` geçen yerleri yeni sürümle değiştir.

## Ürün ekleme

Her ürün bir Blogger yazısıdır. Yazının HTML görünümüne şunu koy:

```html
<div class="so-urun" data-marka="Ray-Ban" data-model="RB 0316S 6826J5 53"
  data-fiyat="14066.40" data-eski-fiyat="20094" data-paytr="PAYTR_LINKI"
  data-stok="var" data-tur="gunes" data-cinsiyet="Unisex" data-renk="Siyah"
  data-cerceve="Asetat" data-cerceve-renk="Siyah" data-cam="Mineral" data-cam-renk="Yeşil"
  data-filtre="UV400" data-olcu="53-21-145" data-garanti="2 yıl" data-barkod="" data-yeni="evet"></div>
<img src="https://cdn.jsdelivr.net/gh/cagataygulumser/seckin-optik@main/img/urunler/DOSYA.jpg" />
<p>Ürün açıklaması…</p>
```

- `data-tur`: `gunes` veya `optik`
- `data-cinsiyet`: Kadın, Erkek, Unisex, Çocuk
- `data-stok`: `var` veya `yok`
- `data-paytr` boşsa buton otomatik "WhatsApp ile sipariş ver" olur.
- Etiketler: cinsiyet + marka + "Güneş Gözlüğü" (ör. `Unisex, Ray-Ban, Güneş Gözlüğü`).

## Renkler

Lacivert `#02122C` · Mavi `#004EA9` · Beyaz zemin · Yazı tipi: Plus Jakarta Sans
