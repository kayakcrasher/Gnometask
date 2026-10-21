import type { GameSave, GameUi } from "../types";
import type { CombatState } from "../combat";
import { nearestPlace } from "../world3";
export type MusicTheme =
  | "title"
  | "home"
  | "meadow"
  | "harbour"
  | "woodland"
  | "village"
  | "sunstep"
  | "moonlight"
  | "adventure";
export type Instrument = "piano" | "harp" | "flute" | "bell" | "pad";
export type MusicNote = {
  at: number;
  duration: number;
  midi: number;
  gain: number;
  voice: Instrument;
};
export type ThemeScore = {
  title: string;
  description: string;
  bpm: number;
  beats: number;
  root: number;
  voice: Instrument;
  motifs: number[][];
  chords: number[];
};
export const MUSIC: Record<MusicTheme, ThemeScore> = {
  title: {
    title: "A Light Across the Water",
    description: "Hollow Watch’s original title waltz: a hopeful flute, harp, warm piano and lantern-bright bells.",
    bpm: 76, beats: 3, root: 62, voice: "flute",
    motifs: [
      [0, -1, 2, 4, 5, -1, 4, 2, 1, -1, 0, -1],
      [2, -1, 4, 5, 7, -1, 6, 5, 4, -1, 2, -1],
      [5, -1, 4, 2, 3, -1, 2, 1, 0, -1, -1, -1],
      [1, 2, 4, -1, 2, 1, 0, -1, 0, -1, -1, -1],
    ],
    chords: [0, 5, 3, 4, 0, 2, 3, 4, 5, 3, 0, 4, 3, 4, 4, 0],
  },
  home: {
    title: "Tea with the Window Open",
    description: "Warm piano, a tiny music box and nowhere to hurry.",
    bpm: 64,
    beats: 3,
    root: 60,
    voice: "piano",
    motifs: [
      [0, 2, 4, -1, 2, 1, 0, -1, 4, 5, 4, -1],
      [2, 4, 6, -1, 5, 4, 2, 1, 0, -1, -1, -1],
    ],
    chords: [0, 3, 0, 4, 5, 3, 4, 0],
  },
  meadow: {
    title: "Button Meadow",
    description: "A lilting garden waltz with little bell blossoms.",
    bpm: 72,
    beats: 3,
    root: 62,
    voice: "bell",
    motifs: [
      [0, 2, 4, 2, 1, -1, 0, 2, 5, -1, 4, -1],
      [4, 5, 7, -1, 5, 4, 2, -1, 1, 2, 0, -1],
    ],
    chords: [0, 5, 3, 4, 0, 3, 4, 0],
  },
  harbour: {
    title: "Little Boats, Big Sky",
    description: "Gentle plucked strings and a tune that sways with the tide.",
    bpm: 66,
    beats: 3,
    root: 62,
    voice: "harp",
    motifs: [
      [0, -1, 2, 4, 5, -1, 4, 2, 1, -1, 0, -1],
      [4, -1, 5, 7, 6, -1, 4, 2, 1, 2, 0, -1],
    ],
    chords: [0, 4, 5, 3, 0, 1, 4, 0],
  },
  woodland: {
    title: "Moss on a Mitten",
    description: "A shy wooden flute between rustling leaves.",
    bpm: 60,
    beats: 3,
    root: 57,
    voice: "flute",
    motifs: [
      [0, -1, 2, -1, 4, -1, 5, 4, 2, -1, -1, -1],
      [4, -1, 5, 7, 5, -1, 4, 2, 1, -1, 0, -1],
    ],
    chords: [0, 3, 5, 4, 0, 3, 1, 0],
  },
  village: {
    title: "Postcards from Home",
    description: "Soft piano footsteps and friendly shop-door bells.",
    bpm: 74,
    beats: 4,
    root: 60,
    voice: "piano",
    motifs: [
      [0, 2, 4, -1, 4, 5, 4, 2, 1, -1, 2, 4, 2, 1, 0, -1],
      [4, 5, 7, -1, 6, 5, 4, -1, 2, 4, 5, 2, 1, -1, 0, -1],
    ],
    chords: [0, 3, 4, 0, 5, 3, 1, 4],
  },
  sunstep: {
    title: "Sunstep Starlight",
    description: "A sleepy promenade, brushed chords and golden little chimes.",
    bpm: 70,
    beats: 4,
    root: 65,
    voice: "bell",
    motifs: [
      [0, -1, 2, 4, 6, -1, 5, 4, 2, -1, 1, 2, 0, -1, -1, -1],
      [4, 5, 6, -1, 7, -1, 6, 4, 5, -1, 4, 2, 1, -1, 0, -1],
    ],
    chords: [0, 5, 1, 4, 3, 0, 1, 4],
  },
  moonlight: {
    title: "Fireflies after Supper",
    description: "A hushed music-box lullaby under the evening sky.",
    bpm: 56,
    beats: 3,
    root: 60,
    voice: "bell",
    motifs: [
      [4, -1, 2, -1, 0, -1, 1, 2, 4, -1, -1, -1],
      [5, -1, 4, 2, 1, -1, 2, -1, 0, -1, -1, -1],
    ],
    chords: [0, 5, 3, 0, 1, 3, 4, 0],
  },
  adventure: {
    title: "Brave Little Boots",
    description: "A gentle sense of courage, without pounding battle drums.",
    bpm: 76,
    beats: 4,
    root: 62,
    voice: "harp",
    motifs: [
      [0, 2, 4, -1, 5, 4, 2, -1, 0, 2, 5, 4, 2, -1, 1, -1],
      [4, 5, 7, -1, 6, 5, 4, 2, 1, 2, 4, 2, 0, -1, -1, -1],
    ],
    chords: [5, 3, 0, 4, 5, 3, 4, 0],
  },
};
export const THEMES = Object.keys(MUSIC) as MusicTheme[];
export const midiHz = (midi: number) => 440 * 2 ** ((midi - 69) / 12);
const scale = [0, 2, 4, 5, 7, 9, 11];
const degree = (n: number) =>
  scale[((n % 7) + 7) % 7]! + 12 * Math.floor(n / 7);
