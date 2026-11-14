// Balinese style kit (docs/settlements/bali-village.md §3–§5): boxes in world axes, the concave hip roof of thatch or ijuk,
// steps, round posts, offerings, poleng cloth. Everything axis-aligned; positions in the plan's metres.
import { box, lathe, fromTriangles, rod } from '../../core/geom.js';

export const rng = (seed) => { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); };
export const TAU = Math.PI * 2;
export const pick = (rand, a) => a[Math.floor(rand() * a.length) % a.length];

/** A box in world axes; solid adds a collider. */
export function bx(ctx, mat, x0, y0, z0, x1, y1, z1, solid = false) {
  if (x1 - x0 < 1e-4 || z1 - z0 < 1e-4 || y1 - y0 < 1e-4) return;
  ctx.bag.add(mat, box(Math.min(x0, x1), y0, Math.min(z0, z1), Math.max(x0, x1), y1, Math.max(z0, z1)));
  if (solid) ctx.col.rect([x0, z0, x1, z1], y0, y1);
}
/** A round post (a lathe) with a square foot stone. */
export function post(ctx, mat, x, z, y0, y1, r = 0.12, solid = true) {
  ctx.bag.add(mat, lathe([[r * 1.05, 0], [r, 0.05], [r * 0.92, y1 - y0]], 7, null, x, y0, z));
  if (solid) ctx.col.circle(x, z, r, y0, y1);
}
const quadUp = (out, a, b, c, d, up = true) => { if (up) out.push(...a, ...c, ...b, ...a, ...d, ...c); else out.push(...a, ...b, ...c, ...a, ...c, ...d); };

/** The height of a hipped roof's top above its eave at the offset (dx, dz) from its centre; the same curve thatchHip draws. */
export function hipHeight(A, B, R, pw, dx, dz) {
  const s = Math.min(A, B);
  return R * Math.pow(Math.max(0, Math.min(1, Math.min((A - Math.abs(dx)) / s, (B - Math.abs(dz)) / s))), pw);
}

/**
 * The hipped roof of thatch or ijuk: { c [x, z], A, B (half extents along x and z at the eave), y (eave), rise, pow (concave when > 1), mat, th (the thickness of the thatch) }.
 * The ridge runs along the longer side; the grid takes the hip lines as breaks. Open below (the soffit shows the same material darkened by the shade).
 */
