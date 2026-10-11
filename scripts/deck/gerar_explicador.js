/* Deck explicativo «O que é o Arena Radar» (RB-120): deliverables/arena-radar-o-que-e.pptx
   Para ler sozinho ou apresentar a quem não conhece o Radar. Base: docs/11-v4-radar-de-movimentos.md.
   Capturas: node scripts/deck/capturas.js. Poppins (D55), cores Arena, logo oficial, notas do orador em todos os slides.
   Uso: (cd scripts/deck && npm install) && node scripts/deck/gerar_explicador.js */
const path = require("path");
const { novoDeck, ROOT } = require("./comum");
const OUT = path.join(ROOT, "deliverables/arena-radar-o-que-e.pptx");
const RODAPE = "Arena Radar · O que é e como funciona · Outubro 2026";
const { pres, C, TINT, W, M, DEMO, txt, card, num, legenda, img, contorno, radar, escrever } =
  novoDeck({ titulo: "Arena Radar — O que é e como funciona", rodape: RODAPE, capa: "O que é e como funciona · Outubro 2026" });
const CW = W - 2 * M; // largura útil
const slide = (sec, titulo) => { const s = pres.addSlide({ masterName: "CONTEUDO", sectionTitle: sec }); s.addText(titulo, { placeholder: "title" }); return s; };
// linha numerada: número, título e texto
const item = (s, x, y, w, n, t, b, o = {}) => {
  num(s, x, y, n);
  txt(s, t, { x: x + 0.65, y: y - 0.02, w: w - 0.65, h: 0.45, fontSize: o.ft || 16, bold: true });
  txt(s, b, { x: x + 0.65, y: y + 0.44, w: w - 0.65, h: o.hb || 0.9, fontSize: o.fb || 13, color: C.text2 });
};
// cartão com título e texto
const bloco = (s, x, y, w, h, t, b, o = {}) => {
  card(s, x, y, w, h, t, o.fill);
  txt(s, t, { x: x + 0.3, y: y + 0.22, w: w - 0.6, h: 0.45, fontSize: o.ft || 17, bold: true, color: o.escuro ? C.background1 : C.text1 });
  txt(s, b, { x: x + 0.3, y: y + (o.dy || 0.7), w: w - 0.6, h: h - (o.dy || 0.7) - 0.15, fontSize: o.fb || 13, color: o.escuro ? C.background2 : C.text2 });
};
const seta = (s, x, y) => s.addShape(pres.shapes.CHEVRON, { x, y, w: 0.12, h: 0.24, fill: { color: C.text2 }, line: { color: C.text2, width: 0 }, objectName: "seta" });
const tabela = (s, cab, linhas, o) => {
  const hdr = t => ({ text: t, options: { bold: true, color: C.background1, fill: { color: C.text1 }, fontSize: o.fh || 12 } });
  const rows = [cab.map(hdr)].concat(linhas.map(l => l.map((t, j) => ({ text: t, options: { fontSize: o.fs || 12, bold: j === 0, color: j === 0 ? C.text1 : C.text2 } }))));
  s.addTable(rows, { x: M, y: o.y, w: CW, colW: o.colW, rowH: o.rowH, valign: "middle", margin: [0, 0.12, 0, 0.12], border: { type: "solid", pt: 0.75, color: TINT.line }, objectName: o.nome });
};

// =========================================================== 1. Capa
pres.addSection({ title: "O que é" });
let s = pres.addSlide({ masterName: "CAPA", sectionTitle: "O que é" });
s.addText("Arena Radar", { placeholder: "title" });
s.addText("O radar de movimentos da concorrência", { placeholder: "body" });
radar(s, 11.5, 3.75);
s.addNotes("Este documento explica o que é o Arena Radar, como funciona e em que ponto está. Tudo o que aparece nas capturas é de demonstração: clientes e marcas fictícios, sem dados reais.");

