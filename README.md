# The Forgotten World

A Minecraft Bedrock fantasy RPG add-on built as a Behavior Pack + Resource Pack. GitHub Actions builds the installable `.mcaddon` automatically.

## Playable systems
- Persistent player profiles, guild points, coins and ranks F through SS.
- Guild Card, contract board, six hunt contracts and reward claiming.
- Secret dimension entrance: type exactly `LET ME IN MOMMY` in chat.
- Three floating Abyss regions: Shattered Landing, Ashen Reach and Crystal Deep.
- Guild Guide NPC: interact to travel between regions, open contracts or view your card.
- Generated dungeon chambers, boss dais, lantern pillars and region guardians.

## Creatures
- Abyss Watcher — guardian.
- Ashen Wolf — fast melee creature with custom geometry and its own pixel texture.
- Crystal Golem — heavy guardian with custom geometry and its own pixel texture.
- Void Knight — high-health boss with custom geometry and its own pixel texture.
- Guild Guide — interactive region wayfinder with a custom model and texture.

## Equipment and blocks
- Abyss Scepter and Ashsteel Blade.
- Abyss Helm, Chestplate, Leggings and Boots.
- Custom 3D geometry and attachable assets for the weapon and armor set.
- Abyss Crystal Ore, Moonstone Bricks and Abyss Lamp.
- Shaped crafting recipes for the weapons and armor.

## Install
1. Open the [latest successful GitHub Actions build](https://github.com/jayden1337-9/Forgotten-world-Minecraft-modpack/actions).
2. Select the newest **Build Bedrock Add-on** run for the `main` branch.
3. Download the `ForgottenWorld-...` artifact and extract the ZIP.
4. Open `ForgottenWorld.mcaddon` with Minecraft Bedrock.
5. Create a new test world and activate both The Forgotten World Behavior Pack and Resource Pack.
6. Type `LET ME IN MOMMY` in chat to enter the Abyss.
7. Find the Guild Guide at the Shattered Landing and interact with it to travel.

## Guild commands
- `/scriptevent fw:guild` — open the guild menu.
- `/scriptevent fw:card` — open your Guild Card.
- `/scriptevent fw:contracts` — browse contracts.
- `/scriptevent fw:admin_gp <exactPlayerName> <amount>` — admin grant; sender needs the `fw_admin` tag.

## Build
Push to `main` or manually run **Build Bedrock Add-on** in Actions. The workflow validates every JSON file, packages the Behavior Pack and Resource Pack, and uploads the `.mcaddon` artifact. Version tags beginning with `v` publish a GitHub Release.

## Validation
The current CI build validates JSON and successfully packages the add-on. In-game behavior still needs testing on the target retail Bedrock version; report errors with the exact game version and content-log message.

See `docs/ABYSS_REGIONS.md`, `docs/CONTENT_CATALOG.md` and `docs/PROJECT_PLAN.md` for the current content.
