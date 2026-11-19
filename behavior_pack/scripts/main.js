import { world, system } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";

const PROFILE_KEY = "fw:profile";
const RANKS = [
  { id: "F", name: "F-Rank", gp: 0 },
  { id: "E", name: "E-Rank", gp: 100 },
  { id: "D", name: "D-Rank", gp: 300 },
  { id: "C", name: "C-Rank", gp: 700 },
  { id: "B", name: "B-Rank", gp: 1500 },
  { id: "A", name: "A-Rank", gp: 3000 },
  { id: "S", name: "S-Rank", gp: 6000 },
  { id: "SS", name: "SS-Rank", gp: 12000 }
];

const QUESTS = [
  { id: "slime_survey", name: "Slime Survey", description: "Defeat 5 slimes.", entity: "minecraft:slime", goal: 5, gp: 35, coins: 50 },
  { id: "zombie_patrol", name: "Night Patrol", description: "Defeat 5 zombies.", entity: "minecraft:zombie", goal: 5, gp: 45, coins: 65 },
  { id: "skeleton_watch", name: "Ranger's Watch", description: "Defeat 3 skeletons.", entity: "minecraft:skeleton", goal: 3, gp: 55, coins: 80 }
];

function freshProfile() {
  return { gp: 0, coins: 0, completed: 0, active: {}, claimed: [], joinedAt: Date.now() };
}

function getProfile(player) {
  try {
    const raw = player.getDynamicProperty(PROFILE_KEY);
    if (typeof raw === "string") {
      const data = JSON.parse(raw);
      return { ...freshProfile(), ...data, active: data.active ?? {}, claimed: data.claimed ?? [] };
    }
  } catch (error) {
    console.warn("[ForgottenWorld] Could not read profile: " + error);
  }
  return freshProfile();
}

function saveProfile(player, profile) {
  try {
    player.setDynamicProperty(PROFILE_KEY, JSON.stringify(profile));
  } catch (error) {
    player.sendMessage("§cYour profile could not be saved. Please report this in the project issue tracker.");
    console.warn("[ForgottenWorld] Could not save profile: " + error);
  }
}

function getRank(gp) {
  let rank = RANKS[0];
  for (const candidate of RANKS) if (gp >= candidate.gp) rank = candidate;
  return rank;
}

function nextRank(gp) {
  return RANKS.find(rank => rank.gp > gp) ?? null;
}

function addRewards(player, gp, coins) {
  const profile = getProfile(player);
  profile.gp += gp;
  profile.coins += coins;
  saveProfile(player, profile);
  const rank = getRank(profile.gp);
  player.sendMessage("§6+" + gp + " GP §7| §e+" + coins + " coins");
  player.sendMessage("§7Guild standing: §f" + rank.name);
}

async function showCard(player) {
  const profile = getProfile(player);
  const rank = getRank(profile.gp);
  const next = nextRank(profile.gp);
  const body = [
    "§6THE FORGOTTEN WORLD",
    "§7Adventurer Guild Card",
    "",
    "§fRank: §e" + rank.name,
    "§fGuild Points: §b" + profile.gp,
    "§fCoins: §6" + profile.coins,
    "§fContracts completed: §a" + profile.completed,
    "",
    next ? "§7Next rank: " + next.name + " (" + (next.gp - profile.gp) + " GP needed)" : "§dHighest guild rank reached."
  ].join("\n");
  await new ActionFormData().title("Guild Card").body(body).button("Back").show(player);
}

