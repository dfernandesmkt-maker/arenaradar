/* ============================================================
   Página «Mercado»: adapta-se ao tipo de universo.
   Concorrência: quota de voz e presença · atividade · campanhas · formatos e mensagens · investimento.
   Tema: voz no tema · agenda · contexto de mercado.
   ============================================================ */
const MTABS={
  concorrencia:[["voz","Quota de voz"],["ativ","Atividade"],["camp","Campanhas"],["form","Formatos e mensagens"],["inv","Investimento e leilão"]],
  tema:[["voz","Voz no tema"],["agenda","Agenda"],["ctx","Contexto de mercado"]]};
const mtabs=()=>isTema()?MTABS.tema:MTABS.concorrencia;
const adsFrom=()=>ADS.length?Math.min(...ADS.map(c=>c.st)):Math.max(0,Z-25);   // primeira semana com anúncios

/* ---------- Quota de voz animada (corrida) ---------- */
const RH=44;let eint=null;
function stopRace(){if(eint){clearInterval(eint);eint=null}const b=$("#eplay");if(b){$("span",b).textContent="Reproduzir";$("use",b).setAttribute("href","#i-play")}}
function buildRace(){const host=$("#race");if(!host)return;const E=isCli()?incl():D.entidades;   // o cliente só vê as marcas que a equipa aceitou
  host.style.height=E.length*RH+"px";
  host.innerHTML=E.map(e=>`<div class="rrow ${e.cliente?"me":""}" data-id="${e.id}"><span class="rk"></span><span class="nm">${esc(e.nome)}${e.cliente?"<em>cliente</em>":""}</span><div class="bar"><i></i></div><span class="val num"></span><span class="dl num"></span></div>`).join("");
  void host.offsetWidth;updateRace();
  $("#ewk").addEventListener("input",ev=>{stopRace();S.ew=+ev.target.value;updateRace()});
  $("#eplay").addEventListener("click",()=>{if(eint){stopRace();return}let i=S.ew>=Z?adsFrom():S.ew;S.ew=i;updateRace();$("#eplay span").textContent="Pausar";$("#eplay use").setAttribute("href","#i-pause");eint=setInterval(()=>{i++;if(i>Z){stopRace();return}S.ew=i;updateRace()},RM?40:380)})}
function updateRace(){if(!$("#race"))return;const i=S.ew,now=sov(i),prev=sov(Math.max(0,i-8)),inc=incl().sort((a,b)=>now[b.id]-now[a.id]),off=isCli()?[]:D.entidades.filter(e=>!e.incluida),max=Math.max(...inc.map(e=>now[e.id]),1);
  inc.forEach((e,k)=>{const r=$(`.rrow[data-id="${e.id}"]`);r.classList.remove("off");r.style.transform=`translateY(${k*RH}px)`;$(".rk",r).textContent=k+1;$(".bar i",r).style.width=(now[e.id]/max*100)+"%";$(".val",r).textContent=nf(now[e.id],1)+"%";$(".dl",r).textContent=i<adsFrom()+8?"":sgn(now[e.id]-prev[e.id],1)+" p.p."});
  off.forEach((e,k)=>{const r=$(`.rrow[data-id="${e.id}"]`);r.classList.add("off");r.style.transform=`translateY(${(inc.length+k)*RH}px)`});
  $("#elab").textContent=wLabFull(i);$("#ewk").value=i;
  const m=me(),dm=now[m.id]-prev[m.id],mv=inc.filter(e=>!e.cliente).map(e=>({e,dl:now[e.id]-prev[e.id]})).sort((a,b)=>Math.abs(b.dl)-Math.abs(a.dl))[0];
  $("#einsight").innerHTML=i<adsFrom()+8||!mv?`Escolhe uma semana mais à frente para ver a evolução.`:`<b>${esc(mv.e.nome)}</b> ${mv.dl>0?"ganhou":"perdeu"} <b>${nf(Math.abs(mv.dl),1)} p.p.</b> de quota de voz nas 8 semanas até ${wLab(i)}. <b>${esc(m.nome)}</b> ${dm>=0?"ganhou":"perdeu"} ${nf(Math.abs(dm),1)} p.p. e está em ${inc.indexOf(m)+1}.º lugar no conjunto.`}
