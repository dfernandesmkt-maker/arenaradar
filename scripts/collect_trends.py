"""Recolhe interesse de pesquisa do Google Trends por cluster.

Usa pytrends (biblioteca não oficial, arquivada em 2025, funciona só em parte).
Se falhar: exportar CSV manualmente em trends.google.com para
data/raw/trends/manual/<cliente>/ e registar a origem como 'real', fonte 'Google Trends (exportação manual)'.
Nunca preencher falhas com valores inventados.
"""
from __future__ import annotations

import argparse
import time

from common import load_client, write_records

try:
    from pytrends.request import TrendReq
except ImportError:  # pragma: no cover
    raise SystemExit("Instala as dependências: pip install -r scripts/requirements.txt")


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--client", required=True)
    ap.add_argument("--pausa", type=float, default=8.0, help="segundos entre pedidos")
    args = ap.parse_args()

    cfg = load_client(args.client)
    tcfg = cfg.get("trends", {})
    geo, periodo = tcfg.get("geo", "PT"), tcfg.get("periodo", "today 5-y")
    py = TrendReq(hl="pt-PT", tz=0, retries=2, backoff_factor=0.5)

    registos, falhas = [], []
    for cluster, termos in tcfg.get("clusters", {}).items():
        termos = termos[:5]
        try:
            py.build_payload(termos, timeframe=periodo, geo=geo)
            df = py.interest_over_time()
        except Exception as exc:  # bloqueios e alterações de backend acontecem
            falhas.append(f"{cluster}: {exc}")
            continue
        if df.empty:
            falhas.append(f"{cluster}: sem dados")
            continue
        for data, linha in df.drop(columns=["isPartial"], errors="ignore").iterrows():
            for termo in termos:
                if termo in linha:
                    registos.append({
                        "origem": "real",
                        "fonte": "Google Trends (via pytrends)",
                        "metodo": f"índice relativo 0-100 dentro do cluster '{cluster}', geo={geo}, {periodo}",
                        "cluster": cluster,
                        "termo": termo,
                        "semana": data.date().isoformat(),
                        "indice": int(linha[termo]),
                    })
        time.sleep(args.pausa)

    write_records(registos, "trends", args.client)
    if falhas:
        print("[trends] Clusters com falha (usar exportação manual):")
        for f in falhas:
            print("  -", f)


if __name__ == "__main__":
    main()
