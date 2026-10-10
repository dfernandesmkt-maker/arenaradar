/* ============================================================
   Página «Ações» (só vista Equipa): pistas de ação e impacto.
   A plataforma sugere; a equipa decide. Nada chega ao cliente sem decisão da equipa.
   O estado das pistas vive em memória (a persistência em ficheiro é a tarefa RB-22).
   ============================================================ */
const ATABS=[["pistas","Pistas de ação"],["alertas","Alertas"],["impacto","Impacto"]];
function pistaHTML(p){
  const dec=p.s==="aceite"||p.s==="ajustada";let act="";
  if(p.s==="sugerida")act=`<button class="btn pri" data-a="aceitar"><svg class="ic"><use href="#i-check"/></svg>Aceitar</button><button class="btn" data-a="ajustar"><svg class="ic"><use href="#i-pen"/></svg>Ajustar</button><button class="btn" data-a="descartar"><svg class="ic"><use href="#i-x"/></svg>Descartar</button>`;
  else if(dec)act=`<button class="btn" data-a="cliente">${p.cli?'<svg class="ic"><use href="#i-check"/></svg>Marcada para o cliente':'<svg class="ic"><use href="#i-send"/></svg>Preparar para o cliente (opcional)'}</button><button class="btn ghost" data-a="repor">Desfazer</button>`;
  else act=`<button class="btn" data-a="repor">Repor</button>`;
  const res=`<button class="btn ghost" data-a="research" ${p.res?"disabled":""}><svg class="ic"><use href="#i-flask"/></svg>${p.res?"Aprofundamento pedido à Research":"Pedir aprofundamento à Research"}</button>`;
  return`<article class="pista" id="${p.id}" data-id="${p.id}" data-src="${use(p.bloco)}">
   <div class="hd"><h2 class="t-h2" style="max-width:60ch">${esc(p.titulo)}</h2><span class="state" data-s="${p.s}">${STL[p.s]}</span></div>
   <div class="pchain"><div><h4>Sinal ${p.sinal_id?`<button class="lnk" data-why="${p.sinal_id}">Porquê?</button>`:""}</h4><p>${esc(p.sinal)}</p></div><div><h4>Leitura ${p.hipotese?'<span class="tag">Hipótese</span>':""}</h4><p>${esc(p.leitura)}</p></div><div class="act"><h4>Ação possível</h4><p data-act>${esc(p.acao)}</p></div></div>
   <div class="pfoot">${act}${res}<span class="sp"></span><span class="t-xs">Atribuída a</span><div class="seg">${["Performance","Brand","Account"].map(x=>`<button data-a="para" data-v="${x}" aria-pressed="${p.para===x}">${x}</button>`).join("")}</div></div><p class="conf" style="margin-top:10px">${esc(p.confianca)}</p></article>`}
function syncCounts(){const n=pistasPend(D),c=$("#navcnt");if(c){c.textContent=n;c.hidden=n===0}}
function refreshPista(id,flash){const p=D.pistas.find(x=>x.id===id),old=document.getElementById(id);if(!old)return;const tmp=document.createElement("div");tmp.innerHTML=pistaHTML(p);const n=tmp.firstElementChild;n.classList.add("in");if(flash)n.classList.add("just");old.replaceWith(n);syncCounts()}
/* ---------- Alertas: só eventos materiais (D: alertas apenas para o que muda de facto) ---------- */
const LIMLAB={anuncios_variacao_4s:["Variação da pressão publicitária (4 semanas face às 4 anteriores)",v=>nf(v*100)+"%"],quota_voz_pp_8s:["Variação da quota de voz do cliente (8 semanas)",v=>nf(v,1)+" p.p."],lancamento_criativos_2s:["Criativos novos de um concorrente (2 semanas)",v=>nf(v)+" criativos"],pesquisas_variacao_vs_media_8s:["Subida da procura face à média das 8 semanas anteriores",v=>nf(v*100)+"%"]};
const semanaFim=()=>new Date(wDateMs(Z)+6*DAY).toISOString().slice(0,10);
function alertas(){
  const out=[],q0=semanaFim(),lanc=new Set(D.sinais.filter(s=>s.categoria==="Lançamento").map(s=>s.entidade));
  D.sinais.filter(s=>s.material).forEach(s=>out.push({id:`s:${s.id}:${s.titulo}`,q:q0,sev:"material",t:s.titulo,d:s.leitura,e:s.entidade,go:s.pista_id?`acoes/pistas#${s.pista_id}`:sigGo(s),goL:s.pista_id?"Ver pista":"Ver detalhe",why:s.id,nw:!!s.novo}));
  if(hasAds()&&!isTema()){const cp={};ADS.filter(a=>a.camp&&!a.imp).forEach(a=>{const e=ebyid(a.b);if(!e||e.cliente||lanc.has(a.b))return;const k=a.b+"|"+a.camp,c=cp[k]||(cp[k]={b:a.b,n:a.camp,st:a.st,ds:a.ds,k:0,p:new Set()});c.st=Math.min(c.st,a.st);c.ds=Math.min(c.ds,a.ds);c.k++;c.p.add(a.p)});
   Object.values(cp).filter(c=>c.st>=Z-1&&c.k>=3).forEach(c=>out.push({id:`c:${c.b}:${c.n}`,q:new Date(c.ds).toISOString().slice(0,10),sev:"material",t:`${ebyid(c.b).nome} lançou «${c.n}»`,d:`${c.k} anúncios em ${[...c.p].join(", ")}.`,e:c.b,go:`criativos`,goL:"Ver criativos",cr:c.b}))}
  D.entidades.filter(e=>e.sugerida&&!e.incluida).forEach(e=>out.push({id:`b:${e.id}`,q:q0,sev:"info",t:`${e.nome}: marca sugerida pelo Radar`,d:`Aparece em ${e.sobreposicao}% das mesmas pesquisas. A equipa decide se entra no conjunto.`,e:e.id,go:"mercado/voz",goL:"Rever o conjunto"}));
  D.sinais.filter(s=>!s.material&&s.categoria==="Agenda").forEach(s=>out.push({id:`s:${s.id}:${s.titulo}`,q:q0,sev:"info",t:s.titulo,d:s.leitura,go:s.pista_id?`acoes/pistas#${s.pista_id}`:sigGo(s),goL:s.pista_id?"Ver pista":"Ver detalhe",why:s.id}));
  return out.sort((a,b)=>b.q.localeCompare(a.q)||(a.sev==="material"?-1:1))}
