import { useNearby } from "./mobile-graphics";
import { HomeAsset } from "./home-asset";
import { useEffect, useRef } from "react";
import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { useGame } from "@/lib/game/store";
import {
  CITY_BUILDINGS,
  routePosition,
  routeLength,
  type CityCart,
} from "@/lib/game/city";
import { to3, groundY } from "@/lib/game/world3";
import { DonkeyCart } from "./roads";
import { GnomeRig } from "./gnome-rig";
function DeliveryCart({ cart }: { cart: CityCart }) {
  const ref = useRef<Group>(null),
    crates = useRef<Group>(null),
    moving = useRef(false),
    updated = useRef(performance.now());
  useEffect(() => {
    updated.current = performance.now();
  }, [cart]);
  useFrame(() => {
    if (!ref.current) return;
    const s = useGame.getState(),
      paused = s.atHome || !!s.combat || !!s.abroad || !!s.interior,
      travel =
        cart.returning ||
        cart.cargo > 0 ||
        (cart.autoSupply &&
          s.coins >= 3 &&
          (s.city.buildings.find((b) => b.id === cart.factory)?.supplies ??
            100) < 100);
    const length = routeLength(cart.route),
      distance = Math.min(
        length,
        cart.distance +
          (paused || !travel
            ? 0
            : Math.min(54, ((performance.now() - updated.current) / 1000) * 6)),
      ),
      p = routePosition(
        cart.route,
        cart.returning ? length - distance : distance,
      );
    ref.current.position.set(...to3(p.x, p.y, groundY(p.x, p.y) + 0.08));
    ref.current.rotation.y = p.yaw + (cart.returning ? Math.PI : 0);
    if (crates.current)
      crates.current.visible = cart.cargo > 0 || cart.supplies > 0;
    moving.current = !paused && travel && distance < length;
  });
  return (
    <group
      ref={ref}
      onClick={(e) => {
        e.stopPropagation();
        useGame
          .getState()
          .speak(
            `Your delivery cart: ${cart.cargo} crates and ${cart.supplies} supplies aboard. Earnings arrive when it reaches the trade depot.`,
          );
      }}
    >
      <DonkeyCart crates={crates} moving={moving} />
      <group position={[0, 0.32, -0.72]}>
        <GnomeRig hat="red" scale={1.15} coat="#3d6873" beard />
      </group>
      <Html
        zIndexRange={[20, 0]}
        position={[0, 1.9, 0]}
        center
        distanceFactor={20}
        style={{ pointerEvents: "none" }}
      >
        <span className="whitespace-nowrap rounded-full bg-pine/90 px-2 py-1 text-[10px] font-bold text-parchment">
          Your cart ·{" "}
          {cart.returning
            ? `${cart.supplies} supplies`
            : `${cart.cargo} crates`}
        </span>
      </Html>
    </group>
  );
}
export function PlayerCity() {
  const near=useNearby();
  const city = useGame((s) => s.city),
    open = useGame((s) => s.openPopup);
  return (
    <group>
      {city.buildings
        .filter((b) => b.kind !== "home")
        .filter(b=>near(b.x,b.y,150)).map((b) => {
          const factory = b.kind === "sawmill" || b.kind === "workshop",
            home = b.kind === "housing",
            height = home ? 1.3 + b.level * 0.4 : 1.7 + b.level * 0.25,
            color = home
              ? "#dfcc9c"
              : b.kind === "depot"
                ? "#679398"
                : b.kind === "sawmill"
                  ? "#ac8160"
                  : "#a19a8d";
          if(home)return <group key={b.id} position={to3(b.x,b.y,groundY(b.x,b.y))} onClick={e=>{e.stopPropagation();open({kind:'place',hotspotId:b.id,title:`${city.name} · Workers’ cottages`,blurb:`Level ${b.level}. ${b.residents} residents. Connected cottages earn town revenue. Manage them in Deeds → Your city.`,x:b.x,y:b.y});}}><HomeAsset id={b.id} level={b.level}/></group>;
          return (
            <group
              key={b.id}
              position={to3(b.x, b.y, groundY(b.x, b.y))}
              onClick={(e) => {
                e.stopPropagation();
                open({
                  kind: "place",
                  hotspotId: b.id,
                  title: `${city.name} · ${CITY_BUILDINGS[b.kind].name}`,
                  blurb: `Level ${b.level}. ${factory ? `${b.supplies} supply units stocked; ${b.stock} crates ready.` : home ? `${b.residents} residents.` : "Your donkey carts sell their deliveries here."} Open Deeds → Your city to manage this building.`,
                  x: b.x,
                  y: b.y,
                });
              }}
            >
              <mesh position={[0, height / 2, 0]} castShadow>
                <boxGeometry args={[2.35, height, 2]} />
                <meshStandardMaterial color={color} roughness={0.9} />
              </mesh>
              <mesh
                position={[0, height + 0.13, 0]}
                rotation={[0, Math.PI / 4, 0]}
                castShadow
              >
                <coneGeometry args={[1.85, 0.65, 4]} />
                <meshStandardMaterial
                  color={home ? "#9c5745" : factory ? "#435c60" : "#405777"}
                />
              </mesh>
              <mesh position={[0, 0.55, 1.02]}>
                <boxGeometry args={[factory ? 1 : 0.45, 1.1, 0.06]} />
                <meshStandardMaterial color="#594332" />
              </mesh>
              {[-0.8, 0.8].map((x) => (
                <mesh key={x} position={[x, height * 0.65, 1.03]}>
                  <boxGeometry args={[0.35, 0.35, 0.04]} />
                  <meshStandardMaterial
                    color="#bcd3c8"
                    emissive={factory && b.supplies > 0 ? "#b08e48" : "#000000"}
                    emissiveIntensity={0.3}
                  />
                </mesh>
              ))}
              {factory && (
                <>
                  <mesh position={[0.8, height + 0.7, -0.5]} castShadow>
                    <cylinderGeometry args={[0.18, 0.24, 1.8, 8]} />
                    <meshStandardMaterial color="#6a5350" />
                  </mesh>
                  {b.supplies > 0 &&
                    [0, 1, 2].map((i) => (
                      <mesh
                        key={i}
                        position={[
                          0.8 + i * 0.12,
                          height + 1.7 + i * 0.3,
                          -0.5,
                        ]}
                      >
                        <sphereGeometry args={[0.18 + i * 0.05, 6, 5]} />
                        <meshStandardMaterial
                          color="#d0c9b9"
                          transparent
                          opacity={0.45 - i * 0.1}
                        />
                      </mesh>
                    ))}
                  <mesh
                    position={[-0.85, 0.3, 1.4]}
                    rotation={[0, 0, Math.PI / 2]}
                  >
                    <cylinderGeometry args={[0.18, 0.18, 1.4, 8]} />
                    <meshStandardMaterial color="#8f633c" />
                  </mesh>
                </>
              )}
              {b.kind === "depot" &&
                [0, 1, 2].map((i) => (
                  <mesh
                    key={i}
                    position={[-0.75 + i * 0.7, 0.25, 1.5]}
                    castShadow
                  >
                    <boxGeometry args={[0.55, 0.5, 0.55]} />
                    <meshStandardMaterial
                      color={i % 2 ? "#b69b66" : "#936d45"}
                    />
                  </mesh>
                ))}
              {home && b.residents > 0 && (
                <group position={[1.6, 0, 0.7]}>
                  <GnomeRig hat="red" scale={0.8} coat="#59794b" beard />
                </group>
              )}
              <Html
                zIndexRange={[20, 0]}
                position={[0, height + 1.2, 0]}
                center
                distanceFactor={20}
                style={{ pointerEvents: "none" }}
              >
                <span className="whitespace-nowrap rounded-full bg-pine/90 px-2 py-1 text-[10px] font-bold text-parchment">
                  {CITY_BUILDINGS[b.kind].name} · L{b.level}
                </span>
              </Html>
            </group>
          );
        })}
      {city.carts.map((c) => (
        <DeliveryCart key={c.factory} cart={c} />
      ))}
    </group>
  );
}
