/* ============================================================
   Concorrência (vertical Energia): modelo demo, gráficos, filtros e separadores.
   Todos os dados são simulados (origem: demo) e usam marcas fictícias.
   Em produção, cada série vem de um módulo de Fontes de dados.
   LIGAÇÃO[meta-ad-library] LIGAÇÃO[google-ads-transparency] LIGAÇÃO[tiktok-ad-library] LIGAÇÃO[marktest-adcheck]:
   os blocos CR (criativos), AD/NA (anúncios ativos e novos) e PC (investimento por plataforma) são gerados aqui.
   Para ligar uma fonte real, substituir o gerador por dados lidos de data/processed/<cliente>.json
   (contrato de dados e responsáveis em docs/09-pontos-de-ligacao.md).
   ============================================================ */
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const MW=26, WB=13, mLab=i=>wLab(WB+i);
// LIGAÇÃO[marktest-adcheck] PC = investimento de referência por plataforma (hoje fixo). Fonte real: ad intelligence licenciada.
const PL=["Meta","Google","YouTube","TikTok"], PW={Meta:1,Google:.9,YouTube:1.15,TikTok:.8}, PC={Meta:420,Google:360,YouTube:540,TikTok:300};
const FM=["Vídeo","Imagem","Carrossel","Texto"], TH=["Preço","Sustentabilidade","Simplicidade","App e inovação","Família"];
const RAMP=["var(--r1)","var(--r2)","var(--r3)","var(--r4)"];
const EN=[
 {id:"lumio",n:"Lumio",me:true,inc:true,c:"var(--brand-ink)",k:1},
 {id:"aurea",n:"Aurea",inc:true,c:"var(--c2)",k:1.15},
 {id:"voltix",n:"Voltix",inc:true,c:"var(--c3)",k:.95},
 {id:"helio",n:"Helio",inc:true,c:"var(--c4)",k:.8},
 {id:"zenit",n:"Zenit",inc:false,sug:true,ov:73,c:"var(--c5)",k:1.3}];
const ebyid=id=>EN.find(e=>e.id===id);
const FL=[
 {b:"lumio",n:"Tarifa Fixa 12M",s:2,e:11,pl:["Meta","Google"],th:0,int:9},
 {b:"lumio",n:"Painéis Solares Casa",s:14,e:25,pl:["Meta","YouTube","Google"],th:1,int:11},
 {b:"lumio",n:"Sempre ativo, pesquisa",s:0,e:25,pl:["Google"],th:2,int:4},
 {b:"aurea",n:"Black Energy",s:6,e:9,pl:["Meta","YouTube","TikTok"],th:0,int:20},
 {b:"aurea",n:"Poupa 20%",s:12,e:19,pl:["Meta","Google"],th:0,int:12},
 {b:"aurea",n:"Verão Eficiente",s:19,e:25,pl:["YouTube","TikTok","Meta"],th:4,int:13},
 {b:"voltix",n:"Tarifa Jovem",s:1,e:8,pl:["TikTok","Meta"],th:3,int:10},
 {b:"voltix",n:"Mobilidade Elétrica",s:11,e:25,pl:["Meta","YouTube","Google"],th:1,int:14},
 {b:"voltix",n:"App Voltix",s:20,e:25,pl:["Meta","TikTok"],th:3,int:9},
 {b:"helio",n:"Instalação Solar",s:0,e:9,pl:["Google","YouTube"],th:1,int:10},
 {b:"helio",n:"Solar Pro",s:14,e:21,pl:["Google","Meta"],th:2,int:9},
 {b:"aurea",n:"Sempre ativo, pesquisa",s:0,e:25,pl:["Google"],th:2,int:4},
 {b:"voltix",n:"Sempre ativo, pesquisa",s:0,e:25,pl:["Google"],th:2,int:3},
 {b:"helio",n:"Sempre ativo, pesquisa",s:0,e:25,pl:["Google"],th:2,int:5},
 {b:"zenit",n:"Lançamento Zenit",s:15,e:25,pl:["TikTok","Meta","YouTube"],th:3,int:22}];
const COPY=[
 ["Tarifa fixa. O preço não muda.","Poupa até 20% na tua fatura de luz.","Sem surpresas na fatura, todos os meses.","Muda hoje e paga menos amanhã."],
 ["Energia 100% renovável para a tua casa.","O sol trabalha por ti. Painéis instalados em 7 dias.","Menos carbono, mais poupança.","Casa mais verde, fatura mais leve."],
 ["Mudar de fornecedor demora 5 minutos.","Sem papéis, sem filas, sem complicações.","Tudo num só contacto.","Contrato claro, escrito em português simples."],
 ["Controla o consumo na app.","A tua energia na palma da mão.","Alertas inteligentes quando gastas demais.","Carrega o carro elétrico com tarifa dedicada."],
 ["Conforto para toda a família, o ano inteiro.","Mais calor em casa, menos peso no orçamento.","Pensado para quem tem filhos em casa.","Verão fresco sem medo da fatura."]];
const CTA=["Saber mais","Simular poupança","Pedir proposta","Mudar agora"];
function pickFmt(p,b,r){const w=p==="TikTok"?[1,0,0,0]:p==="YouTube"?[.92,.08,0,0]:p==="Google"?[.1,.25,0,.65]:[.42,.28,.30,0];
 if(b==="aurea")w[0]*=1.4;if(b==="helio"){w[3]*=1.3;w[0]*=.7}if(b==="voltix"&&p==="Meta")w[2]*=1.6;
 const t=w.reduce((a,c)=>a+c,0);let x=r()*t;for(let i=0;i<4;i++){x-=w[i];if(x<=0)return i}return 0}
// LIGAÇÃO[meta-ad-library] LIGAÇÃO[google-ads-transparency] LIGAÇÃO[tiktok-ad-library]
// CR = um registo por criativo (marca, plataforma, formato, datas, texto, origem). Fonte real: um registo por anúncio
// recolhido (scripts/collect_meta_ads.py hoje; Google e TikTok a acrescentar). Campos e mapeamento: docs/09-pontos-de-ligacao.md.
const CR=[];
(()=>{const r=rng(2026);
 FL.forEach((f,fi)=>{const len=f.e-f.s+1,n=Math.max(2,Math.round(f.int*len/3.5));
  for(let k=0;k<n;k++){
   const p=f.pl[Math.floor(Math.pow(r(),1.5)*f.pl.length)],st=f.s+Math.floor(r()*len),L=2+Math.floor(r()*4),en=Math.min(f.e,st+L-1);
   const th=r()<.72?f.th:Math.floor(r()*5);
   CR.push({id:CR.length,fl:fi,b:f.b,p,fm:pickFmt(p,f.b,r),th,st,en,h:COPY[th][Math.floor(r()*4)],cta:CTA[Math.floor(r()*4)],reach:Math.round(8+r()*140)*1000,dd:Math.floor(r()*5),o:"demo"})}})})();
const AD={},NA={};
EN.forEach(e=>{AD[e.id]={};NA[e.id]={};PL.forEach(p=>{AD[e.id][p]=Array(MW).fill(0);NA[e.id][p]=Array(MW).fill(0)})});
CR.forEach(c=>{NA[c.b][c.p][c.st]++;for(let w=c.st;w<=c.en;w++)AD[c.b][c.p][w]++});
const CF={w:12,pl:new Set(PL)};
const IMP=[]; // criativos importados por CSV (origem declarada no ficheiro)
const sel=()=>EN.filter(e=>e.inc);
const rg=()=>[MW-CF.w,MW-1];
const act=(b,w)=>PL.reduce((s,p)=>s+(CF.pl.has(p)?AD[b][p][w]:0),0);
const neu=(b,w)=>PL.reduce((s,p)=>s+(CF.pl.has(p)?NA[b][p][w]:0),0);
const press=(b,w)=>PL.reduce((s,p)=>s+(CF.pl.has(p)?AD[b][p][w]*PW[p]:0),0);
const spd=(b,w,p)=>AD[b][p][w]*PC[p]*ebyid(b).k;
const spdt=(b,w)=>PL.reduce((s,p)=>s+(CF.pl.has(p)?spd(b,w,p):0),0);
const range=(a,z)=>Array.from({length:z-a+1},(_,i)=>a+i);
const sumR=(fn,b)=>{const[a,z]=rg();return range(a,z).reduce((s,w)=>s+fn(b,w),0)};
const eur=v=>v>=1e6?nf(v/1e6,2)+" M€":v>=1e3?nf(v/1e3,v>=1e5?0:1)+" mil €":nf(v)+" €";
const inCr=c=>c.en>=rg()[0]&&c.st<=rg()[1]&&CF.pl.has(c.p)&&ebyid(c.b)&&ebyid(c.b).inc;
const dateOf=c=>{const d=new Date(W0);d.setDate(d.getDate()+(WB+c.st)*7+c.dd);return d.getDate()+" "+MES[d.getMonth()]};
const daysOf=c=>Math.max(3,(c.en-c.st+1)*7-c.dd);
const isOn=c=>c.en>=MW-1;
const dchip=(d,unit="%",inv)=>{if(d===null||isNaN(d))return`<span class="dchip">—</span>`;const up=d>0.5,dn=d<-0.5;return`<span class="dchip ${up?"up":dn?"dn":""}">${up?"▲":dn?"▼":"•"} ${sgn(Math.round(d*10)/10,Math.abs(d)<10&&unit!=="%"?1:0)}${unit==="%"?"%":" "+unit}</span>`};

