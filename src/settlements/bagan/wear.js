// Pagan c. 1200 — wear and weathering, and the one kind of writing there is no risk in (docs/settlements/bagan.md §15.5): the middle of each step polished by bare feet (pilgrims, monks and
// shoppers all go barefoot), the hollow worn in a shop's threshold and the keeper's place behind the counter, the soot over the hearth, the stair of a house polished where the household climbs,
// the rising damp at the foot of the Ananda's whitewashed wall (the monsoon's splash and its dark stains: `damp` 0.5, §3), and the stone stelae with their ruled lines.
// Everything is thin boxes laid 4 mm over a surface that exists (patches, never a hole), in materials the elements already use, wrapped from here (the style files keep their own work);
// each is a function of the element's own numbers. Wrapped over the night light's wrappers (nightlight.js is imported first).
// NOTHING IS WRITTEN: Old Burmese, Mon, Pyu and Pali (the languages of Pagan's inscriptions) are in scripts whose letters this pass could not draw and check glyph by glyph, so the stelae carry only
// the ruled lines of the text (broken into word-lengths by the hash of their place), the signs of shops stay plain, and the dossier says so.
import '../../styles/burmese/index.js';
import './nightlight.js';
import { box } from '../../core/geom.js';
import { STYLES } from '../../core/build.js';
import { rng, sideFrame } from '../../styles/burmese/kit.js';
import { houseSpots, lotFrame } from '../../styles/burmese/houses.js';
import { hashAt } from './nightlight.js';

const T = 0.004;

function wearShop(el, ctx) {
  const F = lotFrame(ctx, el.rect, el.front), W = F.W, r = rng(el.seed ?? 3); r();
  const du = r() < 0.5 ? 1.3 : W - 1.3, fl = 0.55;
  // the two steps: a smoothed patch where the feet come and go, wider on the lower
  F.b('plaster_damp', du - 0.55, 0.275, -0.95, du + 0.55, 0.275 + T, -0.3, false);
  F.b('plaster_damp', du - 0.45, fl, -0.2, du + 0.45, fl + T, 0.45, false);
  // the threshold, and the keeper's place behind the counter, darkened by the feet
  F.b('wood_dark', du - 0.5, fl, 0.5, du + 0.5, fl + T, 1.5, false);
  F.b('wood_dark', W / 2 - 0.5, fl, 0.9, W / 2 + 0.5, fl + T, 1.9, false);
  // what each trade leaves on the floor by its place at the counter
  const stain = { lacquer: 'lacquer_red', pottery: 'terracotta', cloth: 'cloth_indigo', tea: 'lacquer_black', betel: 'lacquer_red' }[el.trade];
  if (stain) F.b(stain, W / 2 + 1.1, fl, 1.0, W / 2 + 1.9, fl + T, 1.7, false);
}

function wearHouse(el, ctx) {
  const sp = houseSpots(el);
  if (!sp) return;
  const F = lotFrame(ctx, el.rect, el.front), { fl, du, u0, u1, v0, v1, big } = sp, t = 0.1;
  // the stair of bamboo treads, polished where the household climbs (each tread's own top)
  const uc = big ? (u0 + u1) / 2 + 1.95 : du, sv0 = big ? v0 - 4.5 : v0 - 2.9, d = big ? 0.43 : 0.45;
  for (let i = 0; i < 6; i++) F.b('wood_dark', uc - 0.34, fl * (i + 1) / 6, sv0 + i * d + 0.04, uc + 0.34, fl * (i + 1) / 6 + T, sv0 + (i + 1) * d - 0.04, false);
  // the doorway's threshold and the soot of the hearth on the wall behind it
  F.b('wood_dark', du - 0.4, fl, v0 + 0.1, du + 0.4, fl + T, v0 + 0.9, false);
  F.b('lacquer_black', u1 - 1.55, fl + 0.3, v1 - t - T, u1 - 0.55, fl + 1.5 + 0.2 * hashAt(el.rect[0], el.rect[1], 4), v1 - t, false);
}

