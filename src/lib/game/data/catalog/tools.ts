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
];
