"""Teste de carga da interface (RB-100): gera uma CÓPIA do repositório, fora dele, com dados sintéticos em volume realista.

    python3 scripts/gerar_carga.py [pasta_de_saída]      # por defeito: <tmp>/arenaradar-carga

30 clientes em 6 verticais, 10 concorrentes por vertical, o Lumio com 17 concorrentes e 12 sinais e pistas.
Todas as marcas e clientes são FICTÍCIOS (nomes inventados), nenhum dado é atribuído a entidades reais.
Nada disto é escrito no repositório: abre depois <pasta>/prototype/arena-radar-v3-preview.html e percorre as páginas
(Torre, Visão geral, Mercado, Ações, Relatórios) em ecrã grande e pequeno à procura de páginas intermináveis,
transbordos e erros de consola.
"""
import json, random, shutil, subprocess, sys, tempfile
from pathlib import Path
import yaml

SRC = Path(__file__).resolve().parents[1]
DST = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(tempfile.gettempdir()) / "arenaradar-carga"
if DST.exists():
    shutil.rmtree(DST)
shutil.copytree(SRC, DST, ignore=shutil.ignore_patterns(".git", "dist", "node_modules", "__pycache__"))
for p in (DST / "data" / "processed").glob("*.json"):
    p.unlink()

rnd = random.Random(7)
SYL = ["ka","lo","mi","ra","ve","zu","ti","or","an","el","sa","du","fe","gi","no","pe","qua","xo","yu","bre"]
usados = set()
def nome():
    while True:
        n = "".join(rnd.choice(SYL) for _ in range(rnd.choice([2, 3]))).capitalize()
        if n not in usados:
            usados.add(n); return n

VERTS = [("energia","Energia"),("seguros","Seguros"),("mobilidade","Mobilidade"),("ambiente","Ambiente"),("telecom","Telecomunicações"),("retalho","Retalho alimentar")]
base = yaml.safe_load((SRC/"config/verticals/energia.yaml").read_text(encoding="utf-8"))
vert_comp = {}
for vid, vn in VERTS:
    v = dict(base)
    v["vertical"] = {"id": vid, "nome": vn}
    comp = [{"id": f"{vid[:3]}{i}", "nome": nome(), "fator": round(rnd.uniform(.6, 1.4), 2), "ficticia": True} for i in range(10)]
    v["concorrentes_por_defeito"] = comp
    v["sugeridos"] = [{"id": f"{vid[:3]}s{i}", "nome": nome(), "fator": 1.1, "sobreposicao": 60 + i * 7, "ficticia": True} for i in range(2)]
    vert_comp[vid] = comp
    (DST/"config/verticals"/f"{vid}.yaml").write_text(yaml.safe_dump(v, allow_unicode=True, sort_keys=False), encoding="utf-8")

PLS = ["Meta", "Google", "YouTube", "TikTok"]
def campanhas(ids):
    out = []
    for b in ids:
        out.append({"b": b, "n": "Sempre ativo, pesquisa", "s": 0, "e": 25, "pl": ["Google"], "th": 2, "int": rnd.randint(3, 6)})
        for k in range(rnd.randint(2, 4)):
            s = rnd.randint(0, 20); e = min(25, s + rnd.randint(3, 12))
            out.append({"b": b, "n": f"{nome()} {rnd.choice(['Verão','Black','Mais','Pro','Flex','Casa'])}", "s": s, "e": e,
                        "pl": rnd.sample(PLS, rnd.randint(1, 3)), "th": rnd.randint(0, 4), "int": rnd.randint(6, 22)})
    return out

LONG = ["Companhia Nacional de Energias Renováveis do Alentejo", "Grupo Ibérico de Seguros e Proteção Familiar", "Associação de Transportes Urbanos da Grande Lisboa"]
novos = []
for i in range(26):
    vid, vn = VERTS[i % len(VERTS)]
    cid = f"c{i+1:02d}"
    nm = LONG[i % 9] if i % 9 < 3 else nome()
    comp = vert_comp[vid]
    ids = [cid] + [c["id"] for c in comp]
    cfg = {"cliente": {"id": cid, "nome": nm, "setor": f"{vn} (cliente fictício)", "vertical": vid, "geo": "PT", "idioma": "pt-PT", "tipo_universo": "concorrencia", "ficticio": True},
           "universo": [{"id": cid, "nome": nm, "papel": "Cliente", "prioridade": "cliente", "fator": 1.0, "ficticia": True, "meta_search_terms": [nm], "meta_page_ids": []}],
           "concorrentes": {"excluir": [], "acrescentar": [], "aceitar_sugeridos": []}, "limiares": {},
           "demo": {"seed": 3000 + i, "anuncios_desde": __import__("datetime").date(2026, 4, 6), "campanhas": campanhas(ids)}}
    (DST/"config/clients"/f"{cid}.yaml").write_text(yaml.safe_dump(cfg, allow_unicode=True, sort_keys=False), encoding="utf-8")
    novos.append(cid)

# Lumio com 10 concorrentes (os 3 originais + 7) e campanhas para todos
lum = yaml.safe_load((DST/"config/clients/lumio.yaml").read_text(encoding="utf-8"))
extra = [{"id": f"x{i}", "nome": nome(), "fator": round(rnd.uniform(.6, 1.3), 2), "ficticia": True} for i in range(7)]
lum["concorrentes"]["acrescentar"] = extra
lum["demo"]["campanhas"] += campanhas([e["id"] for e in extra])
(DST/"config/clients/lumio.yaml").write_text(yaml.safe_dump(lum, allow_unicode=True, sort_keys=False), encoding="utf-8")

sys.path.insert(0, str(DST/"scripts"))
import build_dataset as bd
from common import list_clients, load_yaml
ag = load_yaml(DST/"config/agencia.yaml"); fontes = load_yaml(DST/"config/fontes.yaml")
ids = list_clients()
for cid in ids:
    bd._dump(bd.build_client(cid, ag, fontes), bd.PROC/f"{cid}.json")
# volume: 12 sinais e 12 pistas no Lumio
p = bd.PROC/"lumio.json"; d = json.loads(p.read_text(encoding="utf-8"))
ent = [e["id"] for e in d["entidades"] if not e.get("cliente")]
n0 = len(d["sinais"]); p0 = len(d["pistas"])
for k in range(n0, 12):
    s = json.loads(json.dumps(d["sinais"][k % n0])); s["id"] = f"sx{k}"; s["entidade"] = ent[k % len(ent)]
    s["titulo"] = f"{d['entidades'][[e['id'] for e in d['entidades']].index(s['entidade'])]['nome']} alterou a presença em {rnd.choice(PLS)} em {rnd.randint(14, 60)}% nas últimas 4 semanas, com impacto na quota de voz de várias marcas"
    s["material"] = k % 3 != 0; s["pista_id"] = f"px{k}"
    d["sinais"].append(s)
    q = json.loads(json.dumps(d["pistas"][k % p0])); q["id"] = f"px{k}"; q["sinal_id"] = s["id"]; q["titulo"] = "Responder a " + s["titulo"][:60]; q["s"] = "sugerida"
    d["pistas"].append(q)
p.write_text(json.dumps(d, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
datasets = [json.loads((bd.PROC/f"{c}.json").read_text(encoding="utf-8")) for c in ids]
bd._dump(bd.build_agency(datasets, ag, fontes), bd.PROC/"agencia.json")
print("clientes", len(ids), "sinais lumio", len(d["sinais"]), "pistas", len(d["pistas"]), "entidades", len(d["entidades"]))
subprocess.run([sys.executable, str(DST/"prototype/build_preview.py")], check=True)
