import type { QuestDef } from "../quests";

export const QUEST_POOL: QuestDef[] = [
  {
    id: "lost-chicken",
    title: "Find my chicken",
    giver: "pipkin",
    offer: "Cluckers wandered off again. A round bird with opinions. Bring her home and I'll pay you in coins and beans-worth of thanks.",
    hint: "A chicken is loose on the land. Click her, then talk to Pipkin.",
    done: "Cluckers! You found her. The beans can rest. +22 coins.",
    coins: 22,
    xp: { crafting: 80, hitpoints: 40 },
  },
  {
    id: "pie-run",
    title: "A pie for Brine",
    giver: "miller",
    offer: "The dock gets hungry. Take this pie to Brine before the goblins smell it.",
    hint: "Talk to Miller for the pie, then Talk-to Brine at the dock.",
    done: "Brine eats standing up. The tide approves. +18 coins.",
    coins: 18,
    xp: { crafting: 50, strength: 30 },
  },
  {
    id: "mushroom-hello",
    title: "Say hello to the mushrooms",
    giver: "bramble",
    offer: "The mushrooms like to be greeted. Tap the ring in the woods, then come back.",
    hint: "Click the mushroom ring in the woods, then talk to Bramble.",
    done: "They send their regards. Slowly. +14 coins.",
    coins: 14,
    xp: { crafting: 40, defence: 20 },
  },
];
