# Arena Radar — Backlog

Prioridades: **P0** antes da reunião com a direção · **P1** materiais da reunião · **P2** só se o piloto for aprovado · **Futuro**.
Cada tarefa = um commit com o ID.

## P0 — Protótipo v3 SPV

### RB-01 · Recuperar o protótipo v2 *(manual, David)*
Descarregar o `arena-radar.html` da conversa de junho no claude.ai e guardar como `prototype/arena-radar-v2.html`. Guardar o documento estratégico de abril em `docs/legacy/`.
**Aceitação:** ficheiros no repositório; v2 abre no browser.

### RB-02 · Criar a v3 e trocar o logo
Copiar v2 para `prototype/arena-radar-v3-spv.html`. Substituir o logo recriado pelo oficial (`assets/arena_media_portugal_logo.jpg`, embebido em base64 para o HTML continuar autocontido).
**Aceitação:** nenhum logo desenhado em SVG/CSS; o oficial aparece nítido na sidebar e no rodapé.

### RB-02b · Reenquadrar "Recomendar" como "Pistas de ação"
Renomear a camada e o ecrã. Cartões passam a "ação possível", com botões **Aceitar**, **Ajustar**, **Descartar**, e um passo separado e opcional **Levar ao cliente**. Retirar da interface qualquer texto em que a plataforma recomenda ao cliente. Atualizar o módulo Impacto aos novos estados (ver `docs/02-produto.md`).
**Aceitação:** a palavra "recomenda" não aparece na interface como ação da plataforma; o fluxo mostra claramente que a decisão é da equipa.

### RB-03 · Etiquetas de proveniência
Componente reutilizável `badge-origem` com três estados: **Real** (verde), **Estimado** (âmbar), **Demo** (cinzento tracejado). Ao passar o cursor mostra fonte, data de recolha e método. Aplicar a todos os KPIs, gráficos, tabelas e cartões.
**Aceitação:** zero números na interface sem etiqueta; a faixa global "dados de demonstração" da v2 é substituída por etiquetas por componente.

### RB-04 · Cliente SPV por defeito
SPV no seletor, como cliente ativo. Clientes fictícios (Lumio, Vael, Kob) ocultos por defeito, acessíveis num interruptor "mostrar clientes demo". Nome, universo e pesquisas lidos de um objeto JSON embebido, gerado a partir de `config/clients/spv.yaml`.
**Aceitação:** nenhum dado demo atribuído a Novo Verde, Electrão ou SDR Portugal.

### RB-05 · Camada Observar adaptada à SPV
Substituir a lógica "concorrentes / share of voice" por quatro blocos: **Procura e dúvidas** (Trends por cluster), **Voz no tema** (anúncios ativos por entidade e mensagem), **Agenda** (notícias por tema), **Utilização ELO** (demo até haver autorização). Manter o heatmap, mas como entidades × canais observados.
**Aceitação:** os quatro blocos com dados etiquetados; as hipóteses H1–H3 aparecem em Ler como "hipótese", não como conclusão.

### RB-06 · Ecrã "Briefing de segunda-feira"
Nova entrada na navegação. Pré-visualização do email interno para a equipa (largura 600 px, marca Arena): O que mudou · O que significa · Pistas de ação. Versão cliente opcional, gerada só com as pistas que a equipa aceitou. Botão "Exportar PDF" via `window.print()` com CSS de impressão.
**Aceitação:** cabe numa página A4; inclui o estado "sem sinais materiais esta semana".

### RB-07 · Limiares visíveis e estado vazio
Mostrar em Observar o limiar de cada bloco (de `04-dados-e-fontes.md`). Quando nada ultrapassa o limiar: mensagem clara, não ecrã vazio.
**Aceitação:** é possível simular a semana sem sinais através de um interruptor.

### RB-08 · Modo direção
Interruptor que esconde ⌘K, skeletons e animações acessórias, aumenta a tipografia e deixa quatro ecrãs: Visão geral, Observar, Briefing, Impacto.
**Aceitação:** percorrível em 3 minutos numa reunião, sem cliques perdidos.

### RB-09 · Ligar dados reais ao protótipo
Criar `scripts/build_dataset.py`: lê `data/raw/**`, agrega por semana e gera `data/processed/spv.json` com proveniência. Um passo de build injeta o JSON no HTML v3.
**Aceitação:** correr os coletores + build atualiza o protótipo sem editar o HTML à mão.

## P1 — Materiais para a direção
### RB-10 · Capturas do protótipo
Capturas em alta resolução (Puppeteer ou Playwright) dos ecrãs do modo direção, para o deck.

### RB-11 · Deck da direção (PowerPoint)
8 slides segundo o guião em `00-ponto-de-situacao.md`. Inter (decisão D22), cores Arena, logo oficial, visual antes de texto, notas do orador em todos os slides. Gerar com `pptxgenjs`.
**Aceitação:** nenhuma afirmação sem fonte; números iguais aos do documento.

### RB-12 · Documento do projeto (Word)
Consolidar `docs/00` a `docs/04` num documento Word. Arial Nova, logo no cabeçalho, rodapé paginado. Gerar com `docx` (Node.js).

