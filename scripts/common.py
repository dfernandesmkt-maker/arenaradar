"""Utilitários partilhados: configuração do cliente e escrita com proveniência."""
from __future__ import annotations

import csv
from datetime import datetime, timezone
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[1]
ORIGENS = {"real", "estimado", "demo"}
COLUNAS_PROVENIENCIA = ["origem", "fonte", "data_recolha", "metodo", "url"]


def load_client(client_id: str) -> dict:
    path = ROOT / "config" / "clients" / f"{client_id}.yaml"
    if not path.exists():
        raise SystemExit(f"Configuração não encontrada: {path}")
    with path.open(encoding="utf-8") as f:
        return yaml.safe_load(f)


def now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def write_records(records: list[dict], fonte_id: str, client_id: str) -> Path | None:
    """Escreve registos em data/raw/<fonte>/<cliente>/<data>.csv.

    Recusa registos sem proveniência válida: melhor falhar do que publicar
    um número sem origem.
    """
    if not records:
        print(f"[{fonte_id}] Sem registos para escrever.")
        return None
    for i, r in enumerate(records):
        if r.get("origem") not in ORIGENS:
            raise ValueError(f"Registo {i} sem 'origem' válida: {r}")
        if r["origem"] == "real" and not r.get("fonte"):
            raise ValueError(f"Registo {i} é 'real' mas não tem 'fonte'.")
        if r["origem"] == "estimado" and not r.get("metodo"):
            raise ValueError(f"Registo {i} é 'estimado' mas não tem 'metodo'.")
        r.setdefault("data_recolha", now_iso())

    out_dir = ROOT / "data" / "raw" / fonte_id / client_id
    out_dir.mkdir(parents=True, exist_ok=True)
    out = out_dir / f"{datetime.now():%Y-%m-%d}.csv"

    campos = COLUNAS_PROVENIENCIA + sorted(
        {k for r in records for k in r} - set(COLUNAS_PROVENIENCIA)
    )
    with out.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=campos, extrasaction="ignore")
        w.writeheader()
        w.writerows(records)
    print(f"[{fonte_id}] {len(records)} registos → {out.relative_to(ROOT)}")
    return out
