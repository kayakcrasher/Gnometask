let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

export function unlockAudio() {
  audio();
}

function tone(freq: number, dur: number, type: OscillatorType, gain = 0.05, delay = 0) {
  const ac = audio();
  if (!ac) return;
  const t0 = ac.currentTime + delay;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g);
  g.connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

let windGain: GainNode | null = null;
let windFilter: BiquadFilterNode | null = null;
let windStarted = false;
let watchGain = 0;
let tickTimer = 0;

function ensureWind(ac: AudioContext) {
  if (windStarted) return;
  windStarted = true;
  const len = ac.sampleRate * 2;
  const buf = ac.createBuffer(1, len, ac.sampleRate);
  const data = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) {
    last = last * 0.985 + (Math.random() * 2 - 1) * 0.015;
    data[i] = last * 6;
  }
  const src = ac.createBufferSource();
  src.buffer = buf;
  src.loop = true;
  const filter = ac.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 380;
  const gain = ac.createGain();
  gain.gain.value = 0.0001;
  src.connect(filter);
  filter.connect(gain);
  gain.connect(ac.destination);
  src.start();
  windGain = gain;
  windFilter = filter;
}

function armWatch() {
  if (tickTimer || typeof window === "undefined") return;
  const loop = () => {
    if (watchGain > 0.01) {
      tone(watchGain > 0.05 ? 920 : 680, 0.028, "square", Math.min(0.05, watchGain));
      if (watchGain > 0.045) tone(460, 0.04, "sine", watchGain * 0.35, 0.045);
    }
    const gap = watchGain > 0.055 ? 480 : watchGain > 0.03 ? 980 : 2200;
    tickTimer = window.setTimeout(loop, gap);
  };
  tickTimer = window.setTimeout(loop, 1400);
}

/** Wind is louder through an empty shore. The watch ticks harder as danger closes. */
export function setAmbience(state: { active: boolean; empty: number; danger: number }) {
  const quiet =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ac = audio();
  if (!ac) return;
  if (!state.active || quiet) {
    watchGain = 0;
    windGain?.gain.setTargetAtTime(0.0001, ac.currentTime, 0.25);
    return;
  }
  ensureWind(ac);
  armWatch();
  const empty = Math.max(0, Math.min(1, state.empty));
  const danger = Math.max(0, Math.min(1, state.danger));
  windGain?.gain.setTargetAtTime(0.01 + empty * 0.04, ac.currentTime, 0.45);
  windFilter?.frequency.setTargetAtTime(240 + empty * 520, ac.currentTime, 0.5);
  watchGain = 0.016 + danger * 0.055;
}

export function sfx(kind: "done" | "buy" | "place" | "error" | "open" | "hit" | "win") {
  if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }
  if (kind === "done") {
    tone(520, 0.09, "triangle", 0.045);
    tone(780, 0.12, "triangle", 0.035, 0.07);
  } else if (kind === "buy") {
    tone(440, 0.08, "sine", 0.04);
    tone(660, 0.14, "sine", 0.04, 0.06);
  } else if (kind === "place") {
    tone(360, 0.1, "square", 0.03);
    tone(240, 0.12, "sine", 0.035, 0.05);
  } else if (kind === "error") {
    tone(180, 0.14, "sawtooth", 0.025);
  } else if (kind === "hit") {
    tone(140, 0.08, "square", 0.04);
    tone(90, 0.1, "sawtooth", 0.03, 0.04);
  } else if (kind === "win") {
    tone(520, 0.1, "triangle", 0.045);
    tone(660, 0.12, "triangle", 0.04, 0.08);
    tone(780, 0.16, "sine", 0.035, 0.16);
  } else {
    tone(300, 0.07, "sine", 0.03);
  }
}
