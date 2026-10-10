/* ============================================================
   Página «Procura e notícias»: interesse de pesquisa, sazonalidade e conversa na imprensa.
   LIGAÇÃO[google-trends] LIGAÇÃO[news-rss]: os blocos «procura» e «noticias» vêm do dataset do cliente.
   ============================================================ */
const procC=(s,i)=>isTema()?topC(i):CAT[s.cor%5];   // marcas: cor da marca; temas: família de temas
function procSeries(){const W=win();return D.procura.series.map((s,i)=>({id:s.id,n:s.nome,c:procC(s,i),all:s.valores,d:s.valores.slice(W.a0,Z+1)}))}
function onSet(){const o=S.chart.on||(S.chart.on=Object.fromEntries(D.procura.series.map(s=>[s.id,true])));return o}
let _pc=null;
function readoutHTML(){const W=win(),i=S.pw??Z,on=onSet();
  const rows=procSeries().map(s=>{const v=s.all[i],base=i>=8?s.all.slice(i-8,i).filter(x=>x!=null):[],dl=v!=null&&base.length>=4&&mean(base)>2?Math.round((v/mean(base)-1)*100):null;
   return`<tr style="${on[s.id]?"":"opacity:.4"}"><td><i class="dot" style="background:${s.c}"></i>${esc(s.n)}</td><td class="n" style="font-weight:600">${v==null?"—":nf(v)}</td><td class="n" style="color:var(--text-2);padding-left:14px;white-space:nowrap">${dl===null?"—":sgn(dl)+"%"}</td></tr>`}).join("");
  return`<div class="t-xs" style="margin-bottom:4px">Semana de ${wLabFull(i)}</div><table>${rows}</table><p class="t-xs" style="margin-top:10px">Variação face à média das 8 semanas anteriores.</p>`}
function setPW(i){S.pw=i;const r=$("#rdo");if(r)r.innerHTML=readoutHTML();const w=$("#pwk");if(w)w.value=i;const l=$("#pwlab");if(l)l.textContent=wLabFull(i);if(_pc)_pc.setMarker(i-win().a0)}
function stopPlay(){if(S.chart.play){clearInterval(S.chart.play);S.chart.play=null}const b=$("#pplay");if(b){$("span",b).textContent="Reproduzir";$("use",b).setAttribute("href","#i-play")}}

function procCard(){
  const W=win(),on=onSet(),a0=W.a0,xl=i=>wLab(a0+i),all=procSeries(),vis=all.filter(s=>on[s.id]);
  if(S.pw==null||S.pw<a0)S.pw=Z;
  const ev=(D.eventos||[]).map(e=>({i:e.semana-a0,t:e.titulo}));
  later(()=>{_pc=tsChart($("#pc"),{series:vis.map(s=>({id:s.id,n:s.n,c:s.c,d:s.d})),type:"line",ymax:100,events:ev,xl,fmt:nf,marker:S.pw-a0,aria:"Interesse de pesquisa por tema",onmove:i=>setPW(a0+i)},true);
   $("#pwk").addEventListener("input",e=>{stopPlay();setPW(+e.target.value)});
   $("#pplay").addEventListener("click",()=>{if(S.chart.play){stopPlay();return}let i=S.pw>=Z?a0:S.pw;setPW(i);$("#pplay span").textContent="Pausar";$("#pplay use").setAttribute("href","#i-pause");S.chart.play=setInterval(()=>{i++;if(i>Z){stopPlay();return}setPW(i)},RM?40:130)});
   $("#plg").addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;const k=b.dataset.id;if(Object.values(on).filter(Boolean).length===1&&on[k]){toast("Mantém pelo menos uma série.");return}on[k]=!on[k];CUR.refresh()})});
  const prev=W.canP?procSeries().map(s=>({s,m0:mean(s.all.slice(W.p0,W.p1+1).filter(x=>x!=null)),m1:mean(s.d.filter(x=>x!=null))})):null;
  const resumo=prev?`<div class="panel tblwrap" style="margin-top:16px"><table class="sortable" data-tid="procura-res"><thead><tr><th data-sort="txt">Série</th><th class="n" data-sort="num">Média do período</th><th class="n" data-sort="num">Período anterior</th><th class="n" data-sort="num">Variação</th></tr></thead><tbody>${prev.map(r=>`<tr><td>${dotc(r.s.c)}${esc(r.s.n)}</td><td class="n">${nf(r.m1,1)}</td><td class="n">${nf(r.m0,1)}</td><td class="n">${r.m0>2?dchip(pctd(r.m1,r.m0)):"—"}</td></tr>`).join("")}</tbody></table></div>`:"";
  return cardHTML(`${esc(D.parametros.procura_rotulo||"Interesse de pesquisa")}`,"Interesse de pesquisa em Portugal, de 0 a 100. Mexe na semana para ver o valor de cada série.",
   `<div class="lg" id="plg">${all.map(s=>`<button data-id="${s.id}" aria-pressed="${on[s.id]}"><i style="background:${s.c}"></i>${esc(s.n)}</button>`).join("")}</div>
    <div class="chartrow"><div class="cv" id="pc"></div><div class="read" id="rdo">${readoutHTML()}</div></div>
    <div class="slider no-print"><button class="btn" id="pplay" aria-label="Reproduzir"><svg class="ic"><use href="#i-play"/></svg><span>Reproduzir</span></button><input type="range" id="pwk" min="${a0}" max="${Z}" value="${S.pw}" aria-label="Semana"><output id="pwlab">${wLabFull(S.pw)}</output></div>${resumo}`,"procura")}

