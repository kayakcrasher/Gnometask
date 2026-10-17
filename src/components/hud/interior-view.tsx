import {HOME_UPGRADE_COST} from "@/lib/game/city";
import {Aquarium} from "./aquarium";
import { InteriorPreview } from "@/components/world/interior-assets";
import { SailingProgress } from "./sailing-progress";
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
  chart: { title: "Enemy islands", blurb: "Chart a course from the harbour." },
  cottage: {
    title: "Inside the cottage",
    blurb: "Your great-grandpa's roof. Tea restores heart. You arrived with empty pockets. Ol Pappy is on the dock.",
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
    title: "Farm Supply",
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
    blurb: "Upgrade the hall toward a stone keep. Set up and expand the aquarium with coins to hold your fish collection.",
  },
  watch: {
    title: "Greg's watch",
    blurb: "Stakes perch is twelve coins. Plant it, then level the tower at the tower.",
    kinds: ["tower"],
  },
  casino: {
    title: "The strip",
    blurb: "A pit downstairs and a flat above it.",
  },
  exchange: {
    title: "Gnome Exchange",
    blurb: "Runners, bulk goods, and the board.",
  },
  court: {
    title: "The court",
    blurb: "A Greek bench. The black gown sits in Port Victoria.",
  },
  pub: {
    title: "The pub",
    blurb: "Three beers, a room upstairs, and a till that already knows interest.",
  },
};

function DockhousePanel() {
  const coins = useGame((s) => s.coins);
  const hulls = useGame((s) => s.hulls);
  const skills = useGame((s) => s.skills);
  const buy = useGame((s) => s.buyBoat);
  const lv = levelFromXp(skills.sailing);
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
      <SailingProgress />
      <button type="button" onClick={() => useGame.getState().enterInterior("chart")} className="min-h-11 rounded-xl bg-gold px-3 text-sm font-bold text-ink">Chart the enemy islands</button>
      <p className="text-xs font-semibold text-bark/70">Skill improves your speed by 1% per level, up to 25%. The rowboat is already yours.</p>
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
              Sailing {boat.need} · Speed {Math.round(boat.speed / 180 * 100)}% of rowboat · {boat.blurb}
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

export function InteriorView() {
  const interior = useGame((s) => s.interior);
  const leave = useGame((s) => s.leaveInterior);
  const sipTea = useGame((s) => s.sipTea);
  const repair = useGame((s) => s.repairBuilding);
  const cottageHp = useGame((s) => s.buildingHp.cottage);
  const cottageLevel = useGame((s) => s.cottageLevel ?? 0);
  const upgradeCottage = useGame((s) => s.upgradeCottage);
  if (!interior || interior === "chart" || interior === "bank" || interior === "casino" || interior === "exchange" || interior === "court" || interior === "pub") return null;
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
        <InteriorPreview id={interior} />
        {interior === "cottage" ? (
          <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
            <Aquarium/>
            <button
              type="button"
              onClick={sipTea}
              className="h-11 rounded-[14px] bg-pine font-display text-sm font-semibold text-parchment"
            >
              Have a cup of tea — restore heart
            </button>
            {cottageLevel < 3 ? (
              <button
                type="button"
                onClick={upgradeCottage}
                className="h-11 rounded-[14px] bg-gold font-display text-sm font-semibold text-ink"
              >
                {["", "Stone cottage", "Gardener's cottage", "Manor"][cottageLevel + 1]} · {HOME_UPGRADE_COST[cottageLevel+1]} coins
              </button>
            ) : (
              <p className="text-center font-display text-xs font-semibold text-bark/55">
                The cottage is a manor. Nothing left to build.
              </p>
            )}
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
