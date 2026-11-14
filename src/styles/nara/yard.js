// The small works of Nara in 752 (docs/settlements/nara.md §14): the raised storehouses of log (azekura: the
// Shōsōin and the kura of the houses), the wattle and bamboo fences of the plots, the kitchen gardens of the blocks
// with their beds, drying racks and woodpiles, the bell tower, the banner poles of the court.
// Every element takes `simple` (the far level): the small things are left out.

import { box, lathe } from '../../core/geom.js';
import { orientedBox } from '../../core/build.js';
import { gableRoofC, hipRoof } from '../chinese/index.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/**
 * nara_azekura { rect, y, seed, fl (floor height above the ground), H (the log walls' height), alongX (the long side runs along x), tile }
 * A storehouse of triangular logs laid in courses, on posts of timber over base stones, a ladder to the door in the
 * long side facing south or west, a hipped (here gabled) roof of tile or bark; the Shōsōin is nine bays by three.
 */
export function naraAzekura(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, fl = el.fl ?? 1.2, H = el.H ?? 2.6, simple = !!el.simple;
  const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, alongX = el.alongX ?? (x1 - x0 >= z1 - z0), tile = el.tile ?? true;
  const top = y + fl, rand = rng(el.seed ?? 3);
  // posts on base stones, every ~2.4 m round the edge and one row down the middle
  const nx = Math.max(1, Math.round((x1 - x0) / 2.6)), nz = Math.max(1, Math.round((z1 - z0) / 2.6));
  const posts = [];
  for (let i = 0; i <= nx; i++) for (let j = 0; j <= nz; j++) {
    if (i > 0 && i < nx && j > 0 && j < nz && (i + j) % 2) continue;
    posts.push([x0 + 0.35 + (x1 - x0 - 0.7) * i / nx, z0 + 0.35 + (z1 - z0 - 0.7) * j / nz]);
  }
  const pw = fl > 2 ? 0.28 : 0.16;
  for (const [px, pz] of posts) {
    bag.add('granite_block', box(px - pw - 0.08, y - 0.1, pz - pw - 0.08, px + pw + 0.08, y + 0.18, pz + pw + 0.08));
    bag.add('timber', box(px - pw, y + 0.18, pz - pw, px + pw, top - 0.2, pz + pw));
    col.rect([px - pw, pz - pw, px + pw, pz + pw], y, top - 0.2);
  }
  // the floor joists and boards
  bag.add('wood_dark', box(x0, top - 0.3, z0, x1, top - 0.1, z1));
  bag.add('timber', box(x0 - 0.05, top - 0.1, z0 - 0.05, x1 + 0.05, top, z1 + 0.05));
  // the log walls: a block, the courses of logs standing out from it as bands (their corners crossing)
  const wx0 = x0 + 0.1, wz0 = z0 + 0.1, wx1 = x1 - 0.1, wz1 = z1 - 0.1, wy = top + H;
  bag.add('wood_dark', box(wx0, top, wz0, wx1, wy, wz1));
  col.rect([wx0, wz0, wx1, wz1], top - 0.3, wy);
  const course = fl > 2 ? 0.34 : 0.26, rows = Math.floor(H / course);
  for (let r = 0; r < rows; r++) {
    const ya = top + r * course + 0.04, yb = ya + course * 0.62, o = 0.05;
    bag.add('timber', box(wx0 - o, ya, wz0 - 0.13, wx1 + o, yb, wz0 + 0.02));
    bag.add('timber', box(wx0 - o, ya, wz1 - 0.02, wx1 + o, yb, wz1 + 0.13));
    bag.add('timber', box(wx0 - 0.13, ya, wz0 - o, wx0 + 0.02, yb, wz1 + o));
    bag.add('timber', box(wx1 - 0.02, ya, wz0 - o, wx1 + 0.13, yb, wz1 + o));
  }
  // the door in the south long side (or the west one): two plank leaves, a lintel, a ladder of two poles with rungs
  const door = alongX ? [cx, z1 + 0.15] : [x0 - 0.15, cz], dw = Math.min(1.1, (alongX ? x1 - x0 : z1 - z0) * 0.2);
  const dbox = (a, b, ya, yb, dd) => (alongX ? box(door[0] + a, ya, door[1] - dd, door[0] + b, yb, door[1] + dd) : box(door[0] - dd, ya, door[1] + a, door[0] + dd, yb, door[1] + b));
  bag.add('wood_dark', dbox(-dw, dw, top + 0.05, top + Math.min(2.1, H - 0.2), 0.08));
  bag.add('lacquer_black', dbox(-dw - 0.12, -dw, top, top + Math.min(2.25, H - 0.1), 0.14));
  bag.add('lacquer_black', dbox(dw, dw + 0.12, top, top + Math.min(2.25, H - 0.1), 0.14));
  bag.add('lacquer_black', dbox(-dw - 0.12, dw + 0.12, top + Math.min(2.1, H - 0.2), top + Math.min(2.25, H - 0.1), 0.14));
  const steps = Math.ceil(fl / 0.28), run = fl * 1.0 + 0.3;
  for (let i = 0; i < steps; i++) {
    const a = (i + 1) / steps, ya = y + fl * a - 0.1, out = 0.2 + run * (1 - a);
    const [sx0, sz0, sx1, sz1] = alongX ? [door[0] - 0.55, z1 + out - 0.18, door[0] + 0.55, z1 + out + 0.18] : [x0 - out - 0.18, door[1] - 0.55, x0 - out + 0.18, door[1] + 0.55];
    bag.add('timber', box(sx0, ya, sz0, sx1, ya + 0.1, sz1));
    col.rect([sx0, sz0, sx1, sz1], y, ya + 0.1);
  }
  // the roof: tile for the temple's (grey), bark for a house's, deep eaves
  const A = (alongX ? x1 - x0 : z1 - z0) / 2 + 1.0, B = (alongX ? z1 - z0 : x1 - x0) / 2 + 1.0;
  if (tile) hipRoof({ c: [cx, cz], A, B, y: wy + 0.2, rise: Math.min(B * 0.7, 4.0), eaveSlope: 0.3, pow: 1.6, lift: 0.3, mat: 'tile_grey', soffit: 'timber', noChiwei: true, ridgeMat: 'tile_grey', alongZ: !alongX }, { bag, col });
  else gableRoofC({ c: [cx, cz], A, B, y: wy + 0.2, rise: Math.min(B * 0.62, 3.6), mat: 'roof_bark', soffit: 'timber', ridgeMat: 'roof_bark', noHorns: true, alongZ: !alongX }, { bag, col });
  if (simple) return;
  // goods at the door: a sack and a pot or two
  if (!tile) {
    const k = alongX ? [door[0] + dw + 0.9, z1 + 0.5] : [x0 - 0.5, door[1] + dw + 0.9];
    bag.add('pottery_dark', lathe([[0.001, 0], [0.16, 0], [0.3, 0.3], [0.26, 0.55], [0.16, 0.62], [0.001, 0.62]], 10, null, k[0], y, k[1]));
  }
  void rand;
}

/**
 * nara_fence { pts: [[x, z], …], y, h (1.2), kind: 'wattle' | 'bamboo' | 'board', gaps: [[s0, s1], …] (lengths along the line left open) }
 * A fence of posts every 1.5 m with a woven panel (wattle: stakes and withies, the bamboo: split canes in two rails, board: planks).
 */
export function naraFence(el, { bag, col }) {
  const y = el.y ?? 0, h = el.h ?? 1.2, kind = el.kind ?? 'wattle', simple = !!el.simple;
  const mat = kind === 'bamboo' ? 'bamboo_culm' : kind === 'board' ? 'timber' : 'wicker';
  let run = 0;
  for (let k = 0; k < el.pts.length - 1; k++) {
    const a = el.pts[k], b = el.pts[k + 1], L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (L < 0.1) continue;
    const ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L;
    const P = (s) => [a[0] + ux * s, a[1] + uz * s];
    const gaps = (el.gaps ?? []).map(([g0, g1]) => [g0 - run, g1 - run]).filter(([g0, g1]) => g1 > 0 && g0 < L).sort((p, q) => p[0] - q[0]);
    let s = 0;
    const seg = (s0, s1) => {
      if (s1 - s0 < 0.2) return;
      const p = P(s0), q = P(s1);
      bag.add(mat, orientedBox(p, q, kind === 'board' ? 0.06 : 0.1, y + 0.1, y + h - 0.1));
      if (!simple) {
        bag.add('wood_dark', orientedBox(p, q, 0.14, y + h - 0.12, y + h));
        if (kind === 'bamboo') bag.add('wood_dark', orientedBox(p, q, 0.14, y + 0.4, y + 0.46));
        const n = Math.max(1, Math.round((s1 - s0) / 1.5));
        for (let i = 0; i <= n; i++) { const m = P(s0 + (s1 - s0) * i / n); bag.add('wood_dark', box(m[0] - 0.06, y, m[1] - 0.06, m[0] + 0.06, y + h + 0.1, m[1] + 0.06)); }
      }
      col.segment(p, q, 0.14, y, y + h);
    };
    for (const [g0, g1] of gaps) { seg(s, Math.max(s, g0)); s = Math.max(s, g1); }
    seg(s, L);
    run += L;
  }
}

/**
 * nara_garden { rect, y, seed, kura (a storehouse of the plot: true | false), rack, wood }
 * A kitchen garden between the rows of houses: raised beds of tilled earth with rows of greens, a drying rack of
 * bamboo hung with cloth and strings of radish, a woodpile under a lean-to, a few jars, a rain tub.
 */
export function naraGarden(el, ctx) {
  const { bag, col } = ctx;
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, rand = rng(el.seed ?? 5), simple = !!el.simple;
  const W = x1 - x0, D = z1 - z0;
  // beds: long mounds in two groups
  const nb = Math.max(2, Math.floor(W / 7));
  for (let i = 0; i < nb; i++) {
    const bx = x0 + 1.5 + (W - 3) * (i + 0.5) / nb - 1.1, bz = z0 + 1.6 + rand() * 0.6, len = Math.min(D * 0.55, 4 + rand() * 3.5);
    bag.add('earth_wall', box(bx, y, bz, bx + 2.2, y + 0.18, bz + len));
    if (!simple) for (let r = 0; r < 4; r++) bag.add(rand() < 0.5 ? 'lotus_leaf' : 'flax_leaf', box(bx + 0.2 + r * 0.5, y + 0.18, bz + 0.15, bx + 0.34 + r * 0.5, y + 0.36 + rand() * 0.12, bz + len - 0.15));
  }
  if (simple) return;
  // the drying rack: two A-frames and a pole, cloth and radishes hung
  const rx = x0 + 1.2 + rand() * Math.max(0, W * 0.25 - 1), rz = z1 - 2.2, rl = 3.4;
  for (const s of [0, 1]) {
    const px = rx + s * rl;
    bag.add('bamboo_culm', orientedBox([px, rz - 0.5], [px, rz + 0.5], 0.07, y, y + 0.1));
    for (const d of [-1, 1]) { const g = lathe([[0.001, 0], [0.035, 0], [0.035, 1], [0.001, 1]], 5, null, 0, 0, 0); void g; bag.add('bamboo_culm', box(px - 0.04, y, rz + d * 0.5 - 0.04, px + 0.04, y + 1.9, rz + d * 0.5 + 0.04)); }
    col.rect([px - 0.1, rz - 0.55, px + 0.1, rz + 0.55], y, y + 1.9);
  }
  bag.add('bamboo_culm', box(rx - 0.15, y + 1.75, rz - 0.05, rx + rl + 0.15, y + 1.85, rz + 0.05));
  const CL = ['cloth_indigo', 'cloth_white', 'cloth_ochre', 'cloth_brown'];
  for (let i = 0; i < 4; i++) { const cxm = rx + 0.4 + i * 0.8; bag.add(CL[Math.floor(rand() * 4)], box(cxm, y + 0.85, rz - 0.015, cxm + 0.6, y + 1.75, rz + 0.015)); }
  // woodpile and lean-to
  const wx = x0 + 1.2 + rand() * (W - 6), wz = z0 + 0.4;
  bag.add('log_pine', box(wx, y, wz, wx + 2.2, y + 0.9, wz + 0.7));
  bag.add('wood_dark', box(wx - 0.05, y + 1.5, wz - 0.1, wx + 2.3, y + 1.6, wz + 1.2));
  for (const px of [wx, wx + 2.2]) bag.add('wood_dark', box(px, y, wz + 0.9, px + 0.1, y + 1.55, wz + 1.0));
  col.rect([wx, wz, wx + 2.2, wz + 0.7], y, y + 0.9);
  // jars and a rain tub
  for (let i = 0; i < 3; i++) {
    const jx = x1 - 1.3 - i * 0.55, jz = z0 + 1.1 + (i % 2) * 0.35;
    bag.add('pottery_dark', lathe([[0.001, 0], [0.16, 0], [0.3, 0.3], [0.26, 0.55], [0.16, 0.62], [0.001, 0.62]], 10, null, jx, y, jz));
    col.rect([jx - 0.28, jz - 0.28, jx + 0.28, jz + 0.28], y, y + 0.6);
  }
  if (el.kura) naraAzekura({ rect: [x1 - 7.5, z1 - 6.5, x1 - 2.5, z1 - 1.5], y, fl: 1.1, H: 2.4, seed: el.seed, tile: false, alongX: true }, ctx);
}

/**
 * nara_belltower { c: [x, z], y, half (the platform's half side, 4), seed }
 * The Shōrō: a stone platform, four posts of vermilion, tie beams, a hipped roof of tile, the great bell (bronze,
 * a tall waisted cylinder with a flat crown and a ring of studs) hung from the ridge, the striking log beside it.
 */
export function naraBelltower(el, ctx) {
  const { bag, col } = ctx;
  const [cx, cz] = el.c, y = el.y ?? 0, a = el.half ?? 4, pl = 1.0, H = 5.2, top = y + pl;
  bag.add('granite_block', box(cx - a - 0.8, y - 0.2, cz - a - 0.8, cx + a + 0.8, top, cz + a + 0.8));
  col.rect([cx - a - 0.8, cz - a - 0.8, cx + a + 0.8, cz + a + 0.8], y - 0.2, top);
  for (const s of [-1, 1]) {   // steps on the south side
    void s;
  }
  const run = 3.2;
  for (let i = 0; i < 5; i++) {
    const ya = y + (i + 1) * pl / 5, out = (5 - i) * run / 5;
    bag.add('granite_block', box(cx - 1.8, y, cz + a + 0.8, cx + 1.8, ya, cz + a + 0.8 + out));
    col.rect([cx - 1.8, cz + a + 0.8, cx + 1.8, cz + a + 0.8 + out], y, ya);
  }
  col.floor([cx - a - 0.8, cz - a - 0.8, cx + a + 0.8, cz + a + 0.8], top);
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    bag.add('granite_block', box(cx + sx * a - 0.55, top, cz + sz * a - 0.55, cx + sx * a + 0.55, top + 0.25, cz + sz * a + 0.55));
    bag.add('timber_red', box(cx + sx * a - 0.38, top + 0.25, cz + sz * a - 0.38, cx + sx * a + 0.38, top + H, cz + sz * a + 0.38));
    col.rect([cx + sx * a - 0.4, cz + sz * a - 0.4, cx + sx * a + 0.4, cz + sz * a + 0.4], top, top + H);
  }
  for (const s of [-1, 1]) {
    bag.add('timber_red', box(cx - a - 0.4, top + H - 0.6, cz + s * a - 0.25, cx + a + 0.4, top + H - 0.1, cz + s * a + 0.25));
    bag.add('timber_red', box(cx + s * a - 0.25, top + H - 0.6, cz - a - 0.4, cx + s * a + 0.25, top + H - 0.1, cz + a + 0.4));
    bag.add('timber_red', box(cx - a, top + 1.4, cz + s * a - 0.12, cx + a, top + 1.55, cz + s * a + 0.12));       // the low rails
  }
  // the roof: two gables crossing give the hip's look at this size; the tile roof lifted on a timber frame
  hipRoof({ c: [cx, cz], A: a + 1.9, B: a + 1.9, y: top + H, rise: 3.2, eaveSlope: 0.3, pow: 1.6, lift: 0.5, mat: 'tile_grey', soffit: 'timber_red', noChiwei: true, ridgeMat: 'tile_grey' }, ctx);
  if (el.simple) return;
  // the bell: from the cross beam, a waisted cylinder 2.7 m high, studs in a band, a crown with a dragon's loop
  const by = top + H - 0.6 - 2.9;
  // the bell's beam across the frame between the two side tie beams, and a lighter one over the log's cords
  bag.add('timber_red', box(cx - a - 0.4, top + H - 0.6, cz - 0.25, cx + a + 0.4, top + H - 0.1, cz + 0.25));
  bag.add('timber_red', box(cx - a - 0.4, top + H - 0.5, cz + 0.4, cx + a + 0.4, top + H - 0.1, cz + 0.7));
  bag.add('bronze', lathe([[0.001, 0], [0.62, 0], [0.7, 0.25], [0.66, 1.2], [0.58, 2.2], [0.5, 2.7], [0.3, 2.78], [0.001, 2.78]], 20, null, cx, by, cz));
  for (let k = 0; k < 4; k++) for (let j = 0; j < 12; j++) {
    const ang = j / 12 * Math.PI * 2 + k * 0.1, r = 0.6;
    bag.add('gilt_bronze', box(cx + Math.cos(ang) * r - 0.04, by + 1.5 + k * 0.17 - 0.04, cz + Math.sin(ang) * r - 0.04, cx + Math.cos(ang) * r + 0.04, by + 1.5 + k * 0.17 + 0.04, cz + Math.sin(ang) * r + 0.04));
  }
  bag.add('bronze', box(cx - 0.12, by + 2.78, cz - 0.12, cx + 0.12, top + H - 0.6, cz + 0.12));
  // the striking log: slung from two cords beside the bell, its end near the lip
  bag.add('timber', orientedBox([cx - a + 1.1, cz + 0.55], [cx + 0.9, cz + 0.55], 0.28, by + 0.9, by + 1.18));
  for (const px of [cx - a + 1.5, cx - 0.6]) bag.add('cloth_brown', box(px - 0.02, by + 1.18, cz + 0.5, px + 0.02, top + H - 0.6, cz + 0.6));
}

/**
 * nara_pole { at: [x, z], y, h (9), cloth, seed }
 * A banner pole of the temple court (the hoko of the great ceremonies): a tall pole of cypress on a stone foot, a gilt
 * finial, a long pennant of silk hanging from a crossbar.
 */
export function naraPole(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, h = el.h ?? 9, cl = el.cloth ?? 'cloth_red';
  bag.add('granite_block', box(x - 0.55, y, z - 0.55, x + 0.55, y + 0.5, z + 0.55));
  bag.add('timber', lathe([[0.001, 0], [0.18, 0], [0.14, h * 0.5], [0.09, h], [0.001, h]], 8, null, x, y + 0.5, z));
  col.rect([x - 0.5, z - 0.5, x + 0.5, z + 0.5], y, y + 0.5);
  bag.add('gilt_bronze', lathe([[0.001, 0], [0.12, 0], [0.12, 0.1], [0.2, 0.3], [0.08, 0.55], [0.001, 0.8]], 8, null, x, y + 0.5 + h, z));
  if (el.simple) return;
  bag.add('timber', box(x - 0.9, y + h - 0.6, z - 0.04, x + 0.9, y + h - 0.5, z + 0.04));
  bag.add(cl, box(x - 0.85, y + h - 5.6, z - 0.015, x - 0.1, y + h - 0.5, z + 0.015));
  bag.add(cl === 'cloth_red' ? 'cloth_green' : 'cloth_red', box(x + 0.1, y + h - 5.0, z - 0.015, x + 0.85, y + h - 0.5, z + 0.015));
  bag.add('gilt_bronze', box(x - 0.9, y + h - 5.7, z - 0.03, x - 0.05, y + h - 5.6, z + 0.03));
}

/**
 * nara_rake { rect, y, dir ('x' | 'z'), gap (0.6), seed }
 * Raked white gravel: ridges 0.1 m wide and 4 cm high along dir, one gap apart, broken by a stone or two.
 */
export function naraRake(el, { bag }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, gap = el.gap ?? 0.6, rand = rng(el.seed ?? 11);
  const alongX = (el.dir ?? 'x') === 'x', n = Math.floor((alongX ? z1 - z0 : x1 - x0) / gap);
  for (let i = 1; i < n; i++) {
    const t = (alongX ? z0 : x0) + i * gap;
    if (alongX) bag.add('pebbles', box(x0, y, t - 0.05, x1, y + 0.045, t + 0.05)); else bag.add('pebbles', box(t - 0.05, y, z0, t + 0.05, y + 0.045, z1));
  }
  void rand;
}

/**
 * nara_gutter { rect } — a street's side gutters: a channel 0.5 m wide of dark pebbles between two kerbs of granite, 1 m in from
 * each long edge, ending 5.5 m short of the crossings.
 */
export function naraGutter(el, { bag }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, alongX = x1 - x0 >= z1 - z0, e = 5.5;
  const a0 = (alongX ? x0 : z0) + e, a1 = (alongX ? x1 : z1) - e;
  if (a1 - a0 < 8) return;
  for (const t of [(alongX ? z0 : x0) + 1.2, (alongX ? z1 : x1) - 1.2]) {
    for (const [d0, d1, h, m] of [[-0.3, 0.3, 0.03, 'bluestone'], [-0.38, -0.3, 0.12, 'granite_block'], [0.3, 0.38, 0.12, 'granite_block']]) {
      if (alongX) bag.add(m, box(a0, y, t + d0, a1, y + h, t + d1)); else bag.add(m, box(t + d0, y, a0, t + d1, y + h, a1));
    }
  }
}

export const yardElements = { nara_rake: naraRake, nara_gutter: naraGutter, nara_azekura: naraAzekura, nara_fence: naraFence, nara_garden: naraGarden, nara_belltower: naraBelltower, nara_pole: naraPole };