// =========================================================== 2. Em poucas palavras
s = slide("O que é", "Em poucas palavras");
txt(s, "O Arena Radar segue tudo o que os concorrentes dos nossos clientes fazem e põe a equipa de conta à frente desses movimentos.", { x: M, y: 1.5, w: CW, h: 1.2, fontSize: 24, bold: true });
const verbos = [["Ver primeiro", "Saber em dias, não no relatório do mês seguinte. Tudo o que os concorrentes fazem, num só fio."],
                ["Perceber o padrão", "Cada marca tem um ritmo. Com o histórico, antecipa-se a próxima vaga e o que costuma vir a seguir."],
                ["Responder depressa", "Respostas combinadas de antemão com o cliente. Quando o movimento acontece, a equipa decide ativar."]];
const vw = (CW - 0.6) / 3;
verbos.forEach(([t, b], i) => {
  const x = M + i * (vw + 0.3);
  card(s, x, 3.15, vw, 3.25, t);
  num(s, x + 0.3, 3.45, i + 1);
  txt(s, t, { x: x + 0.3, y: 4.1, w: vw - 0.6, h: 0.5, fontSize: 20, bold: true });
  txt(s, b, { x: x + 0.3, y: 4.7, w: vw - 0.6, h: 1.6, fontSize: 14, color: C.text2 });
});
s.addNotes("A ideia numa frase: seguir a concorrência dos clientes de forma contínua e pôr a equipa à frente dela. Estar à frente quer dizer três coisas: ver primeiro, perceber o padrão de cada marca e responder depressa, com respostas que já estão combinadas com o cliente. Princípio de base: a plataforma sugere, a equipa decide.");

// =========================================================== 3. Porque existe
s = slide("O que é", "Porque precisamos dele");
const prob = [["Os clientes querem antecipação", "Esperam que a agência antecipe os movimentos da concorrência, não que os relate no fim do mês."],
              ["Não cabe no tempo das equipas", "Seguir a concorrência de forma contínua não cabe no dia a dia das equipas de conta. Hoje é pontual e manual."],
              ["O diferencial mudou", "Bibliotecas de anúncios, preços publicados e notícias estão ao alcance de todos. Conta ver a tempo e saber o que fazer."]];
prob.forEach(([t, b], i) => {
  const x = M + i * (vw + 0.3);
  card(s, x, 1.55, vw, 3.55, t);
  num(s, x + 0.35, 1.9, i + 1);
  txt(s, t, { x: x + 0.35, y: 2.6, w: vw - 0.7, h: 0.9, fontSize: 20, bold: true });
  txt(s, b, { x: x + 0.35, y: 3.55, w: vw - 0.7, h: 1.45, fontSize: 14, color: C.text2 });
});
txt(s, "O Radar não vende vigilância. Vende tempo: saber antes, com prova, e já com uma resposta combinada.", { x: M, y: 5.5, w: CW, h: 0.8, fontSize: 17, italic: true });
s.addNotes("Três razões. A expectativa do cliente mudou: quer antecipação. A capacidade da equipa não chega para vigiar tudo de forma contínua. E os dados de anúncios passaram a ser públicos, por isso a vantagem já não está em tê-los, está em vê-los a tempo e saber o que fazer.");

// =========================================================== 4. O movimento
pres.addSection({ title: "Como funciona" });
s = slide("Como funciona", "O movimento é o centro do Radar");
tabela(s, ["Tipo", "Exemplo", "Prova"], [
  ["Campanha", "A Norvo lançou «Regresso às Rotinas»", "Criativos, canais, oferta"],
  ["Promoção", "A Kaldo baixou 8 cêntimos por litro ao fim de semana", "Criativos, série de preço"],
  ["Preço", "A Kaldo está 4 cêntimos por litro abaixo da média do mercado", "Série de preço"],
  ["Lançamento", "A Gema lançou entregas em 1 hora", "Criativos, notícia"],
  ["Teste de criativos", "A Duna está a testar 12 criativos com pouco alcance", "Criativos de teste"],
  ["Pesquisa paga", "A Ondal aparece em 53% das pesquisas da Vetra (+14 p.p.)", "Dados de leilão do cliente"],
  ["Imprensa", "A Frescal abre 6 lojas no Norte", "Notícia"],
], { y: 1.5, colW: [2.6, 6.4, CW - 9.0], rowH: 0.58, fs: 13, fh: 13, nome: "tipos de movimento" });
legenda(s, M, 6.25, CW, "Um movimento é algo que um concorrente fez e que se pode provar. Exemplos com marcas fictícias da demonstração.");
s.addNotes("O objeto central do Radar é o movimento: algo que um concorrente fez e que se pode provar. Há sete tipos. Cada um traz a sua prova: criativos, uma série de preço, dados de leilão das contas do cliente ou uma notícia. Os exemplos usam as marcas fictícias da demonstração.");

