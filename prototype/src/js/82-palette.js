/* ============================================================
   Paleta de comandos e Pergunta ao Radar (Ctrl K): ir para uma página, mudar de cliente, executar uma ação
   ou fazer uma pergunta sobre os dados do cliente ativo. As respostas são calculadas sobre o dataset, com a sua origem.
   Na vista do cliente a paleta não existe.
   ============================================================ */
const norm=s=>String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"");

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

/* ---------- Comandos ---------- */
function comandos(){
  const L=[],cli=ROUTE.scope==="cliente";
  if(cli){
    Object.entries(PAGES).filter(([k,p])=>!p.hide&&(!p.if||p.if())).forEach(([k,p])=>L.push({g:"Ir para",t:p.n,i:p.i,k:"abrir página",run:()=>go(`${CID}/${k}`)}));
    if(hasAds()&&!isTema())incl().forEach(e=>L.push({g:"Ir para",t:"Ficha de marca: "+e.nome,i:"i-layers",k:"marca concorrente "+e.id,run:()=>go(`${CID}/marca/${e.id}`)}));
    mtabs().forEach(x=>L.push({g:"Ir para",t:"Mercado: "+x[1],i:"i-layers",k:"abrir",run:()=>go(`${CID}/mercado/${x[0]}`)}));
    L.push({g:"Ir para",t:"Relatórios: publicar para o cliente",i:"i-send",k:"publicar vista cliente",run:()=>go(`${CID}/relatorios/publicar`)});
  }
  Object.entries(AGPAGES).forEach(([k,p])=>L.push({g:"Ir para",t:p.n,i:p.i,k:"agência",run:()=>go(`agencia/${k}`)}));
  AG.clientes.forEach(c=>L.push({g:"Mudar de cliente",t:c.nome,i:"i-radar",k:`${c.vertical_nome} cliente`,run:()=>go(`${c.id}/${cli&&ROUTE.page!=="criativos"?ROUTE.page:"visao"}`)}));
  L.push({g:"Ações",t:"Alternar modo claro e escuro",i:isDark()?"i-sun":"i-moon",k:"tema aparência",run:()=>setMode(isDark()?"light":"dark")});
  if(tourSteps().length)L.push({g:"Ações",t:"Apresentar: roteiro guiado",i:"i-play",k:"demonstração modo apresentação",run:()=>tourStart()});
  if(cli){L.push({g:"Ações",t:"Ver o que o cliente vê (publicado)",i:"i-eye",k:"cliente publicar pré-visualizar",run:()=>go(`${CID}/${ROUTE.page==="acoes"?"visao":ROUTE.page}?v=cliente`)});
    L.push({g:"Ações",t:"Pré-visualizar o rascunho do cliente",i:"i-eye",k:"cliente rascunho publicar",run:()=>go(`${CID}/${ROUTE.page==="acoes"?"visao":ROUTE.page}?v=cliente&rasc=1`)});
    L.push({g:"Ações",t:"Simular semana sem sinais",i:"i-flask",k:"demonstração vazio",run:()=>{S.bquiet=!S.bquiet;CUR.refresh()}})}
  L.push({g:"Ações",t:"Repor demonstração",i:"i-x",k:"limpar decisões publicações",run:()=>resetEstado()});
  if(cli)ask.list.forEach(a=>L.push({g:"Perguntas",t:a.q,i:"i-search",k:"pergunta radar",run:()=>runAsk(a.id)}));
  return L}

const ask={el:$("#ask"),inp:$("#askin"),list:[],items:[],sel:0};
function palRender(){
  const q=norm(ask.inp.value.trim()),all=comandos(),words=q.split(/\s+/).filter(Boolean);
  let it=all.filter(c=>!words.length||words.every(w=>norm(c.t+" "+(c.k||"")+" "+c.g).includes(w)));
  if(!words.length)it=it.filter(c=>c.g!=="Mudar de cliente"||AG.clientes.length<=6).slice(0,14);else it=it.slice(0,10);
  if(!it.length&&q)it=[{g:"Perguntar",t:"Perguntar ao Radar: «"+ask.inp.value.trim()+"»",i:"i-search",run:()=>runAsk("x",ask.inp.value.trim())}];
  ask.items=it;ask.sel=Math.min(ask.sel,Math.max(0,it.length-1));
  let g="";$("#asksug").innerHTML=it.map((c,i)=>{const h=c.g!==g?`<div class="gh">${esc(c.g)}</div>`:"";g=c.g;return`${h}<button role="option" data-cmd="${i}" aria-selected="${i===ask.sel}"><svg class="ic" style="color:var(--text-2)"><use href="#${c.i}"/></svg>${esc(c.t)}</button>`}).join("");
  const sel=$('#asksug [aria-selected="true"]');if(sel)sel.scrollIntoView({block:"nearest"})}
function openAsk(pre){if(VIEW==="cliente")return;ask.list=ROUTE.scope==="cliente"?asks():[];ask.el.classList.add("on");$("#ans").hidden=true;$("#asksug").hidden=false;ask.inp.value="";ask.sel=0;palRender();setTimeout(()=>ask.inp.focus(),30);if(pre)runAsk(pre)}
function closeAsk(){ask.el.classList.remove("on")}
function runAsk(id,text){const a=ask.list.find(x=>x.id===id),q=text||(a?a.q:id);$("#asksug").hidden=true;const box=$("#ans");box.hidden=false;
  const type=(t,i=0)=>{ask.inp.value=t.slice(0,i);if(i<t.length&&!RM)setTimeout(()=>type(t,i+1),14);else ask.inp.value=t};type(q);
  box.innerHTML=`<div class="q">${esc(q)}</div><div class="dots" aria-label="A pensar"><i></i><i></i><i></i></div>`;
  setTimeout(()=>{box.innerHTML=`<div class="q">${esc(q)}</div><div class="ansbody">${answer(a||{id:"x"})}</div>`},RM?0:q.length*14+650)}
function palExec(i){const c=ask.items[i];if(!c)return;if(c.g==="Perguntas"||c.g==="Perguntar"){c.run();return}closeAsk();c.run()}
$("#askopen").addEventListener("click",()=>openAsk());
$("#askclose").addEventListener("click",closeAsk);
ask.el.addEventListener("click",e=>{if(e.target===ask.el)closeAsk();const c=e.target.closest("[data-cmd]");if(c){palExec(+c.dataset.cmd);return}const g=e.target.closest("[data-go]");if(g){closeAsk();go(g.dataset.go)}});
ask.inp.addEventListener("input",()=>{$("#ans").hidden=true;$("#asksug").hidden=false;ask.sel=0;palRender()});
ask.inp.addEventListener("keydown",e=>{
  if(e.key==="ArrowDown"){e.preventDefault();ask.sel=Math.min(ask.items.length-1,ask.sel+1);palRender()}
  else if(e.key==="ArrowUp"){e.preventDefault();ask.sel=Math.max(0,ask.sel-1);palRender()}
  else if(e.key==="Enter"){e.preventDefault();if(!$("#asksug").hidden)palExec(ask.sel);else{const v=ask.inp.value.trim();if(v){const m=ask.list.find(a=>a.k.test(v));runAsk(m?m.id:"x",v)}}}});
document.addEventListener("keydown",e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="k"){e.preventDefault();ask.el.classList.contains("on")?closeAsk():openAsk()}if(e.key==="Escape")closeAsk()});
