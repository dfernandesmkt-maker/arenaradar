# Especificação de UX/UI — padrão de página e componentes

**Estado:** Aprovada pelo David; implementada nas fases C e D e na ronda de melhorias de 10 out. 2026 (RB-86 a RB-92) · **Fase:** B → C · **Ponto de partida:** `07-revisao-ux-e-estrutura.md`

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
| **Mercado** | Quem está a comunicar e com que peso | *Concorrência*: marcas, quota de voz, campanhas, e a **ficha de cada marca** (comparável com outra). *Tema*: entidades, voz no tema, agenda |
| **Procura e notícias** | O que se pesquisa e o que se diz | Igual |
| **Criativos** | Galeria de anúncios, formatos e mensagens | Aparece só se houver anúncios |
| **Relatórios** | Briefing semanal, vista cliente, exportações | Igual |
| **Ações** *(só vista Equipa)* | Pistas de ação, **alertas** (só eventos materiais), impacto | Igual |

Nível Agência: **Torre de controlo** (fila de decisões e clientes por vertical) · **Fontes de dados** (resumo, com detalhe técnico a pedido).

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
| **Barra de filtros** | Quatro botões compactos (período, comparação, plataformas, marcas) que abrem um painel; em telemóvel, uma folha inferior | Intervalos e listas do cliente | Por defeito, alterado, a repor |
| **Selo de dados** | Origem da página (secção 6) | Origem de cada bloco | Demonstração · Real · Estimado · Misto |
| **KPI** | Valor, variação vs. comparação, mini-gráfico, «?» com o que a métrica mede | Série temporal + período de comparação | Normal, sem dados, abaixo do limiar |
| **Cartão-conclusão** | Frase, mini-gráfico, leitura (máx. 3 linhas), medidor do valor face ao limiar e pista (só Equipa); ação principal «Ver pista» ou «Ver detalhe» e menu «⋯» com as restantes (publicar, aprofundar); altura igual na linha | Sinal calculado + texto da leitura | Novo, visto, decidido |
| **Gráfico** (linha, barras, empilhado) | Série(s), eventos anotados, dica, vista em tabela | Séries por marca/plataforma | Normal, sem dados, a carregar |
| **Tabela de detalhe** | Linhas por marca/plataforma/formato com barras e variação | Agregados | Ordenável; vazia |
| **Gaveta de detalhe** | Anúncio, notícia ou série com origem completa | Registo individual | Aberta/fechada; teclado |
| **Estado vazio** | «Sem sinais materiais» ou «Por ligar: <fonte>» | Limiares e estado da fonte | — |
| **Pista de ação** *(Equipa)* | Sinal → leitura → ação; Aceitar, Ajustar, Descartar; atribuição | Pista + estado | Sugerida → decidida → levada ao cliente → adotada |
| **Publicar para o cliente** *(Equipa)* | Escolhas à esquerda e pré-visualização ao lado; estado, publicar, descartar, retirar; histórico | Rascunho, publicado e histórico por cliente | Por publicar, publicado, alterações por publicar, retirado |
| **Porquê?** *(sinais; KPIs na vista do cliente também)* | Gaveta com a regra, os números, a janela, o limiar, a semana passada, o gráfico e a origem; nos KPIs, «Como se calcula» | `regra`, `janela`, `detalhe` do sinal; `why` do KPI | Fechada, aberta |
| **Ficha de marca** *(Equipa)* | KPIs, anúncios por plataforma com lançamentos, campanhas, formatos, mensagens, criativos longevos, sinais; comparação com outra marca | Anúncios e entidades do cliente | Normal, sem criativos, marca fora do conjunto |
| **Alerta** *(Equipa)* | Evento material (sinal, lançamento, marca sugerida, agenda), novo desde a última visita, com preferências e limiares | Sinais, anúncios, entidades | Novo, visto; sem alertas |
| **Tabela ordenável** | Cabeçalho clicável (↑↓), números à direita, seta nas linhas que abrem detalhe | Agregados | Por ordem original, ordenada |
| **Copiar imagem / Ao briefing** | Gráfico para PNG com título, legenda, origem e semana; acrescentar ao briefing semanal | O gráfico visível | Copiado, sem gráfico neste bloco |

Os componentes já existem em parte no preview (KPIs, cartões, gráficos SVG, gaveta, etiquetas); a fase C extrai-os e uniformiza-os.

