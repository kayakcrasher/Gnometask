export { CHEERS, GREETS, NUDGES, PLACE_LINES } from "./data/quotes";

export function randOf<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}
