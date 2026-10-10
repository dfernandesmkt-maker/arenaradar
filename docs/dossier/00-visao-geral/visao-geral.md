# Visão geral

**Responsável:** David · **Estado:** Rascunho, por validar com a direção · **Última atualização:** 2026-10-10

## Âmbito
O Arena Radar é um produto interno de inteligência de mercado: observa o que muda no mercado e na concorrência de cada cliente, interpreta o que isso significa e aponta pistas de ação à equipa de conta. A plataforma sugere; a equipa decide. Serve todos os clientes da Arena, configurados por ficheiro, e tem uma vista Equipa e uma vista Cliente (esta só com o que a equipa publicou).

## Estado atual
Existe um protótipo navegável, multi-cliente, só com clientes fictícios (D33) e dados de demonstração, etiquetados. A arquitetura de dados e a verificação automática da regra de ouro estão feitas no protótipo. Ainda não há dados reais ligados, motor de leitura em produção, persistência partilhada pela equipa nem stack decidido. Detalhe em `docs/00-ponto-de-situacao.md`.

## Pedido
Propostas, ainda por validar.

| Público | Decisão pedida |
|---|---|
| Direção | Aprovar um piloto de 6 semanas com um cliente real, a escolher, e o tempo alocado (cenário A). |
| IT | Indicar um contacto e decidir a stack de produção (Microsoft vs. outro). Ver `02-tecnico/`. |
| Compliance | Parecer sobre fontes e termos de uso, uso do nome de clientes em demonstrações (Q04) e fornecedores. Ver `03-governacao/`. |
