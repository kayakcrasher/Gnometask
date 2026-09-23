import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { DragonHorn, DragonLook } from "@/lib/game/types";

const LOOK: Record<DragonLook, { body: string; belly: string; wing: string; horn: string }> = {
  ember: { body: "#c4553a", belly: "#e7c39a", wing: "#8a3030", horn: "#3a241c" },
  moss: { body: "#4c6b47", belly: "#d5e2b8", wing: "#2f4a32", horn: "#3a2a18" },
  night: { body: "#2a3140", belly: "#8aa0b8", wing: "#1a2030", horn: "#d6a84c" },
  gold: { body: "#d6a84c", belly: "#f4e4b8", wing: "#a87830", horn: "#f7f4ee" },
};

export function Ember({
  look = "ember",
  horn = "long",
  friend = false,
  flying = false,
}: {
  look?: DragonLook;
  horn?: DragonHorn;
  friend?: boolean;
  flying?: boolean;
}) {
  const root = useRef<THREE.Group>(null);
  const wingL = useRef<THREE.Group>(null);
  const wingR = useRef<THREE.Group>(null);
  const pal = LOOK[look];
  const body = friend ? "#6f8f66" : pal.body;
  const wing = friend ? "#4c6b47" : pal.wing;
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const flap = Math.sin(t * (flying ? 6 : 2.2));
    if (root.current) root.current.position.y = (flying ? 1.6 : 0) + Math.sin(t * 1.4) * (flying ? 0.18 : 0.06);
    if (wingL.current) wingL.current.rotation.z = 0.55 + flap * (flying ? 0.55 : 0.22);
    if (wingR.current) wingR.current.rotation.z = -0.55 - flap * (flying ? 0.55 : 0.22);
  });
  const hornH = horn === "crown" ? 0.34 : horn === "long" ? 0.42 : 0.22;
  return (
    <group ref={root} scale={1.45}>
      <mesh position={[0, 0.72, 0]} rotation={[0.2, 0, 0]} castShadow>
        <capsuleGeometry args={[0.36, 0.85, 6, 10]} />
        <meshStandardMaterial color={body} roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.55, 0.16]} rotation={[0.2, 0, 0]} castShadow>
        <sphereGeometry args={[0.28, 10, 8]} />
        <meshStandardMaterial color={pal.belly} roughness={0.7} />
      </mesh>
      {[0.15, 0, -0.15].map((z) => (
        <mesh key={z} position={[0, 1.05, z]} castShadow>
          <coneGeometry args={[0.06, 0.16, 5]} />
          <meshStandardMaterial color={pal.horn} />
        </mesh>
      ))}
      <mesh position={[0, 1.15, 0.42]} rotation={[-0.7, 0, 0]} castShadow>
        <capsuleGeometry args={[0.13, 0.38, 4, 8]} />
        <meshStandardMaterial color={body} roughness={0.55} />
      </mesh>
      <group position={[0, 1.48, 0.72]}>
        <mesh castShadow>
          <sphereGeometry args={[0.22, 12, 10]} />
          <meshStandardMaterial color={body} roughness={0.5} />
        </mesh>
        <mesh position={[0, -0.04, 0.22]} castShadow>
          <boxGeometry args={[0.16, 0.1, 0.28]} />
          <meshStandardMaterial color={body} />
        </mesh>
        <mesh position={[0, -0.08, 0.22]}>
          <boxGeometry args={[0.12, 0.05, 0.2]} />
          <meshStandardMaterial color={pal.belly} />
        </mesh>
        <mesh position={[-0.08, 0.06, 0.16]}>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshStandardMaterial color="#f7f4ee" />
        </mesh>
        <mesh position={[0.08, 0.06, 0.16]}>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshStandardMaterial color="#f7f4ee" />
        </mesh>
        <mesh position={[-0.08, 0.06, 0.185]}>
          <sphereGeometry args={[0.016, 8, 8]} />
          <meshStandardMaterial color="#1c1a17" />
        </mesh>
        <mesh position={[0.08, 0.06, 0.185]}>
          <sphereGeometry args={[0.016, 8, 8]} />
          <meshStandardMaterial color="#1c1a17" />
        </mesh>
        <mesh position={[-0.1, 0.16, -0.02]} rotation={[0.2, 0, 0.5]} castShadow>
          <coneGeometry args={[0.05, hornH, 6]} />
          <meshStandardMaterial color={pal.horn} />
        </mesh>
        <mesh position={[0.1, 0.16, -0.02]} rotation={[0.2, 0, -0.5]} castShadow>
          <coneGeometry args={[0.05, hornH, 6]} />
          <meshStandardMaterial color={pal.horn} />
        </mesh>
        {horn === "crown" ? (
          <mesh position={[0, 0.2, -0.04]} rotation={[0.3, 0, 0]} castShadow>
            <coneGeometry args={[0.045, 0.28, 6]} />
            <meshStandardMaterial color={pal.horn} />
          </mesh>
        ) : null}
      </group>
      {[
        [-0.22, 0.38, 0.28],
        [0.22, 0.38, 0.28],
        [-0.24, 0.38, -0.28],
        [0.24, 0.38, -0.28],
      ].map(([x, y, z]) => (
        <mesh key={`${x}-${z}`} position={[x!, y!, z!]} castShadow>
          <capsuleGeometry args={[0.07, 0.22, 3, 6]} />
          <meshStandardMaterial color={body} />
        </mesh>
      ))}
      <group ref={wingL} position={[-0.28, 0.95, 0]}>
        <mesh position={[-0.45, 0.05, 0]} rotation={[0.2, 0, 0.3]} castShadow>
          <boxGeometry args={[0.9, 0.05, 0.42]} />
          <meshStandardMaterial color={wing} roughness={0.7} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[-0.2, 0, 0]} rotation={[0, 0, 0.4]}>
          <boxGeometry args={[0.45, 0.04, 0.04]} />
          <meshStandardMaterial color={pal.horn} />
        </mesh>
      </group>
      <group ref={wingR} position={[0.28, 0.95, 0]}>
        <mesh position={[0.45, 0.05, 0]} rotation={[0.2, 0, -0.3]} castShadow>
          <boxGeometry args={[0.9, 0.05, 0.42]} />
          <meshStandardMaterial color={wing} roughness={0.7} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0.2, 0, 0]} rotation={[0, 0, -0.4]}>
          <boxGeometry args={[0.45, 0.04, 0.04]} />
          <meshStandardMaterial color={pal.horn} />
        </mesh>
      </group>
      <mesh position={[0, 0.7, -0.7]} rotation={[0.5, 0, 0]} castShadow>
        <capsuleGeometry args={[0.1, 0.45, 4, 6]} />
        <meshStandardMaterial color={body} />
      </mesh>
      <mesh position={[0, 0.55, -1.15]} rotation={[0.9, 0, 0]} castShadow>
        <capsuleGeometry args={[0.07, 0.4, 4, 6]} />
        <meshStandardMaterial color={body} />
      </mesh>
      <mesh position={[0, 0.42, -1.45]} castShadow>
        <coneGeometry args={[0.1, 0.22, 5]} />
        <meshStandardMaterial color={pal.horn} />
      </mesh>
    </group>
  );
}
