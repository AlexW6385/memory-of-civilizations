// The temple and palace furnishing of Ayutthaya (docs/settlements/ayutthaya.md §4, §12): the crenellated compound wall of the wat, the
// court's brick ways with its boundary stones (sema), pennants, offering tables and candle stands; the painted band, hanging lamps, the
// preacher's seat, offerings and rows of small images inside the halls; the throne under its nine-tiered umbrella; the palace gate with its
// tiered roof; the palace court's way and rows of palms; the floating shop on its raft.

import { box, lathe, rod, fromTriangles } from '../../core/geom.js';
import { rectRoof } from '../ming/index.js';
import { wallSeg } from '../ptolemaic/util.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const norm = (r) => [Math.min(r[0], r[2]), Math.min(r[1], r[3]), Math.max(r[0], r[2]), Math.max(r[1], r[3])];

/** A small seated gilded image, cheap: throne, body and head in two lathes. */
export function lite(bag, x, y, z, yaw, s = 1, mat = 'gold') {
  const g1 = lathe([[0.55, 0], [0.55, 0.14], [0.42, 0.2], [0.5, 0.34], [0.38, 0.5], [0.3, 0.9], [0.001, 0.92]], 8, null, 0, 0, 0).scale(s, s, s * 0.7);
  const g2 = lathe([[0.001, 0.86], [0.18, 0.92], [0.2, 1.1], [0.14, 1.24], [0.06, 1.36], [0.001, 1.42]], 8, null, 0, 0, 0).scale(s, s, s);
  for (const g of [g1, g2]) { g.rotateY(yaw); g.translate(x, y, z); bag.add(mat, g); }
}

/**
 * wat_wall: { a, b, th, h, ops } — the compound's wall, whitewashed, a coping with a row of leaf-shaped crenels (the wall had battlements),
 * the foot dark with damp, streaks under the coping; openings as in `wall`.
 */
function watWall(el, ctx) {
  const { bag } = ctx, { a, b } = el, th = el.th ?? 1.1, h = el.h ?? 3.6, ops = el.ops ?? [];
  wallSeg(ctx, a, b, th, 0, h, 'plaster_white', ops);
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L, nx = -uz, nz = ux;
  const inOp = (s) => ops.some((o) => s > o.at - o.w / 2 - 0.4 && s < o.at + o.w / 2 + 0.4);
  // the damp band at the foot (both faces) and the coping's streaks
  for (const side of [-1, 1]) {
    const ox = nx * side * (th / 2 + 0.01), oz = nz * side * (th / 2 + 0.01);
    const p = [a[0] + ox, a[1] + oz], q = [b[0] + ox, b[1] + oz];
    const g = box(-L / 2, 0, -0.01, L / 2, 0.7, 0.01); g.rotateY(-Math.atan2(uz, ux)); g.translate((p[0] + q[0]) / 2, 0, (p[1] + q[1]) / 2);
    bag.add('plaster_damp', g);
  }
  // the crenels: small leaf-shaped merlons every 1.4 m along the coping, an instanced-style repeat merged by the tile
  const yaw = -Math.atan2(uz, ux);
  for (let s = 0.7; s < L - 0.5; s += 1.4) {
    if (inOp(s)) continue;
    const x = a[0] + ux * s, z = a[1] + uz * s;
    const g = lathe([[0.42, 0], [0.4, 0.28], [0.22, 0.52], [0.001, 0.66]], 4, null, 0, 0, 0).rotateY(Math.PI / 4).scale(1, 1, th * 0.5 / 0.42);
    g.rotateY(yaw); g.translate(x, h, z); bag.add('plaster_white', g);
  }
  const g = box(-L / 2, 0, -th / 2 - 0.08, L / 2, 0.14, th / 2 + 0.08); g.rotateY(yaw); g.translate((a[0] + b[0]) / 2, h, (a[1] + b[1]) / 2); bag.add('lime_plaster', g);
}

/**
 * wat_court: { paths [rect], sema [rect (a hall)], flags [[x, z]], tables [[x, z, rot]], candles [[x, z]], y } — the ways of brick laid in the earth, the
 * eight boundary stones round the ordination hall in their little plastered bases, tall pennants of white cloth on bamboo, the offering tables
 * with their lotus and incense, candle stands before the images.
 */
