// The street fronts of Nasrid Granada about 1390 (docs/settlements/granada.md §14): the whitewashed lane fronts of the
// medina and the Albaicín dressed at eye level — masonry benches by the doors, iron lamp brackets, pots of basil and
// carnations on wall brackets, big storage jars, washing on poles, firewood, a trained vine — the walled huertas that fill
// the medina's empty lots (orange trees, a well), and the Darro's quays (washing lines, wash-stones, nets on frames,
// benches). Everything is merged geometry in the bag, built from the layout's data; small pieces are detail.

import { box, lathe, rod, clothBox, addCloth } from '../../core/geom.js';
import { holedWall, archHead, face } from './halls.js';
import { isShop } from './houses.js';

const LW = 'limewash_white';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const CLOTHS = ['cloth_white', 'cloth_white', 'cloth_indigo', 'cloth_ochre', 'cloth_red', 'cloth_brown'];

/** A pot on a bracket or the ground: a terracotta or blue-glazed pot with a clump of green (and flowers) at (x, y, z). */
function pot(bag, x, y, z, r, rand, bloom = true) {
  const glaze = rand() < 0.45;
  bag.add(glaze ? 'glaze_blue' : 'terracotta', lathe([[r * 0.6, 0], [r, r * 0.9], [r * 1.05, r * 1.7], [r * 0.85, r * 1.9], [0.001, r * 1.9]], 8, null, x, y, z));
  bag.add('doum_leaf', lathe([[0.001, r * 1.7], [r * 1.5, r * 2.2], [r * 1.35, r * 3.0], [r * 0.7, r * 3.6], [0.001, r * 3.7]], 7, null, x, y, z));
  if (bloom && rand() < 0.7) bag.add(rand() < 0.6 ? 'cloth_red' : 'cloth_white', lathe([[0.001, r * 3.3], [r * 0.9, r * 3.5], [r * 0.6, r * 3.9], [0.001, r * 4.0]], 6, null, x + (rand() - 0.5) * r * 0.6, y, z));
}
/** A big storage jar (tinaja) of terracotta. */
function jar(bag, x, y, z, s) {
  bag.add('terracotta', lathe([[0.001, 0], [0.16 * s, 0.01], [0.27 * s, 0.25 * s], [0.31 * s, 0.5 * s], [0.25 * s, 0.7 * s], [0.14 * s, 0.82 * s], [0.17 * s, 0.9 * s], [0.001, 0.9 * s]], 10, null, x, y, z));
}
/** A small orange tree (trunk, limbs, round crown, fruit) at (x, y, z). */
export function orange(bag, x, y, z, s, rand) {
  const h = 1.5 * s, cr = 1.15 * s;
  bag.add('bark_olive', rod([x, y - 0.05, z], [x, y + h, z], 0.08 * s, 6));
  for (let k = 0; k < 3; k++) { const a = k * 2.1 + rand(), L = 0.6 * s; bag.add('bark_olive', rod([x, y + h - 0.1, z], [x + Math.cos(a) * L, y + h + 0.5 * s, z + Math.sin(a) * L], 0.04 * s, 5)); }
  const p = rand() * 6;
  bag.add('doum_leaf', lathe([[0.001, 0], [cr * 0.6, 0.08 * s], [cr * 0.9, 0.3 * s], [cr, 0.65 * s], [cr * 0.95, 1.0 * s], [cr * 0.75, 1.3 * s], [cr * 0.45, 1.55 * s], [0.001, 1.7 * s]], 12, (th) => 1 + 0.09 * Math.sin(th * 3 + p) + 0.05 * Math.sin(th * 7 + p * 2), x, y + h - 0.35 * s, z));
  for (let k = 0; k < 6; k++) { const a = rand() * Math.PI * 2, v = 0.2 + rand() * 0.9, rr = cr * (0.95 - Math.abs(v - 0.6) * 0.4); bag.add('glaze_yellow', box(x + Math.cos(a) * rr - 0.04, y + h - 0.3 * s + v * s - 0.04, z + Math.sin(a) * rr - 0.04, x + Math.cos(a) * rr + 0.04, y + h - 0.3 * s + v * s + 0.04, z + Math.sin(a) * rr + 0.04)); }
}

/**
 * lane_dress: { lots: [{ rect, y, front ('n' | 's'), seed, storeys, kind ('med' | 'patio') }] } — the fronts of the houses
 * on the lanes, dressed at eye level. The door of a medina house stands at its front's middle bay and a patio house's
 * passage at x0 + 1.5; the dressing keeps clear of both.
 */
