import { GREETS, PLACE_LINES, randOf } from "../quotes";
import { applyDailyRollover, defaultSave, loadSave, writeSave } from "../save";
import type { DragonHorn, DragonLook, GamePopup, InteriorId, MetricId, PanelId, PlaceId } from "../types";
import { leaveBound, markLeaveBound, scheduleWrite, seedQuests, snap } from "./persist";
import type { GameState, StoreGet, StoreSet } from "./types";

export function sessionSlice(set: StoreSet, get: StoreGet): Pick<
  GameState,
  | "hydrate"
  | "persist"
  | "setName"
  | "continueGame"
  | "beginGame"
  | "goHome"
  | "setDragonLook"
  | "newLifeDragon"
  | "selectPlace"
  | "setHover"
  | "setMetric"
  | "setPanel"
  | "openPopup"
  | "closePopup"
  | "enterInterior"
  | "leaveInterior"
  | "setGnomePos"
  | "setFollowWalk"
  | "speak"
> {
  return {
    hydrate: () => {
      const loaded = applyDailyRollover(loadSave());
      const current = get();
      const named = current.named || loaded.named || Boolean(loaded.gnomeName);
      const gnomeName = current.named ? current.gnomeName : loaded.gnomeName;
      const lifeDragon = { ...(current.named ? current.lifeDragon : loaded.lifeDragon), name: "Ember" };
      const seeded = named ? seedQuests(loaded) : { quests: loaded.quests, chicken: loaded.chicken, landing: loaded.landing };
      set({
        ...loaded,
        gnomeName,
        named,
        atHome: true,
        lifeDragon,
        quests: seeded.quests,
        chicken: seeded.chicken,
        landing: seeded.landing,
        hydrated: true,
        combat: current.named ? current.combat : null,
        clearedPack: current.clearedPack,
        raids:
          current.named && current.raids.length
            ? current.raids
            : loaded.named
              ? current.raids
              : [],
        popup: current.named ? current.popup : null,
        interior: current.named ? current.interior : null,
        speech: named
          ? loaded.absencePending
            ? `Welcome back, ${gnomeName || "gnome"}. A fat blue dragon is sitting on the dock. It waited.`
            : lifeDragon.state === "raiding"
              ? `${lifeDragon.name} is over the village. The roofs smell like cinnamon and trouble.`
              : gnomeName
                ? `Welcome back, ${gnomeName}. Click the land — I'll walk.`
                : randOf(GREETS)
          : randOf(GREETS),
      });
      if (named && loaded.quests.length === 0) scheduleWrite(get);
      if (!leaveBound) {
        markLeaveBound();
        const onHide = () => get().persist();
        document.addEventListener("visibilitychange", () => {
          if (document.visibilityState === "hidden") onHide();
        });
        window.addEventListener("pagehide", onHide);
      }
    },

    persist: () => writeSave(snap(get())),

    setName: (name) => {
      const trimmed = name.trim().slice(0, 24) || "Pip";
      const s = get();
      const seeded = seedQuests({ quests: s.quests, chicken: s.chicken, landing: s.landing });
      set({
        gnomeName: trimmed,
        named: true,
        quests: seeded.quests,
        chicken: seeded.chicken,
        landing: seeded.landing,
        interior: null,
        panel: "place",
        selectedPlace: "cottage",
        speech: `Welcome, ${trimmed}. Ol Pappy St. Francis is waving by the cottage. Talk-to him.`,
        popup: {
          kind: "npc",
          hotspotId: "pappy",
          title: "Ol Pappy St. Francis",
          blurb: "You made the dock. Come talk. The hollow starts here.",
          place: "dock",
          npcId: "pappy",
        },
      });
      writeSave(snap(get()));
    },

    continueGame: () => {
      const s = get();
      if (!s.named || !s.gnomeName) return;
      set({
        atHome: false,
        lifeDragon: { ...s.lifeDragon, name: "Ember" },
        speech: `Welcome back, ${s.gnomeName}. The hall must reach level 3 before Ember shows.`,
      });
    },

    beginGame: (name) => {
      const trimmed = name.trim().slice(0, 24) || "Pip";
      const fresh = defaultSave();
      const seeded = seedQuests({ quests: [], chicken: null, landing: null });
      set({
        ...fresh,
        gnomeName: trimmed,
        named: true,
        atHome: false,
        hydrated: true,
        quests: seeded.quests,
        chicken: seeded.chicken,
        landing: seeded.landing,
        lifeDragon: { ...fresh.lifeDragon, name: "Ember" },
        combat: null,
        popup: {
          kind: "npc",
          hotspotId: "pappy",
          title: "Ol Pappy St. Francis",
          blurb: "You made the dock. Come talk. The hollow starts here.",
          place: "dock",
          npcId: "pappy",
        },
        interior: null,
        panel: "place",
        abroad: null,
        raids: [],
        speech: `Welcome, ${trimmed}. Ol Pappy is on the dock. The cottage is up the path.`,
      });
      writeSave(snap(get()));
    },

    goHome: () => {
      get().persist();
      set({ atHome: true, popup: null, interior: null, panel: "place", abroad: null });
    },

    setDragonLook: (patch: Partial<{ name: string; look: DragonLook; horn: DragonHorn }>) => {
      const s = get();
      const name = "Ember";
      const next = { ...s.lifeDragon, ...patch, name };
      const lookChanged = patch.look !== undefined || patch.horn !== undefined;
      set({
        lifeDragon: next,
        speech: lookChanged ? `${name} on the ridge. That's the thing we're facing.` : s.speech,
      });
      scheduleWrite(get);
    },

    newLifeDragon: () => {
      const s = get();
      set({
        lifeDragon: { ...s.lifeDragon, name: "Ember", state: "lurking", hp: 150 },
        speech: "Ember is a new problem now. The ridge is awake.",
      });
      scheduleWrite(get);
    },

    selectPlace: (place: PlaceId | null) => {
      const lines = place ? PLACE_LINES[place] : null;
      set({
        selectedPlace: place,
        speech: lines ? randOf(lines) : get().speech,
      });
    },

    setHover: (place: PlaceId | null) => set({ hoverPlace: place }),
    setMetric: (metric: MetricId) => set({ metric }),
    setPanel: (panel: PanelId) => set({ panel, popup: null }),
    openPopup: (popup: GamePopup) => set({ popup, panel: "place", interior: null }),
    closePopup: () => set({ popup: null }),
    enterInterior: (id: InteriorId) => set({ interior: id, popup: null, panel: "place" }),
    leaveInterior: () => set({ interior: null }),
    setGnomePos: (x: number, y: number) => {
      set({ gnomeX: x, gnomeY: y });
      scheduleWrite(get);
    },
    setFollowWalk: (on: boolean) => set({ followWalk: on }),
    speak: (text: string, bounce?: boolean) =>
      set((s) => ({ speech: text, bounceKey: bounce ? s.bounceKey + 1 : s.bounceKey })),
  };
}
