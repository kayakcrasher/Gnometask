import {build} from 'esbuild-wasm';
const result=await build({stdin:{resolveDir:process.cwd(),contents:`
import assert from 'node:assert/strict';
import {useGame} from './src/lib/game/store';
import {defaultSave,migrate,applyDailyRollover} from './src/lib/game/save';
import {snap,UI_SEED,seedQuests} from './src/lib/game/store/persist';
import {freshOpening,SETTLING_SECONDS} from './src/lib/game/opening';
import {THIMBLE_HOME} from './src/lib/game/thimblehaven';
import {playerHome,playerHomeDoor} from './src/lib/game/city';
import {walkableLand} from './src/lib/game/world3';
const g=useGame.getState; const reset=()=>{useGame.setState({...defaultSave(),...UI_SEED});g().beginGame('Juniper');};
const free=()=>{g().chooseStarterLoan(25000);g().advanceCoach();};
let count=0;function test(name,fn){reset();fn();count++;console.log('✓ '+name);}
test('new game arrives at the player’s own Thimblehaven cottage with no landing or raid',()=>{
 const s=g();assert.deepEqual(playerHomeDoor(s),{x:THIMBLE_HOME.x,y:THIMBLE_HOME.y+34});assert.equal(s.gnomeX,playerHomeDoor(s).x);assert.equal(s.gnomeY,playerHomeDoor(s).y);assert(walkableLand(s.gnomeX,s.gnomeY));assert(s.deeds.includes('thimble-home'));assert.equal(playerHome(s).parcel,'thimble-home');assert.equal(s.city.buildings.filter(b=>b.kind==='home').length,1);assert.equal(s.landing,null);assert.equal(s.raids.length,0);assert(!s.quests.some(q=>q.id==='pappy-landing'));
});
test('loan choice and one brief tip never count as settling time or spawn enemies',()=>{
 for(let i=0;i<200;i++)g().tickOpening(1);assert.equal(g().opening.activeSeconds,0);g().chooseStarterLoan(25000);for(let i=0;i<200;i++)g().tickOpening(1);assert.equal(g().opening.activeSeconds,0);g().advanceCoach();assert.equal(g().coach,5);g().tickWorld();assert.equal(g().raids.length,0);assert.equal(g().landing,null);
});
test('visiting the actual town home records settling without moving the player',()=>{
 free();useGame.setState({gnomeX:100,gnomeY:400});g().enterInterior('cottage');assert(!g().opening.homeVisited);g().leaveInterior();const door=playerHomeDoor(g());useGame.setState({gnomeX:door.x,gnomeY:door.y});g().enterInterior('cottage');assert(g().opening.homeVisited);assert.equal(g().gnomeX,door.x);assert.equal(g().gnomeY,door.y);assert.equal(g().interior,'cottage');assert.equal(g().coach,5);
});
test('settling clock pauses while indoors, in menus or hidden, and ignores catch-up bursts',()=>{
 free();g().enterInterior('cottage');g().tickOpening(1);assert.equal(g().opening.activeSeconds,0);g().leaveInterior();useGame.setState({atHome:true});g().tickOpening(1);assert.equal(g().opening.activeSeconds,0);useGame.setState({atHome:false});globalThis.document={hidden:true};g().tickOpening(1);assert.equal(g().opening.activeSeconds,0);delete globalThis.document;g().tickOpening(9999);assert.equal(g().opening.activeSeconds,1);g().tickOpening(NaN);assert.equal(g().opening.activeSeconds,1);
});
test('skipping tips cannot bypass home visit; first goblins arrive once after three active minutes',()=>{
 free();for(let i=0;i<SETTLING_SECONDS+5;i++)g().tickOpening(1);assert(!g().opening.goblinsUnlocked);g().tickWorld();assert.equal(g().raids.length,0);g().enterInterior('cottage');g().leaveInterior();g().tickOpening(1);assert(g().opening.goblinsUnlocked);assert.equal(g().landing.goblins.length,5);assert.equal(g().quests.filter(q=>q.id==='pappy-landing').length,1);const landing=g().landing;for(let i=0;i<10;i++)g().tickOpening(1);assert.equal(g().landing,landing);
});
test('a home visit still gives the full quiet period before either goblin spawning path',()=>{
 free();g().enterInterior('cottage');g().leaveInterior();for(let i=0;i<SETTLING_SECONDS-1;i++){g().tickOpening(1);if(i%20===0)g().tickWorld();}assert.equal(g().landing,null);assert.equal(g().raids.length,0);g().tickOpening(1);assert(g().opening.goblinsUnlocked);assert(g().landing);g().tickWorld();assert(g().raids.some(r=>r.kind==='goblin'));
});
test('saving and daily rollover preserve a peaceful opening instead of seeding goblins or offline damage',()=>{
 free();g().enterInterior('cottage');g().leaveInterior();g().tickOpening(1);const saved=migrate(snap(g()));assert.equal(saved.opening.activeSeconds,1);assert(saved.opening.homeVisited);assert(!saved.opening.goblinsUnlocked);assert.equal(seedQuests(saved).landing,null);saved.lastVisitDate='2020-01-01';const rolled=applyDailyRollover(saved);assert(!rolled.absencePending);assert.deepEqual(rolled.buildingHp,saved.buildingHp);assert(!rolled.opening.goblinsUnlocked);assert.equal(seedQuests(rolled).landing,null);
});
test('old saves remain established games and completed opening state is stable through migration',()=>{
 const old=snap(g());delete old.opening;const established=migrate(old);assert(established.opening.goblinsUnlocked);assert(seedQuests(established).landing);const saved=migrate({...old,opening:{...freshOpening(),homeVisited:true,activeSeconds:180,goblinsUnlocked:true}});assert(saved.opening.goblinsUnlocked);assert.equal(saved.opening.activeSeconds,180);assert.equal(migrate({...old,opening:{version:1,activeSeconds:NaN}}).opening.activeSeconds,0);
});
console.log(count+' arrival, home and delayed-goblin checks passed');
`},bundle:true,format:'esm',platform:'node',write:false,logLevel:'silent',alias:{'@':process.cwd()+'/src'}});
try {await import('data:text/javascript;base64,'+Buffer.from(result.outputFiles[0].text).toString('base64'));}catch(e){console.error(e.stack?.split('\n')[0]??e.message);process.exit(1);}
