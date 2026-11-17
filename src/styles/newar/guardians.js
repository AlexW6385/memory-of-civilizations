// The stone guardians of the Nyatapola's five stages (docs/settlements/bhaktapur.md §1, §14 and §15): from the ground up the wrestlers
// Jaimal and Patta, elephants, lions, griffins (sardula) and the goddesses Simhini and Vyaghrini [stated: Wikipedia "Nyatapola Temple";
// nepalitimes], each pair carved from one stone [stated: oocities]. Built from ellipsoids and tapering limbs (a few thousand triangles each)
// in the figure's own frame (x the way it looks, y up, z across), then scaled, turned and set on its pedestal.

import { box, lathe } from '../../core/geom.js';
import { Matrix4, Vector3 } from '../../core/three.js';

const STONE = 'sandstone_dressed';
const SPH = (n) => Array.from({ length: n + 1 }, (_, k) => { const f = k / n * Math.PI; return [Math.max(0.001, Math.sin(f)), -Math.cos(f)]; });
const SPH_PROFILE = { 5: SPH(5), 6: SPH(6), 8: SPH(8) };

/** A figure under construction: parts are added in the figure's frame and placed by `to` (scale, facing, position). */
class Fig {
  constructor(bag, s, sx, x, y, z) { this.bag = bag; this.m = new Matrix4().makeRotationY(sx < 0 ? Math.PI : 0).premultiply(new Matrix4().makeScale(s, s, s)); this.m.setPosition(x, y, z); this.s = s; }
  put(mat, g) { g.applyMatrix4(this.m); this.bag.add(mat, g); }
  /** An ellipsoid at c with radii r, turned by e (Euler xyz, radians). */
  ell(mat, c, r, e = [0, 0, 0], seg = 8, rings = 6) {
    seg = Math.max(5, Math.round(seg * 0.75)); rings = Math.max(4, Math.round(rings * 0.75));
    const g = lathe(SPH_PROFILE[rings] ?? (SPH_PROFILE[rings] = SPH(rings)), seg);
    const q = new Matrix4().makeRotationZ(e[2]).multiply(new Matrix4().makeRotationY(e[1])).multiply(new Matrix4().makeRotationX(e[0])).multiply(new Matrix4().makeScale(r[0], r[1], r[2]));
    q.setPosition(c[0], c[1], c[2]); g.applyMatrix4(q); this.put(mat, g);
  }
  /** A tapering limb from a (radius r0) to b (radius r1). */
  tube(mat, a, b, r0, r1 = r0, seg = 7) {
    const A = new Vector3(...a), B = new Vector3(...b), L = A.distanceTo(B);
    const g = lathe([[r0, 0], [r1, L]], Math.max(5, seg - 2));
    const d = B.clone().sub(A).normalize(), up = new Vector3(0, 1, 0), ax = up.clone().cross(d);
    const m = new Matrix4();
    if (ax.lengthSq() < 1e-9) { if (d.y < 0) m.makeRotationX(Math.PI); } else m.makeRotationAxis(ax.normalize(), Math.acos(Math.max(-1, Math.min(1, up.dot(d)))));
    m.setPosition(A); g.applyMatrix4(m); this.put(mat, g);
  }
  /** A chain of limbs through the points, tapering from r0 to r1, with the joints rounded. */
  chain(mat, pts, r0, r1, seg = 7) {
    for (let i = 0; i < pts.length - 1; i++) {
      const ra = r0 + (r1 - r0) * i / (pts.length - 1), rb = r0 + (r1 - r0) * (i + 1) / (pts.length - 1);
      this.tube(mat, pts[i], pts[i + 1], ra, rb, seg);
      if (i > 0) this.ell(mat, pts[i], [ra, ra, ra], [0, 0, 0], 6, 5);
    }
  }
  /** A lathe about the y axis, turned to look along +x when `along`. */
  lat(mat, prof, c, seg = 10, along = false, mod = null) {
    const g = lathe(prof, seg, mod); if (along) g.rotateZ(-Math.PI / 2); g.translate(c[0], c[1], c[2]); this.put(mat, g);
  }
}

