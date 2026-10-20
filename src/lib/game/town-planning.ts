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
  const civic = s.civic,
    batch = Math.floor(civic.beat / 96);
  if (
    batch < 1 ||
    civic.gnomes.some((g) => g.id === `settler-${batch}`) ||
    civic.gnomes.filter((g) => g.id.startsWith("settler-")).length >= 18
  )
    return civic;
  const plot = civic.plots.find(
    (p) =>
      p.id.startsWith("frontier-") &&
      p.stories === 0 &&
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
    name = names[n]!;
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
    gnomes: [...civic.gnomes, resident],
    plots: civic.plots.map((p) =>
      p.id === plot.id ? { ...p, stories: 1, owner: id, shares: [id] } : p,
    ),
    news: `${name}'s family moved into the northern countryside and paid 200 coins from their savings for a new home.`,
  };
}
