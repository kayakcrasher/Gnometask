import { ROAD_PROJECTS } from "../data/expansion";
import { bestCraft } from "../data/catalog";
import { developmentWorth, homeBuildQuote } from "../development";
import {
  buildingSiteClear,
  civicParcelOwner,
  insideParcel,
  parcelBuildingSpot,
} from "../land-planning";
import { parcelAt } from "../data/parcels";
import { levelFromXp } from "../xp";
import { scheduleWrite, withXp } from "./persist";
import type { GameState, StoreGet, StoreSet } from "./types";
export function developmentSlice(
  set: StoreSet,
  get: StoreGet,
): Pick<GameState, "commissionRoad" | "advanceRoadCrew" | "buildParcelHome"> {
  return {
    commissionRoad: (id) => {
      const s = get(),
        index = ROAD_PROJECTS.findIndex((p) => p.id === id),
        project = ROAD_PROJECTS[index];
      if (
        !project ||
        s.combat ||
        s.roadWorks.active ||
        s.roadWorks.completed.includes(id)
      )
        return;
      if (index !== s.roadWorks.completed.length) {
        set({
          speech: "Finish the previous road before opening another work site.",
        });
        return;
      }
      if (
        s.townHallLevel < project.hall ||
        developmentWorth(s) < project.wealth
      ) {
        set({
          speech: `The crew needs Hall ${project.hall} and island wealth ${project.wealth}.`,
        });
        return;
      }
      if (s.coins < project.coins || s.logs < project.logs) {
        set({
          speech: `The road needs ${project.coins} coins and ${project.logs} logs.`,
        });
        return;
      }
      set({
        coins: s.coins - project.coins,
        logs: s.logs - project.logs,
        roadWorks: { ...s.roadWorks, active: { id, progress: 0 } },
        speech: `Road crew commissioned: ${project.name}. The materials are paid for; work advances while you play.`,
      });
      scheduleWrite(get);
    },
    advanceRoadCrew: () => {
      const s = get(),
        active = s.roadWorks.active;
      if (!active || s.atHome || s.combat) return;
      const project = ROAD_PROJECTS.find((p) => p.id === active.id);
      if (!project) return;
      const progress = Math.min(
        1,
        active.progress + 0.08 * (1 + bestCraft(s.ownedGear) * 0.04),
      );
      const done = progress >= 1;
      set({
        roadWorks: done
          ? { completed: [...s.roadWorks.completed, project.id], active: null }
          : { ...s.roadWorks, active: { id: project.id, progress } },
        ...(done
          ? {
              speech: `${project.name} is finished. The public road is open; the surrounding land stays available.`,
            }
          : {}),
      });
      scheduleWrite(get);
    },
    buildParcelHome: (id) => {
      const s = get(),
        parcel = parcelAt(id),
        existing = s.estate[id];
      if (!parcel || !s.deeds.includes(id) || s.combat) return;
      if (parcel.northern && !s.roadWorks.completed.includes("noble-reach")) {
        set({
          speech:
            "Complete Noble Reach avenue before building in the northern district.",
        });
        return;
      }
      const quote = homeBuildQuote(existing?.level ?? 0, s.ownedGear);
      if (!quote) {
        set({ speech: "This home already has three storeys." });
        return;
      }
      if (
        s.townHallLevel < quote.hall ||
        levelFromXp(s.skills.crafting) < quote.crafting
      ) {
        set({
          speech: `This build needs Hall ${quote.hall} and Crafting ${quote.crafting}.`,
        });
        return;
      }
      if (s.coins < quote.coins || s.logs < quote.logs) {
        set({
          speech: `Building needs ${quote.coins} coins and ${quote.logs} logs.`,
        });
        return;
      }
      if (!existing && civicParcelOwner(parcel, s.civic)) {
        set({
          speech:
            "A neighbour holds ground in this parcel. Their home cannot be built over.",
        });
        return;
      }
      const others = [
        ...Object.entries(s.estate)
          .filter(([key]) => key !== id)
          .map(([, h]) => h),
        ...s.civic.plots.filter((p) => p.stories > 0),
      ];
      const spot = existing ?? parcelBuildingSpot(parcel, others);
      if (
        !spot ||
        !insideParcel(parcel, spot.x, spot.y) ||
        !buildingSiteClear(spot.x, spot.y, others)
      ) {
        set({
          speech:
            "There is no safe building footprint here. The road, shoreline and existing buildings stay clear.",
        });
        return;
      }
      const gained = withXp(s.skills, {
        crafting: 40 + (existing?.level ?? 0) * 40,
      });
      set({
        estate: {
          ...s.estate,
          [id]: { x: spot.x, y: spot.y, level: (existing?.level ?? 0) + 1 },
        },
        coins: s.coins - quote.coins,
        logs: s.logs - quote.logs,
        skills: gained.skills,
        speech: `${existing ? "Home extended" : "Roadside home built"}. ${quote.coins} coins and ${quote.logs} logs spent. Your deed is unchanged.`,
      });
      scheduleWrite(get);
    },
  };
}
