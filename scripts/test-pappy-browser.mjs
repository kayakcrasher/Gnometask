import {PerspectiveCamera,Vector3} from 'three';
// Optional Playwright check against APK assets; see docs/pappys-welcome-2026-10-28.md.
import fs from 'node:fs/promises';import path from 'node:path';import assert from 'node:assert/strict';import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright-core');
const b=await chromium.launch({...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const p=await b.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});p.setDefaultTimeout(60000);const errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error'&&/shader|WebGLProgram/.test(m.text()))errors.push(m.text());});
 await p.route('**/*',async r=>{const u=new URL(r.request().url());if(u.hostname!=='hollow.local')return r.abort();const f=u.pathname==='/'?'index.html':u.pathname.slice(1);try{await r.fulfill({body:await fs.readFile(path.join(root,'android/build/assets/game',f)),contentType:f.endsWith('.html')?'text/html':f.endsWith('.js')?'application/javascript':f.endsWith('.css')?'text/css':'application/octet-stream'});}catch{await r.fulfill({status:404,body:''});}});
 await p.goto('https://hollow.local/');
 const start=async(name,skip)=>{
  await p.getByRole('button',{name:'New game',exact:true}).click();const confirm=p.getByRole('button',{name:'Yes, start over',exact:true});if(await confirm.count())await confirm.click();await p.getByRole('textbox',{name:'Your name',exact:true}).fill(name);await p.getByRole('button',{name:'Begin the journey',exact:true}).click();
  if(skip)await p.getByRole('button',{name:'Skip intro',exact:true}).click();else{await p.getByRole('button',{name:'Meet Pappy',exact:true}).click();await p.getByRole('button',{name:'Hear Pappy’s welcome',exact:true}).click();}
  await p.getByRole('dialog',{name:'Pappy’s welcome',exact:true}).waitFor();assert.equal(await p.getByRole('dialog',{name:'Choose your starter loan',exact:true}).count(),0);assert.equal(await p.evaluate(()=>window.__game.getState().gnomeX),96);
 };
 await start('Hattie',false);await p.getByText(/You’ll get a fresh start in the morn/).waitFor();
 await p.getByRole('button',{name:'Stay with Pappy tonight',exact:true}).click();await p.getByLabel('pappy-home interior preview',{exact:true}).waitFor();
 await p.getByRole('button',{name:'Explore room',exact:true}).click();await p.waitForFunction(()=>window.__indoor?.getState().room==='pappy-home');await p.getByText('Opening room…',{exact:true}).waitFor({state:'detached'});assert.equal(await p.getByLabel('Indoor walking controls',{exact:true}).count(),0);
 await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
 const box=await p.locator('canvas').boundingBox(),aspect=box.width/box.height,d=Math.max(8,7.6/(2*Math.tan(Math.PI/8)*aspect)),cam=new PerspectiveCamera(45,aspect,.1,1000);cam.position.set(0,d*.68,d*.74);cam.lookAt(0,.4,0);cam.updateMatrixWorld();const point=new Vector3(-.7,.035,1.15).project(cam);await p.touchscreen.tap(box.x+(point.x+1)*box.width/2,box.y+(1-point.y)*box.height/2);await p.waitForFunction(()=>{const p=window.__indoor.getState().position;return Math.hypot(p.x+.7,p.z-1.15)<.15;});
 await p.getByRole('button',{name:'Talk to Pappy',exact:true}).click();
 await p.evaluate(()=>window.__game.getState().persist());const bread=await p.evaluate(()=>window.__game.getState().bread);
 await p.reload();await p.getByRole('button',{name:'Continue — Hattie',exact:true}).click();await p.getByRole('button',{name:'Turn in for the night',exact:true}).waitFor();assert.equal(await p.evaluate(()=>window.__game.getState().bread),bread);
 await p.getByRole('button',{name:'Turn in for the night',exact:true}).click();await p.getByRole('heading',{name:'Your town needs your kind of magic',exact:true}).waitFor();assert.equal(await p.evaluate(()=>window.__game.getState().bread),bread+1);
 await p.waitForFunction(()=>window.__indoor?.getState().room==='pappy-home');await p.getByText('Opening room…',{exact:true}).waitFor({state:'detached'});await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
 if(process.env.PAPPY_SCREENSHOT)await p.screenshot({path:process.env.PAPPY_SCREENSHOT});
 for(const size of [{width:320,height:640},{width:844,height:390},{width:390,height:844}]){await p.setViewportSize(size);assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
 await p.getByRole('button',{name:'How do I get started?',exact:true}).click();await p.getByRole('button',{name:'Yes, show me the loans',exact:true}).click();await p.getByRole('dialog',{name:'Choose your starter loan',exact:true}).waitFor();
 const coins=await p.evaluate(()=>window.__game.getState().coins);await p.getByRole('button',{name:/Borrow 50,000 coins/}).click();
 assert.equal(await p.evaluate(()=>window.__game.getState().coins),coins+50000);assert.equal(await p.evaluate(()=>window.__game.getState().bank.owed),50000);assert.equal(await p.evaluate(()=>window.__game.getState().opening.prologue),undefined);
 await p.getByRole('button',{name:'Step into my home',exact:true}).click();await p.getByRole('dialog',{name:'Your Thimblehaven home',exact:true}).waitFor();await p.getByRole('button',{name:'Leave home',exact:true}).click();await p.evaluate(()=>window.__game.getState().persist());
 await p.reload();await p.getByRole('button',{name:'Continue — Hattie',exact:true}).click();assert.equal(await p.getByRole('dialog',{name:'Pappy’s welcome',exact:true}).count(),0);assert.equal(await p.getByRole('dialog',{name:'Choose your starter loan',exact:true}).count(),0);
 await p.getByRole('button',{name:'Menu',exact:true}).click();await p.getByRole('button',{name:'Main menu',exact:true}).click();
 await start('Briar',true);await p.getByRole('button',{name:'Stay with Pappy tonight',exact:true}).click();await p.getByRole('button',{name:'Turn in for the night',exact:true}).click();await p.getByRole('button',{name:'How do I get started?',exact:true}).click();
 const c=await p.evaluate(()=>window.__game.getState().coins);await p.getByRole('button',{name:'No loan for now — I’ll start small',exact:true}).click();
 assert.equal(await p.evaluate(()=>window.__game.getState().coins),c);assert.equal(await p.evaluate(()=>window.__game.getState().bank.owed),0);assert.equal(await p.evaluate(()=>window.__game.getState().bank.pending),false);assert.equal(await p.evaluate(()=>window.__game.getState().bank.signed),false);
 await p.getByRole('button',{name:'Step into my home',exact:true}).click();await p.getByRole('dialog',{name:'Your Thimblehaven home',exact:true}).waitFor();assert.equal(await p.evaluate(()=>window.__game.getState().opening.goblinsUnlocked),false);
 assert.deepEqual(errors,[]);console.log('Pappy phone browser passed: ship arrival, harbour invitation, walkable overnight stay, saved conversation, morning role dialogue, 50k loan branch, debt-free decline branch, town/home arrival, no replay after completion, phone/landscape bounds, no script or shader errors.');
}finally{await b.close();}
