import { Arrival } from "@/components/intro/arrival";
import { HarbourStory } from "@/components/intro/harbour-story";
import { useSound } from "@/lib/game/audio/settings";
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
  const [mode, setMode] = useState<"gate" | "confirm" | "name" | "arrival">("gate");
  const [draft, setDraft] = useState("");
  const muted=useSound(s=>s.muted), unlocked=useSound(s=>s.unlocked), music=useSound(s=>s.music);

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
    setMode("arrival");
  };

  if(mode==="arrival")return <Arrival name={draft.trim()||"Pip"} onComplete={()=>{setMode("gate");beginGame(draft);}}/>;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="home-title"
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className="pointer-events-none absolute inset-0"><HarbourStory/></div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#102b43]/70 via-transparent to-[#122f43]/95"/>
      <div className="relative z-10 flex min-h-full flex-col items-center px-5 pb-6 pt-12">
        <div className="mb-8 flex w-full max-w-sm items-center justify-between gap-3">
          <p className="text-[9px] font-bold uppercase tracking-[.25em] text-[#efdaac]">A little wonder awaits</p>
          <button type="button" onClick={()=>{audio();useSound.getState().setSound(unlocked&&!muted&&music>0?{muted:true}:{muted:false,selection:"auto",music:music||.45});}} className="min-h-11 rounded-full border border-[#ead8b4]/30 bg-[#153349]/70 px-3 text-xs font-semibold text-[#f0e4cb]">{unlocked&&!muted&&music>0?'Mute theme':'Hear the theme'}</button>
        </div>
        <p className="text-[10px] font-bold uppercase tracking-[.32em] text-[#efdaac]">A home beyond the horizon</p>
        <h1 id="home-title" className="mt-2 text-center font-display text-5xl font-semibold leading-none text-[#fff0ce] drop-shadow-lg sm:text-6xl">Hollow Watch</h1>
        <p className="mt-3 max-w-xs text-center text-sm font-semibold text-[#f3e6cd]">Small beginnings. A world of possibilities.</p>
        <div className="mt-auto w-full max-w-sm rounded-[24px] border border-[#eedbb1]/40 bg-[#f4e9d3]/95 p-4 shadow-panel">

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
            <p className="text-sm text-bark">Your ship is nearly in. Tell Pappy who to look for on the quay.</p>
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
              Begin the journey
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
        <p className="mt-3 text-center text-[10px] tracking-wide text-[#e8dcc2]/80">Original theme · A Light Across the Water</p>
      </div>
    </div>
  );
}
