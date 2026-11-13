// Bianjing's far houses: what a plain house or cottage looks like from more than ~180 m (beyond the arrival, the bridge and the gate,
// layout.js `detOf`): its wall block, its roof over the same eaves (a tiled gable, or the thatch's four slopes), the door as a dark
// panel — the walls, the roof's silhouette and its colours of houses.js (the same draws), with none of the plinth, lattice, eave boards,
// ridge tiles, weathering or yard that are only seen near. About a tenth of the triangles of the plainest near house.
//
// The element's type is `kf_far_wall` (not `house_*`): the settlement-wide street life (src/objects/life.js) dresses what it takes for houses,
// and the far fronts, a quarter-kilometre from anyone standing at the sights, are left to the town's own street life (street.js), which
// thins out with the distance too. The type still marks the lot as built ground for the life's grid.
import { box, fromTriangles } from '../../core/geom.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const WALLS = ['plaster_white', 'plaster_white', 'plaster_grey', 'lime_plaster', 'plaster_damp'];

/** One far house { foot, front, kind, seed, door: { at, hw } }. */
export function houseFar(el, { bag, col }) {
  const rand = rng(el.seed || 1);
  const [x0, z0, x1, z1] = el.foot, f = el.front || 's', kind = el.kind || 'house', thatch = kind !== 'house';
  const along = f === 'n' || f === 's';
  const L = along ? x1 - x0 : z1 - z0, D = along ? z1 - z0 : x1 - x0;
  const ox = f === 's' ? x1 : f === 'n' ? x0 : f === 'e' ? x1 : x0, oz = f === 's' ? z1 : f === 'n' ? z0 : f === 'e' ? z0 : z1;
  const u = f === 's' ? [-1, 0] : f === 'n' ? [1, 0] : f === 'e' ? [0, 1] : [0, -1], v = [-u[1], u[0]];
  const W = (a, b, y) => [ox + u[0] * a + v[0] * b, y, oz + u[1] * a + v[1] * b];
  // the same draws as houseSong's house branch: wall, tile, height, thatch's wall, the ridge's direction, the rise
  const wall = WALLS[Math.floor(rand() * WALLS.length)], tile = rand() < 0.7 ? 'tile_grey' : 'tile_dark';
  const P0 = thatch ? 0.14 : 0.28, Hw = thatch ? 2.1 + rand() * 0.25 : 2.9 + rand() * 0.3;
  const wm = thatch ? (rand() < 0.6 ? 'mud_plaster' : 'earth_wall') : wall;
  const oh = thatch ? 0.7 : 1.15, soh = 0.5;
  const alongRidge = L >= D * 0.9 || rand() < 0.7;
  const s0 = alongRidge ? -soh : -oh, s1 = alongRidge ? L + soh : D + 0.9, t0 = alongRidge ? -oh : -soh, t1 = alongRidge ? D + 0.9 : L + soh;
  const tm = (t0 + t1) / 2, hb = (t1 - t0) / 2, p = thatch ? 0.95 : 1.3;
  const rise = thatch ? hb * (0.78 + rand() * 0.12) : (hb - 0.2) * (0.3 + rand() * 0.08);
  const yw = P0 + Hw, yE = yw - rise * Math.pow(Math.max(0, 1 - Math.abs(0 - tm) / hb), p), yR = yE + rise;
  const M = alongRidge ? (s, t, y) => W(s, t, y) : (s, t, y) => W(t, s, y);

  // the wall block (a box in the world: the fronts run along the axes), its colliders as the near house's
  const X0 = Math.min(x0, x1), X1 = Math.max(x0, x1), Z0 = Math.min(z0, z1), Z1 = Math.max(z0, z1);
  bag.add(wm, box(X0, 0, Z0, X1, yw, Z1, { noBottom: true }));
  col.rect([X0, Z0, X1, Z1], 0, yw + 1);

  // the roof: triangles oriented to face `hint`
  const T = [];
  const tri = (a, b, c, hint) => {
    const nx = (b[1] - a[1]) * (c[2] - a[2]) - (b[2] - a[2]) * (c[1] - a[1]), ny = (b[2] - a[2]) * (c[0] - a[0]) - (b[0] - a[0]) * (c[2] - a[2]), nz = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
    if (nx * hint[0] + ny * hint[1] + nz * hint[2] < 0) T.push(...a, ...c, ...b); else T.push(...a, ...b, ...c);
  };
  const quad = (a, b, c, d, hint) => { tri(a, b, c, hint); tri(a, c, d, hint); };
  const UP = [0, 1, 0];
  if (thatch) {
    // hipped: the ridge shortened by `hip` at each end, four slopes
    const hip = Math.min(hb - 0.2, (s1 - s0) / 2 - 0.3);
    const A = M(s0, t0, yE), B = M(s1, t0, yE), C = M(s1, t1, yE), Dd = M(s0, t1, yE), R0 = M(s0 + hip, tm, yR), R1 = M(s1 - hip, tm, yR);
    quad(A, B, R1, R0, UP); quad(C, Dd, R0, R1, UP);
    const mid = [(A[0] + B[0] + C[0] + Dd[0]) / 4, yw, (A[2] + B[2] + C[2] + Dd[2]) / 4];
    tri(Dd, A, R0, [R0[0] - mid[0], 0.3, R0[2] - mid[2]]); tri(B, C, R1, [R1[0] - mid[0], 0.3, R1[2] - mid[2]]);
    bag.add('thatch', fromTriangles(T));
  } else {
    // a gable: two slopes, the gable ends filled to the roof's underside
    const A = M(s0, t0, yE), B = M(s1, t0, yE), C = M(s1, t1, yE), Dd = M(s0, t1, yE), R0 = M(s0, tm, yR), R1 = M(s1, tm, yR);
    quad(A, B, R1, R0, UP); quad(C, Dd, R0, R1, UP);
    bag.add(tile, fromTriangles(T));
    const G = [], g = (a, b, c, hint) => {
      const nx = (b[1] - a[1]) * (c[2] - a[2]) - (b[2] - a[2]) * (c[1] - a[1]), ny = (b[2] - a[2]) * (c[0] - a[0]) - (b[0] - a[0]) * (c[2] - a[2]), nz = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
      if (nx * hint[0] + ny * hint[1] + nz * hint[2] < 0) G.push(...a, ...c, ...b); else G.push(...a, ...b, ...c);
    };
    const ga = M(0, 0, yw), gb = M(0, D, yw), gc = M(0, tm, yR - 0.16);
    void ga; void gb; void gc;
    // the gable triangles stand over the walls (the near house's plaster to the roof): at the wall block's two ends across the ridge
    for (const sw of alongRidge ? [0, L] : [0, D]) {
      const e = alongRidge ? [sw === 0 ? -1 : 1, 0, 0] : [0, 0, 0];
      void e;
      const a = M(sw, alongRidge ? 0 : 0, yw - 0.02), b = M(sw, alongRidge ? D : L, yw - 0.02), c = M(sw, alongRidge ? D / 2 : L / 2, yR - 0.16);
      const out = alongRidge ? [(sw === 0 ? -1 : 1) * u[0], 0, (sw === 0 ? -1 : 1) * u[1]] : [(sw === 0 ? -1 : 1) * v[0], 0, (sw === 0 ? -1 : 1) * v[1]];
      g(a, b, c, out);
    }
    bag.add(wm, fromTriangles(G));
  }

  // the door: a dark panel on the front
  const d = el.door;
  if (d) {
    const hw = Math.min(d.hw, 0.55), n = [-v[0], 0, -v[1]], e = 0.03;
    const px = d.at[0] + n[0] * e, pz = d.at[1] + n[2] * e, ux = u[0] * hw, uz = u[1] * hw, h0 = P0 + 0.02, h1 = P0 + 2.1;
    const Q = [];
    const a = [px - ux, h0, pz - uz], b = [px + ux, h0, pz + uz], c = [px + ux, h1, pz + uz], dd = [px - ux, h1, pz - uz];
    const nx = (b[1] - a[1]) * (c[2] - a[2]) - (b[2] - a[2]) * (c[1] - a[1]), nz = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
    if (nx * n[0] + nz * n[2] < 0) Q.push(...a, ...c, ...b, ...a, ...dd, ...c); else Q.push(...a, ...b, ...c, ...a, ...c, ...dd);
    bag.add('wood_dark', fromTriangles(Q));
  }
}
