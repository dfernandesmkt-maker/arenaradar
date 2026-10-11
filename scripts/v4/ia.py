"""
Arena Radar v4 — resumo da semana e classificação de criativos (RB-114).

Duas tarefas de linguagem, sempre revistas pela equipa antes de saírem da agência:
1. BRIEFING DA SEMANA: a partir dos factos da semana (movimentos, previsões, respostas combinadas),
   escreve «em 30 segundos», os pontos principais, as decisões que cabem à equipa e um rascunho
   de email para o cliente, assinado pela Arena. Nada é enviado: a equipa revê, edita e decide.
2. CLASSIFICAÇÃO DE CRIATIVOS: para cada criativo, mecânica da oferta, tom, público e ação pedida.
   Classifica-se cada texto distinto uma só vez (cache por conteúdo).

Dois modos:
- Por defeito (demonstração e sem credenciais): REGRAS escritas à mão. Determinístico, sem chamadas externas.
- Com `--ia` e credenciais da API da Anthropic no ambiente: CLAUDE (modelo MODELO), com saída estruturada
  por esquema JSON. O resultado fica em cache em `data/v4/ia/<cliente>.json`, chaveado pelo hash dos factos,
  para não repetir chamadas nem custos.

Governação: o que segue para o modelo são só factos públicos sobre concorrentes e os nomes das respostas
combinadas. Nunca dados internos do cliente (`data/raw/internal/`). Na versão ligada, o uso de um modelo
externo precisa de aprovação de IT e Compliance (Q13); o fornecedor pode vir a ser outro (ex.: o que o grupo
aprovar). Ver docs/dossier/03-governacao/supervisao-humana.md.

LIGAÇÃO[ia-resumo] LIGAÇÃO[ia-classificacao]
"""
from __future__ import annotations

import hashlib
import json
import os
import re
from collections import Counter
from datetime import date, timedelta
from pathlib import Path

MODELO = "claude-opus-5-5"
VERSAO_REGRAS = "regras-1"
VERSAO_PROMPT = "prompt-1"

MECANICAS = ["Desconto no preço", "Saldo, pontos ou cupões", "Oferta ou brinde", "Preço garantido", "Leve mais, pague menos", "Sem oferta"]
TONS = ["Urgência", "Racional", "Emocional", "Informativo"]
ACOES = ["Comprar", "Visitar a loja ou o posto", "Usar a app", "Saber mais"]
CTA_ACAO = {"Ver ofertas": "Comprar", "Aproveitar": "Comprar", "Encontrar loja": "Visitar a loja ou o posto",
            "Descarregar app": "Usar a app", "Saber mais": "Saber mais"}


def _h(x) -> str:
    return hashlib.sha256(json.dumps(x, ensure_ascii=False, sort_keys=True).encode()).hexdigest()[:16]


def credenciais() -> bool:
    return bool(os.environ.get("ANTHROPIC_API_KEY") or os.environ.get("ANTHROPIC_AUTH_TOKEN"))


# ---------------------------------------------------------------- factos
def intervalo(a: date, b: date, fdata) -> str:
    """«28 set a 4 out 2026», «5 a 26 out 2026»."""
    if a.year != b.year:
        return f"{fdata(a)} a {fdata(b)}"
    if a.month != b.month:
        return f"{fdata(a).rsplit(' ', 1)[0]} a {fdata(b)}"
    return f"{a.day} a {fdata(b)}"


