// The shop street's fronts and the lanes' wells (docs/settlements/qing-beijing.md §16, §17): shops of
// one or two storeys with an open timber front — posts, the high counter (guitai), plank shutters
// (paimen ban) stacked at the sides — under a grey-tiled roof, over the eave a painted board facade
// (the "pailou front", menlian) carrying the name board; before the front the standing signboards on
// stone feet, the hanging trade signs (huangzi) of each trade, a mat awning, red lanterns; behind the
// shops a walled yard with a lean-to store and a tree.

import { box, lathe, rod, hangFrom, windMat, fromTriangles } from '../../core/geom.js';
import { Parts, torus } from '../../styles/qing/carving.js';
import { plaqueBuild } from '../ming-suzhou/props.js';
import { Frame, gableRoof, rng } from './houses.js';

/** The hanging trade sign of each trade, in a local frame (hung from y = 0 down; +z out). */
function sign(P, trade, r) {
  const W = (g, top) => hangFrom(g, top);
  switch (trade) {
    case 'wine': {            // the wine flag: a long indigo and white banner on a pole
      P.add('timber', rod([0, 0, 0], [0, 0.0, 0.0], 0.001, 3));
      const g = box(-0.28, -1.9, -0.01, 0.28, 0, 0.01); P.add(windMat('cloth_indigo'), W(g, 0));
      break;
    }
    case 'tea': {             // a big wooden teapot painted red, and a hung board
      P.add('lacquer_red', lathe([[0.001, -0.5], [0.22, -0.5], [0.3, -0.3], [0.32, -0.15], [0.24, -0.02], [0.001, 0]], 10));
      P.add('lacquer_red', box(-0.03, -0.35, 0.28, 0.03, -0.12, 0.42));
      break;
    }
    case 'medicine': {        // a pair of gourds and a plaster sign
      P.add('pottery_dark', lathe([[0.001, -0.5], [0.12, -0.5], [0.2, -0.32], [0.1, -0.2], [0.1, -0.1], [0.14, -0.06], [0.001, 0]], 9));
      P.add('lacquer_black', box(-0.2, -1.5, -0.025, 0.2, -0.65, 0.025)); P.add('cloth_red', box(-0.17, -1.45, 0.025, 0.17, -0.7, 0.035));
      break;
    }
    case 'cloth': {           // streamers of cloth in colours
      for (let i = 0; i < 4; i++) { const g = box(-0.55 + i * 0.3, -1.3 - r() * 0.4, -0.01, -0.35 + i * 0.3, 0, 0.01); P.add(windMat(['cloth_red', 'cloth_indigo', 'cloth_white', 'cloth_red'][i]), W(g, 0)); }
      break;
    }
    case 'pawn': {            // the great round board with 当
      const d = lathe([[0.001, -0.02], [0.55, -0.02], [0.55, 0.02], [0.001, 0.02]], 18); d.rotateX(Math.PI / 2);
      P.add('lacquer_black', d.translate(0, -0.6, 0)); P.add('paint_ochre', box(-0.2, -0.78, 0.025, 0.2, -0.42, 0.05));
      break;
    }
    case 'lantern': {
      for (let i = 0; i < 3; i++) P.add('lamp_paper', lathe([[0.001, -0.5 - i * 0.55], [0.2, -0.62 - i * 0.55], [0.22, -0.8 - i * 0.55], [0.2, -0.98 - i * 0.55], [0.001, -1.05 - i * 0.55]], 10));
      break;
    }
    case 'shoes': {           // a black cloth shoe the size of a loaf
      P.add('lacquer_black', box(-0.12, -0.35, -0.3, 0.12, -0.12, 0.28)); P.add('cloth_white', box(-0.13, -0.38, -0.31, 0.13, -0.35, 0.29));
      break;
    }
    default: {                // grain: a hung measure (dou) and a banner
      P.add('timber', box(-0.2, -0.4, -0.2, 0.2, -0.05, 0.2));
      const g = box(-0.22, -1.2, -0.01, 0.22, -0.45, 0.01); P.add(windMat('cloth_white'), W(g, -0.45));
    }
  }
}

