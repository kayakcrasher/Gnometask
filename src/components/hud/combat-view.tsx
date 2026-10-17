import { Shield, Swords } from "lucide-react";
import { MAX_STAMINA } from "@/lib/game/combat";
import { useGame } from "@/lib/game/store";
import { cn } from "@/lib/utils";
import { COMBAT_SKILLS, SKILL_LABEL, levelFromXp } from "@/lib/game/xp";

function Health({ label, value, max, enemy = false }: { label: string; value: number; max: number; enemy?: boolean }) {
  return <div>
    <div className="mb-1 flex justify-between gap-2 text-[11px] font-bold text-bark/75"><span className="truncate">{label}</span><span className="shrink-0 tabular-nums">{value}/{max}</span></div>
    <div role="progressbar" aria-label={`${label} health`} aria-valuemin={0} aria-valuemax={max} aria-valuenow={value} className="h-2 overflow-hidden rounded-full bg-bark/15"><div className={cn("h-full rounded-full transition-[width] duration-200", enemy ? "bg-berry" : "bg-moss")} style={{ width: `${Math.max(0, Math.min(100, value / Math.max(1, max) * 100))}%` }} /></div>
  </div>;
}

export function CombatView() {
  const combat = useGame(s => s.combat);
  const honey = useGame(s => s.honey);
  const bread = useGame(s => s.bread);
  const skills = useGame(s => s.skills);
  const attack = useGame(s => s.combatAttack);
  const guard = useGame(s => s.combatGuard);
  const eat = useGame(s => s.combatEat);
  const flee = useGame(s => s.combatFlee);
  const end = useGame(s => s.combatEnd);
  const dragon = useGame(s => s.lifeDragon);
  const style = useGame(s => s.combatStyle);
  const setStyle = useGame(s => s.setCombatStyle);
  const setAuto = useGame(s => s.setCombatAuto);
  if (!combat) return null;
  const busy = combat.phase === "enemy";
  const over = combat.phase === "won" || combat.phase === "lost";
  const peaceful = combat.enemyId === "dragon" && honey > 0;
  const who = combat.enemyId === "dragon" ? dragon.name : combat.name;
  const heavy = combat.enemyIntent.kind !== "strike";
  const gainedXp = COMBAT_SKILLS.filter(id => combat.sessionXp[id] > 0);
  const button = "min-h-11 rounded-xl px-2 text-xs font-bold transition-colors disabled:opacity-40";
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-40 flex justify-center p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:bottom-2">
      <section key={combat.id} aria-label="Combat" className="pointer-events-auto max-h-[75dvh] w-full max-w-lg overflow-y-auto rounded-[20px] bg-parchment p-3 shadow-panel sm:p-4" onPointerDown={e => e.stopPropagation()} onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-bark/60">{over ? combat.phase === "lost" ? "Defeated · recover at home" : combat.pacified ? "Peace made" : "Victory" : `Round ${combat.round} · ${busy ? "Enemy turn" : "Your turn"}`}</p><h2 className="truncate font-display text-xl font-semibold text-ink">{who}</h2></div>
          {!over && <button type="button" aria-pressed={combat.autoAttack} onClick={() => setAuto(!combat.autoAttack)} className={cn(button, "shrink-0", combat.autoAttack ? "bg-pine text-parchment" : "bg-parchment-dark text-ink")}>{combat.autoAttack ? "Auto: on" : "Auto: off"}</button>}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3"><Health label="You" value={combat.playerHp} max={combat.playerMax} /><Health label={who} value={combat.enemyHp} max={combat.enemyMax} enemy /></div>
        {!over && <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-bold text-bark">
          <span>Stamina {combat.stamina}/{MAX_STAMINA}</span>
          <span className="flex gap-1" aria-hidden="true">{Array.from({length: MAX_STAMINA}, (_, i) => <span key={i} className={cn("h-2.5 w-5 rounded-full", i < combat.stamina ? "bg-gold" : "bg-bark/15")} />)}</span>
          {combat.counterReady && <span className="rounded-full bg-pine px-2 py-1 text-parchment">Counter ready · guaranteed hit +2</span>}
        </div>}
        {!over && <div className={cn("mt-3 flex items-start gap-2 rounded-xl p-2.5", heavy ? "bg-berry/10 text-berry" : "bg-parchment-dark/70 text-bark")}>
          {heavy ? <Shield className="mt-0.5 size-4 shrink-0" /> : <Swords className="mt-0.5 size-4 shrink-0" />}
          <div><p className="text-xs font-bold">{busy ? "Incoming" : "Next enemy attack"}: {combat.enemyIntent.label}</p><p className="mt-0.5 text-[11px] font-semibold">{combat.guarding ? "Guard raised · 55% less damage, then a counterattack." : heavy ? "A powerful attack is coming. Guard to soften it and prepare a counter." : "Quick strikes recover stamina. Save power strikes for a counter."}</p></div>
        </div>}
        <p role="status" aria-live="polite" className="mt-2 rounded-xl bg-parchment-dark/50 px-3 py-2 text-xs font-semibold leading-relaxed text-ink">{combat.log}</p>
        {over ? <>
          {combat.loot && <p className="mt-3 text-sm font-bold text-moss">+{combat.loot.coins} coins{combat.loot.bones ? ` · ${combat.loot.bones} bones` : ""}</p>}
          {gainedXp.length > 0 && <div className="mt-3"><p className="text-[10px] font-bold uppercase tracking-wide text-bark/60">Experience earned</p><ul className="mt-1 grid grid-cols-2 gap-1">{gainedXp.map(id => <li key={id} className="flex justify-between gap-2 rounded-lg bg-parchment-dark/50 px-2 py-1.5 text-xs"><span>{SKILL_LABEL[id]} · Lv {levelFromXp(skills[id])}</span><strong className="text-moss">+{combat.sessionXp[id]}</strong></li>)}</ul></div>}
          <button type="button" onClick={end} className={cn(button, "mt-3 w-full bg-pine text-parchment")}>{combat.phase === "lost" ? "Recover at the cottage" : "Continue"}</button>
        </> : <>
          <details className="mt-2 rounded-xl bg-parchment-dark/35 p-2">
            <summary className="cursor-pointer text-xs font-bold text-bark">Training: {SKILL_LABEL[style]} · change style</summary>
            <div className="mt-2 grid grid-cols-3 gap-1">{([['attack','Accurate hits'],['strength','Higher damage'],['defence','Less damage taken']] as const).map(([id,hint]) => <button key={id} type="button" aria-pressed={style === id} onClick={() => setStyle(id)} className={cn(button, style === id ? "bg-pine text-parchment" : "bg-parchment-dark text-ink")}><span className="block">{SKILL_LABEL[id]}</span><span className="block text-[9px] font-semibold opacity-75">{hint}</span></button>)}</div>
          </details>
          <div className="mt-3 grid grid-cols-3 gap-1.5">
            <button type="button" disabled={busy} onClick={() => attack("quick")} className={cn(button,"bg-berry text-parchment")}>Quick strike<span className="block text-[10px] opacity-80">+1 stamina</span></button>
            <button type="button" disabled={busy || combat.stamina < 2} onClick={() => attack("power")} className={cn(button,"bg-berry text-parchment")}>Power strike<span className="block text-[10px] opacity-80">−2 stamina · 1.75× hit</span></button>
            <button type="button" disabled={busy} onClick={guard} className={cn(button,"bg-pine text-parchment")}>Guard<span className="block text-[10px] opacity-80">+2 stamina · counter</span></button>
          </div>
          <div className="mt-1.5 grid grid-cols-2 gap-1.5">
            <button type="button" disabled={busy || honey + bread < 1 || (!peaceful && combat.playerHp >= combat.playerMax)} onClick={eat} className={cn(button,"bg-gold text-ink")}>{peaceful ? "Offer cake" : `Eat (${honey + bread})`}</button>
            <button type="button" disabled={busy} onClick={flee} className={cn(button,"bg-parchment-dark text-ink")}>Flee</button>
          </div>
          <p className="mt-2 text-center text-[10px] font-semibold text-bark/60">{combat.autoAttack ? "Auto uses quick strikes. Turn it off to guard or use power strikes." : "Eating uses your turn · fleeing can fail."}</p>
        </>}
      </section>
    </div>
  );
}
