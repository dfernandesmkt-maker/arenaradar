/* ============================================================
   «Concorrentes»: uma ficha viva por marca. Estado atual, ritmo, linha temporal (passado e previsto),
   movimentos, biblioteca de criativos e mensagens.
   ============================================================ */
let FC={terr:"",n:12,mv:8};
function pageConcorrentes(sub){
  if(sub&&MK[sub])return fichaMarca(MK[sub]);
  use("movimentos","volume","investimento");
  const cl=cliente();
  const cards=concorrentes().map(m=>{const r=D.ritmo[m.id],ult=movsMarca(m.id)[0],a=range(Z-25,Z).map(w=>ativos(m.id,w)),em=r.em_curso[0],pv=D.previsoes.find(p=>p.marca===m.id);
    return`<button class="cc" data-go="${D.cliente.id}/concorrentes/${m.id}"><div class="nm">${dotH(m)}${esc(m.nome)}</div><div class="pa">${esc(m.papel)} · ${esc(m.posicionamento)}</div>
     <div class="state">${em?`<span class="tag sig">No ar: ${esc(em.nome)} · semana ${em.semana} de ~${em.de}</span>`:`<span class="tag">Sem campanha no ar</span>`}</div>
     <div class="spk" data-tip="Anúncios ativos nas últimas 26 semanas">${spark(a,240,40,col(m))}</div>
     ${ult?`<div class="ln"><span class="t-xs">Último movimento · ${quando(ult.data)}</span><br>${esc(ult.titulo)}</div>`:""}
     ${pv?`<div class="ln"><span class="t-xs">A seguir</span><br>${esc(pv.nome)} · ${fD(wDate(pv.provavel))} <span class="conf" data-c="${pv.confianca}">(${pv.confianca})</span></div>`:""}</button>`}).join("");
  return pheadHTML(`${esc(cl.nome)} · ${esc(D.cliente.setor)}`,"Concorrentes",`${concorrentes().length} marcas acompanhadas. Cada ficha junta tudo o que a marca fez em 2 anos e o que deve fazer a seguir.`)+`<div class="cgrid">${cards}</div>`}

