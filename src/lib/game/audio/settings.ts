import { create } from "zustand";
import { THEMES, type MusicTheme } from "./score";
export type SoundPreferences = {
  muted: boolean;
  music: number;
  ambience: number;
  effects: number;
  selection: "auto" | MusicTheme;
};
export const SOUND_KEY = "hollow-watch:audio:v1";
export const DEFAULT_SOUND: SoundPreferences = {
  muted: false,
  music: 0.45,
  ambience: 0.28,
  effects: 0.55,
  selection: "auto",
};
export function cleanSound(raw: unknown): SoundPreferences {
  const r =
    raw && typeof raw === "object" ? (raw as Partial<SoundPreferences>) : {};
  const volume = (v: unknown, fallback: number) =>
    typeof v === "number" && Number.isFinite(v)
      ? Math.max(0, Math.min(1, v))
      : fallback;
  return {
    muted: r.muted === true,
    music: volume(r.music, DEFAULT_SOUND.music),
    ambience: volume(r.ambience, DEFAULT_SOUND.ambience),
    effects: volume(r.effects, DEFAULT_SOUND.effects),
    selection:
      r.selection === "auto" || THEMES.includes(r.selection as MusicTheme)
        ? r.selection!
        : "auto",
  };
}
export const useSound = create<
  SoundPreferences & {
    loaded: boolean;
    unlocked: boolean;
    available: boolean;
    playing: MusicTheme;
    setSound: (patch: Partial<SoundPreferences>) => void;
    load: () => void;
  }
>((set, get) => ({
  ...DEFAULT_SOUND,
  loaded: false,
  unlocked: false,
  available: true,
  playing: "home",
  setSound: (patch) => {
    const next = cleanSound({ ...get(), ...patch });
    set(next);
    try {
      localStorage.setItem(SOUND_KEY, JSON.stringify(next));
    } catch {
      /* Private storage is optional. */
    }
  },
  load: () => {
    if (get().loaded) return;
    let saved: unknown = null;
    try {
      saved = JSON.parse(localStorage.getItem(SOUND_KEY) ?? "null");
    } catch {
      /* Keep gentle defaults. */
    }
    set({ ...cleanSound(saved), loaded: true });
  },
}));
