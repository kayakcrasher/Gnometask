import { Html } from "@react-three/drei";
import { Kenney } from "./kenney";
import { to3, groundY } from "@/lib/game/world3";
import { TOWN_SHOPS, HAVEN_ORIGIN } from "@/lib/game/world";
import { EMPTY_LOTS, PLACE_ANCHORS } from "@/lib/game/data/layout";
import { useGame } from "@/lib/game/store";
import type { InteriorId } from "@/lib/game/types";

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
  const h = tall ? 2.35 : 1.7;
  const w = tall ? 2.15 : 1.75;
  const d = 1.45;
  const upper = h - 0.84;
  const rc = roof === "pine" || roof === "moss" ? "#8d4e3c" : "#c4553a";
  return (
    <group
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onEnter?.();
      }}
    >
      <mesh position={[0, 0.42, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, 0.84, d]} />
        <meshStandardMaterial color="#d5d0c4" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.84 + upper / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w * 0.94, upper, d * 0.94]} />
        <meshStandardMaterial color="#f0e2c4" roughness={0.8} />
      </mesh>
      {[-1, 0, 1].map((i) => (
        <mesh key={i} position={[(i * w) / 3.2, 0.84 + upper / 2, d / 2 + 0.01]}>
          <boxGeometry args={[0.06, upper, 0.04]} />
          <meshStandardMaterial color="#6b5340" />
        </mesh>
      ))}
      <mesh position={[0, 0.84 + upper * 0.55, d / 2 + 0.02]}>
        <boxGeometry args={[w * 0.94, 0.06, 0.04]} />
        <meshStandardMaterial color="#6b5340" />
      </mesh>
      <mesh position={[-w * 0.2, h + 0.2, 0]} rotation={[0, 0, 0.58]} castShadow>
        <boxGeometry args={[w * 0.72, 0.08, d + 0.36]} />
        <meshStandardMaterial color={rc} roughness={0.62} />
      </mesh>
      <mesh position={[w * 0.2, h + 0.2, 0]} rotation={[0, 0, -0.58]} castShadow>
        <boxGeometry args={[w * 0.72, 0.08, d + 0.36]} />
        <meshStandardMaterial color={rc} roughness={0.62} />
      </mesh>
      <mesh position={[0, h + 0.4, 0]} castShadow>
        <boxGeometry args={[0.08, 0.06, d + 0.4]} />
        <meshStandardMaterial color="#8a3a32" />
      </mesh>
      <mesh position={[w * 0.28, h + 0.48, -d * 0.12]} castShadow>
        <boxGeometry args={[0.16, 0.42, 0.16]} />
        <meshStandardMaterial color="#cfc8ba" />
      </mesh>
      <mesh position={[0, 0.28, d / 2 + 0.02]} castShadow>
        <boxGeometry args={[0.32, 0.56, 0.06]} />
        <meshStandardMaterial color="#5b4230" />
      </mesh>
      <mesh position={[0, 0.08, d / 2 + 0.22]} receiveShadow>
        <boxGeometry args={[0.55, 0.12, 0.32]} />
        <meshStandardMaterial color="#b7b1a4" />
      </mesh>
      {[-0.42, 0.42].map((x) => (
        <group key={x} position={[x, 1.15, d / 2 + 0.02]}>
          <mesh>
            <boxGeometry args={[0.26, 0.26, 0.04]} />
            <meshStandardMaterial color="#cfe4ef" emissive="#9ec3d4" emissiveIntensity={0.12} />
          </mesh>
          <mesh>
            <boxGeometry args={[0.26, 0.03, 0.05]} />
            <meshStandardMaterial color="#6b5340" />
          </mesh>
          <mesh>
            <boxGeometry args={[0.03, 0.26, 0.05]} />
            <meshStandardMaterial color="#6b5340" />
          </mesh>
        </group>
      ))}
      {tall ? (
        <mesh position={[0, 1.35, d / 2 + 0.16]}>
          <boxGeometry args={[w * 0.7, 0.06, 0.08]} />
          <meshStandardMaterial color="#6b5340" />
        </mesh>
      ) : null}
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