function buildHeat(){const h=$("#heat");if(!h)return;const W=win(),bs=D.entidades.filter(e=>e.incluida||(e.sugerida&&!isCli())),OFF=D.canais_offline;
  const avg=(b,p)=>mean(range(W.a0,W.z).map(w=>AD[b][p][w])),tot=Object.fromEntries(PL.map(p=>[p,incl().reduce((s,e)=>s+avg(e.id,p),0)||1]));
  h.innerHTML=`<thead><tr><th></th>${PL.map(p=>`<th style="${S.pl.has(p)?"":"opacity:.4"}">${p}</th>`).join("")}${OFF.map(c=>`<th>${c}</th>`).join("")}</tr></thead><tbody>${bs.map(e=>`<tr><td class="rn">${dot(e)}${esc(e.nome)}${e.sugerida?` <span class="t-xs">(sugerida)</span>`:""}</td>${PL.map(p=>{const v=e.incluida?avg(e.id,p)/tot[p]*100:0;return`<td class="c" style="${S.pl.has(p)?"":"opacity:.35;"}background:color-mix(in srgb,var(--brand) ${Math.round(v*.7)}%,transparent)" data-tip="<b>${esc(e.nome)}</b> tem ${nf(v)}% dos anúncios ativos em ${p} (média de ${W.w} semanas)${e.incluida?"":" — fora do conjunto"}">${e.incluida?nf(v)+"%":"—"}</td>`}).join("")}${OFF.map(c=>`<td class="c off" data-tip="Monitorização offline (${c}): módulo por ligar. Ver Fontes de dados.">por ligar</td>`).join("")}</tr>`).join("")}</tbody>`}

/* ---------- Concorrência ---------- */
function mVoz(){
  if(!hasAds())return emptyHTML("Sem anúncios ligados","Liga a Meta Ad Library ou importa um CSV em Fontes de dados.");
  later(()=>{buildRace();buildHeat()});
  const m=me();
  return secHTML("Quota de voz","Peso de cada marca na pressão publicitária (anúncios ativos ponderados pelo alcance típico de cada plataforma). Mexe na semana e o ranking refaz-se.",
   `<div class="setgrid"><div><div class="race" id="race"></div><div class="slider no-print"><button class="btn" id="eplay" aria-label="Reproduzir"><svg class="ic"><use href="#i-play"/></svg><span>Reproduzir</span></button><input type="range" id="ewk" min="${adsFrom()}" max="${Z}" value="${S.ew}" aria-label="Semana"><output id="elab"></output></div><div class="insight" id="einsight"></div></div>
   <div><h2 class="t-h2" style="margin-bottom:4px">Conjunto competitivo</h2><p class="t-sm muted" style="margin-bottom:10px">${isCli()?"As marcas que a equipa Arena acompanha.":"A equipa escolhe quem entra. O Radar só sugere. Herdado da vertical, ajustável por cliente."}</p><div class="setlist">${D.entidades.filter(e=>!isCli()||e.incluida).map(e=>isCli()?`<div class="setitem"><span class="nm">${esc(e.nome)}${e.cliente?"<em>cliente</em>":""}</span></div>`:e.cliente?`<div class="setitem"><span class="nm">${esc(e.nome)}<em>cliente</em></span></div>`:e.sugerida?`<div class="setitem"><span class="nm">${esc(e.nome)}<em>sugerida pelo Radar</em><br><span class="t-xs" style="font-weight:500">Aparece em ${e.sobreposicao}% das mesmas pesquisas</span></span><button class="btn" data-add="${e.id}" style="margin-left:auto">Aceitar</button></div>`:`<div class="setitem"><span class="nm">${esc(e.nome)}</span><button class="tg" role="switch" aria-checked="${e.incluida}" aria-label="Incluir ${esc(e.nome)}" data-tg="${e.id}"></button></div>`).join("")}</div></div></div>`,"anuncios")+
   secHTML("Presença por plataforma",`Quota dos anúncios ativos de cada plataforma que pertence a cada marca, em média no período. Cada coluna soma 100%.`,`<div class="tblwrap"><table class="hm2" id="heat"></table></div>`,"anuncios")}