const alertasSeen=()=>new Set(PREFS.seen[D.cliente.id]||[]);
const alertasNovos=()=>{const s=alertasSeen();return alertas().filter(a=>!s.has(a.id))};
function marcarVistos(){PREFS.seen[D.cliente.id]=alertas().map(a=>a.id);savePrefs()}
const quandoRel=q=>{const d=Math.round((pd(semanaFim())-pd(q))/DAY);return d<=0?"esta semana":d===1?"há 1 dia":"há "+d+" dias"};
function aAlertas(){
  D.sinais.forEach(s=>use(s.bloco));if(hasAds())use("anuncios");
  const all=alertas(),seen=alertasSeen(),novos=all.filter(a=>!seen.has(a.id)),ant=all.filter(a=>seen.has(a.id)),nt=PREFS.notif[D.cliente.id]||{email:true,teams:false};
  later(()=>{marcarVistos();const b=$("#alcnt");if(b)b.hidden=true});
  const row=(a,nv)=>{const e=a.e?ebyid(a.e):null;return`<div class="alrow ${nv?"nv":""}"><span class="alsev" data-s="${a.sev}" data-tip="${a.sev==="material"?"Material: acima do limiar ou evento relevante":"Informativo: não ultrapassa o limiar"}">${a.sev==="material"?"Material":"Informativo"}</span>
    <div class="alb"><b>${esc(a.t)}</b>${a.nw?` <span class="tag nw">Novo</span>`:""}<p class="t-sm muted">${esc(a.d)}</p></div>
    <span class="alq t-sm muted">${quandoRel(a.q)}<br>${fmtShort(a.q)}</span>
    <div class="alact">${a.why?`<button class="btn ghost sm" data-why="${a.why}">Porquê?</button>`:""}${a.cr?`<button class="btn sm" data-cr-b="${a.cr}">${a.goL}</button>`:`<button class="btn sm" data-go="${a.go}">${a.goL}</button>`}</div></div>`};
  const lim=Object.entries(D.limiares||{}).filter(([k])=>LIMLAB[k]).map(([k,v])=>`<tr><td>${LIMLAB[k][0]}</td><td class="n">${LIMLAB[k][1](v)}</td></tr>`).join("");
  return`<p class="t-sm muted" style="max-width:70ch;margin-bottom:14px">O Radar só avisa de eventos materiais: um sinal acima do limiar, o lançamento de uma campanha ou uma mudança que justifica olhar. «Sem alertas» também é um resultado.</p>
   ${all.length?`${novos.length?`<h2 class="t-h3" style="margin:6px 0 8px">Novos desde a tua última visita <span class="tag nw">${novos.length}</span></h2><div class="panel alist">${novos.map(a=>row(a,true)).join("")}</div>`:`<div class="empty" style="margin-bottom:14px"><svg class="ic"><use href="#i-check"/></svg><div><b>Tudo visto</b><br>Não há alertas novos desde a tua última visita.</div></div>`}
    ${ant.length?`<h2 class="t-h3" style="margin:22px 0 8px">Anteriores</h2><div class="panel alist">${ant.map(a=>row(a,false)).join("")}</div>`:""}`:emptyHTML("Sem alertas esta semana","Nenhum evento material. O Radar continua a observar.")}
   ${secHTML("Como o Radar te avisa",`Preferências de ${esc(D.cliente.nome)}. Só guardadas neste navegador; a entrega real por e-mail e Teams liga-se com o IT.`,`<div class="panel" style="padding:6px 18px"><div class="setlist">
     <div class="setitem"><span class="nm">Resumo semanal por e-mail<br><span class="t-xs" style="font-weight:500">Segunda-feira às 9h00, com o briefing.</span></span><button class="tg" role="switch" aria-checked="${!!nt.email}" aria-label="Resumo semanal por e-mail" data-notif="email"></button></div>
     <div class="setitem"><span class="nm">Alerta imediato no Teams<br><span class="t-xs" style="font-weight:500">Só para alertas materiais.</span></span><button class="tg" role="switch" aria-checked="${!!nt.teams}" aria-label="Alerta imediato no Teams" data-notif="teams"></button></div></div></div>
    ${lim?`<h3 class="t-h3" style="margin:18px 0 8px">Limiares que decidem o que é material</h3><div class="panel tblwrap"><table><thead><tr><th>Regra</th><th class="n">Limiar</th></tr></thead><tbody>${lim}</tbody></table></div><p class="t-xs" style="margin-top:8px">Os limiares são da agência e cada cliente pode ajustá-los em <code>config/clients/${esc(D.cliente.id)}.yaml</code>.</p>`:""}`)}`}
