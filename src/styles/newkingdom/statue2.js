// The modelled parts of the standing colossus (docs/settlements/thebes.md §14), in metres at the statue's 11 m (the caller scales them to its height):
// the legs with thigh, kneecap, shin and ankle, the arms crossing to the fists with fingers and thumbs, the face with brow, lids, eyes, nose, lips and chin,
// Bentanta at the king's leg with her dress, arms, wig and face. `fine` adds what shows within a few metres only.
import { Parts, tube, rowsY, rowsZ, ell, hash } from './sculpt.js';

const SK = 'granite_red', WH = 'plaster_white', BL = 'egyptian_blue', GD = 'gold', RD = 'limewash_red', OC = 'paint_ochre', BK = 'lacquer_black', GR = 'fresco_green';

/** The pieces of the sculpted colossus: add(mat, geometry) in metres. */
export function sculptColossus(add, fine) {
  const P = new Parts();
  // the legs: the right straight under the hip, the left striding forward; thigh, knee, shin with its calf, ankle
  const leg = (x, kz, az, kneeY) => {
    P.add(SK, tube([[x, 3.75, 0, 0.5, 0.5], [x, 3.0, kz * 0.4, 0.46, 0.48], [x, kneeY, kz, 0.37, 0.39], [x, 1.5, (kz + az) / 2 - 0.04, 0.34, 0.36], [x, 0.85, az - 0.04, 0.26, 0.27], [x, 0.5, az, 0.23, 0.25]], { seg: 3, n: fine ? 16 : 12 }));
    P.add(SK, ell([x, kneeY + 0.02, kz + 0.28], [0.3, 0.3, 0.17], null, 12, 7));                         // the kneecap
    P.add(SK, ell([x, 1.6, (kz + az) / 2 + 0.28], [0.1, 0.55, 0.07], [-0.15, 0, 0], 8, 6));          // the shin's edge
    P.add(SK, ell([x, 1.55, (kz + az) / 2 - 0.3], [0.27, 0.45, 0.2], [0.1, 0, 0], 10, 6));           // the calf
    for (const s of [-1, 1]) P.add(SK, ell([x + s * 0.24, 0.55, az], [0.12, 0.14, 0.12], null, 8, 5)); // the ankle bones
  };
  leg(-0.47, 0.1, 0.28, 2.0); leg(0.47, 0.5, 1.1, 2.05);
  // the arms crossed: from each shoulder to the elbow and across to the fist of the other side
  const fR = [0.33, 7.35, 0.99], fL = [-0.33, 7.17, 0.86];
  for (const [s, f] of [[-1, fR], [1, fL]]) {
    P.add(SK, tube([[s * 1.3, 7.55, 0, 0.36, 0.36], [s * 1.34, 6.9, 0.02, 0.3, 0.3], [s * 1.3, 6.3, 0.16, 0.25, 0.26], [s * 0.7, 6.8, 0.6, 0.22, 0.22], [f[0] + (s > 0 ? 0.1 : -0.1), f[1] - 0.05, f[2] - 0.05, 0.19, 0.19]], { seg: 3, n: fine ? 14 : 10 }));
    P.add(SK, ell([s * 1.3, 6.45, 0.12], [0.26, 0.24, 0.26], null, 10, 6));                               // the elbow
  }
  for (const f of [fR, fL]) {
    const k = f === fR ? 1 : -1;
    P.add(SK, ell([f[0], f[1], f[2]], [0.25, 0.22, 0.3], null, 12, 7));                                 // the fist
    for (let i = 0; i < 4; i++) P.add(SK, ell([f[0] + (i - 1.5) * 0.001 * k, f[1] + 0.17 - i * 0.095, f[2] + 0.22], [0.2, 0.05, 0.1], null, fine ? 8 : 6, 4));   // the fingers' knuckles, the fist closed round the sceptre
    P.add(SK, ell([f[0] - k * 0.24, f[1] + 0.12, f[2] + 0.04], [0.08, 0.1, 0.17], [0.3, 0, 0], 8, 5));  // the thumb
  }
  // the head: the face laid on the skull's own surface (centre (0, 8.72, 0.33), radii 0.4 × 0.58 × 0.48)
  const c = [0, 8.72, 0.33], r = [0.4, 0.58, 0.48];
  const surf = (x, y) => c[2] + r[2] * Math.sqrt(Math.max(0.05, 1 - (x / r[0]) ** 2 - ((y - c[1]) / r[1]) ** 2));
  P.add(SK, ell(c, r, null, 18, 11));
  const on = (mat, x, f, dz, rr, rot = null, seg = 8) => { const y = c[1] + f * r[1]; P.add(mat, ell([x, y, surf(x, y) + dz], rr, rot, seg, 5)); };
  for (const s of [-1, 1]) {
    on(SK, s * 0.25, -0.2, -0.02, [0.17, 0.17, 0.1]);                                                     // the cheek
    P.add(SK, tube([[s * 0.04, c[1] + 0.24, surf(0.04, c[1] + 0.24) + 0.03, 0.04, 0.04], [s * 0.19, c[1] + 0.26, surf(0.19, c[1] + 0.26) + 0.04, 0.045, 0.045], [s * 0.34, c[1] + 0.22, surf(0.34, c[1] + 0.22) - 0.02, 0.04, 0.04]], { seg: 3, n: 8 }));   // the brow
    on(SK, s * 0.17, 0.2, 0.025, [0.13, 0.05, 0.05], [0, 0, -s * 0.12]);                                  // the upper lid
    on(WH, s * 0.17, 0.15, 0.035, [0.1, 0.038, 0.03], [0, 0, -s * 0.12]);                                 // the eye
    on(BK, s * 0.17, 0.15, 0.058, [0.04, 0.036, 0.02]);                                                   // its iris
    on(BK, s * 0.19, 0.275, 0.06, [0.17, 0.014, 0.012], [0, 0, -s * 0.12]);                               // the painted brow
    on(SK, s * 0.075, -0.1, 0.08, [0.05, 0.05, 0.06]);                                                    // the wing of the nostril
    on(SK, s * 0.14, -0.42, 0.01, [0.04, 0.04, 0.04]);                                                    // the corner of the smile
    P.add(SK, ell([s * 0.38, c[1] - 0.05, c[2] - 0.05], [0.05, 0.17, 0.12], null, 8, 5));                 // the ear
  }
  P.add(SK, tube([[0, c[1] + 0.16, surf(0, c[1] + 0.16) + 0.02, 0.04, 0.05], [0, c[1] - 0.05, surf(0, c[1] - 0.05) + 0.09, 0.055, 0.075]], { seg: 2, n: 8 }));   // the bridge
  on(SK, 0, -0.13, 0.13, [0.08, 0.075, 0.09]);                                                            // the tip
  P.add(RD, tube([[-0.16, c[1] - 0.3, surf(0.16, c[1] - 0.3) + 0.01, 0.024, 0.024], [0, c[1] - 0.285, surf(0, c[1] - 0.285) + 0.05, 0.034, 0.034], [0.16, c[1] - 0.3, surf(0.16, c[1] - 0.3) + 0.01, 0.024, 0.024]], { seg: 3, n: 8 }));   // the upper lip
  P.add(RD, tube([[-0.14, c[1] - 0.355, surf(0.14, c[1] - 0.355) + 0.0, 0.026, 0.026], [0, c[1] - 0.365, surf(0, c[1] - 0.365) + 0.05, 0.04, 0.04], [0.14, c[1] - 0.355, surf(0.14, c[1] - 0.355) + 0.0, 0.026, 0.026]], { seg: 3, n: 8 }));   // the lower lip
  on(SK, 0, -0.66, 0.04, [0.15, 0.1, 0.1]);                                                               // the chin
  if (fine) {
    for (const s of [-1, 1]) {
      on(BK, s * 0.3, 0.15, 0.0, [0.1, 0.012, 0.012], [0, 0, -s * 0.15]);                               // the cosmetic line to the ear
      on(SK, s * 0.17, 0.1, 0.045, [0.11, 0.025, 0.03], [0, 0, -s * 0.12]);                             // the lower lid
      on(BK, s * 0.075, -0.1, 0.13, [0.03, 0.02, 0.03]);                                                // the nostril
    }
    on(BK, 0, -0.325, 0.07, [0.17, 0.01, 0.015]);                                                         // the line of the mouth
    // the fingers' nails and the grooves between them
    for (const f of [fR, fL]) for (let i = 0; i < 3; i++) P.add(BK, ell([f[0], f[1] + 0.12 - i * 0.095, f[2] + 0.3], [0.19, 0.006, 0.02], null, 6, 3));
  }
  for (const [m, l] of P.m) for (const g of l) add(m, g);
  void hash;
}