function sazCard(){if(!D.sazonalidade)return"";const v=D.sazonalidade.indice_mensal;
  later(()=>tsChart($("#sz"),{series:[{n:"Índice de procura",c:"var(--text-2)",d:v,cf:i=>v[i]>=105?"var(--brand-ink)":"color-mix(in srgb,var(--text-2) 55%,var(--surface))"}],type:"bars",ymax:140,xl:i=>MES[i],fmt:x=>nf(x)+" (média = 100)",h:230,aria:"Sazonalidade esperada da procura por mês"},true));
  return cardHTML("Quando a procura costuma subir","Índice mensal de pesquisa, com a média do ano a 100. Azul: meses acima de 105.",`<div class="cv" id="sz"></div>`,D.sazonalidade.bloco)}

function newsCard(){if(!D.noticias)return"";const W=win(),xl=i=>wLab(W.a0+i),ser=D.noticias.series.map((s,i)=>({id:s.id,n:s.nome,c:topC(i),d:s.valores.slice(W.a0,Z+1)}));
  const sem=ser.every(s=>s.d.every(x=>x==null));
  if(sem)return secHTML("Conversa nas notícias","Artigos por semana, por tema.",emptyHTML("Sem notícias recolhidas neste período","Corre scripts/collect_news.py semanalmente: o histórico acumula-se a partir da primeira recolha."),D.noticias.bloco);
  later(()=>tsChart($("#nc"),{series:ser,type:"bars",stack:true,xl,fmt:v=>nf(v)+" artigos",h:230,aria:"Artigos por semana e tema"},true));
  return cardHTML("Conversa nas notícias","Artigos por semana, por tema. Os picos mostram quando um tema ganha espaço na imprensa.",`${legendHTML(ser)}<div class="cv" id="nc"></div>${tableHTML({series:ser,xl,fmt:nf})}`,D.noticias.bloco)}

function pageProcura(){
  if(!D.procura&&!D.noticias)return pheadHTML(`${esc(D.cliente.nome)} · Procura e notícias`,"Procura e notícias","")+emptyHTML("Sem dados de procura nem de notícias","Liga o Google Trends e o Google News RSS (ver Fontes de dados).");
  const body=`${filterBar()}${D.procura?`<div class="sec" style="margin-top:22px">${procCard()}</div>`:""}${D.sazonalidade||D.noticias?`<div class="${D.sazonalidade&&D.noticias?"grid2":""} sec">${sazCard()}${newsCard()}</div>`:""}`;
  return pheadHTML(`${esc(D.cliente.nome)} · Procura e notícias`,"O que se procura e o que se diz","Interesse de pesquisa e conversa na imprensa, no período escolhido. Cada número diz de onde vem.",{sm:true})+body}
