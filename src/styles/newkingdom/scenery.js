// The built ground of Thebes outside the houses (docs/settlements/thebes.md §2, §6): the stone quay on the Nile with its stairs and
// mooring posts, the sacred lake in its stone lining, the great mudbrick enclosure wall of Karnak, the barrel-vaulted storerooms,
// the sanctuary of the barque and the festival hall of Thutmose III.
import { box, lathe, place, fromTriangles } from '../../core/geom.js';
import { trim } from '../egyptian/trim.js';
import { rng } from './kit.js';
import { nkColumn } from './columns.js';

/** nk_quay: { x (the stone face), z0, z1, top (walk width), bed, level, stairs: [z], wide } */
export function quay(el, ctx) {
  const { bag, col } = ctx, x0 = el.x, x1 = el.x + el.top, bed = el.bed ?? -6.5, lv = el.level ?? -3.2;
  bag.add('sandstone_dressed', box(x0 - 1.0, bed, el.z0, x0, 0, el.z1));                        // the stone face, down to the bed
  bag.add('mudbrick', box(x0, bed, el.z0, x1, -0.05, el.z1));                                   // the mudbrick core behind it
  bag.add('sandstone_floor', box(x0 - 1.0, -0.05, el.z0, x1, 0.02, el.z1)); col.floor([x0 - 1.0, el.z0, x1, el.z1], 0.02);
  col.rect([x0 - 1.0, el.z0, x0, el.z1], bed, 0.02);
  trim({ t: 'block', rect: [x0 - 1.0, el.z0, x0 - 0.4, el.z1], y0: -0.5, y1: 0.02, mat: 'sandstone_dressed', trim: { cornice: 0.25, corners: false } }, ctx);
  // the stairs down into the water: broad steps the full 12 m for the first (the avenue's), narrower for the rest
  el.stairs.forEach((zc, k) => {
    const w = (k === 0 ? 12 : 6) / 2, n = 12, rise = (0.02 - (lv - 0.4)) / n, run = 0.45;
    for (let i = 0; i < n; i++) bag.add('sandstone_dressed', box(x0 - 1.0 - run * (n - i), lv - 0.4 + i * rise, zc - w, x0 - 1.0, lv - 0.4 + (i + 1) * rise, zc + w));
    col.ramp([x0 - 1.0 - run * n, zc - w, x0 - 1.0, zc + w], lv - 0.4, 0.02, 'e');
    for (const s of [-1, 1]) bag.add('sandstone_dressed', box(x0 - 1.0 - run * n, lv - 0.4, zc + s * w - 0.15 + (s > 0 ? 0.15 : 0), x0 - 1.0, 0.7, zc + s * w + (s > 0 ? 0.35 : -0.35)));
  });
  // the mooring posts: stone bollards along the edge with the rope turned round them, the ring-stones, a crane-less landing
  for (let z = el.z0 + 6; z < el.z1 - 4; z += 9) {
    if (el.stairs.some((s) => Math.abs(s - z) < 8)) continue;
    bag.add('sandstone_dressed', lathe([[0.2, 0], [0.22, 0.45], [0.3, 0.55], [0.2, 0.62], [0.001, 0.64]], 8, null, x0 - 0.35, 0.02, z));
    bag.add('rope_fibre', lathe([[0.215, 0.18], [0.24, 0.2], [0.24, 0.32], [0.215, 0.34]], 8, null, x0 - 0.35, 0.02, z));
    col.circle(x0 - 0.35, z, 0.3, 0.02, 0.64);
  }
  // a low parapet of mudbrick with gaps behind the walk's inner edge, and the street's kerb
  // (broken where the avenue and the market's way leave the quay)
  let zc = el.z0;
  for (const [a, b] of [[-9, 9], [14, 66]]) { if (a > zc) bag.add('mudbrick', box(x1 - 0.5, 0, zc, x1, 0.45, a)); zc = Math.max(zc, b); }
  if (el.z1 > zc) bag.add('mudbrick', box(x1 - 0.5, 0, zc, x1, 0.45, el.z1));
}

