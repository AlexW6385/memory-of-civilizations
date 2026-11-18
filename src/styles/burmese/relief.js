// The stone reliefs of the corridors and the glazed plaques of the base as modelled surfaces (docs/settlements/bagan.md §14): a height field rising 2–8 cm from the slab,
// built of rounded mounds (heads, bodies, limbs, a horse, an elephant, a wheel, trees), so that the carving shades as a continuous surface. A handful of scenes of the
// Buddha's life are cut in rotation; the plaques of the Jatakas are small tiles in a raised frame with an animal or a figure.
import { heightField, mound as M, ringMound as RG, streak as ST, hash3 } from './sculpt.js';

/** A seated Buddha at (x, y) of height s (the lap, the body, the head with its ushnisha, the halo): the building block of most scenes. */
const seated = (x, y, cx, cy, s, h = 0.07, arms = 0) => Math.max(
  M(x, y, cx, cy + 0.05 * s, 0.27 * s, 0.07 * s, h * 0.8),                          // the crossed legs
  M(x, y, cx, cy + 0.2 * s, 0.14 * s, 0.17 * s, h),                                 // the body
  M(x, y, cx - 0.17 * s, cy + 0.17 * s, 0.05 * s, 0.14 * s, h * 0.85, 0.55, 0.5), M(x, y, cx + 0.17 * s, cy + 0.17 * s, 0.05 * s, 0.14 * s, h * 0.85, 0.55, -0.5),   // the arms
  M(x, y, cx, cy + 0.42 * s, 0.065 * s, 0.075 * s, h * 1.05),                         // the head
  M(x, y, cx, cy + 0.5 * s, 0.03 * s, 0.03 * s, h * 1.1),                             // the ushnisha
  RG(x, y, cx, cy + 0.44 * s, 0.14 * s, 0.014 * s, h * 0.4),                          // the halo
  arms === 1 ? M(x, y, cx + 0.2 * s, cy + 0.04 * s, 0.1 * s, 0.025 * s, h * 0.8, 0.55, -0.4) : 0,   // the hand touching the earth
  arms === 2 ? Math.max(M(x, y, cx - 0.06 * s, cy + 0.28 * s, 0.035 * s, 0.03 * s, h * 1.1), M(x, y, cx + 0.06 * s, cy + 0.27 * s, 0.035 * s, 0.03 * s, h * 1.1)) : 0,
);
/** A standing figure of height s at (cx, cy) (feet), arms by `up`: -1 down, +1 one raised. */
const standing = (x, y, cx, cy, s, h = 0.06, up = 0, facing = 0) => Math.max(
  M(x, y, cx, cy + 0.32 * s, 0.1 * s, 0.32 * s, h),                                 // the robe, long
  M(x, y, cx, cy + 0.04 * s, 0.13 * s, 0.045 * s, h * 0.6),                         // the hem's flare
  M(x, y, cx + facing * 0.01, cy + 0.75 * s, 0.055 * s, 0.07 * s, h * 1.1),         // the head
  M(x, y, cx, cy + 0.84 * s, 0.025 * s, 0.025 * s, h * 1.1),
  M(x, y, cx - 0.11 * s, cy + 0.5 * s, 0.035 * s, 0.17 * s, h * 0.9, 0.5, up < 0 ? 0 : 0.12), up > 0 ? M(x, y, cx + 0.15 * s, cy + 0.68 * s, 0.035 * s, 0.1 * s, h * 0.9, 0.5, -0.4) : M(x, y, cx + 0.11 * s, cy + 0.5 * s, 0.035 * s, 0.17 * s, h * 0.9, 0.5, -0.1),
);
const lotusSeat = (x, y, cx, cy, w, h = 0.04) => Math.max(M(x, y, cx, cy, w, 0.05, h, 0.5), M(x, y, cx, cy - 0.04, w * 0.8, 0.03, h * 0.7, 0.5));
const tree = (x, y, cx, cy, s, h = 0.05) => Math.max(ST(x, y, cx, cy, cx + 0.01, cy + 0.5 * s, 0.025 * s, h), M(x, y, cx, cy + 0.62 * s, 0.17 * s, 0.14 * s, h * 0.7, 0.4), M(x, y, cx - 0.13 * s, cy + 0.5 * s, 0.09 * s, 0.07 * s, h * 0.6), M(x, y, cx + 0.13 * s, cy + 0.52 * s, 0.09 * s, 0.07 * s, h * 0.6));
const horse = (x, y, cx, cy, s, h = 0.06) => Math.max(
  M(x, y, cx, cy + 0.34 * s, 0.26 * s, 0.1 * s, h, 0.55),                           // the body
  M(x, y, cx + 0.22 * s, cy + 0.5 * s, 0.07 * s, 0.17 * s, h * 0.9, 0.55, -0.6),    // the neck
  M(x, y, cx + 0.33 * s, cy + 0.66 * s, 0.075 * s, 0.045 * s, h, 0.55, -0.3),       // the head
  M(x, y, cx - 0.26 * s, cy + 0.38 * s, 0.03 * s, 0.14 * s, h * 0.7, 0.5, 0.5),     // the tail
  ...[-0.19, -0.1, 0.12, 0.2].map((d) => ST(x, y, cx + d * s, cy + 0.3 * s, cx + (d + (d > 0 ? 0.03 : -0.02)) * s, cy + 0.02 * s, 0.028 * s, h * 0.8)),   // the legs
);
const elephant = (x, y, cx, cy, s, h = 0.065) => Math.max(
  M(x, y, cx, cy + 0.32 * s, 0.3 * s, 0.2 * s, h, 0.5),                             // the great body
  M(x, y, cx + 0.3 * s, cy + 0.4 * s, 0.14 * s, 0.14 * s, h * 1.05, 0.5),           // the head
  ST(x, y, cx + 0.4 * s, cy + 0.36 * s, cx + 0.46 * s, cy + 0.04 * s, 0.035 * s, h * 0.85),   // the trunk
  M(x, y, cx + 0.36 * s, cy + 0.5 * s, 0.05 * s, 0.07 * s, h * 0.8, 0.5, 0.5),      // the ear
  ...[-0.2, -0.08, 0.1, 0.22].map((d) => M(x, y, cx + d * s, cy + 0.1 * s, 0.05 * s, 0.1 * s, h * 0.9)),   // the legs (the beast kneeling)
);
const deer = (x, y, cx, cy, s, h = 0.04) => Math.max(M(x, y, cx, cy + 0.12 * s, 0.14 * s, 0.07 * s, h), M(x, y, cx + 0.12 * s, cy + 0.22 * s, 0.035 * s, 0.09 * s, h, 0.5, -0.3), M(x, y, cx + 0.16 * s, cy + 0.3 * s, 0.04 * s, 0.03 * s, h), ST(x, y, cx + 0.16 * s, cy + 0.32 * s, cx + 0.2 * s, cy + 0.42 * s, 0.01 * s, h * 0.7), ST(x, y, cx - 0.08 * s, cy + 0.08 * s, cx - 0.08 * s, cy, 0.018 * s, h * 0.7), ST(x, y, cx + 0.08 * s, cy + 0.08 * s, cx + 0.08 * s, cy, 0.018 * s, h * 0.7));
const kneel = (x, y, cx, cy, s, h = 0.045) => Math.max(M(x, y, cx, cy + 0.09 * s, 0.12 * s, 0.09 * s, h), M(x, y, cx, cy + 0.24 * s, 0.07 * s, 0.14 * s, h * 1.05), M(x, y, cx, cy + 0.42 * s, 0.05 * s, 0.06 * s, h * 1.1), M(x, y, cx + 0.07 * s, cy + 0.36 * s, 0.03 * s, 0.08 * s, h, 0.5, -0.5));

