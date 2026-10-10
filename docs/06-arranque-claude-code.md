# Arranque no Claude Code

## 1. Preparar a pasta (10 minutos)
1. Descarregar `arena-radar.zip` da conversa no claude.ai (abre no computador, na mesma conta) e descompactar.
2. Recuperar os ficheiros antigos no claude.ai:
   - Conversa **"Inovação em agência: oportunidades além de retail media"** (junho) → descarregar `arena-radar.html` → guardar como `prototype/arena-radar-v2.html`.
   - Conversa **"Otimizar processos e automação na agência de média"** (abril) → descarregar o documento estratégico → guardar em `docs/legacy/`.
3. Abrir o Claude Code nessa pasta (app de desktop → separador Code → escolher a pasta, ou `claude` no terminal dentro da pasta).

## 2. Prompts pela ordem certa

**Prompt 1 — Orientação (não escreve código)**
```
Lê o CLAUDE.md e todos os ficheiros em docs/. Depois:
1) resume-me em 5 linhas o que é o projeto e em que ponto está;
2) cria um repositório privado "arena-radar" no meu GitHub e faz o primeiro commit;
3) propõe o plano para executar o P0 do backlog, por ordem, sem ainda alterar ficheiros.
```

**Prompt 2 — Dados reais**
```
Cria o ambiente Python, instala scripts/requirements.txt e corre collect_news.py e collect_trends.py para o cliente indicado.
Mostra-me o que foi recolhido e o que falhou. Não inventes dados para preencher falhas.
```

**Prompt 3 — Protótipo v3**
```
Executa RB-02 a RB-08 do backlog, uma tarefa de cada vez, com um commit por tarefa.
Antes de cada commit abre o HTML e confirma que não há erros na consola e que nenhum número aparece sem etiqueta de origem.
```

**Prompt 4 — Materiais para a direção**
```
Executa RB-09 a RB-12. Para o deck segue o guião do anexo de docs/00-ponto-de-situacao.md.
```

## 3. Boas práticas
- Um pedido de cada vez; rever o que mudou antes de avançar.
- Se o Claude Code propuser algo contra as regras do `CLAUDE.md`, corrigir e pedir para atualizar o `CLAUDE.md` se a regra mudar.
- Dados internos de clientes (ex.: chatbot): colocar em `data/raw/internal/` manualmente. Nunca colar no chat nem fazer commit.
- Conta Claude pessoal + dados de clientes: confirmar com o IT da Havas o que é aceitável antes de usar dados internos.

## 4. Meta Ad Library (quando houver tempo)
1. Confirmar identidade na Meta (necessário para aceder à Ad Library API).
2. Criar uma app em developers.facebook.com e gerar um token de utilizador.
3. Colocar o token em `.env` (`META_ACCESS_TOKEN`). O `.env` nunca vai para o Git.
4. Correr `python scripts/collect_meta_ads.py --client <cliente>`.
