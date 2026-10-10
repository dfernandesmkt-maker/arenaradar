# Arena Radar — Ponto de situação
*Para: Direção Arena Media Portugal · Preparado por: David · Outubro 2026*

---

## 1. Em síntese
- O Arena Radar é um produto interno que deteta o que muda no mercado de um cliente, interpreta o que isso significa e aponta à equipa as ações de meios possíveis. A plataforma sugere; a equipa decide.
- Conceito e experiência estão fechados: existe um protótipo navegável de alta fidelidade, multi-cliente, com vista Equipa e vista Cliente. Dados reais, motor de leitura e entrega automática ainda não existem.
- Proposta: um piloto de 6 semanas com um cliente real a escolher, sem desenvolvimento técnico pesado, para provar valor antes de pedir investimento.

## 2. O problema que resolve
- Os clientes esperam que a agência antecipe movimentos do mercado, não que os relate depois.
- A monitorização contínua não cabe na capacidade das equipas de conta. Hoje é feita de forma pontual e manual.
- Os dados de concorrência estão a tornar-se comuns (Meta Ad Library, Google Ads Transparency, Marktest AdCheck). O diferencial deixou de ser ter os dados e passou a ser saber o que fazer com eles.

## 3. A resposta
> O Radar não vende vigilância. Vende o "e então?".

| Camada | Pergunta | Quem faz |
|---|---|---|
| Observar | O que mudou? | Máquina, de forma contínua |
| Ler | O que significa para o cliente? | Máquina propõe, equipa valida |
| Pistas de ação | O que podemos fazer? | Máquina sugere, equipa decide o que leva ao cliente |

Três modos de entrega: alertas apenas para eventos materiais, briefing semanal à segunda-feira e pedidos pontuais. A máquina deteta; a equipa só entra no momento de decidir.

## 3.1 O que o protótipo já mostra
Protótipo em HTML único, que abre no browser sem servidor, com quatro **clientes fictícios** (Lumio, Vael, Kob e Verdia) em quatro verticais.
- **Torre de controlo** (Agência › Vertical › Cliente): sinais acima do limiar, fila de decisões e estado de publicação por cliente.
- **Um padrão de página para todos os clientes:** filtros → KPIs → o que mudou → gráfico principal → detalhe. Mercado, Procura e notícias, Criativos, Relatórios e Ações.
- **Duas vistas dos mesmos dados.** Equipa vê sinais, limiares e pistas de ação. Cliente vê só o que a equipa publicou; sem publicação não vê nada.
- **Pistas de ação com decisão da equipa** (aceitar, ajustar, descartar, atribuir a Performance, Brand ou Account) e módulo Impacto.
- **Selo de dados em cada página** (Demonstração, Real, Estimado ou Misto) e verificação automática da regra de ouro dos dados (`scripts/check_dataset.py`, também no GitHub).
- **Agnóstico ao cliente:** clientes, marcas e séries vêm de `config/`, não do código. Acrescentar um cliente é acrescentar um ficheiro (`docs/10-como-acrescentar-um-cliente.md`). Foi provado com clientes novos sem alterar código.
- **Pontos de ligação** marcados no código (`LIGAÇÃO[...]`, `docs/09-pontos-de-ligacao.md`) onde entram a Meta Ad Library, o Google, o TikTok e a Marktest.
- **Confiança nos números:** «Porquê?» em cada sinal (regra, números, janela, limiar, origem) e «Como se calcula» em cada KPI; cada número diz a sua janela.
- **Publicação com rascunho e publicado** (D34): o cliente só vê o que foi publicado, com pré-visualização ao lado e histórico de quem publicou e quando.
- **Ficha de marca** com comparação entre marcas; **alertas** só para eventos materiais; vista por função (Performance, Brand, Account, Direção).
- **Levar o Radar para onde a agência trabalha:** gráficos copiados como imagem com a origem dos dados, destaques acrescentados ao briefing semanal.
- Paleta de comandos (Ctrl K), modo apresentação, modo escuro e acessibilidade (teclado, leitores de ecrã, alvos tácteis).

