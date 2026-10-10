/* ============================================================
   Página «Relatórios»: briefing semanal (versão Equipa e versão Cliente, esta só com o que a equipa marcou).
   Exportação em PDF por impressão do navegador.
   A publicação formal para o cliente (vista Cliente) é a fase D (RB-75).
   ============================================================ */
const mondayLabel=()=>{const d=new Date(wDateMs(Z+1));return d.getUTCDate()+" "+MES[d.getUTCMonth()]+" "+d.getUTCFullYear()};
function briefingHTML(){
  const cli=S.bmode==="cliente",q=!!S.bquiet,mat=D.sinais.filter(s=>s.material),obs=D.sinais.filter(s=>!s.material);
  const sigs=q||!D.sinais.length?`<p style="font-size:14.5px">Nenhum sinal ultrapassou o limiar esta semana. O Radar continua a observar, e isso também é informação.</p>`
   :`<ul>${[...mat,...obs].map(s=>`<li data-src="${use(s.bloco)}"><span><b>${esc(s.titulo)}</b>${s.material?"":' <span style="color:#586764">(em observação)</span>'}</span></li>`).join("")}</ul>`;
  const first=mat[0]||obs[0];
  const read=q||!first?"":`<p style="font-size:14.5px">${esc(first.leitura)}${first.hipotese?' <span class="tag">Hipótese</span>':""}</p>`;
  const list=cli?D.pistas.filter(p=>p.cli):q?[]:D.pistas.filter(p=>p.s!=="descartada");
  const pk=list.length?`<ul>${list.map(p=>`<li class="pk"><b>${esc(p.titulo)}</b><span style="font-size:13.5px">${esc(p.acao)}</span><span style="font-size:12px;color:#586764">${STL[p.s]}${p.cli?", marcada para o cliente":""}</span></li>`).join("")}</ul>`
   :`<p style="font-size:14.5px;color:#586764">${cli?"Ainda não há pistas marcadas para o cliente. Decide em Ações quais levar.":"Sem pistas esta semana."}</p>`;
  const sl=sealInfo(new Set(D.sinais.map(s=>s.bloco)));
  return`<header><img alt="" src="${$(".logo-tile img").src}"><div><b>Arena Radar, ${esc(D.cliente.nome)}</b><span>Semana de ${D.calendario.rotulo_semana_atual}</span></div></header>
   <div class="mb">${cli?"":`<section><h3>O que mudou</h3>${sigs}</section><section>${q?"":`<h3>O que significa</h3>${read}`}</section>`}
   ${cli?`<section><h3>O que a Arena propõe</h3>${pk}</section>`:`<section><h3>Pistas de ação para a equipa</h3>${pk}</section>`}
   <p class="ft">${cli?"Proposta da Arena Media, validada pela equipa de conta.":"Versão interna. Nada é enviado ao cliente sem decisão da equipa."} Origem dos dados: ${esc(sl.t.toLowerCase())}.</p></div>`}
function pageRelatorios(){
  S.bmode=S.bmode||"equipa";
  const mail=briefingHTML();
  return pheadHTML(`Segunda-feira, ${mondayLabel()}, 9h00`,"Briefing semanal","O ponto de partida da conversa de segunda-feira. A versão interna mostra tudo; a versão para o cliente só leva o que a equipa decidiu partilhar.",{sm:true})+
   `<div class="no-print" style="display:flex;gap:12px;flex-wrap:wrap;align-items:center;margin-bottom:16px">
     <div class="seg" id="bseg"><button data-b="equipa" aria-pressed="${S.bmode==="equipa"}">Equipa</button><button data-b="cliente" aria-pressed="${S.bmode==="cliente"}">Cliente (opcional)</button></div>
     <button class="chip" id="bquiet" aria-pressed="${!!S.bquiet}">Simular semana sem sinais</button><span style="flex:1"></span>
     <button class="btn" id="bprint"><svg class="ic"><use href="#i-print"/></svg>Exportar PDF</button></div>
    <div class="mailwrap"><article class="mail" id="mail">${mail}</article></div>`}
document.addEventListener("click",e=>{let t;
  if(t=e.target.closest("#bseg button")){S.bmode=t.dataset.b;CUR.refresh();return}
  if(e.target.closest("#bquiet")){S.bquiet=!S.bquiet;CUR.refresh();return}
  if(e.target.closest("#bprint"))window.print()});
