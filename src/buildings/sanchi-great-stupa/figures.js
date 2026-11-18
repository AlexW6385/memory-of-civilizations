// The gateways' figures in the round, as modelled volumes (sculpt.js): the yakshi, the capitals' lions, elephants and dwarfs,
// the riders between the beams. Each is built once per level of detail and placed by the caller; all face +x, feet on y = 0.
// lvl 2: the first gateway the visitor reaches (about 2 cm to the surface); lvl 1: the others (about 3.5 cm).
// docs/settlements/sanchi.md §19.

import { Field, nets, ringOn, tube, bead, join, leave } from './sculpt.js';

const cache = new Map();
const once = (key, fn) => { if (!cache.has(key)) cache.set(key, fn()); return cache.get(key); };
const unit = (v) => { const l = Math.hypot(...v) || 1; return v.map((x) => x / l); };
const lerp = (a, b, t) => a.map((x, i) => x + (b[i] - x) * t);

/** A head (facing +x, about 0.2 m tall) as its own field at a finer grid: skull, brow, nose, lips, chin, ears; hair added by the caller. */
function headField(c, s = 1, tilt = 0, womanly = true) {
  const f = new Field(), [x, y, z] = c;
  const S = (v) => v * s;
  f.ball([x, y, z], [S(0.092), S(0.112), S(0.085)], 0.02, { rz: tilt });
  f.ball([x + S(0.035), y - S(0.06), z], [S(0.07), S(0.07), S(0.066)], 0.03);                      // the jaw
  f.ball([x + S(0.062), y - S(0.108), z], [S(0.03), S(0.028), S(0.038)], 0.02);                    // the chin
  f.ball([x + S(0.075), y + S(0.022), z - S(0.042)], [S(0.026), S(0.018), S(0.03)], 0.014);         // the brows
  f.ball([x + S(0.075), y + S(0.022), z + S(0.042)], [S(0.026), S(0.018), S(0.03)], 0.014);
  f.limb([x + S(0.08), y + S(0.012), z], [x + S(0.112), y - S(0.04), z], S(0.013), S(0.019), 0.018); // the nose
  f.ball([x + S(0.1), y - S(0.052), z], [S(0.016), S(0.012), S(0.026)], 0.012);                     // its tip and wings
  f.ball([x + S(0.088), y - S(0.074), z], [S(0.015), S(0.0075), S(0.027)], 0.008);                 // the lips
  f.ball([x + S(0.085), y - S(0.088), z], [S(0.013), S(0.008), S(0.022)], 0.008);
  for (const e of [-1, 1]) {
    f.ball([x + S(0.08), y + S(0.004), z + e * S(0.04)], S(0.011), 0.01, { sub: true });          // the eyes, set in
    f.ball([x - S(0.005), y - S(0.01), z + e * S(0.088)], [S(0.014), S(0.03), S(0.012)], 0.01);    // the ears
  }
  void womanly;
  return f;
}
const headMesh = (c, s, tilt, h) => { const f = headField(c, s, tilt); return nets(f, f.box(0.02), h); };

// ------------------------------------------------------------------------------------------------ the yakshi

