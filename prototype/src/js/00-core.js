/* ============================================================
   Núcleo: utilitários, dicas, avisos. Sem nada específico de um cliente.
   ============================================================ */
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const RM=matchMedia("(prefers-reduced-motion: reduce)").matches;
const nf=(n,d=0)=>new Intl.NumberFormat("pt-PT",{minimumFractionDigits:d,maximumFractionDigits:d}).format(n);
const sgn=(n,d=0)=>(n>0?"+":n<0?"−":"")+nf(Math.abs(n),d);
const sum=a=>a.reduce((x,y)=>x+(y||0),0);
const mean=a=>a.length?sum(a)/a.length:0;
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const range=(a,z)=>Array.from({length:Math.max(0,z-a+1)},(_,i)=>a+i);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const MES=["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"];
const eur=v=>v>=1e6?nf(v/1e6,2)+" M€":v>=1e3?nf(v/1e3,v>=1e5?0:1)+" mil €":nf(v)+" €";
const slug=s=>s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");

/* ---------- Dicas (tooltips) e avisos ---------- */
const tip=$("#tip");
function placeTip(el){const r=el.getBoundingClientRect(),w=tip.offsetWidth,h=tip.offsetHeight;let x=Math.min(Math.max(8,r.left+r.width/2-w/2),innerWidth-w-8),y=r.top-h-8;if(y<8)y=r.bottom+8;tip.style.left=x+"px";tip.style.top=y+"px"}
function showTip(el){const html=el.dataset.tip||(el.dataset.src?srcTip(el.dataset.src):"");if(!html)return;tip.innerHTML=html;tip.classList.add("on");placeTip(el)}
document.addEventListener("pointerover",e=>{const el=e.target.closest("[data-tip],[data-src]");if(el&&e.pointerType!=="touch")showTip(el)});
document.addEventListener("pointerout",e=>{if(e.target.closest("[data-tip],[data-src]"))tip.classList.remove("on")});
document.addEventListener("focusin",e=>{const el=e.target.closest&&e.target.closest("[data-tip],[data-src]");if(el)showTip(el)});
document.addEventListener("focusout",()=>tip.classList.remove("on"));
let toastT;
function toast(msg){const t=$("#toast");t.textContent=msg;t.classList.add("on");clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove("on"),3600)}

/* ---------- Curvas suaves para linhas ---------- */
function smooth(p){if(p.length<2)return`M${p[0][0].toFixed(1)},${p[0][1].toFixed(1)}`;let d=`M${p[0][0].toFixed(1)},${p[0][1].toFixed(1)}`;for(let i=0;i<p.length-1;i++){const a=p[i-1]||p[i],b=p[i],c=p[i+1],e=p[i+2]||c,t=.16;d+=`C${(b[0]+(c[0]-a[0])*t).toFixed(1)},${(b[1]+(c[1]-a[1])*t).toFixed(1)} ${(c[0]-(e[0]-b[0])*t).toFixed(1)},${(c[1]-(e[1]-b[1])*t).toFixed(1)} ${c[0].toFixed(1)},${c[1].toFixed(1)}`}return d}

/* ---------- Contadores animados (só quando o movimento não está reduzido) ---------- */
function counters(root){$$("[data-count]",root).forEach(el=>{const to=parseFloat(el.dataset.count),d=+(el.dataset.dec||0),suf=el.dataset.suf||"",pre=el.dataset.pre||"";const set=v=>el.textContent=pre+nf(v,d)+suf;if(RM||isNaN(to)){set(isNaN(to)?0:to);return}const t0=performance.now(),dur=900;(function f(t){const p=Math.min(1,(t-t0)/dur),e=1-Math.pow(1-p,3);set(to*e);if(p<1)requestAnimationFrame(f)})(t0)})}

/* ---------- Temas (tokens) e contraste AA ---------- */
const h2r=h=>{h=h.replace("#","");return[0,2,4].map(i=>parseInt(h.slice(i,i+2),16))};
const r2h=a=>"#"+a.map(v=>Math.round(v).toString(16).padStart(2,"0")).join("");
const lum=a=>{const f=c=>{c/=255;return c<=.03928?c/12.92:Math.pow((c+.055)/1.055,2.4)};return .2126*f(a[0])+.7152*f(a[1])+.0722*f(a[2])};
const cr=(a,b)=>{const x=lum(a),y=lum(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
function ensureAA(hex){const c=h2r(hex),w=[255,255,255],before=cr(c,w);let k=0,cur=c;while(cr(cur,w)<4.5&&k<60){k++;cur=c.map(v=>v*(1-k*.02))}return{hex:r2h(cur),before,after:cr(cur,w)}}
