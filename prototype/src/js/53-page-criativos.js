/* ============================================================
   Página «Criativos»: galeria de anúncios, longevidade e detalhe.
   LIGAÇÃO[meta-ad-library] LIGAÇÃO[google-ads-transparency] LIGAÇÃO[tiktok-ad-library]:
   cada anúncio do dataset traz a ligação (url) ao original; a gaveta passa a abri-lo quando existir.
   ============================================================ */
function pageCriativos(){
  if(!hasAds())return pheadHTML(`${esc(D.cliente.nome)} · Criativos`,"Criativos","")+emptyHTML("Sem anúncios ligados","Liga a Meta Ad Library ou importa um CSV em Fontes de dados.");
  const W=win(),a0=W.a0;
  let list=ADS.filter(c=>c.imp?S.pl.has(c.p):inCr(c,a0,W.z)).filter(c=>(!S.br||c.b===S.br)&&(!S.fm.size||S.fm.has(FM[c.fm]))&&(!S.only||isOn(c)));
  list.sort((p,q)=>S.sort==="rec"?(q.ds-p.ds||q.i-p.i):(q.days-p.days));
  const shown=list.slice(0,S.more),bs=incl(),b=S.br?ebyid(S.br):null;
  const lon=bs.map(e=>{const fin=ADS.filter(c=>c.b===e.id&&!isOn(c)&&S.pl.has(c.p)&&c.st>=a0-6),av=fin.length?mean(fin.map(c=>c.days)):0,keep=ADS.filter(c=>c.b===e.id&&isOn(c)&&S.pl.has(c.p)&&c.days>=28).length;return{e,av,keep}});
  const mxl=Math.max(...lon.map(x=>x.av),1);
  later(()=>requestAnimationFrame(()=>$$(".single i[data-w]").forEach(i=>i.style.width=i.dataset.w+"%")));
  use("anuncios");
  const body=`${filterBar({platforms:true,brands:true,compare:false})}
   <div class="gtool" style="margin-top:16px"><div class="seg" id="gsort"><button data-sort="rec" aria-pressed="${S.sort==="rec"}">Mais recentes</button><button data-sort="long" aria-pressed="${S.sort==="long"}">Mais longevos</button></div>
    ${FM.filter(f=>f!=="Não indicado").map(f=>`<button class="tgl" data-gfm="${esc(f)}" aria-pressed="${S.fm.has(f)}">${esc(f)}</button>`).join("")}
    <button class="tgl" data-gon="1" aria-pressed="${S.only}">Só ativos</button>
    ${b?`<button class="tgl" data-clrb="1" aria-pressed="true"><i style="background:${col(b)}"></i>${esc(b.nome)} ✕</button>`:""}
    <span style="flex:1"></span><span class="t-sm muted">${nf(list.length)} criativos</span></div>
   ${shown.length?`<div class="gal">${shown.map(c=>{const e=ebyid(c.b),nm=e?e.nome:(c.bn||c.b);return`<button class="cr" data-cr="${esc(c.id)}" aria-label="Abrir criativo de ${esc(nm)}" data-src="anuncios">${thumb(c)}<div class="cm"><b><i style="background:${e?col(e):"#6b7a77"}"></i>${esc(nm)}</b><div class="r2"><span class="tag">${c.p}</span><span class="tag">${esc(FM[c.fm])}</span>${c.th>=0?`<span class="tag">${esc(TH[c.th])}</span>`:""}</div><span>${isOn(c)?"Ativo":"Terminado"} · desde ${dateOf(c)} · ${c.days} dias</span></div></button>`}).join("")}</div>
   ${list.length>shown.length?`<p style="margin-top:16px"><button class="btn" data-more="1">Ver mais ${Math.min(12,list.length-shown.length)}</button></p>`:""}`:`<div class="lockcard">Nenhum criativo com estes filtros. Alarga o período ou limpa os formatos.</div>`}
   ${secHTML("Quanto tempo vivem os criativos","Criativos que ficam muito tempo no ar costumam funcionar. A duração média dos terminados é uma pista do que cada marca considera vencedor.",`<div class="card"><div class="hb">${lon.map(x=>`<div class="row"><span class="nm"><i style="background:${col(x.e)}"></i>${esc(x.e.nome)}</span><div class="single"><i data-w="${x.av/mxl*100}" style="background:${col(x.e)}" data-tip="<b>${esc(x.e.nome)}</b>: duração média de ${nf(x.av)} dias nos criativos terminados; ${x.keep} ativos há 4 semanas ou mais."></i></div><span class="num2">${nf(x.av)} d</span></div>`).join("")}</div></div>`,"anuncios")}`;
  return pheadHTML(`${esc(D.cliente.nome)} · Criativos`,"O que a concorrência põe no ar","Anúncios do conjunto competitivo, filtrados por período, plataforma, marca e formato. Abre um criativo para ver o detalhe.",{sm:true})+body}

