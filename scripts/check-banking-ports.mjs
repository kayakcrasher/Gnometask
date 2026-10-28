import { build } from "esbuild-wasm";
const r = await build({
  stdin: {
    resolveDir: process.cwd(),
    contents: `
import assert from 'node:assert/strict';
import {defaultSave,migrate} from './src/lib/game/save';
import {UI_SEED,snap} from './src/lib/game/store/persist';
import {sessionSlice} from './src/lib/game/store/session';
import {maritimeSlice} from './src/lib/game/store/maritime';
import {gatherSlice} from './src/lib/game/store/gather';
import {STARTER_LOANS,accrueBank,coerceBank} from './src/lib/game/bank';
import {PORT_SITES,NORTH_LANDING,PUBLIC_PORT,portNavigationRoute,shippingRoute,shippingQuote,shipmentPosition,coercePorts} from './src/lib/game/ports';
import {developmentWorth} from './src/lib/game/development';
import {walkableLand} from './src/lib/game/world3';
import {navigableWater,clearSeaSegment,sailingSpeed} from './src/lib/game/sailing';
import {xpForLevel} from './src/lib/game/xp';
import {BOATS} from './src/lib/game/data/boats';
let state;const get=()=>state,set=p=>Object.assign(state,typeof p==='function'?p(state):p);const actions={...sessionSlice(set,get),...maritimeSlice(set,get),...gatherSlice(set,get)};
const reset=()=>state={...defaultSave(),...UI_SEED,...actions,named:true,atHome:false,coins:1000000,skills:{...defaultSave().skills,sailing:xpForLevel(99)},toggleTask:()=>{}};
let count=0;const test=(name,f)=>{try{f();count++;console.log('✓ '+name);}catch(e){throw Error(name+': '+e.message);}};
test('each fresh game must pick one supported loan, credited once with Pappy as co-signer',()=>{for(const amount of STARTER_LOANS){reset();state.beginGame('Moss');const before=state.coins;assert(state.bank.pending);state.chooseStarterLoan(26000);assert(state.bank.pending);assert.equal(state.coins,before);state.chooseStarterLoan(amount);assert(!state.bank.pending);assert(state.bank.signed);assert.equal(state.bank.owed,amount);assert.equal(state.coins,before+amount);state.chooseStarterLoan(105000);assert.equal(state.coins,before+amount);}});
test('0.6% compounds only after seven market days; persistence prevents double interest',()=>{reset();state.chooseStarterLoan(50000);const b=state.bank;assert.equal(accrueBank(b,7),b);const week=accrueBank(b,8);assert.equal(week.owed,50300);assert.equal(week.interest,300);assert.equal(accrueBank(week,8),week);const two=accrueBank(week,15);assert.equal(two.owed,50602);state.bank=two;const saved=migrate(snap(state),'2026-10-20');assert.equal(saved.bank.owed,50602);assert.equal(accrueBank(saved.bank,15),saved.bank);});
test('repayment cannot overdraw or duplicate credit; cleared accounts stay cleared',()=>{reset();state.chooseStarterLoan(25000);const before=state.coins;state.repayBank(NaN);state.repayBank(-100);assert.equal(state.coins,before);state.coins=100;state.repayBank(50000);assert.equal(state.coins,0);assert.equal(state.bank.owed,24900);state.coins=30000;state.repayBank(99999);assert.equal(state.coins,5100);assert.equal(state.bank.owed,0);state.chooseStarterLoan(105000);assert.equal(state.coins,5100);assert.equal(accrueBank(state.bank,50).owed,0);});
test('old saves receive no automatic credit or debt; pending choices survive reloading',()=>{reset();const before=state.coins;const old={...snap(state)};delete old.bank;delete old.ports;const loaded=migrate(old,'2026-10-20');assert.equal(loaded.coins,before);assert(!loaded.bank.pending&&!loaded.bank.signed);assert.equal(loaded.ports.docks.length,0);state.beginGame('Sprout');assert(migrate(snap(state),'2026-10-20').bank.pending);assert.equal(coerceBank({signed:true,original:123,owed:Infinity}).owed,0);});
test('northern landing, paid waterfront plots and entire freight routes stay on legal land/water',()=>{for(const a of [...PORT_SITES,NORTH_LANDING]){assert(walkableLand(a.x,a.y),a.name+' shore');assert(navigableWater(a.water.x,a.water.y),a.name+' approach');}for(const a of PORT_SITES)for(const b of [PUBLIC_PORT,...PORT_SITES])if(a.id!==b.id){const path=shippingRoute(a.id,b.id);assert(path,a.id+' route '+b.id);let p=a.water;for(const q of path){assert(clearSeaSegment(p,q));p=q;}}});
test('harbour navigation follows clear surveyed lanes without a full map search',()=>{for(const [start,id] of [[PUBLIC_PORT.water,'north-landing'],[NORTH_LANDING.water,'capital']]){const path=portNavigationRoute(start,id);assert(path);let p=start;for(const q of path){assert(clearSeaSegment(p,q));p=q;}}});
test('land purchase needs proximity; piers require a deed, funds, escalating upgrades and paid styling',()=>{reset();state.upgradeDock('thimble');assert.equal(state.ports.docks.length,0);state.buyPortPlot('thimble');assert.equal(state.ports.plots.length,0);Object.assign(state,{gnomeX:1930,gnomeY:-3160});state.buyPortPlot('thimble');assert.equal(state.coins,982000);state.buyPortPlot('thimble');assert.equal(state.coins,982000);state.upgradeDock('thimble');assert.equal(state.coins,967000);assert.equal(state.ports.docks[0].level,1);state.upgradeDock('thimble');assert.equal(state.coins,922000);state.styleDock('thimble','mint');assert.equal(state.coins,917000);state.styleDock('thimble','mint');assert.equal(state.coins,917000);state.upgradeDock('thimble');assert.equal(state.coins,737000);state.upgradeDock('thimble');assert.equal(state.coins,737000);});
test('port investment remains part of island development wealth',()=>{reset();const before=developmentWorth(state);Object.assign(state,{gnomeX:1930,gnomeY:-3160});state.buyPortPlot('thimble');state.upgradeDock('thimble');assert.equal(developmentWorth(state),before);});
test('fittings are hull-specific, paid once and improve actual movement/cargo',()=>{reset();state.hulls=['coaster'];state.gnomeX=PUBLIC_PORT.x;state.gnomeY=PUBLIC_PORT.y;const before=state.coins;state.buyBoatPart('coaster','engine');assert.equal(state.coins,before-7500);state.buyBoatPart('coaster','engine');assert.equal(state.coins,before-7500);assert(sailingSpeed('coaster',0,state.ports.parts.coaster)>sailingSpeed('coaster',0));assert.equal(sailingSpeed('row',0,state.ports.parts.row),180);state.buyBoatPart('coaster','hold');assert.equal(shippingQuote('coaster',1,state.ports.parts.coaster).cargo,60);assert.equal(shippingQuote('coaster',1,[],.5).sale,676);});
test('shipping reserves the boat and berth, debits cargo once, survives saves and pays only on arrival',()=>{reset();state.ports.plots=['thimble'];state.ports.docks=[{site:'thimble',level:1,style:'timber'}];state.hulls=['coaster','barge'];state.shipStores={holds:{coaster:{stock:60,distance:0}}};state.dispatchShipment('thimble','capital','coaster');assert.equal(state.ports.shipments.length,1);const trip=state.ports.shipments[0],coins=state.coins;assert(trip.duration>=45);assert(shipmentPosition(trip));state.dispatchShipment('thimble','capital','coaster');state.dispatchShipment('thimble','capital','barge');assert.equal(state.coins,coins);assert.equal(state.ports.shipments.length,1);state.gnomeX=PUBLIC_PORT.x;state.gnomeY=PUBLIC_PORT.y;state.sailTo('haven','coaster');assert.equal(state.afloat,null);const saved=migrate(snap(state),'2026-10-20');assert.equal(saved.ports.shipments.length,1);state.ports=saved.ports;state.ports.shipments[0].elapsed=trip.duration-.25;state.tickMaritime(.25);assert.equal(state.ports.shipments[0].leg,'return');assert.equal(state.coins,coins+trip.sale);assert.equal(state.ports.delivered,trip.cargo);state.ports=migrate(snap(state),'2026-10-20').ports;assert.equal(state.ports.shipments[0].leg,'return');state.ports.shipments[0].elapsed=trip.duration-.25;state.tickMaritime(.25);assert.equal(state.ports.shipments.length,0);state.tickMaritime(.25);assert.equal(state.coins,coins+trip.sale);assert.equal(migrate(snap(state),'2026-10-20').ports.shipments.length,0);});
test('the free northern landing supports arriving and boarding without buying land',()=>{reset();state.gnomeX=NORTH_LANDING.water.x;state.gnomeY=NORTH_LANDING.water.y;state.afloat='row';state.sailTo('dock');assert.equal(state.afloat,null);assert.equal(state.gnomeX,NORTH_LANDING.x);state.sailTo('haven','row');assert.equal(state.afloat,'row');assert.equal(state.gnomeX,NORTH_LANDING.water.x);});
test('every premium boat has a real hull, skill and money gate, and survives saving',()=>{for(const b of BOATS.filter(b=>b.price>=14000)){reset();state.coins=b.price;state.skills.sailing=0;state.buyBoat(b.id);assert(!state.hulls.includes(b.id));state.skills.sailing=xpForLevel(99);state.skills.navalWarfare=xpForLevel(99);state.coins=b.price-1;state.buyBoat(b.id);assert(!state.hulls.includes(b.id));state.coins=b.price;state.buyBoat(b.id);assert.equal(state.coins,0);assert(state.hulls.includes(b.id));assert(migrate(snap(state),'2026-10-20').hulls.includes(b.id));assert(navigableWater(b.x,b.y));}});
test('all boats including the rowboat can cast with a rod; movement cannot interrupt a catch',()=>{reset();state.ownedGear=['rod-wood'];state.afloat='row';state.gnomeX=-50;state.gnomeY=470;state.castLine('sea',0,0,'row');assert(state.fishing);const x=state.gnomeX;state.sailStep(x-10,state.gnomeY);assert.equal(state.gnomeX,x);});
test('malformed dock and fitting data is removed without deleting valid ownership',()=>{const p=coercePorts({plots:['thimble','oops','thimble'],docks:[{site:'oops',level:99},{site:'thimble',level:2,style:'mint'}],parts:{coaster:['engine','fake','engine'],megayacht:['hold']},shipments:[{boat:'coaster',origin:'fake',elapsed:-1}],earned:NaN},['coaster']);assert.deepEqual(p.plots,['thimble']);assert.equal(p.docks.length,1);assert.deepEqual(p.parts.coaster,['engine']);assert.equal(p.parts.megayacht,undefined);assert.equal(p.shipments.length,0);assert.equal(p.earned,0);});
console.log(count+' banking, fleet and port checks passed');
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
