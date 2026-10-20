import { Html } from "@react-three/drei";
import { SUNSTEP_DOCK } from "@/lib/game/data/sunstep-dock";
import { to3, groundY } from "@/lib/game/world3";
import { useGame } from "@/lib/game/store";
export function FutureSunstepHarbour({
  pos,
}: {
  pos: { x: number; y: number };
}) {
  const open = useGame((s) => s.openPopup),
    d = SUNSTEP_DOCK,
    show = () =>
      open({
        kind: "place",
        hotspotId: "sunstep-future-dock",
        title: d.name,
        blurb: `Future harbour concept. ${d.features.join(". ")}. ${d.brief}`,
        x: d.x,
        y: d.y,
      });
  return (
    <group
      position={to3(d.x, d.y, 0)}
      onClick={(e) => {
        e.stopPropagation();
        show();
      }}
    >
      <group position={[0, groundY(d.x, d.y), 0]}>
        <mesh position={[0, 0.05, 0]}>
          <boxGeometry args={[3.8, 0.1, 4.5]} />
          <meshStandardMaterial color="#e8d8b1" transparent opacity={0.55} />
        </mesh>
        <mesh position={[0, 1.05, 0]}>
          <boxGeometry args={[2.5, 2, 2.4]} />
          <meshStandardMaterial color="#e7cba5" transparent opacity={0.55} />
        </mesh>
        <mesh position={[0, 2.3, 0]} rotation={[0, Math.PI / 4, 0]}>
          <coneGeometry args={[2.2, 0.85, 4]} />
          <meshStandardMaterial color="#639fa5" transparent opacity={0.65} />
        </mesh>
      </group>
      <mesh position={[8.8, 0.2, 0]}>
        <boxGeometry args={[17.6, 0.28, 2.5]} />
        <meshStandardMaterial color="#dbc59e" transparent opacity={0.55} />
      </mesh>
      {[5, 10, 15].map((x) => (
        <group key={x}>
          <mesh position={[x, -0.3, 0]}>
            <cylinderGeometry args={[0.15, 0.2, 1, 7]} />
            <meshStandardMaterial color="#9d8264" transparent opacity={0.5} />
          </mesh>
          <mesh position={[7, 0.2, 3.2]}>
            <boxGeometry args={[1.3, 0.28, 4]} />
            <meshStandardMaterial color="#dbc59e" transparent opacity={0.55} />
          </mesh>
          <group position={[5, 0.2, -2.3]}>
            <mesh position={[0, 1.1, 0]}>
              <boxGeometry args={[0.16, 2.2, 0.16]} />
              <meshStandardMaterial color="#b6985f" transparent opacity={0.6} />
            </mesh>
            <mesh position={[0.8, 2.15, 0]}>
              <boxGeometry args={[1.8, 0.15, 0.15]} />
              <meshStandardMaterial color="#b6985f" transparent opacity={0.6} />
            </mesh>
            <mesh position={[1.5, 1.4, 0]}>
              <cylinderGeometry args={[0.025, 0.025, 1.4, 5]} />
              <meshStandardMaterial color="#877b64" />
            </mesh>
            <mesh position={[1.5, 0.35, 0]}>
              <boxGeometry args={[0.65, 0.65, 0.65]} />
              <meshStandardMaterial
                color="#c0a270"
                transparent
                opacity={0.55}
              />
            </mesh>
          </group>
          <mesh position={[-3, 0.05, 2.9]}>
            <boxGeometry args={[3.2, 0.1, 3.8]} />
            <meshStandardMaterial color="#d4bc89" transparent opacity={0.5} />
          </mesh>
          {[-1, 1].map((side) => (
            <mesh key={side} position={[x, 1, side * 1.05]}>
              <sphereGeometry args={[0.1, 7, 6]} />
              <meshStandardMaterial
                color="#ebca7c"
                emissive="#c7a760"
                emissiveIntensity={0.3}
              />
            </mesh>
          ))}
        </group>
      ))}
      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh position={[15, 0.2, side * 3.4]}>
            <boxGeometry args={[2.4, 0.28, 6]} />
            <meshStandardMaterial color="#dbc59e" transparent opacity={0.55} />
          </mesh>
          <mesh position={[17, -0.05, side * 7]}>
            <boxGeometry args={[0.9, 0.6, 9]} />
            <meshStandardMaterial color="#b7b6a1" transparent opacity={0.5} />
          </mesh>
        </group>
      ))}
      <mesh position={[18.2, 1.3, 0]}>
        <cylinderGeometry args={[0.35, 0.65, 2.8, 10]} />
        <meshStandardMaterial color="#e9d9b7" transparent opacity={0.6} />
      </mesh>
      <mesh position={[18.2, 2.9, 0]}>
        <sphereGeometry args={[0.35, 8, 6]} />
        <meshStandardMaterial
          color="#e4c56f"
          emissive="#c8b879"
          emissiveIntensity={0.4}
        />
      </mesh>
      {Math.hypot(pos.x - d.x, pos.y - d.y) < 650 && (
        <Html position={[-3, 2.5, 0]} center zIndexRange={[5, 0]}>
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={show}
            className="min-h-11 whitespace-nowrap rounded-xl bg-parchment px-3 text-xs font-bold text-pine"
          >
            Sunstep harbour plans
          </button>
        </Html>
      )}
    </group>
  );
}
export function NorthernWaystation() {
  const city = useGame((s) => s.city),
    economy = useGame((s) => s.economy),
    depot = city.buildings.find((b) => b.kind === "depot" && b.y < -300);
  return (
    <group>
      {economy.gateway && depot && (
        <group position={to3(depot.x, depot.y, groundY(depot.x, depot.y) + 3)}>
          <Html center style={{ pointerEvents: "none" }}>
            <span className="whitespace-nowrap rounded-xl bg-gold px-3 py-2 text-xs font-bold text-ink">
              {city.name} · Gateway to the Rugged North
            </span>
          </Html>
        </group>
      )}
      <group position={to3(1130, -750, groundY(1130, -750))}>
        <mesh position={[0, 0.35, 0]} rotation={[0, 0, Math.PI / 4]}>
          <coneGeometry args={[1, 0.9, 4]} />
          <meshStandardMaterial color="#8f9e86" />
        </mesh>
        <mesh position={[1.2, 0.2, 0.4]}>
          <boxGeometry args={[1.1, 0.3, 0.4]} />
          <meshStandardMaterial color="#9f805e" />
        </mesh>
      </group>
    </group>
  );
}