/** The torso swung back over the weight leg: everything above the hips is shifted toward -z by up to 7 cm (the triple bend). */
const shear = (y) => -0.075 * Math.min(1, Math.max(0, (y - 0.9) / 0.55));
const sheared = (f) => ({ eval: (x, y, z) => f.eval(x, y, z - shear(y)), box: (p) => { const b = f.box(p); b[2] -= 0.1; b[5] += 0.04; return b; } });
/** A yakshi in the triple bend, her weight on the near leg, the far leg crossed before it on its toe, one arm up into the boughs, the other at her hip. */
export function yakshi(h) {
  const lvl = h < 0.04 ? 2 : 1;
  return once('yakshi' + h, () => {
    const f = new Field();
    const hipL = [0, 0.93, -0.1], hipR = [0, 0.94, 0.11];
    // the weight leg (z+), straight with a soft knee; the free leg crossed in front, on its toe
    f.limb(hipR, [0.03, 0.5, 0.1], 0.098, 0.066, 0.06); f.limb([0.03, 0.5, 0.1], [0.0, 0.1, 0.095], 0.064, 0.036, 0.04);
    f.limb(hipL, [0.1, 0.52, -0.02], 0.094, 0.063, 0.06); f.limb([0.1, 0.52, -0.02], [0.17, 0.11, 0.035], 0.062, 0.034, 0.04);
    f.limb([0.0, 0.07, 0.095], [0.115, 0.025, 0.1], 0.033, 0.024, 0.02);                              // the feet
    f.limb([0.17, 0.09, 0.035], [0.26, 0.022, 0.04], 0.03, 0.02, 0.02);
    // the hips thrown out to the weight side, the waist, the torso swung back the other way
    f.ball([0.0, 0.99, 0.03], [0.165, 0.135, 0.22], 0.08, { rz: 0.05 });
    f.ball([-0.01, 1.17, -0.02], [0.11, 0.12, 0.15], 0.08);
    f.ball([0.0, 1.38, -0.07], [0.135, 0.17, 0.2], 0.07, { rz: -0.05 });
    f.ball([0.115, 1.35, 0.025], [0.075, 0.07, 0.07], 0.035); f.ball([0.115, 1.36, -0.15], [0.075, 0.07, 0.07], 0.035);   // breasts
    f.limb([0.0, 1.5, -0.08], [0.015, 1.64, -0.1], 0.052, 0.044, 0.04);                               // neck
    f.ball([-0.02, 1.52, -0.08], [0.1, 0.05, 0.17], 0.05);                                          // shoulders
    // the arms: the near one up into the branch, the other bent with the hand on the thigh
    f.limb([0.0, 1.5, 0.08], [0.05, 1.74, 0.2], 0.047, 0.036, 0.04); f.limb([0.05, 1.74, 0.2], [0.13, 1.96, 0.15], 0.036, 0.027, 0.03);
    f.limb([0.13, 1.96, 0.15], [0.17, 2.04, 0.145], 0.026, 0.02, 0.02);
    for (const fz of [0, 1, 2, 3]) f.limb([0.17, 2.04, 0.145 - fz * 0.014 + 0.014], [0.2, 2.1, 0.14 - fz * 0.012 + 0.014], 0.0075, 0.006, 0.006);
    f.limb([0.0, 1.5, -0.22], [-0.02, 1.3, -0.29], 0.046, 0.036, 0.04); f.limb([-0.02, 1.3, -0.29], [0.07, 1.1, -0.24], 0.035, 0.026, 0.03);
    f.ball([0.09, 1.06, -0.23], [0.03, 0.04, 0.02], 0.02);
    const hs = h * 0.36, bs = h;
    const fs = sheared(f);
    const parts = [nets(fs, fs.box(0.04), bs), headMesh([0.025, 1.745, -0.1 + shear(1.745)], 1, 0.1, hs)];
    // the hair: a heavy knot high on the back of the head with a band, a plait down the back
    const H = new Field();
    H.ball([-0.045, 1.77, -0.1], [0.09, 0.075, 0.1], 0.03); H.ball([-0.09, 1.84, -0.1], [0.075, 0.07, 0.075], 0.03); H.ball([-0.04, 1.69, -0.1], [0.07, 0.07, 0.085], 0.03);
    H.limb([-0.08, 1.62, -0.1], [-0.13, 1.35, -0.12], 0.048, 0.034, 0.03); H.limb([-0.13, 1.35, -0.12], [-0.13, 1.08, -0.1], 0.034, 0.024, 0.03);
    const Hs = sheared(H); parts.push(nets(Hs, Hs.box(0.03), h * 0.6));
    // jewellery, laid on the skin
    const ey = [1, 0, 0], ez = [0, 0, 1], ex = [0, 1, 0];
    const body = fs, Z = (y, z) => z + shear(y);
    const on = (c, a, b, n, out, rMax = 0.5) => ringOn(body, c, a, b, n, rMax, out);
    const ring = (c, a, b, n, out, r, seg = 5, rMax = 0.5) => tube(on(c, a, b, n, out, rMax), r, seg, true);
    const N = lvl >= 2 ? 28 : 16;
    parts.push(ring([0.0, 0.985, 0.03], ey, ez, N, 0.006, 0.014, 6));                              // the girdle, two bands
    parts.push(ring([0.0, 0.935, 0.03], ey, ez, N, 0.004, 0.009, 5));
    parts.push(ring([0.0, 1.03, 0.03], ey, ez, N, 0.004, 0.008, 5));
    parts.push(ring([0.0, 1.49, Z(1.49, -0.08)], ey, ez, N, 0.004, 0.01, 5));                                // the necklace
    // the strands of the girdle hanging over the thigh
    for (const [zz, dd] of [[0.0, 0.07], [0.11, 0.05], [0.2, 0.04]]) {
      const pts = []; const a = leave(body, [0.0, 0.95, zz], [1, 0, 0], 0.5, 0.004), b = leave(body, [0.0, 0.8, zz + 0.01], [1, 0, 0], 0.5, 0.006);
      pts.push(a, [a[0] + 0.012, a[1] - 0.04, a[2]], [b[0] + 0.012, b[1] + 0.02, b[2]], b); void dd;
      parts.push(tube(pts, 0.007, 4));
    }
    for (const [c, a1] of [[[0.0, 0.12, 0.095], 1], [[0.12, 0.12, 0.035], 1]]) { void a1; for (let k = 0; k < 3; k++) parts.push(ring([c[0], c[1] + k * 0.017, c[2]], ey, ez, 12, 0.005, 0.0085, 4, 0.2)); }   // anklets
    parts.push(ring([0.1, 1.84, Z(1.84, 0.18)], [1, 0, 0], [0, 0, 1], 12, 0.004, 0.009, 4, 0.2));
    for (let k = 0; k < 3; k++) parts.push(ring([0.1 + k * 0.004, 1.9 + k * 0.014, Z(1.9, 0.17)], [1, 0, 0], [0, 0, 1], 12, 0.004, 0.008, 4, 0.2));      // bangles on the raised arm
    for (let k = 0; k < 2; k++) parts.push(ring([-0.025 + k * 0.03, 1.2 - k * 0.04, Z(1.2, -0.28)], [1, 0, 0], [0, 0, 1], 12, 0.004, 0.008, 4, 0.2));
    // the ear-ornaments, the headband
    for (const e of [-1, 1]) parts.push(bead([0.02, 1.7, -0.1 + shear(1.7) + e * 0.088], 0.017, 6, 4));
    parts.push(tube(Array.from({ length: 14 }, (_, i) => { const a = -1.6 + i * 3.2 / 13; return [0.025 + 0.093 * Math.cos(a) * 0.9, 1.815, -0.1 + shear(1.815) + 0.088 * Math.sin(a)]; }), 0.009, 5));
    // the skirt: a thin cloth from the girdle to the ankles, falling in folds that follow the legs
    const sk = new Field();
    sk.limb([0.0, 0.99, 0.11], [0.04, 0.56, 0.115], 0.125, 0.105, 0.03); sk.limb([0.0, 0.98, -0.09], [0.12, 0.58, -0.01], 0.125, 0.105, 0.03);
    sk.ball([0.02, 1.0, 0.0], [0.15, 0.1, 0.2], 0.04);
    const skirt = nets(sk, sk.box(0.03), h * 0.8);
    parts.push(skirt);
    return join(...parts);
  });
}

