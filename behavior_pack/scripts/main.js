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
  { id: "knight_fall", name: "Knightfall", description: "Defeat a Void Knight.", entity: "forgotten:void_knight", goal: 1, gp: 350, coins: 500 },
  { id: "verdant_slimes", name: "Green Tide", description: "Defeat 6 Verdant Slimes.", entity: "forgotten:verdant_slime", goal: 6, gp: 65, coins: 90 },
  { id: "bone_archers", name: "Bone Line", description: "Defeat 4 Bone Archers.", entity: "forgotten:bone_archer", goal: 4, gp: 90, coins: 120 },
  { id: "hallownest_scouts", name: "Lost Colony", description: "Defeat 5 Hallownest Scouts.", entity: "forgotten:hallownest_scout", goal: 5, gp: 110, coins: 150 },
  { id: "hornet_guardian", name: "Needle in the Dark", description: "Defeat the Hornet Guardian.", entity: "forgotten:hornet_guardian", goal: 1, gp: 220, coins: 300 },
  { id: "failed_champion", name: "Broken Shell", description: "Defeat the Failed Champion.", entity: "forgotten:failed_champion", goal: 1, gp: 550, coins: 800 },
  { id: "limgrave_soldiers", name: "Limgrave Patrol", description: "Defeat 5 Limgrave Soldiers.", entity: "forgotten:limgrave_soldier", goal: 5, gp: 100, coins: 140 },
  { id: "stormveil_knights", name: "Stormveil Breach", description: "Defeat 3 Stormveil Knights.", entity: "forgotten:stormveil_knight", goal: 3, gp: 160, coins: 220 },
  { id: "tree_sentinel", name: "Golden Sentinel", description: "Defeat the Tree Sentinel.", entity: "forgotten:tree_sentinel", goal: 1, gp: 850, coins: 1200 },
  { id: "eye_of_void", name: "Watcher in the Sky", description: "Defeat the Eye of the Void.", entity: "forgotten:eye_of_the_void", goal: 1, gp: 300, coins: 450 }
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
  const bossRewards = {
    "forgotten:eye_of_the_void": [250, 350],
    "forgotten:failed_champion": [500, 700],
    "forgotten:tree_sentinel": [750, 1000],
    "forgotten:void_knight": [350, 500]
  };
  const bossReward = bossRewards[event.deadEntity.typeId];
  if (bossReward) {
    addRewards(player, bossReward[0], bossReward[1]);
    player.sendMessage("§dBoss defeated! §7A guild record has been added.");
  }
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
  abyssEntity(dim,"forgotten:eye_of_the_void",{x:0.5,y:65,z:-31.5},18);
 }else if(r.id==="ashen"){
  abyssEntity(dim,"forgotten:ash_wolf",{x:cx+5.5,y:65,z:cz+4.5},16);
  abyssEntity(dim,"forgotten:tree_sentinel",{x:cx-5.5,y:65,z:cz-4.5},16);
  abyssEntity(dim,"forgotten:stormveil_knight",{x:cx+2.5,y:65,z:cz+8.5},16);
  abyssEntity(dim,"forgotten:void_knight",{x:cx,y:60,z:dz0},18);
 }else{
  abyssEntity(dim,"forgotten:crystal_golem",{x:cx+5.5,y:65,z:cz+4.5},16);
  abyssEntity(dim,"forgotten:hallownest_scout",{x:cx-5.5,y:65,z:cz-4.5},16);
  abyssEntity(dim,"forgotten:hornet_guardian",{x:cx+2.5,y:65,z:cz+8.5},16);
  abyssEntity(dim,"forgotten:failed_champion",{x:cx,y:60,z:dz0},18);
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

// Abyss portal system. Build a 4x5 frame from Abyss Portal Frame blocks,
// then place one Abyss Keystone in the lower-left interior space to activate it.
const PORTAL_FRAME = "forgotten:abyss_portal_frame";
const PORTAL_KEYSTONE = "forgotten:abyss_keystone";
const PORTAL_FIELD = "forgotten:abyss_portal";
const portalCooldown = new Map();

function blockAt(dim, p) {
  try { return dim.getBlock(p); } catch { return undefined; }
}
function isFrame(dim, p) {
  const block = blockAt(dim, p);
  return !!block && block.typeId === PORTAL_FRAME;
}
function portalFrameValid(dim, origin, axis) {
  for (let u = -1; u <= 2; u++) for (let v = -1; v <= 3; v++) {
    if (u >= 0 && u <= 1 && v >= 0 && v <= 2) continue;
    const p = axis === "x"
      ? { x: origin.x + u, y: origin.y + v, z: origin.z }
      : { x: origin.x, y: origin.y + v, z: origin.z + u };
    if (!isFrame(dim, p)) return false;
  }
  return true;
}
function fillPortal(dim, origin, axis) {
  for (let u = 0; u <= 1; u++) for (let v = 0; v <= 2; v++) {
    const p = axis === "x"
      ? { x: origin.x + u, y: origin.y + v, z: origin.z }
      : { x: origin.x, y: origin.y + v, z: origin.z + u };
    const block = blockAt(dim, p);
    if (block) block.setType(PORTAL_FIELD);
  }
}
function tryActivateAbyssPortal(dim, origin) {
  for (const axis of ["x", "z"]) {
    if (!portalFrameValid(dim, origin, axis)) continue;
    fillPortal(dim, origin, axis);
    return axis;
  }
  return undefined;
}
function buildAbyssReturnPortal(dim) {
  const origin = { x: -1, y: 65, z: 12 };
  for (let u = -1; u <= 2; u++) for (let v = -1; v <= 3; v++) {
    const p = { x: origin.x + u, y: origin.y + v, z: origin.z };
    const isOpening = u >= 0 && u <= 1 && v >= 0 && v <= 2;
    const block = blockAt(dim, p);
    if (block) block.setType(isOpening ? PORTAL_FIELD : PORTAL_FRAME);
  }
}
function returnPointFromPortal(origin, axis) {
  return axis === "x"
    ? { x: origin.x + 0.5, y: origin.y, z: origin.z + 2.5 }
    : { x: origin.x + 2.5, y: origin.y, z: origin.z + 0.5 };
}

world.afterEvents.playerPlaceBlock.subscribe(({ block }) => {
  if (!block || block.typeId !== PORTAL_KEYSTONE) return;
  const axis = tryActivateAbyssPortal(block.dimension, block.location);
  const nearby = world.getPlayers().find(p => p.dimension.id === block.dimension.id &&
    Math.abs(p.location.x - block.location.x) <= 6 &&
    Math.abs(p.location.y - block.location.y) <= 6 &&
    Math.abs(p.location.z - block.location.z) <= 6);
  if (nearby) nearby.sendMessage(axis
    ? "§5[Abyss Portal] §dThe frame awakens. Step inside to travel."
    : "§cThe Abyss Keystone needs a complete 4x5 frame of Abyss Portal Frame blocks.");
});

function transferThroughPortal(player, portalBlock) {
  const now = system.currentTick;
  if (now < (portalCooldown.get(player.id) ?? 0)) return;
  portalCooldown.set(player.id, now + 80);

  if (player.dimension.id === ABYSS_DIMENSION) {
    let target = { dimension: "minecraft:overworld", x: 0.5, y: 80, z: 0.5 };
    try {
      const saved = player.getDynamicProperty("fw:portal_return");
      if (typeof saved === "string") {
        const data = JSON.parse(saved);
        if (data && typeof data.dimension === "string" &&
            Number.isFinite(data.x) && Number.isFinite(data.y) && Number.isFinite(data.z)) target = data;
      }
    } catch {}
    try {
      player.teleport({ x: target.x, y: target.y, z: target.z }, {
        dimension: world.getDimension(target.dimension)
      });
      player.sendMessage("§7You return through the Abyss Portal.");
    } catch (error) {
      player.sendMessage("§cThe return portal could not find your previous location.");
      console.warn("[ForgottenWorld] return teleport: " + error);
    }
    return;
  }

  const loc = portalBlock.location;
  const axis = (blockAt(player.dimension, {x:loc.x+1,y:loc.y,z:loc.z})?.typeId === PORTAL_FIELD || blockAt(player.dimension, {x:loc.x-1,y:loc.y,z:loc.z})?.typeId === PORTAL_FIELD) ? "x" : "z";
  const safe = returnPointFromPortal(loc, axis);
  try {
    player.setDynamicProperty("fw:portal_return", JSON.stringify({
      dimension: player.dimension.id, x: safe.x, y: safe.y, z: safe.z
    }));
    const abyss = world.getDimension(ABYSS_DIMENSION);
    buildAbyssRegion(abyss, ABYSS_REGIONS[0]);
    buildAbyssReturnPortal(abyss);
    player.teleport({ x: 0.5, y: 66, z: 0.5 }, { dimension: abyss });
    player.sendMessage("§5[The Forgotten World] §dYou enter the Forgotten Abyss.");
  } catch (error) {
    player.sendMessage("§cThe Abyss Portal could not open. Check that the custom dimension is enabled.");
    console.warn("[ForgottenWorld] portal teleport: " + error);
  }
}
system.runInterval(() => {
  for (const player of world.getPlayers()) {
    const loc = player.location, dim = player.dimension;
    const feet = blockAt(dim, { x: Math.floor(loc.x), y: Math.floor(loc.y), z: Math.floor(loc.z) });
    const head = blockAt(dim, { x: Math.floor(loc.x), y: Math.floor(loc.y + 1), z: Math.floor(loc.z) });
    const portal = feet?.typeId === PORTAL_FIELD ? feet : head?.typeId === PORTAL_FIELD ? head : undefined;
    if (portal) transferThroughPortal(player, portal);
  }
}, 10);
console.warn("[ForgottenWorld] Abyss portal system loaded. Phrase entrance disabled.");

// Boss ability pulses: the crossover bosses have distinct arena attacks.
const bossAbilityCooldown = new Map();
const BOSS_ABILITIES = {
 "forgotten:eye_of_the_void": {interval:100,radius:5,damage:6,message:"§5The Eye of the Void releases a pulse!"},
 "forgotten:failed_champion": {interval:140,radius:4,damage:9,message:"§cThe Failed Champion slams the ground!"},
 "forgotten:tree_sentinel": {interval:120,radius:3.5,damage:12,message:"§6The Tree Sentinel charges!"},
 "forgotten:void_knight": {interval:130,radius:4,damage:8,message:"§8The Void Knight unleashes a shockwave!"}
};
system.runInterval(()=>{
 const dimensions=["minecraft:overworld","minecraft:nether","minecraft:the_end",ABYSS_DIMENSION];
 for(const dimensionId of dimensions){
  let dim;try{dim=world.getDimension(dimensionId);}catch{continue;}
  for(const [type,ability] of Object.entries(BOSS_ABILITIES)){
   let bosses=[];try{bosses=dim.getEntities({type});}catch{}
   for(const boss of bosses){
    const last=bossAbilityCooldown.get(boss.id)??0;
    if(system.currentTick-last<ability.interval)continue;
    bossAbilityCooldown.set(boss.id,system.currentTick);
    for(const player of world.getPlayers()){
     if(player.dimension.id!==dimensionId)continue;
     const dx=player.location.x-boss.location.x,dy=player.location.y-boss.location.y,dz=player.location.z-boss.location.z;
     if(dx*dx+dy*dy+dz*dz<=ability.radius*ability.radius){
      try{player.applyDamage(ability.damage);player.sendMessage(ability.message);}catch{}
     }
    }
   }
  }
 }
},20);

