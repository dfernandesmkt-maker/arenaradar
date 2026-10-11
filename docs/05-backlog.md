# Arena Radar — Backlog

Prioridades: **P0** antes da reunião com a direção · **P1** materiais da reunião · **P2** só se o piloto for aprovado · **Futuro**.
Cada tarefa = um commit com o ID.

## v4 — Radar de movimentos (out. 2026; D50 a D52; `docs/11-v4-radar-de-movimentos.md`)
- **RB-110** ✅ Configuração v4 (`config/v4/`) com 2 clientes fictícios (Vetra, Mercana) e o comportamento de cada marca.
- **RB-111** ✅ Gerador `scripts/v4/gerar_dados.py`: 2 anos simulados, deteção de movimentos, importância explicada, histórico, previsões a partir do histórico, ligação às respostas.
- **RB-112** ✅ Interface v4 (`prototype/v4/`, `prototype/arena-radar-v4.html`): Agora, Concorrentes (fichas), Comparar, À frente, Respostas, Torre e Fontes; sistema visual da v3 (D38 a D49); telemóvel; contraste AA nos dois temas.
- **RB-113** *(por fazer)* Teste de dados reais: 1 vertical, 6 marcas reais, Meta Ad Library + Google Ads Transparency + TikTok; medir cobertura e qualidade por semana. Depende de Compliance (termos de uso).
- **RB-114** *(por fazer)* Resumo semanal escrito por IA a partir dos movimentos (revisto pela equipa) e classificação automática dos criativos (mensagem, oferta, chamada à ação).
- **RB-115** *(por fazer)* Plano de meios do cliente na linha «À frente», para ver sobreposições com a concorrência.
- **RB-116** *(por fazer)* Persistência partilhada das decisões (ativação de respostas): substitui o `localStorage` da demonstração (RB-22).
- **RB-117** *(por fazer)* Saída para o cliente: slide ou email da semana assinado pela Arena (substitui, por agora, a vista do cliente da v3).

## P0 — Protótipo v3

### RB-01 · Recuperar o protótipo v2 *(manual, David)*
Descarregar o `arena-radar.html` da conversa de junho no claude.ai e guardar como `prototype/arena-radar-v2.html`. Guardar o documento estratégico de abril em `docs/legacy/`.
**Aceitação:** ficheiros no repositório; v2 abre no browser.

### RB-02 · Criar a v3 e trocar o logo
Copiar v2 para `prototype/arena-radar-v3-preview.html`. Substituir o logo recriado pelo oficial (`assets/arena_media_portugal_logo.jpg`, embebido em base64 para o HTML continuar autocontido).
**Aceitação:** nenhum logo desenhado em SVG/CSS; o oficial aparece nítido na sidebar e no rodapé.

### RB-02b · Reenquadrar "Recomendar" como "Pistas de ação"
Renomear a camada e o ecrã. Cartões passam a "ação possível", com botões **Aceitar**, **Ajustar**, **Descartar**, e um passo separado e opcional **Levar ao cliente**. Retirar da interface qualquer texto em que a plataforma recomenda ao cliente. Atualizar o módulo Impacto aos novos estados (ver `docs/02-produto.md`).
**Aceitação:** a palavra "recomenda" não aparece na interface como ação da plataforma; o fluxo mostra claramente que a decisão é da equipa.

### RB-03 · Etiquetas de proveniência
Componente reutilizável `badge-origem` com três estados: **Real** (verde), **Estimado** (âmbar), **Demo** (cinzento tracejado). Ao passar o cursor mostra fonte, data de recolha e método. Aplicar a todos os KPIs, gráficos, tabelas e cartões.
**Aceitação:** zero números na interface sem etiqueta; a faixa global "dados de demonstração" da v2 é substituída por etiquetas por componente.

### RB-04 · Cliente por defeito e clientes fictícios
*(Reformulada em out. 2026, D33.)* O protótipo mostra só clientes fictícios (Lumio, Vael, Kob e Verdia); o cliente inicial é `cliente_inicial` em `config/agencia.yaml`. Nome, universo e pesquisas vêm de `config/clients/<cliente>.yaml`.
**Aceitação:** nenhum dado demo atribuído a uma entidade real de terceiros (verificado por `scripts/check_dataset.py`).

### RB-05 · Camada Observar para clientes de tipo «tema»
Substituir a lógica "concorrentes / share of voice" por quatro blocos: **Procura e dúvidas** (Trends por cluster), **Voz no tema** (anúncios ativos por entidade e mensagem), **Agenda** (notícias por tema), **Dados internos do cliente** (bloqueados até haver autorização). Manter o heatmap, mas como entidades × canais observados.
**Aceitação:** os quatro blocos com dados etiquetados; as hipóteses H1–H3 aparecem em Ler como "hipótese", não como conclusão.

