import { shipFit, gunLimit } from "@/lib/game/naval";
import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { BOATS, type BoatId } from "@/lib/game/data/boats";
import {
  NEWCOMERS,
  SUPPLY_BERTH,
  SUPPLY_PIER,
  supplyDue,
} from "@/lib/game/data/supply";
import { useGame } from "@/lib/game/store";
import { groundY, to3 } from "@/lib/game/world3";
import { SEA_LEVEL } from "@/lib/game/data/water";
import { GnomeRig } from "./gnome-rig";

import { LargeShip } from "./ship-assets";

const WOOD = "#c4894a";
const WOOD_DARK = "#8a5a32";
const SAIL = "#f4efe4";

function Bob({
  children,
  amp = 0.05,
  speed = 0.9,
}: {
  children: ReactNode;
  amp?: number;
  speed?: number;
}) {
  const ref = useRef<THREE.Group>(null);
  const phase = useMemo(() => Math.random() * Math.PI * 2, []);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime * speed + phase;
    ref.current.position.y = Math.sin(t) * amp;
    ref.current.rotation.z = Math.sin(t * 0.8) * 0.05;
    ref.current.rotation.x = Math.cos(t * 0.6) * 0.03;
  });
  return <group ref={ref}>{children}</group>;
}

function hullOutline(length: number, width: number) {
  const shape = new THREE.Shape();
  shape.moveTo(0, -length * 0.55);
  shape.quadraticCurveTo(
    width * 0.5,
    -length * 0.38,
    width * 0.5,
    -length * 0.08,
  );
  shape.lineTo(width * 0.44, length * 0.4);
  shape.quadraticCurveTo(0, length * 0.5, -width * 0.44, length * 0.4);
  shape.lineTo(-width * 0.5, -length * 0.08);
  shape.quadraticCurveTo(-width * 0.5, -length * 0.38, 0, -length * 0.55);
  return shape;
}

export function Hull({
  length,
  width,
  color,
  lip = "#6b5340",
}: {
  length: number;
  width: number;
  color: string;
  lip?: string;
}) {
  const geometry = useMemo(() => {
    const hull = new THREE.ExtrudeGeometry(hullOutline(length, width), {
      depth: 0.14,
      bevelEnabled: true,
      bevelThickness: 0.025,
      bevelSize: 0.025,
      bevelSegments: 1,
      steps: 1,
      curveSegments: 8,
    });
    hull.rotateX(-Math.PI / 2);
    hull.translate(0, 0.02, 0);
    const edge = hullOutline(length + 0.04, width + 0.04);
    edge.holes.push(
      new THREE.Path(
        hullOutline(length - 0.1, Math.max(0.1, width - 0.09)).getPoints(24),
      ),
    );
    const rim = new THREE.ExtrudeGeometry(edge, {
      depth: 0.055,
      bevelEnabled: false,
      curveSegments: 8,
    });
    rim.rotateX(-Math.PI / 2);
    rim.translate(0, 0.18, 0);
    return { hull, rim };
  }, [length, width]);
  useEffect(
    () => () => {
      geometry.hull.dispose();
      geometry.rim.dispose();
    },
    [geometry],
  );
  return (
    <group>
      <mesh geometry={geometry.hull} castShadow receiveShadow>
        <meshStandardMaterial color={color} roughness={0.85} />
      </mesh>
      <mesh geometry={geometry.rim} castShadow>
        <meshStandardMaterial color={lip} roughness={0.85} />
      </mesh>
      {[-0.22, 0.1].map((z) => (
        <mesh key={z} position={[0, 0.19, z * length]}>
          <boxGeometry args={[width * 0.8, 0.035, 0.09]} />
          <meshStandardMaterial color={lip} />
        </mesh>
      ))}
    </group>
  );
}

