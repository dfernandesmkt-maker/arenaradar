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
const TOP=["var(--t1)","var(--t2)","var(--t3)","var(--t4)","var(--t5)"];   // temas e assuntos (nunca as cores das marcas)
const topC=i=>TOP[Math.min(i,TOP.length-1)];
const DAY=864e5;
const pd=iso=>{const[y,m,d]=String(iso).slice(0,10).split("-").map(Number);return Date.UTC(y,m-1,d)};
const fmtDt=iso=>{if(!iso)return"";const[y,m,d]=String(iso).slice(0,10).split("-");return d+"/"+m+"/"+y};
const fmtDT=iso=>{if(!iso)return"";try{return new Intl.DateTimeFormat("pt-PT",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"}).format(new Date(iso)).replace(",","")}catch(e){return fmtDt(iso)}};
const fmtShort=iso=>{if(!iso)return"";const d=new Date(pd(iso));return d.getUTCDate()+" "+MES[d.getUTCMonth()]};

/* ---------- Cliente ativo ---------- */
let D=null, S=null, W0=0, NW=0, Z=0, PL=[], PW={}, PC={}, FM=[], TH=[], ADS=[], AD={}, NA={};
const SESS={};
let VIEW="equipa";                      // vista ativa: «equipa» (completa) ou «cliente» (só o que a equipa publicou)

/* ---------- Preferências da pessoa (função e última visita): só neste navegador ---------- */
const PKEY="radar-prefs-v1";
let PREFS={role:"todos",seen:{},notif:{}};try{PREFS=Object.assign(PREFS,JSON.parse(localStorage.getItem(PKEY)||"{}"))}catch(e){}
if(!PREFS.seen)PREFS.seen={};if(!PREFS.notif)PREFS.notif={};if(!PREFS.views)PREFS.views={};
const savePrefs=()=>{try{localStorage.setItem(PKEY,JSON.stringify(PREFS))}catch(e){}};
const ROLES=[["todos","Toda a equipa"],["performance","Performance"],["brand","Brand"],["account","Account"],["direcao","Direção"]];
const ROLE_PARA={performance:"Performance",brand:"Brand",account:"Account"};   // a que atribuição de pistas corresponde
const roleLabel=()=>(ROLES.find(r=>r[0]===PREFS.role)||ROLES[0])[1];

/* ---------- Estado da equipa: decisões sobre pistas e publicação para o cliente ----------
   Guardado só neste navegador (localStorage). A persistência em ficheiro/base de dados é a tarefa RB-22.
   Só se reaproveita o que ainda corresponde aos dados atuais (o título da pista tem de coincidir).
   Publicação (D34): o RASCUNHO (paginas, cartoes, nota e pistas marcadas) é o que a equipa está a preparar;
   o PUBLICADO (pubd) é uma cópia do rascunho no momento de publicar e é a única coisa que o cliente vê.
   Alterar o rascunho depois de publicar não muda o que o cliente vê até haver novo «Publicar». */
/* LIGAÇÃO[persistencia-equipa]: hoje o estado (decisões, rascunho e publicação, destaques do briefing, preferências) vive no localStorage.
   Com persistência partilhada (RB-22), saveState() e savePrefs() passam a gravar no serviço da equipa; a leitura é a mesma. */
const STKEY="radar-estado-v1";
let SAVED={};try{SAVED=JSON.parse(localStorage.getItem(STKEY)||"{}")}catch(e){}
const PAGINAS_CLIENTE=["visao","mercado","procura","criativos","relatorios"];
const pubOk=p=>p.s==="aceite"||p.s==="ajustada";
const pubDefault=()=>({paginas:[...PAGINAS_CLIENTE],cartoes:[],nota:"",pubd:null,hist:[]});
function pubRasc(d=D){return{paginas:[...d.pub.paginas],cartoes:[...d.pub.cartoes],pistas:d.pistas.filter(p=>p.cli&&pubOk(p)).map(p=>({id:p.id,titulo:p.titulo,acao:p.acao})),nota:String(d.pub.nota||"").trim()}}
function pubSnapshot(d,por,quando){return{...pubRasc(d),quando:quando||new Date().toISOString(),por:por||roleLabel(),semana:d.calendario.rotulo_semana_atual}}
function pubNorm(o,d){return{paginas:(o.paginas||[]).filter(x=>PAGINAS_CLIENTE.includes(x)),cartoes:(o.cartoes||[]).filter(id=>d.sinais.some(s=>s.id===id)),pistas:(o.pistas||[]).filter(x=>x&&x.id&&d.pistas.some(p=>p.id===x.id)).map(x=>({id:x.id,titulo:String(x.titulo||""),acao:String(x.acao||"")})),nota:String(o.nota||""),quando:o.quando||null,por:o.por||"Equipa",semana:o.semana||d.calendario.rotulo_semana_atual}}
const pubKey=x=>JSON.stringify([[...x.paginas].sort(),[...x.cartoes].sort(),x.pistas.map(p=>[p.id,p.acao]).sort(),x.nota]);
const pubPend=(d=D)=>!!d.pub.pubd&&pubKey(d.pub.pubd)!==pubKey(pubRasc(d));          // publicado, mas o rascunho já é outro
const isPubd=(d=D)=>!!d.pub.pubd;
function pubHist(d,ev,por,s){d.pub.hist.unshift({q:new Date().toISOString(),por:por||roleLabel(),ev,n:s?{p:s.paginas.length,c:s.cartoes.length,k:s.pistas.length}:null});d.pub.hist=d.pub.hist.slice(0,8)}
/* LIGAÇÃO[entrega-cliente]: publicar só fixa a cópia que a vista do cliente mostra. A entrega real (acesso, convite, autenticação do cliente) decide-se com IT e Compliance. */
function pubPublicar(d,por){const novo=!d.pub.pubd,s=pubSnapshot(d,por);d.pub.pubd=s;pubHist(d,novo?"publicou":"atualizou",s.por,s);saveState();return s}
function pubRetirar(d,por){if(!d.pub.pubd)return;d.pub.pubd=null;pubHist(d,"retirou",por,null);saveState()}
function pubDescartar(d){const a=d.pub.pubd;if(!a)return;d.pub.paginas=[...a.paginas];if(!d.pub.paginas.includes("visao"))d.pub.paginas.unshift("visao");d.pub.cartoes=[...a.cartoes];d.pub.nota=a.nota;d.pistas.forEach(p=>{p.cli=a.pistas.some(x=>x.id===p.id)});saveState()}
Object.values(CLS).forEach(d=>d.entidades.forEach(e=>{e.incl0=!!e.incluida}));
Object.values(CLS).forEach(d=>{
  const sv=SAVED[d.cliente.id]||{},pk=sv.pistas||{};
  (Array.isArray(sv.user)?sv.user:[]).forEach(u=>{if(u&&u.id&&u.titulo&&!d.pistas.some(p=>p.id===u.id))d.pistas.push({id:String(u.id),sinal_id:null,titulo:String(u.titulo).slice(0,160),sinal:String(u.sinal||"Pista criada pela equipa."),leitura:String(u.leitura||""),acao:String(u.acao||""),para:["Performance","Brand","Account"].includes(u.para)?u.para:"Performance",confianca:String(u.confianca||"Criada pela equipa."),bloco:d.blocos.anuncios?"anuncios":Object.keys(d.blocos)[0],hipotese:false,user:true,q:u.q||null})});
  d.pistas.forEach(p=>{p.acao0=p.acao;p.para0=p.para;p.s="sugerida";p.cli=false;p.res=false;const o=pk[p.id];if(o&&o.t===p.titulo){p.s=o.s||"sugerida";p.cli=!!o.cli;p.res=!!o.res;p.dq=o.dq||null;p.dpor=o.dpor||null;if(o.para)p.para=o.para;if(o.acao)p.acao=o.acao}});
  const pb=sv.pub||{};
  d.pub={paginas:Array.isArray(pb.paginas)?pb.paginas.filter(x=>PAGINAS_CLIENTE.includes(x)):[...PAGINAS_CLIENTE],cartoes:(pb.cartoes||[]).filter(id=>d.sinais.some(s=>s.id===id)),nota:pb.nota||"",pubd:null,hist:Array.isArray(pb.hist)?pb.hist.slice(0,8):[]};
  if(!d.pub.paginas.includes("visao"))d.pub.paginas.unshift("visao");
  d.brief={extras:Array.isArray(sv.brief&&sv.brief.extras)?sv.brief.extras.filter(x=>x&&x.id&&x.t).slice(0,20):[]};
  if(pb.pubd)d.pub.pubd=pubNorm(pb.pubd,d);
  else if(pb.publicada)d.pub.pubd=pubSnapshot(d,"Equipa",pb.quando?pb.quando+"T09:00:00.000Z":null)});   // migra o formato anterior (só «publicada»)
function saveState(){try{const o={};Object.values(CLS).forEach(d=>{o[d.cliente.id]={pistas:Object.fromEntries(d.pistas.map(p=>[p.id,{t:p.titulo,s:p.s,para:p.para,acao:p.acao,cli:p.cli,res:p.res,dq:p.dq||null,dpor:p.dpor||null}])),user:d.pistas.filter(p=>p.user).map(p=>({id:p.id,titulo:p.titulo,sinal:p.sinal,leitura:p.leitura,acao:p.acao0,para:p.para0,confianca:p.confianca,q:p.q})),pub:d.pub,brief:d.brief}});localStorage.setItem(STKEY,JSON.stringify(o))}catch(e){}}
const isTema=()=>D.cliente.tipo_universo==="tema";
const periodos=()=>isTema()?[8,12,26,NW]:[4,8,12,26];
const ebyid=id=>D.entidades.find(e=>e.id===id);
const incl=()=>D.entidades.filter(e=>e.incluida);
const me=()=>D.entidades.find(e=>e.cliente);
const col=e=>e?CAT[e.cor%5]:"#6b7a77";
const hasAds=()=>!!(D&&D.anuncios&&D.anuncios.itens.length);
const isCli=()=>VIEW==="cliente";
const pubView=()=>!isCli()?pubRasc():(ROUTE&&ROUTE.rasc?pubRasc():D.pub.pubd);      // o que a vista mostra: publicado (cliente) ou rascunho (pré-visualização)
const paginasCliente=()=>{const v=pubView();return v?PAGINAS_CLIENTE.filter(p=>v.paginas.includes(p)&&(p!=="criativos"||hasAds())):[]};
const cartoesPub=()=>{const v=pubView();return v?D.sinais.filter(s=>v.cartoes.includes(s.id)):[]};
const pistasPub=()=>{const v=pubView();return v?v.pistas:[]};
const pubNota=()=>{const v=pubView();return v?v.nota:""};

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
