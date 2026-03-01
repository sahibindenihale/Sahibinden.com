const fmt = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 });
function tl(n){ return fmt.format(n) + " TL"; }

async function loadJSON(path){
  // Prototipte JSON dosyaları okunuyordu. Artık backend API kullanıyoruz.
  const map = (p)=>{
    // site
    if(p === 'data/auctions.json') return '/api/auctions';
    if(p === 'data/settings.json') return '/api/settings';
    // admin sayfaları ../site/data/.. çağırıyordu
    if(p === '../site/data/auctions.json') return '/api/auctions';
    if(p === '../site/data/settings.json') return '/api/settings';
    return p;
  };
  const url = map(path);
  const res = await fetch(url, {cache:"no-store"});
  if(!res.ok) throw new Error("Veri okunamadı: " + url);
  return await res.json();
}

function qs(sel, el=document){ return el.querySelector(sel); }
function qsa(sel, el=document){ return Array.from(el.querySelectorAll(sel)); }

function waLink(number, text){
  const clean = String(number||"").replace(/\D/g,'');
  const msg = encodeURIComponent(text || "Merhaba, destek almak istiyorum.");
  return `https://wa.me/${clean}?text=${msg}`;
}

function pad2(x){ return String(x).padStart(2,'0'); }
function countdown(iso){
  const end = new Date(iso).getTime();
  const now = Date.now();
  const diff = Math.max(0, end-now);
  const s = Math.floor(diff/1000);
  const hh = Math.floor(s/3600);
  const mm = Math.floor((s%3600)/60);
  const ss = s%60;
  return `${pad2(hh)}:${pad2(mm)}:${pad2(ss)}`;
}

function setThemeFromSettings(settings){
  const r = document.documentElement;
  if(settings?.brand?.primaryBlue) r.style.setProperty('--blue', settings.brand.primaryBlue);
  if(settings?.brand?.primaryYellow) r.style.setProperty('--yellow', settings.brand.primaryYellow);
}