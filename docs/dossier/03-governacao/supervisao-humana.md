# Supervisão humana e uso de IA

**Responsável:** David (com Compliance) · **Estado:** Rascunho · **Última atualização:** 2026-10-11

## Princípio
A plataforma sugere; a equipa decide. Nada chega ao cliente sem decisão da equipa.

## Onde a IA intervém e onde não intervém
Estado atual: protótipo v4 com dados fictícios. A IA está **desligada por defeito**; o mesmo trabalho é feito por regras (D54).

| Tarefa | Quem faz | O que segue para o modelo | Revisão humana | Estado |
|---|---|---|---|---|
| Resumo da semana (em 30 segundos, pontos, decisões, rascunho de email) | Modelo de linguagem com `--ia`; regras por defeito (`scripts/v4/ia.py`) | Movimentos da semana (atividade pública de concorrentes), previsões e nomes e estado das respostas combinadas | Obrigatória: fica «por rever»; o email só se copia depois de a equipa o marcar como revisto | Por confirmar (Q13) |
| Classificação de criativos (mecânica, tom, público, ação) | Modelo de linguagem com `--ia`; regras por defeito | Texto, oferta e botão de anúncios públicos de concorrentes | Etiquetada como «estimado»; a equipa pode corrigir na versão ligada | Por confirmar (Q13) |
| Deteção de movimentos, importância, previsões | Regras explicadas (sem IA) | Nada | A importância e as previsões mostram o cálculo | — |
| Ativar respostas, levar algo ao cliente | **Só a equipa** | — | — | — |

A IA nunca: envia nada ao cliente, ativa respostas, recebe dados internos do cliente (`data/raw/internal/`), nem apresenta texto como revisto sem uma pessoa o marcar.

## Quem decide, quem valida, quem assina
- **Decide:** a equipa de conta (ativar respostas, o que se leva ao cliente).
- **Valida o texto da IA:** quem marca o resumo como revisto (na versão ligada, fica registado quem e quando; hoje, só no navegador).
- **Assina:** o que sai para o cliente é assinado pela Arena Media, sem autoria individual.

## Registo de decisões
D54 (resumo e classificação por IA, sempre revistos). Ver `docs/dossier/04-registos/decisoes.md`.
