/* ============================================================
   Componentes reutilizáveis (docs/08-especificacao-ux.md, secção 4):
   selo de dados, KPI, cartão, estado vazio, barra de filtros, gaveta.
   ============================================================ */
const CUR={refresh:()=>{}};   // página ativa: o router define refresh() para refazer só o conteúdo

const dotc=c=>`<i style="display:inline-block;width:9px;height:9px;border-radius:50%;background:${c};margin-right:8px;flex:none"></i>`;
const dot=e=>dotc(col(e));
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
let KWHY={};
function kpiHTML(k){const wid=k.why?"k"+Object.keys(KWHY).length:null;if(wid)KWHY[wid]=k;return`<div class="kpi ${k.go?"clk":""}" ${k.src?`data-src="${use(k.src)}"`:""} ${k.go?`data-go="${k.go}" tabindex="0" role="link"`:""}><span class="t-xs">${k.l}${k.help?`<button class="qm" type="button" aria-label="Como se calcula: ${esc(String(k.l).replace(/<[^>]+>/g,""))}" data-tip="${esc(k.help)} <i>Clica para ver como se calcula.</i>" ${wid?`data-kwhy="${wid}"`:""}>?</button>`:""}</span><div class="kv"><span class="big">${k.v}</span>${k.series&&k.series.length>1?`<span class="sp">${spark(k.series,84,34)}</span>`:""}</div><span class="sub">${k.sub||""}</span></div>`}
function secHTML(title,desc,body,src,extra=""){if(src)use(src);return`<div class="sec"><header><div><h2 class="t-h2">${title}</h2>${desc?`<p>${desc}</p>`:""}</div>${extra}</header>${body}${src?foot(src):""}</div>`}
function cardHTML(title,desc,body,src,extra=""){if(src)use(src);
  const chart=/class="cv"/.test(body)&&!/id="gp"/.test(body),acts=chart?`<div class="cacts no-print"><button class="btn ghost sm" type="button" data-chartimg aria-label="Copiar o gráfico como imagem" data-tip="Copiar como imagem, com título e origem dos dados"><svg class="ic"><use href="#i-copy"/></svg><span>Copiar imagem</span></button>${isCli()?"":`<button class="btn ghost sm" type="button" data-addbrief data-tip="Acrescentar este ponto ao briefing semanal"><svg class="ic"><use href="#i-mail"/></svg><span>Ao briefing</span></button>`}</div>`:"";
  return`<div class="card" ${src?`data-srcid="${src}"`:""}><header><div><h2 class="t-h2">${title}</h2>${desc?`<p>${desc}</p>`:""}</div>${extra}${acts}</header>${body}${src?foot(src):""}</div>`}
function pheadHTML(kick,title,lead,{sm=false}={}){return`<div class="phead ${sm?"sm":""}"><div class="kick"><span>${kick}</span><span id="sealslot">${sealHTML(USED)}</span></div><h1 class="t-display">${title}</h1>${lead?`<p class="lead">${lead}</p>`:""}</div>`}

