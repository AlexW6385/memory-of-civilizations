// The great rivers of the open country (DESIGN §4.1: "the great rivers (Nile, Tigris–Euphrates,
// Indus, Ganges, Yangtze, Yellow River, Danube, Rhine, Amazon, Mississippi) as water you cannot
// wade"). Each is a coarse line of Earth's latitudes and longitudes from the mouth upstream (read
// off the atlas: the cities and bends it passes), carried onto the planet through the layout's map
// (src/planet/warp.js). The relief cuts a bed below the sea's level along it, so the sea's surface
// shows in it as the river; its banks fall to it over a few tens of metres.

import { mapEarth } from './warp.js';
import { unit, dot, cross, norm, angle } from './geo.js';
import { PLANET_RADIUS as R, SITES, BLEND } from './sites.js';
import { PLACED } from './layout.js';

/** [name, width (m on the planet), [lat, lon] from the mouth upstream]. */
const LINES = [
  ['Nile', 34, [[31.45, 31.0], [30.05, 31.25], [27.2, 31.2], [25.7, 32.65], [24.1, 32.9], [21.8, 31.3], [19.2, 30.5], [19.5, 33.3], [15.6, 32.5], [12.0, 32.7], [9.5, 31.6], [4.85, 31.6], [2.0, 31.3]]],
  ['Tigris', 22, [[30.5, 47.8], [31.0, 47.4], [32.5, 45.8], [33.3, 44.4], [34.2, 43.9], [36.3, 43.1], [37.9, 40.2]]],
  ['Euphrates', 24, [[31.0, 47.4], [31.05, 46.25], [31.3, 45.3], [32.5, 44.4], [33.35, 43.8], [33.6, 42.8], [34.45, 40.9], [35.95, 39.0], [37.0, 38.0], [38.8, 38.8]]],
  ['Indus', 30, [[24.0, 67.5], [25.4, 68.4], [27.7, 68.9], [30.0, 71.0], [33.9, 72.25], [35.5, 74.6], [34.15, 77.6]]],
  ['Ganges', 34, [[22.6, 90.4], [24.8, 87.9], [25.6, 85.1], [25.3, 83.0], [25.4, 81.9], [26.45, 80.35], [29.95, 78.15]]],
  ['Yangtze', 40, [[31.4, 121.7], [32.05, 118.8], [31.35, 118.4], [29.7, 116.0], [30.6, 114.3], [29.4, 113.1], [30.7, 111.3], [29.55, 106.55], [28.8, 104.6], [27.0, 100.2]]],
  ['Yellow River', 28, [[37.75, 119.2], [36.7, 117.0], [34.9, 114.3], [34.9, 113.6], [34.8, 111.2], [34.6, 110.3], [38.0, 110.5], [40.6, 110.0], [39.6, 106.8], [38.5, 106.3], [36.1, 103.8]]],
  ['Danube', 28, [[45.2, 29.6], [44.1, 27.3], [43.85, 25.95], [44.0, 22.9], [44.8, 20.45], [45.25, 19.85], [47.5, 19.05], [48.15, 17.1], [48.2, 16.4], [48.3, 14.3], [49.0, 12.1], [48.4, 10.0], [47.95, 8.5]]],
  ['Rhine', 22, [[51.9, 4.1], [51.85, 5.9], [51.43, 6.75], [50.94, 6.96], [50.36, 7.6], [50.0, 8.27], [49.5, 8.45], [48.58, 7.8], [47.56, 7.6], [47.6, 9.4]]],
  ['Amazon', 60, [[0.0, -50.0], [-2.4, -54.7], [-3.1, -60.0], [-3.35, -64.7], [-4.2, -69.9], [-3.75, -73.25]]],
  ['Mississippi', 36, [[29.15, -89.25], [29.95, -90.07], [30.45, -91.19], [32.35, -90.88], [35.15, -90.05], [37.0, -89.18], [38.63, -90.2], [41.5, -90.5], [43.8, -91.25], [44.98, -93.27]]],
];

/** The rivers' segments on the planet: { a, n (the arc's pole), t (along, at a), ang, half (width / 2), bank, cosCap, mid }. */
export const RIVERS = [];
// the settlements' discs: a river does not run through one (the layout moved them for room, so a
// river's true course may cross a disc that is not its own); it is bent round the disc's blend instead
const DISCS = SITES.filter((x) => PLACED[x.id]).map((x) => ({ c: unit(...PLACED[x.id]), r: (x.radius + BLEND + 40) / R }));
const slerp = (a, b, t, ang) => { const s0 = Math.sin((1 - t) * ang) / Math.sin(ang), s1 = Math.sin(t * ang) / Math.sin(ang); return norm([a[0] * s0 + b[0] * s1, a[1] * s0 + b[1] * s1, a[2] * s0 + b[2] * s1]); };
function skirt(P, w) {
  const out = [];
  for (let i = 0; i + 1 < P.length; i++) {
    const ang = angle(P[i], P[i + 1]), n = Math.max(1, Math.ceil(ang * R / 45));
    for (let k = 0; k < n; k++) out.push(slerp(P[i], P[i + 1], k / n, ang));
  }
  out.push(P[P.length - 1]);
  // meanders: each point moved off the line, a sum of two waves along the river's length
  let run = 0;
  const bent = out.map((u, i) => {
    if (i > 0) run += angle(out[i - 1], u) * R;
    const nx = out[Math.min(i + 1, out.length - 1)], pv = out[Math.max(i - 1, 0)], side = norm(cross(u, [nx[0] - pv[0], nx[1] - pv[1], nx[2] - pv[2]]));
    const k = Math.min(1, i / 4, (out.length - 1 - i) / 4), o = k * (w * 1.6 * Math.sin(run / (w * 4.5)) + w * 0.7 * Math.sin(run / (w * 1.9) + 1.3)) / R;
    return norm([u[0] + side[0] * o, u[1] + side[1] * o, u[2] + side[2] * o]);
  });
  return roundDiscs(bent, w);
}
/**
 * Round each disc: the points of a run inside it are replaced by points on its ring, from where the
 * river enters to where it leaves, the short way round (so a river through a disc's middle keeps to one side).
 */
