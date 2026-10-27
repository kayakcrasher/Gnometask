import { BOATS, BOAT_RANK, boatById } from "./data/boats";
import { ISLE_BY_ID, type IsleDef } from "./data/isles";
import { PUBLIC_PORT, NORTH_LANDING, portSite } from "./ports";
import { oceanLandings } from "./ocean-world";
import { navigableWater } from "./sailing";
import { levelFromXp } from "./xp";
import type { GameSave } from "./types";

export function raidAccess(
  s: Pick<
    GameSave,
    "skills" | "hulls" | "afloat" | "chart" | "gnomeX" | "gnomeY"
  > & Partial<Pick<GameSave,"naval"|"ports">>,
  isle: IsleDef,
) {
  const level = levelFromXp(s.skills.sailing);
  const owned = BOATS.filter(
    (b) => (b.id === "row" || s.hulls.includes(b.id)) && level >= b.need &&
      levelFromXp(s.skills.navalWarfare ?? 0) >= (b.warfare ?? 1),
  );
  const usable = (b: (typeof BOATS)[number]) =>
    (s.naval?.integrity[b.id] ?? 1) > 0 && !s.ports?.shipments.some(t=>t.boat===b.id);
  const candidates = owned.filter(b=>BOAT_RANK[b.id]>=BOAT_RANK[isle.boatNeed]);
  const boat = s.afloat ? owned.find(b=>b.id===s.afloat&&usable(b)) : [...candidates].reverse().find(usable);
  const harbours = [PUBLIC_PORT,NORTH_LANDING,...oceanLandings(s.gnomeX,s.gnomeY),
    ...(s.ports?.docks??[]).flatMap(d=>{const p=portSite(d.site);return p?[p]:[];})];
  const harbour = harbours.filter(p=>Math.hypot(s.gnomeX-p.x,s.gnomeY-p.y)<=150)
    .sort((a,b)=>Math.hypot(s.gnomeX-a.x,s.gnomeY-a.y)-Math.hypot(s.gnomeX-b.x,s.gnomeY-b.y))[0] ?? null;
  let reason: string | null = null;
  if (level < isle.sailNeed) reason = `Sailing ${isle.sailNeed} needed`;
  else if (isle.id === "mucktooth" && !s.chart)
    reason = "Find a goblin map first";
  else if (!boat || BOAT_RANK[boat.id] < BOAT_RANK[isle.boatNeed])
    reason = candidates.length && !boat
      ? "No seaworthy boat is available. Repair disabled hulls or wait for freight to return."
      : `Bring a ${boatById(isle.boatNeed)!.name.toLowerCase()} or better`;
  else if (!s.afloat && !harbour) reason = "Come to a public landing or your own wharf to sail";
  return { boat, reason, harbour };
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
