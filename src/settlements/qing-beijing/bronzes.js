// The bronze crane and tortoise of the terrace before the Hall of Supreme Harmony, rebuilt (docs/settlements/qing-beijing.md §36):
// the crane standing on long jointed legs, its wings of overlapping flight feathers, tail plumes, an S-curved neck and a
// long open beak (the bronzes are hollow, for burning sandalwood at the great ceremonies); the tortoise with a domed
// carapace laid with raised hexagonal scutes, a dragon's head, claws. bj_bronze wraps the style's `bronze`: these two kinds
// are drawn here, the rest by the style.
import { STYLES } from '../../core/build.js';
import { lathe, fromTriangles, orientOutward } from '../../core/geom.js';
import { Parts, ball, limb, T, sumeru } from '../../styles/qing/carving.js';

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

function bjBronze(el, ctx) {
  const k = el.kind;
  if (k !== 'crane' && k !== 'tortoise') return STYLES.qing.elements.bronze(el, ctx);
  const { bag, col } = ctx, [x, z] = el.at, y = el.y ?? 0, s = el.s ?? 1, f = el.face ?? [0, 1], yaw = Math.atan2(f[0], f[1]), P = new Parts();
  if (k === 'crane') { crane(P); col.circle(x, z, 0.55 * s, y, y + 2.6 * s); } else { tortoise(P); col.rect([x - 0.9 * s, z - 1.1 * s, x + 0.9 * s, z + 1.1 * s], y, y + 1.8 * s); }
  P.emit(bag, x, y, z, yaw, s);
}
STYLES.qing.elements.bj_bronze = bjBronze;
