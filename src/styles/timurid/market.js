// The market of Timurid Samarkand (docs/settlements/timurid-samarkand.md §5, §15): the stalls and spread goods of the Registan,
// the goods hung and set out before the shops of the bazaar's streets, the awnings of the shop rows, and the things of the
// lanes (a cart, a ladder, dung cakes drying, a stack of straw). All cheap boxes and lathes; the cloth sways in the wind.

import { box, lathe, place, rod, clothBox, addCloth } from '../../core/geom.js';
import * as F from '../mughal/furnish.js';
import { rng } from './kit.js';

const bx = (bag, m, x0, y0, z0, x1, y1, z1) => bag.add(m, box(Math.min(x0, x1), y0, Math.min(z0, z1), Math.max(x0, x1), y1, Math.max(z0, z1)));
const CLOTHS = ['cloth_red', 'cloth_indigo', 'cloth_ochre', 'cloth_maroon', 'cloth_green', 'cloth_white'];

/** A hung carpet or cloth in the wind on a rail: w × h, its medallion and border. */
export function hungCarpet(bag, x, y, z, w, h, yaw, rand) {
  const c = place(clothBox(-w / 2, -h, -0.015, w / 2, 0, 0.015), x, y, z, yaw);
  addCloth(bag, CLOTHS[Math.floor(rand() * 4)], c, y);
  const m = place(clothBox(-w * 0.2, -h * 0.7, 0.015, w * 0.2, -h * 0.3, 0.03), x, y, z, yaw);
  addCloth(bag, CLOTHS[Math.floor(rand() * 6)], m, y);
  for (const s of [-1, 1]) addCloth(bag, 'cloth_white', place(clothBox(s * w * 0.46 - 0.02, -h, 0.015, s * w * 0.46 + 0.02, 0, 0.025), x, y, z, yaw), y);
}
function melons(bag, x, z, yaw, n, rand) {
  for (let i = 0; i < n; i++) {
    const a = rand() * 6.28, r = Math.sqrt(rand()) * 0.5, k = 0.9 + rand() * 0.35, lay = i > 6 ? 0.2 : 0;
    bag.add(rand() < 0.55 ? 'cloth_green' : 'cloth_ochre', lathe([[0.001, 0], [0.12 * k, 0.03], [0.17 * k, 0.15 * k], [0.12 * k, 0.28 * k], [0.001, 0.31 * k]], 8, null, x + Math.cos(a) * r * (1 - lay), lay ? 0.2 : 0, z + Math.sin(a) * r * (1 - lay)));
  }
  void yaw;
}
function basket(bag, x, y, z, goods, k = 1) {
  bag.add('wicker', lathe([[0.001, 0], [0.2 * k, 0], [0.27 * k, 0.2 * k], [0.26 * k, 0.26 * k], [0.22 * k, 0.24 * k], [0.001, 0.2 * k]], 10, null, x, y, z));
  bag.add(goods, lathe([[0.22 * k, 0.22 * k], [0.15 * k, 0.32 * k], [0.001, 0.36 * k]], 10, null, x, y, z));
}

/**
 * tim_market: stalls and spread goods { rect: [x0, z0, x1, z1], seed, stalls: [[x, z, yaw, kind]...] }: each stall four posts,
 * a cloth awning in the wind, a trestle table and the goods of a kind (melons, pots, cloth, bread, copper, fruit, carpets);
 * spread goods on a reed mat on the ground.
 */
