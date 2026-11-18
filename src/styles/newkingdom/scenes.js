// The figures and scenes cut in sunk relief (docs/settlements/thebes.md §14), as shapes for relief.js, in the plane of the wall: a striding or standing
// man, a seated god, a bound captive, columns of signs, a cartouche. Several existing materials in each, the paint of the figure: skin red-brown, the kilt
// white, the crowns white and red, Amun blue with gold, the captives yellow, black and white. A figure is drawn in its own units (its height 1) and set
// by `T`: scene point → panel point.
import { cap, elp, pol, rct } from './relief.js';
import { hash } from './sculpt.js';

export const PAINT = { skin: 'paint_robe', kilt: 'plaster_white', blue: 'egyptian_blue', gold: 'gold', red: 'limewash_red', black: 'lacquer_black', ochre: 'paint_ochre', green: 'fresco_green', white: 'plaster_white' };

/**
 * A man standing in profile with the chest turned to the front, facing dir (+1 toward +u): feet at (x, y), height S to the top of the head. o: skin, kilt, crown
 * ('white' | 'red' | 'double' | 'amun' | 'nemes' | 'wig' | 'none'), stride (0..1), arms [[ex, ey, hx, hy] (elbow and hand, fractions of S from the shoulder, forward positive), …].
 */
export function man(x, y, S, dir, o = {}) {
  const T = (p, q) => [x + dir * p * S, y + q * S], out = [], c = PAINT, skin = o.skin ?? c.skin, st = o.stride ?? 1, kilt = o.kilt ?? c.kilt, r = (k) => k * S;
  const C = (m, a, b, ra, rb, op) => out.push(cap(m, ...T(...a), ...T(...b), r(ra), r(rb ?? ra), op));
  const E = (m, p, rx, ry, rot = 0, op) => out.push(elp(m, ...T(...p), r(rx), r(ry), rot * dir, op));
  const P = (m, pts, op) => out.push(pol(m, pts.map(([p, q]) => T(p, q)), op));
  // the legs: the front striding, the rear behind it; feet
  C(skin, [0.03, 0.42], [0.1 * st, 0.24], 0.052, 0.04); C(skin, [0.1 * st, 0.24], [0.17 * st, 0.05], 0.04, 0.028);
  C(skin, [-0.02, 0.42], [-0.06 * st, 0.22], 0.05, 0.038); C(skin, [-0.06 * st, 0.22], [-0.14 * st, 0.05], 0.038, 0.028);
  C(skin, [0.17 * st, 0.03], [0.26 * st, 0.025], 0.03, 0.02); C(skin, [-0.14 * st, 0.03], [-0.06 * st, 0.025], 0.03, 0.02);
  // the torso, the kilt with its apron, the belt, the collar
  P(skin, [[-0.125, 0.85], [0.125, 0.85], [0.085, 0.6], [-0.085, 0.6]]);
  P(kilt, [[-0.09, 0.63], [0.09, 0.63], [0.21, 0.43], [0.21, 0.36], [0.02, 0.35], [-0.1, 0.39]]);
  C(c.gold, [-0.085, 0.615], [0.09, 0.615], 0.014);
  E(c.gold, [0.01, 0.79], 0.105, 0.03);
  // neck, head, nose, eye, ear
  C(skin, [0.01, 0.88], [0.01, 0.82], 0.024);
  E(skin, [0.015, 0.925], 0.056, 0.07);
  P(skin, [[0.055, 0.945], [0.098, 0.9], [0.058, 0.89]]);
  C(c.black, [0.05, 0.94], [0.078, 0.94], 0.009, 0.009, { sink: 0.04 });
  // the head-dress
  const cr = o.crown ?? 'nemes';
  if (cr === 'white' || cr === 'double') { E(c.white, [-0.005, 1.04], 0.03, 0.08); if (cr === 'double') E(c.red, [-0.03, 0.99], 0.035, 0.05); E(c.white, [-0.005, 1.1], 0.02, 0.05); }
  if (cr === 'red') { E(c.red, [-0.02, 1.0], 0.04, 0.06); C(c.red, [-0.05, 1.0], [-0.05, 1.1], 0.014); }
  if (cr === 'amun') { E(c.gold, [-0.005, 1.0], 0.04, 0.05); C(c.blue, [-0.015, 1.02], [-0.015, 1.33], 0.014); C(c.gold, [0.025, 1.02], [0.025, 1.3], 0.014); E(c.gold, [0.0, 1.05], 0.035, 0.012); }
  if (cr === 'nemes' || cr === 'wig') { P(c.blue, [[-0.04, 0.99], [0.03, 0.99], [0.0, 0.99], [-0.08, 0.84], [-0.04, 0.84]]); E(c.blue, [-0.005, 0.975], 0.05, 0.045); E(c.gold, [-0.005, 0.99], 0.052, 0.01); }
  if (o.beard) C(c.blue, [0.06, 0.88], [0.075, 0.8], 0.012, 0.014);
  // the arms (from the shoulder at (0.01, 0.82))
  for (const a of o.arms ?? [[[0.0, -0.17, 0.0, -0.32], [0.04, -0.13, 0.08, -0.22]][0]]) {
    const [ex, ey, hx, hy] = a;
    C(skin, [0.01, 0.8], [0.01 + ex, 0.82 + ey], 0.036, 0.03); C(skin, [0.01 + ex, 0.82 + ey], [0.01 + hx, 0.82 + hy], 0.03, 0.024);
    E(skin, [0.01 + hx, 0.82 + hy], 0.03, 0.026);
  }
  return out;
}

