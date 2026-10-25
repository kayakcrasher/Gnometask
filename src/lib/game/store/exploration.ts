import {TREASURES,salvageSites} from '../exploration';
import {scheduleWrite,withXp} from './persist';
import type {GameState,StoreSet,StoreGet} from './types';
export function explorationSlice(set:StoreSet,get:StoreGet):Pick<GameState,'salvageDiscovery'|'searchTreasure'>{
 const ready=()=>{const s=get();return s.named&&!s.atHome&&!s.bank.pending&&!s.combat&&!s.interior&&!s.abroad&&!s.fishing&&!s.transport.ride&&!s.naval.battle&&!s.naval.boarding&&!s.naval.rescue;};
 return {
 salvageDiscovery:id=>{const s=get(),site=salvageSites(s.ocean.seed).find(t=>t.id===id);if(!ready()||!s.afloat||!site||s.exploration.salvaged.includes(id)||Math.hypot(s.gnomeX-site.x,s.gnomeY-site.y)>120||(s.naval.integrity[s.afloat]??1)<=0)return;
 const coins=40+TREASURES.findIndex(t=>t.id===id)*20,xp=withXp(s.skills,{sailing:25});set({exploration:{...s.exploration,salvaged:[...s.exploration.salvaged,id],steps:{...s.exploration.steps,[id]:0}},coins:s.coins+coins,goods:{...s.goods,cloth:(s.goods.cloth??0)+1},skills:xp.skills,speech:`A waterlogged chest! ${coins} coins, a bundle of cloth, and ${site.name}. Open Ocean chart → Discoveries to read it.`});scheduleWrite(get);},
 searchTreasure:id=>{const s=get(),t=TREASURES.find(t=>t.id===id);if(!ready()||s.afloat||!t||!s.exploration.salvaged.includes(id)||s.exploration.claimed.includes(id))return;
 const step=s.exploration.steps[id]??0,p=t.clues[Math.min(1,step)]!;if(Math.hypot(s.gnomeX-p.x,s.gnomeY-p.y)>85){set({speech:'Follow the clue and walk closer to its landmark before searching.'});return;}
 const next=Math.min(2,step+1),done=next===2,coins=120+TREASURES.findIndex(t=>t.id===id)*60;set({exploration:{...s.exploration,steps:{...s.exploration.steps,[id]:next},claimed:done?[...s.exploration.claimed,id]:s.exploration.claimed},...(done?{coins:s.coins+coins,skills:withXp(s.skills,{crafting:40}).skills}:{}),speech:done?`You found the ${t.relic}! ${coins} coins and 40 Crafting XP. Your keepsake is displayed on the shelf at home.`:'Tucked beneath the landmark is a second note. The next clue is ready in your discoveries journal.'});scheduleWrite(get);}
 };
}