async function showContracts(player) {
  const profile = getProfile(player);
  const form = new ActionFormData().title("Guild Contracts").body("Choose a contract. Progress is saved to your player profile.");
  for (const quest of QUESTS) {
    const state = profile.active[quest.id];
    const status = state ? (state.progress + "/" + quest.goal + " progress") : (profile.claimed.includes(quest.id) ? "Completed before" : "Available");
    form.button(quest.name + "\n" + quest.description + "\n§7" + status);
  }
  form.button("Back");
  const result = await form.show(player);
  if (result.canceled || result.selection === undefined || result.selection === QUESTS.length) return showGuildMenu(player);
  const quest = QUESTS[result.selection];
  const latest = getProfile(player);
  if (!latest.active[quest.id]) {
    latest.active[quest.id] = { progress: 0 };
    saveProfile(player, latest);
    player.sendMessage("§aAccepted contract: §f" + quest.name);
  } else {
    const state = latest.active[quest.id];
    if (state.progress >= quest.goal) {
      delete latest.active[quest.id];
      latest.claimed.push(quest.id);
      latest.completed += 1;
      latest.gp += quest.gp;
      latest.coins += quest.coins;
      saveProfile(player, latest);
      player.sendMessage("§aContract completed: §f" + quest.name);
      player.sendMessage("§6+" + quest.gp + " GP §7| §e+" + quest.coins + " coins");
      player.sendMessage("§7New guild rank: §f" + getRank(latest.gp).name);
    } else {
      player.sendMessage("§e" + quest.name + ": " + state.progress + "/" + quest.goal);
    }
  }
}

async function showGuildMenu(player) {
  const profile = getProfile(player);
  const rank = getRank(profile.gp);
  const result = await new ActionFormData()
    .title("Adventurer Guild")
    .body("Welcome to the guild.\n\nCurrent rank: " + rank.name + "\nGuild Points: " + profile.gp + "\nCoins: " + profile.coins)
    .button("Guild Card")
    .button("Browse Contracts")
    .button("Close")
    .show(player);
  if (result.canceled) return;
  if (result.selection === 0) return showCard(player);
  if (result.selection === 1) return showContracts(player);
}

world.afterEvents.playerSpawn.subscribe(({ player, initialSpawn }) => {
  if (!initialSpawn) return;
  const profile = getProfile(player);
  saveProfile(player, profile);
  player.sendMessage("§6The Forgotten World §7| §fWelcome, adventurer.");
  player.sendMessage("§7Use §e/scriptevent fw:guild§7 to open the Adventurer Guild.");
});

world.afterEvents.entityDie.subscribe(event => {
  const killer = event.damageSource.damagingEntity;
  if (!killer || killer.typeId !== "minecraft:player") return;
  const player = killer;
  const profile = getProfile(player);
  let changed = false;
  for (const quest of QUESTS) {
    const active = profile.active[quest.id];
    if (active && event.deadEntity.typeId === quest.entity && active.progress < quest.goal) {
      active.progress += 1;
      changed = true;
      if (active.progress === quest.goal) player.sendMessage("§aContract objective complete: §f" + quest.name + "§a. Return to the Guild Contracts menu to claim your reward.");
      else player.sendMessage("§7" + quest.name + ": " + active.progress + "/" + quest.goal);
    }
  }
  if (changed) saveProfile(player, profile);
});

system.afterEvents.scriptEventReceive.subscribe(event => {
  const player = event.sourceEntity;
  if (!player || player.typeId !== "minecraft:player") return;
  if (event.id === "fw:guild") {
    showGuildMenu(player);
    return;
  }
  if (event.id === "fw:card") {
    showCard(player);
    return;
  }
  if (event.id === "fw:contracts") {
    showContracts(player);
    return;
  }
  if (event.id === "fw:admin_gp") {
    if (!player.hasTag("fw_admin")) {
      player.sendMessage("§cYou need the fw_admin tag to use this command.");
      return;
    }
    const [targetName, amountText] = event.message.trim().split(/\s+/);
    const amount = Number(amountText);
    const target = world.getPlayers().find(candidate => candidate.name === targetName);
    if (!target || !Number.isSafeInteger(amount) || amount < 1 || amount > 100000) {
      player.sendMessage("§cUsage: /scriptevent fw:admin_gp <exactPlayerName> <1-100000>");
      return;
    }
    addRewards(target, amount, 0);
    player.sendMessage("§aGranted " + amount + " GP to " + target.name + ".");
  }
});

console.warn("[ForgottenWorld] RPG systems loaded.");
