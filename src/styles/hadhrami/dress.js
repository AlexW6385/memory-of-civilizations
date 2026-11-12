// The dressing of Shibam's tower-house fronts and roofs at the eye's height (docs/settlements/shibam.md §4, "Fronts, weathering and roofs"):
// the mastaba beside the door, water jars on their rings of stone, a little niche with an oil lamp, patches where the plaster has fallen and
// the mudbrick shows, the rain-and-lime streaks under the sills, spouts of palm trunk at the parapet, and on the roof the stair-head, jars,
// a drying frame, a pigeon cote; and the covered passages (sabat) built over the streets between two houses.
// Everything is a shared piece placed by matrix (instanced), so a street of fronts costs matrices, not geometry.

import { box, rod, lathe } from '../../core/geom.js';
import { Matrix4 } from '../../core/three.js';
import { K, topOf } from './dims.js';
import { benchPieces, jarPieces, nichePieces, patchPieces, spoutPieces, streakPieces } from './parts.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }
/** Place the pieces of a part at (x, y, z) facing outward along (nx, nz), shifted `u` along the face and out `o`. */
function putAt(bag, pieces, x, y, z, nx, nz, reach = 70) {
  const m = new Matrix4().makeRotationY(Math.atan2(nx, nz)).setPosition(x, y, z);
  for (const [mat, g] of pieces) bag.addInstance(mat, g, m.clone(), { reach });
}
/** A point on a face at lateral coordinate u (the coordinate along it) and out o from the wall, at height y. */
function onFace(el, f, u, y, o = 0) {
  const [x0, z0, x1, z1] = el.rect, k = K * y;
  switch (f) {
    case 'n': return [u, y, z0 + k - o];
    case 's': return [u, y, z1 - k + o];
    case 'w': return [x0 + k - o, y, u];
    default: return [x1 - k + o, y, u];
  }
}
const range = (el, f) => (f === 'n' || f === 's' ? [el.rect[0], el.rect[2]] : [el.rect[1], el.rect[3]]);

/** The door's surroundings on the front: mastaba, jars, niche, plaster patches (u: the door's place along the front). */
export function dressFace(ctx, el, f, nx, nz, u, p, rand) {
  const { bag } = ctx, [lo, hi] = range(el, f), r = rng((el.seed ^ 0x51ed) >>> 0), shop = !!el.shop;
  const side = r() < 0.5 ? -1 : 1, at = (uu, y, o = 0) => onFace(el, f, uu, y, o);
  const lat = (d) => u + d, within = (uu, w = 0.4) => uu > lo + w && uu < hi - w;
  // the bench of mud and lime along the wall beside the door (not before a shop: its goods are there)
  if (!shop && r() < 0.45) {
    const len = [1.6, 2.2, 2.8][Math.floor(r() * 3)], c = lat(side * (0.95 + len / 2));
    if (within(c, len / 2 + 0.2)) { const q = at(c, 0, 0.02); putAt(bag, benchPieces(len), q[0], 0, q[2], nx, nz); }
  }
  // water jars on stone rings at the door's foot, one or two
  if (r() < (shop ? 0.9 : 0.6)) {
    for (const d of shop ? [-1.2, 1.2] : [-side * 1.05]) if (within(lat(d), 0.5)) { const q = at(lat(d), 0, 0.4); putAt(bag, jarPieces(r() < 0.6 ? 'zir' : 'gharra'), q[0], 0, q[2], nx, nz, 55); }
  }
  // a niche with a lamp beside the door
  if (r() < 0.55 && within(lat(-side * 0.95))) { const q = at(lat(-side * 0.95), 1.45, 0); putAt(bag, nichePieces(), q[0], q[1], q[2], nx, nz, 50); }
  // patches of fallen plaster, the mudbrick showing at the foot of the wall
  for (let i = 0; i < 2; i++) {
    const uu = lo + 0.8 + r() * (hi - lo - 1.6);
    if (Math.abs(uu - u) < 1.1) continue;
    const q = at(uu, 0.3 + r() * 0.5, 0); putAt(bag, patchPieces(Math.floor(r() * 4)), q[0], q[1], q[2], nx, nz, 45);
  }
  // the sacks and baskets of a shop set out by its door
  if (shop) for (const d of [-0.9, 0.9]) {
    const q = at(lat(d + side * 0.4), 0, 0.9);
    bag.add('sacking', lathe([[0.001, 0], [0.18, 0.02], [0.26, 0.2], [0.22, 0.4], [0.1, 0.52], [0.001, 0.54]], 8, null, q[0], 0, q[2]));
  }
  void p; void rand;
}

