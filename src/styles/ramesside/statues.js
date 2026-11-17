// The statues of the Ramesside temples, modelled in lofts (rings of points, as the falcon and the Sphinx of the other Egyptian
// styles): the seated colossi of the Great Temple's front, the small royal statues at their feet, the baboons of the
// cornice, the Osiride pillar statues of the first hall, the four gods of the sanctuary, Ra-Horakhty in his niche, the
// standing colossi of the Small Temple, Hathor's pillars and Hathor as the cow. Each builder returns { material: [geometry] }
// in its own frame: the statue faces −z, stands on y = 0, its middle on x = 0, z = 0 (the spine's plane).

import { box, rod, lathe, frustum } from '../../core/geom.js';
import { loft, ring } from '../egyptian/objects.js';

const X = [1, 0, 0], Zb = [0, 0, -1], Y = [0, 1, 0];
/** Horizontal rings: rows of [y, cz, half-width, half-depth, cx = 0]. */
const rows = (R, n = 20, shape, caps) => loft(R.map(([y, cz, a, b, cx = 0]) => ring([cx, y, cz], X, Zb, a, b, n, shape)), caps);
/** An ellipsoid at c with radii r. */
function ell(c, r, n = 14, m = 8) {
  const R = [];
  for (let i = 1; i < m; i++) { const p = -Math.PI / 2 + Math.PI * i / m; R.push([c[1] + Math.sin(p) * r[1], c[2], Math.cos(p) * r[0], Math.cos(p) * r[2], c[0]]); }
  return rows(R, n);
}
const add = (o, m, g) => { (o[m] ??= []).push(g); return o; };
const mirror = (f) => [-1, 1].map(f);

/** Rings stacked along z (for limbs lying toward the front): rows of [z, cx, cy, half-width, half-height]. */
const along = (R, n = 16, caps) => loft(R.map(([z, cx, cy, a, b]) => ring([cx, cy, z], X, Y, a, b, n)), caps);
/** A row table's half-width at height y (linear between its rows), for bands laid on a headdress. */
const widthAt = (R, y) => { for (let i = 0; i + 1 < R.length; i++) if (y <= R[i + 1][0]) { const t = (y - R[i][0]) / (R[i + 1][0] - R[i][0]); return [R[i][2] + (R[i + 1][2] - R[i][2]) * t, R[i][3] + (R[i + 1][3] - R[i][3]) * t, R[i][1] + (R[i + 1][1] - R[i][1]) * t]; } return [R[R.length - 1][2], R[R.length - 1][3], R[R.length - 1][1]]; };

/** The paints of the heads and bodies (the Small Temple's figures use the materials its plan already has, to keep its draws down). */
const GREAT_PAL = { K: 'paint_robe', G: 'paint_ochre', BK: 'paint_minoan_black', WH: 'paint_white' };
let PAL = GREAT_PAL;

/** The z a head's surface lies at at (x, y), for a head of centre c and radii r (forward is −z). */
const headZ = (c, r) => (x, y) => c[2] - r[2] * Math.sqrt(Math.max(0.03, 1 - (x / r[0]) ** 2 - ((y - c[1]) / r[1]) ** 2));

/**
 * The features of a king's face on an ellipsoid head (centre c, radii r): cheeks, the brow ridges with the black painted brows, the lids, the
 * white eyeballs with their irises and the cosmetic line to the ear, the bridge and tip of the nose with its wings, the full lips with the
 * smile's corners, the chin, the ears. Everything is laid on the head's own surface, so nothing floats.
 */
function face(o, K, c, r, lip = 'limewash_red') {
  const sz = headZ(c, r), [rx, ry, rz] = r;
  const at = (x, f, dz, rr, m = K) => { const y = c[1] + f * ry; add(o, m, ell([x, y, sz(x, y) + dz * rz], [rr[0] * rx, rr[1] * ry, rr[2] * rz], 10, 6)); };
  for (const s of [-1, 1]) {
    at(s * 0.5 * rx, -0.2, 0.3, [0.34, 0.2, 0.16]);                                   // the cheek
    at(s * 0.42 * rx, 0.43, 0.2, [0.38, 0.055, 0.12]);                                 // the brow ridge
    at(s * 0.42 * rx, 0.5, -0.07, [0.4, 0.022, 0.04], PAL.BK);          // the brow, painted
    at(s * 0.42 * rx, 0.3, 0.3, [0.27, 0.07, 0.09]);                                  // the lids
    at(s * 0.42 * rx, 0.3, -0.03, [0.2, 0.045, 0.05], PAL.WH);                 // the eyeball
    at(s * 0.42 * rx, 0.3, -0.075, [0.07, 0.04, 0.03], PAL.BK);         // the iris
    const y = c[1] + 0.3 * ry;
    add(o, PAL.BK, rod([s * 0.62 * rx, y, sz(s * 0.62 * rx, y) - 0.02 * rz], [s * 0.93 * rx, y, sz(s * 0.93 * rx, y) - 0.02 * rz], 0.03 * ry, 5));   // the cosmetic line
    at(s * 0.13 * rx, -0.06, -0.02, [0.09, 0.07, 0.1]);                               // the wing of the nostril
    at(s * 0.33 * rx, -0.43, 0.1, [0.07, 0.04, 0.05]);                                // the corner of the smile
    add(o, K, ell([s * 0.99 * rx, c[1] + 0.12 * ry, c[2] + 0.15 * rz], [0.1 * rx, 0.21 * ry, 0.13 * rz], 8, 5));   // the ear
  }
  at(0, 0.2, 0.05, [0.1, 0.28, 0.12]);                                                // the bridge
  at(0, -0.03, -0.18, [0.15, 0.09, 0.2]);                                             // the tip
  at(0, -0.4, -0.03, [0.3, 0.05, 0.085], lip);                                        // the upper lip
  at(0, -0.48, -0.02, [0.25, 0.05, 0.075], lip);                                      // the lower
  at(0, -0.435, -0.1, [0.33, 0.012, 0.02], PAL.BK);                     // the line of the mouth
  at(0, -0.72, -0.1, [0.3, 0.14, 0.2]);                                               // the chin
}

