/* ============================================================
   Componentes: cabeçalhos, selo de dados (D27), cartões de movimento, criativos, gaveta de detalhe.
   ============================================================ */
const AFTER=[];const later=f=>AFTER.push(f);
let SEAL=[];                                      // blocos de dados usados na página (para o selo)
const use=(...b)=>b.forEach(x=>{if(!SEAL.includes(x))SEAL.push(x)});

function sealHTML(){
  const bl=SEAL.map(k=>D&&D.blocos[k]).filter(Boolean),o=bl.some(b=>b.origem==="real")?(bl.every(b=>b.origem==="real")?"real":"misto"):"demo";
  const t=o==="real"?"Real":o==="misto"?"Misto":"Demonstração";
  return`<button class="seal" data-o="${o}" data-seal aria-haspopup="dialog">${t}<svg class="ic"><use href="#i-chev"/></svg></button>`}
function heroHTML(kick,title,lead){return`<div class="phead hero"><div class="kick"><span>${kick}</span><span class="sealslot"></span></div><h1 class="t-display">${title}</h1>${lead?`<p class="lead">${lead}</p>`:""}</div>`}
function pheadHTML(kick,title,lead){return`<div class="phead"><div class="kick"><span>${kick}</span><span class="sealslot"></span></div><h1 class="t-h1">${title}</h1>${lead?`<p class="lead">${lead}</p>`:""}</div>`}
const hl=s=>s.replace(/(−?\d[\d\s]*(?:,\d+)?\s?(?:%|cêntimos|cênt\/L|p\.p\.|criativos|carregadores))/,'<em class="hn">$1</em>');
function secHTML(t,p,body,extra=""){return`<section class="sec"><header><div><h2 class="t-h2">${t}</h2>${p?`<p>${p}</p>`:""}</div>${extra}</header>${body}</section>`}
const emptyHTML=(t,d)=>`<div class="empty"><svg class="ic"><use href="#i-check"/></svg><div><b>${t}</b><br>${d}</div></div>`;

document.addEventListener("click",e=>{const s=e.target.closest("[data-seal]"),p=$("#pop");
  if(!s){if(!e.target.closest("#pop"))p.classList.remove("on");return}
  const bl=SEAL.map(k=>D.blocos[k]).filter(Boolean);
  p.innerHTML=`<h3>Origem dos dados desta página</h3><p class="t-xs" style="margin-bottom:6px">Demonstração: todas as marcas são fictícias e os dados foram simulados. Nada é atribuído a empresas reais.</p>`+
    bl.map(b=>`<div class="bl"><b>${esc(b.nome)}</b><span class="seal" data-o="${b.origem==="estimado"?"estimado":"demo"}">${b.origem==="estimado"?"Estimado":"Demonstração"}</span><p>${esc(b.metodo)}${b.fonte_futura?`<br>Na versão ligada: ${esc(b.fonte_futura.split(",").map(x=>(AG.fontes.find(f=>f.id===x.trim())||{nome:x}).nome).join(", "))}.`:""}</p></div>`).join("");
  const r=s.getBoundingClientRect();p.style.left=Math.min(r.left,innerWidth-p.offsetWidth-12)+"px";p.classList.add("on");p.style.top=Math.min(r.bottom+8,innerHeight-p.offsetHeight-12)+"px"});

/* ---------- etiquetas ---------- */
const tipoTag=t=>`<span class="tag"><svg class="ic" style="width:13px;height:13px"><use href="#${TIPO_IC[t]||"i-pulse"}"/></svg>${esc(t)}</span>`;
const nivelTag=n=>n==="importante"?`<span class="tag sig">Importante</span>`:n==="acompanhar"?`<span class="tag">A acompanhar</span>`:"";
const pesoH=p=>`<span class="peso" data-tip="Peso estimado do movimento: ${["","baixo","médio","alto"][p]}" aria-label="peso ${["","baixo","médio","alto"][p]}">${[1,2,3].map(i=>`<i class="${i<=p?"on":""}"></i>`).join("")}</span>`;
const whoH=id=>{const m=MK[id];return`<button class="who" data-go="${D.cliente.id}/concorrentes/${m.id}">${dotH(m)}${esc(m.nome)}</button>`};
function respBtn(r){const e=estadoR(r);return`<button class="resp" data-e="${esc(e)}" data-resp="${r.id}" data-tip="${esc(r.o_que)}"><span class="st2"></span>${esc(r.nome)} · ${e==="pronta"?"pronta":e==="ativada"?"ativada":"por preparar"}</button>`}

