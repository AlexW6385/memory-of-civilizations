// The enterable houses of Djenné (docs/settlements/djenne.md §15): the row of shops on the market's north edge, each an
// open front under a mat awning with its counter and goods and a furnished room behind; and a court house at the
// market's north-east corner — the vestibule (skifa) with its benches and Qur'anic boards, the court with its hearth,
// granary, mortar and water jars, rooms round it, the stair to the roof terrace and the upper room.
// Everything fronts south, onto the market (z grows southward); walls are boxes with true openings.

import { box, lathe, fromTriangles } from '../../core/geom.js';
import { beamTris } from '../ming/index.js';

const B = 'banco_rough', BS = 'banco_smooth';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const L = (prof, n = 10, x = 0, y = 0, z = 0) => lathe(prof, n, null, x, y, z);

/** The kit of one build: boxes (with colliders), lathes and beams in world coordinates. */
function kit({ bag, col }) {
  const bx = (m, x0, y0, z0, x1, y1, z1, solid = false) => { bag.add(m, box(x0, y0, z0, x1, y1, z1)); if (solid) col.rect([x0, z0, x1, z1], y0, y1); };
  /** A wall along x (z between z0 and z1) or along z, from a to b, y0..y1, pierced by gaps [{ a, b, top }]: the lintel above each. */
  const wall = (m, r, y0, y1, gaps = []) => {
    const [x0, z0, x1, z1] = r, ax = x1 - x0 >= z1 - z0, A0 = ax ? x0 : z0, A1 = ax ? x1 : z1;
    const gs = gaps.slice().sort((p, q) => p.a - q.a);
    const put = (u0, u1, v0, v1) => { if (u1 - u0 < 0.01 || v1 - v0 < 0.01) return; const b = ax ? [u0, z0, u1, z1] : [x0, u0, x1, u1]; bag.add(m, box(b[0], v0, b[1], b[2], v1, b[3])); col.rect(b, v0, v1); };
    let u = A0;
    for (const g of gs) {
      put(u, g.a, y0, y1); put(g.a, g.b, g.top, y1); if (g.bottom) put(g.a, g.b, y0, g.bottom);
      // the palm-wood lintel in the opening's soffit, standing out a little either side
      const lb = ax ? [g.a - 0.2, z0 - 0.02, g.b + 0.2, z1 + 0.02] : [x0 - 0.02, g.a - 0.2, x1 + 0.02, g.b + 0.2];
      bag.add('timber', box(lb[0], g.top - 0.14, lb[1], lb[2], g.top, lb[3]));
      u = g.b;
    }
    put(u, A1, y0, y1);
  };
  /** A flat roof slab over r: beams below (y0..y0+0.12), banco over it to yTop; walkable on top. */
  const roof = (r, yTop, beamsAlongX = false) => {
    const y0 = yTop - 0.35;
    bag.add('timber', box(r[0], y0, r[1], r[2], y0 + 0.1, r[3]));
    bag.add(BS, box(r[0], y0 + 0.1, r[1], r[2], yTop, r[3]));
    col.floor(r, yTop);
    const tt = [], len = beamsAlongX ? r[2] - r[0] : r[3] - r[1], span = beamsAlongX ? r[3] - r[1] : r[2] - r[0], n = Math.max(2, Math.floor(span / 0.55));
    for (let k = 0; k < n; k++) { const u = (k + 0.5) * span / n; if (beamsAlongX) beamTris(tt, [r[0], y0 - 0.1, r[1] + u], [r[2], y0 - 0.1, r[1] + u], 0.06, 0.1); else beamTris(tt, [r[0] + u, y0 - 0.1, r[1]], [r[0] + u, y0 - 0.1, r[3]], 0.06, 0.1); }
    void len;
    if (tt.length) bag.add('timber', fromTriangles(tt));
  };
  const parapet = (a, b, y, h = 0.7, hw = 0.15) => { const t = []; beamTris(t, [a[0], y, a[1]], [b[0], y, b[1]], hw, h); bag.add(B, fromTriangles(t)); };
  const lathe_ = (m, prof, n, x, y, z) => bag.add(m, L(prof, n, x, y, z));
  /** A water jar / storage jar of the profile at (x, y, z). */
  const jar = (m, x, y, z, s = 1) => lathe_(m, [[0.001, 0], [0.14 * s, 0.03 * s], [0.24 * s, 0.22 * s], [0.2 * s, 0.4 * s], [0.12 * s, 0.5 * s], [0.14 * s, 0.56 * s], [0.001, 0.54 * s]], 10, x, y, z);
  const bowl = (m, x, y, z, r = 0.22) => lathe_(m, [[0.001, 0], [r * 0.7, 0.03], [r, 0.12], [r * 0.92, 0.13], [0.001, 0.05]], 10, x, y, z);
  const heap = (m, x, y, z, r = 0.2, h = 0.14) => lathe_(m, [[r, 0], [r * 0.6, h * 0.6], [0.001, h]], 9, x, y, z);
  const mat = (x0, z0, x1, z1, y = 0, m = 'reed_mat') => bx(m, x0, y, z0, x1, y + 0.02, z1);
  const stool = (x, z, y = 0) => { bag.add('timber', L([[0.15, 0], [0.1, 0.12], [0.08, 0.26], [0.15, 0.36], [0.16, 0.39], [0.001, 0.38]], 8, x, y, z)); };
  return { bx, wall, roof, parapet, lathe_, jar, bowl, heap, mat, stool };
}

