/* ============================================================
   Página «Fontes de dados»: biblioteca de módulos (config/fontes.yaml) e importador CSV com validação de proveniência.
   LIGAÇÃO[importador-csv]: cada linha tem de trazer origem, e a origem exige o seu suporte (fonte e data, ou método).
   ============================================================ */
const CSVHEAD="marca,plataforma,formato,data_inicio,texto,origem,fonte,data_recolha,metodo";
const CSVEX=CSVHEAD+`
Marca Exemplo,Meta,Vídeo,2026-09-14,"Exemplo de texto de anúncio",demo,,,
Marca Exemplo,Google,Texto,2026-09-20,"Exemplo de anúncio de pesquisa",demo,,,
Marca Exemplo,TikTok,Vídeo,2026-09-22,"Linha com erro: origem real sem fonte",real,,,
Empresa Terceira,Meta,Imagem,2026-09-01,"Linha com erro: demo atribuído a terceiro",demo,,,
Marca Exemplo,Rádio,Áudio,2026-09-02,"Linha com erro: plataforma fora da lista",demo,,,
Marca Exemplo,YouTube,Vídeo,2026-09-25,"Exemplo estimado com método",estimado,,,"Contagem manual de criativos visíveis em 25/09/2026"`;
function parseCSV(t){t=t.replace(/^﻿/,"");const rows=[];let row=[],f="",q=false;for(let i=0;i<t.length;i++){const c=t[i];if(q){if(c==='"'){if(t[i+1]==='"'){f+='"';i++}else q=false}else f+=c}else if(c==='"')q=true;else if(c===","||c===";"){row.push(f);f=""}else if(c==="\n"||c==="\r"){if(c==="\r"&&t[i+1]==="\n")i++;row.push(f);f="";if(row.some(x=>x!==""))rows.push(row);row=[]}else f+=c}row.push(f);if(row.some(x=>x!==""))rows.push(row);return rows}
let IMPRES=null,IMPCLI=null;
const targetId=()=>IMPCLI||CID;
function withClient(id,fn){const prev=D&&D.cliente.id;setClient(id);const r=fn();if(prev&&prev!==id)setClient(prev);return r}
function validateCSV(text,name,cid){return withClient(cid,()=>{
 const rows=parseCSV(text);if(rows.length<2)return{name,cid,err:[{l:1,f:"ficheiro",m:"O ficheiro está vazio ou só tem cabeçalho."}],ok:[],total:0};
 const head=rows[0].map(h=>h.trim().toLowerCase()),need=["marca","plataforma","formato","data_inicio","texto","origem"],miss=need.filter(c=>!head.includes(c));
 if(miss.length)return{name,cid,err:[{l:1,f:"cabeçalho",m:"Faltam as colunas: "+miss.join(", ")+"."}],ok:[],total:rows.length-1};
 const ix=k=>head.indexOf(k),err=[],ok=[],pm=Object.fromEntries(PL.map(p=>[p.toLowerCase(),p])),fm=Object.fromEntries(FM.map(f=>[f.toLowerCase(),f])),fict=new Set(D.entidades.filter(e=>e.ficticia).map(e=>slug(e.nome)).concat(["marca-exemplo"]));
 fm["video"]="Vídeo";
 rows.slice(1).forEach((r,k)=>{const l=k+2,g=c=>(ix(c)>=0?(r[ix(c)]||""):"").trim(),bad=[];
  const marca=g("marca"),pl=pm[g("plataforma").toLowerCase()],f=fm[g("formato").toLowerCase()],dt=g("data_inicio"),o=g("origem").toLowerCase(),txt=g("texto");
  if(!marca)bad.push(["marca","Falta a marca."]);
  if(pl===undefined)bad.push(["plataforma","«"+g("plataforma")+"» não está na lista: "+PL.join(", ")+"."]);
  if(f===undefined)bad.push(["formato","«"+g("formato")+"» não está na lista: "+FM.join(", ")+"."]);
  if(!/^\d{4}-\d{2}-\d{2}$/.test(dt)||isNaN(new Date(dt)))bad.push(["data_inicio","Usa o formato AAAA-MM-DD."]);
  if(!txt)bad.push(["texto","Falta o texto do anúncio."]);
  if(!["real","estimado","demo"].includes(o))bad.push(["origem","Tem de ser real, estimado ou demo."]);
  else{if(o==="real"&&(!g("fonte")||!g("data_recolha")))bad.push(["origem","Dado real exige fonte e data_recolha (regra de ouro 2)."]);
   if(o==="estimado"&&!g("metodo"))bad.push(["origem","Dado estimado exige o método (regra de ouro 3)."]);
   if(o==="demo"&&marca&&!fict.has(slug(marca)))bad.push(["origem","Dado demo não pode ser atribuído a uma entidade terceira real (regra de ouro 4)."])}
  if(bad.length)bad.forEach(b=>err.push({l,f:b[0],m:b[1]}));
  else{const en=D.entidades.find(e=>slug(e.nome)===slug(marca));ok.push({id:"imp-"+Date.now()+"-"+ok.length,imp:true,marca:en?en.id:slug(marca),bn:marca,plataforma:pl,formato:f,data_inicio:dt,data_fim:null,texto:txt,origem:o,fonte:g("fonte")||undefined,metodo:g("metodo")||undefined})}});
 return{name,cid,err,ok,total:rows.length-1}})}
