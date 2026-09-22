import { CATALOG_BY_ID, GARDEN_FEATURE_SLOTS, GARDEN_SLOTS, TOWER_SLOTS, VILLAGE_SLOTS } from "@/lib/game/catalog";
import { useGame } from "@/lib/game/store";
import type { PointerEvent as ReactPointerEvent } from "react";
import { FLOWER_COLORS } from "./map-data";
import { Flower, PlantById, VillageById } from "./props";

export function MapPlots({ wildCount }: { wildCount: number }) {
  const save = useGame();
  const placingPrefix = save.placingId ? CATALOG_BY_ID[save.placingId]?.slotPrefix ?? null : null;

  const onSlotPointer = (event: ReactPointerEvent, slotId: string) => {
    event.stopPropagation();
    save.placeAt(slotId);
  };

  return (
    <>
      {GARDEN_SLOTS.map((slot, i) => {
        const plant = save.placed.find((p) => p.slotId === slot.id);
        const isOpen = placingPrefix === "g" && !plant;
        const showWild = !plant && i < wildCount;
        return (
          <g key={slot.id}>
            {isOpen ? (
              <ellipse
                cx={slot.x}
                cy={slot.y + 10}
                rx="22"
                ry="10"
                fill="#d6a84c"
                opacity="0.5"
                pointerEvents="auto"
                className="pulse-slot cursor-pointer"
                onPointerDown={(e) => onSlotPointer(e, slot.id)}
              />
            ) : null}
            <g pointerEvents="none">
              {plant ? <PlantById id={plant.catalogId} x={slot.x} y={slot.y} /> : null}
              {showWild ? <Flower x={slot.x} y={slot.y} color={FLOWER_COLORS[i % FLOWER_COLORS.length]!} /> : null}
            </g>
          </g>
        );
      })}

      {GARDEN_FEATURE_SLOTS.map((slot) => {
        const plant = save.placed.find((p) => p.slotId === slot.id);
        const isOpen = placingPrefix === "gf" && !plant;
        return (
          <g key={slot.id}>
            <circle
              cx={slot.x}
              cy={slot.y}
              r="22"
              fill="#d6a84c"
              opacity={isOpen ? 0.45 : 0}
              pointerEvents={isOpen ? "auto" : "none"}
              className={isOpen ? "pulse-slot cursor-pointer" : undefined}
              onPointerDown={(e) => isOpen && onSlotPointer(e, slot.id)}
            />
            <g pointerEvents="none">{plant ? <PlantById id={plant.catalogId} x={slot.x} y={slot.y} /> : null}</g>
          </g>
        );
      })}

      {VILLAGE_SLOTS.map((slot) => {
        const b = save.placed.find((p) => p.slotId === slot.id);
        const isOpen = placingPrefix === "v" && !b;
        return (
          <g key={slot.id}>
            <ellipse
              cx={slot.x}
              cy={slot.y + 16}
              rx="32"
              ry="14"
              fill="#d6a84c"
              opacity={isOpen ? 0.5 : b ? 0.12 : 0.08}
              pointerEvents={isOpen ? "auto" : "none"}
              className={isOpen ? "pulse-slot cursor-pointer" : undefined}
              onPointerDown={(e) => isOpen && onSlotPointer(e, slot.id)}
            />
            <g pointerEvents="none">{b ? <VillageById id={b.catalogId} x={slot.x} y={slot.y} /> : null}</g>
          </g>
        );
      })}

      {TOWER_SLOTS.map((slot) => {
        const b = save.placed.find((p) => p.slotId === slot.id);
        const isOpen = placingPrefix === "t" && !b;
        const item = b ? CATALOG_BY_ID[b.catalogId] : null;
        const rank = item?.towerRank ?? 1;
        return (
          <g key={slot.id}>
            <ellipse
              cx={slot.x}
              cy={slot.y + 16}
              rx="26"
              ry="12"
              fill="#d6a84c"
              opacity={isOpen ? 0.55 : b ? 0.15 : 0}
              pointerEvents={isOpen || b ? "auto" : "none"}
              className={isOpen ? "pulse-slot cursor-pointer" : b ? "cursor-pointer" : undefined}
              onPointerDown={(e) => {
                e.stopPropagation();
                if (isOpen) onSlotPointer(e, slot.id);
                else if (b && item) {
                  save.openPopup({
                    kind: "tower",
                    hotspotId: slot.id,
                    title: item.name,
                    blurb: item.blurb,
                    place: "dock",
                    x: slot.x,
                    y: slot.y,
                  });
                }
              }}
            />
            {b ? (
              <g pointerEvents="none" transform={`translate(${slot.x} ${slot.y})`}>
                <rect x="-8" y={-28 - rank * 8} width="16" height={28 + rank * 8} fill="#8a7a68" />
                <rect x="-18" y={-34 - rank * 8} width="36" height="8" fill="#c4a574" />
                {rank >= 3 ? <polygon points={`-20,${-34 - rank * 8} 0,${-52 - rank * 8} 20,${-34 - rank * 8}`} fill="#35543f" /> : null}
              </g>
            ) : null}
          </g>
        );
      })}
    </>
  );
}
