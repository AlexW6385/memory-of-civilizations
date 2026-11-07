// The things of worship at the shrines of India and Java (DESIGN §5 "Objects of use"; the dossiers of
// Khajuraho, Sanchi, Madurai and Borobudur): the clay lamp (dīpa) with its flame, the bronze lamp
// stand with its wicks, the hanging bell (ghaṇṭā), garlands of flowers strung as beads and hung in
// swags, flowers heaped on leaf plates, the water pot. Pūjā lays flowers before the image or drapes
// garlands round it, burns incense, waves a lamp and offers food [stated: encyclopedia.com, "Pūjā"].
// Plain functions on a bag, shared by the four styles of these settlements; materials from the palette.

import { box, lathe, rod } from '../../core/geom.js';

/** A clay lamp (dīpa) at (x, y, z), scale s: the saucer with its pinched spout, the flame on the wick. */
export function diya(bag, x, y, z, s = 1, lit = true) {
  bag.add('terracotta', lathe([[0.035 * s, 0], [0.055 * s, 0.012 * s], [0.06 * s, 0.03 * s], [0.052 * s, 0.032 * s], [0.04 * s, 0.018 * s], [0.001, 0.018 * s]], 8, (th) => 1 + 0.25 * Math.max(0, Math.cos(th)) ** 6, x, y, z));
  if (lit) bag.add('flame', lathe([[0.001, 0], [0.012 * s, 0.012 * s], [0.008 * s, 0.035 * s], [0.001, 0.055 * s]], 6, null, x + 0.05 * s, y + 0.028 * s, z));
}
/** A bronze lamp stand (dīpastambha / kuttuvilakku) h tall at (x, y, z): a domed foot, the shaft with its
 *  rings, the wide dish at the top with five wicks lit round its rim, a little finial over it. */
export function lampStand(bag, x, y, z, h = 1.1, mat = 'bronze') {
  const r = h * 0.16;
  bag.add(mat, lathe([[r, 0], [r, r * 0.12], [r * 0.7, r * 0.3], [r * 0.25, r * 0.55], [h * 0.025, r * 0.7], [h * 0.022, h * 0.3], [h * 0.04, h * 0.32], [h * 0.022, h * 0.34], [h * 0.02, h * 0.62], [h * 0.045, h * 0.64], [h * 0.02, h * 0.66], [h * 0.02, h * 0.8],
    [r * 0.95, h * 0.82], [r * 1.05, h * 0.86], [r * 0.9, h * 0.87], [h * 0.02, h * 0.86], [h * 0.02, h * 0.95], [h * 0.04, h * 0.98], [0.001, h * 1.04]], 12, null, x, y, z));
  for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2; bag.add('flame', lathe([[0.001, 0], [0.012, 0.012], [0.008, 0.04], [0.001, 0.065]], 5, null, x + Math.cos(a) * r * 0.92, y + h * 0.87, z + Math.sin(a) * r * 0.92)); }
}
/** A bronze bell (ghaṇṭā) hung from a hook at (x, yTop, z) on a chain `drop` long, its mouth r wide, its clapper. */
export function hangingBell(bag, x, yTop, z, r = 0.14, drop = 0.6, mat = 'bronze') {
  const n = Math.max(2, Math.round(drop / 0.07));
  for (let i = 0; i < n; i++) { const y0 = yTop - drop * i / n, y1 = yTop - drop * (i + 1) / n; bag.add('iron', rod([x, y0, z], [x, y1 + 0.005, z], 0.008, 4)); }
  const yb = yTop - drop - r * 1.25;
  bag.add(mat, lathe([[r, 0], [r * 0.98, r * 0.08], [r * 0.82, r * 0.25], [r * 0.62, r * 0.7], [r * 0.6, r * 1.0], [r * 0.4, r * 1.18], [r * 0.12, r * 1.25], [0.001, r * 1.27]], 14, null, x, yb, z));
  bag.add(mat, lathe([[0.001, -r * 0.25], [r * 0.12, -r * 0.18], [r * 0.1, -r * 0.08], [r * 0.03, 0], [r * 0.03, r * 0.9], [0.001, r * 0.9]], 6, null, x, yb, z));
}
/** A garland hung in a swag from a to b ([x, y, z]), sagging `sag` at the middle: flowers strung as beads of
 *  radius r, in the colours given (one after another), and a tassel of three flowers hanging at each end. */
