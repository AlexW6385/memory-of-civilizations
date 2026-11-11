// The Avenue of the Dead's dressing and the pyramids' weathering (docs/settlements/teotihuacan.md §15):
// incense braziers along the plazas' sides, the worn way up the middle, drain slabs, litter of husks and
// petals, offerings at the altars, the masons re-laying the plaster floor (a lime trough, kneeling
// plasterers), sweepers, resting bearers, mat sellers, pilgrims, boys at play, dogs and turkeys; the Puma
// mural on the avenue's east platform before the Moon Plaza; and on the great pyramids the plaster
// fallen away, the red remnants and the damp streaks.

import { STYLES } from '../../core/build.js';
import { box, lathe } from '../../core/geom.js';
import { carved } from '../maya/meso.js';
import { bowlsKit } from '../maya/household.js';
import { patch } from '../maya/household.js';
import { inst, fig, rng } from './street.js';
import '../../objects/index.js';

const RD = 'stucco_red';

/** An incense brazier: a stone bowl on a tripod of stones, ash and embers in it, 0.7 m high; the chimney of the smoke above. */
export const brazierKit = () => carved('tt-brazier', (k) => {
  for (let i = 0; i < 3; i++) { const a = i * 2.094; k.seg('andesite', [Math.cos(a) * 0.2, 0, Math.sin(a) * 0.2], [Math.cos(a) * 0.12, 0.42, Math.sin(a) * 0.12], 0.05, 0.05, 0.04, 0.04); }
  k.geo('andesite', lathe([[0.001, 0.4], [0.2, 0.42], [0.3, 0.6], [0.29, 0.66], [0.24, 0.62], [0.001, 0.5]], 14));
  k.geo('plaster_grey', lathe([[0.001, 0.6], [0.24, 0.6], [0.001, 0.63]], 12));
  k.geo('cloth_black', lathe([[0.001, 0.62], [0.12, 0.62], [0.001, 0.65]], 8).translate(0.04, 0, 0));
});
/** A stone drain slab: a block with four slots, flush in the floor, 1 × 0.5 m. */
const drainKit = () => carved('tt-drain', (k) => {
  k.bx('andesite', -0.5, 0.5, 0, 0.05, -0.25, 0.25);
  for (let i = 0; i < 4; i++) k.bx('paint_minoan_black', -0.4 + i * 0.22, -0.4 + i * 0.22 + 0.1, 0.045, 0.07, -0.18, 0.18);
});
const huskKit = () => carved('tt-husk', (k) => { k.bx('cloth_ochre', -0.1, 0.1, 0, 0.008, -0.05, 0.05); k.bx('cloth_brown', -0.05, 0.07, 0.008, 0.012, -0.03, 0.04); });
const petalKit = () => carved('tt-petals', (k) => { for (let i = 0; i < 5; i++) k.bx(i % 2 ? 'cloth_red' : 'paint_cab_yellow', i * 0.05 - 0.1, i * 0.05 - 0.07, 0, 0.006, (i % 3) * 0.04 - 0.04, (i % 3) * 0.04 - 0.01); });
/** A lime trough: a timber box with wet lime, a paddle across it, a pair of mason's floats (stone smoothers). */
const troughKit = () => carved('tt-limetrough', (k) => {
  k.bx('timber', -0.55, 0.55, 0, 0.3, -0.3, -0.25); k.bx('timber', -0.55, 0.55, 0, 0.3, 0.25, 0.3); k.bx('timber', -0.55, -0.5, 0, 0.3, -0.3, 0.3); k.bx('timber', 0.5, 0.55, 0, 0.3, -0.3, 0.3);
  k.bx('timber', -0.5, 0.5, 0, 0.05, -0.25, 0.25); k.bx('lime_plaster', -0.5, 0.5, 0.05, 0.25, -0.25, 0.25);
  k.seg('timber', [-0.3, 0.45, 0.4], [0.3, 0.12, -0.2], 0.02, 0.02);
  k.bx('andesite', 0.7, 0.9, 0, 0.06, -0.05, 0.12); k.bx('andesite', 0.95, 1.1, 0, 0.05, 0.05, 0.2);
  k.geo('lime_plaster', lathe([[0.001, 0], [0.35, 0], [0.2, 0.06], [0.001, 0.07]], 9).translate(-1.1, 0, 0.1));
});
/** A load set down by a resting bearer: two baskets and a bundle on a carrying frame. */
const loadKit = () => carved('tt-load', (k) => {
  k.geo('wicker', lathe([[0.001, 0], [0.22, 0], [0.3, 0.3], [0.27, 0.32], [0.001, 0.28]], 10)); k.geo('cloth_ochre', lathe([[0.001, 0.28], [0.26, 0.3], [0.14, 0.42], [0.001, 0.44]], 8));
  k.geo('wicker', lathe([[0.001, 0], [0.18, 0], [0.24, 0.24], [0.001, 0.24]], 10).translate(0.5, 0, 0.1));
  k.seg('timber', [-0.1, 0.1, -0.5], [-0.1, 0.9, -0.4], 0.025, 0.025); k.seg('timber', [0.2, 0.1, -0.5], [0.2, 0.9, -0.4], 0.025, 0.025);
  k.geo('cloth_brown', lathe([[0.001, 0], [0.2, 0.05], [0.16, 0.3], [0.001, 0.34]], 8).translate(0.05, 0.1, -0.5));
});

