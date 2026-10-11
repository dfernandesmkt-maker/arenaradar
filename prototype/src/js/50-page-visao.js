/* ============================================================
   Página «Visão geral» (igual para todos os clientes):
   filtros → KPIs → o que mudou → gráfico principal → detalhe por entidade.
   ============================================================ */
const AFTER=[];                       // funções a correr depois de o HTML da página estar no ecrã (gráficos, animações)
const later=fn=>AFTER.push(fn);
const RAMP=["var(--r1)","var(--r2)","var(--r3)","var(--r4)"];
const rampOf=p=>RAMP[PL.indexOf(p)%4];

function sigGo(s){
  if(s.bloco&&s.bloco.startsWith("ctx_"))return"mercado/ctx";
  if(s.serie&&s.serie.tipo==="procura"||s.bloco==="sazonalidade"||s.bloco==="procura")return"procura";
  if(s.serie&&s.serie.tipo==="quota_voz")return"mercado/voz";
  return"mercado/ativ"}
function sigCardCli(s,i){
  const e=s.entidade?ebyid(s.entidade):null,ch=sigChart(s),pp=s.pista_id?pistasPub().find(x=>x.id===s.pista_id):null;
  if(ch)later(()=>tsChart($("#sgc"+i),{...ch,type:"line",fill:true,mini:true,h:52},false));
  return`<article class="sg" data-src="${use(s.bloco)}">
   <div class="top2"><span class="who">${e?`<i style="background:${col(e)}"></i>${esc(e.nome)}`:esc(s.categoria)}</span></div>
   <h3>${esc(s.titulo)}</h3>${ch?`<div class="cv" id="sgc${i}" style="height:52px"></div>`:""}
   <p class="rd">${esc(s.leitura)}${s.hipotese?" (leitura a validar)":""}</p>
   ${pp?`<div class="pk2"><svg class="ic" style="width:16px;height:16px;margin-top:2px;color:var(--link);flex:none"><use href="#i-spark"/></svg><span><b>A Arena propõe:</b> ${esc(pp.acao)}</span></div>`:""}
  </article>`}
function sigMeter(s){
  if(s.limiar==null||s.valor==null||!+s.limiar)return"";
  const v=Math.abs(s.valor),l=Math.abs(s.limiar),pc=clamp(v/(l*2)*100,3,100),d=v<10?1:0,u=sigUnit(s);
  return`<div class="lmeter" role="meter" aria-valuemin="0" aria-valuemax="${nf(l*2,d)}" aria-valuenow="${nf(v,d)}" aria-label="Valor face ao limiar" data-tip="Valor observado face ao limiar definido para este tipo de sinal">
   <div class="mb"><i class="${v>=l?"ok":""}" style="width:${pc.toFixed(0)}%"></i><u></u></div>
   <div class="ml"><span><b>${nf(v,d)}${u}</b> ${s.janela_curta?(s.janela_curta.startsWith("vs")?s.janela_curta:"em "+s.janela_curta):"observado"}</span><span>limiar ${nf(l,d)}${u}</span></div></div>`}
