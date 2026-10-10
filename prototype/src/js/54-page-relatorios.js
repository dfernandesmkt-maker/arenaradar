/* ============================================================
   Página «Relatórios»: briefing semanal e publicação para o cliente.
   A plataforma sugere; a equipa decide. NADA chega ao cliente sem a equipa publicar (separador «Publicar para o cliente»).
   A versão para o cliente sai assinada pela Arena Media, sem autoria individual (D03).
   Exportação em PDF por impressão do navegador.
   ============================================================ */
const mondayLabel=()=>{const d=new Date(wDateMs(Z+1));return d.getUTCDate()+" "+MES[d.getUTCMonth()]+" "+d.getUTCFullYear()};
function briefingHTML(){
  const cli=isCli()||S.bmode==="cliente",q=!!S.bquiet&&!isCli(),mat=D.sinais.filter(s=>s.material),obs=D.sinais.filter(s=>!s.material);
  let corpo;
  if(cli){
    const cs=cartoesPub(),pk=pistasPub();
    corpo=`${D.pub.nota?`<section><h3>Nota da equipa</h3><p style="font-size:14.5px">${esc(D.pub.nota)}</p></section>`:""}
     <section><h3>O que mudou</h3>${cs.length?`<ul>${cs.map(s=>`<li data-src="${use(s.bloco)}"><span><b>${esc(s.titulo)}</b><br><span style="font-size:13.5px">${esc(s.leitura)}${s.hipotese?" (leitura a validar)":""}</span></span></li>`).join("")}</ul>`:`<p style="font-size:14.5px;color:#586764">${isCli()?"A equipa não destacou nenhum ponto nesta edição.":"Ainda não marcaste cartões para o cliente. Marca-os na Visão geral ou em «Publicar para o cliente»."}</p>`}</section>
     <section><h3>O que a Arena propõe</h3>${pk.length?`<ul>${pk.map(p=>`<li class="pk"><b>${esc(p.titulo)}</b><span style="font-size:13.5px">${esc(p.acao)}</span></li>`).join("")}</ul>`:`<p style="font-size:14.5px;color:#586764">${isCli()?"Sem propostas nesta edição.":"Ainda não há pistas marcadas para o cliente. Decide em Ações quais levar."}</p>`}</section>`;
  }else{
    const sigs=q||!D.sinais.length?`<p style="font-size:14.5px">Nenhum sinal ultrapassou o limiar esta semana. O Radar continua a observar, e isso também é informação.</p>`
     :`<ul>${[...mat,...obs].map(s=>`<li data-src="${use(s.bloco)}"><span><b>${esc(s.titulo)}</b>${s.material?"":' <span style="color:#586764">(em observação)</span>'}</span></li>`).join("")}</ul>`;
    const first=mat[0]||obs[0],read=q||!first?"":`<p style="font-size:14.5px">${esc(first.leitura)}${first.hipotese?' <span class="tag">Hipótese</span>':""}</p>`;
    const list=q?[]:D.pistas.filter(p=>p.s!=="descartada");
    const pk=list.length?`<ul>${list.map(p=>`<li class="pk"><b>${esc(p.titulo)}</b><span style="font-size:13.5px">${esc(p.acao)}</span><span style="font-size:12px;color:#586764">${STL[p.s]}${p.cli?", marcada para o cliente":""}</span></li>`).join("")}</ul>`:`<p style="font-size:14.5px;color:#586764">Sem pistas esta semana.</p>`;
    corpo=`<section><h3>O que mudou</h3>${sigs}</section><section>${q?"":`<h3>O que significa</h3>${read}`}</section><section><h3>Pistas de ação para a equipa</h3>${pk}</section>`}
  const sl=sealInfo(new Set(D.sinais.map(s=>s.bloco)));
  return`<header><img alt="" src="${$(".logo-tile img").src}"><div><b>Arena Radar, ${esc(D.cliente.nome)}</b><span>Semana de ${D.calendario.rotulo_semana_atual}</span></div></header>
   <div class="mb">${corpo}
   <p class="ft">${cli?"Proposta da Arena Media, validada pela equipa de conta.":"Versão interna. Nada é enviado ao cliente sem decisão da equipa."} Origem dos dados: ${esc(sl.t.toLowerCase())}.</p></div>`}

