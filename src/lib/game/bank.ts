/** Mossroot operates every branch; starter credit is separate from Wim's old hull loans. */
export const BANK_NAME = "Mossroot Consolidated Bank";
export const STARTER_LOANS = [25000, 50000, 105000] as const;
export const WEEKLY_INTEREST = 0.006;
export type BankAccount = {
  pending: boolean;
  signed: boolean;
  original: number;
  owed: number;
  interest: number;
  repaid: number;
  lastDay: number;
};
export const emptyBank = (): BankAccount => ({
  pending: false,
  signed: false,
  original: 0,
  owed: 0,
  interest: 0,
  repaid: 0,
  lastDay: 1,
});
const integer = (n: unknown, fallback = 0) =>
  typeof n === "number" && Number.isFinite(n)
    ? Math.max(0, Math.floor(n))
    : fallback;
export function coerceBank(value: unknown): BankAccount {
  if (!value || typeof value !== "object") return emptyBank();
  const b = value as Partial<BankAccount>;
  if (
    !b.signed ||
    !STARTER_LOANS.includes(b.original as (typeof STARTER_LOANS)[number])
  )
    return { ...emptyBank(), pending: b.pending === true };
  return {
    pending: false,
    signed: true,
    original: b.original!,
    owed: integer(b.owed),
    interest: integer(b.interest),
    repaid: integer(b.repaid),
    lastDay: Math.max(1, integer(b.lastDay, 1)),
  };
}
/** One charge per completed seven-market-day period, including after save/load. No offline wall-clock debt. */
export function accrueBank(bank: BankAccount, day: number): BankAccount {
  if (!bank.signed || bank.owed <= 0 || !Number.isFinite(day)) return bank;
  const weeks = Math.max(0, Math.floor((day - bank.lastDay) / 7));
  if (!weeks) return bank;
  let owed = bank.owed,
    interest = bank.interest;
  for (let i = 0; i < Math.min(weeks, 10000); i++) {
    const charge = Math.ceil(owed * WEEKLY_INTEREST);
    owed += charge;
    interest += charge;
    if (!Number.isSafeInteger(owed)) break;
  }
  return { ...bank, owed, interest, lastDay: bank.lastDay + weeks * 7 };
}
