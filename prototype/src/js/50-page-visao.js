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
function sigCard(s,i){
  const e=s.entidade?ebyid(s.entidade):null,p=s.pista_id?D.pistas.find(x=>x.id===s.pista_id):null,ch=sigChart(s);
  if(ch)later(()=>tsChart($("#sgc"+i),{...ch,type:"line",fill:true,mini:true,h:52},false));
  const lim=s.limiar!=null&&s.valor!=null?`<span class="lim">Valor ${nf(Math.abs(s.valor),Math.abs(s.valor)<10?1:0)}${s.categoria==="Quota de voz"?" p.p.":s.categoria==="Lançamento"?" criativos":"%"} · limiar ${nf(Math.abs(s.limiar),Math.abs(s.limiar)<10?1:0)}</span>`:"";
  return`<article class="sg ${s.material?"":"obs"}" data-src="${use(s.bloco)}">
   <div class="top2"><span class="who">${e?`<i style="background:${col(e)}"></i>${esc(e.nome)}`:esc(s.categoria)}</span><span class="tag">${s.material?"Acima do limiar":"Em observação"}</span></div>
   <h3>${esc(s.titulo)}</h3>${ch?`<div class="cv" id="sgc${i}" style="height:52px"></div>`:""}
   <p class="rd">${esc(s.leitura)} ${s.hipotese?`<span class="tag">Hipótese</span>`:""}</p>${lim}
   ${p?`<div class="pk2"><svg class="ic" style="width:16px;height:16px;margin-top:2px;color:var(--brand-ink);flex:none"><use href="#i-spark"/></svg><span><b>Pista:</b> ${esc(p.acao)}</span><span class="ps">${esc(p.para)} · ${STL[p.s]}</span></div>`:""}
   <div class="acts">${p?`<button class="btn" data-go="acoes/pistas#${p.id}">Ver pista</button>`:""}<button class="btn ${p?"ghost":""}" ${s.entidade&&s.categoria==="Lançamento"?`data-cr-b="${s.entidade}"`:`data-go="${sigGo(s)}"`}>${s.categoria==="Lançamento"?"Ver criativos":"Ver detalhe"}</button>${p?`<button class="btn ghost" data-res="${p.id}" ${p.res?"disabled":""}><svg class="ic"><use href="#i-flask"/></svg>${p.res?"Aprofundamento pedido":"Pedir aprofundamento à Research"}</button>`:""}</div>
  </article>`}

function mainChartHTML(){
  const W=win();
  if(hasAds()){
    const pls=PL.filter(p=>S.pl.has(p)),bs=incl(),xl=i=>wLab(W.a0+i);
    const ser=pls.map(p=>({id:p,n:p,c:rampOf(p),d:range(W.a0,W.z).map(w=>bs.reduce((s,e)=>s+AD[e.id][p][w],0))}));
    const last=ser.map(s=>s.d[s.d.length-1]),tot=sum(last)||1,top=ser.map((s,i)=>({n:s.n,v:last[i]})).sort((a,b)=>b.v-a.v)[0];
    later(()=>tsChart($("#mc"),{series:ser,type:"area",stack:true,end:true,xl,fmt:nf,aria:"Anúncios ativos por plataforma"},true));
    return cardHTML("Anúncios ativos por plataforma",`Soma das marcas do conjunto. ${top?`<b>${top.n}</b> concentra ${nf(top.v/tot*100)}% dos anúncios ativos esta semana.`:""}`,`${legendHTML(ser)}<div class="cv" id="mc"></div>${tableHTML({series:ser,xl,fmt:nf})}`,"anuncios")}
  if(D.procura){
    const pr=D.procura.principais||D.procura.series.map(s=>s.id),ser=D.procura.series.filter(s=>pr.includes(s.id)),a0=W.a0,xl=i=>wLab(a0+i);
    const S2=ser.map(s=>({id:s.id,n:s.nome,c:CAT[s.cor%5],d:s.valores.slice(a0,Z+1)})),ev=(D.eventos||[]).map(e=>({i:e.semana-a0,t:e.titulo}));
    later(()=>tsChart($("#mc"),{series:S2,type:"line",ymax:100,events:ev,xl,fmt:v=>nf(v),aria:"Interesse de pesquisa por tema"},true));
    return cardHTML("Procura por tema",`Interesse de pesquisa em Portugal, de 0 a 100. <a href="#" data-go="procura" style="color:var(--brand-ink);font-weight:600">Abrir Procura e notícias</a>.`,`${legendHTML(S2,true)}<div class="cv" id="mc"></div>${tableHTML({series:S2,xl,fmt:nf})}`,"procura")}
  return""}

