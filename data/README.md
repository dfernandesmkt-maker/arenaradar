# Dados

- `raw/<fonte>/<cliente>/<data>.csv` — recolhas brutas, sempre com as colunas de proveniência (`origem`, `fonte`, `data_recolha`, `metodo`, `url`).
- `raw/trends/manual/<cliente>/` — exportações manuais do Google Trends quando a recolha automática falhar.
- `raw/internal/` — dados internos de clientes (ex.: ELO). **Fora do Git.** Só com autorização do cliente.
- `processed/<cliente>.json` — dataset agregado que alimenta o protótipo (gerado por `scripts/build_dataset.py`, a construir em RB-09).

Política completa em `docs/04-dados-e-fontes.md`.
