import { makeScore, midiHz, type MusicNote, type MusicTheme } from "./score";
import { useSound, type SoundPreferences } from "./settings";
type AudioBase = BaseAudioContext;
export type VoiceHandle = { stop: (when?: number) => void };
const waves = new WeakMap<AudioBase, Map<string, PeriodicWave>>();
/** The same soft instrument renderer is used in-game and for exported listening samples. */
export function scheduleVoice(
  ac: AudioBase,
  destination: AudioNode,
  note: MusicNote,
  when: number,
  onEnd?: () => void,
): VoiceHandle {
  const osc = ac.createOscillator(),
    gain = ac.createGain(),
    filter = ac.createBiquadFilter();
  let cache = waves.get(ac);
  if (!cache) {
    cache = new Map();
    waves.set(ac, cache);
  }
  let wave = cache.get(note.voice);
  if (!wave) {
    const partials =
      note.voice === "flute"
        ? [0, 1, 0.08, 0.035, 0.015]
        : note.voice === "pad"
          ? [0, 1, 0.15, 0.05]
          : note.voice === "harp"
            ? [0, 1, 0.32, 0.12, 0.035]
            : [0, 1, 0.24, 0.075, 0.025];
    wave = ac.createPeriodicWave(
      new Float32Array(partials.length),
      Float32Array.from(partials),
    );
    cache.set(note.voice, wave);
  }
  osc.setPeriodicWave(wave);
  osc.frequency.setValueAtTime(midiHz(note.midi), when);
  filter.type = "lowpass";
  filter.frequency.value =
    note.voice === "bell" ? 2900 : note.voice === "pad" ? 1100 : 2200;
  filter.Q.value = 0.4;
  const attack =
      note.voice === "pad" ? 0.32 : note.voice === "flute" ? 0.08 : 0.012,
    release = note.voice === "pad" ? 0.65 : 0.3,
    end = when + Math.max(attack + 0.05, note.duration) + release;
  gain.gain.setValueAtTime(0.0001, when);
  gain.gain.exponentialRampToValueAtTime(
    Math.max(0.0002, note.gain),
    when + attack,
  );
  gain.gain.exponentialRampToValueAtTime(
    Math.max(0.00015, note.gain * (note.voice === "pad" ? 0.72 : 0.28)),
    when + Math.max(attack + 0.025, note.duration * 0.7),
  );
  gain.gain.exponentialRampToValueAtTime(0.0001, end);
  osc.connect(filter);
  filter.connect(gain);
  gain.connect(destination);
  let overtone: OscillatorNode | null = null,
    partial: GainNode | null = null;
  if (note.voice === "bell") {
    overtone = ac.createOscillator();
    partial = ac.createGain();
    overtone.type = "sine";
    overtone.frequency.setValueAtTime(midiHz(note.midi) * 2.005, when);
    partial.gain.value = 0.16;
    overtone.connect(partial);
    partial.connect(filter);
    overtone.start(when);
    overtone.stop(end + 0.02);
  }
  let done = false;
  const cleanup = () => {
    if (done) return;
    done = true;
    osc.disconnect();
    overtone?.disconnect();
    partial?.disconnect();
    filter.disconnect();
    gain.disconnect();
    onEnd?.();
  };
  osc.onended = cleanup;
  osc.start(when);
  osc.stop(end + 0.03);
  return {
    stop: (at = ac.currentTime) => {
      try {
        gain.gain.cancelScheduledValues(at);
        gain.gain.setTargetAtTime(0.0001, at, 0.025);
        osc.stop(at + 0.12);
        overtone?.stop(at + 0.12);
      } catch {
        /* An ended voice is already silent. */
      }
    },
  };
}
export type SoundEffect =
  "done" | "buy" | "place" | "error" | "open" | "hit" | "win" | "bird";