## 4. Percurso até aqui
| Quando | Marco |
|---|---|
| Abril 2026 | Conceito inicial, documento estratégico, wireframes e primeiro protótipo. Piloto pensado para a PRIO. |
| Maio 2026 | Radar identificado como ponto em aberto no plano de conta PRIO 2026. |
| Junho 2026 | Reposicionamento: de "plataforma preditiva" para "antecipação acionável". Produto agnóstico ao cliente. Protótipo v2 ao nível de SaaS e módulo Impacto. |
| Setembro 2026 | Retoma para ponto de situação. Versão de demonstração com clientes fictícios. |
| Outubro 2026 | Revisão de UX e de estrutura. Protótipo v3 multi-cliente, orientado por configuração, com Torre de controlo, vistas Equipa e Cliente, publicação pela equipa e verificação automática dos dados. Retirado o cliente real de exemplo (D33). |

Detalhe e registo de decisões em `01-historico-e-decisoes.md`.

## 5. Estado por componente
| Componente | Estado | Nota |
|---|---|---|
| Conceito e proposta de valor | ✅ Fechado | Três camadas, três modos de entrega |
| Experiência (protótipo) | ✅ Alta fidelidade | v3 multi-cliente, vistas Equipa e Cliente, só com clientes fictícios |
| Arquitetura de dados e configuração | ✅ Feita no protótipo | `config/` → `build_dataset.py` → JSON; regra de ouro verificada automaticamente |
| Recolha de dados | 🟡 Iniciada | Scripts para notícias, Google Trends e Meta Ad Library, ainda sem dados reais (falta token da Meta e acesso de rede nos ambientes de teste) |
| Persistência e partilha entre a equipa | ⚪ Por construir | Decisões, rascunho, publicações e preferências ficam só no browser de cada pessoa (RB-22). Ponto de ligação `persistencia-equipa` |
| Entrega ao cliente e alertas por e-mail e Teams | ⚪ Por construir | Pré-visualização e cálculo dos alertas feitos; pontos de ligação `entrega-cliente` e `alertas-entrega`, com IT e Compliance |
| Motor de leitura e pistas de ação | ⚪ Por construir | Hoje simulado no protótipo |
| Entrega automática (briefing) | ⚪ Por construir | Formato desenhado, sem automatização |
| Validação com cliente | ⚪ Não iniciada | Proposta: piloto com um cliente real. O uso de nomes de clientes em demonstrações está por responder (Q04) |
| Modelo de valor | 🟡 Desenhado | Módulo Impacto pronto a medir, sem histórico real |
| Stack de produção | ⚪ Por decidir | Depende do IT (Microsoft vs. outro) |

## 6. Como escolher o cliente do piloto
O protótipo mostra o potencial com **clientes fictícios**. O cliente real do piloto é uma decisão da direção. Critérios propostos:
- **Contexto de mudança no mercado**, que torne a leitura útil logo nas primeiras semanas.
- **Universo legível:** poucas entidades a vigiar, com dados públicos disponíveis (Meta Ad Library, pesquisa, notícias).
- **Ligação a um ativo que já gerimos** (por exemplo, um assistente virtual do cliente), para o Radar apontar quando e onde ativar.
- **Acordo do cliente** para o uso do nome em demonstrações e, mais tarde, de dados internos (Q04 e Q05).

Nota: em alguns clientes a "concorrência" é sobretudo disputa de atenção e clareza de mensagem, não quota de mercado. O Radar tem dois tipos de universo, «concorrência» e «tema», para os dois casos (ver `docs/02-produto.md` e `docs/10-como-acrescentar-um-cliente.md`).

## 7. Cenários
| Cenário | O que implica | Investimento | Risco |
|---|---|---|---|
| **A. Piloto com um cliente real** (recomendado) | 6 semanas de briefing semanal com dados públicos e leitura da equipa | Tempo do David (estimativa: 3 a 4 h/semana) | Baixo |
| B. MVP funcional | Recolha automatizada, motor de leitura, stack decidido com IT | Tempo, IT, possíveis licenças | Médio: investir antes de provar valor |
| C. Arquivar | Fica como ativo de pitch | Nenhum | Perder a janela e o trabalho feito |

