# Pontos de ligação às fontes de dados

**Estado:** Rascunho · **Objetivo:** mostrar, para cada fonte, onde no código se liga e que dados tem de entregar, para trocar os dados de demonstração por dados reais sem mexer na interface.

## Como encontrar os pontos de ligação
No código, cada ponto está marcado com um comentário `LIGAÇÃO[<id>]`. Para os listar todos:
```bash
grep -rn "LIGAÇÃO\[" prototype/src scripts
```
Regras:
- Ao acrescentar uma fonte, criar o seu `LIGAÇÃO[<id>]` no sítio onde os dados entram e uma linha na tabela abaixo.
- Todo o dado que entra leva as colunas de proveniência (`origem`, `fonte`, `data_recolha`, `metodo`, `url`; ver `04-dados-e-fontes.md`).
- Nenhuma fonte é ligada em produção sem aprovação de IT e Compliance (dossier, `fontes-e-termos-de-uso.md`).

## Contrato de dados comum («anúncio»)
Todas as fontes de anúncios entregam o mesmo formato, o mesmo do importador CSV, para a interface não depender da fonte:

| Campo | Descrição |
|---|---|
| `marca` | Anunciante, ligado a uma entidade do universo do cliente |
| `plataforma` | Meta · Google · YouTube · TikTok (lista a alargar) |
| `formato` | Vídeo · Imagem · Carrossel · Texto |
| `data_inicio`, `data_fim` | ISO 8601; `data_fim` vazia se ainda ativo |
| `texto` | Texto do anúncio |
| `url` | Ligação para verificar o anúncio na fonte |
| `alcance`, `investimento_estimado` | Quando a fonte os der; vazio caso contrário (nunca preencher) |
| `origem`, `fonte`, `data_recolha`, `metodo` | Proveniência obrigatória |

## Tabela de ligações

| `id` | Fonte | Estado | Onde se liga | Dá | Não dá | Quem decide |
|---|---|---|---|---|---|---|
| `meta-ad-library` | Meta Ad Library API | Script escrito, por correr | `scripts/collect_meta_ads.py` → `prototype/src/competition.js` (bloco `CR`) | Anúncios entregues na UE: texto, datas, plataformas, alcance UE quando existe | Investimento e segmentação em anúncios comerciais | IT / Compliance (Q10) |
| `google-ads-transparency` | Google Ads Transparency Center | Manual (CSV via importador) | Importador CSV em `prototype/src/sources.js`; recolha automática a avaliar (RB-61) | Anúncios por anunciante em Pesquisa, YouTube e display | API oficial (não existe) | IT / Compliance |
| `tiktok-ad-library` | TikTok Ad Library (DSA) | Manual por agora | Novo `scripts/collect_tiktok_ads.py` quando houver acesso à API de investigação | Anúncios entregues na UE | Investimento | IT / Compliance |
| `marktest-adcheck` | Marktest AdCheck | Por definir | Bloco `PC` e Investimento em `competition.js`; módulo «Monitorização de investimento» em `sources.js`; ver RB-62 | Investimento estimado e inserções por meio | — | Direção / IT (Q11). Formato de entrega (exportação ou API) a confirmar com a Marktest |
| `google-trends` | Google Trends | Script escrito (biblioteca arquivada); CSV manual como alternativa | `scripts/collect_trends.py` → bloco Procura da SPV em `prototype/src/preview.template.html` | Interesse relativo 0–100 | Volume absoluto | IT; candidatura à API alpha (RB-23) |
| `news-rss` | Google News RSS | Script escrito | `scripts/collect_news.py` → bloco Notícias | Notícias por pesquisa em PT | Exaustividade | Compliance (termos) |
| `google-ads-auction` | Google Ads, informações do leilão | Bloqueado | Módulo em `sources.js`; ver RB-65 | Quota de impressões, sobreposição | — | Compliance + cliente (Q12) |
| `elo` | Utilização do chatbot ELO | Bloqueado | `data/raw/internal/elo/` (fora do Git) | Sessões e temas | — | Compliance + cliente (Q05) |

Nota: o estado e as capacidades de cada API devem ser **confirmados na documentação atual de cada fornecedor** antes de ligar; os campos acima refletem o que está registado em `04-dados-e-fontes.md`.

## Do dado recolhido ao ecrã (alvo da fase C)
```
fonte → scripts/collect_<fonte>.py → data/raw/<fonte>/<cliente>/<data>.csv
      → scripts/build_dataset.py   → data/processed/<cliente>.json
      → protótipo (lê o JSON do cliente; sem dados escritos no código)
```
Quando a ligação estiver feita, o selo de dados da página (ver `08-especificacao-ux.md`, secção 6) passa sozinho de «demonstração» a «real» ou «misto», sem alterações à interface.
