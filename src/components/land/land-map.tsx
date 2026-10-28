import { useMemo, useRef, useState } from "react";
import { IslandCanvas } from "@/components/world/island-scene";
import { Island2d } from "@/components/land/island-2d";
import { useGnomeWalk } from "@/hooks/use-gnome-walk";
import { useNpcWander } from "@/hooks/use-npc-wander";
import { NPCS } from "@/lib/game/world";
import { useGame } from "@/lib/game/store";

export function LandMap() {
  const followRef = useRef({ x: 400, y: 478 });
  const { pos, facing, yaw, walking, marker, walkTo, speedRef } = useGnomeWalk(followRef);
  const combat = useGame((s) => s.combat);
  const interior = useGame((s) => s.interior);
  const residents = useGame(s => s.civic.gnomes);
  const atHome = useGame(s => s.atHome), abroad = useGame(s => s.abroad);
  const homes = useMemo(() => [...NPCS, ...residents.filter(g => !NPCS.some(n => n.id === g.id)).map(g => ({ id: g.id, x: g.x, y: g.y, job: g.job }))], [residents]);
  const npcPoses = useNpcWander(homes, Boolean(combat || interior || atHome || abroad));
  const [mode, setMode] = useState<"3d" | "2d">("3d");

  // Keep walking state, but release the outdoor renderer while a room is open.
  if(interior)return null;
  return (
    <div className="absolute inset-0 z-0 isolate min-h-0 overflow-hidden bg-water-deep">
      {mode === "3d" ? (
        <IslandCanvas
          pos={pos}
          yaw={yaw}
          walking={walking}
          marker={marker}
          walkTo={walkTo}
          speedRef={speedRef}
          npcPoses={npcPoses}
          onFail={() => setMode("2d")}
        />
      ) : (
        <Island2d pos={pos} facing={facing} walking={walking} marker={marker} walkTo={walkTo} npcPoses={npcPoses} />
      )}
    </div>
  );
}
