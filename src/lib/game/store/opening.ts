import {maxHitpoints} from "../xp";
import { SETTLING_SECONDS, openingPeaceful } from '../opening';
import { seedQuests, scheduleWrite } from './persist';
import type { GameState, StoreGet, StoreSet } from './types';
export function openingSlice(set:StoreSet,get:StoreGet):Pick<GameState,'tickOpening'|'advancePappyIntro'|'returnToPappyHome'> {
  return {returnToPappyHome:()=>{const s=get();if(s.named&&!s.atHome&&s.bank.pending&&s.opening.prologue&&s.opening.prologue!=='invitation'&&!s.combat&&!s.abroad&&!s.afloat)set({interior:'pappy-home'});},advancePappyIntro:()=>{
    const s=get(),phase=s.opening.prologue;
    if(!s.named||s.atHome||!s.bank.pending||s.combat||s.afloat||s.abroad||s.naval.rescue||s.transport.ride)return;
    const next=phase==='invitation'?'evening':phase==='evening'?'morning':phase==='morning'?'offer':phase==='offer'?'borrow':null;
    if(!next)return;
    set({opening:{...s.opening,prologue:next},interior:'pappy-home',popup:null,
      ...(phase==='evening'?{bread:s.bread+1,hp:maxHitpoints(s.skills)}:{}),
      speech:phase==='evening'?'Morning sunlight finds the kitchen. Pappy has bread, tea and a plan.':'Pappy pulls up a chair. There is no hurry, sprout.'});scheduleWrite(get);
  },tickOpening:(dt)=>{
    const s=get();
    if(s.opening.prologue||!openingPeaceful(s)||!s.named||s.atHome||s.bank.pending||s.coach<5||s.interior||s.abroad||s.combat||s.naval.battle||
      (typeof document!=='undefined'&&document.hidden)||!Number.isFinite(dt)||dt<=0) return;
    // No offline catch-up: only foreground play contributes to the quiet period.
    const activeSeconds=Math.min(SETTLING_SECONDS,s.opening.activeSeconds+Math.min(1,dt));
    const unlocked=s.opening.homeVisited&&activeSeconds>=SETTLING_SECONDS;
    if(activeSeconds===s.opening.activeSeconds&&!unlocked)return;
    const opening={...s.opening,activeSeconds,goblinsUnlocked:unlocked};
    set({opening,...(unlocked?{...seedQuests({...s,opening}),speech:'A note from Watcher Greg: a goblin boat has reached the southern shore. Thimblehaven is safe for now. Visit the watch when you feel ready.'}:{})});
    if(unlocked||Math.floor(activeSeconds/15)!==Math.floor(s.opening.activeSeconds/15))scheduleWrite(get);
  }};
}
