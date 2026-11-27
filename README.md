# The Forgotten World

A Minecraft Bedrock fantasy RPG add-on with a shared Overworld crossover, the Forgotten Abyss, guild progression and custom content. GitHub Actions builds the installable `.mcaddon`.

## Core systems
- Persistent player profiles, guild points, coins and ranks F through SS.
- Guild Card, contracts, kill tracking, boss rewards and claimable contracts.
- Craftable Abyss Portal: 4x5 Abyss Portal Frame with an Abyss Keystone activation block; no chat phrase.
- Three floating Abyss regions: Shattered Landing, Ashen Reach and Crystal Deep.
- Guild Guide wayfinder, generated dungeons and boss arenas.
- Natural Overworld ruins are generated on a 128-block grid only when the footprint is untouched natural terrain.

## Animation and visual polish
- Shared idle and movement animations across the custom creature roster.
- Attack wind-up animation for humanoid creatures and bosses.
- Ashen Wolf has a four-leg gait and animated tail.
- Verdant Slime and King Slime squash and stretch while moving.
- Eye of the Void slowly rotates and hovers.
- Entity animation references are validated during CI builds.

## Crossover creatures
- Terraria-inspired: Verdant Slime, Bone Archer, King Slime, Skeletron and Wall of Flesh; Eye of the Void is an original crossover boss.
- Hollow Knight-inspired: Hallownest Scout, Hornet Guardian, False Knight, Soul Master, Mantis Lord and Failed Champion.
- Elden Ring-inspired: Limgrave Soldier, Stormveil Knight, Tree Sentinel, Margit, Godrick and Malenia.
- Existing Forgotten World creatures: Abyss Watcher, Ashen Wolf, Crystal Golem, Void Knight and Guild Guide.
- The crossover entities have Bedrock geometry, biome spawn rules, loot and boss pulse attacks.

## Crossover equipment
- Terraria-inspired: Copper Shortsword, Night's Edge, Terra Blade, Zenith and Demon Scythe.
- Hollow Knight-inspired: Old Nail, Pure Nail, Hornet's Needle, Dream Nail, King's Brand and Shade Cloak.
- Elden Ring-inspired: Limgrave Greatsword, Stormveil Greatsword, Erdtree Seal, Moonveil, Rivers of Blood and Blasphemous Blade.
- Armour: Shadow Chestplate, Wanderer's Cloak and Carian Knight Chestplate.
- Existing Abyss Scepter, Ashsteel Blade and Abyss armour remain available.

## Crossover blocks and ores
- Demonite Ore, Hellstone Ore, Chlorophyte Ore.
- Pale Ore and Lifeblood Crystal.
- Smithing Stone Ore and Glintstone Ore.
- Runic Bricks and Frost Crystal.
- Existing Abyss Crystal Ore, Moonstone Bricks, Abyss Lamp and portal blocks.
- Ore feature rules distribute the new ores through natural Overworld stone and deepslate layers.

## Install
1. Open the [latest GitHub Actions build](https://github.com/jayden1337-9/Forgotten-world-Minecraft-modpack/actions).
2. Select the newest successful **Build Bedrock Add-on** run for the `main` branch.
3. Download the `ForgottenWorld-...` artifact and extract the ZIP.
4. Open `ForgottenWorld.mcaddon` with Minecraft Bedrock.
5. Create a test world and activate both The Forgotten World Behavior Pack and Resource Pack.

### VMOSCloud manual install (when Android's .mcaddon importer crashes)
The repository includes `tools/install-vmoscloud.sh`. Download that script and the latest `.mcaddon` to the cloud phone, then run it from a Toolbox-rooted Termux shell:

```sh
su
bash /storage/emulated/0/Download/install-vmoscloud.sh "/storage/emulated/0/Download/ForgottenWorld.mcaddon"
```

The installer stops Minecraft, extracts both packs into Application storage, restores the Minecraft app owner and SELinux labels, and clears only the pack-manifest cache so Bedrock rescans them. Do not run it while Minecraft is open.

## Guild commands
- `/scriptevent fw:guild` — open the Adventurer Guild.
- `/scriptevent fw:card` — open your Guild Card.
- `/scriptevent fw:contracts` — browse contracts.
- `/scriptevent fw:admin_gp <exactPlayerName> <amount>` — admin grant; sender needs the `fw_admin` tag.

## Build and validation
Push to `main` or manually run **Build Bedrock Add-on** in Actions. CI validates JSON, JavaScript syntax, client-entity geometry/texture references, animation/controller references, pack UUID dependencies, and packaging. In-game behaviour, spawn rates and terrain placement still need testing on the target retail Bedrock version.
