"""Gera os datasets que alimentam o protótipo (RB-09, RB-73).

    python3 scripts/build_dataset.py            # todos os clientes de config/clients/
    python3 scripts/build_dataset.py --client spv

Saída:
    data/processed/<cliente>.json   dataset completo de um cliente (tudo o que a interface mostra)
    data/processed/agencia.json     visão da agência (verticais, clientes, fontes, temas, piloto)

Princípios
- A interface não tem clientes, marcas nem séries escritos no código: lê estes ficheiros.
- Cada bloco de dados tem proveniência (origem real/estimado/demo/pendente, fonte, data, método) no registo `blocos`.
- Para cada bloco, se existirem dados reais em data/raw/ usam-se esses; caso contrário usa-se demonstração (`demo`)
  e a interface mostra «Demonstração» no selo da página. Ligar uma fonte não exige mudar a interface.
- Dados internos de clientes (data/raw/internal/) nunca são lidos aqui.

Pontos de ligação: ver docs/09-pontos-de-ligacao.md e `grep -rn "LIGAÇÃO\\[" scripts prototype/src`.
"""
from __future__ import annotations

import argparse
import csv
import json
from collections import defaultdict
from datetime import date, datetime
from email.utils import parsedate_to_datetime
from pathlib import Path
from statistics import mean

import demo_data
import signals
from common import ROOT, list_clients, load_yaml

PROC = ROOT / "data" / "processed"
META_PLATAFORMAS = {"facebook", "instagram", "messenger", "audience_network", "threads"}


# ---------------------------------------------------------------- utilitários
def _iso(o):
    if isinstance(o, (date, datetime)):
        return o.isoformat()
    raise TypeError(type(o))


def _dump(obj, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(obj, ensure_ascii=False, separators=(",", ":"), default=_iso), encoding="utf-8")
    print(f"  {path.relative_to(ROOT)}  ({path.stat().st_size / 1024:.0f} KB)")


def _merge(base: dict, extra: dict | None) -> dict:
    out = dict(base)
    out.update(extra or {})
    return out


def _bloco(origem: str, rotulo: str, fonte: str | None = None, metodo: str | None = None, url: str | None = None,
           data_recolha=None) -> dict:
    return {"origem": origem, "rotulo": rotulo, "fonte": fonte, "metodo": metodo, "url": url,
            "data_recolha": data_recolha}


def _csv_rows(fonte: str, cid: str) -> list[dict]:
    rows: list[dict] = []
    for p in sorted((ROOT / "data" / "raw" / fonte / cid).glob("*.csv")):
        with p.open(encoding="utf-8", newline="") as f:
            rows.extend(csv.DictReader(f))
    return rows


# ---------------------------------------------------------------- dados reais (se existirem em data/raw)
def real_meta_ads(cid: str, entidades: set[str], inicio: date, formatos: list[str]) -> tuple[list[dict], dict] | None:
    """LIGAÇÃO[meta-ad-library]: lê o que scripts/collect_meta_ads.py gravou em data/raw/meta_ads/<cliente>/."""
    rows = _csv_rows("meta_ads", cid)
    if not rows:
        return None
    vistos: dict[tuple, dict] = {}
    for r in rows:
        if r.get("origem") != "real" or r.get("entidade") not in entidades or not r.get("inicio"):
            continue
        plats = sorted({"Meta" for p in (r.get("plataformas") or "").split(",") if p.strip() in META_PLATAFORMAS}) or ["Meta"]
        for p in plats:
            vistos[(r["ad_id"], p)] = {
                "id": f"meta-{r['ad_id']}", "marca": r["entidade"], "plataforma": p, "formato": "Não indicado",
                "territorio": None, "campanha": None, "data_inicio": r["inicio"][:10],
                "data_fim": (r.get("fim") or "")[:10] or None, "texto": r.get("texto", ""), "cta": None,
                "alcance": int(r["alcance_ue"]) if (r.get("alcance_ue") or "").isdigit() else None,
                "url": r.get("url"), "origem": "real", "fonte": r.get("fonte"), "data_recolha": r.get("data_recolha")}
    if not vistos:
        return None
    if "Não indicado" not in formatos:
        formatos.append("Não indicado")
    ads = list(vistos.values())
    rec = max(a["data_recolha"] for a in ads if a.get("data_recolha"))
    return ads, _bloco("real", "Anúncios e criativos", "Meta Ad Library API", "Anúncios entregues em Portugal; formato e território não indicados pela API",
                       None, rec)


