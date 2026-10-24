import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export type ShipKind = "supply" | "sloop" | "barge" | "fisher";
const STATIONS = [
  [-0.48, 0.65],
  [-0.34, 0.94],
  [-0.05, 1],
  [0.25, 0.83],
  [0.43, 0.42],
  [0.55, 0.025],
];

/** Closed, tapered hull with a waterline, sloping sides and a keel. Bow faces +Z. */
export function shipGeometry(length: number, width: number) {
  const section = [
    [-0.45, 0.24],
    [-0.5, 0.1],
    [-0.34, -0.12],
    [0, -0.22],
    [0.34, -0.12],
    [0.5, 0.1],
    [0.45, 0.24],
  ];
  const positions: number[] = [],
    deck: number[] = [];
  const vertex = (station: number, ring: number): number[] => {
    const [z, spread] = STATIONS[station]!,
      [x, y] = section[ring]!;
    return [x! * width * spread!, y! * width, z! * length];
  };
  const tri = (a: number[], b: number[], c: number[]) =>
    positions.push(...a, ...b, ...c);
  for (let i = 1; i < STATIONS.length; i++) {
    for (let j = 1; j < section.length; j++) {
      const a = vertex(i - 1, j - 1),
        b = vertex(i, j - 1),
        c = vertex(i, j),
        d = vertex(i - 1, j);
      tri(a, c, b);
      tri(a, d, c);
    }
    const a = vertex(i - 1, 0),
      b = vertex(i, 0),
      c = vertex(i, 6),
      d = vertex(i - 1, 6);
    deck.push(...a, ...b, ...c, ...a, ...c, ...d);
  }
  for (const i of [0, STATIONS.length - 1]) {
    const ring = section.map((_, j) => vertex(i, j));
    for (let j = 1; j < ring.length - 1; j++) {
      if (i === 0) tri(ring[0]!, ring[j]!, ring[j + 1]!);
      else tri(ring[0]!, ring[j + 1]!, ring[j]!);
    }
  }
  const make = (array: number[]) => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(array, 3),
    );
    geometry.computeVertexNormals();
    return geometry;
  };
  return { hull: make(positions), deck: make(deck) };
}

function Rope({
  points,
  color = "#c1ad87",
}: {
  points: number[];
  color?: string;
}) {
  const signature = points.join(",");
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
    return g;
  }, [signature]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color={color} />
    </lineSegments>
  );
}

function SquareSail({
  height,
  width,
  z,
  dark = false,
}: {
  height: number;
  width: number;
  z: number;
  dark?: boolean;
}) {
  const cloth = useRef<THREE.Group>(null);
  const geometry = useMemo(() => {
    const g = new THREE.PlaneGeometry(width, height * 0.55, 8, 5);
    const positions = g.getAttribute("position");
    for (let i = 0; i < positions.count; i++)
      positions.setZ(
        i,
        Math.sin((positions.getX(i) / width + 0.5) * Math.PI) * height * 0.13,
      );
    g.computeVertexNormals();
    return g;
  }, [height, width]);
  const rest=useMemo(()=>new Float32Array(geometry.getAttribute('position').array),[geometry]);
  const normalFrame=useRef(0);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useFrame(({clock})=>{
    const positions=geometry.getAttribute('position');
    for(let i=0;i<positions.count;i++){
      const x=rest[i*3]!,y=rest[i*3+1]!,edge=Math.sin(Math.PI*(x/width+.5))*Math.sin(Math.PI*(y/(height*.55)+.5));
      positions.setZ(i,rest[i*3+2]!+Math.sin(clock.elapsedTime*1.6+x*1.4+z)*height*.018*edge);
    }
    positions.needsUpdate=true;
    if(++normalFrame.current%3===0)geometry.computeVertexNormals();
    if(cloth.current)cloth.current.rotation.y=Math.sin(clock.elapsedTime*.7+z)*.025;
  });
  return (
    <group position={[0, 0, z]}>
      <mesh position={[0, height / 2, 0]} castShadow>
        <cylinderGeometry args={[0.018, 0.028, height, 8]} />
        <meshStandardMaterial color="#61412c" />
      </mesh>
      <group ref={cloth} position={[0, height * 0.64, 0]}>
        <mesh geometry={geometry} castShadow>
          <meshStandardMaterial
            color={dark ? "#e4d1a8" : "#f4ead3"}
            side={THREE.DoubleSide}
            roughness={1}
          />
        </mesh>
        <mesh position={[0, height * 0.28, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.014, 0.014, width * 1.12, 8]} />
          <meshStandardMaterial color="#61412c" />
        </mesh>
        <mesh position={[0, -height * 0.27, 0]}>
          <boxGeometry args={[width, 0.025, 0.025]} />
          <meshStandardMaterial color="#61412c" />
        </mesh>
      </group>
      <mesh position={[0.13, height * 0.99, 0]}>
        <boxGeometry args={[0.24, 0.12, 0.015]} />
        <meshStandardMaterial color={dark ? "#a44538" : "#28495a"} />
      </mesh>
    </group>
  );
}

