// Nagara temple architecture of the Chandelas (11th c.; docs/settlements/khajuraho.md §4): a temple
// on a high terrace (jagati), its halls in a row from the east — the entrance porch, the hall,
// the great hall, the vestibule, the sanctum — each roofed higher than the last in stepped
// pyramids, the sanctum crowned by the curvilinear tower (śikhara) clustered with smaller towers
// (uruśṛṅgas) climbing it, each ending in a ribbed amalaka and a pot; bands of sculpture; the
// village's flat-roofed houses.

import { registerStyle, STYLES } from '../../core/build.js';
import { box, frustum, lathe } from '../../core/geom.js';
import '../qing/index.js';

const S = 'sandstone_dressed';
/** A curvilinear tower: square in plan, swelling then curving in to the top, in courses. */
function shikhara(bag, cx, cz, y, w, h, mat = S, courses = 14) {
  for (let i = 0; i < courses; i++) {
    const t0 = i / courses, t1 = (i + 1) / courses, f = (t) => 1 - 0.62 * t ** 1.6;
    const w0 = w * f(t0), w1 = w * f(t1), y0 = y + h * t0, y1 = y + h * t1;
    bag.add(mat, frustum([cx - w0 / 2, cz - w0 / 2, cx + w0 / 2, cz + w0 / 2], y0, y1 - h / courses * 0.25, (w0 - w1) / 2, (w0 - w1) / 2, (w0 - w1) / 2, (w0 - w1) / 2));
    bag.add(mat, box(cx - w1 / 2 - 0.08, y1 - h / courses * 0.25, cz - w1 / 2 - 0.08, cx + w1 / 2 + 0.08, y1, cz + w1 / 2 + 0.08));
  }
  const top = y + h, wt = w * 0.38;
  bag.add(mat, lathe([[wt * 0.3, 0], [wt * 0.62, wt * 0.12], [wt * 0.65, wt * 0.22], [wt * 0.3, wt * 0.34]], 16, null, cx, top, cz));   // the amalaka
  bag.add(mat, lathe([[wt * 0.18, 0], [wt * 0.26, wt * 0.25], [wt * 0.1, wt * 0.48], [0.001, wt * 0.62]], 10, null, cx, top + wt * 0.34, cz));
}
/** A band of figures in high relief round a wall rect r, standing on yb, h tall — gods, attendants, couples, set in niches between pilasters. */
function figureBand(bag, r, yb, h) {
  const [x0, z0, x1, z1] = r, k = h / 1.15;
  const prof = [[0.2 * k, 0], [0.16 * k, 0.45 * k], [0.12 * k, 0.72 * k], [0.07 * k, 0.78 * k], [0.1 * k, 0.86 * k], [0.085 * k, 1.0 * k], [0.001, 1.12 * k]];
  for (const [a, b, fx, fz] of [[[x0, z0], [x1, z0], 0, -1], [[x1, z1], [x0, z1], 0, 1], [[x0, z1], [x0, z0], -1, 0], [[x1, z0], [x1, z1], 1, 0]]) {
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.floor(L / (h * 0.62)));
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n, x = a[0] + (b[0] - a[0]) * t + fx * 0.12, z = a[1] + (b[1] - a[1]) * t + fz * 0.12;
      bag.add('sandstone', lathe(prof, 5, null, x, yb + 0.05, z));
      if (i % 3 === 1) bag.add('sandstone', lathe(prof.map(([pr, py]) => [pr * 0.95, py * 0.93]), 5, null, x + (fz ? h * 0.18 : 0), yb + 0.05, z + (fx ? h * 0.18 : 0)));   // a couple
      const pt = (a[0] + (b[0] - a[0]) * (i / n)), pz = (a[1] + (b[1] - a[1]) * (i / n));
      bag.add(S, box(pt - 0.1 + fx * 0.05, yb, pz - 0.1 + fz * 0.05, pt + 0.1 + fx * 0.2, yb + h + 0.15, pz + 0.1 + fz * 0.2));
    }
  }
  bag.add(S, box(x0 - 0.25, yb + h + 0.1, z0 - 0.25, x1 + 0.25, yb + h + 0.35, z1 + 0.25));
  bag.add(S, box(x0 - 0.2, yb - 0.2, z0 - 0.2, x1 + 0.2, yb, z1 + 0.2));
}
/** A balconied window on a hall's side (kakshasana): the seat-back balustrade, the pillars, the sloping eave. */
function balcony(bag, x0, x1, z, side, y, h) {
  const d = side * 1.6, zz = [z, z + d].sort((p, q) => p - q);
  bag.add(S, box(x0, y, zz[0], x1, y + 0.9, zz[1]));
  for (const x of [x0 + 0.2, (x0 + x1) / 2, x1 - 0.2]) bag.add(S, box(x - 0.15, y + 0.9, z + d * 0.85 - 0.15, x + 0.15, y + h, z + d * 0.85 + 0.15));
  bag.add(S, frustum([x0 - 0.3, Math.min(z, z + d * 1.15), x1 + 0.3, Math.max(z, z + d * 1.15)], y + h, y + h + 0.6, 0, 0, side < 0 ? 0 : d * 0.9, side < 0 ? -d * 0.9 : 0, { noBottom: true }));
}
/** A small block on a face: along x (ax) at u, the face's coordinate zz, half-width hw, depth d, from yy, h tall. */
const along = (ax, u, zz, hw, d, yy, h) => (ax ? box(u - hw, yy, zz - d, u + hw, yy + h, zz + d) : box(zz - d, yy, u - hw, zz + d, yy + h, u + hw));
/** A stepped pyramidal roof over a hall. */
function stepped(bag, r, y, h, mat = S, n = 7) {
  const [x0, z0, x1, z1] = r, w = x1 - x0, d = z1 - z0;
  for (let i = 0; i < n; i++) {
    const f0 = 1 - 0.8 * i / n, f1 = 1 - 0.8 * (i + 1) / n, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
    const ya = y + h * i / n, yb = y + h * (i + 1) / n;
    // each tier a sloped course under a projecting ledge, a row of little pot-finials along the ledge
    bag.add(mat, frustum([cx - w * f0 / 2, cz - d * f0 / 2, cx + w * f0 / 2, cz + d * f0 / 2], ya, yb - (yb - ya) * 0.3, w * (f0 - f1) / 2 * 0.7, w * (f0 - f1) / 2 * 0.7, d * (f0 - f1) / 2 * 0.7, d * (f0 - f1) / 2 * 0.7));
    const fm = f0 - (f0 - f1) * 0.62;
    bag.add(mat, box(cx - w * fm / 2 - 0.12, yb - (yb - ya) * 0.3, cz - d * fm / 2 - 0.12, cx + w * fm / 2 + 0.12, yb, cz + d * fm / 2 + 0.12));
    const m = Math.max(2, Math.floor(w * fm / 1.2));
    for (let j = 0; j <= m; j++) for (const sz of [-1, 1]) { const x = cx - w * fm / 2 + j * w * fm / m; bag.add('sandstone', lathe([[0.12, 0], [0.16, 0.12], [0.001, 0.32]], 6, null, x, yb, cz + sz * (d * fm / 2))); }
  }
  const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, wt = Math.min(w, d) * 0.22;
  bag.add(mat, lathe([[wt * 0.4, 0], [wt * 0.6, wt * 0.15], [wt * 0.3, wt * 0.3], [0.001, wt * 0.6]], 12, null, cx, y + h, cz));
}
/**
 * nagara_temple: { c (the sanctum's centre), len (west–east, the porch at the east), w, h (the
 * tower's top above the terrace), jagati (terrace height), y } — the temple faces east.
 */