function openCreative(id){
  const c=ADS.find(x=>String(x.id)===String(id));if(!c)return;const e=ebyid(c.b),nm=e?e.nome:(c.bn||c.b),b=BLK("anuncios");
  const orig=c.imp?`${OL[c.o]||c.o}${c.f?" · "+c.f:""}${c.m?" · "+c.m:""}`:`${OL[b.origem]}${b.fonte?" · "+b.fonte:""}${b.data_recolha&&b.origem==="real"?" · recolha "+fmtDt(b.data_recolha):""}`;
  openDrawer(`${drawerHead(esc(nm)+", criativo")}
   <svg class="th" viewBox="0 0 320 200">${thumb(c,true).replace(/^<svg[^>]*>/,"").replace(/<\/svg>$/,"")}</svg>
   <p style="font-size:15px;font-weight:600;letter-spacing:-.01em">${esc(c.h)}</p>
   <dl style="margin-top:14px"><dt>Plataforma</dt><dd>${c.p}</dd><dt>Formato</dt><dd>${esc(FM[c.fm])}</dd>${c.th>=0?`<dt>Mensagem</dt><dd>${esc(TH[c.th])}</dd>`:""}${c.camp?`<dt>Campanha</dt><dd>${esc(c.camp)}</dd>`:""}<dt>Início</dt><dd>${dateOf(c)} ${new Date(c.ds).getUTCFullYear()}</dd><dt>Dias no ar</dt><dd>${c.days} (${isOn(c)?"ativo":"terminado"})</dd>${c.reach?`<dt>Alcance UE</dt><dd>${nf(c.reach)}</dd>`:""}<dt>Origem</dt><dd>${esc(orig)}</dd></dl>
   <p class="t-sm muted" style="margin-top:14px">${c.url?"":"Ilustração gerada a partir do texto do anúncio. "}Na versão ligada, mostra o criativo recolhido da Meta Ad Library, do Google Ads Transparency Center ou do TikTok, com a ligação ao original.</p>
   <div style="display:flex;gap:8px;margin-top:16px;flex-wrap:wrap">${c.url?`<a class="btn" href="${esc(c.url)}" target="_blank" rel="noopener noreferrer">Abrir na biblioteca</a>`:`<button class="btn" disabled>Abrir na biblioteca</button>`}<button class="btn" data-saveref="1">Guardar em referências</button></div>`)}

document.addEventListener("click",e=>{
  const v=$("#page");if(!v)return;let t;
  if(t=e.target.closest("[data-cr-b]")){S.br=t.dataset.crB;S.fm.clear();S.more=12;go("criativos");return}
  if(t=e.target.closest("#gsort [data-sort]")){S.sort=t.dataset.sort;CUR.refresh();return}
  if(t=e.target.closest("[data-gfm]")){const f=t.dataset.gfm;S.fm.has(f)?S.fm.delete(f):S.fm.add(f);S.more=12;CUR.refresh();return}
  if(t=e.target.closest("[data-gon]")){S.only=!S.only;S.more=12;CUR.refresh();return}
  if(t=e.target.closest("[data-clrb]")){S.br=null;CUR.refresh();return}
  if(t=e.target.closest("[data-more]")){S.more+=12;CUR.refresh();return}
  if(t=e.target.closest("[data-cr]")){openCreative(t.dataset.cr);return}
  if(e.target.closest("[data-saveref]"))toast("Guardado em referências (simulação).")});
