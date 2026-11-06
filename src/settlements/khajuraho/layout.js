// Khajuraho about 1050 — the layout (docs/settlements/khajuraho.md §2): the Western Group of the
// Chandela temples on their terraces — Kandariya Mahadeva, the Jagadambi and Chitragupta temples
// in a row to its north, Lakshmana with its four corner shrines, Vishvanatha with two; the
// Shivsagar tank to the south; the village to the east among mango and neem trees. Pure data.
// +x east, +z south.

export const RADIUS = 360;
export const TEMPLES = [
  { c: [-70, -60], len: 24, w: 13, h: 27, jagati: 4 },       // Kandariya Mahadeva
  { c: [-70, -14], len: 16, w: 9, h: 22, jagati: 3.5 },      // Jagadambi
  { c: [-70, 26], len: 16, w: 9, h: 22, jagati: 3.5 },       // Chitragupta
  // Lakshmana on its great platform (10 ft high, its sides carved with the life of the kingdom), a shrine at each corner
  { c: [20, -90], len: 22, w: 12, h: 28, jagati: 3.1, corners: true, frieze: true, terrace: [7, -103, 50, -77] },
  { c: [40, -10], len: 20, w: 11, h: 27, jagati: 4, corners: true, terrace: [28, -22, 67, 2] },   // Vishvanatha
];
/** The Varaha pavilion facing Lakshmana across the way east of its stair. */
export const VARAHA = [62, -95, 74, -85];
export const TANK = { c: [40, 150], r: [75, 38], level: -1.5 };
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
export const tankD = (x, z) => (Math.hypot((x - TANK.c[0]) / TANK.r[0], (z - TANK.c[1]) / TANK.r[1]) - 1) * Math.min(...TANK.r);
export const inTank = (x, z) => tankD(x, z) < 0;
export function height(x, z) {
  const d = tankD(x, z);
  return (d < 6 ? -3.5 * smooth(6, -2, d) : 0) * (1 - smooth(RADIUS - 40, RADIUS - 5, Math.hypot(x, z)));
}
export const nearTemple = (x, z, m = 0) => TEMPLES.some((t) => x > t.c[0] - t.w - m && x < t.c[0] + t.len + 12 + m && Math.abs(z - t.c[1]) < t.w + m);
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
let LOTS = null;
export function lots() {
  if (LOTS) return LOTS;
  LOTS = [];
  const rand = rng(1050);
  for (let x = 100; x < 330; x += 13) for (let z = -300; z < 300; z += 12) {
    const w = 8 + rand() * 3, d = 6 + rand() * 2, cx = x + w / 2, cz = z + d / 2;
    if (Math.hypot(cx, cz) > RADIUS - 45 || tankD(cx, cz) < 12 || rand() < 0.4) continue;
    LOTS.push({ rect: [x, z, x + w, z + d], seed: Math.floor(rand() * 1e6), y: 0, foot: -0.2, front: rand() < 0.5 ? 'w' : 's' });
  }
  return LOTS;
}
export const inLot = (x, z, m = 0) => lots().some((l) => inRect(l.rect, x, z, m));