/** A royal cartouche on a face (the oval of the name, its bar, three signs on a white plate): centre (x, y, z), the face's normal along `ax` ('x' | 'z') toward `dir`, h high. */
function cartouche(o, x, y, z, ax, dir, h) {
  const w = h * 0.4, d = 0.06, P = (u, v, n) => (ax === 'x' ? [x + dir * n, y + v, z + u] : [x + u * dir, y + v, z + dir * n]);
  const bx = (u0, v0, u1, v1, n0, n1) => { const a = P(u0, v0, n0), b = P(u1, v1, n1); return box(Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.min(a[2], b[2]), Math.max(a[0], b[0]), Math.max(a[1], b[1]), Math.max(a[2], b[2])); };
  add(o, 'paint_white', bx(-w / 2, -h / 2, w / 2, h / 2, 0, d));
  const pts = []; for (let k = 0; k < 14; k++) { const t = k / 14 * Math.PI * 2, c = Math.cos(t), s = Math.sin(t); pts.push([Math.sign(c) * Math.abs(c) ** 0.5 * w / 2, Math.sign(s) * Math.abs(s) ** 0.6 * h / 2]); }
  for (let k = 0; k < 14; k++) { const a = pts[k], b = pts[(k + 1) % 14]; add(o, 'paint_ochre', rod(P(a[0], a[1], d + 0.01), P(b[0], b[1], d + 0.01), 0.03 * h / 2.2 + 0.015, 5)); }
  add(o, 'paint_ochre', bx(-w / 2 - 0.08, -h / 2 - 0.1, w / 2 + 0.08, -h / 2 - 0.02, 0, d + 0.03));       // the bar
  [[-0.3, 0.2], [0, 0.26], [0.3, 0.16]].forEach(([v, ww]) => add(o, 'paint_minoan_black', bx(-ww * w, v * h - 0.07 * h, ww * w, v * h + 0.07 * h, d, d + 0.03)));   // the signs
}

/** The jagged top of a broken stone (a ring with a rough edge). */
const rough = (seed, amp = 0.1) => (t) => 1 + amp * Math.sin(5 * t + seed) + amp * 0.6 * Math.sin(11 * t + 2 * seed);

/**
 * The head of a colossus (its own frame as the colossus': centre of the head at y 15.35, faces −z): the face, the nemes (a dome over the
 * skull with the headband across the brow, the cloth falling behind the ears, the flat wings that flare at the sides, the two lappets
 * on the chest, the stripes in gold), the uraeus, the false beard, the red crown over the white. Also the broken head's.
 */
function colossusHead(o, crown = 'double') {
  const S = 'sandstone_dressed', K = PAL.K, B = 'egyptian_blue', G = PAL.G, RD = 'limewash_red', W = 'plaster_white';
  const c = [0, 15.35, -0.5], r = [1.08, 1.65, 1.1];
  add(o, K, ell(c, r, 20, 11));                                                       // the skull and face
  face(o, K, c, r);
  // the cloth: the dome with the headband (a full ring) above the brow, below it only the sides and the back
  const mask = (pull) => (t) => 1 - pull * Math.min(1, Math.max(0, (Math.sin(t) + 0.38) / 0.2));
  const DOME = [[14.1, -0.15, 1.2, 1.3, 0.62], [14.8, -0.3, 1.35, 1.35, 0.6], [15.6, -0.35, 1.3, 1.3, 0.55], [16.3, -0.45, 1.05, 1.12, 0], [16.9, -0.45, 1.15, 1.2, 0], [17.5, -0.4, 1.1, 1.15, 0], [18.0, -0.4, 0.7, 0.75, 0], [18.2, -0.4, 0.25, 0.28, 0]];
  const cloth = (R, e = 0, n = 32) => loft(R.map(([y, cz, a, b, pull]) => ring([0, y, cz], X, Zb, a + e, b + e, n, pull ? mask(pull) : null)));
  add(o, B, cloth(DOME));
  for (const [y, pull, a, b, cz] of [[15.9, 0, 1.18, 1.2, -0.42], [16.55, 0, 1.12, 1.17, -0.45], [17.2, 0, 1.12, 1.17, -0.42], [15.2, 0.6, 1.33, 1.33, -0.32], [14.5, 0.62, 1.28, 1.3, -0.25]]) {
    add(o, G, loft([y - 0.07, y + 0.07].map((yy) => ring([0, yy, cz], X, Zb, a + 0.04, b + 0.04, 32, pull ? mask(pull) : null))));   // the gold stripes
  }
  add(o, G, loft([16.22, 16.36].map((y) => ring([0, y, -0.45], X, Zb, 1.09, 1.16, 32))));   // the headband's edge
  for (const s of [-1, 1]) {
    const WING = [[16.0, 0.3, 0.16, 1.0, 1.28], [15.2, 0.4, 0.2, 1.2, 1.5], [14.4, 0.45, 0.22, 1.3, 1.8], [13.6, 0.5, 0.18, 1.15, 2.0]];
    add(o, B, rows(WING.map(([y, z, a, b, x]) => [y, z, a, b, s * x]), 16));          // the wing of the cloth
    for (const k of [1, 2, 3]) add(o, G, rows([[WING[k][0] + 0.1, WING[k][1], WING[k][2] + 0.03, WING[k][3] + 0.03, s * WING[k][4]], [WING[k][0] - 0.05, WING[k][1], WING[k][2] + 0.03, WING[k][3] + 0.03, s * WING[k][4]]], 16));
    const LAP = [[13.9, -0.9, 0.5, 0.4], [12.6, -1.15, 0.55, 0.32], [11.5, -1.25, 0.55, 0.3]], cx = s * 1.55;
    add(o, B, rows(LAP.map(([y, z, a, b]) => [y, z, a, b, cx]), 12));
    for (const y of [13.4, 13.0, 12.6, 12.2, 11.8]) {
      const i = y > 12.6 ? 0 : 1, t = (LAP[i][0] - y) / (LAP[i][0] - LAP[i + 1][0]), m = (k) => LAP[i][k] + (LAP[i + 1][k] - LAP[i][k]) * t;
      add(o, G, rows([[y + 0.06, m(1), m(2) + 0.04, m(3) + 0.04, cx], [y - 0.06, m(1), m(2) + 0.04, m(3) + 0.04, cx]], 12));
    }
  }
  add(o, G, ell([0, 16.62, -1.65], [0.12, 0.32, 0.1], 8, 5)); add(o, G, ell([0, 17.0, -1.62], [0.2, 0.13, 0.1], 8, 5));   // the uraeus
  add(o, B, box(-0.24, 12.5, -1.6, 0.24, 14.1, -1.14)); for (const y of [12.75, 13.05, 13.35, 13.65, 13.95]) add(o, G, box(-0.26, y, -1.62, 0.26, y + 0.1, -1.12));   // the false beard, plaited
  add(o, B, rod([0, 12.5, -1.4], [0, 12.2, -1.75], 0.2, 6));                          // its curled tip
  if (crown === 'white') add(o, W, rows([[17.4, -0.1, 1.15, 1.15], [18.6, -0.1, 1.0, 1.0], [19.6, -0.1, 0.7, 0.7], [20.4, -0.1, 0.25, 0.25]], 20));   // the white crown alone
  else {
  add(o, RD, rows([[17.4, 0.25, 1.2, 1.2], [18.3, 0.25, 1.25, 1.25], [18.85, 0.25, 1.05, 1.05]], 20));   // the red crown
  add(o, W, rows([[18.75, 0.25, 0.88, 0.72], [19.4, 0.25, 0.8, 0.66], [19.85, 0.25, 0.5, 0.4], [20.0, 0.25, 0.18, 0.16]], 20));   // the white crown inside it
  add(o, RD, box(-0.3, 18.6, 0.75, 0.3, 19.7, 1.05));                                  // the tall back of the red crown
  add(o, RD, rod([0, 18.85, -0.8], [0, 19.75, -0.85], 0.07, 6)); add(o, G, ell([0, 19.8, -0.85], [0.11, 0.11, 0.11], 6, 4));   // the curl at its front
  }
  void S;
}