export function market(el, { bag, col, lights }) {
  const rand = rng(el.seed ?? 5);
  for (const [x, z, yaw, kind] of el.stalls) {
    const c = Math.cos(yaw), s = Math.sin(yaw), P = (u, v) => [x + u * c + v * s, z - u * s + v * c];
    const W = 2.8, Dp = 2.0;
    for (const du of [-W / 2, W / 2]) for (const dv of [-Dp / 2, Dp / 2]) { const p = P(du, dv); bx(bag, 'timber', p[0] - 0.045, 0, p[1] - 0.045, p[0] + 0.045, dv < 0 ? 2.75 : 2.45, p[1] + 0.045); col.circle(p[0], p[1], 0.07, 0, 2.5); }
    // the awning slopes toward the front (+v): the back edge higher
    const aw = clothBox(-W / 2 - 0.15, -0.03, -Dp / 2 - 0.2, W / 2 + 0.15, 0.03, Dp / 2 + 0.25, 0.3); const awn = place(aw, x, 2.6, z, yaw);
    addCloth(bag, ['cloth_white', 'cloth_red', 'cloth_ochre', 'cloth_indigo'][Math.floor(rand() * 4)], awn, 2.7);
    addCloth(bag, 'cloth_white', place(clothBox(-W / 2 - 0.15, -0.4, Dp / 2 + 0.22, W / 2 + 0.15, 0, Dp / 2 + 0.26, 0.2), x, 2.62, z, yaw), 2.62);
    // the table at the back, the goods
    const t = P(0, -0.1);
    bag.add('timber', place(box(-1.2, 0.72, -0.4, 1.2, 0.78, 0.4), t[0], 0, t[1], yaw));
    for (const du of [-1.1, 1.1]) for (const dv of [-0.33, 0.33]) bag.add('wood_dark', place(box(du - 0.03, 0, dv - 0.03, du + 0.03, 0.72, dv + 0.03), t[0], 0, t[1], yaw));
    col.segment(P(-1.2, -0.1), P(1.2, -0.1), 0.8, 0, 0.8);
    const g = (u, dv = 0) => P(u, -0.1 + dv);
    switch (kind) {
      case 'melon': for (const u of [-0.8, 0, 0.8]) { const p = g(u); melons(bag, p[0], p[1], yaw, 7, rand); } break;
      case 'pots': { const p = g(-0.5), q = g(0.6); F.pots(bag, p[0], 0.78, p[1], yaw, 5); F.pots(bag, q[0], 0.78, q[1], yaw, 4, ['glaze_blue', 'glaze_green', 'glaze_white']); const r = P(-1.5, 0.9); F.pots(bag, r[0], 0, r[1], yaw, 5); break; }
      case 'cloth': { const p = g(-0.4), q = g(0.7); F.bolts(bag, p[0], 0.78, p[1], 5, yaw); F.bolts(bag, q[0], 0.78, q[1], 3, yaw + 0.1); const r = P(0, -Dp / 2 + 0.1); hungCarpet(bag, r[0], 2.4, r[1], 1.6, 1.2, yaw, rand); break; }
      case 'bread': { const p = g(-0.3); for (let i = 0; i < 12; i++) bag.add('cloth_ochre', lathe([[0.001, 0], [0.13, 0], [0.14, 0.02], [0.11, 0.045], [0.001, 0.05]], 10, null, p[0] + Math.cos(-yaw) * ((i % 6) * 0.3 - 0.75), 0.78 + Math.floor(i / 6) * 0.05, p[1] + Math.sin(-yaw) * ((i % 6) * 0.3 - 0.75))); basket(bag, P(1.0, 0.8)[0], 0, P(1.0, 0.8)[1], 'cloth_ochre', 1.3); break; }
      case 'copper': { const p = g(-0.5), q = g(0.6); F.copperware(bag, p[0], 0.78, p[1], yaw, 3, 5); F.copperware(bag, q[0], 0.78, q[1], yaw, 9, 4); break; }
      case 'carpets': { const p = P(0, -Dp / 2 + 0.2); F.rolledCarpets(bag, p[0], 0, p[1], 5, 1.8, yaw); const r = g(0); F.carpet(bag, r[0], 0.78, r[1], 1.8, 0.7, yaw, 'persian'); hungCarpet(bag, P(-0.8, -Dp / 2 + 0.05)[0], 2.4, P(-0.8, -Dp / 2 + 0.05)[1], 1.2, 1.4, yaw, rand); break; }
      default: { for (const u of [-0.8, 0, 0.8]) { const p = g(u); basket(bag, p[0], 0.78, p[1], ['cloth_red', 'cloth_ochre', 'cloth_maroon'][Math.floor(rand() * 3)], 1.1); } const r = P(-1.6, 0.8); basket(bag, r[0], 0, r[1], 'cloth_green', 1.5); }
    }
    // the seller's seat, a felt on the ground
    const f = P(0, 0.8); F.kilim(bag, f[0], 0.01, f[1], 1.2, 0.7, yaw, ['cloth_indigo', 'cloth_red', 'cloth_ochre', 'cloth_white']);
  }
  // goods spread on mats at the ground
  for (const [x, z, yaw, kind] of el.spreads ?? []) {
    bag.add('reed_mat', place(box(-1.3, 0, -0.9, 1.3, 0.025, 0.9), x, 0.0, z, yaw));
    const c = Math.cos(yaw), s = Math.sin(yaw), P = (u, v) => [x + u * c + v * s, z - u * s + v * c];
    if (kind === 'melon') for (const u of [-0.7, 0.7]) { const p = P(u, 0); melons(bag, p[0], p[1], yaw, 9, rand); }
    else if (kind === 'pots') { const p = P(-0.6, 0), q = P(0.6, 0.1); F.pots(bag, p[0], 0.025, p[1], yaw, 5); F.pots(bag, q[0], 0.025, q[1], yaw, 5, ['glaze_blue', 'glaze_green', 'terracotta']); }
    else if (kind === 'grain') for (const u of [-0.7, 0, 0.7]) { const p = P(u, 0); F.spiceSacks(bag, p[0], 0.025, p[1], yaw, 2); }
    else for (const u of [-0.7, 0, 0.7]) { const p = P(u, 0.1); basket(bag, p[0], 0.025, p[1], ['cloth_red', 'cloth_ochre', 'cloth_green'][Math.floor(rand() * 3)], 1.1); }
  }
  void lights;
}