document.addEventListener("click",e=>{const t=e.target.closest("[data-tg]");if(t){const b=ebyid(t.dataset.tg);b.incluida=!b.incluida;CUR.refresh()}});

function mAtiv(){
  if(!hasAds())return emptyHTML("Sem anúncios ligados","Liga a Meta Ad Library ou importa um CSV em Fontes de dados.");
  const W=win(),bs=incl(),xl=i=>wLab(W.a0+i),pls=PL.filter(p=>S.pl.has(p));
  const serP=pls.map(p=>({id:p,n:p,c:rampOf(p),d:range(W.a0,W.z).map(w=>bs.reduce((s,e)=>s+AD[e.id][p][w],0))}));
  const mx=Math.max(...bs.map(e=>Math.max(...range(W.a0,W.z).map(w=>act(e.id,w)))),1),ymx=niceMax(mx);
  const newS=bs.map(e=>({id:e.id,n:e.nome,c:col(e),d:range(W.a0,W.z).map(w=>neu(e.id,w))}));
  later(()=>{tsChart($("#c1"),{series:serP,type:"area",stack:true,end:true,xl,fmt:nf,aria:"Anúncios ativos por plataforma"},true);
   bs.forEach(e=>tsChart($("#m_"+e.id),{series:pls.map(p=>({n:p,c:rampOf(p),d:range(W.a0,W.z).map(w=>AD[e.id][p][w])})),type:"area",stack:true,mini:true,ymax:ymx,xl,fmt:nf,aria:"Anúncios ativos de "+e.nome},true));
   tsChart($("#c3"),{series:newS,type:"bars",stack:true,xl,fmt:nf,aria:"Anúncios novos por semana e marca"},true)});
  return cardHTML("Anúncios ativos por plataforma","Soma das marcas do conjunto.",`${legendHTML(serP)}<div class="cv" id="c1"></div>${tableHTML({series:serP,xl,fmt:nf})}`,"anuncios")+
   secHTML("Cada marca, lado a lado","Mesma escala em todos os gráficos, para a comparação ser justa. A cor das camadas é a plataforma.",`<div class="minis">${bs.map(e=>{const last=act(e.id,W.z),p4=act(e.id,Math.max(0,W.z-W.w));return`<div class="mini"><div class="mh"><span><i class="d" style="background:${col(e)}"></i>${esc(e.nome)}${e.cliente?' <span class="tag">cliente</span>':""}</span>${W.canP&&p4>=3?dchip(pctd(last,p4)):""}</div><div class="bg">${last}<span class="t-xs" style="margin-left:6px;font-weight:500">anúncios ativos</span></div><div class="cv" id="m_${e.id}"></div></div>`}).join("")}</div>${legendHTML(pls.map(p=>({n:p,c:rampOf(p)})))}`,"anuncios")+
   `<div class="card" style="margin-top:16px"><header><div><h2 class="t-h2">Anúncios novos por semana</h2><p>Picos mostram lançamentos de campanha. Uma marca que cria muitos criativos de uma vez está a testar ou a entrar em força.</p></div></header>${legendHTML(newS)}<div class="cv" id="c3"></div>${tableHTML({series:newS,xl,fmt:nf})}${foot("anuncios")}</div>`}

