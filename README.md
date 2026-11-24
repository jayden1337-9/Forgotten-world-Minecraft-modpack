# The Forgotten World

A Minecraft Bedrock fantasy RPG add-on with guild progression, custom content and a secret dimension.

## Included
- Behavior Pack + Resource Pack
- Persistent profiles, coins, guild points and ranks F through SS
- Guild Card and three starter contracts
- Custom void dimension `forgotten:forgotten_abyss`
- Secret chat phrase: `LET ME IN MOMMY`
- First custom modeled guardian: Abyss Watcher
- GitHub Actions builds a downloadable `.mcaddon` on every push or manual run

## Build
Open the **Actions** tab and run **Build Bedrock Add-on**, or push a commit. Download the generated artifact from the workflow run. Push a version tag beginning with `v` to publish a GitHub Release.

## Install
1. Download `ForgottenWorld.mcaddon` from Actions artifacts or Releases.
2. Open it with Minecraft Bedrock.
3. Create a new test world and activate both packs.
4. Enable any experiments requested by Minecraft.
5. Type `LET ME IN MOMMY` in chat to enter the Forgotten Abyss.

## Existing guild commands
- `/scriptevent fw:guild` — guild menu.
- `/scriptevent fw:card` — Guild Card.
- `/scriptevent fw:contracts` — contracts.
- `/scriptevent fw:admin_gp <exactPlayerName> <amount>` — admin grant; sender needs `fw_admin` tag.

The full RPG content roadmap is in `docs/PROJECT_PLAN.md`. This is an actively developed foundation, not yet the complete planned content set.