/**
 * The puma of the avenue's mural (Uncovered History, "Puma mural on the Avenue of the Dead"): a feline in profile
 * walking on a red ground, spotted, a plumed crest, its mouth open with a drop of water; about 2 × 0.8 m, facing +x of the
 * kit, out of the wall toward +z. [inferred: the drawing after the mural's subject]
 */
const pumaKit = (flip) => carved(`tt-puma:${flip}`, (k) => {
  const s = flip ? -1 : 1, X = (x) => s * x, P = (x, y, z = 0.012) => [X(x), y, z];
  const B = 'paint_cab_yellow', D = 'paint_ochre', Z = 0.012;
  k.bx('stucco_red', -1.05, 1.05, 0, 0.82, -0.02, 0.004);
  k.seg(B, P(-0.62, 0.46), P(0.5, 0.5), Z, 0.15, Z, 0.17);
  k.seg(D, P(-0.6, 0.34), P(0.48, 0.38), Z * 0.8, 0.05, Z * 0.8, 0.05);                       // the belly's darker band
  for (const x of [-0.52, 0.34]) for (const dx of [0, 0.14]) k.seg(B, P(x + dx, 0.4, 0.014), P(x + dx * 1.3 + 0.03, 0.08, 0.014), 0.05, Z, 0.04, Z);
  k.seg(B, P(-0.62, 0.55), P(-0.95, 0.44), Z, 0.04, Z, 0.03); k.seg(B, P(-0.95, 0.44), P(-1.0, 0.7), Z, 0.03, Z, 0.025);   // the tail curling
  k.seg(B, P(0.46, 0.58), P(0.68, 0.66), Z, 0.12, Z, 0.1);                                    // neck, head
  k.seg(B, P(0.68, 0.64), P(0.86, 0.6), Z, 0.08, Z, 0.05);                                    // the muzzle
  k.seg(D, P(0.7, 0.52), P(0.82, 0.5), Z, 0.025, Z, 0.02);                                    // the lower jaw, open
  k.bx(RD, X(0.74) - 0.015, X(0.74) + 0.015, 0.505, 0.56, 0.012, 0.02);                      // the tongue
  for (const x of [0.6, 0.66]) k.seg(B, P(x, 0.72), P(x - 0.02, 0.82), Z, 0.02, Z, 0.01);     // the ears and the crest
  for (let i = 0; i < 5; i++) { const a = 0.4 + i * 0.3; k.seg('stucco_leaf', P(0.56, 0.76), [X(0.56 - Math.cos(a) * 0.3), 0.76 + Math.sin(a) * 0.1 + 0.05, 0.014], Z, 0.02, Z, 0.01); }
  k.disc('paint_minoan_black', X(0.72), 0.67, 0.02, 0.022, 0.012, 8);
  for (let i = 0; i < 9; i++) k.disc('paint_minoan_black', X(-0.5 + (i % 5) * 0.2 + (i > 4 ? 0.1 : 0)), 0.5 + (i > 4 ? -0.06 : 0.04), 0.02, 0.028, 0.012, 7);
  k.disc('maya_blue', X(0.9), 0.5, 0.012, 0.03, 0.012, 8); k.disc('maya_blue', X(0.92), 0.4, 0.012, 0.025, 0.012, 8);
  k.bx('paint_ochre', -1.05, 1.05, 0, 0.05, 0, 0.014); k.bx('paint_ochre', -1.05, 1.05, 0.77, 0.82, 0, 0.014);   // the border
});

