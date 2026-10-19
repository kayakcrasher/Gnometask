import { useGame } from "@/lib/game/store";
import {
  COMBAT_TICK_MS,
  MAX_STAMINA,
  PLAYER_ATTACK_TICKS,
  enemyAttackTicks,
} from "@/lib/game/combat";
import { cn } from "@/lib/utils";
import { COMBAT_SKILLS, SKILL_LABEL, levelFromXp } from "@/lib/game/xp";
function Health({
  label,
  value,
  max,
  enemy = false,
}: {
  label: string;
  value: number;
  max: number;
  enemy?: boolean;
}) {
  return (
    <div>
      <div className="mb-1 flex justify-between gap-1 text-xs font-bold">
        <span className="truncate">{label}</span>
        <span>
          {value}/{max}
        </span>
      </div>
      <div
        role="progressbar"
        aria-label={`${label} health`}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        className="h-2.5 overflow-hidden rounded-full bg-bark/15"
      >
        <div
          className={cn(
            "h-full rounded-full transition-[width]",
            enemy ? "bg-berry" : "bg-moss",
          )}
          style={{ width: `${Math.max(0, (100 * value) / Math.max(1, max))}%` }}
        />
      </div>
    </div>
  );
}
export function CombatView() {
  const s = useGame(),
    c = s.combat;
  if (!c) return null;
  const over = c.phase === "won" || c.phase === "lost",
    peaceful = c.enemyId === "dragon" && s.honey > 0,
    foodWait = Math.max(0, c.foodReadyTick - c.tick),
    guardWait = Math.max(0, c.guardReadyTick - c.tick),
    gains = COMBAT_SKILLS.filter((id) => c.sessionXp[id] > 0);
  const seconds = (ticks: number) =>
      ((ticks * COMBAT_TICK_MS) / 1000).toFixed(1),
    button =
      "min-h-12 rounded-xl px-3 py-2 text-xs font-bold disabled:opacity-40";
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-40 flex justify-center p-2 pb-[max(.5rem,env(safe-area-inset-bottom))] sm:p-3">
      <section
        aria-label="Combat"
        className="pointer-events-auto max-h-[62dvh] w-full max-w-lg overflow-y-auto rounded-2xl bg-parchment p-3 text-ink shadow-panel"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wide text-bark/70">
              {over
                ? c.phase === "lost"
                  ? "Defeated"
                  : c.pacified
                    ? "Peace made"
                    : "Victory"
                : c.retreating
                  ? "Retreating"
                  : c.autoAttack
                    ? "Engaged · automatic attacks"
                    : "Attacks stopped · enemy still active"}
            </p>
            <h2 className="truncate font-display text-lg font-bold">
              {c.enemyId === "dragon" ? s.lifeDragon.name : c.name}
            </h2>
          </div>
          {!over && !c.retreating && (
            <button
              type="button"
              className={`${button} shrink-0 bg-parchment-dark`}
              onClick={() => s.setCombatAuto(!c.autoAttack)}
            >
              {c.autoAttack ? "Stop attacking" : "Resume attacks"}
            </button>
          )}
        </div>
        <div className="mt-2 grid grid-cols-2 gap-3">
          <Health label="You" value={c.playerHp} max={c.playerMax} />
          <Health label={c.name} value={c.enemyHp} max={c.enemyMax} enemy />
        </div>
        {!over && (
          <div className="mt-2 grid grid-cols-2 gap-3 text-[10px] font-semibold text-bark">
            <div>
              Your next hit ·{" "}
              {c.autoAttack
                ? `${seconds(Math.max(0, c.nextAttackTick - c.tick))}s`
                : "stopped"}
              <progress
                aria-label="Your attack timer"
                max={PLAYER_ATTACK_TICKS}
                value={Math.max(
                  0,
                  PLAYER_ATTACK_TICKS - (c.nextAttackTick - c.tick),
                )}
                className="mt-1 block h-1.5 w-full"
              />
            </div>
            <div>
              Enemy hit · {seconds(Math.max(0, c.nextEnemyTick - c.tick))}s
              <progress
                aria-label="Enemy attack timer"
                max={enemyAttackTicks(c.enemyId)}
                value={Math.max(
                  0,
                  enemyAttackTicks(c.enemyId) - (c.nextEnemyTick - c.tick),
                )}
                className="mt-1 block h-1.5 w-full"
              />
            </div>
          </div>
        )}
        <p
          role="status"
          aria-live="polite"
          className="mt-2 rounded-xl bg-parchment-dark/60 px-2 py-2 text-xs font-semibold"
        >
          {c.log}
        </p>
        {over ? (
          <>
            {c.loot && (
              <p className="mt-2 text-sm font-bold text-moss">
                +{c.loot.coins} coins · {c.loot.bones} bones
              </p>
            )}
            <ul className="mt-2 grid grid-cols-2 gap-1">
              {gains.map((id) => (
                <li
                  key={id}
                  className="rounded-lg bg-parchment-dark/40 px-2 py-1 text-xs"
                >
                  {SKILL_LABEL[id]} · Lv {levelFromXp(s.skills[id])}{" "}
                  <strong>+{c.sessionXp[id]} XP</strong>
                </li>
              ))}
            </ul>
            <button
              type="button"
              className={`${button} mt-2 w-full bg-pine text-parchment`}
              onClick={s.combatEnd}
            >
              {c.phase === "lost"
                ? "Recover at your home"
                : "Continue exploring"}
            </button>
          </>
        ) : (
          <>
            {c.enemyIntent.kind !== "strike" && (
              <p className="mt-1 text-xs font-bold text-berry">
                Preparing {c.enemyIntent.label.toLowerCase()} · guard before it
                lands
              </p>
            )}
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button
                type="button"
                className={`${button} bg-gold`}
                disabled={
                  foodWait > 0 ||
                  s.bread + s.honey < 1 ||
                  (!peaceful && c.playerHp >= c.playerMax)
                }
                onClick={s.combatEat}
              >
                {peaceful
                  ? "Offer cake"
                  : foodWait
                    ? `Food ready in ${seconds(foodWait)}s`
                    : `Eat · ${s.bread + s.honey} food`}
              </button>
              <button
                type="button"
                className={`${button} bg-pine text-parchment`}
                disabled={guardWait > 0 || c.guarding || c.retreating}
                onClick={s.combatGuard}
              >
                {c.guarding
                  ? "Guard raised"
                  : guardWait
                    ? `Guard · ${seconds(guardWait)}s`
                    : "Guard next hit"}
              </button>
              <button
                type="button"
                className={`${button} bg-berry text-parchment`}
                disabled={
                  c.stamina < 2 || c.retreating || c.queuedMove === "power"
                }
                onClick={() => s.combatAttack("power")}
              >
                {c.queuedMove === "power"
                  ? "Power strike queued"
                  : `Power strike · ${c.stamina}/${MAX_STAMINA} energy`}
              </button>
              <button
                type="button"
                className={`${button} bg-parchment-dark`}
                disabled={c.retreating}
                onClick={s.combatFlee}
              >
                {c.retreating ? "Escaping…" : "Retreat"}
              </button>
            </div>
            <details className="mt-2">
              <summary className="min-h-8 cursor-pointer text-xs font-bold">
                Training {SKILL_LABEL[s.combatStyle]} · change style
              </summary>
              <div className="mt-1 grid grid-cols-3 gap-1">
                {(["attack", "strength", "defence"] as const).map((id) => (
                  <button
                    type="button"
                    key={id}
                    aria-pressed={s.combatStyle === id}
                    className={cn(
                      button,
                      s.combatStyle === id
                        ? "bg-pine text-parchment"
                        : "bg-parchment-dark",
                    )}
                    onClick={() => s.setCombatStyle(id)}
                  >
                    {SKILL_LABEL[id]}
                  </button>
                ))}
              </div>
            </details>
            <p className="mt-1 text-center text-[10px] text-bark/75">
              Tap an enemy once to fight. Eating delays your next hit. Tap
              ground to retreat.
            </p>
          </>
        )}
      </section>
    </div>
  );
}
