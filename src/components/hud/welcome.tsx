import { useState } from "react";
import { useGame } from "@/lib/game/store";
import { unlockAudio } from "@/lib/game/juice";

export function Welcome() {
  const atHome = useGame((s) => s.atHome);
  const hydrated = useGame((s) => s.hydrated);
  const named = useGame((s) => s.named);
  const gnomeName = useGame((s) => s.gnomeName);
  const coins = useGame((s) => s.coins);
  const continueGame = useGame((s) => s.continueGame);
  const beginGame = useGame((s) => s.beginGame);
  const [mode, setMode] = useState<"gate" | "confirm" | "name">("gate");
  const [draft, setDraft] = useState("");

  if (!atHome) return null;

  const hasSave = hydrated && named && Boolean(gnomeName);
  const audio = () => {
    try {
      unlockAudio();
    } catch {
      /* audio optional */
    }
  };

  const start = () => {
    audio();
    beginGame(draft);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-pine/55 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="home-title"
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className="w-full max-w-md rounded-[28px] bg-parchment p-6 shadow-panel">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-bark/55">Hollow Watch</p>
        <h1 id="home-title" className="mt-1 font-display text-4xl font-semibold leading-none text-ink">
          The hollow
        </h1>
        <p className="mt-2 text-sm font-semibold leading-relaxed text-bark/75">
          A defence island that grows as you play. You step off at the dock. Ol Pappy is waiting there. Ember stays hidden until the hall is level 3.
        </p>

        {mode === "gate" ? (
          <div className="mt-6 flex flex-col gap-3">
            <button
              type="button"
              disabled={!hasSave}
              onClick={() => {
                audio();
                continueGame();
              }}
              className="h-12 rounded-[14px] bg-pine font-display text-base font-semibold text-parchment transition-transform duration-150 active:scale-[0.96] disabled:opacity-40"
            >
              {hasSave ? `Continue — ${gnomeName}` : hydrated ? "No save yet" : "Looking for a save…"}
            </button>
            {hasSave ? (
              <p className="text-center text-xs font-semibold text-bark/55">{coins} coins in the purse</p>
            ) : null}
            <button
              type="button"
              onClick={() => {
                audio();
                setMode(hasSave ? "confirm" : "name");
              }}
              className="h-12 rounded-[14px] bg-gold font-display text-base font-semibold text-ink transition-transform duration-150 active:scale-[0.96]"
            >
              New game
            </button>
          </div>
        ) : null}

        {mode === "confirm" ? (
          <div className="mt-6 flex flex-col gap-3">
            <p className="text-sm font-semibold leading-relaxed text-ink">
              Start a new hollow? {gnomeName}'s save will be replaced.
            </p>
            <button
              type="button"
              onClick={() => setMode("name")}
              className="h-12 rounded-[14px] bg-berry font-display text-base font-semibold text-parchment"
            >
              Yes, start over
            </button>
            <button
              type="button"
              onClick={() => setMode("gate")}
              className="h-12 rounded-[14px] bg-parchment-dark font-display text-sm font-semibold text-ink"
            >
              Back
            </button>
          </div>
        ) : null}

        {mode === "name" ? (
          <div className="mt-6 flex flex-col gap-3">
            <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-bark/55" htmlFor="gnome-name">
              Your name
            </label>
            <input
              id="gnome-name"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  start();
                }
              }}
              maxLength={24}
              placeholder="Pip, Thistle, Moss…"
              autoComplete="off"
              enterKeyHint="done"
              className="h-12 rounded-[14px] bg-parchment-dark/70 px-4 font-semibold text-ink outline-none ring-gold focus:ring-2"
              suppressHydrationWarning
            />
            <button
              type="button"
              onClick={start}
              className="h-12 rounded-[14px] bg-pine font-display text-base font-semibold text-parchment transition-transform duration-150 active:scale-[0.96]"
            >
              Start the hollow
            </button>
            <button
              type="button"
              onClick={() => setMode("gate")}
              className="h-12 rounded-[14px] bg-parchment-dark font-display text-sm font-semibold text-ink"
            >
              Back
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
