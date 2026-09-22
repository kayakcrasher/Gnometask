import { ABSENCE_SPOT, DRAGON_RIDGE, WORLD_PACK } from "@/lib/game/catalog";
import { useGame } from "@/lib/game/store";
import type { GamePopup } from "@/lib/game/types";
import { AbsenceDragon, Dragon, FlameBurst, PackCreature } from "./creatures";
import { MapHotspot } from "./map-hotspot";

type Hover = (label: string, clientX: number, clientY: number) => void;

export function MapFights({
  raiding,
  hoverTip,
  goFight,
  interact,
}: {
  raiding: boolean;
  hoverTip: Hover;
  goFight: (x: number, y: number, start: () => void) => void;
  interact: (x: number, y: number, popup: GamePopup, range?: number) => void;
}) {
  const save = useGame();
  return (
    <>
      {raiding
        ? [
            [900, 460],
            [1040, 540],
            [370, 400],
            [780, 500],
          ].map(([x, y], i) => <FlameBurst key={i} x={x!} y={y!} />)
        : null}

      {WORLD_PACK.map((pack) => {
        if (save.clearedPack.includes(pack.id)) return null;
        if (save.combat?.packId === pack.id) return null;
        return (
          <MapHotspot
            key={pack.id}
            x={pack.x}
            y={pack.y}
            rx={32}
            ry={28}
            selected={save.popup?.hotspotId === pack.id}
            label={pack.enemy}
            onHover={hoverTip}
            onActivate={() => goFight(pack.x, pack.y, () => save.startCreature(pack.id, pack.enemy))}
          >
            <ellipse cx={pack.x} cy={pack.y + 18} rx="28" ry="12" fill="#d6a84c" opacity="0.35" className="pulse-slot" />
            <PackCreature kind={pack.enemy} x={pack.x} y={pack.y} />
          </MapHotspot>
        );
      })}

      {save.raids.map((raid) => {
        if (save.combat?.raidId === raid.id) return null;
        return (
          <MapHotspot
            key={raid.id}
            x={raid.x}
            y={raid.y}
            rx={34}
            ry={30}
            selected={save.popup?.hotspotId === raid.id}
            label={raid.kind === "goblin" ? "Green goblin" : "Dark elf raider"}
            onHover={hoverTip}
            onActivate={() => goFight(raid.x, raid.y, () => save.startRaidFight(raid.id))}
          >
            <ellipse cx={raid.x} cy={raid.y + 16} rx="24" ry="10" fill="#a8433b" opacity="0.45" className="pulse-slot" />
            <PackCreature kind={raid.kind} x={raid.x} y={raid.y} />
          </MapHotspot>
        );
      })}

      {save.lifeDragon.state !== "defeated" && save.combat?.enemyId !== "dragon" ? (
        <MapHotspot
          x={raiding ? 980 : DRAGON_RIDGE.x}
          y={raiding ? 420 : DRAGON_RIDGE.y}
          rx={70}
          ry={48}
          selected={save.popup?.hotspotId === "life-dragon"}
          label={save.lifeDragon.name}
          onHover={hoverTip}
          onActivate={() => {
            const at = raiding ? { x: 980, y: 420 } : DRAGON_RIDGE;
            interact(
              at.x,
              at.y,
              {
                kind: "dragon",
                hotspotId: "life-dragon",
                title: save.lifeDragon.name,
                blurb:
                  save.lifeDragon.state === "soothed"
                    ? "Napping on a honey cake. The roofs are safe today."
                    : raiding
                      ? "Breathing fire on the village. Fight, soothe with honey, or rally the walls."
                      : "The major thing on the ridge. 150 heart. Customize it in the menu.",
                place: "wildlands",
                enemyId: "dragon",
              },
              110,
            );
          }}
        >
          <Dragon
            x={raiding ? 980 : DRAGON_RIDGE.x}
            y={raiding ? 420 : DRAGON_RIDGE.y}
            scale={raiding ? 1.35 : 1.15}
            friend={save.lifeDragon.state === "soothed"}
            look={save.lifeDragon.look}
            horn={save.lifeDragon.horn}
          />
        </MapHotspot>
      ) : null}

      {save.absencePending && save.combat?.enemyId !== "absence" ? (
        <MapHotspot
          x={ABSENCE_SPOT.x}
          y={ABSENCE_SPOT.y}
          rx={70}
          ry={48}
          selected={save.popup?.hotspotId === "absence"}
          label="The Absence Dragon"
          onHover={hoverTip}
          onActivate={() =>
            interact(
              ABSENCE_SPOT.x,
              ABSENCE_SPOT.y,
              {
                kind: "dragon",
                hotspotId: "absence",
                title: "The Absence Dragon",
                blurb: "Blue, fat, 300 heart. It arrived because you did not. Mid damage. Maximum mood.",
                place: "dock",
                enemyId: "absence",
              },
              110,
            )
          }
        >
          <AbsenceDragon x={ABSENCE_SPOT.x} y={ABSENCE_SPOT.y} scale={1.05} />
        </MapHotspot>
      ) : null}
    </>
  );
}
