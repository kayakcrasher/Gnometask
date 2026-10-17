import { BOATS, BOAT_RANK, boatById } from "./data/boats";
import { ISLE_BY_ID, type IsleDef } from "./data/isles";
import { PLACE_ANCHORS } from "./data/layout";
import { navigableWater } from "./sailing";
import { levelFromXp } from "./xp";
import type { GameSave } from "./types";

export function raidAccess(
  s: Pick<
    GameSave,
    "skills" | "hulls" | "afloat" | "chart" | "gnomeX" | "gnomeY"
  >,
  isle: IsleDef,
) {
  const level = levelFromXp(s.skills.sailing);
  const owned = BOATS.filter(
    (b) => (b.id === "row" || s.hulls.includes(b.id)) && level >= b.need,
  );
  const boat = s.afloat
    ? owned.find((b) => b.id === s.afloat)
    : [...owned]
        .reverse()
        .find((b) => BOAT_RANK[b.id] >= BOAT_RANK[isle.boatNeed]);
  let reason: string | null = null;
  if (level < isle.sailNeed) reason = `Sailing ${isle.sailNeed} needed`;
  else if (isle.id === "mucktooth" && !s.chart)
    reason = "Find a goblin map first";
  else if (!boat || BOAT_RANK[boat.id] < BOAT_RANK[isle.boatNeed])
    reason = `Bring a ${boatById(isle.boatNeed)!.name.toLowerCase()} or better`;
  else if (
    !s.afloat &&
    Math.hypot(
      s.gnomeX - PLACE_ANCHORS.dock.x,
      s.gnomeY - PLACE_ANCHORS.dock.y,
    ) > 150
  )
    reason = "Come to the harbour to sail";
  return { boat, reason };
}

export function coerceRaidProgress(raw: unknown): GameSave["raidProgress"] {
  const result: GameSave["raidProgress"] = {};
  if (!raw || typeof raw !== "object") return result;
  for (const [id, row] of Object.entries(raw)) {
    const isle = ISLE_BY_ID[id];
    if (!isle || !row || typeof row !== "object") continue;
    const value = row as { defeated?: unknown; claimed?: unknown };
    const allowed = new Set([...isle.defenders.map((d) => d.id), isle.boss.id]);
    const defeated = Array.isArray(value.defeated)
      ? [
          ...new Set(
            value.defeated.filter(
              (v): v is string => typeof v === "string" && allowed.has(v),
            ),
          ),
        ]
      : [];
    result[id] = {
      defeated,
      claimed: value.claimed === true && defeated.length === allowed.size,
    };
  }
  return result;
}

export function coerceRaidVisit(raw: unknown): GameSave["raidVisit"] {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as GameSave["raidVisit"];
  if (!row || !ISLE_BY_ID[row.isleId]) return null;
  const boat = boatById(row.boat);
  if (!boat) return null;
  const validPosition = navigableWater(row.returnX, row.returnY);
  return {
    isleId: row.isleId,
    boat: boat.id,
    returnX: validPosition ? row.returnX : boat.x,
    returnY: validPosition ? row.returnY : boat.y,
  };
}