/** The head of a big cat, at c looking +x: a skull, a muzzle with a dark nose, eyes, ears, brows, and a mane (the lion) or striped cheeks (the tigress). */
function catHead(f, c, k, { mane = true, stripes = false, horn = false } = {}) {
  const [x, y, z] = c;
  f.ell(STONE, [x, y, z], [0.26 * k, 0.24 * k, 0.23 * k], [0, 0, 0], 10, 8);
  f.ell(STONE, [x + 0.2 * k, y - 0.06 * k, z], [0.17 * k, 0.12 * k, 0.15 * k], [0, 0, -0.1]);                    // the muzzle
  f.ell('iron', [x + 0.36 * k, y - 0.01 * k, z], [0.045 * k, 0.04 * k, 0.07 * k], [0, 0, 0], 6, 5);              // the nose
  f.ell(STONE, [x + 0.19 * k, y - 0.17 * k, z], [0.13 * k, 0.04 * k, 0.1 * k]);                                  // the lower jaw
  for (const v of [-1, 1]) {
    f.ell('ivory', [x + 0.17 * k, y + 0.1 * k, z + v * 0.1 * k], [0.04 * k, 0.04 * k, 0.04 * k], [0, 0, 0], 6, 5);
    f.ell('iron', [x + 0.205 * k, y + 0.1 * k, z + v * 0.1 * k], [0.02 * k, 0.025 * k, 0.025 * k], [0, 0, 0], 5, 5);
    f.ell(STONE, [x + 0.14 * k, y + 0.16 * k, z + v * 0.1 * k], [0.08 * k, 0.025 * k, 0.04 * k], [0, 0, v * -0.3]);       // the brow
    f.ell(STONE, [x - 0.04 * k, y + 0.25 * k, z + v * 0.17 * k], [0.06 * k, 0.07 * k, 0.03 * k], [0, 0, 0]);       // the ear
    f.tube('ivory', [x + 0.3 * k, y - 0.13 * k, z + v * 0.06 * k], [x + 0.3 * k, y - 0.22 * k, z + v * 0.07 * k], 0.012 * k, 0.004 * k, 4);   // a fang
    if (stripes) for (let q = 0; q < 3; q++) f.tube('iron', [x + 0.03 * k, y + (0.06 - 0.07 * q) * k, z + v * 0.225 * k], [x + 0.13 * k, y + (0.02 - 0.07 * q) * k, z + v * 0.19 * k], 0.012 * k, 0.008 * k, 4);
    if (horn) f.chain(STONE, [[x, y + 0.2 * k, z + v * 0.1 * k], [x - 0.08 * k, y + 0.4 * k, z + v * 0.18 * k], [x - 0.22 * k, y + 0.5 * k, z + v * 0.2 * k]], 0.035 * k, 0.012 * k, 5);
  }
  if (mane) f.lat(STONE, [[0.001, 0], [0.24 * k, 0.03 * k], [0.29 * k, 0.12 * k], [0.22 * k, 0.26 * k], [0.001, 0.3 * k]], [x - 0.12 * k, y - 0.02 * k, z], 14, true, (th) => 1 + 0.11 * Math.cos(11 * th));
}

