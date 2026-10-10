/* ============================================================
   Componentes reutilizáveis (docs/08-especificacao-ux.md, secção 4):
   selo de dados, KPI, cartão, estado vazio, barra de filtros, gaveta.
   ============================================================ */
const CUR={refresh:()=>{}};   // página ativa: o router define refresh() para refazer só o conteúdo

const dot=e=>`<i style="display:inline-block;width:9px;height:9px;border-radius:50%;background:${col(e)};margin-right:8px;flex:none"></i>`;
const tag=t=>`<span class="tag">${t}</span>`;
const dchip=(d,unit="%")=>{if(d===null||d===undefined||isNaN(d))return`<span class="dchip">—</span>`;const up=d>0.5,dn=d<-0.5;return`<span class="dchip ${up?"up":dn?"dn":""}">${up?"▲":dn?"▼":"•"} ${sgn(Math.round(d*10)/10,Math.abs(d)<10&&unit!=="%"?1:0)}${unit==="%"?"%":" "+unit}</span>`};

/* ---------- Selo de dados (um por página; o detalhe abre ao clicar) ---------- */
let SEAL_OV=null, SEAL_HIDE=false;   // páginas de Agência definem o seu próprio selo (agregado de clientes)
function sealHTML(ids){if(SEAL_HIDE)return"";const s=SEAL_OV||sealInfo(ids);return`<button class="seal" id="seal" data-o="${s.o}" aria-haspopup="dialog" aria-label="Origem dos dados desta página: ${esc(s.t)}">${esc(s.t)}<svg class="ic"><use href="#i-chev"/></svg></button>`}
function renderSeal(){const el=$("#seal");if(el)el.outerHTML=sealHTML(USED)}
const SEALTXT={demo:"Todos os blocos desta página usam dados de demonstração. Quando as fontes forem ligadas, o selo muda sozinho.",real:"Todos os blocos desta página vêm de fontes ligadas, com fonte e data de recolha.",estimado:"Os blocos desta página são reais ou estimados, com o método indicado.",misto:"Parte dos blocos desta página vem de fontes reais e parte é demonstração.",pendente:"Esta página ainda não tem dados ligados."};
function openSeal(){const s=SEAL_OV||sealInfo(USED),pop=$("#pop");
  pop.innerHTML=SEAL_OV?SEAL_OV.pop:`<h3>Origem dos dados desta página</h3><p class="s">${SEALTXT[s.o]}</p>${s.bl.map(b=>`<div class="bl"><b>${esc(b.rotulo)}</b><span class="seal" data-o="${b.origem}" style="height:22px;font-size:11px">${OL[b.origem]}</span><span class="m">${b.origem==="real"?`Fonte: ${esc(b.fonte||"—")} · recolha ${fmtDt(b.data_recolha)}`:b.origem==="demo"?"Dados simulados, sem fonte. Nunca atribuídos a entidades reais de terceiros.":""}${b.metodo?`<br>Método: ${esc(b.metodo)}`:""}</span></div>`).join("")}`;
  const r=$("#seal").getBoundingClientRect();pop.classList.add("on");pop.style.left=Math.max(12,Math.min(r.left,innerWidth-pop.offsetWidth-12))+"px";pop.style.top=Math.min(r.bottom+8,innerHeight-pop.offsetHeight-12)+"px"}
document.addEventListener("click",e=>{if(e.target.closest("#seal")){$("#pop").classList.contains("on")?$("#pop").classList.remove("on"):openSeal();return}if(!e.target.closest("#pop"))$("#pop").classList.remove("on")});
document.addEventListener("keydown",e=>{if(e.key==="Escape")$("#pop").classList.remove("on")});

/* Rodapé de fonte (convenção de reporting): só para dados reais ou estimados */
function foot(id){const b=BLK(id);if(!b)return"";use(id);
  if(b.origem==="real")return`<p class="foot">Fonte: ${esc(b.fonte||"—")} · recolha ${fmtDt(b.data_recolha)}</p>`;
  if(b.origem==="estimado")return`<p class="foot">Estimado. Método: ${esc(b.metodo||"—")}</p>`;
  return""}