/** A bound captive kneeling or stooping toward the king, arms raised, of height h: his head at (x, y + 0.7 h). */
export function captive(x, y, h, dir, mat, i = 0) {
  const T = (p, q) => [x + dir * p * h, y + q * h], out = [], r = (k) => k * h, C = (a, b, ra, rb) => out.push(cap(mat, ...T(...a), ...T(...b), r(ra), r(rb ?? ra)));
  out.push(elp(mat, ...T(0.04, 0.72), r(0.1), r(0.12), 0));
  out.push(pol(mat, [T(0.1, 0.74), T(0.19, 0.66), T(0.1, 0.64)]));                                     // the nose, the beard
  C([0.0, 0.62], [-0.05, 0.3], 0.12, 0.1);                                                              // the torso, bent
  C([-0.05, 0.3], [0.12, 0.14], 0.09, 0.07); C([0.12, 0.14], [-0.04, 0.02], 0.07, 0.06);               // the knee and the shin
  C([0.0, 0.58], [0.15, 0.78 + 0.02 * (i % 2)], 0.05, 0.04); C([0.15, 0.78], [0.12, 0.92], 0.04, 0.035); // the arm bound up
  return out;
}

/** The god standing: like a man in a long kilt with the tall crown; holds the ankh (forward) and the sceptre. */
export function god(x, y, S, dir, o = {}) {
  const out = man(x, y, S, dir, { skin: PAINT.blue, crown: 'amun', stride: 0.55, beard: true, arms: [[0.1, -0.1, 0.24, -0.05], [0.0, -0.16, 0.06, -0.3]], ...o });
  const T = (p, q) => [x + dir * p * S, y + q * S], r = (k) => k * S;
  const hx = 0.25, hy = 0.77;
  const B = (m, a, b) => out.push(rct(m, Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])));
  B(PAINT.gold, T(hx - 0.012, hy - 0.2), T(hx + 0.012, hy));                                            // the ankh's stem
  B(PAINT.gold, T(hx - 0.05, hy - 0.01), T(hx + 0.05, hy + 0.025));
  out.push(elp(PAINT.gold, ...T(hx, hy + 0.07), r(0.035), r(0.05)));                                   // its loop
  out.push(cap(PAINT.gold, ...T(-0.12, 0.05), ...T(-0.12, 0.72), r(0.012), r(0.012)));                  // the was-sceptre
  return out;
}

/** A seated god: throne, thighs, shins, torso, arms, head, crown. */
export function seated(x, y, S, dir, o = {}) {
  const T = (p, q) => [x + dir * p * S, y + q * S], r = (k) => k * S, out = [], c = PAINT, skin = o.skin ?? c.blue;
  const bx = (p0, q0, p1, q1, m, op) => { const a = T(p0, q0), b = T(p1, q1); out.push(rct(m, Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1]), op)); };
  bx(-0.32, 0.0, 0.0, 0.42, c.ochre);                                                                   // the throne's block
  bx(-0.33, 0.42, -0.26, 0.82, c.ochre);                                                                 // its back
  out.push(cap(skin, ...T(0.0, 0.5), ...T(0.2, 0.5), r(0.06), r(0.05)));                                // the thigh
  out.push(cap(skin, ...T(0.2, 0.5), ...T(0.2, 0.06), r(0.05), r(0.035)));                              // the shin
  out.push(cap(skin, ...T(0.2, 0.03), ...T(0.3, 0.03), r(0.03), r(0.02)));
  out.push(pol(c.kilt, [T(-0.1, 0.62), T(0.1, 0.55), T(0.24, 0.5), T(0.24, 0.42), T(-0.1, 0.42)]));     // the kilt
  out.push(pol(skin, [T(-0.1, 0.62), T(0.07, 0.62), T(0.05, 0.9), T(-0.1, 0.9)]));                      // the torso
  out.push(cap(skin, ...T(0.0, 0.88), ...T(0.2, 0.74), r(0.03), r(0.025)));                             // the arm and the hand on the knee
  out.push(elp(skin, ...T(0.0, 1.0), r(0.05), r(0.065)));
  out.push(pol(skin, [T(0.04, 1.01), T(0.09, 0.97), T(0.05, 0.96)]));
  out.push(elp(c.gold, ...T(-0.02, 1.07), r(0.045), r(0.04)));
  out.push(cap(c.blue, ...T(-0.03, 1.08), ...T(-0.03, 1.36), r(0.014), r(0.012))); out.push(cap(c.gold, ...T(0.02, 1.08), ...T(0.02, 1.33), r(0.014), r(0.012)));
  return out;
}