// ── the shops ────────────────────────────────────────────────────────────────
const TRADES = ['cloth', 'pots', 'salt', 'grain', 'kola', 'mats', 'leather', 'smith'];
/** What a shop sells on its counter and shelves, by trade (docs §15). */
function goods(k, trade, c, zc, rand) {
  const y = 0.9;                                                                    // the counter's top
  const xs = [c - 1.2, c - 0.8, c - 0.4, c + 0.0];
  if (trade === 'cloth') {
    // strips of narrow-loomed cotton folded in stacks, indigo, white, ochre; bolts on a pole under the awning
    xs.forEach((x, i) => { for (let j = 0; j < 3 + (i % 2); j++) k.bx(['cloth_indigo', 'cloth_white', 'cloth_ochre', 'cloth_indigo'][(i + j) % 4], x - 0.16, y + j * 0.06, zc - 0.28, x + 0.16, y + j * 0.06 + 0.055, zc + 0.28); });
    for (let i = 0; i < 5; i++) k.bx(['cloth_indigo', 'cloth_white', 'cloth_red', 'cloth_ochre', 'cloth_indigo'][i], c - 1.3 + i * 0.55, 1.5, zc - 0.55, c - 1.3 + i * 0.55 + 0.4, 2.12 - (i % 2) * 0.15, zc - 0.5);
    k.bx('timber', c - 1.45, 2.12, zc - 0.6, c + 1.45, 2.16, zc - 0.5);
  } else if (trade === 'pots') {
    xs.forEach((x, i) => { k.jar(i % 2 ? 'terracotta' : 'pottery_dark', x, y, zc - 0.1, 0.85); k.bowl('terracotta', x + 0.17, y, zc + 0.22, 0.2); });
    for (let i = 0; i < 4; i++) k.jar(i % 2 ? 'pottery_dark' : 'terracotta', c - 1.25 + i * 0.4, 0, zc - 1.5, 1.2);
  } else if (trade === 'salt') {
    // bars of rock salt about a metre long, lashed in pairs, stacked; broken pieces
    for (let j = 0; j < 3; j++) k.bx('lime_plaster', c - 1.3, y + j * 0.075, zc - 0.2, c - 0.3, y + j * 0.075 + 0.07, zc + 0.2);
    k.bx('hide_brown', c - 1.0, y, zc - 0.21, c - 0.97, y + 0.24, zc + 0.21); k.bx('hide_brown', c - 0.6, y, zc - 0.21, c - 0.57, y + 0.24, zc + 0.21);
    for (let i = 0; i < 5; i++) k.bx('lime_plaster', c + 0.0 + i * 0.1 * 0 + (i % 3) * 0.14, y, zc - 0.1 + Math.floor(i / 3) * 0.16, c + 0.1 + (i % 3) * 0.14, y + 0.06 + rand() * 0.04, zc + 0.04 + Math.floor(i / 3) * 0.16);
  } else if (trade === 'grain') {
    xs.forEach((x, i) => { k.bowl('hide_tan', x, y, zc, 0.22); k.heap(i % 2 ? 'cloth_ochre' : 'sacking', x, y + 0.1, zc, 0.19, 0.09); });
    for (let i = 0; i < 4; i++) k.lathe_('sacking', [[0.2, 0], [0.26, 0.25], [0.21, 0.5], [0.06, 0.58], [0.001, 0.58]], 8, c - 1.3 + i * 0.45, 0, zc - 1.5);
  } else if (trade === 'kola') {
    xs.forEach((x, i) => { k.lathe_('wicker', [[0.001, 0], [0.17, 0.02], [0.21, 0.15], [0.2, 0.16], [0.001, 0.05]], 10, x, y, zc); for (let j = 0; j < 7; j++) { const a = j * 0.9 + i; k.lathe_(j % 3 ? 'terracotta' : 'hide_white', [[0.001, 0], [0.035, 0.02], [0.03, 0.05], [0.001, 0.06]], 6, x + Math.cos(a) * 0.09, y + 0.12, zc + Math.sin(a) * 0.09); } });
  } else if (trade === 'mats') {
    for (let i = 0; i < 4; i++) k.lathe_('reed_mat', [[0.09, 0], [0.09, 1.1], [0.001, 1.1]], 10, c - 1.2 + i * 0.35, 0, zc - 1.5);
    xs.forEach((x, i) => k.lathe_('wicker', [[0.001, 0], [0.2, 0.02], [0.25, 0.16], [0.23, 0.17], [0.001, 0.05]], 10, x, y, zc + (i % 2) * 0.1));
  } else if (trade === 'leather') {
    xs.forEach((x, i) => { for (let j = 0; j < 3; j++) k.bx(['hide_tan', 'hide_brown', 'hide_tan'][j], x - 0.17, y + j * 0.04, zc - 0.22, x + 0.17, y + j * 0.04 + 0.035, zc + 0.22); });
    for (let i = 0; i < 4; i++) k.bx(i % 2 ? 'hide_brown' : 'hide_tan', c - 1.3 + i * 0.6, 1.4, zc - 0.55, c - 1.3 + i * 0.6 + 0.3, 2.1, zc - 0.52);
    k.bx('timber', c - 1.45, 2.1, zc - 0.6, c + 1.45, 2.15, zc - 0.5);
  } else {
    // the smith: a small forge of clay with a skin bellows, an anvil stone, hoes, knives and hoe blades on the wall
    k.lathe_('banco_smooth', [[0.5, 0], [0.45, 0.45], [0.35, 0.55], [0.001, 0.55]], 10, c - 0.9, 0, zc - 1.5);
    k.bx('hide_brown', c - 0.55, 0.3, zc - 1.6, c - 0.1, 0.5, zc - 1.4); k.bx('iron', c + 0.0, 0.0, zc - 1.65, c + 0.3, 0.35, zc - 1.35);
    xs.forEach((x) => { k.bx('iron', x - 0.16, y, zc - 0.05, x + 0.16, y + 0.025, zc + 0.05); k.bx('timber', x - 0.01, y, zc - 0.3, x + 0.01, y + 0.04, zc + 0.3); });
    for (let i = 0; i < 6; i++) k.bx('iron', c - 1.3 + i * 0.4, 1.3, zc - 0.55, c - 1.3 + i * 0.4 + 0.18, 1.62, zc - 0.52);
  }
}
/**
 * sahel_shops: a row of n shops { rect: [x0, z0, x1, z1], n, seed } fronting south: each with an opening 3 m wide
 * under a mat awning on two posts, a banco counter across most of it (an entry of a metre by its side), the trade's
 * goods on it and behind; inside, a shelf on the back wall with jars, a stool and a mat, goods stacked; the roof a
 * terrace behind a parapet; between the shops pilasters rise above it as pinnacles; toron in a row over the openings.
 */
