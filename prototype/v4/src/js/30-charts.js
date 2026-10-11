/* ============================================================
   Gráficos em SVG próprio: linhas (com dica e navegação por teclado), mini-linhas, faixas temporais.
   Cores: marcas pela paleta de marcas (cliente = tinta), territórios pela família --t (D35, D46, D47).
   ============================================================ */
const CHARTS=[];
addEventListener("resize",()=>{clearTimeout(CHARTS.t);CHARTS.t=setTimeout(()=>CHARTS.forEach(c=>c.host.isConnected&&c.draw()),150)});
function niceMax(v){if(v<=0)return 1;const p=Math.pow(10,Math.floor(Math.log10(v))),m=v/p;return([1,1.5,2,2.5,3,4,5,6,8,10].find(x=>m<=x)||10)*p}
function ctip(e,html){tip.innerHTML=html;tip.classList.add("on");const w=tip.offsetWidth,h=tip.offsetHeight;let x=e.clientX+14,y=e.clientY-h-10;if(x+w>innerWidth-8)x=e.clientX-w-14;if(y<8)y=e.clientY+16;tip.style.left=Math.max(8,x)+"px";tip.style.top=y+"px"}
const legendH=S=>`<div class="lgd">${S.map(s=>`<span><i style="background:${s.c}"></i>${esc(s.n)}</span>`).join("")}</div>`;

/* linhas: o={series:[{n,c,d,w,dim}], xl:i=>rótulo, fmt, h, min, max, ref:{v,n}, end, mini} */
function lineChart(host,o){if(!host)return;const R={host,draw(){
  const S=o.series,n=S[0].d.length,W=Math.max(220,host.clientWidth||300),mini=!!o.mini,H=o.h||(mini?110:(W<520?220:260));
  const f=o.fmt||(v=>nf(v)),vals=S.flatMap(s=>s.d).concat(o.ref?[o.ref.v]:[]),lo=o.min??Math.min(...vals),hi=o.max??Math.max(...vals);
  const pad=(hi-lo)*.12||1,y0=o.min??(lo-pad),y1=o.max??(hi+pad);
  const ml=Math.max(mini?34:42,10+(mini?6:6.4)*Math.max(...[y0,y1,(y0+y1)/2].map(v=>f(v).length))),mr=o.end&&W>=560?Math.min(150,Math.max(92,22+6.8*Math.max(...o.series.map(x=>x.n.length)))):12,mt=10,mb=22,iw=W-ml-mr,ih=H-mt-mb;
  const x=i=>ml+i*iw/Math.max(1,n-1),y=v=>mt+ih*(1-(v-y0)/(y1-y0));
  let s=`<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(o.aria||"Gráfico")}" tabindex="0">`;
  [0,.5,1].forEach(k=>{const v=y0+(y1-y0)*k;s+=`<line class="gl" x1="${ml}" x2="${W-mr}" y1="${y(v)}" y2="${y(v)}"/><text class="ax" x="${ml-6}" y="${y(v)+4}" text-anchor="end">${f(v)}</text>`});
  const st=Math.ceil(n/(W<520?4:mini?4:7));for(let i=0;i<n;i+=st)s+=`<text class="ax" x="${x(i)}" y="${H-5}" text-anchor="middle">${o.xl(i)}</text>`;
  if(o.ref)s+=`<line x1="${ml}" x2="${W-mr}" y1="${y(o.ref.v)}" y2="${y(o.ref.v)}" style="stroke:var(--text-2);stroke-dasharray:3 4"/><text class="ax" x="${W-mr-4}" y="${y(o.ref.v)-5}" text-anchor="end">${esc(o.ref.n)}</text>`;
  if(o.mark!=null){const xx=Math.max(ml,x(o.mark)-5),ww=Math.min(W-mr-xx,10);s+=`<rect x="${xx}" y="${mt}" width="${ww}" height="${ih}" style="fill:var(--accent);opacity:.3"/>`}
  S.forEach(z=>{const p=z.d.map((v,i)=>[x(i),y(v)]);s+=`<path d="${smooth(p)}" fill="none" style="stroke:${z.c};stroke-width:${z.w||2.2};stroke-linecap:round;${z.dash?"stroke-dasharray:4 4;":""}${z.dim?"opacity:.3":""}"/>`});
  if(o.end&&W>=560){const ys=S.map(z=>({z,y:y(z.d[n-1])})).sort((a,b)=>a.y-b.y);for(let i=1;i<ys.length;i++)if(ys[i].y-ys[i-1].y<14)ys[i].y=ys[i-1].y+14;
    ys.forEach(q=>s+=`<circle cx="${W-mr+8}" cy="${q.y}" r="4" style="fill:${q.z.c}"/><text class="elab" x="${W-mr+16}" y="${q.y+4}">${esc(q.z.n)}</text>`)}
  s+=`<g class="hv"></g><rect class="hit" x="${ml}" y="0" width="${iw}" height="${H}"/></svg>`;
  host.innerHTML=s;const svg=host.firstElementChild,hv=$(".hv",svg),hit=$(".hit",svg);
  const show=(i,e)=>{i=clamp(i,0,n-1);hv.innerHTML=`<line x1="${x(i)}" x2="${x(i)}" y1="${mt}" y2="${mt+ih}"/>`+S.map(z=>`<circle cx="${x(i)}" cy="${y(z.d[i])}" r="4.5" style="fill:${z.c}"/>`).join("");
    ctip(e,`<div style="font-weight:600;margin-bottom:4px">${o.xl(i,true)}</div>`+[...S].sort((a,b)=>b.d[i]-a.d[i]).map(z=>`<div style="display:flex;justify-content:space-between;gap:14px"><span style="display:inline-flex;gap:6px;align-items:center;color:#cfe0dc"><i style="width:10px;height:3px;border-radius:2px;background:${z.c}"></i>${esc(z.n)}</span><b>${f(z.d[i])}</b></div>`).join(""))};
  const idx=e=>Math.round((e.clientX-svg.getBoundingClientRect().left-ml)/(iw/Math.max(1,n-1)));
  hit.addEventListener("pointermove",e=>show(idx(e),e));hit.addEventListener("pointerleave",()=>{hv.innerHTML="";tip.classList.remove("on")});
  let ki=n-1;svg.addEventListener("keydown",e=>{if(e.key==="ArrowLeft"||e.key==="ArrowRight"){e.preventDefault();ki=clamp(ki+(e.key==="ArrowRight"?1:-1),0,n-1);const r=svg.getBoundingClientRect();show(ki,{clientX:r.left+x(ki),clientY:r.top+H/2})}});
  svg.addEventListener("blur",()=>{hv.innerHTML="";tip.classList.remove("on")});
  if(!RM&&!R.drawn){$$("path",svg).forEach(p=>{const L=p.getTotalLength?p.getTotalLength():0;if(L){p.style.strokeDasharray=L;p.style.strokeDashoffset=L;p.getBoundingClientRect();p.style.transition="stroke-dashoffset .9s cubic-bezier(.2,.7,.2,1)";p.style.strokeDashoffset=0;setTimeout(()=>{p.style.strokeDasharray="";p.style.transition=""},950)}})}
  R.drawn=true}};CHARTS.push(R);R.draw();return R}
