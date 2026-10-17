import { build } from "esbuild-wasm";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const result = await build({
  stdin: {
    resolveDir: root,
    contents: `
      import assert from "node:assert/strict";
      import { makeCombat, enemyIntentFor, scaleEnemy, ENEMIES } from "./src/lib/game/combat";
      import { combatSlice, finishEnemyTurn, winCombat } from "./src/lib/game/store/combat";
      import { worldSlice } from "./src/lib/game/store/world";
      import { defaultSave } from "./src/lib/game/save";
      import { UI_SEED, armAutoAttack, clearCombatTimer } from "./src/lib/game/store/persist";
      import { maxHitpoints, xpForLevel } from "./src/lib/game/xp";
      import { WORLD_PACK } from "./src/lib/game/data/layout";

      const originalRandom = Math.random;
      const originalSetTimeout = globalThis.setTimeout, originalClearTimeout = globalThis.clearTimeout;
      let now = 0, timerId = 0;
      const timers = new Map();
      globalThis.setTimeout = (fn,delay=0) => { const id=++timerId; timers.set(id,{fn,at:now+delay}); return id; };
      globalThis.clearTimeout = id => timers.delete(id);
      const advance = ms => {
        const end=now+ms;
        let iterations=0;
        while(true) {
          const next=[...timers].filter(([,t])=>t.at<=end).sort((a,b)=>a[1].at-b[1].at)[0];
          if(!next)break;
          assert(++iterations<1000,"Timer loop must terminate");
          now=next[1].at;timers.delete(next[0]);next[1].fn();
        }
        now=end;
      };
      let state;
      const get=()=>state;
      const set=patch=>Object.assign(state,typeof patch==='function'?patch(state):patch);
      const actions={...combatSlice(set,get),...worldSlice(set,get)};
      const reset=(enemy='boar')=>{
        clearCombatTimer();timers.clear();Math.random=()=>0.01;
        state={...defaultSave(),...UI_SEED,...actions,atHome:false,named:true};
        state.combat=makeCombat(enemy,state.hp,{skills:state.skills,playerMax:maxHitpoints(state.skills)});
        state.combat.autoAttack=false;
      };
      const tests=[];
      const test=(name,fn)=>{try{fn();tests.push(name);}catch(error){throw new Error(name+': '+error.message);}};
      try {
        test('telegraphed enemy patterns',()=>{
          assert.equal(enemyIntentFor('boar',1).kind,'strike');
          assert.equal(enemyIntentFor('boar',3).label,'Boar charge');
          assert.equal(enemyIntentFor('dragon',3).kind,'fire');
          assert.equal(enemyIntentFor('rat',3).kind,'strike');
          reset();const high={...state.skills,attack:xpForLevel(99),strength:xpForLevel(99),defence:xpForLevel(99)};
          assert(scaleEnemy('rat',high).hp<=8,'Beginner enemies must stay manageable');
        });
        test('turns cannot be spammed',()=>{
          reset();state.combatAttack();assert.equal(state.combat.phase,'enemy');
          const hp=state.combat.enemyHp,food=state.bread+state.honey;
          state.combatAttack();state.combatGuard();state.combatEat();
          assert.equal(state.combat.enemyHp,hp);assert.equal(state.bread+state.honey,food);
          advance(900);assert.equal(state.combat.phase,'player');assert.equal(state.combat.round,2);
        });
        test('guard mitigates heavy attacks',()=>{
          reset();state.combat.round=3;state.combat.enemyIntent=enemyIntentFor('boar',3);state.combat.phase='enemy';
          const before=state.hp;finishEnemyTurn(get,set,state.combat);const damage=before-state.hp;
          reset();state.combat.round=3;state.combat.enemyIntent=enemyIntentFor('boar',3);
          state.combatGuard();advance(1270);
          assert(before-state.hp<=Math.floor(damage*0.45));assert.equal(state.combat.phase,'player');assert.equal(state.combat.guarding,false);
        });
        test('overkill XP and scaled loot',()=>{
          reset();state.skills.strength=xpForLevel(99);state.skills.attack=xpForLevel(99);
          state.equipment.weapon='weapon-adamant';state.combat=makeCombat('boar',state.hp,{skills:state.skills,playerMax:10});
          state.combat.autoAttack=false;state.combat.enemyHp=1;
          const reward=state.combat.rewardCoins,coins=state.coins;
          assert(reward>ENEMIES.boar.coins);state.combatAttack();
          assert.equal(state.combat.phase,'won');assert.equal(state.combat.lastXp.attack,4);
          assert.equal(state.combat.lastXp.hitpoints,1);assert.equal(state.coins,coins+reward);
          assert.deepEqual(state.combat.loot,{coins:reward,bones:1});
          winCombat(get,set,state.combat,'again');assert.equal(state.coins,coins+reward);
          advance(10000);assert.equal(state.combat.phase,'won','Results must remain until dismissed');
          state.combatEnd();assert.equal(state.combat,null);assert.match(state.speech,/Drops bones/);
        });
        test('food is not wasted and bread is used first',()=>{
          reset();const bread=state.bread,honey=state.honey;
          state.combatEat();assert.equal(state.bread,bread);assert.equal(state.honey,honey);assert.equal(state.combat.phase,'player');
          state.combat.playerHp=4;state.hp=4;state.combatEat();
          assert.equal(state.bread,bread-1);assert.equal(state.honey,honey);assert.equal(state.combat.playerHp,10);assert.equal(state.combat.phase,'enemy');
          reset();state.bread=0;state.honey=0;state.combatEat();assert.equal(state.combat.phase,'player');assert.equal(timers.size,0);
        });
        test('peaceful dragon outcome is complete and pays once',()=>{
          reset('dragon');const coins=state.coins;state.combatEat();
          assert.equal(state.combat.phase,'won');assert(state.combat.pacified);assert.equal(state.coins,coins+20);
          assert.equal(state.lifeDragon.state,'soothed');state.combatEat();assert.equal(state.coins,coins+20);
          advance(10000);assert.equal(state.combat.phase,'won');state.combatEnd();assert.equal(state.combat,null);
        });
        test('auto toggle preserves the enemy turn',()=>{
          reset();state.combat.autoAttack=true;armAutoAttack(get,800);state.setCombatAuto(false);advance(2000);
          assert.equal(state.combat.phase,'player');const before=state.combat.enemyHp;
          state.setCombatAuto(true);advance(1600);assert.equal(state.combat.phase,'enemy');assert(state.combat.enemyHp<before);
          state.setCombatAuto(false);advance(900);assert.equal(state.combat.phase,'player');
          const after=state.combat.enemyHp;advance(5000);assert.equal(state.combat.enemyHp,after);
        });
        test('old callbacks cannot hit a new encounter',()=>{
          reset();const old={...state.combat,phase:'enemy'};state.combat=makeCombat('boar',state.hp,{skills:state.skills,playerMax:10});
          state.combat.phase='enemy';const hp=state.hp;finishEnemyTurn(get,set,old);assert.equal(state.hp,hp);assert.equal(state.combat.round,1);
        });
        test('fleeing and defeat clear boat state safely',()=>{
          reset();state.combat.playerHp=2;state.hp=2;state.afloat='row';Math.random=()=>0.99;state.combatFlee();
          assert.equal(state.combat,null);assert.equal(state.hp,2);assert.equal(state.afloat,null);
          reset();state.combat.playerHp=1;state.combat.phase='enemy';state.afloat='row';finishEnemyTurn(get,set,state.combat);
          assert.equal(state.combat.phase,'lost');assert.equal(state.combat.playerHp,0);assert.equal(state.afloat,null);
          advance(10000);assert.equal(state.combat.phase,'lost');state.combatEnd();assert.equal(state.combat,null);assert.equal(state.hp,10);
        });
        test('distant and forged targets cannot start combat',()=>{
          reset();state.combat=null;const pack=WORLD_PACK.find(p=>p.enemy==='rat');
          state.gnomeX=2000;state.gnomeY=800;state.startCreature(pack.id,'rat');assert.equal(state.combat,null);
          state.gnomeX=pack.x-40;state.gnomeY=pack.y;state.startCreature(pack.id,'chief');assert.equal(state.combat,null);
          state.startCreature(pack.id,'rat');assert.equal(state.combat.enemyId,'rat');
        });
        console.log('Combat checks passed ('+tests.length+'): '+tests.join(', ')+'.');
      } finally {
        clearCombatTimer();timers.clear();Math.random=originalRandom;
        globalThis.setTimeout=originalSetTimeout;globalThis.clearTimeout=originalClearTimeout;
      }
    `,
  },
  bundle: true,
  write: false,
  platform: "node",
  format: "esm",
  alias: { "@": `${root}src` },
});
try {
  await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString("base64")}`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
