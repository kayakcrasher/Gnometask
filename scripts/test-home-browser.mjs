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
 await p.getByText('Opening room…',{exact:true}).waitFor({state:'detached'});assert.equal(await p.getByLabel('Indoor walking controls',{exact:true}).count(),0);
 const floorTap=async(x,z,width=8.8,room='cottage')=>{await p.waitForFunction(room=>window.__indoor?.getState().room===room,room);await p.getByText('Opening room…',{exact:true}).waitFor({state:'detached'});await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));const box=await p.locator('canvas').boundingBox(),aspect=box.width/box.height,d=Math.max(8,width/(2*Math.tan(Math.PI/8)*aspect)),camera=new PerspectiveCamera(45,aspect,.1,1000);camera.position.set(0,d*.68,d*.74);camera.lookAt(0,.4,0);camera.updateMatrixWorld();const v=new Vector3(x,.035,z).project(camera);const screen={x:box.x+(v.x+1)*box.width/2,y:box.y+(1-v.y)*box.height/2};await p.touchscreen.tap(screen.x,screen.y);return screen;};
 const start=await p.evaluate(()=>window.__indoor.getState().position);
 await floorTap(0,1.65);await p.waitForFunction(()=>window.__indoor.getState().target!==null);await p.waitForFunction(z=>window.__indoor.getState().position.z<z-.2,start.z);await p.waitForFunction(()=>window.__indoor.getState().target===null);
 const screen=await floorTap(1,1);await p.waitForFunction(()=>{const s=window.__indoor.getState();return Math.hypot(s.position.x-1,s.position.z-1)<.15});
 await p.waitForFunction(()=>window.__indoor.getState().target===null&&!window.__indoor.getState().moving);
 const beforeSwipe=await p.evaluate(()=>window.__indoor.getState().position),cdp=await p.context().newCDPSession(p);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:screen.x,y:screen.y,id:1}]});for(let i=1;i<=4;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:screen.x+i*15,y:screen.y-i*10,id:1}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await p.waitForTimeout(250);assert.equal(await p.evaluate(()=>window.__indoor.getState().target),null);assert.deepEqual(await p.evaluate(()=>window.__indoor.getState().position),beforeSwipe);await cdp.detach();
 await floorTap(1,-1.25);await p.waitForFunction(()=>window.__indoor.getState().target!==null);await floorTap(0,1.4);await p.waitForFunction(()=>{const p=window.__indoor.getState().position;return Math.hypot(p.x,p.z-1.4)<.15});
 await floorTap(-.35,.3);await p.waitForFunction(()=>window.__indoor.getState().target!==null);const assisted=await p.evaluate(()=>window.__indoor.getState().target);assert(Math.hypot(assisted.x+.35,assisted.z-.3)>.01);await p.waitForFunction(p=>{const q=window.__indoor.getState().position;return Math.hypot(q.x-p.x,q.z-p.z)<.15},assisted);
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
  await p.getByLabel(room+' interior preview',{exact:true}).waitFor();await p.getByRole('button',{name:'Explore room',exact:true}).click();await p.waitForTimeout(250);await floorTap(0,1.3,7.6,room);await p.waitForFunction(()=>{const p=window.__indoor.getState().position;return Math.hypot(p.x,p.z-1.3)<.15},undefined,{timeout:10000});await floorTap(1.2,1.5,7.6,room);await p.getByRole('button',{name:'Back to room services',exact:true}).click();await p.waitForFunction(()=>{const p=window.__indoor.getState().position;return Math.hypot(p.x-1.2,p.z-1.5)<.15});
  assert.equal(await p.getByRole('alert').count(),0);await p.evaluate(()=>window.__game.getState().leaveInterior());
 }
 await p.evaluate(()=>window.__game.getState().returnCityHome());await home.waitFor();await p.waitForTimeout(300);
 assert.equal(await p.getByRole('alert').count(),0);
 await p.evaluate(()=>{const g=window.__game;g.getState().leaveInterior();g.setState({afloat:'coaster',hulls:['coaster'],gnomeX:-3000,gnomeY:-2000});g.getState().enterShipCabin();});await p.getByRole('dialog',{name:'Ship cabin',exact:true}).waitFor();await p.getByRole('button',{name:'Explore room',exact:true}).click();await floorTap(0,1.3,7.6,'ship-cabin');await p.waitForFunction(()=>{const p=window.__indoor.getState().position;return Math.hypot(p.x,p.z-1.3)<.15});await p.getByRole('button',{name:'Back to room services',exact:true}).click();await p.getByRole('button',{name:'Return to deck',exact:true}).click();assert.equal(await p.evaluate(()=>window.__game.getState().afloat),'coaster');
 assert.deepEqual(errors,[]);
 console.log('Home phone browser passed: native tap walking and arrival, ignored swipe, no direction pad, retargeting and walking through UI releases in three shops, cabin taps, arrangement, paid furniture, persistence, home comforts and door exit. No script or shader errors.');
}finally{await browser.close();}
