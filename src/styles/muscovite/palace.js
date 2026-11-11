// The Palace of Facets (Granovitaya palata, 1487–91, Marco Ruffo and Pietro Antonio Solari; docs/settlements/muscovy.md §1): the
// ceremonial hall of the grand princes and tsars, one great square hall on a vaulted storey, its main front covered in
// diamond-point rustication of white stone (the "facets"), reached by the Red Porch; inside, a single hall whose four cross vaults
// rest on one central pier, painted walls, the throne place, benches round the walls, the hanging candle rings.

import { box, lathe, rod } from '../../core/geom.js';
import { Shape, Path } from '../../core/three.js';
import { slab, hexa, pitched, pyr } from '../norse/index.js';

const WS = 'limestone', PL = 'plaster_white', BR = 'brick_kremlin';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
function wallShape(L, H, doors, wins) {
  const sh = new Shape(); sh.moveTo(0, 0);
  for (const d of [...doors].sort((p, q) => p.u - q.u)) { sh.lineTo(d.u - d.w / 2, 0); sh.lineTo(d.u - d.w / 2, d.h); sh.absarc(d.u, d.h, d.w / 2, Math.PI, 0, true); sh.lineTo(d.u + d.w / 2, 0); }
  sh.lineTo(L, 0); sh.lineTo(L, H); sh.lineTo(0, H); sh.lineTo(0, 0);
  for (const w of wins) { const p = new Path(); p.moveTo(w.u - w.w / 2, w.v); p.lineTo(w.u + w.w / 2, w.v); p.lineTo(w.u + w.w / 2, w.v + w.h); p.absarc(w.u, w.v + w.h, w.w / 2, 0, Math.PI, false); p.lineTo(w.u - w.w / 2, w.v); sh.holes.push(p); }
  return sh;
}
/**
 * facets_palace: { rect: [x0, z0, x1, z1], y } — the east front (toward Cathedral Square) in diamond-point stone, the Red Porch stair at its north end,
 * the hall above its vaulted storey with its door, windows and everything within. The hall's floor is at y + 5.5.
 */