/** The seated lion (singha); `w` the griffin's wings, `lioness` without the mane. */
function lion(f, { wings = false, mane = true, horn = false, k = 1 } = {}) {
  f.ell(STONE, [-0.02, 0.62, 0], [0.5, 0.3, 0.27], [0, 0, 0.5], 10, 8);                         // the body, the chest high
  f.ell(STONE, [0.3, 0.78, 0], [0.26, 0.3, 0.27], [0, 0, 0], 9, 7);                                // the chest
  for (const v of [-1, 1]) {
    f.ell(STONE, [-0.28, 0.3, v * 0.22], [0.3, 0.27, 0.17], [0, 0, 0], 9, 7);                      // the folded haunch
    f.ell(STONE, [-0.05, 0.06, v * 0.3], [0.2, 0.06, 0.09]);                                       // the hind paw
    f.tube(STONE, [0.3, 0.6, v * 0.16], [0.4, 0.06, v * 0.16], 0.1, 0.075, 7);                     // the foreleg
    f.ell(STONE, [0.46, 0.05, v * 0.16], [0.14, 0.06, 0.085]);                                       // the paw
    for (const t of [-0.04, 0.0, 0.04]) f.tube('iron', [0.56, 0.025, v * 0.16 + t], [0.6, 0.02, v * 0.16 + t], 0.01, 0.004, 4);   // the claws
  }
  f.chain(STONE, [[-0.5, 0.18, 0], [-0.64, 0.36, 0], [-0.62, 0.66, 0], [-0.48, 0.86, 0], [-0.34, 0.94, 0]], 0.05, 0.035, 6);        // the tail curls up the back
  f.ell(STONE, [-0.3, 0.98, 0], [0.09, 0.09, 0.09], [0, 0, 0], 6, 5);
  catHead(f, [0.42, 1.12, 0], k, { mane, horn });
  if (wings) for (const v of [-1, 1]) for (let q = 0; q < 6; q++) {
    f.ell(STONE, [-0.2 - 0.07 * q, 1.3 - 0.07 * q + 0.1, v * (0.3 + 0.09 * q)], [0.34 - 0.02 * q, 0.025, 0.065], [0, v * -0.35, 0.35 + 0.06 * q], 7, 5);   // the feathers, fanned
  }
}

/** The elephant, standing, with the caparison on its back. */
function elephant(f) {
  f.ell(STONE, [0, 1.0, 0], [0.74, 0.55, 0.48], [0, 0, 0], 12, 8);
  for (const [u, v] of [[-0.45, -0.3], [-0.45, 0.3], [0.42, -0.3], [0.42, 0.3]]) {
    f.tube(STONE, [u, 0.78, v], [u, 0.1, v], 0.19, 0.15, 8);
    f.ell(STONE, [u + 0.02, 0.06, v], [0.19, 0.07, 0.18], [0, 0, 0], 8, 5);
    for (const t of [-0.08, 0, 0.08]) f.ell('ivory', [u + 0.16, 0.06, v + t], [0.03, 0.035, 0.03], [0, 0, 0], 5, 5);      // the toenails
  }
  f.ell(STONE, [0.78, 1.18, 0], [0.4, 0.42, 0.36], [0, 0, 0.15], 10, 8);                          // the head
  for (const v of [-1, 1]) {
    f.ell(STONE, [0.98, 1.46, v * 0.17], [0.2, 0.17, 0.17], [0, 0, 0], 8, 6);                        // the twin bosses of the brow
    f.ell(STONE, [0.64, 1.18, v * 0.44], [0.05, 0.32, 0.27], [0.2 * v, -0.15 * v, 0], 9, 6);         // the ear
    f.ell('ivory', [1.06, 1.26, v * 0.2], [0.035, 0.035, 0.035], [0, 0, 0], 6, 5);
    f.ell('iron', [1.09, 1.26, v * 0.2], [0.018, 0.02, 0.02], [0, 0, 0], 5, 5);
    f.chain('ivory', [[1.05, 0.9, v * 0.2], [1.3, 0.78, v * 0.26], [1.52, 0.86, v * 0.24], [1.6, 1.04, v * 0.2]], 0.05, 0.014, 6);     // the tusk
  }
  f.chain(STONE, [[1.04, 1.0, 0], [1.2, 0.78, 0], [1.3, 0.52, 0], [1.35, 0.26, 0], [1.42, 0.12, 0], [1.52, 0.17, 0], [1.54, 0.3, 0]], 0.17, 0.05, 8);   // the trunk curls to the ground and up
  f.chain(STONE, [[-0.72, 1.3, 0], [-0.8, 0.9, 0], [-0.82, 0.5, 0]], 0.035, 0.02, 5);              // the tail
  f.ell(STONE, [-0.82, 0.4, 0], [0.04, 0.12, 0.04], [0, 0, 0], 5, 5);
  // the caparison: a red cloth with a gilt border, its tassels, the frontlet
  f.bag.add('cloth_red', placed(f, box(-0.45, 1.44, -0.5, 0.35, 1.5, 0.5)));
  for (const v of [-1, 1]) f.bag.add('gilt_bronze', placed(f, box(-0.47, 1.45, v * 0.5 - 0.03, 0.37, 1.52, v * 0.5 + 0.03)));
  for (const u of [-0.47, 0.37]) f.bag.add('gilt_bronze', placed(f, box(u - 0.03, 1.45, -0.5, u + 0.03, 1.52, 0.5)));
  for (let q = 0; q < 8; q++) f.bag.add('cloth_red', placed(f, box(-0.4 + q * 0.1, 1.2, 0.495, -0.34 + q * 0.1, 1.44, 0.5 + 0.004 * (q & 1))));
  f.bag.add('gilt_bronze', placed(f, box(0.98, 1.6, -0.12, 1.04, 1.78, 0.12)));
}
/** A box in the figure's frame as a placed geometry. */
function placed(f, g) { g.applyMatrix4(f.m); return g; }

