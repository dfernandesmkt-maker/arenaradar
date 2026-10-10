# Protótipos

| Ficheiro | Estado |
|---|---|
| `arena-radar-v2.html` | Referência de junho 2026. **A colocar aqui (RB-01).** Não editar. |
| `arena-radar-v3-preview.html` | Pré-visualização atual (SPV + vertical Energia, tema claro, temas por cliente, motion, Pergunta ao Radar). **Gerado, não editar à mão.** Ponto de partida visual da v3. |
| `src/preview.template.html` | Fonte da pré-visualização (CSS, HTML e JS). É aqui que se editam alterações. |
| `src/competition.js`, `src/competition.css` | Módulo Concorrência (modelo demo, gráficos, filtros, 6 vistas). |
| `src/sources.js` | Fontes de dados, importador CSV e extras do Observar da SPV. |
| `build_preview.py` | Junta `src/*` (marcador `{{INCLUDE:ficheiro}}`) e gera o HTML final: embebe a Inter (`fonts/`) e o logo oficial (`../assets/`) em base64. |
| `fonts/` | Inter variável (latin, woff2) e licença OFL. |

## Como reconstruir
```
python3 prototype/build_preview.py
```
Abre `prototype/arena-radar-v3-preview.html` diretamente no browser; não precisa de servidor nem de rede.

## Notas
- Cada número tem etiqueta de proveniência: Real, Estimado, Demo (Misto na Torre de controlo). Ver `docs/04-dados-e-fontes.md`.
- Marcas da vertical Energia (Lumio, Aurea, Voltix, Helio, Zenit) são fictícias.
- Sem CDNs. Tema por cliente via variáveis CSS, com proteção de contraste AA (ver `config/themes/`).
- Limitação conhecida: o preview mostra respostas pré-definidas na «Pergunta ao Radar».
