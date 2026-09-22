import { uid } from "@/lib/utils";
import { ENEMIES } from "../combat";
import { GREETS, PLACE_LINES, randOf } from "../quotes";
import { applyDailyRollover, loadSave, writeSave } from "../save";
import type { DragonHorn, DragonLook, GamePopup, InteriorId, MetricId, PanelId, PlaceId } from "../types";
import { leaveBound, markLeaveBound, scheduleWrite, seedQuests, snap } from "./persist";
import type { GameState, StoreGet, StoreSet } from "./types";

export function sessionSlice(set: StoreSet, get: StoreGet): Pick<
  GameState,
  | "hydrate"
  | "persist"
  | "setName"
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
      const lifeDragon = current.named && current.lifeDragon.name !== "Ember" ? current.lifeDragon : loaded.lifeDragon;
      const seeded = named ? seedQuests(loaded) : { quests: loaded.quests, chicken: loaded.chicken };
      set({
        ...loaded,
        gnomeName,
        named,
        lifeDragon,
        quests: seeded.quests,
        chicken: seeded.chicken,
        hydrated: true,
        combat: current.named ? current.combat : null,
        clearedPack: current.clearedPack,
        raids:
          current.named && current.raids.length
            ? current.raids
            : loaded.named
              ? [{ id: "raid-dock", kind: "goblin" as const, x: 108, y: 498, hp: ENEMIES.goblin.hp }]
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
      const raids = s.raids.length
        ? s.raids
        : [{ id: uid("raid"), kind: "goblin" as const, x: 108, y: 498, hp: ENEMIES.goblin.hp }];
      const seeded = seedQuests({ quests: s.quests, chicken: s.chicken });
      set({
        gnomeName: trimmed,
        named: true,
        raids,
        quests: seeded.quests,
        chicken: seeded.chicken,
        speech: `Welcome, ${trimmed}. Click the land to walk. Neighbours Talk or Trade. Pipkin lost a chicken.`,
      });
      writeSave(snap(get()));
    },

    setDragonLook: (patch: Partial<{ name: string; look: DragonLook; horn: DragonHorn }>) => {
      const s = get();
      const name = patch.name?.trim().slice(0, 18) || s.lifeDragon.name;
      set({
        lifeDragon: { ...s.lifeDragon, ...patch, name },
        speech: `${name} on the ridge. That's the thing we're facing.`,
      });
      scheduleWrite(get);
    },

    newLifeDragon: () => {
      const s = get();
      set({
        lifeDragon: { ...s.lifeDragon, state: "lurking", hp: 150 },
        speech: `${s.lifeDragon.name} is a new problem now. The ridge is awake.`,
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