export function shopRow(el, ctx) {
  const { bag, col } = ctx, k = kit(ctx), rand = rng(el.seed || 5);
  const [x0, z0, x1, z1] = el.rect, n = el.n ?? 8, W = (x1 - x0) / n, H = 3.2, zF = z1 - 0.5, zB = z0 + 0.5;
  // the row's back wall and end walls, the party walls between the shops
  k.wall(B, [x0, z0, x1, zB], 0, H); k.wall(B, [x0, z0, x0 + 0.5, z1], 0, H); k.wall(B, [x1 - 0.5, z0, x1, z1], 0, H);
  for (let i = 1; i < n; i++) k.wall(B, [x0 + i * W - 0.2, zB, x0 + i * W + 0.2, zF], 0, H);
  for (let i = 0; i < n; i++) {
    const a = x0 + i * W, c = a + W / 2, trade = TRADES[(i + (el.seed || 0)) % TRADES.length], zc = z1 - 0.5;
    // the front: wall pierced by the opening, a pointed-free timber lintel (k.wall adds it)
    k.wall(B, [a, zF, a + W, z1], 0, H, [{ a: c - 1.5, b: c + 1.5, top: 2.3 }]);
    // the counter across the opening, an entry on its east side
    k.bx(BS, c - 1.5, 0, z1 - 0.9, c + 0.4, 0.9, z1 - 0.1, true); k.bx('timber', c - 1.55, 0.9, z1 - 0.95, c + 0.45, 0.96, z1 - 0.05);
    // the awning: a mat on a pole frame sloping down and out, held by two posts
    const aw = [], zo = z1 + 1.5;
    aw.push(c - 1.7, 2.7, z1, c + 1.7, 2.7, z1, c + 1.7, 2.2, zo, c - 1.7, 2.7, z1, c + 1.7, 2.2, zo, c - 1.7, 2.2, zo);
    aw.push(c - 1.7, 2.7, z1, c + 1.7, 2.2, zo, c + 1.7, 2.7, z1, c - 1.7, 2.7, z1, c - 1.7, 2.2, zo, c + 1.7, 2.2, zo);
    bag.add('reed_mat', fromTriangles(aw));
    const pt = [];
    for (const px of [c - 1.65, c + 1.65]) { beamTris(pt, [px, 0, zo - 0.1], [px, 2.25, zo - 0.1], 0.05, 0.1); col.rect([px - 0.06, zo - 0.16, px + 0.06, zo - 0.04], 0, 2.2); }
    beamTris(pt, [c - 1.7, 2.2, zo - 0.1], [c + 1.7, 2.2, zo - 0.1], 0.04, 0.1);
    bag.add('timber', fromTriangles(pt));
    // inside: the shelf on the back wall with jars and bundles, a stool, a mat, the goods
    k.bx('timber', a + 0.6, 1.5, zB, a + W - 0.6, 1.56, zB + 0.35); k.bx('timber', a + 0.6, 0.9, zB, a + W - 0.6, 0.96, zB + 0.35);
    for (let j = 0; j < 4; j++) { k.jar(j % 2 ? 'terracotta' : 'pottery_dark', a + 0.9 + j * 0.9, 1.56, zB + 0.2, 0.8); k.heap(['cloth_ochre', 'sacking', 'cloth_indigo', 'hide_tan'][j], a + 0.9 + j * 0.9, 0.96, zB + 0.2, 0.18, 0.2); }
    k.mat(c - 1.0, zB + 1.0, c + 0.6, zB + 2.6); k.stool(c - 1.8, zB + 2.2);
    goods(k, trade, c, zc, rand);
    // the roof of the shop and the parapet; a pilaster at the party wall rising above it as a pinnacle
    k.roof([a, z0, a + W, z1], H);
    for (const [pa, pb] of [[[a, z1 - 0.2], [a + W, z1 - 0.2]], [[a, z0 + 0.2], [a + W, z0 + 0.2]]]) k.parapet(pa, pb, H, 0.6);
    // toron over the opening
    const tt = [];
    for (let j = 0; j < 4; j++) { const tx = a + 0.5 + j * (W - 1) / 3; beamTris(tt, [tx, 2.75, z1], [tx, 2.78, z1 + 0.6], 0.05, 0.09); }
    bag.add('timber', fromTriangles(tt));
  }
  for (let i = 0; i <= n; i++) {
    const px = x0 + i * W, w = 0.34;
    bag.add(B, lathe([[w + 0.12, 0], [w * 0.7, 3.6], [0.06, 4.9]], 8, null, px, 0, z1 + 0.05));
    col.rect([px - w, z1 - 0.3, px + w, z1 + 0.3], 0, 3.2);
  }
  // the end walls' parapets
  for (const x of [x0 + 0.25, x1 - 0.25]) k.parapet([x, z0], [x, z1], H, 0.6);
}

