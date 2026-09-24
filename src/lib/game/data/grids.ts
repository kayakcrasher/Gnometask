/** Space between lot centers inside a block. A street is inserted every two lots. */
export const LOT = 78;
export const STREET_EXTRA = 40;

export function gridPoint(ox: number, oy: number, col: number, row: number) {
  return {
    x: Math.round(ox + col * LOT + Math.floor(col / 2) * STREET_EXTRA),
    y: Math.round(oy + row * LOT + Math.floor(row / 2) * STREET_EXTRA),
  };
}

export type TownGrid = {
  id: string;
  ox: number;
  oy: number;
  cols: number;
  rows: number;
};

/** Outer towns. The capitol has its own courthouse plan. */
export const TOWN_GRIDS: TownGrid[] = [
  { id: "tideham", ox: 200, oy: 860, cols: 2, rows: 2 },
  { id: "greenlane", ox: 1140, oy: 540, cols: 2, rows: 5 },
  { id: "haven", ox: 1760, oy: 640, cols: 2, rows: 3 },
  { id: "sunstep", ox: 3120, oy: 700, cols: 3, rows: 2 },
];

export function townGrid(id: string) {
  const grid = TOWN_GRIDS.find((g) => g.id === id);
  if (!grid) throw new Error(id);
  return grid;
}

export function cellsOf(grid: TownGrid) {
  const out: { col: number; row: number; x: number; y: number }[] = [];
  for (let row = 0; row < grid.rows; row++) {
    for (let col = 0; col < grid.cols; col++) {
      out.push({ col, row, ...gridPoint(grid.ox, grid.oy, col, row) });
    }
  }
  return out;
}

export type StreetSeg = { ax: number; ay: number; bx: number; by: number; alley: boolean; width?: number };

/** Alleys between neighbouring lots, streets between blocks, and a ring road. */
export function townStreets(grid: TownGrid): StreetSeg[] {
  const cells = cellsOf(grid);
  const segs: StreetSeg[] = [];
  const half = LOT * 0.42;
  for (let i = 0; i < cells.length; i++) {
    for (let j = i + 1; j < cells.length; j++) {
      const a = cells[i]!;
      const b = cells[j]!;
      if (a.row === b.row && Math.abs(a.col - b.col) === 1) {
        const mid = (a.x + b.x) / 2;
        const alley = Math.abs(a.x - b.x) <= LOT + 4;
        segs.push({ ax: mid, ay: a.y - half, bx: mid, by: a.y + half, alley, width: alley ? 0.85 : 2.4 });
      }
      if (a.col === b.col && Math.abs(a.row - b.row) === 1) {
        const mid = (a.y + b.y) / 2;
        const alley = Math.abs(a.y - b.y) <= LOT + 4;
        segs.push({ ax: a.x - half, ay: mid, bx: a.x + half, by: mid, alley, width: alley ? 0.85 : 2.4 });
      }
    }
  }
  const xs = cells.map((c) => c.x);
  const ys = cells.map((c) => c.y);
  const minX = Math.min(...xs) - 56;
  const maxX = Math.max(...xs) + 56;
  const minY = Math.min(...ys) - 56;
  const maxY = Math.max(...ys) + 56;
  segs.push(
    { ax: minX, ay: minY, bx: maxX, by: minY, alley: false, width: 2.4 },
    { ax: minX, ay: maxY, bx: maxX, by: maxY, alley: false, width: 2.4 },
    { ax: minX, ay: minY, bx: minX, by: maxY, alley: false, width: 2.4 },
    { ax: maxX, ay: minY, bx: maxX, by: maxY, alley: false, width: 2.4 },
  );
  return segs;
}

/** Courthouse square. Hall faces the camera, shops face it across a wide main street. */
export const CAPITOL_HALL = { x: 360, y: 380 };
export const CAPITOL_FOUNTAIN = { x: 360, y: 250 };
export const CAPITOL_LAWN = { x: 200, y: 190, w: 450, h: 330 };

export const CAPITOL_SHOPS: { id: string; x: number; y: number }[] = [
  { id: "hatshop", x: 240, y: 710 },
  { id: "armory", x: 400, y: 710 },
  { id: "bakery", x: 560, y: 710 },
  { id: "bank", x: 760, y: 710 },
  { id: "townhall", x: CAPITOL_HALL.x, y: CAPITOL_HALL.y },
  { id: "general", x: 920, y: 710 },
];

export const CAPITOL_LOTS: { id: string; x: number; y: number }[] = [
  { id: "lot-inn", x: 760, y: 280 },
  { id: "lot-chapel", x: 760, y: 450 },
  { id: "lot-market", x: 940, y: 280 },
  { id: "lot-school", x: 940, y: 450 },
];

/** Wide streets around the square, a main street, and the alleys behind the blocks. */
export function capitolStreets(): StreetSeg[] {
  const wide = 3.6;
  return [
    { ax: 180, ay: 170, bx: 1040, by: 170, alley: false, width: wide },
    { ax: 180, ay: 590, bx: 1040, by: 590, alley: false, width: wide },
    { ax: 180, ay: 170, bx: 180, by: 820, alley: false, width: 2.6 },
    { ax: 680, ay: 170, bx: 680, by: 860, alley: false, width: 2.8 },
    { ax: 250, ay: 250, bx: 470, by: 250, alley: false, width: 1.6 },
    { ax: 360, ay: 190, bx: 360, by: 320, alley: false, width: 1.5 },
    { ax: 840, ay: 200, bx: 840, by: 520, alley: true, width: 0.9 },
    { ax: 200, ay: 800, bx: 820, by: 800, alley: true, width: 0.9 },
  ];
}

export function filledCount(id: string, days: number) {
  const grid = townGrid(id);
  const cap = grid.cols * grid.rows;
  if (id === "haven") return Math.min(cap, 1 + Math.floor(Math.max(0, days) / 5));
  if (id === "tideham") return Math.min(cap, 1 + Math.floor(Math.max(0, days) / 6));
  if (id === "sunstep") return Math.min(cap, 1 + Math.floor(Math.max(0, days) / 4));
  return cap;
}
