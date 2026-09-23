import { CROP_BY_ID, CROPS, pailBonusMs, type CropId } from "../data/crops";
import { sfx } from "../juice";
import { scheduleWrite, withXp } from "./persist";
import type { GameState, StoreGet, StoreSet } from "./types";

function countOf(bag: Record<string, number>, id: string) {
  return bag[id] ?? 0;
}

function takeOne(bag: Record<string, number>, id: string) {
  const next = { ...bag };
  const n = (next[id] ?? 0) - 1;
  if (n <= 0) delete next[id];
  else next[id] = n;
  return next;
}

export function farmSlice(
  set: StoreSet,
  get: StoreGet,
): Pick<GameState, "plantPlot" | "waterPlot" | "harvestPlot" | "clearPlot" | "buySeed" | "sellProduce"> {
  return {
    plantPlot: (plotId, cropId) => {
      const s = get();
      if (s.combat || s.plots[plotId]) return;
      const crop = CROP_BY_ID[cropId];
      if (!crop) return;
      if (!s.ownedGear.some((id) => id.startsWith("hoe-"))) {
        set({ speech: "You need a hoe to break the bed. The wooden one is already in the satchel.", popup: null });
        return;
      }
      if (countOf(s.seeds, cropId) < 1) {
        set({ speech: `No ${crop.name.toLowerCase()} seed. The builder's yard sells them.`, popup: null });
        return;
      }
      set({
        seeds: takeOne(s.seeds, cropId),
        plots: { ...s.plots, [plotId]: { crop: cropId as CropId, plantedAt: Date.now(), wateredAt: null } },
        popup: null,
        speech: `${crop.name} is in. Water it with the pail before it gives up.`,
      });
      sfx("place");
      scheduleWrite(get);
    },

    waterPlot: (plotId) => {
      const s = get();
      const plot = s.plots[plotId];
      if (!plot) return;
      if (pailBonusMs(s.ownedGear) == null) {
        set({ speech: "You need a water pail. A wooden one is eight coins at the armory.", popup: null });
        return;
      }
      set({
        plots: { ...s.plots, [plotId]: { ...plot, wateredAt: Date.now() } },
        popup: null,
        speech: "The bed drinks. Leave it too long and it will sulk.",
      });
      sfx("open");
      scheduleWrite(get);
    },

    harvestPlot: (plotId) => {
      const s = get();
      const plot = s.plots[plotId];
      if (!plot) return;
      const crop = CROP_BY_ID[plot.crop];
      if (!crop) return;
      const next = { ...s.plots };
      delete next[plotId];
      const gained = withXp(s.skills, { farming: crop.xp });
      set({
        plots: next,
        produce: { ...s.produce, [plot.crop]: countOf(s.produce, plot.crop) + 1 },
        skills: gained.skills,
        popup: null,
        speech: gained.ding ?? `A ${crop.name.toLowerCase()} for the sack. Sell it at the builder's yard. +${crop.xp} Farming.`,
      });
      sfx("buy");
      scheduleWrite(get);
    },

    clearPlot: (plotId) => {
      const s = get();
      if (!s.plots[plotId]) return;
      const next = { ...s.plots };
      delete next[plotId];
      set({ plots: next, popup: null, speech: "The bed is clear. The soil holds no grudges." });
      sfx("place");
      scheduleWrite(get);
    },

    buySeed: (cropId) => {
      const s = get();
      const crop = CROP_BY_ID[cropId];
      if (!crop) return;
      if (s.coins < crop.seed) {
        set({ speech: `${crop.name} seed is ${crop.seed} coins.` });
        sfx("error");
        return;
      }
      set({
        coins: s.coins - crop.seed,
        seeds: { ...s.seeds, [cropId]: countOf(s.seeds, cropId) + 1 },
        speech: `A ${crop.name.toLowerCase()} seed. Plant it in the yard.`,
      });
      sfx("buy");
      scheduleWrite(get);
    },

    sellProduce: (cropId) => {
      const s = get();
      const crop = CROP_BY_ID[cropId];
      if (!crop || countOf(s.produce, cropId) < 1) return;
      set({
        produce: takeOne(s.produce, cropId),
        coins: s.coins + crop.price,
        coinPopKey: s.coinPopKey + 1,
        speech: `Sold a ${crop.name.toLowerCase()} for ${crop.price} coins.`,
      });
      sfx("buy");
      scheduleWrite(get);
    },
  };
}

export const SEED_LIST = CROPS;
