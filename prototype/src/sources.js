/* ============================================================
   Fontes de dados: módulos de ligação e importador CSV com validação de proveniência.
   Extras do Observar da SPV (notícias, sazonalidade, recolha seletiva).
   ============================================================ */
// LIGAÇÃO[*]: cada módulo abaixo corresponde a uma fonte. O campo «st» (estado) passa a «ok» quando a fonte estiver ligada.
// Ponto de ligação de cada um: docs/09-pontos-de-ligacao.md.
const MODS=[
 {n:"Meta Ad Library",ty:"Anúncios",how:"API (Graph)",st:["wip","Simulado na demo"],desc:"Anúncios entregues na UE, incluindo comerciais: texto, datas, plataformas e alcance na UE. Não devolve investimento nem segmentação em anúncios comerciais.",flds:["page_name","ad_creative_bodies","ad_delivery_start_time","ad_delivery_stop_time","publisher_platforms","eu_total_reach","ad_snapshot_url"],cob:"Anúncios entregues na UE; os comerciais ficam cerca de 1 ano",reg:"Fonte pública oficial. O token exige identidade confirmada; aprovação de IT e Compliance",own:"Radar · scripts/collect_meta_ads.py",csv:1},
 {n:"Google Ads Transparency Center",ty:"Anúncios",how:"Consulta manual ou CSV",st:["wip","Manual + importador"],desc:"Anúncios por anunciante em pesquisa, YouTube e display, com datas e formatos. Não tem API oficial.",flds:["anunciante","formato","plataforma","primeira_vez_visto","ultima_vez_visto","regiao"],cob:"Por anunciante e região",reg:"Fonte pública. Recolha manual até haver forma aprovada de automatizar",own:"Equipa · manual",csv:1},
 {n:"Google Trends",ty:"Procura",how:"API em alpha ou CSV manual",st:["wip","Simulado na demo"],desc:"Interesse de pesquisa relativo (0 a 100) por tema e região. Alimenta as curvas de procura e dúvidas.",flds:["termo","semana","interesse","regiao"],cob:"Portugal e regiões",reg:"Fonte pública. API oficial em alpha, com candidatura",own:"Radar · scripts/collect_trends.py",csv:1},
 {n:"Notícias (Google News RSS)",ty:"Conversa pública",how:"RSS",st:["ok","Pronto a ligar"],desc:"Notícias por pesquisa em Portugal. Boa para deteção de temas; não é exaustiva.",flds:["titulo","fonte","data","url","termo"],cob:"Imprensa online em Portugal",reg:"Fonte pública, sem chave. Termos de uso a confirmar",own:"Radar · scripts/collect_news.py",csv:0},
 {n:"Ferramenta de ad intelligence licenciada",ty:"Anúncios e investimento",how:"API ou exportação, a definir",st:["lk","Por definir"],desc:"Módulo reservado para investimento estimado por canal e criativos multiplataforma, com licença do grupo.",flds:["anunciante","canal","investimento_estimado","impressoes_estimadas","criativo_url"],cob:"A definir com o fornecedor",reg:"Fonte licenciada. Depende de decisão de compra e de aprovação de IT e Compliance",own:"Direção · IT",csv:1},
 {n:"Monitorização de investimento e inserções",ty:"TV, rádio, exterior e digital",how:"Exportação do fornecedor",st:["lk","Por definir"],desc:"Inserções e investimento em meios tradicionais e digitais, para completar a presença por canal. Exemplo de fornecedor já listado no dossier: Marktest AdCheck.",flds:["anunciante","meio","data","inserções","investimento_estimado"],cob:"A definir com o fornecedor",reg:"Fonte licenciada. A definir pela Direção e por IT",own:"Direção · IT",csv:1},
 {n:"Google Ads, informações do leilão",ty:"Pesquisa · dados do cliente",how:"API Google Ads, conta do cliente",st:["lk","Por confirmar"],desc:"Quota de impressões, sobreposição e posição relativa face aos concorrentes que disputam os mesmos leilões.",flds:["quota_impressoes","taxa_sobreposicao","posicao_acima","quota_topo_pagina"],cob:"Contas de clientes geridas pela Arena",reg:"Dados internos do cliente. Exige autorização do cliente e parecer de Compliance",own:"Performance · Compliance",csv:0},
 {n:"Importador CSV",ty:"Qualquer fonte",how:"Ficheiro",st:["ok","Ativo na demo"],desc:"Recebe exportações de qualquer fonte e valida a proveniência de cada linha antes de entrar no Radar.",flds:["marca","plataforma","formato","data_inicio","texto","origem","fonte","data_recolha","metodo"],cob:"Qualquer",reg:"Regra de ouro: sem origem, fonte e data, a linha não entra",own:"Equipa",csv:0},
 {n:"Utilização do chatbot ELO",ty:"Dados internos do cliente",how:"—",st:["lk","Bloqueado"],desc:"Fora do âmbito até haver parecer de Compliance e autorização do cliente. Nunca entra no repositório.",flds:[],cob:"—",reg:"Bloqueado",own:"Compliance",csv:0}];
