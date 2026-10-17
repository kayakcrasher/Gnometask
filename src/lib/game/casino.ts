export const WHEEL_ODDS =
  "2% jackpot ×10 · 10% win ×3 · 25% return ×1.6 · 63% lose";
export function wheelPayout(stake: number, random: number) {
  if (
    ![5, 20].includes(stake) ||
    !Number.isFinite(random) ||
    random < 0 ||
    random >= 1
  )
    return null;
  const multiple =
    random < 0.02 ? 10 : random < 0.12 ? 3 : random < 0.37 ? 1.6 : 0;
  return {
    pay: Math.round(stake * multiple),
    label:
      multiple === 10
        ? "Jackpot"
        : multiple === 3
          ? "Winning spin"
          : multiple
            ? "Small return"
            : "No match",
  };
}
