/* ============================================================
   «Respostas»: o que está combinado com o cliente para cada tipo de movimento. A velocidade é a vantagem:
   quando um movimento corresponde, a equipa decide ativar. Nada é ativado automaticamente.
   ============================================================ */
function pageRespostas(sub,focus){
  use("respostas","movimentos","previsoes");
  const cl=cliente(),R=D.respostas,A=agora();
  const at=R.filter(r=>estadoR(r)==="ativada").length,pr=R.filter(r=>estadoR(r)==="pronta").length,pp=R.filter(r=>estadoR(r)==="por preparar").length;
  const semR=A.filter(m=>m.nivel!=="info"&&!m.respostas.length);
  const card=r=>{const e=estadoR(r),mv=A.filter(m=>m.respostas.includes(r.id)),pv=D.previsoes.filter(p=>p.respostas.includes(r.id)),log=(MEM.resp[D.cliente.id+"|"+r.id]||{});
    const q=r.quando,cond=[q.tipos&&("tipo: "+q.tipos.join(" ou ").toLowerCase()),q.territorios&&("mensagem: "+q.territorios.join(" ou ").toLowerCase()),q.marcas&&("marca: "+q.marcas.map(x=>MK[x]?MK[x].nome:x).join(" ou ")),q.peso_min&&("peso alto"),q.series&&("série: "+q.series.map(s=>(D.previsoes.find(p=>p.serie===s)||{nome:s}).nome).join(", "))].filter(Boolean);
    return`<article class="pb ${e==="por preparar"&&(mv.length||pv.length)?"gap":""}" id="${r.id}"><div class="hd"><h3>${esc(r.nome)}</h3><span class="tag ${e==="pronta"?"ok":e==="ativada"?"hi":"warn"}">${e==="pronta"?"Pronta":e==="ativada"?"Ativada":"Por preparar"}</span></div>
      <dl><dt>Quando</dt><dd>${esc(cond.join(" · ")||"qualquer movimento")}</dd><dt>O que fazemos</dt><dd>${esc(r.o_que)}</dd><dt>Quem e prazo</dt><dd>${esc(r.quem)} · ${esc(r.prazo)}</dd><dt>Com o cliente</dt><dd>${r.acordada?"Acordada com o cliente":"Ainda não acordada com o cliente"}</dd>${log.quando?`<dt>Decisão</dt><dd>${log.estado==="ativada"?"Ativada":"Marcada como pronta"} a ${esc(log.quando)} pela equipa</dd>`:""}</dl>
      ${mv.length?`<div class="hit2"><b>Esta semana:</b> ${mv.map(m=>`<button class="lnk" data-mv="${m.id}">${esc(m.titulo)}</button>`).join(" · ")}</div>`:""}
      ${pv.length?`<div class="next" style="margin-top:10px"><svg class="ic"><use href="#i-cal"/></svg><div><b>A seguir:</b> ${pv.map(p=>`${esc(MK[p.marca].nome)}: ${esc(p.nome)} (${fD(wDate(p.provavel))})`).join(" · ")}</div></div>`:""}
      <div class="acts">${e==="pronta"&&mv.length?`<button class="btn pri" data-rset="${r.id}" data-v="ativada"><svg class="ic"><use href="#i-check"/></svg>Ativar (a equipa decide)</button>`:""}${e==="por preparar"?`<button class="btn" data-rset="${r.id}" data-v="pronta"><svg class="ic"><use href="#i-check"/></svg>Marcar como pronta</button>`:""}${e==="ativada"?`<button class="btn ghost" data-rset="${r.id}" data-v="pronta">Desfazer ativação</button>`:""}</div></article>`};
  const ord=[...R].sort((a,b)=>(A.some(m=>m.respostas.includes(b.id))-A.some(m=>m.respostas.includes(a.id)))||(estadoR(a)==="por preparar")-(estadoR(b)==="por preparar"));
  if(focus)later(()=>setTimeout(()=>{const el=document.getElementById(focus);if(el)el.scrollIntoView({behavior:RM?"auto":"smooth",block:"start"})},80));
  return pheadHTML(`${esc(cl.nome)} · combinadas com o cliente`,"Respostas","O que fazemos quando a concorrência se mexe, acordado de antemão. Quando um movimento corresponde, a equipa decide se ativa. Nada é ativado sozinho.")+
   `<div class="kpis"><div class="kpi"><span class="l">Prontas</span><span class="big">${pr}</span><span class="s">acordadas e com material</span></div><div class="kpi"><span class="l">Por preparar</span><span class="big">${pp}</span><span class="s">falta acordar ou produzir</span></div><div class="kpi"><span class="l">Ativadas</span><span class="big">${at}</span><span class="s">nesta demonstração</span></div><div class="kpi"><span class="l">Movimentos sem resposta</span><span class="big">${semR.length}</span><span class="s">desta semana, importantes ou a acompanhar</span></div></div>
   ${semR.length?secHTML("Lacunas desta semana","Movimentos relevantes para os quais não há nada combinado.",semR.map(m=>`<div class="pb gap"><div class="hd"><div>${whoH(m.marca)} ${tipoTag(m.tipo)}<h3 style="margin-top:6px">${esc(m.titulo)}</h3></div><button class="btn" data-nova="${m.id}"><svg class="ic"><use href="#i-pen"/></svg>Propor resposta</button></div></div>`).join("")):""}
   ${secHTML("Respostas combinadas",`${R.length} no total. As que correspondem a movimentos desta semana aparecem primeiro.`,ord.map(card).join(""))}`}
document.addEventListener("click",e=>{let t;
  if(t=e.target.closest("[data-rset]")){const k=D.cliente.id+"|"+t.dataset.rset,v=t.dataset.v,d=new Date();MEM.resp[k]={estado:v,quando:`${d.getDate()} ${MES[d.getMonth()]} ${d.getFullYear()}, ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`};saveMem();
    toast(v==="ativada"?"Resposta ativada pela equipa. Na versão ligada fica registada e avisa quem a executa.":"Resposta marcada como pronta.");rerender();return}
  if(t=e.target.closest("[data-nova]")){toast("Na versão ligada, abre o formulário de resposta já preenchido com este movimento, para combinar com o cliente.");return}
  if(t=e.target.closest("[data-resp]")){go(`${D.cliente.id}/respostas#${t.dataset.resp}`)}});
