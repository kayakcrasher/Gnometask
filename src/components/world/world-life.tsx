import { Html } from "@react-three/drei";
import { Kenney } from "./kenney";
import { BoatMesh } from "./boats";
import { FighterMotion, GnomeRig } from "./gnome-rig";
import { TREE_GROW_MS, TREE_SAPLING_MS, TREE_SPOTS } from "@/lib/game/data/trees";
import { ROCKS } from "@/lib/game/data/scenery";
import { Ember } from "./ember";
import { NPCS } from "@/lib/game/world";
import { WORLD_PACK, ABSENCE_SPOT, DRAGON_RIDGE, TOWER_SLOTS, CATALOG_BY_ID } from "@/lib/game/catalog";
import { to3, groundY } from "@/lib/game/world3";
import { useGame } from "@/lib/game/store";
import type { NpcPose } from "@/hooks/use-npc-wander";
import type { EnemyId } from "@/lib/game/combat";
import type { GamePopup } from "@/lib/game/types";

function useLabels() {
  const panel = useGame((s) => s.panel);
  const combat = useGame((s) => s.combat);
  const interior = useGame((s) => s.interior);
  return !combat && !interior && panel === "place";
}

function treeStageOf(rec: { stage?: string; choppedAt?: number } | undefined, now: number) {
  if (rec?.stage === "gone") return "gone";
  if (!rec?.choppedAt) return "grown";
  const age = now - rec.choppedAt;
  if (age < TREE_SAPLING_MS) return "stump";
  if (age < TREE_GROW_MS) return "sapling";
  return "grown";
}

export function Trees3({
  onTree,
}: {
  onTree: (id: string, x: number, y: number) => void;
}) {
  const trees = useGame((s) => s.trees);
  const now = Date.now();
  return (
    <group>
      {TREE_SPOTS.map((t) => {
        const stage = treeStageOf(trees[t.id], now);
        const p = to3(t.x, t.y, groundY(t.x, t.y));
        if (stage === "gone") {
          return (
            <mesh
              key={t.id}
              position={p}
              rotation={[-Math.PI / 2, 0, 0]}
              onClick={(e) => {
                e.stopPropagation();
                onTree(t.id, t.x, t.y);
              }}
            >
              <circleGeometry args={[0.28, 10]} />
              <meshStandardMaterial color="#6b5344" />
            </mesh>
          );
        }
        if (stage === "stump") {
          return (
            <Kenney
              key={t.id}
              name="log"
              position={p}
              scale={1.1}
              onClick={(e: { stopPropagation: () => void }) => {
                e.stopPropagation();
                onTree(t.id, t.x, t.y);
              }}
            />
          );
        }
        const sc = stage === "sapling" ? t.scale * 0.45 : t.scale;
        return (
          <Kenney
            key={t.id}
            name={t.model}
            position={p}
            scale={sc}
            onClick={(e: { stopPropagation: () => void }) => {
              e.stopPropagation();
              onTree(t.id, t.x, t.y);
            }}
          />
        );
      })}
    </group>
  );
}

export function EastHills() {
  const hills = [
    { x: 2480, y: 420, r: 2.4, h: 0.7 },
    { x: 2320, y: 560, r: 1.8, h: 0.45 },
    { x: 2200, y: 720, r: 1.4, h: 0.32 },
  ];
  return (
    <group>
      {hills.map((h) => (
        <mesh key={`${h.x}-${h.y}`} position={to3(h.x, h.y, 0.08)} scale={[1, 0.38, 1]} receiveShadow>
          <sphereGeometry args={[h.r, 18, 12]} />
          <meshStandardMaterial color="#5f7d52" roughness={0.95} />
        </mesh>
      ))}
    </group>
  );
}

export function Rocks3() {
  return (
    <group>
      {ROCKS.map((r) => (
        <Kenney key={r.id} name={r.model} position={to3(r.x, r.y, groundY(r.x, r.y))} scale={r.scale} />
      ))}
    </group>
  );
}

