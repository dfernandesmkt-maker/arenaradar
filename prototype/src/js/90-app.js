/* ============================================================
   Aplicação: rotas, seletor de âmbito (Agência › Vertical › Cliente), menu único, Pergunta ao Radar, temas e arranque.
   Rotas: #/<cliente>/<página>[/<separador>][#<foco>]  ·  #/agencia/<torre|fontes>
   ============================================================ */
let CID=null;                          // cliente ativo (último selecionado; também usado em Agência)
const PAGES={
  visao:{n:"Visão geral",s:"Visão",i:"i-radar",f:pageVisao},
  mercado:{n:"Mercado",i:"i-layers",f:pageMercado},
  marca:{n:"Ficha de marca",i:"i-layers",f:pageMarca,hide:true,if:()=>hasAds()&&!isTema()},
  procura:{n:"Procura e notícias",s:"Procura",i:"i-trend",f:pageProcura},
  criativos:{n:"Criativos",i:"i-image",f:pageCriativos,if:()=>hasAds()},
  relatorios:{n:"Relatórios",i:"i-mail",f:pageRelatorios},
  acoes:{n:"Ações",i:"i-spark",f:pageAcoes}};
const AGPAGES={torre:{n:"Torre de controlo",i:"i-grid",f:pageTorre},fontes:{n:"Fontes de dados",i:"i-plug",f:pageFontes}};
let ROUTE={scope:"cliente",view:"equipa",rasc:false,cid:null,page:"visao",sub:null,focus:null};
const PAGE_CLI_VAZIO={n:"Relatório",f:pageClienteVazio};
function pageClienteVazio(){SEAL_HIDE=true;return pheadHTML(`${esc(D.cliente.nome)} · vista do cliente`,"Ainda não há relatório publicado","A equipa Arena ainda não publicou o relatório desta semana. O cliente não vê nada sem essa decisão.")+`<div class="empty"><svg class="ic"><use href="#i-lock"/></svg><div><b>Sem publicação</b><br>Prepara o que o cliente vê em Relatórios, «Publicar para o cliente», ou vê já como ficaria com a seleção sugerida.<div class="emptyacts"><button class="btn pri" data-sugerir="1"><svg class="ic"><use href="#i-eye"/></svg>Ver como ficaria</button><button class="btn" data-go="${D.cliente.id}/relatorios/publicar?v=equipa">Preparar publicação</button></div></div></div>`}
function viewBanner(r){
  if(!(VIEW==="cliente"&&r.scope==="cliente"))return"";
  const id=D.cliente.id,pg=r.page==="vazio"?"visao":r.page,pb=D.pub.pubd,pend=pubPend(),back=`<button class="btn" data-go="${id}/${pg}?v=equipa">Voltar à vista Equipa</button>`;
  if(r.rasc)return`<div class="vbanner no-print"><span><b>Pré-visualização do rascunho.</b> ${pb?"É o que o cliente verá depois de publicares as alterações.":"O cliente ainda não vê nada: só vê o que for publicado."}</span><span class="vbacts">${pb?`<button class="btn" data-go="${id}/${pg}?v=cliente">Ver o publicado</button>`:""}<button class="btn pri" id="bnpub">${pb?"Publicar alterações":"Publicar"}</button><button class="btn" data-go="${id}/relatorios/publicar?v=equipa">Editar rascunho</button></span></div>`;
  return`<div class="vbanner no-print"><span><b>Pré-visualização da vista do cliente.</b> É assim que o cliente vê o que a equipa publicou${pb?" (a "+fmtDT(pb.quando)+")":""}.${pend?" Há alterações por publicar.":""}</span><span class="vbacts">${pend?`<button class="btn" data-go="${id}/${pg}?v=cliente&rasc=1">Ver rascunho</button>`:""}${back}</span></div>`}
document.addEventListener("click",e=>{if(!e.target.closest("#bnpub"))return;const nv=!D.pub.pubd;pubPublicar(D);toast(nv?"Publicado para a vista do cliente (pré-visualização). Nada sai da agência: a entrega é uma decisão com IT e Compliance.":"Alterações publicadas. O cliente passa a ver a nova versão.");go(`${D.cliente.id}/${ROUTE.page==="vazio"?"visao":ROUTE.page}?v=cliente`)});

/* ---------- Menu único (o mesmo para todos os clientes) e seletor de âmbito ---------- */
function buildNav(){
  const cli=ROUTE.scope==="cliente";
  const item=(id,p,on,href,cnt)=>`<button class="nv" data-go="${href}" ${on?'aria-current="page"':""}><svg class="ic"><use href="#${p.i}"/></svg><span class="lg">${p.n}</span><span class="sh">${p.s||p.n}</span>${cnt?`<span class="cnt" id="navcnt" ${pistasPend(D)?"":"hidden"}>${pistasPend(D)}</span>`:""}</button>`;
  if(VIEW==="cliente"&&cli){$("#nav").innerHTML=`<div class="grp">${esc(D.cliente.nome)}</div>`+paginasCliente().map(k=>item(k,PAGES[k],ROUTE.page===k,`${D.cliente.id}/${k}`,false)).join("");return}
  $("#nav").innerHTML=`<div class="grp">${esc(D.cliente.nome)}</div>`+Object.entries(PAGES).filter(([k,p])=>!p.hide&&(!p.if||p.if())).map(([k,p])=>item(k,p,cli&&(ROUTE.page===k||(k==="mercado"&&ROUTE.page==="marca")),`${D.cliente.id}/${k}`,k==="acoes")).join("")+
   `<div class="grp">Agência</div>`+Object.entries(AGPAGES).map(([k,p])=>item(k,p,!cli&&ROUTE.page===k,`agencia/${k}`,false)).join("")}
