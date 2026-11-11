// The working quarry (docs/settlements/giza.md §11): the benches cut down into the plateau south of the boat pits, the
// blocks marked out by narrow trenches and still joined to the bedrock below, others levered loose and left lying, the
// heaps of chips and sand, the quarrymen's tools, and the road of timber sleepers by which the sledges leave the quarry.
// Elements: ok_quarry { blocks: [{ x, y, z, a, b, h, kind: 'cut' | 'loose' | 'rough' | 'heap', rot }] } (y: the ground's
// height there), ok_track { pts: [[x, y, z] …], w } (the sleeper road, following the ground), ok_tools { at: [[x, y, z, kind]] }.

import { box, lathe } from '../../core/geom.js';
import { beamTris } from '../ming/index.js';
import { fromTriangles } from '../../core/geom.js';

export function quarry(el, { bag, col }) {
  for (const b of el.blocks) {
    const { x, y, z } = b, a = b.a ?? 0.65, d = b.b ?? 0.65, h = b.h ?? 0.9;
    if (b.kind === 'heap') {
      bag.add('rubble', lathe([[a, 0], [a * 0.8, h * 0.45], [a * 0.4, h * 0.85], [0.01, h]], 9, null, x, y - 0.1, z));
      continue;
    }
    if (b.kind === 'rough') {
      // a block of fifty or a hundred tons roughed out in the bedrock: a trench cut all round, its top still rough
      bag.add('limestone_core', box(x - a, y - 0.4, z - d, x + a, y + h, z + d));
      bag.add('limestone_carved', box(x - a + 0.3, y + h, z - d + 0.3, x + a - 0.4, y + h + 0.22, z + d - 0.5));
      for (let k = 0; k < 4; k++) bag.add('rock', box(x - a - 0.04, y + 0.3, z - d + 0.5 + k * (d * 2 - 1) / 3.5, x - a + 0.2, y + 0.62, z - d + 0.9 + k * (d * 2 - 1) / 3.5));   // the sockets for the levers
      col.rect([x - a, z - d, x + a, z + d], y - 0.4, y + h + 0.2);
      continue;
    }
    if (b.kind === 'loose') {
      // levered out of its bed: tilted a little on the chips, one corner up
      bag.add('limestone_core', box(x - a, y - 0.05, z - d, x + a, y + h * 0.8, z + d));
      bag.add('limestone_core', box(x - a * 0.92, y + h * 0.8, z - d * 0.92, x + a * 0.92, y + h * 0.95, z + d * 0.92));
      bag.add('timber', box(x + a, y - 0.05, z - 0.15, x + a + 2.4, y + 0.1, z + 0.15));              // the lever left under it
      col.rect([x - a, z - d, x + a, z + d], y - 0.05, y + h);
      continue;
    }
    // a block marked out: a face of cut stone in its trench, the sockets cut along its foot for the levers
    bag.add('limestone_core', box(x - a, y - 0.35, z - d, x + a, y + h, z + d));
    bag.add('limestone_carved', box(x - a + 0.04, y + h, z - d + 0.04, x + a - 0.04, y + h + 0.06, z + d - 0.04));
    if (b.kind === 'cut') bag.add('rock', box(x - a - 0.03, y + 0.05, z - 0.18, x - a + 0.12, y + 0.3, z + 0.18));
    col.rect([x - a, z - d, x + a, z + d], y - 0.35, y + h + 0.06);
  }
}

/** The sleeper road: logs of palm laid across at every 0.8 m, the road between them dusted with sand, posts at the sides
 *  (the sledge's rope was made fast to them) — the road following the ground. */
export function track(el, { bag }) {
  const P = el.pts, w = (el.w ?? 3.6) / 2;
  const T = [], Q = [];
  for (let i = 0; i < P.length - 1; i++) {
    const [ax, ay, az] = P[i], [bx, by, bz] = P[i + 1], L = Math.hypot(bx - ax, bz - az), n = Math.max(1, Math.round(L / 0.85));
    const ux = (bx - ax) / L, uz = (bz - az) / L, nx = -uz, nz = ux;
    for (let k = 0; k < n; k++) {
      const t = (k + 0.5) / n, x = ax + (bx - ax) * t, z = az + (bz - az) * t, y = ay + (by - ay) * t;
      bag.add('palm_trunk', lathe([[0.1, -w], [0.1, w]], 6).rotateX(Math.PI / 2).rotateY(Math.atan2(nx, nz)).translate(x, y + 0.09, z));
    }
    if (i % 3 === 0) for (const s of [-1, 1]) {
      const px = ax + nx * (w + 0.35) * s, pz = az + nz * (w + 0.35) * s;
      beamTris(Q, [px, ay - 0.1, pz], [px, ay + 1.15, pz], 0.1, 0.1);
    }
  }
  bag.add('timber', fromTriangles(Q));
  void T;
}

/** Tools and the quarrymen's belongings, here and there: mallets of wood, copper chisels, dolerite pounders, water jars. */
export function tools(el, { bag }) {
  for (const [x, y, z, k] of el.at) {
    if (k === 'jar') bag.add('terracotta', lathe([[0.001, 0], [0.12, 0.02], [0.27, 0.3], [0.2, 0.55], [0.1, 0.68], [0.13, 0.74], [0.001, 0.74]], 10, null, x, y, z));
    else if (k === 'pounder') { bag.add('granite_black', lathe([[0.001, 0], [0.12, 0.04], [0.15, 0.13], [0.1, 0.24], [0.001, 0.26]], 8, null, x, y - 0.02, z)); bag.add('granite_black', lathe([[0.001, 0], [0.1, 0.03], [0.12, 0.1], [0.08, 0.19], [0.001, 0.2]], 8, null, x + 0.3, y - 0.02, z + 0.2)); }
    else if (k === 'mallet') { bag.add('timber', box(x - 0.14, y, z - 0.07, x + 0.14, y + 0.12, z + 0.07)); bag.add('timber', box(x + 0.14, y + 0.03, z - 0.02, x + 0.55, y + 0.08, z + 0.03)); bag.add('copper', box(x - 0.5, y, z + 0.25, x - 0.2, y + 0.025, z + 0.3)); bag.add('copper', box(x - 0.45, y, z + 0.36, x - 0.17, y + 0.025, z + 0.41)); }
    else if (k === 'lever') bag.add('timber', box(x, y, z - 0.07, x + 2.6, y + 0.14, z + 0.07));
  }
}
