/* ============================================================
   Ficha de marca (Mercado › marca): tudo o que o Radar sabe sobre uma marca do conjunto competitivo,
   e comparação com outra marca. Só vista Equipa. Genérico: lê as marcas do cliente ativo.
   ============================================================ */
function marcaMetrics(id,W){
  const a1=act(id,W.z),a0=W.canP?act(id,W.z-W.w):null,sv=sov(W.z)[id],sv0=W.canP?sov(W.z-W.w)[id]:null,nw=sumR(neu,id,W.a0,W.z),nwp=W.canP?sumR(neu,id,W.p0,W.p1):null,sp=sumR(spdt,id,W.a0,W.z),spp=W.canP?sumR(spdt,id,W.p0,W.p1):null;
  const L=ADS.filter(c=>c.b===id&&!c.imp&&inCr(c,W.a0,W.z)),top=(arr,f)=>{const m={};arr.forEach(x=>{const k=f(x);if(k!=null&&k!=="")m[k]=(m[k]||0)+1});const r=Object.entries(m).sort((p,q)=>q[1]-p[1])[0];return r?r[0]:null};
  const plat=PL.map(p=>({p,v:AD[id][p][W.z]})).sort((x,y)=>y.v-x.v)[0],keep=L.filter(c=>isOn(c)&&c.days>=28).length;
  const camps=campRows([ebyid(id)],W).filter(r=>r.f);
  return{a1,a0,sv,sv0,nw,nwp,sp,spp,L,keep,camps,fmt:top(L,c=>FM[c.fm]),terr:top(L,c=>c.th>=0?TH[c.th]:null),plat:plat&&plat.v?plat.p:null,rank:[...incl()].sort((p,q)=>press(q.id,W.z)-press(p.id,W.z)).findIndex(e=>e.id===id)+1}}
function marcaKpis(e,m,W){
  const sp=k=>k;
  return[
   {l:"Anúncios ativos agora",v:`<span data-count="${m.a1}">${nf(m.a1)}</span>`,sub:cmpSub(m.a0!=null&&m.a0>=3?pctd(m.a1,m.a0):null,"%",`face a há ${W.w} semanas`),series:range(W.a0,W.z).map(w=>act(e.id,w)),src:"anuncios"},
   {l:"Quota de voz",v:`<span>${nf(m.sv,1)}%</span>`,sub:`${m.rank}.º de ${incl().length}`+(S.cmp==="nenhum"||m.sv0==null?"":` · ${dchip(m.sv-m.sv0,"p.p.")}`),series:range(W.a0,W.z).map(w=>sov(w)[e.id]),src:"anuncios"},
   {l:"Anúncios novos no período",v:`<span data-count="${m.nw}">${nf(m.nw)}</span>`,sub:cmpSub(m.nwp?pctd(m.nw,m.nwp):null,"%","face ao período anterior"),series:range(W.a0,W.z).map(w=>neu(e.id,w)),src:"anuncios"},
   {l:"Investimento estimado",v:`<span>${eur(m.sp)}</span>`,sub:cmpSub(m.spp?pctd(m.sp,m.spp):null,"%","face ao período anterior"),series:range(W.a0,W.z).map(w=>spdt(e.id,w)),src:"investimento"},
   {l:"Criativos longevos",v:`<span data-count="${m.keep}">${nf(m.keep)}</span>`,sub:`<span class="muted">ativos há 4 semanas ou mais</span>`,src:"anuncios"}]}