// =========================================================== 5. Anatomia de um movimento
s = slide("Como funciona", "Cada movimento responde a quatro perguntas");
const ih5 = 5.15, iw5 = ih5 * (1280 / 1800);
img(s, "movimento.png", M, 1.45, iw5, ih5, "Captura do detalhe de um movimento");
contorno(s, M, 1.45, iw5, ih5);
legenda(s, M, 1.45 + ih5 + 0.06, 6, DEMO);
const x5 = M + iw5 + 0.55, w5 = W - M - x5;
[["Qual é a prova?", "Os criativos, a série de preço ou os dados de pesquisa que mostram o movimento."],
 ["Porque importa?", "Uma soma de pontos visível: peso, tipo, território onde o cliente compete, resposta combinada, novidade, sinal precoce."],
 ["O que costuma vir a seguir?", "O que a mesma marca fez depois de movimentos parecidos, pelo seu histórico."],
 ["Temos resposta?", "As respostas combinadas com o cliente que correspondem a este movimento, e o estado de cada uma."]]
  .forEach(([t, b], i) => item(s, x5, 1.5 + i * 1.08, w5, i + 1, t, b, { hb: 0.6 }));
const niv = [["Importante", "75 pontos ou mais", TINT.wip, TINT.wipInk], ["A acompanhar", "50 a 74 pontos", TINT.todo, TINT.todoInk], ["Informativo", "abaixo de 50", C.background1, C.text2]];
const nw = (w5 - 0.4) / 3;
niv.forEach(([t, b, f, k], i) => {
  const x = x5 + i * (nw + 0.2);
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 5.95, w: nw, h: 0.7, rectRadius: 0.1, fill: { color: f }, line: { color: TINT.line, width: 1 }, objectName: "nível " + t });
  txt(s, t, { x: x + 0.2, y: 6.02, w: nw - 0.4, h: 0.3, fontSize: 13, bold: true, color: k });
  txt(s, b, { x: x + 0.2, y: 6.33, w: nw - 0.4, h: 0.28, fontSize: 11, color: C.text2 });
});
s.addNotes("Ao abrir um movimento, o Radar responde a quatro perguntas: qual é a prova, porque importa, o que a marca costuma fazer a seguir e se já temos resposta combinada. A importância nunca é uma caixa negra: é uma soma de pontos que se vê. Daí saem três níveis: importante, a acompanhar e informativo.");

// =========================================================== 6. Cinco áreas
s = slide("Como funciona", "Cinco áreas, cinco perguntas da equipa de conta");
const areas = [["Agora", "O que mexeu esta semana?", "O movimento mais importante, o resumo da semana e o fio de movimentos com prova."],
               ["Concorrentes", "Como age cada marca?", "Ficha viva: ritmo, linha temporal, criativos e como comunica."],
               ["Comparar", "Quem pesa mais e onde?", "Quota de voz, investimento estimado, mensagens, preço e pesquisa paga."],
               ["Antecipar", "O que vem aí?", "As próximas 12 semanas pelo histórico, sinais precoces e o plano do cliente."],
               ["Respostas", "Estamos prontos?", "O que está combinado com o cliente para cada tipo de movimento."]];
