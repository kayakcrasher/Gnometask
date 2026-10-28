// Optional phone browser regression against the packaged APK assets.
import {build} from 'esbuild-wasm';
import fs from 'node:fs/promises';import path from 'node:path';import assert from 'node:assert/strict';import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright-core');
const bundle=await build({stdin:{resolveDir:root,contents:`import {defaultSave} from './src/lib/game/save';import {xpForLevel} from './src/lib/game/xp';const s=defaultSave();s.named=true;s.gnomeName='Marigold';s.coins=100000;s.gnomeX=100;s.gnomeY=720;s.hulls=['coaster'];s.tasks=[];s.skills.sailing=xpForLevel(99);s.opening={version:1,homeVisited:true,goblinsUnlocked:true,activeSeconds:600};export default s;`},bundle:true,platform:'node',format:'esm',write:false,logLevel:'silent',alias:{'@':path.join(root,'src')}});
const save=(await import('data:text/javascript;base64,'+Buffer.from(bundle.outputFiles[0].text).toString('base64'))).default;
const b=await chromium.launch({...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const p=await b.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});p.setDefaultTimeout(60000);const errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error'&&/shader|WebGLProgram/.test(m.text()))errors.push(m.text());});
 await p.addInitScript(s=>{if(!localStorage.getItem('gnome-tasks:v2'))localStorage.setItem('gnome-tasks:v2',JSON.stringify(s));},save);
 await p.route('**/*',async r=>{const u=new URL(r.request().url());if(u.hostname!=='hollow.local')return r.abort();const f=u.pathname==='/'?'index.html':u.pathname.slice(1);try{await r.fulfill({body:await fs.readFile(path.join(root,'android/build/assets/game',f)),contentType:f.endsWith('.html')?'text/html':f.endsWith('.js')?'application/javascript':f.endsWith('.css')?'text/css':'application/octet-stream'});}catch{await r.fulfill({status:404,body:''});}});
 await p.goto('https://hollow.local/');await p.getByRole('button',{name:'Continue — Marigold',exact:true}).click();
 await p.getByRole('button',{name:'Quartermaster · Ship provisions',exact:true}).tap();await p.getByRole('dialog',{name:'Bank and harbour',exact:true}).waitFor();
 const panel=p.getByRole('region',{name:'Ship provisions',exact:true});await panel.getByRole('button',{name:'Buy 10 · 50 coins',exact:true}).tap();
 assert.equal(await p.evaluate(()=>window.__game.getState().shipStores.holds.coaster.stock),10);assert.equal(await p.evaluate(()=>window.__game.getState().coins),99950);
 await panel.getByRole('button',{name:'Fill hold · 250 coins',exact:true}).tap();assert.equal(await p.evaluate(()=>window.__game.getState().shipStores.holds.coaster.stock),60);
 assert(await panel.getByRole('button',{name:'Fill hold · 0 coins',exact:true}).isDisabled());
 for(const size of [{width:320,height:640},{width:844,height:390},{width:390,height:844}]){await p.setViewportSize(size);assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
 await p.getByRole('button',{name:'Board at nearby harbour',exact:true}).tap();await p.getByRole('dialog',{name:'Bank and harbour',exact:true}).waitFor({state:'detached'});assert.equal(await p.evaluate(()=>window.__game.getState().afloat),'coaster');
 await p.getByText('Ship helm',{exact:true}).tap();await p.getByText('Provisions 60/60 crates',{exact:true}).waitFor();
 await p.getByRole('button',{name:'Open provisions',exact:true}).tap();await panel.waitFor();assert(await panel.getByText(/Quartermaster Quay/).first().isVisible());
 await p.getByRole('button',{name:'Close harbour',exact:true}).tap();
 await p.evaluate(()=>{const s=window.__game.getState();window.__game.setState({afloat:null,gnomeX:1920,gnomeY:-2850,thimble:{...s.thimble,projects:['well','market','depot','cottages','hall'],construction:{id:'supply-dock',progress:1}}});});
 await p.getByText('Town builders · 4%',{exact:true}).waitFor();
 await p.evaluate(()=>{const s=window.__game.getState();window.__game.setState({thimble:{...s.thimble,construction:undefined,projects:[...s.thimble.projects,'supply-dock']},shipStores:{holds:{coaster:{stock:0,distance:0}}}});});
 await p.getByRole('button',{name:'Quartermaster · Ship provisions',exact:true}).tap();await panel.waitFor();await panel.getByRole('button',{name:'Buy 10 · 50 coins',exact:true}).tap();assert.equal(await p.evaluate(()=>window.__game.getState().shipStores.holds.coaster.stock),10);
 await p.evaluate(()=>window.__game.getState().persist());await p.reload();await p.getByRole('button',{name:'Continue — Marigold',exact:true}).click();assert.equal(await p.evaluate(()=>window.__game.getState().shipStores.holds.coaster.stock),10);
 await p.getByRole('button',{name:'Quartermaster · Ship provisions',exact:true}).waitFor();await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
 if(process.env.SUPPLY_SCREENSHOT)await p.screenshot({path:process.env.SUPPLY_SCREENSHOT});
 assert.deepEqual(errors,[]);console.log('Supply phone browser passed: world quay touch button, paid loading, full hold, phone and landscape bounds, boarding, helm stock, afloat supply access, live town construction, completed town quay, saved stock, no script or shader errors.');
}catch(e){const p=b.contexts()[0]?.pages()[0];if(p){await p.screenshot({path:'/tmp/hollow-supply-failure.png'}).catch(()=>{});console.error((await p.locator('body').innerText()).slice(-5000));}throw e;}finally{await b.close();}