/* ---------- Barra de filtros global (uma linha; cada filtro abre um painel; em telemóvel, uma folha «Filtros») ---------- */
const FCFG={brands:false,platforms:false,compare:true}, FP={k:null};
const defW=()=>isTema()?NW:12;
function filterBar(cfg={}){
  Object.assign(FCFG,{brands:false,platforms:false,compare:true},cfg);
  const ads=hasAds(),{brands,platforms,compare}=FCFG,perL=isTema()&&S.w===NW?"Tudo":S.w+" sem.";
  const btn=(k,l,v,on)=>`<button class="fbtn ${on?"on":""}" data-fpop="${k}" aria-haspopup="true" aria-expanded="${FP.k===k}">${k==="views"?`<svg class="ic" style="margin-right:-2px"><use href="#i-bookmark"/></svg>`:""}<span class="fl">${l}</span>${v?`<b>${v}</b>`:""}<svg class="ic"><use href="#i-down"/></svg></button>`;
  const alt=[S.w!==defW(),compare&&S.cmp!=="anterior",platforms&&ads&&S.pl.size!==PL.length].filter(Boolean).length;
  return`<div class="fbar" id="fbar" role="group" aria-label="Filtros desta página">
   <div class="fdesk">${btn("per","Período",perL,S.w!==defW())}${compare?btn("cmp","Comparar",S.cmp==="anterior"?"Período anterior":"Sem comparação",S.cmp!=="anterior"):""}${platforms&&ads?btn("pl","Plataformas",S.pl.size===PL.length?"Todas":`${S.pl.size} de ${PL.length}`,S.pl.size!==PL.length):""}${brands&&ads&&!isTema()?btn("br","Marcas",`${incl().length} marcas`,false):""}${alt?`<button class="fbtn ghost" data-freset>Repor filtros</button>`:""}<span class="fgap"></span>${btn("views","Vistas","","")}${EM_ARTEFACTO?"":`<button class="fbtn ghost fic" data-copylink aria-label="Copiar a ligação desta vista" data-tip="Copiar a ligação desta vista, com os filtros"><svg class="ic"><use href="#i-copy"/></svg></button>`}</div>
   <button class="fbtn fmob ${alt?"on":""}" data-fpop="all" aria-haspopup="true" aria-expanded="${FP.k==="all"}"><svg class="ic"><use href="#i-sliders"/></svg><span>Filtros</span><b>${perL}${alt?` · ${alt} alterado${alt>1?"s":""}`:""}</b></button></div>`}