function watCourt(el, ctx) {
  const { bag, col } = ctx, rand = rng(el.seed ?? 5), y = el.y ?? 0;
  for (const r of el.paths ?? []) {
    const [x0, z0, x1, z1] = norm(r);
    bag.add('brick_paving', box(x0, y, z0, x1, y + 0.05, z1));
    bag.add('laterite', box(x0 - 0.12, y, z0 - 0.12, x0, y + 0.07, z1 + 0.12)); bag.add('laterite', box(x1, y, z0 - 0.12, x1 + 0.12, y + 0.07, z1 + 0.12));
  }
  for (const h of el.sema ?? []) {
    const [x0, z0, x1, z1] = norm(h), m = 2.6, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
    for (const [x, z] of [[x0 - m, z0 - m], [cx, z0 - m], [x1 + m, z0 - m], [x0 - m, cz], [x1 + m, cz], [x0 - m, z1 + m], [cx, z1 + m], [x1 + m, z1 + m]]) {
      bag.add('lime_plaster', box(x - 0.55, y, z - 0.55, x + 0.55, y + 0.45, z + 0.55)); bag.add('plaster_white', box(x - 0.45, y + 0.45, z - 0.45, x + 0.45, y + 0.6, z + 0.45));
      const g = lathe([[0.4, 0], [0.38, 0.5], [0.2, 0.95], [0.001, 1.15]], 4, null, 0, 0, 0).rotateY(Math.PI / 4).scale(1, 1, 0.22); g.translate(x, y + 0.6, z); bag.add('limestone', g);
      bag.add('gold', box(x - 0.03, y + 1.0, z - 0.06, x + 0.03, y + 1.16, z + 0.06));
      col.rect([x - 0.55, z - 0.55, x + 0.55, z + 0.55], y, y + 1.7);
    }
  }
  let k = 0;
  for (const [x, z] of el.flags ?? []) {
    bag.add('bamboo_culm', lathe([[0.06, 0], [0.035, 9]], 5, null, x, y, z)); col.circle(x, z, 0.1, y, y + 3);
    // a tung: a long pennant hung from a crossbar at the pole's head, its face to the court (north-south), waving a little along the wind, a swallow-tail at the foot
    const mat = k % 3 === 1 ? 'cloth_red' : k % 3 === 2 ? 'cloth_white' : 'cloth_ochre', top = y + 8.6, len = 4.2, w0 = 0.62, n = 7, ph = rand() * 6.28, t = [];
    bag.add('bamboo_culm', rod([x, top, z], [x + w0 + 0.1, top, z], 0.025, 5));
    const pt = (i, side) => { const f = i / n, wx = w0 * (1 - 0.55 * f), px = x + 0.05 + (side ? wx : 0) + Math.sin(f * 4 + ph) * 0.08 * f; return [px, top - f * len, z + 0.03 + Math.sin(f * 5 + ph) * 0.22 * f]; };
    for (let i = 0; i < n; i++) { const a = pt(i, 0), b = pt(i, 1), c = pt(i + 1, 1), d = pt(i + 1, 0); t.push(...a, ...b, ...c, ...a, ...c, ...d, ...a, ...c, ...b, ...a, ...d, ...c); }
    const L = pt(n, 0), R = pt(n, 1), M = [(L[0] + R[0]) / 2, L[1] + 0.35, (L[2] + R[2]) / 2]; t.push(...L, ...R, ...M, ...L, ...M, ...R);
    bag.add(mat, fromTriangles(t));
    k++;
  }
  for (const [x, z, rot] of el.tables ?? []) {
    const g = [];
    g.push(['timber_red', box(-0.7, 0.55, -0.35, 0.7, 0.62, 0.35)]);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.push(['timber_red', box(sx * 0.62 - 0.04, 0, sz * 0.28 - 0.04, sx * 0.62 + 0.04, 0.55, sz * 0.28 + 0.04)]);
    for (const dx of [-0.4, 0, 0.4]) { g.push(['gold', lathe([[0.001, 0.62], [0.1, 0.62], [0.12, 0.72], [0.001, 0.72]], 8, null, dx, 0, 0)]); g.push(['stucco_rose', lathe([[0.001, 0.72], [0.08, 0.76], [0.06, 0.86], [0.001, 0.9]], 7, null, dx, 0, 0)]); }
    g.push(['flame', lathe([[0.001, 0.62], [0.012, 0.8], [0.001, 0.86]], 4, null, 0.58, 0, 0.2)]);
    for (const [m, gg] of g) { gg.rotateY(rot ?? 0); gg.translate(x, y, z); bag.add(m, gg); }
    col.circle(x, z, 0.8, y, y + 0.9);
  }
  for (const [x, z] of el.candles ?? []) {
    bag.add('bronze', lathe([[0.2, 0], [0.12, 0.05], [0.04, 0.3], [0.04, 0.9], [0.25, 1.0], [0.25, 1.06]], 8, null, x, y, z));
    for (let k = 0; k < 5; k++) { const a = k / 5 * 6.28, px = x + Math.cos(a) * 0.17, pz = z + Math.sin(a) * 0.17; bag.add('cloth_white', lathe([[0.025, 1.06], [0.025, 1.24]], 5, null, px, y, pz)); bag.add('flame', lathe([[0.001, 1.24], [0.012, 1.28], [0.001, 1.34]], 4, null, px, y, pz)); }
    col.circle(x, z, 0.28, y, y + 1.3);
  }
}

