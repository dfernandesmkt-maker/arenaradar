# Arena Radar — Ponto de situação
*Para: Direção Arena Media Portugal · Preparado por: David · Outubro 2026*

---

## 1. Em síntese
- O Arena Radar é uma ferramenta interna que segue **tudo o que os concorrentes de um cliente fazem** (campanhas, promoções, preços, lançamentos, testes de criativos, pesquisa paga, imprensa) e põe a equipa de conta **à frente** desses movimentos: ver primeiro, perceber o padrão, responder depressa. A plataforma sugere; a equipa decide.
- Existe um **protótipo navegável de alta fidelidade** com dois clientes fictícios (combustíveis e retalho alimentar). Mostra o produto completo com dados simulados. **Ainda não foi testado com dados reais.**
- Proposta: um **teste de dados reais de 2 semanas** (só fontes públicas) e, se passar, um **piloto de 6 semanas** com uma equipa de conta. Sem desenvolvimento técnico pesado nem licenças novas antes de provar valor.

## 2. O problema que resolve
- Os clientes esperam que a agência antecipe os movimentos da concorrência, não que os relate no fim do mês.
- Seguir a concorrência de forma contínua não cabe no tempo das equipas de conta. Hoje é feito de forma pontual e manual.
- Os dados tornaram-se públicos (Meta Ad Library, Google Ads Transparency, TikTok Commercial Content Library, preços publicados). O diferencial deixou de ser ter os dados e passou a ser **ver a tempo e saber o que fazer**.

## 3. A resposta: um radar de movimentos
> O Radar não vende vigilância. Vende tempo: saber antes, com prova, e já com uma resposta combinada.

O objeto central é o **movimento**: algo que um concorrente fez e que se pode provar. Cada movimento traz a prova (criativos, série de preço, dados de pesquisa), **porque é importante** (pontos explicados), **o que a marca costuma fazer a seguir** (pelo seu histórico) e se há **resposta combinada** com o cliente.

| Área | Pergunta | O que mostra |
|---|---|---|
| **Agora** | O que mexeu esta semana? | O movimento mais importante no topo, o resumo da semana pronto a rever e o fio de movimentos com prova |
| **Concorrentes** | Como age cada marca? | Ficha viva: ritmo, linha temporal, biblioteca de criativos, como comunica (classificação automática) |
| **Comparar** | Quem pesa mais e onde? | Quota de voz, investimento estimado, mapa de mensagens com território livre, preço, pesquisa paga |
| **Antecipar** | O que vem aí? | As próximas 12 semanas pelo histórico de cada marca, sinais precoces, o **plano do cliente** e os choques com a concorrência |
| **Respostas** | Estamos prontos? | O que está combinado com o cliente para cada tipo de movimento; a equipa decide ativar |
| **Torre** (agência) | Como estão todos os clientes? | Um cartão por cliente com o que importa e o que vem a seguir |

**Antecipação acionável, não adivinhação.** As previsões vêm de padrões visíveis (a mesma campanha na mesma altura do ano, o ritmo das promoções, testes de criativos que antecedem campanhas) e mostram sempre o método e a confiança.

**IA com supervisão.** O resumo de segunda-feira (em 30 segundos, decisões para a equipa, rascunho de email para o cliente) e a classificação dos criativos podem ser feitos por IA. O texto fica sempre «por rever» até alguém da equipa o rever; o email só se copia depois disso; nada é enviado ao cliente automaticamente. Ao modelo só seguem dados públicos sobre concorrentes. Na demonstração, este trabalho é feito por regras; o uso de IA real depende de IT e Compliance (Q13).

## 4. O que a demonstração mostra
Protótipo em HTML único (`prototype/arena-radar-v4.html`), sem servidor, com o botão **«Demonstração»**: um percurso de 7 passos para reuniões.
1. **O que mexeu:** a Kaldo baixou 8 cêntimos por litro ao fim de semana (cliente fictício Vetra).
2. **A prova e o porquê:** criativos, série de preço, pontos de importância, o que a Kaldo costuma fazer a seguir.
3. **O resumo de segunda-feira:** escrito, por rever, com as decisões que cabem à equipa.
4. **O que vem aí:** a Zefira começou a testar criativos com pouco alcance; no histórico, isso antecede a campanha de inverno.
5. **Choque com o nosso plano:** a campanha de preço da Vetra cai na semana da Black Friday da Kaldo, no mesmo território. Ainda há tempo para mudar.
6. **Respostas combinadas:** o que fazer está acordado de antemão; a equipa ativa.
7. **Torre:** os dois clientes lado a lado.