/** The wrestler: a wide stance, the dhoti and belt, a bare chest, a moustached head under a turban, a club in the raised right hand, a round shield on the left [stated: bludgeons and shields]. */
function wrestler(f) {
  for (const v of [-1, 1]) {
    f.ell(STONE, [0.1, 0.04, v * 0.3], [0.2, 0.05, 0.1], [0, 0, 0], 8, 5);                               // the foot
    f.tube(STONE, [0.04, 0.08, v * 0.3], [0.12, 0.52, v * 0.25], 0.07, 0.095, 8);                       // the shin
    f.ell(STONE, [0.12, 0.54, v * 0.25], [0.11, 0.11, 0.11], [0, 0, 0], 8, 5);                          // the knee
    f.tube(STONE, [0.12, 0.54, v * 0.25], [0, 0.95, v * 0.15], 0.1, 0.13, 8);                           // the thigh
  }
  f.lat(STONE, [[0.001, 0.66], [0.26, 0.72], [0.4, 0.9], [0.35, 1.1], [0.27, 1.18]], [0, 0, 0], 12, false, (th) => 1 + 0.06 * Math.cos(7 * th));       // the dhoti, in folds
  f.lat('gilt_bronze', [[0.27, 0], [0.3, 0.02], [0.3, 0.1], [0.27, 0.12]], [0, 1.14, 0], 12);        // the belt
  f.ell(STONE, [0, 1.5, 0], [0.22, 0.4, 0.3], [0, 0, 0], 10, 8);                                         // the torso
  for (const v of [-1, 1]) {
    f.ell(STONE, [0.12, 1.66, v * 0.13], [0.1, 0.1, 0.13], [0, 0, 0], 7, 5);                            // a pectoral
    f.ell(STONE, [0.18, 1.36, v * 0.08], [0.06, 0.1, 0.09], [0, 0, 0], 6, 5);                           // the belly's ridges
    f.ell(STONE, [0, 1.84, v * 0.38], [0.13, 0.13, 0.13], [0, 0, 0], 7, 5);                             // a shoulder
  }
  f.tube(STONE, [0, 1.84, 0], [0.01, 2.02, 0], 0.11, 0.09, 8);
  f.ell(STONE, [0.03, 2.15, 0], [0.15, 0.18, 0.14], [0, 0, 0], 10, 7);                                    // the head
  f.ell(STONE, [0.16, 2.1, 0], [0.04, 0.05, 0.04], [0, 0, 0], 6, 5);                                     // the nose
  for (const v of [-1, 1]) {
    f.ell('ivory', [0.14, 2.19, v * 0.07], [0.028, 0.025, 0.03], [0, 0, 0], 6, 5); f.ell('iron', [0.165, 2.19, v * 0.07], [0.014, 0.016, 0.016], [0, 0, 0], 5, 5);
    f.chain('iron', [[0.15, 2.05, v * 0.02], [0.16, 2.04, v * 0.09], [0.14, 2.07, v * 0.17]], 0.014, 0.006, 4);     // the moustache
    f.ell(STONE, [0.0, 2.15, v * 0.15], [0.03, 0.05, 0.03], [0, 0, 0], 5, 5);                           // an ear
  }
  f.lat(STONE, [[0.1, 0], [0.19, 0.04], [0.2, 0.12], [0.14, 0.2], [0.001, 0.24]], [0.03, 2.25, 0], 10, false, (th) => 1 + 0.05 * Math.cos(5 * th));   // the turban
  f.lat('gilt_bronze', [[0.2, 0], [0.205, 0.015], [0.2, 0.03]], [0.03, 2.3, 0], 10);
  f.lat('gilt_bronze', [[0.12, 0], [0.13, 0.03], [0.1, 0.04]], [0.12, 1.92, 0], 10);                    // the collar of beads
  // the right arm raised to the club, the left bearing the shield
  f.tube(STONE, [0, 1.84, -0.4], [0.16, 1.58, -0.54], 0.085, 0.075, 8); f.tube(STONE, [0.16, 1.58, -0.54], [0.3, 1.95, -0.5], 0.075, 0.06, 8);
  f.ell(STONE, [0.3, 1.98, -0.5], [0.07, 0.07, 0.07], [0, 0, 0], 7, 5);
  f.tube(STONE, [0.3, 1.66, -0.5], [0.31, 2.52, -0.5], 0.045, 0.1, 9); f.ell(STONE, [0.31, 2.56, -0.5], [0.12, 0.1, 0.12], [0, 0, 0], 8, 6);
  f.lat('gilt_bronze', [[0.1, 0], [0.12, 0.02], [0.1, 0.04]], [0.16, 1.62, -0.54], 8);
  f.tube(STONE, [0, 1.84, 0.4], [0.2, 1.56, 0.5], 0.085, 0.075, 8); f.tube(STONE, [0.2, 1.56, 0.5], [0.32, 1.36, 0.42], 0.075, 0.06, 8);
  f.ell(STONE, [0.33, 1.34, 0.42], [0.07, 0.07, 0.07], [0, 0, 0], 7, 5);
  f.lat(STONE, [[0.001, 0], [0.3, 0.0], [0.31, 0.05], [0.12, 0.11], [0.001, 0.13]], [0.38, 1.4, 0.45], 12, true);        // the round shield
  f.lat('gilt_bronze', [[0.28, 0.04], [0.31, 0.06], [0.31, 0.09], [0.28, 0.07]], [0.38, 1.4, 0.45], 12, true);
  f.ell('gilt_bronze', [0.5, 1.4, 0.45], [0.07, 0.07, 0.07], [0, 0, 0], 7, 5);
  for (const [yy, rr] of [[1.69, 0.1], [1.58, 0.09]]) void yy, void rr;
}

