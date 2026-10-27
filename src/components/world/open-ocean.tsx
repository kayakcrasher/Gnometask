import { useNearby } from "./mobile-graphics";
import { rescuePort } from "@/lib/game/ocean-rescue";
import { boatById } from "@/lib/game/data/boats";
import { shipFit } from "@/lib/game/naval";
import { useMemo, useEffect } from "react";
import { Html, Line } from "@react-three/drei";
import * as THREE from "three";
import { useGame } from "@/lib/game/store";
import { oceanIslandsNear, type OceanIsland } from "@/lib/game/ocean-world";
import { to3, to2, shapePts } from "@/lib/game/world3";
import { SEA_LEVEL } from "@/lib/game/data/water";
import {
  tugPosition,
  alongWaterPath,
  waterPathLength,
} from "@/lib/game/ocean-rescue";
import { HomeAsset } from "./home-asset";
import { DockAsset } from "./player-harbours";
import { BoatMesh, Hull } from "./boats";
import { GnomeRig } from "./gnome-rig";
function IslandGround({
  island,
  onWalk,
}: {
  island: OceanIsland;
  onWalk: (x: number, y: number) => void;
}) {
  const meshes = useMemo(
    () =>
      [island.shore, island.grass].map((poly) => {
        const shape = new THREE.Shape(
          shapePts(poly).map(([x, y]) => new THREE.Vector2(x, y)),
        );
        const g = new THREE.ShapeGeometry(shape);
        g.rotateX(-Math.PI / 2);
        return g;
      }),
    [island],
  );
  useEffect(()=>()=>meshes.forEach(g=>g.dispose()),[meshes]);
  return (
    <group>
      {meshes.map((g, index) => (
        <mesh
          key={index}
          geometry={g}
          position={[0, index ? 0.25 : 0.02, 0]}
          onClick={(e) => {
            e.stopPropagation();
            const p = to2(e.point.x, e.point.z);
            onWalk(p.x, p.y);
          }}
          receiveShadow
        >
          <meshStandardMaterial
            color={index ? "#82a56a" : "#e4d3a3"}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}
function TugAsset() {
  return (
    <group>
      <Hull length={2.4} width={1.2} color="#397f80" lip="#a4c5b5" />
      <mesh position={[0, 0.27, 0.15]}>
        <boxGeometry args={[1.05, 0.14, 1.9]} />
        <meshStandardMaterial color="#cbb181" />
      </mesh>
      <mesh position={[0, 0.65, 0.25]}>
        <boxGeometry args={[0.75, 0.7, 0.85]} />
        <meshStandardMaterial color="#f0e2bb" />
      </mesh>
      <mesh position={[0, 0.77, 0.69]}>
        <boxGeometry args={[0.61, 0.24, 0.03]} />
        <meshStandardMaterial color="#5a8c9d" />
      </mesh>
      <mesh position={[0, 1.03, 0.25]}>
        <boxGeometry args={[0.95, 0.1, 1]} />
        <meshStandardMaterial color="#4f8c79" />
      </mesh>
      <mesh position={[0.3, 1.1, -0.35]}>
        <cylinderGeometry args={[0.12, 0.14, 0.7, 10]} />
        <meshStandardMaterial color="#a78351" />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[side * 0.61, 0.08, 0]}
          rotation={[0, Math.PI / 2, 0]}
        >
          <torusGeometry args={[0.2, 0.065, 8, 16]} />
          <meshStandardMaterial color="#343d39" />
        </mesh>
      ))}
      <group position={[-0.2, 0.35, -0.6]}>
        <GnomeRig hat="hat-moss" scale={0.35} beard />
      </group>
      <mesh position={[0, 0.6, -0.75]}>
        <torusGeometry args={[0.22, 0.07, 8, 16]} />
        <meshStandardMaterial color="#e8be6e" />
      </mesh>
    </group>
  );
}
export function OpenOceanScene({
  onWalk,
}: {
  onWalk: (x: number, y: number) => void;
}) {
  const near = useNearby();
  const s = useGame(),
    islands = oceanIslandsNear(s.gnomeX,s.gnomeY,3500,s.ocean.seed),
    rescue = s.naval.rescue;
  const tug = rescue
    ? rescue.phase === "towing"
      ? alongWaterPath(
          rescue.path,
          Math.min(
            1,
            rescue.elapsed / rescue.duration +
              90 / (waterPathLength(rescue.path) || 1),
          ),
        )
      : tugPosition(rescue)
    : null;
  return (
    <group>
      {islands.filter(i => near(i.x,i.y,Math.max(i.rx,i.ry))).map((i) => (
        <group key={i.id}>
          <IslandGround island={i} onWalk={onWalk} />
          <DockAsset
            dock={{ site: i.id, level: i.town ? 2 : 1, style: "timber" }}
            x={i.landing.x}
            y={i.landing.y}
            water={i.water}
          />
          <mesh
            position={to3(i.x, i.y + (i.landing.y - i.y) / 2, 0.268)}
            rotation={[-Math.PI / 2, 0, 0]}
            onClick={(e) => {
              e.stopPropagation();
              const p = to2(e.point.x, e.point.z);
              onWalk(p.x, p.y);
            }}
          >
            <planeGeometry args={[0.8, (i.landing.y - i.y) * 0.05]} />
            <meshStandardMaterial color="#bca77d" />
          </mesh>
          {Array.from({ length: 9 }, (_, j) => {
            const a = (j * Math.PI * 2) / 9,
              x = i.x + Math.cos(a) * i.rx * 0.66,
              y = i.y + Math.sin(a) * i.ry * 0.63;
            if (Math.abs(x - i.x) < 60 && y > i.y) return null;
            return (
              <group key={`tree-${j}`} position={to3(x, y, 0.28)}>
                <mesh position={[0, 0.7, 0]}>
                  <cylinderGeometry args={[0.12, 0.17, 1.4, 7]} />
                  <meshStandardMaterial color="#94754d" />
                </mesh>
                <mesh position={[0, 1.7, 0]}>
                  <coneGeometry args={[0.95, 2.3, 8]} />
                  <meshStandardMaterial color="#4f8260" />
                </mesh>
              </group>
            );
          })}
          {Math.hypot(i.landing.x - s.gnomeX, i.landing.y - s.gnomeY) < 550 && (
            <Html center position={to3(i.landing.x, i.landing.y, 1.5)}>
              <button
                type="button"
                disabled={!!s.afloat}
                onPointerDown={(e) => e.stopPropagation()}
                onPointerUp={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); onWalk(i.x, i.y + 60); }}
                className="min-h-11 whitespace-nowrap rounded-xl bg-parchment px-3 text-xs font-bold text-pine disabled:opacity-75"
              >
                {i.name} ·{" "}
                {i.town ? "Market up the path ↑" : "Explore the islet ↑"}
              </button>
            </Html>
          )}
          {i.town && (
            <group
              position={to3(i.water.x + 75, i.water.y + 50, SEA_LEVEL + 0.06)}
              rotation={[0, -0.4, 0]}
              scale={1.8}
            >
              <BoatMesh kind="sail" />
            </group>
          )}
          {i.town &&
            Math.hypot(i.x - s.gnomeX, i.y + 60 - s.gnomeY) < 230 &&
            !s.afloat && (
              <Html center position={to3(i.x, i.y + 80, 1.7)}>
                <button
                  type="button"
                  onPointerDown={(e) => e.stopPropagation()}
                  onPointerUp={(e) => e.stopPropagation()}
                  onClick={(e) => { e.stopPropagation(); onWalk(i.landing.x, i.landing.y); }}
                  className="min-h-11 whitespace-nowrap rounded-xl bg-parchment px-3 text-xs font-bold text-pine"
                >
                  Public landing down the path ↓
                </button>
              </Html>
            )}
          {i.town && (
            <>
              <group position={to3(i.x, i.y, 0.28)}>
                <HomeAsset
                  id={i.id + "market"}
                  level={2}
                  style={i.theme}
                  lantern
                />
                <group
                  position={[1.5, 0, 1.8]}
                  onClick={(e) => {
                    e.stopPropagation();
                    s.speak(
                      `${i.name} harbourmaster: We mend boats, stock powder and sell warm bread. The outer sea is open, but mind the roaming pirates.`,
                    );
                  }}
                >
                  <GnomeRig hat="hat-night" beard />
                </group>
              </group>
              {Array.from({ length: i.population }, (_, n) => {
                const a = (n * Math.PI * 2) / i.population,
                  x = i.x + Math.cos(a) * i.rx * 0.4,
                  y = i.y + Math.sin(a) * i.ry * 0.3;
                return (
                  <group key={n} position={to3(x, y, 0.28)}>
                    <HomeAsset
                      id={`${i.id}-home-${n}`}
                      level={1 + (n % 2)}
                      style={i.theme}
                    />
                  </group>
                );
              })}
            </>
          )}
          {!i.town && (
            <group position={to3(i.x, i.y, 0.28)}>
              {[-1, 0, 1].map((n) => (
                <mesh key={n} position={[n * 1.5, 1.2, Math.abs(n)]}>
                  <coneGeometry args={[0.9, 2.4, 7]} />
                  <meshStandardMaterial color="#4e7f63" />
                </mesh>
              ))}
            </group>
          )}
          {Math.hypot(i.x - s.gnomeX, i.y - s.gnomeY) < 1200 && (
            <Html center position={to3(i.x, i.y - 90, 3.8)}>
              <p className="pointer-events-none whitespace-nowrap rounded-full bg-pine/85 px-3 py-1 text-xs font-bold text-parchment">
                {i.name} · {i.town ? "Harbour town" : "Wild islet"}
              </p>
            </Html>
          )}
        </group>
      ))}
      {Object.entries(s.naval.moored).map(([id, portId]) => {
        if (s.afloat === id || s.naval.rescue?.boat === id) return null;
        const port = rescuePort(portId),
          boat = boatById(id);
        return port && boat ? (
          <group
            key={id}
            position={to3(
              port.water.x - 70,
              port.water.y + 35,
              SEA_LEVEL + 0.06,
            )}
            rotation={[0, 0.3, (s.naval.integrity[id] ?? 1) <= 0 ? 0.17 : 0]}
            scale={2.4}
          >
            <BoatMesh kind={boat.id} guns={shipFit(s.naval, id).guns} />
          </group>
        ) : null;
      })}
      {s.naval.wrecks.map((w) => (
        <group
          key={w.id}
          position={to3(
            w.x,
            w.y,
            SEA_LEVEL - (w.seconds < 20 ? ((20 - w.seconds) / 20) * 6 : 0),
          )}
          rotation={[
            0.08,
            0,
            0.12 + (w.seconds < 20 ? ((20 - w.seconds) / 20) * 0.25 : 0),
          ]}
        >
          <group scale={2.4}>
            <BoatMesh kind={w.kind} />
          </group>
          <mesh
            position={[0.4, 0.8, 0.1]}
            onClick={(e) => {
              e.stopPropagation();
              if (s.naval.boarding === w.id) s.lootWreck();
              else s.boardWreck(w.id);
            }}
          >
            <boxGeometry args={[0.75, 0.6, 0.6]} />
            <meshStandardMaterial color={w.looted ? "#796b54" : "#caa05b"} />
          </mesh>
          {s.naval.boarding === w.id && (
            <group position={[-0.5, 0.75, 0.25]}>
              <GnomeRig hat={s.hat} scale={0.8} />
            </group>
          )}
          {Math.hypot(w.x - s.gnomeX, w.y - s.gnomeY) < 800 && (
            <Html center position={[0, 3.5, 0]}>
              <div className="w-40 rounded-xl bg-ink/90 p-2 text-center text-xs text-parchment">
                <strong>Disabled ship · {Math.ceil(w.seconds)}s</strong>
                <button
                  type="button"
                  disabled={
                    w.seconds <= 20 ||
                    !!s.naval.rescue ||
                    !!s.naval.battle ||
                    !s.afloat ||
                    Math.hypot(s.gnomeX - w.x, s.gnomeY - w.y) > 180
                  }
                  onClick={() => s.boardWreck(w.id)}
                  className="mt-1 min-h-11 w-full rounded-lg bg-gold px-2 font-bold text-ink disabled:opacity-40"
                >
                  {w.seconds <= 20
                    ? "Sinking"
                    : w.looted
                      ? "Reboard wreck"
                      : "Climb aboard"}
                </button>
              </div>
            </Html>
          )}
        </group>
      ))}
      {rescue && tug && (
        <>
          <group
            position={to3(tug.x, tug.y, SEA_LEVEL + 0.1)}
            rotation={[0, tug.heading, 0]}
            scale={2.3}
          >
            <TugAsset />
            <Html center position={[0, 2.3, 0]}>
              <p className="whitespace-nowrap rounded-full bg-parchment px-2 py-1 text-xs font-bold text-pine">
                Little Lifeline · Captain Mallow
              </p>
            </Html>
          </group>
          {rescue.phase === "towing" && (
            <Line
              points={[
                to3(s.gnomeX, s.gnomeY, SEA_LEVEL + 0.35),
                to3(tug.x, tug.y, SEA_LEVEL + 0.35),
              ]}
              color="#c7b387"
              lineWidth={2}
            />
          )}
        </>
      )}
    </group>
  );
}
