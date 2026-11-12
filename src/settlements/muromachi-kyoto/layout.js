// Muromachi Kyoto (c. 1490) — the layout (docs/settlements/muromachi-kyoto.md §2): the grid of the city folded into one disc —
// blocks of machiya on streets of earth, a stone-lined stream with its bridges on the east, beyond it Ginkaku-ji
// (Jishō-ji) under the Higashiyama hills, in the north-west Ryōan-ji with its rock garden, in the south a shrine with a
// Noh stage, a tea hut in a block's yard. Pure data. +x east, +z south.

export const RADIUS = 330;
export const SW = 3.5;                                           // half the width of a street
export const NS = [-250, -180, -110, -40, 30, 90];              // the north–south streets (x)
export const EW = [-170, -100, -30, 40, 100, 170, 240];          // the east–west streets (z)
export const STREAM = { x0: 96.5, x1: 101.5, level: -0.55, bed: -1.9, top: 0.15 };
export const GINKAKU = { rect: [115, -80, 278, 92], gate: [190, 92], pond: { c: [200, -3], r: [50, 10], level: -0.4, bed: -1.5 }, kannon: [200, -26], togudo: [136, -4] };
export const RYOAN = { rect: [-232, -206, -116, -104], gate: [-165, -104], garden: [-177.5, -152, -152.5, -142], hojo: [-165, -132.6], pond: { c: [-165, -190], r: [46, 14], level: -0.4, bed: -1.4 } };
export const SHRINE = { rect: [-10, 176, 70, 252], torii: [30, 182], hall: [30, 232], noh: [52, 212] };
export const TEA = { hut: [-153, -8] };
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const far = (x, z, m) => Math.hypot(x, z) > RADIUS - m;
const farRect = (r, m) => Math.max(...[[r[0], r[1]], [r[2], r[1]], [r[0], r[3]], [r[2], r[3]]].map(([a, b]) => Math.hypot(a, b))) > RADIUS - m;
const PRECINCTS = [GINKAKU.rect, RYOAN.rect, SHRINE.rect];
const inPrecinct = (r, m = 0) => PRECINCTS.some((p) => r[2] > p[0] - m && r[0] < p[2] + m && r[3] > p[1] - m && r[1] < p[3] + m);

let STREETS = null;
/** Street rectangles [x0, z0, x1, z1] (earth): the grid, the way to Ginkaku-ji over the stream, the shrine's approach, the temple's paths. */
export function streets() {
  if (STREETS) return STREETS;
  STREETS = [];
  const xa = NS[0] - SW, xb = NS[NS.length - 1] + SW, za = EW[0] - SW, zb = EW[EW.length - 1] + SW;
  for (const z of EW) { const r = [xa, z - SW, xb, z + SW]; if (!inPrecinct(r)) STREETS.push(r); else { /* split round the precincts */ let seg = [[xa, xb]]; for (const p of PRECINCTS) if (z > p[1] - SW && z < p[3] + SW) seg = seg.flatMap(([a, b]) => (p[2] <= a || p[0] >= b ? [[a, b]] : [[a, p[0] - 1], [p[2] + 1, b]].filter(([c, d]) => d - c > 6))); for (const [a, b] of seg) STREETS.push([a, z - SW, b, z + SW]); } }
  for (const x of NS) { let seg = [[za, zb]]; for (const p of PRECINCTS) if (x > p[0] - SW && x < p[2] + SW) seg = seg.flatMap(([a, b]) => (p[3] <= a || p[1] >= b ? [[a, b]] : [[a, p[1] - 1], [p[3] + 1, b]].filter(([c, d]) => d - c > 6))); for (const [a, b] of seg) STREETS.push([x - SW, a, x + SW, b]); }
  STREETS.push([xb, 100 - SW, 190 + SW, 100 + SW]);                                // over the stream to Ginkaku-ji's gate
  STREETS.push([GINKAKU.gate[0] - 2.5, 92, GINKAKU.gate[0] + 2.5, 100]);
  STREETS.push([RYOAN.gate[0] - 2.5, RYOAN.rect[3] - 1, RYOAN.gate[0] + 2.5, RYOAN.rect[3] + 3 + SW]);
  STREETS.push([SHRINE.torii[0] - 3, SHRINE.rect[1] - 2, SHRINE.torii[0] + 3, SHRINE.hall[1] - 0.5]);
  return (STREETS = STREETS.filter((r) => r[2] - r[0] > 2 && r[3] - r[1] > 2 && !farRect(r, 18)));
}
export const BRIDGES = [[99, 100]];            // [x, z] of each bridge over the stream (the stream runs along z; the bridge spans x)
export const onBridge = (x, z, m = 0) => BRIDGES.some(([bx, bz]) => Math.abs(x - bx) < 6 + m && Math.abs(z - bz) < 3.2 + m);
export const inStream = (x, z, m = 0) => x > STREAM.x0 - m && x < STREAM.x1 + m && Math.hypot(x, z) < RADIUS - 24;
export const inPond = (x, z, m = 0) => [GINKAKU.pond, RYOAN.pond].some((p) => Math.hypot((x - p.c[0]) / (p.r[0] + m), (z - p.c[1]) / (p.r[1] + m)) < 1);
export const pondOf = (x, z) => [GINKAKU.pond, RYOAN.pond].find((p) => Math.hypot((x - p.c[0]) / p.r[0], (z - p.c[1]) / p.r[1]) < 1.2);

