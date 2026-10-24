import {build} from 'esbuild-wasm';
const r=await build({stdin:{resolveDir:process.cwd(),contents:`
import assert from 'node:assert/strict';
import {useGame} from './src/lib/game/store';
import {defaultSave,migrate} from './src/lib/game/save';
import {UI_SEED,snap,clearCombatTimer} from './src/lib/game/store/persist';
import {xpForLevel} from './src/lib/game/xp';
import {oceanLandings} from './src/lib/game/ocean-world';
import {PUBLIC_PORT,NORTH_LANDING} from './src/lib/game/ports';
import {CASINO_VENUES} from './src/lib/game/data/sunstep';
import {playerHome} from './src/lib/game/city';
const get=useGame.getState,set=useGame.setState;let failures=0,passed=0;
function reset(){clearCombatTimer();const base=defaultSave();set({...base,...UI_SEED,named:true,gnomeName:'Bugwatch',atHome:false,hydrated:true,coins:1000000,gnomeX:PUBLIC_PORT.x,gnomeY:PUBLIC_PORT.y,hulls:['sail'],skills:{...base.skills,sailing:xpForLevel(99),navalWarfare:xpForLevel(99)}});}
function test(name,fn){reset();try{fn();passed++;console.log('✓ '+name);}catch(e){failures++;console.error('FAIL '+name+': '+e.message);}}
test('returning home through the town council counts as an actual home visit',()=>{get().beginGame('Juniper');get().chooseStarterLoan(25000);get().advanceCoach();set({gnomeX:2500,gnomeY:-3000});get().returnCityHome();assert.equal(get().interior,'cottage');assert.equal(get().opening.homeVisited,true);});
test('casino entry cannot hide a naval battle',()=>{const s=get();set({afloat:'row',naval:{...s.naval,battle:'ragged'}});get().enterCasino(CASINO_VENUES[0].id);assert.equal(get().interior,null);assert.equal(get().naval.battle,'ragged');});
test('interior entry cannot hide an active land fight',()=>{set({combat:{phase:'fighting'}});get().enterInterior('cottage');assert.equal(get().interior,null);});
test('raids can depart from the Thimblehaven public landing',()=>{set({gnomeX:NORTH_LANDING.x,gnomeY:NORTH_LANDING.y});get().raidIsle('cutlass');assert.equal(get().raidVisit?.isleId,'cutlass');assert.equal(get().raidVisit.returnX,NORTH_LANDING.water.x);assert.equal(get().raidVisit.returnY,NORTH_LANDING.water.y);get().leaveIsle();assert.equal(get().gnomeX,NORTH_LANDING.water.x);assert.equal(get().afloat,'sail');});
test('a disabled hull cannot bypass repairs through the raid chart',()=>{const s=get();set({naval:{...s.naval,integrity:{sail:0}}});get().raidIsle('cutlass');assert.equal(get().raidVisit,null);});
function freight(){const s=get();set({hulls:['barge'],ports:{...s.ports,plots:['thimble'],docks:[{site:'thimble',level:1,style:'timber'}]}});}
test('a ship away on a freight contract cannot simultaneously sail an island raid',()=>{freight();get().dispatchShipment('thimble','capital','barge');assert.equal(get().ports.shipments.length,1);get().raidIsle('cutlass');assert.equal(get().raidVisit,null);});
test('a disabled hull cannot run profitable freight trips',()=>{freight();const s=get();set({naval:{...s.naval,integrity:{barge:0}}});const before=get().coins;get().dispatchShipment('thimble','capital','barge');assert.equal(get().ports.shipments.length,0);assert.equal(get().coins,before);});
test('restoring a missing starter deed preserves the existing home and its upgrades',()=>{get().beginGame('Juniper');const old=snap(get());old.deeds=[];old.cottageLevel=2;old.houseUpgrades=['house-lanterns'];const loaded=migrate(old);assert(loaded.deeds.includes('thimble-home'));assert.equal(loaded.city.buildings.filter(b=>b.kind==='home').length,1);assert.equal(playerHome(loaded).id,'thimble-starter-home');assert.equal(loaded.cottageLevel,2);assert.deepEqual(loaded.houseUpgrades,['house-lanterns']);});
test('previously lost starter homes are restored on load',()=>{get().beginGame('Juniper');const old=snap(get());old.city.buildings=[];const loaded=migrate(old);assert.equal(loaded.city.buildings.filter(b=>b.kind==='home').length,1);assert.equal(playerHome(loaded).parcel,'thimble-home');});
test('healthy, unreserved ships remain available when a larger hull is on freight',()=>{freight();get().dispatchShipment('thimble','capital','barge');set({hulls:['barge','sail']});get().raidIsle('cutlass');assert.equal(get().raidVisit?.boat,'sail');});
test('ordinary land visits still open the casino and cottage normally',()=>{get().enterCasino(CASINO_VENUES[0].id);assert.equal(get().interior,'casino');get().leaveInterior();get().enterInterior('cottage');assert.equal(get().interior,'cottage');});
test('the capital harbour is named consistently with the opening scene',()=>{assert.match(PUBLIC_PORT.name,/Port Victoria/);});
test('owned wharves and remote island landings retain their own raid return points',()=>{for(const port of [{id:'thimble',x:1930,y:-3160,water:{x:1700,y:-3200}},oceanLandings().find(p=>p.town)]){reset();const s=get();set({gnomeX:port.x,gnomeY:port.y,ports:{...s.ports,docks:[{site:'thimble',level:1,style:'timber'}]}});get().raidIsle('cutlass');assert.equal(get().raidVisit?.returnX,port.water.x);assert.equal(get().raidVisit?.returnY,port.water.y);assert.equal(get().raidVisit.boat,'sail');}});
test('navigation charts remain usable aboard without permitting visits to buildings',()=>{set({afloat:'row'});get().enterInterior('chart');assert.equal(get().interior,'chart');get().leaveInterior();get().enterInterior('cottage');assert.equal(get().interior,null);});
clearCombatTimer();console.log(passed+' consistency checks passed; '+failures+' failed');if(failures)throw Error('Consistency regressions: '+failures);
`},bundle:true,format:'esm',platform:'node',write:false,logLevel:'silent',alias:{'@':process.cwd()+'/src'}});
try{await import('data:text/javascript;base64,'+Buffer.from(r.outputFiles[0].text).toString('base64'));}catch(e){console.error(e.message);process.exit(1);}
