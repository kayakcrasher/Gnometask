/** Public woodland: deeds and construction must leave this habitat intact. */
export const NATIONAL_PARK = { name: "Bramblewood National Park", x: 650, y: -1980, rx: 350, ry: 330 };
export function inNationalPark(x: number, y: number, pad = 0) {
  const p = NATIONAL_PARK;
  return ((x-p.x)/(p.rx+pad))**2 + ((y-p.y)/(p.ry+pad))**2 <= 1;
}
export const PARK_RING: [number, number][] = Array.from({length:65}, (_,i) => [NATIONAL_PARK.x+Math.cos(i*Math.PI/32)*NATIONAL_PARK.rx,NATIONAL_PARK.y+Math.sin(i*Math.PI/32)*NATIONAL_PARK.ry]);
