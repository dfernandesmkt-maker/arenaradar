# CLAUDE.md — Arena Radar

Lê este ficheiro antes de qualquer tarefa. Depois lê `docs/00-ponto-de-situacao.md` e `docs/05-backlog.md`.

## Quem e o quê
- Owner: David, Senior Account/Media Manager na Arena Media Portugal (Havas Media Network).
- Arena Radar: produto interno de inteligência de mercado que aponta pistas de ação de meios à equipa de conta. Ainda não foi apresentado à direção.
- Objetivo imediato: ponto de situação para a direção, com uma versão exemplo para a Sociedade Ponto Verde (SPV).

## Idioma e tom
- Português europeu (PT-PT, Acordo Ortográfico), sempre. Nunca português do Brasil.
- Números: vírgula decimal, espaço como separador de milhares (ex.: 233 065 t; 60,5%).
- Tratar o David por "tu". Respostas diretas, sem preâmbulo.
- Validar a direção antes de construir peças grandes: propõe o plano, espera confirmação, depois executa.

## Documentação e governação
- O dossier em `docs/dossier/` é a fonte única de verdade para direção, IT e compliance. Manter sempre atualizado quando algo mudar (decisões, fontes, riscos, perguntas em aberto).
- Nunca marcar como `Confirmado` o que não foi validado pela entidade responsável. Na dúvida, `Por confirmar`.
- O grupo Havas tem governança e compliance exigentes: tudo o que for técnico ou de dados tem de estar documentado.

## Regra de ouro: dados
0. Dois regimes de fontes. **Demonstração:** pode usar as fontes necessárias para mostrar o potencial, incluindo não oficiais, sempre etiquetadas. **Produção:** só fontes oficiais ou licenciadas, após aprovação de IT e Compliance. Nunca misturar os dois regimes sem etiquetar.
1. Nenhum número inventado apresentado como real. Cada dado tem `origem`: `real`, `estimado` ou `demo`.
2. Dado `real` tem sempre `fonte` (emissor identificado) e `data_recolha`.
3. Dado `estimado` explica o método num campo `metodo`.
4. Dado `demo` nunca é atribuído a uma entidade terceira real (Novo Verde, Electrão, SDR Portugal, etc.). Para terceiros: dado real ou nada.
5. A interface mostra a origem de cada dado (etiqueta visível + fonte ao passar o cursor). *Proposta D27, por confirmar: um selo de dados por página (Demonstração, Real ou Misto) com o detalhe ao abrir e em cada número. Até o David confirmar, mantêm-se as etiquetas por bloco.*
6. Dados internos de clientes (ex.: utilização do chatbot ELO) ficam em `data/raw/internal/`, que está no `.gitignore`. Nunca fazer commit destes dados.

## Marca Arena Media
- Tipografia: **Inter em todo o Radar** (decisão do David, D22), incluindo apresentações e documentos do Radar. As Brand Guidelines indicam Poppins; a exceção é do Radar e está por validar com Marketing/Brand (Q08). Os restantes materiais da Arena seguem as Brand Guidelines (Poppins em PowerPoint; Arial Nova em Word e Excel).
- Cores: Guerrilla Forest `#0F2623`, Arena Blue `#328CF5`, Arena Yellow `#FFDC32`. Apoio usado no protótipo v2: verde `#00B89B`, vermelho `#E60000`, roxo `#733478`.
- Logo oficial: `assets/arena_media_portugal_logo.jpg`. Nunca recriar o logo em SVG ou CSS.
- Direção visual (out. 2026): tema **claro** por defeito, cores Arena, modo escuro opcional (para apresentações). Aspeto SaaS atual, limpo, com muito espaço.
- **Tema por cliente:** todas as cores vêm de tokens (`config/themes/*.json`) lidos como variáveis CSS. Um tema de cliente só altera as cores de marca. Validar contraste WCAG AA antes de aceitar um tema. Nunca escrever cores diretamente nos componentes.
- **Inter em tudo** (variável, servida localmente, pilha de sistema como fallback), números com `tabular-nums`. Não carregar fontes nem bibliotecas de CDNs externos: tudo empacotado. Pesos por função:
  - Títulos de página e de ecrã: 650, tracking −0,02em.
  - Títulos de secção e de cartão (h2/h3): 600.
  - Corpo e descrições: 400.
  - Etiquetas, navegação, cabeçalhos de tabela: 500 (item ativo 600).
  - Botões e badges de proveniência: 600.
  - Números grandes (KPIs): 700, `tabular-nums`.
  - Evitar pesos abaixo de 400 e acima de 700.
- Documentos Word: logo no cabeçalho, rodapé paginado.

