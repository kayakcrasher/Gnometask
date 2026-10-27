import type { GameSave } from "./types";
import { PUBLIC_PORT } from "./ports";
import { thimbleConnected } from "./thimblehaven";

export const NOTICEBOARD = { x: 2180, y: -3025 };
export const NOTICEBOARD_EVENT = "hollow-watch:noticeboard";
export type NoticeId = "fish" | "harvest" | "survey" | "post" | "patrol" | "freight";
export type NoticeRecord = { state: "active" | "done"; winsAt: number; freightAt: number; visited: boolean; bonus: number };
export type TownProgress = { version: 1; claimed: string[]; round: number; completed: number; jobs: Partial<Record<NoticeId, NoticeRecord>> };
export const emptyTownProgress = (): TownProgress => ({ version: 1, claimed: [], round: 0, completed: 0, jobs: {} });
export const NOTICES = [
  { id: "fish", title: "Nim’s supper club", author: "Nim Nettlewick", text: "A few sprats for the pot, please. Holly says my soup should contain an actual fish this time.", skill: "fishing" },
  { id: "harvest", title: "Holly’s welcome baskets", author: "Holly Bracken", text: "Carrots for our newcomers. Leave the mud on; it makes the baskets look reassuringly local.", skill: "farming" },
  { id: "survey", title: "A postcard from Bramblewood", author: "Park warden Moss", text: "Visit the picnic lookout in Bramblewood National Park, then tell us how the woodland is doing. Leave the trees standing.", skill: "barter" },
  { id: "post", title: "A letter for the old harbour", author: "Ol Pappy", text: "Take our town’s letter to Port Victoria’s public quay. Come home with a stamped reply. Tell them we have lamps now. Or soon will.", skill: "sailing" },
  { id: "patrol", title: "A little peace and quiet", author: "The northern watch", text: "Resolve fresh encounters while this notice is accepted. We pay for safe paths, not old stories.", skill: "defence" },
  { id: "freight", title: "Keep the carts rolling", author: "Thimblehaven market guild", text: "Finish new cart or shipping deliveries. Empty shelves make for very philosophical shopping.", skill: "crafting" },
] as const;
export const TOWN_MILESTONES = [
  { id: "home", title: "A place to call home", description: "Visit your own home in Thimblehaven.", coins: 100, perk: "Unlock neighbour notices and receive 4 carrot seeds." },
  { id: "lamps", title: "A light in the north", description: "Fund the village well and lamps.", coins: 200, perk: "Unlock watch notices once the peaceful opening has ended." },
  { id: "market", title: "Market mornings", description: "Build the fish market and complete 3 notices.", coins: 400, perk: "Unlock freight commissions." },
  { id: "neighbours", title: "Five front doors", description: "Welcome at least 5 households to Thimblehaven.", coins: 700, perk: "Newly accepted notices pay 10% more." },
  { id: "connection", title: "The road home", description: "Complete the Thimblehaven road and run an owned wagon on it.", coins: 1000, perk: "Receive a 600-coin transport grant with your milestone reward." },
  { id: "charter", title: "Thimblehaven town charter", description: "Earn the earlier milestones, build the harbour town hall, and own a northern dock.", coins: 2000, perk: "Chartered commissions: newly accepted notices pay 25% more." },
] as const;
const whole = (v: unknown, max = 1e9) => typeof v === "number" && Number.isFinite(v) ? Math.min(max, Math.max(0, Math.floor(v))) : 0;
export function coerceTownProgress(raw: unknown): TownProgress {
  const out = emptyTownProgress();
  if (!raw || typeof raw !== "object") return out;
  const r = raw as Partial<TownProgress>;
  out.round = whole(r.round, 1000000); out.completed = whole(r.completed);
  out.claimed = TOWN_MILESTONES.filter(m => Array.isArray(r.claimed) && r.claimed.includes(m.id)).map(m => m.id);
  if (r.jobs && typeof r.jobs === "object") for (const n of NOTICES) {
    const j = r.jobs[n.id];
    if (!j || typeof j !== "object" || !["active", "done"].includes(j.state)) continue;
    out.jobs[n.id] = { state: j.state, winsAt: whole(j.winsAt), freightAt: whole(j.freightAt), visited: j.visited === true, bonus: j.bonus === .25 ? .25 : j.bonus === .1 ? .1 : 0 };
  }
  return out;
}
export function atNoticeboard(s: GameSave & {atHome?: boolean; interior?: unknown; abroad?: unknown; combat?: unknown; fishing?: unknown}) {
  return s.named && !s.atHome && !s.interior && !s.abroad && !s.combat && !s.fishing && !s.afloat && !s.bank.pending && !s.naval.battle && !s.naval.rescue && !s.naval.boarding && !s.transport.ride && Math.hypot(s.gnomeX-NOTICEBOARD.x,s.gnomeY-NOTICEBOARD.y) <= 140;
}
export function milestoneRequirements(s: GameSave, id: string): {label: string; done: boolean}[] {
  switch (id) {
    case "home": return [{ label: "Visit your town home", done: s.opening.homeVisited }];
    case "lamps": return [{ label: "Village well & lamps", done: s.thimble.projects.includes("well") }];
    case "market": return [{ label: "Fish market", done: s.thimble.projects.includes("market") },{label: `${Math.min(3,s.townProgress.completed)} / 3 notices completed`,done:s.townProgress.completed>=3}];
    case "neighbours": return [{label:`${s.thimble.residents.length} / 5 households`,done:s.thimble.residents.length>=5}];
    case "connection": return [{label:"Road completed",done:s.roadWorks.completed.includes("thimble-road")},{label:"Town wagon operating",done:thimbleConnected(s)}];
    case "charter": return [{label:"Earlier milestones earned",done:TOWN_MILESTONES.slice(0,-1).every(m=>s.townProgress.claimed.includes(m.id))},{label:"Harbour town hall",done:s.thimble.projects.includes("hall")},{label:"Owned northern dock",done:s.ports.docks.some(d=>["thimble","spruce"].includes(d.site))}];
    default: return [{label:"Unknown milestone",done:false}];
  }
}
export function noticeLock(s: GameSave, id: NoticeId) {
  if (!s.townProgress.claimed.includes("home")) return "Visit your home and claim A place to call home first.";
  if (id === "patrol" && (!s.opening.goblinsUnlocked || !s.townProgress.claimed.includes("lamps"))) return "Available after the lamps milestone and the peaceful opening.";
  if (id === "freight" && !s.townProgress.claimed.includes("market")) return "Earn Market mornings to unlock freight commissions.";
  return null;
}
export function noticeTerms(s: Pick<GameSave, "townProgress">, id: NoticeId) {
  const tier = Math.min(4,Math.floor(s.townProgress.round/3));
  const amount = id === "fish" ? 3+tier : id === "harvest" ? 2+tier : id === "patrol" ? 2+tier : id === "freight" ? 5+tier*5 : 1;
  const base = id === "fish" ? amount*2+10 : id === "harvest" ? amount*8+12 : id === "survey" ? 90 : id === "post" ? 150 : id === "patrol" ? amount*30 : amount*12;
  const bonus = s.townProgress.jobs[id]?.bonus ?? (s.townProgress.claimed.includes("charter") ? .25 : s.townProgress.claimed.includes("neighbours") ? .1 : 0);
  return { amount, coins: Math.round(base*(1+bonus)), xp: 20+10*tier, bonus };
}
export const freightTotal = (s: GameSave) => s.city.delivered+s.ports.delivered;
export function noticeProgress(s: GameSave, id: NoticeId) {
  const job=s.townProgress.jobs[id],goal=noticeTerms(s,id).amount;
  const value=id==="fish" ? s.fishBag.sprat??0 : id==="harvest" ? s.produce.carrot??0 : !job ? 0 : id==="patrol" ? Math.max(0,s.wildWins-job.winsAt) : id==="freight" ? Math.max(0,freightTotal(s)-job.freightAt) : job.visited ? 1 : 0;
  return {value:Math.min(goal,value),goal,ready:job?.state==="active"&&value>=goal};
}
export function noticeObjective(s: GameSave, id: NoticeId) {
  const n=noticeTerms(s,id).amount;
  return id==="fish" ? `Bring ${n} sprats from your fish bag. Aquarium fish stay at home.` : id==="harvest" ? `Bring ${n} harvested carrots.` : id==="patrol" ? `Resolve ${n} encounters after accepting.` : id==="freight" ? `Deliver ${n} new units by city cart or shipping boat.` : id==="survey" ? "Walk to Bramblewood’s picnic lookout (800, −1900), then return." : "Step ashore at Port Victoria’s public quay, then return.";
}
export function recordNoticeVisits(s: GameSave, x: number, y: number): TownProgress {
  if (s.afloat || s.bank.pending || s.naval.rescue || s.naval.boarding || s.transport.ride) return s.townProgress;
  let next=s.townProgress;
  for(const id of ["survey","post"] as const) {
    const j=next.jobs[id],p=id==="survey"?{x:800,y:-1900}:PUBLIC_PORT;
    if(j?.state==="active"&&!j.visited&&Math.hypot(x-p.x,y-p.y)<=95)next={...next,jobs:{...next.jobs,[id]:{...j,visited:true}}};
  }
  return next;
}
