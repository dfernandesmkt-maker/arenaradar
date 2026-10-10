# Dados

- `raw/<fonte>/<cliente>/<data>.csv` — recolhas brutas, sempre com as colunas de proveniência (`origem`, `fonte`, `data_recolha`, `metodo`, `url`).
- `raw/trends/manual/<cliente>/` — exportações manuais do Google Trends quando a recolha automática falhar.
- `raw/internal/` — dados internos de clientes (ex.: ELO). **Fora do Git.** Só com autorização do cliente.
- `processed/<cliente>.json` e `processed/agencia.json` — datasets que alimentam o protótipo (gerados por `scripts/build_dataset.py`). Hoje contêm dados de demonstração e contexto real com fonte; ficam versionados para o protótipo abrir sem recolhas. **Quando existirem dados reais de clientes, rever com Compliance se estes ficheiros podem ficar no Git.**

Política completa em `docs/04-dados-e-fontes.md`.
