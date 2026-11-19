# Testing checklist

- [ ] Import Behavior Pack and Resource Pack into a clean Bedrock test world.
- [ ] Confirm both packs activate without manifest errors.
- [ ] Confirm the script reports `[ForgottenWorld] RPG systems loaded.` in the Content Log.
- [ ] Run `/scriptevent fw:guild` and open the Guild Card.
- [ ] Accept Slime Survey and defeat five slimes.
- [ ] Reopen Contracts and claim the completed reward.
- [ ] Confirm GP, coins, rank and completed count update.
- [ ] Leave and rejoin; confirm profile values persist.
- [ ] In a test world only, add the `fw_admin` tag to an operator and test the GP grant command.
- [ ] Test in multiplayer with two players to confirm profiles remain separate.

## Compatibility notes

The Behavior Pack uses stable `@minecraft/server` 2.10.0 and `@minecraft/server-ui` 2.2.0 dependencies. The official creator documentation currently lists these stable modules for recent Bedrock releases. Record the exact retail game version used for every test before publishing.
