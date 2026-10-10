"""Recolhe notícias do Google News RSS (PT) para as queries do cliente."""
from __future__ import annotations

import argparse
from urllib.parse import quote_plus

import feedparser

from common import load_client, write_records

RSS = "https://news.google.com/rss/search?q={q}&hl=pt-PT&gl=PT&ceid=PT:pt-150"


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--client", required=True)
    ap.add_argument("--dias", type=int, default=7, help="janela de pesquisa em dias")
    args = ap.parse_args()

    cfg = load_client(args.client)
    vistos, registos = set(), []
    for query in cfg.get("noticias", {}).get("queries", []):
        feed = feedparser.parse(RSS.format(q=quote_plus(f"{query} when:{args.dias}d")))
        if feed.bozo and not feed.entries:
            print(f"[noticias] Falhou: {query} ({feed.bozo_exception})")
            continue
        for e in feed.entries:
            if e.link in vistos:
                continue
            vistos.add(e.link)
            registos.append({
                "origem": "real",
                "fonte": f"Google News RSS · {getattr(e, 'source', {}).get('title', 'meio n/d')}",
                "metodo": f"query: {query}",
                "url": e.link,
                "titulo": e.title,
                "publicado": getattr(e, "published", ""),
                "query": query,
            })
    write_records(registos, "noticias", args.client)


if __name__ == "__main__":
    main()
