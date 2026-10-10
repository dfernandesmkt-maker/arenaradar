# Arena Radar — Histórico e registo de decisões

## Fase 1 · Abril 2026 — Conceito inicial
**Origem.** Exercício sobre processos a otimizar na agência. De várias direções de automação, foi escolhida a mais disruptiva: um painel que junta inteligência de concorrência, recomendações e performance.

**Entregáveis produzidos**
- Documento estratégico (Word, PT-PT): sumário executivo, problema, visão, racional do piloto PRIO, fontes de dados, plano em 3 fases (2 a 3 meses), riscos, próximos passos. → Guardar em `docs/legacy/`.
- Wireframes de baixa fidelidade (HTML navegável): guia de introdução, home cliente, inteligência competitiva, recomendações, performance, home interna, fila de validação interna.
- Protótipo de alta fidelidade (HTML, 7 ecrãs), estética "centro de comando editorial": fundo escuro, Fraunces nos títulos, JetBrains Mono nos dados, amarelo `#f7d046`.

**Piloto pensado: PRIO.** Mercado de combustíveis com poucos concorrentes identificáveis (Galp, BP, Repsol, Cepsa), o que torna o universo tratável só com fontes gratuitas.

**Fontes previstas.** Fase 1 gratuita: Meta Ad Library, Google Trends, TikTok Creative Center, Google Ads Transparency Center, redes sociais orgânicas, APIs de notícias. Fase 2 paga, após validação: Marktest AdCheck, Similarweb, SEMrush.

## Fase 2 · Maio 2026 — Radar no plano de conta PRIO
No planeamento PRIO 2026 surgiu a nota "Arena Radar? Rever este ponto". Foram postos três cenários: (a) o Radar como produto consultivo regular para a PRIO; (b) o Radar substituído pelo "Panorama de Meios e Concorrência"; (c) os dois coexistem. Leitura proposta: (c), com o Radar como motor e o Panorama como output formal trimestral. **Decisão final por confirmar.**

## Fase 3 · Junho 2026 — Reposicionamento e protótipo v2
**Contexto técnico.** A agência trabalha em stack Microsoft. Os modelos da Anthropic passaram a estar disponíveis no ecossistema Microsoft (Copilot Studio, Power Platform), com opt-in do administrador para tenants da UE. Mapeamento proposto: Power BI (painel), Copilot Studio (agente "pergunta ao Radar"), Power Automate (briefing de segunda-feira), SharePoint/Dataverse (dados). **Decisão: pôr o stack em suspenso e focar conceito e redesign.**

**Reposicionamento do conceito**
- De "plataforma de competitive intelligence + recomendação preditiva" para um produto que vende o "e então?".
- "Preditivo" substituído por "antecipação acionável", porque convidava à pergunta "prever com base em quê?".
- Três camadas (Observar, Ler, Recomendar) e três modos de entrega (alertas materiais, briefing semanal, pedidos pontuais).
- Resolução da preocupação de capacidade: a máquina deteta de forma contínua; o David só entra no ponto de decisão.
- Produto agnóstico ao cliente, com parâmetros configuráveis (concorrentes, canais, limiares de materialidade).

**Protótipos**
- v1 claro: navegação pelas três camadas, seletor multi-cliente com clientes fictícios (Lumio/energia, Vael/seguros, Kob/mobilidade), cartões dos três modos de entrega.
- v2 ao nível de SaaS: gráfico principal interativo com tooltip e períodos de 8/12/16 semanas; KPIs com sparklines e variação; tabela de concorrentes com barras de SOV, sparklines e presença por canal; heatmap marcas × 8 canais; paleta de comandos (⌘K); notificações ao validar; carregamento com skeleton; filtros de relevância em Ler; cadeia sinal → leitura → ação em cada recomendação.
- Melhoria-chave adicionada: **módulo Impacto**, que segue cada recomendação do sinal à validação, adoção pelo cliente e resultado observado. Resolve o problema de provar o valor do Radar internamente e nas renovações.
- Todos os dados marcados como dados de demonstração. Clientes fictícios de propósito, para não atribuir dados falsos a marcas reais.

**Próximo passo então definido:** deck de pitch interno. Não chegou a ser feito.

## Fase 4 · Setembro 2026 — Retoma
- Pedido de ponto de situação para a direção.
- Cliente exemplo real, com dados mistos (reais onde houver). Retirado em outubro de 2026 (D33): a demonstração passou a usar só clientes fictícios.
- Próximo passo (protótipo vs. MVP) por definir; recomendação: piloto de 6 semanas com um cliente real a escolher.
- Desenvolvimento migra para Claude Code com repositório GitHub.
- Direção de produto definida: ferramenta para todos os clientes e verticais, torre de controlo da concorrência, posicionamento complementar à Research, interface clara com temas por cliente e motion com propósito (D19 a D21). Detalhe no backlog, secção "Evolução do produto".
- Reenquadramento da terceira camada: de "Recomendar" para "Pistas de ação". A plataforma dá informação e pistas; a equipa decide o que fazer e o que leva ao cliente (D16).

---

## Registo de decisões
| # | Data | Decisão | Razão |
|---|---|---|---|
| D01 | Abr 2026 | Navegação home com drill-down por camada | Cada camada tem o seu ecrã; leitura rápida para o cliente |
| D02 | Abr 2026 | Atualização contínua em vez de ciclo semanal fixo | "Sempre fresco"; o ciclo semanal passa a ser um modo de entrega |
| D03 | Abr 2026 | Vista cliente sem autoria individual: "A Arena recomenda" | A recomendação é da agência, não de uma pessoa |
| D04 | Abr 2026 | Validação humana obrigatória antes da vista cliente | Controlo de qualidade sobre rascunhos gerados por IA |
| D05 | Abr 2026 | Fontes gratuitas primeiro, pagas só após validação | Custo zero até haver prova de valor |
| D06 | Jun 2026 | Stack Microsoft em suspenso | Focar no conceito; decisão técnica depende do IT |
| D07 | Jun 2026 | Vender o "e então?", não os dados | Dados de concorrência estão a tornar-se comuns |
| D08 | Jun 2026 | Abandonar "preditivo" | Promessa difícil de sustentar sem dados |
| D09 | Jun 2026 | Produto agnóstico ao cliente | Capacidade replicável da agência, não ferramenta de um cliente |
| D10 | Jun 2026 | Alertas só para eventos materiais | Evitar fadiga de alertas |
| D11 | Jun 2026 | Módulo Impacto | O produto documenta o próprio valor |
| D12 | Jun 2026 | Estética clara, SaaS, marca Arena | A estética escura editorial não servia um produto de uso diário |
| D13 | Set 2026 | Cliente real como exemplo, com dados mistos. **Substituída pela D33** | Contexto de mudança real e ligação a um ativo gerido pela agência |
| D14 | Set 2026 | Etiqueta de origem em cada dado (real / estimado / demo) | Dados mistos exigem transparência total perante a direção |
| D15 | Set 2026 | Desenvolvimento em Claude Code + GitHub | Persistência, versões e execução real de recolha de dados |
| D16 | Set 2026 | "Recomendar" passa a "Pistas de ação": a plataforma sugere, a equipa decide | O controlo e o poder de decisão ficam com a equipa; nada chega ao cliente sem essa decisão |

## Ideias paralelas ligadas ao Radar (não integradas)
- **Visibilidade em assistentes de IA ("share of model").** Medir como as marcas aparecem nas respostas de ChatGPT, Gemini e outros. Candidato natural a módulo futuro do Radar. Uma auditoria semelhante para um cliente real foi ponderada e posta de parte por agora.
