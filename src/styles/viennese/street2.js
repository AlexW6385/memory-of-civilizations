// More of the street and the gardens (docs/settlements/vienna.md §12): the overhead wires and poles of the electric tram, manhole
// covers and street hydrants, the chestnut roaster's booth, the Fiaker rank's trough, flower beds and clipped hedges in the Karlsplatz
// and behind the Secession, the Ressel monument, the Naschmarkt's fountain and its Marktamt, and a Stadtbahn train on its ledge.
import { box, lathe, rod } from '../../core/geom.js';
import { rng } from './detail.js';

/** tram_wire: { z, x0, x1, tracks, y } — poles on both kerbs every 36 m with a span wire over the road, the two contact wires along the tracks. */
export function tramWire(el, { bag, col }) {
  const y = el.y ?? 0, [z0, z1] = el.poles ?? [el.z - 22, el.z + 22], HW = 5.7;
  for (let x = el.x0 + 20; x < el.x1 - 10; x += 36) {
    for (const z of [z0, z1]) { bag.add('iron', lathe([[0.001, 0], [0.22, 0], [0.18, 0.4], [0.12, 0.9], [0.1, 6.4], [0.07, 6.7], [0.001, 6.8]], 8, null, x, y, z)); bag.add('iron', lathe([[0.15, 0.9], [0.17, 1.0], [0.15, 1.1]], 8, null, x, y, z)); col.circle(x, z, 0.2, y, y + 6.8); }
    bag.add('iron', box(x - 0.012, y + HW + 0.6, z0, x + 0.012, y + HW + 0.63, z1));
    for (const zr of el.tracks) { bag.add('iron', rod([x, y + HW + 0.6, zr], [x, y + HW - 0.05, zr], 0.012, 3)); }
  }
  for (const zr of el.tracks) bag.add('iron', box(el.x0, y + HW - 0.06, zr - 0.012, el.x1, y + HW - 0.03, zr + 0.012));
}
/** manholes: { pts: [[x, z]…], y } — iron covers flush with the setts (a ring, a lid with its grid of ribs). */
export function manholes(el, { bag }) {
  const y = el.y ?? 0;
  el.pts.forEach(([x, z], i) => { const r = i % 3 === 0 ? 0.42 : 0.33; bag.add('iron', lathe([[0.001, 0.215], [r, 0.215], [r + 0.04, 0.2], [r + 0.04, 0.1], [0.001, 0.1]], 12, null, x, y - 0.203, z)); });
}
/** hydrant: { at, y } — a street hydrant (a cast-iron post with its cap and its two outlets). */
export function hydrant(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0;
  bag.add('iron', lathe([[0.001, 0], [0.17, 0], [0.15, 0.1], [0.1, 0.2], [0.09, 0.8], [0.13, 0.85], [0.13, 0.95], [0.08, 1.0], [0.001, 1.02]], 8, null, x, y, z));
  bag.add('iron', rod([x - 0.2, y + 0.6, z], [x + 0.2, y + 0.6, z], 0.05, 6)); bag.add('gilt_bronze', lathe([[0.001, 0.0], [0.06, 0.0], [0.06, 0.05], [0.001, 0.05]], 6, null, x + 0.2, y + 0.575, z));
  col.circle(x, z, 0.18, y, y + 1.0);
}
/** maroni: { at, y, rot } — the chestnut roaster's booth: a little wooden hut with a striped awning, a brazier on the counter, a pile of paper cones. */
export function maroni(el, { bag, col }) {
  const [cx, cz] = el.at, y = el.y ?? 0, rot = el.rot ?? 0, c = Math.cos(rot), s = Math.sin(rot);
  const P = (p, q) => [cx + p * c + q * s, cz - p * s + q * c];
  const bx = (m, p0, q0, p1, q1, v0, v1) => { const a = P(p0, q0), b = P(p1, q1); bag.add(m, box(Math.min(a[0], b[0]), y + v0, Math.min(a[1], b[1]), Math.max(a[0], b[0]), y + v1, Math.max(a[1], b[1]))); };
  bx('wood_painted', -0.9, -0.7, 0.9, 0.7, 0.0, 1.0); bx('wood_dark', -1.0, -0.8, 1.0, 0.8, 1.0, 1.06);
  for (const sx of [-0.9, 0.9]) for (const sz of [-0.7, 0.7]) bx('wood_dark', sx - 0.04, sz - 0.04, sx + 0.04, sz + 0.04, 1.06, 2.4);
  for (let k = 0; k < 10; k++) bx(k % 2 ? 'cloth_white' : 'cloth_red', -1.1 + k * 0.22, -0.95, -0.88 + k * 0.22, 0.95, 2.38, 2.5);
  bx('cloth_red', -1.1, 0.9, 1.1, 0.96, 2.1, 2.4);
  const bp = P(0.2, 0.0); bag.add('iron', lathe([[0.001, 0], [0.3, 0], [0.34, 0.15], [0.3, 0.2], [0.001, 0.2]], 10, null, bp[0], y + 1.06, bp[1])); bag.add('flame', lathe([[0.001, 0], [0.18, 0.03], [0.12, 0.12], [0.001, 0.2]], 8, null, bp[0], y + 1.2, bp[1]));
  bx('paint_white', -0.7, 0.2, -0.4, 0.5, 1.06, 1.25); bx('terracotta', -0.2, -0.6, 0.05, -0.4, 1.06, 1.1);
  const a = P(-0.9, -0.7), b = P(0.9, 0.7); col.rect([Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])], y, y + 2.4);
}
/** trough: { at, y, rot } — a granite water trough for the cab horses. */
export function trough(el, { bag, col }) {
  const [cx, cz] = el.at, y = el.y ?? 0, rot = el.rot ?? 0, c = Math.cos(rot), s = Math.sin(rot);
  const P = (p, q) => [cx + p * c + q * s, cz - p * s + q * c], a = P(-1.2, -0.4), b = P(1.2, 0.4), x0 = Math.min(a[0], b[0]), x1 = Math.max(a[0], b[0]), z0 = Math.min(a[1], b[1]), z1 = Math.max(a[1], b[1]);
  bag.add('granite_grey', box(x0, y, z0, x1, y + 0.8, z1)); bag.add('water', box(x0 + 0.1, y + 0.7, z0 + 0.1, x1 - 0.1, y + 0.74, z1 - 0.1));
  col.rect([x0, z0, x1, z1], y, y + 0.8);
}
/** flowerbed: { rect, y, seed } — a bed edged in stone with rows of spring flowers (tulips, hyacinths, pansies) in blocks of colour. */
export function flowerbed(el, { bag }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, r = rng(el.seed || 1);
  bag.add('ground', box(x0, y, z0, x1, y + 0.1, z1));
  bag.add('granite_grey', box(x0 - 0.1, y, z0 - 0.1, x1 + 0.1, y + 0.2, z0)); bag.add('granite_grey', box(x0 - 0.1, y, z1, x1 + 0.1, y + 0.2, z1 + 0.1)); bag.add('granite_grey', box(x0 - 0.1, y, z0, x0, y + 0.2, z1)); bag.add('granite_grey', box(x1, y, z0, x1 + 0.1, y + 0.2, z1));
  const pal = ['cloth_red', 'paint_ochre', 'paint_white', 'cloth_maroon', 'cloth_blue', 'cloth_red', 'paint_ochre'];
  const nx = Math.max(1, Math.round((x1 - x0) / 0.9)), nz = Math.max(1, Math.round((z1 - z0) / 0.9));
  for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) {
    const m = pal[Math.floor(r() * pal.length)], a0 = x0 + 0.08 + i * (x1 - x0) / nx, b0 = z0 + 0.08 + j * (z1 - z0) / nz, a1 = x0 + (i + 1) * (x1 - x0) / nx - 0.08, b1 = z0 + (j + 1) * (z1 - z0) / nz - 0.08;
    bag.add('cloth_green', box(a0, y + 0.1, b0, a1, y + 0.3 + r() * 0.08, b1));
    for (let q = 0; q < 6; q++) { const u = a0 + 0.1 + r() * Math.max(0.05, a1 - a0 - 0.2), v = b0 + 0.1 + r() * Math.max(0.05, b1 - b0 - 0.2), h = 0.43 + r() * 0.15; bag.add(m, box(u - 0.05, y + 0.28, v - 0.05, u + 0.05, y + h, v + 0.05)); }
  }
}
/** hedge: { rect, y, h } — a clipped hedge. */
export function hedge(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, h = el.h ?? 0.9;
  bag.add('cloth_green', box(x0, y, z0, x1, y + h, z1)); bag.add('cloth_green', box(x0 + 0.06, y + h, z0 + 0.06, x1 - 0.06, y + h + 0.06, z1 - 0.06));
  col.rect(el.rect, y, y + h);
}
/** monument: { at, y, who } — a granite plinth in steps with a bronze figure on it (Ressel, with his screw propeller). */
export function monument(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0;
  bag.add('granite_grey', box(x - 2.0, y, z - 2.0, x + 2.0, y + 0.25, z + 2.0)); bag.add('granite_grey', box(x - 1.5, y + 0.25, z - 1.5, x + 1.5, y + 0.5, z + 1.5)); bag.add('granite_grey', box(x - 1.0, y + 0.5, z - 1.0, x + 1.0, y + 3.0, z + 1.0)); bag.add('sandstone_white', box(x - 1.15, y + 3.0, z - 1.15, x + 1.15, y + 3.25, z + 1.15));
  bag.add('bronze', lathe([[0.001, 3.25], [0.4, 3.25], [0.32, 3.4], [0.34, 4.4], [0.3, 4.9], [0.14, 5.0], [0.2, 5.15], [0.18, 5.4], [0.001, 5.5]], 10, null, x, y, z));
  bag.add('bronze', box(x + 0.25, y + 4.2, z - 0.05, x + 0.9, y + 4.35, z + 0.05));
  bag.add('gold', box(x - 0.6, y + 1.4, z - 1.03, x + 0.6, y + 2.2, z - 1.0));
  col.rect([x - 2.0, z - 2.0, x + 2.0, z + 2.0], y, y + 3.4);
}
/** fountain: { at, y } — a drinking fountain of the market: a stone basin and column with iron spouts. */
export function fountain(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0;
  bag.add('granite_grey', lathe([[0.001, 0], [1.3, 0], [1.3, 0.55], [1.15, 0.6], [1.15, 0.5], [0.001, 0.5]], 16, null, x, y, z)); bag.add('water', lathe([[0.001, 0.46], [1.1, 0.46], [1.1, 0.5], [0.001, 0.5]], 16, null, x, y, z));
  bag.add('granite_grey', lathe([[0.4, 0.5], [0.3, 0.7], [0.25, 1.6], [0.35, 1.7], [0.2, 1.9], [0.001, 1.95]], 12, null, x, y, z)); bag.add('iron', lathe([[0.001, 1.95], [0.05, 1.95], [0.05, 2.3], [0.001, 2.35]], 6, null, x, y, z));
  for (let k = 0; k < 4; k++) { const a = k * 1.571; bag.add('iron', rod([x + Math.cos(a) * 0.25, y + 1.2, z + Math.sin(a) * 0.25], [x + Math.cos(a) * 0.55, y + 1.1, z + Math.sin(a) * 0.55], 0.03, 5)); }
  col.circle(x, z, 1.32, y, y + 0.6); col.circle(x, z, 0.4, y, y + 2.3);
}
/** marktamt: { rect, y, front } — the market office: a small plastered hut with a tiled roof, a window to the aisle and a notice board. */
export function marktamt(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, front = el.front ?? 'n';
  bag.add('stucco_cream', box(x0, y, z0, x1, y + 3.0, z1)); col.rect(el.rect, y, y + 3.0);
  bag.add('roof_tile', box(x0 - 0.3, y + 3.0, z0 - 0.3, x1 + 0.3, y + 3.15, z1 + 0.3));
  const xm = (x0 + x1) / 2, zf = front === 'n' ? z0 : z1, sg = front === 'n' ? -1 : 1;
  bag.add('wood_dark', box(xm - 0.5, y, zf + (sg > 0 ? 0 : -0.1), xm + 0.5, y + 2.1, zf + (sg > 0 ? 0.1 : 0)));
  bag.add('opening', box(x0 + 0.5, y + 1.1, zf + (sg > 0 ? 0.0 : -0.04), x0 + 1.7, y + 2.0, zf + (sg > 0 ? 0.04 : 0.0)));
  bag.add('paint_white', box(x1 - 1.8, y + 1.2, zf + (sg > 0 ? 0.0 : -0.05), x1 - 0.6, y + 2.2, zf + (sg > 0 ? 0.05 : 0.0)));
  bag.add('glaze_green', box(x0 + (x1 - x0) / 2 - 0.9, y + 2.4, zf + (sg > 0 ? 0.0 : -0.08), x0 + (x1 - x0) / 2 + 0.9, y + 2.8, zf + (sg > 0 ? 0.08 : 0.0)));
}
/** stadtbahn_train: { x0, z, y, dir, cars } — a steam tank locomotive and its four-wheeled coaches standing on a track (x0 the buffer end, running dir). */
export function stadtbahnTrain(el, { bag, col }) {
  const y = el.y ?? 0, z = el.z, dir = el.dir ?? 1, X = (p) => el.x0 + dir * p, cars = el.cars ?? 4;
  const bx = (m, p0, q0, p1, q1, v0, v1) => bag.add(m, box(Math.min(X(p0), X(p1)), y + v0, z + q0, Math.max(X(p0), X(p1)), y + v1, z + q1));
  // the locomotive: boiler, smokebox, chimney, dome, cab, side tanks, wheels
  bx('lacquer_black', 0.0, -1.3, 2.2, 1.3, 0.55, 0.9);
  bag.add('lacquer_black', lathe([[0.001, 0], [0.9, 0], [0.9, 5.4], [0.001, 5.4]], 14, null, 0, 0, 0).rotateZ(Math.PI / 2).translate(X(1.1) + dir * 2.7, y + 2.1, z));
  bx('lacquer_black', 0.4, -1.35, 5.8, -0.55, 0.95, 1.9); bx('lacquer_black', 0.4, 0.55, 5.8, 1.35, 0.95, 1.9);
  bag.add('lacquer_black', lathe([[0.001, 0], [0.3, 0], [0.22, 1.2], [0.4, 1.35], [0.001, 1.4]], 10, null, X(1.1), y + 2.8, z));
  bag.add('gilt_bronze', lathe([[0.001, 0], [0.28, 0], [0.2, 0.4], [0.001, 0.5]], 10, null, X(3.6), y + 3.0, z)); bx('lacquer_black', 5.7, -1.5, 7.9, 1.5, 0.95, 3.7); bx('lacquer_black', 5.6, -1.6, 8.0, 1.6, 3.7, 3.85);
  bx('opening', 6.2, -1.52, 7.4, -1.5, 2.0, 3.2); bx('opening', 6.2, 1.5, 7.4, 1.52, 2.0, 3.2);
  bx('cloth_red', 0.0, -1.3, 8.0, 1.3, 0.55, 0.75);
  for (const p of [1.4, 3.0, 4.6, 6.6]) for (const s of [-1, 1]) bag.add('iron', lathe([[0.001, -0.06], [0.55, -0.06], [0.55, 0.06], [0.001, 0.06]], 14, null, 0, 0, 0).rotateX(Math.PI / 2).translate(X(p), y + 0.58, z + s * 0.78));
  // the coaches: green lower panels, cream upper, a clerestory roof, windows, doors, buffers
  for (let k = 0; k < cars; k++) {
    const a = 8.6 + k * 9.0, b = a + 8.4;
    bx('wood_dark', a, -1.3, b, 1.3, 0.55, 0.85); bx('shutter_green', a, -1.4, b, 1.4, 0.85, 1.95); bx('paint_white', a, -1.42, b, 1.42, 1.95, 3.35); bx('opening', a + 0.4, -1.43, b - 0.4, 1.43, 2.2, 3.05);
    for (let q = 0; q <= 8; q++) { const p = a + 0.4 + q * (b - a - 0.8) / 8; bx('paint_white', p - 0.05, -1.45, p + 0.05, 1.45, 2.2, 3.05); }
    bx('paint_white', a + 0.1, -1.1, b - 0.1, 1.1, 3.35, 3.55); bx('lead', a + 0.2, -0.7, b - 0.2, 0.7, 3.55, 3.7);
    for (const p of [a + 1.2, b - 1.2]) for (const s of [-1, 1]) bag.add('iron', lathe([[0.001, -0.05], [0.48, -0.05], [0.48, 0.05], [0.001, 0.05]], 12, null, 0, 0, 0).rotateX(Math.PI / 2).translate(X(p), y + 0.52, z + s * 0.78));
    bx('iron', a - 0.25, -0.8, a, -0.5, 0.7, 0.8); bx('iron', a - 0.25, 0.5, a, 0.8, 0.7, 0.8);
  }
  const e = X(8.6 + cars * 9.0), s0 = Math.min(X(0), e), s1 = Math.max(X(0), e);
  col.rect([s0, z - 1.6, s1, z + 1.6], y, y + 3.9);
}
