// The Weiyang terrace (docs/settlements/han-changan.md §4b, §4c): three tiers of rammed earth with a revetment — a stepped stone footing, a vermilion
// skirt, plastered panels between the timber ribs (the posts of the rammed-earth formwork), the stone water spouts, a coping — and the ramp-stair with
// its stone cheeks and lattice balustrade, the crown and the lower tiers railed in the same way. Everything is collected in one Mesh (a geometry per
// material), so the whole terrace is a handful of draws. The ramp's steps are the han kit's (steps).
import { lathe } from '../../core/geom.js';
import { limb } from '../qing/carving.js';
import { steps } from '../han/kit.js';
import { Mesh, balustradeRun } from './detail.js';

const rngOf = (seed) => { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); };

/** hanl_terrace: { tiers: [{ r, top }], ramp: { x: [x0, x1], z0, z1 } (rising toward −z), seed } */
export function terrace(el, ctx) {
  const { bag, col } = ctx, M = new Mesh(), rand = rngOf(el.seed ?? 3), rp = el.ramp, cx = (rp.x[0] + rp.x[1]) / 2, tiers = el.tiers;
  const crown = tiers[tiers.length - 1], T = crown.top;
  tiers.forEach((t, i) => {
    const [x0, z0, x1, z1] = t.r, prev = i ? tiers[i - 1].top : 0;
    M.box('earth_wall', x0, -0.4, z0, x1, t.top, z1); col.rect(t.r, -0.4, t.top);
    M.box('brick_paving', x0 + 0.01, t.top - 0.02, z0 + 0.01, x1 - 0.01, t.top + 0.01, z1 - 0.01); col.floor(t.r, t.top);
    // the coping: a stone course with a drip, round the top
    M.box('bluestone', x0 - 0.15, t.top - 0.3, z0 - 0.15, x1 + 0.15, t.top, z0 + 0.5); M.box('bluestone', x0 - 0.15, t.top - 0.3, z1 - 0.5, x1 + 0.15, t.top, z1 + 0.15);
    M.box('bluestone', x0 - 0.15, t.top - 0.3, z0, x0 + 0.5, t.top, z1); M.box('bluestone', x1 - 0.5, t.top - 0.3, z0, x1 + 0.15, t.top, z1);
    M.box('bluestone', x0 - 0.22, t.top - 0.38, z1 - 0.1, x1 + 0.22, t.top - 0.3, z1 + 0.22); M.box('bluestone', x0 - 0.22, t.top - 0.38, z0 - 0.22, x0 + 0.1, t.top - 0.3, z1 + 0.22); M.box('bluestone', x1 - 0.1, t.top - 0.38, z0 - 0.22, x1 + 0.22, t.top - 0.3, z1 + 0.22);
    // each exposed face: [outward x, z], frame at u along, face line c, outward sign sg, along x or z
    const faces = [{ ax: true, c: z1, sg: 1, a: x0, b: x1 }, { ax: false, c: x0, sg: -1, a: z0, b: z1 }, { ax: false, c: x1, sg: 1, a: z0, b: z1 }];
    const yb = prev + 0.02, yt = t.top - 0.34;
    for (const f of faces) {
      const Bx = (u0, y0, n0, u1, y1, n1, mat) => {                          // a box on the face: u along, n out of it (positive outward)
        const p = Math.min(f.c + f.sg * n0, f.c + f.sg * n1), q = Math.max(f.c + f.sg * n0, f.c + f.sg * n1);
        if (f.ax) M.box(mat, u0, y0, p, u1, y1, q); else M.box(mat, p, y0, u0, q, y1, u1);
      };
      const clear = (u0, u1) => f.ax && u1 > rp.x[0] - 1.2 && u0 < rp.x[1] + 1.2;      // the ramp climbs across the south face
      // the stepped footing and the vermilion skirt
      for (const [a, b, h, n] of [[f.a - 0.2, f.b + 0.2, 0.26, 0.2], [f.a - 0.1, f.b + 0.1, 0.5, 0.1]]) {
        if (f.ax) { Bx(a, yb, 0, rp.x[0] - 1.2, yb + h, n, 'bluestone'); Bx(rp.x[1] + 1.2, yb, 0, b, yb + h, n, 'bluestone'); }
        else Bx(a, yb, 0, b, yb + h, n, 'bluestone');
      }
      const run = (u0, u1, fn) => { if (f.ax && clear(u0, u1)) { if (u0 < rp.x[0] - 1.2) fn(u0, Math.min(u1, rp.x[0] - 1.2)); if (u1 > rp.x[1] + 1.2) fn(Math.max(u0, rp.x[1] + 1.2), u1); } else fn(u0, u1); };
      run(f.a, f.b, (u0, u1) => { Bx(u0, yb + 0.5, 0, u1, yb + 1.1, 0.06, 'palace_wall'); });
      // the ribs and, between them, the plastered panels with a red border
      const n = Math.max(2, Math.round((f.b - f.a) / 7.5)), ribs = [];
      for (let k = 0; k <= n; k++) ribs.push(f.a + 1.2 + (f.b - f.a - 2.4) * k / n);
      for (const u of ribs) {
        if (f.ax && Math.abs(u - cx) < 7) continue;
        Bx(u - 0.25, yb + 0.5, 0, u + 0.25, yt, 0.27, 'timber_red');
        Bx(u - 0.32, yt - 0.25, 0, u + 0.32, yt, 0.32, 'timber_red');                                                    // its capital
      }
      for (let k = 0; k < n; k++) {
        const u0 = ribs[k] + 0.45, u1 = ribs[k + 1] - 0.45;
        if (f.ax && (u1 > rp.x[0] - 1.5 && u0 < rp.x[1] + 1.5)) continue;
        Bx(u0, yb + 1.2, 0, u1, yt - 0.3, 0.035, 'lime_plaster');
        Bx(u0, yb + 1.2, 0, u1, yb + 1.32, 0.05, 'palace_wall'); Bx(u0, yt - 0.42, 0, u1, yt - 0.3, 0.05, 'palace_wall');
        Bx(u0, yb + 1.2, 0, u0 + 0.12, yt - 0.3, 0.05, 'palace_wall'); Bx(u1 - 0.12, yb + 1.2, 0, u1, yt - 0.3, 0.05, 'palace_wall');
        if (rand() < 0.65) { const s0 = u0 + 0.6 + rand() * (u1 - u0 - 1.6); Bx(s0, yt - 2.1 - rand() * 0.6, 0, s0 + 0.18 + rand() * 0.3, yt - 0.44, 0.06, 'plaster_streak'); }
        // the water spout of the middle of every second panel: a stone pipe out of the face, a splash stone below on the next tier
        if (k % 2 === 0 && t.top - prev > 1) {
          const um = (u0 + u1) / 2, y = yt - 0.5;
          const p0 = f.ax ? [um, y, f.c + 0.02] : [f.c + f.sg * 0.02, y, um], d = f.ax ? [0, -0.25, f.sg] : [f.sg, -0.25, 0], len = 0.75;
          const p1 = [p0[0] + d[0] * len, p0[1] + d[1] * len, p0[2] + d[2] * len];
          M.geo('bluestone', limb(p0, p1, 0.13, 0.1, 6));
          M.geo('granite_grey', limb([p1[0], p1[1], p1[2]], [p1[0] + d[0] * 0.04, p1[1], p1[2] + d[2] * 0.04], 0.09, 0.09, 6));
          Bx(um - 0.55, yb, 0.35, um + 0.55, yb + 0.06, 1.7, 'bluestone');
        }
      }
    }
    // the lower tiers are railed along their exposed edges
    if (i < tiers.length - 1) {
      const m = 0.3, y = t.top;
      const front = (xa, xb) => { if (xb - xa > 1) balustradeRun(M, [xa, z1 - m], [xb, z1 - m], y, y, { step: 3.2 }); };
      front(x0 + m, rp.x[0] - 0.65); front(rp.x[1] + 0.65, x1 - m);
      for (const xs of [x0 + m, x1 - m]) balustradeRun(M, [xs, z1 - m], [xs, z0 + m], y, y, { step: 3.2 });
    }
  });
  // the ramp-stair: steps, and either side a stone cheek with its lattice balustrade, a gilt lotus on the newel at the foot
  const rect = [rp.x[0], rp.z0, rp.x[1], rp.z1];
  steps(bag, col, rect, 0, T, 'n', 'palace_wall', 0.18, -0.4, 'brick_paving');
  const sl = (z) => T * (rp.z1 - z) / (rp.z1 - rp.z0);
  for (const sd of [-1, 1]) {
    const xe = sd < 0 ? rp.x[0] : rp.x[1], xo = xe + sd * 0.6, xmin = Math.min(xe, xo);
    M.solid('bluestone', [xmin, 0, 0], [0, 0, 1], [0, 1, 0], [1, 0, 0], [[rp.z0, -0.4], [rp.z1, -0.4], [rp.z1, 0.3], [rp.z0, T + 0.3]], 0, 0.6);
    for (let z = rp.z1; z > rp.z0; z -= 4) col.rect([xmin, z - 4, xmin + 0.6, z], -0.4, sl(z - 4) + 0.3);
    balustradeRun(M, [xe + sd * 0.3, rp.z1 - 0.1], [xe + sd * 0.3, rp.z0 + 0.1], 0.3, T + 0.3, { step: 3 });
    const fx = xe + sd * 0.3;
    M.box('granite_grey', fx - 0.4, -0.4, rp.z1 - 0.1, fx + 0.4, 0.5, rp.z1 + 0.9);                                       // the newel block at the foot
    M.geo('gilt_bronze', lathe([[0.001, 0.5], [0.2, 0.5], [0.2, 0.58], [0.1, 0.62], [0.2, 0.84], [0.1, 1.08], [0.001, 1.3]], 8, null, fx, 0, rp.z1 + 0.4));
  }
  // the crown's railing: round three sides and the front on either side of the ramp, collision as the old rail had
  const [cx0, cz0, cx1, cz1] = crown.r, sx = [cx0 + 0.3, cx1 - 0.3], sz = [cz0 + 0.3, cz1 - 0.3];
  const run = (a, b) => {
    balustradeRun(M, a, b, T, T, { step: 3 });
    col.rect([Math.min(a[0], b[0]) - 0.12, Math.min(a[1], b[1]) - 0.12, Math.max(a[0], b[0]) + 0.12, Math.max(a[1], b[1]) + 0.12], T, T + 1.1);
  };
  run([sx[0], sz[0]], [sx[1], sz[0]]); run([sx[0], sz[0]], [sx[0], sz[1]]); run([sx[1], sz[0]], [sx[1], sz[1]]);
  run([sx[0], sz[1]], [rp.x[0] - 0.65, sz[1]]); run([rp.x[1] + 0.65, sz[1]], [sx[1], sz[1]]);
  M.flush(bag);
}
