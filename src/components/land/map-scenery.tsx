import { mixLandColor, regionValue } from "@/lib/game/metrics";
import { useGame } from "@/lib/game/store";
import { HAVEN_ORIGIN, TOWN_SQUARE } from "@/lib/game/world";
import { VB } from "@/hooks/use-pan-zoom";
import { MUSH_SPOTS, REGIONS, TREE_SPOTS, WILD_FLORA } from "./map-data";
import { FloraImg, HavenHut, MushroomCluster, PalisadeRing, Scorch, TownFountain, Tree } from "./props";
import { Bones, Campfire, Cave, Crystal, MineMouth, Pier, Raft, Rock, Ruin } from "./creatures";

export function MapSky() {
  return (
    <>
      <rect width={VB.w} height={VB.h} fill="url(#sky)" />
      <g pointerEvents="none">
        <ellipse cx="200" cy="80" rx="90" ry="28" fill="#f2e8d5" opacity="0.55" />
        <ellipse cx="1280" cy="140" rx="120" ry="32" fill="#f2e8d5" opacity="0.4" />
        <ellipse cx="900" cy="60" rx="70" ry="22" fill="#f2e8d5" opacity="0.35" />
        <ellipse cx="2400" cy="60" rx="100" ry="26" fill="#f2e8d5" opacity="0.35" />
      </g>
    </>
  );
}

