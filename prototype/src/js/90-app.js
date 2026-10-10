/* ============================================================
   Aplicação: rotas, seletor de âmbito (Agência › Vertical › Cliente), menu único, Pergunta ao Radar, temas e arranque.
   Rotas: #/<cliente>/<página>[/<separador>][#<foco>]  ·  #/agencia/<torre|fontes>
   ============================================================ */
let CID=null;                          // cliente ativo (último selecionado; também usado em Agência)
const PAGES={
  visao:{n:"Visão geral",i:"i-radar",f:pageVisao},
  mercado:{n:"Mercado",i:"i-layers",f:pageMercado},
  procura:{n:"Procura e notícias",i:"i-trend",f:pageProcura},
  criativos:{n:"Criativos",i:"i-image",f:pageCriativos,if:()=>hasAds()},
  relatorios:{n:"Relatórios",i:"i-mail",f:pageRelatorios},
  acoes:{n:"Ações",i:"i-spark",f:pageAcoes}};
const AGPAGES={torre:{n:"Torre de controlo",i:"i-grid",f:pageTorre},fontes:{n:"Fontes de dados",i:"i-plug",f:pageFontes}};
let ROUTE={scope:"cliente",cid:null,page:"visao",sub:null,focus:null};

/* ---------- Menu único (o mesmo para todos os clientes) e seletor de âmbito ---------- */
function buildNav(){
  const cli=ROUTE.scope==="cliente";
  const item=(id,p,on,href,cnt)=>`<button class="nv" data-go="${href}" aria-current="${on}"><svg class="ic"><use href="#${p.i}"/></svg>${p.n}${cnt?`<span class="cnt" id="navcnt" ${pistasPend(D)?"":"hidden"}>${pistasPend(D)}</span>`:""}</button>`;
  $("#nav").innerHTML=`<div class="grp">${esc(D.cliente.nome)}</div>`+Object.entries(PAGES).filter(([k,p])=>!p.if||p.if()).map(([k,p])=>item(k,p,cli&&ROUTE.page===k,`${D.cliente.id}/${k}`,k==="acoes")).join("")+
   `<div class="grp">Agência</div>`+Object.entries(AGPAGES).map(([k,p])=>item(k,p,!cli&&ROUTE.page===k,`agencia/${k}`,false)).join("")}
let MENU=null;
function buildScope(){
  const cli=ROUTE.scope==="cliente",v=AG.verticais.find(x=>x.id===D.cliente.vertical);
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
  const s=e.target.closest("[data-switch]");if(s){closeMenu();const pg=ROUTE.scope==="cliente"?ROUTE.page:"visao";go(s.dataset.switch+"/"+(pg==="criativos"&&!CLS[s.dataset.switch].anuncios?"visao":pg));return}
  if(!e.target.closest("#menu"))closeMenu()});
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeMenu()});

