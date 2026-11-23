/* Seçkin Optik — Optik Araçlar yükleyicisi
   Blogger sayfasına şu satır konur, gerisini bu dosya kurar:
     <div class="so-arac" data-arac="olcer"></div>      (olcer | simulator | studyo | merkez)
   Araçların aslı: cagataygulumser.com (blog-font deposu). Burada Seçkin Optik kimliğiyle sunulur. */
(function () {
  'use strict';
  var cs = document.currentScript;
  var KOK = ((cs && cs.src) || '').replace(/araclar\/[^\/]*$/, '');           /* …/seckin-optik@SURUM/ */
  var BF = 'https://cdn.jsdelivr.net/gh/cagataygulumser/blog-font@eb3557ff4c40b4b1cbc334acc04b8df04f01c43d/cam-gosterim/';
  var SAYFA = {
    merkez: '/p/optik-araclar.html',
    olcer: '/p/pd-ve-montaj-yuksekligi-olcer.html',
    simulator: '/p/gozluk-cam-simulatoru.html',
    studyo: '/p/cam-gosterim-studyosu.html'
  };
  try { if (window.SO_ARAC_SAYFA) for (var k in window.SO_ARAC_SAYFA) SAYFA[k] = window.SO_ARAC_SAYFA[k]; } catch (e) {}

  var ARAC = {
    olcer: {
      ad: 'PD ve Montaj Yüksekliği Ölçer', kisa: 'PD Ölçer', foto: 'magaza-ic-1.webp',
      ozet: 'Gözlük müşterinin yüzündeyken kameradan göz bebeği mesafesini (PD) ve montaj yüksekliğini birkaç adımda ön ölçüm olarak alın.',
      kart: 'Kamerayla, gözlük müşterinin yüzündeyken göz bebeği mesafesini ve montaj yüksekliğini ön ölçüm olarak alın.',
      cta: ['Kesin ölçüm mağazamızda', 'Buradaki sonuç bir ön ölçümdür. Camınız sipariş edilmeden önce ölçünüzü mağazamızda optisyenimiz alır ve doğrular.']
    },
    simulator: {
      ad: 'Gözlük Camı Simülatörü', kisa: 'Cam Simülatörü', foto: 'magaza-ic-2.webp',
      ozet: 'Cam merkezi göz bebeğinden kaydığında ne olur? Merkezleme, prizmatik etki, kenar kalınlığı ve ağırlığı müşterinin reçete ve çerçeve değerleriyle gösterin.',
      kart: 'Merkezleme, prizmatik etki, kenar kalınlığı ve ağırlığı müşterinin değerleriyle gösterin; 3 boyutlu önizleyin.',
      cta: ['Camınızı birlikte seçelim', 'Numaranıza ve çerçevenize uygun cam seçeneklerini mağazamızda bu ekran üzerinden birlikte inceleyebiliriz.']
    },
    studyo: {
      ad: 'Cam Gösterim Stüdyosu', kisa: 'Cam Stüdyosu', foto: 'magaza-ic-1.webp',
      ozet: 'Cam tasarımı, numara, kalınlık, kaplama ve renk farkını müşteriye tek ekranda gösterin; gözlüğü 3 boyutlu olarak yüzde inceletin.',
      kart: 'Tasarım, kalınlık, kaplama ve renk farkını müşteriye tek ekranda gösterin; gözlüğü 3 boyutlu olarak yüzde inceletin.',
      cta: ['Farkı mağazamızda görün', 'Ekrandaki karşılaştırmalar fikir verir. Gerçek cam örneklerini mağazamızda elinize alıp deneyebilirsiniz.']
    }
  };
  var SIRA = ['olcer', 'simulator', 'studyo'];

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function gorsel(d) { return KOK + 'img/magaza/' + d; }
  function logo(d) { return KOK + 'img/logo/' + d; }
  function wa(m) { try { if (window.SO && window.SO.waLink) return window.SO.waLink(m); } catch (e) {} return 'https://wa.me/905054596402?text=' + encodeURIComponent(m); }
  var YOL = 'https://www.google.com/maps/search/?api=1&query=Se%C3%A7kin+Optik+Demircio%C4%9Flu+Caddesi+37%2FA+%C3%87anakkale';

  function stil() {
    if (document.getElementById('so-arac-css')) return;
    var l = document.createElement('link'); l.id = 'so-arac-css'; l.rel = 'stylesheet'; l.href = KOK + 'araclar/arac.css';
    document.head.appendChild(l);
  }
  function ust(kimlik) {
    var a = ARAC[kimlik], h = '<header class="sa-ust" style="background-image:linear-gradient(90deg,rgba(2,18,44,.96) 0%,rgba(2,18,44,.86) 42%,rgba(2,18,44,.35) 100%),url(' + gorsel(a.foto) + ')">' +
      '<div class="sa-ust-ic"><img class="sa-logo" alt="Seçkin Optik" width="171" height="28" src="' + logo('seckin-optik-logo-beyaz.svg') + '"/>' +
      '<p class="sa-etiket">Optik Araçlar</p><h1>' + esc(a.ad) + '</h1><p class="sa-ozet">' + esc(a.ozet) + '</p></div>' +
      (kimlik === 'olcer' ? '' : '<button class="sa-tam" type="button" data-so-tam="' + kimlik + '">Tam ekran sunum</button>') +
      '<nav class="sa-gecis" aria-label="Diğer araçlar">';
    SIRA.forEach(function (k) { h += '<a href="' + SAYFA[k] + '"' + (k === kimlik ? ' class="on" aria-current="page"' : '') + '>' + esc(ARAC[k].kisa) + '</a>'; });
    return h + '<a href="' + SAYFA.merkez + '">Tüm araçlar</a></nav></header>';
  }
  function alt(kimlik, foto) {
    var c = ARAC[kimlik].cta;
    return '<aside class="sa-alt"><img alt="Seçkin Optik mağazası, Demircioğlu Caddesi, Çanakkale" loading="lazy" width="1400" height="868" src="' + gorsel(foto || 'magaza-vitrin.webp') + '"/>' +
      '<div><p class="sa-etiket">Seçkin Optik · Çanakkale</p><h2>' + esc(c[0]) + '</h2><p>' + esc(c[1]) + '</p>' +
      '<p class="sa-adres">Demircioğlu Caddesi No: 37/A, Merkez / Çanakkale · <a href="tel:+902862176636">0286 217 66 36</a></p>' +
      '<p class="sa-btnler"><a class="sa-btn" href="' + YOL + '" target="_blank" rel="noopener">Yol tarifi al</a>' +
      '<a class="sa-btn acik" href="' + wa('Merhaba Seçkin Optik, ' + ARAC[kimlik].ad + ' sayfanızdan yazıyorum.') + '" target="_blank" rel="noopener">WhatsApp\'tan yazın</a></p></div></aside>';
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-so-tam]'); if (!b) return;
    var d = b.getAttribute('data-so-tam') === 'studyo' ? document.getElementById('cgsApp') : document.querySelector('#pdsim-app .pd-fsb');
    if (d) d.click();
  });
  function hata(el) { el.querySelector('.sa-govde').innerHTML = '<p class="sa-hata">Araç yüklenemedi. Sayfayı yenileyin; sorun sürerse bize WhatsApp\'tan yazın.</p>'; }

  /* innerHTML ile gelen <script> etiketleri çalışmaz; sırayla yeniden oluşturulur */
  function betikler(kap) {
    var liste = [].slice.call(kap.querySelectorAll('script')), i = 0;
    (function sonraki() {
      if (i >= liste.length) return;
      var eski = liste[i++], yeni = document.createElement('script');
      if (eski.src) { yeni.src = eski.src; yeni.charset = 'utf-8'; yeni.async = false; yeni.onload = yeni.onerror = sonraki; eski.parentNode.replaceChild(yeni, eski); }
      else { yeni.textContent = eski.textContent; eski.parentNode.replaceChild(yeni, eski); sonraki(); }
    })();
  }
  function parca(el, kimlik) {
    fetch(KOK + 'araclar/' + kimlik + '.html').then(function (r) { if (!r.ok) throw 0; return r.text(); })
      .then(function (h) { var g = el.querySelector('.sa-govde'); g.innerHTML = h; betikler(g); })
      .catch(function () { hata(el); });
  }

  /* Cam Gösterim Stüdyosu: asıl kod blog-font deposundan alınır, Seçkin Optik kimliği uygulanır */
  function studyo(el) {
    var g = el.querySelector('.sa-govde');
    g.innerHTML = '<div id="cgs"></div>';
    var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = BF + 'cgs.css';
    var kendi = document.getElementById('so-arac-css'); document.head.insertBefore(l, kendi || null);
    fetch(BF + 'cgs.js').then(function (r) { if (!r.ok) throw 0; return r.text(); }).then(function (kod) {
      function degis(a, b, hepsi) { if (kod.indexOf(a) < 0) { try { console.warn('[so-arac] eşleşmedi:', a.slice(0, 50)); } catch (e) {} return; } kod = hepsi ? kod.split(a).join(b) : kod.replace(a, b); }
      degis("var BASE=((document.currentScript&&document.currentScript.src)||'').replace(/[^\\/]*$/,'');", 'var BASE=' + JSON.stringify(BF) + ';');
      degis('cagataygulumser.com · Cam Gösterim Stüdyosu', 'Seçkin Optik · Çanakkale · Cam Gösterim Stüdyosu', true);
      degis("gr.addColorStop(0,'#004aad');gr.addColorStop(1,'#2f86ff')", "gr.addColorStop(0,'#02122C');gr.addColorStop(1,'#004EA9')", true);
      degis("theme_color:'#004aad'", "theme_color:'#02122C'");
      degis('/p/pd-ve-montaj-yuksekligi-olcer.html', SAYFA.olcer, true);
      degis('/p/pd-ve-montaj-yuksekligi-simulatoru.html', SAYFA.simulator, true);
      degis('/p/cam-gosterim-studyosu.html', SAYFA.studyo, true);
      degis("'#004aad'", "'#004EA9'", true);
      /* Seçkin Optik mağaza fotoğrafları sahne olarak (İç Görünüm, Karşılaştır, Miyopi, Astigmat, Renkli ve Güneş) */
      degis("var SC=[", "var SC=[{id:'magaza',n:'Mağaza',f:" + JSON.stringify(gorsel('magaza-ic-1.webp')) + "},{id:'reyon',n:'Güneş reyonu',f:" + JSON.stringify(gorsel('magaza-ic-2.webp')) + "},{id:'vitrin',n:'Vitrin',f:" + JSON.stringify(gorsel('magaza-cephe.webp')) + "},");
      degis("if(!s.u||imgs[s.id])return;", "if(!(s.u||s.f)||imgs[s.id])return;");
      degis("im.src=U+s.u+(s.q||Q)}", "im.src=s.f||(U+s.u+(s.q||Q))}");
      degis("cr+=(i?', ':'')+SC[i].c;", "cr+=(/\\($/.test(cr)?'':', ')+SC[i].c;");
      degis("var S={tab:'ic',scene:'kafe'", "var S={tab:'ic',scene:'magaza'");
      var s = document.createElement('script'); s.textContent = kod; document.body.appendChild(s);
      /* etkin sekmeyi köke yaz: Kalınlık ve Kaplamalar'da sahnede logo gösterilir (arac.css) */
      var kok = document.getElementById('cgs'), tb = document.getElementById('cgsTabs');
      if (kok && tb) {
        var sekme = function () { var on = tb.querySelector('.cgs-tab.on'), d = on ? on.getAttribute('data-t') : ''; if (kok.getAttribute('data-so-sekme') !== d) kok.setAttribute('data-so-sekme', d); };
        sekme(); new MutationObserver(sekme).observe(tb, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
        var tam = function () { document.body.classList.toggle('so-tam', kok.classList.contains('cgs-app') || kok.classList.contains('cgs-fs')); };
        tam(); new MutationObserver(tam).observe(kok, { attributes: true, attributeFilter: ['class'] });
      }
    }).catch(function () { hata(el); });
  }

  function merkez(el) {
    var h = '<header class="sa-ust buyuk" style="background-image:linear-gradient(90deg,rgba(2,18,44,.96) 0%,rgba(2,18,44,.84) 45%,rgba(2,18,44,.3) 100%),url(' + gorsel('magaza-cephe.webp') + ')">' +
      '<div class="sa-ust-ic"><img class="sa-logo" alt="Seçkin Optik" width="171" height="28" src="' + logo('seckin-optik-logo-beyaz.svg') + '"/>' +
      '<p class="sa-etiket">Seçkin Optik · Çanakkale</p><h1>Optik Araçlar</h1>' +
      '<p class="sa-ozet">Mağazamızda ölçüm alırken ve cam seçeneklerini anlatırken ekibimizin kullandığı araçlar. Tablette tam ekran sunum için hazırlandı.</p>' +
      '<p class="sa-btnler"><a class="sa-btn beyaz" href="' + SAYFA.studyo + '?app=1">Cam Gösterim Stüdyosu\'nu tam ekran aç</a></p></div></header>' +
      '<div class="sa-kartlar">';
    var foto = { olcer: 'magaza-ic-1.webp', simulator: 'magaza-ic-2.webp', studyo: 'magaza-ic-3.webp' };
    SIRA.forEach(function (k, i) {
      h += '<a class="sa-kart" href="' + SAYFA[k] + '"><span class="sa-kart-g" style="background-image:url(' + gorsel(foto[k]) + ')"></span>' +
        '<span class="sa-kart-ic"><span class="sa-no">0' + (i + 1) + '</span><b>' + esc(ARAC[k].ad) + '</b><span>' + esc(ARAC[k].kart) + '</span><em>Aracı aç</em></span></a>';
    });
    h += '</div><p class="sa-not">Araçlardaki sonuçlar bilgilendirme amaçlıdır; göz muayenesinin ve optisyen ölçümünün yerini tutmaz.</p>';
    el.innerHTML = h + alt('studyo', 'magaza-ic-2.webp').replace(esc(ARAC.studyo.cta[0]), 'Mağazamıza bekleriz').replace(esc(ARAC.studyo.cta[1]), 'Ölçünüzü almak, cam seçeneklerini göstermek ve gözlüğünüzün ayarını yapmak için Çanakkale mağazamızdayız.').replace('Cam Gösterim Stüdyosu sayfanızdan', 'Optik Araçlar sayfanızdan');
  }

  function kur() {
    var el = document.querySelector('.so-arac[data-arac]'); if (!el || el.getAttribute('data-kuruldu')) return;
    var kimlik = el.getAttribute('data-arac'); if (kimlik !== 'merkez' && !ARAC[kimlik]) return;
    el.setAttribute('data-kuruldu', '1'); stil();
    document.body.classList.add('so-arac-sayfa');
    if (kimlik === 'merkez') { merkez(el); return; }
    el.innerHTML = ust(kimlik) + '<div class="sa-govde"><p class="sa-bekle">Araç yükleniyor…</p></div>' + alt(kimlik);
    if (kimlik === 'studyo') studyo(el); else parca(el, kimlik);
  }
  kur();
  document.addEventListener('so:sayfa', kur);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', kur);
})();