/** The Puma mural: tt_puma { x, y, face (+1|−1: the wall's outward direction in x), runs: [[z0, z1]] }. */
export function ttPuma(el, { bag }) {
  const k0 = pumaKit(0), k1 = pumaKit(1), yaw = Math.atan2(el.face, 0);
  for (const [z0, z1] of el.runs) {
    const n = Math.floor((z1 - z0) / 2.3);
    for (let i = 0; i < n; i++) { const z = z0 + (z1 - z0) * (i + 0.5) / n; inst(bag, i % 4 === 3 ? k1 : k0, el.x, el.y, z, yaw, 1, 120); }
  }
}

/** tt_avenue { items: [{ k, x, z, y, ... }] } — the things and people of the plazas, placed by settlement/dress.js. */
export function ttAvenue(el, ctx) {
  const { bag, col } = ctx, L = STYLES.life.elements;
  for (const o of el.items) {
    const r = rng(o.seed || 1), y = o.y;
    switch (o.k) {
      case 'brazier': inst(bag, brazierKit(), o.x, y, o.z, 0, 1, 130); col.circle(o.x, o.z, 0.32, y, y + 0.7); break;
      case 'drain': inst(bag, drainKit(), o.x, y, o.z, o.rot || 0, 1, 100); break;
      case 'litter': for (let i = 0; i < 6; i++) inst(bag, r() < 0.6 ? huskKit() : petalKit(), o.x + (r() - 0.5) * 3, y, o.z + (r() - 0.5) * 3, r() * 6, 1, 45); break;
      case 'offering': inst(bag, bowlsKit(RD), o.x, y, o.z, r() * 6, 1, 70); break;
      case 'wear': bag.add('plaster_grey', box(o.x0, y + 0.005, o.z0, o.x1, y + 0.012, o.z1)); break;
      case 'crew': {
        // masons laying the floor: the lime trough, two kneeling at the fresh patch, a third carrying lime
        inst(bag, troughKit(), o.x, y, o.z, o.rot || 0, 1, 130); col.rect([o.x - 0.6, o.z - 0.4, o.x + 0.6, o.z + 0.4], y, y + 0.3);
        bag.add('lime_plaster', box(o.x - 3.2, y + 0.004, o.z + 1.2, o.x - 0.6, y + 0.016, o.z + 3.6));           // the fresh patch, whiter than the floor
        fig(ctx, { who: 'man', at: [o.x - 2.0, o.z + 2.0], y: y + 0.016, rot: 0.4, seed: o.seed + 1, pose: 'kneel' });
        fig(ctx, { who: 'man', at: [o.x - 1.2, o.z + 2.9], y: y + 0.016, rot: 2.5, seed: o.seed + 2, pose: 'kneel' });
        fig(ctx, { who: 'man', at: [o.x + 1.5, o.z + 0.6], y, rot: 1.0, seed: o.seed + 3, pose: 'stand', carry: 'pot' });
        break;
      }
      case 'sweeper': L.figure({ t: 'figure', at: [o.x, o.z], y, rot: o.rot, seed: o.seed, dress: 'wrap', over: 'shawl', hair: 'bun', cloth: 'cloth_ochre', cloth2: 'cloth_white', skin: 'skin_medium', hairMat: 'hide_black', feet: 'bare', carry: 'broom' }, ctx); break;
      case 'rest': {
        inst(bag, loadKit(), o.x, y, o.z, o.rot, 1, 100);
        fig(ctx, { who: o.who || 'man', at: [o.x + 1.0 * Math.cos(o.rot), o.z - 1.0 * Math.sin(o.rot)], y, rot: o.rot + 1.6, seed: o.seed, pose: 'sit_ground' });
        break;
      }
      case 'seller': {
        L.goods_mat({ t: 'goods_mat', at: [o.x, o.z], y, rot: o.rot || 0, goods: o.goods || ['basket', 'water_pot', 'dark_pot', 'heap'], seed: o.seed }, ctx);
        fig(ctx, { who: o.who || 'woman', at: [o.x, o.z - 0.9 * (o.side || 1)], y, rot: o.side > 0 ? Math.PI : 0, seed: o.seed + 1, pose: 'kneel' });
        break;
      }
      case 'group': {
        const n = o.n || 3;
        for (let i = 0; i < n; i++) { const a = i / n * 6.28 + 0.6; fig(ctx, { who: ['man', 'woman', 'elder', 'man'][i % 4], at: [o.x + Math.cos(a) * 0.8, o.z + Math.sin(a) * 0.8], y, rot: Math.atan2(Math.cos(a), Math.sin(a)) + 0 , seed: o.seed + i, pose: i % 2 ? 'talk' : 'stand' }); }
        break;
      }
      case 'boys': {
        for (let i = 0; i < 3; i++) fig(ctx, { who: 'child', at: [o.x + (i - 1) * 1.2, o.z + (i % 2) * 0.9], y, rot: r() * 6, seed: o.seed + i, pose: 'stand' });
        bag.add('maya_blue', lathe([[0.001, 0], [0.05, 0.05], [0.001, 0.1]], 8).translate(o.x + 0.2, y, o.z + 0.4));
        break;
      }
      case 'dog': L.animal({ t: 'animal', kind: 'dog', at: [o.x, o.z], y, rot: o.rot || 0, seed: o.seed, mat: 'hide_tan' }, ctx); break;
      case 'turkey': L.chickens({ t: 'chickens', kind: 'turkey', n: 3, at: [o.x, o.z], y, rot: o.rot || 0, seed: o.seed }, ctx); break;
      case 'priest': fig(ctx, { who: 'man', at: [o.x, o.z], y, rot: o.rot || 0, seed: o.seed, pose: 'stand' }); break;
      default: break;
    }
  }
}

