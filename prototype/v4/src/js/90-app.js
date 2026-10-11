/* ============================================================
   Aplicação: rotas, menu, âmbito (Agência / clientes), modo claro e escuro, arranque.
   Rotas: #/<cliente>/<agora|concorrentes|comparar|antecipar|respostas>[/<marca>][#<foco>] · #/agencia/<torre|fontes>
   ============================================================ */
const PAGES={agora:{n:"Agora",i:"i-pulse",f:pageAgora},concorrentes:{n:"Concorrentes",s:"Marcas",i:"i-users",f:pageConcorrentes},comparar:{n:"Comparar",i:"i-chart",f:pageComparar},antecipar:{n:"Antecipar",i:"i-cal",f:pageAntecipar},respostas:{n:"Respostas",i:"i-shield",f:pageRespostas}};
const AGP={torre:{n:"Torre",i:"i-grid",f:pageTorre},fontes:{n:"Fontes de dados",i:"i-plug",f:pageFontes}};
let ROUTE={scope:"cliente",cid:AG.cliente_inicial,page:"agora",sub:null,focus:null};
function parse(h){const s=(h||"").replace(/^#\/?/,""),[path,focus]=s.split("#"),p=path.split("/").filter(Boolean);
  if(p[0]==="agencia")return{scope:"agencia",cid:ROUTE.cid,page:AGP[p[1]]?p[1]:"torre",sub:null,focus};
  if(p[1]==="afrente")p[1]="antecipar";       // ligações antigas («À frente»)
  if(CLS[p[0]])return{scope:"cliente",cid:p[0],page:PAGES[p[1]]?p[1]:"agora",sub:p[2]||null,focus};
  return{scope:"cliente",cid:ROUTE.cid||AG.cliente_inicial,page:"agora",sub:null,focus:null}}
const href=r=>r.scope==="agencia"?`#/agencia/${r.page}`:`#/${r.cid}/${r.page}${r.sub?"/"+r.sub:""}${r.focus?"#"+r.focus:""}`;
function go(path){const r=parse("#/"+path);if(r.cid!==ROUTE.cid){FA={tipo:"Todos",marca:"",per:1};FC={terr:"",n:12,mv:8}}if(r.sub!==ROUTE.sub)FC={terr:"",n:12,mv:8};try{history.pushState(null,"",href(r))}catch(e){}render(r,true)}
addEventListener("popstate",()=>render(parse(location.hash),true));
addEventListener("hashchange",()=>{const r=parse(location.hash);if(href(r)!==href(ROUTE))render(r,true)});
document.addEventListener("click",e=>{const t=e.target.closest("[data-go]");if(!t)return;e.preventDefault();closeDrawer();go(t.dataset.go)});

function nav(){const r=ROUTE,cnt=agora().filter(m=>m.nivel==="importante").length;
  $("#nav").innerHTML=`<div class="grp">${esc(D.cliente.nome)}</div>`+Object.entries(PAGES).map(([k,p])=>`<button class="nv" data-go="${D.cliente.id}/${k}" ${r.scope==="cliente"&&r.page===k?'aria-current="page"':""}><svg class="ic"><use href="#${p.i}"/></svg><span class="lg">${p.n}</span><span class="sh">${p.s||p.n}</span>${k==="agora"&&cnt?`<span class="cnt" data-tip="Movimentos importantes esta semana">${cnt}</span>`:""}</button>`).join("")+
   `<div class="grp">Agência</div>`+Object.entries(AGP).map(([k,p])=>`<button class="nv" data-go="agencia/${k}" ${r.scope==="agencia"&&r.page===k?'aria-current="page"':""}><svg class="ic"><use href="#${p.i}"/></svg><span class="lg">${p.n}</span><span class="sh">${p.n.split(" ")[0]}</span></button>`).join("");
  $("#scope").innerHTML=`<button data-go="agencia/torre" aria-pressed="${r.scope==="agencia"}">Agência</button>`+AG.clientes.map(c=>`<button data-go="${c.id}/${r.scope==="cliente"?r.page:"agora"}" aria-pressed="${r.scope==="cliente"&&r.cid===c.id}">${esc(c.nome)} <span class="sv">${esc(c.vertical)}</span></button>`).join("")}

function render(r,top){
  ROUTE=r;setClient(r.cid);SEAL=[];AFTER.length=0;CHARTS.length=0;closeDrawer();$("#pop").classList.remove("on");
  const pg=r.scope==="agencia"?AGP[r.page]:PAGES[r.page];
  const html=pg.f(r.sub,r.focus);$("#page").innerHTML=html;
  $$(".sealslot",$("#page")).forEach(s=>s.innerHTML=SEAL.length?sealHTML():"");
  nav();AFTER.forEach(f=>f());AFTER.length=0;counters($("#page"));
  document.title=`Arena Radar · ${r.scope==="agencia"?pg.n:D.cliente.nome+" · "+pg.n}`;$("#live").textContent=document.title;
  if(top&&!r.focus)scrollTo({top:0,behavior:"auto"});
  if(location.hash!==href(r))try{history.replaceState(null,"",href(r))}catch(e){}}
function rerender(){const y=scrollY;render(ROUTE,false);scrollTo({top:y,behavior:"auto"})}

/* modo claro e escuro */
function setMode(m){document.documentElement.dataset.mode=m;$("#modebtn use").setAttribute("href",m==="dark"?"#i-sun":"#i-moon");MEM.modo=m;saveMem();CHARTS.forEach(c=>c.host.isConnected&&c.draw())}
$("#modebtn").addEventListener("click",()=>setMode(document.documentElement.dataset.mode==="dark"?"light":"dark"));
if(MEM.modo)setMode(MEM.modo);else if(EM_ARTEFACTO&&matchMedia("(prefers-color-scheme: dark)").matches)setMode("dark");

render(parse(location.hash),false);
