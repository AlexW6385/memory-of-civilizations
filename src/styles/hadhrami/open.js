// tower_open: the one tower house that can be entered (docs/settlements/shibam.md §4): a street door into a lobby and a stair
// of two flights and a landing to each storey, beside one room a floor — the ground storey's store and stable, the women's
// floors, the majlis with its carved windows, the upper family rooms — and the roof terrace under its parapet.

import { box, rod, lathe } from '../../core/geom.js';
import { subtractRects } from '../../core/build.js';
import { GH, SH, K, T, SW, PT, RUN, F0, ys, fl, topOf, houseDims } from './dims.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }
/** Boxes for a wall along one axis with openings cut: { along, u0, u1, t0, t1, y0, y1, holes: [{ a, b, lo, hi }] }. */
function wallBoxes({ along, u0, u1, t0, t1, y0, y1, holes = [] }) {
  const cuts = [...new Set([u0, u1, ...holes.flatMap((h) => [h.a, h.b])])].filter((u) => u >= u0 && u <= u1).sort((p, q) => p - q), out = [];
  for (let k = 0; k + 1 < cuts.length; k++) {
    const p = cuts[k], q = cuts[k + 1];
    if (q - p < 1e-4) continue;
    const over = holes.filter((h) => h.a <= p + 1e-6 && h.b >= q - 1e-6).sort((g, h) => g.lo - h.lo);
    let y = y0;
    for (const h of over) { if (h.lo > y + 1e-4) out.push([p, q, y, h.lo]); y = Math.max(y, h.hi); }
    if (y1 > y + 1e-4) out.push([p, q, y, y1]);
  }
  return out.map(([p, q, ya, yb]) => (along === 'x' ? [p, ya, t0, q, yb, t1] : [t0, ya, p, t1, yb, q]));
}
const JAR = { big: [[0.001, 0], [0.2, 0.02], [0.34, 0.2], [0.4, 0.45], [0.32, 0.72], [0.18, 0.86], [0.2, 0.92], [0.17, 0.92], [0.001, 0.88]], pot: [[0.001, 0], [0.1, 0.02], [0.2, 0.12], [0.23, 0.24], [0.19, 0.36], [0.12, 0.42], [0.125, 0.47], [0.11, 0.47], [0.001, 0.42]], sack: [[0.001, 0], [0.2, 0.02], [0.28, 0.2], [0.24, 0.42], [0.12, 0.55], [0.001, 0.58]], pan: [[0.001, 0], [0.14, 0.01], [0.2, 0.08], [0.19, 0.09], [0.001, 0.04]] };
const jar = (bag, k, x, y, z, s = 1, mat = 'terracotta') => bag.add(mat, lathe(JAR[k].map(([r, h]) => [r * s, h * s]), 12, null, x, y, z));