function Mast({
  h,
  sailW,
  z = 0,
  tint = SAIL,
}: {
  h: number;
  sailW: number;
  z?: number;
  tint?: string;
}) {
  const cloth = useRef<THREE.Mesh>(null);
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0.035, h * 0.92);
    shape.quadraticCurveTo(sailW * 0.75, h * 0.7, sailW, h * 0.2);
    shape.quadraticCurveTo(sailW * 0.5, h * 0.12, 0.035, h * 0.2);
    shape.closePath();
    return new THREE.ShapeGeometry(shape, 12);
  }, [h, sailW]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useFrame(({ clock }) => {
    if (cloth.current)
      cloth.current.rotation.y = Math.sin(clock.elapsedTime * 1.5 + z) * 0.06;
  });
  return (
    <group position={[0, 0.2, z]}>
      <mesh position={[0, h / 2, 0]} castShadow>
        <cylinderGeometry args={[0.018, 0.025, h, 8]} />
        <meshStandardMaterial color={WOOD_DARK} />
      </mesh>
      <mesh ref={cloth} geometry={geometry} castShadow>
        <meshStandardMaterial
          color={tint}
          roughness={0.95}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

function Oars({ rowing }: { rowing?: boolean }) {
  const strength=useRef(0);
  const left = useRef<THREE.Group>(null);
  const right = useRef<THREE.Group>(null);
  useFrame(({ clock },dt) => {
    strength.current+=((rowing?1:0)-strength.current)*(1-Math.exp(-4*Math.min(dt,.08)));
    const stroke = Math.sin(clock.elapsedTime * 3.8) * .5 * strength.current;
    const dip = Math.cos(clock.elapsedTime * 3.8) * .14 * strength.current;
    if (left.current) {
      left.current.rotation.y = stroke;
      left.current.rotation.z = dip;
    }
    if (right.current) {
      right.current.rotation.y = -stroke;
      right.current.rotation.z = -dip;
    }
  });
  return (
    <group>
      <group ref={left} position={[-0.2, 0.22, 0.02]}>
        <mesh position={[-0.5, 0, 0]}>
          <boxGeometry args={[0.2, 0.035, 0.12]} />
          <meshStandardMaterial color={WOOD_DARK} />
        </mesh>
        <mesh position={[-0.22, 0, 0]} rotation={[0, 0, 0.45]}>
          <boxGeometry args={[0.48, 0.03, 0.045]} />
          <meshStandardMaterial color="#6b4428" />
        </mesh>
      </group>
      <group ref={right} position={[0.2, 0.22, 0.02]}>
        <mesh position={[0.5, 0, 0]}>
          <boxGeometry args={[0.2, 0.035, 0.12]} />
          <meshStandardMaterial color={WOOD_DARK} />
        </mesh>
        <mesh position={[0.22, 0, 0]} rotation={[0, 0, -0.45]}>
          <boxGeometry args={[0.48, 0.03, 0.045]} />
          <meshStandardMaterial color="#6b4428" />
        </mesh>
      </group>
    </group>
  );
}

function Cannon() {
  return (
    <group>
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[side * 0.18, 0.28, 0.22]}
          rotation={[Math.PI / 2, side * -0.25, 0]}
          castShadow
        >
          <cylinderGeometry args={[0.04, 0.055, 0.28, 8]} />
          <meshStandardMaterial
            color="#2c2926"
            metalness={0.45}
            roughness={0.4}
          />
        </mesh>
      ))}
    </group>
  );
}

