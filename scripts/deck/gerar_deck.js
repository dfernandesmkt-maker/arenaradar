/* Deck da direção (RB-11): deliverables/arena-radar-direcao.pptx
   Guião: anexo de docs/00-ponto-de-situacao.md. Capturas: node scripts/deck/capturas.js (RB-10).
   Poppins (D55, Brand Guidelines para PowerPoint), cores Arena, logo oficial, notas do orador em todos os slides.
   Uso: (cd scripts/deck && npm install) && node scripts/deck/gerar_deck.js */
const path = require("path");
const { novoDeck, ROOT } = require("./comum");
const OUT = path.join(ROOT, "deliverables/arena-radar-direcao.pptx");
const RODAPE = "Arena Radar · Ponto de situação para a direção · Outubro 2026";
const { pres, C, TINT, W, M, DEMO, txt, card, num, legenda, img, contorno, radar, escrever } =
  novoDeck({ titulo: "Arena Radar — Ponto de situação", rodape: RODAPE, capa: "Ponto de situação para a direção · Outubro 2026" });

// ---------- 1. Capa
pres.addSection({ title: "Abertura" });
let s = pres.addSlide({ masterName: "CAPA", sectionTitle: "Abertura" });
s.addText("Arena Radar", { placeholder: "title" });
s.addText("Ver primeiro. Perceber o padrão. Responder depressa.", { placeholder: "body" });
radar(s, 11.5, 3.75);
s.addNotes("Abrir com a ideia central: o Radar existe para pôr a equipa de conta à frente da concorrência dos clientes. Três verbos: ver primeiro, perceber o padrão, responder depressa. Tudo o que vão ver hoje usa clientes e marcas fictícios; não há dados reais nesta fase. No fim peço quatro decisões concretas.");

// ---------- 2. O problema
pres.addSection({ title: "Contexto" });
s = pres.addSlide({ masterName: "CONTEUDO", sectionTitle: "Contexto" });
s.addText("Os dados são públicos; ver a tempo não é", { placeholder: "title" });
const prob = [
  ["Os clientes querem antecipação", "Esperam que a agência antecipe os movimentos da concorrência, não que os relate no fim do mês."],
  ["Não cabe no tempo das equipas", "Seguir a concorrência de forma contínua não cabe no dia a dia das equipas de conta. Hoje é pontual e manual."],
  ["O diferencial mudou", "Bibliotecas de anúncios, preços publicados e notícias estão ao alcance de todos. Conta ver a tempo e saber o que fazer."],
];
prob.forEach(([t, b], i) => {
  const pw = (W - 2 * M - 0.6) / 3, x = M + i * (pw + 0.3);
  card(s, x, 1.65, pw, 3.55, "problema " + (i + 1));
  num(s, x + 0.35, 2.0, i + 1);
  txt(s, t, { x: x + 0.35, y: 2.7, w: pw - 0.7, h: 0.9, fontSize: 21, bold: true });
  txt(s, b, { x: x + 0.35, y: 3.65, w: pw - 0.7, h: 1.4, fontSize: 15, color: C.text2 });
});
txt(s, "O Radar não vende vigilância. Vende tempo: saber antes, com prova, e já com uma resposta combinada.", { x: M, y: 5.65, w: W - 2 * M, h: 0.5, fontSize: 17, italic: true });
s.addNotes("Três factos, sem números inventados. O primeiro é a expectativa do cliente. O segundo é a capacidade da equipa. O terceiro é o que mudou no mercado: os dados de anúncios passaram a ser públicos (Meta Ad Library, Google Ads Transparency, TikTok), por isso a vantagem já não está em ter os dados, está em vê-los a tempo e saber o que fazer.");

// ---------- 3. A resposta
pres.addSection({ title: "O produto" });
s = pres.addSlide({ masterName: "CONTEUDO", sectionTitle: "O produto" });
s.addText("O movimento da concorrência é o centro do Radar", { placeholder: "title" });
const cx = 4.89, cy = 2.05, cw = 3.55, ch = 2.2;
const attrs = [["Prova", "Criativos, série de preço, dados de pesquisa"], ["Porque importa", "Pontos explicados, nunca uma caixa negra"],
               ["O que vem a seguir", "O que a marca costuma fazer, pelo seu histórico"], ["Resposta combinada", "O que está acordado com o cliente; a equipa ativa"]];