function tableH(o){const n=o.series[0].d.length;return`<details class="tbl2"><summary class="t-xs" style="cursor:pointer;margin-top:8px">Ver como tabela</summary><div class="tblwrap" style="max-height:240px;overflow:auto;margin-top:6px"><table class="tbl"><thead><tr><th>Semana</th>${o.series.map(s=>`<th class="n">${esc(s.n)}</th>`).join("")}</tr></thead><tbody>${range(0,n-1).reverse().map(i=>`<tr><td>${o.xl(i,true)}</td>${o.series.map(s=>`<td class="n">${(o.fmt||nf)(s.d[i])}</td>`).join("")}</tr>`).join("")}</tbody></table></div></details>`}
function spark(d,w=200,h=34,c="var(--text-2)"){const lo=Math.min(...d),hi=Math.max(...d),p=d.map((v,i)=>[i*w/(d.length-1),h-3-(v-lo)/(hi-lo||1)*(h-8)]);return`<svg viewBox="0 0 ${w} ${h}" width="100%" height="${h}" preserveAspectRatio="none" aria-hidden="true"><path d="${smooth(p)}" fill="none" style="stroke:${c};stroke-width:2;vector-effect:non-scaling-stroke"/></svg>`}

/* evidência de preço e de leilão nos cartões */
function miniPreco(host,m,full){const a=Math.max(0,Z-(full?25:15)),r=range(a,Z),eu=D.precos.unidade==="€/L",mk=MK[m.marca],c=cliente();
  const S=[{n:mk.nome,c:col(mk),w:2.6,d:r.map(w=>D.precos.marcas[mk.id][w])},{n:c.nome,c:col(c),w:2,d:r.map(w=>D.precos.marcas[c.id][w])}];
  if(eu)S.push({n:"Média do mercado",c:"var(--text-2)",w:1.6,dash:true,d:r.map(w=>D.precos.mercado[w])});
  lineChart(host,{series:S,mini:!full,h:full?220:120,end:full,xl:(i,l)=>l?wRange(a+i):wLab(a+i),fmt:v=>eu?nf(v,3)+" €":nf(v,1),ref:eu?null:{v:100,n:"média = 100"},mark:m.semana-a,aria:D.precos.rotulo});
  if(!full)host.insertAdjacentHTML("beforeend",legendH(S))}