function renderImp(res){IMPRES=res;const box=$("#impres");if(!box)return;
 if(!res){box.innerHTML=`<div class="lockcard"><svg class="ic" style="width:22px;height:22px"><use href="#i-plug"/></svg><div><b style="color:var(--text);font-weight:600">Ainda sem ficheiro</b><br>O Radar valida cada linha antes de a aceitar: plataforma e formato conhecidos, data válida, e origem com a fonte, a data de recolha ou o método que lhe correspondem.</div></div>`;return}
 const {ok,err,total,name}=res,bad=new Set(err.map(x=>x.l)).size;
 box.innerHTML=`<div class="sumchips"><span class="tag">${esc(name)}</span><span class="tag">${total} linhas</span><span class="st ok">${ok.length} válidas</span><span class="st ${bad?"wip":"lk"}">${bad} com erro</span></div>
  ${err.length?`<div class="panel tblwrap" style="margin-bottom:14px"><table class="errs"><thead><tr><th>Linha</th><th>Campo</th><th>O que corrigir</th></tr></thead><tbody>${err.map(x=>`<tr><td>${x.l}</td><td><b style="font-weight:600">${esc(x.f)}</b></td><td>${esc(x.m)}</td></tr>`).join("")}</tbody></table></div>`:""}
  ${ok.length?`<div class="panel tblwrap"><table><thead><tr><th>Marca</th><th>Plataforma</th><th>Formato</th><th>Início</th><th>Origem</th></tr></thead><tbody>${ok.slice(0,5).map(c=>`<tr><td style="font-weight:600">${esc(c.bn)}</td><td>${c.plataforma}</td><td>${esc(c.formato)}</td><td>${fmtDt(c.data_inicio)}</td><td><span class="seal" data-o="${c.origem}" data-tip="${esc(c.fonte||c.metodo||"Sem fonte")}">${OL[c.origem]}</span></td></tr>`).join("")}</tbody></table></div>
  <div style="display:flex;gap:10px;margin-top:14px;flex-wrap:wrap"><button class="btn pri" id="impadd">Adicionar ${ok.length} ao Radar</button><span class="t-sm muted" style="align-self:center">As linhas com erro ficam de fora. Corrige o ficheiro e volta a carregar.</span></div>`:`<p class="t-sm muted">Nenhuma linha válida para adicionar.</p>`}`}
function loadCSV(text,name){renderImp(validateCSV(text,name,targetId()))}
document.addEventListener("click",e=>{
 if(e.target.closest("#impsample")){loadCSV(CSVEX,"exemplo.csv");return}
 if(e.target.closest("#imptpl")){const b=new Blob([CSVEX.split("\n").slice(0,3).join("\n")],{type:"text/csv"}),a=document.createElement("a");a.href=URL.createObjectURL(b);a.download="modelo-radar.csv";document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),500);return}
 if(e.target.closest("#impadd")&&IMPRES){const cid=IMPRES.cid;withClient(cid,()=>{IMPRES.ok.forEach(c=>{if(!S.imp.some(x=>x.marca===c.marca&&x.texto===c.texto&&x.data_inicio===c.data_inicio))S.imp.push(c)});rebuildAds()});toast(IMPRES.ok.length+" criativos adicionados a "+CLS[cid].cliente.nome+". Aparecem em Criativos, com a origem declarada no ficheiro.");$("#impadd").insertAdjacentHTML("afterend",`<button class="btn" id="impgo" data-cid="${cid}">Ver em Criativos</button>`);$("#impadd").disabled=true;return}
 if(e.target.closest("#impgo")){go(e.target.closest("#impgo").dataset.cid+"/criativos");return}
 if(e.target.closest("#impbtn"))$("#impfile").click();
 if(e.target.closest("[data-imp]")){const el=$("#impsec");el&&el.scrollIntoView({behavior:RM?"auto":"smooth",block:"start"})}});
document.addEventListener("change",e=>{
 if(e.target.id==="impcli"){IMPCLI=e.target.value;renderImp(null);return}
 if(e.target.id==="impfile"&&e.target.files[0]){const f=e.target.files[0],r=new FileReader();r.onload=()=>loadCSV(String(r.result),f.name);r.readAsText(f);e.target.value=""}});