attrs.forEach(([t, b], i) => {
  const x = i < 2 ? M : W - M - 3.7, y = i % 2 ? 3.2 : 1.6;
  s.addShape(pres.shapes.LINE, { x: i < 2 ? x + 3.7 : cx + cw, y: y + 0.6, w: i < 2 ? cx - (x + 3.7) : x - (cx + cw), h: (cy + ch / 2) - (y + 0.6), flipV: false, line: { color: TINT.line, width: 1.25 }, objectName: "ligação " + t });
  card(s, x, y, 3.7, 1.2, "atributo " + t);
  txt(s, t, { x: x + 0.3, y: y + 0.2, w: 3.1, h: 0.4, fontSize: 17, bold: true });
  txt(s, b, { x: x + 0.3, y: y + 0.6, w: 3.1, h: 0.5, fontSize: 13, color: C.text2 });
});
card(s, cx, cy, cw, ch, "movimento", C.text1);
txt(s, "MOVIMENTO", { x: cx + 0.3, y: cy + 0.3, w: cw - 0.6, h: 0.3, fontSize: 12, bold: true, color: C.background2, charSpacing: 1.5 });
txt(s, "«A Kaldo baixou 8 cêntimos por litro ao fim de semana»", { x: cx + 0.3, y: cy + 0.7, w: cw - 0.6, h: 1.3, fontSize: 19, bold: true, color: C.background1 });
const areas = [["Agora", "O que mexeu?"], ["Concorrentes", "Como age cada marca?"], ["Comparar", "Quem pesa mais?"], ["Antecipar", "O que vem aí?"], ["Respostas", "Estamos prontos?"]];
const aw = (W - 2 * M - 4 * 0.2) / 5;
areas.forEach(([t, q], i) => {
  const x = M + i * (aw + 0.2);
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 5.1, w: aw, h: 1.15, rectRadius: 0.1, fill: { color: C.background1 }, line: { color: TINT.line, width: 1 }, objectName: "área " + t });
  txt(s, t, { x: x + 0.25, y: 5.28, w: aw - 0.5, h: 0.4, fontSize: 17, bold: true });
  txt(s, q, { x: x + 0.25, y: 5.7, w: aw - 0.5, h: 0.4, fontSize: 13, color: C.text2 });
});
legenda(s, M, 6.4, 8, "Mais a Torre (todos os clientes da agência) e as Fontes. A plataforma sugere; a equipa decide.");
s.addNotes("O objeto central é o movimento: algo que um concorrente fez e que se pode provar. Cada movimento traz quatro coisas: a prova, porque é importante (com os pontos explicados), o que a marca costuma fazer a seguir e se já há uma resposta combinada com o cliente. Em baixo, as cinco áreas da plataforma, cada uma responde a uma pergunta da equipa de conta.");

// ---------- 4. Agora
pres.addSection({ title: "Demonstração" });
s = pres.addSlide({ masterName: "CONTEUDO", sectionTitle: "Demonstração" });
s.addText("Segunda-feira: o que mexeu, com prova", { placeholder: "title" });
const iw4 = 7.7, ih4 = iw4 / 1.6;
img(s, "agora.png", M, 1.5, iw4, ih4, "Captura do ecrã Agora");
contorno(s, M, 1.5, iw4, ih4);
legenda(s, M, 1.5 + ih4 + 0.1, iw4, DEMO);
const pts4 = [["O mais importante no topo", "O primeiro ecrã diz logo o que importa e quantos movimentos têm resposta pronta."],
              ["Prova e porquê num clique", "Criativos, série de preço e a soma de pontos que explica a importância."],
              ["O resumo já vem escrito", "Em 30 segundos, decisões para a equipa e rascunho de email. Fica por rever."]];
