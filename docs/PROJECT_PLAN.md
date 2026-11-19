# The Forgotten World — project foundation

## Platform
- Minecraft Bedrock add-on format: Behavior Pack + Resource Pack.
- Keep the core lightweight and avoid extra script dependencies unless a feature needs them.
- Current scripts use stable `@minecraft/server` 2.10.0 and `@minecraft/server-ui` 2.2.0.

## Implemented systems
- Persistent player profiles using player dynamic properties.
- Guild points, coins and eight guild ranks (F through SS).
- Guild Card and contract-board forms.
- Three starter mob-hunt contracts with saved progress and claimable rewards.
- Seven rarity tiers in shared configuration.

## Planned content milestones
1. Add custom armor, clothing, creatures, NPCs and environment assets.
2. Add settlement and dungeon layouts.
3. Expand quest chains, reputation, merchants and crafting.
4. Add additional UI polish, localization and accessibility options.
5. Test on current retail Bedrock clients and dedicated multiplayer worlds.

## Compatibility
- Behavior Pack dependency versions are pinned in `behavior_pack/manifest.json`.
- Test in a disposable world before using the packs in an existing save.
- Record the exact Minecraft retail version used for each compatibility test.