**Cor.** A cor segue a entidade (D35): cada marca tem a sua cor, fixa; temas e assuntos (notícias, procura por tema) usam uma paleta própria (`--t1` a `--t5`); plataformas e formatos usam a rampa azul. Nenhuma cor muda de significado dentro da mesma página. Qualquer paleta nova passa por `validate_palette.js` (daltonismo, visão normal e contraste) em claro e em escuro.

**Números com janela.** Cada variação diz contra o quê («vs há 12 sem.», «em 4 sem.», «vs média 8 sem.»); os sinais têm janela própria e não seguem o filtro de período. Clicar no «?» de um KPI ou em «Porquê?» abre a explicação completa.

**Filtros na ligação e vistas.** Período, comparação, plataformas e marcas vão na ligação (`?w=8&c=n&p=Meta,Google&b=…`), por isso copiar a ligação partilha a vista. «Vistas» guarda a página com os filtros, por cliente, neste navegador.

**Comandos e definições.** A barra superior só tem a pergunta/comando (Ctrl K), «Apresentar», o seletor Equipa/Cliente e as definições (aparência, cor do tema, controlos de demonstração). A paleta Ctrl K junta navegação, mudar de cliente, ações e perguntas ao Radar; não existe na vista do cliente.

**Acessibilidade.** Ligação «Saltar para o conteúdo», foco no título ao mudar de página, anúncio da página numa região `aria-live`, alvos mínimos de 44 px em ecrãs tácteis, menus e painéis fecham com Esc.

## 5. Duas vistas (implementado na fase D)

| | **Equipa** | **Cliente** |
|---|---|---|
| Menu | Completo, com Ações, Torre de controlo e Fontes | Sem menu lateral: separadores no topo, só com as páginas que a equipa publicou (Visão geral, Mercado, Procura e notícias, Criativos, Relatórios) |
| Pistas e atribuições | Sim | Só as marcadas para o cliente e aceites pela equipa, como «A Arena propõe», sem atribuição a Performance, Brand ou Account |
| Cartões «O que mudou» | Todos, com limiares e hipóteses | Só os que a equipa escolheu, sem limiares nem rótulos internos |
| Conjunto competitivo | Editável; o Radar sugere marcas | Só de leitura; as sugestões não aceites não aparecem |
| Pergunta ao Radar, Torre, Fontes, Ações | Sim | Não |
| Tema | Arena | Tema do cliente, se configurado (`cliente.tema`) e aprovado (Q09) |
| Como o conteúdo chega | Automático a partir dos dados | **Só por publicação da equipa**; nada é automático |

**Como se publica (D34).** Em Relatórios › «Publicar para o cliente» a equipa prepara um **rascunho**: páginas visíveis, cartões, pistas (só as aceites ou ajustadas) e uma nota opcional, vendo ao lado o que o cliente verá. «Publicar» faz uma **cópia** do rascunho; é essa cópia, e só ela, que a vista do cliente mostra. Alterar o rascunho depois muda o estado para «Alterações por publicar» sem mexer no que o cliente vê, até haver «Publicar alterações» (ou «Descartar alterações»). «Retirar publicação» faz o cliente deixar de ver. Cada publicação fica no histórico (quem, quando, quantas páginas, cartões e pistas). Sem publicação, a vista do cliente mostra «Ainda não há relatório publicado», com «Ver como ficaria» (rascunho com a seleção sugerida, sem publicar).

**Alternância.** O botão «Equipa | Cliente» no topo abre a **pré-visualização** da vista do cliente, com uma faixa a lembrá-lo. A entrega real ao cliente (acesso, convite, autenticação) não está construída: decide-se com IT e Compliance.

**Vista por função (D36).** Em Definições › «A minha função» (Performance, Brand, Account, Direção) as pistas dessa área aparecem primeiro («Para ti», «Só as minhas») e a Direção começa na Torre. Nada fica escondido.

**Persistência.** As decisões sobre pistas, o rascunho e a publicação, os destaques do briefing e as preferências ficam guardados no navegador (localStorage), para a equipa preparar e retomar. A persistência em ficheiro ou base de dados, partilhada pela equipa, é a tarefa RB-22.

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

## 9. Sistema visual (D38, D39)

