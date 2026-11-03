import w, { _test } from "./worker.js";
import crypto from "node:crypto";
const env = { MERCHANT_ID:"123456", MERCHANT_KEY:"anahtarKEY", MERCHANT_SALT:"tuzSALT", SITE:"https://seckin-optik.blogspot.com", IZINLI_KOKENLER:"https://seckin-optik.blogspot.com", TEST_MODE:"1" };
const store=new Map(); env.SIPARISLER={get:async(k,t)=>store.has(k)?JSON.parse(store.get(k)):null, put:async(k,v)=>store.set(k,v)};
const ctx={waitUntil:p=>p};
let gonderilen=null;
const feed={feed:{entry:[
 {title:{$t:"Prada"},link:[{rel:"alternate",href:"https://seckin-optik.blogspot.com/2026/11/prada.html"}],content:{$t:'<div class="so-urun" data-marka="Prada" data-model="PR A01S" data-fiyat="16416" data-stok="var"></div><img src="x">'}},
 {title:{$t:"Vogue"},link:[{rel:"alternate",href:"https://seckin-optik.blogspot.com/2026/11/vogue.html"}],content:{$t:'<div class="so-urun" data-marka="Vogue" data-model="VJ2015 &amp; Ç" data-fiyat="1.200,50" data-stok="var"></div>'}},
 {title:{$t:"Yok"},link:[{rel:"alternate",href:"https://seckin-optik.blogspot.com/2026/11/yok.html"}],content:{$t:'<div class="so-urun" data-marka="X" data-model="Y" data-fiyat="100" data-stok="yok"></div>'}}
]}};
globalThis.fetch=async(url,opt)=>{
  if(String(url).includes("/feeds/posts/default")) return new Response(JSON.stringify(feed));
  if(String(url).includes("get-token")){ gonderilen=Object.fromEntries(new URLSearchParams(opt.body)); return new Response(JSON.stringify({status:"success",token:"TOKEN123"})); }
  throw new Error("beklenmeyen "+url);
};
const req=(path,body,origin="https://seckin-optik.blogspot.com")=>new Request("https://w.example"+path,{method:"POST",headers:{"Content-Type":"application/json",Origin:origin,"CF-Connecting-IP":"85.1.2.3"},body:JSON.stringify(body)});
const musteri={ad:"Ayşe Yılmaz",telefon:"0532 111 22 33",eposta:"ayse@ornek.com",il:"Çanakkale",ilce:"Merkez",adres:"Cumhuriyet Mah. Atatürk Cad. No:5 D:3",faturaTuru:"bireysel"};
let ok=0,fail=0; const t=(ad,c)=>{c?ok++:fail++;console.log((c?"✓ ":"✗ ")+ad)};

// 1) başarılı başlatma, fiyat siteden
let r=await w.fetch(req("/odeme-baslat",{sepet:[{url:"https://seckin-optik.blogspot.com/2026/11/prada.html",adet:2},{url:"/2026/11/vogue.html?m=1",adet:1}],musteri}),env,ctx);
let j=await r.json(); t("başlatma 200 + token",r.status===200&&j.token==="TOKEN123");
t("tutar sitedeki fiyatla (16416*2+1200.50)", gonderilen.payment_amount==="3403250");
t("telefon normalize", gonderilen.user_phone==="05321112233");
const sepet=JSON.parse(Buffer.from(gonderilen.user_basket,"base64").toString("utf8"));
t("sepet base64 + Türkçe karakter", sepet[1][0]==="Vogue VJ2015 & Ç" && sepet[0][1]==="16416.00" && sepet[0][2]===2);
const hs=env.MERCHANT_ID+"85.1.2.3"+gonderilen.merchant_oid+"ayse@ornek.com"+"3403250"+gonderilen.user_basket+"00TL1";
const beklenen=crypto.createHmac("sha256",env.MERCHANT_KEY).update(hs+env.MERCHANT_SALT).digest("base64");
t("paytr_token PayTR formülüyle aynı", gonderilen.paytr_token===beklenen);
t("merchant_oid alfanümerik", /^[A-Z0-9]+$/.test(gonderilen.merchant_oid));
t("ok/fail url", gonderilen.merchant_ok_url.endsWith("/p/odeme-basarili.html"));
t("CORS başlığı", r.headers.get("Access-Control-Allow-Origin")==="https://seckin-optik.blogspot.com");
t("KV kaydı odeme-bekliyor", JSON.parse(store.get(j.siparisNo)).durum==="odeme-bekliyor");

// 2) manipüle edilmiş fiyat etkisiz (istemci fiyat gönderse de)
r=await w.fetch(req("/odeme-baslat",{sepet:[{url:"/2026/11/prada.html",adet:1,fiyat:1}],musteri}),env,ctx); await r.json();
t("istemci fiyatı yok sayılır", gonderilen.payment_amount==="1641600");
// 3) adet sınırı
r=await w.fetch(req("/odeme-baslat",{sepet:[{url:"/2026/11/prada.html",adet:99}],musteri}),env,ctx); await r.json();
t("adet en fazla 5", JSON.parse(Buffer.from(gonderilen.user_basket,"base64").toString())[0][2]===5);
// 4) stok yok
r=await w.fetch(req("/odeme-baslat",{sepet:[{url:"/2026/11/yok.html",adet:1}],musteri}),env,ctx);
t("stokta olmayan 409", r.status===409);
// 5) bilinmeyen ürün
r=await w.fetch(req("/odeme-baslat",{sepet:[{url:"/2026/11/olmayan.html",adet:1}],musteri}),env,ctx);
t("bilinmeyen ürün 409", r.status===409);
// 6) yanlış köken
r=await w.fetch(req("/odeme-baslat",{sepet:[{url:"/2026/11/prada.html",adet:1}],musteri},"https://kotu.site"),env,ctx);
t("izinsiz köken 403", r.status===403);
// 7) eksik müşteri
r=await w.fetch(req("/odeme-baslat",{sepet:[{url:"/2026/11/prada.html",adet:1}],musteri:{...musteri,telefon:"123"}}),env,ctx);
t("geçersiz telefon 400", r.status===400);

// 8) bildirim: doğru hash
const oid=j.siparisNo, toplamKurus="3403250";
const h=crypto.createHmac("sha256",env.MERCHANT_KEY).update(oid+env.MERCHANT_SALT+"success"+toplamKurus).digest("base64");
const bf=(o)=>new Request("https://w.example/paytr-bildirim",{method:"POST",body:new URLSearchParams(o)});
r=await w.fetch(bf({merchant_oid:oid,status:"success",total_amount:toplamKurus,hash:h,payment_type:"card"}),env,ctx);
t("bildirim OK", (await r.text())==="OK" && JSON.parse(store.get(oid)).durum==="odendi");
// 9) tekrar eden bildirim
r=await w.fetch(bf({merchant_oid:oid,status:"success",total_amount:toplamKurus,hash:h}),env,ctx);
t("tekrar eden bildirim OK", (await r.text())==="OK");
// 10) sahte hash
r=await w.fetch(bf({merchant_oid:oid,status:"success",total_amount:"1",hash:"sahte"}),env,ctx);
t("sahte hash reddedilir", r.status===400);
console.log(`\n${ok} geçti, ${fail} kaldı`);