function ShipBox({
  at,
  size,
  color,
}: {
  at: [number, number, number];
  size: [number, number, number];
  color: string;
}) {
  return (
    <mesh position={at} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.48} />
    </mesh>
  );
}
/** Original premium fleet: working coastal hulls and three distinct stepped-deck yachts. */
function PremiumShip({ kind }: { kind: BoatId }) {
  const cargo = kind === "coaster" || kind === "packet",
    mega = kind === "megayacht",
    explorer = kind === "expedition",
    packet = kind === "packet";
  const length = cargo ? 2.9 : mega ? 4.1 : 3.5,
    width = cargo ? 1 : mega ? 1.4 : 1.2,
    accent = mega
      ? "#cda74b"
      : explorer
        ? "#426c72"
        : cargo
          ? "#a85935"
          : "#5d9fa7";
  return (
    <group>
      <Hull
        length={length}
        width={width}
        color={cargo ? "#385f68" : explorer ? "#526c74" : "#f3ecda"}
        lip={accent}
      />
      <ShipBox
        at={[0, 0.28, 0]}
        size={[width * 0.88, 0.1, length * 0.8]}
        color="#bf9965"
      />
      <ShipBox
        at={[0, 0.57, cargo ? -0.65 : -0.3]}
        size={[width * 0.72, 0.5, cargo ? 0.65 : 1.7]}
        color="#eee7d4"
      />
      <ShipBox
        at={[0, 0.66, cargo ? -0.29 : 0.57]}
        size={[width * 0.66, 0.22, 0.04]}
        color="#305f72"
      />
      {[-1, 1].map((side) => (
        <ShipBox
          key={side}
          at={[side * width * 0.367, 0.64, -0.25]}
          size={[0.025, 0.2, cargo ? 0.5 : 1.3]}
          color="#497f90"
        />
      ))}
      <ShipBox
        at={[0, 0.88, cargo ? -0.65 : -0.4]}
        size={[width * 0.82, 0.07, cargo ? 0.8 : 1.85]}
        color={accent}
      />
      {!cargo && (
        <>
          <ShipBox
            at={[0, 1.13, -0.55]}
            size={[width * 0.57, 0.43, 1.18]}
            color="#f7f0df"
          />
          <ShipBox
            at={[0, 1.2, 0.05]}
            size={[width * 0.52, 0.19, 0.035]}
            color="#3c7086"
          />
          <ShipBox
            at={[0, 1.37, -0.58]}
            size={[width * 0.66, 0.06, 1.4]}
            color={accent}
          />
        </>
      )}
      {explorer && (
        <>
          <ShipBox
            at={[-0.5, 0.95, -1.22]}
            size={[0.08, 1.5, 0.08]}
            color="#c9a262"
          />
          <ShipBox
            at={[-0.15, 1.68, -1.22]}
            size={[0.8, 0.08, 0.08]}
            color="#c9a262"
          />
          <ShipBox
            at={[0.2, 1.25, -1.22]}
            size={[0.025, 0.8, 0.025]}
            color="#667b7c"
          />
          <mesh position={[-0.35, 0.6, 0.8]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.15, 0.15, 0.34, 12]} />
            <meshStandardMaterial color="#89a6a4" />
          </mesh>
          <mesh position={[0.57, 0.6, -0.8]} rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[0.13, 0.04, 6, 16]} />
            <meshStandardMaterial color="#d8834d" />
          </mesh>
          <mesh position={[0, 1.82, -0.8]} rotation={[-0.6, 0, 0]}>
            <sphereGeometry
              args={[0.22, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]}
            />
            <meshStandardMaterial color="#e5e2d5" side={THREE.DoubleSide} />
          </mesh>
        </>
      )}
      {mega && (
        <>
          <ShipBox
            at={[0, 1.58, -0.8]}
            size={[0.62, 0.38, 0.75]}
            color="#eee7d4"
          />
          <ShipBox
            at={[0, 1.66, -0.41]}
            size={[0.56, 0.18, 0.035]}
            color="#3c7086"
          />
          <ShipBox
            at={[0, 1.8, -0.82]}
            size={[0.78, 0.07, 0.9]}
            color="#cda74b"
          />
          <ShipBox
            at={[0, 0.39, 1.05]}
            size={[0.62, 0.08, 0.65]}
            color="#7cc4cf"
          />
          {[-1, 1].map((side) => (
            <group key={side}>
              <ShipBox
                at={[side * 0.43, 1.48, -0.3]}
                size={[0.16, 0.16, 0.24]}
                color="#b89462"
              />
              <mesh position={[side * 0.43, 1.69, -0.3]}>
                <sphereGeometry args={[0.18, 8, 6]} />
                <meshStandardMaterial color="#759a58" />
              </mesh>
            </group>
          ))}
        </>
      )}
      {cargo ? (
        <>
          {Array.from({ length: packet ? 6 : 3 }, (_, i) => (
            <ShipBox
              key={i}
              at={[((i % 2) - 0.5) * 0.4, 0.43, 0.2 + Math.floor(i / 2) * 0.38]}
              size={[0.34, 0.3, 0.32]}
              color={["#b98f59", "#6b8d76", "#b97152"][i % 3]!}
            />
          ))}
          {packet && (
            <ShipBox
              at={[0.28, 1, -0.8]}
              size={[0.18, 0.4, 0.22]}
              color="#b37a45"
            />
          )}
          <ShipBox
            at={[-0.32, 0.95, 0.5]}
            size={[0.06, 1.3, 0.06]}
            color="#b29867"
          />
          <ShipBox
            at={[-0.02, 1.55, 0.5]}
            size={[0.7, 0.06, 0.06]}
            color="#b29867"
          />
        </>
      ) : (
        <>
          <ShipBox
            at={[0.37, 0.43, -1.15]}
            size={[0.36, 0.18, 0.7]}
            color="#e5d3ae"
          />
          <mesh position={[0.37, 0.56, -1.15]}>
            <boxGeometry args={[0.24, 0.08, 0.42]} />
            <meshStandardMaterial color="#477b83" />
          </mesh>
          {[-1, 1].map((side) => (
            <ShipBox
              key={side}
              at={[side * width * 0.3, 0.43, 0.85]}
              size={[0.2, 0.12, 0.48]}
              color="#e8d6a8"
            />
          ))}
        </>
      )}
      <ShipBox
        at={[0, cargo ? 1.07 : mega ? 1.95 : 1.55, -0.8]}
        size={[0.045, 0.5, 0.045]}
        color="#d6b972"
      />
      <mesh position={[0, cargo ? 1.32 : mega ? 2.21 : 1.81, -0.8]}>
        <sphereGeometry args={[explorer ? 0.16 : 0.09, 10, 8]} />
        <meshStandardMaterial color="#edeada" />
      </mesh>
      {Array.from({ length: 5 }, (_, i) =>
        [-1, 1].map((side) => (
          <ShipBox
            key={`${i}-${side}`}
            at={[side * width * 0.44, 0.5, ((i - 2) * length) / 6]}
            size={[0.025, 0.42, 0.025]}
            color={mega ? "#cda74b" : "#d5d8d1"}
          />
        )),
      )}
      {[-1, 1].map((side) => (
        <ShipBox
          key={side}
          at={[side * width * 0.44, 0.71, 0]}
          size={[0.025, 0.025, length * 0.78]}
          color={mega ? "#cda74b" : "#d5d8d1"}
        />
      ))}
    </group>
  );
}
function BoatFittings({
  parts,
  large,
}: {
  parts: readonly string[];
  large: boolean;
}) {
  const scale = large ? 1.5 : 1;
  return (
    <group scale={scale}>
      {parts.includes("rigging") && (
        <>
          <ShipBox
            at={[0.18, 0.7, -0.22]}
            size={[0.025, 1, 0.025]}
            color="#bd9d6a"
          />
          <mesh position={[0.31, 1.13, -0.22]}>
            <boxGeometry args={[0.25, 0.16, 0.02]} />
            <meshStandardMaterial color="#82baa9" />
          </mesh>
        </>
      )}
      {parts.includes("engine") && (
        <>
          <ShipBox
            at={[0, 0.13, -0.57]}
            size={[0.22, 0.22, 0.2]}
            color="#bb8b51"
          />
          <mesh position={[0, 0.02, -0.68]} rotation={[0, 0, Math.PI / 4]}>
            <boxGeometry args={[0.32, 0.045, 0.04]} />
            <meshStandardMaterial color="#ae8c57" metalness={0.65} />
          </mesh>
        </>
      )}
      {parts.includes("hold") && (
        <>
          {[-1, 1].map((v) => (
            <ShipBox
              key={v}
              at={[v * 0.14, 0.38, 0.3]}
              size={[0.22, 0.24, 0.22]}
              color="#9e754b"
            />
          ))}
        </>
      )}
      {parts.includes("rack") && (
        <>
          {[-1, 1].map((v) => (
            <ShipBox
              key={v}
              at={[v * 0.32, 0.56, 0.1]}
              size={[0.02, 0.7, 0.02]}
              color="#a99b76"
            />
          ))}
          <ShipBox
            at={[0, 0.34, 0.1]}
            size={[0.68, 0.035, 0.035]}
            color="#779c91"
          />
        </>
      )}
      {parts.includes("lantern") && (
        <>
          {[-1, 1].map((v) => (
            <mesh key={v} position={[v * 0.3, 0.45, -0.2]}>
              <sphereGeometry args={[0.065, 8, 6]} />
              <meshStandardMaterial
                color="#ffe1a0"
                emissive="#f8c56c"
                emissiveIntensity={1.2}
              />
            </mesh>
          ))}
        </>
      )}
      {parts.includes("canopy") && (
        <>
          <ShipBox
            at={[0, 0.85, -0.35]}
            size={[0.7, 0.05, 0.48]}
            color="#89b3a4"
          />
          {[-1, 1].map((v) => (
            <ShipBox
              key={v}
              at={[v * 0.3, 0.55, -0.5]}
              size={[0.025, 0.6, 0.025]}
              color="#ab8e63"
            />
          ))}
        </>
      )}
    </group>
  );
}
function FightingShip({ kind }: { kind: BoatId }) {
  const pirate = kind === "pirate",
    large = kind === "frigate" || kind === "galleon",
    length =
      kind === "galleon" ? 4.8 : large ? 4.1 : kind === "warcutter" ? 2.4 : 3.2,
    width = large ? 1.35 : 1.05;
  return (
    <group>
      <Hull
        length={length}
        width={width}
        color={pirate ? "#513548" : "#3e5663"}
        lip={pirate ? "#a76b73" : "#ccad67"}
      />
      <ShipBox
        at={[0, 0.27, 0]}
        size={[width * 0.85, 0.1, length * 0.8]}
        color="#b68c55"
      />
      <ShipBox
        at={[0, 0.55, -length * 0.3]}
        size={[width * 0.8, 0.6, 0.65]}
        color={pirate ? "#764758" : "#6e8e91"}
      />
      <ShipBox
        at={[0, 0.9, -length * 0.3]}
        size={[width * 0.9, 0.08, 0.8]}
        color="#bba16a"
      />
      {Array.from(
        { length: kind === "galleon" ? 4 : large ? 3 : 2 },
        (_, i) => (
          <group
            key={i}
            position={[0, 0, (i - (large ? 1 : 0.5)) * length * 0.23]}
          >
            <Mast
              h={large ? 2.5 : 1.9}
              sailW={large ? 1.3 : 1}
              tint={pirate ? "#694258" : "#e8ddbc"}
            />
            <ShipBox
              at={[0, large ? 2.55 : 1.95, 0]}
              size={[0.7, 0.04, 0.04]}
              color="#594637"
            />
          </group>
        ),
      )}
      {pirate && (
        <>
          <mesh position={[0, 1.55, 0.03]}>
            <sphereGeometry args={[0.13, 10, 8]} />
            <meshStandardMaterial color="#e7d8ba" />
          </mesh>
          <ShipBox
            at={[0, 1.39, 0.03]}
            size={[0.18, 0.13, 0.05]}
            color="#e7d8ba"
          />
        </>
      )}
      {large && (
        <>
          <ShipBox
            at={[0, 1, -length * 0.34]}
            size={[1, 0.35, 0.6]}
            color="#495d62"
          />
          {[-0.3, 0, 0.3].map((x) => (
            <ShipBox
              key={x}
              at={[x, 1.03, -length * 0.42]}
              size={[0.17, 0.22, 0.035]}
              color="#ddb962"
            />
          ))}
        </>
      )}
      {Array.from({ length: Math.ceil(gunLimit(kind) / 2) }, (_, i) =>
        [-1, 1].map((side) => (
          <ShipBox
            key={`${i}-${side}`}
            at={[
              side * width * 0.45,
              0.21,
              ((i - (Math.ceil(gunLimit(kind) / 2) - 1) / 2) * length) /
                (Math.ceil(gunLimit(kind) / 2) + 2),
            ]}
            size={[0.03, 0.12, 0.15]}
            color="#252b2a"
          />
        )),
      )}
      <ShipBox
        at={[0, 0.45, length * 0.44]}
        size={[0.06, 0.06, 0.75]}
        color="#ac8b59"
      />
    </group>
  );
}
export function BoatMesh({
  kind,
  rowing,
  cannon,
  parts = [],
  guns,
  crew = 0,
  faction = "player",
}: {
  guns?: number;
  crew?: number;
  faction?: "player" | "enemy" | "friendly";
  kind: BoatId | "goblin";
  rowing?: boolean;
  cannon?: boolean;
  parts?: readonly string[];
}) {
  return (
    <group>
      <BaseBoatMesh kind={kind} rowing={rowing} cannon={false} />
      {Array.from(
        { length: Math.min(gunLimit(kind), guns ?? (cannon ? 1 : 0)) },
        (_, i) => {
          const small =
              kind === "row" ||
              kind === "sail" ||
              kind === "sloop" ||
              kind === "fisher",
            side = i % 2 ? 1 : -1,
            rows = Math.ceil((guns ?? 1) / 2);
          return (
            <group
              key={i}
              position={[
                side * (small ? 0.22 : 0.46),
                small ? 0.3 : 0.4,
                (Math.floor(i / 2) - (rows - 1) / 2) * (small ? 0.23 : 0.27),
              ]}
              rotation={[0, (side * Math.PI) / 2, 0]}
            >
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.05, 0.075, 0.35, 8]} />
                <meshStandardMaterial color="#302e2b" metalness={0.5} />
              </mesh>
              <ShipBox
                at={[0, -0.07, 0]}
                size={[0.18, 0.08, 0.22]}
                color="#936d46"
              />
            </group>
          );
        },
      )}
      {faction !== "player" && (
        <group position={[0, 2.65, -0.4]}>
          <ShipBox at={[0, 0, 0]} size={[0.035, 0.7, 0.035]} color="#b89e6d" />
          <ShipBox
            at={[0.25, 0.18, 0]}
            size={[0.5, 0.25, 0.025]}
            color={faction === "enemy" ? "#af554d" : "#76b6a4"}
          />
        </group>
      )}
      {Array.from({ length: Math.min(crew, 8) }, (_, i) => (
        <group
          key={`crew-${i}`}
          position={[
            (i % 2 ? 1 : -1) * 0.3,
            0.3,
            (Math.floor(i / 2) - (Math.ceil(Math.min(crew, 8) / 2) - 1) / 2) *
              0.35,
          ]}
        >
          <GnomeRig hat="hat-night" scale={0.32} beard />
        </group>
      ))}
      <BoatFittings
        parts={parts}
        large={!["row", "sail", "goblin"].includes(kind)}
      />
    </group>
  );
}

