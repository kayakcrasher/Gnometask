import { type MetalTier, TIERS } from "../tiers";

export type ToolKind = "hatchet" | "hoe";

export type Tool = {
  id: string;
  name: string;
  kind: ToolKind;
  tier: MetalTier;
  price: number;
  power: number;
  color: string;
  blurb: string;
};

function tool(
  kind: ToolKind,
  tier: MetalTier,
  basePrice: number,
  blurbs: Record<MetalTier, string>,
): Tool {
  const t = TIERS.find((x) => x.id === tier)!;
  const label = kind === "hatchet" ? "hatchet" : "hoe";
  return {
    id: `\( {tier}_ \){kind}`,
    name: `${t.name} ${label}`,
    kind,
    tier,
    price: Math.round(basePrice * t.priceMul),
    power: t.power,
    color: t.color,
    blurb: blurbs[tier],
  };
}

const HATCHET_BLURB: Record<MetalTier, string> = {
  wood: "A stick with an opinion. Kindling only.",
  bronze: "Brown blade. The woodlot notices.",
  iron: "Grey, honest, chips bark instead of your shin.",
  steel: "Pale edge. Trees fall before the kettle boils.",
  adamant: "Green bite. The stump files a complaint.",
};

const HOE_BLURB: Record<MetalTier, string> = {
  wood: "Scratches dirt. The thyme is unimpressed.",
  bronze: "Turns a bed without begging.",
  iron: "Rows stay rows. Hens stay out. Mostly.",
  steel: "The big garden actually looks planned.",
  adamant: "Soil parts like it was asked nicely.",
};

export const TOOLS: Tool[] = [
  ...TIERS.map((t) => tool("hatchet", t.id, 10, HATCHET_BLURB)),
  ...TIERS.map((t) => tool("hoe", t.id, 9, HOE_BLURB)),
];

export function toolById(id: string): Tool | undefined {
  return TOOLS.find((t) => t.id === id);
}

export function toolsOf(kind: ToolKind): Tool[] {
  return TOOLS.filter((t) => t.kind === kind);
}

export const STARTING_TOOLS = ["wood_hatchet", "wood_hoe"] as const;