let MENU=null;
function buildScope(){
  const cli=ROUTE.scope==="cliente",v=AG.verticais.find(x=>x.id===D.cliente.vertical);
  if(cli&&VIEW==="cliente"){$("#scope").innerHTML=`<span class="sc cur" style="cursor:default">${esc(D.cliente.nome)}</span><span class="vtag">Vista do cliente</span>`;return}
  $("#scope").innerHTML=`<button class="sc ${cli?"":"cur"}" data-go="agencia/torre">Agência</button><span class="sep">/</span>`+
   (cli?`<button class="sc" data-menu="vert">${esc(D.cliente.vertical_nome)}<svg class="ic"><use href="#i-down"/></svg></button><span class="sep">/</span><button class="sc cur" data-menu="cli">${esc(D.cliente.nome)}<svg class="ic"><use href="#i-down"/></svg></button><span class="sep">/</span><span class="sc cur pg" style="cursor:default">${esc((PAGES[ROUTE.page]||{n:""}).n)}</span>`
       :`<span class="sc cur" style="cursor:default">${esc((AGPAGES[ROUTE.page]||{n:""}).n)}</span>`)}
function openMenu(kind,btn){closeMenu();
  const btn_=i=>`<button data-switch="${i.id}" aria-current="${i.on}">${esc(i.t)}</button>`;
  const m=document.createElement("div");m.className="menu";m.id="menu";
  m.innerHTML=kind==="vert"?`<div class="gh">Vertical</div>`+AG.verticais.map(v=>btn_({id:v.clientes[0],t:v.nome,on:v.id===D.cliente.vertical})).join("")
    :AG.verticais.map(v=>`<div class="gh">${esc(v.nome)}</div>`+v.clientes.map(id=>btn_({id,t:CLS[id].cliente.nome+(CLS[id].cliente.ficticio?" (fictício)":""),on:id===D.cliente.id})).join("")).join("");
  $("#scope").appendChild(m);m.style.left=(btn.offsetLeft)+"px";MENU=m}
function closeMenu(){if(MENU){MENU.remove();MENU=null}}
document.addEventListener("click",e=>{const b=e.target.closest("[data-menu]");if(b){e.stopPropagation();MENU&&MENU.dataset.k===b.dataset.menu?closeMenu():(openMenu(b.dataset.menu,b),MENU.dataset.k=b.dataset.menu);return}
  const s=e.target.closest("[data-switch]");if(s){closeMenu();const pg=ROUTE.scope==="cliente"?ROUTE.page:"visao";go(s.dataset.switch+"/"+(pg==="marca"?"mercado":pg==="criativos"&&!CLS[s.dataset.switch].anuncios?"visao":pg));return}
  if(!e.target.closest("#menu"))closeMenu()});
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeMenu()});

