# Fontes e termos de uso

**Responsável:** David (com Compliance) · **Estado:** Rascunho · **Última atualização:** 2026-10-01

## Duas fases
- **Demonstração:** pode usar as fontes necessárias para mostrar o potencial do produto, incluindo fontes não oficiais. Cada dado fica etiquetado com a origem e nunca inclui dados confidenciais de clientes.
- **Produção:** apenas fontes oficiais ou licenciadas, validadas por IT e Compliance antes de entrarem em uso. Segundo o David, a agência tem acesso a fontes oficiais; quais exatamente está por confirmar (ver Q06).

## Fontes previstas
| Fonte | Fase demonstração | Fase produção | Termos de uso validados | Estado |
|---|---|---|---|---|
| Google News RSS | Sim | A confirmar | Não | Por confirmar |
| Google Trends | Sim, via biblioteca não oficial ou exportação manual | Fonte oficial a confirmar | Não | Por confirmar |
| Meta Ad Library API | Sim | Fonte oficial | Não | Por confirmar |
| Google Ads Transparency Center | Consulta manual | A confirmar | Não | Por confirmar |
| TikTok Ad Library | Consulta manual | A confirmar | Não | Por confirmar |
| Marktest AdCheck | Exportação manual | Fonte licenciada | Não | Por confirmar |
| Dados de clientes (ex.: chatbot ELO) | Fora do âmbito | Só com parecer de Compliance e autorização do cliente | Não | Por confirmar |

Detalhe técnico das fontes em `docs/04-dados-e-fontes.md`.

## Módulos de fontes no preview (v3)
O preview tem a página «Fontes de dados» com 9 módulos: Meta Ad Library, Google Ads Transparency Center, Google Trends, Notícias (RSS), ferramenta de ad intelligence licenciada (por definir), monitorização de investimento e inserções (por definir), informações do leilão do Google Ads (dados do cliente, por confirmar), importador CSV e chatbot ELO (bloqueado). Na demonstração os dados são simulados e etiquetados como Demo.

## Importações CSV
Colunas obrigatórias: marca, plataforma, formato, data_inicio, texto, origem. Regras de validação: origem `real` exige fonte e data_recolha; `estimado` exige método; `demo` só pode ser atribuído a marcas fictícias; plataforma e formato têm de constar das listas. Linhas inválidas não entram.
