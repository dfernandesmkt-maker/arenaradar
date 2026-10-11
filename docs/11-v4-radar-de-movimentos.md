# Arena Radar v4 — Radar de movimentos da concorrência

**Estado:** Protótipo de demonstração (dados fictícios) · **Decisões:** D50 a D52 · **Outubro 2026**

## 1. Porque mudámos
A v3 estava bem acabada, mas organizada por tipo de dado (Mercado, Procura, Criativos) e centrada num «sinal acima do limiar», com muita maquinaria de processo (vista do cliente, publicação, Impacto) para um produto que ainda não provou valor. A v4 parte de outra pergunta, a que uma equipa de conta faz de facto:

> **O que mexeu na concorrência esta semana, quem foi, com que prova, e o que vem a seguir?**

Objetivo do produto: seguir toda a atividade da concorrência e pôr a equipa (e o cliente) **à frente** dela. «Estar à frente» é:
1. **Ver primeiro** — saber em dias, não no relatório do mês seguinte.
2. **Perceber o padrão** — cada marca tem um ritmo; com histórico, antecipa-se a próxima vaga.
3. **Responder depressa** — respostas combinadas de antemão com o cliente; quando o movimento acontece, a equipa decide ativar.

Princípio mantido: **a plataforma sugere, a equipa decide.** Nada é ativado nem enviado ao cliente automaticamente.

## 2. O objeto central: o movimento
Um **movimento** é algo que um concorrente fez e que se pode provar. Tipos:

| Tipo | Exemplo | Prova |
|---|---|---|
| Campanha | «Norvo lançou "Regresso às Rotinas"» | Criativos, canais, oferta |
| Promoção | «Kaldo baixou 8 cêntimos por litro ao fim de semana» | Criativos, série de preço |
| Preço | «Kaldo está 4 cênt/L abaixo da média do mercado» | Série de preço |
| Lançamento | «Gema lançou entregas em 1 hora» | Criativos, notícia |
| Teste de criativos | «Duna está a testar 12 criativos com pouco alcance» | Criativos de teste |
| Leilão | «Ondal aparece em 53% das pesquisas da Vetra (+14 p.p.)» | Série Auction Insights |
| Imprensa | «Frescal abre 6 lojas no Norte» | Notícia |

Cada movimento tem: marca, data, canais, mensagem (território), oferta, peso (1 a 3), prova, **importância explicada** (soma de pontos visível na gaveta: peso, tipo, território onde o cliente compete, resposta combinada, novidade, sinal precoce), **o que costuma seguir-se** (histórico da mesma marca) e as **respostas combinadas** que lhe correspondem.

Níveis: **Importante** (≥ 75 pontos, topo amarelo = sinal), **A acompanhar** (≥ 50), **Informativo**.

## 3. Estrutura da plataforma
Âmbito no topo: **Agência · Vetra · Mercana**. Menu por cliente:

| Área | Pergunta | O que mostra |
|---|---|---|
| **Agora** | O que mexeu esta semana? | Cabeçalho com o movimento mais importante; KPIs; resumo da semana (na versão ligada, escrito por IA e revisto); fio de movimentos com prova; ao lado: o que vem a seguir, quem aparece nas pesquisas do cliente, quem está no ar |
| **Concorrentes** | Como age cada marca? | Fichas: estado atual, ritmo (campanhas por ano, duração, meses fortes, se testa antes), linha temporal de 12 meses + 12 semanas previstas, movimentos, biblioteca de criativos, mensagens vs cliente |
| **Comparar** | Quem pesa mais e onde? | Quota de voz, investimento estimado, quem aparece nas pesquisas do cliente, mapa de mensagens com **espaço livre**, preço (€/L ou índice do cabaz) |
| **À frente** | O que vem aí? | 12 semanas: janelas esperadas por marca, datas do setor, sinais precoces, e para cada previsão o que preparar e até quando |
| **Respostas** | Estamos prontos? | Respostas combinadas com o cliente (quando, o quê, quem, prazo, estado), as que correspondem a movimentos desta semana, lacunas sem resposta; ativar é decisão da equipa |
| Agência › **Torre** | Como estão todos os clientes? | Um cartão por cliente, importantes da semana e próximos movimentos esperados em todos |
| Agência › **Fontes** | De onde vêm os dados? | Fontes da versão ligada, regime (oficial, licenciada, dados do cliente) e estado |

