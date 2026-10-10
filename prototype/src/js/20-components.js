/* ============================================================
   Componentes reutilizáveis (docs/08-especificacao-ux.md, secção 4):
   selo de dados, KPI, cartão, estado vazio, barra de filtros, gaveta.
   ============================================================ */
const CUR={refresh:()=>{}};   // página ativa: o router define refresh() para refazer só o conteúdo

const dot=e=>`<i style="display:inline-block;width:9px;height:9px;border-radius:50%;background:${col(e)};margin-right:8px;flex:none"></i>`;
const tag=t=>`<span class="tag">${t}</span>`;
const dchip=(d,unit="%")=>{const tp=unit==="p.p."?` data-tip="Pontos percentuais: diferença entre duas quotas"`:"";if(d===null||d===undefined||isNaN(d))return`<span class="dchip">—</span>`;const up=d>0.5,dn=d<-0.5;return`<span class="dchip ${up?"up":dn?"dn":""}"${tp}>${up?"▲":dn?"▼":"•"} ${sgn(Math.round(d*10)/10,Math.abs(d)<10&&unit!=="%"?1:0)}${unit==="%"?"%":" "+unit}</span>`};

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
function kpiHTML(k){return`<div class="kpi ${k.go?"clk":""}" ${k.src?`data-src="${use(k.src)}"`:""} ${k.go?`data-go="${k.go}" tabindex="0" role="link"`:""}><span class="t-xs">${k.l}${k.help?`<button class="qm" type="button" aria-label="O que é isto?" data-tip="${esc(k.help)}" onclick="event.stopPropagation()">?</button>`:""}</span><div class="kv"><span class="big">${k.v}</span>${k.series&&k.series.length>1?`<span class="sp">${spark(k.series,84,34)}</span>`:""}</div><span class="sub">${k.sub||""}</span></div>`}
function secHTML(title,desc,body,src,extra=""){if(src)use(src);return`<div class="sec"><header><div><h2 class="t-h2">${title}</h2>${desc?`<p>${desc}</p>`:""}</div>${extra}</header>${body}${src?foot(src):""}</div>`}
function cardHTML(title,desc,body,src,extra=""){if(src)use(src);return`<div class="card"><header><div><h2 class="t-h2">${title}</h2>${desc?`<p>${desc}</p>`:""}</div>${extra}</header>${body}${src?foot(src):""}</div>`}
function pheadHTML(kick,title,lead,{sm=false}={}){return`<div class="phead ${sm?"sm":""}"><div class="kick"><span>${kick}</span><span id="sealslot">${sealHTML(USED)}</span></div><h1 class="t-display">${title}</h1>${lead?`<p class="lead">${lead}</p>`:""}</div>`}

/* ---------- Barra de filtros global (uma linha; cada filtro abre um painel; em telemóvel, uma folha «Filtros») ---------- */
const FCFG={brands:false,platforms:false,compare:true}, FP={k:null};
const defW=()=>isTema()?NW:12;
function filterBar(cfg={}){
  Object.assign(FCFG,{brands:false,platforms:false,compare:true},cfg);
  const ads=hasAds(),{brands,platforms,compare}=FCFG,perL=isTema()&&S.w===NW?"Tudo":S.w+" sem.";
  const btn=(k,l,v,on)=>`<button class="fbtn ${on?"on":""}" data-fpop="${k}" aria-haspopup="true" aria-expanded="${FP.k===k}"><span class="fl">${l}</span><b>${v}</b><svg class="ic"><use href="#i-down"/></svg></button>`;
  const alt=[S.w!==defW(),compare&&S.cmp!=="anterior",platforms&&ads&&S.pl.size!==PL.length].filter(Boolean).length;
  return`<div class="fbar" id="fbar" role="group" aria-label="Filtros desta página">
   <div class="fdesk">${btn("per","Período",perL,S.w!==defW())}${compare?btn("cmp","Comparar",S.cmp==="anterior"?"Período anterior":"Sem comparação",S.cmp!=="anterior"):""}${platforms&&ads?btn("pl","Plataformas",S.pl.size===PL.length?"Todas":`${S.pl.size} de ${PL.length}`,S.pl.size!==PL.length):""}${brands&&ads&&!isTema()?btn("br","Marcas",`${incl().length} marcas`,false):""}${alt?`<button class="fbtn ghost" data-freset>Repor filtros</button>`:""}</div>
   <button class="fbtn fmob ${alt?"on":""}" data-fpop="all" aria-haspopup="true" aria-expanded="${FP.k==="all"}"><svg class="ic"><use href="#i-sliders"/></svg><span>Filtros</span><b>${perL}${alt?` · ${alt} alterado${alt>1?"s":""}`:""}</b></button></div>`}