### RB-06 · Ecrã "Briefing de segunda-feira"
Nova entrada na navegação. Pré-visualização do email interno para a equipa (largura 600 px, marca Arena): O que mudou · O que significa · Pistas de ação. Versão cliente opcional, gerada só com as pistas que a equipa aceitou. Botão "Exportar PDF" via `window.print()` com CSS de impressão.
**Aceitação:** cabe numa página A4; inclui o estado "sem sinais materiais esta semana".

### RB-07 · Limiares visíveis e estado vazio *(feito em out. 2026: limiares nos cartões; interruptor «Simular semana sem sinais» na Visão geral e no Briefing; clientes sem dados mostram «Ainda sem dados ligados»)*
Mostrar em Observar o limiar de cada bloco (de `04-dados-e-fontes.md`). Quando nada ultrapassa o limiar: mensagem clara, não ecrã vazio.
**Aceitação:** é possível simular a semana sem sinais através de um interruptor.

### RB-08 · Modo direção *(feito em out. 2026 como «Modo apresentação»: botão «Apresentar», roteiro guiado de 10 passos em `config/roteiro.yaml`, letra maior, sem distrações, setas para avançar, «Repor demonstração»)*
Interruptor que esconde ⌘K, skeletons e animações acessórias, aumenta a tipografia e deixa quatro ecrãs: Visão geral, Observar, Briefing, Impacto.
**Aceitação:** percorrível em 3 minutos numa reunião, sem cliques perdidos.

### RB-09 · Ligar dados reais ao protótipo *(feito em out. 2026: `scripts/build_dataset.py`; falta correr as recolhas reais, RB-76)*
Criar `scripts/build_dataset.py`: lê `data/raw/**`, agrega por semana e gera `data/processed/<cliente>.json` com proveniência. Um passo de build injeta o JSON no HTML v3.
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

