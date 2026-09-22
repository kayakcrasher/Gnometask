import { useGame } from "@/lib/game/store";

export function Speech() {
  const speech = useGame((s) => s.speech);
  const bounceKey = useGame((s) => s.bounceKey);
  const panel = useGame((s) => s.panel);
  const combat = useGame((s) => s.combat);
  const interior = useGame((s) => s.interior);
  if (interior || panel !== "place") return null;
  const line = combat ? combat.log : speech;
  return (
    <div className="pointer-events-none absolute left-3 top-[4.75rem] z-20 max-w-[min(100%-1.5rem,22rem)] md:top-[5.25rem]">
      <div
        key={bounceKey + line}
        className="slide-up pointer-events-none relative rounded-[18px] bg-parchment px-3.5 py-2.5 shadow-panel"
      >
        <span className="absolute -bottom-2 left-6 size-0 border-x-8 border-t-8 border-x-transparent border-t-parchment" />
        <p className="text-sm font-bold leading-snug text-ink">{line}</p>
      </div>
    </div>
  );
}