export function Npcs3({
  poses,
  onNpc,
}: {
  poses: Record<string, NpcPose>;
  onNpc: (id: string, x: number, y: number) => void;
}) {
  const showLabels = useLabels();
  return (
    <group>
      {NPCS.map((n) => {
        const x = poses[n.id]?.x ?? n.x;
        const y = poses[n.id]?.y ?? n.y;
        const p = to3(x, y, groundY(x, y));
        const coat =
          n.id === "pappy"
            ? "#8a6238"
            : n.id === "stoic"
            ? "#2f3d34"
            : n.id === "nettie"
              ? "#6a3d58"
              : n.id === "bramble"
                ? "#4c6b47"
                : n.id === "brine"
                  ? "#3d5a6a"
                  : n.id === "greg"
                    ? "#2f4a3a"
                    : n.id === "pipkin"
                    ? "#6b5340"
                    : "#8a7a68";
        return (
          <group
            key={n.id}
            position={p}
            onClick={(e) => {
              e.stopPropagation();
              onNpc(n.id, x, y);
            }}
          >
            <GnomeRig hat={n.hat} scale={n.id === "pappy" ? 1.05 : n.id === "greg" ? 0.95 : 0.88} coat={coat} beard />
            {showLabels ? (
            <Html zIndexRange={[8, 0]} position={[0, n.id === "pappy" ? 1.7 : 1.5, 0]} center distanceFactor={18} style={{ pointerEvents: "none" }}>
              <p className="whitespace-nowrap rounded-full bg-ink/80 px-2 py-0.5 font-display text-[11px] font-semibold text-parchment">
                {n.shortName ?? n.name}
              </p>
            </Html>
            ) : null}
          </group>
        );
      })}
    </group>
  );
}

function EnemyMesh({ kind }: { kind: EnemyId }) {
  if (kind === "rat") {
    return (
      <group>
        <mesh position={[0, 0.1, 0]} castShadow>
          <sphereGeometry args={[0.12, 10, 8]} />
          <meshStandardMaterial color="#6b5340" />
        </mesh>
        <mesh position={[0.1, 0.12, 0.04]} castShadow>
          <sphereGeometry args={[0.07, 8, 8]} />
          <meshStandardMaterial color="#5b4230" />
        </mesh>
        <mesh position={[0.08, 0.18, 0.02]}>
          <coneGeometry args={[0.025, 0.08, 5]} />
          <meshStandardMaterial color="#6b5340" />
        </mesh>
        <mesh position={[0.12, 0.18, 0.02]}>
          <coneGeometry args={[0.025, 0.08, 5]} />
          <meshStandardMaterial color="#6b5340" />
        </mesh>
        <mesh position={[-0.12, 0.08, 0]} rotation={[0, 0, 0.8]}>
          <capsuleGeometry args={[0.02, 0.12, 3, 6]} />
          <meshStandardMaterial color="#5b4230" />
        </mesh>
      </group>
    );
  }
  if (kind === "crab") {
    return (
      <group>
        <mesh position={[0, 0.08, 0]} castShadow>
          <sphereGeometry args={[0.12, 8, 6]} />
          <meshStandardMaterial color="#c4553a" />
        </mesh>
        <mesh position={[0.1, 0.07, 0.07]} rotation={[0, 0, -0.7]}>
          <boxGeometry args={[0.14, 0.035, 0.045]} />
          <meshStandardMaterial color="#8a3030" />
        </mesh>
        <mesh position={[0.1, 0.07, -0.07]} rotation={[0, 0, -0.7]}>
          <boxGeometry args={[0.14, 0.035, 0.045]} />
          <meshStandardMaterial color="#8a3030" />
        </mesh>
      </group>
    );
  }
  if (kind === "boar") {
    return (
      <mesh position={[0, 0.28, 0]} castShadow>
        <capsuleGeometry args={[0.22, 0.28, 4, 8]} />
        <meshStandardMaterial color="#5b4230" />
      </mesh>
    );
  }
  if (kind === "dragon" || kind === "absence") {
    return (
      <mesh position={[0, 0.9, 0]} castShadow>
        <sphereGeometry args={[0.7, 12, 10]} />
        <meshStandardMaterial color={kind === "absence" ? "#4e7370" : "#8a3a32"} />
      </mesh>
    );
  }
  if (kind === "goblin" || kind === "runt") {
    return (
      <GnomeRig
        hat="hat-moss"
        scale={kind === "runt" ? 0.62 : 0.78}
        coat="#4f8a32"
        pants="#2a4a22"
        skinColor="#7ea34a"
        beard={false}
        ears
      />
    );
  }
  if (kind === "darkelf") {
    return <GnomeRig hat="hat-night" scale={0.86} coat="#243028" pants="#1c1816" skinColor="#cbb8a4" />;
  }
  return (
    <mesh position={[0, 0.28, 0]} castShadow>
      <icosahedronGeometry args={[0.28, 0]} />
      <meshStandardMaterial color="#5c7a54" />
    </mesh>
  );
}

