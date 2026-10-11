/* ============================================================
   Dados do cliente ativo (DATA.clientes[id]) e auxiliares de leitura.
   ============================================================ */
const AG=DATA.agencia, CLS=DATA.clientes;
let D=null, Z=0, MK={}, CR={}, MV={}, RS={};
function setClient(id){
  D=CLS[id];CAL=D.calendario;Z=CAL.atual;
  MK=Object.fromEntries(D.marcas.map(m=>[m.id,m]));
  CR=Object.fromEntries(D.criativos.map(c=>[c.id,c]));
  MV=Object.fromEntries(D.movimentos.map(m=>[m.id,m]));
  RS=Object.fromEntries(D.respostas.map(r=>[r.id,r]))}
const CAT=["var(--c1)","var(--c2)","var(--c3)","var(--c4)","var(--c5)","var(--c6)","var(--c7)","var(--c8)","var(--c9)"];   // cliente = tinta (D47)
const col=m=>CAT[Math.min(m.cor,8)];
const cliente=()=>D.marcas.find(m=>m.cliente);
const concorrentes=()=>D.marcas.filter(m=>!m.cliente);
const dotH=m=>`<i class="dot" style="background:${col(m)}"></i>`;
const TCOR=["var(--t1)","var(--t2)","var(--t3)","var(--t4)","var(--t5)"];         // territórios: família própria (D35)
const tcol=t=>TCOR[Math.max(0,D.territorios.indexOf(t))%5];
const TIPOS=["Campanha","Promoção","Preço","Lançamento","Teste de criativos","Leilão","Imprensa"];
const TIPO_IC={"Campanha":"i-bolt","Promoção":"i-flag","Preço":"i-scale","Lançamento":"i-spark","Teste de criativos":"i-flask","Leilão":"i-search","Imprensa":"i-mail"};
const NIVEL={importante:"Importante",acompanhar:"A acompanhar",info:"Informativo"};
const agora=()=>D.movimentos.filter(m=>m.semana>=Z).sort((a,b)=>b.importancia-a.importancia||b.data.localeCompare(a.data));
const movsMarca=id=>D.movimentos.filter(m=>m.marca===id).sort((a,b)=>b.data.localeCompare(a.data));
const ativos=(id,w)=>D.plataformas.reduce((s,p)=>s+D.volume[id][p][w],0);
/* estado de uma resposta: o configurado, ou o que a equipa decidiu nesta demonstração */
const estadoR=r=>(MEM.resp[D.cliente.id+"|"+r.id]||{}).estado||r.estado;
const respostasDe=m=>(m.respostas||[]).map(id=>RS[id]).filter(Boolean);
