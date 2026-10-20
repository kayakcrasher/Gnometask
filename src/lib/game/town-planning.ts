import { ROAD_PROJECTS } from "./data/expansion";
import { FRONTIER_SETTLEMENTS } from "./data/frontier";
import { nearRoad } from "./data/road-layout";
import { FRONTIER_NEIGHBOURS } from "./data/frontier";
import { FRONTIER_HOMES } from "./data/expansion";
import { parcelAt } from "./data/parcels";
import { buildingSiteClear, insideParcel } from "./land-planning";
import type { GameSave } from "./types";
import type { CivicPlot, CivicState } from "./data/civic";
export function npcBuildAllowed(
  s: Pick<GameSave, "deeds" | "estate" | "civic" | "city">,
  p: CivicPlot,
) {
  if (
    s.deeds.some((id) => {
      const parcel = parcelAt(id);
      return parcel && insideParcel(parcel, p.x, p.y);
    })
  )
    return false;
  const titled=s.civic.gnomes.find(g=>g.northDeeds?.some(id=>{const land=parcelAt(id);return land&&insideParcel(land,p.x,p.y);}));
  if(titled&&p.owner!==titled.id&&!p.shares.includes(titled.id))return false;
  if (s.city.roads.some((r) => nearRoad(p.x, p.y, r, 28))) return false;
  return buildingSiteClear(p.x, p.y, [
    ...Object.values(s.estate),
    ...s.city.buildings,
    ...s.civic.plots.filter((other) => other.id !== p.id && other.stories > 0),
  ]);
}
export function openFrontier(
  civic: CivicState,
  completed: string[],
): CivicState {
  const sites = [
    ...FRONTIER_HOMES.map((p, i) => ({
      ...p,
      id: `noble-reach-${i}`,
      road: "noble-reach",
    })),
    ...FRONTIER_NEIGHBOURS.map((p, i) => ({
      ...p,
      id: `frontier-${p.district}-${i}`,
    })),
  ];
  const plots: CivicPlot[] = sites
    .filter(
      (p) =>
        completed.includes(p.road) &&
        !civic.plots.some((old) => old.id === p.id),
    )
    .map((p) => ({
      id: p.id,
      x: p.x,
      y: p.y,
      town: "haven",
      shares: [],
      lantern: false,
      stories: 0,
      owner: null,
      rental: false,
      trim: [],
    }));
  if (!plots.length) return civic;
  return {
    ...civic,
    plots: [...plots, ...civic.plots],
    news: `The road crew surveyed ${plots.length} new home sites. Growing trade can bring new neighbours.`,
  };
}
/** Families bring savings and pay for their own home. No player wallet or deed is used. */
export function settleFrontier(s: GameSave): CivicState {
  const civic = growNeighbourhoods(s),
    batch = Math.floor(civic.beat / 96);
  if (
    batch < 1 || batch <= (civic.lastArrival??0) ||
    civic.gnomes.some((g) => g.id === `settler-${batch}`) ||
    civic.gnomes.filter((g) => g.id.startsWith("settler-")).length >= 54
  )
    return civic;
  const plot = civic.plots.find(
    (p) =>
      p.id.startsWith("frontier-") &&
      !p.owner &&
      !p.shares.length &&
      npcBuildAllowed(s, p),
  );
  if (!plot) return civic;
  const names = [
    "Clover",
    "Mallow",
    "Puddle",
    "Tansy",
    "Biscuit",
    "Wren",
    "Thimble",
    "Juniper",
    "Moss",
    "Pip",
    "Hazel",
    "Button",
    "Crumble",
    "Sorrel",
    "Nettle",
    "Bramble",
    "Petal",
    "Acorn",
  ];
  const n = civic.gnomes.filter((g) => g.id.startsWith("settler-")).length,
    id = `settler-${batch}`,
    name = names[n%names.length]!+(n>=names.length?` ${Math.floor(n/names.length)+1}`:"");
  const resident = {
    id,
    name,
    town: "haven" as const,
    job: "homesteader",
    hat: "hat-straw",
    coat: ["#719583", "#b58d6c", "#a393b5"][n % 3]!,
    good: true,
    purse: 260 - 200,
    family: 2,
    moonshine: 0,
    x: plot.x - 16,
    y: plot.y + 30,
    line: `${name}: We saved 200 coins for our little house. There is so much sky out here!`,
  };
  return {
    ...civic,
    lastArrival:batch,
    gnomes: [...civic.gnomes, resident],
    plots: civic.plots.map((p) =>
      p.id === plot.id ? { ...p, stories: Math.max(1,p.stories), owner: id, shares: [id] } : p,
    ),
    news: `${name}'s family moved into the northern countryside and paid 200 coins from their savings for a new home.`,
  };
}

/** Extend a full district along its completed road, while leaving countryside and private deeds alone. */
export function growNeighbourhoods(s:GameSave):CivicState{
 let civic=s.civic;
 for(const d of FRONTIER_SETTLEMENTS){
  if(!s.roadWorks.completed.includes(d.road))continue;
  const existing=civic.plots.filter(p=>p.id.startsWith(`frontier-${d.id}-`));
  if(existing.length>=18||existing.some(p=>!p.owner&&!p.shares.length&&npcBuildAllowed({...s,civic},p)))continue;
  const road=ROAD_PROJECTS.find(r=>r.id===d.road)!;
  const extra:CivicPlot[]=[];
  for(let i=1;i<road.points.length&&extra.length<2;i+=3){const a=road.points[i-1]!,b=road.points[i]!,dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy)||1;
   for(const side of [-1,1]){const x=Math.round(b[0]-dy/len*side*125),y=Math.round(b[1]+dx/len*side*125),p:CivicPlot={id:`frontier-${d.id}-growth-${existing.length+extra.length}`,town:'haven',x,y,shares:[],stories:0,owner:null,lantern:false,rental:false,trim:[]};
    if(!npcBuildAllowed({...s,civic},p)||!buildingSiteClear(x,y,[...civic.plots,...extra]))continue;
    extra.push(p);if(extra.length===2)break;
   }
  }
  if(extra.length)civic={...civic,plots:[...extra,...civic.plots],news:`${d.name} surveyed ${extra.length} more homes beside its established road.`};
 }
 return civic;
}