const aw = (CW - 4 * 0.2) / 5;
areas.forEach(([t, q, b], i) => {
  const x = M + i * (aw + 0.2);
  card(s, x, 1.5, aw, 3.2, t);
  txt(s, t, { x: x + 0.25, y: 1.72, w: aw - 0.5, h: 0.45, fontSize: 18, bold: true });
  txt(s, q, { x: x + 0.25, y: 2.22, w: aw - 0.5, h: 0.75, fontSize: 13, bold: true, color: C.text1 });
  txt(s, b, { x: x + 0.25, y: 3.0, w: aw - 0.5, h: 1.6, fontSize: 12, color: C.text2 });
});
const ag = (CW - 0.3) / 2;
bloco(s, M, 4.95, ag, 1.6, "Torre (agência)", "Todos os clientes da agência lado a lado: o que é importante esta semana e o que vem a seguir em cada um.", { fill: C.text1, escuro: true });
bloco(s, M + ag + 0.3, 4.95, ag, 1.6, "Fontes de dados", "De onde vem cada dado na versão ligada, com o regime (oficial, licenciada, dados do cliente) e o estado.", { fill: C.text1, escuro: true });
s.addNotes("A plataforma organiza-se por perguntas, não por tipo de dado. Por cliente há cinco áreas: Agora, Concorrentes, Comparar, Antecipar e Respostas. Ao nível da agência há a Torre, com todos os clientes, e a página de Fontes, que diz de onde vem cada dado.");

// =========================================================== 7. Agora
pres.addSection({ title: "As áreas" });
s = slide("As áreas", "Agora: o que mexeu esta semana");
const iw7 = 7.7, ih7 = iw7 / 1.6;
img(s, "agora.png", M, 1.5, iw7, ih7, "Captura do ecrã Agora");
contorno(s, M, 1.5, iw7, ih7);
legenda(s, M, 1.5 + ih7 + 0.08, iw7, DEMO);
[["O mais importante no topo", "O primeiro ecrã diz logo o que importa e quantos movimentos têm resposta pronta."],
 ["Indicadores da semana", "Movimentos, importantes, concorrentes no ar e o próximo movimento esperado."],
 ["O fio de movimentos", "Filtros por tipo, marca e período; cada cartão abre a prova e o porquê."]]
  .forEach(([t, b], i) => item(s, 8.75, 1.55 + i * 1.6, W - M - 8.75, i + 1, t, b));
s.addNotes("Agora é o ecrã de segunda-feira. No topo, o movimento mais importante da semana; depois os indicadores, o resumo da semana e o fio de todos os movimentos, com filtros. Ao lado: o que vem a seguir, quem aparece nas pesquisas do cliente e quem está no ar.");

// =========================================================== 8. Concorrentes
s = slide("As áreas", "Concorrentes: a ficha viva de cada marca");
img(s, "ficha.png", M, 1.5, iw7, ih7, "Captura da ficha de um concorrente");
contorno(s, M, 1.5, iw7, ih7);
legenda(s, M, 1.5 + ih7 + 0.08, iw7, DEMO);
[["Ritmo", "Campanhas por ano, duração, meses fortes, promoções e se testa criativos antes."],
 ["Linha temporal", "Os últimos 12 meses e as próximas 12 semanas, com o que se espera a tracejado."],
 ["Criativos e mensagens", "Biblioteca de criativos e como a marca comunica: oferta, tom e público, ao lado do cliente."]]
  .forEach(([t, b], i) => item(s, 8.75, 1.55 + i * 1.6, W - M - 8.75, i + 1, t, b));
s.addNotes("Cada concorrente tem uma ficha viva: o estado atual, o ritmo calculado a partir de dois anos de histórico, a linha temporal com o que já fez e o que se espera, a biblioteca de criativos e uma leitura de como comunica, comparada com o cliente. A classificação dos criativos é automática e marcada como estimada.");

