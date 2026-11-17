// Carved things of Lalibela (docs/settlements/lalibela.md §17): the lobed Greek cross cut in relief on the
// rock faces of the pits, the two horsemen overcoming the dragon over the west porch of Bete Maryam, the
// iron shackles set in the walls of Bete Mercoreus' pit. All are thin relief on a vertical face: a face
// frame { c: the point on the face, n: its outward unit normal } maps (lateral a, height, depth d) to the world.

import { orientedBox } from '../../core/build.js';
import { box, lathe, fromTriangles } from '../../core/geom.js';
import { rod } from './hut.js';

const TU = 'tuff_red', TH = 'tuff_hewn';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

export function faceFrame(c, n) {
  const u = [-n[1], n[0]];
  const P = (a, d) => [c[0] + u[0] * a + n[0] * d, c[1] + u[1] * a + n[1] * d];
  const P3 = (a, v, d) => { const q = P(a, d); return [q[0], v, q[1]]; };
  const block = (bag, mat, a0, a1, y0, y1, d0, d1) => bag.add(mat, orientedBox(P(a0, (d0 + d1) / 2), P(a1, (d0 + d1) / 2), d1 - d0, y0, y1));
  return { P, P3, block };
}

/**
 * The lobed Greek cross of Lalibela in relief on a face (the Lalibela cross: four arms each widening at its end, a boss at the
 * crossing): centred at lateral a, height y, arms of half-length s, standing 0.08 m proud of the face. Built so that no two
 * faces are coplanar: the bars stand 0.05 out, the flares and the boss further.
 */
export function crossRelief(bag, F, a, y, s, mat = TH) {
  const w = s * 0.13, f = w * 2.2, e = w * 1.6;
  const B = (a0, a1, y0, y1, d0, d1) => F.block(bag, mat, a + a0, a + a1, y + y0, y + y1, d0, d1);
  B(-w, w, -s, s, -0.01, 0.05);                                   // the upright
  B(-s, -w, -w, w, -0.01, 0.05); B(w, s, -w, w, -0.01, 0.05);    // the arms (the upright's width left out)
  B(-f, f, s - e, s, 0.03, 0.075); B(-f, f, -s, -s + e, 0.03, 0.075);         // the flared ends, top and foot
  B(-s, -s + e, -f, f, 0.03, 0.075); B(s - e, s, -f, f, 0.03, 0.075);         // and the arms' ends
  B(-w * 1.9, w * 1.9, -w * 1.9, w * 1.9, 0.045, 0.08);          // the boss
}

/**
 * rock_cross: a hewn square panel with the lobed cross on it, cut in the rock face of a pit { c, n (toward the cut), y (centre), s }.
 * The panel stands 0.04 out and is a shade paler than the rock, the cross in the rock's own red.
 */
export function rockCross(el, { bag }) {
  const F = faceFrame(el.c, el.n), s = el.s ?? 0.9, q = s * 1.3;
  F.block(bag, TH, -q, q, el.y - q, el.y + q, -0.02, 0.035);
  crossRelief(bag, F, 0, el.y, s, TU);
}

/**
 * horsemen: the relief over the west porch of Bete Maryam { c, n, y0 (panel's foot), w, h } — two mounted saints with haloes spearing a
 * dragon between them (ancient-history-sites: "above its entrance is a relief showing two horsemen defeating a dragon"). A framed panel, the
 * figures standing out from it: horses of rods for barrel, neck, head, legs and tail; riders with a halo and a long spear; the dragon an
 * S of tapering rods with a head, two wings and a tail.
 */
