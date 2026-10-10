"""Gera prototype/arena-radar-v3-preview.html (ficheiro único, autocontido) a partir de src/index.template.html.

- {{INCLUDE:ficheiro}} junta ficheiros de src/ (recursivo): CSS e JS ficam todos dentro do HTML final.
- {{DATA_JSON}} embebe os datasets (data/processed/*.json, gerados por scripts/build_dataset.py).
- Embebe a fonte Inter (fonts/) e o logo oficial (../assets/) em base64. Sem pedidos externos.

Uso:
    python3 scripts/build_dataset.py     # se mudaste a configuração ou os dados recolhidos
    python3 prototype/build_preview.py
"""
import base64
import json
import re
import sys
from pathlib import Path

here = Path(__file__).resolve().parent
root = here.parent
proc = root / "data" / "processed"


def b64(p):
    return base64.b64encode(Path(p).read_bytes()).decode()


def include(text):
    return re.sub(r"\{\{INCLUDE:([\w./\-]+)\}\}",
                  lambda m: include((here / "src" / m.group(1)).read_text(encoding="utf-8")), text)


if not (proc / "agencia.json").exists():
    sys.exit("Faltam os datasets. Corre primeiro: python3 scripts/build_dataset.py")

agencia = json.loads((proc / "agencia.json").read_text(encoding="utf-8"))
clientes = {c["id"]: json.loads((proc / f"{c['id']}.json").read_text(encoding="utf-8")) for c in agencia["clientes"]}
data = json.dumps({"agencia": agencia, "clientes": clientes}, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")

html = include((here / "src" / "index.template.html").read_text(encoding="utf-8"))
html = html.replace("{{DATA_JSON}}", data)
html = html.replace("{{FONT_B64}}", b64(here / "fonts" / "inter-latin-wght-normal.woff2"))
html = html.replace("{{LOGO_B64}}", b64(root / "assets" / "arena_media_portugal_logo.jpg"))
out = here / "arena-radar-v3-preview.html"
out.write_text(html, encoding="utf-8")
print(f"{out.name}: {out.stat().st_size / 1024:.0f} KB")
