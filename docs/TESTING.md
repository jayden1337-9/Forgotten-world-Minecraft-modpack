# Testing checklist

## Pack discovery and CI
- [ ] Both packs appear under World Settings > Behavior Packs / Resource Packs > My Packs.
- [ ] Both packs activate together without missing-dependency warnings.
- [ ] CI validates JSON, JavaScript syntax, assets and animation references.
- [ ] Existing guild menu, card and contract tracking still work.

## Animation
- [ ] Custom creatures idle-bob when stationary.
- [ ] Moving creatures use the movement animation.
- [ ] Humanoid creatures and bosses play the attack wind-up.
- [ ] Ashen Wolf moves its legs and tail.
- [ ] Verdant Slime and King Slime squash/stretch while moving.
- [ ] Eye of the Void hovers and rotates.

## Abyss portal
- [ ] A 4x5 frame of Abyss Portal Frame blocks activates when an Abyss Keystone is placed in its lower-left opening.
- [ ] Walking into the active portal sends the player to `forgotten:forgotten_abyss`.
- [ ] Return portal takes each player back to their own saved entry location.
- [ ] Multiplayer test confirms independent return locations.

## Crossover content
- [ ] New mobs render with their assigned geometry and texture.
- [ ] Spawn rules work in their intended Overworld biomes.
- [ ] Boss abilities and boss rewards work.
- [ ] Crossover weapons and armour appear in inventory with correct names and icons.
- [ ] Ore feature rules generate ores in natural stone/deepslate.
- [ ] Natural ruins generate only on untouched terrain and do not overwrite player builds.
- [ ] All new contracts track and can be claimed.

Record the exact Minecraft retail version, device, enabled experiments and any content-log errors. CI validates files and packaging; it cannot prove in-game gameplay correctness.