function fpopSec(k){
  if(k==="per")return`<div class="gh">Período</div>`+periodos().map(n=>`<button class="opt" role="radio" aria-checked="${S.w===n}" data-fw="${n}">${isTema()&&n===NW?"Tudo":n+" semanas"}</button>`).join("");
  if(k==="cmp")return`<div class="gh">Comparar com</div>`+[["anterior","Período anterior"],["nenhum","Sem comparação"]].map(([v,l])=>`<button class="opt" role="radio" aria-checked="${S.cmp===v}" data-fc="${v}">${l}</button>`).join("");
  if(k==="pl")return`<div class="gh">Plataformas</div>`+PL.map(p=>`<button class="opt chk" role="checkbox" aria-checked="${S.pl.has(p)}" data-fp="${p}">${p}</button>`).join("");
  if(k==="br")return`<div class="gh">Marcas do conjunto</div>`+D.entidades.map(e=>e.incluida?`<button class="opt chk" role="checkbox" aria-checked="true" data-fb="${e.id}" ${e.cliente?'disabled':""}>${dot(e)}${esc(e.nome)}${e.cliente?" <em>cliente</em>":""}</button>`:e.sugerida?(isCli()?"":`<button class="opt sug" data-add="${e.id}">${dot(e)}${esc(e.nome)} <em>sugerida pelo Radar. Aceitar</em></button>`):`<button class="opt chk" role="checkbox" aria-checked="false" data-fb="${e.id}">${dot(e)}${esc(e.nome)}</button>`).join("");
  if(k==="views"){const L=(PREFS.views&&PREFS.views[D.cliente.id])||[];return`<div class="gh">Vistas guardadas</div>${L.length?L.map((v,i)=>`<div class="vwrow"><button class="opt vw" data-vapply="${i}">${esc(v.n)}</button><button class="iconbtn vdel" data-vdel="${i}" aria-label="Apagar a vista ${esc(v.n)}">✕</button></div>`).join(""):`<p class="t-sm muted" style="padding:2px 8px 8px">Ainda não guardaste nenhuma vista.</p>`}<div class="gh">Guardar a vista atual</div><form class="vsave" id="vform"><input id="vname" maxlength="40" placeholder="Nome da vista" aria-label="Nome da vista" required><button class="btn pri sm" type="submit">Guardar</button></form><p class="t-xs" style="padding:4px 8px 4px">Guarda a página com o período, a comparação, as plataformas e as marcas.</p>`}
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

/* ---------- «Porquê?»: como se calcula um KPI e porque é que um sinal é sinal ---------- */
const sigUnit=s=>s.categoria==="Quota de voz"?" p.p.":s.categoria==="Lançamento"?" criativos":"%";
const plain=h=>String(h).replace(/<[^>]+>/g,"");
function whyBlk(label,html){return`<div class="blk"><div class="t-xs">${label}</div>${html}</div>`}
function whySrc(ids){const s=sealInfo(new Set(ids));return`<p class="why-src"><span class="seal" data-o="${s.o}" style="height:22px;font-size:11px">${esc(s.t)}</span></p>${ids.map(id=>BLK(id)?`<p class="t-sm muted" style="margin-top:6px">${srcTip(id)}</p>`:"").join("")}`}
function openKpiWhy(k){const w=k.why;if(!w)return;
  openDrawer(`${drawerHead("Como se calcula")}<p class="why-t">${plain(k.l)}</p>
   <div class="blk"><div class="why-v">${k.v}</div><div class="sub" style="margin-top:4px">${k.sub||""}</div></div>
   ${whyBlk("O que mede",`<p>${esc(w.def)}</p>`)}${whyBlk("Como se calcula",`<p>${esc(w.calc)}</p>`)}${whyBlk("Janela",`<p>${esc(w.janela)}</p>`)}${w.filtros?whyBlk("Filtros",`<p>${esc(w.filtros)}</p>`):""}${w.limites?whyBlk("Limites",`<p>${esc(w.limites)}</p>`):""}
   ${k.src?whyBlk("De onde vêm os dados",whySrc([k.src])):""}
   ${k.go?`<div style="margin-top:14px"><button class="btn" data-go="${k.go}">Ver o detalhe</button></div>`:""}`)}
function openWhy(id){const s=D.sinais.find(x=>x.id===id);if(!s)return;
  const p=s.pista_id?D.pistas.find(x=>x.id===s.pista_id):null,ch=sigChart(s),u=sigUnit(s),d=v=>Math.abs(v)<10?1:0;
  const nums=s.detalhe?`<dl class="why-dl">${s.detalhe.map(x=>`<dt>${esc(x.rotulo)}</dt><dd>${nf(x.valor,x.dec)}${esc(x.sufixo)}</dd>`).join("")}${s.valor!=null?`<dt>Variação observada</dt><dd><b>${sgn(s.valor,d(s.valor))}${u}</b></dd>`:""}${s.limiar!=null?`<dt>Limiar do sinal</dt><dd>${nf(Math.abs(s.limiar),d(s.limiar))}${u}</dd>`:""}${s.valor_anterior!=null?`<dt>Na semana passada</dt><dd>${sgn(s.valor_anterior,d(s.valor_anterior))}${u}</dd>`:""}</dl>`:"";
  openDrawer(`${drawerHead("Porquê este sinal?")}<p class="why-t">${esc(s.titulo)}</p>
   <div class="blk"><span class="tag ${s.material?"hi":""}">${s.material?"Acima do limiar":"Em observação"}</span>${s.novo?` <span class="tag nw">Novo esta semana</span>`:""}${s.hipotese?` <span class="tag">Hipótese</span>`:""}</div>
   ${s.regra?whyBlk("A regra",`<p>${esc(s.regra)}</p>`):""}
   ${nums?whyBlk("Os números"+(s.janela?`, ${esc(s.janela)}`:""),nums):""}
   ${ch?whyBlk("Últimas 12 semanas",`<div class="cv" id="whych" style="height:84px"></div>`):""}
   ${whyBlk("O que significa",`<p>${esc(s.leitura)}</p>`)}
   ${whyBlk("De onde vêm os dados",whySrc([s.bloco]))}
   <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px"><button class="btn" ${s.entidade&&s.categoria==="Lançamento"?`data-cr-b="${s.entidade}"`:`data-go="${sigGo(s)}"`}>${s.categoria==="Lançamento"?"Ver criativos":"Ver no gráfico"}</button>${p?`<button class="btn" data-go="acoes/pistas#${p.id}">Ver a pista</button>`:""}</div>`);
  if(ch)setTimeout(()=>{const h=$("#whych");if(h)tsChart(h,{...ch,type:"line",fill:true,mini:true,h:84},false)},60)}
document.addEventListener("click",e=>{let t;
  if(t=e.target.closest("[data-kwhy]")){e.stopPropagation();e.preventDefault();openKpiWhy(KWHY[t.dataset.kwhy]);return}
  if(t=e.target.closest("[data-why]")){e.preventDefault();openWhy(t.dataset.why)}},true);

/* ---------- Tabelas ordenáveis: clicar num cabeçalho ordena; o critério fica guardado por tabela durante a sessão ---------- */
const SORTS={};
const numOf=t=>{t=String(t).replace(/\s+/g," ").trim();if(!t||/^(—|por recolher)/i.test(t))return null;const m=t.match(/[−-]?\s?\d[\d ]*(?:,\d+)?/);if(!m)return null;let v=parseFloat(m[0].replace(/[ \u00a0]/g,"").replace("−","-").replace(",","."));if(isNaN(v))return null;if(/mil\s*€/.test(t))v*=1e3;else if(/\bM\s*€/.test(t))v*=1e6;return v};
function sortTable(tb,c,dir){const body=tb.tBodies[0],th=tb.tHead.rows[0].cells[c],isNum=th&&th.dataset.sort==="num";
  const key=r=>{const x=r.cells[c]?r.cells[c].textContent:"";return isNum?numOf(x):x.trim().toLowerCase()};
  [...body.rows].sort((a,b)=>{const x=key(a),y=key(b);if(x==null&&y==null)return 0;if(x==null)return 1;if(y==null)return-1;return dir*(isNum?x-y:String(x).localeCompare(String(y),"pt"))}).forEach(r=>body.appendChild(r))}
function applySorts(root=document){(root.matches&&root.matches("table.sortable")?[root]:$$("table.sortable",root)).forEach(tb=>{const s=SORTS[(D?D.cliente.id:"")+"|"+tb.dataset.tid];$$("th[data-sort]",tb).forEach((h,i)=>{h.setAttribute("tabindex","0");h.setAttribute("role","columnheader");h.removeAttribute("aria-sort")});if(!s)return;const th=tb.tHead.rows[0].cells[s.c];if(th)th.setAttribute("aria-sort",s.d>0?"ascending":"descending");sortTable(tb,s.c,s.d)})}
function clickSort(h){const tb=h.closest("table"),c=h.cellIndex,k=(D?D.cliente.id:"")+"|"+tb.dataset.tid,s=SORTS[k];SORTS[k]=s&&s.c===c?{c,d:-s.d}:{c,d:h.dataset.sort==="num"?-1:1};applySorts(tb)}
document.addEventListener("click",e=>{const h=e.target.closest("table.sortable th[data-sort]");if(h)clickSort(h)});
document.addEventListener("keydown",e=>{if((e.key==="Enter"||e.key===" ")&&e.target.matches&&e.target.matches("table.sortable th[data-sort]")){e.preventDefault();clickSort(e.target)}});

/* ---------- Vistas guardadas e ligação com filtros ---------- */
document.addEventListener("click",e=>{let t;
  if(e.target.closest("[data-copylink]")){const u=location.href;const ok=()=>toast("Ligação copiada, com os filtros desta vista.");try{navigator.clipboard.writeText(u).then(ok,()=>toast("Não foi possível copiar a ligação neste ambiente."))}catch(_){toast("Não foi possível copiar a ligação neste ambiente.")}return}
  if(t=e.target.closest("[data-vapply]")){const v=(PREFS.views[D.cliente.id]||[])[+t.dataset.vapply];if(v){closeFpop();location.hash=v.h}return}
  if(t=e.target.closest("[data-vdel]")){const L=PREFS.views[D.cliente.id]||[];L.splice(+t.dataset.vdel,1);savePrefs();if(FP.k==="views")$("#fpop").innerHTML=fpopHTML("views");return}});
document.addEventListener("submit",e=>{if(e.target.id!=="vform")return;e.preventDefault();const n=$("#vname").value.trim();if(!n)return;PREFS.views=PREFS.views||{};const L=PREFS.views[D.cliente.id]=PREFS.views[D.cliente.id]||[];L.unshift({n,h:href(ROUTE)});PREFS.views[D.cliente.id]=L.slice(0,8);savePrefs();$("#fpop").innerHTML=fpopHTML("views");toast("Vista «"+n+"» guardada.")});