function Hall3({
  level,
  position,
  onEnter,
}: {
  level: number;
  position: [number, number, number];
  onEnter?: () => void;
}) {
  const stone = level >= 3;
  const castle = level >= 5;
  const w = 1.7 + level * 0.22;
  const d = 1.35 + level * 0.08;
  const wall = castle ? 2.15 : 1.15 + level * 0.12;
  const body = stone ? "#c9c3b4" : "#f0e2c4";
  const roof = castle ? "#8d4e3c" : "#c4553a";
  return (
    <group
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onEnter?.();
      }}
    >
      <mesh position={[0, wall / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, wall, d]} />
        <meshStandardMaterial color={body} roughness={0.82} />
      </mesh>
      {stone
        ? [-1, 0, 1].map((i) => (
            <mesh key={i} position={[(i * w) / 3.1, wall * 0.45, d / 2 + 0.02]}>
              <boxGeometry args={[0.08, wall * 0.7, 0.04]} />
              <meshStandardMaterial color="#8a8378" />
            </mesh>
          ))
        : null}
      <mesh position={[0, 0.32, d / 2 + 0.04]} castShadow>
        <boxGeometry args={[0.36, 0.62, 0.06]} />
        <meshStandardMaterial color="#5b4230" />
      </mesh>
      {castle ? (
        <>
          {[-1, 1].map((side) => (
            <group key={side} position={[side * (w / 2 + 0.15), 0, 0]}>
              <mesh position={[0, 1.35, 0]} castShadow>
                <boxGeometry args={[0.7, 2.7, 0.7]} />
                <meshStandardMaterial color="#b7b1a4" />
              </mesh>
              {[-1, 1].map((z) => (
                <mesh key={z} position={[0, 2.75, z * 0.28]}>
                  <boxGeometry args={[0.74, 0.16, 0.16]} />
                  <meshStandardMaterial color="#9a9488" />
                </mesh>
              ))}
            </group>
          ))}
          <mesh position={[0, wall + 0.12, 0]}>
            <boxGeometry args={[w + 0.08, 0.16, d + 0.08]} />
            <meshStandardMaterial color="#9a9488" />
          </mesh>
        </>
      ) : (
        <>
          <mesh position={[-w * 0.18, wall + 0.16, 0]} rotation={[0, 0, 0.55]} castShadow>
            <boxGeometry args={[w * 0.7, 0.08, d + 0.3]} />
            <meshStandardMaterial color={roof} />
          </mesh>
          <mesh position={[w * 0.18, wall + 0.16, 0]} rotation={[0, 0, -0.55]} castShadow>
            <boxGeometry args={[w * 0.7, 0.08, d + 0.3]} />
            <meshStandardMaterial color={roof} />
          </mesh>
          {level >= 4 ? (
            <mesh position={[w * 0.28, wall + 0.7, 0]} castShadow>
              <cylinderGeometry args={[0.22, 0.26, 1.1, 8]} />
              <meshStandardMaterial color="#c9c3b4" />
            </mesh>
          ) : null}
        </>
      )}
      <mesh position={[0, 0.08, d / 2 + 0.28]} receiveShadow>
        <boxGeometry args={[0.7, 0.12, 0.4]} />
        <meshStandardMaterial color="#b7b1a4" />
      </mesh>
    </group>
  );
}

