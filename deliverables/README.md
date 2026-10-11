# Entregáveis para a direção

| Ficheiro | O que é | Como se gera |
|---|---|---|
| `arena-radar-direcao.pptx` | Deck do ponto de situação (9 slides, notas do orador em todos) | `cd scripts/deck && npm install && cd ../.. && node scripts/deck/gerar_deck.js` |
| `capturas/*.png` | Capturas do protótipo v4 usadas no deck | `node scripts/deck/capturas.js` (depois de `python3 scripts/v4/gerar_dados.py && python3 prototype/v4/build.py`) |

- Todas as capturas usam **clientes e marcas fictícios** (D33, D51). Nenhum dado real.
- O deck usa a fonte **Inter** (D22). Instalar a Inter no computador que vai apresentar; sem ela, o PowerPoint substitui a fonte.
- O texto do deck segue `docs/00-ponto-de-situacao.md`. Se o documento mudar, regenerar o deck.
