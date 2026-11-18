// The gateways' narrative reliefs as shapes for sculpt.js's Relief: people, elephants, horses, chariots, trees, stupas, houses
// with balconies, and the tableaux built from them: the worship of the tree and of the stupa, the procession of elephants and
// chariots, the city. Heights are metres over the ground (a few centimetres: 2 to 8). u runs along the beam or panel, v up.
// docs/settlements/sanchi.md §19.

import { S2 } from './sculpt.js';
import { hash3 } from './sculpt.js';

const C = S2.circle, E = S2.ellipse, K = S2.capsule, B = S2.box;
const hv = (...a) => hash3(...a);

/** A person of height h standing at (u, v), facing d (±1), in a pose: 'stand', 'worship' (hands joined), 'bearer' (a whisk raised), 'kneel', 'seat'. */
export function person(R, u, v, h, d, pose = 'stand', hi = 0.045, seed = 0) {
  const s = hv(u, v, seed);
  R.add(C([u + d * 0.01 * h, v + 0.9 * h], 0.085 * h), hi + 0.006, 0, 0.012);                                                           // the head
  R.add(E([u + d * 0.03 * h, v + 0.96 * h], 0.1 * h, 0.05 * h, d * 0.2), hi + 0.002, 0, 0.01);                                         // the headcloth, a turban or a knot
  R.add(K([u, v + 0.46 * h], [u, v + 0.76 * h], 0.1 * h, 0.115 * h), hi, 0, 0.016);                                                      // the torso
  if (pose === 'kneel') {
    R.add(K([u, v + 0.46 * h], [u - d * 0.16 * h, v + 0.12 * h], 0.075 * h, 0.06 * h), hi, 0, 0.012);
    R.add(K([u - d * 0.16 * h, v + 0.12 * h], [u + d * 0.2 * h, v + 0.07 * h], 0.06 * h, 0.05 * h), hi - 0.004, 0, 0.01);
  } else if (pose === 'seat') {
    R.add(K([u, v + 0.4 * h], [u + d * 0.3 * h, v + 0.22 * h], 0.08 * h, 0.065 * h), hi, 0, 0.012);
    R.add(K([u + d * 0.3 * h, v + 0.22 * h], [u + d * 0.22 * h, v + 0.04 * h], 0.065 * h, 0.05 * h), hi, 0, 0.012);
  } else {
    const sp = 0.1 + 0.05 * s;
    R.add(K([u - d * 0.02 * h, v + 0.5 * h], [u - d * sp * h, v + 0.04 * h], 0.075 * h, 0.05 * h), hi, 0, 0.012);
    R.add(K([u + d * 0.02 * h, v + 0.5 * h], [u + d * (sp + 0.1) * h, v + 0.04 * h], 0.075 * h, 0.05 * h), hi + 0.003, 0, 0.012);
    R.add(E([u + d * (sp + 0.14) * h, v + 0.02 * h], 0.075 * h, 0.03 * h), hi, 0, 0.008);
  }
  R.add(E([u, v + 0.45 * h], 0.13 * h, 0.1 * h), hi - 0.002, 0, 0.012);                                                                 // the wrap at the hips
  if (pose === 'worship') {
    R.add(K([u, v + 0.74 * h], [u + d * 0.17 * h, v + 0.64 * h], 0.045 * h, 0.04 * h), hi + 0.005, 0, 0.008);
    R.add(C([u + d * 0.2 * h, v + 0.7 * h], 0.045 * h), hi + 0.008, 0, 0.008);
  } else if (pose === 'bearer') {
    R.add(K([u, v + 0.74 * h], [u + d * 0.14 * h, v + 0.98 * h], 0.045 * h, 0.035 * h), hi + 0.005, 0, 0.008);
    R.add(E([u + d * 0.2 * h, v + 1.14 * h], 0.08 * h, 0.15 * h, d * -0.4), hi + 0.004, 0, 0.012);                                      // the fly-whisk
    R.add(K([u, v + 0.74 * h], [u - d * 0.08 * h, v + 0.52 * h], 0.045 * h, 0.04 * h), hi + 0.005, 0, 0.008);
  } else {
    R.add(K([u, v + 0.74 * h], [u + d * 0.1 * h, v + 0.52 * h], 0.045 * h, 0.04 * h), hi + 0.005, 0, 0.008);
  }
  R.cut(C([u + d * 0.05 * h, v + 0.91 * h], 0.012 * h), 0.008, 0.005, 0);                                                                 // the eye
}

