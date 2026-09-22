import { useEffect, useLayoutEffect } from "react";
import { LandMap } from "@/components/land/land-map";
import { TopBar } from "@/components/hud/top-bar";
import { ChoresDrawer } from "@/components/hud/side-panel";
import { Speech } from "@/components/hud/speech";
import { Welcome } from "@/components/hud/welcome";
import { CombatView } from "@/components/hud/combat-view";
import { ClickPopup } from "@/components/hud/click-popup";
import { InteriorView } from "@/components/hud/interior-view";
import { InventoryView } from "@/components/hud/inventory-view";
import { MenuView } from "@/components/hud/menu-view";
import { unlockAudio } from "@/lib/game/juice";
import { useGame } from "@/lib/game/store";
import { cn } from "@/lib/utils";

export function AppShell() {
  const hydrate = useGame((s) => s.hydrate);
  const named = useGame((s) => s.named);
  const tickWorld = useGame((s) => s.tickWorld);

  useLayoutEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!named) return;
    const id = window.setInterval(() => tickWorld(), 9000);
    return () => window.clearInterval(id);
  }, [named, tickWorld]);

  return (
    <div className="fixed inset-0 overflow-hidden bg-pine" onPointerDown={unlockAudio}>
      <div className={cn("absolute inset-0", !named && "pointer-events-none")}>
        <LandMap />
        {named ? (
          <>
            <TopBar />
            <Speech />
            <ClickPopup />
            <ChoresDrawer />
            <InventoryView />
            <MenuView />
            <InteriorView />
          </>
        ) : null}
      </div>
      <Welcome />
      <CombatView />
    </div>
  );
}