function buildFontes(){
 const cnt=k=>MODS.filter(m=>m.st[0]===k).length;
 $("#modsum").innerHTML=`<div class="kpi"><span class="t-xs">Módulos</span><span class="big">${MODS.length}</span><span class="t-sm muted">na biblioteca</span></div><div class="kpi"><span class="t-xs">Ativos ou prontos</span><span class="big">${cnt("ok")}</span><span class="t-sm muted">podem ser ligados já</span></div><div class="kpi"><span class="t-xs">Simulados na demo</span><span class="big">${cnt("wip")}</span><span class="t-sm muted">dados ilustrativos até ligar</span></div><div class="kpi"><span class="t-xs">Dependem de decisão</span><span class="big">${cnt("lk")}</span><span class="t-sm muted">IT, Compliance ou Direção</span></div>`;
 $("#mods").innerHTML=MODS.map(m=>`<article class="mod"><div class="ty"><span class="tag">${m.ty}</span><span class="tag">${m.how}</span><span class="st ${m.st[0]}" style="margin-left:auto">${m.st[1]}</span></div><h3>${m.n}</h3><p>${m.desc}</p>${m.flds.length?`<div class="flds">${m.flds.map(f=>`<span>${f}</span>`).join("")}</div>`:""}<dl><dt>Cobertura</dt><dd>${m.cob}</dd><dt>Regime</dt><dd>${m.reg}</dd><dt>Responsável</dt><dd>${m.own}</dd></dl>${m.csv?`<div><button class="btn" data-imp="1"><svg class="ic"><use href="#i-plug"/></svg>Importar CSV desta fonte</button></div>`:""}</article>`).join("");
 renderImp(null)}
document.addEventListener("click",e=>{if(e.target.closest("[data-imp]")){const el=$("#impsec");el&&el.scrollIntoView({behavior:RM?"auto":"smooth",block:"start"})}});

/* ---------- Importador CSV ---------- */
const FICT=["lumio","aurea","voltix","helio","zenit","marca exemplo"];
const CSVHEAD="marca,plataforma,formato,data_inicio,texto,origem,fonte,data_recolha,metodo";
const CSVEX=CSVHEAD+`
Marca Exemplo,Meta,Vídeo,2026-09-14,"Exemplo de texto de anúncio",demo,,,
Marca Exemplo,Google,Texto,2026-09-20,"Exemplo de anúncio de pesquisa",demo,,,
Marca Exemplo,TikTok,Vídeo,2026-09-22,"Linha com erro: origem real sem fonte",real,,,
Empresa Terceira,Meta,Imagem,2026-09-01,"Linha com erro: demo atribuído a terceiro",demo,,,
Marca Exemplo,Rádio,Áudio,2026-09-02,"Linha com erro: plataforma fora da lista",demo,,,
Marca Exemplo,YouTube,Vídeo,2026-09-25,"Exemplo estimado com método",estimado,,,"Contagem manual de criativos visíveis em 25/09/2026"`;
function parseCSV(t){t=t.replace(/^﻿/,"");const rows=[];let row=[],f="",q=false;for(let i=0;i<t.length;i++){const c=t[i];if(q){if(c==='"'){if(t[i+1]==='"'){f+='"';i++}else q=false}else f+=c}else if(c==='"')q=true;else if(c===","||c===";"){row.push(f);f=""}else if(c==="\n"||c==="\r"){if(c==="\r"&&t[i+1]==="\n")i++;row.push(f);f="";if(row.some(x=>x!==""))rows.push(row);row=[]}else f+=c}row.push(f);if(row.some(x=>x!==""))rows.push(row);return rows}
const slug=s=>s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
let IMPRES=null;
function validateCSV(text,name){
 const rows=parseCSV(text);if(rows.length<2)return{name,err:[{l:1,f:"ficheiro",m:"O ficheiro está vazio ou só tem cabeçalho."}],ok:[],total:0};
 const head=rows[0].map(h=>h.trim().toLowerCase()),need=["marca","plataforma","formato","data_inicio","texto","origem"],miss=need.filter(c=>!head.includes(c));
 if(miss.length)return{name,err:[{l:1,f:"cabeçalho",m:"Faltam as colunas: "+miss.join(", ")+"."}],ok:[],total:rows.length-1};
 const ix=k=>head.indexOf(k),err=[],ok=[],pm=Object.fromEntries(PL.map(p=>[p.toLowerCase(),p])),fm={"vídeo":0,"video":0,"imagem":1,"carrossel":2,"texto":3};
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
   if(o==="demo"&&marca&&!FICT.includes(marca.toLowerCase()))bad.push(["origem","Dado demo não pode ser atribuído a uma entidade terceira real (regra de ouro 4)."])}
  if(bad.length)bad.forEach(b=>err.push({l,f:b[0],m:b[1]}));
  else{const d=new Date(dt),st=Math.floor((d-W0)/(7*864e5))-WB;ok.push({id:1000+IMP.length+ok.length,imp:true,b:slug(marca),bn:marca,p:pl,fm:f,th:-1,st,en:MW-1,dd:0,h:txt,cta:"—",reach:0,o,f:g("fonte")||undefined,m:g("metodo")||undefined})}});
 return{name,err,ok,total:rows.length-1}}