def factos(d: dict, wdate, fdata) -> dict:
    """O que o modelo (ou as regras) pode usar. Só factos já presentes nos dados do Radar."""
    Z = d["calendario"]["atual"]
    hoje = date.fromisoformat(d["calendario"]["hoje"])
    nome = {m["id"]: m["nome"] for m in d["marcas"]}
    rid = {r["id"]: r for r in d["respostas"]}
    sem = sorted([m for m in d["movimentos"] if m["semana"] >= Z], key=lambda m: -m["importancia"])
    def resp(ids):
        return [{"nome": rid[x]["nome"], "estado": rid[x]["estado"], "prazo": rid[x].get("prazo", ""), "o_que": rid[x].get("o_que", "")} for x in ids]
    prev = []
    for p in d["previsoes"][:4]:
        abre, ate = wdate(p["ini"]), wdate(p["ini"]) - timedelta(days=7)
        prev.append({"id": p["id"], "marca": nome[p["marca"]], "nome": p["nome"], "tipo": p["tipo"], "confianca": p["confianca"],
                     "janela": intervalo(abre, wdate(p["fim"] + 1), fdata), "abre": fdata(abre), "porque": p["porque"],
                     "sinal": (p.get("sinal") or {}).get("texto", ""), "preparar_ate": "já" if ate <= hoje else fdata(ate),
                     "respostas": resp(p.get("respostas", []))})
    return {
        "cliente": d["cliente"]["nome"], "setor": d["cliente"]["setor"],
        "semana": intervalo(wdate(Z), wdate(Z) + timedelta(days=6), fdata),
        "concorrentes": [m["nome"] for m in d["marcas"] if not m["cliente"]],
        "movimentos": [{"id": m["id"], "marca": nome[m["marca"]], "tipo": m["tipo"], "titulo": m["titulo"], "resumo": m["resumo"],
                        "nivel": m["nivel"], "oferta": m.get("oferta"), "o_que_costuma_seguir": m.get("seguinte", ""),
                        "respostas": resp(m["respostas"])} for m in sem[:8]],
        "previsoes": prev,
    }


# ---------------------------------------------------------------- briefing: regras
def _frase(s: str) -> str:
    s = s.strip()
    return s if s.endswith((".", "!", "?")) else s + "."


def briefing_regras(f: dict) -> dict:
    M, P, cl = f["movimentos"], f["previsoes"], f["cliente"]
    imp = [m for m in M if m["nivel"] == "importante"]
    if M:
        top = M[0]
        em30 = (f"{len(M)} movimento{'s' if len(M) != 1 else ''} da concorrência esta semana"
                + (f", {len(imp)} importante{'s' if len(imp) != 1 else ''}" if imp else "") + f". O principal: {_frase(top['titulo'])}")
        pr = next((r for r in top["respostas"] if r["estado"] == "pronta"), None)
        em30 += f" Há uma resposta combinada pronta («{pr['nome']}»)." if pr else (" A resposta combinada ainda está por preparar." if top["respostas"] else " Não há resposta combinada para isto.")
    else:
        em30 = "Semana calma: nenhum movimento da concorrência."
    pontos = []
    for m in M[:3]:
        pontos.append({"texto": _frase(m["titulo"]) + " " + _frase(m["o_que_costuma_seguir"]) if m["o_que_costuma_seguir"] else _frase(m["titulo"]), "movimento": m["id"]})
    for p in P[:1]:
        pontos.append({"texto": f"A seguir: «{p['nome']}» da {p['marca']} deve arrancar na janela de {p['janela']} (confiança {p['confianca']})." + (f" {_frase(p['sinal'])}" if p["sinal"] else ""), "movimento": ""})
    dec = []
    for m in imp[:3]:
        pr = next((r for r in m["respostas"] if r["estado"] == "pronta"), None)
        pp = next((r for r in m["respostas"] if r["estado"] != "pronta"), None)
        if pr:
            dec.append({"texto": f"Ativar «{pr['nome']}» em resposta à {m['marca']}? Está pronta; prazo combinado: {pr['prazo'] or 'por definir'}.", "movimento": m["id"]})
        elif pp:
            dec.append({"texto": f"Preparar «{pp['nome']}» para responder à {m['marca']}.", "movimento": m["id"]})
        else:
            dec.append({"texto": f"Combinar com a {cl} uma resposta para movimentos destes ({m['tipo'].lower()} da {m['marca']})?", "movimento": m["id"]})
    for p in P[:2]:
        pp = [r for r in p["respostas"] if r["estado"] != "pronta"]
        if pp:
            dec.append({"texto": (f"Preparar já «{pp[0]['nome']}»: a janela de «{p['nome']}» da {p['marca']} abre a {p['abre']}." if p["preparar_ate"] == "já"
                                  else f"Preparar «{pp[0]['nome']}» até {p['preparar_ate']}, antes de «{p['nome']}» da {p['marca']}."), "movimento": ""})
    linhas = [f"• {_frase(m['titulo'])}" for m in M[:3]]
    if P:
        linhas.append(f"• A seguir, esperamos «{P[0]['nome']}» da {P[0]['marca']} na janela de {P[0]['janela']}.")
    corpo = (f"Olá,\n\nDeixamos o resumo da atividade da concorrência na semana de {f['semana']}.\n\n" + "\n".join(linhas)
             + "\n\nA nossa leitura e o que propomos fazer seguem na reunião de acompanhamento.\n\nArena Media")
    return {"em30s": em30, "pontos": pontos[:5], "decisoes": dec[:4],
            "para_cliente": {"assunto": f"Concorrência: o que mexeu na semana de {f['semana']}", "corpo": corpo}}


