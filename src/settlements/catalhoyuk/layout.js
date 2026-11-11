// Çatalhöyük, c. 6500 BC — the layout (docs/settlements/catalhoyuk.md §2, §5): the East Mound's houses packed as a
// honeycomb of cells with no streets, the roofs the way; open cells between them are middens and courts; sheep and
// cattle penned at the edge; the reed marsh and the plain round it. Pure data. +x east, +z south.

export const RADIUS = 90;
export const ST = 2.5;                       // a house roof's height (the landmark's); the others vary a little round it
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;

const COLS = 11, ROWS = 8, LM = { i: 7, j: 5 };            // the landmark house: the south row, fifth column
const rand = rng(6500);
export const CW = Array.from({ length: COLS }, (_, j) => (j === LM.j ? 8.4 : 5.0 + Math.round(rand() * 14) / 10));
export const CD = Array.from({ length: ROWS }, (_, i) => (i === LM.i ? 6.8 : 5.0 + Math.round(rand() * 12) / 10));
const W = CW.reduce((a, b) => a + b, 0), D = CD.reduce((a, b) => a + b, 0);
export const X0 = -W / 2, Z0 = -D / 2 - 2;
export const colX = (j) => X0 + CW.slice(0, j).reduce((a, b) => a + b, 0);
export const rowZ = (i) => Z0 + CD.slice(0, i).reduce((a, b) => a + b, 0);
/** What each cell is: 'h' house, 'm' midden, 'c' court (open, an oven and baskets), '.' nothing built (the edge). */
export const KIND = [];
for (let i = 0; i < ROWS; i++) {
  const row = [];
  for (let j = 0; j < COLS; j++) {
    let k = 'h';
    const r = rand(), edge = i === 0 || i === ROWS - 1 || j === 0 || j === COLS - 1;
    if (r < 0.1) k = 'm'; else if (r < 0.19) k = 'c';
    if (edge && rand() < 0.22) k = rand() < 0.5 ? '.' : 'h';
    if (i === LM.i && Math.abs(j - LM.j) <= 1) k = 'h';
    if (i === LM.i - 1 && j === LM.j) k = 'h';
    if (i === LM.i && (j === LM.j - 2 || j === LM.j + 2)) k = 'h';
    row.push(k);
  }
  KIND.push(row);
}
KIND[LM.i][LM.j] = 'L';
/** The roof height of each house cell: about ST, in steps of 0.2 m up or down (neighbours differ by 0.4 m at most) (a step within one's reach: the roofs are walked). */
export const TOP = KIND.map((row, i) => row.map((k, j) => {
  if (k === 'L') return ST;
  const r = rng(i * 97 + j * 13 + 5)();
  return ST + (Math.floor(r * 3) - 1) * 0.2;
}));
export const cellRect = (i, j) => [colX(j), rowZ(i), colX(j) + CW[j], rowZ(i) + CD[i]];
export const CLUSTER = [X0, Z0, X0 + W, Z0 + D];
export const LANDMARK = { i: LM.i, j: LM.j, rect: cellRect(LM.i, LM.j) };
/** Sheep and cattle pens at the east and west edges of the town, of hurdles. */
export const PENS = [
  { rect: [X0 + W + 6, Z0 + 4, X0 + W + 24, Z0 + 20], gate: 'w' },
  { rect: [X0 - 22, Z0 + D - 22, X0 - 5, Z0 + D - 6], gate: 'e' },
];
/** Marsh pools beyond the town: centre, radii. The water stands at MARSH.water in a bed below it. */
export const MARSH = { water: -0.45, bed: -0.95 };
export const POOLS = [[-62, 38, 16, 9], [58, 54, 20, 11], [-48, -62, 14, 10], [66, -40, 12, 8], [4, 82, 22, 6], [-30, 70, 12, 7], [25, -78, 16, 7]];
export const inPool = (x, z, m = 0) => POOLS.some(([cx, cz, a, b]) => ((x - cx) / (a + m)) ** 2 + ((z - cz) / (b + m)) ** 2 < 1);
export const nearTown = (x, z, m = 0) => inRect(CLUSTER, x, z, m) || PENS.some((p) => inRect(p.rect, x, z, m));
/** The ground: flat on the mound, sinking toward the marsh and the plain's edge. */
export function height(x, z) {
  const r = Math.hypot(x, z);
  if (r > RADIUS) return 0;
  const out = Math.max(0, Math.hypot(Math.max(CLUSTER[0] - x, 0, x - CLUSTER[2]), Math.max(CLUSTER[1] - z, 0, z - CLUSTER[3])) - 6);   // metres beyond the town
  let h = (-0.3 * smooth(10, 55, out) + 0.1 * Math.sin(x / 9) * Math.cos(z / 11)) * smooth(0, 14, out);
  for (const [cx, cz, a, b] of POOLS) {
    const d = Math.sqrt(((x - cx) / a) ** 2 + ((z - cz) / b) ** 2);
    if (d < 1.4) h = Math.min(h, MARSH.bed + (h - MARSH.bed) * smooth(0.7, 1.4, d));
  }
  return h * (1 - smooth(RADIUS - 20, RADIUS, r));
}
/** The ground's height near the town (the mound is level under it). */
export const baseY = () => 0;