export function horsemen(bag, F, y0, w, h) {
  const a = w / 2;
  // the panel and its frame
  F.block(bag, TH, -a, a, y0, y0 + h, -0.02, 0.05);
  for (const [a0, a1, v0, v1] of [[-a - 0.1, a + 0.1, y0 - 0.1, y0], [-a - 0.1, a + 0.1, y0 + h, y0 + h + 0.1], [-a - 0.1, -a, y0, y0 + h], [a, a + 0.1, y0, y0 + h]]) F.block(bag, TU, a0, a1, v0, v1, -0.02, 0.1);
  const t = [], r6 = (p, q, r) => rod(t, F.P3(...p, 0.17), F.P3(...q, 0.17), r, 6);
  const V = (v) => y0 + v;                                         // heights above the panel's foot
  const ring = (ca, cv, rr, r) => { for (let k = 0; k < 12; k++) { const a0 = k / 12 * Math.PI * 2, a1 = (k + 1) / 12 * Math.PI * 2; rod(t, F.P3(ca + Math.cos(a0) * rr, V(cv + Math.sin(a0) * rr), 0.12), F.P3(ca + Math.cos(a1) * rr, V(cv + Math.sin(a1) * rr), 0.12), r, 4); } };
  // a horseman riding toward the middle: s = +1 faces +a, centred at lateral ax; scale k
  const rider = (ax, s, k) => {
    const A = (x, v) => [ax + s * x * k, V(v * k + (h - 2.0 * k) * 0.5 + 0.1)];      // the group stands on a common baseline in the panel
    const seg = (p, q, r) => r6(A(...p), A(...q), r * k);
    seg([-0.55, 0.62], [0.30, 0.66], 0.17);                       // the barrel
    seg([0.28, 0.72], [0.62, 1.12], 0.10);                        // the neck
    seg([0.62, 1.12], [0.84, 1.0], 0.07);                         // the head
    seg([0.60, 1.2], [0.52, 1.28], 0.025); seg([0.54, 1.2], [0.47, 1.26], 0.02);   // the ears and the forelock
    seg([0.3, 0.55], [0.52, 0.1], 0.04); seg([0.3, 0.55], [0.2, 0.06], 0.04);       // the forelegs, one raised
    seg([-0.5, 0.55], [-0.66, 0.08], 0.04); seg([-0.5, 0.55], [-0.3, 0.1], 0.04);   // the hind legs
    seg([-0.55, 0.78], [-0.85, 0.4], 0.03);                        // the tail
    seg([-0.05, 0.84], [-0.02, 1.4], 0.11);                        // the rider's body
    seg([-0.1, 0.78], [0.02, 0.5], 0.05);                          // his leg
    seg([0.0, 1.3], [0.4, 1.1], 0.035);                            // the arm
    seg([-0.2, 1.75], [1.15, 0.72], 0.022);                        // the spear, its point toward the dragon
    const [ha, hv] = A(-0.02, 1.52); F.block(bag, TU, ha - 0.07, ha + 0.07, hv - 0.07, hv + 0.07, 0.05, 0.2);   // the head
    ring(ha, hv + 0.0, 0.17 * k, 0.012);                           // the halo
  };
  const ax = a * 0.52, k = Math.min(1, (h - 0.3) / 2.0);
  rider(-ax, 1, k); rider(ax, -1, k);
  // the dragon: an S of rods from a tail curling at the foot to the head at the spears' meeting; two wings
  const D = (a1, v) => [a1, V(0.15 + v * k)], S = [[0.32, 0.0], [0.42, 0.2], [0.2, 0.42], [-0.18, 0.62], [-0.3, 0.88], [-0.05, 1.12], [0.18, 1.36], [0.1, 1.6]];
  for (let i = 0; i + 1 < S.length; i++) r6(D(...S[i]), D(...S[i + 1]), (0.075 - i * 0.006) * k);
  r6(D(0.1, 1.6), D(-0.12, 1.7), 0.05 * k); r6(D(-0.12, 1.7), D(-0.26, 1.64), 0.035 * k);   // the head and its jaw
  r6(D(0.2, 0.5), D(0.5, 0.95), 0.025 * k); r6(D(0.5, 0.95), D(0.42, 1.2), 0.022 * k); r6(D(0.5, 0.95), D(0.2, 0.7), 0.02 * k);   // a wing
  r6(D(-0.2, 0.7), D(-0.5, 1.1), 0.025 * k); r6(D(-0.5, 1.1), D(-0.42, 1.3), 0.022 * k); r6(D(-0.5, 1.1), D(-0.2, 0.9), 0.02 * k);
  bag.add(TU, fromTriangles(t));
}

/**
 * shackles: iron manacles on short chains set in a rock face { c, n, y (the staple), seed } — in Bete Mercoreus' pit ("iron shackles are
 * embedded in its surrounding trench, found at no other church", brilliant-ethiopia): a square staple plate, a chain of links hanging, a pair
 * of open cuffs at its end.
 */
export function shackles(el, { bag }) {
  const F = faceFrame(el.c, el.n), rand = rng(el.seed || 3), t = [], y = el.y;
  const link = (a, v, tilt) => { const q = tilt ? 0.045 : 0.03; F.block(bag, 'iron', a - q * 0.5, a + q * 0.5, v - q, v + q, 0.02, 0.05); };
  F.block(bag, 'iron', -0.14, 0.14, y - 0.12, y + 0.12, 0.0, 0.035);                                 // the plate
  F.block(bag, 'iron', -0.05, 0.05, y - 0.05, y + 0.05, 0.035, 0.1);                                 // the ring-bolt
  for (const side of [-1, 1]) {
    let a = 0.0, v = y - 0.05;
    for (let k = 0; k < 6; k++) { link(a, v, k % 2); a += side * (0.035 + rand() * 0.006); v -= 0.07; }
    // the cuff: a ring of rods, open at the top
    const ca = a + side * 0.03, cv = v - 0.07;
    for (let k = 0; k < 9; k++) { const a0 = 0.7 + k / 9 * (Math.PI * 2 - 1.4), a1 = 0.7 + (k + 1) / 9 * (Math.PI * 2 - 1.4); rod(t, F.P3(ca + Math.sin(a0) * 0.075, cv + Math.cos(a0) * 0.075, 0.07), F.P3(ca + Math.sin(a1) * 0.075, cv + Math.cos(a1) * 0.075, 0.07), 0.013, 4); }
  }
  bag.add('iron', fromTriangles(t));
}

/** A free-standing cross on a ridge end (a lobed Greek cross of dressed stone, on a small block): at [x, z] standing on y, its face toward ±x (or ±z when alongZ). */
export function ridgeCross(bag, x, z, y, s = 0.55, alongZ = false) {
  const n = alongZ ? [0, 1] : [1, 0], F = faceFrame([x, z], n), w = s * 0.14, f = w * 2.2, e = w * 1.6, yc = y + 0.2 + s;
  bag.add(TH, box(x - 0.2, y, z - 0.2, x + 0.2, y + 0.2, z + 0.2));
  const B = (a0, a1, y0, y1) => F.block(bag, TH, a0, a1, yc + y0, yc + y1, -0.06, 0.06);
  B(-w, w, -s, s); B(-s, -w, -w, w); B(w, s, -w, w);
  F.block(bag, TH, -f, f, yc + s - e, yc + s, -0.08, 0.08); F.block(bag, TH, -f, f, yc - s, yc - s + e, -0.08, 0.08);
  F.block(bag, TH, -s, -s + e, yc - f, yc + f, -0.08, 0.08); F.block(bag, TH, s - e, s, yc - f, yc + f, -0.08, 0.08);
}
void lathe;
