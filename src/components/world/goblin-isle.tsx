import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { useGame } from "@/lib/game/store";

function Mud() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]} receiveShadow>
      <circleGeometry args={[7.2, 28]} />
      <meshStandardMaterial color="#6a5a3a" roughness={0.95} />
    </mesh>
  );
}

function Hut({ position, surrendered }: { position: [number, number, number]; surrendered: boolean }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.45, 0]} castShadow>
        <boxGeometry args={[1.15, 0.9, 0.9]} />
        <meshStandardMaterial color="#7a6a48" />
      </mesh>
      <mesh position={[0, 1.05, 0]} rotation={[0, 0.4, 0]} castShadow>
        <coneGeometry args={[0.85, 0.55, 4]} />
        <meshStandardMaterial color={surrendered ? "#e6dcc4" : "#5a6a32"} />
      </mesh>
    </group>
  );
}

function Gob({
  position,
  chief,
  label,
  hp,
  onClick,
}: {
  position: [number, number, number];
  chief?: boolean;
  label: string;
  hp?: string;
  onClick?: () => void;
}) {
  const ref = useRef<THREE.Group>(null);
  const combat = useGame((s) => s.combat);
  const lunging = Boolean(onClick && combat && combat.striking && (chief ? combat.enemyId === "chief" : combat.enemyId === "raider"));
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.position.y = Math.sin(clock.elapsedTime * 2 + position[0]) * 0.04;
    ref.current.position.z = lunging ? 0.35 : 0;
  });
  return (
    <group position={position} onClick={(e) => { e.stopPropagation(); onClick?.(); }}>
      <group ref={ref}>
        <mesh position={[0, 0.42, 0]} castShadow>
          <capsuleGeometry args={[chief ? 0.22 : 0.16, 0.28, 4, 8]} />
          <meshStandardMaterial color="#6f8f40" />
        </mesh>
        <mesh position={[0, 0.78, 0]} castShadow>
          <sphereGeometry args={[chief ? 0.2 : 0.15, 10, 10]} />
          <meshStandardMaterial color="#7ea04a" />
        </mesh>
        {chief ? (
          <mesh position={[0, 0.98, 0]}>
            <boxGeometry args={[0.28, 0.08, 0.08]} />
            <meshStandardMaterial color="#c4553a" />
          </mesh>
        ) : null}
        <Html position={[0, 1.15, 0]} center zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
          <div className="rounded-full bg-ink/80 px-2 py-0.5 text-[10px] font-bold text-parchment">
            {label}
            {hp ? ` ${hp}` : ""}
          </div>
        </Html>
      </group>
    </group>
  );
}

function IsleScene() {
  const surrendered = useGame((s) => s.surrendered);
  const raiders = useGame((s) => s.muckRaiders);
  const fight = useGame((s) => s.startIsleFight);
  const combat = useGame((s) => s.combat);
  const spots: [number, number, number][] = [
    [-1.6, 0, 1.2],
    [1.7, 0, 1.1],
    [0.2, 0, 2.2],
  ];
  const foeHp =
    combat && (combat.enemyId === "chief" || combat.enemyId === "raider")
      ? `${combat.enemyHp}/${combat.enemyMax}`
      : undefined;
  return (
    <>
      <color attach="background" args={["#6e8f86"]} />
      <hemisphereLight args={["#d7c4a4", "#4a3a28", 0.9]} />
      <directionalLight position={[6, 10, 4]} intensity={1.1} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.55, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#3d6a66" />
      </mesh>
      <Mud />
      <Hut position={[-2.4, 0, -0.4]} surrendered={surrendered} />
      <Hut position={[2.3, 0, -0.2]} surrendered={surrendered} />
      <Hut position={[-1.2, 0, -2.1]} surrendered={surrendered} />
      <Hut position={[1.4, 0, -2.2]} surrendered={surrendered} />
      {raiders.map((alive, i) =>
        alive && !surrendered ? (
          <Gob
            key={i}
            position={spots[i]!}
            label="raider"
            hp={combat?.packId === `muck-r${i}` ? foeHp : undefined}
            onClick={() => fight(i)}
          />
        ) : null,
      )}
      {!surrendered ? (
        <Gob position={[0, 0, -0.2]} chief label="Chief" hp={combat?.enemyId === "chief" ? foeHp : undefined} onClick={() => fight("chief")} />
      ) : (
        <Html position={[0, 1.2, 0]} center>
          <p className="rounded-2xl bg-parchment px-3 py-2 text-center text-xs font-bold text-ink">The town surrendered.</p>
        </Html>
      )}
      <group position={[0, 0, 3.1]}>
        <mesh position={[0, 0.45, 0]} castShadow>
          <capsuleGeometry args={[0.16, 0.32, 4, 8]} />
          <meshStandardMaterial color="#c4553a" />
        </mesh>
        <mesh position={[0, 0.85, 0]}>
          <sphereGeometry args={[0.14, 10, 10]} />
          <meshStandardMaterial color="#e6c2a4" />
        </mesh>
      </group>
    </>
  );
}

export function GoblinIsle() {
  const abroad = useGame((s) => s.abroad);
  const leave = useGame((s) => s.leaveIsle);
  const speech = useGame((s) => s.speech);
  const respect = useGame((s) => s.respect);
  if (abroad !== "mucktooth") return null;
  return (
    <div className="fixed inset-0 z-10 bg-[#3d6a66]">
      <Canvas camera={{ position: [0, 7.5, 8.5], fov: 42 }} shadows>
        <IsleScene />
      </Canvas>
      <div className="pointer-events-none absolute inset-x-0 top-24 flex justify-center px-4">
        <p className="max-w-md rounded-2xl bg-parchment/95 px-4 py-2 text-center text-sm font-semibold text-ink shadow-panel">{speech}</p>
      </div>
      <div className="absolute bottom-6 right-4 flex flex-col items-end gap-2">
        <p className="rounded-full bg-ink/80 px-3 py-1 text-xs font-bold text-parchment">Respect {respect}</p>
        <button type="button" onClick={leave} className="h-11 rounded-2xl bg-parchment px-4 font-display text-sm font-semibold text-ink">
          Back to the hollow
        </button>
      </div>
    </div>
  );
}