type Playing = {
  id: MusicTheme;
  bus: GainNode;
  start: number;
  index: number;
  verse: number;
  score: ReturnType<typeof makeScore>;
};
class IslandAudio {
  private ac: AudioContext | null = null;
  private master: GainNode | null = null;
  private music: GainNode | null = null;
  private effects: GainNode | null = null;
  private ambience: GainNode | null = null;
  private wind: AudioBufferSourceNode | null = null;
  private windGain: GainNode | null = null;
  private windFilter: BiquadFilterNode | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;
  private playing: Playing | null = null;
  private voices = new Set<VoiceHandle>();
  private scene: MusicTheme = "home";
  private active = false;
  private birdAt = 0;
  private cleanups = new Set<ReturnType<typeof setTimeout>>();
  constructor() {
    useSound.subscribe((s, p) => {
      if (
        s.muted !== p.muted ||
        s.music !== p.music ||
        s.effects !== p.effects ||
        s.ambience !== p.ambience ||
        s.selection !== p.selection
      )
        this.preferences(s);
    });
  }
  private canRun() {
    return (
      this.ac &&
      useSound.getState().unlocked &&
      !useSound.getState().muted &&
      (typeof document === "undefined" || !document.hidden)
    );
  }
  unlock() {
    if (typeof window === "undefined") return;
    useSound.getState().load();
    if (!this.ac) {
      try {
        const Ctor =
          window.AudioContext ||
          (window as Window & { webkitAudioContext?: typeof AudioContext })
            .webkitAudioContext;
        if (!Ctor) {
          useSound.setState({ available: false });
          return;
        }
        this.ac = new Ctor();
        const ac = this.ac,
          compressor = ac.createDynamicsCompressor();
        compressor.threshold.value = -18;
        compressor.knee.value = 18;
        compressor.ratio.value = 5;
        compressor.attack.value = 0.015;
        compressor.release.value = 0.3;
        this.master = ac.createGain();
        this.master.gain.value = 0;
        compressor.connect(this.master);
        this.master.connect(ac.destination);
        this.music = ac.createGain();
        this.effects = ac.createGain();
        this.ambience = ac.createGain();
        for (const bus of [this.music, this.effects, this.ambience])
          bus.connect(compressor);
        const reverb = ac.createConvolver(),
          wet = ac.createGain(),
          impulse = ac.createBuffer(
            2,
            Math.floor(ac.sampleRate * 1.8),
            ac.sampleRate,
          );
        let seed = 431;
        for (let c = 0; c < 2; c++) {
          const data = impulse.getChannelData(c);
          for (let i = 0; i < data.length; i++) {
            seed = (seed * 1664525 + 1013904223) >>> 0;
            data[i] =
              ((seed / 4294967296) * 2 - 1) *
              Math.pow(1 - i / data.length, 3) *
              0.4;
          }
        }
        reverb.buffer = impulse;
        wet.gain.value = 0.19;
        this.music.connect(reverb);
        this.effects.connect(reverb);
        reverb.connect(wet);
        wet.connect(compressor);
        this.makeWind();
      } catch {
        useSound.setState({ available: false });
        return;
      }
    }
    useSound.setState({ unlocked: true, available: true });
    this.preferences(useSound.getState());
  }
  private preferences(s: SoundPreferences) {
    const id = s.selection === "auto" ? this.scene : s.selection;
    useSound.setState({ playing: id });
    const ac = this.ac;
    if (!ac) return;
    this.music?.gain.setTargetAtTime(s.music, ac.currentTime, 0.15);
    this.effects?.gain.setTargetAtTime(s.effects, ac.currentTime, 0.08);
    this.ambience?.gain.setTargetAtTime(s.ambience, ac.currentTime, 0.25);
    this.master?.gain.setTargetAtTime(s.muted ? 0 : 0.85, ac.currentTime, 0.12);
    if (!s.music || s.muted) {
      this.stopTrack();
    } else if (!this.playing || this.playing.id !== id) this.startTrack(id);
    if (this.canRun()) {
      void ac
        .resume()
        .then(() => {
          if (this.canRun()) this.startClock();
        })
        .catch(() => {
          /* A subsequent tap can resume restricted mobile audio. */
        });
    } else {
      this.stopClock();
      void ac.suspend().catch(() => {});
    }
  }
  setScene(scene: MusicTheme) {
    if (this.scene === scene) return;
    this.scene = scene;
    if (useSound.getState().selection === "auto")
      this.preferences(useSound.getState());
  }
  setAmbience(active: boolean, empty = 0) {
    this.active = active;
    const ac = this.ac;
    if (!ac) return;
    this.windGain?.gain.setTargetAtTime(
      active ? 0.018 + Math.max(0, Math.min(1, empty)) * 0.008 : 0,
      ac.currentTime,
      1,
    );
    this.windFilter?.frequency.setTargetAtTime(
      this.scene === "harbour" ? 420 : 240,
      ac.currentTime,
      1,
    );
  }
  visibility() {
    if (this.ac) this.preferences(useSound.getState());
  }
  private startTrack(id: MusicTheme) {
    const ac = this.ac;
    if (!ac || !this.music) return;
    this.stopTrack();
    const bus = ac.createGain();
    bus.gain.setValueAtTime(0.0001, ac.currentTime);
    bus.gain.linearRampToValueAtTime(1, ac.currentTime + 1.8);
    bus.connect(this.music);
    this.playing = {
      id,
      bus,
      start: ac.currentTime + 0.08,
      index: 0,
      verse: 0,
      score: makeScore(id),
    };
  }
  private stopTrack() {
    const old = this.playing,
      ac = this.ac;
    if (!old || !ac) return;
    this.playing = null;
    old.bus.gain.cancelScheduledValues(ac.currentTime);
    old.bus.gain.setTargetAtTime(0.0001, ac.currentTime, 0.45);
    const t = setTimeout(() => {
      old.bus.disconnect();
      this.cleanups.delete(t);
    }, 5000);
    this.cleanups.add(t);
  }
  private voice(note: MusicNote, bus: AudioNode, at: number) {
    if (!this.ac) return;
    if (this.voices.size >= 36) {
      const first = this.voices.values().next().value as
        VoiceHandle | undefined;
      first?.stop();
      if (first) this.voices.delete(first);
    }
    let handle: VoiceHandle;
    handle = scheduleVoice(this.ac, bus, note, at, () =>
      this.voices.delete(handle),
    );
    this.voices.add(handle);
  }
  private startClock() {
    if (this.timer) return;
    this.pump();
    this.timer = setInterval(() => this.pump(), 100);
  }
  private stopClock() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }
  private pump() {
    const ac = this.ac;
    if (!ac || !this.canRun()) return;
    const p = this.playing;
    if (p) {
      let count = 0;
      while (count++ < 100) {
        const n = p.score.notes[p.index];
        if (!n) {
          p.start += p.score.duration;
          p.verse++;
          p.score = makeScore(p.id, p.verse);
          p.index = 0;
          continue;
        }
        if (p.start + n.at > ac.currentTime + 0.18) break;
        if (p.start + n.at >= ac.currentTime - 0.08)
          this.voice(
            n,
            p.bus,
            Math.max(ac.currentTime + 0.005, p.start + n.at),
          );
        p.index++;
      }
    }
    if (
      this.active &&
      useSound.getState().ambience > 0.001 &&
      ac.currentTime > this.birdAt
    ) {
      this.birdAt =
        ac.currentTime + 12 + (Math.sin(ac.currentTime) * 0.5 + 0.5) * 9;
      if (["meadow", "woodland", "village"].includes(this.scene))
        this.effect("bird", true);
    }
  }
  effect(kind: SoundEffect, nature = false) {
    const ac = this.ac,
      s = useSound.getState(),
      bus = nature ? this.ambience : this.effects;
    if (!ac || !bus || !this.canRun() || !(nature ? s.ambience : s.effects))
      return;
    const patterns: Record<SoundEffect, number[]> = {
      done: [72, 76, 79],
      buy: [69, 76],
      place: [60, 67],
      error: [55, 52],
      open: [67, 72],
      hit: [43],
      win: [60, 64, 67, 72],
      bird: [86, 89, 88],
    };
    patterns[kind].forEach((midi, i) =>
      this.voice(
        {
          at: 0,
          duration: kind === "hit" ? 0.09 : nature ? 0.1 : 0.25,
          midi,
          gain: nature ? 0.025 : kind === "hit" ? 0.045 : 0.065,
          voice: kind === "error" ? "flute" : nature ? "flute" : "harp",
        },
        bus,
        ac.currentTime + 0.01 + i * (nature ? 0.12 : 0.1),
      ),
    );
  }
  private makeWind() {
    const ac = this.ac;
    if (!ac || !this.ambience) return;
    const buffer = ac.createBuffer(1, ac.sampleRate * 3, ac.sampleRate),
      data = buffer.getChannelData(0);
    let last = 0,
      seed = 97;
    for (let i = 0; i < data.length; i++) {
      seed = (seed * 16807) % 2147483647;
      last = last * 0.98 + ((seed / 2147483647) * 2 - 1) * 0.02;
      data[i] = last * 2;
    }
    this.wind = ac.createBufferSource();
    this.wind.buffer = buffer;
    this.wind.loop = true;
    this.windFilter = ac.createBiquadFilter();
    this.windFilter.type = "lowpass";
    this.windFilter.frequency.value = 240;
    this.windGain = ac.createGain();
    this.windGain.gain.value = this.active ? 0.02 : 0;
    this.wind.connect(this.windFilter);
    this.windFilter.connect(this.windGain);
    this.windGain.connect(this.ambience);
    this.wind.start();
  }
  debug() {
    return {
      state: this.ac?.state ?? "locked",
      theme: this.playing?.id ?? null,
      voices: this.voices.size,
      timer: !!this.timer,
    };
  }
  stop() {
    this.stopClock();
    this.stopTrack();
    for (const voice of this.voices) voice.stop();
    this.voices.clear();
    this.windGain?.gain.setTargetAtTime(0, this.ac?.currentTime ?? 0, 0.1);
    if (this.ac) void this.ac.suspend().catch(() => {});
  }
}
export const islandAudio = new IslandAudio();

if (typeof window !== "undefined") {
  (
    window as Window & {
      __audioDebug?: () => ReturnType<typeof islandAudio.debug>;
    }
  ).__audioDebug = () => islandAudio.debug();
}
