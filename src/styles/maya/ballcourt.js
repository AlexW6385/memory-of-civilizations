// The carvings of the Great Ball Court of Chichén Itzá (docs/settlements/chichen-itza.md §11): the
// relief panels on the slanted benches — two files of seven ball players meeting at a ball carved
// as a skull, the first player on one side beheaded, the serpents and the flowering vine springing
// from his neck, the first on the other holding the knife and the head; the stone rings carved with
// two intertwined feathered serpents; the jaguar throne before the Lower Temple of the Jaguars.
// Built in the Kit's frame (x across, y up, z out of the surface) like the rest of meso.js.

import { fromTriangles } from '../../core/geom.js';
import { carved } from './meso.js';

/**
 * Lay a carving into the bag on a tilted surface: its x along U, its y along V, its z along N
 * (U × V = N, so the faces keep their winding), the frame's origin at O.
 */
export function emitFrame(kit, bag, O, U, V, N) {
  for (const [mat, list] of kit.m) for (const g of list) {
    const p = g.attributes.position.array, t = new Array(p.length);
    for (let i = 0; i < p.length; i += 3) {
      const x = p[i], y = p[i + 1], z = p[i + 2];
      for (let k = 0; k < 3; k++) t[i + k] = O[k] + x * U[k] + y * V[k] + z * N[k];
    }
    bag.add(mat, fromTriangles(t));
  }
}

/**
 * One ball player in relief, in profile, facing +x (f = 1) or −x (f = −1), his feet at (x, 0): the
 * legs striding, the protective yoke at the waist and the pad on one knee, the body, the head under a
 * tall plumed headdress, the forward arm out. pose: 'walk' | 'victor' (knife and head held up) |
 * 'beheaded' (kneeling, the serpents and the vine rising from the neck).
 */
function player(k, s, x, f, pose, d = 0.09) {
  const z = d / 2, R = (a, b, w, h = z, w1 = w) => k.seg(s, [x + f * a[0], a[1], h], [x + f * b[0], b[1], h], w, h, w1, h);
  if (pose === 'beheaded') {
    // kneeling toward the ball: the thigh forward, the shin down and back, the body upright, no head
    R([0, 0.62], [0.32, 0.5], 0.08); R([0.32, 0.5], [0.3, 0.06], 0.07); R([0, 0.62], [-0.14, 0.08], 0.07); R([-0.14, 0.08], [-0.42, 0.06], 0.06);
    k.bx(s, x - 0.17, x + 0.17, 0.58, 0.72, 0, d * 1.25);                                               // the yoke
    R([0, 0.66], [0.02, 1.08], 0.15, z, 0.13);                                                          // the body
    R([0.04, 1.02], [0.26, 0.82], 0.05); R([0.26, 0.82], [0.4, 0.92], 0.045);                           // the arm, hanging forward
    // six serpents writhing up from the neck, and the vine between them with its flowers
    for (let i = 0; i < 6; i++) {
      const a = (i - 2.5) * 0.22, b = 0.18 + 0.06 * (i % 3), sx = Math.sin(a), cy = Math.cos(a);
      const p0 = [0.02, 1.1], p1 = [0.02 + sx * b, 1.1 + cy * b], p2 = [0.02 + sx * b * 2.4 + f * 0.05, 1.1 + cy * b * 2.2], p3 = [0.02 + sx * b * 3.2, 1.1 + cy * b * 3.1];
      R(p0, p1, 0.035); R(p1, p2, 0.03); R(p2, p3, 0.026);
      k.bx(s, x + f * p3[0] - 0.05, x + f * p3[0] + 0.05, p3[1] - 0.03, p3[1] + 0.05, 0, d * 1.1);     // the head
    }
    R([0.02, 1.1], [0.0, 1.9], 0.025);
    for (const [vy, vx] of [[1.4, -0.12], [1.6, 0.12], [1.82, -0.06]]) { R([0.0, vy - 0.06], [vx, vy], 0.02); k.disc(s, x + f * vx, vy, d * 0.3, 0.06, d * 0.8, 8); }
    return;
  }
  R([0, 0.78], [0.16, 0.08], 0.075, z, 0.06); R([0, 0.78], [-0.16, 0.08], 0.075, z, 0.06);              // the legs, striding
  k.bx(s, x + f * 0.1 - 0.07, x + f * 0.1 + 0.07, 0.36, 0.5, 0, d * 1.3);                              // the knee pad
  for (const fx of [0.16, -0.16]) k.bx(s, x + f * (fx + 0.06) - 0.09, x + f * (fx + 0.06) + 0.09, 0.04, 0.12, 0, d);   // the feet
  k.bx(s, x - 0.19, x + 0.19, 0.72, 0.88, 0, d * 1.3);                                                  // the yoke
  R([0, 0.86], [0.01, 1.22], 0.14, z, 0.13);                                                            // the body
  k.bx(s, x - 0.09, x + 0.09, 1.24, 1.44, 0, d);                                                        // the head
  k.bx(s, x + f * 0.1 - 0.03, x + f * 0.1 + 0.03, 1.3, 1.38, 0, d * 0.8);                               // the nose
  for (let i = 0; i < 5; i++) R([-0.02, 1.42], [-0.3 + i * 0.05, 1.72 + 0.08 * Math.sin(i * 0.9)], 0.04, z * 0.8, 0.025);   // the plumes
  k.disc(s, x - f * 0.02, 1.33, d * 0.3, 0.05, d * 0.9, 8);                                             // the ear spool
  if (pose === 'victor') {
    R([0.05, 1.18], [0.24, 1.36], 0.045); R([0.24, 1.36], [0.36, 1.5], 0.02);                           // the knife held up
    R([-0.03, 1.18], [0.2, 1.04], 0.045);
    k.bx(s, x + f * 0.28 - 0.08, x + f * 0.28 + 0.08, 0.92, 1.1, 0, d * 1.1);                           // the head in his hand
  } else {
    R([0.05, 1.18], [0.27, 1.02], 0.045);                                                               // the arm out, holding a handstone
    k.bx(s, x + f * 0.3 - 0.05, x + f * 0.3 + 0.05, 0.96, 1.06, 0, d * 1.2);
  }
}