function towerOpen(el, ctx) {
  const { bag, col, lights } = ctx, [X0, Z0, X1, Z1] = el.rect, n = el.storeys ?? 7, D = houseDims(el.rect), [I0, I1, I2, I3] = D.I, xp = D.xp, top = topOf(n), rand = rng(el.seed || 5);
  const doorHole = { a: D.doorZ - 0.55, b: D.doorZ + 0.55, lo: -0.3, hi: 2.1 };
  // windows of the north face by storey: [centre x, width, sill above the floor, height]
  const rc = [xp + PT + 1.5, xp + PT + 4.3];
  const NW = (s) => {
    if (s === 0) return [[I0 + 1.2, 0.22, 2.3, 0.5], [rc[0], 0.22, 2.3, 0.5], [rc[1], 0.22, 2.3, 0.5]];
    if (s <= 2) return [[I0 + 1.2, 0.25, 1.6, 0.7], [rc[0], 0.55, 1.2, 0.85], [rc[1], 0.55, 1.2, 0.85]];
    if (s === 4) return [[I0 + 1.2, 0.25, 1.6, 0.7], [xp + PT + 0.95, 1.0, 0.65, 1.75], [xp + PT + 2.85, 1.0, 0.65, 1.75], [xp + PT + 4.75, 1.0, 0.65, 1.75]];
    return [[I0 + 1.2, 0.25, 1.6, 0.7], [rc[0], 0.8, 0.95, 1.2], [rc[1], 0.8, 0.95, 1.2]];
  };
  for (let s = 0; s < n; s++) {
    const y0 = s === 0 ? -0.6 : ys(s), y1 = s === n - 1 ? top : ys(s + 1), i = K * Math.max(0, y0), mat = s >= n - 2 ? 'lime_plaster' : 'mud_plaster', fy = fl(s);
    const piece = (p) => { bag.add(mat, box(...p)); col.rect([p[0], p[2], p[3], p[5]], p[1], p[4]); };
    // north face with its windows, south and east faces plain (they touch the neighbours), west face with the door and the lobby's slits
    const nh = NW(s).map(([c, w, lo, h]) => ({ a: c - w / 2, b: c + w / 2, lo: fy + lo, hi: fy + lo + h }));
    for (const p of wallBoxes({ along: 'x', u0: X0 + i, u1: X1 - i, t0: Z0 + i, t1: I1, y0, y1, holes: nh })) piece(p);
    for (const p of wallBoxes({ along: 'x', u0: X0 + i, u1: X1 - i, t0: I3, t1: Z1 - i, y0, y1 })) piece(p);
    for (const p of wallBoxes({ along: 'z', u0: Z0 + i, u1: Z1 - i, t0: I2, t1: X1 - i, y0, y1 })) piece(p);
    const wh = s === 0 ? [doorHole, { a: D.doorZ + 1.7 - 0.1, b: D.doorZ + 1.7 + 0.1, lo: 2.3, hi: 2.8 }] : [{ a: D.doorZ - 0.15, b: D.doorZ + 0.15, lo: fy + 1.6, hi: fy + 2.3 }];
    for (const p of wallBoxes({ along: 'z', u0: Z0 + i, u1: Z1 - i, t0: X0 + i, t1: I0, y0, y1, holes: wh })) piece(p);
    // the fittings of the north windows: a frame, the lower part shuttered with carved leaves, bars above
    for (const [c, w, lo, h] of NW(s)) {
      const zo = Z0 + i, yb = fy + lo;
      if (w < 0.3) { bag.add('timber', box(c - w / 2 - 0.04, yb - 0.04, zo - 0.05, c + w / 2 + 0.04, yb, zo)); continue; }
      const f = 0.1, big = s >= 3;
      bag.add('lime_plaster', box(c - w / 2 - f, yb + h, zo - 0.07, c + w / 2 + f, yb + h + f, zo)); bag.add('lime_plaster', box(c - w / 2 - f, yb - f, zo - 0.1, c + w / 2 + f, yb, zo));
      bag.add('lime_plaster', box(c - w / 2 - f, yb, zo - 0.06, c - w / 2, yb + h, zo)); bag.add('lime_plaster', box(c + w / 2, yb, zo - 0.06, c + w / 2 + f, yb + h, zo));
      const lh = h * 0.62;
      bag.add(big ? 'cedar' : 'timber', box(c - w / 2, yb, zo - 0.05, c - 0.015, yb + lh, zo - 0.01)); bag.add(big ? 'cedar' : 'timber', box(c + 0.015, yb, zo - 0.05, c + w / 2, yb + lh, zo - 0.01));
      if (big) for (let b = 1; b < 7; b++) bag.add('wood_dark', rod([c - w / 2 + b * w / 7, yb + lh + 0.03, zo - 0.03], [c - w / 2 + b * w / 7, yb + h - 0.03, zo - 0.03], 0.016, 5));
      if (s === 4 || s === 5) bag.add('wood_dark', box(c - w / 2, yb + lh, zo - 0.04, c + w / 2, yb + lh + 0.04, zo - 0.01));
    }
    // the partition between the stair and the room, with its doorway
    const ph = [{ a: D.doorZ - 0.5, b: D.doorZ + 0.5, lo: fy - 0.1, hi: fy + 2.0 }];
    for (const p of wallBoxes({ along: 'z', u0: I1, u1: I3, t0: xp, t1: xp + PT, y0: Math.max(y0, fy - 0.35), y1: y1 - (s === n - 1 ? 0 : 0.35), holes: ph })) { bag.add('lime_plaster', box(...p)); col.rect([p[0], p[2], p[3], p[5]], p[1], p[4]); }
    // the divider of the two flights
    bag.add('mud_plaster', box(I0 + 1.2 - 0.08, fy, I1 + 1.2, I0 + 1.2 + 0.08, (s === n - 1 ? top : y1) - 0.35, I1 + RUN));
    col.rect([I0 + 1.2 - 0.08, I1 + 1.2, I0 + 1.2 + 0.08, I1 + RUN], fy, (s === n - 1 ? top : y1) - 0.35);
    // the two flights and the north landing
    const h = (s === n - 1 ? top : ys(s + 1)) - fy, half = h / 2, steps = s === 0 ? 9 : 8, riser = half / steps;
    const flight = (rect, y, ya, yb, dir) => {
      for (let q = 0; q < steps; q++) {
        const f0 = q / steps, f1 = (q + 1) / steps, z0 = dir === 'n' ? rect[3] - (rect[3] - rect[1]) * f1 : rect[1] + (rect[3] - rect[1]) * f0, z1 = rect[3];
        bag.add('mud_plaster', box(rect[0], y - 0.01, dir === 'n' ? z0 : z0, rect[2], ya + (yb - ya) * f1, z1));
      }
      col.ramp(rect, ya, yb, dir);
    };
    flight([I0, I1 + 1.2, I0 + 1.2, I1 + RUN], fy, fy, fy + half, 'n');
    flight([I0 + 1.2, I1 + 1.2, I0 + SW, I1 + RUN], fy + half, fy + half, fy + h, 's');
    bag.add('mud_plaster', box(I0, fy + half - 0.3, I1, I0 + SW, fy + half, I1 + 1.2)); col.floor([I0, I1, I0 + SW, I1 + 1.2], fy + half);
    // the floor above this storey: the room's slab and the lobby's, a hole over the stair; beams of palm trunk under it
    const yf = s === n - 1 ? top : ys(s + 1);
    const pieces = s === n - 1 ? subtractRects([X0 + K * top, Z0 + K * top, X1 - K * top, Z1 - K * top], [[I0, I1, I0 + SW, I1 + RUN]]) : [[xp, I1, I2, I3], [I0, I1 + RUN, xp, I3]];
    for (const r of pieces) { bag.add(s === n - 1 ? 'mud_plaster' : 'earth_wall', box(r[0], yf - 0.35, r[1], r[2], yf, r[3])); col.floor(r, yf); }
    if (s < n - 1) for (let b = 0; b < 6; b++) { const zz = I1 + 0.5 + b * (I3 - I1 - 1) / 5; bag.add('palm_trunk', rod([xp + PT, yf - 0.46, zz], [I2, yf - 0.46, zz], 0.1, 7)); }
  }
  // the ground floor, the threshold and the leaf of the street door swung back against the wall
  bag.add('earth_wall', box(I0, -0.3, I1, I2, F0, I3)); col.floor([I0, I1, I2, I3], F0);
  bag.add('schist_rubble', box(X0 - 0.25, -0.3, D.doorZ - 0.65, I0, 0.1, D.doorZ + 0.65)); col.floor([X0 - 0.25, D.doorZ - 0.55, I0, D.doorZ + 0.55], 0.1);
  bag.add('lime_plaster', box(X0 - 0.08, 0, D.doorZ - 0.72, X0, 2.2, D.doorZ - 0.55)); bag.add('lime_plaster', box(X0 - 0.08, 0, D.doorZ + 0.55, X0, 2.2, D.doorZ + 0.72)); bag.add('lime_plaster', box(X0 - 0.08, 2.1, D.doorZ - 0.72, X0, 2.3, D.doorZ + 0.72));
  bag.add('timber', box(X0 - 0.14, 2.3, D.doorZ - 0.85, X0, 2.42, D.doorZ + 0.85));
  bag.add('cedar', box(I0, 0.02, D.doorZ + 0.56, I0 + 0.06, 2.0, D.doorZ + 1.5)); bag.add('iron', box(I0 + 0.06, 0.95, D.doorZ + 0.6, I0 + 0.1, 1.0, D.doorZ + 1.4));
  // the parapet, its corner piers and the spouts on the roof
  const t = K * top, pt = 0.34, [a0, b0, a1, b1] = [X0 + t, Z0 + t, X1 - t, Z1 - t];
  for (const r of [[a0, b0, a1, b0 + pt], [a0, b1 - pt, a1, b1], [a0, b0 + pt, a0 + pt, b1 - pt], [a1 - pt, b0 + pt, a1, b1 - pt]]) { bag.add('lime_plaster', box(r[0], top, r[1], r[2], top + 1.0, r[3])); col.rect(r, top, top + 1.0); }
  for (const [cx, cz] of [[a0, b0], [a1 - 0.6, b0], [a0, b1 - 0.6], [a1 - 0.6, b1 - 0.6]]) bag.add('lime_plaster', box(cx, top, cz, cx + 0.6, top + 1.5, cz + 0.6));
  for (const x of [a0 + 2.5, a0 + 6.5]) bag.add('timber', box(x, top + 0.05, b0 - 0.35, x + 0.12, top + 0.17, b0 + pt));
  // the outer bands and the whitewash on the outside of the north and west faces, as in the town's towers
  for (const [y, hh] of [[ys(n - 2) - 0.01, 0.16], [top - 0.3, 0.3]]) {
    const q = K * y;
    bag.add('lime_plaster', box(X0 + q - 0.02, y, Z0 + q - 0.08, X1 - q + 0.02, y + hh, Z0 + q)); bag.add('lime_plaster', box(X0 + q - 0.08, y, Z0 + q, X0 + q, y + hh, Z1 - q));
  }
  furnish(ctx, el, D, rand);
  void GH; void SH; void T;
}