function pageMarca(sub){
  const e=ebyid(sub);
  if(!hasAds()||isTema()||!e||!e.incluida)return pheadHTML(`${esc(D.cliente.nome)} · Mercado`,"Ficha de marca","")+emptyHTML("Marca não encontrada","Escolhe uma marca do conjunto competitivo em Mercado.")+`<p style="margin-top:14px"><button class="btn" data-go="mercado">Voltar ao Mercado</button></p>`;
  const W=win(),m=marcaMetrics(e.id,W),xl=i=>wLab(W.a0+i);
  if(S.cmpb===e.id||!(ebyid(S.cmpb)&&ebyid(S.cmpb).incluida))S.cmpb=null;
  const o=S.cmpb?ebyid(S.cmpb):null,mo=o?marcaMetrics(o.id,W):null;
  use("anuncios");use("investimento");
  // gráfico principal: anúncios ativos por plataforma, com os lançamentos de campanha desta marca
  const pls=PL.filter(p=>S.pl.has(p)),ser=pls.map(p=>({id:p,n:p,c:rampOf(p),d:range(W.a0,W.z).map(w=>AD[e.id][p][w])}));
  const cp={};ADS.filter(a=>a.b===e.id&&a.camp&&S.pl.has(a.p)).forEach(a=>{const c=cp[a.camp]||(cp[a.camp]={n:a.camp,st:a.st,k:0});c.st=Math.min(c.st,a.st);c.k++});
  const ev=Object.values(cp).filter(c=>c.st>W.a0&&c.st<=W.z).sort((x,y)=>y.k-x.k).slice(0,4).sort((x,y)=>x.st-y.st).filter((c,j,r)=>j===0||c.st-r[j-1].st>=3).slice(0,3).map(c=>({i:c.st-W.a0,t:`Lança «${c.n}»`}));
  later(()=>{tsChart($("#mk1"),{series:ser,type:"area",stack:true,end:true,events:ev,xl,fmt:nf,aria:"Anúncios ativos de "+e.nome+" por plataforma"},true);
   if(o)tsChart($("#mk2"),{series:[{id:e.id,n:e.nome,c:col(e),d:range(W.a0,W.z).map(w=>act(e.id,w))},{id:o.id,n:o.nome,c:col(o),d:range(W.a0,W.z).map(w=>act(o.id,w))}],type:"line",end:true,xl,fmt:nf,aria:`Anúncios ativos: ${e.nome} e ${o.nome}`},true);
   requestAnimationFrame(()=>$$(".single i[data-w]").forEach(i=>i.style.width=i.dataset.w+"%"))});
  // formatos e mensagens
  const t=m.L.length||1,fmx=FM.map((f,i)=>m.L.filter(c=>c.fm===i).length/t*100),thx=TH.map((_,i)=>m.L.filter(c=>c.th===i).length/t*100),Wd={};
  m.L.forEach(c=>c.h.toLowerCase().replace(/[.,%!?«»:]/g,"").split(/\s+/).filter(w=>w.length>=3&&!STOP.has(w)).forEach(w=>Wd[w]=(Wd[w]||0)+1));
  const terms=Object.entries(Wd).sort((p,q)=>q[1]-p[1]).slice(0,6);
  const camps=m.camps,lead=`${e.cliente?"Marca do cliente. ":""}${nf(m.a1)} ${m.a1===1?"anúncio ativo":"anúncios ativos"}, ${nf(m.sv,1)}% da quota de voz (${m.rank}.º de ${incl().length}), ${camps.length} ${camps.length===1?"campanha":"campanhas"} nas últimas ${W.w} semanas${m.plat?`, sobretudo em ${m.plat}`:""}${m.fmt?` e em ${m.fmt.toLowerCase()}`:""}.`;
  const sgs=D.sinais.filter(s=>s.entidade===e.id);
  const longos=[...m.L].sort((p,q)=>q.days-p.days).slice(0,6);
  // frente a frente
  const diff=(a,b,d=0,unit="")=>{const x=a-b;return`<span class="dchip ${x>0.04?"up":x<-0.04?"dn":""}">${x>0.04?"▲":x<-0.04?"▼":"•"} ${sgn(Math.round(x*Math.pow(10,d))/Math.pow(10,d),d)}${unit}</span>`};
  const ff=o?`<div class="card" style="margin-top:16px"><header><div><h2 class="t-h2">${esc(e.nome)} frente a ${esc(o.nome)}</h2><p>${esc(e.nome)} tem ${m.a1>=mo.a1?"mais":"menos"} ${nf(Math.abs(m.a1-mo.a1))} anúncios ativos e ${nf(Math.abs(m.sv-mo.sv),1)} p.p. ${m.sv>=mo.sv?"a mais":"a menos"} de quota de voz.</p></div></header>
    ${legendHTML([{n:e.nome,c:col(e)},{n:o.nome,c:col(o)}],true)}<div class="cv" id="mk2"></div>
    <div class="tblwrap" style="margin-top:12px"><table><thead><tr><th></th><th class="n">${dot(e)}${esc(e.nome)}</th><th class="n">${dot(o)}${esc(o.nome)}</th><th class="n">Diferença</th></tr></thead><tbody>
    <tr><td>Anúncios ativos agora</td><td class="n">${nf(m.a1)}</td><td class="n">${nf(mo.a1)}</td><td class="n">${diff(m.a1,mo.a1)}</td></tr>
    <tr><td>Quota de voz</td><td class="n">${nf(m.sv,1)}%</td><td class="n">${nf(mo.sv,1)}%</td><td class="n">${diff(m.sv,mo.sv,1," p.p.")}</td></tr>
    <tr><td>Anúncios novos no período</td><td class="n">${nf(m.nw)}</td><td class="n">${nf(mo.nw)}</td><td class="n">${diff(m.nw,mo.nw)}</td></tr>
    <tr><td>Investimento estimado</td><td class="n">${eur(m.sp)}</td><td class="n">${eur(mo.sp)}</td><td class="n"><span class="muted">—</span></td></tr>
    <tr><td>Campanhas no período</td><td class="n">${m.camps.length}</td><td class="n">${mo.camps.length}</td><td class="n">${diff(m.camps.length,mo.camps.length)}</td></tr>
    <tr><td>Plataforma principal</td><td class="n">${esc(m.plat||"—")}</td><td class="n">${esc(mo.plat||"—")}</td><td class="n"></td></tr>
    <tr><td>Formato principal</td><td class="n">${esc(m.fmt||"—")}</td><td class="n">${esc(mo.fmt||"—")}</td><td class="n"></td></tr>
    <tr><td>Mensagem principal</td><td class="n">${esc(m.terr||"—")}</td><td class="n">${esc(mo.terr||"—")}</td><td class="n"></td></tr>
    <tr><td>Criativos ativos há 4 semanas ou mais</td><td class="n">${m.keep}</td><td class="n">${mo.keep}</td><td class="n">${diff(m.keep,mo.keep)}</td></tr></tbody></table></div>${foot("anuncios")}</div>`:"";
  const body=`${filterBar({platforms:true})}
   <div class="cmpbar"><label for="cmpb" class="t-sm muted">Comparar com</label><select id="cmpb"><option value="">Nenhuma marca</option>${incl().filter(x=>x.id!==e.id).map(x=>`<option value="${x.id}" ${S.cmpb===x.id?"selected":""}>${esc(x.nome)}</option>`).join("")}</select><span style="flex:1"></span><button class="btn sm" data-brief-marca="${e.id}" data-txt="${esc(lead)}"><svg class="ic"><use href="#i-mail"/></svg>Adicionar ao briefing</button></div>
   <div class="kpis k5 five">${marcaKpis(e,m,W).map(kpiHTML).join("")}</div>
   ${ff}
   <div class="sec" style="margin-top:28px">${cardHTML("Anúncios ativos por plataforma",`Só os anúncios de ${esc(e.nome)}. ${ev.length?"As linhas verticais marcam o arranque das campanhas.":""}`,`${legendHTML(ser)}<div class="cv" id="mk1"></div>${tableHTML({series:ser,xl,fmt:nf})}`,"anuncios")}</div>
   ${secHTML("Campanhas",`Quando ${esc(e.nome)} esteve no ar, em que plataformas e com que mensagem.`,camps.length?`<div class="card">${ganttHTML(campRows([e],W),W,{groups:false})}</div>`:emptyHTML("Sem campanhas neste período","Alarga o período ou as plataformas."),"anuncios")}
   <div class="grid2 sec">${cardHTML("Formatos",`O que ${esc(e.nome)} põe no ar, no período.`,m.L.length?`${legendHTML(FM.map((f,i)=>({n:f,c:RAMP[i%4]})))}<div class="sbar" style="height:30px">${fmx.map((v,i)=>v<=0?"":`<span style="flex:${v} 1 0;background:${RAMP[i%4]};${i===0?"color:#0F2623":""};line-height:30px" data-tip="<b>${esc(FM[i])}</b>: ${nf(v)}% dos criativos">${v>=9?nf(v)+"%":""}</span>`).join("")}</div><p class="t-xs" style="margin-top:8px">${m.L.length} criativos observados.</p>`:emptyHTML("Sem criativos","Nenhum criativo no período."),"anuncios")}
    ${cardHTML("Mensagens",`Territórios e palavras que ${esc(e.nome)} mais usa.`,m.L.length?`<div class="hb">${TH.map((x,i)=>thx[i]>0?`<div class="row"><span class="nm" style="font-weight:500">${esc(x)}</span><div class="single"><i data-w="${thx[i]}" style="background:var(--brand)"></i></div><span class="num2">${nf(thx[i])}%</span></div>`:"").join("")}</div>${terms.length?`<p class="t-xs" style="margin-top:12px">Palavras mais repetidas: ${terms.map(([w,n])=>`<b>${esc(w)}</b> (${n})`).join(", ")}.</p>`:""}`:emptyHTML("Sem criativos","Nenhum criativo no período."),"anuncios")}</div>
   ${secHTML("Criativos mais longevos",`Os que ficam mais tempo no ar costumam ser os que a marca considera vencedores. <a href="#" data-cr-b="${e.id}" style="color:var(--link);font-weight:600">Ver todos</a>.`,longos.length?`<div class="gal">${longos.map(crCard).join("")}</div>`:emptyHTML("Sem criativos","Nenhum criativo no período."),"anuncios")}
   ${sgs.length?secHTML("O que o Radar apontou sobre esta marca","Sinais desta semana que envolvem a marca.",`<div class="sgs">${sgs.map((s,i)=>sigCard(s,"m"+i)).join("")}</div>`):""}`;
  return pheadHTML(`<button class="lnk" data-go="mercado">← Mercado</button> · ${esc(D.cliente.nome)}`,`${esc(e.nome)}${e.cliente?' <span class="tag" style="vertical-align:middle;margin-left:6px">cliente</span>':""}`,esc(lead),{sm:true})+body}
document.addEventListener("change",e=>{if(e.target.id==="cmpb"){S.cmpb=e.target.value||null;CUR.refresh()}});