// =========================================================== 9. Comparar
s = slide("As áreas", "Comparar: quem pesa mais e onde");
const iw9 = 9.0, ih9 = iw9 / (2288 / 722);
img(s, "mensagens.png", M, 1.5, iw9, ih9, "Captura do mapa de mensagens");
contorno(s, M, 1.5, iw9, ih9);
legenda(s, M, 1.5 + ih9 + 0.08, iw9, DEMO);
bloco(s, M + iw9 + 0.3, 1.5, W - M - (M + iw9 + 0.3), ih9, "Espaço livre", "O mapa de mensagens mostra os territórios que nenhum concorrente ocupa a sério. É onde o cliente se pode diferenciar.", { fb: 13 });
const cmp = [["Quota de voz", "Parte dos anúncios ativos de cada marca, semana a semana."], ["Investimento", "Estimado, em ordem de grandeza, com o método à vista."],
             ["Pesquisa paga", "Quem aparece nas mesmas pesquisas que o cliente."], ["Preço", "Preço por marca e média do mercado, ou índice do cabaz."]];
const cw9 = (CW - 3 * 0.2) / 4;
cmp.forEach(([t, b], i) => bloco(s, M + i * (cw9 + 0.2), 5.0, cw9, 1.6, t, b, { ft: 15, dy: 0.62, fb: 12 }));
s.addNotes("Comparar põe todas as marcas lado a lado: quota de voz, investimento estimado (sempre etiquetado como estimado, com o método), presença nas pesquisas do cliente e preço. O mapa de mensagens mostra a parte dos criativos de cada marca por território e destaca o espaço livre, onde nenhum concorrente está a sério.");

// =========================================================== 10. Antecipar
s = slide("As áreas", "Antecipar: o que vem aí nas próximas 12 semanas");
const ih10 = 3.0, iw10 = ih10 * (2288 / 638);
img(s, "antecipar.png", M, 1.45, iw10, ih10, "Captura das próximas 12 semanas");
contorno(s, M, 1.45, iw10, ih10);
legenda(s, M, 1.45 + ih10 + 0.08, CW, DEMO + " Tracejado: o esperado pelo histórico. Última linha: o plano da Vetra.");
const met = [["Séries que se repetem", "A mesma campanha na mesma altura do ano. Janela pela variação entre anos; confiança pela regularidade."],
             ["Ritmo de promoções", "A próxima promoção pela última e pelo intervalo habitual da marca."],
             ["Sinais precoces", "Testes de criativos com pouco alcance que, no histórico, antecederam campanhas."]];
const mw = (CW - 0.6) / 3;
met.forEach(([t, b], i) => bloco(s, M + i * (mw + 0.3), 5.0, mw, 1.65, t, b, { ft: 16, dy: 0.62, fb: 12 }));
s.addNotes("Antecipar mostra as próximas 12 semanas. As previsões vêm de três padrões visíveis no histórico: campanhas que se repetem na mesma altura do ano, o ritmo das promoções e testes de criativos que costumam anteceder campanhas. Cada previsão mostra a janela, a confiança e o método. É antecipação acionável, não adivinhação.");

// =========================================================== 11. Plano do cliente
s = slide("As áreas", "O nosso plano contra a concorrência");
const iw11 = 10.0, ih11 = iw11 / (2288 / 702);
img(s, "plano.png", M, 1.45, iw11, ih11, "Captura do plano do cliente e do que coincide");
contorno(s, M, 1.45, iw11, ih11);
legenda(s, M, 1.45 + ih11 + 0.08, CW, DEMO);
const pw = (CW - 0.3) / 2;
bloco(s, M, 5.05, pw, 1.6, "Choque", "Uma campanha do plano do cliente coincide com um movimento esperado de um concorrente, no mesmo território e com confiança alta ou média.");
bloco(s, M + pw + 0.3, 5.05, pw, 1.6, "A equipa decide", "Antecipar, mudar a mensagem ou manter. O choque entra nas decisões do resumo da semana.");
s.addNotes("O plano de meios do cliente entra em Antecipar. Para cada campanha planeada, o Radar mostra o que se espera da concorrência nas mesmas semanas. Quando é no mesmo território e com confiança alta ou média, é um choque. No exemplo, a campanha de preço da Vetra cai na semana em que a Kaldo costuma fazer Black Friday. Na versão ligada, o plano vem da ferramenta de planeamento da agência e nunca sai do ambiente da agência.");

