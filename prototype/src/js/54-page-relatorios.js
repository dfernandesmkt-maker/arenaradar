/* ============================================================
   Página «Relatórios»: briefing semanal e publicação para o cliente.
   A plataforma sugere; a equipa decide. NADA chega ao cliente sem a equipa publicar (separador «Publicar para o cliente»).
   A versão para o cliente sai assinada pela Arena Media, sem autoria individual (D03).
   Exportação em PDF por impressão do navegador.
   ============================================================ */
const pubMais=(arr,f,n=6)=>arr.slice(0,n).map(f).join("")+(arr.length>n?`<details class="mais"><summary>Ver os outros ${arr.length-n}</summary>${arr.slice(n).map(f).join("")}</details>`:"");   // listas longas: 6 visíveis
const mondayLabel=()=>{const d=new Date(wDateMs(Z+1));return d.getUTCDate()+" "+MES[d.getUTCMonth()]+" "+d.getUTCFullYear()};
function briefingHTML(){
  const cli=isCli()||S.bmode==="cliente",q=!!S.bquiet&&!isCli(),mat=D.sinais.filter(s=>s.material),obs=D.sinais.filter(s=>!s.material);
  const pk=(p,txt)=>`<div class="pk"><b>${txt}</b><span>${esc(p.acao)}</span></div>`;
  let corpo;
  if(cli){
    const cs=cartoesPub(),ps=pistasPub(),usadas=new Set();
    const bloco=s=>{const p=s.pista_id?ps.find(x=>x.id===s.pista_id):null;if(p)usadas.add(p.id);return`<div class="bsig" data-src="${use(s.bloco)}"><b>${esc(s.titulo)}</b><p>${esc(s.leitura)}${s.hipotese?" (leitura a validar)":""}</p>${p?pk(p,"A Arena propõe"):""}</div>`};
    const lista=cs.map(bloco).join(""),extra=ps.filter(p=>!usadas.has(p.id));
    corpo=`${pubNota()?`<section><h3>Nota da equipa</h3><p style="font-size:14.5px">${esc(pubNota())}</p></section>`:""}
     <section><h3>O que mudou e o que propomos</h3>${cs.length?lista:`<p style="font-size:14.5px;color:#586764">${isCli()?"A equipa não destacou nenhum ponto nesta edição.":"Ainda não marcaste cartões para o cliente. Marca-os na Visão geral ou em «Publicar para o cliente»."}</p>`}</section>
     ${extra.length?`<section><h3>Outras propostas da Arena</h3>${extra.map(p=>pk(p,esc(p.titulo))).join("")}</section>`:""}`;
  }else{
    const lista=q||!D.sinais.length?`<p style="font-size:14.5px">Nenhum sinal ultrapassou o limiar esta semana. O Radar continua a observar, e isso também é informação.</p>`
     :[...mat,...obs].map(s=>{const p=s.pista_id?D.pistas.find(x=>x.id===s.pista_id):null;return`<div class="bsig" data-src="${use(s.bloco)}"><b>${esc(s.titulo)}${s.novo?' <span class="bnw">novo</span>':""}${s.material?"":' <span style="color:#586764;font-weight:500">(em observação)</span>'}</b><p>${esc(s.leitura)}${s.hipotese?' <span class="tag">Hipótese</span>':""}</p>${p&&p.s!=="descartada"?pk(p,`Pista para ${esc(p.para)} · ${STL[p.s].toLowerCase()}${p.cli?", marcada para o cliente":""}`):""}</div>`}).join("");
    const ex=D.brief.extras;
    corpo=`<section><h3>O que mudou e o que significa</h3>${lista}</section>
     ${ex.length?`<section><h3>Destaques acrescentados pela equipa</h3>${ex.map(x=>`<div class="bsig brx"><div><b>${esc(x.t)}</b><p>${esc(x.txt)}</p></div><button class="no-print" data-brm="${x.id}" aria-label="Retirar do briefing" data-tip="Retirar do briefing">✕</button></div>`).join("")}</section>`:""}`}
  const sl=sealInfo(new Set(D.sinais.map(s=>s.bloco)));
  return`<header><img alt="" src="${$(".logo-tile img").src}"><div><b>Arena Radar, ${esc(D.cliente.nome)}</b><span>Semana de ${D.calendario.rotulo_semana_atual}</span></div></header>
   <div class="mb">${corpo}
   <p class="ft">${cli?"Proposta da Arena Media, validada pela equipa de conta.":"Versão interna. Nada é enviado ao cliente sem decisão da equipa."} Origem dos dados: ${esc(sl.t.toLowerCase())}.</p></div>`}

