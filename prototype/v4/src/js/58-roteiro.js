/* ============================================================
   Roteiro da demonstração: percurso fixo para reuniões (botão «Demonstração» no topo).
   Os passos vêm de config/v4/agencia.yaml (roteiro): rota, texto, elemento a destacar e detalhe a abrir.
   Setas ← → mudam de passo; Esc sai.
   ============================================================ */
let TOUR=-1,tourT;
const TR=()=>AG.roteiro||[];
function tourBar(){const b=$("#tourbar"),R=TR();document.body.classList.toggle("touring",TOUR>=0);if(TOUR<0){b.classList.remove("on");b.innerHTML="";$("#tourbtn").setAttribute("aria-pressed","false");return}
  const st=R[TOUR];$("#tourbtn").setAttribute("aria-pressed","true");
  b.innerHTML=`<div class="tb-n"><span>Demonstração · ${TOUR+1} de ${R.length}</span><span class="tb-dots" aria-hidden="true">${R.map((_,i)=>`<i class="${i===TOUR?"on":i<TOUR?"done":""}"></i>`).join("")}</span></div>
    <div class="tb-t"><b>${esc(st.titulo)}</b><span>${esc(st.texto)}</span></div>
    <div class="tb-a"><button class="tb-b" data-tour="-1" ${TOUR===0?"disabled":""} aria-label="Passo anterior"><svg class="ic"><use href="#i-back"/></svg></button><button class="tb-b pri" data-tour="1">${TOUR===R.length-1?"Terminar":"Seguinte"}${TOUR===R.length-1?"":`<svg class="ic"><use href="#i-arrow"/></svg>`}</button><button class="tb-b" data-tour="x" aria-label="Sair da demonstração"><svg class="ic"><use href="#i-x"/></svg></button></div>`;
  b.classList.add("on")}
function tourGo(i){const R=TR();if(!R.length)return;if(i<0)i=0;if(i>=R.length){tourEnd();return}
  TOUR=i;const st=R[i];$$(".tourfoco").forEach(e=>e.classList.remove("tourfoco"));
  go(st.rota);tourBar();clearTimeout(tourT);
  tourT=setTimeout(()=>{
    if(st.abrir==="movimento-topo"){const m=agora()[0];if(m)moveDetail(m)}
    if(st.foco){const el=$(st.foco,$("#page"));if(el){el.classList.add("tourfoco");el.scrollIntoView({behavior:RM?"auto":"smooth",block:st.foco===".phead.hero"||st.foco===".phead"?"start":"center"})}}
  },140);
  $("#live").textContent=`Demonstração, passo ${i+1} de ${R.length}: ${st.titulo}`}
function tourEnd(){TOUR=-1;clearTimeout(tourT);$$(".tourfoco").forEach(e=>e.classList.remove("tourfoco"));tourBar()}
document.addEventListener("click",e=>{let t;
  if(e.target.closest("#tourbtn")){TOUR<0?tourGo(0):tourEnd();return}
  if(t=e.target.closest("[data-tour]")){const v=t.dataset.tour;v==="x"?tourEnd():tourGo(TOUR+ +v)}});
document.addEventListener("keydown",e=>{if(TOUR<0||e.target.closest("input,select,textarea,svg[tabindex]"))return;
  if(e.key==="ArrowRight"){e.preventDefault();tourGo(TOUR+1)}else if(e.key==="ArrowLeft"){e.preventDefault();tourGo(TOUR-1)}
  else if(e.key==="Escape"&&!$("#drawer").classList.contains("on"))tourEnd()});
