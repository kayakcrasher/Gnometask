import { FRONTIER_HOMES } from "./data/expansion";
import { parcelAt } from "./data/parcels";
import { buildingSiteClear, insideParcel } from "./land-planning";
import type { GameSave } from "./types";
import type { CivicPlot, CivicState } from "./data/civic";
export function npcBuildAllowed(
  s: Pick<GameSave, "deeds" | "estate" | "civic" | "city">,
  p: CivicPlot,
) {
  if (
    s.deeds.some((id) => {
      const parcel = parcelAt(id);
      return parcel && insideParcel(parcel, p.x, p.y);
    })
  )
    return false;
  return buildingSiteClear(p.x, p.y, [
    ...Object.values(s.estate),
    ...s.city.buildings,
    ...s.civic.plots.filter((other) => other.id !== p.id && other.stories > 0),
  ]);
}
export function openFrontier(
  civic: CivicState,
  completed: string[],
): CivicState {
  if (
    !completed.includes("noble-reach") ||
    civic.plots.some((p) => p.id === "noble-reach-0")
  )
    return civic;
  const plots: CivicPlot[] = FRONTIER_HOMES.map((p, i) => ({
    ...p,
    id: `noble-reach-${i}`,
    town: "haven",
    shares: [],
    lantern: false,
    stories: 0,
    owner: null,
    rental: false,
    trim: [],
  }));
  return {
    ...civic,
    plots: [...plots, ...civic.plots],
    news: "Noble Reach is open. The road crew has surveyed six home sites beyond the mountain.",
  };
}
