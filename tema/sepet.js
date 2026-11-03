/* Seçkin Optik — sepet ve ödeme akışı | github.com/cagataygulumser/seckin-optik
   Sepet tarayıcıda (localStorage) tutulur. Ödeme: AYAR.satisAktif + AYAR.sunucu doluysa
   PayTR iFrame (Cloudflare Worker üzerinden), değilse sipariş WhatsApp ile tamamlanır. */
(function(){
"use strict";
var SO=window.SO; if(!SO)return;
var A=SO.AYAR, esc=SO.esc, tl=SO.tl;
var ANAHTAR="so-sepet-v1", MUSTERI="so-musteri-v1", SON="so-son-siparis-v1", MAKS=5;
var ODEME_SAYFA=A.odeme||"/p/odeme.html";
function $(s,c){return (c||document).querySelector(s)}
function $$(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))}
function oku(k,v){try{var x=localStorage.getItem(k);return x?JSON.parse(x):v}catch(e){return v}}
function yazDepo(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
function sil(k){try{localStorage.removeItem(k)}catch(e){}}
function kimlik(u){try{return new URL(u,location.href).pathname}catch(e){return u}}
function odemeAcik(){return !!(A.satisAktif&&A.sunucu)}

var sepet=oku(ANAHTAR,[]);
if(!Array.isArray(sepet))sepet=[];

/* ---------- İkonlar ---------- */
var IK={
  canta:"<svg fill='none' stroke='currentColor' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' viewBox='0 0 24 24'><path d='M6 7h12l1 13H5L6 7z'/><path d='M9 7V6a3 3 0 0 1 6 0v1'/></svg>",
  kapat:"<svg fill='none' stroke='currentColor' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24'><path d='M6 6l12 12M18 6L6 18'/></svg>",
  cop:"<svg fill='none' stroke='currentColor' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24'><path d='M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13'/></svg>",
  tik:"<svg fill='none' stroke='currentColor' stroke-linecap='round' stroke-linejoin='round' stroke-width='2.5' viewBox='0 0 24 24'><path d='M5 12.5l4.5 4.5L19 7.5'/></svg>",
  kilit:"<svg fill='none' stroke='currentColor' stroke-width='2' viewBox='0 0 24 24'><rect height='10' rx='2' width='16' x='4' y='11'/><path d='M8 11V8a4 4 0 0 1 8 0v3'/></svg>",
  kamyon:"<svg fill='none' stroke='currentColor' stroke-width='1.8' viewBox='0 0 24 24'><path d='M3 7h11v9H3zM14 10h4l3 3v3h-7z'/><circle cx='7' cy='17.5' r='1.8'/><circle cx='17' cy='17.5' r='1.8'/></svg>",
  wa:"<svg fill='currentColor' viewBox='0 0 24 24'><path d='M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2z'/></svg>",
  hata:"<svg fill='none' stroke='currentColor' stroke-linecap='round' stroke-width='2.5' viewBox='0 0 24 24'><path d='M12 7v6M12 17h.01'/></svg>"
};

/* ---------- Hesap ---------- */
function adet(){return sepet.reduce(function(t,s){return t+s.adet},0)}
function araToplam(){return sepet.reduce(function(t,s){return t+(s.stokYok?0:s.fiyat*s.adet)},0)}
function eskiToplam(){return sepet.reduce(function(t,s){return t+(s.stokYok?0:(isFinite(s.eski)&&s.eski>s.fiyat?s.eski:s.fiyat)*s.adet)},0)}

/* ---------- Kaydet + yeniden çiz ---------- */
function kaydet(){
  yazDepo(ANAHTAR,sepet);
  rozet(); paneliCiz();
  try{document.dispatchEvent(new CustomEvent("so:sepet"))}catch(e){}
}

/* ---------- Header düğmesi ---------- */
function headerKur(){
  var arac=$(".ust-arac"); if(!arac||$(".sepet-btn"))return;
  var b=document.createElement("button");
  b.type="button"; b.className="ikon-btn sepet-btn"; b.setAttribute("aria-label","Sepetim");
  b.innerHTML=IK.canta+"<span class='sepet-rozet gizli'>0</span>";
  b.addEventListener("click",ac);
  var ham=$(".hamburger",arac); arac.insertBefore(b,ham||null);
}
function rozet(){
  var r=$(".sepet-rozet"); if(!r)return;
  var n=adet(); r.textContent=n>9?"9+":n; r.classList.toggle("gizli",!n);
}

/* ---------- Kayan panel ---------- */
var panel,perde;
function panelKur(){
  perde=document.createElement("div"); perde.className="sepet-perde gizli";
  panel=document.createElement("aside"); panel.className="sepet-panel"; panel.setAttribute("aria-label","Sepetim"); panel.setAttribute("aria-hidden","true");
  document.body.appendChild(perde); document.body.appendChild(panel);
  perde.addEventListener("click",kapat);
  panel.addEventListener("click",function(e){
    var t=e.target.closest("[data-islem]"); if(!t)return;
    var islem=t.getAttribute("data-islem"), id=t.getAttribute("data-id");
    if(islem==="kapat")kapat();
    else if(islem==="arti")degistir(id,1);
    else if(islem==="eksi")degistir(id,-1);
    else if(islem==="sil")kaldir(id);
  });
  document.addEventListener("keydown",function(e){if(e.key==="Escape"&&panel.classList.contains("acik"))kapat()});
}
function ac(){paneliCiz();panel.classList.add("acik");panel.setAttribute("aria-hidden","false");perde.classList.remove("gizli");document.documentElement.style.overflow="hidden"}
function kapat(){panel.classList.remove("acik");panel.setAttribute("aria-hidden","true");perde.classList.add("gizli");document.documentElement.style.overflow=""}
function satirHTML(s,kucuk){
  return "<li class='sp-urun"+(s.stokYok?" stok-yok":"")+"'>"+
    "<a class='sp-gorsel' href='"+esc(s.url)+"'>"+(s.resim?"<img alt='' src='"+esc(s.resim)+"'/>":"")+"</a>"+
    "<div class='sp-bilgi'><p class='eyebrow'>"+esc(s.marka)+"</p><a class='sp-ad' href='"+esc(s.url)+"'>"+esc(s.model||s.baslik)+"</a>"+
    (s.stokYok?"<p class='sp-uyari'>Bu ürün şu an stokta yok</p>":"")+
    (kucuk?"<p class='sp-adet-yazi'>"+s.adet+" adet</p>":
    "<div class='sp-alt-satir'><div class='adet-kutu'><button aria-label='Azalt' data-id='"+esc(s.id)+"' data-islem='eksi' type='button'>−</button><span>"+s.adet+"</span><button aria-label='Arttır' data-id='"+esc(s.id)+"' data-islem='arti' type='button'"+(s.adet>=MAKS?" disabled='disabled'":"")+">+</button></div>"+
    "<button aria-label='Kaldır' class='sp-sil' data-id='"+esc(s.id)+"' data-islem='sil' type='button'>"+IK.cop+"</button></div>")+
    "</div><div class='sp-fiyat'><strong>"+tl(s.fiyat*s.adet)+"</strong>"+(isFinite(s.eski)&&s.eski>s.fiyat?"<del>"+tl(s.eski*s.adet)+"</del>":"")+"</div></li>";
}
function paneliCiz(){
  if(!panel)return;
  var bos=!sepet.length, kazanc=eskiToplam()-araToplam();
  panel.innerHTML="<div class='sp-ust'><h3>Sepetim"+(bos?"":" <span>("+adet()+")</span>")+"</h3><button aria-label='Kapat' class='ikon-btn' data-islem='kapat' type='button'>"+IK.kapat+"</button></div>"+
    (bos?"<div class='sp-bos'>"+IK.canta+"<p><b>Sepetiniz boş</b></p><p>Koleksiyona göz atın, beğendiğiniz gözlüğü sepete ekleyin.</p><a class='btn btn-ana' data-islem='kapat' href='/#koleksiyon'>Alışverişe başla</a></div>":
    "<div class='sp-kargo'>"+IK.kamyon+"<span><b>Ücretsiz kargo</b> · Aynı gün kargoya verilir</span></div>"+
    "<ul class='sp-liste'>"+sepet.map(function(s){return satirHTML(s,false)}).join("")+"</ul>"+
    "<div class='sp-alt'>"+
      (kazanc>0?"<div class='sp-satir kazanc'><span>İndirim kazancınız</span><span>−"+tl(kazanc)+"</span></div>":"")+
      "<div class='sp-satir'><span>Kargo</span><span class='yesil'>Ücretsiz</span></div>"+
      "<div class='sp-satir toplam'><span>Toplam <small>KDV dahil</small></span><strong>"+tl(araToplam())+"</strong></div>"+
      "<a class='btn btn-ana btn-tam' href='"+ODEME_SAYFA+"'>Ödemeye geç</a>"+
      "<button class='btn btn-cizgi btn-tam' data-islem='kapat' type='button'>Alışverişe devam et</button>"+
      "<p class='guvenli'>"+IK.kilit+"PayTR güvencesiyle 256-bit SSL ödeme</p>"+
    "</div>");
}

/* ---------- Sepet işlemleri ---------- */
function ekle(u,n,sessiz){
  n=n||1; var id=kimlik(u.url); var s=sepet.filter(function(x){return x.id===id})[0];
  if(s){s.adet=Math.min(MAKS,s.adet+n)}
  else sepet.push({id:id,url:u.url.split("?")[0].split("#")[0],baslik:u.baslik,marka:u.marka,model:u.model,fiyat:u.fiyat,eski:u.eski,resim:SO.kucult(u.resimler&&u.resimler[0],300)||"",adet:Math.min(MAKS,n)});
  kaydet();
  if(!sessiz)ac();
  bildir((u.marka?u.marka+" ":"")+(u.model||"")+" sepete eklendi");
}
function degistir(id,f){var s=sepet.filter(function(x){return x.id===id})[0];if(!s)return;s.adet=Math.max(1,Math.min(MAKS,s.adet+f));kaydet()}
function kaldir(id){sepet=sepet.filter(function(x){return x.id!==id});kaydet()}
function temizle(){sepet=[];kaydet()}

/* ---------- Bildirim ---------- */
var bildirimZ;
function bildir(m){
  var b=$(".so-bildirim");
  if(!b){b=document.createElement("div");b.className="so-bildirim";b.setAttribute("role","status");document.body.appendChild(b)}
  b.innerHTML=IK.tik+"<span>"+esc(m)+"</span>"; b.classList.add("goster");
  clearTimeout(bildirimZ); bildirimZ=setTimeout(function(){b.classList.remove("goster")},2400);
}

/* ---------- Fiyat/stok tazeleme (sitedeki güncel veriye göre) ---------- */
function tazele(){
  if(!sepet.length)return Promise.resolve();
  return SO.feedGetir().then(function(h){
    var harita={}; h.forEach(function(v){if(v.urun)harita[kimlik(v.url)]=v});
    var degisti=false;
    sepet=sepet.filter(function(s){
      var v=harita[s.id]; if(!v){degisti=true;return false}
      if(v.fiyat!==s.fiyat||v.eski!==s.eski||(v.stok==="yok")!==!!s.stokYok)degisti=true;
      s.fiyat=v.fiyat; s.eski=v.eski; s.stokYok=v.stok==="yok"; s.marka=v.marka; s.model=v.model; s.baslik=v.baslik;
      return true;
    });
    if(degisti)kaydet();
  }).catch(function(){});
}

/* ---------- ÖDEME SAYFASI ---------- */
var ILLER="Adana,Adıyaman,Afyonkarahisar,Ağrı,Aksaray,Amasya,Ankara,Antalya,Ardahan,Artvin,Aydın,Balıkesir,Bartın,Batman,Bayburt,Bilecik,Bingöl,Bitlis,Bolu,Burdur,Bursa,Çanakkale,Çankırı,Çorum,Denizli,Diyarbakır,Düzce,Edirne,Elazığ,Erzincan,Erzurum,Eskişehir,Gaziantep,Giresun,Gümüşhane,Hakkari,Hatay,Iğdır,Isparta,İstanbul,İzmir,Kahramanmaraş,Karabük,Karaman,Kars,Kastamonu,Kayseri,Kilis,Kırıkkale,Kırklareli,Kırşehir,Kocaeli,Konya,Kütahya,Malatya,Manisa,Mardin,Mersin,Muğla,Muş,Nevşehir,Niğde,Ordu,Osmaniye,Rize,Sakarya,Samsun,Şanlıurfa,Siirt,Sinop,Şırnak,Sivas,Tekirdağ,Tokat,Trabzon,Tunceli,Uşak,Van,Yalova,Yozgat,Zonguldak".split(",");
function adimlar(n){
  var ad=["Sepet","Teslimat","Ödeme"];
  return "<ol class='od-adimlar'>"+ad.map(function(a,i){return "<li class='"+(i+1<n?"tamam":i+1===n?"aktif":"")+"'><span>"+(i+1<n?IK.tik:(i+1))+"</span>"+a+"</li>"}).join("")+"</ol>";
}
function ozetHTML(){
  var kazanc=eskiToplam()-araToplam();
  return "<aside class='od-ozet'><div class='od-ozet-ust'><h3>Sipariş özeti</h3><button class='od-duzenle' id='od-duzenle' type='button'>Düzenle</button></div>"+
    "<ul class='sp-liste'>"+sepet.map(function(s){return satirHTML(s,true)}).join("")+"</ul>"+
    "<div class='sp-satir'><span>Ara toplam</span><span>"+tl(eskiToplam())+"</span></div>"+
    (kazanc>0?"<div class='sp-satir kazanc'><span>İndirim</span><span>−"+tl(kazanc)+"</span></div>":"")+
    "<div class='sp-satir'><span>Kargo</span><span class='yesil'>Ücretsiz</span></div>"+
    "<div class='sp-satir toplam'><span>Toplam <small>KDV dahil</small></span><strong>"+tl(araToplam())+"</strong></div>"+
    "<ul class='od-guven'><li>"+IK.kilit+"256-bit SSL, PayTR güvenli ödeme</li><li>"+IK.kamyon+"Aynı gün ücretsiz kargo</li><li>"+IK.tik+"14 gün içinde koşulsuz iade</li></ul></aside>";
}
function alan(ad,etiket,tip,deger,ek){
  ek=ek||{};
  var gerekli=ek.gerekli!==false;
  var ic=tip==="textarea"?"<textarea id='od-"+ad+"' name='"+ad+"' rows='3'"+(gerekli?" required":"")+(ek.ph?" placeholder='"+esc(ek.ph)+"'":"")+">"+esc(deger||"")+"</textarea>":
    tip==="select"?"<select id='od-"+ad+"' name='"+ad+"'"+(gerekli?" required":"")+"><option value=''>Seçin</option>"+ek.secenek.map(function(o){return "<option"+(o===deger?" selected":"")+">"+esc(o)+"</option>"}).join("")+"</select>":
    "<input id='od-"+ad+"' name='"+ad+"' type='"+tip+"' value='"+esc(deger||"")+"'"+(gerekli?" required":"")+(ek.ph?" placeholder='"+esc(ek.ph)+"'":"")+(ek.ac?" autocomplete='"+ek.ac+"'":"")+(ek.desen?" pattern='"+ek.desen+"'":"")+(ek.mod?" inputmode='"+ek.mod+"'":"")+"/>";
  return "<label class='od-alan"+(ek.genis?" genis":"")+"' for='od-"+ad+"'><span>"+etiket+(gerekli?"":" <i>(isteğe bağlı)</i>")+"</span>"+ic+"<em class='od-hata'></em></label>";
}
var kok;
function odemeKur(){
  kok=$("#so-odeme"); if(!kok||kok.getAttribute("data-kuruldu"))return;
  kok.setAttribute("data-kuruldu","1");
  var yazi=kok.closest(".yazi"); if(yazi)yazi.classList.add("genis");
  tazele().then(formCiz);
  document.addEventListener("so:sepet",function(){if(!kok.querySelector(".od-iframe")&&!kok.querySelector(".od-sonuc"))formCiz()});
}
function formCiz(){
  if(!sepet.length){
    kok.innerHTML=adimlar(1)+"<div class='od-bos'>"+IK.canta+"<h2>Sepetiniz boş</h2><p>Ödeme adımına geçmek için önce sepetinize ürün ekleyin.</p><a class='btn btn-ana' href='/#koleksiyon'>Koleksiyona göz at</a></div>";
    return;
  }
  var m=oku(MUSTERI,{}), kurumsal=m.faturaTuru==="kurumsal";
  kok.innerHTML=adimlar(2)+
  "<div class='od-izgara'><form class='od-form' id='od-form' novalidate>"+
    "<section class='od-kutu'><h2><span>1</span>İletişim bilgileri</h2><div class='od-alanlar'>"+
      alan("ad","Ad soyad","text",m.ad,{ac:"name",genis:true})+
      alan("telefon","Cep telefonu","tel",m.telefon,{ac:"tel",ph:"05xx xxx xx xx",mod:"tel"})+
      alan("eposta","E-posta","email",m.eposta,{ac:"email",ph:"ornek@mail.com"})+
    "</div></section>"+
    "<section class='od-kutu'><h2><span>2</span>Teslimat adresi</h2><div class='od-alanlar'>"+
      alan("il","İl","select",m.il,{secenek:ILLER})+
      alan("ilce","İlçe","text",m.ilce,{ac:"address-level2"})+
      alan("adres","Açık adres","textarea",m.adres,{genis:true,ph:"Mahalle, cadde/sokak, bina ve daire no"})+
    "</div></section>"+
    "<section class='od-kutu'><h2><span>3</span>Fatura bilgileri</h2>"+
      "<div class='od-secim'><label><input name='faturaTuru' type='radio' value='bireysel'"+(kurumsal?"":" checked")+"/><span>Bireysel</span></label><label><input name='faturaTuru' type='radio' value='kurumsal'"+(kurumsal?" checked":"")+"/><span>Kurumsal</span></label></div>"+
      "<div class='od-alanlar od-kurumsal"+(kurumsal?"":" gizli")+"'>"+
        alan("firma","Firma unvanı","text",m.firma,{genis:true,gerekli:false})+
        alan("vergiDairesi","Vergi dairesi","text",m.vergiDairesi,{gerekli:false})+
        alan("vergiNo","Vergi numarası","text",m.vergiNo,{gerekli:false,mod:"numeric"})+
      "</div>"+
      "<p class='od-kucuk'>Faturanız teslimat adresine düzenlenir ve e-posta adresinize gönderilir.</p>"+
    "</section>"+
    "<section class='od-kutu'><h2><span>4</span>Sipariş notu</h2><div class='od-alanlar'>"+alan("not","Notunuz","textarea",m.not,{genis:true,gerekli:false,ph:"Hediye paketi, teslimat saati vb."})+"</div></section>"+
    "<section class='od-kutu od-onaylar'>"+
      "<label class='onay-kutu'><input id='od-sozlesme' type='checkbox'/><span><a href='/p/on-bilgilendirme-formu.html' target='_blank'>Ön Bilgilendirme Formu</a>'nu ve <a href='/p/mesafeli-satis-sozlesmesi.html' target='_blank'>Mesafeli Satış Sözleşmesi</a>'ni okudum, onaylıyorum.</span></label>"+
      "<label class='onay-kutu'><input id='od-kvkk' type='checkbox'/><span><a href='/p/kvkk.html' target='_blank'>KVKK Aydınlatma Metni</a>'ni okudum.</span></label>"+
      "<label class='onay-kutu'><input id='od-ileti' type='checkbox'"+(m.ileti?" checked":"")+"/><span>Kampanya ve yeni ürünlerden e-posta/SMS ile haberdar olmak istiyorum. <i>(isteğe bağlı)</i></span></label>"+
      "<p class='od-hata-genel gizli' id='od-hata-genel'></p>"+
      "<button class='btn btn-ana btn-tam od-gonder' id='od-gonder' type='submit'>"+IK.kilit+"<span>Ödemeye geç · "+tl(araToplam())+"</span></button>"+
      "<p class='od-kucuk merkez'>Kart bilgileriniz Seçkin Optik ile paylaşılmaz; ödeme PayTR güvenli sayfasında alınır.</p>"+
    "</section>"+
  "</form>"+ozetHTML()+"</div>";
  var f=$("#od-form");
  $$("input[name=faturaTuru]",f).forEach(function(r){r.addEventListener("change",function(){$(".od-kurumsal",f).classList.toggle("gizli",r.value!=="kurumsal"||!r.checked)})});
  f.addEventListener("input",function(e){var l=e.target.closest(".od-alan");if(l)l.classList.remove("hatali");formuSakla(f)});
  f.addEventListener("submit",function(e){e.preventDefault();gonder(f)});
  $("#od-duzenle").addEventListener("click",ac);
}
function formVerisi(f){
  var d={}; ["ad","telefon","eposta","il","ilce","adres","firma","vergiDairesi","vergiNo","not"].forEach(function(k){var el=$("#od-"+k,f);d[k]=el?el.value.trim():""});
  var r=$("input[name=faturaTuru]:checked",f); d.faturaTuru=r?r.value:"bireysel";
  var il=$("#od-ileti",f); d.ileti=!!(il&&il.checked);
  return d;
}
function formuSakla(f){yazDepo(MUSTERI,formVerisi(f))}
function hataGoster(f,ad,mesaj){var el=$("#od-"+ad,f);if(!el)return;var l=el.closest(".od-alan");l.classList.add("hatali");$(".od-hata",l).textContent=mesaj}
function dogrula(f,d){
  var ok=true, ilk=null;
  function h(ad,m){ok=false;hataGoster(f,ad,m);if(!ilk)ilk=ad}
  $$(".od-alan",f).forEach(function(l){l.classList.remove("hatali")});
  if(d.ad.split(/\s+/).filter(Boolean).length<2)h("ad","Ad ve soyadınızı yazın");
  var tel=d.telefon.replace(/\D/g,"").replace(/^90/,"").replace(/^0/,"");
  if(!/^5\d{9}$/.test(tel))h("telefon","Geçerli bir cep telefonu yazın (05xx…)"); else d.telefon="0"+tel;
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.eposta))h("eposta","Geçerli bir e-posta yazın");
  if(!d.il)h("il","İl seçin");
  if(d.ilce.length<2)h("ilce","İlçe yazın");
  if(d.adres.length<10)h("adres","Açık adresinizi eksiksiz yazın");
  if(d.faturaTuru==="kurumsal"){
    if(d.firma.length<2)h("firma","Firma unvanını yazın");
    if(d.vergiDairesi.length<2)h("vergiDairesi","Vergi dairesini yazın");
    if(!/^\d{10,11}$/.test(d.vergiNo))h("vergiNo","10 haneli vergi no (veya 11 haneli TCKN)");
  }
  var g=$("#od-hata-genel",f), mesaj="";
  if(!$("#od-sozlesme",f).checked)mesaj="Devam etmek için Ön Bilgilendirme Formu ve Mesafeli Satış Sözleşmesi'ni onaylayın.";
  else if(!$("#od-kvkk",f).checked)mesaj="Devam etmek için KVKK Aydınlatma Metni'ni okuduğunuzu onaylayın.";
  if(sepet.some(function(s){return s.stokYok}))mesaj="Sepetinizde stokta olmayan ürün var. Lütfen kaldırın.";
  g.textContent=mesaj; g.classList.toggle("gizli",!mesaj); if(mesaj)ok=false;
  if(ilk){var el=$("#od-"+ilk,f);el.focus();el.scrollIntoView({block:"center",behavior:"smooth"})}
  else if(mesaj)g.scrollIntoView({block:"center",behavior:"smooth"});
  return ok;
}
function siparisNoUret(){var t=new Date();function p(n){return ("0"+n).slice(-2)}return "SO"+String(t.getFullYear()).slice(2)+p(t.getMonth()+1)+p(t.getDate())+Math.random().toString(36).slice(2,6).toUpperCase()}
function gonder(f){
  var d=formVerisi(f); if(!dogrula(f,d))return;
  yazDepo(MUSTERI,d);
  var btn=$("#od-gonder",f); btn.disabled=true; btn.classList.add("yukleniyor"); $("span",btn).textContent="Hazırlanıyor…";
  var kalemler=sepet.map(function(s){return {url:s.url,adet:s.adet}});
  var kayit={no:null,tarih:new Date().toISOString(),sepet:JSON.parse(JSON.stringify(sepet)),toplam:araToplam(),musteri:d};
  if(!odemeAcik()){kayit.no=siparisNoUret();yazDepo(SON,kayit);whatsappAdimi(kayit);return}
  fetch(A.sunucu.replace(/\/$/,"")+"/odeme-baslat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({sepet:kalemler,musteri:d})})
  .then(function(r){return r.json().then(function(j){return {ok:r.ok,j:j}})})
  .then(function(x){
    if(!x.ok||!x.j.token)throw new Error((x.j&&x.j.hata)||"Ödeme başlatılamadı");
    kayit.no=x.j.siparisNo; kayit.toplam=x.j.toplam||kayit.toplam; yazDepo(SON,kayit);
    iframeAdimi(x.j.token,kayit);
  })
  .catch(function(err){
    btn.disabled=false; btn.classList.remove("yukleniyor"); $("span",btn).textContent="Ödemeye geç · "+tl(araToplam());
    var g=$("#od-hata-genel",f); g.textContent=(err&&err.message?err.message+". ":"")+"Lütfen tekrar deneyin veya siparişinizi WhatsApp'tan iletin."; g.classList.remove("gizli");
  });
}
function iframeAdimi(token,kayit){
  kok.innerHTML=adimlar(3)+"<div class='od-izgara'><div class='od-kutu od-iframe'><div class='od-iframe-ust'><h2>Güvenli ödeme</h2><span>Sipariş no: <b>"+esc(kayit.no)+"</b></span></div>"+
    "<iframe frameborder='0' id='paytriframe' scrolling='no' src='https://www.paytr.com/odeme/guvenli/"+encodeURIComponent(token)+"' style='width:100%;min-height:620px' title='PayTR güvenli ödeme'></iframe></div>"+ozetHTML()+"</div>";
  $("#od-duzenle").remove();
  var s=document.createElement("script"); s.src="https://www.paytr.com/js/iframeResizer.min.js";
  s.onload=function(){try{window.iFrameResize({},"#paytriframe")}catch(e){}}; document.body.appendChild(s);
  window.scrollTo({top:0,behavior:"smooth"});
}
function siparisMetni(k){
  var m=k.musteri, sat=[];
  sat.push("Merhaba, siparişimi tamamlamak istiyorum.");
  sat.push("Sipariş no: "+k.no);
  sat.push("");
  k.sepet.forEach(function(s){sat.push("• "+(s.marka+" "+(s.model||s.baslik)).trim()+" × "+s.adet+" = "+tl(s.fiyat*s.adet))});
  sat.push("Toplam: "+tl(k.toplam)+" (kargo ücretsiz)");
  sat.push("");
  sat.push("Ad soyad: "+m.ad); sat.push("Telefon: "+m.telefon); sat.push("E-posta: "+m.eposta);
  sat.push("Adres: "+m.adres+", "+m.ilce+" / "+m.il);
  if(m.faturaTuru==="kurumsal")sat.push("Fatura: "+m.firma+" · "+m.vergiDairesi+" VD · "+m.vergiNo);
  if(m.not)sat.push("Not: "+m.not);
  return sat.join("\n");
}
function whatsappAdimi(k){
  kok.innerHTML=adimlar(3)+"<div class='od-izgara'><div class='od-kutu od-sonuc'>"+
    "<div class='yakinda'><span class='yakinda-ik'>"+IK.kilit+"</span><div><b>Online ödeme çok yakında aktif</b><p>Güvenli ödeme altyapımızın kurulumu tamamlanmak üzere. Siparişinizi şimdilik WhatsApp üzerinden tamamlayabilirsiniz; size güvenli ödeme bağlantısını hemen gönderelim.</p></div></div>"+
    "<h2>Siparişiniz hazır</h2><p class='od-kucuk'>Sipariş no: <b>"+esc(k.no)+"</b></p>"+
    "<a class='btn btn-ana btn-tam' href='"+SO.waLink(siparisMetni(k))+"' id='od-wa' rel='noopener' target='_blank'>"+IK.wa+"Siparişi WhatsApp ile tamamla</a>"+
    "<button class='btn btn-cizgi btn-tam' id='od-geri' style='margin-top:10px' type='button'>Bilgileri düzenle</button>"+
  "</div>"+ozetHTML()+"</div>";
  $("#od-duzenle").remove();
  $("#od-geri").addEventListener("click",formCiz);
  $("#od-wa").addEventListener("click",function(){setTimeout(function(){location.href="/p/odeme-basarili.html?wa=1"},800)});
  window.scrollTo({top:0,behavior:"smooth"});
}

/* ---------- SONUÇ SAYFALARI ---------- */
function sonucKur(){
  var el=$("#so-sonuc"); if(!el||el.getAttribute("data-kuruldu"))return;
  el.setAttribute("data-kuruldu","1");
  var yazi=el.closest(".yazi"); if(yazi)yazi.classList.add("sonuc-sayfa");
  var basarili=el.getAttribute("data-durum")!=="basarisiz";
  var k=oku(SON,null), wa=/[?&]wa=1/.test(location.search);
  if(basarili){
    temizle();
    el.innerHTML="<div class='sonuc-kutu'><span class='sonuc-ik tamam'>"+IK.tik+"</span><h2>"+(wa?"Siparişiniz WhatsApp'a iletildi":"Teşekkürler, siparişiniz alındı")+"</h2>"+
      "<p>"+(wa?"Mesajı gönderdiğinizde size kısa sürede güvenli ödeme bağlantısı ileteceğiz.":"Ödemeniz onaylandıktan sonra siparişiniz aynı gün kargoya verilir. Kargo takip bilgisi e-posta ve SMS ile gönderilecek.")+"</p>"+
      (k&&k.no?"<div class='sonuc-no'>Sipariş no <b>"+esc(k.no)+"</b></div>":"")+
      (k&&k.sepet?"<ul class='sp-liste'>"+k.sepet.map(function(s){return satirHTML(s,true)}).join("")+"</ul><div class='sp-satir toplam'><span>Toplam</span><strong>"+tl(k.toplam)+"</strong></div>":"")+
      "<div class='sonuc-btn'><a class='btn btn-ana' href='/#koleksiyon'>Alışverişe devam et</a><a class='btn btn-cizgi' href='"+SO.waLink("Merhaba, "+(k&&k.no?k.no+" numaralı ":"")+"siparişim hakkında bilgi almak istiyorum.")+"' rel='noopener' target='_blank'>Sipariş hakkında sor</a></div></div>";
  }else{
    el.innerHTML="<div class='sonuc-kutu'><span class='sonuc-ik hata'>"+IK.hata+"</span><h2>Ödeme tamamlanamadı</h2>"+
      "<p>Kartınızdan herhangi bir tutar çekilmedi. Kart bilgilerinizi ve limitinizi kontrol edip tekrar deneyebilir ya da siparişinizi WhatsApp'tan tamamlayabilirsiniz. Sepetiniz korunuyor.</p>"+
      "<div class='sonuc-btn'><a class='btn btn-ana' href='"+ODEME_SAYFA+"'>Tekrar dene</a><a class='btn btn-cizgi' href='"+SO.waLink("Merhaba, ödeme sırasında sorun yaşadım"+(k&&k.no?" (sipariş no: "+k.no+")":"")+". Yardımcı olur musunuz?")+"' rel='noopener' target='_blank'>WhatsApp'tan yardım al</a></div></div>";
  }
}

/* ---------- Başlat ---------- */
/* PayTR, sonuç sayfasını ödeme çerçevesi içinde açar: üst pencereye taşı */
if(window.top!==window.self&&/\/p\/odeme-basar/.test(location.pathname)){try{window.top.location.href=location.href}catch(e){}}
headerKur(); panelKur(); rozet(); paneliCiz();
tazele();
window.SoSepet={ekle:ekle,ac:ac,kapat:kapat,temizle:temizle,liste:function(){return sepet.slice()},toplam:araToplam};
function sayfalar(){odemeKur();sonucKur()}
sayfalar();
document.addEventListener("so:sayfa",sayfalar);
/* başka sekmede değişirse eşitle */
window.addEventListener("storage",function(e){if(e.key===ANAHTAR){sepet=oku(ANAHTAR,[]);rozet();paneliCiz()}});
})();