**Recomendação: A.** Prova o valor com um cliente real antes de pedir investimento. O módulo Impacto só convence com histórico real de pistas de ação e decisões.

### Desenho do piloto
- Semanas 1 a 3, **modo sombra**: o briefing é produzido e avaliado internamente, sem sair da agência.
- Semanas 4 a 6, **com o cliente**: a equipa escolhe as pistas que leva ao cliente, com o acordo prévio do contacto do cliente.
- Ponto de decisão na semana 7, com os critérios abaixo.

### Critérios de sucesso (proposta, a validar)
| Critério | Meta proposta |
|---|---|
| Briefings entregues a tempo | 6 em 6 |
| Tempo de produção por briefing | ≤ 3 h na semana 6 |
| Sinais considerados relevantes pela equipa | ≥ 50% |
| Pistas de ação aceites pela equipa | ≥ 1 por semana |
| Ações levadas ao cliente | ≥ 2 |
| Ações adotadas pelo cliente | ≥ 1 |

## 7.1 Próximos passos do produto (antes e durante o piloto)
1. Persistência partilhada pela equipa (decisões, rascunho e publicações), hoje só no browser (RB-22); entrega ao cliente e alertas por e-mail e Teams, com IT.
2. Ligar dados reais: Meta Ad Library (depende de token e de Q10), Google Trends e notícias.
3. Motor de leitura: passar as regras de sinal do protótipo para o pipeline de produção.
4. Capturas de ecrã e deck para a direção (RB-10).
5. Decisão de stack com o IT; documentação técnica já em `docs/dossier/02-tecnico/`.

## 8. O que pedimos à direção
1. Aprovação do piloto de 6 semanas, com o cliente a escolher, com o tempo alocado.
2. Autorização para usar internamente dados do cliente (por exemplo, utilização de um assistente virtual), se o cliente concordar.
3. Acesso à Marktest AdCheck para o universo do piloto, se ainda não estiver disponível.
4. Um contacto no IT para a decisão de stack, a preparar em paralelo para o cenário B.

## 9. Riscos e mitigação
| Risco | Mitigação |
|---|---|
| Fadiga de alertas | Limiares de materialidade por cliente; "sem sinais materiais" é um resultado válido |
| Dados incompletos ou instáveis (fontes não oficiais) | Etiqueta de origem em cada dado; fontes manuais como alternativa |
| Pista errada chegar ao cliente | A plataforma não fala com o cliente; a equipa decide sempre o que é partilhado |
| Dados de cliente fora do perímetro | Dados internos nunca saem do ambiente da agência nem vão para repositórios |
| Dependência de uma pessoa | Documentação completa e configuração por cliente replicável |

---

## Anexo — Guião do deck (8 slides)
| # | Título | Mensagem | Visual |
|---|---|---|---|
| 1 | Arena Radar | Do "o que aconteceu" ao "e então?" | Capa, logo, sweep do radar |
| 2 | O problema | Os dados tornaram-se comuns; a leitura não | 3 factos, sem texto corrido |
| 3 | A resposta | Observar, Ler, Pistas de ação. A plataforma sugere, a equipa decide | Diagrama das três camadas + três modos |
| 4 | Onde estamos | Conceito e experiência fechados; dados e motor por construir | Tabela de estado com semáforo |
| 5 | Demo: cliente fictício | Como seria uma segunda-feira com o Radar | Captura do briefing v3 + 1 pista de ação exemplo |
| 6 | Cenários | Três caminhos, um recomendado | A / B / C lado a lado |
| 7 | O piloto | 6 semanas, sombra depois cliente, critérios claros | Cronograma + tabela de critérios |
| 8 | O pedido | Quatro decisões concretas | Lista numerada |
