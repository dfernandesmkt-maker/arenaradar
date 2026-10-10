# Especificação de UX/UI — padrão de página e componentes

**Estado:** Rascunho para validação do David · **Fase:** B (especificação, antes de reestruturar o protótipo) · **Ponto de partida:** `07-revisao-ux-e-estrutura.md`

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
Arena Radar   [ Agência ▾ ] › [ Ambiente e economia circular ▾ ] › [ Sociedade Ponto Verde ▾ ]
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

## 5. Duas vistas

| | **Equipa** | **Cliente** |
|---|---|---|
| Menu | Completo, com Ações | Visão geral, Mercado, Procura e notícias, Criativos, Relatórios |
| Pistas e atribuições | Sim | Só as publicadas, assinadas pela Arena |
| Tema | Arena | Tema do cliente, se aprovado (Q09) |
| Notas internas e limiares | Visíveis | Ocultos |
| Como o conteúdo chega | Automático a partir dos dados | **Só por publicação da equipa**; nada é automático |

Alternância no topo («Equipa | Cliente»). Na vista Cliente aparece uma faixa discreta «Pré-visualização do que o cliente vê» enquanto a equipa a usar.

## 6. Selo de dados (substitui as etiquetas em cada bloco)

Cada página mostra **um** selo junto ao título, em vez de uma etiqueta por bloco:

| Selo | Quando | Ao abrir |
|---|---|---|
| `Demonstração` | Todos os blocos da página são simulados | Lista de blocos e a origem de cada um |
| `Real · atualizado a 4 out` | Todos os blocos vêm de fontes ligadas | Lista de fontes, datas e método |
| `Misto · 3 de 5 blocos reais` | Parte real, parte simulada | Que blocos são reais e quais simulados |

- O selo calcula-se a partir da origem de cada registo (`origem` continua obrigatória no dado).
- Quando as fontes forem ligadas, o selo passa sozinho de «Demonstração» a «Real», sem mudar a interface.
- Em qualquer número, passar o cursor ou abrir a gaveta mostra origem, fonte, data de recolha e método.
- **Limite mantido:** dado simulado nunca é atribuído a uma entidade real de terceiros (regra 4 do CLAUDE.md). Para essas entidades, dado real ou nada («por recolher»).

*Esta secção depende da confirmação da D27 pelo David.*

## 7. Modelo de dados por cliente (alvo da fase C)
```json
{
  "cliente": { "id": "spv", "nome": "…", "vertical": "ambiente", "tipo_universo": "tema", "tema": "spv" },
  "periodo": { "inicio": "2026-01-05", "fim": "2026-10-04" },
  "entidades": [{ "id": "novo-verde", "nome": "Novo Verde", "papel": "…", "prioridade": "alta" }],
  "series":   [{ "bloco": "procura", "entidade": "…", "semana": "2026-09-28", "valor": 41,
                 "origem": "real", "fonte": "Google Trends", "data_recolha": "…", "metodo": "…" }],
  "anuncios": [ /* contrato de 09-pontos-de-ligacao.md */ ],
  "sinais":   [ /* gerados pelas regras de limiar */ ]
}
```
Gerado por `scripts/build_dataset.py` (RB-09) a partir de `config/` e `data/raw/`. Acrescentar um cliente passa a ser criar um ficheiro de configuração.

## 8. Critérios de aceitação da fase C
- Trocar de cliente no seletor muda **todo** o conteúdo e o menu mantém-se igual.
- Dois clientes de tipos diferentes (um *tema*, um *concorrência*) usam as mesmas páginas e componentes.
- Os filtros de período e comparação existem em Visão geral, Mercado e Procura e notícias.
- Nenhum cliente, marca ou série está escrito no código: tudo vem do JSON do cliente.
- A vista Cliente só mostra conteúdo publicado.
- Consola sem erros; zero pedidos externos; contraste AA nos temas.
- Cada fonte tem o seu `LIGAÇÃO[<id>]` (ver `09-pontos-de-ligacao.md`).