function sigCard(s,i){
  if(isCli())return sigCardCli(s,i);
  const e=s.entidade?ebyid(s.entidade):null,p=s.pista_id?D.pistas.find(x=>x.id===s.pista_id):null,ch=sigChart(s),noRasc=D.pub.cartoes.includes(s.id),noPub=!!(D.pub.pubd&&D.pub.pubd.cartoes.includes(s.id)),pub=noRasc;
  if(ch)later(()=>tsChart($("#sgc"+i),{...ch,type:"line",fill:true,mini:true,h:52,blip:s.material},false));
  const crt=s.entidade&&s.categoria==="Lançamento",det=crt?`data-cr-b="${s.entidade}"`:`data-go="${sigGo(s)}"`,dl=crt?"Ver criativos":"Ver detalhe";
  return`<article class="sg ${s.material?"":"obs"}" data-src="${use(s.bloco)}">
   <div class="top2"><span class="who" ${e?`data-ent="${e.id}" role="button" tabindex="0" data-tip="Abrir a marca"`:""}>${e?`<i style="background:${col(e)}"></i>${esc(e.nome)}`:esc(s.categoria)}</span><span class="tags">${p&&ROLE_PARA[PREFS.role]===p.para?`<span class="tag hi" data-tip="A pista deste cartão está atribuída à tua função.">Para ti</span>`:""}${s.novo?`<span class="tag nw" data-tip="Não estava acima do limiar na semana passada.">Novo</span>`:""}<span class="tag ${s.material?"sig":""}">${s.material?"Acima do limiar":"Em observação"}</span></span></div>
   <h3>${esc(s.titulo)}</h3>${ch?`<div class="cv" id="sgc${i}" style="height:52px"></div>`:""}
   <p class="rd clamp">${esc(s.leitura)} ${s.hipotese?`<span class="tag">Hipótese</span>`:""}</p>${sigMeter(s)}
   ${p?`<div class="pk2"><svg class="ic" style="width:16px;height:16px;margin-top:2px;color:var(--link);flex:none"><use href="#i-spark"/></svg><span class="pa"><b>Pista:</b> ${esc(p.acao)}</span><span class="ps">${esc(p.para)} · ${STL[p.s]}</span></div>`:""}
   <div class="acts">${p?`<button class="btn" data-go="acoes/pistas#${p.id}">Ver pista</button>`:`<button class="btn" ${det}>${dl}</button>`}<button class="btn ghost" data-why="${s.id}">Porquê?</button>
    ${noRasc&&noPub?`<span class="tag ok" data-tip="Este cartão faz parte do que o cliente vê agora.">No cliente</span>`:noRasc?`<span class="tag" data-tip="Está no rascunho da vista do cliente. Só chega ao cliente quando publicares.">No rascunho</span>`:noPub?`<span class="tag warn" data-tip="O cliente ainda vê este cartão. Sai quando publicares as alterações.">A retirar</span>`:""}
    <div class="more"><button class="btn ghost ico" data-cardmenu aria-haspopup="menu" aria-expanded="false" aria-label="Mais ações"><svg class="ic"><use href="#i-dots"/></svg></button>
     <div class="mm" role="menu" hidden>${p?`<button role="menuitem" ${det}>${dl}</button>`:""}<button role="menuitem" data-pubsg="${s.id}"><svg class="ic"><use href="#i-send"/></svg>${pub?"Retirar do rascunho para o cliente":"Adicionar ao rascunho para o cliente"}</button>${p?`<button role="menuitem" data-res="${p.id}" ${p.res?"disabled":""}><svg class="ic"><use href="#i-flask"/></svg><span>${p.res?"Aprofundamento pedido":"Pedir aprofundamento à Research"}</span></button>`:""}</div></div></div>
  </article>`}
document.addEventListener("click",e=>{
  const mb=e.target.closest("[data-cardmenu]");
  $$(".mm:not([hidden])").forEach(m=>{if(!mb||m.parentNode!==mb.parentNode){m.hidden=true;m.parentNode.querySelector("[data-cardmenu]").setAttribute("aria-expanded","false")}});
  if(mb){const m=mb.parentNode.querySelector(".mm");m.hidden=!m.hidden;mb.setAttribute("aria-expanded",String(!m.hidden));if(!m.hidden){const f=m.querySelector("button:not([disabled])");f&&f.focus()}}});
document.addEventListener("keydown",e=>{if(e.key==="Escape"){const o=$(".mm:not([hidden])");if(o){o.hidden=true;const b=o.parentNode.querySelector("[data-cardmenu]");b.setAttribute("aria-expanded","false");b.focus()}}
  if((e.key==="ArrowDown"||e.key==="ArrowUp")&&e.target.closest&&e.target.closest(".mm")){e.preventDefault();const bs=$$("button:not([disabled])",e.target.closest(".mm")),i=bs.indexOf(e.target);bs[(i+(e.key==="ArrowDown"?1:-1)+bs.length)%bs.length].focus()}});

