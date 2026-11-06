// The Mercato Vecchio about 1480 (docs/settlements/florence.md §4): the market on the old Roman
// forum, at the crossing of the cardo and the decumanus. In its middle the column of Abundance
// (1430–31), a shaft of grey Elba granite carrying Donatello's Dovizia in pietra serena — a woman
// with a cornucopia on her arm and a basket of fruit on her head — with its two chains, one rung to
// open and close the market, the other for debtors and swindlers shamed in public. Round it the
// long low market hall under an overhanging tiled roof, stalls along both its sides: the butchers'
// and the fishmongers' counters, the greengrocers' baskets.

import { box, lathe, rod } from '../../core/geom.js';
import { Local, ext } from './face.js';
import { ball, limb, T } from '../qing/carving.js';

const ST = 'plaster_damp', MS = 'marble_smooth', GR = 'granite_grey', SER = 'pietra_serena', PF = 'limestone_yellow', M = 'marble', TI = 'timber', W = 'wood_dark', R = 'roof_tile', FE = 'iron';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/** Donatello's Dovizia, about 2.1 m, standing at the origin facing +z: the long gown, the cornucopia on her left arm, the basket of fruit on her head held by her right hand. */
function dovizia(Lc) {
  const B = (rx, ry, rz, x, y, z, n = 9) => Lc.add(ST, T(ball(rx, ry, rz, n), x, y, z));
  const L2 = (a, b, r0, r1) => Lc.add(ST, limb(a, b, r0, r1, 9));
  // the gown falling in folds to the feet, girt under the breast; the mantle over the left shoulder
  Lc.add(ST, lathe([[0.31, 0], [0.3, 0.08], [0.26, 0.4], [0.22, 0.8], [0.21, 1.0], [0.165, 1.16], [0.185, 1.3], [0.2, 1.42], [0.17, 1.5], [0.07, 1.57], [0.001, 1.6]], 18, (th, j) => (j < 5 ? 1 + 0.07 * Math.cos(th * 9) : 1), 0, 0, 0).scale(1, 1, 0.72));
  Lc.add(ST, lathe([[0.17, 0], [0.18, 0.03], [0.17, 0.06]], 14, null, 0, 1.15, 0).scale(1, 1, 0.74));
  L2([0.12, 1.5, -0.04], [0.25, 0.7, -0.1], 0.09, 0.14);
  B(0.06, 0.05, 0.1, -0.08, 0.04, 0.3, 7);
  // the neck, the head, the hair bound up
  L2([0, 1.6, 0], [0, 1.7, 0.01], 0.05, 0.05); B(0.085, 0.105, 0.095, 0, 1.79, 0.02); B(0.08, 0.06, 0.08, 0, 1.86, -0.03, 7);
  // the basket on her head: a flared basket, fruit heaped in it
  Lc.add(ST, lathe([[0.001, 0], [0.13, 0], [0.22, 0.14], [0.24, 0.17], [0.001, 0.17]], 14, null, 0, 1.88, 0));
  for (const [x, z, r] of [[0, 0, 0.09], [0.11, 0.05, 0.07], [-0.1, 0.06, 0.07], [0.05, -0.11, 0.07], [-0.07, -0.09, 0.065], [0.15, -0.05, 0.06], [-0.15, -0.02, 0.06]]) B(r, r, r, x, 2.08 + (r === 0.09 ? 0.06 : 0), z, 7);
  // the right arm raised to steady the basket
  L2([-0.17, 1.52, 0], [-0.25, 1.75, 0.02], 0.05, 0.045); L2([-0.25, 1.75, 0.02], [-0.2, 1.95, 0.04], 0.045, 0.04);
  // the left forearm forward carrying the cornucopia: a curved horn spilling fruit, its point under the elbow
  L2([0.17, 1.52, 0], [0.22, 1.25, 0.06], 0.05, 0.045); L2([0.22, 1.25, 0.06], [0.16, 1.18, 0.25], 0.045, 0.04);
  const horn = [[0.2, 0.98, 0.02], [0.24, 1.08, 0.12], [0.25, 1.22, 0.2], [0.22, 1.38, 0.24], [0.17, 1.52, 0.24]];
  for (let i = 0; i + 1 < horn.length; i++) L2(horn[i], horn[i + 1], 0.012 + i * 0.022, 0.034 + i * 0.022);
  for (const [x, y, z, r] of [[0.17, 1.58, 0.24, 0.06], [0.12, 1.6, 0.2, 0.05], [0.22, 1.6, 0.18, 0.05], [0.15, 1.65, 0.28, 0.045]]) B(r, r, r, x, y, z, 7);
}

