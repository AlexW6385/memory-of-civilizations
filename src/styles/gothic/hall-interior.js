// The Grand-Salle inside, about 1248 (docs/settlements/paris.md §1c2): the hall of the Palais de la Cité entered from the
// king's gallery. Two naves side by side, divided by a row of round pillars, each nave under a barrel vault of painted
// boards on timber ribs; the kings' statues standing on corbels under little canopies on the pillars and along the walls;
// the king's dais at the west end under its cloth of estate; trestle tables with benches and the feast's vessels; iron
// coronas of candles hung from the vaults; a flagged floor, benches along the walls, braziers.
// Everything in world coordinates, called from `palace_hall` with the hall's frame.

import { box, lathe, rod, fromTriangles } from '../../core/geom.js';
import { pier } from './nd-interior.js';
import { figure, prism } from './notre-dame.js';

const PAINT = ['paint_robe', 'paint_blue', 'paint_castle', 'paint_fleur'];
const spreadRng = (seed) => { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };

/** The rise of the vault's soffit over a nave of width W at fraction t across (0 at a wall, 1 at the pillars): a pointed arch. */
const arcAt = (t, R) => R * (1 - Math.pow(Math.abs(2 * t - 1), 1.55));

/** A downward-facing strip surface from rows of points (each row across the nave). */
function soffit(rows) {
  const tris = [];
  for (let i = 0; i < rows.length - 1; i++) for (let j = 0; j < rows[i].length - 1; j++) {
    const a = rows[i][j], b = rows[i + 1][j], c = rows[i + 1][j + 1], d = rows[i][j + 1];
    for (const t of [[a, b, c], [a, c, d]]) {
      const ux = t[1][0] - t[0][0], uy = t[1][1] - t[0][1], uz = t[1][2] - t[0][2], vx = t[2][0] - t[0][0], vy = t[2][1] - t[0][1], vz = t[2][2] - t[0][2];
      const ny = uz * vx - ux * vz;
      tris.push(...(ny > 0 ? [...t[0], ...t[2], ...t[1]] : [...t[0], ...t[1], ...t[2]]));
    }
  }
  return fromTriangles(tris);
}

/**
 * ctx { bag, col, lights }, hall { x0, z0, x1, z1 (the outer rect), T (the walls' thickness), y (the floor), E (the walls' top),
 * bl (the bay), n (the bays), door: x of the gallery door in the south wall }.
 */
