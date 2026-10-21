import { useState } from "react";
import { useGame } from "@/lib/game/store";
import { unlockAudio } from "@/lib/game/juice";

export function Coach() {
  const s=useGame();
  if(s.atHome||s.bank.pending||s.combat||s.interior||s.coach<1||s.coach>=5)return null;
  return (
    <section aria-label="Welcome to Thimblehaven" className="pointer-events-auto absolute inset-x-3 bottom-[5.5rem] z-30 mx-auto max-w-md rounded-[20px] bg-parchment p-4 shadow-panel">
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-bark/55">Ol Pappy · A key for you</p>
      <h2 className="mt-1 font-display text-xl font-bold text-pine">Welcome home, {s.gnomeName}.</h2>
      <p className="mt-2 text-sm font-semibold leading-relaxed text-ink">“This is Thimblehaven. That little cottage is yours, and so is the town’s next chapter. The kettle’s on.”</p>
      <p className="mt-2 text-xs text-bark">Tap the ground to walk. Tap a building to visit. Your town council is there whenever you’re ready to build.</p>
      <button type="button" onClick={()=>{s.advanceCoach();s.enterInterior("cottage");}} className="mt-3 min-h-11 w-full rounded-xl bg-pine font-display text-sm font-bold text-parchment">Step into my home</button>
      <button type="button" onClick={s.advanceCoach} className="mt-1 min-h-11 w-full rounded-xl text-sm font-bold text-pine">Explore on my own</button>
    </section>
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
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#89bcb1] via-[#d5d5a3] to-[#496b4b]" />
      <div className="pointer-events-none absolute right-[12%] top-[11%] size-14 rounded-full bg-[#f4efe2]/90 shadow-[0_0_60px_20px_rgba(244,239,226,0.35)]" />
      <div className="pointer-events-none absolute inset-x-[-8%] bottom-0 h-[52%] rounded-t-[46%] bg-[#163828]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-[34%] h-20 bg-gradient-to-b from-[#7ed0c8]/0 via-[#7ed0c8]/80 to-[#1a8f96]/0" />
      <div className="pointer-events-none absolute bottom-[38%] left-[18%] h-14 w-16 rounded-t-[10px] bg-[#efe6d4]" />
      <div className="pointer-events-none absolute bottom-[46%] left-[19%] h-7 w-14 bg-[#a33b32]" style={{ clipPath: "polygon(0 100%, 50% 0, 100% 100%)" }} />
      <div className="pointer-events-none absolute bottom-[40%] left-[30%] h-24 w-2 rounded-sm bg-[#5b4230]" />
      <div className="pointer-events-none absolute bottom-[52%] left-[28.2%] h-5 w-6 bg-[#c9a227]" />
      <div className="pointer-events-none absolute bottom-[36%] right-[22%] h-10 w-16 rounded-md bg-[#c4894a]" />
      <div className="relative z-10 flex min-h-full flex-col items-center px-5 pb-8 pt-16">
        <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-pine/80">A little place to call home</p>
        <h1 id="home-title" className="mt-2 text-center font-display text-5xl font-semibold leading-none text-pine sm:text-6xl">
          Hollow Watch
        </h1>
        <p className="mt-3 max-w-xs text-center text-sm font-semibold text-pine">Find your feet. Make a home. Grow a town.</p>
        <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.18em] text-pine/80">Explore · Build · Belong</p>
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
            <p className="text-sm text-bark">A little northern harbour is waiting for someone to call it home. Pappy has saved you a key.</p>
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
              Go to Thimblehaven
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