function mainChartHTML(){
  const W=win();
  if(hasAds()){
    // O gráfico principal responde ao título: as marcas do conjunto, com a do sinal em destaque. O detalhe por plataforma está em Mercado.
    const bs=incl(),xl=i=>wLab(W.a0+i),sg0=isCli()?cartoesPub()[0]:(S.bquiet?null:sinaisMat()[0]),fe=sg0&&sg0.entidade?bs.find(e=>e.id===sg0.entidade):null;
    const ser=bs.map(e=>({id:e.id,n:e.nome,c:col(e),w:fe&&e.id===fe.id?3.4:2,d:range(W.a0,W.z).map(w=>act(e.id,w))}));
    const cp={};ADS.filter(a=>a.camp&&bs.some(e=>e.id===a.b)&&PL.includes(a.p)).forEach(a=>{const k=a.b+"|"+a.camp,c=cp[k]||(cp[k]={b:a.b,n:a.camp,st:a.st,k:0});c.st=Math.min(c.st,a.st);c.k++});
    const ev=Object.values(cp).filter(c=>c.st>W.a0&&c.st<=W.z&&c.k>=3).sort((x,y)=>y.k-x.k).slice(0,4).sort((x,y)=>x.st-y.st).filter((c,j,r)=>j===0||c.st-r[j-1].st>=4).slice(0,3).map(c=>({i:c.st-W.a0,t:`${ebyid(c.b).nome} lança «${c.n}»`}));
    later(()=>tsChart($("#mc"),{series:ser,type:"line",end:true,events:ev,dim:fe?fe.id:null,xl,fmt:nf,aria:"Anúncios ativos por marca"},true));
    return cardHTML("Anúncios ativos por marca",fe?`Em destaque: <b>${esc(fe.nome)}</b>. ${esc(sg0.leitura)} <a href="#" data-go="mercado" style="color:var(--link);font-weight:600">Ver por plataforma em Mercado</a>.`:`Anúncios ativos de cada marca do conjunto, por semana. <a href="#" data-go="mercado" style="color:var(--link);font-weight:600">Ver por plataforma em Mercado</a>.`,`${legendHTML(ser,true)}<div class="cv" id="mc"></div>${tableHTML({series:ser,xl,fmt:nf})}`,"anuncios")}
  if(D.procura){
    const pr=D.procura.principais||D.procura.series.map(s=>s.id),ser=D.procura.series.filter(s=>pr.includes(s.id)),a0=W.a0,xl=i=>wLab(a0+i);
    const S2=ser.map(s=>({id:s.id,n:s.nome,c:procC(s,D.procura.series.indexOf(s)),d:s.valores.slice(a0,Z+1)})),ev=(D.eventos||[]).map(e=>({i:e.semana-a0,t:e.titulo}));
    later(()=>tsChart($("#mc"),{series:S2,type:"line",ymax:100,events:ev,xl,fmt:v=>nf(v),aria:"Interesse de pesquisa por tema"},true));
    return cardHTML("Procura por tema",`Interesse de pesquisa em Portugal, de 0 a 100. <a href="#" data-go="procura" style="color:var(--link);font-weight:600">Abrir Procura e notícias</a>.`,`${legendHTML(S2,true)}<div class="cv" id="mc"></div>${tableHTML({series:S2,xl,fmt:nf})}`,"procura")}
  return""}