export function roundDiscs(pts, w) {
  for (let pass = 0; pass < 4; pass++) for (const D of DISCS) {
    const need = D.r + w / R, inside = (u) => angle(u, D.c) < need;
    const N0 = Math.abs(D.c[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0], E = norm(cross(N0, D.c)), Nn = cross(D.c, E);
    const az = (u) => Math.atan2(dot(u, E), dot(u, Nn));
    const ring = (q) => norm([0, 1, 2].map((i) => D.c[i] * Math.cos(need * 1.002) + (E[i] * Math.sin(q) + Nn[i] * Math.cos(q)) * Math.sin(need * 1.002)));
    for (let guard = 0; guard < 400; guard++) {
      const i = pts.findIndex(inside);
      if (i < 0) break;
      let j = i; while (j + 1 < pts.length && inside(pts[j + 1])) j++;
      const a0 = az(pts[Math.max(0, i - 1)]); let a1 = az(pts[Math.min(pts.length - 1, j + 1)]);
      while (a1 - a0 > Math.PI) a1 -= 2 * Math.PI; while (a1 - a0 < -Math.PI) a1 += 2 * Math.PI;
      const n = Math.max(2, Math.ceil(Math.abs(a1 - a0) * need * R / 40));
      const arc = []; for (let k = 1; k <= n; k++) arc.push(ring(a0 + (a1 - a0) * k / (n + 1)));
      pts = pts.slice(0, i).concat(arc, pts.slice(j + 1));
    }
  }
  return pts;
}
for (const [name, w, pts] of LINES) {
  const P = skirt(pts.map(([la, lo]) => mapEarth(unit(la, lo))), w);
  for (let i = 0; i + 1 < P.length; i++) {
    const a = P[i], b = P[i + 1], ang = angle(a, b);
    if (ang < 1e-9) continue;
    const n = norm(cross(a, b)), t = norm(cross(n, a)), m = norm([a[0] + b[0], a[1] + b[1], a[2] + b[2]]);
    RIVERS.push({ name, a, n, t, ang, half: w / 2, bank: 26, mid: m, cosCap: Math.cos(ang / 2 + (w / 2 + 60) / R) });
  }
}

// The segments by cell of a grid over the unit cube (CELL wide): each listed in every cell its cap
// (dot(u, mid) ≥ cosCap) can reach, in order — riverAt tests only those of u's cell, the same
// segments in the same order that passed the cap test before. (It tested all ~1100 at each ground
// vertex: a fifth of the time of building the ground's tiles.)
const CELL = 0.02, GRID = new Map();
const cellOf = (x) => Math.floor((x + 1) / CELL);
const gkey = (i, j, k) => (i * 128 + j) * 128 + k;
for (const s of RIVERS) {
  // |u − mid| ≤ the cap's angle on each axis for every u in the cap (a chord is no longer than its arc)
  const c = Math.acos(Math.max(-1, Math.min(1, s.cosCap))) + 1e-6, m = s.mid;
  for (let i = cellOf(m[0] - c); i <= cellOf(m[0] + c); i++)
    for (let j = cellOf(m[1] - c); j <= cellOf(m[1] + c); j++)
      for (let k = cellOf(m[2] - c); k <= cellOf(m[2] + c); k++) {
        const g = gkey(i, j, k);
        let L = GRID.get(g);
        if (!L) GRID.set(g, (L = []));
        L.push(s);
      }
}
const NONE = [];

/**
 * The nearest river to direction u: { d (m from its middle line), half, bank, name } or null when
 * none is within its bank. Segments meet at joints; distance past a segment's end is to the end.
 */
export function riverAt(u) {
  let best = null;
  for (const s of GRID.get(gkey(cellOf(u[0]), cellOf(u[1]), cellOf(u[2]))) || NONE) {
    if (dot(u, s.mid) < s.cosCap) continue;
    const along = Math.atan2(dot(u, s.t), dot(u, s.a));
    let d;
    // within the segment: off its line, less a meander (so the river bends between its points)
    if (along >= 0 && along <= s.ang) d = Math.abs(Math.asin(Math.max(-1, Math.min(1, dot(u, s.n))))) * R;
    else d = Math.min(angle(u, s.a), angle(u, [Math.cos(s.ang) * s.a[0] + Math.sin(s.ang) * s.t[0], Math.cos(s.ang) * s.a[1] + Math.sin(s.ang) * s.t[1], Math.cos(s.ang) * s.a[2] + Math.sin(s.ang) * s.t[2]])) * R;
    if (d > s.half + s.bank) continue;
    if (!best || d - s.half < best.d - best.half) best = { d, half: s.half, bank: s.bank, name: s.name };
  }
  return best;
}