/**
 * The seated colossus of Ramesses II on the Great Temple's front: 20 m with the double crown, the nemes with its lappets,
 * the false beard, the shendyt kilt, the hands flat on the thighs, the shins and feet on the plinth, a back slab to the
 * rock. Painted as such statues were (the skin red-brown, the kilt white, the nemes in blue and gold bands, the crowns red
 * and white) so that the four read against the pale rock; modelled in rounded limbs, not blocks. Origin: the spine's plane,
 * floor level; faces −z. `broken`: the one whose upper body fell (the second from the left): the torso ends in a rough break at the waist.
 */
export function colossus(broken = false) {
  const o = {}, S = 'sandstone_dressed', K = 'paint_robe', W = 'plaster_white', B = 'egyptian_blue', G = 'paint_ochre', RD = 'limewash_red';
  // the ground field behind each figure: a panel leaning back with the façade, darker than the dressed face, so that the figure stands out of it
  add(o, 'sandstone_relief', frustum([-3.9, 0.5, 3.9, 3.8], 0.5, 21.2, 0, 0, 1.55, 0));
  add(o, S, box(-3.8, 0, -7.6, 3.8, 0.5, 2.0));                                     // the plinth
  add(o, 'sandstone_floor', box(-3.3, 0.5, -7.1, 3.3, 0.62, -4.6));                  // the step the feet stand on
  // the nine bows (the king's enemies) on the plinth's front, each a white oval with its dark mark
  for (let k = 0; k < 9; k++) { const x = -3.2 + k * 0.8; add(o, 'paint_white', ell([x, 0.26, -7.6], [0.28, 0.17, 0.05], 8, 4)); add(o, 'paint_minoan_black', ell([x, 0.26, -7.66], [0.12, 0.07, 0.03], 6, 3)); }
  // the throne: the block between and behind the legs, its sides panelled with the sema-tawy (the lungs and trachea tied by lotus and papyrus)
  add(o, S, box(-3.5, 0.5, -4.4, 3.5, 5.2, 2.0));
  add(o, S, box(-0.8, 0.5, -5.55, 0.8, 5.2, -4.3));                                  // the web between the shins
  cartouche(o, 0, 3.2, -5.55, 'z', -1, 2.2);                                          // the name on the web
  for (const s of [-1, 1]) {
    const x = s * 3.5, d = s * 0.07, a = Math.min(x, x + d), b = Math.max(x, x + d);
    add(o, G, box(a, 1.3, -3.9, b, 4.5, -0.6));                                      // the panel's frame
    add(o, B, box(Math.min(x, x + 2 * d), 1.55, -3.6, Math.max(x, x + 2 * d), 4.25, -0.9));
    add(o, W, box(Math.min(x, x + 3 * d), 2.7, -2.6, Math.max(x, x + 3 * d), 3.1, -1.9));  // the tied knot of the sign
    for (const z of [-3.1, -1.4]) add(o, G, box(Math.min(x, x + 3 * d), 1.7, z - 0.12, Math.max(x, x + 3 * d), 4.1, z + 0.12));   // the two stems
    for (const z of [0.4, 1.4]) cartouche(o, x, 2.9, z, 'x', s, 2.2);                 // the king's two names, behind the panel
  }
  // the legs: round thighs under the kilt, the knees, the shins and calves, the feet with their toes
  for (const s of [-1, 1]) {
    const cx = s * 1.85;
    add(o, K, along([[0.9, cx, 6.0, 1.0, 0.95], [-1.2, cx, 6.05, 1.02, 0.97], [-3.6, cx, 6.1, 0.98, 0.93], [-5.55, cx, 6.0, 0.9, 0.85]], 16));
    add(o, K, ell([cx, 5.85, -5.5], [0.92, 0.95, 0.7], 14, 7));                       // the knee
    add(o, K, rows([[5.3, -5.0, 0.85, 0.78, cx], [4.2, -5.05, 0.8, 0.74, cx], [3.0, -5.0, 0.72, 0.68, cx], [1.6, -5.0, 0.6, 0.58, cx], [0.9, -5.0, 0.62, 0.6, cx]], 14));   // the shin and calf
    add(o, K, ell([cx, 0.85, -6.5], [0.62, 0.32, 1.1], 12, 6));                       // the foot
    for (let k = 0; k < 5; k++) add(o, K, ell([cx + s * (k - 2) * 0.2 + s * 0.05, 0.72, -7.5 - (k === 1 ? 0.03 : 0) + Math.abs(k - 2) * 0.1], [0.095, 0.1, 0.15], 6, 4));   // the toes
  }
  // the kilt: the shendyt over the lap, its apron hanging between the knees, pleated
  add(o, W, along([[0.9, 0, 6.5, 2.95, 0.62], [-1.5, 0, 6.6, 2.98, 0.6], [-4.0, 0, 6.65, 2.98, 0.58], [-5.75, 0, 6.6, 2.95, 0.55]], 24));
  add(o, W, box(-0.85, 3.6, -6.05, 0.85, 7.0, -5.55));
  for (let k = 0; k < 5; k++) add(o, 'plaster_grey', box(-0.72 + k * 0.36, 3.7, -6.09, -0.6 + k * 0.36, 6.9, -6.05));   // the pleats
  add(o, G, box(-0.95, 3.45, -6.12, 0.95, 3.65, -5.5));                              // the apron's gold hem
  // the torso, from the hips to the shoulders (to a rough break at the waist on the fallen one), and the neck
  if (broken) add(o, K, rows([[5.2, 0.45, 2.35, 1.5], [6.2, 0.4, 2.3, 1.5], [8.0, 0.35, 2.15, 1.45], [9.6, 0.32, 2.3, 1.48]], 28));
  else add(o, K, rows([[5.2, 0.45, 2.35, 1.5], [6.2, 0.4, 2.3, 1.5], [8.0, 0.35, 2.15, 1.45], [10.0, 0.3, 2.45, 1.5], [11.8, 0.2, 2.9, 1.55], [13.0, 0.15, 3.15, 1.5], [13.7, 0.2, 2.2, 1.3]], 28));
  if (broken) {
    add(o, K, loft([[9.6, 0.32, 2.3, 1.48], [10.2, 0.3, 2.15, 1.38], [10.7, 0.26, 1.9, 1.2]].map(([y, z, a, b], i) => ring([0, y, z], X, Zb, a, b, 28, i ? rough(2.3, 0.09) : null))));   // the break
    for (const s of [-1, 1]) add(o, K, ell([s * 3.3, 10.5, -0.3], [0.95, 0.3, 0.95], 12, 4));                       // the stump of each arm
  } else add(o, K, rows([[13.4, 0.1, 1.2, 1.15], [14.5, 0.05, 1.05, 1.05]], 16));
  add(o, G, rows([[7.1, 0.4, 2.47, 1.54], [7.55, 0.4, 2.44, 1.52]], 28));          // the belt
  if (!broken) {
    add(o, G, rows([[12.15, 0.2, 2.98, 1.6], [12.55, 0.19, 3.08, 1.6], [13.1, 0.16, 3.22, 1.58]], 28));   // the broad collar
    for (const s of [-1, 1]) add(o, K, ell([s * 1.0, 11.2, -1.0], [0.9, 0.7, 0.5], 12, 6));   // the pectoral
  }
  for (const s of [-1, 1]) {
    if (!broken) {
      add(o, K, ell([s * 3.1, 12.6, 0.15], [1.15, 1.15, 1.15], 14, 7));              // the shoulder
      add(o, K, rod([s * 3.1, 12.6, 0.15], [s * 3.3, 8.9, -0.3], 0.95, 14));         // the upper arm
      add(o, G, rod([s * 3.19, 11.2, -0.08], [s * 3.22, 10.5, -0.12], 1.02, 14));    // the armband
      cartouche(o, s * 4.13, 9.9, -0.28, 'x', s, 1.5);                                // the king's name on the arm
    } else add(o, K, rod([s * 3.29, 10.5, -0.3], [s * 3.3, 8.9, -0.3], 0.95, 14));
    add(o, K, ell([s * 3.3, 8.9, -0.3], [0.95, 0.95, 0.95], 12, 6));               // the elbow
    add(o, K, rod([s * 3.3, 8.9, -0.3], [s * 2.0, 7.55, -2.9], 0.78, 14));         // the forearm to the hand
    add(o, G, rod([s * 2.2, 7.8, -2.5], [s * 2.0, 7.55, -2.9], 0.84, 12));         // the bracelet
    // the hand flat on the thigh: the palm, four fingers with their tips, the thumb
    add(o, K, ell([s * 2.0, 7.25, -3.3], [0.56, 0.2, 0.7], 12, 6));
    for (let k = 0; k < 4; k++) {
      const x = s * 2.0 + (k - 1.5) * 0.27, len = [1.0, 1.12, 1.05, 0.82][k] * (s > 0 ? 1 : 1), z1 = -3.75 - len;
      add(o, K, rod([x, 7.2, -3.7], [x, 7.17, z1], 0.125, 6)); add(o, K, ell([x, 7.17, z1], [0.125, 0.11, 0.15], 6, 4));
    }
    add(o, K, rod([s * 1.55, 7.3, -3.2], [s * 1.5, 7.2, -4.2], 0.14, 6)); add(o, K, ell([s * 1.5, 7.2, -4.2], [0.14, 0.12, 0.17], 6, 4));
  }
  if (!broken) colossusHead(o);
  add(o, S, box(-2.0, 0.5, 0.9, 2.0, broken ? 11.5 : 13.5, 3.8));
  if (!broken) add(o, S, box(-1.5, 13.0, 0.7, 1.5, 20.1, 3.8));                      // the back slab to the rock
  void RD;
  return o;
}

