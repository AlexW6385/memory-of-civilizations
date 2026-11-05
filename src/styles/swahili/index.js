// Swahili coral-stone architecture (14th–15th c.; docs/settlements/kilwa.md §4): walls of coral rag
// in lime mortar, plastered white; flat roofs on mangrove poles; the Great Mosque's prayer hall of
// bays on pillars, roofed with small domes and vaults, its great dome; the palace of Husuni Kubwa's
// courts and octagonal pool on the cliff; stone houses round courts; dhows on the shore.

import { registerStyle, STYLES } from '../../core/build.js';
import { box, lathe } from '../../core/geom.js';
import '../qing/index.js';

const C = 'coral_plaster', R = 'rubble';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
/** swahili_mosque: { rect, y, bay, big (index of the bay carrying the great dome) } — a walled hall of bays on pillars, each bay roofed by a small dome. */
function mosque(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, b = el.bay ?? 4.5, h = 4.8;
  for (const r of [[x0, z0, x1, z0 + 0.8], [x0, z1 - 0.8, x1, z1], [x0, z0, x0 + 0.8, z1], [x1 - 0.8, z0, x1, z1]]) { bag.add(C, box(r[0], y - 0.5, r[1], r[2], y + h + 0.6, r[3])); col.rect(r, y, y + h + 0.6); }
  // the walls' faces: doorways with their stepped stone frames along the sides, small windows above, buttresses at the corners and between
  for (const [a, b2, zz, alongX, sg] of [[x0, x1, z0, true, -1], [x0, x1, z1, true, 1], [z0, z1, x0, false, -1], [z0, z1, x1, false, 1]]) {
    const L = b2 - a, n = Math.floor(L / (b * 2));
    for (let i = 0; i < n; i++) {
      const u = a + (i + 0.5) * L / n, f = (m, u0, u1, v0, v1, d0, d1) => { const p0 = zz + sg * d0, p1 = zz + sg * d1; bag.add(m, alongX ? box(u + u0, y + v0, Math.min(p0, p1), u + u1, y + v1, Math.max(p0, p1)) : box(Math.min(p0, p1), y + v0, u + u0, Math.max(p0, p1), y + v1, u + u1)); };
      if (i % 2 === 0) { f('limestone', -1.0, 1.0, 0, 3.0, -0.01, 0.12); f('opening', -0.7, 0.7, 0, 2.6, 0.11, 0.14); } else { f('limestone', -0.5, 0.5, 2.8, 4.0, -0.01, 0.1); f('opening', -0.35, 0.35, 3.0, 3.8, 0.09, 0.12); }
      f(C, L / n / 2 - 0.45, L / n / 2 + 0.45, -0.5, h + 0.6, -0.01, 0.55);
    }
  }
  // a stepped merlon cresting along the roof's edge
  for (let x = x0 + 0.6; x < x1 - 0.4; x += 1.4) for (const zz of [z0 + 0.1, z1 - 0.7]) bag.add(C, box(x, y + h + 0.6, zz, x + 0.7, y + h + 1.3, zz + 0.6));
  for (let z = z0 + 0.6; z < z1 - 0.4; z += 1.4) for (const xx of [x0 + 0.1, x1 - 0.7]) bag.add(C, box(xx, y + h + 0.6, z, xx + 0.6, y + h + 1.3, z + 0.7));
  const nx = Math.floor((x1 - x0) / b), nz = Math.floor((z1 - z0) / b);
  for (let i = 1; i < nx; i++) for (let k = 1; k < nz; k++) { const x = x0 + i * (x1 - x0) / nx, z = z0 + k * (z1 - z0) / nz; bag.add(R, box(x - 0.35, y, z - 0.35, x + 0.35, y + h, z + 0.35)); col.rect([x - 0.35, z - 0.35, x + 0.35, z + 0.35], y, y + h); }
  bag.add(C, box(x0, y + h, z0, x1, y + h + 0.6, z1)); 
  for (let i = 0; i < nx; i++) for (let k = 0; k < nz; k++) {
    const x = x0 + (i + 0.5) * (x1 - x0) / nx, z = z0 + (k + 0.5) * (z1 - z0) / nz, big = el.big && i === el.big[0] && k === el.big[1];
    const r = big ? b * 0.95 : b * 0.42;
    bag.add(C, lathe([[r, 0], [r * 0.92, r * 0.38], [r * 0.6, r * 0.75], [0.001, r * 0.9]], big ? 20 : 10, null, x, y + h + 0.6, z));
  }
  bag.add('flagstone', box(x0, y - 0.3, z0, x1, y + 0.05, z1)); col.floor([x0, z0, x1, z1], y + 0.05);
}
/** swahili_house: { rect, seed, y } — rooms of coral stone round a sunken court, flat roofs, a carved door. */
function house(el, { bag, col }) {
  const rand = rng(el.seed || 1), [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, h = 3.6 + (rand() < 0.3 ? 3 : 0), d = Math.min(4, (z1 - z0) * 0.4);
  for (const [r, hh] of [[[x0, z0, x1, z0 + d], h], [[x0, z0 + d, x0 + d * 0.8, z1], 3.6], [[x1 - d * 0.8, z0 + d, x1, z1], 3.6], [[x0 + d * 0.8, z1 - 0.6, x1 - d * 0.8, z1], 2.4]]) {
    bag.add(rand() < 0.2 ? R : C, box(r[0], y - 0.5, r[1], r[2], y + hh, r[3])); col.rect(r, y - 0.5, y + hh); col.floor(r, y + hh);
    if (!el.simple) bag.add('timber', box(r[0] - 0.12, y + hh - 0.35, r[1] - 0.12, r[2] + 0.12, y + hh - 0.25, r[3] + 0.12));
  }
  if (el.simple) return;
  // the street front (north): the carved door in its stone frame, small barred windows high up, mangrove pole ends under the roof
  const mx = (x0 + x1) / 2;
  bag.add('limestone', box(mx - 0.85, y, z0 - 0.1, mx + 0.85, y + 2.7, z0 + 0.02));
  bag.add('wood_dark', box(mx - 0.6, y, z0 - 0.14, mx + 0.6, y + 2.3, z0 - 0.08));
  for (let k = 0; k < 4; k++) bag.add('timber', box(mx - 0.55, y + 0.3 + k * 0.5, z0 - 0.18, mx + 0.55, y + 0.36 + k * 0.5, z0 - 0.13));   // the door's carved bands
  for (let x = x0 + 1.2; x < x1 - 1; x += 2.6) if (Math.abs(x - mx) > 1.3) { bag.add('opening', box(x - 0.3, y + 2.4, z0 - 0.04, x + 0.3, y + 3.1, z0 + 0.01)); for (const t of [-0.15, 0, 0.15]) bag.add('wood_dark', box(x + t - 0.02, y + 2.4, z0 - 0.07, x + t + 0.02, y + 3.1, z0 - 0.03)); }
  for (let x = x0 + 0.3; x < x1; x += 0.7) bag.add('timber', box(x - 0.06, y + h - 0.5, z0 - 0.22, x + 0.06, y + h - 0.38, z0 + 0.02));
  bag.add(C, box(x0 - 0.05, y + h - 0.02, z0 - 0.05, x1 + 0.05, y + h + 0.45, z0 + 0.35));
}
/** husuni: the palace { rect, y, pool (octagon centre and radius) } — courts ringed by rooms, the octagonal bathing pool. */
function husuni(el, ctx) {
  const { bag, col } = ctx, [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, mid = (x0 + x1) / 2;
  for (const r of [[x0, z0, mid - 2, z1], [mid + 2, z0, x1, z1]]) {
    const d = 6;
    for (const q of [[r[0], r[1], r[2], r[1] + d], [r[0], r[3] - d, r[2], r[3]], [r[0], r[1] + d, r[0] + d, r[3] - d], [r[2] - d, r[1] + d, r[2], r[3] - d]]) { bag.add(C, box(q[0], y - 0.5, q[1], q[2], y + 5, q[3])); col.rect(q, y, y + 5); col.floor(q, y + 5); }
    bag.add('flagstone', box(r[0] + d, y - 0.3, r[1] + d, r[2] - d, y + 0.05, r[3] - d)); col.floor([r[0] + d, r[1] + d, r[2] - d, r[3] - d], y + 0.05);
  }
  if (el.pool) {
    const [px, pz, pr] = el.pool;
    bag.add(C, lathe([[pr + 1.2, -2], [pr + 1.2, 0.4], [pr, 0.4], [pr, -1.6], [0.001, -1.6]], 8, null, px, y, pz));
    STYLES.qing.elements.water_cells({ rect: [px - pr, pz - pr, px + pr, pz + pr], y: y - 0.3, cell: 0.6, inside: (x, z) => Math.hypot(x - px, z - pz) < pr * 0.9 }, ctx);
    col.circle(px, pz, pr + 1.2, y - 2, y + 0.4);
  }
}
registerStyle('swahili', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.qing.elements, swahili_mosque: mosque, swahili_house: house, husuni },
  objects: {},
});
