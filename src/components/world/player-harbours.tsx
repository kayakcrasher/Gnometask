import { Html } from "@react-three/drei";
import { useGame } from "@/lib/game/store";
import {
  PORT_SITES,
  NORTH_LANDING,
  shipmentPosition,
  type Dock,
} from "@/lib/game/ports";
import { to3, groundY } from "@/lib/game/world3";
import { SEA_LEVEL } from "@/lib/game/data/water";
import { HomeAsset } from "./home-asset";
import { BoatMesh } from "./boats";
import { boatById } from "@/lib/game/data/boats";
function Beam({
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
      <meshStandardMaterial color={color} />
    </mesh>
  );
}
export function DockAsset({
  dock,
  x,
  y,
  water,
}: {
  dock: Dock;
  x: number;
  y: number;
  water: { x: number; y: number };
}) {
  const length = Math.hypot(x - water.x, y - water.y) * 0.05,
    angle = Math.atan2(water.x - x, water.y - y),
    color =
      dock.style === "slate"
        ? "#7d9095"
        : dock.style === "mint"
          ? "#a8c7b4"
          : "#b79365",
    trim =
      dock.style === "mint"
        ? "#3f7b6a"
        : dock.style === "slate"
          ? "#d9d5c1"
          : "#775837";
  return (
    <group position={to3(x, y, SEA_LEVEL)} rotation={[0, angle, 0]}>
      <Beam
        at={[0, 0.25, length / 2]}
        size={[1.6, 0.22, length]}
        color={color}
      />
      {Array.from({ length: Math.ceil(length / 0.6) }, (_, i) => (
        <Beam
          key={i}
          at={[0, 0.38, i * 0.6]}
          size={[1.58, 0.035, 0.035]}
          color={trim}
        />
      ))}
      {Array.from({ length: Math.ceil(length / 2) }, (_, i) =>
        [-1, 1].map((side) => (
          <Beam
            key={`${side}-${i}`}
            at={[side * 0.65, -0.15, i * 2]}
            size={[0.2, 1.6, 0.2]}
            color={trim}
          />
        )),
      )}
      {Array.from({ length: dock.level }, (_, i) => (
        <group key={i} position={[(i - (dock.level - 1) / 2) * 2.6, 0, length]}>
          <Beam at={[0, 0.25, 0]} size={[2.5, 0.22, 1.2]} color={color} />
          <Beam at={[0.8, 0.52, 0.3]} size={[0.14, 0.4, 0.14]} color={trim} />
          <mesh position={[0.8, 0.83, 0.3]}>
            <sphereGeometry args={[0.11, 8, 6]} />
            <meshStandardMaterial
              color="#f8d590"
              emissive="#f8c873"
              emissiveIntensity={0.8}
            />
          </mesh>
        </group>
      ))}
      {dock.level >= 2 && (
        <group position={[2, 0, length - 2]}>
          <Beam at={[0, 0.9, 0]} size={[2, 1.4, 2]} color="#cfb891" />
          <Beam at={[0, 1.7, 0]} size={[2.2, 0.2, 2.2]} color={trim} />
          <Beam at={[0, 0.75, 1.03]} size={[1.1, 1.1, 0.05]} color="#70563b" />
        </group>
      )}
      {dock.level >= 3 && (
        <group position={[-3, 0, length - 2]}>
          <Beam at={[0, 2, 0]} size={[0.25, 4, 0.25]} color="#b69a64" />
          <Beam at={[1.2, 4, 0]} size={[2.6, 0.2, 0.2]} color="#b69a64" />
          <Beam at={[2.4, 3, 0]} size={[0.05, 2, 0.05]} color="#6e7673" />
          <Beam at={[2.4, 1.8, 0]} size={[0.65, 0.5, 0.65]} color="#a98050" />
        </group>
      )}
      <Beam at={[-0.8, 1.2, 1]} size={[0.08, 2.4, 0.08]} color={trim} />
      <Beam
        at={[-0.35, 2.15, 1]}
        size={[0.85, 0.45, 0.04]}
        color={dock.style === "mint" ? "#86bca7" : "#d9bc73"}
      />
    </group>
  );
}
export function PlayerHarbours() {
  const s = useGame();
  return (
    <group>
      <group
        position={to3(2070, -3060, groundY(2070, -3060))}
        onClick={(e) => {
          e.stopPropagation();
          if (
            !s.afloat &&
            !s.combat &&
            Math.hypot(s.gnomeX - 2070, s.gnomeY + 3060) < 180
          )
            s.enterInterior("bank");
          else
            s.speak(
              "Mossroot’s northern branch is beside the public landing. Come ashore and walk to the harbour office.",
            );
        }}
      >
        <HomeAsset
          id="thimble-harbour-office"
          level={2}
          style="harbour"
          lantern
        />
        <Html center position={[0, 4, 0]}>
          <p className="pointer-events-none whitespace-nowrap rounded-full bg-pine/90 px-3 py-1 text-xs font-bold text-parchment">
            Thimblehaven · Public landing / Mossroot branch
          </p>
        </Html>
      </group>
      {[
        [2100, -3230],
        [2210, -3100],
      ].map(([x, y], i) => (
        <group key={i} position={to3(x!, y!, groundY(x!, y!))}>
          <HomeAsset
            id={`thimble-starter-${i}`}
            level={1}
            style={i ? "stone" : "harbour"}
            lantern
          />
        </group>
      ))}
      <DockAsset
        dock={{ site: "north-landing", level: 1, style: "mint" }}
        {...NORTH_LANDING}
      />
      {s.ports.docks.map((d) => {
        const site = PORT_SITES.find((p) => p.id === d.site);
        return site ? <DockAsset key={d.site} dock={d} {...site} /> : null;
      })}
      {PORT_SITES.filter((p) => !s.ports.plots.includes(p.id)).map((p) => (
        <group key={p.id} position={to3(p.x + 45, p.y, groundY(p.x + 45, p.y))}>
          <Beam at={[0, 0.7, 0]} size={[0.12, 1.4, 0.12]} color="#735839" />
          <Beam at={[0, 1.4, 0]} size={[1.15, 0.6, 0.1]} color="#d9c191" />
        </group>
      ))}
      {s.ports.shipments.map((t) => {
        const p = shipmentPosition(t),
          boat = boatById(t.boat);
        return p && boat ? (
          <group
            key={t.boat}
            position={to3(p.x, p.y, SEA_LEVEL + 0.06)}
            rotation={[0, p.heading, 0]}
            scale={2.4}
          >
            <BoatMesh kind={boat.id} parts={s.ports.parts[t.boat]} />
          </group>
        ) : null;
      })}
    </group>
  );
}