// ------------------------------------------------------------------------------------------------ animals

/** A seated lion, facing +x (about 0.85 m to the top of its head), mane, open jaws, forelegs straight, tail looped up its flank. */
export function lion(h, sc = 1) {
  const lvl = h < 0.04 ? 2 : 1;
  return once('lion' + h + sc, () => {
    const f = new Field();
    f.ball([-0.12, 0.2, 0], [0.26, 0.2, 0.17], 0.06);                                                   // haunch and loins
    f.ball([-0.1, 0.12, 0.13], [0.2, 0.12, 0.08], 0.05); f.ball([-0.1, 0.12, -0.13], [0.2, 0.12, 0.08], 0.05);   // the folded hind legs
    f.limb([-0.02, 0.2, 0], [0.12, 0.44, 0], 0.2, 0.17, 0.08);                                         // the barrel rising to the chest
    f.ball([0.12, 0.5, 0], [0.18, 0.22, 0.17], 0.06);
    for (const z of [-0.085, 0.085]) { f.limb([0.2, 0.46, z], [0.25, 0.04, z * 1.05], 0.065, 0.048, 0.04); f.slab([0.3, 0.02, z * 1.05], [0.07, 0.025, 0.045], 0.02, 0.02); }
    f.limb([0.14, 0.6, 0], [0.22, 0.84, 0], 0.13, 0.11, 0.06);                                          // the neck
    // the head: brow, a broad nose, a lower jaw hanging open
    f.ball([0.27, 0.86, 0], [0.13, 0.12, 0.12], 0.04);
    f.ball([0.39, 0.85, 0], [0.09, 0.06, 0.09], 0.03);
    f.ball([0.38, 0.77, 0], [0.095, 0.03, 0.075], 0.02);
    f.ball([0.36, 0.92, 0], [0.06, 0.03, 0.1], 0.025);
    for (const z of [-0.075, 0.075]) { f.ball([0.36, 0.915, z], 0.022, 0.015, { sub: true }); f.ball([0.22, 0.97, z * 1.1], [0.03, 0.03, 0.03], 0.02); }
    f.ball([0.38, 0.81, 0], [0.07, 0.02, 0.05], 0.015, { sub: true });                                  // the mouth
    // the mane: a ruff of tufts round the head and over the shoulders
    const nt = lvl >= 2 ? 14 : 9;
    for (let i = 0; i < nt; i++) {
      const th = i / nt * Math.PI * 2, r = 0.16 + 0.012 * Math.sin(i * 2.4);
      f.limb([0.2, 0.86, 0], [0.2, 0.86 + Math.sin(th) * r * 1.25, Math.cos(th) * r * 1.3], 0.05, 0.03, 0.035);
    }
    f.limb([0.12, 0.8, 0], [0.0, 0.52, 0.0], 0.17, 0.1, 0.06);
    f.limb([-0.3, 0.12, 0.05], [-0.38, 0.3, 0.17], 0.03, 0.022, 0.02); f.limb([-0.38, 0.3, 0.17], [-0.3, 0.56, 0.14], 0.022, 0.02, 0.02);   // the tail
    f.ball([-0.28, 0.6, 0.14], [0.04, 0.06, 0.035], 0.02);
    const m = nets(f, f.box(0.03), h / sc);
    return m;
  });
}

