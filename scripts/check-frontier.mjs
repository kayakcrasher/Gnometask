import { build } from "esbuild-wasm";
const b = await build({
  stdin: {
    resolveDir: process.cwd(),
    contents: `
import assert from 'node:assert/strict';
import {FRONTIER_SETTLEMENTS,FRONTIER_SIGHTS,FRONTIER_LAKES,FRONTIER_NEIGHBOURS,inlandWater,frontierBuildable} from './src/lib/game/data/frontier';
import {ISLAND_POLY,onIsland,walkableLand,groundY} from './src/lib/game/world3';
import {ROAD_PROJECTS} from './src/lib/game/data/expansion';
import {PARCELS,parcelAccessOpen} from './src/lib/game/data/parcels';
import {buildingSiteClear,parcelBuildingSpot} from './src/lib/game/land-planning';
import {landRoute,clearLandSegment} from './src/lib/game/land-route';
import {openFrontier,settleFrontier} from './src/lib/game/town-planning';
import {defaultSave,migrate} from './src/lib/game/save';
import {npcWalkable} from './src/lib/game/npc-brain';
import {citySiteError} from './src/lib/game/city';
const done=ROAD_PROJECTS.map(p=>p.id);let count=0;const test=(name,f)=>{try{f();console.log('✓ '+name);count++;}catch(e){throw Error(name+': '+e.message)}};
test('large new land preserves the old towns and has substantial countryside between new settlements',()=>{
 const area=Math.abs(ISLAND_POLY.reduce((n,p,i)=>{const q=ISLAND_POLY[(i+1)%ISLAND_POLY.length];return n+p[0]*q[1]-q[0]*p[1]},0))/2;assert(area>18000000);for(const p of [{x:96,y:548},{x:980,y:640},{x:1320,y:1310},{x:3320,y:760},{x:1500,y:-610}])assert(onIsland(p.x,p.y));for(let i=1;i<3;i++)assert(Math.hypot(FRONTIER_SETTLEMENTS[i].x-FRONTIER_SETTLEMENTS[i-1].x,FRONTIER_SETTLEMENTS[i].y-FRONTIER_SETTLEMENTS[i-1].y)>1100);
});
test('new destinations and road corridors are connected without crossing lakes or steep ground',()=>{
 for(const d of [...FRONTIER_SETTLEMENTS,...FRONTIER_SIGHTS]){const start={x:1250,y:-450},path=landRoute(start,d);assert(path,d.name+' route');let prev=start;for(const p of path){assert(clearLandSegment(prev,p),d.name);prev=p;}assert(Math.hypot(prev.x-d.x,prev.y-d.y)<.01);}
 for(const r of ROAD_PROJECTS.slice(3))for(let i=1;i<r.points.length;i++){const a=r.points[i-1],b=r.points[i];for(let t=0;t<=1;t+=.05){const x=a[0]+(b[0]-a[0])*t,y=a[1]+(b[1]-a[1])*t;assert(walkableLand(x,y));assert(frontierBuildable(x,y));}}
 for(const lake of FRONTIER_LAKES){assert(!walkableLand(lake.x,lake.y));assert(!buildingSiteClear(lake.x,lake.y));assert(!npcWalkable(lake.x,lake.y));}
 const lake=FRONTIER_LAKES[0],a={x:lake.x-lake.rx-80,y:lake.y},z={x:lake.x+lake.rx+80,y:lake.y};assert(!clearLandSegment(a,z));assert(landRoute(a,z).length>1);
});
test('new settlement deeds have usable sites and unlock only after their own paid road',()=>{
 const s=defaultSave();s.townHallLevel=5;s.roadWorks.completed=done;for(const d of FRONTIER_SETTLEMENTS){const parcels=PARCELS.filter(p=>p.requiredRoad===d.road);assert(parcels.length>=8);assert(parcels.every(p=>!parcelAccessOpen(p,['noble-reach'])));assert(parcels.every(p=>parcelAccessOpen(p,done)));assert(parcels.filter(p=>parcelBuildingSpot(p)).length>=6);s.deeds=parcels.map(p=>p.id);let valid=0;for(const p of parcels){for(let x=p.x+32;x<p.x+p.w-30;x+=30)for(let y=p.y+30;y<p.y+p.h-28;y+=30){if(!citySiteError(s,'housing',x,y))valid++;}}assert(valid>0,d.name+' road-accessible construction');}
});
test('surveys are idempotent, migration preserves old deeds, families pay and respect player land',()=>{
 const s=defaultSave();s.civic=openFrontier(s.civic,done);assert(FRONTIER_NEIGHBOURS.every(p=>buildingSiteClear(p.x,p.y)));assert.equal(openFrontier(s.civic,done).plots.length,s.civic.plots.length);s.civic.beat=96;const before=s.coins,old=s.civic.gnomes.length;s.civic=settleFrontier(s);assert.equal(s.coins,before);assert.equal(s.civic.gnomes.length,old+1);assert.equal(s.civic.gnomes.at(-1).purse,60);assert.equal(settleFrontier(s).gnomes.length,s.civic.gnomes.length);s.civic.beat=192;s.deeds=PARCELS.filter(p=>p.requiredRoad).map(p=>p.id);const blocked=settleFrontier(s);assert.equal(blocked.gnomes.length,s.civic.gnomes.length,'No family may take player-owned land');for(const p of blocked.plots.filter(p=>p.owner==='settler-2'))assert(!s.deeds.some(id=>{const q=PARCELS.find(p=>p.id===id);return p.x>=q.x&&p.x<=q.x+q.w&&p.y>=q.y&&p.y<=q.y+q.h}));s.roadWorks.completed=done;const loaded=migrate(s);assert.deepEqual(loaded.deeds,s.deeds);assert.deepEqual(loaded.roadWorks.completed,done);assert.equal(loaded.civic.gnomes.length,s.civic.gnomes.length);
});
console.log(count+' expanded island checks passed');
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
      Buffer.from(b.outputFiles[0].text).toString("base64")
  );
} catch (e) {
  console.error(e.message);
  process.exit(1);
}
