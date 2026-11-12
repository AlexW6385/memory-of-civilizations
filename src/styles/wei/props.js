// The furniture of Ye's courts, gates and streets (docs/settlements/wei-ye.md §5.1): bronze braziers and cauldrons, the banner poles of the
// army, drums and bell frames, the notice boards of the offices, wells with their sweeps, benches, garden rocks, hitching rails, halberd racks,
// bronze lamp trees, granaries on posts, stacks, jars, awnings. Each is built in its own frame (x right, z forward, y up), turned by `yaw` and
// put at (x, y, z); every piece is a box or a lathe of a palette material. Registered as the element `wei_prop` of the style `wei`.
import { box, lathe, place, clothBox, addCloth, fromTriangles, orientOutward } from '../../core/geom.js';
import { rng } from '../han/kit.js';

class P {
  constructor(ctx, x, y, z, yaw) { this.ctx = ctx; this.bag = ctx.bag; this.col = ctx.col; this.x = x; this.y = y; this.z = z; this.yaw = yaw; this.c = Math.cos(yaw); this.s = Math.sin(yaw); }
  /** local (u, v) → world [x, z] (turned by yaw about y as place() does) */
  pt(u, v) { return [this.x + u * this.c + v * this.s, this.z - u * this.s + v * this.c]; }
  b(mat, u0, y0, v0, u1, y1, v1) { this.bag.add(mat, place(box(u0, y0, v0, u1, y1, v1), this.x, this.y, this.z, this.yaw)); }
  l(mat, prof, u = 0, y = 0, v = 0, seg = 8) { this.bag.add(mat, place(lathe(prof, seg, null, u, y, v), this.x, this.y, this.z, this.yaw)); }
  g(mat, g) { this.bag.add(mat, place(g, this.x, this.y, this.z, this.yaw)); }
  cloth(mat, u0, y0, v0, u1, y1, v1) { const g = clothBox(u0, y0, v0, u1, y1, v1, 0.3); place(g, this.x, this.y, this.z, this.yaw); addCloth(this.bag, mat, g, y1 + this.y); }
  /** a solid post/rectangle as an obstacle (axis-aligned bound of the turned box) */
  solid(u0, y0, v0, u1, y1, v1) {
    const a = this.pt(u0, v0), b = this.pt(u1, v0), c = this.pt(u1, v1), d = this.pt(u0, v1);
    this.col.rect([Math.min(a[0], b[0], c[0], d[0]), Math.min(a[1], b[1], c[1], d[1]), Math.max(a[0], b[0], c[0], d[0]), Math.max(a[1], b[1], c[1], d[1])], this.y + y0, this.y + y1);
  }
  round(u, v, r, y0, y1) { const p = this.pt(u, v); this.col.circle(p[0], p[1], r, this.y + y0, this.y + y1); }
}