/** nk_lake: { rect, y (water), bed, stairs } — the sacred lake's stone lining: the coping and the walls down into the water, the stairs. */
export function lake(el, ctx) {
  const { bag, col } = ctx, [x0, z0, x1, z1] = el.rect, y = el.y, bed = el.bed, t = 1.6;
  const sides = [[x0 - t, z0 - t, x1 + t, z0], [x0 - t, z1, x1 + t, z1 + t], [x0 - t, z0, x0, z1], [x1, z0, x1 + t, z1]];
  for (const r of sides) { bag.add('sandstone_dressed', box(r[0], bed, r[1], r[2], 0.35, r[3])); col.rect(r, bed, 0.35); }
  for (const r of sides) trim({ t: 'block', rect: r, y0: 0.15, y1: 0.35, mat: 'sandstone_dressed', trim: { cornice: 0.12, corners: false } }, ctx);
  // the stairs: from the lake's west coping a flight into the water, wide, with the paving at its head
  for (const [zc, w] of el.stairs) {
    const n = 8, run = 0.5, rise = (0.35 - (y - 0.6)) / n;
    for (let i = 0; i < n; i++) bag.add('sandstone_dressed', box(x0, y - 0.6 + i * rise, zc - w, x0 + run * (n - i), y - 0.6 + (i + 1) * rise, zc + w));
    col.ramp([x0, zc - w, x0 + run * n, zc + w], y - 0.6, 0.35, 'w');
  }
  // the paving round the lake's edge, and the corner niches with their little shrines' footings
  bag.add('sandstone_floor', box(x0 - t - 4, -0.05, z0 - t - 4, x1 + t + 4, 0.02, z0 - t)); bag.add('sandstone_floor', box(x0 - t - 4, -0.05, z1 + t, x1 + t + 4, 0.02, z1 + t + 4));
  bag.add('sandstone_floor', box(x0 - t - 4, -0.05, z0 - t, x0 - t, 0.02, z1 + t)); bag.add('sandstone_floor', box(x1 + t, -0.05, z0 - t, x1 + t + 4, 0.02, z1 + t));
}

/** nk_enclosure: { rect (the outer faces), th, h, gaps: [{ side:'w'|'e'|'n'|'s', c, w }] } — the great mudbrick wall, panelled with shallow piers, the crown stepped. */
export function enclosure(el, ctx) {
  const { bag, col } = ctx, [X0, Z0, X1, Z1] = el.rect, th = el.th, h = el.h, GH = 9.6;
  // each side: its axis ('x' = runs along x), the wall's rect, the outward sign
  const sides = { s: ['x', X0, Z0, X1, Z0 + th, -1], n: ['x', X0, Z1 - th, X1, Z1, 1], w: ['z', X0, Z0, X0 + th, Z1, -1], e: ['z', X1 - th, Z0, X1, Z1, 1] };
  for (const [name, [ax, a0, b0, a1, b1, out]] of Object.entries(sides)) {
    const gaps = el.gaps.filter((g) => g.side === name).map((g) => [g.c - g.w / 2, g.c + g.w / 2]).sort((p, q) => p[0] - q[0]);
    const lo = ax === 'x' ? a0 : b0, hi = ax === 'x' ? a1 : b1, segs = []; let c = lo;
    for (const g of gaps) { segs.push([c, g[0]]); c = g[1]; } segs.push([c, hi]);
    const R = (s0, s1, t0, t1) => (ax === 'x' ? [s0, t0, s1, t1] : [t0, s0, t1, s1]);                       // along s, across t
    const t0 = ax === 'x' ? b0 : a0, t1 = ax === 'x' ? b1 : a1, face = out > 0 ? t1 : t0;
    for (const [s0, s1] of segs) {
      if (s1 - s0 < 0.5) continue;
      const r = R(s0, s1, t0, t1);
      bag.add('mudbrick', box(r[0], -0.2, r[1], r[2], h, r[3])); col.rect(r, -0.2, h);
      const cr = R(s0, s1, out > 0 ? t1 - 0.8 : t0, out > 0 ? t1 : t0 + 0.8);
      bag.add('mud_plaster', box(cr[0], h, cr[1], cr[2], h + 0.55, cr[3]));                                  // the stepped crown on the outer lip
      for (let p = Math.ceil((s0 + 2) / 9) * 9; p + 4.2 < s1 - 1; p += 9) {                                 // the shallow piers
        const pr = R(p, p + 4.2, out > 0 ? face : face - 0.35, out > 0 ? face + 0.35 : face);
        bag.add('banco_rough', box(pr[0], h * 0.08, pr[1], pr[2], h * 0.9, pr[3]));
      }
    }
    // the gates: stone jambs and a lintel mass, the opening kept clear
    for (const [g0, g1] of gaps) {
      for (const [e0, e1] of [[g0 - 0.9, g0], [g1, g1 + 0.9]]) { const r = R(e0, e1, t0, t1); bag.add('sandstone', box(r[0], 0, r[1], r[2], GH, r[3])); col.rect(r, 0, GH); }
      const r = R(g0 - 0.9, g1 + 0.9, t0, t1); bag.add('sandstone', box(r[0], GH - 1.0, r[1], r[2], GH, r[3])); col.rect(r, GH - 1.0, GH);
    }
  }
}