/** The head of the fallen colossus, lying on its back on the terrace before its throne (its parts at the origin, resting on y = 0): { parts, bounds [x0, z0, x1, z1, height] }. */
export function fallenHead() {
  const raw = {}; colossusHead(raw);
  const parts = {}; let y0 = Infinity;
  for (const [m, list] of Object.entries(raw)) for (const g of list) { g.translate(0, -15.35, 0.5); g.rotateX(1.4); g.rotateZ(0.18); g.rotateY(0.55); g.computeBoundingBox(); y0 = Math.min(y0, g.boundingBox.min.y); }
  let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9, h = 0;
  for (const [m, list] of Object.entries(raw)) for (const g of list) { g.translate(0, -y0, 0); g.computeBoundingBox(); const b = g.boundingBox; x0 = Math.min(x0, b.min.x); x1 = Math.max(x1, b.max.x); z0 = Math.min(z0, b.min.z); z1 = Math.max(z1, b.max.z); h = Math.max(h, b.max.y); (parts[m] ??= []).push(g); }
  return { parts, bounds: [x0, z0, x1, z1, h] };
}


/** A small standing statue (about 1.75 m): `kind` 'queen' (the sheath, the tripartite wig, the plumes and sun disc), 'princess', 'prince' (the side-lock). */
export function royalStatue(kind = 'queen') {
  const o = {}, S = 'sandstone_dressed', k = kind === 'queen' ? 1 : kind === 'princess' ? 0.86 : 0.8;
  add(o, S, box(-0.3 * k, 0, -0.3 * k, 0.3 * k, 0.12, 0.3 * k));
  add(o, S, rows([[0.12, 0, 0.17 * k, 0.15 * k], [0.7 * k, 0, 0.2 * k, 0.16 * k], [1.0 * k, 0, 0.19 * k, 0.15 * k], [1.28 * k, 0, 0.21 * k, 0.14 * k], [1.4 * k, 0, 0.17 * k, 0.12 * k]], 12));
  add(o, S, rows([[1.38 * k, 0, 0.065 * k, 0.065 * k], [1.5 * k, 0, 0.06 * k, 0.06 * k]], 8));
  add(o, S, ell([0, 1.62 * k, -0.01], [0.1 * k, 0.145 * k, 0.12 * k], 10, 6));
  add(o, S, rows([[1.45 * k, 0.04, 0.15 * k, 0.15 * k], [1.62 * k, 0.04, 0.17 * k, 0.17 * k], [1.78 * k, 0.04, 0.12 * k, 0.12 * k]], 10));   // the wig
  if (kind === 'queen') {
    add(o, S, ell([0, 1.9, 0.0], [0.15, 0.06, 0.15], 10, 4));                         // the modius
    for (const s of [-1, 1]) add(o, S, box(s * 0.05 - 0.03, 1.9, -0.025, s * 0.05 + 0.03, 2.42, 0.025));   // the two tall plumes
    add(o, 'gilt_bronze', ell([0, 2.0, -0.02], [0.14, 0.14, 0.03], 10, 5));            // the sun disc
  } else if (kind === 'prince') add(o, S, rod([0.1, 1.72 * k, -0.08], [0.14, 1.35 * k, -0.1], 0.025, 5));   // the side-lock
  add(o, S, ell([0, 1.6 * k, -0.13 * k], [0.025 * k, 0.05 * k, 0.04 * k], 6, 3));                                 // the nose
  if (kind !== 'queen') add(o, S, rows([[0.7 * k, 0.0, 0.215 * k, 0.17 * k], [0.92 * k, -0.02, 0.2 * k, 0.16 * k]], 10)), add(o, 'plaster_white', rows([[0.45 * k, 0.0, 0.22 * k, 0.17 * k], [0.8 * k, -0.02, 0.21 * k, 0.165 * k]], 10));   // the kilt
  for (const s of [-1, 1]) { add(o, S, rod([s * 0.2 * k, 1.28 * k, 0], [s * 0.17 * k, 0.82 * k, -0.04], 0.04 * k, 6)); add(o, S, ell([s * 0.17 * k, 0.78 * k, -0.045], [0.04 * k, 0.05 * k, 0.04 * k], 6, 4)); }   // the arms at the sides, the hands
  return o;
}

