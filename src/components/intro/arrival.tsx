import { useEffect, useRef, useState } from 'react';
import { ArrivalEngine } from './arrival-engine';

export function Arrival({name,onComplete}:{name:string;onComplete:()=>void}) {
  const [scene,setScene]=useState(0), [paused,setPaused]=useState(document.hidden);
  const [ready,setReady]=useState(false);
  const elapsed=useRef(0), done=useRef(false);
  const finish=()=>{if(done.current)return;done.current=true;onComplete();};
  const next=()=>{elapsed.current=0;setScene(s=>Math.min(2,s+1));};
  useEffect(()=>{
    const visibility=()=>setPaused(document.hidden);
    document.addEventListener('visibilitychange',visibility);
    return()=>document.removeEventListener('visibilitychange',visibility);
  },[]);
  useEffect(()=>{
    if(!ready||paused||scene===2)return;
    let last=performance.now();
    const id=window.setInterval(()=>{
      const now=performance.now();elapsed.current+=Math.min(.3,(now-last)/1000);last=now;
      if(elapsed.current>=(scene===0?7:4)){elapsed.current=0;setScene(s=>Math.min(2,s+1));}
    },200);
    return()=>window.clearInterval(id);
  },[scene,paused,ready]);
  const titles=['One small step ashore','Welcome to Port Victoria','“There you are, sprout.”'];
  const lines=[
    'The gangplank creaks beneath your boots. Beyond the pier, the capitol rises above the harbour.',
    'Ol Pappy is already waving. Somehow, he always knows when your ship is coming in.',
    `“${name}! I’d know that hat anywhere. Your cottage is ready up in Thimblehaven. Come on—let’s go home.”`,
  ];
  return <section role="dialog" aria-modal="true" aria-label="Arrival in Port Victoria" className="fixed inset-0 z-[60] overflow-hidden bg-[#132f43] text-[#f8ebd1]">
    <div className="absolute inset-x-0 top-0 bottom-[24%]"><ArrivalEngine scene={scene} paused={paused} onReady={()=>setReady(true)}/>{!ready&&<p role="status" className="absolute inset-x-0 top-1/3 text-center text-sm text-parchment">Coming alongside…</p>}</div>
    <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#102b43]/80 to-transparent"/>
    <header className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4">
      <p className="pt-3 text-[10px] font-bold uppercase tracking-[.22em] text-[#e8d6b5]">Hollow Watch · A new beginning</p>
      <button type="button" onClick={finish} className="min-h-11 shrink-0 rounded-full bg-[#142f43]/75 px-4 text-xs font-semibold">Skip intro</button>
    </header>
    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-b from-transparent via-[#132f43] to-[#132f43] px-5 pb-5 pt-10">
      <div className="mx-auto max-w-lg" aria-live="polite">
        <div className="mb-3 flex items-center gap-2" aria-label={`Scene ${scene+1} of 3`}>{[0,1,2].map(n=><span key={n} className={`h-1 rounded-full ${scene===n?'w-9 bg-[#edcb88]':'w-4 bg-[#e7d6ba]/30'}`}/>)}</div>
        <p className="text-[10px] font-bold uppercase tracking-[.22em] text-[#e4c78e]">{scene===2?'Ol Pappy':'Port Victoria · The Capitol'}</p>
        <h1 className="mt-2 font-display text-2xl font-semibold sm:text-3xl">{titles[scene]}</h1>
        <p className="mt-2 min-h-[4.5rem] text-sm leading-relaxed text-[#e3dece]">{lines[scene]}</p>
        <button type="button" onClick={scene===2?finish:next} className="mt-4 min-h-12 w-full rounded-2xl bg-[#ebcb8d] px-4 font-display text-base font-bold text-[#233e42]">{scene===0?'Meet Pappy':scene===1?'Talk to Pappy':'On to Thimblehaven'}</button>
      </div>
    </div>
  </section>;
}
