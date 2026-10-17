import { build } from "esbuild-wasm";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("../", import.meta.url));
const result = await build({
  stdin: {
    resolveDir: root,
    contents: `
import assert from 'node:assert/strict';
import { shipGeometry } from './src/components/world/ship-assets';
import { npcWalkable, clearNpcSegment, safeNpcSpot, npcRoute, npcRoutine } from './src/lib/game/npc-brain';
import { NPCS } from './src/lib/game/data/npcs';
import { SUNSTEP_VENUES, SUNSTEP_FEATURES } from './src/lib/game/data/sunstep';
import { onIsland, onDesert, DESERT_POLY } from './src/lib/game/world3';
import { wheelPayout } from './src/lib/game/casino';
import { economySlice } from './src/lib/game/store/economy';
import { sessionSlice } from './src/lib/game/store/session';
import { defaultSave, migrate } from './src/lib/game/save';
import { UI_SEED, snap, clearCombatTimer } from './src/lib/game/store/persist';
let state;const get=()=>state;const set=p=>Object.assign(state,typeof p==='function'?p(state):p);
const actions={...economySlice(set,get),...sessionSlice(set,get)};
const reset=()=>{state={...defaultSave(),...UI_SEED,...actions,atHome:false,named:true};};
const tests=[];const test=(name,fn)=>{try{fn();tests.push(name);}catch(e){throw new Error(name+': '+e.message);}};
const original=Math.random;
try{
 test('ship hulls taper and have a raised deck and submerged keel',()=>{
  for(const [l,w] of [[3.6,1.05],[1.75,0.64],[1.8,0.7],[1.4,0.56]]){
   const g=shipGeometry(l,w);g.hull.computeBoundingBox();const box=g.hull.boundingBox;
   assert(box.min.y<0&&box.max.y>0);assert(box.max.z-box.min.z>=l);
   for(const geo of [g.hull,g.deck])for(const value of geo.getAttribute('position').array)assert(Number.isFinite(value));
   const normals=g.deck.getAttribute('normal');for(let i=0;i<normals.count;i++)assert(normals.getY(i)>0.99,'Decks must face up');
   g.hull.dispose();g.deck.dispose();
  }
 });
 test('larger desert contains the new landmarks and venues',()=>{
  assert.equal(SUNSTEP_VENUES.length,12);assert.equal(new Set(SUNSTEP_VENUES.map(v=>v.id)).size,12);
  for(const p of [...SUNSTEP_VENUES,...Object.values(SUNSTEP_FEATURES),{x:4200,y:760}])assert(onDesert(p.x,p.y));
  for(const v of SUNSTEP_VENUES)assert(v.name&&v.accent&&v.architecture);
 });
 test('NPCs route around solid buildings and avoid water',()=>{
  assert(!npcWalkable(520,190));assert(!npcWalkable(-100,530));assert(!npcWalkable(388,548));
  assert(!clearNpcSegment({x:340,y:548},{x:430,y:548}));
  const start={x:340,y:548},target={x:435,y:548};const route=npcRoute(start,target);assert(route&&route.length>1);
  let prev=start;for(const p of route){assert(clearNpcSegment(prev,p));prev=p;}assert.deepEqual(prev,target);
  assert.equal(npcRoute(start,{x:-100,y:530}),null);
 });
 test('NPC routines are safe, deterministic and role aware',()=>{
  for(const home of [...NPCS,...defaultSave().civic.gnomes]){
   const start=safeNpcSpot(home);assert(npcWalkable(start.x,start.y),'Home safe for '+home.id);
   for(const phase of ['day','night'])for(let cycle=0;cycle<4;cycle++){
    const routine=npcRoutine(home,phase,cycle);assert(npcWalkable(routine.point.x,routine.point.y),'Target safe for '+home.id);
    assert(Math.hypot(routine.point.x-home.x,routine.point.y-home.y)<300);
    assert.deepEqual(routine,npcRoutine(home,phase,cycle));
   }
  }
  const guard={id:'test',x:720,y:610,job:'watch marshal'};
  assert.equal(npcRoutine(guard,'night',0).activity,'patrolling');assert.equal(npcRoutine({...guard,job:'baker'},'night',0).activity,'resting');
  assert.equal(npcRoutine({...guard,stay:true},'day',3).activity,'working');
 });
 test('NPC friendships survive saving and reject invalid values',()=>{
  reset();state.bonds={pappy:17.9,'sunstep-host':3,unknown:5,greg:NaN};
  assert.deepEqual(migrate(snap(state)).bonds,{pappy:17,'sunstep-host':3});assert.deepEqual(migrate({}).bonds,{});
 });
 test('casino odds have the advertised boundaries and payouts',()=>{
  for(const [r,pay] of [[0,50],[0.01999,50],[0.02,15],[0.11999,15],[0.12,8],[0.36999,8],[0.37,0],[0.999,0]])assert.equal(wheelPayout(5,r).pay,pay);
  assert.equal(wheelPayout(20,0).pay,200);for(const v of [-1,NaN,1,Infinity])assert.equal(wheelPayout(5,v),null);
  assert.equal(wheelPayout(7,0),null);
  let expected=0;for(let i=0;i<10000;i++)expected+=wheelPayout(5,i/10000).pay;assert.equal(expected/10000,4.5);
 });
 test('bets are atomic, gated and do not spend an unaffordable stake',()=>{
  reset();Math.random=()=>0;state.wager(5);assert.equal(state.coins,16,'Must be in the casino');
  state.enterCasino('bad-id');assert.equal(state.interior,null);state.enterCasino('sunstep-1');assert.equal(state.casinoVenue,'sunstep-1');
  state.wager(20);assert.equal(state.coins,16,'High stakes locked');state.wager(NaN);assert.equal(state.coins,16);
  state.wager(5);assert.equal(state.coins,61);assert.equal(state.casinoResult.pay,50);assert.equal(state.casinoResult.spin,1);
  state.coins=4;state.wager(5);assert.equal(state.coins,4);assert.equal(state.casinoResult.spin,1);
  state.coins=500;Math.random=()=>0.99;state.wager(20);assert.equal(state.coins,480);assert.equal(state.casinoResult.pay,0);
  const saved=migrate(snap(state));assert.equal(saved.coins,480);assert.equal(saved.casinoResult,undefined,'UI results do not alter saves');
 });
 console.log('World upgrade checks passed ('+tests.length+'): '+tests.join(', ')+'.');
}finally{Math.random=original;clearCombatTimer();}
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
      Buffer.from(result.outputFiles[0].text).toString("base64")
  );
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
