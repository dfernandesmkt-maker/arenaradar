# Especificação de UX/UI — padrão de página e componentes

**Estado:** Aprovada pelo David; implementada na fase C (out. 2026) · **Fase:** B → C · **Ponto de partida:** `07-revisao-ux-e-estrutura.md`

Decisões de base (D26 a D28, em `docs/dossier/04-registos/decisoes.md`): duas vistas (Equipa e Cliente), menu único com seletor de âmbito e selo de dados por página.

## 1. Princípios
1. **Ler como um dashboard de reporting.** Mesma ordem em todas as páginas: filtros → KPIs → o que mudou → gráfico principal → detalhe.
2. **A conclusão vem primeiro.** Títulos e cartões dizem o que mudou, não o nome da secção.
3. **Um menu para todos os clientes.** O que muda é o conteúdo, não a estrutura.
4. **Filtros sempre no mesmo sítio** e partilhados por toda a página.
5. **Detalhe a pedido.** Clicar num KPI, barra, marca ou anúncio abre uma gaveta; a página não cresce.
6. **A plataforma sugere, a equipa decide.** Pistas só na vista Equipa; na vista Cliente só o que a equipa publicou.
7. **Honestidade nos dados.** Estados vazios claros («sem sinais», «por ligar»); nunca preencher o que não existe.

## 2. Navegação

### Seletor de âmbito (topo, à esquerda)
```
Arena Radar   [ Agência ▾ ] › [ Ambiente e economia circular ▾ ] › [ Verdia ▾ ]
```
- Três níveis: **Agência › Vertical › Cliente**. É a única forma de mudar de contexto.
- No nível Agência o menu é o da Torre de controlo; nos outros, o do cliente.
- O cliente ativo é sempre visível; a barra lateral nunca mostra um cliente diferente do selecionado.

### Menu do cliente (igual para todos)
| Item | Para quê | Adaptação por tipo de universo |
|---|---|---|
| **Visão geral** | KPIs, o que mudou, tendência principal | Igual |
| **Mercado** | Quem está a comunicar e com que peso | *Concorrência*: marcas, quota de voz, campanhas. *Tema*: entidades, voz no tema, agenda |
| **Procura e notícias** | O que se pesquisa e o que se diz | Igual |
| **Criativos** | Galeria de anúncios, formatos e mensagens | Aparece só se houver anúncios |
| **Relatórios** | Briefing semanal, vista cliente, exportações | Igual |
| **Ações** *(só vista Equipa)* | Pistas de ação, decisões, impacto | Igual |

Nível Agência: **Torre de controlo** · **Fontes de dados**.

## 3. Padrão de página

```
┌──────────────────────────────────────────────────────────────────────────┐
│ Âmbito ▾                                   Pergunta ao Radar    Equipa|Cliente │
├──────────────────────────────────────────────────────────────────────────┤
│ Título-conclusão (1 frase)                                               │
│ Selo de dados · atualizado a …                                           │
├──────────────────────────────────────────────────────────────────────────┤
│ FILTROS (fixos)  Período [12 sem ▾]  Comparar [período anterior ▾]       │
│                  Plataforma [Todas ▾]  Marcas [Todas ▾]                  │
├──────────────────────────────────────────────────────────────────────────┤
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐   KPIs (4 a 5)             │
│ │ 70   │ │ 237  │ │25,8% │ │ …    │ │ …    │   valor · variação ·       │
│ │ −13% │ │ +54% │ │+6 pp │ │      │ │      │   mini-gráfico             │
│ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘                             │
├──────────────────────────────────────────────────────────────────────────┤
│ O QUE MUDOU                                                              │
│ ┌────────────────┐ ┌────────────────┐ ┌────────────────┐                 │
│ │ Conclusão      │ │ Conclusão      │ │ Conclusão      │  3 cartões       │
│ │ mini-gráfico   │ │ mini-gráfico   │ │ mini-gráfico   │  (+ pista, só    │
│ │ [Ver detalhe]  │ │ [Ver detalhe]  │ │ [Ver detalhe]  │  vista Equipa)   │
│ └────────────────┘ └────────────────┘ └────────────────┘                 │
├──────────────────────────────────────────────────────────────────────────┤
│ GRÁFICO PRINCIPAL  (tendência ou comparação; eventos anotados)           │
│ ─────────────────────────────────────────────────────────  Ver tabela    │
├──────────────────────────────────────────────────────────────────────────┤
│ DETALHE  tabela por marca / plataforma / formato          ──▶ gaveta     │
└──────────────────────────────────────────────────────────────────────────┘
```
Regras:
- Os filtros aplicam-se a **tudo** na página e ficam fixos ao fazer scroll.
- Máximo de **cinco blocos** por página; o resto vai para a gaveta ou para outro item do menu.
- Cada bloco mostra a **fonte e a data** em rodapé discreto quando o dado for real ou estimado (convenção de reporting).

