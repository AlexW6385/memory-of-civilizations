// The pilgrims' stalls of Lalibela (docs/settlements/lalibela.md §18): a lean-to of posts, wattle and thatch beside the way, open at the front over a
// mud counter, where the pilgrims who come to the churches buy what they need and the keeper sits behind. Three kinds, all inferred from the pilgrimage
// (water for the way and the jars of those who walk barefoot; wax tapers, incense and crosses for the church; mats, prayer staffs, sandals and white
// cloth). Procedural, existing materials only. Each stall is { at: [x, z], y, rot (the way its front faces: the unit (cos, sin)), kind, seed }.
import { orientedBox } from '../../core/build.js';
import { box, lathe, fromTriangles } from '../../core/geom.js';
import { rod } from './hut.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/** The stall's frame: u along the front (right of a visitor facing it), v out from the front (toward the visitor), h up. */
export function stallFrame(el) {
  const [x, z] = el.at, c = Math.cos(el.rot), s = Math.sin(el.rot);
  return { P: (u, v) => [x + c * v - s * u, z + s * v + c * u], x, z, y: el.y ?? 0 };
}

export function stallEl(el, { bag, col, lights }) {
  const F = stallFrame(el), { P, y } = F, rand = rng(Math.round(el.at[0] * 31 + el.at[1] * 17) + (el.seed || 0)), kind = el.kind || 'water';
  const jar = (u, v, s, mat = 'terracotta', h0 = 0) => { const [jx, jz] = P(u, v); bag.add(mat, lathe([[0.001, 0.0], [0.13 * s, 0.0], [0.27 * s, 0.22 * s], [0.31 * s, 0.45 * s], [0.27 * s, 0.68 * s], [0.17 * s, 0.8 * s], [0.19 * s, 0.86 * s], [0.001, 0.86 * s]], 12, (th) => 1 + 0.02 * Math.sin(th * 4 + u * 9), jx, y + h0, jz)); };
  // the posts: forked timbers, 2.4 m at the front, 1.9 m at the back
  { const t = [];
    for (const [u, v, h] of [[-1.7, 0.2, 2.4], [1.7, 0.2, 2.4], [-1.7, -2.2, 1.9], [1.7, -2.2, 1.9]]) { const [px, pz] = P(u, v); rod(t, [px, y - 0.25, pz], [px, y + h, pz], 0.075, 6); col.circle(px, pz, 0.1, y, y + h); }
    for (const v of [0.2, -2.2]) { const a = P(-1.75, v), b = P(1.75, v), h = v > 0 ? 2.4 : 1.9; rod(t, [a[0], y + h - 0.12, a[1]], [b[0], y + h - 0.12, b[1]], 0.06, 5); }
    for (const u of [-1.7, 1.7]) { const a = P(u, 0.2), b = P(u, -2.2); rod(t, [a[0], y + 2.28, a[1]], [b[0], y + 1.78, b[1]], 0.05, 5); }
    bag.add('timber', fromTriangles(t)); }
  // the thatch in two overlapping courses, stepped down toward the back, each a hand thick with its underside
  bag.add('thatch', orientedBox(P(-2.05, -0.5), P(2.05, -0.5), 1.9, y + 2.3, y + 2.5));
  bag.add('thatch', orientedBox(P(-2.0, -1.65), P(2.0, -1.65), 1.7, y + 2.08, y + 2.27));
  bag.add('thatch', orientedBox(P(-2.0, -0.62), P(2.0, -0.62), 0.14, y + 2.5, y + 2.58));
  // the back and the sides: wattle woven on stakes, the sides to half height
  { const a = P(-1.75, -2.28), b = P(1.75, -2.28); bag.add('wicker', orientedBox(a, b, 0.09, y, y + 1.85)); col.segment(a, b, 0.12, y, y + 1.85); }
  for (const u of [-1.74, 1.74]) { const a = P(u, -2.2), b = P(u, -1.0); bag.add('wicker', orientedBox(a, b, 0.08, y, y + 1.2)); col.segment(a, b, 0.1, y, y + 1.2); }
  // the counter: a mud-plastered bench, a wooden top; and the keeper's low stool behind it
  { const a = P(-1.5, -0.55), b = P(1.5, -0.55); bag.add('mud_plaster', orientedBox(a, b, 0.7, y, y + 0.82)); bag.add('wood_dark', orientedBox(P(-1.55, -0.55), P(1.55, -0.55), 0.78, y + 0.82, y + 0.87)); col.segment(a, b, 0.74, y, y + 0.9); }
  { const [sx, sz] = P(0.0, -1.55); bag.add('wood_dark', lathe([[0.001, 0.3], [0.2, 0.3], [0.2, 0.26], [0.001, 0.26]], 10, null, sx, y, sz)); for (let k = 0; k < 3; k++) { const a = k * 2.1; bag.add('wood_dark', lathe([[0.001, 0.0], [0.03, 0.0], [0.03, 0.26], [0.001, 0.26]], 5, null, sx + Math.cos(a) * 0.13, y, sz + Math.sin(a) * 0.13)); } }
  const top = y + 0.87;
  if (kind === 'water') {
    // clay jars of every size on the counter, a great one at each end on the ground, gourd dippers, a cloth over one mouth; sherds of a broken jar by the post
    for (const [u, v, s, m] of [[-1.15, -0.5, 0.75, 'terracotta'], [-0.55, -0.4, 0.62, 'pottery_dark'], [0.1, -0.52, 0.8, 'terracotta'], [0.75, -0.4, 0.6, 'terracotta'], [1.2, -0.55, 0.7, 'pottery_dark']]) jar(u, v, s, m, 0.87);
    jar(-1.5, -1.8, 1.15); jar(1.5, -1.8, 1.05, 'pottery_dark'); jar(1.3, -1.0, 0.7);
    { const [cx, cz] = P(0.1, -0.52); bag.add('cloth_white', lathe([[0.18, 0.87 * 0.8 + 0.88], [0.21, 0.87 * 0.8 + 0.84], [0.16, 0.87 * 0.8 + 0.82], [0.001, 0.87 * 0.8 + 0.88]], 8, null, cx, y, cz)); }
    for (const [u, v] of [[-0.35, -0.2], [0.45, -0.18]]) { const [gx, gz] = P(u, v); bag.add('hide_tan', lathe([[0.001, 0], [0.07, 0.02], [0.1, 0.07], [0.06, 0.12], [0.02, 0.2], [0.001, 0.2]], 8, null, gx, top, gz)); }
    for (let k = 0; k < 3; k++) { const [sx, sz] = P(-1.4 + k * 0.17, 0.55 + rand() * 0.2); bag.add('terracotta', box(sx - 0.05, y, sz - 0.04, sx + 0.05, y + 0.02, sz + 0.04)); }
    // a rock to stand a jar on while it is filled, and a flat stone before the counter worn by those who wait
    { const a = P(-0.5, 0.9), b = P(0.5, 0.9); bag.add('rubble', orientedBox(a, b, 0.5, y - 0.1, y + 0.1)); }
  } else if (kind === 'candles') {
    // the wax tapers in bundles tied at the waist (the beeswax of the highland hives), laid across the counter; a basket of incense resin and a clay brazier with embers
    { const t = [];
      for (let b = 0; b < 4; b++) { const u = -1.2 + b * 0.5, [bx, bz] = P(u, -0.32 + rand() * 0.1), a = rand() * 0.5; for (let k = 0; k < 7; k++) { const o = (k - 3) * 0.018; rod(t, [bx - Math.cos(a) * 0.22 + o, top + 0.02 + Math.abs(o), bz - Math.sin(a) * 0.22], [bx + Math.cos(a) * 0.22 + o, top + 0.02 + Math.abs(o), bz + Math.sin(a) * 0.22], 0.012, 4); } }
      bag.add('hide_tan', fromTriangles(t)); }
    for (let b = 0; b < 4; b++) { const [bx, bz] = P(-1.2 + b * 0.5, -0.32); bag.add('rope_fibre', lathe([[0.03, -0.015], [0.032, 0.015]], 6, null, bx, top + 0.04, bz)); }
    { const [bx, bz] = P(0.95, -0.4); bag.add('wicker', lathe([[0.001, 0], [0.17, 0.0], [0.22, 0.12], [0.2, 0.14], [0.001, 0.13]], 12, null, bx, top, bz)); for (let k = 0; k < 6; k++) { const a = k * 1.05; bag.add('hide_tan', lathe([[0.001, 0.0], [0.035, 0.015], [0.03, 0.04], [0.001, 0.05]], 5, null, bx + Math.cos(a) * 0.07, top + 0.13, bz + Math.sin(a) * 0.07)); } }
    { const [bx, bz] = P(-1.45, -1.1);
      bag.add('pottery_dark', lathe([[0.001, 0.0], [0.12, 0.0], [0.2, 0.18], [0.24, 0.26], [0.2, 0.28], [0.001, 0.26]], 12, null, bx, y, bz)); bag.add('hide_grey', lathe([[0.001, 0.26], [0.13, 0.26], [0.001, 0.27]], 8, null, bx, y, bz)); /* the ash and embers: their glow is the night's halo (nightlight.js) */ col.circle(bx, bz, 0.25, y, y + 0.3); }
    // crosses of wood and of brass on cords from the front beam: a lobed cross each, small crosses budding on the Lalibela pattern
    for (let k = 0; k < 6; k++) { const u = -1.45 + k * 0.58, [cx, cz] = P(u, 0.18), len = 0.45 + rand() * 0.35, m = k % 2 ? 'bronze' : 'wood_dark', th = Math.atan2(el.at[1], el.at[0]);
      const t = []; rod(t, [cx, y + 2.3, cz], [cx, y + 2.3 - len, cz], 0.006, 3); bag.add('rope_fibre', fromTriangles(t));
      const hy = y + 2.3 - len; const ax = P(u - 0.07, 0.18), bx2 = P(u + 0.07, 0.18);
      bag.add(m, orientedBox(ax, bx2, 0.02, hy - 0.05, hy - 0.035)); bag.add(m, box(cx - 0.009, hy - 0.16, cz - 0.009, cx + 0.009, hy + 0.01, cz + 0.009)); void th; }
    // a clay lamp on the counter, its flame (and, at night, its glow)
    { const [lx, lz] = P(-0.1, -0.35); bag.add('terracotta', lathe([[0.001, 0], [0.06, 0.0], [0.09, 0.03], [0.1, 0.045], [0.001, 0.05]], 8, null, lx, top, lz)); bag.add('rope_fibre', lathe([[0.008, 0.045], [0.006, 0.075], [0.001, 0.08]], 4, null, lx + 0.07, top, lz)); /* the wick */ }
  } else {
    // mats rolled and standing, prayer staffs (the maqomia, with its T-head) in a stand, pairs of sandals, white cloth folded in stacks, a bundle of stakes
    { const t = [];
      for (let k = 0; k < 5; k++) { const [mx, mz] = P(-1.5 + k * 0.17, -1.9 + (k % 2) * 0.12); bag.add('wicker', lathe([[0.001, 0.0], [0.07, 0.0], [0.07, 1.1 + (k % 3) * 0.1], [0.001, 1.1 + (k % 3) * 0.1]], 8, null, mx, y, mz)); }
      for (let k = 0; k < 4; k++) { const [px, pz] = P(1.1 + k * 0.1, -1.7), [qx, qz] = P(1.15 + k * 0.1, -1.95), h = 1.5 + (k % 2) * 0.2; rod(t, [px, y, pz], [qx, y + h, qz], 0.018, 5); rod(t, [qx - 0.1, y + h, qz], [qx + 0.1, y + h, qz], 0.02, 5); }
      bag.add('timber', fromTriangles(t)); }
    for (let k = 0; k < 4; k++) { const [sx, sz] = P(-1.2 + k * 0.28 + rand() * 0.05, -0.45 + (k % 2) * 0.08); for (const o of [-0.045, 0.045]) bag.add('hide_tan', box(sx + o - 0.04, top, sz - 0.1, sx + o + 0.04, top + 0.025, sz + 0.1)); }
    for (let k = 0; k < 2; k++) { const [cx, cz] = P(0.55 + k * 0.5, -0.5), n = 4 + k; for (let i = 0; i < n; i++) bag.add(i % 3 === 1 ? 'hide_tan' : 'cloth_white', box(cx - 0.2 + rand() * 0.02, top + i * 0.045, cz - 0.15, cx + 0.2, top + (i + 1) * 0.045 - 0.004, cz + 0.15 + rand() * 0.02)); }
    { const [bx, bz] = P(-1.45, -1.2), t = []; for (let k = 0; k < 8; k++) rod(t, [bx + (k % 3) * 0.03, y, bz + (k % 2) * 0.03], [bx + 0.5 + (k % 3) * 0.02, y + 0.12 + (k % 3) * 0.02, bz + (k % 4) * 0.04], 0.02, 4); bag.add('timber', fromTriangles(t)); }
  }
  // the ground before the counter, trodden: a patch of bare earth, a hand wider than the stall
  { const a = P(-1.9, 0.9), b = P(1.9, 0.9); bag.add('mud_plaster', orientedBox(a, b, 1.8, y - 0.02, y + 0.012)); }
}