export function facetsPalace(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, rand = rng(5), FL = y + 5.5, CT = y + 12.0, T = 1.6, mx = (x0 + x1) / 2, mz = (z0 + z1) / 2;
  // the vaulted storey below: solid, whitewashed, with small deep windows
  bag.add(PL, box(x0, y - 0.4, z0, x1, FL - 0.25, z1)); col.rect([x0, z0, x1, z1], y - 0.4, FL - 0.25);
  bag.add(WS, box(x0 - 0.2, y - 0.4, z0 - 0.2, x1 + 0.2, y + 0.7, z1 + 0.2));
  for (let k = 0; k < 6; k++) { const z = z0 + (k + 0.5) * (z1 - z0) / 6; for (const [x, dx] of [[x1, 1], [x0, -1]]) bag.add('opening', box(Math.min(x, x + dx * 0.04), y + 2.4, z - 0.4, Math.max(x, x + dx * 0.04), y + 3.4, z + 0.4)); }
  bag.add(WS, box(x0 - 0.1, FL - 0.4, z0 - 0.1, x1 + 0.1, FL - 0.25, z1 + 0.1));
  // the floor of the hall, flagged, over the vaults; the ceiling painted
  bag.add('flagstone', box(x0 + T, FL - 0.25, z0 + T, x1 - T, FL, z1 - T)); col.floor([x0 + T, z0 + T, x1 - T, z1 - T], FL, 'facets');
  bag.add('ceiling_painted', box(x0 + T, CT, z0 + T, x1 - T, CT + 0.3, z1 - T));
  // the walls of the hall: the east one with the door at the north end and two tall windows, the others with windows
  const L = x1 - x0, H = CT + 0.3 - FL;
  const wins = (n, w0) => Array.from({ length: n }, (_, k) => ({ u: w0 + (k + 0.5) * (L - 2 * w0) / n, v: 2.8, w: 1.5, h: 2.6 }));
  bag.add(PL, slab(wallShape(z1 - z0, H, [{ u: 4.2, w: 2.6, h: 2.9 }], [{ u: 10.2, v: 2.6, w: 1.6, h: 3.2 }, { u: 16.5, v: 2.6, w: 1.6, h: 3.2 }, { u: 21.2, v: 2.6, w: 1.6, h: 3.2 }]), T, [x1 - T / 2, z0], [x1 - T / 2, z1], FL, 10));
  bag.add(PL, slab(wallShape(z1 - z0, H, [], [{ u: 4, v: 2.6, w: 1.6, h: 3.2 }, { u: 10, v: 2.6, w: 1.6, h: 3.2 }, { u: 16, v: 2.6, w: 1.6, h: 3.2 }, { u: 21, v: 2.6, w: 1.6, h: 3.2 }]), T, [x0 + T / 2, z0], [x0 + T / 2, z1], FL, 10));
  bag.add(PL, slab(wallShape(L, H, [], wins(3, 3)), T, [x0, z0 + T / 2], [x1, z0 + T / 2], FL, 10));
  bag.add(PL, slab(wallShape(L, H, [], wins(3, 3)), T, [x0, z1 - T / 2], [x1, z1 - T / 2], FL, 10));
  col.rect([x1 - T, z0, x1, z0 + 2.9], FL, CT); col.rect([x1 - T, z0 + 5.5, x1, z1], FL, CT); col.rect([x0, z0, x0 + T, z1], FL, CT); col.rect([x0, z0, x1, z0 + T], FL, CT); col.rect([x0, z1 - T, x1, z1], FL, CT);
  col.rect([x1 - T, z0 + 2.9, x1, z0 + 5.5], FL + 2.9, CT);
  // the panes: amber mica in every window
  for (const [wx, zs] of [[x1 - T / 2, [10.2, 16.5, 21.2]], [x0 + T / 2, [4, 10, 16, 21]]]) for (const u of zs) bag.add('glass_lamp', box(wx - 0.03, FL + 2.6, z0 + u - 0.8, wx + 0.03, FL + 6.2, z0 + u + 0.8));
  for (const wz of [z0 + T / 2, z1 - T / 2]) for (let k = 0; k < 3; k++) { const u = 3 + (k + 0.5) * (L - 6) / 3; bag.add('glass_lamp', box(x0 + u - 0.8, FL + 2.6, wz - 0.03, x0 + u + 0.8, FL + 6.2, wz + 0.03)); }
  // the roof: a hipped roof of planks (iron-grey) with a wide eave, over the top
  pitched(bag, 'planks_grey', PL, [x0 - 0.2, z0 - 0.2, x1 + 0.2, z1 + 0.2], CT + 0.3, 0.75, 0.7, false, 0.14);
  // the east front's diamond points: pyramids 0.8 m across, pointing out, over the upper storey, leaving the window and door openings clear
  const D = 0.8, gx = x1;
  const clear = (u, v) => [[4.2, 0, 3.3, 3.3], [10.2, 2.6, 2.0, 3.6], [16.5, 2.6, 2.0, 3.6], [21.2, 2.6, 2.0, 3.6]].some(([cu, cv, w, h]) => Math.abs(u - cu) < w / 2 + 0.2 && v > cv - 0.1 && v < cv + h + 0.5);
  for (let u = D / 2; u < z1 - z0; u += D) for (let v = D / 2; v < H - 0.2; v += D) {
    if (clear(u, v)) continue;
    bag.add(WS, pyr(0, 0, D / 2, 0, 0, 0.32).rotateZ(-Math.PI / 2).translate(gx, FL + v, z0 + u));
  }
  // the cornice under the roof, a white band above the facets, and the corner strips
  bag.add(WS, box(x1 - 0.1, CT - 0.5, z0 - 0.1, x1 + 0.55, CT + 0.3, z1 + 0.1));
  for (const z of [z0 - 0.1, z1 - 0.1]) bag.add(WS, box(x1 - 0.1, FL, z, x1 + 0.35, CT - 0.5, z + 0.2));
  // the frames of the windows and the door on the east front: white stone, a pediment of carved stone over each
  for (const u of [10.2, 16.5, 21.2]) { bag.add(WS, box(gx, FL + 2.5, z0 + u - 1.05, gx + 0.2, FL + 5.9, z0 + u - 0.85)); bag.add(WS, box(gx, FL + 2.5, z0 + u + 0.85, gx + 0.2, FL + 5.9, z0 + u + 1.05)); bag.add(WS, box(gx, FL + 5.9, z0 + u - 1.15, gx + 0.3, FL + 6.2, z0 + u + 1.15)); bag.add(WS, box(gx, FL + 2.4, z0 + u - 1.15, gx + 0.3, FL + 2.55, z0 + u + 1.15)); }
  // the Red Porch: a covered stair of white stone rising north along the front to the door, its cheeks, its landing, its pent roof on posts
  const sx0 = x1 + 0.1, sx1 = x1 + 3.0, sz1 = z0 + 4.2 + 1.3 + 11.5, sz0 = z0 + 5.5;
  const ns = 22; for (let k = 0; k < ns; k++) { const za = sz1 - (k + 1) * (sz1 - sz0) / ns, zb = sz1 - k * (sz1 - sz0) / ns; bag.add(WS, box(sx0, y - 0.4, za, sx1, y + (k + 1) * 5.5 / ns, zb)); }
  col.ramp([sx0, sz0, sx1, sz1], y, FL, 'n');
  for (const [a, b] of [[sx0, sx0 + 0.3], [sx1 - 0.3, sx1]]) { bag.add(BR, hexa([[a, y - 0.4, sz1], [b, y - 0.4, sz1], [b, y - 0.4, sz0], [a, y - 0.4, sz0], [a, y + 0.3, sz1], [b, y + 0.3, sz1], [b, FL + 0.9, sz0], [a, FL + 0.9, sz0]])); col.rect([a, sz0, b, sz1], y - 0.4, FL + 0.9); }
  bag.add('flagstone', box(sx0, FL - 0.25, z0 + 1.0, sx1, FL, sz0)); col.floor([sx0, z0 + 1.0, sx1, sz0], FL);
  for (const [a, b] of [[sx0, sx0 + 0.3], [sx1 - 0.3, sx1]]) { bag.add(BR, box(a, FL, z0 + 1.0, b, FL + 0.9, sz0)); col.rect([a, z0 + 1.0, b, sz0], FL, FL + 0.9); }
  bag.add(BR, box(sx0, FL, z0 + 1.0, sx1, FL + 0.9, z0 + 1.3)); col.rect([sx0, z0 + 1.0, sx1, z0 + 1.3], FL, FL + 0.9);
  for (const [px, pz, ph] of [[sx1 - 0.35, z0 + 1.2, FL], [sx1 - 0.35, sz0 + 0.2, FL], [sx1 - 0.35, sz1 - 0.3, y]]) { bag.add(WS, lathe([[0.001, 0], [0.34, 0], [0.26, 0.2], [0.24, 3.2], [0.34, 3.4], [0.001, 3.4]], 8, null, px, ph + (ph === y ? 0.3 : 1.0), pz)); }
  const ry = FL + 5.6;
  bag.add('planks_grey', hexa([[sx0 - 0.3, FL + 4.4, z0 + 0.8], [sx1 + 0.2, FL + 4.4, z0 + 0.8], [sx1 + 0.2, y + 3.0, sz1 + 0.4], [sx0 - 0.3, y + 3.0, sz1 + 0.4], [sx0 - 0.3, FL + 4.55, z0 + 0.8], [sx1 + 0.2, FL + 4.55, z0 + 0.8], [sx1 + 0.2, y + 3.15, sz1 + 0.4], [sx0 - 0.3, y + 3.15, sz1 + 0.4]])); void ry;
  // ── inside the hall ─────────────────────────────────────────────────────────
  const ix0 = x0 + T, ix1 = x1 - T, iz0 = z0 + T, iz1 = z1 - T;
  // the walls painted: a dado of red hangings, a band of figures' ground, a gilt frieze under the vault
  for (const [rx0, rz0, rx1, rz1] of [[ix0, iz0, ix1, iz0 + 0.03], [ix0, iz1 - 0.03, ix1, iz1], [ix0, iz0, ix0 + 0.03, iz1], [ix1 - 0.03, iz0, ix1, iz1]]) {
    bag.add('cloth_red', box(rx0, FL, rz0, rx1, FL + 2.0, rz1)); bag.add('paint_ochre', box(rx0 - 0.0, FL + 2.0, rz0, rx1, FL + 2.12, rz1)); bag.add('paint_blue', box(rx0, FL + 7.4, rz0, rx1, FL + 7.7, rz1)); bag.add('mosaic_gold', box(rx0, FL + 7.7, rz0, rx1, FL + 7.78, rz1));
  }
  // the central pier: square, painted in bands with the ruling house's images, the vault ribs springing from its capital; the four cross-vault diagonals
  const pr = 1.15;
  bag.add(PL, box(mx - pr, FL, mz - pr, mx + pr, CT - 1.4, mz + pr)); col.rect([mx - pr, mz - pr, mx + pr, mz + pr], FL, CT);
  for (let v = 0; v < 4; v++) bag.add(['paint_blue', 'paint_ochre', 'paint_robe', 'fresco_green'][v], box(mx - pr - 0.02, FL + 0.5 + v * 1.55, mz - pr - 0.02, mx + pr + 0.02, FL + 1.6 + v * 1.55, mz + pr + 0.02));
  bag.add(WS, box(mx - pr - 0.25, CT - 1.8, mz - pr - 0.25, mx + pr + 0.25, CT - 1.2, mz + pr + 0.25));
  for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) bag.add(WS, rod([mx + sx * pr, CT - 1.2, mz + sz * pr], [mx + sx * (ix1 - mx - 0.05), CT, mz + sz * (iz1 - mz - 0.05)], 0.16, 5));
  for (const [sx, sz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) bag.add(WS, rod([mx + sx * pr, CT - 1.2, mz + sz * pr], [mx + sx * (ix1 - mx - 0.05), CT, mz + sz * (iz1 - mz - 0.05)], 0.12, 5));
  // benches of boards along the walls (covered in red cloth) except at the door
  for (const [rx0, rz0, rx1, rz1] of [[ix0 + 0.05, iz0 + 0.05, ix1 - 0.05, iz0 + 0.65], [ix0 + 0.05, iz1 - 0.65, ix1 - 0.05, iz1 - 0.05], [ix0 + 0.05, iz0 + 0.65, ix0 + 0.65, iz1 - 0.65]]) { bag.add('timber', box(rx0, FL, rz0, rx1, FL + 0.46, rz1)); bag.add('cloth_red', box(rx0, FL + 0.46, rz0, rx1, FL + 0.5, rz1)); col.rect([rx0, rz0, rx1, rz1], FL, FL + 0.5); }
  // the throne place against the west wall: a dais of three steps, the gilded seat with a high back and arms, a canopy on four posts
  const tx = ix0 + 0.8, tz = mz;
  for (let k = 0; k < 3; k++) { bag.add('timber', box(tx - 0.5 + k * 0.0 + 0, FL + k * 0.2, tz - 2.2 + k * 0.2, tx + 3.2 - k * 0.8, FL + (k + 1) * 0.2, tz + 2.2 - k * 0.2)); bag.add('cloth_red', box(tx - 0.5, FL + k * 0.2 + 0.19, tz - 2.2 + k * 0.2, tx + 3.2 - k * 0.8, FL + (k + 1) * 0.2, tz + 2.2 - k * 0.2)); }
  col.rect([tx - 0.5, tz - 2.2, tx + 3.2, tz + 2.2], FL, FL + 0.6);
  bag.add('gilt_bronze', box(tx + 0.0, FL + 0.6, tz - 0.55, tx + 0.8, FL + 1.1, tz + 0.55)); bag.add('gilt_bronze', box(tx + 0.0, FL + 1.1, tz - 0.55, tx + 0.1, FL + 2.4, tz + 0.55)); for (const s of [-1, 1]) bag.add('gilt_bronze', box(tx, FL + 1.1, tz + s * 0.52 - 0.05, tx + 0.8, FL + 1.6, tz + s * 0.52 + 0.05));
  bag.add('cloth_red', box(tx + 0.12, FL + 1.1, tz - 0.45, tx + 0.7, FL + 1.18, tz + 0.45));
  for (const s of [-1, 1]) for (const d of [0.1, 1.3]) bag.add('gilt_bronze', box(tx + d - 0.05, FL + 0.6, tz + s * 1.1 - 0.05, tx + d + 0.05, FL + 3.4, tz + s * 1.1 + 0.05));
  bag.add('cloth_red', box(tx + 0.05, FL + 3.4, tz - 1.2, tx + 1.4, FL + 3.55, tz + 1.2)); bag.add('gilt_bronze', box(tx + 0.0, FL + 3.55, tz - 1.25, tx + 1.45, FL + 3.65, tz + 1.25));
  // two hanging candle rings (horos), lit, and a long board on trestles with a cloth before the east side
  for (const [cx, cz] of [[(mx + ix1) / 2 + 0.5, mz - 5.5], [(mx + ix1) / 2 + 0.5, mz + 5.5]]) {
    bag.add('iron', rod([cx, CT, cz], [cx, FL + 4.4, cz], 0.012, 4));
    bag.add('gilt_bronze', lathe([[1.0, 0], [1.05, 0.06], [0.95, 0.06], [0.001, 0.03]], 18, null, cx, FL + 4.3, cz));
    for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; bag.add('linen', lathe([[0.001, 0], [0.025, 0], [0.025, 0.15], [0.001, 0.15]], 5, null, cx + Math.cos(a) * 0.98, FL + 4.36, cz + Math.sin(a) * 0.98)); bag.add('flame', lathe([[0.001, 0], [0.018, 0.02], [0.001, 0.07]], 5, null, cx + Math.cos(a) * 0.98, FL + 4.51, cz + Math.sin(a) * 0.98)); }
  }
  { const bx0 = mx + 2.2, bx1 = mx + 3.2; for (const [z0b, z1b] of [[iz0 + 2, mz - 2.5], [mz + 2.5, iz1 - 2]]) { bag.add('timber', box(bx0, FL + 0.8, z0b, bx1, FL + 0.86, z1b)); bag.add('linen', box(bx0 - 0.04, FL + 0.86, z0b - 0.04, bx1 + 0.04, FL + 0.9, z1b + 0.04)); for (const z of [z0b + 0.3, z1b - 0.3]) for (const x of [bx0 + 0.1, bx1 - 0.1]) bag.add('timber', box(x - 0.05, FL, z - 0.05, x + 0.05, FL + 0.8, z + 0.05)); col.rect([bx0, z0b, bx1, z1b], FL, FL + 0.9);
    for (let z = z0b + 0.8; z < z1b - 0.5; z += 1.4) { bag.add('silver', lathe([[0.001, 0], [0.15, 0], [0.18, 0.06], [0.001, 0.05]], 10, null, (bx0 + bx1) / 2, FL + 0.9, z)); bag.add('gilt_bronze', lathe([[0.001, 0], [0.07, 0], [0.09, 0.22], [0.001, 0.22]], 8, null, (bx0 + bx1) / 2 + 0.25, FL + 0.9, z + 0.3)); } } }
  void rand;
}
