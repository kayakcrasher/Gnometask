import {TownNoticeboard3} from "./town-noticeboard";
import { FluidSeaGroup } from "./sailing-player";
import { useNearby } from "./mobile-graphics";
import {fleetSeeds} from "@/lib/game/naval";
import { navigableWater } from "@/lib/game/sailing";
import { thimbleRemark, THIMBLE_HOME } from "@/lib/game/thimblehaven";
import { GnomeRig } from "./gnome-rig";
import { shipFit } from "@/lib/game/naval";
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
    <group position={to3(x, y, SEA_LEVEL+.26)} rotation={[0, angle, 0]}>
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
export function PlayerHarbours({
  walkTo,
}: {
  walkTo?: (x: number, y: number, arrive?: () => void) => void;
}) {
  const near = useNearby();
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
      <TownNoticeboard3/>
      {s.thimble.residents.map((r, i) => {
        const spots = [
            [2100, -3230],
            [2370, -3150],
            [2390, -3350],
            [2190, -3520],
            [2420, -3550],
            [2050, -2850],
            [2300, -2850],
            [2500, -2900],
          ],
          p = spots[i]!;
        return (
          <group
            key={r.id}
            position={to3(p[0]!, p[1]!, groundY(p[0]!, p[1]!))}
            onClick={(e) => {
              e.stopPropagation();
              s.speak(`${r.name}: ${thimbleRemark(s)}`);
            }}
          >
            <HomeAsset
              id={r.id}
              level={s.thimble.projects.includes("hall") ? 2 : 1}
              style="harbour"
              lantern={s.thimble.projects.includes("well")}
            />
            <group position={[1.2, 0, 1.3]}>
              <GnomeRig hat="hat-moss" beard />
            </group>
          </group>
        );
      })}
      {s.thimble.projects.includes("well") && (
        <group position={to3(2150, -3010, groundY(2150, -3010))}>
          <Beam at={[0, 0.3, 0]} size={[1, 0.6, 1]} color="#b4b7a1" />
          <Beam at={[0, 1.4, 0]} size={[1.6, 0.15, 1.5]} color="#608b80" />
        </group>
      )}
      {s.thimble.projects.includes("market") && (
        <group position={to3(2280, -2950, groundY(2280, -2950))}>
          <Beam at={[0, 0.5, 0]} size={[2, 1, 1.1]} color="#a88657" />
          <Beam at={[0, 1.7, 0]} size={[2.5, 0.15, 1.8]} color="#aeb88a" />
        </group>
      )}
      {s.thimble.projects.includes("depot") && (
        <group position={to3(2410, -3000, groundY(2410, -3000))}>
          <HomeAsset id="thimble-depot" level={1} style="meadow" />
        </group>
      )}
      {s.thimble.projects.includes("hall") && (
        <group position={to3(2520, -3190, groundY(2520, -3190))}>
          <HomeAsset id="thimble-town-hall" level={3} style="stone" lantern />
        </group>
      )}
      {s.naval.vessels
        .filter((v) => v.hp > 0 && near(v.x,v.y,200))
        .map((v) => (
          <FluidSeaGroup
            key={v.id} x={v.x} y={v.y}
            scale={2.4}
            onClick={(e) => {
              e.stopPropagation();
              if (v.side === "enemy") {
                if (!s.afloat) {
                  s.speak(
                    "Board a cannon-equipped boat before challenging a ship.",
                  );
                  return;
                }
                const distance = Math.hypot(s.gnomeX - v.x, s.gnomeY - v.y);
                if (distance <= 350) s.engageShip(v.id);
                else {
                  const target = {
                    x: v.x + ((s.gnomeX - v.x) / distance) * 240,
                    y: v.y + ((s.gnomeY - v.y) / distance) * 240,
                  };
                  if (navigableWater(target.x, target.y))
                    walkTo?.(target.x, target.y, () =>
                      useGame.getState().engageShip(v.id),
                    );
                }
              } else
                s.speak(
                  `${v.name}: Fair winds, Thimblehaven. Your colours are safe with us.`,
                );
            }}
          >
            <BoatMesh kind={v.kind} guns={v.guns} faction={v.side} />{Math.hypot(v.x-s.gnomeX,v.y-s.gnomeY)<850&&<Html center position={[0,3.4,0]}><div className="pointer-events-none w-32 rounded-lg bg-ink/85 p-1 text-center text-[10px] text-parchment"><p>{v.name}</p><progress aria-label={`${v.name} health`} max={fleetSeeds().find(e=>e.id===v.id)?.hp??v.hp} value={v.hp} className="h-2 w-full accent-[#c78f63]"/><span>{v.hp} hull</span></div></Html>}
          </FluidSeaGroup>
        ))}
      {s.naval.battle &&
        (() => {
          const target = s.naval.vessels.find((v) => v.id === s.naval.battle);
          if (!target) return null;
          return [false, true].map((incoming) => {
            const cooldown = incoming
              ? s.naval.enemyCooldown
              : s.naval.cooldown;
            if (cooldown < 5.2 || cooldown >= 6) return null;
            const t = (6 - cooldown) / 0.8,
              a = incoming ? target : { x: s.gnomeX, y: s.gnomeY },
              b = incoming ? { x: s.gnomeX, y: s.gnomeY } : target;
            return (
              <group
                key={String(incoming)}
                position={to3(
                  a.x + (b.x - a.x) * t,
                  a.y + (b.y - a.y) * t,
                  SEA_LEVEL + 0.6 + Math.sin(t * Math.PI) * 1.3,
                )}
              >
                <mesh>
                  <sphereGeometry args={[0.11, 8, 6]} />
                  <meshStandardMaterial color="#322f2a" />
                </mesh>
                <mesh position={[-0.12, 0.05, 0]}>
                  <sphereGeometry args={[0.13, 8, 6]} />
                  <meshStandardMaterial
                    color="#b3b0a2"
                    transparent
                    opacity={0.4}
                  />
                </mesh>
              </group>
            );
          });
        })()}
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
          <FluidSeaGroup
            key={t.boat} x={p.x} y={p.y} heading={p.heading}
            scale={2.4}
          >
            <BoatMesh
              kind={boat.id}
              parts={s.ports.parts[t.boat]}
              guns={shipFit(s.naval, boat.id).guns}
            />
          </FluidSeaGroup>
        ) : null;
      })}
    </group>
  );
}