/* ---------- criativos (ilustrações; a versão ligada mostra o criativo original, D49) ---------- */
function wrapT(t,n){const w=t.split(" "),L=[];let l="";w.forEach(x=>{if((l+" "+x).trim().length>n){L.push(l);l=x}else l=(l+" "+x).trim()});L.push(l);return L}
function thumbSVG(c){
  const m=MK[c.marca],cc=m.cliente?"#0F2623":col(m),tint=`color-mix(in srgb,${cc} 13%,#fff)`,ink="#0F2623",bn=esc(m.nome),ti=Math.max(0,D.territorios.indexOf(c.territorio));
  if(c.formato==="Texto"){const L=wrapT(c.titulo,28).slice(0,2);
    return`<svg viewBox="0 0 320 200" role="img" aria-label="Anúncio de pesquisa ilustrativo de ${bn}"><rect width="320" height="200" fill="#fff"/><rect width="320" height="6" style="fill:${cc}"/><text x="18" y="40" font-size="11" font-weight="600" fill="#586764" font-family="Inter,sans-serif">Anúncio · ${esc(m.nome.toLowerCase())}.pt</text>${L.map((t,i)=>`<text x="18" y="${76+i*24}" font-size="18" font-weight="600" fill="#1B6FD6" font-family="Inter,sans-serif">${esc(t)}</text>`).join("")}<text x="18" y="146" font-size="12.5" fill="#586764" font-family="Inter,sans-serif">${esc(c.oferta||c.territorio)}</text></svg>`}
  const L=wrapT(c.titulo,19).slice(0,3),dec=[`<circle cx="262" cy="128" r="46"/><circle cx="262" cy="128" r="26" fill="#fff" fill-opacity=".5"/>`,`<rect x="228" y="78" width="62" height="108" rx="12"/>`,`<path d="M214 186v-56l44-38 44 38v56z"/>`,`<path d="M268 70l-30 60h26l-12 50 40-66h-26l14-44z"/>`,`<path d="M210 170c30-60 70-80 100-80v80z"/>`][ti%5];
  let ov="";
  if(c.formato==="Vídeo")ov=`<circle cx="38" cy="164" r="16" fill="rgba(15,38,35,.55)"/><path d="M33 156l14 8-14 8z" fill="#fff"/>`;
  if(c.formato==="Carrossel")ov=`<circle cx="146" cy="186" r="3.5" fill="#0F2623"/><circle cx="160" cy="186" r="3.5" fill="#0F2623" opacity=".3"/><circle cx="174" cy="186" r="3.5" fill="#0F2623" opacity=".3"/>`;
  const cta=c.cta||"Saber mais";
  return`<svg viewBox="0 0 320 200" role="img" aria-label="Criativo ilustrativo de ${bn}: ${esc(c.titulo)}"><rect width="320" height="200" style="fill:${tint}"/><rect width="320" height="6" style="fill:${cc}"/><g style="fill:${cc}" opacity=".32">${dec}</g><text x="18" y="32" font-size="11" font-weight="700" fill="${ink}" opacity=".7" font-family="Inter,sans-serif">${bn}</text>${L.map((t,i)=>`<text x="18" y="${68+i*25}" font-size="21" font-weight="700" letter-spacing="-.4" fill="${ink}" font-family="Inter,sans-serif">${esc(t)}</text>`).join("")}${c.formato==="Vídeo"?"":`<rect x="18" y="150" width="${64+cta.length*6}" height="26" rx="13" fill="${ink}"/><text x="${18+(64+cta.length*6)/2}" y="167" text-anchor="middle" font-size="11.5" font-weight="700" fill="#fff" font-family="Inter,sans-serif">${esc(cta)}</text>`}${ov}</svg>`}
function thumbsHTML(ids,max=4){const L=ids.map(i=>CR[i]).filter(Boolean);if(!L.length)return"";const sh=L.slice(0,max);
  return`<div class="ev">${sh.map((c,i)=>`<button class="th" data-cr="${c.id}" aria-label="Ver criativo: ${esc(c.titulo)}">${thumbSVG(c)}<span class="pl">${c.plataforma}</span>${i===max-1&&L.length>max?`<span class="mais">+${L.length-max+1}</span>`:""}</button>`).join("")}</div>`}

