import { Html } from "@react-three/drei";
import { Kenney } from "./kenney";
import { to3, groundY } from "@/lib/game/world3";
import { TOWN_SHOPS, HAVEN_ORIGIN } from "@/lib/game/world";
import { useGame } from "@/lib/game/store";
import type { InteriorId } from "@/lib/game/types";

const ROOF: Record<string, string> = {
  gold: "#d6a84c",
  berry: "#a8433b",
  pine: "#35543f",
  stone: "#6b5340",
  moss: "#5c7a54",
  cream: "#c4a574",
};

function TimberHouse({
  position,
  roof = "cream",
  tall,
  sign,
  onEnter,
}: {
  position: [number, number, number];
  roof?: string;
  tall?: boolean;
  sign?: string;
  onEnter?: () => void;
}) {
  const panel = useGame((s) => s.panel);
  const combat = useGame((s) => s.combat);
  const interior = useGame((s) => s.interior);
  const showLabel = !combat && !interior && panel === "place";
  const h = tall ? 2.4 : 1.7;
  const w = tall ? 2.1 : 1.7;
  const d = 1.5;
  const rc = ROOF[roof] ?? ROOF.cream!;
  return (
    <group
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onEnter?.();
      }}
    >
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color="#efe4c8" roughness={0.85} />
      </mesh>
      {[-0.55, 0, 0.55].map((x) => (
        <mesh key={x} position={[x * (w / 2.2), h / 2, d / 2 + 0.01]}>
          <boxGeometry args={[0.08, h, 0.04]} />
          <meshStandardMaterial color="#5b4230" />
        </mesh>
      ))}
      <mesh position={[0, h + 0.55, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[w * 0.78, 1.15, 4]} />
        <meshStandardMaterial color={rc} roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.42, d / 2 + 0.02]} castShadow>
        <boxGeometry args={[0.32, 0.7, 0.06]} />
        <meshStandardMaterial color="#5b4230" />
      </mesh>
      <mesh position={[-0.45, 0.95, d / 2 + 0.02]}>
        <boxGeometry args={[0.28, 0.28, 0.04]} />
        <meshStandardMaterial color="#cfe8c9" emissive="#9ec3b8" emissiveIntensity={0.15} />
      </mesh>
      <mesh position={[0.45, 0.95, d / 2 + 0.02]}>
        <boxGeometry args={[0.28, 0.28, 0.04]} />
        <meshStandardMaterial color="#cfe8c9" emissive="#9ec3b8" emissiveIntensity={0.15} />
      </mesh>
      {sign && showLabel ? (
        <Html zIndexRange={[8, 0]} position={[0, h + 0.2, d / 2 + 0.08]} center distanceFactor={16} style={{ pointerEvents: "none" }}>
          <span className="rounded-full bg-ink/80 px-2 py-0.5 font-display text-[10px] font-semibold text-parchment">
            {sign}
          </span>
        </Html>
      ) : null}
    </group>
  );
}

export function Cottage3({
  upgrades,
  onEnter,
}: {
  upgrades: string[];
  onEnter: () => void;
}) {
  const p = to3(374, 400, groundY(374, 400));
  return (
    <group
      position={p}
      onClick={(e) => {
        e.stopPropagation();
        onEnter();
      }}
    >
      <TimberHouse position={[0, 0, 0]} roof="berry" sign="Home" onEnter={onEnter} />
      {upgrades.includes("house-fence") ? (
        <>
          <Kenney name="fence_simpleLow" position={[-1.6, 0, 1.4]} scale={1.2} />
          <Kenney name="fence_simpleLow" position={[1.6, 0, 1.4]} scale={1.2} />
        </>
      ) : null}
      <Kenney name="flower_redA" position={[1.1, 0, 1.1]} scale={1.3} />
      <Kenney name="flower_yellowA" position={[-1.2, 0, 1.15]} scale={1.3} />
    </group>
  );
}

export function Town3({
  hallLevel,
  onEnter,
}: {
  hallLevel: number;
  onEnter: (id: InteriorId, x: number, y: number) => void;
}) {
  return (
    <group>
      {TOWN_SHOPS.map((shop) => {
        const p = to3(shop.x, shop.y, groundY(shop.x, shop.y));
        return (
          <TimberHouse
            key={shop.id}
            position={p}
            roof={shop.roof}
            tall={shop.tall}
            sign={shop.id === "townhall" ? `Hall ${hallLevel}` : shop.sign}
            onEnter={() => onEnter(shop.interior, shop.x, shop.y)}
          />
        );
      })}
      <Kenney name="fence_gate" position={to3(824, 590, 0)} scale={1.4} />
      <Kenney name="plant_bushSmall" position={to3(780, 500, 0)} scale={1.3} />
      <mesh position={to3(824, 530, 0.15)}>
        <cylinderGeometry args={[0.55, 0.7, 0.25, 16]} />
        <meshStandardMaterial color="#8a7a68" />
      </mesh>
      <mesh position={to3(824, 530, 0.28)}>
        <cylinderGeometry args={[0.38, 0.38, 0.08, 16]} />
        <meshStandardMaterial color="#6a8f8a" roughness={0.3} />
      </mesh>
      <TimberHouse
        position={to3(HAVEN_ORIGIN.x, HAVEN_ORIGIN.y, groundY(HAVEN_ORIGIN.x, HAVEN_ORIGIN.y))}
        roof="gold"
        sign="Haven"
        onEnter={() => onEnter("haven-shop", HAVEN_ORIGIN.x, HAVEN_ORIGIN.y)}
      />
      <Kenney name="fence_simple" position={to3(HAVEN_ORIGIN.x - 40, HAVEN_ORIGIN.y + 30, 0)} scale={1.3} />
    </group>
  );
}

export function VillageHouses({ count, onClick }: { count: number; onClick: (x: number, y: number) => void }) {
  const spots = [
    [1124, 428],
    [1210, 414],
    [1296, 428],
    [1124, 548],
    [1210, 562],
    [1296, 548],
    [1110, 668],
    [1200, 682],
    [1290, 668],
    [1380, 500],
  ];
  return (
    <group>
      {spots.slice(0, Math.max(0, count)).map(([x, y], i) => (
        <TimberHouse
          key={i}
          position={to3(x!, y!, groundY(x!, y!))}
          roof={i % 2 ? "cream" : "moss"}
          sign="Home"
          onEnter={() => onClick(x!, y!)}
        />
      ))}
    </group>
  );
}

export function DockBoat({ onClick }: { onClick: () => void }) {
  const p = to3(90, 500, -0.1);
  return (
    <group
      position={p}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <Kenney name="canoe" scale={1.8} rotation={[0, 0.4, 0]} />
      <Kenney name="canoe_paddle" position={[0.6, 0.1, 0.2]} scale={1.2} />
    </group>
  );
}