function BaseBoatMesh({
  kind,
  rowing,
  cannon,
}: {
  kind: BoatId | "goblin";
  rowing?: boolean;
  cannon?: boolean;
}) {
  if (["warcutter", "brig", "frigate", "pirate", "galleon"].includes(kind))
    return <FightingShip kind={kind as BoatId} />;
  if (["coaster", "packet", "yacht", "expedition", "megayacht"].includes(kind))
    return (
      <group>
        <PremiumShip kind={kind as BoatId} />
        {cannon && <Cannon />}
      </group>
    );
  if (kind === "row") {
    return (
      <group>
        <Hull length={0.95} width={0.38} color={WOOD} />
        <mesh position={[0, 0.24, 0.12]}>
          <boxGeometry args={[0.32, 0.04, 0.12]} />
          <meshStandardMaterial color="#5b4230" />
        </mesh>
        <mesh position={[0.22, 0.18, -0.1]}>
          <boxGeometry args={[0.16, 0.03, 0.22]} />
          <meshStandardMaterial color="#e6d3b0" />
        </mesh>
        <Oars rowing={rowing} />
        {cannon ? <Cannon /> : null}
      </group>
    );
  }
  if (kind === "sail") {
    return (
      <group>
        <Hull length={1.15} width={0.42} color="#d08a45" />
        <Mast h={1.15} sailW={0.55} />
        <Oars rowing={rowing} />
        {cannon ? <Cannon /> : null}
      </group>
    );
  }
  if (kind === "fisher" || kind === "barge")
    return <LargeShip kind={kind} cannon={cannon} />;
  if (kind === "goblin") {
    return (
      <group>
        <Hull length={1.25} width={0.48} color="#3d6a28" lip="#24381c" />
        <Mast h={0.95} sailW={0.48} tint="#4c7a3a" />
        <mesh position={[0.16, 0.55, 0.02]}>
          <boxGeometry args={[0.16, 0.1, 0.02]} />
          <meshStandardMaterial color="#1c2a16" />
        </mesh>
      </group>
    );
  }
  return <LargeShip kind="sloop" cannon={cannon} />;
}

