// The Ribeira palace of Lisbon about 1520 (docs/settlements/manueline-lisbon.md §6, §11): on the Terreiro do Paço an east front of a
// portico of six arches under a first-floor loggia (reached by a stair at the portico's north end), the Great Hall behind it (a
// guard hall below, the king's hall above); the Tower of the King at the river corner with the Casa da Índia, the counting-house, in
// its ground floor, entered from the quay; a gate through the river range into the inner court with its galleries. Element `palace`
// { rect: [x0, z0, x1, z1], y }.
import { box, lathe, rod, frustum, fromTriangles, orientOutward } from '../../core/geom.js';
import { archWall } from '../gothic/nd-interior.js';
import { frame } from '../greek/agora.js';
import { rng, gable, armillary, orderCross } from './util.js';
import { kit } from './interiors.js';

const LIME = 'limestone', WALL = 'limewash_white', CARV = 'limestone_carved';

export function palace(el, ctx) {
  const { bag, col, lights } = ctx, [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, rand = rng(el.seed ?? 7), H = 14.5, Y = (h) => y + h;
  /** A solid block, with its collision. */
  const W = (a, b, c, d, h0, h1, mat = WALL, solid = true) => { bag.add(mat, box(a, Y(h0), b, c, Y(h1), d)); if (solid) col.rect([a, b, c, d], Y(h0), Y(h1 + 1)); };
  /** A wall of thickness th on the line x (alongX: from `from` to `to` in x, standing at z = fixed … fixed + th) or z, with arched openings [{uc, r, sill, spring}] (uc absolute). */
  const awall = (alongX, fixed, th, from, to, h0, h1, ops = [], mat = LIME) => {
    const T = []; archWall(T, (uu, yy, d) => (alongX ? [uu, Y(yy), fixed + d] : [fixed + d, Y(yy), uu]), { u0: from, u1: to, d0: 0, d1: th, y0: h0, y1: h1, openings: ops.map((o) => ({ f: 0.5, ...o })), n: 8 });
    bag.add(mat, fromTriangles(T));
    const R = (a, b, ya, yb) => col.rect(alongX ? [a, fixed, b, fixed + th] : [fixed, a, fixed + th, b], Y(ya), Y(yb));
    let a = from; for (const o of ops) { if (o.uc - o.r > a + 0.05) R(a, o.uc - o.r, h0, h1 + 1); R(o.uc - o.r, o.uc + o.r, o.spring + o.r, h1 + 1); if (o.sill > h0 + 0.05) R(o.uc - o.r, o.uc + o.r, h0, o.sill); a = o.uc + o.r; }
    if (to > a + 0.05) R(a, to, h0, h1 + 1);
  };
  const slab = (a, b, c, d, th, mat = 'roof_tile') => { const lo = (p) => [p[0], p[1] - th, p[2]], q = (p0, p1, p2, p3) => [...p0, ...p1, ...p2, ...p0, ...p2, ...p3], A = lo(a), B = lo(b), C = lo(c), D = lo(d); bag.add(mat, fromTriangles(orientOutward([...q(a, b, c, d), ...q(A, B, C, D), ...q(a, b, B, A), ...q(b, c, C, B), ...q(c, d, D, C), ...q(d, a, A, D)]))); };
  const cornice = (a, b, c, d, yy) => bag.add(LIME, box(a - 0.08, Y(yy - 0.4), b - 0.08, c + 0.08, Y(yy + 0.1), d + 0.08));

  // geometry of the parts
  const tx0 = x1 - 24, tx1 = x1 + 1.0, tz0 = z1 - 24, tz1 = z1 + 1.0, TH = 21;            // the Tower of the King
  const gx0 = -4, gx1 = 4;                                                                  // the river gate
  const hx0 = x1 - 15, hx1 = x1 - 1, hz0 = z0 + 14, hz1 = tz0;                              // the hall inside the east wing: 25…39, 42…74
  const pitch = 7.5, pz0 = z0, pz1 = z0 + 6 * pitch;                                        // the portico's six arches: z 28…73
  const pc = (k) => pz0 + pitch * (k + 0.5);

  // ── the wings: the north range, the west range, the river range either side of the gate; their roofs
  const roofed = (a, b, c, d, alongX) => { gable(bag, 'roof_tile', [a, b, c, d], Y(H), 4.2, alongX, 0.9); cornice(a, b, c, d, H); };
  W(x0, z0, x1, z0 + 14, -1, H); roofed(x0, z0, x1, z0 + 14, true);
  W(x0, z0 + 14, x0 + 16, z1 - 14, -1, H); roofed(x0, z0 + 14, x0 + 16, z1 - 14, false);
  W(x0, z1 - 14, gx0, z1, -1, H); roofed(x0, z1 - 14, gx0, z1, true);
  W(gx1, z1 - 14, tx0, z1, -1, H); roofed(gx1, z1 - 14, tx0, z1, true);
  // the river gate: two arched mouths, a passage between with its ceiling, the wall above
  awall(true, z1 - 0.6, 0.6, gx0, gx1, -0.3, 5.4, [{ uc: 0, r: 3.0, sill: 0, spring: 2.2 }]);
  awall(true, z1 - 14, 0.6, gx0, gx1, -0.3, 5.4, [{ uc: 0, r: 3.0, sill: 0, spring: 2.2 }]);
  W(gx0, z1 - 14, gx1, z1, 5.4, H); roofed(gx0, z1 - 14, gx1, z1, true);
  bag.add('flagstone', box(gx0, y - 0.2, z1 - 14, gx1, y, z1 - 5.0));
  for (const s of [-1, 1]) for (let k = 0; k < 3; k++) bag.add('wood_dark', box(s * 3.9 - 0.12, Y(5.0 - 0.0), z1 - 12 + k * 4.4 - 0.15, s * 3.9 + 0.12, Y(5.4), z1 - 12 + k * 4.4 + 0.15));
  bag.add(CARV, box(gx0 - 0.4, Y(0), z1 - 0.7, gx0, Y(5.6), z1 + 0.15)); bag.add(CARV, box(gx1, Y(0), z1 - 0.7, gx1 + 0.4, Y(5.6), z1 + 0.15));
  bag.add(CARV, box(gx0 - 0.4, Y(5.4), z1 - 0.7, gx1 + 0.4, Y(5.8), z1 + 0.15));
  armillary(bag, CARV, 0, Y(8.6), z1 + 0.35, 0.9); orderCross(bag, 'wall_red', -2.6, Y(8.6), z1 + 0.12, 0.6, 's', 0.04); orderCross(bag, 'wall_red', 2.6, Y(8.6), z1 + 0.12, 0.6, 's', 0.04);
  // window rows on the river front, with rain-stained sills
  for (let u = x0 + 3; u < gx0 - 4; u += 4.2) { for (const yy of [1.4, 7.4]) { bag.add('opening', box(u, Y(yy), z1, u + 1.2, Y(yy + 2.2), z1 + 0.1)); bag.add(LIME, box(u - 0.2, Y(yy + 2.2), z1, u + 1.4, Y(yy + 2.5), z1 + 0.18)); bag.add(LIME, box(u - 0.2, Y(yy - 0.15), z1, u + 1.4, Y(yy), z1 + 0.18)); } }
  for (let u = gx1 + 3.5; u < tx0 - 2.5; u += 4.2) { for (const yy of [1.4, 7.4]) { bag.add('opening', box(u, Y(yy), z1, u + 1.2, Y(yy + 2.2), z1 + 0.1)); bag.add(LIME, box(u - 0.2, Y(yy + 2.2), z1, u + 1.4, Y(yy + 2.5), z1 + 0.18)); } }

  // ── the Tower of the King: the Casa da Índia below (hollow, entered by an arch on the quay), three storeys over it
  const TW = 0.8;
  awall(true, tz1 - TW, TW, tx0, tx1, -0.3, 6.6, [{ uc: (tx0 + tx1) / 2, r: 1.7, sill: 0, spring: 2.5 }, { uc: tx0 + 4.5, r: 0.7, sill: 1.8, spring: 3.4 }, { uc: tx1 - 4.5, r: 0.7, sill: 1.8, spring: 3.4 }].sort((a, b) => a.uc - b.uc));
  for (const o of [tx0 + 4.5, tx1 - 4.5]) bag.add('daylight_plain', box(o - 0.7, Y(1.9), tz1 - TW / 2 - 0.03, o + 0.7, Y(4.0), tz1 - TW / 2 + 0.03));
  W(tx0, tz0, tx1, tz0 + TW, -0.3, 6.6);                                                    // north wall (the hall's south wall)
  awall(false, tx0, TW, tz0 + TW, tz1 - TW, -0.3, 6.6, [{ uc: tz0 + 8, r: 0.7, sill: 1.8, spring: 3.4 }]);
  awall(false, tx1 - TW, TW, tz0 + TW, tz1 - TW, -0.3, 6.6, [{ uc: tz0 + 8, r: 0.7, sill: 1.8, spring: 3.4 }, { uc: tz1 - 9, r: 0.7, sill: 1.8, spring: 3.4 }]);
  bag.add('daylight_plain', box(tx0 + TW / 2 - 0.03, Y(1.9), tz0 + 8 - 0.7, tx0 + TW / 2 + 0.03, Y(4.0), tz0 + 8 + 0.7));
  for (const zc of [tz0 + 8, tz1 - 9]) bag.add('daylight_plain', box(tx1 - TW / 2 - 0.03, Y(1.9), zc - 0.7, tx1 - TW / 2 + 0.03, Y(4.0), zc + 0.7));
  bag.add('flagstone', box(tx0 + TW, y - 0.2, tz0 + TW, tx1 - TW, y, 93));
  W(tx0, tz0, tx1, tz1, 6.6, TH);                                                           // the storeys above
  for (let x = tx0 + 1.6; x < tx1 - 1; x += 2.2) bag.add('wood_dark', box(x - 0.14, Y(6.0), tz0 + TW, x + 0.14, Y(6.6), tz1 - TW));   // the ceiling's beams
  for (const yy of [6.8, 13.6]) bag.add(CARV, box(tx0 - 0.1, Y(yy), tz0 - 0.1, tx1 + 0.1, Y(yy + 0.4), tz1 + 0.1));
  bag.add('roof_tile', frustum([tx0 - 1, tz0 - 1, tx1 + 1, tz1 + 1], Y(TH), Y(TH + 7), 11, 11, 11, 11));
  // the loggia of the tower (a gallery on its quay face above the door), the windows of its storeys, the royal arms over the door
  const lg = Array.from({ length: 5 }, (_, k) => ({ uc: tx0 + 4.2 + k * 4.2, r: 1.2, sill: 15.3, spring: 17.2 }));
  awall(true, tz1, 0.45, tx0, tx1, 14.0, 20.6, lg, CARV);
  for (const o of lg) bag.add('opening', box(o.uc - 1.1, Y(15.3), tz1 + 0.0, o.uc + 1.1, Y(18.2), tz1 + 0.02));
  for (let u = tx0 + 3; u < tx1 - 2; u += 4.2) for (const yy of [8.6]) { if (Math.abs(u + 0.65 - (tx0 + tx1) / 2) < 3.2) continue; bag.add('opening', box(u, Y(yy), tz1, u + 1.3, Y(yy + 2.4), tz1 + 0.1)); bag.add(LIME, box(u - 0.2, Y(yy + 2.4), tz1, u + 1.5, Y(yy + 2.7), tz1 + 0.18)); }
  bag.add(CARV, box((tx0 + tx1) / 2 - 2.2, Y(4.9), tz1, (tx0 + tx1) / 2 + 2.2, Y(8.3), tz1 + 0.2));
  orderCross(bag, 'wall_red', (tx0 + tx1) / 2 - 1.0, Y(6.6), tz1 + 0.22, 0.7, 's', 0.04); armillary(bag, CARV, (tx0 + tx1) / 2 + 1.1, Y(6.6), tz1 + 0.35, 0.8);
  bag.add(CARV, box((tx0 + tx1) / 2 - 2.4, Y(0), tz1 - TW - 0.0, (tx0 + tx1) / 2 - 1.8, Y(4.2), tz1 + 0.1)); bag.add(CARV, box((tx0 + tx1) / 2 + 1.8, Y(0), tz1 - TW - 0.0, (tx0 + tx1) / 2 + 2.4, Y(4.2), tz1 + 0.1));
  bag.add(CARV, box((tx0 + tx1) / 2 - 2.4, Y(4.2), tz1 - TW, (tx0 + tx1) / 2 + 2.4, Y(4.6), tz1 + 0.1));
  // the Casa da Índia's furnishing: the counting tables, the great scale, the pepper, the chests, the ledgers on their shelves
  { const Fc = frame([tx0 + TW, tz0 + TW, tx1 - TW, tz1 - TW], 's'), K = kit(ctx, Fc, y, rand), { L, D } = Fc;
    K.shelves(1.0, 7.0, D - 0.55, 0.45, [0.6, 1.2, 1.8, 2.4], (u, v, h) => K.book(u, v - 0.1, h, 0.07, 0.26 + rand() * 0.06), 0.3);
    K.shelves(L - 7.0, L - 1.0, D - 0.55, 0.45, [0.6, 1.2, 1.8, 2.4], (u, v, h) => K.book(u, v - 0.1, h, 0.07, 0.26 + rand() * 0.06), 0.3);
    for (let k = 0; k < 3; k++) { const u = 3.4 + k * 5.4, v = 14.5; K.table(u + 1.4, v, 3.0, 1.0); K.scales(u + 0.7, v, 0.78); for (let b = 0; b < 3; b++) K.book(u + 1.4 + b * 0.35, v - 0.1, 0.78, 0.3, 0.07 + (b % 2) * 0.04); K.stool(u + 0.7, v - 1.0); K.stool(u + 2.1, v + 1.0); }
    // the great scale: a gallows frame with a beam and two pans on chains, weights beside it, for the cargoes
    { const gu = L - 5.0, gv = 8.0; K.A('timber', gu - 2.2, gv - 0.12, gu - 2.0, gv + 0.12, 0, 3.6, true); K.A('timber', gu + 2.0, gv - 0.12, gu + 2.2, gv + 0.12, 0, 3.6, true); K.A('timber', gu - 2.2, gv - 0.1, gu + 2.2, gv + 0.1, 3.5, 3.7);
      K.A('iron', gu - 1.6, gv - 0.05, gu + 1.6, gv + 0.05, 3.1, 3.2);
      for (const s of [-1.5, 1.5]) { K.Rod('iron', [gu + s, gv, 3.15], [gu + s, gv, 0.95], 0.012, 3); K.Lh('gilt_bronze', [[0.001, 0], [0.5, 0.05], [0.55, 0.08], [0.001, 0.04]], gu + s, gv, 0.9, 12); }
      for (let k = 0; k < 5; k++) K.Lh('iron', [[0.001, 0], [0.12, 0.0], [0.1, 0.18], [0.001, 0.2]], gu - 1.5 + k * 0.28, gv + 0.15, 0.95, 7); }
    // the cargo: sacks of pepper stacked at the east wall, bales and chests of ivory and silk, a heap of cinnamon bundles
    for (let k = 0; k < 18; k++) K.sack(L - 1.0 - (k % 6) * 0.62, D - 1.2 - Math.floor(k / 6) * 0.7, 0, 'sacking', k % 5 === 0);
    for (let k = 0; k < 8; k++) K.sack(L - 1.3 - (k % 4) * 0.62, D - 1.2 - 0.7 * 0 - 2.6 + (k > 3 ? 0.65 : 0), 0.0, 'sacking', false);
    for (let k = 0; k < 5; k++) K.chest(1.6 + k * 1.35, D - 1.2, 1.1, 0.6, 'wood_dark');
    for (let k = 0; k < 3; k++) K.crate(1.4 + k * 0.7, 3.2, 0, 0.62); K.A('cloth_red', 2.3, 4.4, 3.3, 5.6, 0, 0.5, true); K.A('cloth_ochre', 3.5, 4.4, 4.5, 5.6, 0, 0.5, true);
    K.A('cloth_ochre', 0.0, 7.0, 0.05, 11.5, 1.2, 2.8); K.A('cloth_indigo', 0.05, 7.8, 0.08, 10.5, 1.6, 2.4); K.A('cloth_red', 0.05, 8.3, 0.08, 8.5, 1.9, 2.1);     // a chart of the route to India on the wall
    K.A('wood_dark', L - 3.8, 1.2, L - 0.8, 1.9, 0, 1.0, true); K.A('timber', L - 3.9, 1.1, L - 0.7, 2.0, 1.0, 1.06); K.book(L - 3.4, 1.4, 1.06, 0.3, 0.08); K.Lh('pottery_dark', [[0.001, 0], [0.05, 0], [0.05, 0.09], [0.001, 0.09]], L - 1.4, 1.5, 1.06, 7);   // the treasurer's desk by the door
    for (const [u, v] of [[L * 0.3, 8.5], [L * 0.7, 8.5], [L * 0.5, 16.5]]) { const p = Fc.P(u, v); lights.push({ at: [p[0], Y(5.2), p[1]], color: '#ffc27a', intensity: 5, distance: 14 }); }
  }

  // ── the east wing: the hall in two storeys behind the portico
  const HT = 1.0;
  const ewR = (u0, u1, h0, h1, ops, fixed, th, mat = WALL) => awall(false, fixed, th, u0, u1, h0, h1, ops, mat);
  const doorsE = [pc(2), pc(3), pc(5)].map((c) => ({ uc: c, r: 1.5, sill: 0, spring: 2.8 }));
  ewR(hz0, hz1, -0.3, 6.4, doorsE.concat([{ uc: pc(4), r: 0.8, sill: 1.6, spring: 3.4 }]).sort((a, b) => a.uc - b.uc), hx1, HT);
  ewR(hz0, hz1, 6.4, H, [pc(2), pc(3), pc(4), pc(5)].map((c, i) => (i === 1 || i === 2 ? { uc: c, r: 0.9, sill: 8.4, spring: 10.6 } : { uc: c, r: 1.4, sill: 6.4, spring: 9.0 })), hx1, HT);
  for (const c of [pc(3), pc(4)]) bag.add('daylight_plain', box(hx1 + HT / 2 - 0.03, Y(8.5), c - 0.8, hx1 + HT / 2 + 0.03, Y(11.4), c + 0.8));
  ewR(hz0, hz1, -0.3, 6.4, [{ uc: (hz0 + hz1) / 2, r: 1.5, sill: 0, spring: 2.8 }], hx0 - 1.0, 1.0);        // the west wall, below: the door to the court
  ewR(hz0, hz1, 6.4, H, [0, 1, 2, 3].map((k) => ({ uc: hz0 + 4 + k * 8, r: 0.9, sill: 8.4, spring: 10.6 })), hx0 - 1.0, 1.0);
  for (let k = 0; k < 4; k++) bag.add('daylight_plain', box(hx0 - 0.53, Y(8.5), hz0 + 4 + k * 8 - 0.8, hx0 - 0.47, Y(11.4), hz0 + 4 + k * 8 + 0.8));
  gable(bag, 'roof_tile', [hx0 - 1.0, hz0, hx1 + HT, hz1], Y(H), 4.2, false, 0.9); cornice(hx0 - 1.0, hz0, hx1 + HT, hz1, H);
  // the floor between the storeys: planks on beams, with a stone edge
  bag.add('flagstone', box(hx0, y - 0.2, hz0, hx1, y, hz1));
  bag.add('timber', box(hx0, Y(6.0), hz0, hx1, Y(6.4), hz1)); col.floor([hx0, hz0, hx1, hz1], Y(6.4));
  for (let z = hz0 + 1.5; z < hz1; z += 3.0) bag.add('wood_dark', box(hx0, Y(5.5), z - 0.18, hx1, Y(6.0), z + 0.18));
  for (let z = hz0 + 4.5; z < hz1 - 3; z += 6.0) for (const x of [(hx0 + hx1) / 2]) { bag.add('wood_dark', box(x - 0.25, Y(0), z - 0.25, x + 0.25, Y(5.5), z + 0.25)); col.rect([x - 0.25, z - 0.25, x + 0.25, z + 0.25], Y(0), Y(6)); }   // the posts that carry the beams
  // the guard hall below: benches, trestle tables with dice, weapon racks, barrels, a brazier
  { const Fg = frame([hx0, hz0, hx1, hz1], 'e'), K = kit(ctx, Fg, y, rand), { L, D } = Fg;
    for (let k = 0; k < 3; k++) { const u = 7.5 + k * 8, v = 10.5; K.table(u, v, 2.6, 0.9); K.bench(u - 1.3, u + 1.3, v - 0.8); K.bench(u - 1.3, u + 1.3, v + 0.8); K.Lh('terracotta', [[0.001, 0], [0.05, 0], [0.06, 0.12], [0.001, 0.14]], u - 0.4, v, 0.78, 8); K.A('cloth_white', u + 0.2, v - 0.1, u + 0.35, v + 0.05, 0.78, 0.82); }
    for (const u of [2, 8.5, 22.5]) { K.A('wood_dark', u, D - 0.5, u + 1.8, D - 0.1, 0, 0.1); K.Rod('wood_dark', [u + 0.1, D - 0.3, 0.1], [u + 0.1, D - 0.3, 2.3], 0.02, 4); K.Rod('wood_dark', [u + 0.9, D - 0.3, 0.1], [u + 0.9, D - 0.3, 2.4], 0.02, 4); K.Rod('wood_dark', [u + 1.6, D - 0.3, 0.1], [u + 1.6, D - 0.3, 2.3], 0.02, 4); for (const s of [0.1, 0.9, 1.6]) K.Lh('iron', [[0.001, 0], [0.03, 0.0], [0.04, 0.22], [0.001, 0.3]], u + s, D - 0.3, 2.3, 4); }   // racks of pikes
    for (let k = 0; k < 4; k++) K.barrel(L - 0.8 - k * 0.8, D - 0.6, 0, 0.32, 0.85);
    for (const u of [L * 0.33, L * 0.66]) { K.Lh('iron', [[0.001, 0], [0.3, 0.0], [0.3, 0.05], [0.25, 0.12], [0.5, 0.5], [0.001, 0.5]], u, 4.2, 0.55, 10); K.A('iron', u - 0.03, 4.2 - 0.03, u + 0.03, 4.2 + 0.03, 0, 0.55); const p = Fg.P(u, 4.2); lights.push({ at: [p[0], Y(1.8), p[1]], color: '#ff9d4a', intensity: 4, distance: 10 }); }
    K.A('cloth_red', 0.0, 0.8, 0.05, 6, 1.5, 5.0); K.A('wall_red', 0.05, 2.2, 0.08, 4.6, 3.1, 3.4); K.A('wall_red', 0.05, 3.2, 0.08, 3.6, 2.2, 4.4);   // a hanging with the cross at the north end
  }
  // the Great Hall above (the king's hall): a dais with the chair of state under its cloth, long tables and benches, candelabra, tapestries, the arms
  { const Fh = frame([hx0, hz0, hx1, hz1], 'e'), { L, D } = Fh;
    const fy = Y(6.4);
    const A = (mat, u0, v0, u1, v1, a, b, solid = false) => { const r = Fh.R(u0, v0, u1, v1); bag.add(mat, box(r[0], fy + a, r[1], r[2], fy + b, r[3])); if (solid) col.rect(r, fy + a, fy + b); };
    const KK = kit(ctx, Fh, fy, rand);
    A('limestone', 7.0, 11.0, 25.0, D - 0.8, 0, 0.35, true); A(CARV, 6.9, 10.9, 25.1, 11.0, 0.0, 0.4); A('cloth_maroon', 8.0, 11.6, 24.0, D - 1.0, 0.35, 0.38);    // the dais and its carpet
    A('wood_dark', 15.2, D - 2.0, 16.8, D - 1.0, 0.35, 0.8, true); A('wood_dark', 15.2, D - 1.1, 16.8, D - 0.95, 0.8, 2.2); A('gilt_bronze', 15.15, D - 1.1, 15.3, D - 0.95, 0.8, 2.3); A('gilt_bronze', 16.7, D - 1.1, 16.85, D - 0.95, 0.8, 2.3);   // the chair of state
    A('cloth_maroon', 13.0, D - 0.95, 19.0, D - 0.9, 2.4, 6.6); A('cloth_ochre', 12.9, D - 0.97, 19.1, D - 0.95, 6.4, 6.6); A('cloth_ochre', 12.9, D - 0.97, 13.1, D - 0.95, 2.4, 6.4); A('cloth_ochre', 18.9, D - 0.97, 19.1, D - 0.95, 2.4, 6.4);
    A('wall_red', 15.7, D - 0.99, 16.3, D - 0.97, 3.4, 5.6); A('wall_red', 15.1, D - 0.99, 16.9, D - 0.97, 4.1, 4.5);
    { const p = Fh.P(16, D - 1.45); armillary(bag, 'gilt_bronze', p[0], fy + 6.0, p[1], 0.45); }
    for (const v of [4.2, 6.8]) { KK.table(16, v, 18, 0.95); KK.bench(7.5, 24.5, v - 0.95); KK.bench(7.5, 24.5, v + 0.95); }
    for (let k = 0; k < 10; k++) { const u = 8.5 + k * 1.7; KK.Lh('glaze_white', [[0.001, 0], [0.05, 0], [0.08, 0.1], [0.04, 0.22], [0.001, 0.24]], u, 4.2, 0.78, 8); KK.Lh('pottery_dark', [[0.001, 0], [0.05, 0], [0.06, 0.1], [0.001, 0.12]], u + 0.5, 6.8, 0.78, 8); }
    for (const [u, v] of [[10, 5.5], [16, 5.5], [22, 5.5]]) { KK.Lh('iron', [[0.001, 0], [0.12, 0.0], [0.03, 0.05], [0.03, 1.5], [0.2, 1.55], [0.001, 1.55]], u, v, 0.0, 8); for (const d of [-0.12, 0.0, 0.12]) { KK.Lh('cloth_white', [[0.03, 0], [0.03, 0.2]], u + d, v, 1.55, 5); KK.Lh('flame', [[0.001, 0], [0.012, 0.014], [0.001, 0.05]], u + d, v, 1.75, 4); } }
    for (const u of [0.0, L]) { const s = u === 0 ? 1 : -1; A('cloth_indigo', u === 0 ? 0 : L - 0.05, 3.5, u === 0 ? 0.05 : L, 10.5, 1.2, 5.4); A('cloth_ochre', u === 0 ? 0.05 : L - 0.08, 3.9, u === 0 ? 0.08 : L - 0.05, 10.1, 1.6, 5.0); A('cloth_red', u === 0 ? 0.08 : L - 0.11, 5.2, u === 0 ? 0.11 : L - 0.08, 8.8, 2.4, 4.0); void s; }   // tapestries on the end walls
    for (let k = 0; k < 6; k++) { const u = 2 + k * 5.2; A('cloth_red', u, 0.0, u + 1.0, 0.04, 5.4, 7.4); A('wall_red', u + 0.4, 0.04, u + 0.6, 0.06, 5.5, 7.3); A('wall_red', u + 0.2, 0.04, u + 0.8, 0.06, 6.0, 6.3); }
    for (const [u, v] of [[6.0, 3.0], [26.0, 3.0]]) { KK.chest(u, v, 1.2, 0.6, 'wood_dark'); }
    for (const [u, v] of [[8, 5.5], [16, 5.5], [24, 5.5], [16, 11]]) { const p = Fh.P(u, v); lights.push({ at: [p[0], fy + 5.0, p[1]], color: '#ffc27a', intensity: 6, distance: 15 }); }
  }

  // ── the portico on the Terreiro (six arches) and the loggia above it (four arches) with the stair up to it
  const px0 = x1 + 3.4;                                                                      // the screens' line: 43.4
  { const ops = Array.from({ length: 6 }, (_, k) => ({ uc: pc(k), r: 2.5, sill: 0, spring: 3.2 }));
    awall(false, px0, 0.6, pz0, pz1, -0.3, 6.4, ops, LIME);
    const up = [2, 3, 4, 5].map((k) => ({ uc: pc(k), r: 2.5, sill: 8.0, spring: 9.6 }));
    awall(false, px0, 0.6, pz0 + 2 * pitch - 4.25 + 0.0, pz1, 6.4, 12.6, up, LIME);
    bag.add(LIME, box(px0 - 0.1, Y(6.2), pz0 - 0.1, px0 + 0.7, Y(6.6), pz1)); bag.add(LIME, box(px0 - 0.1, Y(12.6), pz0 + 2 * pitch - 4.25, px0 + 0.7, Y(13.0), pz1));
    bag.add(LIME, box(px0 - 0.0, Y(-0.3), pz0 - 0.0, px0 + 0.6, Y(0.4), pz1));
  }
  bag.add('timber', box(x1, Y(6.0), z0 + 9.6, px0, Y(6.4), pz1)); col.floor([x1, z0 + 9.6, px0, pz1], Y(6.4));   // the loggia's floor (the portico's ceiling), from the stair's head to the tower
  for (let z = z0 + 11; z < pz1; z += 3.0) bag.add('wood_dark', box(x1, Y(5.5), z - 0.18, px0, Y(6.0), z + 0.18));
  col.rect([x1, pz1, px0 + 0.6, pz1 + 0.5], Y(0), Y(14));                                    // the end of the portico against the tower
  // the stair at the north end: from the Terreiro at the portico's north end, southward, rising 6.4 m to the loggia
  { const n = 32, sz0 = z0 + 0.6, dz = 9.0 / n, sx0 = x1 + 0.3, sx1 = px0 - 0.3;
    for (let k = 0; k < n; k++) bag.add(LIME, box(sx0, Y(0), sz0 + k * dz, sx1, Y(0.2 * (k + 1)), sz0 + (k + 1) * dz));
    col.ramp([sx0, sz0, sx1, sz0 + 9.0], y, Y(6.4), 's');
    bag.add(LIME, box(px0 - 0.0, Y(6.4), z0 + 9.6, px0 + 0.6, Y(7.6), pz0 + 2 * pitch - 4.25)); col.rect([px0, z0 + 9.6, px0 + 0.6, pz0 + 2 * pitch - 4.25], Y(6.4), Y(8.2));   // the balustrade at the loggia's head
    col.rect([sx1, sz0, sx1 + 0.3, sz0 + 9.0], Y(0), Y(2));
      bag.add(LIME, box(sx0 - 0.3, Y(0), sz0 - 0.0, sx0, Y(0.3), sz0 + 9.0));
  }
  slab([x1, Y(13.3), z0 + 9.6], [px0 + 1.4, Y(12.9), z0 + 9.6], [px0 + 1.4, Y(12.9), pz1], [x1, Y(13.3), pz1], 0.3);   // the loggia's pent roof
  for (let k = 2; k < 6; k++) armillary(bag, CARV, px0 + 0.35, Y(11.6), pc(k) - 3.75 + (k === 2 ? 0 : 0), 0.4);
  // the wing's east wall under the loggia carries the great arms between the doors
  bag.add(CARV, box(hx1 + HT, Y(7.0), pc(2) + 2.7, hx1 + HT + 0.12, Y(11.5), pc(3) - 2.7));
  orderCross(bag, 'wall_red', hx1 + HT + 0.14, Y(9.8), (pc(2) + pc(3)) / 2, 0.6, 'e', 0.04); armillary(bag, 'gilt_bronze', hx1 + HT + 0.3, Y(8.0), (pc(2) + pc(3)) / 2, 0.4);

  // ── the inner court: its floor, the galleries on three sides under a roof, benches
  bag.add('flagstone', box(x0 + 16, y - 0.2, z0 + 14, hx0 - 1.0, y, tz0)); bag.add('flagstone', box(x0 + 16, y - 0.2, tz0, tx0, y, z1 - 14));
  { const cx0 = x0 + 16, cx1 = hx0 - 1.0, cz0 = z0 + 14, cz1 = z1 - 14;
    const gal = (alongX, fixed, from, to, n, face) => {
      const p = (to - from) / n, ops = Array.from({ length: n }, (_, k) => ({ uc: from + p * (k + 0.5), r: p * 0.34, sill: 0, spring: 2.2 }));
      awall(alongX, fixed, 0.5, from, to, -0.3, 5.4, ops, LIME);
      bag.add(CARV, alongX ? box(from, Y(5.4), fixed - 0.1, to, Y(5.8), fixed + 0.6) : box(fixed - 0.1, Y(5.4), from, fixed + 0.6, Y(5.8), to));
      void face;
    };
    gal(true, cz0 + 3.0, cx0, cx1, 6, 's');
    gal(false, cx0 + 3.0, cz0 + 3.0, cz1 - 0.0, 5, 'e');
    gal(false, cx1 - 3.5, cz0 + 3.0, tz0 - 0.0, 4, 'w');
    // the galleries' roofs: flat slabs on beams at the first floor, a balustrade course over them; the floor within the court is the flagstones
    bag.add('timber', box(cx0, Y(5.4), cz0, cx1, Y(5.8), cz0 + 3.0)); bag.add('timber', box(cx0, Y(5.4), cz0 + 3.0, cx0 + 3.0, Y(5.8), cz1)); bag.add('timber', box(cx1 - 3.5, Y(5.4), cz0 + 3.0, cx1, Y(5.8), tz0));
    for (const [a, b, c2, d] of [[cx0, cz0, cx1, cz0 + 3.0], [cx0, cz0 + 3.0, cx0 + 3.0, cz1], [cx1 - 3.5, cz0 + 3.0, cx1, tz0]]) col.rect([a, b, c2, d], Y(5.4), Y(6.2));
    // the court's doors and windows: the wings' faces behind the galleries
    for (let u = cx0 + 2; u < cx1 - 2; u += 8) { bag.add('wood_dark', box(u, Y(0), cz0 - 0.0, u + 2.2, Y(3.4), cz0 + 0.06)); bag.add(LIME, box(u - 0.25, Y(3.4), cz0 - 0.0, u + 2.45, Y(3.8), cz0 + 0.12)); }
    for (let u = cx0 + 2.2; u < cx1 - 2; u += 4.0) for (const yy of [7.4]) { bag.add('opening', box(u, Y(yy), cz0, u + 1.2, Y(yy + 2.2), cz0 + 0.1)); bag.add(LIME, box(u - 0.2, Y(yy + 2.2), cz0, u + 1.4, Y(yy + 2.5), cz0 + 0.18)); bag.add(LIME, box(u - 0.2, Y(yy - 0.15), cz0, u + 1.4, Y(yy), cz0 + 0.18)); }
    for (let k = 0; k < 4; k++) { const z = cz0 + 6 + k * 8; bag.add('opening', box(cx0, Y(7.4), z, cx0 + 0.1, Y(9.6), z + 1.2)); bag.add(LIME, box(cx0, Y(9.6), z - 0.2, cx0 + 0.18, Y(9.9), z + 1.4)); }
    for (const [bx, bz] of [[-12, cz0 + 4.8], [4, cz0 + 4.8], [-18, cz0 + 20]]) { bag.add('limestone', box(bx - 1.1, Y(0), bz - 0.25, bx + 1.1, Y(0.45), bz + 0.25)); col.rect([bx - 1.1, bz - 0.25, bx + 1.1, bz + 0.25], Y(0), Y(0.45)); }
    lights.push({ at: [0, Y(4.5), cz0 + 1.6], color: '#ffc27a', intensity: 3, distance: 16 }, { at: [x0 + 18.6, Y(4.5), 62], color: '#ffc27a', intensity: 3, distance: 16 });
  }
  void rod; void lathe;
}
