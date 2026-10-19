import { build } from "esbuild-wasm";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("../", import.meta.url));
const result = await build({
  stdin: {
    resolveDir: root,
    contents: `
import assert from 'node:assert/strict';
import {makeCombat,enemyIntentFor,scaleEnemy,ENEMIES,COMBAT_TICK_MS,readyCreatureRespawns} from './src/lib/game/combat';
import {combatSlice,finishEnemyTurn,winCombat} from './src/lib/game/store/combat';
import {worldSlice} from './src/lib/game/store/world';
import {defaultSave} from './src/lib/game/save';
import {UI_SEED,armAutoAttack,clearCombatTimer} from './src/lib/game/store/persist';
import {maxHitpoints,xpForLevel} from './src/lib/game/xp';
import {npcWalkable} from './src/lib/game/npc-brain';
import {WORLD_PACK} from './src/lib/game/data/layout';
const originalRandom=Math.random,originalSetTimeout=globalThis.setTimeout,originalClearTimeout=globalThis.clearTimeout;
let now=0,id=0;const timers=new Map();globalThis.setTimeout=(fn,delay=0)=>{const key=++id;timers.set(key,{fn,at:now+delay});return key;};globalThis.clearTimeout=key=>timers.delete(key);
const advance=ms=>{const end=now+ms;let count=0;while(true){const next=[...timers].filter(([,t])=>t.at<=end).sort((a,b)=>a[1].at-b[1].at)[0];if(!next)break;assert(++count<1000);now=next[1].at;timers.delete(next[0]);next[1].fn();}now=end;};
let s;const get=()=>s,set=p=>Object.assign(s,typeof p==='function'?p(s):p);const actions={...combatSlice(set,get),...worldSlice(set,get)};
const reset=(enemy='boar')=>{clearCombatTimer();timers.clear();Math.random=()=>.01;s={...defaultSave(),...UI_SEED,...actions,named:true,atHome:false};s.combat=makeCombat(enemy,s.hp,{skills:s.skills,playerMax:maxHitpoints(s.skills),atX:s.gnomeX+40,atY:s.gnomeY});s.combat.enemyHp=100;s.combat.enemyMax=100;s.combat.enemyDmg=1;armAutoAttack(get);};
const tests=[];const test=(name,fn)=>{try{fn();tests.push(name)}catch(e){throw Error(name+': '+e.message)}};
try{
test('training makes familiar world creatures easier without silently scaling them up',()=>{reset();const high=Object.fromEntries(Object.keys(s.skills).map(id=>[id,xpForLevel(99)]));assert.deepEqual(scaleEnemy('rat',high),scaleEnemy('rat',s.skills));});
test('world enemy spawns stay on walkable ground outside solid buildings',()=>{for(const p of WORLD_PACK)assert(npcWalkable(p.x,p.y),p.id+' spawn');});
test('one engagement repeats attacks on a clock without further taps',()=>{reset();assert(s.combat.autoAttack);advance(599);assert.equal(s.combat.enemyHp,100);advance(1);const first=s.combat.enemyHp;assert(first<100);advance(1800);assert.equal(s.combat.enemyHp,first);advance(600);assert(s.combat.enemyHp<first);assert.equal(s.combat.tick,5);});
test('stopping player attacks never freezes the enemy clock',()=>{reset();s.setCombatAuto(false);const hp=s.hp;advance(1800);assert.equal(s.combat.enemyHp,100);assert(s.hp<hp);const due=s.combat.nextEnemyTick;s.setCombatAuto(true);advance(600);assert(s.combat.enemyHp<100);assert.equal(s.combat.nextEnemyTick,due);});
test('repeated attack and special taps cannot bypass attack timing or spend energy twice',()=>{reset('captain');for(let i=0;i<30;i++)s.combatAttack('power');assert.equal(s.combat.enemyHp,100);assert.equal(s.combat.stamina,3);advance(600);assert.equal(s.combat.stamina,1);const hp=s.combat.enemyHp;for(let i=0;i<30;i++)s.combatAttack();advance(1800);assert.equal(s.combat.enemyHp,hp);advance(600);assert(s.combat.enemyHp<hp);assert.equal(s.combat.stamina,2);});
test('food has its own cooldown and delays the player without delaying incoming hits',()=>{reset();s.hp=4;s.combat.playerHp=4;s.bread=4;const due=s.combat.nextEnemyTick;s.combatEat();assert.equal(s.hp,10);assert.equal(s.bread,3);assert.equal(s.combat.nextAttackTick,3);assert.equal(s.combat.nextEnemyTick,due);s.combat.playerHp=4;s.combatEat();assert.equal(s.bread,3);advance(1200);assert.equal(s.combat.enemyHp,100);advance(600);assert(s.combat.enemyHp<100);assert(s.combat.round>1);});
test('food is not wasted at full health and bread is preferred over cake',()=>{reset();const bread=s.bread,honey=s.honey;s.combatEat();assert.equal(s.bread,bread);s.combat.playerHp=4;s.hp=4;s.combatEat();assert.equal(s.bread,bread-1);assert.equal(s.honey,honey);});
test('guard mitigates one hit, has a cooldown and does not pause the opponent',()=>{reset();s.combat.enemyDmg=6;s.setCombatAuto(false);s.combatGuard();const due=s.combat.nextEnemyTick;assert.equal(s.combat.guardReadyTick,6);s.combatGuard();assert.equal(s.combat.guardReadyTick,6);advance(1800);assert(s.hp>=8);assert(!s.combat.guarding);assert(s.combat.counterReady);assert(s.combat.nextEnemyTick>due);s.combatGuard();assert(!s.combat.guarding);});
test('XP is awarded for damage actually dealt in the selected combat style',()=>{reset();s.setCombatStyle('defence');advance(600);assert(s.combat.sessionXp.defence>0);assert.equal(s.combat.sessionXp.attack,0);const def=s.skills.defence;s.setCombatAuto(false);advance(1200);assert.equal(s.skills.defence,def,'Taking damage does not train Defence');});
test('overkill and rewards are capped and victory pays only once',()=>{reset();s.combat.enemyHp=1;const coins=s.coins,reward=s.combat.rewardCoins;advance(600);assert.equal(s.combat.phase,'won');assert.equal(s.combat.lastXp.attack,4);assert.equal(s.coins,coins+reward);winCombat(get,set,s.combat,'again');advance(10000);assert.equal(s.coins,coins+reward);const hp=s.combat.playerHp;s.combatEnd();assert.equal(s.hp,hp,'A victory does not provide a free heal');});
test('telegraphed specials remain tied to enemy swings rather than player inputs',()=>{reset();s.setCombatAuto(false);advance(4200);assert.equal(s.combat.round,3);assert.equal(s.combat.enemyIntent.label,'Boar charge');const due=s.combat.nextEnemyTick;for(let i=0;i<15;i++)s.setCombatStyle('strength');assert.equal(s.combat.nextEnemyTick,due);assert.equal(enemyIntentFor('dragon',3).kind,'fire');});
test('peaceful dragon cake outcome pays once and stops both clocks',()=>{reset('dragon');const coins=s.coins;s.combatEat();assert(s.combat.pacified);assert.equal(s.combat.phase,'won');assert.equal(s.coins,coins+20);s.combatEat();advance(10000);assert.equal(s.coins,coins+20);});
test('retreat takes time, preserves location and can still take damage before disengaging',()=>{reset();const x=s.gnomeX,y=s.gnomeY,hp=s.hp;s.combatFlee();assert(s.combat.retreating);assert(s.combat);advance(1200);assert(s.combat);advance(600);assert.equal(s.combat,null);assert(s.hp<hp);assert.equal(s.gnomeX,x);assert.equal(s.gnomeY,y);});
test('leaving attack range finishes a retreat early without teleporting or healing',()=>{reset();s.hp=4;s.combat.playerHp=4;s.combatFlee();s.gnomeX+=200;advance(600);assert.equal(s.combat,null);assert.equal(s.hp,4);});
test('old timers and callbacks cannot affect a new target',()=>{reset();const old=s.combat;s.combat=makeCombat('rat',s.hp,{atX:s.gnomeX+40,atY:s.gnomeY});const before=s.hp;finishEnemyTurn(get,set,old);advance(600);assert.equal(s.combat.tick,0);assert.equal(s.hp,before);armAutoAttack(get);advance(600);assert.equal(s.combat.tick,1);});
test('defeat returns the player home and clears island and sailing state',()=>{reset();s.combat.playerHp=1;s.hp=1;s.combat.enemyDmg=10;s.afloat='row';s.setCombatAuto(false);advance(1800);assert.equal(s.combat.phase,'lost');assert.equal(s.afloat,null);assert.equal(s.abroad,null);advance(10000);assert.equal(s.combat.phase,'lost');s.combatEnd();assert.equal(s.combat,null);assert.equal(s.hp,10);});
test('ordinary creatures respawn after a delay, without resetting quest enemies or a displayed result',()=>{const data={clearedPack:['pack-rat','quest-runt'],creatureRespawns:{'pack-rat':1000,'quest-runt':1000},combat:null};assert.equal(readyCreatureRespawns(data,999),null);assert.deepEqual(readyCreatureRespawns(data,1001).clearedPack,['quest-runt']);assert.equal(readyCreatureRespawns({...data,combat:{packId:'pack-rat'}},1001),null);});
test('distant, cleared and forged targets cannot start an encounter',()=>{reset();clearCombatTimer();s.combat=null;const p=WORLD_PACK.find(p=>p.enemy==='rat');s.gnomeX=2000;s.gnomeY=800;s.startCreature(p.id,'rat');assert.equal(s.combat,null);s.gnomeX=p.x-40;s.gnomeY=p.y;s.startCreature(p.id,'chief');assert.equal(s.combat,null);s.startCreature(p.id,'rat');assert.equal(s.combat.enemyId,'rat');assert(s.combat.autoAttack);});
console.log('Combat flow checks passed ('+tests.length+'): '+tests.join(', '));
}finally{clearCombatTimer();timers.clear();Math.random=originalRandom;globalThis.setTimeout=originalSetTimeout;globalThis.clearTimeout=originalClearTimeout;}
`,
  },
  bundle: true,
  write: false,
  platform: "node",
  format: "esm",
  alias: { "@": root + "src" },
  logLevel: "silent",
});
try {
  await import(
    "data:text/javascript;base64," +
      Buffer.from(result.outputFiles[0].text).toString("base64")
  );
} catch (e) {
  console.error(e.message);
  process.exitCode = 1;
}
