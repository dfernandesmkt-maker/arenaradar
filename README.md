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
| `docs/legacy/` | Documentos antigos (documento estratégico de abril) |
| `config/clients/` | Configuração por cliente (o Radar é agnóstico ao cliente) |
| `scripts/` | Recolha de dados: notícias, Google Trends, Meta Ad Library |
| `data/` | Dados recolhidos, sempre com proveniência |
| `prototype/` | Protótipos HTML (v2 de junho a colocar aqui; v3 SPV a construir) |
| `assets/` | Logo oficial Arena Media Portugal |

## Arranque rápido
```bash
python -m venv .venv && source .venv/bin/activate
pip install -r scripts/requirements.txt
cp .env.example .env        # preencher o token da Meta, se já existir
python scripts/collect_news.py --client spv
python scripts/collect_trends.py --client spv
python scripts/collect_meta_ads.py --client spv
```
