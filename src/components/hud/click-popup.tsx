import { X } from "lucide-react";
import { CATALOG_BY_ID } from "@/lib/game/catalog";
import { nextTowerId } from "@/lib/game/data/catalog/towers";
import { ENEMIES, scaleEnemy } from "@/lib/game/combat";
import { SailingProgress } from "./sailing-progress";
import { boatById } from "@/lib/game/data/boats";
import { BOATS } from "@/lib/game/data/boats";
import { FISH } from "@/lib/game/data/fish";
import { CROP_BY_ID, CROPS, pailBonusMs, plotStage, type CropId } from "@/lib/game/data/crops";
import { NPC_STATS } from "@/lib/game/data/honour";
import { BUILDING_MAX } from "@/lib/game/types";
import { levelFromXp } from "@/lib/game/xp";
import { useGame } from "@/lib/game/store";
import { NPCS } from "@/lib/game/world";
import { QUEST_BY_ID } from "@/lib/game/quests";
import { randOf } from "@/lib/game/quotes";
import type { EnemyId } from "@/lib/game/combat";
import { cn } from "@/lib/utils";

function PlotActions({ id }: { id: string }) {
  const plots = useGame((s) => s.plots);
  const seeds = useGame((s) => s.seeds);
  const owned = useGame((s) => s.ownedGear);
  const plant = useGame((s) => s.plantPlot);
  const water = useGame((s) => s.waterPlot);
  const harvest = useGame((s) => s.harvestPlot);
  const clear = useGame((s) => s.clearPlot);
  const stage = plotStage(plots[id], Date.now(), pailBonusMs(owned) ?? 0);
  const crop = plots[id] ? CROP_BY_ID[plots[id].crop] : null;
  if (stage === "empty") {
    return (
      <>
        {CROPS.map((c) => (
          <Action
            key={c.id}
            label={(seeds[c.id] ?? 0) > 0 ? `Plant ${c.name}` : `${c.name} seed`}
            disabled={(seeds[c.id] ?? 0) < 1}
            onClick={() => plant(id, c.id as CropId)}
          />
        ))}
      </>
    );
  }
  if (stage === "dead") return <Action label="Clear the bed" tone="quiet" onClick={() => clear(id)} />;
  if (stage === "ready") return <Action label={`Harvest ${crop?.name ?? "crop"}`} tone="gold" onClick={() => harvest(id)} />;
  return <Action label="Water" tone="gold" onClick={() => water(id)} />;
}

function Action({
  label,
  onClick,
  tone = "pine",
  disabled,
}: {
  label: string;
  onClick: () => void;
  tone?: "pine" | "berry" | "gold" | "quiet";
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "h-10 min-w-[6.5rem] flex-1 rounded-[12px] px-3 font-display text-sm font-semibold transition-transform duration-150 active:scale-[0.97] disabled:opacity-40",
        tone === "berry" && "bg-berry text-parchment",
        tone === "gold" && "bg-gold text-ink",
        tone === "pine" && "bg-pine text-parchment",
        tone === "quiet" && "bg-parchment-dark text-ink",
      )}
    >
      {label}
    </button>
  );
}

function TreeActions({ treeId }: { treeId: string }) {
  const trees = useGame((s) => s.trees);
  const saplings = useGame((s) => s.saplings);
  const chop = useGame((s) => s.chopTree);
  const plant = useGame((s) => s.plantSapling);
  const gone = trees[treeId]?.stage === "gone";
  if (gone) {
    return <Action label={saplings > 0 ? "Plant sapling" : "No sapling"} tone="gold" disabled={saplings < 1} onClick={() => plant(treeId)} />;
  }
  return <Action label="Chop" tone="gold" onClick={() => chop(treeId)} />;
}

function TowerActions({
  slotId,
  placed,
  coins,
  onUpgrade,
}: {
  slotId: string;
  placed: { slotId: string; catalogId: string }[];
  coins: number;
  onUpgrade: (id: string) => void;
}) {
  const built = placed.find((p) => p.slotId === slotId);
  const nextId = built ? nextTowerId(built.catalogId) : null;
  const next = nextId ? CATALOG_BY_ID[nextId] : null;
  if (!next) {
    return <p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-moss">Longbow keep. The watch is full.</p>;
  }
  return (
    <Action
      label={`Upgrade · ${next.price}`}
      tone="gold"
      disabled={coins < next.price}
      onClick={() => onUpgrade(slotId)}
    />
  );
}