export function hallInterior(ctx, H) {
  const { bag, col, lights } = ctx, { x0, z0, x1, z1, T, y, bl, n } = H, rand = spreadRng(1248);
  const xa = x0 + T, xb = x1 - T, za = z0 + T, zb = z1 - T, zc = (z0 + z1) / 2, FL = y;
  // ── the floor: flags, laid in rows
  bag.add('flagstone', box(xa, FL - 0.1, za, xb, FL + 0.012, zb));
  for (let x = xa + 1.6; x < xb; x += 1.6) bag.add('limestone', box(x - 0.012, FL + 0.012, za, x + 0.012, FL + 0.02, zb));
  col.floor([xa, za, xb, zb], FL);

  // ── the barrel vaults of boards, each nave from a wall to the row of pillars, on timber ribs at every bay
  const SPR = FL + 7.9, RV = 5.0, NS = 16;
  for (const [a, b] of [[za, zc], [zc, zb]]) {
    const rows = [];
    for (const x of [xa, xb]) rows.push(Array.from({ length: NS + 1 }, (_, j) => { const t = j / NS; return [x, SPR + arcAt(t, RV), a + (b - a) * t]; }));
    bag.add('vault_stars', soffit(rows));
    // the ribs: one at each pillar and the ends, a round rod hung under the boards; the longitudinal ridge-piece
    for (let k = 0; k <= n; k++) {
      const x = xa + (xb - xa) * k / n;
      for (let j = 0; j < NS; j++) {
        const t0 = j / NS, t1 = (j + 1) / NS;
        bag.add('timber', rod([x, SPR + arcAt(t0, RV) - 0.12, a + (b - a) * t0], [x, SPR + arcAt(t1, RV) - 0.12, a + (b - a) * t1], 0.16, 5));
      }
      // the tie-beam across the nave at the springing, with its king-post
      bag.add('timber', box(x - 0.14, SPR - 0.46, a, x + 0.14, SPR - 0.16, b));
    }
    bag.add('timber', box(xa, SPR + RV - 0.32, (a + b) / 2 - 0.16, xb, SPR + RV - 0.12, (a + b) / 2 + 0.16));
  }
  bag.add('timber', box(xa, SPR - 0.3, za, xb, SPR, za + 0.4));
  bag.add('timber', box(xa, SPR - 0.3, zb - 0.4, xb, SPR, zb));
  bag.add('timber', box(xa, SPR - 0.3, zc - 0.5, xb, SPR + 0.05, zc + 0.5));              // the beam along the pillars' heads

  // ── the row of round pillars with their capitals, a king on a corbel under a canopy on each
  const px = [];
  for (let k = 1; k < n; k++) px.push(x0 + k * bl);
  px.forEach((x, i) => {
    pier(bag, x, zc, FL, SPR - FL - 1.3, 0.62);
    col.circle(x, zc, 0.85, FL, SPR);
    const f = i % 2 ? [0, 1] : [0, -1], zs = zc + f[1] * 0.62;
    corbelStatue(bag, x, FL + 2.7, zs, f, i);
  });
  // the kings along the walls on corbels at the buttresses
  for (let k = 1; k < n; k++) for (const [zw, f] of [[za, [0, 1]], [zb, [0, -1]]]) {
    const x = x0 + k * bl + 1.4 * (k % 2 ? 1 : -1);
    if (Math.abs(x - H.door) < 2.2 && f[1] < 0) continue;
    corbelStatue(bag, x, FL + 3.2, zw + f[1] * 0.1, f, k + 11, true);
  }
  // the string course under the great windows and the cornice at the springing, carried round the walls
  for (const [zw, s] of [[za, -1], [zb, 1]]) bag.add('limestone', box(xa, FL + 1.85, zw - 0.14 * (s > 0 ? 1 : -1) - (s > 0 ? 0.14 : 0), xb, FL + 2.0, zw + (s > 0 ? 0 : 0.14)));

  // ── benches of stone along the north wall, the aisle's width kept clear
  bag.add('limestone', box(xa + 6.5, FL, za, xb - 8, FL + 0.5, za + 0.5));
  col.rect([xa + 6.5, za, xb - 8, za + 0.5], FL, FL + 0.5);
  bag.add('cloth_red', box(xa + 8, FL + 0.5, za + 0.02, xb - 10, FL + 0.55, za + 0.46));

  // ── the king's dais at the west end between the great windows: two steps, the chair of state, the cloth of estate
  const dz0 = zc - 4.2, dz1 = zc + 4.2, dx1 = xa + 4.6;
  bag.add('limestone', box(xa, FL, dz0 - 1.0, dx1 + 1.0, FL + 0.2, dz1 + 1.0));
  bag.add('limestone', box(xa, FL + 0.2, dz0, dx1, FL + 0.4, dz1));
  bag.add('cloth_red', box(xa + 0.2, FL + 0.4, dz0 + 0.3, dx1 - 0.2, FL + 0.42, dz1 - 0.3));
  col.rect([xa, dz0 - 1.0, dx1 + 1.0, dz1 + 1.0], FL, FL + 0.2);
  col.rect([xa, dz0, dx1, dz1], FL + 0.1, FL + 0.4);
  col.floor([xa, dz0 - 1.0, dx1 + 1.0, dz1 + 1.0], FL + 0.2);
  col.floor([xa, dz0, dx1, dz1], FL + 0.4);
  { const cx = xa + 0.9, cz = zc;                                                              // the chair: a seat on a plinth, a tall back with a gable
    bag.add('wood_dark', box(cx - 0.4, FL + 0.4, cz - 0.55, cx + 0.5, FL + 0.9, cz + 0.55));
    bag.add('cloth_red', box(cx - 0.34, FL + 0.9, cz - 0.5, cx + 0.44, FL + 1.0, cz + 0.5));
    bag.add('wood_dark', box(cx - 0.5, FL + 0.9, cz - 0.6, cx - 0.36, FL + 2.6, cz + 0.6));
    for (const s of [-1, 1]) bag.add('wood_dark', box(cx - 0.4, FL + 0.9, cz + s * 0.6 - 0.07, cx + 0.5, FL + 1.35, cz + s * 0.6 + 0.07));
    const g = [];
    prism(g, [[cx - 0.5, FL + 2.6, cz - 0.7], [cx - 0.5, FL + 2.6, cz + 0.7], [cx - 0.5, FL + 3.4, cz]], [0.16, 0, 0]);
    bag.add('gold', fromTriangles(g));
    col.rect([cx - 0.5, cz - 0.7, cx + 0.5, cz + 0.7], FL + 0.4, FL + 2.0);
  }
  // the cloth of estate on the wall behind: blue sown with gilt fleurs-de-lis, hung from a rod, a gilt fringe
  bag.add('paint_fleur', box(xa + 0.01, FL + 1.1, zc - 2.6, xa + 0.07, FL + 6.0, zc + 2.6));
  bag.add('gold', box(xa + 0.01, FL + 6.0, zc - 2.7, xa + 0.12, FL + 6.12, zc + 2.7));
  bag.add('gold', box(xa + 0.01, FL + 1.0, zc - 2.6, xa + 0.09, FL + 1.1, zc + 2.6));
  // two candle-stands either side of the dais
  for (const s of [-1, 1]) candleStand(bag, col, lights, xa + 4.0, FL + 0.4, zc + s * 3.4, 1.9);

  // ── the feast: two trestle tables down the south nave with their benches, cloths, bowls, jugs and cups
  const zt = (zc + zb) / 2;
  for (const [t0, t1] of [[xa + 14, xa + 28], [xa + 31, xa + 45]]) {
    tableAt(bag, col, t0, t1, zt, rand, FL);
  }
  // the north nave: a long serving table at the east end with a cupboard (dressoir) of silver
  { const dx0 = xb - 10, dxx = xb - 0.6, dzz = (za + zc) / 2;
    bag.add('wood_dark', box(dx0, FL + 0.74, dzz - 0.5, dxx, FL + 0.8, dzz + 0.5));
    for (const x of [dx0 + 0.3, (dx0 + dxx) / 2, dxx - 0.3]) for (const s of [-0.4, 0.4]) bag.add('wood_dark', box(x - 0.05, FL, dzz + s - 0.05, x + 0.05, FL + 0.74, dzz + s + 0.05));
    col.rect([dx0, dzz - 0.5, dxx, dzz + 0.5], FL, FL + 0.8);
    bag.add('linen', box(dx0 + 0.05, FL + 0.8, dzz - 0.46, dxx - 0.05, FL + 0.84, dzz + 0.46));
    for (let x = dx0 + 0.7; x < dxx - 0.5; x += 0.9) { bag.add('silver', lathe([[0.001, 0], [0.09, 0.02], [0.11, 0.14], [0.13, 0.2], [0.001, 0.2]], 8, null, x, FL + 0.84, dzz - 0.2)); bag.add('pottery_dark', lathe([[0.001, 0], [0.1, 0.02], [0.14, 0.18], [0.08, 0.3], [0.001, 0.3]], 8, null, x, FL + 0.84, dzz + 0.2)); }
    // the cupboard: three tiers of shelves against the east wall with plate on them
    const cx = xb - 0.5;
    bag.add('wood_dark', box(cx - 0.5, FL, dzz - 2.0, cx, FL + 0.2, dzz + 2.0));
    for (const yy of [0.2, 0.95, 1.7]) { bag.add('wood_dark', box(cx - 0.5, FL + yy, dzz - 2.0, cx, FL + yy + 0.06, dzz + 2.0)); for (let z = dzz - 1.7; z < dzz + 1.8; z += 0.5) bag.add(rand() < 0.5 ? 'silver' : 'gilt_bronze', lathe([[0.001, 0], [0.1, 0.02], [0.13, 0.08], [0.09, 0.2], [0.001, 0.2]], 8, null, cx - 0.25, FL + yy + 0.06, z)); }
    for (const z of [dzz - 2.0, dzz + 2.0]) bag.add('wood_dark', box(cx - 0.5, FL, z - 0.04, cx, FL + 2.5, z + 0.04));
    bag.add('wood_dark', box(cx - 0.5, FL + 2.4, dzz - 2.0, cx, FL + 2.5, dzz + 2.0));
    col.rect([cx - 0.5, dzz - 2.0, cx, dzz + 2.0], FL, FL + 2.5);
  }

  // ── the coronas: iron rings with candles, on chains from the ribs, one over each nave at two bays
  for (const [zn, xs] of [[(za + zc) / 2, [xa + 18, xa + 42]], [zt, [xa + 18, xa + 42]]]) for (const x of xs) corona(bag, lights, x, SPR + arcAt(0.5, RV) - 0.15, zn, 2.6);
  // braziers of iron on three legs, glowing, by the door and at the east end
  for (const [x, z] of [[H.door - 2.6, zb - 1.6], [xb - 2.4, zc + 5], [xa + 10, zc - 8]]) brazier(bag, col, x, FL, z);
  // the door's leaf open against its jamb
  bag.add('wood_dark', box(H.door + 0.95, FL, zb - 0.9, H.door + 1.03, FL + 2.7, zb - 0.1));
}

