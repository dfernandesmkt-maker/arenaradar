# Arena Radar — Produto

## Proposta de valor
Deteta cedo o que mudou no mercado de um cliente e aponta à equipa as ações de meios possíveis. A plataforma sugere; a equipa decide. O valor está na leitura e nas pistas de ação, não na agregação de dados.

**Frase de posicionamento:** antecipação acionável para as decisões de meios dos nossos clientes.

## Três camadas
### 1. Observar — o que mudou?
Recolha contínua e deteção de variações face ao histórico. Exemplos de sinais: novo criativo de uma entidade do universo, pico de pesquisas, tema a ganhar espaço na imprensa, alteração de presença por canal.

### 2. Ler — o que significa?
Cada sinal material gera uma leitura: contexto, porque importa para este cliente, grau de confiança. Filtros de relevância (alta, média, baixa).

### 3. Pistas de ação — o que podemos fazer?
Opções concretas de meios (canal, mensagem, timing), apresentadas à equipa. Cada pista mostra a cadeia **sinal → leitura → ação possível**. A equipa aceita, ajusta ou descarta; só ela decide se e como leva a ação ao cliente.
Estados: sugerida → aceite / ajustada / descartada (equipa) → levada ao cliente (opcional) → adotada / não adotada → resultado observado.

## Três modos de entrega
| Modo | Quando | Formato |
|---|---|---|
| Alerta | Só quando um sinal ultrapassa o limiar de materialidade | Notificação curta com link para a leitura |
| Briefing semanal | Segunda-feira de manhã | Email/PDF de uma página para a equipa: 3 sinais, 1 a 2 pistas de ação, "sem sinais materiais" quando for o caso. Versão cliente opcional, montada pela equipa |
| Pedido pontual | Quando a equipa ou o cliente pergunta | Resposta sobre os dados do Radar |

O briefing semanal é a **funcionalidade âncora**: é o que se vê em 10 segundos e o primeiro a construir.

## Módulo Impacto
Segue cada pista ao longo do ciclo e agrega:
- pistas sugeridas, aceites, levadas ao cliente, adotadas;
- tempo entre sinal e decisão da equipa;
- resultado observado após adoção (métrica definida caso a caso).

Serve para provar o valor do Radar internamente e nas renovações de conta.

## Regras de produto
- A plataforma sugere, a equipa decide. Nada chega ao cliente sem decisão da equipa.
- O que a equipa leva ao cliente sai assinado pela Arena; a autoria individual fica na vista interna.
- Cada dado mostra a sua origem (real / estimado / demo).
- "Sem sinais materiais esta semana" é um resultado válido e deve ser mostrado como tal.
- Configuração por cliente em `config/clients/<cliente>.yaml`: universo, pesquisas, canais, limiares.

## Ecrãs (protótipo v2 de junho)
| Ecrã | Conteúdo |
|---|---|
| Visão geral | KPIs com sparklines, gráfico principal interativo (8/12/16 semanas), cartões dos três modos |
| Observar | Tabela do universo com barras de share of voice, sparklines, variação semanal, presença por canal; heatmap marcas × canais |
| Ler | Leituras com filtros de relevância |
| Recomendar (na v3: Pistas de ação) | Cartões com cadeia sinal → leitura → ação, botão validar, notificação |
| Impacto | Ciclo de vida das recomendações/pistas e agregados |
| Transversal | Seletor de cliente, paleta de comandos ⌘K, skeleton ao trocar de cliente |

## Ecrãs a acrescentar na v3
- **Briefing de segunda-feira**: pré-visualização do email tal como o cliente o recebe.
- **Configuração do cliente**: universo, pesquisas e limiares (só leitura na v3, gerado a partir do YAML).
- **Modo direção**: vista simplificada para apresentação, sem funcionalidades acessórias.
