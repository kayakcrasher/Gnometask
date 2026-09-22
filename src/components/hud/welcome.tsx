import { useState } from "react";
import { useGame } from "@/lib/game/store";
import { unlockAudio } from "@/lib/game/juice";
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

export function Welcome() {
  const named = useGame((s) => s.named);
  const setName = useGame((s) => s.setName);
  const setDragonLook = useGame((s) => s.setDragonLook);
  const dragon = useGame((s) => s.lifeDragon);
  const [draft, setDraft] = useState("");
  const [step, setStep] = useState<"name" | "dragon">("name");
  const [pendingName, setPendingName] = useState("Pip");

  if (named) return null;

  const audio = () => {
    try {
      unlockAudio();
    } catch {
      /* audio optional */
    }
  };

  const wake = (fallback = false) => {
    audio();
    const name = (fallback ? "Pip" : draft.trim()) || "Pip";
    if (fallback) {
      setName(name);
      return;
    }
    setPendingName(name);
    setStep("dragon");
  };

  const enterLand = () => {
    audio();
    setName(pendingName);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-pine/80 p-4 pt-[min(10vh,4.5rem)] pb-[max(1.5rem,env(safe-area-inset-bottom))]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="wake-title"
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className="w-full max-w-md rounded-[28px] bg-parchment p-6 shadow-panel">
        {step === "name" ? (
          <>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-bark/55">Welcome to the hollow</p>
            <h2 id="wake-title" className="mt-1 font-display text-3xl font-semibold leading-none text-ink">
              Name your gnome
            </h2>
            <p className="mt-2 text-sm font-semibold leading-relaxed text-bark/75">
              Click the land — or the round map — to walk. Drag to look around. Scroll zooms.
              Chop trees, step into shops, start with the garden rat. No keys required.
            </p>
            <div className="mt-5 flex flex-col gap-3">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    wake();
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
                id="wake-up"
                type="button"
                onClick={() => wake()}
                className="h-12 rounded-[14px] bg-pine font-display text-base font-semibold text-parchment transition-transform duration-150 active:scale-[0.96]"
              >
                Next — the dragon
              </button>
              <button
                id="skip-pip"
                type="button"
                onClick={() => wake(true)}
                className="h-12 rounded-[14px] bg-gold font-display text-sm font-semibold text-ink transition-transform duration-150 active:scale-[0.96]"
              >
                Skip — call me Pip
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-bark/55">The thing you are facing</p>
            <h2 id="wake-title" className="mt-1 font-display text-3xl font-semibold leading-none text-ink">
              Name your dragon
            </h2>
            <p className="mt-2 text-sm font-semibold leading-relaxed text-bark/75">
              A ridge of heart and fire. Forts can beat it. Change this later in the menu.
            </p>
            <input
              value={dragon.name}
              onChange={(e) => setDragonLook({ name: e.target.value })}
              maxLength={18}
              className="mt-4 h-12 w-full rounded-[14px] bg-parchment-dark/70 px-4 font-semibold text-ink outline-none ring-gold focus:ring-2"
              suppressHydrationWarning
            />
            <p className="mt-3 text-[11px] font-bold uppercase tracking-wide text-bark/55">Colour</p>
            <div className="mt-1 flex gap-1">
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
            <p className="mt-3 text-[11px] font-bold uppercase tracking-wide text-bark/55">Horns</p>
            <div className="mt-1 flex gap-1">
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
            <button
              type="button"
              onClick={enterLand}
              className="mt-5 h-12 w-full rounded-[14px] bg-pine font-display text-base font-semibold text-parchment"
            >
              Wake up
            </button>
          </>
        )}
      </div>
    </div>
  );
}
