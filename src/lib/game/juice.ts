import { islandAudio, type SoundEffect } from "./audio/engine";
/** Called from real pointer/keyboard gestures; passive game ticks never unlock audio. */
export function unlockAudio() {
  islandAudio.unlock();
}
export function setAmbience(state: {
  active: boolean;
  empty: number;
  danger: number;
}) {
  islandAudio.setAmbience(state.active, state.empty);
}
export function sfx(kind: Exclude<SoundEffect, "bird">) {
  islandAudio.effect(kind);
}