## Direção do produto (out. 2026)
- Produto para **todos os clientes da Arena**, não para um cliente. Ferramenta da agência, também pensada para o futuro da inovação com IA na casa.
- **Torre de controlo da concorrência** em três níveis: Agência → Vertical → Cliente. Cada vertical tem um conjunto de concorrentes por defeito (`config/verticals/`); o cliente herda e ajusta. O Radar sugere concorrentes e a equipa aceita ou recusa.
- Posicionamento face à Research: **complementar**. O Radar vigia de forma contínua e leve e aponta onde vale a pena aprofundar; a Research valida e aprofunda.
- Consulta fluida: ecrã inicial com o que mudou esta semana (número-herói + 3 sinais), barra "Pergunta ao Radar" com respostas em cartões com gráfico e fonte.
- **Motion com propósito** (nunca decorativo): varredura de radar de ~1,5 s só na primeira entrada; gráficos que se desenham; contagem de números; cartões em cascata; transição contínua sinal → leitura → pista; seletor de semanas que anima os concorrentes; destaque cruzado entre gráficos. Respeitar `prefers-reduced-motion`.
- Critério do "wow": o primeiro ecrã tem de dizer logo algo útil. O movimento explica, não decora.
- Nada disto está fechado. Itens em `docs/05-backlog.md`, secção "Evolução do produto".

- **Duas vistas, Equipa e Cliente (D26, ajusta a D23).** Os mesmos dados servem a agência e o cliente. A vista Cliente é reporting limpo e só mostra o que a equipa publicou. Especificação em `docs/08-especificacao-ux.md`; navegação com seletor de âmbito e menu único (D28).
- **Leitura tipo dashboard de reporting.** Cada página segue a ordem filtros → KPIs → o que mudou → gráfico principal → detalhe (ver `docs/08`).
- **Pontos de ligação (D29).** Onde uma fonte real entra no código, deixar um comentário `LIGAÇÃO[<id>]` e atualizar `docs/09-pontos-de-ligacao.md`. Listar com `grep -rn "LIGAÇÃO\[" prototype/src scripts`.
- **Uso interno primeiro (D23, ajustada por D26).** O foco é a visão do mercado e da concorrência por vertical e cliente: o que os concorrentes anunciam (Meta, Google, YouTube, TikTok), criativos, formatos, mensagens, campanhas, investimento estimado e quota de voz. As pistas de ação servem Performance, Brand e Account; levar algo ao cliente é opcional e secundário.
- **Fontes como módulos (D25).** Cada fonte é um módulo em «Fontes de dados». Importações CSV passam pela validação de proveniência.
- **Gráficos:** SVG próprio, cores categóricas fixas por marca (validadas para daltonismo), rampa azul ordinal para plataformas e formatos, dica ao passar o cursor, vista em tabela e navegação por teclado. Código em `prototype/src/competition.js`.

## Conceito (resumo; detalhe em `docs/02-produto.md`)
- Três camadas: **Observar** (o que mudou), **Ler** (o que significa), **Pistas de ação** (o que podemos fazer).
- **Princípio central: a plataforma sugere, a equipa decide.** O Radar dá informação e pistas de ação; a decisão e o que se leva ao cliente são sempre da equipa. Nunca escrever interfaces ou textos em que a plataforma "recomenda ao cliente" ou decide sozinha.
- Três modos de entrega: alertas só para eventos materiais; briefing semanal à segunda-feira; pedidos pontuais.
- Nada chega ao cliente automaticamente. Se a equipa decidir partilhar uma ação, ela sai assinada pela Arena, sem autoria individual.
- Módulo **Impacto**: segue cada pista do sinal até à decisão da equipa e ao resultado observado.
- Agnóstico ao cliente: tudo o que é específico vive em `config/clients/<cliente>.yaml`.
- Evitar a palavra "preditivo". Usar "antecipação acionável".

## Stack
- Protótipo: HTML único, autocontido (CSS e JS inline), abre no browser sem servidor.
- Recolha de dados: Python 3.11+, scripts em `scripts/`, saída em CSV/JSON com colunas de proveniência.
- Stack de produção por decidir com o IT (Microsoft Power BI / Copilot Studio / Power Automate vs. outro). Manter dados em formatos simples (CSV/JSON) para migrar sem retrabalho.

## Convenções
- Protótipos: `prototype/arena-radar-v2.html` (referência da versão de junho, não editar; recuperar manualmente), `prototype/arena-radar-v3-preview.html` (pré-visualização atual, ponto de partida visual da v3). A fonte é `prototype/src/preview.template.html`; gerar com `python3 prototype/build_preview.py`. Não editar o HTML gerado à mão.
- Um commit por tarefa do backlog, mensagem em PT-PT com o ID (ex.: `RB-03 etiquetas de proveniência`).
- Antes de dar uma tarefa por concluída: abrir o HTML, verificar consola sem erros, confirmar que nenhum dado sem origem aparece na interface.
