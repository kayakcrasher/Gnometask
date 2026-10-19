import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { useGame } from "@/lib/game/store";
import { to3, groundY } from "@/lib/game/world3";
function Flutter({
  x,
  y,
  color,
  reduced,
  night,
}: {
  x: number;
  y: number;
  color: string;
  reduced: boolean;
  night: boolean;
}) {
  const ref = useRef<Group>(null),
    wings = useRef<Group>(null),
    seed = x * 0.013 + y * 0.007;
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = reduced ? seed : clock.elapsedTime * 0.7 + seed,
      px = x + Math.sin(t) * 14,
      py = y + Math.cos(t * 0.8) * 11;
    ref.current.position.set(
      ...to3(px, py, groundY(px, py) + 0.65 + Math.sin(t * 1.4) * 0.12),
    );
    ref.current.rotation.y = t * 0.3;
    wings.current?.children.forEach((wing, i) => {
      wing.rotation.z = reduced
        ? i
          ? -0.35
          : 0.35
        : Math.sin(t * 10) * (i ? -1 : 1) * 0.7;
    });
  });
  return (
    <group ref={ref} position={to3(x, y, groundY(x, y) + 0.7)}>
      {night ? (
        <mesh>
          <sphereGeometry args={[0.025, 6, 5]} />
          <meshStandardMaterial
            color="#e7dea0"
            emissive="#d3cf80"
            emissiveIntensity={1}
          />
        </mesh>
      ) : (
        <>
          <mesh>
            <capsuleGeometry args={[0.014, 0.08, 3, 5]} />
            <meshStandardMaterial color="#755f48" />
          </mesh>
          <group ref={wings}>
            {[-1, 1].map((side) => (
              <group key={side}>
                <mesh position={[side * 0.07, 0, 0]} scale={[0.09, 0.06, 0.02]}>
                  <sphereGeometry args={[1, 8, 6]} />
                  <meshStandardMaterial color={color} />
                </mesh>
                <mesh
                  position={[side * 0.05, -0.045, 0]}
                  scale={[0.06, 0.045, 0.018]}
                >
                  <sphereGeometry args={[1, 8, 6]} />
                  <meshStandardMaterial color={color} />
                </mesh>
              </group>
            ))}
          </group>
        </>
      )}
    </group>
  );
}
export function GardenWhimsy() {
  const x = useGame((s) => s.gnomeX),
    y = useGame((s) => s.gnomeY),
    phase = useGame((s) => s.dayPhase),
    paused = useGame(
      (s) => !!s.combat || !!s.interior || s.atHome || !!s.abroad,
    ),
    [reduced, setReduced] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)"),
      update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  if (paused || reduced) return null;
  const night = phase === "night" || phase === "dusk";
  const spots = night
    ? [
        [430, 285],
        [605, 280],
        [515, 320],
        [450, 360],
      ]
    : [
        [220, 680],
        [290, 730],
        [370, 650],
        [680, 870],
        [875, 510],
        [1070, 470],
      ];
  return (
    <group>
      {spots
        .filter(([px, py]) => Math.hypot(px! - x, py! - y) < 300)
        .map(([px, py], i) => (
          <Flutter
            key={i}
            x={px!}
            y={py!}
            color={["#e3bc83", "#cba8b6", "#bfcda3"][i % 3]!}
            reduced={reduced}
            night={night}
          />
        ))}
    </group>
  );
}