// =========================================================== 12. Respostas
s = slide("As áreas", "Respostas: combinadas antes, ativadas pela equipa");
const passos = [["Combinar", "Com o cliente: quando, o quê, quem e com que prazo."], ["Acontece", "O Radar liga o movimento à resposta que lhe corresponde."],
                ["Decidir", "A equipa decide ativar. Nada é automático."], ["Executar", "Performance, Brand ou Account, no prazo combinado."]];
const sw = (CW - 3 * 0.35) / 4;
passos.forEach(([t, b], i) => {
  const x = M + i * (sw + 0.35);
  card(s, x, 1.5, sw, 1.55, t, i === 2 ? C.text1 : undefined);
  num(s, x + 0.25, 1.72, i + 1, i === 2);
  txt(s, t, { x: x + 0.85, y: 1.74, w: sw - 1.0, h: 0.42, fontSize: 17, bold: true, color: i === 2 ? C.background1 : C.text1 });
  txt(s, b, { x: x + 0.25, y: 2.32, w: sw - 0.5, h: 0.7, fontSize: 12, color: i === 2 ? C.background2 : C.text2 });
  if (i < 3) seta(s, x + sw + 0.115, 2.15);
});
const iw12 = 9.6, ih12 = iw12 / (2288 / 686);
img(s, "respostas.png", M, 3.35, iw12, ih12, "Captura de uma resposta combinada");
contorno(s, M, 3.35, iw12, ih12);
legenda(s, M, 3.35 + ih12 + 0.08, iw12, DEMO);
txt(s, "Também mostra as lacunas: movimentos importantes sem resposta combinada.", { x: M + iw12 + 0.3, y: 3.4, w: W - M - (M + iw12 + 0.3), h: 1.6, fontSize: 14, color: C.text2 });
s.addNotes("As respostas são o que torna o Radar acionável. Combina-se com o cliente, de antemão, o que fazer em cada tipo de movimento. Quando o movimento acontece, o Radar mostra a resposta que lhe corresponde e o estado dela. Ativar é sempre decisão da equipa. A página também mostra as lacunas: movimentos importantes para os quais ainda não há resposta.");

// =========================================================== 13. Resumo e IA
s = slide("As áreas", "Resumo da semana e IA, sempre com revisão");
const ih13 = 5.0, iw13 = ih13 * (1572 / 1494);
img(s, "resumo.png", M, 1.5, iw13, ih13, "Captura do resumo da semana");
contorno(s, M, 1.5, iw13, ih13);
legenda(s, M, 1.5 + ih13 + 0.08, CW, DEMO);
const x13 = M + iw13 + 0.55, w13 = W - M - x13;
[["O que traz", "Em 30 segundos, os pontos da semana, as decisões que cabem à equipa e um rascunho de email para o cliente."],
 ["Sempre por rever", "O texto fica «por rever» até alguém da equipa o rever. O email só se copia depois disso e sai assinado pela Arena."],
 ["O que segue para a IA", "Só dados públicos sobre concorrentes e os nomes das respostas. Nunca dados internos do cliente."],
 ["Hoje", "Na demonstração é feito por regras. O uso de IA real depende de IT e Compliance (Q13)."]]
  .forEach(([t, b], i) => item(s, x13, 1.55 + i * 1.22, w13, i + 1, t, b, { hb: 0.75 }));
s.addNotes("O resumo de segunda-feira vem escrito: o essencial em 30 segundos, os pontos da semana, as decisões para a equipa e um rascunho de email para o cliente. Pode ser redigido por IA, mas fica sempre por rever, e o email só se copia depois de revisto. A IA também classifica os criativos (oferta, tom, público). Ao modelo só seguem dados públicos. Na demonstração tudo isto é feito por regras; a IA real depende da aprovação de IT e Compliance.");