/**
 * qing_shop: { side ('w' for a shop west of the avenue, facing east; 'e' the other), front (the front line's x), z0, z1,
 * depth, trade, seed, storeys }.
 */
export function qingShop(el, ctx) {
  const { bag, col } = ctx, r = rng(el.seed || 1), L = el.z1 - el.z0, dep = el.depth ?? 8.4, st = el.storeys || 1;
  const face = el.side === 'w' ? 'e' : 'w', cz = (el.z0 + el.z1) / 2, sgn = el.side === 'w' ? 1 : -1;
  const F = Frame(el.front - sgn * dep / 2, cz, face);        // d runs out toward the avenue; the front posts' line at d = dep/2
  const dF = dep / 2, dB = -dep / 2, y = 0.3, H = st === 2 ? 6.3 : 3.7, s0 = -L / 2, s1 = L / 2;
  const bays = Math.max(2, Math.round(L / 3.2)), bw = (L - 1.0) / bays;
  // the foot, the back and side walls (the party walls)
  F.B(bag, 'brick_grey', s0 - 0.1, dB - 0.1, s1 + 0.1, dF + 0.5, -0.05, y);
  F.B(bag, 'brick_grey', s0, dB, s1, dB + 0.5, y, y + H - 0.3);
  for (const [a, b] of [[s0, s0 + 0.5], [s1 - 0.5, s1]]) F.B(bag, 'brick_grey', a, dB + 0.5, b, dF, y, y + H);
  // the front: posts, a lintel, the counter in each bay, shutters at the bay's ends, the goods behind
  const ps = []; for (let i = 0; i <= bays; i++) ps.push(s0 + 0.5 + bw * i);
  const lintY = y + (st === 2 ? 3.2 : 3.0);
  for (const s of ps.slice(1, -1)) F.B(bag, 'lacquer_red', s - 0.15, dF - 0.3, s + 0.15, dF, y, lintY);
  F.B(bag, 'lacquer_red', s0 + 0.5, dF - 0.34, s1 - 0.5, dF, lintY, lintY + 0.36);
  F.B(bag, 'paint_caihua', s0 + 0.7, dF + 0.005, s1 - 0.7, dF + 0.02, lintY + 0.05, lintY + 0.3);
  const goods = new Parts();
  const enter = !!el.enter, doorBay = Math.floor(bays / 2);        // an interior shop (tea house, pharmacy): the middle bay is its open door
  for (let i = 0; i < bays; i++) {
    const a = ps[i] + 0.15, b = ps[i + 1] - 0.15;
    if (enter && i === doorBay) continue;
    F.B(bag, 'lacquer_red', a, dF - 0.55, b, dF - 0.1, y, y + 1.0);                  // the counter
    F.B(bag, 'timber', a - 0.04, dF - 0.62, b + 0.04, dF - 0.05, y + 1.0, y + 1.06);
    if (!enter) F.B(bag, 'timber', a, dB + 0.5, b, dB + 1.0, y, y + 2.6);                          // the shelves on the back wall
    if (i % 2 === 0 && !enter) { F.B(bag, 'wood_dark', a + 0.02, dF - 0.55, a + 0.32, dF - 0.4, y + 1.06, y + 3.0 - 0.8 - 0.0); }
  }
  // plank shutters stacked against the end posts
  for (const sg of [-1, 1]) F.B(bag, 'wood_dark', sg < 0 ? s0 + 0.5 : s1 - 0.5 - 0.16, dF - 0.2, sg < 0 ? s0 + 0.5 + 0.16 : s1 - 0.5, dF, y, lintY);
  // the upper storey of a two-storey shop: a lattice gallery on the front
  if (st === 2) {
    const gy = y + 3.4;
    F.B(bag, 'lacquer_red', s0 + 0.5, dF - 0.2, s1 - 0.5, dF + 0.5, gy - 0.06, gy);       // the gallery's floor
    F.B(bag, 'lacquer_red', s0 + 0.5, dF + 0.46, s1 - 0.5, dF + 0.5, gy, gy + 0.9);        // its rail
    for (let i = 0; i < bays; i++) F.B(bag, 'lattice_red', ps[i] + 0.12, dF - 0.1, ps[i + 1] - 0.12, dF - 0.04, gy, gy + 2.5);
    for (const s of ps) F.B(bag, 'lacquer_red', s - 0.12, dF + 0.34, s + 0.12, dF + 0.5, gy, gy + 2.7);
  }
  // the roof over the shop (ridge along the street), then the board facade over its front eave
  const roofY = y + H - 0.4;
  gableRoof(bag, F, { s0, s1, dB: dB - 0.4, dF: dF + 0.9, dm: 0.1, ey: roofY, rise: (dep + 1.3) * 0.5 * 0.45, wd0: dB, wd1: dF, wy: y + H, lod: 0, orn: false });
  // the board facade (menlian): a painted frame of two posts and a wide crossbar standing before the eave, with a tile cap
  const fy = roofY + 0.5, fh = 1.35;
  F.B(bag, 'lacquer_red', s0 + 0.35, dF + 0.55, s1 - 0.35, dF + 0.7, fy, fy + fh);
  F.B(bag, 'paint_caihua', s0 + 0.5, dF + 0.7, s1 - 0.5, dF + 0.72, fy + 0.1, fy + fh - 0.1);
  const cap = F.rect(s0 + 0.2, dF + 0.45, s1 - 0.2, dF + 0.8); bag.add('tile_grey', box(cap[0], fy + fh, cap[1], cap[2], fy + fh + 0.2, cap[3]));
  // the name board on the facade (gilt characters on black) and the standing signboards
  const nameP = new Parts(); plaqueBuild(nameP, { w: Math.min(L - 1.6, 4.2), h: 0.95, n: 3 + Math.floor(r() * 2), seed: el.seed % 997, ink: 'gilt_bronze' });
  const nf = F.P(0, dF + 0.74, fy + 0.2);
  nameP.emit(bag, nf[0], nf[1], nf[2], Math.atan2(F.n[0], F.n[1]));
  const tall = new Parts(); plaqueBuild(tall, { w: 0.55, h: 2.6, n: 3, vertical: true, seed: (el.seed >> 3) % 991, ink: 'gilt_bronze', field: 'lacquer_red' });
  for (const sg of [-1, 1]) {
    if (sg > 0 && r() < 0.4) continue;
    const s = sg * (L / 2 - 0.55), p = F.P(s, dF + 1.35, 0);
    bag.add('granite_grey', box(p[0] - 0.3, 0, p[2] - 0.3, p[0] + 0.3, 0.45, p[2] + 0.3));
    tall.emit(bag, p[0], 0.45, p[2], Math.atan2(F.n[0], F.n[1]));
    col.circle(p[0], p[2], 0.32, 0, 3);
  }
  // the trade's hanging sign on a bracket at one post, and the red lanterns under the eave
  const sg = new Parts(); sign(sg, el.trade, r);
  const sp = F.P(s0 + 0.9 + r() * (L - 1.8), dF + 0.35, lintY - 0.15);
  bag.add('timber', rod(F.P(s0 + 0.9, dF - 0.05, lintY - 0.1), F.P(s0 + 0.9, dF + 1.1, lintY - 0.1), 0.04, 5));
  const bp = F.P(s0 + 0.9, dF + 1.0, lintY - 0.1);
  sg.emit(bag, bp[0], bp[1], bp[2], Math.atan2(F.n[0], F.n[1]));
  void sp;
  for (let i = 1; i < bays; i += 1) { const p = F.P(s0 + 0.5 + bw * i, dF + 0.2, lintY - 0.2); bag.add('lamp_paper', lathe([[0.001, -0.5], [0.18, -0.58], [0.2, -0.74], [0.18, -0.88], [0.001, -0.94]], 8).translate(p[0], p[1] + 0.52 + 0.0, p[2])); }
  // a mat awning (pengzi) sloping from the front's eave, on two poles, over the goods on the apron
  if (r() < 0.55) {
    const A = [F.P(s0 + 0.7, dF + 0.1, lintY + 0.3), F.P(s1 - 0.7, dF + 0.1, lintY + 0.3), F.P(s1 - 0.7, dF + 2.4, lintY - 0.35), F.P(s0 + 0.7, dF + 2.4, lintY - 0.35)];
    const tri = [];
    for (const [a, b, c] of [[0, 1, 2], [0, 2, 3]]) tri.push(...A[a], ...A[b], ...A[c]);
    for (const [a, b, c] of [[0, 2, 1], [0, 3, 2]]) tri.push(...A[a], ...A[b], ...A[c]);
    bag.add('thatch', fromTriangles(tri));                                                   // the reed mat
    for (const sg of [-1, 1]) { const p = F.P(sg < 0 ? s0 + 0.7 : s1 - 0.7, dF + 2.4, 0); bag.add('timber', rod([p[0], 0, p[2]], [p[0], lintY - 0.35, p[2]], 0.05, 5)); col.circle(p[0], p[2], 0.1, 0, 2.5); }
  }
  // the goods on the apron (a trestle with baskets, a stack of sacks)
  void goods;
  if (!enter) { col.rect(F.rect(s0 - 0.1, dB - 0.1, s1 + 0.1, dF - 0.62), 0, y + H); return; }       // the shop's body and the counter: the visitor stays at the front
  // an interior shop: walls, counters and posts block; the floor is walkable; two stone steps and a ramp at the door bay
  const T = y + H;
  col.rect(F.rect(s0 - 0.1, dB - 0.1, s1 + 0.1, dB + 0.5), 0, T);
  col.rect(F.rect(s0 - 0.1, dB, s0 + 0.5, dF), 0, T); col.rect(F.rect(s1 - 0.5, dB, s1 + 0.1, dF), 0, T);
  for (let i = 0; i < bays; i++) if (i !== doorBay) col.rect(F.rect(ps[i] + 0.15, dF - 0.62, ps[i + 1] - 0.15, dF - 0.05), 0, T);
  for (const q of ps.slice(1, -1)) col.rect(F.rect(q - 0.15, dF - 0.3, q + 0.15, dF), 0, T);
  col.floor(F.rect(s0 + 0.5, dB + 0.5, s1 - 0.5, dF - 0.05), y);
  const da = ps[doorBay] + 0.15, db = ps[doorBay + 1] - 0.15;
  F.B(bag, 'granite_grey', da, dF + 0.5, db, dF + 0.9, 0, 0.17); F.B(bag, 'granite_grey', da, dF + 0.9, db, dF + 1.3, 0, 0.09);
  col.floor(F.rect(da, dF - 0.05, db, dF + 0.5), y);
  col.ramp(F.rect(da, dF + 0.5, db, dF + 1.3), 0.04, y, el.side === 'w' ? 'w' : 'e');
}

