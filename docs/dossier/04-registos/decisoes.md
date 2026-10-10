# Registo de decisões

**Responsável:** David · **Estado:** Rascunho · **Última atualização:** 2026-10-01

O histórico completo (D01 a D16) está em `docs/01-historico-e-decisoes.md` e será migrado para aqui. Decisões novas ficam registadas neste ficheiro.

| # | Data | Decisão | Razão |
|---|---|---|---|
| D17 | Out 2026 | Dossier único em `docs/dossier/`, organizado por público (direção, IT, compliance) | Uma fonte de verdade; cada público lê a sua pasta sem contradições |
| D18 | Out 2026 | Fontes em duas fases: demonstração (fontes necessárias, sempre etiquetadas) e produção (apenas oficiais ou licenciadas, após aprovação) | Mostrar o potencial agora sem comprometer a conformidade em produção |
| D19 | Out 2026 | Produto para todos os clientes e verticais, com torre de controlo da concorrência (Agência → Vertical → Cliente) | Ferramenta da agência, replicável; evita ser um projeto de um só cliente |
| D20 | Out 2026 | Radar posicionado como complementar à Research | Vigilância contínua e leve do Radar; aprofundamento e validação pela Research |
| D21 | Out 2026 | Interface clara, com temas por cliente via tokens | Flexibilidade visual por cliente; aspeto atual |
| D22 | Out 2026 | Inter em todo o Radar (interface, apresentações e documentos do Radar), em vez da Poppins das Brand Guidelines. Pesos por função: 650 títulos de página, 600 secções, botões e badges, 400 corpo, 500 etiquetas, 700 números. Substitui a parte tipográfica de D21 | Decisão do David (owner); legibilidade em ecrã e números tabulares. Exceção às Brand Guidelines, por validar com Marketing/Brand (Q08) |
| D23 | Out 2026 | Plataforma de uso **interno** (Performance, Brand, Account). O foco é a visão do mercado e da concorrência; as pistas de ação são secundárias e atribuídas a uma função; «levar ao cliente» é opcional e fica em segundo plano | Pedido do David: ter os clientes à frente da concorrência; a conversa com o cliente começa na equipa |
| D24 | Out 2026 | Módulo Concorrência por vertical com 6 vistas (visão geral, atividade, criativos, formatos e mensagens, campanhas, investimento e voz) e filtros partilhados de período, plataforma e marca | O Radar passa a ser também fonte de dados sobre o que a concorrência anuncia (Meta, Google, YouTube, TikTok) |
| D25 | Out 2026 | Página «Fontes de dados»: cada fonte é um módulo com campos, regime e responsável; importador CSV que rejeita linhas sem origem, fonte, data ou método | Ligar fontes sem mudar o produto; a regra de ouro dos dados aplica-se também às importações |
| D26 | Out 2026 | Duas vistas sobre os mesmos dados: **Equipa** (completa, com pistas) e **Cliente** (reporting limpo, só o que a equipa publicar). Valor para a agência e para o cliente. Ajusta a D23 | Pedido do David (confirmado). Mantém-se: a plataforma sugere, a equipa decide; nada chega ao cliente sem decisão da equipa |
| D27 | Out 2026 | **Por confirmar.** Substituir as etiquetas Real/Estimado/Demo em cada bloco por um **selo de dados por página** (Demonstração · Real · Misto), com origem detalhada ao abrir e em cada número. `origem` continua obrigatória no dado | Pedido do David: sem referências «demo» em cada bloco. Compromisso proposto para manter a regra de ouro 5 do CLAUDE.md (a interface mostra a origem), sob exigência de compliance do grupo. Ver `docs/08-especificacao-ux.md`, secção 6 |
| D28 | Out 2026 | Navegação: **seletor de âmbito** (Agência › Vertical › Cliente) e **menu único** para todos os clientes (Visão geral, Mercado, Procura e notícias, Criativos, Relatórios, Ações) | Confirmado pelo David. Escalar para vários clientes sem ecrãs à medida |
| D29 | Out 2026 | Pontos de ligação às fontes marcados no código com `LIGAÇÃO[<id>]` e listados em `docs/09-pontos-de-ligacao.md` (Meta, Google, TikTok, Marktest, Trends, notícias) | Pedido do David: facilitar a troca de dados de demonstração por dados reais e a entrega ao IT |
