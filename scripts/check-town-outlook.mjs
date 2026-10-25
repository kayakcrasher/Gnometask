import {build} from 'esbuild-wasm';
const r=await build({stdin:{resolveDir:process.cwd(),contents:`
import assert from 'node:assert/strict';
import {defaultSave} from './src/lib/game/save';
import {townOutlook} from './src/lib/game/town-outlook';
import {stepThimble} from './src/lib/game/thimblehaven';
let n=0;function test(name,f){f();n++;console.log('✓ '+name);}
test('forecast matches real collection and never mutates the save',()=>{const s=defaultSave(),before=JSON.stringify(s),o=townOutlook(s);let live=s;for(let i=0;i<o.ticks;i++)live={...live,...stepThimble(live)};assert.equal(o.levy,live.coins-s.coins);assert.equal(o.households[0].next,live.thimble.residents[0].purse);assert.equal(JSON.stringify(s),before);assert.equal(o.seconds,90);});
test('projects completing before collection are included',()=>{const s=defaultSave();s.thimble.construction={id:'well',progress:5};const o=townOutlook(s);assert(o.advice.some(a=>a.includes('fish market')));assert.equal(o.levy,2);});
test('full starter towns explain the housing gate',()=>{assert(townOutlook(defaultSave()).advice.some(a=>a.includes('newcomer cottages')));});
test('healthy expanded towns predict arrivals and household upgrade spending',()=>{const s=defaultSave();s.thimble.projects=['well','market','depot','cottages','hall'];s.thimble.residents[0].purse=200;const o=townOutlook(s);assert.equal(o.newFamilies.length,1);assert.equal(o.newFamilies[0].name,'Pippa Mossbell');assert.equal(o.households[0].next,91);assert.equal(o.households[0].building,2);assert.equal(o.levy,3);});
test('recession advice identifies threats, repairs and tax relief without claiming to control the cycle',()=>{const s=defaultSave();s.economy.day=37;s.raids=Array.from({length:20},(_,i)=>({id:'r'+i,hp:10,x:0,y:0}));s.buildingHp.cottage=1;s.thimble.residents[0].purse=0;const o=townOutlook(s);assert.equal(o.climate.phase,'depression');assert(o.advice.some(a=>a.includes('Clear raids')));assert(o.advice.some(a=>a.includes('Repair buildings')));assert(o.advice.some(a=>a.includes('does not change')));assert.equal(o.leaving.length,1);assert.equal(o.households[0].next,null);});
test('collection countdown follows saved simulation beats',()=>{const s=defaultSave();s.thimble.beat=19;assert.equal(townOutlook(s).seconds,9);});
console.log(n+' town outlook checks passed');
`},bundle:true,platform:'node',format:'esm',write:false,logLevel:'silent',alias:{'@':process.cwd()+'/src'}});try{await import('data:text/javascript;base64,'+Buffer.from(r.outputFiles[0].text).toString('base64'));}catch(e){console.error(e.message);process.exit(1);}
