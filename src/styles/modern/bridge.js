// The Sydney Harbour Bridge in 1973 (docs/settlements/sydney.md §1b), at half scale: two arch trusses of 28 panels,
// deepest at the ends by the pylons and shallowest at the crown, the lower chord springing from the bearings at
// the abutments; verticals and diagonals in every panel, laced; wind bracing between the trusses at the top and
// bottom chords; the hangers down to the deck's cross girders where the arch is above the deck, posts up to it
// where below; the deck: eight road lanes between the trusses, on the cantilever to the west the two tracks of the
// North Shore railway and the cycleway, on the east the footway; the four granite-faced pylons, which carry
// nothing; the approach spans on granite piers.

import { box, frustum, fromTriangles } from '../../core/geom.js';

const S = 'steel_grey';
/** A straight member from a to b (in the y–z plane, at x = a[0]), w across (x) and d deep. */
function member(bag, mat, a, b, w, d) {
  const dy = b[1] - a[1], dz = b[2] - a[2], L = Math.hypot(dy, dz);
  const g = box(-w / 2, -d / 2, 0, w / 2, d / 2, L); g.rotateX(-Math.atan2(dy, dz)); g.translate(a[0], a[1], a[2]); bag.add(mat, g);
}
/** A flat bar (both faces) from a to b, w wide across `side`. */
function bar(T, a, b, w, side) {
  const h = w / 2, p = (q, s) => [q[0] + side[0] * h * s, q[1] + side[1] * h * s, q[2] + side[2] * h * s];
  const A = p(a, -1), B = p(b, -1), C = p(b, 1), D = p(a, 1);
  T.push(...A, ...B, ...C, ...A, ...C, ...D, ...A, ...C, ...B, ...A, ...D, ...C);
}
/** arch_bridge: { x, z0, z1 (the springings), rise (crown of the lower chord), depth0, depth1 (truss depth at the ends, at the crown), deck, w (deck width), truss (half the distance between the trusses), approach, pylon } */
export function archBridge(el, { bag, col }) {
  const { x, z0, z1 } = el, rise = el.rise ?? 56, dE = el.depth0 ?? 28.5, dC = el.depth1 ?? 9, deck = el.deck ?? 26, w = el.w ?? 25, tw = el.truss ?? 7.5, ap = el.approach ?? 60, py = el.pylon ?? 46, L = z1 - z0, N = 28;
  const yb = (t) => rise * (1 - (2 * t - 1) ** 2), dep = (t) => dE + (dC - dE) * (1 - (2 * t - 1) ** 2), Z = (t) => z0 + L * t;
  const lo = (t) => yb(t), hi = (t) => yb(t) + dep(t), T = [];
  for (const sx of [-tw, tw]) {
    const X = x + sx;
    for (let i = 0; i < N; i++) {
      const t0 = i / N, t1 = (i + 1) / N;
      member(bag, S, [X, lo(t0), Z(t0)], [X, lo(t1), Z(t1)], 1.5, 2.2);                         // the lower chord
      member(bag, S, [X, hi(t0), Z(t0)], [X, hi(t1), Z(t1)], 1.3, 1.6);                         // the upper chord
      // the diagonal, sloping down toward the crown in each half
      const [ta, tb] = t1 <= 0.5 ? [t0, t1] : [t1, t0];
      member(bag, S, [X, hi(ta) - 0.8, Z(ta)], [X, lo(tb) + 1.1, Z(tb)], 0.9, 0.9);
    }
    // the verticals at the panel points: two channels joined by lacing
    for (let i = 0; i <= N; i++) {
      const t = i / N, z = Z(t), y0 = lo(t) + 1.1, y1 = hi(t) - 0.8;
      for (const s of [-0.35, 0.35]) bag.add(S, box(X - 0.45, y0, z + s - 0.08, X + 0.45, y1, z + s + 0.08));
      for (let yy = y0, k = 0; yy < y1 - 0.9; yy += 0.9, k++) bar(T, [X, yy, z + (k % 2 ? 0.3 : -0.3)], [X, yy + 0.9, z + (k % 2 ? -0.3 : 0.3)], 0.12, [1, 0, 0]);
      // the hangers down to the deck where the arch is above it, posts up to it where below
      if (lo(t) - 1.1 > deck + 0.5) { for (const s of [-0.25, 0.25]) bag.add(S, box(X - 0.2, deck, z + s - 0.12, X + 0.2, lo(t) - 1.1, z + s + 0.12)); }
      else if (lo(t) + 1.1 < deck - 2.6) bag.add(S, box(X - 0.55, lo(t) + 1.1, z - 0.55, X + 0.55, deck - 2.6, z + 0.55));
    }
    // the bearing at each end: the pin's housing on its granite skewback
    for (const z of [z0, z1]) { bag.add('granite_grey', box(X - 2.5, -8, z - 3, X + 2.5, -0.8, z + 3)); bag.add(S, box(X - 1.4, -0.8, z - 1.6, X + 1.4, 1.2, z + 1.6)); }
  }
  // the wind bracing between the trusses: a strut and a cross at every panel of the upper chords, and of the lower chords above the deck
  for (let i = 0; i < N; i++) {
    const t0 = i / N, t1 = (i + 1) / N;
    for (const [f, off] of [[hi, -0.4], [lo, 0.6]]) {
      if (f === lo && lo(t0) < deck + 4) continue;
      const a = [x - tw, f(t0) + off, Z(t0)], b = [x + tw, f(t1) + off, Z(t1)], c = [x + tw, f(t0) + off, Z(t0)], d = [x - tw, f(t1) + off, Z(t1)];
      bar(T, a, b, 0.5, [0, 1, 0]); bar(T, c, d, 0.5, [0, 1, 0]);
      bag.add(S, box(x - tw, f(t0) + off - 0.5, Z(t0) - 0.3, x + tw, f(t0) + off + 0.3, Z(t0) + 0.3));
    }
  }
  bag.add(S, fromTriangles(T));
  // the deck through the arch and on to the shores: cross girders under it at every panel point, stringers, the
  // road between the trusses, the railway and cycleway on the west, the footway on the east, the railings
  const za = z0 - ap, zb = z1 + ap, zl = Math.min(za, zb), zh = Math.max(za, zb), dy = deck;
  for (const sx of [-w / 2 + 0.4, -tw - 0.6, -tw + 0.6, tw - 0.6, tw + 0.6, w / 2 - 0.4]) bag.add(S, box(x + sx - 0.3, dy - 2.4, zl, x + sx + 0.3, dy - 0.3, zh));   // the stringers
  for (let z = z0; z <= z1 + 0.01; z += L / N) bag.add(S, box(x - w / 2, dy - 2.6, z - 0.4, x + w / 2, dy - 0.3, z + 0.4));
  for (let z = z1 + L / N; z < zb; z += L / N) bag.add(S, box(x - w / 2, dy - 2.6, z - 0.4, x + w / 2, dy - 0.3, z + 0.4));
  for (let z = z0 - L / N; z > za; z -= L / N) bag.add(S, box(x - w / 2, dy - 2.6, z - 0.4, x + w / 2, dy - 0.3, z + 0.4));
  bag.add('plaster_grey', box(x - w / 2, dy - 0.3, zl, x + w / 2, dy - 0.05, zh));               // the deck slab
  bag.add('asphalt', box(x - tw + 1.0, dy - 0.05, zl, x + tw - 1.0, dy, zh));                    // the road, eight lanes
  for (let k = 1; k < 8; k++) { const lx = x - tw + 1.0 + k * (2 * tw - 2) / 8; for (let z = zl + 1; z < zh - 3; z += 9) bag.add('paint_white', box(lx - 0.06, dy, z, lx + 0.06, dy + 0.01, z + 3)); }
  bag.add('plaster_grey', box(x - tw - 0.9, dy - 0.05, zl, x - tw + 1.0, dy + 0.2, zh)); bag.add('plaster_grey', box(x + tw - 1.0, dy - 0.05, zl, x + tw + 0.9, dy + 0.2, zh));   // the kerbs by the trusses
  for (const tx of [-w / 2 + 1.6, -w / 2 + 3.6]) {                                              // the railway, two tracks
    bag.add('rubble', box(x + tx - 0.9, dy - 0.05, zl, x + tx + 0.9, dy + 0.15, zh));
    for (let z = zl; z < zh; z += 0.65) bag.add('timber', box(x + tx - 0.65, dy + 0.15, z - 0.1, x + tx + 0.65, dy + 0.27, z + 0.1));
    for (const g of [-0.36, 0.36]) bag.add('steel_chrome', box(x + tx + g - 0.035, dy + 0.27, zl, x + tx + g + 0.035, dy + 0.37, zh));
  }
  for (let z = zl + 3; z < zh; z += 12) { bag.add(S, box(x - w / 2 + 0.3, dy + 0.15, z - 0.12, x - w / 2 + 0.5, dy + 3.4, z + 0.12)); bag.add(S, box(x - w / 2 + 0.3, dy + 3.3, z - 0.08, x - w / 2 + 4.6, dy + 3.42, z + 0.08)); }   // the overhead wire's masts
  for (const s of [-1, 1]) bag.add('iron', box(x - w / 2 + 2.6 + s * 1.0 - 0.02, dy + 3.0, zl, x - w / 2 + 2.6 + s * 1.0 + 0.02, dy + 3.04, zh));
  bag.add('plaster_grey', box(x + tw + 0.9, dy - 0.05, zl, x + w / 2, dy + 0.12, zh));            // the footway
  col.floor([x - w / 2, zl, x + w / 2, zh], dy);
  const T2 = [];
  for (const sx of [-w / 2 + 0.1, w / 2 - 0.1]) {
    bag.add(S, box(x + sx - 0.06, dy + 1.1, zl, x + sx + 0.06, dy + 1.22, zh));
    bag.add(S, box(x + sx - 0.06, dy + 0.15, zl, x + sx + 0.06, dy + 0.25, zh));
    for (let z = zl; z < zh; z += 2.0) bag.add(S, box(x + sx - 0.05, dy, z - 0.05, x + sx + 0.05, dy + 1.1, z + 0.05));
    for (let z = zl + 1; z < zh; z += 2.0) bar(T2, [x + sx, dy + 0.25, z - 1], [x + sx, dy + 1.1, z], 0.05, [1, 0, 0]);
    col.segment([x + sx, zl], [x + sx, zh], 0.2, dy, dy + 1.2);
  }
  bag.add(S, fromTriangles(T2));
  for (const [zz, sg] of [[z0, -1], [z1, 1]]) {
    // the granite pylons, a pair at each end outside the deck: a battered shaft in rusticated courses, a cornice, two stepped stages over it, tall windows near the top
    for (const sx of [-w / 2 - 5.3, w / 2 + 5.3]) {
      const px = x + sx, pz = zz + sg * 2;
      bag.add('granite_grey', frustum([px - 5, pz - 6, px + 5, pz + 6], -8, py, 0.5, 0.5, 0.5, 0.5)); col.rect([px - 5, pz - 6, px + 5, pz + 6], -8, py);
      for (let yy = 2; yy < py - 4; yy += 2.6) { const f = (yy + 8) / (py + 8) * 0.5; bag.add('granite_rough', box(px - 5 + f - 0.08, yy, pz - 6 + f - 0.08, px + 5 - f + 0.08, yy + 0.35, pz + 6 - f + 0.08)); }
      bag.add('granite_grey', box(px - 5.0, py - 0.2, pz - 6.0, px + 5.0, py + 1.0, pz + 6.0));
      bag.add('granite_grey', box(px - 4.2, py + 1.0, pz - 5.2, px + 4.2, py + 4.5, pz + 5.2));
      bag.add('granite_grey', box(px - 3.4, py + 4.5, pz - 4.4, px + 3.4, py + 6.5, pz + 4.4));
      bag.add('granite_grey', box(px - 3.7, py + 6.5, pz - 4.7, px + 3.7, py + 7.0, pz + 4.7));
      const ins = (yy) => (yy + 8) / (py + 8) * 0.5 - 0.012, WN = [], y0 = py - 9, y1 = py - 2.5;
      for (const sz of [-1, 1]) for (const dx of [-2, 2]) { const za2 = pz + sz * (6 - ins(y0)), zb2 = pz + sz * (6 - ins(y1)); const A = [px + dx - 0.6, y0, za2], B = [px + dx + 0.6, y0, za2], C = [px + dx + 0.6, y1, zb2], D = [px + dx - 0.6, y1, zb2]; if (sz > 0) WN.push(...A, ...B, ...C, ...A, ...C, ...D); else WN.push(...A, ...C, ...B, ...A, ...D, ...C); }
      for (const sxx of [-1, 1]) for (const dz of [-2.4, 0, 2.4]) { const xa = px + sxx * (5 - ins(y0)), xb = px + sxx * (5 - ins(y1)); const A = [xa, y0, pz + dz - 0.5], B = [xa, y0, pz + dz + 0.5], C = [xb, y1, pz + dz + 0.5], D = [xb, y1, pz + dz - 0.5]; if (sxx < 0) WN.push(...A, ...B, ...C, ...A, ...C, ...D); else WN.push(...A, ...C, ...B, ...A, ...D, ...C); }
      bag.add('opening', fromTriangles(WN));
    }
    // the approach spans' piers of granite, their steel trestles under the deck
    for (let k = 1; k * 15 < ap; k++) { const z = zz + sg * k * 15; for (const sx of [-w / 2 + 2, -tw, tw, w / 2 - 2]) bag.add('granite_grey', box(x + sx - 1, -8, z - 1, x + sx + 1, deck - 2.6, z + 1)); }
  }
}
