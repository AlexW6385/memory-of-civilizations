// Eye-level dressing of the commoners' houses of Heian Uji (docs/settlements/heian-uji.md §15): what hangs, leans
// and stands at each front by the trade of the house (farmer, fisher, weaver, potter, carpenter, porter, woodman,
// brewer), the weathering of the walls, a lean-to on some, the trade's furnishing inside the open houses, and the
// wattle fence that fills the gaps between fronts. Small pieces are fine detail (drawn near only).

import { box, lathe, rod } from '../../core/geom.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }
const jar = (bag, m, x, y, z, r, h) => bag.add(m, lathe([[r * 0.6, 0], [r, h * 0.45], [r * 0.75, h * 0.85], [r * 0.55, h], [0.001, h]], 9, null, x, y, z));
const bundle = (bag, m, x, y, z, h) => bag.add(m, lathe([[0.02, 0], [0.09, h * 0.35], [0.07, h * 0.8], [0.001, h]], 6, null, x, y, z));

/**
 * g: { P(u, v) → [x, z] (v < 0 is out in the lane), B(mat, u0, v0, u1, v1, ya, yb, collide), L, D, y, fy, H, door, dw, wallMat, kind, rand }.
 * Called for near plans only.
 */
export function dressHouse(el, { bag, col }, g) {
  const { P, B, L, D, y, fy, H, door, dw, wallMat } = g, r = rng((el.seed || 1) * 7 + 3), trade = el.trade || 'farmer';
  // weathering: damp at the foot of the walls in patches, rain streaks under the eaves, the mud thrown up by rain
  if (wallMat === 'plaster_white') {
    for (let u = 0.2; u < L - 0.5; u += 0.9 + r() * 1.6) if (Math.abs(u - door) > 0.7) B('plaster_damp', u, -0.03, u + 0.8 + r() * 1.2, 0.0, fy, fy + 0.3 + r() * 0.5);
    for (let k = 0; k < 3; k++) { const u = 0.4 + r() * (L - 1); if (Math.abs(u - door) > 0.7) B('plaster_streak', u, -0.05, u + 0.25, -0.02, y + H - 1.3 - r() * 0.5, y + H - 0.16); }
  } else B('earth_wall', 0.02, -0.07, L - 0.02, -0.04, fy + 0.1, fy + 0.3);
  // the doorstep: a flat stone, and a plank over the gutter
  B('limestone', door - 0.55, -0.55, door + 0.55, -0.02, y - 0.2, fy - 0.12);
  // the straw rain cape (mino) and the hat on pegs by the door, a bundle of straw sandals
  const ru = door + (door > L / 2 ? -1 : 1) * (dw / 2 + 0.35);
  B('thatch_palm', ru - 0.22, -0.09, ru + 0.22, -0.05, fy + 0.95, fy + 1.75);
  B('wood_dark', ru - 0.3, -0.11, ru + 0.3, -0.05, fy + 1.78, fy + 1.84);
  if (r() < 0.6) bundle(bag, 'thatch', ...(() => { const p = P(ru + 0.45, -0.1); return [p[0], fy + 1.3, p[1]]; })(), 0.4);
  // hung under the eave: bundles of radish and onions, gourds, strings of persimmons drying
  const hang = r() < 0.75, hm = ['thatch', 'cloth_ochre', 'pottery_dark', 'cloth_red'][Math.floor(r() * 4)];
  if (hang) for (let u = 0.5; u < L - 0.4; u += 0.35 + r() * 0.3) if (Math.abs(u - door) > 0.9 && r() < 0.6) { const p = P(u, -0.3); bag.add('bamboo_culm', rod([p[0], y + H - 0.1, p[1]], [p[0], y + H - 0.55, p[1]], 0.008, 3)); bundle(bag, hm, p[0], y + H - 1.0, p[1], 0.45); }
  const pot = (u, v, m, rr, hh) => { const p = P(u, v); jar(bag, m, p[0], y, p[1], rr, hh); };
  const w2 = (u0, v0, u1, v1, ya, yb, m) => B(m, u0, v0, u1, v1, ya, yb);
  const free = (w) => { for (let k = 0; k < 6; k++) { const u = 0.3 + r() * Math.max(0.1, L - 0.6 - w); if (u + w < door - dw / 2 - 0.3 || u > door + dw / 2 + 0.3) return u; } return -1; };
  // the plank bench along the front (a third of the houses)
  if (r() < 0.33) { const u = free(1.6); if (u >= 0) { w2(u, -0.85, u + 1.6, -0.45, y + 0.4, y + 0.46, 'timber'); for (const x of [u + 0.15, u + 1.45]) w2(x - 0.04, -0.8, x + 0.04, -0.5, y, y + 0.4, 'wood_dark'); } }
  switch (trade) {
    case 'fisher': {                                            // a net hung on two poles to dry, fish baskets, a rack of split fish
      const u = free(2.6);
      if (u >= 0) {
        for (const x of [u, u + 2.4]) { const p = P(x, -1.3); bag.add('bamboo_culm', rod([p[0], y, p[1]], [p[0], y + 2.1, p[1]], 0.04, 5)); }
        const a = P(u, -1.3), b = P(u + 2.4, -1.3);
        bag.add('bamboo_culm', rod([a[0], y + 2.05, a[1]], [b[0], y + 2.05, b[1]], 0.025, 5));
        bag.add('rope_fibre', box(Math.min(a[0], b[0]) - 0.02, y + 0.9, Math.min(a[1], b[1]) - 0.02, Math.max(a[0], b[0]) + 0.02, y + 2.0, Math.max(a[1], b[1]) + 0.02));
      }
      for (let i = 0; i < 3; i++) { const p = P(0.5 + r() * (L - 1), -0.6 - r() * 0.5); bag.add('wicker', lathe([[0.18, 0], [0.24, 0.35], [0.2, 0.7], [0.1, 0.9], [0.001, 0.9]], 8, null, p[0], y, p[1])); }
      break;
    }
    case 'weaver': {                                            // skeins of hemp hung on a pole, a vat of indigo, cloth on a frame
      const u = free(2.2);
      if (u >= 0) {
        const a = P(u, -0.5), b = P(u + 2.2, -0.5);
        bag.add('bamboo_culm', rod([a[0], y + 2.0, a[1]], [b[0], y + 2.0, b[1]], 0.025, 5));
        for (let k = 0; k < 7; k++) { const t = (k + 0.5) / 7, x = a[0] + (b[0] - a[0]) * t, z = a[1] + (b[1] - a[1]) * t; bag.add(k % 3 === 0 ? 'cloth_indigo' : 'cloth_white', box(x - 0.07, y + 1.15, z - 0.07, x + 0.07, y + 2.0, z + 0.07)); }
      }
      pot(L - 0.6, -0.8, 'pottery_dark', 0.38, 0.7);
      break;
    }
    case 'potter': {                                            // a rack of jars and bowls along the front, a clay heap
      const u = free(2.8);
      if (u >= 0) {
        w2(u, -1.0, u + 2.8, -0.5, y + 0.4, y + 0.46, 'timber');
        for (const x of [u + 0.1, u + 1.4, u + 2.7]) w2(x - 0.04, -0.95, x + 0.04, -0.55, y, y + 0.4, 'wood_dark');
        for (let k = 0; k < 7; k++) { const p = P(u + 0.25 + k * 0.38, -0.75); jar(bag, k % 3 ? 'pottery_dark' : 'terracotta', p[0], y + 0.46, p[1], 0.12 + (k % 2) * 0.04, 0.26 + (k % 3) * 0.08); }
      }
      for (let k = 0; k < 3; k++) pot(L + 0.3, 1.0 + k * 0.7, 'pottery_dark', 0.3, 0.7);
      break;
    }
    case 'carpenter': {                                         // planks leaning against the wall, logs, a sawhorse
      const u = free(1.4);
      if (u >= 0) for (let k = 0; k < 5; k++) { const a = P(u + k * 0.26, -0.5), b = P(u + k * 0.26, -0.06); bag.add('timber', rod([a[0], y, a[1]], [b[0], y + 2.0, b[1]], 0.06, 4)); }
      { const p = P(L * 0.6, -1.6), q = P(L * 0.6 + 1.6, -1.6); bag.add('bark_dark', rod([p[0], y + 0.18, p[1]], [q[0], y + 0.18, q[1]], 0.17, 7)); bag.add('bark_dark', rod([p[0], y + 0.5, p[1]], [q[0], y + 0.5, q[1]], 0.15, 7)); }
      break;
    }
    case 'porter': {                                            // carrying poles and bundles, a rope-bound load by the door
      for (let k = 0; k < 2; k++) { const a = P(0.3 + k * 0.2, -0.12 - k * 0.07); bag.add('bamboo_culm', rod([a[0], y, a[1]], [a[0], y + 2.2, a[1]], 0.03, 5)); }
      for (let k = 0; k < 3; k++) { const p = P(L * 0.55 + k * 0.5, -0.7); bag.add('sacking', lathe([[0.22, 0], [0.28, 0.2], [0.2, 0.45], [0.001, 0.5]], 8, null, p[0], y, p[1])); }
      break;
    }
    case 'woodman': {                                           // brushwood bundles and cut logs stacked to the eave
      const u = free(2.4);
      if (u >= 0) { w2(u, -0.9, u + 2.4, -0.22, y, y + 1.45, 'bark_dark'); for (let k = 0; k < 6; k++) { const p = P(u + 0.2 + k * 0.4, -0.95); bag.add('wood_dark', lathe([[0.05, 0], [0.05, 0.05], [0.05, 0.1]], 5, null, p[0], y + 1.45, p[1])); } }
      for (let k = 0; k < 4; k++) { const p = P(L + 0.6, 0.4 + k * 0.55); bundle(bag, 'thatch', p[0], y, p[1], 1.3); }
      break;
    }
    case 'brewer': {                                            // big jars with lids in a row, a pole with a bundle of cedar as the sign
      for (let k = 0; k < 4; k++) pot(0.4 + k * 0.7, -0.8, k % 2 ? 'pottery_dark' : 'terracotta', 0.4, 0.95);
      { const p = P(L - 0.4, -1.0); bag.add('bamboo_culm', rod([p[0], y, p[1]], [p[0], y + 3.0, p[1]], 0.04, 5)); bundle(bag, 'bark_pine', p[0], y + 2.5, p[1], 0.6); }
      break;
    }
    default: {                                                  // farmer: a mortar and pestle, a heap of straw, a hoe leaning
      { const p = P(L * 0.3 + 0.5, -0.9); bag.add('limestone', lathe([[0.2, 0], [0.27, 0.15], [0.3, 0.45], [0.22, 0.5], [0.12, 0.42], [0.001, 0.42]], 9, null, p[0], y, p[1])); bag.add('timber', rod([p[0] + 0.05, y + 0.3, p[1]], [p[0] + 0.25, y + 1.2, p[1] - 0.1], 0.035, 5)); }
      { const p = P(L - 0.9, -0.8); bag.add('thatch', lathe([[0.7, 0], [0.55, 0.35], [0.2, 0.7], [0.001, 0.8]], 9, null, p[0], y, p[1])); }
      { const a = P(0.4, -0.15); bag.add('wood_dark', rod([a[0], y, a[1]], [a[0], y + 1.6, a[1]], 0.025, 4)); }
    }
  }
  // a lean-to on a third of the houses: four posts, a low roof of boards, firewood or jars under it
  if (r() < 0.34 && D > 6.4) {
    const rect = g.rc(L + 0.1, 0.5, L + 2.5, D - 0.5);
    for (const [px, pz] of [[rect[0] + 0.1, rect[1] + 0.1], [rect[2] - 0.1, rect[1] + 0.1], [rect[0] + 0.1, rect[3] - 0.1], [rect[2] - 0.1, rect[3] - 0.1]]) { bag.add('wood_dark', box(px - 0.07, y, pz - 0.07, px + 0.07, y + 2.1, pz + 0.07)); col.circle(px, pz, 0.12, y, y + 2.1); }
    const cx = (rect[0] + rect[2]) / 2, cz = (rect[1] + rect[3]) / 2, wx = rect[2] - rect[0], wz = rect[3] - rect[1];
    g.gabled(bag, { x0: rect[0], z0: rect[1], x1: rect[2], z1: rect[3], y: y + 2.0, rise: 0.4, o: 0.25, ov: 0.2, th: 0.1, alongX: wx > wz, mat: 'roof_bark', gable: 'timber' });
    bag.add('bark_dark', box(cx - wx * 0.35, y, cz - wz * 0.35, cx + wx * 0.1, y + 0.9, cz + wz * 0.1));
    jar(bag, 'pottery_dark', rect[2] - 0.5, y, rect[3] - 0.5, 0.3, 0.7);
  }
}

