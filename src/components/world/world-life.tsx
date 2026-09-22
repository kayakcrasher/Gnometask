import { Html } from "@react-three/drei";
import { Kenney } from "./kenney";
import { GnomeRig } from "./gnome-rig";
import { TREE_GROW_MS, TREE_SAPLING_MS, TREE_SPOTS } from "@/lib/game/data/trees";
import { NPCS } from "@/lib/game/world";
import { WORLD_PACK, ABSENCE_SPOT, DRAGON_RIDGE } from "@/lib/game/catalog";
import { to3, groundY } from "@/lib/game/world3";
import { useGame } from "@/lib/game/store";
import type { NpcPose } from "@/hooks/use-npc-wander";
import type { EnemyId } from "@/lib/game/combat";
import type { GamePopup } from "@/lib/game/types";

function treeStageOf(choppedAt: number | undefined, now: number) {
  if (!choppedAt) return "grown";
  const age = now - choppedAt;
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
        const stage = treeStageOf(trees[t.id]?.choppedAt, now);
        const p = to3(t.x, t.y, groundY(t.x, t.y));
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

export function Npcs3({
  poses,
  onNpc,
}: {
  poses: Record<string, NpcPose>;
  onNpc: (id: string, x: number, y: number) => void;
}) {
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
            <GnomeRig hat={n.hat} scale={n.id === "pappy" ? 1 : 0.85} coat={coat} beard={n.id === "pappy"} />
            <Html position={[0, n.id === "pappy" ? 1.7 : 1.5, 0]} center distanceFactor={18} style={{ pointerEvents: "none" }}>
              <p className="whitespace-nowrap rounded-full bg-ink/80 px-2 py-0.5 font-display text-[11px] font-semibold text-parchment">
                {n.shortName ?? n.name}
              </p>
            </Html>
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
      <mesh position={[0, 0.1, 0]} castShadow>
        <sphereGeometry args={[0.18, 8, 6]} />
        <meshStandardMaterial color="#a8433b" />
      </mesh>
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
  if (kind === "goblin") {
    return <GnomeRig hat="hat-moss" scale={0.7} coat="#4c7a3a" />;
  }
  if (kind === "darkelf") {
    return <GnomeRig hat="hat-night" scale={0.8} coat="#1d2a22" />;
  }
  return (
    <mesh position={[0, 0.28, 0]} castShadow>
      <icosahedronGeometry args={[0.28, 0]} />
      <meshStandardMaterial color="#5c7a54" />
    </mesh>
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
  const absence = useGame((s) => s.absencePending);
  return (
    <group>
      {WORLD_PACK.map((p) => {
        if (cleared.includes(p.id)) return null;
        const pos = to3(p.x, p.y, groundY(p.x, p.y));
        const fighting = combat?.packId === p.id;
        return (
          <group
            key={p.id}
            position={pos}
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
            <EnemyMesh kind={p.enemy} />
            {fighting && combat ? (
              <Html position={[0, 1.2, 0]} center distanceFactor={16} style={{ pointerEvents: "none" }}>
                <div className="w-16">
                  <div className="h-1.5 overflow-hidden rounded-full bg-ink/50">
                    <div className="h-full bg-berry" style={{ width: `${(combat.enemyHp / combat.enemyMax) * 100}%` }} />
                  </div>
                  {combat.splatOnEnemy != null ? (
                    <p className="text-center font-display text-sm font-bold text-berry">
                      {combat.splatOnEnemy === "miss" ? "miss" : combat.splatOnEnemy}
                    </p>
                  ) : null}
                </div>
              </Html>
            ) : null}
          </group>
        );
      })}
      {dragon.state !== "defeated" ? (
        <group
          position={to3(DRAGON_RIDGE.x, DRAGON_RIDGE.y, 1.1)}
          onClick={(e) => {
            e.stopPropagation();
            onDragon();
          }}
        >
          <EnemyMesh kind="dragon" />
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
