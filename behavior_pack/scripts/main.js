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
  { id: "skeleton_watch", name: "Ranger's Watch", description: "Defeat 3 skeletons.", entity: "minecraft:skeleton", goal: 3, gp: 55, coins: 80 },
  { id: "ashen_wolves", name: "Ashen Hunt", description: "Defeat 4 Ashen Wolves.", entity: "forgotten:ash_wolf", goal: 4, gp: 110, coins: 140 },
  { id: "crystal_guard", name: "Crystal Breaker", description: "Defeat 3 Crystal Golems.", entity: "forgotten:crystal_golem", goal: 3, gp: 180, coins: 240 },
  { id: "knight_fall", name: "Knightfall", description: "Defeat a Void Knight.", entity: "forgotten:void_knight", goal: 1, gp: 350, coins: 500 }
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


// Expanded Abyss: three islands, two dungeon regions and an interactive wayfinder.
const ABYSS_PHRASE = "LET ME IN MOMMY";
const ABYSS_DIMENSION = "forgotten:forgotten_abyss";
const ABYSS_REGIONS = [
 {name:"The Shattered Landing",id:"hub",x:0,z:0,floor:"minecraft:deepslate_bricks",trim:"minecraft:polished_blackstone_bricks"},
 {name:"Ashen Reach",id:"ashen",x:144,z:0,floor:"minecraft:blackstone",trim:"minecraft:polished_blackstone_bricks"},
 {name:"Crystal Deep",id:"crystal",x:-144,z:0,floor:"minecraft:deepslate",trim:"minecraft:amethyst_block"}
];
const builtRegions = new Set();
function abyssSet(dim,x,y,z,type){try{const b=dim.getBlock({x,y,z});if(b)b.setType(type);}catch(e){}}
function abyssEntity(dim,type,loc,r=12){try{if(dim.getEntities({type,location:loc,maxDistance:r}).length===0)dim.spawnEntity(type,loc);}catch(e){console.warn("[ForgottenWorld] spawn "+type+": "+e);}}
function buildAbyssRegion(dim,r){
 if(builtRegions.has(r.id))return;
 const {x:cx,z:cz}=r;
 // Floating island and raised plaza.
 for(let dx=-16;dx<=16;dx++)for(let dz=-16;dz<=16;dz++){
  const d=dx*dx+dz*dz;
  if(d<=256)abyssSet(dim,cx+dx,63,cz+dz,r.floor);
  if(d<=196)abyssSet(dim,cx+dx,62,cz+dz,"minecraft:stone");
  if(d<=100)abyssSet(dim,cx+dx,61,cz+dz,"minecraft:deepslate");
  if(Math.abs(dx)<=5&&Math.abs(dz)<=5)abyssSet(dim,cx+dx,64,cz+dz,r.trim);
 }
 for(const [dx,dz] of [[-9,-9],[9,-9],[-9,9],[9,9]]){
  for(let y=65;y<=69;y++)abyssSet(dim,cx+dx,y,cz+dz,r.trim);
  abyssSet(dim,cx+dx,70,cz+dz,"minecraft:sea_lantern");
 }
 // Dungeon footprint, entrance arch, chambers and boss dais.
 const dx0=cx,dz0=cz-25;
 for(let dx=-7;dx<=7;dx++)for(let dz=-9;dz<=9;dz++){
  abyssSet(dim,dx0+dx,59,dz0+dz,r.floor);
  if(Math.abs(dx)===7||Math.abs(dz)===9)for(let y=60;y<=64;y++)abyssSet(dim,dx0+dx,y,dz0+dz,r.trim);
 }
 for(const [dx,dz] of [[-5,-6],[5,-6],[-5,0],[5,0],[-5,6],[5,6]]){
  for(let y=60;y<=64;y++)abyssSet(dim,dx0+dx,y,dz0+dz,r.trim);
  abyssSet(dim,dx0+dx,65,dz0+dz,"minecraft:sea_lantern");
 }
 for(let dx=-2;dx<=2;dx++)for(let dz=-2;dz<=2;dz++)abyssSet(dim,dx0+dx,60,dz0+dz,"minecraft:chiseled_deepslate");
 for(let y=60;y<=63;y++)abyssSet(dim,cx,y,dz0,"minecraft:crying_obsidian");
 if(r.id==="hub"){
  abyssEntity(dim,"forgotten:guild_guide",{x:5.5,y:65,z:2.5},16);
  abyssEntity(dim,"forgotten:abyss_watcher",{x:-5.5,y:65,z:-5.5},18);
 }else if(r.id==="ashen"){
  abyssEntity(dim,"forgotten:ash_wolf",{x:cx+5.5,y:65,z:cz+4.5},16);
  abyssEntity(dim,"forgotten:ash_wolf",{x:cx-5.5,y:65,z:cz-4.5},16);
  abyssEntity(dim,"forgotten:void_knight",{x:cx,y:60,z:dz0},18);
 }else{
  abyssEntity(dim,"forgotten:crystal_golem",{x:cx+5.5,y:65,z:cz+4.5},16);
  abyssEntity(dim,"forgotten:crystal_golem",{x:cx-5.5,y:65,z:cz-4.5},16);
  abyssEntity(dim,"forgotten:void_knight",{x:cx,y:60,z:dz0},18);
 }
 builtRegions.add(r.id);
}
async function openAbyssWayfinder(player){
 const result=await new ActionFormData().title("Abyss Wayfinder")
 .body("Choose a region. The dungeons are dangerous; take contracts before leaving.")
 .button("The Shattered Landing\nGuild hub")
 .button("Ashen Reach\nAshen Wolves and dungeon")
 .button("Crystal Deep\nCrystal Golems and dungeon")
 .button("Guild Contracts").button("Guild Card").show(player);
 if(result.canceled)return;
 if(result.selection===3)return showContracts(player);
 if(result.selection===4)return showCard(player);
 const r=ABYSS_REGIONS[result.selection];if(!r)return;
 const dim=world.getDimension(ABYSS_DIMENSION);buildAbyssRegion(dim,r);
 player.teleport({x:r.x+0.5,y:66,z:r.z+0.5},{dimension:dim});
 player.sendMessage("§5[Wayfinder] §dRegion discovered: §f"+r.name);
}
world.afterEvents.playerInteractWithEntity.subscribe(({player,target})=>{
 if(target.typeId==="forgotten:guild_guide")openAbyssWayfinder(player);
});
world.beforeEvents.chatSend.subscribe(event=>{
 if(event.message.trim()!==ABYSS_PHRASE)return;
 event.cancel=true;
 const player=event.sender;
 system.run(()=>{
  try{
   const dim=world.getDimension(ABYSS_DIMENSION);
   buildAbyssRegion(dim,ABYSS_REGIONS[0]);
   player.teleport({x:0.5,y:66,z:0.5},{dimension:dim});
   player.sendMessage("§5[The Forgotten World] §dThe Forgotten Abyss has opened. Find the Guild Guide.");
  }catch(error){
   player.sendMessage("§c[The Forgotten World] The portal could not open. Check pack activation and custom-dimension support.");
   console.warn("[ForgottenWorld] Abyss portal error: "+error);
  }
 });
});
