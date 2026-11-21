// A ferry wharf at Circular Quay as in 1973 (docs/settlements/sydney.md §1c): a hardwood deck on rows of timber piles
// with their headstocks and braces, fender piles and walings down both sides where the ferries berth, the waiting
// shed and ticket office at the shore end, a long awning on steel posts over the middle, benches, bollards and
// life buoys; at each berth a gangway on its gallows — two posts, a beam and the chains — lowered onto a ferry's
// deck where one lies alongside, raised where none does.

import { box, lathe, rod, fromTriangles } from '../../core/geom.js';
import { figure } from '../../objects/figures.js';
import { Quads, letters, textLen, fitCell } from '../artdeco/dress.js';

const both = (t) => { const o = [...t]; for (let i = 0; i < t.length; i += 9) o.push(...t.slice(i, i + 3), ...t.slice(i + 6, i + 9), ...t.slice(i + 3, i + 6)); return o; };
/** wharf: { rect (along z, the shore end at z1), y (deck), gangways: [{ side: -1 | 1 (west | east), z, down (the ferry's deck height, or none) }] } */
export function wharf(el, { bag, col, lights = [] }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 1.2, W = x1 - x0, cx = (x0 + x1) / 2;
  // the deck, its planks and kerbs
  bag.add('planks_grey', box(x0, y - 0.25, z0, x1, y, z1)); col.floor(el.rect, y);
  bag.add('timber', box(x0, y - 0.55, z0, x1, y - 0.25, z1));
  for (const x of [x0 + 0.1, x1 - 0.1]) bag.add('timber', box(x - 0.1, y, z0, x + 0.1, y + 0.2, z1));
  // the piles: three in each row, a headstock on them, cross braces between; fender piles and walings at the sides
  for (let z = z0 + 1; z < z1; z += 3.5) {
    for (const x of [x0 + 0.6, cx, x1 - 0.6]) bag.add('timber', lathe([[0.2, 0], [0.18, y - 0.55 + 6.5], [0.001, y - 0.55 + 6.5]], 6, null, x, -6.5, z));
    bag.add('timber', box(x0 + 0.2, y - 0.85, z - 0.2, x1 - 0.2, y - 0.55, z + 0.2));
    for (const s of [-1, 1]) bag.add('iron', rod([cx, -1.8, z + 0.25], [cx + s * (W / 2 - 0.6), y - 0.9, z + 0.25], 0.05, 4));
  }
  for (const [x, sg] of [[x0, -1], [x1, 1]]) {
    for (let z = z0 + 0.4; z < z1; z += 2.0) bag.add('timber', box(x + sg * 0.05 - 0.15, -4, z - 0.15, x + sg * 0.05 + 0.15, y + 0.45, z + 0.15));
    for (const yy of [y - 0.6, -0.9]) bag.add('timber', box(Math.min(x + sg * 0.2, x + sg * 0.45), yy - 0.15, z0, Math.max(x + sg * 0.2, x + sg * 0.45), yy + 0.15, z1));
    for (let z = z0 + 2; z < z1 - 12; z += 7) {
      const bx = x - sg * 0.5;
      bag.add('iron', lathe([[0.2, 0], [0.18, 0.4], [0.26, 0.48], [0.26, 0.56], [0.001, 0.58]], 10, null, bx, y, z));          // the bollards
    }
  }
  for (const z of [z0 + 6, z0 + 24]) bag.add('cloth_red', lathe([[0.25, -0.06], [0.31, 0], [0.25, 0.06], [0.19, 0]], 10, null, 0, 0, 0).rotateZ(Math.PI / 2).translate(x1 - 0.15, y + 1.1, z));
  // the waiting shed and ticket office at the shore end (§1c, §16): a hollow room with a doorway at each end (the open gates to the
  // wharf and the way out to the quay), the ticket office along its west wall and the newsagent's counter along its east wall, each with
  // its keeper, benches with a waiting passenger or two, a clock, tubes in the ceiling
  const s0 = z1 - 12, s1 = z1 - 1.5, sh = 3.6;
  waitingShed({ bag, col, lights }, { wx0: x0 + 0.8, wx1: x1 - 0.8, s0, s1, sh, y, cx, seed: Math.round(cx * 7) });
  // the awning over the middle of the wharf on two rows of steel posts, the benches under it
  const a0 = z0 + 10, a1 = s0 - 0.3, ah = y + 3.3;
  for (let z = a0 + 1; z < a1; z += 5) for (const x of [cx - 1.6, cx + 1.6]) { bag.add('steel_grey', box(x - 0.08, y, z - 0.08, x + 0.08, ah, z + 0.08)); col.rect([x - 0.08, z - 0.08, x + 0.08, z + 0.08], y, ah); }
  const R = [], ex = W / 2 - 0.9;
  // (two sheets 0.1 m apart, the corrugated roof and its soffit, so that the walker's raster reads a roof with an underside and a clear way beneath it)
  for (const s of [-1, 1]) for (const dy of [0, -0.1]) R.push(cx, ah + 0.35 + dy, a0, cx + s * ex, ah + dy, a0, cx + s * ex, ah + dy, a1, cx, ah + 0.35 + dy, a0, cx + s * ex, ah + dy, a1, cx, ah + 0.35 + dy, a1);
  bag.add('iron_galv', fromTriangles(both(R)));
  bag.add('steel_grey', box(cx - 0.1, ah + 0.1, a0, cx + 0.1, ah + 0.38, a1));
  // the benches: back to back along the wharf's middle, slatted seats and a shared slatted back on cast-iron end frames
  for (let z = a0 + 3; z < a1 - 2; z += 5) {
    const L = 2.0, b0 = z - L / 2, b1 = z + L / 2;
    for (const s of [-1, 1]) {
      for (let k = 0; k < 4; k++) { const u = cx + s * (0.08 + k * 0.115); bag.add('timber', box(Math.min(u, u + s * 0.09), y + 0.43, b0, Math.max(u, u + s * 0.09), y + 0.46, b1)); }   // seat slats
      for (const yy of [0.58, 0.7, 0.82]) bag.add('timber', box(Math.min(cx + s * 0.035, cx + s * 0.06), y + yy, b0, Math.max(cx + s * 0.035, cx + s * 0.06), y + yy + 0.08, b1));   // back slats
      for (const e of [b0 + 0.12, b1 - 0.12]) {
        bag.add('iron', rod([cx + s * 0.46, y, e], [cx + s * 0.44, y + 0.43, e], 0.025, 5));                       // the front leg
        bag.add('iron', box(cx + Math.min(0, s * 0.5), y + 0.4, e - 0.025, cx + Math.max(0, s * 0.5), y + 0.43, e + 0.025));   // the seat rail
        bag.add('iron', rod([cx + s * 0.44, y + 0.43, e], [cx + s * 0.4, y + 0.62, e], 0.02, 4));                  // the arm
      }
    }
    for (const e of [b0 + 0.12, b1 - 0.12]) bag.add('iron', box(cx - 0.035, y, e - 0.03, cx + 0.035, y + 0.92, e + 0.03));   // the central standard
  }
  // the gangways
  for (const g of el.gangways ?? []) {
    const sg = g.side, ex0 = sg > 0 ? x1 : x0, gz = g.z, gw = 1.7, Lg = 3.6;
    // the gallows: two posts, a beam, the chains, a counterweight
    for (const s of [-1, 1]) bag.add('steel_grey', box(ex0 - sg * 0.6 - 0.09, y, gz + s * (gw / 2 + 0.25) - 0.09, ex0 - sg * 0.6 + 0.09, y + 4.2, gz + s * (gw / 2 + 0.25) + 0.09));
    bag.add('steel_grey', box(ex0 - sg * 0.6 - 0.1, y + 4.1, gz - gw / 2 - 0.4, ex0 - sg * 0.6 + 0.1, y + 4.3, gz + gw / 2 + 0.4));
    bag.add('iron', box(ex0 - sg * 0.6 - 0.25, y + 1.6, gz - gw / 2 - 0.45, ex0 - sg * 0.6 + 0.25, y + 2.4, gz - gw / 2 - 0.3));
    const down = g.down != null, ang = down ? Math.atan2(y - g.down, Lg) : -1.05;
    const P = (d, w, h = 0) => [ex0 + sg * (Math.cos(ang) * d) , y + 0.05 - Math.sin(ang) * d + h, gz + w];
    const D = [];
    const q = (a, b, c, e) => D.push(...a, ...b, ...c, ...a, ...c, ...e);
    q(P(0, -gw / 2), P(Lg, -gw / 2), P(Lg, gw / 2), P(0, gw / 2));
    bag.add('planks_grey', fromTriangles(both(D)));
    for (let k = 1; k < 8; k++) bag.add('timber', rod(P(Lg * k / 8, -gw / 2, 0.03), P(Lg * k / 8, gw / 2, 0.03), 0.03, 4));    // the cleats
    for (const w of [-gw / 2, gw / 2]) {
      bag.add('steel_grey', rod(P(0, w, 1.0), P(Lg, w, 1.0), 0.03, 4)); bag.add('steel_grey', rod(P(0, w, 0.5), P(Lg, w, 0.5), 0.02, 4));
      for (let k = 0; k <= 3; k++) bag.add('steel_grey', rod(P(Lg * k / 3, w, 0), P(Lg * k / 3, w, 1.0), 0.025, 4));
      bag.add('iron', rod([ex0 - sg * 0.6, y + 4.1, gz + w * 1.1], P(Lg * 0.85, w, 1.0), 0.012, 3));                         // the chains
    }
    if (down) col.ramp(sg > 0 ? [ex0, gz - gw / 2, ex0 + Math.cos(ang) * Lg, gz + gw / 2] : [ex0 - Math.cos(ang) * Lg, gz - gw / 2, ex0, gz + gw / 2], g.down, y, sg > 0 ? 'w' : 'e');
  }
}

