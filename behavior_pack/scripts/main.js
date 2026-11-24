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


// Secret dimension portal: type the exact phrase in normal chat.
const ABYSS_PHRASE = "LET ME IN MOMMY";
const ABYSS_DIMENSION = "forgotten:forgotten_abyss";
const ABYSS_SPAWN = { x: 0.5, y: 66, z: 0.5 };
const abyssBuilt = new Set();

function buildAbyssArrival(dimension) {
  if (abyssBuilt.has(dimension.id)) return;
  const put = (x, y, z, type) => {
    const block = dimension.getBlock({ x, y, z });
    if (block) block.setType(type);
  };
  for (let x = -12; x <= 12; x++) {
    for (let z = -12; z <= 12; z++) {
      const d = x*x + z*z;
      if (d <= 144) put(x, 63, z, "minecraft:deepslate_bricks");
      if (d <= 100) put(x, 62, z, "minecraft:stone");
      if (d <= 64) put(x, 61, z, "minecraft:deepslate");
      if (Math.abs(x) <= 7 && Math.abs(z) <= 7) put(x, 64, z, "minecraft:polished_blackstone_bricks");
    }
  }
  for (let x = -7; x <= 7; x++) for (let z = -7; z <= 7; z++) {
    if (Math.abs(x) === 7 || Math.abs(z) === 7) put(x, 64, z, "minecraft:crying_obsidian");
  }
  for (const [x,z] of [[-6,-6],[6,-6],[-6,6],[6,6]]) {
    for (let y = 65; y <= 68; y++) put(x,y,z,"minecraft:polished_blackstone_bricks");
    put(x,69,z,"minecraft:sea_lantern");
  }
  for (let y = 65; y <= 68; y++) {
    put(-2,y,-10,"minecraft:polished_blackstone_bricks");
    put(2,y,-10,"minecraft:polished_blackstone_bricks");
  }
  put(0,65,-10,"minecraft:crying_obsidian");
  put(0,66,-10,"minecraft:sea_lantern");
  try { dimension.spawnEntity("forgotten:abyss_watcher", {x:0.5,y:66,z:-5.5}); } catch (e) { console.warn("[ForgottenWorld] Guardian spawn: "+e); }
  abyssBuilt.add(dimension.id);
}

world.beforeEvents.chatSend.subscribe((event) => {
  if (event.message.trim() !== ABYSS_PHRASE) return;
  event.cancel = true;
  const player = event.sender;
  system.run(() => {
    try {
      const abyss = world.getDimension(ABYSS_DIMENSION);
      buildAbyssArrival(abyss);
      player.teleport(ABYSS_SPAWN, { dimension: abyss });
      player.sendMessage("§5[The Forgotten World] §dThe Forgotten Abyss has opened.");
    } catch (error) {
      player.sendMessage("§c[The Forgotten World] The portal could not open. Check pack activation and custom-dimension support.");
      console.warn("[ForgottenWorld] Abyss portal error: " + error);
    }
  });
});