function mCamp(){
  if(!hasAds())return emptyHTML("Sem anúncios ligados","Liga a Meta Ad Library ou importa um CSV em Fontes de dados.");
  const W=win(),bs=incl(),n=W.w,rows=[];
  bs.forEach(e=>{const g={};ADS.filter(c=>c.b===e.id&&S.pl.has(c.p)&&c.en>=W.a0&&c.st<=W.z).forEach(c=>{const k=c.camp||"Anúncios ativos";(g[k]=g[k]||{n:k,st:99,en:0,pl:new Set(),th:{},c:[]});const x=g[k];x.st=Math.min(x.st,c.st);x.en=Math.max(x.en,c.en);x.pl.add(c.p);if(c.th>=0)x.th[c.th]=(x.th[c.th]||0)+1;x.c.push(c)});
   const L=Object.values(g).sort((a,b)=>a.st-b.st);if(L.length){rows.push({g:e});L.forEach(f=>rows.push({f,e}))}});
  const pr=range(W.a0,W.z).map(w=>bs.reduce((s,e)=>s+act(e.id,w),0)),srt=[...pr].sort((p,q)=>p-q),thr=srt[Math.floor(n*.3)],pk=srt[Math.floor(n*.8)];
  const runs=[];let cur=null;pr.forEach((v,i)=>{if(v<=thr){if(!cur)cur=[i,i];else cur[1]=i}else if(cur){runs.push(cur);cur=null}});if(cur)runs.push(cur);
  const win_=runs.filter(r=>r[1]-r[0]>=1).slice(0,4);
  later(()=>tsChart($("#gp"),{series:[{n:"Anúncios ativos",c:"var(--text-2)",d:pr,cf:i=>pr[i]>=pk?"var(--brand-ink)":pr[i]<=thr?"var(--line)":"color-mix(in srgb,var(--text-2) 55%,var(--surface))"}],type:"bars",mini:true,h:64,ml:0,mr:0,xl:i=>wLab(W.a0+i),fmt:v=>nf(v)+" anúncios",aria:"Pressão total por semana"},true));
  const gantt=rows.map(r=>r.g?`<div class="grp3">${esc(r.g.nome)}${r.g.cliente?" · cliente":""}</div>`:(()=>{const f=r.f,s=Math.max(f.st,W.a0),e2=Math.min(f.en,W.z),pls=[...f.pl],pkA=Math.max(...range(s,e2).map(w=>pls.reduce((q,p)=>q+AD[r.e.id][p][w],0))),th=Object.entries(f.th).sort((a,b)=>b[1]-a[1])[0];
    return`<div class="gr"><div class="gl2"><i style="background:${col(r.e)}"></i><span>${esc(f.n)}</span></div><div class="lane" style="background-size:${100/n}% 100%"><div class="bar2 ${r.e.cliente?"":"dk"}" style="left:${(s-W.a0)/n*100}%;width:${(e2-s+1)/n*100}%;background:${col(r.e)}" data-tip="<b>${esc(f.n)}</b> · ${esc(r.e.nome)}<br>${wLab(f.st)} a ${wLab(f.en)}<br>Plataformas: ${pls.join(", ")}${th?`<br>Mensagem: ${esc(TH[th[0]].toLowerCase())}`:""}<br>Pico: ${pkA} anúncios ativos">${pls.map(p=>`<em>${p[0]}</em>`).join("")}</div></div></div>`})()).join("");
  return cardHTML("Calendário de campanhas","Quando cada marca esteve no ar, em que plataformas e com que intensidade. Passa o cursor numa barra para ver o detalhe.",`<div class="axis2"><div class="t-xs" style="padding-top:22px">Pressão total do conjunto</div><div class="cv" id="gp"></div></div><div class="gantt">${gantt}<div class="gr" style="border:0"><div></div><div class="ax2" style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-2);padding-top:6px"><span>${wLab(W.a0)}</span><span>${wLab(W.a0+Math.floor(n/2))}</span><span>${wLab(W.z)}</span></div></div></div><p class="t-xs" style="margin-top:8px">M Meta · G Google · Y YouTube · T TikTok</p>${win_.length?`<div class="win"><span class="t-sm muted" style="margin-right:4px">Janelas de menor ruído concorrencial neste período:</span>${win_.map(r=>`<span class="tag">${wLab(W.a0+r[0])} a ${wLab(W.a0+r[1])}</span>`).join("")}</div>`:""}`,"anuncios")}

