/** Seeded geography stays independent of the store, so terrain, navigation and saved ports agree. */
export type OceanPoint = { x: number; y: number };
export type OceanIsland = {
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
export type OceanSave = { seed: number; discovered: string[] };
let activeSeed = 1013;
const cache = new Map<number, OceanIsland[]>();
export const getOceanSeed = () => activeSeed;
export function setOceanSeed(seed: number) {
  activeSeed = Number.isFinite(seed) ? Math.floor(seed) >>> 0 || 1013 : 1013;
}
export function emptyOcean(seed = activeSeed): OceanSave {
  return { seed, discovered: [] };
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
export function oceanLandAt(x: number, y: number, grass = false) {
  return (
    oceanIslands().find(
      (i) =>
        Math.abs(x - i.x) <= i.rx &&
        Math.abs(y - i.y) <= i.ry &&
        insideOceanPolygon(x, y, grass ? i.grass : i.shore),
    ) ?? null
  );
}
export function oceanLanding(id: string) {
  const i = oceanIslands().find((i) => i.id === id);
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
export function oceanLandings() {
  return oceanIslands().map((i) => oceanLanding(i.id)!);
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
          ? raw.discovered.filter((id) => ids.includes(id))
          : [],
      ),
    ],
  };
}
