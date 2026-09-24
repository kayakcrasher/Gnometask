/** Lot pitch. A wider gap is inserted every two lots so a street splits the alleys. */
export const LOT = 46;
export const STREET_EXTRA = 22;

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

export const TOWN_GRIDS: TownGrid[] = [
  { id: "capitol", ox: 250, oy: 380, cols: 3, rows: 4 },
  { id: "tideham", ox: 120, oy: 520, cols: 2, rows: 2 },
  { id: "greenlane", ox: 1120, oy: 420, cols: 2, rows: 5 },
  { id: "haven", ox: 1800, oy: 660, cols: 2, rows: 3 },
  { id: "sunstep", ox: 3180, oy: 740, cols: 3, rows: 2 },
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

export type StreetSeg = { ax: number; ay: number; bx: number; by: number; alley: boolean };

/** Alleys between neighbouring lots, streets between blocks, and a ring road around the town. */
export function townStreets(grid: TownGrid): StreetSeg[] {
  const cells = cellsOf(grid);
  const segs: StreetSeg[] = [];
  const half = 20;
  for (let i = 0; i < cells.length; i++) {
    for (let j = i + 1; j < cells.length; j++) {
      const a = cells[i]!;
      const b = cells[j]!;
      if (a.row === b.row && Math.abs(a.col - b.col) === 1) {
        const mid = (a.x + b.x) / 2;
        segs.push({
          ax: mid,
          ay: a.y - half,
          bx: mid,
          by: a.y + half,
          alley: Math.abs(a.x - b.x) <= LOT + 4,
        });
      }
      if (a.col === b.col && Math.abs(a.row - b.row) === 1) {
        const mid = (a.y + b.y) / 2;
        segs.push({
          ax: a.x - half,
          ay: mid,
          bx: a.x + half,
          by: mid,
          alley: Math.abs(a.y - b.y) <= LOT + 4,
        });
      }
    }
  }
  const xs = cells.map((c) => c.x);
  const ys = cells.map((c) => c.y);
  const minX = Math.min(...xs) - 36;
  const maxX = Math.max(...xs) + 36;
  const minY = Math.min(...ys) - 36;
  const maxY = Math.max(...ys) + 36;
  segs.push(
    { ax: minX, ay: minY, bx: maxX, by: minY, alley: false },
    { ax: minX, ay: maxY, bx: maxX, by: maxY, alley: false },
    { ax: minX, ay: minY, bx: minX, by: maxY, alley: false },
    { ax: maxX, ay: minY, bx: maxX, by: maxY, alley: false },
  );
  return segs;
}

export function filledCount(id: string, days: number) {
  const grid = townGrid(id);
  const cap = grid.cols * grid.rows;
  if (id === "haven") return Math.min(cap, 1 + Math.floor(Math.max(0, days) / 5));
  if (id === "tideham") return Math.min(cap, 1 + Math.floor(Math.max(0, days) / 6));
  if (id === "sunstep") return Math.min(cap, 1 + Math.floor(Math.max(0, days) / 4));
  return cap;
}
