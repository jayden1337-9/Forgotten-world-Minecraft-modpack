# The Forgotten World — project foundation

## Platform
- Minecraft Bedrock add-on format (Behavior Pack + Resource Pack)
- Target: current Bedrock releases; `min_engine_version` is a compatibility floor, not a claim that every newer feature is supported
- Keep the core lightweight and avoid mandatory script dependencies until a gameplay feature requires them

## Repository layout
- `behavior_pack/`: gameplay data, entities, items, recipes, loot tables and functions
- `resource_pack/`: textures, geometry, animations, render controllers, sounds and UI assets
- `config/`: shared design data used as the source of truth during implementation
- `docs/`: design notes, compatibility notes and implementation plans

## Initial systems
1. Seven item rarity tiers: Common, Uncommon, Rare, Epic, Legendary, Mythical and Divine
2. Guild progression: F, E, D, C, B, A, S and SS
3. Guild points, quest contracts, player profile and Guild Card
4. NPCs, settlements, dungeons, creatures and boss encounters
5. Armor, accessories, consumables, crafting materials and decorative content

## Implementation order
1. Validate both pack manifests in Bedrock
2. Add pack icons and a minimal test asset
3. Implement persistent player profile and guild-point progression
4. Add quest definitions and reward tables
5. Add NPC interactions and rank-gated locations
6. Add custom entities, animations and environment assets

## Compatibility rules
- Use unique UUIDs for every pack header and module.
- Keep Behavior Pack dependencies pointed at the matching Resource Pack header UUID and version.
- Validate JSON before committing and test changes in a disposable world first.
- Record the Minecraft version used for each test; update the minimum engine version only when required by an actual feature.
