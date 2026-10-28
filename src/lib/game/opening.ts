/** New games get a quiet arrival. Missing data means an established, legacy game. */
export const SETTLING_SECONDS = 180;
export const PAPPY_PHASES=['invitation','evening','morning','offer','borrow'] as const;
export type PappyPhase=(typeof PAPPY_PHASES)[number];
export type Opening = { prologue?:PappyPhase; version: 1; homeVisited: boolean; activeSeconds: number; goblinsUnlocked: boolean };
export const settledOpening = (): Opening => ({version:1,homeVisited:true,activeSeconds:SETTLING_SECONDS,goblinsUnlocked:true});
export const freshOpening = (): Opening => ({version:1,homeVisited:false,activeSeconds:0,goblinsUnlocked:false,prologue:'invitation'});
export function coerceOpening(raw: unknown): Opening {
  if (!raw || typeof raw !== 'object' || (raw as Opening).version !== 1) return settledOpening();
  const o=raw as Opening;
  return {...(!o.homeVisited&&!o.goblinsUnlocked&&PAPPY_PHASES.includes(o.prologue!)?{prologue:o.prologue}:{}),version:1,homeVisited:o.homeVisited===true,activeSeconds:Number.isFinite(o.activeSeconds)?Math.min(SETTLING_SECONDS,Math.max(0,o.activeSeconds)):0,goblinsUnlocked:o.goblinsUnlocked===true};
}
export const openingPeaceful = (s:{opening?:Opening}) => s.opening?.goblinsUnlocked === false;
