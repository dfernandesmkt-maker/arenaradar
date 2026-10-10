/* ============================================================
   Dados: lê os datasets embebidos (gerados por scripts/build_dataset.py a partir de config/ e data/raw/)
   e deriva as estruturas que as páginas usam. A interface não tem clientes, marcas nem séries escritos aqui.

   LIGAÇÃO[*]: para ligar uma fonte real não se mexe neste ficheiro. Corre-se a recolha e o build_dataset.py;
   o dataset passa a trazer os blocos com origem «real» e o selo de dados da página muda sozinho.
   Contrato de dados e pontos de ligação: docs/09-pontos-de-ligacao.md
   ============================================================ */
const RAW=JSON.parse($("#radar-data").textContent);
const AG=RAW.agencia, CLS=RAW.clientes;
const CAT=["var(--brand-ink)","var(--c2)","var(--c3)","var(--c4)","var(--c5)"];
const DAY=864e5;
const pd=iso=>{const[y,m,d]=String(iso).slice(0,10).split("-").map(Number);return Date.UTC(y,m-1,d)};
const fmtDt=iso=>{if(!iso)return"";const[y,m,d]=String(iso).slice(0,10).split("-");return d+"/"+m+"/"+y};
const fmtShort=iso=>{if(!iso)return"";const d=new Date(pd(iso));return d.getUTCDate()+" "+MES[d.getUTCMonth()]};

/* ---------- Cliente ativo ---------- */
let D=null, S=null, W0=0, NW=0, Z=0, PL=[], PW={}, PC={}, FM=[], TH=[], ADS=[], AD={}, NA={};
const SESS={};
Object.values(CLS).forEach(d=>d.pistas.forEach(p=>{p.s=p.s||"sugerida";p.cli=!!p.cli;p.res=!!p.res}));   // estado inicial das pistas de todos os clientes
const isTema=()=>D.cliente.tipo_universo==="tema";
const periodos=()=>isTema()?[8,12,26,NW]:[4,8,12,26];
const ebyid=id=>D.entidades.find(e=>e.id===id);
const incl=()=>D.entidades.filter(e=>e.incluida);
const me=()=>D.entidades.find(e=>e.cliente);
const col=e=>e?CAT[e.cor%5]:"#6b7a77";
const hasAds=()=>!!(D&&D.anuncios&&D.anuncios.itens.length);

function wDateMs(i){return W0+i*7*DAY}
function wLab(i){const d=new Date(wDateMs(i));return d.getUTCDate()+" "+MES[d.getUTCMonth()]}
function wLabFull(i){return wLab(i)+" "+new Date(wDateMs(i)).getUTCFullYear()}
const weekOf=iso=>Math.floor((pd(iso)-W0)/(7*DAY));

function setClient(id){
  D=CLS[id];if(!D)return false;
  W0=pd(D.calendario.inicio);NW=D.calendario.semanas;Z=D.calendario.semana_atual;
  PL=D.plataformas.map(p=>p.id);PW=Object.fromEntries(D.plataformas.map(p=>[p.id,p.peso]));PC=Object.fromEntries(D.plataformas.map(p=>[p.id,p.valor_anuncio]));
  FM=D.formatos;TH=D.territorios;
  if(!SESS[id])SESS[id]={w:isTema()?NW:12,cmp:"anterior",pl:new Set(PL),ew:Z,imp:[],tab:{},fm:new Set(),sort:"rec",only:false,br:null,more:12,hl:null,chart:{}};
  S=SESS[id];
  D.pistas.forEach(p=>{if(!p.s){p.s="sugerida";p.cli=false;p.res=false}});
  rebuildAds();
  return true}

/* ---------- Anúncios: normalização e matrizes de atividade ---------- */
function normAd(a,i){
  const ds=Math.max(pd(a.data_inicio),W0),st=Math.max(0,Math.floor((ds-W0)/(7*DAY))),dd=Math.round((ds-(W0+st*7*DAY))/DAY);
  const fim=a.data_fim?pd(a.data_fim):null,en=fim?Math.min(NW-1,Math.floor((fim-W0)/(7*DAY))):NW-1;
  let fm=FM.indexOf(a.formato);if(fm<0){FM.push(a.formato||"Não indicado");fm=FM.length-1}
  return{id:a.id||("a"+i),i,b:a.marca,p:a.plataforma,fm,th:a.territorio?TH.indexOf(a.territorio):-1,st,en,dd,ds,fim,h:a.texto||"",cta:a.cta||"",reach:a.alcance||0,camp:a.campanha||null,o:a.origem,f:a.fonte,m:a.metodo,url:a.url,imp:!!a.imp,bn:a.bn,
    days:Math.max(1,Math.round(((fim||W0+NW*7*DAY)-ds)/DAY))}}
function rebuildAds(){
  const raw=[...(D.anuncios?D.anuncios.itens:[]),...S.imp];
  ADS=raw.map(normAd);
  AD={};NA={};
  D.entidades.forEach(e=>{AD[e.id]={};NA[e.id]={};PL.forEach(p=>{AD[e.id][p]=Array(NW).fill(0);NA[e.id][p]=Array(NW).fill(0)})});
  ADS.forEach(c=>{if(!AD[c.b]||!AD[c.b][c.p])return;NA[c.b][c.p][c.st]++;for(let w=c.st;w<=c.en;w++)AD[c.b][c.p][w]++})}

/* ---------- Origem dos dados (proveniência) ---------- */
const BLK=id=>D&&D.blocos?D.blocos[id]:null;
const OL={real:"Real",estimado:"Estimado",demo:"Demonstração",pendente:"Por ligar"};
function srcTip(id){const b=BLK(id);if(!b)return"";
  if(b.origem==="real")return`<b>Real.</b> Fonte: ${esc(b.fonte||"a indicar")}. Recolha: ${fmtDt(b.data_recolha)}.${b.metodo?" "+esc(b.metodo):""}`;
  if(b.origem==="estimado")return`<b>Estimado.</b> Método: ${esc(b.metodo||"a indicar")}.`;
  if(b.origem==="pendente")return`<b>Por ligar.</b> ${esc(b.metodo||"Ainda sem dados recolhidos.")}`;
  return`<b>Demonstração.</b> Dados simulados${b.metodo?" ("+esc(b.metodo)+")":""}. Nunca atribuídos a entidades reais de terceiros.`}
let USED=new Set();
const use=id=>{if(id)USED.add(id);return id};
function sealInfo(ids){
  const bl=[...ids].map(id=>({id,...BLK(id)})).filter(b=>b.origem);
  const c=o=>bl.filter(b=>b.origem===o).length,real=c("real"),est=c("estimado"),demo=c("demo"),tot=real+est+demo;
  let o,t;
  const rec=bl.filter(b=>b.origem==="real"&&b.data_recolha).map(b=>b.data_recolha).sort().pop();
  if(!tot){o="pendente";t="Por ligar"}
  else if(demo===tot){o="demo";t="Demonstração"}
  else if(!demo&&!est){o="real";t="Real · atualizado a "+fmtShort(rec)}
  else if(!demo){o="estimado";t=real?"Real e estimado":"Estimado"}
  else if(!real){o="misto";t="Demonstração e estimado"}
  else{o="misto";t=`Misto · ${real} de ${tot} blocos reais`}
  return{o,t,bl}}