def real_trends(cid: str, cfg: dict, n: int, z: int, inicio: date) -> tuple[list[dict], dict] | None:
    """LIGAÇÃO[google-trends]: lê data/raw/trends/<cliente>/ e agrega por cluster (média dos termos)."""
    rows = [r for r in _csv_rows("trends", cid) if r.get("origem") == "real"]
    if not rows:
        return None
    pres = cfg.get("trends", {}).get("apresentacao", {})
    por: dict[str, dict[int, list[int]]] = defaultdict(lambda: defaultdict(list))
    for r in rows:
        w = (date.fromisoformat(r["semana"]) - inicio).days // 7
        if 0 <= w < n:
            por[r["cluster"]][w].append(int(r["indice"]))
    series = []
    for i, (cl, meta) in enumerate(pres.items()):
        if cl not in por:
            continue
        faltam = [w for w in range(z + 1) if w not in por[cl]]
        if faltam:
            print(f"  [trends] «{cl}» não cobre todas as semanas (faltam {len(faltam)}); mantém demonstração.")
            return None
        series.append({"id": cl, "nome": meta["nome"], "cor": meta.get("cor", i),
                       "valores": [round(mean(por[cl][w])) if w in por[cl] else None for w in range(n)]})
    if not series:
        return None
    rec = max(r["data_recolha"] for r in rows)
    return series, _bloco("real", "Procura (Google Trends)", rows[0].get("fonte", "Google Trends"),
                          "Índice relativo 0-100; média dos termos de cada cluster. Semanas de domingo a sábado.", None, rec)


def real_noticias(cid: str, cfg: dict, n: int, inicio: date) -> tuple[list[dict], dict] | None:
    """LIGAÇÃO[news-rss]: acumula todas as recolhas de data/raw/noticias/<cliente>/ (sem repetir ligações).

    O RSS só devolve os dias mais recentes: antes da primeira recolha as semanas ficam vazias (null), nunca a zero.
    """
    rows = [r for r in _csv_rows("noticias", cid) if r.get("origem") == "real"]
    if not rows:
        return None
    q2t = {q: t for t in cfg["noticias"]["temas"] for q in t["queries"]}
    vistos, cont = set(), defaultdict(lambda: defaultdict(int))
    primeira = None
    for r in rows:
        if r["url"] in vistos or r["query"] not in q2t:
            continue
        vistos.add(r["url"])
        try:
            d = parsedate_to_datetime(r["publicado"]).date()
        except (TypeError, ValueError):
            continue
        w = (d - inicio).days // 7
        if 0 <= w < n:
            cont[q2t[r["query"]]["id"]][w] += 1
            primeira = d if primeira is None or d < primeira else primeira
    if primeira is None:
        return None
    w0 = (primeira - inicio).days // 7
    series = [{"id": t["id"], "nome": t["nome"], "cor": (i + 1) % 5,
               "valores": [None if w < w0 else cont[t["id"]].get(w, 0) for w in range(n)]}
              for i, t in enumerate(cfg["noticias"]["temas"])]
    rec = max(r["data_recolha"] for r in rows)
    return series, _bloco("real", "Conversa nas notícias", "Google News RSS",
                          f"Contagem semanal de artigos por tema; recolha acumulada desde {primeira.isoformat()}", None, rec)


