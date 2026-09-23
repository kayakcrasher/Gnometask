import type { CatalogItem } from "../../types";
import { TIER_META, TIERS, type GearTier } from "../tiers";

const AXE: Record<GearTier, { name: string; blurb: string }> = {
  wood: { name: "Wooden hatchet", blurb: "Mostly for kindling. The oaks are patient with you." },
  bronze: { name: "Bronze hatchet", blurb: "Brown blade, pine handle. The woods start to listen." },
  iron: { name: "Iron hatchet", blurb: "A proper bite. Chips fly. Woodcutting 5." },
  steel: { name: "Steel hatchet", blurb: "Sings against oak. Woodcutting 12." },
  adamant: { name: "Adamant hatchet", blurb: "Green edge. Trees remember being forests." },
};

const HOE: Record<GearTier, { name: string; blurb: string }> = {
  wood: { name: "Wooden hoe", blurb: "A stick with opinions about soil." },
  bronze: { name: "Bronze hoe", blurb: "Turns beds the colour of tea." },
  iron: { name: "Iron hoe", blurb: "The beans take you seriously. Farming 5." },
  steel: { name: "Steel hoe", blurb: "Rows as straight as a hymn. Farming 12." },
  adamant: { name: "Adamant hoe", blurb: "Green iron. The garden plots against weeds." },
};

const ROD: Record<GearTier, { name: string; blurb: string; fish: number; req?: number }> = {
  wood: { name: "Stick rod", blurb: "A switch, a string, and hope. Fine for sprats.", fish: 0 },
  bronze: { name: "Bronze rod", blurb: "The line holds. Rarer fish start to notice. Fishing 3.", fish: 1, req: 3 },
  iron: { name: "Iron rod", blurb: "A real bend in the tip. Fishing 6.", fish: 2, req: 6 },
  steel: { name: "Steel rod", blurb: "The deep ones stop laughing. Fishing 10.", fish: 3, req: 10 },
  adamant: { name: "Adamant rod", blurb: "Green as the sea at dusk. Leviathans take it personally. Fishing 16.", fish: 4, req: 16 },
};

export const TOOLS: CatalogItem[] = [
  ...TIERS.map((tier) => {
    const t = TIER_META[tier];
    const a = AXE[tier];
    return {
      id: `hatchet-${tier}`,
      name: a.name,
      blurb: a.blurb,
      price: Math.max(8, t.price - 4),
      kind: "tool" as const,
      slot: "weapon" as const,
      atk: Math.max(1, t.atk - 2),
      wc: t.wc,
      reqHall: t.hall,
      reqSkill: t.wc >= 3 ? ("woodcutting" as const) : undefined,
      reqLevel: t.wc >= 3 ? (t.wc === 3 ? 5 : t.wc === 4 ? 12 : 20) : undefined,
    };
  }),
  ...TIERS.map((tier) => {
    const t = TIER_META[tier];
    const h = HOE[tier];
    return {
      id: `hoe-${tier}`,
      name: h.name,
      blurb: h.blurb,
      price: Math.max(6, t.price - 8),
      kind: "tool" as const,
      slot: "tool" as const,
      farm: t.farm,
      reqHall: t.hall,
      reqSkill: t.farm >= 3 ? ("farming" as const) : undefined,
      reqLevel: t.farm >= 3 ? (t.farm === 3 ? 5 : t.farm === 4 ? 12 : 20) : undefined,
    };
  }),
  ...TIERS.map((tier) => {
    const t = TIER_META[tier];
    const r = ROD[tier];
    return {
      id: `rod-${tier}`,
      name: r.name,
      blurb: r.blurb,
      price: tier === "wood" ? 6 : Math.max(12, t.price - 6),
      kind: "tool" as const,
      slot: "tool" as const,
      fish: r.fish,
      reqHall: t.hall,
      reqSkill: r.req ? ("fishing" as const) : undefined,
      reqLevel: r.req,
    };
  }),
];
