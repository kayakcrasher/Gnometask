import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useGame } from "@/lib/game/store";
import { cn } from "@/lib/utils";

const DOCK_ID = "hud-action-dock";

/**
 * One shared stack for the outdoor action buttons (Travel, Bank & harbour,
 * Thimblehaven council, Ocean chart…). Each control used to pin itself with its
 * own hard-coded `bottom-*` offset, so they collided whenever one grew (e.g.
 * "Hop off wagon") and on short landscape phones. Buttons now portal into this
 * dock: a column on tall screens, a wrapping row along the bottom on short ones.
 */
export function HudDock() {
  const afloat = useGame((s) => Boolean(s.afloat));
  return (
    <div
      id={DOCK_ID}
      className={cn(
        "pointer-events-none fixed left-3 z-30 flex flex-col-reverse items-start gap-2 [&>*]:pointer-events-auto",
        afloat ? "bottom-56" : "bottom-24",
        "[@media(max-height:560px)]:bottom-3 [@media(max-height:560px)]:max-w-[calc(100vw-11rem)] [@media(max-height:560px)]:flex-row [@media(max-height:560px)]:flex-wrap-reverse [@media(max-height:560px)]:items-end",
      )}
    />
  );
}

/** Render children into the shared dock. Lower `order` sits closer to the bottom. */
export function DockSlot({ order, children }: { order: number; children: ReactNode }) {
  const [host, setHost] = useState<HTMLElement | null>(null);
  useEffect(() => setHost(document.getElementById(DOCK_ID)), []);
  if (!host) return null;
  return createPortal(
    <div className="flex flex-col items-start gap-2" style={{ order }}>
      {children}
    </div>,
    host,
  );
}
