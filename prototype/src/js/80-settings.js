/* ============================================================
   Definições (ícone no topo): aparência (claro/escuro), cor do tema e controlos de demonstração.
   As cores vêm de config/themes/*.json e passam por validação de contraste AA ao serem aplicadas.
   ============================================================ */
function applyTheme(id,announce){const t=AG.temas.find(x=>x.id===id)||AG.temas[0],aa=ensureAA(t.cor),root=document.documentElement;
  root.style.setProperty("--brand",t.cor);root.style.setProperty("--brand-ink",aa.hex);APPTHEME=t.id;
  if(announce){const adj=aa.hex.toLowerCase()!==t.cor.toLowerCase();toast(adj?`${t.nome}: a cor tem ${nf(aa.before,1)}:1 de contraste com branco. Para texto e botões o Radar usa ${aa.hex} (${nf(aa.after,1)}:1), acima do mínimo AA de 4,5:1.`:`${t.nome}: contraste ${nf(aa.before,1)}:1, cumpre o mínimo AA de 4,5:1.`)}
  syncSettings();redrawCharts()}
let APPTHEME=null;
function setMode(m){document.documentElement.dataset.mode=m;syncSettings();redrawCharts()}
const isDark=()=>document.documentElement.dataset.mode==="dark";

/* Tema do visualizador (só na página publicada no claude.ai) */
function seguirTemaDoVisualizador(){
  const r=document.documentElement,mq=matchMedia("(prefers-color-scheme: dark)");
  const aplicar=()=>{const t=r.dataset.theme,dark=t==="dark"||(t!=="light"&&mq.matches);setMode(dark?"dark":"light")};
  aplicar();mq.addEventListener&&mq.addEventListener("change",aplicar);
  new MutationObserver(aplicar).observe(r,{attributes:true,attributeFilter:["data-theme"]})}

/* Menu de definições */
function settingsHTML(){
  const eq=VIEW!=="cliente"&&ROUTE.scope==="cliente";
  return`<div class="gh">Aparência</div>
   <div class="seg" role="group" aria-label="Modo de cor"><button data-modo="light" aria-pressed="${!isDark()}">Claro</button><button data-modo="dark" aria-pressed="${isDark()}">Escuro</button></div>
   ${VIEW!=="cliente"?`<div class="gh">Cor do tema</div><div class="sw2" role="group" aria-label="Cor do tema">${AG.temas.map(t=>{const aa=ensureAA(t.cor);return`<button data-tid="${t.id}" aria-label="${esc(t.nome)}" aria-pressed="${t.id===APPTHEME}" style="background:${t.cor}" data-tip="<b>${esc(t.nome)}</b><br>Contraste com branco: ${nf(aa.before,1)}:1${aa.hex.toLowerCase()!==t.cor.toLowerCase()?`. Texto e botões usam ${aa.hex} (${nf(aa.after,1)}:1).`:", cumpre AA."}"></button>`}).join("")}</div><p class="t-xs setnote">Só muda as cores de marca. O contraste é validado (WCAG AA).</p>`:""}
   ${eq?`<div class="gh">Demonstração</div>
    <button class="mi" data-sq aria-pressed="${!!(S&&S.bquiet)}"><span>Simular semana sem sinais</span><i class="tg" role="switch" aria-checked="${!!(S&&S.bquiet)}"></i></button>
    <button class="mi" data-reset><span>Repor demonstração</span></button>`:""}`}
function openSettings(){closeSettings();const m=document.createElement("div");m.id="setmenu";m.className="menu setm";m.setAttribute("role","dialog");m.setAttribute("aria-label","Definições");m.innerHTML=settingsHTML();document.body.appendChild(m);$("#setbtn").setAttribute("aria-expanded","true")}
function closeSettings(){const m=$("#setmenu");if(m)m.remove();const b=$("#setbtn");if(b)b.setAttribute("aria-expanded","false")}
function syncSettings(){const m=$("#setmenu");if(m)m.innerHTML=settingsHTML()}
document.addEventListener("click",e=>{
  if(e.target.closest("#setbtn")){$("#setmenu")?closeSettings():openSettings();return}
  const m=e.target.closest("#setmenu");
  if(m){let t;
    if(t=e.target.closest("[data-modo]"))setMode(t.dataset.modo);
    else if(t=e.target.closest("[data-tid]"))applyTheme(t.dataset.tid,true);
    else if(e.target.closest("[data-sq]")){S.bquiet=!S.bquiet;syncSettings();CUR.refresh()}
    else if(e.target.closest("[data-reset]")){closeSettings();resetEstado()}
    return}
  closeSettings()});
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeSettings()});
