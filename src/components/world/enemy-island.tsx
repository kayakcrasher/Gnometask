import { Component, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { useGame } from "@/lib/game/store";
import { ISLE_BY_ID, type IsleDef } from "@/lib/game/data/isles";
import { ENEMIES, type EnemyId } from "@/lib/game/combat";
import { BoatMesh, PirateRig } from "./boats";
import { FighterMotion, GnomeRig } from "./gnome-rig";

class SceneBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <div className="absolute inset-0 bg-gradient-to-b from-[#79b7ba] via-[#24576a] to-[#123443]" />
    ) : (
      this.props.children
    );
  }
}

function Palm({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 1.1, 0]} rotation={[0, 0, 0.12]} castShadow>
        <cylinderGeometry args={[0.1, 0.17, 2.2, 7]} />
        <meshStandardMaterial color="#8a623d" />
      </mesh>
      {[0, 1, 2, 3, 4].map((i) => (
        <group
          key={i}
          position={[0.14, 2.1, 0]}
          rotation={[0, (i * Math.PI * 2) / 5, 0]}
        >
          <mesh position={[0.6, 0, 0]} rotation={[0, 0, -0.2]} castShadow>
            <boxGeometry args={[1.5, 0.07, 0.35]} />
            <meshStandardMaterial color={i % 2 ? "#426843" : "#698545"} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Banner({ claimed, pirates }: { claimed: boolean; pirates: boolean }) {
  return (
    <group position={[2.3, 0, -4.8]}>
      <mesh position={[0, 1.9, 0]}>
        <cylinderGeometry args={[0.04, 0.05, 3.8, 8]} />
        <meshStandardMaterial color="#7f5733" />
      </mesh>
      <mesh position={[0.65, 3.15, 0]}>
        <boxGeometry args={[1.25, 0.8, 0.03]} />
        <meshStandardMaterial
          color={claimed ? "#315d40" : pirates ? "#20282b" : "#685137"}
        />
      </mesh>
      <mesh position={[0.65, 3.23, 0.035]} scale={[1, 1, 0.2]}>
        <sphereGeometry args={[0.17, 12, 8]} />
        <meshStandardMaterial color={claimed ? "#d6ac54" : "#f4e9d0"} />
      </mesh>
      {!claimed &&
        [-1, 1].map((side) => (
          <mesh
            key={side}
            position={[0.65, 2.98, 0.04]}
            rotation={[0, 0, side * 0.8]}
          >
            <boxGeometry args={[0.4, 0.045, 0.035]} />
            <meshStandardMaterial color="#f4e9d0" />
          </mesh>
        ))}
    </group>
  );
}

function Enemy({
  id,
  kind,
  name,
  x,
  y,
  boss,
  locked,
}: {
  id: string;
  kind: EnemyId;
  name: string;
  x: number;
  y: number;
  boss?: boolean;
  locked?: boolean;
}) {
  const fight = useGame((s) => s.fightIsleDefender);
  const combat = useGame((s) => s.combat);
  const active = combat?.islandTarget?.targetId === id;
  const pirate = kind === "pirate" || kind === "gunner" || kind === "captain";
  return (
    <group
      position={[x * 0.03, 0, y * 0.03]}
      onClick={(e) => {
        e.stopPropagation();
        fight(id);
      }}
    >
      <FighterMotion
        striking={active && combat.foeSwing}
        recoil={active && typeof combat.splatOnEnemy === "number"}
      >
        {pirate ? (
          <group scale={boss ? 1.25 : 1}>
            <PirateRig />
            {kind === "gunner" && (
              <mesh position={[0.4, 0.6, 0.2]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.07, 0.05, 0.7, 10]} />
                <meshStandardMaterial color="#353b3c" metalness={0.4} />
              </mesh>
            )}
          </group>
        ) : (
          <GnomeRig
            hat={
              boss
                ? "hat-grubtail"
                : kind === "darkelf"
                  ? "hat-night"
                  : "hat-moss"
            }
            scale={boss ? 1.1 : 0.85}
            coat={kind === "darkelf" ? "#333548" : "#597b39"}
            skinColor={kind === "darkelf" ? "#c7bec4" : "#7fa453"}
            ears
            beard={false}
            weapon="weapon-bronze"
          />
        )}
      </FighterMotion>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[0.45, 0.52, 24]} />
        <meshBasicMaterial
          color={
            active
              ? "#d6a84c"
              : locked
                ? "#71634d"
                : boss
                  ? "#ad4940"
                  : "#dcceb0"
          }
          transparent
          opacity={0.7}
        />
      </mesh>
      <Html
        position={[0, boss ? 1.8 : 1.5, 0]}
        center
        zIndexRange={[10, 0]}
        style={{ pointerEvents: "none" }}
      >
        <p className="whitespace-nowrap rounded-full bg-ink/85 px-2 py-1 text-[10px] font-bold text-parchment">
          {name}
          {active
            ? ` · ${combat.enemyHp}/${combat.enemyMax}`
            : locked
              ? " · guarded"
              : ""}
        </p>
      </Html>
    </group>
  );
}

function IslandScene({ isle }: { isle: IsleDef }) {
  const progress = useGame((s) => s.raidProgress[isle.id]);
  const claim = useGame((s) => s.claimRaidChest);
  const hat = useGame((s) => s.hat);
  const defeated = progress?.defeated ?? [];
  const claimed = Boolean(progress?.claimed);
  const remaining = isle.defenders.filter((d) => !defeated.includes(d.id));
  const bossDown = defeated.includes(isle.boss.id);
  const pirates = isle.raidsWith === "pirate";
  return (
    <>
      <color attach="background" args={["#89bfc4"]} />
      <hemisphereLight args={["#f6ecd7", "#496774", 1.4]} />
      <directionalLight position={[8, 13, 7]} intensity={1.7} castShadow />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.46, 0]}>
        <planeGeometry args={[150, 150]} />
        <meshStandardMaterial color="#2e8794" roughness={0.4} />
      </mesh>
      <mesh position={[0, -0.26, 0]} receiveShadow>
        <cylinderGeometry args={[7.4, 8.1, 0.5, 48]} />
        <meshStandardMaterial color="#d9c79b" />
      </mesh>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.01, -0.5]}
        receiveShadow
      >
        <circleGeometry args={[6.6, 40]} />
        <meshStandardMaterial color={pirates ? "#87916b" : "#788568"} />
      </mesh>
      <mesh position={[0, 0.14, 5.9]}>
        <boxGeometry args={[1.6, 0.18, 3.5]} />
        <meshStandardMaterial color="#916c45" />
      </mesh>
      <group position={[-9, -0.38, 0.7]} rotation={[0, 0.25, 0]} scale={3}>
        <BoatMesh kind={pirates ? "sloop" : "goblin"} cannon />
      </group>
      {[-5.5, 5.5].map((x) => (
        <mesh key={x} position={[x, 0.8, -3.5]} castShadow>
          <boxGeometry args={[0.2, 1.6, 5.4]} />
          <meshStandardMaterial color="#6c5945" />
        </mesh>
      ))}
      {[-3.5, 3.5].map((x) => (
        <mesh key={x} position={[x, 0.7, -3]} castShadow>
          <boxGeometry args={[3.8, 1.4, 0.2]} />
          <meshStandardMaterial color="#7f6544" />
        </mesh>
      ))}
      <mesh position={[0, 0.6, -6]} castShadow>
        <boxGeometry args={[3.1, 1.2, 1.25]} />
        <meshStandardMaterial color={pirates ? "#816250" : "#6c6b67"} />
      </mesh>
      <mesh position={[0, 1.35, -6]} castShadow>
        <boxGeometry args={[3.4, 0.3, 1.5]} />
        <meshStandardMaterial color="#493b35" />
      </mesh>
      {[
        [-5, 3.5],
        [5, 3],
        [-4, -4.5],
        [4.9, -5],
      ].map(([x, z], i) => (
        <Palm key={i} x={x!} z={z!} />
      ))}
      {[
        [-3, 2.5],
        [3, 2.8],
        [4, -1],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x!, 0.35, z!]} castShadow>
          <cylinderGeometry args={[0.3, 0.3, 0.7, 10]} />
          <meshStandardMaterial color="#8b6843" />
        </mesh>
      ))}
      <Banner claimed={claimed} pirates={pirates} />
      {remaining.map((d, i) => (
        <Enemy
          key={d.id}
          id={d.id}
          kind={d.kind}
          name={`${ENEMIES[d.kind].name} ${isle.defenders.indexOf(d) + 1}`}
          x={d.x}
          y={d.y}
        />
      ))}
      {!bossDown && (
        <Enemy
          id={isle.boss.id}
          kind={isle.boss.kind}
          name={isle.boss.name}
          x={isle.boss.x}
          y={isle.boss.y}
          boss
          locked={remaining.length > 0}
        />
      )}
      <group
        position={[-2.3, 0.2, -5]}
        onClick={(e) => {
          e.stopPropagation();
          claim();
        }}
      >
        <mesh castShadow>
          <boxGeometry args={[0.9, 0.55, 0.6]} />
          <meshStandardMaterial color="#78502b" />
        </mesh>
        <mesh
          position={[0, 0.35, claimed ? -0.2 : 0]}
          rotation={[claimed ? -0.7 : 0, 0, 0]}
        >
          <boxGeometry args={[0.95, 0.18, 0.65]} />
          <meshStandardMaterial color={bossDown ? "#cca451" : "#826335"} />
        </mesh>
        <mesh position={[0, 0.05, 0.32]}>
          <boxGeometry args={[0.16, 0.25, 0.04]} />
          <meshStandardMaterial color="#d7b663" metalness={0.6} />
        </mesh>
        {bossDown && !claimed && (
          <pointLight color="#f1ce74" intensity={4} distance={4} />
        )}
      </group>
      <group position={[0, 0.2, 4.5]} rotation={[0, Math.PI, 0]}>
        <GnomeRig hat={hat} scale={0.95} coat="#405749" />
      </group>
    </>
  );
}

