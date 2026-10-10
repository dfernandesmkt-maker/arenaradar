# Como acrescentar um cliente

**Estado:** Rascunho · Acrescentar um cliente é criar **um ficheiro de configuração**. Não é preciso mexer no código da interface.

## Passos
1. **Copia o modelo.** `config/clients/_template.yaml` → `config/clients/<id>.yaml` (o `<id>` sem espaços nem acentos, por exemplo `prio`).
2. **Preenche o essencial:** `cliente` (nome, setor, vertical, tipo de universo) e `universo` (o cliente e, se for um universo de tipo «tema», as outras entidades).
3. **Escolhe a vertical.** Se já existe (`config/verticals/`), o cliente herda os concorrentes por defeito e o vocabulário. Se não, copia `config/verticals/_template.yaml`.
4. **Gera os dados e o protótipo:**
   ```bash
   python3 scripts/build_dataset.py
   python3 prototype/build_preview.py
   ```
5. **Abre** `prototype/arena-radar-v3-preview.html`: o cliente aparece no seletor de âmbito e na Torre de controlo, com o mesmo menu e as mesmas páginas.

## Dois tipos de universo
| Tipo | Quando usar | O que mostra em «Mercado» |
|---|---|---|
| `concorrencia` | O cliente compete com marcas identificáveis (ex.: energia, seguros, combustíveis) | Quota de voz, atividade, campanhas, formatos e mensagens, investimento |
| `tema` | A disputa é por atenção e clareza de mensagem, não por quota (ex.: o cliente fictício Verdia, em `config/clients/verdia.yaml`) | Voz no tema, agenda e contexto de mercado |

## Sinais de um cliente de tema (`sinais_modelo`)
Num universo de tipo «tema» os sinais são descritos no YAML do cliente. Cada sinal tem um **gatilho** genérico (`procura_variacao`, `indicador` ou `agenda`) e os textos (`titulo`, `sinal`, `leitura`, `pista`). Opcionalmente acrescenta `regra` (a frase que aparece em «Porquê este sinal?»), `janela` e `janela_curta` (o período de cálculo, mostrado no medidor). Sem eles o Radar usa uma regra genérica. Num universo de concorrência os sinais vêm das regras e dos limiares da agência (`config/agencia.yaml`, `scripts/signals.py`), sem nada para escrever.

## O que fica em demonstração até ligar as fontes
Enquanto uma fonte não estiver ligada, o bloco correspondente usa dados de **demonstração** (marcas fictícias) e o selo da página diz «Demonstração». Quando houver dados em `data/raw/` (recolhidos pelos scripts), `build_dataset.py` usa-os e o selo muda para «Real» ou «Misto», sem alterar a interface. Ver `docs/09-pontos-de-ligacao.md`.

## Vista do cliente
Cada cliente tem automaticamente a pré-visualização da vista do cliente («Equipa | Cliente»). Nada aparece ao cliente até a equipa publicar em Relatórios › Publicar para o cliente. Opcionalmente, `cliente.tema: <id de config/themes>` dá ao cliente o seu tema de cor, usado só na vista do cliente; só deve usar-se depois de a Q09 estar respondida.

## Regras que se mantêm
- Dados de demonstração só para entidades **fictícias** (campo `ficticia`) ou ao nível de um tema. Para entidades reais de terceiros: dado real ou «por recolher».
- Dados internos de clientes ficam em `data/raw/internal/`, fora do Git.
- Um cliente real exige que Direção e Jurídico confirmem o uso do nome em demonstrações (Q04).
