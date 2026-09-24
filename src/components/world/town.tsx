import { Html } from "@react-three/drei";
import { GnomeRig } from "./gnome-rig";
import { Kenney } from "./kenney";
import { to3, groundY } from "@/lib/game/world3";
import { TOWN_SHOPS } from "@/lib/game/world";
import { EMPTY_LOTS, PLACE_ANCHORS, VILLAGE_SLOTS } from "@/lib/game/data/layout";
import { CAPITOL_FOUNTAIN, CAPITOL_HALL, CAPITOL_LAWN, cellsOf, filledCount, townGrid } from "@/lib/game/data/grids";
import { folkLine, settlerRank } from "@/lib/game/data/folk";
import { isWeekend, prosperity, sharePrice } from "@/lib/game/data/market";
const OFFICES: { lot: string; stock: string; name: string; x: number; y: number }[] = [
  { lot: "lot-inn", stock: "keen", name: "Keen Edge", x: 790, y: 280 },
  { lot: "lot-chapel", stock: "mail", name: "Mail & Plate", x: 878, y: 280 },
  { lot: "lot-market", stock: "oar", name: "Oar & Yard", x: 790, y: 390 },
  { lot: "lot-school", stock: "wall", name: "Watch & Wall", x: 878, y: 390 },
];

const EXCHANGE = { x: 560, y: 790 };
const EXCHANGE_HOUSES = [
  { name: "Nell", x: 420, y: 790, hat: "hat-straw" },
  { name: "Hod", x: 490, y: 790, hat: "hat-moss" },
  { name: "Sal", x: 660, y: 790, hat: "hat-berry" },
];

function OfficeBlock({ name, floors }: { name: string; floors: number }) {
  const h = 0.48 * floors;
  const glass = floors >= 4;
  return (
    <group>
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.15, h, 0.9]} />
        <meshStandardMaterial color={glass ? "#243044" : "#d9d3c6"} metalness={glass ? 0.45 : 0.05} roughness={glass ? 0.3 : 0.8} />
      </mesh>
      {Array.from({ length: floors }, (_, i) => (
        <mesh key={i} position={[0, 0.28 + i * 0.48, 0.46]}>
          <boxGeometry args={[0.7, 0.16, 0.04]} />
          <meshStandardMaterial color="#cfe4ef" emissive="#9ec3d4" emissiveIntensity={0.15} />
        </mesh>
      ))}
      <Html position={[0, h + 0.35, 0]} center distanceFactor={16} style={{ pointerEvents: "none" }}>
        <span className="rounded-full bg-ink/80 px-2 py-0.5 font-display text-[10px] font-semibold text-parchment">{name}</span>
      </Html>
    </group>
  );
}
import { useGame } from "@/lib/game/store";
import type { InteriorId } from "@/lib/game/types";

const capitolHall = CAPITOL_HALL;
const havenCells = cellsOf(townGrid("haven"));
const tideCells = cellsOf(townGrid("tideham"));

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
  const h = tall ? 2.85 : 2.15;
  const w = tall ? 2.7 : 2.35;
  const d = tall ? 1.95 : 1.85;
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
  const w = 2.2 + level * 0.24;
  const d = 1.75 + level * 0.1;
  const wall = castle ? 2.55 : 1.45 + level * 0.14;
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
  const w = 1.95 + tier * 0.32;
  const h = 1.5 + tier * 0.32;
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
        <boxGeometry args={[w, h, 1.75]} />
        <meshStandardMaterial color={stone ? "#d9d3c6" : "#f0e2c4"} />
      </mesh>
      {tier >= 3
        ? [-1, 1].map((side) => (
            <mesh key={side} position={[side * (w / 2 - 0.15), h * 0.45, 0.92]} castShadow>
              <boxGeometry args={[0.14, h * 0.7, 0.14]} />
              <meshStandardMaterial color="#c9c3b4" />
            </mesh>
          ))
        : null}
      <mesh position={[0, 0.36, 0.92]} castShadow>
        <boxGeometry args={[0.4, 0.7, 0.06]} />
        <meshStandardMaterial color="#5b4230" />
      </mesh>
      <mesh position={[0, h + 0.28, 0]} castShadow>
        <boxGeometry args={[w + 0.24, 0.18, 1.95]} />
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
      <mesh position={[0, 0.08, 1.35]} receiveShadow>
        <boxGeometry args={[1.1, 0.16, 0.7]} />
        <meshStandardMaterial color="#c9c3b4" />
      </mesh>
      <mesh position={[0, h * 0.92, 0.02]} rotation={[0, 0, 0]}>
        <boxGeometry args={[w * 0.7, 0.08, 1.4]} />
        <meshStandardMaterial color="#efe4cf" />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={`lamp-${side}`} position={[side * (w / 2 - 0.2), h * 0.72, 0.92]}>
          <sphereGeometry args={[0.08, 10, 8]} />
          <meshStandardMaterial color="#f2d7a2" emissive="#e2b84a" emissiveIntensity={0.35} />
        </mesh>
      ))}
      <WeekendQuill />
    </group>
  );
}