function detailHTML(){
  const W=win();
  if(!isTema()&&!hasAds())return secHTML("Marcas em comparação","",emptyHTML("Sem anúncios ligados","Liga a Meta Ad Library ou importa um CSV em Fontes de dados."));
  if(hasAds()&&!isTema()){
    const bs=incl(),sv=sov(W.z),svp=W.canP?sov(W.z-W.w):null,sp=bs.map(e=>sumR(spdt,e.id,W.a0,W.z));
    const rows=[...bs].sort((a,b)=>press(b.id,W.z)-press(a.id,W.z)).map(e=>{const a1=act(e.id,W.z),a2=W.canP?act(e.id,W.z-W.w):null,nw=sumR(neu,e.id,W.a0,W.z),i=bs.indexOf(e);
      return`<tr class="go" data-ent="${e.id}"><td style="font-weight:600">${dot(e)}${esc(e.nome)}${e.cliente?' <span class="tag">cliente</span>':""}</td><td class="n">${nf(a1)}</td><td class="n">${a2!=null&&a2>=3?dchip(pctd(a1,a2)):`<span class="muted">—</span>`}</td><td class="n">${nf(sv[e.id],1)}%</td><td class="n">${svp?dchip(sv[e.id]-svp[e.id],"p.p."):`<span class="muted">—</span>`}</td><td class="n">${nf(nw)}</td><td class="n">${eur(sp[i])}</td></tr>`}).join("");
    use("investimento");
    return secHTML("Marcas em comparação","Clica numa marca para ver o detalhe.",`<p class="tbtn" style="margin:-4px 0 8px;text-align:right"><button class="btn ghost sm" type="button" data-copytbl>Copiar tabela</button></p><div class="panel tblwrap"><table class="sortable" data-tid="marcas"><thead><tr><th data-sort="txt">Marca</th><th class="n" data-sort="num">Anúncios ativos</th><th class="n" data-sort="num">Variação${W.canP?`<small class="thw">vs há ${W.w} sem.</small>`:""}</th><th class="n" data-sort="num">Quota de voz</th><th class="n" data-sort="num">Variação${W.canP?`<small class="thw">vs há ${W.w} sem.</small>`:""}</th><th class="n" data-sort="num">Novos no período</th><th class="n" data-sort="num">Investimento est.</th></tr></thead><tbody>${rows}</tbody></table></div>`,"anuncios")}
  use("voz");const vz=Object.fromEntries((D.voz||[]).map(v=>[v.entidade,v])),cel=v=>v==null?`<span class="ghost">Por recolher</span>`:nf(v);
  return secHTML("Quem comunica sobre o tema","Entidades do universo e o que já foi recolhido sobre cada uma.",`<div class="panel tblwrap"><table class="sortable" data-tid="entidades"><thead><tr><th data-sort="txt">Entidade</th><th data-sort="txt">Papel</th><th data-sort="txt">Prioridade</th><th class="n" data-sort="num">Anúncios Meta</th><th class="n" data-sort="num">Notícias</th></tr></thead><tbody>${D.entidades.map(e=>`<tr class="go" data-ent="${e.id}"><td style="font-weight:600">${esc(e.nome)}${e.cliente?' <span class="tag">cliente</span>':""}</td><td>${esc(e.papel)}</td><td>${esc(e.prioridade&&e.prioridade!=="cliente"?e.prioridade:"—")}</td><td class="n">${cel((vz[e.id]||{}).anuncios_meta)}</td><td class="n">${cel((vz[e.id]||{}).noticias)}</td></tr>`).join("")}</tbody></table></div>${BLK("voz").origem==="pendente"?`<p class="t-sm muted" style="margin-top:10px">Estes campos preenchem-se com dados reais (Meta Ad Library, notícias). O Radar nunca inventa números sobre entidades de terceiros.</p>`:""}`,"voz")}