/* ---------- Publicar para o cliente (só vista Equipa): rascunho, pré-visualização ao lado, publicado e histórico ---------- */
const PGN={visao:"Visão geral",mercado:"Mercado",procura:"Procura e notícias",criativos:"Criativos",relatorios:"Relatório semanal"};
const cnt=(n,s,p)=>`<b>${n}</b> ${n===1?s:p}`;
const resumoDe=v=>`${cnt(v.paginas.length,"página","páginas")}, ${cnt(v.cartoes.length,"cartão","cartões")}, ${cnt(v.pistas.length,"pista","pistas")}${v.nota?" e a nota da equipa":", sem nota"}`;
function pubResumo(){const pu=D.pub,r=pubRasc();
  return pu.pubd?`<span class="pl">Publicado: ${resumoDe(pu.pubd)}.</span><span class="pl">Rascunho: ${resumoDe(r)}.</span>`:`<span class="pl">Ao publicar, o cliente verá: ${resumoDe(r)}.</span>`}
function pubHeadHTML(){
  const pu=D.pub,pend=pubPend(),pb=!!pu.pubd,id=D.cliente.id;
  const estado=pb?(pend?`<span class="seal" data-o="estimado">Alterações por publicar</span>`:`<span class="seal" data-o="real">Publicado a ${fmtDT(pu.pubd.quando)}</span>`):`<span class="seal" data-o="demo">Por publicar</span>`;
  const acts=pb?(pend?`<button class="btn pri" id="pubgo"><svg class="ic"><use href="#i-send"/></svg>Publicar alterações</button><button class="btn" id="pubrev">Descartar alterações</button>`:"")+`<button class="btn ghost" id="pubundo">Retirar publicação</button>`:`<button class="btn pri" id="pubgo"><svg class="ic"><use href="#i-send"/></svg>Publicar</button>`;
  return`<div><b style="font-weight:650">Vista do cliente</b> ${estado}<p class="t-sm muted" style="margin-top:6px;max-width:64ch">O cliente só vê o que foi publicado. Alterar o rascunho não muda nada até voltares a publicar, e o que sai é assinado pela Arena Media, sem autoria individual.</p><div class="pubsum t-sm" aria-live="polite">${pubResumo()}</div></div>
   <div class="pubacts">${acts}<button class="btn" data-go="${id}/visao?v=cliente&rasc=1"><svg class="ic"><use href="#i-eye"/></svg>Pré-visualizar rascunho</button>${pb?`<button class="btn" data-go="${id}/visao?v=cliente"><svg class="ic"><use href="#i-eye"/></svg>Ver o que o cliente vê</button>`:""}</div>`}
function pubPreviewHTML(){
  const v=pubRasc(),cs=D.sinais.filter(s=>v.cartoes.includes(s.id)),pg=PAGINAS_CLIENTE.filter(x=>(x!=="criativos"||hasAds())&&v.paginas.includes(x));
  return`<div class="pvh"><img alt="" src="${$(".logo-tile img").src}"><div><b>Arena Radar · ${esc(D.cliente.nome)}</b><span>Semana de ${D.calendario.rotulo_semana_atual}</span></div></div>
   ${v.nota?`<p class="pvn">${esc(v.nota)}</p>`:""}
   <div class="pvs"><h5>O que mudou</h5>${cs.length?cs.map(s=>`<div class="pvc"><b>${esc(s.titulo)}</b><span>${esc(s.leitura)}${s.hipotese?" (leitura a validar)":""}</span></div>`).join(""):`<p class="pve">Nenhum cartão escolhido.</p>`}</div>
   <div class="pvs"><h5>O que a Arena propõe</h5>${v.pistas.length?v.pistas.map(x=>`<div class="pvc pk"><b>${esc(x.titulo)}</b><span>${esc(x.acao)}</span></div>`).join(""):`<p class="pve">Nenhuma pista escolhida.</p>`}</div>
   <div class="pvs"><h5>Páginas</h5><div class="pvp">${pg.map(x=>`<span>${PGN[x]}</span>`).join("")}</div></div>
   <p class="pvf">Proposta da Arena Media, validada pela equipa de conta.</p>`}