/* ---------- cartão de movimento ---------- */
let MINI=0;
function moveCard(m,{i=0,compact=false}={}){
  const rr=respostasDe(m),id="mini"+(MINI++);
  let ev="";
  if(m.criativos&&m.criativos.length)ev=thumbsHTML(m.criativos,4),use("criativos");
  if(m.evidencia==="preco"){ev+=`<div class="mini cv" id="${id}"></div>`;use("precos");later(()=>miniPreco($("#"+id),m))}
  if(m.evidencia==="leilao"){ev+=`<div class="mini cv" id="${id}"></div>`;use("leilao");later(()=>miniLeilao($("#"+id),m))}
  return`<article class="mv ${m.nivel}" style="animation-delay:${Math.min(i,8)*60}ms" id="${m.id}">
    <div class="hd">${whoH(m.marca)}${tipoTag(m.tipo)}${nivelTag(m.nivel)}<span class="when" data-tip="${fDY(pd(m.data))}">${quando(m.data)}</span></div>
    <h3>${esc(m.titulo)}</h3>${compact?"":`<p class="rs">${esc(m.resumo)}</p>`}
    <div class="meta"><span>Canais: <b>${esc(lista(m.canais))}</b></span><span>Mensagem: <b>${esc(m.territorio)}</b></span>${m.oferta?`<span>Oferta: <b>${esc(m.oferta)}</b></span>`:""}<span>Peso${pesoH(m.peso)}</span></div>
    ${compact?"":ev}
    ${m.seguinte&&!compact?`<div class="next"><svg class="ic"><use href="#i-pulse"/></svg><div><b>O que costuma seguir-se.</b> ${esc(m.seguinte)}</div></div>`:""}
    <div class="acts"><button class="btn sm" data-mv="${m.id}"><svg class="ic"><use href="#i-eye"/></svg>Ver detalhe</button>${rr.map(respBtn).join("")}${!rr.length&&m.nivel!=="info"?`<span class="t-xs">Sem resposta combinada para isto.</span>`:""}</div></article>`}

/* ---------- gaveta ---------- */
function openDrawer(html){const d=$("#drawer");d.innerHTML=`<button class="iconbtn dx" data-close aria-label="Fechar"><svg class="ic"><use href="#i-x"/></svg></button>`+html;d.classList.add("on");d.setAttribute("aria-hidden","false");$("#scrim").classList.add("on");AFTER.forEach(f=>f());AFTER.length=0;setTimeout(()=>$("[data-close]",d).focus(),50)}
function closeDrawer(){const d=$("#drawer");d.classList.remove("on");d.setAttribute("aria-hidden","true");$("#scrim").classList.remove("on")}
document.addEventListener("click",e=>{if(e.target.closest("[data-close]")||e.target.id==="scrim")closeDrawer()});
document.addEventListener("keydown",e=>{if(e.key==="Escape"){closeDrawer();$("#pop").classList.remove("on")}});

