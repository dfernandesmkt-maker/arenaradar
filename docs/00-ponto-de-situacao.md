# Arena Radar — Ponto de situação
*Para: Direção Arena Media Portugal · Preparado por: David · Setembro 2026*

---

## 1. Em síntese
- O Arena Radar é um produto interno que deteta o que muda no mercado de um cliente, interpreta o que isso significa e aponta à equipa as ações de meios possíveis. A plataforma sugere; a equipa decide.
- Conceito e experiência estão fechados: existe um protótipo navegável de alta fidelidade. Dados reais, motor de leitura e entrega automática ainda não existem.
- Proposta: um piloto de 6 semanas com a Sociedade Ponto Verde, sem desenvolvimento técnico pesado, para provar valor antes de pedir investimento.

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

## 4. Percurso até aqui
| Quando | Marco |
|---|---|
| Abril 2026 | Conceito inicial, documento estratégico, wireframes e primeiro protótipo. Piloto pensado para a PRIO. |
| Maio 2026 | Radar identificado como ponto em aberto no plano de conta PRIO 2026. |
| Junho 2026 | Reposicionamento: de "plataforma preditiva" para "antecipação acionável". Produto agnóstico ao cliente. Protótipo v2 ao nível de SaaS e módulo Impacto. |
| Setembro 2026 | Retoma para ponto de situação. Versão exemplo com a Sociedade Ponto Verde. |

Detalhe e registo de decisões em `01-historico-e-decisoes.md`.

## 5. Estado por componente
| Componente | Estado | Nota |
|---|---|---|
| Conceito e proposta de valor | ✅ Fechado | Três camadas, três modos de entrega |
| Experiência (protótipo) | ✅ Alta fidelidade | v2 navegável com clientes fictícios; v3 SPV em construção |
| Recolha de dados | 🟡 Iniciada | Scripts para notícias, Google Trends e Meta Ad Library; por testar em produção |
| Motor de leitura e pistas de ação | ⚪ Por construir | Hoje simulado no protótipo |
| Entrega automática (briefing) | ⚪ Por construir | Formato desenhado, sem automatização |
| Validação com cliente | ⚪ Não iniciada | Proposta: piloto SPV |
| Modelo de valor | 🟡 Desenhado | Módulo Impacto pronto a medir, sem histórico real |
| Stack de produção | ⚪ Por decidir | Depende do IT (Microsoft vs. outro) |

## 6. Porquê a Sociedade Ponto Verde como exemplo
- **Contexto de mudança real.** O sistema de depósito Volta arrancou a 10 de abril de 2026 e generalizou-se a 10 de agosto. Muda o que o consumidor faz com garrafas e latas.
- **Pressão de resultados.** Em 2025 Portugal ficou nos 60,5% de retoma de embalagens, abaixo da meta europeia de 65%. No 1.º semestre de 2026 a recolha seletiva cresceu cerca de 1%.
- **Ligação a um ativo que já gerimos.** O chatbot ELO responde à dúvida "onde separo isto?". O Radar pode detetar quando essa dúvida aumenta e apontar quando e onde ativar.
- **Universo legível.** Poucas entidades a comunicar sobre o tema (SPV, Novo Verde, Electrão, SDR Portugal), muita conversa pública e sazonalidade clara.

Nota: aqui a "concorrência" é sobretudo disputa de atenção e clareza de mensagem, não quota de mercado. O Radar SPV lê procura, dúvidas e voz no tema. Detalhe em `03-cliente-exemplo-spv.md`.

## 7. Cenários
| Cenário | O que implica | Investimento | Risco |
|---|---|---|---|
| **A. Piloto SPV** (recomendado) | 6 semanas de briefing semanal com dados públicos e leitura da equipa | Tempo do David (estimativa: 3 a 4 h/semana) | Baixo |
| B. MVP funcional | Recolha automatizada, motor de leitura, stack decidido com IT | Tempo, IT, possíveis licenças | Médio: investir antes de provar valor |
| C. Arquivar | Fica como ativo de pitch | Nenhum | Perder a janela e o trabalho feito |

**Recomendação: A.** Prova o valor com um cliente real antes de pedir investimento. O módulo Impacto só convence com histórico real de pistas de ação e decisões.

### Desenho do piloto
- Semanas 1 a 3, **modo sombra**: o briefing é produzido e avaliado internamente, sem sair da agência.
- Semanas 4 a 6, **com o cliente**: a equipa escolhe as pistas que leva à SPV, com o acordo prévio do contacto do cliente.
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

## 8. O que pedimos à direção
1. Aprovação do piloto SPV de 6 semanas, com o tempo alocado.
2. Autorização para usar internamente dados de utilização do ELO, se o cliente concordar.
3. Acesso à Marktest AdCheck para o universo SPV, se ainda não estiver disponível.
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
| 5 | Demo: Sociedade Ponto Verde | Como seria uma segunda-feira com o Radar | Captura do briefing v3 + 1 pista de ação exemplo |
| 6 | Cenários | Três caminhos, um recomendado | A / B / C lado a lado |
| 7 | O piloto | 6 semanas, sombra depois cliente, critérios claros | Cronograma + tabela de critérios |
| 8 | O pedido | Quatro decisões concretas | Lista numerada |
