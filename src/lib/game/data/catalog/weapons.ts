import type { CatalogItem } from "../../types";
import { TIER_META, TIERS, type GearTier } from "../tiers";

const SWORD: Record<GearTier, { id: string; name: string; blurb: string; req?: number }> = {
  wood: { id: "weapon-stick", name: "Wooden sword", blurb: "A practice blade. The wildlands call it a stick and they are not wrong." },
  bronze: { id: "weapon-bronze", name: "Bronze sword", blurb: "Brown-gold and honest. Sounds like a kettle when it hits." },
  iron: { id: "weapon-iron", name: "Iron sword", blurb: "Grey, heavy, and finally taken seriously. Attack 5.", req: 5 },
  steel: { id: "weapon-steel", name: "Steel sword", blurb: "A pale edge. Dragons call it rude. Attack 12.", req: 12 },
  adamant: { id: "weapon-adamant", name: "Adamant sword", blurb: "Green steel. Haven-forged. Attack 20.", req: 20 },
};

const GROWTH: CatalogItem[] = [
  {
    id: "weapon-rapier",
    name: "Keen rapier",
    blurb: "Keen Edge's first extra. Light, rude, and not for sale in a poor hollow. Attack 8.",
    price: 32,
    kind: "weapon",
    slot: "weapon",
    atk: 8,
    reqWealth: 80,
  },
  {
    id: "weapon-halberd",
    name: "Wall halberd",
    blurb: "Watch & Wall ordered a longer reach. Attack 14.",
    price: 74,
    kind: "weapon",
    slot: "weapon",
    atk: 14,
    reqWealth: 200,
    reqSkill: "attack",
    reqLevel: 8,
  },
  {
    id: "weapon-rune",
    name: "Rune blade",
    blurb: "The strip funded the forge. A dark edge that only a rich hollow can hang. Attack 24.",
    price: 150,
    kind: "weapon",
    slot: "weapon",
    atk: 24,
    reqWealth: 480,
    reqSkill: "attack",
    reqLevel: 16,
  },
];

export const WEAPONS: CatalogItem[] = [
  ...TIERS.map((tier) => {
    const t = TIER_META[tier];
    const s = SWORD[tier];
    return {
      id: s.id,
      name: s.name,
      blurb: s.blurb,
      price: t.price,
      kind: (tier === "adamant" ? "haven" : "weapon") as CatalogItem["kind"],
      slot: "weapon" as const,
      atk: t.atk,
      reqHall: t.hall,
      reqSkill: s.req ? ("attack" as const) : undefined,
      reqLevel: s.req,
    };
  }),
  ...GROWTH,
];