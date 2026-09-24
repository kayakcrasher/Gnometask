import { useEffect, useLayoutEffect } from "react";
import { LandMap } from "@/components/land/land-map";
import { TopBar } from "@/components/hud/top-bar";
import { Speech } from "@/components/hud/speech";
import { Welcome } from "@/components/hud/welcome";
import { ClickPopup } from "@/components/hud/click-popup";
import { InteriorView } from "@/components/hud/interior-view";
import { BankRoom } from "@/components/world/bank-room";
import { CasinoRoom } from "@/components/world/casino-room";
import { ExchangeRoom } from "@/components/world/exchange-room";
import { FarIsle } from "@/components/world/far-isle";
import { GoblinIsle } from "@/components/world/goblin-isle";
import { InventoryView } from "@/components/hud/inventory-view";
import { MenuView } from "@/components/hud/menu-view";
import { unlockAudio } from "@/lib/game/juice";
import { useGame } from "@/lib/game/store";
import { cn } from "@/lib/utils";

export function AppShell() {
  const hydrate = useGame((s) => s.hydrate);
  const named = useGame((s) => s.named);
  const atHome = useGame((s) => s.atHome);
  const interior = useGame((s) => s.interior);
  const tickWorld = useGame((s) => s.tickWorld);

  useLayoutEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!named || atHome) return;
    const id = window.setInterval(() => tickWorld(), 9000);
    return () => window.clearInterval(id);
  }, [named, atHome, tickWorld]);

  return (
    <div className="fixed inset-0 overflow-hidden bg-pine" onPointerDown={unlockAudio}>
      <div className={cn("absolute inset-0", atHome && "pointer-events-none")}>
        <LandMap />
        {named && !atHome ? (
          <>
            <TopBar />
            <Speech />
            <ClickPopup />
            <InventoryView />
            <MenuView />
            <InteriorView />
            {interior === "bank" ? <BankRoom /> : null}
            {interior === "casino" ? <CasinoRoom /> : null}
            {interior === "exchange" ? <ExchangeRoom /> : null}
            <GoblinIsle />
            <FarIsle />
          </>
        ) : null}
      </div>
      <Welcome />
    </div>
  );
}