/** The trade's furnishing in an open house: ry the raised floor's top, u0..u1 and v0..v1 its extent (in the front's frame). */
export function furnishTrade(el, { bag, col }, g) {
  const { P, B, ry, T, L, D, g0 } = g, r = rng((el.seed || 1) * 5 + 1), trade = el.trade || 'farmer', inn = el.open === 'inn';
  const room = D - T - g0;
  if (inn) {                                                    // travellers' room: bedding rolled along the wall, bundles, a lamp dish
    for (let k = 0; k < 3; k++) { const u = T + 0.3 + k * 1.1; if (u + 0.9 < L - T) B('cloth_ochre', u, D - T - 0.9, u + 0.9, D - T - 0.15, ry + 0.04, ry + 0.3); }
    for (let k = 0; k < 2; k++) { const p = P(T + 0.4 + k * 0.5, g0 + 0.5); bag.add('sacking', lathe([[0.2, 0], [0.26, 0.2], [0.18, 0.4], [0.001, 0.45]], 8, null, p[0], ry, p[1])); }
    return;
  }
  if (room < 1.6 || L < 5) return;
  switch (trade) {
    case 'weaver': {                                            // a loom (jibata): frame, warp threads, cloth beam, a seat board
      const u = T + 0.35, v = g0 + 0.3, w = Math.min(1.6, L - 2 * T - 0.9);
      B('wood_dark', u, v, u + 0.07, v + 1.2, ry, ry + 1.1, true); B('wood_dark', u + w, v, u + w + 0.07, v + 1.2, ry, ry + 1.1);
      B('wood_dark', u, v, u + w + 0.07, v + 0.07, ry + 1.0, ry + 1.1); B('wood_dark', u, v + 1.13, u + w + 0.07, v + 1.2, ry + 0.2, ry + 0.3);
      B('cloth_white', u + 0.08, v + 0.3, u + w, v + 0.33, ry + 0.3, ry + 1.0);
      B('timber', u + 0.3, v + 1.25, u + w - 0.3, v + 1.7, ry, ry + 0.2);
      break;
    }
    case 'fisher': {                                            // nets heaped, a fish trap, an oar along the wall
      const p = P(L - T - 0.9, g0 + 0.8); bag.add('rope_fibre', lathe([[0.5, 0], [0.55, 0.15], [0.35, 0.35], [0.001, 0.4]], 9, null, p[0], ry, p[1]));
      const q = P(T + 0.6, g0 + 0.7); bag.add('wicker', lathe([[0.2, 0], [0.26, 0.4], [0.2, 0.8], [0.001, 0.85]], 8, null, q[0], ry, q[1]));
      break;
    }
    case 'potter': {                                            // unfired pots drying on boards
      for (let k = 0; k < 6; k++) { const p = P(T + 0.4 + (k % 3) * 0.6, g0 + 0.5 + Math.floor(k / 3) * 0.6); jar(bag, 'pottery_dark', p[0], ry, p[1], 0.17, 0.3 + r() * 0.1); }
      break;
    }
    case 'carpenter': { B('timber', T + 0.2, g0 + 0.3, T + 2.0, g0 + 0.55, ry, ry + 0.05); B('wood_dark', T + 0.3, g0 + 0.9, T + 1.6, g0 + 1.2, ry, ry + 0.4); break; }
    case 'brewer': { for (let k = 0; k < 4; k++) { const p = P(T + 0.5 + k * 0.7, g0 + 0.5); jar(bag, 'pottery_dark', p[0], ry, p[1], 0.32, 0.8); } break; }
    default: {                                                  // rice bales and a winnowing basket
      for (let k = 0; k < 3; k++) { const p = P(L - T - 0.5 - k * 0.55, g0 + 0.6); bag.add('thatch', lathe([[0.2, 0], [0.24, 0.12], [0.2, 0.4], [0.001, 0.42]], 8, null, p[0], ry, p[1])); }
      const q = P(T + 0.6, g0 + 0.6); bag.add('wicker', lathe([[0.4, 0], [0.45, 0.06], [0.001, 0.06]], 10, null, q[0], ry, q[1]));
    }
  }
}

/** wattle: { a, b, y, h } a fence of woven panels between posts, filling the gap between two fronts. */
export function wattle(el, { bag, col }) {
  const [ax, az] = el.a, [bx, bz] = el.b, y = el.y ?? 0, h = el.h ?? 1.25, len = Math.hypot(bx - ax, bz - az), n = Math.max(1, Math.round(len / 1.8));
  bag.add('wicker', box(Math.min(ax, bx) - 0.04, y, Math.min(az, bz) - 0.04, Math.max(ax, bx) + 0.04, y + h - 0.1, Math.max(az, bz) + 0.04));
  for (let i = 0; i <= n; i++) { const x = ax + (bx - ax) * i / n, z = az + (bz - az) * i / n; bag.add('bark_dark', box(x - 0.05, y, z - 0.05, x + 0.05, y + h + 0.1, z + 0.05)); }
  col.segment([ax, az], [bx, bz], 0.14, y, y + h);
}
