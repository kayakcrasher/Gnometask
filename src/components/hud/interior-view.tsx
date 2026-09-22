import { X } from "lucide-react";
import { useGame } from "@/lib/game/store";
import { ShopView } from "./shop-view";
import { TaskList } from "./task-list";
import { BUILDING_MAX, type InteriorId, type ShopKind } from "@/lib/game/types";
import { HALL_COST, hallUnlocks } from "@/lib/game/world";
import { cn } from "@/lib/utils";

const COPY: Record<InteriorId, { title: string; blurb: string; kinds?: ShopKind[] }> = {
  cottage: {
    title: "Inside the cottage",
    blurb: "Kettle, boots, the list on the table. Tea restores heart. Chores live here too.",
  },
  hatshop: {
    title: "Hat shop",
    blurb: "Peaks, petals, and one night cap that pretends to be serious.",
    kinds: ["hat"],
  },
  armory: {
    title: "The Armory",
    blurb: "Swords, hatchets, hoes, shields, mail. Town Hall rank unlocks better metal.",
    kinds: ["weapon", "tool", "shield", "armor"],
  },
  bakery: {
    title: "The Bakery",
    blurb: "Loaves, pies, honey cakes. Eat in a fight. The miller is watching.",
    kinds: ["food"],
  },
  general: {
    title: "Builder's yard",
    blurb: "Cottage fittings, garden beds, village rowhouses, and walls for the island.",
    kinds: ["house", "garden", "village", "fort"],
  },
  "haven-shop": {
    title: "Haven stall",
    blurb: "Adamant, stew, and a guard cap. Unique to the slow village.",
    kinds: ["haven"],
  },
  townhall: {
    title: "Town Hall",
    blurb: "The square's spine. Upgrade the hall to unlock weapons and change who raids the dock.",
  },
};

function HallPanel() {
  const level = useGame((s) => s.townHallLevel);
  const coins = useGame((s) => s.coins);
  const upgrade = useGame((s) => s.upgradeHall);
  const maxed = level >= 5;
  const next = Math.min(5, level + 1);
  const cost = HALL_COST[next] ?? 0;
  const ranks = [
    { n: 1, label: "Bronze & stick. Green goblins at the dock." },
    { n: 2, label: "Iron unlocked. Goblins still come in packs." },
    { n: 3, label: "Steel unlocked. Dark elves start sniffing." },
    { n: 4, label: "Adamant in the armory. Mixed raids." },
    { n: 5, label: "The hall is finished. The tide is honest." },
  ];
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
      <div className="rounded-[16px] bg-parchment-dark/50 px-3 py-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-bark/55">Rank</p>
        <p className="font-display text-2xl font-semibold text-ink">Town Hall {level}</p>
        <p className="mt-1 text-sm font-semibold text-bark/70">{hallUnlocks(level)}</p>
      </div>
      <ul className="flex flex-col gap-1.5">
        {ranks.map((r) => (
          <li
            key={r.n}
            className={cn(
              "rounded-[12px] px-3 py-2 text-xs font-semibold",
              r.n <= level ? "bg-moss/15 text-ink" : "bg-parchment-dark/40 text-bark/55",
            )}
          >
            Hall {r.n} — {r.label}
          </li>
        ))}
      </ul>
      {maxed ? (
        <p className="rounded-[14px] bg-moss/20 px-3 py-2 text-center font-display text-sm font-semibold text-ink">
          The hall is as hall as it gets.
        </p>
      ) : (
        <button
          type="button"
          disabled={coins < cost}
          onClick={upgrade}
          className={cn(
            "h-12 rounded-[14px] font-display text-sm font-semibold",
            coins >= cost ? "bg-gold text-ink" : "bg-parchment-dark text-bark/50",
          )}
        >
          Upgrade to Hall {next} · {cost}
        </button>
      )}
    </div>
  );
}

