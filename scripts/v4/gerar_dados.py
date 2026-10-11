"""Arena Radar v4 — gera os dados de DEMONSTRAÇÃO do radar de movimentos (D50).

    python3 scripts/v4/gerar_dados.py

Lê config/v4/ (agência e clientes fictícios) e escreve data/v4/<cliente>.json e data/v4/agencia.json.

O que faz, por cliente:
1. Simula 2 anos de comportamento de cada marca a partir da configuração: campanhas (com os seus criativos),
   promoções repetidas, lançamentos, notícias, preços e presença nas pesquisas do cliente (leilão).
2. Deteta os MOVIMENTOS (o objeto central da v4): lançamento de campanha, promoção, mudança de preço,
   lançamento de produto ou serviço, teste de criativos, subida no leilão, notícia. Cada movimento tem prova
   (criativos ou série), importância explicada e o histórico da mesma marca.
3. Calcula as PREVISÕES («À frente») a partir do histórico, como a versão ligada fará com dados reais:
   séries de campanhas que se repetem na mesma altura do ano, promoções com ritmo regular e testes de criativos
   que costumam anteceder campanhas.
4. Liga cada movimento e previsão às RESPOSTAS combinadas com o cliente.

Regra de ouro: tudo o que sai daqui tem origem «demo» (ou «estimado», com método) e só usa marcas fictícias.
LIGAÇÃO[meta-ad-library] LIGAÇÃO[google-ads-transparency] LIGAÇÃO[tiktok-ccl] LIGAÇÃO[auction-insights]
LIGAÇÃO[dgeg-precos] LIGAÇÃO[monitor-paginas] LIGAÇÃO[noticias-rss]: na versão ligada, os passos 1 e 2 leem dados
reais destas fontes; os passos 3 e 4 mantêm-se.
"""
from __future__ import annotations

import json
import math
import random
from datetime import date, timedelta
from pathlib import Path
from statistics import mean

import yaml

ROOT = Path(__file__).resolve().parents[2]
CFG = ROOT / "config" / "v4"
OUT = ROOT / "data" / "v4"

TIPOS = ["Campanha", "Promoção", "Preço", "Lançamento", "Teste de criativos", "Leilão", "Imprensa"]
BONUS_TIPO = {"Promoção": 10, "Preço": 12, "Lançamento": 8, "Campanha": 6, "Teste de criativos": 8, "Leilão": 12, "Imprensa": 0}
FORMATOS = {"Meta": ["Imagem", "Vídeo", "Carrossel"], "YouTube": ["Vídeo"], "TikTok": ["Vídeo"], "Google": ["Texto", "Texto", "Imagem"]}
CTAS = ["Saber mais", "Ver ofertas", "Descarregar app", "Encontrar loja", "Aproveitar"]
MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"]
MES3 = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"]


def load(p: Path) -> dict:
    return yaml.safe_load(p.read_text(encoding="utf-8"))


AG = load(CFG / "agencia.yaml")
INI: date = AG["calendario"]["inicio"]
NW: int = AG["calendario"]["semanas"]
FUT: int = AG["calendario"]["futuro"]
Z = NW - 1
PL = [p["id"] for p in AG["plataformas"]]
PVAL = {p["id"]: p["valor"] for p in AG["plataformas"]}
OFF = AG["offline"]


def widx(d: date) -> int:
    return (d - INI).days // 7


def wdate(i: int) -> date:
    return INI + timedelta(weeks=i)


def iso_idx(ano: int, sem: int) -> int:
    return widx(date.fromisocalendar(int(ano), int(sem), 1))


def fdata(d: date) -> str:
    return f"{d.day} {MES3[d.month - 1]} {d.year}"


def fsem(i: int) -> str:
    a, b = wdate(i), wdate(i) + timedelta(days=6)
    return f"{a.day} {MES3[a.month - 1]}" + (f" a {b.day} {MES3[b.month - 1]}" if True else "")


def lista(xs: list[str]) -> str:
    xs = list(xs)
    return xs[0] if len(xs) == 1 else ", ".join(xs[:-1]) + " e " + xs[-1]


def bloco(nome: str, origem: str, metodo: str, fonte_futura: str) -> dict:
    return {"nome": nome, "origem": origem, "fonte": None, "data_recolha": None, "metodo": metodo, "fonte_futura": fonte_futura}


