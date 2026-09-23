import { ANIMALS, CALF_PRICE, COOP_COST, FAR_ISLES, expeditionReturn, goodById } from "../data/trade";
import { sfx } from "../juice";
import { scheduleWrite } from "./persist";
import type { GameState, StoreGet, StoreSet } from "./types";

function addGood(goods: Record<string, number>, id: string, n: number) {
  return { ...goods, [id]: (goods[id] ?? 0) + n };
}

export function yardSlice(
  set: StoreSet,
  get: StoreGet,
): Pick<
  GameState,
  "sellGood" | "buyAnimal" | "upgradeCoop" | "tendHerd" | "sellCalf" | "fundExpedition" | "collectExpedition" | "travelIsle"
> {
  return {
    sellGood: (id) => {
      const s = get();
      const def = goodById(id);
      const have = s.goods[id] ?? 0;
      if (!def || have < 1) {
        set({ speech: "Nothing in the sack by that name." });
        return;
      }
      const bonus = s.abroad === "salt" ? Math.ceil(def.price * 0.2) : 0;
      const pay = def.price + bonus;
      const next = { ...s.goods, [id]: have - 1 };
      set({
        goods: next,
        coins: s.coins + pay,
        coinPopKey: s.coinPopKey + 1,
        speech: bonus
          ? `Saltmarket pays ${pay} for the ${def.name.toLowerCase()}. A fifth above the hollow.`
          : `The counter takes the ${def.name.toLowerCase()}. +${pay} coins.`,
      });
      sfx("buy");
      scheduleWrite(get);
    },

    buyAnimal: (kind) => {
      const s = get();
      const def = ANIMALS.find((a) => a.id === kind);
      if (!def) return;
      const have = s.herd[kind];
      if (have >= def.cap) {
        set({ speech: `The yard holds ${def.cap} ${def.name.toLowerCase()}s. That's the fence.` });
        return;
      }
      if (s.coins < def.price) {
        sfx("error");
        set({ speech: `A ${def.name.toLowerCase()} is ${def.price} coins.` });
        return;
      }
      set({
        coins: s.coins - def.price,
        herd: { ...s.herd, [kind]: have + 1 },
        coinPopKey: s.coinPopKey + 1,
        speech: `${def.name} in the yard. Feed them, and sell what they give at this counter.`,
      });
      sfx("buy");
      scheduleWrite(get);
    },

    upgradeCoop: () => {
      const s = get();
      const next = s.herd.coop + 1;
      const cost = COOP_COST[next];
      if (!cost) {
        set({ speech: "The coop is as fine as it gets. Three roosts, a red roof." });
        return;
      }
      if (s.coins < cost) {
        sfx("error");
        set({ speech: `Coop rank ${next} is ${cost} coins.` });
        return;
      }
      set({
        coins: s.coins - cost,
        herd: { ...s.herd, coop: next },
        coinPopKey: s.coinPopKey + 1,
        speech: next === 1 ? "A coop. Eggs in the morning, if you collect them." : `The coop grows. Rank ${next}. More eggs.`,
      });
      sfx("buy");
      scheduleWrite(get);
    },

    tendHerd: (job) => {
      const s = get();
      const day = s.daysPlayed;
      if (job === "milk") {
        const n = s.herd.cows + s.herd.goats;
        if (!n) {
          set({ speech: "No cows or goats to milk." });
          return;
        }
        if (s.herd.milkDay === day) {
          set({ speech: "Already milked today. The pail can rest." });
          return;
        }
        const calves = s.daysPlayed % 3 === 0 && s.herd.calves < s.herd.cows ? s.herd.calves + 1 : s.herd.calves;
        set({
          herd: { ...s.herd, milkDay: day, calves },
          goods: addGood(s.goods, "milk", n),
          speech: calves > s.herd.calves
            ? `${n} pails of milk, and a new calf. Sell the milk here. The calf leaves on the supply ship once the counter writes it down.`
            : `${n} pail${n === 1 ? "" : "s"} of milk. Sell them at the counter. Nobody pays you in the yard.`,
        });
      } else if (job === "eggs") {
        if (!s.herd.coop) {
          set({ speech: "Buy a coop first. The hens need a roof." });
          return;
        }
        if (s.herd.eggDay === day) {
          set({ speech: "The hens are done for today." });
          return;
        }
        const n = s.herd.coop * 2;
        set({
          herd: { ...s.herd, eggDay: day },
          goods: addGood(s.goods, "egg", n),
          speech: `${n} eggs in the basket. The shop buys eggs. The hens do not.`,
        });
      } else {
        if (!s.herd.sheep) {
          set({ speech: "No sheep to shear." });
          return;
        }
        if (s.herd.woolDay === day) {
          set({ speech: "They are already short. Try another day." });
          return;
        }
        set({
          herd: { ...s.herd, woolDay: day },
          goods: addGood(s.goods, "wool", s.herd.sheep),
          speech: `${s.herd.sheep} fleece. Wool sells at the counter.`,
        });
      }
      sfx("place");
      scheduleWrite(get);
    },

    sellCalf: () => {
      const s = get();
      const loose = s.herd.calves - s.herd.shipped;
      if (loose < 1) {
        set({ speech: s.herd.shipped ? "That calf is already on the ship's list." : "No calf in the yard." });
        return;
      }
      set({
        herd: { ...s.herd, shipped: s.herd.shipped + 1 },
        coins: s.coins + CALF_PRICE,
        coinPopKey: s.coinPopKey + 1,
        speech: `The counter writes the calf onto the supply ship. +${CALF_PRICE} coins. She leaves on the next tide.`,
      });
      sfx("buy");
      scheduleWrite(get);
    },

    fundExpedition: (stake) => {
      const s = get();
      const amount = Math.floor(stake);
      if (s.expedition) {
        set({ speech: "One expedition at a time. Collect it before you fund another." });
        return;
      }
      if (amount < 10) {
        set({ speech: "The clerk wants at least 10 coins on the table." });
        return;
      }
      if (s.coins < amount) {
        sfx("error");
        set({ speech: "The purse is shorter than the stake." });
        return;
      }
      set({
        coins: s.coins - amount,
        expedition: { stake: amount, due: s.daysPlayed + 2 },
        coinPopKey: s.coinPopKey + 1,
        speech: `${amount} coins sail with the next expedition. Come back in two days. Most tides pay 25%. A few do not come back.`,
      });
      sfx("buy");
      scheduleWrite(get);
    },

    collectExpedition: () => {
      const s = get();
      const ex = s.expedition;
      if (!ex) {
        set({ speech: "No expedition on the books." });
        return;
      }
      if (s.daysPlayed < ex.due) {
        set({ speech: `Still out. They return on day ${ex.due}. Today is day ${s.daysPlayed}.` });
        return;
      }
      const result = expeditionReturn(ex.stake);
      set({
        expedition: null,
        coins: s.coins + result.payout,
        coinPopKey: s.coinPopKey + 1,
        speech: result.payout
          ? `${result.note} The clerk counts out ${result.payout} coins.`
          : result.note,
      });
      sfx(result.payout ? "buy" : "error");
      scheduleWrite(get);
    },

    travelIsle: (id) => {
      const s = get();
      const isle = FAR_ISLES.find((i) => i.id === id);
      if (!isle || s.combat) return;
      if (s.coins < isle.fare) {
        sfx("error");
        set({ speech: `${isle.name} is ${isle.fare} coins by the fast chart.` });
        return;
      }
      set({
        coins: s.coins - isle.fare,
        abroad: id,
        popup: null,
        interior: null,
        coinPopKey: s.coinPopKey + 1,
        speech: `${isle.name}. The chart folded the sea. Fare was ${isle.fare} coins.`,
      });
      sfx("open");
      scheduleWrite(get);
    },
  };
}
