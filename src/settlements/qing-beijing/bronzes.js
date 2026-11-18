// The bronze crane and tortoise of the terrace before the Hall of Supreme Harmony, rebuilt (docs/settlements/qing-beijing.md §36):
// the crane standing on long jointed legs, its wings of overlapping flight feathers, tail plumes, an S-curved neck and a
// long open beak (the bronzes are hollow, for burning sandalwood at the great ceremonies); the tortoise with a domed
// carapace laid with raised hexagonal scutes, a dragon's head, claws. bj_bronze wraps the style's `bronze`: these two kinds
// are drawn here, the rest by the style.
import { STYLES } from '../../core/build.js';
import { lathe, fromTriangles, orientOutward, frustum, box } from '../../core/geom.js';
import { Parts, ball, limb, T, sumeru } from '../../styles/qing/carving.js';
import { buildLion, plinth } from './lion.js';
import { ell, ring, cloudScroll, curve, h01 } from './sculpt.js';

const B = 'bronze';
const hexPlate = (P, c, y, r, h, rot = 0) => {
  const pts = Array.from({ length: 6 }, (_, i) => [c[0] + r * Math.cos(rot + i * Math.PI / 3), c[1] + r * Math.sin(rot + i * Math.PI / 3)]), t = [];
  for (let i = 1; i < 5; i++) t.push(pts[0][0], y + h, pts[0][1], pts[i + 1][0], y + h, pts[i + 1][1], pts[i][0], y + h, pts[i][1]);
  for (let i = 0; i < 6; i++) { const a = pts[i], b = pts[(i + 1) % 6]; t.push(a[0], y, a[1], b[0], y, b[1], b[0], y + h, b[1], a[0], y, a[1], b[0], y + h, b[1], a[0], y + h, a[1]); }
  orientOutward(t);
  P.add(B, fromTriangles(t));
};

/** The crane on its pedestal, facing +z, 1.98 m to the crown. */
function crane(P) {
  sumeru(P, 'marble', -0.5, -0.5, 0.5, 0.5, 0.55);
  const y = 0.55, b = (rx, ry, rz, x, yy, z, n = 8, m = 4) => P.add(B, T(ball(rx, ry, rz, n, m), x, y + yy, z));
  b(0.22, 0.2, 0.44, 0, 0.86, 0, 10, 5);                           // the body
  b(0.17, 0.17, 0.2, 0, 0.9, 0.34, 8, 3);                          // the breast
  for (const sx of [-1, 1]) {
    // the legs: thigh, shank, foot with three toes
    P.add(B, limb([sx * 0.08, y + 0.72, -0.02], [sx * 0.08, y + 0.4, 0.0], 0.034, 0.024, 5));
    P.add(B, limb([sx * 0.08, y + 0.4, 0.0], [sx * 0.08, y + 0.02, 0.06], 0.022, 0.02, 5));
    for (const dx of [-0.05, 0, 0.05]) P.add(B, limb([sx * 0.08, y + 0.025, 0.06], [sx * 0.08 + dx, y + 0.012, 0.2], 0.014, 0.008, 3));
    // the folded wing: five flight feathers, each longer, overlapping, the tips crossing over the tail
    for (let k = 0; k < 5; k++) P.add(B, T(ball(0.03, 0.05, 0.3 + k * 0.035, 5, 2), sx * (0.205 + k * 0.004), y + 0.9 - k * 0.055, -0.1 - k * 0.07));
    P.add(B, T(ball(0.035, 0.14, 0.26, 5, 2), sx * 0.2, y + 0.99, 0.02));       // the shoulder coverts
  }
  for (const k of [-1, 0, 1]) P.add(B, limb([k * 0.05, y + 0.84, -0.36], [k * 0.12, y + 0.7, -0.78], 0.03, 0.006, 3));        // the tail plumes
  // the S-curved neck, the head, the long beak (two parts, a little open), the crest
  const neck = [[0, 0.98, 0.36], [0, 1.1, 0.5], [0, 1.24, 0.44], [0, 1.36, 0.47]];
  for (let i = 0; i + 1 < neck.length; i++) P.add(B, limb([neck[i][0], y + neck[i][1], neck[i][2]], [neck[i + 1][0], y + neck[i + 1][1], neck[i + 1][2]], 0.085 - i * 0.015, 0.075 - i * 0.015, 6));
  b(0.075, 0.07, 0.11, 0, 1.4, 0.5, 7, 3);
  P.add(B, limb([0, y + 1.42, 0.56], [0, y + 1.38, 1.0], 0.026, 0.005, 4));
  P.add(B, limb([0, y + 1.39, 0.56], [0, y + 1.31, 0.96], 0.02, 0.005, 4));
  for (const sx of [-1, 1]) b(0.018, 0.018, 0.018, sx * 0.06, 1.44, 0.52, 4, 2);
  b(0.04, 0.05, 0.06, 0, 1.5, 0.46, 5, 2);
}