## 4. Componentes

| Componente | Conteúdo | Dados de que precisa | Estados |
|---|---|---|---|
| **Seletor de âmbito** | Agência › Vertical › Cliente | Lista de verticais e clientes (config) | Fechado, aberto, sem permissões |
| **Barra de filtros** | Período, comparação, plataforma, marcas | Intervalos e listas do cliente | Por defeito, alterado, a repor |
| **Selo de dados** | Origem da página (secção 6) | Origem de cada bloco | Demonstração · Real · Estimado · Misto |
| **KPI** | Valor, variação vs. comparação, mini-gráfico | Série temporal + período de comparação | Normal, sem dados, abaixo do limiar |
| **Cartão-conclusão** | Frase, mini-gráfico, ação «Ver detalhe»; pista (só Equipa) | Sinal calculado + texto da leitura | Novo, visto, decidido |
| **Gráfico** (linha, barras, empilhado) | Série(s), eventos anotados, dica, vista em tabela | Séries por marca/plataforma | Normal, sem dados, a carregar |
| **Tabela de detalhe** | Linhas por marca/plataforma/formato com barras e variação | Agregados | Ordenável; vazia |
| **Gaveta de detalhe** | Anúncio, notícia ou série com origem completa | Registo individual | Aberta/fechada; teclado |
| **Estado vazio** | «Sem sinais materiais» ou «Por ligar: <fonte>» | Limiares e estado da fonte | — |
| **Pista de ação** *(Equipa)* | Sinal → leitura → ação; Aceitar, Ajustar, Descartar; atribuição | Pista + estado | Sugerida → decidida → levada ao cliente → adotada |
| **Publicar para o cliente** *(Equipa)* | Marca um cartão ou relatório como visível ao cliente | Cartão + autor | Rascunho, publicado, retirado |

Os componentes já existem em parte no preview (KPIs, cartões, gráficos SVG, gaveta, etiquetas); a fase C extrai-os e uniformiza-os.

## 5. Duas vistas (implementado na fase D)

| | **Equipa** | **Cliente** |
|---|---|---|
| Menu | Completo, com Ações, Torre de controlo e Fontes | Só as páginas que a equipa publicou (Visão geral, Mercado, Procura e notícias, Criativos, Relatório semanal) |
| Pistas e atribuições | Sim | Só as marcadas para o cliente e aceites pela equipa, como «A Arena propõe», sem atribuição a Performance, Brand ou Account |
| Cartões «O que mudou» | Todos, com limiares e hipóteses | Só os que a equipa escolheu, sem limiares nem rótulos internos |
| Conjunto competitivo | Editável; o Radar sugere marcas | Só de leitura; as sugestões não aceites não aparecem |
| Pergunta ao Radar, Torre, Fontes, Ações | Sim | Não |
| Tema | Arena | Tema do cliente, se configurado (`cliente.tema`) e aprovado (Q09) |
| Como o conteúdo chega | Automático a partir dos dados | **Só por publicação da equipa**; nada é automático |

**Como se publica.** Em Relatórios › «Publicar para o cliente» a equipa escolhe as páginas visíveis, os cartões, as pistas (só as aceites ou ajustadas) e uma nota opcional, e carrega em «Publicar». Enquanto não publicar, a vista do cliente mostra «Ainda não há relatório publicado». Marcar cartões ou pistas **não** publica. A publicação pode ser retirada. O que sai é assinado pela Arena Media, sem autoria individual (D03).

**Alternância.** O botão «Equipa | Cliente» no topo abre a **pré-visualização** da vista do cliente, com uma faixa a lembrá-lo. A entrega real ao cliente (acesso, convite, autenticação) não está construída: decide-se com IT e Compliance.

