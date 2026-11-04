// The Gothic city (Paris about 1248; docs/settlements/paris.md §4): a cathedral's massing — the
// nave and choir under a steep lead roof, lower aisles, the transept, the rounded apse, the twin
// west towers with their rose; the palace's long hall. Registered into the `gothic` style.

import { STYLES } from '../../core/build.js';
import { box, frustum, lathe } from '../../core/geom.js';
import './index.js';

const L = 'limestone';
/** cathedral: { rect (along x, the west front at x0), nave (height), towers (height), y } */
function cathedral(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, H = el.nave ?? 33, T = el.towers ?? 69, W = z1 - z0, cz = (z0 + z1) / 2, nw = W * 0.3;
  const tw = W * 0.42, td = Math.min(16, (x1 - x0) * 0.13);
  // aisles (low, both sides) and the nave and choir (high), the roofs
  for (const s of [-1, 1]) {
    const r = [x0 + td, s < 0 ? z0 : cz + nw / 2, x1 - W * 0.4, s < 0 ? cz - nw / 2 : z1];
    bag.add(L, box(r[0], y - 0.5, r[1], r[2], y + H * 0.45, r[3])); col.rect(r, y, y + H * 0.45);
    bag.add('lead', frustum([r[0], r[1], r[2], r[3]], y + H * 0.45, y + H * 0.52, 0, 0, s < 0 ? 0 : (r[3] - r[1]) * 0.98, s < 0 ? (r[3] - r[1]) * 0.98 : 0));
  }
  const n = [x0 + td, cz - nw / 2, x1 - W * 0.4, cz + nw / 2];
  bag.add(L, box(n[0], y - 0.5, n[1], n[2], y + H, n[3])); col.rect(n, y, y + H);
  bag.add('lead', frustum([n[0], n[1] - 0.4, n[2], n[3] + 0.4], y + H, y + H + nw * 0.85, 0, 0, nw / 2 + 0.35, nw / 2 + 0.35));
  // the transept
  const tx = x0 + (x1 - x0) * 0.58, t = [tx - nw / 2, z0 - 2, tx + nw / 2, z1 + 2];
  bag.add(L, box(t[0], y - 0.5, t[1], t[2], y + H, t[3])); col.rect(t, y, y + H);
  bag.add('lead', frustum([t[0] - 0.4, t[1], t[2] + 0.4, t[3]], y + H, y + H + nw * 0.85, nw / 2 + 0.35, nw / 2 + 0.35, 0, 0));
  for (const zz of [t[1] - 0.06, t[3] + 0.06]) bag.add('stained_glass', box(tx - nw * 0.32, y + H * 0.45, zz - 0.04, tx + nw * 0.32, y + H * 0.8, zz + 0.04));   // the transept's great windows
  // the apse: the choir's rounded east end, its ambulatory lower round it
  const ax = x1 - W * 0.4;
  bag.add(L, lathe([[W * 0.5, 0], [W * 0.5, H * 0.45 + 0.5], [0.001, H * 0.45 + 0.5]], 20, null, ax, y - 0.5, cz));
  bag.add(L, lathe([[nw / 2, 0], [nw / 2, H + 0.5], [0.001, H + 0.5]], 16, null, ax, y - 0.5, cz));
  bag.add('lead', lathe([[nw / 2 + 0.4, 0], [0.001, nw * 0.85]], 16, null, ax, y + H, cz));
  col.circle(ax, cz, W * 0.5, y, y + H);
  // the west front: two towers and the rose between them
  for (const s of [-1, 1]) {
    const r = [x0, s < 0 ? z0 : z1 - tw, x0 + td, s < 0 ? z0 + tw : z1];
    bag.add(L, box(r[0], y - 0.5, r[1], r[2], y + T, r[3])); col.rect(r, y, y + T); col.floor(r, y + T);
    for (let k = 0; k < 3; k++) bag.add('opening', box(r[0] - 0.05, y + T * 0.68, r[1] + tw * (0.15 + k * 0.27), r[0] + 0.02, y + T * 0.93, r[1] + tw * (0.3 + k * 0.27)));
  }
  const m = [x0, z0 + tw, x0 + td, z1 - tw];
  bag.add(L, box(m[0], y - 0.5, m[1], m[2], y + T * 0.65, m[3])); col.rect(m, y, y + T * 0.65);
  bag.add('stained_glass', box(x0 - 0.06, y + T * 0.36 - 5, cz - 5, x0 + 0.02, y + T * 0.36 + 5, cz + 5));   // the rose
  for (let k = 0; k < 3; k++) bag.add('opening', box(x0 - 0.05, y, z0 + tw * 0.25 + k * (W - tw * 0.5) / 3, x0 + 0.02, y + 9, z0 + tw * 0.25 + k * (W - tw * 0.5) / 3 + 4.5));
}
/** great_hall: a long hall { rect, h, y } — stone walls, tall windows, a steep slate roof. */
function greatHall(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, h = el.h ?? 16, along = x1 - x0 > z1 - z0;
  bag.add(L, box(x0, y - 0.5, z0, x1, y + h, z1)); col.rect(el.rect, y, y + h);
  const w = along ? z1 - z0 : x1 - x0;
  bag.add('slate', frustum([x0 - 0.4, z0 - 0.4, x1 + 0.4, z1 + 0.4], y + h, y + h + w * 0.7, along ? 0 : w / 2 + 0.35, along ? 0 : w / 2 + 0.35, along ? w / 2 + 0.35 : 0, along ? w / 2 + 0.35 : 0));
  const len = along ? x1 - x0 : z1 - z0, n = Math.floor(len / 6);
  for (let i = 0; i < n; i++) { const u = (along ? x0 : z0) + (i + 0.5) * len / n; for (const s of [0, 1]) { const q = along ? [u - 1, s ? z1 - 0.02 : z0 - 0.06, u + 1, s ? z1 + 0.06 : z0 + 0.02] : [s ? x1 - 0.02 : x0 - 0.06, u - 1, s ? x1 + 0.06 : x0 + 0.02, u + 1]; bag.add('opening', box(q[0], y + h * 0.3, q[1], q[2], y + h * 0.85, q[3])); } }
}
Object.assign(STYLES.gothic.elements, { cathedral, great_hall: greatHall });
