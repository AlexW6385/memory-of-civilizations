// Small builders the Benin style shares (docs/settlements/benin-city.md §3, §5): red clay walls ridged in bands, lean-to and gabled
// roofs of palm thatch and shingle, posts sheathed in brass with plaques nailed to them, the clay altar with its heads and tusks.
import { box, frustum, lathe, rod } from '../../core/geom.js';
import { orientedBox } from '../../core/build.js';

export function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const WALLS = ['tuff_red', 'stucco_red', 'tuff_red', 'scoria_red'];
export const wallMat = (rand) => WALLS[Math.floor(rand() * WALLS.length)];
/** A box on a plan rectangle: world rect, y0..y1; solid adds the collider. */
export const B = ({ bag, col }, mat, r, y0, y1, solid = false) => { bag.add(mat, box(r[0], y0, r[1], r[2], y1, r[3])); if (solid) col.rect(r, y0, y1); };

/** A wall on the centre line a→b with openings [{ at, w, h }] and, on both faces, ridges in bands (the clay's fluting). */
export function clayWall(ctx, a, b, th, y0, y1, mat, openings = [], ridges = true) {
  const { bag, col } = ctx, Ln = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / Ln, uz = (b[1] - a[1]) / Ln;
  const ops = openings.map((o) => ({ ...o, s0: o.at - o.w / 2, s1: o.at + o.w / 2 })).sort((p, q) => p.s0 - q.s0);
  const piece = (s0, s1, ya, yb, rid) => {
    if (s1 - s0 < 1e-3 || yb - ya < 1e-3) return;
    const p0 = [a[0] + ux * s0, a[1] + uz * s0], p1 = [a[0] + ux * s1, a[1] + uz * s1];
    bag.add(mat, orientedBox(p0, p1, th, ya, yb)); col.segment(p0, p1, th, ya, yb);
    if (ridges && rid) for (let y = ya + 0.7; y < yb - 0.25; y += 0.62) bag.add(mat, orientedBox(p0, p1, th + 0.1, y, y + 0.13));
  };
  let s = 0;
  for (const o of ops) { piece(s, o.s0, y0, y1, true); piece(o.s0, o.s1, y0 + o.h, y1, false); s = o.s1; }
  piece(s, Ln, y0, y1, true);
}
/** The thatch or shingle of a gabled roof over rect, the ridge along x or z, eaves over by `over`. */
export function gable(ctx, rect, y, rise, mat, ridge = 'x', over = 0.5) {
  const [x0, z0, x1, z1] = rect, w = ridge === 'x' ? z1 - z0 : x1 - x0, r = [x0 - over, z0 - over, x1 + over, z1 + over], ins = (w + 2 * over) / 2;
  ctx.bag.add(mat, frustum(r, y, y + rise, ridge === 'x' ? 0 : ins, ridge === 'x' ? 0 : ins, ridge === 'x' ? ins : 0, ridge === 'x' ? ins : 0, { noBottom: true }));
}
/** A lean-to over rect with its low edge on `low` ('xn' | 'xp' | 'zn' | 'zp'), from yLow up to yHigh; a ceiling of timber below. */
export function lean(ctx, rect, low, yLow, yHigh, mat, over = 0.4, ceil = true) {
  const [x0, z0, x1, z1] = rect, ins = [0, 0, 0, 0], k = { xn: 0, xp: 1, zn: 2, zp: 3 }[low];
  ins[k] = k < 2 ? x1 - x0 + 2 * over : z1 - z0 + 2 * over;
  ctx.bag.add(mat, frustum([x0 - over, z0 - over, x1 + over, z1 + over], yLow, yHigh, ...ins, { noBottom: true }));
  if (ceil) ctx.bag.add('timber', box(x0 - over, yLow - 0.08, z0 - over, x1 + over, yLow, z1 + over));
}
/** A hipped roof of rect, pitched `rise` (a pyramid when square). */
export function hip(ctx, rect, y, rise, mat, over = 0.5) {
  const [x0, z0, x1, z1] = rect, w = x1 - x0 + 2 * over, d = z1 - z0 + 2 * over, i = Math.min(w, d) / 2 - 0.05;
  ctx.bag.add(mat, frustum([x0 - over, z0 - over, x1 + over, z1 + over], y, y + rise, i, i, i, i, { noBottom: true }));
}
/** A tall pillar sheathed in cast brass: post of radius r from y to y+h, a carved collar and capital. */
export function pillar(ctx, x, z, y, h, r = 0.21) {
  const { bag, col } = ctx;
  bag.add('bronze', lathe([[r * 1.25, 0], [r * 1.25, 0.12], [r, 0.2], [r, h - 0.3], [r * 1.2, h - 0.2], [r * 1.35, h - 0.1], [r * 1.35, h], [0.001, h]], 10, null, x, y, z));
  bag.add('wood_dark', lathe([[r * 1.45, 0], [r * 1.45, 0.14], [0.001, 0.14]], 8, null, x, y - 0.14, z));
  col.circle(x, z, r * 1.3, y, y + h);
}
/** A brass plaque nailed to a pillar or wall, its face toward 'n' | 's' | 'e' | 'w' at (x, z) on the surface, centre height y: a framed field, a figure (the Oba or a warrior with two attendants). */
export function plaque(ctx, x, y, z, face, seed, w = 0.4, h = 0.5) {
  const { bag } = ctx, rand = rng(seed), t = 0.018;
  const dir = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] }[face], al = [-dir[1], dir[0]];
  const P = (u, v, d) => [x + al[0] * u + dir[0] * d, y + v, z + al[1] * u + dir[1] * d];
  const slab = (u0, v0, u1, v1, d0, d1, m = 'bronze') => {
    const a = P(u0, v0, d0), b = P(u1, v1, d1), r = [Math.min(a[0], b[0]), Math.min(a[2], b[2]), Math.max(a[0], b[0]), Math.max(a[2], b[2])];
    if (r[2] - r[0] < 1e-3) { r[0] -= 0.002; r[2] += 0.002; }
    if (r[3] - r[1] < 1e-3) { r[1] -= 0.002; r[3] += 0.002; }
    bag.add(m, box(r[0], Math.min(a[1], b[1]), r[1], r[2], Math.max(a[1], b[1]), r[3]));
  };
  slab(-w / 2, -h / 2, w / 2, h / 2, 0, t, 'gilt_bronze');
  for (const [u0, v0, u1, v1] of [[-w / 2, -h / 2, w / 2, -h / 2 + 0.03], [-w / 2, h / 2 - 0.03, w / 2, h / 2], [-w / 2, -h / 2, -w / 2 + 0.03, h / 2], [w / 2 - 0.03, -h / 2, w / 2, h / 2]]) slab(u0, v0, u1, v1, t, t + 0.014, 'bronze');
  const big = 0.1 + rand() * 0.02;
  slab(-big * 0.5, -h * 0.4, big * 0.5, h * 0.12, t, t + 0.03); slab(-big * 0.9, -h * 0.1, -big * 0.5, h * 0.05, t, t + 0.022); slab(big * 0.5, -h * 0.1, big * 0.9, h * 0.05, t, t + 0.022);
  slab(-big * 0.45, h * 0.12, big * 0.45, h * 0.33, t, t + 0.034);
  slab(-big * 0.7, h * 0.33, big * 0.7, h * 0.38, t, t + 0.03);
  for (const s of [-1, 1]) { const cu = s * w * 0.32; slab(cu - 0.025, -h * 0.4, cu + 0.025, -h * 0.05, t, t + 0.022); slab(cu - 0.03, -h * 0.05, cu + 0.03, h * 0.05, t, t + 0.022); }
}
/** The commemorative head of an Oba: a cast head with its coral-bead collar and cap, and the carved tusk set in its top. */
export function head(ctx, x, y, z, rot, seed, tusk = true) {
  const { bag } = ctx, rand = rng(seed);
  const g = lathe([[0.2, 0], [0.2, 0.05], [0.15, 0.12], [0.145, 0.34], [0.15, 0.46], [0.16, 0.52], [0.12, 0.56], [0.001, 0.57]], 10, null, 0, 0, 0);
  g.translate(x, y, z); bag.add('bronze', g);
  const c = lathe([[0.2, 0.04], [0.23, 0.07], [0.23, 0.2], [0.17, 0.22], [0.17, 0.05]], 10, null, 0, 0, 0); c.translate(x, y, z); bag.add('wall_red', c);
  if (tusk) {
    const h = 1.0 + rand() * 0.3, pts = [], k = [Math.cos(rot), -Math.sin(rot)];
    for (let i = 0; i <= 5; i++) { const t = i / 5; pts.push([x + k[0] * t * t * 0.28, y + 0.56 + t * h, z + k[1] * t * t * 0.28]); }
    for (let i = 0; i < 5; i++) bag.add('ivory', rod(pts[i], pts[i + 1], 0.05 - i * 0.006, 6));
  }
}
/** The brass bird on a spire: body, tail, two spread wings, a head. */
export function bird(ctx, x, y, z, s = 1, rot = 0) {
  const { bag } = ctx, g = (a) => { a.rotateY(rot); a.translate(x, y, z); bag.add('bronze', a); };
  g(box(-0.1 * s, 0.08 * s, -0.22 * s, 0.1 * s, 0.26 * s, 0.2 * s)); g(box(-0.04 * s, 0.1 * s, 0.2 * s, 0.04 * s, 0.16 * s, 0.5 * s)); g(box(-0.05 * s, 0.22 * s, -0.36 * s, 0.05 * s, 0.34 * s, -0.2 * s));
  g(box(-0.55 * s, 0.2 * s, -0.12 * s, -0.08 * s, 0.22 * s, 0.14 * s)); g(box(0.08 * s, 0.2 * s, -0.12 * s, 0.55 * s, 0.22 * s, 0.14 * s));
}
/** A brass snake running down a face: a wavy body of short rods from (x, yTop, z) down h, along `al` the face's across-direction, standing off `dir`. */
export function snake(ctx, x, yTop, z, h, al, dir, amp = 0.35, r = 0.09) {
  const pts = [];
  for (let i = 0; i <= 14; i++) { const t = i / 14, u = Math.sin(t * Math.PI * 4) * amp; pts.push([x + al[0] * u + dir[0] * 0.1, yTop - t * h, z + al[1] * u + dir[1] * 0.1]); }
  for (let i = 0; i < 14; i++) ctx.bag.add('bronze', rod(pts[i], pts[i + 1], r * (1 - i / 40), 6));
  const hd = pts[14]; ctx.bag.add('bronze', lathe([[0.001, 0], [r * 1.5, 0.05], [r * 1.5, 0.25], [r * 0.8, 0.34], [0.001, 0.36]], 6, null, hd[0], hd[1] - 0.3, hd[2]));
}
/** A clay altar of rect: a low platform (two steps) and on it a row of heads with tusks and a bell or two. */
export function altar(ctx, rect, facing, seed, heads = 5) {
  const { bag } = ctx, rand = rng(seed), [x0, z0, x1, z1] = rect;
  B(ctx, 'tuff_red', [x0, z0, x1, z1], 0, 0.45, true);
  B(ctx, 'stucco_red', [x0 + 0.1, z0 + 0.1, x1 - 0.1, z1 - 0.1], 0.45, 0.62, false);
  const alongX = facing === 's' || facing === 'n', n = heads, L = alongX ? x1 - x0 : z1 - z0, rot = { s: 0, n: Math.PI, e: Math.PI / 2, w: -Math.PI / 2 }[facing];
  for (let i = 0; i < n; i++) {
    const u = (i + 0.5) / n * L, x = alongX ? x0 + u : (x0 + x1) / 2, z = alongX ? (z0 + z1) / 2 : z0 + u;
    head(ctx, x, 0.62, z, rot, seed * 7 + i, true);
    if (rand() < 0.5) bag.add('bronze', lathe([[0.001, 0], [0.07, 0.02], [0.06, 0.16], [0.02, 0.2]], 8, null, x + (alongX ? 0.38 : 0), 0.62, z + (alongX ? 0 : 0.38)));
  }
}
export { box, frustum, lathe, rod, orientedBox };
