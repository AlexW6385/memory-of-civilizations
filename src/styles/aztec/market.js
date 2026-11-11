// The tianguis of Tenochtitlan (docs/settlements/tenochtitlan.md §14): a market after Tlatelolco's, each row of stalls
// one kind of goods ("every kind of merchandise had its fixed place": Díaz), the sellers squatting on reed mats behind
// their goods, awnings of matting, goods hung from a back beam, porticoes along three sides ("toda cercada de portales":
// Cortés), and the pavilion of the market's judges. The stalls' plan comes from the settlement (market.js): el.stalls.

import { STYLES } from '../../core/build.js';
import { box, frustum, lathe } from '../../core/geom.js';
import { Kit } from '../maya/meso.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const Y = 0.04;                                                             // the market floor
const heap = (k, mat, x, z, R, h) => k.geo(mat, lathe([[R, 0], [R * 0.62, h * 0.6], [0.001, h]], 10).translate(x, 0.03, z));
const ball = (k, mat, x, y, z, r) => k.geo(mat, lathe([[0.001, 0], [r * 0.8, r * 0.25], [r, r], [r * 0.8, r * 1.75], [0.001, r * 2]], 8).translate(x, y, z));
/** A body of revolution lying along z. */
const lay = (g, x, y, z) => g.rotateX(Math.PI / 2).translate(x, y, z);
const bundle = (k, mat, x, y, z, len, r, tilt = 0) => k.geo(mat, lathe([[r, 0], [r, len], [0.001, len + r * 0.5]], 7).rotateZ(tilt).translate(x, y, z));

