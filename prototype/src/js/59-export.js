/* ============================================================
   Levar o Radar para onde a agência trabalha: copiar um gráfico como imagem (com título e origem dos dados)
   e acrescentar destaques ao briefing semanal. Nada disto sai da agência por si: é a equipa que cola e envia.
   ============================================================ */

/* ---------- Copiar gráfico como imagem ---------- */
const wrapCanvas=(ctx,txt,w)=>{const out=[];let l="";String(txt).split(/\s+/).forEach(x=>{const t=l?l+" "+x:x;if(ctx.measureText(t).width>w&&l){out.push(l);l=x}else l=t});if(l)out.push(l);return out};
async function cardToCanvas(card){
  const svg=[...card.querySelectorAll(".cv svg")].find(s=>s.getBoundingClientRect().height>100);if(!svg)return null;
  const r=svg.getBoundingClientRect(),W=Math.round(r.width),H=Math.round(r.height),cs0=getComputedStyle(card);
  const cl=svg.cloneNode(true),src=[svg,...svg.querySelectorAll("*")],dst=[cl,...cl.querySelectorAll("*")];
  const props=["fill","stroke","stroke-width","stroke-dasharray","stroke-linecap","stroke-linejoin","opacity","fill-opacity","stroke-opacity","font-family","font-size","font-weight","text-anchor","paint-order","letter-spacing"];
  src.forEach((s,i)=>{const cs=getComputedStyle(s);props.forEach(p=>{const v=cs.getPropertyValue(p);if(v)dst[i].style.setProperty(p,v)})});
  cl.querySelectorAll(".hit,.hv,.mk").forEach(n=>n.remove());
  ["tabindex","role","aria-label"].forEach(a=>cl.removeAttribute(a));cl.removeAttribute("class");
  cl.setAttribute("xmlns","http://www.w3.org/2000/svg");cl.setAttribute("width",W);cl.setAttribute("height",H);
  const ff=[...document.styleSheets].flatMap(s=>{try{return[...s.cssRules]}catch(e){return[]}}).find(x=>x.type===5);
  if(ff){const st=document.createElementNS("http://www.w3.org/2000/svg","style");st.textContent=ff.cssText;cl.insertBefore(st,cl.firstChild)}
  const img=new Image();img.decoding="sync";
  await new Promise((ok,ko)=>{img.onload=ok;img.onerror=ko;img.src="data:image/svg+xml;charset=utf-8,"+encodeURIComponent(new XMLSerializer().serializeToString(cl))});
  try{await document.fonts.load('600 20px Inter');await document.fonts.load('400 13px Inter')}catch(e){}
  const title=($("header h2",card)||{}).textContent||"",desc=($("header p",card)||{}).textContent||"";
  const legend=$$(".lgd span",card).map(s=>({t:s.textContent.trim(),c:getComputedStyle($("i",s)).backgroundColor}));
  const srcId=card.dataset.srcid,s=sealInfo(new Set(srcId?[srcId]:[...USED])),b=srcId?BLK(srcId):null;
  const origem=`Origem dos dados: ${s.t}${b&&b.origem==="real"&&b.fonte?" · "+b.fonte:""}${b&&b.origem==="estimado"&&b.metodo?" · "+b.metodo:""}`;
  const rodape=`Arena Radar · ${D.cliente.nome} · semana de ${D.calendario.rotulo_semana_atual}`;
  const sc=2,pad=28,w=Math.max(W,720)+pad*2,tmp=document.createElement("canvas").getContext("2d");
  tmp.font="600 20px Inter, system-ui, sans-serif";const tl=wrapCanvas(tmp,title,w-pad*2);
  tmp.font="400 13.5px Inter, system-ui, sans-serif";const dl=wrapCanvas(tmp,desc,w-pad*2),ol=wrapCanvas(tmp,origem,w-pad*2);
  let y=pad+tl.length*26+(dl.length?dl.length*19+4:0)+(legend.length?34:8);
  const cvh=y+H+16+ol.length*17+22+pad,cv=document.createElement("canvas");cv.width=w*sc;cv.height=cvh*sc;
  const ctx=cv.getContext("2d");ctx.scale(sc,sc);ctx.fillStyle=cs0.backgroundColor&&cs0.backgroundColor!=="rgba(0, 0, 0, 0)"?cs0.backgroundColor:"#fff";ctx.fillRect(0,0,w,cvh);
  const ink=getComputedStyle(document.body).color,mut=getComputedStyle($(".t-xs")||document.body).color;
  let yy=pad;ctx.textBaseline="top";ctx.fillStyle=ink;ctx.font="600 20px Inter, system-ui, sans-serif";tl.forEach(l=>{ctx.fillText(l,pad,yy);yy+=26});
  ctx.fillStyle=mut;ctx.font="400 13.5px Inter, system-ui, sans-serif";dl.forEach(l=>{ctx.fillText(l,pad,yy);yy+=19});
  if(dl.length)yy+=4;
  if(legend.length){let x=pad;ctx.font="500 12.5px Inter, system-ui, sans-serif";yy+=6;legend.forEach(l=>{ctx.fillStyle=l.c;ctx.fillRect(x,yy+3,11,11);ctx.fillStyle=mut;ctx.fillText(l.t,x+17,yy+1);x+=17+ctx.measureText(l.t).width+18});yy+=28}else yy+=8;
  ctx.drawImage(img,pad+(w-pad*2-W)/2,yy,W,H);yy+=H+16;
  ctx.fillStyle=mut;ctx.font="400 12px Inter, system-ui, sans-serif";ol.forEach(l=>{ctx.fillText(l,pad,yy);yy+=17});
  ctx.fillText(rodape,pad,yy+3);
  return cv}
