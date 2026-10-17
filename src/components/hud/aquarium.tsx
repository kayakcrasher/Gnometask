import { useGame } from "@/lib/game/store";
import {
  FISH,
  AQUARIUM_CAPACITY,
  AQUARIUM_COST,
  tankCount,
} from "@/lib/game/data/fish";
export function Aquarium() {
  const s = useGame(),
    total = tankCount(s.tank),
    capacity = AQUARIUM_CAPACITY[s.aquariumLevel] ?? 0,
    cost = AQUARIUM_COST[s.aquariumLevel];
  const visible = FISH.flatMap((f) =>
    Array.from({ length: Math.min(s.tank[f.id] ?? 0, 3) }, (_, i) => ({
      ...f,
      key: `${f.id}-${i}`,
    })),
  ).slice(0, 24);
  return (
    <section
      aria-label="Aquarium"
      className="rounded-2xl bg-parchment-dark/60 p-3"
    >
      <h2 className="font-display text-lg font-bold">
        Aquarium · {total}/{capacity} fish
      </h2>
      <p className="text-xs text-bark">
        {FISH.filter((f) => (s.tank[f.id] ?? 0) > 0).length}/{FISH.length}{" "}
        species collected. Your home and town hall show the same collection.
      </p>
      <div
        role="img"
        aria-label={`${total} fish in your aquarium`}
        className="relative mt-2 h-44 overflow-hidden rounded-xl border-4 border-[#527c83] bg-gradient-to-b from-[#326c80] to-[#142f40]"
      >
        <style>{`@keyframes aquarium-swim{0%{left:0;transform:scaleX(1)}49%{left:calc(100% - 44px);transform:scaleX(1)}50%{left:calc(100% - 44px);transform:scaleX(-1)}100%{left:0;transform:scaleX(-1)}}@media(prefers-reduced-motion:reduce){.aquarium-fish{animation:none!important;left:40%!important}}`}</style>
        <div className="absolute inset-x-0 bottom-0 h-4 bg-[#baaa7d]" />
        {[15, 45, 78].map((x) => (
          <div
            key={x}
            className="absolute bottom-3 h-10 w-2 rounded-t-full bg-[#558b65]"
            style={{
              left: `${x}%`,
              transform: `rotate(${x % 2 ? 12 : -12}deg)`,
            }}
          />
        ))}
        {!visible.length && (
          <p className="absolute inset-0 flex items-center justify-center px-4 text-center text-xs text-white">
            {capacity
              ? "Catch fish, then choose Keep below."
              : "Set up your aquarium to start your collection."}
          </p>
        )}
        {visible.map((f, i) => (
          <svg
            key={f.key}
            className="aquarium-fish absolute"
            width="44"
            height="22"
            viewBox="0 0 44 22"
            style={{
              top: 8 + ((i * 29) % 120),
              animation: `aquarium-swim ${9 + (i % 7)}s linear -${i * 1.7}s infinite`,
            }}
          >
            <title>{f.name}</title>
            <path d="M5 11L0 3V19Z" fill={f.shadow} />
            <ellipse cx="23" cy="11" rx="16" ry="8" fill={f.color} />
            <path d="M16 5L22 0L28 5" fill={f.shadow} />
            <circle cx="33" cy="9" r="1.7" fill="#14262e" />
          </svg>
        ))}
      </div>
      {total > 24 && (
        <p className="mt-1 text-xs">
          Showing a sample of your collection; every fish is listed below.
        </p>
      )}
      {cost !== undefined && (
        <button
          type="button"
          disabled={s.coins < cost || !!s.combat}
          onClick={s.upgradeAquarium}
          className="mt-2 min-h-11 w-full rounded-xl bg-gold px-3 text-xs font-bold disabled:opacity-40"
        >
          {capacity ? "Expand" : "Set up"} aquarium · {cost} coins ·{" "}
          {AQUARIUM_CAPACITY[s.aquariumLevel + 1]} spaces
        </button>
      )}
      <ul className="mt-2 space-y-2">
        {FISH.filter(
          (f) => (s.fishBag[f.id] ?? 0) > 0 || (s.tank[f.id] ?? 0) > 0,
        ).map((f) => (
          <li key={f.id} className="rounded-xl bg-white/40 p-2">
            <p className="text-xs font-bold">
              {f.name} · bag {s.fishBag[f.id] ?? 0} · aquarium{" "}
              {s.tank[f.id] ?? 0}
            </p>
            <div className="mt-1 flex gap-2">
              <button
                type="button"
                disabled={
                  !(s.fishBag[f.id] > 0) || !capacity || total >= capacity
                }
                onClick={() => s.stockFish(f.id)}
                className="min-h-11 rounded-xl bg-pine px-3 text-xs text-white disabled:opacity-40"
              >
                Keep {f.name}
              </button>
              <button
                type="button"
                disabled={!(s.tank[f.id] > 0)}
                onClick={() => s.returnFish(f.id)}
                className="min-h-11 rounded-xl bg-parchment-dark px-3 text-xs disabled:opacity-40"
              >
                Return to bag
              </button>
            </div>
          </li>
        ))}
      </ul>
      <p role="status" className="mt-2 text-xs font-semibold">
        {s.speech}
      </p>
    </section>
  );
}
