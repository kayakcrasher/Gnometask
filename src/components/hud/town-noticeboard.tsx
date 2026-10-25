import { useState } from "react";
import { useGame } from "@/lib/game/store";
import { NOTICES, TOWN_MILESTONES, NOTICEBOARD, atNoticeboard, milestoneRequirements, noticeLock, noticeTerms, noticeProgress, noticeObjective } from "@/lib/game/town-progress";
export const NOTICE_WALK_EVENT = "hollow-watch:notice-walk";
const btn="min-h-11 rounded-xl px-3 py-2 text-sm font-bold disabled:opacity-40";
export function TownNoticeboard({onTravel}:{onTravel:()=>void}) {
  const s=useGame(),[tab,setTab]=useState<"notices"|"milestones">("notices");
  const local=atNoticeboard(s),jobs=Object.values(s.townProgress.jobs),active=jobs.filter(j=>j.state==="active").length,done=jobs.filter(j=>j.state==="done").length;
  const travel=(x:number,y:number)=>{onTravel();window.dispatchEvent(new CustomEvent(NOTICE_WALK_EVENT,{detail:{x,y}}));};
  const next=TOWN_MILESTONES.find(m=>!s.townProgress.claimed.includes(m.id));
  return <div className="space-y-3">
    <h3 className="font-display text-xl font-bold">Thimblehaven noticeboard</h3>
    <p className="text-sm">Small favours. A growing home. No deadlines. Accept up to three jobs, then return here to hand in goods or reports.</p>
    <p className="rounded-xl bg-pine/10 p-3 text-xs font-semibold">{s.townProgress.completed} favours completed · {s.townProgress.claimed.length} / {TOWN_MILESTONES.length} town milestones · Round {s.townProgress.round+1}</p>
    {!local&&<div className="rounded-xl bg-gold/20 p-3 text-sm"><p>Browse anywhere. Accept work and collect rewards at the board beside your town home.</p><button type="button" className={`${btn} mt-2 bg-pine text-parchment`} disabled={!!s.afloat||!!s.transport.ride} onClick={()=>travel(NOTICEBOARD.x,NOTICEBOARD.y)}>Walk to noticeboard</button>{s.afloat&&<p className="mt-1 text-xs">Moor at Thimblehaven first.</p>}</div>}
    <nav className="flex gap-2" aria-label="Noticeboard sections"><button type="button" aria-pressed={tab==="notices"} onClick={()=>setTab("notices")} className={`${btn} ${tab==="notices"?"bg-pine text-parchment":"bg-pine/10"}`}>Neighbour notices</button><button type="button" aria-pressed={tab==="milestones"} onClick={()=>setTab("milestones")} className={`${btn} ${tab==="milestones"?"bg-pine text-parchment":"bg-pine/10"}`}>Town milestones</button></nav>
    {tab==="milestones"?<div className="space-y-3">{TOWN_MILESTONES.map(m=>{const claimed=s.townProgress.claimed.includes(m.id),requirements=milestoneRequirements(s,m.id),ready=requirements.every(r=>r.done);return <article key={m.id} className="rounded-2xl border border-pine/15 bg-white/40 p-3"><h4 className="font-display text-lg font-bold">{m.title}{claimed?" · Earned":""}</h4><p className="mt-1 text-sm">{m.description}</p><ul className="my-2 space-y-1 text-xs">{requirements.map(r=><li key={r.label}>{r.done?"✓":"○"} {r.label}</li>)}</ul><p className="text-sm font-bold">{m.coins} coins{m.id==="connection"?" + 600-coin grant":""}</p><p className="mt-1 text-xs">{m.perk}</p><button type="button" className={`${btn} mt-2 w-full bg-gold`} disabled={claimed||!ready||!local} onClick={()=>s.claimTownMilestone(m.id)}>{claimed?"Milestone earned":ready?"Collect milestone reward":"Keep growing"}</button></article>;})}</div>:<>
      {next&&<button type="button" className={`${btn} w-full bg-gold/20 text-left`} onClick={()=>setTab("milestones")}>Next town milestone: {next.title} →</button>}
      <p className="text-xs font-semibold">{active} / 3 jobs accepted · {done} completed this round</p>
      {NOTICES.map(n=>{const j=s.townProgress.jobs[n.id],lock=noticeLock(s,n.id),terms=noticeTerms(s,n.id),progress=noticeProgress(s,n.id);return <article key={n.id} className="rounded-2xl border border-pine/15 bg-white/40 p-3"><h4 className="font-display text-lg font-bold">{n.title}</h4><p className="text-xs font-bold text-bark">{n.author} · {j?.state==="done"?"Paid":j?"Accepted":lock?"Not yet available":"Available"}</p><p className="mt-2 text-sm">{n.text}</p><p className="mt-2 text-xs font-bold">{noticeObjective(s,n.id)}</p><p className="mt-1 text-xs">{terms.coins} coins · {terms.xp} {n.skill} XP{terms.bonus>0?` · ${Math.round(terms.bonus*100)}% town bonus`:""}</p>
        {j?.state==="active"&&<><progress aria-label={`${n.title} progress`} className="mt-2 w-full accent-[#44715a]" value={progress.value} max={progress.goal}/><p className="text-xs">{progress.value} / {progress.goal}{progress.ready?" · Ready to hand in":""}</p>{(n.id==="survey"||n.id==="post")&&!j.visited&&<button type="button" className={`${btn} mt-2 bg-pine/10`} disabled={!!s.afloat} onClick={()=>travel(n.id==="survey"?800:96,n.id==="survey"?-1900:520)}>Walk to {n.id==="survey"?"park lookout":"Port Victoria quay"}</button>}</>}
        {lock&&!j&&<p className="mt-2 text-xs text-bark">{lock}</p>}
        <div className="mt-2 flex flex-wrap gap-2">{j?.state==="active"?<><button type="button" className={`${btn} bg-gold`} disabled={!local||!progress.ready} onClick={()=>s.handInNotice(n.id)}>Hand in notice</button><button type="button" className={`${btn} bg-pine/10`} disabled={!local} onClick={()=>s.abandonNotice(n.id)}>Return notice</button></>:<button type="button" className={`${btn} bg-pine text-parchment`} disabled={!local||!!j||!!lock||active>=3} onClick={()=>s.acceptNotice(n.id)}>{j?"Completed and paid":"Accept notice"}</button>}</div>
      </article>;})}
      <button type="button" className={`${btn} w-full bg-gold`} disabled={!local||active>0||done<3} onClick={()=>s.refreshNotices()}>Pin fresh notices</button><p className="text-xs">Complete at least three notices and finish or return accepted work to refresh the board. Unaccepted notices are replaced; there is no fee.</p>
    </>}
    <p role="status" aria-live="polite" className="rounded-xl bg-pine/10 p-3 text-sm">{s.speech}</p>
  </div>;
}
