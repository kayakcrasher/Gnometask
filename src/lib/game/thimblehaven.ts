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
] as const;
export type TownResident = { id: string; name: string; purse: number };
export type Thimblehaven = {
  version: 1;
  projects: string[];
  residents: TownResident[];
  beat: number;
  revenue: number;
  spent: number;
  tax: number;
  news: string;
};
export const emptyThimble = (): Thimblehaven => ({
  version: 1,
  projects: [],
  residents: [
    { id: "nim", name: "Nim Nettlewick", purse: 120 },
    { id: "holly", name: "Holly Bracken", purse: 120 },
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
        ...r,
        name: r.name.slice(0, 30),
        purse: Math.max(0, Math.floor(r.purse)),
      }));
  for (const k of ["beat", "revenue", "spent"] as const)
    if (Number.isFinite(t[k])) out[k] = Math.max(0, Math.floor(t[k]!));
  out.tax = [0, 1, 2, 3].includes(t.tax!) ? t.tax! : 1;
  out.news = typeof t.news === "string" ? t.news.slice(0, 300) : out.news;
  return out;
}
export function stepThimble(s: GameSave) {
  const t = s.thimble,
    beat = t.beat + 1;
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
      residents.push({ id: "family-" + name.split(" ")[0], name, purse: 80 });
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
