import {PappyWelcome} from "./intro/pappy-welcome";
import {PlayerHomeRoom} from "./world/player-home-room";
import {ShipHelm} from "./hud/ship-controls";
import {ShipCabin} from "./world/ship-cabin";
import {NeighbourRoom} from "./world/neighbour-room";
import { useGraphics } from "@/lib/game/graphics";
import {OpenOceanControls} from "./hud/open-ocean";
import {NorthernSeas} from "./hud/northern-seas";
import {MarineControls} from "./hud/marine-controls";
import {StarterLoanChoice} from "./hud/mossroot-bank";
import { TransportControls } from "./hud/transport-controls";
import { Soundtrack } from "./soundtrack";
import { useEffect, useLayoutEffect } from "react";
import { LandMap } from "@/components/land/land-map";
import { EnemyIsland } from "@/components/world/enemy-island";
import { CombatView } from "@/components/hud/combat-view";
import { TopBar } from "@/components/hud/top-bar";
import { Speech } from "@/components/hud/speech";
import { Welcome, Coach } from "@/components/hud/welcome";
import { ClickPopup } from "@/components/hud/click-popup";
import { InteriorView } from "@/components/hud/interior-view";
import { BankRoom } from "@/components/world/bank-room";
import { CasinoRoom } from "@/components/world/casino-room";
import { ExchangeRoom } from "@/components/world/exchange-room";
import { CourtRoom } from "@/components/world/court-room";
import { PubRoom } from "@/components/world/pub-room";
import { FarIsle } from "@/components/world/far-isle";
import { RaidChart } from "@/components/hud/raid-chart";
import { GoblinIsle } from "@/components/world/goblin-isle";
import { InventoryView } from "@/components/hud/inventory-view";
import { MenuView } from "@/components/hud/menu-view";
import { setAmbience, unlockAudio } from "@/lib/game/juice";
import { useGame } from "@/lib/game/store";
import { cn } from "@/lib/utils";

export function AppShell() {
  const tickOpening=useGame(s=>s.tickOpening);
  useEffect(()=>{const id=window.setInterval(()=>tickOpening(1),1000);return()=>window.clearInterval(id);},[tickOpening]);
  useEffect(()=>useGraphics.getState().load(),[]);
  const hydrate = useGame((s) => s.hydrate);
  const named = useGame((s) => s.named);
  const atHome = useGame((s) => s.atHome);
  const interior = useGame((s) => s.interior);
  const tickWorld = useGame((s) => s.tickWorld);
  const tickOpenOcean=useGame(s=>s.tickOpenOcean);
  useEffect(()=>{const id=window.setInterval(()=>tickOpenOcean(.25),250);return()=>window.clearInterval(id);},[tickOpenOcean]);
  const tickSeas=useGame(s=>s.tickSeas);
  useEffect(()=>{const id=window.setInterval(()=>tickSeas(.25),250);return()=>window.clearInterval(id);},[tickSeas]);
  const tickMaritime=useGame(s=>s.tickMaritime);
  useEffect(()=>{const id=window.setInterval(()=>tickMaritime(.25),250);return()=>window.clearInterval(id);},[tickMaritime]);
  const tickTransport=useGame(s=>s.tickTransport);
  useEffect(()=>{const id=window.setInterval(()=>tickTransport(.25),250);return()=>window.clearInterval(id);},[tickTransport]);
  const tickClock = useGame((s) => s.tickClock);

  useLayoutEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!named || atHome) return;
    const id = window.setInterval(() => tickWorld(), 9000);
    return () => window.clearInterval(id);
  }, [named, atHome, tickWorld]);

  useEffect(() => {
    if (!named || atHome) return;
    const id = window.setInterval(() => tickClock(250), 250);
    return () => window.clearInterval(id);
  }, [named, atHome, tickClock]);

  useEffect(() => {
    if (!named || atHome) {
      setAmbience({ active: false, empty: 1, danger: 0 });
      return;
    }
    const id = window.setInterval(() => {
      const s = useGame.getState();
      const empty = Math.max(0, Math.min(1, 1 - s.placed.length / 10));
      let danger = s.raids.length > 0 ? 0.8 : 0;
      const land = s.landing;
      if (land && !land.flagDown) {
        const near = Math.max(0, 1 - Math.hypot(s.gnomeX - land.boatX, s.gnomeY - land.boatY) / 640);
        danger = Math.max(danger, 0.4 + near * 0.6);
      }
      setAmbience({ active: true, empty, danger });
    }, 700);
    return () => {
      window.clearInterval(id);
      setAmbience({ active: false, empty: 0, danger: 0 });
    };
  }, [named, atHome]);

  return (
    <div className="fixed inset-0 overflow-hidden bg-pine" onPointerDown={unlockAudio} onKeyDown={unlockAudio}>
      <Soundtrack />
      <TransportControls />
      <MarineControls/>
      <NorthernSeas/>
      <ShipHelm/>
      <ShipCabin/>
      <OpenOceanControls/>
      <StarterLoanChoice/>
      <PappyWelcome/>
      <div className={cn("absolute inset-0", atHome && "pointer-events-none")}>
        {!atHome && <LandMap />}
        {named && !atHome ? (
          <>
            <TopBar />
            <Speech />
            <ClickPopup />
            <InventoryView />
            <MenuView />
            <InteriorView />
            <PlayerHomeRoom/>
            <NeighbourRoom/>
            {interior === "bank" ? <BankRoom /> : null}
            {interior === "casino" ? <CasinoRoom /> : null}
            {interior === "exchange" ? <ExchangeRoom /> : null}
            {interior === "court" ? <CourtRoom /> : null}
            {interior === "pub" ? <PubRoom /> : null}
            <RaidChart />
            <GoblinIsle />
            <FarIsle />
            <EnemyIsland />
            <CombatView />
          </>
        ) : null}
      </div>
      <Welcome />
      <Coach />
    </div>
  );
}
