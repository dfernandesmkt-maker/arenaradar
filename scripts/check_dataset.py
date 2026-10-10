"""Verificação automática dos datasets (regra de ouro dos dados). Falha (código 1) se algo não cumprir.

    python3 scripts/check_dataset.py

Regras verificadas em data/processed/<cliente>.json:
1. Todo o bloco tem origem válida (real, estimado, demo ou pendente).
2. Bloco `real` tem fonte e data de recolha; bloco `estimado` tem método.
3. Dados `demo` nunca são atribuídos a uma entidade real de terceiros (só a entidades fictícias).
4. Todo o bloco referenciado (sinais, pistas, séries, anúncios…) existe no registo de proveniência.
5. Anúncios `real` têm fonte e data de recolha; `estimado` tem método.
"""
from __future__ import annotations

import json
import sys

from common import ROOT

ORIGENS = {"real", "estimado", "demo", "pendente"}


def verificar(path) -> list[str]:
    d = json.loads(path.read_text(encoding="utf-8"))
    cid, erros, blocos = d["cliente"]["id"], [], d["blocos"]
    for k, b in blocos.items():
        if b["origem"] not in ORIGENS:
            erros.append(f"{cid}: bloco «{k}» com origem inválida «{b['origem']}»")
        if b["origem"] == "real" and not (b.get("fonte") and b.get("data_recolha")):
            erros.append(f"{cid}: bloco real «{k}» sem fonte ou data de recolha")
        if b["origem"] == "estimado" and not b.get("metodo"):
            erros.append(f"{cid}: bloco estimado «{k}» sem método")
    refs = {s["bloco"] for s in d["sinais"]} | {p["bloco"] for p in d["pistas"]}
    for chave in ("procura", "noticias", "anuncios", "leilao"):
        if d.get(chave):
            refs.add(d[chave]["bloco"])
    for nome in ("contexto",):
        for i in (d.get(nome) or {}).get("indicadores", []):
            refs.add(i["bloco"])
    refs |= {a["bloco"] for a in d.get("agenda") or []}
    for r in sorted(r for r in refs if r not in blocos):
        erros.append(f"{cid}: o bloco «{r}» é usado mas não tem registo de proveniência")
    reais = {e["id"] for e in d["entidades"] if not e["ficticia"]}
    for a in (d.get("anuncios") or {"itens": []})["itens"]:
        if a["origem"] == "demo" and a["marca"] in reais:
            erros.append(f"{cid}: anúncio demo atribuído a uma entidade real ({a['marca']})")
        if a["origem"] == "real" and not (a.get("fonte") and a.get("data_recolha")):
            erros.append(f"{cid}: anúncio real {a['id']} sem fonte ou data de recolha")
        if a["origem"] == "estimado" and not a.get("metodo"):
            erros.append(f"{cid}: anúncio estimado {a['id']} sem método")
    return erros


def main() -> None:
    ficheiros = sorted(p for p in (ROOT / "data" / "processed").glob("*.json") if p.name != "agencia.json")
    if not ficheiros:
        sys.exit("Sem datasets. Corre primeiro: python3 scripts/build_dataset.py")
    erros = [e for p in ficheiros for e in verificar(p)]
    for e in erros:
        print("ERRO", e)
    print(f"{len(ficheiros)} datasets verificados, {len(erros)} erros.")
    sys.exit(1 if erros else 0)


if __name__ == "__main__":
    main()