function laneDress(el, { bag, col }) {
  for (const lot of el.lots) {
    const [x0, z0, x1, z1] = lot.rect, y = lot.y, rand = rng(lot.seed + 77), s = lot.front === 's', zf = s ? z1 : z0, n = s ? 1 : -1;
    const L = x1 - x0, bays = Math.max(1, Math.round(L / 3.6)), dc = Math.floor(bays / 2), du = (dc + 0.5) * L / bays;
    const dx = lot.kind === 'patio' ? x0 + 2.05 : s ? x1 - du : x0 + du;      // the door's centre
    const clear = (x, w) => Math.abs(x - dx) > w + (lot.kind === 'patio' ? 0.9 : 0.8) && x > x0 + 0.35 + w && x < x1 - 0.35 - w;
    const Z = (d) => zf + n * d, zb = (d0, d1) => [Math.min(Z(d0), Z(d1)), Math.max(Z(d0), Z(d1))];
    const bx = (mat, xa, ya, da, xb, yb, db) => { const [za, zc] = zb(da, db); bag.add(mat, box(xa, ya, za, xb, yb, zc)); };
    const cr = (xa, xb, d1, h) => { const [za, zc] = zb(0, d1); col.rect([xa, za, xb, zc], y, y + h); };
    const shop = lot.kind === 'med' && lot.enterable && isShop(lot.seed);
    if (shop) {
      // the shop's front: a cloth awning on two poles over the door, a counter beside it with the goods (the sign hangs on the other side)
      const sd = s ? -1 : 1, cxm = dx - sd * 1.7;
      { const [az0, az1] = zb(0.04, 1.0); addCloth(bag, ['cloth_red', 'cloth_indigo', 'cloth_ochre'][lot.seed % 3], clothBox(dx - 1.15, y + 2.55, az0, dx + 1.15, y + 2.8, az1, 0.25), y + 2.8); }
      for (const u of [-1.1, 1.1]) bag.add('timber', rod([dx + u, y, Z(0.98)], [dx + u, y + 2.75, Z(0.98)], 0.035, 5));
      bx(LW, cxm - 0.8, y, 0.05, cxm + 0.8, y + 0.85, 0.55); bx('limestone', cxm - 0.83, y + 0.85, 0.03, cxm + 0.83, y + 0.9, 0.58); cr(cxm - 0.83, cxm + 0.83, 0.58, 0.9);
      for (let i = 0; i < 4; i++) { const gx = cxm - 0.6 + i * 0.4; if (i % 2) pot(bag, gx, y + 0.9, Z(0.3), 0.09, rand, false); else bx(CLOTHS[(lot.seed + i) % 6], gx - 0.16, y + 0.9, 0.15, gx + 0.16, y + 1.08, 0.45); }
    }
    // a masonry bench (mastaba) by the door, with a folded rug on it now and then
    if (!shop && rand() < 0.55) {
      const side = rand() < 0.5 ? -1 : 1, bw = 1.5, xa = dx + side * (0.95 + bw / 2) - bw / 2;
      if (xa > x0 + 0.3 && xa + bw < x1 - 0.3) { bx(LW, xa, y, 0.01, xa + bw, y + 0.46, 0.4); bx('limestone', xa - 0.02, y + 0.46, 0.01, xa + bw + 0.02, y + 0.5, 0.42); cr(xa, xa + bw, 0.42, 0.5); if (rand() < 0.5) bx(CLOTHS[Math.floor(rand() * 4) + 2], xa + 0.2, y + 0.5, 0.06, xa + 0.8, y + 0.56, 0.36); }
    }
    // the iron lamp on its bracket beside the door
    if (!shop) { const x = dx + (rand() < 0.5 ? -1 : 1) * 0.85, [za] = zb(0.02, 0.4); void za;
      bag.add('iron', rod([x, y + 2.55, Z(0.01)], [x, y + 2.55, Z(0.38)], 0.012, 4)); bag.add('iron', rod([x, y + 2.55, Z(0.38)], [x, y + 2.3, Z(0.38)], 0.01, 4));
      bag.add('lamp_glass', lathe([[0.001, 0], [0.06, 0.02], [0.09, 0.12], [0.06, 0.2], [0.001, 0.22]], 8, null, x, y + 2.1, Z(0.38))); }
    // pots on brackets along the front, at the height of a hand reaching from a window; one row, now and then two
    { const k = 2 + Math.floor(rand() * 3); for (let i = 0; i < k; i++) {
        const x = x0 + 0.7 + rand() * (L - 1.4); if (!clear(x, 0.2)) continue; const yy = y + 1.5 + (rand() < 0.35 ? 0.75 : 0);
        bx('iron', x - 0.1, yy - 0.025, 0.0, x + 0.1, yy, 0.24); pot(bag, x, yy, Z(0.12), 0.1, rand);
      } }
    // two big jars against the wall, or a basket of goods and a stack of firewood
    const r = rand();
    if (r < 0.4) { const x = x0 + 0.6 + rand() * (L - 1.2); if (clear(x, 0.45)) { jar(bag, x, y, Z(0.4), 1); jar(bag, x + 0.55, y, Z(0.36), 0.8); cr(x - 0.3, x + 0.85, 0.75, 0.9); } }
    else if (r < 0.62) { const x = x0 + 0.6 + rand() * (L - 1.2); if (clear(x, 0.5)) { for (let j = 0; j < 3; j++) for (let i = 0; i < 4 - j; i++) bag.add('timber', rod([x - 0.45 + i * 0.22 + j * 0.11, y + 0.1 + j * 0.2, Z(0.15)], [x - 0.45 + i * 0.22 + j * 0.11, y + 0.1 + j * 0.2, Z(0.5)], 0.09, 5)); cr(x - 0.55, x + 0.55, 0.6, 0.6); } }
    else if (r < 0.8) { const x = x0 + 0.6 + rand() * (L - 1.2); if (clear(x, 0.4)) { bag.add('wicker', lathe([[0.2, 0], [0.32, 0.4], [0.3, 0.42], [0.001, 0.42]], 10, null, x, y, Z(0.4))); bag.add(rand() < 0.5 ? 'cloth_ochre' : 'cloth_green', lathe([[0.001, 0.38], [0.28, 0.44], [0.001, 0.62]], 8, null, x, y, Z(0.4))); cr(x - 0.34, x + 0.34, 0.75, 0.45); } }
    // washing on a pole from an upper window
    if (lot.storeys > 1 && rand() < 0.38) {
      const x = x0 + 1.2 + rand() * (L - 2.4), top = y + 3.35;
      if (clear(x, 0.6)) { bag.add('timber', rod([x - 0.7, top, Z(0.03)], [x + 0.7, top, Z(0.95)], 0.025, 4)); bag.add('timber', rod([x - 0.7, top - 0.05, Z(0.03)], [x - 0.7, top + 0.1, Z(0.03)], 0.03, 4));
        for (let i = 0; i < 2; i++) { const t = 0.25 + i * 0.45, cx = x - 0.7 + 1.4 * t, d = 0.03 + 0.92 * t; addCloth(bag, CLOTHS[Math.floor(rand() * CLOTHS.length)], clothBox(cx - 0.22, top - 0.95 - rand() * 0.2, Z(d) - 0.01, cx + 0.22, top - 0.03, Z(d) + 0.01, 0.2), top - 0.03); } }
    }
    // a vine trained on a trellis up the front now and then
    if (rand() < 0.22) { const x = x0 + 0.7 + rand() * (L - 1.4); if (clear(x, 0.6)) {
        for (const u of [-0.5, 0.5]) bx('timber', x + u - 0.015, y + 0.2, 0.02, x + u + 0.015, y + 3.2, 0.06);
        for (let k = 0; k < 7; k++) { const yy = y + 0.8 + k * 0.38, xx = x + (rand() - 0.5) * 0.8; bag.add('doum_leaf', lathe([[0.001, 0], [0.26, 0.05], [0.3, 0.14], [0.2, 0.22], [0.001, 0.26]], 6, null, xx, yy, Z(0.12))); }
      } }
    // the damp and the patched limewash at the foot of the wall, where the lane's wet reaches it
    { const x = x0 + 0.5 + rand() * (L - 2.2), w = 0.8 + rand() * 1.4; if (x + w < x1 - 0.2) bx('plaster_damp', x, y, 0.012, x + w, y + 0.35 + rand() * 0.45, 0.02); }
  }
}

