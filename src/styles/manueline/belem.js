// The Belém Tower (docs/settlements/manueline-lisbon.md §5), 1514–1519: the irregular hexagonal bastion in the river with its two
// levels of guns, its parapet of battlements carrying shields of the Order of Christ; the tower of four storeys, 12 m wide and
// 30 m high, with the seven-arched loggia, rope string courses, armillary spheres, corner bartizans with domes, crosses. A stone
// causeway to the shore. Element `belem_tower` { c, y (the deck), causeway: [x0, z0, x1, z1] }.
import { box, lathe, rod, sweep, fromTriangles } from '../../core/geom.js';
import { archWall } from '../gothic/nd-interior.js';
import { orderCross, armillary, prism, pinnacle, addBox, wallRun } from './util.js';

const MAT = 'limestone', CARVED = 'limestone_carved';
export const BASTION = [[-13, -6], [13, -6], [16.5, 2], [10.5, 13.5], [-10.5, 13.5], [-16.5, 2]];
export function belem(el, ctx) {
  const { bag, col } = ctx, [cx, cz] = el.c, y = el.y, P = BASTION.map(([u, v]) => [cx + u, cz + v]);
  const grown = (k) => BASTION.map(([u, v]) => [cx + u * k, cz + v * k]);
  // the bastion: ashlar from the river bed to the deck, a rope course, the parapet with its embrasures and battlements
  prism(bag, MAT, P, y - 6, y);
  bag.add(MAT, fromTriangles([]));
  const course = (yy, k = 1.02) => bag.add(CARVED, sweep([[0, 0], [0.12, 0.05], [0.18, 0.15], [0.12, 0.25], [0, 0.3]], grown(k).slice().reverse(), yy, true));
  course(y - 0.4); course(y - 1.4);
  // the lower guns: dark ports just over the water on the five outer faces; the upper guns in the parapet
  let ports = 0;
  for (let i = 0; i < 6; i++) {
    const a = P[i], b = P[(i + 1) % 6], L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L, nx = uz, nz = -ux;
    if (i === 0) continue;                                              // the north face, the landward side with the tower
    const n = Math.max(2, Math.floor(L / 3.4));
    for (let k = 0; k < n; k++) {
      const t = (k + 0.5) / n * L, X = a[0] + ux * t, Z = a[1] + uz * t;
      ports++;
      const gx = Math.abs(ux) > 0.01 ? 0 : 0;
      void gx;
      bag.add('opening', box(X - 0.45 * Math.abs(uz) - 0.06 * Math.abs(nx) - 0.0, y - 1.3, Z - 0.45 * Math.abs(ux) - 0.06 * Math.abs(nz), X + 0.45 * Math.abs(uz) + 0.06 * Math.abs(nx) + 0, y - 0.45, Z + 0.45 * Math.abs(ux) + 0.06 * Math.abs(nz)).translate(nx * 0.02, 0, nz * 0.02));
    }
  }
  void ports;
  // the parapet: a wall 1.1 m thick, 1.3 m high, crenellated; shield with the cross on each merlon of the outer faces
  const G = 0.55;
  for (let i = 0; i < 6; i++) {
    const a = grown(1)[i], b = grown(1)[(i + 1) % 6];
    // inset the parapet by half its thickness
    const inset = (p) => [p[0] + (cx - p[0]) * 0.035, p[1] + (cz - p[1]) * 0.035];
    const A = inset(a), B = inset(b), L = Math.hypot(B[0] - A[0], B[1] - A[1]);
    const gap = i === 0 ? [{ at: (el.causeway[0] + el.causeway[2]) / 2 - A[0], w: 3.4, h: 3 }] : [];
    wallRun(ctx, A, B, 1.1, y, y + 1.3, MAT, gap, y + 1.3);
    const ux = (B[0] - A[0]) / L, uz = (B[1] - A[1]) / L, nx = uz, nz = -ux, n = Math.floor(L / 2.2);
    for (let k = 0; k < n; k++) {
      const t = (k + 0.5) / n * L, X = A[0] + ux * t, Z = A[1] + uz * t;
      if (i === 0 && Math.abs(X - (el.causeway[0] + el.causeway[2]) / 2) < 2.4) continue;
      bag.add(MAT, box(X - 0.5, y + 1.3, Z - 0.5, X + 0.5, y + 2.0, Z + 0.5).translate(0, 0, 0));
      const fx = X + nx * 0.58, fz = Z + nz * 0.58, face = Math.abs(nx) > Math.abs(nz) ? (nx > 0 ? 'e' : 'w') : (nz > 0 ? 's' : 'n');
      bag.add('plaster_white', box(face === 'e' || face === 'w' ? fx - 0.02 : fx - 0.4, y + 1.35, face === 'n' || face === 's' ? fz - 0.02 : fz - 0.4, face === 'e' || face === 'w' ? fx + 0.02 : fx + 0.4, y + 1.95, face === 'n' || face === 's' ? fz + 0.02 : fz + 0.4));
      orderCross(bag, 'wall_red', fx + nx * 0.03, y + 1.65, fz + nz * 0.03, 0.22, face, 0.02);
    }
  }
  // the deck: walkable inside the parapet; the causeway lands on its north face
  bag.add('limestone', box(cx - 15.6, y - 0.05, cz - 6.0, cx + 15.6, y + 0.0, cz + 10)); col.floor([cx - 12.5, cz - 6.2, cx + 12.5, cz + 10], y);
  col.floor([cx - 9.5, cz + 10, cx + 9.5, cz + 12.3], y);
  // ── the tower: 12 m wide, 11 deep, 30 m high on the landward side of the deck
  const tx0 = cx - 6, tx1 = cx + 6, tz0 = cz - 5, tz1 = cz + 6, top = y + 28.5;
  bag.add(MAT, box(tx0, y - 0.2, tz0, tx1, top, tz1)); col.rect([tx0, tz0, tx1, tz1], y, top);
  for (const yy of [6.4, 12.6, 18.8, 25.0]) bag.add(CARVED, sweep([[0, 0], [0.18, 0.05], [0.28, 0.2], [0.18, 0.35], [0, 0.4]], [[tx0, tz0], [tx1, tz0], [tx1, tz1], [tx0, tz1]].reverse(), y + yy, true));
  // windows: dark panels framed in stone on the four faces of each storey (the south face carries the loggia)
  const win = (face, u, yy, w, h) => {
    const X = face === 'e' ? tx1 : face === 'w' ? tx0 : u, Z = face === 's' ? tz1 : face === 'n' ? tz0 : u, ax = face === 'e' || face === 'w';
    const o = face === 'e' || face === 's' ? 1 : -1;
    const bx = (d) => (ax ? [X + o * d, Z - w / 2, X + o * d, Z + w / 2] : [X - w / 2, Z + o * d, X + w / 2, Z + o * d]);
    const a = bx(0.0), b = bx(0.08), f = bx(0.22);
    const mk = (p, q, y0, y1) => box(Math.min(p[0], q[0]) - (ax ? 0 : 0), y + y0, Math.min(p[1], q[1]), Math.max(p[0], q[0]) + (ax ? 0.001 : 0), y + y1, Math.max(p[1], q[1]) + (ax ? 0 : 0.001));
    void a; void b; void f; void mk;
    const x0 = ax ? Math.min(X, X + o * 0.12) : X - w / 2, x1 = ax ? Math.max(X, X + o * 0.12) : X + w / 2, z0 = ax ? Z - w / 2 : Math.min(Z, Z + o * 0.12), z1 = ax ? Z + w / 2 : Math.max(Z, Z + o * 0.12);
    bag.add('opening', box(x0, y + yy, z0, x1, y + yy + h, z1));
    const fr = 0.22, ex0 = ax ? Math.min(X, X + o * 0.2) : X - w / 2 - fr, ex1 = ax ? Math.max(X, X + o * 0.2) : X + w / 2 + fr, ez0 = ax ? Z - w / 2 - fr : Math.min(Z, Z + o * 0.2), ez1 = ax ? Z + w / 2 + fr : Math.max(Z, Z + o * 0.2);
    bag.add(CARVED, box(ex0, y + yy + h, ez0, ex1, y + yy + h + fr, ez1)); bag.add(CARVED, box(ex0, y + yy - fr, ez0, ex1, y + yy, ez1));
    if (ax) { bag.add(CARVED, box(ex0, y + yy, Z - w / 2 - fr, ex1, y + yy + h, Z - w / 2)); bag.add(CARVED, box(ex0, y + yy, Z + w / 2, ex1, y + yy + h, Z + w / 2 + fr)); }
    else { bag.add(CARVED, box(X - w / 2 - fr, y + yy, ez0, X - w / 2, y + yy + h, ez1)); bag.add(CARVED, box(X + w / 2, y + yy, ez0, X + w / 2 + fr, y + yy + h, ez1)); }
  };
  for (const face of ['n', 'e', 'w']) for (const [yy, h] of [[2.4, 1.6], [8.4, 2.0], [20.8, 2.0], [26.6, 1.6]]) for (const u of face === 'n' ? [cx - 3, cx + 3] : [cz + 0.5]) win(face, u, yy, face === 'n' ? 1.1 : 1.3, h);
  for (const [yy, h] of [[2.4, 1.6], [20.8, 2.0], [26.6, 1.6]]) for (const u of [cx - 3, cx + 3]) win('s', u, yy, 1.1, h);
  // the loggia: seven arches on the south face at the third storey, dark behind, a balustrade, the armillary sphere and the shield above
  const L = [];
  archWall(L, (u, yy, d) => [tx0 + 1 + u, yy, tz1 + d * 0.0 + 0.0 - 0.0 + d], { u0: 0, u1: 10, d0: 0, d1: 0.35, y0: y + 12.8, y1: y + 18.6, openings: Array.from({ length: 7 }, (_, k) => ({ uc: 0.72 + k * 1.43, r: 0.55, sill: y + 14.2, spring: y + 16.2, f: 0.5 })), n: 6 });
  bag.add(CARVED, fromTriangles(L));
  addBox(bag, 'opening', tx0 + 1, y + 14.1, tz1 + 0.02, tx1 - 1, y + 17, tz1 + 0.06);
  addBox(bag, CARVED, tx0 + 0.9, y + 12.6, tz1, tx1 - 0.9, y + 14.2, tz1 + 0.5);
  for (let k = 0; k <= 7; k++) addBox(bag, CARVED, tx0 + 1 + k * 1.43 - 0.08, y + 12.6, tz1 + 0.4, tx0 + 1 + k * 1.43 + 0.08, y + 13.6, tz1 + 0.5);
  armillary(bag, CARVED, cx, y + 21.8 + 1.2, tz1 + 0.5, 1.0);
  for (const [dx, s] of [[-4, 'cross'], [4, 'cross']]) { addBox(bag, 'plaster_white', cx + dx - 0.9, y + 22.0, tz1, cx + dx + 0.9, y + 24.2, tz1 + 0.1); orderCross(bag, 'wall_red', cx + dx, y + 23.1, tz1 + 0.12, 0.7, 's', 0.03); void s; }
  for (const [dx] of [[-3.6], [3.6]]) { addBox(bag, 'opening', cx + dx - 0.5, y + 8.6, tz1 + 0.0, cx + dx + 0.5, y + 10.6, tz1 + 0.12); bag.add(CARVED, lathe([[0.22, 0], [0.26, 0.5], [0.2, 1.3], [0.12, 1.5], [0.001, 1.6]], 8, null, cx + dx, y + 8.6, tz1 + 0.4)); }  // St Vincent and St Michael in their niches
  // the tower's terrace: parapet with shields, the four bartizans with domes at the corners, a Virgin and Child in her niche
  const ty = top;
  bag.add(MAT, box(tx0 - 0.4, ty, tz0 - 0.4, tx1 + 0.4, ty + 0.4, tz1 + 0.4));
  for (const [a, b] of [[[tx0 - 0.4, tz0 - 0.4], [tx1 + 0.4, tz0 - 0.4]], [[tx0 - 0.4, tz1 + 0.4], [tx1 + 0.4, tz1 + 0.4]], [[tx0 - 0.4, tz0 - 0.4], [tx0 - 0.4, tz1 + 0.4]], [[tx1 + 0.4, tz0 - 0.4], [tx1 + 0.4, tz1 + 0.4]]]) {
    const Lg = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / Lg, uz = (b[1] - a[1]) / Lg, n = Math.floor(Lg / 1.6), nx = uz, nz = -ux;
    bag.add(MAT, box(Math.min(a[0], b[0]) - 0.0, ty + 0.4, Math.min(a[1], b[1]) - 0.0, Math.max(a[0], b[0]) + 0.0 + (ux === 0 ? 0.45 : 0), ty + 1.1, Math.max(a[1], b[1]) + (uz === 0 ? 0.45 : 0)));
    for (let k = 0; k < n; k++) {
      const t = (k + 0.5) / n * Lg, X = a[0] + ux * t, Z = a[1] + uz * t, face = Math.abs(nx) > Math.abs(nz) ? (nx > 0 ? 'e' : 'w') : (nz > 0 ? 's' : 'n');
      bag.add(MAT, box(X - 0.4, ty + 1.1, Z - 0.4, X + 0.4, ty + 1.6, Z + 0.4));
      void face;
    }
  }
  for (const [bx, bz] of [[tx0 - 0.2, tz0 - 0.2], [tx1 + 0.2, tz0 - 0.2], [tx0 - 0.2, tz1 + 0.2], [tx1 + 0.2, tz1 + 0.2]]) {
    bag.add(MAT, lathe([[0.4, 0], [1.1, 0.5], [1.35, 1.0], [1.3, 3.2]], 10, null, bx + Math.sign(bx - cx) * 0.55, ty - 1.4, bz + Math.sign(bz - cz) * 0.55));
    bag.add(CARVED, lathe([[1.3, 0], [1.45, 0.15], [1.2, 0.5], [0.9, 1.2], [0.4, 1.9], [0.001, 2.3]], 12, null, bx + Math.sign(bx - cx) * 0.55, ty + 1.8, bz + Math.sign(bz - cz) * 0.55));
    pinnacle(bag, CARVED, bx + Math.sign(bx - cx) * 0.55, ty + 4.0, bz + Math.sign(bz - cz) * 0.55, 0.2, 0.9, 6);
    armillary(bag, CARVED, bx + Math.sign(bx - cx) * 0.55, ty + 1.0, bz + Math.sign(bz - cz) * 1.9, 0.0001 + 0.0);
  }
  // ── the causeway from the shore to the deck: stone on piers, a low parapet
  const [kx0, kz0, kx1, kz1] = el.causeway;
  bag.add(MAT, box(kx0, -6, kz0, kx1, y - 0.1, kz1)); bag.add('limestone', box(kx0, y - 0.1, kz0, kx1, y, kz1)); col.floor([kx0, kz0, kx1, kz1], y);
  for (const x of [kx0 - 0.3, kx1]) { bag.add(MAT, box(x, y, kz0, x + 0.3, y + 0.9, kz1)); col.rect([x, kz0, x + 0.3, kz1], y, y + 0.9); }
}
