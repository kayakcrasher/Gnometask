import { oceanIslands } from "./ocean-world";
import { navigableWater } from "./sailing";
import {
  rescuePorts,
  coerceRescue,
  type EnemyWreck,
  type TowRescue,
} from "./ocean-rescue";
import { boatById, type BoatId } from "./data/boats";
export type ShipFit = { guns: number; crew: number };
export type SeaVessel = {
  id: string;
  name: string;
  kind: BoatId;
  side: "enemy" | "friendly";
  x: number;
  y: number;
  hp: number;
  guns: number;
  reward: number;
  respawn: number;
  patrol?: { x: number; y: number; r: number };
};
export const SEA_VESSELS: SeaVessel[] = [
  {
    id: "ragged",
    name: "Ragged Turnip · pirate scout",
    kind: "pirate",
    side: "enemy",
    x: 1450,
    y: -3580,
    hp: 42,
    guns: 1,
    reward: 90,
    respawn: 0,
  },
  {
    id: "blackcap",
    name: "Blackcap’s Revenge",
    kind: "pirate",
    side: "enemy",
    x: -1600,
    y: -1800,
    hp: 160,
    guns: 4,
    reward: 550,
    respawn: 0,
  },
  {
    id: "iron",
    name: "Iron Thistle · outlaw frigate",
    kind: "frigate",
    side: "enemy",
    x: 5050,
    y: 1000,
    hp: 400,
    guns: 10,
    reward: 2400,
    respawn: 0,
  },
  {
    id: "watch",
    name: "HMS Acorn · island coastguard",
    kind: "warcutter",
    side: "friendly",
    x: 1550,
    y: -3920,
    hp: 160,
    guns: 4,
    reward: 0,
    respawn: 0,
  },
  {
    id: "rosemary",
    name: "Captain Rosemary · licensed privateer",
    kind: "pirate",
    side: "friendly",
    x: -500,
    y: 1600,
    hp: 160,
    guns: 6,
    reward: 0,
    respawn: 0,
  },
];
export function roamingPirates(): SeaVessel[] {
  return oceanIslands().map((i, index) => ({
    id: `rover-${i.id}`,
    name: `${["Captain Crookedcap", "The Salt Snatcher", "Mildew’s Fortune", "Barnacle Betty", "Copperbeard", "Captain Snags", "The Moonlit Menace", "Fiddlehook"][index]} · roaming pirate`,
    kind: index % 3 === 2 ? "brig" : "pirate",
    side: "enemy",
    x: i.x + i.rx + 700,
    y: i.y - i.ry - 400,
    hp: 70 + index * 25,
    guns: 1 + Math.floor(index / 2),
    reward: 150 + index * 90,
    respawn: 0,
    patrol: { x: i.x + i.rx + 700, y: i.y - i.ry - 400, r: 120 },
  }));
}
export function fleetSeeds() {
  return [...SEA_VESSELS, ...roamingPirates()];
}
export const gunLimit = (id: string) =>
  ({
    row: 1,
    sail: 2,
    fisher: 2,
    barge: 4,
    sloop: 2,
    coaster: 4,
    packet: 6,
    yacht: 4,
    expedition: 10,
    megayacht: 12,
    warcutter: 4,
    brig: 8,
    frigate: 16,
    pirate: 6,
    galleon: 20,
  })[id] ?? 0;
export const hullStrength = (id: string) =>
  (boatById(id)?.price ?? 0) >= 1000000
    ? Math.max(240, 60 + gunLimit(id) * 15)
    : 60 + gunLimit(id) * 15;
export type Naval = {
  moored: Record<string, string>;
  clock: number;
  wrecks: EnemyWreck[];
  boarding: string | null;
  rescue: TowRescue | null;
  fits: Record<string, ShipFit>;
  integrity: Record<string, number>;
  ammo: number;
  cooldown: number;
  enemyCooldown: number;
  battle: string | null;
  auto: boolean;
  vessels: SeaVessel[];
  victories: number;
  spent: number;
};
export const emptyNaval = (): Naval => ({
  moored: {},
  clock: 0,
  wrecks: [],
  boarding: null,
  rescue: null,
  fits: {},
  integrity: {},
  ammo: 0,
  cooldown: 0,
  enemyCooldown: 0,
  battle: null,
  auto: true,
  vessels: fleetSeeds().map((v) => ({ ...v })),
  victories: 0,
  spent: 0,
});
export const shipFit = (n: Naval | undefined, id: string): ShipFit =>
  n?.fits[id] ?? { guns: 0, crew: 0 };