const FRUITS = ['paint_ochre', 'clay_green', 'stucco_rose'];
/** The goods of each trade in a stall's frame: u across (±1.1), v toward the aisle (the mat spans −0.8…0.8), y from the mat. */
const GOODS = {
  maize(k, r, W) {
    heap(k, 'paint_ochre', -0.55, 0.35, 0.42, 0.32); heap(k, 'paint_ochre', 0.3, 0.38, 0.36, 0.28);
    for (let i = 0; i < 7; i++) k.seg('paint_ochre', [0.55, 0.04 + (i > 3 ? 0.07 : 0), 0.1 + (i % 4) * 0.1], [0.95, 0.04 + (i > 3 ? 0.07 : 0), 0.1 + (i % 4) * 0.1], 0.035, 0.035);
    W.sacks(0.75, -0.1, 3);
  },
  beans(k, r) { heap(k, 'wood_dark', -0.65, 0.4, 0.34, 0.25); heap(k, 'stucco_red', 0, 0.4, 0.34, 0.25); heap(k, 'plaster_white', 0.65, 0.4, 0.3, 0.22); heap(k, 'paint_ochre', 0.0, -0.1, 0.3, 0.2); },
  chile(k, r) {
    heap(k, 'stucco_red', -0.6, 0.38, 0.38, 0.26); heap(k, 'clay_green', 0.05, 0.4, 0.34, 0.24); heap(k, 'limewash_red', 0.7, 0.38, 0.3, 0.22);
    for (let i = 0; i < 6; i++) ball(k, 'stucco_red', -0.3 + i * 0.12, 0.03, -0.15 + (i % 2) * 0.12, 0.05);   // tomatoes
    for (let i = 0; i < 5; i++) k.seg('stucco_red', [-0.8 + i * 0.4, 1.85, -0.7], [-0.8 + i * 0.4, 1.2, -0.7], 0.03, 0.03, 0.05, 0.05);      // strings of chiles
  },
  fruit(k, r) {
    for (let i = 0; i < 4; i++) ball(k, FRUITS[i % 2], -0.8 + i * 0.28, 0.03, 0.4, 0.13);                                                      // squash
    for (let i = 0; i < 10; i++) ball(k, 'stucco_rose', 0.2 + (i % 4) * 0.13 + (i > 6 ? 0.06 : 0), 0.03 + (i > 3 ? (i > 6 ? 0.18 : 0.09) : 0), 0.35 + (i % 2) * 0.1, 0.06);   // prickly pears
    for (let i = 0; i < 4; i++) k.bx('clay_green', -0.7, -0.1, 0.03 + i * 0.03, 0.06 + i * 0.03, -0.1 + i * 0.01 - 0.1, 0.25 - i * 0.02 - 0.1);   // nopal pads
  },
  fish(k, r) {
    for (let i = 0; i < 7; i++) k.geo('hide_grey', lay(lathe([[0.001, 0], [0.045, 0.08], [0.06, 0.2], [0.04, 0.34], [0.015, 0.42], [0.001, 0.46]], 8).scale(1, 0.55, 1), -0.9 + i * 0.28, 0.06, 0.12 + (i % 2) * 0.22 - 0.2));
    heap(k, 'aluminium_dull', 0.75, 0.35, 0.3, 0.12);
    for (let i = 0; i < 4; i++) k.geo('hide_grey', lathe([[0.001, 0], [0.05, 0.06], [0.055, 0.2], [0.02, 0.38], [0.001, 0.43]], 8).scale(1, 1, 0.5).translate(-0.7 + i * 0.45, 1.45, -0.7));   // drying on the line
  },
  fowl(k, r) {
    k.bx('wicker', -1.0, -0.15, 0.0, 0.03, 0.05, 0.75);
    for (const [x, z] of [[-1.0, 0.05], [-0.15, 0.05], [-1.0, 0.75], [-0.15, 0.75]]) k.bx('wood_dark', x - 0.03, x + 0.03, 0.0, 0.6, z - 0.03, z + 0.03);
    for (let i = 0; i < 7; i++) { const t = -1.0 + i * 0.14; k.bx('wicker', t, t + 0.025, 0.03, 0.55, 0.04, 0.06); k.bx('wicker', t, t + 0.025, 0.03, 0.55, 0.74, 0.76); }
    k.bx('wicker', -1.03, 0.0, 0.55, 0.58, 0.02, 0.78);
    for (const [x, z, a] of [[-0.7, 0.3, 0], [-0.4, 0.5, 1]]) {                                                                               // turkeys (huexolotl)
      k.geo('hide_black', lathe([[0.001, 0], [0.12, 0.05], [0.14, 0.15], [0.09, 0.28], [0.001, 0.3]], 9).scale(1, 0.8, 1.35).translate(x, 0.05, z));
      k.seg('hide_black', [x, 0.2, z + 0.15 * (a ? -1 : 1)], [x, 0.4, z + 0.17 * (a ? -1 : 1)], 0.03, 0.03, 0.02, 0.02); ball(k, 'stucco_red', x - 0.02, 0.4, z + 0.17 * (a ? -1 : 1), 0.03);
    }
    for (let i = 0; i < 4; i++) { const x = 0.1 + i * 0.28; k.seg('wood_dark', [x, 1.55, -0.7], [x, 1.4, -0.7], 0.01, 0.01); k.geo('hide_brown', lathe([[0.001, 0], [0.07, 0.08], [0.08, 0.2], [0.04, 0.3], [0.001, 0.34]], 8).scale(1, 1, 0.7).rotateX(Math.PI).translate(x, 1.4, -0.7)); ball(k, 'clay_green', x, 1.0, -0.7, 0.03); }
  },
  pots(k, r, W) {
    W.pot(-0.6, 0.3, 'water_pot', 3); W.pot(0.45, 0.35, 'dark_pot', 3);
    for (let i = 0; i < 4; i++) k.geo('terracotta', lathe([[0.3, 0], [0.31, 0.02], [0.001, 0.02]], 14).translate(0.0, 0.03 + i * 0.025, -0.25));   // comals
    for (let i = 0; i < 3; i++) k.geo('pottery_dark', lathe([[0.001, 0], [0.1, 0.02], [0.18, 0.11], [0.12, 0.11], [0.001, 0.04]], 10).translate(-0.3 + i * 0.4, 0.03, 0.0));
  },
  baskets(k, r, W) {
    W.basket(-0.5, 0.35, 3);
    for (let i = 0; i < 3; i++) k.geo('reed_mat', lathe([[0.15, 0], [0.15, 1.1], [0.001, 1.1]], 8).rotateZ(0.12 * (i - 1)).translate(0.5 + i * 0.22, 0.03, -0.45));         // petates standing
    for (let i = 0; i < 3; i++) k.bx('reed_mat', 0.2, 0.9, 0.03 + i * 0.03, 0.06 + i * 0.03, 0.15, 0.62);
  },
  cloth(k, r) {
    const C = ['cloth_white', 'cloth_ochre', 'cloth_red', 'cloth_indigo', 'cloth_blue', 'cloth_green'];
    for (let i = 0; i < 4; i++) k.bx(C[Math.floor(r() * 6)], -0.9, -0.1, 0.03 + i * 0.1, 0.12 + i * 0.1, 0.1, 0.62);                     // folded mantles (tilmatli)
    for (let i = 0; i < 3; i++) k.bx(C[Math.floor(r() * 6)], 0.2, 0.9, 0.03 + i * 0.1, 0.12 + i * 0.1, 0.1, 0.62);
    for (const x of [-0.5, 0.5]) { k.bx('cloth_white', x - 0.4, x + 0.4, 0.75, 1.75, -0.72, -0.69); for (const [y, m] of [[0.9, 'cloth_red'], [1.05, 'cloth_indigo'], [1.6, 'cloth_ochre']]) k.bx(m, x - 0.4, x + 0.4, y, y + 0.07, -0.69, -0.675); }   // hung, banded
  },
  feathers(k, r) {
    k.bx('wood_dark', -1.0, 1.0, 1.55, 1.6, -0.75, -0.7);
    const cols = ['clay_green', 'cloth_blue', 'stucco_red', 'paint_ochre'];
    for (let i = 0; i < 5; i++) {                                                                                                          // plumes in fans on the beam
      const x = -0.8 + i * 0.4, c = cols[i % 4];
      for (let j = -2; j <= 2; j++) k.seg(c, [x, 1.5, -0.7], [x + j * 0.07, 1.5 - 0.55 - (i % 2) * 0.15, -0.62], 0.012, 0.004, 0.035, 0.004);
    }
    for (let i = 0; i < 4; i++) { k.bx('cloth_white', -0.85 + i * 0.25, -0.65 + i * 0.25, 0.03, 0.16, 0.25, 0.6); k.seg(cols[i], [-0.75 + i * 0.25, 0.16, 0.42], [-0.65 + i * 0.25, 0.4, 0.45], 0.02, 0.006, 0.03, 0.006); }
  },
  cacao(k, r, W) {
    heap(k, 'wood_dark', -0.55, 0.4, 0.3, 0.2); heap(k, 'wood_dark', 0.1, 0.4, 0.28, 0.2);
    for (let i = 0; i < 5; i++) k.geo('paint_ochre', lathe([[0.001, 0], [0.05, 0.07], [0.055, 0.15], [0.03, 0.22], [0.001, 0.25]], 8).rotateZ(Math.PI / 2).translate(0.5 + (i % 3) * 0.12, 0.09 + (i > 2 ? 0.1 : 0), 0.2 + (i % 2) * 0.1));
    W.sacks(0.7, -0.15, 2);
  },
  honey(k, r) { for (let i = 0; i < 5; i++) k.geo('terracotta', lathe([[0.001, 0], [0.1, 0.03], [0.14, 0.14], [0.08, 0.24], [0.06, 0.28], [0.001, 0.28]], 10).translate(-0.8 + i * 0.4, 0.03, i % 2 ? 0.2 : 0.4)); },
  obsidian(k, r) {
    k.bx('cloth_white', -0.9, 0.6, 0.03, 0.045, 0.1, 0.7);
    for (let i = 0; i < 12; i++) k.seg('obsidian', [-0.85 + i * 0.12, 0.05, 0.2], [-0.85 + i * 0.12, 0.05, 0.58], 0.018, 0.012, 0.004, 0.004);       // knives of obsidian and flint
    for (let i = 0; i < 4; i++) { const x = 0.75 + (i % 2) * 0.17, z = 0.2 + Math.floor(i / 2) * 0.3; k.seg('timber', [x, 0.03, z], [x, 0.03, z + 0.26], 0.012, 0.012); k.bx('bronze', x - 0.05, x + 0.05, 0.03, 0.08, z + 0.24, z + 0.3); }   // copper axes
    heap(k, 'granite_black', 0.0, -0.1, 0.18, 0.12);
  },
  salt(k, r) { for (let i = 0; i < 8; i++) k.geo('plaster_white', lathe([[0.17, 0], [0.18, 0.05], [0.001, 0.05]], 10).translate(-0.9 + (i % 4) * 0.4, 0.03 + Math.floor(i / 4) * 0.06, 0.3 + Math.floor(i / 4) * 0.1)); heap(k, 'plaster_white', 0.3, 0.45, 0.38, 0.28); heap(k, 'plaster_white', 0.85, 0.2, 0.25, 0.18); },
  firewood(k, r) {
    for (let j = 0; j < 3; j++) for (let i = 0; i < 4 - j; i++) k.seg('timber', [-0.95 + i * 0.12 + j * 0.06, 0.08 + j * 0.1, 0.1], [-0.95 + i * 0.12 + j * 0.06, 0.08 + j * 0.1, 0.7], 0.05, 0.05);
    heap(k, 'granite_black', 0.35, 0.3, 0.32, 0.22);
    for (let i = 0; i < 6; i++) k.seg('wood_dark', [0.85 + i * 0.03, 0.05, -0.3], [0.7 + i * 0.03, 1.1, -0.45], 0.015, 0.015, 0.012, 0.012);   // torch pine
  },
  herbs(k, r) {
    k.bx('wood_dark', -1.0, 1.0, 1.55, 1.6, -0.75, -0.7);
    for (let i = 0; i < 7; i++) k.geo(i % 3 ? 'clay_green' : 'flax_leaf', lathe([[0.001, 0], [0.09, 0.28], [0.03, 0.34]], 7).rotateX(Math.PI).translate(-0.85 + i * 0.28, 1.5, -0.7));
    for (let i = 0; i < 3; i++) ball(k, 'paint_ochre', 0.2 + i * 0.18, 0.03, 0.4, 0.07);                                                     // balls of copal
    k.bx('clay_green', -0.8, -0.1, 0.03, 0.12, 0.15, 0.6);
  },
  cooked(k, r, W) {
    for (let i = 0; i < 3; i++) { const a = i * 2.094; k.geo('andesite', lathe([[0.001, 0], [0.09, 0.02], [0.07, 0.22], [0.001, 0.22]], 8).translate(-0.55 + Math.cos(a) * 0.22, 0.03, -0.1 + Math.sin(a) * 0.22)); }
    k.geo('terracotta', lathe([[0.001, 0.22], [0.36, 0.22], [0.36, 0.25], [0.001, 0.25]], 14).translate(-0.55, 0.03, -0.1));                    // the comal
    k.geo('flame', lathe([[0.1, 0.0], [0.05, 0.12], [0.001, 0.2]], 7).translate(-0.55, 0.05, -0.1));
    for (let i = 0; i < 5; i++) k.geo('limestone_yellow', lathe([[0.17, 0], [0.17, 0.012], [0.001, 0.012]], 10).translate(-0.55 + (i - 2) * 0.03, 0.292 + i * 0.012, -0.1));
    for (let i = 0; i < 6; i++) k.geo('limestone_yellow', lathe([[0.16, 0], [0.16, 0.012], [0.001, 0.012]], 10).translate(0.2, 0.03 + i * 0.014, 0.4));                 // tortillas
    for (let i = 0; i < 6; i++) k.seg('thatch', [0.55 + (i % 3) * 0.13, 0.06 + (i > 2 ? 0.07 : 0), 0.2], [0.55 + (i % 3) * 0.13, 0.06 + (i > 2 ? 0.07 : 0), 0.5], 0.045, 0.04);   // tamales
    k.geo('pottery_dark', lathe([[0.001, 0], [0.18, 0.03], [0.24, 0.2], [0.17, 0.34], [0.001, 0.34]], 12).translate(0.0, 0.03, 0.55));
  },
  pulque(k, r, W) {
    k.geo('pottery_dark', lathe([[0.001, 0], [0.22, 0.04], [0.36, 0.3], [0.3, 0.62], [0.22, 0.68], [0.001, 0.68]], 14).translate(-0.6, 0.03, 0.2));
    k.geo('plaster_white', lathe([[0.001, 0], [0.2, 0.0], [0.2, 0.01], [0.001, 0.01]], 12).translate(-0.6, 0.71, 0.2));
    for (let i = 0; i < 4; i++) k.geo('clay_green', lathe([[0.001, 0], [0.06, 0.02], [0.08, 0.1], [0.06, 0.12], [0.04, 0.1]], 8).translate(0.1 + i * 0.22, 0.03, 0.4 - (i % 2) * 0.12));    // gourd cups
    k.geo('terracotta', lathe([[0.001, 0], [0.14, 0.05], [0.18, 0.2], [0.1, 0.32], [0.001, 0.32]], 10).translate(0.3, 0.03, -0.15));
  },
  jewels(k, r) {
    k.bx('cloth_white', -0.7, 0.7, 0.03, 0.045, 0.1, 0.65);
    for (let i = 0; i < 7; i++) ball(k, i % 2 ? 'inlay_jade' : 'tile_turquoise', -0.5 + i * 0.13, 0.045, 0.28 + (i % 3) * 0.1, 0.03);
    for (let i = 0; i < 3; i++) k.geo('gold', lathe([[0.07, 0], [0.07, 0.012], [0.001, 0.012]], 10).translate(0.1 + i * 0.2, 0.045, 0.3));
    k.bx('timber', 0.45, 0.8, 0.045, 0.16, 0.2, 0.42);
  },
  rope(k, r) {
    for (let i = 0; i < 3; i++) k.geo('rope_fibre', lathe([[0.18, 0], [0.26, 0], [0.26, 0.08], [0.18, 0.08], [0.18, 0]], 14).translate(-0.7 + i * 0.1, 0.03 + i * 0.08, 0.4));
    for (let i = 0; i < 4; i++) k.bx('plaster_white', 0.2, 0.7, 0.03 + i * 0.03, 0.06 + i * 0.03, 0.15, 0.55);                              // bark paper (amatl)
    bundle(k, 'rope_fibre', 0.9, 0.03, 0.2, 0.7, 0.07, 1.4);
  },
};

