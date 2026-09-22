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
