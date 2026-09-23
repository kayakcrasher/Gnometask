import { X } from "lucide-react";
import { useGame } from "@/lib/game/store";
import { ShopView } from "./shop-view";
import { BUILDING_MAX, type InteriorId, type ShopKind } from "@/lib/game/types";
import { HALL_COST, hallUnlocks } from "@/lib/game/world";
import { FISH } from "@/lib/game/data/fish";
import { CROPS } from "@/lib/game/data/crops";
import { ANIMALS, CALF_PRICE, COOP_COST, GOODS } from "@/lib/game/data/trade";
import { BOATS } from "@/lib/game/data/boats";
import { levelFromXp } from "@/lib/game/xp";
import { cn } from "@/lib/utils";

const COPY: Record<InteriorId, { title: string; blurb: string; kinds?: ShopKind[] }> = {
  cottage: {
    title: "Inside the cottage",
    blurb: "Kettle and boots. Tea restores heart. Ol Pappy is down on the dock.",
  },
  hatshop: {
    title: "Hat shop",
    blurb: "Peaks, petals, and one night cap that pretends to be serious.",
    kinds: ["hat"],
  },
  armory: {
    title: "The Armory",
    blurb: "Swords, rods, hatchets, hoes, shields, mail. Town Hall rank unlocks better metal.",
    kinds: ["weapon", "tool", "shield", "armor"],
  },
  bakery: {
    title: "The Bakery",
    blurb: "Loaves, pies, honey cakes. Eat in a fight. The miller is watching.",
    kinds: ["food"],
  },
  general: {
    title: "Builder's yard",
    blurb: "Seeds, fences, livestock, and the only counter that turns goods into coins.",
    kinds: ["house", "garden", "village", "fort"],
  },
  "haven-shop": {
    title: "Haven stall",
    blurb: "Adamant, stew, and a guard cap. Unique to the slow village.",
    kinds: ["haven"],
  },
  bank: {
    title: "The Bank",
    blurb: "A room with a counter, a vault, and a desk that funds expeditions. Interest is 25%, if they come home.",
  },
  dockhouse: {
    title: "Dockhouse",
    blurb: "Two floors. Wim sleeps upstairs. The boats are on the ledger downstairs.",
  },
  townhall: {
    title: "Town Hall",
    blurb: "Upgrade the hall toward a stone keep. The tank in the corner grows with every fish you keep.",
  },
  watch: {
    title: "Greg's watch",
    blurb: "Stakes perch is twelve coins. Plant it, then level the tower at the tower.",
    kinds: ["tower"],
  },
};