function renderImp(res){IMPRES=res;const box=$("#impres");if(!box)return;
 if(!res){box.innerHTML=`<div class="lockcard"><svg class="ic" style="width:22px;height:22px"><use href="#i-plug"/></svg><div><b style="color:var(--text);font-weight:600">Ainda sem ficheiro</b><br>O Radar valida cada linha antes de a aceitar: plataforma e formato conhecidos, data válida, e origem com a fonte, a data de recolha ou o método que lhe correspondem.</div></div>`;return}
 const {ok,err,total,name}=res,bad=new Set(err.map(x=>x.l)).size;
 box.innerHTML=`<div class="sumchips"><span class="tag">${esc(name)}</span><span class="tag">${total} linhas</span><span class="st ok">${ok.length} válidas</span><span class="st ${bad?"wip":"lk"}">${bad} com erro</span></div>
  ${err.length?`<div class="panel tblwrap" style="margin-bottom:14px"><table class="errs"><thead><tr><th>Linha</th><th>Campo</th><th>O que corrigir</th></tr></thead><tbody>${err.map(x=>`<tr><td>${x.l}</td><td><b style="font-weight:600">${esc(x.f)}</b></td><td>${esc(x.m)}</td></tr>`).join("")}</tbody></table></div>`:""}
  ${ok.length?`<div class="panel tblwrap"><table><thead><tr><th>Marca</th><th>Plataforma</th><th>Formato</th><th>Início</th><th>Origem</th></tr></thead><tbody>${ok.slice(0,5).map(c=>`<tr><td style="font-weight:600">${esc(c.bn)}</td><td>${c.p}</td><td>${FM[c.fm]}</td><td>${dateOf(c)}</td><td>${B(c.o,{f:c.f,m:c.m})}</td></tr>`).join("")}</tbody></table></div>
  <div style="display:flex;gap:10px;margin-top:14px;flex-wrap:wrap"><button class="btn pri" id="impadd">Adicionar ${ok.length} ao Radar</button><span class="t-sm muted" style="align-self:center">As linhas com erro ficam de fora. Corrige o ficheiro e volta a carregar.</span></div>`:`<p class="t-sm muted">Nenhuma linha válida para adicionar.</p>`}`;
 hydrate(box)}