export function MapScenery({
  villageCount,
  watered,
  hLevel,
  cottageHurt,
  villageHurt,
  havenHurt,
}: {
  villageCount: number;
  watered: boolean;
  hLevel: number;
  cottageHurt: number;
  villageHurt: number;
  havenHurt: number;
}) {
  const save = useGame();
  return (
    <>
      <ellipse cx="1380" cy="740" rx="1280" ry="680" fill="#4e7370" />
      <path
        d="M60 240 C 240 20 760 0 1180 70 C 1600 20 2140 50 2560 180 C 2760 300 2800 560 2720 900 C 2620 1220 2140 1420 1600 1460 C 1060 1500 520 1400 180 1220 C 20 1100 -10 820 20 520 C 30 360 0 290 60 240 Z"
        fill="url(#islandRim)"
        filter="url(#soft)"
      />
      <path
        d="M90 270 C 260 50 760 40 1160 100 C 1580 50 2100 80 2520 210 C 2700 320 2740 560 2660 880 C 2560 1180 2100 1380 1580 1420 C 1060 1460 540 1360 210 1180 C 50 1060 20 800 50 520 C 60 370 40 310 90 270 Z"
        fill="#8cb067"
      />
      {REGIONS.map((r) => {
        const t = regionValue(save, r.id, save.metric);
        const hovered = save.hoverPlace === r.id;
        return (
          <path
            key={r.id}
            d={r.d}
            fill={mixLandColor(t)}
            fillOpacity={hovered ? 0.58 : 0.4}
            stroke={hovered ? "#f2e8d5" : "#5b4230"}
            strokeWidth={hovered ? 3 : 1.4}
            strokeOpacity={hovered ? 0.8 : 0.22}
            className="cursor-pointer"
            onPointerEnter={() => save.setHover(r.id)}
            onPointerLeave={() => save.setHover(null)}
          />
        );
      })}
      <g pointerEvents="none">
        <path
          d="M430 500 C 520 510 620 500 720 490 C 860 480 980 500 1120 560"
          fill="none"
          stroke="#c4a574"
          strokeWidth="22"
          strokeLinecap="round"
          opacity={villageCount > 0 ? 0.95 : 0.55}
        />
        <path d="M400 500 C 380 560 360 620 340 700" fill="none" stroke="#c4a574" strokeWidth="16" strokeLinecap="round" opacity="0.8" />
        <path d="M180 480 C 260 500 340 500 400 490" fill="none" stroke="#c4a574" strokeWidth="12" strokeLinecap="round" opacity="0.7" />
        {hLevel >= 1 ? (
          <path d="M1180 620 C 1240 680 1280 760 1340 820" fill="none" stroke="#b08960" strokeWidth="14" strokeLinecap="round" />
        ) : null}
        <path d="M1280 520 C 1480 480 1620 400 1760 360" fill="none" stroke="#7a6550" strokeWidth="16" strokeLinecap="round" opacity="0.7" />
        <path d="M1180 860 C 1280 980 1360 1100 1420 1220" fill="none" stroke="#7a6550" strokeWidth="14" strokeLinecap="round" opacity="0.65" />
        <path d="M2100 280 C 2180 240 2260 220 2360 240" fill="none" stroke="#8a7a68" strokeWidth="12" strokeLinecap="round" opacity="0.7" />

        <ellipse cx="530" cy="170" rx="150" ry="70" fill="#4e7370" className="water-ripple" />
        <ellipse cx="530" cy="170" rx="128" ry="56" fill="#6a8f8a" />
        <ellipse cx="500" cy="155" rx="30" ry="10" fill="#cfe4c8" opacity="0.35" />
        <ellipse cx="580" cy="180" rx="18" ry="7" fill="#5c7a54" />
        <ellipse cx="470" cy="190" rx="14" ry="6" fill="#5c7a54" />
        <circle cx="580" cy="176" r="4" fill="#a8433b" />
        <circle cx="470" cy="186" r="3.5" fill="#d6a84c" />

        <Pier x={40} y={470} />
        <Raft x={18} y={508} />

        {TREE_SPOTS.map(([x, y, s], i) => (
          <Tree key={i} x={x} y={y} scale={s} dark={i % 2 === 0} />
        ))}

        {MUSH_SPOTS.map(([x, y], i) => (
          <MushroomCluster key={`mush-${i}`} x={x} y={y} scale={0.85 + (i % 3) * 0.12} />
        ))}
        {WILD_FLORA.map((f, i) => (
          <FloraImg key={`flora-${i}`} src={f.src} x={f.x} y={f.y} w={f.w} h={f.h} />
        ))}
        <ellipse cx={TOWN_SQUARE.x} cy={TOWN_SQUARE.y} rx="92" ry="46" fill="#c4a574" opacity="0.42" />
        <TownFountain x={TOWN_SQUARE.x} y={TOWN_SQUARE.y} />

        <PalisadeRing x={920} y={520} level={save.fortLevel} />
        <Scorch x={374} y={430} amount={cottageHurt} />
        <Scorch x={920} y={500} amount={villageHurt} />

        <g>
          <ellipse cx="390" cy="680" rx="270" ry="48" fill={watered ? "#5b4230" : "#6b5340"} opacity="0.38" />
          <ellipse cx="400" cy="752" rx="280" ry="46" fill={watered ? "#5b4230" : "#6b5340"} opacity="0.34" />
          <ellipse cx="390" cy="824" rx="270" ry="46" fill={watered ? "#5b4230" : "#6b5340"} opacity="0.3" />
          <ellipse cx="380" cy="892" rx="250" ry="42" fill={watered ? "#5b4230" : "#6b5340"} opacity="0.28" />
        </g>

        {villageCount >= 1 ? (
          <text x="1240" y="360" textAnchor="middle" fill="#2a241c" fontFamily="Baloo 2, sans-serif" fontSize={22 + Math.min(villageCount, 8)} fontWeight="700">
            The Village
          </text>
        ) : (
          <text x="1240" y="370" textAnchor="middle" fill="#5b4230" fontFamily="Nunito, sans-serif" fontSize="16" fontWeight="700" opacity="0.7">
            A village could grow here
          </text>
        )}

        <Cave x={1860} y={300} />
        <Ruin x={1520} y={420} />
        <Campfire x={1620} y={560} />
        <Bones x={1700} y={640} />
        <Rock x={1500} y={300} scale={1.2} />
        <Rock x={1980} y={560} scale={0.9} />
        <Rock x={1840} y={720} scale={1.1} />
        <Rock x={1600} y={780} scale={0.75} />
        <MineMouth x={1380} y={1180} />
        <Crystal x={1180} y={1220} />
        <Crystal x={1560} y={1340} />
        <Crystal x={1320} y={1320} />
        <Rock x={1100} y={1140} scale={1.1} />
        <Rock x={1680} y={1200} scale={0.9} />
        <Ruin x={2320} y={220} />
        <Ruin x={2480} y={280} />
        <Rock x={2200} y={160} scale={1} />
        <Rock x={2600} y={360} scale={1.15} />

        {hLevel >= 1 ? (
          <g>
            <ellipse cx={HAVEN_ORIGIN.x} cy={HAVEN_ORIGIN.y} rx={70 + hLevel * 18} ry={40 + hLevel * 8} fill="#c4a574" opacity="0.28" />
            <HavenHut x={HAVEN_ORIGIN.x - 20} y={HAVEN_ORIGIN.y - 20} />
            {hLevel >= 2 ? <HavenHut x={HAVEN_ORIGIN.x + 50} y={HAVEN_ORIGIN.y + 10} scale={0.85} /> : null}
            {hLevel >= 3 ? <HavenHut x={HAVEN_ORIGIN.x - 70} y={HAVEN_ORIGIN.y + 24} scale={0.9} /> : null}
            <Scorch x={HAVEN_ORIGIN.x} y={HAVEN_ORIGIN.y} amount={havenHurt} />
            <text x={HAVEN_ORIGIN.x} y={HAVEN_ORIGIN.y - 48} textAnchor="middle" fill="#2a241c" fontFamily="Baloo 2, sans-serif" fontSize="18" fontWeight="700">
              Haven
            </text>
          </g>
        ) : null}

        <text x="1760" y="220" textAnchor="middle" fill="#2a241c" fontFamily="Baloo 2, sans-serif" fontSize="20" fontWeight="700">
          The Wildlands
        </text>
        <text x="1360" y="1080" textAnchor="middle" fill="#2a241c" fontFamily="Baloo 2, sans-serif" fontSize="20" fontWeight="700">
          The Mines
        </text>
        <text x="2400" y="80" textAnchor="middle" fill="#2a241c" fontFamily="Baloo 2, sans-serif" fontSize="20" fontWeight="700">
          The Ruins
        </text>
        <text x="120" y="390" textAnchor="middle" fill="#2a241c" fontFamily="Baloo 2, sans-serif" fontSize="18" fontWeight="700">
          The Dock
        </text>
        <Tree x={1560} y={260} scale={1.15} dark />
        <Tree x={1980} y={240} scale={1.05} dark />
        <Tree x={1640} y={620} scale={0.9} dark />
        <Tree x={1920} y={680} scale={1} dark />
      </g>
    </>
  );
}
