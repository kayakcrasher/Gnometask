import type { SVGProps } from "react";

export type GnomeFacing = "left" | "right" | "up" | "down";

const HATS: Record<string, { peak: string; body: string; tip: string; band: string; kind: "peak" | "straw" | "crown" | "shroom" }> = {
  "hat-berry": { peak: "#c24f45", body: "#8a3a32", tip: "#d6a84c", band: "#f4f1ea", kind: "peak" },
  "hat-moss": { peak: "#5c7a54", body: "#35543f", tip: "#d6a84c", band: "#f4f1ea", kind: "peak" },
  "hat-straw": { peak: "#e6d8bc", body: "#c4a574", tip: "#d6a84c", band: "#5b4230", kind: "straw" },
  "hat-mushroom": { peak: "#d66a58", body: "#a8433b", tip: "#f2e8d5", band: "#f4f1ea", kind: "shroom" },
  "hat-night": { peak: "#2f3d34", body: "#1d2a22", tip: "#d6a84c", band: "#d6a84c", kind: "peak" },
  "hat-dragon": { peak: "#a8433b", body: "#6b2e2a", tip: "#d6a84c", band: "#d6a84c", kind: "peak" },
  "hat-flower": { peak: "#a8433b", body: "#d6a84c", tip: "#f2e8d5", band: "#5c7a54", kind: "crown" },
  "hat-guard": { peak: "#8a7a68", body: "#5b4230", tip: "#d6a84c", band: "#c4a574", kind: "peak" },
};

function Hat({ id, rear }: { id: string; rear?: boolean }) {
  const hat = HATS[id] ?? HATS["hat-berry"]!;
  if (hat.kind === "straw") {
    return (
      <g>
        <ellipse cx="50" cy="34" rx="36" ry="8" fill={hat.body} />
        <ellipse cx="50" cy="32" rx="22" ry="6" fill={hat.peak} />
        <path d="M32 32 C34 12 66 12 68 32 Z" fill={hat.peak} />
        <path d="M66 32 C72 18 70 12 62 14" fill={hat.body} opacity="0.45" />
        <rect x="32" y="28" width="36" height="5" rx="2" fill={hat.band} />
      </g>
    );
  }
  if (hat.kind === "shroom") {
    return (
      <g>
        <ellipse cx="50" cy="32" rx="32" ry="16" fill={hat.body} />
        <ellipse cx="50" cy="28" rx="24" ry="12" fill={hat.peak} />
        <ellipse cx="42" cy="24" rx="10" ry="5" fill="#f2e8d5" opacity="0.28" />
        <circle cx="38" cy="26" r="4.2" fill={hat.tip} />
        <circle cx="58" cy="24" r="3.4" fill={hat.tip} />
        <circle cx="50" cy="34" r="3.6" fill={hat.tip} />
      </g>
    );
  }
  if (hat.kind === "crown") {
    return (
      <g>
        <ellipse cx="50" cy="34" rx="28" ry="7" fill="#5c7a54" />
        <circle cx="30" cy="30" r="7" fill="#a8433b" />
        <circle cx="42" cy="22" r="7" fill="#d6a84c" />
        <circle cx="58" cy="22" r="7" fill="#5c7a54" />
        <circle cx="70" cy="30" r="7" fill="#c24f45" />
        <circle cx="50" cy="30" r="6" fill="#f2e8d5" />
      </g>
    );
  }
  return (
    <g>
      <path d="M50 2 C18 28 22 34 24 36 L76 36 C78 34 82 28 50 2 Z" fill={hat.body} />
      <path d="M50 4 C28 26 30 34 32 35 L68 35 C70 34 72 26 50 4 Z" fill={hat.peak} />
      <path d="M62 10 C74 22 76 32 70 35 L50 8 Z" fill={hat.body} opacity="0.35" />
      <ellipse cx="40" cy="18" rx="8" ry="5" fill="#f2e8d5" opacity="0.18" />
      <circle cx="50" cy="5" r="5.2" fill={hat.tip} />
      <ellipse cx="48" cy="3.5" rx="2.2" ry="1.4" fill="#f2e8d5" opacity="0.55" />
      <rect x="24" y="33" width="52" height="8" rx="4" fill={hat.band} />
      {rear ? <ellipse cx="50" cy="24" rx="12" ry="8" fill={hat.peak} opacity="0.4" /> : null}
    </g>
  );
}

