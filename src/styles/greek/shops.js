// The shops of the Agora's south side (docs/settlements/athens.md §11d): the rooms behind a stoa's colonnade, each fitted for a
// trade — the bronze-smith with his hearth and anvil, the perfumer, the cloth-seller, the wine-and-oil merchant, the
// carpenter — in the stoa's local frame (u along the front, v from the front back): room interior ia…ib, va…vb.

import { box, lathe, rod } from '../../core/geom.js';
import { B } from './agora.js';
import { vase } from './vessels.js';

export const TRADES = ['bronze', 'perfume', 'cloth', 'wine', 'carpenter'];

export function furnishShop(ctx, F, y, ia, ib, va, vb, trade, rand) {
  const { bag, col } = ctx;
  const R = (u0, v0, u1, v1, y0, y1, m, solid = true) => { const r = F.R(u0, v0, u1, v1); B(bag, m, r, y + y0, y + y1); if (solid) col.rect(r, y + y0, y + y1); };
  const at = (u, v) => F.P(u, v);
  const counter = (u0, u1) => { R(u0, va + 0.35, u1, va + 1.0, 0, 0.9, 'timber'); R(u0 - 0.04, va + 0.31, u1 + 0.04, va + 1.04, 0.9, 0.95, 'wood_dark', false); };
  counter(ia + 2.4, ib - 0.35);
  const shelf = (u0, u1, v, h, depth = 0.4) => { R(u0, v - depth / 2, u1, v + depth / 2, h - 0.04, h, 'timber', false); };
  const posts = (u0, u1, v, hMax) => { for (const u of [u0, u1 - 0.06]) R(u, v - 0.2, u + 0.06, v + 0.2, 0, hMax, 'wood_dark', false); };
  const back = vb - 0.25;
  const clothBox = (u, v, y0, w, m, n = 3) => { for (let k = 0; k < n; k++) R(u, v, u + w, v + 0.35, y0 + k * 0.07, y0 + k * 0.07 + 0.065, m, false); };
  if (trade === 'bronze') {
    // the hearth in the corner: a ring of stone, a bed of coals with its glow, the bellows; the anvil on its stump; bronze ware hung on the back wall
    const [hx, hz] = at(ib - 1.1, back - 0.7);
    bag.add('rubble', lathe([[0.7, 0], [0.7, 0.6], [0.55, 0.62], [0.001, 0.62]], 12, null, hx, y, hz)); col.circle(hx, hz, 0.7, y, y + 0.62);
    bag.add('lacquer_black', lathe([[0.5, 0.6], [0.4, 0.63], [0.001, 0.64]], 10, null, hx, y, hz));
    bag.add('flame', lathe([[0.001, 0], [0.2, 0.02], [0.05, 0.22], [0.001, 0.3]], 6, null, hx, y + 0.64, hz));
    if (ctx.lights) ctx.lights.push({ at: [hx, y + 1.0, hz], color: '#ff7a2a', intensity: 1.4, distance: 5 });
    const [ax, az] = at(ia + 1.8, vb - 1.8);
    bag.add('log_pine', lathe([[0.3, 0], [0.28, 0.5], [0.001, 0.5]], 8, null, ax, y, ax * 0 + az)); bag.add('iron', box(ax - 0.28, y + 0.5, az - 0.1, ax + 0.28, y + 0.62, az + 0.1)); col.circle(ax, az, 0.32, y, y + 0.62);
    shelf(ia + 0.3, ib - 0.3, back, 1.4, 0.45); posts(ia + 0.3, ib - 0.3, back, 1.4);
    for (let u = ia + 0.7; u < ib - 1.3; u += 0.55) { const [x, z] = at(u, back); bag.add('bronze', lathe([[0.001, 0], [0.1, 0.0], [0.2, 0.1], [0.22, 0.2], [0.18, 0.22], [0.001, 0.17]], 10, null, x, y + 1.4, z)); }
    for (let u = ia + 0.8; u < ib - 1.3; u += 1.1) { const [x, z] = at(u, back + 0.08); bag.add('bronze', lathe([[0.15, 0], [0.16, 0.08], [0.12, 0.2], [0.05, 0.27], [0.001, 0.29]], 10, null, x, y + 1.8, z)); }
    for (let k = 0; k < 4; k++) { const [x, z] = at(ia + 3.0 + k * 0.6, va + 0.65); vase(bag, 'oinochoe', x, y + 0.95, z, { s: 0.9, mat: 'bronze', seg: 8 }); }
  } else if (trade === 'perfume') {
    shelf(ia + 0.3, ib - 0.3, back, 0.7); shelf(ia + 0.3, ib - 0.3, back, 1.3); shelf(ia + 0.3, ib - 0.3, back, 1.9); posts(ia + 0.3, ib - 0.3, back, 1.9);
    for (const h of [0.7, 1.3, 1.9]) for (let u = ia + 0.55; u < ib - 0.4; u += 0.28) { const [x, z] = at(u, back); vase(bag, rand() < 0.6 ? 'lekythos' : 'oinochoe', x, y + h, z, { s: 0.5, dark: rand() < 0.3, seg: 8 }); }
    for (let k = 0; k < 6; k++) { const [x, z] = at(ia + 2.8 + k * 0.4, va + 0.65); vase(bag, 'lekythos', x, y + 0.95, z, { s: 0.45, seg: 8 }); }
    const [mx, mz] = at(ib - 0.9, va + 0.65); bag.add('marble', lathe([[0.001, 0], [0.12, 0], [0.16, 0.04], [0.13, 0.1], [0.001, 0.08]], 10, null, mx, y + 0.95, mz));
  } else if (trade === 'cloth') {
    shelf(ia + 0.3, ib - 0.3, back, 0.5); shelf(ia + 0.3, ib - 0.3, back, 1.0); shelf(ia + 0.3, ib - 0.3, back, 1.5); posts(ia + 0.3, ib - 0.3, back, 1.5);
    const cs = ['cloth_white', 'cloth_ochre', 'cloth_red', 'cloth_indigo', 'cloth_green', 'linen', 'cloth_brown'];
    for (const h of [0.5, 1.0, 1.5]) for (let u = ia + 0.45; u < ib - 1.0; u += 0.65) clothBox(u, back - 0.2, y * 0 + h, 0.55, cs[Math.floor(rand() * cs.length)], 3 + Math.floor(rand() * 3));
    R(ia + 0.3, va + 1.0, ia + 0.36, vb - 1.0, 2.0, 2.06, 'timber', false);
    for (let v = va + 1.2; v < vb - 1.2; v += 0.5) R(ia + 0.3, v, ia + 0.4, v + 0.35, 0.7 + rand() * 0.3, 2.0, cs[Math.floor(rand() * cs.length)], false);
    clothBox(ia + 3.0, va + 0.55, 0.95, 0.5, 'cloth_white', 4);
  } else if (trade === 'wine') {
    for (let k = 0; k < Math.floor((ib - ia - 0.8) / 0.42); k++) { const [x, z] = at(ia + 0.7 + k * 0.42, back - 0.3); vase(bag, 'amphora', x, y, z, { s: 1.15, dark: false, tilt: 0.12 * (F.out[1] || -1) * -1, seg: 10 }); }
    for (let k = 0; k < 3; k++) { const [x, z] = at(ia + 0.6, va + 2.0 + k * 0.9); vase(bag, 'pithos', x, y, z, { s: 0.85, seg: 12 }); col.circle(x, z, 0.33, y, y + 0.95); }
    for (let k = 0; k < 4; k++) { const [x, z] = at(ia + 2.9 + k * 0.5, va + 0.65); vase(bag, 'kylix', x, y + 0.95, z, { s: 1.1, seg: 10 }); }
    const [px, pz] = at(ib - 1.0, va + 0.65); vase(bag, 'krater', px, y + 0.95, pz, { s: 0.7, dark: true, seg: 10 });
  } else {
    R(ia + 0.4, vb - 1.3, ib - 0.5, vb - 0.6, 0, 0.85, 'timber'); R(ia + 0.4, vb - 1.3, ib - 0.5, vb - 1.25, 0.85, 0.89, 'wood_dark', false);
    for (let k = 0; k < 5; k++) R(ia + 0.5, va + 1.4 + k * 0.0, ia + 2.8, va + 1.8, 0.1 * k, 0.1 * k + 0.08, 'wood_ochre', k === 4);
    for (let k = 0; k < 4; k++) { const [x, z] = at(ia + 0.4 + k * 0.5, back); bag.add('iron', rod([x, y + 1.9, z + F.out[1] * 0.04], [x, y + 1.35, z + F.out[1] * 0.04], 0.012, 4)); bag.add('wood_dark', rod([x, y + 1.35, z + F.out[1] * 0.04], [x, y + 1.15, z + F.out[1] * 0.04], 0.02, 4)); }
    // a half-made couch frame on trestles
    R(ib - 2.3, va + 1.6, ib - 0.5, va + 2.3, 0.4, 0.5, 'wood_ochre', true);
    for (const [u, v] of [[ib - 2.3, va + 1.6], [ib - 0.58, va + 1.6], [ib - 2.3, va + 2.22], [ib - 0.58, va + 2.22]]) R(u, v, u + 0.08, v + 0.08, 0, 0.4, 'wood_ochre', false);
  }
}
