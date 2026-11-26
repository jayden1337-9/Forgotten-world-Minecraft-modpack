# The Forgotten World

A Minecraft Bedrock fantasy RPG add-on with a shared Overworld crossover, the Forgotten Abyss, guild progression and custom content. GitHub Actions builds the installable `.mcaddon`.

## Core systems
- Persistent player profiles, guild points, coins and ranks F through SS.
- Guild Card, contracts, kill tracking, boss rewards and claimable contracts.
- Craftable Abyss Portal: 4x5 Abyss Portal Frame with an Abyss Keystone activation block; no chat phrase.
- Three floating Abyss regions: Shattered Landing, Ashen Reach and Crystal Deep.
- Guild Guide wayfinder, generated dungeons and boss arenas.
- Natural Overworld ruins are generated on a 128-block grid only when the footprint is untouched natural terrain.

## Crossover creatures
- Terraria-inspired: Verdant Slime, Bone Archer, King Slime, Skeletron and Wall of Flesh; Eye of the Void is an original crossover boss.
- Hollow Knight-inspired: Hallownest Scout, Hornet Guardian, False Knight, Soul Master, Mantis Lord and Failed Champion.
- Elden Ring-inspired: Limgrave Soldier, Stormveil Knight, Tree Sentinel, Margit, Godrick and Malenia.
- Existing Forgotten World creatures: Abyss Watcher, Ashen Wolf, Crystal Golem, Void Knight and Guild Guide.
- The crossover entities have dedicated Bedrock geometry, biome spawn rules, loot and boss pulse attacks.

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
1. Open the [latest successful GitHub Actions build](https://github.com/jayden1337-9/Forgotten-world-Minecraft-modpack/actions).
2. Select the newest **Build Bedrock Add-on** run for the `main` branch.
3. Download the `ForgottenWorld-...` artifact and extract the ZIP.
4. Open `ForgottenWorld.mcaddon` with Minecraft Bedrock.
5. Create a test world and activate both The Forgotten World Behavior Pack and Resource Pack.
6. Craft the portal frame and Keystone, build the 4x5 frame, and place the Keystone in the lower-left interior block.
7. Explore the normal Overworld for crossover mobs, ores and ruins. Use the Guild Guide after entering the Abyss.

## Guild commands
- `/scriptevent fw:guild` — open the Adventurer Guild.
- `/scriptevent fw:card` — open your Guild Card.
- `/scriptevent fw:contracts` — browse contracts.
- `/scriptevent fw:admin_gp <exactPlayerName> <amount>` — admin grant; sender needs the `fw_admin` tag.

## Build and validation
Push to `main` or manually run **Build Bedrock Add-on** in Actions. CI validates every JSON file, checks JavaScript syntax, packages both packs and uploads the `.mcaddon` artifact. In-game behaviour, spawn rates and terrain placement still need testing on the target retail Bedrock version.