/** The wharf's waiting shed: walls with their windows and the two doorways, the ticket office, the newsagent's counter, the benches, the clock, the keepers. */
function waitingShed({ bag, col, lights }, { wx0, wx1, s0, s1, sh, y, cx, seed }) {
  const T = 0.25, DW = 1.2;                                                   // wall thickness; half the doorways' width (2.4 m clear)
  const blk = (mat, a, b, ya, yb, c, d, solid = false) => { if (b - a < 1e-4 || d - c < 1e-4 || yb - ya < 1e-4) return; bag.add(mat, box(a, ya, c, b, yb, d)); if (solid) col.rect([a, c, b, d], ya, yb); };
  const hs = (k) => { let h = Math.imul(seed + k * 7919, 2654435761) >>> 0; h = Math.imul(h ^ (h >>> 15), 2246822519) >>> 0; return (h >>> 0) / 4294967296; };
  // the end walls (north to the wharf, south to the quay), each with its doorway, the head over it
  for (const [c, d] of [[s0, s0 + T], [s1 - T, s1]]) {
    blk('plaster_white', wx0, cx - DW, y, y + sh, c, d, true); blk('plaster_white', cx + DW, wx1, y, y + sh, c, d, true);
    blk('plaster_white', cx - DW, cx + DW, y + 2.5, y + sh, c, d, true);
    for (const sg of [-1, 1]) blk('steel_grey', cx + sg * DW - 0.05 + sg * 0.05, cx + sg * DW + 0.05 + sg * 0.05, y, y + 2.5, c - 0.03, d + 0.03);   // the posts of the gates
  }
  // the side walls with their windows (1.6 m wide, 1.1 to 2.6 m up), the glass in the middle of the thickness
  const wz = []; for (let z = s0 + 1.5; z < s1 - 1; z += 2.4) wz.push(z);
  for (const [a, b] of [[wx0, wx0 + T], [wx1 - T, wx1]]) {
    blk('plaster_white', a, b, y, y + 1.1, s0 + T, s1 - T); blk('plaster_white', a, b, y + 2.6, y + sh, s0 + T, s1 - T);
    let z = s0 + T; for (const w of wz) { blk('plaster_white', a, b, y + 1.1, y + 2.6, z, w - 0.8); z = w + 0.8; } blk('plaster_white', a, b, y + 1.1, y + 2.6, z, s1 - T);
    for (const w of wz) { blk('glass_outer', (a + b) / 2 - 0.01, (a + b) / 2 + 0.01, y + 1.1, y + 2.6, w - 0.8, w + 0.8); blk('steel_grey', (a + b) / 2 - 0.03, (a + b) / 2 + 0.03, y + 1.1, y + 2.6, w - 0.03, w + 0.03); }
    col.rect([a, s0 + T, b, s1 - T], y, y + sh);
  }
  blk('steel_grey', wx0 - 0.3, wx1 + 0.3, y + sh, y + sh + 0.35, s0 - 0.3, s1 + 0.3);   // the roof (its underside is the ceiling)
  // the ceiling's tubes, and the lamps' light
  for (let z = s0 + 2; z < s1 - 1; z += 2.6) for (const x of [cx - 1.8, cx + 1.8]) blk('plaster_white', x - 0.55, x + 0.55, y + sh - 0.1, y + sh - 0.02, z - 0.06, z + 0.06);
  for (const z of [s0 + 3, s0 + 7.5]) lights.push({ at: [cx, y + sh - 0.4, z], color: '#f3ecd8', intensity: 2.2, distance: 8 });
  // the ticket office along the west wall and the newsagent's counter along the east: a counter, a screen, a keeper
  const cw = wx0 + T + 1.2, ce = wx1 - T - 1.55;
  // west: the office behind a glass screen with its two wickets; shelves of tickets, a till, a stool
  const oz0 = s0 + 1.8, oz1 = s0 + 7.4, ox = cw + 0.35;
  blk('timber', cw, ox, y, y + 1.05, oz0, oz1); blk('timber', cw - 0.05, ox + 0.2, y + 1.05, y + 1.1, oz0, oz1); col.rect([cw - 0.05, oz0, ox + 0.2, oz1], y, y + 2.4);
  for (const z of [oz0, oz1]) blk('timber', wx0 + T, ox, y, y + 2.4, z - 0.05, z + 0.05, true);
  blk('glass_outer', cw + 0.15, cw + 0.17, y + 1.5, y + 2.4, oz0, oz1); blk('timber', cw + 0.12, cw + 0.2, y + 2.4, y + 2.9, oz0, oz1);
  for (const z of [oz0, (oz0 + oz1) / 2, oz1 - 0.04]) blk('timber', cw + 0.12, cw + 0.2, y + 1.1, y + 2.4, z, z + 0.04);
  for (const yy of [1.0, 1.7]) blk('timber', wx0 + T, wx0 + T + 0.3, y + yy, y + yy + 0.04, oz0, oz1);                   // the shelves on the wall behind
  for (let z = oz0 + 0.2; z < oz1 - 0.3; z += 0.34) for (const [yy, m] of [[1.04, 'cloth_ochre'], [1.74, 'cloth_white'], [1.74 + 0.0, 'cloth_green']]) if (hs(z * 10 + yy * 3) < 0.8) blk(m, wx0 + T + 0.04, wx0 + T + 0.2, y + yy, y + yy + 0.22, z, z + 0.26);   // ticket boxes
  blk('iron', cw - 0.25, cw + 0.05, y + 1.1, y + 1.4, oz0 + 1.2, oz0 + 1.5); blk('iron', cw - 0.25, cw + 0.05, y + 1.1, y + 1.35, oz1 - 1.5, oz1 - 1.2);   // the date stamps
  { const zc = oz0 + 3.9; blk('timber', wx0 + T + 0.45, wx0 + T + 0.85, y + 0.62, y + 0.68, zc - 0.2, zc + 0.2); for (const dx of [0.5, 0.8]) for (const dz of [-0.15, 0.15]) bag.add('iron', rod([wx0 + T + dx, y, zc + dz], [wx0 + T + dx, y + 0.62, zc + dz], 0.015, 4)); }   // a stool
  const q = new Quads(), tl = (t, w) => fitCell(t, w, 0.1);
  { const t = 'TICKETS', cell = tl(t, 3.2), len = textLen(t, cell), zs = (oz0 + oz1) / 2 + len / 2; letters(q.t('cloth_white'), t, cell, (h, v) => [cw + 0.21, y + 2.46 + v, zs - h], 0, 0.0); }
  // east: the counter, a rack of magazines, a case of sweets, newspapers, the shelves of cigarettes behind, the keeper
  const nz0 = s0 + 2.2, nz1 = s0 + 7.0, ex = ce + 0.35;
  blk('timber', ce, ex, y, y + 1.05, nz0, nz1); blk('timber', ce - 0.2, ex + 0.05, y + 1.05, y + 1.1, nz0, nz1); col.rect([ce - 0.2, nz0, ex + 0.05, nz1], y, y + 1.9);
  for (const z of [nz0, nz1]) blk('timber', ex, wx1 - T, y, y + 2.4, z - 0.05, z + 0.05, true);
  blk('timber', ce - 0.02, ce + 0.02, y + 1.1, y + 1.8, nz0 + 0.1, nz1 - 0.1);                                                      // (the rack's back board, lined with covers)
  for (let z = nz0 + 0.2, k = 0; z < nz1 - 0.5; z += 0.27, k++) for (const [j, yy] of [[0, 1.12], [1, 1.45]]) blk(['cloth_red', 'cloth_ochre', 'cloth_indigo', 'cloth_green', 'cloth_white', 'cloth_maroon'][Math.floor(hs(k * 3 + j) * 6)], ce - 0.05, ce - 0.02, y + yy, y + yy + 0.3, z, z + 0.22);
  blk('glass_outer', ce - 0.2, ce + 0.15, y + 1.1, y + 1.4, nz0 + 0.3, nz0 + 1.3);
  for (let k = 0; k < 5; k++) blk(['cloth_red', 'cloth_green', 'cloth_ochre', 'cloth_white', 'cloth_indigo'][k], ce - 0.15, ce + 0.1, y + 1.1, y + 1.24, nz0 + 0.38 + k * 0.17, nz0 + 0.5 + k * 0.17);   // the jars
  blk('cloth_white', ce - 0.15, ce + 0.15, y + 1.1, y + 1.3, nz1 - 1.1, nz1 - 0.7);                                                // a stack of the evening's papers
  blk('iron', ce - 0.1, ce + 0.15, y + 1.1, y + 1.3, nz1 - 0.5, nz1 - 0.25);                                                        // the till
  for (const yy of [0.9, 1.4, 1.9]) blk('timber', wx1 - T - 0.35, wx1 - T, y + yy, y + yy + 0.04, nz0, nz1);
  for (let z = nz0 + 0.15, k = 0; z < nz1 - 0.3; z += 0.3, k++) for (const [j, yy] of [[0, 0.94], [1, 1.44], [2, 1.94]]) if (hs(k * 5 + j + 40) < 0.85) blk(['cloth_red', 'cloth_white', 'cloth_ochre', 'cloth_green'][Math.floor(hs(k + j * 9) * 4)], wx1 - T - 0.3, wx1 - T - 0.04, y + yy, y + yy + 0.2, z, z + 0.24);
  { const t = 'NEWS', cell = tl(t, 2.0), zs = (nz0 + nz1) / 2 - textLen(t, cell) / 2; blk('timber', ce - 0.02, ce + 0.06, y + 1.8, y + 2.3, nz0, nz1); letters(q.t('cloth_white'), t, cell, (h, v) => [ce - 0.03, y + 1.84 + v, zs + h], 0, 0.0); }
  q.flush(bag);
  // the benches against the side walls at the south end, a passenger or two on them
  const bench = (xw, sg, z0, z1) => {                                                                                              // sg: +1 the back to the west wall, facing east
    for (let k = 0; k < 4; k++) { const u = xw + sg * (0.06 + k * 0.115); blk('timber', Math.min(u, u + sg * 0.09), Math.max(u, u + sg * 0.09), y + 0.43, y + 0.46, z0, z1); }
    for (const yy of [0.58, 0.7, 0.82]) blk('timber', Math.min(xw + sg * 0.01, xw + sg * 0.05), Math.max(xw + sg * 0.01, xw + sg * 0.05), y + yy, y + yy + 0.08, z0, z1);
    for (const e of [z0 + 0.1, z1 - 0.1]) { blk('iron', Math.min(xw, xw + sg * 0.5), Math.max(xw, xw + sg * 0.5), y + 0.4, y + 0.43, e - 0.025, e + 0.025); bag.add('iron', rod([xw + sg * 0.46, y, e], [xw + sg * 0.46, y + 0.4, e], 0.025, 5)); blk('iron', Math.min(xw, xw + sg * 0.04), Math.max(xw, xw + sg * 0.04), y, y + 0.9, e - 0.03, e + 0.03); }
  };
  bench(wx0 + T, 1, s0 + 8.0, s0 + 9.9); bench(wx1 - T, -1, s0 + 8.0, s0 + 9.9);
  // the clock over the north gate, inside
  blk('timber', cx - 0.32, cx + 0.32, y + 3.0, y + 3.64 - 0.04, s0 + T, s0 + T + 0.05); blk('cloth_white', cx - 0.27, cx + 0.27, y + 3.05, y + 3.55 - 0.04, s0 + T + 0.05, s0 + T + 0.06);
  bag.add('iron', rod([cx, y + 3.3 - 0.02, s0 + T + 0.07], [cx + 0.04, y + 3.5 - 0.04, s0 + T + 0.07], 0.012, 4)); bag.add('iron', rod([cx, y + 3.3 - 0.02, s0 + T + 0.07], [cx + 0.18, y + 3.3 - 0.02, s0 + T + 0.07], 0.012, 4));
  // the people: the ticket seller and a second clerk, the newsagent, the collector at the north gate, two waiting
  const nocol = { circle() {}, rect() {}, segment() {}, floor() {} }, P = (x, z, rot, o) => figure({ t: 'figure', at: [x, z], y, rot, seed: Math.floor(hs(Math.round(x * 3 + z * 5)) * 1e9), dress: 'trousers', cloth: 'cloth_grey', cloth2: 'cloth_white', skin: 'skin_light', hat: 'none', hatMat: 'cloth_grey', hair: 'short', hairMat: 'hide_brown', over: 'none', ...o }, { bag, col: nocol });
  P(wx0 + T + 0.7, oz0 + 1.4, Math.PI / 2, { cloth: 'cloth_indigo' });
  P(wx0 + T + 0.7, oz0 + 4.1, Math.PI / 2, { dress: 'robe', cloth: 'cloth_maroon', cloth2: 'cloth_maroon', hair: 'bun', hairMat: 'hide_black' });
  P(wx1 - T - 0.6, nz0 + 2.3, -Math.PI / 2, { cloth: 'cloth_green', cloth2: 'cloth_white', beard: true });
  P(cx + 1.95, s0 + 0.9, 0, { cloth: 'cloth_indigo', cloth2: 'cloth_indigo', hat: 'brim', hatMat: 'cloth_indigo' });
  P(wx0 + T + 0.3, s0 + 8.6, Math.PI / 2, { pose: 'sit', cloth: 'cloth_brown', hat: 'brim' });
  P(wx1 - T - 0.3, s0 + 9.2, -Math.PI / 2, { pose: 'sit', dress: 'robe', cloth: 'cloth_ochre', cloth2: 'cloth_ochre', hair: 'long', hairMat: 'hide_brown' });
}