const STOP=new Set("de a o e para na no em que um uma os as do da dos das por com à é se ao ou tua teu mas pelo mais menos todos todas".split(" "));
function mForm(){
  if(!hasAds())return emptyHTML("Sem anúncios ligados","Liga a Meta Ad Library ou importa um CSV em Fontes de dados.");
  const W=win(),bs=incl(),L=ADS.filter(c=>!c.imp&&inCr(c,W.a0,W.z)),fms=FM.filter((f,i)=>L.some(c=>c.fm===i)||f!=="Não indicado");
  const mixes=bs.map(e=>{const cs=L.filter(c=>c.b===e.id),t=cs.length||1;return{e,n:cs.length,v:FM.map((f,i)=>cs.filter(c=>c.fm===i).length/t*100)}});
  const hasTh=L.some(c=>c.th>=0),th=bs.map(e=>{const cs=L.filter(c=>c.b===e.id),t=cs.length||1;return{e,v:TH.map((_,i)=>cs.filter(c=>c.th===i).length/t*100)}});
  const Wd={};L.forEach(c=>{c.h.toLowerCase().replace(/[.,%!?«»:]/g,"").split(/\s+/).filter(w=>w.length>=3&&!STOP.has(w)).forEach(w=>{Wd[w]=Wd[w]||{t:0,b:{}};Wd[w].t++;Wd[w].b[c.b]=(Wd[w].b[c.b]||0)+1})});
  const terms=Object.entries(Wd).sort((p,q)=>q[1].t-p[1].t).slice(0,8),mt=terms.length?terms[0][1].t:1;
  later(()=>requestAnimationFrame(()=>$$(".terms .single i").forEach(i=>i.style.width=i.dataset.w+"%")));
  return cardHTML("Mix de formatos","Que formatos cada marca usa nos anúncios ativos durante o período. Uma mudança súbita para vídeo costuma acompanhar um lançamento.",`${legendHTML(FM.map((f,i)=>({n:f,c:RAMP[i%4]})))}<div class="hb">${mixes.map(m=>`<div class="row"><span class="nm"><i style="background:${col(m.e)}"></i>${esc(m.e.nome)}</span><div class="sbar">${m.v.map((v,i)=>v<=0?"":`<span style="flex:${v} 1 0;background:${RAMP[i%4]};${i===0?"color:#0F2623":""}" data-tip="<b>${esc(m.e.nome)}</b>: ${nf(v)}% ${esc(FM[i].toLowerCase())} (${nf(Math.round(v*m.n/100))} de ${m.n} criativos)">${v>=9?nf(v)+"%":""}</span>`).join("")}</div><span class="num2">${m.n}</span></div>`).join("")}</div><p class="t-xs" style="margin-top:10px">A coluna da direita é o número de criativos observados.</p>`,"anuncios")+
   `<div class="grid2" style="margin-top:16px">`+
   cardHTML("Que mensagens defendem","Parte dos criativos de cada marca por território de mensagem. Mais escuro, mais peso.",hasTh?`<table class="hm2"><thead><tr><th></th>${TH.map(t=>`<th>${esc(t)}</th>`).join("")}</tr></thead><tbody>${th.map(r=>`<tr><td class="rn">${dot(r.e)}${esc(r.e.nome)}</td>${r.v.map((v,i)=>`<td class="c" style="background:color-mix(in srgb,var(--brand) ${Math.round(v*1.2)}%,transparent)" data-tip="<b>${esc(r.e.nome)}</b>: ${nf(v)}% dos criativos falam de ${esc(TH[i].toLowerCase())}">${nf(v)}%</td>`).join("")}</tr>`).join("")}</tbody></table>`:emptyHTML("Território não indicado","A fonte não classifica a mensagem dos anúncios."),"anuncios")+
   cardHTML("Palavras que mais se repetem","Termos mais frequentes nos textos dos anúncios do período e quem os usa mais.",`<div class="terms">${terms.map(([w,d])=>{const who=Object.entries(d.b).sort((p,q)=>q[1]-p[1])[0],e=ebyid(who[0]);return`<div class="t"><b>${esc(w)}</b><div class="single"><i data-w="${d.t/mt*100}" style="background:var(--brand)"></i></div><span class="num2" style="text-align:right;font-weight:600">${d.t}</span><span class="who2 t-xs">${e?dot(e):""}${esc(e?e.nome:who[0])}</span></div>`}).join("")}</div>`,"anuncios")+`</div>`}