const METAL: Record<string, string> = {
  "weapon-stick": "#5b4230",
  "weapon-bronze": "#c4963d",
  "weapon-iron": "#8a7a68",
  "weapon-steel": "#cfe4c8",
  "weapon-mithril": "#9ec3b8",
  "shield-wood": "#8a7a68",
  "shield-bronze": "#c4963d",
  "shield-iron": "#6b5340",
  "shield-mithril": "#6a8f8a",
  "armor-bronze": "#c4963d",
  "armor-iron": "#8a7a68",
  "armor-steel": "#b8c4b0",
  "armor-mithril": "#9ec3b8",
};

export function GnomeSprite({
  hat,
  bounceKey,
  weapon,
  shield,
  armor,
  walking,
  striking,
  facing = "down",
  ...rest
}: {
  hat: string;
  bounceKey: number;
  weapon?: string | null;
  shield?: string | null;
  armor?: string | null;
  walking?: boolean;
  striking?: boolean;
  facing?: GnomeFacing;
} & SVGProps<SVGGElement>) {
  const tunic = armor ? (METAL[armor] ?? "#4c6b47") : "#4c6b47";
  const tunicDark = armor ? "#3e2e20" : "#35543f";
  const tunicLit = armor ? "#d4c4a4" : "#6f8f66";
  const rear = facing === "up";
  const flip = facing === "left" ? -1 : 1;
  const motion = striking ? "gnome-strike" : walking ? "gnome-walk-root" : bounceKey ? "gnome-bounce" : "gnome-idle";

  return (
    <g {...rest}>
      <g transform={`translate(50 0) scale(${flip} 1) translate(-50 0)`}>
        <ellipse cx="50" cy="116" rx="24" ry="7" fill="#3e2e20" opacity="0.28" />
        {walking ? (
          <g className="gnome-dust" pointerEvents="none">
            <circle cx="26" cy="114" r="3.6" fill="#c4a574" />
            <circle cx="74" cy="112" r="2.6" fill="#d6c49a" />
          </g>
        ) : null}
        <g className={motion} key={striking ? `s-${bounceKey}` : walking ? "w" : `i-${bounceKey}`}>
          <g transform="translate(32 90)">
            <g className={walking ? "gnome-leg-back" : undefined}>
              <rect x="-6" y="0" width="12" height="18" rx="6" fill="#5b4230" />
              <ellipse cx="2" cy="18" rx="11" ry="5.5" fill="#3e2e20" />
              <ellipse cx="4" cy="17" rx="5" ry="2" fill="#6b5340" />
            </g>
          </g>
          <g className={walking ? "gnome-arm-back" : undefined} transform="translate(22 76)">
            <path d="M0 0 C-11 8 -13 20 -5 26" stroke={tunicDark} strokeWidth="10" fill="none" strokeLinecap="round" />
          </g>

          <path d="M20 106 C16 74 28 54 50 54 C74 54 84 74 80 106 Z" fill={tunic} />
          <path d="M58 58 C78 62 84 86 78 106 L50 106 L50 58 Z" fill={tunicDark} opacity="0.55" />
          <ellipse cx="42" cy="72" rx="14" ry="16" fill={tunicLit} opacity="0.28" />
          <path d="M28 102 C30 86 38 74 50 74 C64 74 70 86 72 102 Z" fill={tunicDark} />
          <rect x="26" y="94" width="48" height="8" rx="4" fill="#5b4230" />
          <circle cx="50" cy="98" r="4" fill="#d6a84c" />

          <g transform="translate(66 90)">
            <g className={walking ? "gnome-leg-front" : undefined}>
              <rect x="-6" y="0" width="12" height="18" rx="6" fill="#6b5340" />
              <ellipse cx="3" cy="18" rx="11" ry="5.5" fill="#3e2e20" />
              <ellipse cx="5" cy="17" rx="5" ry="2" fill="#8a7a68" />
            </g>
          </g>

          {shield && !rear ? (
            <g>
              <ellipse cx="16" cy="86" rx="13" ry="18" fill={METAL[shield] ?? "#8a7a68"} stroke="#3e2e20" strokeWidth="1.8" />
              <ellipse cx="14" cy="82" rx="6" ry="8" fill="#f2e8d5" opacity="0.35" />
            </g>
          ) : null}

          <g
            className={striking ? "gnome-arm-strike" : walking ? "gnome-arm-front" : undefined}
            transform="translate(78 76)"
          >
            <path d="M0 0 C12 8 14 20 6 26" stroke={tunic} strokeWidth="10" fill="none" strokeLinecap="round" />
            {weapon ? (
              <g transform="translate(6 -10) rotate(-22)">
                <rect
                  x="0"
                  y="0"
                  width={weapon === "weapon-stick" ? 4.5 : 5.5}
                  height="44"
                  rx="1.6"
                  fill={METAL[weapon] ?? "#5b4230"}
                />
                {weapon !== "weapon-stick" ? <rect x="-5" y="36" width="15" height="6" rx="1.2" fill="#5b4230" /> : null}
                {weapon !== "weapon-stick" ? (
                  <polygon points="2.5,-2 8,8 -3,8" fill={METAL[weapon] ?? "#cfe4c8"} />
                ) : null}
              </g>
            ) : null}
          </g>

          <ellipse cx="50" cy="46" rx="22" ry="21" fill="#e8b98c" />
          <ellipse cx="58" cy="48" rx="10" ry="14" fill="#dd8f72" opacity="0.28" />
          {rear ? (
            <g>
              <ellipse cx="50" cy="54" rx="15" ry="9" fill="#dd8f72" opacity="0.4" />
              <path d="M36 58 C44 66 56 66 64 58" stroke="#5b4230" strokeWidth="2" fill="none" opacity="0.28" />
            </g>
          ) : (
            <g>
              <ellipse cx="36" cy="52" rx="5" ry="4.2" fill="#dd8f72" opacity="0.7" />
              <ellipse cx="64" cy="52" rx="5" ry="4.2" fill="#dd8f72" opacity="0.7" />
              <ellipse cx="41" cy="43" rx="3.2" ry="3.6" fill="#f4f1ea" />
              <ellipse cx="59" cy="43" rx="3.2" ry="3.6" fill="#f4f1ea" />
              <circle cx="41.5" cy="43.5" r="2.3" fill="#2a241c" />
              <circle cx="59.5" cy="43.5" r="2.3" fill="#2a241c" />
              <circle cx="42.4" cy="42.6" r="0.8" fill="#f4f1ea" />
              <circle cx="60.4" cy="42.6" r="0.8" fill="#f4f1ea" />
              <ellipse cx="50" cy="51" rx="5.5" ry="4.2" fill="#dd8f72" />
              <ellipse cx="49" cy="50" rx="2" ry="1.3" fill="#e8b98c" opacity="0.5" />
              <path d="M32 55 C40 64 46 60 50 55 C54 60 60 64 68 55 C66 62 58 70 50 64 C42 70 34 62 32 55 Z" fill="#f4f1ea" />
              <path d="M38 58 C44 63 50 60 50 58 C50 60 56 63 62 58" stroke="#e6d8bc" strokeWidth="1.4" fill="none" />
            </g>
          )}
          <Hat id={hat} rear={rear} />
        </g>
      </g>
    </g>
  );
}