/** A stall's frame helpers into the world. */
function stallBuilder(s, ctx) {
  const { bag, col } = ctx, L = STYLES.life.elements, R = rng(s.seed), k = new Kit();
  const w = (u, v) => [s.cx - s.sgn * u, s.cz + s.sgn * v];
  const W = {
    sacks: (u, v, n) => L.sacks({ at: w(u, v), y: Y + 0.03, rot: R() * 6, n, seed: s.seed }, ctx),
    pot: (u, v, kind, n) => L.pot({ at: w(u, v), y: Y + 0.03, seed: s.seed, kind, n }, ctx),
    basket: (u, v, n) => L.basket({ at: w(u, v), y: Y + 0.03, seed: s.seed, n }, ctx),
  };
  k.bx('reed_mat', -1.1, 1.1, 0, 0.03, -0.8, 0.8);
  GOODS[s.trade](k, R, W);
  if (s.awning) {                                                                                                                       // matting on four poles, its front edge lower
    for (const [u, v, h] of [[-1.15, -0.85, 2.15], [1.15, -0.85, 2.15], [-1.15, 0.85, 1.95], [1.15, 0.85, 1.95]]) k.bx('timber', u - 0.04, u + 0.04, 0, h, v - 0.04, v + 0.04);
    k.hex(R() < 0.6 ? 'reed_mat' : 'cloth_white', [[-1.3, 2.13, -0.95], [1.3, 2.13, -0.95], [1.3, 1.93, 0.95], [-1.3, 1.93, 0.95], [-1.3, 2.18, -0.95], [1.3, 2.18, -0.95], [1.3, 1.98, 0.95], [-1.3, 1.98, 0.95]]);
  } else if (['fish', 'fowl', 'herbs', 'feathers', 'cloth', 'chile'].includes(s.trade)) {
    for (const u of [-1.05, 1.05]) k.bx('timber', u - 0.04, u + 0.04, 0, 1.75, -0.78, -0.7);
    k.bx('timber', -1.1, 1.1, 1.7, 1.78, -0.78, -0.7);
  }
  return { k, w };
}