// =========================================================== 14. Fontes
pres.addSection({ title: "Dados e regras" });
s = slide("Dados e regras", "De onde vêm os dados na versão ligada");
tabela(s, ["Fonte", "O que dá", "Regime"], [
  ["Meta Ad Library (API)", "Anúncios ativos e históricos na UE, com texto, imagem e datas", "Pública oficial"],
  ["Google Ads Transparency Center", "Anúncios de pesquisa, YouTube e Display por anunciante e país", "Pública oficial"],
  ["TikTok Commercial Content Library", "Anúncios pagos no TikTok na UE", "Pública oficial"],
  ["LinkedIn Ad Library", "Anúncios no LinkedIn por anunciante", "Pública oficial"],
  ["Auction Insights (Google Ads do cliente)", "Quem aparece nas mesmas pesquisas que o cliente", "Dados do cliente"],
  ["Marktest", "Investimento em TV, rádio, imprensa e exterior", "Licenciada"],
  ["DGEG", "Preços dos combustíveis por posto e por dia", "Pública oficial"],
  ["Monitorização de páginas", "Preços, promoções e folhetos digitais dos concorrentes", "A validar"],
  ["Notícias e Google Trends", "Imprensa de setor e interesse de pesquisa", "Pública oficial"],
], { y: 1.45, colW: [3.9, 6.0, CW - 9.9], rowH: 0.47, fs: 12, fh: 12, nome: "fontes" });
legenda(s, M, 6.25, CW, "Todas por ligar. Na demonstração, os dados são simulados. Em produção só entram fontes oficiais ou licenciadas, depois de IT e Compliance.");
s.addNotes("Na versão ligada, os dados vêm sobretudo de fontes públicas oficiais: as bibliotecas de anúncios da Meta, Google, TikTok e LinkedIn, preços publicados e notícias. Os dados de pesquisa paga vêm das contas do próprio cliente, com autorização. O investimento em meios tradicionais vem de uma fonte licenciada. Nenhuma está ligada ainda; os termos de uso estão a validar com Compliance.");

// =========================================================== 15. Regras
s = slide("Dados e regras", "Regras que não mudam");
const regras = [["A plataforma sugere, a equipa decide", "O Radar dá informação e pistas. Ativar respostas e o que se leva ao cliente é sempre decisão da equipa."],
                ["Nada chega ao cliente sozinho", "O que sai para o cliente é decidido pela equipa e assinado pela Arena, sem autoria individual."],
                ["Cada dado tem origem", "Real, estimado ou demonstração, com selo em cada página e o método dos estimados à vista."],
                ["Os dados do cliente ficam na agência", "Plano de meios e dados de pesquisa paga nunca vão para repositórios nem para modelos de IA."],
                ["Só marcas fictícias na demonstração", "Nenhum cliente ou concorrente real aparece com dados inventados."],
                ["Tudo documentado", "Decisões, fontes, riscos e perguntas em aberto no dossier, para a direção, o IT e o Compliance."]];
const rw = (CW - 0.6) / 3;
regras.forEach(([t, b], i) => bloco(s, M + (i % 3) * (rw + 0.3), 1.5 + Math.floor(i / 3) * 2.6, rw, 2.35, t, b, { ft: 16, dy: 1.0, fb: 13 }));
s.addNotes("Seis regras de base. A plataforma sugere e a equipa decide. Nada chega ao cliente sem decisão da equipa. Cada dado diz a sua origem. Os dados do cliente nunca saem do ambiente da agência. Na demonstração só se usam marcas fictícias. E tudo o que é técnico ou de dados está documentado no dossier, porque o grupo tem regras exigentes de governação.");

// =========================================================== 16. Onde estamos
pres.addSection({ title: "Estado" });
s = slide("Estado", "Onde estamos e o que vem a seguir");
const EST = { ok: ["Feito", TINT.ok, TINT.okInk], wip: ["Em curso", TINT.wip, TINT.wipInk], todo: ["Por fazer", TINT.todo, TINT.todoInk] };
const est = [["ok", "Conceito e protótipo de demonstração"], ["wip", "Movimentos, previsões e choques: métodos prontos, por provar com dados reais"],
             ["wip", "Resumo e classificação por IA: por regras na demonstração"], ["todo", "Recolha de dados reais e dados do cliente"], ["todo", "Partilha entre a equipa e stack de produção, com o IT"]];
