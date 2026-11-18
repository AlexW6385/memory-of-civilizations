// The criosphinx of the avenue, modelled (docs/settlements/thebes.md §14): Amun's ram on a lion's crouching body. `nk_ram_a` is the whole animal in
// rounded volumes (the plinth, the body with its shoulder, haunch and folded hind leg, the forelegs with elbow, wrist and paw, the ram's skull with its
// arched nose, the curled ridged horn, the ear, the collar, the little king under the chin); `nk_ram_b` adds what is seen only within a few metres (the
// eye with its lids, the nostrils and the mouth, the toes and claws, the beads of the collar, the king's face and kilt pleats, the signs on the plinth).
// Local frame: the head toward +z, the plinth centred on the origin. Each ram differs a little from the next by a hash of its own place.
import { box } from '../../core/geom.js';
import { Parts, tube, rowsZ, rowsY, ell, hash } from './sculpt.js';
import { glyphs, keep } from './kit.js';
import { fromTriangles } from '../../core/geom.js';

const S = 'sandstone_dressed', BL = 'egyptian_blue', GD = 'gold', GR = 'granite_grey';
const B = 0.56;                                                   // the plinth's top

function plinth(P) {
  P.add(S, box(-0.95, 0, -2.1, 0.95, 0.16, 2.05));
  P.add(S, box(-0.85, 0.16, -2.0, 0.85, 0.5, 1.95));
  P.add(S, box(-0.9, 0.5, -2.05, 0.9, 0.56, 2.0));
}

/** The head (local to its own origin: the poll at z = 0, y = 0 the middle of the skull) in sections along z, the convex nose of Amun's ram. */
function head(P, f) {
  P.add(S, rowsZ([[-0.02, 0.17, -0.17, 0.15], [0.06, 0.235, -0.2, 0.185], [0.2, 0.245, -0.2, 0.2], [0.34, 0.2, -0.18, 0.165], [0.46, 0.15, -0.16, 0.125], [0.58, 0.085, -0.15, 0.1], [0.68, 0.0, -0.15, 0.092], [0.76, -0.04, -0.14, 0.078], [0.81, -0.06, -0.12, 0.055], [0.83, -0.07, -0.1, 0.025]], { n: 16 * f, seg: 2 }));
  P.add(S, rowsZ([[0.1, -0.12, -0.27, 0.095], [0.3, -0.13, -0.26, 0.085], [0.5, -0.14, -0.22, 0.072], [0.66, -0.14, -0.19, 0.06], [0.74, -0.13, -0.17, 0.045]], { n: 12 * f, seg: 2 }));   // the lower jaw
  for (const s of [-1, 1]) {
    P.add(S, ell([s * 0.15, 0.08, 0.25], [0.04, 0.05, 0.09], [0.2, s * 0.3, 0], 8 * f, 5));     // the brow over the eye
    P.add(S, ell([s * 0.12, -0.05, 0.38], [0.05, 0.1, 0.12], [0, 0, 0], 8 * f, 5));             // the cheek
    P.add(S, ell([s * 0.215, 0.085, 0.07], [0.04, 0.1, 0.05], [-0.4, 0, s * 0.45], 8 * f, 5));   // the ear
  }
}

/** The horn: from the side of the skull out and back, round in one turn and a half, down and forward, the tip up; rings along it. */
function horn(P, s, f, k) {
  const c = [[0.12, 0.17, 0.03, 0.085, 0.07], [0.24, 0.22, -0.09, 0.085, 0.07], [0.36, 0.13, -0.15, 0.075, 0.062], [0.4, -0.04, -0.09, 0.062, 0.052], [0.35, -0.14, 0.06, 0.05, 0.042], [0.26, -0.13, 0.17, 0.036, 0.03], [0.2, -0.05, 0.2, 0.02, 0.018], [0.18, 0.02, 0.17, 0.008, 0.008]].map(([x, y, z, a, b]) => [s * x, y, z, a * k, b * k]);
  P.add(S, tube(c, { seg: 4, n: 10 * f, p: 2.4, ridge: f > 1 ? (t) => 1 + 0.08 * Math.cos(t * 44) : null }));
}

