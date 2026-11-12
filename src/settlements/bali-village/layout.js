// A Balinese temple village, c. 1900 — the layout (docs/settlements/bali-village.md §2). The temple at the kaja (north) end of the village street,
// the street running south (kelod) through the crossroads to the terraces, a cross lane east–west, about thirty walled compounds, the banjar's
// wantilan, the kulkul and the banyan at the crossing, the paddies stepping down from the village's level core. Pure data. +x east, +z south, y up.

export const RADIUS = 190;
export const CORE = [-98, -156, 98, 134];                 // the level ground under the village; beyond it the terraces
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

// the temple
export const PURA = { x0: -34, x1: 34, zS: -72, zM: -108, zN: -152, y1: 1.2, y2: 2.8, gap: 5, kori: 2.6 };
export const STREET = [-3.5, -72, 3.5, 134];
export const FORECOURT = [-13, -72, 13, -44];
export const LANE = [-98, 6.5, 98, 12.5];
export const WANTILAN = [15, -12, 31, 4];
export const KULKUL = [-22, -6];
export const BANYAN = [-10, 0.5];
export const CHANNEL_X = -4.7;
/** The pura dalem (the temple of the dead) at the kelod end of the street's east side, its split gate on the street (docs/settlements/bali-village.md §4.4). */
export const DALEM = [5.5, 116, 31, 133.5];
export const DALEM_C = [(DALEM[0] + DALEM[2]) / 2, (DALEM[1] + DALEM[3]) / 2];

/** The compounds' lots: { rect, front, seed, rich, gate: [x, z] }. */
let LOTS = null;
export function lots() {
  if (LOTS) return LOTS;
  LOTS = [];
  const rand = rng(1900), add = (rect, front) => {
    const [x0, z0, x1, z1] = rect, gateF = 0.42 + 0.16 * rand(), W = front === 'n' || front === 's' ? x1 - x0 : z1 - z0, u = W * gateF;
    const gate = front === 'e' ? [x1, z0 + u] : front === 'w' ? [x0, z1 - u] : front === 'n' ? [x0 + u, z0] : [x1 - u, z1];
    LOTS.push({ rect, front, seed: Math.floor(rand() * 1e6), rich: rand() < 0.62, gate, gateF });
  };
  const run = (a, b, fn) => {
    const n = Math.max(1, Math.round((b - a) / 19)), e = [a];
    for (let i = 1; i < n; i++) e.push(a + (b - a) * i / n + (rand() - 0.5) * 3);
    e.push(b);
    for (let i = 0; i < n; i++) fn(e[i], e[i + 1]);
  };
  // the village street: west lots front east, east lots front west
  // (the east side stops short of the street's end: the pura dalem stands there)
  for (const [a, b] of [[-46, -14], [14, 133]]) run(a, b, (t0, t1) => { add([-30, t0, -5.5, t1], 'e'); if (t0 < 108) add([5.5, t0, 30, t1], 'w'); });
  // the cross lane: north side fronting south, south side fronting north
  for (const sd of [-1, 1]) run(32, 97, (t0, t1) => {
    const x0 = sd < 0 ? -t1 : t0, x1 = sd < 0 ? -t0 : t1;
    add([x0, -17.5, x1, 5.5], 's'); add([x0, 13.5, x1, 36.5], 'n');
  });
  // the trades: every third lot on the street, a few on the lane, keep a shop in the front of the compound (the street wall opened on it)
  const TRADES = ['warung', 'pande', 'carver', 'weaver', 'offerings', 'potter', 'cloth', 'basket', 'warung', 'carver', 'weaver', 'offerings', 'potter', 'cloth'];
  let k = 0;
  const street = LOTS.filter((l) => l.front === 'e' || l.front === 'w').sort((a, b) => a.rect[1] - b.rect[1] || a.rect[0] - b.rect[0]);
  const lane = LOTS.filter((l) => l.front === 'n' || l.front === 's').sort((a, b) => Math.abs(a.rect[0] + a.rect[2]) - Math.abs(b.rect[0] + b.rect[2]));
  const mark = (l) => {
    const W = l.front === 'n' || l.front === 's' ? l.rect[2] - l.rect[0] : l.rect[3] - l.rect[1], g = W * l.gateF;
    const [u0, u1] = g > W / 2 ? [0.8, g - 2.9] : [g + 2.9, W - 0.8];
    l.shop = { kind: TRADES[k++ % TRADES.length], u0: Math.max(u0, u1 - 6.2), u1, d: 3.0 };
  };
  street.forEach((l, i) => { if (i % 3 === 1) mark(l); });
  lane.forEach((l, i) => { if (i % 4 === 0 && i < 12) mark(l); });
  return LOTS;
}
/** The frame of a lot: P(u, v) → world [x, z], u along the street from the left as one looks from it into the lot, v inward. */
export function lotFrame(l) {
  const [x0, z0, x1, z1] = l.rect, f = l.front;
  return (u, v) => (f === 'n' ? [x0 + u, z0 + v] : f === 's' ? [x1 - u, z1 - v] : f === 'w' ? [x0 + v, z1 - u] : [x1 - v, z0 + u]);
}
/** Unit vector from a lot into its street. */
export const outward = (l) => ({ e: [1, 0], w: [-1, 0], n: [0, -1], s: [0, 1] }[l.front]);
export const inDalem = (x, z, m = 0) => inRect(DALEM, x, z, m);
export const inLot = (x, z, m = 0) => lots().some((l) => inRect(l.rect, x, z, m));
/** Rectangles of the streets (free of houses). */
export const streets = () => [STREET, LANE, FORECOURT];

// the ground: a level core, the terraces beyond it
const rectDist = (x, z) => Math.hypot(Math.max(CORE[0] - x, 0, x - CORE[2]), Math.max(CORE[1] - z, 0, z - CORE[3]));
export const TREAD = 0.7;
export function height(x, z) {
  const r = Math.hypot(x, z);
  if (r > RADIUS) return 0;
  const d = rectDist(x, z);
  if (d <= 0) return 0;
  const wob = (6 * Math.sin(x / 21 + z / 37) + 4 * Math.sin(x / 13 - z / 19)) * smooth(0, 25, d);
  const dd = Math.max(0, d + wob);
  const s = (CORE[1] - z) - Math.max(0, Math.abs(x) - CORE[2]), wN = smooth(-10, 20, s), slope = -0.07 * (1 - wN) + 0.09 * wN;
  const k = slope * dd / TREAD, n = Math.floor(k), f = k - n;
  return (n + smooth(0.75, 1, f)) * TREAD * (1 - smooth(165, RADIUS - 2, r)) * smooth(0, 3, d);
}
/** Flooded paddies: a tread is flooded when its hash says so (a freshly planted paddy). */
export function flooded(x, z, y) { let h = Math.imul(Math.round(y / TREAD) | 0, 374761393) ^ Math.imul(Math.round(Math.atan2(z, x) * 7) | 0, 668265263); h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296 < 0.45; }
export const inPura = (x, z, m = 0) => inRect([PURA.x0, PURA.zN, PURA.x1, PURA.zS], x, z, m);
export const gardenOf = (x, z) => Math.hypot(x, z) < RADIUS - 6 && rectDist(x, z) <= 0;