/**
 * tianguis { rect, stalls: [...] (settlement market.js), judges: [x0, z0, x1, z1], seed }: the floor, the porticoes on the north,
 * south and east sides, the stalls with their goods and sellers, the judges' pavilion, buyers and porters in the aisles.
 */
export function tianguis(el, ctx) {
  const { bag, col } = ctx, [x0, z0, x1, z1] = el.rect, rand = rng(el.seed || 1519), L = STYLES.life.elements;
  bag.add('stucco', frustum([x0, z0, x1, z1], -0.2, Y, 0, 0, 0, 0, { noBottom: true })); col.floor([x0, z0, x1, z1], Y);
  // ---- the porticoes: square piers on stone bases, a beam, joists and a flat plastered roof with a red band
  const D = 2.8, H = 3.1, PH = 0.2, skip = el.aisleX ?? [];
  const portico = (a, b, along) => {                                              // along 'x': a→b on x at z-span; 'z'
    const [r0, r1] = along === 'x' ? [a[0], b[0]] : [a[1], b[1]], n = Math.max(2, Math.round((r1 - r0) / 3.6));
    for (let i = 0; i <= n; i++) {
      const t = r0 + (r1 - r0) * i / n;
      if (along === 'x' && skip.some((q) => Math.abs(q - t) < 1.4)) continue;
      const rc = along === 'x' ? [t - 0.25, a[1], t + 0.25, b[1]] : [a[0], t - 0.25, b[0], t + 0.25];
      bag.add('andesite', box(rc[0] - 0.05, Y, rc[1] - 0.05, rc[2] + 0.05, Y + 0.25, rc[3] + 0.05));
      bag.add('plaster_white', box(rc[0], Y + 0.25, rc[1], rc[2], H, rc[3])); col.rect(rc, Y, H);
    }
    const rr = along === 'x' ? [a[0] - 0.3, a[1] - 0.2, b[0] + 0.3, b[1] + 0.2] : [a[0] - 0.2, a[1] - 0.3, b[0] + 0.2, b[1] + 0.3];
    bag.add('timber', box(rr[0], H, rr[1], rr[2], H + 0.3, rr[3]));
    const nj = Math.round((along === 'x' ? rr[2] - rr[0] : rr[3] - rr[1]) / 0.6);
    for (let j = 0; j < nj; j++) { const t = (along === 'x' ? rr[0] : rr[1]) + 0.3 + j * 0.6; bag.add('viga', along === 'x' ? box(t - 0.07, H + 0.3, rr[1] - 0.15, t + 0.07, H + 0.46, rr[3] + 0.15) : box(rr[0] - 0.15, H + 0.3, t - 0.07, rr[2] + 0.15, H + 0.46, t + 0.07)); }
    bag.add('plaster_white', box(rr[0] - 0.1, H + 0.46, rr[1] - 0.15, rr[2] + 0.1, H + 0.58, rr[3] + 0.15));
    bag.add('stucco_red', along === 'x' ? box(rr[0] - 0.1, H + 0.46, rr[3] + 0.14, rr[2] + 0.1, H + 0.58, rr[3] + 0.16) : box(rr[0] - 0.16, H + 0.46, rr[1], rr[0] - 0.14, H + 0.58, rr[3]));
  };
  portico([x0 + 0.5, z0 + 0.3], [x1 - 0.5, z0 + D - 0.3], 'x');
  portico([x0 + 0.5, z1 - D + 0.3], [x1 - 0.5, z1 - 0.3], 'x');
  portico([x1 - D + 0.3, z0 + D], [x1 - 0.3, z1 - D], 'z');
  // ---- the stalls, each with its seller squatting on the mat behind the goods, facing the aisle
  for (const s of el.stalls) {
    const { k, w } = stallBuilder(s, ctx);
    k.emit(bag, s.cx, Y, s.cz, 0, s.sgn);
    const [sx, sz] = w(0.25 + (rand() - 0.5) * 0.7, -0.45), f = s.seller === 'f';
    L.figure({ at: [sx, sz], y: Y + 0.03, rot: s.sgn > 0 ? Math.PI : 0, seed: s.seed, pose: 'squat', dress: f ? 'robe' : 'loincloth', over: f ? 'none' : 'cape', hair: f ? 'bun' : 'short', hairMat: 'hair_dark',
      cloth: rand() < 0.65 ? 'cloth_white' : 'cloth_ochre', cloth2: ['cloth_red', 'cloth_indigo', 'cloth_ochre', 'cloth_white'][Math.floor(rand() * 4)], skin: 'skin_medium', feet: 'bare' }, ctx);
  }
  // ---- the judges' pavilion: a low platform, a flat roof on four piers, three judges seated on mats before the aisle
  if (el.judges) {
    const [a0, b0, a1, b1] = el.judges, yy = Y + 0.45, H2 = 3.0;
    bag.add('andesite', box(a0, Y, b0, a1, yy, b1)); col.floor([a0, b0, a1, b1], yy);
    for (const [px, pz] of [[a0 + 0.4, b0 + 0.4], [a1 - 0.4, b0 + 0.4], [a0 + 0.4, b1 - 0.4], [a1 - 0.4, b1 - 0.4], [(a0 + a1) / 2, b0 + 0.4]]) { bag.add('timber', box(px - 0.18, yy, pz - 0.18, px + 0.18, yy + H2, pz + 0.18)); col.rect([px - 0.18, pz - 0.18, px + 0.18, pz + 0.18], yy, yy + H2); }
    bag.add('timber', box(a0 - 0.2, yy + H2, b0 - 0.2, a1 + 0.2, yy + H2 + 0.3, b1 + 0.2));
    bag.add('plaster_white', box(a0 - 0.3, yy + H2 + 0.3, b0 - 0.3, a1 + 0.3, yy + H2 + 0.5, b1 + 0.3));
    bag.add('stucco_red', box(a0 - 0.3, yy + H2 + 0.3, b0 - 0.31, a1 + 0.3, yy + H2 + 0.5, b0 - 0.3));
    bag.add('plaster_white', box(a0 + 0.1, yy, b0, a1 - 0.1, yy + 1.2, b0 + 0.25));                                                // back wall
    bag.add('reed_mat', box(a0 + 0.8, yy, b0 + 0.6, a1 - 0.8, yy + 0.03, b1 - 0.5));
    for (let i = 0; i < 3; i++) L.figure({ at: [a0 + 2.2 + i * 2.2, b0 + 1.7], y: yy + 0.03, rot: Math.PI, seed: 900 + i, pose: 'cross', dress: 'loincloth', over: 'cape', cloth: 'cloth_blue', cloth2: i === 1 ? 'cloth_white' : 'cloth_blue', hair: 'short', hairMat: 'hair_dark', skin: 'skin_medium' }, ctx);
    L.pot({ at: [a1 - 1.0, b1 - 1.0], y: yy, seed: 1, kind: 'water_pot', n: 1 }, ctx);
  }
  // ---- buyers and porters in the aisles
  for (const [ax, az] of el.aisleSpots ?? []) {
    const f = rand() < 0.5, porter = !f && rand() < 0.35, seed = Math.floor(rand() * 1e6);
    L.figure({ at: [ax, az], y: Y, rot: rand() * 6.28, seed, h: f ? 1.5 : 1.62, dress: f ? 'robe' : 'loincloth', cloth: rand() < 0.7 ? 'cloth_white' : 'cloth_ochre', cloth2: ['cloth_red', 'cloth_indigo', 'cloth_white'][Math.floor(rand() * 3)],
      skin: 'skin_medium', hair: f ? 'bun' : 'short', hairMat: 'hair_dark', feet: 'bare', over: f ? 'none' : rand() < 0.6 ? 'cape' : 'none', carry: porter ? 'bundle' : f && rand() < 0.5 ? 'basket' : 'none', pose: !porter && rand() < 0.4 ? 'talk' : 'stand' }, ctx);
  }
}