/**
 * tim_bazaar_dress: the dressing of a bazaar street a→b { w (5), bay (5), seed }: carpets and cloths hung before the shop
 * openings, baskets, sacks, jars and melons at the foot of the arcade, a trader's scale on the sills.
 */
export function bazaarDress(el, { bag, col }) {
  const a = el.a, b = el.b, w = el.w ?? 5, bay = el.bay ?? 5, rand = rng(el.seed ?? 3);
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L, nx = -uz, nz = ux, n = Math.max(1, Math.round(L / bay)), bw = L / n;
  const yawOf = (sg) => Math.atan2(-nx * sg, -nz * sg);                      // facing the street from the side sg
  const skip = el.skip ?? [];
  for (const sg of [-1, 1]) for (let i = 0; i < n; i++) {
    const uc = (i + 0.5) * bw, off = sg * (w / 2 - 0.18);
    const P = (u, v) => [a[0] + ux * u + nx * v, a[1] + uz * u + nz * v];
    if (skip.some(([p, q]) => uc > p && uc < q)) continue;
    const yaw = yawOf(sg), k = Math.floor(rand() * 5);
    // hung carpets and cloths from a rail across the opening's head
    const rail = P(uc, sg * (w / 2 - 0.05));
    bag.add('timber', place(box(-bw * 0.33, 0, -0.03, bw * 0.33, 0.06, 0.03), rail[0], 2.95, rail[1], Math.atan2(ux, uz) + Math.PI / 2 * 0 + (Math.abs(ux) > 0.5 ? Math.PI / 2 * 0 : 0)));
    if (k !== 4) for (let j = 0; j < 2; j++) { const q = P(uc + (j - 0.5) * 1.6, sg * (w / 2 - 0.08)); hungCarpet(bag, q[0], 2.95, q[1], 1.3, 1.4 + rand() * 0.4, yaw, rand); }
    // at the foot of the arcade, by the opening's side
    const side = P(uc + (rand() < 0.5 ? -1.45 : 1.45), off - sg * 0.1), yy = yaw;
    const kind = (k + (sg > 0 ? 0 : 2) + i) % 5;
    if (kind === 0) basket(bag, side[0], 0, side[1], ['cloth_red', 'cloth_ochre'][i % 2], 1.3);
    else if (kind === 1) F.spiceSacks(bag, side[0], 0, side[1], yy, 3);
    else if (kind === 2) F.pots(bag, side[0], 0, side[1], yy, 5);
    else if (kind === 3) melons(bag, side[0], side[1], yy, 9, rand);
    else F.copperware(bag, side[0], 0, side[1], yy, i, 4);
    col.circle(side[0], side[1], 0.3, 0, 0.5);
  }
}

