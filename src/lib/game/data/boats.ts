export type BoatId = "row" | "sail" | "fisher" | "barge" | "sloop";

export type BoatDef = {
  id: BoatId;
  name: string;
  need: number;
  /** Sailing XP for each completed travel interval. */
  xp: number;
  price: number;
  /** Map units per second before the Sailing skill bonus. */
  speed: number;
  blurb: string;
  x: number;
  y: number;
};

/** Sailing levels are the usual curve, so the first boats open after a few trips. */
export const BOATS: BoatDef[] = [
  { id: "row", name: "Rowboat", need: 1, xp: 24, price: 0, speed: 180, blurb: "Two oars. Already yours.", x: -50, y: 470 },
  { id: "sail", name: "Sail skiff", need: 2, xp: 36, price: 40, speed: 250, blurb: "One white sail. Quick across the bay.", x: -120, y: 360 },
  { id: "fisher", name: "Fisher", need: 3, xp: 52, price: 75, speed: 220, blurb: "A steady fishing boat with a sheltered cabin.", x: -70, y: 590 },
  { id: "barge", name: "Cargo barge", need: 4, xp: 70, price: 120, speed: 150, blurb: "A slow, heavy hull. Crates, rope, and a ledger.", x: -140, y: 720 },
  { id: "sloop", name: "Little sloop", need: 5, xp: 90, price: 180, speed: 300, blurb: "The fastest hull on the pier. Armed for open water.", x: -130, y: 280 },
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
