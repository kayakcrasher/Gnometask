import { X } from "lucide-react";
import { CATALOG_BY_ID } from "@/lib/game/catalog";
import { ENEMIES } from "@/lib/game/combat";
import { BUILDING_MAX } from "@/lib/game/types";
import { useGame } from "@/lib/game/store";
import { NPCS } from "@/lib/game/world";
import { QUEST_BY_ID } from "@/lib/game/quests";
import { randOf } from "@/lib/game/quotes";
import type { EnemyId } from "@/lib/game/combat";
import { cn } from "@/lib/utils";

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

export function ClickPopup() {
  const popup = useGame((s) => s.popup);
  const close = useGame((s) => s.closePopup);
  const enter = useGame((s) => s.enterInterior);
  const startCreature = useGame((s) => s.startCreature);
  const startDragon = useGame((s) => s.startDragon);
  const startRaid = useGame((s) => s.startRaidFight);
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
  const chopTree = useGame((s) => s.chopTree);
  const sailTo = useGame((s) => s.sailTo);

  if (!popup) return null;

  const enemy = popup.enemyId ? ENEMIES[popup.enemyId as EnemyId] : null;
  const building = popup.building;
  const hurt = building ? hp[building] < BUILDING_MAX[building] : false;
  const repairCost = building
    ? Math.max(4, Math.ceil((BUILDING_MAX[building] - hp[building]) / 2))
    : 0;
  const title = enemy && popup.kind !== "dragon" ? enemy.name : popup.title;
  const npc = popup.npcId ? NPCS.find((n) => n.id === popup.npcId) : null;
  const npcQuests = quests.filter((q) => {
    if (q.stage === "done") return false;
    const def = QUEST_BY_ID[q.id];
    if (!def) return false;
    if (popup.npcId && (def.giver === popup.npcId || (q.id === "pie-run" && popup.npcId === "brine"))) {
      return true;
    }
    return false;
  });

  const kindLabel =
    popup.kind === "npc"
      ? "Neighbour"
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
        className="pointer-events-auto w-full max-w-md rounded-[20px] bg-parchment p-3 shadow-panel slide-up"
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
        {enemy && popup.kind !== "npc" ? (
          <p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-bark/55">
            {enemy.hp} heart · hits around {enemy.dmg}
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
              <Action label="Talk-to" onClick={() => talkTo(popup.npcId!)} />
              {npc?.tradeInterior ? (
                <Action label="Trade" tone="gold" onClick={() => tradeWith(popup.npcId!)} />
              ) : (
                <Action
                  label="Listen again"
                  tone="quiet"
                  onClick={() => {
                    if (npc) speak(randOf(npc.lines));
                  }}
                />
              )}
            </>
          ) : null}

          {popup.kind === "tree" && popup.treeId ? (
            <Action label="Chop" tone="gold" onClick={() => chopTree(popup.treeId!)} />
          ) : null}

          {popup.kind === "boat" ? (
            <>
              <Action label="Sail to Haven" onClick={() => sailTo("haven")} />
              <Action label="Dock" tone="quiet" onClick={() => sailTo("dock")} />
            </>
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

          {popup.packId && popup.enemyId ? (
            <Action label="Attack" tone="berry" onClick={() => startCreature(popup.packId!, popup.enemyId as EnemyId)} />
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