async function copiarImagem(card){
  let cv;try{cv=await cardToCanvas(card)}catch(e){cv=null}
  if(!cv){toast("Este bloco não tem um gráfico para copiar. Usa «Copiar tabela».");return}
  const blob=await new Promise(ok=>cv.toBlob(ok,"image/png"));
  try{await navigator.clipboard.write([new ClipboardItem({"image/png":blob})]);toast("Gráfico copiado como imagem, com título e origem dos dados. Cola no PowerPoint ou no e-mail.")}
  catch(e){const url=cv.toDataURL("image/png");openDrawer(`${drawerHead("Imagem do gráfico")}<p class="t-sm muted" style="margin:8px 0 12px">Neste ambiente não foi possível copiar automaticamente. Clica com o botão direito na imagem e escolhe «Copiar imagem».</p><img alt="Gráfico exportado" src="${url}" style="width:100%;border:1px solid var(--line);border-radius:10px">${EM_ARTEFACTO?"":`<p style="margin-top:12px"><a class="btn" download="arena-radar-grafico.png" href="${url}">Descarregar PNG</a></p>`}`)}}
document.addEventListener("click",e=>{const b=e.target.closest("[data-chartimg]");if(b){e.preventDefault();copiarImagem(b.closest(".card"))}});

/* ---------- Destaques do briefing (só equipa; o que vai ao cliente passa sempre por «Publicar») ---------- */
function addBrief(t,txt){if(isCli())return;const L=D.brief.extras;if(L.some(x=>x.t===t&&x.txt===txt)){toast("Já está no briefing.");return}if(L.length>=20){toast("O briefing já tem 20 destaques. Retira alguns em Relatórios.");return}L.unshift({id:Date.now().toString(36)+Math.floor(Math.random()*1e3),t:String(t).slice(0,140),txt:String(txt).slice(0,420),q:new Date().toISOString()});saveState();toast("Adicionado ao briefing. Vê em Relatórios › Briefing semanal.")}
const textOf=h=>{const d=document.createElement("div");d.innerHTML=h;$$("button,svg,.t-xs,.spark",d).forEach(n=>n.remove());return d.textContent.replace(/\s+/g," ").trim()};
document.addEventListener("click",e=>{let t;
  if(t=e.target.closest("[data-addbrief]")){const c=t.closest(".card");addBrief($("header h2",c).textContent,($("header p",c)||{textContent:""}).textContent);return}
  if(t=e.target.closest("[data-brief-ans]")){const b=t.closest(".ansbody"),q=$(".q",b.parentNode);addBrief(q?q.textContent:"Pergunta ao Radar",textOf($(".anstext",b).innerHTML));return}
  if(t=e.target.closest("[data-brief-cr]")){const c=ADS.find(x=>String(x.id)===t.dataset.briefCr);if(c){const em=ebyid(c.b),nm=em?em.nome:(c.bn||c.b);addBrief(`Criativo de ${nm}`,`«${c.h}» · ${FM[c.fm]} em ${c.p}${c.th>=0?", mensagem "+TH[c.th].toLowerCase():""}, ${c.days} dias no ar (${isOn(c)?"ativo":"terminado"}).`)}return}
  if(t=e.target.closest("[data-brief-marca]")){const em=ebyid(t.dataset.briefMarca);addBrief("Ficha de "+em.nome,t.dataset.txt);return}
  if(t=e.target.closest("[data-brm]")){const L=D.brief.extras,i=L.findIndex(x=>x.id===t.dataset.brm);if(i>=0){L.splice(i,1);saveState();CUR.refresh()}}});