/**
 * medina_garden: { rects: [{ rect, y, front ('n' | 's'), seed }] } — the medina's empty lots as walled huertas: a limewashed
 * wall round, a gate on the lane under a horseshoe arch, beds with a couple of orange trees, a well, a bench.
 */
function medinaGarden(el, { bag, col }) {
  for (const g of el.rects) {
    const [x0, z0, x1, z1] = g.rect, y = g.y, rand = rng(g.seed + 5), H = 2.3, t = 0.35, s = g.front === 's', zf = s ? z1 : z0, n = s ? 1 : -1, cx = (x0 + x1) / 2;
    const gate = [cx - 0.6, cx + 0.6, y, y + 2.1];
    const fr = s ? [x0, z1 - t, x1, z1] : [x0, z0, x1, z0 + t];
    holedWall(bag, col, LW, fr, y, y + H, [[gate[0], gate[1], gate[2], gate[3]]], true);
    const f = face('z', zf, -n); archHead(bag, f, gate[0], gate[1], y + 1.65, y + 2.1, t, 'horseshoe', {});
    for (const r of [[x0, s ? z0 : z0 + t, x0 + t, s ? z1 - t : z1], [x1 - t, s ? z0 : z0 + t, x1, s ? z1 - t : z1], [x0 + t, s ? z0 : z1 - t, x1 - t, s ? z0 + t : z1]]) { bag.add(LW, box(r[0], y, r[1], r[2], y + H - 0.2, r[3])); col.rect(r, y, y + H); }
    for (const r of [[x0, z0, x1, z1]]) bag.add('roof_tile', box(r[0] - 0.05, y + H - 0.2, r[1] - 0.05, r[0] + t + 0.05, y + H - 0.05, r[3] + 0.05)), bag.add('roof_tile', box(r[2] - t - 0.05, y + H - 0.2, r[1] - 0.05, r[2] + 0.05, y + H - 0.05, r[3] + 0.05));
    bag.add('roof_tile', box(x0 - 0.05, y + H - 0.2, fr[1] - 0.05, x1 + 0.05, y + H - 0.05, fr[3] + 0.05)); bag.add('roof_tile', box(x0 - 0.05, y + H - 0.2, s ? z0 - 0.05 : z1 - t - 0.05, x1 + 0.05, y + H - 0.05, s ? z0 + t + 0.05 : z1 + 0.05));
    // the ground: beaten earth with a brick path from the gate, beds either side, the well, orange trees, a bench against the wall
    const zin = s ? z1 - t : z0 + t, Zd = (d) => zin - n * d;
    bag.add('brick_paving', box(gate[0] - 0.1, y - 0.1, Math.min(zin, Zd(Math.min(z1 - z0 - 2 * t, 7))), gate[1] + 0.1, y + 0.03, Math.max(zin, Zd(Math.min(z1 - z0 - 2 * t, 7)))));
    for (const sg of [-1, 1]) { const xa = sg < 0 ? x0 + t + 0.3 : cx + 1.0, xb = sg < 0 ? cx - 1.0 : x1 - t - 0.3; bag.add('ground', box(xa, y - 0.1, Math.min(Zd(1.2), Zd(z1 - z0 - 2.4)), xb, y + 0.07, Math.max(Zd(1.2), Zd(z1 - z0 - 2.4)))); }
    const nt = 2 + (rand() < 0.5 ? 1 : 0);
    for (let i = 0; i < nt; i++) { const x = x0 + t + 1.4 + (x1 - x0 - 2 * t - 2.8) * (i + 0.5) / nt, d = 2.4 + rand() * (z1 - z0 - 2 * t - 4.6); orange(bag, x, y + 0.06, Zd(d), 0.9 + rand() * 0.3, rand); col.circle(x, Zd(d), 0.2, y, y + 1.5); }
    const wd = (z1 - z0) - 2 * t - 1.2, wx = x1 - t - 1.3;
    bag.add('limestone', lathe([[0.55, 0], [0.55, 0.7], [0.4, 0.7], [0.4, 0]], 12, null, wx, y, Zd(wd))); bag.add('opening', lathe([[0.001, 0.69], [0.4, 0.69], [0.4, 0.7], [0.001, 0.7]], 10, null, wx, y, Zd(wd)));
    bag.add('iron', rod([wx - 0.5, y + 0.7, Zd(wd)], [wx - 0.5, y + 1.7, Zd(wd)], 0.03, 5)); bag.add('iron', rod([wx + 0.5, y + 0.7, Zd(wd)], [wx + 0.5, y + 1.7, Zd(wd)], 0.03, 5)); bag.add('timber', rod([wx - 0.5, y + 1.7, Zd(wd)], [wx + 0.5, y + 1.7, Zd(wd)], 0.04, 5));
    col.circle(wx, Zd(wd), 0.55, y, y + 0.75);
    const [bz0, bz1] = [Math.min(Zd(wd - 0.2), Zd(wd + 0.4)), Math.max(Zd(wd - 0.2), Zd(wd + 0.4))];
    bag.add(LW, box(x0 + t + 0.1, y, bz0, x0 + t + 1.7, y + 0.44, bz1)); bag.add('limestone', box(x0 + t + 0.08, y + 0.44, bz0, x0 + t + 1.72, y + 0.48, bz1)); col.rect([x0 + t + 0.1, bz0, x0 + t + 1.7, bz1], y, y + 0.48);
  }
}