export function garland(bag, a, b, sag = 0.3, mats = ['cloth_white'], r = 0.03) {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]), n = Math.max(3, Math.round(L / (r * 1.7)));
  const bead = (p, m, k = 1) => bag.add(m, lathe([[0.001, -r * k], [r * 0.8 * k, -r * 0.7 * k], [r * k, 0], [r * 0.8 * k, r * 0.7 * k], [0.001, r * k]], 6, null, p[0], p[1], p[2]));
  for (let i = 0; i <= n; i++) {
    const t = i / n, p = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t - sag * 4 * t * (1 - t), a[2] + (b[2] - a[2]) * t];
    bead(p, mats[Math.floor(i / 3) % mats.length]);
  }
  for (const e of [a, b]) for (let k = 1; k <= 3; k++) bead([e[0], e[1] - r * 1.7 * k, e[2]], mats[(k + 1) % mats.length], 0.9);
}
/** A garland hung as a loop round a post or an image at (x, y, z), its two strands falling `drop`, spread w apart. */
export function garlandLoop(bag, x, y, z, ux, uz, w = 0.25, drop = 0.5, mats = ['cloth_white'], r = 0.028) {
  garland(bag, [x - ux * w / 2, y, z - uz * w / 2], [x + ux * w / 2, y, z + uz * w / 2], drop, mats, r);
}
/** Flowers heaped on a leaf plate at (x, y, z): the leaf, a mound of blossoms, a few loose ones on the rim. */
export function flowerPlate(bag, x, y, z, s = 1, mats = ['cloth_white', 'cloth_red']) {
  bag.add('lotus_leaf', lathe([[0.18 * s, 0], [0.2 * s, 0.015 * s], [0.001, 0.012 * s]], 10, (th) => 1 + 0.06 * Math.cos(th * 5), x, y, z));
  bag.add(mats[0], lathe([[0.12 * s, 0], [0.1 * s, 0.04 * s], [0.05 * s, 0.07 * s], [0.001, 0.08 * s]], 9, (th) => 1 + 0.12 * Math.cos(th * 4), x, y + 0.012 * s, z));
  for (let k = 0; k < 4; k++) { const a = k * 1.7 + 0.4; bag.add(mats[(k + 1) % mats.length], lathe([[0.001, 0], [0.025 * s, 0.01 * s], [0.02 * s, 0.025 * s], [0.001, 0.03 * s]], 6, null, x + Math.cos(a) * 0.14 * s, y + 0.012 * s, z + Math.sin(a) * 0.14 * s)); }
}
/** A small water pot (kalaśa) at (x, y, z), a sprig of leaves in its mouth. */
export function kalasha(bag, x, y, z, s = 1, mat = 'bronze') {
  bag.add(mat, lathe([[0.05 * s, 0], [0.1 * s, 0.05 * s], [0.12 * s, 0.12 * s], [0.09 * s, 0.2 * s], [0.045 * s, 0.24 * s], [0.06 * s, 0.27 * s], [0.04 * s, 0.27 * s], [0.001, 0.25 * s]], 12, null, x, y, z));
  for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2; bag.add('palm_leaf', box(x + Math.cos(a) * 0.04 * s - 0.012 * s, y + 0.26 * s, z + Math.sin(a) * 0.04 * s - 0.012 * s, x + Math.cos(a) * 0.08 * s + 0.012 * s, y + 0.36 * s, z + Math.sin(a) * 0.08 * s + 0.012 * s)); }
}
/** An offering set down before a shrine or image at (x, y, z), facing along (nx, nz): a lamp at the middle,
 *  flowers heaped on a leaf either side, now and then a water pot. */