/** The Ananda: the middle of each porch's six steps polished (the steps' own treads: temple.js steps(): n 6, from v 48.6 inward over 2.6), the rising damp above the moulded base of the outer wall. */
function wearAnanda(el, ctx) {
  const f = el.f ?? 1.2, HO = 26.5, n = 6, d = 2.6 / n;
  for (const s of ['n', 'e', 's', 'w']) {
    const F = sideFrame(ctx, el.c, s);
    for (let i = 0; i < n; i++) F.b('stucco_cream', -1.3, f * (i + 1) / n, 48.6 - (i + 1) * d + 0.05, 1.3, f * (i + 1) / n + T, 48.6 - i * d - 0.05, false);
    // the rising damp between the pilasters (they stand at u ±14.5 and ±22.5, with bases to 0.42 each side): bands of a different height every 3 m, by the hash of their place
    const cuts = [-HO + 0.4, -22.5 - 0.6, -22.5 + 0.6, -14.5 - 0.6, -14.5 + 0.6, -5.9, 5.9, 14.5 - 0.6, 14.5 + 0.6, 22.5 - 0.6, 22.5 + 0.6, HO - 0.4];
    for (let i = 0; i < cuts.length; i += 2) {
      for (let u = cuts[i]; u < cuts[i + 1] - 0.01; u += 3.0) {
        const e = Math.min(cuts[i + 1], u + 3.0), h = 0.55 + 0.7 * hashAt(el.c[0] + u * (s === 'n' || s === 's' ? 1 : 3), el.c[1] + s.charCodeAt(0), 8);
        F.b('plaster_damp', u, f + 0.8, HO, e, f + 0.8 + h, HO + T, false);
      }
    }
  }
}

/** The Ananda's weathering above the rising damp: dark rain streaks running down from the corbel table's brackets (on some brackets, by the hash of their place), and moss in patches at the wall's foot on the north face. */
function streaksAnanda(el, ctx) {
  const f = el.f ?? 1.2, HO = 26.5, TOP1 = 12, Y = TOP1 - 0.78;
  for (const s of ['n', 'e', 's', 'w']) {
    const F = sideFrame(ctx, el.c, s);
    for (let u = -HO + 0.6; u < HO - 0.4; u += 0.9) {
      if (Math.abs(u) < 6.2 || [-22.5, -14.5, 14.5, 22.5].some((p) => Math.abs(u - p) < 0.7)) continue;
      const q = hashAt(el.c[0] + u * (s === 'n' || s === 's' ? 1 : 3), el.c[1] + s.charCodeAt(0), 21);
      if (q > 0.38) continue;
      const L = 0.5 + 0.8 * hashAt(u, s.charCodeAt(0), 22), w = 0.07 + 0.08 * q;
      F.b('plaster_damp', u - w, Y - L, HO, u + w, Y, HO + T, false);
    }
    if (s !== 'n') continue;
    // moss on the north face (the side the sun does not dry): patches rising from the base in the damp, 0.3 to 0.9 m wide
    const cuts = [-HO + 0.4, -22.5 - 0.6, -22.5 + 0.6, -14.5 - 0.6, -14.5 + 0.6, -5.9, 5.9, 14.5 - 0.6, 14.5 + 0.6, 22.5 - 0.6, 22.5 + 0.6, HO - 0.4];
    for (let i = 0; i < cuts.length; i += 2) for (let u = cuts[i] + 0.3; u < cuts[i + 1] - 1.0; u += 0.8 + 1.4 * hashAt(u, i, 23)) {
      const w = 0.3 + 0.6 * hashAt(u, i, 24), h = 0.12 + 0.3 * hashAt(u, i, 25);
      F.b('glaze_green', u, f + 0.8, HO, u + w, f + 0.8 + h, HO + 0.014, false);
    }
  }
}