/**
 * quay_crowd: { rect (the quay's promenade), y, wharves: [{ x, y, a0, a1 }] (each wharf's middle line, deck and
 * awning's run), seed } — the people of Circular Quay on a weekday of 1973 (docs/settlements/sydney.md §1c):
 * commuters and visitors along the promenade, alone, in twos and threes, some on their way along it;
 * passengers waiting on the wharves under the awnings, standing or sitting on the benches. Dress of the time:
 * men in suits or shirt and trousers, women in dresses and skirts, a few hats.
 */
export function quayCrowd(el, { bag }) {
  let s = (el.seed ?? 1973) >>> 0 || 1; const rand = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  const nocol = { circle() {}, rect() {}, segment() {}, floor() {} };
  const DRESS_M = ['cloth_grey', 'cloth_black', 'cloth_indigo', 'cloth_brown', 'cloth_grey'], DRESS_W = ['cloth_red', 'cloth_indigo', 'cloth_green', 'cloth_ochre', 'cloth_white', 'cloth_maroon'];
  const person = (x, z, y, rot, extra = {}) => {
    const man = rand() < 0.55, c = man ? DRESS_M[Math.floor(rand() * DRESS_M.length)] : DRESS_W[Math.floor(rand() * DRESS_W.length)];
    const hair = man ? (rand() < 0.75 ? 'short' : 'long') : ['long', 'long', 'bun', 'short'][Math.floor(rand() * 4)];
    figure({ t: 'figure', at: [x, z], y, rot, seed: Math.floor(rand() * 1e9), dress: man ? 'trousers' : 'robe', cloth: c, cloth2: man ? (rand() < 0.6 ? c : 'cloth_white') : c,
      skin: rand() < 0.85 ? 'skin_light' : 'skin_medium', hat: man && rand() < 0.12 ? 'brim' : 'none', hatMat: 'cloth_grey', hair, beard: man && rand() < 0.15,
      hairMat: ['hide_black', 'hide_brown', 'hide_tan', 'hide_brown'][Math.floor(rand() * 4)], over: 'none', ...extra }, { bag, col: nocol });
  };
  // the promenade: groups scattered along it, clear of the wharves' heads
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0;
  for (let k = 0; k < (el.n ?? 34); k++) {
    const gx = x0 + 1 + rand() * (x1 - x0 - 2), gz = z0 + 1 + rand() * (z1 - z0 - 2), size = rand() < 0.5 ? 1 : rand() < 0.7 ? 2 : 3;
    const dir = rand() < 0.5 ? Math.PI / 2 : -Math.PI / 2;
    if (size === 1) { person(gx, gz, y, dir + (rand() - 0.5) * 0.8); continue; }
    for (let q = 0; q < size; q++) { const a = q / size * Math.PI * 2 + rand(), r = 0.55; person(gx + Math.cos(a) * r, gz + Math.sin(a) * r, y, Math.atan2(Math.cos(a), Math.sin(a)), { pose: 'talk' }); }
  }
  // the wharves: passengers sitting on the benches and standing about under the awnings
  for (const w of el.wharves ?? []) {
    for (let z = w.a0 + 3; z < w.a1 - 2; z += 5) {
      if (rand() < 0.65) person(w.x - 0.3, z + (rand() - 0.5) * 0.9, w.y, Math.PI / 2, { pose: 'sit' });
      if (rand() < 0.65) person(w.x + 0.3, z + (rand() - 0.5) * 0.9, w.y, -Math.PI / 2, { pose: 'sit' });
      if (rand() < 0.4) person(w.x + (rand() < 0.5 ? -2.6 : 2.6), z + 2.5, w.y, rand() * 6.28, {});
    }
  }
}

