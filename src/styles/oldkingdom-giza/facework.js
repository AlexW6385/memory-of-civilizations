// Works on the Great Pyramid's own faces (docs/settlements/giza.md §23): stepped stages of palm-pole and plank hung on the casing at the
// foot band, where the last courses were still being dressed and polished, the ladders between them, reed-mat screens, and a porters'
// ramp of rubble and mud with sleepers rising from the court to the lowest stage. Pure builder of the element `ok_face_works`
// { c, a, h, y, bays: [{ f, u0, u1, v0, n }], ramp: { f, u, len, w, rise } }, f = 0 north, 1 south, 2 west, 3 east (as courses.js).

import { box, fromTriangles } from '../../core/geom.js';
import { beamTris } from '../ming/index.js';

const FACES = [{ n: [0, -1], t: [1, 0] }, { n: [0, 1], t: [1, 0] }, { n: [-1, 0], t: [0, 1] }, { n: [1, 0], t: [0, 1] }];
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

export function faceWorks(el, { bag, col }) {
  const [cx, cz] = el.c, a = el.a, h = el.h, y = el.y ?? 0, half = (v) => a * (1 - v / h);
  const P = (f, u, v, off) => { const F = FACES[f], d = half(v) + off; return [cx + F.n[0] * d + F.t[0] * u, y + v, cz + F.n[1] * d + F.t[1] * u]; };
  // an axis-aligned box on face f from u0..u1 along it, off0..off1 out from the casing's line at height v, v..v+hh
  const slab = (mat, f, u0, u1, off0, off1, v, hh) => {
    const A = P(f, u0, v, off0), B = P(f, u1, v, off1);
    bag.add(mat, box(Math.min(A[0], B[0]), y + v, Math.min(A[2], B[2]), Math.max(A[0], B[0]), y + v + hh, Math.max(A[2], B[2])));
  };
  const rand = rng(el.seed || 5), L = [], R = [];
  for (const bay of el.bays) {
    const { f, u0, u1, v0, n = 3 } = bay;
    for (let s = 0; s < n; s++) {
      const v = v0 + s * 3.4;
      slab('timber', f, u0, u1, 0.18, 1.7, v, 0.1);                                           // the deck of planks
      slab('timber', f, u0 + 0.01, u1 - 0.01, 0.0, 0.18, v + 0.02, 0.06);                      // the plank ends laid on the casing's courses
      for (let u = u0 + 0.3; u < u1; u += 2.4) beamTris(L, P(f, u, v - 2.3, 0.1), P(f, u, v - 0.05, 1.55), 0.07, 0.1);   // the raking brace under each bearer
      for (const off of [1.45, 1.66]) beamTris(L, P(f, u0, v - 0.1, off), P(f, u1, v - 0.1, off), 0.08, 0.12);        // the ledgers along the outer edge
      slab('reed_mat', f, u0, u1, 1.66, 1.7, v + 0.1, 1.05 - (rand() < 0.3 ? 0.5 : 0));        // the screen of mats against the wind and the sun
      // the ladder to the stage above: two rails lying on the face with their rungs, at each end and the middle
      if (s + 1 < n) for (const u of [u0 + 0.8, (u0 + u1) / 2 + 1.1, u1 - 1.4]) {
        for (const du of [-0.28, 0.28]) beamTris(L, P(f, u + du, v + 0.05, 0.3), P(f, u + du, v + 3.4, 0.3), 0.045, 0.06);
        for (let r = 0.4; r < 3.3; r += 0.45) beamTris(R, P(f, u - 0.28, v + r, 0.36), P(f, u + 0.28, v + r, 0.36), 0.03, 0.04);
      }
      // a stack of casing stones' worth of bundled reed and a rope coil left on the deck
      const ub = u0 + 1.2 + rand() * (u1 - u0 - 2.4);
      slab('rope_fibre', f, ub, ub + 0.5, 0.6, 1.1, v + 0.1, 0.18);
    }
    // the poles standing on the ground at the stage's ends, lashed to the lowest bearer
    for (const u of [u0 + 0.1, u1 - 0.1]) beamTris(L, P(f, u, 0, 1.5), P(f, u, v0 + 0.1, 1.5), 0.08, 0.1);
  }
  bag.add('palm_trunk', fromTriangles(L)); bag.add('rope_fibre', fromTriangles(R));
  // the porters' ramp: a stepped wedge of rubble (steps 0.4 m) with a skin of mud and sleepers across, rising to the lowest stage
  if (el.ramp) {
    const { f, u, len, w, rise } = el.ramp, steps = Math.round(rise / 0.4), sl = [];
    for (let k = 0; k < steps; k++) {
      const o0 = 0.3 + (len * k) / steps, o1 = 0.3 + (len * (k + 1)) / steps, top = rise - (rise * k) / steps;      // k = 0 at the face (high)
      const A = P(f, u - w / 2, 0, o0), B = P(f, u + w / 2, 0, o1);
      bag.add(k % 2 ? 'rubble' : 'mud_plaster', box(Math.min(A[0], B[0]), y, Math.min(A[2], B[2]), Math.max(A[0], B[0]), y + top, Math.max(A[2], B[2])));
      const S1 = P(f, u - w / 2 + 0.2, 0, (o0 + o1) / 2 - 0.05), S2 = P(f, u + w / 2 - 0.2, 0, (o0 + o1) / 2 - 0.05);
      if (k % 2 === 0) beamTris(sl, [S1[0], y + top + 0.06, S1[2]], [S2[0], y + top + 0.06, S2[2]], 0.09, 0.08);
    }
    bag.add('palm_trunk', fromTriangles(sl));
    const A = P(f, u - w / 2, 0, 0.3), B = P(f, u + w / 2, 0, 0.3 + len);
    col.rect([Math.min(A[0], B[0]), Math.min(A[2], B[2]), Math.max(A[0], B[0]), Math.max(A[2], B[2])], y, y + rise);
  }
}
