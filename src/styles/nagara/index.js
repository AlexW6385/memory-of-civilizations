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
/** A stepped pyramidal roof over a hall. */
function stepped(bag, r, y, h, mat = S, n = 7) {
  const [x0, z0, x1, z1] = r, w = x1 - x0, d = z1 - z0;
  for (let i = 0; i < n; i++) {
    const f0 = 1 - 0.8 * i / n, f1 = 1 - 0.8 * (i + 1) / n, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
    bag.add(mat, frustum([cx - w * f0 / 2, cz - d * f0 / 2, cx + w * f0 / 2, cz + d * f0 / 2], y + h * i / n, y + h * (i + 1) / n, w * (f0 - f1) / 2, w * (f0 - f1) / 2, d * (f0 - f1) / 2, d * (f0 - f1) / 2));
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
  // the halls' walls with their sculpture bands, from the sanctum eastward, each roof lower
  const halls = [[cx - W / 2, W, H * 0.3, null], [cx + W / 2, L * 0.16, H * 0.27, 0.55], [cx + W / 2 + L * 0.16, L * 0.3, H * 0.27, 0.62], [cx + W / 2 + L * 0.46, L * 0.2, H * 0.24, 0.48], [cx + W / 2 + L * 0.66, L * 0.18, H * 0.2, 0.34]];
  halls.forEach(([x, len, wh, roofH], i) => {
    const hw = i === 0 ? W / 2 : W * (i === 2 ? 0.48 : 0.36), r = [x, cz - hw, x + len, cz + hw];
    if (i === 4) { for (const [px, pz] of [[r[0] + 0.6, r[1] + 0.6], [r[2] - 0.6, r[1] + 0.6], [r[0] + 0.6, r[3] - 0.6], [r[2] - 0.6, r[3] - 0.6]]) { bag.add(S, box(px - 0.4, y + plinth, pz - 0.4, px + 0.4, y + plinth + wh, pz + 0.4)); col.rect([px - 0.4, pz - 0.4, px + 0.4, pz + 0.4], y, y + plinth + wh); } }
    else { bag.add(S, box(r[0], y + plinth, r[1], r[2], y + plinth + wh, r[3])); col.rect(r, y, y + plinth + wh); }
    for (const k of [0.3, 0.62]) bag.add('sandstone', box(r[0] - 0.05, y + plinth + wh * k, r[1] - 0.05, r[2] + 0.05, y + plinth + wh * k + wh * 0.22, r[3] + 0.05));
    if (i > 0) stepped(bag, [r[0] - 0.4, r[1] - 0.6, r[2] + 0.4, r[3] + 0.6], y + plinth + wh, H * roofH * 0.45);
  });
  // the sanctum's tower with its climbing cluster
  const ty = y + plinth + H * 0.3, th = H - plinth - H * 0.3;
  shikhara(bag, cx, cz, ty, W * 0.86, th);
  if (!el.simple) for (const [ox, oz, s] of [[-0.42, 0, 0.62], [0, -0.42, 0.62], [0, 0.42, 0.62], [0.42, 0, 0.55], [-0.36, -0.36, 0.42], [-0.36, 0.36, 0.42], [0.36, -0.36, 0.42], [0.36, 0.36, 0.42]]) shikhara(bag, cx + ox * W, cz + oz * W, ty, W * 0.86 * s * 0.6, th * s, S, 8);
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