/** A streak under a window's sill: only the larger windows of the upper storeys, a third of them. */
export function dressWindow(ctx, kind, p, sy, nx, nz, rand) {
  if (kind === 'slit' || kind === 'small' || rand() > 0.34) return;
  const len = kind === 'white' ? 1.0 : 1.6;
  putAt(ctx.bag, streakPieces(len), p[0], sy - 0.12, p[2], nx, nz, 85);
}

/** The roof: spouts, teeth on a rich house's parapet, the stair-head, jars, a drying frame, a pigeon cote. */
export function dressRoof(ctx, el, top, [px0, pz0, px1, pz1], rand) {
  const { bag } = ctx, r = rng((el.seed ^ 0xa17) >>> 0), f = el.front ?? 's', free = el.free ?? { n: 1, s: 1, e: 1, w: 1 };
  const nxz = { n: [0, -1], s: [0, 1], w: [-1, 0], e: [1, 0] };
  // the spouts through the parapet on the front, two or three (the roof's water thrown clear of the wall)
  if (free[f]) {
    const [lo, hi] = range(el, f), n = hi - lo > 8 ? 3 : 2;
    for (let i = 0; i < n; i++) {
      const uu = lo + (hi - lo) * (i + 0.5) / n + (r() - 0.5) * 0.8, [nx, nz] = nxz[f], q = onFace(el, f, uu, top - 0.55, 0);
      putAt(bag, spoutPieces(), q[0], q[1], q[2], nx, nz, 110);
      putAt(bag, streakPieces(2.4), q[0], q[1] - 0.12, q[2], nx, nz, 85);
    }
  }
  // the teeth of the parapet (lime stepped pieces every metre) on rich houses and the palace
  if (el.rich || el.towers) {
    for (let x = px0 + 0.7; x < px1 - 0.4; x += 1.0) { bag.add('lime_plaster', box(x, top + 0.9, pz0, x + 0.3, top + 1.2, pz0 + 0.28)); bag.add('lime_plaster', box(x, top + 0.9, pz1 - 0.28, x + 0.3, top + 1.2, pz1)); }
  }
  // on the roof: the stair-head in a corner, jars, a drying frame with its cloth
  const cx = px0 + 0.9 + r() * Math.max(0, px1 - px0 - 3), cz = pz0 + 0.9 + r() * Math.max(0, pz1 - pz0 - 3);
  if (r() < 0.7) { bag.add('lime_plaster', box(px0 + 0.6, top, pz0 + 0.6, px0 + 1.9, top + 1.6, pz0 + 1.9)); bag.add('timber', box(px0 + 0.55, top + 1.6, pz0 + 0.55, px0 + 1.95, top + 1.7, pz0 + 1.95)); bag.add('opening', box(px0 + 1.2, top, pz0 + 1.88, px0 + 1.9 - 0.2, top + 1.2, pz0 + 1.92)); }
  for (let i = 0; i < 2 + Math.floor(r() * 3); i++) {
    const jx = px0 + 2.4 + r() * Math.max(0.1, px1 - px0 - 3.2), jz = pz0 + 0.5 + r() * Math.max(0.1, pz1 - pz0 - 1.0);
    bag.add('terracotta', lathe([[0.001, 0], [0.12, 0.02], [0.24, 0.2], [0.26, 0.4], [0.16, 0.6], [0.1, 0.66], [0.12, 0.7], [0.001, 0.68]], 7, null, jx, top, jz));
  }
  if (r() < 0.4) {
    const fx = cx, fz = cz;
    for (const dx of [0, 2.2]) bag.add('palm_trunk', rod([fx + dx, top, fz], [fx + dx, top + 1.6, fz], 0.05, 5));
    bag.add('palm_trunk', rod([fx, top + 1.6, fz], [fx + 2.2, top + 1.6, fz], 0.035, 5));
    for (let k = 0; k < 3; k++) bag.add(['cloth_white', 'cloth_indigo', 'cloth_ochre'][k], box(fx + 0.15 + k * 0.68, top + 0.7, fz - 0.01, fx + 0.7 + k * 0.68, top + 1.58, fz + 0.01));
  }
  if (el.rich && r() < 0.3) {
    const bx = px1 - 2.2, bz = pz1 - 2.2;
    bag.add('mud_plaster', box(bx, top, bz, bx + 1.1, top + 2.0, bz + 1.1)); bag.add('lime_plaster', box(bx - 0.08, top + 2.0, bz - 0.08, bx + 1.18, top + 2.12, bz + 1.18));
    for (let k = 0; k < 6; k++) bag.add('opening', box(bx + 0.15 + (k % 3) * 0.3, top + 0.8 + Math.floor(k / 3) * 0.5, bz + 1.09, bx + 0.3 + (k % 3) * 0.3, top + 0.95 + Math.floor(k / 3) * 0.5, bz + 1.12));
  }
  void rand; void topOf;
}

