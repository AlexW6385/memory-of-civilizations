// Chichén Itzá, c. 1000 — the visitor's walk (docs/settlements/chichen-itza.md §19.1). Pure data and functions of layout.js (no three.js).
// From the arrival on the Great Plaza's south side the visitor walks north to the Castillo's stair between the stelae and the plaza's two markets,
// east and west along the markets' lanes, and south across the plaza to the street along the plaza's south edge, where seven house lots of the
// families who serve the plaza have their gates (layout.js: the solares of z 126–143). Each of their houses and long houses is entered by its door.
import { lots } from './layout.js';

export const ARRIVAL = [0, 62];
/** The walk's lines [x, z], along the middle of the way. */
export const WALK = [
  [[0, 66], [0, 37]],                    // the Castillo's south stair
  [[-8, 61.5], [-38, 61.5]],             // the west market's lane (rows of sellers at z 58 and 65)
  [[8, 57.5], [92, 57.5]],               // the east market's lane (rows at z 54 and 61)
  [[0, 66], [0, 121]],                   // south across the plaza
  [[-68, 123], [150, 123]],              // the street along the plaza's south edge
];
export const WALK_REACH = 10;
export function segDist(p, a, b) {
  const vx = b[0] - a[0], vz = b[1] - a[1], l2 = vx * vx + vz * vz, t = Math.max(0, Math.min(1, ((p[0] - a[0]) * vx + (p[1] - a[1]) * vz) / l2));
  return Math.hypot(p[0] - a[0] - vx * t, p[1] - a[1] - vz * t);
}
/** The distance of a point from the walk. */
export function walkDistance(p) { let best = Infinity; for (const W of WALK) for (let i = 0; i + 1 < W.length; i++) best = Math.min(best, segDist(p, W[i], W[i + 1])); return best; }

/** Is this lot one of the street's seven (its gate on its north side, z 126)? */
export const onStreet = (l) => l.rect[1] === 126 && l.gate === 0;

/** The door of an oval house { c, a, b, dir } nearest to a point: { at (in the wall), n (outward) }. The doors are in the middle of the long sides. */
export function doorOf(h, p) {
  const alongX = h.dir !== 'z', [cx, cz] = h.c, ds = alongX ? [[0, -1], [0, 1]] : [[-1, 0], [1, 0]];
  const cand = ds.map((n) => ({ at: [cx + n[0] * h.b, cz + n[1] * h.b], n }));
  return cand.sort((u, v) => Math.hypot(u.at[0] - p[0], u.at[1] - p[1]) - Math.hypot(v.at[0] - p[0], v.at[1] - p[1]))[0];
}

/**
 * The routes into the opened places of the street's lots: [{ lot, kind: 'house' | 'range', route: [[x, z], …] }], from the street through the gate,
 * past the door and into the room. Houses: the lane from the gate to the door's outer side, over the step and in to the room's middle; long houses: the
 * platform's stair at the front (turned toward the gate side) and the middle door.
 */
export function lotRoutes() {
  const out = [];
  lots().forEach((l, li) => {
    if (!onStreet(l)) return;
    const [x0, z0, x1] = l.rect, xm = (x0 + x1) / 2, street = [xm, z0 - 3.5], lane = z0 + 1.7;
    for (const h of l.houses) {
      const d = doorOf(h, [xm, z0]), [px, pz] = d.at, [nx, nz] = d.n, outer = [px + nx * 2.4, pz + nz * 2.4];
      const route = [street, [xm, lane + 0.5], [xm, outer[1]], outer, [px + nx * 0.5, pz + nz * 0.5], [px - nx * 0.6, pz - nz * 0.6], [h.c[0] - nx * 0.2, h.c[1] - nz * 0.2]];
      out.push({ lot: li, kind: 'house', route, house: h });
    }
    if (l.range) {
      const r = l.range, [cx, cz] = r.c, sg = Math.cos(r.rot) > 0 ? 1 : -1;      // the front toward +z at rot 0, toward −z at rot π
      const foot = sg < 0 ? Math.max(cz + sg * (r.b + 4.5), lane + 0.5) : cz + sg * (r.b + 4.5), top = cz + sg * (r.b + 1.5), door = cz + sg * r.b;
      const route = [street, [xm, foot], [cx, foot], [cx, top], [cx, door + sg * 0.5], [cx, cz + sg * 0.6]];
      out.push({ lot: li, kind: 'range', route, range: r });
    }
  });
  return out;
}
/** Circles { c, r } the lots' yards keep clear along the routes of a lot. */
export function laneKeep(l) {
  const li = lots().indexOf(l), K = [];
  if (!onStreet(l)) return K;
  for (const q of lotRoutes()) {
    if (q.lot !== li) continue;
    const R = q.route;
    for (let i = 1; i + 1 < R.length; i++) {
      const a = R[i], b = R[i + 1], n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 1.4));
      for (let k = 0; k <= n; k++) K.push({ c: [a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n], r: 1.5 });
    }
  }
  return K;
}
