/* ============================================================
   Gráficos em SVG próprio: linhas, áreas, barras e empilhados, com dica ao passar o cursor,
   vista em tabela, navegação por teclado, eventos anotados e lacunas (null = sem dados, nunca zero).
   ============================================================ */
const CHARTS=[];
function redrawCharts(){CHARTS.forEach(c=>{if(c.host.isConnected&&c.host.offsetParent)c.fn()})}
let _rz;addEventListener("resize",()=>{clearTimeout(_rz);_rz=setTimeout(redrawCharts,120)});
function niceMax(v){if(v<=0)return 1;const p=Math.pow(10,Math.floor(Math.log10(v))),m=v/p;return([1,2,4,6,8,10].find(x=>m<=x)||10)*p}
function ctip(e,html){tip.innerHTML=html;tip.classList.add("on");const w=tip.offsetWidth,h=tip.offsetHeight;let x=e.clientX+14,y=e.clientY-h-10;if(x+w>innerWidth-8)x=e.clientX-w-14;if(y<8)y=e.clientY+16;tip.style.left=Math.max(8,x)+"px";tip.style.top=y+"px"}
function legendHTML(items,line){return`<div class="lgd">${items.map(z=>`<span><i class="${line?"ln2":""}" style="background:${z.c}"></i>${esc(z.n)}</span>`).join("")}</div>`}
function tableHTML(o){const n=o.series[0].d.length,V=o.series.map(z=>z.d.map(v=>v??0)),tot=Array.from({length:n},(_,i)=>V.reduce((s,z)=>s+z[i],0));
 const cell=(z,i)=>z.d[i]==null?"—":o.pct?nf(tot[i]?z.d[i]/tot[i]*100:0,1)+"%":(o.fmt?o.fmt(z.d[i]):nf(z.d[i]));
 return`<details class="tbl2"><summary>Ver como tabela</summary><div class="tw"><table><thead><tr><th>${o.xh||"Semana"}</th>${o.series.map(z=>`<th class="n">${esc(z.n)}</th>`).join("")}</tr></thead><tbody>${Array.from({length:n},(_,k)=>n-1-k).map(i=>`<tr><td>${o.xl(i)}</td>${o.series.map(z=>`<td class="n">${cell(z,i)}</td>`).join("")}</tr>`).join("")}</tbody></table></div></details>`}
function spark(d,w=160,h=34,color="var(--brand-ink)"){const v=d.filter(x=>x!=null);if(v.length<2)return"";const lo=Math.min(...v),hi=Math.max(...v),pts=v.map((y,i)=>[i*w/(v.length-1),h-3-(y-lo)/(hi-lo||1)*(h-8)]);return`<svg viewBox="0 0 ${w} ${h}" width="100%" height="${h}" preserveAspectRatio="none" aria-hidden="true"><path d="${smooth(pts)}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" vector-effect="non-scaling-stroke"/></svg>`}