const pubLive=()=>{const h=$("#pubhead"),w=$("#pvw");if(h)h.innerHTML=pubHeadHTML();if(w)w.innerHTML=pubPreviewHTML();const s=$("#pubstate");if(s)s.hidden=!(D.pub.pubd&&pubPend())};
function pubHistHTML(){const h=D.pub.hist;return h.length?`<div class="panel publ">${h.map(x=>`<div class="pubrow hist"><span class="hq">${fmtDT(x.q)}</span><span><b>${x.ev==="publicou"?"Publicou":x.ev==="atualizou"?"Publicou alterações":"Retirou a publicação"}</b>${x.n?` · ${x.n.p} ${x.n.p===1?"página":"páginas"}, ${x.n.c} ${x.n.c===1?"cartão":"cartões"}, ${x.n.k} ${x.n.k===1?"pista":"pistas"}`:""}<br><span class="t-sm muted">${esc(x.por)}</span></span></div>`).join("")}</div>`:emptyHTML("Sem histórico","Ainda não publicaste nada para este cliente.")}
function pPublicar(){
  const pu=D.pub,pgs=PAGINAS_CLIENTE.filter(p=>p!=="criativos"||hasAds()),pk=D.pistas;
  use("anuncios");
  return`<div class="pubgrid"><div class="pubmain">
   <div class="pubbox" id="pubhead">${pubHeadHTML()}</div>
   ${secHTML("Páginas visíveis ao cliente","A Visão geral é sempre incluída. Liga ou desliga as restantes.",`<div class="chips">${pgs.map(p=>`<button class="tgl" data-pubpg="${p}" aria-pressed="${pu.paginas.includes(p)}" ${p==="visao"?"disabled":""}>${PGN[p]}</button>`).join("")}</div>`)}
   ${secHTML("Cartões «O que mudou»","Escolhe os pontos que o cliente vê. Os limiares e as hipóteses internas não aparecem na vista do cliente.",D.sinais.length?`<div class="panel publ">${pubMais(D.sinais,s=>`<label class="pubrow"><input type="checkbox" data-pubsgc="${s.id}" ${pu.cartoes.includes(s.id)?"checked":""}><span><b>${esc(s.titulo)}</b><br><span class="t-sm muted">${esc(s.categoria)} · ${s.material?"acima do limiar":"em observação"}</span></span></label>`)}</div>`:emptyHTML("Sem cartões","Ainda não há sinais para destacar."),null,`<div class="pubtools"><button class="btn sm" id="pubsug" data-tip="Escolhe os cartões acima do limiar. Podes ajustar a seguir.">Usar seleção sugerida</button><button class="btn sm ghost" id="pubclr">Limpar</button></div>`)}
   ${secHTML("Pistas de ação","Só podes levar ao cliente pistas que a equipa aceitou ou ajustou.",pk.length?`<div class="panel publ">${pubMais(pk,p=>`<label class="pubrow ${pubOk(p)?"":"off"}"><input type="checkbox" data-pubpkc="${p.id}" ${p.cli&&pubOk(p)?"checked":""} ${pubOk(p)?"":"disabled"}><span><b>${esc(p.titulo)}</b><br><span class="t-sm muted">${pubOk(p)?esc(p.acao):`Por decidir em Ações: aceita ou ajusta primeiro. <a href="#" data-go="${D.cliente.id}/acoes/pistas#${p.id}" style="color:var(--link);font-weight:600">Abrir a pista</a>`}</span></span></label>`)}</div>`:emptyHTML("Sem pistas","Não há pistas para esta semana."))}
   ${secHTML("Nota da equipa","Opcional. Aparece no topo da vista do cliente e no relatório.",`<textarea class="edit" id="pubnota" placeholder="Ex.: Segue o ponto de situação desta semana. Falamos na reunião de acompanhamento." aria-label="Nota da equipa">${esc(pu.nota)}</textarea><p class="t-xs" style="margin-top:6px">Rascunho guardado neste navegador.</p>`)}
   ${secHTML("Histórico de publicações","Quem publicou ou retirou, e quando.",pubHistHTML())}
   <p class="t-sm muted" style="margin-top:22px;max-width:64ch">Esta é uma pré-visualização: a forma de entrega ao cliente (acesso, convite) decide-se com IT e Compliance.</p>
  </div>
  <aside class="pubprev" aria-label="Pré-visualização do que o cliente vê"><div class="pvcap"><b>O que o cliente verá</b><span class="t-xs">Rascunho, atualizado ao escolher</span></div><div class="pvw" id="pvw">${pubPreviewHTML()}</div><button class="btn" style="width:100%;justify-content:center;margin-top:10px" data-go="${D.cliente.id}/visao?v=cliente&rasc=1"><svg class="ic"><use href="#i-eye"/></svg>Abrir pré-visualização completa</button></aside></div>`}