/** The scenes: functions (x, y) → height in a panel of 0.74 × 1.07 m (x from −0.37 to 0.37, y from 0 to 1.07 above the slab's foot). */
export const SCENES = [
  // the Mara's defeat: the Buddha touching the earth under the bodhi, the earth goddess wringing her hair, the demons' weapons
  (x, y) => Math.max(lotusSeat(x, y, 0, 0.1, 0.3), seated(x, y, 0, 0.12, 1.55, 0.07, 1), tree(x, y, -0.18, 0.78, 0.5, 0.03), tree(x, y, 0.2, 0.8, 0.45, 0.03), standing(x, y, 0.26, 0.1, 0.4, 0.045), kneel(x, y, -0.27, 0.1, 0.4, 0.04)),
  // the first sermon at Sarnath: the wheel between two deer, the Buddha teaching, the five ascetics kneeling
  (x, y) => Math.max(lotusSeat(x, y, 0, 0.35, 0.3), seated(x, y, 0, 0.37, 1.5, 0.07, 2), RG(x, y, 0, 0.17, 0.09, 0.016, 0.045), M(x, y, 0, 0.17, 0.02, 0.02, 0.05), deer(x, y, -0.24, 0.07, 0.75), deer(x, y, 0.2, 0.07, -0.75 + 1.5), kneel(x, y, -0.28, 0.32, 0.5), kneel(x, y, 0.28, 0.32, 0.5)),
  // the parinirvana: the Buddha lying on his right side between the sala trees, the mourners below
  (x, y) => Math.max(M(x, y, 0, 0.42, 0.33, 0.065, 0.045, 0.5), M(x, y, 0.02, 0.5, 0.27, 0.075, 0.07, 0.5), M(x, y, -0.25, 0.54, 0.065, 0.075, 0.075), M(x, y, -0.25, 0.54, 0.09, 0.09, 0.03), M(x, y, 0.1, 0.46, 0.2, 0.025, 0.065, 0.5, -0.1), tree(x, y, -0.27, 0.6, 0.5, 0.04), tree(x, y, 0.27, 0.6, 0.5, 0.04), kneel(x, y, -0.2, 0.08, 0.38), kneel(x, y, -0.02, 0.08, 0.38), kneel(x, y, 0.2, 0.08, 0.38), RG(x, y, 0, 0.82, 0.1, 0.012, 0.03)),
  // the birth: Queen Maya standing, one arm up holding the sala branch, the child at her side, a lady attending
  (x, y) => Math.max(standing(x, y, -0.04, 0.08, 1.1, 0.065, 1), tree(x, y, 0.05, 0.62, 0.45, 0.03), standing(x, y, 0.22, 0.08, 0.5, 0.045), M(x, y, -0.25, 0.28, 0.04, 0.1, 0.05), M(x, y, -0.25, 0.42, 0.035, 0.035, 0.055), RG(x, y, -0.25, 0.42, 0.07, 0.01, 0.025), lotusSeat(x, y, -0.25, 0.08, 0.1, 0.03)),
  // the great departure: the prince on Kanthaka under the parasol, Channa behind, the gods lifting the hooves
  (x, y) => Math.max(horse(x, y, -0.02, 0.1, 1.15), M(x, y, -0.02, 0.58, 0.05, 0.1, 0.075), M(x, y, -0.02, 0.7, 0.04, 0.04, 0.08), RG(x, y, -0.02, 0.95, 0.09, 0.012, 0.045), ST(x, y, -0.02, 0.7, -0.02, 0.95, 0.007, 0.05), standing(x, y, -0.27, 0.06, 0.55, 0.05), kneel(x, y, 0.28, 0.05, 0.3), kneel(x, y, 0.28, 0.3, 0.2)),
  // the taming of the elephant Nalagiri: the beast kneeling before the Buddha, who raises a hand
  (x, y) => Math.max(elephant(x, y, -0.07, 0.07, 0.8), standing(x, y, 0.2, 0.08, 1.15, 0.065, 1, -1), kneel(x, y, -0.28, 0.07, 0.35), M(x, y, -0.07, 0.55, 0.05, 0.1, 0.05), tree(x, y, 0.27, 0.75, 0.35, 0.025)),
  // the descent from the Tavatimsa heaven: the Buddha on the middle of a ladder, Brahma and Indra at his sides, the halo
  (x, y) => Math.max(standing(x, y, 0, 0.18, 1.0, 0.07), RG(x, y, 0, 0.84, 0.12, 0.014, 0.035), ST(x, y, -0.24, 0.1, -0.1, 0.9, 0.018, 0.035), ST(x, y, 0.24, 0.1, 0.1, 0.9, 0.018, 0.035), ...[0.2, 0.34, 0.48, 0.62, 0.76].map((r) => ST(x, y, -0.24 + (r - 0.1) * 0.17, r, 0.24 - (r - 0.1) * 0.17, r, 0.012, 0.025)), standing(x, y, -0.3, 0.55, 0.38, 0.04), standing(x, y, 0.3, 0.55, 0.38, 0.04), M(x, y, 0, 0.03, 0.3, 0.03, 0.03)),
];
export const SCENE_NAMES = ['Mara defeated', 'First sermon', 'Parinirvana', 'Birth', 'Great departure', 'Nalagiri tamed', 'Descent from Tavatimsa'];