# ---------------------------------------------------------------- briefing: Claude
ESQ_BRIEFING = {
    "type": "object", "additionalProperties": False, "required": ["em30s", "pontos", "decisoes", "para_cliente"],
    "properties": {
        "em30s": {"type": "string", "description": "Duas frases, no máximo."},
        "pontos": {"type": "array", "items": {"type": "object", "additionalProperties": False, "required": ["texto", "movimento"],
                                              "properties": {"texto": {"type": "string"}, "movimento": {"type": "string"}}}},
        "decisoes": {"type": "array", "items": {"type": "object", "additionalProperties": False, "required": ["texto", "movimento"],
                                                "properties": {"texto": {"type": "string"}, "movimento": {"type": "string"}}}},
        "para_cliente": {"type": "object", "additionalProperties": False, "required": ["assunto", "corpo"],
                         "properties": {"assunto": {"type": "string"}, "corpo": {"type": "string"}}},
    },
}

SISTEMA_BRIEFING = """És o redator do briefing semanal de concorrência de uma agência de meios portuguesa (Arena Media).
Escreves para a equipa de conta, que revê tudo antes de qualquer uso.

Regras:
- Português europeu (Acordo Ortográfico). Nunca português do Brasil. Frases curtas e diretas, sem jargão de marketing.
- Usa só os factos fornecidos. Não inventes números, datas, marcas nem intenções. Se um facto não está nos dados, não o escrevas.
- A plataforma sugere, a equipa decide: as decisões são perguntas ou propostas à equipa («Ativar …?», «Preparar … até …»), nunca ordens nem recomendações diretas ao cliente.
- «em30s»: no máximo duas frases com o essencial da semana.
- «pontos»: 3 a 5 pontos, do mais para o menos importante. Em «movimento», o id do movimento a que o ponto se refere, ou "" se não se refere a nenhum.
- «decisoes»: 1 a 4 decisões que cabem à equipa esta semana, ligadas às respostas combinadas quando existem (indica o estado e o prazo). Em «movimento», o id ou "".
- «para_cliente»: rascunho de email para o cliente, assinado «Arena Media» (sem nomes de pessoas). Não incluas pontuações, níveis de importância, nomes internos de respostas nem quem as executa na agência. Tom profissional e factual."""


def briefing_claude(f: dict) -> dict:
    import anthropic  # só necessário no modo --ia

    client = anthropic.Anthropic()  # credenciais do ambiente (ANTHROPIC_API_KEY ou ANTHROPIC_AUTH_TOKEN)
    r = client.beta.messages.create(
        model=MODELO,
        max_tokens=8000,
        betas=["server-side-fallback-2026-07-01"],
        fallbacks="default",  # se o modelo recusar, o pedido corre no modelo de recurso recomendado
        thinking={"type": "adaptive"},
        output_config={"effort": "medium", "format": {"type": "json_schema", "schema": ESQ_BRIEFING}},
        system=SISTEMA_BRIEFING,
        messages=[{"role": "user", "content": "Factos da semana (JSON):\n" + json.dumps(f, ensure_ascii=False, indent=1)}],
    )
    if r.stop_reason == "refusal":
        raise RuntimeError("o modelo recusou o pedido")
    if r.stop_reason == "max_tokens":
        raise RuntimeError("resposta cortada (max_tokens)")
    txt = next(b.text for b in r.content if b.type == "text")
    return {"saida": json.loads(txt), "modelo": r.model}