/** The king under the chin: legs, kilt, torso, arms, the head in the nemes. cx = 0, base y = 0, facing +z; about 0.78 m. */
function king(P, f) {
  P.add(S, tube([[0.05, 0, 0.02, 0.04, 0.055], [0.05, 0.14, 0.01, 0.034, 0.04], [0.05, 0.28, 0.0, 0.04, 0.045]], { n: 8 * f }));
  P.add(S, tube([[-0.05, 0, 0.02, 0.04, 0.055], [-0.05, 0.14, 0.01, 0.034, 0.04], [-0.05, 0.28, 0.0, 0.04, 0.045]], { n: 8 * f }));
  P.add(S, rowsY([[0.26, 0.085, -0.075, 0.12], [0.4, 0.1, -0.07, 0.115], [0.5, 0.075, -0.065, 0.1]], { n: 12 * f }));        // the kilt
  P.add(S, rowsY([[0.5, 0.06, -0.05, 0.095], [0.6, 0.06, -0.05, 0.11], [0.68, 0.055, -0.05, 0.115], [0.72, 0.04, -0.04, 0.07]], { n: 12 * f }));   // the torso
  for (const s of [-1, 1]) P.add(S, tube([[s * 0.125, 0.68, 0, 0.032, 0.032], [s * 0.135, 0.58, 0.0, 0.026, 0.026], [s * 0.125, 0.5, 0.02, 0.022, 0.022]], { n: 8 * f }));
  P.add(S, rowsY([[0.72, 0.035, -0.035, 0.04], [0.76, 0.035, -0.035, 0.036]], { n: 8 * f }));                                           // the neck
  P.add(S, ell([0, 0.83, 0.01], [0.062, 0.078, 0.07], null, 10 * f, 6));                                                                // the head
  P.add(BL, ell([0, 0.845, -0.005], [0.07, 0.085, 0.078], null, 10 * f, 6));                                                            // the nemes
  for (const s of [-1, 1]) P.add(BL, rowsY([[0.8, 0.02, -0.02, 0.015, s * 0.07], [0.7, 0.025, -0.02, 0.02, s * 0.075]], { n: 6 * f }));   // the lappets
}

export function ramBody(P, f, k, x, z) {
  const b = B;
  plinth(P);
  // the body: chest, ribs, tucked belly, loin, the shoulder and the haunch laid on it
  P.add(S, rowsZ([[-1.75, b + 0.42, b + 0.05, 0.16], [-1.5, b + 0.72, b + 0.05, 0.3], [-1.1, b + 0.95, b + 0.04, 0.44], [-0.6, b + 1.0, b + 0.1, 0.46], [-0.1, b + 1.02, b + 0.13, 0.43], [0.35, b + 1.12, b + 0.1, 0.4], [0.62, b + 1.15, b + 0.2, 0.3]], { n: 14 * f, seg: 2, p: 2.6 }));
  for (const s of [-1, 1]) {
    P.add(S, ell([s * 0.38, b + 0.5, -1.0], [0.24, 0.42, 0.7], [0.1, 0, 0], 12 * f, 8));            // the haunch
    P.add(S, ell([s * 0.37, b + 0.75, -0.1], [0.2, 0.36, 0.5], [-0.2, 0, 0], 10 * f, 7));           // the shoulder
    P.add(S, tube([[s * 0.5, b + 0.3, -0.72, 0.15, 0.16], [s * 0.5, b + 0.18, -0.45, 0.1, 0.1], [s * 0.5, b + 0.08, -0.28, 0.1, 0.075], [s * 0.5, b + 0.07, 0.08, 0.1, 0.07]], { n: 8 * f, seg: 3 }));   // the hind leg folded: thigh, hock, foot
    P.add(S, ell([s * 0.5, b + 0.07, 0.15, 0], [0.1, 0.065, 0.2], null, 8 * f, 5));                    // its paw
    // the foreleg lying forward: the elbow at the chest, the forearm, the wrist, the paw
    P.add(S, tube([[s * 0.36, b + 0.5, 0.02, 0.19, 0.2], [s * 0.35, b + 0.26, 0.35, 0.16, 0.16], [s * 0.35, b + 0.17, 0.9, 0.13, 0.12], [s * 0.35, b + 0.12, 1.35, 0.115, 0.1], [s * 0.35, b + 0.09, 1.6, 0.125, 0.09]], { n: 10 * f, seg: 3 }));
    P.add(S, ell([s * 0.35, b + 0.085, 1.8], [0.14, 0.085, 0.24], null, 10 * f, 6));                     // the paw
  }
  P.add(S, tube([[0, b + 0.45, -1.7, 0.07, 0.07], [0.22, b + 0.3, -1.95, 0.06, 0.06], [0.6, b + 0.14, -1.7, 0.05, 0.05], [0.62, b + 0.08, -1.05, 0.045, 0.045], [0.6, b + 0.07, -0.85, 0.07, 0.04]], { n: 8 * f, seg: 3 }));   // the tail along the flank, its tuft
  // the neck and the broad collar (wesekh): rings of gold, blue, gold, blue lying on the chest
  P.add(S, rowsY([[b + 0.95, 0.85, 0.5, 0.28], [b + 1.25, 1.0, 0.58, 0.27], [b + 1.5, 1.08, 0.72, 0.23], [b + 1.72, 1.12, 0.8, 0.2]], { n: 14 * f, seg: 2 }));
  const col = (y, r, h, mat) => P.add(mat, rowsY([[y, 0.78 + r * 0.55, 0.78 - r * 0.8, r * 0.7], [y - h, 0.78 + (r + 0.04) * 0.55, 0.78 - (r + 0.04) * 0.8, (r + 0.04) * 0.7]], { n: 18 * f, seg: 1, caps: [false, false] }));
  col(b + 1.3, 0.3, 0.09, GD); col(b + 1.21, 0.34, 0.09, BL); col(b + 1.12, 0.38, 0.09, GD); col(b + 1.03, 0.42, 0.09, BL);
  // the head, set on the neck, grown a quarter beyond the lion's (the ram is the god's head)
  const hs = 1.5 * k, H = new Parts();
  head(H, f);
  for (const s of [-1, 1]) horn(H, s, f, 1);
  const place = (g, t) => { g.scale(hs, hs, hs); g.translate(0, b + 1.68, 0.8); return g; };
  for (const [m, l] of H.m) for (const g of l) P.add(m, place(g));
  // the sun disc and the uraeus
  const D = new Parts();
  D.add(GD, ell([0, 0.3, 0.2], [0.13, 0.13, 0.03], [Math.PI / 2 - 0.1, 0, 0], 16 * f, 4));
  D.add(GD, box(-0.06, 0.2, 0.1, 0.06, 0.27, 0.3));
  D.add(GD, ell([0, 0.2, 0.37], [0.03, 0.07, 0.03], null, 6, 4));
  for (const [m, l] of D.m) for (const g of l) P.add(m, place(g));
  // the little king, in front of the breast between the paws
  const Kg = new Parts(); king(Kg, f);
  for (const [m, l] of Kg.m) for (const g of l) { g.scale(1.9, 1.9, 1.9); g.translate(0, b + 0.04, 1.3); P.add(m, g); }
  return { hs, place };
}