export function PirateRig() {
  return (
    <group scale={0.9}>
      <mesh position={[-0.1, 0.2, 0]} castShadow>
        <boxGeometry args={[0.12, 0.28, 0.12]} />
        <meshStandardMaterial color="#a8433b" />
      </mesh>
      <mesh position={[0.1, 0.2, 0]} castShadow>
        <boxGeometry args={[0.12, 0.28, 0.12]} />
        <meshStandardMaterial color="#f2e8d5" />
      </mesh>
      <mesh position={[-0.1, 0.06, 0.02]} castShadow>
        <boxGeometry args={[0.15, 0.1, 0.18]} />
        <meshStandardMaterial color="#1c1a17" />
      </mesh>
      <mesh position={[0.1, 0.06, 0.02]} castShadow>
        <boxGeometry args={[0.15, 0.1, 0.18]} />
        <meshStandardMaterial color="#1c1a17" />
      </mesh>
      <mesh position={[0, 0.52, 0]} castShadow>
        <boxGeometry args={[0.46, 0.36, 0.28]} />
        <meshStandardMaterial color="#a8433b" roughness={0.65} />
      </mesh>
      <mesh position={[0, 0.56, 0.15]}>
        <boxGeometry args={[0.16, 0.18, 0.02]} />
        <meshStandardMaterial color="#f7f4ee" />
      </mesh>
      <mesh position={[0, 0.38, 0]}>
        <boxGeometry args={[0.48, 0.06, 0.3]} />
        <meshStandardMaterial color="#1c1a17" />
      </mesh>
      <mesh position={[0, 0.38, 0.16]}>
        <boxGeometry args={[0.1, 0.05, 0.02]} />
        <meshStandardMaterial color="#e2b84a" metalness={0.3} />
      </mesh>
      <mesh position={[0, 0.9, 0]} castShadow>
        <sphereGeometry args={[0.18, 12, 10]} />
        <meshStandardMaterial color="#e7b48a" />
      </mesh>
      <mesh position={[0, 0.7, 0.08]} rotation={[0.15, 0, 0]} castShadow>
        <coneGeometry args={[0.12, 0.28, 7]} />
        <meshStandardMaterial color="#8a3a32" />
      </mesh>
      <mesh position={[-0.06, 0.95, 0.14]}>
        <sphereGeometry args={[0.028, 8, 8]} />
        <meshStandardMaterial color="#f7f4ee" />
      </mesh>
      <mesh position={[0.07, 0.95, 0.13]}>
        <boxGeometry args={[0.07, 0.035, 0.02]} />
        <meshStandardMaterial color="#1c1a17" />
      </mesh>
      <mesh position={[0, 1.08, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.22, 0.05, 10]} />
        <meshStandardMaterial color="#1c1a17" />
      </mesh>
      <mesh position={[0, 1.16, 0]} rotation={[0.1, 0, 0.08]} castShadow>
        <boxGeometry args={[0.36, 0.05, 0.36]} />
        <meshStandardMaterial color="#d6a84c" />
      </mesh>
      <mesh position={[0.32, 0.46, 0.06]} rotation={[0.2, 0, -0.9]} castShadow>
        <boxGeometry args={[0.035, 0.42, 0.02]} />
        <meshStandardMaterial color="#d5dde4" metalness={0.5} roughness={0.3} />
      </mesh>
    </group>
  );
}