/** An elephant of body length 0.9 h at (u, v) (its feet), facing d, with a mahout when `rider`. */
export function elephant(R, u, v, h, d, rider = true, hi = 0.055) {
  R.add(E([u, v + 0.55 * h], 0.45 * h, 0.27 * h), hi, 0, 0.02);
  R.add(E([u + d * 0.42 * h, v + 0.66 * h], 0.2 * h, 0.24 * h), hi + 0.004, 0, 0.02);                                                    // the head
  R.add(E([u + d * 0.3 * h, v + 0.66 * h], 0.1 * h, 0.16 * h, d * 0.2), hi + 0.01, 0, 0.012);                                            // the ear
  R.add(K([u + d * 0.55 * h, v + 0.62 * h], [u + d * 0.66 * h, v + 0.3 * h], 0.075 * h, 0.05 * h), hi + 0.004, 0, 0.012);                // the trunk
  R.add(K([u + d * 0.66 * h, v + 0.3 * h], [u + d * 0.62 * h, v + 0.05 * h], 0.05 * h, 0.035 * h), hi + 0.004, 0, 0.012);
  R.add(K([u + d * 0.62 * h, v + 0.05 * h], [u + d * 0.76 * h, v + 0.1 * h], 0.035 * h, 0.03 * h), hi + 0.004, 0, 0.01);
  for (const [x, k] of [[-0.32, 0], [-0.17, 1], [0.2, 0], [0.34, 1]]) R.add(K([u + d * x * h, v + 0.4 * h], [u + d * (x + 0.01) * h, v + 0.02 * h], 0.075 * h, 0.065 * h), hi - 0.003 * k, 0, 0.014);
  R.add(K([u - d * 0.45 * h, v + 0.6 * h], [u - d * 0.5 * h, v + 0.22 * h], 0.02 * h, 0.012 * h), hi, 0, 0.006);                          // the tail
  R.cut(E([u + d * 0.36 * h, v + 0.46 * h], 0.2 * h, 0.012 * h, 0.5 * d), 0.01, 0.006, 0);                                                // the trappings' band
  if (rider) person(R, u + d * 0.12 * h, v + 0.7 * h, 0.5 * h, d, 'seat', hi + 0.008);
}
export function horse(R, u, v, h, d, hi = 0.05) {
  R.add(E([u, v + 0.5 * h], 0.32 * h, 0.17 * h), hi, 0, 0.014);
  R.add(K([u + d * 0.25 * h, v + 0.55 * h], [u + d * 0.4 * h, v + 0.8 * h], 0.1 * h, 0.07 * h), hi + 0.002, 0, 0.012);
  R.add(E([u + d * 0.46 * h, v + 0.8 * h], 0.1 * h, 0.06 * h, d * -0.4), hi + 0.004, 0, 0.01);
  for (const [x, k] of [[-0.24, 0], [-0.14, 1], [0.14, 0], [0.24, 1]]) R.add(K([u + d * x * h, v + 0.38 * h], [u + d * (x + 0.01) * h, v + 0.02 * h], 0.05 * h, 0.03 * h), hi - 0.003 * k, 0, 0.01);
  R.add(K([u - d * 0.3 * h, v + 0.55 * h], [u - d * 0.4 * h, v + 0.2 * h], 0.025 * h, 0.012 * h), hi, 0, 0.006);
  person(R, u, v + 0.58 * h, 0.5 * h, d, 'seat', hi + 0.006);
}
/** A two-wheeled chariot drawn by a pair of horses, facing d. */
export function chariot(R, u, v, h, d, hi = 0.05) {
  R.add(C([u - d * 0.1 * h, v + 0.22 * h], 0.22 * h), hi, 0, 0.012); R.cut(C([u - d * 0.1 * h, v + 0.22 * h], 0.17 * h), 0.02, 0.01, 0);
  R.add(C([u - d * 0.1 * h, v + 0.22 * h], 0.045 * h), hi + 0.01, 0, 0.01);
  for (let i = 0; i < 6; i++) { const a = i * Math.PI / 6; R.add(K([u - d * 0.1 * h - Math.cos(a) * 0.17 * h, v + 0.22 * h - Math.sin(a) * 0.17 * h], [u - d * 0.1 * h + Math.cos(a) * 0.17 * h, v + 0.22 * h + Math.sin(a) * 0.17 * h], 0.012 * h), hi + 0.003, 0, 0.004); }
  R.add(B([u - d * 0.12 * h, v + 0.5 * h], 0.2 * h, 0.1 * h, 0.02), hi + 0.006, 0, 0.012);
  R.add(K([u + d * 0.05 * h, v + 0.38 * h], [u + d * 0.55 * h, v + 0.46 * h], 0.018 * h), hi + 0.004, 0, 0.006);
  person(R, u - d * 0.12 * h, v + 0.55 * h, 0.52 * h, d, 'stand', hi + 0.012);
  horse(R, u + d * 0.6 * h, v + 0.02 * h, 0.62 * h, d, hi + 0.004);
}
/** A tree (the mango or the Bodhi tree): trunk, a crown of leaf masses, and when `shrine` a railing and a throne under it. */
export function tree(R, u, v, h, shrine = true, hi = 0.04) {
  R.add(K([u, v + 0.15 * h], [u + 0.02 * h, v + 0.55 * h], 0.05 * h, 0.035 * h), hi, 0, 0.012);
  const n = 9;
  for (let i = 0; i < n; i++) {
    const a = i / n * Math.PI * 2 + 0.4, r = 0.22 * h * (0.8 + 0.3 * hv(u, i, 1)), cu = u + Math.cos(a) * 0.26 * h, cv = v + 0.78 * h + Math.sin(a) * 0.16 * h;
    R.add(C([cu, cv], r * 0.62), hi + 0.004 + 0.002 * (i % 3), 0, 0.016);
  }
  R.add(C([u, v + 0.76 * h], 0.2 * h), hi + 0.006, 0, 0.02);
  for (let i = 0; i < 7; i++) R.cut(C([u + (i - 3) * 0.07 * h, v + 0.74 * h + 0.05 * h * Math.sin(i * 2.1)], 0.018 * h), 0.006, 0.006, 0);
  if (shrine) {
    R.add(B([u, v + 0.07 * h], 0.3 * h, 0.07 * h, 0.012), hi + 0.01, 0, 0.012);                                                         // the throne
    R.add(B([u, v + 0.17 * h], 0.2 * h, 0.03 * h, 0.01), hi + 0.014, 0, 0.01);
    for (let i = 0; i < 5; i++) R.add(B([u - 0.26 * h + i * 0.13 * h, v + 0.33 * h], 0.022 * h, 0.12 * h, 0.01), hi - 0.006, 0, 0.008);  // the railing round it
    R.add(B([u, v + 0.45 * h], 0.3 * h, 0.014 * h, 0.006), hi - 0.003, 0, 0.006);
  }
}
/** A stupa with its railing, harmika and parasols. */
export function stupa(R, u, v, h, hi = 0.045) {
  R.add(B([u, v + 0.07 * h], 0.4 * h, 0.07 * h, 0.01), hi + 0.01, 0, 0.012);
  R.add(B([u, v + 0.18 * h], 0.35 * h, 0.04 * h, 0.01), hi + 0.014, 0, 0.01);
  R.add(E([u, v + 0.22 * h], 0.3 * h, 0.3 * h), hi, 0, 0.03);
  R.add(B([u, v + 0.56 * h], 0.1 * h, 0.04 * h, 0.008), hi + 0.01, 0, 0.01);
  R.add(K([u, v + 0.58 * h], [u, v + 0.95 * h], 0.012 * h), hi + 0.008, 0, 0.005);
  for (const [dv, r] of [[0.7, 0.16], [0.8, 0.12], [0.89, 0.08]]) R.add(E([u, v + dv * h], r * h, 0.018 * h), hi + 0.012, 0, 0.008);
  for (let i = 0; i < 7; i++) R.add(B([u - 0.33 * h + i * 0.11 * h, v + 0.3 * h], 0.016 * h, 0.1 * h, 0.006), hi + 0.018, 0, 0.006);       // the railing
  R.add(B([u, v + 0.37 * h], 0.37 * h, 0.014 * h, 0.006), hi + 0.02, 0, 0.006);
  R.cut(E([u, v + 0.2 * h], 0.16 * h, 0.1 * h), 0.012, 0.012, 0);                                                                        // the garland round the dome
  for (const k of [-1, 1]) { R.add(K([u + k * 0.42 * h, v], [u + k * 0.42 * h, v + 0.9 * h], 0.012 * h), hi + 0.01, 0, 0.005); R.add(E([u + k * 0.42 * h, v + 0.9 * h], 0.05 * h, 0.1 * h), hi + 0.008, 0, 0.008); }   // banners
}
/** A house of `fl` storeys at (u, v), width w, with arched windows and a balcony on each upper floor, people looking out. */
export function house(R, u, v, w, fl, hi = 0.025, seed = 0) {
  const sh = 0.19;
  const top = v + fl * sh + 0.03;
  R.add(B([u, (v + top) / 2], w / 2, (top - v) / 2, 0.006), hi, 0, 0.006);
  R.add(B([u, top + 0.012], w / 2 + 0.02, 0.014, 0.005), hi + 0.01, 0, 0.006);                                                           // the cornice
  for (let f = 0; f < fl; f++) {
    const y0 = v + 0.03 + f * sh, n = Math.max(1, Math.round(w / 0.17));
    for (let i = 0; i < n; i++) {
      const cu = u - w / 2 + (i + 0.5) * w / n, ww = Math.min(0.06, w / n * 0.32);
      R.cut(B([cu, y0 + 0.08], ww, 0.065, 0.01), hi, 0.006, 0);
      R.cut(C([cu, y0 + 0.145], ww), hi, 0.006, 0);                                                                                       // the arch
      if (f > 0 || hv(cu, y0, seed) > 0.5) { R.add(C([cu, y0 + 0.1], 0.024), hi - 0.002 + 0.012, 0, 0.01); R.add(E([cu, y0 + 0.06], 0.03, 0.02), hi + 0.012, 0, 0.01); }   // a face at the window
    }
    if (f > 0) { R.add(B([u, y0 + 0.01], w / 2 + 0.03, 0.012, 0.004), hi + 0.025, 0, 0.006); for (let i = 0; i <= n * 3; i++) R.add(B([u - w / 2 - 0.02 + i * (w + 0.04) / (n * 3), y0 + 0.045], 0.007, 0.032, 0.003), hi + 0.028, 0, 0.004); }   // the balcony and its rail
  }
}
/** The wheel on its pillar (a panel's subject): a rim, sixteen spokes, a hub, a shaft on a base. */
export function wheel(R, u, v, h, hi = 0.045) {
  const cy = v + 0.7 * h, r = 0.26 * h;
  R.add(B([u, v + 0.04 * h], 0.2 * h, 0.04 * h, 0.008), hi + 0.01, 0, 0.01);
  R.add(K([u, v + 0.08 * h], [u, cy - r], 0.04 * h, 0.03 * h), hi + 0.004, 0, 0.012);
  R.add(B([u, cy - r + 0.01 * h], 0.1 * h, 0.03 * h, 0.006), hi + 0.012, 0, 0.008);
  R.add(C([u, cy], r), hi, 0, 0.018); R.cut(C([u, cy], r * 0.78), hi, 0.012, 0);
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 8; R.add(K([u - Math.cos(a) * r * 0.8, cy - Math.sin(a) * r * 0.8], [u + Math.cos(a) * r * 0.8, cy + Math.sin(a) * r * 0.8], 0.016 * h), hi + 0.004, 0, 0.006); }
  R.add(C([u, cy], 0.06 * h), hi + 0.012, 0, 0.01);
  for (const k of [-1, 1]) { R.add(E([u + k * 0.34 * h, cy - 0.1 * h], 0.05 * h, 0.14 * h), hi + 0.006, 0, 0.01); }
}
/** A gate-tower of the city: two storeys under a barrel roof, a gate arch below. */
export function gate(R, u, v, w, hi = 0.028) {
  R.add(B([u, v + 0.14], w / 2, 0.14, 0.008), hi, 0, 0.008);
  R.cut(B([u, v + 0.08], 0.07, 0.08, 0.02), hi, 0.008, 0); R.cut(C([u, v + 0.16], 0.07), hi, 0.008, 0);
  R.add(E([u, v + 0.33], w / 2 + 0.02, 0.06), hi + 0.01, 0, 0.012);
  for (let i = 0; i < 5; i++) R.cut(B([u - w / 2 + 0.06 + i * (w - 0.12) / 4, v + 0.26], 0.012, 0.03, 0.006), hi, 0.004, 0);
}

