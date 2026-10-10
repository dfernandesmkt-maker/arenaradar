"""Recolhe anúncios da Meta Ad Library API entregues em Portugal.

Requisitos: identidade confirmada na Meta, app de programador e token em .env.
Por força do DSA, a API cobre todos os anúncios entregues na UE (ad_type=ALL).
Despesa e impressões só existem para anúncios políticos/sociais; para os restantes ficam vazias.
Confirmar nomes de campos e versão da Graph API na documentação atual antes de correr.
"""
from __future__ import annotations

import argparse
import json
import os

import requests
from dotenv import load_dotenv

from common import ROOT, load_client, write_records

CAMPOS = [
    "id", "page_id", "page_name", "ad_creative_bodies", "ad_creative_link_titles",
    "ad_delivery_start_time", "ad_delivery_stop_time", "ad_snapshot_url",
    "publisher_platforms", "languages", "eu_total_reach",
]


def pedir(url: str, params: dict) -> list[dict]:
    dados = []
    while url:
        r = requests.get(url, params=params, timeout=30)
        if r.status_code != 200:
            print(f"[meta] Erro {r.status_code}: {r.text[:300]}")
            break
        corpo = r.json()
        dados.extend(corpo.get("data", []))
        url = corpo.get("paging", {}).get("next")
        params = None  # o link "next" já traz os parâmetros
    return dados


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--client", required=True)
    ap.add_argument("--estado", default="ACTIVE", choices=["ACTIVE", "INACTIVE", "ALL"])
    args = ap.parse_args()

    load_dotenv(ROOT / ".env")
    token = os.getenv("META_ACCESS_TOKEN")
    versao = os.getenv("META_GRAPH_VERSION", "v23.0")
    if not token:
        raise SystemExit("Falta META_ACCESS_TOKEN no .env (ver docs/06-arranque-claude-code.md).")

    cfg = load_client(args.client)
    geo = cfg["cliente"].get("geo", "PT")
    url = f"https://graph.facebook.com/{versao}/ads_archive"
    registos = []

    for ent in cfg.get("universo", []):
        base = {
            "access_token": token,
            "ad_type": "ALL",
            "ad_reached_countries": json.dumps([geo]),
            "ad_active_status": args.estado,
            "fields": ",".join(CAMPOS),
            "limit": 100,
        }
        pedidos = []
        if ent.get("meta_page_ids"):
            pedidos.append({**base, "search_page_ids": json.dumps(ent["meta_page_ids"])})
        else:
            for termo in ent.get("meta_search_terms", []):
                pedidos.append({**base, "search_terms": termo})

        for p in pedidos:
            for ad in pedir(url, p):
                registos.append({
                    "origem": "real",
                    "fonte": "Meta Ad Library API",
                    "metodo": ("page_ids" if "search_page_ids" in p else f"search_terms: {p.get('search_terms')}")
                              + " · confirmar que o anunciante corresponde à entidade",
                    "url": ad.get("ad_snapshot_url", ""),
                    "entidade": ent["id"],
                    "ad_id": ad.get("id"),
                    "pagina": ad.get("page_name"),
                    "texto": " | ".join(ad.get("ad_creative_bodies", []) or [])[:500],
                    "inicio": ad.get("ad_delivery_start_time"),
                    "fim": ad.get("ad_delivery_stop_time"),
                    "plataformas": ",".join(ad.get("publisher_platforms", []) or []),
                    "alcance_ue": ad.get("eu_total_reach", ""),
                })

    write_records(registos, "meta_ads", args.client)


if __name__ == "__main__":
    main()
