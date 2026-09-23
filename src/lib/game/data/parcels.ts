import { NPCS } from "./npcs";
import { onGrass } from "../world3";

export type Parcel = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  price: number;
  /** Gnome who holds the deed until you buy it. Null means the hollow is selling it cold. */
  owner: string | null;
  ownerName: string | null;
};

const HOMES: { npc: string; x: number; y: number }[] = [
  { npc: "pappy", x: 96, y: 555 },
  { npc: "wim", x: 118, y: 500 },
  { npc: "greg", x: 140, y: 380 },
  { npc: "nettie", x: 250, y: 400 },
  { npc: "stoic", x: 190, y: 560 },
  { npc: "miller", x: 270, y: 640 },
  { npc: "brine", x: 150, y: 660 },
  { npc: "bramble", x: 168, y: 248 },
  { npc: "pipkin", x: 1100, y: 800 },
];

function buildParcels(): Parcel[] {
  const out: Parcel[] = [];
  const w = 200;
  const h = 180;
  for (let x = 160; x <= 2500; x += w) {
    for (let y = 140; y <= 1280; y += h) {
      if (!onGrass(x + w / 2, y + h / 2)) continue;
      const id = `p-${x}-${y}`;
      const home = HOMES.find((n) => Math.hypot(n.x - (x + w / 2), n.y - (y + h / 2)) < 150);
      const npc = home ? NPCS.find((n) => n.id === home.npc) : undefined;
      const far = Math.hypot(x - 280, y - 520) / 90;
      const price = Math.round((18 + far * 6) * (npc ? 2 : 1));
      out.push({
        id,
        x,
        y,
        w,
        h,
        price,
        owner: npc?.id ?? null,
        ownerName: npc?.shortName ?? npc?.name ?? null,
      });
    }
  }
  return out;
}

export const PARCELS: Parcel[] = buildParcels();

export function parcelAt(id: string) {
  return PARCELS.find((p) => p.id === id) ?? null;
}
