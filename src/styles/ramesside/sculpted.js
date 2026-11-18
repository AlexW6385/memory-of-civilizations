// The modelled figures of the Great Temple (docs/settlements/abu-simbel.md §17): the Osiride pillar statues of the first hall, the four seated gods
// of the sanctuary, Ra-Horakhty of the niche over the door, the royal family at the colossi's feet, the bound captives of the thrones' bases.
// Each builder takes a Kit (fig.js) at the figure's place and an `fine` flag: false builds the figure (the volumes), true only the additions seen
// within a few metres (painted eyes and brows, the bands of the nemes, the pleats, beads and fingers), so that the two levels are two plans.

import { head, fist, blob, blobDir, tube, rodT, torus } from './fig.js';

const SK = 'paint_robe', ST = 'sandstone_dressed', WH = 'plaster_white', BL = 'egyptian_blue', GD = 'gold', OC = 'paint_ochre', RD = 'limewash_red', BK = 'paint_minoan_black';
const T = (S, pts, o = {}) => tube(S, pts, { seg: 14, sub: 2, ref: [0, 0, 1], ...o });
/** Pleats: a fold function for a tube round a body: n ridges, depth d (a fraction), the apron's bulge at the front (th = 0). */
const pleat = (n, d, apron = 0) => (t, th) => 1 + d * Math.cos(th * n) + apron * t * Math.exp(-(((th > Math.PI ? th - 2 * Math.PI : th) / 0.7) ** 2));

/** The crowns, set on a head of centre c: 'white' (the hedjet), 'double' (the red crown with its curl and tall back, the white inside it), 'nemes' (the cloth only). */
function crown(F, c, kind, s = 1, fine = false) {
  const [x, y, z] = c, b = 0.38 * s;
  if (fine) return;
  if (kind === 'white') {
    T(F.s(WH), [[x, y + b, z - 0.02 * s, 0.34 * s, 0.33 * s], [x, y + b + 0.15 * s, z - 0.03 * s, 0.38 * s, 0.36 * s], [x, y + b + 0.6 * s, z - 0.05 * s, 0.3 * s, 0.27 * s], [x, y + b + 0.95 * s, z - 0.06 * s, 0.14 * s, 0.13 * s]], { cap: [0, 1], seg: 16 });
    blob(F.s(WH), [x, y + b + 1.0 * s, z - 0.06 * s], [0.12 * s, 0.1 * s, 0.12 * s], 3, 8);
  } else if (kind === 'double') {
    T(F.s(RD), [[x, y + b, z - 0.02 * s, 0.4 * s, 0.38 * s], [x, y + b + 0.22 * s, z - 0.03 * s, 0.5 * s, 0.47 * s], [x, y + b + 0.48 * s, z - 0.05 * s, 0.45 * s, 0.42 * s]], { cap: [0, 0], seg: 16 });
    T(F.s(WH), [[x, y + b + 0.4 * s, z - 0.05 * s, 0.3 * s, 0.28 * s], [x, y + b + 0.85 * s, z - 0.06 * s, 0.25 * s, 0.23 * s], [x, y + b + 1.2 * s, z - 0.07 * s, 0.11 * s, 0.1 * s]], { cap: [0, 1], seg: 14 });
    F.s(RD).prism([[-0.15 * s, 0], [0.15 * s, 0], [0.11 * s, 0.95 * s], [-0.11 * s, 0.95 * s]].map(([a, d]) => [x + a, y + b + d]), z - 0.52 * s, z - 0.38 * s);   // the red crown's tall back
    torus(F.s(RD), [x, y + b + 0.4 * s, z + 0.46 * s], [1, 0, 0], [0, 1, 0], 0.09 * s, 0.028 * s, { seg: 12, sec: 5 });   // its curl at the front
  }
  tube(F.s(GD), [[x, y + b - 0.12 * s, z + 0.4 * s, 0.03 * s, 0.03 * s], [x, y + b + 0.05 * s, z + 0.47 * s, 0.04 * s, 0.045 * s], [x, y + b + 0.2 * s, z + 0.44 * s, 0.035 * s, 0.04 * s]], { seg: 6, sub: 1 });   // the uraeus on the brow
}