let LOTS = null;
/** The machiya: fronts of 5–7.5 m on all four sides of every block, 10–12 m deep; { at, facing, w, d, seed, open, trade, rect }. */
export function lots() {
  if (LOTS) return LOTS;
  LOTS = [];
  const rand = rng(1490), TR = ['cloth', 'sake', 'pottery', 'rice', 'tea', 'lacquer', 'smith', 'dye', 'paper', 'sandals', 'food', 'doso', 'wood'];
  for (let i = 0; i < NS.length - 1; i++) for (let j = 0; j < EW.length - 1; j++) {
    const bx0 = NS[i] + SW, bx1 = NS[i + 1] - SW, bz0 = EW[j] + SW, bz1 = EW[j + 1] - SW, block = [bx0, bz0, bx1, bz1];
    if (inPrecinct(block, -0.5) || farRect(block, 30)) continue;
    if (i === NS.length - 2 && false) continue;
    const D = () => 10 + rand() * 2;
    const row = (a0, a1, mk) => { for (let u = a0; u < a1 - 5;) { const w = 5 + rand() * 2.5; if (u + w > a1) break; mk(u + w / 2, w, D()); u += w + 0.25; } };
    row(bx0, bx1, (xc, w, d) => lots_push({ at: [xc, bz0], facing: 'n', w, d, rect: [xc - w / 2, bz0, xc + w / 2, bz0 + d] }));
    row(bx0, bx1, (xc, w, d) => lots_push({ at: [xc, bz1], facing: 's', w, d, rect: [xc - w / 2, bz1 - d, xc + w / 2, bz1] }));
    row(bz0 + 12.5, bz1 - 12.5, (zc, w, d) => lots_push({ at: [bx0, zc], facing: 'w', w, d, rect: [bx0, zc - w / 2, bx0 + d, zc + w / 2] }));
    row(bz0 + 12.5, bz1 - 12.5, (zc, w, d) => lots_push({ at: [bx1, zc], facing: 'e', w, d, rect: [bx1 - d, zc - w / 2, bx1, zc + w / 2] }));
  }
  function lots_push(l) { if (!farRect(l.rect, 22)) LOTS.push({ ...l, seed: Math.floor(rand() * 1e6), trade: TR[Math.floor(rand() * TR.length)] }); }
  return LOTS;
}
/** The yard of each block, inside its rows of houses: [x0, z0, x1, z1]. */
export function yards() {
  const Y = [];
  for (let i = 0; i < NS.length - 1; i++) for (let j = 0; j < EW.length - 1; j++) {
    const b = [NS[i] + SW + 12.5, EW[j] + SW + 12.5, NS[i + 1] - SW - 12.5, EW[j + 1] - SW - 12.5];
    if (!inPrecinct(b, 14) && !farRect(b, 34) && b[2] - b[0] > 6 && b[3] - b[1] > 6) Y.push(b);
  }
  return Y;
}
let GRID = null;
export function inLot(x, z, m = 0) {
  if (!GRID) { GRID = new Map(); for (const h of lots()) for (let i = Math.floor((h.rect[0] - 3) / 20); i <= Math.floor((h.rect[2] + 3) / 20); i++) for (let j = Math.floor((h.rect[1] - 3) / 20); j <= Math.floor((h.rect[3] + 3) / 20); j++) { const k = i + ',' + j; if (!GRID.has(k)) GRID.set(k, []); GRID.get(k).push(h); } }
  const l = GRID.get(Math.floor(x / 20) + ',' + Math.floor(z / 20));
  return !!l && l.some((h) => inRect(h.rect, x, z, m));
}
let SGRID = null;
export function onStreet(x, z, m = 0) {
  if (!SGRID) { SGRID = new Map(); for (const r of streets()) for (let i = Math.floor((r[0] - 3) / 40); i <= Math.floor((r[2] + 3) / 40); i++) for (let j = Math.floor((r[1] - 3) / 40); j <= Math.floor((r[3] + 3) / 40); j++) { const k = i + ',' + j; if (!SGRID.has(k)) SGRID.set(k, []); SGRID.get(k).push(r); } }
  const l = SGRID.get(Math.floor(x / 40) + ',' + Math.floor(z / 40));
  return !!l && l.some((r) => inRect(r, x, z, m));
}
export const inPrecinctAt = (x, z, m = 0) => PRECINCTS.some((p) => inRect(p, x, z, m));
/** Which houses are open inside: nearly half (the shops), the tea-sellers' and eating-houses always. */
export const isOpen = (l) => l.seed % 20 < 9 || l.trade === 'tea' || l.trade === 'food';
export { far };
