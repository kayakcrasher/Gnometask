import { SETTLING_SECONDS, openingPeaceful } from '../opening';
import { seedQuests, scheduleWrite } from './persist';
import type { GameState, StoreGet, StoreSet } from './types';
export function openingSlice(set:StoreSet,get:StoreGet):Pick<GameState,'tickOpening'> {
  return {tickOpening:(dt)=>{
    const s=get();
    if(!openingPeaceful(s)||!s.named||s.atHome||s.bank.pending||s.coach<5||s.interior||s.abroad||s.combat||s.naval.battle||
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