/** The nemes on a head: the dome, the wings behind the ears, the lappets on the chest, the false beard. */
function nemes(F, c, rx, ry, rz, fine) {
  const [x, y, z] = c;
  if (fine) {
    for (let i = 0; i < 4; i++) { const f = 0.42 + i * 0.12, q = Math.sqrt(1 - f * f) * 1.07, yy = y + f * ry; T(F.s(GD), [[x, yy, z - 0.05 * rz, rx * q, rz * q], [x, yy + 0.03 * ry, z - 0.05 * rz, rx * q, rz * q]], { cap: [0, 0], seg: 20, sub: 1, ref: [0, 0, 1] }); }
    for (const s of [-1, 1]) for (let i = 0; i < 4; i++) rodT(F.s(GD), [x + s * rx * 0.62, y - 0.8 * ry - i * 0.3 * rx, z + 0.36 * rx], [x + s * rx * 0.62, y - 0.8 * ry - i * 0.3 * rx - 0.03, z + 0.4 * rx], 0.05 * rx, 0.05 * rx, { seg: 4 });
    for (let i = 0; i < 4; i++) T(F.s(GD), [[x, y - 1.05 * ry - i * 0.2 * rx, z + 1.05 * rx, 0.1 * rx, 0.12 * rx], [x, y - 1.05 * ry - i * 0.2 * rx - 0.03, z + 1.1 * rx, 0.1 * rx, 0.12 * rx]], { seg: 6, sub: 1 });
    return;
  }
  { const q = (f) => Math.sqrt(1 - f * f) * 1.07; T(F.s(BL), [[x, y + 0.36 * ry, z - 0.05 * rz, rx * q(0.36), rz * q(0.36)], [x, y + 0.66 * ry, z - 0.05 * rz, rx * q(0.66), rz * q(0.66)], [x, y + 0.9 * ry, z - 0.05 * rz, rx * q(0.9), rz * q(0.9)], [x, y + 1.02 * ry, z - 0.05 * rz, rx * 0.2, rz * 0.2]], { seg: 18, sub: 2, cap: [0, 1] });
    for (const sd of [-1, 1]) blob(F.s(BL), [x + sd * rx * 0.98, y - 0.05 * ry, z - 0.45 * rz], [0.12 * rx, 0.6 * ry, 0.55 * rz], 3, 8); }   // the cloth over the head with the headband, the sides behind the ears
  for (const s of [-1, 1]) {
    T(F.s(BL), [[x + s * rx * 0.95, y - 0.1 * ry, z - 0.15 * rz, 0.18 * rx, 0.3 * rx], [x + s * rx * 1.1, y - 0.9 * ry, z - 0.1 * rz, 0.2 * rx, 0.4 * rx], [x + s * rx * 1.15, y - 1.35 * ry, z + 0.2 * rx, 0.2 * rx, 0.45 * rx]], { seg: 8, sub: 2 });   // the wing, behind the ear
    T(F.s(BL), [[x + s * rx * 0.62, y - 0.8 * ry, z + 0.18 * rz, 0.06 * rx, 0.24 * rx], [x + s * rx * 0.66, y - 1.5 * ry - 0.4 * rx, z + 0.62 * rx, 0.07 * rx, 0.26 * rx], [x + s * rx * 0.66, y - 1.5 * ry - 1.3 * rx, z + 0.8 * rx, 0.07 * rx, 0.26 * rx]], { seg: 8, sub: 2 });   // the lappet on the chest
  }
  T(F.s(BL), [[x, y - 0.8 * ry, z + 0.85 * rz, 0.12 * rx, 0.14 * rx], [x, y - 1.1 * ry - 0.3 * rx, z + 1.05 * rx, 0.14 * rx, 0.14 * rx], [x, y - 1.1 * ry - 0.9 * rx, z + 1.12 * rx, 0.12 * rx, 0.12 * rx]], { seg: 8, sub: 2 });   // the false beard
  tube(F.s(BL), [[x, y - 1.1 * ry - 0.9 * rx, z + 1.12 * rx, 0.1 * rx, 0.1 * rx], [x, y - 1.1 * ry - 1.02 * rx, z + 1.3 * rx, 0.1 * rx, 0.1 * rx]], { seg: 6, sub: 1 });   // its curled tip
}

/**
 * An Osiride statue of the king against a pillar of the first hall, 9.8 m: the shrouded body with the short pleated kilt and belt, the arms crossed on
 * the chest with the crook and the flail, the nemes and the white or the double crown, the false beard. Origin: on the floor, in the pillar's face.
 */