## Reestruturação UX e multi-cliente (out. 2026; decisões D26 a D29)
Especificação em `docs/08-especificacao-ux.md`. Por fases:
- **RB-70** ✅ *(fase C, out. 2026)* Seletor de âmbito e menu único para todos os clientes.
- **RB-71** ✅ *(fase C)* Barra de filtros global (período, comparação, plataforma, marcas) onde afeta o conteúdo: Visão geral, Mercado (concorrência), Procura e notícias, Criativos.
- **RB-72** ✅ *(fase C)* Componentes reutilizáveis: KPI, cartão-conclusão, gráfico, tabela, gaveta, estado vazio (`prototype/src/js/20-components.js`, `30-charts.js`).
- **RB-73** ✅ *(fase C)* Dados por cliente: `config/` → `scripts/build_dataset.py` (RB-09) → JSON lido pelo protótipo; clientes e marcas já não estão no código. `config/verticals/` criado (RB-40). Quatro clientes fictícios: Lumio, Vael e Kob (concorrência) e Verdia (tema).
- **RB-74** ✅ *(fase C)* Selo de dados por página (D27 confirmada).
- **RB-75** ✅ *(fase D, out. 2026)* Vista Cliente e publicação pela equipa. O tema de cor por cliente está pronto (`cliente.tema`) mas não é usado até a Q09 ser respondida. Falta a entrega real ao cliente (acesso e autenticação), a decidir com IT e Compliance.
- **RB-76** *(fase E)* Dados reais nos blocos Procura e Notícias para a home; Meta quando houver token (Q10). **Estado:** o ambiente cloud não tem acesso de rede a `news.google.com`, `trends.google.com` nem `graph.facebook.com`; importador de exportações manuais do Trends pronto (`scripts/import_trends_csv.py`). Falta correr a recolha (ver `docs/09`, «Ligar um cliente a dados reais»).
- **RB-80** ✅ *(out. 2026)* Barra superior simplificada: Apresentar, vista Equipa/Cliente e menu de definições (aparência, cor do tema, controlos de demonstração). Os controlos de demonstração saem da interface do produto.
- **RB-81** ✅ Paleta de comandos (Ctrl K): navegação, mudar de cliente, ações e perguntas ao Radar na mesma caixa.
- **RB-82** ✅ Filtros compactos (período, comparação, plataformas, marcas) com painéis e folha inferior em telemóvel; «Repor filtros».
- **RB-83** ✅ Cartões «O que mudou» redesenhados: altura uniforme, texto contido, medidor de valor face ao limiar, ação principal «Ver pista» e menu «⋯» (detalhe, publicar para o cliente, pedir aprofundamento).
- **RB-84** ✅ Ajuda «?» nos KPIs, dica «pontos percentuais», marcadores de lançamento de campanha no gráfico principal, «Copiar tabela» (TSV), resumo «O cliente verá…» na publicação, fila de decisões na Torre de controlo, estado vazio do Impacto.
- **RB-85** ✅ Acessibilidade: ligação «Saltar para o conteúdo», foco no título ao navegar, anúncio da página para leitores de ecrã, alvos de 44 px em ecrãs tácteis.
- **RB-86** ✅ *(out. 2026, auditoria UX)* Correções: controlos de demonstração fora das páginas e sem «ilustrativo» nos blocos; paleta própria para temas e assuntos (validada) separada das cores das marcas; chips de seleção com estado visível; janela de cálculo em cada número; medidor de limiar; contraste do chip negativo; menu lateral com a página ativa visível; telemóvel sem cortes.
- **RB-87** ✅ Publicação com **rascunho e publicado** (D34): o cliente só vê a cópia publicada; estados «Por publicar», «Publicado» e «Alterações por publicar»; publicar alterações, descartar, retirar; pré-visualização ao lado; histórico (quem, quando, o quê); «Ver como ficaria» na vista do cliente.
- **RB-88** ✅ **«Porquê?»** (D35): regra, números, janela, limiar, semana passada, gráfico e origem de cada sinal; «Como se calcula» em cada KPI; etiqueta «Novo» e faixa «Desde a semana passada» (sinais novos e que deixaram de estar acima do limiar).
- **RB-89** ✅ **Ficha de marca** (Mercado › marca) com KPIs, campanhas, formatos, mensagens, criativos longevos e sinais; **comparar com outra marca**.
- **RB-90** ✅ **Alertas** (Ações › Alertas) só para eventos materiais, com novos desde a última visita, preferências de aviso e limiares; **vista por função** (D36): Performance, Brand, Account e Direção.
- **RB-91** ✅ **Copiar gráfico como imagem** com título, legenda e origem dos dados (D37); «Ao briefing» em gráficos, respostas, criativos e fichas; briefing organizado por sinal (sinal, leitura, pista).
- **RB-92** ✅ Acabamento: Torre com clientes por vertical e fila por sinal vs limiar; ~~Agência › Piloto~~ (retirada, D41); Impacto com percurso sinal, decisão, resultado; pistas criadas pela equipa; tabelas ordenáveis; filtros na ligação e **vistas guardadas**; Fontes em dois níveis (resumo e detalhe técnico); heatmap com coluna offline única.
- **RB-93** *(por fazer)* Medir o **resultado observado** de cada pista aceite (hoje «A medir») e o tempo até decidir, assim que houver histórico real. Depende do piloto e de RB-22.
- **RB-94** ✅ *(design, D38)* Tokens de espaço, raio e elevação; **sistema único de pílulas** (etiquetas, selos, estados, variações) em `states.css`; ligações com contraste AA nos dois temas; tipografia mínima de 12,5 px.
- **RB-95** ✅ *(design, D39)* Identidade Arena: cabeçalho **Guerrilla Forest** com motivo de radar na Visão geral e na Torre, **amarelo reservado ao sinal** (número-herói, cartões de sinais materiais, marcador nos gráficos, indicador do menu).
- **RB-96** ✅ *(design, D40)* **Vista do cliente como relatório**: sem menu lateral, cabeçalho com logo e data de publicação, separadores no topo, coluna de leitura, rodapé assinado pela Arena, faixa de pré-visualização fora da página.
- **RB-97** ✅ *(design, D42)* **Ações como fila de decisão**: resumo no topo, «Por decidir» e «Já decididas», percurso numerado sinal → leitura → ação, uma ação principal por pista.
- **RB-98** ✅ *(design, D43)* **Gráfico principal da Visão geral** por marca, com a marca do sinal em destaque; plataformas em Mercado.
- **RB-99** ✅ *(design, D44)* **Modo silencioso**: variações em tabelas como texto com seta, estado do sinal sem fundo, pista em caixa neutra. Corrige também o botão discreto (`.btn.ghost`) que herdava o estilo de um chip antigo.
- **RB-100** ✅ *(design, D45)* **Teste de carga e escala**: gerador de dados sintéticos (`scripts/gerar_carga.py`); listas com «Mostrar todas», filtro da fila por vertical na Torre, 6 sinais visíveis na Visão geral, gráfico com até 5 marcas, estado vazio da ficha de marca, tabelas da Torre compactas em telemóvel, barra inferior sem cortes com 6 itens.
- **RB-101** ✅ *(design, D46)* **Paleta de marcas de 8 cores** validada (claro e escuro), cinzento neutro da 9.ª marca em diante, cores por relevância em conjuntos grandes, gráfico principal com até 6 marcas e a marca do sinal sempre visível.
- **RB-102** ✅ *(design, D47)* **Cliente a tinta** nos gráficos, pontos e barras (nunca o azul da interface); 7 matizes de concorrente revalidados.
- **RB-103** ✅ *(design, D48)* **Escala tipográfica do modo apresentação** por largura do ecrã, sem menu lateral e com a barra do roteiro proporcional.
- **RB-104** ✅ *(design, D49)* **Miniaturas dos criativos** com fundo claro e a cor da marca só como tinta suave, barra e formas.

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
