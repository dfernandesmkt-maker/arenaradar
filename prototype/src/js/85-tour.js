/* ============================================================
   Modo apresentação: roteiro guiado (config/roteiro.yaml) com notas por ecrã, letra maior e menos distrações.
   Serve para apresentar o Radar à direção ou à equipa. Setas esquerda/direita avançam e recuam.
   Os passos «preparar» só existem para a demonstração e podem ser repostos (Repor demonstração).
   ============================================================ */
const TOUR={on:false,i:0};
const tourSteps=()=>AG.roteiro||[];
const hoje=()=>new Date().toISOString().slice(0,10);

/* Repor o estado da equipa (decisões e publicações) para recomeçar a demonstração */
function resetEstado(){
  try{localStorage.removeItem(STKEY)}catch(e){}
  Object.values(CLS).forEach(d=>{d.pistas.forEach(p=>{p.s="sugerida";p.cli=false;p.res=false;p.acao=p.acao0;p.para=p.para0});d.pub={publicada:false,paginas:[...PAGINAS_CLIENTE],cartoes:[],nota:"",quando:null}});
  Object.values(SESS).forEach(s=>{s.bquiet=false;s.bmode="equipa"});
  toast("Demonstração reposta: pistas por decidir e nada publicado.");CUR.refresh()}

function tourPreparar(cid,tipo){
  const d=CLS[cid];if(!d||!tipo)return;
  if(tipo==="demo-pistas"){const p=d.pistas[0];if(p){p.s="aceite";p.cli=true}d.pub.cartoes=d.sinais.slice(0,2).map(s=>s.id)}
  if(tipo==="demo-publicar"){d.pub.publicada=true;d.pub.quando=hoje()}
  saveState()}
function tourRender(){
  const st=tourSteps(),s=st[TOUR.i],n=st.length,last=TOUR.i===n-1,t=$("#tour");
  t.innerHTML=`<div class="tour-in"><span class="tn">${TOUR.i+1}/${n}</span><div class="tt"><b>${esc(s.titulo)}</b><span>${esc(s.nota)}</span></div><div class="tb"><button class="btn" id="tprev" ${TOUR.i?"":"disabled"} aria-label="Passo anterior"><svg class="ic" style="transform:rotate(180deg)"><use href="#i-chev"/></svg></button><button class="btn pri" id="tnext">${last?"Terminar":"Seguinte"}<svg class="ic"><use href="#i-chev"/></svg></button><button class="btn ghost" id="treset" title="Repor decisões e publicações">Repor</button><button class="iconbtn" id="tclose" aria-label="Sair do modo apresentação" style="border:0;background:none;color:#fff"><svg class="ic"><use href="#i-x"/></svg></button></div></div>`}
function tourGo(i){
  const st=tourSteps();if(!st.length)return;TOUR.i=clamp(i,0,st.length-1);const s=st[TOUR.i],cid=s.rota.split("/")[0];
  tourPreparar(cid,s.preparar);
  go(s.rota+(s.rota.includes("?v=")||s.rota.startsWith("agencia")?"":"?v=equipa"));
  tourRender()}
function tourStart(){if(!tourSteps().length)return;TOUR.on=true;document.documentElement.dataset.present="1";$("#tour").hidden=false;tourGo(0);setTimeout(redrawCharts,50)}
function tourStop(){TOUR.on=false;delete document.documentElement.dataset.present;$("#tour").hidden=true;setTimeout(redrawCharts,50)}
document.addEventListener("click",e=>{
  if(e.target.closest("#presbtn")){TOUR.on?tourStop():tourStart();return}
  if(!TOUR.on)return;
  if(e.target.closest("#tnext")){TOUR.i>=tourSteps().length-1?tourStop():tourGo(TOUR.i+1);return}
  if(e.target.closest("#tprev")){tourGo(TOUR.i-1);return}
  if(e.target.closest("#treset")){resetEstado();return}
  if(e.target.closest("#tclose"))tourStop()});
document.addEventListener("keydown",e=>{if(!TOUR.on||e.target.closest("input,textarea,select,svg,[contenteditable]"))return;
  if(e.key==="ArrowRight"){e.preventDefault();TOUR.i>=tourSteps().length-1?tourStop():tourGo(TOUR.i+1)}
  if(e.key==="ArrowLeft"){e.preventDefault();tourGo(TOUR.i-1)}});
