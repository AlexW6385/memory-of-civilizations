// Eye-level detail of Pagan (docs/settlements/bagan.md §6): what stands at the doors, in the yards and by the roads — the water-pot stand under its little roof (yay-zayat),
// firewood, a loom, the foot-lever rice pounder, drying mats of chillies and grain, laundry, hammocks, hanging baskets, the spirit shelf, signs, the guardian lions (chinthe)
// and the festival poles with their streamers. Every helper takes a frame F (kit.js) and local (u, v); all geometry is small and merged by the bag.
import { lathe } from '../../core/geom.js';
import { rng, Fr, miniStupa } from './kit.js';

export const POT = [[0.1, 0], [0.22, 0.1], [0.26, 0.26], [0.16, 0.42], [0.12, 0.5], [0.15, 0.54], [0.001, 0.54]];
const scale = (p, s) => p.map(([r, y]) => [Math.max(0.001, r * s), y * s]);
export const pot = (F, u, y, v, s = 1, mat = 'terracotta') => F.lathe(mat, scale(POT, s), u, y, v, 8);

/** A tall water jar on a post stand under a small thatched roof, a coconut-shell dipper on its rim: the yay-zayat at the roadside, free to every passer-by. */
export function potStand(F, u, v, r = rng(1), y = 0) {
  const w = 0.9, d = 0.55;
  for (const [a, b] of [[-w, -d], [w, -d], [-w, d], [w, d]]) F.b('timber', u + a - 0.05, y, v + b - 0.05, u + a + 0.05, y + 1.75, v + b + 0.05, false);
  F.b('wood_ochre', u - w - 0.1, y + 0.55, v - d - 0.1, u + w + 0.1, y + 0.62, v + d + 0.1, false);
  F.b('thatch_palm', u - w - 0.35, y + 1.72, v - d - 0.35, u + w + 0.35, y + 1.9, v + d + 0.35, false);
  F.b('thatch_palm', u - w - 0.1, y + 1.9, v - d * 0.5, u + w + 0.1, y + 2.08, v + d * 0.5, false);
  const n = 2 + Math.floor(r() * 2);
  for (let i = 0; i < n; i++) pot(F, u - w * 0.6 + (i * 1.2 * w) / Math.max(1, n - 1), y + 0.62, v, 1.5 + r() * 0.3, i % 2 ? 'pottery_dark' : 'terracotta');
  F.lathe('terracotta', [[0.08, 0], [0.1, 0.04], [0.001, 0.04]], u + w * 0.5, y + 0.62, v + 0.4, 6);
  F.col.rect(F.R(u - w, v - d, u + w, v + d), y, y + 1.9);
}

/** A stack of split firewood: courses of logs. */
export function firewood(F, u, v, len = 1.6, h = 0.8, r = rng(2), y = 0) {
  const n = Math.max(2, Math.round(h / 0.14));
  for (let i = 0; i < n; i++) F.b(i % 2 ? 'wood_dark' : 'bark_dark', u + (i % 2) * 0.06, y + i * 0.14, v, u + len - (i % 3) * 0.05, y + (i + 1) * 0.14 - 0.01, v + 0.55 - (i % 2) * 0.05, false);
  F.b('timber', u - 0.03, y, v - 0.03, u + 0.03, y + h, v + 0.58, false); F.b('timber', u + len - 0.03, y, v - 0.03, u + len + 0.03, y + h, v + 0.58, false);
}

/** A wicker basket hung from the eave on a cord. */
export function hangBasket(F, u, y, v, s = 1, mat = 'wicker') {
  F.b('rope_fibre', u - 0.01, y, v - 0.01, u + 0.01, y + 0.5, v + 0.01, false);
  F.lathe(mat, scale([[0.12, 0], [0.22, 0.08], [0.26, 0.2], [0.24, 0.2], [0.001, 0.2]], s), u, y - 0.2 * s, v, 8);
}

