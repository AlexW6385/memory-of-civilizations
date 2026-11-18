// Modelled beasts of the entrance (docs/settlements/khajuraho.md §17): the seated lion (śārdūla) on his pier at the foot of the
// stair, and the makara torana between the porch's front pillars — a garland of lobes "sculpted from a single stone"
// (Wikipedia) springing from the open mouths of two sea-monsters, a lion-faced kīrttimukha at its crown. Rounded solids
// (Form), whole (nothing is dropped behind a wall), one geometry each.

import { Form, mirrored } from './form.js';

/** A seated lion facing +d, at the origin (feet on the pier at v = 0), 1.0 tall to the top of the mane. */
export function lionForm(F0, hi = true, sw = 1) {
  const F = mirrored(F0, sw), sd = hi ? 10 : 7, e = (c, r, o = {}) => F.ell(c, r, { sides: sd, rings: hi ? 6 : 4, ...o });
  const T = (pts, o = {}) => F.tube(pts.map(([u, v, d, a, b]) => [u, v, d, a, b ?? a]), { sides: hi ? 7 : 5, sub: hi ? 2 : 1, ...o });
  // haunches and loins: the hind legs folded under, the thighs rounded
  for (const s of [-1, 1]) {
    e([s * 0.17, 0.27, -0.14], [0.14, 0.27, 0.22], { axis: [0, 1, -0.2] });
    e([s * 0.17, 0.05, 0.03], [0.07, 0.16, 0.04], { axis: [0, 0, 1], dref: [0, 1, 0] });                       // the hind paws
  }
  e([0, 0.42, -0.15], [0.22, 0.2, 0.26], { axis: [0, 1, -0.4] });
  // the chest and the ribs, broad above, drawn in at the waist
  T([[0, 0.34, -0.12, 0.18, 0.2], [0, 0.55, 0.0, 0.21, 0.23], [0, 0.74, 0.08, 0.21, 0.2], [0, 0.84, 0.1, 0.16, 0.16]], { sides: hi ? 12 : 8 });
  // the forelegs, straight, the shoulder's muscle, the elbow, the pastern, the paw with its toes
  for (const s of [-1, 1]) {
    e([s * 0.14, 0.62, 0.1], [0.085, 0.16, 0.1], { axis: [0, 1, -0.1] });
    T([[s * 0.13, 0.55, 0.12, 0.075], [s * 0.125, 0.33, 0.19, 0.062], [s * 0.125, 0.12, 0.23, 0.05], [s * 0.125, 0.04, 0.25, 0.052]], { sub: 2 });
    e([s * 0.125, 0.032, 0.3], [0.062, 0.085, 0.035], { axis: [0, 0, 1], dref: [0, 1, 0] });
    if (hi) for (const k of [-0.03, 0, 0.03]) e([s * 0.125 + k, 0.03, 0.375], [0.0165, 0.026, 0.016], { axis: [0, 0, 1], dref: [0, 1, 0], sides: 6, rings: 3 });
  }
  // the head, the muzzle, the open mouth with its fangs and tongue, the nose, the brows, the eyes, the ears
  e([0, 0.93, 0.17], [0.15, 0.15, 0.16], { axis: [0, 1, 0.1] });
  e([0, 0.885, 0.3], [0.09, 0.1, 0.07], { axis: [0, 0, 1], dref: [0, 1, 0] });
  e([0, 0.84, 0.29], [0.075, 0.09, 0.033], { axis: [0, 0, 1], dref: [0, 1, 0], sides: 8, rings: 4 });           // the lower jaw, dropped
  e([0, 0.92, 0.385], [0.04, 0.03, 0.03], { sides: 8, rings: 4 });                                              // the nose
  if (hi) {
    for (const s of [-1, 1]) {
      F.tube([[s * 0.035, 0.89, 0.34, 0.009, 0.009], [s * 0.04, 0.855, 0.345, 0.005, 0.002]], { sides: 5, sub: 1, capRings: [Math.PI / 2] });
      e([s * 0.065, 0.97, 0.285], [0.026, 0.017, 0.02], { sides: 8, rings: 4 });
      e([s * 0.067, 0.968, 0.3], [0.012, 0.012, 0.01], { sides: 6, rings: 3 });
      F.tube([[s * 0.03, 1.0, 0.31, 0.012, 0.012], [s * 0.075, 1.017, 0.3, 0.014, 0.014], [s * 0.12, 1.0, 0.25, 0.011, 0.011]], { sides: 6, sub: 2, capRings: [Math.PI / 2] });
      e([s * 0.13, 1.04, 0.1], [0.04, 0.045, 0.02], { axis: [s * 0.3, 1, 0] });
    }
    e([0, 0.8, 0.29], [0.025, 0.075, 0.012], { axis: [0, 0, 1], dref: [0, 1, 0], sides: 6, rings: 4 });
  }
  // the mane: locks in rings round the head and over the chest, each a curl tapering to its point
  const rings = hi ? [[0.2, 0.93, 0.1, 14, 0.075], [0.255, 0.92, 0.04, 16, 0.09], [0.29, 0.86, -0.02, 18, 0.1]] : [[0.22, 0.93, 0.08, 9, 0.08], [0.28, 0.86, 0.0, 11, 0.1]];
  for (const [R, v, d, n, len] of rings) for (let k = 0; k < n; k++) {
    const th = (k + (R > 0.25 ? 0.5 : 0)) / n * Math.PI * 2 + 0.3, ux = Math.cos(th), uy = Math.sin(th);
    if (uy < -0.55) continue;
    e([ux * R * 0.88, v + uy * R * 0.88, d], [0.042 + R * 0.05, len, 0.034], { axis: [ux * 0.9, uy * 0.9 + (uy < 0 ? -0.2 : 0.1), 0.1], sides: 6, rings: 4 });
  }
  if (hi) for (let k = 0; k < 7; k++) { const u = (k - 3) * 0.068; e([u, 0.7 - 0.1 * Math.abs(k - 3) * 0.3, 0.2], [0.04, 0.08, 0.035], { axis: [u * 2, -1, 0.1], sides: 6, rings: 4 }); }
  // the tail up the haunch, curling over, ending in its tuft
  T([[0.21, 0.12, -0.3, 0.026], [0.3, 0.3, -0.33, 0.022], [0.3, 0.52, -0.3, 0.02], [0.22, 0.63, -0.26, 0.019]], { sub: 2 });
  e([0.2, 0.68, -0.25], [0.04, 0.07, 0.04], { axis: [-0.5, 1, 0] });
}

