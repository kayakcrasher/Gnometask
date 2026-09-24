import { uid } from "@/lib/utils";
import { CATALOG_BY_ID, slotsForPrefix } from "../catalog";
import { nextTowerId, TOWERS } from "../data/catalog/towers";
import { sfx } from "../juice";
import { BUILDING_MAX, type BuildingId, type EquipSlot } from "../types";
import { havenLevel, HALL_COST, hallUnlocks } from "../world";
import { applyXp, levelsOf, SKILL_LABEL, totalLevel } from "../xp";
import { hollowWorth } from "../data/market";
import { CROPS } from "../data/crops";
import { GOODS } from "../data/trade";
import { FISH_BY_ID } from "../data/fish";
import { scheduleWrite, markPappyExpand } from "./persist";
import type { GameState, StoreGet, StoreSet } from "./types";

export function economySlice(
  set: StoreSet,
  get: StoreGet,
): Pick<
  GameState,
  | "buy"
  | "startPlacing"
  | "placeAt"
  | "cancelPlace"
  | "equipHat"
  | "equipGear"
  | "repairBuilding"
  | "upgradeGuard"
  | "upgradeHall"
  | "upgradeTower"
  | "wager"
  | "sellBulk"
  | "liftFence"
> {
  return {
    buy: (catalogId) => {
      const item = CATALOG_BY_ID[catalogId];
      const s = get();
      if (!item) return false;
      if (item.reqSkill && item.reqLevel) {
        const have = levelsOf(s.skills)[item.reqSkill];
        if (have < item.reqLevel) {
          sfx("error");
          set({
            speech: `Need ${SKILL_LABEL[item.reqSkill]} ${item.reqLevel}. You're ${have}. Keep training.`,
          });
          return false;
        }
      }
      if (item.reqHall && s.townHallLevel < item.reqHall) {
        sfx("error");
        set({
          speech: `Need Town Hall ${item.reqHall}. The hall is rank ${s.townHallLevel}. Upgrade it on the square.`,
        });
        return false;
      }
      if (item.reqWealth && hollowWorth(s.coins, s.daysPlayed) < item.reqWealth) {
        sfx("error");
        set({
          speech: `The hollow is not rich enough for ${item.name}. Keen Edge wants the purse fatter.`,
        });
        return false;
      }
      if (item.kind === "hat" && s.ownedHats.includes(item.id)) {
        get().equipHat(item.id);
        return true;
      }
      if (item.kind === "house" && s.houseUpgrades.includes(item.id)) return false;
      if (item.fortLevel && s.fortLevel >= item.fortLevel) return false;
      const alreadyGear =
        item.slot && item.kind !== "food" && s.ownedGear.includes(item.id) && item.id !== "food-stew";
      if (alreadyGear && item.kind !== "food") {
        get().equipGear(item.id);
        return true;
      }
      if (item.id === "hat-dragon" && s.lifeDragon.state === "lurking") {
        set({ speech: "The dragon on the ridge has to agree to that hat first." });
        return false;
      }
      if (item.kind === "haven") {
        const lvl = havenLevel(
          s.placed.filter((p) => p.slotId.startsWith("v")).length,
          s.daysPlayed,
          s.wildWins,
          totalLevel(s.skills),
        );
        if (lvl < 3) {
          set({ speech: "Haven isn't selling yet. The stall is still a rumour." });
          return false;
        }
      }
      if (s.coins < item.price) {
        sfx("error");
        set({ speech: "The shopkeeper taps the price tag. Not enough coins yet." });
        return false;
      }

      if (item.kind === "hat" || (item.kind === "haven" && !item.slot && item.id.startsWith("hat-"))) {
        set({
          coins: s.coins - item.price,
          ownedHats: s.ownedHats.includes(item.id) ? s.ownedHats : [...s.ownedHats, item.id],
          hat: item.id,
          coinPopKey: s.coinPopKey + 1,
          bounceKey: s.bounceKey + 1,
          speech: `A new hat. ${item.name}. I feel taller already.`,
        });
        sfx("buy");
        scheduleWrite(get);
        return true;
      }

      if (item.kind === "house") {
        set({
          coins: s.coins - item.price,
          houseUpgrades: [...s.houseUpgrades, item.id],
          selectedPlace: "cottage",
          coinPopKey: s.coinPopKey + 1,
          speech: `${item.name} for the cottage. It looks like someone lives here.`,
        });
        sfx("buy");
        scheduleWrite(get);
        markPappyExpand(get, set);
        return true;
      }

      if (item.id === "food-honey" || item.kind === "food" || item.id === "food-stew") {
        const honey = item.id === "food-honey" ? s.honey + 1 : s.honey;
        const bread = item.id === "food-honey" ? s.bread : s.bread + 1;
        set({
          coins: s.coins - item.price,
          honey,
          bread,
          coinPopKey: s.coinPopKey + 1,
          speech: `${item.name} in the satchel.`,
        });
        sfx("buy");
        scheduleWrite(get);
        return true;
      }

      if (item.fortLevel) {
        if (item.fortLevel !== s.fortLevel + 1 && !(s.fortLevel === 0 && item.fortLevel === 1)) {
          if (item.fortLevel > s.fortLevel + 1) {
            set({ speech: "Build the last wall first. Forts do not skip." });
            return false;
          }
        }
        set({
          coins: s.coins - item.price,
          fortLevel: Math.max(s.fortLevel, item.fortLevel),
          coinPopKey: s.coinPopKey + 1,
          bounceKey: s.bounceKey + 1,
          speech:
            item.fortLevel >= 5
              ? "The dragon gate is up. Fire will have to knock."
              : `${item.name} raised. The island sits a little taller.`,
        });
        sfx("buy");
        scheduleWrite(get);
        markPappyExpand(get, set);
        return true;
      }

      if (item.slot) {
        const eq = { ...s.equipment, [item.slot]: item.id };
        set({
          coins: s.coins - item.price,
          ownedGear: s.ownedGear.includes(item.id) ? s.ownedGear : [...s.ownedGear, item.id],
          equipment: eq,
          coinPopKey: s.coinPopKey + 1,
          bounceKey: s.bounceKey + 1,
          speech: `${item.name} equipped. The wildlands just got politer.`,
        });
        sfx("buy");
        const barter = applyXp(get().skills, "barter", Math.max(4, Math.floor(item.price / 4)));
        set({ skills: barter.skills, speech: barter.ding ?? get().speech });
        scheduleWrite(get);
        return true;
      }

      set({
        coins: s.coins - item.price,
        inventory: [...s.inventory, item.id],
        placingId: item.id,
        panel: "place",
        interior: null,
        selectedPlace: item.kind === "village" ? "village" : item.kind === "tower" ? "dock" : "garden",
        coinPopKey: s.coinPopKey + 1,
        speech: `${item.name} is in your satchel. Tap a glowing plot to place it.`,
      });
      sfx("buy");
      const barter = applyXp(get().skills, "barter", Math.max(4, Math.floor(item.price / 4)));
      set({ skills: barter.skills });
      scheduleWrite(get);
      return true;
    },

    startPlacing: (catalogId) => {
      const item = CATALOG_BY_ID[catalogId];
      if (!item?.slotPrefix) return;
      set({
        placingId: catalogId,
        selectedPlace: item.kind === "village" ? "village" : item.kind === "tower" ? "dock" : "garden",
        panel: "place",
        interior: null,
        speech: `Find a plot for the ${item.name.toLowerCase()}.`,
      });
    },

    placeAt: (slotId) => {
      const s = get();
      const catalogId = s.placingId ?? s.inventory[0];
      if (!catalogId) return false;
      const item = CATALOG_BY_ID[catalogId];
      if (!item?.slotPrefix) return false;
      if (!slotId.startsWith(item.slotPrefix)) return false;
      if (s.placed.some((p) => p.slotId === slotId)) return false;
      const slots = slotsForPrefix(item.slotPrefix);
      if (!slots.some((slot) => slot.id === slotId)) return false;

      const nextInv = [...s.inventory];
      const idx = nextInv.indexOf(catalogId);
      if (idx >= 0) nextInv.splice(idx, 1);

      const villageCount =
        item.kind === "village"
          ? s.placed.filter((p) => p.slotId.startsWith("v")).length + 1
          : s.placed.filter((p) => p.slotId.startsWith("v")).length;

      const craft = applyXp(s.skills, "crafting", 22);
      let speech = craft.ding ?? `Placed the ${item.name.toLowerCase()}.`;
      if (!craft.ding && item.kind === "village") {
        speech =
          villageCount === 1
            ? "The first building beside the shops. That's a village now."
            : `The village grows. ${villageCount} places around the square.`;
      }

      const still = nextInv[0] ?? null;
      set({
        placed: [...s.placed, { id: uid("put"), catalogId, slotId }],
        inventory: nextInv,
        placingId: still,
        bounceKey: s.bounceKey + 1,
        speech,
        skills: craft.skills,
      });
      sfx("place");
      scheduleWrite(get);
      markPappyExpand(get, set);
      return true;
    },

    cancelPlace: () => set({ placingId: null }),

    liftFence: (slotId) => {
      const s = get();
      const item = s.placed.find((p) => p.slotId === slotId);
      if (!item || !slotId.startsWith("f")) return;
      set({
        placed: s.placed.filter((p) => p.slotId !== slotId),
        inventory: [...s.inventory, item.catalogId],
        placingId: item.catalogId,
        speech: "Fence up. Walk it to another post along the road.",
      });
      sfx("open");
      scheduleWrite(get);
    },

    equipHat: (id) => {
      if (!get().ownedHats.includes(id)) return;
      const item = CATALOG_BY_ID[id];
      set((s) => ({
        hat: id,
        bounceKey: s.bounceKey + 1,
        speech: item ? `Wearing the ${item.name.toLowerCase()}. Looking sharp.` : s.speech,
      }));
      scheduleWrite(get);
    },

    equipGear: (id) => {
      const item = CATALOG_BY_ID[id];
      const s = get();
      if (!item?.slot || !s.ownedGear.includes(id)) return;
      const slot = item.slot as EquipSlot;
      set({
        equipment: { ...s.equipment, [slot]: id },
        bounceKey: s.bounceKey + 1,
        speech: `Equipped the ${item.name.toLowerCase()}.`,
      });
      scheduleWrite(get);
    },

    repairBuilding: (id: BuildingId) => {
      const s = get();
      const max = BUILDING_MAX[id];
      const cur = s.buildingHp[id];
      if (cur >= max) {
        set({ speech: "Nothing to mend. The beams are proud." });
        return;
      }
      const cost = Math.max(4, Math.ceil((max - cur) / 2));
      if (s.coins < cost) {
        sfx("error");
        set({ speech: `Repair wants ${cost} coins. The shopkeeper shrugs.` });
        return;
      }
      set({
        coins: s.coins - cost,
        buildingHp: { ...s.buildingHp, [id]: max },
        coinPopKey: s.coinPopKey + 1,
        speech: `Repaired the ${id}. It smells like new timber and old tea.`,
      });
      sfx("place");
      scheduleWrite(get);
    },

    upgradeGuard: () => {
      const s = get();
      const lvl = havenLevel(
        s.placed.filter((p) => p.slotId.startsWith("v")).length,
        s.daysPlayed,
        s.wildWins,
        totalLevel(s.skills),
      );
      if (lvl < 1) {
        set({ speech: "Haven hasn't arrived. The Guardsgnome is still a rumour." });
        return;
      }
      if (s.guardLevel >= 5) {
        set({ speech: "The Guardsgnome cannot get more guard. Physics." });
        return;
      }
      const cost = 24 + s.guardLevel * 18;
      if (s.coins < cost) {
        sfx("error");
        set({ speech: `Training costs ${cost}. The spear stays unimpressed.` });
        return;
      }
      set({
        coins: s.coins - cost,
        guardLevel: s.guardLevel + 1,
        coinPopKey: s.coinPopKey + 1,
        bounceKey: s.bounceKey + 1,
        speech: `Guardsgnome rank ${s.guardLevel + 1}. The dock just got ruder to visitors.`,
      });
      sfx("buy");
      scheduleWrite(get);
    },

    upgradeHall: () => {
      const s = get();
      if (s.townHallLevel >= 5) {
        set({ speech: "The hall cannot get more hall. Physics." });
        return;
      }
      const next = s.townHallLevel + 1;
      const cost = HALL_COST[next] ?? 0;
      if (s.coins < cost) {
        sfx("error");
        set({ speech: `Town Hall ${next} wants ${cost} coins. The clerk taps the ledger.` });
        return;
      }
      set({
        coins: s.coins - cost,
        townHallLevel: next,
        coinPopKey: s.coinPopKey + 1,
        bounceKey: s.bounceKey + 1,
        speech: `Town Hall ${next}. ${hallUnlocks(next)}`,
      });
      sfx("buy");
      scheduleWrite(get);
    },

    upgradeTower: (slotId) => {
      const s = get();
      const placed = s.placed.find((p) => p.slotId === slotId);
      if (!placed || !placed.catalogId.startsWith("tower-")) {
        set({ speech: "That's not a perch. Greg would know." });
        return;
      }
      const nextId = nextTowerId(placed.catalogId);
      if (!nextId) {
        set({ speech: "The longbow keep is as keep as it gets." });
        return;
      }
      const next = CATALOG_BY_ID[nextId] ?? TOWERS.find((t) => t.id === nextId);
      if (!next) return;
      if (s.coins < next.price) {
        sfx("error");
        set({ speech: `${next.name} wants ${next.price} coins. Greg taps the post.` });
        return;
      }
      const craft = applyXp(s.skills, "defence", 18);
      set({
        coins: s.coins - next.price,
        placed: s.placed.map((p) => (p.slotId === slotId ? { ...p, catalogId: nextId } : p)),
        coinPopKey: s.coinPopKey + 1,
        bounceKey: s.bounceKey + 1,
        skills: craft.skills,
        popup: {
          kind: "tower",
          hotspotId: slotId,
          title: next.name,
          blurb: next.blurb,
          place: "dock",
        },
        speech: craft.ding ?? `${next.name} raised. Greg nods like a weathercock.`,
      });
      sfx("buy");
      scheduleWrite(get);
      markPappyExpand(get, set);
    },

    wager: (stake = 5) => {
      const s = get();
      const bet = stake >= 20 ? 20 : 5;
      if (s.coins < bet) {
        set({ speech: `The pit wants ${bet} coins. Your purse is short.` });
        return;
      }
      const roll = Math.random();
      const mult = bet / 5;
      let pay = 0;
      let speech = `The wheel takes the ${bet}. The lights stay on.`;
      if (roll < 0.04) {
        pay = 50 * mult;
        speech = `Jackpot on the strip. ${pay} coins.`;
      } else if (roll < 0.16) {
        pay = 15 * mult;
        speech = `The dune pays ${pay}.`;
      } else if (roll < 0.4) {
        pay = 8 * mult;
        speech = `A small light. ${pay} comes back.`;
      }
      set({
        coins: s.coins - bet + pay,
        coinPopKey: s.coinPopKey + 1,
        speech,
      });
      sfx(pay > bet ? "buy" : "error");
      scheduleWrite(get);
    },

    sellBulk: () => {
      const s = get();
      let pay = s.logs * 2;
      const bits: string[] = [];
      if (s.logs > 0) bits.push(`${s.logs} logs`);
      const fishBag: Record<string, number> = {};
      for (const [id, n] of Object.entries(s.fishBag)) {
        const fish = FISH_BY_ID[id];
        if (!fish || n < 1) continue;
        pay += fish.price * n;
        bits.push(`${n} ${fish.name.toLowerCase()}`);
      }
      const produce: Record<string, number> = {};
      for (const crop of CROPS) {
        const n = s.produce[crop.id] ?? 0;
        if (n < 1) continue;
        pay += crop.price * n;
        bits.push(`${n} ${crop.name.toLowerCase()}`);
      }
      const goods: Record<string, number> = {};
      for (const good of GOODS) {
        const n = s.goods[good.id] ?? 0;
        if (n < 1) continue;
        pay += good.price * n;
        bits.push(`${n} ${good.name.toLowerCase()}`);
      }
      if (pay < 1) {
        set({ speech: "The exchange floor is empty. Nothing in bulk to sell." });
        return;
      }
      set({
        logs: 0,
        fishBag,
        produce,
        goods,
        coins: s.coins + pay,
        coinPopKey: s.coinPopKey + 1,
        speech: `The exchange takes the bulk. ${bits.join(", ")}. +${pay} coins.`,
      });
      sfx("buy");
      scheduleWrite(get);
    },
  };
}