/**
 * darro_dress: { z, w, y, x0, x1, seed, gaps: [{ x, width }] } — life along the quays: on each bank's street, between the
 * parapet and the slope, every so often washing on a line between poles with a wash-stone below, a net on a frame,
 * a bench against the slope, a stack of baskets.
 */
/** The stations along the quays: [{ x, sg (−1 north bank, +1 south), kind (0 washing, 1 net, 2 bench, 3 baskets) }] — shared with the people (life.js). */
export function darroSlots({ x0, x1, seed = 11, gaps = [] }) {
  const rand = rng(seed), gx = gaps.map((g) => g.x), out = [];
  for (let x = x0 + 10; x < x1 - 10; x += 11 + rand() * 9) {
    if (gx.some((g) => Math.abs(g - x) < 10)) continue;
    for (const sg of [-1, 1]) { const keep = rand() >= 0.3, kind = Math.floor(rand() * 4); if (keep) out.push({ x, sg, kind }); }
  }
  return out;
}
function darroDress(el, { bag, col }) {
  const { z, w, y } = el;
  for (const { x, sg, kind } of darroSlots(el)) {
    const rand = rng(Math.floor(x * 10) + 5);
    {
      const Z = (d) => z + sg * d, zr = (a, b) => [Math.min(Z(a), Z(b)), Math.max(Z(a), Z(b))];
      if (kind === 0) {                       // washing on a line between two poles, a wash-stone by the parapet
        const d = w + 1.35, L = 3.4;
        for (const u of [0, L]) bag.add('timber', rod([x + u, y, Z(d)], [x + u, y + 2.0, Z(d)], 0.035, 5));
        bag.add('rope_fibre', rod([x, y + 1.95, Z(d)], [x + L, y + 1.88, Z(d)], 0.008, 3));
        for (let i = 0; i < 4; i++) addCloth(bag, CLOTHS[Math.floor(rand() * CLOTHS.length)], clothBox(x + 0.3 + i * 0.8, y + 1.0 - rand() * 0.1, Z(d) - 0.012, x + 0.3 + i * 0.8 + 0.5, y + 1.93, Z(d) + 0.012, 0.2), y + 1.93);
        const [za, zc] = zr(w + 0.75, w + 1.15); bag.add('limestone', box(x + 1.0, y, za, x + 2.4, y + 0.38, zc)); col.rect([x + 1.0, za, x + 2.4, zc], y, y + 0.38);
      } else if (kind === 1) {                // a net drying on a frame of poles
        const d = w + 1.5, [za, zc] = zr(d - 0.05, d + 0.05);
        for (const u of [0, 2.6]) bag.add('timber', rod([x + u, y, Z(d)], [x + u, y + 1.8, Z(d)], 0.04, 5));
        bag.add('timber', rod([x, y + 1.75, Z(d)], [x + 2.6, y + 1.75, Z(d)], 0.03, 5));
        bag.add('rope_fibre', box(x + 0.05, y + 0.55, za, x + 2.55, y + 1.72, zc)); bag.add('timber', rod([x, y + 0.5, Z(d)], [x + 2.6, y + 0.5, Z(d)], 0.025, 4));
      } else if (kind === 2) {                // a bench against the slope and a jar beside it
        const [za, zc] = zr(7.2, 7.65); bag.add(LW, box(x, y, za, x + 1.8, y + 0.44, zc)); bag.add('limestone', box(x - 0.02, y + 0.44, za, x + 1.82, y + 0.48, zc)); col.rect([x, za, x + 1.8, zc], y, y + 0.48);
        jar(bag, x + 2.2, y, Z(7.4), 1);
      } else {                                // baskets and a coil of rope by the parapet
        for (let i = 0; i < 3; i++) bag.add('wicker', lathe([[0.2, 0], [0.34, 0.4], [0.32, 0.42], [0.001, 0.42]], 10, null, x + i * 0.6, y, Z(w + 1.1 + (i % 2) * 0.25)));
        bag.add('rope_fibre', lathe([[0.1, 0], [0.22, 0.02], [0.22, 0.14], [0.1, 0.16]], 10, null, x + 2.0, y, Z(w + 1.2)));
      }
    }
  }
}

export const STREETS = { lane_dress: laneDress, medina_garden: medinaGarden, darro_dress: darroDress };