/* ---------- Router ---------- */
function parse(hash){
  const h=(hash||"").replace(/^#\/?/,""),[pth,focus]=h.split("#"),[path,q]=pth.split("?"),p=path.split("/").filter(Boolean),view=/(^|&)v=cliente/.test(q||"")?"cliente":"equipa",rasc=view==="cliente"&&/(^|&)rasc=1/.test(q||"");
  if(p[0]==="agencia")return{scope:"agencia",view:"equipa",rasc:false,cid:CID,page:AGPAGES[p[1]]?p[1]:"torre",sub:null,focus};
  if(p[0]&&CLS[p[0]])return{scope:"cliente",view,rasc,cid:p[0],page:PAGES[p[1]]?p[1]:"visao",sub:p[2]||null,focus};
  return{scope:"cliente",view:"equipa",rasc:false,cid:CID||AG.cliente_inicial||AG.clientes[0].id,page:"visao",sub:null,focus:null}}
function href(r){return r.scope==="agencia"?"#/agencia/"+r.page:`#/${r.cid}/${r.page}${r.sub?"/"+r.sub:""}${r.view==="cliente"?"?v=cliente"+(r.rasc?"&rasc=1":""):""}${r.focus?"#"+r.focus:""}`}
function go(path){
  const first=path.split(/[\/#]/)[0];
  if(first!=="agencia"&&!CLS[first])path=CID+"/"+path;      // relativo ao cliente ativo
  const r=parse("#/"+path);
  if(!/\?v=/.test(path)){r.view=r.scope==="cliente"?VIEW:"equipa";r.rasc=r.view==="cliente"&&!!(ROUTE&&ROUTE.rasc)}      // a vista (e o rascunho) mantêm-se ao navegar
  if(href(r)===location.hash&&!r.focus){render(r,false);return}
  try{history.pushState(null,"",href(r))}catch(e){}render(r,true)}
addEventListener("popstate",()=>render(parse(location.hash),true));
addEventListener("hashchange",()=>{const r=parse(location.hash);if(!ROUTE||href(r)!==href(ROUTE))render(r,true)});
document.addEventListener("click",e=>{const g=e.target.closest("[data-go]");if(!g||!g.dataset.go||g.closest("#ask"))return;if(g.tagName==="A")e.preventDefault();go(g.dataset.go)});
document.addEventListener("keydown",e=>{if((e.key==="Enter"||e.key===" ")&&e.target.matches&&e.target.matches(".kpi[data-go]")){e.preventDefault();go(e.target.dataset.go)}});

render.n=0;
function render(r,scrollTop){
  stopRace();stopPlay();closeDrawer();closeMenu();closeFpop();$("#pop").classList.remove("on");CHARTS.length=0;AFTER.length=0;USED.clear();KWHY={};SEAL_OV=null;SEAL_HIDE=false;
  if(r.cid){CID=r.cid}if(!D||D.cliente.id!==CID)setClient(CID);else if(!S)setClient(CID);
  VIEW=r.view;document.documentElement.dataset.view=VIEW;ROUTE=r;
  let pg;
  if(r.scope==="agencia")pg=AGPAGES[r.page];
  else if(VIEW==="cliente"){            // o cliente só vê o que a equipa publicou
    const al=paginasCliente();
    if(!al.length){r={...r,page:"visao",sub:null};pg=PAGE_CLI_VAZIO}
    else{if(!al.includes(r.page))r={...r,page:al[0],sub:null};pg=PAGES[r.page]}}
  else{pg=PAGES[r.page];if(pg.if&&!pg.if()){r={...r,page:"visao",sub:null};pg=PAGES.visao}}
  ROUTE=r;
  const th=VIEW+"|"+CID;if(th!==render.th){render.th=th;const tid=VIEW==="cliente"&&D.cliente.tema&&AG.temas.some(x=>x.id===D.cliente.tema)?D.cliente.tema:AG.temas[0].id;applyTheme(tid,false)}   // tema do cliente só na vista do cliente (Q09)
  const t=$("#page");t.classList.remove("on");
  const banner=viewBanner(r);
  const html=banner+pg.f(r.sub,r.focus);t.innerHTML=html;t.classList.add("on");
  buildNav();buildScope();$("#viewseg").hidden=r.scope==="agencia";$$("#viewseg button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.view===VIEW));
  document.title="Arena Radar, "+(r.scope==="agencia"?pg.n:D.cliente.nome+", "+pg.n+(VIEW==="cliente"?" (vista do cliente)":""));
  CUR.refresh=()=>{const y=scrollY;stopRace();stopPlay();CHARTS.length=0;AFTER.length=0;USED.clear();KWHY={};SEAL_OV=null;SEAL_HIDE=false;const h=(banner||"")+pg.f(r.sub,r.focus);$("#page").innerHTML=h;buildNav();buildScope();AFTER.forEach(f=>f());AFTER.length=0;counters($("#page"));scrollTo({top:y,behavior:"auto"});fpopSync()};
  AFTER.forEach(f=>f());AFTER.length=0;counters(t);syncCounts();
  if(scrollTop&&!r.focus)scrollTo({top:0,behavior:"auto"});
  const h1=$("h1",t);if(h1&&scrollTop){h1.tabIndex=-1;if(render.n++)h1.focus({preventScroll:true})}
  const lv=$("#live");if(lv)lv.textContent=document.title;
  if(location.hash!==href(r)){try{history.replaceState(null,"",href(r))}catch(e){}}}

document.addEventListener("click",e=>{if(e.target.closest("[data-skip]")){e.preventDefault();const h=$("#page h1");h&&h.focus()}});
document.addEventListener("click",e=>{const b=e.target.closest("#viewseg [data-view]");if(!b)return;const pg=ROUTE.scope==="cliente"&&ROUTE.page!=="acoes"?ROUTE.page:"visao";go(`${CID}/${pg}?v=${b.dataset.view}`)});

/* ---------- Arranque ---------- */
function start(){
  if(EM_ARTEFACTO)seguirTemaDoVisualizador();
  applyTheme(AG.temas[0].id,false);
  if(PREFS.role==="direcao"&&!location.hash.replace(/^#\/?/,""))try{history.replaceState(null,"","#/agencia/torre")}catch(e){}   // a Direção começa na Torre de controlo
  const r=parse(location.hash);CID=r.cid||AG.cliente_inicial||AG.clientes[0].id;setClient(CID);render(r,true)}
const sp=$("#splash");let seen=false;try{seen=sessionStorage.getItem("radar-intro")==="1"}catch(e){}
if(RM||seen||location.search.includes("nosplash")){sp.remove();start()}
else{start();const end=()=>{sp.classList.add("out");setTimeout(()=>sp.remove(),600);try{sessionStorage.setItem("radar-intro","1")}catch(e){}};setTimeout(end,2300);sp.addEventListener("click",end)}