/** A barrel vault over a chamber along x: the half-cylinder shell from y0, radius r, between the x limits (z0..z1 its width). */
function vault(bag, x0, x1, z0, z1, y0, mat = 'mudbrick') {
  const r = (z1 - z0) / 2, zc = (z0 + z1) / 2, N = 8, T = [], pt = (x, i) => [x, y0 + Math.sin(Math.PI * i / N) * r * 0.55, zc - Math.cos(Math.PI * i / N) * r];
  for (let i = 0; i < N; i++) { const a = pt(x0, i), b = pt(x0, i + 1), c = pt(x1, i + 1), d = pt(x1, i); T.push(...a, ...d, ...c, ...a, ...c, ...b); }
  bag.add(mat, fromTriangles(T));
  for (const [x, f] of [[x0, -1], [x1, 1]]) { const P = Array.from({ length: N + 1 }, (_, i) => pt(x, i)); for (let i = 1; i < N; i++) T.length = 0, T.push(...P[0].map((v) => v), ...(f > 0 ? [...P[i], ...P[i + 1]] : [...P[i + 1], ...P[i]])), bag.add(mat, fromTriangles(T)); }
}
/** nk_magazines: { rect, seed } — rows of barrel-vaulted storerooms of mudbrick, a passage between each block of six, their doors on the aisles. */
export function magazines(el, ctx) {
  const { bag, col } = ctx, [X0, Z0, X1, Z1] = el.rect, rand = rng(el.seed ?? 5), W = 5.0, D = 12, A = 3.0, H = 3.4;
  for (let z = Z0 + 3; z + D <= Z1 - 2; z += D + A) {
    for (let x = X0 + 2; x + 6 * W <= X1 - 2; x += 6 * W + 3) {
      const r = [x, z, x + 6 * W, z + D];
      bag.add('mudbrick', box(r[0], -0.2, r[1], r[2], H, r[3])); col.rect(r, -0.2, H + 1.4);
      bag.add('mud_plaster', box(r[0] - 0.15, H - 0.3, r[1] - 0.15, r[2] + 0.15, H, r[3] + 0.15));
      for (let k = 0; k < 6; k++) {
        vault(bag, x + k * W + 0.15, x + (k + 1) * W - 0.15, r[1] + 0.2, r[3] - 0.2, H - 0.2);
        bag.add('opening', box(x + k * W + 1.6, 0, r[3] - 0.01, x + k * W + 3.4, 2.1, r[3] + 0.06));                  // the door on the south aisle (z+)
        bag.add('timber', box(x + k * W + 1.5, 2.1, r[3] - 0.02, x + k * W + 3.5, 2.28, r[3] + 0.1));
        if (rand() < 0.4) bag.add('terracotta', lathe([[0.001, 0], [0.3, 0.02], [0.42, 0.5], [0.3, 0.95], [0.001, 1.0]], 8, null, x + k * W + 0.9, 0, r[3] + 0.9));
      }
    }
    for (let x = X0 + 6; x < X1 - 6; x += 17) bag.add('mud_plaster', box(x, 0, z + D + 1.0, x + 0.9, 0.08, z + D + 1.3));
  }
}

/** nk_festival: { rect, h } — the festival hall of Thutmose III: tent-pole columns down the nave, square pillars in the side aisles, the roof stepped over the nave, in local frame x/z world. */
export function festival(el, ctx) {
  const { bag, col } = ctx, [x0, z0, x1, z1] = el.rect, zc = (z0 + z1) / 2, hs = 2.4, Hn = el.h ?? 9.6, Ha = Hn - 2.4, wallT = 2.4, mat = 'sandstone';
  bag.add('sandstone_floor', box(x0, -0.5, z0, x1, 0.02, z1)); col.floor([x0, z0, x1, z1], 0.02);
  const W = (r, y1) => { bag.add(mat, box(r[0], -0.5, r[1], r[2], y1, r[3])); col.rect(r, -0.5, y1); };
  W([x0, z0, x1, z0 + wallT], Ha + 0.9); W([x0, z1 - wallT, x1, z1], Ha + 0.9); W([x1 - wallT, z0, x1, z1], Hn);
  W([x0, z0 + wallT, x0 + wallT, zc - 4.6], Hn); W([x0, zc + 4.6, x0 + wallT, z1 - wallT], Hn);                // the west end, the door between
  bag.add(mat, box(x0, Ha + 0.4, zc - 4.6, x0 + wallT, Hn, zc + 4.6));
  for (let x = x0 + 7; x < x1 - 4; x += 6.4) for (const s of [-1, 1]) nkColumn({ at: [x, zc + s * 5.2], h: Hn - 0.9, d: 1.9, cap: 'open', scenes: 2, seed: 5 + (Math.round(x) % 3) }, ctx);
  for (let x = x0 + 7; x < x1 - 4; x += 6.4) for (const s of [-1, 1]) { bag.add('sandstone_dressed', box(x - hs / 2 + 0.2, 0, zc + s * 12.6 - 0.7, x + hs / 2 - 0.2, Ha - 0.9, zc + s * 12.6 + 0.7)); col.rect([x - 0.7, zc + s * 12.6 - 0.7, x + 0.7, zc + s * 12.6 + 0.7], 0, Ha - 0.9); }
  // the roof: the nave's slab at Hn over the central columns, the aisles' lower at Ha, with the clerestory wall between
  bag.add(mat, box(x0 + wallT, Hn - 0.9, zc - 7.2, x1 - wallT, Hn, zc + 7.2));
  for (const s of [-1, 1]) { bag.add(mat, box(x0 + wallT, Ha - 0.9, s < 0 ? z0 + wallT : zc + 7.2, x1 - wallT, Ha, s < 0 ? zc - 7.2 : z1 - wallT)); bag.add(mat, box(x0 + wallT, Ha, zc + s * 7.2 - (s < 0 ? 0 : 0), x1 - wallT, Hn - 0.9, zc + s * 7.2 + s * 0.6)); }
  trim({ t: 'block', rect: [x0 - 0.2, z0 - 0.2, x1 + 0.2, z1 + 0.2], y0: Ha - 0.2, y1: Ha + 0.9, mat, trim: { torus: 0.3, cornice: 0.9, corners: true } }, ctx);
}