document.addEventListener("click",e=>{const t=e.target.closest("[data-notif]");if(!t)return;const k=t.dataset.notif,c=D.cliente.id,o=PREFS.notif[c]||(PREFS.notif[c]={email:true,teams:false});o[k]=!o[k];savePrefs();t.setAttribute("aria-checked",String(!!o[k]));toast(k==="email"?(o[k]?"Resumo semanal por e-mail ligado.":"Resumo semanal por e-mail desligado."):(o[k]?"Alertas no Teams ligados.":"Alertas no Teams desligados."))});
function aPistas(){
  if(!D.pistas.length)return emptyHTML("Sem pistas esta semana","Quando um sinal ultrapassar o limiar, aparece aqui uma pista para a equipa decidir.");
  later(()=>requestAnimationFrame(()=>$$(".pista").forEach(e=>e.classList.add("in"))));
  const mine=ROLE_PARA[PREFS.role],filt=mine&&S.minhas!==false,lista=filt?D.pistas.filter(p=>p.para===mine):D.pistas;
  const rb=mine?`<div class="rolebar">${filt?`A mostrar as pistas atribuídas a <b>${mine}</b> (${lista.length} de ${D.pistas.length}).`:`A mostrar todas as pistas.`} <button class="lnk" data-minhas="${filt?"0":"1"}">${filt?"Ver todas":"Só as minhas"}</button></div>`:"";
  return`<p class="t-sm muted" style="max-width:70ch;margin-bottom:6px">Cada pista liga o sinal à leitura e a uma ação de meios possível, atribuída a Performance, Brand ou Account. É uma ferramenta interna: levar uma pista ao cliente é opcional e decisão da equipa.</p>${rb}<div id="pistas">${lista.length?lista.map(pistaHTML).join(""):emptyHTML("Nenhuma pista atribuída a "+mine,"Muda a atribuição de uma pista ou escolhe «Ver todas».")}</div>`}
