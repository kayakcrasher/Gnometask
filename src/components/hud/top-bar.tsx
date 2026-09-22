import { Backpack, Heart, ScrollText, Settings2, Shield, Shirt, Sword } from "lucide-react";
import { cn } from "@/lib/utils";
import { localDate } from "@/lib/utils";
import { useGame } from "@/lib/game/store";
import { CATALOG_BY_ID } from "@/lib/game/catalog";
import { combatLevel, maxHitpoints } from "@/lib/game/xp";

export function TopBar() {
  const gnomeName = useGame((s) => s.gnomeName);
  const coins = useGame((s) => s.coins);
  const streak = useGame((s) => s.streak);
  const coinPopKey = useGame((s) => s.coinPopKey);
  const hp = useGame((s) => s.hp);
  const honey = useGame((s) => s.honey);
  const bread = useGame((s) => s.bread);
  const panel = useGame((s) => s.panel);
  const setPanel = useGame((s) => s.setPanel);
  const tasks = useGame((s) => s.tasks);
  const equipment = useGame((s) => s.equipment);
  const skills = useGame((s) => s.skills);
  const today = localDate();
  const remaining = tasks.filter((t) => {
    if (t.builtin) return t.createdOn === today && !t.done;
    return !t.done;
  }).length;
  const food = honey + bread;
  const maxHp = maxHitpoints(skills);
  const cmb = combatLevel(skills);
  const slots = [
    { id: "weapon" as const, icon: Sword, empty: "Sword" },
    { id: "shield" as const, icon: Shield, empty: "Shield" },
    { id: "armor" as const, icon: Shirt, empty: "Armour" },
  ];

  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-20 p-3 md:p-4">
      <div className="pointer-events-auto mx-auto flex max-w-[1600px] items-center gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-3 rounded-[20px] bg-pine/92 px-3 py-2 text-parchment shadow-panel md:px-4">
          <div className="min-w-0">
            <p className="font-display text-lg font-semibold leading-none tracking-tight md:text-xl">Gnome Tasks</p>
            <p className="truncate text-xs font-semibold text-parchment-dark">
              {gnomeName ? gnomeName : "An unnamed gnome"} · click to walk
            </p>
          </div>
          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            <div
              className="hidden h-11 items-center rounded-full bg-parchment/12 px-3 font-display text-base font-semibold text-parchment tabular-nums sm:flex"
              title="Combat level"
            >
              {cmb}
            </div>
            <div
              className={cn(
                "flex h-11 items-center gap-1 rounded-full px-3 font-display text-base font-semibold tabular-nums",
                hp <= 8 ? "bg-berry text-parchment" : "bg-parchment/12 text-parchment",
              )}
              title="Heart"
            >
              <Heart className="size-4" strokeWidth={2.4} />
              {hp}
              <span className="hidden sm:inline">/{maxHp}</span>
            </div>
            <div className="flex h-11 items-center gap-1 rounded-full bg-gold/20 px-3 font-display text-base font-semibold text-gold tabular-nums" title="Food">
              <span className="size-2.5 rounded-full bg-gold" aria-hidden />
              {food}
            </div>
            <div
              key={coinPopKey}
              className={cn(
                "flex h-11 items-center gap-1.5 rounded-full bg-gold px-3 font-display text-base font-semibold text-ink tabular-nums",
                coinPopKey ? "coin-pop" : "",
              )}
            >
              <span className="size-2.5 rounded-full bg-bark/40" aria-hidden />
              {coins}
            </div>
            <div className="hidden h-11 items-center rounded-full bg-parchment/12 px-3 font-display text-base font-semibold text-gold tabular-nums sm:flex">
              {streak}d
            </div>
            <div className="hidden items-center gap-1 lg:flex">
              {slots.map((slot) => {
                const id = equipment[slot.id];
                const item = id ? CATALOG_BY_ID[id] : null;
                const Icon = slot.icon;
                return (
                  <button
                    key={slot.id}
                    type="button"
                    title={item?.name ?? slot.empty}
                    onClick={() => setPanel(panel === "inventory" ? "place" : "inventory")}
                    className="flex size-11 flex-col items-center justify-center rounded-[12px] bg-parchment/12 text-parchment"
                  >
                    <Icon className="size-3.5" strokeWidth={2.4} />
                    <span className="max-w-[2.6rem] truncate text-[9px] font-bold leading-none">
                      {item ? item.name.split(" ")[0] : "—"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <div className="flex h-14 items-center gap-1 rounded-[20px] bg-pine/92 p-1.5 shadow-panel">
          <button
            type="button"
            onClick={() => setPanel(panel === "chores" ? "place" : "chores")}
            className={cn(
              "flex h-11 items-center gap-1.5 rounded-[14px] px-3 font-display text-sm font-semibold",
              panel === "chores" ? "bg-parchment text-pine" : "text-parchment hover:bg-parchment/10",
            )}
          >
            <ScrollText className="size-4" strokeWidth={2.4} />
            <span className="hidden md:inline">Chores</span>
            <span className="rounded-full bg-gold px-1.5 py-0.5 text-[11px] font-bold text-ink tabular-nums">{remaining}</span>
          </button>
          <button
            type="button"
            aria-label="Inventory"
            onClick={() => setPanel(panel === "inventory" ? "place" : "inventory")}
            className={cn(
              "flex size-11 items-center justify-center rounded-[14px]",
              panel === "inventory" ? "bg-parchment text-pine" : "text-parchment hover:bg-parchment/10",
            )}
          >
            <Backpack className="size-5" strokeWidth={2.4} />
          </button>
          <button
            type="button"
            aria-label="Menu"
            onClick={() => setPanel(panel === "menu" ? "place" : "menu")}
            className={cn(
              "flex size-11 items-center justify-center rounded-[14px]",
              panel === "menu" ? "bg-parchment text-pine" : "text-parchment hover:bg-parchment/10",
            )}
          >
            <Settings2 className="size-5" strokeWidth={2.4} />
          </button>
        </div>
      </div>
    </header>
  );
}