/** A seated baboon of the cornice, hands raised to the rising sun: 1.7 m, faces −z. */
export function baboon() {
  const o = {}, S = 'sandstone_dressed';
  add(o, S, ell([0, 0.45, 0.1], [0.5, 0.45, 0.52], 12, 6));                         // the haunches
  add(o, S, ell([0, 1.0, -0.02], [0.4, 0.55, 0.38], 12, 7));                        // the body
  add(o, S, ell([0, 1.3, -0.04], [0.6, 0.42, 0.46], 12, 6));                        // the mantle of the shoulders, the long hair of the male
  add(o, S, ell([0, 1.55, 0.18], [0.46, 0.3, 0.32], 10, 5));                        // its fall down the back
  add(o, S, ell([0, 1.64, -0.2], [0.25, 0.27, 0.27], 10, 6));                       // the head
  add(o, S, ell([0, 1.62, -0.28], [0.3, 0.07, 0.14], 8, 4));                        // the brow ridge
  add(o, S, rod([0, 1.58, -0.36], [0, 1.5, -0.62], 0.12, 7)); add(o, S, ell([0, 1.5, -0.64], [0.13, 0.11, 0.1], 7, 4));   // the long muzzle, its nose
  for (const s of [-1, 1]) {
    add(o, S, ell([s * 0.26, 1.64, -0.12], [0.06, 0.1, 0.07], 6, 4));              // the ear
    add(o, S, rod([s * 0.5, 1.28, -0.06], [s * 0.6, 1.42, -0.32], 0.1, 6));         // the upper arm, out
    add(o, S, rod([s * 0.6, 1.42, -0.32], [s * 0.42, 1.85, -0.52], 0.085, 6));      // the forearm, raised
    add(o, S, ell([s * 0.4, 1.9, -0.54], [0.1, 0.13, 0.04], 6, 4));                 // the palm turned to the sun
    add(o, S, rod([s * 0.3, 0.6, -0.1], [s * 0.34, 0.2, -0.4], 0.14, 6));           // the thigh and shin
    add(o, S, ell([s * 0.32, 0.1, -0.5], [0.13, 0.08, 0.22], 6, 4));                // the foot
  }
  return o;
}

/** A cobra on the frieze, rearing: 0.55 m, faces −z (a lathe: the coil, the neck, the hood). */
export function uraeus() {
  const o = {};
  add(o, 'sandstone_dressed', lathe([[0.001, 0], [0.12, 0], [0.12, 0.08], [0.06, 0.16], [0.05, 0.3], [0.15, 0.42], [0.14, 0.5], [0.05, 0.56], [0.001, 0.57]], 8));
  return o;
}

/**
 * An Osiride statue of the king against a pillar of the first hall: 9.2 m, mummiform, the arms crossed on the chest with the crook and the flail,
 * under the white crown (`crown: 'white'`) or the double crown (`'double'`); painted: the skin red-brown, the crowns white and red.
 */
