"""Gera prototype/arena-radar-v3-preview.html (ficheiro único, autocontido) a partir de src/preview.template.html.
Embebe a fonte Inter (fonts/) e o logo oficial (../assets/) em base64, sem pedidos externos."""
import base64
from pathlib import Path

here = Path(__file__).resolve().parent
b64 = lambda p: base64.b64encode(Path(p).read_bytes()).decode()
html = (here / "src" / "preview.template.html").read_text(encoding="utf-8")
import re
def include(text):
    # {{INCLUDE:ficheiro}} -> conteúdo de src/ficheiro (recursivo)
    return re.sub(r"\{\{INCLUDE:([\w.\-]+)\}\}", lambda m: include((here / "src" / m.group(1)).read_text(encoding="utf-8")), text)
html = include(html)
html = html.replace("{{FONT_B64}}", b64(here / "fonts" / "inter-latin-wght-normal.woff2"))
html = html.replace("{{LOGO_B64}}", b64(here.parent / "assets" / "arena_media_portugal_logo.jpg"))
out = here / "arena-radar-v3-preview.html"
out.write_text(html, encoding="utf-8")
print(f"{out.name}: {out.stat().st_size/1024:.0f} KB")