const RTABS=[["briefing","Briefing semanal"],["publicar","Publicar para o cliente"]];
function pageRelatorios(sub){
  const t=!isCli()&&sub==="publicar"?"publicar":"briefing";S.bmode=S.bmode||"equipa";
  const tabs=isCli()?"":`<div class="tabs sub" role="tablist" aria-label="Relatórios">${RTABS.map(x=>`<button role="tab" aria-selected="${x[0]===t}" data-go="relatorios/${x[0]}">${x[1]}</button>`).join("")}</div>`;
  let body;
  if(t==="publicar")body=pPublicar();
  else body=`<div class="no-print" style="display:flex;gap:12px;flex-wrap:wrap;align-items:center;margin-bottom:16px">
     ${isCli()?"":`<div class="seg" id="bseg"><button data-b="equipa" aria-pressed="${S.bmode==="equipa"}">Equipa</button><button data-b="cliente" aria-pressed="${S.bmode==="cliente"}">Cliente (pré-visualização)</button></div>`}<span style="flex:1"></span>
     ${EM_ARTEFACTO?"":`<button class="btn" id="bprint"><svg class="ic"><use href="#i-print"/></svg>Exportar PDF</button>`}</div>
    <div class="mailwrap"><article class="mail" id="mail">${briefingHTML()}</article></div>`;
  return pheadHTML(`Segunda-feira, ${mondayLabel()}, 9h00`,isCli()?"Relatório semanal":"Relatórios",isCli()?"O resumo da semana preparado pela equipa Arena Media.":"O briefing de segunda-feira e a publicação para o cliente. A versão interna mostra tudo; o cliente só vê o que a equipa publicar.",{sm:true})+tabs+body}
document.addEventListener("click",e=>{let t;
  if(t=e.target.closest("#bseg button")){S.bmode=t.dataset.b;CUR.refresh();return}
  if(e.target.closest("#bprint")){window.print();return}
  if(t=e.target.closest("[data-pubpg]")){const p=t.dataset.pubpg,a=D.pub.paginas,i=a.indexOf(p);i<0?a.push(p):a.splice(i,1);t.setAttribute("aria-pressed",String(i<0));saveState();pubLive();return}
  if(e.target.closest("#pubgo")){const nv=!D.pub.pubd;pubPublicar(D);toast(nv?"Publicado para a vista do cliente (pré-visualização). Nada sai da agência: a entrega é uma decisão com IT e Compliance.":"Alterações publicadas. O cliente passa a ver a nova versão.");CUR.refresh();return}
  if(e.target.closest("#pubundo")){pubRetirar(D);toast("Publicação retirada. O cliente deixa de ver o relatório; o rascunho mantém-se.");CUR.refresh();return}
  if(e.target.closest("#pubrev")){pubDescartar(D);toast("Alterações descartadas. O rascunho voltou ao que está publicado.");CUR.refresh();return}
  if(e.target.closest("#pubsug")){pubSugerir(true);toast("Escolhidos os cartões acima do limiar. Ajusta como quiseres.");CUR.refresh();return}
  if(e.target.closest("#pubclr")){D.pub.cartoes=[];saveState();CUR.refresh();return}
  if(e.target.closest("[data-sugerir]")){pubSugerir(false);go(`${D.cliente.id}/visao?v=cliente&rasc=1`);return}});
/* Seleção sugerida: os cartões acima do limiar. Só preenche o rascunho vazio, salvo se «forcar». */
function pubSugerir(forcar){if(!forcar&&D.pub.cartoes.length)return;D.pub.cartoes=D.sinais.filter(s=>s.material).map(s=>s.id);saveState()}
document.addEventListener("change",e=>{let t;
  if(t=e.target.closest("[data-pubsgc]")){const id=t.dataset.pubsgc,a=D.pub.cartoes;t.checked?(a.includes(id)||a.push(id)):a.splice(a.indexOf(id),1);saveState();pubLive();return}
  if(t=e.target.closest("[data-pubpkc]")){const p=D.pistas.find(x=>x.id===t.dataset.pubpkc);if(p){p.cli=t.checked;saveState();pubLive();syncCounts&&syncCounts()}}});
document.addEventListener("input",e=>{if(e.target.id==="pubnota"){D.pub.nota=e.target.value;saveState();pubLive()}});
