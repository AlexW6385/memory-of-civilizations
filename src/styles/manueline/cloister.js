// The cloister of the Jerónimos (docs/settlements/manueline-lisbon.md §4): 55 × 55 m, two storeys; the lower arcade of six
// round arches a wing on piers carved with rope and the cross of the Order of Christ, the upper gallery set back, of paired
// arches with an armillary sphere over each bay; net vaults over the galleries; a stair in the east wing; the court with its
// basin and paths. Element `cloister` { rect, y }.
import { box, lathe, rod, fromTriangles } from '../../core/geom.js';
import { archWall } from '../gothic/nd-interior.js';
import { ropeColumn, netVault, armillary, orderCross, wallRun, addBox } from './util.js';

const G = 7, MAT = 'limestone_yellow', CARVED = 'limestone_carved', LOW = 7.2, UP = 13.6;
export function cloisterFrame(rect) {
  const [X0, Z0, X1, Z1] = rect;
  return { X0, Z0, X1, Z1, court: [X0 + G, Z0 + G, X1 - G, Z1 - G], stair: [X1 - 6.4, Z0 + 9, X1 - 3.9, Z0 + 23] };
}
export function cloister(el, ctx) {
  const { bag, col } = ctx, y = el.y ?? 0, F = cloisterFrame(el.rect), { X0, Z0, X1, Z1, court, stair } = F;
  const [cx0, cz0, cx1, cz1] = court, pitch = (cx1 - cx0) / 6;
  // wings: [name, frame M(u, y, d) with u along the court edge from the first corner, d toward the gallery (outward), inward unit]
  const wings = [
    { n: 'n', M: (u, yy, d) => [cx0 + u, yy, cz0 - d], len: cx1 - cx0 },
    { n: 's', M: (u, yy, d) => [cx1 - u, yy, cz1 + d], len: cx1 - cx0 },
    { n: 'e', M: (u, yy, d) => [cx1 + d, yy, cz0 + u], len: cz1 - cz0 },
    { n: 'w', M: (u, yy, d) => [cx0 - d, yy, cz1 - u], len: cz1 - cz0 },
  ];
  const tris = [], tris2 = [];
  for (const w of wings) {
    // the lower arcade: six arches, centred on the court edge (d from −0.5 to 0.5 outward ⇒ shift by −0.5)
    const low = Array.from({ length: 6 }, (_, k) => ({ uc: pitch * (k + 0.5), r: 2.7, sill: y, spring: y + 4.2, f: 0.5 }));
    archWall(tris, (u, yy, d) => w.M(u, yy, d - 0.5), { u0: 0, u1: w.len, d0: 0, d1: 1.0, y0: y - 0.2, y1: y + LOW, openings: low, n: 10 });
    const up = [];
    for (let k = 0; k < 6; k++) for (const s of [-1, 1]) up.push({ uc: pitch * (k + 0.5) + s * 1.55, r: 1.2, sill: y + 8.3, spring: y + 10.6, f: 0.5 });
    archWall(tris2, (u, yy, d) => w.M(u, yy, d + 0.5), { u0: 0, u1: w.len, d0: 0, d1: 1.0, y0: y + LOW - 0.2, y1: y + UP, openings: up, n: 8 });
    // collision: the piers between the arches, the parapet of the upper gallery
    for (let k = 0; k <= 6; k++) {
      const a = k === 0 ? 0 : pitch * (k - 0.5) + 2.7, b = k === 6 ? w.len : pitch * (k + 0.5) - 2.7;
      const p = w.M(a, 0, 0), q = w.M(b, 0, 1.0);
      col.rect([Math.min(p[0], q[0]), Math.min(p[2], q[2]), Math.max(p[0], q[0]), Math.max(p[2], q[2])], y, y + LOW);
    }
    for (let k = 0; k < 6; k++) {
      const uc = pitch * (k + 0.5), a = w.M(uc, 0, 0), s = w.M(uc, 0, 0.7);
      // the cross of the Order on the face of each pier (between the arches), the carved colonnette on it, the armillary over the upper bay
      const pu = pitch * k, pf = w.M(pu, 0, -0.55);
      orderCross(bag, 'wall_red', pf[0], y + 5.9, pf[2], 0.34, w.n === 'n' ? 's' : w.n === 's' ? 'n' : w.n === 'e' ? 'w' : 'e');
      ropeColumn({ bag, col: { circle() {} } }, pf[0], pf[2], y, 4.2, 0.13, { mat: CARVED, carved: CARVED, collide: false, strands: 2, turns: 4, capital: false });
      const ag = w.M(uc, 0, 1.6);
      armillary(bag, CARVED, ag[0], y + 12.6, ag[2], 0.6);
      void a; void s;
    }
    // the cornice over the lower storey with its rope; the parapet is the upper wall's base
    const c0 = w.M(0, 0, -0.9), c1 = w.M(w.len, 0, 0.1);
    addBox(bag, CARVED, Math.min(c0[0], c1[0]), y + LOW, Math.min(c0[2], c1[2]), Math.max(c0[0], c1[0]), y + LOW + 0.35, Math.max(c0[2], c1[2]));
    const r0 = w.M(0, 0, -0.95), r1 = w.M(w.len, 0, -0.95);
    bag.add(CARVED, rod([r0[0], y + LOW + 0.5, r0[2]], [r1[0], y + LOW + 0.5, r1[2]], 0.12, 5));
    // the upper gallery's parapet (collision)
    const q0 = w.M(0, 0, 0.5), q1 = w.M(w.len, 0, 1.5);
    col.rect([Math.min(q0[0], q1[0]), Math.min(q0[2], q1[2]), Math.max(q0[0], q1[0]), Math.max(q0[2], q1[2])], y + 7, y + 8.9);
  }
  bag.add(MAT, fromTriangles(tris)); bag.add(MAT, fromTriangles(tris2));
  // the four corner piers of the court
  for (const [x, z] of [[cx0, cz0], [cx1, cz0], [cx0, cz1], [cx1, cz1]]) { addBox(bag, MAT, x - 0.8, y - 0.2, z - 0.8, x + 0.8, y + UP, z + 0.8); col.rect([x - 0.8, z - 0.8, x + 0.8, z + 0.8], y, y + UP); }
  // gallery floors and ceilings
  const rings = [[X0, Z0, X1, Z0 + G], [X0, Z1 - G, X1, Z1], [X0, Z0 + G, X0 + G, Z1 - G], [X1 - G, Z0 + G, X1, Z1 - G]];
  for (const r of rings) { bag.add('limestone', box(r[0], y - 0.4, r[1], r[2], y, r[3])); col.floor(r, y); }
  const cellsX = [X0, ...Array.from({ length: 7 }, (_, k) => cx0 + pitch * k), X1], cellsZ = [Z0, ...Array.from({ length: 7 }, (_, k) => cz0 + pitch * k), Z1];
  const inStair = (r) => r[0] < stair[2] + 0.5 && r[2] > stair[0] - 0.5 && r[1] < stair[3] + 0.5 && r[3] > stair[1] - 0.5;
  for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) {
    if (i > 0 && i < 7 && j > 0 && j < 7) continue;
    const r = [cellsX[i], cellsZ[j], cellsX[i + 1], cellsZ[j + 1]];
    if (inStair(r) && i === 7) continue;
    netVault(bag, r, y + 4.2, y + 6.3, { mat: 'limestone', rib: MAT, rich: false, n: 4 });
  }
  // the upper floor (with the stairwell), the upper gallery's walkable floor, the roof
  const hole = [stair[0], stair[1], stair[2], stair[3] + 0.0];
  for (const r of rings) {
    let pieces = [r];
    if (r === rings[3]) pieces = [[r[0], r[1], hole[0], r[3]], [hole[2], r[1], r[2], r[3]], [hole[0], hole[3], hole[2], r[3]], [hole[0], r[1], hole[2], hole[1]]];
    for (const p of pieces) if (p[2] - p[0] > 0.01 && p[3] - p[1] > 0.01) { bag.add('limestone', box(p[0], y + 6.6, p[1], p[2], y + 7.0, p[3])); col.floor(p, y + 7.0); }
    bag.add('limestone', box(r[0], y + UP, r[1], r[2], y + UP + 0.45, r[3]));
  }
  // the stair
  const n = 41, [sx0, sz0, sx1, sz1] = stair;
  for (let i = 0; i < n; i++) { const f1 = (i + 1) / n; bag.add('limestone', box(sx0, y - 0.01, sz1 - (sz1 - sz0) * f1, sx1, y + 7 * f1, sz1)); }
  col.ramp(stair, y, y + 7, 'n');
  addBox(bag, 'limestone', sx0 - 0.25, y, sz0, sx0, y + 7.9, sz1); col.rect([sx0 - 0.25, sz0, sx0, sz1], y, y + 7.9);
  // the roof's parapet and corner pinnacles on the outer edge
  for (const [a, b] of [[[X0, Z0], [X1, Z0]], [[X0, Z0], [X0, Z1]], [[X1, Z0], [X1, Z1]]]) {
    bag.add(CARVED, rod([a[0], y + UP + 1.1, a[1]], [b[0], y + UP + 1.1, b[1]], 0.14, 5));
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]), m = Math.floor(L / 2.2);
    for (let k = 0; k <= m; k++) { const t = k / m; addBox(bag, MAT, a[0] + (b[0] - a[0]) * t - 0.2, y + UP + 0.45, a[1] + (b[1] - a[1]) * t - 0.2, a[0] + (b[0] - a[0]) * t + 0.2, y + UP + 1.4, a[1] + (b[1] - a[1]) * t + 0.2); }
  }
  // the outer walls of the galleries (the monastery's rooms lie beyond): north, west, east; small windows at both storeys
  const gaps = (len, y0s) => Array.from({ length: 6 }, (_, k) => ({ at: 7 + pitch * (k + 0.5), w: 1.1, h: 1.6, y0: y0s })).concat(Array.from({ length: 6 }, (_, k) => ({ at: 7 + pitch * (k + 0.5), w: 1.1, h: 1.6, y0: y + 9 })));
  void gaps;
  const wg = (y0s) => [{ y0s }].length ? Array.from({ length: 6 }, (_, k) => 7 + pitch * (k + 0.5)).flatMap((at) => [{ at, w: 1.1, h: 1.7, y0: y + 2.2 }, { at, w: 1.1, h: 1.7, y0: y + 9.2 }]) : [];
  wallRun(ctx, [X0, Z0 + 0.6], [X1, Z0 + 0.6], 1.2, y - 0.2, y + UP + 0.4, MAT, wg(0));
  wallRun(ctx, [X0 + 0.6, Z0], [X0 + 0.6, Z1], 1.2, y - 0.2, y + UP + 0.4, MAT, wg(0));
  wallRun(ctx, [X1 - 0.6, Z0], [X1 - 0.6, Z1], 1.2, y - 0.2, y + UP + 0.4, MAT, wg(0));
  // the court: the cross of paths, the basin with its water and a stone cross
  const mx = (cx0 + cx1) / 2, mz = (cz0 + cz1) / 2;
  bag.add('limestone', box(cx0, y - 0.1, mz - 1.0, cx1, y + 0.03, mz + 1.0)); col.floor([cx0, mz - 1.0, cx1, mz + 1.0], y + 0.03);
  bag.add('limestone', box(mx - 1.0, y - 0.1, cz0, mx + 1.0, y + 0.03, cz1)); col.floor([mx - 1.0, cz0, mx + 1.0, cz1], y + 0.03);
  bag.add('limestone', lathe([[3.4, 0], [3.4, 0.9], [3.0, 0.9], [3.0, 0.5], [0.001, 0.5]], 20, null, mx, y, mz)); col.circle(mx, mz, 3.4, y, y + 0.9);
  bag.add('water', lathe([[2.95, 0.55], [0.001, 0.55]], 20, null, mx, y, mz));
  bag.add(CARVED, lathe([[0.6, 0], [0.5, 0.6], [0.2, 1.0], [0.18, 3.2], [0.001, 3.3]], 8, null, mx, y + 0.5, mz));
  addBox(bag, CARVED, mx - 0.7, y + 3.2, mz - 0.1, mx + 0.7, y + 3.5, mz + 0.1); addBox(bag, CARVED, mx - 0.1, y + 2.7, mz - 0.1, mx + 0.1, y + 4.2, mz + 0.1);
}