function Gull({
  radius,
  speed,
  lift,
}: {
  radius: number;
  speed: number;
  lift: number;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const a = clock.elapsedTime * speed;
    ref.current.position.set(
      Math.cos(a) * radius,
      lift + Math.sin(a * 3) * 0.12,
      Math.sin(a) * radius,
    );
    ref.current.rotation.y = -a + Math.PI / 2;
    ref.current.rotation.z = Math.sin(a * 8) * 0.35;
  });
  return (
    <group ref={ref}>
      <mesh>
        <boxGeometry args={[0.28, 0.015, 0.08]} />
        <meshStandardMaterial color="#f7f3ea" />
      </mesh>
    </group>
  );
}

export function Pier() {
  const posts = [-5.4, -4.2, -3.0, -1.8, -0.6, 0.4];
  return (
    <group position={to3(78, 520, 0)}>
      <mesh position={[-2.8, 0.18, 0]} castShadow receiveShadow>
        <boxGeometry args={[6.4, 0.1, 0.9]} />
        <meshStandardMaterial color="#c4894a" roughness={0.8} />
      </mesh>
      <mesh position={[-2.6, 0.28, 0.42]}>
        <boxGeometry args={[6.6, 0.06, 0.06]} />
        <meshStandardMaterial color="#6b4423" />
      </mesh>
      {posts.map((x) => (
        <mesh key={x} position={[x, -0.02, 0.32]} castShadow>
          <boxGeometry args={[0.1, 0.5, 0.1]} />
          <meshStandardMaterial color="#5b3a24" />
        </mesh>
      ))}
      <mesh position={[-5.6, 0.55, 0.32]}>
        <boxGeometry args={[0.06, 0.55, 0.06]} />
        <meshStandardMaterial color="#5b4230" />
      </mesh>
      <mesh position={[-5.6, 0.86, 0.32]}>
        <sphereGeometry args={[0.07, 8, 8]} />
        <meshStandardMaterial
          color="#e7c56a"
          emissive="#e7c56a"
          emissiveIntensity={0.35}
        />
      </mesh>
      <mesh position={[-0.2, 0.34, 0.08]} castShadow>
        <boxGeometry args={[0.36, 0.24, 0.36]} />
        <meshStandardMaterial color="#3d6ea5" />
      </mesh>
      <mesh position={[0.7, 0.32, -0.1]} rotation={[Math.PI / 2, 0, 0.4]}>
        <torusGeometry args={[0.14, 0.03, 6, 12]} />
        <meshStandardMaterial color="#8a7a68" />
      </mesh>
    </group>
  );
}