pts4.forEach(([t, b], i) => {
  const y = 1.55 + i * 1.6;
  num(s, 8.75, y, i + 1);
  txt(s, t, { x: 9.4, y: y - 0.02, w: 3.33, h: 0.5, fontSize: 17, bold: true });
  txt(s, b, { x: 9.4, y: y + 0.5, w: 3.33, h: 0.95, fontSize: 14, color: C.text2 });
});
s.addNotes("Exemplo com o cliente fictício Vetra, de combustíveis. Na segunda-feira, o Radar abre com o movimento mais importante da semana: a Kaldo, concorrente fictício, baixou 8 cêntimos por litro ao fim de semana. Um clique mostra a prova (os criativos e a série de preço) e porque é importante. O resumo da semana já vem escrito; a equipa revê e decide. Se houver tempo, mostrar ao vivo com o botão Demonstração.");

// ---------- 5. Antecipar
s = pres.addSlide({ masterName: "CONTEUDO", sectionTitle: "Demonstração" });
s.addText("Ver o que vem aí, e o choque com o nosso plano", { placeholder: "title" });
const ih5 = 3.05, iw5 = ih5 * (2288 / 638);
img(s, "antecipar.png", M, 1.45, iw5, ih5, "Captura das próximas 12 semanas");
contorno(s, M, 1.45, iw5, ih5);
legenda(s, M, 1.45 + ih5 + 0.08, W - 2 * M, DEMO + " Tracejado: o esperado pelo histórico. Última linha: o plano da Vetra.");
const y5 = 1.45 + ih5 + 0.5, w5 = (W - 2 * M - 0.3) / 2, h5 = 6.7 - y5;
[["Sinal precoce", "A Zefira começou a testar criativos com pouco alcance. No histórico, isso antecede a campanha de inverno: a equipa prepara a resposta antes."],
 ["Choque com o plano", "A «Semana do Preço Certo» da Vetra cai na semana da Black Friday que a Kaldo faz todos os anos, no mesmo território. Ainda há tempo para mudar."]].forEach(([t, b], i) => {
  const x = M + i * (w5 + 0.3);
  card(s, x, y5, w5, h5, t);
  if (i === 1) s.addShape(pres.shapes.OVAL, { x: x + 0.3, y: y5 + 0.33, w: 0.16, h: 0.16, fill: { color: C.accent2 }, line: { color: C.text1, width: 1 }, objectName: "marca de sinal" });
  txt(s, t, { x: x + (i === 1 ? 0.58 : 0.3), y: y5 + 0.22, w: w5 - 0.9, h: 0.4, fontSize: 17, bold: true });
  txt(s, b, { x: x + 0.3, y: y5 + 0.66, w: w5 - 0.6, h: h5 - 0.8, fontSize: 14, color: C.text2 });
});
s.addNotes("Antecipar mostra as próximas 12 semanas. As janelas a tracejado vêm do histórico de cada marca: a mesma campanha na mesma altura do ano, o ritmo das promoções. Dois exemplos: a Zefira já está a testar criativos, o que no passado antecedeu a campanha de inverno; e o nosso próprio plano tem uma campanha de preço na semana em que a Kaldo costuma fazer Black Friday. É antecipação acionável, com método e confiança visíveis, não adivinhação.");

// ---------- 6. A equipa decide
s = pres.addSlide({ masterName: "CONTEUDO", sectionTitle: "Demonstração" });
s.addText("A plataforma sugere, a equipa decide", { placeholder: "title" });
const ih6 = 4.95, iw6 = ih6 * (1572 / 1494);
img(s, "resumo.png", M, 1.5, iw6, ih6, "Captura do resumo da semana");
contorno(s, M, 1.5, iw6, ih6);
legenda(s, M, 1.5 + ih6 + 0.08, W - 2 * M, DEMO);
const x6 = M + iw6 + 0.6, w6 = W - M - x6;
[["Texto da IA sempre por rever", "O resumo e a classificação dos criativos podem ser feitos por IA. Ficam «por rever» até alguém da equipa os rever."],
 ["Nada sai sozinho", "O email para o cliente só se copia depois de revisto e sai assinado pela Arena. A plataforma nunca fala com o cliente."],
 ["Respostas combinadas de antemão", "O que fazer em cada tipo de movimento fica acordado com o cliente. Quando acontece, a equipa decide ativar."]].forEach(([t, b], i) => {
  const y = 1.55 + i * 1.62;
  num(s, x6, y, i + 1);
  txt(s, t, { x: x6 + 0.65, y: y - 0.02, w: w6 - 0.65, h: 0.5, fontSize: 17, bold: true });
  txt(s, b, { x: x6 + 0.65, y: y + 0.5, w: w6 - 0.65, h: 0.95, fontSize: 14, color: C.text2 });
});
s.addNotes("Governação desde o início. O texto que a IA escreve fica sempre por rever, e o email só se copia depois de revisto. Ao modelo só seguem dados públicos sobre concorrentes, nunca dados internos do cliente. Na demonstração, este trabalho é feito por regras; o uso de IA real depende de IT e Compliance (pergunta Q13). As respostas são combinadas com o cliente de antemão; ativar é sempre decisão da equipa.");

