/** Seeded geography stays independent of the store, so terrain, navigation and saved ports agree. */
export type OceanPoint = { x: number; y: number };
export type OceanIsland = {
  frontier?: boolean;
  danger?: number;
  id: string;
  name: string;
  x: number;
  y: number;
  rx: number;
  ry: number;
  town: boolean;
  theme: "harbour" | "meadow" | "stone";
  shore: [number, number][];
  grass: [number, number][];
  water: OceanPoint;
  landing: OceanPoint;
  population: number;
};
export type OceanSave = { seed: number; discovered: string[]; defeated?: Record<string, number> };
/** The familiar chart is a reference region, not a movement boundary. */
export const CHARTED_SEAS = { minX: -11000, maxX: 12000, minY: -13000, maxY: 10000 };
export const OCEAN_CELL = 4096;
export function oceanDanger(x: number, y: number) {
  const d = Math.hypot(Math.max(CHARTED_SEAS.minX-x, 0, x-CHARTED_SEAS.maxX), Math.max(CHARTED_SEAS.minY-y, 0, y-CHARTED_SEAS.maxY));
  return d > 0 ? 1 + Math.floor(d / OCEAN_CELL) : 0;
}
export const oceanChartBounds = (x: number, y: number) => oceanDanger(x,y) ? {
  minX: Math.floor(x/OCEAN_CELL)*OCEAN_CELL-OCEAN_CELL,
  maxX: Math.floor(x/OCEAN_CELL)*OCEAN_CELL+OCEAN_CELL*2,
  minY: Math.floor(y/OCEAN_CELL)*OCEAN_CELL-OCEAN_CELL,
  maxY: Math.floor(y/OCEAN_CELL)*OCEAN_CELL+OCEAN_CELL*2,
} : CHARTED_SEAS;
let activeSeed = 1013;
const cache = new Map<number, OceanIsland[]>();
export const getOceanSeed = () => activeSeed;
export function setOceanSeed(seed: number) {
  activeSeed = Number.isFinite(seed) ? Math.floor(seed) >>> 0 || 1013 : 1013;
}
export function emptyOcean(seed = activeSeed): OceanSave {
  return { seed, discovered: [], defeated: {} };
}
const frontierCache = new Map<string, OceanIsland | null>();
export function frontierCell(cx: number, cy: number, seed = activeSeed): OceanIsland | null {
  if (!Number.isSafeInteger(cx) || !Number.isSafeInteger(cy)) return null;
  const key = `${seed}:${cx}:${cy}`;
  if (frontierCache.has(key)) return frontierCache.get(key)!;
  let state = (Math.imul(cx,73856093) ^ Math.imul(cy,19349663) ^ Math.imul(seed,83492791)) >>> 0;
  const rand = () => { state = (Math.imul(state,1664525)+1013904223)>>>0; return state/4294967296; };
  const x = cx*OCEAN_CELL+OCEAN_CELL/2+Math.round((rand()-.5)*1000),
    y = cy*OCEAN_CELL+OCEAN_CELL/2+Math.round((rand()-.5)*1000);
  let island: OceanIsland | null = null;
  // Leave the complete old chart and its approaches untouched. Each new island fits in its cell.
  if (x < CHARTED_SEAS.minX-1200 || x > CHARTED_SEAS.maxX+1200 || y < CHARTED_SEAS.minY-1200 || y > CHARTED_SEAS.maxY+1200) {
    const rx = 320+Math.round(rand()*300), ry = 300+Math.round(rand()*280);
    const shore = Array.from({length:16},(_,j) => { const r=.88+rand()*.12,a=j*Math.PI/8;return [x+Math.cos(a)*rx*r,y+Math.sin(a)*ry*r] as [number,number]; });
    const town = rand()<.3;
    const name = `${['Moon','Bramble','Copper','Moss','Wander','Silver','Thistle','Star'][Math.floor(rand()*8)]}${['shell','wick','fern','cap','bell','haven','pebble','tide'][Math.floor(rand()*8)]} ${cx},${cy}`;
    island = {id:`ocean-frontier-${cx}_${cy}`,name,x,y,rx,ry,town,frontier:true,danger:oceanDanger(x,y),
      theme:(['harbour','meadow','stone'] as const)[Math.floor(rand()*3)]!,shore,
      grass:shore.map(([a,b])=>[x+(a-x)*.84,y+(b-y)*.84]),
      water:{x,y:y+ry+140},landing:{x,y:y+ry*.63},population:2+Math.floor(rand()*3)};
  }
  if (frontierCache.size>=192) frontierCache.delete(frontierCache.keys().next().value!);
  frontierCache.set(key,island); return island;
}
export function frontierIsland(id: string, seed = activeSeed) {
  const m = /^ocean-frontier-(-?\d+)_(-?\d+)$/.exec(id);
  if (!m) return null;
  const i=frontierCell(Number(m[1]),Number(m[2]),seed);
  return i?.id===id?i:null;
}
/** Geography is queried by position, never by a mutable list of loaded cells. */
export function oceanIslandsNear(x: number, y: number, radius = 6200, seed = activeSeed): OceanIsland[] {
  if (![x,y,radius].every(Number.isFinite)) return [];
  const r=Math.max(0,Math.min(18000,radius)),out=oceanIslands(seed).filter(i=>Math.hypot(i.x-x,i.y-y)<r+Math.max(i.rx,i.ry));
  for(let cx=Math.floor((x-r)/OCEAN_CELL);cx<=Math.floor((x+r)/OCEAN_CELL);cx++)
    for(let cy=Math.floor((y-r)/OCEAN_CELL);cy<=Math.floor((y+r)/OCEAN_CELL);cy++){
      const i=frontierCell(cx,cy,seed);if(i&&Math.hypot(i.x-x,i.y-y)<r+Math.max(i.rx,i.ry))out.push(i);
    }
  return out;
}
export function oceanIslands(seed = activeSeed): OceanIsland[] {
  if (cache.has(seed)) return cache.get(seed)!;
  let state = seed >>> 0 || 1013;
  const rand = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
  const sites = [
    [-4900, 4600, "Pebblewick"],
    [6900, 4400, "Bramble Key"],
    [7300, -7700, "Farbell"],
    [-6200, -6400, "Mintwater"],
    [1200, 7300, "Fiddlefern"],
    [-8500, -300, "Coppershell"],
    [9600, -2500, "Mooncap"],
    [-3100, -10500, "Shellsleep"],
  ] as const;
  const islands = sites.map((p, i) => {
    const x = p[0] + Math.round((rand() - 0.5) * 500),
      y = p[1] + Math.round((rand() - 0.5) * 500),
      rx = 330 + Math.round(rand() * 250),
      ry = 300 + Math.round(rand() * 220),
      radii = Array.from({ length: 16 }, () => 0.86 + rand() * 0.14);
    const shore = radii.map(
        (r, j) =>
          [
            x + Math.cos((j * Math.PI) / 8) * rx * r,
            y + Math.sin((j * Math.PI) / 8) * ry * r,
          ] as [number, number],
      ),
      grass = shore.map(
        ([a, b]) =>
          [x + (a - x) * 0.84, y + (b - y) * 0.84] as [number, number],
      );
    return {
      id: "ocean-" + i,
      name: p[2],
      x,
      y,
      rx,
      ry,
      town: i < 6,
      theme: (["harbour", "meadow", "stone"] as const)[i % 3]!,
      shore,
      grass,
      water: { x, y: y + ry + 140 },
      landing: { x, y: y + ry * 0.63 },
      population: 3 + Math.floor(rand() * 4),
    };
  });
  if (cache.size > 8) cache.clear();
  cache.set(seed, islands);
  return islands;
}
export function insideOceanPolygon(
  x: number,
  y: number,
  poly: [number, number][],
) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i]!,
      b = poly[j]!;
    if (
      a[1] > y !== b[1] > y &&
      x < ((b[0] - a[0]) * (y - a[1])) / (b[1] - a[1]) + a[0]
    )
      inside = !inside;
  }
  return inside;
}
function containsIsland(i:OceanIsland,x:number,y:number,grass:boolean){
  return Math.abs(x-i.x)<=i.rx&&Math.abs(y-i.y)<=i.ry&&insideOceanPolygon(x,y,grass?i.grass:i.shore);
}
export function oceanLandAt(x: number, y: number, grass = false) {
  if(!Number.isFinite(x)||!Number.isFinite(y))return null;
  for(const i of oceanIslands())if(containsIsland(i,x,y,grass))return i;
  const cell=frontierCell(Math.floor(x/OCEAN_CELL),Math.floor(y/OCEAN_CELL));
  return cell&&containsIsland(cell,x,y,grass)?cell:null;
}
export function oceanLanding(id: string) {
  const i = oceanIslands().find((i) => i.id === id) ?? frontierIsland(id);
  return i
    ? {
        id: i.id,
        name: i.name + (i.town ? " harbour" : " landing"),
        x: i.landing.x,
        y: i.landing.y,
        water: i.water,
        island: true,
        town: i.town,
      }
    : null;
}
export function oceanLandings(x?:number,y?:number,radius=6200) {
  const islands=x!==undefined&&y!==undefined ? [...new Map([...oceanIslands(),...oceanIslandsNear(x,y,radius)].map(i=>[i.id,i])).values()] : oceanIslands();
  return islands.map((i) => oceanLanding(i.id)!);
}
export function coerceOcean(v: unknown): OceanSave {
  const raw = v && typeof v === "object" ? (v as Partial<OceanSave>) : {};
  const seed = Number.isFinite(raw.seed)
    ? Math.floor(raw.seed!) >>> 0 || 1013
    : 1013;
  const ids = oceanIslands(seed).map((i) => i.id);
  return {
    seed,
    discovered: [
      ...new Set(
        Array.isArray(raw.discovered)
          ? raw.discovered.filter((id) => typeof id==='string' && (ids.includes(id)||frontierIsland(id,seed)))
          : [],
      ),
    ].slice(-512),
    defeated: Object.fromEntries(Object.entries(raw.defeated && typeof raw.defeated==='object'?raw.defeated:{}).filter(([id,time])=>id.startsWith('rover-')&&frontierIsland(id.slice(6),seed)&&typeof time==='number'&&Number.isFinite(time)&&time>=0).slice(-256)),
  };
}