# ---------------------------------------------------------------- classificação: regras
def _tem(s: str, *pal: str) -> bool:
    return any(re.search(p, s, re.I) for p in pal)


def classificar_regras(c: dict, publicos: dict) -> dict:
    o, t = c.get("oferta") or "", c["titulo"]
    if not o:
        mec = "Sem oferta"
    elif _tem(o, r"2\.ª unidade"):
        mec = "Leve mais, pague menos"
    elif _tem(o, "garantid"):
        mec = "Preço garantido"
    elif _tem(o, "grátis", "gratuit", "cabaz de viagem", r"\bkit\b", "sem taxa", "entrega marcada"):
        mec = "Oferta ou brinde"
    elif _tem(o, "saldo", "pontos", "cupões", "a dobrar"):
        mec = "Saldo, pontos ou cupões"
    else:
        mec = "Desconto no preço"
    tx = t + " " + o
    if _tem(tx, "fim de semana", "esta semana", "sexta", r"\b3 dias\b", "hoje", r"\bagora\b", "durante"):
        tom = "Urgência"
    elif c.get("teste") or _tem(t, "novo", "chegaram", "200 produtos", "lançou"):
        tom = "Informativo"
    elif _tem(tx, "natal", "casa", "mesa", "férias", "estrada é tua", "viagens", "pausa", "qualidade que", "produtor", "contigo"):
        tom = "Emocional"
    else:
        tom = "Racional"
    return {"mecanica": mec, "tom": tom, "publico": publicos.get(c["territorio"], "Todos"), "acao": CTA_ACAO.get(c["cta"], "Saber mais")}


# ---------------------------------------------------------------- classificação: Claude
ESQ_CLASS = {
    "type": "object", "additionalProperties": False, "required": ["itens"],
    "properties": {"itens": {"type": "array", "items": {
        "type": "object", "additionalProperties": False, "required": ["k", "mecanica", "tom", "publico", "acao"],
        "properties": {"k": {"type": "string"}, "mecanica": {"type": "string", "enum": MECANICAS}, "tom": {"type": "string", "enum": TONS},
                       "publico": {"type": "string", "description": "Público principal, 2 a 5 palavras"}, "acao": {"type": "string", "enum": ACOES}}}}},
}

SISTEMA_CLASS = """Classificas anúncios de concorrentes para uma agência de meios portuguesa. Para cada anúncio (texto, oferta, botão, território de mensagem):
- mecanica: a mecânica da oferta (se não há oferta, «Sem oferta»);
- tom: Urgência (prazo curto ou escassez), Racional (preço, conveniência), Emocional (momentos, pessoas, sensações) ou Informativo (novidade, lançamento);
- publico: o público principal a que se dirige, em 2 a 5 palavras, em português europeu;
- acao: o que o anúncio pede ao público.
Usa só o que está no anúncio. Devolve um item por anúncio, com a mesma chave «k»."""


def classificar_claude(itens: list[dict]) -> dict:
    import anthropic

    client = anthropic.Anthropic()
    out = {}
    for i in range(0, len(itens), 40):
        lote = itens[i:i + 40]
        r = client.beta.messages.create(
            model=MODELO,
            max_tokens=16000,
            betas=["server-side-fallback-2026-07-01"],
            fallbacks="default",
            thinking={"type": "adaptive"},
            output_config={"effort": "low", "format": {"type": "json_schema", "schema": ESQ_CLASS}},
            system=SISTEMA_CLASS,
            messages=[{"role": "user", "content": json.dumps(lote, ensure_ascii=False)}],
        )
        if r.stop_reason in ("refusal", "max_tokens"):
            raise RuntimeError(f"lote {i // 40 + 1}: {r.stop_reason}")
        txt = next(b.text for b in r.content if b.type == "text")
        for x in json.loads(txt)["itens"]:
            out[x.pop("k")] = x
    return out


