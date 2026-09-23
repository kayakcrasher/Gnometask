import { useEffect, useState } from "react";
import { CROP_BY_ID, YARD_PLOTS, pailBonusMs, plotStage } from "@/lib/game/data/crops";
import { LAND_OFFERS } from "@/lib/game/data/honour";
import { useGame } from "@/lib/game/store";
import { groundY, to3 } from "@/lib/game/world3";
import type { GamePopup } from "@/lib/game/types";

export function YardPlots({
  onPlot,
}: {
  onPlot: (id: string, x: number, y: number, popup: Pick<GamePopup, "title" | "blurb">) => void;
}) {
  const plots = useGame((s) => s.plots);
  const owned = useGame((s) => s.ownedGear);
  const claimed = useGame((s) => s.claimed);
  const beds = [
    ...YARD_PLOTS,
    ...LAND_OFFERS.filter((t) => t.kind === "yard" && claimed.includes(t.id)).map((t) => ({ id: t.id, x: t.x, y: t.y })),
  ];
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);
  const bonus = pailBonusMs(owned) ?? 0;
  return (
    <group>
      {beds.map((plot) => {
        const save = plots[plot.id];
        const stage = plotStage(save, now, bonus);
        const crop = save ? CROP_BY_ID[save.crop] : null;
        const p = to3(plot.x, plot.y, groundY(plot.x, plot.y));
        const h = stage === "ready" ? 0.42 : stage === "sprout" ? 0.24 : stage === "seed" || stage === "thirsty" ? 0.1 : 0;
        return (
          <group
            key={plot.id}
            position={p}
            onClick={(e) => {
              e.stopPropagation();
              onPlot(plot.id, plot.x, plot.y, {
                title: crop ? crop.name : "Yard bed",
                blurb:
                  stage === "empty"
                    ? "A bed in front of the cottage. Seeds are at the builder's yard."
                    : stage === "thirsty"
                      ? "It's in the soil and waiting on the pail."
                      : stage === "dead"
                        ? "Too long without water. Clear the bed."
                        : stage === "ready"
                          ? "Ready to pull."
                          : "Growing. Water it again before it wilts.",
              });
            }}
          >
            <mesh position={[0, 0.06, 0]} receiveShadow>
              <boxGeometry args={[0.7, 0.08, 0.5]} />
              <meshStandardMaterial color={stage === "dead" ? "#8a6a48" : "#6b4a32"} />
            </mesh>
            {h > 0 && crop ? (
              <mesh position={[0, 0.1 + h / 2, 0]} castShadow>
                <boxGeometry args={[stage === "ready" ? 0.28 : 0.16, h, 0.16]} />
                <meshStandardMaterial color={crop.color} />
              </mesh>
            ) : null}
            {stage === "ready" && crop ? (
              <mesh position={[0, 0.62, 0]}>
                <sphereGeometry args={[0.12, 8, 8]} />
                <meshStandardMaterial color={crop.color} />
              </mesh>
            ) : null}
          </group>
        );
      })}
    </group>
  );
}
