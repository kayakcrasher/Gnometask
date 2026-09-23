import { BOAT_LOANS, LAND_OFFERS, rolledChart } from "../data/honour";
import { parcelAt } from "../data/parcels";
import { BOAT_RANK, type BoatId } from "../data/boats";
import { makeCombat } from "../combat";
import { sfx } from "../juice";
import { maxHitpoints } from "../xp";
import { armAutoAttack, scheduleWrite } from "./persist";
import type { GameState, StoreGet, StoreSet } from "./types";

export function honourSlice(
  set: StoreSet,
  get: StoreGet,
): Pick<GameState, "sailChart" | "leaveIsle" | "startIsleFight" | "claimTile" | "buyParcel" | "takeLoan" | "repayLoan"> {
  return {
    sailChart: () => {
      const s = get();
      if (!s.chart) {
        set({ speech: "No map yet. Goblins sometimes drop a scrap that shows their island." });
        return;
      }
      if (s.combat) return;
      set({
        abroad: "mucktooth",
        popup: null,
        interior: null,
        speech: s.surrendered
          ? "Mucktooth is quiet. They remember the day the chief fell."
          : "A squalid island. Mud huts, and a chief who still has his knife.",
      });
    },

    leaveIsle: () => {
      const s = get();
      if (s.combat && s.combat.phase !== "won" && s.combat.phase !== "lost") {
        set({ speech: "Finish the fight, or flee, before the tide takes you home." });
        return;
      }
      set({ abroad: null, popup: null, speech: "Back on the hollow. The dock smells like home." });
    },

    startIsleFight: (which) => {
      const s = get();
      if (s.combat || s.surrendered) return;
      if (which === "chief") {
        set({
          combat: makeCombat("chief", s.hp, {
            packId: "muck-chief",
            name: "Chief Mucktooth",
            playerMax: maxHitpoints(s.skills),
            atX: 0,
            atY: 0,
            skills: s.skills,
          }),
          popup: null,
          speech: "The chief grins with too many teeth.",
        });
      } else {
        if (!s.muckRaiders[which]) return;
        set({
          combat: makeCombat("raider", s.hp, {
            packId: `muck-r${which}`,
            name: "Mucktooth raider",
            playerMax: maxHitpoints(s.skills),
            atX: 0,
            atY: 0,
            skills: s.skills,
          }),
          popup: null,
          speech: "A raider steps out of a mud hut.",
        });
      }
      armAutoAttack(get, 800);
    },

    claimTile: (id) => {
      const s = get();
      const tile = LAND_OFFERS.find((t) => t.id === id);
      if (!tile || s.claimed.includes(id)) return;
      if (s.respect < tile.respect || s.coins < tile.coins) {
        set({ speech: `${tile.name} costs ${tile.respect} respect and ${tile.coins} coins.` });
        sfx("error");
        return;
      }
      set({
        claimed: [...s.claimed, id],
        respect: s.respect - tile.respect,
        coins: s.coins - tile.coins,
        speech:
          tile.kind === "yard"
            ? `The ${tile.name.toLowerCase()} is yours. Plant it.`
            : `You hold the ${tile.name.toLowerCase()}. The town marks it with your colour.`,
      });
      sfx("buy");
      scheduleWrite(get);
    },

    buyParcel: (id) => {
      const s = get();
      const tile = parcelAt(id);
      if (!tile) return;
      if (s.deeds.includes(id)) {
        set({ speech: "You already hold that ground." });
        return;
      }
      if (tile.owner) {
        sfx("error");
        set({
          speech: `${tile.ownerName ?? "That gnome"} holds this. Private property is sacred. The old law does not sell a neighbour's floor.`,
        });
        return;
      }
      if (s.coins < tile.price) {
        sfx("error");
        set({ speech: `That parcel is ${tile.price} coins.` });
        return;
      }
      set({
        deeds: [...s.deeds, id],
        coins: s.coins - tile.price,
        coinPopKey: s.coinPopKey + 1,
        speech: `Unclaimed hollow. ${tile.price} coins. The deed is in your name. A gnome's own ground is never on this list.`,
      });
      sfx("buy");
      scheduleWrite(get);
    },

    takeLoan: (boat) => {
      const s = get();
      const offer = BOAT_LOANS.find((b) => b.boat === boat);
      if (!offer) return;
      if (s.loan && s.loan.owed > 0) {
        set({ speech: `You still owe ${s.loan.owed} on the ${s.loan.boat}. The bank has one loan.` });
        return;
      }
      if (s.hulls.includes(offer.boat)) {
        set({ speech: `The ${offer.name.toLowerCase()} is already yours.` });
        return;
      }
      if (s.respect < offer.respect) {
        set({ speech: `The bank wants ${offer.respect} respect before it fronts a ${offer.name.toLowerCase()}.` });
        sfx("error");
        return;
      }
      set({
        respect: s.respect - offer.respect,
        loan: { boat: offer.boat, owed: offer.owed },
        hulls: [...s.hulls, offer.boat],
        boatRank: Math.max(s.boatRank, BOAT_RANK[offer.boat as BoatId] ?? 1),
        speech: `The bank fronts the ${offer.name.toLowerCase()}. You owe ${offer.owed} coins. She is yours to sail.`,
      });
      sfx("buy");
      scheduleWrite(get);
    },

    repayLoan: () => {
      const s = get();
      if (!s.loan || s.loan.owed <= 0) {
        set({ speech: "You owe the bank nothing." });
        return;
      }
      if (s.coins < s.loan.owed) {
        set({ speech: `You owe ${s.loan.owed}. The purse is short.` });
        sfx("error");
        return;
      }
      set({
        coins: s.coins - s.loan.owed,
        loan: null,
        speech: "The debt is paid. The town calls that honour.",
        respect: s.respect + 1,
      });
      sfx("buy");
      scheduleWrite(get);
    },
  };
}

export { rolledChart };