/** One makara at the end of a torana, facing −u (toward the arch's middle when mirrored: caller mirrors), 0.9 long, in the local frame
 *  u along the arch, v up, d out: the head with its trunk-like snout curled up and its open jaws, the body's coil, the curling tail. */
export function makaraForm(F0, hi = true, sw = 1) {
  const F = mirrored(F0, sw), sd = hi ? 9 : 6, e = (c, r, o = {}) => F.ell(c, r, { sides: sd, rings: hi ? 6 : 4, ...o });
  const T = (pts, o = {}) => F.tube(pts.map(([u, v, d, a, b]) => [u, v, d, a, b ?? a]), { sides: hi ? 8 : 5, sub: hi ? 2 : 1, ...o });
  // the head: a heavy brow and the long upper jaw ending in a curled snout; the lower jaw dropped, the teeth between
  e([0.0, 0.0, 0.0], [0.2, 0.3, 0.2], { axis: [1, 0.15, 0] });
  e([-0.12, 0.17, 0.0], [0.09, 0.17, 0.19], { axis: [1, 0.4, 0] });                                  // the brow
  T([[-0.28, 0.07, 0.0, 0.14, 0.15], [-0.48, 0.1, 0.0, 0.11, 0.12], [-0.62, 0.18, 0.0, 0.085, 0.09], [-0.68, 0.34, 0.0, 0.065, 0.07], [-0.6, 0.46, 0.0, 0.05, 0.055], [-0.5, 0.45, 0.0, 0.034, 0.04]], { sub: hi ? 3 : 2 });   // the snout curled up
  T([[-0.24, -0.1, 0.0, 0.1, 0.12], [-0.44, -0.16, 0.0, 0.07, 0.09], [-0.56, -0.12, 0.0, 0.045, 0.06]], { sub: 2 });             // the lower jaw
  if (hi) {
    for (let k = 0; k < 5; k++) { const u = -0.3 - k * 0.07; T([[u, -0.0 - k * 0.002 + 0.06 * (k > 3), 0.0, 0.017], [u - 0.004, -0.07, 0.0, 0.002]], { sides: 4, sub: 1, caps: [false, false] }); }
    e([-0.08, 0.09, 0.19], [0.036, 0.05, 0.03], { axis: [1, 0.2, 0], sides: 8, rings: 5 });                                          // the eye, almond
    e([-0.08, 0.09, 0.215], [0.02, 0.02, 0.012], { sides: 6, rings: 4 });
    e([0.1, 0.12, 0.2], [0.09, 0.11, 0.025], { axis: [0.3, 1, 0] });                                                                 // the ear / fin
    for (let k = 0; k < 5; k++) e([0.06 + k * 0.05, 0.19 - k * 0.005, 0.12 - k * 0.012], [0.03, 0.06, 0.02], { axis: [0.4, 1, 0], sides: 6, rings: 4 });   // the crest
  }
  // the body: fish-like, scaled, tapering, rising in a coil to the tail that curls and ends in a frond
  const body = [[0.2, -0.02, 0.0, 0.2, 0.2], [0.5, -0.1, 0.0, 0.17, 0.17], [0.75, -0.02, 0.0, 0.12, 0.12], [0.9, 0.16, 0.0, 0.085, 0.085], [0.88, 0.36, 0.0, 0.06, 0.06], [0.74, 0.46, 0.0, 0.045, 0.045], [0.62, 0.4, 0.0, 0.03, 0.03], [0.62, 0.3, 0.0, 0.02, 0.02]];
  T(body, { sub: hi ? 2 : 1, sides: hi ? 9 : 6 });
  if (hi) {
    for (const [u, v, r] of [[0.32, 0.12, 0.06], [0.46, 0.1, 0.06], [0.6, 0.12, 0.055], [0.74, 0.1, 0.05]]) e([u, v + 0.07, 0.15], [r, r * 0.7, 0.03], { axis: [0.5, 1, 0], sides: 6, rings: 4 });     // the dorsal fins
    for (let k = 0; k < 9; k++) { const t = k / 8, u = 0.25 + t * 0.55; e([u, -0.1 + 0.16 * Math.sin(t * 2.2), 0.155 - 0.05 * t], [0.045, 0.045, 0.012], { sides: 6, rings: 3 }); }    // scales
    T([[0.62, 0.3, 0.0, 0.02], [0.5, 0.28, 0.0, 0.026], [0.44, 0.36, 0.0, 0.03], [0.5, 0.44, 0.0, 0.028]], { sub: 2, sides: 6 });          // the tail's last curl, a frond of three leaves
    for (const [du, dv, an] of [[-0.02, 0.07, 0.9], [-0.08, 0.03, 0.2], [-0.04, -0.02, -0.5]]) e([0.5 + du, 0.44 + dv, 0.0], [0.04, 0.1, 0.015], { axis: [Math.sin(an), Math.cos(an), 0], sides: 6, rings: 4 });
  }
}

