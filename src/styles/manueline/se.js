// The Sé of Lisbon about 1520 (docs/settlements/manueline-lisbon.md §11), hollow and walkable: the fortress-like west front with its two
// crenellated towers, the rose window and the sculpted portal; the Romanesque nave of four bays, a barrel vault over an arcade and a
// triforium gallery; the aisles with half-barrel vaults and narrow windows; the transept with its rose windows and the lantern over the
// crossing; Afonso IV's Gothic chevet with its ribbed vault and the ambulatory, tombs and chapel altars; the altar and its furnishings.
// Frame: u east from the west front (0…46), v south from the north side (0…36), y the floor. Element `se` { rect, y }.
import { box, lathe, rod, frustum, fromTriangles, orientOutward } from '../../core/geom.js';
import { archWall } from '../gothic/nd-interior.js';
import { tube } from '../../objects/kit.js';
import { armillary, orderCross, netVault, pinnacle } from './util.js';

const LIME = 'limestone', CARV = 'limestone_carved', YEL = 'limestone_yellow';
// the plan's fixed lines (u) and (v)
const FRONT = 1.4, TOW = 8, A0 = 8, BAY = 4.4, A1 = A0 + 4 * BAY;      // front wall, tower depth, the arcade from A0 to A1 (25.6)
const CR0 = A1 + 1, CR1 = CR0 + 8, LE1 = CR1 + 1;                      // the crossing 26.6…34.6; the lantern's walls 25.6…26.6 and 34.6…35.6
const CH1 = 41.6, EA1 = 42.6, AMB1 = 44.8, E = 46;                     // the choir to 41.6, its east arcade to 42.6, the ambulatory to 44.8, the outer wall
const NV0 = 13.2, NV1 = 22.8, VC = 18;                                  // the nave's clear width (v) and its axis
const SPR = 9.4, CROWN = 14.2, ASP = 5.2;                                // the nave vault's springing and crown; the aisles' springing

/** A convex slab: the quad a, b, c, d (points) and the same th lower. */
function slab(bag, mat, a, b, c, d, th) {
  const lo = (p) => [p[0], p[1] - th, p[2]], q = (p0, p1, p2, p3) => [...p0, ...p1, ...p2, ...p0, ...p2, ...p3], A = lo(a), B = lo(b), C = lo(c), D = lo(d);
  bag.add(mat, fromTriangles(orientOutward([...q(a, b, c, d), ...q(A, B, C, D), ...q(a, b, B, A), ...q(b, c, C, B), ...q(c, d, D, C), ...q(d, a, A, D)])));
}
/** A convex prism from a list of triangles' corners given as the polygon pts (plan [x, z]) at y0, extruded to y1 (a convex outline). */
function prismOf(bag, mat, pts, y0, y1) {
  const out = [], n = pts.length;
  for (let i = 1; i < n - 1; i++) { out.push(pts[0][0], y1, pts[0][1], pts[i][0], y1, pts[i][1], pts[i + 1][0], y1, pts[i + 1][1]); out.push(pts[0][0], y0, pts[0][1], pts[i][0], y0, pts[i][1], pts[i + 1][0], y0, pts[i + 1][1]); }
  for (let i = 0; i < n; i++) { const a = pts[i], b = pts[(i + 1) % n]; out.push(a[0], y0, a[1], b[0], y0, b[1], b[0], y1, b[1], a[0], y0, a[1], b[0], y1, b[1], a[0], y1, a[1]); }
  bag.add(mat, fromTriangles(orientOutward(out)));
}

