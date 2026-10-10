# Cliente exemplo — Sociedade Ponto Verde (SPV)

Configuração técnica em `config/clients/spv.yaml`. Este documento explica o racional.

## 1. Contexto (dados reais, com fonte)
| Facto | Fonte |
|---|---|
| A SPV é uma das entidades gestoras licenciadas do SIGRE (sistema integrado de embalagens), a par da Novo Verde e do Electrão. Existem ainda outras entidades licenciadas para fluxos de embalagens específicos: Valormed, Sigeru e SDR Portugal. | APA — apambiente.pt/residuos/embalagens-e-residuos-de-embalagens |
| O sistema de depósito e reembolso **Volta** (gerido pela SDR Portugal) arrancou a 10 de abril de 2026: 0,10 € por garrafa de plástico ou lata até 3 litros, devolvidos na entrega. | Observador, 08/04/2026; DN, 10/04/2026 |
| A partir de 10 de agosto de 2026 a Volta passou a abranger todas as embalagens de bebida de uso único elegíveis. | Cuatrecasas, 05/05/2026 |
| Entre 10 de abril e 6 de julho a Volta recolheu cerca de 55,5 milhões de embalagens; o universo anual abrangido ronda 2,1 mil milhões. | Renascença, 20/07/2026 |
| Em 2025 Portugal registou 60,5% de retoma de resíduos de embalagens, abaixo da meta europeia de 65%. | Diário de Viseu (Lusa), 14/07/2026 |
| No 1.º semestre de 2026 a recolha seletiva cresceu cerca de 0,9%, para 233 065 t. O plástico caiu 6,6% (40 031 t); o papel/cartão subiu 4,8%. | Diário de Viseu (Lusa), 14/07/2026 |
| Segundo a SPV, 7 em cada 10 portugueses separam embalagens, mas só 1 desses separa bem; é a necessidade a que o chatbot responde. | pontoverde.pt |
| A Academia Ponto Verde regressa às escolas no ano letivo 2026/2027 com a assinatura "Vamos aprender a separar juntos?". | pontoverde.pt |

## 2. O que muda face a um cliente "normal"
A SPV não compete por quota de mercado. O Radar SPV lê três coisas:
1. **Procura e dúvida** — o que as pessoas pesquisam sobre separar embalagens, e quando.
2. **Voz no tema** — quem está a comunicar sobre reciclagem e com que mensagem (entidades gestoras, Volta, retalho, municípios).
3. **Agenda** — notícias, dados oficiais e marcos regulatórios que mudam o contexto.

E liga tudo à **utilização do ELO** (dados internos, só com autorização do cliente).

## 3. Universo a monitorizar
| Entidade | Papel | Prioridade |
|---|---|---|
| Sociedade Ponto Verde | Cliente | — |
| Novo Verde | Entidade gestora SIGRE | Alta |
| Electrão | Entidade gestora SIGRE (também outros fluxos) | Alta |
| SDR Portugal / Volta | Sistema de depósito para garrafas e latas | Alta |
| Retalhistas que comunicam a Volta (a confirmar) | Pontos de devolução | Média |
| Sistemas municipais de gestão de resíduos (a confirmar) | Recolha seletiva local | Baixa |

## 4. Hipóteses de leitura para testar com dados
Estas são hipóteses, não conclusões. Servem para orientar a recolha e só entram no protótipo como tal.

- **H1 — Confusão Volta vs. ecoponto.** Com a Volta, garrafas e latas elegíveis passam a ter dois destinos possíveis. É provável que a dúvida "onde ponho isto?" tenha aumentado desde abril e sobretudo desde agosto. *Teste:* Google Trends PT para pesquisas sobre Volta e ecoponto, antes e depois de 10/04 e 10/08. *Se confirmar:* janela para ativar o ELO com uma mensagem "ecoponto ou Volta?".
- **H2 — Queda do plástico no ecoponto.** Parte da queda de 6,6% do plástico no 1.º semestre pode refletir desvio de garrafas para a Volta, e não menos separação. *Teste:* comparar com os números da Volta e com a composição da recolha. *Se confirmar:* a narrativa pública de "estagnação" precisa de contexto; a SPV pode liderar essa explicação.
- **H3 — Sazonalidade da dúvida.** Picos previsíveis (Natal, verão, regresso às aulas) permitem calendarizar ativações do ELO antes do pico, não durante. *Teste:* 5 anos de Google Trends.

## 5. Exemplo de briefing de segunda-feira (formato; conteúdo a preencher com dados reais)
> **Arena Radar · Sociedade Ponto Verde · Semana de [data]**
> **O que mudou:** [sinal 1 com fonte] · [sinal 2 com fonte] · [sinal 3 com fonte]
> **O que significa:** [leitura em 2 frases]
> **Pistas de ação para a equipa:** [ação possível, canal, prazo]
> *Todos os dados com origem identificada. Nenhum sinal material = briefing curto, e isso é informação.*

## 6. Dados por origem nesta versão
| Bloco | Origem | Nota |
|---|---|---|
| Pesquisas (Google Trends) | Real | Índice relativo 0–100, não volume |
| Anúncios em Meta | Real | Ad Library cobre todos os anúncios entregues na UE; despesa não disponível para anúncios comerciais |
| Notícias | Real | Google News RSS |
| Investimento publicitário | Real se houver acesso Marktest AdCheck | Recolha manual |
| Utilização ELO | Real se autorizado; senão demo | Nunca no repositório |
| Pistas de ação e Impacto | Demo, marcadas como tal | Até existir histórico do piloto |
