# Pontos de ligação às fontes de dados

**Estado:** Rascunho · **Objetivo:** mostrar, para cada fonte, onde no código se liga e que dados tem de entregar, para trocar os dados de demonstração por dados reais sem mexer na interface.

## Como encontrar os pontos de ligação
No código, cada ponto está marcado com um comentário `LIGAÇÃO[<id>]`. Para os listar todos:
```bash
grep -rn "LIGAÇÃO\[" prototype/src scripts config
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

Cada fonte segue o mesmo caminho: **recolha → `data/raw/` → `scripts/build_dataset.py` → dataset do cliente → interface**. Ligar uma fonte é escrever (ou correr) a recolha e acrescentar/usar a função `real_<fonte>` no `build_dataset.py`; a interface não muda e o selo da página passa sozinho de «Demonstração» a «Real» ou «Misto».

| `id` | Fonte | Estado | Onde se liga | Dá | Não dá | Quem decide |
|---|---|---|---|---|---|---|
| `meta-ad-library` | Meta Ad Library API | Recolha escrita; ingestão pronta; por correr com token | `scripts/collect_meta_ads.py` → `data/raw/meta_ads/<cliente>/` → `build_dataset.py` (`real_meta_ads`) → bloco `anuncios` | Anúncios entregues na UE: texto, datas, plataformas, alcance UE quando existe | Investimento, segmentação, formato e território (ficam «Não indicado») | IT / Compliance (Q10) |
| `google-ads-transparency` | Google Ads Transparency Center | Manual (CSV via importador) | Importador CSV (`prototype/src/js/57-fontes.js`); recolha automática a avaliar (RB-61): novo `collect_google_ads.py` + `real_google_ads` em `build_dataset.py` | Anúncios por anunciante em Pesquisa, YouTube e display | API oficial (não existe) | IT / Compliance |
| `tiktok-ad-library` | TikTok Ad Library (DSA) | Manual por agora | Importador CSV; com acesso à API de investigação: novo `collect_tiktok_ads.py` + `real_tiktok_ads` | Anúncios entregues na UE | Investimento | IT / Compliance |
| `marktest-adcheck` | Marktest AdCheck / ad intelligence licenciada | Por definir | Bloco `investimento` em `build_dataset.py` (hoje estimado) e métrica `investimento` em `prototype/src/js/40-metrics.js`; novo `real_investimento` (RB-62) | Investimento estimado e inserções por meio | — | Direção / IT (Q11). Formato de entrega (exportação ou API) a confirmar com o fornecedor |
| `google-trends` | Google Trends | Recolha escrita (biblioteca arquivada); CSV manual como alternativa | `scripts/collect_trends.py` → `data/raw/trends/<cliente>/` → `real_trends` → bloco `procura` | Interesse relativo 0–100 | Volume absoluto | IT; candidatura à API alpha (RB-23) |
| `news-rss` | Google News RSS | Recolha escrita; ingestão pronta (acumula semana a semana) | `scripts/collect_news.py` → `data/raw/noticias/<cliente>/` → `real_noticias` → bloco `noticias` | Notícias por pesquisa em PT | Exaustividade | Compliance (termos) |
| `google-ads-auction` | Google Ads, informações do leilão | Bloqueado | `scripts/demo_data.py` (`leilao_demo`) → bloco `leilao`; ver RB-65 | Quota de impressões, sobreposição | — | Compliance + cliente (Q12) |
| `dados-internos-cliente` | Dados internos do cliente (ex.: chatbot) | Bloqueado | `data/raw/internal/<fonte>/` (fora do Git) | Sessões e temas | — | Compliance + cliente (Q05) |
| `importador-csv` | Importador CSV | Ativo | `prototype/src/js/57-fontes.js` | Qualquer fonte, com validação de proveniência | — | Equipa |

Nota: o estado e as capacidades de cada API devem ser **confirmados na documentação atual de cada fornecedor** antes de ligar; os campos acima refletem o que está registado em `04-dados-e-fontes.md`.

## Ligar um cliente a dados reais, passo a passo
Há três caminhos para os dados de procura e notícias. Escolhe o que for possível no teu ambiente.

| Caminho | Quando | Como |
|---|---|---|
| **A. Recolha automática no ambiente cloud** | O ambiente tiver acesso de rede aos domínios das fontes | Em Definições do ambiente → Acesso à rede, acrescentar `news.google.com` e `trends.google.com` (e `graph.facebook.com` para a Meta). Depois: `python3 scripts/collect_news.py --client <cliente>` e `python3 scripts/collect_trends.py --client <cliente>` |
| **B. Recolha no teu computador** | Tens Python instalado | `pip install -r scripts/requirements.txt` e os mesmos comandos; faz commit dos ficheiros novos de `data/raw/` |
| **C. Exportação manual do Google Trends** | Sem rede nem Python no ambiente; fonte que a própria Google disponibiliza | Em trends.google.com, pesquisa os termos de cada cluster (Portugal, «Últimos 5 anos») → Descarregar CSV; coloca os ficheiros no repositório e corre `python3 scripts/import_trends_csv.py --client <cliente> --cluster cluster1=ficheiro1.csv --cluster cluster2=ficheiro2.csv` |

Depois de qualquer caminho: `python3 scripts/build_dataset.py && python3 scripts/check_dataset.py && python3 prototype/build_preview.py`. A recolha de notícias acumula-se semana a semana (o RSS só devolve os dias mais recentes); o histórico começa na primeira recolha.

**Antes de usar dados reais com clientes reais:** a aprovação das fontes (IT e Compliance) e o uso do nome do cliente em demonstrações (Q04) continuam por confirmar.

## Do dado recolhido ao ecrã (alvo da fase C)
```
fonte → scripts/collect_<fonte>.py → data/raw/<fonte>/<cliente>/<data>.csv
      → scripts/build_dataset.py   → data/processed/<cliente>.json  (+ agencia.json)
      → protótipo (lê os JSON; sem clientes, marcas nem séries escritos no código)
```
Implementado (out. 2026). Para cada bloco, `build_dataset.py` usa os dados reais se existirem em `data/raw/` e, caso contrário, os de demonstração. O selo de dados da página (ver `08-especificacao-ux.md`, secção 6) passa sozinho de «Demonstração» a «Real» ou «Misto», sem alterações à interface. Testado com ficheiros de recolha sintéticos (Trends, notícias e Meta): as semanas sem recolha ficam vazias, nunca a zero.