/** The column of Abundance standing at (x, z) on ground y: the steps, the base, the granite shaft, the capital, the Dovizia, the chains. */
function abundance(bag, col, x, z, y) {
  // three steps of pietraforte, the pedestal, the moulded base
  for (let i = 0; i < 3; i++) { const h = 2.6 - i * 0.55; bag.add(PF, box(x - h, y - 0.3 + i * 0.22, z - h, x + h, y + (i + 1) * 0.22, z + h)); }
  col.rect([x - 2.6, z - 2.6, x + 2.6, z + 2.6], y, y + 0.66);
  for (let i = 0; i < 3; i++) col.floor([x - 2.6 + i * 0.55, z - 2.6 + i * 0.55, x + 2.6 - i * 0.55, z + 2.6 - i * 0.55], y + (i + 1) * 0.22);
  const yp = y + 0.66;
  bag.add(SER, box(x - 0.9, yp, z - 0.9, x + 0.9, yp + 0.25, z + 0.9));
  bag.add(SER, box(x - 0.78, yp + 0.25, z - 0.78, x + 0.78, yp + 1.6, z + 0.78));
  bag.add(SER, box(x - 0.88, yp + 1.6, z - 0.88, x + 0.88, yp + 1.78, z + 0.88));
  col.rect([x - 0.9, z - 0.9, x + 0.9, z + 0.9], yp, yp + 1.8);
  // the base (torus, scotia, torus), the shaft with its entasis, the capital of acanthus, the abacus
  const yb = yp + 1.78, r = 0.42, hs = 7.2;
  bag.add(MS, lathe([[0.62, 0], [0.62, 0.12], [0.58, 0.2], [0.5, 0.24], [0.5, 0.3], [0.55, 0.36], [0.46, 0.44], [0.001, 0.44]], 18, null, x, yb, z));
  bag.add(GR, lathe([[r, 0], [r * 1.0, hs * 0.33], [r * 0.9, hs], [0.001, hs]], 18, null, x, yb + 0.44, z));
  const yc = yb + 0.44 + hs;
  bag.add(MS, lathe([[r * 0.95, 0], [r * 1.0, 0.06], [r * 0.95, 0.1], [r * 1.05, 0.35], [r * 1.35, 0.6], [r * 1.55, 0.78], [r * 1.6, 0.8]], 16, (th, j) => (j >= 3 && j <= 5 ? 1 + 0.13 * Math.cos(th * 8) : 1), x, yc, z));
  for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + Math.PI / 4, g = box(-0.09, -0.1, -0.06, 0.09, 0.1, 0.06); g.rotateY(-a); g.translate(x + Math.cos(a) * r * 1.55, yc + 0.72, z + Math.sin(a) * r * 1.55); bag.add(MS, g); }   // the volutes
  bag.add(MS, box(x - 0.72, yc + 0.8, z - 0.72, x + 0.72, yc + 1.0, z + 0.72));
  const Lc = new Local(); dovizia(Lc);
  for (const list of Lc.m.values()) for (const g of list) { g.rotateY(Math.PI); g.translate(x, yc + 1.0, z); }       // facing north, toward the cathedral
  Lc.emit(bag);
  // the two chains: hung from iron rings on the pedestal's east and west faces, in swags to the ground
  for (const s of [-1, 1]) {
    const rx = x + s * 0.8, ry = yp + 1.2;
    bag.add(FE, box(Math.min(rx, rx + s * 0.08), ry - 0.07, z - 0.05, Math.max(rx, rx + s * 0.08), ry + 0.05, z + 0.05));   // the staple
    let px = rx + s * 0.06, py = ry - 0.04;
    for (let i = 1; i <= 9; i++) { const t = i / 9, nx = rx + s * (0.06 + t * 0.55), ny = ry - 0.04 - Math.sin(t * Math.PI * 0.5) * 0.95; bag.add(FE, rod([px, py, z], [nx, ny, z], 0.018, 5)); px = nx; py = ny; }
  }
}

/**
 * mercato: { rect, y, column: [x, z], hall: [x0, z0, x1, z1] } — the market: its column and its hall
 * of stalls (long along x).
 */
export function mercato(el, { bag, col }) {
  const y = el.y ?? 0, rand = rng(1431);
  const [cx, cz] = el.column;
  abundance(bag, col, cx, cz, y);
  if (el.hall) hall(bag, col, el.hall, y, rand);
}