# ---------------------------------------------------------------- orquestração com cache
def aplicar(d: dict, cfg: dict, wdate, fdata, cache_dir: Path, usar_ia: bool) -> None:
    """Acrescenta d['briefing'] e d['criativos'][i]['cls'] e os blocos de proveniência correspondentes."""
    cid = d["cliente"]["id"]
    cp = cache_dir / f"{cid}.json"
    cache = json.loads(cp.read_text(encoding="utf-8")) if cp.exists() else {"briefing": {}, "classificacao": {}}
    ia = usar_ia and credenciais()
    if usar_ia and not ia:
        print(f"  {cid}: --ia pedido, mas sem credenciais da API no ambiente; usa as regras.")

    # briefing
    f = factos(d, wdate, fdata)
    hk = _h([f, VERSAO_PROMPT])
    meta = None
    if hk in cache["briefing"]:
        b = cache["briefing"][hk]
        saida, meta = b["saida"], b["meta"]
    elif ia:
        try:
            r = briefing_claude(f)
            saida = r["saida"]
            meta = {"autor": "ia", "modelo": r["modelo"], "versao": VERSAO_PROMPT, "gerado_em": date.today().isoformat()}
            cache["briefing"][hk] = {"saida": saida, "meta": meta}
        except Exception as e:  # sem rede, recusa ou erro da API: o Radar não para, usa as regras
            print(f"  {cid}: briefing por IA falhou ({e}); usa as regras.")
    if meta is None:
        saida = briefing_regras(f)
        meta = {"autor": "regras", "modelo": None, "versao": VERSAO_REGRAS, "gerado_em": d["gerado_em"]}
    d["briefing"] = {**saida, "semana": f["semana"], "meta": {**meta, "estado": "por rever"}}

    # classificação de criativos: cada texto distinto uma só vez
    pub = cfg.get("publicos", {})
    chave = lambda c: _h([c["titulo"], c.get("oferta"), c["cta"], c["territorio"], c.get("teste", False)])
    novos = {}
    for c in d["criativos"]:
        k = chave(c)
        if k not in cache["classificacao"] and k not in novos:
            novos[k] = {"k": k, "texto": c["titulo"], "oferta": c.get("oferta") or "", "botao": c["cta"], "territorio": c["territorio"], "teste": c.get("teste", False)}
    feitos = {}
    if ia and novos:
        try:
            feitos = {k: {**v, "autor": "ia"} for k, v in classificar_claude(list(novos.values())).items()}
        except Exception as e:
            print(f"  {cid}: classificação por IA falhou ({e}); usa as regras.")
    n_ia = 0
    for c in d["criativos"]:
        k = chave(c)
        x = cache["classificacao"].get(k) or feitos.get(k)
        if x and x.get("autor") == "ia":
            cache["classificacao"][k] = x
            n_ia += 1
        else:
            x = {**classificar_regras(c, pub), "autor": "regras"}
        c["cls"] = {kk: x[kk] for kk in ("mecanica", "tom", "publico", "acao")}

    autor_b = d["briefing"]["meta"]["autor"]
    d["blocos"]["briefing"] = {"nome": "Resumo da semana", "origem": "estimado",
                               "metodo": (f"Redigido por IA ({meta['modelo']}) a partir dos movimentos e previsões da semana; por rever pela equipa"
                                          if autor_b == "ia" else "Redigido por regras a partir dos movimentos e previsões da semana (demonstração; na versão ligada, por IA); por rever pela equipa"),
                               "fonte_futura": "ia-resumo"}
    d["blocos"]["classificacao"] = {"nome": "Classificação de criativos", "origem": "estimado",
                                    "metodo": (f"Classificação automática por IA ({MODELO}) em {n_ia} de {len(d['criativos'])} criativos" + ("; restantes por regras" if n_ia < len(d["criativos"]) else "")
                                               if n_ia else "Classificação automática por regras sobre o texto, a oferta e o botão (demonstração; na versão ligada, por IA)"),
                                    "fonte_futura": "ia-classificacao"}
    if ia:
        cache_dir.mkdir(parents=True, exist_ok=True)
        cp.write_text(json.dumps(cache, ensure_ascii=False, indent=1), encoding="utf-8")
