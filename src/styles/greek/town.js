// The Greek town (Classical Athens; docs/settlements/athens.md §4–§5): courtyard houses of mudbrick
// on stone socles under tiled roofs; a bronze statue on its base; the
// Acropolis wall (the stoas, the Tholos and the market are in agora.js). Registered into the `greek` style beside the temple vocabulary.

import { STYLES } from '../../core/build.js';
import { box, frustum, lathe, fromTriangles, orientOutward } from '../../core/geom.js';
import { merge } from './columns.js';
import './index.js';
import './agora.js';
import './slope.js';

/** The two gable triangles of a roof over r (ridge along x when `along`), set just inside the wall faces, 0.28 thick. */
function gables(r, y, rise, along) {
  const t = [];
  const tri = (P) => { const [a, b, c, a2, b2, c2] = P; t.push(...a, ...b, ...c, ...a2, ...c2, ...b2); for (const [p, q, p2, q2] of [[a, b, a2, b2], [b, c, b2, c2], [c, a, c2, a2]]) t.push(...p, ...p2, ...q2, ...p, ...q2, ...q); };
  for (const [e, s] of along ? [[r[0], 1], [r[2], -1]] : [[r[1], 1], [r[3], -1]]) {
    const u0 = e + s * 0.02, u1 = e + s * 0.3, [w0, w1] = along ? [r[1] + 0.02, r[3] - 0.02] : [r[0] + 0.02, r[2] - 0.02], wm = (w0 + w1) / 2;
    const P = (u, w, yy) => (along ? [u, yy, w] : [w, yy, u]);
    const one = [P(u0, w0, y), P(u0, w1, y), P(u0, wm, y + rise - 0.04), P(u1, w0, y), P(u1, w1, y), P(u1, wm, y + rise - 0.04)];
    const tt = [];
    const save = t.length; tri(one); tt.push(...t.splice(save)); t.push(...orientOutward(tt));
  }
  return fromTriangles(t);
}
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
/**
 * greek_house: { rect, seed, y, near } — rooms round a court, plastered mudbrick on a stone socle, roofs of tile; the
 * court shut from the street on the south by its wall (or a low range of rooms) with the street door in it: a frame of
 * timber, the leaf shut, a stone threshold; small high windows with shutters. `near` (the houses along the ways): the
 * herm beside the door, and in the court the altar of Zeus Herkeios, the well-head and a storage jar.
 */