function loadCSV(text,name){renderImp(validateCSV(text,name))}
document.addEventListener("click",e=>{
 if(e.target.closest("#impsample")){loadCSV(CSVEX,"exemplo.csv");return}
 if(e.target.closest("#imptpl")){const b=new Blob([CSVEX.split("\n").slice(0,3).join("\n")],{type:"text/csv"}),a=document.createElement("a");a.href=URL.createObjectURL(b);a.download="modelo-radar.csv";document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),500);return}
 if(e.target.closest("#impadd")&&IMPRES){IMPRES.ok.forEach(c=>{if(!IMP.some(x=>x.b===c.b&&x.h===c.h&&x.st===c.st))IMP.push(c)});toast(IMPRES.ok.length+" criativos adicionados. Aparecem em Concorrência, Criativos, com a etiqueta de origem.");$("#impadd").insertAdjacentHTML("afterend",`<button class="btn" id="impgo">Ver em Criativos</button>`);$("#impadd").disabled=true}
 if(e.target.closest("#impgo")){UI.tab="criat";UI.br=null;go("energia")}
 if(e.target.closest("#impbtn"))$("#impfile").click()});
document.addEventListener("change",e=>{if(e.target.id==="impfile"&&e.target.files[0]){const f=e.target.files[0],r=new FileReader();r.onload=()=>loadCSV(String(r.result),f.name);r.readAsText(f);e.target.value=""}});
["dragover","dragenter"].forEach(ev=>document.addEventListener(ev,e=>{const d=e.target.closest&&e.target.closest("#drop");if(d){e.preventDefault();d.classList.add("over")}}));
["dragleave","drop"].forEach(ev=>document.addEventListener(ev,e=>{const d=e.target.closest&&e.target.closest("#drop");if(d){e.preventDefault();d.classList.remove("over");if(ev==="drop"&&e.dataTransfer.files[0]){const f=e.dataTransfer.files[0],r=new FileReader();r.onload=()=>loadCSV(String(r.result),f.name);r.readAsText(f)}}}));

/* ---------- Extras do Observar (SPV) ---------- */
const NEWS=[
 {n:"Volta",c:"var(--pos)",d:mk([[0,1],[12,2],[13,14],[14,22],[16,12],[24,8],[30,7],[31,16],[32,20],[34,10],[38,9]],41,1.2)},
 {n:"Ecopontos e recolha",c:"var(--c2)",d:mk([[0,8],[20,9],[28,12],[38,11]],42,2)},
 {n:"Metas e regulação",c:"var(--c3)",d:mk([[0,4],[10,5],[14,9],[22,6],[31,10],[38,7]],43,1.5)},
 {n:"Educação ambiental",c:"var(--c4)",d:mk([[0,3],[8,4],[30,5],[36,9],[38,10]],44,1.2)}];
const SEAS=[88,86,92,95,98,108,110,104,100,96,112,126];
function buildObservarExtra(){
 CH2.length=0;
 const xl=i=>wLab(i);
 $("#newsl").innerHTML=legendHTML(NEWS);
 tsChart($("#newsc"),{series:NEWS,type:"bars",stack:true,xl,fmt:v=>nf(v)+" artigos",h:230,aria:"Artigos por semana e tema"},false,CH2);
 $("#newst").innerHTML=tableHTML({series:NEWS,xl,fmt:nf,xh:"Semana"});
 tsChart($("#seasc"),{series:[{n:"Índice de procura",c:"var(--text-2)",d:SEAS,cf:i=>SEAS[i]>=105?"var(--brand-ink)":"color-mix(in srgb,var(--text-2) 55%,var(--surface))"}],type:"bars",ymax:140,xl:i=>MES[i],fmt:v=>nf(v)+" (média = 100)",h:230,aria:"Sazonalidade esperada da procura por mês"},false,CH2);
 const rows=[["Papel e cartão",4.8],["Recolha seletiva total",0.9],["Plástico nos ecopontos",-6.6]],M=8;
 $("#recvar").innerHTML=`<div class="dv">${rows.map(([l,v])=>{const w=Math.abs(v)/M*50;return`<div class="row"><span style="font-weight:600">${l}</span><div class="trk"><i style="${v>=0?`left:50%`:`right:50%`};width:${w}%;--o:${v>=0?"left":"right"};background:${v>=0?"var(--pos)":"var(--neg)"}" data-tip="<b>${l}</b>: ${sgn(v,1)}% no 1.º semestre de 2026 face ao ano anterior"></i><b style="${v>=0?`left:calc(50% + ${w}% + 8px)`:`right:calc(50% + ${w}% + 8px)`}">${sgn(v,1)}%</b></div></div>`}).join("")}</div><p class="t-xs" style="margin-top:12px">Variação do 1.º semestre de 2026 face ao 1.º semestre de 2025. Escala de −8% a +8%.</p>`;
 hydrate($("#recvar"))}
