import { ENEMIES } from "@/lib/game/combat";
import { useGame } from "@/lib/game/store";
import { cn } from "@/lib/utils";
import {
  COMBAT_SKILLS,
  SKILL_LABEL,
  combatLevel,
  levelFromXp,
  xpForLevel,
  xpToNext,
} from "@/lib/game/xp";

function Bar({ value, max, tone }: { value: number; max: number; tone: "berry" | "moss" }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="h-2.5 overflow-hidden rounded-full bg-bark/20">
      <div
        className={cn("h-full rounded-full transition-[width] duration-200", tone === "berry" ? "bg-berry" : "bg-moss")}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function CombatView() {
  const combat = useGame((s) => s.combat);
  const honey = useGame((s) => s.honey);
  const bread = useGame((s) => s.bread);
  const skills = useGame((s) => s.skills);
  const attack = useGame((s) => s.combatAttack);
  const eat = useGame((s) => s.combatEat);
  const flee = useGame((s) => s.combatFlee);
  const end = useGame((s) => s.combatEnd);
  const praying = useGame((s) => s.praying);
  const setPraying = useGame((s) => s.setPraying);
  const dragon = useGame((s) => s.lifeDragon);
  const style = useGame((s) => s.combatStyle);
  const setStyle = useGame((s) => s.setCombatStyle);

  if (!combat) return null;
  const enemy = ENEMIES[combat.enemyId];
  const busy = combat.phase === "enemy";
  const over = combat.phase === "won" || combat.phase === "lost";
  const food = honey + bread;
  const who = combat.enemyId === "dragon" ? dragon.name : enemy.name;
  const cmb = combatLevel(skills);

  return (
    <div className="absolute inset-0 z-50 flex items-end justify-center bg-ink/50 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:items-center">
      <div
        className="pointer-events-auto w-full max-w-md rounded-[22px] bg-parchment p-3 shadow-panel"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-bark/55">
              {over ? (combat.phase === "won" ? "Victory" : "Down") : "In combat"}
            </p>
            <h2 className="font-display text-lg font-semibold leading-tight text-ink">{who}</h2>
          </div>
          <span className="shrink-0 rounded-full bg-pine px-2.5 py-1 font-display text-[11px] font-semibold text-parchment">
            Combat {cmb}
          </span>
        </div>

        <div className="mt-2 grid grid-cols-2 gap-2">
          <div>
            <p className="text-[10px] font-bold uppercase text-bark/55">You</p>
            <Bar value={combat.playerHp} max={combat.playerMax} tone="moss" />
            <p className="mt-0.5 font-display text-xs font-semibold tabular-nums text-ink">
              {combat.playerHp}/{combat.playerMax}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase text-bark/55">{who}</p>
            <Bar value={combat.enemyHp} max={combat.enemyMax} tone="berry" />
            <p className="mt-0.5 font-display text-xs font-semibold tabular-nums text-ink">
              {combat.enemyHp}/{combat.enemyMax}
            </p>
          </div>
        </div>

        <div className="relative mt-2 h-16 overflow-hidden rounded-[14px] bg-moss/15">
          <div
            key={`you-${combat.shake}-${combat.striking ? "s" : "i"}`}
            className={cn("absolute bottom-2 left-4 flex flex-col items-center", combat.striking && "rs-chop")}
          >
            <span className="size-8 rounded-full bg-pine" />
            <span className="text-[10px] font-bold text-ink">You</span>
          </div>
          <div
            key={`foe-${combat.shake}-${combat.foeSwing ? "s" : "i"}`}
            className={cn("absolute bottom-2 right-4 flex flex-col items-center", combat.foeSwing && "rs-chop-foe")}
          >
            <span className="size-8 rounded-full bg-berry" />
            <span className="max-w-16 truncate text-[10px] font-bold text-ink">{who}</span>
          </div>
          {combat.splatOnPlayer != null ? (
            <p
              key={`sp-${combat.shake}`}
              className={cn(
                "splat-rise absolute bottom-6 left-14 font-display text-lg font-bold",
                combat.splatOnPlayer === "miss" ? "text-sky-700" : "text-berry",
              )}
            >
              {combat.splatOnPlayer === "miss" ? "0" : combat.splatOnPlayer === "heal" ? "+" : combat.splatOnPlayer}
            </p>
          ) : null}
          {combat.splatOnEnemy != null ? (
            <p
              key={`se-${combat.shake}`}
              className={cn(
                "splat-rise absolute bottom-6 right-16 font-display text-lg font-bold",
                combat.splatOnEnemy === "miss" ? "text-sky-700" : "text-berry",
              )}
            >
              {combat.splatOnEnemy === "miss" ? "0" : combat.splatOnEnemy}
            </p>
          ) : null}
        </div>

        <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.12em] text-bark/55">Combat style</p>
        <div className="mt-1 grid grid-cols-3 gap-1.5">
          {(
            [
              ["attack", "Attack", "Hits more often"],
              ["strength", "Strength", "Hits harder"],
              ["defence", "Defence", "You take less"],
            ] as const
          ).map(([id, label, hint]) => (
            <button
              key={id}
              type="button"
              onClick={() => setStyle(id)}
              className={cn(
                "rounded-[12px] px-1 py-1.5 text-center",
                style === id ? "bg-pine text-parchment" : "bg-parchment-dark text-ink",
              )}
            >
              <span className="block font-display text-xs font-semibold">{label}</span>
              <span className={cn("block text-[9px] font-bold", style === id ? "text-parchment/80" : "text-bark/55")}>{hint}</span>
            </button>
          ))}
        </div>

        <p className="mt-2 min-h-8 rounded-[12px] bg-parchment-dark/60 px-2.5 py-1.5 text-xs font-bold text-ink">
          {combat.log}
        </p>

        <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.12em] text-bark/55">This fight · XP</p>
        <table className="mt-1 w-full text-left">
          <thead>
            <tr className="text-[10px] font-bold uppercase tracking-wide text-bark/45">
              <th className="pb-0.5 font-bold">Skill</th>
              <th className="pb-0.5 font-bold">Lvl</th>
              <th className="pb-0.5 font-bold">Fight</th>
              <th className="pb-0.5 text-right font-bold">Next</th>
            </tr>
          </thead>
          <tbody>
            {COMBAT_SKILLS.map((id) => {
              const xp = skills[id];
              const lv = levelFromXp(xp);
              const gained = combat.sessionXp[id] ?? 0;
              const toNext = xpToNext(xp);
              const into = xp - xpForLevel(lv);
              const span = Math.max(1, xpForLevel(lv + 1) - xpForLevel(lv));
              const pct = lv >= 99 ? 100 : Math.min(100, (into / span) * 100);
              return (
                <tr key={id}>
                  <td className="py-0.5 pr-2">
                    <p className="font-display text-xs font-semibold text-ink">{SKILL_LABEL[id]}</p>
                    <div className="mt-0.5 h-1 overflow-hidden rounded-full bg-bark/15">
                      <div className="h-full rounded-full bg-gold" style={{ width: `${pct}%` }} />
                    </div>
                  </td>
                  <td className="py-0.5 font-display text-xs font-semibold tabular-nums text-ink">{lv}</td>
                  <td className="py-0.5 text-xs font-bold tabular-nums text-moss">
                    {gained > 0 ? `+${gained}` : "—"}
                  </td>
                  <td className="py-0.5 text-right text-[11px] font-bold tabular-nums text-bark/55">
                    {lv >= 99 ? "max" : toNext}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {over ? (
          <button
            type="button"
            onClick={end}
            className="mt-3 h-11 w-full rounded-[14px] bg-pine font-display text-sm font-semibold text-parchment"
          >
            {combat.phase === "won" ? "Back to the land" : "Wake up at the cottage"}
          </button>
        ) : (
          <div className="mt-3 grid grid-cols-4 gap-1.5">
            <button
              type="button"
              disabled={busy}
              onClick={attack}
              className="h-11 rounded-[14px] bg-berry font-display text-xs font-semibold text-parchment transition-transform duration-150 active:scale-[0.96] disabled:opacity-40"
            >
              Attack
            </button>
            <button
              type="button"
              disabled={busy || food < 1}
              onClick={eat}
              className="h-11 rounded-[14px] bg-parchment-dark font-display text-xs font-semibold text-ink disabled:opacity-40"
            >
              Eat ({food})
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => setPraying(!praying)}
              className={cn(
                "h-11 rounded-[14px] font-display text-xs font-semibold disabled:opacity-40",
                praying ? "bg-gold text-ink" : "bg-parchment-dark text-ink",
              )}
            >
              {praying ? "Prayer on" : "Pray"}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={flee}
              className="h-11 rounded-[14px] bg-parchment-dark font-display text-xs font-semibold text-ink disabled:opacity-40"
            >
              Flee
            </button>
          </div>
        )}
        {!over ? (
          <p className="mt-1.5 text-center text-[10px] font-bold uppercase tracking-wide text-bark/45">
            Auto-swinging · like the old school
          </p>
        ) : null}
      </div>
    </div>
  );
}