/** The yard behind a block of shops: a wall round, a lean-to store, a tree pit, a well sometimes. */
export function shopYard(el, ctx) {
  const { bag, col } = ctx, [x0, z0, x1, z1] = el.rect, r = rng(el.seed || 1);
  const wall = (a, b) => { const h = a[1] === b[1]; const th = 0.4, hh = 2.6; const R = h ? [Math.min(a[0], b[0]), a[1] - th / 2, Math.max(a[0], b[0]), a[1] + th / 2] : [a[0] - th / 2, Math.min(a[1], b[1]), a[0] + th / 2, Math.max(a[1], b[1])];
    bag.add('brick_grey', box(R[0], 0, R[1], R[2], hh - 0.15, R[3])); bag.add('tile_grey', box(R[0] - (h ? 0 : 0.07), hh - 0.15, R[1] - (h ? 0.07 : 0), R[2] + (h ? 0 : 0.07), hh, R[3] + (h ? 0.07 : 0)));
    col.segment(h ? [R[0], a[1]] : [a[0], R[1]], h ? [R[2], a[1]] : [a[0], R[3]], th, 0, hh); };
  const far = el.side === 'w' ? x0 : x1;
  wall([far, z0], [far, z1]);
  wall([x0, z0], [x1, z0]); wall([x0, z1], [x1, z1]);
  bag.add('brick_paving', box(x0 + 0.1, -0.2, z0 + 0.2, x1 - 0.1, 0.03, z1 - 0.2));
  col.floor([x0 + 0.1, z0 + 0.2, x1 - 0.1, z1 - 0.2], 0.03);
  // the lean-to store against the far wall: a shed of timber posts under a single slope of grey tile
  const sx0 = el.side === 'w' ? x0 + 0.3 : x1 - 3.3, sx1 = sx0 + 3.0, sz0 = z0 + 2.0, sz1 = Math.min(z1 - 2.0, sz0 + 6 + r() * 4);
  bag.add('timber', box(sx0, 0.0, sz0, sx1, 0.12, sz1));
  const hi = 2.8, lo = 2.2, west = el.side === 'w';
  const t = [[west ? sx0 : sx1, hi, sz0], [west ? sx0 : sx1, hi, sz1], [west ? sx1 : sx0, lo, sz1], [west ? sx1 : sx0, lo, sz0]];
  const tri = []; for (const [a, b, c] of [[0, 3, 2], [0, 2, 1]]) tri.push(...t[a], ...t[b], ...t[c]);
  void tri;
  bag.add('tile_grey', box(sx0 - 0.1, hi - 0.1, sz0 - 0.1, sx1 + 0.1, hi + 0.05, sz1 + 0.1));
  for (const [px, pz] of [[sx0 + (west ? 2.9 : 0.1), sz0 + 0.1], [sx0 + (west ? 2.9 : 0.1), sz1 - 0.1]]) bag.add('timber', box(px - 0.1, 0, pz - 0.1, px + 0.1, hi - 0.1, pz + 0.1));
  bag.add('wood_dark', box(sx0 + 0.3, 0.12, sz0 + 0.3, sx1 - 0.3, 1.2, sz0 + 1.6));            // a heap of crates under it
  col.rect([sx0, sz0, sx1, sz1], 0, hi);
}

