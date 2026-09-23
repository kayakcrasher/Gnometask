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

export function bestHatchet(owned: string[]) {
  const order = ["hatchet-adamant", "hatchet-steel", "hatchet-iron", "hatchet-bronze", "hatchet-wood"];
  return order.find((id) => owned.includes(id)) ?? null;
}

export function bestRod(owned: string[]) {
  const order = ["rod-adamant", "rod-steel", "rod-iron", "rod-bronze", "rod-wood"];
  return order.find((id) => owned.includes(id)) ?? null;
}

export { ARMOUR, FOOD, FORTS, GARDEN, GEAR, HATS, HOUSE, TOOLS, TOWERS, VILLAGE, WEAPONS };