/** Inside a hall (called by `wihan`): the painted band on the cella's walls, hanging lamps, mats and offerings before the dais, the preacher's seat, small images along the foot of the walls. */
export function wihanInterior(ctx, o) {
  const { bag, col } = ctx, { cx0, cx1, cz0, cz1, f, wallH, east, dxm, dzm, throne } = o, rand = rng(o.seed ?? 3);
  const len = cx1 - cx0;
  // the painted band: panels of ochre bordered in red with a gilt line, a row of standing figures (stripes) in each
  for (const zz of [cz0 + 0.46, cz1 - 0.46]) {
    const s = zz < (cz0 + cz1) / 2 ? 1 : -1;
    for (let x = cx0 + 0.6; x < cx1 - 1.6; x += 2.2) {
      bag.add('paint_ochre', box(x, f + 0.5, zz, x + 2.0, f + 2.9, zz + s * 0.03));
      bag.add('paint_robe', box(x + 0.25, f + 0.9, zz + s * 0.03, x + 0.5, f + 2.3, zz + s * 0.045)); bag.add('paint_blue', box(x + 0.85, f + 0.9, zz + s * 0.03, x + 1.1, f + 2.3, zz + s * 0.045)); bag.add('paint_robe', box(x + 1.45, f + 0.9, zz + s * 0.03, x + 1.7, f + 2.3, zz + s * 0.045));
      bag.add('gold', box(x, f + 2.9, zz, x + 2.0, f + 2.96, zz + s * 0.04));
    }
  }
  // hanging lamps along the nave
  for (let x = cx0 + 3; x < cx1 - 2; x += 5) for (const z of [dzm - 2.2, dzm + 2.2]) {
    bag.add('timber', rod([x, f + wallH - 0.2, z], [x, f + wallH - 1.2, z], 0.012, 3));
    bag.add('lamp_glass', lathe([[0.001, 0], [0.16, 0.04], [0.2, 0.2], [0.12, 0.4], [0.001, 0.46]], 8, null, x, f + wallH - 1.65, z));
    bag.add('gold', lathe([[0.1, 0], [0.001, 0.12]], 6, null, x, f + wallH - 1.2, z));
  }
  // mats in rows before the dais, the monks' seats to the side, offerings
  const sg = east ? 1 : -1, ux0 = dxm + sg * 3.4;
  for (let r = 0; r < 4; r++) for (const z of [dzm - 2.4, dzm, dzm + 2.4]) bag.add(r % 2 ? 'cloth_maroon' : 'reed_mat', box(Math.min(ux0 + sg * r * 1.2, ux0 + sg * (r * 1.2 + 0.9)), f + 0.01, z - 0.9, Math.max(ux0 + sg * r * 1.2, ux0 + sg * (r * 1.2 + 0.9)), f + 0.03, z + 0.9));
  { const x = dxm + sg * 2.6; bag.add('timber_red', box(x - 0.45, f, dzm - 3.6, x + 0.45, f + 0.5, dzm - 2.7)); bag.add('clay_gilt', box(x - 0.5, f + 0.5, dzm - 3.65, x + 0.5, f + 0.56, dzm - 2.65)); bag.add('cloth_ochre', box(x - 0.3, f + 0.56, dzm - 3.5, x + 0.3, f + 0.62, dzm - 2.8)); col.rect([x - 0.5, dzm - 3.65, x + 0.5, dzm - 2.65], f, f + 0.6); }
  for (const z of [dzm - 1.2, dzm + 1.2]) {
    const x = dxm + sg * 2.6; bag.add('timber_red', box(x - 0.3, f, z - 0.4, x + 0.3, f + 0.7, z + 0.4)); bag.add('gold', lathe([[0.001, 0.7], [0.14, 0.7], [0.16, 0.8], [0.001, 0.8]], 8, null, x, f, z)); bag.add('stucco_rose', lathe([[0.001, 0.8], [0.1, 0.84], [0.08, 0.98], [0.001, 1.04]], 7, null, x, f, z));
    bag.add('flame', lathe([[0.001, 0.7], [0.012, 0.76], [0.001, 0.82]], 4, null, x + 0.15, f, z + 0.28)); col.rect([x - 0.3, z - 0.4, x + 0.3, z + 0.4], f, f + 0.8);
  }
  // small gilded images along the foot of both walls (merit gifts), facing the nave
  for (const [zz, face] of [[cz0 + 0.95, 0], [cz1 - 0.95, Math.PI]]) for (let x = cx0 + 1.2; x < cx1 - 1.5; x += 1.8) lite(bag, x, f, zz, face, 0.55);
  if (throne) {
    // the throne under the nine-tiered umbrella: three gilt steps, the seat, the great umbrella hung from the ceiling
    const x = dxm, z = dzm, d = sg;
    for (let i = 0; i < 3; i++) bag.add(i % 2 ? 'timber_red' : 'clay_gilt', box(x - 2.0 + i * 0.35, f + 1.15 + i * 0.35, z - 1.8 + i * 0.3, x + 2.0 - i * 0.35, f + 1.5 + i * 0.35, z + 1.8 - i * 0.3));
    for (let i = 0; i < 9; i++) bag.add(i % 2 ? 'gold' : 'clay_gilt', lathe([[1.1 - i * 0.1, 0], [0.9 - i * 0.1, 0.1], [0.001, 0.22]], 12, null, x - d * 0.2, f + wallH - 3.2 + i * 0.22, z));
    bag.add('timber', rod([x - d * 0.2, f + wallH - 1.2, z], [x - d * 0.2, f + wallH, z], 0.04, 4));
    bag.add('gold', lathe([[0.001, 0], [0.12, 0.05], [0.001, 0.5]], 8, null, x - d * 0.2, f + wallH - 3.2 + 9 * 0.22, z));
    for (const s of [-1, 1]) { bag.add('clay_gilt', lathe([[0.25, 0], [0.15, 0.1], [0.07, 0.5], [0.07, 1.4], [0.25, 1.5], [0.001, 1.8]], 8, null, x + d * 1.2, f + 1.15, z + s * 2.5)); col.circle(x + d * 1.2, z + s * 2.5, 0.28, f, f + 1.8); }
  }
}