export function osiride(F, crownKind = 'white', fine = false) {
  const c = [0, 8.3, 0.06], rx = 0.38, ry = 0.47, rz = 0.42;
  if (fine) {
    head(F, c, [rx, ry, rz], { fine: true }); nemes(F, c, rx, ry, rz, true); crown(F, [0, 8.3, 0.06], crownKind, 1, true);
    T(F.s(GD), [[0, 4.8, 0.43, 0.04, 0.66], [0, 4.98, 0.43, 0.04, 0.66]], { cap: [0, 0], seg: 18, sub: 1 });                        // the belt's gold edge
    for (const s of [-1, 1]) fist(F, [-s * 0.26, 6.84 + (s > 0 ? 0.08 : -0.06), 0.5 + (s > 0 ? 0.06 : 0)], [0, -1, 0], 1.25, SK, true);
    for (const s of [-1, 1]) T(F.s(GD), [[s * 0.9, 6.62, 0.2, 0.2, 0.2], [s * 0.93, 6.5, 0.22, 0.2, 0.2]], { cap: [0, 0], seg: 10, sub: 1 });   // the armlets
    for (let i = 0; i < 5; i++) T(F.s(i % 2 ? BL : GD), [[0, 7.55 - i * 0.075, 0.38, 0.03, 0.62 - i * 0.07], [0, 7.6 - i * 0.075, 0.4, 0.03, 0.64 - i * 0.07]], { cap: [0, 0], seg: 12, sub: 1 });   // the broad collar in bands
    return;
  }
  // the base and the feet
  F.s(ST).box(-0.62, 0, -0.5, 0.62, 0.3, 0.62);
  for (const s of [-1, 1]) blob(F.s(SK), [s * 0.2, 0.4, 0.4], [0.16, 0.11, 0.3], 3, 8);
  // the body: shrouded legs, hips, waist, chest, shoulders, neck
  T(F.s(ST), [[0, 0.32, 0.05, 0.34, 0.45], [0, 1.6, 0.03, 0.36, 0.48], [0, 3.0, 0.0, 0.4, 0.54], [0, 4.3, 0.0, 0.44, 0.62], [0, 5.0, 0.0, 0.43, 0.64], [0, 5.8, 0.03, 0.4, 0.62], [0, 6.6, 0.06, 0.46, 0.86], [0, 7.3, 0.04, 0.42, 1.0], [0, 7.7, 0.02, 0.3, 0.6]], { seg: 20, sub: 2, cap: [1, 0] });
  T(F.s(SK), [[0, 7.55, 0.03, 0.27, 0.3], [0, 8.0, 0.05, 0.2, 0.22]], { seg: 10, sub: 1, cap: [0, 0] });                                // the neck
  // the kilt: pleated, flared, its apron standing out in front, the belt over it
  T(F.s(WH), [[0, 3.85, 0.02, 0.5, 0.64], [0, 4.4, 0.02, 0.48, 0.66], [0, 4.85, 0.02, 0.47, 0.68]], { seg: 24, sub: 2, cap: [0, 0], fold: pleat(14, 0.018, 0.2) });
  T(F.s(OC), [[0, 4.76, 0.02, 0.485, 0.7], [0, 5.0, 0.02, 0.485, 0.7]], { seg: 20, sub: 1, cap: [0, 0] });                              // the belt
  // the arms crossed, the right over the left, holding the crook and the flail
  for (const s of [1, -1]) {
    const top = s > 0, fx = -s * 0.26, fy = 6.88 + (top ? 0.1 : -0.06), fz = 0.52 + (top ? 0.07 : 0);
    blob(F.s(SK), [s * 0.9, 7.0, 0.08], [0.26, 0.28, 0.26], 3, 8);                                                                       // the shoulder
    tube(F.s(SK), [[s * 0.9, 7.0, 0.08, 0.22, 0.22], [s * 0.97, 6.55, 0.14, 0.2, 0.2], [s * 0.98, 6.2, 0.2, 0.17, 0.17]], { seg: 10, sub: 2 });   // the upper arm
    tube(F.s(SK), [[s * 0.98, 6.2, 0.2, 0.17, 0.17], [s * 0.5, 6.5, 0.45, 0.16, 0.16], [fx, fy, fz, 0.14, 0.14]], { seg: 10, sub: 2 });       // the forearm across
    fist(F, [fx, fy, fz + 0.04], [0, -1, 0], 1.25);
    // the crook (left hand) and the flail (right): rods up to the shoulders, the hook, the three thongs
    const gx = fx - s * 0.04;
    if (top) {
      rodT(F.s(GD), [gx, fy - 0.2, fz + 0.04], [gx - 0.34, fy + 0.72, fz - 0.02], 0.05, 0.05, { seg: 6 });
      torus(F.s(GD), [gx - 0.46, fy + 0.74, fz - 0.02], [1, 0, 0], [0, 1, 0], 0.13, 0.04, { seg: 10, sec: 5, arc: Math.PI * 1.3, from: -0.2 });
    } else {
      rodT(F.s(GD), [gx, fy - 0.2, fz + 0.04], [gx + 0.3, fy + 0.62, fz - 0.02], 0.05, 0.05, { seg: 6 });
      for (const d of [-1, 0, 1]) rodT(F.s(BL), [gx + 0.3, fy + 0.62, fz - 0.02], [gx + 0.3 + 0.2 * d + 0.28, fy + 0.62 + 0.22 - Math.abs(d) * 0.06, fz + 0.0], 0.035, 0.03, { seg: 5 });
    }
  }
  // the head
  head(F, c, [rx, ry, rz]); nemes(F, c, rx, ry, rz, false); crown(F, c, crownKind, 1, false);
}