export function ClickPopup() {
  const popup = useGame((s) => s.popup);
  const close = useGame((s) => s.closePopup);
  const enter = useGame((s) => s.enterInterior);
  const startCreature = useGame((s) => s.startCreature);
  const startDragon = useGame((s) => s.startDragon);
  const startRaid = useGame((s) => s.startRaidFight);
  const startLanding = useGame((s) => s.startLandingFight);
  const strikeFlag = useGame((s) => s.strikeFlag);
  const upgradeTower = useGame((s) => s.upgradeTower);
  const startPatrol = useGame((s) => s.startPatrol);
  const repair = useGame((s) => s.repairBuilding);
  const rally = useGame((s) => s.rallyWalls);
  const soothe = useGame((s) => s.sootheDragon);
  const sipTea = useGame((s) => s.sipTea);
  const upgradeGuard = useGame((s) => s.upgradeGuard);
  const speak = useGame((s) => s.speak);
  const talkTo = useGame((s) => s.talkTo);
  const tradeWith = useGame((s) => s.tradeWith);
  const pickChicken = useGame((s) => s.pickChicken);
  const greetMushrooms = useGame((s) => s.greetMushrooms);
  const hp = useGame((s) => s.buildingHp);
  const fortLevel = useGame((s) => s.fortLevel);
  const guardLevel = useGame((s) => s.guardLevel);
  const honey = useGame((s) => s.honey);
  const dragon = useGame((s) => s.lifeDragon);
  const placingId = useGame((s) => s.placingId);
  const quests = useGame((s) => s.quests);
  const chickenHeld = useGame((s) => s.chickenHeld);
  const pieHeld = useGame((s) => s.pieHeld);
  const woodsGreeted = useGame((s) => s.woodsGreeted);
  const sailTo = useGame((s) => s.sailTo);
  const buyCannon = useGame((s) => s.buyCannon);
  const fireCannon = useGame((s) => s.fireCannon);
  const afloat = useGame((s) => s.afloat);
  const hulls = useGame(s => s.hulls);
  const activeBoat = afloat ? boatById(afloat) : null;
  const cannons = useGame((s) => s.cannons);
  const landing = useGame((s) => s.landing);
  const castLine = useGame((s) => s.castLine);
  const skills = useGame((s) => s.skills);
  const placed = useGame((s) => s.placed);
  const coins = useGame((s) => s.coins);
  const combat = useGame((s) => s.combat);
  const navalBattle=useGame(s=>s.naval.battle||s.naval.rescue||s.naval.boarding);
  const chart = useGame((s) => s.chart);
  const sailChart = useGame((s) => s.sailChart);

  if (combat||navalBattle) return null;

  const seaBar = afloat ? (
    <div className="pointer-events-none absolute inset-x-0 bottom-3 z-30 flex justify-center px-3 pb-[env(safe-area-inset-bottom)] md:bottom-5">
      <div
        className="pointer-events-auto flex w-full max-w-md flex-wrap gap-1.5 rounded-[20px] bg-parchment p-3 shadow-panel"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <p className="w-full font-display text-sm font-semibold text-ink">{activeBoat?.name ?? "At sea"}</p>
        <SailingProgress />
        {activeBoat && activeBoat.need >= 2 ? <Action label="Cast line" tone="gold" onClick={() => { const s = useGame.getState(); castLine("sea", s.gnomeX, s.gnomeY); }} /> : null}
        {cannons && landing ? <Action label="Fire cannon" tone="berry" onClick={fireCannon} /> : null}
        <Action label="Enemy islands" tone="gold" onClick={() => enter("chart")} />
        <Action label="Return to harbour" tone="quiet" onClick={() => sailTo("dock")} />
      </div>
    </div>
  ) : null;

  if (!popup) return seaBar;

  const enemy = popup.enemyId ? ENEMIES[popup.enemyId as EnemyId] : null;
  const building = popup.building;
  const hurt = building ? hp[building] < BUILDING_MAX[building] : false;
  const repairCost = building
    ? Math.max(4, Math.ceil((BUILDING_MAX[building] - hp[building]) / 2))
    : 0;
  const enemyStats = enemy && popup.enemyId ? popup.enemyId === "runt" ? { hp: 3, dmg: 1 } : scaleEnemy(popup.enemyId as EnemyId, skills) : null;
  const title = enemy && popup.kind !== "dragon" ? enemy.name : popup.title;
  const npc = popup.npcId ? NPCS.find((n) => n.id === popup.npcId) : null;
  const npcQuests = quests.filter((q) => {
    if (q.stage === "done") return false;
    const def = QUEST_BY_ID[q.id];
    if (!def) return false;
    if (popup.npcId && (def.giver === popup.npcId || (q.id === "pie-run" && popup.npcId === "brine"))) {
      return true;
    }
    if (popup.npcId === "greg" && q.id === "pappy-landing") return true;
    return false;
  });

  const kindLabel =
    popup.kind === "npc"
      ? popup.npcId === "pappy"
        ? "The old watch"
        : popup.npcId === "greg"
          ? "The watch"
          : "Neighbour"
      : popup.kind === "tower"
        ? "The watch"
        : popup.kind === "enemy" || popup.kind === "raid"
        ? "A fight"
        : popup.kind === "dragon"
          ? "Dragon"
          : popup.kind === "quest"
            ? "A quest"
            : "On the land";

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-3 z-30 flex justify-center px-3 pb-[env(safe-area-inset-bottom)] md:bottom-5">
      <div
        className="pointer-events-auto max-h-[80dvh] w-full max-w-md overflow-y-auto overscroll-contain rounded-[20px] bg-parchment p-3 shadow-panel slide-up"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-bark/55">{kindLabel}</p>
            <h2 className="font-display text-lg font-semibold leading-tight text-ink">{title}</h2>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={close}
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-parchment-dark text-ink"
          >
            <X className="size-4" />
          </button>
        </div>
        <p className="mt-0.5 line-clamp-2 text-sm font-semibold leading-snug text-bark/75">{popup.blurb}</p>
        {popup.hotspotId==="sunstep-future-dock"&&<details className="mt-2 max-h-[35dvh] overflow-y-auto text-sm text-ink"><summary className="min-h-11 cursor-pointer rounded-xl bg-parchment-dark px-3 py-2 font-bold">Read harbour plans</summary><p className="mt-2 leading-relaxed">{popup.blurb}</p></details>}
        {npc && NPC_STATS[npc.id] ? (
          <p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-bark/55">
            Heart {NPC_STATS[npc.id]!.hp} · Attack {NPC_STATS[npc.id]!.atk} · Defence {NPC_STATS[npc.id]!.def} · Valor {NPC_STATS[npc.id]!.valor}
          </p>
        ) : null}
        {enemy && popup.kind !== "npc" ? (
          <p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-bark/55">
            {enemyStats?.hp ?? enemy.hp} heart · hits around {enemyStats?.dmg ?? enemy.dmg}
          </p>
        ) : null}
        {building ? (
          <p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-bark/55">
            Structure {hp[building]}/{BUILDING_MAX[building]}
          </p>
        ) : null}
        {npcQuests.map((q) => {
          const def = QUEST_BY_ID[q.id];
          if (!def) return null;
          const hint =
            q.id === "lost-chicken" && chickenHeld
              ? "Cluckers is under your arm. Talk-to Pipkin."
              : q.id === "pie-run" && pieHeld && popup.npcId === "brine"
                ? "Hand over the pie."
                : q.id === "mushroom-hello" && woodsGreeted
                  ? "The mushrooms were greeted. Talk-to Bramble."
                  : q.id === "pappy-timber" && q.stage === "ready"
                    ? "Log in hand. Talk-to Ol Pappy."
                    : q.id === "pappy-expand" && q.stage === "ready"
                      ? "The town grew. Tell Ol Pappy."
                      : q.id === "pappy-landing" && q.stage === "ready"
                        ? "Shore is clear. Talk-to Ol Pappy."
                        : def.hint;
          return (
            <p key={q.id} className="mt-1 rounded-[10px] bg-gold/25 px-2 py-1 text-xs font-bold text-ink">
              {def.title} — {hint}
            </p>
          );
        })}

        <div className="mt-2 flex flex-wrap gap-1.5">
          {popup.kind === "npc" && popup.npcId ? (
            <>
              <Action label="Talk-to" onClick={() => npc ? talkTo(popup.npcId!) : speak(popup.blurb)} />
              {npc?.tradeInterior ? (
                <Action label="Trade" tone="gold" onClick={() => tradeWith(popup.npcId!)} />
              ) : (
                <Action
                  label="Listen again"
                  tone="quiet"
                  onClick={() => {
                    speak(npc ? randOf(npc.lines) : popup.blurb);
                  }}
                />
              )}
            </>
          ) : null}

          {popup.npcId === "wim" ? (
            <Action label="The chart" tone="gold" onClick={() => enter("chart")} />
          ) : null}

          {popup.npcId === "greg" ? (
            <Action
              label={chart ? "Follow the goblin map" : "No goblin map yet"}
              tone="gold"
              disabled={!chart}
              onClick={sailChart}
            />
          ) : null}

          {popup.kind === "tree" && popup.treeId ? (
            <TreeActions treeId={popup.treeId} />
          ) : null}

          {popup.kind === "flag" ? (
            <>
              <Action label="Attack" tone="berry" onClick={strikeFlag} />
              {afloat && cannons ? <Action label="Fire cannon" tone="gold" onClick={fireCannon} /> : null}
            </>
          ) : null}

          {popup.hotspotId === "captain" ? (
            <>
              <Action
                label="Talk-to"
                onClick={() =>
                  speak("Sail to build experience. Sailing 5 unlocks the sloop; Wim sells her for 180 coins.")
                }
              />
              <Action
                label={chart ? "Follow the goblin map" : "No goblin map"}
                tone="gold"
                disabled={!chart}
                onClick={sailChart}
              />
            </>
          ) : null}

          {popup.kind === "boat" ? (
            <>
              {BOATS.map((boat) => {
                const lv = levelFromXp(skills.sailing);
                const owned = boat.id === "row" || hulls.includes(boat.id);
                const locked = lv < boat.need || !owned || Boolean(afloat);
                return (
                  <Action
                    key={boat.id}
                    label={!owned ? `${boat.name} · buy at dockhouse` : lv < boat.need ? `${boat.name} · Sailing ${boat.need}` : afloat ? `${boat.name} · return to harbour first` : `Cast off · ${boat.name}`}
                    tone={boat.id === "sloop" ? "berry" : boat.id === popup.hotspotId ? "gold" : "pine"}
                    disabled={locked}
                    onClick={() => sailTo("haven", boat.id)}
                  />
                );
              })}
              {afloat ? <Action label="Return to harbour" tone="quiet" onClick={() => sailTo("dock")} /> : <SailingProgress />}
              {!cannons ? (
                <Action label="Cannons · 45" tone="gold" disabled={coins < 45} onClick={buyCannon} />
              ) : landing ? (
                <Action label="Fire cannon" tone="berry" onClick={fireCannon} />
              ) : null}
              <Action
                label={afloat ? "Fish from your boat" : "Board a boat to fish"}
                tone="gold"
                disabled={!activeBoat || activeBoat.need < 2}
                onClick={() => { const s = useGame.getState(); castLine("sea", s.gnomeX, s.gnomeY); }}
              />
            </>
          ) : null}

          {popup.kind === "plot" && popup.hotspotId ? <PlotActions id={popup.hotspotId} /> : null}

          {popup.kind === "fish" && popup.hotspotId === "shore" ? (
            <Action label="Cast" tone="gold" onClick={() => castLine("shore", 24, 560)} />
          ) : null}
          {popup.kind === "fish" && popup.hotspotId === "sea" ? (
            <Action label="Cast into the deep" tone="gold" onClick={() => castLine("sea", -40, 400)} />
          ) : null}

          {popup.hotspotId === "chicken" ? (
            <Action label="Pick up" tone="gold" onClick={pickChicken} />
          ) : null}

          {popup.hotspotId === "mushrooms" ? (
            <Action label="Say hello" onClick={greetMushrooms} />
          ) : null}

          {popup.interior && popup.hotspotId === "haven" ? (
            <Action label="Enter" onClick={() => enter(popup.interior!)} />
          ) : null}

          {popup.packId && popup.enemyId === "runt" ? (
            <Action label="Attack" tone="berry" onClick={() => startLanding(popup.packId!)} />
          ) : popup.packId && popup.enemyId ? (
            <Action label="Attack" tone="berry" onClick={() => startCreature(popup.packId!, popup.enemyId as EnemyId)} />
          ) : null}

          {popup.kind === "tower" ? (
            <TowerActions
              slotId={popup.hotspotId}
              placed={placed}
              coins={coins}
              onUpgrade={upgradeTower}
            />
          ) : null}

          {popup.raidId ? (
            <Action label="Attack" tone="berry" onClick={() => startRaid(popup.raidId!)} />
          ) : null}

          {popup.hotspotId === "life-dragon" && dragon.state !== "defeated" && dragon.state !== "soothed" ? (
            <>
              <Action label={`Attack ${dragon.name}`} tone="berry" onClick={() => startDragon("dragon")} />
              <Action label="Offer honey" tone="gold" disabled={honey < 1} onClick={soothe} />
              {fortLevel >= 4 ? <Action label="Rally the walls" onClick={rally} /> : null}
            </>
          ) : null}

          {popup.hotspotId === "absence" ? (
            <Action label="Attack" tone="berry" onClick={() => startDragon("absence")} />
          ) : null}

          {popup.place === "wildlands" && popup.kind !== "dragon" && popup.kind !== "enemy" ? (
            <Action label="Patrol" onClick={() => startPatrol("wildlands")} />
          ) : null}

          {popup.hotspotId === "cottage" ? (
            <Action label="Tea" tone="quiet" onClick={sipTea} />
          ) : null}

          {hurt && building ? (
            <Action label={`Repair · ${repairCost}`} tone="gold" onClick={() => repair(building)} />
          ) : null}

          {popup.hotspotId === "haven" ? (
            <Action
              label={`Train guard · ${24 + guardLevel * 18}`}
              tone="gold"
              onClick={upgradeGuard}
            />
          ) : null}
        </div>

        {placingId ? (
          <p className="mt-2 rounded-[12px] bg-gold/30 px-3 py-1.5 text-xs font-bold text-ink">
            Tap a glowing plot for the {CATALOG_BY_ID[placingId]?.name.toLowerCase()}.
          </p>
        ) : null}
      </div>
    </div>
  );
}
