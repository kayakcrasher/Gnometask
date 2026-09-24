import { useState } from "react";
import { BEACH_POLY, DESERT_POLY, ISLAND_POLY, MOUNT_NOBLE } from "@/lib/game/world3";
import { VILLAGES } from "@/lib/game/data/country";
import { PARCELS } from "@/lib/game/data/parcels";
import { TREE_SPOTS } from "@/lib/game/data/trees";
import { useGame } from "@/lib/game/store";

const VW = 3700;
const VH = 1600;

function poly(pts: [number, number][]) {
  return pts.map(([x, y]) => `${x},${y}`).join(" ");
}

export function DeedMap({ onClose }: { onClose: () => void }) {
  const deeds = useGame((s) => s.deeds);
  const buy = useGame((s) => s.buyParcel);
  const sell = useGame((s) => s.sellParcel);
  const coins = useGame((s) => s.coins);
  const [picked, setPicked] = useState<string | null>(null);
  const tile = PARCELS.find((p) => p.id === picked) ?? null;
  const owned = tile ? deeds.includes(tile.id) : false;
  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-[#143028]/95 p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="font-display text-lg font-semibold text-parchment">Deed map</p>
        <button type="button" onClick={onClose} className="rounded-full bg-parchment px-3 py-1 text-xs font-semibold text-ink">
          Close
        </button>
      </div>
      <p className="mb-2 text-xs font-semibold text-parchment/80">
        Gold is yours. Cream is a gnome's, and that deed does not sell. Pale hollow and the tan desert can be bought. Five villages. The gold pin is the Capitol.
      </p>
      <svg viewBox={`0 0 ${VW} ${VH}`} className="min-h-0 flex-1 rounded-[18px] bg-[#1e4d5a]">
        <polygon points={poly(BEACH_POLY)} fill="#e7d7a2" />
        <polygon points={poly(DESERT_POLY)} fill="#e2b15a" />
        <polygon points={poly(ISLAND_POLY)} fill="#6f8f66" />
        <polygon points={`${MOUNT_NOBLE.x},${MOUNT_NOBLE.y - 90} ${MOUNT_NOBLE.x + 70},${MOUNT_NOBLE.y + 54} ${MOUNT_NOBLE.x - 70},${MOUNT_NOBLE.y + 54}`} fill="#8a7a68" />
        {VILLAGES.map((v) => (
          <g key={v.id}>
            <circle cx={v.x} cy={v.y} r={v.capitol ? 28 : 16} fill={v.capitol ? "#d6a84c" : "#f2e8d5"} stroke="#24402f" strokeWidth={4} />
            <text x={v.x + 34} y={v.y + 8} fill="#f2e8d5" fontSize={28} fontFamily="sans-serif">
              {v.name}
            </text>
          </g>
        ))}
        <ellipse cx="2480" cy="420" rx="90" ry="50" fill="#4f6b42" />
        <ellipse cx="2320" cy="560" rx="70" ry="40" fill="#4f6b42" />
        <ellipse cx="2200" cy="720" rx="55" ry="32" fill="#4f6b42" />
        {TREE_SPOTS.map((t) => (
          <circle key={t.id} cx={t.x} cy={t.y} r={8} fill="#24402f" />
        ))}
        {PARCELS.map((p) => {
          const mine = deeds.includes(p.id);
          return (
            <rect
              key={p.id}
              x={p.x}
              y={p.y}
              width={p.w - 8}
              height={p.h - 8}
              rx={10}
              fill={mine ? "#d6a84c" : p.owner ? "#efe4cf" : "#c9d6c2"}
              fillOpacity={0.72}
              stroke={picked === p.id ? "#24402f" : "transparent"}
              strokeWidth={8}
              onClick={() => setPicked(p.id)}
            />
          );
        })}
      </svg>
      {tile ? (
        <div className="mt-2 rounded-[16px] bg-parchment p-3">
          <p className="font-display text-base font-semibold text-ink">
            {owned ? "Your ground" : tile.ownerName ? `${tile.ownerName}'s ground` : "Hollow parcel"}
          </p>
          {tile.owner && !owned ? (
            <p className="mt-1 text-xs font-semibold text-bark/70">
              Private property. Sacred. {tile.ownerName} does not sell the floor they stand on.
            </p>
          ) : (
            <p className="text-xs font-semibold text-bark/70">{tile.price} coins. You hold {coins}.</p>
          )}
          {owned ? (
            <button
              type="button"
              onClick={() => sell(tile.id)}
              className="mt-2 h-10 w-full rounded-[12px] bg-pine text-sm font-semibold text-parchment"
            >
              Sell the deed · {Math.max(1, Math.floor(tile.price * 0.7))}
            </button>
          ) : tile.owner ? null : (
            <button
              type="button"
              disabled={coins < tile.price}
              onClick={() => buy(tile.id)}
              className="mt-2 h-10 w-full rounded-[12px] bg-gold text-sm font-semibold text-ink disabled:opacity-40"
            >
              Buy the deed
            </button>
          )}
        </div>
      ) : (
        <p className="mt-2 text-center text-xs font-semibold text-parchment/70">Tap a parcel.</p>
      )}
    </div>
  );
}
