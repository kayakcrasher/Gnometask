import { build } from "esbuild-wasm";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("../", import.meta.url));
const bundle = await build({
  stdin: {
    resolveDir: root,
    contents: `
import assert from 'node:assert/strict';
import {defaultSave,migrate} from './src/lib/game/save';
import {snap,UI_SEED} from './src/lib/game/store/persist';
import {gatherSlice} from './src/lib/game/store/gather';
import {economySlice} from './src/lib/game/store/economy';
import {FISH,rollFish,AQUARIUM_COST,AQUARIUM_CAPACITY,tankCount} from './src/lib/game/data/fish';
import {CITY_BUILDINGS,citySetupCost,cityUpgradeCost,emptyCity,HOME_UPGRADE_COST} from './src/lib/game/city';
let s;const get=()=>s,set=p=>Object.assign(s,typeof p==='function'?p(s):p);s={...defaultSave(),...UI_SEED,...gatherSlice(set,get),...economySlice(set,get),named:true,atHome:false};
const tests=[];const test=(name,fn)=>{try{fn();tests.push(name)}catch(e){throw Error(name+': '+e.message)}};
test('every setup has a price and construction and upgrades get more expensive',()=>{
 for(const [kind,b] of Object.entries(CITY_BUILDINGS)){assert(b.coins>0);const city=emptyCity();const first=citySetupCost(city,kind);city.buildings.push({kind});assert(citySetupCost(city,kind)>first);assert(cityUpgradeCost({kind,level:2}).coins>cityUpgradeCost({kind,level:1}).coins);}
 assert(HOME_UPGRADE_COST[3]>HOME_UPGRADE_COST[2]&&HOME_UPGRADE_COST[2]>HOME_UPGRADE_COST[1]);s.coins=10000;for(let i=1;i<=3;i++){const before=s.coins;s.upgradeCottage();assert.equal(s.coins,before-HOME_UPGRADE_COST[i]);}
});
test('twenty fish are reachable and shore, level and hull gates hold',()=>{
 assert.equal(FISH.length,20);assert.equal(new Set(FISH.map(f=>f.id)).size,20);
 for(const fish of FISH){const pool=FISH.filter(f=>f.sea===fish.sea&&f.need<=fish.need&&(!fish.sea||f.boat<=fish.boat));const total=pool.reduce((n,f)=>n+f.weight,0),index=pool.indexOf(fish),rng=(pool.slice(0,index).reduce((n,f)=>n+f.weight,0)+fish.weight/2)/total;assert.equal(rollFish(fish.sea?'sea':'shore',fish.need,fish.boat,0,()=>rng).id,fish.id);}
 for(let i=0;i<100;i++){const fish=rollFish('shore',1,1,0,()=>i/100);assert(!fish.sea&&fish.need<=1);const sea=rollFish('sea',6,2,0,()=>i/100);assert(sea.sea&&sea.need<=6&&sea.boat<=2);}
});
test('aquarium setup is paid, full tanks reject deposits atomically and fish return safely',()=>{
 s.coins=0;s.fishBag={koi:10};s.stockFish('koi');assert.equal(tankCount(s.tank),0);s.upgradeAquarium();assert.equal(s.aquariumLevel,0);s.coins=5000;s.upgradeAquarium();assert.equal(s.coins,4880);
 for(let i=0;i<10;i++)s.stockFish('koi');assert.equal(s.tank.koi,8);assert.equal(s.fishBag.koi,2);s.returnFish('koi');assert.equal(s.tank.koi,7);assert.equal(s.fishBag.koi,3);const before=s.coins;s.returnFish('missing');assert.equal(s.coins,before);
 s.upgradeAquarium();assert.equal(s.coins,before-360);s.stockFish('koi');assert.equal(s.tank.koi,8);assert.equal(s.fishBag.koi,2);
 for(let i=0;i<2;i++)s.upgradeAquarium();const paid=s.coins;s.upgradeAquarium();assert.equal(s.coins,paid);assert.equal(s.aquariumLevel,4);
});
test('aquarium migration and save preserve fish and reject malformed counts',()=>{
 const loaded=migrate(snap(s));assert.equal(loaded.aquariumLevel,4);assert.deepEqual(loaded.tank,s.tank);assert.deepEqual(loaded.fishBag,s.fishBag);
 const legacy=migrate({...snap(s),aquariumLevel:undefined,tank:{sprat:30,koi:5}});assert.equal(tankCount(legacy.tank),35);assert(AQUARIUM_CAPACITY[legacy.aquariumLevel]>=35);
 const bad=migrate({...snap(s),aquariumLevel:NaN,tank:{sprat:Infinity,koi:-3,unknown:8},fishBag:{koi:2.8,moonfish:NaN}});assert.equal(tankCount(bad.tank),0);assert.deepEqual(bad.fishBag,{koi:2});
});
for(const t of tests)console.log('✓',t);console.log(tests.length+' fishing and pricing checks passed');
`,
  },
  bundle: true,
  platform: "node",
  format: "esm",
  write: false,
  logLevel: "silent",
});
try {
  await import(
    "data:text/javascript;base64," +
      Buffer.from(bundle.outputFiles[0].text).toString("base64")
  );
} catch (e) {
  console.error(e.message);
  process.exitCode = 1;
}