/** The tortoise with a dragon's head on its pedestal, facing +z. */
function tortoise(P) {
  sumeru(P, 'marble', -0.8, -1.0, 0.8, 1.0, 0.7);
  const y = 0.7, b = (rx, ry, rz, x, yy, z, n = 8, m = 3) => P.add(B, T(ball(rx, ry, rz, n, m), x, y + yy, z));
  b(0.6, 0.1, 0.76, 0, 0.24, -0.02, 14, 2);                         // the plastron's rim and the carapace's skirt
  // the carapace: a dome of 14 sides; its height 0.38
  P.add(B, lathe([[0.001, 0.26], [0.56, 0.27], [0.58, 0.36], [0.5, 0.56], [0.3, 0.66], [0.001, 0.69]].map(([r, h]) => [r, h]), 14, null, 0, y, 0).scale(1, 1, 1.28));
  const prof = [[0, 0.69], [0.52, 0.66], [0.86, 0.56], [1, 0.36]];
  const dome = (x, z) => { const q = Math.min(1, Math.hypot(x / 0.58, z / 0.74)); for (let i = 0; i + 1 < prof.length; i++) if (q <= prof[i + 1][0]) return prof[i][1] + (prof[i + 1][1] - prof[i][1]) * (q - prof[i][0]) / (prof[i + 1][0] - prof[i][0]); return 0.36; };
  // the raised scutes: the central one and the ring round it, the marginal row
  hexPlate(P, [0, -0.02], y + dome(0, -0.02) - 0.01, 0.18, 0.04);
  for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3 + Math.PI / 6, x = Math.cos(a) * 0.34, z = -0.02 + Math.sin(a) * 0.44; hexPlate(P, [x, z], y + dome(x, z) - 0.02, 0.15, 0.04, Math.PI / 6); }
  for (const [x, z] of [[0, 0.46], [0, -0.5], [0.34, 0.28], [-0.34, 0.28], [0.38, -0.26], [-0.38, -0.26]]) hexPlate(P, [x, z], y + dome(x, z) - 0.02, 0.1, 0.03);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    P.add(B, limb([sx * 0.44, y + 0.28, sz * 0.5], [sx * 0.62, y + 0.04, sz * 0.66], 0.12, 0.09, 5));
    b(0.13, 0.05, 0.15, sx * 0.64, 0.03, sz * 0.7, 6, 2);
    for (const dx of [-0.07, 0, 0.07]) P.add(B, limb([sx * 0.64 + dx, y + 0.04, sz * 0.78], [sx * 0.64 + dx * 1.2, y + 0.02, sz * 0.9], 0.02, 0.006, 3));        // the claws
  }
  // the neck with its ridge of scales, the dragon's head with open jaws, horns, whiskers, mane
  P.add(B, limb([0, y + 0.3, 0.6], [0, y + 0.82, 0.98], 0.15, 0.12, 6));
  for (let k = 0; k < 4; k++) b(0.03, 0.04, 0.04, 0, 0.42 + k * 0.1, 0.7 + k * 0.1, 4, 2);
  b(0.16, 0.14, 0.22, 0, 0.9, 1.06, 8, 3);                          // the skull
  P.add(B, limb([0, y + 0.86, 1.14], [0, y + 0.84, 1.42], 0.1, 0.07, 5));            // the muzzle, the nose bulb at its end
  b(0.075, 0.05, 0.06, 0, 0.87, 1.43, 5, 2);
  P.add(B, limb([0, y + 0.8, 1.12], [0, y + 0.74, 1.36], 0.07, 0.04, 4));            // the lower jaw
  for (const sx of [-1, 1]) {
    P.add(B, limb([sx * 0.07, y + 1.0, 1.0], [sx * 0.14, y + 1.3, 0.84], 0.035, 0.008, 4));      // the horns
    P.add(B, limb([sx * 0.07, y + 0.84, 1.38], [sx * 0.28, y + 0.78, 1.2], 0.012, 0.004, 3));    // the whiskers
    b(0.03, 0.03, 0.03, sx * 0.11, 0.94, 1.22, 4, 2);                                            // the eyes
    P.add(B, T(ball(0.04, 0.1, 0.07, 5, 2), sx * 0.15, y + 0.92, 1.04));                        // the fins at the cheeks
  }
  b(0.05, 0.04, 0.12, 0, 0.99, 0.98, 5, 2);                          // the mane
  P.add(B, limb([0, y + 0.3, -0.72], [0, y + 0.14, -1.02], 0.08, 0.015, 5));       // the tail
}