/** A standing elephant seen from the side, facing +x, about 1.3 m to its back: trunk curled, tusks, ears, folded legs; withRider adds a seated man. */
export function elephant(h, sc = 1, withRider = false) {
  const lvl = h < 0.04 ? 2 : 1;
  return once('elephant' + h + sc + withRider, () => {
    const f = new Field();
    f.ball([-0.05, 0.72, 0], [0.5, 0.36, 0.28], 0.1);                                                    // the barrel
    f.ball([-0.4, 0.68, 0], [0.22, 0.3, 0.25], 0.08);                                                    // haunch
    f.ball([0.28, 0.82, 0], [0.22, 0.3, 0.24], 0.08);                                                    // shoulder
    f.ball([0.58, 0.88, 0], [0.19, 0.22, 0.2], 0.06);                                                    // head
    f.ball([0.66, 1.0, 0], [0.12, 0.1, 0.17], 0.05);                                                      // the forehead's bosses
    for (const [x, z] of [[0.34, 0.16], [0.34, -0.16], [-0.38, 0.16], [-0.38, -0.16]]) { f.limb([x, 0.6, z], [x + 0.01, 0.06, z * 1.02], 0.13, 0.1, 0.06); f.slab([x + 0.02, 0.035, z * 1.02], [0.12, 0.04, 0.1], 0.04, 0.03); }
    // trunk: down and out, curling up at the tip
    const tr = [[0.7, 0.8, 0], [0.8, 0.55, 0], [0.84, 0.3, 0], [0.82, 0.12, 0], [0.88, 0.04, 0], [0.97, 0.1, 0]];
    for (let i = 0; i + 1 < tr.length; i++) f.limb(tr[i], tr[i + 1], 0.095 - i * 0.012, 0.095 - (i + 1) * 0.012, 0.03);
    for (const e of [-1, 1]) {
      f.ball([0.46, 0.92, e * 0.26], [0.03, 0.26, 0.2], 0.04, { ry: e * 0.3 });                          // the ear, a hanging plate
      f.limb([0.66, 0.76, e * 0.12], [0.84, 0.7, e * 0.14], 0.026, 0.012, 0.015);                          // the tusk
      f.ball([0.7, 1.0, e * 0.1], 0.02, 0.012, { sub: true });
    }
    f.limb([-0.6, 0.86, 0], [-0.66, 0.4, 0], 0.03, 0.02, 0.02);                                         // the tail
    const parts = [nets(f, f.box(0.03), h / sc)];
    if (withRider) parts.push(rider(h / sc, [0.14, 1.07, 0]));
    return join(...parts);
  });
}

