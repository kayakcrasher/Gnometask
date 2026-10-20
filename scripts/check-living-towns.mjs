import { build } from "esbuild-wasm";
const r = await build({
  stdin: {
    resolveDir: process.cwd(),
    contents: `
import assert from 'node:assert/strict';
import {developmentWorth} from './src/lib/game/development';
import {defaultSave,migrate} from './src/lib/game/save';import {snap,UI_SEED} from './src/lib/game/store/persist';
import {transportSlice} from './src/lib/game/store/transport';import {wagonPoint,transportRoutes,stepTransport,CART_PRICE,BUS_FARE,wagonQuote} from './src/lib/game/transport';
import {HOME_STYLES,homeStyle,npcUpgradeCost} from './src/lib/game/home-design';import {stepCivic} from './src/lib/game/data/civic';import {openFrontier,settleFrontier,growNeighbourhoods} from './src/lib/game/town-planning';import {ROAD_PROJECTS} from './src/lib/game/data/expansion';import {navigableWater,seaRoute,clearSeaSegment} from './src/lib/game/sailing';import {routeLength} from './src/lib/game/city';
let state;const get=()=>state,set=p=>Object.assign(state,typeof p==='function'?p(state):p);const actions=transportSlice(set,get),reset=()=>state={...defaultSave(),...UI_SEED,...actions,named:true,atHome:false,coins:20000};let count=0;const test=(name,f)=>{try{f();count++;console.log('✓ '+name);}catch(e){throw Error(name+': '+e.message)}};
test('public boarding needs proximity and funds, charges once, follows the wagon and exits safely',()=>{reset();const w=state.transport.wagons[0],p=wagonPoint(w,[]);state.gnomeX=4000;state.hailWagon(w.id);assert.equal(state.transport.ride,null);state.gnomeX=p.x;state.gnomeY=p.y;state.coins=0;state.hailWagon(w.id);assert.equal(state.transport.ride,null);state.coins=100;state.hailWagon(w.id);assert.equal(state.coins,100-BUS_FARE);state.hailWagon(w.id);assert.equal(state.coins,100-BUS_FARE);for(let i=0;i<30;i++)state.tickTransport(.25);assert(state.gnomeX!==p.x||state.gnomeY!==p.y);const coins=state.coins;state.leaveWagon();assert.equal(state.transport.ride,null);assert.equal(state.coins,coins);});
test('personal cart purchase is atomic and upgrades speed without allowing boats or combat mounting',()=>{reset();state.buyTravelCart();assert.equal(state.coins,20000-CART_PRICE);state.buyTravelCart();assert.equal(state.coins,20000-CART_PRICE);state.toggleTravelCart();assert(state.transport.mounted);state.afloat='raft';state.tickTransport(.25);assert(!state.transport.mounted);state.toggleTravelCart();assert(!state.transport.mounted);});
test('owned services need a city home and depot, charge rising prices and cannot use locked routes',()=>{reset();state.buyPassengerWagon('tideham');assert.equal(state.transport.wagons.length,2);state.city.buildings=[{kind:'home'},{kind:'depot'}];state.buyPassengerWagon('invalid');assert.equal(state.transport.wagons.length,2);state.buyPassengerWagon('bellweather-road');assert.equal(state.transport.wagons.length,2);state.buyPassengerWagon('tideham');assert.equal(state.coins,18200);assert.equal(wagonQuote(state.transport),7200);state.buyPassengerWagon('greenlane');assert.equal(state.coins,11000);});
test('wagon revenue transfers real NPC money and charges upkeep once at arrival; poor services pause',()=>{reset();state.city.buildings=[{kind:'home'},{kind:'depot'}];state.buyPassengerWagon('tideham');const w=state.transport.wagons.at(-1),r=transportRoutes([]).find(r=>r.id===w.route),last=r.points.at(-1);w.distance=routeLength(r.points)-1;w.dwell=0;state.civic.gnomes=[{id:'passenger',good:true,purse:20,x:last[0],y:last[1]}];const coins=state.coins,next=stepTransport(state,.25);assert.equal(next.coins,coins+BUS_FARE-2);assert.equal(next.civic.gnomes[0].purse,20-BUS_FARE);assert.equal(next.transport.earned,BUS_FARE);Object.assign(state,next);const once=state.coins;Object.assign(state,stepTransport(state,.25));assert.equal(state.coins,once);state.coins=0;const position=state.transport.wagons.at(-1).distance;Object.assign(state,stepTransport(state,.25));assert.equal(state.transport.wagons.at(-1).distance,position);assert.equal(state.coins,0);});
test('save migration preserves vehicles and styles, rejects malformed progress and resumes paid rides',()=>{reset();state.buyTravelCart();state.restyleHome('stone');assert.equal(state.playerHomeStyle,'stone');const p=wagonPoint(state.transport.wagons[0],[]);state.gnomeX=p.x;state.gnomeY=p.y;state.hailWagon('public-tideham');const loaded=migrate(snap(state));assert(loaded.transport.cart);assert.equal(loaded.transport.ride,'public-tideham');assert.equal(loaded.playerHomeStyle,'stone');const bad=migrate({...snap(state),transport:{cart:true,mounted:true,ride:'fake',wagons:[{id:'owned-1',route:'fake',owned:true,distance:NaN}],earned:Infinity}});assert.equal(bad.transport.wagons.length,2);assert.equal(bad.transport.ride,null);assert.equal(bad.transport.earned,0);});
test('home styles are deterministic and home expansion prices increase with each floor',()=>{assert.equal(HOME_STYLES.length,4);for(const style of HOME_STYLES)assert(style);assert.equal(homeStyle('house-1'),homeStyle('house-1'));for(let i=1;i<5;i++)assert(npcUpgradeCost(i+1)>npcUpgradeCost(i));});
test('sustained poverty can move a settler out, preserving the home for a later arrival and keeping core NPCs',()=>{reset();state.roadWorks.completed=ROAD_PROJECTS.map(p=>p.id);state.civic=openFrontier(state.civic,state.roadWorks.completed);state.civic.beat=96;state.civic=settleFrontier(state);const settler=state.civic.gnomes.at(-1),plot=state.civic.plots.find(p=>p.owner===settler.id);settler.purse=0;settler.hardship=19;const index=state.civic.gnomes.indexOf(settler),regulars=state.civic.gnomes.filter(g=>!g.archetype);state.civic.beat=(index+regulars.length-1)%regulars.length;const departed=stepCivic(state.civic,1,0,()=>true);assert(!departed.gnomes.some(g=>g.id===settler.id));assert(departed.gnomes.some(g=>g.id===state.civic.gnomes[0].id));assert.equal(departed.plots.find(p=>p.id===plot.id).stories,plot.stories);assert.equal(departed.plots.find(p=>p.id===plot.id).owner,null);});
test('full northern neighbourhoods survey additional safe sites instead of staying fixed at six homes',()=>{reset();state.roadWorks.completed=ROAD_PROJECTS.map(p=>p.id);state.civic=openFrontier(state.civic,state.roadWorks.completed);state.civic.plots=state.civic.plots.map(p=>p.id.startsWith('frontier-')?{...p,stories:1,owner:'occupied',shares:['occupied']}:p);const old=state.civic.plots.length,expanded=growNeighbourhoods(state);assert(expanded.plots.length>old);assert(expanded.plots.length<=old+6);});
test('buying transport preserves invested island wealth rather than making the economy poorer',()=>{reset();const before=developmentWorth(state);state.buyTravelCart();assert.equal(developmentWorth(state),before);});
test('offshore sailing reaches water beyond the previous coastal limits',()=>{for(const p of [{x:-2600,y:800},{x:5700,y:1000},{x:0,y:-5800},{x:2500,y:2600}])assert(navigableWater(p.x,p.y));const a={x:-35,y:530},b={x:-2600,y:800},path=seaRoute(a,b);assert(path);let p=a;for(const q of path){assert(clearSeaSegment(p,q));p=q;}});
console.log(count+' living town and transport checks passed');
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
      Buffer.from(r.outputFiles[0].text).toString("base64")
  );
} catch (e) {
  console.error(e.message);
  process.exit(1);
}
