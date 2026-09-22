import { X } from "lucide-react";
import { useGame } from "@/lib/game/store";
import { METRICS } from "@/lib/game/types";
import { cn } from "@/lib/utils";
import type { DragonHorn, DragonLook } from "@/lib/game/types";

const LOOKS: { id: DragonLook; label: string }[] = [
  { id: "ember", label: "Ember" },
  { id: "moss", label: "Moss" },
  { id: "night", label: "Night" },
  { id: "gold", label: "Gold" },
];
const HORNS: { id: DragonHorn; label: string }[] = [
  { id: "short", label: "Short" },
  { id: "long", label: "Long" },
  { id: "crown", label: "Crown" },
];

export function MenuView() {
  const panel = useGame((s) => s.panel);
  const setPanel = useGame((s) => s.setPanel);
  const dragon = useGame((s) => s.lifeDragon);
  const setDragonLook = useGame((s) => s.setDragonLook);
  const newLifeDragon = useGame((s) => s.newLifeDragon);
  const metric = useGame((s) => s.metric);
  const setMetric = useGame((s) => s.setMetric);
  const fortLevel = useGame((s) => s.fortLevel);
  const guardLevel = useGame((s) => s.guardLevel);
  const absencePending = useGame((s) => s.absencePending);

  if (panel !== "menu") return null;

  return (
    <div className="absolute inset-0 z-30" onClick={() => setPanel("place")}>
      <div
        className="absolute inset-x-3 bottom-3 mx-auto max-h-[78dvh] w-full max-w-md overflow-y-auto rounded-[24px] bg-parchment p-4 shadow-panel md:inset-x-auto md:bottom-6 md:right-4 md:top-24 md:w-[22rem]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center gap-2">
          <h2 className="flex-1 font-display text-xl font-semibold text-ink">The thing you face</h2>
          <button
            type="button"
            aria-label="Close"
            onClick={() => setPanel("place")}
            className="flex size-9 items-center justify-center rounded-full bg-parchment-dark text-ink"
          >
            <X className="size-4" />
          </button>
        </div>
        <p className="text-sm font-semibold text-bark/70">
          {dragon.name} · {dragon.state} · {dragon.hp} heart. Forts {fortLevel}/5. Guard {guardLevel}/5.
          {absencePending ? " A fat blue dragon is waiting at the dock." : ""}
        </p>
        <input
          value={dragon.name}
          onChange={(e) => setDragonLook({ name: e.target.value })}
          maxLength={18}
          className="mt-3 h-11 w-full rounded-[14px] bg-parchment-dark/70 px-3 font-semibold text-ink outline-none ring-gold focus:ring-2"
        />
        <div className="mt-2 flex gap-1">
          {LOOKS.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => setDragonLook({ look: l.id })}
              className={cn(
                "h-10 flex-1 rounded-[12px] font-display text-xs font-semibold",
                dragon.look === l.id ? "bg-pine text-parchment" : "bg-parchment-dark text-ink",
              )}
            >
              {l.label}
            </button>
          ))}
        </div>
        <div className="mt-2 flex gap-1">
          {HORNS.map((h) => (
            <button
              key={h.id}
              type="button"
              onClick={() => setDragonLook({ horn: h.id })}
              className={cn(
                "h-10 flex-1 rounded-[12px] font-display text-xs font-semibold",
                dragon.horn === h.id ? "bg-pine text-parchment" : "bg-parchment-dark text-ink",
              )}
            >
              {h.label}
            </button>
          ))}
        </div>
        {dragon.state === "defeated" ? (
          <button
            type="button"
            onClick={newLifeDragon}
            className="mt-3 h-11 w-full rounded-[14px] bg-berry font-display text-sm font-semibold text-parchment"
          >
            Face a new dragon
          </button>
        ) : null}
        <p className="mt-4 text-[11px] font-bold uppercase tracking-wide text-bark/50">Land colour</p>
        <div className="mt-1 flex gap-1">
          {METRICS.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMetric(m.id)}
              className={cn(
                "h-10 flex-1 rounded-[12px] font-display text-xs font-semibold",
                metric === m.id ? "bg-pine text-parchment" : "bg-parchment-dark text-ink",
              )}
            >
              {m.name}
            </button>
          ))}
        </div>
        <p className="mt-4 text-sm font-semibold leading-snug text-bark/70">
          Click the land or the round map to walk. Drag to turn the camera. Scroll zooms. Walk into a shop to go inside. Chop a tree with a hatchet. The garden rat is a polite first fight.
        </p>
      </div>
    </div>
  );
}
