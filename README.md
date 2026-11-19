# The Forgotten World

A lightweight medieval-fantasy RPG add-on for Minecraft Bedrock Edition.

## Packs

- `behavior_pack/` — RPG progression, contracts and persistent player profiles.
- `resource_pack/` — resource pack manifest; custom art and audio are added in later milestones.
- `config/` — guild ranks, item rarity tiers and starter contract definitions.
- `docs/` — project plan and testing instructions.

## Current gameplay

- Persistent player profile: guild points, coins, contract history and active contract progress.
- Eight guild ranks: F, E, D, C, B, A, S and SS.
- Guild Card UI and contract board UI.
- Three starter contracts tracking slime, zombie and skeleton defeats.
- Seven rarity tiers defined in shared configuration: Common, Uncommon, Rare, Epic, Legendary, Mythical and Divine.

## In-game commands

These use Bedrock's `/scriptevent` command and require cheats/operator permissions in the world:

- `/scriptevent fw:guild` — open the guild menu.
- `/scriptevent fw:card` — open the Guild Card.
- `/scriptevent fw:contracts` — open contracts.
- `/scriptevent fw:admin_gp <exactPlayerName> <amount>` — grant GP; the sender must also have the `fw_admin` tag.

## Import and test

1. Import both pack folders into Minecraft Bedrock.
2. Activate both packs in a test world.
3. Enable cheats for the script-event commands.
4. Join the world and run `/scriptevent fw:guild`.
5. Accept a contract, defeat its target mobs, then reopen Contracts to claim the reward.
6. Leave and rejoin to confirm the profile persists.

The current implementation is a playable RPG-system foundation, not a finished content pack. Models, textures, sounds, NPCs, locations and further quest content remain future milestones.