export function osiride(crown = 'white') {
  const o = {}, S = 'sandstone_dressed';
  add(o, S, rows([[0.1, 0, 0.62, 0.46], [3.0, 0, 0.64, 0.48], [4.6, 0, 0.7, 0.5], [5.5, 0, 0.62, 0.46], [6.6, 0, 0.9, 0.52], [7.2, 0, 1.0, 0.5], [7.55, 0, 0.45, 0.4]], 18));
  add(o, 'paint_ochre', rows([[4.55, 0.0, 0.73, 0.53], [4.75, 0.0, 0.73, 0.53]], 18));                        // the belt
  add(o, 'paint_robe', rows([[7.5, 0, 0.36, 0.34], [7.8, 0, 0.34, 0.33]], 12));                              // the neck
  add(o, 'paint_robe', ell([0, 8.12, -0.04], [0.4, 0.52, 0.42], 14, 8));                                         // the face
  add(o, 'egyptian_blue', rows([[7.7, 0.08, 0.55, 0.55], [8.15, 0.08, 0.85, 0.7], [8.65, 0.08, 0.8, 0.66], [9.0, 0.08, 0.52, 0.46]], 16));   // the nemes
  add(o, 'paint_ochre', box(-0.1, 7.1, -0.55, 0.1, 7.75, -0.4));                                              // the beard (blue and gold)
  if (crown === 'white') add(o, 'plaster_white', rows([[8.9, 0.1, 0.42, 0.38], [9.3, 0.1, 0.38, 0.34], [9.62, 0.1, 0.2, 0.18], [9.7, 0.1, 0.08, 0.08]], 14));
  else {
    add(o, 'limewash_red', rows([[8.9, 0.1, 0.5, 0.5], [9.2, 0.1, 0.52, 0.52], [9.4, 0.1, 0.45, 0.45]], 14));
    add(o, 'plaster_white', rows([[9.3, 0.1, 0.34, 0.3], [9.6, 0.1, 0.3, 0.27], [9.8, 0.1, 0.12, 0.1]], 14));
  }
  for (const s of [-1, 1]) {
    add(o, 'paint_robe', rod([s * 0.62, 6.35, -0.5], [-s * 0.25, 6.85, -0.55], 0.17, 8));                    // the arms crossed
    add(o, 'paint_robe', ell([-s * 0.25, 6.85, -0.55], [0.2, 0.2, 0.18], 8, 5));                                // the fists
    add(o, 'paint_ochre', rod([-s * 0.25, 6.85, -0.62], [-s * 0.5, 7.3, -0.6], 0.045, 5));                      // the crook and the flail
  }
  return o;
}

/**
 * A god seated on a bench of the sanctuary, 1.9 m: `kind` 'ptah' (mummiform, the skull-cap, the beard, the was-sceptre), 'amun' (the two tall plumes),
 * 'ramesses' (the nemes and the double crown with the ram's horns), 'ra' (the falcon's head with the sun disc).
 */
export function seatedGod(kind) {
  const o = {}, S = 'sandstone_dressed', skin = kind === 'ptah' ? 'egyptian_blue' : 'paint_robe';
  add(o, S, box(-0.42, 0, -0.5, 0.42, 0.55, 0.3));                                      // the block throne
  add(o, S, box(-0.4, 0.55, 0.12, 0.4, 1.9, 0.3));                                      // its back
  add(o, kind === 'ptah' ? 'egyptian_blue' : 'plaster_white', rows([[0.55, -0.05, 0.3, 0.3], [0.9, -0.05, 0.32, 0.24], [1.15, 0.0, 0.34, 0.2], [1.3, 0.0, 0.3, 0.18]], 12));   // the body (a kilt or a shroud)
  if (kind !== 'ptah') add(o, S, box(-0.3, 0.55, -0.5, 0.3, 0.85, -0.05));                // the lap
  add(o, skin, rows([[1.28, 0, 0.1, 0.1], [1.4, 0, 0.09, 0.09]], 8));
  if (kind === 'ra') {
    add(o, skin, ell([0, 1.55, -0.08], [0.14, 0.15, 0.16], 10, 6));                    // the falcon's head
    add(o, 'paint_ochre', rows([[1.5, -0.2, 0.025, 0.04], [1.5, -0.27, 0.02, 0.04]], 6));
    add(o, 'gold', rod([0, 1.52, -0.2], [0, 1.45, -0.3], 0.03, 6));                    // the beak
    add(o, 'gilt_bronze', ell([0, 1.8, -0.05], [0.2, 0.2, 0.04], 12, 6));              // the sun disc
    add(o, 'limewash_red', ell([0, 1.62, -0.06], [0.1, 0.1, 0.1], 8, 4));
  } else {
    add(o, skin, ell([0, 1.55, -0.04], [0.14, 0.18, 0.15], 10, 6));
    if (kind === 'ptah') { add(o, 'egyptian_blue', rows([[1.5, 0.0, 0.15, 0.15], [1.68, 0.0, 0.14, 0.14], [1.74, 0, 0.08, 0.08]], 10)); add(o, 'gold', box(-0.02, 1.2, -0.2, 0.02, 1.5, -0.14)); }
    if (kind === 'amun') for (const s of [-0.04, 0.04]) add(o, 'egyptian_blue', box(s - 0.035, 1.72, -0.03, s + 0.035, 2.42, 0.03));
    if (kind === 'ramesses') {
      add(o, 'egyptian_blue', rows([[1.45, 0.0, 0.24, 0.2], [1.62, 0.0, 0.26, 0.2], [1.76, 0.0, 0.18, 0.15]], 12));
      add(o, 'plaster_white', rows([[1.74, 0, 0.1, 0.09], [1.95, 0, 0.09, 0.08], [2.05, 0, 0.04, 0.04]], 10));
      add(o, 'gold', ell([0, 1.9, -0.05], [0.19, 0.05, 0.12], 8, 4));
    }
  }
  return o;
}