/** The god of a seated figure's own type: 'ptah' | 'amun' | 'ramesses' | 'ra' on a block throne, 1.9 m to the head, the crown above. Origin: the throne's middle on the floor. */
export function seatedGod(F, kind, fine = false) {
  const hc = [0, 1.56, 0.0], rx = 0.115, ry = 0.15, rz = 0.13, skin = kind === 'ptah' ? 'fresco_green' : SK;
  if (fine) {
    if (kind !== 'ra') { head(F, hc, [rx, ry, rz], { skin, fine: true }); }
    else { for (const s of [-1, 1]) { blob(F.s('plaster_white'), [s * 0.075, 1.6, 0.1], [0.032, 0.03, 0.02], 2, 6); blob(F.s(BK), [s * 0.08, 1.6, 0.115], [0.014, 0.014, 0.01], 2, 5); } }
    for (let i = 0; i < 6; i++) rodT(F.s(WH), [-0.2 + i * 0.08, 0.76, 0.08], [-0.2 + i * 0.08, 0.75, 0.5], 0.008, 0.008, { seg: 3 });     // the kilt's pleats
    return;
  }
  // the block throne and its back
  F.s(ST).box(-0.43, 0, -0.34, 0.43, 0.55, 0.5); F.s(ST).box(-0.4, 0.55, -0.34, 0.4, 1.95, -0.14);
  F.s(ST).box(-0.46, 0, -0.36, 0.46, 0.06, 0.72);
  // legs: thighs forward, knees, shins down, the feet on the base
  for (const s of [-1, 1]) {
    tube(F.s(kind === 'ptah' ? BL : SK), [[s * 0.13, 0.68, -0.02, 0.09, 0.1], [s * 0.14, 0.7, 0.24, 0.085, 0.09], [s * 0.14, 0.64, 0.44, 0.08, 0.085]], { seg: 8, sub: 2 });
    tube(F.s(kind === 'ptah' ? BL : SK), [[s * 0.14, 0.62, 0.45, 0.075, 0.08], [s * 0.14, 0.36, 0.47, 0.065, 0.07], [s * 0.14, 0.14, 0.46, 0.055, 0.06]], { seg: 8, sub: 2 });
    blobDir(F.s(SK), [s * 0.15, 0.1, 0.56], [0, -0.05, 1], 0.14, 0.055, 0.045, [1, 0, 0], 3, 7);
  }
  // body: kilt over the lap, torso, shoulders; Ptah a close shroud to the neck
  if (kind === 'ptah') T(F.s(BL), [[0, 0.6, 0.02, 0.15, 0.22], [0, 0.95, 0.03, 0.13, 0.2], [0, 1.22, 0.04, 0.14, 0.24], [0, 1.36, 0.03, 0.11, 0.2]], { seg: 14, sub: 2 });
  else {
    T(F.s(SK), [[0, 0.62, 0.02, 0.14, 0.21], [0, 0.95, 0.03, 0.12, 0.19], [0, 1.2, 0.04, 0.135, 0.235], [0, 1.36, 0.03, 0.11, 0.2]], { seg: 14, sub: 2 });
    T(F.s(WH), [[0, 0.66, 0.05, 0.055, 0.22], [0, 0.68, 0.3, 0.05, 0.24], [0, 0.65, 0.5, 0.045, 0.24]], { seg: 14, sub: 2, ref: [0, 1, 0], cap: [0, 1] });   // the kilt over the lap
    T(F.s(WH), [[0, 0.88, 0.0, 0.14, 0.215], [0, 0.64, 0.0, 0.16, 0.235]], { seg: 14, sub: 1, cap: [0, 0], fold: pleat(10, 0.03) });
    T(F.s(GD), [[0, 0.95, 0.03, 0.135, 0.205], [0, 1.02, 0.03, 0.135, 0.205]], { seg: 14, sub: 1, cap: [0, 0] });                       // the belt
    T(F.s(GD), [[0, 1.24, 0.08, 0.06, 0.25], [0, 1.31, 0.08, 0.06, 0.24]], { seg: 14, sub: 1, cap: [0, 0] });                       // the collar
  }
  T(F.s(skin), [[0, 1.33, 0.02, 0.1, 0.11], [0, 1.44, 0.02, 0.09, 0.1]], { seg: 8, sub: 1, cap: [0, 0] });
  // arms: one hand flat on the knee, the other with the sceptre (Ptah: both at the sceptre before him)
  for (const s of [-1, 1]) {
    const sleeve = kind === 'ptah' ? BL : SK, hold = kind === 'ptah' || s < 0;
    blob(F.s(sleeve), [s * 0.25, 1.27, 0.03], [0.075, 0.075, 0.075], 3, 6);
    tube(F.s(sleeve), [[s * 0.25, 1.27, 0.03, 0.055, 0.055], [s * 0.27, 1.0, 0.06, 0.05, 0.05], [s * 0.24, 0.9, 0.22, 0.045, 0.045]], { seg: 8, sub: 2 });
    if (hold) { fist(F, [s * (kind === 'ptah' ? 0.07 : 0.22), 0.92, 0.36], [0, 1, 0], 0.5, skin === SK ? SK : BL); }
    else { blobDir(F.s(SK), [s * 0.2, 0.84, 0.38], [0, 0, 1], 0.1, 0.03, 0.045, [0, 1, 0], 3, 6); }
  }
  if (kind === 'ptah') {     // the was-sceptre with its djed pillar and ankh: a staff before the chest
    rodT(F.s(GD), [0, 0.2, 0.55], [0, 1.9, 0.5], 0.025, 0.025, { seg: 6 });
    blobDir(F.s(GD), [0, 1.93, 0.5], [0, 1, 0], 0.07, 0.04, 0.03, [1, 0, 0], 3, 6);
    for (const dy of [0.0, 0.1]) F.s(GD).box(-0.06, 1.62 + dy, 0.47, 0.06, 1.65 + dy, 0.53);
  } else if (kind === 'ra' || kind === 'amun') {
    rodT(F.s(GD), [-0.22, 0.8, 0.4], [-0.22, 1.7, 0.4], 0.02, 0.02, { seg: 6 });           // the sceptre in the left hand
  } else {
    rodT(F.s(GD), [-0.22, 0.8, 0.4], [-0.22, 1.2, 0.38], 0.02, 0.02, { seg: 6 });
    F.s(GD).box(-0.2, 1.2, 0.36, -0.12, 1.23, 0.42);
  }
  // the head and what it wears
  if (kind === 'ra') {
    blob(F.s(SK), [0, 1.57, 0.0], [0.12, 0.14, 0.15], 5, 10);                                   // the falcon's head
    blob(F.s(SK), [0, 1.52, 0.1], [0.09, 0.09, 0.08], 3, 8);
    for (const s of [-1, 1]) blob(F.s(SK), [s * 0.075, 1.6, 0.1], [0.04, 0.045, 0.04], 3, 6);   // the brow over each eye
    blobDir(F.s(OC), [0, 1.5, 0.19], [0, -0.45, 0.9], 0.075, 0.035, 0.03, [1, 0, 0], 3, 6);      // the hooked beak
    blobDir(F.s(OC), [0, 1.46, 0.245], [0, -1, 0.3], 0.04, 0.025, 0.02, [1, 0, 0], 2, 5);
    T(F.s(BK), [[0, 1.65, 0.06, 0.14, 0.12], [0, 1.4, 0.0, 0.17, 0.17], [0, 1.2, -0.02, 0.17, 0.22]], { seg: 10, sub: 2, cap: [0, 1] });   // the wig behind
    blob(F.s(GD), [0, 1.9, -0.02], [0.2, 0.2, 0.035], 3, 14);                                   // the sun disc
    tube(F.s(RD), [[0, 1.74, 0.02, 0.025, 0.025], [0, 1.82, 0.08, 0.03, 0.03]], { seg: 6, sub: 1 });
    blob(F.s(RD), [0, 1.76, 0.08], [0.03, 0.04, 0.03], 2, 6);
  } else {
    head(F, hc, [rx, ry, rz], { skin });
    if (kind === 'ptah') {
      blob(F.s(BL), [0, 1.62, -0.01], [0.125, 0.12, 0.14], 4, 10);                               // the close cap
      tube(F.s(BL), [[0, 1.4, 0.115, 0.03, 0.035], [0, 1.18, 0.15, 0.03, 0.035], [0, 1.1, 0.18, 0.03, 0.035]], { seg: 6, sub: 1 });   // the straight beard
    } else if (kind === 'amun') {
      blob(F.s(BL), [0, 1.64, -0.01], [0.125, 0.11, 0.14], 4, 10);                               // the cap
      for (const s of [-1, 1]) F.s(BL).prism([[-0.035, 0], [0.035, 0], [0.03, 0.7], [-0.03, 0.7]].map(([a, b]) => [a + s * 0.045, 1.7 + b]), -0.04, 0.02);   // the two tall plumes
      F.s(GD).box(-0.12, 1.69, -0.05, 0.12, 1.73, 0.1);                                           // the modius
      tube(F.s(BL), [[0, 1.4, 0.12, 0.028, 0.03], [0, 1.2, 0.17, 0.03, 0.035]], { seg: 6, sub: 1 });
    } else {
      nemes(F, [0, 1.58, 0.0], 0.115, 0.15, 0.13, false);
      T(F.s(RD), [[0, 1.7, -0.02, 0.13, 0.12], [0, 1.82, -0.02, 0.15, 0.14], [0, 1.92, -0.02, 0.12, 0.11]], { seg: 12, sub: 1, cap: [0, 0] });
      T(F.s(WH), [[0, 1.9, -0.02, 0.085, 0.08], [0, 2.1, -0.02, 0.075, 0.07], [0, 2.25, -0.02, 0.035, 0.035]], { seg: 10, sub: 1, cap: [0, 1] });
      for (const s of [-1, 1]) torus(F.s(OC), [s * 0.15, 1.82, 0.0], [0, 0, 1], [0, 1, 0], 0.07, 0.022, { seg: 10, sec: 5, arc: Math.PI * 1.6, from: 0.4 });   // the ram's horns
    }
  }
}

