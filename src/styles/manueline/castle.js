// São Jorge Castle about 1520 (docs/settlements/manueline-lisbon.md §11): the rectangular citadel with its ten towers (four corner
// towers, three on the sides, two flanking the south gate and the tower of the records in the middle), the walls with a reachable
// wall-walk behind an outer parapet and two stairs up to it; the gate with its portcullis; in the court the hall of the old royal
// palace (the alcáçova), the barracks, the stable, the well and the cistern, and the Torre do Tombo, the tower of the kingdom's
// records, in two storeys. Element `castle` { rect, y, seed }.
import { box, lathe, rod, frustum, fromTriangles } from '../../core/geom.js';
import { archWall } from '../gothic/nd-interior.js';
import { frame } from '../greek/agora.js';
import { rng, gable, orderCross, wallRun } from './util.js';
import { kit } from './interiors.js';

const LIME = 'limestone';

export function castle(el, ctx) {
  const { bag, col, lights } = ctx, [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, rand = rng(el.seed ?? 3), Y = (h) => y + h;
  const xm = (x0 + x1) / 2, zm = (z0 + z1) / 2, WT = 2.8, WH = 9.5, GATE = 2.2;
  bag.add(LIME, box(x0 - 3, y - 9, z0 - 3, x1 + 3, y - 0.2, z1 + 3));
  // the court floor, and the walls: wall-walk on the inner 1.9 m, an outer parapet 0.9 m thick with its merlons
  bag.add('pebbles', box(x0 + 1.4, y - 0.2, z0 + 1.4, x1 - 1.4, y, z1 - 1.4)); col.floor([x0 + 1.4, z0 + 1.4, x1 - 1.4, z1 - 1.4], y);
  bag.add('flagstone', box(xm - GATE, y - 0.2, z1 - 1.4, xm + GATE, y, z1 + 1.4));
  const gate = [{ at: xm - x0, w: 2 * GATE, h: 5.0 }];
  const wall = (a, b, gap) => wallRun(ctx, a, b, WT, y - 0.2, Y(WH), LIME, gap ?? []);
  wall([x0, z0], [x1, z0]); wall([x0, z0], [x0, z1]); wall([x1, z0], [x1, z1]); wall([x0, z1], [x1, z1], gate);
  const TR = 4;
  // the outer parapets and the merlons on them; the wall-walk's floor between the towers
  const side = (a, b, outN) => {   // a→b along the wall; outN: unit normal to the outside
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L;
    const P = (s, o) => [a[0] + ux * s + outN[0] * o, a[1] + uz * s + outN[1] * o];
    const s0 = TR, s1 = L - TR;
    // parapet: from o = 0.5 to 1.4 outward of the wall's centre line
    const q = [P(s0, 0.5), P(s1, 0.5), P(s1, 1.4), P(s0, 1.4)];
    const bx = [Math.min(...q.map((p) => p[0])), Math.min(...q.map((p) => p[1])), Math.max(...q.map((p) => p[0])), Math.max(...q.map((p) => p[1]))];
    bag.add(LIME, box(bx[0], Y(WH), bx[1], bx[2], Y(WH + 1.2), bx[3])); col.rect(bx, Y(WH), Y(WH + 3));
    const n = Math.floor((s1 - s0) / 2.4);
    for (let k = 0; k < n; k++) { const m = P(s0 + (k + 0.5) * (s1 - s0) / n, 0.95); bag.add(LIME, box(m[0] - 0.55, Y(WH + 1.2), m[1] - 0.55, m[0] + 0.55, Y(WH + 2.4), m[1] + 0.55)); }
    // the walk's floor (inner side, from the parapet to the inner face), split at the gate
    const w0 = P(s0, -1.4), w1 = P(s1, 0.5), wb = [Math.min(w0[0], w1[0]), Math.min(w0[1], w1[1]), Math.max(w0[0], w1[0]), Math.max(w0[1], w1[1])];
    col.floor(wb, Y(WH));
  };
  side([x0, z0], [x1, z0], [0, -1]); side([x0, z0], [x0, z1], [-1, 0]); side([x1, z0], [x1, z1], [1, 0]); side([x0, z1], [x1, z1], [0, 1]);
  // the towers: corners, sides, the gate's pair; crenellated tops, arrow slits, a string course
  const tower = (tx, tz, r = 4, h = 15) => {
    bag.add(LIME, box(tx - r, y - 0.2, tz - r, tx + r, Y(h), tz + r)); col.rect([tx - r, tz - r, tx + r, tz + r], y, Y(h + 1));
    bag.add('limestone_carved', box(tx - r - 0.15, Y(h - 1.2), tz - r - 0.15, tx + r + 0.15, Y(h - 0.7), tz + r + 0.15));
    for (let u = -r + 0.6; u < r - 0.6; u += 1.8) for (const [mx, mz] of [[tx + u, tz - r], [tx + u, tz + r - 0.8], [tx - r, tz + u], [tx + r - 0.8, tz + u]]) bag.add(LIME, box(mx - 0.4, Y(h), mz - 0.4, mx + 0.4, Y(h + 1.4), mz + 0.4));
    for (const sz of [-1, 1]) { const zz = tz + sz * r; bag.add('opening', box(tx - 0.1, Y(7.5), Math.min(zz, zz + sz * 0.03), tx + 0.1, Y(9.3), Math.max(zz, zz + sz * 0.03))); const xx = tx + sz * r; bag.add('opening', box(Math.min(xx, xx + sz * 0.03), Y(7.5), tz - 0.1, Math.max(xx, xx + sz * 0.03), Y(9.3), tz + 0.1)); }
  };
  for (const [tx, tz] of [[x0, z0], [x1, z0], [x0, z1], [x1, z1], [xm, z0], [x0, zm], [x1, zm]]) tower(tx, tz);
  for (const s of [-1, 1]) tower(xm + s * (GATE + 3.0), z1, 3.0, 13);                         // the gate's towers (3 m half-width: 6 m square)
  // the gate: the portcullis raised into its slot, iron-bound leaves folded back, the arms over it
  for (const s of [-1, 1]) { bag.add('wood_dark', box(xm + s * GATE - (s > 0 ? 0.5 : 0), Y(0), z1 + 1.45, xm + s * GATE + (s > 0 ? 0 : 0.5), Y(4.6), z1 + 1.65)); }
  for (let k = 0; k < 8; k++) bag.add('iron', box(xm - GATE + 0.3 + k * 0.5, Y(4.0), z1 - 0.12, xm - GATE + 0.36 + k * 0.5, Y(5.0), z1 - 0.06));
  bag.add('iron', box(xm - GATE, Y(4.5), z1 - 0.12, xm + GATE, Y(4.58), z1 - 0.06));
  orderCross(bag, 'wall_red', xm, Y(7.0), z1 + 1.45, 0.8, 's', 0.05);
  // the two stairs from the court up to the wall-walk, along the west and east walls
  for (const [fx, dirx] of [[x0 + 1.4, 1], [x1 - 1.4, -1]]) {
    const n = 38, sz0 = zm + 8, dz = 10.6 / n, xa = dirx > 0 ? fx : fx - 1.4, xb = xa + 1.4;
    for (let k = 0; k < n; k++) bag.add(LIME, box(xa, Y(0), sz0 + k * dz, xb, Y(WH * (k + 1) / n), sz0 + (k + 1) * dz));
    col.ramp([xa, sz0, xb, sz0 + 10.6], y, Y(WH), 's');
    for (let k = 0; k <= 4; k++) { const zz = sz0 + k * 2.65, hh = WH * k / 4; bag.add('wood_dark', box(dirx > 0 ? xb - 0.06 : xa, Y(hh + 0.1), zz - 0.04, dirx > 0 ? xb : xa + 0.06, Y(hh + 1.1), zz + 0.04)); }
    bag.add('wood_dark', rod([dirx > 0 ? xb - 0.03 : xa + 0.03, Y(1.1), sz0], [dirx > 0 ? xb - 0.03 : xa + 0.03, Y(WH + 1.1), sz0 + 10.6], 0.035, 4));
    col.rect([dirx > 0 ? xb : xa - 0.2, sz0, dirx > 0 ? xb + 0.2 : xa, sz0 + 10.6], y, Y(WH));
  }

  // ── a hollow building in the court: walls with a door arch at its front, a floor, beams, a gabled roof; the frame to furnish it
  const hollow = (rect, front, h, { rise = 3.0, T = 0.7, dw = 1.3, mat = 'limewash_white', roof = 'roof_tile', beams = true } = {}) => {
    const F = frame(rect, front), { L, D } = F, uc = L / 2, spring = h - 2.2 - dw * 0, r = dw;
    const R = (u0, v0, u1, v1, a, b, m = mat, solid = true) => { const q = F.R(u0, v0, u1, v1); bag.add(m, box(q[0], Y(a), q[1], q[2], Y(b), q[3])); if (solid) col.rect(q, Y(a), Y(b + 1)); };
    const tri = []; archWall(tri, (u, yy, d) => { const p = F.P(u, d); return [p[0], yy, p[1]]; }, { u0: 0, u1: L, d0: 0, d1: T, y0: Y(0), y1: Y(h), openings: [{ uc, r, sill: Y(0), spring: Y(2.4), f: 0.5 }], n: 6 });
    bag.add(mat, fromTriangles(tri));
    col.rect(F.R(0, 0, uc - r, T), Y(0), Y(h + 1)); col.rect(F.R(uc + r, 0, L, T), Y(0), Y(h + 1)); col.rect(F.R(uc - r, 0, uc + r, T), Y(2.4 + r), Y(h + 1));
    R(0, 0, T, D, 0, h); R(L - T, 0, L, D, 0, h); R(0, D - T, L, D, 0, h);
    { const q = F.R(uc - r - 0.25, -0.1, uc + r + 0.25, 0.0); bag.add('limestone', box(q[0], Y(0), q[1], q[2], Y(2.4 + r + 0.25), q[3])); }
    { const q = F.R(T, T, L - T, D - T); bag.add('cotto_floor', box(q[0], y, q[1], q[2], y + 0.04, q[3])); col.floor(q, Y(0.04)); }
    if (beams) for (let u = 1.2; u < L - T; u += 1.8) R(u - 0.1, T, u + 0.1, D - T, h - 0.35, h, 'wood_dark', false);
    gable(bag, roof, rect, Y(h), rise, F.alongX, 0.6);
    bag.add('limestone_carved', box(rect[0] - 0.1, Y(h - 0.3), rect[1] - 0.1, rect[2] + 0.1, Y(h + 0.1), rect[3] + 0.1));
    return F;
  };
  const lamp = (F, u, v, hgt, i = 4, d = 12) => { const p = F.P(u, v); lights.push({ at: [p[0], Y(hgt), p[1]], color: '#ffc27a', intensity: i, distance: d }); };

  // the hall of the old palace: along the north wall, its door to the south: a dais with the chair, long tables, the hearth, tapestries
  { const F = hollow([xm - 14, z0 + 5, xm + 14, z0 + 16], 's', 7.0, { rise: 3.2, dw: 1.5 }), K = kit(ctx, F, y + 0.04, rand), { L, D } = F;
    K.A('limestone', 5.0, D - 3.4, L - 5.0, D - 0.7, 0, 0.35, true); K.A('cloth_maroon', 6.0, D - 3.0, L - 6.0, D - 0.9, 0.35, 0.38);
    K.A('wood_dark', L / 2 - 0.8, D - 2.0, L / 2 + 0.8, D - 1.1, 0.35, 0.8, true); K.A('wood_dark', L / 2 - 0.8, D - 1.2, L / 2 + 0.8, D - 1.0, 0.8, 2.2); K.A('gilt_bronze', L / 2 - 0.85, D - 1.2, L / 2 - 0.7, D - 1.0, 0.8, 2.3); K.A('gilt_bronze', L / 2 + 0.7, D - 1.2, L / 2 + 0.85, D - 1.0, 0.8, 2.3);
    K.A('cloth_maroon', L / 2 - 3, D - 0.78, L / 2 + 3, D - 0.72, 1.4, 5.8); K.A('wall_red', L / 2 - 0.3, D - 0.82, L / 2 + 0.3, D - 0.78, 2.6, 4.8); K.A('wall_red', L / 2 - 0.9, D - 0.82, L / 2 + 0.9, D - 0.78, 3.3, 3.7);
    for (const v of [4.4, 7.0]) { K.table(L / 2, v, 14, 0.95); K.bench(L / 2 - 7, L / 2 + 7, v - 0.95); K.bench(L / 2 - 7, L / 2 + 7, v + 0.95); }
    K.hearth(L - 3.0, D - 0.7, 2.0); K.hearth(3.0, D - 0.7, 2.0);
    for (const u of [2.0, L - 2.0]) { K.chest(u, 2.6, 1.1, 0.55, 'wood_dark'); }
    for (const [u, c] of [[4.0, 'cloth_indigo'], [L - 4.0, 'cloth_ochre']]) K.A(c, u - 1.4, 0.72, u + 1.4, 0.77, 1.5, 5.4);
    for (let k = 0; k < 6; k++) K.Lh('glaze_white', [[0.001, 0], [0.05, 0], [0.08, 0.1], [0.04, 0.22], [0.001, 0.24]], L / 2 - 5 + k * 2, 4.4, 0.78, 8);
    lamp(F, L * 0.25, 5, 4.6, 5, 14); lamp(F, L * 0.75, 5, 4.6, 5, 14);
  }
  // the barracks on the west: bunks along the walls, a table, a rack of pikes, the hearth, chests and barrels
  { const F = hollow([x0 + 5, zm + 6, x0 + 17, zm + 24], 'e', 4.6, { rise: 2.4, dw: 1.2 }), K = kit(ctx, F, y + 0.04, rand), { L, D } = F;
    for (const u of [2.0, 4.2, 6.4, 11.6, 13.8, 16.0]) K.bed(u, D - 2.75, 1.0, 2.0, 'v');
    for (const u of [3.0, 15.0]) K.bed(u, 1.0, 1.0, 2.0, 'v');
    K.table(L / 2, D / 2, 3.0, 1.0); K.bench(L / 2 - 1.5, L / 2 + 1.5, D / 2 - 0.9); K.bench(L / 2 - 1.5, L / 2 + 1.5, D / 2 + 0.9);
    for (let k = 0; k < 4; k++) { const u = L - 1.0 - k * 0.5; K.Rod('wood_dark', [u, D - 0.5, 0.05], [u + 0.05, D - 0.4, 2.4], 0.02, 4); K.Lh('iron', [[0.001, 0], [0.03, 0.0], [0.04, 0.22], [0.001, 0.3]], u + 0.05, D - 0.4, 2.4, 4); }
    K.hearth(L / 2, D - 0.7, 1.8); K.barrel(1.0, D - 0.9); K.barrel(1.8, D - 0.9); K.chest(L - 1.2, 1.3, 1.0, 0.5, 'wood_dark');
    lamp(F, L / 2, D / 2, 3.6, 4, 11);
  }
  // the stable on the east: stalls with their mangers and hay, tack on the rail, a water trough, bales
  { const F = hollow([x1 - 17, zm + 6, x1 - 5, zm + 24], 'w', 4.4, { rise: 2.4, dw: 1.3, roof: 'tile_dark' }), K = kit(ctx, F, y + 0.04, rand), { L, D } = F;
    for (let k = 0; k < 4; k++) { const u = 1.3 + k * 2.6; K.A('wood_dark', u + 1.3 - 0.05, 3.4, u + 1.3 + 0.05, D - 0.7, 0, 1.4, true); K.A('timber', u - 0.2, D - 1.4, u + 1.1, D - 0.8, 0.7, 1.0); K.A('cloth_ochre', u - 0.1, D - 2.0, u + 1.0, D - 1.0, 0, 0.35); }
    for (const [u0, u1] of [[1.0, 6.0], [12.0, 17.0]]) { K.A('wood_dark', u0, 1.4, u1, 1.9, 0, 0.7, true); K.A('cloth_ochre', u0 + 0.1, 1.45, u1 - 0.1, 1.85, 0.7, 0.95); }
    for (let k = 0; k < 4; k++) { K.Rod('timber', [1.0 + k * 2.6, 0.9, 1.6], [1.0 + k * 2.6, 1.0, 2.2], 0.025, 4); K.A('leather_bench', 0.7 + k * 2.6, 0.82, 1.3 + k * 2.6, 1.0, 1.1, 1.4); }
    K.barrel(L - 0.8, 2.6, 0, 0.45, 0.6); K.sack(L - 0.9, 3.6, 0); K.sack(L - 1.4, 3.7, 0);
    lamp(F, L / 2, D / 2, 3.2, 3, 10);
  }
  // the Torre do Tombo, the tower of the records, in the middle: two storeys, the stair, shelves of rolls and chests of charters
  { const rk = [xm - 8, zm - 6, xm + 8, zm + 6], F = hollow(rk, 's', 12.0, { rise: 3.6, dw: 1.4, beams: false }), K = kit(ctx, F, y + 0.04, rand), { L, D } = F, T = 0.7, FH = 5.6;
    // the floor between: planks with a stairwell, the stair along the east wall
    const sv0 = 1.6, sv1 = 8.4, sw = L - T - 1.5, slab = (u0, v0, u1, v1) => { if (u1 - u0 < 0.05 || v1 - v0 < 0.05) return; const q = F.R(u0, v0, u1, v1); bag.add('timber', box(q[0], Y(FH - 0.3), q[1], q[2], Y(FH), q[3])); col.floor(q, Y(FH)); };
    slab(T, T, sw, D - T); slab(sw, sv1, L - T, D - T); slab(sw, T, L - T, sv0);
    { const nS = 24; for (let k = 0; k < nS; k++) { const v1 = sv1 - k * (sv1 - sv0) / nS, v0 = v1 - (sv1 - sv0) / nS, top = 0.04 + (k + 1) * (FH - 0.04) / nS; const q = F.R(sw, v0, L - T, v1); bag.add('timber', box(q[0], Y(0.04), q[1], q[2], Y(top), q[3])); }
      col.ramp(F.R(sw, sv0, L - T, sv1), y + 0.04, Y(FH), F.out[1] > 0 ? 's' : 'n'); }
    for (let u = T + 0.7; u < sw; u += 1.5) { const q = F.R(u - 0.1, T, u + 0.1, D - T); bag.add('wood_dark', box(q[0], Y(FH - 0.65), q[1], q[2], Y(FH - 0.3), q[3])); }
    const Ku = kit(ctx, F, y + 0.04, rand), Kup = kit(ctx, F, Y(FH), rand);
    // ground floor: iron-bound chests of charters, a table with the keeper's desk, shelves with rolled records
    Ku.shelves(T, T + 4.5, D - 1.15, 0.45, [0.6, 1.2, 1.8, 2.4, 3.0], (u, v, h) => Ku.Rod('cloth_white', [u - 0.12, v, h + 0.05], [u + 0.12, v, h + 0.05], 0.045, 6), 0.3);
    Ku.shelves(sw - 4.5, sw, D - 1.15, 0.45, [0.6, 1.2, 1.8, 2.4, 3.0], (u, v, h) => Ku.book(u, v - 0.1, h, 0.06, 0.26), 0.3);
    for (let k = 0; k < 4; k++) Ku.chest(1.5 + k * 1.4, 2.8, 1.1, 0.6, 'wood_dark');
    Ku.table(sw / 2, 6.3, 2.6, 1.0); Ku.stool(sw / 2, 5.1); Ku.book(sw / 2 - 0.4, 6.2, 0.78, 0.35, 0.08); Ku.A('pottery_dark', sw / 2 + 0.6, 6.2, sw / 2 + 0.75, 6.35, 0.78, 0.86);
    // upper floor: the muniment shelves round the walls, a long table with a lectern, chests
    Kup.shelves(T, T + 6.0, D - 1.15, 0.45, [0.6, 1.2, 1.8, 2.4, 3.0], (u, v, h) => Kup.Rod('cloth_white', [u - 0.12, v, h + 0.05], [u + 0.12, v, h + 0.05], 0.045, 6), 0.3);
    Kup.shelves(sw - 6.0, sw, D - 1.15, 0.45, [0.6, 1.2, 1.8, 2.4, 3.0], (u, v, h) => Kup.book(u, v - 0.1, h, 0.06, 0.26), 0.3);
    Kup.table(sw / 2, 5.4, 4.0, 1.1); Kup.stool(sw / 2 - 1.0, 4.2); Kup.stool(sw / 2 + 1.0, 6.6); for (let k = 0; k < 3; k++) Kup.book(sw / 2 - 1.2 + k * 0.8, 5.3, 0.78, 0.3, 0.08);
    for (let k = 0; k < 4; k++) Kup.chest(1.4 + k * 1.5, 2.6, 1.2, 0.6, 'wood_dark');
    lamp(F, sw / 2, 5, 3.2, 4, 11); lamp(F, sw / 2, 5, FH + 3.2, 4, 11);
    bag.add('timber', rod([xm, Y(14.0), zm], [xm, Y(21)], 0.08, 5)); orderCross(bag, 'cloth_red', xm, Y(18.5), zm, 1.6, 's', 0.05); bag.add('cloth_white', box(xm, Y(19.5), zm, xm + 3, Y(21), zm + 0.05));
  }
  // the well and the cistern in the court between the gate and the tower
  { const wx = xm - 6, wz = zm + 14;
    bag.add(LIME, lathe([[1.0, 0], [1.0, 0.9], [0.75, 0.9], [0.75, 0.2], [0.001, 0.2]], 14, null, wx, y, wz)); col.circle(wx, wz, 1.0, y, Y(0.9));
    for (const s of [-1, 1]) { bag.add('timber', box(wx + s * 0.95 - 0.07, Y(0.9), wz - 0.07, wx + s * 0.95 + 0.07, Y(3.0), wz + 0.07)); col.circle(wx + s * 0.95, wz, 0.12, Y(0.9), Y(3.0)); }
    bag.add('timber', rod([wx - 1.0, Y(2.9), wz], [wx + 1.0, Y(2.9), wz], 0.07, 5)); bag.add('rope_fibre', rod([wx, Y(2.9), wz], [wx, Y(1.5), wz], 0.02, 4)); bag.add('wood_dark', lathe([[0.17, 0], [0.2, 0.28], [0.001, 0.28]], 8, null, wx, Y(1.2), wz));
    const cx = xm + 6.5, cz = zm + 14;
    bag.add(LIME, box(cx - 2.4, Y(0), cz - 1.8, cx + 2.4, Y(0.8), cz + 1.8)); col.rect([cx - 2.4, cz - 1.8, cx + 2.4, cz + 1.8], y, Y(0.8));
    bag.add('water', box(cx - 2.0, Y(0.55), cz - 1.4, cx + 2.0, Y(0.58), cz + 1.4));
    bag.add('limestone_carved', box(cx - 2.5, Y(0.8), cz - 1.9, cx + 2.5, Y(0.9), cz - 1.7)); bag.add('limestone_carved', box(cx - 2.5, Y(0.8), cz + 1.7, cx + 2.5, Y(0.9), cz + 1.9));
  }
  void rand; void frustum;
}