**Estacionado da v3** (D52): vista do cliente e publicação, Impacto, Pergunta ao Radar, briefing semanal, alertas, vista por função. O que vai para o cliente sai, por agora, como slide ou email assinado pela Arena. Voltam quando o radar provar valor.

## 4. Antecipação: como se calculam as previsões
Calculadas no gerador a partir do histórico de cada marca, como a versão ligada fará com dados reais:
- **Séries que se repetem:** campanhas com o mesmo tema em anos diferentes. Semana de arranque esperada = média das semanas anteriores; janela = metade da variação entre anos (mínimo ±1 semana); confiança alta se a variação ≤ 1 semana, média ≤ 3, baixa acima.
- **Ritmo de promoções:** próxima promoção = última + intervalo habitual.
- **Sinais precoces:** testes de criativos com pouco alcance que, no histórico, antecederam campanhas (2 semanas); quando o teste aparece, a confiança sobe para alta. Subidas fortes no leilão de pesquisa do cliente.

Evitar a palavra «preditivo»: isto é **antecipação acionável** com método explicado em cada previsão.

## 5. Dados de demonstração
- Dois clientes **fictícios** (D51): **Vetra** (combustíveis) e **Mercana** (retalho alimentar, do tipo hipermercado). Concorrentes também fictícios: Norvo, Kaldo, Zefira, Ondal; Avanta, Duna, Frescal, Gema. Nenhum nome real (D33).
- O comportamento de cada marca está descrito em `config/v4/clientes/<cliente>.yaml` (campanhas recorrentes, promoções, lançamentos, preço, leilão, respostas, textos dos criativos).
- `python3 scripts/v4/gerar_dados.py` simula 2 anos (104 semanas) e escreve `data/v4/*.json`: cerca de 90 movimentos e 400 criativos por cliente, 6 a 7 previsões. Todos os blocos têm `origem` (`demo` ou `estimado`, com `metodo`).
- `python3 prototype/v4/build.py` gera `prototype/arena-radar-v4.html` (autocontido; `--artefacto` para publicar no claude.ai).

## 6. Fontes da versão ligada
Ver `config/v4/agencia.yaml` e a página Fontes: Meta Ad Library (API, todos os anúncios na UE), Google Ads Transparency (conjunto público no BigQuery, cobertura para Portugal por confirmar), TikTok Commercial Content Library, LinkedIn Ad Library, **Auction Insights das contas do cliente** (com autorização, Q12), Marktest (licenciada), DGEG (preços de combustíveis, oficial), monitorização de páginas de preço e folhetos (a validar com Compliance), notícias e Google Trends. Pontos de entrada: `LIGAÇÃO[…]` em `scripts/v4/gerar_dados.py` (ver `docs/09`).

## 7. Próximos passos propostos
1. **Validar a v4 com a equipa** (demonstração com dados fictícios).
2. **Teste de dados reais** (2 semanas, assim que possível): 1 vertical, 6 marcas reais, só fontes públicas; medir o que se recolhe por semana e com que qualidade. Termos de uso das APIs a confirmar com Compliance.
3. **Piloto interno** (6 semanas) com uma equipa de conta: fio de movimentos, fichas, biblioteca de criativos e resumo semanal por IA. Medida de sucesso: pelo menos uma vez, a equipa agiu mais cedo do que agiria sem o Radar.
4. Depois: respostas combinadas a sério com o cliente, Auction Insights, Torre com todos os clientes, saídas para o cliente.

## 8. Acrescentar um cliente à v4
Copiar `config/v4/clientes/vetra.yaml`, mudar `cliente`, `territorios`, `marcas`, `campanhas`, `promocoes`, `pontuais`, `precos`, `leilao`, `calendario`, `respostas` e `textos`, correr o gerador e o build. A interface não muda.
