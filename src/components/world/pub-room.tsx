import { Canvas } from "@react-three/fiber";
import { BEERS, TOWN_LABEL } from "@/lib/game/data/civic";
import { useGame } from "@/lib/game/store";
import { GnomeRig } from "./gnome-rig";

function Bar() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[10, 7]} />
        <meshStandardMaterial color="#6b4428" />
      </mesh>
      <mesh position={[0, 0.55, -1.4]} castShadow>
        <boxGeometry args={[4.2, 1.05, 0.7]} />
        <meshStandardMaterial color="#5b3a28" />
      </mesh>
      {[-1.2, 0, 1.2].map((x, i) => (
        <mesh key={x} position={[x, 0.95, -1.55]}>
          <cylinderGeometry args={[0.1, 0.08, 0.28, 8]} />
          <meshStandardMaterial color={i === 0 ? "#c4a574" : i === 1 ? "#2a2118" : "#e6d48a"} />
        </mesh>
      ))}
      <mesh position={[0, 1.7, -2.6]}>
        <boxGeometry args={[5.5, 0.12, 2.2]} />
        <meshStandardMaterial color="#efe6d4" />
      </mesh>
      <mesh position={[1.6, 2.15, -2.7]}>
        <boxGeometry args={[0.7, 0.55, 0.08]} />
        <meshStandardMaterial color="#f2d48a" emissive="#e2b84a" emissiveIntensity={0.25} />
      </mesh>
      <hemisphereLight args={["#ffe7c2", "#4a3024", 0.7]} />
      <pointLight position={[0, 2.4, -0.5]} intensity={8} color="#f2d48a" />
    </group>
  );
}

export function PubRoom() {
  const leave = useGame((s) => s.leaveInterior);
  const civic = useGame((s) => s.civic);
  const buy = useGame((s) => s.buyPint);
  const coins = useGame((s) => s.coins);
  const pub = civic.pubs.find((p) => p.town === civic.atPub) ?? civic.pubs[0];
  const party = pub && civic.party?.town === pub.town ? civic.party : null;
  const mates =
    pub && civic.pint?.town === pub.town
      ? civic.gnomes.filter((g) => g.id === civic.pint!.a || g.id === civic.pint!.b)
      : [];
  if (!pub) return null;
  return (
    <div className="fixed inset-0 z-30 bg-[#2a1812]">
      <Canvas camera={{ position: [0, 2.6, 4.4], fov: 42 }}>
        <Bar />
        <group position={[-1.5, 0, 0.3]}>
          <GnomeRig hat={pub.hat} coat={pub.coat} scale={0.85} beard gesture="wave" />
        </group>
        {mates.map((g, i) => (
          <group key={g.id} position={[0.4 + i * 0.7, 0, 0.8]}>
            <GnomeRig hat={g.hat} coat={g.coat} scale={0.75} beard={g.good} gesture="wave" />
          </group>
        ))}
      </Canvas>
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-2 p-3">
        <div className="pointer-events-auto max-w-sm rounded-[16px] bg-parchment/95 px-3 py-2 shadow-panel">
          <p className="font-display text-lg font-semibold text-ink">{pub.name}</p>
          <p className="text-xs font-semibold text-bark/70">
            {pub.owner} lives upstairs and is loved in {TOWN_LABEL[pub.town]}. Bank {pub.bank}, and it pays them interest. Your purse {coins}.
          </p>
          {party ? (
            <p className="mt-1 text-xs font-bold text-ink">{party.host} has the back room tonight.</p>
          ) : null}
          {mates.length === 2 ? (
            <p className="mt-1 text-xs font-semibold text-bark/80">
              {mates[0]!.name} and {mates[1]!.name} are in for a pint. Best mates.
            </p>
          ) : null}
        </div>
        <button type="button" onClick={leave} className="pointer-events-auto rounded-full bg-parchment px-3 py-2 text-xs font-semibold text-ink">
          Leave
        </button>
      </div>
      <div className="absolute inset-x-0 bottom-0 z-10 p-3">
        <div className="mx-auto flex max-w-lg flex-col gap-2 rounded-[20px] bg-parchment p-3 shadow-panel">
          {BEERS.map((beer) => (
            <button
              key={beer.id}
              type="button"
              onClick={() => buy(beer.id)}
              className="flex h-12 items-center justify-between rounded-[14px] bg-parchment-dark px-3 text-left"
            >
              <span>
                <span className="block font-display text-sm font-semibold text-ink">{beer.name}</span>
                <span className="block text-[11px] font-semibold text-bark/70">{beer.blurb}</span>
              </span>
              <span className="font-display text-sm font-semibold text-ink">{beer.price}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