function FightSplat({ value, shake }: { value: number | "miss" | "heal"; shake: number }) {
  const miss = value === "miss";
  const label = miss ? "0" : value === "heal" ? "+" : String(value);
  return (
    <Html key={shake} zIndexRange={[8, 0]} position={[0, 1.35, 0]} center distanceFactor={14} style={{ pointerEvents: "none" }}>
      <p className={`splat-rise font-display text-lg font-bold ${miss ? "text-sky-200" : "text-berry"}`}>{label}</p>
    </Html>
  );
}

function HpPlate({ hp, max, y }: { hp: number; max: number; y: number }) {
  const pct = Math.max(0, Math.min(100, (hp / Math.max(1, max)) * 100));
  return (
    <Html zIndexRange={[8, 0]} position={[0, y, 0]} center distanceFactor={11} style={{ pointerEvents: "none" }}>
      <div className="w-[4.5rem] rounded-full bg-parchment/95 px-1.5 py-0.5 shadow-panel">
        <div className="h-2 overflow-hidden rounded-full bg-ink/25">
          <div className="h-full bg-berry" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-center font-display text-[10px] font-bold tabular-nums leading-tight text-ink">
          {hp}/{max}
        </p>
      </div>
    </Html>
  );
}

export function Fights3({
  onEnemy,
  onDragon,
}: {
  onEnemy: (popup: GamePopup, x: number, y: number) => void;
  onDragon: () => void;
}) {
  const cleared = useGame((s) => s.clearedPack);
  const combat = useGame((s) => s.combat);
  const dragon = useGame((s) => s.lifeDragon);
  const hall = useGame((s) => s.townHallLevel);
  const absence = useGame((s) => s.absencePending);
  const gx = useGame((s) => s.gnomeX);
  const gy = useGame((s) => s.gnomeY);
  return (
    <group>
      {WORLD_PACK.map((p) => {
        if (cleared.includes(p.id)) return null;
        const pos = to3(p.x, p.y, groundY(p.x, p.y));
        const fighting = combat?.packId === p.id;
        const face = Math.atan2(gx - p.x, gy - p.y);
        const recoil = fighting && typeof combat?.splatOnEnemy === "number" && !combat.foeSwing;
        return (
          <group
            key={p.id}
            position={pos}
            rotation={[0, face, 0]}
            onClick={(e) => {
              e.stopPropagation();
              onEnemy(
                {
                  kind: "enemy",
                  hotspotId: p.id,
                  title: p.enemy,
                  blurb: "It notices you.",
                  place: p.place,
                  enemyId: p.enemy,
                  packId: p.id,
                  x: p.x,
                  y: p.y,
                },
                p.x,
                p.y,
              );
            }}
          >
            <FighterMotion striking={fighting && Boolean(combat?.foeSwing)} recoil={recoil}>
              <EnemyMesh kind={p.enemy} />
            </FighterMotion>
            {fighting && combat ? (
              <>
                <HpPlate hp={combat.enemyHp} max={combat.enemyMax} y={1.35} />
                {combat.splatOnEnemy != null ? <FightSplat value={combat.splatOnEnemy} shake={combat.shake} /> : null}
              </>
            ) : null}
          </group>
        );
      })}
      {hall >= 3 && dragon.state !== "defeated" ? (
        <group
          position={to3(
            dragon.state === "raiding" ? 980 : DRAGON_RIDGE.x,
            dragon.state === "raiding" ? 420 : DRAGON_RIDGE.y,
            dragon.state === "raiding" ? 2.4 : 0.15,
          )}
          onClick={(e) => {
            e.stopPropagation();
            onDragon();
          }}
        >
          <Ember
            look={dragon.look}
            horn={dragon.horn}
            friend={dragon.state === "soothed"}
            flying={dragon.state === "raiding"}
          />
        </group>
      ) : null}
      {absence ? (
        <group position={to3(ABSENCE_SPOT.x, ABSENCE_SPOT.y, 0.2)}>
          <EnemyMesh kind="absence" />
        </group>
      ) : null}
    </group>
  );
}

