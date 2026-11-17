// The patterned onion domes of St Basil's (docs/settlements/muscovy.md §5.5): each of the eight chapels has its own
// dome — twisting ribs, zigzag chevrons, diamond-pointed facets, overlapping scales, a diagonal lattice, vertical
// gadroons — modelled as real relief of the sheet (a raised pattern of a few centimetres to a dozen, in a second
// colour where it stands out), not a flat colouring.

import { fromTriangles } from '../../core/geom.js';

const TAU = Math.PI * 2;
/** The onion's outline (radius, height) at t in 0..1 from the drum's neck to the tip, a Catmull-Rom curve through the profile points. */
function outline(r) {
  const P = [[r * 0.8, 0], [r * 0.9, r * 0.12], [r * 1.12, r * 0.5], [r * 1.14, r * 0.85], [r * 0.9, r * 1.25], [r * 0.5, r * 1.65], [r * 0.2, r * 2.0], [0.05, r * 2.3]];
  const n = P.length - 1;
  return (t) => {
    const f = Math.min(t, 0.99999) * n, i = Math.floor(f), u = f - i, g = (k) => P[Math.max(0, Math.min(n, k))];
    const cr = (c) => { const p0 = g(i - 1)[c], p1 = g(i)[c], p2 = g(i + 1)[c], p3 = g(i + 2)[c]; return 0.5 * (2 * p1 + (-p0 + p2) * u + (2 * p0 - 5 * p1 + 4 * p2 - p3) * u * u + (-p0 + 3 * p1 - 3 * p2 + p3) * u ** 3); };
    return [Math.max(0.02, cr(0)), cr(1)];
  };
}
const fr = (x) => x - Math.floor(x);
const tri = (x) => Math.abs(fr(x) * 2 - 1);                     // a triangle wave 0..1..0
const sm = (x) => x * x * (3 - 2 * x);

/**
 * The patterns: each returns [d, c] for the angle fraction a (0..1 round the dome) and t (0..1 up it): d the relief in 0..1 (times the amplitude), c 1 where the second colour goes.
 * `grid` gives [NS, NT]: the sampling that resolves the pattern.
 */
export const PATTERNS = {
  spiral: { grid: [72, 30], f: (a, t) => { const w = 0.5 + 0.5 * Math.cos(TAU * (12 * a + 0.9 * t)); const d = w ** 1.6; return [d, d > 0.55 ? 1 : 0]; } },
  spiralR: { grid: [72, 30], f: (a, t) => { const w = 0.5 + 0.5 * Math.cos(TAU * (10 * a - 1.1 * t)); const d = sm(Math.min(1, w * 1.4)); return [d, w > 0.72 ? 1 : 0]; } },
  zigzag: { grid: [96, 40], f: (a, t) => { const zz = 0.5 * tri(t * 4.5); const b = fr(12 * a + zz); const on = b < 0.5; return [on ? 1 : 0, on ? 1 : 0]; } },
  facets: { grid: [32, 24], f: (a, t) => { const u = fr(a * 16), v = fr(t * 12), d = 1 - Math.max(Math.abs(2 * u - 1), Math.abs(2 * v - 1)); return [d, (Math.floor(a * 16) + Math.floor(t * 12)) % 2 ? 1 : 0]; } },
  scales: { grid: [96, 36], f: (a, t) => { const m = 9, row = Math.floor(t * m), v = fr(t * m), u = fr(a * 14 + (row % 2) * 0.5); const e = 0.6 + 0.4 * Math.cos(TAU * (u - 0.5)); return [v ** 0.7 * e, row % 2 ? 1 : 0]; } },
  lattice: { grid: [96, 40], f: (a, t) => { const p = 12 * a + 2.2 * t, q = 12 * a - 2.2 * t; const e = Math.max(0.5 + 0.5 * Math.cos(TAU * p), 0.5 + 0.5 * Math.cos(TAU * q)); const d = sm(Math.max(0, (e - 0.7) / 0.3)); return [d, d > 0.5 ? 1 : 0]; } },
  gadroon: { grid: [64, 20], f: (a) => { const w = tri(a * 14), d = 1 - w; return [Math.sqrt(Math.max(0, d)), d > 0.8 ? 1 : 0]; } },
  diamonds: { grid: [48, 24], f: (a, t) => { const k = 8, u = fr(a * k), v = fr(t * 6 + (Math.floor(a * k) % 2) * 0.5), d = 1 - (Math.abs(2 * u - 1) + Math.abs(2 * v - 1)) * 0.8; return [Math.max(0, d), d > 0.45 ? 1 : 0]; } },
};

/**
 * A dome of radius r on its neck at height y0, in relief: the sheet in material `ma`, the raised second colour in `mb`.
 * `amp` is the relief's height in metres at most. Returns nothing; adds two meshes to the bag.
 */
export function patternDome(bag, x, y0, z, r, ma, mb, pattern, amp = r * 0.06) {
  const pat = PATTERNS[pattern]; if (!pat) return;
  const [NS, NT] = pat.grid, O = outline(r), P = [], C = [];
  for (let j = 0; j <= NT; j++) {
    const t = j / NT, [rho, h] = O(t), win = Math.sin(Math.PI * Math.min(1, t * 1.05)) ** 0.5 * Math.min(1, t * 8);
    const row = [], crow = [];
    for (let s = 0; s <= NS; s++) {
      const a = s / NS, th = a * TAU, [d, c] = pat.f(s === NS ? 0 : a, t);
      const rr = (j === 0 || j === NT) ? rho : rho + d * amp * win;
      row.push([x + Math.cos(th) * rr, y0 + h, z + Math.sin(th) * rr]); crow.push(c);
    }
    P.push(row); C.push(crow);
  }
  const A = [], B = [];
  for (let j = 0; j < NT; j++) for (let s = 0; s < NS; s++) {
    const a = P[j][s], b = P[j][s + 1], c = P[j + 1][s + 1], d = P[j + 1][s], out = C[j][s] + C[j][s + 1] + C[j + 1][s] + C[j + 1][s + 1] >= 3 ? B : A;
    out.push(...a, ...c, ...b, ...a, ...d, ...c);
  }
  if (A.length) bag.add(ma, fromTriangles(A));
  if (B.length) bag.add(mb, fromTriangles(B));
}
