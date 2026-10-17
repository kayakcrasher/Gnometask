import { build } from "esbuild-wasm";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("../", import.meta.url));
const bundle = await build({
  stdin: {
    resolveDir: root,
    contents: `
import assert from 'node:assert/strict';
import {defaultSave,migrate} from './src/lib/game/save';
import {combatSlice} from './src/lib/game/store/combat';
import {citySlice} from './src/lib/game/store/city';
import {honourSlice} from './src/lib/game/store/honour';
import {developmentSlice} from './src/lib/game/store/development';
import {snap,UI_SEED} from './src/lib/game/store/persist';
import {PARCELS} from './src/lib/game/data/parcels';
import {citySiteError,cityRoadError,cityPath,cityRoads,cityDeedDeveloped,playerHome,playerHomeDoor,routeLength,stepCity,emptyCity,coerceCity,snapCityRoad} from './src/lib/game/city';
import {civicParcelOwner,buildingSiteClear} from './src/lib/game/land-planning';
import {developmentWorth} from './src/lib/game/development';
let state;const get=()=>state,set=p=>Object.assign(state,typeof p==='function'?p(state):p);
const actions={...citySlice(set,get),...combatSlice(set,get),...honourSlice(set,get),...developmentSlice(set,get)};
const reset=()=>state={...defaultSave(),...UI_SEED,...actions,named:true,atHome:false,coins:100000,logs:0,townHallLevel:5};
const tests=[];const test=(name,fn)=>{try{fn();tests.push(name)}catch(e){throw new Error(name+': '+e.message)}};
reset();state.deeds=PARCELS.filter(p=>!p.owner&&!civicParcelOwner(p,state.civic)&&!p.northern).map(p=>p.id);
const points=[];for(const id of state.deeds){const p=PARCELS.find(p=>p.id===id);for(let x=p.x+30;x<p.x+p.w-27;x+=30)for(let y=p.y+28;y<p.y+p.h-25;y+=30)if(!citySiteError(state,'depot',x,y))points.push([x,y]);}
assert(points.length>20);const baseline=structuredClone(snap(state));let factory,depot,home;
test('city construction charges once, requires owned clear land and Hall progression',()=>{
 state.deeds=[];state.buildCity('depot',...points[0]);assert.equal(state.city.buildings.length,0);state.deeds=baseline.deeds;state.townHallLevel=1;state.buildCity('depot',...points[0]);assert.equal(state.city.buildings.length,0);state.townHallLevel=5;
 const before=state.coins;state.buildCity('sawmill',...points[0]);factory=state.city.buildings[0];assert(factory);assert.equal(state.coins,before-380);
 state.buildCity('depot',...points[0]);assert.equal(state.city.buildings.length,1);assert.equal(state.coins,before-380,'overlapping placement is atomic');
 state.buildCity('depot',NaN,20);assert.equal(state.city.buildings.length,1);
 const candidates=points.filter(p=>!citySiteError(state,'depot',...p)).sort((a,b)=>Math.hypot(a[0]-factory.x,a[1]-factory.y)-Math.hypot(b[0]-factory.x,b[1]-factory.y));
 for(const p of candidates){const d={id:'candidate',kind:'depot',x:p[0],y:p[1]};if(cityPath(state,factory,d)){state.buildCity('depot',...p);depot=state.city.buildings.at(-1);break;}}assert(depot,'Factory can reach a real depot over public roads');
 assert(developmentWorth(state)>developmentWorth({...state,city:emptyCity()}),'City assets retain island wealth');
});
test('factories buy supplies with coins, obey storage caps, and cannot sell without carts',()=>{
 const before=state.coins;for(let i=0;i<6;i++)state.advanceCity();assert.equal(state.coins,before);assert.equal(state.city.buildings[0].stock,0);
 state.supplyCity(factory.id);assert.equal(state.city.buildings[0].supplies,10);const logs=state.logs;
 for(let i=0;i<60;i++)state.advanceCity();const f=state.city.buildings[0];assert.equal(f.stock,20);assert.equal(f.supplies,0);assert.equal(state.coins,before-30);assert.equal(state.logs,logs);
});
test('donkey carts follow a connected road route and pay only on delivery',()=>{
 state.hireCityCart(factory.id);assert.equal(state.city.carts.length,1);const cart=state.city.carts[0],len=routeLength(cart.route);assert(len>0);assert.equal(cart.route[0][0],factory.x);assert.equal(cart.route.at(-1)[0],depot.x);
 const coins=state.coins;state.hireCityCart(factory.id);assert.equal(state.coins,coins);assert.equal(state.city.carts.length,1);
 state.advanceCity();assert.equal(state.city.buildings[0].stock,14);if(len>54){assert.equal(state.coins,coins);assert.equal(state.city.carts[0].cargo,6);}
 for(let i=1;i<Math.ceil(len/54);i++)state.advanceCity();assert.equal(state.coins,coins+48);assert.equal(state.city.delivered,6);assert(state.city.carts[0].returning);
 for(let i=0;i<Math.ceil(len/54);i++)state.advanceCity();assert.equal(state.coins,coins+48,'Empty return must not pay again');assert.equal(state.city.carts[0].returning,false);
});
test('automatic carts buy supplies with coins and carry them back to factories and preserve supplies in transit',()=>{
 state.city.buildings=state.city.buildings.map(b=>b.id===factory.id?{...b,supplies:0,stock:0}:b);state.city.carts=state.city.carts.map(c=>({...c,distance:0,returning:false,cargo:0,supplies:0}));state.toggleCitySupply(factory.id);
 const logs=state.logs,coins=state.coins,len=routeLength(state.city.carts[0].route),ticks=Math.ceil(len/54);
 for(let i=0;i<ticks;i++)state.advanceCity();assert.equal(state.logs,logs);assert.equal(state.coins,coins-30);assert.equal(state.city.carts[0].supplies,10);assert.equal(state.city.buildings[0].supplies,0);
 const saved=snap(state),loaded=migrate(saved);assert.equal(loaded.city.carts[0].supplies,10);assert(loaded.city.carts[0].autoSupply);assert.equal(loaded.logs,state.logs);
 for(let i=0;i<ticks;i++)state.advanceCity();assert.equal(state.city.carts[0].supplies,0);assert.equal(state.city.buildings[0].supplies,10);assert.equal(state.logs,logs);assert.equal(state.coins,coins-30);
 state.toggleCitySupply(factory.id);
});
test('furniture production charges operating costs and never overfills storage',()=>{
 const f=state.city.buildings[0],original={...f},before=state.coins;Object.assign(f,{kind:'workshop',supplies:10,stock:0,work:2});state.city.carts=[];state.advanceCity();assert.equal(state.coins,before-2);assert.equal(state.city.buildings[0].stock,3);assert.equal(state.city.buildings[0].supplies,8);
 Object.assign(state.city.buildings[0],{stock:20,work:2});state.advanceCity();assert.equal(state.coins,before-2);assert.equal(state.city.buildings[0].supplies,8);
 state.city.buildings[0]=original;state.hireCityCart(factory.id);
});
test('city pauses at home, in combat, interiors and overseas',()=>{
 for(const [key,value] of [['atHome',true],['combat',{}],['interior','bank'],['abroad','reed']]){state[key]=value;const before=JSON.stringify(state.city);state.advanceCity();assert.equal(JSON.stringify(state.city),before);state[key]=key==='atHome'?false:null;}
});
test('city saves in-transit cargo without duplicate stock or payout and rejects corrupt data',()=>{
 state.advanceCity();const saved=snap(state),loaded=migrate(JSON.parse(JSON.stringify(saved)));assert.equal(loaded.city.buildings.length,saved.city.buildings.length);assert.equal(loaded.city.carts.length,1);assert.equal(loaded.city.carts[0].cargo,saved.city.carts[0].cargo);assert.equal(loaded.city.carts[0].distance,saved.city.carts[0].distance);assert.equal(loaded.city.delivered,saved.city.delivered);assert.equal(loaded.city.earned,saved.city.earned);
 const a=stepCity(saved),b=stepCity(loaded);assert.equal(a.coins,b.coins);assert.equal(a.city.delivered,b.city.delivered);
 const bad={...saved.city,earned:Infinity,buildings:[...saved.city.buildings,{id:'bad',kind:'__proto__',x:0,y:0}],carts:[{factory:'missing',route:[[0,0],[999,999]],cargo:99999}],roads:[{points:[[NaN,0],[0,0]]}]};const clean=coerceCity(bad,saved);assert.equal(clean.earned,0);assert.equal(clean.carts.length,0);assert(!clean.buildings.some(b=>b.id==='bad'));
 assert.equal(migrate({...saved,city:undefined}).city.buildings.length,0);
});
test('housing grows after trade, taxes residents, and upgrades need resources',()=>{
 const candidates=points.filter(p=>!citySiteError(state,'housing',...p));
 for(const p of candidates){const h={id:'candidate',kind:'housing',x:p[0],y:p[1]};if(cityPath(state,h,depot)){state.buildCity('housing',...p);home=state.city.buildings.at(-1);break;}}assert(home);
 state.city.beat=9;state.city.carts=[];const coins=state.coins;state.advanceCity();assert.equal(state.city.buildings.find(b=>b.id===home.id).residents,1);assert.equal(state.coins,coins+1);
 const before=state.coins;state.townHallLevel=2;state.upgradeCity(home.id);assert.equal(state.coins,before);state.townHallLevel=5;state.upgradeCity(home.id);assert.equal(state.city.buildings.find(b=>b.id===home.id).level,2);assert.equal(state.coins,before-200);
});
test('player home moves into the city for free and keeps its upgrades, interior and saved return position',()=>{
 const point=points.find(p=>!citySiteError(state,'home',...p));assert(point);const coins=state.coins;state.cottageLevel=2;state.houseUpgrades=['house-fence'];state.buildCity('home',...point);assert.equal(state.coins,coins);assert.equal(state.logs,0);
 const home=state.city.buildings.find(b=>b.kind==='home');assert(home);assert.equal(playerHome(state).x,point[0]);state.buildCity('home',...point);assert.equal(state.city.buildings.filter(b=>b.kind==='home').length,1);
 const loaded=migrate(snap(state));assert.equal(playerHome(loaded).x,point[0]);assert.equal(loaded.cottageLevel,2);assert.deepEqual(loaded.houseUpgrades,['house-fence']);
 state.returnCityHome();assert.equal(state.interior,'cottage');assert.equal(state.gnomeX,playerHomeDoor(state).x);assert.equal(state.gnomeY,playerHomeDoor(state).y);state.interior=null;state.gnomeX=0;state.gnomeY=0;state.combat={phase:'lost',playerHp:0};state.combatEnd();assert.equal(state.gnomeX,playerHomeDoor(state).x);assert.equal(state.gnomeY,playerHomeDoor(state).y);
});
test('road crew constructs connected safe streets, persists them and blocks land sale',()=>{
 let road=null;
 for(const r of cityRoads(state)){if(road)break;for(const p of r.points){if(road)break;for(const [dx,dy] of [[0,80],[0,-80],[80,0],[-80,0],[0,140],[140,0]]){const a=snapCityRoad(state,p),b=snapCityRoad(state,[p[0]+dx,p[1]+dy]);if(!cityRoadError(state,a,b)){road=[a,b];break;}}}}
 assert(road,'There is a safe buildable road off the existing network');const before=state.coins;state.layCityRoad(...road);assert.equal(state.city.roads.length,1);assert(state.coins<before);
 const loaded=migrate(snap(state));assert.equal(loaded.city.roads.length,1,'Constructed roads persist');
 const after=state.coins;state.layCityRoad([0,0],[100,100]);assert.equal(state.coins,after);assert(cityRoadError(state,[10,10],[10,10]));
 assert(cityDeedDeveloped({...state.city,buildings:[],roads:[{points:[[0,50],[200,50]],width:1.2}]},{id:'crossed',x:70,y:20,w:30,h:60}),'A road crossing a deed blocks sale even with both endpoints outside');
 const id=factory.parcel;state.sellParcel(id);assert(state.deeds.includes(id),'Factory land must not sell as empty');
});
for(const name of tests)console.log('✓',name);
console.log(tests.length+' city checks passed');
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
