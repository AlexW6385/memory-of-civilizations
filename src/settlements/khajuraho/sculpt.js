// The carved figures of Kandariya Mahadeva in levels of detail by distance and by the ways people walk (docs/settlements/khajuraho.md §17):
// the faces people come to first — the south, along which the terrace is walked, and the east, by the stair — have their figures, niche gods and
// procession in full (modelled figures, continuous relief) in plans shown within a distance of the face, and the same faces reduced beyond it;
// the north and west faces keep the reduced figures in the temple's own plan; the other temples have the old lathe figures.

import { RADIUS, TEMPLES } from './layout.js';

/** [sides, the face's centre, how near (m) the full level shows] of the temple's two walked faces. */
const FACES = [['s', 'south', 34], ['e', 'east', 28]];

export function sculptPlans() {
  const K = TEMPLES[0], [cx, cz] = K.c, W = K.w, T = [cx - W * 0.85, cz - W * 0.95, cx + K.len + 4, cz + W * 0.95];
  const centres = { s: [(T[0] + T[2]) / 2 - 4, cz + W * 0.42], e: [cx + K.len, cz] };
  const base = { style: 'nagara', origin: [0, 0], base: 0, yaw: 0, feature: true, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, 0], facing: 'w' }, nocollide: true };
  const plans = [];
  for (const [sides, name, near] of FACES) {
    plans.push({ ...base, id: `khajuraho-sculpt-${name}`, near, center: centres[sides], elements: [{ t: 'nagara_sculpture', temple: K, sides, lv: 2 }] });
    plans.push({ ...base, id: `khajuraho-sculpt-${name}-far`, far: near, center: centres[sides], elements: [{ t: 'nagara_sculpture', temple: K, sides, lv: 1 }] });
  }
  return plans;
}
