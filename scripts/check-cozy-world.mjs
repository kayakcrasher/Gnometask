import { build } from "esbuild-wasm";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("../", import.meta.url));
const bundle = await build({
  stdin: {
    resolveDir: root,
    contents: `
import assert from 'node:assert/strict';
import {indoorLayout,indoorClear,indoorSegment,indoorRoute,indoorStep} from './src/lib/game/indoor-navigation';
import {ANIMAL_TRAITS,wildlifeHome,wildlifeGoal,wildlifeSafe,wildlifeSegment} from './src/lib/game/wildlife';
const rooms=['cottage','townhall','dockhouse','armory','hatshop','general','bakery','haven-shop','watch','bank','pub','court','exchange','casino'];
const tests=[];const test=(name,fn)=>{try{fn();tests.push(name)}catch(e){throw Error(name+': '+e.message)}};
test('all room entrances are safe, furniture is solid and routes stay in bounds',()=>{
 for(const id of rooms){const l=indoorLayout(id);assert(indoorClear(l,l.spawn),id+' spawn');assert(!indoorClear(l,{x:100,z:100}));assert(!indoorClear(l,{x:NaN,z:0}));for(const box of l.boxes)assert(!indoorClear(l,box));
 let count=0;for(const x of [-2.4,-1.4,0,1.4,2.4])for(const z of [-.5,.8,1.8]){const goal={x,z};if(!indoorClear(l,goal))continue;const path=indoorRoute(l,l.spawn,goal);if(!path)continue;let previous=l.spawn;for(const p of path){assert(indoorSegment(l,previous,p),id+' segment');previous=p;}count++;}assert(count>=3,id+' usable floor');}
});
test('direction buttons move independently on each axis without cancelling the other axis',()=>{const l=indoorLayout('cottage'),p=l.spawn;assert(indoorStep(l,p,{x:1,z:0},.2).x>p.x);assert(indoorStep(l,p,{x:0,z:-1},.2).z<p.z);assert.deepEqual(indoorStep(l,p,{x:0,z:0},.2),p);});
test('walking routes go around a table rather than through it and reject blocked destinations',()=>{
 const l=indoorLayout('cottage'),start={x:-1.4,z:1.5},goal={x:-1.4,z:-.9};assert(!indoorSegment(l,start,goal));const path=indoorRoute(l,start,goal);assert(path&&path.length>1);let p=start;for(const q of path){assert(indoorSegment(l,p,q));p=q;}assert.equal(indoorRoute(l,start,{x:-1.4,z:.2}),null);
});
test('wildlife homes and deterministic wander paths respect land, buildings and pond habitat',()=>{
 const anchors={rabbit:[280,700],sheep:[1180,620],cat:[820,520],fox:[220,300],deer:[1620,460],frog:[430,280],hedgehog:[1040,700],chicken:[96,548],duck:[500,190]};
 for(const [kind,[x,y]] of Object.entries(anchors)){const home=wildlifeHome(kind,x,y);assert(home,kind+' home');assert(wildlifeSafe(kind,home.x,home.y));let p=home;for(let seed=0;seed<40;seed++){const next=wildlifeGoal(kind,home,p,seed);assert(wildlifeSafe(kind,next.x,next.y));assert(wildlifeSegment(kind,p,next));assert(Math.hypot(next.x-home.x,next.y-home.y)<=ANIMAL_TRAITS[kind].radius*1.05);p=next;}}
 assert(!wildlifeSafe('duck',700,190));assert(!wildlifeSafe('deer',520,190));
 const obstacle={x:280,y:700,w:27,h:25},relocated=wildlifeHome('rabbit',280,700,[obstacle]);assert(relocated);assert(Math.abs(relocated.x-280)>32||Math.abs(relocated.y-700)>30);assert(wildlifeSafe('rabbit',relocated.x,relocated.y,[obstacle]));
});
for(const t of tests)console.log('✓',t);console.log(tests.length+' interior and wildlife checks passed');
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
