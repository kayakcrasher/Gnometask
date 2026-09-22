import type { CatalogItem } from "../../types";

export const FOOD: CatalogItem[] = [
  { id: "food-honey", name: "Honey cake", blurb: "Soothe a dragon or a bruise. The ridge can smell it.", price: 8, kind: "food", heal: 10 },
  { id: "food-bread", name: "Village loaf", blurb: "Miller's courage. Heals a sensible amount.", price: 6, kind: "food", heal: 8 },
  { id: "food-pie", name: "Suspicious pie", blurb: "Do not ask. Eat. Heal more.", price: 12, kind: "food", heal: 14 },
  { id: "food-stew", name: "Haven stew", blurb: "Blue potatoes. Unique. Fills the whole gnome.", price: 16, kind: "haven", heal: 18 },
];