# ---------------------------------------------------------------- construção de um cliente
def build_client(cid: str, ag: dict, fontes: dict) -> dict:
    cfg = load_yaml(ROOT / "config" / "clients" / f"{cid}.yaml")
    cl = cfg["cliente"]
    vert = load_yaml(ROOT / "config" / "verticals" / f"{cl['vertical']}.yaml")
    cal = ag["calendario"]
    inicio, n, z = cal["inicio"], cal["semanas"], cal["semana_atual"]
    ref = cal["data_referencia"]
    tipo = cl["tipo_universo"]
    lim = _merge(ag["limiares"], cfg.get("limiares"))
    plats = ag["plataformas"]
    formatos = list(ag["formatos"])
    territorios = vert.get("territorios", [])
    blocos: dict[str, dict] = {}

    # --- entidades (o cliente herda o conjunto da vertical e ajusta)
    ents: list[dict] = []
    for u in cfg["universo"]:
        ents.append({"id": u["id"], "nome": u["nome"], "papel": u.get("papel", ""), "prioridade": u.get("prioridade", ""),
                     "cliente": u.get("papel", "").lower() == "cliente" or u.get("prioridade") == "cliente",
                     "ficticia": bool(u.get("ficticia", cl.get("ficticio", False))), "incluida": True,
                     "sugerida": False, "fator": u.get("fator", 1.0)})
    if tipo == "concorrencia":
        con = cfg.get("concorrentes", {})
        ja = {e["id"] for e in ents}
        for c in vert.get("concorrentes_por_defeito", []) + con.get("acrescentar", []):
            if c["id"] in con.get("excluir", []) or c["id"] in ja:
                continue
            ents.append({"id": c["id"], "nome": c["nome"], "papel": "Concorrente", "prioridade": "",
                         "cliente": False, "ficticia": bool(c.get("ficticia", False)), "incluida": True,
                         "sugerida": False, "fator": c.get("fator", 1.0)})
        for s in vert.get("sugeridos", []):
            acc = s["id"] in con.get("aceitar_sugeridos", [])
            ents.append({"id": s["id"], "nome": s["nome"], "papel": "Concorrente", "prioridade": "", "cliente": False,
                         "ficticia": bool(s.get("ficticia", False)), "incluida": acc, "sugerida": not acc,
                         "sobreposicao": s.get("sobreposicao"), "fator": s.get("fator", 1.0)})
    for i, e in enumerate(ents):
        e["cor"] = 0 if e["cliente"] else (((i - 1) % 4) + 1 if tipo == "concorrencia" else i % 5)
    ids = {e["id"] for e in ents}

    # --- anúncios (concorrência) e quota de voz
    anuncios, ad_aggr = None, None
    if tipo == "concorrencia":
        real = real_meta_ads(cid, ids, inicio, formatos)
        if real:
            anuncios, blocos["anuncios"] = real
        else:
            anuncios = demo_data.anuncios_demo(cfg["demo"], ents, vert, ag, inicio, z)
            blocos["anuncios"] = _bloco("demo", "Anúncios e criativos", None,
                                        "Anúncios simulados a partir das campanhas em config/clients/%s.yaml; marcas fictícias" % cid,
                                        None, ref)
        pn = [p["id"] for p in plats]
        ad, na = signals.matriz_anuncios(anuncios, [e["id"] for e in ents], pn, inicio, n)
        ad_aggr = (ad, na)
        blocos["investimento"] = _bloco(
            "demo" if blocos["anuncios"]["origem"] == "demo" else "estimado", "Investimento estimado", None,
            "Anúncios ativos por semana × valor médio assumido por anúncio e plataforma (config/agencia.yaml) × fator por marca. "
            "Hipóteses de trabalho a calibrar com uma fonte licenciada", None, ref)
        blocos["leilao"] = _bloco("demo", "Informações do leilão (Google Ads)", None,
                                  "Simulação no formato do relatório; dados reais exigem autorização do cliente e parecer de Compliance (Q12)", None, ref)

    # --- procura
    procura = None
    pres = cfg.get("trends", {}).get("apresentacao", {})
    real = real_trends(cid, cfg, n, z, inicio) if cfg.get("trends", {}).get("clusters") else None
    if real:
        procura, blocos["procura"] = real
    elif tipo == "tema":
        procura = [{"id": s["id"], "nome": pres[s["id"]]["nome"], "cor": pres[s["id"]].get("cor", 0),
                    "valores": demo_data.serie_por_pontos(s["pontos"], s["seed"], s["ruido"], n)}
                   for s in cfg["demo"]["procura"] if s["id"] in pres]
        blocos["procura"] = _bloco("demo", "Procura (Google Trends)", None,
                                   "Séries simuladas ao nível do tema; substituídas por dados do Google Trends quando recolhidos "
                                   "(scripts/collect_trends.py)", None, ref)
    else:
        act = {e["id"]: [sum(ad_aggr[0][e["id"]][p][w] for p in [p["id"] for p in plats]) for w in range(n)] for e in ents}
        procura = demo_data.procura_demo_entidades(ents, act, n, int(cfg["demo"]["seed"]))
        blocos["procura"] = _bloco("demo", "Procura pela marca (Google Trends)", None,
                                   "Séries simuladas para marcas fictícias, ligadas à atividade de anúncios", None, ref)

    # --- notícias
    noticias = None
    real = real_noticias(cid, cfg, n, inicio) if cfg.get("noticias", {}).get("temas") else None
    if real:
        noticias, blocos["noticias"] = real
    else:
        if tipo == "tema":
            nome = {t["id"]: t["nome"] for t in cfg["noticias"]["temas"]}
            noticias = [{"id": s["id"], "nome": nome[s["id"]], "cor": (i + 1) % 5,
                         "valores": demo_data.serie_por_pontos(s["pontos"], s["seed"], s["ruido"], n)}
                        for i, s in enumerate(cfg["demo"]["noticias"])]
        else:
            noticias = demo_data.noticias_demo(vert.get("noticias_temas", []), n, int(cfg["demo"]["seed"]))
        blocos["noticias"] = _bloco("demo", "Conversa nas notícias", None,
                                    "Volume simulado; substituído por contagens reais do Google News RSS (scripts/collect_news.py)", None, ref)

    # --- contexto, agenda, eventos, sazonalidade (conteúdo do cliente; real com fonte)
    ctx = cfg.get("contexto", {})
    indicadores = []
    for it in ctx.get("indicadores", []):
        bid = "ctx_" + it["id"]
        blocos[bid] = _bloco("real", it["rotulo"], it["fonte"], None, None, it["data_recolha"])
        indicadores.append({**{k: v for k, v in it.items() if k not in ("fonte", "data_recolha")}, "bloco": bid})
    variacoes = None
    if ctx.get("variacoes"):
        v = ctx["variacoes"]
        blocos["ctx_variacoes"] = _bloco("real", v["titulo"], v["fonte"], None, None, v["data_recolha"])
        variacoes = {"titulo": v["titulo"], "descricao": v["descricao"], "itens": v["itens"], "bloco": "ctx_variacoes"}
    agenda = []
    data_ctx = (ctx.get("indicadores") or [{}])[0].get("data_recolha", ref)
    for i, a in enumerate(cfg.get("agenda", [])):
        bid = f"agenda_{i}"
        blocos[bid] = _bloco(a["origem"], "Agenda: " + a["data"], a.get("fonte"), a.get("metodo"), None,
                             a.get("data_recolha", data_ctx if a["origem"] == "real" else ref))
        agenda.append({"data": a["data"], "texto": a["texto"], "estado": a["estado"], "bloco": bid})
    eventos = [{"semana": round((e["data"] - inicio).days / 7, 2), "titulo": e["titulo"], "fonte": e.get("fonte")}
               for e in cfg.get("eventos", [])]
    saz = None
    if cfg.get("sazonalidade"):
        blocos["sazonalidade"] = _bloco("estimado", "Sazonalidade da procura", None, cfg["sazonalidade"]["metodo"], None, ref)
        saz = {"indice_mensal": cfg["sazonalidade"]["indice_mensal"], "bloco": "sazonalidade"}

    # --- voz no tema (entidades × canais): só mostra o que foi recolhido
    voz = None
    if tipo == "tema":
        blocos["voz"] = _bloco("pendente", "Voz no tema", None, "Por ligar: Meta Ad Library e notícias por entidade", None, None)
        voz = [{"entidade": e["id"], "anuncios_meta": None, "noticias": None} for e in ents]

    # --- sinais e pistas
    series_prim = {s["id"]: s["valores"] for s in (procura or [])}
    if tipo == "concorrencia":
        sg, ps = signals.sinais_concorrencia(ents, ad_aggr[0], ad_aggr[1], anuncios, plats, lim, z, inicio,
                                             blocos["anuncios"]["origem"])
    else:
        sg, ps = signals.sinais_tema(cfg, series_prim, {i["id"]: i for i in indicadores}, lim, z, blocos)

    # --- leilão (depende da quota Google de cada marca)
    leilao = None
    if tipo == "concorrencia":
        a0 = z - 11
        gs = {e["id"]: mean(ad_aggr[0][e["id"]]["Google"][a0:z + 1]) for e in ents}
        tot = sum(gs[e["id"]] for e in ents if e["incluida"]) or 1
        leilao = demo_data.leilao_demo(ents, {k: v / tot * 100 for k, v in gs.items()}, int(cfg["demo"]["seed"]))

    # --- pulso (miniatura da Torre de controlo)
    if tipo == "concorrencia":
        pn = [p["id"] for p in plats]
        pulso = [sum(ad_aggr[0][e["id"]][p][w] for e in ents if e["incluida"] for p in pn) for w in range(z - 15, z + 1)]
    else:
        pr = cfg.get("trends", {}).get("principais", [])
        pulso = ([v for v in series_prim.get(pr[-1], [])][z - 15:z + 1] if pr else [])

    kpis = cfg.get("kpis") or vert.get("kpis", [])
    return {
        "versao": 1, "gerado_em": ref,
        "cliente": {"id": cid, "nome": cl["nome"], "setor": cl.get("setor", ""), "vertical": cl["vertical"],
                    "vertical_nome": vert["vertical"]["nome"], "tipo_universo": tipo, "geo": cl.get("geo", "PT"),
                    "ficticio": bool(cl.get("ficticio", False))},
        "calendario": {"inicio": inicio, "semanas": n, "semana_atual": z,
                       "rotulo_semana_atual": "28 set a 4 out 2026"},
        "plataformas": plats, "formatos": formatos, "territorios": territorios, "canais_offline": ag["canais_offline"],
        "limiares": lim, "entidades": ents, "kpis": kpis, "parametros": {"procura_rotulo": vert.get("procura_rotulo")},
        "blocos": blocos,
        "procura": {"bloco": "procura", "series": procura, "principais": cfg.get("trends", {}).get("principais")} if procura else None,
        "noticias": {"bloco": "noticias", "series": noticias} if noticias else None,
        "anuncios": {"bloco": "anuncios", "itens": anuncios} if anuncios is not None else None,
        "contexto": {"indicadores": indicadores, "variacoes": variacoes} if indicadores else None,
        "agenda": agenda or None, "eventos": eventos, "sazonalidade": saz, "leilao": {"bloco": "leilao", "itens": leilao} if leilao else None,
        "voz": voz, "sinais": sg, "pistas": ps, "pulso": pulso,
        "elo": cfg.get("dados_internos", {}).get("elo"),
    }