/** Cloth on a line between two posts (laundry), the cloths in the colours of the place. */
export function laundryLine(F, u0, v0, u1, v1, y = 1.9, r = rng(3)) {
  const cols = ['cloth_white', 'cloth_red', 'cloth_ochre', 'cloth_green', 'cloth_brown', 'cloth_indigo'];
  for (const [u, v] of [[u0, v0], [u1, v1]]) F.b('bamboo_culm', u - 0.04, 0, v - 0.04, u + 0.04, y + 0.25, v + 0.04, false);
  F.b('rope_fibre', Math.min(u0, u1) - 0.01, y + 0.22, Math.min(v0, v1) - 0.01, Math.max(u0, u1) + 0.01, y + 0.24, Math.max(v0, v1) + 0.01, false);
  const L = Math.hypot(u1 - u0, v1 - v0), n = Math.max(2, Math.floor(L / 0.55));
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n, u = u0 + (u1 - u0) * t, v = v0 + (v1 - v0) * t, hh = 0.7 + r() * 0.5, w = 0.2 + r() * 0.12;
    if (Math.abs(u1 - u0) > Math.abs(v1 - v0)) F.b(cols[Math.floor(r() * cols.length)], u - w, y + 0.22 - hh, v - 0.01, u + w, y + 0.22, v + 0.01, false);
    else F.b(cols[Math.floor(r() * cols.length)], u - 0.01, y + 0.22 - hh, v - w, u + 0.01, y + 0.22, v + w, false);
  }
}

/** A mat laid out in the sun with its crop: chillies, grain or beans drying (kind 'chilli' | 'grain' | 'bean'). */
export function dryMat(F, u, v, w = 1.6, d = 1.2, kind = 'chilli', r = rng(4)) {
  F.b('reed_mat', u, 0, v, u + w, 0.025, v + d, false);
  const col = kind === 'chilli' ? 'cloth_red' : kind === 'bean' ? 'cloth_green' : 'cloth_ochre';
  const n = 3 + Math.floor(r() * 3);
  for (let i = 0; i < n; i++) {
    const a = u + 0.15 + r() * (w - 0.5), b = v + 0.12 + r() * (d - 0.45);
    F.lathe(col, [[0.2 + r() * 0.08, 0], [0.16, 0.05], [0.07, 0.09], [0.001, 0.1]], a + 0.12, 0.02, b + 0.12, 7);
  }
}

/** The foot-lever rice pounder: a beam on a fulcrum, a pestle on its far end over a mortar in the ground. */
export function pounder(F, u, v, y = 0) {
  for (const sd of [-1, 1]) F.b('timber', u - 0.03, y, v + sd * 0.22 - 0.03, u + 0.03, y + 0.55, v + sd * 0.22 + 0.03, false);
  F.b('wood_dark', u - 0.9, y + 0.5, v - 0.06, u + 1.2, y + 0.6, v + 0.06, false);
  F.b('wood_dark', u - 0.9 - 0.04, y, v - 0.04, u - 0.9 + 0.04, y + 0.5, v + 0.04, false);
  F.lathe('wood_dark', [[0.25, 0], [0.3, 0.1], [0.28, 0.35], [0.15, 0.4], [0.001, 0.4]], u - 0.9, y, v, 8);
  F.b('timber', u + 1.2, y + 0.02, v - 0.2, u + 1.5, y + 0.1, v + 0.2, false);
}

/** A back-strap loom's frame under a house: two posts, the beams, a strip of cloth woven so far, a bench for the weaver. */
export function loom(F, u, v, r = rng(5), y = 0) {
  for (const sd of [-1, 1]) F.b('timber', u + sd * 0.55 - 0.04, y, v - 0.04, u + sd * 0.55 + 0.04, y + 1.4, v + 0.04, false);
  F.b('wood_dark', u - 0.6, y + 1.3, v - 0.03, u + 0.6, y + 1.38, v + 0.03, false);
  F.b('wood_dark', u - 0.6, y + 0.55, v - 0.03, u + 0.6, y + 0.61, v + 0.03, false);
  const cols = ['cloth_red', 'cloth_green', 'cloth_indigo', 'cloth_ochre'];
  F.b(cols[Math.floor(r() * 4)], u - 0.48, y + 0.62, v - 0.012, u + 0.48, y + 1.3, v + 0.012, false);
  F.b('cloth_white', u - 0.48, y + 0.62, v - 0.012, u + 0.48, y + 0.8, v + 0.014, false);
  F.b('wood_ochre', u - 0.5, y, v + 0.55, u + 0.5, y + 0.4, v + 0.9, false);
}

