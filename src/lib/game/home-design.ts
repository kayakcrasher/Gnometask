export const HOME_STYLES = ["meadow", "harbour", "stone", "sunstep"] as const;
export type HomeStyle = (typeof HOME_STYLES)[number];
export const HOME_PALETTES: Record<
  HomeStyle,
  { name: string; wall: string; roof: string; trim: string }
> = {
  meadow: {
    name: "Meadow timber",
    wall: "#e8d8b4",
    roof: "#a77a49",
    trim: "#64866c",
  },
  harbour: {
    name: "Harbour cottage",
    wall: "#dce6de",
    roof: "#5d8491",
    trim: "#487989",
  },
  stone: {
    name: "Mossy stone",
    wall: "#b5bcad",
    roof: "#647268",
    trim: "#7c6653",
  },
  sunstep: {
    name: "Sunstep adobe",
    wall: "#e7b983",
    roof: "#b8755b",
    trim: "#648f97",
  },
};
export function homeStyle(id: string, town = ""): HomeStyle {
  let n = 0;
  for (const c of id) n = (n * 31 + c.charCodeAt(0)) >>> 0;
  return town === "sunstep" && n % 2 === 0 ? "sunstep" : HOME_STYLES[n % 4]!;
}
export function homeLevel(raw: number) {
  return Number.isFinite(raw) ? Math.max(1, Math.min(5, Math.floor(raw))) : 1;
}
export const HOME_STAGES = [
  "",
  "Starter cottage",
  "Extended two-storey home",
  "Three-storey townhouse",
  "Attic and porch home",
  "Grand five-storey home",
];
export function npcUpgradeCost(level: number) {
  return 45 * homeLevel(level) ** 2;
}
export function npcHomeCost(homes: number) {
  return 120 * (1 + Math.max(0, homes)) ** 2;
}