// ---------- 7. Onde estamos
pres.addSection({ title: "Estado e proposta" });
s = pres.addSlide({ masterName: "CONTEUDO", sectionTitle: "Estado e proposta" });
s.addText("Protótipo completo; dados reais por provar", { placeholder: "title" });
const EST = { ok: ["Feito", TINT.ok, TINT.okInk], wip: ["Em curso", TINT.wip, TINT.wipInk], todo: ["Por fazer", TINT.todo, TINT.todoInk] };
const linhas = [
  ["Conceito e estrutura", "ok", "Especificação fechada para esta fase"],
  ["Protótipo de demonstração", "ok", "2 clientes fictícios, roteiro, telemóvel, contraste AA"],
  ["Deteção, previsões e choques", "wip", "Métodos prontos; por provar com dados reais"],
  ["Resumo e classificação por IA", "wip", "Por regras na demonstração; IA depende de IT e Compliance"],
  ["Recolha de dados reais", "todo", "Pontos de entrada marcados; termos de uso por validar"],
  ["Dados do cliente (pesquisa, plano)", "todo", "Com autorização do cliente; ficam na agência"],
  ["Partilha na equipa e stack", "todo", "Decisão com o IT"],
];
const hdr = o => Object.assign({ bold: true, color: C.background1, fill: { color: C.text1 }, fontSize: 13 }, o);
const rows = [[{ text: "Componente", options: hdr() }, { text: "Estado", options: hdr() }, { text: "Nota", options: hdr() }]].concat(linhas.map(([a, e, n]) => [
  { text: a, options: { fontSize: 14, bold: true, color: C.text1 } },
  { text: EST[e][0], options: { fontSize: 13, bold: true, color: EST[e][2], fill: { color: EST[e][1] } } },
  { text: n, options: { fontSize: 13, color: C.text2 } },
]));
s.addTable(rows, { x: M, y: 1.5, w: W - 2 * M, colW: [4.6, 1.5, W - 2 * M - 6.1], rowH: 0.6, valign: "middle", margin: [0, 0.15, 0, 0.15], border: { type: "solid", pt: 0.75, color: TINT.line }, objectName: "estado por componente" });
legenda(s, M, 6.45, W - 2 * M, "Detalhe em docs/00-ponto-de-situacao.md e no dossier (docs/dossier/).");
s.addNotes("Estado honesto. O conceito e o protótipo estão feitos. A deteção de movimentos, a importância, as previsões e os choques estão feitos com dados simulados: os métodos são os que vamos usar com dados reais, mas ainda não foram provados. A IA está preparada e depende de IT e Compliance. Faltam a recolha de dados reais, os dados do cliente e a decisão de stack com o IT.");

// ---------- 8. A proposta
s = pres.addSlide({ masterName: "CONTEUDO", sectionTitle: "Estado e proposta" });
s.addText("Provar com dados reais antes de investir", { placeholder: "title" });
const fases = [["Teste real", "2 semanas", "1 vertical, cerca de 6 marcas, só fontes públicas. Que parte dos movimentos vemos, com que atraso e qualidade."],
               ["Piloto em sombra", "semanas 1 a 3", "O Radar corre; a equipa compara com o que já sabia e regista o que viu primeiro."],
               ["Piloto em uso", "semanas 4 a 6", "Resumo de segunda-feira revisto e respostas combinadas com o cliente."],
               ["Decisão", "semana 7", "Avançar para a versão ligada, ajustar ou parar."]];
