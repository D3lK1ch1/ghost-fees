#!/usr/bin/env python3
"""Copy Ghost It's service catalogue (agent/agent.py) into the app as JSON, so Kit and
Ghost It spot double-ups the same way. Reads the file as code (ast), never runs it.

Run from the repo root after the agent changes:  python3 scripts/sync-ghostit-catalogue.py
"""
import ast
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
tree = ast.parse((ROOT / "agent" / "agent.py").read_text())
consts, catalogue, extra = {}, [], {}


def value(node):
    if isinstance(node, ast.Name):
        return consts.get(node.id)
    return ast.literal_eval(node)


for node in tree.body:
    if isinstance(node, ast.Assign) and len(node.targets) == 1 and isinstance(node.targets[0], ast.Name):
        name = node.targets[0].id
        try:
            consts[name] = ast.literal_eval(node.value)
        except ValueError:
            continue
        if name in ("OVERLAP_NAMES", "PACK_EMOJI", "PACK_HUNTS", "PACKS"):
            extra[name] = consts[name]
    if isinstance(node, ast.Expr) and isinstance(node.value, ast.Call) and getattr(node.value.func, "id", "") == "add":
        call = node.value
        fields = ["key", "name", "pack", "aliases", "link", "steps", "overlap", "status"]
        row = dict(zip(fields, [value(a) for a in call.args]))
        row.update({k.arg: value(k.value) for k in call.keywords})
        catalogue.append({k: row.get(k) for k in ["key", "name", "pack", "aliases", "link", "steps", "overlap"]})

out = {
    "source": "agent/agent.py (Ghost It). Regenerate with scripts/sync-ghostit-catalogue.py",
    "services": catalogue,
    "overlapNames": extra.get("OVERLAP_NAMES", {}),
    "packs": extra.get("PACKS", []),
    "packEmoji": extra.get("PACK_EMOJI", {}),
    "packHunts": extra.get("PACK_HUNTS", {}),
}
dest = ROOT / "src" / "lib" / "ghostFees" / "ghostItCatalogue.json"
dest.write_text(json.dumps(out, indent=1, ensure_ascii=False) + "\n")
print(f"{len(catalogue)} services, {len(out['overlapNames'])} overlap groups -> {dest.relative_to(ROOT)}")
