// Timurid Samarkand — wear and use (docs/settlements/timurid-samarkand.md §20.5): thresholds hollowed in the middle where the feet go, at the street door
// of every house built in full and at the doors of the great portals' passages; the smoke-black above the lamp that stands by a door. Geometry only, in
// materials the plans already hold as whole pieces (limestone, wood_dark), so that no mesh and no draw is added; a hash of each piece's own place varies it.
// Dry climate: no moss, no waterline; the dust is the ground's.

import { fromTriangles, box } from '../../core/geom.js';
import { STYLES } from '../../core/build.js';
import { houseGeom } from './layout.js';
import { hashAt } from './nightlight.js';

/**
 * A worn threshold: a sill across a doorway from u0 to u1 (along `ux, uz` from the point `o`), `dep` deep across the wall's line, its top 5.5 cm above the
 * floor at the ends and dipped to 3 cm in the middle (the hollow of generations of feet), the arrises rounded by a bevel. Triangles into `out`.
 */
export function threshold(out, o, ux, uz, u0, u1, dep, y) {
  const nx = -uz, nz = ux, N = 14, hz = dep / 2;
  const P = (u, v, h) => [o[0] + ux * u + nx * v, y + h, o[1] + uz * u + nz * v];
  const top = (u) => { const m = (u - (u0 + u1) / 2) / ((u1 - u0) / 2); return 0.055 - 0.026 * Math.exp(-m * m * 5); };
  const q = (p0, p1, p2, p3) => out.push(...p0, ...p1, ...p2, ...p0, ...p2, ...p3);
  const bev = 0.018;
  for (let i = 0; i < N; i++) {
    const ua = u0 + (u1 - u0) * i / N, ub = u0 + (u1 - u0) * (i + 1) / N, ha = top(ua), hb = top(ub);
    q(P(ua, -hz + bev, ha), P(ub, -hz + bev, hb), P(ub, hz - bev, hb), P(ua, hz - bev, ha));
    q(P(ua, -hz, ha - bev), P(ub, -hz, hb - bev), P(ub, -hz + bev, hb), P(ua, -hz + bev, ha));
    q(P(ua, hz - bev, ha), P(ub, hz - bev, hb), P(ub, hz, hb - bev), P(ua, hz, ha - bev));
    q(P(ua, -hz, 0), P(ub, -hz, 0), P(ub, -hz, hb - bev), P(ua, -hz, ha - bev));
    q(P(ub, hz, 0), P(ua, hz, 0), P(ua, hz, ha - bev), P(ub, hz, hb - bev));
  }
  q(P(u0, hz, 0), P(u0, -hz, 0), P(u0, -hz, top(u0) - bev), P(u0, hz, top(u0) - bev));
  q(P(u1, -hz, 0), P(u1, hz, 0), P(u1, hz, top(u1) - bev), P(u1, -hz, top(u1) - bev));
}

/** The door's centre along a house's street wall (houses.js: clamped 3.2 m from the ends) and the side its lamp stands on (nightlight.js doorLamp). */
export const doorOf = (h, W) => Math.max(-W / 2 + 3.2, Math.min(W / 2 - 3.2, h.xd));
export const lampSide = (h) => (hashAt(h.seed, 3, 7) < 0.5 ? -1 : 1);

/** The wear of a house front, into the plan's bag: the sill outside the street door, the smoke-black over the lamp's niche. */
function houseWear(el, { bag }) {
  const h = el.h;
  if (!h || el.simple || h.garden) return;
  const G = houseGeom(h), xd = doorOf(h, G.W), out = [];
  // the sill: on the lane just outside the wall, across the passage's mouth (2.2 m wide: a little less)
  const a = G.toWorld(xd - 1.05, G.D / 2), b = G.toWorld(xd + 1.05, G.D / 2), L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L;
  const nx = -uz, nz = ux, c = G.toWorld(xd, G.D / 2 + 1), sgn = Math.sign((c[0] - a[0]) * nx + (c[1] - a[1]) * nz) || 1;
  threshold(out, [a[0] + sgn * nx * 0.26, a[1] + sgn * nz * 0.26], ux, uz, 0, L, 0.4, 0);
  if (out.length) bag.add('limestone', fromTriangles(out));
  // the smoke-black over the lamp that stands by the door (rich houses, one in three of the others): a smudge up the wall, wider at the foot
  if (h.rich || hashAt(h.seed, 5, 41) <= 0.34) {
    const u = xd + lampSide(h) * 1.45, p = G.toWorld(u, G.D / 2), q = G.toWorld(u, G.D / 2 + 1), dx = q[0] - p[0], dz = q[1] - p[1];
    const along = Math.abs(dx) > 0.5 ? 'z' : 'x', hw = 0.2 + 0.08 * hashAt(h.seed, 6, 7);
    const wx = p[0] + dx * 0.004, wz = p[1] + dz * 0.004;
    bag.add('wood_dark', along === 'x' ? box(wx - hw, 2.0, Math.min(wz, wz + dz * 0.012), wx + hw, 2.62 + 0.15 * hashAt(h.seed, 7, 7), Math.max(wz, wz + dz * 0.012)) : box(Math.min(wx, wx + dx * 0.012), 2.0, wz - hw, Math.max(wx, wx + dx * 0.012), 2.62 + 0.15 * hashAt(h.seed, 7, 7), wz + hw));
  }
}

/** tim_wear { doors: [{ at: [x, z], axis ('x' | 'z': the way the sill runs), w, dep, y }] } — worn sills at the doors of the great portals' passages. */
function timWear(el, { bag }) {
  const out = [];
  for (const d of el.doors) {
    const ux = d.axis === 'x' ? 1 : 0, uz = d.axis === 'x' ? 0 : 1;
    threshold(out, [d.at[0] - ux * d.w / 2, d.at[1] - uz * d.w / 2], ux, uz, 0, d.w, d.dep ?? 0.5, d.y ?? 0);
  }
  if (out.length) bag.add('limestone', fromTriangles(out));
}

let done = false;
/** Register the element and wrap the style's house (idempotent; after the style's registration and nightlight's). */
export function registerWear() {
  if (done) return; done = true;
  const S = STYLES.timurid;
  if (!S) return;
  S.elements.tim_wear = timWear;
  const base = S.elements.tim_house;
  S.elements.tim_house = (el, ctx) => { base(el, ctx); houseWear(el, ctx); };
}