/** palace_gate: { c [x, z], dir ('w' the court lies west of it), open (width) } — two brick pylons with a three-tiered tiled roof over the way, a gilt finial, lanterns. */
function palaceGate(el, ctx) {
  const { bag, col } = ctx, [cx, cz] = el.c, o = el.open ?? 4, hh = 5.8, a = 3.6, d = el.dir === 'w' ? 1 : 1;
  void d;
  const P = (z0, z1) => { bag.add('plaster_white', box(cx - a, 0, z0, cx + a, hh, z1)); bag.add('brick_baked', box(cx - a - 0.15, 0, z0 - 0.15, cx + a + 0.15, 0.7, z1 + 0.15)); bag.add('plaster_damp', box(cx - a - 0.17, 0.7, z0 - 0.17, cx + a + 0.17, 0.74, z1 + 0.17)); col.rect([cx - a, z0, cx + a, z1], 0, hh); };
  P(cz - o / 2 - 4, cz - o / 2); P(cz + o / 2, cz + o / 2 + 4);
  bag.add('timber_red', box(cx - a, hh - 0.9, cz - o / 2, cx + a, hh, cz + o / 2)); bag.add('clay_gilt', box(cx - a - 0.05, hh - 0.1, cz - o / 2 - 0.2, cx + a + 0.05, hh + 0.1, cz + o / 2 + 0.2)); col.rect([cx - a, cz - o / 2, cx + a, cz + o / 2], hh - 0.9, hh);
  let w = o / 2 + 4.8, dd = a + 1.4, y = hh + 0.1;
  for (let i = 0; i < 3; i++) {
    rectRoof({ c: [cx, cz], A: w, B: dd, y, rise: 1.5 - i * 0.2, kind: 'hip', sweep: 0, curl: false, p: 1.05, mat: 'roof_tile', soffit: 'timber_red' }, bag);
    if (i < 2) { bag.add('plaster_white', box(cx - dd * 0.55, y + 1.2 - i * 0.2, cz - w * 0.55, cx + dd * 0.55, y + 1.8, cz + w * 0.55)); }
    y += 1.9 - i * 0.2; w *= 0.62; dd *= 0.62;
  }
  bag.add('gold', lathe([[0.1, 0], [0.04, 1.0], [0.001, 1.7]], 6, null, cx, y - 0.4, cz));
  for (const s of [-1, 1]) { const z = cz + s * (o / 2 + 0.1); bag.add('lamp_paper', lathe([[0.001, 0], [0.14, 0.05], [0.17, 0.2], [0.12, 0.36], [0.001, 0.4]], 8, null, cx - a - 0.1, hh - 2.0, z)); bag.add('lamp_paper', lathe([[0.001, 0], [0.14, 0.05], [0.17, 0.2], [0.12, 0.36], [0.001, 0.4]], 8, null, cx + a + 0.1, hh - 2.0, z)); }
}