// ---------------------------------------------------------------- tableaux (each spans w metres from its left edge u)

const T = {
  /** worship of the Bodhi tree: the tree on its throne between kneeling and standing worshippers, a flying garland-bearer above. */
  worshipTree(R, u, w, v, h, seed) {
    const c = u + w / 2;
    tree(R, c, v, h * 1.0);
    for (const k of [-1, 1]) {
      person(R, c + k * w * 0.3, v, h * 0.85, -k, 'worship', 0.05, seed);
      person(R, c + k * w * 0.43, v, h * 0.8, -k, 'stand', 0.045, seed + 1);
      person(R, c + k * w * 0.2, v + h * 0.78, h * 0.28, -k, 'seat', 0.05, seed + 2);
    }
  },
  worshipStupa(R, u, w, v, h, seed) {
    const c = u + w / 2;
    stupa(R, c, v, h * 1.0);
    for (const k of [-1, 1]) {
      person(R, c + k * w * 0.3, v, h * 0.85, -k, 'worship', 0.05, seed);
      person(R, c + k * w * 0.44, v, h * 0.82, -k, 'bearer', 0.045, seed + 1);
    }
  },
  /** the procession: an elephant with its mahout, behind it a chariot drawn by horses, footmen. */
  elephants(R, u, w, v, h, seed) {
    const d = hv(u, seed, 3) > 0.5 ? 1 : -1;
    elephant(R, u + w * 0.3, v, h * 1.08, d, true);
    elephant(R, u + w * 0.78, v, h * 1.0, d, true);
    person(R, u + w * 0.52 - d * 0.0, v, h * 0.62, d, 'bearer', 0.045, seed);
  },
  chariots(R, u, w, v, h, seed) {
    const d = hv(u, seed, 4) > 0.5 ? 1 : -1;
    chariot(R, u + w * (d > 0 ? 0.25 : 0.7), v, h * 1.0, d);
    horse(R, u + w * (d > 0 ? 0.82 : 0.15), v, h * 0.9, d);
    person(R, u + w * 0.5, v, h * 0.62, d, 'stand', 0.045, seed + 1);
  },
  city(R, u, w, v, h, seed) {
    const n = Math.max(2, Math.round(w / 0.7));
    for (let i = 0; i < n; i++) {
      const cu = u + (i + 0.5) * w / n, ww = w / n * 0.86;
      if (i === n >> 1 && n % 2 === 1) gate(R, cu, v, ww);
      else house(R, cu, v, ww, 1 + ((i + seed) % 2), 0.025, seed + i);
    }
  },
  figures(R, u, w, v, h, seed) {
    const n = Math.max(2, Math.round(w / 0.28));
    for (let i = 0; i < n; i++) person(R, u + (i + 0.5) * w / n, v, h * (0.8 + 0.12 * hv(i, seed, 7)), i % 2 ? -1 : 1, ['bearer', 'worship', 'stand'][(i + seed) % 3], 0.045, seed + i);
  },
};
export const TABLEAUX = T;
export const WIDTH = { worshipTree: 1.7, worshipStupa: 1.7, elephants: 2.2, chariots: 2.2, city: 2.1, figures: 1.0 };

/** The programme of a beam's face: lists of tableaux (b = 0 lowest …2, front = the outward face). */
export function programme(b, front) {
  if (b === 2) return front ? ['worshipTree', 'worshipStupa', 'worshipTree', 'worshipStupa'] : ['elephants', 'chariots', 'elephants', 'figures'];
  if (b === 1) return front ? ['elephants', 'chariots', 'elephants', 'chariots'] : ['worshipStupa', 'worshipTree', 'worshipStupa', 'worshipTree'];
  return front ? ['city', 'figures', 'city', 'figures', 'city'] : ['figures', 'city', 'chariots', 'city'];
}

/** Lay a face's programme into a relief R over u0…u1, the figures standing on v. */
export function compose(R, u0, u1, v, fh, b, front) {
  const list = programme(b, front), tot = list.reduce((a, k) => a + WIDTH[k], 0), sc = (u1 - u0) / tot;
  let u = u0;
  list.forEach((k, i) => { const w = WIDTH[k] * sc; T[k](R, u + 0.02, w - 0.04, v, fh * 0.78, b * 7 + (front ? 0 : 3) + i); u += w; });
}