/**
 * One panel's relief into the Sculpt S whose frame is the panel's own (x across, y up from the slab's foot, z out of the slab): a surface 4 cm proud of the slab (covering the first
 * form's plates, which are 3.5 cm) on which the scene rises up to 4 cm more, the figures a lighter stone (S2). k picks the scene.
 */
export function reliefScene(S, k, S2 = S) {
  const fn = SCENES[((Math.round(k) % SCENES.length) + SCENES.length) % SCENES.length], X0 = -0.36, X1 = 0.36, Y0 = 0.03, Y1 = 1.05, BASE = 0.04;
  S.box(X0, Y0, 0.0, X1, Y1, BASE);                                                          // the ground of the panel, a plain flat face
  heightField(S2, X0, X1, Y0, Y1, 0.035, (x, y) => {
    const e = Math.min(1, (X1 - Math.abs(x)) / 0.05, (Y1 - y) / 0.05, (y - Y0) / 0.05);   // the figures fade to the ground near the edge
    return Math.max(0, fn(x, y)) * Math.max(0, e);
  }, BASE + 0.0004);
}

/** A glazed plaque of the Jataka, 0.46 × 0.40: a tile with a raised frame and a creature or a figure; k picks it, (a, b) the hash of its place. */
export function plaque(S, k, a, b) {
  const f = (x, y) => {
    const fr = Math.max(Math.abs(x) > 0.2 ? 0.014 : 0, Math.abs(y - 0.2) > 0.17 ? 0.014 : 0);
    const cx = 0.012 * (hash3(a, b, 3) - 0.5), s = 0.8 + 0.1 * hash3(a, b, 5);
    let g = 0;
    switch (k % 6) {
      case 0: g = deer(x, y, -0.1 + cx, 0.08, 1.2 * s, 0.03); break;                                                  // the deer
      case 1: g = elephant(x, y, cx, 0.1, 0.5 * s, 0.035); break;                                                     // the elephant
      case 2: g = kneel(x, y, cx, 0.08, 0.7 * s, 0.03); g = Math.max(g, tree(x, y, 0.14, 0.08, 0.5 * s, 0.02)); break;  // the ascetic under a tree
      case 3: g = horse(x, y, cx, 0.08, 0.6 * s, 0.035); break;                                                        // the horse
      case 4: g = seated(x, y, cx, 0.1, 0.6 * s, 0.035, 2); break;                                                    // the sage seated
      default: g = Math.max(tree(x, y, cx, 0.06, 0.7 * s, 0.03), M(x, y, -0.1 + cx, 0.1, 0.07, 0.06, 0.03)); break;     // a bird, a tree
    }
    return Math.max(0.012, fr, g + 0.012);
  };
  heightField(S, -0.23, 0.23, 0.0, 0.4, 0.04, (x, y) => (Math.abs(x) < 0.225 && y > 0.002 && y < 0.398 ? f(x, y) : 0));
}