function ArcherTowerMesh({ rank }: { rank: number }) {
  const h = 0.9 + rank * 0.45;
  const wood = rank >= 4 ? "#6b5340" : "#8a7a68";
  const roof = rank >= 3 ? "#35543f" : "#c4a574";
  return (
    <group>
      <mesh position={[0, h / 2, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.28, h, 6]} />
        <meshStandardMaterial color={wood} roughness={0.9} />
      </mesh>
      <mesh position={[0, h + 0.08, 0]} castShadow>
        <cylinderGeometry args={[0.42, 0.42, 0.1, 6]} />
        <meshStandardMaterial color="#c4a574" roughness={0.8} />
      </mesh>
      {rank >= 2 ? (
        <mesh position={[0.28, h + 0.35, 0]} castShadow>
          <boxGeometry args={[0.06, 0.55, 0.06]} />
          <meshStandardMaterial color="#5b4230" />
        </mesh>
      ) : null}
      {rank >= 3 ? (
        <mesh position={[0, h + 0.42, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
          <coneGeometry args={[0.48, 0.55, 4]} />
          <meshStandardMaterial color={roof} roughness={0.7} />
        </mesh>
      ) : null}
      {rank >= 4 ? (
        <mesh position={[0, h + 0.85, 0]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color="#d6a84c" />
        </mesh>
      ) : (
        <mesh position={[0, 0.2, 0.22]}>
          <boxGeometry args={[0.5, 0.08, 0.08]} />
          <meshStandardMaterial color="#5b4230" />
        </mesh>
      )}
    </group>
  );
}

export function Towers3({
  onTower,
}: {
  onTower: (slotId: string, x: number, y: number, title: string, blurb: string) => void;
}) {
  const placed = useGame((s) => s.placed);
  const placingId = useGame((s) => s.placingId);
  const placeAt = useGame((s) => s.placeAt);
  const placingTower = placingId ? CATALOG_BY_ID[placingId]?.slotPrefix === "t" : false;
  const showLabels = useLabels();
  return (
    <group>
      {TOWER_SLOTS.map((slot) => {
        const built = placed.find((p) => p.slotId === slot.id);
        const p = to3(slot.x, slot.y, groundY(slot.x, slot.y));
        const item = built ? CATALOG_BY_ID[built.catalogId] : null;
        const rank = item?.towerRank ?? 1;
        return (
          <group
            key={slot.id}
            position={p}
            onClick={(e) => {
              e.stopPropagation();
              if (!built && placingTower) {
                placeAt(slot.id);
                return;
              }
              if (built && item) onTower(slot.id, slot.x, slot.y, item.name, item.blurb);
            }}
          >
            {built ? (
              <ArcherTowerMesh rank={rank} />
            ) : placingTower ? (
              <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[0.55, 12]} />
                <meshBasicMaterial color="#d6a84c" transparent opacity={0.55} />
              </mesh>
            ) : null}
            {built && showLabels ? (
              <Html zIndexRange={[8, 0]} position={[0, 1.6 + rank * 0.35, 0]} center distanceFactor={18} style={{ pointerEvents: "none" }}>
                <p className="whitespace-nowrap rounded-full bg-ink/80 px-2 py-0.5 font-display text-[10px] font-semibold text-parchment">
                  {item?.name}
                </p>
              </Html>
            ) : null}
          </group>
        );
      })}
    </group>
  );
}

export function Landing3({
  onGoblin,
  onFlag,
}: {
  onGoblin: (id: string, x: number, y: number) => void;
  onFlag: () => void;
}) {
  const landing = useGame((s) => s.landing);
  const combat = useGame((s) => s.combat);
  const showLabels = useLabels();
  const gx = useGame((s) => s.gnomeX);
  const gy = useGame((s) => s.gnomeY);
  if (!landing) return null;
  const boat = to3(landing.boatX, landing.boatY, -0.05);
  return (
    <group>
      <group position={boat} rotation={[0, -0.6, 0]}>
        <BoatMesh kind="goblin" />
        {landing.flagDown ? (
          <mesh position={[0.25, 0.08, 0.05]} rotation={[0, 0, Math.PI / 2.4]} castShadow>
            <boxGeometry args={[0.04, 0.7, 0.04]} />
            <meshStandardMaterial color="#5b4230" />
          </mesh>
        ) : (
          <group
            onClick={(e) => {
              e.stopPropagation();
              onFlag();
            }}
          >
            <mesh position={[0, 0.85, 0]}>
              <boxGeometry args={[0.04, 0.9, 0.04]} />
              <meshStandardMaterial color="#5b4230" />
            </mesh>
            <mesh position={[0.02, 1.15, 0.02]} rotation={[0, 0.2, 0.15]}>
              <boxGeometry args={[0.02, 0.5, 0.38]} />
              <meshStandardMaterial color="#4c7a3a" />
            </mesh>
            <HpPlate hp={landing.flagHp ?? 10} max={10} y={1.85} />
            {showLabels ? (
              <Html zIndexRange={[8, 0]} position={[0, 2.35, 0]} center distanceFactor={16} style={{ pointerEvents: "none" }}>
                <p className="whitespace-nowrap rounded-full bg-moss px-2 py-0.5 font-display text-[10px] font-semibold text-parchment">
                  {landing.tribe}
                </p>
              </Html>
            ) : null}
          </group>
        )}
      </group>
      {landing.goblins.map((g) => {
        if (!g.alive) return null;
        const fighting = combat?.packId === g.id;
        const pos = to3(g.x, g.y, groundY(g.x, g.y));
        const face = Math.atan2(gx - g.x, gy - g.y);
        const recoil = fighting && typeof combat?.splatOnEnemy === "number" && !combat.foeSwing;
        return (
          <group
            key={g.id}
            position={pos}
            rotation={[0, face, 0]}
            onClick={(e) => {
              e.stopPropagation();
              onGoblin(g.id, g.x, g.y);
            }}
          >
            <FighterMotion striking={fighting && Boolean(combat?.foeSwing)} recoil={recoil}>
              <EnemyMesh kind="runt" />
            </FighterMotion>
            <HpPlate
              hp={fighting && combat ? combat.enemyHp : 3}
              max={fighting && combat ? combat.enemyMax : 3}
              y={1.25}
            />
            {fighting && combat && combat.splatOnEnemy != null ? (
              <FightSplat value={combat.splatOnEnemy} shake={combat.shake} />
            ) : showLabels ? (
              <Html zIndexRange={[8, 0]} position={[0, 1.05, 0]} center distanceFactor={18} style={{ pointerEvents: "none" }}>
                <p className="rounded-full bg-moss/90 px-1.5 py-0.5 font-display text-[9px] font-semibold text-parchment">
                  runt
                </p>
              </Html>
            ) : null}
          </group>
        );
      })}
    </group>
  );
}

export function LootFlash3() {
  const flash = useGame((s) => s.lootFlash);
  if (!flash || (flash.bones < 1 && flash.coins < 1)) return null;
  const p = to3(flash.x, flash.y, groundY(flash.x, flash.y));
  return (
    <group position={p}>
      <mesh position={[0.16, 0.08, 0]} castShadow>
        <sphereGeometry args={[0.09, 10, 10]} />
        <meshStandardMaterial color="#d6a84c" metalness={0.35} roughness={0.4} />
      </mesh>
      <mesh position={[-0.12, 0.05, 0.04]} rotation={[0.5, 0.2, 0.8]}>
        <boxGeometry args={[0.18, 0.045, 0.045]} />
        <meshStandardMaterial color="#f2e8d5" />
      </mesh>
      <mesh position={[-0.05, 0.07, -0.04]} rotation={[0.2, 0.4, -0.5]}>
        <boxGeometry args={[0.14, 0.04, 0.04]} />
        <meshStandardMaterial color="#e7d7c3" />
      </mesh>
      <Html zIndexRange={[8, 0]} position={[0, 0.55, 0]} center distanceFactor={12} style={{ pointerEvents: "none" }}>
        <p className="whitespace-nowrap rounded-full bg-parchment px-2 py-0.5 font-display text-[11px] font-bold text-ink shadow-panel">
          bones {flash.bones} · {flash.coins} coins
        </p>
      </Html>
    </group>
  );
}