**Persistência.** As decisões sobre pistas e a publicação ficam guardadas no navegador (localStorage), para a equipa preparar e retomar. A persistência em ficheiro ou base de dados, partilhada pela equipa, é a tarefa RB-22.

## 6. Selo de dados (substitui as etiquetas em cada bloco)

Cada página mostra **um** selo junto ao título, em vez de uma etiqueta por bloco:

| Selo | Quando | Ao abrir |
|---|---|---|
| `Demonstração` | Todos os blocos da página são simulados | Lista de blocos e a origem de cada um |
| `Real · atualizado a 4 out` | Todos os blocos vêm de fontes ligadas | Lista de fontes, datas e método |
| `Misto · 3 de 5 blocos reais` | Parte real, parte simulada | Que blocos são reais e quais simulados |
| `Demonstração e estimado` · `Real e estimado` · `Estimado` | Sem blocos reais mas com estimativas assumidas, ou real com estimativas | Método de cada estimativa |
| `Por ligar` | A página ainda não tem nenhum bloco com dados | O que falta ligar |

- O selo calcula-se a partir da origem de cada registo (`origem` continua obrigatória no dado).
- Quando as fontes forem ligadas, o selo passa sozinho de «Demonstração» a «Real», sem mudar a interface.
- Em qualquer número, passar o cursor ou abrir a gaveta mostra origem, fonte, data de recolha e método.
- **Limite mantido:** dado simulado nunca é atribuído a uma entidade real de terceiros (regra 4 do CLAUDE.md). Para essas entidades, dado real ou nada («por recolher»).

*D27 confirmada pelo David e implementada. Em dados reais ou estimados, cada bloco mostra também a fonte e a data de recolha num rodapé discreto (convenção de reporting).*

## 7. Modelo de dados por cliente (implementado)
Gerado por `scripts/build_dataset.py` a partir de `config/` e `data/raw/`; um ficheiro por cliente em `data/processed/<cliente>.json`, mais `agencia.json`.

| Chave | Conteúdo |
|---|---|
| `cliente` | id, nome, setor, vertical, tipo de universo (`concorrencia` ou `tema`), se é fictício |
| `calendario`, `plataformas`, `formatos`, `territorios`, `limiares` | Parâmetros herdados da agência, da vertical e do cliente |
| `entidades` | O cliente e os outros do universo (concorrentes herdados da vertical, sugeridos pelo Radar) |
| `blocos` | **Registo de proveniência**: para cada bloco de dados, origem (`real`, `estimado`, `demo`, `pendente`), fonte, data de recolha, método |
| `anuncios`, `procura`, `noticias`, `contexto`, `agenda`, `eventos`, `sazonalidade`, `leilao`, `voz` | Os dados de cada bloco (ausente = a página mostra «por ligar») |
| `sinais`, `pistas` | Gerados pelas regras de limiar (`scripts/signals.py`); para universos de tema, o conteúdo vem de `sinais_modelo` no YAML do cliente |
| `kpis` | Que KPIs mostrar na Visão geral (catálogo em `prototype/src/js/40-metrics.js`) |

## 8. Critérios de aceitação da fase C
| Critério | Estado |
|---|---|
| Trocar de cliente no seletor muda **todo** o conteúdo e o menu mantém-se igual | ✅ |
| Dois clientes de tipos diferentes (*tema* e *concorrência*) usam as mesmas páginas e componentes | ✅ Verdia (tema) e Lumio, Vael, Kob (concorrência) |
| Filtros de período e comparação onde afetam o conteúdo | ✅ Visão geral, Mercado (concorrência), Procura e notícias e Criativos. Em Mercado de um universo de tema não há filtros porque nada nessa vista depende do período |
| Nenhum cliente, marca ou série escrito no código | ✅ Tudo vem do JSON do cliente |
| A vista Cliente só mostra conteúdo publicado | ✅ Fase D (RB-75). Verificado de ponta a ponta: sem publicar o cliente não vê nada; publicado, não vê limiares, hipóteses, atribuições, Ações nem marcas por aceitar |
| Consola sem erros; zero pedidos externos; contraste AA nos temas | ✅ Verificado em todas as páginas de todos os clientes, em ecrã largo e em telemóvel |
| Cada fonte tem o seu `LIGAÇÃO[<id>]` | ✅ `grep -rn "LIGAÇÃO\[" prototype/src scripts config` |
