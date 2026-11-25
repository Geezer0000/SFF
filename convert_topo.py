import json

with open('C:/SFF/ch-combined.json', 'r', encoding='utf-8') as f:
    topo = json.load(f)

# Keep country, cantons and lakes for high performance and visual richness
minimal_topo = {
    "type": "Topology",
    "transform": topo.get("transform"),
    "arcs": topo.get("arcs"),
    "objects": {
        "country": topo["objects"]["country"],
        "cantons": topo["objects"]["cantons"],
        "lakes": topo["objects"]["lakes"]
    }
}

out_path = 'C:/SFF/frontend/src/data/ch-cantons.json'
with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(minimal_topo, f)

print(f"Saved minimal Swiss cantons topojson to {out_path}!")
print("Canton geometries sample:")
for g in topo["objects"]["cantons"]["geometries"][:5]:
    print(g.get("id"), g.get("properties"))
