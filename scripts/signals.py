"""Motor de sinais: regras genéricas de materialidade que transformam dados em sinais e pistas de ação.

A plataforma SUGERE; a equipa DECIDE. Cada sinal traz o número, o limiar usado e a fonte (bloco de dados).
As regras são genéricas (servem qualquer cliente); o que é específico de um cliente vem do seu YAML
(`sinais_modelo`, para universos de tipo «tema»).
"""
from __future__ import annotations

from datetime import date, timedelta
from statistics import mean


def fmt_pt(n: float, dec: int = 0) -> str:
    s = f"{abs(n):,.{dec}f}".replace(",", " ").replace(".", ",")
    return ("−" if n < 0 else "") + s


def semana_de(d: date, inicio: date) -> int:
    return (d - inicio).days // 7


def matriz_anuncios(anuncios: list[dict], marcas: list[str], plataformas: list[str], inicio: date,
                    n: int) -> tuple[dict, dict]:
    """AD[marca][plataforma][semana] = anúncios ativos; NA[...] = anúncios novos nessa semana."""
    ad = {m: {p: [0] * n for p in plataformas} for m in marcas}
    na = {m: {p: [0] * n for p in plataformas} for m in marcas}
    for a in anuncios:
        m, p = a["marca"], a["plataforma"]
        if m not in ad or p not in ad[m]:
            continue
        st = max(0, semana_de(date.fromisoformat(a["data_inicio"]), inicio))
        en = n - 1 if not a.get("data_fim") else min(n - 1, semana_de(date.fromisoformat(a["data_fim"]), inicio))
        if st > n - 1:
            continue
        na[m][p][st] += 1
        for w in range(st, max(st, en) + 1):
            ad[m][p][w] += 1
    return ad, na


def _pista(sid: str, titulo: str, sinal: str, leitura: str, acao: str, para: str, confianca: str,
           bloco: str, hipotese: bool = False) -> dict:
    return {"id": "p-" + sid, "sinal_id": sid, "titulo": titulo, "sinal": sinal, "leitura": leitura,
            "acao": acao, "para": para, "confianca": confianca, "bloco": bloco, "hipotese": hipotese}


