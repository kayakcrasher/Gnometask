/**
 * Contextual NPC barks. Each NPC reacts to what is actually happening
 * on the island. talkTo checks these before falling back to bond lines
 * or the NPC's base pool.
 *
 * Four contexts, kept deliberately small:
 *   raid  - goblins on the shore or a raid party active
 *   hurt  - player HP below 40%
 *   rich  - player over 200 coins
 *   broke - player under 15 coins
 */

export type BarkContext = {
  raid: boolean;
  hurt: boolean;
  rich: boolean;
  broke: boolean;
};

export type Bark = { line: string; when: (c: BarkContext) => boolean };

export const BARKS: Record<string, Bark[]> = {
  pappy: [
    { line: "There are green ones on the sand. That is not a rumour, that is a Tuesday.", when: (c) => c.raid },
    { line: "You are bleeding on my dock. Sit down. Tea first, wall after.", when: (c) => c.hurt },
    { line: "A fat purse is a good sign, and a target. Buy timber before someone else notices.", when: (c) => c.rich },
    { line: "Empty pockets again. Good. That is how your great-grandpa started.", when: (c) => c.broke },
  ],
  stoic: [
    { line: "Raiders. Buy a share of the wall or stop asking me about yields.", when: (c) => c.raid },
    { line: "You look like a bad trade. Go sit down.", when: (c) => c.hurt },
    { line: "That purse is starting to make you interesting. Not always a compliment.", when: (c) => c.rich },
    { line: "Coin-poor is fine. Coin-poor and idle is not.", when: (c) => c.broke },
  ],
  nettie: [
    { line: "Goblins on the beach. Don't expect the milliner to fight them for you.", when: (c) => c.raid },
    { line: "You've a hole in you. Sit. I'll fetch the tea, Pappy will fetch the sermon.", when: (c) => c.hurt },
    { line: "I see that purse. I'll show you the expensive hats, then.", when: (c) => c.rich },
    { line: "No coin, no brim. Come back when the logs are sold.", when: (c) => c.broke },
  ],
  bramble: [
    { line: "The woods heard them land. Trees are worried. So am I.", when: (c) => c.raid },
    { line: "You're hurt. Yarrow on the south bank. Chew it. Don't thank me yet.", when: (c) => c.hurt },
    { line: "Wealth is a fine thing. Plant a tree and it becomes a proper one.", when: (c) => c.rich },
    { line: "Pockets empty, hands free. Good morning to work.", when: (c) => c.broke },
  ],
  greg: [
    { line: "Eyes on the shore. Five runts, low as weeds. That is the report.", when: (c) => c.raid },
    { line: "You are not standing straight. Get off the sand and take a cup of tea.", when: (c) => c.hurt },
    { line: "A purse like that is a target on your back. Buy a tower.", when: (c) => c.rich },
    { line: "Broke is fine. Broke and asleep is not. Chop something.", when: (c) => c.broke },
  ],
  brine: [
    { line: "Goblins at the south pier. Coil the rope, then run.", when: (c) => c.raid },
    { line: "Sit on that crate. Sit. You're dripping on my ledger.", when: (c) => c.hurt },
    { line: "Coin-heavy. The harbour likes that. The pirates like it more.", when: (c) => c.rich },
    { line: "No coin and no rope? Then we're both counting the same tide.", when: (c) => c.broke },
  ],
  wim: [
    { line: "Their boat is on the water. My hulls are not built for that conversation.", when: (c) => c.raid },
    { line: "You look like a bent nail. Go home. The dock will keep.", when: (c) => c.hurt },
    { line: "Purse that fat, you can buy a sloop. I'll even rig it.", when: (c) => c.rich },
    { line: "You'll need coin for a boat. Chop first. Buy later.", when: (c) => c.broke },
  ],
  pipkin: [
    { line: "Cluckers hides when she smells them. She's smart. So should you.", when: (c) => c.raid },
    { line: "Wash that cut in the trough. The chickens drink from it. Sorry.", when: (c) => c.hurt },
    { line: "Money like that, you can buy a cow. Cows are the real wealth.", when: (c) => c.rich },
    { line: "Broke is fine. The garden doesn't ask for a deposit.", when: (c) => c.broke },
  ],
  miller: [
    { line: "The ovens are ready if the shore falls. Bread does not stop for goblins.", when: (c) => c.raid },
    { line: "Sit at the bench. I'll bring a heel of bread. Don't argue.", when: (c) => c.hurt },
    { line: "That purse would buy a whole sack of flour. Buy one. Feed a watch.", when: (c) => c.rich },
    { line: "No coin? Take the day-old loaf. The oven overbaked.", when: (c) => c.broke },
  ],
};

export function barkFor(npcId: string, ctx: BarkContext): string | null {
  const barks = BARKS[npcId];
  if (!barks) return null;
  for (const b of barks) {
    if (b.when(ctx)) return b.line;
  }
  return null;
}