# --------------------------------------------------------------------------------------------- cliente
def build(cfg: dict) -> dict:
    cl = cfg["cliente"]
    rnd = random.Random(cl["seed"])
    marcas = cfg["marcas"]
    cli = next(m for m in marcas if m.get("cliente"))
    k = 0
    for m in marcas:
        m["cliente"] = bool(m.get("cliente"))
        if m["cliente"]:
            m["cor"] = 0
        else:
            k += 1
            m["cor"] = k                          # paleta: cliente = tinta; concorrentes 1..7 (D47)
    nome = {m["id"]: m["nome"] for m in marcas}
    chave = set(cfg.get("territorios_chave", []))
    textos = cfg["textos"]

    # ---------- 1. ocorrências: campanhas, promoções e pontuais com criativos
    occ = []
    for c in cfg["campanhas"]:
        for ano, (sem, dur) in c["anos"].items():
            s = iso_idx(ano, sem)
            if s > Z or s + dur - 1 < 0:
                continue
            occ.append({"id": f"{c['marca']}-{c['serie']}-{ano}", "tipo": "campanha", "marca": c["marca"], "serie": c["serie"],
                        "nome": c["nome"], "ano": int(ano), "sem_iso": int(sem), "ini": s, "fim": s + dur - 1, "dur": dur,
                        "canais": c["canais"], "territorio": c["territorio"], "oferta": c.get("oferta"), "peso": c["peso"],
                        "n": c["criativos"], "teste": bool(c.get("teste"))})
    for p in cfg.get("promocoes", []):
        for w in range(p["desde"], Z + 1, p["a_cada"]):
            if w >= Z - 1:                         # as da semana atual vêm dos pontuais (são mais fortes)
                continue
            occ.append({"id": f"{p['marca']}-promo-{w}", "tipo": "promo", "marca": p["marca"], "serie": "promo-" + p["marca"], "nome": p["nome"],
                        "ini": w, "fim": w, "dur": 1, "canais": p["canais"], "territorio": p["territorio"], "oferta": p["oferta"],
                        "peso": p["peso"], "n": 2, "teste": False})
    for i, p in enumerate(cfg.get("pontuais", [])):
        w = widx(p["data"])
        if p.get("criativos"):
            occ.append({"id": f"pt-{i}", "tipo": "pontual", "marca": p["marca"], "serie": p.get("serie"), "nome": p["titulo"],
                        "ini": w, "fim": min(Z, w + (0 if p["tipo"] == "Teste de criativos" else 3)), "dur": 1, "canais": p["canais"],
                        "territorio": p["territorio"], "oferta": p.get("oferta"), "peso": p["peso"], "n": p["criativos"],
                        "teste": p["tipo"] == "Teste de criativos"})
    # testes antes das campanhas que costumam testar (2 semanas antes)
    for o in [o for o in occ if o["tipo"] == "campanha" and o["teste"]]:
        t = o["ini"] - 2
        if 0 <= t <= Z:
            occ.append({"id": o["id"] + "-teste", "tipo": "teste", "marca": o["marca"], "serie": o["serie"], "nome": o["nome"],
                        "ini": t, "fim": t, "dur": 1, "canais": [c for c in o["canais"] if c in PL][:2] or ["Meta"],
                        "territorio": o["territorio"], "oferta": None, "peso": 1, "n": rnd.randint(7, 11), "teste": True})

    # ---------- criativos
    criativos = []

    def cria(o: dict, n: int, baixo: bool) -> list[str]:
        dig = [c for c in o["canais"] if c in PL] or ["Meta"]
        ids = []
        pool = textos.get(o["territorio"]) or sum(textos.values(), [])
        for j in range(n):
            pl = dig[j % len(dig)]
            ini = o["ini"] + (0 if baixo else rnd.randint(0, min(1, max(0, o["fim"] - o["ini"]))))
            cid = f"{o['id']}-c{j}"
            criativos.append({"id": cid, "marca": o["marca"], "ocorrencia": o["id"], "campanha": o["nome"] if o["tipo"] != "pontual" else None,
                              "plataforma": pl, "formato": rnd.choice(FORMATOS[pl]), "titulo": pool[(j + rnd.randint(0, 4)) % len(pool)],
                              "cta": rnd.choice(CTAS), "territorio": o["territorio"], "oferta": o.get("oferta"),
                              "ini": ini, "fim": min(Z, o["fim"]), "variantes": 1 if baixo else rnd.randint(1, 4),
                              "alcance": rnd.randint(800, 4000) if baixo else int(rnd.randint(30, 90) * 1000 * o["peso"]),
                              "teste": baixo, "origem": "demo"})
            ids.append(cid)
        return ids

    for o in occ:
        o["criativos"] = cria(o, o["n"], o["tipo"] == "teste" or o["teste"] and o["tipo"] == "pontual")
    for m in marcas:                               # sempre ativos em pesquisa
        terr = next((t for t in cfg["territorios"] if t in chave), cfg["territorios"][0])
        o = {"id": f"{m['id']}-sempre", "tipo": "sempre", "marca": m["id"], "nome": "Sempre ativo em pesquisa", "ini": 0, "fim": Z,
             "canais": ["Google"], "territorio": terr, "oferta": None, "peso": 1}
        cria(o, 3, False)

    # ---------- volume de anúncios ativos e investimento estimado (por semana)
    split = {"Google": .45, "Meta": .35, "YouTube": .1, "TikTok": .1}
    vol = {m["id"]: {p: [0] * NW for p in PL} for m in marcas}
    inv = {m["id"]: [0] * NW for m in marcas}
    for m in marcas:
        for w in range(NW):
            for p in PL:
                vol[m["id"]][p][w] = max(0, round(m["base"] * split[p] * (0.85 + rnd.random() * 0.3)))
    for o in occ:
        if o["tipo"] in ("sempre",):
            continue
        dig = [c for c in o["canais"] if c in PL] or ["Meta"]
        fator = 0.35 if o["tipo"] == "teste" else 1.0
        for w in range(max(0, o["ini"]), min(Z, o["fim"]) + 1):
            for j, p in enumerate(dig):
                vol[o["marca"]][p][w] += round(o["n"] * 2.2 * fator / len(dig) * (1.15 if j == 0 else 1))
            for c in o["canais"]:
                if c in OFF and o["tipo"] != "teste":
                    inv[o["marca"]][w] += OFF[c] * o["peso"] / 3
    for m in marcas:
        for w in range(NW):
            inv[m["id"]][w] = round(inv[m["id"]][w] + sum(vol[m["id"]][p][w] * PVAL[p] for p in PL))
    tot = [sum(sum(vol[m["id"]][p][w] for p in PL) for m in marcas) or 1 for w in range(NW)]
    quota = {m["id"]: [round(sum(vol[m["id"]][p][w] for p in PL) / tot[w] * 100, 1) for w in range(NW)] for m in marcas}

    # ---------- preços (combustíveis: €/L; retalho: índice do cabaz)
    pc = cfg["precos"]
    combust = pc["base"] < 10
    mercado, precos = [], {m["id"]: [] for m in marcas}
    v = pc["base"]
    promo_w = {(o["marca"], w) for o in occ if o["tipo"] in ("promo", "pontual") and o["territorio"] in chave for w in range(o["ini"], o["fim"] + 1)}
    camp_w = {(o["marca"], w) for o in occ if o["tipo"] == "campanha" and o["territorio"] in chave for w in range(o["ini"], o["fim"] + 1)}
    for w in range(NW):
        if combust:
            v = max(1.45, min(1.85, v + rnd.gauss(0, 0.012) + (pc["base"] - v) * 0.04))
            mercado.append(round(v, 3))
        else:
            mercado.append(100.0)
        for m in marcas:
            off = m["preco"]
            if combust:
                x = v + off + rnd.gauss(0, 0.004)
                if (m["id"], w) in promo_w:
                    x -= 0.035 if w >= Z - 1 else 0.018
                if (m["id"], w) in camp_w:
                    x -= 0.008
                precos[m["id"]].append(round(x, 3))
            else:
                x = off + rnd.gauss(0, 0.35)
                if (m["id"], w) in camp_w:
                    x -= 2.6
                if (m["id"], w) in promo_w:
                    x -= 0.9
                precos[m["id"]].append(round(x, 1))
    if not combust:                                # índice: 100 = média do conjunto em cada semana
        for w in range(NW):
            med = mean(precos[m["id"]][w] for m in marcas)
            for m in marcas:
                precos[m["id"]][w] = round(precos[m["id"]][w] / med * 100, 1)

    # ---------- leilão: presença nas mesmas pesquisas que o cliente (Auction Insights)
    lc = cfg["leilao"]
    leilao = {}
    camp_any = {(o["marca"], w) for o in occ if o["tipo"] in ("campanha", "pontual", "promo") for w in range(o["ini"], o["fim"] + 1)}
    for mid, b in lc["base"].items():
        s = []
        for w in range(NW):
            x = b + rnd.gauss(0, 1.6) + (5 if (mid, w) in camp_any else 0) + 3 * math.sin(w / 8)
            sub = lc.get("subida") or {}
            if sub.get("marca") == mid and w > Z - sub["semanas"]:
                x += sub["pp"] * (w - (Z - sub["semanas"])) / sub["semanas"]
            s.append(round(max(2, min(95, x)), 1))
        leilao[mid] = s

    # ---------- 2. movimentos
    mov = []

    def add(**m):
        m.setdefault("criativos", [])
        m.setdefault("serie", None)
        m.setdefault("oferta", None)
        m["id"] = f"m{len(mov) + 1}"
        m["origem"] = "demo"
        mov.append(m)

    for o in occ:
        if o["marca"] == cli["id"]:
            continue
        d0 = wdate(o["ini"]) + timedelta(days=1 + (hash(o["id"]) % 3))
        if o["tipo"] == "campanha":
            add(tipo="Campanha", marca=o["marca"], data=d0, semana=o["ini"], titulo=f"{nome[o['marca']]} lançou a campanha «{o['nome']}»",
                resumo=f"No ar em {lista(o['canais'])}, com {o['n']} criativos. Mensagem: {o['territorio'].lower()}." + (f" Oferta: {o['oferta']}." if o.get("oferta") else ""),
                canais=o["canais"], territorio=o["territorio"], oferta=o.get("oferta"), peso=o["peso"], criativos=o["criativos"],
                serie=o["serie"], ocorrencia=o["id"])
        elif o["tipo"] == "teste":
            add(tipo="Teste de criativos", marca=o["marca"], data=d0, semana=o["ini"], titulo=f"{nome[o['marca']]} testou {o['n']} criativos novos com pouco alcance",
                resumo=f"Variações de mensagem ({o['territorio'].lower()}) em {lista(o['canais'])}, cada uma com alcance baixo.",
                canais=o["canais"], territorio=o["territorio"], peso=1, criativos=o["criativos"], serie=o["serie"], ocorrencia=o["id"])
        elif o["tipo"] == "promo":
            add(tipo="Promoção", marca=o["marca"], data=wdate(o["ini"]) + timedelta(days=4), semana=o["ini"], titulo=f"{nome[o['marca']]}: {o['oferta'][0].lower() + o['oferta'][1:]}",
                resumo=f"«{o['nome']}», comunicada em {lista(o['canais'])}.", canais=o["canais"], territorio=o["territorio"], oferta=o["oferta"],
                peso=o["peso"], criativos=o["criativos"], serie=o["serie"], ocorrencia=o["id"])
    pid = {o["id"]: o for o in occ}
    for i, p in enumerate(cfg.get("pontuais", [])):
        o = pid.get(f"pt-{i}")
        add(tipo=p["tipo"], marca=p["marca"], data=p["data"], semana=widx(p["data"]), titulo=p["titulo"], resumo=p["resumo"], canais=p["canais"],
            territorio=p["territorio"], oferta=p.get("oferta"), peso=p["peso"], criativos=o["criativos"] if o else [], serie=p.get("serie"),
            ocorrencia=o["id"] if o else None)

    # preço: afastamento da média do mercado (ou do índice) que muda depressa; uma promoção na mesma semana explica-o
    tem_promo = {(m["marca"], m["semana"]) for m in mov if m["tipo"] in ("Promoção", "Campanha")}
    ult = {}
    for m in marcas:
        if m["cliente"]:
            continue
        for w in range(6, NW):
            gap = precos[m["id"]][w] - mercado[w] if combust else precos[m["id"]][w] - 100
            gap0 = precos[m["id"]][w - 4] - mercado[w - 4] if combust else precos[m["id"]][w - 4] - 100
            lim = 0.02 if combust else 1.5
            if abs(gap - gap0) >= lim and w - ult.get(m["id"], -99) >= 8:
                ult[m["id"]] = w
                if any((m["id"], x) in tem_promo for x in (w, w - 1)):
                    continue
                if combust:
                    t = f"{m['nome']} está {nf(abs(gap) * 100, 1)} cênt/L {'abaixo' if gap < 0 else 'acima'} da média do mercado"
                    r = f"Há 4 semanas estava {nf(abs(gap0) * 100, 1)} cênt/L {'abaixo' if gap0 < 0 else 'acima'}. Preço médio do gasóleo simples."
                else:
                    t = f"{m['nome']} {'baixou' if gap < gap0 else 'subiu'} o preço do cabaz para {nf(precos[m['id']][w], 1)} (média = 100)"
                    r = f"Há 4 semanas estava em {nf(precos[m['id']][w - 4], 1)}. Índice de preço de um cabaz de 120 produtos comparáveis."
                add(tipo="Preço", marca=m["id"], data=wdate(w) + timedelta(days=0), semana=w, titulo=t, resumo=r, canais=["Site", "Postos" if combust else "Lojas"],
                    territorio=next(iter(chave)), peso=2 if abs(gap - gap0) >= lim * 1.6 else 1, evidencia="preco")
    # leilão: subidas fortes na sobreposição com o cliente
    ult = {}
    sub = lc.get("subida") or {}
    for mid, s in leilao.items():
        for w in range(6, NW):
            if mid == sub.get("marca") and Z - sub["semanas"] < w < Z:
                continue                           # a subida configurada lê-se no fim (semana atual)
            d = s[w] - s[w - 4]
            if d >= 8 and (w - ult.get(mid, -99) >= 10 or (w == Z and mid == sub.get("marca"))):
                ult[mid] = w
                add(tipo="Leilão", marca=mid, data=wdate(w) + timedelta(days=0), semana=w,
                    titulo=f"{nome[mid]} passou a aparecer em {nf(s[w])}% das pesquisas onde a {cli['nome']} aparece",
                    resumo=f"Subiu {nf(d)} p.p. em 4 semanas nas campanhas de pesquisa da {cli['nome']} (Auction Insights).",
                    canais=["Google"], territorio=next(iter(chave)), peso=2, evidencia="leilao")

    mov.sort(key=lambda m: (m["data"], m["id"]))

    # ---------- histórico e «o que costuma seguir-se»
    by_m = {}
    for m in mov:
        by_m.setdefault(m["marca"], []).append(m)
    camps = [o for o in occ if o["tipo"] == "campanha"]

    def depois(marca, w0, w1, excl):
        return next((x for x in by_m.get(marca, []) if w0 < x["semana"] <= w1 and x["tipo"] not in excl), None)

    for m in mov:
        m["historico"], m["seguinte"] = [], None
        if m["tipo"] == "Campanha" and m["serie"]:
            prev = [o for o in camps if o["marca"] == m["marca"] and o["serie"] == m["serie"] and o["ini"] < m["semana"]]
            m["historico"] = [{"ano": o["ano"], "semana": o["sem_iso"], "duracao": o["dur"], "inicio": wdate(o["ini"]).isoformat()} for o in prev]
            if prev:
                p = prev[-1]
                nx = depois(m["marca"], p["ini"], p["ini"] + 6, ("Campanha", "Teste de criativos", "Leilão"))
                txt = f"Da última vez ({MES3[wdate(p['ini']).month - 1]} {p['ano']}) durou {p['dur']} semanas"
                if nx:
                    txt += f" e, {nx['semana'] - p['ini']} semana{'s' if nx['semana'] - p['ini'] != 1 else ''} depois do arranque, a {nome[m['marca']]} juntou: «{nx['titulo']}»."
                else:
                    txt += f": se se repetir, fica no ar até à semana de {fdata(wdate(m['semana'] + p['dur'] - 1))}."
                m["seguinte"] = txt
            else:
                m["seguinte"] = "Primeira vez que vemos esta campanha: sem histórico para comparar."
        elif m["tipo"] == "Teste de criativos" and m["serie"]:
            prev = [o for o in camps if o["marca"] == m["marca"] and o["serie"] == m["serie"] and o["ini"] < m["semana"] and o["teste"]]
            if prev:
                anos = [str(o["ano"]) for o in prev]
                prox = m["semana"] + 2
                m["historico"] = [{"ano": o["ano"], "semana": o["sem_iso"], "duracao": o["dur"], "inicio": wdate(o["ini"]).isoformat()} for o in prev]
                m["seguinte"] = (f"Em {lista(anos)}, um teste assim antecedeu «{prev[-1]['nome']}» em 2 semanas. Se se repetir, a campanha arranca "
                                 f"na semana de {fdata(wdate(prox))}.")
                m["antecede"] = {"serie": m["serie"], "nome": prev[-1]["nome"], "semana": prox}
        elif m["tipo"] in ("Promoção", "Preço"):
            ant = [x for x in by_m[m["marca"]] if x["tipo"] == m["tipo"] and m["semana"] - 52 <= x["semana"] < m["semana"]]
            if len(ant) >= 2:
                gaps = [b["semana"] - a["semana"] for a, b in zip(ant, ant[1:] + [m])]
                m["seguinte"] = f"A {nome[m['marca']]} fez {len(ant)} movimentos destes nos últimos 12 meses, em média de {nf(mean(gaps), 0)} em {nf(mean(gaps), 0)} semanas."
            elif ant:
                m["seguinte"] = f"Último movimento parecido: {fdata(ant[-1]['data'])}."
        elif m["tipo"] == "Leilão":
            c = next((o for o in occ if o["marca"] == m["marca"] and o["tipo"] in ("campanha", "pontual", "promo") and abs(o["ini"] - m["semana"]) <= 2), None)
            m["seguinte"] = (f"Coincide com «{c['nome']}»: a pressão nas pesquisas costuma acompanhar as campanhas da {nome[m['marca']]}."
                             if c else "Sem campanha visível da marca nesta altura: pode ser reforço só em pesquisa.")
        elif m["tipo"] == "Lançamento":
            m["seguinte"] = "Lançamentos costumam ter 3 a 6 semanas de comunicação de apoio. Vale acompanhar os criativos da marca."

    # ---------- 4. respostas combinadas
    resp = cfg.get("respostas", [])

    def casa(r, tipo, terr, marca, peso, serie):
        q = r["quando"]
        if q.get("tipos") and tipo not in q["tipos"]:
            return False
        if q.get("territorios") and terr not in q["territorios"]:
            return False
        if q.get("marcas") and marca not in q["marcas"]:
            return False
        if q.get("peso_min") and (peso or 0) < q["peso_min"]:
            return False
        if q.get("series") and serie not in q["series"]:
            return False
        return True

    for m in mov:
        m["respostas"] = [r["id"] for r in resp if casa(r, m["tipo"], m["territorio"], m["marca"], m["peso"], m["serie"])]

    # ---------- importância (explicada)
    for m in mov:
        partes = [("peso do movimento", m["peso"] * 20), ("tipo: " + m["tipo"].lower(), BONUS_TIPO[m["tipo"]])]
        if m["territorio"] in chave:
            partes.append(("território onde a " + cli["nome"] + " compete", 12))
        if m["respostas"]:
            partes.append(("há resposta combinada", 8))
        if m["semana"] >= Z:
            partes.append(("desta semana", 10))
        if m.get("antecede"):
            partes.append(("costuma anteceder uma campanha", 10))
        sc = sum(v for _, v in partes)
        m["importancia"] = sc
        m["nivel"] = "importante" if sc >= 75 else "acompanhar" if sc >= 50 else "info"
        m["porque"] = [{"razao": a, "pontos": v} for a, v in partes]
        m["data"] = m["data"].isoformat()

    # evidência de preço junto de promoções da semana atual (combustíveis)
    for m in mov:
        if m["tipo"] == "Promoção" and m["semana"] >= Z - 1:
            m["evidencia"] = "preco"

    # ---------- 3. previsões («À frente»)
    prev_out = []
    series = {}
    for o in camps:
        if o["marca"] == cli["id"]:
            continue
        series.setdefault((o["marca"], o["serie"]), []).append(o)
    ano_atual = wdate(Z).year
    for (mk, se), oc in series.items():
        oc.sort(key=lambda o: o["ini"])
        if len(oc) < 2:
            continue
        semanas = [o["sem_iso"] for o in oc]
        if any(o["ano"] == ano_atual for o in oc):
            ano = ano_atual + 1
        else:
            ano = ano_atual
        m0 = round(mean(semanas))
        idx = iso_idx(ano, min(52, m0))
        if not (Z < idx <= Z + FUT):
            continue
        spread = max(semanas) - min(semanas)
        h = max(1, math.ceil(spread / 2))
        conf = "alta" if spread <= 1 else "média" if spread <= 3 else "baixa"
        teste_atual = next((m for m in mov if m["tipo"] == "Teste de criativos" and m["marca"] == mk and m["serie"] == se and m["semana"] >= Z - 1), None)
        if teste_atual:
            conf = "alta"
        u = oc[-1]
        dm = round(mean(o["dur"] for o in oc))
        porque = "Arrancou " + lista([f"na semana {o['sem_iso']} de {o['ano']}" for o in oc]) + f", com {dm} semana{'s' if dm != 1 else ''} no ar em média."
        p = {"id": f"p-{mk}-{se}", "tipo": "Campanha", "marca": mk, "serie": se, "nome": u["nome"], "ini": idx - h, "fim": idx + h,
             "provavel": idx, "duracao": round(mean(o["dur"] for o in oc)), "confianca": conf, "canais": u["canais"], "territorio": u["territorio"],
             "oferta": u.get("oferta"), "peso": u["peso"],
             "base": [{"ano": o["ano"], "semana": o["sem_iso"], "duracao": o["dur"], "inicio": wdate(o["ini"]).isoformat()} for o in oc],
             "porque": porque,
             "sinal": ({"movimento": teste_atual["id"], "texto": f"O teste de criativos já começou ({fdata(date.fromisoformat(teste_atual['data']))})."} if teste_atual else
                       ({"texto": "Costuma testar criativos 2 semanas antes: um teste destes será o sinal de arranque."} if u["teste"] else None)),
             "origem": "estimado", "metodo": "Padrão histórico da própria marca: semana de arranque média das ocorrências anteriores, janela pela variação entre anos."}
        p["respostas"] = [r["id"] for r in resp if casa(r, "Campanha", p["territorio"], mk, p["peso"], se)]
        prev_out.append(p)
    for pr in cfg.get("promocoes", []):
        if pr["marca"] == cli["id"]:
            continue
        ws = [o["ini"] for o in occ if o["tipo"] == "promo" and o["marca"] == pr["marca"]]
        ws += [m["semana"] for m in mov if m["tipo"] == "Promoção" and m["marca"] == pr["marca"] and m["semana"] >= Z - 1]
        if not ws:
            continue
        nxt = max(ws) + pr["a_cada"]
        if Z < nxt <= Z + FUT:
            p = {"id": f"p-{pr['marca']}-promo", "tipo": "Promoção", "marca": pr["marca"], "serie": "promo-" + pr["marca"], "nome": pr["nome"],
                 "ini": nxt - 1, "fim": nxt + 1, "provavel": nxt, "duracao": 1, "confianca": "média", "canais": pr["canais"],
                 "territorio": pr["territorio"], "oferta": pr["oferta"], "peso": pr["peso"], "base": [],
                 "porque": f"Fez {len(ws)} promoções destas em 2 anos, de {pr['a_cada']} em {pr['a_cada']} semanas.", "sinal": None,
                 "origem": "estimado", "metodo": "Ritmo médio entre promoções da mesma marca."}
            p["respostas"] = [r["id"] for r in resp if casa(r, "Promoção", p["territorio"], pr["marca"], p["peso"], p["serie"])]
            prev_out.append(p)
    prev_out.sort(key=lambda p: p["provavel"])

    # ---------- campanhas do cliente (para comparação e calendário)
    cli_camp = [{"nome": o["nome"], "ini": o["ini"], "fim": o["fim"], "territorio": o["territorio"], "canais": o["canais"]} for o in camps if o["marca"] == cli["id"]]

    # ---------- ritmo por marca
    ritmo = {}
    for m in marcas:
        oc = [o for o in camps if o["marca"] == m["id"] and o["ini"] > Z - 52]
        meses = [0] * 12
        for o in [o for o in camps if o["marca"] == m["id"]]:
            for w in range(o["ini"], o["fim"] + 1):
                meses[wdate(w).month - 1] += 1
        top = sorted(range(12), key=lambda i: -meses[i])[:3]
        em = [o for o in camps if o["marca"] == m["id"] and o["ini"] <= Z <= o["fim"]]
        ritmo[m["id"]] = {"campanhas_12m": len(oc), "duracao_media": round(mean([o["dur"] for o in oc]), 1) if oc else None,
                          "meses_fortes": [MESES[i] for i in sorted(top) if meses[i] > 0],
                          "testa_antes": any(o["teste"] for o in camps if o["marca"] == m["id"]),
                          "promocoes_12m": sum(1 for x in mov if x["marca"] == m["id"] and x["tipo"] == "Promoção" and x["semana"] > Z - 52),
                          "em_curso": [{"nome": o["nome"], "semana": Z - o["ini"] + 1, "de": o["dur"], "ini": o["ini"]} for o in em]}

    # ---------- calendário do setor (próximas semanas)
    ano = wdate(Z).year
    cal = []
    for e in cfg.get("calendario", []):
        i = iso_idx(ano, e["semana"])
        cal.append({"nome": e["nome"], "ini": i, "fim": i + e.get("duracao", 1) - 1})

    # ---------- resumo da semana (frases a partir dos movimentos; na versão ligada, texto gerado por IA e revisto)
    agora = [m for m in mov if m["semana"] >= Z]
    agora.sort(key=lambda m: -m["importancia"])
    resumo = []
    rid = {r["id"]: r for r in resp}
    for m in agora[:2]:
        rr = [rid[x] for x in m["respostas"]]
        pronto = next((r for r in rr if r["estado"] == "pronta"), None)
        resumo.append(m["titulo"] + "." + (f" Há uma resposta combinada pronta: «{pronto['nome']}»." if pronto else
                                           (f" A resposta «{rr[0]['nome']}» ainda está por preparar." if rr else " Não há resposta combinada para isto.")))
    tst = next((m for m in agora if m.get("antecede")), None)
    if tst:
        resumo.append(f"Sinal precoce. {tst['titulo']}. {tst['seguinte']}")
    elif prev_out:
        p = prev_out[0]
        resumo.append(f"A seguir: «{p['nome']}» da {nome[p['marca']]} deve arrancar na semana de {fdata(wdate(p['provavel']))}.")

    blocos = {
        "movimentos": bloco("Movimentos da concorrência", "demo", "Simulados a partir do comportamento descrito em config/v4/clientes/%s.yaml; marcas fictícias" % cl["id"], "meta-ad-library, google-ads-transparency, tiktok-ccl, noticias-rss"),
        "criativos": bloco("Criativos", "demo", "Criativos ilustrativos gerados para cada campanha simulada", "meta-ad-library, google-ads-transparency, tiktok-ccl"),
        "volume": bloco("Anúncios ativos e quota de voz", "demo", "Contagem semanal de anúncios ativos por plataforma, simulada", "meta-ad-library, google-ads-transparency, tiktok-ccl"),
        "investimento": bloco("Investimento estimado", "estimado", "Anúncios ativos × valor assumido por anúncio e plataforma (config/v4/agencia.yaml) + semanas de TV, rádio e exterior a valor assumido. Ordem de grandeza, não valores faturados", "marktest-adcheck"),
        "precos": bloco(pc["rotulo"], "demo", "Série simulada", pc.get("fonte_futura", "")),
        "leilao": bloco("Presença nas pesquisas do cliente", "demo", "Sobreposição de impressões simulada (formato Auction Insights)", "auction-insights"),
        "previsoes": bloco("Previsões", "estimado", "Calculadas a partir do histórico de cada marca (séries que se repetem, ritmo de promoções, testes que antecedem campanhas)", ""),
        "respostas": bloco("Respostas combinadas", "demo", "Exemplos de respostas acordadas com o cliente (config)", ""),
    }

    return {
        "versao": 4, "gerado_em": AG["calendario"]["hoje"].isoformat(), "origem": "demo",
        "cliente": {"id": cl["id"], "nome": cl["nome"], "setor": cl["setor"], "vertical": cl["vertical"], "ficticio": True},
        "calendario": {"inicio": INI.isoformat(), "semanas": NW, "atual": Z, "futuro": FUT, "hoje": AG["calendario"]["hoje"].isoformat()},
        "plataformas": PL,
        "territorios": cfg["territorios"], "territorios_chave": list(chave),
        "marcas": [{k: m[k] for k in ("id", "nome", "cliente", "cor", "papel", "posicionamento")} for m in marcas],
        "campanhas": [{"id": o["id"], "marca": o["marca"], "serie": o.get("serie"), "nome": o["nome"], "ini": o["ini"], "fim": o["fim"], "dur": o["dur"],
                       "canais": o["canais"], "territorio": o["territorio"], "oferta": o.get("oferta"), "peso": o["peso"], "tipo": o["tipo"]}
                      for o in occ if o["tipo"] in ("campanha", "promo", "pontual", "teste")],
        "criativos": criativos,
        "movimentos": mov,
        "volume": vol, "quota": quota, "investimento": inv,
        "precos": {"rotulo": pc["rotulo"], "unidade": "€/L" if combust else "índice", "mercado": mercado if combust else None, "marcas": precos},
        "leilao": leilao,
        "previsoes": prev_out,
        "ritmo": ritmo,
        "calendario_setor": cal,
        "respostas": resp,
        "resumo": resumo,
        "blocos": blocos,
    }


