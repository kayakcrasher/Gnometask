// Optional Playwright check against the built game (dist/, or APK assets if present).
// Guards two regressions:
//  1. Leaving a room/home used to drop the outdoor world to the flat 2D fallback for
//     the rest of the session (the 3D canvas' own disposal was read as a GPU failure).
//  2. Outdoor action buttons (Travel, Bank & harbour, council, Ocean chart) overlapped
//     each other, the zoom controls or the minimap on phones and in landscape.
import fs from 'node:fs/promises';import path from 'node:path';import assert from 'node:assert/strict';import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const apk=path.join(root,'android/build/assets/game'),dist=path.join(root,'dist');
const base=await fs.access(path.join(dist,'bundle.js')).then(()=>dist,()=>apk);
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright-core');
const b=await chromium.launch({...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const type=f=>f.endsWith('.html')?'text/html':f.endsWith('.js')?'application/javascript':f.endsWith('.css')?'text/css':f.endsWith('.svg')?'image/svg+xml':'application/octet-stream';
try{
 const p=await b.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});p.setDefaultTimeout(60000);
 const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.route('**/*',async r=>{const u=new URL(r.request().url());if(u.hostname!=='hollow.local')return r.abort();const f=u.pathname==='/'?'index.html':decodeURIComponent(u.pathname.slice(1));try{await r.fulfill({body:await fs.readFile(path.join(base,f)),contentType:type(f)});}catch{await r.fulfill({status:404,body:''});}});
 await p.goto('https://hollow.local/');
 await p.getByRole('button',{name:'New game',exact:true}).click();
 await p.getByRole('textbox',{name:'Your name',exact:true}).fill('Wren');await p.getByRole('button',{name:'Begin the journey',exact:true}).click();
 await p.getByRole('button',{name:'Skip intro',exact:true}).click();
 await p.getByRole('button',{name:'Stay with Pappy tonight',exact:true}).click();await p.getByRole('button',{name:'Turn in for the night',exact:true}).click();
 await p.getByRole('button',{name:'How do I get started?',exact:true}).click();await p.getByRole('button',{name:'No loan for now — I’ll start small',exact:true}).click();
 await p.getByRole('button',{name:'Step into my home',exact:true}).click();await p.getByRole('button',{name:'Leave home',exact:true}).click();
 const world=async()=>{await p.getByRole('button',{name:'Reset view',exact:true}).waitFor();await p.waitForTimeout(4000);
  assert.equal(await p.getByRole('button',{name:'Find me',exact:true}).count(),0,'outdoor world fell back to the 2D map');
  assert.equal(await p.getByRole('button',{name:'Reset view',exact:true}).count(),1,'3D world controls missing');};
 await world();
 // A second round trip through a room must keep the 3D world too.
 await p.evaluate(()=>window.__game.getState().enterInterior('pub'));await p.waitForTimeout(1500);
 await p.evaluate(()=>window.__game.getState().leaveInterior());await world();
 const boxes=()=>p.evaluate(()=>{const want=['Travel','Bank & harbour','Thimblehaven council','Ocean chart','Zoom in','Zoom out','Reset view','Atlas'];
  return [...document.querySelectorAll('button')].map(el=>[(el.getAttribute('aria-label')||el.innerText).trim(),el.getBoundingClientRect()]).filter(([n,r])=>want.some(w=>n.startsWith(w))&&r.width>0).map(([n,r])=>({n,l:r.left,t:r.top,r:r.right,b:r.bottom}));});
 for(const size of [{width:390,height:844},{width:320,height:640},{width:844,height:390},{width:1280,height:800}]){
  await p.setViewportSize(size);await p.waitForTimeout(400);const bx=await boxes();
  assert(bx.length>=7,`expected outdoor controls at ${size.width}x${size.height}`);
  for(const a of bx){assert(a.l>=0&&a.r<=size.width&&a.t>=0&&a.b<=size.height,`${a.n} off-screen at ${size.width}x${size.height}`);
   for(const c of bx)if(a!==c&&a.l<c.r-1&&c.l<a.r-1&&a.t<c.b-1&&c.t<a.b-1)assert.fail(`${a.n} overlaps ${c.n} at ${size.width}x${size.height}`);}
  assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 }
 assert.deepEqual(errors,[]);console.log('World browser passed: 3D world survives home and room round trips, outdoor controls stay on-screen and never overlap on phone, small phone, landscape and desktop, no script errors.');
}finally{await b.close();}