const XA = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
/** The sundial (rigui): the dial of white marble set in the plane of the equator, its rim moulded, the ring of 96 raised graduations (the ke)
 *  and the twelve hours' pads on it, the bronze gnomon through its middle toward the pole, the pedestal carved with lotus petals. */
function sundial(P, lat = 40) {
  plinth(P, 'marble', -0.75, -0.75, 0.75, 0.75, 1.3);
  const yt = (z) => 1.85 + z / Math.tan(lat * Math.PI / 180) - 0.07, w = [];
  const tilt = -(90 - lat) * Math.PI / 180, put = (g) => { g.rotateX(tilt); g.translate(0, 1.85, 0); return g; };
  // the bracket under the dial: a wedge of marble with a scrolled front
  P.add('marble', box(-0.2, 1.3, -0.3, 0.2, 1.62, 0.25));
  void yt; void w;
  P.add('marble_smooth', put(lathe([[0.001, -0.07], [0.6, -0.07], [0.66, -0.05], [0.66, 0.02], [0.64, 0.06], [0.62, 0.06], [0.62, 0.07], [0.001, 0.07]], 40)));
  for (const s of [-1, 1]) { const r = ring([0, s * 0.075, 0], 0.5, 0.012, [0, 1, 0], 40, 4); P.add('bronze', put(r)); const r2 = ring([0, s * 0.075, 0], 0.3, 0.008, [0, 1, 0], 32, 4); P.add('bronze', put(r2)); }
  for (let k = 0; k < 96; k++) { const a = k * Math.PI / 48, big = k % 8 === 0, l = big ? 0.15 : 0.07, g2 = box(-0.007, 0.07, 0.5 - l / 2 + 0.2 - 0.2, 0.007, 0.082, 0.5 + l / 2); g2.rotateY(a); P.add('bronze', put(g2)); }
  for (let k = 0; k < 12; k++) { const a = k * Math.PI / 6; P.add('bronze', put(ell([Math.sin(a) * 0.57, 0.075, Math.cos(a) * 0.57], [0.035, 0.012, 0.035], XA, 7, 3))); }
  P.add('iron', put(lathe([[0.016, -0.55], [0.016, 0.5], [0.001, 0.54]], 8)));
  P.add('bronze', put(ell([0, 0.55, 0], [0.025, 0.025, 0.025], XA, 6, 4)));
  P.add('bronze', put(lathe([[0.001, 0.07], [0.05, 0.07], [0.04, 0.12], [0.02, 0.18]], 10)));
}
/** The grain measure (jialiang) in its square shrine on a carved plinth: marble corner posts with carved capitals, the parapet with cloud scrolls,
 *  the bronze measure with bands and handles, the canopy over it. */