export function coerceNaval(
  v: unknown,
  hulls: string[],
  legacy: boolean,
): Naval {
  const out = emptyNaval(),
    raw = v && typeof v === "object" ? (v as Partial<Naval>) : null;
  const owned = ["row", ...hulls].filter((id) => !!boatById(id));
  for (const id of owned) {
    const f = raw?.fits?.[id];
    const guns = Math.max(
      0,
      Math.min(
        gunLimit(id),
        Number.isFinite(f?.guns) ? Math.floor(f.guns) : !raw && legacy ? 1 : 0,
      ),
    );
    out.fits[id] = {
      guns,
      crew: Math.max(0, Math.min(guns, Math.floor(f?.crew ?? 0) || 0)),
    };
    const hp = raw?.integrity?.[id];
    if (Number.isFinite(hp))
      out.integrity[id] = Math.max(0, Math.min(hullStrength(id), hp!));
  }
  if (!raw) {
    out.ammo = legacy ? 30 : 0;
    return out;
  }
  for (const k of ["ammo", "victories", "spent"] as const)
    if (Number.isFinite(raw[k])) out[k] = Math.max(0, Math.floor(raw[k]!));
  for (const k of ["cooldown", "enemyCooldown"] as const)
    if (Number.isFinite(raw[k])) out[k] = Math.max(0, Math.min(6, raw[k]!));
  out.auto = raw.auto !== false;
  out.vessels = fleetSeeds().map((seed) => {
    const r = Array.isArray(raw.vessels)
      ? raw.vessels.find((v) => v?.id === seed.id)
      : null;
    return {
      ...seed,
      ...(seed.patrol &&
      r &&
      Number.isFinite(r.x) &&
      Number.isFinite(r.y) &&
      Math.hypot(r.x - seed.patrol.x, r.y - seed.patrol.y) <=
        seed.patrol.r + 1 &&
      navigableWater(r.x, r.y)
        ? { x: r.x, y: r.y }
        : {}),
      hp:
        r && Number.isFinite(r.hp)
          ? Math.max(0, Math.min(seed.hp, r.hp))
          : seed.hp,
      respawn:
        r && Number.isFinite(r.respawn)
          ? Math.max(0, Math.min(600, r.respawn))
          : 0,
    };
  });
  if (raw.moored && typeof raw.moored === "object")
    for (const [boat, port] of Object.entries(raw.moored)) {
      if (owned.includes(boat) && rescuePorts().some((p) => p.id === port))
        out.moored[boat] = port;
    }
  out.clock =
    typeof raw.clock === "number" && Number.isFinite(raw.clock)
      ? Math.max(0, raw.clock)
      : 0;
  out.wrecks = (Array.isArray(raw.wrecks) ? raw.wrecks : [])
    .filter(
      (w, i, a) =>
        w &&
        Number.isFinite(w.x) &&
        Number.isFinite(w.y) &&
        navigableWater(w.x, w.y) &&
        Number.isFinite(w.seconds) &&
        w.seconds > 0 &&
        a.findIndex((k) => k?.id === w.id) === i &&
        out.vessels.some((e) => e.id === w.id && e.hp === 0),
    )
    .map((w) => {
      const e = out.vessels.find((v) => v.id === w.id)!;
      return {
        id: w.id,
        kind: e.kind,
        x: w.x,
        y: w.y,
        seconds: Math.min(120, w.seconds),
        looted: w.looted === true,
        coins: e.reward,
      };
    });
  out.boarding = out.wrecks.some((w) => w.id === raw.boarding && w.seconds > 20)
    ? raw.boarding!
    : null;
  out.rescue = coerceRescue(raw.rescue, owned);
  out.battle = out.vessels.some(
    (e) => e.id === raw.battle && e.side === "enemy" && e.hp > 0,
  )
    ? raw.battle!
    : null;
  return out;
}