function tsChart(host,o,anim){
 const R={host,o,anim:!!anim,mark:o.marker??null};CHARTS.push(R);
 R.fn=()=>{
  const S=o.series,n=S[0].d.length,mini=!!o.mini,W=Math.max(240,host.clientWidth||300),H=o.h||(mini?84:(W<520?220:270));
  const ml=o.ml??(mini?2:38),mr=o.mr??((o.end&&W>=640)?84:(mini?2:10)),mt=mini?4:10,mb=mini?2:24,iw=W-ml-mr,ih=H-mt-mb,bars=o.type==="bars";
  const x=i=>bars?ml+(i+.5)*iw/n:ml+i*iw/Math.max(1,n-1);
  const V=S.map(z=>z.d.map(v=>v??0)),has=Array.from({length:n},(_,i)=>S.some(z=>z.d[i]!=null));
  const stk=o.stack||o.pct,tot=Array.from({length:n},(_,i)=>V.reduce((s,z)=>s+z[i],0));
  const top=[],base=[];let acc=Array(n).fill(0);
  if(stk)V.forEach(z=>{const b=acc.slice();const t=acc.map((a,i)=>a+(o.pct?(tot[i]?z[i]/tot[i]*100:0):z[i]));base.push(b);top.push(t);acc=t});
  else V.forEach(z=>{base.push(Array(n).fill(0));top.push(z.slice())});
  const max=o.ymax??(o.pct?100:niceMax(stk?Math.max(...tot,1):Math.max(...V.flat(),1)));
  const y=v=>mt+ih*(1-v/max);
  let s=`<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(o.aria||"Gráfico")}" tabindex="0">`;
  if(!mini){[0,.5,1].forEach(f=>{const v=max*f;s+=`<line class="gl" x1="${ml}" x2="${W-mr}" y1="${y(v)}" y2="${y(v)}"/><text class="ax" x="${ml-8}" y="${y(v)+4}" text-anchor="end">${o.yf?o.yf(v):nf(v,v%1?1:0)}</text>`});
   const st=Math.ceil(n/(W<520?5:8));for(let i=0;i<n;i+=st)s+=`<text class="ax" x="${x(i)}" y="${H-6}" text-anchor="middle">${o.xl(i)}</text>`}
  (o.events||[]).forEach(ev=>{if(ev.i<0||ev.i>n-1)return;const xx=x(ev.i),right=xx<W-190;s+=`<g class="ev"><line x1="${xx}" x2="${xx}" y1="${mt}" y2="${mt+ih}"/><text x="${xx+(right?6:-6)}" y="${mt+11}" text-anchor="${right?"start":"end"}">${esc(W<520?ev.t.split(" (")[0]:ev.t)}</text></g>`});
  s+=`<g class="${R.anim?"rv":""}">`;
  S.forEach((z,si)=>{
   if(o.type==="area"){const pts=top[si].map((v,i)=>`${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" "),bp=base[si].map((v,i)=>`${x(i).toFixed(1)},${y(v).toFixed(1)}`).reverse().join(" ");
     s+=`<polygon points="${pts} ${bp}" style="fill:${z.c};opacity:.92;stroke:var(--surface);stroke-width:1.5;stroke-linejoin:round"/>`}
   else if(bars){const bw=Math.max(2,Math.min(26,iw/n*.68));
     for(let i=0;i<n;i++){if(stk?!has[i]:z.d[i]==null)continue;const h=y(base[si][i])-y(top[si][i]);if(h<.6)continue;s+=`<rect x="${(x(i)-bw/2).toFixed(1)}" y="${y(top[si][i]).toFixed(1)}" width="${bw.toFixed(1)}" height="${h.toFixed(1)}" rx="${Math.min(2.5,bw/2)}" style="fill:${z.cf?z.cf(i):z.c};stroke:var(--surface);stroke-width:${stk?1.2:0}"/>`}}
   else{const segs=[];let cur=[];top[si].forEach((v,i)=>{if(z.d[i]==null){if(cur.length)segs.push(cur);cur=[]}else cur.push([x(i),y(v),i])});if(cur.length)segs.push(cur);
     segs.forEach(p=>{if(p.length===1){s+=`<circle cx="${p[0][0]}" cy="${p[0][1]}" r="2.6" style="fill:${z.c}"/>`;return}
      const d=smooth(p);
      if(o.fill)s+=`<path d="${d} L${p[p.length-1][0].toFixed(1)},${y(0)} L${p[0][0].toFixed(1)},${y(0)}Z" style="fill:${z.c};opacity:.13"/>`;
      s+=`<path d="${d}" fill="none" style="stroke:${z.c};stroke-width:${z.w||(mini?2:2.4)};stroke-linecap:round;stroke-linejoin:round${o.dim&&o.dim!==z.id?";opacity:.18":""}"/>`})}});
  s+=`</g>`;
  if(o.end&&!mini&&W>=640&&S.length<=6){const ys=S.map((z,si)=>({z,y:stk?(y(top[si][n-1])+y(base[si][n-1]))/2:y(top[si][n-1])})).sort((a,b)=>a.y-b.y);for(let i=1;i<ys.length;i++)if(ys[i].y-ys[i-1].y<14)ys[i].y=ys[i-1].y+14;
   ys.forEach(q=>{s+=`<circle cx="${W-mr+10}" cy="${q.y}" r="4" style="fill:${q.z.c}"/><text class="elab" x="${W-mr+18}" y="${q.y+4}">${esc(q.z.n)}</text>`})}
  s+=`<g class="mk"></g><g class="hv"></g><rect class="hit" x="${ml}" y="0" width="${iw}" height="${H}"/></svg>`;
  host.innerHTML=s;R.anim=false;
  const svg=host.firstElementChild,hv=$(".hv",svg),hit=$(".hit",svg),mk=$(".mk",svg);
  R.setMarker=i=>{R.mark=i;if(i==null){mk.innerHTML="";return}i=clamp(i,0,n-1);let g=`<line x1="${x(i)}" x2="${x(i)}" y1="${mt}" y2="${mt+ih}" style="stroke:var(--text);stroke-width:1;opacity:.5"/>`;S.forEach((z,si)=>{if(z.d[i]!=null)g+=`<circle cx="${x(i)}" cy="${y(top[si][i])}" r="5" style="fill:${z.c};stroke:var(--surface);stroke-width:2.5"/>`});mk.innerHTML=g};
  if(R.mark!=null)R.setMarker(R.mark);
  const show=(i,e)=>{i=clamp(i,0,n-1);let g="";
   if(bars){const cw=iw/n;g+=`<rect class="hvc" x="${ml+i*cw}" y="${mt}" width="${cw}" height="${ih}"/>`}
   else{g+=`<line x1="${x(i)}" x2="${x(i)}" y1="${mt}" y2="${mt+ih}"/>`;S.forEach((z,si)=>{if(z.d[i]!=null)g+=`<circle cx="${x(i)}" cy="${y(top[si][i])}" r="${mini?3.5:4.5}" style="fill:${z.c}"/>`})}
   hv.innerHTML=g;if(o.onmove)o.onmove(i);
   const rows=(stk?S.map((z,si)=>si).reverse():S.map((z,si)=>si)).map(si=>{const z=S[si],v=z.d[i];return`<div style="display:flex;gap:14px;align-items:center;justify-content:space-between"><span style="display:inline-flex;gap:7px;align-items:center;color:#cfe0dc"><i style="display:inline-block;width:10px;height:3px;border-radius:2px;background:${z.c}"></i>${esc(z.n)}</span><b>${v==null?"—":o.pct?nf(tot[i]?v/tot[i]*100:0,1)+"%":(o.fmt?o.fmt(v):nf(v))}</b></div>`}).join("");
   const total=(o.stack&&S.length>1&&has[i])?`<div style="display:flex;justify-content:space-between;gap:14px;margin-top:4px;padding-top:4px;border-top:1px solid rgba(255,255,255,.2)"><span style="color:#cfe0dc">Total</span><b>${o.fmt?o.fmt(tot[i]):nf(tot[i])}</b></div>`:"";
   ctip(e,`<div style="font-weight:600;margin-bottom:4px">${o.xl(i)}</div>${rows}${total}`)};
  const idx=e=>{const px=e.clientX-svg.getBoundingClientRect().left;return bars?Math.floor((px-ml)/(iw/n)):Math.round((px-ml)/(iw/Math.max(1,n-1)))};
  hit.addEventListener("pointermove",e=>show(idx(e),e));
  hit.addEventListener("pointerleave",()=>{hv.innerHTML="";tip.classList.remove("on")});
  let ki=n-1;svg.addEventListener("keydown",e=>{if(e.key==="ArrowLeft"||e.key==="ArrowRight"){e.preventDefault();ki=clamp(ki+(e.key==="ArrowRight"?1:-1),0,n-1);const r=svg.getBoundingClientRect();show(ki,{clientX:r.left+x(ki),clientY:r.top+H/2})}});
  svg.addEventListener("blur",()=>{hv.innerHTML="";tip.classList.remove("on")});
 };
 R.fn();return R}

/* ---------- Criativos: miniaturas ilustrativas (a versão ligada mostra o criativo original) ---------- */
function wrapTxt(t,n){const w=t.split(" "),L=[];let l="";w.forEach(x=>{if((l+" "+x).trim().length>n){L.push(l);l=x}else l=(l+" "+x).trim()});L.push(l);return L}
function thumb(c,big){
 const e=ebyid(c.b)||{nome:c.bn||c.b,cor:-1,cliente:false},cc=e.cor<0?"#6b7a77":col(e),ink=e.cliente||e.cor<0?"#fff":"#0F2623",id="tg"+String(c.id).replace(/\W/g,"")+(big?"b":""),fmt=FM[c.fm],bn=esc(e.nome);
 if(fmt==="Texto"){const L=wrapTxt(c.h,30).slice(0,2);
  return`<svg viewBox="0 0 320 200" role="img" aria-label="Anúncio de pesquisa ilustrativo de ${bn}"><rect width="320" height="200" fill="#fff"/><rect x="0" y="0" width="320" height="6" style="fill:${cc}"/><text x="18" y="40" font-size="11" font-weight="600" fill="#586764" font-family="Inter,sans-serif">Anúncio · ${esc(slug(e.nome))}.pt</text><text x="18" y="76" font-size="17" font-weight="600" style="fill:var(--brand-ink)" font-family="Inter,sans-serif">${esc(L[0])}</text>${L[1]?`<text x="18" y="98" font-size="17" font-weight="600" style="fill:var(--brand-ink)" font-family="Inter,sans-serif">${esc(L[1])}</text>`:""}<text x="18" y="134" font-size="12.5" fill="#586764" font-family="Inter,sans-serif">${esc(TH[c.th]||"Anúncio")}. ${esc(c.cta||"")}</text><rect x="18" y="154" width="86" height="22" rx="11" fill="#EDF0EF"/><text x="31" y="169" font-size="11" font-weight="600" fill="#0F2623" font-family="Inter,sans-serif">Pesquisa</text></svg>`}
 const big4=wrapTxt(c.h,19).length>3,L=wrapTxt(c.h,big4?25:19).slice(0,3),fs=big4?17:22,lh=big4?22:26,cta=c.cta||"Saber mais";
 const dec=[`<circle cx="262" cy="130" r="46"/><circle cx="262" cy="130" r="28"/>`,`<circle cx="258" cy="124" r="24"/>${[0,45,90,135,180,225,270,315].map(a=>`<line x1="${258+34*Math.cos(a*Math.PI/180)}" y1="${124+34*Math.sin(a*Math.PI/180)}" x2="${258+50*Math.cos(a*Math.PI/180)}" y2="${124+50*Math.sin(a*Math.PI/180)}" stroke="#fff" stroke-width="5" stroke-linecap="round"/>`).join("")}`,`<path d="M222 132l28 28 52-62" fill="none" stroke="#fff" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>`,`<rect x="232" y="82" width="60" height="104" rx="12"/>`,`<path d="M218 140l44-40 44 40v44h-88z"/>`][Math.max(0,c.th)];
 let ov="";
 if(fmt==="Vídeo")ov=`<circle cx="40" cy="162" r="17" fill="rgba(0,0,0,.35)"/><path d="M34 153l16 9-16 9z" fill="#fff"/><rect x="262" y="12" width="44" height="18" rx="9" fill="rgba(0,0,0,.35)"/><text x="284" y="25" text-anchor="middle" font-size="10.5" font-weight="600" fill="#fff" font-family="Inter,sans-serif">0:${15+(c.i%3)*5}</text>`;
 if(fmt==="Carrossel")ov=`<circle cx="142" cy="184" r="3.5" fill="#fff"/><circle cx="156" cy="184" r="3.5" fill="#fff" opacity=".5"/><circle cx="170" cy="184" r="3.5" fill="#fff" opacity=".5"/><circle cx="296" cy="100" r="13" fill="rgba(255,255,255,.9)"/><path d="M292 94l7 6-7 6" fill="none" stroke="#0F2623" stroke-width="2.2" stroke-linecap="round"/>`;
 return`<svg viewBox="0 0 320 200" role="img" aria-label="Criativo ilustrativo de ${bn}, ${esc(fmt)}"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".22"/></linearGradient></defs><rect width="320" height="200" style="fill:${cc}"/><rect width="320" height="200" fill="url(#${id})"/><g fill="#fff" opacity=".2">${dec}</g><text x="18" y="28" font-size="11" font-weight="700" letter-spacing=".02em" fill="${ink}" opacity=".85" font-family="Inter,sans-serif">${bn}</text>${L.map((t,i)=>`<text x="18" y="${68+i*lh}" font-size="${fs}" font-weight="700" letter-spacing="-.02em" fill="${ink}" font-family="Inter,sans-serif">${esc(t)}</text>`).join("")}${fmt==="Vídeo"?"":`<rect x="18" y="150" width="${70+cta.length*5}" height="26" rx="13" fill="${ink}"/><text x="${18+(70+cta.length*5)/2}" y="167" text-anchor="middle" font-size="11.5" font-weight="700" style="fill:${cc}" font-family="Inter,sans-serif">${esc(cta)}</text>`}${ov}</svg>`}
