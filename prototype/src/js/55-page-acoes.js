/* ============================================================
   Página «Ações» (só vista Equipa): pistas de ação e impacto.
   A plataforma sugere; a equipa decide. Nada chega ao cliente sem decisão da equipa.
   O estado das pistas vive em memória (a persistência em ficheiro é a tarefa RB-22).
   ============================================================ */
const ATABS=[["pistas","Pistas de ação"],["impacto","Impacto"]];
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
function aPistas(){
  if(!D.pistas.length)return emptyHTML("Sem pistas esta semana","Quando um sinal ultrapassar o limiar, aparece aqui uma pista para a equipa decidir.");
  later(()=>requestAnimationFrame(()=>$$(".pista").forEach(e=>e.classList.add("in"))));
  return`<p class="t-sm muted" style="max-width:70ch;margin-bottom:6px">Cada pista liga o sinal à leitura e a uma ação de meios possível, atribuída a Performance, Brand ou Account. É uma ferramenta interna: levar uma pista ao cliente é opcional e decisão da equipa.</p><div id="pistas">${D.pistas.map(pistaHTML).join("")}</div>`}
function aImpacto(){
  const P=D.pistas,s=P.length,a=pistasDecididas(D).length,c=P.filter(p=>p.cli&&(p.s==="aceite"||p.s==="ajustada")).length,d=P.filter(p=>p.s==="descartada").length;
  const st=[["Sinais que originaram pistas",D.sinais.filter(x=>x.pista_id).length,100],["Pistas sugeridas",s,100],["Aceites pela equipa",a,s?a/s*100:0],["Marcadas para o cliente",c,s?c/s*100:0],["Adotadas pelo cliente","—",0]];
  later(()=>requestAnimationFrame(()=>$$("#funnel i").forEach(i=>i.style.width=i.dataset.w+"%")));
  const nota=a===0?`<p class="t-sm muted" style="margin:0 0 14px;max-width:70ch">O Impacto segue cada pista do sinal até à decisão da equipa e ao resultado observado. Ainda não há decisões: aceita ou descarta pistas em «Pistas de ação» e o funil começa a preencher-se.</p>`:"";
  return nota+`<div class="funnel" id="funnel">${st.map(x=>`<div class="fstep"><span class="t-xs">${x[0]}</span><span class="big">${x[1]}</span><span class="t-sm muted">${x[0].startsWith("Adotadas")?"o piloto ainda não começou":x[0].startsWith("Aceites")?d+" descartadas":" "}</span><i data-w="${x[2]}"></i></div>`).join("")}</div>
   ${secHTML("Decisões desta semana","Do sinal ao resultado. O histórico real começa no piloto; até lá, estes números contam as decisões desta pré-visualização.",s?`<div class="panel tblwrap"><table><thead><tr><th>Pista</th><th>Atribuída a</th><th>Estado</th></tr></thead><tbody>${P.map(p=>`<tr class="go" data-go="acoes/pistas#${p.id}"><td style="font-weight:600">${esc(p.titulo)}</td><td>${esc(p.para)}</td><td>${STL[p.s]}${p.cli?", marcada para o cliente":""}</td></tr>`).join("")}</tbody></table></div>`:emptyHTML("Sem decisões","Ainda não há pistas."))}`}
function pageAcoes(sub,focus){
  const t=ATABS.find(x=>x[0]===sub)?sub:"pistas";S.tab.acoes=t;SEAL_HIDE=t==="impacto";
  const body=`<div class="tabs sub" role="tablist" aria-label="Ações">${ATABS.map(x=>`<button role="tab" aria-selected="${x[0]===t}" data-go="acoes/${x[0]}">${x[1]}${x[0]==="pistas"&&pistasPend(D)?` <span class="cnt" style="display:inline-grid;margin-left:4px;vertical-align:middle;min-width:20px;height:20px;border-radius:99px;background:var(--brand-ink);color:#fff;font-size:11px;font-weight:600;place-items:center;padding:0 6px">${pistasPend(D)}</span>`:""}</button>`).join("")}</div>${t==="pistas"?aPistas():aImpacto()}`;
  if(focus)later(()=>setTimeout(()=>{const el=document.getElementById(focus);if(el){el.scrollIntoView({behavior:RM?"auto":"smooth",block:"start"});el.classList.add("just")}},120));
  return pheadHTML("A plataforma sugere. A equipa decide.","Ações",`Pistas de ação e impacto de ${esc(D.cliente.nome)}.`,{sm:true})+body}
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