est.forEach(([e, t], i) => {
  const y = 1.55 + i * 0.95;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M, y, w: 1.35, h: 0.42, rectRadius: 0.21, fill: { color: EST[e][1] }, line: { color: EST[e][1], width: 0 }, objectName: "estado " + (i + 1) });
  txt(s, EST[e][0], { x: M, y, w: 1.35, h: 0.42, fontSize: 12, bold: true, align: "center", valign: "middle", color: EST[e][2] });
  txt(s, t, { x: M + 1.6, y: y - 0.04, w: 4.6, h: 0.75, fontSize: 13, color: C.text1 });
});
const xs = 7.15, ws = W - M - xs;
[["Teste com dados reais", "2 semanas", "1 vertical, cerca de 6 marcas, só fontes públicas. Que parte dos movimentos vemos, com que atraso e qualidade."],
 ["Piloto", "6 semanas", "Uma equipa de conta: 3 semanas em modo sombra, 3 em uso, com respostas combinadas com o cliente."],
 ["Versão ligada", "se o piloto provar valor", "Recolha automática, partilha entre a equipa e stack decidido com o IT."]]
  .forEach(([t, q, b], i) => {
    const y = 1.5 + i * 1.7, escuro = i === 0;
    card(s, xs, y, ws, 1.5, t, escuro ? C.text1 : undefined);
    txt(s, q, { x: xs + 0.3, y: y + 0.18, w: ws - 0.6, h: 0.3, fontSize: 11, bold: true, color: escuro ? C.background2 : C.text2 });
    txt(s, t, { x: xs + 0.3, y: y + 0.45, w: ws - 0.6, h: 0.4, fontSize: 16, bold: true, color: escuro ? C.background1 : C.text1 });
    txt(s, b, { x: xs + 0.3, y: y + 0.88, w: ws - 0.6, h: 0.55, fontSize: 12, color: escuro ? C.background2 : C.text2 });
  });
s.addNotes("Estado: o conceito e o protótipo estão feitos. Os métodos de deteção, importância, previsões e choques funcionam com dados simulados e falta prová-los com dados reais. O próximo passo proposto é um teste de duas semanas com fontes públicas; se correr bem, um piloto de seis semanas com uma equipa de conta; e só depois a versão ligada.");

// =========================================================== 17. Fecho
s = pres.addSlide({ masterName: "FECHO", sectionTitle: "Estado" });
s.addText("Ver primeiro. Perceber o padrão. Responder depressa.", { placeholder: "title" });
[["Ver a demonstração", "No protótipo, o botão «Demonstração» faz o percurso em 7 passos: o que mexeu, a prova, o resumo, o que vem aí, o choque com o plano, as respostas e a Torre."],
 ["Ler mais", "Especificação em docs/11-v4-radar-de-movimentos.md. Decisões, fontes, riscos e perguntas em aberto no dossier (docs/dossier/)."],
 ["Falar connosco", "David, Senior Account/Media Manager, Arena Media Portugal."]]
  .forEach(([t, b], i) => {
    const y = 2.35 + i * 1.35;
    num(s, M, y, i + 1, true);
    txt(s, t, { x: M + 0.7, y: y - 0.03, w: 8.9, h: 0.45, fontSize: 19, bold: true, color: C.background1 });
    txt(s, b, { x: M + 0.7, y: y + 0.45, w: 8.9, h: 0.75, fontSize: 13, color: C.background2 });
  });
radar(s, 11.6, 4.0, 0.8);
s.addNotes("Para ver o Radar a funcionar, o protótipo tem um percurso guiado de sete passos. A especificação completa e o dossier de governação estão no repositório do projeto.");

escrever(OUT);