function jialiang(P) {
  plinth(P, 'marble', -0.8, -0.8, 0.8, 0.8, 1.3);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    P.add('marble', box(sx * 0.62 - 0.08, 1.3, sz * 0.62 - 0.08, sx * 0.62 + 0.08, 2.15, sz * 0.62 + 0.08));
    P.add('marble_smooth', lathe([[0.1, 0], [0.12, 0.03], [0.09, 0.07], [0.12, 0.12], [0.1, 0.15]], 8, null, sx * 0.62, 2.15, sz * 0.62));
  }
  for (const [a, b] of [[[-0.7, -0.7], [0.7, -0.62]], [[-0.7, 0.62], [0.7, 0.7]], [[-0.7, -0.62], [-0.62, 0.62]], [[0.62, -0.62], [0.7, 0.62]]]) P.add('marble', box(a[0], 2.15, a[1], b[0], 2.3, b[1]));
  // the parapet's panels between the posts: a low wall carved with cloud scrolls on the outer face
  for (const [sx, sz, along] of [[0, -1, true], [0, 1, true], [-1, 0, false], [1, 0, false]]) {
    const o = 0.7 * (along ? sz : sx);
    if (along) P.add('marble', box(-0.54, 1.3, o - 0.04, 0.54, 1.58, o + 0.04)); else P.add('marble', box(o - 0.04, 1.3, -0.54, o + 0.04, 1.58, 0.54));
    for (const x of [-0.27, 0.27]) for (const gg of cloudScroll(x, 1.42, 0.3, 0.015, x < 0 ? 1 : -1)) { const q = gg.clone(); if (along) { if (sz > 0) q.translate(0, 0, o + 0.04); else { q.rotateY(Math.PI); q.translate(0, 0, o - 0.04); } } else { q.rotateY(sx > 0 ? Math.PI / 2 : -Math.PI / 2); q.translate(o + (sx > 0 ? 0.04 : -0.04), 0, 0); } P.add('marble', q); }
  }
  P.add('marble', box(-0.7, 2.3, -0.7, 0.7, 2.36, 0.7));
  P.add('bronze', lathe([[0.3, 0], [0.32, 0.05], [0.3, 0.42], [0.33, 0.46], [0.27, 0.46], [0.27, 0.12], [0.001, 0.12]], 20, null, 0, 1.3, 0));
  for (const y of [1.42, 1.58, 1.7]) P.add('bronze', ring([0, y, 0], 0.318, 0.012, [0, 1, 0], 24, 4));
  for (const sx of [-1, 1]) { const r = ring([sx * 0.33, 1.65, 0], 0.07, 0.014, [0, 0, 1], 14, 4); P.add('bronze', r); P.add('bronze', ell([sx * 0.31, 1.65, 0], [0.03, 0.05, 0.05], XA, 6, 4)); }
  P.add('marble_smooth', frustum([-0.86, -0.86, 0.86, 0.86], 2.36, 2.46, 0, 0, 0, 0));
  P.add('marble_smooth', frustum([-0.86, -0.86, 0.86, 0.86], 2.46, 2.9, 0.72, 0.72, 0.72, 0.72));
  for (let k = 0; k < 4; k++) P.add('marble_smooth', ell([Math.cos(k * Math.PI / 2) * 0.82, 2.4, Math.sin(k * Math.PI / 2) * 0.82], [0.06, 0.05, 0.06], XA, 6, 4));
  P.add('marble_smooth', lathe([[0.16, 0], [0.18, 0.06], [0.1, 0.14], [0.13, 0.24], [0.05, 0.34], [0.001, 0.38]], 10, null, 0, 2.88, 0));
}

function bjBronze(el, ctx) {
  const k = el.kind;
  if (k !== 'crane' && k !== 'tortoise' && k !== 'lion' && k !== 'sundial' && k !== 'jialiang') return STYLES.qing.elements.bronze(el, ctx);
  const { bag, col } = ctx, [x, z] = el.at, y = el.y ?? 0, s = el.s ?? 1, f = el.face ?? [0, 1], yaw = Math.atan2(f[0], f[1]), P = new Parts();
  if (k === 'lion') {
    buildLion(P, el.metal ?? 'bronze', el.stone ?? 'marble', { paw: el.paw, fine: !!el.fine, ped: el.ped ?? 1.4 });
    if (!el.fine) col.rect([x - 1.1 * s, z - 1.5 * s, x + 1.1 * s, z + 1.5 * s], y, y + 3.8 * s);
    P.emit(bag, x, y, z, yaw, s); return;
  }
  if (k === 'sundial') { sundial(P, el.lat ?? 40); col.rect([x - 0.8 * s, z - 0.8 * s, x + 0.8 * s, z + 0.8 * s], y, y + 2.4 * s); P.emit(bag, x, y, z, yaw, s); return; }
  if (k === 'jialiang') { jialiang(P); col.rect([x - 0.85 * s, z - 0.85 * s, x + 0.85 * s, z + 0.85 * s], y, y + 3.2 * s); P.emit(bag, x, y, z, yaw, s); return; }
  if (k === 'crane') { crane(P); col.circle(x, z, 0.55 * s, y, y + 2.6 * s); } else { tortoise(P); col.rect([x - 0.9 * s, z - 1.1 * s, x + 0.9 * s, z + 1.1 * s], y, y + 1.8 * s); }
  P.emit(bag, x, y, z, yaw, s);
}
STYLES.qing.elements.bj_bronze = bjBronze;