/** A statue on a carved corbel under a canopy: a king in a painted robe and crown (or a crowned lady), facing f. */
function corbelStatue(bag, x, y, z, f, i, wall = false) {
  const m = PAINT[i % PAINT.length];
  bag.add('limestone_carved', lathe([[0.001, 0], [0.16, 0.2], [0.26, 0.38], [0.3, 0.5]], 8, null, x, y - 0.5, z));
  bag.add('limestone', box(x - 0.3, y - 0.04, z - 0.3, x + 0.3, y + 0.06, z + 0.3));
  figure(bag, x, y + 0.06, z, 2.1, { mat: m, crown: true, crownMat: 'gold', face: f, book: i % 3 === 0 });
  // the canopy: a little gabled hood on two shafts of colonnette, a finial
  const cy = y + 2.5;
  bag.add('limestone', lathe([[0.34, 0], [0.3, 0.14], [0.2, 0.34], [0.001, 0.7]], 4, null, x, cy, z));
  bag.add('limestone_carved', lathe([[0.04, 0], [0.06, 0.18], [0.001, 0.32]], 6, null, x, cy + 0.68, z));
  if (!wall) for (const s of [-1, 1]) bag.add('limestone', rod([x + s * 0.28 * Math.abs(f[1]), y + 0.06, z + s * 0.28 * Math.abs(f[0])], [x + s * 0.28 * Math.abs(f[1]), cy, z + s * 0.28 * Math.abs(f[0])], 0.035, 5));
}

