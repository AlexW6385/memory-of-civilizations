// A building's own frame (docs/settlements/timurid-samarkand.md §6): the courtyard houses are drawn once in a local frame
// (x across, z toward the street door, origin the lot's middle) and set on their lot turned by quarter turns, so
// that the street door can open on any of the lot's four lanes. The wrappers turn what the builders add: geometry,
// colliders (axis-aligned stay axis-aligned) and lights.

import { Matrix4 } from '../../core/three.js';
import { placeHanging } from '../../core/geom.js';

const DIRS = ['e', 's', 'w', 'n'];                                   // the ascent directions in turn: +x, +z, −x, −z

/** { bag, col, lights, P(x, z) → world [x, z] } for a frame at (cx, cz) turned k quarter turns (k = 0: local +z is world +z). */
export function frame(ctx, cx, cz, k) {
  const th = k * Math.PI / 2, c = Math.round(Math.cos(th)), s = Math.round(Math.sin(th));
  const M = new Matrix4().makeRotationY(th).setPosition(cx, 0, cz);
  const P = (x, z) => [cx + x * c + z * s, cz - x * s + z * c];
  const R = (r) => { const a = P(r[0], r[1]), b = P(r[2], r[3]); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; };
  const bag = { add: (m, g) => { if (!m) throw new Error('no material'); ctx.bag.add(m, placeHanging(g, M)); } };
  const col = {
    rect: (r, y0, y1) => ctx.col.rect(R(r), y0, y1),
    floor: (r, y, tag) => ctx.col.floor(R(r), y, tag),
    ramp: (r, y0, y1, dir) => {
      // the ascent's direction in the local frame (e = +x, s = +z, w = −x, n = −z) turned like the frame
      const i = (DIRS.indexOf(dir) + k) % 4;
      ctx.col.ramp(R(r), y0, y1, DIRS[i]);
    },
    segment: (a, b, th2, y0, y1) => ctx.col.segment(P(...a), P(...b), th2, y0, y1),
    circle: (x, z, r, y0, y1) => { const p = P(x, z); ctx.col.circle(p[0], p[1], r, y0, y1); },
  };
  const lights = ctx.lights ? { push: (l) => { const q = P(l.at[0], l.at[2]); ctx.lights.push({ ...l, at: [q[0], l.at[1], q[1]] }); } } : null;
  return { bag, col, lights, P, k };
}