export function EnemyIsland() {
  const s = useGame();
  const visit = s.raidVisit;
  const isle = visit ? ISLE_BY_ID[visit.isleId] : null;
  if (!isle || s.abroad !== isle.id) return null;
  const progress = s.raidProgress[isle.id] ?? { defeated: [], claimed: false };
  const remaining = isle.defenders.filter(
    (d) => !progress.defeated.includes(d.id),
  );
  const bossDown = progress.defeated.includes(isle.boss.id);
  return (
    <div className="fixed inset-0 z-30 bg-[#215466]">
      <SceneBoundary>
        <Canvas
          camera={{ position: [10, 13, 18], fov: 44 }}
          shadows
          onCreated={({ camera }) => camera.lookAt(0, 0, -0.5)}
        >
          <IslandScene isle={isle} />
        </Canvas>
      </SceneBoundary>
      <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-2 p-3">
        <div className="max-w-[75%] rounded-2xl bg-parchment/95 px-3 py-2 text-ink">
          <p className="text-[10px] font-bold uppercase tracking-wide text-bark/65">
            {isle.faction}
          </p>
          <h1 className="font-display text-xl font-semibold">{isle.name}</h1>
          <p className="mt-1 text-[11px] font-semibold">
            Heart {s.combat?.playerHp ?? s.hp} · Food {s.honey + s.bread} ·
            Coins {s.coins}
          </p>
        </div>
        <button
          type="button"
          disabled={Boolean(s.combat)}
          onClick={s.leaveIsle}
          className="pointer-events-auto min-h-11 rounded-xl bg-parchment px-3 text-xs font-bold text-ink disabled:opacity-40"
        >
          Return to ship
        </button>
      </header>
      {!s.combat && (
        <section
          aria-label="Island raid"
          className="absolute inset-x-3 bottom-3 mx-auto max-h-[47dvh] max-w-xl overflow-y-auto rounded-2xl bg-parchment/95 p-3 shadow-panel text-ink"
        >
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="font-display text-lg font-semibold">
              {progress.claimed
                ? "Island claimed"
                : bossDown
                  ? "The chest is yours"
                  : "Clear the crew"}
            </h2>
            <p className="text-xs font-bold text-bark/65">
              {isle.defenders.length - remaining.length}/{isle.defenders.length}{" "}
              crew defeated
            </p>
          </div>
          <p
            role="status"
            className="mt-1 text-xs leading-relaxed text-bark/80"
          >
            {s.speech}
          </p>
          {!progress.claimed && (
            <>
              {remaining.length > 0 && (
                <div className="mt-2 grid grid-cols-2 gap-1.5">
                  {remaining.map((d) => (
                    <button
                      type="button"
                      key={d.id}
                      onClick={() => s.fightIsleDefender(d.id)}
                      className="min-h-11 rounded-xl bg-parchment-dark px-2 py-2 text-left text-xs font-bold"
                    >
                      Fight {ENEMIES[d.kind].name}{" "}
                      {isle.defenders.indexOf(d) + 1}
                      <span className="block text-[10px] font-semibold text-bark/65">
                        {d.hp} heart · {d.dmg} attack
                      </span>
                    </button>
                  ))}
                </div>
              )}
              {!bossDown && (
                <button
                  type="button"
                  disabled={remaining.length > 0}
                  onClick={() => s.fightIsleDefender(isle.boss.id)}
                  className="mt-2 min-h-11 w-full rounded-xl bg-berry px-3 text-sm font-bold text-parchment disabled:bg-parchment-dark disabled:text-bark/50"
                >
                  {remaining.length > 0
                    ? `${isle.boss.name} · defeat the crew first`
                    : `Challenge ${isle.boss.name} · ${isle.boss.hp} heart`}
                </button>
              )}
              <button
                type="button"
                disabled={!bossDown}
                onClick={s.claimRaidChest}
                className="mt-2 min-h-11 w-full rounded-xl bg-gold px-3 text-sm font-bold disabled:opacity-40"
              >
                {bossDown
                  ? "Open the island chest"
                  : "Chest guarded by the leader"}
              </button>
            </>
          )}
          {progress.claimed && (
            <p className="mt-2 rounded-xl bg-pine/10 p-2 text-xs font-bold text-pine">
              Flag planted. First-clear trophies are in your satchel. Sail home
              to restock, or return later for another raid.
            </p>
          )}
        </section>
      )}
    </div>
  );
}