/** A trestle table with benches either side from x0 to x1 at z, set for a feast. */
function tableAt(bag, col, x0, x1, z, rand, y) {
  bag.add('timber', box(x0, y + 0.74, z - 0.5, x1, y + 0.8, z + 0.5));
  bag.add('linen', box(x0 + 0.1, y + 0.8, z - 0.46, x1 - 0.1, y + 0.84, z + 0.46));
  bag.add('cloth_red', box(x0 + 0.1, y + 0.82, z - 0.12, x1 - 0.1, y + 0.855, z + 0.12));
  for (let x = x0 + 0.6; x < x1 - 0.3; x += 2.4) for (const s of [-0.38, 0.38]) bag.add('wood_dark', box(x - 0.05, y, z + s - 0.05, x + 0.05, y + 0.74, z + s + 0.05));
  for (let x = x0 + 0.6; x < x1 - 0.3; x += 2.4) bag.add('wood_dark', box(x - 0.04, y + 0.2, z - 0.4, x + 0.04, y + 0.26, z + 0.4));
  for (const s of [-1, 1]) {
    bag.add('timber', box(x0 + 0.2, y + 0.4, z + s * 1.0 - 0.17, x1 - 0.2, y + 0.45, z + s * 1.0 + 0.17));
    for (let x = x0 + 0.6; x < x1 - 0.3; x += 2.4) for (const q of [-0.1, 0.1]) bag.add('wood_dark', box(x - 0.04, y, z + s * 1.0 + q - 0.04, x + 0.04, y + 0.4, z + s * 1.0 + q + 0.04));
  }
  col.rect([x0, z - 1.2, x1, z + 1.2], y, y + 0.9);
  // the feast: a bowl or trencher, a cup and a loaf for each place, jugs and a salt between
  for (let x = x0 + 0.5; x < x1 - 0.4; x += 0.9) for (const s of [-1, 1]) {
    bag.add('pottery_dark', lathe([[0.001, 0], [0.1, 0.01], [0.16, 0.06], [0.001, 0.06]], 8, null, x, y + 0.84, z + s * 0.28));
    bag.add('silver', lathe([[0.001, 0], [0.04, 0.01], [0.05, 0.1], [0.07, 0.13], [0.001, 0.13]], 7, null, x + 0.22, y + 0.84, z + s * 0.32));
    if (rand() < 0.6) bag.add('hide_tan', box(x - 0.34, y + 0.84, z + s * 0.2 - 0.07, x - 0.2, y + 0.92, z + s * 0.2 + 0.07));
  }
  for (let x = x0 + 2.2; x < x1 - 1; x += 3.6) { bag.add('terracotta', lathe([[0.001, 0], [0.1, 0.02], [0.13, 0.14], [0.07, 0.26], [0.09, 0.3], [0.001, 0.3]], 8, null, x, y + 0.84, z)); bag.add('silver', lathe([[0.04, 0], [0.07, 0.06], [0.05, 0.1], [0.001, 0.1]], 7, null, x + 0.5, y + 0.84, z)); }
}