Todos os dados são de demonstração (clientes e marcas fictícios, D33 e D51), com selo de origem em cada página. Os métodos de cálculo (importância, previsões, choques) são os que a versão ligada usará com dados reais.

## 5. Percurso até aqui
| Quando | Marco |
|---|---|
| Abril 2026 | Conceito inicial, documento estratégico, wireframes e primeiro protótipo. Piloto pensado para a PRIO. |
| Maio 2026 | Radar identificado como ponto em aberto no plano de conta PRIO 2026. |
| Junho 2026 | Reposicionamento: de "plataforma preditiva" para "antecipação acionável". Produto agnóstico ao cliente. Protótipo v2. |
| Setembro 2026 | Retoma para ponto de situação. Versão de demonstração com clientes fictícios. |
| Outubro 2026 | Protótipo v3: multi-cliente, orientado por configuração, vistas Equipa e Cliente, verificação automática da regra de ouro dos dados. Retirado o cliente real de exemplo (D33). |
| Outubro 2026 | **Reorientação para radar de movimentos (v4, D50):** o movimento da concorrência como objeto central, previsões pelo histórico, respostas combinadas, resumo por IA sempre revisto (D54), plano do cliente e choques, roteiro de demonstração. Dois clientes fictícios (D51). |

O que a v3 tinha e não entrou na v4 (vista do cliente e publicação, Impacto, Pergunta ao Radar, alertas, vista por função) fica estacionado (D52) e volta quando o radar provar valor. Detalhe em `01-historico-e-decisoes.md` e no registo de decisões do dossier.

## 6. Estado por componente
| Componente | Estado | Nota |
|---|---|---|
| Conceito e estrutura | ✅ Redefinido (D50) | Radar de movimentos; especificação em `docs/11-v4-radar-de-movimentos.md` |
| Protótipo | ✅ Alta fidelidade | 2 clientes fictícios, roteiro de demonstração, telemóvel, contraste AA nos dois temas |
| Deteção de movimentos, importância, previsões, choques | 🟡 Feitos com dados simulados | Métodos prontos; **por provar com dados reais** (teste de 2 semanas) |
| Resumo da semana e classificação de criativos | 🟡 Por regras | Ligação a IA feita e testada com respostas simuladas; uso real depende da Q13 |
| Recolha de dados reais | ⚪ Por fazer | Pontos de entrada marcados no código (`docs/09-pontos-de-ligacao.md`); depende dos termos de uso (Q10) e do acesso à Meta Ad Library |
| Dados do cliente (pesquisa paga, plano de meios) | ⚪ Por ligar | Com autorização do cliente (Q12); nunca saem do ambiente da agência |
| Partilha entre a equipa (decisões, revisões) | ⚪ Por construir | Hoje ficam no browser de cada pessoa (RB-116) |
| Saída para o cliente | 🟡 Rascunho de email | Copiável depois de revisto, assinado pela Arena; slide da semana por fazer (RB-117) |
| Validação com a equipa | ⚪ Não iniciada | Antes da reunião: mostrar a 1 ou 2 colegas de conta |
| Stack de produção | ⚪ Por decidir | Com o IT (Microsoft ou outro); dados em JSON simples para migrar sem retrabalho |

## 7. Proposta
### Passo 1 — Teste de dados reais (2 semanas)
- 1 vertical, cerca de 6 marcas reais, **só fontes públicas** (Meta Ad Library, Google Ads Transparency, TikTok, notícias, preços publicados).
- Mede o que interessa: que parte dos movimentos o Radar vê, com quanto atraso, com que qualidade e quanto trabalho manual sobra.
- Sai uma decisão simples: avançar para o piloto, ajustar ou parar.
- Depende de Compliance validar os termos de uso das fontes (Q10). Os dados reais ficam fora do protótipo de demonstração.

### Passo 2 — Piloto (6 semanas), se o teste passar
- Uma equipa de conta e um cliente, a escolher pela direção.
- Semanas 1 a 3, **modo sombra**: o Radar corre; a equipa compara com o que já sabia e regista o que viu primeiro.
- Semanas 4 a 6, **em uso**: resumo de segunda-feira revisto pela equipa e respostas combinadas com o cliente.
- Ponto de decisão na semana 7.

