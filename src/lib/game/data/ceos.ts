/**
 * Rich CEOs. They move their businesses to Port Victoria once the island
 * has a court verdict — the law is settled, and money follows.
 *
 * Each lives in one of the two rich houses east of the Supreme Court.
 * Buy the house, and they pay you rent.
 */

export type Ceo = {
  id: string;
  name: string;
  business: string;
  title: string;
  hat: string;
  coat: string;
  blurb: string;
  arrival: string;
  lines: string[];
  house: 1 | 2;
  from: string;
};

export const CEOS: Ceo[] = [
  {
    id: "voss",
    name: "Aldous Voss",
    business: "Voss & Sons, Shipping",
    title: "Merchant",
    hat: "hat-night",
    coat: "#1c2430",
    blurb:
      "Owns eleven hulls. Nine are at sea. Two are in your harbour, and he wants a third.",
    arrival:
      "I sail where the law is settled. Your bench ruled. I am here. Voss & Sons, shipping — three hundred tonnes, no apologies.",
    lines: [
      "Eleven hulls. This island will see all of them, one pier at a time.",
      "Wim runs a fine yard. Small. Predictable. I do not compete with small.",
      "A nation needs a fleet. I can sell you one, or build you one. Your choice.",
      "The Reed nearly took my eastern route. The Crown's ruling settled that.",
    ],
    house: 1,
    from: "Reed's Landing",
  },
  {
    id: "thorne",
    name: "Ophelia Thorne",
    business: "Thorne & Co., Bankers",
    title: "Banker",
    hat: "hat-flower",
    coat: "#6a3d58",
    blurb:
      "Keeps the ledger on every loan on three islands. She has read your charter. She likes it.",
    arrival:
      "I have read the Sunstep ruling twice. Twice. The law here is honest. Thorne & Co. is moving in.",
    lines: [
      "A nation without a bank is a farm with a bad fence.",
      "I lend at eight percent. Port Victoria lends at twelve. Ask why.",
      "The Stoic buys shares. I underwrite the shares. He is the show, I am the ledger.",
      "If your harbour needs a second pier, I can fund it. For a stake.",
    ],
    house: 2,
    from: "Salt Holm",
  },
];

export const CEO_BY_ID: Record<string, Ceo> = Object.fromEntries(
  CEOS.map((c) => [c.id, c]),
);

/** The CEOs arrive once the bench has ruled. Either verdict. */
export function ceosArrived(
  verdict: "crown" | "sunstep" | null | undefined,
): boolean {
  return verdict === "crown" || verdict === "sunstep";
}

/** The CEO who lives in a given rich house, if they have arrived. */
export function ceoForHouse(
  house: 1 | 2,
  verdict: "crown" | "sunstep" | null | undefined,
): Ceo | undefined {
  if (!ceosArrived(verdict)) return undefined;
  return CEOS.find((c) => c.house === house);
}