/** A tall iron stand with a candle in a socket and a drip-pan, lit. */
function candleStand(bag, col, lights, x, y, z, h) {
  bag.add('iron', lathe([[0.22, 0], [0.18, 0.05], [0.04, 0.2], [0.03, h - 0.1], [0.09, h]], 8, null, x, y, z));
  bag.add('ivory', lathe([[0.04, 0], [0.04, 0.3], [0.001, 0.3]], 6, null, x, y + h, z));
  bag.add('flame', lathe([[0.001, 0], [0.025, 0.04], [0.001, 0.1]], 5, null, x, y + h + 0.3, z));
  col.circle(x, z, 0.25, y, y + h);
  lights.push({ at: [x, y + h + 0.4, z], color: '#ffc27a', intensity: 1.2, distance: 7 });
}

/** An iron corona of candles hung on a chain: a ring of r, twelve candles, the chain up to y + 3. */
function corona(bag, lights, x, yTop, z, r) {
  const y = yTop - 3.4, N = 14;
  for (let i = 0; i < N; i++) {
    const a = i / N * Math.PI * 2, b = (i + 1) / N * Math.PI * 2;
    bag.add('iron', rod([x + Math.cos(a) * r, y, z + Math.sin(a) * r], [x + Math.cos(b) * r, y, z + Math.sin(b) * r], 0.04, 4));
  }
  for (let i = 0; i < 12; i++) {
    const a = i / 12 * Math.PI * 2, cx = x + Math.cos(a) * r, cz = z + Math.sin(a) * r;
    bag.add('ivory', lathe([[0.04, 0], [0.04, 0.26], [0.001, 0.26]], 6, null, cx, y + 0.04, cz));
    bag.add('flame', lathe([[0.001, 0], [0.025, 0.05], [0.001, 0.12]], 5, null, cx, y + 0.3, cz));
  }
  for (const s of [0, Math.PI / 2, Math.PI, 3 * Math.PI / 2]) bag.add('iron', rod([x + Math.cos(s) * r, y, z + Math.sin(s) * r], [x, y + 1.3, z], 0.02, 4));
  bag.add('iron', rod([x, y + 1.3, z], [x, yTop, z], 0.02, 4));
  bag.add('iron', lathe([[0.001, 0], [0.12, 0.08], [0.001, 0.2]], 8, null, x, y + 1.2, z));
  lights.push({ at: [x, y + 0.5, z], color: '#ffc27a', intensity: 3.2, distance: 14 });
}

/** A brazier: a bowl of iron on three legs, embers in it. */
function brazier(bag, col, x, y, z) {
  bag.add('iron', lathe([[0.001, 0.4], [0.3, 0.5], [0.42, 0.72], [0.38, 0.76], [0.001, 0.62]], 10, null, x, y, z));
  for (let k = 0; k < 3; k++) { const a = k * 2.094; bag.add('iron', rod([x + Math.cos(a) * 0.3, y + 0.55, z + Math.sin(a) * 0.3], [x + Math.cos(a) * 0.42, y, z + Math.sin(a) * 0.42], 0.035, 4)); }
  bag.add('flame', lathe([[0.001, 0.7], [0.3, 0.72], [0.001, 0.78]], 8, null, x, y, z));
  col.circle(x, z, 0.45, y, y + 0.8);
}
export { tableAt };
