import { Suspense, Component, type ReactNode } from "react";
import { useGLTF } from "@react-three/drei";
import { useMemo } from "react";
import type { ThreeElements } from "@react-three/fiber";
import * as THREE from "three";

const USED = [
  "tree_oak",
  "tree_oak_dark",
  "tree_pineTallA",
  "tree_pineTallA_detailed",
  "tree_pineSmallA",
  "tree_pineRoundA",
  "tree_simple",
  "tree_detailed",
  "tree_tall",
  "tree_small",
  "tree_cone",
  "tree_fat",
  "tree_thin",
  "rock_largeA",
  "rock_largeB",
  "rock_smallA",
  "rock_smallB",
  "rock_smallC",
  "rock_tallA",
  "rock_tallB",
  "grass",
  "grass_large",
  "flower_redA",
  "flower_yellowA",
  "flower_purpleA",
  "flower_redB",
  "flower_yellowB",
  "plant_bush",
  "plant_bushLarge",
  "plant_bushSmall",
  "log",
  "log_large",
  "campfire_stones",
  "canoe",
  "canoe_paddle",
  "fence_simple",
  "fence_gate",
  "fence_simpleLow",
  "crop_carrot",
  "crop_turnip",
  "crops_wheatStageB",
  "cliff_cave_rock",
  "cliff_large_rock",
  "path_stoneCircle",
  "bridge_wood",
  "tent_smallOpen",
  "statue_obelisk",
] as const;

export type KenneyName = (typeof USED)[number];

type KenneyProps = { name: KenneyName } & Omit<ThreeElements["group"], "name">;

function ProxyMesh({ name }: { name: KenneyName }) {
  if (name.startsWith("tree")) {
    const pine = name.includes("pine") || name.includes("cone") || name.includes("tall");
    return (
      <group>
        <mesh position={[0, 0.28, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.12, 0.55, 6]} />
          <meshStandardMaterial color="#6b5340" roughness={0.9} />
        </mesh>
        <mesh position={[0, pine ? 1.15 : 0.95, 0]} castShadow>
          {pine ? <coneGeometry args={[0.55, 1.6, 7]} /> : <sphereGeometry args={[0.62, 8, 6]} />}
          <meshStandardMaterial color={pine ? "#35543f" : "#4c6b47"} roughness={0.75} />
        </mesh>
      </group>
    );
  }
  if (name.startsWith("rock") || name.startsWith("cliff") || name === "statue_obelisk") {
    return (
      <mesh position={[0, 0.28, 0]} castShadow>
        <icosahedronGeometry args={[name.includes("large") || name.includes("cliff") ? 0.7 : 0.28, 0]} />
        <meshStandardMaterial color="#8a7a68" roughness={0.95} />
      </mesh>
    );
  }
  if (name.startsWith("flower")) {
    const color = name.includes("yellow") ? "#d6a84c" : name.includes("purple") ? "#6a3d58" : "#a8433b";
    return (
      <group>
        <mesh position={[0, 0.12, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.22, 5]} />
          <meshStandardMaterial color="#4c6b47" />
        </mesh>
        <mesh position={[0, 0.26, 0]}>
          <sphereGeometry args={[0.08, 6, 6]} />
          <meshStandardMaterial color={color} />
        </mesh>
      </group>
    );
  }
  if (name.startsWith("grass") || name.startsWith("plant") || name.startsWith("crop")) {
    return (
      <mesh position={[0, 0.12, 0]} castShadow>
        <coneGeometry args={[0.18, 0.32, 5]} />
        <meshStandardMaterial color="#5c7a54" />
      </mesh>
    );
  }
  if (name.startsWith("canoe")) {
    return (
      <mesh rotation={[0, 0, 0.05]} position={[0, 0.06, 0]} castShadow>
        <capsuleGeometry args={[0.12, 0.9, 4, 8]} />
        <meshStandardMaterial color="#5b4230" />
      </mesh>
    );
  }
  if (name.startsWith("log")) {
    return (
      <mesh rotation={[0, 0, Math.PI / 2]} position={[0, 0.08, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 0.7, 6]} />
        <meshStandardMaterial color="#5b4230" />
      </mesh>
    );
  }
  if (name.startsWith("fence") || name === "bridge_wood") {
    return (
      <mesh position={[0, 0.18, 0]} castShadow>
        <boxGeometry args={[0.7, 0.35, 0.08]} />
        <meshStandardMaterial color="#6b5340" />
      </mesh>
    );
  }
  if (name === "path_stoneCircle") {
    return (
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
        <circleGeometry args={[0.45, 8]} />
        <meshStandardMaterial color="#c4a574" />
      </mesh>
    );
  }
  return (
    <mesh position={[0, 0.16, 0]} castShadow>
      <boxGeometry args={[0.4, 0.32, 0.4]} />
      <meshStandardMaterial color="#6b5340" />
    </mesh>
  );
}

export function KenneyFallback({ name, ...props }: KenneyProps) {
  return (
    <group {...props}>
      <ProxyMesh name={name} />
    </group>
  );
}

function KenneyModel({ name, ...props }: KenneyProps) {
  const gltf = useGLTF(`/models/kenney/${name}.glb`);
  const scene = useMemo(() => {
    const cloned = gltf.scene.clone(true);
    cloned.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
    return cloned;
  }, [gltf.scene]);
  return <primitive object={scene} {...props} />;
}

class KenneyGate extends Component<{ fallback: ReactNode; children: ReactNode }, { fail: boolean }> {
  state = { fail: false };
  static getDerivedStateFromError() {
    return { fail: true };
  }
  render() {
    return this.state.fail ? this.props.fallback : this.props.children;
  }
}

export function Kenney(props: KenneyProps) {
  const fallback = <KenneyFallback {...props} />;
  return (
    <KenneyGate fallback={fallback}>
      <Suspense fallback={fallback}>
        <KenneyModel {...props} />
      </Suspense>
    </KenneyGate>
  );
}