**Tokens.** Espaço `--sp-1…8` (4, 8, 12, 16, 20, 24, 32, 40 px), raio `--rad-s/m/l/xl/pill`, elevação `--sh-0/1/pop` e ligações `--link` (mais clara no modo escuro para manter o contraste AA). Nada de cores nem sombras escritas nos componentes. O contraste de todas as páginas, nos dois temas, é verificado antes de aceitar uma alteração.

**Uma só família de pílulas** (`css/states.css`): etiquetas (`.tag`), selos de dados (`.seal`), estados (`.state`, `.st`), variações (`.dchip`), severidade de alertas (`.alsev`) e cartões de marca (`.bd`) partilham altura, tipografia e cantos. O significado vem da cor, sempre com texto ou ícone (nunca só a cor):

| Aspeto | Significa |
|---|---|
| Verde | A favor, aceite, dado real |
| Âmbar | Atenção, material, dado estimado |
| Vermelho | Contra, descartada |
| Azul | Misto |
| Contorno tracejado | Demonstração |
| Contorno simples, ponto oco | Pendente, bloqueado, sugerida |
| Amarelo com anel | **Sinal** (ver abaixo) |

**Amarelo é sinal.** Arena Yellow só aparece onde o Radar está a dizer «olha para aqui»: o número-herói do cabeçalho, o topo dos cartões de sinais materiais, o marcador nos gráficos pequenos, a etiqueta «Porquê?» e o indicador da página ativa no menu. Nunca para decorar nem para estados.

**Cabeçalho de destaque.** Visão geral e Torre abrem com um bloco Guerrilla Forest com um motivo de radar em linhas, o título com o número em amarelo e o selo de dados da página. É o único bloco escuro no modo claro. Em ecrã pequeno o motivo reduz-se e o título passa para uma coluna.

## 10. Vista do cliente como relatório (D40)

Na vista Cliente (e na pré-visualização do rascunho) o menu lateral desaparece:
- **Cabeçalho do relatório:** logo oficial da Arena, nome do cliente, «Relatório de mercado e concorrência · Arena Media Portugal» e «publicado a <data>» (na pré-visualização do rascunho não há data).
- **Páginas em separadores** no topo, só as que a equipa publicou; o separador ativo leva a barra amarela de sinal. Em telemóvel mantém-se a barra inferior.
- **Coluna de leitura** de 1080 px no máximo, tipo ligeiramente maior (+4%) e KPIs sem quebras de linha.
- **Rodapé assinado** «Arena Media Portugal»: preparado pela equipa Arena, sem autoria individual, com a indicação de que a origem dos dados está no selo de cada página.
- **Faixa de pré-visualização** (só para a equipa) por cima do cabeçalho, fora da página do relatório: nunca faz parte do que o cliente vê.
- O tema do cliente (cores de marca) só se aplica depois de a Q09 estar validada.

## 11. Ações como fila de decisão (D42)

Ações › Pistas de ação lê-se de cima para baixo:
1. **Resumo** (KPIs): por decidir, aceites pela equipa (incluindo as ajustadas), marcadas para o cliente e descartadas.
2. **Por decidir** primeiro, **Já decididas** depois (esbatidas). A atribuição por função (D36) continua a filtrar.
3. **Cartão de pista:** título e estado; percurso numerado **Sinal → Leitura → Ação possível**, com a ação em destaque (caixa com cor) e «Porquê?» no sinal; **Aceitar** como única ação principal, **Ajustar** e **Descartar** secundárias; atribuição a Performance, Brand ou Account à direita; nota com confiança e data da decisão, e o pedido de aprofundamento à Research como ação discreta.
4. Depois de aceite, o cartão passa a oferecer «Preparar para o cliente (opcional)» e «Desfazer». Nada chega ao cliente sem publicação (D34).

## 12. Gráfico principal e modo silencioso (D43, D44)

**Gráfico principal da Visão geral.** Mostra o que o título afirma: anúncios ativos por marca, em linhas, com a marca do sinal de topo a cheio e as outras esbatidas; os lançamentos de campanha continuam marcados. O subtítulo repete a leitura do sinal. Quem quiser a divisão por plataforma tem-na em Mercado.

**Modo silencioso.** A cor só aparece onde há decisão:
- variações em **tabelas** são texto com seta (verde, vermelho ou neutro); as pílulas de variação ficam nos KPIs;
- o estado do sinal no cartão é ponto e texto, sem fundo (o topo amarelo do cartão já marca o sinal);
- a pista no cartão é uma caixa neutra; a cor forte da pista fica na página Ações.
