import { useMemo } from "react";
import * as THREE from "three";
import {
  HOME_PALETTES,
  homeLevel,
  homeStyle,
  type HomeStyle,
} from "@/lib/game/home-design";
function Gable({
  width,
  depth,
  color,
  y,
}: {
  width: number;
  depth: number;
  color: string;
  y: number;
}) {
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-width / 2, 0);
    shape.lineTo(0, 0.58);
    shape.lineTo(width / 2, 0);
    shape.closePath();
    const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false });
    g.translate(0, 0, -depth / 2);
    return g;
  }, [width, depth]);
  return (
    <mesh geometry={geometry} position={[0, y, 0]} castShadow>
      <meshStandardMaterial color={color} />
    </mesh>
  );
}
/** Original kit: four regional styles, five silhouettes and all civic trim upgrades. */
export function HomeAsset({
  id,
  level,
  style,
  trim = [],
  lantern = false,
}: {
  id: string;
  level: number;
  style?: HomeStyle;
  trim?: string[];
  lantern?: boolean;
}) {
  const n = homeLevel(level),
    kind = style ?? homeStyle(id),
    p = HOME_PALETTES[kind],
    floors = n,
    h = 0.9 * floors,
    w = n >= 2 ? 1.65 : 1.25,
    d = 1.45;
  return (
    <group>
      <mesh position={[0, 0.08, 0]} receiveShadow>
        <boxGeometry args={[w + 0.2, 0.16, d + 0.18]} />
        <meshStandardMaterial color="#a59b7d" />
      </mesh>
      <mesh position={[0, h / 2 + 0.16, 0]} castShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color={p.wall} />
      </mesh>
      {kind === "sunstep" ? (
        <>
          <mesh position={[0, h + 0.24, 0]}>
            <boxGeometry args={[w + 0.18, 0.18, d + 0.18]} />
            <meshStandardMaterial color={p.roof} />
          </mesh>
          {[-1, 1].map((side) => (
            <mesh key={side} position={[side * (w / 2), h + 0.4, 0]}>
              <boxGeometry args={[0.14, 0.3, d + 0.15]} />
              <meshStandardMaterial color={p.wall} />
            </mesh>
          ))}
        </>
      ) : (
        <Gable width={w + 0.28} depth={d + 0.3} color={p.roof} y={h + 0.16} />
      )}
      {kind === "meadow" &&
        [-1, 0, 1].map((x) => (
          <mesh key={x} position={[x * w * 0.45, h / 2 + 0.16, d / 2 + 0.014]}>
            <boxGeometry args={[0.055, h, 0.035]} />
            <meshStandardMaterial color="#8d7051" />
          </mesh>
        ))}
      {kind === "stone" &&
        Array.from({ length: floors * 4 }, (_, i) => (
          <mesh key={i} position={[0, 0.26 + i * 0.23, d / 2 + 0.012]}>
            <boxGeometry args={[w, 0.018, 0.024]} />
            <meshStandardMaterial color="#8e998c" />
          </mesh>
        ))}
      <mesh position={[-w * 0.26, 0.54, d / 2 + 0.025]}>
        <boxGeometry args={[0.32, 0.76, 0.045]} />
        <meshStandardMaterial color={p.trim} />
      </mesh>
      <mesh position={[-w * 0.16, 0.51, d / 2 + 0.06]}>
        <sphereGeometry args={[0.025, 6, 4]} />
        <meshStandardMaterial color="#d6b46e" />
      </mesh>
      {Array.from({ length: floors }, (_, floor) => (
        <group
          key={floor}
          position={[w * 0.25, 0.65 + floor * 0.9, d / 2 + 0.035]}
        >
          <mesh>
            <boxGeometry args={[0.4, 0.38, 0.04]} />
            <meshStandardMaterial
              color="#bedcce"
              emissive="#cbb982"
              emissiveIntensity={0.12}
            />
          </mesh>
          <mesh>
            <boxGeometry args={[0.025, 0.4, 0.07]} />
            <meshStandardMaterial color={p.trim} />
          </mesh>
          <mesh>
            <boxGeometry args={[0.42, 0.025, 0.07]} />
            <meshStandardMaterial color={p.trim} />
          </mesh>
          {trim.includes("shutters") &&
            [-1, 1].map((side) => (
              <mesh
                key={side}
                position={[side * 0.29, 0, 0]}
                rotation={[0, side * 0.28, 0]}
              >
                <boxGeometry args={[0.15, 0.43, 0.06]} />
                <meshStandardMaterial color={p.trim} />
              </mesh>
            ))}
          {trim.includes("boxes") && (
            <group position={[0, -0.27, 0.08]}>
              <mesh>
                <boxGeometry args={[0.5, 0.15, 0.18]} />
                <meshStandardMaterial color="#ad7658" />
              </mesh>
              {[-0.16, 0, 0.16].map((x, i) => (
                <mesh key={x} position={[x, 0.15, 0]}>
                  <sphereGeometry args={[0.075, 6, 5]} />
                  <meshStandardMaterial
                    color={["#dca4aa", "#e6ce81", "#c9aace"][i]}
                  />
                </mesh>
              ))}
            </group>
          )}
        </group>
      ))}
      {(n >= 2 || trim.includes("chimney")) && (
        <mesh position={[-w * 0.32, h + 0.55, -0.3]}>
          <boxGeometry args={[0.23, 0.75, 0.24]} />
          <meshStandardMaterial
            color={kind === "stone" ? "#7d8c7f" : "#b18769"}
          />
        </mesh>
      )}
      {n >= 4 && (
        <group position={[0, h + 0.35, 0.2]}>
          <mesh position={[0, 0.2, 0]}>
            <boxGeometry args={[0.55, 0.46, 0.6]} />
            <meshStandardMaterial color={p.wall} />
          </mesh>
          <Gable width={0.7} depth={0.72} y={0.42} color={p.roof} />
          <mesh position={[0, 0.22, 0.32]}>
            <circleGeometry args={[0.14, 12]} />
            <meshStandardMaterial color="#b7d3d4" />
          </mesh>
        </group>
      )}
      {(n >= 4 || trim.includes("awning")) && (
        <group position={[0, 0, d / 2 + 0.18]}>
          <mesh position={[0, 0.14, 0]}>
            <boxGeometry args={[w + 0.16, 0.12, 0.7]} />
            <meshStandardMaterial color="#aa9570" />
          </mesh>
          <mesh position={[0, 1.1, 0]} rotation={[0.12, 0, 0]}>
            <boxGeometry args={[w + 0.2, 0.09, 0.8]} />
            <meshStandardMaterial color={p.trim} />
          </mesh>
          {[-1, 1].map((side) => (
            <mesh key={side} position={[side * w * 0.46, 0.64, 0.24]}>
              <cylinderGeometry args={[0.035, 0.045, 1, 6]} />
              <meshStandardMaterial color={p.wall} />
            </mesh>
          ))}
        </group>
      )}
      {n >= 5 && (
        <group position={[-w * 0.5 - 0.18, 0.12, -0.15]}>
          <mesh position={[0, 0.55, 0]}>
            <boxGeometry args={[0.5, 1.1, 0.9]} />
            <meshStandardMaterial color="#a9c8b2" transparent opacity={0.85} />
          </mesh>
          <Gable width={0.65} depth={1.02} y={1.1} color={p.trim} />
          {[-0.35, 0, 0.35].map((z) => (
            <mesh key={z} position={[-0.255, 0.55, z]}>
              <boxGeometry args={[0.03, 1.1, 0.03]} />
              <meshStandardMaterial color={p.trim} />
            </mesh>
          ))}
        </group>
      )}
      {trim.includes("bench") && (
        <group position={[w * 0.65, 0, 0.55]}>
          <mesh position={[0, 0.32, 0]}>
            <boxGeometry args={[0.52, 0.08, 0.25]} />
            <meshStandardMaterial color="#92734c" />
          </mesh>
          {[-1, 1].map((side) => (
            <mesh key={side} position={[side * 0.18, 0.16, 0]}>
              <boxGeometry args={[0.07, 0.32, 0.18]} />
              <meshStandardMaterial color="#776449" />
            </mesh>
          ))}
        </group>
      )}
      {trim.includes("vane") && (
        <group position={[w * 0.2, h + 0.95, -0.15]}>
          <mesh>
            <cylinderGeometry args={[0.02, 0.02, 0.5, 5]} />
            <meshStandardMaterial color="#b79a59" />
          </mesh>
          <mesh position={[0.1, 0.22, 0]}>
            <boxGeometry args={[0.36, 0.07, 0.025]} />
            <meshStandardMaterial color="#c8af69" />
          </mesh>
        </group>
      )}
      {lantern && (
        <group position={[-w * 0.38, 0.94, d / 2 + 0.2]}>
          <mesh>
            <boxGeometry args={[0.15, 0.22, 0.12]} />
            <meshStandardMaterial
              color="#f0d297"
              emissive="#eac77a"
              emissiveIntensity={0.6}
            />
          </mesh>
          <mesh position={[0, 0.14, 0]}>
            <coneGeometry args={[0.14, 0.12, 4]} />
            <meshStandardMaterial color={p.trim} />
          </mesh>
        </group>
      )}
      {trim.includes("wreath") && (
        <mesh position={[-w * 0.26, 0.72, d / 2 + 0.07]}>
          <torusGeometry args={[0.12, 0.03, 6, 12]} />
          <meshStandardMaterial color="#547952" />
        </mesh>
      )}
      {trim.includes("path") && (
        <mesh position={[-w * 0.26, 0.03, d / 2 + 0.6]}>
          <boxGeometry args={[0.5, 0.06, 0.9]} />
          <meshStandardMaterial color="#b5b29e" />
        </mesh>
      )}
      {trim.includes("fence") &&
        [-1, 1].map((side) => (
          <group key={side} position={[side * (w / 2 + 0.3), 0, 0.9]}>
            {[-0.25, 0, 0.25].map((z) => (
              <mesh key={z} position={[0, 0.32, z]}>
                <boxGeometry args={[0.07, 0.64, 0.07]} />
                <meshStandardMaterial color="#d5cba5" />
              </mesh>
            ))}
            <mesh position={[0, 0.42, 0]}>
              <boxGeometry args={[0.06, 0.08, 0.7]} />
              <meshStandardMaterial color="#d5cba5" />
            </mesh>
          </group>
        ))}
      {trim.includes("balcony") && (
        <group position={[w * 0.2, Math.max(1, h - 0.45), d / 2 + 0.17]}>
          <mesh>
            <boxGeometry args={[0.75, 0.07, 0.4]} />
            <meshStandardMaterial color={p.trim} />
          </mesh>
          <mesh position={[0, 0.23, 0.22]}>
            <boxGeometry args={[0.8, 0.08, 0.05]} />
            <meshStandardMaterial color={p.wall} />
          </mesh>
          {[-0.32, 0, 0.32].map((x) => (
            <mesh key={x} position={[x, 0.12, 0.22]}>
              <boxGeometry args={[0.04, 0.24, 0.04]} />
              <meshStandardMaterial color={p.wall} />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
}