/**
 * The relief panel of a bench, `w` long and `h` up the slope, its lower edge on y = 0: a raised frame,
 * the skull-ball in the middle with the speech scroll from its mouth, the beheaded player on its
 * right kneeling toward it, the sacrificer on its left, six more players behind each.
 */
export function ballPanelKit(w = 12, h = 1.95, s = 'limestone_maya') {
  return carved(`ballpanel:${w}:${h}:${s}`, (k) => {
    const d = 0.09, hw = w / 2;
    k.bx(s, -hw, hw, 0, 0.12, 0, d); k.bx(s, -hw, hw, h - 0.12, h, 0, d);                              // the frame
    k.bx(s, -hw, -hw + 0.12, 0.12, h - 0.12, 0, d); k.bx(s, hw - 0.12, hw, 0.12, h - 0.12, 0, d);
    k.bx(s, -hw + 0.12, hw - 0.12, 0.12, 0.2, 0, d * 0.6);                                              // the ground line
    k.disc(s, 0, 0.62, 0, 0.36, d * 1.3, 16);                                                           // the ball, carved as a skull
    for (const sx of [-1, 1]) k.disc('lacquer_black', sx * 0.12, 0.68, d * 1.3, 0.07, 0.015, 8);        // its eye sockets
    k.bx('lacquer_black', -0.1, 0.1, 0.46, 0.5, d * 1.3, d * 1.3 + 0.015);                              // its teeth
    k.seg(s, [0.2, 0.9, d * 0.5], [0.42, 1.25, d * 0.5], 0.05, d * 0.5); k.seg(s, [0.42, 1.25, d * 0.5], [0.3, 1.45, d * 0.5], 0.04, d * 0.5);   // the speech scroll
    player(k, s, 0.95, -1, 'beheaded', d);
    player(k, s, -0.95, 1, 'victor', d);
    for (let i = 0; i < 6; i++) { player(k, s, 1.7 + i * 0.72, -1, 'walk', d); player(k, s, -1.7 - i * 0.72, 1, 'walk', d); }
  });
}

