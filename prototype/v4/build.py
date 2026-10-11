"""Gera prototype/arena-radar-v4.html (ficheiro único, autocontido) a partir de v4/src/index.template.html.

    python3 scripts/v4/gerar_dados.py      # dados de demonstração (data/v4/)
    python3 prototype/v4/build.py          # página
    python3 prototype/v4/build.py --artefacto   # variante para publicar no claude.ai (prototype/dist/)

{{INCLUDE:ficheiro}} junta CSS e JS de v4/src/; {{DATA_JSON}} embebe data/v4/*.json; a fonte Inter e o logo oficial
vão em base64. Sem pedidos externos.
"""
import base64
import json
import re
import sys
from pathlib import Path

here = Path(__file__).resolve().parent
proto = here.parent
root = proto.parent
dados = root / "data" / "v4"


def b64(p):
    return base64.b64encode(Path(p).read_bytes()).decode()


def include(text):
    return re.sub(r"\{\{INCLUDE:([\w./\-]+)\}\}", lambda m: include((here / "src" / m.group(1)).read_text(encoding="utf-8")), text)


if not (dados / "agencia.json").exists():
    sys.exit("Faltam os dados. Corre primeiro: python3 scripts/v4/gerar_dados.py")
ag = json.loads((dados / "agencia.json").read_text(encoding="utf-8"))
cls = {c["id"]: json.loads((dados / f"{c['id']}.json").read_text(encoding="utf-8")) for c in ag["clientes"]}
data = json.dumps({"agencia": ag, "clientes": cls}, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
artefacto = "--artefacto" in sys.argv
html = include((here / "src" / "index.template.html").read_text(encoding="utf-8"))
html = html.replace("{{EM_ARTEFACTO}}", "true" if artefacto else "false").replace("{{DATA_JSON}}", data)
html = html.replace("{{FONT_B64}}", b64(proto / "fonts" / "inter-latin-wght-normal.woff2"))
html = html.replace("{{LOGO_B64}}", b64(root / "assets" / "arena_media_portugal_logo.jpg"))
if artefacto:
    titulo = re.search(r"<title>.*?</title>", html, re.S).group(0)
    estilo = re.search(r"<style>.*?</style>", html, re.S).group(0)
    corpo = re.search(r"<body>(.*)</body>", html, re.S).group(1)
    html = f"{titulo}\n{estilo}\n{corpo}"
    (proto / "dist").mkdir(exist_ok=True)
    out = proto / "dist" / "arena-radar-v4-artefacto.html"
else:
    out = proto / "arena-radar-v4.html"
out.write_text(html, encoding="utf-8")
print(f"{out.name}: {out.stat().st_size / 1024:.0f} KB")