function mInv(){
  if(!hasAds())return emptyHTML("Sem anúncios ligados","Liga a Meta Ad Library ou importa um CSV em Fontes de dados.");
  const W=win(),bs=incl(),xl=i=>wLab(W.a0+i);
  const ser=bs.map(e=>({id:e.id,n:e.nome,c:col(e),d:range(W.a0,W.z).map(w=>press(e.id,w))}));
  const pt=bs.map(e=>({e,v:PL.map(p=>S.pl.has(p)?sumR((b,w)=>spd(b,w,p),e.id,W.a0,W.z):0)})),mx=Math.max(...pt.flatMap(r=>r.v),1);
  const lei=D.leilao?D.leilao.itens.filter(l=>ebyid(l.entidade)&&ebyid(l.entidade).incluida):[];
  later(()=>{tsChart($("#c5"),{series:ser,type:"area",stack:true,pct:true,end:true,yf:v=>nf(v)+"%",xl,aria:"Quota de voz por marca"},true);requestAnimationFrame(()=>$$(".cellbar i[data-w]").forEach(i=>i.style.width=i.dataset.w+"%"))});
  const m=me();
  return cardHTML("Quota de voz ao longo do tempo","Como se reparte a pressão publicitária entre as marcas, semana a semana. Cada coluna soma 100%.",`${legendHTML(ser)}<div class="cv" id="c5"></div>${tableHTML({series:ser,xl,pct:true})}`,"anuncios")+
   secHTML("Investimento estimado por marca e plataforma","Estimativa para comparar ordens de grandeza, não para fechar contas. Substitui-se por dados de uma ferramenta licenciada quando houver.",`<div class="card tblwrap"><table><thead><tr><th>Marca</th>${PL.map(p=>`<th class="n" style="${S.pl.has(p)?"":"opacity:.4"}">${p}</th>`).join("")}<th class="n">Total</th></tr></thead><tbody>${pt.map(r=>`<tr><td style="font-weight:600">${dot(r.e)}${esc(r.e.nome)}</td>${r.v.map(v=>`<td class="n cellbar"><i data-w="${v/mx*100}"></i><span>${v?eur(v):"—"}</span></td>`).join("")}<td class="n" style="font-weight:700">${eur(r.v.reduce((s,v)=>s+v,0))}</td></tr>`).join("")}</tbody></table></div><p class="method"><b style="color:var(--text);font-weight:600">Método.</b> ${esc(BLK("investimento").metodo)} (valores por plataforma: ${D.plataformas.map(p=>`${p.id} ${p.valor_anuncio} €`).join(", ")}). A Meta Ad Library não devolve investimento em anúncios comerciais.</p>`,"investimento")+
   (D.leilao?secHTML("Pesquisa Google: quem disputa os mesmos leilões",`Quota de impressões e sobreposição entre ${esc(m.nome)} e cada concorrente, no formato do relatório «Informações do leilão» do Google Ads.`,`<div class="card tblwrap"><table><thead><tr><th>Marca</th><th class="n">Quota de impressões</th><th class="n">Taxa de sobreposição</th><th class="n">Posição acima de ${esc(m.nome)}</th><th class="n">Topo da página</th></tr></thead><tbody>${lei.map(r=>{const e=ebyid(r.entidade);return`<tr><td style="font-weight:600">${dot(e)}${esc(e.nome)}${e.cliente?' <span class="tag">cliente</span>':""}</td><td class="n cellbar"><i data-w="${r.quota_impressoes}"></i><span>${nf(r.quota_impressoes)}%</span></td><td class="n">${r.sobreposicao==null?"—":nf(r.sobreposicao)+"%"}</td><td class="n">${r.posicao_acima==null?"—":nf(r.posicao_acima)+"%"}</td><td class="n">${nf(r.topo_pagina)}%</td></tr>`}).join("")}</tbody></table></div><div class="lockcard" style="margin-top:12px"><svg class="ic" style="width:22px;height:22px"><use href="#i-lock"/></svg><div>Este relatório vem da conta Google Ads do cliente. Usar dados reais exige a autorização do cliente e o parecer de Compliance. <i class="bd lock" style="margin-left:6px">Por confirmar</i></div></div>`,"leilao"):"")}

