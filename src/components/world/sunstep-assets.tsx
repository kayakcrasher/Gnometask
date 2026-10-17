import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import type { Group } from "three";
import { SUNSTEP_FEATURES } from "@/lib/game/data/sunstep";
import { groundY, to3 } from "@/lib/game/world3";

export function DesertPalm({
  x,
  y,
  scale = 1,
}: {
  x: number;
  y: number;
  scale?: number;
}) {
  return (
    <group position={to3(x, y, groundY(x, y))} scale={scale}>
      <mesh position={[0, 1, 0]} rotation={[0, 0, -0.1]} castShadow>
        <cylinderGeometry args={[0.09, 0.16, 2, 7]} />
        <meshStandardMaterial color="#94633f" />
      </mesh>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <group
          key={i}
          position={[-0.1, 2, 0]}
          rotation={[0, (i * Math.PI) / 3, 0]}
        >
          <mesh position={[0.65, -0.07, 0]} rotation={[0, 0, -0.18]} castShadow>
            <boxGeometry args={[1.55, 0.06, 0.35]} />
            <meshStandardMaterial color={i % 2 ? "#487748" : "#71934b"} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
export function NeonSign({
  text,
  accent = "#ff4fa3",
  height = 2.6,
}: {
  text: string;
  accent?: string;
  height?: number;
}) {
  return (
    <group>
      {[-0.85, 0.85].map((x) => (
        <mesh key={x} position={[x, height / 2, 0]}>
          <boxGeometry args={[0.12, height, 0.12]} />
          <meshStandardMaterial color="#303441" />
        </mesh>
      ))}
      <mesh position={[0, height, 0]}>
        <boxGeometry args={[2.7, 1, 0.16]} />
        <meshStandardMaterial color="#1b2031" />
      </mesh>
      {[-0.44, 0.44].map((y) => (
        <mesh key={y} position={[0, height + y, 0.1]}>
          <boxGeometry args={[2.6, 0.045, 0.03]} />
          <meshStandardMaterial
            color={accent}
            emissive={accent}
            emissiveIntensity={2}
          />
        </mesh>
      ))}
      <Html
        position={[0, height, 0.12]}
        center
        distanceFactor={15}
        style={{ pointerEvents: "none" }}
      >
        <p
          style={{ color: accent, textShadow: `0 0 8px ${accent}` }}
          className="whitespace-nowrap font-display text-sm font-bold uppercase tracking-widest"
        >
          {text}
        </p>
      </Html>
    </group>
  );
}
export function CasinoLandmark({
  kind,
  accent,
}: {
  kind: string;
  accent: string;
}) {
  if (kind === "dome")
    return (
      <mesh position={[0, 0, 0]} scale={[1, 0.7, 1]}>
        <sphereGeometry args={[0.75, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial
          color="#bd9a54"
          metalness={0.65}
          roughness={0.3}
        />
      </mesh>
    );
  if (kind === "spire")
    return (
      <mesh position={[0, 0.8, 0]}>
        <coneGeometry args={[0.6, 1.6, 4]} />
        <meshStandardMaterial color={accent} metalness={0.4} roughness={0.35} />
      </mesh>
    );
  if (kind === "terrace")
    return (
      <group>
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[0, i * 0.22, 0]}>
            <boxGeometry args={[1.4 - i * 0.3, 0.2, 0.9 - i * 0.15]} />
            <meshStandardMaterial color={accent} />
          </mesh>
        ))}
      </group>
    );
  return (
    <group rotation={[0, 0.3, 0.1]}>
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[0.8, 0.8, 0.8]} />
        <meshStandardMaterial color="#f1e2bd" />
      </mesh>
      {[-0.2, 0, 0.2].map((x) => (
        <mesh key={x} position={[x, 0.4 + x, 0.411]}>
          <sphereGeometry args={[0.065, 8, 6]} />
          <meshStandardMaterial color="#b03b64" />
        </mesh>
      ))}
    </group>
  );
}
function Fountain() {
  const jets = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (jets.current)
      jets.current.scale.y = 0.85 + Math.sin(clock.elapsedTime * 1.8) * 0.15;
  });
  return (
    <group>
      <mesh receiveShadow>
        <cylinderGeometry args={[2.2, 2.35, 0.3, 32]} />
        <meshStandardMaterial color="#d6bf89" />
      </mesh>
      <mesh position={[0, 0.17, 0]}>
        <cylinderGeometry args={[2, 2, 0.04, 32]} />
        <meshStandardMaterial color="#54b7ca" metalness={0.3} roughness={0.2} />
      </mesh>
      <group ref={jets} position={[0, 0.2, 0]}>
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <mesh
            key={i}
            position={[
              Math.sin((i * Math.PI) / 4) * 1.3,
              0.65,
              Math.cos((i * Math.PI) / 4) * 1.3,
            ]}
          >
            <cylinderGeometry args={[0.025, 0.04, 1.3, 6]} />
            <meshStandardMaterial
              color="#98e0e7"
              emissive="#478bca"
              emissiveIntensity={0.4}
              transparent
              opacity={0.7}
            />
          </mesh>
        ))}
      </group>
      <mesh position={[0, 0.7, 0]}>
        <cylinderGeometry args={[0.6, 0.25, 1, 16]} />
        <meshStandardMaterial color="#d9b969" />
      </mesh>
    </group>
  );
}
export function SunstepScenery({ onCasino }: { onCasino: () => void }) {
  const f = SUNSTEP_FEATURES;
  return (
    <group>
      {[
        [-90, -20],
        [-90, 80],
        [60, 140],
        [150, 40],
        [180, -100],
      ].map(([dx, dy], i) => (
        <DesertPalm
          key={i}
          x={f.fountain.x + dx!}
          y={f.fountain.y + dy!}
          scale={0.9 + (i % 2) * 0.2}
        />
      ))}
      {[3000, 3080, 3400, 3480].flatMap((x) =>
        [600, 960].map((y) => (
          <DesertPalm key={`${x}-${y}`} x={x} y={y} scale={0.8} />
        )),
      )}
      <group
        position={to3(
          f.fountain.x,
          f.fountain.y,
          groundY(f.fountain.x, f.fountain.y),
        )}
      >
        <Fountain />
      </group>
      <group
        position={to3(
          f.marquee.x,
          f.marquee.y,
          groundY(f.marquee.x, f.marquee.y),
        )}
      >
        <NeonSign text="Welcome to Sunstep" accent="#f2c14e" height={3.1} />
      </group>
      <group
        position={to3(f.hotel.x, f.hotel.y, groundY(f.hotel.x, f.hotel.y))}
        onClick={(e) => {
          e.stopPropagation();
          onCasino();
        }}
      >
        <mesh position={[0, 3, 0]} castShadow>
          <boxGeometry args={[3, 6, 2]} />
          <meshStandardMaterial
            color="#263749"
            metalness={0.4}
            roughness={0.35}
          />
        </mesh>
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <mesh key={i} position={[0, 0.5 + i * 0.72, 1.02]}>
            <boxGeometry args={[2.6, 0.22, 0.03]} />
            <meshStandardMaterial
              color="#d8ad63"
              emissive="#c5a451"
              emissiveIntensity={0.55}
            />
          </mesh>
        ))}
        <group position={[0, 6.1, 0]}>
          <CasinoLandmark kind="spire" accent="#c084fc" />
        </group>
        <group position={[0, 0, 1.8]}>
          <NeonSign text="Royal Sun Hotel" accent="#c084fc" height={2} />
        </group>
      </group>
      <group
        position={to3(f.oasis.x, f.oasis.y, groundY(f.oasis.x, f.oasis.y))}
      >
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[2.8, 32]} />
          <meshStandardMaterial color="#63b6b0" roughness={0.25} />
        </mesh>
        {[-1, 1].map((side) => (
          <group key={side} position={[side * 3.3, 0, 0]}>
            <mesh position={[0, 0.25, 0]}>
              <boxGeometry args={[0.6, 0.18, 1.3]} />
              <meshStandardMaterial color="#e3cd98" />
            </mesh>
            <mesh position={[0, 1.7, 0]}>
              <coneGeometry args={[1, 0.45, 8]} />
              <meshStandardMaterial color="#c26769" />
            </mesh>
            <mesh position={[0, 0.8, 0]}>
              <cylinderGeometry args={[0.03, 0.03, 1.6, 6]} />
              <meshStandardMaterial color="#8d6540" />
            </mesh>
          </group>
        ))}
      </group>
      {[
        { x: 4010, y: 420 },
        { x: 4140, y: 820 },
        { x: 3980, y: 1200 },
        { x: 2820, y: 1260 },
      ].map((p, i) => (
        <group key={i} position={to3(p.x, p.y, groundY(p.x, p.y))}>
          <mesh position={[0, 0.45, 0]} scale={[1.6, 0.7, 1]}>
            <dodecahedronGeometry args={[1.1, 0]} />
            <meshStandardMaterial color="#bd8e58" />
          </mesh>
          <DesertCactus />
        </group>
      ))}
    </group>
  );
}
function DesertCactus() {
  return (
    <group position={[1.6, 0, 0]}>
      <mesh position={[0, 0.7, 0]}>
        <capsuleGeometry args={[0.13, 1.2, 4, 7]} />
        <meshStandardMaterial color="#65844e" />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[side * 0.25, 0.7, 0]}
          rotation={[0, 0, side * 0.8]}
        >
          <capsuleGeometry args={[0.08, 0.5, 4, 6]} />
          <meshStandardMaterial color="#65844e" />
        </mesh>
      ))}
    </group>
  );
}
