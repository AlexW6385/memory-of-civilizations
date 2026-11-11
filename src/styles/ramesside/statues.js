// The statues of the Ramesside temples, modelled in lofts (rings of points, as the falcon and the Sphinx of the other Egyptian
// styles): the seated colossi of the Great Temple's front, the small royal statues at their feet, the baboons of the
// cornice, the Osiride pillar statues of the first hall, the four gods of the sanctuary, Ra-Horakhty in his niche, the
// standing colossi of the Small Temple, Hathor's pillars and Hathor as the cow. Each builder returns { material: [geometry] }
// in its own frame: the statue faces −z, stands on y = 0, its middle on x = 0, z = 0 (the spine's plane).

import { box, rod, lathe } from '../../core/geom.js';
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

/**
 * The seated colossus of Ramesses II on the Great Temple's front: 20 m with the double crown, the nemes with its lappets,
 * the false beard, the shendyt kilt, the hands flat on the thighs, the shins and feet on the plinth, a back slab to the
 * rock. Origin: the spine's plane, floor level; faces −z.
 */
export function colossus() {
  const o = {}, S = 'sandstone_dressed';
  add(o, S, box(-3.8, 0, -7.6, 3.8, 0.5, 2.0));                                     // the plinth
  add(o, S, box(-3.5, 0.5, -4.4, 3.5, 5.2, 2.0));                                   // the throne's block between and behind the legs
  for (const s of [-1, 1]) {
    const a = Math.min(s * 0.25, s * 2.85), b = Math.max(s * 0.25, s * 2.85);
    add(o, S, box(a, 5.2, -5.8, b, 6.9, 0.9));                                      // the thigh to the knee
    add(o, S, box(Math.min(s * 0.45, s * 2.65), 0.5, -5.8, Math.max(s * 0.45, s * 2.65), 5.4, -3.6));   // the shin
    add(o, S, box(Math.min(s * 0.35, s * 2.75), 0.5, -7.4, Math.max(s * 0.35, s * 2.75), 1.05, -5.7));  // the foot
    add(o, S, box(Math.min(s * 1.3, s * 2.7), 6.9, -3.8, Math.max(s * 1.3, s * 2.7), 7.4, -2.3));      // the hand flat on the thigh
  }
  add(o, S, box(-1.3, 3.6, -6.0, 1.3, 6.9, -5.55));                                  // the kilt's apron between the knees
  add(o, S, box(-2.9, 6.9, -5.55, 2.9, 7.1, 0.9));                                   // the kilt over the lap
  // the torso, from the hips to the shoulders, and the neck
  add(o, S, rows([[5.2, 0.45, 2.35, 1.5], [6.2, 0.4, 2.3, 1.5], [8.0, 0.35, 2.15, 1.45], [10.0, 0.3, 2.45, 1.5], [11.8, 0.2, 2.9, 1.55], [13.0, 0.15, 3.15, 1.5], [13.7, 0.2, 2.2, 1.3]], 28));
  add(o, S, rows([[13.4, 0.1, 1.2, 1.15], [14.5, 0.05, 1.05, 1.05]], 16));
  add(o, S, rows([[7.15, 0.4, 2.45, 1.52], [7.5, 0.4, 2.42, 1.5]], 28));         // the belt
  for (const s of [-1, 1]) {
    add(o, S, ell([s * 3.1, 12.6, 0.15], [1.15, 1.15, 1.15], 14, 7));              // the shoulder
    add(o, S, rod([s * 3.1, 12.6, 0.15], [s * 3.3, 8.9, -0.3], 0.95, 14));         // the upper arm
    add(o, S, ell([s * 3.3, 8.9, -0.3], [0.95, 0.95, 0.95], 12, 6));               // the elbow
    add(o, S, rod([s * 3.3, 8.9, -0.3], [s * 2.0, 7.55, -2.9], 0.78, 14));         // the forearm to the hand
    add(o, S, box(Math.min(s * 1.0, s * 3.0), 11.6, -1.0, Math.max(s * 1.0, s * 3.0), 13.9, -0.35)); // the nemes' lappet over the chest
  }
  // the head: the nemes cloth, the face, nose, lips, brows, the false beard, the crowns
  add(o, S, rows([[14.3, 0.35, 1.6, 1.5], [15.2, 0.4, 2.2, 1.9], [16.2, 0.4, 2.35, 2.0], [17.0, 0.4, 2.2, 1.9], [17.6, 0.4, 1.6, 1.5]], 24));
  add(o, S, ell([0, 15.45, -0.6], [1.12, 1.6, 1.05], 18, 10));
  add(o, S, ell([0, 15.15, -1.7], [0.3, 0.78, 0.46], 10, 6));                         // the nose
  add(o, S, ell([0, 14.35, -1.5], [0.58, 0.17, 0.26], 12, 5));                        // the lips
  for (const s of [-1, 1]) {
    add(o, 'sandstone_carved', ell([s * 0.55, 15.8, -1.5], [0.4, 0.12, 0.2], 10, 5)); // the eye
    add(o, 'sandstone_carved', ell([s * 0.58, 16.1, -1.5], [0.46, 0.06, 0.18], 10, 4)); // the brow
  }
  add(o, S, box(-0.22, 12.5, -1.55, 0.22, 14.2, -1.1));                              // the false beard
  add(o, S, rows([[17.4, 0.25, 1.2, 1.2], [18.3, 0.25, 1.25, 1.25], [18.85, 0.25, 1.05, 1.05]], 20));   // the red crown
  add(o, S, rows([[18.75, 0.25, 0.88, 0.72], [19.4, 0.25, 0.8, 0.66], [19.85, 0.25, 0.5, 0.4], [20.0, 0.25, 0.18, 0.16]], 20));   // the white crown inside it
  add(o, S, box(-0.3, 18.6, 0.75, 0.3, 19.7, 1.05));                                  // the tall back of the red crown
  add(o, S, ell([0, 17.35, -1.6], [0.18, 0.32, 0.16], 8, 5));                         // the uraeus on the brow
  add(o, S, box(-2.0, 0.5, 0.9, 2.0, 13.5, 3.8)); add(o, S, box(-1.5, 13.0, 0.7, 1.5, 20.1, 3.8)); // the back slab to the rock
  return o;
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
  for (const s of [-1, 1]) add(o, S, rod([s * 0.2 * k, 1.28 * k, 0], [s * 0.17 * k, 0.82 * k, -0.04], 0.04 * k, 6));   // the arms at the sides
  return o;
}