function WeekendQuill() {
  const days = useGame((s) => s.daysPlayed);
  const speak = useGame((s) => s.speak);
  if (!isWeekend(days)) return null;
  return (
    <group
      position={[0, 0, 1.7]}
      onClick={(e) => {
        e.stopPropagation();
        speak("Quill Bram. The ferry purser. It's the weekend, so the steps are as far as I go. The ledger opens when the week does.");
      }}
    >
      <GnomeRig hat="hat-night" scale={0.9} coat="#2f3d34" beard />
      <Html position={[0, 1.6, 0]} center distanceFactor={16} style={{ pointerEvents: "none" }}>
        <p className="whitespace-nowrap rounded-full bg-ink/80 px-2 py-0.5 text-[11px] font-semibold text-parchment">Quill · weekend</p>
      </Html>
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
  const days = useGame((s) => s.daysPlayed);
  const coins = useGame((s) => s.coins);
  const stage = prosperity(coins, days);
  const havenN = filledCount("haven", days);
  const tideN = filledCount("tideham", days);
  return (
    <group>
      <Html position={to3(capitolHall.x, capitolHall.y, 2.6)} center distanceFactor={22} style={{ pointerEvents: "none" }}>
        <p className="whitespace-nowrap rounded-full bg-ink/80 px-2 py-0.5 font-display text-[11px] font-semibold text-parchment">
          Capitol
        </p>
      </Html>
      {TOWN_SHOPS.map((shop) => {
        const p = to3(shop.x, shop.y, groundY(shop.x, shop.y));
        const faceWest = (
          <group key={shop.id} position={p} rotation={[0, shop.face, 0]}>
            {shop.id === "townhall" ? (
              <Hall3 level={hallLevel} position={[0, 0, 0]} onEnter={() => onEnter(shop.interior, shop.x, shop.y)} />
            ) : shop.id === "bank" ? (
              <Bank3 position={[0, 0, 0]} onEnter={() => onEnter(shop.interior, shop.x, shop.y)} />
            ) : (
              <TimberHouse
                position={[0, 0, 0]}
                roof={shop.roof}
                tall={shop.tall}
                sign={shop.sign}
                onEnter={() => onEnter(shop.interior, shop.x, shop.y)}
              />
            )}
          </group>
        );
        return faceWest;
      })}
      {EMPTY_LOTS.map((lot) => {
        const office = OFFICES.find((o) => o.lot === lot.id);
        if (office && stage >= 1) return null;
        return (
        <group key={lot.id} position={to3(lot.x, lot.y, groundY(lot.x, lot.y))}>
          <mesh position={[0, 0.05, 0]} receiveShadow>
            <boxGeometry args={[1.45, 0.08, 1.15]} />
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
        );
      })}
      {OFFICES.map((office) => {
        if (stage < 1) return null;
        const price = sharePrice(office.stock, days);
        const floors = Math.max(2, Math.min(7, 1 + Math.round(price / 8)));
        return (
          <group key={office.stock} position={to3(office.x, office.y, groundY(office.x, office.y))}>
            <OfficeBlock name={office.name} floors={floors} />
          </group>
        );
      })}
      <group
        position={to3(EXCHANGE.x, EXCHANGE.y, groundY(EXCHANGE.x, EXCHANGE.y))}
        onClick={(e) => {
          e.stopPropagation();
          onEnter("exchange", EXCHANGE.x, EXCHANGE.y);
        }}
      >
        <mesh position={[0, 0.7, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.4, 1.4, 1.6]} />
          <meshStandardMaterial color="#d9d0c0" />
        </mesh>
        <mesh position={[0, 1.5, 0]} castShadow>
          <boxGeometry args={[2.6, 0.16, 1.8]} />
          <meshStandardMaterial color="#8a4b3a" />
        </mesh>
        <mesh position={[0, 0.45, 0.82]}>
          <boxGeometry args={[0.4, 0.7, 0.06]} />
          <meshStandardMaterial color="#5b4230" />
        </mesh>
        <Html position={[0, 2.1, 0]} center distanceFactor={16} style={{ pointerEvents: "none" }}>
          <span className="whitespace-nowrap rounded-full bg-ink/80 px-2 py-0.5 font-display text-[11px] font-semibold text-parchment">
            Gnome Exchange
          </span>
        </Html>
      </group>
      {EXCHANGE_HOUSES.map((home) => (
        <group key={home.name} position={to3(home.x, home.y, groundY(home.x, home.y))}>
          <mesh position={[0, 0.55, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.15, 1.1, 0.95]} />
            <meshStandardMaterial color="#efe6d4" />
          </mesh>
          <mesh position={[0, 1.2, 0]} castShadow>
            <boxGeometry args={[1.3, 0.12, 1.1]} />
            <meshStandardMaterial color="#a35a42" />
          </mesh>
          <mesh position={[0, 1.55, 0]}>
            <boxGeometry args={[0.4, 0.4, 0.4]} />
            <meshStandardMaterial color="#f2d7a2" emissive="#e2b84a" emissiveIntensity={0.2} />
          </mesh>
          <group position={[0.7, 0, 0.4]}>
            <GnomeRig hat={home.hat} scale={0.72} coat="#6a5344" beard />
          </group>
          <Html position={[0, 1.9, 0]} center distanceFactor={16} style={{ pointerEvents: "none" }}>
            <span className="whitespace-nowrap rounded-full bg-ink/80 px-2 py-0.5 text-[10px] font-semibold text-parchment">
              {home.name} · exchange
            </span>
          </Html>
        </group>
      ))}
      <mesh
        position={to3(CAPITOL_LAWN.x + CAPITOL_LAWN.w / 2, CAPITOL_LAWN.y + CAPITOL_LAWN.h / 2, 0.3)}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        raycast={() => undefined}
      >
        <planeGeometry args={[CAPITOL_LAWN.w * 0.05, CAPITOL_LAWN.h * 0.05]} />
        <meshStandardMaterial color="#7ea35a" roughness={0.95} />
      </mesh>
      <mesh position={to3(CAPITOL_FOUNTAIN.x, CAPITOL_FOUNTAIN.y, 0.42)}>
        <cylinderGeometry args={[0.55, 0.7, 0.28, 16]} />
        <meshStandardMaterial color="#8a7a68" />
      </mesh>
      <mesh position={to3(CAPITOL_FOUNTAIN.x, CAPITOL_FOUNTAIN.y, 0.58)}>
        <cylinderGeometry args={[0.38, 0.38, 0.1, 16]} />
        <meshStandardMaterial color="#7eb0b4" roughness={0.25} />
      </mesh>
      {[
        [-0.9, 0],
        [0.9, 0],
        [0, -0.9],
        [0, 0.9],
      ].map(([x, z], i) => (
        <mesh key={i} position={to3(CAPITOL_FOUNTAIN.x + x! * 20, CAPITOL_FOUNTAIN.y + z! * 20, 0.42)} castShadow>
          <boxGeometry args={[0.55, 0.16, 0.22]} />
          <meshStandardMaterial color="#6b4423" />
        </mesh>
      ))}
      <mesh position={to3(CAPITOL_HALL.x - 70, CAPITOL_HALL.y - 20, 1.1)} castShadow>
        <cylinderGeometry args={[0.04, 0.05, 1.6, 6]} />
        <meshStandardMaterial color="#5b4230" />
      </mesh>
      <mesh position={to3(CAPITOL_HALL.x - 58, CAPITOL_HALL.y - 20, 1.7)}>
        <boxGeometry args={[0.46, 0.28, 0.04]} />
        <meshStandardMaterial color="#8d3d3a" />
      </mesh>
      {havenCells.slice(0, havenN).map((cell, i) => (
        <TimberHouse
          key={`haven-${cell.col}-${cell.row}`}
          position={to3(cell.x, cell.y, groundY(cell.x, cell.y))}
          roof={i === 0 ? "gold" : i % 2 ? "stone" : "moss"}
          sign={i === 0 ? "Haven" : "Home"}
          onEnter={() => onEnter("haven-shop", cell.x, cell.y)}
        />
      ))}
      <group position={to3(havenCells[0]!.x + 28, havenCells[0]!.y + 8, groundY(havenCells[0]!.x, havenCells[0]!.y))}>
        <GnomeRig hat="hat-guard" coat="#35543f" pants="#5b4230" scale={0.92} beard={false} />
      </group>
      {tideCells.slice(0, tideN).map((cell) => (
        <group key={`tide-${cell.col}-${cell.row}`} position={to3(cell.x, cell.y, groundY(cell.x, cell.y))}>
          <mesh position={[0, 0.32, 0]} castShadow>
            <boxGeometry args={[0.7, 0.5, 0.6]} />
            <meshStandardMaterial color="#c4a574" />
          </mesh>
          <mesh position={[0, 0.66, 0]} castShadow>
            <boxGeometry args={[0.82, 0.12, 0.72]} />
            <meshStandardMaterial color="#8a4a3a" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export function VillageHouses({ count, onClick }: { count: number; onClick: (x: number, y: number) => void }) {
  return (
    <group>
      {VILLAGE_SLOTS.slice(0, Math.max(0, count)).map((slot) => (
        <TimberHouse
          key={slot.id}
          position={to3(slot.x, slot.y, groundY(slot.x, slot.y))}
          roof={slot.id.endsWith("0") || slot.id.endsWith("2") || slot.id.endsWith("4") ? "cream" : "moss"}
          sign="Home"
          onEnter={() => onClick(slot.x, slot.y)}
        />
      ))}
      <Settlers />
    </group>
  );
}

function Settlers() {
  const settlers = useGame((s) => s.settlers);
  const days = useGame((s) => s.daysPlayed);
  const speak = useGame((s) => s.speak);
  return (
    <group>
      {settlers.map((n) => {
        const slot = VILLAGE_SLOTS.find((v) => v.id === n.slotId);
        if (!slot) return null;
        const rank = settlerRank(n, days);
        const label =
          rank === "plot" ? `${n.name} · plot` : rank === "watch" ? `${n.name} · ${n.shift} watch` : rank === "trade" ? `${n.name} · ${n.stall}` : n.name;
        return (
          <group
            key={n.name}
            position={to3(slot.x + 22, slot.y + 28, groundY(slot.x, slot.y))}
            onClick={(e) => {
              e.stopPropagation();
              speak(folkLine(n, days));
            }}
          >
            {rank === "plot" ? (
              <mesh position={[0, 0.35, 0]} castShadow>
                <boxGeometry args={[0.08, 0.7, 0.08]} />
                <meshStandardMaterial color="#6b4423" />
              </mesh>
            ) : (
              <group position={[-0.7, 0, 0]}>
                <mesh position={[0, 0.35, 0]} castShadow>
                  <boxGeometry args={[0.7, 0.55, 0.6]} />
                  <meshStandardMaterial color="#c4a574" />
                </mesh>
                <mesh position={[0, 0.72, 0]} rotation={[0, 0, 0.2]} castShadow>
                  <coneGeometry args={[0.5, 0.32, 4]} />
                  <meshStandardMaterial color="#8a4a3a" />
                </mesh>
              </group>
            )}
            <GnomeRig hat={n.hat} scale={0.82} beard={false} coat="#6a3d58" />
            <Html position={[0, 1.45, 0]} center distanceFactor={16} style={{ pointerEvents: "none" }}>
              <p className="whitespace-nowrap rounded-full bg-ink/80 px-2 py-0.5 font-display text-[11px] font-semibold text-parchment">
                {label}
              </p>
            </Html>
          </group>
        );
      })}
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