/** A hammock: a cloth slung between two posts, sagging in three runs. */
export function hammock(F, u0, v, u1, y = 1.1) {
  const m = (u0 + u1) / 2;
  for (const u of [u0, u1]) F.b('timber', u - 0.05, 0, v - 0.05, u + 0.05, y + 0.6, v + 0.05, false);
  F.b('cloth_ochre', u0 + 0.05, y + 0.25, v - 0.28, u0 + (m - u0) * 0.6, y + 0.18, v + 0.28, false);
  F.b('cloth_ochre', u0 + (m - u0) * 0.6, y, v - 0.3, u1 - (u1 - m) * 0.6, y + 0.07, v + 0.3, false);
  F.b('cloth_ochre', u1 - (u1 - m) * 0.6, y + 0.18, v - 0.28, u1 - 0.05, y + 0.25, v + 0.28, false);
}

/** The spirit shelf on a wall (the Buddha shelf of the house): a plank with a coconut, flowers and a gilded image. */
export function shelf(F, u, y, v, along = 'u', s = 1) {
  const a = along === 'u';
  F.b('wood_dark', u - 0.4 * s * (a ? 1 : 0.35), y, v - 0.4 * s * (a ? 0.35 : 1), u + 0.4 * s * (a ? 1 : 0.35), y + 0.05, v + 0.4 * s * (a ? 0.35 : 1), false);
  F.lathe('gilt_bronze', [[0.1 * s, 0], [0.08 * s, 0.1 * s], [0.06 * s, 0.2 * s], [0.04 * s, 0.26 * s], [0.001, 0.3 * s]], u, y + 0.05, v, 8);
  F.lathe('cloth_ochre', [[0.06, 0], [0.06, 0.07], [0.001, 0.09]], u + 0.22 * s * (a ? 1 : 0), y + 0.05, v + 0.22 * s * (a ? 0 : 1), 6);
  F.lathe('cloth_white', [[0.05, 0], [0.05, 0.05], [0.001, 0.07]], u - 0.22 * s * (a ? 1 : 0), y + 0.05, v - 0.22 * s * (a ? 0 : 1), 6);
}

/** A hung sign board: two cords and a plank with a painted band (the trade's colour). */
export function sign(F, u, y, v, w = 0.9, col = 'paint_ochre', h = 0.32) {
  F.b('rope_fibre', u - w / 2 + 0.05, y + h, v, u - w / 2 + 0.07, y + h + 0.3, v + 0.02, false);
  F.b('rope_fibre', u + w / 2 - 0.07, y + h, v, u + w / 2 - 0.05, y + h + 0.3, v + 0.02, false);
  F.b('wood_dark', u - w / 2, y, v - 0.02, u + w / 2, y + h, v + 0.03, false);
  F.b(col, u - w / 2 + 0.05, y + 0.05, v - 0.03, u + w / 2 - 0.05, y + h - 0.05, v - 0.015, false);
  F.b('paint_white', u - w / 4, y + h * 0.4, v - 0.035, u + w / 4, y + h * 0.6, v - 0.025, false);
}

/** A bamboo bench, length len along u. */
export function bench(F, u, v, len = 1.6, y = 0) {
  F.b('bamboo_culm', u, y + 0.38, v, u + len, y + 0.44, v + 0.32, false);
  for (const a of [0.1, len - 0.1]) F.b('bamboo_culm', u + a - 0.03, y, v + 0.04, u + a + 0.03, y + 0.38, v + 0.1, false), F.b('bamboo_culm', u + a - 0.03, y, v + 0.24, u + a + 0.03, y + 0.38, v + 0.3, false);
}