### Critérios de sucesso (proposta, a validar)
| Critério | Meta proposta |
|---|---|
| Movimentos considerados relevantes pela equipa | ≥ 50% |
| Vezes em que a equipa soube ou agiu mais cedo do que sem o Radar | ≥ 1 (registado) |
| Tempo para rever o resumo de segunda-feira | ≤ 1 h por semana na semana 6 |
| Previsões registadas e verificadas (acertos e falhas) | Todas, para calibrar a confiança |
| Respostas combinadas com o cliente | ≥ 3 |
| Dados sem origem na interface | 0 |

### Como escolher o cliente do piloto
- **Mercado com concorrência ativa e visível** (campanhas e promoções frequentes, muito digital), para haver movimentos logo nas primeiras semanas.
- **Universo legível:** 4 a 6 concorrentes com presença nas bibliotecas de anúncios.
- **Equipa disponível** para o modo sombra e para combinar respostas com o cliente.
- **Acordo do cliente** para usar dados das suas contas (pesquisa paga) e, mais tarde, o nome em demonstrações (Q04, Q12).

### Cenários
| Cenário | O que implica | Investimento | Risco |
|---|---|---|---|
| **A. Teste + piloto** (recomendado) | 2 semanas de teste com fontes públicas; 6 semanas de piloto se passar | Tempo do David (estimativa: 3 a 4 h por semana) e de uma equipa de conta no piloto | Baixo |
| B. Construir já a versão ligada | Recolha automática, base partilhada, stack decidido com o IT | Tempo, IT, possíveis licenças | Médio: investir antes de provar valor com dados reais |
| C. Arquivar | Fica como ativo de pitch | Nenhum | Perder a janela e o trabalho feito |

**Recomendação: A.** O protótipo mostra o que o produto faz; só os dados reais mostram se o faz bem.

## 8. O que pedimos à direção
1. **Aprovar o teste de dados reais de 2 semanas** com fontes públicas, com Compliance a validar os termos de uso (Q10).
2. **Aprovar o piloto de 6 semanas** se o teste passar, e escolher a equipa e o cliente.
3. **Encaminhar para IT e Compliance** as perguntas que decidem a versão ligada: uso de IA (Q13), dados de pesquisa paga das contas dos clientes (Q12), processo de aprovação de ferramentas (Q01) e ambiente aprovado (Q02).
4. **Acesso à Marktest** (ou outra fonte licenciada de investimento) para o vertical do teste, se já existir no grupo (Q11).

## 9. Riscos e mitigação
| Risco | Mitigação |
|---|---|
| As fontes públicas não chegam para ver os movimentos que importam | É exatamente o que o teste de 2 semanas mede, antes de qualquer investimento |
| Previsões erradas | Cada previsão mostra o método, a janela e a confiança; no piloto, registam-se acertos e falhas para calibrar |
| Texto da IA errado ou inventado | Fica sempre «por rever»; o email só se copia depois de revisto; ao modelo só seguem factos do Radar |
| Algo chegar ao cliente sem decisão | A plataforma não fala com o cliente; o que sai é assinado pela Arena, por decisão da equipa |
| Dados do cliente fora do perímetro | Plano de meios e dados de pesquisa paga ficam no ambiente da agência; nunca em repositórios nem enviados a modelos de IA |
| Fadiga de informação | Importância explicada e três níveis (importante, a acompanhar, informativo); «semana calma» é um resultado válido |
| Dependência de uma pessoa | Documentação completa (dossier), configuração por cliente num ficheiro |

---

## Anexo — Guião do deck (9 slides)
Deck: `deliverables/arena-radar-direcao.pptx` (gerado por `scripts/deck/gerar_deck.js`, com capturas do protótipo).

| # | Título | Mensagem | Visual |
|---|---|---|---|
| 1 | Arena Radar | Ver primeiro. Perceber o padrão. Responder depressa. | Capa Guerrilla Forest, logo |
| 2 | O problema | Os dados tornaram-se públicos; ver a tempo e saber o que fazer, não | 3 factos curtos |
| 3 | A resposta | O movimento como objeto central: prova, porquê, o que vem a seguir, resposta combinada | Diagrama do movimento + 5 áreas |
| 4 | Agora | Segunda-feira: o que mexeu, com prova | Captura de Agora |
| 5 | Antecipar | O que vem aí e o choque com o nosso plano | Captura de Antecipar |
| 6 | A equipa decide | Resumo por rever, respostas combinadas, nada sai sozinho | Captura do resumo + princípios |
| 7 | Onde estamos | Protótipo completo; dados reais por provar | Tabela de estado com semáforo |
| 8 | A proposta | Teste de 2 semanas, piloto de 6, critérios claros | Cronograma + critérios |
| 9 | O pedido | Quatro decisões concretas | Lista numerada |
