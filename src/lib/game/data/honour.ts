import type { BoatId } from "./boats";

export type NpcStat = { hp: number; atk: number; def: number; valor: number };

/** Town gnomes. Valor is how readily they stand when a swarm hits the dock. */
export const NPC_STATS: Record<string, NpcStat> = {
  pappy: { hp: 30, atk: 7, def: 5, valor: 9 },
  greg: { hp: 24, atk: 10, def: 4, valor: 8 },
  stoic: { hp: 20, atk: 5, def: 7, valor: 7 },
  brine: { hp: 16, atk: 6, def: 3, valor: 5 },
  wim: { hp: 15, atk: 3, def: 3, valor: 4 },
  miller: { hp: 14, atk: 3, def: 3, valor: 4 },
  nettie: { hp: 12, atk: 2, def: 2, valor: 3 },
  bramble: { hp: 14, atk: 4, def: 4, valor: 3 },
  pipkin: { hp: 11, atk: 2, def: 2, valor: 2 },
};

export const HONOUR_CODE =
  "Stand when the dock is crowded. Pay what you owe. Do not strike a town that has put its knives down.";

export const DEFENDERS = ["greg", "pappy", "stoic", "brine"] as const;

export type LandOffer = {
  id: string;
  name: string;
  kind: "yard" | "lot";
  x: number;
  y: number;
  respect: number;
  coins: number;
};

export const LAND_OFFERS: LandOffer[] = [
  { id: "tile-west", name: "West bed", kind: "yard", x: 820, y: 800, respect: 3, coins: 16 },
  { id: "tile-east", name: "East bed", kind: "yard", x: 1140, y: 800, respect: 3, coins: 16 },
  { id: "lot-inn", name: "Inn pad", kind: "lot", x: 260, y: 560, respect: 5, coins: 30 },
  { id: "lot-chapel", name: "Chapel pad", kind: "lot", x: 370, y: 570, respect: 5, coins: 30 },
  { id: "lot-market", name: "Market pad", kind: "lot", x: 580, y: 570, respect: 6, coins: 40 },
  { id: "lot-school", name: "School pad", kind: "lot", x: 690, y: 540, respect: 6, coins: 40 },
];

export const BOAT_LOANS: { boat: BoatId; respect: number; owed: number; name: string }[] = [
  { boat: "sail", respect: 4, owed: 48, name: "Sail skiff" },
  { boat: "fisher", respect: 6, owed: 80, name: "Fisher" },
  { boat: "barge", respect: 8, owed: 120, name: "Cargo barge" },
  { boat: "sloop", respect: 12, owed: 180, name: "Little sloop" },
];

export function rolledChart(enemyId: string, already: boolean) {
  if (already) return false;
  if (enemyId !== "goblin" && enemyId !== "runt" && enemyId !== "raider") return false;
  return Math.random() < 0.32;
}
