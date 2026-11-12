// The shops of Queli Street and the town's lanes (docs/settlements/lu-qufu.md §6): a row of timber-fronted shops under one grey-tile
// roof, each with its counter, goods, awning and signboard; the trades of a pilgrim town.
import { box, lathe, clothBox, addCloth, fromTriangles, rod } from '../../core/geom.js';
import { rectRoof } from '../ming/index.js';
import { rng, lotFrame } from './kit.js';


// ── the writing on the boards: a few characters as tapered brush strokes [kind, x0, y0, x1, y1] on a 100-unit grid ──
const GLYPHS = {
  茶: [['h', 12, 92, 88, 92], ['s', 34, 100, 34, 82], ['s', 66, 100, 66, 82], ['p', 50, 80, 22, 54], ['n', 50, 80, 80, 54], ['h', 16, 40, 84, 40], ['s', 50, 52, 50, 4], ['p', 46, 34, 16, 8], ['n', 54, 34, 84, 8]],
  布: [['h', 10, 80, 90, 80], ['p', 46, 92, 16, 18], ['s', 28, 58, 28, 8], ['h', 28, 58, 80, 58], ['s', 80, 58, 80, 18], ['s', 54, 76, 54, 4]],
  书: [['h', 12, 78, 66, 78], ['s', 66, 78, 66, 56], ['h', 8, 56, 90, 56], ['s', 48, 98, 48, 8], ['d', 72, 88, 82, 76], ['h', 10, 30, 48, 30]],
  面: [['h', 12, 90, 88, 90], ['s', 50, 98, 50, 90], ['s', 12, 90, 12, 10], ['s', 88, 90, 88, 10], ['s', 30, 70, 30, 16], ['s', 70, 70, 70, 16], ['h', 30, 70, 70, 70], ['h', 30, 44, 70, 44], ['h', 30, 16, 70, 16], ['s', 50, 70, 50, 16]],
  金: [['p', 50, 98, 12, 66], ['n', 50, 98, 88, 66], ['h', 28, 72, 72, 72], ['h', 20, 56, 80, 56], ['s', 50, 72, 50, 14], ['d', 32, 44, 40, 36], ['d', 68, 44, 60, 36], ['h', 8, 16, 92, 16]],
  吉: [['h', 26, 96, 74, 96], ['s', 50, 98, 50, 56], ['h', 14, 78, 86, 78], ['s', 26, 52, 26, 10], ['h', 26, 52, 74, 52], ['s', 74, 52, 74, 10], ['h', 26, 10, 74, 10]],
  同: [['s', 12, 92, 12, 8], ['h', 12, 92, 88, 92], ['s', 88, 92, 88, 14], ['h', 32, 66, 68, 66], ['s', 32, 66, 32, 32], ['s', 68, 66, 68, 32], ['h', 32, 32, 68, 32]],
};
const GKEYS = Object.keys(GLYPHS);
const STROKE = { h: [0.05, 0.065, 0.02, 0.035], s: [0.07, 0.04, 0.02, 0.05], p: [0.075, 0.012, 0.02, 0.06], n: [0.02, 0.1, 0.01, 0.045], d: [0.1, 0.06, 0.02, 0.03], t: [0.06, 0.02, 0.02, 0.05] };
function stroke(out, [k, ax, ay, bx, by]) {
  const [wa, wb, ca, cb] = STROKE[k], dx = bx - ax, dy = by - ay, l = Math.hypot(dx, dy) / 100, ux = dx / 100 / l, uy = dy / 100 / l, nx = -uy, ny = ux;
  const A = [ax / 100 - 0.5, ay / 100 - 0.5], B = [bx / 100 - 0.5, by / 100 - 0.5];
  const P = [[A[0] - ux * ca, A[1] - uy * ca], [A[0] - nx * wa / 2, A[1] - ny * wa / 2], [B[0] - nx * wb / 2, B[1] - ny * wb / 2], [B[0] + ux * cb, B[1] + uy * cb], [B[0] + nx * wb / 2, B[1] + ny * wb / 2], [A[0] + nx * wa / 2, A[1] + ny * wa / 2]];
  for (let i = 1; i < 5; i++) out.push(P[0][0], P[0][1], 0, P[i][0], P[i][1], 0, P[i + 1][0], P[i + 1][1], 0);
}
/** A gilt character on a board at (x, y, z) facing the direction of `yaw` (0: +z), size s. */
function glyph(bag, ch, x, y, z, yaw, s) {
  const t = []; for (const st of GLYPHS[ch]) stroke(t, st);
  const g = fromTriangles(t); g.scale(s, s, 1); g.rotateY(yaw); g.translate(x, y, z); bag.add('gilt_bronze', g);
}