function Aquarium() {
  const tank = useGame((s) => s.tank);
  const bag = useGame((s) => s.fishBag);
  const stock = useGame((s) => s.stockFish);
  const kept = FISH.flatMap((f) => Array.from({ length: Math.min(tank[f.id] ?? 0, 4) }, (_, i) => ({ ...f, key: `${f.id}-${i}` })));
  const total = FISH.reduce((n, f) => n + (tank[f.id] ?? 0), 0);
  const height = 96 + Math.min(160, total * 7);
  const holding = FISH.filter((f) => (bag[f.id] ?? 0) > 0);
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-bark/55">Aquarium · {total}</p>
      <div className="relative mt-1 overflow-hidden rounded-[16px] bg-[#163e48]" style={{ height }}>
        <style>{`
          @keyframes hw-swim {
            0% { transform: translateX(-30%) scaleX(1); }
            49% { transform: translateX(240%) scaleX(1); }
            50% { transform: translateX(240%) scaleX(-1); }
            100% { transform: translateX(-30%) scaleX(-1); }
          }
        `}</style>
        {kept.length === 0 ? (
          <p className="absolute inset-0 flex items-center justify-center px-4 text-center text-xs font-semibold text-[#d5e6ea]">
            Empty water. Catch a fish and keep it here.
          </p>
        ) : (
          kept.map((f, i) => (
            <div
              key={f.key}
              className="absolute flex items-center"
              style={{
                top: 12 + ((i * 37) % Math.max(40, height - 28)),
                animation: `hw-swim ${6 + (i % 4)}s linear ${i * 0.4}s infinite`,
              }}
            >
              <span className="block h-3 w-7 rounded-full" style={{ background: f.color }} />
              <span
                className="block h-0 w-0 border-y-[6px] border-r-[8px] border-y-transparent"
                style={{ borderRightColor: f.color }}
              />
            </div>
          ))
        )}
      </div>
      {holding.length ? (
        <ul className="mt-2 flex flex-col gap-1.5">
          {holding.map((f) => (
            <li key={f.id} className="flex items-center gap-2 text-xs font-semibold text-ink">
              <span className="flex-1">
                {f.name} × {bag[f.id]}
              </span>
              <button type="button" onClick={() => stock(f.id)} className="rounded-full bg-pine px-2 py-1 text-[11px] text-parchment">
                Keep
              </button>
              <span className="text-[11px] text-bark/50">Shop buys {f.price}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function DockhousePanel() {
  const coins = useGame((s) => s.coins);
  const hulls = useGame((s) => s.hulls);
  const skills = useGame((s) => s.skills);
  const buy = useGame((s) => s.buyBoat);
  const lv = levelFromXp(skills.sailing);
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
      <p className="text-sm font-semibold text-bark/70">Sailing {lv}. The rowboat is already on the pier.</p>
      {BOATS.filter((b) => b.price > 0).map((boat) => {
        const owned = hulls.includes(boat.id);
        return (
          <button
            key={boat.id}
            type="button"
            disabled={owned || coins < boat.price || lv < boat.need}
            onClick={() => buy(boat.id)}
            className="rounded-[14px] bg-parchment-dark px-3 py-2 text-left disabled:opacity-50"
          >
            <span className="block font-display text-sm font-semibold text-ink">
              {owned ? `${boat.name} — yours` : `${boat.name} — ${boat.price} coins`}
            </span>
            <span className="text-xs font-semibold text-bark/70">
              Sailing {boat.need}. {boat.blurb}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function LogTill() {
  const logs = useGame((s) => s.logs);
  const saplings = useGame((s) => s.saplings);
  const sell = useGame((s) => s.sellLogs);
  return (
    <div className="flex items-center gap-2 text-xs font-semibold text-ink">
      <span className="flex-1">Logs {logs} · saplings {saplings}</span>
      <button type="button" disabled={logs < 1} onClick={sell} className="rounded-full bg-gold px-2 py-1 text-[11px] text-ink disabled:opacity-40">
        Sell log 2
      </button>
    </div>
  );
}

function ProduceStall() {
  const seeds = useGame((s) => s.seeds);
  const produce = useGame((s) => s.produce);
  const goods = useGame((s) => s.goods);
  const fishBag = useGame((s) => s.fishBag);
  const herd = useGame((s) => s.herd);
  const coins = useGame((s) => s.coins);
  const buy = useGame((s) => s.buySeed);
  const sell = useGame((s) => s.sellProduce);
  const sellFish = useGame((s) => s.sellFish);
  const sellGood = useGame((s) => s.sellGood);
  const buyAnimal = useGame((s) => s.buyAnimal);
  const upgradeCoop = useGame((s) => s.upgradeCoop);
  const tend = useGame((s) => s.tendHerd);
  const sellCalf = useGame((s) => s.sellCalf);
  const coopNext = COOP_COST[herd.coop + 1];
  return (
    <div className="mb-3 flex flex-col gap-2">
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-bark/55">The counter. This is where coins happen.</p>
      <LogTill />
      {CROPS.map((crop) => (
        <div key={crop.id} className="flex items-center gap-2 text-xs font-semibold text-ink">
          <span className="size-3 rounded-full" style={{ background: crop.color }} />
          <span className="flex-1">
            {crop.name}
            <span className="text-bark/55"> · seed {seeds[crop.id] ?? 0} · sack {produce[crop.id] ?? 0}</span>
          </span>
          <button type="button" disabled={coins < crop.seed} onClick={() => buy(crop.id)} className="rounded-full bg-pine px-2 py-1 text-[11px] text-parchment disabled:opacity-40">
            Seed {crop.seed}
          </button>
          <button type="button" disabled={(produce[crop.id] ?? 0) < 1} onClick={() => sell(crop.id)} className="rounded-full bg-gold px-2 py-1 text-[11px] text-ink disabled:opacity-40">
            Sell {crop.price}
          </button>
        </div>
      ))}
      {FISH.filter((f) => (fishBag[f.id] ?? 0) > 0).map((f) => (
        <div key={f.id} className="flex items-center gap-2 text-xs font-semibold text-ink">
          <span className="flex-1">{f.name} × {fishBag[f.id]}</span>
          <button type="button" onClick={() => sellFish(f.id)} className="rounded-full bg-gold px-2 py-1 text-[11px] text-ink">
            Sell {f.price}
          </button>
        </div>
      ))}
      {GOODS.filter((g) => (goods[g.id] ?? 0) > 0).map((g) => (
        <div key={g.id} className="flex items-center gap-2 text-xs font-semibold text-ink">
          <span className="flex-1">{g.name} × {goods[g.id]}</span>
          <button type="button" onClick={() => sellGood(g.id)} className="rounded-full bg-gold px-2 py-1 text-[11px] text-ink">
            Sell {g.price}
          </button>
        </div>
      ))}
      <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-bark/55">Yard</p>
      {ANIMALS.map((a) => (
        <button key={a.id} type="button" disabled={coins < a.price || herd[a.id] >= a.cap} onClick={() => buyAnimal(a.id)} className="rounded-[12px] bg-parchment-dark px-2 py-1.5 text-left text-xs font-semibold text-ink disabled:opacity-40">
          {a.name} · {herd[a.id]}/{a.cap} · {a.price} coins
        </button>
      ))}
      <button type="button" onClick={upgradeCoop} className="rounded-[12px] bg-parchment-dark px-2 py-1.5 text-left text-xs font-semibold text-ink">
        {herd.coop === 0 ? `Buy a chicken coop · ${COOP_COST[1]} coins` : coopNext ? `Upgrade coop to ${herd.coop + 1} · ${coopNext} coins` : "Coop is finished"}
      </button>
      <div className="flex flex-wrap gap-1.5">
        <button type="button" onClick={() => tend("milk")} className="rounded-full bg-pine px-2 py-1 text-[11px] font-semibold text-parchment">Milk</button>
        <button type="button" onClick={() => tend("eggs")} className="rounded-full bg-pine px-2 py-1 text-[11px] font-semibold text-parchment">Collect eggs</button>
        <button type="button" onClick={() => tend("wool")} className="rounded-full bg-pine px-2 py-1 text-[11px] font-semibold text-parchment">Shear</button>
        <button type="button" onClick={sellCalf} className="rounded-full bg-gold px-2 py-1 text-[11px] font-semibold text-ink">
          Sell calf {CALF_PRICE}
        </button>
      </div>
      <p className="text-[11px] font-semibold text-bark/60">
        Cows {herd.cows} · goats {herd.goats} · sheep {herd.sheep} · calves {herd.calves}
        {herd.shipped ? ` · ${herd.shipped} waiting on the ship` : ""}
      </p>
    </div>
  );
}

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
    { n: 5, label: "A stone keep. The tide is honest." },
  ];
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
      <Aquarium />
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
      {id === "watch" ? (
        <g>
          <rect x="138" y="48" width="16" height="70" fill="#8a7a68" />
          <rect x="122" y="44" width="48" height="10" fill="#c4a574" />
          <polygon points="130,44 146,28 162,44" fill="#35543f" />
          <rect x="200" y="70" width="6" height="40" fill="#5b4230" />
          <circle cx="203" cy="66" r="8" fill="#6f8f40" />
          <ellipse cx="70" y="108" rx="28" ry="10" fill="#4e7370" opacity="0.4" />
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
  if (!interior || interior === "bank") return null;
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
          </div>
        ) : interior === "townhall" ? (
          <HallPanel />
        ) : interior === "dockhouse" ? (
          <DockhousePanel />
        ) : (
          <div className="min-h-0 flex-1 overflow-hidden">
            {interior === "general" ? <ProduceStall /> : null}
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
