import type { GameSave } from "./types";
import { economicClimate } from "./island-economy";
export const THIMBLE_HOME = { x: 2210, y: -3100 };
export const starterThimbleHome = () => ({
  id: "thimble-starter-home",
  kind: "home" as const,
  parcel: "thimble-home",
  x: THIMBLE_HOME.x,
  y: THIMBLE_HOME.y,
  level: 1,
  stock: 0,
  supplies: 0,
  work: 0,
  residents: 0,
  invested: 0,
});
export const TOWN_PROJECTS = [
  {
    id: "well",
    name: "Village well & lamps",
    cost: 800,
    description: "A proper well, warm lamps and the first public square.",
  },
  {
    id: "market",
    name: "Fish market",
    cost: 2500,
    description:
      "Neighbours sell their catch. Improves local household earnings.",
  },
  {
    id: "depot",
    name: "Donkey depot",
    cost: 4800,
    description:
      "A small stable and freight office. Allows a town-owned wagon service.",
  },
  {
    id: "cottages",
    name: "Newcomer cottages",
    cost: 9000,
    description:
      "Space for four more families when the island economy can support them.",
  },
  {
    id: "hall",
    name: "Harbour town hall",
    cost: 18000,
    description:
      "An expanded council house, public garden and room for eight families.",
  },
  { id:"supply-dock", name:"Large-ship supply dock", cost:32000, description:"A wide quay, quartermaster warehouse and loading crane. Buy provisions here for your larger ships. Includes the waterfront easement." },
] as const;
export type HomeWork={target:number;progress:number};
export type TownResident = { id: string; name: string; purse: number; homeLevel?:number; work?:HomeWork; arrival?:number };
export const PROJECT_WORK:Record<string,number>={well:6,market:8,depot:10,cottages:12,hall:16,"supply-dock":24};
export type Thimblehaven = {
  version: 1;
  projects: string[];
  residents: TownResident[];
  beat: number;
  revenue: number;
  spent: number;
  tax: number;
  news: string;
  construction?:{id:string;progress:number};
};
export const emptyThimble = (): Thimblehaven => ({
  version: 1,
  projects: [],
  residents: [
    { id: "nim", name: "Nim Nettlewick", purse: 120,homeLevel:1 },
    { id: "holly", name: "Holly Bracken", purse: 120,homeLevel:1 },
  ],
  beat: 0,
  revenue: 0,
  spent: 0,
  tax: 1,
  news: "Two cottages, a landing and rather a lot of mud. Thimblehaven is yours to grow.",
});
export function thimbleConnected(
  s: Pick<GameSave, "roadWorks" | "transport" | "coins">,
) {
  return (
    s.roadWorks.completed.includes("thimble-road") &&
    s.coins >= 2 &&
    s.transport.wagons.some((w) => w.owned && w.route === "thimble-road")
  );
}
export function thimbleRemark(
  s: Pick<GameSave, "roadWorks" | "transport" | "coins">,
) {
  if (!s.roadWorks.completed.includes("thimble-road"))
    return "“No roads to Thimblehaven, then? Very exclusive. Even the mud has to arrive by boat.”";
  if (!thimbleConnected(s))
    return "“A road to Thimblehaven! Lovely. Shall we wait here until a donkey actually uses it?”";
  return "“Donkey carts to Thimblehaven. At last! I suppose I’ll have to find something else to complain about.”";
}
export function coerceThimble(v: unknown): Thimblehaven {
  const out = emptyThimble();
  if (!v || typeof v !== "object") return out;
  const t = v as Partial<Thimblehaven>;
  for (const p of TOWN_PROJECTS) {
    if (Array.isArray(t.projects) && t.projects.includes(p.id))
      out.projects.push(p.id);
    else break;
  }
  const cap = out.projects.includes("hall")
    ? 8
    : out.projects.includes("cottages")
      ? 6
      : 2;
  if (Array.isArray(t.residents))
    out.residents = t.residents
      .filter(
        (r, i, a) =>
          r &&
          typeof r.id === "string" &&
          typeof r.name === "string" &&
          Number.isFinite(r.purse) &&
          a.findIndex((x) => x?.id === r.id) === i,
      )
      .slice(0, cap)
      .map((r) => ({
        id:r.id,
        homeLevel:Number.isInteger(r.homeLevel)?Math.max(0,Math.min(3,r.homeLevel!)):(out.projects.includes("hall")?2:1),
        ...(r.work&&Number.isInteger(r.work.target)&&Number.isFinite(r.work.progress)&&r.work.target>(r.homeLevel??(out.projects.includes("hall")?2:1))&&r.work.target<=3?{work:{target:Math.floor(r.work.target),progress:Math.max(0,Math.min(9,Math.floor(r.work.progress)))}}:{}),
        ...(Number.isFinite(r.arrival)?{arrival:Math.max(0,Math.min(3,Math.floor(r.arrival!)))}:{}),
        name: r.name.slice(0, 30),
        purse: Math.max(0, Math.floor(r.purse)),
      }));
  for (const k of ["beat", "revenue", "spent"] as const)
    if (Number.isFinite(t[k])) out[k] = Math.max(0, Math.floor(t[k]!));
  if(t.construction&&t.construction.id===TOWN_PROJECTS[out.projects.length]?.id&&Number.isFinite(t.construction.progress))out.construction={id:t.construction.id,progress:Math.max(0,Math.min(PROJECT_WORK[t.construction.id]!-1,Math.floor(t.construction.progress)))};
  out.tax = [0, 1, 2, 3].includes(t.tax!) ? t.tax! : 1;
  out.news = typeof t.news === "string" ? t.news.slice(0, 300) : out.news;
  return out;
}
export function stepThimble(s: GameSave) {
  const beat = s.thimble.beat + 1;
  let t={...s.thimble,residents:s.thimble.residents.map(r=>{
    if(r.work){const progress=r.work.progress+1,needed=r.work.target===1?4:r.work.target===2?6:10;return progress>=needed?{...r,homeLevel:r.work.target,work:undefined,...(r.work.target===1?{arrival:0}:{})}:{...r,work:{...r.work,progress}};}
    return r.arrival!==undefined&&r.arrival<3?{...r,arrival:r.arrival+1}:r;
  })};
  if(t.construction){const progress=t.construction.progress+1;if(progress>=PROJECT_WORK[t.construction.id]!){const p=TOWN_PROJECTS.find(p=>p.id===t.construction!.id)!;t={...t,construction:undefined,projects:[...t.projects,p.id],news:`${p.name} is open! The crew has taken down the scaffolding.`};}else t={...t,construction:{...t.construction,progress}};}
  if (beat % 10) return { thimble: { ...t, beat }, coins: s.coins };
  const c = economicClimate(s),
    cap = t.projects.includes("hall")
      ? 8
      : t.projects.includes("cottages")
        ? 6
        : 2;
  let residents = t.residents.map((r) => ({
      ...r,
      purse:
        r.purse +
        (c.jobs >= 2
          ? t.projects.includes("market")
            ? 12
            : 6
          : -Math.min(4, r.purse)),
    })),
    news = t.news;
  if (
    c.jobs >= 2 &&
    residents.length < cap &&
    residents.every((r) => r.purse > 20)
  ) {
    const names = [
      "Pippa Mossbell",
      "Bramble Boots",
      "Ivy Thistledown",
      "Fenn Coppercap",
      "Mossy Mallow",
      "Beryl Saltwhisker",
    ];
    const name = names.find((n) => !residents.some((r) => r.name === n));
    if (name) {
      const id="family-"+name.split(" ")[0],existing=s.neighbourhood.homes[id]??0;
      residents.push({ id, name, purse: existing?80:40,homeLevel:existing,...(existing?{}:{work:{target:1,progress:0}}),arrival:0 });
      news = `${name} has moved to Thimblehaven. Bring a pie, not a planning objection.`;
    }
  } else if (
    c.jobs === 0 &&
    residents.length > 1 &&
    residents.some((r) => r.purse === 0)
  ) {
    const leaving = residents.find((r) => r.purse === 0)!;
    residents = residents.filter((r) => r !== leaving);
    news = `${leaving.name} has left for steadier work. Thimblehaven needs a healthier economy.`;
  }
  // Household extensions are funded once from their own savings.
  if(c.jobs>=2)residents=residents.map(r=>{const level=r.homeLevel??1,target=level+1,cost=target===2?120:320;
    if(!r.work&&level>=1&&level<3&&t.projects.includes(target===2?"cottages":"hall")&&r.purse>=cost+40)return {...r,purse:r.purse-cost,work:{target,progress:0}};
    return r;
  });
  let income = 0;
  residents = residents.map((r) => {
    const paid = Math.min(t.tax, r.purse);
    income += paid;
    return { ...r, purse: r.purse - paid };
  });
  return {
    coins: s.coins + income,
    thimble: { ...t, beat, residents, news, revenue: t.revenue + income },
  };
}