/**
 * quay_stall: { kind: 'news' | 'flowers' | 'pies', at: [x, z] (the middle of its back), y, seed } — the stands on Circular Quay's promenade
 * (§16), each facing the harbour (north) with its keeper behind the counter: the newspaper kiosk, the flower seller's trestles and
 * buckets, the pie cart with its flue. The counter is solid for the walker; nothing is walked into.
 */
export function quayStall(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, nocol = { circle() {}, rect() {}, segment() {}, floor() {} };
  const hs = (k) => { let h = Math.imul(Math.round(x * 31 + z * 17) + k * 7919, 2654435761) >>> 0; h = Math.imul(h ^ (h >>> 15), 2246822519) >>> 0; return h / 4294967296; };
  const blk = (mat, a, b, ya, yb, c, d, solid = false) => { if (b - a < 1e-4 || d - c < 1e-4 || yb - ya < 1e-4) return; bag.add(mat, box(x + a, y + ya, z + c, x + b, y + yb, z + d)); if (solid) col.rect([x + a, z + c, x + b, z + d], y + ya, y + yb); };
  const P = (px, pz, rot, o) => figure({ t: 'figure', at: [x + px, z + pz], y, rot, seed: Math.floor(hs(Math.round(px * 9 + pz * 5)) * 1e9), dress: 'trousers', cloth: 'cloth_grey', cloth2: 'cloth_white', skin: 'skin_light', hat: 'none', hatMat: 'cloth_grey', hair: 'short', hairMat: 'hide_brown', over: 'none', ...o }, { bag, col: nocol });
  const q = new Quads();
  const sign = (t, w, a, yy, zz, reads, mat = 'cloth_white') => { const cell = fitCell(t, w, 0.09), len = textLen(t, cell); letters(q.t(mat), t, cell, (h, v) => [x + a + (reads < 0 ? len / 2 - h : h - len / 2), y + yy + v, z + zz], 0, 0); };
  if (el.kind === 'news') {
    // the kiosk: a timber box 2.4 by 1.5 with a hatch open on the harbour side, a counter, racks of papers and magazines, a striped canvas hood
    blk('timber', -1.2, 1.2, 0, 2.3, 0.7, 0.78, true); blk('timber', -1.2, -1.12, 0, 2.3, -0.6, 0.7, true); blk('timber', 1.12, 1.2, 0, 2.3, -0.6, 0.7, true);
    blk('timber', -1.2, 1.2, 0, 1.0, -0.6, -0.5, true); blk('timber', -1.3, 1.3, 1.0, 1.06, -0.75, -0.45);
    blk('timber', -1.2, 1.2, 2.0, 2.3, -0.6, -0.5); blk('cloth_red', -1.35, 1.35, 2.3, 2.38, -1.1, 0.85); blk('cloth_white', -1.35, 1.35, 2.3, 2.38, -1.1, -0.9);
    for (let k = 0; k < 8; k++) blk(['cloth_red', 'cloth_ochre', 'cloth_indigo', 'cloth_green', 'cloth_white', 'cloth_maroon'][Math.floor(hs(k) * 6)], -1.05 + k * 0.28, -0.8 + k * 0.28, 1.08, 1.4, -0.52, -0.5);
    blk('cloth_white', -1.1, -0.55, 1.06, 1.2, -0.7, -0.5); blk('cloth_white', 0.6, 1.1, 1.06, 1.16, -0.7, -0.5);
    for (const yy of [1.5, 1.8]) blk('timber', -1.12, 1.12, yy, yy + 0.04, 0.45, 0.7);
    for (let k = 0; k < 9; k++) for (const yy of [1.54, 1.84]) blk(['cloth_red', 'cloth_ochre', 'cloth_indigo', 'cloth_green', 'cloth_white'][Math.floor(hs(k * 2 + yy * 5) * 5)], -1.05 + k * 0.25, -0.85 + k * 0.25, y * 0 + yy, yy + 0.24, 0.5, 0.56);
    sign('NEWS', 1.8, 0, 2.03, -0.6 - 0.005, -1);
    P(0.1, 0.1, Math.PI, { cloth: 'cloth_green', cloth2: 'cloth_white', hat: 'brim', hatMat: 'cloth_grey' });
  } else if (el.kind === 'flowers') {
    // the trestles with their tin buckets of cut flowers on tiers, a canvas sheet on two poles behind, the seller
    blk('timber', -1.3, 1.3, 0.7, 0.76, -0.55, 0.1, true); for (const sx of [-1.2, 1.2]) for (const sz of [-0.5, 0.05]) blk('timber', sx - 0.04, sx + 0.04, 0, 0.7, sz - 0.04, sz + 0.04);
    blk('timber', -1.3, 1.3, 0.9, 0.95, 0.2, 0.7); blk('timber', -1.3, 1.3, 0.4, 0.45, 0.2, 0.7); for (const sx of [-1.25, 0, 1.25]) blk('timber', sx - 0.04, sx + 0.04, 0, 0.95, 0.3, 0.38);
    const cols = ['cloth_red', 'cloth_ochre', 'cloth_white', 'cloth_maroon', 'cloth_green', 'cloth_indigo'];
    for (let k = 0; k < 9; k++) { const u = -1.15 + k * 0.29; const m = cols[Math.floor(hs(k) * 6)]; blk('steel_grey', u - 0.09, u + 0.09, 0.76, 0.98, -0.45, -0.27); blk(m, u - 0.14, u + 0.14, 0.98, 1.2, -0.5, -0.22); }
    for (let k = 0; k < 8; k++) { const u = -1.0 + k * 0.29; const m = cols[Math.floor(hs(k + 20) * 6)]; blk('steel_grey', u - 0.09, u + 0.09, 0.95, 1.17, 0.35, 0.53); blk(m, u - 0.14, u + 0.14, 1.17, 1.4, 0.3, 0.58); }
    for (let k = 0; k < 6; k++) { const u = -1.0 + k * 0.4; blk('steel_grey', u - 0.1, u + 0.1, 0, 0.26, 0.4, 0.6); blk(cols[Math.floor(hs(k + 40) * 6)], u - 0.15, u + 0.15, 0.26, 0.5, 0.35, 0.65); }
    for (const sx of [-1.4, 1.4]) blk('steel_grey', sx - 0.03, sx + 0.03, 0, 2.4, 0.78, 0.84, true);
    blk('cloth_white', -1.45, 1.45, 2.2, 2.3, 0.6, 1.0); blk('cloth_green', -1.45, 1.45, 2.3, 2.34, 0.6, 1.0);
    P(0.2, 0.9, Math.PI, { dress: 'robe', cloth: 'cloth_ochre', cloth2: 'cloth_ochre', hair: 'bun', hairMat: 'hide_brown' });
  } else {
    // the pie cart: a cream body 2.2 by 1.6 on four wheels, a serving hatch with a sill, the flue, a stripe of paint, the sign, three stools
    blk('timber', -1.1, 1.1, 0.0, 0.3, 0.0, 1.6, true); blk('plaster_white', -1.1, 1.1, 0.3, 1.1, 0.0, 0.1, true);       // the floor and the front below the sill
    blk('plaster_white', -1.1, 1.1, 0.3, 2.1, 1.5, 1.6, true); for (const sx of [-1.1, 1.04]) blk('plaster_white', sx, sx + 0.06, 0.3, 2.1, 0.0, 1.6, true);   // the back and the two sides
    blk('car_red', -1.12, 1.12, 0.35, 0.55, -0.02, 0.0); blk('plaster_white', -1.1, 1.1, 1.9, 2.1, 0.0, 0.1);              // the stripe; the board over the hatch
    blk('timber', -1.25, 1.25, 1.1, 1.16, -0.4, 0.1, true);
    blk('steel_grey', -1.2, 1.2, 2.1, 2.2, -0.1, 1.7);                                                                         // the roof, over its flue
    bag.add('steel_grey', lathe([[0.1, 0], [0.1, 0.7], [0.15, 0.75], [0.001, 0.75]], 8, null, x + 0.7, y + 2.2, z + 1.2));
    for (const [sx, sz] of [[-0.8, 0.3], [0.8, 0.3], [-0.8, 1.3], [0.8, 1.3]]) blk('iron', sx - 0.05, sx + 0.05, 0.0, 0.35, sz - 0.3, sz + 0.3);
    sign('PIES', 1.6, 0, 1.93, -0.005, -1, 'cloth_maroon');
    for (let k = 0; k < 6; k++) blk(k % 2 ? 'timber' : 'cloth_ochre', -0.8 + k * 0.28, -0.6 + k * 0.28, 1.16, 1.22, -0.3, -0.1);   // the pies on their tray
    for (const sx of [-0.7, 0, 0.7]) { blk('iron', sx - 0.02, sx + 0.02, 0, 0.62, -0.95, -0.91); blk('cloth_red', sx - 0.17, sx + 0.17, 0.62, 0.68, -1.12, -0.74); }
    P(0.0, 0.8, Math.PI, { y: y + 0.3, cloth: 'cloth_white', cloth2: 'cloth_white', hat: 'brim', hatMat: 'cloth_white' });
  }
  q.flush(bag);
}
