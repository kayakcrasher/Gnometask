// Optional browser regression: install playwright-core, or set PLAYWRIGHT_MODULE to its module path.
import {build} from 'esbuild-wasm';
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {PerspectiveCamera,Vector3} from 'three';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright-core');
const bundle=await build({stdin:{resolveDir:root,contents:`import {defaultSave} from './src/lib/game/save';import {setOceanSeed} from './src/lib/game/ocean-world';setOceanSeed(1013);const save=defaultSave();save.named=true;save.gnomeName='Clover';save.gnomeX=2210;save.gnomeY=-3066;save.coins=10000;save.tasks=[];export default save;`},bundle:true,platform:'node',format:'esm',write:false,logLevel:'silent',alias:{'@':path.join(root,'src')}});
const save=(await import('data:text/javascript;base64,'+Buffer.from(bundle.outputFiles[0].text).toString('base64'))).default;
const browser=await chromium.launch({...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const p=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});p.setDefaultTimeout(60000);
 const errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error'&&/shader|WebGLProgram/.test(m.text()))errors.push(m.text());});
 await p.addInitScript(s=>{if(!localStorage.getItem('gnome-tasks:v2'))localStorage.setItem('gnome-tasks:v2',JSON.stringify(s));},save);
 await p.route('**/*',async r=>{const u=new URL(r.request().url());if(u.hostname!=='hollow.local')return r.abort();const f=u.pathname==='/'?'index.html':u.pathname.slice(1);try{await r.fulfill({body:await fs.readFile(path.join(root,'android/build/assets/game',f)),contentType:f.endsWith('.html')?'text/html':f.endsWith('.js')?'application/javascript':f.endsWith('.css')?'text/css':'application/octet-stream'});}catch{await r.fulfill({status:404,body:''});}});
 await p.goto('https://hollow.local/');await p.getByRole('button',{name:'Continue — Clover',exact:true}).click();
 await p.evaluate(()=>window.__game.getState().returnCityHome());
 const home=p.getByRole('dialog',{name:'Your Thimblehaven home',exact:true});await home.waitFor();
 await p.waitForFunction(()=>window.__indoor?.getState().room==='cottage');
 await p.getByRole('button',{name:'Walk forward',exact:true}).waitFor();
 const floorTap=async(x,z)=>{await p.waitForFunction(()=>window.__indoor?.getState().room==='cottage');await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));const box=await p.locator('canvas').boundingBox(),aspect=box.width/box.height,d=Math.max(8,8.8/(2*Math.tan(Math.PI/8)*aspect)),camera=new PerspectiveCamera(45,aspect,.1,1000);camera.position.set(0,d*.68,d*.74);camera.lookAt(0,.4,0);camera.updateMatrixWorld();const v=new Vector3(x,.035,z).project(camera);await p.mouse.click(box.x+(v.x+1)*box.width/2,box.y+(1-v.y)*box.height/2);};
 const start=await p.evaluate(()=>window.__indoor.getState().position);
 await p.keyboard.down('ArrowUp');await p.waitForTimeout(700);await p.keyboard.up('ArrowUp');
 await p.waitForFunction(z=>window.__indoor.getState().position.z<z-.2,start.z);
 await floorTap(1,1);await p.waitForFunction(()=>{const s=window.__indoor.getState();return Math.hypot(s.position.x-1,s.position.z-1)<.15});
 assert.equal(await p.locator('canvas').count(),1,'Only the interior renderer should be active');
 await p.screenshot({path:process.env.HOME_SCREENSHOT||'/tmp/hollow-home.png'});
 await p.getByRole('button',{name:'Arrange furniture',exact:true}).click();
 const frozen=await p.evaluate(()=>window.__indoor.getState().position);await p.keyboard.down('ArrowRight');await p.waitForTimeout(300);await p.keyboard.up('ArrowRight');assert.deepEqual(await p.evaluate(()=>window.__indoor.getState().position),frozen);
 await p.getByRole('combobox',{name:'Your furniture',exact:true}).selectOption('starter-table');
 await p.getByRole('button',{name:'Move left',exact:true}).click();
 assert.equal(await p.evaluate(()=>window.__game.getState().homeRoom.items.find(i=>i.id==='starter-table').x),-1.5);
 await p.getByRole('button',{name:'Rotate 90°',exact:true}).click();
 assert.equal(await p.evaluate(()=>window.__game.getState().homeRoom.items.find(i=>i.id==='starter-table').turn),1);
 await p.getByRole('button',{name:'Put in storage',exact:true}).click();assert(await p.evaluate(()=>window.__game.getState().homeRoom.items.find(i=>i.id==='starter-table').stored));
 await p.getByRole('button',{name:'Move right',exact:true}).click();assert.equal(await p.evaluate(()=>window.__game.getState().homeRoom.items.find(i=>i.id==='starter-table').stored),false);
 await p.getByText(/Buy more furniture ·/).click();await p.getByRole('combobox',{name:'Furniture shop',exact:true}).selectOption('plant');
 const coins=await p.evaluate(()=>window.__game.getState().coins);await p.getByRole('button',{name:'Buy Potted fern · 61 coins',exact:true}).click();assert.equal(await p.evaluate(()=>window.__game.getState().coins),coins-61);
 assert(await p.evaluate(()=>window.__game.getState().homeRoom.items.at(-1).stored));
 await floorTap(-2.5,1.25);assert.equal(await p.evaluate(()=>window.__indoor.getState().selectedFurniture),'starter-chair');
 const plantId=await p.evaluate(()=>window.__game.getState().homeRoom.items.at(-1).id);await p.getByRole('combobox',{name:'Your furniture',exact:true}).selectOption(plantId);await floorTap(1.5,.25);await p.waitForFunction(id=>!window.__game.getState().homeRoom.items.find(p=>p.id===id).stored,plantId);

 const layout=await p.evaluate(()=>{const s=window.__game.getState();s.persist();return s.homeRoom;});
 assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 for(const size of [{width:320,height:640},{width:844,height:390},{width:390,height:844}]){await p.setViewportSize(size);assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert(await p.getByRole('button',{name:'Done arranging',exact:true}).isVisible());}
 await p.getByRole('button',{name:'Done arranging',exact:true}).click();
 await p.getByRole('button',{name:'Home comforts',exact:true}).click();await p.getByRole('button',{name:'Have tea · restore heart',exact:true}).click();await p.getByRole('button',{name:'Back to my room',exact:true}).click();
 await p.getByRole('button',{name:'Leave home',exact:true}).click();assert.equal(await p.evaluate(()=>window.__game.getState().interior),null);
 await p.evaluate(()=>window.__game.getState().returnCityHome());await home.waitFor();assert.deepEqual(await p.evaluate(()=>window.__game.getState().homeRoom),layout);
 await p.reload();await p.getByRole('button',{name:'Continue — Clover',exact:true}).click();await p.evaluate(()=>window.__game.getState().returnCityHome());await home.waitFor();assert.deepEqual(await p.evaluate(()=>window.__game.getState().homeRoom),layout);
 await floorTap(0,2.75);await p.waitForFunction(()=>window.__game.getState().interior===null,undefined,{timeout:10000});
 // The old unstable empty-crew selector also affected every shore-side shop preview.
 for(const room of ['dockhouse','armory','townhall']){
  await p.evaluate(id=>window.__game.getState().enterInterior(id),room);
  await p.getByLabel(room+' interior preview',{exact:true}).waitFor();await p.waitForTimeout(300);
  assert.equal(await p.getByRole('alert').count(),0);await p.evaluate(()=>window.__game.getState().leaveInterior());
 }
 await p.evaluate(()=>window.__game.getState().returnCityHome());await home.waitFor();await p.waitForTimeout(300);
 assert.equal(await p.getByRole('alert').count(),0);assert.deepEqual(errors,[]);
 console.log('Home phone browser passed: green-screen regression, walkable room, one renderer, arrangement, rotate/store/re-place, paid furniture, responsive controls, home comforts, exit/re-entry, reload persistence and three shore shop previews. No script or shader errors.');
}finally{await browser.close();}