function moveDetail(m){
  const rr=respostasDe(m),mk=MK[m.marca],id="dm"+(MINI++);
  let ev="";
  if(m.criativos.length)ev+=`<h4>Prova: ${m.criativos.length} criativo${m.criativos.length>1?"s":""}</h4>`+thumbsHTML(m.criativos,9);
  if(m.evidencia==="preco"){ev+=`<h4>${esc(D.precos.rotulo)}</h4><div class="cv" id="${id}"></div>`;later(()=>miniPreco($("#"+id),m,true))}
  if(m.evidencia==="leilao"){ev+=`<h4>Presença nas pesquisas da ${esc(cliente().nome)} (% de sobreposição)</h4><div class="cv" id="${id}"></div>`;later(()=>miniLeilao($("#"+id),m,true))}
  const hist=m.historico&&m.historico.length?`<h4>Histórico desta ${m.tipo==="Teste de criativos"?"série":"campanha"}</h4><table class="tbl"><thead><tr><th>Ano</th><th>Arranque</th><th class="n">Semanas no ar</th></tr></thead><tbody>${m.historico.map(h=>`<tr><td>${h.ano}</td><td>${fDY(pd(h.inicio))} (semana ${h.semana})</td><td class="n">${h.duracao}</td></tr>`).join("")}</tbody></table>`:"";
  openDrawer(`<div class="hd" style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">${whoH(m.marca)}${tipoTag(m.tipo)}${nivelTag(m.nivel)}</div>
   <h2>${esc(m.titulo)}</h2><p class="muted">${esc(m.resumo)}</p>
   <div class="meta"><span>${fDY(pd(m.data))}</span><span>Canais: <b>${esc(lista(m.canais))}</b></span><span>Mensagem: <b>${esc(m.territorio)}</b></span>${m.oferta?`<span>Oferta: <b>${esc(m.oferta)}</b></span>`:""}</div>
   ${m.seguinte?`<div class="next"><svg class="ic"><use href="#i-pulse"/></svg><div><b>O que costuma seguir-se.</b> ${esc(m.seguinte)}</div></div>`:""}
   ${ev}${hist}
   <h4>Porque aparece como «${NIVEL[m.nivel]}»</h4><div class="why">${m.porque.map(p=>`<div><span>${esc(p.razao)}</span><b>+${p.pontos}</b></div>`).join("")}<div style="background:none"><span>Total (importante a partir de 75, a acompanhar a partir de 50)</span><b>${m.importancia}</b></div></div>
   <h4>Respostas combinadas</h4>${rr.length?rr.map(r=>`<div class="next" style="grid-template-columns:1fr"><div><b>${esc(r.nome)}</b> · ${esc(estadoR(r))} · ${esc(r.quem)}, ${esc(r.prazo)}<br>${esc(r.o_que)}</div></div>`).join("")+`<p style="margin-top:10px"><button class="btn sm" data-go="${D.cliente.id}/respostas">Abrir Respostas</button></p>`:`<p class="muted t-sm">Não há resposta combinada para este tipo de movimento. Vale a pena preparar uma com o cliente.</p>`}
   <h4>Mais da ${esc(mk.nome)}</h4><p><button class="btn sm" data-go="${D.cliente.id}/concorrentes/${mk.id}"><svg class="ic"><use href="#i-users"/></svg>Abrir a ficha da ${esc(mk.nome)}</button></p>
   <p class="foot">Origem: demonstração. Marca fictícia; dados simulados.</p>`)}
function creativeDetail(c){const m=MK[c.marca];
  openDrawer(`<div class="hd" style="display:flex;gap:8px;align-items:center">${whoH(c.marca)}<span class="tag">${esc(c.plataforma)} · ${esc(c.formato)}</span>${c.teste?`<span class="tag warn">Teste</span>`:""}</div>
   <h2>${esc(c.titulo)}</h2><div class="big-th">${thumbSVG(c)}</div>
   <div class="meta" style="margin-top:14px"><span>No ar: <b>${fD(wDate(c.ini))} a ${c.fim>=Z?"hoje":fD(wDate(c.fim+1))}</b></span><span>Mensagem: <b>${esc(c.territorio)}</b></span>${c.oferta?`<span>Oferta: <b>${esc(c.oferta)}</b></span>`:""}<span>Variantes: <b>${c.variantes}</b></span><span>Alcance estimado: <b>${nf(c.alcance)}</b></span></div>
   ${c.campanha?`<p class="t-sm" style="margin-top:12px">Campanha: <b>${esc(c.campanha)}</b></p>`:""}
   ${c.cls?`<div class="clsbox"><div class="clh"><b>Classificação automática</b><span class="seal" data-o="estimado" style="height:20px">Estimado</span></div><div class="meta"><span>Mecânica: <b>${esc(c.cls.mecanica)}</b></span><span>Tom: <b>${esc(c.cls.tom)}</b></span><span>Público: <b>${esc(c.cls.publico)}</b></span><span>Pede: <b>${esc(c.cls.acao)}</b></span></div><p class="foot">${esc(D.blocos.classificacao.metodo)}.</p></div>`:""}
   <p class="foot" style="margin-top:16px">Ilustração de demonstração (marca fictícia). Na versão ligada mostra-se o criativo original da biblioteca de anúncios, com ligação para a fonte.</p>`)}
document.addEventListener("click",e=>{let t;
  if(t=e.target.closest("[data-mv]")){const m=MV[t.dataset.mv];if(m)moveDetail(m);return}
  if(t=e.target.closest("[data-cr]")){const c=CR[t.dataset.cr];if(c)creativeDetail(c)}});
