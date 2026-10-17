import { civicParcelOwner } from "../land-planning";
import { BOAT_LOANS, LAND_OFFERS, rolledChart } from "../data/honour";
import { parcelAt } from "../data/parcels";
import { STOCKS } from "../data/market";
import { quoteShareTrade } from "../trading";
import { boatById, BOAT_RANK, type BoatId } from "../data/boats";
import { makeCombat } from "../combat";
import { sfx } from "../juice";
import { levelFromXp, maxHitpoints } from "../xp";
import { armAutoAttack, scheduleWrite } from "./persist";
import type { GameState, StoreGet, StoreSet } from "./types";

export function honourSlice(
  set: StoreSet,
  get: StoreGet,
): Pick<GameState, "sailChart" | "leaveIsle" | "startIsleFight" | "claimTile" | "buyParcel" | "sellParcel" | "buyShare" | "sellShare" | "takeLoan" | "repayLoan"> {
  return {
    sailChart: () => {
      const s = get();
      if (!s.chart) {
        set({ speech: "No map yet. Goblins sometimes drop a scrap that shows their island." });
        return;
      }
      get().raidIsle("mucktooth");
    },

    leaveIsle: () => {
      const s = get();
      if (s.combat) { set({ speech: "Finish the encounter before returning to your ship." }); return; }
      const visit = s.raidVisit;
      set({ abroad: null, raidVisit: null, popup: null, interior: null,
        ...(visit ? { afloat: visit.boat, gnomeX: visit.returnX, gnomeY: visit.returnY } : {}),
        speech: "Back aboard. Your cleared path on the island is saved." });
      scheduleWrite(get);
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
      const residentOwner = civicParcelOwner(tile,s.civic);
      if (tile.owner || residentOwner) {
        sfx("error");
        set({
          speech:
            tile.owner === "capitol"
              ? "The capitol holds the road. That ground is not for sale."
              : `${tile.ownerName ?? residentOwner ?? "That gnome"} holds this. Private property is sacred. The old law does not sell a neighbour's floor.`,
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

    sellParcel: (id) => {
      const s = get();
      const tile = parcelAt(id);
      if (!tile || !s.deeds.includes(id)) {
        set({ speech: "That deed is not in your name." });
        return;
      }
      if(s.estate[id]){set({speech:"This deed has your home on it. Built homes are not sold with bare land."});return;}
      const pay = Math.max(1, Math.floor(tile.price * 0.7));
      set({
        deeds: s.deeds.filter((d) => d !== id),
        coins: s.coins + pay,
        coinPopKey: s.coinPopKey + 1,
        speech: `Quill takes the deed back for the hollow. ${pay} coins, and the ground is no longer yours.`,
      });
      sfx("buy");
      scheduleWrite(get);
    },

    buyShare: (id, quantity = 1) => {
      const s = get();
      const stock = STOCKS.find((row) => row.id === id);
      const order = quoteShareTrade(id, s.daysPlayed, s.coins, s.shares, "buy", quantity);
      if (!stock || !order) {
        sfx("error");
        set({ speech: "Order declined. Choose whole shares you can afford." });
        return;
      }
      set({
        coins: order.coins,
        coinPopKey: s.coinPopKey + 1,
        shares: order.shares,
        speech: `Bought ${quantity} ${stock.name} ${quantity === 1 ? "share" : "shares"} for ${order.total} coins.`,
      });
      sfx("buy");
      scheduleWrite(get);
    },

    sellShare: (id, quantity = 1) => {
      const s = get();
      const stock = STOCKS.find((row) => row.id === id);
      const order = quoteShareTrade(id, s.daysPlayed, s.coins, s.shares, "sell", quantity);
      if (!stock || !order) {
        sfx("error");
        set({ speech: "Order declined. Choose whole shares from your holdings." });
        return;
      }
      set({
        coins: order.coins,
        shares: order.shares,
        coinPopKey: s.coinPopKey + 1,
        speech: `Sold ${quantity} ${stock.name} ${quantity === 1 ? "share" : "shares"} for ${order.total} coins.`,
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
      const boatDef = boatById(offer.boat)!;
      if (levelFromXp(s.skills.sailing) < boatDef.need) {
        set({ speech: `Train Sailing ${boatDef.need} before borrowing the ${boatDef.name.toLowerCase()}.` });
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
