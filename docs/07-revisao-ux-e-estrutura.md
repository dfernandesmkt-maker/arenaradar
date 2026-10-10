# Revisão de UX/UI e de estrutura (outubro 2026)

**Estado:** Revisão histórica (out. 2026; o cliente real de tema foi entretanto retirado, ver D33). Rascunho para validação do David · **Base:** protótipo `arena-radar-v3-preview.html` percorrido ecrã a ecrã (Torre de controlo, Vertical Energia, cliente de tema: Início, Observar, Pistas de ação, Briefing, Impacto, Fontes de dados).

Nada neste documento está decidido. São observações e propostas para escolher em conjunto.

## 1. Nova direção a registar
O David pediu que a plataforma traga valor **à agência e ao cliente**, com leitura **natural, fácil e fluida, como num dashboard de reporting**, e que funcione para **vários clientes** (a cliente de tema é só um exemplo).

Isto ajusta a D23 («uso interno primeiro»). Proposta de formulação, a confirmar como D26:
> O Radar serve a agência e o cliente a partir dos mesmos dados, em duas vistas: **Equipa** (completa, com pistas de ação) e **Cliente** (reporting limpo, só com o que a equipa decidiu publicar). Mantém-se o princípio: a plataforma sugere, a equipa decide; nada chega ao cliente sem decisão da equipa.

## 2. O que já funciona (manter)
- Títulos que dizem a conclusão («O que se procura, o que se diz e o que vem aí»), em vez de nomes de secção.
- Etiquetas de origem (Real / Estimado / Demo) em cada bloco, com a regra de «sem dados, não inventa» (ex.: «Por recolher», «por ligar»).
- Gráficos com vista em tabela, dica ao passar o cursor e teclado; zero pedidos externos.
- Cadeia sinal → leitura → ação com Aceitar / Ajustar / Descartar e atribuição a Performance, Brand ou Account.
- Torre de controlo (Agência → Vertical → Cliente) como ideia de topo.

## 3. Problemas de UX encontrados

| # | Observação | Efeito |
|---|---|---|
| U1 | **Navegação mistura níveis.** Em «Vertical Energia / Lumio» a barra lateral continua a mostrar o menu da cliente de tema (Início, Observar, Pistas, Briefing, Impacto). | Não se percebe em que cliente se está. Com 10 clientes torna-se ingerível. |
| U2 | **Cada tipo de cliente tem um ecrã diferente.** cliente de tema («tema») tem «Observar»; Lumio («concorrência») tem «Concorrência» com 6 separadores, filtros de período, plataforma e marca. | Experiência inconsistente; a cliente de tema não tem filtro de período. |
| U3 | **Não há filtros globais.** Período, comparação e plataforma só existem no módulo Concorrência. | Um dashboard de reporting tem sempre a barra de filtros no mesmo sítio. |
| U4 | **Páginas muito longas** (a Observar da cliente de tema tem ~2 700 px, sete secções). | Leitura em scroll contínuo, sem hierarquia clara entre o essencial e o detalhe. |
| U5 | **A conclusão e os números estão separados.** A home tem a frase-herói; os restantes ecrãs têm ou texto ou gráficos. | Falta o padrão de reporting: KPIs com variação → gráfico → detalhe. |
| U6 | **A frase-herói da home («subiu 41%») é Demo.** | Para a direção, o primeiro ecrã assenta num número ilustrativo. Resolve-se com dados reais de Trends ou com um modo «simulação» assumido. |
| U7 | **Linguagem de produto em vez de linguagem de leitura.** «Observar», «Pistas de ação», «Impacto» descrevem a metodologia, não o que o utilizador procura. A camada «Ler» existe nos documentos, mas não tem ecrã. | Quem vem de reporting procura «Visão geral», «Concorrência», «Procura», «Notícias», «Criativos». |
| U8 | **Impacto é um painel de zeros** (critérios do piloto). | Lê-se como controlo interno do piloto, não como valor para o cliente. |
| U9 | **Sem partilha nem exportação** além do PDF do briefing. | Limita o valor para o cliente (relatórios, vistas guardadas). |
| U10 | **Pormenores a verificar:** faixa de sombra no limite direito dos ecrãs a 1440 px (provável gaveta fora de ecrã com sombra); texto da abertura do radar a sobrepor-se às sugestões da barra «Pergunta ao Radar». Não testado em telemóvel/tablet. | Acabamento. |

## 4. Problemas de estrutura do projeto

