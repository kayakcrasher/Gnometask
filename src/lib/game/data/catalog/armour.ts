import type { CatalogItem } from "../../types";
import { TIER_META, TIERS, type GearTier } from "../tiers";

const SHIELD: Record<GearTier, { name: string; blurb: string }> = {
  wood: { name: "Wooden shield", blurb: "A lid that learned ambition. Still smells of stew." },
  bronze: { name: "Bronze buckler", blurb: "Brown-gold and in the way of claws." },
  iron: { name: "Iron kite", blurb: "Covers more gnome than strictly necessary. Defence 5." },
  steel: { name: "Steel kite", blurb: "Pale, wide, and stubborn. Defence 12." },
  adamant: { name: "Adamant plate", blurb: "Green wall. Defence 20." },
};

const BODY: Record<GearTier, { name: string; blurb: string }> = {
  wood: { name: "Padded vest", blurb: "Cloth and courage. The first layer." },
  bronze: { name: "Bronze mail", blurb: "Little brown rings. Big feelings of safety." },
  iron: { name: "Iron hauberk", blurb: "Clinks when you brush your teeth. Defence 5." },
  steel: { name: "Steel plate", blurb: "A walking kettle. Defence 12." },
  adamant: { name: "Adamant platebody", blurb: "Green as the woods after rain. Defence 20." },
};

export const ARMOUR: CatalogItem[] = [
  ...TIERS.map((tier) => {
    const t = TIER_META[tier];
    const s = SHIELD[tier];
    return {
      id: `shield-${tier === "wood" ? "wood" : tier}`,
      name: s.name,
      blurb: s.blurb,
      price: Math.max(10, t.price - 2),
      kind: (tier === "adamant" ? "haven" : "shield") as CatalogItem["kind"],
      slot: "shield" as const,
      def: t.def,
      reqHall: t.hall,
      reqSkill: t.def >= 7 ? ("defence" as const) : undefined,
      reqLevel: t.def >= 7 ? (tier === "iron" ? 5 : tier === "steel" ? 12 : 20) : undefined,
    };
  }),
  ...TIERS.map((tier) => {
    const t = TIER_META[tier];
    const b = BODY[tier];
    return {
      id: `armor-${tier}`,
      name: b.name,
      blurb: b.blurb,
      price: Math.max(12, t.price + 4),
      kind: (tier === "adamant" ? "haven" : "armor") as CatalogItem["kind"],
      slot: "armor" as const,
      def: Math.ceil(t.def * 0.9) + (tier === "wood" ? 1 : 0),
      reqHall: t.hall,
      reqSkill: t.def >= 7 ? ("defence" as const) : undefined,
      reqLevel: t.def >= 7 ? (tier === "iron" ? 5 : tier === "steel" ? 12 : 20) : undefined,
    };
  }),
];
