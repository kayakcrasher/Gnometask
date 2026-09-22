import type { CatalogItem } from "../../types";
import { TIER_META, TIERS, type GearTier } from "../tiers";

const SWORD: Record<GearTier, { id: string; name: string; blurb: string; req?: number }> = {
  wood: { id: "weapon-stick", name: "Wooden sword", blurb: "A practice blade. The wildlands call it a stick and they are not wrong." },
  bronze: { id: "weapon-bronze", name: "Bronze sword", blurb: "Brown-gold and honest. Sounds like a kettle when it hits." },
  iron: { id: "weapon-iron", name: "Iron sword", blurb: "Grey, heavy, and finally taken seriously. Attack 5.", req: 5 },
  steel: { id: "weapon-steel", name: "Steel sword", blurb: "A pale edge. Dragons call it rude. Attack 12.", req: 12 },
  adamant: { id: "weapon-adamant", name: "Adamant sword", blurb: "Green steel. Haven-forged. Attack 20.", req: 20 },
};

export const WEAPONS: CatalogItem[] = TIERS.map((tier) => {
  const t = TIER_META[tier];
  const s = SWORD[tier];
  return {
    id: s.id,
    name: s.name,
    blurb: s.blurb,
    price: t.price,
    kind: tier === "adamant" ? "haven" : "weapon",
    slot: "weapon",
    atk: t.atk,
    reqHall: t.hall,
    reqSkill: s.req ? "attack" : undefined,
    reqLevel: s.req,
  };
});