| # | Observação | Efeito |
|---|---|---|
| E1 | **A configuração não alimenta o protótipo.** Nada em `src/` nem em `build_preview.py` lê `config/clients/*.yaml`. Os clientes, concorrentes e termos estão escritos dentro do JS e do HTML. | «Agnóstico ao cliente» é uma intenção, não uma realidade. Acrescentar um cliente obriga a editar código. |
| E2 | **Não existe `config/verticals/`**, apesar de a hierarquia Agência → Vertical → Cliente estar no CLAUDE.md e no backlog (RB-40, RB-64). | O conceito central não tem suporte. |
| E3 | **Dados, regras e interface no mesmo ficheiro.** `competition.js` (48 KB em 340 linhas) mistura gerador de dados demo, regras e desenho; `preview.template.html` tem 90 KB. | Difícil de rever, testar e entregar a quem vai implementar. |
| E4 | **Dois «modelos de universo» (tema e concorrência) sem contrato comum.** | Cada novo cliente arrisca um terceiro ecrã à medida. |
| E5 | **Documentação desfasada do produto.** O ponto de situação e o README ainda falam de um piloto com o cliente real de setembro; o backlog não marca o que o preview já fez; CLAUDE.md fala em um ficheiro do protótipo, que não existe. | Quem pega no projeto não sabe o que é atual. |
| E6 | **Sem verificação automática.** Nada garante que o build funciona nem que nenhum número aparece sem origem. | A regra de ouro depende de memória humana. |

## 5. Proposta de solução

### 5.1 Navegação: um seletor de âmbito, o mesmo menu para todos
- **Seletor de âmbito** no topo, com três níveis: *Agência › Vertical › Cliente*. É a única forma de mudar de contexto.
- **Menu lateral fixo e igual em todos os clientes:**
  1. **Visão geral** (reporting: KPIs, o que mudou, tendência)
  2. **Mercado** (adapta-se ao tipo de universo: *Concorrência* com marcas, *Tema* com entidades e conversa)
  3. **Procura e notícias**
  4. **Criativos** (só se houver anúncios)
  5. **Relatórios** (briefing semanal, vista cliente, exportações)
  6. **Ações** (pistas, decisões, impacto): separador da equipa
- Em Agência: Torre de controlo e Fontes de dados.

### 5.2 Um único padrão de página de reporting
Todas as páginas seguem a mesma ordem, para a leitura ser previsível:
1. **Barra de filtros fixa:** período, comparar com (período anterior / homólogo), plataforma, marcas.
2. **Faixa de 4 a 5 KPIs:** valor, variação, mini-gráfico, etiqueta de origem. Clicar abre o detalhe.
3. **«O que mudou»:** 3 cartões-conclusão (a frase que já funciona), cada um com gráfico pequeno.
4. **Gráfico principal** (tendência ou comparação) com anotações de eventos.
5. **Tabela ou detalhe** por marca, plataforma ou formato; clicar abre uma gaveta (anúncio, notícia, série).
6. **Estados vazios claros** («sem sinais materiais», «por ligar»), nunca ecrã em branco.

### 5.3 Duas vistas para dois públicos
| | Vista Equipa | Vista Cliente |
|---|---|---|
| Conteúdo | Tudo: sinais, pistas, atribuições, notas | Reporting limpo: KPIs, tendências, o que mudou, o que a equipa escolheu partilhar |
| Pistas de ação | Sim, com decisão e atribuição | Só as que a equipa levou ao cliente, com a assinatura da Arena |
| Tema | Arena | Tema do cliente (sujeito a Q09) |
| Como chega | Direto | A equipa **publica** cartões e relatórios; nada é automático |

O Briefing atual (separadores «Equipa / Cliente») é o embrião desta ideia.

### 5.4 Estrutura de código e dados (para o projeto escalar)
- Cada cliente = `config/clients/<id>.yaml` + (opcional) `config/themes/<id>.json`; cada vertical = `config/verticals/<id>.yaml`.
- O protótipo passa a **ler um JSON por cliente** gerado a partir da configuração e dos dados recolhidos (RB-09), em vez de dados escritos no código.
- Interface dividida em **componentes reutilizáveis** (barra de filtros, KPI, cartão-conclusão, gráfico, gaveta, etiqueta de origem) e **módulos de página** que só dizem que dados pedem.
- Verificação automática: o build corre, nenhum dado sem `origem`, `fonte` ou `metodo` válidos passa.

## 6. Plano por fases (a validar)
| Fase | Resultado | Notas |
|---|---|---|
| A | Decisões: D26 (valor para agência e cliente), navegação, padrão de página, vista cliente | Este documento |
| B | **Especificação do padrão de página e dos componentes** em `docs/`, com desenho de baixa fidelidade | Antes de mexer no código |
| C | **Reestruturar o protótipo**: seletor de âmbito, menu único, barra de filtros global, componentes, dados por cliente | Maior peça de trabalho |
| D | **Vista Cliente e publicação** pela equipa | Depende de Q09 (temas de clientes) |
| E | **Dados reais** (Trends e notícias já; Meta quando houver token) para trocar a frase-herói demo | Depende de Q10 |
| F | Atualizar CLAUDE.md, backlog e dossier ao que foi decidido | Em cada fase |

## 7. Decisões pedidas ao David
1. Confirmas a formulação da **D26** (duas vistas, publicação pela equipa)?
2. Aceitas o **menu único + seletor de âmbito** (5.1) como base?
3. Para a demonstração à direção, queres mostrar **um segundo cliente com dados reais de concorrência** (precisa do token da Meta, Q10) ou ficamos com a cliente de tema real + vertical fictícia, tudo etiquetado?
