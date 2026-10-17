import { build } from "esbuild-wasm";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const result = await build({
  stdin: {
    resolveDir: root,
    contents: `
      import assert from 'node:assert/strict';
      import { ISLES, ISLE_BY_ID, raidLoot } from './src/lib/game/data/isles';
      import { CATALOG_BY_ID } from './src/lib/game/catalog';
      import { raidAccess, coerceRaidProgress, coerceRaidVisit } from './src/lib/game/raid-state';
      import { defaultSave, migrate } from './src/lib/game/save';
      import { islandsSlice } from './src/lib/game/store/islands';
      import { combatSlice, finishEnemyTurn } from './src/lib/game/store/combat';
      import { honourSlice } from './src/lib/game/store/honour';
      import { sessionSlice } from './src/lib/game/store/session';
      import { economySlice } from './src/lib/game/store/economy';
      import { UI_SEED, snap, clearCombatTimer } from './src/lib/game/store/persist';
      import { xpForLevel } from './src/lib/game/xp';

      let state;
      const get=()=>state;
      const set=patch=>Object.assign(state,typeof patch==='function'?patch(state):patch);
      const actions={...islandsSlice(set,get),...combatSlice(set,get),...honourSlice(set,get),...sessionSlice(set,get),...economySlice(set,get)};
      const oldRandom=Math.random;Math.random=()=>0.01;
      const reset=()=>{clearCombatTimer();state={...defaultSave(),...UI_SEED,...actions,atHome:false,named:true,gnomeName:'Raider',gnomeX:100,gnomeY:530,coins:500};};
      const prepare=()=>{state.skills.sailing=xpForLevel(3);state.hulls=['sail'];};
      const win=id=>{
        state.fightIsleDefender(id);assert(state.combat,'Target must start a fight: '+id);state.setCombatAuto(false);
        state.combat.enemyHp=1;state.combatAttack();assert.equal(state.combat.phase,'won');state.combatEnd();
      };
      const tests=[];
      const test=(name,fn)=>{try{fn();tests.push(name);}catch(error){throw new Error(name+': '+error.message);}};
      try {
        test('island definitions use valid enemies and rewards',()=>{
          for(const isle of ISLES){
            assert(isle.defenders.length>0);assert(new Set([...isle.defenders.map(d=>d.id),isle.boss.id]).size===isle.defenders.length+1);
            if(isle.boss.drop)assert(CATALOG_BY_ID[isle.boss.drop]);
            if(isle.raidsWith==='pirate')for(const d of [...isle.defenders,isle.boss])assert(['pirate','gunner','captain'].includes(d.kind));
          }
          assert(ISLE_BY_ID.cutlass.sailNeed<ISLE_BY_ID.salt.sailNeed);
          assert.equal(raidLoot('cutlass',3).coins,ISLE_BY_ID.cutlass.repeatCoins*2+ISLE_BY_ID.cutlass.boss.coins,'Chart and chest share repeat rewards');
        });
        test('Sailing, ship, map, and harbour gates',()=>{
          reset();state.raidIsle('cutlass');assert.equal(state.raidVisit,null);
          state.skills.sailing=xpForLevel(3);assert.match(raidAccess(state,ISLE_BY_ID.cutlass).reason,/skiff/);
          state.hulls=['sail'];state.gnomeX=1000;state.raidIsle('cutlass');assert.equal(state.raidVisit,null);
          state.gnomeX=100;state.raidIsle('mucktooth');assert.equal(state.raidVisit,null);
          state.raidIsle('__proto__');assert.equal(state.raidVisit,null);
          state.raidIsle('cutlass');assert.equal(state.abroad,'cutlass');assert.equal(state.afloat,'sail');
          assert.equal(state.skills.sailing,xpForLevel(3),'Port hops must not grant XP');
          state.raidIsle('salt');assert.equal(state.raidVisit.isleId,'cutlass');
        });
        test('crew gates the captain and chest',()=>{
          state.fightIsleDefender('brack');assert.equal(state.combat,null);
          const coins=state.coins;state.claimRaidChest();assert.equal(state.coins,coins);
          assert.equal(state.buy('hat-corsair'),false,'Raid trophies must not be free shop purchases');
          win('cc-0');assert(state.raidProgress.cutlass.defeated.includes('cc-0'));
          const paid=state.coins;state.fightIsleDefender('cc-0');state.fightIsleDefender('bogus');assert.equal(state.combat,null);assert.equal(state.coins,paid);
        });
        test('retreat and resume retain the crew progress',()=>{
          state.leaveIsle();assert.equal(state.raidVisit,null);assert.equal(state.abroad,null);assert.equal(state.afloat,'sail');
          state.raidIsle('cutlass');assert.deepEqual(state.raidProgress.cutlass.defeated,['cc-0']);
          const saved=migrate(snap(state));assert.deepEqual(saved.raidProgress.cutlass,state.raidProgress.cutlass);assert.deepEqual(saved.raidVisit,state.raidVisit);
          state={...saved,...UI_SEED,...actions,atHome:true};state.continueGame();assert.equal(state.abroad,'cutlass');
        });
        test('captain uses named stats and pays only through chest',()=>{
          win('cc-1');win('cc-2');win('cc-3');state.fightIsleDefender('brack');state.setCombatAuto(false);
          assert.equal(state.combat.name,'Captain Brack');assert.equal(state.combat.enemyId,'captain');assert.equal(state.combat.enemyMax,32);assert.equal(state.combat.enemyDmg,4);
          const coins=state.coins,bones=state.bones;state.combat.enemyHp=1;state.combatAttack();
          assert.equal(state.coins,coins);assert.equal(state.bones,bones);assert(state.raidProgress.cutlass.defeated.includes('brack'));
          state.claimRaidChest();assert.equal(state.coins,coins,'Dismiss the fight before opening the chest');state.combatEnd();
        });
        test('first chest pays once and unlocks a real trophy',()=>{
          const coins=state.coins,bones=state.bones,xp=state.skills.sailing;state.claimRaidChest();const loot=raidLoot('cutlass',0);
          assert.equal(state.coins,coins+loot.coins);assert.equal(state.bones,bones+loot.bones);assert.equal(state.skills.sailing,xp+180);
          assert.equal(state.flagsPlanted,1);assert.equal(state.isles.cutlass.cleared,1);assert(state.ownedHats.includes('hat-corsair'));
          const after=JSON.stringify(snap(state));state.claimRaidChest();assert.equal(JSON.stringify(snap(state)),after);
          assert.equal(migrate(snap(state)).raidProgress.cutlass.claimed,true);
        });
        test('repeats require a fresh crew and do not duplicate trophies',()=>{
          state.leaveIsle();state.raidIsle('cutlass');assert.deepEqual(state.raidProgress.cutlass.defeated,[]);
          const coins=state.coins;state.claimRaidChest();assert.equal(state.coins,coins);
          for(const d of ISLE_BY_ID.cutlass.defenders)win(d.id);win('brack');
          const before=state.coins;state.claimRaidChest();assert.equal(state.coins,before+raidLoot('cutlass',1).coins);
          assert.equal(state.isles.cutlass.cleared,2);assert.equal(state.flagsPlanted,1);assert.equal(state.ownedHats.filter(id=>id==='hat-corsair').length,1);
        });
        test('defeat clears the visit but preserves completed fights',()=>{
          reset();prepare();state.raidIsle('cutlass');win('cc-0');state.fightIsleDefender('cc-1');state.setCombatAuto(false);
          state.combat.playerHp=1;state.combat.phase='enemy';finishEnemyTurn(get,set,state.combat);
          assert.equal(state.combat.phase,'lost');assert.equal(state.raidVisit,null);assert.equal(state.abroad,null);assert.equal(state.afloat,null);
          assert.deepEqual(state.raidProgress.cutlass.defeated,['cc-0']);state.combatEnd();
        });
        test('legacy saves and malformed raid fields are safe',()=>{
          const old=defaultSave();delete old.raidProgress;delete old.raidVisit;const migrated=migrate(old);
          assert.deepEqual(migrated.raidProgress,{});assert.equal(migrated.raidVisit,null);
          assert.deepEqual(coerceRaidProgress({cutlass:{defeated:['cc-0','cc-0','bogus'],claimed:true}}),{cutlass:{defeated:['cc-0'],claimed:false}});
          assert.equal(coerceRaidVisit({isleId:'constructor',boat:'row'}),null);
          assert.equal(coerceRaidVisit({isleId:'cutlass',boat:'bad'}),null);
          assert.deepEqual(coerceRaidVisit({isleId:'cutlass',boat:'row',returnX:NaN,returnY:0}),{isleId:'cutlass',boat:'row',returnX:-50,returnY:470});
        });
        console.log('Island checks passed ('+tests.length+'): '+tests.join(', ')+'.');
      }finally{clearCombatTimer();Math.random=oldRandom;}
    `,
  },
  bundle: true,
  write: false,
  platform: "node",
  format: "esm",
  alias: { "@": `${root}src` },
});
try {
  await import(
    `data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString("base64")}`
  );
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