/** The market hall: posts of timber on stone bases under an overhanging tiled roof, open at the gable ends; a spine wall of shop backs down the middle; counters on both sides. */
function hall(bag, col, r, y, rand) {
  const [x0, z0, x1, z1] = r, Lx = x1 - x0, mz = (z0 + z1) / 2, D = z1 - z0, nb = Math.round(Lx / 3.6), bw = Lx / nb, ye = y + 3.2, yr = ye + D * 0.28, over = 1.3;
  // the posts with their stone bases and brackets, the plates along both sides
  for (let i = 0; i <= nb; i++) for (const z of [z0, z1]) {
    const x = x0 + i * bw;
    bag.add(PF, box(x - 0.25, y - 0.2, z - 0.25, x + 0.25, y + 0.35, z + 0.25));
    bag.add(TI, box(x - 0.13, y + 0.35, z - 0.13, x + 0.13, ye - 0.3, z + 0.13));
    // knee braces from the post up to the plate, along the hall
    for (const sx of [-1, 1]) if ((sx < 0 && i > 0) || (sx > 0 && i < nb)) bag.add(TI, rod([x + sx * 0.1, ye - 1.15, z], [x + sx * 0.8, ye - 0.32, z], 0.06, 6));
    col.rect([x - 0.25, z - 0.25, x + 0.25, z + 0.25], y, ye);
  }
  for (const z of [z0, z1]) bag.add(TI, box(x0 - 0.15, ye - 0.3, z - 0.15, x1 + 0.15, ye, z + 0.15));
  bag.add(TI, box(x0 - 0.1, yr - 0.35, mz - 0.12, x1 + 0.1, yr - 0.1, mz + 0.12));     // the ridge beam
  for (let i = 0; i <= nb; i++) bag.add(TI, box(x0 + i * bw - 0.1, ye - 0.3, mz - 0.1, x0 + i * bw + 0.1, yr - 0.35, mz + 0.1));   // the king posts
  // the roof: two slopes over the eaves, hipped at the ends
  const ang = Math.atan2(yr - ye, D / 2), len = (D / 2 + over) / Math.cos(ang);
  for (const s of [-1, 1]) { const g = box(x0 - over, -0.09, 0, x1 + over, 0.09, len); g.rotateX(s < 0 ? Math.PI - ang : ang); g.translate(0, yr, mz); bag.add(R, g); }
  // the spine: the stall-holders' boards and back shelves down the middle, a counter on each side
  bag.add(W, box(x0 + 0.2, y, mz - 0.08, x1 - 0.2, y + 2.4, mz + 0.08));
  col.rect([x0 + 0.2, mz - 0.1, x1 - 0.2, mz + 0.1], y, y + 2.4);
  for (let i = 0; i < nb; i++) for (const s of [-1, 1]) {
    const a = x0 + i * bw + 0.25, b = a + bw - 0.5, zc = s < 0 ? z0 + 0.9 : z1 - 0.9, kind = Math.floor(rand() * 3);
    // the counter (banco) on trestles, its top of thick planks
    bag.add(TI, box(a, y + 0.82, zc - 0.45, b, y + 0.9, zc + 0.45));
    for (const xx of [a + 0.15, b - 0.25]) bag.add(TI, box(xx, y, zc - 0.4, xx + 0.1, y + 0.82, zc + 0.4));
    col.rect([a, zc - 0.45, b, zc + 0.45], y, y + 0.9);
    // the shelf on the spine behind, with its jars
    const zs = mz + s * 0.3;
    bag.add(TI, box(a, y + 1.4, Math.min(zs, mz + s * 0.08), b, y + 1.45, Math.max(zs, mz + s * 0.08)));
    for (let k = 0; k < 3; k++) bag.add('terracotta', lathe([[0.05, 0], [0.1, 0.06], [0.11, 0.16], [0.06, 0.26], [0.07, 0.3], [0.001, 0.3]], 8, null, a + 0.4 + k * (b - a - 0.8) / 2, y + 1.45, mz + s * 0.2));
    if (kind === 0) {
      // the butcher: a rail of iron hooks over the counter, joints of meat hanging, a block
      bag.add(FE, rod([a + 0.1, y + 2.3, zc - s * 0.1], [b - 0.1, y + 2.3, zc - s * 0.1], 0.02, 5));
      for (let k = 0; k < 3; k++) { const xx = a + 0.4 + k * (b - a - 0.8) / 2; bag.add(FE, rod([xx, y + 2.3, zc - s * 0.1], [xx, y + 2.12, zc - s * 0.1], 0.008, 4)); bag.add('cloth_red', T(ball(0.1, 0.22, 0.08, 7), xx, y + 1.9, zc - s * 0.1)); }
      bag.add(W, lathe([[0.28, 0], [0.28, 0.7], [0.001, 0.7]], 10, null, b - 0.3, y, zc - s * 1.2));
    } else if (kind === 1) {
      // the fishmonger: fish laid in rows on the counter
      for (let k = 0; k < 6; k++) { const g = ball(0.16, 0.035, 0.05, 6); g.translate(a + 0.3 + (k % 3) * (b - a - 0.6) / 2, y + 0.93, zc + (k < 3 ? -0.18 : 0.18)); bag.add('granite_grey', g); }
    } else {
      // the greengrocer: shallow baskets heaped with fruit and greens
      for (let k = 0; k < 3; k++) {
        const xx = a + 0.45 + k * (b - a - 0.9) / 2;
        bag.add('wicker', lathe([[0.001, 0], [0.22, 0], [0.3, 0.14], [0.001, 0.14]], 10, null, xx, y + 0.9, zc));
        bag.add(k === 0 ? 'cloth_ochre' : k === 1 ? 'cloth_green' : 'terracotta', T(ball(0.26, 0.09, 0.26, 8), xx, y + 1.04, zc));
      }
    }
  }
  // the floor under the hall, of pietra serena flags
  bag.add(SER, box(x0 - 0.5, y - 0.3, z0 - 0.5, x1 + 0.5, y + 0.03, z1 + 0.5)); col.floor([x0 - 0.5, z0 - 0.5, x1 + 0.5, z1 + 0.5], y + 0.03);
}
