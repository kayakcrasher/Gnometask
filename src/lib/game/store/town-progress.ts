import { TOWN_MILESTONES, NOTICES, atNoticeboard, milestoneRequirements, noticeLock, noticeTerms, noticeProgress, freightTotal, type NoticeId } from "../town-progress";
import { scheduleWrite, withXp } from "./persist";
import { sfx } from "../juice";
import type { GameState, StoreGet, StoreSet } from "./types";

export function townProgressSlice(set:StoreSet,get:StoreGet):Pick<GameState,"claimTownMilestone"|"acceptNotice"|"handInNotice"|"abandonNotice"|"refreshNotices"> {
  const ready=()=>{if(atNoticeboard(get()))return true;set({speech:"Visit the noticeboard beside your Thimblehaven home to collect work and rewards."});return false;};
  const known=(id:NoticeId)=>NOTICES.some(n=>n.id===id);
  return {
    claimTownMilestone:(id)=>{
      if(!ready())return;const s=get(),m=TOWN_MILESTONES.find(m=>m.id===id);
      if(!m||s.townProgress.claimed.includes(id)||!milestoneRequirements(s,id).every(r=>r.done))return;
      set({townProgress:{...s.townProgress,claimed:[...s.townProgress.claimed,id]},coins:s.coins+m.coins+(id==="connection"?600:0),seeds:id==="home"?{...s.seeds,carrot:(s.seeds.carrot??0)+4}:s.seeds,respect:s.respect+1,coinPopKey:s.coinPopKey+1,speech:`${m.title}! ${m.perk}`});
      sfx("win");scheduleWrite(get);
    },
    acceptNotice:(id)=>{
      if(!ready()||!known(id))return;const s=get();
      if(s.townProgress.jobs[id]||noticeLock(s,id)||Object.values(s.townProgress.jobs).filter(j=>j.state==="active").length>=3)return;
      set({townProgress:{...s.townProgress,jobs:{...s.townProgress.jobs,[id]:{state:"active",winsAt:s.wildWins,freightAt:freightTotal(s),visited:false,bonus:noticeTerms(s,id).bonus}}},speech:"Notice accepted. There is no deadline; bring your report or goods back to this board."});scheduleWrite(get);
    },
    handInNotice:(id)=>{
      if(!ready()||!known(id))return;const s=get(),j=s.townProgress.jobs[id];
      if(j?.state!=="active"||!noticeProgress(s,id).ready)return;
      const terms=noticeTerms(s,id),def=NOTICES.find(n=>n.id===id)!,xp=withXp(s.skills,{[def.skill]:terms.xp});
      const fishBag={...s.fishBag},produce={...s.produce};
      if(id==="fish")fishBag.sprat-=terms.amount;
      if(id==="harvest")produce.carrot-=terms.amount;
      set({townProgress:{...s.townProgress,completed:s.townProgress.completed+1,jobs:{...s.townProgress.jobs,[id]:{...j,state:"done"}}},fishBag,produce,skills:xp.skills,coins:s.coins+terms.coins,coinPopKey:s.coinPopKey+1,speech:`${def.author}: Thank you! ${terms.coins} coins and ${terms.xp} ${def.skill} XP. ${xp.ding??""}`});
      sfx("buy");scheduleWrite(get);
    },
    abandonNotice:(id)=>{
      if(!ready()||!known(id))return;const s=get();if(s.townProgress.jobs[id]?.state!=="active")return;
      const jobs={...s.townProgress.jobs};delete jobs[id];set({townProgress:{...s.townProgress,jobs},speech:"Notice returned to the board. No goods taken and no fee charged."});scheduleWrite(get);
    },
    refreshNotices:()=>{
      if(!ready())return;const s=get(),jobs=Object.values(s.townProgress.jobs);
      if(jobs.some(j=>j.state==="active")||jobs.filter(j=>j.state==="done").length<3||s.townProgress.round>=1000000)return;
      set({townProgress:{...s.townProgress,round:s.townProgress.round+1,jobs:{}},speech:"Fresh notices are pinned up. Familiar neighbours, another little reason to explore."});scheduleWrite(get);
    },
  };
}
