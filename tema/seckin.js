/* Seçkin Optik — Blogger teması v2.0 | github.com/cagataygulumser/seckin-optik */
(function(){
"use strict";
/* ---------- AYARLAR (buradan düzenleyin) ---------- */
var AYAR = {
  satisAktif: false, /* PayTR hazır olunca true yapın */
  whatsapp: "905054596402",
  telefon: "+902862176636",
  sayfaBasi: 12,
  sozlesme: "/p/mesafeli-satis-sozlesmesi.html",
  onBilgi: "/p/on-bilgilendirme-formu.html",
  iade: "/p/iade-ve-degisim.html"
};
/* --------------------------------------------------- */
var B = document.body;
var KAT = {kadin:"Kadın",erkek:"Erkek",unisex:"Unisex",cocuk:"Çocuk",optik:"Optik",indirim:"İndirimli",tumu:"Tümü"};
var ETIKET_KAT = {"kadın":"kadin","kadin":"kadin","erkek":"erkek","unisex":"unisex","çocuk":"cocuk","cocuk":"cocuk","optik":"optik","indirim":"indirim","indirimli":"indirim"};
function $(s,c){return (c||document).querySelector(s)}
function $$(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))}
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function tl(n){if(!isFinite(n))return"";return new Intl.NumberFormat("tr-TR",{style:"currency",currency:"TRY",minimumFractionDigits:n%1?2:0,maximumFractionDigits:2}).format(n)}
function sayi(v){if(v==null||v==="")return NaN;v=String(v).trim();if(/,\d{1,2}$/.test(v))v=v.replace(/\./g,"").replace(",",".");return parseFloat(v.replace(/[^\d.]/g,""))}
function kucult(src,n){if(!src)return src;if(/blogger\.googleusercontent|bp\.blogspot/.test(src)){return src.replace(/\/s\d+(-[a-z]+)?\//,"/s"+n+"/").replace(/=s\d+(-[a-z]+)?$/,"=s"+n).replace(/\/w\d+-h\d+(-[a-z]+)?\//,"/s"+n+"/")}return src}
function norm(s){return String(s||"").toLocaleLowerCase("tr-TR").replace(/ı/g,"i").replace(/[ğ]/g,"g").replace(/ü/g,"u").replace(/ş/g,"s").replace(/ö/g,"o").replace(/ç/g,"c").replace(/[^a-z0-9]+/g,"")}
function waLink(metin){return "https://wa.me/"+AYAR.whatsapp+"?text="+encodeURIComponent(metin)}

/* WhatsApp bağlantıları */
var genelWa = waLink("Merhaba Seçkin Optik, bilgi almak istiyorum.");
["ust-wa","wa-yuzen","magaza-wa","alt-wa"].forEach(function(id){var a=document.getElementById(id);if(a)a.href=genelWa});
var yil=$("#yil");if(yil)yil.textContent=new Date().getFullYear();

/* Menü & arama */
$("#menu-ac").addEventListener("click",function(){$("#menu").classList.toggle("acik")});
$("#arama-ac").addEventListener("click",function(){var c=$("#arama-cubuk");c.classList.toggle("gizli");if(!c.classList.contains("gizli"))$("#q").focus()});

/* Ürün verisini çözümle */
function cozumle(html){
  var doc=new DOMParser().parseFromString("<div id='k'>"+(html||"")+"</div>","text/html");
  var k=doc.getElementById("k"); var u=k.querySelector(".so-urun");
  var resimler=$$("img",k).map(function(i){return i.getAttribute("src")}).filter(Boolean);
  if(!u)return {urun:false,resimler:resimler,metin:(k.textContent||"").trim()};
  var d=u.dataset; u.parentNode.removeChild(u);
  $$("img",k).forEach(function(i){var p=i.closest("a")||i;var s=p.parentNode;p.parentNode.removeChild(p);if(s&&s!==k&&!s.textContent.trim()&&!s.querySelector("img"))s.parentNode&&s.parentNode.removeChild(s)});
  var f=sayi(d.fiyat), e=sayi(d.eskiFiyat);
  return {urun:true,marka:d.marka||"",model:d.model||"",fiyat:f,eski:(e>f?e:NaN),paytr:(d.paytr||"").trim(),
    stok:(d.stok||"var").toLowerCase(),tur:(d.tur||"gunes").toLowerCase(),cinsiyet:d.cinsiyet||"",
    renk:d.renk||"",cerceve:d.cerceve||"",cerceveRenk:d.cerceveRenk||"",cam:d.cam||"",camRenk:d.camRenk||"",
    filtre:d.filtre||"",polarize:d.polarize||"",olcu:d.olcu||"",garanti:d.garanti||"",kutu:d.kutu||"",barkod:d.barkod||"",
    yeni:(d.yeni||"")==="evet",resimler:resimler,aciklama:k.innerHTML.trim()};
}
function indirimYuzde(u){return isFinite(u.eski)&&u.eski>u.fiyat?Math.round((1-u.fiyat/u.eski)*100):0}
function katlari(u){
  var c=norm(u.cinsiyet), r=[];
  if(u.tur==="optik")r.push("optik");
  if(c.indexOf("kadin")>-1)r.push("kadin");
  if(c.indexOf("erkek")>-1)r.push("erkek");
  if(c.indexOf("unisex")>-1)r.push("unisex","kadin","erkek");
  if(c.indexOf("cocuk")>-1)r.push("cocuk");
  if(indirimYuzde(u))r.push("indirim");
  return r;
}

/* Feed'den tüm yayınları çek */
function feedGetir(){
  var hepsi=[];
  function sayfa(bas){
    return fetch("/feeds/posts/default?alt=json&max-results=150&start-index="+bas).then(function(r){return r.json()}).then(function(j){
      var e=(j.feed&&j.feed.entry)||[];
      e.forEach(function(en){
        var url="";(en.link||[]).forEach(function(l){if(l.rel==="alternate")url=l.href});
        var html=(en.content&&en.content.$t)||(en.summary&&en.summary.$t)||"";
        var v=cozumle(html);
        v.baslik=en.title.$t; v.url=url; v.tarih=en.published.$t;
        v.etiketler=(en.category||[]).map(function(c){return c.term});
        if(!v.resimler.length&&en.media$thumbnail)v.resimler=[en.media$thumbnail.url.replace(/\/s72-c\//,"/s800/")];
        hepsi.push(v);
      });
      if(e.length===150)return sayfa(bas+150);
      return hepsi;
    });
  }
  return sayfa(1);
}

/* Satın alma penceresi */
var MODAL=$("#modal");
function satinAl(u){
  var var_=u.stok!=="yok";
  var ilkResim=kucult(u.resimler[0],300)||"";
  if(!AYAR.satisAktif){
    var adK=(u.marka+" "+u.model).trim();
    MODAL.innerHTML="<div class='modal-kutu'><div class='modal-ust'>"+(ilkResim?"<img alt='' src='"+esc(ilkResim)+"'/>":"")+
      "<div><p class='eyebrow'>"+esc(u.marka)+"</p><h3 id='modal-baslik'>"+esc(u.model||u.baslik)+"</h3><strong>"+tl(u.fiyat)+"</strong></div>"+
      "<button aria-label='Kapat' class='ikon-btn modal-kapat' data-kapat='1' type='button'><svg fill='none' stroke='currentColor' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24'><path d='M6 6l12 12M18 6L6 18'/></svg></button></div>"+
      "<div class='modal-ic'><div class='yakinda'><span class='yakinda-ik'><svg fill='none' stroke='currentColor' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24'><circle cx='12' cy='12' r='9'/><path d='M12 7v5l3 2'/></svg></span><div><b>Online satış çok yakında aktif</b><p>Güvenli ödeme altyapımızın kurulumu tamamlanmak üzere. Bu ürünü şimdilik WhatsApp'tan ya da mağazamızdan sipariş edebilirsiniz.</p></div></div>"+
      "<a class='btn btn-ana btn-tam' href='"+waLink("Merhaba, "+adK+" ("+tl(u.fiyat)+") sipariş vermek istiyorum. "+(u.url||location.href))+"' rel='noopener' target='_blank'>WhatsApp ile sipariş ver</a>"+
      "<button class='btn btn-cizgi btn-tam' data-kapat='1' style='margin-top:10px' type='button'>Alışverişe devam et</button></div></div>";
    MODAL.classList.remove("gizli");document.documentElement.style.overflow="hidden";
    return;
  }
  var odemeVar=!!u.paytr&&var_;
  var optikNot=u.tur==="optik"?"<p class='not' style='margin:0 0 14px'>Bu ürün <b>çerçevedir</b>. Numaralı cam için siparişinizden sonra reçetenizi WhatsApp'tan iletin; cam seçenekleri ve fiyatı için sizi arayalım.</p>":"";
  MODAL.innerHTML=
    "<div class='modal-kutu'>"+
      "<div class='modal-ust'>"+(ilkResim?"<img alt='' src='"+esc(ilkResim)+"'/>":"")+
        "<div><p class='eyebrow'>"+esc(u.marka)+"</p><h3 id='modal-baslik'>"+esc(u.model||u.baslik)+"</h3><strong>"+tl(u.fiyat)+"</strong></div>"+
        "<button aria-label='Kapat' class='ikon-btn modal-kapat' data-kapat='1' type='button'><svg fill='none' stroke='currentColor' stroke-linecap='round' stroke-width='2' viewBox='0 0 24 24'><path d='M6 6l12 12M18 6L6 18'/></svg></button>"+
      "</div>"+
      "<div class='modal-ic'>"+
        (!var_?"<p class='not' style='margin:0 0 14px'>Bu ürün şu an stokta yok. WhatsApp'tan yazın, gelince haber verelim.</p>":"")+
        optikNot+
        (odemeVar?
          "<p>Ödemenizi <b>PayTR güvenli ödeme sayfasında</b> yapacaksınız. Ad, adres ve iletişim bilgilerinizi orada girin; taksit seçenekleri kartınıza göre gösterilir.</p>"+
          "<label class='onay-kutu'><input id='onay' type='checkbox'/><span><a href='"+AYAR.onBilgi+"' target='_blank'>Ön Bilgilendirme Formu</a>'nu ve <a href='"+AYAR.sozlesme+"' target='_blank'>Mesafeli Satış Sözleşmesi</a>'ni okudum, onaylıyorum.</span></label>"+
          "<button class='btn btn-ana btn-tam' disabled='disabled' id='ode' type='button'>Güvenli ödemeye geç · "+tl(u.fiyat)+"</button>"+
          "<a class='btn btn-cizgi btn-tam' style='margin-top:10px' href='"+waLink("Merhaba, "+(u.marka+" "+u.model).trim()+" ("+tl(u.fiyat)+") hakkında bilgi almak istiyorum. "+(u.url||location.href))+"' rel='noopener' target='_blank'>Önce WhatsApp'tan soru sor</a>"+
          "<p class='guvenli'><svg fill='none' stroke='currentColor' stroke-width='2' viewBox='0 0 24 24'><rect height='10' rx='2' width='16' x='4' y='11'/><path d='M8 11V8a4 4 0 0 1 8 0v3'/></svg>256-bit SSL · Kart bilgileriniz Seçkin Optik'e iletilmez</p>"
        :
          "<p>Bu ürünü WhatsApp üzerinden sipariş edebilirsiniz. Size ödeme bağlantısını hemen gönderelim.</p>"+
          "<a class='btn btn-ana btn-tam' href='"+waLink("Merhaba, "+(u.marka+" "+u.model).trim()+" ("+tl(u.fiyat)+") sipariş vermek istiyorum. "+(u.url||location.href))+"' rel='noopener' target='_blank'>WhatsApp ile sipariş ver</a>"
        )+
      "</div>"+
    "</div>";
  MODAL.classList.remove("gizli"); document.documentElement.style.overflow="hidden";
  var onay=$("#onay",MODAL), ode=$("#ode",MODAL);
  if(onay&&ode){
    onay.addEventListener("change",function(){ode.disabled=!onay.checked});
    ode.addEventListener("click",function(){
      if(!onay.checked)return;
      try{if(window.gtag)gtag("event","begin_checkout",{currency:"TRY",value:u.fiyat,items:[{item_name:(u.marka+" "+u.model).trim()}]})}catch(e){}
      window.open(u.paytr,"_blank","noopener");
    });
  }
}
function modalKapat(){MODAL.classList.add("gizli");MODAL.innerHTML="";document.documentElement.style.overflow=""}
MODAL.addEventListener("click",function(e){if(e.target===MODAL||e.target.closest("[data-kapat]"))modalKapat()});
document.addEventListener("keydown",function(e){if(e.key==="Escape"&&!MODAL.classList.contains("gizli"))modalKapat()});

/* Ürün kartı */
function kart(u,i){
  var y=indirimYuzde(u), r1=kucult(u.resimler[0],600), r2=kucult(u.resimler[1],600);
  var rozet=u.stok==="yok"?"<span class='rozet tukendi'>Tükendi</span>":(y?"<span class='rozet'>%"+y+" indirim</span>":(u.yeni?"<span class='rozet yeni'>Yeni</span>":""));
  var ozet=[u.cinsiyet,u.tur==="optik"?"Optik çerçeve":"Güneş gözlüğü",u.cerceve].filter(Boolean).join(" · ");
  return "<article class='kart'>"+rozet+
    "<a aria-label='"+esc(u.baslik)+"' class='kart-gorsel"+(r2?" cift":"")+"' href='"+esc(u.url)+"'>"+(r1?"<img alt='"+esc(u.baslik)+"' loading='lazy' src='"+esc(r1)+"'/>":"")+(r2?"<img alt='' class='ikinci' loading='lazy' src='"+esc(r2)+"'/>":"")+"</a>"+
    "<div class='kart-govde'><p class='eyebrow'>"+esc(u.marka)+"</p><h3><a href='"+esc(u.url)+"'>"+esc(u.model||u.baslik)+"</a></h3><p class='ozet'>"+esc(ozet)+"</p>"+
    "<div class='fiyat'><strong>"+tl(u.fiyat)+"</strong>"+(isFinite(u.eski)?"<del>"+tl(u.eski)+"</del>":"")+"</div>"+
    "<div class='kart-aksiyon'><button class='btn btn-ana' data-al='"+i+"' type='button'>Satın al</button><a class='btn btn-cizgi' href='"+esc(u.url)+"'>İncele</a></div></div></article>";
}

/* ---------- LİSTE GÖRÜNÜMÜ ---------- */
function listeKur(hepsi){
  var urunler=hepsi.filter(function(v){return v.urun});
  var yazilar=hepsi.filter(function(v){return !v.urun});
  var D={kat:"tumu",marka:"",q:"",sira:"yeni",goster:AYAR.sayfaBasi};
  var path=decodeURIComponent(location.pathname), qs=new URLSearchParams(location.search);
  var m=path.match(/\/search\/label\/([^\/?]+)/);
  if(m){var et=m[1], k=ETIKET_KAT[et.toLocaleLowerCase("tr-TR")];
    if(k)D.kat=k; else D.marka=et;
  }
  if(qs.get("q"))D.q=qs.get("q");
  if(qs.get("kategori")&&KAT[qs.get("kategori")])D.kat=qs.get("kategori");

  /* başlık */
  var lb=$("#liste-baslik"), lu=$("#liste-ust");
  if(!B.classList.contains("v-ana")){
    if(D.q){lu.textContent="Arama";lb.textContent="“"+D.q+"” için sonuçlar"}
    else if(D.marka){lu.textContent="Marka";lb.textContent=D.marka+" gözlükleri"}
    else if(D.kat!=="tumu"){lu.textContent="Kategori";lb.textContent=KAT[D.kat]+(D.kat==="optik"?" çerçeveler":D.kat==="indirim"?" ürünler":" gözlükleri")}
    document.getElementById("koleksiyon").style.paddingTop="40px";
  }
  /* markalar */
  var markalar={};urunler.forEach(function(u){if(u.marka)markalar[u.marka]=(markalar[u.marka]||0)+1});
  var mlist=Object.keys(markalar).sort(function(a,b){return a.localeCompare(b,"tr")});
  var ms=$("#marka-sec");
  mlist.forEach(function(mk){var o=document.createElement("option");o.value=mk;o.textContent=mk+" ("+markalar[mk]+")";ms.appendChild(o)});
  if(D.marka){var var_=mlist.filter(function(x){return norm(x)===norm(D.marka)})[0];if(var_){D.marka=var_;ms.value=var_}}
  var mk=$("#markalar");
  if(mk)mk.innerHTML=mlist.map(function(x){return "<a href='/search/label/"+encodeURIComponent(x)+"'>"+esc(x)+"</a>"}).join("");
  /* kategori sayıları */
  $$("[data-say]").forEach(function(p){var k=p.getAttribute("data-say");var n=urunler.filter(function(u){return katlari(u).indexOf(k)>-1}).length;if(n)p.textContent=n+" model"});
  /* hero */
  var vitrin=urunler.filter(function(u){return u.resimler.length&&u.stok!=="yok"});
  vitrin.sort(function(a,b){return (b.yeni?1:0)-(a.yeni?1:0)||new Date(b.tarih)-new Date(a.tarih)});
  if(vitrin[0]){var v0=vitrin[0];$("#hero-sol").innerHTML="<img alt='"+esc(v0.baslik)+"' src='"+esc(kucult(v0.resimler[0],900))+"'/>";var he=$("#hero-etiket");he.href=v0.url;he.innerHTML="<small>"+esc(v0.marka)+"</small>"+esc(v0.model||v0.baslik)+"<span>"+tl(v0.fiyat)+"</span>";he.classList.remove("gizli")}
  /* rehber */
  if(yazilar.length&&B.classList.contains("v-ana")){
    $("#rehber-bolum").classList.remove("gizli");
    $("#rehber").innerHTML=yazilar.slice(0,3).map(function(y){return "<a class='rehber-kart' href='"+esc(y.url)+"'><div class='rg' style=\"background-image:url('"+esc(kucult(y.resimler[0],800)||"")+"')\"></div><div class='ic'><p class='eyebrow'>Rehber</p><h3>"+esc(y.baslik)+"</h3></div></a>"}).join("");
  }
  /* ara kutusu */
  var fa=$("#filtre-ara"); fa.value=D.q;
  $$(".cip").forEach(function(c){c.classList.toggle("aktif",c.getAttribute("data-kat")===D.kat)});
  $$(".menu a[data-kat]").forEach(function(a){a.classList.toggle("aktif",a.getAttribute("data-kat")===D.kat&&!B.classList.contains("v-ana"))});

  var gorunen=[];
  function ciz(){
    var q=norm(D.q);
    gorunen=urunler.filter(function(u){
      if(D.kat!=="tumu"&&katlari(u).indexOf(D.kat)<0)return false;
      if(D.marka&&u.marka!==D.marka)return false;
      if(q&&norm([u.baslik,u.marka,u.model,u.renk,u.camRenk,u.cerceve,u.etiketler.join(" ")].join(" ")).indexOf(q)<0)return false;
      return true;
    });
    gorunen.sort(function(a,b){
      if(D.sira==="artan")return a.fiyat-b.fiyat;
      if(D.sira==="azalan")return b.fiyat-a.fiyat;
      if(D.sira==="indirim")return indirimYuzde(b)-indirimYuzde(a);
      return (a.stok==="yok")-(b.stok==="yok")||new Date(b.tarih)-new Date(a.tarih);
    });
    var g=$("#urunler");
    if(!gorunen.length){g.innerHTML="<div class='bos-durum'><p><b>Aradığınız modeli bulamadık.</b></p><p>Model kodunu WhatsApp'tan gönderin, stok ve fiyat bilgisini hemen iletelim.</p><a class='btn btn-bogaz' href='"+waLink("Merhaba, şu modeli arıyorum: "+D.q)+"' rel='noopener' target='_blank'>WhatsApp'tan sor</a></div>"}
    else g.innerHTML=gorunen.slice(0,D.goster).map(function(u,i){return kart(u,i)}).join("");
    $("#sonuc-bilgi").textContent=gorunen.length+" ürün"+(D.kat!=="tumu"?" · "+KAT[D.kat]:"")+(D.marka?" · "+D.marka:"");
    $("#daha").classList.toggle("gizli",gorunen.length<=D.goster);
  }
  $("#urunler").addEventListener("click",function(e){var b=e.target.closest("[data-al]");if(b)satinAl(gorunen[+b.getAttribute("data-al")])});
  $("#cipler").addEventListener("click",function(e){var c=e.target.closest(".cip");if(!c)return;D.kat=c.getAttribute("data-kat");D.goster=AYAR.sayfaBasi;$$(".cip").forEach(function(x){x.classList.toggle("aktif",x===c)});ciz()});
  ms.addEventListener("change",function(){D.marka=ms.value;D.goster=AYAR.sayfaBasi;ciz()});
  $("#sira-sec").addEventListener("change",function(e){D.sira=e.target.value;ciz()});
  var t;fa.addEventListener("input",function(){clearTimeout(t);t=setTimeout(function(){D.q=fa.value;D.goster=AYAR.sayfaBasi;ciz()},180)});
  $("#daha-btn").addEventListener("click",function(){D.goster+=AYAR.sayfaBasi;ciz()});
  ciz();
}

/* ---------- ÜRÜN SAYFASI ---------- */
function urunSayfa(){
  var govde=$("#so-govde"); if(!govde)return;
  var u=cozumle(govde.innerHTML);
  if(!u.urun){ /* normal sayfa veya rehber yazısı */
    var yol=$("#so-yol"); if(yol&&B.classList.contains("v-sayfa"))yol.innerHTML="<a href='/'>Ana sayfa</a><span>/</span><span>"+esc($("#so-baslik").textContent)+"</span>";
    return false;
  }
  u.baslik=$("#so-baslik").textContent.trim(); u.url=location.href.split("?")[0].split("#")[0];
  u.etiketler=$$("#so-etiketler span").map(function(s){return s.textContent});
  B.classList.add("urun-var");
  var y=indirimYuzde(u), var_=u.stok!=="yok";
  var olcu=(u.olcu||"").split(/[-\/ ]+/).filter(Boolean);
  var satir=function(k,v){return v?"<tr><th>"+k+"</th><td>"+esc(v)+"</td></tr>":""};
  var anaKat=katlari(u)[0];
  var art=$("#so-yazi");
  art.className="";
  art.innerHTML=
    "<nav class='yol'><a href='/'>Ana sayfa</a><span>/</span>"+(anaKat&&KAT[anaKat]?"<a href='/?kategori="+anaKat+"#koleksiyon'>"+KAT[anaKat]+"</a><span>/</span>":"")+(u.marka?"<a href='/search/label/"+encodeURIComponent(u.marka)+"'>"+esc(u.marka)+"</a><span>/</span>":"")+"<span>"+esc(u.model||u.baslik)+"</span></nav>"+
    "<div class='urun-sayfa'>"+
      "<div><div class='galeri-ana' id='g-ana'>"+(y?"<span class='rozet'>%"+y+" indirim</span>":"")+"<img alt='"+esc(u.baslik)+"' src='"+esc(kucult(u.resimler[0],1200)||"")+"'/></div>"+
        (u.resimler.length>1?"<div class='galeri-kucuk' id='g-kucuk'>"+u.resimler.map(function(r,i){return "<button class='"+(i?"":"aktif")+"' data-i='"+i+"' type='button' aria-label='Görsel "+(i+1)+"'><img alt='' loading='lazy' src='"+esc(kucult(r,200))+"'/></button>"}).join("")+"</div>":"")+
      "</div>"+
      "<div class='urun-bilgi'>"+
        "<p class='eyebrow'>"+esc(u.marka)+(u.tur==="optik"?" · Optik çerçeve":" · Güneş gözlüğü")+"</p>"+
        "<h1>"+esc(u.baslik)+"</h1>"+
        "<p class='urun-kod'>"+esc(u.model)+(u.barkod?" · Barkod "+esc(u.barkod):"")+"</p>"+
        "<div class='urun-fiyat'><strong>"+tl(u.fiyat)+"</strong>"+(isFinite(u.eski)?"<del>"+tl(u.eski)+"</del><span class='ind'>%"+y+"</span>":"")+"<small>KDV dahil · Kartınıza göre taksit seçenekleri ödeme sayfasında</small></div>"+
        "<div class='stok"+(var_?"":" yok")+"'>"+(var_?"Stokta · Aynı gün kargoda":"Şu an stokta yok")+"</div>"+
        (u.tur==="optik"?"<div class='not'><b>Numaralı cam mı istiyorsunuz?</b> Çerçeveyi satın aldıktan sonra reçetenizi WhatsApp'tan gönderin; cam seçeneklerini ve fiyatını optisyenimiz size iletsin.</div>":"")+
        "<div class='urun-btnler'>"+
          "<button class='btn btn-ana' id='satin-al' type='button'>"+(var_?((u.paytr||!AYAR.satisAktif)?"Satın al":"WhatsApp ile sipariş ver"):"Gelince haber ver")+"</button>"+
          "<a class='btn btn-cizgi' href='"+waLink("Merhaba, "+(u.marka+" "+u.model).trim()+" hakkında bilgi almak istiyorum. "+u.url)+"' rel='noopener' target='_blank'>Optisyene sor (WhatsApp)</a>"+
        "</div>"+
        "<ul class='vaatler'>"+
          "<li><svg fill='none' stroke='currentColor' stroke-width='1.8' viewBox='0 0 24 24'><path d='M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6z'/><path d='M8.5 12l2.5 2.5 4.5-5'/></svg>%100 orijinal, faturalı</li>"+
          "<li><svg fill='none' stroke='currentColor' stroke-width='1.8' viewBox='0 0 24 24'><path d='M3 7h11v9H3zM14 10h4l3 3v3h-7z'/><circle cx='7' cy='17.5' r='1.8'/><circle cx='17' cy='17.5' r='1.8'/></svg>Aynı gün ücretsiz kargo</li>"+
          "<li><svg fill='none' stroke='currentColor' stroke-width='1.8' viewBox='0 0 24 24'><path d='M4 12a8 8 0 1 0 2.3-5.7M4 4v4h4'/></svg>14 gün içinde iade</li>"+
          "<li><svg fill='none' stroke='currentColor' stroke-width='1.8' viewBox='0 0 24 24'><rect height='14' rx='2' width='20' x='2' y='5'/><path d='M2 10h20'/></svg>"+esc(u.garanti||"2 yıl")+" garanti</li>"+
        "</ul>"+
        "<table class='ozellik'><tbody>"+
          satir("Marka",u.marka)+satir("Model",u.model)+satir("Cinsiyet",u.cinsiyet)+satir("Renk",u.renk)+satir("Çerçeve",u.cerceve)+satir("Çerçeve rengi",u.cerceveRenk)+
          satir("Cam",u.cam)+satir("Cam rengi",u.camRenk)+satir("Polarize",u.polarize)+satir("Filtre",u.filtre)+satir("Kutu içeriği",u.kutu||"Orijinal kılıf + temizleme bezi")+
        "</tbody></table>"+
        (olcu.length>=2?"<div class='olcu-sema'><div><b>"+esc(olcu[0])+"</b><span>Ekartman (mm)</span></div><div><b>"+esc(olcu[1])+"</b><span>Köprü (mm)</span></div>"+(olcu[2]?"<div><b>"+esc(olcu[2])+"</b><span>Sap (mm)</span></div>":"")+"</div>":"")+
        (u.aciklama?"<div class='aciklama'>"+u.aciklama+"</div>":"")+
      "</div>"+
    "</div>"+
    "<section class='bolum gizli' id='benzer-bolum' style='padding-top:16px'><div class='bolum-bas'><div><p class='eyebrow'>Bunlara da bakın</p><h2>Benzer modeller</h2></div></div><div class='urunler' id='benzer'></div></section>";

  /* galeri */
  var ana=$("#g-ana");
  var gk=$("#g-kucuk");if(gk)gk.addEventListener("click",function(e){var b=e.target.closest("button");if(!b)return;$$("button",gk).forEach(function(x){x.classList.toggle("aktif",x===b)});$("img",ana).src=kucult(u.resimler[+b.getAttribute("data-i")],1200)});
  ana.addEventListener("click",function(){ana.classList.toggle("zoom")});
  ana.addEventListener("mousemove",function(e){if(!ana.classList.contains("zoom"))return;var r=ana.getBoundingClientRect();$("img",ana).style.transformOrigin=((e.clientX-r.left)/r.width*100)+"% "+((e.clientY-r.top)/r.height*100)+"%"});
  /* satın al */
  $("#satin-al").addEventListener("click",function(){
    if(!var_){location.href=waLink("Merhaba, "+(u.marka+" "+u.model).trim()+" stoğa gelince haber verir misiniz? "+u.url);return}
    satinAl(u);
  });
  var mob=$("#mobil-al");
  mob.innerHTML="<div><strong>"+tl(u.fiyat)+"</strong>"+(isFinite(u.eski)?"<del>"+tl(u.eski)+"</del>":"")+"</div><button class='btn btn-ana' type='button'>"+(var_?"Satın al":"Haber ver")+"</button>";
  mob.classList.remove("gizli");
  $("button",mob).addEventListener("click",function(){$("#satin-al").click()});
  /* başlık etiketi + yapılandırılmış veri */
  document.title=(u.marka?u.marka+" ":"")+(u.model||u.baslik)+" | "+tl(u.fiyat)+" | Seçkin Optik";
  var ld={"@context":"https://schema.org","@type":"Product",name:u.baslik,image:u.resimler,brand:{"@type":"Brand",name:u.marka},sku:u.model,gtin13:u.barkod||undefined,
    offers:{"@type":"Offer",priceCurrency:"TRY",price:isFinite(u.fiyat)?u.fiyat.toFixed(2):undefined,availability:var_?"https://schema.org/InStock":"https://schema.org/OutOfStock",url:u.url,
      seller:{"@type":"Organization",name:"Seçkin Optik"},shippingDetails:{"@type":"OfferShippingDetails",shippingRate:{"@type":"MonetaryAmount",value:"0",currency:"TRY"},shippingDestination:{"@type":"DefinedRegion",addressCountry:"TR"}}}};
  var s=document.createElement("script");s.type="application/ld+json";s.textContent=JSON.stringify(ld);document.head.appendChild(s);
  return u;
}

function benzerKur(hepsi,u){
  var adaylar=hepsi.filter(function(v){return v.urun&&v.url.split("?")[0]!==u.url&&v.stok!=="yok"});
  var kat=katlari(u);
  adaylar.forEach(function(v){v._p=(v.marka===u.marka?3:0)+(v.tur===u.tur?2:0)+katlari(v).filter(function(k){return kat.indexOf(k)>-1}).length+(Math.abs(v.fiyat-u.fiyat)<u.fiyat*.4?1:0)});
  adaylar.sort(function(a,b){return b._p-a._p});
  var sec=adaylar.slice(0,4); if(!sec.length)return;
  $("#benzer-bolum").classList.remove("gizli");
  var g=$("#benzer");g.innerHTML=sec.map(function(v,i){return kart(v,i)}).join("");
  g.addEventListener("click",function(e){var b=e.target.closest("[data-al]");if(b)satinAl(sec[+b.getAttribute("data-al")])});
}

/* ---------- BAŞLAT ---------- */
var tekil=B.classList.contains("v-tekil");
function yolEsle(u){try{return new URL(u,location.href).pathname}catch(e){return u}}
function sayfaYaz(baslik,html,etk){var kap=$(".sadece-tekil");if(!kap)return;kap.insertAdjacentHTML("afterbegin","<article class='yazi' id='so-yazi'><nav class='yol' id='so-yol'><a href='/'>Ana sayfa</a><span>/</span><span>"+esc(baslik)+"</span></nav><h1 id='so-baslik'>"+esc(baslik)+"</h1><div class='yazi-govde' id='so-govde'>"+html+"</div><div hidden='hidden' id='so-etiketler'>"+(etk||[]).map(function(e){return "<span>"+esc(e)+"</span>"}).join("")+"</div></article>")}
function hataYaz(){var si=$("#sonuc-bilgi");if(si)si.textContent="Ürünler yüklenemedi. Sayfayı yenileyin."}
function basla(){if(!tekil){feedGetir().then(listeKur).catch(hataYaz);return}var aktif=urunSayfa();if(aktif)feedGetir().then(function(h){benzerKur(h,aktif)}).catch(function(){})}
if(tekil&&!$("#so-govde")){var sayfaMi=B.classList.contains("v-sayfa");fetch((sayfaMi?"/feeds/pages/default":"/feeds/posts/default")+"?alt=json&max-results=150").then(function(r){return r.json()}).then(function(j){var p=location.pathname,bul=null;((j.feed&&j.feed.entry)||[]).forEach(function(en){(en.link||[]).forEach(function(l){if(l.rel==="alternate"&&yolEsle(l.href)===p)bul=en})});if(bul)sayfaYaz(bul.title.$t,(bul.content&&bul.content.$t)||"",(bul.category||[]).map(function(c){return c.term}));basla()}).catch(basla)}else basla();
})();
