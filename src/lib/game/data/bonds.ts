/**
 * Bond-tier dialogue. Each NPC's line is filtered by how often you've
 * talked to them. Below the lowest threshold, the NPC uses their
 * existing random lines (see NPCS in data/npcs.ts). Above it, they
 * start to know you.
 */

export type BondLine = { minBond: number; line: string };

export const BOND_LINES: Record<string, BondLine[]> = {
  pappy: [
    { minBond: 4, line: "You came back. Good. Most gnomes run the first time the wind turns." },
    { minBond: 12, line: "Your great-grandpa walked off Corinth with three families behind him. You've his patience, at least." },
    { minBond: 25, line: "I'll say it plain: this hollow lives because you keep showing up. That's the whole nation, right there." },
  ],
  stoic: [
    { minBond: 4, line: "You again. The purse holds. So does the line." },
    { minBond: 12, line: "I mark you down as a buyer, not a tourist. There's a difference, and it pays." },
    { minBond: 25, line: "When Corinth fell, my grandfather sold the family silver for passage. I have been buying it back ever since. You understand, now." },
  ],
  nettie: [
    { minBond: 4, line: "Back for the brim, or just the gossip? Either suits me." },
    { minBond: 12, line: "I set aside a ribbon for you. Don't tell the others. There aren't others." },
    { minBond: 25, line: "You're the only gnome on this island who says thank you to a hat. I remember that kind of thing." },
  ],
  bramble: [
    { minBond: 4, line: "The woods know your step now. That's not nothing." },
    { minBond: 12, line: "I leave the flat mushrooms for you. The ones on the south bank. You'll see why." },
    { minBond: 25, line: "Your great-grandpa foraged with my grandmother once. She said he hummed. You hum too, when you think no one's listening." },
  ],
  greg: [
    { minBond: 4, line: "Still walking the shore. Good. The watch notices that." },
    { minBond: 12, line: "I'll put you on the roster. Not for shifts — just so the gnomes know your name is on the wall." },
    { minBond: 25, line: "If something comes off that water at night, I want you beside me. Don't tell Pappy I said that." },
  ],
  brine: [
    { minBond: 4, line: "Coil that rope when you pass. Half the dock thinks it ties itself." },
    { minBond: 12, line: "You count boats the same way I do. Leaving, then coming home. That's a clerk's eye." },
    { minBond: 25, line: "There's a ledger under the south pier. Names of every hull that came home the first year. Yours is on the last page." },
  ],
  wim: [
    { minBond: 4, line: "Boats on the water, gnomes on the dock. Sentence keeps coming true." },
    { minBond: 12, line: "If Sunstep ever wins its dock, I want you there when the gown reads the ruling. Some things you should hear in person." },
    { minBond: 25, line: "I named the third hull after your great-grandpa. It's on the ledger. Don't make it a thing." },
  ],
  pipkin: [
    { minBond: 4, line: "You walk between rows like you mean it. Most just run through." },
    { minBond: 12, line: "There's a plot behind the shed I keep for friends. It's yours if you want it." },
    { minBond: 25, line: "Cluckers likes you more than she likes me. I've made peace with that." },
  ],
  miller: [
    { minBond: 4, line: "There's a day-old loaf on the sill. Take it. The oven overbaked." },
    { minBond: 12, line: "Corinth's last morning smelled like bread. Every morning I bake, I check. This one smells right." },
    { minBond: 25, line: "I'll tell you what I never tell the queue: I bake for the ones who might not come back. You always come back." },
  ],
};

export function lineForBond(npcId: string, bond: number): string | null {
  const lines = BOND_LINES[npcId];
  if (!lines || !lines.length) return null;
  let pick: string | null = null;
  for (const entry of lines) {
    if (bond >= entry.minBond) pick = entry.line;
  }
  return pick;
}
