// Safavid Isfahan — wear and use (docs/settlements/isfahan.md §26.5): what a dry plateau, feet, smoke and birds do to the places. Geometry only, in materials
// the pieces already use (limestone, plaster_white, hide_black), each placed by a hash of its own place (no counters, no Math.random):
//  - the shop door's stone sill dished in the middle by the feet of the customers (5.5 cm at the ends, 3 cm at the middle, the arrises bevelled);
//  - the pigeons' droppings: pale streaks down the tower's wall from under some of the flight holes, longest under the upper rows;
//  - the kitchen's soot: a smear rising from the hood over the hearth up the plastered wall.
import { fromTriangles } from '../../core/geom.js';

/** A number in [0, 1) from a place alone. */
export const hash = (x, z, s = 0) => {
  let h = (Math.round(x * 16) * 73856093) ^ (Math.round(z * 16) * 19349663) ^ Math.imul(s + 1, 83492791);
  h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
};

/**
 * A worn sill across a door: P(s, d) maps a position along the door (s, from the middle) and across it (d, from the middle) to the plan; spans s ∈ [-hw, hw], d ∈ [-hd, hd],
 * its top 5.5 cm above `y` at the ends and 3 cm in the middle, the long arrises bevelled 1.8 cm, six steps along; no bottom, no end faces below the bevel (it sits on the floor).
 */
export function wornSill(bag, P, hw0, hd0, y, mat = 'limestone') {
  const c = P(0, 0), hw = hw0 * (0.94 + 0.1 * hash(c[0], c[1], 71)), hd = hd0 * (0.9 + 0.2 * hash(c[0], c[1], 72));   // each sill its own size by its place, so they do not fold into one instanced shape
  const out = [], N = 6, bev = 0.018, top = (s) => 0.055 - 0.026 * Math.exp(-(s / hw) * (s / hw) * 5);
  const V = (s, d, h) => { const p = P(s, d); return [p[0], y + h, p[1]]; };
  const q = (a, b, c, d) => out.push(...a, ...b, ...c, ...a, ...c, ...d);
  for (let i = 0; i < N; i++) {
    const s0 = -hw + 2 * hw * i / N, s1 = -hw + 2 * hw * (i + 1) / N, h0 = top(s0), h1 = top(s1);
    q(V(s0, -hd + bev, h0), V(s1, -hd + bev, h1), V(s1, hd - bev, h1), V(s0, hd - bev, h0));           // the top
    q(V(s0, -hd, h0 - bev), V(s1, -hd, h1 - bev), V(s1, -hd + bev, h1), V(s0, -hd + bev, h0));         // the bevel on one side
    q(V(s0, hd - bev, h0), V(s1, hd - bev, h1), V(s1, hd, h1 - bev), V(s0, hd, h0 - bev));             // and on the other
    q(V(s0, -hd, 0), V(s1, -hd, 0), V(s1, -hd, h1 - bev), V(s0, -hd, h0 - bev));                      // the faces
    q(V(s1, hd, 0), V(s0, hd, 0), V(s0, hd, h0 - bev), V(s1, hd, h1 - bev));
  }
  q(V(-hw, hd, 0), V(-hw, -hd, 0), V(-hw, -hd, top(-hw) - bev), V(-hw, hd, top(-hw) - bev));
  q(V(hw, -hd, 0), V(hw, hd, 0), V(hw, hd, top(hw) - bev), V(hw, -hd, top(hw) - bev));
  bag.add(mat, fromTriangles(out));
}

/**
 * Droppings on a dovecote's tapered wall (radius r at the foot, 0.96 r at height yw, centre x, z): under about 4 in 10 of the flight holes a pale streak, 0.7–2.4 m
 * long, 0.2–0.35 m wide at the top and drawn to a point, drifting a little with the wall; it stands 1.5 cm off the wall. Holes as the tower's builder lays them: rows
 * at yw - 1.2 - 1.3 q, one hole each 1.5 m round, every second row half a step round.
 */
export function dovecoteStreaks(bag, x, z, r, yw, rows, mat = 'plaster_white') {
  const out = [], R = (y) => r * (1.04 - 0.04 * y / yw) + 0.015;
  for (let q = 0; q < rows; q++) {
    const yy = yw - 1.2 - q * 1.3, n = Math.round(Math.PI * 2 * r / 1.5);
    for (let k = 0; k < n; k++) {
      if (hash(x + k, z + q, 61) > 0.4) continue;
      const a = (k + (q % 2) * 0.5) / n * Math.PI * 2, len = (0.7 + 1.7 * hash(x + k, z - q, 62)) * (q === 0 ? 1 : 0.8), wd = 0.1 + 0.07 * hash(x - k, z + q, 63), drift = (hash(x + k, z + q, 64) - 0.5) * 0.12;
      const y0 = yy - 0.14, ym = y0 - len * 0.45, y1 = y0 - len;
      const P = (y, da, w) => { const rr = R(y), an = a + da + w / rr; return [x + Math.cos(an) * rr, y, z + Math.sin(an) * rr]; };
      const TL = P(y0, 0, -wd), TR = P(y0, 0, wd), ML = P(ym, drift * 0.5, -wd * 0.8), MR = P(ym, drift * 0.5, wd * 0.8), B = P(y1, drift, 0);
      const nx = Math.cos(a), nz = Math.sin(a);
      const tri = (p0, p1, p2) => { const ux = p1[0] - p0[0], uy = p1[1] - p0[1], uz = p1[2] - p0[2], vx = p2[0] - p0[0], vy = p2[1] - p0[1], vz = p2[2] - p0[2], cx = uy * vz - uz * vy, cz = ux * vy - uy * vx; if (cx * nx + cz * nz >= 0) out.push(...p0, ...p1, ...p2); else out.push(...p0, ...p2, ...p1); };
      tri(TL, TR, MR); tri(TL, MR, ML); tri(ML, MR, B);
    }
  }
  if (out.length) bag.add(mat, fromTriangles(out));
}

/**
 * Soot over a hearth's hood on the plastered wall: a smear rising from the hood's top to 0.7 m above it, 1.0 m wide at the hood, narrowing in two uneven tongues, seen from
 * both sides (the wall's room side is the frame's depth direction, whichever way that runs). at(u, d): the room frame's point u along the wall, d out from it; y0 the hood's top.
 */
export function sootSmear(bag, at, u0, y0, wide = 1.0, mat = 'hide_black') {
  const out = [], d = 0.045, p = (u, y) => { const a = at(u0 + u, d); return [a[0], y, a[1]]; };
  const A = p(-wide / 2, y0), B = p(wide / 2, y0), C = p(-wide * 0.36, y0 + 0.28), D = p(wide * 0.4, y0 + 0.24), E = p(-wide * 0.2, y0 + 0.7), F = p(wide * 0.18, y0 + 0.5), G = p(wide * 0.3, y0 + 0.62);
  const both = (a, b, c) => out.push(...a, ...b, ...c, ...a, ...c, ...b);
  both(A, B, D); both(A, D, C); both(C, D, F); both(C, F, E); both(F, D, G);
  bag.add(mat, fromTriangles(out));
}
