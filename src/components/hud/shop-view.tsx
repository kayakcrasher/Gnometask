import { useState } from "react";
import { Check } from "lucide-react";
import { CATALOG } from "@/lib/game/catalog";
import { cn } from "@/lib/utils";
import { useGame } from "@/lib/game/store";
import type { ShopKind } from "@/lib/game/types";
import { SKILL_LABEL, levelsOf } from "@/lib/game/xp";

const ALL_KINDS: { id: ShopKind; label: string }[] = [
  { id: "hat", label: "Hats" },
  { id: "weapon", label: "Swords" },
  { id: "tool", label: "Tools" },
  { id: "shield", label: "Shields" },
  { id: "armor", label: "Armour" },
  { id: "food", label: "Food" },
  { id: "house", label: "Cottage" },
  { id: "garden", label: "Garden" },
  { id: "village", label: "Village" },
  { id: "fort", label: "Walls" },
  { id: "haven", label: "Haven" },
];

export function ShopView({ kinds, compact }: { kinds?: ShopKind[]; compact?: boolean }) {
  const allowed = kinds ?? ALL_KINDS.map((k) => k.id);
  const [kind, setKind] = useState<ShopKind>(allowed[0] ?? "hat");
  const coins = useGame((s) => s.coins);
  const ownedHats = useGame((s) => s.ownedHats);
  const houseUpgrades = useGame((s) => s.houseUpgrades);
  const hat = useGame((s) => s.hat);
  const inventory = useGame((s) => s.inventory);
  const placed = useGame((s) => s.placed);
  const buy = useGame((s) => s.buy);
  const startPlacing = useGame((s) => s.startPlacing);
  const equipHat = useGame((s) => s.equipHat);
  const equipGear = useGame((s) => s.equipGear);
  const ownedGear = useGame((s) => s.ownedGear);
  const honey = useGame((s) => s.honey);
  const bread = useGame((s) => s.bread);
  const fortLevel = useGame((s) => s.fortLevel);
  const equipment = useGame((s) => s.equipment);
  const dragonState = useGame((s) => s.lifeDragon.state);
  const skills = useGame((s) => s.skills);
  const townHallLevel = useGame((s) => s.townHallLevel);
  const lv = levelsOf(skills);

  const tabs = ALL_KINDS.filter((k) => allowed.includes(k.id));
  const active = allowed.includes(kind) ? kind : allowed[0]!;
  const items = CATALOG.filter((i) => {
    if (i.kind !== active) return false;
    if (i.id === "hat-dragon" && dragonState === "lurking" && !ownedHats.includes(i.id)) return false;
    return true;
  });

  return (
    <div className="flex h-full min-h-0 flex-col">
      {compact ? null : (
        <>
          <h2 className="font-display text-2xl font-semibold text-ink">The shops</h2>
          <p className="text-sm font-semibold text-bark/70">All of them live on the town square. Step inside a stall on the map.</p>
        </>
      )}
      {tabs.length > 1 ? (
        <div className="mt-2 flex gap-1 overflow-x-auto rounded-[16px] bg-parchment-dark/50 p-1">
          {tabs.map((k) => (
            <button
              key={k.id}
              type="button"
              onClick={() => setKind(k.id)}
              className={cn(
                "h-9 shrink-0 rounded-[12px] px-2.5 font-display text-[11px] font-semibold transition-colors duration-150",
                active === k.id ? "bg-parchment text-pine" : "text-bark",
              )}
            >
              {k.label}
            </button>
          ))}
        </div>
      ) : null}
      <ul className="mt-3 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pb-2">
        {items.map((item) => {
          const ownedHat = item.kind === "hat" && ownedHats.includes(item.id);
          const ownedHouse = item.kind === "house" && houseUpgrades.includes(item.id);
          const ownedFort = Boolean(item.fortLevel && fortLevel >= item.fortLevel);
          const ownedEquip = Boolean(item.slot && ownedGear.includes(item.id) && item.kind !== "food");
          const inBag = inventory.includes(item.id);
          const placedCount = placed.filter((p) => p.catalogId === item.id).length;
          const equipped = item.slot ? equipment[item.slot] === item.id : false;
          const owned = ownedHat || ownedHouse || ownedFort || ownedEquip;
          const skillLocked =
            Boolean(item.reqSkill && item.reqLevel) && lv[item.reqSkill!] < item.reqLevel!;
          const hallLocked = Boolean(item.reqHall && townHallLevel < item.reqHall);
          const locked = skillLocked || hallLocked;
          const canAfford = coins >= item.price;
          return (
            <li
              key={item.id}
              className="flex items-start gap-3 rounded-[16px] bg-parchment px-3 py-3 shadow-[0_0_0_1px_rgba(91,66,48,0.08)]"
            >
              <div className="min-w-0 flex-1">
                <p className="font-display text-base font-semibold leading-tight text-ink">{item.name}</p>
                <p className="mt-0.5 text-xs font-semibold leading-snug text-bark/70">{item.blurb}</p>
                {item.id === "food-honey" && honey > 0 ? (
                  <p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-moss">In satchel ×{honey}</p>
                ) : null}
                {(item.id === "food-bread" || item.id === "food-pie" || item.id === "food-stew") && bread > 0 ? (
                  <p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-moss">Loaves ×{bread}</p>
                ) : null}
                {placedCount > 0 ? (
                  <p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-moss">Placed ×{placedCount}</p>
                ) : null}
                {item.atk ? <p className="mt-1 text-[11px] font-bold text-moss">+{item.atk} attack</p> : null}
                {item.def ? <p className="mt-1 text-[11px] font-bold text-moss">+{item.def} defence</p> : null}
                {item.wc ? <p className="mt-1 text-[11px] font-bold text-moss">Woodcutting {item.wc}</p> : null}
                {item.farm ? <p className="mt-1 text-[11px] font-bold text-moss">Farming {item.farm}</p> : null}
                {locked ? (
                  <p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-berry">
                    {hallLocked
                      ? `Need Town Hall ${item.reqHall}`
                      : `Need ${SKILL_LABEL[item.reqSkill!]} ${item.reqLevel}`}
                  </p>
                ) : null}
              </div>
              {owned ? (
                <button
                  type="button"
                  onClick={() => {
                    if (item.kind === "hat") equipHat(item.id);
                    else if (item.slot) equipGear(item.id);
                  }}
                  className="flex h-10 items-center gap-1 rounded-full bg-moss px-3 font-display text-xs font-semibold text-parchment"
                >
                  <Check className="size-3.5" strokeWidth={3} />
                  {item.kind === "hat" ? (hat === item.id ? "Wearing" : "Wear") : equipped ? "Worn" : ownedFort ? "Built" : "Equip"}
                </button>
              ) : inBag ? (
                <button
                  type="button"
                  onClick={() => startPlacing(item.id)}
                  className="h-10 rounded-full bg-gold px-3 font-display text-xs font-semibold text-ink"
                >
                  Place
                </button>
              ) : (
                <button
                  type="button"
                  disabled={locked || (!canAfford && item.price > 0)}
                  onClick={() => buy(item.id)}
                  className={cn(
                    "h-10 rounded-full px-3 font-display text-xs font-semibold tabular-nums transition-transform duration-150 active:scale-[0.96]",
                    locked
                      ? "bg-parchment-dark text-bark/50"
                      : canAfford || item.price === 0
                        ? "bg-gold text-ink"
                        : "bg-parchment-dark text-bark/50",
                  )}
                >
                  {locked
                    ? hallLocked
                      ? `Hall ${item.reqHall}`
                      : `${SKILL_LABEL[item.reqSkill!].slice(0, 3)} ${item.reqLevel}`
                    : item.price === 0
                      ? "Free"
                      : `${item.price}`}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
