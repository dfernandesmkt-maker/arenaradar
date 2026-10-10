/* ============================================================
   Métricas: janela de análise (período e comparação) e catálogo de KPIs.
   Genérico: as páginas pedem métricas pelo nome (ver «kpis» na configuração do cliente/vertical).

   LIGAÇÃO[marktest-adcheck]: o investimento é calculado aqui como anúncios ativos × valor médio assumido por
   plataforma × fator da marca (config/agencia.yaml). Com uma fonte licenciada, esta função passa a ler os valores
   reais do dataset e deixa de estimar.
   ============================================================ */
function win(){const w=Math.min(S.w,NW),a0=Z-w+1,canP=S.cmp==="anterior"&&a0-w>=0;return{w,a0,z:Z,p0:canP?a0-w:null,p1:canP?a0-1:null,canP}}

/* ---------- Anúncios (respeitam os filtros de plataforma e as marcas incluídas) ---------- */
const act=(b,w)=>PL.reduce((s,p)=>s+(S.pl.has(p)?AD[b][p][w]:0),0);
const neu=(b,w)=>PL.reduce((s,p)=>s+(S.pl.has(p)?NA[b][p][w]:0),0);
const press=(b,w)=>PL.reduce((s,p)=>s+(S.pl.has(p)?AD[b][p][w]*PW[p]:0),0);
const spd=(b,w,p)=>AD[b][p][w]*PC[p]*(ebyid(b).fator||1);
const spdt=(b,w)=>PL.reduce((s,p)=>s+(S.pl.has(p)?spd(b,w,p):0),0);
const sumR=(fn,b,a,z)=>range(a,z).reduce((s,w)=>s+fn(b,w),0);
const totalAct=w=>incl().reduce((s,e)=>s+act(e.id,w),0);
function sov(i){const inc=incl(),tot=inc.reduce((s,e)=>s+press(e.id,i),0)||1;return Object.fromEntries(D.entidades.map(e=>[e.id,e.incluida?press(e.id,i)/tot*100:0]))}
const inCr=(c,a0,z)=>c.en>=a0&&c.st<=z&&S.pl.has(c.p)&&(ebyid(c.b)?ebyid(c.b).incluida:true);
const isOn=c=>!c.fim;
const dateOf=c=>{const d=new Date(c.ds);return d.getUTCDate()+" "+MES[d.getUTCMonth()]};

/* ---------- Séries da procura e das notícias ---------- */
const serieProcura=id=>D.procura?D.procura.series.find(s=>s.id===id):null;
function varProcura(s){const v=s.valores,base=v.slice(Z-8,Z).filter(x=>x!=null),last=v[Z];if(last==null||base.length<4||mean(base)<=2)return null;return{last,pct:Math.round((last/mean(base)-1)*100)}}