function openEntity(id){
  const e=ebyid(id);if(!e)return;const W=win();let body="";
  if(hasAds()&&!isTema()){
    const a1=act(id,W.z),sv=sov(W.z)[id],sp=sumR(spdt,id,W.a0,W.z),nw=sumR(neu,id,W.a0,W.z),a=Math.max(0,Z-25);
    const pp=PL.map(p=>({p,v:AD[id][p][W.z]})).filter(x=>x.v).sort((x,y)=>y.v-x.v);
    body=`<div class="blk"><div class="t-xs">Anúncios ativos agora</div><div class="big2">${nf(a1)}</div></div>
     <div class="blk"><div class="t-xs">Últimas 26 semanas</div><div class="cv" id="dch" style="height:84px"></div></div>
     <div class="blk"><dl style="display:grid;grid-template-columns:150px 1fr;gap:8px 12px;font-size:13.5px"><dt class="muted">Quota de voz</dt><dd>${nf(sv,1)}%</dd><dt class="muted">Novos no período</dt><dd>${nf(nw)}</dd><dt class="muted">Investimento estimado</dt><dd data-src="investimento">${eur(sp)}</dd><dt class="muted">Plataformas ativas</dt><dd>${pp.length?pp.map(x=>`${x.p} (${x.v})`).join(", "):"—"}</dd></dl></div>
     <div style="display:flex;gap:8px;flex-wrap:wrap">${isCli()?"":`<button class="btn pri" data-go="marca/${id}">Abrir ficha completa</button>`}<button class="btn" data-cr-b="${id}">Ver criativos</button></div>`;
    setTimeout(()=>{const h=$("#dch");if(h)tsChart(h,{series:[{n:e.nome,c:col(e),d:range(a,Z).map(w=>PL.reduce((q,p)=>q+AD[id][p][w],0))}],type:"line",fill:true,mini:true,h:84,xl:i=>wLab(a+i),fmt:v=>nf(v)+" anúncios",aria:"Anúncios ativos"},false)},60)}
  else body=`<div class="blk"><dl style="display:grid;grid-template-columns:130px 1fr;gap:8px 12px;font-size:13.5px"><dt class="muted">Papel</dt><dd>${esc(e.papel)}</dd><dt class="muted">Prioridade</dt><dd>${esc(e.prioridade&&e.prioridade!=="cliente"?e.prioridade:"—")}</dd></dl></div>
     <div class="empty"><svg class="ic"><use href="#i-lock"/></svg><div><b>Por recolher</b><br>Anúncios (Meta Ad Library) e notícias desta entidade ligam-se na recolha. Sem dados recolhidos, o Radar não inventa números sobre entidades de terceiros.</div></div>
     <div style="margin-top:14px"><button class="btn" data-go="agencia/fontes">Ver fontes de dados</button></div>`;
  openDrawer(`${drawerHead(esc(e.nome))}<p class="t-sm muted" style="margin-top:4px">${esc(e.papel)}</p>${body}`)}
document.addEventListener("click",e=>{const r=e.target.closest("[data-ent]");if(r)openEntity(r.dataset.ent)});
document.addEventListener("keydown",e=>{if((e.key==="Enter"||e.key===" ")&&e.target.matches&&e.target.matches("[data-ent][role=button]")){e.preventDefault();openEntity(e.target.dataset.ent)}});
document.addEventListener("click",e=>{const b=e.target.closest("[data-res]");if(b&&b.dataset.res){const p=D.pistas.find(x=>x.id===b.dataset.res);if(p){p.res=true;b.disabled=true;const sp=b.querySelector("span");if(sp)sp.textContent="Aprofundamento pedido";toast("Pedido de aprofundamento enviado à Research (simulação).")}}});

