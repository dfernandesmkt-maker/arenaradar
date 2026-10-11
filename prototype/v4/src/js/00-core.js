/* ============================================================
   Arena Radar v4 — núcleo: utilitários, datas, dicas, avisos e memória local.
   Nada aqui é específico de um cliente: os dados vêm de DATA (data/v4/*.json).
   ============================================================ */
const EM_ARTEFACTO={{EM_ARTEFACTO}};
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const RM=matchMedia("(prefers-reduced-motion: reduce)").matches;
const nf=(n,d=0)=>new Intl.NumberFormat("pt-PT",{minimumFractionDigits:d,maximumFractionDigits:d,useGrouping:"always"}).format(n);
const sgn=(n,d=0)=>(n>0?"+":n<0?"−":"")+nf(Math.abs(n),d);
const sum=a=>a.reduce((x,y)=>x+(y||0),0);
const mean=a=>a.length?sum(a)/a.length:0;
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const range=(a,z)=>Array.from({length:Math.max(0,z-a+1)},(_,i)=>a+i);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const eur=v=>v>=1e6?nf(v/1e6,1)+" M€":v>=1e3?nf(v/1e3,0)+" mil €":nf(v)+" €";
const lista=a=>a.length<2?(a[0]||""):a.slice(0,-1).join(", ")+" e "+a[a.length-1];
const MES=["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"];
const DIA=24*3600*1000;

/* ---------- datas (semanas a partir do início do histórico) ---------- */
const pd=s=>{const [y,m,d]=s.split("-").map(Number);return new Date(Date.UTC(y,m-1,d))};
let CAL=null;                                     // calendário do cliente ativo
const wDate=i=>new Date(pd(CAL.inicio).getTime()+i*7*DIA);
const fD=d=>`${d.getUTCDate()} ${MES[d.getUTCMonth()]}`;
const fDY=d=>`${d.getUTCDate()} ${MES[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
const wLab=i=>fD(wDate(i));
const wRange=i=>{const a=wDate(i),b=new Date(a.getTime()+6*DIA);return a.getUTCMonth()===b.getUTCMonth()?`${a.getUTCDate()} a ${fD(b)}`:`${fD(a)} a ${fD(b)}`};
function quando(iso){const d=pd(iso),h=pd(CAL.hoje),n=Math.round((h-d)/DIA);return n<=0?"hoje":n===1?"ontem":n<7?`há ${n} dias`:n<14?"há 1 semana":n<60?`há ${Math.round(n/7)} semanas`:fDY(d)}

/* ---------- dicas e avisos ---------- */
const tip=$("#tip");
function placeTip(el){const r=el.getBoundingClientRect(),w=tip.offsetWidth,h=tip.offsetHeight;tip.style.left=Math.min(Math.max(8,r.left+r.width/2-w/2),innerWidth-w-8)+"px";let y=r.top-h-8;if(y<8)y=r.bottom+8;tip.style.top=y+"px"}
document.addEventListener("pointerover",e=>{const el=e.target.closest("[data-tip]");if(el&&e.pointerType!=="touch"){tip.innerHTML=el.dataset.tip;tip.classList.add("on");placeTip(el)}});
document.addEventListener("pointerout",e=>{if(e.target.closest("[data-tip]"))tip.classList.remove("on")});
document.addEventListener("focusin",e=>{const el=e.target.closest&&e.target.closest("[data-tip]");if(el){tip.innerHTML=el.dataset.tip;tip.classList.add("on");placeTip(el)}});
document.addEventListener("focusout",()=>tip.classList.remove("on"));
let toastT;
function toast(m){const t=$("#toast");t.textContent=m;t.classList.add("on");clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove("on"),3600)}

/* ---------- memória local (decisões da equipa nesta demonstração) ----------
   LIGAÇÃO[persistencia-equipa]: na versão ligada as decisões ficam numa base partilhada pela equipa (RB-22). */
const KEY="radar-v4";
let MEM={resp:{},vistos:{},modo:null};
try{MEM=Object.assign(MEM,JSON.parse(localStorage.getItem(KEY)||"{}"))}catch(e){}
const saveMem=()=>{try{localStorage.setItem(KEY,JSON.stringify(MEM))}catch(e){}};

/* ---------- curvas suaves ---------- */
function smooth(p){let d=`M${p[0][0].toFixed(1)},${p[0][1].toFixed(1)}`;for(let i=0;i<p.length-1;i++){const a=p[i-1]||p[i],b=p[i],c=p[i+1],e=p[i+2]||c,t=.16;d+=`C${(b[0]+(c[0]-a[0])*t).toFixed(1)},${(b[1]+(c[1]-a[1])*t).toFixed(1)} ${(c[0]-(e[0]-b[0])*t).toFixed(1)},${(c[1]-(e[1]-b[1])*t).toFixed(1)} ${c[0].toFixed(1)},${c[1].toFixed(1)}`}return d}

/* ---------- contadores ---------- */
function counters(root){$$("[data-count]",root).forEach(el=>{const to=+el.dataset.count,d=+(el.dataset.dec||0),suf=el.dataset.suf||"";if(RM){el.textContent=nf(to,d)+suf;return}const t0=performance.now();const f=t=>{const k=Math.min(1,(t-t0)/700),e=1-Math.pow(1-k,3);el.textContent=nf(to*e,d)+suf;if(k<1)requestAnimationFrame(f)};requestAnimationFrame(f)})}