/* ---------- Catálogo de KPIs ---------- */
const cmpSub=(d,unit,txt)=>S.cmp==="nenhum"?`<span class="muted">${txt.replace(/^face a /,"")}</span>`:d==null?`<span class="muted">sem período anterior</span>`:`${dchip(d,unit)}<span class="muted">${txt}</span>`;
const pctd=(c,p)=>p?(c/p-1)*100:null;
const METR={
 anuncios_ativos(){const W=win(),bs=incl(),cur=totalAct(W.z),prv=W.canP?totalAct(W.z-W.w):null;
  return{help:"Anúncios ativos na semana, somados nas marcas em comparação. Fonte: bibliotecas de anúncios das plataformas.",why:{def:"Quantos anúncios estavam a correr na semana mais recente, somados nas marcas do conjunto competitivo.",calc:"Cada anúncio conta em todas as semanas entre a data de início e a de fim (ou até hoje, se continua ativo).",janela:`Semana de ${wLab(W.z)}`+(W.canP?`, comparada com a semana de há ${W.w} semanas.`:"."),filtros:"Respeita as plataformas e as marcas escolhidas nos filtros.",limites:"Só inclui anúncios visíveis nas bibliotecas públicas. Não inclui TV, rádio nem exterior."},l:"Anúncios ativos agora",v:`<span data-count="${cur}">${nf(cur)}</span>`,sub:cmpSub(prv?pctd(cur,prv):null,"%",`face a há ${W.w} semanas`),series:range(W.a0,W.z).map(totalAct),src:"anuncios",go:"mercado/ativ"}},
 anuncios_novos(){const W=win(),bs=incl(),nw=bs.reduce((s,e)=>s+sumR(neu,e.id,W.a0,W.z),0),np=W.canP?bs.reduce((s,e)=>s+sumR(neu,e.id,W.p0,W.p1),0):null;
  return{help:"Anúncios que começaram a correr dentro do período escolhido.",why:{def:"Anúncios que começaram a correr dentro do período escolhido, nas marcas do conjunto.",calc:"Conta-se cada anúncio na semana da sua data de início.",janela:`${W.w} semanas até ${wLab(W.z)}`+(W.canP?", comparadas com as "+W.w+" semanas anteriores.":"."),filtros:"Respeita as plataformas e as marcas escolhidas.",limites:"Um pico pode ser um lançamento ou apenas a entrada de muitos criativos de teste."},l:"Anúncios novos no período",v:`<span data-count="${nw}">${nf(nw)}</span>`,sub:cmpSub(np?pctd(nw,np):null,"%","face ao período anterior"),series:range(W.a0,W.z).map(w=>bs.reduce((s,e)=>s+neu(e.id,w),0)),src:"anuncios",go:"mercado/ativ"}},
 quota_voz(){const W=win(),m=me(),inc=incl(),s1=sov(W.z)[m.id],s0=W.canP?sov(W.z-W.w)[m.id]:null,rank=[...inc].sort((p,q)=>press(q.id,W.z)-press(p.id,W.z)).findIndex(e=>e.cliente)+1;
  return{help:"Peso da marca no total de anúncios ativos do conjunto de marcas. Não é quota de mercado.",why:{def:"O peso da marca no total da pressão publicitária do conjunto competitivo. Não é quota de mercado.",calc:`Somam-se os anúncios ativos de cada marca ponderados pelo alcance típico da plataforma (${D.plataformas.map(p=>p.id+" "+nf(p.peso,2)).join("; ")}, conforme a configuração da agência). A quota é a parte da marca nesse total.`,janela:`Semana de ${wLab(W.z)}`+(W.canP?`, comparada com a semana de há ${W.w} semanas, em pontos percentuais.`:"."),filtros:"Respeita as plataformas e as marcas escolhidas: mudar o conjunto muda a quota.",limites:"Mede presença nos anúncios públicos, não investimento nem resultados."},l:`Quota de voz de ${esc(m.nome)}`,v:`<span data-count="${s1.toFixed(1)}" data-dec="1" data-suf="%">${nf(s1,1)}%</span>`,sub:`${rank}.º de ${inc.length} · `+(S.cmp==="nenhum"?"":s0==null?"sem período anterior":dchip(s1-s0,"p.p.")),series:range(W.a0,W.z).map(w=>sov(w)[m.id]),src:"anuncios",go:"mercado/voz"}},
 investimento(){const W=win(),bs=incl(),sp=bs.reduce((s,e)=>s+sumR(spdt,e.id,W.a0,W.z),0),spp=W.canP?bs.reduce((s,e)=>s+sumR(spdt,e.id,W.p0,W.p1),0):null,m=me(),mine=sumR(spdt,m.id,W.a0,W.z);
  return{help:"Estimativa de investimento a partir do volume e do formato dos anúncios. Não são valores faturados.",why:{def:"Ordem de grandeza do investimento do conjunto no período. Serve para comparar, não para fechar contas.",calc:"Anúncios ativos por semana × valor médio assumido por plataforma × fator da marca (configuração da agência).",janela:`${W.w} semanas até ${wLab(W.z)}`+(W.canP?", comparadas com as "+W.w+" semanas anteriores.":"."),filtros:"Respeita as plataformas e as marcas escolhidas.",limites:"As bibliotecas públicas não devolvem investimento em anúncios comerciais. Com uma fonte licenciada, este número passa a ser lido e deixa de ser estimado."},l:"Investimento estimado",v:`<span>${eur(sp)}</span>`,sub:cmpSub(spp?pctd(sp,spp):null,"%","face ao período anterior")+(S.cmp==="nenhum"?`<span class="muted">${esc(m.nome)}: ${sp?nf(mine/sp*100):0}% do total</span>`:""),series:range(W.a0,W.z).map(w=>bs.reduce((s,e)=>s+spdt(e.id,w),0)),src:"investimento",go:"mercado/inv"}},
 procura(k){const s=serieProcura(k.serie);if(!s)return null;const v=varProcura(s),W=win();
  return{help:"Índice de interesse de pesquisa em Portugal, de 0 a 100 (100 = o pico do período).",why:{def:"Interesse de pesquisa em Portugal por este tema, num índice de 0 a 100 em que 100 é o pico do período.",calc:"Valor da semana atual; a variação compara-o com a média das 8 semanas anteriores.",janela:`Semana de ${wLab(Z)}, face à média das 8 semanas anteriores.`,filtros:"Não depende dos filtros de plataforma nem de marca.",limites:"É um índice relativo, não um número de pesquisas."},l:k.rotulo||s.nome,v:`<span data-count="${s.valores[Z]}">${nf(s.valores[Z])}</span>`,sub:v?`${dchip(v.pct,"%")}<span class="muted">face à média de 8 semanas</span>`:`<span class="muted">índice 0 a 100</span>`,series:s.valores.slice(Math.max(0,W.a0),Z+1),src:"procura",go:"procura"}},
 noticias_total(k){if(!D.noticias)return null;const W=win(),S_=D.noticias.series,tot=w=>{const v=S_.map(s=>s.valores[w]);return v.every(x=>x==null)?null:sum(v)},arr=range(W.a0,W.z).map(tot),ok=arr.filter(x=>x!=null);if(!ok.length)return null;
  const cur=sum(ok),prev=W.canP?range(W.p0,W.p1).map(tot):null,pv=prev&&prev.every(x=>x!=null)?sum(prev):null;
  return{help:"Artigos de imprensa por semana que mencionam os temas acompanhados.",why:{def:"Número de artigos de imprensa que mencionam os temas acompanhados.",calc:"Somam-se os artigos de todos os temas na janela escolhida.",janela:`${W.w} semanas até ${wLab(W.z)}`+(W.canP?", comparadas com as "+W.w+" semanas anteriores.":"."),filtros:"Respeita o período escolhido.",limites:"A pesquisa de notícias não é exaustiva: serve para detetar temas, não para os contar todos."},l:k.rotulo||"Artigos no período",v:`<span data-count="${cur}">${nf(cur)}</span>`,sub:cmpSub(pv?pctd(cur,pv):null,"%","face ao período anterior"),series:arr.map(x=>x??0),src:"noticias",go:"procura"}},
 indicador(k){const it=D.contexto&&D.contexto.indicadores.find(i=>i.id===k.id);if(!it)return null;
  return{help:"Indicador público de contexto de mercado.",why:{def:`${it.rotulo}: indicador público de contexto de mercado.`,calc:"Valor publicado pela fonte indicada; o Radar não o recalcula.",janela:it.detalhe||"Último valor disponível.",filtros:"Não depende dos filtros.",limites:"Os indicadores públicos atualizam-se com atraso e podem ser revistos pela entidade que os publica."},l:it.rotulo,v:`<span>${nf(it.valor,it.decimais||0)}${it.formato||""}</span>`,sub:`<span class="muted">${esc(it.detalhe||"")}</span>`,src:it.bloco,go:"mercado/ctx"}}
};
const KP_ADS=new Set(["anuncios_ativos","anuncios_novos","quota_voz","investimento"]);
function kpisHTML(){const ks=D.kpis.filter(k=>!KP_ADS.has(k.metrica)||hasAds()).map(k=>(METR[k.metrica]||(()=>null))(k)).filter(Boolean);return ks.length?`<div class="kpis k5">${ks.map(kpiHTML).join("")}</div>`:""}