export function thatchHip(ctx, el) {
  const { bag } = ctx, [cx, cz] = el.c, A = el.A, B = el.B, y = el.y, R = el.rise, pw = el.pow ?? 1.3, th = el.th ?? 0.28, mat = el.mat ?? 'thatch_palm';
  const s = Math.min(A, B);
  const h = (dx, dz) => R * Math.pow(Math.max(0, Math.min(1, Math.min((A - Math.abs(dx)) / s, (B - Math.abs(dz)) / s))), pw);
  const brk = (L) => { const k = new Set([-L, L]); for (let i = 1; i < 5; i++) { k.add(-L + s * i / 5); k.add(L - s * i / 5); } return [...k].filter((v) => Math.abs(v) <= L + 1e-6).sort((a, b) => a - b); };
  const X = brk(A), Z = brk(B), top = [], under = [];
  for (let i = 0; i < X.length - 1; i++) for (let j = 0; j < Z.length - 1; j++) {
    const x0 = X[i], x1 = X[i + 1], z0 = Z[j], z1 = Z[j + 1];
    if (x1 - x0 < 1e-3 || z1 - z0 < 1e-3) continue;
    const P = (x, z, o = 0) => [cx + x, y + h(x, z) + o, cz + z];
    quadUp(top, P(x0, z0), P(x1, z0), P(x1, z1), P(x0, z1));
    quadUp(under, P(x0, z0, -th), P(x1, z0, -th), P(x1, z1, -th), P(x0, z1, -th), false);
  }
  bag.add(mat, fromTriangles(top));
  bag.add(mat, fromTriangles(under));
  // the cut edge of the thatch round the eave
  const e = 0.001;
  bag.add(mat, box(cx - A, y - th, cz - B, cx + A, y, cz - B + e + 0.08));
  bag.add(mat, box(cx - A, y - th, cz + B - 0.08 - e, cx + A, y, cz + B));
  bag.add(mat, box(cx - A, y - th, cz - B, cx - A + 0.08 + e, y, cz + B));
  bag.add(mat, box(cx + A - 0.08 - e, y - th, cz - B, cx + A, y, cz + B));
  // the ridge: a roll of thatch bound with bamboo
  const L = Math.abs(A - B);
  if (L > 0.3) { if (A > B) bag.add(el.ridge ?? mat, box(cx - L, y + R - 0.3, cz - 0.17, cx + L, y + R + 0.2, cz + 0.17)); else bag.add(el.ridge ?? mat, box(cx - 0.17, y + R - 0.3, cz - L, cx + 0.17, y + R + 0.2, cz + L)); }
}
/** Steps rising from y0 to y1 toward dir ('n' = −z, 's', 'e', 'w') over rect, solid down to base. */
export function steps(ctx, rect, y0, y1, dir, mat = 'andesite', riser = 0.17, base = null) {
  const [x0, z0, x1, z1] = rect, rise = y1 - y0, n = Math.max(1, Math.round(Math.abs(rise) / riser)), b0 = (base ?? Math.min(y0, y1)) - 0.02;
  for (let i = 0; i < n; i++) {
    const f1 = (i + 1) / n, yT = y0 + rise * f1;
    let r;
    if (dir === 'n') r = [x0, z1 - (z1 - z0) * f1, x1, z1]; else if (dir === 's') r = [x0, z0, x1, z0 + (z1 - z0) * f1];
    else if (dir === 'e') r = [x0, z0, x0 + (x1 - x0) * f1, z1]; else r = [x1 - (x1 - x0) * f1, z0, x1, z1];
    ctx.bag.add(mat, box(r[0], b0, r[1], r[2], yT, r[3]));
  }
  ctx.col.ramp(rect, y0, y1, dir);
}
/** A square-section carved stone coping stepped in three: used on walls and pillars. */
export function coping(ctx, x0, z0, x1, z1, y, mat = 'tuff_hewn') {
  bx(ctx, mat, x0 - 0.06, y, z0 - 0.06, x1 + 0.06, y + 0.1, z1 + 0.06);
  bx(ctx, mat, x0 - 0.02, y + 0.1, z0 - 0.02, x1 + 0.02, y + 0.2, z1 + 0.02);
}
/** A little offering tray (canang sari): a palm-leaf tray with flowers, and a wisp of incense stick. */
export function canang(ctx, x, y, z, k = 0) {
  const c = ['cloth_white', 'cloth_red', 'cloth_ochre', 'paint_blue'][k % 4];
  ctx.bag.add('wicker', box(x - 0.07, y, z - 0.07, x + 0.07, y + 0.035, z + 0.07), true);
  ctx.bag.add(c, box(x - 0.05, y + 0.035, z - 0.05, x + 0.05, y + 0.06, z + 0.05), true);
  ctx.bag.add('cloth_ochre', box(x - 0.02, y + 0.06, z - 0.02, x + 0.02, y + 0.08, z + 0.02), true);
}
/** A sash of poleng (black and white check) or yellow and white cloth tied round a shaft (statue, tree, pillar) at height y, radius r, `n` bands. */
export function sash(ctx, x, z, y, r, kind = 'poleng') {
  const a = kind === 'poleng' ? 'cloth_black' : 'cloth_ochre', b = 'cloth_white';
  ctx.bag.add(a, lathe([[r + 0.03, 0], [r + 0.03, 0.09]], 8, (th) => (Math.floor(th / TAU * 8) % 2 ? 1 : 0.001), x, y, z), true);
  ctx.bag.add(b, lathe([[r + 0.03, 0], [r + 0.03, 0.09]], 8, (th) => (Math.floor(th / TAU * 8) % 2 ? 0.001 : 1), x, y, z), true);
}
/** A bamboo-like curved pole from a to b through a bow (penjor). */
export function curvedPole(ctx, mat, p0, p1, p2, r, n = 7) {
  let prev = p0;
  for (let i = 1; i <= n; i++) {
    const t = i / n, u = 1 - t, q = [u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0], u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1], u * u * p0[2] + 2 * u * t * p1[2] + t * t * p2[2]];
    ctx.bag.add(mat, rod(prev, q, r * (1 - 0.4 * t), 5));
    prev = q;
  }
}
