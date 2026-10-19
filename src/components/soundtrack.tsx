import { useEffect } from "react";
import { useGame } from "@/lib/game/store";
import { islandAudio } from "@/lib/game/audio/engine";
import { themeForWorld } from "@/lib/game/audio/score";
import { useSound } from "@/lib/game/audio/settings";
export function Soundtrack() {
  useEffect(() => {
    useSound.getState().load();
    let scene = themeForWorld(useGame.getState()),
      timer: ReturnType<typeof setTimeout> | null = null;
    islandAudio.setScene(scene);
    const unsubscribe = useGame.subscribe((state) => {
      const next = themeForWorld(state);
      if (next === scene) return;
      scene = next;
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        islandAudio.setScene(scene);
        timer = null;
      }, 1200);
    });
    const visibility = () => islandAudio.visibility();
    document.addEventListener("visibilitychange", visibility);
    return () => {
      unsubscribe();
      if (timer) clearTimeout(timer);
      document.removeEventListener("visibilitychange", visibility);
      islandAudio.stop();
    };
  }, []);
  return null;
}