/** tim_lane_item: one thing of the lane at a point and facing { kind, at: [x, z], yaw (the lane-facing direction) }. */
export function laneItem(f, kind, rand, bag, col, H) {
  const [px, pz] = f.p(f.s, 0.0), N = f.n, yaw = Math.atan2(N[0], N[1]);
  const at = (ds, o) => f.p(f.s + ds, o);
  switch (kind) {
    case 'cart': {
      // an arba: two tall wheels, a bed, the shafts resting on the ground
      const c = at(0, 0.95), ax = f.u, ay = Math.atan2(ax[0], ax[1]);
      for (const sgn of [-1, 1]) {
        const wp = [c[0] + N[0] * sgn * 0.62, c[1] + N[1] * sgn * 0.62];
        const g = lathe([[0.001, 0], [0.88, 0], [0.88, 0.07], [0.001, 0.07]], 20); g.rotateX(Math.PI / 2); g.translate(0, 0.9, 0.035);
        bag.add('wood_dark', place(g, wp[0], 0, wp[1], yaw));
        const r = lathe([[0.9, -0.01], [0.9, 0.09], [0.86, 0.09], [0.86, -0.01]], 20); r.rotateX(Math.PI / 2); r.translate(0, 0.9, 0.035);
        bag.add('iron', place(r, wp[0], 0, wp[1], yaw));
        const hub = lathe([[0.001, -0.04], [0.14, -0.04], [0.14, 0.11], [0.001, 0.11]], 10); hub.rotateX(Math.PI / 2); hub.translate(0, 0.9, 0.035);
        bag.add('timber', place(hub, wp[0], 0, wp[1], yaw));
      }
      bag.add('timber', place(box(-0.55, 0.9, -1.1, 0.55, 0.98, 1.1), c[0], 0, c[1], ay + Math.PI / 2));
      for (const sgn of [-1, 1]) bag.add('wood_dark', place(box(-0.55, 0.98, sgn * 1.1 - 0.03, 0.55, 1.35, sgn * 1.1 + 0.03), c[0], 0, c[1], ay + Math.PI / 2));
      for (const sgn of [-1, 1]) bag.add('wood_dark', place(box(sgn * 0.5 - 0.03, 0.98, -1.1, sgn * 0.5 + 0.03, 1.35, 1.1), c[0], 0, c[1], ay + Math.PI / 2));
      for (const sgn of [-1, 1]) bag.add('timber', place(box(sgn * 0.3 - 0.04, 0.55, -2.9, sgn * 0.3 + 0.04, 0.62, -1.0), c[0], 0, c[1], ay + Math.PI / 2));
      F.spiceSacks(bag, c[0], 0.98, c[1], ay + Math.PI / 2, 3, ['cloth_ochre', 'cloth_red']); F.bale(bag, c[0] + ax[0] * 0.5, 0.98, c[1] + ax[1] * 0.5, 0.7, 0.4, 0.5, ay, 'thatch');
      const e0 = f.p(f.s - 1.2, 0.0), e1 = f.p(f.s + 2.3, 1.8); col.rect([Math.min(e0[0], e1[0]), Math.min(e0[1], e1[1]), Math.max(e0[0], e1[0]), Math.max(e0[1], e1[1])], 0, 1.0);
      break;
    }
    case 'dung': {
      for (let r = 0; r < 5; r++) for (let i = 0; i < 6; i++) { const p = f.p(f.s + i * 0.28, 0); bag.add('mud_plaster', place(box(-0.11, 0, 0.012, 0.11, 0.2, 0.06), p[0] + N[0] * 0.0, 0.9 + r * 0.22, p[1], yaw)); }
      break;
    }
    case 'straw': { const p = at(0.4, 0.75); bag.add('thatch', lathe([[0.75, 0], [0.7, 0.45], [0.5, 0.95], [0.2, 1.3], [0.001, 1.45]], 10, null, p[0], 0, p[1])); col.circle(p[0], p[1], 0.7, 0, 1.4); break; }
    case 'ladder': {
      for (const d of [-0.22, 0.22]) { const bb = f.p(f.s + 0.2 + d, 1.0), tt = f.p(f.s + 0.2 + d, 0.1); bag.add('timber', rod([bb[0], 0, bb[1]], [tt[0], H - 0.2, tt[1]], 0.035, 5)); }
      for (let r = 0; r < 9; r++) { const t = (r + 0.7) / 10.2, p0 = f.p(f.s + 0.2 - 0.22, 1.0 - 0.9 * t), p1 = f.p(f.s + 0.2 + 0.22, 1.0 - 0.9 * t); bag.add('timber', rod([p0[0], (H - 0.2) * t, p0[1]], [p1[0], (H - 0.2) * t, p1[1]], 0.025, 4)); }
      break;
    }
    case 'carpet': { const q = at(0, 0.02); hungCarpet(bag, q[0] + N[0] * 0.03, 2.4, q[1] + N[1] * 0.03, 1.8, 1.5, yaw, rand); bag.add('timber', place(box(-1.0, 0, -0.03, 1.0, 0.05, 0.03), q[0] + N[0] * 0.05, 2.38, q[1] + N[1] * 0.05, yaw)); break; }
    default: { const p = at(0, 0.45); F.waterJar(bag, p[0], 0, p[1], 1.0); const q = at(0.5, 0.4); F.waterJar(bag, q[0], 0, q[1], 0.8); const r = at(-0.5, 0.45); F.pots(bag, r[0], 0, r[1], yaw, 3); }
  }
  void px; void pz;
}
