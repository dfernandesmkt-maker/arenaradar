/* ============================================================
   «Comparar»: quota de voz, investimento estimado, mapa de mensagens (com espaço livre), preço e leilão.
   ============================================================ */
function pageComparar(){
  use("volume","investimento","criativos","precos","leilao");
  const cl=cliente(),M=D.marcas,a=Z-25,xl=(i,l)=>l?wRange(a+i):wLab(a+i);
  const S=M.map(m=>({n:m.nome,c:col(m),w:m.cliente?3:2,d:range(a,Z).map(w=>D.quota[m.id][w])}));
  later(()=>lineChart($("#cq"),{series:S,end:true,xl,fmt:v=>nf(v,1)+"%",aria:"Quota de voz por marca"}));
  const inv=M.map(m=>({m,v:sum(range(Z-11,Z).map(w=>D.investimento[m.id][w]))})).sort((x,y)=>y.v-x.v),mx=inv[0].v||1;
  // territórios: % dos criativos de cada marca em cada território (26 semanas)
  const tsh=id=>{const L=D.criativos.filter(c=>c.marca===id&&c.fim>=Z-25),n=L.length||1;return D.territorios.map(t=>L.filter(c=>c.territorio===t).length/n*100)};
  const T=Object.fromEntries(M.map(m=>[m.id,tsh(m.id)]));
  const occ=D.territorios.map((t,i)=>Math.max(...concorrentes().map(m=>T[m.id][i])));
  const livre=D.territorios.map((t,i)=>({t,i,v:occ[i]})).filter(x=>x.v<20).sort((x,y)=>x.v-y.v);
  const cell=v=>`<td style="background:color-mix(in srgb,var(--brand) ${Math.round(4+v*.4)}%,transparent);color:var(--text)">${nf(v)}%</td>`;
  const eu=D.precos.unidade==="€/L",PS=M.map(m=>({n:m.nome,c:col(m),w:m.cliente?3:2,d:range(a,Z).map(w=>D.precos.marcas[m.id][w])}));
  if(eu)PS.push({n:"Média do mercado",c:"var(--text-2)",w:1.6,dash:true,d:range(a,Z).map(w=>D.precos.mercado[w])});
  later(()=>lineChart($("#cp"),{series:PS,end:true,xl,fmt:v=>eu?nf(v,3)+" €":nf(v,1),ref:eu?null:{v:100,n:"média = 100"},aria:D.precos.rotulo}));
  const LS=concorrentes().filter(m=>D.leilao[m.id]).map(m=>({n:m.nome,c:col(m),d:range(a,Z).map(w=>D.leilao[m.id][w])}));
  later(()=>lineChart($("#cl"),{series:LS,end:true,min:0,xl,fmt:v=>nf(v)+"%",aria:"Sobreposição nas pesquisas do cliente"}));
  return pheadHTML(`${esc(cl.nome)} · últimas 26 semanas`,"Comparar",`Quem pesa mais, com que mensagem, a que preço e nas pesquisas de quem. A ${esc(cl.nome)} aparece sempre a tinta.`)+
   `<div class="card"><h3>Quota de voz</h3><p>Parte dos anúncios ativos de cada marca no conjunto, por semana.</p>${legendH(S)}<div class="cv" id="cq"></div>${tableH({series:S,xl,fmt:v=>nf(v,1)+"%"})}</div>
   <div class="grid2" style="margin-top:16px">
     <div class="card"><h3>Investimento estimado</h3><p>Últimas 12 semanas, digital e meios tradicionais. Ordem de grandeza: anúncios ativos e semanas de TV a valores assumidos.</p><div class="bars">${inv.map(x=>`<div class="bar"><span style="display:inline-flex;gap:7px;align-items:center">${dotH(x.m)}${esc(x.m.nome)}</span><span class="tr"><i style="width:${x.v/mx*100}%;background:${col(x.m)}"></i></span><span class="v">${eur(x.v)}</span></div>`).join("")}</div><p class="foot"><span class="seal" data-o="estimado" style="height:20px">Estimado</span> Método no selo da página.</p></div>
     <div class="card"><h3>Quem aparece nas pesquisas da ${esc(cl.nome)}</h3><p>Percentagem das pesquisas onde a ${esc(cl.nome)} aparece em que cada concorrente também aparece (Auction Insights das contas do cliente).</p>${legendH(LS)}<div class="cv" id="cl"></div></div>
   </div>
   <div style="margin-top:16px"><div class="card"><h3>Mapa de mensagens</h3><p>Parte dos criativos de cada marca por território. Com contorno amarelo: território que nenhum concorrente ocupa a sério (menos de 20%).</p><div class="tblwrap"><table class="mx"><thead><tr><th></th>${D.territorios.map(t=>`<th class="c" title="${esc(t)}">${esc(t)}</th>`).join("")}</tr></thead><tbody>${M.map(m=>`<tr><td class="rn">${dotH(m)} ${esc(m.nome)}</td>${T[m.id].map((v,i)=>cell(v).replace("<td ",`<td class="${livre.some(x=>x.i===i)&&!m.cliente?"free":""}" `)).join("")}</tr>`).join("")}</tbody></table></div>
       ${livre.length?`<div class="next" style="margin-top:12px"><svg class="ic"><use href="#i-flag"/></svg><div><b>Espaço livre.</b> ${livre.map(x=>`«${esc(x.t)}»`).join(" e ")} ${livre.length>1?"têm":"tem"} pouca concorrência: no máximo ${nf(livre[0].v)}% dos criativos de uma marca. É um território que a ${esc(cl.nome)} pode ocupar.</div></div>`:""}</div></div>
   <div style="margin-top:16px"><div class="card"><h3>${esc(D.precos.rotulo)}</h3><p>${eu?"Preço médio semanal por marca e média do mercado.":"Preço de um cabaz comparável, 100 = média do conjunto."} Uma descida rápida costuma acompanhar uma promoção ou campanha.</p>${legendH(PS)}<div class="cv" id="cp"></div></div></div>`}