// ---- weathering of the pyramids' faces -------------------------------------------------------------------------
/**
 * Over a pyramid's taludes: here and there the lime plaster fallen away to show the rubble core, a pale new patch beside it,
 * flakes of the old red paint, and streaks of damp running down from the ledges. `el` is the tt_pyramid element.
 */
export function weatherPyramid(bag, el) {
  const [cx, cz] = el.c, n = el.levels, H = el.h, tb = el.tablero ?? 0.35, y0b = el.y ?? 0, rand = rng(Math.floor(el.w * 31 + el.h * 7 + cx));
  const per = Math.max(2, Math.round((el.weather ?? 1) * 5));
  for (let k = 0; k < n; k++) {
    const t0 = k / n, t1 = (k + 1) / n, ya = y0b + H * t0, yb = y0b + H * t1, ht = yb - ya, yt = ya + ht * (1 - tb);
    const a = [(el.w - (el.w - el.tw) * t0) / 2, (el.d - (el.d - el.td) * t0) / 2], b = [(el.w - (el.w - el.tw) * t1) / 2, (el.d - (el.d - el.td) * t1) / 2];
    const sx = (a[0] - b[0]) * 0.85, sz = (a[1] - b[1]) * 0.85, hh = yt - ya;
    if (hh < 1) continue;
    for (const [fx, fz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const half = fx ? a[1] : a[0], ext = fx ? a[0] : a[1], sl = fx ? sx : sz, tilt = Math.atan2(sl, hh);
      const face = fx ? (fx > 0 ? 'e' : 'w') : (fz > 0 ? 's' : 'n');
      for (let i = 0; i < per; i++) {
        const u = (rand() * 2 - 1) * (half - 2), y = ya + hh * (0.12 + rand() * 0.8), e = ext - (y - ya) / hh * sl;
        if (face === el.stair && Math.abs(u) < (el.stairW ?? 12) / 2 + 1.5) continue;
        const roll = rand(), spall = roll < 0.4, red = roll > 0.8, w = spall ? 1.2 + rand() * 2.8 : red ? 0.8 + rand() * 1.6 : 0.5 + rand() * 0.8, h = spall ? 0.8 + rand() * 1.6 : red ? 0.5 + rand() : 1.6 + rand() * 2.4;
        const c = fx ? [cx + fx * e, y, cz + u] : [cx + u, y, cz + fz * e];
        const mat = spall ? 'rubble_teo' : red ? RD : 'plaster_damp';
        patch(bag, mat, c, [fx, 0, fz], w, Math.min(h, hh * 0.9), Math.floor(rand() * 1e6), spall ? 0.006 : 0.004, tilt);
        if (spall && rand() < 0.6) patch(bag, 'lime_plaster', [c[0] + (fx ? 0 : w * 0.7), Math.min(yt - 0.2, y + h * 0.2), c[2] + (fx ? w * 0.7 : 0)], [fx, 0, fz], w * 0.8, h * 0.7, Math.floor(rand() * 1e6), 0.009, tilt);
      }
    }
  }
}
