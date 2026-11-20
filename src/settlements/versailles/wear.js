// Wear and damp at the doors of the walk (docs/settlements/versailles.md §11.6): the granite sill of every opened house and lodging dipped in the middle by
// the feet that cross it (Suzhou's method, ming-suzhou/wear.js, in this settlement's stone), and moss at the north foot of the service lodgings' walls, where the
// yards' hornbeam walls keep the sun off. The town is some twenty years old about 1690 (the court settled at Versailles in 1682 [inferred: recalled, not sourced here; dossier §11.6]),
// so the wear is slight: a hand's breadth of dip and a few patches [inferred]. Geometry only, in materials the town's near plans already use
// (granite_grey, cloth_green), in near plans a tile each, so that they merge into the existing batches. Pure functions of places.
import { fromTriangles } from '../../core/geom.js';
import { STYLES } from '../../core/build.js';
import '../../styles/classical_fr/index.js';
import { RADIUS, RISE, YARD_Y } from './layout.js';
import { opened, doorOf, frameAt } from './openwalk.js';

/** A number in [0, 1) from numbers alone. */
const hash = (a, b = 0, c = 0) => {
  let h = Math.imul(Math.floor(a * 13.1) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(Math.floor(b * 7.31) + 0x7f4a7c15, 0xc2b2ae35) ^ Math.imul(Math.floor(c * 5.9) + 0x165667b1, 0x27d4eb2f);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
};
/** A box's twelve triangles, corners (x0, yb, z0)–(x1, ·, z1) and the top's four heights [at x0z0, x1z0, x1z1, x0z1], outward. */
function slab(out, x0, z0, x1, z1, yb, t) {
  const A = [x0, t[0], z0], B = [x1, t[1], z0], C = [x1, t[2], z1], D = [x0, t[3], z1], a = [x0, yb, z0], b = [x1, yb, z0], c = [x1, yb, z1], d = [x0, yb, z1];
  const q = (p0, p1, p2, p3) => out.push(...p0, ...p1, ...p2, ...p0, ...p2, ...p3);
  q(A, D, C, B); q(a, b, c, d); q(a, A, B, b); q(b, B, C, c); q(c, C, D, d); q(d, D, A, a);
}

let TILES = null;
const tile = (x, z) => { const k = `${Math.floor(x / 100)},${Math.floor(z / 100)}`; if (!TILES.has(k)) TILES.set(k, { granite_grey: [], cloth_green: [] }); return TILES.get(k); };
/** A sill across a door: 5.5 cm over the floor at its ends, 2.5 cm in the middle (the hollow of twenty years of feet); `o` the door's middle, (ux, uz) along the front, (vx, vz) in. */
function sill(o, ux, uz, vx, vz, w, y) {
  const out = [], N = 10, v0 = -0.28, v1 = 0.2, top = (u) => 0.025 + 0.03 * Math.pow(Math.abs(u) / (w / 2), 2.2);
  for (let k = 0; k < N; k++) {
    const u0 = -w / 2 + (w * k) / N, u1 = u0 + w / N;
    const P = (u, v, h) => [o[0] + ux * u + vx * v, y + h, o[1] + uz * u + vz * v];
    const a = P(u0, v0, top(u0)), b = P(u1, v0, top(u1)), c = P(u1, v1, top(u1)), d = P(u0, v1, top(u0)), s = (p) => [p[0], y - 0.03, p[2]];
    out.push(...a, ...d, ...c, ...a, ...c, ...b);                                        // top (up)
    out.push(...s(a), ...s(b), ...s(c), ...s(a), ...s(c), ...s(d));                      // underside
    out.push(...s(a), ...a, ...b, ...s(a), ...b, ...s(b)); out.push(...s(d), ...s(c), ...c, ...s(d), ...c, ...d);      // v0 face, v1 face
    if (k === 0) out.push(...s(a), ...s(d), ...d, ...s(a), ...d, ...a);
    if (k === N - 1) out.push(...s(b), ...b, ...c, ...s(b), ...c, ...s(c));
  }
  return out;
}
function build() {
  TILES = new Map();
  for (const el of opened()) {
    const d = doorOf(el), y = el.yard ? YARD_Y : RISE, [x, z] = frameAt(el, d.u, 0), s = el.front === 's' ? -1 : 1;
    tile(x, z).granite_grey.push(...sill([x, z], s, 0, 0, s, Math.min(d.w, 2.4), y));
  }
  // moss: patches along the north foot of the service lodgings' walls (the yards' hornbeam walls shade them), a thin crust on the paving's edge
  for (const el of opened().filter((e) => e.yard)) {
    const [x0, z0, x1] = el.rect, T = tile((x0 + x1) / 2, z0), out = T.cloth_green;
    for (let k = 0, n = 5; k < n; k++) {
      const u = x0 + 0.8 + ((x1 - x0 - 1.6) * (k + hash(x0, z0, k) * 0.7)) / n, w = 0.5 + hash(z0, u, 3) * 0.9, dp = 0.18 + hash(u, z0, 5) * 0.2;
      const h = 0.012 + hash(u, k, 7) * 0.014;
      slab(out, u, z0 - 0.02 - dp, u + w, z0 - 0.02, YARD_Y - 0.01, [YARD_Y + h, YARD_Y + h * 0.6, YARD_Y + h * 0.5, YARD_Y + h * 0.9]);
    }
  }
  return TILES;
}
/** { t: 'vs_wear', tile: 'i,j' }: that tile's sills and moss. */
function vsWear(el, ctx) { const t = (TILES || build()).get(el.tile); if (!t) return; for (const [m, tris] of Object.entries(t)) if (tris.length) ctx.bag.add(m, fromTriangles(tris)); }
Object.assign(STYLES.classical_fr.elements, { vs_wear: vsWear });

/** The wear plans: a near plan to a tile. */
export function wearPlans() {
  return [...(TILES || build()).keys()].map((k) => {
    const [i, j] = k.split(',').map(Number);
    return { id: `versailles-wear-${k}`, style: 'classical_fr', origin: [0, 0], base: 0, yaw: 0, feature: true, entrance: { at: [180, 0], facing: 'w' }, bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], rooms: [], elements: [{ t: 'vs_wear', tile: k }], nocollide: true, center: [i * 100 + 50, j * 100 + 50], near: 200 };
  });
}
