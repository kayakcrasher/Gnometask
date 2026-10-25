import {build} from 'esbuild-wasm';
const r=await build({stdin:{resolveDir:process.cwd(),contents:`
import assert from 'node:assert/strict';
import clipping from 'polygon-clipping';
import {PARCELS} from './src/lib/game/data/parcels';
import {landArea,parcelLand,buildingSiteClear,roadSiteClear,insideParcel,pointInLand} from './src/lib/game/land-planning';
import {NATIONAL_PARK,PARK_RING} from './src/lib/game/data/national-park';
import {sailingVelocity} from './src/lib/game/visual-motion';
import {windSpeedFactor,hullHandling} from './src/lib/game/sea-weather';
import {defaultSave,migrate} from './src/lib/game/save';
import {npcRoutine,npcWalkable} from './src/lib/game/npc-brain';
let n=0;const test=(name,f)=>{f();n++;console.log('✓ '+name);};
const added=PARCELS.filter(p=>p.id.startsWith('island-')),old=PARCELS.filter(p=>!p.id.startsWith('island-'));
test('island-wide deeds have stable unique IDs, substantial coverage and positive prices',()=>{assert(added.length>150);assert.equal(new Set(PARCELS.map(p=>p.id)).size,PARCELS.length);assert(added.every(p=>p.price>0&&p.usableArea>=1000));assert(added.some(p=>p.x<0));assert(added.some(p=>p.y< -4000));assert(added.some(p=>p.x>3500));});
test('new deeds never overlap historical deeds or each other',()=>{for(const p of added)for(const q of old){if(p.x>=q.x+q.w||p.x+p.w<=q.x||p.y>=q.y+q.h||p.y+p.h<=q.y)continue;for(let x=Math.max(p.x,q.x)+3.7;x<Math.min(p.x+p.w,q.x+q.w);x+=17)for(let y=Math.max(p.y,q.y)+4.1;y<Math.min(p.y+p.h,q.y+q.h);y+=17)assert(!pointInLand(p.land,x,y),p.id+' vs '+q.id);}for(let i=0;i<added.length;i++)for(let j=i+1;j<added.length;j++){const p=added[i],q=added[j];assert(p.x>=q.x+q.w||p.x+p.w<=q.x||p.y>=q.y+q.h||p.y+p.h<=q.y);}});
test('park cannot be sold, built on or paved',()=>{const p=NATIONAL_PARK;assert(!buildingSiteClear(p.x,p.y));assert(!roadSiteClear(p.x,p.y));for(const deed of PARCELS)for(let x=p.x-p.rx+4;x<p.x+p.rx;x+=23)for(let y=p.y-p.ry+6;y<p.y+p.ry;y+=23)if(pointInLand([[PARK_RING]],x,y))assert(!pointInLand(deed.land,x,y));});
test('clipped deed ownership rejects holes and excluded land',()=>{const p={id:'island-test',x:0,y:0,w:100,h:100,land:[[[[0,0],[100,0],[100,100],[0,100],[0,0]],[[40,40],[60,40],[60,60],[40,60],[40,40]]]]};assert(insideParcel(p,20,20));assert(!insideParcel(p,50,50));});
test('migration retains island-wide deeds and existing homes',()=>{const s=defaultSave();s.deeds.push(added[0].id);const m=migrate(s);assert(m.deeds.includes(added[0].id));assert(m.deeds.includes('thimble-home'));assert(m.city.buildings.some(b=>b.kind==='home'));});
test('headwinds slow sailboats without stopping them; rowing and engines stay independent',()=>{for(let x=-10000;x<=10000;x+=5000)for(let a=-Math.PI;a<Math.PI;a+=.2){const f=windSpeedFactor('sloop',a,x,-3000);assert(f>.7&&f<1.1);assert.equal(windSpeedFactor('row',a,x,0),1);assert.equal(windSpeedFactor('sloop',a,x,0,['engine']),1);}assert(windSpeedFactor('sloop',.77,0,0)>windSpeedFactor('sloop',.77+Math.PI,0,0));});
test('residents visit real nearby home entrances and rest at night',()=>{const home={id:'visitor',x:2200,y:-3100,job:'carpenter'},neighbour={x:2300,y:-3100,w:26,h:24};const r=npcRoutine(home,'day',2,[neighbour]);assert.equal(r.activity,'visiting');assert(Math.hypot(r.point.x-neighbour.x,r.point.y-neighbour.y)<80);assert(npcWalkable(r.point.x,r.point.y,[neighbour]));assert.equal(npcRoutine(home,'night',2,[neighbour]).activity,'resting');});
test('large hulls accelerate and turn more slowly than small boats',()=>{assert(hullHandling('row').turn>hullHandling('galleon').turn);assert(sailingVelocity(0,100,1000,.1,hullHandling('row').acceleration)>sailingVelocity(0,100,1000,.1,hullHandling('galleon').acceleration));});
console.log(n+' island life checks passed; '+added.length+' new deeds');
`},bundle:true,platform:'node',format:'esm',write:false,logLevel:'silent'});
try{await import('data:text/javascript;base64,'+Buffer.from(r.outputFiles[0].text).toString('base64'));}catch(e){console.error(e.message);process.exit(1);}
