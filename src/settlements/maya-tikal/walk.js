// Tikal c. 750 — the visitor's walk (docs/settlements/maya-tikal.md §16). Pure data and small functions of layout.js (no three.js): the ways a visitor takes from the
// arrival in the Great Plaza to the principal sights, and the routes walk-check follows into the opened places on them (the craftsmen's houses west of Temple II, the
// vaulted rooms of the North and Central Acropolis, the market hall on the East Plaza). The way west is the Tozzer causeway; the way east is the Maler causeway and the
// market's own street (x 100); the acropolises are climbed by their great stairs.
import { groups, T1, T2, NA, CA } from './layout.js';

export const ARRIVAL = [-18, 28];
/** A deterministic 0…1 from a position (no counters, no Math.random): used wherever a repeated thing must differ from its neighbours. */
export function hashAt(x, z, s = 0) {
  let h = (Math.round(x * 16) * 73856093) ^ (Math.round(z * 16) * 19349663) ^ Math.imul(s + 1, 83492791);
  h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
/** The walk's lines [x, z] (the middle of each way). */
export const WALK = [
  [[-18, 28], [-18, 33], [-80, 33]],                // west along the Tozzer causeway to the craftsmen's quarter beside Temple II
  [[-18, 28], [20, 0], [34, 0]],                    // to Temple I's stair
  [[-18, 28], [-34, 0]],                            // to Temple II's stair
  [[-18, 28], [-9, 40], [-9, 46]],                  // to the Central Acropolis' stair
  [[-18, 28], [0, -38], [0, -54]],                  // to the North Acropolis' great stair
  [[36, -30], [100, -30], [100, 24]],               // east by the Maler causeway and the market's street
];
export const WALK_REACH = 12;
const segDist = (p, a, b) => { const vx = b[0] - a[0], vz = b[1] - a[1], l2 = vx * vx + vz * vz || 1, t = Math.max(0, Math.min(1, ((p[0] - a[0]) * vx + (p[1] - a[1]) * vz) / l2)); return Math.hypot(p[0] - a[0] - vx * t, p[1] - a[1] - vz * t); };
/** The distance of a point from the walk. */
export function walkDistance(p) { let d = Infinity; for (const W of WALK) for (let i = 0; i + 1 < W.length; i++) d = Math.min(d, segDist(p, W[i], W[i + 1])); return d; }

// a frame: the point (fx, fz) the middle of a front looking `face`; u runs into the building (as styles/tikal/kit.js frame)
export function frame(face, fx, fz) {
  const U = { w: [1, 0], e: [-1, 0], n: [0, 1], s: [0, -1] }[face], V = face === 'w' || face === 'e' ? [0, 1] : [1, 0];
  return { U, V, P: (u, v) => [fx + U[0] * u + V[0] * v, fz + U[1] * u + V[1] * v], R: (u0, u1, v0, v1) => { const a = [fx + U[0] * u0 + V[0] * v0, fz + U[1] * u0 + V[1] * v0], b = [fx + U[0] * u1 + V[0] * v1, fz + U[1] * u1 + V[1] * v1]; return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; } };
}
/** The frame of a house's door wall (the middle of the wall the door is in), as styles/tikal/index.js house() builds it. */
export function houseFrame(h) {
  const [cx, cz] = h.c, side = h.door;
  return { F: frame(side, ...(side === 'n' ? [cx, cz - h.d / 2] : side === 's' ? [cx, cz + h.d / 2] : side === 'w' ? [cx - h.w / 2, cz] : [cx + h.w / 2, cz])), depth: side === 'n' || side === 's' ? h.d : h.w, along: side === 'n' || side === 's' ? h.w : h.d };
}
export const PLATFORM = 0.42;

/** The craftsmen's quarter's groups (layout.js: three, west of Temple II) with their houses: [{ g, houses }]. */
export const quarter = () => groups().filter((g) => g.ward);

// ── the palace ranges that are opened (the geometry of styles/tikal/index.js range()) ──
const RW = 4.2, PT = 1.1, TF = 1.2;
/** The rooms of a k_range element: [{ i, door: [x, z] (the middle of the doorway's outer face), F, vc }]. */
export function rangeRooms(e) {
  const n = e.n, rw = e.rw ?? RW, F = frame(e.face, ...e.c), Lv = n * rw + (n + 1) * PT, V0 = -Lv / 2, out = [];
  for (let i = 0; i < n; i++) { const vc = V0 + PT + i * (rw + PT) + rw / 2; out.push({ i, vc, F, door: F.P(0, vc) }); }
  return out;
}
/** A route into room i of a range (the route's waypoints [x, z]): before the door, the threshold, the room's front part. */
export function roomRoute(e, i, deep = 1.3) { const r = rangeRooms(e)[i]; return [r.F.P(-2.2, r.vc), r.F.P(-0.6, r.vc), r.F.P(0.8, r.vc), r.F.P(TF + deep * 0.5, r.vc), r.F.P(TF + deep, r.vc)]; }

// ── the ways to the opened places ──
const NAH = NA.H, CAH = CA.H;
// across the plaza by its open lanes (figures stand in the others), east by the Maler causeway and the market's street, along the lane between the first two rows of stalls
const EAST = [[-18, 28], [-14, 31], [16, 31], [16, 16], [16, -24], [22, -30], [36, -30], [100, -30], [101, 24], [101, 32.9], [135.3, 32.9]];
/** The routes of the visitor's walk: each { name, y0, pts }. The first waypoints bring the walker from the plaza to the place's approach. */
export function routes(planEls) {
  const R = [], find = (c) => planEls.find((e) => e.t === 'k_range' && e.c[0] === c[0] && e.c[1] === c[1]);
  // 1. the craftsmen's quarter: down the Tozzer causeway, off its south side, to the third group's east gate, round the shrine, to the court
  const Q = quarter(), g3 = Q.find((g) => g.rect[1] > 40), g1 = Q.find((g) => g.rect[1] < -20), g2 = Q.find((g) => g !== g3 && g !== g1);
  const into = (g, hk, via) => {
    const h = g.houses[hk], { F, depth } = houseFrame(h), cz = (g.rect[1] + g.rect[3]) / 2;
    // the first house of the north row lies beyond the porches' posts and the court's cistern: pass south of them, along the court's middle strip
    const det = via === north && hk === 1 ? [[g.rect[2] - 9, g.rect[1] + 9.5], [F.P(-1.6, 0)[0], g.rect[1] + 9.5]] : [];
    return { name: `craft house ${g.rect[1]}:${hk} (${h.craft})`, y0: 0, pts: [[-18, 28], [-18, 33], [-76, 33], ...via(g, cz), ...det, F.P(-1.6, 0), F.P(-0.3, 0), F.P(0.7, 0), F.P(Math.min(depth - 1.4, 1.0), 0)] };
  };
  // the way from the causeway to a group's court: down to the ground east of the group, through the east gate, north of the shrine
  const north = (g, cz) => [[g.rect[2] + 3, 36], [g.rect[2] + 3, cz], [g.rect[2] - 1, cz], [g.rect[2] - 1.6, g.rect[1] + 6.7], [g.rect[2] - 9, g.rect[1] + 6.7]];
  if (g3) for (const k of [0, 1, 2, 3, 4]) R.push(into(g3, k, north));
  if (g2) for (const k of [0, 1, 2, 3, 4]) R.push(into(g2, k, (g, cz) => [[g.rect[2] + 3, 36], [g.rect[2] + 3, cz], [g.rect[2] - 1, cz], [g.rect[2] - 1.6, g.rect[3] - 6.7], [g.rect[2] - 9, g.rect[3] - 6.7]]));
  if (g1) for (const k of [0, 1, 2, 3, 4]) R.push(into(g1, k, (g, cz) => [[g.rect[2] + 3, 36], [g.rect[2] + 3, cz], [g.rect[2] - 1, cz], [g.rect[2] - 1.6, g.rect[3] - 6.7], [g.rect[2] - 9, g.rect[3] - 6.7]]));
  // 2. the vaulted rooms of the acropolises: up the great stairs, along the terraces
  const nr1 = find([-24, -76]), nr2 = find([24, -76]), cb1 = find([-34, 123]), mh = find([141, 43]);
  if (nr1) R.push({ name: 'north terrace, west range', y0: 0, pts: [[-18, 28], [-12, -36], [0, -41], [0, -56], [-20, -57], [-21, -66], ...roomRoute(nr1, 1)] });
  if (nr2) R.push({ name: 'north terrace, east range', y0: 0, pts: [[-18, 28], [-12, -36], [0, -41], [0, -56], [20, -57], [21, -66], ...roomRoute(nr2, 1)] });
  // 3. the market hall: east by the Maler causeway, down the market's street, across the East Plaza
  if (mh) for (const k of [0, 1, 2, 3, 4, 5, 6, 7]) R.push({ name: `market hall room ${k}`, y0: 0, pts: [...EAST, [135.3, rangeRooms(mh)[k].door[1]], ...roomRoute(mh, k)] });
  void T1; void T2; void NAH; void CAH; void cb1;
  return R;
}