/** The furnishing of the rooms (docs/settlements/shibam.md §4: ground store and stable, women's quarters, the majlis, the upper rooms). */
function furnish(ctx, el, D, rand) {
  const { bag, col, lights } = ctx, [x0, z0, x1, z1] = D.room, W = 0.04;
  const seat = (a, b, c, d, y, h = 0.18) => { bag.add('reed_mat', box(a, y, b, c, y + h, d)); col.rect([a, b, c, d], y, y + h + 0.2); };
  const rug = (a, b, c, d, y, mat) => { bag.add(mat, box(a, y, b, c, y + 0.025, d)); bag.add('cloth_black', box(a + 0.1, y + 0.03, b + 0.1, a + 0.14, y + 0.045, d - 0.1)); bag.add('cloth_black', box(c - 0.14, y + 0.03, b + 0.1, c - 0.1, y + 0.045, d - 0.1)); };
  const cushion = (x, y, z, ax = 'x') => bag.add(rand() < 0.5 ? 'cloth_red' : 'cloth_maroon', ax === 'x' ? box(x - 0.28, y, z - 0.22, x + 0.28, y + 0.42, z + 0.22) : box(x - 0.22, y, z - 0.28, x + 0.22, y + 0.42, z + 0.28));
  const chest = (a, b, c, d, y, h = 0.6) => { bag.add('timber', box(a, y, b, c, y + h, d)); bag.add('iron', box(a - 0.01, y + h * 0.7, (b + d) / 2 - 0.03, c + 0.01, y + h * 0.74, (b + d) / 2 + 0.03)); col.rect([a, b, c, d], y, y + h); };
  const mattress = (a, b, c, d, y) => { bag.add('cloth_white', box(a, y, b, c, y + 0.16, d)); bag.add('cloth_indigo', box(a, y + 0.16, b, c, y + 0.19, d)); };
  const wardrobe = (x, z, yaw, y) => { const w = 1.5; bag.add('wood_dark', box(x, y, z, x + (yaw ? 0.45 : w), y + 2.1, z + (yaw ? w : 0.45))); for (let k = 0; k < 2; k++) bag.add('cedar', yaw ? box(x + 0.44, y + 0.1, z + 0.08 + k * 0.7, x + 0.5, y + 2.0, z + 0.72 + k * 0.7) : box(x + 0.08 + k * 0.7, y + 0.1, z + 0.44, x + 0.72 + k * 0.7, y + 2.0, z + 0.5)); col.rect([x, z, x + (yaw ? 0.5 : w), z + (yaw ? w : 0.5)], y, y + 2.1); };
  void W;
  // storey 0: store and stable — jars of grain and dates along the east wall, sacks, a trough, a heap of straw
  {
    const y = F0;
    for (let k = 0; k < 5; k++) { jar(bag, 'big', x1 - 0.5, y, z0 + 0.5 + k * 0.85, 0.95, 'terracotta'); col.circle(x1 - 0.5, z0 + 0.5 + k * 0.85, 0.38, y, y + 0.9); }
    for (let k = 0; k < 4; k++) { jar(bag, 'sack', x0 + 0.5 + k * 0.5, y, z0 + 0.4, 1.2, 'sacking'); }
    col.rect([x0 + 0.2, z0 + 0.1, x0 + 2.3, z0 + 0.75], y, y + 0.7);
    bag.add('timber', box(x0 + 0.3, y, z1 - 1.0, x0 + 2.8, y + 0.4, z1 - 0.35)); bag.add('opening', box(x0 + 0.4, y + 0.3, z1 - 0.9, x0 + 2.7, y + 0.42, z1 - 0.45)); col.rect([x0 + 0.3, z1 - 1.0, x0 + 2.8, z1 - 0.35], y, y + 0.4);
    bag.add('thatch', box(x0 + 2.2, y, z1 - 2.8, x0 + 4.2, y + 0.3, z1 - 1.5));
    jar(bag, 'pot', x0 + 3.5, y, z0 + 0.5, 1.2, 'pottery_dark');
    lights.push({ at: [x0 + 2.0, y + 2.3, z0 + 3.4], color: '#ffd9a0', intensity: 1.4, distance: 6 });
  }
  // storey 1: the women's quarters — a hearth of stones with its pot, jars, bedding, a chest, a spindle
  {
    const y = ys(1), cx = (x0 + x1) / 2;
    bag.add('schist_rubble', box(x1 - 1.5, y, z1 - 1.4, x1 - 0.3, y + 0.3, z1 - 0.3)); jar(bag, 'pot', x1 - 0.9, y + 0.3, z1 - 0.85, 1.3, 'pottery_dark'); col.rect([x1 - 1.5, z1 - 1.4, x1 - 0.3, z1 - 0.3], y, y + 0.6);
    for (let k = 0; k < 4; k++) jar(bag, 'pot', x1 - 0.5, y, z0 + 0.5 + k * 0.5, 1.1, k % 2 ? 'terracotta' : 'pottery_dark');
    rug(cx - 1.4, z0 + 2.0, cx + 1.2, z0 + 4.2, y, 'cloth_ochre');
    mattress(x0 + 0.2, z0 + 0.2, x0 + 2.0, z0 + 0.95, y); mattress(x0 + 0.2, z0 + 1.1, x0 + 2.0, z0 + 1.85, y);
    chest(x0 + 0.3, z1 - 0.95, x0 + 1.5, z1 - 0.3, y);
    lights.push({ at: [cx, y + 2.3, (z0 + z1) / 2], color: '#ffd9a0', intensity: 1.2, distance: 6 });
  }
  // storey 2: the family's room — a low carpet, mattresses rolled against the wall, chests, brass
  {
    const y = ys(2), cx = (x0 + x1) / 2;
    rug(x0 + 0.6, z0 + 1.2, x1 - 0.6, z1 - 1.2, y, 'cloth_maroon');
    for (let k = 0; k < 3; k++) bag.add('cloth_white', rod([x1 - 0.3, y + 0.14, z0 + 0.4 + k * 0.32], [x1 - 1.6, y + 0.14, z0 + 0.4 + k * 0.32], 0.14, 8));
    chest(x0 + 0.3, z1 - 0.9, x0 + 1.7, z1 - 0.3, y); chest(x0 + 1.9, z1 - 0.8, x0 + 3.0, z1 - 0.3, y, 0.5);
    jar(bag, 'pan', cx, y + 0.025, (z0 + z1) / 2, 2, 'bronze');
  }
  // storey 3: bedroom with its wardrobe doors
  {
    const y = ys(3);
    wardrobe(x1 - 0.5, z0 + 0.4, 1, y); mattress(x0 + 0.3, z0 + 0.3, x0 + 2.3, z0 + 1.3, y + 0.0); mattress(x0 + 0.3, z0 + 1.5, x0 + 2.3, z0 + 2.5, y);
    chest(x0 + 0.3, z1 - 0.95, x0 + 1.6, z1 - 0.3, y); rug(x0 + 2.6, z0 + 2.6, x1 - 1.0, z1 - 0.6, y, 'cloth_red');
  }
  // storey 4: the majlis — seats round three walls, carpets, cushions, the coffee set and incense, a lamp in a niche
  {
    const y = ys(4), cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, sd = 0.75;
    seat(x1 - sd, z0 + 0.1, x1 - 0.02, z1 - 0.1, y); seat(x0 + 0.05, z1 - sd, x1 - sd, z1 - 0.02, y);
    seat(x0 + 0.05, z0 + 0.1, x0 + sd, z0 + 3.2, y);
    for (let k = 0; k < 7; k++) cushion(x1 - 0.22, y + 0.18, z0 + 0.6 + k * 0.95, 'z');
    for (let k = 0; k < 4; k++) cushion(x0 + 1.0 + k * 1.1, y + 0.18, z1 - 0.2, 'x');
    rug(x0 + 0.9, z0 + 0.7, x1 - sd - 0.1, z1 - sd - 0.1, y, 'cloth_maroon'); rug(cx - 1.2, cz - 1.0, cx + 1.0, cz + 1.0, y + 0.025, 'cloth_ochre');
    jar(bag, 'pan', cx, y + 0.05, cz, 1.4, 'bronze');
    for (let k = 0; k < 3; k++) { bag.add('bronze', lathe([[0.001, 0], [0.07, 0.01], [0.09, 0.1], [0.04, 0.22], [0.025, 0.3], [0.05, 0.34], [0.001, 0.35]], 10, null, cx + 0.35 + k * 0.2, y + 0.05, cz + 0.3)); }
    bag.add('bronze', lathe([[0.001, 0], [0.1, 0.02], [0.12, 0.1], [0.06, 0.16], [0.001, 0.2]], 10, null, cx - 0.5, y + 0.05, cz - 0.2));
    // the niches in the south wall with a lamp, and the carved wardrobe doors beside the stair
    for (let k = 0; k < 3; k++) { bag.add('wood_dark', box(x0 + 0.6 + k * 1.6, y + 1.2, z1 - 0.12, x0 + 1.4 + k * 1.6, y + 1.9, z1 - 0.01)); bag.add('lime_plaster', box(x0 + 0.55 + k * 1.6, y + 1.9, z1 - 0.14, x0 + 1.45 + k * 1.6, y + 1.98, z1 - 0.01)); }
    bag.add('timber', box(x0 + 0.02, y + 0.9, z0 + 4.1, x0 + 0.16, y + 2.4, z1 - 0.2)); bag.add('cedar', box(x0 + 0.16, y + 0.95, z0 + 4.2, x0 + 0.2, y + 2.35, z1 - 0.3));
    lights.push({ at: [cx, y + 2.4, cz], color: '#ffcf8a', intensity: 3.0, distance: 8 });
    lights.push({ at: [x0 + 1.0, y + 1.7, z1 - 0.4], color: '#ff9a4a', intensity: 1.2, distance: 4 });
  }
  // storey 5: the pleasant upper room with its mashrabiya and wardrobe doors
  {
    const y = ys(5), cx = (x0 + x1) / 2;
    wardrobe(x1 - 0.5, z0 + 0.4, 1, y); wardrobe(x1 - 0.5, z0 + 2.2, 1, y);
    rug(x0 + 0.8, z0 + 1.2, x1 - 1.2, z1 - 0.8, y, 'cloth_red'); mattress(x0 + 0.3, z1 - 1.0, x0 + 2.4, z1 - 0.2, y);
    chest(x0 + 2.8, z1 - 0.9, x0 + 4.0, z1 - 0.3, y, 0.55);
    lights.push({ at: [cx, y + 2.3, (z0 + z1) / 2], color: '#ffe0b0', intensity: 2.0, distance: 7 });
  }
  // storey 6: a small room under the roof: water jars and a skin, bundles
  {
    const y = ys(6);
    for (let k = 0; k < 4; k++) jar(bag, 'pot', x0 + 0.5 + k * 0.5, y, z1 - 0.45, 1.3, 'terracotta');
    bag.add('hide_tan', rod([x1 - 0.6, y + 0.3, z0 + 0.6], [x1 - 0.6, y + 0.3, z0 + 1.5], 0.25, 8));
    rug(x0 + 1.2, z0 + 1.0, x1 - 1.2, z1 - 1.6, y, 'cloth_ochre');
  }
}

export const OPEN_ELEMENTS = { tower_open: towerOpen };