def build_agency(datasets: list[dict], ag: dict, fontes: dict) -> dict:
    temas = []
    for p in sorted((ROOT / "config" / "themes").glob("*.json")):
        if p.name.startswith("_"):
            continue
        t = json.loads(p.read_text(encoding="utf-8"))
        temas.append({"id": t["id"], "nome": t["nome"], "cor": t["marca"]["primaria"]})
    verts: dict[str, dict] = {}
    clientes = []
    # clientes reais primeiro, depois os fictícios de demonstração
    for d in sorted(datasets, key=lambda d: (d["cliente"]["ficticio"], d["cliente"]["nome"])):
        c = d["cliente"]
        v = verts.setdefault(c["vertical"], {"id": c["vertical"], "nome": c["vertical_nome"], "clientes": []})
        v["clientes"].append(c["id"])
        clientes.append({**c, "sinais_material": sum(1 for s in d["sinais"] if s.get("material")),
                         "sinais_total": len(d["sinais"]), "pistas": [p["id"] for p in d["pistas"]],
                         "origens": sorted({b["origem"] for b in d["blocos"].values()}),
                         "pulso": d["pulso"], "n_entidades": sum(1 for e in d["entidades"] if e["incluida"])})
    return {"versao": 1, "gerado_em": ag["calendario"]["data_referencia"], "agencia": ag["agencia"],
            "calendario": ag["calendario"], "verticais": list(verts.values()), "clientes": clientes,
            "fontes": fontes["fontes"], "temas": temas, "piloto": ag["piloto"]}


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--client", help="só este cliente (por defeito, todos)")
    args = ap.parse_args()
    ag = load_yaml(ROOT / "config" / "agencia.yaml")
    fontes = load_yaml(ROOT / "config" / "fontes.yaml")
    ids = [args.client] if args.client else list_clients()
    print("A gerar datasets:")
    for cid in ids:
        _dump(build_client(cid, ag, fontes), PROC / f"{cid}.json")
    if not args.client:
        ds = [json.loads((PROC / f"{c}.json").read_text(encoding="utf-8")) for c in ids]
        _dump(build_agency(ds, ag, fontes), PROC / "agencia.json")


if __name__ == "__main__":
    main()