/* ---------- Gráficos (SVG à mão, com dicas, tabela e teclado) ---------- */
const CHARTS=[],CH2=[];
function niceMax(v){if(v<=0)return 1;const p=Math.pow(10,Math.floor(Math.log10(v))),m=v/p;return([1,2,4,6,8,10].find(x=>m<=x)||10)*p}
function ctip(e,html){tip.innerHTML=html;tip.classList.add("on");const w=tip.offsetWidth,h=tip.offsetHeight;let x=e.clientX+14,y=e.clientY-h-10;if(x+w>innerWidth-8)x=e.clientX-w-14;if(y<8)y=e.clientY+16;tip.style.left=Math.max(8,x)+"px";tip.style.top=y+"px"}
function tableHTML(o){const n=o.series[0].d.length,tot=Array.from({length:n},(_,i)=>o.series.reduce((s,z)=>s+z.d[i],0));
 const cell=(z,i)=>o.pct?nf(tot[i]?z.d[i]/tot[i]*100:0,1)+"%":(o.fmt?o.fmt(z.d[i]):nf(z.d[i]));
 return`<details class="tbl2"><summary>Ver como tabela</summary><div class="tw"><table><thead><tr><th>${o.xh||"Semana"}</th>${o.series.map(z=>`<th class="n">${esc(z.n)}</th>`).join("")}</tr></thead><tbody>${Array.from({length:n},(_,k)=>n-1-k).map(i=>`<tr><td>${o.xl(i)}</td>${o.series.map(z=>`<td class="n">${cell(z,i)}</td>`).join("")}</tr>`).join("")}</tbody></table></div></details>`}
