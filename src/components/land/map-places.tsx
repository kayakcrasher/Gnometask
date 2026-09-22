import { useGame } from "@/lib/game/store";
import type { GamePopup, InteriorId } from "@/lib/game/types";
import { HAVEN_ORIGIN, NPCS, TOWN_SHOPS } from "@/lib/game/world";
import { randOf } from "@/lib/game/quotes";
import type { NpcPose } from "@/hooks/use-npc-wander";
import { GnomeSprite } from "./gnome";
import { MapHotspot } from "./map-hotspot";
import { Cottage, RowHouse, TownHall } from "./props";
import { Chicken, GuardGnome } from "./creatures";

type Hover = (label: string, clientX: number, clientY: number) => void;

export function MapPlaces({
  npcPoses,
  hLevel,
  hoverTip,
  goInside,
  interact,
}: {
  npcPoses: Record<string, NpcPose>;
  hLevel: number;
  hoverTip: Hover;
  goInside: (x: number, y: number, interior: InteriorId) => void;
  interact: (x: number, y: number, popup: GamePopup, range?: number) => void;
}) {
  const save = useGame();
  return (
    <>
      <MapHotspot
        x={374}
        y={400}
        rx={62}
        ry={52}
        selected={save.popup?.hotspotId === "cottage"}
        label="The Cottage"
        onHover={hoverTip}
        onActivate={() => goInside(374, 430, "cottage")}
      >
        <Cottage x={330} y={340} upgrades={save.houseUpgrades} />
      </MapHotspot>

      {TOWN_SHOPS.map((shop) => (
        <MapHotspot
          key={shop.id}
          x={shop.x}
          y={shop.y}
          rx={shop.tall ? 56 : 48}
          ry={shop.tall ? 50 : 40}
          selected={save.interior === shop.interior}
          label={shop.label}
          onHover={hoverTip}
          onActivate={() => goInside(shop.x, shop.y, shop.interior)}
        >
          {shop.id === "townhall" ? (
            <TownHall x={shop.x - 50} y={shop.y - 72} level={save.townHallLevel} />
          ) : (
            <RowHouse x={shop.x - 44} y={shop.y - 52} roof={shop.roof} tall={shop.tall} sign={shop.sign} />
          )}
        </MapHotspot>
      ))}

      <MapHotspot
        x={98}
        y={276}
        rx={48}
        ry={36}
        selected={save.popup?.hotspotId === "mushrooms"}
        label="Mushroom ring"
        onHover={hoverTip}
        onActivate={() =>
          interact(98, 276, {
            kind: "quest",
            hotspotId: "mushrooms",
            title: "Mushroom ring",
            blurb: save.woodsGreeted
              ? "They've been greeted. They glow a little."
              : "The mushrooms like to be greeted. Tap Say hello.",
            place: "woods",
          })
        }
      />

      {NPCS.map((npc) => {
        const pose = npcPoses[npc.id];
        const nx = pose?.x ?? npc.x;
        const ny = pose?.y ?? npc.y;
        return (
          <MapHotspot
            key={npc.id}
            x={nx}
            y={ny}
            rx={28}
            ry={32}
            selected={save.popup?.hotspotId === npc.id}
            label={npc.name}
            onHover={hoverTip}
            onActivate={() =>
              interact(nx, ny, {
                kind: "npc",
                hotspotId: npc.id,
                title: npc.name,
                blurb: randOf(npc.lines),
                place: npc.place,
                npcId: npc.id,
              })
            }
          >
            <GnomeSprite
              hat={npc.hat}
              bounceKey={0}
              walking={pose?.walking}
              facing={pose?.facing ?? "down"}
              transform={`translate(${nx - 24} ${ny - 48}) scale(0.5)`}
            />
          </MapHotspot>
        );
      })}

      {save.chicken &&
      !save.chickenHeld &&
      save.quests.some((q) => q.id === "lost-chicken" && q.stage !== "done") ? (
        <MapHotspot
          x={save.chicken.x}
          y={save.chicken.y}
          rx={28}
          ry={22}
          selected={save.popup?.hotspotId === "chicken"}
          label="Cluckers"
          onHover={hoverTip}
          onActivate={() =>
            interact(save.chicken!.x, save.chicken!.y, {
              kind: "quest",
              hotspotId: "chicken",
              title: "Cluckers",
              blurb: "Pipkin's round bird with opinions. Pick her up and take her home.",
              place: "garden",
            })
          }
        >
          <Chicken x={save.chicken.x} y={save.chicken.y} />
        </MapHotspot>
      ) : null}

      {hLevel >= 1 ? (
        <MapHotspot
          x={HAVEN_ORIGIN.x}
          y={HAVEN_ORIGIN.y}
          rx={88}
          ry={48}
          selected={save.popup?.hotspotId === "haven"}
          label="Haven"
          onHover={hoverTip}
          onActivate={() =>
            interact(HAVEN_ORIGIN.x, HAVEN_ORIGIN.y, {
              kind: "building",
              hotspotId: "haven",
              title: "Haven",
              blurb:
                hLevel >= 3
                  ? `Unique steel and a Guardsgnome at rank ${save.guardLevel}. The stall is open.`
                  : "A second village arriving slowly. Train the Guardsgnome. Unique wares come later.",
              place: "haven",
              interior: hLevel >= 3 ? "haven-shop" : undefined,
              building: "haven",
            })
          }
        >
          <GuardGnome x={HAVEN_ORIGIN.x + 40} y={HAVEN_ORIGIN.y - 10} scale={1.15} level={save.guardLevel} />
        </MapHotspot>
      ) : null}
    </>
  );
}
