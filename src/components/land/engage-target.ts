import { useGame } from "@/lib/game/store";
import type { GamePopup } from "@/lib/game/types";
import type { EnemyId } from "@/lib/game/combat";
export function engageTarget(
  popup: GamePopup,
  x: number,
  y: number,
  walkTo: (x: number, y: number, arrive?: () => void) => void,
) {
  let s = useGame.getState();
  if (s.combat) {
    if (s.combat.phase === "won") s.combatEnd();
    else if (s.combat.phase === "lost") return;
    else {
      if (
        (s.combat.packId === popup.packId && popup.packId) ||
        (s.combat.raidId === popup.raidId && popup.raidId)
      )
        s.setCombatAuto(true);
      else
        s.speak(
          "Retreat from your current opponent before choosing another target.",
        );
      return;
    }
  }
  s = useGame.getState();
  if (s.afloat) {
    s.speak("Moor your boat before engaging enemies on land.");
    return;
  }
  s.closePopup();
  const start = () => {
    const now = useGame.getState();
    if (popup.raidId) now.startRaidFight(popup.raidId);
    else if (popup.packId && popup.enemyId === "runt")
      now.startLandingFight(popup.packId);
    else if (popup.packId && popup.enemyId)
      now.startCreature(popup.packId, popup.enemyId as EnemyId);
  };
  const dx = x - s.gnomeX,
    dy = y - s.gnomeY,
    d = Math.hypot(dx, dy);
  if (d <= 55) start();
  else walkTo(x - (dx / d) * 42, y - (dy / d) * 42, start);
}