/* ---------- Sinais: texto de abertura e mini-gráficos ---------- */
const sinaisMat=()=>D.sinais.filter(s=>s.material);
const semDados=()=>Object.values(D.blocos).every(b=>b.origem==="pendente");   // nenhuma fonte ligada nem demonstração
function headline(){if(S.bquiet&&!isCli())return"Sem sinais materiais esta semana";if(isCli()){const c=cartoesPub();return c.length?c[0].titulo:"Resumo da semana de "+D.cliente.nome}if(semDados())return"Ainda sem dados ligados";const m=sinaisMat();return m.length?m[0].titulo:"Sem sinais materiais esta semana"}
function leadText(){if(S.bquiet&&!isCli())return"Simulação: nenhum sinal ultrapassou o limiar. O Radar continua a observar, e isso também é informação.";if(isCli())return pubNota()||"Resumo preparado pela equipa Arena Media com os dados desta semana.";if(semDados())return"Liga as fontes em Fontes de dados. Enquanto não houver dados, o Radar não mostra números.";const m=sinaisMat().length,o=D.sinais.length-m;return m?`${m===1?"Um sinal acima":nf(m)+" sinais acima"} do limiar${o?` e ${o===1?"um":nf(o)} em observação`:""}. A equipa decide o que fazer com cada um.`:"O Radar continua a observar, e isso também é informação. A equipa decide o que fazer a seguir."}
function sigChart(s){if(!s.serie)return null;const a=Math.max(0,Z-11),r=range(a,Z),xl=i=>wLab(a+i);
  if(s.serie.tipo==="anuncios_ativos"){const e=ebyid(s.serie.id);return{series:[{n:e.nome,c:col(e),d:r.map(w=>PL.reduce((q,p)=>q+AD[e.id][p][w],0))}],xl,fmt:v=>nf(v)+" anúncios",aria:"Anúncios ativos nas últimas 12 semanas"}}
  if(s.serie.tipo==="quota_voz"){const e=ebyid(s.serie.id);return{series:[{n:e.nome,c:col(e),d:r.map(w=>sov(w)[e.id])}],xl,fmt:v=>nf(v,1)+"%",aria:"Quota de voz nas últimas 12 semanas"}}
  if(s.serie.tipo==="procura"){const z=serieProcura(s.serie.id);return z?{series:[{n:z.nome,c:procC(z,D.procura.series.indexOf(z)),d:r.map(w=>z.valores[w])}],xl,fmt:v=>nf(v),aria:"Procura nas últimas 12 semanas"}:null}
  return null}

/* ---------- Pistas: estado vivo da equipa (em memória; a persistência é a tarefa RB-22) ---------- */
const STL={sugerida:"Por decidir",aceite:"Aceite pela equipa",ajustada:"Ajustada e aceite",descartada:"Descartada"};
const pistasPend=d=>d.pistas.filter(p=>p.s==="sugerida").length;
const pistasDecididas=d=>d.pistas.filter(p=>p.s==="aceite"||p.s==="ajustada");