function fpopSec(k){
  if(k==="per")return`<div class="gh">Período</div>`+periodos().map(n=>`<button class="opt" role="radio" aria-checked="${S.w===n}" data-fw="${n}">${isTema()&&n===NW?"Tudo":n+" semanas"}</button>`).join("");
  if(k==="cmp")return`<div class="gh">Comparar com</div>`+[["anterior","Período anterior"],["nenhum","Sem comparação"]].map(([v,l])=>`<button class="opt" role="radio" aria-checked="${S.cmp===v}" data-fc="${v}">${l}</button>`).join("");
  if(k==="pl")return`<div class="gh">Plataformas</div>`+PL.map(p=>`<button class="opt chk" role="checkbox" aria-checked="${S.pl.has(p)}" data-fp="${p}">${p}</button>`).join("");
  if(k==="br")return`<div class="gh">Marcas do conjunto</div>`+D.entidades.map(e=>e.incluida?`<button class="opt chk" role="checkbox" aria-checked="true" data-fb="${e.id}" ${e.cliente?'disabled':""}>${dot(e)}${esc(e.nome)}${e.cliente?" <em>cliente</em>":""}</button>`:e.sugerida?(isCli()?"":`<button class="opt sug" data-add="${e.id}">${dot(e)}${esc(e.nome)} <em>sugerida pelo Radar. Aceitar</em></button>`):`<button class="opt chk" role="checkbox" aria-checked="false" data-fb="${e.id}">${dot(e)}${esc(e.nome)}</button>`).join("");
  return""}
function fpopHTML(k){
  if(k!=="all")return fpopSec(k);
  const ks=["per",FCFG.compare?"cmp":null,FCFG.platforms&&hasAds()?"pl":null,FCFG.brands&&hasAds()&&!isTema()?"br":null].filter(Boolean);
  return ks.map(fpopSec).join("")+`<div class="fsheetf"><button class="btn" data-freset>Repor filtros</button><button class="btn pri" data-fclose>Ver resultados</button></div>`}
function fpopPlace(btn){const pop=$("#fpop"),mob=FP.k==="all"||innerWidth<=680;pop.classList.toggle("sheet",mob);$("#fscrim").classList.toggle("on",mob);
  if(mob){pop.style.left=pop.style.top="";return}
  const r=btn.getBoundingClientRect();pop.style.top=(r.bottom+6)+"px";pop.style.left=Math.max(12,Math.min(r.left,innerWidth-pop.offsetWidth-12))+"px"}
function openFpop(k,btn){if(!$("#fpop")){const d=document.createElement("div");d.id="fpop";d.className="menu";d.setAttribute("role","dialog");const s=document.createElement("div");s.id="fscrim";document.body.append(s,d)}
  FP.k=k;const pop=$("#fpop");pop.innerHTML=fpopHTML(k);pop.classList.add("on");fpopPlace(btn);$$("#fbar [data-fpop]").forEach(b=>b.setAttribute("aria-expanded",b.dataset.fpop===k))}
function closeFpop(){FP.k=null;const p=$("#fpop");if(p)p.classList.remove("on");const s=$("#fscrim");if(s)s.classList.remove("on");$$("#fbar [data-fpop]").forEach(b=>b.setAttribute("aria-expanded","false"))}
function fpopSync(){if(!FP.k)return;const b=$(`#fbar [data-fpop="${FP.k}"]`);if(!b||!b.offsetParent){closeFpop();return}$("#fpop").innerHTML=fpopHTML(FP.k);fpopPlace(b);b.setAttribute("aria-expanded","true")}
document.addEventListener("click",e=>{
  let t;
  if(t=e.target.closest("[data-fpop]")){FP.k===t.dataset.fpop?closeFpop():openFpop(t.dataset.fpop,t);return}
  if(e.target.closest("[data-fclose]")){closeFpop();return}
  if(e.target.closest("[data-freset]")){S.w=defW();S.cmp="anterior";S.pl=new Set(PL);CUR.refresh();return}
  if(t=e.target.closest("[data-fw]")){S.w=+t.dataset.fw;CUR.refresh();if(FP.k!=="all")closeFpop();return}
  if(t=e.target.closest("[data-fc]")){S.cmp=t.dataset.fc;CUR.refresh();if(FP.k!=="all")closeFpop();return}
  if(t=e.target.closest("[data-fp]")){const p=t.dataset.fp;if(S.pl.has(p)){if(S.pl.size>1)S.pl.delete(p);else toast("Mantém pelo menos uma plataforma.")}else S.pl.add(p);CUR.refresh();return}
  if(t=e.target.closest("[data-fb]")){const b=ebyid(t.dataset.fb);b.incluida=!b.incluida;CUR.refresh();return}
  if(t=e.target.closest("[data-add]")){const b=ebyid(t.dataset.add);if(b){b.incluida=true;b.sugerida=false;toast(b.nome+" entrou no conjunto. O Radar sugere; a equipa decide.");CUR.refresh();return}}
  if(FP.k&&!e.target.closest("#fpop"))closeFpop()});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&FP.k)closeFpop()});
addEventListener("resize",()=>{if(FP.k)fpopSync()});

/* ---------- Gaveta de detalhe ---------- */
function openDrawer(html){const d=$("#drawer");d.innerHTML=html;d.classList.add("on");$("#scrim").classList.add("on");const c=$("#dclose");if(c)c.focus()}
function closeDrawer(){$("#drawer").classList.remove("on");$("#scrim").classList.remove("on")}
const drawerHead=t=>`<div style="display:flex;justify-content:space-between;align-items:center;gap:10px"><h2 class="t-h2">${t}</h2><button class="iconbtn" id="dclose" aria-label="Fechar" style="width:32px;height:32px"><svg class="ic"><use href="#i-x"/></svg></button></div>`;
document.addEventListener("click",e=>{if(e.target.closest("#dclose")||e.target.id==="scrim")closeDrawer()});
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeDrawer()});