["dragover","dragenter"].forEach(ev=>document.addEventListener(ev,e=>{const d=e.target.closest&&e.target.closest("#drop");if(d){e.preventDefault();d.classList.add("over")}}));
["dragleave","drop"].forEach(ev=>document.addEventListener(ev,e=>{const d=e.target.closest&&e.target.closest("#drop");if(d){e.preventDefault();d.classList.remove("over");if(ev==="drop"&&e.dataTransfer.files[0]){const f=e.dataTransfer.files[0],r=new FileReader();r.onload=()=>loadCSV(String(r.result),f.name);r.readAsText(f)}}}));

function pageFontes(){
  SEAL_OV={o:"pendente",t:"Biblioteca de fontes",pop:`<h3>Fontes de dados</h3><p class="s">Esta página descreve as fontes; não mostra dados de clientes.</p>`};
  const F=AG.fontes,cnt=k=>F.filter(m=>m.estado===k).length;
  const kp=[["Módulos",F.length,"na biblioteca"],["Ativos ou prontos",cnt("ok"),"podem ser ligados já"],["Simulados na demonstração",cnt("wip"),"dados ilustrativos até ligar"],["Dependem de decisão",cnt("lk"),"IT, Compliance ou Direção"]];
  IMPCLI=IMPCLI||CID;
  later(()=>renderImp(IMPRES&&IMPRES.cid===targetId()?IMPRES:null));
  return pheadHTML("Biblioteca de módulos","Fontes de dados","Cada fonte é um módulo: diz o que traz, como se liga e em que regime pode ser usada. Na demonstração os módulos estão simulados; em produção só entram fontes aprovadas por IT e Compliance."+(PREFS.fdet?" Cada módulo tem o seu identificador LIGAÇÃO[…] no código.":""))+
   `<div class="kpis k5">${kp.map(k=>kpiHTML({l:k[0],v:`<span>${k[1]}</span>`,sub:`<span class="muted">${k[2]}</span>`})).join("")}</div>
   <div class="sec"><header><div><h2 class="t-h2">Módulos</h2><p>Liga-se um módulo de cada vez. O que não estiver ligado aparece como «por recolher», nunca com números inventados.</p></div><button class="tgl" id="fdet" aria-pressed="${!!PREFS.fdet}" data-tip="Mostra os campos, a cobertura e o identificador de ligação de cada módulo, para o IT.">Detalhe técnico</button></header><div class="mods ${PREFS.fdet?"":"simple"}">${F.map(m=>`<article class="mod"><div class="ty"><span class="tag">${esc(m.tipo)}</span><span class="tag">${esc(m.como)}</span><span class="st ${m.estado}" style="margin-left:auto">${esc(m.estado_rotulo)}</span></div><h3>${esc(m.nome)}</h3><p>${esc(m.descricao)}</p>${m.campos.length?`<div class="flds tech">${m.campos.map(f=>`<span>${esc(f)}</span>`).join("")}</div>`:""}<dl><dt>Regime</dt><dd>${esc(m.regime)}</dd><dt>Responsável</dt><dd>${esc(m.responsavel)}</dd></dl><dl class="tech"><dt>Cobertura</dt><dd>${esc(m.cobertura)}</dd><dt>Ligação</dt><dd><code>LIGAÇÃO[${esc(m.id)}]</code></dd></dl>${m.csv?`<div><button class="btn" data-imp="1"><svg class="ic"><use href="#i-plug"/></svg>Importar CSV desta fonte</button></div>`:""}</article>`).join("")}</div></div>
   <div class="sec" id="impsec"><header><div><h2 class="t-h2">Importar um ficheiro CSV</h2><p>Para trazer exportações da Meta Ad Library, do Google Ads Transparency Center ou de uma ferramenta licenciada. Cada linha é validada antes de entrar no Radar.</p></div></header>
    <div style="display:flex;gap:10px;align-items:center;margin-bottom:14px;flex-wrap:wrap"><label class="t-sm muted" for="impcli">Cliente de destino</label><select id="impcli" style="max-width:100%;height:34px;border-radius:10px;border:1px solid var(--line);background:var(--surface);padding:0 10px">${AG.clientes.map(c=>`<option value="${c.id}" ${c.id===IMPCLI?"selected":""}>${esc(c.nome)}</option>`).join("")}</select></div>
    <div class="imp"><div class="drop" id="drop"><svg class="ic" style="width:26px;height:26px"><use href="#i-plug"/></svg><span>Arrasta um ficheiro CSV para aqui</span><input type="file" id="impfile" accept=".csv,text/csv"><button class="btn pri" id="impbtn">Escolher ficheiro</button>${EM_ARTEFACTO?"":`<button class="btn ghost" id="imptpl">Descarregar modelo</button>`}<button class="chip" id="impsample">Experimentar com um exemplo</button></div><div id="impres"></div></div></div>`}
document.addEventListener("click",e=>{if(e.target.closest("#fdet")){PREFS.fdet=!PREFS.fdet;savePrefs();CUR.refresh()}});