/* ---------- Router ---------- */
function parse(hash){
  const h=(hash||"").replace(/^#\/?/,""),[path,focus]=h.split("#"),p=path.split("/").filter(Boolean);
  if(p[0]==="agencia")return{scope:"agencia",cid:CID,page:AGPAGES[p[1]]?p[1]:"torre",sub:null,focus};
  if(p[0]&&CLS[p[0]])return{scope:"cliente",cid:p[0],page:PAGES[p[1]]?p[1]:"visao",sub:p[2]||null,focus};
  return{scope:"cliente",cid:CID||AG.clientes[0].id,page:"visao",sub:null,focus:null}}
function href(r){return r.scope==="agencia"?"#/agencia/"+r.page:`#/${r.cid}/${r.page}${r.sub?"/"+r.sub:""}${r.focus?"#"+r.focus:""}`}
function go(path){
  const first=path.split(/[\/#]/)[0];
  if(first!=="agencia"&&!CLS[first])path=CID+"/"+path;      // relativo ao cliente ativo
  const r=parse("#/"+path);
  if(href(r)===location.hash&&!r.focus){render(r,false);return}
  try{history.pushState(null,"",href(r))}catch(e){}render(r,true)}
addEventListener("popstate",()=>render(parse(location.hash),true));
addEventListener("hashchange",()=>{const r=parse(location.hash);if(!ROUTE||href(r)!==href(ROUTE))render(r,true)});
document.addEventListener("click",e=>{const g=e.target.closest("[data-go]");if(!g||!g.dataset.go||g.closest("#ask"))return;if(g.tagName==="A")e.preventDefault();go(g.dataset.go)});
document.addEventListener("keydown",e=>{if((e.key==="Enter"||e.key===" ")&&e.target.matches&&e.target.matches(".kpi[data-go]")){e.preventDefault();go(e.target.dataset.go)}});

function render(r,scrollTop){
  stopRace();stopPlay();closeDrawer();closeMenu();$("#pop").classList.remove("on");CHARTS.length=0;AFTER.length=0;USED.clear();SEAL_OV=null;SEAL_HIDE=false;
  ROUTE=r;if(r.cid){CID=r.cid}if(!D||D.cliente.id!==CID)setClient(CID);else if(!S)setClient(CID);
  const def=r.scope==="agencia"?AGPAGES[r.page]:PAGES[r.page];
  let pg=def;if(r.scope==="cliente"&&def.if&&!def.if()){ROUTE=r={...r,page:"visao"};pg=PAGES.visao}
  const t=$("#page");t.classList.remove("on");
  const html=pg.f(r.sub,r.focus);t.innerHTML=html;t.classList.add("on");
  buildNav();buildScope();
  document.title="Arena Radar, "+(r.scope==="agencia"?pg.n:D.cliente.nome+", "+pg.n);
  CUR.refresh=()=>{const y=scrollY;stopRace();stopPlay();CHARTS.length=0;AFTER.length=0;USED.clear();SEAL_OV=null;SEAL_HIDE=false;const h=pg.f(r.sub,r.focus);$("#page").innerHTML=h;buildNav();buildScope();AFTER.forEach(f=>f());AFTER.length=0;counters($("#page"));scrollTo({top:y,behavior:"auto"})};
  AFTER.forEach(f=>f());AFTER.length=0;counters(t);syncCounts();
  if(scrollTop&&!r.focus)scrollTo({top:0,behavior:"auto"});
  if(location.hash!==href(r)){try{history.replaceState(null,"",href(r))}catch(e){}}}

/* ---------- Temas por cliente (tokens) e modo escuro ---------- */
function applyTheme(id,announce){const t=AG.temas.find(x=>x.id===id)||AG.temas[0],aa=ensureAA(t.cor),root=document.documentElement;
  root.style.setProperty("--brand",t.cor);root.style.setProperty("--brand-ink",aa.hex);
  $$("#themes button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.id===t.id));
  if(announce){const adj=aa.hex.toLowerCase()!==t.cor.toLowerCase();toast(adj?`${t.nome}: a cor tem ${nf(aa.before,1)}:1 de contraste com branco. Para texto e botões o Radar usa ${aa.hex} (${nf(aa.after,1)}:1), acima do mínimo AA de 4,5:1.`:`${t.nome}: contraste ${nf(aa.before,1)}:1, cumpre o mínimo AA de 4,5:1.`)}
  redrawCharts()}
function buildThemes(){$("#themes").innerHTML=AG.temas.map(t=>{const aa=ensureAA(t.cor);return`<button data-id="${t.id}" aria-label="${esc(t.nome)}" aria-pressed="false" style="background:${t.cor}" data-tip="<b>${esc(t.nome)}</b><br>Contraste com branco: ${nf(aa.before,1)}:1${aa.hex.toLowerCase()!==t.cor.toLowerCase()?`. Texto e botões usam ${aa.hex} (${nf(aa.after,1)}:1).`:", cumpre AA."}"></button>`}).join("")}
$("#themes").addEventListener("click",e=>{const b=e.target.closest("button");if(b)applyTheme(b.dataset.id,true)});
$("#modebtn").addEventListener("click",()=>{const r=document.documentElement,d=r.dataset.mode==="dark";r.dataset.mode=d?"light":"dark";$("#modebtn use").setAttribute("href",d?"#i-moon":"#i-sun");redrawCharts()});

/* ---------- Pergunta ao Radar (respostas calculadas sobre os dados do cliente ativo) ---------- */
function asks(){
  const a=[{id:"mudou",q:"O que mudou esta semana?",k:/mudou|semana|novidade/i},{id:"pistas",q:"Que pistas já foram decididas?",k:/pista|aceit|decid|a[cç][aã]o/i}];
  if(hasAds()){a.push({id:"quota",q:`Qual é a quota de voz de ${me().nome}?`,k:/quota|voz/i},{id:"conjunto",q:`Que marcas estão no conjunto de ${D.cliente.vertical_nome}?`,k:/conjunto|marca|concorr/i},{id:"lancou",q:"Quem lançou campanhas novas?",k:/lan[cç]|campanha|nova/i})}
  if(D.procura){const pr=(D.procura.principais&&serieProcura(D.procura.principais[D.procura.principais.length-1]))||D.procura.series[0];a.push({id:"pico",q:`Quando houve o último pico de «${pr.nome}»?`,k:/pico|d[uú]vida|m[aá]ximo/i,s:pr})}
  if(D.contexto)D.contexto.indicadores.slice(0,2).forEach((it,i)=>a.push({id:"ind"+i,q:`O que sabemos sobre «${it.rotulo.toLowerCase()}»?`,k:new RegExp(it.id.split("_")[0],"i"),it}));
  return a}
function answer(a){
  const sl=bl=>`<p class="t-xs" style="margin-top:6px">${esc(sealInfo(new Set(bl)).t)}</p>`;
  if(a.id==="mudou"){const m=D.sinais.filter(s=>s.material),o=D.sinais.filter(s=>!s.material);return`<p>${m.length?`Há <b>${m.length===1?"um sinal":m.length+" sinais"} acima do limiar</b>:`:"Nenhum sinal acima do limiar."}</p><ul style="padding-left:18px;display:grid;gap:6px">${m.map(s=>`<li data-src="${s.bloco}"><b>${esc(s.titulo)}</b></li>`).join("")}</ul>${o.length?`<p>Em observação:</p><ul style="padding-left:18px;display:grid;gap:6px">${o.map(s=>`<li data-src="${s.bloco}">${esc(s.titulo)}</li>`).join("")}</ul>`:""}${sl(D.sinais.map(s=>s.bloco))}<p><button class="btn" data-go="visao">Abrir a Visão geral</button></p>`}
  if(a.id==="pistas"){const l=D.pistas.map(p=>`<li>${esc(p.titulo)}: <b>${STL[p.s].toLowerCase()}</b></li>`).join("");return`<ul style="padding-left:18px;display:grid;gap:6px">${l||"<li>Sem pistas esta semana.</li>"}</ul><p><button class="btn" data-go="acoes/pistas">Abrir as pistas</button></p>`}
  if(a.id==="quota"){const s=sov(Z),inc=incl().sort((x,y)=>s[y.id]-s[x.id]),m=me();return`<p>${esc(m.nome)} tem <b>${nf(s[m.id],1)}%</b> da quota de voz, em ${inc.findIndex(e=>e.cliente)+1}.º lugar entre ${inc.length} marcas. ${inc[0].cliente?"É a marca com mais voz.":`${esc(inc[0].nome)} lidera com ${nf(s[inc[0].id],1)}%.`}</p><div>${spark(range(Z-15,Z).map(w=>sov(w)[m.id]),300,44)}</div>${sl(["anuncios"])}<p><button class="btn" data-go="mercado/voz">Abrir a quota de voz</button></p>`}
  if(a.id==="conjunto"){const inc=incl().map(e=>e.nome).join(", "),sg=D.entidades.find(e=>e.sugerida);return`<p>O conjunto de ${esc(me().nome)} tem <b>${incl().length} marcas</b>: ${esc(inc)}. ${sg?`O Radar sugere ainda ${esc(sg.nome)}, que a equipa pode aceitar.`:""}</p>${sl(["anuncios"])}<p><button class="btn" data-go="mercado/voz">Abrir o conjunto competitivo</button></p>`}
  if(a.id==="lancou"){const l=D.sinais.filter(s=>s.categoria==="Lançamento");return l.length?`<ul style="padding-left:18px;display:grid;gap:6px">${l.map(s=>`<li><b>${esc(s.titulo)}</b>. ${esc(s.leitura)}</li>`).join("")}</ul>${sl(["anuncios"])}<p><button class="btn" data-go="criativos">Ver criativos</button></p>`:`<p>Nenhum lançamento acima do limiar nas últimas semanas.</p>${sl(["anuncios"])}`}
  if(a.id==="pico"){const v=a.s.valores,mx=Math.max(...v.filter(x=>x!=null)),i=v.indexOf(mx);return`<p>O valor mais alto de «${esc(a.s.nome)}» é ${i===Z?"o desta semana, ":"o da semana de "}<b>${wLab(i)}</b>: ${mx} em 100.</p>${sl(["procura"])}<p><button class="btn" data-go="procura">Abrir Procura e notícias</button></p>`}
  if(a.it){const it=a.it;return`<p><b>${esc(it.rotulo)}</b>: ${nf(it.valor,it.decimais||0)}${esc(it.formato||"")}. ${esc(it.detalhe||"")}</p>${sl([it.bloco])}<p><button class="btn" data-go="mercado/ctx">Abrir o contexto de mercado</button></p>`}
  return`<p>Nesta pré-visualização só respondo às perguntas sugeridas. Na versão real, a pergunta traduz-se numa consulta aos dados recolhidos, e a resposta traz sempre a origem de cada número.</p>`}
const ask={el:$("#ask"),inp:$("#askin"),list:[]};
function openAsk(pre){if(ROUTE.scope!=="cliente"){toast("Escolhe um cliente para perguntar ao Radar.");return}ask.list=asks();ask.el.classList.add("on");$("#ans").hidden=true;$("#asksug").hidden=false;ask.inp.value="";$("#asksug").innerHTML=ask.list.map(a=>`<button data-q="${a.id}"><svg class="ic" style="color:var(--text-2)"><use href="#i-search"/></svg>${esc(a.q)}</button>`).join("");setTimeout(()=>ask.inp.focus(),30);if(pre)runAsk(pre)}
function closeAsk(){ask.el.classList.remove("on")}
function runAsk(id,text){const a=ask.list.find(x=>x.id===id),q=text||(a?a.q:id);$("#asksug").hidden=true;const box=$("#ans");box.hidden=false;
  const type=(t,i=0)=>{ask.inp.value=t.slice(0,i);if(i<t.length&&!RM)setTimeout(()=>type(t,i+1),14);else ask.inp.value=t};type(q);
  box.innerHTML=`<div class="q">${esc(q)}</div><div class="dots" aria-label="A pensar"><i></i><i></i><i></i></div>`;
  setTimeout(()=>{box.innerHTML=`<div class="q">${esc(q)}</div><div class="ansbody">${answer(a||{id:"x"})}</div>`},RM?0:q.length*14+650)}
$("#askopen").addEventListener("click",()=>openAsk());
$("#askclose").addEventListener("click",closeAsk);
ask.el.addEventListener("click",e=>{if(e.target===ask.el)closeAsk();const s=e.target.closest("[data-q]");if(s)runAsk(s.dataset.q);const g=e.target.closest("[data-go]");if(g){closeAsk();go(g.dataset.go)}});
ask.inp.addEventListener("keydown",e=>{if(e.key==="Enter"){const v=ask.inp.value.trim();if(!v)return;const m=ask.list.find(a=>a.k.test(v));runAsk(m?m.id:"x",v)}});
document.addEventListener("keydown",e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="k"){e.preventDefault();ask.el.classList.contains("on")?closeAsk():openAsk()}if(e.key==="Escape")closeAsk()});

/* ---------- Arranque ---------- */
function start(){
  buildThemes();applyTheme(AG.temas[0].id,false);
  const r=parse(location.hash);CID=r.cid||AG.clientes[0].id;setClient(CID);render(r,true)}
const sp=$("#splash");let seen=false;try{seen=sessionStorage.getItem("radar-intro")==="1"}catch(e){}
if(RM||seen||location.search.includes("nosplash")){sp.remove();start()}
else{start();const end=()=>{sp.classList.add("out");setTimeout(()=>sp.remove(),600);try{sessionStorage.setItem("radar-intro","1")}catch(e){}};setTimeout(end,2300);sp.addEventListener("click",end)}