const fw = (W - 2 * M - 3 * 0.25) / 4;
fases.forEach(([t, q, b], i) => {
  const x = M + i * (fw + 0.25), escuro = i === 3;
  card(s, x, 1.5, fw, 2.55, "fase " + (i + 1), escuro ? C.text1 : C.background2);
  txt(s, q, { x: x + 0.28, y: 1.72, w: fw - 0.56, h: 0.3, fontSize: 12, bold: true, color: escuro ? C.background2 : C.text2 });
  txt(s, t, { x: x + 0.28, y: 2.02, w: fw - 0.56, h: 0.4, fontSize: 18, bold: true, color: escuro ? C.background1 : C.text1, fit: "none" });
  txt(s, b, { x: x + 0.28, y: 2.5, w: fw - 0.56, h: 1.45, fontSize: 13, color: escuro ? C.background1 : C.text2 });
  if (i < 3) s.addShape(pres.shapes.CHEVRON, { x: x + fw + 0.065, y: 2.66, w: 0.12, h: 0.24, fill: { color: C.text2 }, line: { color: C.text2, width: 0 }, objectName: "seta " + (i + 1) });
});
txt(s, "Critérios de sucesso do piloto (proposta, a validar)", { x: M, y: 4.4, w: 8, h: 0.4, fontSize: 17, bold: true });
const crit = [["≥ 50%", "dos movimentos considerados relevantes pela equipa"], ["≥ 1", "vez em que a equipa soube ou agiu mais cedo (registada)"],
              ["≤ 1 h", "por semana para rever o resumo, na semana 6"], ["≥ 3", "respostas combinadas com o cliente"]];
crit.forEach(([n, t], i) => {
  const x = M + i * (fw + 0.25);
  txt(s, n, { x, y: 4.9, w: fw, h: 0.75, fontSize: 40, bold: true, color: C.text1 });
  txt(s, t, { x, y: 5.7, w: fw - 0.1, h: 0.75, fontSize: 13, color: C.text2 });
});
s.addNotes("A recomendação é provar antes de investir. Primeiro um teste de duas semanas com dados reais, só de fontes públicas, para medir se vemos os movimentos que importam. Se passar, um piloto de seis semanas com uma equipa de conta: três em modo sombra, três em uso, e decisão na semana sete. Investimento: o meu tempo (estimativa de 3 a 4 horas por semana) e o de uma equipa de conta no piloto. Os critérios são propostas, a validar convosco.");

// ---------- 9. O pedido
pres.addSection({ title: "Decisão" });
s = pres.addSlide({ masterName: "FECHO", sectionTitle: "Decisão" });
s.addText("Quatro decisões", { placeholder: "title" });
const ped = [["Aprovar o teste de dados reais de 2 semanas", "Fontes públicas, com Compliance a validar os termos de uso (Q10)."],
             ["Aprovar o piloto de 6 semanas, se o teste passar", "E escolher a equipa de conta e o cliente."],
             ["Encaminhar para IT e Compliance as perguntas que decidem a versão ligada", "Uso de IA (Q13), dados de pesquisa paga dos clientes (Q12), processo de aprovação (Q01), ambiente (Q02)."],
             ["Acesso a uma fonte licenciada de investimento", "Marktest ou equivalente para o vertical do teste, se já existir no grupo (Q11)."]];
ped.forEach(([t, b], i) => {
  const y = 1.85 + i * 1.18;
  num(s, M, y, i + 1, true);
  txt(s, t, { x: M + 0.7, y: y - 0.03, w: 11.2, h: 0.45, fontSize: 20, bold: true, color: C.background1 });
  txt(s, b, { x: M + 0.7, y: y + 0.45, w: 11.2, h: 0.5, fontSize: 14, color: C.background2 });
});
s.addNotes("Fechar com as quatro decisões. As duas primeiras são da direção: o teste e, se passar, o piloto, com a escolha da equipa e do cliente. A terceira é encaminhar as perguntas que bloqueiam a versão ligada para quem as pode responder. A quarta só se aplica se o grupo já tiver uma fonte licenciada de investimento. Oferecer a demonstração ao vivo no fim.");

escrever(OUT);