/** A chinthe, the guardian lion: seated on a plinth, haunches and fore-legs, a broad chest, a mane and a head with a muzzle; limewashed. Faces +v of the frame. */
export function chinthe(F, u, v, s = 1, mat = 'limewash_white') {
  F.b('brick_baked', u - 0.9 * s, 0, v - 1.0 * s, u + 0.9 * s, 0.7 * s, v + 1.0 * s, true);
  F.b('stucco_cream', u - 0.95 * s, 0.7 * s, v - 1.05 * s, u + 0.95 * s, 0.8 * s, v + 1.05 * s, false);
  const y = 0.8 * s;
  F.b(mat, u - 0.62 * s, y, v - 0.9 * s, u + 0.62 * s, y + 0.95 * s, v - 0.1 * s, false);           // the haunches and the back
  F.b(mat, u - 0.5 * s, y + 0.6 * s, v - 0.9 * s, u + 0.5 * s, y + 1.35 * s, v - 0.5 * s, false);   // the back rising to the shoulders
  F.b(mat, u - 0.5 * s, y, v - 0.1 * s, u - 0.2 * s, y + 1.3 * s, v + 0.3 * s, false);             // the fore-legs
  F.b(mat, u + 0.2 * s, y, v - 0.1 * s, u + 0.5 * s, y + 1.3 * s, v + 0.3 * s, false);
  F.b(mat, u - 0.48 * s, y + 1.1 * s, v - 0.35 * s, u + 0.48 * s, y + 1.75 * s, v + 0.3 * s, false); // the chest
  F.b('stucco_cream', u - 0.62 * s, y + 1.3 * s, v - 0.5 * s, u + 0.62 * s, y + 1.95 * s, v + 0.0 * s, false);   // the mane
  F.b(mat, u - 0.4 * s, y + 1.4 * s, v + 0.05 * s, u + 0.4 * s, y + 1.95 * s, v + 0.55 * s, false);  // the head
  F.b(mat, u - 0.26 * s, y + 1.45 * s, v + 0.5 * s, u + 0.26 * s, y + 1.72 * s, v + 0.78 * s, false); // the muzzle
  F.b('paint_ochre', u - 0.3 * s, y + 1.78 * s, v + 0.28 * s, u - 0.12 * s, y + 1.86 * s, v + 0.46 * s, false);   // the eyes
  F.b('paint_ochre', u + 0.12 * s, y + 1.78 * s, v + 0.28 * s, u + 0.3 * s, y + 1.86 * s, v + 0.46 * s, false);
  F.b('paint_ochre', u - 0.12 * s, y + 1.44 * s, v + 0.77 * s, u + 0.12 * s, y + 1.52 * s, v + 0.8 * s, false);   // the open mouth
  for (const sd of [-1, 1]) F.b(mat, u + sd * 0.34 * s - 0.07 * s, y + 1.95 * s, v + 0.2 * s, u + sd * 0.34 * s + 0.07 * s, y + 2.15 * s, v + 0.34 * s, false);
  F.b(mat, u - 0.08 * s, y + 0.2 * s, v - 1.15 * s, u + 0.08 * s, y + 1.2 * s, v - 0.88 * s, false);              // the tail curled up behind
}

/** A festival pole of bamboo, 6–9 m, with streamers of coloured cloth hung down it and a small gilded umbrella at the head. */
export function festPole(F, u, v, h = 7, r = rng(6)) {
  F.b('bamboo_culm', u - 0.045, 0, v - 0.045, u + 0.045, h, v + 0.045, false);
  F.col.circle(...F.pt(u, v), 0.1, 0, h);
  const cols = ['cloth_red', 'cloth_ochre', 'cloth_white', 'cloth_green'];
  for (let i = 0; i < 4; i++) { const y = h - 0.4 - i * 0.55; F.b(cols[(i + Math.floor(r() * 4)) % 4], u + 0.05, y - 1.0, v - 0.01, u + 0.5 + r() * 0.15, y, v + 0.01, false); }
  F.lathe('gilt_bronze', [[0.3, 0], [0.12, 0.12], [0.02, 0.2], [0.001, 0.26]], u, h, v, 8);
}

