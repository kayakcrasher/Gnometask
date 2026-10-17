import { useGame } from "@/lib/game/store";
import { BOATS } from "@/lib/game/data/boats";
import { levelFromXp, xpForLevel, xpToNext } from "@/lib/game/xp";

export function SailingProgress() {
  const xp = useGame(s => s.skills.sailing);
  const level = levelFromXp(xp);
  const start = xpForLevel(level);
  const end = xpForLevel(level + 1);
  const nextBoat = BOATS.find(boat => boat.need > level);
  const percent = level >= 99 ? 100 : (xp - start) / (end - start) * 100;
  return (
    <div className="w-full text-xs font-semibold text-bark/70">
      <div className="flex justify-between gap-2"><span>Sailing {level}</span><span>{level >= 99 ? "Master sailor" : `${xpToNext(xp)} XP to level ${level + 1}`}</span></div>
      <div role="progressbar" aria-label="Sailing level progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(percent)} className="mt-1 h-1.5 overflow-hidden rounded-full bg-bark/15"><div className="h-full rounded-full bg-moss transition-[width]" style={{ width: `${percent}%` }} /></div>
      <p className="mt-1 text-[10px]">{nextBoat ? `Next: ${nextBoat.name} at Sailing ${nextBoat.need}. ` : "All hulls unlocked. "}Earn XP by sailing over water.</p>
    </div>
  );
}
