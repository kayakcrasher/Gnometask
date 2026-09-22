import { X } from "lucide-react";
import { CATALOG, CATALOG_BY_ID } from "@/lib/game/catalog";
import { useGame } from "@/lib/game/store";
import { cn } from "@/lib/utils";
import type { EquipSlot } from "@/lib/game/types";
import {
  SKILL_LABEL,
  SKILL_ORDER,
  combatLevel,
  levelFromXp,
  xpForLevel,
  xpToNext,
} from "@/lib/game/xp";
import { QUEST_BY_ID } from "@/lib/game/quests";

const SLOTS: { id: EquipSlot; label: string }[] = [
  { id: "weapon", label: "Hand" },
  { id: "shield", label: "Shield" },
  { id: "armor", label: "Armour" },
  { id: "tool", label: "Tool" },
];

export function InventoryView() {
  const panel = useGame((s) => s.panel);
  const setPanel = useGame((s) => s.setPanel);
  const equipment = useGame((s) => s.equipment);
  const ownedGear = useGame((s) => s.ownedGear);
  const ownedHats = useGame((s) => s.ownedHats);
  const hat = useGame((s) => s.hat);
  const honey = useGame((s) => s.honey);
  const bread = useGame((s) => s.bread);
  const equipGear = useGame((s) => s.equipGear);
  const equipHat = useGame((s) => s.equipHat);
  const fortLevel = useGame((s) => s.fortLevel);
  const guardLevel = useGame((s) => s.guardLevel);
  const skills = useGame((s) => s.skills);
  const quests = useGame((s) => s.quests);
  const pieHeld = useGame((s) => s.pieHeld);
  const chickenHeld = useGame((s) => s.chickenHeld);
  const logs = useGame((s) => s.logs);

  if (panel !== "inventory") return null;
  const cmb = combatLevel(skills);

  return (
    <div className="absolute inset-0 z-30" onClick={() => setPanel("place")}>
      <div
        className="absolute inset-x-3 bottom-3 mx-auto max-h-[78dvh] w-full max-w-md overflow-y-auto rounded-[24px] bg-parchment p-4 shadow-panel md:inset-x-auto md:bottom-6 md:right-4 md:top-24 md:w-[22rem]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center gap-2">
          <h2 className="flex-1 font-display text-xl font-semibold text-ink">Satchel</h2>
          <span className="rounded-full bg-pine px-2.5 py-1 font-display text-xs font-semibold text-parchment">
            Combat {cmb}
          </span>
          <button
            type="button"
            aria-label="Close"
            onClick={() => setPanel("place")}
            className="flex size-9 items-center justify-center rounded-full bg-parchment-dark text-ink"
          >
            <X className="size-4" />
          </button>
        </div>
        <p className="text-xs font-bold uppercase tracking-wide text-bark/50">Skills</p>
        <ul className="mt-1 flex flex-col gap-1.5">
          {SKILL_ORDER.map((id) => {
            const xp = skills[id];
            const lv = levelFromXp(xp);
            const toNext = xpToNext(xp);
            const into = xp - xpForLevel(lv);
            const span = Math.max(1, xpForLevel(lv + 1) - xpForLevel(lv));
            const pct = lv >= 99 ? 100 : Math.min(100, (into / span) * 100);
            return (
              <li key={id}>
                <div className="flex items-baseline justify-between">
                  <p className="font-display text-sm font-semibold text-ink">
                    {SKILL_LABEL[id]} {lv}
                  </p>
                  <p className="text-[11px] font-bold tabular-nums text-bark/55">
                    {lv >= 99 ? "max" : `${toNext} to next`}
                  </p>
                </div>
                <div className="mt-0.5 h-1.5 overflow-hidden rounded-full bg-bark/15">
                  <div className="h-full rounded-full bg-moss" style={{ width: `${pct}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
        {quests.some((q) => q.stage !== "done") ? (
          <>
            <p className="mt-3 text-xs font-bold uppercase tracking-wide text-bark/50">Quests</p>
            <ul className="mt-1 flex flex-col gap-1.5">
              {quests
                .filter((q) => q.stage !== "done")
                .map((q) => {
                  const def = QUEST_BY_ID[q.id];
                  if (!def) return null;
                  const extra =
                    q.id === "lost-chicken" && chickenHeld
                      ? "Cluckers is with you."
                      : q.id === "pie-run" && pieHeld
                        ? "Pie in hand."
                        : def.hint;
                  return (
                    <li key={q.id} className="rounded-[12px] bg-gold/20 px-3 py-2">
                      <p className="font-display text-sm font-semibold text-ink">{def.title}</p>
                      <p className="text-xs font-semibold text-bark/70">{extra}</p>
                    </li>
                  );
                })}
            </ul>
          </>
        ) : null}
        <div className="mt-3 grid grid-cols-2 gap-2">
          {SLOTS.map((slot) => {
            const id = equipment[slot.id];
            const item = id ? CATALOG_BY_ID[id] : null;
            return (
              <div key={slot.id} className="rounded-[16px] bg-parchment-dark/70 px-2 py-3 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wide text-bark/55">{slot.label}</p>
                <p className="mt-1 font-display text-sm font-semibold leading-tight text-ink">{item ? item.name : "Empty"}</p>
                {item?.atk ? <p className="text-[11px] font-bold text-moss">+{item.atk} atk</p> : null}
                {item?.def ? <p className="text-[11px] font-bold text-moss">+{item.def} def</p> : null}
                {item?.wc ? <p className="text-[11px] font-bold text-moss">wc {item.wc}</p> : null}
                {item?.farm ? <p className="text-[11px] font-bold text-moss">farm {item.farm}</p> : null}
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-xs font-bold uppercase tracking-wide text-bark/50">Wear</p>
        <ul className="mt-1 flex flex-col gap-1.5">
          {CATALOG.filter((i) => i.slot && ownedGear.includes(i.id)).map((item) => {
            const on = equipment[item.slot!] === item.id;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => equipGear(item.id)}
                  className={cn(
                    "flex h-11 w-full items-center justify-between rounded-[14px] px-3 font-display text-sm font-semibold",
                    on ? "bg-moss text-parchment" : "bg-parchment-dark text-ink",
                  )}
                >
                  <span>{item.name}</span>
                  <span className="text-xs tabular-nums opacity-80">
                    {item.atk
                      ? `+${item.atk} atk`
                      : item.def
                        ? `+${item.def} def`
                        : item.wc
                          ? `wc ${item.wc}`
                          : item.farm
                            ? `farm ${item.farm}`
                            : ""}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        <p className="mt-3 text-xs font-bold uppercase tracking-wide text-bark/50">Hats</p>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {ownedHats.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => equipHat(id)}
              className={cn(
                "h-9 rounded-full px-3 font-display text-xs font-semibold",
                hat === id ? "bg-pine text-parchment" : "bg-parchment-dark text-ink",
              )}
            >
              {CATALOG_BY_ID[id]?.name ?? id}
            </button>
          ))}
        </div>
        <p className="mt-3 text-sm font-semibold text-bark/70">
          Food · honey {honey} · loaves {bread} · logs {logs}. Fort {fortLevel}/5. Guard {guardLevel}/5.
        </p>
      </div>
    </div>
  );
}
