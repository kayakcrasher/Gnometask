import { ADVANCED_GEAR } from "./advanced";
import type { CatalogItem } from "../../types";
import { FOOD } from "./food";
import { FORTS } from "./forts";
import { GARDEN } from "./garden";
import { ARMOUR, GEAR, TOOLS, WEAPONS } from "./gear";
import { HATS } from "./hats";
import { HOUSE } from "./house";
import { TOWERS } from "./towers";
import { VILLAGE } from "./village";

export const CATALOG: CatalogItem[] = [
  ...HATS,
  ...HOUSE,
  ...GARDEN,
  ...VILLAGE,
  ...WEAPONS,
  ...ARMOUR,
  ...TOOLS,
  ...ADVANCED_GEAR,
  ...FOOD,
  ...FORTS,
  ...TOWERS,
];

export const CATALOG_BY_ID: Record<string, CatalogItem> = Object.fromEntries(
  CATALOG.map((item) => [item.id, item]),
);

export const MILESTONES = [3, 7, 14, 30, 60, 100];

export function gearStats(id: string | null | undefined) {
  if (!id) return { atk: 0, def: 0, wc: 0, farm: 0 };
  const item = CATALOG_BY_ID[id];
  return { atk: item?.atk ?? 0, def: item?.def ?? 0, wc: item?.wc ?? 0, farm: item?.farm ?? 0 };
}

function bestOwned(owned: string[], prefix: string, stat: "wc" | "fish") {
  return owned.map(id => CATALOG_BY_ID[id]).filter(item => item?.id.startsWith(prefix))
    .sort((a,b) => (b[stat] ?? 0) - (a[stat] ?? 0))[0]?.id ?? null;
}
export function bestHatchet(owned: string[]) { return bestOwned(owned,"hatchet-","wc"); }
export function bestRod(owned: string[]) { return bestOwned(owned,"rod-","fish"); }
export function bestCraft(owned: string[]) { return Math.max(0,...owned.map(id=>CATALOG_BY_ID[id]?.craft ?? 0)); }
export function harvestYield(owned: string[]) { return 1 + Math.floor(Math.max(0,...owned.filter(id=>id.startsWith("hoe-")).map(id=>(CATALOG_BY_ID[id]?.farm ?? 1)-1))/3); }

export { ARMOUR, FOOD, FORTS, GARDEN, GEAR, HATS, HOUSE, TOOLS, TOWERS, VILLAGE, WEAPONS };