function temple(el, { bag, col }) {
  const [cx, cz] = el.c, L = el.len, W = el.w, H = el.h, J = el.jagati ?? 4, y0 = el.y ?? 0, y = y0 + J, plinth = H * 0.12;
  // the terrace with a stair on the east
  const T = [cx - W * 0.85, cz - W * 0.95, cx + L + 4, cz + W * 0.95];
  bag.add(S, box(T[0], y0 - 0.5, T[1], T[2], y, T[3])); col.rect(T, y0, y); col.floor(T, y);
  const sw = W * 0.28, sr = [T[2], cz - sw / 2, T[2] + J * 2.2, cz + sw / 2], n = Math.round(J / 0.22);
  for (let i = 0; i < n; i++) { const z = sr[0] + (sr[2] - sr[0]) * (1 - (i + 1) / n), yy = y0 + J * (i + 1) / n; bag.add(S, box(z, y0 - 0.5, sr[1], z + (sr[2] - sr[0]) / n + 0.02, yy, sr[3])); col.floor([z, sr[1], z + (sr[2] - sr[0]) / n, sr[3]], yy); }
  // the high moulded plinth under all the halls
  const P = [cx - W / 2, cz - W * 0.42, cx + L, cz + W * 0.42];
  bag.add(S, box(P[0], y, P[1], P[2], y + plinth, P[3])); col.rect(P, y, y + plinth);
  // the plinth's mouldings: courses stepping out and in, a frieze of elephants and riders (small blocks) along the middle
  if (!el.simple) {
    for (const [f, o] of [[0.12, 0.35], [0.28, 0.15], [0.62, 0.22], [0.86, 0.3], [0.97, 0.12]]) bag.add('sandstone', box(P[0] - o, y + plinth * f - 0.12, P[1] - o, P[2] + o, y + plinth * f + 0.12, P[3] + o));
    for (const [a0, a1, zz, ax] of [[P[0], P[2], P[1] - 0.15, true], [P[0], P[2], P[3] + 0.15, true], [P[1], P[3], P[0] - 0.15, false]]) for (let u = a0 + 0.8; u < a1 - 0.6; u += 1.6) { const hh = plinth * 0.18; bag.add('sandstone', along(ax, u, zz, 0.55, 0.12, y + plinth * 0.4, hh)); }
  }
  // the halls' walls with their sculpture bands, from the sanctum eastward, each roof lower
  const halls = [[cx - W / 2, W, H * 0.3, null], [cx + W / 2, L * 0.16, H * 0.27, 0.55], [cx + W / 2 + L * 0.16, L * 0.3, H * 0.27, 0.62], [cx + W / 2 + L * 0.46, L * 0.2, H * 0.24, 0.48], [cx + W / 2 + L * 0.66, L * 0.18, H * 0.2, 0.34]];
  halls.forEach(([x, len, wh, roofH], i) => {
    const hw = i === 0 ? W / 2 : W * (i === 2 ? 0.48 : 0.36), r = [x, cz - hw, x + len, cz + hw];
    if (i === 4) { for (const [px, pz] of [[r[0] + 0.6, r[1] + 0.6], [r[2] - 0.6, r[1] + 0.6], [r[0] + 0.6, r[3] - 0.6], [r[2] - 0.6, r[3] - 0.6]]) { bag.add(S, box(px - 0.4, y + plinth, pz - 0.4, px + 0.4, y + plinth + wh, pz + 0.4)); col.rect([px - 0.4, pz - 0.4, px + 0.4, pz + 0.4], y, y + plinth + wh); } }
    else { bag.add(S, box(r[0], y + plinth, r[1], r[2], y + plinth + wh, r[3])); col.rect(r, y, y + plinth + wh); }
    if (el.simple || i === 4) for (const k of [0.3, 0.62]) bag.add('sandstone', box(r[0] - 0.05, y + plinth + wh * k, r[1] - 0.05, r[2] + 0.05, y + plinth + wh * k + wh * 0.22, r[3] + 0.05));
    else { for (const k of [0.2, 0.47, 0.74]) figureBand(bag, r, y + plinth + wh * k, Math.min(1.5, wh * 0.21)); if (i === 2 || i === 0) for (const sd of [-1, 1]) balcony(bag, r[0] + len * 0.25, r[2] - len * 0.25, sd < 0 ? r[1] : r[3], sd, y + plinth + wh * 0.18, wh * 0.55); }
    if (i > 0) stepped(bag, [r[0] - 0.4, r[1] - 0.6, r[2] + 0.4, r[3] + 0.6], y + plinth + wh, H * roofH * 0.45);
  });
  // the sanctum's tower with its climbing cluster
  const ty = y + plinth + H * 0.3, th = H - plinth - H * 0.3;
  shikhara(bag, cx, cz, ty, W * 0.86, th);
  if (!el.simple) {
    // the climbing towers (urushringas) in three rings, each smaller and lower, round the main one
    const rings = [[0.42, 0.66, 4, 0], [0.4, 0.46, 8, Math.PI / 8], [0.47, 0.3, 12, 0]];
    for (const [d, sc, n, off] of rings) for (let k = 0; k < n; k++) {
      const a = off + k / n * Math.PI * 2, ox = Math.cos(a) * d / Math.max(Math.abs(Math.cos(a)), Math.abs(Math.sin(a))), oz = Math.sin(a) * d / Math.max(Math.abs(Math.cos(a)), Math.abs(Math.sin(a)));
      shikhara(bag, cx + ox * W, cz + oz * W, ty, W * 0.86 * sc * 0.6, th * sc, S, n > 8 ? 5 : 7);
    }
  }
}
/** sub_shrine: a small temple or shrine { c, w, h, y } (no halls). */
function shrine(el, { bag, col }) {
  const [cx, cz] = el.c, w = el.w, y = el.y ?? 0, h = el.h;
  bag.add(S, box(cx - w * 0.75, y - 0.5, cz - w * 0.75, cx + w * 0.75, y + 1.4, cz + w * 0.75)); col.rect([cx - w * 0.75, cz - w * 0.75, cx + w * 0.75, cz + w * 0.75], y, y + 1.4); col.floor([cx - w * 0.75, cz - w * 0.75, cx + w * 0.75, cz + w * 0.75], y + 1.4);
  bag.add(S, box(cx - w / 2, y + 1.4, cz - w / 2, cx + w / 2, y + 1.4 + h * 0.35, cz + w / 2)); col.rect([cx - w / 2, cz - w / 2, cx + w / 2, cz + w / 2], y, y + h * 0.4);
  shikhara(bag, cx, cz, y + 1.4 + h * 0.35, w * 0.9, h * 0.6, S, 9);
}
registerStyle('nagara', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.qing.elements, nagara_temple: temple, sub_shrine: shrine },
  objects: {},
});