export function offering(bag, x, y, z, nx, nz, seed = 0, mats = ['cloth_white', 'cloth_red']) {
  const ux = -nz, uz = nx;
  diya(bag, x, y, z);
  flowerPlate(bag, x + ux * 0.3, y, z + uz * 0.3, 0.9, mats);
  if (seed % 2) flowerPlate(bag, x - ux * 0.3, y, z - uz * 0.3, 0.8, [mats[mats.length - 1], mats[0]]);
  else kalasha(bag, x - ux * 0.3, y, z - uz * 0.3, 0.8);
}

/**
 * rite: an element of a shrine's furnishing { kind, at: [x, z], y, ... } — 'bell' (top, drop, r), 'lamp' (s),
 * 'stand' (h), 'garland' (a, b: [x, y, z], sag, mats), 'loop' (ux, uz, w, drop, mats), 'plate' (s, mats),
 * 'pot' (s), 'offering' (n: [nx, nz], seed, mats), 'lamps' (a row: to [x, z], count).
 */
export function rite(el) {
  const bag = arguments[1].bag, [x, z] = el.at ?? [0, 0], y = el.y ?? 0;
  switch (el.kind) {
    case 'bell': return hangingBell(bag, x, el.top, z, el.r ?? 0.14, el.drop ?? 0.6);
    case 'lamp': return diya(bag, x, y, z, el.s ?? 1);
    case 'stand': return lampStand(bag, x, y, z, el.h ?? 1.1);
    case 'garland': return garland(bag, el.a, el.b, el.sag ?? 0.3, el.mats, el.r ?? 0.03);
    case 'loop': return garlandLoop(bag, x, y, z, el.ux ?? 1, el.uz ?? 0, el.w, el.drop, el.mats);
    case 'plate': return flowerPlate(bag, x, y, z, el.s ?? 1, el.mats);
    case 'pot': return kalasha(bag, x, y, z, el.s ?? 1, el.mat);
    case 'offering': return offering(bag, x, y, z, ...(el.n ?? [1, 0]), el.seed ?? 0, el.mats);
    case 'pads': { const rand = ((q) => () => ((q = (q * 1664525 + 1013904223) >>> 0) / 4294967296))(el.seed ?? 7); for (const [px, pz] of el.pts) lotusPad(bag, px, y, pz, 0.2 + rand() * 0.25, rand() * 6.28, rand() < 0.15); return; }
    case 'lamps': { const [x1, z1] = el.to, n = el.count ?? 6; for (let i = 0; i < n; i++) { const t = n > 1 ? i / (n - 1) : 0; diya(bag, x + (x1 - x) * t, y, z + (z1 - z) * t, el.s ?? 1); } return; }
    default: return;
  }
}
/** Lotus pads floating at (x, y, z), radius r, the notch turned by `a`; now and then a flower on its stalk. */
export function lotusPad(bag, x, y, z, r = 0.3, a = 0, flower = false) {
  bag.add('lotus_leaf', lathe([[r, 0], [r * 0.98, 0.012], [0.001, 0.02]], 12, (th) => { const d = Math.abs(((th - a) % (2 * Math.PI) + 3 * Math.PI) % (2 * Math.PI) - Math.PI); return d < 0.25 ? 0.35 + d * 2.6 : 1; }, x, y, z));
  if (flower) { const fx = x + r * 0.4, fz = z - r * 0.3; bag.add('lotus_leaf', rod([fx, y, fz], [fx, y + 0.35, fz], 0.008, 4)); bag.add('stucco_rose', lathe([[0.001, 0], [0.06, 0.04], [0.07, 0.09], [0.03, 0.13], [0.001, 0.15]], 8, (th) => 1 + 0.18 * Math.abs(Math.cos(th * 4)), fx, y + 0.33, fz)); }
}