function house(el, ctx) {
  const { bag, col } = ctx, rand = rng(el.seed || 1), [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, h = 3.2 + (rand() < 0.3 ? 2.8 : 0), d = Math.min(4, (z1 - z0) * 0.38);
  const wings = [[x0, z0, x1, z0 + d], [x0, z0 + d, x0 + d * 0.9, z1], [x1 - d * 0.9, z0 + d, x1, z1]];
  const southRange = rand() < 0.5;
  if (southRange) wings.push([x0 + d * 0.9, z1 - 1.2, x1 - d * 0.9, z1]);
  const plaster = rand() < 0.35 ? 'plaster_white' : 'mud_plaster';
  wings.forEach((r, i) => {
    const hh = i === 0 ? h : 3.2;
    bag.add('rubble', box(r[0], y - 0.6, r[1], r[2], y + 0.7, r[3]));
    bag.add(plaster, box(r[0] + 0.02, y + 0.7, r[1] + 0.02, r[2] - 0.02, y + hh, r[3] - 0.02));
    col.rect(r, y - 0.6, y + hh);
    if (i < 3) {                                   // the tiled roofs, kept even in the simple (far) houses: they are cheap and they are the town
      const along = r[2] - r[0] > r[3] - r[1], rise = (along ? r[3] - r[1] : r[2] - r[0]) * 0.3;
      // the tiles over the slopes only; the gable ends are walls of plaster under the overhang
      bag.add('roof_tile', frustum([r[0] - 0.3, r[1] - 0.3, r[2] + 0.3, r[3] + 0.3], y + hh, y + hh + rise, along ? 0 : (r[2] - r[0]) / 2 + 0.25, along ? 0 : (r[2] - r[0]) / 2 + 0.25, along ? (r[3] - r[1]) / 2 + 0.25 : 0, along ? (r[3] - r[1]) / 2 + 0.25 : 0, along ? { noXn: true, noXp: true } : { noZn: true, noZp: true }));
      bag.add(plaster, gables(r, y + hh, rise, along));
    }
  });
  // the court wall on the street (where there is no range of rooms there), coped with tiles
  const cx0 = x0 + d * 0.9, cx1 = x1 - d * 0.9;
  if (!southRange && cx1 - cx0 > 1.5) {
    const r = [cx0, z1 - 0.4, cx1, z1];
    bag.add('rubble', box(r[0], y - 0.6, r[1], r[2], y + 0.7, r[3])); bag.add(plaster, box(r[0] + 0.02, y + 0.7, r[1] + 0.02, r[2] - 0.02, y + 2.5, r[3] - 0.02));
    bag.add('roof_tile', frustum([r[0] - 0.04, r[1] - 0.12, r[2] + 0.04, r[3] + 0.12], y + 2.5, y + 2.72, 0, 0, 0.2, 0.2));
    col.rect(r, y - 0.6, y + 2.5);
  }
  // the street door: a timber frame proud of the wall, the leaf shut inside it, a threshold of stone before it
  const dw = 1.05, dx = cx1 - cx0 > dw + 0.8 ? cx0 + 0.4 + rand() * (cx1 - cx0 - dw - 0.8) + dw / 2 : (x0 + x1) / 2, dh = 2.15, zf = z1 - 0.05;
  bag.add('timber', box(dx - dw / 2 - 0.14, y + 0.05, zf, dx - dw / 2, y + dh + 0.14, zf + 0.12));
  bag.add('timber', box(dx + dw / 2, y + 0.05, zf, dx + dw / 2 + 0.14, y + dh + 0.14, zf + 0.12));
  bag.add('timber', box(dx - dw / 2 - 0.22, y + dh, zf, dx + dw / 2 + 0.22, y + dh + 0.18, zf + 0.14));
  bag.add('wood_dark', box(dx - dw / 2, y + 0.05, zf, dx + dw / 2, y + dh, zf + 0.075));
  bag.add('limestone', box(dx - dw / 2 - 0.2, y - 0.1, zf, dx + dw / 2 + 0.2, y + 0.05, zf + 0.45));
  // small windows high in the outer walls, shuttered
  const sh = [];
  for (const u of [0.3, 0.7]) sh.push(box(x0 + (x1 - x0) * u - 0.3, y + 2.15, z0 - 0.03, x0 + (x1 - x0) * u + 0.3, y + 2.65, z0 + 0.06));
  if (h > 4) for (const u of [0.25, 0.5, 0.75]) sh.push(box(x0 + (x1 - x0) * u - 0.3, y + 4.4, z0 - 0.03, x0 + (x1 - x0) * u + 0.3, y + 5.0, z0 + 0.06));
  sh.push(box(x0 - 0.03, y + 2.15, (z0 + z1) / 2 + 0.6, x0 + 0.06, y + 2.65, (z0 + z1) / 2 + 1.1), box(x1 - 0.06, y + 2.15, (z0 + z1) / 2 + 0.6, x1 + 0.03, y + 2.65, (z0 + z1) / 2 + 1.1));
  bag.add('wood_dark', merge(sh));
  if (!el.near) return;
  // the herm at the door, the altar, the well-head and a storage jar in the court
  STYLES.greek.elements.herm({ at: [dx + dw / 2 + 0.75, zf + 0.5], y, rot: 0 }, ctx);
  const ax = (cx0 + cx1) / 2, az = z0 + d + (z1 - z0 - d) * 0.45;
  if (cx1 - cx0 > 2.2) {
    bag.add('limestone', box(ax - 0.35, y, az - 0.3, ax + 0.35, y + 0.7, az + 0.3)); bag.add('limestone', box(ax - 0.42, y + 0.7, az - 0.37, ax + 0.42, y + 0.8, az + 0.37));
    col.rect([ax - 0.42, az - 0.37, ax + 0.42, az + 0.37], y, y + 0.8);
    bag.add('limestone', lathe([[0.42, 0], [0.42, 0.62], [0.34, 0.62], [0.34, 0.5], [0.001, 0.5]], 14, null, cx1 - 0.6, y, z0 + d + 0.6));
    col.circle(cx1 - 0.6, z0 + d + 0.6, 0.42, y, y + 0.62);
    bag.add('terracotta', lathe([[0.12, 0], [0.32, 0.25], [0.38, 0.6], [0.3, 0.95], [0.2, 1.05], [0.22, 1.12], [0.001, 1.1]], 12, null, cx0 + 0.55, y, z0 + d + 0.55));
  }
}
/** statue: a bronze on a stepped base { c, h, y } (the Athena Promachos stands about 9 m). */
function statue(el, { bag, col }) {
  const [x, z] = el.c, h = el.h ?? 9, y = el.y ?? 0, b = h * 0.18;
  bag.add('marble', box(x - 2.2, y, z - 2.2, x + 2.2, y + b, z + 2.2)); col.rect([x - 2.2, z - 2.2, x + 2.2, z + 2.2], y, y + b);
  bag.add('bronze', lathe([[0.9, 0], [0.75, h * 0.45], [0.55, h * 0.7], [0.32, h * 0.78], [0.38, h * 0.86], [0.001, h * 0.92]], 10, null, x, y + b, z));
  bag.add('bronze', lathe([[0.06, 0], [0.06, h]], 6, null, x + 0.9, y + b, z));
  bag.add('bronze', lathe([[0.75, 0], [0.75, 0.08]], 14, null, x - 0.7, y + b + h * 0.5, z));
}
export { gables };
Object.assign(STYLES.greek.elements, { greek_house: house, statue });