/** A stone lamp pillar: a squared shaft on a base, with a lamp niche and a small roof cap. */
export function lampPillar(F, u, v, h = 1.9) {
  F.b('sandstone', u - 0.3, 0, v - 0.3, u + 0.3, 0.25, v + 0.3, true);
  F.b('sandstone', u - 0.16, 0.25, v - 0.16, u + 0.16, h - 0.5, v + 0.16, false);
  F.b('sandstone', u - 0.26, h - 0.5, v - 0.26, u + 0.26, h - 0.1, v + 0.26, false);
  F.b('flame', u - 0.07, h - 0.45, v - 0.272, u + 0.07, h - 0.25, v - 0.262, false);
  F.b('limewash_white', u - 0.3, h - 0.1, v - 0.3, u + 0.3, h + 0.05, v + 0.3, false);
  F.lathe('gilt_bronze', [[0.12, 0], [0.04, 0.2], [0.001, 0.3]], u, h + 0.05, v, 8);
}

/** A small roadside shrine: a plastered plinth, a little spirit house under a tiered roof, with a flower offering. */
export function wayShrine(F, u, v, r = rng(7)) {
  F.b('brick', u - 0.7, 0, v - 0.7, u + 0.7, 0.35, v + 0.7, true);
  F.b('limewash_white', u - 0.55, 0.35, v - 0.55, u + 0.55, 1.0, v + 0.55, true);
  F.b('wood_dark', u - 0.2, 0.45, v + 0.5, u + 0.2, 0.9, v + 0.56, false);
  F.b('gilt_bronze', u - 0.12, 0.5, v + 0.53, u + 0.12, 0.8, v + 0.58, false);
  F.b('limewash_white', u - 0.7, 1.0, v - 0.7, u + 0.7, 1.12, v + 0.7, false);
  F.b('limewash_white', u - 0.45, 1.12, v - 0.45, u + 0.45, 1.3, v + 0.45, false);
  F.lathe('gilt_bronze', [[0.25, 0], [0.12, 0.25], [0.04, 0.5], [0.001, 0.62]], u, 1.3, v, 8);
  F.b(r() < 0.5 ? 'cloth_ochre' : 'cloth_red', u - 0.3, 0.35, v + 0.6, u + 0.3, 0.45, v + 0.85, false);
}

/** A row of votive stupas (miniature, brick or limewash) along u. */
export function votiveRow(F, u0, v, n, gap = 1.6, h = 2.2, r = rng(8), gilt = false) {
  for (let i = 0; i < n; i++) {
    const [x, z] = F.pt(u0 + i * gap, v), body = r() < 0.5 ? 'limewash_white' : 'brick';
    miniStupa(F.bag, x, 0, z, h * (0.85 + r() * 0.3), body, gilt && r() < 0.3, 8);
    F.col.circle(x, z, h / 6, 0, h * 0.8);
  }
}

/** A brick tank-side bench or a stepped well's coping — a low brick ring with a pot on it. */
export function wellRing(F, u, v, r0 = 0.8) {
  F.lathe('brick', [[r0, 0], [r0, 0.55], [r0 - 0.2, 0.6], [r0 - 0.2, 0.01]], u, 0, v, 12);
  F.col.circle(...F.pt(u, v), r0, 0, 0.6);
  F.b('timber', u - r0 - 0.04, 0, v - 0.04, u - r0 + 0.04, 1.6, v + 0.04, false); F.b('timber', u + r0 - 0.04, 0, v - 0.04, u + r0 + 0.04, 1.6, v + 0.04, false);
  F.b('timber', u - r0 - 0.05, 1.55, v - 0.05, u + r0 + 0.05, 1.65, v + 0.05, false);
  pot(F, u + 0.1, 0.6, v + 0.25, 1.1, 'pottery_dark');
}

