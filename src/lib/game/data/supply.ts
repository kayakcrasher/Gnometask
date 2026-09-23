export const SUPPLY_PIER = { x: 175, y: 720 };
export const SUPPLY_BERTH = { x: 150, y: 768 };

export const NEWCOMERS: { name: string; hat: string }[] = [
  { name: "Tansy", hat: "hat-flower" },
  { name: "Cob", hat: "hat-moss" },
  { name: "Lark", hat: "hat-berry" },
  { name: "Nim", hat: "hat-straw" },
  { name: "Fern", hat: "hat-flower" },
  { name: "Oakley", hat: "hat-night" },
  { name: "Midge", hat: "hat-berry" },
  { name: "Pebble", hat: "hat-guard" },
];

export function supplyDue(days: number) {
  return days % 2 === 1;
}

export function nextNewcomer(days: number, settled: string[]) {
  if (!supplyDue(days) || days % 4 !== 1) return null;
  const have = new Set(settled);
  return NEWCOMERS.find((n) => !have.has(n.name)) ?? null;
}
