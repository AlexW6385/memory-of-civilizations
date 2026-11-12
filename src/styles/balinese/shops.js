// The trades of the village street (docs/settlements/bali-village.md §4.5): a stall of the trade in the front of the compound, the street wall opened on it — open to
// the street on a raised plinth, brick and woven bamboo on three sides, a thatched hip roof over, and the goods of the trade in it: you walk up the two steps and in.
// Kinds: warung (the food stall), pande (the smith), carver (stone and wood), weaver, offerings (canang and janur), potter, cloth, basket.
import { lathe } from '../../core/geom.js';
import { bx, post, thatchHip, steps, coping, canang, rng } from './kit.js';
import { guardian } from './stone.js';

const hex = (n, k = 0.7) => n * k;
/**
 * bali_shop: { rect (the lot), front ('n' | 's' | 'e' | 'w': the side of the street), shop: { kind, u0, u1, d }, seed, y } — u along the street from the left as one looks
 * into the lot from it, v inward from the lot's edge; the stall fills u0..u1, 0..d.
 */
export function shop(el, ctx) {
  const [x0, z0, x1, z1] = el.rect, f = el.front, y = el.y ?? 0, { kind, u0, u1, d: D } = el.shop, rand = rng(el.seed ^ 0x9e37);
  const P = (u, v) => (f === 'n' ? [x0 + u, z0 + v] : f === 's' ? [x1 - u, z1 - v] : f === 'w' ? [x0 + v, z1 - u] : [x1 - v, z0 + u]);
  const R = (a, b, c, d) => { const p = P(a, b), q = P(c, d); return [Math.min(p[0], q[0]), Math.min(p[1], q[1]), Math.max(p[0], q[0]), Math.max(p[1], q[1])]; };
  const inward = f === 'n' ? 's' : f === 's' ? 'n' : f === 'w' ? 'e' : 'w';
  const B = (mat, a, b, c, d, ya, yb, solid = false) => { const r = R(a, b, c, d); bx(ctx, mat, r[0], ya, r[1], r[2], yb, r[3], solid); };
  const pt = (mat, u, v, ya, r, h, prof = null) => { const p = P(u, v); ctx.bag.add(mat, lathe(prof ?? [[0.001, 0], [r, 0.02], [r * 1.15, h * 0.45], [r * 0.7, h * 0.9], [r * 0.6, h]], 8, null, p[0], ya, p[1])); };
  const sw = u1 - u0, um = (u0 + u1) / 2, pl = 0.3, fl = y + pl, H = 2.5;
  // plinth and floor, the steps to the street, the roof's eave over the verge
  B('brick', u0 - 0.15, -0.05, u1 + 0.15, D + 0.15, y - 0.3, fl - 0.05);
  B('wood_ochre', u0, 0, u1, D, fl - 0.04, fl);
  { const r = R(u0, 0, u1, D); ctx.col.floor(r, fl); }
  { const r = R(um - 0.9, -0.62, um + 0.9, 0); steps(ctx, r, y, fl, inward, 'tuff_hewn', 0.15, y - 0.3); }
  const b = (a, c, d, e) => { B('brick', a, c, d, e, fl, fl + 0.9, true); B('wicker', a, c, d, e, fl + 0.9, fl + H - 0.25, true); };
  b(u0, D - 0.18, u1, D);                                   // the back
  b(u0, 0.1, u0 + 0.18, D); b(u1 - 0.18, 0.1, u1, D);        // the sides
  for (const u of [u0 + 0.12, u1 - 0.12]) { const p = P(u, 0.14); post(ctx, 'wood_painted', p[0], p[1], fl, fl + H, 0.1, true); }
  B('wood_painted', u0 - 0.1, 0.04, u1 + 0.1, 0.24, fl + H - 0.3, fl + H - 0.08);       // the front beam
  { const c = R(u0 - 0.7, -0.7, u1 + 0.7, D + 0.7), A = (c[2] - c[0]) / 2, Bz = (c[3] - c[1]) / 2; thatchHip(ctx, { c: [(c[0] + c[2]) / 2, (c[1] + c[3]) / 2], A, B: Bz, y: fl + H, rise: 1.25, mat: kind === 'pande' ? 'thatch' : 'thatch_palm', pow: 1.3 }); }
  coping(ctx, ...R(u0, D - 0.18, u1, D).slice(0, 2), ...R(u0, D - 0.18, u1, D).slice(2), fl + 0.9, 'tuff_hewn');
  // an offering at the post and the shelf at the back, common to all
  { const p = P(u0 + 0.12, 0.45); canang(ctx, p[0], fl + 1.05, p[1], 1); }
  B('wood_dark', u0 + 0.25, D - 0.5, u1 - 0.25, D - 0.2, fl + 1.15, fl + 1.2);
  const shelf = (ya, items, mats) => items.forEach((u, i) => pt(mats[i % mats.length], u, D - 0.38, ya, 0.1 + 0.03 * (i % 3), 0.2));
  const row = (n, a, c) => Array.from({ length: n }, (_, i) => a + (c - a) * (i + 0.5) / n);
  const hang = (mat, u, v, len, w = 0.5) => B(mat, u, v, u + w, v + 0.03, fl + H - 0.3 - len, fl + H - 0.3);
  const counter = (a, c, v0, v1) => { B('wood_dark', a, v0, c, v1, fl, fl + 0.82, true); B('wood_ochre', a - 0.04, v0 - 0.05, c + 0.04, v1 + 0.05, fl + 0.82, fl + 0.88); };
  if (kind === 'warung') {
    // the food stall: a counter at the left with the tin-less kettle and the jars, a bench, the sacks of rice, the bunches of bananas hung from the beam, the clay hearth
    counter(u0 + 0.2, u0 + sw * 0.42, 0.45, 1.05);
    pt('pottery_dark', u0 + 0.5, 0.75, fl + 0.88, 0.2, 0.34); pt('pottery_dark', u0 + 1.1, 0.8, fl + 0.88, 0.14, 0.26); pt('glaze_green', u0 + 1.5, 0.7, fl + 0.88, 0.1, 0.22);
    for (let k = 0; k < 4; k++) B(['cloth_ochre', 'cloth_white', 'cloth_red', 'cloth_ochre'][k], u0 + 0.45 + k * 0.28, 0.9, u0 + 0.65 + k * 0.28, 1.0, fl + 0.88, fl + 0.94);
    B('brick_grey', u1 - 1.3, D - 1.1, u1 - 0.3, D - 0.25, fl, fl + 0.5, true); B('basalt', u1 - 1.15, D - 0.95, u1 - 0.45, D - 0.4, fl + 0.5, fl + 0.54);
    pt('pottery_dark', u1 - 0.8, D - 0.68, fl + 0.54, 0.22, 0.3); B('flame', u1 - 0.95, D - 0.5, u1 - 0.7, D - 0.4, fl + 0.02, fl + 0.12);
    B('wood_dark', u0 + 0.6, 2.0, u0 + 2.0, 2.45, fl + 0.4, fl + 0.46, true); B('wood_dark', u0 + 0.7, 2.05, u0 + 0.78, 2.4, fl, fl + 0.4); B('wood_dark', u0 + 1.82, 2.05, u0 + 1.9, 2.4, fl, fl + 0.4);
    for (let k = 0; k < 3; k++) B('sacking', u0 + 0.3 + k * 0.45, D - 0.7, u0 + 0.7 + k * 0.45, D - 0.3, fl, fl + 0.6, false);
    for (let k = 0; k < 3; k++) { const u = u0 + 0.6 + k * 0.9; B('bamboo_culm', u - 0.02, 0.5, u + 0.02, 0.54, fl + 1.95, fl + 2.0); for (let q = 0; q < 5; q++) B('glaze_yellow', u - 0.08 + q * 0.04, 0.46, u - 0.03 + q * 0.04, 0.58, fl + 1.5 + q * 0.03, fl + 1.95); }
    shelf(fl + 1.2, row(4, u0 + 0.5, u1 - 1.6), ['pottery_dark', 'terracotta']);
  } else if (kind === 'pande') {
    // the smith: the forge of brick with its charcoal glow, the bellows of two bamboo pistons, the anvil on a log, the quenching trough, the tools on the wall
    B('brick', u0 + 0.3, D - 1.4, u0 + 1.9, D - 0.2, fl, fl + 0.75, true); B('basalt', u0 + 0.45, D - 1.25, u0 + 1.75, D - 0.35, fl + 0.75, fl + 0.8);
    B('flame', u0 + 0.75, D - 1.0, u0 + 1.4, D - 0.6, fl + 0.8, fl + 0.88); B('rubble', u0 + 0.5, D - 0.5, u0 + 1.7, D - 0.25, fl + 0.8, fl + 1.5);
    B('wood_dark', u0 + 2.1, D - 1.1, u0 + 2.7, D - 0.6, fl, fl + 0.5, true); B('bamboo_culm', u0 + 2.2, D - 0.95, u0 + 2.26, D - 0.89, fl + 0.5, fl + 1.1); B('bamboo_culm', u0 + 2.5, D - 0.95, u0 + 2.56, D - 0.89, fl + 0.5, fl + 1.1);
    pt('log_pine', um + 0.3, 1.5, fl, 0.28, 0.42); B('iron', um + 0.1, 1.38, um + 0.5, 1.62, fl + 0.42, fl + 0.55, false); B('iron', um + 0.5, 1.46, um + 0.62, 1.54, fl + 0.48, fl + 0.53);
    B('wood_dark', u1 - 1.2, 1.0, u1 - 0.4, 1.5, fl, fl + 0.42, true); B('water', u1 - 1.14, 1.06, u1 - 0.46, 1.44, fl + 0.38, fl + 0.4);
    for (let k = 0; k < 6; k++) B('iron', u0 + 0.45 + k * 0.35, D - 0.3, u0 + 0.5 + k * 0.35, D - 0.26, fl + 1.1, fl + 1.1 + 0.35 + (k % 3) * 0.1);
    B('wood_dark', u0 + 0.3, D - 0.34, u1 - 0.3, D - 0.26, fl + 1.5, fl + 1.56);
    B('bitumen', u1 - 0.9, D - 0.9, u1 - 0.3, D - 0.35, fl, fl + 0.4);
    // the little shrine of Brahma over the forge, marked with red cloth (the prapen's pelinggih)
    B('tuff_hewn', u0 + 0.3, D - 0.55, u0 + 0.85, D - 0.2, fl + 1.7, fl + 1.78); B('cloth_red', u0 + 0.38, D - 0.5, u0 + 0.78, D - 0.46, fl + 1.78, fl + 2.15); canang(ctx, ...P(u0 + 0.57, D - 0.35).slice(0, 1), fl + 1.78, ...P(u0 + 0.57, D - 0.35).slice(1), 2);
    for (let k = 0; k < 3; k++) B('iron', u0 + 0.2 + k * 0.5, 0.4, u0 + 0.5 + k * 0.5, 0.5, fl + 0.02, fl + 0.06 + k * 0.01);
  } else if (kind === 'carver') {
    // the stone carver: a block of paras and a half-carved guardian on a trestle, chisels and a mallet, the finished figures out on the plinth, a log of wood to carve
    B('tuff_hewn', u0 + 0.3, D - 1.2, u0 + 1.2, D - 0.3, fl, fl + 0.7, true);
    B('wood_dark', um - 0.6, 1.1, um + 0.6, 1.9, fl + 0.4, fl + 0.46, true); B('wood_dark', um - 0.5, 1.15, um - 0.42, 1.85, fl, fl + 0.4); B('wood_dark', um + 0.42, 1.15, um + 0.5, 1.85, fl, fl + 0.4);
    B('tuff_hewn', um - 0.3, 1.25, um + 0.3, 1.75, fl + 0.46, fl + 1.0); B('tuff_hewn', um - 0.2, 1.35, um + 0.2, 1.65, fl + 1.0, fl + 1.25);
    { const p = P(u1 - 0.9, D - 0.9); guardian(ctx, p[0], p[1], fl, 1.1); }
    for (let k = 0; k < 5; k++) B('iron', u0 + 0.4 + k * 0.2, D - 0.28, u0 + 0.44 + k * 0.2, D - 0.24, fl + 1.2, fl + 1.5);
    pt('log_pine', u1 - 0.55, 1.2, fl, 0.2, 1.0, [[0.2, 0], [0.2, 1.0], [0.001, 1.0]]);
    for (let k = 0; k < 3; k++) B('tuff_hewn', u0 + 0.3 + k * 0.35, 0.3, u0 + 0.55 + k * 0.35, 0.55, fl, fl + 0.18 + k * 0.05);
    { const p = P(u1 + 0.5, -0.9); guardian(ctx, p[0], p[1], y, 1.0); }
  } else if (kind === 'weaver') {
    // the weaver: a loom of timber with the warp stretched and a red-and-black cloth woven in part, the yarn on a rack, bolts of the finished cloth hung up
    for (const u of [um - 0.7, um + 0.7]) B('wood_dark', u - 0.05, 1.0, u + 0.05, 1.1, fl, fl + 1.3);
    B('wood_dark', um - 0.75, 1.0, um + 0.75, 1.1, fl + 1.25, fl + 1.32); B('wood_dark', um - 0.75, 1.0, um + 0.75, 1.1, fl + 0.5, fl + 0.56);
    for (let k = 0; k < 16; k++) { const u = um - 0.66 + k * 0.088; B('cloth_white', u, 1.03, u + 0.012, 1.06, fl + 0.56, fl + 1.25); }
    B('cloth_red', um - 0.66, 1.0, um + 0.66, 1.12, fl + 0.56, fl + 0.82); B('cloth_black', um - 0.66, 1.0, um + 0.66, 1.12, fl + 0.82, fl + 0.9);
    B('wood_dark', um - 0.4, 0.55, um + 0.4, 1.0, fl, fl + 0.28, true); B('reed_mat', um - 0.4, 0.55, um + 0.4, 1.0, fl + 0.28, fl + 0.3);
    for (let k = 0; k < 4; k++) B(['cloth_red', 'cloth_ochre', 'cloth_indigo', 'cloth_white'][k], u0 + 0.35 + k * 0.28, D - 0.5, u0 + 0.5 + k * 0.28, D - 0.35, fl + 1.2, fl + 1.35);
    B('wood_dark', u0 + 0.25, D - 0.55, u0 + 1.5, D - 0.3, fl + 1.1, fl + 1.16);
    for (let k = 0; k < 5; k++) hang(['cloth_red', 'cloth_black', 'cloth_ochre', 'cloth_indigo', 'cloth_red'][k], u0 + 0.4 + k * (sw - 1.2) / 4, D - 0.5, 1.3, 0.55);
  } else if (kind === 'offerings') {
    // the seller of offerings: a low table of trays of canang and flowers (marigold and frangipani in baskets), strips of young coconut leaf (janur) hung to dry, rolled leaf
    B('wood_dark', u0 + 0.2, 0.4, u1 - 1.6, 1.1, fl, fl + 0.7, true); B('reed_mat', u0 + 0.15, 0.35, u1 - 1.55, 1.15, fl + 0.7, fl + 0.73);
    for (let i = 0; i < Math.floor((sw - 2.3) / 0.33); i++) { const p = P(u0 + 0.45 + i * 0.33, 0.75); canang(ctx, p[0], fl + 0.73, p[1], i); const q = P(u0 + 0.45 + i * 0.33, 0.55); canang(ctx, q[0], fl + 0.73, q[1], i + 1); }
    for (let k = 0; k < 3; k++) { pt('wicker', u1 - 0.7, D - 0.7 + (k - 1) * 0.3, fl, 0.22, 0.28); B(['cloth_ochre', 'cloth_white', 'cloth_red'][k], u1 - 0.8, D - 0.8 + (k - 1) * 0.3, u1 - 0.6, D - 0.6 + (k - 1) * 0.3, fl + 0.24, fl + 0.3); }
    for (let k = 0; k < 8; k++) { const u = u0 + 0.35 + k * (sw - 0.8) / 7; B('paint_ochre', u, D - 0.5, u + 0.05, D - 0.46, fl + 1.1 - (k % 3) * 0.15, fl + 2.0); }
    B('bamboo_culm', u0 + 0.25, D - 0.52, u1 - 0.25, D - 0.46, fl + 2.0, fl + 2.06);
    B('cloth_white', u0 + 0.9, 0.12, u0 + 1.5, 0.15, fl + 1.9 - 0.8, fl + 1.9);
  } else if (kind === 'potter') {
    // the potter: shelves of pots, a wheel (a disc on a post), a small kiln of brick with its mouth, a heap of clay
    for (let r = 0; r < 2; r++) {
      B('wood_dark', u0 + 0.25, D - 0.5, u1 - 0.25, D - 0.2, fl + 0.5 + r * 0.7, fl + 0.55 + r * 0.7);
      row(6, u0 + 0.4, u1 - 0.4).forEach((u, i) => pt(i % 3 === 0 ? 'pottery_dark' : 'terracotta', u, D - 0.35, fl + 0.55 + r * 0.7, 0.13 + 0.02 * (i % 2), 0.3));
    }
    B('wood_dark', um - 0.08, 1.15, um + 0.08, 1.31, fl, fl + 0.4); pt('timber', um, 1.23, fl + 0.4, 0.34, 0.05, [[0.001, 0], [0.34, 0], [0.34, 0.05], [0.001, 0.05]]);
    B('brick', u1 - 1.4, D - 1.5, u1 - 0.3, D - 0.6, fl, fl + 0.9, true); B('wood_dark', u1 - 1.05, D - 1.5, u1 - 0.65, D - 1.46, fl + 0.15, fl + 0.5);
    B('earth_wall', u0 + 0.3, 0.5, u0 + 0.9, 1.0, fl, fl + 0.3);
    for (let k = 0; k < 6; k++) pt('terracotta', u0 + 0.5 + (k % 3) * 0.4, -0.45 - Math.floor(k / 3) * 0.4, y, 0.14, 0.3);
  } else if (kind === 'cloth') {
    // the cloth seller: bolts hung from the beam in bright dyes, stacks folded on the counter, a shelf of folded kain behind, a scale
    counter(u0 + 0.2, u0 + 3.1, 0.5, 1.0);
    for (let k = 0; k < 6; k++) B(['cloth_red', 'cloth_white', 'cloth_indigo', 'cloth_ochre', 'cloth_black', 'cloth_brown'][k], u0 + 0.35 + k * 0.28, 0.55, u0 + 0.6 + k * 0.28, 0.95, fl + 0.88, fl + 0.88 + 0.1 + (k % 3) * 0.06);
    for (let k = 0; k < 6; k++) hang(['cloth_red', 'cloth_indigo', 'cloth_ochre', 'cloth_green', 'cloth_white', 'cloth_red'][k], u0 + 0.3 + k * (sw - 0.9) / 5, 1.6, 1.4, 0.5);
    B('wood_dark', u0 + 0.2, D - 0.5, u1 - 0.2, D - 0.2, fl + 0.6, fl + 0.66); B('wood_dark', u0 + 0.2, D - 0.5, u1 - 0.2, D - 0.2, fl + 1.3, fl + 1.36);
    for (let k = 0; k < 8; k++) { const u = u0 + 0.3 + k * (sw - 0.8) / 7; B(['cloth_red', 'cloth_indigo', 'cloth_ochre', 'cloth_white'][k % 4], u, D - 0.45, u + 0.3, D - 0.25, fl + 0.66, fl + 0.9); B(['cloth_black', 'cloth_ochre', 'cloth_red', 'cloth_green'][k % 4], u, D - 0.45, u + 0.3, D - 0.25, fl + 1.36, fl + 1.58); }
  } else {
    // the basket maker: bundles of split bamboo leaning in the corner, baskets and trays hung and stacked, a half-woven basket on the floor
    for (let k = 0; k < 7; k++) B('bamboo_culm', u0 + 0.3 + k * 0.07, D - 0.35, u0 + 0.36 + k * 0.07, D - 0.29, fl, fl + 2.0 - k * 0.08);
    for (let k = 0; k < 5; k++) { const u = u0 + 1.3 + k * (sw - 2.0) / 4; pt('wicker', u, D - 0.45, fl + 1.2 + (k % 2) * 0.35, 0.22, 0.2, [[0.001, 0], [0.24, 0.02], [0.3, 0.14], [0.001, 0.2]]); B('bamboo_culm', u - 0.01, D - 0.46, u + 0.01, D - 0.44, fl + 1.4 + (k % 2) * 0.35, fl + H - 0.3); }
    for (let k = 0; k < 4; k++) pt('wicker', u1 - 0.7 - (k % 2) * 0.1, 0.7 + k * 0.45, fl, 0.26 - k * 0.02, 0.3);
    B('reed_mat', um - 0.6, 1.2, um + 0.5, 2.0, fl + 0.005, fl + 0.025); pt('wicker', um, 1.6, fl + 0.025, 0.2, 0.18);
  }
  // goods and things in front of the shop, on the verge (the plinth's edge): a jar of water and a bench for the customers
  { const p = P(u1 + 0.35, 0.3); pt('terracotta', u1 + 0.35, -0.5, y, 0.22, 0.5); void p; }
  void hex; void rand;
}