/* ---------- Tema ---------- */
const internosHTML=()=>(D.internos||[]).map(i=>`<div class="sec"><div class="lockcard"><svg class="ic" style="width:22px;height:22px"><use href="#i-lock"/></svg><div><b style="color:var(--text);font-weight:600">${esc(i.nome)}</b><br>${esc(i.descricao)} ${i.estado?`<i class="bd lock" style="margin-left:6px">${esc(i.estado)}</i>`:""}</div></div></div>`).join("");
function mTVoz(){use("voz");return detailHTML()+internosHTML()}
function mTAgenda(){if(!D.agenda)return emptyHTML("Sem agenda","Acrescenta marcos em config/clients/"+D.cliente.id+".yaml.");
  D.agenda.forEach(a=>use(a.bloco));
  return secHTML("Agenda","Marcos que mudam o contexto e a janela de ativação.",`<div class="tl">${D.agenda.map(a=>`<div class="${a.estado==="hoje"?"today":a.estado==="futuro"?"future":""}" data-src="${a.bloco}"><time>${esc(a.data)}</time><div>${esc(a.texto)}</div></div>`).join("")}</div>`)}
function mTCtx(){
  if(!D.contexto)return emptyHTML("Sem contexto de mercado","Acrescenta indicadores em config/clients/"+D.cliente.id+".yaml.");
  const v=D.contexto.variacoes,M=8;
  const tiles=`<div class="tiles">${D.contexto.indicadores.map(it=>{use(it.bloco);return`<div class="tile" data-src="${it.bloco}"><span class="t-xs">${esc(it.rotulo)}</span><span class="big"><span data-count="${it.valor}" data-dec="${it.decimais||0}" data-suf="${esc(it.formato||"")}">${nf(it.valor,it.decimais||0)}${esc(it.formato||"")}</span></span>${it.meta?`<div class="meter"><i data-w="${it.valor}"></i><s style="left:${it.meta}%"></s></div>`:""}<span class="t-sm">${esc(it.detalhe||"")}</span></div>`}).join("")}</div>`;
  later(()=>{$$(".tile .meter i").forEach(i=>{i.style.width="0";setTimeout(()=>i.style.width=i.dataset.w+"%",RM?0:200)});$$(".dv .trk i").forEach(i=>{})});
  return secHTML("Contexto de mercado","Dados públicos sobre o tema. Cada número indica a sua fonte ao passar o cursor.",tiles)+
   (v?secHTML(esc(v.titulo),esc(v.descricao),`<div class="card"><div class="dv">${v.itens.map(r=>{const w=Math.abs(r.valor)/M*50;return`<div class="row"><span style="font-weight:600">${esc(r.rotulo)}</span><div class="trk"><i style="${r.valor>=0?"left:50%":"right:50%"};width:${w}%;--o:${r.valor>=0?"left":"right"};background:${r.valor>=0?"var(--pos)":"var(--neg)"}" data-tip="<b>${esc(r.rotulo)}</b>: ${sgn(r.valor,1)}%"></i><b style="${r.valor>=0?"left":"right"}:calc(${50+(r.valor>=0?1:-1)*w}% + 8px)">${sgn(r.valor,1)}%</b></div></div>`}).join("")}</div><p class="t-xs" style="margin-top:10px">Escala de −${M}% a +${M}%.</p></div>`,v.bloco):"")}

const MRENDER={voz:()=>isTema()?mTVoz():mVoz(),ativ:mAtiv,camp:mCamp,form:mForm,inv:mInv,agenda:mTAgenda,ctx:mTCtx};
function pageMercado(sub){
  const tabs=mtabs(),t=tabs.find(x=>x[0]===sub)?sub:tabs[0][0];S.tab.mercado=t;
  const body=`${isTema()?"":filterBar({platforms:true,brands:true})}
   <div class="tabs sub" role="tablist" aria-label="Vistas do mercado">${tabs.map(x=>`<button role="tab" aria-selected="${x[0]===t}" data-go="mercado/${x[0]}">${x[1]}</button>`).join("")}</div>${MRENDER[t]()}`;
  const titulo=isTema()?"Quem comunica sobre o tema e o que o rodeia":`O que a concorrência anuncia em ${esc(D.cliente.vertical_nome.toLowerCase())}`;
  const lead=isTema()?"Entidades do universo, agenda e contexto de mercado. Cada número diz de onde vem.":`Anúncios ativos, criativos, mensagens e campanhas das marcas do conjunto competitivo de ${esc(me().nome)}. Filtra por período, plataforma e marca; tudo o que está abaixo acompanha.`;
  return pheadHTML(`${esc(D.cliente.nome)} · Mercado`,titulo,lead,{sm:true})+body}
