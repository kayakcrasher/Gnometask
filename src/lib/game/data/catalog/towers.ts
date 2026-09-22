import type { CatalogItem } from "../../types";

export const TOWERS: CatalogItem[] = [
  {
    id: "tower-1",
    name: "Stakes perch",
    blurb: "Four posts and a plank. Cheap. Watcher Greg swears it counts.",
    price: 12,
    kind: "tower",
    slotPrefix: "t",
    towerRank: 1,
  },
  {
    id: "tower-2",
    name: "Archer tower",
    blurb: "A proper nest. Upgrade this at the perch itself.",
    price: 28,
    kind: "tower",
    towerRank: 2,
  },
  {
    id: "tower-3",
    name: "Watch nest",
    blurb: "Roof, rail, a place to shout 'goblins' usefully.",
    price: 55,
    kind: "tower",
    towerRank: 3,
  },
  {
    id: "tower-4",
    name: "Longbow keep",
    blurb: "The watch grows teeth. Greg gets misty.",
    price: 90,
    kind: "tower",
    towerRank: 4,
  },
];

export const TOWER_IDS = TOWERS.map((t) => t.id);

export function nextTowerId(id: string) {
  const i = TOWER_IDS.indexOf(id);
  if (i < 0 || i >= TOWER_IDS.length - 1) return null;
  return TOWER_IDS[i + 1]!;
}
