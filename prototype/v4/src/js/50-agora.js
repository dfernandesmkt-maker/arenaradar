/* ============================================================
   «Agora»: o fio de movimentos da concorrência. Primeiro ecrã: o que mexeu, quem, com que prova,
   o que costuma seguir-se e se há resposta combinada. A plataforma sugere; a equipa decide.
   ============================================================ */
let FA={tipo:"Todos",marca:"",per:1};
function pageAgora(){
  use("movimentos","previsoes","briefing");
  const cl=cliente(),A=agora(),imp=A.filter(m=>m.nivel==="importante"),top=A[0];
  const pr=A.filter(m=>respostasDe(m).some(r=>estadoR(r)==="pronta")).length;
  const emc=concorrentes().filter(m=>D.ritmo[m.id].em_curso.length);
  const media=mean(range(Z-8,Z-1).map(w=>D.movimentos.filter(m=>m.semana===w&&!MK[m.marca].cliente).length));
  const pv=D.previsoes[0];
  const L=D.movimentos.filter(m=>m.semana>Z-FA.per&&(FA.tipo==="Todos"||m.tipo===FA.tipo)&&(!FA.marca||m.marca===FA.marca)).sort((a,b)=>FA.per===1?b.importancia-a.importancia:b.data.localeCompare(a.data)||b.importancia-a.importancia);
  const base=D.movimentos.filter(m=>m.semana>Z-FA.per),tps=TIPOS.filter(t=>base.some(m=>m.tipo===t));
  const chips=`<div class="chips" role="group" aria-label="Tipo de movimento"><button data-ft="Todos" aria-pressed="${FA.tipo==="Todos"}">Todos <span class="n">${base.length}</span></button>${tps.map(t=>`<button data-ft="${t}" aria-pressed="${FA.tipo===t}">${t} <span class="n">${base.filter(m=>m.tipo===t).length}</span></button>`).join("")}</div>`;
  const per=`<div class="chips" role="group" aria-label="Período">${[[1,"Esta semana"],[4,"4 semanas"],[13,"3 meses"]].map(([k,l])=>`<button data-fp="${k}" aria-pressed="${FA.per===k}">${l}</button>`).join("")}</div>`;
  const sel=`<select class="sel" data-fm aria-label="Marca"><option value="">Todas as marcas</option>${concorrentes().map(m=>`<option value="${m.id}" ${FA.marca===m.id?"selected":""}>${esc(m.nome)}</option>`).join("")}</select>`;
  const up=D.previsoes.slice(0,5).map(p=>`<button data-go="${D.cliente.id}/antecipar#${p.id}"><span class="w">${fD(wDate(p.provavel))}</span><span><span class="t">${dotH(MK[p.marca])} ${esc(MK[p.marca].nome)}: ${esc(p.nome)}</span><br><span class="d">${p.tipo} · janela ${fD(wDate(p.ini))} a ${fD(wDate(p.fim+1))} · <span class="conf" data-c="${p.confianca}">confiança ${p.confianca}</span></span></span></button>`).join("");
  const lei=concorrentes().filter(m=>D.leilao[m.id]).map(m=>({m,v:D.leilao[m.id][Z],d:D.leilao[m.id][Z]-D.leilao[m.id][Z-4]})).sort((a,b)=>b.v-a.v);
  use("leilao");
  const aside=`<aside class="aside">
    <div class="panel"><h3><svg class="ic"><use href="#i-cal"/></svg>A seguir</h3><div class="up">${up||`<p class="muted t-sm">Nada previsto nas próximas semanas.</p>`}</div><p style="margin-top:12px"><button class="btn sm" data-go="${D.cliente.id}/antecipar">Ver as próximas 12 semanas</button></p></div>
    <div class="panel"><h3><svg class="ic"><use href="#i-search"/></svg>Quem aparece nas pesquisas da ${esc(cl.nome)}</h3>${lei.map(x=>`<div class="lrow">${dotH(x.m)}<span>${esc(x.m.nome)}</span><span class="v">${nf(x.v)}% <span class="t-xs" style="color:${x.d>=6?"var(--neg-ink)":"var(--text-2)"}">${sgn(x.d)} p.p.</span></span></div>`).join("")}<p class="foot">Sobreposição de impressões nas campanhas de pesquisa da ${esc(cl.nome)}, últimas 4 semanas (formato Auction Insights).</p></div>
    <div class="panel"><h3><svg class="ic"><use href="#i-bolt"/></svg>No ar agora</h3>${emc.length?emc.map(m=>D.ritmo[m.id].em_curso.map(c=>`<div class="lrow">${dotH(m)}<span>${esc(m.nome)}: ${esc(c.nome)}</span><span class="t-xs">sem. ${c.semana} de ~${c.de}</span></div>`).join("")).join(""):`<p class="muted t-sm">Nenhum concorrente com campanha no ar.</p>`}</div>
  </aside>`;
  MINI=0;
  return heroHTML(`${esc(cl.nome)} · semana de ${wRange(Z)}`,top?hl(esc(top.titulo)):"Semana calma: nenhum movimento da concorrência",
      `${A.length} movimento${A.length===1?"":"s"} da concorrência esta semana${imp.length?`, ${imp.length} importante${imp.length>1?"s":""}`:""}. ${pr?`${pr} ${pr>1?"têm":"tem"} resposta combinada pronta.`:"Nenhum tem resposta combinada pronta."} A equipa decide o que fazer.`)+
   `<div class="kpis">
     <div class="kpi"><span class="l">Movimentos esta semana</span><span class="big" data-count="${A.length}">${A.length}</span><span class="s">média das 8 semanas anteriores: ${nf(media,1)}</span></div>
     <div class="kpi"><span class="l">Importantes</span><span class="big" data-count="${imp.length}">${imp.length}</span><span class="s">${[...new Set(imp.map(m=>MK[m.marca].nome))].map(esc).join(", ")||"nenhum"}</span></div>
     <div class="kpi"><span class="l">Concorrentes no ar</span><span class="big">${emc.length} <span style="font-size:18px;color:var(--text-2)">de ${concorrentes().length}</span></span><span class="s">com campanha a decorrer</span></div>
     <div class="kpi"><span class="l">Próximo movimento esperado</span><span class="big" style="font-size:24px">${pv?fD(wDate(pv.provavel)):"—"}</span><span class="s">${pv?`${esc(MK[pv.marca].nome)}: ${esc(pv.nome)}`:"sem previsões"}</span></div>
   </div>
   <div class="lay" style="margin-top:26px"><div>
     ${briefingHTML()}
     <div class="feedbar">${per}${sel}</div><div style="margin:-4px 0 14px">${chips}</div>
     <div id="feed">${L.length?L.slice(0,FA.per===1?20:30).map((m,i)=>moveCard(m,{i})).join(""):emptyHTML("Sem movimentos com estes filtros","Muda o tipo, a marca ou o período.")}${L.length>30?`<p class="foot">A mostrar os 30 mais recentes de ${L.length}. Cada marca tem o histórico completo na sua ficha.</p>`:""}</div>
   </div>${aside}</div>`}
