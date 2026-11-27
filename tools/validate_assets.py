#!/usr/bin/env python3
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BP = ROOT / "behavior_pack"
RP = ROOT / "resource_pack"

json_files = (
    list(BP.rglob("*.json"))
    + list(RP.rglob("*.json"))
    + list((ROOT / "config").rglob("*.json"))
)
for path in json_files:
    json.loads(path.read_text(encoding="utf-8"))

bp_manifest = json.loads((BP / "manifest.json").read_text(encoding="utf-8"))
rp_manifest = json.loads((RP / "manifest.json").read_text(encoding="utf-8"))
rp_uuid = rp_manifest["header"]["uuid"]
assert any(
    dep.get("uuid") == rp_uuid
    and dep.get("version") == rp_manifest["header"]["version"]
    for dep in bp_manifest.get("dependencies", [])
), "Behavior pack dependency does not match resource pack UUID/version"

animation_ids = set()
for path in (RP / "animations").glob("*.json"):
    animation_ids.update(json.loads(path.read_text(encoding="utf-8")).get("animations", {}))

controllers = {}
for path in (RP / "animation_controllers").glob("*.json"):
    controllers.update(
        json.loads(path.read_text(encoding="utf-8")).get("animation_controllers", {})
    )
controller_ids = set(controllers)

geometry_ids = set()
for path in (RP / "models" / "entity").glob("*.geo.json"):
    models = json.loads(path.read_text(encoding="utf-8")).get("minecraft:geometry", [])
    geometry_ids.update(model["description"]["identifier"] for model in models)

client_entities = list((RP / "entity").glob("*.entity.json"))
aliases = set()
for path in client_entities:
    description = json.loads(path.read_text(encoding="utf-8"))["minecraft:client_entity"]["description"]
    geometry = description["geometry"]["default"]
    assert geometry in geometry_ids, f"{path}: missing geometry {geometry}"
    texture = RP / (description["textures"]["default"] + ".png")
    assert texture.is_file(), f"{path}: missing texture {texture}"
    for alias, target in description.get("animations", {}).items():
        aliases.add(alias)
        assert target in animation_ids or target in controller_ids, (
            f"{path}: unresolved animation/controller {target}"
        )
    for alias in description.get("scripts", {}).get("animate", []):
        assert alias in description.get("animations", {}), (
            f"{path}: animate script references missing alias {alias}"
        )

for controller_id, controller in controllers.items():
    for state_name, state in controller.get("states", {}).items():
        for alias in state.get("animations", []):
            assert alias in aliases, (
                f"{controller_id}/{state_name}: unresolved animation alias {alias}"
            )

required = [
    BP / "manifest.json",
    RP / "manifest.json",
    BP / "scripts" / "main.js",
    ROOT / "tools" / "install-vmoscloud.sh",
]
for path in required:
    assert path.is_file(), f"Missing required file: {path}"

print(
    f"Validated {len(json_files)} JSON files, {len(client_entities)} client entities, "
    f"{len(animation_ids)} animations and {len(controller_ids)} animation controllers."
)
