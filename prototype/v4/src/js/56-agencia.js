/* ============================================================
   Nível Agência: Torre (todos os clientes de relance) e Fontes de dados (o que a versão ligada vai ler).
   ============================================================ */
function pageTorre(){
  const cur=D.cliente.id,cards=[],tops=[],next=[];
  AG.clientes.forEach(c=>{setClient(c.id);const A=agora(),imp=A.filter(m=>m.nivel==="importante"),pp=D.respostas.filter(r=>estadoR(r)==="por preparar"&&(A.some(m=>m.respostas.includes(r.id))||D.previsoes.some(p=>p.respostas.includes(r.id))));
    cards.push(`<button class="tc" data-go="${c.id}/agora"><div class="t-xs">${esc(c.setor)}</div><div class="nm">${esc(c.nome)}</div>
      <div class="st3"><div><b>${A.length}</b><span>movimentos esta semana</span></div><div><b>${imp.length}</b><span>importantes</span></div><div><b>${D.previsoes.length}</b><span>esperados em 12 semanas</span></div></div>
      ${A[0]?`<div class="top1">${dotH(MK[A[0].marca])} ${esc(A[0].titulo)}</div>`:""}
      ${pp.length?`<p class="t-xs" style="margin-top:10px;color:var(--warn-ink)">${pp.length} resposta${pp.length>1?"s":""} por preparar para algo que já está a acontecer ou vem aí</p>`:`<p class="t-xs" style="margin-top:10px">Respostas em dia</p>`}</button>`);
    imp.forEach(m=>tops.push({c,m,nome:MK[m.marca].nome,cor:col(MK[m.marca])}));
    D.previsoes.slice(0,3).forEach(p=>next.push({c,p,nome:MK[p.marca].nome,cor:col(MK[p.marca]),w:wDate(p.provavel)}))});
  setClient(cur);SEAL=["movimentos","previsoes"];
  next.sort((a,b)=>a.w-b.w);
  return heroHTML(`Semana de ${wRange(Z)} · ${esc(AG.agencia.nome)}`,`${tops.length} movimentos importantes em ${AG.clientes.length} clientes`,"O que mexeu na concorrência de cada cliente esta semana e o que vem a seguir. Clica num cliente para abrir o seu radar.")+
   `<div class="tgrid">${cards.join("")}</div>
   <div class="grid2" style="margin-top:16px">
    <div class="card"><h3>Importantes esta semana</h3><p>Em todos os clientes, por ordem de importância.</p><div class="mlist">${tops.sort((a,b)=>b.m.importancia-a.m.importancia).map(x=>`<button class="mrow" style="grid-template-columns:90px minmax(0,1fr)" data-go="${x.c.id}/agora"><span class="d">${esc(x.c.nome)}</span><span><i class="dot" style="background:${x.cor}"></i> ${esc(x.m.titulo)}</span></button>`).join("")}</div></div>
    <div class="card"><h3>A seguir</h3><p>Próximos movimentos esperados, pelo histórico de cada marca.</p><div class="mlist">${next.slice(0,6).map(x=>`<button class="mrow" style="grid-template-columns:90px minmax(0,1fr)" data-go="${x.c.id}/afrente#${x.p.id}"><span class="d">${fD(x.w)}</span><span><i class="dot" style="background:${x.cor}"></i> ${esc(x.nome)}: ${esc(x.p.nome)} <span class="t-xs">· ${esc(x.c.nome)} · confiança ${x.p.confianca}</span></span></button>`).join("")}</div></div>
   </div>`}

function pageFontes(){
  SEAL=[];
  const reg={"oficial":"Oficial","licenciada":"Licenciada","dados do cliente":"Dados do cliente","a validar":"A validar com Compliance"};
  return pheadHTML(`${esc(AG.agencia.nome)} · para IT e Compliance`,"Fontes de dados","O que a versão ligada vai ler. Na demonstração nenhuma fonte está ligada: todos os dados são simulados e todas as marcas são fictícias.")+
   `<div class="panel tblwrap"><table class="tbl"><thead><tr><th>Fonte</th><th>O que dá</th><th>Regime</th><th>Estado</th></tr></thead><tbody>${AG.fontes.map(f=>`<tr><td style="font-weight:600">${esc(f.nome)}${f.vertical?`<br><span class="t-xs">só ${f.vertical==="combustiveis"?"combustíveis":esc(f.vertical)}</span>`:""}</td><td>${esc(f.da)}${f.nota?`<br><span class="t-xs">${esc(f.nota)}</span>`:""}</td><td>${esc(reg[f.regime]||f.regime)}</td><td><span class="seal" data-o="pendente">Por ligar</span></td></tr>`).join("")}</tbody></table></div>
   ${secHTML("Como os dados chegam à interface","",`<div class="card"><p style="margin:0;max-width:none;font-size:14px;color:var(--text)">Cada fonte entra no gerador (<code>scripts/v4/gerar_dados.py</code>), que deteta os movimentos, calcula as previsões e liga cada um às respostas combinadas. A interface só lê o resultado. Cada dado leva a origem (real, estimado ou demonstração), a fonte e a data de recolha; o selo de cada página mostra-o. Os pontos de entrada estão marcados no código com <code>LIGAÇÃO[…]</code>.</p></div>`)}`}
