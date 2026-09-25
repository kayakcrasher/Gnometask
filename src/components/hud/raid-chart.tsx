import { X } from "lucide-react";
import { useGame } from "@/lib/game/store";
import { ISLES, isleStands, ransomActive } from "@/lib/game/data/isles";
import { levelFromXp } from "@/lib/game/xp";

export function RaidChart() {
  const interior = useGame((s) => s.interior);
  const leave = useGame((s) => s.leaveInterior);
  const speak = useGame((s) => s.speak);
  const skills = useGame((s) => s.skills);
  const isles = useGame((s) => s.isles);
  const flags = useGame((s) => s.flagsPlanted ?? 0);
  const cottageLevel = useGame((s) => s.cottageLevel ?? 0);
  if (interior !== "chart") return null;
  const sailing = levelFromXp(skills.sailing);

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-pine/88 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:items-center">
      <div className="flex max-h-[88dvh] w-full max-w-lg flex-col rounded-[28px] bg-parchment p-4 shadow-panel">
        <div className="mb-2 flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-bark/55">Wim's ledger</p>
            <h2 className="font-display text-2xl font-semibold text-ink">The Chart</h2>
            <p className="mt-1 text-sm font-semibold text-bark/70">
              Sailing {sailing}. Flags planted: {flags}.
            </p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={leave}
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-parchment-dark text-ink"
          >
            <X className="size-4" />
          </button>
        </div>

        <ul className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
          {ISLES.map((isle) => {
            const cleared = isles?.[isle.id]?.cleared ?? 0;
            const locked = sailing < isle.sailNeed;
            const ransoming = isleStands(isle.id, isles) && ransomActive(cottageLevel);
            return (
              <li key={isle.id} className="rounded-[18px] bg-parchment-dark/60 px-3 py-3">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="min-w-0 flex-1 font-display text-base font-semibold text-ink">
                    {isle.name}
                  </p>
                  <p className="shrink-0 text-[11px] font-bold uppercase tracking-wide text-bark/55">
                    {isle.faction}
                  </p>
                </div>
                <p className="mt-1 text-[12px] font-semibold leading-snug text-bark/75">{isle.blurb}</p>
                <p className="mt-1.5 text-[11px] font-bold uppercase tracking-wide text-bark/55">
                  {cleared > 0 ? `Cleared ×${cleared}` : "Never cleared"} · Sailing {isle.sailNeed}+
                </p>
                {ransoming ? (
                  <p className="mt-1.5 rounded-[10px] bg-berry/15 px-2 py-1 text-[11px] font-bold text-berry">
                    ⚠ Ransom {isle.ransomPerDay} coins per day while this stands.
                  </p>
                ) : null}
                <button
                  type="button"
                  disabled={locked}
                  onClick={() =>
                    speak(
                      locked
                        ? `Wim: Not in this hull. Sailing ${isle.sailNeed} before ${isle.name}.`
                        : `Wim: ${isle.name} on the board. The crews aren't drilled yet — give me a day.`,
                    )
                  }
                  className={
                    locked
                      ? "mt-2 h-10 w-full rounded-[12px] bg-parchment text-[12px] font-semibold text-bark/40"
                      : "mt-2 h-10 w-full rounded-[12px] bg-gold font-display text-sm font-semibold text-ink"
                  }
                >
                  {locked ? `Sailing ${isle.sailNeed} needed` : `Sail · ${isle.name}`}
                </button>
              </li>
            );
          })}
        </ul>

        <button
          type="button"
          onClick={leave}
          className="mt-3 h-11 rounded-[14px] bg-parchment-dark font-display text-sm font-semibold text-ink"
        >
          Roll the chart up
        </button>
      </div>
    </div>
  );
}
