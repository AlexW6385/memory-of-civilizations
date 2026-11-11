// Shared helpers of the Muromachi style: a seeded generator, boxes by corners, a frame that turns a
// building built facing south (+z) to any of the four directions, tatami, roofs and rings of eaves.
import { box, lathe, fromTriangles } from '../../core/geom.js';

export function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
export const WD = 'wood_dark', PL = 'plaster_white', BARK = 'roof_bark', TM = 'timber', MAT = 'reed_mat';
const TURN = { s: 0, e: Math.PI / 2, n: Math.PI, w: -Math.PI / 2 };

/** Runs fn(b, c, T) with a bag and collider sink in the building's own frame (origin el.at, front +z), put into the world turned to el.facing. */
export function local(el, ctx, fn) {
  const th = TURN[el.facing || 's'], co = Math.round(Math.cos(th)), si = Math.round(Math.sin(th)), [ax, az] = el.at;
  const P = (x, z) => [ax + x * co + z * si, az - x * si + z * co];
  const bag = { add: (m, g, ...r) => { g.rotateY(th); g.translate(ax, 0, az); return ctx.bag.add(m, g, ...r); } };
  const R = (r) => { const a = P(r[0], r[1]), b = P(r[2], r[3]); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; };
  const DIR = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] };
  const col = {
    rect: (r, y0, y1) => ctx.col.rect(R(r), y0, y1),
    floor: (r, y, tag) => ctx.col.floor(R(r), y, tag),
    circle: (x, z, r, y0, y1) => { const p = P(x, z); ctx.col.circle(p[0], p[1], r, y0, y1); },
    segment: (a, b, t, y0, y1) => ctx.col.segment(P(...a), P(...b), t, y0, y1),
    ramp: (r, y0, y1, d) => { const v = DIR[d], w = [v[0] * co + v[1] * si, -v[0] * si + v[1] * co]; ctx.col.ramp(R(r), y0, y1, Math.abs(w[0]) > 0.5 ? (w[0] > 0 ? 'e' : 'w') : (w[1] > 0 ? 's' : 'n')); },
  };
  const B = (m, x0, y0, z0, x1, y1, z1) => bag.add(m, box(Math.min(x0, x1), Math.min(y0, y1), Math.min(z0, z1), Math.max(x0, x1), Math.max(y0, y1), Math.max(z0, z1)));
  const L = (m, prof, seg, x, y, z) => bag.add(m, lathe(prof, seg, null, x, y, z));
  const T = (m, tris) => bag.add(m, fromTriangles(tris));
  const f = (...a) => fn({ bag, col, B, L, T, P, ctx }, ...a);
  return f(el.y ?? 0);
}

/** Tatami over [x0, x1] × [z0, z1] at floor height y: mats of 0.9 × 1.8 with their dark borders laid in the Muromachi way. */
export function tatami(B, x0, x1, z0, z1, y, alongX = true) {
  B(MAT, x0, y - 0.04, z0, x1, y, z1);
  const a0 = alongX ? x0 : z0, a1 = alongX ? x1 : z1, b0 = alongX ? z0 : x0, b1 = alongX ? z1 : x1;
  for (let u = a0 + 1.8; u < a1 - 0.3; u += 1.8) alongX ? B('cloth_black', u - 0.02, y, z0, u + 0.02, y + 0.004, z1) : B('cloth_black', x0, y, u - 0.02, x1, y + 0.004, u + 0.02);
  for (let v = b0 + 0.9; v < b1 - 0.3; v += 0.9) alongX ? B('cloth_black', x0, y + 0.004, v - 0.018, x1, y + 0.006, v + 0.018) : B('cloth_black', v - 0.018, y + 0.004, z0, v + 0.018, y + 0.006, z1);
}

/** Two-sided quad pushed into a triangle list. */
export function quad2(o, a, b, c, d) { o.push(...a, ...b, ...c, ...a, ...c, ...d, ...a, ...c, ...b, ...a, ...d, ...c); }

/** A hipped ring of eaves round a core: outer rect [X0, Z0, X1, Z1] at yOut, inner rect at yIn, a thickness t under it. */
export function eaveRing(T, mat, soff, [X0, Z0, X1, Z1], [x0, z0, x1, z1], yOut, yIn, t = 0.22) {
  const top = [], und = [], fas = [];
  const sides = [[[X0, Z1], [X1, Z1], [x1, z1], [x0, z1]], [[X1, Z1], [X1, Z0], [x1, z0], [x1, z1]], [[X1, Z0], [X0, Z0], [x0, z0], [x1, z0]], [[X0, Z0], [X0, Z1], [x0, z1], [x0, z0]]];
  for (const [a, b, c, d] of sides) {
    quad2(top, [a[0], yOut, a[1]], [b[0], yOut, b[1]], [c[0], yIn, c[1]], [d[0], yIn, d[1]]);
    quad2(und, [a[0], yOut - t, a[1]], [b[0], yOut - t, b[1]], [c[0], yIn - t, c[1]], [d[0], yIn - t, d[1]]);
    quad2(fas, [a[0], yOut - t, a[1]], [b[0], yOut - t, b[1]], [b[0], yOut, b[1]], [a[0], yOut, a[1]]);
  }
  T(mat, top); T(soff, und.concat(fas));
}