/** nk_ram_a: { at, y, yaw } — the volumes, collision of the whole. */
export function ramA(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, yaw = el.yaw ?? 0, k = 0.985 + 0.03 * hash(x, z), P = new Parts();
  ramBody(P, 1, k, x, z);
  P.emit(bag, x, y, z, yaw);
  col.rect([x - 1.0, z - 2.1, x + 1.0, z + 2.1], y, y + 2.6);
}

/** nk_ram_b: the fine detail of the same ram, drawn within a few metres. */
export function ramB(el, { bag }) {
  const [x, z] = el.at, y = el.y ?? 0, yaw = el.yaw ?? 0, k = 0.985 + 0.03 * hash(x, z), P = new Parts(), hs = 1.5 * k, b = B;
  const place = (g) => { g.scale(hs, hs, hs); g.translate(0, b + 1.68, 0.8); return g; };
  for (const s of [-1, 1]) {
    // the eye: the lids' rim, the ball, the iris
    P.add(S, place(ell([s * 0.176, 0.05, 0.25], [0.012, 0.042, 0.062], [0.1, 0, 0], 10, 6)));
    P.add(GD, place(ell([s * 0.186, 0.05, 0.25], [0.01, 0.032, 0.05], [0.1, 0, 0], 10, 6)));
    P.add(GR, place(ell([s * 0.192, 0.05, 0.255], [0.006, 0.02, 0.026], null, 8, 5)));
    P.add(GR, place(ell([s * 0.036, -0.058, 0.78], [0.012, 0.016, 0.02], null, 6, 4)));             // the nostril
    P.add(BL, place(ell([s * 0.178, 0.095, 0.25], [0.008, 0.01, 0.07], [0.1, 0, 0], 6, 4)));        // the painted brow
  }
  P.add(GR, place(ell([0, -0.118, 0.5], [0.07, 0.006, 0.28], null, 8, 4)));                          // the mouth's line
  // the toes and claws of the forepaws and the hind feet
  for (const s of [-1, 1]) {
    for (let t = -1; t <= 1; t++) {
      P.add(S, ell([s * 0.35 + t * 0.085, b + 0.065, 1.95], [0.032, 0.035, 0.06], null, 6, 4));
      P.add(GR, ell([s * 0.35 + t * 0.085, b + 0.04, 2.0], [0.012, 0.012, 0.02], null, 5, 3));
      P.add(S, ell([s * 0.5 + t * 0.06, b + 0.05, 0.32], [0.025, 0.03, 0.045], null, 6, 4));
    }
  }
  // the beads of the collar's gold rows
  for (let i = 0; i < 26; i++) { const a = (i / 26 - 0.5) * 2.2; P.add(GD, ell([Math.sin(a) * 0.52, b + 0.98, 0.9 + Math.cos(a) * 0.12 + 0.02], [0.03, 0.045, 0.03], null, 6, 4)); }
  // the king's face and the pleats of his kilt
  const Kp = (g) => { g.scale(1.9, 1.9, 1.9); g.translate(0, b + 0.04, 1.3); return g; };
  P.add(S, Kp(ell([0, 0.83, 0.075], [0.008, 0.02, 0.016], null, 6, 4)));
  for (const s of [-1, 1]) P.add(GR, Kp(ell([s * 0.026, 0.85, 0.07], [0.012, 0.005, 0.005], null, 6, 3)));
  for (let i = -3; i <= 3; i++) P.add(BL, Kp(ell([i * 0.03, 0.38, 0.095], [0.004, 0.11, 0.004], null, 5, 3)));
  // the signs down both sides of the plinth
  const sides = [];
  for (const s of [-1, 1]) { const T = [], pl = (u, v, d) => [s * (0.85 + d), u, v]; glyphs(T, pl, 0.33, -1.8, 1.75, 0.1, s > 0 ? 41 : 43, 0.012); sides.push(...keep(T, [s, 0])); }
  P.add(BL, fromTriangles(sides));
  P.emit(bag, x, y, z, yaw);
}