/** Bentanta at the king's right leg: the sheath, the arms, the tripartite wig with its crown of uraei and two plumes, a flower to the breast. At (bx, bz) in metres. */
export function sculptPrincess(add, bx, bz, fine) {
  const P = new Parts(), n = fine ? 14 : 10;
  P.add(WH, rowsY([[0.33, 0.27, -0.27, 0.27, bx], [1.3, 0.3, -0.27, 0.3, bx], [2.0, 0.32, -0.28, 0.33, bx], [2.5, 0.34, -0.26, 0.36, bx], [2.8, 0.33, -0.24, 0.33, bx], [3.0, 0.3, -0.2, 0.27, bx], [3.15, 0.2, -0.16, 0.19, bx]].map(([y, f, b, w, cx]) => [y, f + bz, b + bz, w, cx]), { n }));
  P.add(OC, rowsY([[2.62, 0.35, -0.27, 0.37, bx], [2.7, 0.35, -0.27, 0.36, bx]].map(([y, f, b, w, cx]) => [y, f + bz, b + bz, w, cx]), { n, seg: 1 }));   // the broad collar
  for (const s of [-1, 1]) P.add(SK, tube([[bx + s * 0.34, 2.9, bz, 0.09, 0.09], [bx + s * 0.38, 2.35, bz + 0.02, 0.075, 0.075], [bx + s * 0.22, 1.9, bz + 0.12, 0.07, 0.07]], { seg: 2, n: 8 }));   // the arms, the right hand to the breast
  P.add(SK, rowsY([[3.12, 0.1, -0.1, 0.1, bx], [3.3, 0.1, -0.1, 0.09, bx]].map(([y, f, b, w, cx]) => [y, f + bz, b + bz, w, cx]), { n: 8 }));          // the neck
  P.add(SK, ell([bx, 3.47, bz + 0.03], [0.17, 0.2, 0.19], null, n, 7));                                                                         // the head
  P.add(BK, rowsY([[3.2, 0.22, -0.3, 0.24, bx], [3.45, 0.22, -0.32, 0.25, bx], [3.68, 0.2, -0.28, 0.2, bx], [3.76, 0.1, -0.12, 0.08, bx]].map(([y, f, b, w, cx]) => [y, f + bz - 0.02, b + bz - 0.02, w, cx]), { n }));   // the wig
  for (const s of [-1, 1]) P.add(BK, rowsY([[3.0, 0.1, -0.16, 0.09, bx + s * 0.24], [3.3, 0.12, -0.16, 0.1, bx + s * 0.24]].map(([y, f, b, w, cx]) => [y, f + bz + 0.1, b + bz + 0.1, w, cx]), { n: 8 }));   // its lappets on the breast
  P.add(GD, rowsY([[3.68, 0.2, -0.2, 0.19, bx], [3.74, 0.19, -0.19, 0.18, bx]].map(([y, f, b, w, cx]) => [y, f + bz, b + bz, w, cx]), { n, seg: 1 }));   // the circlet
  for (const s of [-1, 1]) { P.add(GD, ell([bx + s * 0.07, 4.05, bz - 0.0], [0.055, 0.3, 0.025], null, 6, 5)); P.add(BL, ell([bx + s * 0.07, 3.95, bz + 0.0], [0.058, 0.04, 0.03], null, 6, 3)); }   // the plumes
  P.add(GD, ell([bx, 3.82, bz + 0.19], [0.03, 0.06, 0.03], null, 6, 4));                                                                         // the uraeus
  if (fine) {
    for (const s of [-1, 1]) { P.add(BK, ell([bx + s * 0.07, 3.52, bz + 0.21], [0.03, 0.012, 0.01], null, 6, 3)); }
    P.add(RD, ell([bx, 3.4, bz + 0.215], [0.045, 0.012, 0.01], null, 6, 3));
    P.add(GR, ell([bx + 0.18, 2.0, bz + 0.2], [0.07, 0.07, 0.04], null, 6, 4));                                                                   // the flower
  }
  for (const [m, l] of P.m) for (const g of l) add(m, g);
}