/** A seated goddess with an animal's face and four arms: Simhini (lion-headed) and Vyaghrini (tiger-headed). */
function goddess(f, tiger) {
  f.lat(STONE, [[0.001, 0], [0.36, 0.0], [0.42, 0.1], [0.3, 0.5], [0.22, 0.7]], [0, 0, 0], 12, false, (th) => 1 + 0.05 * Math.cos(6 * th));           // the legs folded, the skirt
  f.ell(STONE, [0, 1.05, 0], [0.22, 0.38, 0.27], [0, 0, 0], 10, 7);
  f.lat('gilt_bronze', [[0.001, 0], [0.19, 0.0], [0.2, 0.04], [0.001, 0.05]], [0, 0.78, 0], 10);
  for (const v of [-1, 1]) {
    f.ell(STONE, [0.12, 1.2, v * 0.1], [0.08, 0.08, 0.1], [0, 0, 0], 7, 5);                              // the breasts
    f.tube(STONE, [0, 1.32, v * 0.26], [0.18, 1.1, v * 0.4], 0.06, 0.05, 7); f.tube(STONE, [0.18, 1.1, v * 0.4], [0.34, 1.0, v * 0.36], 0.05, 0.04, 7);        // the lower arm
    f.tube(STONE, [0, 1.38, v * 0.2], [0.1, 1.62, v * 0.5], 0.055, 0.045, 7); f.tube(STONE, [0.1, 1.62, v * 0.5], [0.12, 1.92, v * 0.5], 0.045, 0.04, 7);       // the upper arm, raised
  }
  f.tube('iron', [0.34, 0.72, 0.36], [0.34, 1.35, 0.36], 0.025, 0.02, 6);                                 // a staff in one hand
  f.lat('gilt_bronze', [[0.001, 0], [0.12, 0.0], [0.12, 0.02], [0.05, 0.05], [0.001, 0.06]], [0.34, 1.35, 0.36], 8);
  f.lat('gilt_bronze', [[0.12, 0], [0.13, 0.02], [0.12, 0.04]], [0.34, 1.0, -0.36], 8);               // a bowl in another
  f.tube(STONE, [0.12, 1.92, -0.5], [0.12, 2.15, -0.5], 0.02, 0.012, 5);
  f.lat('gilt_bronze', [[0.12, 0], [0.12, 0.2], [0.001, 0.26]], [0.12, 1.92, 0.5], 6);               // the lotus in the raised right hand
  f.lat('gilt_bronze', [[0.14, 0], [0.16, 0.03], [0.14, 0.06]], [0.08, 1.56, 0], 12);                      // the necklace
  catHead(f, [0.06, 1.72, 0], 0.7, { mane: !tiger, stripes: tiger });
  f.lat('gilt_bronze', [[0.001, 0], [0.17, 0], [0.15, 0.1], [0.1, 0.2], [0.001, 0.3]], [0.02, 1.9, 0], 10);                   // the crown
  f.lat('gilt_bronze', [[0.001, 0], [0.34, 0.0], [0.34, 0.02], [0.001, 0.02]], [-0.2, 1.74, 0], 14, true);        // the halo behind the head
}

