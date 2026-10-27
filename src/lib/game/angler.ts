import { FISH, cleanFishBag, type FishDef } from './data/fish';
import { noticeTerms } from './town-progress';
import type { GameSave } from './types';

export type AnglerJournal = { catches: Record<string, number>; claimed: string[] };
export const emptyAnglerJournal = (): AnglerJournal => ({ catches: {}, claimed: [] });
export const ANGLER_AWARDS = [
  { id: 'first-pages', name: 'First pages', species: 3, coins: 60 },
  { id: 'shore-naturalist', name: 'Shore naturalist', species: 8, coins: 200 },
  { id: 'ocean-observer', name: 'Ocean observer', species: 15, coins: 700 },
  { id: 'complete-atlas', name: 'The complete atlas', species: FISH.length, coins: 2500 },
] as const;
/** Existing bag and aquarium fish are evidence of catches, never extra catches on reload. */
export function coerceAngler(raw: unknown, bag: unknown, tank: unknown): AnglerJournal {
  const r = raw && typeof raw === 'object' ? raw as Partial<AnglerJournal> : {};
  const catches = cleanFishBag(r.catches), b = cleanFishBag(bag), t = cleanFishBag(tank);
  for (const f of FISH) {
    const n = Math.min(100000, Math.max(catches[f.id] ?? 0, (b[f.id] ?? 0) + (t[f.id] ?? 0)));
    if (n) catches[f.id] = n;
  }
  return { catches, claimed: ANGLER_AWARDS.filter(a => Array.isArray(r.claimed) && r.claimed.includes(a.id)).map(a => a.id) };
}
export const speciesCaught = (journal: AnglerJournal) => FISH.filter(f => (journal.catches[f.id] ?? 0) > 0).length;
export function fishHabitat(f: FishDef) {
  return f.giant ? `Offshore water clear of land · Fishing ${f.need} · deepwater rig on a compatible hull`
    : f.sea ? `Open sea · Fishing ${f.need} · boat rank ${f.boat}+`
    : `Shore or rowboat · Fishing ${f.need}`;
}
/** Quote and execute from the same live state. Aquarium fish are never sold. */
export function spareFishSale(s: Pick<GameSave, 'fishBag' | 'townProgress'>) {
  const fishBag = { ...s.fishBag };
  const order = s.townProgress.jobs.fish?.state === 'active' ? noticeTerms(s, 'fish').amount : 0;
  let count = 0, coins = 0;
  for (const f of FISH) {
    const keep = f.id === 'sprat' ? Math.max(1, order) : 1;
    const sold = Math.max(0, Math.floor(s.fishBag[f.id] ?? 0) - keep);
    if (sold) { fishBag[f.id] -= sold; count += sold; coins += sold * f.price; }
  }
  return { fishBag, count, coins };
}

export function anglerAvailable(s: GameSave & {atHome?: boolean; combat?: unknown; fishing?: unknown; abroad?: unknown}) {
  return s.named && !s.atHome && !s.bank.pending && !s.combat && !s.fishing && !s.abroad && !s.transport.ride && !s.naval.battle && !s.naval.rescue && !s.naval.boarding;
}