function fichaMarca(m){
  use("movimentos","criativos","volume","investimento","previsoes","classificacao");
  const r=D.ritmo[m.id],cl=cliente(),mv=movsMarca(m.id),Ls=D.criativos.filter(c=>c.marca===m.id&&c.ini>Z-52&&(!FC.terr||c.territorio===FC.terr)).sort((a,b)=>b.ini-a.ini||a.id.localeCompare(b.id));
  const a0=ativos(m.id,Z),a4=ativos(m.id,Z-4),inv12=sum(range(Z-11,Z).map(w=>D.investimento[m.id][w])),novos=D.criativos.filter(c=>c.marca===m.id&&c.ini>Z-4).length;
  const em=r.em_curso[0],pv=D.previsoes.filter(p=>p.marca===m.id);
  // linha temporal: 52 semanas para trás e o futuro
  const w0=Z-51,w1=Z+CAL.futuro,cs=D.campanhas.filter(c=>c.marca===m.id&&c.fim>=w0);
  const rows=[
    {label:"Campanhas",c:col(m),bars:cs.filter(c=>c.tipo==="campanha").map(c=>({ini:c.ini,fim:Math.min(c.fim,Z),tip:`${c.nome}: ${wRange(c.ini)} · ${c.dur} semanas · ${c.territorio}`,go:(mv.find(x=>x.ocorrencia===c.id)||{}).id})).concat(pv.filter(p=>p.tipo==="Campanha").map(p=>({ini:p.ini,fim:p.fim,dash:true,tip:`Previsto: ${p.nome}, janela ${fD(wDate(p.ini))} a ${fD(wDate(p.fim+1))} (confiança ${p.confianca})`})))},
    {label:"Promoções e preço",c:col(m),bars:pv.filter(p=>p.tipo==="Promoção").map(p=>({ini:p.ini,fim:p.fim,dash:true,tip:`Previsto: ${p.nome}`})),marks:mv.filter(x=>["Promoção","Preço"].includes(x.tipo)).map(x=>({w:x.semana,tip:`${fD(pd(x.data))}: ${x.titulo}`,mv:x.id}))},
    {label:"Testes e leilão",c:col(m),bars:[],marks:mv.filter(x=>["Teste de criativos","Leilão"].includes(x.tipo)).map(x=>({w:x.semana,tip:`${fD(pd(x.data))}: ${x.titulo}`,mv:x.id}))},
    {label:"Lançamentos e imprensa",c:col(m),bars:[],marks:mv.filter(x=>["Lançamento","Imprensa"].includes(x.tipo)).map(x=>({w:x.semana,tip:`${fD(pd(x.data))}: ${x.titulo}`,mv:x.id}))}];
  later(()=>swimlane($("#tlm"),{rows,w0,w1,events:D.calendario_setor,aria:"Linha temporal da "+m.nome}));
  // mensagens: territórios nos criativos das últimas 26 semanas, marca vs cliente
  const tsh=id=>{const L=D.criativos.filter(c=>c.marca===id&&c.fim>=Z-25),n=L.length||1;return D.territorios.map(t=>L.filter(c=>c.territorio===t).length/n*100)};
  const tm=tsh(m.id),tc=tsh(cl.id);
  // como comunica: classificação automática dos criativos das últimas 26 semanas (RB-114), marca vs cliente
  const cls=id=>{const L=D.criativos.filter(c=>c.marca===id&&c.fim>=Z-25),n=L.length||1,top=k=>{const t={};L.forEach(c=>t[c.cls[k]]=(t[c.cls[k]]||0)+1);const [v,q]=Object.entries(t).sort((a,b)=>b[1]-a[1])[0]||["—",0];return{v,p:q/n*100}};
    return{of:L.filter(c=>c.cls.mecanica!=="Sem oferta").length/n*100,mec:top("mecanica"),tom:top("tom"),pub:top("publico"),n:L.length}};
  const km=cls(m.id),kc=cls(cl.id);
  const terrChips=`<div class="chips"><button data-fterr="" aria-pressed="${!FC.terr}">Todos</button>${D.territorios.map(t=>`<button data-fterr="${esc(t)}" aria-pressed="${FC.terr===t}">${esc(t)}</button>`).join("")}</div>`;
  const ml=mv.filter(x=>x.semana>Z-52);
  return`<button class="crumb" data-go="${D.cliente.id}/concorrentes"><svg class="ic" style="width:15px;height:15px"><use href="#i-back"/></svg>Concorrentes</button>`+
   pheadHTML(`${esc(m.papel)} · ${esc(D.cliente.vertical)}`,`${dotH(m)} ${esc(m.nome)}`,esc(m.posicionamento))+
   `<div style="margin:-12px 0 20px;display:flex;gap:8px;flex-wrap:wrap">${em?`<span class="tag sig">No ar: ${esc(em.nome)} · semana ${em.semana} de ~${em.de}</span>`:`<span class="tag">Sem campanha no ar</span>`}${pv.map(p=>`<span class="tag">A seguir: ${esc(p.nome)} · ${fD(wDate(p.provavel))}</span>`).join("")}</div>
   <div class="kpis">
     <div class="kpi"><span class="l">Anúncios ativos</span><span class="big" data-count="${a0}">${a0}</span><span class="s">${sgn(a0-a4)} face a há 4 semanas</span></div>
     <div class="kpi"><span class="l">Criativos novos</span><span class="big" data-count="${novos}">${novos}</span><span class="s">nas últimas 4 semanas</span></div>
     <div class="kpi"><span class="l">Investimento estimado</span><span class="big" style="font-size:26px">${eur(inv12)}</span><span class="s">12 semanas, digital e TV (estimado)</span></div>
     <div class="kpi"><span class="l">Quota de voz</span><span class="big" data-count="${D.quota[m.id][Z]}" data-dec="1" data-suf="%">${nf(D.quota[m.id][Z],1)}%</span><span class="s">anúncios ativos esta semana</span></div>
   </div>
   ${secHTML("Ritmo","Como esta marca costuma agir. Calculado a partir dos 2 anos de histórico.",`<div class="ritmo"><div><span class="l">Campanhas em 12 meses</span><div class="v">${r.campanhas_12m}${r.duracao_media?` · ${nf(r.duracao_media,1)} semanas cada`:""}</div></div><div><span class="l">Meses mais fortes</span><div class="v">${r.meses_fortes.join(", ")||"—"}</div></div><div><span class="l">Promoções em 12 meses</span><div class="v">${r.promocoes_12m}</div></div><div><span class="l">Testa criativos antes?</span><div class="v">${r.testa_antes?"Sim, cerca de 2 semanas antes":"Não se vê esse padrão"}</div></div></div>`)}
   ${secHTML("Linha temporal","Últimos 12 meses e as próximas 12 semanas. A tracejado: o que se espera pelo histórico. Faixa amarela: datas do setor.",`<div class="panel pad"><div class="tl" id="tlm"></div><div class="legend2"><span><i style="background:${col(m)}"></i>Campanha</span><span><i style="background:transparent;border:1.5px dashed ${col(m)}"></i>Previsto</span><span><i style="background:var(--surface);border:2px solid ${col(m)};border-radius:50%;width:11px;height:11px"></i>Movimento (clica para ver)</span><span><i style="background:color-mix(in srgb,var(--accent) 45%,transparent)"></i>Data do setor</span></div></div>`)}
   ${secHTML("Movimentos",`${ml.length} nos últimos 12 meses.`,`<div class="panel mlist">${ml.slice(0,FC.mv).map(x=>`<button class="mrow" data-mv="${x.id}"><span class="d">${fDY(pd(x.data))}</span><span class="ty">${tipoTag(x.tipo)}</span><span>${esc(x.titulo)}</span><span class="ar">${nivelTag(x.nivel)}</span></button>`).join("")}</div>${ml.length>FC.mv?`<p style="text-align:center;margin-top:8px"><button class="btn ghost sm" data-fmore>Mostrar todos (${ml.length})</button></p>`:""}`)}
   ${secHTML("Biblioteca de criativos",`${Ls.length} criativos nos últimos 12 meses${FC.terr?` sobre ${esc(FC.terr.toLowerCase())}`:""}. Ilustrações de demonstração; na versão ligada, os anúncios originais.`,`<div style="margin-bottom:12px">${terrChips}</div><div class="crgrid">${Ls.slice(0,FC.n).map(c=>`<button class="cr" data-cr="${c.id}"><div class="th">${thumbSVG(c)}<span class="pl">${c.plataforma}</span></div><div class="cb"><b>${esc(c.titulo)}</b>${esc(c.formato)} · desde ${fD(wDate(c.ini))}${c.teste?" · teste":""}</div></button>`).join("")}</div>${Ls.length>FC.n?`<p style="text-align:center;margin-top:12px"><button class="btn ghost sm" data-crmore>Mostrar mais</button></p>`:""}`)}
   ${km.n?secHTML("Como comunica",`Classificação automática dos ${km.n} criativos das últimas 26 semanas: mecânica da oferta, tom e público. Ao lado, a ${esc(cl.nome)}.`,`<div class="ritmo"><div><span class="l">Criativos com oferta</span><div class="v">${nf(km.of)}%</div><span class="t-xs muted">${esc(cl.nome)}: ${nf(kc.of)}%</span></div><div><span class="l">Mecânica mais usada</span><div class="v">${esc(km.mec.v)}</div><span class="t-xs muted">${nf(km.mec.p)}% dos criativos · ${esc(cl.nome)}: ${esc(kc.mec.v)}</span></div><div><span class="l">Tom dominante</span><div class="v">${esc(km.tom.v)}</div><span class="t-xs muted">${nf(km.tom.p)}% · ${esc(cl.nome)}: ${esc(kc.tom.v)}</span></div><div><span class="l">Público principal</span><div class="v">${esc(km.pub.v)}</div><span class="t-xs muted">${nf(km.pub.p)}% dos criativos</span></div></div><p class="foot">${esc(D.blocos.classificacao.metodo)}. A equipa pode corrigir cada classificação na versão ligada.</p>`):""}
   ${secHTML("Mensagens",`Parte dos criativos da ${esc(m.nome)} por território, nas últimas 26 semanas, ao lado da ${esc(cl.nome)}.`,`<div class="card"><div class="bars">${D.territorios.map((t,i)=>`<div class="bar"><span>${esc(t)}</span><span class="tr" style="display:grid;gap:3px;height:auto;background:none"><span class="tr"><i style="width:${tm[i]}%;background:${col(m)}"></i></span><span class="tr"><i style="width:${tc[i]}%;background:${col(cl)};opacity:.55"></i></span></span><span class="v">${nf(tm[i])}% <span class="t-xs">vs ${nf(tc[i])}%</span></span></div>`).join("")}</div>${legendH([{n:m.nome,c:col(m)},{n:cl.nome,c:col(cl)}])}</div>`)}`}
document.addEventListener("click",e=>{let t;
  if(t=e.target.closest("[data-fterr]")){FC.terr=t.dataset.fterr;FC.n=12;rerender();return}
  if(e.target.closest("[data-crmore]")){FC.n+=12;rerender();return}
  if(e.target.closest("[data-fmore]")){FC.mv=200;rerender()}});
