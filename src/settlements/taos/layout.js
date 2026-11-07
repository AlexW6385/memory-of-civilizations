// Taos Pueblo (c. 1500) — the layout (docs/settlements/taos.md §2): the North House and the South
// House framing the east–west plaza, Red Willow Creek flowing west through it, kivas round about,
// the racks on the plaza's north side, the perimeter wall, fields beyond; the ground rising toward
// the mountain in the north-east. Pure data. +x east, +z south.

export const RADIUS = 320;
export const CELL = 5;
export const WALL = [-150, -150, 150, 140];
export const CREEK = { w: 5, bed: -1.3, water: -0.9 };
export const creekZ = (x) => 4 * Math.sin(x / 55) + x * 0.04;
export const inCreek = (x, z, m = 0) => Math.abs(z - creekZ(x)) < CREEK.w / 2 + m && Math.hypot(x, z) < RADIUS - 26;
export const KIVAS = [[-110, -30, 6], [-60, 30, 5.5], [95, -25, 6], [60, 120, 5.5], [-120, 95, 5], [120, 70, 5.5]];
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
/** A house block's storeys on a grid: highest at the back, stepping down to the plaza and to its ends, alleys across it, ragged edges. */
function block(cols, rows, top, back, seed, alleys) {
  const rand = rng(seed), H = [];
  for (let i = 0; i < rows; i++) {
    const row = [];
    for (let j = 0; j < cols; j++) {
      const fromBack = back === 'n' ? i : rows - 1 - i, fromMid = Math.abs(j - (cols - 1) / 2);
      let h = top - Math.floor(fromBack / 1.7) - Math.floor(fromMid / (cols / 7)) + (rand() < 0.15 ? -1 : 0);
      if (alleys.includes(j)) h = 0;
      if ((j === 0 || j === cols - 1 || fromBack === rows - 1) && rand() < 0.35) h = 0;
      row.push(Math.max(0, Math.min(top, h)));
    }
    H.push(row);
  }
  return H;
}
export const NORTH = { x0: -75, z0: -98, heights: block(24, 9, 5, 'n', 1450, [8, 16]), front: 's' };
export const SOUTH = { x0: -35, z0: 46, heights: block(19, 8, 4, 's', 1000, [9]), front: 'n' };
/** The room opened and furnished (docs/settlements/taos.md §4.2): a ground-storey cell of the North House on the plaza, its doorway south. */
export const ROOM = { i: 8, j: 11, door: 's' };
const rectOf = (b) => [b.x0, b.z0, b.x0 + b.heights[0].length * CELL, b.z0 + b.heights.length * CELL];
export const NORTH_RECT = rectOf(NORTH), SOUTH_RECT = rectOf(SOUTH);
export const inHouses = (x, z, m = 0) => inRect(NORTH_RECT, x, z, m) || inRect(SOUTH_RECT, x, z, m);