/**
 * A ring of the court, its hole facing +z, its back on z = 0: the ring with its square tenon in the
 * wall, each face carved with two feathered serpents twined round it, their heads meeting at the top.
 */
export function ringKit(R = 0.95, r = 0.3, t = 0.32, s = 'limestone_maya') {
  return carved(`ring:${R}:${r}:${t}:${s}`, (k) => {
    k.disc(s, 0, 0, 0, R, t, 28, r);                                                                    // the ring
    k.bx(s, -0.3, 0.3, -R - 0.05, -R + 0.25, -0.25, t * 0.6);                                           // the tenon's collar under it
    const n = 14, mid = (r + R) / 2, amp = (R - r) * 0.28;
    for (const ph of [0, Math.PI]) {
      const zz = t - 0.01, dz = 0.05;
      // a strand wavering in and out across the face, crossing its twin
      for (let i = 0; i < n; i++) {
        const a0 = Math.PI / 2 + 0.25 + (i / n) * (2 * Math.PI - 0.5), a1 = Math.PI / 2 + 0.25 + ((i + 1) / n) * (2 * Math.PI - 0.5);
        const r0 = mid + amp * Math.sin(i * 1.6 + ph), r1 = mid + amp * Math.sin((i + 1) * 1.6 + ph);
        k.seg(s, [Math.cos(a0) * r0, Math.sin(a0) * r0, zz + dz / 2], [Math.cos(a1) * r1, Math.sin(a1) * r1, zz + dz / 2], 0.05, dz / 2 + 0.005);
      }
      // the two heads at the top, facing each other
      const side = ph ? 1 : -1, a = Math.PI / 2 + side * 0.22;
      k.bx(s, Math.cos(a) * mid - 0.08, Math.cos(a) * mid + 0.08, Math.sin(a) * mid - 0.07, Math.sin(a) * mid + 0.07, zz, zz + dz * 1.6);
    }
  });
}

/**
 * The jaguar throne (the Lower Temple of the Jaguars): a jaguar standing, its flat back the seat,
 * its head turned to face out (+z), its spots carved as discs; about 1.5 m long, 0.8 m to the seat.
 */
export function jaguarThroneKit(s = 'limestone_maya') {
  return carved(`jaguar:${s}`, (k) => {
    k.bx(s, -0.75, 0.75, 0, 0.12, -0.35, 0.35);                                                         // the base
    k.fz(s, [-0.68, 0.68, 0.46, 0.78], [-0.62, 0.62, 0.48, 0.8], -0.3, 0.3);                             // the body, its back the seat (x is its length)
    for (const [lx, lz] of [[-0.52, -0.2], [-0.52, 0.2], [0.52, -0.2], [0.52, 0.2]]) k.seg(s, [lx, 0.12, lz], [lx * 0.95, 0.5, lz * 0.9], 0.08, 0.08, 0.1, 0.1);   // the legs
    k.bx(s, 0.58, 0.9, 0.56, 0.92, -0.17, 0.17);                                                        // the head, turned out
    k.fz(s, [0.62, 0.86, 0.56, 0.78], [0.66, 0.84, 0.58, 0.72], 0.17, 0.3);                              // the muzzle
    for (const ez of [-0.11, 0.11]) k.bx(s, 0.66, 0.74, 0.92, 1.0, ez - 0.04, ez + 0.04);               // the ears
    for (const ex of [0.68, 0.8]) k.disc('lacquer_black', ex, 0.8, 0.3, 0.035, 0.02, 8);                // the eyes
    k.seg(s, [-0.66, 0.66, 0], [-0.98, 0.3, 0.05], 0.05, 0.05, 0.04, 0.04);                             // the tail
    for (let i = 0; i < 8; i++) for (const z0 of [0.29, -0.325]) k.disc(s, -0.5 + i * 0.14, 0.58 + 0.08 * (i % 2), z0, 0.04, 0.035, 8);   // the spots on both flanks
  });
}
