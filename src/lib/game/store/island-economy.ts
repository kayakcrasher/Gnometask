import { economicClimate } from "../island-economy";
import { scheduleWrite } from "./persist";
import type { GameState, StoreGet, StoreSet } from "./types";
export function islandEconomySlice(
  set: StoreSet,
  get: StoreGet,
): Pick<GameState, "contributeRelief" | "charterNorthGateway"> {
  const blocked = () => {
    const s = get();
    return !!(s.atHome || s.combat || s.abroad);
  };
  return {
    contributeRelief: () => {
      const s = get();
      if (blocked() || s.coins < 30) return;
      set({
        coins: s.coins - 30,
        economy: { ...s.economy, relief: s.economy.relief + 30 },
        speech:
          "Thirty coins added to the waystation relief fund. Food and temporary support help families find their footing.",
      });
      scheduleWrite(get);
    },
    charterNorthGateway: () => {
      const s = get();
      if (
        blocked() ||
        s.economy.gateway ||
        s.coins < 1200 ||
        s.townHallLevel < 4 ||
        !s.roadWorks.completed.includes("noble-reach") ||
        !s.city.buildings.some((b) => b.kind === "home") ||
        !s.city.buildings.some((b) => b.kind === "depot" && b.y < -300) ||
        economicClimate(s).jobs < 2
      )
        return;
      set({
        coins: s.coins - 1200,
        economy: { ...s.economy, gateway: true },
        speech: `${s.city.name} is chartered as the Gateway to the Rugged North. Your northern depot welcomes settlers and their supplies.`,
      });
      scheduleWrite(get);
    },
  };
}