function miniLeilao(host,m,full){const a=Math.max(0,Z-(full?25:15)),r=range(a,Z),mk=MK[m.marca];
  const S=[{n:mk.nome,c:col(mk),w:2.6,d:r.map(w=>D.leilao[mk.id][w])}].concat(concorrentes().filter(x=>x.id!==mk.id&&D.leilao[x.id]).map(x=>({n:x.nome,c:col(x),dim:true,d:r.map(w=>D.leilao[x.id][w])})));
  lineChart(host,{series:full?S:S.slice(0,1),mini:!full,h:full?220:120,end:full,xl:(i,l)=>l?wRange(a+i):wLab(a+i),fmt:v=>nf(v)+"%",mark:m.semana-a,aria:"Sobreposição nas pesquisas do cliente"})}

/* faixas temporais: o={rows:[{label,c,bars:[{ini,fim,tip,op,dash,go}],marks:[{w,tip,mv}]}], w0, w1, events:[{ini,fim,nome}]} */
function swimlane(host,o){if(!host)return;const R={host,draw(){
  const W=Math.max(720,host.clientWidth||720),lw=W<820?92:120,rh=34,top=o.events&&o.events.length?44:24,H=top+o.rows.length*rh+10,n=o.w1-o.w0+1,cw=(W-lw-10)/n,x=w=>lw+(w-o.w0)*cw;
  let s=`<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(o.aria||"Linha temporal")}">`;
  if(Z<o.w1)s+=`<rect class="fut" x="${x(Z+1)}" y="${top-6}" width="${x(o.w1+1)-x(Z+1)}" height="${H-top}"/>`;
  let lastM=-1;for(let w=o.w0;w<=o.w1;w++){const d=wDate(w),mo=d.getUTCMonth();if(mo!==lastM&&d.getUTCDate()<=7){lastM=mo;s+=`<text class="ax" x="${x(w)+2}" y="12">${MES[mo]}${mo===0||w===o.w0?" "+String(d.getUTCFullYear()).slice(2):""}</text><line x1="${x(w)}" x2="${x(w)}" y1="16" y2="${H}" style="stroke:var(--line-2)"/>`}}
  const EV=(o.events||[]).filter(e=>e.fim>=o.w0&&e.ini<=o.w1).sort((a,b)=>a.ini-b.ini);
  EV.forEach((e,k)=>{const nx=EV[k+1],room=(nx?x(nx.ini):W-10)-x(e.ini)-6,t=e.nome.length*6.4<=room?e.nome:room>40?e.nome.slice(0,Math.floor(room/6.4)-1)+"…":"";
    s+=`<g data-tip="${esc(e.nome)}: ${wRange(e.ini)}"><rect x="${x(e.ini)}" y="20" width="${Math.max(cw,(e.fim-e.ini+1)*cw)}" height="14" rx="3" style="fill:color-mix(in srgb,var(--accent) 45%,transparent)"/>${t?`<text class="ev2" x="${x(e.ini)+3}" y="31">${esc(t)}</text>`:""}</g>`});
  o.rows.forEach((r,k)=>{const yy=top+k*rh;s+=`<text class="lab" x="0" y="${yy+rh/2+4}">${esc(r.label)}</text><line x1="${lw}" x2="${W-10}" y1="${yy+rh-1}" y2="${yy+rh-1}" style="stroke:var(--line-2)"/>`;
    r.bars.forEach(b=>{const a=Math.max(b.ini,o.w0),z=Math.min(b.fim,o.w1);if(z<o.w0||a>o.w1)return;s+=`<rect class="b" x="${x(a)+1}" y="${yy+7}" width="${Math.max(4,(z-a+1)*cw-2)}" height="${rh-16}" rx="5" style="fill:${b.c||r.c};opacity:${b.op??.9};${b.dash?"stroke:"+(b.c||r.c)+";stroke-width:1.5;stroke-dasharray:4 3;fill-opacity:.18":""}" data-tip="${esc(b.tip)}" ${b.go?`data-mv="${b.go}"`:""}/>`});
    (r.marks||[]).forEach(mk=>{if(mk.w<o.w0||mk.w>o.w1)return;s+=`<g data-tip="${esc(mk.tip)}" ${mk.mv?`data-mv="${mk.mv}" style="cursor:pointer"`:""}><circle cx="${x(mk.w)+cw/2}" cy="${yy+rh/2}" r="5.5" style="fill:var(--surface);stroke:${r.c};stroke-width:2"/></g>`})});
  if(Z>=o.w0&&Z<=o.w1)s+=`<line class="now" x1="${x(Z+1)}" x2="${x(Z+1)}" y1="${top-8}" y2="${H}"/><text class="nowt" x="${x(Z+1)+4}" y="${top-10}">hoje</text>`;
  host.innerHTML=s+"</svg>"}};CHARTS.push(R);R.draw();return R}
