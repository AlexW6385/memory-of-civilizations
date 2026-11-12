// Southern Song Lin'an — the geometry of the temple path up Yuelun Hill (§26), pure data from layout.js (no styles), so that the ground's planting may keep clear of it.
import { hill, HILL_PADS, T2 } from './layout.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
void rng;
/** The legs of the path (axis-aligned, metres): from the terrace's north edge up the hill. */
export const HILL_LEGS = [[[-110, T2.rect[1] - 2], [-110, -62]], [[-110, -62], [-160, -62]], [[-160, -62], [-160, -120]], [[-160, -120], [-186, -120]]];
export const WIDTH = 2.4;
let TREADS = null;
/** The treads: [{ rect: [x0, z0, x1, z1], top, leg }], the landings at the turns included (a square of the width, level). */
export function treads() {
  if (TREADS) return TREADS;
  TREADS = [];
  let prev = hill(...HILL_LEGS[0][0]) + 0.05;
  HILL_LEGS.forEach((leg, li) => {
    const [a, b] = leg, ax = Math.abs(b[0] - a[0]) > Math.abs(b[1] - a[1]) ? 0 : 1, sg = Math.sign(b[ax] - a[ax]), len = Math.abs(b[ax] - a[ax]);
    const R = (s0, s1) => { const lo = Math.min(a[ax] + sg * s0, a[ax] + sg * s1), hi = Math.max(a[ax] + sg * s0, a[ax] + sg * s1), c = a[1 - ax]; return ax === 0 ? [lo, c - WIDTH / 2, hi, c + WIDTH / 2] : [c - WIDTH / 2, lo, c + WIDTH / 2, hi]; };
    const pt = (s) => (ax === 0 ? [a[0] + sg * s, a[1]] : [a[0], a[1] + sg * s]);
    let s = li === 0 ? 0 : WIDTH;                                                       // a landing at each turn
    if (li > 0) TREADS.push({ rect: R(0, WIDTH), top: prev, leg: li, landing: true });
    while (s < len - 0.2) {
      let run = 2.2, top = prev;
      for (; run >= 0.5; run -= 0.1) { const g = hill(...pt(s + run / 2)) + 0.05; top = g; if (Math.abs(g - prev) <= 0.22) break; }
      top = Math.max(prev - 0.22, Math.min(prev + 0.22, top));
      const e = Math.min(len, s + run);
      TREADS.push({ rect: R(s, e), top, leg: li });
      prev = top; s = e;
    }
  });
  return TREADS;
}
/** Distance from (x, z) to the path or the pads' level ground (for clearing the planting). */
export function pathDist(x, z) {
  let d = 1e9;
  for (const [a, b] of HILL_LEGS) { const t = Math.max(0, Math.min(1, ((x - a[0]) * (b[0] - a[0]) + (z - a[1]) * (b[1] - a[1])) / ((b[0] - a[0]) ** 2 + (b[1] - a[1]) ** 2))); d = Math.min(d, Math.hypot(x - a[0] - t * (b[0] - a[0]), z - a[1] - t * (b[1] - a[1]))); }
  for (const p of HILL_PADS) d = Math.min(d, Math.hypot(x - p.c[0], z - p.c[1]) - p.r - 1);
  return d;
}

