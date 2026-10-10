# Arena Radar — Dados e fontes

## Regimes de fontes
- **Demonstração:** pode usar as fontes necessárias para mostrar o potencial do produto, sempre etiquetadas com a origem.
- **Produção:** apenas fontes oficiais ou licenciadas, validadas por IT e Compliance. As notas sobre `pytrends` e scrapers abaixo aplicam-se só à demonstração.
- Estado e termos de cada fonte em `docs/dossier/03-governacao/fontes-e-termos-de-uso.md`.

## Política de proveniência (obrigatória)
Cada registo, em qualquer ficheiro de `data/`, tem estas colunas:

| Coluna | Valores | Obrigatório |
|---|---|---|
| `origem` | `real` · `estimado` · `demo` | Sempre |
| `fonte` | Emissor identificado (ex.: "Google Trends", "Meta Ad Library", "Lusa via Diário de Viseu") | Se `real` |
| `data_recolha` | ISO 8601 | Sempre |
| `metodo` | Como foi obtido ou calculado | Se `estimado`; recomendado nos outros |
| `url` | Ligação para verificação | Quando existir |

Regras:
- Dado `demo` nunca é atribuído a uma entidade terceira real.
- A interface mostra a origem de cada número. Sem origem, o número não aparece.
- Dados internos de clientes ficam em `data/raw/internal/` (fora do Git).

## Fontes e viabilidade (setembro 2026)
| Fonte | O que dá | Acesso | Fiabilidade | Script |
|---|---|---|---|---|
| Google News RSS | Notícias por pesquisa, PT | Livre, sem chave | Boa para deteção; não é exaustiva | `collect_news.py` |
| Google Trends | Interesse relativo de pesquisa (0–100) por região | API oficial em alpha, com candidatura; biblioteca `pytrends` arquivada e só parcialmente funcional; exportação manual CSV sempre possível | Média: pode falhar por bloqueio | `collect_trends.py` |
| Meta Ad Library API | Anúncios entregues na UE: texto, datas, plataformas, alcance UE quando disponível | Token com identidade confirmada na Meta e app de programador | Boa; despesa e impressões só para anúncios políticos/sociais | `collect_meta_ads.py` |
| Google Ads Transparency Center | Anúncios Google por anunciante | Consulta manual | Boa, sem API oficial | Manual |
| TikTok Ad Library (DSA) | Anúncios TikTok entregues na UE | API de investigação com candidatura; consulta manual | Boa | Manual por agora |
| Marktest AdCheck | Investimento publicitário estimado por meio | Licença da agência | Referência de mercado | Manual (exportação) |
| Dados do cliente (ELO) | Sessões, primeiras mensagens, temas | Autorização do cliente | Alta | Manual, fora do Git |

### Notas de viabilidade
- **Google Trends.** A Google anunciou uma API oficial em alpha em julho de 2025, com acesso por candidatura. A biblioteca `pytrends` foi arquivada em abril de 2025 e funciona apenas em parte. Recomendação: candidatar a agência à alpha; entretanto usar `pytrends` com repetição limitada e, se falhar, exportação manual de CSV a partir de trends.google.com para `data/raw/trends/manual/`.
- **Meta Ad Library.** Por força do Regulamento dos Serviços Digitais (DSA), o repositório da Meta cobre todos os anúncios entregues na UE, não só os políticos. Os campos de despesa ficam vazios para anúncios comerciais. Confirmar nomes de campos e versão da Graph API na documentação atual antes de correr.
- **Scrapers de terceiros** (ex.: Apify) existem, mas usam caminhos não oficiais. Não usar sem validação jurídica e de IT.

## Fluxo de dados
```
scripts/collect_*.py  →  data/raw/<fonte>/<cliente>/<data>.csv   (com proveniência)
            ↓ (a construir: RB-09)
scripts/build_dataset.py  →  data/processed/<cliente>.json  →  prototype/arena-radar-v3-spv.html
```

## Limiares de materialidade (proposta inicial, a calibrar no piloto)
| Sinal | Limiar |
|---|---|
| Pesquisas | Semana ≥ 30% acima da média das 8 semanas anteriores, no cluster |
| Anúncios | Nova campanha de uma entidade de prioridade alta, ativa há ≥ 3 dias |
| Notícias | Tema presente em ≥ 3 meios nacionais na mesma semana |
| ELO | Variação semanal de utilização ≥ 25% (se houver dados) |
