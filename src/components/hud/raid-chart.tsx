import { X, Flag, Skull } from "lucide-react";
import { useGame } from "@/lib/game/store";
import { ISLES, raidLoot } from "@/lib/game/data/isles";
import { boatById } from "@/lib/game/data/boats";
import { raidAccess } from "@/lib/game/raid-state";
import { CATALOG_BY_ID } from "@/lib/game/catalog";
import { levelFromXp } from "@/lib/game/xp";

export function RaidChart() {
  const s = useGame();
  if (s.interior !== "chart") return null;
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-pine/90 p-3 md:items-center">
      <section
        aria-label="Enemy islands"
        className="flex max-h-[88dvh] w-full max-w-xl flex-col rounded-3xl bg-parchment p-4 shadow-panel"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-bark/60">
              Wim's sea chart
            </p>
            <h2 className="font-display text-2xl font-semibold text-ink">
              Enemy islands
            </h2>
            <p className="mt-1 text-xs font-semibold text-bark/70">
              Sailing {levelFromXp(s.skills.sailing)} · {s.flagsPlanted ?? 0}{" "}
              flags planted
            </p>
          </div>
          <button
            type="button"
            aria-label="Close enemy islands"
            onClick={s.leaveInterior}
            className="flex size-11 items-center justify-center rounded-full bg-parchment-dark text-ink"
          >
            <X className="size-4" />
          </button>
        </div>
        <p className="my-3 text-xs leading-relaxed text-bark/75">
          Sail from the harbour or your own boat. Defeat the crew, challenge
          their leader, and open the chest. Your progress survives a retreat.
        </p>
        <ul className="min-h-0 space-y-3 overflow-y-auto">
          {ISLES.map((isle) => {
            const { boat, reason } = raidAccess(s, isle);
            const cleared = s.isles[isle.id]?.cleared ?? 0;
            const progress = s.raidProgress[isle.id];
            const loot = raidLoot(isle.id, cleared);
            const drop = loot.drop ? CATALOG_BY_ID[loot.drop] : null;
            const resume =
              progress && !progress.claimed && progress.defeated.length > 0;
            return (
              <li
                key={isle.id}
                className="rounded-2xl bg-parchment-dark/60 p-3 text-ink"
              >
                <div className="flex items-center gap-2">
                  {isle.raidsWith === "pirate" ? (
                    <Skull className="size-4 shrink-0 text-berry" />
                  ) : (
                    <Flag className="size-4 shrink-0 text-pine" />
                  )}
                  <h3 className="flex-1 font-display text-lg font-semibold">
                    {isle.name}
                  </h3>
                  <span className="text-[10px] font-bold text-bark/65">
                    {cleared ? `Cleared ${cleared}×` : "Unclaimed"}
                  </span>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-bark/60">
                  {isle.faction}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-bark/80">
                  {isle.blurb}
                </p>
                <p className="mt-2 text-xs font-semibold">
                  Sailing {isle.sailNeed} · {boatById(isle.boatNeed)?.name}+ ·{" "}
                  {isle.defenders.length} crew + leader
                </p>
                <p className="mt-1 text-xs font-bold text-moss">
                  Chest: {loot.coins} coins · {loot.bones} bones
                  {drop ? ` · ${drop.name}` : ""}
                </p>
                {resume && (
                  <p className="mt-1 text-xs font-semibold text-pine">
                    Saved progress: {progress.defeated.length}/
                    {isle.defenders.length + 1} enemies defeated
                  </p>
                )}
                <button
                  type="button"
                  disabled={Boolean(reason)}
                  onClick={() => s.raidIsle(isle.id)}
                  className="mt-3 min-h-11 w-full rounded-xl bg-gold px-3 text-sm font-bold disabled:bg-parchment disabled:text-bark/55"
                >
                  {reason ??
                    `${resume ? "Resume" : "Sail to"} ${isle.name} · ${boat?.name}`}
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