/** A Hathor pillar's capital: the goddess's face with her cow's ears, the wig's lappets, the sistrum's naos above it: for a pillar `w` wide. */
export function hathorHead(w = 1.1) {
  const o = {}, S = 'sandstone_dressed';
  add(o, S, box(-w / 2, 0, -w / 2, w / 2, 1.3, w / 2));                                   // the block of the capital
  add(o, S, ell([0, 0.65, -w / 2 - 0.02], [0.36, 0.42, 0.14], 12, 7));                    // the face
  add(o, 'sandstone_carved', ell([0, 0.78, -w / 2 - 0.1], [0.2, 0.05, 0.05], 8, 4));      // the brows
  for (const s of [-1, 1]) {
    add(o, S, ell([s * 0.42, 0.7, -w / 2 - 0.02], [0.1, 0.2, 0.08], 8, 5));               // the cow's ears
    add(o, S, box(s * 0.36 - 0.07, 0.0, -w / 2 - 0.08, s * 0.36 + 0.07, 0.62, -w / 2));   // the wig's lappets
  }
  add(o, S, box(-w / 2 - 0.05, 1.3, -w / 2 - 0.05, w / 2 + 0.05, 1.5, w / 2 + 0.05));     // the naos' cornice
  add(o, S, box(-w / 2 + 0.1, 1.5, -w / 2 + 0.1, w / 2 - 0.1, 2.0, w / 2 - 0.1));         // the naos
  add(o, 'gilt_bronze', ell([0, 1.75, -w / 2 + 0.06], [0.1, 0.1, 0.02], 8, 4));          // the sun disc on its front
  return o;
}

/** The cow Hathor of the Small Temple's sanctuary, standing out of the rock: 2.1 m long, 1.7 m high, faces −z; the king under her chin. */
export function hathorCow() {
  const o = {}, S = 'sandstone_dressed';
  add(o, S, ell([0, 0.85, 0.5], [0.46, 0.5, 0.95], 14, 8));                               // the body
  add(o, S, ell([0, 1.3, -0.6], [0.26, 0.3, 0.4], 12, 6));                                // the neck, rising
  add(o, S, ell([0, 1.4, -1.0], [0.2, 0.22, 0.3], 10, 6));                                // the head
  add(o, S, ell([0, 1.3, -1.28], [0.12, 0.1, 0.16], 8, 4));                               // the muzzle
  for (const s of [-1, 1]) {
    add(o, S, rod([s * 0.2, 1.55, -0.95], [s * 0.38, 1.82, -0.9], 0.04, 5));              // the horns
    add(o, S, ell([s * 0.28, 1.5, -0.84], [0.1, 0.05, 0.05], 6, 4));                      // the ears
    add(o, S, rod([s * 0.28, 0.5, -0.1], [s * 0.28, 0.0, -0.1], 0.1, 6));                  // the forelegs
  }
  add(o, 'gilt_bronze', ell([0, 1.7, -0.9], [0.14, 0.14, 0.03], 10, 4));                  // the sun disc
  // the king standing under her chin
  add(o, S, rows([[0.0, -1.2, 0.1, 0.07], [0.5, -1.2, 0.1, 0.07], [0.8, -1.2, 0.11, 0.07]], 8));
  add(o, S, ell([0, 0.93, -1.2], [0.07, 0.09, 0.07], 8, 4));
  return o;
}
void Y;
export { rows, ell, mirror };
/** A colossus' head scaled by k and set with its centre at (0, y, z): for the standing figures. */
const SMALL_PAL = { K: 'paint_robe', G: 'paint_ochre', BK: 'egyptian_blue', WH: 'plaster_white' };
function headAt(o, k, y, z, crown) {
  const raw = {}; colossusHead(raw, crown);
  for (const [m, list] of Object.entries(raw)) for (const g of list) { g.translate(0, -15.35, 0); g.scale(k, k, k); g.translate(0, y, z + 0.5 * k); add(o, m, g); }
}

/**
 * A standing colossus of the Small Temple's front, height H (about 10.5 m): `kind` 'king' (the kilt with its pleated apron and belt, the striding left foot, the
 * arms at the sides, the fists, the nemes, the double or white crown) or 'queen' (the long sheath, the tripartite wig, Hathor's crown: the horns round the sun disc
 * between two tall plumes), 'ra' (the god of the niche, of stone). Painted as the great colossi are (§15). The figure stands against the rock at its back (a back slab), facing −z.
 */