def sinais_concorrencia(ents: list[dict], ad: dict, na: dict, anuncios: list[dict], plats: list[dict],
                        lim: dict, z: int, inicio: date, origem_bloco: str) -> tuple[list[dict], list[dict]]:
    inc = [e for e in ents if e.get("incluida")]
    me = next(e for e in ents if e.get("cliente"))
    pn = [p["id"] for p in plats]
    peso = {p["id"]: p["peso"] for p in plats}
    conf = ("Ilustrativo: depende de dados reais." if origem_bloco == "demo"
            else "Confiança média: confirmar com a equipa antes de agir.")

    def act(b, w):
        return sum(ad[b][p][w] for p in pn)

    def press(b, w):
        return sum(ad[b][p][w] * peso[p] for p in pn)

    def avg(b, a, c):
        return mean([act(b, w) for w in range(a, c + 1)])

    out: list[dict] = []
    pistas: list[dict] = []

    def add(s: dict, p: dict | None):
        s["id"] = f"sg{len(out) + 1}"
        s["bloco"] = "anuncios"
        if p:
            p = {**p, "id": "p-" + s["id"], "sinal_id": s["id"], "bloco": "anuncios"}
            pistas.append(p)
            s["pista_id"] = p["id"]
        out.append(s)

    lim_up = lim.get("anuncios_variacao_4s", 0.12) * 100
    ch = []
    for e in inc:
        l, p_ = avg(e["id"], z - 3, z), avg(e["id"], z - 7, z - 4)
        if p_ >= 3:
            ch.append({"e": e, "l": l, "p": p_, "d": (l / p_ - 1) * 100})

    # 1) maior subida de pressão entre os concorrentes
    ups = sorted([c for c in ch if not c["e"].get("cliente")], key=lambda c: -c["d"])
    if ups and ups[0]["d"] > lim_up:
        u = ups[0]
        pf = max(pn, key=lambda p: mean(ad[u["e"]["id"]][p][z - 3:z + 1]) - mean(ad[u["e"]["id"]][p][z - 7:z - 3]))
        t = f"{u['e']['nome']} aumentou os anúncios ativos em {fmt_pt(u['d'])}% nas últimas 4 semanas"
        add({"categoria": "Atividade", "entidade": u["e"]["id"], "titulo": t, "material": True,
             "valor": round(u["d"], 1), "limiar": lim_up,
             "leitura": f"Passou de {fmt_pt(u['p'])} para {fmt_pt(u['l'])} anúncios ativos em média, sobretudo em {pf}.",
             "serie": {"tipo": "anuncios_ativos", "id": u["e"]["id"]}},
            _pista("", f"Responder ao aumento de pressão de {u['e']['nome']}", t,
                   f"Passou de {fmt_pt(u['p'])} para {fmt_pt(u['l'])} anúncios ativos em média, sobretudo em {pf}.",
                   f"Rever lances e orçamento em {pf} nas próximas duas semanas.", "Performance", conf, ""))

    # 2) lançamento: muitos criativos novos em 2 semanas
    lanc = []
    for e in inc:
        if e.get("cliente"):
            continue
        n2 = sum(na[e["id"]][p][w] for p in pn for w in (z - 1, z))
        base = mean([sum(na[e["id"]][p][w] for p in pn) for w in range(z - 9, z - 1)])
        if n2 >= lim.get("lancamento_criativos_2s", 5) and n2 >= 3 * max(base, 0.5):
            lanc.append((n2, e))
    if lanc:
        n2, e = max(lanc, key=lambda x: x[0])
        novos = [a for a in anuncios if a["marca"] == e["id"] and
                 semana_de(date.fromisoformat(a["data_inicio"]), inicio) >= z - 1]
        terr = [a.get("territorio") for a in novos if a.get("territorio")]
        top_t = max(set(terr), key=terr.count) if terr else None
        top_p = max(set(a["plataforma"] for a in novos), key=[a["plataforma"] for a in novos].count)
        t = f"{e['nome']} lançou {n2} criativos novos em 2 semanas"
        leit = (f"Território: {top_t.lower()}. " if top_t else "") + f"Plataforma principal: {top_p}."
        add({"categoria": "Lançamento", "entidade": e["id"], "titulo": t, "material": True, "valor": n2,
             "limiar": lim.get("lancamento_criativos_2s", 5), "leitura": leit,
             "serie": {"tipo": "anuncios_ativos", "id": e["id"]}},
            _pista("", f"Avaliar o lançamento de {e['nome']}", t, leit,
                   (f"Avaliar se a nossa mensagem em «{top_t.lower()}» precisa de reforço."
                    if top_t else "Avaliar se a nossa mensagem precisa de reforço."), "Brand", conf, ""))

    # 3) quota de voz do cliente (sempre incluída)
    def sv(w):
        t = sum(press(e["id"], w) for e in inc)
        return press(me["id"], w) / t * 100 if t else 0.0

    d8 = sv(z) - sv(z - 8)
    lim_sv = lim.get("quota_voz_pp_8s", 5.0)
    t = f"{me['nome']} {'perdeu' if d8 < 0 else 'ganhou'} {fmt_pt(abs(d8), 1)} p.p. de quota de voz em 8 semanas"
    leit = f"Quota de voz atual: {fmt_pt(sv(z), 1)}% entre as {len(inc)} marcas do conjunto."
    add({"categoria": "Quota de voz", "entidade": me["id"], "titulo": t, "material": abs(d8) >= lim_sv,
         "valor": round(d8, 1), "limiar": lim_sv, "leitura": leit,
         "serie": {"tipo": "quota_voz", "id": me["id"]}, "em_observacao": abs(d8) < lim_sv},
        _pista("", f"Acompanhar a quota de voz de {me['nome']}", t, leit,
               ("Preparar a leitura para a próxima reunião de acompanhamento e discutir o plano de resposta."
                if d8 < 0 else "Documentar o que está a funcionar para replicar noutras ativações."),
               "Account", conf, ""))

    # 4) queda de pressão
    dns = sorted([c for c in ch if not c["e"].get("cliente")], key=lambda c: c["d"])
    if dns and dns[0]["d"] < -lim_up:
        d = dns[0]
        t = f"{d['e']['nome']} reduziu a pressão em {fmt_pt(abs(d['d']))}%"
        leit = (f"Média de {fmt_pt(d['l'])} anúncios ativos, contra {fmt_pt(d['p'])} nas 4 semanas anteriores. "
                "Pode ser pausa entre campanhas.")
        add({"categoria": "Pressão", "entidade": d["e"]["id"], "titulo": t, "material": True,
             "valor": round(d["d"], 1), "limiar": -lim_up, "leitura": leit,
             "serie": {"tipo": "anuncios_ativos", "id": d["e"]["id"]}},
            _pista("", f"Aproveitar a menor pressão de {d['e']['nome']}", t, leit,
                   "Janela de menor ruído para reforçar a presença, a confirmar com o histórico.",
                   "Performance", conf, ""))
    return out[:4], [p for p in pistas if p["sinal_id"] in {s["id"] for s in out[:4]}]


