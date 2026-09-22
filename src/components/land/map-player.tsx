import { useGame } from "@/lib/game/store";
import { TOWN_SQUARE } from "@/lib/game/world";
import { SKILL_LABEL } from "@/lib/game/xp";
import type { GnomeFacing } from "./gnome";
import { GnomeSprite } from "./gnome";
import { AbsenceDragon, Chicken, Dragon, PackCreature } from "./creatures";
import { HitsplatMark, TinyHp } from "./map-marks";
import { Tree } from "./props";

export function MapPlayer({
  pos,
  facing,
  walking,
  marker,
}: {
  pos: { x: number; y: number };
  facing: GnomeFacing;
  walking: boolean;
  marker: { x: number; y: number } | null;
}) {
  const save = useGame();
  return (
    <>
      {marker ? (
        <g pointerEvents="none">
          <ellipse cx={marker.x} cy={marker.y} rx="18" ry="9" fill="#d6a84c" opacity="0.45" className="pulse-slot" />
          <path
            d={`M ${marker.x - 7} ${marker.y - 7} L ${marker.x + 7} ${marker.y + 7} M ${marker.x + 7} ${marker.y - 7} L ${marker.x - 7} ${marker.y + 7}`}
            stroke="#2a241c"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </g>
      ) : null}

      <g pointerEvents="none">
        {save.milestonesReached.map((m, i) => (
          <Tree key={m} x={200 + i * 70} y={520} scale={0.7 + (i % 3) * 0.1} />
        ))}
        <g transform={`translate(${pos.x} ${pos.y})`}>
          <GnomeSprite
            hat={save.hat}
            bounceKey={save.combat ? save.combat.shake : save.bounceKey}
            weapon={save.equipment.weapon}
            shield={save.equipment.shield}
            armor={save.equipment.armor}
            walking={walking}
            striking={Boolean(save.combat?.striking)}
            facing={facing}
            transform="translate(-40 -86) scale(0.82)"
          />
        </g>
        {save.combat ? <TinyHp x={pos.x} y={pos.y - 92} value={save.combat.playerHp} max={save.combat.playerMax} /> : null}
        {save.combat?.splatOnPlayer != null ? (
          <HitsplatMark key={`p-${save.combat.shake}`} x={pos.x} y={pos.y - 78} splat={save.combat.splatOnPlayer} />
        ) : null}
        {save.combat?.lastXp && save.combat.phase !== "enemy"
          ? Object.entries(save.combat.lastXp)
              .filter(([, v]) => v)
              .map(([id, v], i) => (
                <text
                  key={`${id}-${save.combat!.shake}`}
                  className="xp-drop"
                  x={pos.x + 28}
                  y={pos.y - 64 - i * 12}
                  fill="#24402f"
                  fontFamily="Nunito, sans-serif"
                  fontSize="11"
                  fontWeight="800"
                >
                  {SKILL_LABEL[id as keyof typeof SKILL_LABEL].slice(0, 3)} +{v}
                </text>
              ))
          : null}
        {save.combat && save.combat.phase !== "lost" ? (
          <g>
            {save.combat.enemyId === "dragon" ? (
              <Dragon
                x={save.combat.atX}
                y={save.combat.atY}
                scale={1.2}
                look={save.lifeDragon.look}
                horn={save.lifeDragon.horn}
              />
            ) : save.combat.enemyId === "absence" ? (
              <AbsenceDragon x={save.combat.atX} y={save.combat.atY} scale={1} />
            ) : (
              <PackCreature
                kind={save.combat.enemyId}
                x={save.combat.atX}
                y={save.combat.atY}
                striking={save.combat.phase === "enemy"}
              />
            )}
            <TinyHp x={save.combat.atX} y={save.combat.atY - 52} value={save.combat.enemyHp} max={save.combat.enemyMax} berry />
            {save.combat.splatOnEnemy != null ? (
              <HitsplatMark key={`e-${save.combat.shake}`} x={save.combat.atX} y={save.combat.atY - 62} splat={save.combat.splatOnEnemy} />
            ) : null}
          </g>
        ) : null}
        {save.chickenHeld ? <Chicken x={pos.x + 28} y={pos.y + 6} scale={0.85} /> : null}
        {save.gnomeName ? (
          <text x={pos.x} y={pos.y + 18} textAnchor="middle" fill="#2a241c" fontFamily="Nunito, sans-serif" fontSize="13" fontWeight="800">
            {save.gnomeName}
          </text>
        ) : null}
        <text x="360" y="330" textAnchor="middle" fill="#2a241c" fontFamily="Baloo 2, sans-serif" fontSize="18" fontWeight="700">
          Cottage
        </text>
        <text x="380" y="615" textAnchor="middle" fill="#2a241c" fontFamily="Baloo 2, sans-serif" fontSize="18" fontWeight="700">
          Garden
        </text>
        <text x={TOWN_SQUARE.x} y="318" textAnchor="middle" fill="#2a241c" fontFamily="Baloo 2, sans-serif" fontSize="16" fontWeight="700">
          Town square
        </text>
      </g>
    </>
  );
}