export function Dockhouse({ onEnter }: { onEnter: () => void }) {
  const p = to3(108, 515, groundY(108, 515));
  return (
    <group
      position={p}
      rotation={[0, Math.PI / 2, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onEnter();
      }}
    >
      <mesh position={[0, 0.55, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.7, 1.1, 1.25]} />
        <meshStandardMaterial color="#efe4cf" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.2, 0]} castShadow>
        <boxGeometry args={[1.82, 0.28, 1.35]} />
        <meshStandardMaterial color="#c9c3b4" />
      </mesh>
      <mesh position={[0, 0.42, 0.64]} castShadow>
        <boxGeometry args={[0.36, 0.62, 0.06]} />
        <meshStandardMaterial color="#5b4230" />
      </mesh>
      {[-0.48, 0.48].map((x) => (
        <mesh key={x} position={[x, 0.62, 0.64]}>
          <boxGeometry args={[0.28, 0.28, 0.04]} />
          <meshStandardMaterial color="#9ec3d6" />
        </mesh>
      ))}
      <mesh position={[0, 1.55, 0]} castShadow>
        <boxGeometry args={[1.5, 0.85, 1.08]} />
        <meshStandardMaterial color="#f3ead8" />
      </mesh>
      <mesh position={[0, 1.18, 0.62]} castShadow>
        <boxGeometry args={[1.55, 0.08, 0.32]} />
        <meshStandardMaterial color="#8a5a32" />
      </mesh>
      <mesh position={[0, 2.12, 0]} rotation={[0, 0, 0]} castShadow>
        <boxGeometry args={[1.7, 0.12, 1.3]} />
        <meshStandardMaterial color="#a33b32" />
      </mesh>
      <mesh position={[0.55, 2.45, 0]} castShadow>
        <boxGeometry args={[0.16, 0.4, 0.16]} />
        <meshStandardMaterial color="#8a7a68" />
      </mesh>
      <Html
        position={[0, 2.3, 0.7]}
        center
        distanceFactor={16}
        style={{ pointerEvents: "none" }}
      >
        <p className="rounded-full bg-ink/80 px-2 py-0.5 font-display text-[11px] font-semibold text-parchment">
          Dockhouse
        </p>
      </Html>
    </group>
  );
}

function SupplyHull() {
  return (
    <group scale={3.2}>
      <LargeShip kind="supply" />
    </group>
  );
}

function SupplyPier() {
  const posts = [-3.8, -2.4, -1.0, 0.4];
  return (
    <group position={to3(SUPPLY_PIER.x, SUPPLY_PIER.y, 0)}>
      <mesh position={[-1.6, 0.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[5.2, 0.12, 1.15]} />
        <meshStandardMaterial color="#b87840" roughness={0.75} />
      </mesh>
      <mesh position={[0, 0.32, 0.52]}>
        <boxGeometry args={[3.2, 0.08, 0.08]} />
        <meshStandardMaterial color="#5b3a24" />
      </mesh>
      {posts.map((x) => (
        <mesh key={x} position={[x, -0.05, 0.4]} castShadow>
          <boxGeometry args={[0.12, 0.55, 0.12]} />
          <meshStandardMaterial color="#4a3020" />
        </mesh>
      ))}
      {[-1.2, 1.1].map((x) => (
        <mesh key={`b${x}`} position={[x, 0.38, 0.48]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 0.22, 8]} />
          <meshStandardMaterial color="#2a241c" />
        </mesh>
      ))}
      <mesh position={[0.9, 0.42, -0.1]} castShadow>
        <boxGeometry args={[0.4, 0.32, 0.4]} />
        <meshStandardMaterial color="#c4553a" />
      </mesh>
      <mesh position={[1.15, 0.58, -0.1]} castShadow>
        <boxGeometry args={[0.32, 0.24, 0.32]} />
        <meshStandardMaterial color="#d6a84c" />
      </mesh>
      <Html
        position={[0, 0.9, 0]}
        center
        distanceFactor={16}
        style={{ pointerEvents: "none" }}
      >
        <p className="rounded-full bg-ink/80 px-2 py-0.5 font-display text-[11px] font-semibold text-parchment">
          Supply
        </p>
      </Html>
    </group>
  );
}