const KINDS = {
  // a bronze tripod bowl on a stand for fire (the court's light at night)
  brazier(p, o) {
    p.l('bronze', [[0.001, 0.0], [0.24, 0.02], [0.26, 0.22], [0.3, 0.3], [0.001, 0.3]], 0, 0.5, 0, 10);
    for (let k = 0; k < 3; k++) { const a = k / 3 * 6.283; p.b('bronze', Math.cos(a) * 0.2 - 0.04, 0, Math.sin(a) * 0.2 - 0.04, Math.cos(a) * 0.2 + 0.04, 0.55, Math.sin(a) * 0.2 + 0.04); }
    p.l('flame', [[0.001, 0.0], [0.17, 0.0], [0.1, 0.25], [0.001, 0.42]], 0, 0.82, 0, 7);
    p.round(0, 0, 0.3, 0, 1.0);
  },
  // the ding: a round bronze cauldron on three legs with two upright ears
  ding(p, o) {
    const s = o.s ?? 1;
    p.l('bronze', [[0.001, 0.4 * s], [0.32 * s, 0.42 * s], [0.4 * s, 0.7 * s], [0.38 * s, 1.0 * s], [0.4 * s, 1.04 * s], [0.34 * s, 1.04 * s], [0.001, 0.98 * s]], 0, 0, 0, 12);
    for (let k = 0; k < 3; k++) { const a = k / 3 * 6.283 + 0.4; p.b('bronze', Math.cos(a) * 0.25 * s - 0.06 * s, 0, Math.sin(a) * 0.25 * s - 0.06 * s, Math.cos(a) * 0.25 * s + 0.06 * s, 0.5 * s, Math.sin(a) * 0.25 * s + 0.06 * s); }
    for (const q of [-1, 1]) p.b('bronze', q * 0.36 * s - 0.04, 0.98 * s, -0.05, q * 0.36 * s + 0.04, 1.28 * s, 0.05);
    p.round(0, 0, 0.45 * s, 0, 1.2 * s);
  },
  // a banner pole: a tall pole on a stone foot, the pennant (red, black, or Wei's yellow-ochre) in the wind
  flag(p, o) {
    const h = o.h ?? 6.4;
    p.b('bluestone', -0.4, 0, -0.4, 0.4, 0.5, 0.4);
    p.l('timber', [[0.12, 0.5], [0.07, h]], 0, 0, 0, 6);
    p.l('bronze', [[0.001, h], [0.1, h + 0.05], [0.001, h + 0.35]], 0, 0, 0, 6);
    p.cloth(o.cloth ?? 'cloth_red', 0.07, h - 1.9, -0.02, 2.0, h - 0.2, 0.02);
    if (o.long) p.cloth(o.cloth2 ?? 'cloth_black', 0.07, h - 3.0, -0.02, 1.2, h - 2.0, 0.02);
    p.round(0, 0, 0.45, 0, 2.0);
  },
  // the great drum on its frame (the drum of the watch, of the court's hours)
  drum(p, o) {
    p.b('timber_red', -1.0, 0, -0.5, -0.8, 2.2, 0.5); p.b('timber_red', 0.8, 0, -0.5, 1.0, 2.2, 0.5); p.b('timber_red', -1.0, 2.1, -0.15, 1.0, 2.25, 0.15);
    p.b('timber_red', -1.1, 0, -0.55, 1.1, 0.12, 0.55); p.b('timber_red', -1.1, 0, -0.55, 1.1, 0.12, 0.55);
    const g = lathe([[0.001, -0.62], [0.62, -0.58], [0.74, -0.2], [0.76, 0.0], [0.74, 0.2], [0.62, 0.58], [0.001, 0.62]], 14); g.rotateZ(Math.PI / 2); g.translate(0, 1.2, 0);
    p.g('lacquer_red', g);
    p.b('iron', -0.8, 0.9, -0.03, 0.8, 0.94, 0.03);
    for (const q of [-1, 1]) p.b('timber', q * 0.35 - 0.025, 0.4, -0.9, q * 0.35 + 0.025, 0.46, -0.3);
    p.solid(-1.1, 0, -0.55, 1.1, 2.2, 0.55);
  },
  // a bell frame (zhong): a rack with a row of bronze bells hung by loops
  bells(p, o) {
    const n = o.n ?? 5, w = n * 0.7 + 0.5;
    p.b('lacquer_black', -w / 2 - 0.15, 0, -0.3, -w / 2 + 0.05, 2.1, 0.3); p.b('lacquer_black', w / 2 - 0.05, 0, -0.3, w / 2 + 0.15, 2.1, 0.3);
    p.b('lacquer_black', -w / 2 - 0.2, 2.0, -0.08, w / 2 + 0.2, 2.15, 0.08);
    p.b('lacquer_black', -w / 2 - 0.25, 0, -0.35, -w / 2 + 0.2, 0.1, 0.35); p.b('lacquer_black', w / 2 - 0.2, 0, -0.35, w / 2 + 0.25, 0.1, 0.35);
    for (let k = 0; k < n; k++) { const u = -w / 2 + 0.45 + k * 0.7, hh = 0.75 - k * 0.04; p.b('bronze', u - 0.015, 2.0 - 0.3, -0.015, u + 0.015, 2.0, 0.015); p.l('bronze', [[0.14 + k * 0.012, 2.0 - 0.3 - hh], [0.1, 2.0 - 0.3 - hh * 0.2], [0.06, 2.0 - 0.3]], u, 0, 0, 6); }
    p.solid(-w / 2 - 0.25, 0, -0.35, w / 2 + 0.25, 2.1, 0.35);
  },
  // a notice board (the office's board of orders): a lacquered board under a little tiled roof on two posts
  board(p, o) {
    p.b('timber_red', -0.9, 0, -0.1, -0.8, 2.6, 0.1); p.b('timber_red', 0.8, 0, -0.1, 0.9, 2.6, 0.1);
    p.b('lacquer_black', -0.82, 0.9, -0.06, 0.82, 2.2, 0.06); p.b('paint_white', -0.7, 1.0, -0.075, 0.7, 2.1, -0.062);
    for (let k = 0; k < 5; k++) p.b('lacquer_black', -0.6, 1.88 - k * 0.2, -0.082, 0.6 - (k % 3) * 0.15, 1.9 - k * 0.2, -0.074);
    p.b('tile_grey', -1.1, 2.55, -0.35, 1.1, 2.7, 0.35); p.b('tile_dark', -0.9, 2.7, -0.2, 0.9, 2.8, 0.2);
    p.solid(-0.9, 0, -0.12, 0.9, 2.6, 0.12);
  },
  // the well-sweep (jiegao): a stone curb, two posts, a long pole on a fulcrum with a bucket on one end and a stone on the other
  well(p, o) {
    p.l('bluestone', [[0.8, 0], [0.8, 0.5], [0.55, 0.5], [0.55, 0.0]], 0, 0, 0, 10);
    p.l('water', [[0.55, 0.18], [0.001, 0.18]], 0, 0, 0, 10);
    p.b('timber', -0.07, 0, 1.1, 0.07, 2.6, 1.24); p.b('timber', -0.07, 0, 1.5, 0.07, 2.6, 1.64);
    p.b('timber', -0.04, 2.5, -1.6, 0.04, 2.58, 3.0);
    p.b('timber', -0.25, 2.1, -1.7, 0.25, 2.5, -1.3);
    p.l('wood_dark', [[0.001, 0], [0.16, 0.0], [0.18, 0.28], [0.001, 0.28]], 0, 0.9, -0.4, 8);
    p.b('rope_fibre', -0.01, 1.1, -0.41, 0.01, 2.5, -0.39);
    p.round(0, 0, 0.85, 0, 0.55);
  },
  bench(p, o) {
    const L = o.len ?? 1.8;
    p.b('wood_ochre', -L / 2, 0.42, -0.16, L / 2, 0.47, 0.16);
    for (const q of [-1, 1]) p.b('wood_dark', q * (L / 2 - 0.15) - 0.04, 0, -0.12, q * (L / 2 - 0.15) + 0.04, 0.42, 0.12);
    p.solid(-L / 2, 0, -0.16, L / 2, 0.47, 0.16);
  },
  // a garden rock: a rough boulder heap (granite) of three lumps
  rock(p, o) {
    const r = rng(o.seed ?? 1), s = o.s ?? 1;
    for (let k = 0; k < 3; k++) {
      const rr = (0.9 - k * 0.2) * s * (0.8 + r() * 0.4), a = r() * 6.28, u = k ? Math.cos(a) * rr * 0.9 : 0, v = k ? Math.sin(a) * rr * 0.9 : 0;
      const g = lathe([[0.001, 0], [rr * 0.9, 0.05 * s], [rr, rr * 0.5], [rr * 0.6, rr * 0.95], [0.001, rr * 1.1]], 7); g.scale(1, 0.7 + r() * 0.4, 0.8 + r() * 0.4);
      p.g('granite_grey', g.translate(u, -0.12 * s, v));
      p.round(u, v, rr * 0.85, 0, rr * 0.9);
    }
  },
  // a hitching rail: two posts and a rail, the ring-stones at the foot
  rail(p, o) {
    const L = o.len ?? 3.0;
    for (const q of [-1, 1]) p.b('wood_dark', q * L / 2 - 0.07, 0, -0.07, q * L / 2 + 0.07, 1.25, 0.07);
    p.b('wood_dark', -L / 2, 1.05, -0.05, L / 2, 1.13, 0.05);
    p.solid(-L / 2, 0, -0.07, L / 2, 1.2, 0.07);
  },
  // a rack of halberds (ji) and spears at a guard post: a frame of timber with the shafts upright and their blades
  rack(p, o) {
    const n = o.n ?? 8, L = n * 0.28 + 0.3;
    p.b('timber_red', -L / 2, 0.3, -0.18, L / 2, 0.38, 0.18); p.b('timber_red', -L / 2, 1.1, -0.18, L / 2, 1.18, 0.18);
    for (const q of [-1, 1]) p.b('timber_red', q * L / 2 - 0.05, 0, -0.2, q * L / 2 + 0.05, 1.35, 0.2);
    for (let k = 0; k < n; k++) { const u = -L / 2 + 0.25 + k * 0.28; p.b('wood_dark', u - 0.015, 0.34, -0.015, u + 0.015, 2.2 + (k % 2) * 0.12, 0.015); p.b('iron', u - 0.02, 2.2 + (k % 2) * 0.12, -0.012, u + 0.02, 2.5 + (k % 2) * 0.12, 0.012); if (k % 2 === 0) p.b('iron', u - 0.02, 2.12, -0.012, u + 0.13, 2.28, 0.012); }
    p.solid(-L / 2, 0, -0.2, L / 2, 1.4, 0.2);
  },
  // a bronze lamp tree: a stem on a foot with three lamp bowls, a hanging lamp's chain
  lamp(p, o) {
    p.l('bronze', [[0.2, 0], [0.18, 0.05], [0.05, 0.12], [0.04, 1.4], [0.001, 1.45]], 0, 0, 0, 8);
    for (let k = 0; k < 3; k++) { const a = k / 3 * 6.283; p.b('bronze', Math.cos(a) * 0.08 - 0.015, 1.0 + k * 0.1, Math.sin(a) * 0.08 - 0.015, Math.cos(a) * 0.26 + 0.015, 1.04 + k * 0.1, Math.sin(a) * 0.26 + 0.015); p.l('bronze', [[0.001, 0], [0.07, 0.01], [0.09, 0.06], [0.001, 0.06]], Math.cos(a) * 0.26, 1.04 + k * 0.1, Math.sin(a) * 0.26, 6); }
    p.round(0, 0, 0.2, 0, 1.45);
  },
  // a granary on posts (for the stores of the capital): a raised floor on short stone-footed posts, plaster walls with a door, a tiled gabled roof
  granary(p, o) {
    const W = o.w ?? 4.6, D = o.d ?? 3.6, y0 = 0.8, H = 2.4;
    for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) { const u = -W / 2 + 0.3 + i * (W - 0.6) / 3, v = -D / 2 + 0.3 + j * (D - 0.6) / 2; p.b('bluestone', u - 0.2, 0, v - 0.2, u + 0.2, 0.2, v + 0.2); p.b('timber', u - 0.12, 0.2, v - 0.12, u + 0.12, y0, v + 0.12); }
    p.b('timber', -W / 2, y0, -D / 2, W / 2, y0 + 0.2, D / 2);
    p.b('lime_plaster', -W / 2 + 0.1, y0 + 0.2, -D / 2 + 0.1, W / 2 - 0.1, y0 + 0.2 + H, D / 2 - 0.1);
    p.b('lacquer_black', -0.5, y0 + 0.2, D / 2 - 0.11, 0.5, y0 + 1.9, D / 2 - 0.08);
    p.b('timber_red', -0.6, y0 + 1.9, D / 2 - 0.14, 0.6, y0 + 2.05, D / 2 - 0.06);
    p.b('timber', -0.5, 0, D / 2 + 0.1, 0.5, 0.2, D / 2 + 0.5); p.b('timber', -0.5, 0.2, D / 2 + 0.5, 0.5, 0.4, D / 2 + 0.9);
    // the gabled roof: two sloping slabs and the ridge (built as a prism)
    const ya = y0 + 0.2 + H, A = W / 2 + 0.5, B = D / 2 + 0.6, R = 1.4, T = [];
    const v = (x, y, z) => [x, y, z];
    T.push(...v(-A, ya, -B), ...v(A, ya, -B), ...v(A, ya + R, 0), ...v(-A, ya, -B), ...v(A, ya + R, 0), ...v(-A, ya + R, 0));
    T.push(...v(-A, ya + R, 0), ...v(A, ya + R, 0), ...v(A, ya, B), ...v(-A, ya + R, 0), ...v(A, ya, B), ...v(-A, ya, B));
    T.push(...v(-A, ya, -B), ...v(-A, ya + R, 0), ...v(-A, ya, B), ...v(A, ya, -B), ...v(A, ya, B), ...v(A, ya + R, 0));
    T.push(...v(-A, ya, -B), ...v(-A, ya, B), ...v(-A, ya + R, 0), ...v(A, ya, -B), ...v(A, ya + R, 0), ...v(A, ya, B));
    T.push(...v(-A, ya, -B), ...v(A, ya, B), ...v(A, ya, -B), ...v(-A, ya, -B), ...v(-A, ya, B), ...v(A, ya, B));
    p.g('tile_grey', fromTriangles(orientOutward(T)));
    p.b('tile_dark', -A, ya + R - 0.05, -0.12, A, ya + R + 0.2, 0.12);
    p.solid(-W / 2, 0, -D / 2, W / 2, y0 + 0.2 + H, D / 2);
  },
  // a stack of millet or straw (a conical stack, bound), or of firewood / jars
  stack(p, o) {
    const r = o.r ?? 1.2;
    p.l('thatch', [[r, 0], [r * 0.95, r * 0.6], [r * 0.6, r * 1.3], [r * 0.2, r * 1.8], [0.001, r * 2.0]], 0, 0, 0, 9);
    p.round(0, 0, r * 0.9, 0, r * 1.5);
  },
  jars(p, o) {
    const r = rng(o.seed ?? 3), n = o.n ?? 5;
    for (let k = 0; k < n; k++) {
      const u = (k % 3) * 0.55 - 0.55, v = Math.floor(k / 3) * 0.55, s = 0.8 + r() * 0.4;
      p.l(k % 2 ? 'pottery_dark' : 'terracotta', [[0.14 * s, 0], [0.3 * s, 0.25 * s], [0.34 * s, 0.55 * s], [0.22 * s, 0.85 * s], [0.14 * s, 0.9 * s], [0.16 * s, 0.96 * s], [0.001, 0.96 * s]], u, 0, v, 10);
      p.round(u, v, 0.3 * s, 0, 0.9 * s);
    }
  },
  // a cloth awning on two poles over a trestle: a stall
  stall(p, o) {
    const W = o.w ?? 3.0, cl = o.cloth ?? 'cloth_indigo';
    for (const q of [-1, 1]) { p.b('timber', q * W / 2 - 0.05, 0, -0.9, q * W / 2 + 0.05, 2.6, -0.8); p.b('timber', q * W / 2 - 0.05, 0, 0.8, q * W / 2 + 0.05, 2.1, 0.9); }
    p.cloth(cl, -W / 2 - 0.1, 2.35, -1.0, W / 2 + 0.1, 2.62, 1.0);
    p.b('wood_dark', -W / 2 + 0.2, 0.7, -0.4, W / 2 - 0.2, 0.78, 0.4);
    for (const q of [-1, 1]) for (const w of [-1, 1]) p.b('wood_dark', q * (W / 2 - 0.3) - 0.04, 0, w * 0.3 - 0.04, q * (W / 2 - 0.3) + 0.04, 0.7, w * 0.3 + 0.04);
    const r = rng(o.seed ?? 4), mats = o.goods ?? ['cloth_red', 'cloth_ochre', 'cloth_green', 'wicker'];
    for (let k = 0; k < 6; k++) p.b(mats[k % mats.length], -W / 2 + 0.35 + k * (W - 0.8) / 6, 0.78, -0.3 + r() * 0.1, -W / 2 + 0.35 + k * (W - 0.8) / 6 + 0.3, 0.9 + r() * 0.2, 0.2);
    p.solid(-W / 2 + 0.2, 0, -0.4, W / 2 - 0.2, 0.9, 0.4);
  },
  // a stone mounting block and the stone-footed gate-post pair (que stones are the palace's; this is the street's)
  block(p, o) { p.b('bluestone', -0.5, 0, -0.35, 0.5, 0.28, 0.35); p.b('bluestone', -0.4, 0.28, -0.25, 0.4, 0.5, 0.25); p.solid(-0.5, 0, -0.35, 0.5, 0.5, 0.35); },

  // a stone chimera (tianlu / bixie): the winged beast of a stair's or a tomb's way, on its plinth, the chest out, the mouth open
  beast(p, o) {
    const s = o.s ?? 1;
    p.b('limestone', -0.55 * s, 0, -1.0 * s, 0.55 * s, 0.3 * s, 1.0 * s);
    const body = lathe([[0.001, -0.78], [0.3, -0.62], [0.4, -0.1], [0.34, 0.5], [0.001, 0.66]], 8); body.rotateX(Math.PI / 2); body.scale(s, s * 0.95, s); body.translate(0, 0.78 * s, 0.05 * s);
    p.g('granite_grey', body);
    for (const [u, v] of [[-0.24, -0.5], [0.24, -0.5], [-0.22, 0.52], [0.22, 0.52]]) p.b('granite_grey', (u - 0.09) * s, 0.28 * s, (v - 0.09) * s, (u + 0.09) * s, 0.8 * s, (v + 0.09) * s);
    const chest = lathe([[0.001, 0.0], [0.26, 0.06], [0.3, 0.3], [0.2, 0.52], [0.001, 0.6]], 8); chest.translate(0, 0.98 * s, 0.62 * s); p.g('granite_grey', chest.scale(s, s, s * 0.9));
    p.b('granite_grey', -0.17 * s, 1.35 * s, 0.6 * s, 0.17 * s, 1.62 * s, 1.0 * s);
    p.b('granite_black', -0.1 * s, 1.36 * s, 0.9 * s, 0.1 * s, 1.44 * s, 1.02 * s);
    for (const q of [-1, 1]) {
      const w = box(-0.03 * s, 0.0, -0.5 * s, 0.03 * s, 0.7 * s, 0.4 * s); w.rotateZ(-q * 0.45); w.translate(q * 0.34 * s, 1.12 * s, -0.1 * s); p.g('granite_grey', w);
      p.b('granite_grey', q * 0.12 * s - 0.04 * s, 1.55 * s, 0.82 * s, q * 0.12 * s + 0.04 * s, 1.78 * s, 0.9 * s);
    }
    p.b('granite_grey', -0.07 * s, 0.9 * s, -0.78 * s, 0.07 * s, 1.0 * s, -0.4 * s);
    p.solid(-0.55 * s, 0, -1.0 * s, 0.55 * s, 1.7 * s, 1.0 * s);
  },
  // a bronze censer (boshanlu): the bowl on a stem and foot, the pierced lid like a mountain, a thread of smoke is the smoke.js's
  censer(p, o) {
    const s = o.s ?? 1;
    p.l('bronze', [[0.3 * s, 0], [0.3 * s, 0.06 * s], [0.08 * s, 0.14 * s], [0.07 * s, 0.7 * s], [0.34 * s, 0.82 * s], [0.4 * s, 1.0 * s], [0.34 * s, 1.14 * s], [0.001, 1.14 * s]], 0, 0, 0, 10);
    p.l('bronze', [[0.34 * s, 1.14 * s], [0.28 * s, 1.34 * s], [0.14 * s, 1.56 * s], [0.001, 1.72 * s]], 0, 0, 0, 8);
    p.b('bluestone', -0.45 * s, 0, -0.45 * s, 0.45 * s, 0.14 * s, 0.45 * s);
    p.round(0, 0, 0.45 * s, 0, 1.2 * s);
  },
  // a reed mat on the ground with a low lacquered table, cups, a jar of wine, a guqin or a bundle of bamboo slips: the poets' seat of the garden
  mat(p, o) {
    const r = rng(o.seed ?? 5), W = o.w ?? 2.4, D = o.d ?? 1.8;
    p.b('reed_mat', -W / 2, 0, -D / 2, W / 2, 0.035, D / 2);
    p.b('cloth_brown', -W / 2 - 0.01, 0.02, -D / 2 - 0.01, -W / 2 + 0.08, 0.06, D / 2 + 0.01); p.b('cloth_brown', W / 2 - 0.08, 0.02, -D / 2 - 0.01, W / 2 + 0.01, 0.06, D / 2 + 0.01);
    p.b('lacquer_black', -0.45, 0.2, -0.2, 0.45, 0.26, 0.2);
    for (const [u, v] of [[-0.38, -0.14], [0.38, -0.14], [-0.38, 0.14], [0.38, 0.14]]) p.b('lacquer_red', u - 0.03, 0.035, v - 0.03, u + 0.03, 0.2, v + 0.03);
    for (let k = 0; k < 3; k++) p.l('bronze', [[0.001, 0.0], [0.05, 0.02], [0.065, 0.07], [0.04, 0.07]], -0.3 + k * 0.17, 0.26, -0.08 + (k % 2) * 0.1, 6);
    p.l('pottery_dark', [[0.07, 0], [0.12, 0.09], [0.12, 0.2], [0.06, 0.28], [0.001, 0.28]], 0.32, 0.26, 0.05, 8);
    if (o.zither ?? r() < 0.5) { p.b('wood_dark', -0.55, 0.035, -D / 2 + 0.25, 0.55, 0.075, -D / 2 + 0.45); p.b('lacquer_black', -0.52, 0.075, -D / 2 + 0.29, 0.52, 0.09, -D / 2 + 0.41); }
    else for (let k = 0; k < 4; k++) p.b('bamboo_culm', 0.5 - k * 0.0, 0.26 + k * 0.025, -0.15, 0.78, 0.285 + k * 0.025, 0.15);
    p.round(0, 0, 0.5, 0, 0.3);
  },
  // a parked carriage (an official's che): two spoked wheels, the low body with its rail, the parasol canopy on a pole, the shafts and the yoke to the front (+z)
  chariot(p, o) {
    const cl = o.cloth ?? 'cloth_black', R = 0.62;
    for (const sg of [-1, 1]) {
      const wx = sg * 0.82;
      for (let k = 0; k < 10; k++) { const g = box(-0.05, R - 0.05, -0.19, 0.05, R + 0.05, 0.19); g.rotateX(k / 10 * 6.2832); g.translate(wx, R, 0); p.g('wood_dark', g); }
      for (let k = 0; k < 4; k++) { const g = box(-0.025, -R + 0.1, -0.025, 0.025, R - 0.1, 0.025); g.rotateX(k / 4 * Math.PI); g.translate(wx, R, 0); p.g('wood_ochre', g); }
      const hub = lathe([[0.001, -0.1], [0.09, -0.1], [0.1, 0.1], [0.001, 0.1]], 6); hub.rotateZ(Math.PI / 2); hub.translate(wx + sg * 0.06, R, 0); p.g('bronze', hub);
    }
    p.b('wood_dark', -0.84, R - 0.03, -0.03, 0.84, R + 0.03, 0.03);
    p.b('lacquer_red', -0.62, 0.7, -0.55, 0.62, 0.78, 0.55);
    p.b('lacquer_black', -0.62, 0.78, -0.55, 0.62, 1.2, -0.5); p.b('lacquer_black', -0.62, 0.78, -0.55, -0.57, 1.2, 0.55); p.b('lacquer_black', 0.57, 0.78, -0.55, 0.62, 1.2, 0.55);
    p.b('lacquer_black', -0.62, 1.0, 0.5, 0.62, 1.06, 0.56);
    p.b('wood_dark', -0.04, 1.2, -0.06, 0.04, 2.5, 0.06);
    p.l(cl, [[1.25, 2.28], [0.9, 2.46], [0.4, 2.58], [0.001, 2.68]], 0, 0, 0, 10);
    p.l('bronze', [[0.001, 2.68], [0.05, 2.7], [0.001, 2.86]], 0, 0, 0, 5);
    for (const sg of [-1, 1]) { p.b('wood_dark', sg * 0.38 - 0.04, 0.72, 0.1, sg * 0.38 + 0.04, 0.8, 3.1); p.b('wood_dark', sg * 0.38 - 0.04, 0.8, 3.0, sg * 0.38 + 0.04, 1.2, 3.1); }
    p.b('wood_dark', -0.7, 1.15, 3.05, 0.7, 1.22, 3.15);
    p.solid(-0.9, 0, -0.6, 0.9, 1.3, 0.6);
  },
  // a haystack-free field mark: a scarecrow-free watch-hut of straw on four poles (the field-watchers' hut)
  hut(p, o) {
    for (const [u, v] of [[-0.9, -0.9], [0.9, -0.9], [-0.9, 0.9], [0.9, 0.9]]) p.b('timber', u - 0.05, 0, v - 0.05, u + 0.05, 2.0, v + 0.05);
    p.b('timber', -1.0, 1.1, -1.0, 1.0, 1.18, 1.0);
    p.l('thatch', [[1.7, 1.95], [1.2, 2.5], [0.5, 3.0], [0.001, 3.3]], 0, 0, 0, 4);
  },
  // a pile of dressed timber and a saw-horse (the builders of the new capital)
  lumber(p, o) {
    for (let k = 0; k < 4; k++) p.b(k % 2 ? 'wood_ochre' : 'timber', -1.4, k * 0.18, -0.4 + (k % 2) * 0.03, 1.4, k * 0.18 + 0.17, 0.4);
    for (let k = 0; k < 3; k++) p.b('wood_dark', -1.2 + k * 1.2, 0.72, -0.5, -1.15 + k * 1.2, 0.77, 0.5);
    p.solid(-1.4, 0, -0.5, 1.4, 0.8, 0.5);
  },
};
/** wei_prop: { kind, at: [x, z], y, yaw, … kind's options } */
export function prop(el, ctx) {
  const f = KINDS[el.kind];
  if (!f) throw new Error('wei_prop: unknown kind ' + el.kind);
  f(new P(ctx, el.at[0], el.y ?? 0, el.at[1], el.yaw ?? 0), el);
}
export { KINDS as PROP_KINDS };