function sinceHTML(){
  if(isCli()||S.bquiet)return"";
  const nov=D.sinais.filter(s=>s.novo),mant=D.sinais.filter(s=>s.material&&!s.novo),res=D.sinais_resolvidos||[];
  const an=alertasNovos().length;
  const parts=[an?`<button class="lnk" data-go="acoes/alertas">${an} ${an===1?"alerta novo":"alertas novos"}</button>`:"",nov.length?`<span class="sn nw"><i></i>${nov.length} ${nov.length===1?"novo":"novos"}</span>`:"",mant.length?`<span class="sn">${mant.length} ${mant.length===1?"mantém-se":"mantêm-se"}</span>`:"",res.length?`<span class="sn">${res.length} ${res.length===1?"deixou":"deixaram"} de estar acima do limiar</span>`:""].filter(Boolean);
  if(!nov.length&&!mant.length&&!res.length&&!an)return"";
  const li=(arr,f)=>arr.length?`<ul>${arr.map(f).join("")}</ul>`:"";
  return`<details class="since"><summary><span class="sl">Desde a semana passada</span>${parts.join("")}<svg class="ic"><use href="#i-down"/></svg></summary>
   <div class="sbody">${nov.length?`<h4>Novos</h4>${li(nov,s=>`<li>${esc(s.titulo)}</li>`)}`:""}${mant.length?`<h4>Mantêm-se acima do limiar</h4>${li(mant,s=>`<li>${esc(s.titulo)}${s.valor_anterior!=null&&s.valor!=null?` <span class="muted">(semana passada: ${sgn(s.valor_anterior,Math.abs(s.valor_anterior)<10?1:0)}${sigUnit(s)})</span>`:""}</li>`)}`:""}${res.length?`<h4>Deixaram de estar acima do limiar</h4>${li(res,s=>`<li>${esc(s.titulo)}</li>`)}`:""}</div></details>`}
function pageVisao(){
  const mp=s=>{const p=s.pista_id&&D.pistas.find(x=>x.id===s.pista_id);return p&&ROLE_PARA[PREFS.role]===p.para?1:0};
  const lista=isCli()?cartoesPub():S.bquiet?[]:[...D.sinais].sort((a,b)=>mp(b)-mp(a)),sg=lista.map(sigCard).join("");
  const body=`${filterBar({platforms:true,brands:true})}
   ${kpisHTML()}
   ${secHTML("O que mudou esta semana",isCli()?"Os pontos que a equipa Arena escolheu destacar.":"O Radar lê os dados e aponta onde olhar. A pista sugere; a equipa decide.",sg?`${sinceHTML()}<div class="sgs">${sg}</div>`:isCli()?emptyHTML("Sem destaques esta semana","A equipa Arena não destacou nenhum ponto nesta edição."):semDados()?emptyHTML("Ainda sem dados ligados","Liga a Meta Ad Library, o Google Trends ou o Google News RSS (ver Fontes de dados). Sem dados, o Radar não inventa números."):emptyHTML("Sem sinais materiais esta semana","O Radar continua a observar. Isto também é informação."))}
   <div class="sec" style="margin-top:34px">${mainChartHTML()}</div>
   ${detailHTML()}`;
  return pheadHTML(`${esc(D.cliente.nome)} · semana de ${D.calendario.rotulo_semana_atual}`,hlnum(esc(headline())),esc(leadText()),{hero:true})+body}

document.addEventListener("click",e=>{const b=e.target.closest("[data-pubsg]");if(!b)return;const id=b.dataset.pubsg,i=D.pub.cartoes.indexOf(id);if(i<0)D.pub.cartoes.push(id);else D.pub.cartoes.splice(i,1);saveState();toast(i<0?"Cartão adicionado ao rascunho da vista do cliente. Só chega ao cliente quando publicares em Relatórios.":"Cartão retirado do rascunho da vista do cliente.");CUR.refresh()});


/* Copiar tabela (TSV, cola direto no Excel) */
document.addEventListener("click",e=>{const b=e.target.closest("[data-copytbl]");if(!b)return;
  const tb=b.closest(".tw,.sec")&&(b.closest(".tw")||b.closest(".sec")).querySelector("table");if(!tb)return;
  const tsv=[...tb.rows].map(r=>[...r.cells].map(c=>c.textContent.replace(/\s+/g," ").trim()).join("\t")).join("\n");
  const ok=()=>toast("Tabela copiada. Cola no Excel ou no PowerPoint."),fb=()=>{const ta=document.createElement("textarea");ta.value=tsv;ta.style.cssText="position:fixed;opacity:0";document.body.appendChild(ta);ta.select();let r=false;try{r=document.execCommand("copy")}catch(_){}ta.remove();r?ok():toast("Não foi possível copiar neste ambiente.")};
  try{navigator.clipboard.writeText(tsv).then(ok,fb)}catch(_){fb()}});
