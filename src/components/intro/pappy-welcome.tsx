import {useGame} from '@/lib/game/store';
import {InteriorPreview} from '../world/interior-assets';
const button='min-h-12 w-full rounded-2xl px-4 py-3 font-display text-sm font-bold';
export function PappyWelcome(){
 const s=useGame(),phase=s.opening.prologue;
 if(!s.named||s.atHome||!phase||phase==='borrow')return null;
 const pages={
  invitation:{title:'A night in Port Victoria',line:`“There you are, ${s.gnomeName}. No rushing north on an empty belly. Stay with me tonight. We’ll have supper, watch the harbour lights and give those sea legs a rest. You’ll get a fresh start in the morn.”`,reply:'Stay with Pappy tonight'},
  evening:{title:'The spare bed is yours',line:'“Port Victoria looks grand with her lamps lit, doesn’t she? But even a grand city began with a few homes and somebody willing to look after them. Put your bag down, sprout. There’s bread by the fire. Tomorrow we’ll talk about your own little corner of the island.”',reply:'Turn in for the night'},
  morning:{title:'Your town needs your kind of magic',line:`“Morning, sprout. Thimblehaven is small just now—a cottage, a bit of land and a very hopeful signpost. You’ll help make it a place gnomes choose to call home. Roads that lead somewhere. Shops with full shelves. Neighbours who know they belong. The best town is the one folk are glad to come back to. That’s your special part, ${s.gnomeName}.”`,reply:'How do I get started?'},
  offer:{title:'A little help to get growing',line:'“One good thing at a time. A road, a well, somewhere to trade. The gnomes will bring their own ideas—and sometimes their worries. Listen to them. Now, Mossroot can lend you a start, and I’ll put my name beside yours. Would you like a loan, or would you rather begin small with what you have?”',reply:'Yes, show me the loans'},
 };
 const page=pages[phase];
 return <section role="dialog" aria-modal="true" aria-label="Pappy’s welcome" className={`fixed inset-0 z-[95] flex flex-col overflow-y-auto p-3 ${phase==='invitation'?'justify-end bg-pine/25':'bg-[#dac9a3]'}`}>
  <div className="mx-auto w-full max-w-lg">
   {phase!=='invitation'&&<><p className="mb-2 text-center text-xs font-bold uppercase tracking-wide text-pine">Port Victoria · Pappy’s home · {phase==='evening'?'The first night':'The next morning'}</p>{s.interior==='pappy-home'?<InteriorPreview id="pappy-home"/>:<button type="button" onClick={s.returnToPappyHome} className={`${button} mb-3 bg-parchment text-pine`}>Go back inside Pappy’s home</button>}</>}
   <article className="rounded-3xl bg-parchment p-4 text-pine shadow-panel">
    <p className="text-xs font-bold uppercase tracking-widest text-bark">Ol Pappy · {phase==='invitation'?'Port Victoria harbour':'A fresh start'}</p>
    <h1 className="mt-2 font-display text-2xl font-bold">{page.title}</h1>
    <p className="mt-3 text-sm leading-relaxed">{page.line}</p>
    {phase==='evening'&&<p className="mt-2 text-xs text-bark">Look around the guest room if you like. Turn in whenever you’re ready.</p>}
    <button type="button" onClick={s.advancePappyIntro} className={`${button} mt-4 bg-pine text-parchment`}>{page.reply}</button>
    {phase==='offer'&&<button type="button" onClick={s.declineStarterLoan} className={`${button} mt-2 bg-gold`}>No loan for now — I’ll start small</button>}
   </article>
  </div>
 </section>;
}