/**
 * A guardian of the stage (kind from the foot up: 'wrestler', 'elephant', 'lion', 'griffin', 'goddess') on a moulded pedestal at (x, y, z), looking sx (+1 east, −1 west);
 * `side` (−1 or 1) is its side of the stair, for the pair's two goddesses. Size s grows with the stage [inferred: each pair stronger than the one below].
 */
export function guardian(bag, col, kind, x, y, z, sx, s, side = 1) {
  const ped = 0.5 * s, top = y + ped;
  // the pedestal: a stepped plinth with a moulded cap (it is dressed stone)
  bag.add(STONE, box(x - 0.62 * s, y, z - 0.62 * s, x + 0.62 * s, y + 0.1 * s, z + 0.62 * s));
  bag.add(STONE, box(x - 0.55 * s, y + 0.1 * s, z - 0.55 * s, x + 0.55 * s, y + 0.4 * s, z + 0.55 * s));
  bag.add(STONE, box(x - 0.6 * s, y + 0.4 * s, z - 0.6 * s, x + 0.6 * s, top, z + 0.6 * s));
  col.circle(x, z, 0.66 * s, y, y + 2.6 * s);
  const f = new Fig(bag, s * (1 + 0.002 * side), sx, x, top, z);
  if (kind === 'wrestler') wrestler(f);
  else if (kind === 'elephant') elephant(f);
  else if (kind === 'lion') lion(f, { k: 1.0 });
  else if (kind === 'griffin') lion(f, { wings: true, horn: true, k: 1.0 });
  else goddess(f, side > 0);
}