## P2 — Se o piloto for aprovado
- **RB-20** Recolha semanal agendada (GitHub Actions ou agendador local). Atenção: só fontes públicas no GitHub; dados do cliente ficam fora.
- **RB-21** Rascunho automático do briefing com IA sobre os dados da semana, com validação humana antes do envio.
- **RB-22** Registo de pistas de ação e decisões da equipa (JSON) para alimentar o módulo Impacto com histórico real.
- **RB-23** Candidatura à API alpha do Google Trends.
- **RB-24** Decisão de stack com o IT; se Microsoft, mapear `data/processed` para Power BI.

## Evolução do produto (direção definida em out. 2026; a priorizar, nada fechado)
Para a v3 de demonstração, a proposta é limitar-se a três ideias de valor: RB-50, RB-51 e RB-52. O resto fica como direção.

### Estrutura e consulta
- **RB-40** Hierarquia Agência → Vertical → Cliente. Criar `config/verticals/<vertical>.yaml` com o conjunto de concorrentes por defeito; o cliente herda e ajusta em `config/clients/`.
- **RB-41** Conjunto competitivo editável por cliente (juntar, retirar, prioridade) e sugestão automática de concorrentes a partir de pesquisas e leilões em comum, com aceitação pela equipa.
- **RB-42** Ecrã inicial como feed do que mudou esta semana: número-herói e três sinais; tabelas e heatmaps um clique abaixo.
- **RB-43** Barra "Pergunta ao Radar": linguagem natural sobre os dados recolhidos; respostas em cartões com gráfico e etiqueta de origem. Base: paleta ⌘K do v2.

### Aspeto e movimento
- **RB-44** Sistema de motion (especificação + implementação): varredura de abertura, gráficos que se desenham, contagem de números, cascata de cartões, transição contínua sinal → leitura → pista, seletor de semanas animado, destaque cruzado. Respeitar `prefers-reduced-motion`.
- **RB-45** Temas por cliente via tokens (`config/themes/`), com validação automática de contraste WCAG AA e seletor de tema no protótipo.
- **RB-46** Tipografia Inter em todo o Radar (interface, apresentações e documentos), ficheiros servidos localmente, números tabulares, pesos por função (ver CLAUDE.md). Concluído no preview v3; falta aplicar na v3 de produção.
- **RB-47** Empacotar todas as bibliotecas (animação, gráficos, fontes) no próprio ficheiro, sem CDNs externos.

### Ideias de valor
- **RB-50** Triagem para a Research: cada pista ganha a opção "pedir aprofundamento à Research".
- **RB-51** Radar de agenda: eventos, sazonalidade e mudanças regulatórias para antecipar planos (útil para 2027).
- **RB-52** Radar rápido de novo negócio: configuração de um prospect num dia, só com fontes públicas.
- **RB-53** Mercado cruzado com a performance do cliente (só depois de parecer de Compliance).
- **RB-54** Memória da agência: o Impacto acumula o que funcionou, em que contexto.

## Concorrência e fontes (out. 2026)
- **RB-60** Ligar a Meta Ad Library (`collect_meta_ads.py`) ao módulo Concorrência: substituir os anúncios simulados pelos recolhidos, com `origem=real`, fonte e data. Depende de Q10.
- **RB-61** Recolha do Google Ads Transparency Center (manual/CSV) através do importador; avaliar automatização só com aprovação.
- **RB-62** Módulo de ad intelligence licenciada para investimento estimado por canal. Depende de Q11.
- **RB-63** Persistência das importações (hoje só existem na sessão do browser) e de-duplicação por anúncio.
- **RB-64** Configuração de conjuntos competitivos por vertical em `config/verticals/` e herança por cliente.
- **RB-65** Informações do leilão do Google Ads por cliente (Q12).
- **RB-66** Alertas de movimentos materiais (lançamento de campanha, salto de pressão) para Performance, Brand e Account.
- **RB-67** Módulo offline (TV, rádio, exterior) para completar a presença por canal.

## Governação e documentação
### RB-30 · Migrar a documentação para o dossier
Mover o conteúdo de `docs/00` a `docs/06` para `docs/dossier/` (negócio, técnico, governação, registos), sem duplicar. Manter os estados `Por confirmar` onde não houver validação. Preencher primeiro `03-governacao/registo-de-dados.md` e `02-tecnico/fluxo-de-dados.md` a partir de `docs/04-dados-e-fontes.md`.
**Aceitação:** cada pergunta de `04-registos/perguntas-em-aberto.md` tem um lugar de resposta; nenhum documento contradiz outro.

### RB-31 · Geração de documentos por público
Script que gera Word (Arial Nova, logo no cabeçalho) e PDF a partir de uma pasta do dossier: `negocio` para a direção, `tecnico` para o IT, `governacao` para Compliance.

## Futuro
- Módulo de visibilidade em assistentes de IA (como a marca aparece nas respostas de ChatGPT, Gemini e outros).
- Segundo cliente para provar que o produto é agnóstico (candidato natural: PRIO).