def sinais_tema(cfg: dict, series: dict[str, list], indicadores: dict, lim: dict, z: int,
                blocos: dict) -> tuple[list[dict], list[dict]]:
    """Sinais de universos de tipo «tema»: o conteúdo vem do YAML do cliente (`sinais_modelo`)."""
    out, pistas = [], []
    lim_p = lim.get("pesquisas_variacao_vs_media_8s", 0.30) * 100
    for m in cfg.get("sinais_modelo", []):
        g = m.get("gatilho", {})
        material, ctx = not m.get("em_observacao", False), {"variacao": "", "limiar": fmt_pt(lim_p)}
        if g.get("tipo") == "procura_variacao":
            v = series.get(g["serie"])
            if not v or len(v) < z + 1 or v[z] is None:
                continue
            base = [x for x in v[z - 8:z] if x is not None]
            if not base or mean(base) <= 2:
                continue
            pct = round((v[z] / mean(base) - 1) * 100)
            if pct <= 0:
                continue
            ctx["variacao"] = fmt_pt(pct)
            material = pct >= lim_p
            valor, limiar = pct, lim_p
        elif g.get("tipo") == "indicador":
            if g["indicador"] not in indicadores:
                continue
            valor, limiar = indicadores[g["indicador"]].get("variacao"), None
        else:
            valor, limiar = None, None
        if m.get("bloco") not in blocos:
            continue

        def fill(s: str) -> str:
            return s.format(**ctx) if s else s

        s = {"id": m["id"], "categoria": m["categoria"], "titulo": fill(m["titulo"]),
             "leitura": fill(m["leitura"]), "sinal": fill(m.get("sinal", "")), "material": material,
             "em_observacao": not material, "valor": valor, "limiar": limiar, "bloco": m["bloco"],
             "hipotese": bool(m.get("hipotese"))}
        if m.get("serie"):
            s["serie"] = m["serie"]
        p = m.get("pista")
        if p:
            pistas.append({"id": "p-" + m["id"], "sinal_id": m["id"], "titulo": p["titulo"],
                           "sinal": fill(p["sinal"]), "leitura": fill(p["leitura"]), "acao": p["acao"],
                           "para": p["para"], "confianca": p["confianca"], "bloco": m["bloco"],
                           "hipotese": bool(m.get("hipotese"))})
            s["pista_id"] = "p-" + m["id"]
        out.append(s)
    return out, pistas