def nf(x: float, d: int = 0) -> str:
    s = f"{x:,.{d}f}".replace(",", " ").replace(".", ",")
    return s


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    clientes = []
    for p in sorted((CFG / "clientes").glob("*.yaml")):
        cfg = load(p)
        d = build(cfg)
        assert all(m.get("origem") for m in d["movimentos"]), "movimento sem origem"
        assert all(b.get("origem") in ("demo", "estimado", "real") for b in d["blocos"].values()), "bloco sem origem"
        (OUT / f"{d['cliente']['id']}.json").write_text(json.dumps(d, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
        Z_ = d["calendario"]["atual"]
        agora = [m for m in d["movimentos"] if m["semana"] >= Z_]
        clientes.append({**d["cliente"], "movimentos_semana": len(agora), "importantes": sum(1 for m in agora if m["nivel"] == "importante"),
                         "marcas": len(d["marcas"]) - 1, "previsoes": len(d["previsoes"]),
                         "respostas_prontas": sum(1 for r in d["respostas"] if r["estado"] == "pronta"), "respostas_total": len(d["respostas"])})
        print(f"  {d['cliente']['id']}: {len(d['movimentos'])} movimentos ({len(agora)} esta semana), {len(d['criativos'])} criativos, {len(d['previsoes'])} previsões")
    clientes.sort(key=lambda c: (c["id"] != AG["cliente_inicial"], c["nome"]))
    ag = {"versao": 4, "agencia": AG["agencia"], "cliente_inicial": AG["cliente_inicial"], "clientes": clientes, "fontes": AG["fontes"],
          "calendario": {"inicio": INI.isoformat(), "semanas": NW, "atual": Z, "futuro": FUT, "hoje": AG["calendario"]["hoje"].isoformat()}}
    (OUT / "agencia.json").write_text(json.dumps(ag, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")


if __name__ == "__main__":
    main()