/** The Thatbyinnyu and Sulamani: the middle of the six steps up each side polished by bare feet (temple.js tower(): steps(S, ..., H + 4.9, 2.4)), and the entrance's threshold worn. */
function wearTower(el, ctx) {
  const k = el.k ?? 1, f = el.f ?? 1.4, H = 29 * k, v1 = H + 2.5 + 2.4, n = 6, d = 2.4 / n;
  for (const s of ['n', 'e', 's', 'w']) {
    const F = sideFrame(ctx, el.c, s);
    for (let i = 0; i < n; i++) F.b('stucco_cream', -1.3, f * (i + 1) / n, v1 - (i + 1) * d + 0.05, 1.3, f * (i + 1) / n + T, v1 - i * d - 0.05, false);
  }
}

/**
 * bgn_stele: { c: [x, z], rot, seed } — a stone stele of the temple's donors (the donative inscriptions of Pagan are on slabs like this): a slab 0.7 m wide and 1.5 m high on a brick footing, stepped at the top,
 * both faces ruled in lines of text broken into word-lengths. Only the ruled lines: no letter is drawn (see the head of this file).
 */
function stele({ c, rot = 0, seed = 1 }, ctx) {
  const { bag, col } = ctx, [x, z] = c, ux = Math.cos(rot), uz = -Math.sin(rot), vx = Math.sin(rot), vz = Math.cos(rot);
  const P = (u, v) => [x + ux * u + vx * v, z + uz * u + vz * v];
  const B = (mat, u0, y0, v0, u1, y1, v1, solid = false) => {
    const a = P(u0, v0), b = P(u1, v1), r = [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])];
    bag.add(mat, box(r[0], y0, r[1], r[2], y1, r[3])); if (solid) col.rect(r, y0, y1);
  };
  const r = rng(seed * 7 + 3);
  B('brick', -0.5, 0, -0.3, 0.5, 0.3, 0.3, true);
  B('sandstone', -0.35, 0.3, -0.08, 0.35, 1.5, 0.08, true);
  B('sandstone', -0.27, 1.5, -0.07, 0.27, 1.62, 0.07); B('sandstone', -0.18, 1.62, -0.06, 0.18, 1.72, 0.06); B('sandstone', -0.08, 1.72, -0.05, 0.08, 1.78, 0.05);
  for (const sd of [-1, 1]) {
    const v = sd * (0.08 + T / 2 + 0.0005);
    for (let k = 0, y = 1.4; y > 0.5; k++, y -= 0.075) {
      let u = -0.28;
      while (u < 0.26) { const w = 0.08 + 0.2 * r(); if (u + w > 0.28) break; B('sandstone_carved', u, y, sd > 0 ? 0.08 : -0.08 - T, u + w, y + 0.028, sd > 0 ? 0.08 + T : -0.08); u += w + 0.04; }
    }
    void v;
  }
}

let done = false;
export function registerWear() {
  if (done) return; done = true;
  const E = STYLES.burmese.elements;
  for (const [k, fn] of [['bgn_shop', wearShop], ['bgn_house', wearHouse], ['bgn_ananda', wearAnanda], ['bgn_ananda', streaksAnanda], ['bgn_tower', wearTower]]) {
    const base = E[k];
    E[k] = function worn(el, ctx) { const r = base.call(this, el, ctx); if (!el.simple) fn(el, ctx); return r; };
  }
  E.bgn_stele = stele;
}
registerWear();

/** Where the stelae stand: either side of the cross passage before the west porch's steps, and before the east porch's gate. Pure data. */
export const STELES = [
  { c: [48.5, -4.6], rot: Math.PI / 2, seed: 1 }, { c: [48.5, 4.6], rot: Math.PI / 2, seed: 2 },
  { c: [161.5, -4.6], rot: -Math.PI / 2, seed: 3 }, { c: [161.5, 4.6], rot: -Math.PI / 2, seed: 4 },
];
