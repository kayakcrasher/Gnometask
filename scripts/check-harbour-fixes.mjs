import {build} from 'esbuild-wasm';
const r=await build({stdin:{resolveDir:process.cwd(),contents:`
import assert from 'node:assert/strict';
import {useGame} from './src/lib/game/store';
import {defaultSave} from './src/lib/game/save';
import {UI_SEED} from './src/lib/game/store/persist';
import {nearestHarbour} from './src/lib/game/harbour-navigation';
import {NORTH_LANDING,portDestination,portNavigationRoute} from './src/lib/game/ports';
import {clearSeaSegment} from './src/lib/game/sailing';
import {oceanIslandsNear,setOceanSeed} from './src/lib/game/ocean-world';
const g=useGame.getState,set=useGame.setState;let count=0;
function reset(){setOceanSeed(1013);set({...defaultSave(),...UI_SEED,named:true,hydrated:true,atHome:false,gnomeX:1350,gnomeY:-3230,afloat:'row',coins:13,tasks:[]});}
function test(name,f){reset();f();count++;console.log('✓ '+name);}
test('return chooses the nearby northern landing and does not teleport to the capital',()=>{assert.equal(nearestHarbour(g())?.id,'north-landing');g().sailTo('dock');assert.equal(g().portCourse,'north-landing');assert.equal(g().sailHome,false);assert.equal(g().afloat,'row');assert.equal(g().gnomeX,1350);});
test('far-ocean return finds a local working town instead of crossing the whole world',()=>{const port=oceanIslandsNear(80000,10000,16000).find(i=>i.frontier&&i.town);assert(port);set({gnomeX:port.water.x,gnomeY:port.water.y});const target=nearestHarbour(g());assert.equal(target?.id,port.id);assert(target.town);});
test('owned docks and finished supply quays participate in nearby return selection',()=>{set({gnomeX:1820,gnomeY:-3470,ports:{...g().ports,docks:[{site:'spruce',level:1,style:'timber'}]}});assert.equal(nearestHarbour(g())?.id,'spruce');set({gnomeX:1550,gnomeY:-3000});assert.notEqual(nearestHarbour(g())?.id,'thimble-supply');set({thimble:{...g().thimble,projects:['well','market','depot','cottages','hall','supply-dock']}});assert.equal(nearestHarbour(g())?.id,'thimble-supply');});
test('every selected return route has clear water legs',()=>{for(const p of [{x:-300,y:470},{x:1350,y:-3230},{x:-3000,y:-2000}]){set({gnomeX:p.x,gnomeY:p.y});const port=nearestHarbour(g());assert(port);const route=portNavigationRoute(p,port.id);assert(route?.length);let last=p;for(const next of route){assert(clearSeaSegment(last,next));last=next;}}});
test('docking on arrival clears pending navigation and lands at the right shore',()=>{set({gnomeX:NORTH_LANDING.water.x,gnomeY:NORTH_LANDING.water.y,portCourse:'capital',sailHome:true});g().sailTo('dock');assert.equal(g().afloat,null);assert.equal(g().gnomeX,NORTH_LANDING.x);assert.equal(g().portCourse,null);assert.equal(g().sailHome,false);});
test('unsafe course requests cannot queue a surprise voyage after a modal or fight',()=>{const base=g();for(const patch of [{interior:'ship-cabin'},{fishing:{}},{atHome:true},{named:false},{combat:{}},{abroad:'mucktooth'},{bank:{...base.bank,pending:true}},{naval:{...base.naval,rescue:{}}},{naval:{...base.naval,boarding:{}}},{transport:{...base.transport,ride:{}}}]){reset();set(patch);g().plotPortCourse('capital');assert.equal(g().portCourse,null);}reset();g().plotPortCourse('capital');assert.equal(g().portCourse,'capital');});
test('naval retreat keeps the fight active while choosing a nearby port',()=>{set({naval:{...g().naval,battle:'pirate'}});g().retreatShip();assert.equal(g().portCourse,'north-landing');assert.equal(g().naval.battle,'pirate');});
test('affordable loading buys only whole crates, keeps spare coins and cannot overfill',()=>{set({afloat:null,hulls:['coaster'],gnomeX:100,gnomeY:720});g().buyProvisions('coaster',Math.floor(g().coins/5));assert.equal(g().shipStores.holds.coaster.stock,2);assert.equal(g().coins,3);g().buyProvisions('coaster',Math.floor(g().coins/5));assert.equal(g().shipStores.holds.coaster.stock,2);set({coins:100,shipStores:{holds:{coaster:{stock:59,distance:125}}}});g().buyProvisions('coaster',Math.floor(g().coins/5));assert.equal(g().shipStores.holds.coaster.stock,60);assert.equal(g().shipStores.holds.coaster.distance,125);assert.equal(g().coins,95);});
console.log(count+' harbour reliability checks passed');
`},bundle:true,platform:'node',format:'esm',write:false,logLevel:'silent',alias:{'@':process.cwd()+'/src'}});try{await import('data:text/javascript;base64,'+Buffer.from(r.outputFiles[0].text).toString('base64'));}catch(e){console.error(e.message);process.exit(1);}
