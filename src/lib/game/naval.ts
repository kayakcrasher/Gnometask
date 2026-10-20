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
  fits: {},
  integrity: {},
  ammo: 0,
  cooldown: 0,
  enemyCooldown: 0,
  battle: null,
  auto: true,
  vessels: SEA_VESSELS.map((v) => ({ ...v })),
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
      out.integrity[id] = Math.max(1, Math.min(hullStrength(id), hp!));
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
  out.vessels = SEA_VESSELS.map((seed) => {
    const r = Array.isArray(raw.vessels)
      ? raw.vessels.find((v) => v?.id === seed.id)
      : null;
    return {
      ...seed,
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
  out.battle = out.vessels.some(
    (e) => e.id === raw.battle && e.side === "enemy" && e.hp > 0,
  )
    ? raw.battle!
    : null;
  return out;
}