/** Ra-Horakhty in the niche over the door, 2.2 m: the falcon's head with the sun disc and the uraeus, the pleated kilt, the was-sceptre (user) in one hand, Maat in the other. */
export function raNiche(F, fine = false) {
  const hc = [0, 1.98, 0.0];
  if (fine) {
    for (const s of [-1, 1]) { blob(F.s('plaster_white'), [s * 0.085, 2.02, 0.12], [0.036, 0.034, 0.02], 2, 6); blob(F.s(BK), [s * 0.09, 2.02, 0.135], [0.016, 0.016, 0.01], 2, 5); }
    return;
  }
  F.s(ST).box(-0.55, 0, -0.5, 0.55, 0.1, 0.7);                                                    // the plinth
  // the legs, the left foot forward
  for (const s of [-1, 1]) {
    const zf = s < 0 ? 0.22 : 0;
    tube(F.s(SK), [[s * 0.12, 0.13, 0.1 + zf, 0.06, 0.075], [s * 0.12, 0.55, 0.05 + zf * 0.6, 0.065, 0.08], [s * 0.12, 0.95, 0.0, 0.085, 0.095]], { seg: 10, sub: 2 });
    blobDir(F.s(SK), [s * 0.12, 0.15, 0.22 + zf], [0, 0, 1], 0.16, 0.08, 0.05, [1, 0, 0], 3, 7);
  }
  T(F.s(WH), [[0, 0.75, 0.0, 0.2, 0.3], [0, 0.95, 0.0, 0.21, 0.31], [0, 1.1, 0.02, 0.2, 0.31]], { seg: 20, sub: 2, cap: [0, 0], fold: pleat(12, 0.025, 0.25) });
  T(F.s(GD), [[0, 1.04, 0.02, 0.215, 0.315], [0, 1.12, 0.02, 0.215, 0.315]], { seg: 18, sub: 1, cap: [0, 0] });
  T(F.s(SK), [[0, 1.1, 0.02, 0.18, 0.28], [0, 1.4, 0.04, 0.2, 0.34], [0, 1.65, 0.04, 0.17, 0.36], [0, 1.74, 0.03, 0.12, 0.2]], { seg: 16, sub: 2, cap: [0, 0] });
  T(F.s(SK), [[0, 1.72, 0.04, 0.1, 0.11], [0, 1.85, 0.06, 0.085, 0.09]], { seg: 8, sub: 1, cap: [0, 0] });
  T(F.s(GD), [[0, 1.58, 0.1, 0.1, 0.36], [0, 1.68, 0.1, 0.1, 0.36]], { seg: 16, sub: 1, cap: [0, 0] });          // the broad collar
  for (const s of [-1, 1]) {
    blob(F.s(SK), [s * 0.34, 1.62, 0.04], [0.1, 0.1, 0.1], 3, 6);
    if (s > 0) {         // the right arm bent, the hand on the was-sceptre
      tube(F.s(SK), [[0.34, 1.62, 0.04, 0.07, 0.07], [0.38, 1.35, 0.1, 0.065, 0.065], [0.3, 1.25, 0.3, 0.06, 0.06]], { seg: 8, sub: 2 });
      fist(F, [0.3, 1.25, 0.36], [0, 1, 0], 0.5);
      rodT(F.s(GD), [0.3, 0.1, 0.38], [0.3, 1.95, 0.38], 0.026, 0.024, { seg: 6 });           // the was-sceptre (user)
      blobDir(F.s(GD), [0.3, 2.0, 0.4], [0, 1, 0.25], 0.07, 0.04, 0.03, [1, 0, 0], 3, 6);
      blobDir(F.s(GD), [0.3, 0.08, 0.4], [0, -1, 0.5], 0.08, 0.025, 0.025, [1, 0, 0], 2, 5);
    } else {             // the left arm forward, holding Maat on the hand
      tube(F.s(SK), [[-0.34, 1.62, 0.04, 0.07, 0.07], [-0.38, 1.4, 0.12, 0.065, 0.065], [-0.3, 1.3, 0.34, 0.06, 0.06]], { seg: 8, sub: 2 });
      fist(F, [-0.3, 1.28, 0.4], [0, 0, 1], 0.5);
      // Maat seated on the palm: a small figure (0.28 m), the feather on her head
      blob(F.s(WH), [-0.3, 1.43, 0.46], [0.045, 0.055, 0.05], 3, 6); blob(F.s(SK), [-0.3, 1.55, 0.46], [0.03, 0.035, 0.03], 3, 6);
      F.s(BL).box(-0.31, 1.58, 0.45, -0.29, 1.7, 0.47);
    }
  }
  blob(F.s(SK), [0, 2.0, 0.0], [0.115, 0.14, 0.14], 5, 10);                                    // the falcon's head
  blob(F.s(SK), [0, 1.95, 0.1], [0.085, 0.085, 0.08], 3, 8);
  for (const s of [-1, 1]) blob(F.s(SK), [s * 0.085, 2.04, 0.1], [0.04, 0.045, 0.04], 3, 6);
  blobDir(F.s(OC), [0, 1.93, 0.18], [0, -0.45, 0.9], 0.075, 0.035, 0.03, [1, 0, 0], 3, 6);
  blobDir(F.s(OC), [0, 1.89, 0.235], [0, -1, 0.3], 0.04, 0.025, 0.02, [1, 0, 0], 2, 5);
  T(F.s(BK), [[0, 2.08, 0.05, 0.13, 0.11], [0, 1.85, 0.0, 0.17, 0.17], [0, 1.66, -0.02, 0.17, 0.22]], { seg: 10, sub: 2, cap: [0, 1] });
  blob(F.s(GD), [0, 2.32, -0.02], [0.2, 0.2, 0.035], 3, 14);                                   // the sun disc
  tube(F.s(RD), [[0, 2.14, 0.03, 0.025, 0.025], [0, 2.24, 0.1, 0.03, 0.03]], { seg: 6, sub: 1 });
  blob(F.s(RD), [0, 2.18, 0.1], [0.03, 0.04, 0.03], 2, 6);
  void hc;
}

