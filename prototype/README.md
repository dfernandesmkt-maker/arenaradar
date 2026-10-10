# Protótipo

| Caminho | O que é |
|---|---|
| `arena-radar-v3-preview.html` | O protótipo (ficheiro único, autocontido, abre no navegador sem servidor). **Gerado: não editar à mão.** |
| `src/index.template.html` | Esqueleto da página. |
| `src/css/` | Estilos: `app.css` (tokens, estrutura, componentes) e `charts.css` (gráficos, tabelas, galeria). |
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

## Como o código está organizado
A interface **não tem clientes, marcas nem séries escritos no código**: lê os datasets de `data/processed/`.

| Ficheiro | Responsabilidade |
|---|---|
| `00-core.js` | Utilitários, dicas, avisos, temas e contraste AA |
| `10-data.js` | Lê os datasets, cliente ativo, anúncios, **origem dos dados e selo** |
| `20-components.js` | Selo de dados, KPI, cartão, estado vazio, **barra de filtros**, gaveta |
| `30-charts.js` | Gráficos SVG (linha, área, barras, empilhado), tabela, miniaturas |
| `40-metrics.js` | Janela de análise (período e comparação) e catálogo de KPIs |
| `50` a `57-page-*.js` | Páginas: Visão geral, Mercado, Procura e notícias, Criativos, Relatórios, Ações, Agência, Fontes |
| `90-app.js` | Rotas, seletor de âmbito, menu único, Pergunta ao Radar, arranque |

Rotas: `#/<cliente>/<página>[/<separador>]` e `#/agencia/<torre|fontes>`.

## Notas
- Cada bloco de dados tem origem (real, estimado, demonstração, por ligar). Cada página mostra **um selo de dados** que resume a origem; ao clicar vê-se o detalhe, e ao passar o cursor num número vê-se a sua origem (decisão D27).
- As marcas dos clientes de demonstração (Lumio, Vael, Kob e os seus concorrentes) são fictícias.
- Sem CDNs. Temas por variáveis CSS, com proteção de contraste AA (`config/themes/`).
- Pontos de ligação às fontes: `grep -rn "LIGAÇÃO\[" prototype/src scripts config` e `docs/09-pontos-de-ligacao.md`.
- Limitação conhecida: a «Pergunta ao Radar» responde a perguntas sugeridas; o estado das pistas e as importações CSV vivem só na sessão do navegador (RB-22, RB-63).
