"""Dados de DEMONSTRAÇÃO, determinísticos (semente fixa). Origem dos registos: «demo».

Servem para mostrar o potencial do Radar enquanto as fontes reais não estão ligadas.
Quando uma fonte é ligada, o build_dataset.py usa os dados reais e este módulo deixa de ser chamado
para esse bloco (ver docs/09-pontos-de-ligacao.md).

Regra de ouro: dados demo só existem para entidades FICTÍCIAS ou ao nível de um tema.
Nunca se atribui um número simulado a uma entidade real de terceiros.
"""
from __future__ import annotations

import random
from datetime import date, timedelta


def _r(seed: int) -> random.Random:
    return random.Random(seed)


def _arred(x: float) -> int:
    return int(x + 0.5)


def interp(pontos: list[list[float]]):
    def f(i: float) -> float:
        for k in range(len(pontos) - 1):
            a, va = pontos[k]
            b, vb = pontos[k + 1]
            if a <= i <= b:
                return va + (vb - va) * (i - a) / (b - a)
        return pontos[-1][1]
    return f


def serie_por_pontos(pontos: list[list[float]], seed: int, ruido: float, n: int) -> list[int]:
    """Curva desenhada por pontos [semana, valor], com ruído controlado."""
    f, r = interp(pontos), _r(seed)
    return [max(0, _arred(f(i) + (r.random() - 0.5) * 2 * ruido)) for i in range(n)]


def _formato(plataforma: str, entidade: str, r: random.Random, formatos: list[str],
             base: dict, prefs: list[dict]) -> str:
    w = list(base.get(plataforma, [1] + [0] * (len(formatos) - 1)))
    for p in prefs:
        if p["entidade"] == entidade and p.get("plataforma", plataforma) == plataforma and p["formato"] in formatos:
            w[formatos.index(p["formato"])] *= p["x"]
    tot = sum(w) or 1
    x = r.random() * tot
    for i, v in enumerate(w):
        x -= v
        if x <= 0:
            return formatos[i]
    return formatos[0]


def anuncios_demo(demo: dict, entidades: list[dict], vertical: dict, ag: dict, inicio: date,
                  semana_atual: int) -> list[dict]:
    """Gera anúncios simulados a partir das campanhas descritas no YAML do cliente.

    LIGAÇÃO[meta-ad-library] LIGAÇÃO[google-ads-transparency] LIGAÇÃO[tiktok-ad-library]:
    com dados reais, esta função não é chamada; os anúncios vêm de data/raw/<fonte>/<cliente>/.
    """
    r = _r(int(demo["seed"]))
    ids = {e["id"] for e in entidades}
    desde = demo["anuncios_desde"]
    wk0 = (desde - inicio).days // 7
    formatos, base = ag["formatos"], ag["formato_por_plataforma"]
    territorios, textos, ctas = vertical["territorios"], vertical["textos"], vertical["ctas"]
    prefs = vertical.get("preferencias_formato", [])
    nome = {e["id"]: e["nome"] for e in entidades}
    out: list[dict] = []
    for f in demo["campanhas"]:
        if f["b"] not in ids:
            continue
        comp = f["e"] - f["s"] + 1
        n = max(2, _arred(f["int"] * comp / 3.5))
        for _ in range(n):
            pl = f["pl"][int((r.random() ** 1.5) * len(f["pl"]))]
            st = f["s"] + int(r.random() * comp)
            dur = 2 + int(r.random() * 4)
            en = min(f["e"], st + dur - 1)
            th = f["th"] if r.random() < 0.72 else int(r.random() * len(territorios))
            fm = _formato(pl, f["b"], r, formatos, base, prefs)
            texto = textos[th][int(r.random() * 4)]
            cta = ctas[int(r.random() * 4)]
            alcance = _arred(8 + r.random() * 140) * 1000
            dd = int(r.random() * 5)
            ini = inicio + timedelta(days=(wk0 + st) * 7 + dd)
            fim = None if wk0 + en >= semana_atual else inicio + timedelta(days=(wk0 + en) * 7 + 6)
            out.append({
                "id": f"demo-{len(out)}", "marca": f["b"], "plataforma": pl, "formato": fm,
                "territorio": territorios[th], "campanha": f["n"], "data_inicio": ini.isoformat(),
                "data_fim": fim.isoformat() if fim else None, "texto": texto, "cta": cta,
                "alcance": alcance, "origem": "demo",
            })
    return out


def procura_demo_entidades(entidades: list[dict], activos: dict[str, list[int]], n: int, seed: int) -> list[dict]:
    """Interesse de pesquisa simulado por marca, ligado à atividade de anúncios (0 a 100)."""
    r = _r(seed + 901)
    out = []
    mx_global = max((max(v) for v in activos.values()), default=1) or 1
    for e in entidades:
        if not e.get("incluida"):
            continue
        act = activos.get(e["id"], [0] * n)
        mx = max(act) or 1
        base = 22 + 26 * (max(act) / mx_global)
        vals = [max(0, min(100, _arred(base + 22 * act[w] / mx + (r.random() - 0.5) * 7))) for w in range(n)]
        out.append({"id": e["id"], "nome": e["nome"], "cor": e["cor"], "valores": vals})
    return out


def noticias_demo(temas: list[str], n: int, seed: int) -> list[dict]:
    r = _r(seed + 303)
    out = []
    for i, nome in enumerate(temas):
        base = 5 + 3 * ((i * 7) % 4)
        pico = int(r.random() * (n - 8)) + 4
        vals = []
        for w in range(n):
            bump = 9 * max(0.0, 1 - abs(w - pico) / 3.5)
            vals.append(max(0, _arred(base + bump + (r.random() - 0.5) * 4)))
        out.append({"id": f"t{i}", "nome": nome, "cor": (i + 1) % 5, "valores": vals})
    return out


def leilao_demo(entidades: list[dict], quota_google: dict[str, float], seed: int) -> list[dict]:
    """Quota de impressões e sobreposição simuladas (formato do relatório «Informações do leilão»).

    LIGAÇÃO[google-ads-auction]: dados reais só com autorização do cliente e parecer de Compliance.
    """
    out = []
    for e in entidades:
        r = _r(seed + 17 * len(e["id"]) + ord(e["nome"][0]))
        sh = quota_google.get(e["id"], 0.0)
        out.append({
            "entidade": e["id"],
            "quota_impressoes": round(min(72, max(8, 18 + sh * 0.85)), 1),
            "sobreposicao": None if e.get("cliente") else round(min(80, max(20, 34 + r.random() * 42)), 1),
            "posicao_acima": None if e.get("cliente") else round(min(64, max(8, 12 + r.random() * 46)), 1),
            "topo_pagina": round(min(70, max(10, 16 + sh * 0.7 + r.random() * 10)), 1),
        })
    return out