const TRADES = ['incense', 'paper', 'books', 'rubbings', 'cakes', 'tea', 'cloth', 'pottery', 'brush'];
const AWN = ['cloth_red', 'cloth_indigo', 'cloth_ochre', 'cloth_white', 'cloth_brown', 'cloth_blue'];

/** lu_shop_row: { rect, front, n, seed, storeys } — n shops side by side under one roof; each has its counter with a doorway beside it, the shelves and goods of its trade inside. */
export function shopRow(el, ctx) {
  const rand = rng(el.seed ?? 1), F = lotFrame(ctx, el.rect, el.front), W = F.W, D = F.D, n = el.n ?? Math.max(1, Math.round(W / 5.6)), sw = W / n;
  const two = el.storeys === 2, H = two ? 6.3 : 3.5, bag = ctx.bag, col = ctx.col;
  F.b('brick_paving', -0.2, 0, -1.1, W + 0.2, 0.18, D, false);
  F.b('brick_grey', 0, 0.18, D - 0.4, W, H, D); F.b('brick_grey', 0, 0.18, 0.3, 0.4, H, D); F.b('brick_grey', W - 0.4, 0.18, 0.3, W, H, D);
  for (let i = 0; i <= n; i++) {
    const u = i * sw;
    F.b('lacquer_chestnut', u - 0.13, 0.18, -0.25, u + 0.13, 3.3, 0.05, true);
    if (i > 0 && i < n) F.b('brick_grey', u - 0.15, 0.18, 0.3, u + 0.15, H, D - 0.4);
  }
  F.b('lacquer_chestnut', 0, 3.1, -0.28, W, 3.5, 0.06, false);
  // the ceiling beams of the ground floor
  for (let i = 0; i < n; i++) for (let k = 0; k < 4; k++) F.b('timber', i * sw + 0.3, 3.0, 1.0 + k * 3.0, (i + 1) * sw - 0.3, 3.15, 1.2 + k * 3.0, false);
  for (let i = 0; i < n; i++) F.b('timber', i * sw + 0.3, 3.15, 0.4, (i + 1) * sw - 0.3, 3.2, D - 0.5, false);
  if (two) {
    F.b('plaster_grey', 0, 3.5, 0.0, W, 6.0, 0.3, false);
    for (let i = 0; i < n; i++) F.b('lattice', i * sw + 0.5, 4.0, -0.04, (i + 1) * sw - 0.5, 5.4, 0.04, false);
    F.b('lacquer_chestnut', 0, 5.9, -0.45, W, 6.3, 0.1, false);
    // the upper floor's balcony rail
    F.b('lacquer_chestnut', 0, 3.5, -0.55, W, 4.5, -0.5, false);
  }
  const A = (el.front === 'n' || el.front === 's') ? [W / 2 + 0.7, D / 2 + 0.9] : [D / 2 + 0.9, W / 2 + 0.7];
  const c = F.pt(W / 2, D / 2 - 0.1), alongZ = el.front === 'e' || el.front === 'w';
  rectRoof({ c, A: alongZ ? A[1] : A[0], B: alongZ ? A[0] : A[1], y: H + 0.05, rise: two ? 1.9 : 1.5, kind: 'gable', sweep: 0.3, alongZ, mat: 'tile_grey', soffit: 'lacquer_chestnut' }, bag);
  const yaw = { s: 0, n: Math.PI, e: Math.PI / 2, w: -Math.PI / 2 }[el.front];
  const put = (u, v, fn) => { const p = F.pt(u, v); fn(p[0], p[1]); };
  const jar = (u, v, y, k = 1) => put(u, v, (x, z) => bag.add('pottery_dark', lathe([[0.001, 0], [0.2 * k, 0.03], [0.3 * k, 0.2 * k], [0.32 * k, 0.4 * k], [0.2 * k, 0.62 * k], [0.12 * k, 0.7 * k], [0.001, 0.7 * k]], 8, null, x, y, z)));
  for (let i = 0; i < n; i++) {
    const u0 = i * sw, trade = TRADES[Math.floor(rand() * TRADES.length)], awn = AWN[Math.floor(rand() * AWN.length)];
    // the doorway: 1.5 m beside the middle, the counter in the two pieces either side
    const gap = u0 + sw * (i % 2 ? 0.34 : 0.66), g0 = gap - 0.75, g1 = gap + 0.75, s0 = u0 + 0.3, s1 = u0 + sw - 0.3;
    for (const [a0, a1] of [[s0, g0], [g1, s1]]) if (a1 - a0 > 0.5) F.b('lacquer_black', a0, 0.18, 0.1, a1, 1.0, 0.7, true);
    const seg = g0 - s0 > s1 - g1 ? [s0, g0] : [g1, s1];
    const a = F.pt(u0 + 0.2, 0), b = F.pt(u0 + sw - 0.2, -1.0);
    addCloth(bag, awn, clothBox(Math.min(a[0], b[0]), 2.5, Math.min(a[1], b[1]), Math.max(a[0], b[0]), 3.05, Math.max(a[1], b[1]), 0.3), 3.05);
    // the goods on the counter, in the longer piece
    const room = Math.max(0, seg[1] - seg[0] - 0.3), at = (k, step) => seg[0] + 0.2 + k * step;
    const cnt = (step) => Math.max(0, Math.floor(room / step));
    if (trade === 'incense') for (let k = 0; k < cnt(0.4); k++) F.b(k % 2 ? 'cloth_red' : 'wood_ochre', at(k, 0.4), 1.0, 0.15, at(k, 0.4) + 0.08, 1.9, 0.23, false);
    else if (trade === 'paper' || trade === 'rubbings') for (let k = 0; k < cnt(0.5); k++) F.b(k % 2 ? 'cloth_white' : 'cloth_grey', at(k, 0.5), 1.0, 0.15, at(k, 0.5) + 0.45, 1.1 + 0.12 * (k % 3), 0.65, false);
    else if (trade === 'books') for (let k = 0; k < cnt(0.3); k++) F.b(k % 3 ? 'cloth_indigo' : 'cloth_white', at(k, 0.3), 1.0, 0.2, at(k, 0.3) + 0.28, 1.0 + 0.12 * (1 + k % 2), 0.55, false);
    else if (trade === 'pottery') for (let k = 0; k < cnt(0.7); k++) put(at(k, 0.7) + 0.25, 0.4, (x, z) => bag.add('pottery_dark', lathe([[0.001, 0], [0.18, 0.05], [0.26, 0.28], [0.18, 0.46], [0.1, 0.5], [0.001, 0.5]], 8, null, x, 1.0, z)));
    else if (trade === 'cakes') for (let k = 0; k < cnt(0.9); k++) put(at(k, 0.9) + 0.4, 0.4, (x, z) => bag.add('wicker', lathe([[0.4, 0], [0.4, 0.12], [0.001, 0.12]], 10, null, x, 1.0, z)));
    else if (trade === 'tea') for (let k = 0; k < cnt(0.6); k++) put(at(k, 0.6) + 0.15, 0.4, (x, z) => bag.add('glaze_white', lathe([[0.001, 0], [0.1, 0.02], [0.14, 0.18], [0.001, 0.18]], 8, null, x, 1.0, z)));
    else if (trade === 'cloth') for (let k = 0; k < cnt(0.6); k++) F.b(AWN[(k + i) % AWN.length], at(k, 0.6), 1.0, 0.1, at(k, 0.6) + 0.5, 1.25 + 0.1 * (k % 2), 0.62, false);
    else for (let k = 0; k < cnt(0.4); k++) F.b('bamboo_culm', at(k, 0.4), 1.0, 0.2, at(k, 0.4) + 0.05, 1.5, 0.25, false);
    // inside: shelves along the back wall and the divider, the trade's jars and bolts, the account table with its stool, a lantern
    const vb = D - 0.4;
    for (const y of [0.55, 1.35, 2.15]) F.b('wood_dark', u0 + 0.5, y, vb - 0.45, u0 + sw - 0.5, y + 0.05, vb, false);
    for (const px of [u0 + 0.5, u0 + sw - 0.55]) F.b('wood_dark', px, 0.18, vb - 0.45, px + 0.05, 2.7, vb, false);
    for (let k = 0; k < Math.floor((sw - 1.2) / 0.5); k++) {
      const u = u0 + 0.8 + k * 0.5;
      jar(u, vb - 0.22, 1.4, 0.5); jar(u + 0.1, vb - 0.22, 2.2, 0.45);
      F.b(['cloth_white', 'cloth_indigo', 'cloth_red', 'cloth_ochre'][(k + i) % 4], u - 0.2, 0.6, vb - 0.4, u + 0.25, 1.2, vb - 0.05, false);
    }
    F.b('lacquer_black', u0 + 0.8, 0.18, 4.3, u0 + sw - 0.8, 0.88, 5.0, true);
    F.b('wicker', u0 + sw / 2 - 0.2, 0.88, 4.5, u0 + sw / 2 + 0.2, 0.92, 4.8, false);
    for (const dz of [-0.4, 0.4]) F.b('wood_dark', u0 + sw / 2 - 0.17, 0.18, 5.9 + dz - 0.17, u0 + sw / 2 + 0.17, 0.58, 5.9 + dz + 0.17, false);
    put(u0 + sw / 2, 3.5, (x, z) => { bag.add('lamp_paper', lathe([[0.001, 0], [0.18, 0.1], [0.18, 0.4], [0.001, 0.5]], 8, null, x, 2.45, z)); });
    // the name board over the doorway: black, a gilt character; the signboard hung at the corner with its own
    const ch = GKEYS[Math.floor(rand() * GKEYS.length)], cu = (u0 + sw / 2);
    F.b('lacquer_black', u0 + 0.5, 3.12, -0.37, u0 + sw - 0.5, 3.48, -0.29, false);
    const pn = F.pt(cu, -0.41); glyph(bag, ch, pn[0], 3.3, pn[1], yaw, 0.32);
    if (rand() < 0.6) {
      F.b('lacquer_chestnut', u0 + 0.05, 0.18, -0.95, u0 + 0.15, 3.7, -0.85, false);
      F.b('lacquer_red', u0 - 0.05, 1.8, -0.98, u0 + 0.25, 3.3, -0.82, false);
      const ps = F.pt(u0 + 0.1, -1.01); glyph(bag, GKEYS[Math.floor(rand() * GKEYS.length)], ps[0], 2.55, ps[1], yaw, 0.26);
    }
    // out in the street: a trestle with the day's goods and a stool (a third of the shops)
    if (rand() < 0.35) {
      const tu = u0 + sw * 0.5;
      F.b('wood_dark', tu - 0.7, 0.0, -2.2, tu + 0.7, 0.82, -1.5, true);
      F.b('wood_ochre', tu - 0.75, 0.82, -2.25, tu + 0.75, 0.86, -1.45, false);
      for (let k = 0; k < 4; k++) F.b(AWN[(k + i) % AWN.length], tu - 0.6 + k * 0.32, 0.86, -2.1, tu - 0.35 + k * 0.32, 0.86 + 0.1 + 0.05 * (k % 2), -1.6, false);
    }
    // a hanging pot or a bundle of the trade at the post, a water jar and a broom at the foot of the pier
    jar(u0 + 0.45, -0.1, 0.18, 0.9);
    void col; void rod;
  }
}