function detailHTML(){
  const W=win();
  if(hasAds()&&!isTema()){
    const bs=incl(),sv=sov(W.z),svp=W.canP?sov(W.z-W.w):null,sp=bs.map(e=>sumR(spdt,e.id,W.a0,W.z));
    const rows=[...bs].sort((a,b)=>press(b.id,W.z)-press(a.id,W.z)).map(e=>{const a1=act(e.id,W.z),a2=W.canP?act(e.id,W.z-W.w):null,nw=sumR(neu,e.id,W.a0,W.z),i=bs.indexOf(e);
      return`<tr class="go" data-ent="${e.id}"><td style="font-weight:600">${dot(e)}${esc(e.nome)}${e.cliente?' <span class="tag">cliente</span>':""}</td><td class="n">${nf(a1)}</td><td class="n">${a2!=null&&a2>=3?dchip(pctd(a1,a2)):`<span class="muted">—</span>`}</td><td class="n">${nf(sv[e.id],1)}%</td><td class="n">${svp?dchip(sv[e.id]-svp[e.id],"p.p."):`<span class="muted">—</span>`}</td><td class="n">${nf(nw)}</td><td class="n">${eur(sp[i])}</td></tr>`}).join("");
    use("investimento");
    return secHTML("Marcas em comparação","Clica numa marca para ver o detalhe.",`<div class="panel tblwrap"><table><thead><tr><th>Marca</th><th class="n">Anúncios ativos</th><th class="n">Variação</th><th class="n">Quota de voz</th><th class="n">Variação</th><th class="n">Novos no período</th><th class="n">Investimento est.</th></tr></thead><tbody>${rows}</tbody></table></div>`,"anuncios")}
  use("voz");
  return secHTML("Quem comunica sobre o tema","Entidades do universo e o que já foi recolhido sobre cada uma.",`<div class="panel tblwrap"><table><thead><tr><th>Entidade</th><th>Papel</th><th>Prioridade</th><th>Anúncios Meta</th><th>Notícias</th></tr></thead><tbody>${D.entidades.map(e=>`<tr class="go" data-ent="${e.id}"><td style="font-weight:600">${esc(e.nome)}${e.cliente?' <span class="tag">cliente</span>':""}</td><td>${esc(e.papel)}</td><td>${esc(e.prioridade&&e.prioridade!=="cliente"?e.prioridade:"—")}</td><td><span class="ghost">Por recolher</span></td><td><span class="ghost">Por recolher</span></td></tr>`).join("")}</tbody></table></div><p class="t-sm muted" style="margin-top:10px">Estes campos preenchem-se com dados reais (Meta Ad Library, notícias). O Radar nunca inventa números sobre entidades de terceiros.</p>`,"voz")}

function openEntity(id){
  const e=ebyid(id);if(!e)return;const W=win();let body="";
  if(hasAds()&&!isTema()){
    const a1=act(id,W.z),sv=sov(W.z)[id],sp=sumR(spdt,id,W.a0,W.z),nw=sumR(neu,id,W.a0,W.z),a=Math.max(0,Z-25);
    const pp=PL.map(p=>({p,v:AD[id][p][W.z]})).filter(x=>x.v).sort((x,y)=>y.v-x.v);
    body=`<div class="blk"><div class="t-xs">Anúncios ativos agora</div><div class="big2">${nf(a1)}</div></div>
     <div class="blk"><div class="t-xs">Últimas 26 semanas</div><div class="cv" id="dch" style="height:84px"></div></div>
     <div class="blk"><dl style="display:grid;grid-template-columns:150px 1fr;gap:8px 12px;font-size:13.5px"><dt class="muted">Quota de voz</dt><dd>${nf(sv,1)}%</dd><dt class="muted">Novos no período</dt><dd>${nf(nw)}</dd><dt class="muted">Investimento estimado</dt><dd data-src="investimento">${eur(sp)}</dd><dt class="muted">Plataformas ativas</dt><dd>${pp.length?pp.map(x=>`${x.p} (${x.v})`).join(", "):"—"}</dd></dl></div>
     <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn" data-cr-b="${id}">Ver criativos</button></div>`;
    setTimeout(()=>{const h=$("#dch");if(h)tsChart(h,{series:[{n:e.nome,c:col(e),d:range(a,Z).map(w=>PL.reduce((q,p)=>q+AD[id][p][w],0))}],type:"line",fill:true,mini:true,h:84,xl:i=>wLab(a+i),fmt:v=>nf(v)+" anúncios",aria:"Anúncios ativos"},false)},60)}
  else body=`<div class="blk"><dl style="display:grid;grid-template-columns:130px 1fr;gap:8px 12px;font-size:13.5px"><dt class="muted">Papel</dt><dd>${esc(e.papel)}</dd><dt class="muted">Prioridade</dt><dd>${esc(e.prioridade&&e.prioridade!=="cliente"?e.prioridade:"—")}</dd></dl></div>
     <div class="empty"><svg class="ic"><use href="#i-lock"/></svg><div><b>Por recolher</b><br>Anúncios (Meta Ad Library) e notícias desta entidade ligam-se na recolha. Sem dados recolhidos, o Radar não inventa números sobre entidades de terceiros.</div></div>
     <div style="margin-top:14px"><button class="btn" data-go="agencia/fontes">Ver fontes de dados</button></div>`;
  openDrawer(`${drawerHead(esc(e.nome))}<p class="t-sm muted" style="margin-top:4px">${esc(e.papel)}</p>${body}`)}
document.addEventListener("click",e=>{const r=e.target.closest("tr[data-ent]");if(r)openEntity(r.dataset.ent)});
document.addEventListener("click",e=>{const b=e.target.closest("[data-res]");if(b&&b.dataset.res){const p=D.pistas.find(x=>x.id===b.dataset.res);if(p){p.res=true;b.disabled=true;b.lastChild.textContent="Aprofundamento pedido";toast("Pedido de aprofundamento enviado à Research (simulação).")}}});

function pageVisao(){
  const sg=D.sinais.map(sigCard).join("");
  const body=`${filterBar({platforms:true,brands:true})}
   ${kpisHTML()}
   ${secHTML("O que mudou esta semana","O Radar lê os dados e aponta onde olhar. A pista sugere; a equipa decide.",sg?`<div class="sgs">${sg}</div>`:emptyHTML("Sem sinais materiais esta semana","O Radar continua a observar. Isto também é informação."))}
   <div class="sec" style="margin-top:34px">${mainChartHTML()}</div>
   ${detailHTML()}`;
  return pheadHTML(`${esc(D.cliente.nome)} · semana de ${D.calendario.rotulo_semana_atual}`,esc(headline()),leadText())+body}