/**
 * court_way: { paths [rect], palms [[x, z]], stands [[x, z]] } — the palace court: paved ways edged in laterite, rows of palms along them, the
 * brass stands of the royal umbrellas, a low brick edge to the lawns.
 */
function courtWay(el, ctx) {
  const { bag, col } = ctx;
  for (const r of el.paths ?? []) { const [x0, z0, x1, z1] = norm(r); bag.add('brick_paving', box(x0, 0, z0, x1, 0.05, z1)); bag.add('laterite', box(x0 - 0.15, 0, z0 - 0.15, x0, 0.12, z1 + 0.15)); bag.add('laterite', box(x1, 0, z0 - 0.15, x1 + 0.15, 0.12, z1 + 0.15)); }
  for (const [x, z] of el.stands ?? []) {
    bag.add('bronze', lathe([[0.3, 0], [0.18, 0.1], [0.06, 0.4], [0.05, 2.3]], 8, null, x, 0, z));
    for (let i = 0; i < 5; i++) bag.add(i % 2 ? 'gold' : 'clay_gilt', lathe([[0.55 - i * 0.07, 0], [0.001, 0.12]], 10, null, x, 2.3 + i * 0.13, z));
    col.circle(x, z, 0.3, 0, 2.4);
  }
}

/** floating_shop: { c, rot, y, w, d, seed, goods } — a raft carrying an open shop under a hipped roof: counter, goods, a hanging sign, steps at the water. */
function floatingShop(el, ctx) {
  const { bag, col } = ctx, [cx, cz] = el.c, y = el.y ?? -0.8, w = el.w ?? 4.4, d = el.d ?? 5.2, rot = el.rot ?? 0, rand = rng(el.seed ?? 1), deck = y + 0.28, hw = w / 2, hd = d / 2;
  const parts = [], add = (m, g) => parts.push([m, g]);
  for (let i = 0; i < 7; i++) add('bamboo_culm', rod([-hw + (i + 0.5) * w / 7, y - 0.28, -hd], [-hw + (i + 0.5) * w / 7, y - 0.28, hd], 0.17, 6));
  add('timber', box(-hw - 0.1, y - 0.12, -hd - 0.1, hw + 0.1, deck, hd + 0.1));
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) add('timber', lathe([[0.07, 0], [0.07, 2.4]], 5, null, sx * (hw - 0.1), deck, sz * (hd - 0.1)));
  add('timber', box(-hw, deck + 2.2, -hd, hw, deck + 2.4, hd));
  add('timber', box(-hw + 0.2, deck, hd - 0.7, hw - 0.2, deck + 0.9, hd - 0.3)); add('planks_grey', box(-hw + 0.15, deck + 0.9, hd - 0.75, hw - 0.15, deck + 0.95, hd - 0.25));
  for (let u = -hw + 0.5; u < hw - 0.4; u += 0.5) { const r = rand(); add(r < 0.35 ? 'glaze_yellow' : r < 0.6 ? 'terracotta' : r < 0.8 ? 'wicker' : 'cloth_green', lathe([[0.001, 0], [0.16, 0], [0.2, 0.14], [0.14, 0.28], [0.001, 0.3]], 7, null, u, deck + 0.95, hd - 0.5)); }
  for (let u = -hw + 0.6; u < hw - 0.4; u += 0.45) { const h = 0.4 + rand() * 0.5; add('rope_fibre', rod([u, deck + 2.2, hd - 1.2], [u, deck + 2.2 - h, hd - 1.2], 0.006, 3)); add(rand() < 0.5 ? 'silver' : 'wicker', lathe([[0.001, 0], [0.08, 0.02], [0.1, 0.16], [0.001, 0.2]], 6, null, u, deck + 2.2 - h - 0.2, hd - 1.2)); }
  add('reed_mat', box(-hw + 0.1, deck, -hd + 0.1, -hw + 1.0, deck + 0.02, -hd + 1.9)); add('cloth_white', box(-hw + 0.3, deck + 0.02, -hd + 0.2, -hw + 0.7, deck + 0.14, -hd + 0.5));
  add('terracotta', lathe([[0.001, 0], [0.2, 0.02], [0.3, 0.22], [0.22, 0.5], [0.001, 0.55]], 8, null, hw - 0.6, deck, -hd + 0.6));
  add('timber', rod([hw - 0.1, deck + 2.3, hd - 0.1], [hw + 0.9, deck + 2.3, hd - 0.1], 0.025, 4)); add('cloth_red', box(hw + 0.1, deck + 1.1, hd - 0.12, hw + 0.8, deck + 2.3, hd - 0.08));
  for (const [m, g] of parts) { g.rotateY(rot); g.translate(cx, 0, cz); bag.add(m, g); }
  const c = Math.cos(rot), s = Math.sin(rot);
  rectRoof({ c: [cx, cz], A: (Math.abs(w * c) + Math.abs(d * s)) / 2 + 0.6, B: (Math.abs(w * s) + Math.abs(d * c)) / 2 + 0.6, y: deck + 2.4, rise: 1.0, kind: 'hip', sweep: 0, curl: false, p: 1.05, mat: rand() < 0.5 ? 'thatch_palm' : 'roof_tile', soffit: 'thatch_palm' }, bag);
  const pts = [[-hw, -hd], [hw, -hd], [hw, hd], [-hw, hd]].map(([a, b]) => [cx + a * c + b * s, cz - a * s + b * c]);
  col.rect([Math.min(...pts.map((p) => p[0])), Math.min(...pts.map((p) => p[1])), Math.max(...pts.map((p) => p[0])), Math.max(...pts.map((p) => p[1]))], y - 1, y + 4);
}

export const WAT_ELEMENTS = { wat_wall: watWall, wat_court: watCourt, palace_gate: palaceGate, court_way: courtWay, floating_shop: floatingShop };