/** A seated man (a rider or mahout) at c (the seat), facing +x: legs astride, back straight, an arm out to the goad. */
function rider(hl, c) {
  const f = new Field(), [x, y, z] = c;
  f.ball([x, y + 0.06, z], [0.1, 0.07, 0.12], 0.04);
  f.limb([x, y + 0.1, z], [x, y + 0.34, z], 0.095, 0.095, 0.05);
  f.ball([x, y + 0.36, z], [0.08, 0.06, 0.13], 0.04);
  f.limb([x, y + 0.4, z], [x + 0.01, y + 0.46, z], 0.04, 0.035, 0.03);
  f.ball([x + 0.01, y + 0.54, z], [0.06, 0.07, 0.055], 0.02);
  f.ball([x - 0.01, y + 0.6, z], [0.07, 0.04, 0.06], 0.02);
  for (const e of [-1, 1]) {
    f.limb([x, y + 0.06, z + e * 0.1], [x + 0.14, y - 0.08, z + e * 0.2], 0.055, 0.04, 0.03); f.limb([x + 0.14, y - 0.08, z + e * 0.2], [x + 0.1, y - 0.34, z + e * 0.22], 0.04, 0.03, 0.03);
    f.limb([x, y + 0.36, z + e * 0.14], [x + 0.14, y + 0.3, z + e * 0.15], 0.03, 0.025, 0.02);
  }
  return nets(f, f.box(0.02), hl);
}

/** A horse with a rider, facing +x, about 1.0 m to the withers (the riders between the beams). */
export function horseRider(h, sc = 1) {
  return once('horse' + h + sc, () => {
    const f = new Field();
    f.ball([-0.02, 0.7, 0], [0.4, 0.22, 0.17], 0.08); f.ball([-0.3, 0.7, 0], [0.18, 0.2, 0.18], 0.06); f.ball([0.28, 0.76, 0], [0.18, 0.2, 0.16], 0.06);
    f.limb([0.3, 0.84, 0], [0.5, 1.06, 0], 0.11, 0.075, 0.06); f.ball([0.58, 1.06, 0], [0.12, 0.075, 0.07], 0.04); f.limb([0.56, 1.1, 0], [0.66, 0.96, 0], 0.06, 0.04, 0.03);
    for (const e of [-1, 1]) f.limb([0.48, 1.12, e * 0.04], [0.47, 1.22, e * 0.04], 0.015, 0.008, 0.01);
    for (const [x, z, k] of [[0.28, 0.09, 1], [0.28, -0.09, 1], [-0.32, 0.1, -1], [-0.32, -0.1, -1]]) { f.limb([x, 0.64, z], [x + k * 0.02, 0.3, z], 0.075, 0.04, 0.04); f.limb([x + k * 0.02, 0.3, z], [x - k * 0.01, 0.04, z], 0.032, 0.026, 0.02); }
    f.limb([-0.44, 0.84, 0], [-0.55, 0.4, 0], 0.04, 0.028, 0.03);
    return join(nets(f, f.box(0.03), h / sc), rider(h / sc, [0.05, 0.9, 0]));
  });
}

/** A pot-bellied dwarf (gana), squatting, both arms up under the beam: 0.9 m. */
export function dwarf(h, sc = 1) {
  return once('dwarf' + h + sc, () => {
    const f = new Field();
    f.ball([0, 0.34, 0], [0.2, 0.17, 0.22], 0.08);
    f.ball([0.03, 0.48, 0], [0.2, 0.2, 0.2], 0.07);                                                     // the belly
    f.ball([-0.02, 0.62, 0], [0.15, 0.16, 0.19], 0.06);
    f.ball([0.02, 0.8, 0], [0.12, 0.13, 0.11], 0.04);                                                    // the head
    f.ball([0.1, 0.8, 0], [0.04, 0.05, 0.07], 0.03); f.ball([0.1, 0.9, 0], [0.04, 0.025, 0.09], 0.02);
    f.ball([0.1, 0.8, 0.045], 0.015, 0.01, { sub: true }); f.ball([0.1, 0.8, -0.045], 0.015, 0.01, { sub: true });
    f.ball([0.1, 0.72, 0], [0.025, 0.012, 0.045], 0.01, { sub: true });
    for (const e of [-1, 1]) {
      f.limb([0, 0.34, e * 0.15], [0.2, 0.28, e * 0.28], 0.075, 0.055, 0.04); f.limb([0.2, 0.28, e * 0.28], [0.14, 0.05, e * 0.3], 0.055, 0.045, 0.03); f.slab([0.2, 0.03, e * 0.3], [0.09, 0.03, 0.05], 0.025, 0.02);
      f.limb([-0.0, 0.7, e * 0.17], [0.0, 0.84, e * 0.27], 0.045, 0.038, 0.03); f.limb([0.0, 0.84, e * 0.27], [-0.03, 1.02, e * 0.2], 0.038, 0.03, 0.03);
      f.ball([0.0, 0.76, e * 0.11], 0.02, 0.01, { sub: true });
      f.ball([0.0, 0.8, e * 0.115], [0.025, 0.06, 0.02], 0.02);
    }
    return nets(f, f.box(0.03), h / sc);
  });
}
void unit; void lerp;