/* ---------- Blocos de página ---------- */
const emptyHTML=(t,x)=>`<div class="empty"><svg class="ic"><use href="#i-lock"/></svg><div><b>${t}</b><br>${x||""}</div></div>`;
function kpiHTML(k){return`<div class="kpi ${k.go?"clk":""}" ${k.src?`data-src="${use(k.src)}"`:""} ${k.go?`data-go="${k.go}" tabindex="0" role="link"`:""}><span class="t-xs">${k.l}</span><div class="kv"><span class="big">${k.v}</span>${k.series&&k.series.length>1?`<span class="sp">${spark(k.series,84,34)}</span>`:""}</div><span class="sub">${k.sub||""}</span></div>`}
function secHTML(title,desc,body,src,extra=""){if(src)use(src);return`<div class="sec"><header><div><h2 class="t-h2">${title}</h2>${desc?`<p>${desc}</p>`:""}</div>${extra}</header>${body}${src?foot(src):""}</div>`}
function cardHTML(title,desc,body,src,extra=""){if(src)use(src);return`<div class="card"><header><div><h2 class="t-h2">${title}</h2>${desc?`<p>${desc}</p>`:""}</div>${extra}</header>${body}${src?foot(src):""}</div>`}
function pheadHTML(kick,title,lead,{sm=false}={}){return`<div class="phead ${sm?"sm":""}"><div class="kick"><span>${kick}</span><span id="sealslot">${sealHTML(USED)}</span></div><h1 class="t-display">${title}</h1>${lead?`<p class="lead">${lead}</p>`:""}</div>`}

/* ---------- Barra de filtros global (período, comparação, plataforma, marcas) ---------- */
function filterBar({brands=false,platforms=false,compare=true}={}){
  const ads=hasAds();
  return`<div class="fbar" id="fbar" role="group" aria-label="Filtros desta página">
   <div class="grp2"><span class="fl">Período</span><div class="seg">${periodos().map(n=>`<button data-fw="${n}" aria-pressed="${S.w===n}">${isTema()&&n===NW?"Tudo":n+" sem."}</button>`).join("")}</div></div>
   ${compare?`<div class="grp2"><span class="fl">Comparar com</span><div class="seg">${[["anterior","Período anterior"],["nenhum","Sem comparação"]].map(([k,l])=>`<button data-fc="${k}" aria-pressed="${S.cmp===k}">${l}</button>`).join("")}</div></div>`:""}
   ${platforms&&ads?`<div class="grp2"><span class="fl">Plataforma</span>${PL.map(p=>`<button class="fchip" data-fp="${p}" aria-pressed="${S.pl.has(p)}">${p}</button>`).join("")}</div>`:""}
   ${brands&&ads&&!isTema()?`<div class="grp2"><span class="fl">Marcas</span>${D.entidades.map(e=>e.incluida?`<button class="fchip" data-fb="${e.id}" aria-pressed="true" ${e.cliente?`disabled aria-label="${esc(e.nome)}, cliente"`:""}><i style="background:${col(e)}"></i>${esc(e.nome)}</button>`:e.sugerida?(isCli()?"":`<button class="fchip sug" data-add="${e.id}" data-tip="O Radar sugere ${esc(e.nome)}: aparece em ${e.sobreposicao}% das mesmas pesquisas. A equipa decide.">${dot(e)}${esc(e.nome)}, sugerida</button>`):`<button class="fchip" data-fb="${e.id}" aria-pressed="false"><i style="background:${col(e)}"></i>${esc(e.nome)}</button>`).join("")}</div>`:""}
  </div>`}
document.addEventListener("click",e=>{
  let t;
  if(t=e.target.closest("#fbar [data-fw]")){S.w=+t.dataset.fw;CUR.refresh();return}
  if(t=e.target.closest("#fbar [data-fc]")){S.cmp=t.dataset.fc;CUR.refresh();return}
  if(t=e.target.closest("#fbar [data-fp]")){const p=t.dataset.fp;if(S.pl.has(p)){if(S.pl.size>1)S.pl.delete(p);else toast("Mantém pelo menos uma plataforma.")}else S.pl.add(p);CUR.refresh();return}
  if(t=e.target.closest("#fbar [data-fb]")){const b=ebyid(t.dataset.fb);b.incluida=!b.incluida;CUR.refresh();return}
  if(t=e.target.closest("[data-add]")){const b=ebyid(t.dataset.add);if(b){b.incluida=true;b.sugerida=false;toast(b.nome+" entrou no conjunto. O Radar sugere; a equipa decide.");CUR.refresh()}}
});

/* ---------- Gaveta de detalhe ---------- */
function openDrawer(html){const d=$("#drawer");d.innerHTML=html;d.classList.add("on");$("#scrim").classList.add("on");const c=$("#dclose");if(c)c.focus()}
function closeDrawer(){$("#drawer").classList.remove("on");$("#scrim").classList.remove("on")}
const drawerHead=t=>`<div style="display:flex;justify-content:space-between;align-items:center;gap:10px"><h2 class="t-h2">${t}</h2><button class="iconbtn" id="dclose" aria-label="Fechar" style="width:32px;height:32px"><svg class="ic"><use href="#i-x"/></svg></button></div>`;
document.addEventListener("click",e=>{if(e.target.closest("#dclose")||e.target.id==="scrim")closeDrawer()});
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeDrawer()});