function SupplyShip() {
  const days = useGame((s) => s.daysPlayed);
  const supplyDay = useGame((s) => s.supplyDay);
  const newcomer = useGame((s) => s.newcomer);
  const take = useGame((s) => s.takeSupply);
  const welcome = useGame((s) => s.welcomeNewcomer);
  const due = supplyDue(days) && supplyDay === days;
  const ref = useRef<THREE.Group>(null);
  const t = useRef(0);
  const spoke = useRef(false);
  const who = NEWCOMERS.find((n) => n.name === newcomer);
  useFrame((_, dt) => {
    if (!due || !ref.current) return;
    t.current = Math.min(1, t.current + dt / 8);
    const eased = 1 - Math.pow(1 - t.current, 3);
    const x = -220 + eased * (SUPPLY_BERTH.x - -220);
    const p = to3(x, SUPPLY_BERTH.y, 0);
    ref.current.position.set(
      p[0],
      SEA_LEVEL + 0.08 + Math.sin(eased * 8) * 0.03,
      p[2],
    );
    ref.current.rotation.y = 0;
    if (!spoke.current && t.current > 0.92) {
      spoke.current = true;
      const name = useGame.getState().newcomer;
      useGame
        .getState()
        .speak(
          name
            ? `Supply ship tied up. Crates on the south pier, and ${name} is coming ashore.`
            : "Supply ship tied up on the south pier. The mainland sent crates.",
        );
    }
  });
  if (!due) return null;
  return (
    <group>
      <group ref={ref}>
        <group
          onClick={(e) => {
            e.stopPropagation();
            take();
          }}
        >
          <SupplyHull />
        </group>
      </group>
      <mesh
        position={to3(
          (SUPPLY_PIER.x + SUPPLY_BERTH.x) / 2,
          (SUPPLY_PIER.y + SUPPLY_BERTH.y) / 2,
          0.35,
        )}
        rotation={[0.4, 0, 0]}
        castShadow
      >
        <boxGeometry args={[0.7, 0.06, 0.28]} />
        <meshStandardMaterial color="#c4894a" />
      </mesh>
      <group
        position={to3(SUPPLY_PIER.x + 20, SUPPLY_PIER.y + 8, 0.28)}
        onClick={(e) => {
          e.stopPropagation();
          take();
        }}
      >
        <mesh castShadow>
          <boxGeometry args={[0.34, 0.28, 0.34]} />
          <meshStandardMaterial color="#8a6238" />
        </mesh>
      </group>
      {who ? (
        <group
          position={to3(
            SUPPLY_PIER.x - 10,
            SUPPLY_PIER.y + 18,
            groundY(SUPPLY_PIER.x, SUPPLY_PIER.y),
          )}
          onClick={(e) => {
            e.stopPropagation();
            welcome();
          }}
        >
          <GnomeRig hat={who.hat} scale={1.15} beard={false} />
          <Html
            position={[0, 1.6, 0]}
            center
            distanceFactor={14}
            style={{ pointerEvents: "none" }}
          >
            <p className="whitespace-nowrap rounded-full bg-ink/80 px-2 py-0.5 font-display text-[11px] font-semibold text-parchment">
              {who.name}
            </p>
          </Html>
        </group>
      ) : null}
    </group>
  );
}

export function Harbor3({
  onBoat,
  onCaptain,
  onHouse,
}: {
  onBoat: (
    id: BoatId,
    x: number,
    y: number,
    title: string,
    blurb: string,
  ) => void;
  onCaptain: () => void;
  onHouse: () => void;
}) {
  const yard = to3(90, 430, 0);
  const afloat = useGame((s) => s.afloat);
  const cannons = useGame((s) => s.cannons);
  const ports = useGame((s) => s.ports);
  const naval = useGame((s) => s.naval);
  return (
    <group>
      {BOATS.map((boat) => {
        if (
          afloat === boat.id ||
          ports.shipments.some((t) => t.boat === boat.id)
        )
          return null;
        const p = to3(boat.x, boat.y, SEA_LEVEL + 0.06);
        return (
          <group
            key={boat.id}
            position={p}
            rotation={[0, boat.id === "barge" ? 0.4 : -0.5, 0]}
            onClick={(e) => {
              e.stopPropagation();
              onBoat(boat.id, boat.x, boat.y, boat.name, boat.blurb);
            }}
          >
            <Bob speed={0.7 + boat.need * 0.05}>
              <group scale={2.4}>
                <BoatMesh
                  kind={boat.id}
                  cannon={cannons}
                  parts={ports.parts[boat.id]}
                  guns={shipFit(naval, boat.id).guns}
                  crew={shipFit(naval, boat.id).crew}
                />
              </group>
            </Bob>
          </group>
        );
      })}
      <group
        position={to3(90, 470, 0.02)}
        onClick={(e) => {
          e.stopPropagation();
          onCaptain();
        }}
      >
        <PirateRig />
      </group>
      <Pier />
      <SupplyPier />
      <Dockhouse onEnter={onHouse} />
      <SupplyShip />
      <group position={yard}>
        <Gull radius={1.6} speed={0.35} lift={1.8} />
        <Gull radius={2.2} speed={0.22} lift={2.3} />
        <Gull radius={1.1} speed={0.5} lift={1.4} />
      </group>
    </group>
  );
}