/**
 * A public well of the lanes (§17): a round stone head (jingquan) of granite with its wide rim worn by the ropes, the
 * pair of posts and crossbar of the windlass with its bucket, a stone slab to stand on, a wooden trough beside it.
 */
export function qingWell(el, { bag, col }) {
  const [x, z] = el.at, P = new Parts();
  P.add('granite_grey', lathe([[0.001, 0], [0.62, 0], [0.62, 0.1], [0.5, 0.1], [0.5, 0.62], [0.58, 0.64], [0.58, 0.72], [0.34, 0.72], [0.34, 0.64], [0.3, 0.62], [0.3, 0.1], [0.001, 0.1]], 16));
  P.add('water', lathe([[0.001, 0.05], [0.3, 0.05]], 12));
  for (const sx of [-1, 1]) P.add('wood_dark', box(sx * 0.5 - 0.05, 0.62, -0.05, sx * 0.5 + 0.05, 1.9, 0.05));
  P.add('wood_dark', box(-0.62, 1.82, -0.06, 0.62, 1.94, 0.06));
  const w = lathe([[0.1, -0.35], [0.1, 0.35]], 8); w.rotateZ(Math.PI / 2); P.add('timber', w.translate(0, 1.55, 0));
  const bucket = lathe([[0.001, 0], [0.12, 0], [0.14, 0.26], [0.12, 0.26], [0.1, 0.01]], 8); P.add('wood_dark', bucket.translate(0.22, 0.72, 0.0));
  P.emit(bag, x, 0.03, z);
  bag.add('granite_grey', box(x - 1.0, 0, z - 1.0, x + 1.0, 0.05, z + 1.0));                // the stone apron round it
  bag.add('wood_dark', box(x + 0.9, 0.03, z - 0.3, x + 1.9, 0.38, z + 0.3));                // the trough
  col.circle(x, z, 0.65, 0, 1.0);
  col.rect([x + 0.9, z - 0.3, x + 1.9, z + 0.3], 0, 0.4);
  void torus;
}
