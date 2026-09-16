import { type MetalTier, TIERS } from "../tiers";

export type ArmourKind = "shield" | "mail";

export type Armour = {
  id: string;
  name: string;
  kind: ArmourKind;
  tier: MetalTier;
  price: number;
  defence: number;
  color: string;
  blurb: string;
};

function piece(
  kind: ArmourKind,
  tier: MetalTier,
  basePrice: number,
  blurbs: Record<MetalTier, string>,
): Armour {
  const t = TIERS.find((x) => x.id === tier)!;
  return {
    id: `\( {tier}_ \){kind}`,
    name: `${t.name} ${kind}`,
    kind,
    tier,
    price: Math.round(basePrice * t.priceMul),
    defence: t.power,
    color: t.color,
    blurb: blurbs[tier],
  };
}

const SHIELD_BLURB: Record<MetalTier, string> = {
  wood: "A lid with a strap. Better than a hat.",
  bronze: "Brown disc. Rats bounce. Sometimes.",
  iron: "Grey and heavy. The lane feels narrower.",
  steel: "Pale face. You can see your own beard in it.",
  adamant: "Green boss. The dragon calls it decorative. It is not.",
};

const MAIL_BLURB: Record<MetalTier, string> = {
  wood: "Padded vest. Stops twigs, not teeth.",
  bronze: "Brown rings. Jingling honesty.",
  iron: "Grey shirt. Sweaty. Effective.",
  steel: "Pale links. Neighbours ask if you are going to the ridge.",
  adamant: "Green mesh. Prayer still matters more than this.",
};

export const ARMOUR: Armour[] = [
  ...TIERS.map((t) => piece("shield", t.id, 12, SHIELD_BLURB)),
  ...TIERS.map((t) => piece("mail", t.id, 16, MAIL_BLURB)),
];

export function armourById(id: string): Armour | undefined {
  return ARMOUR.find((a) => a.id === id);
}

export function armourOf(kind: ArmourKind): Armour[] {
  return ARMOUR.filter((a) => a.kind === kind);
}
