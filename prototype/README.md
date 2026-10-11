# Protótipo

| Caminho | O que é |
|---|---|
| `arena-radar-v3-preview.html` | O protótipo (ficheiro único, autocontido, abre no navegador sem servidor). **Gerado: não editar à mão.** |
| `src/index.template.html` | Esqueleto da página. |
| `src/css/` | Estilos: `app.css` (tokens, estrutura, componentes), `charts.css` (gráficos, tabelas, galeria) e `states.css` (sistema único de pílulas, identidade Arena e vista do cliente como relatório). |
| `src/js/00-core.js` … `90-app.js` | Código, por camadas (ver abaixo). |
| `build_preview.py` | Junta `src/` e os datasets num só HTML; embebe a fonte Inter e o logo oficial. |
| `fonts/` | Inter variável (latin, woff2) e licença OFL. |
| `arena-radar-v2.html` | Referência de junho. **A colocar aqui (RB-01).** Não editar. |

## Como reconstruir
```bash
python3 scripts/build_dataset.py     # gera data/processed/*.json a partir de config/ e data/raw/
python3 prototype/build_preview.py   # gera arena-radar-v3-preview.html
```
Abre `prototype/arena-radar-v3-preview.html` diretamente no navegador; não precisa de servidor nem de rede.

**Variante para publicar como página no claude.ai:** `python3 prototype/build_preview.py --artefacto` gera `prototype/dist/arena-radar-artefacto.html` (não versionada). É a mesma aplicação, adaptada às regras do ambiente de publicação: segue o tema claro/escuro do visualizador e esconde «Exportar PDF» e «Descarregar modelo», que esse ambiente não permite.

## Como o código está organizado
A interface **não tem clientes, marcas nem séries escritos no código**: lê os datasets de `data/processed/`.

| Ficheiro | Responsabilidade |
|---|---|
| `00-core.js` | Utilitários, dicas, avisos, temas e contraste AA |
| `10-data.js` | Lê os datasets, cliente ativo, anúncios, **origem dos dados e selo** |
| `20-components.js` | Selo de dados, KPI, cartão, estado vazio, **barra de filtros**, gaveta |
| `30-charts.js` | Gráficos SVG (linha, área, barras, empilhado), tabela, miniaturas |
| `40-metrics.js` | Janela de análise (período e comparação) e catálogo de KPIs |
| `50` a `58-page-*.js` | Páginas: Visão geral, Mercado, Procura e notícias, Criativos, Relatórios (briefing e publicação), Ações (pistas, alertas, impacto), Agência (Torre), Fontes, **ficha de marca** |
| `59-export.js` | Copiar gráfico como imagem (com origem dos dados) e destaques do briefing |
| `80-settings.js`, `82-palette.js` | Definições (aparência, tema, função, demonstração) e paleta Ctrl K |
| `85-tour.js` | Modo apresentação |
| `90-app.js` | Rotas, seletor de âmbito, menu único, Pergunta ao Radar, arranque |

Rotas: `#/<cliente>/<página>[/<separador>][?v=cliente&rasc=1&w=…&c=…&p=…&b=…]` e `#/agencia/<torre|fontes>`. `v=cliente` abre a vista do cliente (publicado), `rasc=1` a pré-visualização do rascunho; `w`, `c`, `p`, `b` são os filtros (período, comparação, plataformas, marcas), por isso uma ligação partilha a vista.

## Notas
- Cada bloco de dados tem origem (real, estimado, demonstração, por ligar). Cada página mostra **um selo de dados** que resume a origem; ao clicar vê-se o detalhe, e ao passar o cursor num número vê-se a sua origem (decisão D27).
- As marcas dos clientes de demonstração (Lumio, Vael, Kob e os seus concorrentes) são fictícias.
- Sem CDNs. Temas por variáveis CSS, com proteção de contraste AA (`config/themes/`).
- Pontos de ligação às fontes: `grep -rn "LIGAÇÃO\[" prototype/src scripts config` e `docs/09-pontos-de-ligacao.md`.
- **Modo apresentação:** o botão «Apresentar» abre um roteiro guiado (`config/roteiro.yaml`) com uma nota por ecrã; setas esquerda/direita avançam e recuam; «Repor» deixa as pistas por decidir e nada publicado. Para mudar a história da demonstração edita o roteiro e volta a gerar o protótipo.
- **Vista Cliente (D31, D34):** o botão «Equipa | Cliente» abre a pré-visualização do que o cliente vê. O cliente só vê o que a equipa **publicou** em Relatórios › Publicar para o cliente; alterar o rascunho não muda o publicado até haver novo «Publicar». «Ver como ficaria» mostra o rascunho sem publicar.
- **Leitura e trabalho:** «Porquê?» nos sinais e «?» nos KPIs explicam regra, números e janela; a ficha de marca (Mercado › marca) compara marcas; Ações › Alertas avisa só do que é material; «Copiar imagem» e «Ao briefing» levam os gráficos para onde a agência trabalha; definições › «A minha função» muda o que aparece primeiro.
- **Temas e assuntos** usam a paleta `--t1…--t5` (validada com `validate_palette.js`), nunca as cores das marcas (D35).
- Limitações conhecidas: a «Pergunta ao Radar» responde a perguntas sugeridas; as decisões sobre pistas e a publicação ficam só neste navegador (localStorage, D32; RB-22 para partilhar entre a equipa); as importações CSV vivem só na sessão (RB-63); a entrega real ao cliente não está construída.
