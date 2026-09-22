import { METRICS } from "@/lib/game/types";
import { cn } from "@/lib/utils";
import { useGame } from "@/lib/game/store";

export function MetricSwitcher() {
  const metric = useGame((s) => s.metric);
  const setMetric = useGame((s) => s.setMetric);

  return (
    <div className="pointer-events-none absolute bottom-20 left-3 z-20 md:bottom-6 md:left-4">
      <div className="pointer-events-auto flex gap-1 rounded-[14px] bg-parchment/95 p-1 shadow-panel">
        {METRICS.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setMetric(m.id)}
            className={cn(
              "h-9 rounded-[10px] px-3 font-display text-xs font-semibold transition-colors duration-150",
              metric === m.id ? "bg-pine text-parchment" : "text-ink",
            )}
          >
            {m.name}
          </button>
        ))}
      </div>
    </div>
  );
}