/**
 * sabat: { c: [x, z] the middle, dir ('z': it spans a street running east–west, across z; 'x': an alley), gap (the way's width), w (its length along the
 * way), y0 (the underside) } — a covered passage between two houses: a room of mud over the way on beams of palm trunk, its sides limewashed with a window.
 */
function sabat(el, { bag, col }) {
  const [cx, cz] = el.c, g = el.gap, w = el.w ?? 2.4, y0 = el.y0 ?? 3.8, y1 = y0 + (el.h ?? 2.6), e = 0.35;
  const alongZ = el.dir === 'z';
  const R = alongZ ? [cx - w / 2, cz - g / 2 - e, cx + w / 2, cz + g / 2 + e] : [cx - g / 2 - e, cz - w / 2, cx + g / 2 + e, cz + w / 2];
  bag.add('mud_plaster', box(R[0], y0, R[1], R[2], y1, R[3])); bag.add('lime_plaster', box(R[0] - 0.05, y1, R[1] - 0.05, R[2] + 0.05, y1 + 0.25, R[3] + 0.05));
  bag.add('lime_plaster', box(R[0] - 0.04, y0 - 0.02, R[1], R[2] + 0.04, y0 + 0.14, R[3]));
  col.rect(R, y0, y1 + 0.25);
  // the beams under it, palm trunks across the way, and a post in each face for a window
  const n = Math.floor(w / 0.5);
  for (let i = 0; i < n; i++) {
    const t = -w / 2 + (i + 0.5) * w / n;
    bag.add('palm_trunk', alongZ ? rod([cx + t, y0 - 0.1, cz - g / 2 - e], [cx + t, y0 - 0.1, cz + g / 2 + e], 0.085, 6) : rod([cx - g / 2 - e, y0 - 0.1, cz + t], [cx + g / 2 + e, y0 - 0.1, cz + t], 0.085, 6));
  }
  // the window on each side of the way's length: at the way's two ends, a small opening in a white frame
  for (const s of [-1, 1]) {
    const px = alongZ ? cx + s * (w / 2) : cx, pz = alongZ ? cz : cz + s * (w / 2);
    if (alongZ) { bag.add('opening', box(px - 0.02 * s, y0 + 1.0, pz - 0.4, px + 0.02 * s, y0 + 1.9, pz + 0.4)); }
    else bag.add('opening', box(px - 0.4, y0 + 1.0, pz - 0.02 * s, px + 0.4, y0 + 1.9, pz + 0.02 * s));
  }
}

/** mat_shade: { rect, y, seed } — the shade of the market: palm-trunk posts in two rows, cross-beams, a roof of palm mats laid over leaves, a cloth edge; people stand under it. */
function matShade(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, H = el.h ?? 2.7, r = rng(el.seed ?? 3);
  const nx = Math.max(2, Math.round((x1 - x0) / 3)), nz = Math.max(2, Math.round((z1 - z0) / 3));
  for (let i = 0; i <= nx; i++) for (let j = 0; j <= nz; j++) {
    if ((i > 0 && i < nx) && (j > 0 && j < nz)) continue;
    const px = x0 + (x1 - x0) * i / nx, pz = z0 + (z1 - z0) * j / nz, h = H - 0.15 * (j / nz);
    bag.add('palm_trunk', rod([px, y, pz], [px, y + h, pz], 0.075, 6)); col.circle(px, pz, 0.09, y, y + h);
  }
  for (let j = 0; j <= nz; j++) bag.add('palm_trunk', rod([x0 - 0.2, y + H - 0.15 * (j / nz) + 0.05, z0 + (z1 - z0) * j / nz], [x1 + 0.2, y + H - 0.15 * (j / nz) + 0.05, z0 + (z1 - z0) * j / nz], 0.06, 6));
  for (let x = x0; x < x1; x += 0.55) bag.add('palm_trunk', rod([x + 0.2, y + H + 0.02, z0 - 0.2], [x + 0.2, y + H - 0.17, z1 + 0.2], 0.035, 4));
  bag.add('reed_mat', box(x0 - 0.2, y + H + 0.06, z0 - 0.2, x1 + 0.2, y + H + 0.1, z1 + 0.2)); bag.add('thatch_palm', box(x0 - 0.1, y + H + 0.1, z0 - 0.1, x1 + 0.1, y + H + 0.16, z1 + 0.1));
  for (let x = x0 + 0.5; x < x1 - 0.4; x += 1.1 + r() * 0.6) bag.add(['cloth_white', 'cloth_indigo', 'cloth_ochre', 'cloth_red'][Math.floor(r() * 4)], box(x, y + H - 0.55, z1 + 0.2, x + 0.6 + r() * 0.3, y + H, z1 + 0.22));
}
export const SABAT_ELEMENTS = { sabat, mat_shade: matShade };
