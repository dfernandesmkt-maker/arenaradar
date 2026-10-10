"""LIGAÇÃO[google-trends] — importa exportações MANUAIS do Google Trends (trends.google.com → Descarregar CSV).

Serve quando a recolha automática (collect_trends.py) não está disponível ou falha. Não precisa de rede.

Como exportar: em trends.google.com, pesquisa até 5 termos, escolhe Portugal, «Últimos 5 anos» (dados semanais) e
carrega em «Descarregar» (CSV). Um ficheiro por cluster de termos (ver `trends.clusters` em config/clients/<cliente>.yaml).

    python3 scripts/import_trends_csv.py --client spv \\
        --cluster volta=exportacao_volta.csv --cluster ecoponto=exportacao_ecoponto.csv --cluster duvidas=exportacao_duvidas.csv

Grava em data/raw/trends/<cliente>/<data>.csv com proveniência (origem real, fonte «Google Trends (exportação manual)»).
Depois: python3 scripts/build_dataset.py && python3 prototype/build_preview.py

Notas
- Só aceita dados SEMANAIS (o formato de 5 anos). Valores «<1» ficam registados como 0 (o Google não dá o valor exato).
- Formato do ficheiro a confirmar com uma exportação real: o importador procura a linha de cabeçalho («Semana» ou «Week»).
- Nunca se preenchem falhas: se faltarem semanas, o build mantém a demonstração para essa série e avisa.
"""
from __future__ import annotations

import argparse
import csv
import re
from datetime import date, datetime

from common import ROOT, load_client, now_iso, write_records

CAB_SEMANAL = {"semana", "week"}
CAB_OUTROS = {"dia", "day", "mês", "mes", "month", "hora", "time"}


def ler_exportacao(path) -> tuple[list[str], list[tuple[date, list[int]]]]:
    with open(path, encoding="utf-8-sig", newline="") as f:
        linhas = list(csv.reader(f))
    for i, l in enumerate(linhas):
        if l and l[0].strip().lower() in CAB_SEMANAL:
            cab, corpo = l, linhas[i + 1:]
            break
        if l and l[0].strip().lower() in CAB_OUTROS:
            raise SystemExit(f"{path}: o ficheiro não é semanal (começa por «{l[0]}»). Exporta «Últimos 5 anos» para ter dados semanais.")
    else:
        raise SystemExit(f"{path}: não encontrei a linha de cabeçalho («Semana» ou «Week»). É uma exportação do Google Trends?")
    termos = [re.sub(r":\s*\(.*\)\s*$", "", c).strip() for c in cab[1:]]
    out = []
    for r in corpo:
        if not r or not r[0].strip():
            continue
        try:
            d = date.fromisoformat(r[0].strip())
        except ValueError:
            continue
        vals = []
        for c in r[1:1 + len(termos)]:
            c = c.strip()
            vals.append(0 if c.startswith("<") else int(float(c)))
        if len(vals) == len(termos):
            out.append((d, vals))
    if not out:
        raise SystemExit(f"{path}: cabeçalho encontrado mas sem linhas de dados.")
    return termos, out


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--client", required=True)
    ap.add_argument("--cluster", action="append", required=True, metavar="NOME=FICHEIRO.csv",
                    help="cluster do YAML e o ficheiro exportado (repetir para vários)")
    ap.add_argument("--data-recolha", default=None, help="data em que exportaste (AAAA-MM-DD); por defeito, hoje")
    args = ap.parse_args()
    cfg = load_client(args.client)
    cfg_cl = cfg.get("trends", {}).get("clusters", {})
    rec = args.data_recolha or now_iso()
    if args.data_recolha:
        date.fromisoformat(args.data_recolha)
        rec = datetime.fromisoformat(args.data_recolha + "T00:00:00+00:00").isoformat()
    geo, periodo = cfg.get("trends", {}).get("geo", "PT"), cfg.get("trends", {}).get("periodo", "today 5-y")
    registos = []
    for par in args.cluster:
        nome, _, ficheiro = par.partition("=")
        if not ficheiro:
            raise SystemExit(f"«{par}»: usa o formato NOME=FICHEIRO.csv")
        if nome not in cfg_cl:
            print(f"AVISO: o cluster «{nome}» não existe em config/clients/{args.client}.yaml (trends.clusters); fica registado na mesma.")
        termos, linhas = ler_exportacao(ficheiro)
        esperados = set(cfg_cl.get(nome, []))
        if esperados and not set(termos) & esperados:
            print(f"AVISO: os termos do ficheiro {termos} não coincidem com os do cluster «{nome}» {sorted(esperados)}.")
        for d, vals in linhas:
            for t, v in zip(termos, vals):
                registos.append({
                    "origem": "real", "fonte": "Google Trends (exportação manual)", "data_recolha": rec,
                    "metodo": f"índice relativo 0-100 dentro do cluster '{nome}', geo={geo}, {periodo}; exportação manual do site",
                    "cluster": nome, "termo": t, "semana": d.isoformat(), "indice": v})
        print(f"[trends] {nome}: {len(linhas)} semanas, {len(termos)} termos ({linhas[0][0]} a {linhas[-1][0]})")
    write_records(registos, "trends", args.client)


if __name__ == "__main__":
    main()
