# Testing checklist

## Pack and CI
- [ ] Both packs import and activate.
- [ ] CI JSON validation and JavaScript syntax check pass.
- [ ] Existing guild menu, card and contract tracking still work.

## Abyss portal
- [ ] A 4x5 frame of Abyss Portal Frame blocks activates when an Abyss Keystone is placed in its lower-left opening.
- [ ] Walking into the active portal sends the player to `forgotten:forgotten_abyss`.
- [ ] Return portal takes each player back to their own saved entry location.
- [ ] Multiplayer test confirms independent return locations.

## Crossover content
- [ ] New mobs render with their assigned geometry and texture.
- [ ] Spawn rules work in their intended Overworld biomes.
- [ ] Eye of the Void, Failed Champion and Tree Sentinel boss attacks work.
- [ ] Boss kills award guild points and coins.
- [ ] Crossover weapons and armour appear in inventory with correct names and icons.
- [ ] Ore feature rules generate ores in natural stone/deepslate.
- [ ] Natural ruins generate only on untouched terrain and do not overwrite player builds.
- [ ] All new contracts track and can be claimed.

Record the exact Minecraft retail version, device, enabled experiments and any content-log errors. CI validates files and packaging; it cannot prove in-game gameplay correctness.