document.addEventListener("click",e=>{const t=e.target.closest("[data-minhas]");if(!t)return;S.minhas=t.dataset.minhas==="1";CUR.refresh()});
function aImpacto(){
  const P=D.pistas,s=P.length,a=pistasDecididas(D).length,c=P.filter(p=>p.cli&&(p.s==="aceite"||p.s==="ajustada")).length,d=P.filter(p=>p.s==="descartada").length;
  const st=[["Sinais que originaram pistas",D.sinais.filter(x=>x.pista_id).length,100],["Pistas sugeridas",s,100],["Aceites pela equipa",a,s?a/s*100:0],["Marcadas para o cliente",c,s?c/s*100:0],["Adotadas pelo cliente","—",0]];
  later(()=>requestAnimationFrame(()=>$$("#funnel i").forEach(i=>i.style.width=i.dataset.w+"%")));
  const nota=a===0?`<p class="t-sm muted" style="margin:0 0 14px;max-width:70ch">O Impacto segue cada pista do sinal até à decisão da equipa e ao resultado observado. Ainda não há decisões: aceita ou descarta pistas em «Pistas de ação» e o funil começa a preencher-se.</p>`:"";
  return nota+`<div class="funnel" id="funnel">${st.map(x=>`<div class="fstep"><span class="t-xs">${x[0]}</span><span class="big">${x[1]}</span><span class="t-sm muted">${x[0].startsWith("Adotadas")?"o piloto ainda não começou":x[0].startsWith("Aceites")?d+" descartadas":" "}</span><i data-w="${x[2]}"></i></div>`).join("")}</div>
   ${secHTML("Decisões desta semana","Do sinal ao resultado. O histórico real começa no piloto; até lá, estes números contam as decisões desta pré-visualização.",s?`<div class="panel tblwrap"><table><thead><tr><th>Pista</th><th>Atribuída a</th><th>Estado</th></tr></thead><tbody>${P.map(p=>`<tr class="go" data-go="acoes/pistas#${p.id}"><td style="font-weight:600">${esc(p.titulo)}</td><td>${esc(p.para)}</td><td>${STL[p.s]}${p.cli?", marcada para o cliente":""}</td></tr>`).join("")}</tbody></table></div>`:emptyHTML("Sem decisões","Ainda não há pistas."))}`}
function pageAcoes(sub,focus){
  const t=ATABS.find(x=>x[0]===sub)?sub:"pistas";S.tab.acoes=t;SEAL_HIDE=t==="impacto";
  const body=`<div class="tabs sub" role="tablist" aria-label="Ações">${ATABS.map(x=>{const n=x[0]==="pistas"?pistasPend(D):x[0]==="alertas"&&t!=="alertas"?alertasNovos().length:0;return`<button role="tab" aria-selected="${x[0]===t}" data-go="acoes/${x[0]}">${x[1]}${n?` <span class="cnt" ${x[0]==="alertas"?'id="alcnt"':""} style="display:inline-grid;margin-left:4px;vertical-align:middle;min-width:20px;height:20px;border-radius:99px;background:var(--brand-ink);color:#fff;font-size:11px;font-weight:600;place-items:center;padding:0 6px">${n}</span>`:""}</button>`}).join("")}</div>${t==="pistas"?aPistas():t==="alertas"?aAlertas():aImpacto()}`;
  if(focus)later(()=>setTimeout(()=>{const el=document.getElementById(focus);if(el){el.scrollIntoView({behavior:RM?"auto":"smooth",block:"start"});el.classList.add("just")}},120));
  return pheadHTML("A plataforma sugere. A equipa decide.","Ações",`Pistas de ação, alertas e impacto de ${esc(D.cliente.nome)}.`,{sm:true})+body}
document.addEventListener("click",e=>{const b=e.target.closest("#pistas [data-a]");if(!b)return;const el=b.closest(".pista"),p=D.pistas.find(x=>x.id===el.dataset.id),a=b.dataset.a;
  if(a==="aceitar"){p.s="aceite";toast("Pista aceite. Nada é enviado ao cliente: a equipa decide se e como a leva.")}
  else if(a==="descartar"){p.s="descartada";toast("Pista descartada. Fica registada no Impacto.")}
  else if(a==="para"){p.para=b.dataset.v;saveState();toast("Pista atribuída a "+p.para+".");refreshPista(p.id);return}
  else if(a==="repor"){p.s="sugerida";p.cli=false}
  else if(a==="cliente"){p.cli=!p.cli;toast(p.cli?"Marcada para o rascunho da vista do cliente. Só chega ao cliente quando publicares em Relatórios.":"Retirada do rascunho da vista do cliente.")}
  else if(a==="research"){p.res=true;toast("Pedido de aprofundamento enviado à Research (simulação).")}
  else if(a==="ajustar"){const pa=$("[data-act]",el);pa.innerHTML=`<textarea class="edit" aria-label="Ação possível">${esc(p.acao)}</textarea><div style="margin-top:8px;display:flex;gap:8px"><button class="btn pri" data-a="guardar"><svg class="ic"><use href="#i-check"/></svg>Guardar ajuste</button><button class="btn ghost" data-a="cancelar">Cancelar</button></div>`;$("textarea",pa).focus();return}
  else if(a==="guardar"){p.acao=$("textarea",el).value.trim()||p.acao;p.s="ajustada";toast("Ajuste guardado. A pista fica aceite com a tua versão.")}
  else if(a==="cancelar"){refreshPista(p.id);return}
  saveState();refreshPista(p.id,a!=="research"&&a!=="cliente")});