function RoomScene({ id }: { id: InteriorId }) {
  return (
    <svg viewBox="0 0 320 148" className="mb-3 h-32 w-full shrink-0" aria-hidden>
      <rect width="320" height="148" fill="#6a8f8a" />
      <polygon points="160,138 302,92 160,46 18,92" fill="#c4a574" />
      <polygon points="160,46 302,92 302,68 160,22" fill="#e8dfc4" />
      <polygon points="160,46 18,92 18,68 160,22" fill="#d4c4a4" />
      <polygon points="160,22 302,68 240,8 160,8" fill="#a8433b" opacity="0.85" />
      <polygon points="160,22 18,68 80,8 160,8" fill="#8a3a32" opacity="0.9" />
      {id === "cottage" ? (
        <g>
          <ellipse cx="210" cy="108" rx="28" ry="10" fill="#5b4230" opacity="0.25" />
          <rect x="188" y="78" width="44" height="28" fill="#e6d8bc" stroke="#5b4230" />
          <polygon points="186,78 210,62 234,78" fill="#a8433b" />
          <circle cx="210" cy="70" r="6" fill="#8a7a68" />
          <ellipse cx="92" cy="112" rx="34" ry="12" fill="#5b4230" opacity="0.2" />
          <rect x="64" y="92" width="56" height="16" rx="4" fill="#6b5340" />
          <rect x="70" y="80" width="22" height="14" rx="3" fill="#f2e8d5" />
          <circle cx="118" cy="88" r="7" fill="#d6a84c" />
        </g>
      ) : null}
      {id === "hatshop" ? (
        <g>
          {[86, 130, 174, 218].map((x, i) => (
            <g key={x}>
              <rect x={x} y="86" width="6" height="28" fill="#5b4230" />
              <path d={`M${x - 10} 86 C${x - 10} 68 ${x + 16} 68 ${x + 16} 86 Z`} fill={i % 2 ? "#a8433b" : "#35543f"} />
              <circle cx={x + 3} cy="66" r="3.5" fill="#d6a84c" />
            </g>
          ))}
        </g>
      ) : null}
      {id === "armory" ? (
        <g>
          <rect x="70" y="70" width="70" height="46" fill="#8a7a68" stroke="#5b4230" />
          <rect x="82" y="78" width="6" height="34" fill="#cfe4c8" />
          <rect x="96" y="78" width="6" height="34" fill="#8a7a68" />
          <rect x="110" y="78" width="6" height="34" fill="#c4963d" />
          <ellipse cx="210" cy="100" rx="18" ry="24" fill="#6b5340" stroke="#3e2e20" />
          <ellipse cx="210" cy="100" rx="8" ry="12" fill="#f2e8d5" opacity="0.35" />
        </g>
      ) : null}
      {id === "bakery" ? (
        <g>
          <rect x="74" y="72" width="56" height="42" fill="#5b4230" />
          <rect x="82" y="80" width="40" height="22" fill="#2a241c" />
          <ellipse cx="102" cy="70" rx="10" ry="6" fill="#8a7a68" />
          <circle cx="188" cy="104" r="10" fill="#d6a84c" />
          <circle cx="214" cy="100" r="12" fill="#c4963d" />
          <circle cx="236" cy="108" r="8" fill="#a8433b" />
        </g>
      ) : null}
      {id === "general" ? (
        <g>
          <rect x="68" y="88" width="70" height="18" fill="#8a7a68" />
          <rect x="76" y="76" width="54" height="14" fill="#c4a574" />
          <rect x="188" y="70" width="8" height="44" fill="#5b4230" />
          <rect x="200" y="66" width="8" height="48" fill="#6b5340" />
          <rect x="212" y="74" width="8" height="40" fill="#5b4230" />
        </g>
      ) : null}
      {id === "haven-shop" ? (
        <g>
          <rect x="86" y="80" width="48" height="32" fill="#9ec3b8" stroke="#24402f" />
          <rect x="94" y="88" width="32" height="8" fill="#24402f" opacity="0.35" />
          <rect x="200" y="68" width="6" height="48" fill="#cfe4c8" />
          <circle cx="203" cy="64" r="6" fill="#d6a84c" />
        </g>
      ) : null}
      {id === "townhall" ? (
        <g>
          <rect x="118" y="58" width="84" height="52" fill="#e6d8bc" stroke="#5b4230" />
          <rect x="148" y="78" width="24" height="32" fill="#5b4230" />
          <circle cx="160" cy="48" r="14" fill="#e8dfc4" stroke="#5b4230" />
          <line x1="160" y1="48" x2="160" y2="38" stroke="#2a241c" strokeWidth="2" />
          <line x1="160" y1="48" x2="168" y2="52" stroke="#a8433b" strokeWidth="1.6" />
          <rect x="70" y="88" width="28" height="18" fill="#8a7a68" />
          <rect x="222" y="88" width="28" height="18" fill="#8a7a68" />
        </g>
      ) : null}
    </svg>
  );
}

export function InteriorView() {
  const interior = useGame((s) => s.interior);
  const leave = useGame((s) => s.leaveInterior);
  const sipTea = useGame((s) => s.sipTea);
  const repair = useGame((s) => s.repairBuilding);
  const cottageHp = useGame((s) => s.buildingHp.cottage);
  if (!interior) return null;
  const meta = COPY[interior];
  const cottageHurt = cottageHp < BUILDING_MAX.cottage;

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-pine/88 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:items-center">
      <div className="flex max-h-[88dvh] w-full max-w-lg flex-col rounded-[28px] bg-parchment p-4 shadow-panel">
        <div className="mb-2 flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-bark/55">Indoors</p>
            <h2 className="font-display text-2xl font-semibold text-ink">{meta.title}</h2>
            <p className="mt-1 text-sm font-semibold text-bark/70">{meta.blurb}</p>
          </div>
          <button
            type="button"
            aria-label="Leave"
            onClick={leave}
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-parchment-dark text-ink"
          >
            <X className="size-4" />
          </button>
        </div>
        <RoomScene id={interior} />
        {interior === "cottage" ? (
          <div className="flex min-h-0 flex-1 flex-col gap-3">
            <button
              type="button"
              onClick={sipTea}
              className="h-11 rounded-[14px] bg-pine font-display text-sm font-semibold text-parchment"
            >
              Have a cup of tea — restore heart
            </button>
            {cottageHurt ? (
              <button
                type="button"
                onClick={() => repair("cottage")}
                className="h-11 rounded-[14px] bg-gold font-display text-sm font-semibold text-ink"
              >
                Repair the cottage
              </button>
            ) : null}
            <div className="min-h-0 flex-1 overflow-hidden">
              <TaskList />
            </div>
          </div>
        ) : interior === "townhall" ? (
          <HallPanel />
        ) : (
          <div className="min-h-0 flex-1 overflow-hidden">
            <ShopView kinds={meta.kinds} compact />
          </div>
        )}
        <button
          type="button"
          onClick={leave}
          className="mt-3 h-11 rounded-[14px] bg-parchment-dark font-display text-sm font-semibold text-ink"
        >
          Back to the land
        </button>
      </div>
    </div>
  );
}