/** The torana: spans u from −hw to hw (the arch's ends at the makaras' mouths at height 0), its crown at v = rise; local frame u along the arch,
 *  v up, d out. `lobes` of the garland (7); the kīrttimukha at the crown, the garland hanging in scallops under the beam, a bud at every cusp. */
export function toranaForm(F, hw, rise, hi = true, lobes = 7) {
  const n = lobes * 4, beam = [], thick = 0.15, e = (c, r, o = {}) => F.ell(c, r, { sides: 8, rings: 5, ...o });
  const arch = (t) => [-hw + 2 * hw * t, rise * Math.sin(Math.PI * t) ** 0.6];
  for (let k = 0; k <= n; k++) {
    const t = k / n, [u, v] = arch(t), ph = (k % 4) / 4, bead = 1 + 0.2 * Math.cos(ph * Math.PI * 2);   // a bead at every cusp
    beam.push([u, v, 0.0, thick * 0.95 * bead, thick * bead]);
  }
  F.tube(beam, { sides: hi ? 8 : 6, sub: 1, capRings: [1.0, Math.PI / 2], dref: [0, 0, 1] });
  // the garland hanging under it, lobe by lobe: each lobe a scallop of leaves ending in a bud
  for (let l = 0; l < lobes; l++) {
    const path = [];
    for (let k = 0; k <= (hi ? 6 : 4); k++) {
      const s = k / (hi ? 6 : 4), t = (l + s) / lobes, [u, v] = arch(t), sag = Math.sin(Math.PI * s);
      path.push([u, v - 0.12 - 0.42 * sag * Math.min(1, Math.sin(Math.PI * t) * 3.5), 0.1, 0.055, 0.07]);
    }
    F.tube(path, { sides: hi ? 6 : 4, sub: 1, capRings: [Math.PI / 2], dref: [0, 0, 1] });
    if (hi) {
      const [uc, vc] = arch((l + 0.5) / lobes);
      e([uc, vc - 0.12 - 0.42 * Math.min(1, Math.sin(Math.PI * (l + 0.5) / lobes) * 3.5) - 0.1, 0.12], [0.06, 0.1, 0.05], { axis: [0, -1, 0] });  // the bud at the middle of the scallop
      for (const s of [-0.28, 0.28]) { const t = (l + 0.5 + s) / lobes, [u, v] = arch(t); e([u, v - 0.12 - 0.42 * 0.85 * Math.min(1, Math.sin(Math.PI * t) * 3.5) - 0.06, 0.12], [0.035, 0.07, 0.03], { axis: [0, -1, 0], sides: 6, rings: 4 }); }
    }
  }
  // the kīrttimukha at the crown: a lion's face with bulging eyes and a wide mouth from which the garland issues
  const [cu, cv] = arch(0.5), top = cv + 0.22;
  e([cu, top + 0.22, 0.12], [0.34, 0.28, 0.18], { sides: 12, rings: 8 });
  if (hi) {
    for (const s of [-1, 1]) {
      e([cu + s * 0.12, top + 0.3, 0.27], [0.07, 0.055, 0.05], { sides: 8, rings: 5 });
      F.tube([[cu + s * 0.06, top + 0.38, 0.27, 0.025], [cu + s * 0.17, top + 0.43, 0.26, 0.025], [cu + s * 0.28, top + 0.36, 0.2, 0.02]].map(([a, b, c, r]) => [a, b, c, r, r]), { sides: 5, sub: 2, capRings: [Math.PI / 2] });
      F.tube([[cu + s * 0.3, top + 0.4, 0.06, 0.04], [cu + s * 0.4, top + 0.52, 0.04, 0.035], [cu + s * 0.36, top + 0.66, 0.04, 0.02]].map(([a, b, c, r]) => [a, b, c, r, r]), { sides: 5, sub: 2, capRings: [Math.PI / 2] });
    }
    e([cu, top + 0.2, 0.28], [0.06, 0.05, 0.07], { axis: [0, 1, 0.5] });
    e([cu, top + 0.08, 0.27], [0.15, 0.04, 0.05], { sides: 8, rings: 4 });
    for (const k of [-0.1, -0.05, 0.05, 0.1]) F.tube([[cu + k, top + 0.08, 0.3, 0.012, 0.012], [cu + k, top + 0.0, 0.3, 0.003, 0.003]], { sides: 4, sub: 1, caps: [false, false] });
    e([cu, top + 0.55, 0.05], [0.12, 0.14, 0.1], { sides: 8, rings: 5 });                                                       // the crest above
  }
  // pendants of bells hung from the beam at the cusps
  if (hi) for (let l = 1; l < lobes; l++) { const [u, v] = arch(l / lobes); F.tube([[u, v - 0.1, 0.0, 0.012, 0.012], [u, v - 0.18, 0.0, 0.012, 0.012]], { sides: 4, sub: 1, caps: [false, false] }); }
}

export { Form };