/** A column of signs from v1 down to v0 at u, `w` wide: birds, rings, bars, reeds; by a hash of its place. */
export function signs(u, v0, v1, w, seed, mat = PAINT.blue) {
  const out = []; let v = v1 - w * 0.4, k = 0;
  while (v > v0 + w * 0.4) {
    const q = hash(u, v, seed + k++), hh = w * (q < 0.3 ? 0.45 : q < 0.65 ? 0.8 : 1.15);
    if (v - hh < v0) break;
    const m = mat;
    if (q < 0.3) out.push(rct(m, u - w * 0.42, v - hh, u + w * 0.42, v - hh * 0.4, { rise: 0.3 }));
    else if (q < 0.5) out.push(elp(m, u, v - hh / 2, w * 0.32, hh * 0.46));
    else if (q < 0.75) out.push(pol(m, [[u - w * 0.35, v - hh], [u + w * 0.05, v - hh], [u + w * 0.3, v - hh * 0.45], [u + w * 0.4, v - hh * 0.25], [u + w * 0.2, v], [u - w * 0.05, v - hh * 0.2], [u - w * 0.4, v - hh * 0.6]]));
    else { out.push(rct(m, u - w * 0.38, v - hh, u - w * 0.1, v)); out.push(rct(m, u + w * 0.1, v - hh, u + w * 0.38, v - hh * 0.3)); }
    v -= hh + w * 0.25;
  }
  return out;
}

/** The king smiting: left of the scene, the god right; S the king's height; returns { shapes, w, h } in scene units from (0, 0) (feet on y = 0), facing +u. */
export function smiteScene(S) {
  const c = PAINT, sh = [], k = S;
  const K = man(0.42 * k, 0, k, 1, { crown: 'white', stride: 1.15, arms: [[-0.11, 0.17, -0.2, 0.3], [0.1, -0.06, 0.24, -0.04]] });
  // the captives gripped by the hair, stooping before the king: ochre, black, white
  const caps = [[0.7, 0.0, c.ochre], [0.83, -0.02, c.black], [0.96, 0.01, c.white]];
  caps.forEach(([x, y, m], i) => sh.push(...captive(x * k, y * k, 0.62 * k, 1, m, i)));
  sh.push(...K);
  // the mace raised: the haft and the pear-shaped head
  const hx = 0.42 * k + (0.01 - 0.2) * k, hy = (0.82 + 0.3) * k;
  sh.push(cap(c.ochre, hx, hy - 0.02 * k, hx - 0.02 * k, hy + 0.2 * k, 0.012 * k, 0.012 * k));
  sh.push(elp(c.white, hx - 0.025 * k, hy + 0.25 * k, 0.045 * k, 0.07 * k, 0.15));
  // Amun, receiving him: the sickle-sword's stroke over the captives' heads, the cords
  sh.push(...god(1.4 * k, 0, 0.98 * k, -1));
  // the columns of the names between the heads, and the ground line
  for (let i = 0; i < 4; i++) sh.push(...signs((0.74 + i * 0.1) * k, 1.0 * k, 1.34 * k, 0.05 * k, 7 + i));
  for (let i = 0; i < 3; i++) sh.push(...signs((1.1 + i * 0.075) * k, 1.12 * k, 1.5 * k, 0.045 * k, 17 + i));
  sh.push(rct(c.ochre, -0.02 * k, -0.035 * k, 1.7 * k, -0.005 * k, { sink: 0.03, rise: 0 }));
  return { shapes: sh, w: 1.78 * k, h: 1.5 * k };
}

/** The king offering to a seated god: a smaller scene for the registers and the columns: king left (offering a bowl), god right; height S. */
export function offerScene(S, flip = false, o = {}) {
  const c = PAINT, sh = [], k = S, d = flip ? -1 : 1, X = (p) => (flip ? 1.0 - p : p) * k;
  sh.push(...man(X(0.3), 0, 0.8 * k, d, { crown: o.crown ?? 'double', stride: 0.8, beard: true, arms: [[0.14, -0.04, 0.26, 0.04], [0.1, -0.1, 0.22, -0.02]] }));
  { const a = X(0.55), b = X(0.6); sh.push(rct(c.ochre, Math.min(a, b), 0, Math.max(a, b), 0.34 * k)); }   // the stand of offerings
  sh.push(elp(c.green, X(0.575), 0.38 * k, 0.06 * k, 0.04 * k));
  sh.push(...seated(X(0.86), 0, 0.62 * k, -d, { skin: o.god ?? c.blue }));
  for (let i = 0; i < 2; i++) sh.push(...signs(X(0.6 + i * 0.09), 0.62 * k, 1.0 * k, 0.04 * k, 31 + i));
  return { shapes: sh, w: 1.1 * k, h: 1.06 * k };
}
