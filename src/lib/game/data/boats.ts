export type BoatId = "row" | "sail" | "fisher" | "barge" | "sloop";

export type BoatDef = {
  id: BoatId;
  name: string;
  need: number;
  xp: number;
  price: number;
  blurb: string;
  x: number;
  y: number;
};

/** Sailing levels are the usual curve, so the first boats open after a few trips. */
export const BOATS: BoatDef[] = [
  { id: "row", name: "Rowboat", need: 1, xp: 24, price: 0, blurb: "Two oars. Already yours.", x: -50, y: 470 },
  { id: "sail", name: "Sail skiff", need: 2, xp: 36, price: 40, blurb: "One white sail. Wim sells her.", x: -120, y: 360 },
  { id: "fisher", name: "Fisher", need: 3, xp: 52, price: 75, blurb: "A stubby cabin. Bought at the dockhouse.", x: -70, y: 590 },
  { id: "barge", name: "Cargo barge", need: 4, xp: 70, price: 120, blurb: "Crates, rope, and a ledger.", x: -140, y: 720 },
  { id: "sloop", name: "Little sloop", need: 5, xp: 90, price: 180, blurb: "Cute at the pier. Deadly past the bar.", x: -130, y: 280 },
];

export const BOAT_RANK: Record<BoatId, number> = {
  row: 1,
  sail: 2,
  fisher: 3,
  barge: 4,
  sloop: 5,
};

export function boatById(id: string) {
  return BOATS.find((b) => b.id === id) ?? null;
}
