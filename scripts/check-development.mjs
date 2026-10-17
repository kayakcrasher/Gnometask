import { build } from "esbuild-wasm";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("../", import.meta.url));
const bundle = await build({
  stdin: {
    resolveDir: root,
    contents: `
import assert from 'node:assert/strict';
import {ADVANCED_GEAR} from './src/lib/game/data/catalog/advanced';
import {CATALOG, CATALOG_BY_ID, bestHatchet, bestRod, harvestYield} from './src/lib/game/data/catalog';
import {tierOf} from './src/lib/game/data/tiers';
import {CROPS,plotStage,pailBonusMs} from './src/lib/game/data/crops';
import {PARCELS,parcelAt} from './src/lib/game/data/parcels';
import {ROAD_PROJECTS, coerceRoadWorks, FRONTIER_HOMES} from './src/lib/game/data/expansion';
import {parcelBuildingSpot,buildingSiteClear,civicParcelOwner,developedRoads} from './src/lib/game/land-planning';
import {npcWalkable,clearNpcSegment,npcRoute} from './src/lib/game/npc-brain';
import {developmentLevel,developmentWorth,homeBuildQuote} from './src/lib/game/development';
import {openFrontier,npcBuildAllowed} from './src/lib/game/town-planning';
import {stepCivic} from './src/lib/game/data/civic';
import {onIsland,nobleRise} from './src/lib/game/world3';
import {defaultSave,migrate} from './src/lib/game/save';
import {xpForLevel} from './src/lib/game/xp';
import {UI_SEED,snap} from './src/lib/game/store/persist';
import {developmentSlice} from './src/lib/game/store/development';
import {economySlice} from './src/lib/game/store/economy';
import {honourSlice} from './src/lib/game/store/honour';
import {farmSlice} from './src/lib/game/store/farm';
let state;const get=()=>state,set=p=>Object.assign(state,typeof p==='function'?p(state):p);
const actions={...developmentSlice(set,get),...economySlice(set,get),...honourSlice(set,get),...farmSlice(set,get)};
const reset=()=>{state={...defaultSave(),...UI_SEED,...actions,named:true,atHome:false};};
const tests=[];const test=(name,fn)=>{try{fn();tests.push(name);}catch(e){throw new Error(name+': '+e.message);}};
let parcel,spot;
test('late-game equipment has real upgrades and strict progression gates',()=>{
 reset();assert.equal(ADVANCED_GEAR.length,27);assert.equal(new Set(CATALOG.map(i=>i.id)).size,CATALOG.length);
 for(const item of ADVANCED_GEAR){assert(item.price>0&&item.reqLevel>=30&&item.reqHall>=3);assert(CATALOG_BY_ID[item.id]);}
 state.coins=20000;assert.equal(state.buy('weapon-dragonsteel'),false);assert.equal(state.coins,20000);
 state.skills.attack=xpForLevel(65);assert.equal(state.buy('weapon-dragonsteel'),false);
 state.townHallLevel=5;assert.equal(state.buy('weapon-dragonsteel'),true);assert.equal(state.equipment.weapon,'weapon-dragonsteel');assert.equal(state.coins,15800);
 state.ownedGear.push('shield-dragonsteel');state.equipGear('shield-dragonsteel');assert.equal(state.equipment.shield,null,'Owned gear still needs Defence');
 assert.equal(tierOf('weapon-dragonsteel'),'dragonsteel');assert.equal(tierOf('hatchet-mithril'),'mithril');
 assert.equal(bestHatchet(['hatchet-adamant','hatchet-dragonsteel']),'hatchet-dragonsteel');assert.equal(bestRod(['rod-steel','rod-mithril']),'rod-mithril');
 assert(homeBuildQuote(2,['hammer-dragonsteel']).coins<homeBuildQuote(2,[]).coins);
});
test('better farm equipment affects crops without premature harvesting',()=>{
 reset();state.ownedGear.push('hoe-dragonsteel','pail-dragonsteel');const crop=CROPS[0];const now=Date.now();
 const plot={crop:'carrot',plantedAt:now-crop.growMs*.6,wateredAt:now-crop.growMs*.6};
 assert.equal(plotStage(plot,now,0),'sprout');assert.equal(plotStage(plot,now,pailBonusMs(state.ownedGear)),'ready');assert(harvestYield(state.ownedGear)>harvestYield(['hoe-wood']));
 state.plots['yard-0']={crop:'carrot',plantedAt:now,wateredAt:null};state.harvestPlot('yard-0');assert(state.plots['yard-0']);assert.equal(state.produce.carrot,undefined);
 state.plots['yard-0']=plot;state.harvestPlot('yard-0');assert.equal(state.produce.carrot,harvestYield(state.ownedGear));assert.equal(state.plots['yard-0'],undefined);
});
test('roads reserve narrow corridors rather than whole parcels',()=>{
 reset();assert(PARCELS.length>100);assert(!PARCELS.some(p=>p.owner==='capitol'));
 assert(!buildingSiteClear(3810,650),'Hotel grounds stay protected');assert(!buildingSiteClear(3620,780),'Fountain plaza stays protected');
 const roadside=PARCELS.filter(p=>!p.owner&&p.usableArea<p.w*p.h-100);
 assert(roadside.length>10);assert(roadside.some(p=>p.usableArea>p.w*p.h*.65));
 for(const p of roadside){if(civicParcelOwner(p,state.civic))continue;const candidate=parcelBuildingSpot(p);if(candidate){parcel=p;spot=candidate;break;}}
 assert(parcel&&spot,'A roadside parcel should support a real home');assert(spot.distance<100,'Roadside construction must fit inside the old 100-unit exclusion');assert(buildingSiteClear(spot.x,spot.y));
 state.coins=10000;const oldDeed=PARCELS.find(p=>p.id.startsWith('p-')&&!p.owner);state.deeds=[oldDeed.id];
 state.buyParcel(parcel.id);assert(state.deeds.includes(parcel.id));assert(state.deeds.includes(oldDeed.id));
});
test('homes require a deed and resources, preserve ownership, and survive reload',()=>{
 reset();state.coins=5000;state.logs=100;state.townHallLevel=4;state.skills.crafting=xpForLevel(35);
 state.buildParcelHome(parcel.id);assert.equal(state.estate[parcel.id],undefined);
 state.deeds=[parcel.id];state.logs=0;state.buildParcelHome(parcel.id);assert.equal(state.estate[parcel.id].level,1);assert(state.coins<5000);assert.equal(state.logs,0,'Homes require coins, never logs');
 state.buildParcelHome(parcel.id);state.buildParcelHome(parcel.id);assert.equal(state.estate[parcel.id].level,3);const paid=state.coins;state.buildParcelHome(parcel.id);assert.equal(state.coins,paid);
 state.sellParcel(parcel.id);assert(state.deeds.includes(parcel.id),'Built homes cannot be sold as empty deeds');
 const loaded=migrate(snap(state));assert.deepEqual(loaded.estate,state.estate);assert.deepEqual(loaded.deeds,state.deeds);
});
test('road projects are sequential, paid once, resumable and visible',()=>{
 reset();state.coins=20000;state.logs=0;state.townHallLevel=5;
 state.commissionRoad('noble-reach');assert.equal(state.roadWorks.active,null);state.commissionRoad('bad-id');assert.equal(state.roadWorks.active,null);
 for(const p of ROAD_PROJECTS){
  const worth=developmentWorth(state),coins=state.coins,logs=state.logs;state.commissionRoad(p.id);assert.equal(developmentWorth(state),worth,"Investing in public roads preserves development value");assert.equal(state.coins,coins-p.coins);assert.equal(state.logs,logs-p.logs);
  state.commissionRoad(p.id);assert.equal(state.coins,coins-p.coins);
  state.advanceRoadCrew();assert(state.roadWorks.active.progress>0);assert(developedRoads(state.roadWorks,{}).some(r=>r.id===p.id+'-built'));
  assert.deepEqual(migrate(snap(state)).roadWorks,state.roadWorks);
  for(let i=0;i<20;i++)state.advanceRoadCrew();assert(state.roadWorks.completed.includes(p.id));assert.equal(state.roadWorks.active,null);
  state.commissionRoad(p.id);assert.equal(state.coins,coins-p.coins);
  for(const [x,y] of p.points){assert(onIsland(x,y));assert.equal(nobleRise(x,y),0,'Roads must bypass the mountain');}
 }
 assert.equal(coerceRoadWorks({completed:{},active:{id:'bad',progress:NaN}}).active,null);
 const frontier=openFrontier(state.civic,state.roadWorks.completed);assert.equal(frontier.plots.length,state.civic.plots.length+6);assert.equal(openFrontier(frontier,state.roadWorks.completed).plots.length,frontier.plots.length);
 for(const p of FRONTIER_HOMES){assert(onIsland(p.x,p.y));assert.equal(nobleRise(p.x,p.y),0);}
});
test('NPC navigation avoids newly built homes',()=>{
 const obstacles=[{x:700,y:610,w:23,h:21}],start={x:650,y:610},target={x:750,y:610};
 assert(!npcWalkable(700,610,obstacles));assert(!clearNpcSegment(start,target,obstacles));
 const route=npcRoute(start,target,obstacles);assert(route);let previous=start;for(const p of route){assert(clearNpcSegment(previous,p,obstacles));previous=p;}
});
test('NPC housing responds to wealth and never builds on player deeds',()=>{
 reset();const base=state.civic,actor=base.gnomes.filter(g=>!g.archetype)[0],count=base.gnomes.filter(g=>!g.archetype).length;
 const home={...base.plots[0],owner:actor.id,shares:[actor.id],stories:1};const civic={...base,beat:count-1,plots:[home,...base.plots.slice(1)],gnomes:base.gnomes.map(g=>g.id===actor.id?{...g,purse:1000,family:1}:g)};
 const poor=stepCivic(civic,1,0);assert.equal(poor.plots[0].stories,1);
 const rich=stepCivic(civic,1,4);assert.equal(rich.plots[0].stories,2);assert(rich.gnomes[0].purse<civic.gnomes[0].purse);
 state.deeds=[parcel.id];assert.equal(npcBuildAllowed(state,{...home,x:spot.x,y:spot.y}),false);
 let frozen={...base,gnomes:base.gnomes.map(g=>({...g,purse:1000}))};for(let i=0;i<80;i++)frozen=stepCivic(frozen,1,4,()=>false);
 assert(frozen.plots.every(p=>p.stories===0&&p.shares.length===0));
 state.coins=20000;assert.equal(developmentLevel(state),4);assert(rich.gnomes.every(g=>g.purse>=0));
});
console.log('Development checks passed ('+tests.length+'): '+tests.join(', ')+'.');
`,
  },
  bundle: true,
  write: false,
  platform: "node",
  format: "esm",
  alias: { "@": root + "src" },
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
