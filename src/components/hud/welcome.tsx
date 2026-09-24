import { useState } from "react";
import { useGame } from "@/lib/game/store";
import { unlockAudio } from "@/lib/game/juice";

const LESSONS = [
  "Tap the ground. Your boots do the rest. I'm on the dock.",
  "Come talk when you arrive. The first log is how a hollow starts.",
  "The shop buys a basket. The Exchange buys the whole sack. The bank sells shares — Gnome500 is the slow sure one. Deeds buy empty ground. A gnome's own floor is never for sale.",
  "Goblins grow by one each day. The watch ticks louder as they near. Wim bolts cannons on the boats for 45 coins.",
];

export function Coach() {
  const atHome = useGame((s) => s.atHome);
  const coach = useGame((s) => s.coach);
  const advance = useGame((s) => s.advanceCoach);
  if (atHome || coach < 1 || coach > LESSONS.length) return null;
  const last = coach === LESSONS.length;
  return (
    <div className="pointer-events-auto absolute inset-x-3 bottom-[5.5rem] z-30 mx-auto max-w-md rounded-[18px] bg-parchment p-3 shadow-panel">
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-bark/55">Ol Pappy</p>
      <p className="mt-1 text-sm font-semibold leading-snug text-ink">{LESSONS[coach - 1]}</p>
      <button
        type="button"
        onClick={advance}
        className="mt-2 h-10 w-full rounded-[12px] bg-pine font-display text-sm font-semibold text-parchment"
      >
        {last ? "I'll build" : "Onward"}
      </button>
    </div>
  );
}

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
      className="fixed inset-0 z-50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="home-title"
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0c1c33] via-[#1a5270] to-[#1c4a38]" />
      <div className="pointer-events-none absolute right-[12%] top-[11%] size-14 rounded-full bg-[#f4efe2]/90 shadow-[0_0_40px_12px_rgba(244,239,226,0.25)]" />
      <div className="pointer-events-none absolute right-[14%] top-[12%] size-11 rounded-full bg-[#0c1c33]" />
      <div className="pointer-events-none absolute inset-x-[-8%] bottom-0 h-[52%] rounded-t-[46%] bg-[#163828]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-[34%] h-20 bg-gradient-to-b from-[#7ed0c8]/0 via-[#7ed0c8]/80 to-[#1a8f96]/0" />
      <div className="pointer-events-none absolute bottom-[38%] left-[18%] h-14 w-16 rounded-t-[10px] bg-[#efe6d4]" />
      <div className="pointer-events-none absolute bottom-[46%] left-[19%] h-7 w-14 bg-[#a33b32]" style={{ clipPath: "polygon(0 100%, 50% 0, 100% 100%)" }} />
      <div className="pointer-events-none absolute bottom-[40%] left-[30%] h-24 w-2 rounded-sm bg-[#5b4230]" />
      <div className="pointer-events-none absolute bottom-[52%] left-[28.2%] h-5 w-6 bg-[#c9a227]" />
      <div className="pointer-events-none absolute bottom-[36%] right-[22%] h-10 w-16 rounded-md bg-[#c4894a]" />
      <div className="relative z-10 flex min-h-full flex-col items-center px-5 pb-8 pt-16">
        <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-parchment/70">A hollow to hold</p>
        <h1 id="home-title" className="mt-2 text-center font-display text-5xl font-semibold leading-none text-parchment sm:text-6xl">
          Hollow Watch
        </h1>
        <p className="mt-3 max-w-xs text-center text-sm font-semibold text-parchment/90">Build the shore. Keep the goblins off it.</p>
        <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.18em] text-gold">Build · Trade · Hold</p>
        <div className="mt-auto w-full max-w-sm rounded-[24px] bg-parchment/95 p-4 shadow-panel">

        {mode === "gate" ? (
          <div className="flex flex-col gap-3">
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
          <div className="flex flex-col gap-3">
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
          <div className="flex flex-col gap-3">
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
    </div>
  );
}