function legendHTML(items,line){return`<div class="lgd">${items.map(z=>`<span><i class="${line?"ln2":""}" style="background:${z.c}"></i>${esc(z.n)}</span>`).join("")}</div>`}
function tsChart(host,o,anim,reg=CHARTS){
 const R={host,o,anim:!!anim};reg.push(R);
 R.fn=()=>{
  const S=o.series,n=S[0].d.length,mini=!!o.mini,W=Math.max(240,host.clientWidth||300),H=o.h||(mini?84:(W<520?220:270));
  const ml=o.ml??(mini?2:38),mr=o.mr??((o.end&&W>=640)?84:(mini?2:10)),mt=mini?4:10,mb=mini?2:24,iw=W-ml-mr,ih=H-mt-mb,bars=o.type==="bars";
  const x=i=>bars?ml+(i+.5)*iw/n:ml+i*iw/Math.max(1,n-1);
  const stk=o.stack||o.pct,tot=Array.from({length:n},(_,i)=>S.reduce((s,z)=>s+z.d[i],0));
  const top=[],base=[];let acc=Array(n).fill(0);
  if(stk)S.forEach(z=>{const b=acc.slice();const t=acc.map((a,i)=>a+(o.pct?(tot[i]?z.d[i]/tot[i]*100:0):z.d[i]));base.push(b);top.push(t);acc=t});
  else S.forEach(z=>{base.push(Array(n).fill(0));top.push(z.d.slice())});
  const max=o.ymax??(o.pct?100:niceMax(stk?Math.max(...tot,1):Math.max(...S.flatMap(z=>z.d),1)));
  const y=v=>mt+ih*(1-v/max);
  let s=`<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(o.aria||"Gráfico")}" tabindex="0">`;
  if(!mini){[0,.5,1].forEach(f=>{const v=max*f;s+=`<line class="gl" x1="${ml}" x2="${W-mr}" y1="${y(v)}" y2="${y(v)}"/><text class="ax" x="${ml-8}" y="${y(v)+4}" text-anchor="end">${o.yf?o.yf(v):nf(v,v%1?1:0)}</text>`});
   const st=Math.ceil(n/(W<520?5:8));for(let i=0;i<n;i+=st)s+=`<text class="ax" x="${x(i)}" y="${H-6}" text-anchor="middle">${o.xl(i)}</text>`}
  s+=`<g class="${R.anim?"rv":""}">`;
  S.forEach((z,si)=>{
   if(o.type==="area"){const pts=top[si].map((v,i)=>`${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" "),bp=base[si].map((v,i)=>`${x(i).toFixed(1)},${y(v).toFixed(1)}`).reverse().join(" ");
     s+=`<polygon points="${pts} ${bp}" style="fill:${z.c};opacity:.92;stroke:var(--surface);stroke-width:1.5;stroke-linejoin:round"/>`}
   else if(bars){const bw=Math.max(2,Math.min(26,iw/n*.68));
     for(let i=0;i<n;i++){const h=y(base[si][i])-y(top[si][i]);if(h<.6)continue;s+=`<rect x="${(x(i)-bw/2).toFixed(1)}" y="${y(top[si][i]).toFixed(1)}" width="${bw.toFixed(1)}" height="${h.toFixed(1)}" rx="${Math.min(2.5,bw/2)}" style="fill:${z.cf?z.cf(i):z.c};stroke:var(--surface);stroke-width:${stk?1.2:0}"/>`}}
   else{const pts=top[si].map((v,i)=>[x(i),y(v)]),d=smooth(pts);
     if(o.fill)s+=`<path d="${d} L${x(n-1).toFixed(1)},${y(0)} L${x(0).toFixed(1)},${y(0)}Z" style="fill:${z.c};opacity:.13"/>`;
     s+=`<path d="${d}" fill="none" style="stroke:${z.c};stroke-width:${z.w||(mini?2:2.4)};stroke-linecap:round;stroke-linejoin:round"/>`}});
  s+=`</g>`;
  if(o.end&&!mini&&W>=640&&S.length<=6){const ys=S.map((z,si)=>({z,y:stk?(y(top[si][n-1])+y(base[si][n-1]))/2:y(z.d[n-1])})).sort((a,b)=>a.y-b.y);for(let i=1;i<ys.length;i++)if(ys[i].y-ys[i-1].y<14)ys[i].y=ys[i-1].y+14;
   ys.forEach(q=>{s+=`<circle cx="${W-mr+10}" cy="${q.y}" r="4" style="fill:${q.z.c}"/><text class="elab" x="${W-mr+18}" y="${q.y+4}">${esc(q.z.n)}</text>`})}
  s+=`<g class="hv"></g><rect class="hit" x="${ml}" y="0" width="${iw}" height="${H}"/></svg>`;
  host.innerHTML=s;R.anim=false;
  const svg=host.firstElementChild,hv=$(".hv",svg),hit=$(".hit",svg);
  const show=(i,e)=>{i=clamp(i,0,n-1);let g="";
   if(bars){const cw=iw/n;g+=`<rect class="hvc" x="${ml+i*cw}" y="${mt}" width="${cw}" height="${ih}"/>`}
   else{g+=`<line x1="${x(i)}" x2="${x(i)}" y1="${mt}" y2="${mt+ih}"/>`;S.forEach((z,si)=>{g+=`<circle cx="${x(i)}" cy="${y(top[si][i])}" r="${mini?3.5:4.5}" style="fill:${z.c}"/>`})}
   hv.innerHTML=g;
   const rows=(stk?S.map((z,si)=>si).reverse():S.map((z,si)=>si)).map(si=>{const z=S[si],v=z.d[i];return`<div style="display:flex;gap:14px;align-items:center;justify-content:space-between"><span style="display:inline-flex;gap:7px;align-items:center;color:#cfe0dc"><i style="display:inline-block;width:10px;height:3px;border-radius:2px;background:${z.c}"></i>${esc(z.n)}</span><b>${o.pct?nf(tot[i]?v/tot[i]*100:0,1)+"%":(o.fmt?o.fmt(v):nf(v))}</b></div>`}).join("");
   const total=(o.stack&&S.length>1)?`<div style="display:flex;justify-content:space-between;gap:14px;margin-top:4px;padding-top:4px;border-top:1px solid rgba(255,255,255,.2)"><span style="color:#cfe0dc">Total</span><b>${o.fmt?o.fmt(tot[i]):nf(tot[i])}</b></div>`:"";
   ctip(e,`<div style="font-weight:600;margin-bottom:4px">${o.xl(i)}</div>${rows}${total}`)};
  const idx=e=>{const px=e.clientX-svg.getBoundingClientRect().left;return bars?Math.floor((px-ml)/(iw/n)):Math.round((px-ml)/(iw/Math.max(1,n-1)))};
  hit.addEventListener("pointermove",e=>show(idx(e),e));
  hit.addEventListener("pointerleave",()=>{hv.innerHTML="";tip.classList.remove("on")});
  let ki=n-1;svg.addEventListener("keydown",e=>{if(e.key==="ArrowLeft"||e.key==="ArrowRight"){e.preventDefault();ki=clamp(ki+(e.key==="ArrowRight"?1:-1),0,n-1);const r=svg.getBoundingClientRect();show(ki,{clientX:r.left+x(ki),clientY:r.top+H/2})}});
  svg.addEventListener("blur",()=>{hv.innerHTML="";tip.classList.remove("on")});
 };
 R.fn();return R}
function redrawComp(){[...CHARTS,...CH2].forEach(c=>{if(c.host.isConnected&&c.host.offsetParent)c.fn()})}

/* ---------- Criativos: miniaturas ilustrativas ---------- */
function wrapTxt(t,n){const w=t.split(" "),L=[];let l="";w.forEach(x=>{if((l+" "+x).trim().length>n){L.push(l);l=x}else l=(l+" "+x).trim()});L.push(l);return L}
function thumb(c,big){
 const e=ebyid(c.b)||{n:c.bn||c.b,c:"#6b7a77",me:false},ink=e.me||!ebyid(c.b)?"#fff":"#0F2623",id="tg"+c.id+(big?"b":""),fmt=FM[c.fm],bn=esc(e.n);
 if(fmt==="Texto"){const L=wrapTxt(c.h,30).slice(0,2);
  return`<svg viewBox="0 0 320 200" role="img" aria-label="Anúncio de pesquisa ilustrativo de ${bn}"><rect width="320" height="200" fill="#fff"/><rect x="0" y="0" width="320" height="6" style="fill:${e.c}"/><text x="18" y="40" font-size="11" font-weight="600" fill="#586764" font-family="Inter,sans-serif">Anúncio · ${bn.toLowerCase()}.pt</text><text x="18" y="76" font-size="17" font-weight="600" style="fill:var(--brand-ink)" font-family="Inter,sans-serif">${esc(L[0])}</text>${L[1]?`<text x="18" y="98" font-size="17" font-weight="600" style="fill:var(--brand-ink)" font-family="Inter,sans-serif">${esc(L[1])}</text>`:""}<text x="18" y="134" font-size="12.5" fill="#586764" font-family="Inter,sans-serif">${esc(TH[c.th]||"Anúncio")}. ${esc(c.cta)} em ${bn.toLowerCase()}.pt</text><rect x="18" y="154" width="86" height="22" rx="11" fill="#EDF0EF"/><text x="31" y="169" font-size="11" font-weight="600" fill="#0F2623" font-family="Inter,sans-serif">Pesquisa</text></svg>`}
 const big4=wrapTxt(c.h,19).length>3,L=wrapTxt(c.h,big4?25:19).slice(0,3),fs=big4?17:22,lh=big4?22:26;
 const dec=[`<circle cx="262" cy="130" r="46"/><circle cx="262" cy="130" r="28"/>`,`<circle cx="258" cy="124" r="24"/>${[0,45,90,135,180,225,270,315].map(a=>`<line x1="${258+34*Math.cos(a*Math.PI/180)}" y1="${124+34*Math.sin(a*Math.PI/180)}" x2="${258+50*Math.cos(a*Math.PI/180)}" y2="${124+50*Math.sin(a*Math.PI/180)}" stroke="#fff" stroke-width="5" stroke-linecap="round"/>`).join("")}`,`<path d="M222 132l28 28 52-62" fill="none" stroke="#fff" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>`,`<rect x="232" y="82" width="60" height="104" rx="12"/>`,`<path d="M218 140l44-40 44 40v44h-88z"/>`][Math.max(0,c.th)];
 let ov="";
 if(fmt==="Vídeo")ov=`<circle cx="40" cy="162" r="17" fill="rgba(0,0,0,.35)"/><path d="M34 153l16 9-16 9z" fill="#fff"/><rect x="262" y="12" width="44" height="18" rx="9" fill="rgba(0,0,0,.35)"/><text x="284" y="25" text-anchor="middle" font-size="10.5" font-weight="600" fill="#fff" font-family="Inter,sans-serif">0:${15+(c.id%3)*5}</text>`;
 if(fmt==="Carrossel")ov=`<circle cx="142" cy="184" r="3.5" fill="#fff"/><circle cx="156" cy="184" r="3.5" fill="#fff" opacity=".5"/><circle cx="170" cy="184" r="3.5" fill="#fff" opacity=".5"/><circle cx="296" cy="100" r="13" fill="rgba(255,255,255,.9)"/><path d="M292 94l7 6-7 6" fill="none" stroke="#0F2623" stroke-width="2.2" stroke-linecap="round"/>`;
 return`<svg viewBox="0 0 320 200" role="img" aria-label="Criativo ilustrativo de ${bn}, ${fmt}"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".22"/></linearGradient></defs><rect width="320" height="200" style="fill:${e.c}"/><rect width="320" height="200" fill="url(#${id})"/><g fill="#fff" opacity=".2">${dec}</g><text x="18" y="28" font-size="11" font-weight="700" letter-spacing=".02em" fill="${ink}" opacity=".85" font-family="Inter,sans-serif">${bn}</text>${L.map((t,i)=>`<text x="18" y="${68+i*lh}" font-size="${fs}" font-weight="700" letter-spacing="-.02em" fill="${ink}" font-family="Inter,sans-serif">${esc(t)}</text>`).join("")}${fmt==="Vídeo"?"":`<rect x="18" y="${150}" width="${70+c.cta.length*5}" height="26" rx="13" fill="${ink}"/><text x="${18+(70+c.cta.length*5)/2}" y="167" text-anchor="middle" font-size="11.5" font-weight="700" style="fill:${e.c}" font-family="Inter,sans-serif">${esc(c.cta)}</text>`}${ov}</svg>`}
const allCr=()=>[...IMP,...CR];
function crMeta(c){const e=ebyid(c.b);return{n:e?e.n:(c.bn||c.b),c:e?e.c:"#6b7a77"}}

/* ---------- Estado dos separadores ---------- */
const TABS=[["geral","Visão geral"],["ativ","Atividade"],["criat","Criativos"],["form","Formatos e mensagens"],["camp","Campanhas"],["inv","Investimento e voz"]];
const UI={tab:"geral",more:12,sort:"rec",fm:new Set(),only:false,br:null};
let anim=true;
function renderTabs(){$("#etabs").innerHTML=TABS.map(t=>`<button role="tab" aria-selected="${t[0]===UI.tab}" data-t="${t[0]}">${t[1]}</button>`).join("")}
function renderFilters(){
 $("#fbar").innerHTML=`<div class="grp2"><span class="fl">Período</span><div class="seg" id="fper">${[4,8,12,26].map(n=>`<button data-w="${n}" aria-pressed="${CF.w===n}">${n} sem.</button>`).join("")}</div></div>
  <div class="grp2"><span class="fl">Plataforma</span>${PL.map(p=>`<button class="fchip" data-p="${p}" aria-pressed="${CF.pl.has(p)}">${p}</button>`).join("")}</div>
  <div class="grp2"><span class="fl">Marcas</span>${EN.map(e=>e.inc?`<button class="fchip" data-b="${e.id}" aria-pressed="true" ${e.me?'disabled aria-label="Lumio, cliente"':""}><i style="background:${e.c}"></i>${e.n}</button>`:e.sug?`<button class="fchip sug" data-add="${e.id}" data-tip="O Radar sugere ${e.n}: aparece em ${e.ov}% das mesmas pesquisas. A equipa decide."><i style="background:${e.c}"></i>${e.n}, sugerida</button>`:`<button class="fchip" data-b="${e.id}" aria-pressed="false"><i style="background:${e.c}"></i>${e.n}</button>`).join("")}</div>
  <span class="sp"></span><span class="t-xs">Dados desta vertical ${B("demo")}</span>`;
 hydrate($("#fbar"))}
function renderTab(a){CHARTS.length=0;const f=T[UI.tab];f(a);redrawKeep()}
function redrawKeep(){}
function refresh(){renderFilters();const el=$("#etab");el.classList.add("busy");setTimeout(()=>{renderTab(false);el.classList.remove("busy")},RM?0:110)}
function setTab(t,scroll){UI.tab=t;UI.more=12;renderTabs();stopRace();renderTab(true);if(scroll)scrollTo({top:0,behavior:"auto"})}
const T={};

/* ---------- Visão geral ---------- */
function kpiBox(l,v,sub){return`<div class="kpi"><span class="t-xs">${l}</span><span class="big">${v}</span><span class="t-sm muted">${sub}</span></div>`}
function movers(){
 const bs=sel(),out=[],z=MW-1,avgA=(b,a,c)=>mean(range(a,c).map(w=>act(b,w)));
 const ch=bs.map(e=>{const l=avgA(e.id,z-3,z),p=avgA(e.id,z-7,z-4);return{e,l,p,d:p>=3?(l/p-1)*100:null}}).filter(x=>x.d!==null);
 const up=ch.filter(x=>!x.e.me).sort((a,b)=>b.d-a.d)[0];
 if(up&&up.d>12){const pf=PL.map(p=>({p,v:mean(range(z-3,z).map(w=>AD[up.e.id][p][w]))-mean(range(z-7,z-4).map(w=>AD[up.e.id][p][w]))})).sort((a,b)=>b.v-a.v)[0].p;
  out.push({e:up.e,t:`${up.e.n} aumentou os anúncios ativos em ${nf(up.d)}% nas últimas 4 semanas`,r:`Passou de ${nf(up.p)} para ${nf(up.l)} anúncios ativos em média, sobretudo em ${pf}.`,k:`Rever lances e orçamento em ${pf} nas próximas duas semanas.`,para:"Performance",sid:up.e.id})}
 const lan=FL.filter(f=>f.s>=z-4&&ebyid(f.b).inc&&!ebyid(f.b).me).sort((a,b)=>b.int-a.int)[0];
 if(lan){const e=ebyid(lan.b),wk=z-lan.s;out.push({e,t:`${e.n} lançou «${lan.n}» ${wk<=0?"esta semana":"há "+wk+" "+(wk===1?"semana":"semanas")}`,r:`Território: ${TH[lan.th].toLowerCase()}. Plataformas: ${lan.pl.join(", ")}. Já tem ${nf(CR.filter(c=>c.fl===FL.indexOf(lan)&&c.en>=z).length)} criativos ativos.`,k:`Avaliar se a nossa mensagem em «${TH[lan.th].toLowerCase()}» precisa de reforço.`,para:"Brand",sid:e.id})}
 const me=bs.find(e=>e.me),sv=w=>{const t=bs.reduce((s,e)=>s+press(e.id,w),0);return t?press(me.id,w)/t*100:0},d8=sv(z)-sv(z-8);
 out.push({e:me,t:`${me.n} ${d8<0?"perdeu":"ganhou"} ${nf(Math.abs(d8),1)} p.p. de quota de voz em 8 semanas`,r:`Quota de voz atual: ${nf(sv(z),1)}% entre as ${bs.length} marcas do conjunto.`,k:d8<0?"Preparar a leitura para a próxima reunião de acompanhamento e discutir o plano de resposta.":"Documentar o que está a funcionar para replicar noutras ativações.",para:"Account",sid:me.id});
 const dn=ch.filter(x=>!x.e.me).sort((a,b)=>a.d-b.d)[0];
 if(dn&&dn.d<-12)out.push({e:dn.e,t:`${dn.e.n} reduziu a pressão em ${nf(Math.abs(dn.d))}%`,r:`Média de ${nf(dn.l)} anúncios ativos, contra ${nf(dn.p)} nas 4 semanas anteriores. Pode ser pausa entre campanhas.`,k:"Janela de menor ruído para reforçar a presença, a confirmar com o histórico.",para:"Performance",sid:dn.e.id});
 return out.slice(0,4)}
T.geral=a=>{
 const bs=sel(),[a0,z]=rg(),cur=bs.reduce((s,e)=>s+act(e.id,z),0),prv=bs.reduce((s,e)=>s+act(e.id,Math.max(0,z-4)),0);
 const nw=bs.reduce((s,e)=>s+sumR(neu,e.id),0),canP=a0-CF.w>=0;let np=null;if(canP)np=bs.reduce((s,e)=>s+range(a0-CF.w,a0-1).reduce((q,w)=>q+neu(e.id,w),0),0);
 const sv=w=>{const t=bs.reduce((s,e)=>s+press(e.id,w),0);return t?press("lumio",w)/t*100:0},s0=sv(a0),s1=sv(z);
 const rank=[...bs].sort((p,q)=>press(q.id,z)-press(p.id,z)).findIndex(e=>e.me)+1;
 const sp=bs.reduce((s,e)=>s+sumR(spdt,e.id),0),spl=sumR(spdt,"lumio");
 const mv=movers();
 $("#etab").innerHTML=`
 <div class="kpis">
  ${kpiBox("Anúncios ativos agora",`<span data-count="${cur}">${cur}</span>`,`${dchip(prv?(cur/prv-1)*100:null)} face a há 4 semanas`)}
  ${kpiBox("Anúncios novos no período",`<span data-count="${nw}">${nw}</span>`,np===null?`${CF.w} semanas, sem período anterior`:`${dchip(np?(nw/np-1)*100:null)} face ao período anterior`)}
  ${kpiBox("Quota de voz de Lumio",`<span data-count="${s1.toFixed(1)}" data-dec="1" data-suf="%">${nf(s1,1)}%</span>`,`${rank}.º de ${bs.length} · ${dchip(s1-s0,"p.p.")} no período`)}
  ${kpiBox("Investimento estimado",`<span>${eur(sp)}</span>`,`Lumio: ${sp?nf(spl/sp*100):0}% do total · método em «Investimento e voz»`)}
 </div>
 <div class="sec"><header><div><h2 class="t-h2">O que mexeu esta semana</h2><p>O Radar lê a atividade dos concorrentes e aponta onde olhar. A pista sugere a quem pode interessar; a equipa decide o que fazer.</p></div>${B("demo")}</header>
  <div class="mvs">${mv.map((m,i)=>`<article class="mv"><div class="top2"><span class="who"><i style="background:${m.e.c}"></i>${m.e.n}</span><span class="tag">Para ${m.para}</span></div><h3>${m.t}</h3><div class="cv" id="mvs${i}" style="height:52px"></div><p class="read2">${m.r}</p><div class="pk2"><svg class="ic" style="width:16px;height:16px;margin-top:2px;color:var(--brand-ink)"><use href="#i-spark"/></svg><span><b>Pista:</b> ${m.k}</span></div><div class="acts"><button class="btn" data-cr-b="${m.sid}">Ver criativos</button><button class="btn ghost" data-res="1"><svg class="ic"><use href="#i-flask"/></svg>Pedir aprofundamento à Research</button></div></article>`).join("")}</div></div>
 <div class="sec"><header><div><h2 class="t-h2">Quota de voz</h2><p>Peso de cada marca na pressão publicitária (anúncios ativos ponderados pelo alcance típico de cada plataforma). Mexe na semana e o ranking refaz-se.</p></div>${B("demo")}</header>
  <div class="setgrid"><div><div class="race" id="race"></div>
   <div class="slider no-print"><button class="btn" id="eplay" aria-label="Reproduzir"><svg class="ic"><use href="#i-play"/></svg><span>Reproduzir</span></button><input type="range" id="ewk" min="0" max="${MW-1}" value="${ew}" aria-label="Semana"><output id="elab"></output></div>
   <div class="insight" id="einsight"></div></div>
   <div><h2 class="t-h2" style="margin-bottom:4px">Conjunto competitivo</h2><p class="t-sm muted" style="margin-bottom:10px">A equipa escolhe quem entra. O Radar só sugere. Herdado da vertical, ajustável por cliente.</p><div class="setlist" id="eset"></div></div></div></div>
 <div class="sec"><header><div><h2 class="t-h2">Presença por plataforma</h2><p>Quota dos anúncios ativos de cada plataforma que pertence a cada marca, em média no período. Cada coluna soma 100%.</p></div>${B("demo")}</header><div class="tblwrap"><table class="hm2" id="heat"></table></div></div>`;
 hydrate($("#etab"));counters($("#etab"));
 mv.forEach((m,i)=>{const h=$("#mvs"+i);if(h)tsChart(h,{series:[{n:m.e.n,c:m.e.c,d:range(MW-12,MW-1).map(w=>act(m.sid,w)),w:2.4}],type:"line",fill:true,mini:true,h:52,xl:k=>mLab(MW-12+k),fmt:v=>nf(v)+" anúncios",aria:"Anúncios ativos nas últimas 12 semanas"},a)});
 buildRace();buildHeat()};
/* quota de voz animada */
const RH=44;let ew=MW-1,eint=null;
function sov(i){const inc=sel(),tot=inc.reduce((s,e)=>s+press(e.id,i),0)||1;return Object.fromEntries(EN.map(e=>[e.id,e.inc?press(e.id,i)/tot*100:0]))}
function buildRace(){const host=$("#race");if(!host)return;host.style.height=EN.length*RH+"px";host.innerHTML=EN.map(e=>`<div class="rrow ${e.me?"me":""}" data-id="${e.id}"><span class="rk"></span><span class="nm">${e.n}${e.me?"<em>cliente</em>":""}</span><div class="bar"><i></i></div><span class="val num"></span><span class="dl num"></span></div>`).join("");
 $("#eset").innerHTML=EN.map(e=>e.me?`<div class="setitem"><span class="nm">${e.n}<em>cliente</em></span></div>`:e.sug?`<div class="setitem"><span class="nm">${e.n}<em>sugerida pelo Radar</em><br><span class="t-xs" style="font-weight:500">Aparece em ${e.ov}% das mesmas pesquisas ${B("demo")}</span></span><button class="btn" data-add="${e.id}" style="margin-left:auto">Aceitar</button></div>`:`<div class="setitem"><span class="nm">${e.n}</span><button class="tg" role="switch" aria-checked="${e.inc}" aria-label="Incluir ${e.n}" data-tg="${e.id}"></button></div>`).join("");
 hydrate($("#eset"));void host.offsetWidth;updateRace();
 $("#ewk").addEventListener("input",ev=>{stopRace();ew=+ev.target.value;updateRace()});
 $("#eplay").addEventListener("click",()=>{if(eint){stopRace();return}let i=ew>=MW-1?0:ew;ew=i;updateRace();$("#eplay span").textContent="Pausar";$("#eplay use").setAttribute("href","#i-pause");eint=setInterval(()=>{i++;if(i>MW-1){stopRace();return}ew=i;updateRace()},RM?40:380)})}
function stopRace(){if(eint){clearInterval(eint);eint=null}const b=$("#eplay");if(b){$("span",b).textContent="Reproduzir";$("use",b).setAttribute("href","#i-play")}}
function updateRace(){if(!$("#race"))return;const i=ew,now=sov(i),prev=sov(Math.max(0,i-8)),inc=sel().sort((a,b)=>now[b.id]-now[a.id]),off=EN.filter(e=>!e.inc),max=Math.max(...inc.map(e=>now[e.id]),1);
 inc.forEach((e,k)=>{const r=$(`.rrow[data-id="${e.id}"]`);r.classList.remove("off");r.style.transform=`translateY(${k*RH}px)`;$(".rk",r).textContent=k+1;$(".bar i",r).style.width=(now[e.id]/max*100)+"%";$(".val",r).textContent=nf(now[e.id],1)+"%";$(".dl",r).textContent=i<8?"":sgn(now[e.id]-prev[e.id],1)+" p.p."});
 off.forEach((e,k)=>{const r=$(`.rrow[data-id="${e.id}"]`);r.classList.add("off");r.style.transform=`translateY(${(inc.length+k)*RH}px)`});
 $("#elab").textContent=mLab(i)+" 2026";$("#ewk").value=i;
 const me=ebyid("lumio"),dm=now.lumio-prev.lumio,mvv=inc.filter(e=>!e.me).map(e=>({e,dl:now[e.id]-prev[e.id]})).sort((a,b)=>Math.abs(b.dl)-Math.abs(a.dl))[0];
 $("#einsight").innerHTML=i<8||!mvv?`Escolhe uma semana mais à frente para ver a evolução.`:`${B("demo")} <b>${mvv.e.n}</b> ${mvv.dl>0?"ganhou":"perdeu"} <b>${nf(Math.abs(mvv.dl),1)} p.p.</b> de quota de voz nas 8 semanas até ${mLab(i)}. <b>${me.n}</b> ${dm>=0?"ganhou":"perdeu"} ${nf(Math.abs(dm),1)} p.p. e está em ${inc.indexOf(me)+1}.º lugar no conjunto.`;hydrate($("#einsight"))}
function buildHeat(){const h=$("#heat");if(!h)return;const bs=EN.filter(e=>e.inc||e.sug),[a,z]=rg(),OFF=["TV","Rádio","Exterior"];
 const avg=(b,p)=>mean(range(a,z).map(w=>AD[b][p][w])),tot=Object.fromEntries(PL.map(p=>[p,EN.filter(e=>e.inc).reduce((s,e)=>s+avg(e.id,p),0)||1]));
 h.innerHTML=`<thead><tr><th></th>${PL.map(p=>`<th style="${CF.pl.has(p)?"":"opacity:.4"}">${p}</th>`).join("")}${OFF.map(c=>`<th>${c}</th>`).join("")}</tr></thead><tbody>${bs.map(e=>`<tr><td class="rn"><i style="display:inline-block;width:9px;height:9px;border-radius:50%;background:${e.c};margin-right:8px"></i>${e.n}${e.sug?` <span class="t-xs">(sugerida)</span>`:""}</td>${PL.map(p=>{const v=e.inc?avg(e.id,p)/tot[p]*100:0;return`<td class="c" style="${CF.pl.has(p)?"":"opacity:.35;"}background:color-mix(in srgb,var(--brand) ${Math.round(v*.7)}%,transparent)" data-tip="<b>${e.n}</b> tem ${nf(v)}% dos anúncios ativos em ${p} (média de ${CF.w} semanas) ${e.inc?"":"— fora do conjunto"}">${e.inc?nf(v)+"%":"—"}</td>`}).join("")}${OFF.map(c=>`<td class="c off" data-tip="Monitorização offline (${c}): módulo por ligar. Ver Fontes de dados.">por ligar</td>`).join("")}</tr>`).join("")}</tbody>`}

/* ---------- Atividade ---------- */
T.ativ=a=>{
 const bs=sel(),[a0,z]=rg(),xl=i=>mLab(a0+i),pls=PL.filter(p=>CF.pl.has(p));
 const serP=pls.map((p,k)=>({id:p,n:p,c:RAMP[PL.indexOf(p)],d:range(a0,z).map(w=>bs.reduce((s,e)=>s+AD[e.id][p][w],0))}));
 const totP=serP.map(s=>s.d[s.d.length-1]),sumT=totP.reduce((q,v)=>q+v,0)||1,top=serP.map((s,i)=>({n:s.n,v:totP[i]})).sort((p,q)=>q.v-p.v)[0];
 const mx=Math.max(...bs.map(e=>Math.max(...range(a0,z).map(w=>act(e.id,w)))),1),ymx=niceMax(mx);
 const newS=bs.map(e=>({id:e.id,n:e.n,c:e.c,d:range(a0,z).map(w=>neu(e.id,w))}));
 $("#etab").innerHTML=`
 <div class="card"><header><div><h2 class="t-h2">Anúncios ativos por plataforma</h2><p>Soma das marcas do conjunto. ${top?`<b>${top.n}</b> concentra ${nf(top.v/sumT*100)}% dos anúncios ativos esta semana.`:""}</p></div>${B("demo")}</header>${legendHTML(serP)}<div class="cv" id="c1"></div><div id="t1"></div></div>
 <div class="sec"><header><div><h2 class="t-h2">Cada marca, lado a lado</h2><p>Mesma escala em todos os gráficos, para a comparação ser justa. A cor das camadas é a plataforma.</p></div>${B("demo")}</header>
  <div class="minis">${bs.map(e=>{const last=act(e.id,z),p4=act(e.id,Math.max(0,z-4));return`<div class="mini"><div class="mh"><span><i class="d" style="background:${e.c}"></i>${e.n}${e.me?' <span class="tag">cliente</span>':""}</span>${dchip(p4>=3?(last/p4-1)*100:null)}</div><div class="bg">${last}<span class="t-xs" style="margin-left:6px;font-weight:500">anúncios ativos</span></div><div class="cv" id="m_${e.id}"></div></div>`}).join("")}</div>
  ${legendHTML(pls.map(p=>({n:p,c:RAMP[PL.indexOf(p)]})))}</div>
 <div class="card" style="margin-top:16px"><header><div><h2 class="t-h2">Anúncios novos por semana</h2><p>Picos mostram lançamentos de campanha. Uma marca que cria muitos criativos de uma vez está a testar ou a entrar em força.</p></div>${B("demo")}</header>${legendHTML(newS)}<div class="cv" id="c3"></div><div id="t3"></div></div>`;
 hydrate($("#etab"));
 tsChart($("#c1"),{series:serP,type:"area",stack:true,end:true,xl,fmt:v=>nf(v),aria:"Anúncios ativos por plataforma"},a);$("#t1").innerHTML=tableHTML({series:serP,xl,fmt:nf});
 bs.forEach(e=>tsChart($("#m_"+e.id),{series:pls.map(p=>({n:p,c:RAMP[PL.indexOf(p)],d:range(a0,z).map(w=>AD[e.id][p][w])})),type:"area",stack:true,mini:true,ymax:ymx,xl,fmt:nf,aria:"Anúncios ativos de "+e.n},a));
 tsChart($("#c3"),{series:newS,type:"bars",stack:true,end:false,xl,fmt:nf,aria:"Anúncios novos por semana e marca"},a);$("#t3").innerHTML=tableHTML({series:newS,xl,fmt:nf})};

/* ---------- Criativos ---------- */
T.criat=a=>{
 const [a0,z]=rg();let list=allCr().filter(c=>{if(c.imp)return CF.pl.has(c.p);return inCr(c)}).filter(c=>(!UI.br||c.b===UI.br)&&(!UI.fm.size||UI.fm.has(FM[c.fm]))&&(!UI.only||isOn(c)));
 list.sort((p,q)=>UI.sort==="rec"?(q.st-p.st||q.id-p.id):(daysOf(q)-daysOf(p)));
 const shown=list.slice(0,UI.more),bs=sel();
 const lon=bs.map(e=>{const fin=CR.filter(c=>c.b===e.id&&!isOn(c)&&CF.pl.has(c.p)&&c.st>=a0-6),av=fin.length?mean(fin.map(daysOf)):0,keep=CR.filter(c=>c.b===e.id&&isOn(c)&&CF.pl.has(c.p)&&daysOf(c)>=28).length;return{e,av,keep}});
 const mxl=Math.max(...lon.map(x=>x.av),1);
 $("#etab").innerHTML=`
 <div class="gtool"><div class="seg" id="gsort"><button data-sort="rec" aria-pressed="${UI.sort==="rec"}">Mais recentes</button><button data-sort="long" aria-pressed="${UI.sort==="long"}">Mais longevos</button></div>
  ${FM.map(f=>`<button class="fchip" data-gfm="${f}" aria-pressed="${UI.fm.has(f)}">${f}</button>`).join("")}
  <button class="fchip" data-gon="1" aria-pressed="${UI.only}">Só ativos</button>
  ${UI.br?`<button class="fchip" data-clrb="1" aria-pressed="true"><i style="background:${ebyid(UI.br)?ebyid(UI.br).c:"#6b7a77"}"></i>${ebyid(UI.br)?ebyid(UI.br).n:UI.br} ✕</button>`:""}
  <span class="sp" style="flex:1"></span><span class="t-sm muted">${nf(list.length)} criativos ${B("demo")}</span></div>
 ${shown.length?`<div class="gal">${shown.map(c=>{const m=crMeta(c);return`<button class="cr" data-cr="${c.imp?"i"+c.id:c.id}" aria-label="Abrir criativo de ${esc(m.n)}">${thumb(c)}<div class="cm"><b><i style="background:${m.c}"></i>${esc(m.n)}</b><div class="r2"><span class="tag">${c.p}</span><span class="tag">${FM[c.fm]}</span><span class="tag">${TH[c.th]||"—"}</span></div><span>${isOn(c)?"Ativo":"Terminado"} · desde ${dateOf(c)} · ${daysOf(c)} dias ${B(c.o||"demo",{f:c.f,m:c.m})}</span></div></button>`}).join("")}</div>
 ${list.length>shown.length?`<p style="margin-top:16px"><button class="btn" data-more="1">Ver mais ${Math.min(12,list.length-shown.length)}</button></p>`:""}`:`<div class="lockcard">Nenhum criativo com estes filtros. Alarga o período ou limpa os formatos.</div>`}
 <div class="sec"><header><div><h2 class="t-h2">Quanto tempo vivem os criativos</h2><p>Criativos que ficam muito tempo no ar costumam funcionar. A duração média dos terminados é uma pista do que cada marca considera vencedor.</p></div>${B("demo")}</header>
  <div class="card"><div class="hb">${lon.map(x=>`<div class="row"><span class="nm"><i style="background:${x.e.c}"></i>${x.e.n}</span><div class="single"><i data-w="${x.av/mxl*100}" style="background:${x.e.c}" data-tip="<b>${x.e.n}</b>: duração média de ${nf(x.av)} dias nos criativos terminados; ${x.keep} ativos há 4 semanas ou mais."></i></div><span class="num2">${nf(x.av)} d</span></div>`).join("")}</div></div></div>`;
 hydrate($("#etab"));requestAnimationFrame(()=>$$(".single i[data-w]").forEach(i=>i.style.width=i.dataset.w+"%"))};
function openDrawer(key){const c=String(key).startsWith("i")?IMP.find(x=>"i"+x.id===key):CR[+key];if(!c)return;const m=crMeta(c),f=FL[c.fl];
 $("#drawer").innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center;gap:10px"><h2 class="t-h2">${esc(m.n)}, criativo</h2><button class="iconbtn" id="dclose" aria-label="Fechar" style="width:32px;height:32px"><svg class="ic"><use href="#i-x"/></svg></button></div>
  <svg class="th" viewBox="0 0 320 200">${thumb(c,true).replace(/^<svg[^>]*>/,"").replace(/<\/svg>$/,"")}</svg>
  <p style="font-size:15px;font-weight:600;letter-spacing:-.01em">${esc(c.h)}</p>
  <dl style="margin-top:14px"><dt>Plataforma</dt><dd>${c.p}</dd><dt>Formato</dt><dd>${FM[c.fm]}</dd><dt>Mensagem</dt><dd>${TH[c.th]||"—"}</dd><dt>Campanha</dt><dd>${f?esc(f.n):"Importado"}</dd><dt>Início</dt><dd>${dateOf(c)} 2026</dd><dt>Dias no ar</dt><dd>${daysOf(c)} (${isOn(c)?"ativo":"terminado"})</dd><dt>Alcance UE</dt><dd>${nf(c.reach||0)} ${B("demo")}</dd><dt>Origem</dt><dd>${B(c.o||"demo",{f:c.f,m:c.m})}</dd></dl>
  <p class="t-sm muted" style="margin-top:14px">Ilustração gerada para a demonstração. Na versão ligada, mostra o criativo recolhido da Meta Ad Library ou do Google Ads Transparency Center, com a ligação ao original.</p>
  <div style="display:flex;gap:8px;margin-top:16px;flex-wrap:wrap"><button class="btn" disabled>Abrir na biblioteca</button><button class="btn" data-saveref="1">Guardar em referências</button></div>`;
 hydrate($("#drawer"));$("#drawer").classList.add("on");$("#scrim").classList.add("on");$("#dclose").focus()}
function closeDrawer(){$("#drawer").classList.remove("on");$("#scrim").classList.remove("on")}

/* ---------- Formatos e mensagens ---------- */
const STOP=new Set("de a o e para na no em que um uma os as do da dos das por com à é se ao ou tua teu mas pelo mais menos todos todas".split(" "));
T.form=a=>{
 const bs=sel(),L=allCr().filter(c=>!c.imp&&inCr(c)),mixes=bs.map(e=>{const cs=L.filter(c=>c.b===e.id),t=cs.length||1;return{e,n:cs.length,v:FM.map((f,i)=>cs.filter(c=>c.fm===i).length/t*100)}});
 const th=bs.map(e=>{const cs=L.filter(c=>c.b===e.id),t=cs.length||1;return{e,v:TH.map((_,i)=>cs.filter(c=>c.th===i).length/t*100)}});
 const W={};L.forEach(c=>{c.h.toLowerCase().replace(/[.,%!?«»:]/g,"").split(/\s+/).filter(w=>w.length>=3&&!STOP.has(w)).forEach(w=>{W[w]=W[w]||{t:0,b:{}};W[w].t++;W[w].b[c.b]=(W[w].b[c.b]||0)+1})});
 const terms=Object.entries(W).sort((p,q)=>q[1].t-p[1].t).slice(0,8),mt=terms.length?terms[0][1].t:1;
 $("#etab").innerHTML=`
 <div class="card"><header><div><h2 class="t-h2">Mix de formatos</h2><p>Que formatos cada marca usa nos anúncios ativos durante o período. Uma mudança súbita para vídeo costuma acompanhar um lançamento.</p></div>${B("demo")}</header>${legendHTML(FM.map((f,i)=>({n:f,c:RAMP[i]})))}
  <div class="hb">${mixes.map(m=>`<div class="row"><span class="nm"><i style="background:${m.e.c}"></i>${m.e.n}</span><div class="sbar">${m.v.map((v,i)=>v<=0?"":`<span style="flex:${v} 1 0;background:${RAMP[i]};${i===0?"color:#0F2623":""}" data-tip="<b>${m.e.n}</b>: ${nf(v)}% ${FM[i].toLowerCase()} (${nf(Math.round(v*m.n/100))} de ${m.n} criativos)">${v>=9?nf(v)+"%":""}</span>`).join("")}</div><span class="num2">${m.n}</span></div>`).join("")}</div>
  <p class="t-xs" style="margin-top:10px">A coluna da direita é o número de criativos observados.</p></div>
 <div class="grid2" style="margin-top:16px">
  <div class="card"><header><div><h2 class="t-h2">Que mensagens defendem</h2><p>Parte dos criativos de cada marca por território de mensagem. Mais escuro, mais peso.</p></div>${B("demo")}</header>
   <table class="hm2"><thead><tr><th></th>${TH.map(t=>`<th>${t}</th>`).join("")}</tr></thead><tbody>${th.map(r=>`<tr><td class="rn"><i style="display:inline-block;width:9px;height:9px;border-radius:50%;background:${r.e.c};margin-right:8px"></i>${r.e.n}</td>${r.v.map((v,i)=>`<td class="c" style="background:color-mix(in srgb,var(--brand) ${Math.round(v*1.2)}%,transparent)" data-tip="<b>${r.e.n}</b>: ${nf(v)}% dos criativos falam de ${TH[i].toLowerCase()}">${nf(v)}%</td>`).join("")}</tr>`).join("")}</tbody></table></div>
  <div class="card"><header><div><h2 class="t-h2">Palavras que mais se repetem</h2><p>Termos mais frequentes nos textos dos anúncios do período e quem os usa mais.</p></div>${B("demo")}</header>
   <div class="terms">${terms.map(([w,d])=>{const who=Object.entries(d.b).sort((p,q)=>q[1]-p[1])[0],e=ebyid(who[0]);return`<div class="t"><b>${esc(w)}</b><div class="single"><i data-w="${d.t/mt*100}" style="background:var(--brand)"></i></div><span class="num2" style="text-align:right;font-weight:600">${d.t}</span><span class="who2 t-xs"><i style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${e.c};margin-right:6px"></i>${e.n}</span></div>`}).join("")}</div></div></div>`;
 hydrate($("#etab"));requestAnimationFrame(()=>$$(".terms .single i").forEach(i=>i.style.width=i.dataset.w+"%"))};

/* ---------- Campanhas (calendário) ---------- */
T.camp=a=>{
 const bs=sel(),[a0,z]=rg(),n=CF.w,rows=[];
 bs.forEach(e=>{const fl=FL.filter(f=>f.b===e.id&&f.e>=a0&&f.s<=z&&f.pl.some(p=>CF.pl.has(p)));if(fl.length){rows.push({g:e});fl.forEach(f=>rows.push({f,e}))}});
 const pr=range(a0,z).map(w=>bs.reduce((s,e)=>s+act(e.id,w),0)),srt=[...pr].sort((p,q)=>p-q),thr=srt[Math.floor(n*.3)],pk=srt[Math.floor(n*.8)];
 const runs=[];let cur=null;pr.forEach((v,i)=>{if(v<=thr){if(!cur)cur=[i,i];else cur[1]=i}else if(cur){runs.push(cur);cur=null}});if(cur)runs.push(cur);
 const win=runs.filter(r=>r[1]-r[0]>=1).slice(0,4);
 $("#etab").innerHTML=`
 <div class="card"><header><div><h2 class="t-h2">Calendário de campanhas</h2><p>Quando cada marca esteve no ar, em que plataformas e com que intensidade. Passa o cursor numa barra para ver o detalhe.</p></div>${B("demo")}</header>
  <div class="axis2"><div class="t-xs" style="padding-top:22px">Pressão total do conjunto</div><div class="cv" id="gp"></div></div>
  <div class="gantt" id="gantt">${rows.map(r=>r.g?`<div class="grp3">${r.g.n}${r.g.me?" · cliente":""}</div>`:`<div class="gr"><div class="gl2"><i style="background:${r.e.c}"></i><span>${r.f.n}</span></div><div class="lane" style="background-size:${100/n}% 100%">${(()=>{const s=Math.max(r.f.s,a0),e2=Math.min(r.f.e,z),pls=r.f.pl.filter(p=>CF.pl.has(p)),pkA=Math.max(...range(s,e2).map(w=>pls.reduce((q,p)=>q+AD[r.f.b][p][w],0)));return`<div class="bar2" style="left:${(s-a0)/n*100}%;width:${(e2-s+1)/n*100}%;background:${r.e.c};color:${r.e.me?"#fff":"#0F2623"}" data-tip="<b>${esc(r.f.n)}</b> · ${r.e.n}<br>${mLab(r.f.s)} a ${mLab(r.f.e)}<br>Plataformas: ${r.f.pl.join(", ")}<br>Mensagem: ${TH[r.f.th].toLowerCase()}<br>Pico: ${pkA} anúncios ativos">${pls.map(p=>`<em>${p[0]}</em>`).join("")}</div>`})()}</div></div>`).join("")}
   <div class="gr" style="border:0"><div></div><div class="ax2" style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-2);padding-top:6px"><span>${mLab(a0)}</span><span>${mLab(a0+Math.floor(n/2))}</span><span>${mLab(z)}</span></div></div></div>
  <p class="t-xs" style="margin-top:8px">M Meta · G Google · Y YouTube · T TikTok</p>
  ${win.length?`<div class="win"><span class="t-sm muted" style="margin-right:4px">Janelas de menor ruído concorrencial neste período:</span>${win.map(r=>`<span class="tag">${mLab(a0+r[0])} a ${mLab(a0+r[1])}</span>`).join("")}</div>`:""}</div>`;
 hydrate($("#etab"));
 tsChart($("#gp"),{series:[{n:"Anúncios ativos",c:"var(--text-2)",d:pr,cf:i=>pr[i]>=pk?"var(--brand-ink)":pr[i]<=thr?"var(--line)":"color-mix(in srgb,var(--text-2) 55%,var(--surface))"}],type:"bars",mini:true,h:64,ml:0,mr:0,xl:i=>mLab(a0+i),fmt:v=>nf(v)+" anúncios",aria:"Pressão total por semana"},a)};

/* ---------- Investimento e voz ---------- */
T.inv=a=>{
 const bs=sel(),[a0,z]=rg(),xl=i=>mLab(a0+i);
 const ser=bs.map(e=>({id:e.id,n:e.n,c:e.c,d:range(a0,z).map(w=>press(e.id,w))}));
 const pt=bs.map(e=>({e,v:PL.map(p=>CF.pl.has(p)?sumR((b,w)=>spd(b,w,p),e.id):0)}));const mx=Math.max(...pt.flatMap(r=>r.v),1);
 const gs=bs.map(e=>{const g=mean(range(a0,z).map(w=>AD[e.id].Google[w])),t=bs.reduce((s,q)=>s+mean(range(a0,z).map(w=>AD[q.id].Google[w])),0)||1;return{e,sh:g/t*100}});
 const ai=gs.map(x=>{const r=rng(x.e.id.length*131+x.e.n.charCodeAt(0));return{e:x.e,imp:clamp(18+x.sh*.85,8,72),ov:x.e.me?null:clamp(34+r()*42,20,80),pos:x.e.me?null:clamp(12+r()*46,8,64),top:clamp(16+x.sh*.7+r()*10,10,70)}});
 $("#etab").innerHTML=`
 <div class="card"><header><div><h2 class="t-h2">Quota de voz ao longo do tempo</h2><p>Como se reparte a pressão publicitária entre as marcas, semana a semana. Cada coluna soma 100%.</p></div>${B("demo")}</header>${legendHTML(ser)}<div class="cv" id="c5"></div><div id="t5"></div></div>
 <div class="sec"><header><div><h2 class="t-h2">Investimento estimado por marca e plataforma</h2><p>Estimativa para comparar ordens de grandeza, não para fechar contas. Substitui-se por dados de uma ferramenta licenciada quando houver.</p></div>${B("demo",{t:"<b>Demo.</b> Estimativa calculada sobre anúncios simulados. Com dados reais passaria a <b>Estimado</b>, com método validado."})}</header>
  <div class="card tblwrap"><table><thead><tr><th>Marca</th>${PL.map(p=>`<th class="n" style="${CF.pl.has(p)?"":"opacity:.4"}">${p}</th>`).join("")}<th class="n">Total</th></tr></thead><tbody>${pt.map(r=>`<tr><td style="font-weight:600"><i style="display:inline-block;width:9px;height:9px;border-radius:50%;background:${r.e.c};margin-right:8px"></i>${r.e.n}</td>${r.v.map(v=>`<td class="n cellbar"><i data-w="${v/mx*100}"></i><span>${v?eur(v):"—"}</span></td>`).join("")}<td class="n" style="font-weight:700">${eur(r.v.reduce((s,v)=>s+v,0))}</td></tr>`).join("")}</tbody></table></div>
  <p class="method"><b style="color:var(--text);font-weight:600">Método.</b> Anúncios ativos por semana × valor médio assumido por anúncio e plataforma (Meta ${PC.Meta} €, Google ${PC.Google} €, YouTube ${PC.YouTube} €, TikTok ${PC.TikTok} €) × fator por marca. Os valores assumidos são hipóteses de trabalho a calibrar com uma fonte licenciada ou com dados de clientes. A Meta Ad Library não devolve investimento em anúncios comerciais.</p></div>
 <div class="sec"><header><div><h2 class="t-h2">Pesquisa Google: quem disputa os mesmos leilões</h2><p>Quota de impressões e sobreposição entre Lumio e cada concorrente, no formato do relatório «Informações do leilão» do Google Ads.</p></div>${B("demo")}</header>
  <div class="card tblwrap"><table><thead><tr><th>Marca</th><th class="n">Quota de impressões</th><th class="n">Taxa de sobreposição</th><th class="n">Posição acima de Lumio</th><th class="n">Topo da página</th></tr></thead><tbody>${ai.map(r=>`<tr><td style="font-weight:600"><i style="display:inline-block;width:9px;height:9px;border-radius:50%;background:${r.e.c};margin-right:8px"></i>${r.e.n}${r.e.me?' <span class="tag">cliente</span>':""}</td><td class="n cellbar"><i data-w="${r.imp}"></i><span>${nf(r.imp)}%</span></td><td class="n">${r.ov===null?"—":nf(r.ov)+"%"}</td><td class="n">${r.pos===null?"—":nf(r.pos)+"%"}</td><td class="n">${nf(r.top)}%</td></tr>`).join("")}</tbody></table></div>
  <div class="lockcard" style="margin-top:12px"><svg class="ic" style="width:22px;height:22px"><use href="#i-lock"/></svg><div>Este relatório vem da conta Google Ads do cliente. Usar dados reais exige a autorização do cliente e o parecer de Compliance. <i class="bd lock" style="margin-left:6px">Por confirmar</i></div></div></div>`;
 hydrate($("#etab"));
 tsChart($("#c5"),{series:ser,type:"area",stack:true,pct:true,end:true,yf:v=>nf(v)+"%",xl,aria:"Quota de voz por marca"},a);$("#t5").innerHTML=tableHTML({series:ser,xl,pct:true});
 requestAnimationFrame(()=>$$(".cellbar i[data-w]").forEach(i=>i.style.width=i.dataset.w+"%"))};

/* ---------- Eventos dos filtros e separadores ---------- */
function onSet(){refresh()}
document.addEventListener("click",e=>{
 const v=$("#v-energia");if(!v||v.hidden)return;
 let t;
 if(t=e.target.closest("#etabs [data-t]")){setTab(t.dataset.t);return}
 if(t=e.target.closest("#fper [data-w]")){CF.w=+t.dataset.w;onSet();return}
 if(t=e.target.closest("#fbar [data-p]")){const p=t.dataset.p;if(CF.pl.has(p)){if(CF.pl.size>1)CF.pl.delete(p);else toast("Mantém pelo menos uma plataforma.")}else CF.pl.add(p);onSet();return}
 if(t=e.target.closest("#fbar [data-b]")){const b=ebyid(t.dataset.b);b.inc=!b.inc;onSet();return}
 if(t=e.target.closest("[data-add]")){const b=ebyid(t.dataset.add);b.inc=true;b.sug=false;toast(b.n+" entrou no conjunto. O Radar sugere; a equipa decide.");onSet();return}
 if(t=e.target.closest("[data-tg]")){const b=ebyid(t.dataset.tg);b.inc=!b.inc;renderFilters();updateRace();buildHeat();return}
 if(t=e.target.closest("[data-cr-b]")){UI.br=t.dataset.crB;UI.fm.clear();setTab("criat",true);return}
 if(t=e.target.closest("[data-res]")){t.disabled=true;t.lastChild.textContent="Aprofundamento pedido à Research";toast("Pedido de aprofundamento enviado à Research (simulação).");return}
 if(t=e.target.closest("#gsort [data-sort]")){UI.sort=t.dataset.sort;renderTab(false);return}
 if(t=e.target.closest("[data-gfm]")){const f=t.dataset.gfm;UI.fm.has(f)?UI.fm.delete(f):UI.fm.add(f);UI.more=12;renderTab(false);return}
 if(t=e.target.closest("[data-gon]")){UI.only=!UI.only;UI.more=12;renderTab(false);return}
 if(t=e.target.closest("[data-clrb]")){UI.br=null;renderTab(false);return}
 if(t=e.target.closest("[data-more]")){UI.more+=12;renderTab(false);return}
 if(t=e.target.closest("[data-cr]")){openDrawer(t.dataset.cr);return}
});
document.addEventListener("click",e=>{if(e.target.closest("#dclose")||e.target.id==="scrim")closeDrawer();if(e.target.closest("[data-saveref]"))toast("Guardado em referências (simulação).")});
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeDrawer()});
function buildEnergia(){renderFilters();renderTabs();renderTab(anim);anim=false}
