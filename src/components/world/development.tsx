import { useRef } from "react";
import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { useGame } from "@/lib/game/store";
import { ROAD_PROJECTS, roadPortion } from "@/lib/game/data/expansion";
import { estateAccess } from "@/lib/game/land-planning";
import { groundY, to3 } from "@/lib/game/world3";
import { GnomeRig } from "./gnome-rig";
export function EstateHomes() {
  const estate = useGame((s) => s.estate),
    open = useGame((s) => s.openPopup);
  return (
    <group>
      {Object.entries(estate).map(([id, home]) => {
        const { yaw } = estateAccess(home),
          h = 0.9 + home.level * 0.55;
        return (
          <group
            key={id}
            position={to3(home.x, home.y, groundY(home.x, home.y))}
            rotation={[0, yaw, 0]}
            onClick={(e) => {
              e.stopPropagation();
              open({
                kind: "place",
                hotspotId: id,
                title: "Your roadside home",
                blurb: `${home.level} storey home. Open Deeds to extend it. Your deed includes the land around the public road, not the road itself.`,
                x: home.x,
                y: home.y,
              });
            }}
          >
            <mesh position={[0, h / 2, 0]} castShadow>
              <boxGeometry args={[2.2, h, 1.85]} />
              <meshStandardMaterial
                color={home.level === 3 ? "#d6d1be" : "#e5d3a9"}
              />
            </mesh>
            <mesh
              position={[0, h + 0.2, 0]}
              rotation={[0, Math.PI / 4, 0]}
              castShadow
            >
              <coneGeometry args={[1.7, 0.65, 4]} />
              <meshStandardMaterial
                color={home.level > 1 ? "#536e68" : "#9c5341"}
              />
            </mesh>
            <mesh position={[0, 0.4, 0.94]}>
              <boxGeometry args={[0.4, 0.8, 0.04]} />
              <meshStandardMaterial color="#725032" />
            </mesh>
            {Array.from({ length: home.level }, (_, i) =>
              [-1, 1].map((side) => (
                <mesh
                  key={`${i}-${side}`}
                  position={[side * 0.65, 0.7 + i * 0.5, 0.95]}
                >
                  <boxGeometry args={[0.33, 0.28, 0.03]} />
                  <meshStandardMaterial color="#8eafb2" />
                </mesh>
              )),
            )}
            <Html
              position={[0, h + 0.9, 0]}
              center
              distanceFactor={20}
              style={{ pointerEvents: "none" }}
            >
              <span className="whitespace-nowrap rounded-full bg-pine/85 px-2 py-1 text-[10px] font-bold text-parchment">
                Your home · {home.level}F
              </span>
            </Html>
          </group>
        );
      })}
    </group>
  );
}
export function RoadCrew() {
  const works = useGame((s) => s.roadWorks),
    open = useGame((s) => s.openPopup);
  const active = works.active,
    project = ROAD_PROJECTS.find((p) => p.id === active?.id);
  const points = project
    ? roadPortion(project.points, active!.progress)
    : [[900, 490]];
  const tip = points[points.length - 1]!,
    arm = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (arm.current)
      arm.current.rotation.x = Math.sin(clock.elapsedTime * 5) * 0.5;
  });
  return (
    <group
      position={to3(tip[0]!, tip[1]!, groundY(tip[0]!, tip[1]!))}
      onClick={(e) => {
        e.stopPropagation();
        open({
          kind: "place",
          hotspotId: "road-crew",
          title: "Holt's road crew",
          blurb: active
            ? `${project?.name}: ${Math.round(active.progress * 100)}%. The crew clears and lays the new road without taking neighbouring parcels. Open Deeds → Road crew to manage projects.`
            : "The crew is ready. Open Deeds → Road crew to fund the northern routes.",
          x: tip[0],
          y: tip[1],
        });
      }}
    >
      <GnomeRig
        hat="hat-straw"
        coat="#cf9649"
        scale={1.1}
        gesture={active ? "hammer" : null}
      />
      <group position={[1.2, 0, 0.2]}>
        <GnomeRig hat="hat-guard" coat="#c6a35d" scale={1.05} />
      </group>
      <group ref={arm} position={[-0.5, 0.8, 0.1]}>
        <mesh position={[0, 0.25, 0]}>
          <boxGeometry args={[0.05, 0.5, 0.05]} />
          <meshStandardMaterial color="#7e5739" />
        </mesh>
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[0.3, 0.12, 0.12]} />
          <meshStandardMaterial color="#7c8584" />
        </mesh>
      </group>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 1.8, 0.2, 0.7]}>
          <coneGeometry args={[0.16, 0.4, 6]} />
          <meshStandardMaterial color="#dc9b48" />
        </mesh>
      ))}
      <mesh position={[-1.2, 0.2, -0.5]}>
        <boxGeometry args={[0.6, 0.4, 0.8]} />
        <meshStandardMaterial color="#a28a61" />
      </mesh>
      <Html
        position={[0, 2, 0]}
        center
        distanceFactor={18}
        style={{ pointerEvents: "none" }}
      >
        <span className="whitespace-nowrap rounded-full bg-ink/85 px-2 py-1 text-[10px] font-bold text-parchment">
          Road crew ·{" "}
          {active ? `${Math.round(active.progress * 100)}%` : "ready"}
        </span>
      </Html>
    </group>
  );
}
export function NorthernScenery() {
  const estate = useGame((s) => s.estate),
    plots = useGame((s) => s.civic.plots);
  const homes = [
    ...Object.values(estate),
    ...plots.filter((p) => p.stories > 0),
  ];
  return (
    <group>
      {[
        { x: 1140, y: -500 },
        { x: 1250, y: -600 },
        { x: 2010, y: -430 },
        { x: 1800, y: -350 },
      ]
        .filter(
          (p) =>
            !homes.some(
              (h) => Math.abs(h.x - p.x) < 40 && Math.abs(h.y - p.y) < 38,
            ),
        )
        .map((p, i) => (
          <group key={i} position={to3(p.x, p.y, groundY(p.x, p.y))}>
            <mesh position={[0, 0.5, 0]} scale={[1.3, 0.8, 1]}>
              <dodecahedronGeometry args={[0.7, 0]} />
              <meshStandardMaterial color="#8b9180" />
            </mesh>
            <mesh position={[1.1, 1.1, 0]}>
              <coneGeometry args={[0.6, 2.2, 7]} />
              <meshStandardMaterial color="#4b7352" />
            </mesh>
          </group>
        ))}
      <Html
        position={to3(1630, -470, 2.3)}
        center
        distanceFactor={25}
        style={{ pointerEvents: "none" }}
      >
        <span className="whitespace-nowrap rounded-full bg-pine/90 px-3 py-1 font-display text-sm text-parchment">
          Noble Reach · beyond the mountain
        </span>
      </Html>
    </group>
  );
}