/** nk_sanctuary: { rect, h } — the sanctuary of the barque: a granite shrine in the middle of a pillared hall, the chapels ranged on both sides. */
export function sanctuary(el, ctx) {
  const { bag, col } = ctx, [x0, z0, x1, z1] = el.rect, zc = (z0 + z1) / 2, H = el.h ?? 9, wallT = 2.2, mat = 'sandstone';
  bag.add('sandstone_floor', box(x0, -0.5, z0, x1, 0.02, z1)); col.floor([x0, z0, x1, z1], 0.02);
  const W = (r, y1) => { bag.add(mat, box(r[0], -0.5, r[1], r[2], y1, r[3])); col.rect(r, -0.5, y1); };
  W([x0, z0, x1, z0 + wallT], H); W([x0, z1 - wallT, x1, z1], H); W([x1 - wallT, z0, x1, z1], H);
  W([x0, z0 + wallT, x0 + wallT, zc - 4], H); W([x0, zc + 4, x0 + wallT, z1 - wallT], H); bag.add(mat, box(x0, 6.2, zc - 4, x0 + wallT, H, zc + 4));
  // the pillars of the vestibule, the shrine of red granite with its doorway, the chapels' dividing walls
  for (const s of [-1, 1]) for (let k = 0; k < 3; k++) nkColumn({ at: [x0 + 6 + k * 5.4, zc + s * 6.6], h: H - 0.9, d: 1.3, cap: 'bud', scenes: 1, seed: 4 + k }, ctx);
  const sx = x0 + 22, sw = 7.4, sd = 5.6;
  bag.add('granite_red', box(sx - sw / 2, 0, zc - sd / 2, sx + sw / 2, 5.2, zc + sd / 2)); col.rect([sx - sw / 2, zc - sd / 2, sx + sw / 2, zc + sd / 2], 0, 5.2);
  bag.add('opening', box(sx - sw / 2 - 0.05, 0, zc - 0.9, sx - sw / 2 + 0.05, 2.6, zc + 0.9));
  bag.add('granite_black', box(sx - sw / 2 - 0.5, 0, zc - sd / 2 - 0.5, sx + sw / 2 + 0.5, 0.45, zc + sd / 2 + 0.5));
  trim({ t: 'block', rect: [sx - sw / 2, zc - sd / 2, sx + sw / 2, zc + sd / 2], y0: 4.2, y1: 5.2, mat: 'granite_red', trim: { torus: 0.2, cornice: 0.5, corners: true } }, ctx);
  for (const s of [-1, 1]) for (let k = 0; k < 3; k++) {
    const cz = zc + s * (7.2 + k * 3.8); W([x0 + 12, cz - 0.4, x1 - wallT, cz + 0.4], H - 1.0);
    bag.add('opening', box(x1 - wallT - 0.05, 0, cz + s * 1.9 - 0.6, x1 - wallT + 0.05, 2.0, cz + s * 1.9 + 0.6));
  }
  bag.add(mat, box(x0 + wallT, H - 1.0, z0 + wallT, x1 - wallT, H, z1 - wallT));                                   // the roof
  trim({ t: 'block', rect: [x0 - 0.2, z0 - 0.2, x1 + 0.2, z1 + 0.2], y0: H - 1.1, y1: H + 0.9, mat, trim: { torus: 0.35, cornice: 1.0, corners: true } }, ctx);
}