/** A seated baboon of the cornice, hands raised to the rising sun: 1.7 m, faces −z. */
export function baboon() {
  const o = {}, S = 'sandstone_dressed';
  add(o, S, ell([0, 0.45, 0.1], [0.5, 0.45, 0.52], 12, 6));                         // the haunches
  add(o, S, ell([0, 1.0, -0.02], [0.42, 0.55, 0.4], 12, 7));                        // the body
  add(o, S, ell([0, 1.25, -0.08], [0.55, 0.38, 0.42], 12, 6));                      // the mantle of the shoulders
  add(o, S, ell([0, 1.58, -0.2], [0.26, 0.28, 0.28], 10, 6));                       // the head
  add(o, S, ell([0, 1.5, -0.46], [0.15, 0.14, 0.2], 8, 5));                         // the muzzle
  for (const s of [-1, 1]) {
    add(o, S, rod([s * 0.42, 1.28, -0.12], [s * 0.34, 1.68, -0.5], 0.09, 6));       // the arm raised
    add(o, S, box(s * 0.34 - 0.07, 1.62, -0.62, s * 0.34 + 0.07, 1.82, -0.44));     // the palm
    add(o, S, rod([s * 0.3, 0.12, -0.3], [s * 0.3, 0.12, -0.55], 0.08, 5));         // the foot
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

/**
 * A standing colossus of the Small Temple's front, height H (about 10.5 m): `kind` 'king' (the kilt, the striding left foot, the arms at the
 * sides, the nemes, the double or white crown) or 'queen' (the long sheath, the tripartite wig, Hathor's crown: the horns round the sun disc
 * between two tall plumes). The figure stands against the rock at its back (a back slab), facing −z.
 */
export function standing(kind, H = 10.5, crown = 'double') {
  const o = {}, S = 'sandstone_dressed', u = H / 10.5;
  const R = (r) => r.map(([y, cz, a, b, cx = 0]) => [y * u, cz * u, a * u, b * u, cx * u]);
  add(o, S, box(-1.5 * u, 0, -1.8 * u, 1.5 * u, 0.4 * u, 1.2 * u));                       // the base
  add(o, S, box(-1.1 * u, 0.4 * u, 0.7 * u, 1.1 * u, 9.0 * u, 2.0 * u)); add(o, S, box(-0.8 * u, 8.6 * u, 0.5 * u, 0.8 * u, 10.5 * u, 2.0 * u));   // the back slab
  if (kind === 'king' || kind === 'ra') {
    for (const [s, z] of [[-1, 0], [1, -0.4]]) add(o, S, rows(R([[0.4, z, 0.5, 0.65], [1.8, z, 0.5, 0.55], [3.0, z, 0.55, 0.55]]), 12).translate(s * 0.55 * u, 0, 0));  // the legs, the left foot forward
    add(o, S, rows(R([[2.9, -0.1, 1.2, 0.8], [3.4, 0, 1.15, 0.78], [4.4, 0, 1.0, 0.7], [5.0, 0, 1.05, 0.68], [6.0, 0, 1.4, 0.72], [6.7, 0, 1.55, 0.7], [7.1, 0, 1.0, 0.55]]), 20));   // kilt, belt, torso, shoulders
    add(o, 'plaster_white', rows(R([[2.95, -0.55, 0.95, 0.12], [4.4, -0.55, 0.62, 0.1]]), 4));    // the pleated apron
    add(o, S, rows(R([[6.9, 0, 0.5, 0.45], [7.6, 0, 0.45, 0.42]]), 12));
    for (const s of [-1, 1]) { add(o, S, rod([s * 1.55 * u, 6.5 * u, 0], [s * 1.5 * u, 3.6 * u, -0.35 * u], 0.33 * u, 10)); add(o, S, ell([s * 1.5 * u, 3.4 * u, -0.45 * u], [0.3 * u, 0.3 * u, 0.3 * u], 8, 5)); }
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
    add(o, S, rows(R([[7.5, 0.1, 0.8, 0.75], [8.1, 0.15, 1.15, 0.95], [8.7, 0.15, 1.2, 1.0], [9.1, 0.15, 0.8, 0.75]]), 18));   // the nemes
    add(o, S, ell([0, 8.25 * u, -0.3 * u], [0.55 * u, 0.8 * u, 0.5 * u], 14, 8));
    add(o, S, ell([0, 8.1 * u, -0.8 * u], [0.14 * u, 0.4 * u, 0.22 * u], 8, 5));         // the nose
    add(o, S, box(-0.1 * u, 6.5 * u, -0.9 * u, 0.1 * u, 7.5 * u, -0.7 * u));
    if (crown === 'white') add(o, S, rows(R([[8.95, 0.15, 0.62, 0.55], [9.7, 0.15, 0.55, 0.5], [10.3, 0.15, 0.28, 0.25], [10.45, 0.15, 0.1, 0.1]]), 14));
    else { add(o, S, rows(R([[8.9, 0.15, 0.7, 0.7], [9.4, 0.15, 0.72, 0.72], [9.7, 0.15, 0.6, 0.6]]), 14)); add(o, S, rows(R([[9.6, 0.15, 0.45, 0.38], [10.1, 0.15, 0.4, 0.34], [10.45, 0.15, 0.12, 0.1]]), 14)); }
  } else {
    add(o, S, rows(R([[0.4, 0, 0.55, 0.5], [1.5, 0, 0.62, 0.5], [3.0, 0, 0.78, 0.55], [4.4, 0, 0.7, 0.5], [5.2, 0, 0.62, 0.45], [6.0, 0, 0.78, 0.5], [6.9, 0, 0.82, 0.45], [7.3, 0, 0.4, 0.35]]), 18));  // the long sheath
    add(o, S, rows(R([[7.2, 0, 0.3, 0.3], [7.8, 0, 0.26, 0.26]]), 10));
    add(o, S, ell([0, 8.3 * u, -0.05 * u], [0.42 * u, 0.6 * u, 0.44 * u], 14, 8));
    add(o, S, rows(R([[7.6, 0.1, 0.55, 0.52], [8.3, 0.1, 0.72, 0.7], [8.9, 0.1, 0.62, 0.6], [9.2, 0.1, 0.45, 0.42]]), 16));   // the wig
    add(o, S, ell([0, 8.1 * u, -0.5 * u], [0.1 * u, 0.32 * u, 0.15 * u], 8, 5));
    for (const s of [-1, 1]) {
      add(o, S, rod([s * 0.82 * u, 6.2 * u, 0], [s * 0.7 * u, 3.8 * u, -0.15 * u], 0.2 * u, 8));
      add(o, S, box(s * 0.28 * u - 0.15 * u, 9.1 * u, -0.1 * u, s * 0.28 * u + 0.15 * u, 10.5 * u, 0.1 * u));   // the two tall plumes
      add(o, S, rod([s * 0.25 * u, 9.4 * u, 0], [s * 0.62 * u, 10.0 * u, 0], 0.09 * u, 6));                      // the cow's horns
    }
    add(o, 'gilt_bronze', ell([0, 9.7 * u, -0.05 * u], [0.3 * u, 0.3 * u, 0.07 * u], 12, 6));                   // the sun disc between the horns
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