/** A small royal figure of the colossi's feet, `kind` 'queen' | 'princess' | 'prince', 1.75 m at k = 1 (scaled by the caller): standing, the left foot forward. */
export function royal(F, kind = 'queen', fine = false) {
  const c = [0, 1.66, 0.01], rx = 0.085, ry = 0.11, rz = 0.095, queen = kind === 'queen', prince = kind === 'prince';
  if (fine) {
    head(F, c, [rx, ry, rz], { fine: true });
    return;
  }
  F.s(ST).box(-0.26, 0, -0.22, 0.26, 0.05, 0.4);
  if (prince) {
    for (const s of [-1, 1]) {
      const zf = s < 0 ? 0.1 : 0;
      tube(F.s(SK), [[s * 0.07, 0.07, 0.04 + zf, 0.03, 0.04], [s * 0.07, 0.4, 0.02 + zf * 0.6, 0.04, 0.045], [s * 0.07, 0.78, 0.0, 0.055, 0.06]], { seg: 8, sub: 2 });
      blobDir(F.s(SK), [s * 0.07, 0.08, 0.1 + zf], [0, 0, 1], 0.09, 0.04, 0.025, [1, 0, 0], 3, 6);
    }
    T(F.s(WH), [[0, 0.66, 0.0, 0.1, 0.17], [0, 0.88, 0.0, 0.11, 0.18], [0, 1.0, 0.01, 0.1, 0.18]], { seg: 14, sub: 2, cap: [0, 0], fold: pleat(10, 0.03, 0.2) });
    T(F.s(SK), [[0, 1.0, 0.0, 0.09, 0.15], [0, 1.2, 0.02, 0.1, 0.19], [0, 1.42, 0.02, 0.09, 0.2]], { seg: 12, sub: 2, cap: [0, 0] });
  } else T(F.s(queen ? WH : OC), [[0, 0.07, 0.04, 0.09, 0.13], [0, 0.55, 0.0, 0.11, 0.17], [0, 0.95, 0.0, 0.12, 0.19], [0, 1.2, 0.02, 0.11, 0.17], [0, 1.4, 0.02, 0.1, 0.2]], { seg: 14, sub: 2, cap: [1, 0] });
  T(F.s(SK), [[0, 1.38, 0.02, 0.06, 0.065], [0, 1.52, 0.02, 0.05, 0.055]], { seg: 8, sub: 1, cap: [0, 0] });
  for (const s of [-1, 1]) {
    blob(F.s(SK), [s * 0.2, 1.42, 0.02], [0.05, 0.05, 0.05], 3, 6);
    const hand = queen && s > 0 ? [0.12, 1.3, 0.14] : [s * 0.21, 0.82, 0.04];
    tube(F.s(SK), [[s * 0.2, 1.42, 0.02, 0.035, 0.035], [s * 0.23, 1.15, 0.05, 0.032, 0.032], [...hand, 0.03, 0.03]], { seg: 6, sub: 2 });
    blob(F.s(SK), [hand[0], hand[1] - 0.03, hand[2] + 0.01], [0.03, 0.045, 0.03], 3, 5);
  }
  head(F, c, [rx, ry, rz]);
  if (queen || kind === 'princess') {
    T(F.s(BK), [[0, 1.78, -0.01, 0.1, 0.095], [0, 1.6, -0.05, 0.12, 0.12], [0, 1.4, -0.06, 0.12, 0.14]], { seg: 10, sub: 2, cap: [0, 1] });   // the wig behind
    for (const s of [-1, 1]) T(F.s(BK), [[s * 0.085, 1.66, 0.03, 0.03, 0.04], [s * 0.1, 1.45, 0.08, 0.035, 0.05], [s * 0.1, 1.3, 0.1, 0.035, 0.05]], { seg: 8, sub: 2 });   // its lappets
  } else blob(F.s(BK), [0, 1.73, 0.0], [0.09, 0.065, 0.1], 3, 8);
  if (queen) {
    F.s(GD).box(-0.1, 1.76, -0.08, 0.1, 1.8, 0.1);                                                  // the modius
    blob(F.s(GD), [0, 1.9, 0.0], [0.07, 0.07, 0.02], 3, 10);                                        // the sun disc
    for (const s of [-1, 1]) F.s(BL).prism([[-0.02, 0], [0.02, 0], [0.015, 0.5], [-0.015, 0.5]].map(([a, b]) => [a + s * 0.04, 1.8 + b]), -0.02, 0.02);
  } else if (prince) tube(F.s(BK), [[0.09, 1.7, 0.0, 0.015, 0.015], [0.115, 1.55, 0.0, 0.017, 0.017], [0.115, 1.42, 0.02, 0.015, 0.015]], { seg: 5, sub: 1 });   // the side-lock
  else tube(F.s(GD), [[0, 1.76, 0.03, 0.09, 0.1], [0, 1.78, 0.03, 0.09, 0.1]], { seg: 10, sub: 1, cap: [0, 0] });
}

