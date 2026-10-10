# Arena Radar

Produto interno da Arena Media Portugal. O Radar deteta o que mudou no mercado de um cliente, lê o que isso significa e diz o que fazer a seguir.

> Não vende vigilância. Vende o "e então?".

## Estado (setembro 2026)
Conceito e protótipo de alta fidelidade concluídos. Dados reais, motor de leitura e entrega automática por construir. Ponto de situação para a direção em preparação, com a Sociedade Ponto Verde como cliente exemplo.

## Estrutura
| Caminho | Conteúdo |
|---|---|
| `CLAUDE.md` | Contexto e regras para o Claude Code. Ler primeiro. |
| `docs/00-ponto-de-situacao.md` | Documento para a direção e guião do deck |
| `docs/01-historico-e-decisoes.md` | Percurso do projeto e registo de decisões |
| `docs/02-produto.md` | Conceito, camadas, modos de entrega, módulos e ecrãs |
| `docs/03-cliente-exemplo-spv.md` | Contexto e configuração da versão Sociedade Ponto Verde |
| `docs/04-dados-e-fontes.md` | Fontes, viabilidade e política de proveniência |
| `docs/05-backlog.md` | Tarefas priorizadas, prontas a executar |
| `docs/06-arranque-claude-code.md` | Como pôr isto a andar no Claude Code |
| `docs/07-revisao-ux-e-estrutura.md` | Revisão de UX/UI e de estrutura, com proposta de solução (rascunho) |
| `docs/08-especificacao-ux.md` | Especificação do padrão de página, componentes e vistas Equipa/Cliente |
| `docs/09-pontos-de-ligacao.md` | Onde ligar cada fonte (Meta, Google, TikTok, Marktest…) e contrato de dados |
| `docs/10-como-acrescentar-um-cliente.md` | Acrescentar um cliente = um ficheiro de configuração |
| `docs/legacy/` | Documentos antigos (documento estratégico de abril) |
| `config/` | Configuração: `agencia.yaml`, `verticals/`, `clients/` (um ficheiro por cliente), `themes/`, `fontes.yaml` |
| `scripts/` | Recolha de dados: notícias, Google Trends, Meta Ad Library |
| `data/` | Dados recolhidos, sempre com proveniência |
| `prototype/` | Protótipo HTML (v3, multi-cliente) e o seu código-fonte em `src/` |
| `assets/` | Logo oficial Arena Media Portugal |

## Arranque rápido
```bash
python -m venv .venv && source .venv/bin/activate
pip install -r scripts/requirements.txt
cp .env.example .env        # preencher o token da Meta, se já existir
python scripts/collect_news.py --client spv
python scripts/collect_trends.py --client spv
python scripts/collect_meta_ads.py --client spv
python scripts/build_dataset.py          # gera os datasets de todos os clientes
python prototype/build_preview.py        # gera o protótipo (abre o HTML no navegador)
```