// ── the court house ──────────────────────────────────────────────────────────
/**
 * The shell and furniture of an enterable court house (called after sahel_house has drawn the facade, hollow):
 * { rect, seed }, the front on the south. Blocks round a court of 13 × 7 m: the front block of two storeys (the vestibule
 * in its middle, a workshop to the west and a room for reading to the east, an upper room over all), a back block (the
 * store), a west block (the sleeping room) and an east block (the kitchen), their roofs a terrace on palm beams and
 * banco; a stair in the court rises along the east wall to the back roof, which leads to the east roof and a door
 * into the upper room.
 */
export function courtHouse(el, ctx) {
  const { bag, col } = ctx, k = kit(ctx), rand = rng(el.seed || 9);
  const [x0, z0, x1, z1] = el.rect, xm = (x0 + x1) / 2, dw = el.dw ?? 0.65;
  const zf = z1 - 0.5, zp = z1 - 5, zq = z0 + 4, Hf = 6.2, Hs = 3.2;      // front wall's inner face, the court's south and north faces, heights
  const xw = x0 + 3.5, xe = x1 - 3.5;                                       // the court's west and east faces
  const G = (a, b, top = 2.15) => ({ a, b, top });
  // the front wall (the door), the north wall of the front block (on the court) and the side and back walls
  k.wall(B, [x0, zf, x1, z1], 0, Hf, [G(xm - dw, xm + dw, 2.05)]);
  k.wall(B, [x0, zp - 0.5, x1, zp], 0, Hf, [G(xm - 1.0, xm + 1.0, 2.35), G(x0 + 5.6, x0 + 6.8), G(x1 - 6.8, x1 - 5.6), { a: x1 - 3.2, b: x1 - 2.1, top: 5.4, bottom: 3.2 }]);
  k.wall(B, [x0, z0, x0 + 0.5, zp - 0.5], 0, Hs + 0.7); k.wall(B, [x1 - 0.5, z0, x1, zp - 0.5], 0, Hs + 0.7);
  k.wall(B, [x0, zp - 0.5, x0 + 0.5, z1], 0, Hf); k.wall(B, [x1 - 0.5, zp - 0.5, x1, z1], 0, Hf);
  k.wall(B, [x0, z0, x1, z0 + 0.5], 0, Hs + 0.7);
  // the walls on the court: back block (a door), west block, east block (a door each)
  k.wall(B, [x0 + 0.5, zq - 0.5, x1 - 0.5, zq], 0, Hs, [G(xw + 4.5, xw + 5.7)]);
  k.wall(B, [xw - 0.5, zq, xw, zp - 0.5], 0, Hs, [G((zq + zp) / 2 - 0.6, (zq + zp) / 2 + 0.6)]);
  k.wall(B, [xe, zq, xe + 0.5, zp - 0.5], 0, Hs, [G((zq + zp) / 2 - 0.6, (zq + zp) / 2 + 0.6)]);
  // the vestibule's side walls (to the workshop and the reading room)
  k.wall(B, [xm - 3.25, zp, xm - 2.75, zf], 0, 2.75); k.wall(B, [xm + 2.75, zp, xm + 3.25, zf], 0, 2.75);
  // the front block's upper floor (3.1), its ceiling roof (6.2), the side blocks' and back block's roofs (3.2)
  k.roof([x0 + 0.5, zp, x1 - 0.5, zf], 3.1);
  k.roof([x0, zp - 0.5, x1, z1], Hf);
  k.roof([x0, z0, x1, zq], Hs); k.roof([x0, zq, xw, zp - 0.5], Hs); k.roof([xe, zq, x1, zp - 0.5], Hs);
  // (the roofs' upper walls between the floors: the vestibule's party walls stop under the upper floor; the upper room's own walls are the outer ones)
  // parapets round the roofs' edges, the court side lower; a gap where the stair comes up
  const pa = (a, b, y = Hs, h = 0.7) => k.parapet(a, b, y, h);
  pa([x0 + 0.25, z0 + 0.25], [x1 - 0.25, z0 + 0.25]);
  pa([x0 + 0.25, z0 + 0.25], [x0 + 0.25, zp - 0.5]); pa([x1 - 0.25, z0 + 0.25], [x1 - 0.25, zp - 0.5]);
  pa([x0 + 0.25, zq - 0.25], [x1 - 0.25, zq - 0.25], Hs, 0.5);
  pa([xw - 0.25, zq], [xw - 0.25, zp - 0.5], Hs, 0.5); pa([xe + 0.25, zq + 1.6], [xe + 0.25, zp - 0.5], Hs, 0.5);
  // the front roof's parapet round its edge
  pa([x0 + 0.25, zp - 0.5], [x0 + 0.25, z1 - 0.25], Hf, 0.75); pa([x1 - 0.25, zp - 0.5], [x1 - 0.25, z1 - 0.25], Hf, 0.75);
  pa([x0 + 0.25, zp - 0.25], [x1 - 0.25, zp - 0.25], Hf, 0.75); pa([x0 + 0.25, z1 - 0.25], [x1 - 0.25, z1 - 0.25], Hf, 0.75);
  // the stair in the court along the back wall, rising east to the east block's roof (3.2) at the court's east face
  { const r = [xe - 7, zq, xe, zq + 1.3], n = 17, h = Hs / n, d = 7 / n;
    for (let i = 0; i < n; i++) bag.add(BS, box(r[0] + i * d, 0, r[1], r[0] + (i + 1) * d, (i + 1) * h, r[3]));
    col.ramp(r, 0, Hs, 'e'); }
  // ── the vestibule (skifa): benches on both sides, mats, boards of the Qur'anic school, a jar ──
  for (const s of [-1, 1]) {
    const bx0 = s < 0 ? xm - 2.75 : xm + 2.3, bx1 = s < 0 ? xm - 2.3 : xm + 2.75;
    k.bx(BS, bx0, 0, zp + 0.2, bx1, 0.45, zf - 0.2, true); k.mat(bx0 + (s < 0 ? 0 : 0.05), zp + 0.4, bx1 - (s < 0 ? 0.05 : 0), zf - 0.4, 0.45, 'reed_mat');
  }
  for (let i = 0; i < 4; i++) { const bz = zp + 0.7 + i * 0.9; bag.add('wood_dark', box(xm - 2.25, 0.5, bz, xm - 2.2, 1.0, bz + 0.35)); bag.add('timber', box(xm - 2.215, 0.55, bz + 0.04, xm - 2.2, 0.95, bz + 0.31)); }
  k.jar('terracotta', xm + 1.7, 0, zp + 0.5, 1.4);
  // ── the workshop (west of the vestibule): a loom of strips, bundles, a stool ──
  { const wx = (x0 + 0.5 + xm - 3.25) / 2, wz = (zp + zf) / 2;
    for (const dx of [-0.9, 0.9]) k.bx('timber', wx + dx - 0.06, 0, wz - 0.1, wx + dx + 0.06, 1.9, wz + 0.1, true);
    k.bx('timber', wx - 1.0, 1.9, wz - 0.07, wx + 1.0, 1.98, wz + 0.07); k.bx('timber', wx - 0.9, 0.45, wz - 0.9, wx + 0.9, 0.5, wz - 0.84);
    for (let i = 0; i < 12; i++) k.bx(i % 3 ? 'cloth_indigo' : 'cloth_white', wx - 0.85 + i * 0.15, 0.55, wz - 0.03, wx - 0.85 + i * 0.15 + 0.09, 1.85, wz + 0.01);
    k.stool(wx, wz + 1.2); k.mat(wx - 1.2, wz + 0.5, wx + 1.2, wz + 1.8);
    for (let i = 0; i < 5; i++) k.heap(['cloth_white', 'cloth_ochre', 'cloth_indigo'][i % 3], x0 + 1.1 + i * 0.35, 0, zp + 0.5, 0.17, 0.3); }
  // ── the reading room (east): mats, low benches, boards ──
  { const rx = (x1 - 0.5 + xm + 3.25) / 2, rz = (zp + zf) / 2;
    k.mat(rx - 2.3, rz - 1.6, rx + 2.3, rz + 1.6);
    for (const dx of [-1.6, -0.4, 0.8, 1.9]) { k.bx('timber', rx + dx - 0.2, 0.25, rz + 0.8, rx + dx + 0.2, 0.3, rz + 1.3); for (const sx of [-0.15, 0.15]) k.bx('timber', rx + dx + sx - 0.02, 0, rz + 0.85, rx + dx + sx + 0.02, 0.25, rz + 0.9); }
    for (const dx of [-1.8, 0, 1.8]) bag.add('wood_dark', box(rx + dx - 0.25, 0.4, zp + 0.6, rx + dx + 0.25, 1.1, zp + 0.66));
    k.bx(BS, x1 - 1.6, 0, zp + 0.3, x1 - 0.5, 0.55, zf - 0.3, true); }
  // ── the court: hearth, granary, mortar, water jars, firewood, a goat's tether post ──
  { const hx = xw + 3.0, hz = zp - 1.8;
    for (let i = 0; i < 3; i++) { const a = i * 2.09; bag.add('mud_plaster', L([[0.14, 0], [0.1, 0.18], [0.001, 0.2]], 7, hx + Math.cos(a) * 0.2, 0, hz + Math.sin(a) * 0.2)); }
    k.lathe_('pottery_dark', [[0.001, 0], [0.12, 0.02], [0.21, 0.14], [0.2, 0.3], [0.14, 0.38], [0.16, 0.42], [0.001, 0.4]], 12, hx, 0.2, hz);
    k.bx('bark_pine', hx - 0.5, 0, hz + 0.3, hx - 0.1, 0.1, hz + 0.34); k.bx('bark_pine', hx - 0.5, 0.1, hz + 0.45, hx - 0.1, 0.2, hz + 0.49);
    // the granary (kunda): a banco jar on a stone footing with its thatch cone, a small door of stones
    const gx = xe - 2.6, gz = zp - 1.8;
    bag.add(BS, L([[0.8, 0], [1.0, 0.5], [1.05, 1.1], [0.8, 1.7], [0.5, 1.95], [0.001, 1.95]], 14, gx, 0, gz)); col.circle(gx, gz, 1.0, 0, 2);
    bag.add('thatch', L([[0.9, 0], [0.6, 0.3], [0.001, 0.75]], 12, gx, 1.9, gz));
    // the mortar and its two pestles (a hollowed log)
    const mx = xw + 1.6, mz = zq + 1.8;
    bag.add('timber', L([[0.22, 0], [0.28, 0.4], [0.3, 0.7], [0.001, 0.7]], 10, mx, 0, mz)); bag.add('wood_dark', L([[0.17, 0.68], [0.001, 0.66]], 10, mx, 0, mz));
    for (const s of [-1, 1]) { const t = []; beamTris(t, [mx + s * 0.5, 0, mz + 0.5], [mx + s * 0.46, 1.5, mz + 0.5], 0.04, 0.08); bag.add('timber', fromTriangles(t)); }
    // water jars on a stand (three), a wash basin; the stack of firewood; the goat's post
    for (let i = 0; i < 3; i++) { k.jar('terracotta', xw + 0.5 + i * 0.6, 0.35, zp - 0.5, 1.5); } k.bx(BS, xw + 0.15, 0, zp - 0.9, xw + 2.3, 0.35, zp - 0.1, true);
    for (let j = 0; j < 4; j++) for (let i = 0; i < 6 - j; i++) bag.add('bark_pine', L([[0.07, 0], [0.07, 1.4], [0.001, 1.4]], 6, 0, 0, 0).rotateZ(-Math.PI / 2).translate(xw + 0.4 + i * 0.01, 0.1 + j * 0.13, zq + 2.6 + i * 0.15 + j * 0.07));
    bag.add('timber', L([[0.06, 0], [0.05, 1.1]], 6, xm - 1.5, 0, zq + 3.2)); }
  // ── the west block (the sleeping room): the bed of banco under a mat and blanket, a chest, niches with lamps and bowls ──
  { const bz = (zq + zp) / 2;
    k.bx(BS, x0 + 0.5, 0, bz - 1.2, x0 + 1.5, 0.5, bz + 1.2, true); k.mat(x0 + 0.5, bz - 1.2, x0 + 1.5, bz + 1.2, 0.5, 'reed_mat'); k.bx('cloth_indigo', x0 + 0.6, 0.52, bz - 0.6, x0 + 1.4, 0.58, bz + 1.1);
    k.bx('timber', xw - 1.2, 0, zq + 0.3, xw - 0.6, 0.55, zq + 1.5, true); k.bx('iron', xw - 1.21, 0.1, zq + 0.3, xw - 1.19, 0.45, zq + 1.5);
    k.jar('pottery_dark', xw - 0.9, 0, zp - 1.0, 1.1); k.jar('terracotta', xw - 0.6, 0, zp - 0.6, 0.9); }
  // ── the east block (the kitchen): a hearth of clay, jars in a row, calabashes, grinding stone ──
  { const kz = (zq + zp) / 2;
    k.bx(BS, xe + 0.6, 0, kz + 0.6, xe + 2.7, 0.7, kz + 1.5, true);
    for (let i = 0; i < 3; i++) { bag.add('mud_plaster', L([[0.14, 0], [0.1, 0.16], [0.001, 0.18]], 7, xe + 0.9 + i * 0.5, 0.7, kz + 1.05)); }
    k.lathe_('pottery_dark', [[0.001, 0], [0.12, 0.02], [0.21, 0.14], [0.2, 0.3], [0.14, 0.38], [0.16, 0.42], [0.001, 0.4]], 12, xe + 1.4, 0.82, kz + 1.05);
    for (let i = 0; i < 4; i++) k.jar(i % 2 ? 'terracotta' : 'pottery_dark', xe + 0.7 + i * 0.6, 0, zq + 0.45, 1.3);
    for (let i = 0; i < 3; i++) k.bowl('hide_tan', xe + 0.7 + i * 0.5, 0, kz - 0.4, 0.24);
    k.bx('plaster_grey', xe + 0.6, 0, kz - 0.9, xe + 1.3, 0.25, kz - 0.4, true); }
  // ── the back block (the store): big storage jars with lids, sacks, baskets, a mat ──
  { const sz = (z0 + zq) / 2 + 0.25;
    for (let i = 0; i < 6; i++) { const jx = x0 + 1.2 + i * 1.1; k.lathe_(BS, [[0.001, 0], [0.3, 0.04], [0.5, 0.35], [0.5, 0.65], [0.34, 0.95], [0.32, 1.05], [0.38, 1.1], [0.001, 1.08]], 12, jx, 0, sz - 0.6); col.circle(jx, sz - 0.6, 0.5, 0, 1.1); k.lathe_('terracotta', [[0.001, 0], [0.36, 0], [0.34, 0.06], [0.001, 0.1]], 10, jx, 1.08, sz - 0.6); }
    for (let i = 0; i < 5; i++) k.lathe_('sacking', [[0.2, 0], [0.26, 0.25], [0.21, 0.5], [0.06, 0.58], [0.001, 0.58]], 8, xm + 2.5 + i * 0.5, 0, sz + 0.7);
    for (let i = 0; i < 3; i++) k.lathe_('wicker', [[0.001, 0], [0.22, 0.02], [0.27, 0.2], [0.25, 0.21], [0.001, 0.05]], 10, x0 + 1.5 + i * 0.6, 0, sz + 0.9);
    k.mat(xm - 1.4, sz + 0.3, xm + 1.0, sz + 1.1); }
  // ── the upper room: two beds of mat, a chest, a row of calabashes on a shelf ──
  { const uz = (zp + zf) / 2;
    for (const dx of [2.0, 8.5]) { k.mat(x0 + dx, uz - 1.8, x0 + dx + 1.4, uz + 1.8, 3.1); k.bx('cloth_ochre', x0 + dx + 0.1, 3.12, uz - 1.4, x0 + dx + 1.3, 3.18, uz + 0.9); }
    k.bx('timber', x1 - 2.5, 3.1, uz - 0.6, x1 - 1.4, 3.65, uz + 0.6, true); k.bx('iron', x1 - 2.51, 3.2, uz - 0.6, x1 - 2.49, 3.55, uz + 0.6);
    k.bx('timber', xm - 2, 4.2, zp + 0.05, xm + 2, 4.26, zp + 0.4);
    for (let i = 0; i < 5; i++) k.bowl('hide_tan', xm - 1.6 + i * 0.8, 4.26, zp + 0.22, 0.2); }
}