export function LargeShip({
  kind = "sloop",
  cannon = false,
}: {
  kind?: ShipKind;
  cannon?: boolean;
}) {
  const supply = kind === "supply",
    barge = kind === "barge",
    fisher = kind === "fisher";
  const length = supply ? 3.6 : barge ? 1.8 : fisher ? 1.4 : 1.75;
  const width = supply ? 1.05 : barge ? 0.7 : fisher ? 0.56 : 0.64;
  const geometry = useMemo(() => shipGeometry(length, width), [length, width]);
  useEffect(
    () => () => {
      geometry.hull.dispose();
      geometry.deck.dispose();
    },
    [geometry],
  );
  const deck = width * 0.24;
  const cabinZ = -length * 0.29,
    cabinH = supply ? 0.55 : 0.28;
  const rigging: number[] = [];
  if (!barge && !fisher)
    for (const z of [length * 0.16, -length * 0.18])
      for (const side of [-1, 1]) {
        rigging.push(
          side * width * 0.43,
          deck,
          z - length * 0.19,
          0,
          deck + length * 0.77,
          z,
        );
        rigging.push(
          side * width * 0.43,
          deck,
          z + length * 0.19,
          0,
          deck + length * 0.77,
          z,
        );
      }
  return (
    <group>
      <mesh geometry={geometry.hull} castShadow receiveShadow>
        <meshStandardMaterial
          color={
            supply
              ? "#223d50"
              : fisher
                ? "#346675"
                : barge
                  ? "#69482f"
                  : "#763d2b"
          }
          side={THREE.DoubleSide}
          roughness={0.75}
        />
      </mesh>
      <mesh geometry={geometry.deck} receiveShadow>
        <meshStandardMaterial
          color="#c09a64"
          side={THREE.DoubleSide}
          roughness={0.9}
        />
      </mesh>
      {STATIONS.slice(0, -1).map(([z, spread], i) => (
        <group key={i}>
          <mesh position={[0, deck + 0.002, z! * length]}>
            <boxGeometry args={[spread! * width * 0.87, 0.005, 0.012]} />
            <meshStandardMaterial color="#89643e" />
          </mesh>
          {[-1, 1].map((side) => (
            <mesh
              key={side}
              position={[
                side * width * spread! * 0.44,
                deck + 0.08,
                z! * length,
              ]}
            >
              <cylinderGeometry args={[0.009, 0.009, 0.16, 5]} />
              <meshStandardMaterial color="#d3b37b" />
            </mesh>
          ))}
        </group>
      ))}
      {[-1, 1].map((side) => (
        <group key={side}>
          <Rope
            color="#d3b37b"
            points={STATIONS.slice(0, -1).flatMap(([z, w], i, array) =>
              i
                ? [
                    side * array[i - 1]![1]! * width * 0.44,
                    deck + 0.15,
                    array[i - 1]![0]! * length,
                    side * w! * width * 0.44,
                    deck + 0.15,
                    z! * length,
                  ]
                : [],
            )}
          />
          {[-0.3, -0.1, 0.1, 0.3].map((z) => (
            <mesh
              key={z}
              position={[side * width * 0.47, deck - 0.09, z * length]}
              rotation={[0, 0, Math.PI / 2]}
            >
              <cylinderGeometry args={[0.025, 0.025, 0.02, 10]} />
              <meshStandardMaterial color="#c6a25c" metalness={0.6} />
            </mesh>
          ))}
        </group>
      ))}
      <group position={[0, deck, cabinZ]}>
        <mesh position={[0, cabinH / 2, 0]} castShadow>
          <boxGeometry args={[width * 0.68, cabinH, length * 0.2]} />
          <meshStandardMaterial color={supply ? "#e3d8bc" : "#42616b"} />
        </mesh>
        <mesh position={[0, cabinH + 0.025, 0]} castShadow>
          <boxGeometry args={[width * 0.8, 0.05, length * 0.24]} />
          <meshStandardMaterial color="#654433" />
        </mesh>
        {[-0.2, 0.2].map((x) => (
          <mesh key={x} position={[x * width, cabinH * 0.65, length * 0.102]}>
            <boxGeometry args={[width * 0.2, cabinH * 0.32, 0.012]} />
            <meshStandardMaterial
              color="#a6d3dc"
              metalness={0.25}
              roughness={0.2}
            />
          </mesh>
        ))}
      </group>
      {(supply || barge) &&
        [-0.08, 0.13, 0.32].map((z, i) => (
          <group key={z} position={[0, deck + 0.13, z * length]}>
            <mesh castShadow>
              <boxGeometry args={[width * 0.55, 0.25, length * 0.13]} />
              <meshStandardMaterial
                color={["#9d744b", "#4d7372", "#a15b40"][i]}
              />
            </mesh>
            {[-0.16, 0.16].map((x) => (
              <mesh key={x} position={[width * x, 0, 0]}>
                <boxGeometry args={[0.025, 0.26, length * 0.135]} />
                <meshStandardMaterial color="#d5b881" />
              </mesh>
            ))}
          </group>
        ))}
      {!barge && !fisher && (
        <group position={[0, deck, 0]}>
          <SquareSail
            height={length * 0.82}
            width={width * 1.6}
            z={length * 0.16}
          />
          <SquareSail
            height={length * 0.67}
            width={width * 1.28}
            z={-length * 0.18}
            dark
          />
          <Rope points={rigging} />
          <mesh
            position={[0, 0.04, length * 0.55]}
            rotation={[Math.PI / 2 - 0.2, 0, 0]}
          >
            <cylinderGeometry args={[0.018, 0.024, length * 0.28, 8]} />
            <meshStandardMaterial color="#7a5738" />
          </mesh>
        </group>
      )}
      {(barge || fisher) && (
        <mesh position={[width * 0.12, deck + cabinH + 0.12, cabinZ]}>
          <cylinderGeometry args={[0.035, 0.04, 0.24, 8]} />
          <meshStandardMaterial color="#293a3d" />
        </mesh>
      )}
      {cannon &&
        [-1, 1].flatMap((side) =>
          [-0.05, 0.23].map((z) => (
            <group
              key={`${side}-${z}`}
              position={[side * width * 0.4, deck + 0.09, z * length]}
            >
              <mesh rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.035, 0.045, width * 0.5, 10]} />
                <meshStandardMaterial color="#2b3030" metalness={0.5} />
              </mesh>
              <mesh position={[0, -0.055, 0]}>
                <boxGeometry args={[0.16, 0.07, 0.14]} />
                <meshStandardMaterial color="#654433" />
              </mesh>
            </group>
          )),
        )}
      <mesh
        position={[0, deck + 0.05, -length * 0.08]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <torusGeometry args={[width * 0.13, 0.012, 5, 14]} />
        <meshStandardMaterial color="#b99b65" />
      </mesh>
    </group>
  );
}