function Bank3({
  position,
  onEnter,
}: {
  position: [number, number, number];
  onEnter?: () => void;
}) {
  const coins = useGame((s) => s.coins);
  const tier = coins >= 200 ? 4 : coins >= 100 ? 3 : coins >= 40 ? 2 : 1;
  const w = 1.5 + tier * 0.28;
  const h = 1.15 + tier * 0.28;
  const stone = tier >= 2;
  return (
    <group
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onEnter?.();
      }}
    >
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, h, 1.35]} />
        <meshStandardMaterial color={stone ? "#d9d3c6" : "#f0e2c4"} />
      </mesh>
      {tier >= 3
        ? [-1, 1].map((side) => (
            <mesh key={side} position={[side * (w / 2 - 0.15), h * 0.45, 0.7]} castShadow>
              <boxGeometry args={[0.14, h * 0.7, 0.14]} />
              <meshStandardMaterial color="#c9c3b4" />
            </mesh>
          ))
        : null}
      <mesh position={[0, 0.36, 0.72]} castShadow>
        <boxGeometry args={[0.4, 0.7, 0.06]} />
        <meshStandardMaterial color="#5b4230" />
      </mesh>
      <mesh position={[0, h + 0.28, 0]} castShadow>
        <boxGeometry args={[w + 0.2, 0.16, 1.55]} />
        <meshStandardMaterial color={tier >= 4 ? "#d6a84c" : "#c4553a"} />
      </mesh>
      {tier >= 4 ? (
        <mesh position={[0, h + 0.7, 0]} castShadow>
          <boxGeometry args={[0.55, 0.7, 0.55]} />
          <meshStandardMaterial color="#d9d3c6" />
        </mesh>
      ) : null}
      <mesh position={[0, h + (tier >= 4 ? 1.15 : 0.5), 0]}>
        <boxGeometry args={[0.28, 0.18, 0.04]} />
        <meshStandardMaterial color="#e2b84a" metalness={0.4} />
      </mesh>
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
  const spot = PLACE_ANCHORS.cottage;
  const p = to3(spot.x, spot.y, groundY(spot.x, spot.y));
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
  const claimed = useGame((s) => s.claimed);
  return (
    <group>
      {TOWN_SHOPS.map((shop) => {
        const p = to3(shop.x, shop.y, groundY(shop.x, shop.y));
        if (shop.id === "townhall") {
          return <Hall3 key={shop.id} level={hallLevel} position={p} onEnter={() => onEnter(shop.interior, shop.x, shop.y)} />;
        }
        if (shop.id === "bank") {
          return <Bank3 key={shop.id} position={p} onEnter={() => onEnter(shop.interior, shop.x, shop.y)} />;
        }
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
      {EMPTY_LOTS.map((lot) => (
        <group key={lot.id} position={to3(lot.x, lot.y, groundY(lot.x, lot.y))}>
          <mesh position={[0, 0.05, 0]} receiveShadow>
            <boxGeometry args={[1.15, 0.08, 0.9]} />
            <meshStandardMaterial color="#cfc8ba" />
          </mesh>
          {[
            [-0.5, -0.38],
            [0.5, -0.38],
            [-0.5, 0.38],
            [0.5, 0.38],
          ].map(([x, z]) => (
            <mesh key={`${x}-${z}`} position={[x!, 0.16, z!]} castShadow>
              <boxGeometry args={[0.08, 0.22, 0.08]} />
              <meshStandardMaterial color="#8a7a68" />
            </mesh>
          ))}
          {claimed.includes(lot.id) ? (
            <mesh position={[0, 0.55, 0]} castShadow>
              <boxGeometry args={[0.06, 0.7, 0.06]} />
              <meshStandardMaterial color="#5b4230" />
            </mesh>
          ) : null}
          {claimed.includes(lot.id) ? (
            <mesh position={[0.16, 0.78, 0]}>
              <boxGeometry args={[0.28, 0.16, 0.03]} />
              <meshStandardMaterial color="#d6a84c" />
            </mesh>
          ) : null}
        </group>
      ))}
      <Kenney name="fence_gate" position={to3(360, 500, 0)} scale={1.2} />
      <Kenney name="fence_simple" position={to3(600, 500, 0)} scale={1.2} />
      <Kenney name="plant_bushSmall" position={to3(420, 500, 0)} scale={1.2} />
      <mesh position={to3(470, 480, 0.15)}>
        <cylinderGeometry args={[0.45, 0.58, 0.22, 16]} />
        <meshStandardMaterial color="#8a7a68" />
      </mesh>
      <mesh position={to3(470, 480, 0.28)}>
        <cylinderGeometry args={[0.32, 0.32, 0.08, 16]} />
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