/** Original two-part melodies, with breathing space, chord inversions and a second verse. */
export function makeScore(theme: MusicTheme, variation = 0) {
  const song = MUSIC[theme],
    beat = 60 / song.bpm,
    barSeconds = beat * song.beats,
    notes: MusicNote[] = [];
  for (let bar = 0; bar < 32; bar++) {
    const chord = song.chords[Math.floor(bar / 2) % song.chords.length]!,
      at = bar * barSeconds;
    for (const [i, tone] of [0, 2, 4].entries())
      notes.push({
        at: at + i * 0.045,
        duration: barSeconds * 1.25,
        midi: song.root - 12 + degree(chord + tone),
        gain: 0.013,
        voice: "pad",
      });
    // A warm bass, then a quiet broken chord rather than a mechanical drum loop.
    notes.push({
      at,
      duration: beat * 1.5,
      midi: song.root - 24 + degree(chord),
      gain: 0.034,
      voice: "harp",
    });
    for (let b = 1; b < song.beats; b++)
      notes.push({
        at: at + b * beat,
        duration: beat * 1.2,
        midi: song.root - 12 + degree(chord + (b % 2 ? 2 : 4)),
        gain: 0.026,
        voice: "piano",
      });
    const motif =
      song.motifs[
        (Math.floor(bar / 2) + (variation % 2)) % song.motifs.length
      ]!;
    for (let slot = 0; slot < song.beats * 2; slot++) {
      const index = (bar % 2) * song.beats * 2 + slot;
      let n = motif[index % motif.length]!;
      if (n < 0) continue;
      if (bar % 8 === 7 && slot === song.beats * 2 - 2) n = 0;
      const next = motif[(index + 1) % motif.length],
        long = next === -1 ? 1.08 : 0.48;
      notes.push({
        at: at + slot * 0.5 * beat + 0.028,
        duration: beat * long,
        midi: song.root + degree(n),
        gain: (theme === "moonlight" ? 0.032 : 0.048) * (slot % 2 ? 0.88 : 1),
        voice: song.voice,
      });
    }
    if (theme === "title" && bar % 4 === 3)
      for (const [i,tone] of [4,2,0].entries()) notes.push({at:at+(1.5+i*.5)*beat,duration:beat*1.1,midi:song.root+12+degree(tone),gain:.013,voice:"bell"});
    if (bar % 8 === 6)
      notes.push({
        at: at + beat * 1.5,
        duration: beat * 1.4,
        midi: song.root + 12 + degree(2),
        gain: 0.018,
        voice: "bell",
      });
  }
  return {
    notes: notes.sort((a, b) => a.at - b.at),
    duration: 32 * barSeconds,
  };
}
type MusicWorld = Pick<GameSave, "gnomeX" | "gnomeY" | "afloat" | "city"> &
  Pick<GameUi, "atHome" | "interior" | "dayPhase" | "abroad"> & {
    combat: CombatState | null;
  };
export function themeForWorld(s: MusicWorld): MusicTheme {
  if (s.atHome) return "title";
  if (s.interior === "cottage") return "home";
  if (s.combat && s.combat.phase !== "won" && s.combat.phase !== "lost")
    return "adventure";
  if (s.interior === "casino") return "sunstep";
  if (s.interior) return "village";
  if (s.dayPhase === "night" || s.dayPhase === "dusk") return "moonlight";
  if (s.afloat || s.abroad) return "harbour";
  if (s.gnomeY < -850) return "woodland";
  if (s.gnomeX > 2500) return "sunstep";
  const home = s.city.buildings.find((b) => b.kind === "home");
  if (home && Math.hypot(home.x - s.gnomeX, home.y - s.gnomeY) < 90)
    return "home";
  const place = nearestPlace(s.gnomeX, s.gnomeY);
  if (place === "dock") return "harbour";
  if (
    place === "woods" ||
    place === "wildlands" ||
    place === "mines" ||
    place === "ruins"
  )
    return "woodland";
  if (place === "garden" || place === "pond") return "meadow";
  return "village";
}