export function se(el, ctx) {
  const { bag, col, lights } = ctx, [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, zc = (z0 + z1) / 2;
  const X = (u) => x0 + u, Z = (v) => z0 + v, Y = (h) => y + h;
  const tops = (h) => h + 1;
  /** A solid block in the frame, in collision too. */
  const W = (u0, v0, u1, v1, h0, h1, mat = LIME, solid = true) => { bag.add(mat, box(X(u0), Y(h0), Z(v0), X(u1), Y(h1), Z(v1))); if (solid) col.rect([X(u0), Z(v0), X(u1), Z(v1)], Y(h0), Y(tops(h1))); };
  /** A wall along x (u0…u1 at v0…v1) with arched openings ops [{uc (u), r, sill, spring}] from h0 to h1, collision by the strips between. */
  const arcX = (u0, u1, v0, v1, h0, h1, ops, mat = LIME) => {
    const T = []; archWall(T, (uu, yy, d) => [X(uu), Y(yy), Z(v0) + d], { u0, u1, d0: 0, d1: v1 - v0, y0: h0, y1: h1, openings: ops.map((o) => ({ f: 0.5, ...o })), n: 8 });
    bag.add(mat, fromTriangles(T));
    let a = u0; for (const o of ops) { if (o.yc !== undefined) { col.rect([X(u0), Z(v0), X(u1), Z(v1)], Y(h0), Y(tops(h1))); a = u1; break; } if (o.uc - o.r > a + 0.05) col.rect([X(a), Z(v0), X(o.uc - o.r), Z(v1)], Y(h0), Y(tops(h1))); col.rect([X(o.uc - o.r), Z(v0), X(o.uc + o.r), Z(v1)], Y(o.spring + o.r), Y(tops(h1))); if (o.sill > h0 + 0.05) col.rect([X(o.uc - o.r), Z(v0), X(o.uc + o.r), Z(v1)], Y(h0), Y(o.sill)); a = o.uc + o.r; }
    if (u1 > a + 0.05) col.rect([X(a), Z(v0), X(u1), Z(v1)], Y(h0), Y(tops(h1)));
  };
  /** The same along z (v0…v1 at u0…u1). */
  const arcZ = (v0, v1, u0, u1, h0, h1, ops, mat = LIME) => {
    const T = []; archWall(T, (uu, yy, d) => [X(u0) + d, Y(yy), Z(uu)], { u0: v0, u1: v1, d0: 0, d1: u1 - u0, y0: h0, y1: h1, openings: ops.map((o) => ({ f: 0.5, ...o })), n: 8 });
    bag.add(mat, fromTriangles(T));
    let a = v0; for (const o of ops) { if (o.yc !== undefined) { col.rect([X(u0), Z(v0), X(u1), Z(v1)], Y(h0), Y(tops(h1))); a = v1; break; } if (o.uc - o.r > a + 0.05) col.rect([X(u0), Z(a), X(u1), Z(o.uc - o.r)], Y(h0), Y(tops(h1))); col.rect([X(u0), Z(o.uc - o.r), X(u1), Z(o.uc + o.r)], Y(o.spring + o.r), Y(tops(h1))); if (o.sill > h0 + 0.05) col.rect([X(u0), Z(o.uc - o.r), X(u1), Z(o.uc + o.r)], Y(h0), Y(o.sill)); a = o.uc + o.r; }
    if (v1 > a + 0.05) col.rect([X(u0), Z(a), X(u1), Z(v1)], Y(h0), Y(tops(h1)));
  };
  /** A barrel vault, its axis along x (alongX) from a to b, centre c (v), half-width hw, from the springing to spring + rise; faces down. */
  const barrel = (alongX, a, b, c, hw, spring, rise, mat = 'limestone', ribs = 0, N = 12) => {
    const tri = [], P = (s, t) => { const k = -hw + 2 * hw * t, hh = Math.sqrt(Math.max(0, 1 - (k / hw) * (k / hw))) * rise; return alongX ? [X(s), Y(spring + hh), Z(c + k)] : [X(c + k), Y(spring + hh), Z(s)]; };
    for (let j = 0; j < N; j++) {
      const p = P(a, j / N), q = P(a, (j + 1) / N), r2 = P(b, (j + 1) / N), s = P(b, j / N);
      // facing down: the normal must have a negative y; the strip's two triangles are wound by testing
      for (const t of [[p, q, r2], [p, r2, s]]) { const u = [t[1][0] - t[0][0], t[1][1] - t[0][1], t[1][2] - t[0][2]], v = [t[2][0] - t[0][0], t[2][1] - t[0][1], t[2][2] - t[0][2]], ny = u[2] * v[0] - u[0] * v[2], nx = u[1] * v[2] - u[2] * v[1], nz = u[0] * v[1] - u[1] * v[0]; const mid = (j + 0.5) / N - 0.5, inward = alongX ? -mid * nz : -mid * nx; void ny; if (inward >= 0) tri.push(...t[0], ...t[1], ...t[2]); else tri.push(...t[0], ...t[2], ...t[1]); }
    }
    bag.add(mat, fromTriangles(tri));
    // transverse ribs (arches of rope-moulded stone) across the vault
    for (let k = 0; k < ribs; k++) { const s = a + (b - a) * (k + 0.5) / ribs; bag.add(YEL, tube(Array.from({ length: 13 }, (_, i) => { const q = P(s, i / 12); return [q[0], q[1] - 0.06, q[2], 0.09]; }), 4, { capA: false, capB: false })); }
  };

  // ── the platform the church stands on (the ground is levelled round it in layout.js), and its flagstone floor
  bag.add(LIME, box(x0 - 0.5, y - 6, z0 - 0.5, x1 + 0.5, y - 0.06, z1 + 0.5));
  bag.add('flagstone', box(x0 - 0.5, y - 0.06, z0 - 0.5, x1 + 0.5, y, z1 + 0.5)); col.rect([x0 - 0.5, z0 - 0.5, x1 + 0.5, z1 + 0.5], y - 6, y);

  // ── the west front: the two towers, the front wall with the portal and the rose, the gable
  for (const [v0, v1] of [[0, 10], [26, 36]]) {
    W(0, v0, TOW, v1, 0, 27);
    bag.add(CARV, box(X(-0.1), Y(26.4), Z(v0 - 0.1), X(TOW + 0.1), Y(27.2), Z(v1 + 0.1)));
    for (let u = 0.6; u < TOW - 0.5; u += 1.8) for (const [mu, mv] of [[u, v0 - 0.1], [u, v1 - 0.9]]) bag.add(LIME, box(X(mu), Y(27.2), Z(mv), X(mu + 1.0), Y(28.6), Z(mv + 1.0)));
    for (let v = v0 + 0.6; v < v1 - 0.5; v += 1.8) for (const mu of [-0.1, TOW - 0.9]) bag.add(LIME, box(X(mu), Y(27.2), Z(v), X(mu + 1.0), Y(28.6), Z(v + 1.0)));
    for (const h of [9, 17]) { bag.add('opening', box(X(-0.05), Y(h), Z((v0 + v1) / 2 - 0.4), X(0.05), Y(h + 2.6), Z((v0 + v1) / 2 + 0.4)));
      bag.add(CARV, box(X(-0.12), Y(h - 0.15), Z((v0 + v1) / 2 - 0.6), X(0.05), Y(h), Z((v0 + v1) / 2 + 0.6))); bag.add(CARV, box(X(-0.12), Y(h + 2.6), Z((v0 + v1) / 2 - 0.6), X(0.05), Y(h + 2.75), Z((v0 + v1) / 2 + 0.6))); }
    bag.add(CARV, box(X(-0.1), Y(12.9), Z(v0), X(TOW), Y(13.2), Z(v1)));
    for (const h of [6, 19.5]) bag.add(CARV, box(X(-0.08), Y(h), Z(v0), X(TOW), Y(h + 0.22), Z(v1)));
  }
  // the towers' bases joined behind the front wall: the thick walls beside the first bay
  W(FRONT, 10, A0, NV0, 0, 10.4); W(FRONT, NV1, A0, 26, 0, 10.4);
  // the front wall between the towers: the portal below, the rose above, the gable on top
  arcZ(10, 26, 0, FRONT, 0, 5.6, [{ uc: VC, r: 2.1, sill: 0, spring: 2.7 }]);
  arcZ(10, 26, 0, FRONT, 5.6, 11.4, [{ uc: VC, r: 2.4, sill: 8.5 - 2.4, spring: 8.5, yc: 8.5 }].map((o) => ({ uc: o.uc, r: o.r, yc: o.yc })));
  { const T = [[X(0), Y(11.4), Z(12.4)], [X(0), Y(11.4), Z(23.6)], [X(0), Y(17.0), Z(VC)]], U = T.map((p) => [p[0] + FRONT, p[1], p[2]]), tri = [];
    tri.push(...T[0], ...T[2], ...T[1], ...U[0], ...U[1], ...U[2]);
    for (let i = 0; i < 3; i++) { const j = (i + 1) % 3; tri.push(...T[i], ...U[i], ...U[j], ...T[i], ...U[j], ...T[j]); }
    bag.add(LIME, fromTriangles(orientOutward(tri))); }
  col.rect([X(0), Z(12.4), X(FRONT), Z(23.6)], Y(11.4), Y(18));
  // the rose: stained glass with a ring of tracery and twelve spokes; the sculpted portal: three orders of colonnettes and archivolts
  bag.add('stained_glass', lathe([[2.3, 0], [0.001, 0]], 20).rotateZ(Math.PI / 2).translate(X(0.7), Y(8.5), Z(VC)));
  bag.add(CARV, tube(Array.from({ length: 33 }, (_, k) => { const t = k / 32 * Math.PI * 2; return [X(0.72), Y(8.5) + Math.sin(t) * 2.3, Z(VC) + Math.cos(t) * 2.3, 0.08]; }), 4, { capA: false, capB: false }));
  bag.add(CARV, tube(Array.from({ length: 33 }, (_, k) => { const t = k / 32 * Math.PI * 2; return [X(0.72), Y(8.5) + Math.sin(t) * 1.0, Z(VC) + Math.cos(t) * 1.0, 0.07]; }), 4, { capA: false, capB: false }));
  for (let k = 0; k < 12; k++) { const t = k / 12 * Math.PI * 2; bag.add(CARV, rod([X(0.72), Y(8.5) + Math.sin(t) * 1.0, Z(VC) + Math.cos(t) * 1.0], [X(0.72), Y(8.5) + Math.sin(t) * 2.3, Z(VC) + Math.cos(t) * 2.3], 0.05, 4)); }
  for (const sg of [-1, 1]) for (let k = 0; k < 3; k++) {
    const vv = VC + sg * (2.1 + 0.34 * (k + 1));
    bag.add(LIME, lathe([[0.2, 0], [0.16, 0.2], [0.13, 0.4], [0.13, 2.7]], 8, null, X(-0.1), Y(0), Z(vv)));
    bag.add(CARV, lathe([[0.13, 0], [0.19, 0.16], [0.24, 0.36], [0.001, 0.36]], 8, null, X(-0.1), Y(2.7), Z(vv)));
  }
  for (let k = 0; k < 3; k++) { const r = 2.1 + 0.34 * (k + 1); bag.add(k === 1 ? CARV : LIME, tube(Array.from({ length: 17 }, (_, i) => { const t = i / 16 * Math.PI; return [X(-0.1), Y(2.7) + Math.sin(t) * r, Z(VC) - Math.cos(t) * r, 0.13]; }), 4, { capA: false, capB: false })); }
  bag.add(CARV, box(X(-0.3), Y(5.0), Z(VC - 0.4), X(0), Y(5.3), Z(VC + 0.4))); armillary(bag, CARV, X(-0.15), Y(5.95), Z(VC), 0.55);       // the keystone and the sphere over it
  col.rect([X(-0.3), Z(VC - 3.2), X(0), Z(VC - 2.1)], Y(0), Y(2.7)); col.rect([X(-0.3), Z(VC + 2.1), X(0), Z(VC + 3.2)], Y(0), Y(2.7));
  bag.add('wood_dark', box(X(0.2), Y(0), Z(VC - 2.05), X(1.2), Y(2.6), Z(VC - 1.95))); bag.add('wood_dark', box(X(0.2), Y(0), Z(VC + 1.95), X(1.2), Y(2.6), Z(VC + 2.05)));   // the leaves stand open against the jambs
  // a south door in the transept's end, a rose over it
  // the roofs of the front's gable (nave roof, below)

  // ── the aisles' outer walls with narrow Romanesque windows, the arcades, the triforium, the clerestory course
  const bayC = (k) => A0 + (k + 0.5) * BAY;
  for (const [v0, v1] of [[6, 7.2], [28.8, 30]]) {
    arcX(A0, A1 + 1.0, v0, v1, 0, 8.0, [0, 1, 2, 3].map((k) => ({ uc: bayC(k), r: 0.55, sill: 2.7, spring: 4.8 })));
    for (let k = 0; k < 4; k++) { const vm = (v0 + v1) / 2; bag.add('daylight_plain', box(X(bayC(k) - 0.5), Y(2.8), Z(vm - 0.03), X(bayC(k) + 0.5), Y(5.3), Z(vm + 0.03))); }
    bag.add(CARV, box(X(A0), Y(8.0), Z(v0 - 0.12), X(A1 + 1.0), Y(8.25), Z(v1 + 0.12)));
  }
  for (const [v0, v1, aisleC] of [[12.0, 13.2, 9.6], [22.8, 24.0, 26.4]]) {
    arcX(A0, A1, v0, v1, 0, 7.0, [0, 1, 2, 3].map((k) => ({ uc: bayC(k), r: 1.7, sill: 0, spring: 4.9 })));
    const ops = []; for (let k = 0; k < 4; k++) for (const s of [-1, 1]) ops.push({ uc: bayC(k) + s * 1.05, r: 0.7, sill: 7.5, spring: 8.2 });
    arcX(A0, A1, v0, v1, 7.0, 9.4, ops, LIME);
    W(A0, v0, A1, v1, 9.4, 10.4, LIME, false);
    const back = v0 < 18 ? 11.6 : 24.4; bag.add('opening', box(X(A0), Y(7.0), Z(back), X(A1), Y(9.4), Z(back + 0.05)));   // the gallery's dark behind its arches
    // string course under the triforium and the capitals' impost
    bag.add(CARV, box(X(A0), Y(6.9), Z(v0 - 0.08), X(A1), Y(7.1), Z(v1 + 0.08)));
    // the piers' stub in the arcade's line carry a shaft up to the vault
    for (let k = 0; k <= 4; k++) { const u = A0 + k * BAY, sv = v0 < 18 ? v1 : v0; bag.add(YEL, lathe([[0.17, 0], [0.15, 0.2], [0.13, 2.4]], 8, null, X(u), Y(7.0), Z(sv + (v0 < 18 ? 0.0 : 0.0)))); void aisleC; }
  }
  // the first bay of the nave, between the thick walls at the front: the walls' inner faces are the nave's
  // ── vaults: the nave's barrel with transverse ribs, the aisles' half-barrels, the transept's, the crossing's net, the choir's ribbed barrel, the ambulatory
  barrel(true, FRONT, A1, VC, 4.8, SPR, 4.8, 'limestone', 6);
  for (const c of [9.6, 26.4]) barrel(true, A0, A1, c, 2.4, ASP, 2.4, 'limestone', 4, 8);
  barrel(false, 1.2, 12.2, (CR0 + CR1) / 2, 4, SPR, 4, 'limestone', 2, 10); barrel(false, 23.8, 34.8, (CR0 + CR1) / 2, 4, SPR, 4, 'limestone', 2, 10);
  netVault(bag, [X(CR0), Z(NV0), X(CR1), Z(NV1)], Y(16.4), Y(17.4), { mat: 'limestone', rib: YEL, boss: CARV, rich: true, n: 8 });
  barrel(true, LE1, CH1, VC, 4.8, SPR, 4.8, 'limestone', 3);
  for (const c of [9.6, 26.4]) barrel(true, LE1, AMB1, c, 2.4, ASP, 2.4, 'limestone', 3, 8);
  barrel(false, 12, 24, (EA1 + AMB1) / 2, 1.1, ASP, 1.1, 'limestone', 3, 6);
  // the aisles' ends at the transept open through arches into the arms; the walls of the arms
  const armW = (u0, u1) => { W(u0, 0, u1, 7.2, 0, 10.4); W(u0, 28.8, u1, 36, 0, 10.4); arcZ(7.2, 12.2, u0, u1, 0, 10.4, [{ uc: 9.6, r: 2.4, sill: 0, spring: ASP }]); arcZ(23.8, 28.8, u0, u1, 0, 10.4, [{ uc: 26.4, r: 2.4, sill: 0, spring: ASP }]); };
  armW(A1, CR0); armW(CR1, LE1);
  // the crossing's four piers and the lantern above: four walls from the springing, each with its great arch and three windows
  for (const [u0, u1] of [[A1, CR0], [CR1, LE1]]) for (const [v0, v1] of [[12.0, 13.2], [22.8, 24.0]]) W(u0, v0, u1, v1, 0, SPR);
  const arch4 = (alongX, a0, a1, b0, b1, r) => (alongX ? arcZ : arcX)(a0, a1, b0, b1, SPR, 14.6, [{ uc: (a0 + a1) / 2, r, sill: SPR, spring: SPR }]);
  arch4(true, 12.2, 23.8, A1, CR0, 4.8); arch4(true, 12.2, 23.8, CR1, LE1, 4.8);
  arch4(false, CR0, CR1, 12.2, 13.2, 4.0); arch4(false, CR0, CR1, 22.8, 23.8, 4.0);
  for (const [alongX, a0, a1, b0, b1] of [[true, 12.2, 23.8, A1, CR0], [true, 12.2, 23.8, CR1, LE1], [false, CR0, CR1, 12.2, 13.2], [false, CR0, CR1, 22.8, 23.8]]) {
    const ops = [0, 1, 2].map((k) => ({ uc: (a0 + a1) / 2 + (k - 1) * ((a1 - a0) / 3.4), r: 0.55, sill: 15.0, spring: 16.0 }));
    (alongX ? arcZ : arcX)(a0, a1, b0, b1, 14.6, 17.7, ops);
    for (const o of ops) { const m = (b0 + b1) / 2; bag.add('daylight_plain', alongX ? box(X(m - 0.03), Y(15.1), Z(o.uc - 0.5), X(m + 0.03), Y(16.6), Z(o.uc + 0.5)) : box(X(o.uc - 0.5), Y(15.1), Z(m - 0.03), X(o.uc + 0.5), Y(16.6), Z(m + 0.03))); }
  }
  // the lantern's roof: a low tiled pyramid with a cross
  bag.add('roof_tile', frustum([X(A1 - 0.2), Z(12.0), X(LE1 + 0.2), Z(24.0)], Y(17.7), Y(21.2), 3.6, 3.6, 4.4, 4.4));
  orderCross(bag, 'wall_red', X((CR0 + CR1) / 2), Y(22.6), Z(VC), 0.9, 's', 0.05); bag.add('iron', rod([X((CR0 + CR1) / 2), Y(21.2), Z(VC)], [X((CR0 + CR1) / 2), Y(23.4), Z(VC)], 0.06, 5));
  // the transept's end walls: roses over (the south one over a door)
  for (const [v0, v1, south] of [[0, 1.2, false], [34.8, 36, true]]) {
    const uc = (CR0 + CR1) / 2, m = (v0 + v1) / 2;
    if (south) arcX(CR0, CR1, v0, v1, 0, 5.6, [{ uc, r: 1.6, sill: 0, spring: 2.8 }]);
    else W(CR0, v0, CR1, v1, 0, 5.6);
    arcX(CR0, CR1, v0, v1, 5.6, 11.4, [{ uc, r: 2.0, yc: 8.4 }]);
    bag.add('stained_glass', lathe([[1.95, 0], [0.001, 0]], 20).rotateZ(Math.PI / 2).rotateY(Math.PI / 2).translate(X(uc), Y(8.4), Z(m)));
    bag.add(CARV, tube(Array.from({ length: 29 }, (_, k) => { const t = k / 28 * Math.PI * 2; return [X(uc) + Math.cos(t) * 2.0, Y(8.4) + Math.sin(t) * 2.0, Z(m + (south ? 0.62 : -0.62)), 0.07]; }), 4, { capA: false, capB: false }));
    for (let k = 0; k < 8; k++) { const t = k / 8 * Math.PI * 2; bag.add(CARV, rod([X(uc), Y(8.4), Z(m + (south ? 0.62 : -0.62))], [X(uc) + Math.cos(t) * 2.0, Y(8.4) + Math.sin(t) * 2.0, Z(m + (south ? 0.62 : -0.62))], 0.04, 4)); }
    // the gable of the arm
    const T = [[X(CR0), Y(11.4), Z(v0)], [X(CR1), Y(11.4), Z(v0)], [X(uc), Y(14.6), Z(v0)]], U = T.map((p) => [p[0], p[1], p[2] + (v1 - v0)]), tri = [];
    tri.push(...T[0], ...T[1], ...T[2], ...U[0], ...U[2], ...U[1]);
    for (let i = 0; i < 3; i++) { const j = (i + 1) % 3; tri.push(...T[i], ...U[i], ...U[j], ...T[i], ...U[j], ...T[j]); }
    bag.add(LIME, fromTriangles(orientOutward(tri)));
  }
  if (true) { const uc = (CR0 + CR1) / 2; bag.add(LIME, box(X(uc - 1.8), Y(-0.05), Z(36.0), X(uc + 1.8), Y(0), Z(37.4))); bag.add('wood_dark', box(X(uc - 1.5), Y(0), Z(34.9), X(uc - 0.45), Y(2.7), Z(35.1))); bag.add('wood_dark', box(X(uc + 0.45), Y(0), Z(34.9), X(uc + 1.5), Y(2.7), Z(35.1))); }

  // ── the chevet: the choir's arcades on the ambulatory, its east arcade, the outer walls, chapels
  for (const [v0, v1, back] of [[12.0, 13.2, 11.6], [22.8, 24.0, 24.4]]) {
    arcX(LE1, CH1, v0, v1, 0, 7.0, [{ uc: (LE1 + CH1) / 2, r: 2.4, sill: 0, spring: 4.4 }]);
    arcX(LE1, CH1, v0, v1, 7.0, 9.4, [{ uc: (LE1 + CH1) / 2 - 1.1, r: 0.7, sill: 7.5, spring: 8.2 }, { uc: (LE1 + CH1) / 2 + 1.1, r: 0.7, sill: 7.5, spring: 8.2 }]);
    W(LE1, v0, CH1, v1, 9.4, 10.4, LIME, false); bag.add('opening', box(X(LE1), Y(7.0), Z(back), X(CH1), Y(9.4), Z(back + 0.05)));
  }
  arcZ(12.0, 24.0, CH1, EA1, 0, 7.0, [0, 1, 2].map((k) => ({ uc: 14.0 + k * 4.0, r: 1.5, sill: 0, spring: 4.6 })));
  W(CH1, 12.0, EA1, 24.0, 7.0, 14.2, LIME, false);
  W(LE1, 6, E, 7.2, 0, 8.0); W(LE1, 28.8, E, 30, 0, 8.0); W(AMB1, 6, E, 30, 0, 8.0);
  W(CH1, 6, AMB1, 7.2, 0, 8.0, LIME, false);
  for (const [vc, horiz] of [[9.6, true], [26.4, true]]) for (const u of [38.6, 41.0, 43.4]) { const vv = vc < 18 ? 7.14 : 28.8; bag.add('daylight_plain', box(X(u - 0.4), Y(2.8), Z(vv), X(u + 0.4), Y(5.3), Z(vv + 0.06))); void horiz; }
  for (const vc of [14, 18, 22]) bag.add('daylight_plain', box(X(AMB1 - 0.04), Y(3.2), Z(vc - 0.4), X(AMB1), Y(5.8), Z(vc + 0.4)));
  // ── the roofs: the nave and choir under one ridge, the aisles' lean-tos, the arms' ridges, the ambulatory's
  const R = 'roof_tile';
  const gableRoof = (u0, u1, vN, vS, ye, yr, th = 0.3) => { slab(bag, R, [X(u0), Y(ye), Z(vN)], [X(u1), Y(ye), Z(vN)], [X(u1), Y(yr), Z(VC)], [X(u0), Y(yr), Z(VC)], th); slab(bag, R, [X(u0), Y(yr), Z(VC)], [X(u1), Y(yr), Z(VC)], [X(u1), Y(ye), Z(vS)], [X(u0), Y(ye), Z(vS)], th); };
  gableRoof(-0.3, A1 + 0.4, 11.4, 24.6, 10.4, 17.0); gableRoof(LE1 - 0.4, EA1 + 0.4, 11.4, 24.6, 10.4, 17.0);
  bag.add('roof_ridge', box(X(-0.3), Y(16.95), Z(VC - 0.2), X(A1 + 0.4), Y(17.25), Z(VC + 0.2))); bag.add('roof_ridge', box(X(LE1 - 0.4), Y(16.95), Z(VC - 0.2), X(EA1 + 0.4), Y(17.25), Z(VC + 0.2)));
  for (const [vo, vi] of [[5.6, 12.0], [30.4, 24.0]]) { slab(bag, R, [X(A0), Y(8.0), Z(vo)], [X(A1 + 0.4), Y(8.0), Z(vo)], [X(A1 + 0.4), Y(10.4), Z(vi)], [X(A0), Y(10.4), Z(vi)], 0.3); slab(bag, R, [X(LE1 - 0.4), Y(8.0), Z(vo)], [X(E + 0.4), Y(8.0), Z(vo)], [X(E + 0.4), Y(10.4), Z(vi)], [X(LE1 - 0.4), Y(10.4), Z(vi)], 0.3); }
  slab(bag, R, [X(E + 0.4), Y(8.0), Z(5.6)], [X(E + 0.4), Y(8.0), Z(30.4)], [X(EA1), Y(10.4), Z(24.0)], [X(EA1), Y(10.4), Z(12.0)], 0.3);
  for (const [v0, v1] of [[-0.4, 12.6], [23.4, 36.4]]) {
    const uc = (CR0 + CR1) / 2;
    slab(bag, R, [X(A1 - 0.3), Y(10.4), Z(v0)], [X(A1 - 0.3), Y(10.4), Z(v1)], [X(uc), Y(14.6), Z(v1)], [X(uc), Y(14.6), Z(v0)], 0.3);
    slab(bag, R, [X(uc), Y(14.6), Z(v0)], [X(uc), Y(14.6), Z(v1)], [X(LE1 + 0.3), Y(10.4), Z(v1)], [X(LE1 + 0.3), Y(10.4), Z(v0)], 0.3);
  }
  // pinnacles along the nave's eaves and the corners of the front
  for (let k = 0; k <= 4; k++) for (const v of [12.6, 23.4]) pinnacle(bag, CARV, X(A0 + k * BAY), Y(10.1), Z(v < 18 ? 11.7 : 24.3), 0.3, 1.6, 6);
  armillary(bag, CARV, X(-0.1), Y(18.2), Z(VC), 0.6); orderCross(bag, 'wall_red', X(-0.01), Y(13.6), Z(VC), 0.7, 'w', 0.04);

  // ── what stands in the church
  const H = (u, v, r, h0, h1, m = LIME) => { bag.add(m, lathe([[r, 0], [r, h1 - h0]], 10, null, X(u), Y(h0), Z(v))); col.circle(X(u), Z(v), r, Y(h0), Y(h1)); };
  // the font in the first bay: a carved basin on a stem with an iron-bound cover
  bag.add(CARV, lathe([[0.7, 0], [0.6, 0.15], [0.28, 0.3], [0.28, 0.85], [0.75, 0.95], [0.8, 1.15], [0.62, 1.2], [0.62, 1.05], [0.001, 1.05]], 12, null, X(4.2), Y(0), Z(VC - 2.8))); col.circle(X(4.2), Z(VC - 2.8), 0.8, Y(0), Y(1.2));
  // the pulpit on the north-west pier of the crossing: a stone drum with its stair
  H(A1 - 1.2, 14.4, 0.7, 0, 1.9, CARV); bag.add(CARV, lathe([[0.95, 0], [0.8, 0.5], [0.8, 1.0], [0.95, 1.1], [0.001, 1.1]], 10, null, X(A1 - 1.2), Y(1.9), Z(14.4)));
  // the choir stalls along both sides of the choir, with their backs, and the lectern
  for (const s of [0, 1]) {
    const v = s ? 21.4 : 13.6, dv = s ? 1 : -1;
    W(LE1 + 0.8, v - 0.35, CH1 - 1.0, v + 0.35, 0, 0.55, 'wood_dark'); W(LE1 + 0.8, v - 0.35 + (s ? 0.7 : -0.0) * 0.0, CH1 - 1.0, v + 0.35, 0.55, 0.62, 'timber', false);
    bag.add('wood_dark', box(X(LE1 + 0.8), Y(0.62), Z(v + (s ? 0.35 : -0.35) + (s ? 0.0 : 0.0) - 0.0 + (s ? 0.0 : 0.0) - 0.0), X(CH1 - 1.0), Y(1.9), Z(v + (s ? 0.35 : -0.35) + dv * 0.12)));
    for (let u = LE1 + 1.0; u < CH1 - 1.0; u += 1.0) bag.add('timber', box(X(u), Y(1.9), Z(v + (s ? 0.35 : -0.35)), X(u + 0.08), Y(2.35), Z(v + (s ? 0.35 : -0.35) + dv * 0.12)));
  }
  bag.add('wood_dark', box(X(LE1 + 2.0), Y(0), Z(VC - 0.25), X(LE1 + 2.5), Y(1.1), Z(VC + 0.25))); bag.add('timber', box(X(LE1 + 1.85), Y(1.1), Z(VC - 0.4), X(LE1 + 2.65), Y(1.2), Z(VC + 0.4))); col.rect([X(LE1 + 1.85), Z(VC - 0.4), X(LE1 + 2.65), Z(VC + 0.4)], Y(0), Y(1.2));
  bag.add('cloth_maroon', box(X(LE1 + 1.9), Y(1.2), Z(VC - 0.35), X(LE1 + 2.6), Y(1.25), Z(VC + 0.35)));
  // the high altar against the east arcade: a stone block, the frontal, the retable with its carved panels, the cross and candlesticks
  const ua = CH1 - 0.9;
  W(ua - 0.9, VC - 1.7, ua + 0.1, VC + 1.7, 0, 1.0, LIME); bag.add('cloth_red', box(X(ua - 1.0), Y(0.2), Z(VC - 1.45), X(ua - 0.9), Y(0.95), Z(VC + 1.45))); bag.add(CARV, box(X(ua - 1.05), Y(1.0), Z(VC - 1.8), X(ua + 0.15), Y(1.1), Z(VC + 1.8)));
  bag.add('cloth_white', box(X(ua - 0.85), Y(1.1), Z(VC - 1.65), X(ua + 0.05), Y(1.14), Z(VC + 1.65)));
  bag.add('wood_painted', box(X(CH1 - 0.15), Y(1.1), Z(VC - 2.4), X(CH1 + 0.0), Y(4.4), Z(VC + 2.4)));
  for (let k = 0; k < 5; k++) { const vv = VC - 2.0 + k, a = k % 2 ? 'gilt_bronze' : 'cloth_blue'; bag.add(a, box(X(CH1 - 0.17), Y(1.3), Z(vv - 0.42), X(CH1 - 0.14), Y(3.0), Z(vv + 0.42))); bag.add('cloth_red', box(X(CH1 - 0.17), Y(3.2), Z(vv - 0.42), X(CH1 - 0.14), Y(4.2), Z(vv + 0.42))); }
  for (let k = 0; k < 5; k++) { const vv = VC - 2.0 + k; bag.add(CARV, box(X(CH1 - 0.2), Y(3.05), Z(vv - 0.46), X(CH1 - 0.1), Y(3.15), Z(vv + 0.46))); bag.add(CARV, box(X(CH1 - 0.2), Y(4.2), Z(vv - 0.46), X(CH1 - 0.1), Y(4.4), Z(vv + 0.46))); }
  bag.add('gilt_bronze', box(X(ua - 0.55), Y(1.14), Z(VC - 0.05), X(ua - 0.45), Y(1.9), Z(VC + 0.05))); bag.add('gilt_bronze', box(X(ua - 0.7), Y(1.55), Z(VC - 0.05), X(ua - 0.3), Y(1.64), Z(VC + 0.05)));
  for (const s of [-1, 1]) for (const dv of [0.55, 1.15]) { bag.add('gilt_bronze', lathe([[0.001, 0], [0.07, 0.01], [0.04, 0.15], [0.06, 0.2], [0.001, 0.2]], 8, null, X(ua - 0.45), Y(1.14), Z(VC + s * dv))); bag.add('cloth_white', lathe([[0.025, 0], [0.025, 0.2]], 6, null, X(ua - 0.45), Y(1.34), Z(VC + s * dv))); bag.add('flame', lathe([[0.001, 0], [0.012, 0.014], [0.001, 0.05]], 4, null, X(ua - 0.45), Y(1.54), Z(VC + s * dv))); }
  // the three tombs of the ambulatory (the mid-14th-century pantheon's chests): a chest on lions, a recumbent figure, a carved lid edge
  for (const [v, mu] of [[9.6, 38.0], [9.6, 42.0], [26.4, 40.0]]) {
    const alongZ = mu > 43;
    const c = alongZ ? [X(mu), Z(v)] : [X(mu), Z(v)], hx = alongZ ? 0.45 : 1.15, hz = alongZ ? 1.15 : 0.45;
    bag.add(LIME, box(c[0] - hx, Y(0), c[1] - hz, c[0] + hx, Y(0.95), c[1] + hz)); bag.add(CARV, box(c[0] - hx - 0.06, Y(0.95), c[1] - hz - 0.06, c[0] + hx + 0.06, Y(1.05), c[1] + hz + 0.06)); col.rect([c[0] - hx - 0.06, c[1] - hz - 0.06, c[0] + hx + 0.06, c[1] + hz + 0.06], Y(0), Y(1.05));
    const bx = alongZ ? 0.0 : 1, bz = alongZ ? 1 : 0;
    bag.add('marble', box(c[0] - hx * 0.7 * (1 - bx * 0 ) * (bx ? 1 : 1), Y(1.05), c[1] - hz * 0.7, c[0] + hx * 0.7, Y(1.2), c[1] + hz * 0.7));
    bag.add('marble', lathe([[0.001, 0], [0.12, 0.02], [0.14, 0.08], [0.001, 0.12]], 8, null, c[0] + bx * hx * 0.55, Y(1.2), c[1] + bz * hz * 0.55));
    for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) bag.add(CARV, box(c[0] + a * hx - (a > 0 ? 0.14 : 0), Y(-0.0), c[1] + b * hz - (b > 0 ? 0.14 : 0), c[0] + a * hx + (a < 0 ? 0.14 : 0), Y(0.2), c[1] + b * hz + (b < 0 ? 0.14 : 0)));
  }
  // the radiating chapels' altars against the outer east wall, each with a small retable and a lamp
  for (const vc of [14, 18, 22]) {
    W(AMB1 - 0.5, vc - 0.6, AMB1 - 0.1, vc + 0.6, 0, 0.95); bag.add(CARV, box(X(AMB1 - 0.55), Y(0.95), Z(vc - 0.65), X(AMB1 - 0.05), Y(1.03), Z(vc + 0.65))); bag.add('cloth_white', box(X(AMB1 - 0.5), Y(1.03), Z(vc - 0.5), X(AMB1 - 0.1), Y(1.06), Z(vc + 0.5)));
    bag.add('wood_painted', box(X(AMB1 + 0.0), Y(1.06), Z(vc - 0.7), X(AMB1 + 0.06), Y(2.9), Z(vc + 0.7))); bag.add('gilt_bronze', box(X(AMB1 - 0.02), Y(1.6), Z(vc - 0.5), X(AMB1 + 0.0), Y(2.6), Z(vc + 0.5)));
    orderCross(bag, 'wall_red', X(AMB1 - 0.03), Y(2.1), Z(vc), 0.28, 'w', 0.03);
  }
  // side altars in the aisles' first bays and votive stands
  for (const [v, face] of [[8.0, 1], [28.0, -1]]) { W(A0 + 0.6, v - 0.45, A0 + 2.2, v + 0.45, 0, 0.95); bag.add(CARV, box(X(A0 + 0.55), Y(0.95), Z(v - 0.5), X(A0 + 2.25), Y(1.03), Z(v + 0.5))); bag.add('cloth_white', box(X(A0 + 0.6), Y(1.03), Z(v - 0.4), X(A0 + 2.2), Y(1.06), Z(v + 0.4))); bag.add('wood_painted', box(X(A0 + 0.6), Y(1.06), Z(v + (face > 0 ? 0.3 : -0.4)), X(A0 + 2.2), Y(2.5), Z(v + (face > 0 ? 0.4 : -0.3)))); }
  for (const [u, v] of [[A0 + 4.0, 8.4], [A0 + 8.5, 27.6], [A0 + 13.0, 8.4]]) { bag.add('iron', box(X(u - 0.3), Y(0), Z(v - 0.15), X(u + 0.3), Y(0.9), Z(v + 0.15))); col.rect([X(u - 0.3), Z(v - 0.15), X(u + 0.3), Z(v + 0.15)], Y(0), Y(0.9)); for (let k = 0; k < 5; k++) bag.add('cloth_white', lathe([[0.025, 0], [0.025, 0.14]], 5, null, X(u - 0.24 + k * 0.12), Y(0.9), Z(v))); }
  // low kneeling stools and benches in the nave and a few grave slabs let into the floor
  for (let k = 0; k < 6; k++) for (const s of [-1, 1]) { const u = A0 + 1.4 + k * 3.0, v = VC + s * 2.6; bag.add('timber', box(X(u), Y(0.0), Z(v - 0.5), X(u + 0.9), Y(0.42), Z(v + 0.5))); col.rect([X(u), Z(v - 0.5), X(u + 0.9), Z(v + 0.5)], Y(0), Y(0.42)); }
  for (const [u, v] of [[14, 15], [20.5, 21], [30.6, 18], [6.5, 21]]) bag.add('marble_dark', box(X(u - 0.5), Y(0), Z(v - 1.0), X(u + 0.5), Y(0.02), Z(v + 1.0)));
  // hanging lamps on chains and the church's own light
  for (const [u, v, top] of [[11, VC, 14.3], [17, VC, 14.3], [23, VC, 14.3], [30.6, VC, 17.4], [38.5, VC, 14.3], [30.6, 7, 13.5], [30.6, 29, 13.5]]) { bag.add('iron', rod([X(u), Y(top), Z(v)], [X(u), Y(4.1), Z(v)], 0.012, 3)); bag.add('gilt_bronze', lathe([[0.001, 0], [0.18, 0.04], [0.2, 0.12], [0.001, 0.12]], 8, null, X(u), Y(3.85), Z(v))); bag.add('flame', lathe([[0.001, 0], [0.02, 0.02], [0.001, 0.09]], 4, null, X(u), Y(3.97), Z(v))); }
  for (const [u, v, i] of [[5, VC, 3], [14, VC, 4], [22, VC, 4], [30.6, VC, 5], [38.5, VC, 5], [30.6, 6, 3], [30.6, 30, 3], [43.7, 18, 3]]) lights.push({ at: [X(u), Y(5.4), Z(v)], color: '#ffc78a', intensity: i, distance: 15 });
  void z1; void zc; void x1;
}