export function standing(kind, H = 10.5, crown = 'double') {
  PAL = SMALL_PAL;
  try { return standingIn(kind, H, crown); } finally { PAL = GREAT_PAL; }
}
function standingIn(kind, H, crown) {
  const o = {}, S = 'sandstone_dressed', u = H / 10.5, K = PAL.K, W = 'plaster_white', G = PAL.G, B = 'egyptian_blue';
  const R = (r) => r.map(([y, cz, a, b, cx = 0]) => [y * u, cz * u, a * u, b * u, cx * u]);
  add(o, S, box(-1.5 * u, 0, -1.8 * u, 1.5 * u, 0.4 * u, 1.2 * u));                       // the base
  add(o, S, box(-1.1 * u, 0.4 * u, 0.7 * u, 1.1 * u, 9.0 * u, 2.0 * u)); add(o, S, box(-0.8 * u, 8.6 * u, 0.5 * u, 0.8 * u, 10.5 * u, 2.0 * u));   // the back slab
  if (kind === 'king' || kind === 'ra') {
    const SK = kind === 'ra' ? S : K, SW = kind === 'ra' ? S : W;
    for (const [s, z] of [[-1, 0], [1, -0.4]]) {
      add(o, SK, rows(R([[0.4, z, 0.5, 0.65], [1.0, z, 0.38, 0.5], [1.8, z, 0.5, 0.55], [3.0, z, 0.55, 0.55]]), 12).translate(s * 0.55 * u, 0, 0));  // the legs, the left foot forward
      add(o, SK, ell([s * 0.55 * u, 0.3 * u, (z - 0.55) * u], [0.36 * u, 0.3 * u, 0.7 * u], 10, 5));                                                 // the foot
    }
    add(o, SW, rows(R([[2.9, -0.1, 1.2, 0.8], [3.4, 0, 1.15, 0.78], [4.4, 0, 1.0, 0.7]]), 20));   // the kilt
    add(o, kind === 'ra' ? S : G, rows(R([[4.35, 0, 1.03, 0.72], [4.6, 0, 1.03, 0.72]]), 20));      // the belt
    add(o, SK, rows(R([[4.55, 0, 1.0, 0.68], [5.0, 0, 1.05, 0.68], [6.0, 0, 1.4, 0.72], [6.7, 0, 1.55, 0.7], [7.1, 0, 1.0, 0.55]]), 20));   // torso, shoulders
    add(o, kind === 'ra' ? S : W, box(-0.6 * u, 2.9 * u, -0.86 * u, 0.6 * u, 4.4 * u, -0.7 * u));   // the apron
    if (kind === 'king') {
      for (let k = 0; k < 5; k++) add(o, S, box((-0.5 + k * 0.25) * u, 3.0 * u, -0.89 * u, (-0.42 + k * 0.25) * u, 4.3 * u, -0.85 * u));   // its pleats
      add(o, G, box(-0.62 * u, 2.85 * u, -0.9 * u, 0.62 * u, 3.0 * u, -0.68 * u));                  // its hem
      add(o, G, ell([0, 5.3 * u, -0.7 * u], [0.45 * u, 0.25 * u, 0.06 * u], 8, 4));                  // the broad collar
    }
    add(o, SK, rows(R([[6.9, 0, 0.5, 0.45], [7.6, 0, 0.45, 0.42]]), 12));
    for (const s of [-1, 1]) {
      add(o, SK, rod([s * 1.55 * u, 6.5 * u, 0], [s * 1.5 * u, 3.6 * u, -0.35 * u], 0.33 * u, 10)); add(o, SK, ell([s * 1.5 * u, 3.4 * u, -0.45 * u], [0.3 * u, 0.3 * u, 0.3 * u], 8, 5));   // the arm, the fist
      if (kind === 'king') { add(o, G, rod([s * 1.54 * u, 6.0 * u, -0.05 * u], [s * 1.53 * u, 5.6 * u, -0.1 * u], 0.36 * u, 10)); add(o, G, rod([s * 1.5 * u, 3.9 * u, -0.3 * u], [s * 1.5 * u, 3.65 * u, -0.35 * u], 0.35 * u, 10)); }
    }
    if (kind === 'ra') {
      // the falcon's head over the king's shoulders, the beak, the disc with its rearing cobra; the was-sceptre in the right hand
      add(o, S, rows(R([[7.4, 0.1, 0.62, 0.6], [8.0, 0.12, 0.9, 0.85], [8.6, 0.12, 0.85, 0.8], [9.0, 0.12, 0.55, 0.5]]), 16));
      add(o, S, ell([0, 8.3 * u, -0.35 * u], [0.5 * u, 0.7 * u, 0.5 * u], 14, 8));
      add(o, 'gold', rod([0, 8.2 * u, -0.7 * u], [0, 7.7 * u, -1.05 * u], 0.17 * u, 8));
      add(o, 'gilt_bronze', ell([0, 9.7 * u, 0.1 * u], [0.75 * u, 0.75 * u, 0.12 * u], 16, 8));
      add(o, 'limewash_red', ell([0, 9.7 * u, -0.02 * u], [0.55 * u, 0.55 * u, 0.1 * u], 14, 6));
      add(o, S, rod([1.9 * u, 0.4 * u, -0.7 * u], [1.9 * u, 6.7 * u, -0.7 * u], 0.1 * u, 6));
      return o;
    }
    add(o, K, rows(R([[6.9, 0, 0.5, 0.45], [7.4, 0, 0.45, 0.42]]), 12));                              // the neck
    headAt(o, 0.5 * u, 8.45 * u, -0.1 * u, crown);
  } else {
    add(o, W, rows(R([[0.4, 0, 0.55, 0.5], [1.5, 0, 0.62, 0.5], [3.0, 0, 0.78, 0.55], [4.4, 0, 0.7, 0.5], [5.2, 0, 0.62, 0.45], [6.0, 0, 0.78, 0.5], [6.9, 0, 0.82, 0.45], [7.3, 0, 0.4, 0.35]]), 18));  // the long sheath
    add(o, G, rows(R([[4.3, 0, 0.72, 0.52], [4.5, 0, 0.72, 0.52]]), 18));                             // the sash
    add(o, PAL.BK, rows(R([[5.6, 0.0, 0.74, 0.44], [6.55, 0, 0.86, 0.47]]), 8));         // the beaded collar's dark band
    add(o, K, rows(R([[7.2, 0, 0.3, 0.3], [7.8, 0, 0.26, 0.26]]), 10));
    const c = [0, 8.3 * u, -0.05 * u], r = [0.42 * u, 0.6 * u, 0.44 * u];
    add(o, K, ell(c, r, 14, 8)); face(o, K, c, r);
    add(o, PAL.BK, rows(R([[7.6, 0.1, 0.55, 0.52], [8.3, 0.1, 0.72, 0.7], [8.9, 0.1, 0.62, 0.6], [9.2, 0.1, 0.45, 0.42]]), 16));   // the wig
    for (const s of [-1, 1]) add(o, PAL.BK, box(s * 0.5 * u - 0.12 * u, 6.0 * u, -0.45 * u, s * 0.5 * u + 0.12 * u, 7.9 * u, -0.25 * u));   // its lappets over the breast
    for (const s of [-1, 1]) {
      add(o, K, rod([s * 0.82 * u, 6.2 * u, 0], [s * 0.7 * u, 3.8 * u, -0.15 * u], 0.2 * u, 8));
      add(o, K, ell([s * 0.7 * u, 3.65 * u, -0.17 * u], [0.2 * u, 0.2 * u, 0.2 * u], 8, 5));          // the hand
      add(o, G, box(s * 0.28 * u - 0.15 * u, 9.1 * u, -0.1 * u, s * 0.28 * u + 0.15 * u, 10.5 * u, 0.1 * u));   // the two tall plumes
      add(o, G, rod([s * 0.25 * u, 9.4 * u, 0], [s * 0.62 * u, 10.0 * u, 0], 0.09 * u, 6));                      // the cow's horns
    }
    add(o, 'gilt_bronze', ell([0, 9.7 * u, -0.05 * u], [0.3 * u, 0.3 * u, 0.07 * u], 12, 6));                   // the sun disc between the horns
    add(o, 'gold', ell([0, 9.35 * u, -0.45 * u], [0.14 * u, 0.12 * u, 0.1 * u], 8, 4));                          // the vulture's head on the brow
  }
  void B;
  return o;
}