/**
 * A bound captive kneeling, a small relief figure (0.5 m) built facing the viewer: `kind` 'nubian' | 'asiatic'; the arms drawn behind the back, the head
 * held up by the cord. For a surface of the frieze: the Kit is flat and cut at the wall.
 */
export function captive(F, kind) {
  const skin = kind === 'nubian' ? BK : OC, hair = kind === 'nubian' ? BK : RD;
  const K = F.s(skin);
  blob(K, [0, 0.14, 0.0], [0.1, 0.11, 0.1], 3, 8);                                                    // the folded legs
  blob(K, [-0.11, 0.1, 0.02], [0.12, 0.07, 0.09], 3, 8); blob(K, [0.11, 0.1, 0.02], [0.12, 0.07, 0.09], 3, 8);
  F.s(WH).box(-0.14, 0.12, 0.01, 0.14, 0.26, 0.09);                                                    // the kilt
  tube(K, [[0, 0.24, 0, 0.08, 0.12], [0, 0.34, 0.01, 0.08, 0.13], [0, 0.42, 0.0, 0.07, 0.15]], { seg: 10, sub: 1, ref: [0, 0, 1], cap: [0, 0] });   // the torso
  for (const s of [-1, 1]) tube(K, [[s * 0.15, 0.42, -0.01, 0.035, 0.035], [s * 0.1, 0.3, -0.06, 0.035, 0.035], [s * 0.02, 0.24, -0.08, 0.03, 0.03]], { seg: 6, sub: 1 });   // the arms pulled back
  rodT(F.s(OC), [-0.06, 0.26, -0.07], [0.06, 0.28, -0.07], 0.018, 0.018, { seg: 5 });                // the cord at the elbows
  blob(K, [0, 0.5, 0.01], [0.055, 0.065, 0.06], 3, 8);                                                 // the head
  if (kind === 'nubian') blob(F.s(hair), [0, 0.53, 0.0], [0.065, 0.05, 0.065], 3, 8);
  else { blob(F.s(hair), [0, 0.54, 0.0], [0.06, 0.035, 0.065], 3, 8); blob(F.s(hair), [0, 0.45, 0.05], [0.025, 0.04, 0.02], 2, 5); }
}