/* Resumo da semana (RB-114): escrito por IA (ou por regras, na demonstração), fica «por rever» até a equipa o rever.
   Só depois de revisto se pode copiar o rascunho do email para o cliente. Nada é enviado automaticamente.
   LIGAÇÃO[persistencia-equipa]: o estado «revisto» vive em localStorage; na versão ligada, na base partilhada. */
const bKey=()=>D.cliente.id+"|"+D.briefing.semana;
function briefingHTML(){const B=D.briefing,rev=MEM.brief&&MEM.brief[bKey()],ia=B.meta.autor==="ia";
  const li=x=>x.movimento&&MV[x.movimento]?`<li><button class="lk" data-mv="${x.movimento}">${esc(x.texto)}</button></li>`:`<li><span>${esc(x.texto)}</span></li>`;
  return `<div class="panel summary"><div class="sumhd"><h2 class="t-h2"><svg class="ic"><use href="#i-spark"/></svg>Resumo da semana</h2>${rev?`<span class="tag ok">Revisto por ${esc(rev.quem)} · ${esc(rev.quando)}</span>`:`<span class="tag warn">Por rever</span>`}</div>
    <p class="em30"><b>Em 30 segundos.</b> ${esc(B.em30s)}</p>
    <ul>${B.pontos.map(li).join("")}</ul>
    ${B.decisoes.length?`<h3 class="dech">Para a equipa decidir</h3><ul class="dec">${B.decisoes.map(li).join("")}</ul>`:""}
    <details class="mail"><summary>Rascunho de email para o cliente</summary><div class="mbox"><p><span class="muted">Assunto:</span> ${esc(B.para_cliente.assunto)}</p><div class="mbody">${esc(B.para_cliente.corpo)}</div></div></details>
    <div class="acts">${rev?`<button class="btn sm ghost" data-brev="0">Voltar a «por rever»</button>`:`<button class="btn sm pri" data-brev="1"><svg class="ic"><use href="#i-check"/></svg>Marcar como revisto</button>`}<button class="btn sm" data-bcopy ${rev?"":"disabled"}><svg class="ic"><use href="#i-copy"/></svg>Copiar o email</button>${rev?"":`<span class="t-xs muted">O email só se copia depois de revisto.</span>`}</div>
    <p class="foot">${ia?`Redigido por IA (${esc(B.meta.modelo)}) a partir dos movimentos da semana.`:`Escrito por regras a partir dos movimentos (demonstração). Na versão ligada é redigido por IA.`} A equipa revê e decide; nada é enviado ao cliente automaticamente.</p></div>`}
document.addEventListener("click",e=>{let t;
  if(t=e.target.closest("[data-brev]")){MEM.brief=MEM.brief||{};if(t.dataset.brev==="1"){MEM.brief[bKey()]={quem:"a equipa",quando:fD(new Date())};toast("Resumo marcado como revisto. Já podes copiar o email.")}else delete MEM.brief[bKey()];saveMem();rerender();return}
  if(t=e.target.closest("[data-bcopy]")){const B=D.briefing,txt=`Assunto: ${B.para_cliente.assunto}\n\n${B.para_cliente.corpo}`;
    (navigator.clipboard?navigator.clipboard.writeText(txt):Promise.reject()).then(()=>toast("Email copiado. Revê-o no teu cliente de email antes de enviar."),()=>toast("Não foi possível copiar neste navegador."));return}
  if(t=e.target.closest("[data-ft]")){FA.tipo=t.dataset.ft;rerender();return}
  if(t=e.target.closest("[data-fp]")){FA.per=+t.dataset.fp;FA.tipo="Todos";rerender()}});
document.addEventListener("change",e=>{if(e.target.matches("[data-fm]")){FA.marca=e.target.value;rerender()}});