/** An offering table before an image: red lacquer, flowers, candles, fruit, and a lamp. */
export function offering(F, u, y, v, w = 1.4, r = rng(9)) {
  F.b('lacquer_red', u - w / 2, y, v - 0.35, u + w / 2, y + 0.65, v + 0.35, true);
  F.b('gilt_bronze', u - w / 2 - 0.02, y + 0.62, v - 0.37, u + w / 2 + 0.02, y + 0.67, v + 0.37, false);
  const n = Math.floor(w / 0.3);
  for (let i = 0; i < n; i++) {
    const x = u - w / 2 + 0.2 + i * ((w - 0.4) / Math.max(1, n - 1)), k = i % 4;
    if (k === 0) F.lathe('cloth_white', [[0.08, 0], [0.1, 0.07], [0.001, 0.1]], x, y + 0.67, v, 6);
    else if (k === 1) F.b('paint_ochre', x - 0.025, y + 0.67, v - 0.025, x + 0.025, y + 0.85, v + 0.025, false);
    else if (k === 2) F.lathe('cloth_green', [[0.09, 0], [0.12, 0.08], [0.001, 0.12]], x, y + 0.67, v, 6);
    else F.lathe('cloth_ochre', [[0.1, 0], [0.12, 0.06], [0.001, 0.1]], x, y + 0.67, v + 0.1, 6);
  }
  F.lathe('gilt_bronze', [[0.06, 0], [0.04, 0.1], [0.1, 0.16], [0.001, 0.16]], u + w / 2 - 0.15, y + 0.67, v - 0.15, 8);
  void r;
}

/** A little brick-and-timber spirit house (nat shrine) on a post, the shrine of a house or a village: a box under a tiered roof with a ladder. */
export function spiritHouse(F, u, v, y = 0) {
  F.b('timber', u - 0.05, y, v - 0.05, u + 0.05, y + 1.5, v + 0.05, false);
  F.b('wood_ochre', u - 0.4, y + 1.5, v - 0.4, u + 0.4, y + 1.58, v + 0.4, false);
  F.b('wood_dark', u - 0.32, y + 1.58, v - 0.3, u + 0.32, y + 2.0, v + 0.3, false);
  F.b('gilt_bronze', u - 0.1, y + 1.62, v + 0.3, u + 0.1, y + 1.9, v + 0.33, false);
  F.b('thatch_palm', u - 0.5, y + 2.0, v - 0.45, u + 0.5, y + 2.12, v + 0.45, false);
  F.b('thatch_palm', u - 0.3, y + 2.12, v - 0.25, u + 0.3, y + 2.28, v + 0.25, false);
  F.lathe('cloth_white', [[0.1, 0], [0.12, 0.06], [0.001, 0.1]], u + 0.2, y + 1.58, v + 0.38, 6);
}

/** Dispatch of the generic props (a `bgn_props` item): { k, c: [x, z], rot, seed, ... }. */
export function propAt(ctx, it) {
  const rot = it.rot ?? 0, r = rng(it.seed ?? 1);
  const F = new Fr(ctx, it.c, [Math.cos(rot), -Math.sin(rot)], [Math.sin(rot), Math.cos(rot)]);
  const y = it.y ?? 0;
  switch (it.k) {
    case 'potstand': return potStand(F, 0, 0, r, y);
    case 'firewood': return firewood(F, -0.8, 0, 1.6, 0.6 + r() * 0.4, r, y);
    case 'chinthe': return chinthe(F, 0, 0, it.s ?? 1);
    case 'pole': return festPole(F, 0, 0, 6 + r() * 3, r);
    case 'lamp': return lampPillar(F, 0, 0, 1.7 + r() * 0.4);
    case 'shrine': return wayShrine(F, 0, 0, r);
    case 'votive': return votiveRow(F, -((it.n ?? 4) - 1) * 0.8, 0, it.n ?? 4, 1.6, it.h ?? 2.2, r, !!it.gilt);
    case 'well': return wellRing(F, 0, 0, it.r ?? 0.8);
    case 'spirit': return spiritHouse(F, 0, 0, y);
    case 'bench': return bench(F, -0.8, 0, 1.6, y);
    case 'pounder': return pounder(F, 0, 0, y);
    case 'dry': return dryMat(F, -0.8, 0, 1.6, 1.2, ['chilli', 'grain', 'bean'][Math.floor(r() * 3)], r);
    case 'laundry': return laundryLine(F, -1.4, 0, 1.4, 0, 1.8, r);
    case 'offering': return offering(F, 0, y, 0, it.w ?? 1.4, r);
    case 'loom': return loom(F, 0, 0, r, y);
    default: return undefined;
  }
}
export { lathe };
