import { useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useGame } from '@/lib/game/store';
import { FISH } from '@/lib/game/data/fish';
import { ANGLER_AWARDS, speciesCaught, fishHabitat, spareFishSale, anglerAvailable } from '@/lib/game/angler';
import { levelFromXp } from '@/lib/game/xp';

const button = 'min-h-11 rounded-xl px-3 py-2 text-xs font-bold disabled:opacity-40';
export function FishSale() {
  const s = useGame(useShallow(s => ({ fishBag: s.fishBag, townProgress: s.townProgress, sellSpareFish: s.sellSpareFish, blocked: !anglerAvailable(s) })));
  const sale = spareFishSale(s), blocked = s.blocked;
  return <div className="my-2 rounded-xl bg-pine/10 p-3">
    <button type="button" disabled={blocked || !sale.count} onClick={s.sellSpareFish} className={`${button} w-full bg-gold`}>Sell spares · {sale.count} fish · {sale.coins} coins</button>
    <p className="mt-1 text-xs">Keeps one of each species in your bag and reserves sprats for your accepted town notice. Aquarium fish stay home. Use individual Sell buttons to sell your last fish.</p>
  </div>;
}

export function AnglerJournal() {
  const s = useGame(useShallow(s => ({ angler: s.angler, fishingXp: s.skills.fishing, claimAnglerAward: s.claimAnglerAward, speech: s.speech, blocked: !anglerAvailable(s) })));
  const [filter, setFilter] = useState('all');
  const found = speciesCaught(s.angler), level = levelFromXp(s.fishingXp), blocked = s.blocked;
  const fish = [...FISH].sort((a, b) => a.need - b.need || Number(!!a.giant) - Number(!!b.giant))
    .filter(f => filter === 'all' || (filter === 'recorded' ? !!s.angler.catches[f.id] : !s.angler.catches[f.id]));
  return <details className="my-3 rounded-2xl bg-pine/10 p-3">
    <summary className="min-h-11 cursor-pointer py-3 font-display font-bold">Angler’s Journal · {found}/{FISH.length} species</summary>
    <p className="text-xs">A little atlas of fins and unlikely whiskers. Land a catch to record it forever, even after selling or gifting it. Existing bag and aquarium fish count too.</p>
    <div className="my-3 space-y-2" aria-label="Angler awards">
      {ANGLER_AWARDS.map(a => <div key={a.id} className="rounded-xl bg-white/40 p-2">
        <p className="text-xs font-bold">{a.name} · {Math.min(found, a.species)}/{a.species} species</p>
        <button type="button" className={`${button} mt-1 w-full bg-gold`} disabled={blocked || found < a.species || s.angler.claimed.includes(a.id)} onClick={() => s.claimAnglerAward(a.id)}>{s.angler.claimed.includes(a.id) ? `${a.name} · collected` : `Claim ${a.name} · ${a.coins} coins`}</button>
      </div>)}
    </div>
    <div className="my-2 flex flex-wrap gap-1" aria-label="Journal filters">{[['all', 'All fish'], ['missing', 'Still to find'], ['recorded', 'Recorded']].map(([id, label]) => <button type="button" key={id} aria-pressed={filter === id} onClick={() => setFilter(id)} className={`${button} ${filter === id ? 'bg-pine text-parchment' : 'bg-white/50'}`}>{label}</button>)}</div>
    <ul className="max-h-72 space-y-2 overflow-y-auto" aria-label="Fish field guide">{fish.map(f => <li key={f.id} className="rounded-xl bg-white/40 p-2 text-xs">
      <p className="font-bold"><span aria-hidden="true" style={{ color: f.color }}>● </span>{f.name} · {s.angler.catches[f.id] ? `${s.angler.catches[f.id]} recorded` : 'Not recorded'}</p>
      <p>{fishHabitat(f)}</p>{!!s.angler.best?.[f.id]&&<p className="font-bold text-pine">Record length {s.angler.best[f.id].toFixed(2)} m</p>}<p className="text-bark">{f.price} coins · {f.xp} Fishing XP{level < f.need ? ` · ${f.need - level} more Fishing levels needed` : ''}</p>
    </li>)}</ul>
    {!fish.length && <p className="text-xs">No entries here yet. Every little sprat is a beginning.</p>}
    <p role="status" className="mt-2 text-xs">{s.speech}</p>
  </details>;
}