/* ---------- Publicar para o cliente (só vista Equipa) ---------- */
const PGN={visao:"Visão geral",mercado:"Mercado",procura:"Procura e notícias",criativos:"Criativos",relatorios:"Relatório semanal"};
function pPublicar(){
  const pu=D.pub,pgs=PAGINAS_CLIENTE.filter(p=>p!=="criativos"||hasAds()),pk=D.pistas,ok=p=>p.s==="aceite"||p.s==="ajustada";
  const estado=pu.publicada?`<span class="seal" data-o="real" style="background:color-mix(in srgb,var(--ok) 15%,transparent)">Publicado${pu.quando?" a "+fmtDt(pu.quando):""}</span>`:`<span class="seal" data-o="demo">Por publicar</span>`;
  use("anuncios");
  return`<div class="pubbox"><div><b style="font-weight:650">Vista do cliente</b> ${estado}<p class="t-sm muted" style="margin-top:6px;max-width:64ch">O cliente só vê o que escolheres aqui. Nada é automático, e o que sai é assinado pela Arena Media, sem autoria individual. Esta é uma pré-visualização: a forma de entrega ao cliente (acesso, convite) decide-se com IT e Compliance.</p></div>
    <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn" data-go="${D.cliente.id}/visao?v=cliente"><svg class="ic"><use href="#i-eye"/></svg>Pré-visualizar como cliente</button>${pu.publicada?`<button class="btn" id="pubundo">Retirar publicação</button>`:`<button class="btn pri" id="pubgo"><svg class="ic"><use href="#i-send"/></svg>Publicar</button>`}</div></div>
   ${secHTML("Páginas visíveis ao cliente","A Visão geral é sempre incluída. Liga ou desliga as restantes.",`<div class="chips">${pgs.map(p=>`<button class="fchip" data-pubpg="${p}" aria-pressed="${pu.paginas.includes(p)}" ${p==="visao"?"disabled":""}>${PGN[p]}</button>`).join("")}</div>`)}
   ${secHTML("Cartões «O que mudou»","Escolhe os pontos que o cliente vê. Os limiares e as hipóteses internas não aparecem na vista do cliente.",D.sinais.length?`<div class="panel publ">${D.sinais.map(s=>`<label class="pubrow"><input type="checkbox" data-pubsgc="${s.id}" ${pu.cartoes.includes(s.id)?"checked":""}><span><b>${esc(s.titulo)}</b><br><span class="t-sm muted">${esc(s.categoria)} · ${s.material?"acima do limiar":"em observação"}</span></span></label>`).join("")}</div>`:emptyHTML("Sem cartões","Ainda não há sinais para destacar."))}
   ${secHTML("Pistas de ação","Só podes levar ao cliente pistas que a equipa aceitou ou ajustou.",pk.length?`<div class="panel publ">${pk.map(p=>`<label class="pubrow ${ok(p)?"":"off"}"><input type="checkbox" data-pubpkc="${p.id}" ${p.cli&&ok(p)?"checked":""} ${ok(p)?"":"disabled"}><span><b>${esc(p.titulo)}</b><br><span class="t-sm muted">${ok(p)?esc(p.acao):"Por decidir em Ações: aceita ou ajusta primeiro."}</span></span></label>`).join("")}</div>`:emptyHTML("Sem pistas","Não há pistas para esta semana."))}
   ${secHTML("Nota da equipa","Opcional. Aparece no topo da vista do cliente e no relatório.",`<textarea class="edit" id="pubnota" placeholder="Ex.: Segue o ponto de situação desta semana. Falamos na reunião de acompanhamento." aria-label="Nota da equipa">${esc(pu.nota)}</textarea><p class="t-xs" style="margin-top:6px">Guardado neste navegador.</p>`)}`}

const RTABS=[["briefing","Briefing semanal"],["publicar","Publicar para o cliente"]];
function pageRelatorios(sub){
  const t=!isCli()&&sub==="publicar"?"publicar":"briefing";S.bmode=S.bmode||"equipa";
  const tabs=isCli()?"":`<div class="tabs sub" role="tablist" aria-label="Relatórios">${RTABS.map(x=>`<button role="tab" aria-selected="${x[0]===t}" data-go="relatorios/${x[0]}">${x[1]}</button>`).join("")}</div>`;
  let body;
  if(t==="publicar")body=pPublicar();
  else body=`<div class="no-print" style="display:flex;gap:12px;flex-wrap:wrap;align-items:center;margin-bottom:16px">
     ${isCli()?"":`<div class="seg" id="bseg"><button data-b="equipa" aria-pressed="${S.bmode==="equipa"}">Equipa</button><button data-b="cliente" aria-pressed="${S.bmode==="cliente"}">Cliente (pré-visualização)</button></div>
     <button class="chip" id="bquiet" aria-pressed="${!!S.bquiet}">Simular semana sem sinais</button>`}<span style="flex:1"></span>
     <button class="btn" id="bprint"><svg class="ic"><use href="#i-print"/></svg>Exportar PDF</button></div>
    <div class="mailwrap"><article class="mail" id="mail">${briefingHTML()}</article></div>`;
  return pheadHTML(`Segunda-feira, ${mondayLabel()}, 9h00`,isCli()?"Relatório semanal":"Relatórios",isCli()?"O resumo da semana preparado pela equipa Arena Media.":"O briefing de segunda-feira e a publicação para o cliente. A versão interna mostra tudo; o cliente só vê o que a equipa publicar.",{sm:true})+tabs+body}
document.addEventListener("click",e=>{let t;
  if(t=e.target.closest("#bseg button")){S.bmode=t.dataset.b;CUR.refresh();return}
  if(e.target.closest("#bquiet")){S.bquiet=!S.bquiet;CUR.refresh();return}
  if(e.target.closest("#bprint")){window.print();return}
  if(t=e.target.closest("[data-pubpg]")){const p=t.dataset.pubpg,a=D.pub.paginas,i=a.indexOf(p);i<0?a.push(p):a.splice(i,1);saveState();CUR.refresh();return}
  if(e.target.closest("#pubgo")){D.pub.publicada=true;D.pub.quando=new Date().toISOString().slice(0,10);saveState();toast("Publicado para a vista do cliente (pré-visualização). Nada sai da agência: a entrega é uma decisão com IT e Compliance.");CUR.refresh();return}
  if(e.target.closest("#pubundo")){D.pub.publicada=false;saveState();toast("Publicação retirada. O cliente deixa de ver o relatório.");CUR.refresh();return}});
document.addEventListener("change",e=>{let t;
  if(t=e.target.closest("[data-pubsgc]")){const id=t.dataset.pubsgc,a=D.pub.cartoes;t.checked?(a.includes(id)||a.push(id)):a.splice(a.indexOf(id),1);saveState();return}
  if(t=e.target.closest("[data-pubpkc]")){const p=D.pistas.find(x=>x.id===t.dataset.pubpkc);if(p){p.cli=t.checked;saveState();syncCounts&&syncCounts()}}});
document.addEventListener("input",e=>{if(e.target.id==="pubnota"){D.pub.nota=e.target.value;saveState()}});
