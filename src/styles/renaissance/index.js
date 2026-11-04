// Florentine Gothic and early Renaissance (14th–15th c.; docs/settlements/florence.md §4): the
// cathedral of white, green and pink marble — the nave, the three apses round the octagonal crossing,
// the drum and Brunelleschi's ribbed dome of red tile with its marble lantern; the campanile; the
// octagonal Baptistery; the Palazzo della Signoria's rusticated block, gallery and tower; palaces
// with cornices; tiled roofs; houses of plaster and stone.

import { registerStyle, STYLES, orientedBox } from '../../core/build.js';
import { box, frustum, lathe } from '../../core/geom.js';
import '../qing/index.js';

const M = 'marble', G = 'verde_antico', R = 'roof_tile', ST = 'limestone_yellow';
const oct = (bag, mat, cx, y, cz, r, h) => bag.add(mat, lathe([[r, 0], [r, h], [0.001, h]], 8, null, cx, y, cz));

/**
 * The Florentine marble skin on a wall from a to b (outward normal to the right of a→b): green
 * pilaster strips, green bands at the storeys, white fields framed in green with pink inner panels,
 * tall pointed windows with white mullions in some bays — the cathedral's, campanile's and
 * Baptistery's manner.
 */
function inlay(bag, a, b, y0, y1, { pitch = 4.2, bands = 3, windows = 0, pink = true } = {}) {
  const dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz), ux = dx / L, uz = dz / L, nx = uz, nz = -ux;
  const at = (u, d) => [a[0] + ux * u + nx * d, a[1] + uz * u + nz * d];
  const strip = (mat, u0, u1, v0, v1, d) => bag.add(mat, orientedBox(at(u0, d), at(u1, d), 0.05, v0, v1));
  const n = Math.max(1, Math.round(L / pitch)), p = L / n, h = (y1 - y0) / bands;
  for (let i = 0; i <= n; i++) strip(G, i * p - 0.3, i * p + 0.3, y0, y1, 0.04);
  for (let k = 0; k <= bands; k++) strip(G, 0, L, y0 + k * h - 0.25, y0 + k * h + 0.25, 0.05);
  for (let i = 0; i < n; i++) for (let k = 0; k < bands; k++) {
    const u0 = i * p + 0.3, u1 = (i + 1) * p - 0.3, v0 = y0 + k * h + 0.25, v1 = y0 + (k + 1) * h - 0.25, m = 0.35;
    const win = windows && k === bands - 2 + (bands > 2 ? 0 : 1) && i % windows === 1 % windows;
    if (win) {
      const c = (u0 + u1) / 2, w = Math.min(1.6, (u1 - u0) * 0.4), wh = (v1 - v0) * 0.85;
      strip(M, c - w / 2 - 0.3, c + w / 2 + 0.3, v0 + 0.2, v0 + wh + 0.5, 0.06);
      strip('stained_glass', c - w / 2, c + w / 2, v0 + 0.4, v0 + wh, 0.08);
      strip(M, c - 0.06, c + 0.06, v0 + 0.4, v0 + wh, 0.1);
      strip(G, c - w / 2 - 0.35, c + w / 2 + 0.35, v0 + wh + 0.2, v0 + wh + 0.45, 0.09);
      continue;
    }
    // a green frame and, inside, a pink (or green) panel
    strip(G, u0 + m, u1 - m, v0 + m, v0 + m + 0.12, 0.06); strip(G, u0 + m, u1 - m, v1 - m - 0.12, v1 - m, 0.06);
    strip(G, u0 + m, u0 + m + 0.12, v0 + m, v1 - m, 0.06); strip(G, u1 - m - 0.12, u1 - m, v0 + m, v1 - m, 0.06);
    if (pink && (u1 - u0) > 2) strip((i + k) % 2 ? 'marble_pink' : G, u0 + m + 0.6, u1 - m - 0.6, v0 + m + 0.6, v1 - m - 0.6, 0.055);
  }
}
/** duomo: { c (the crossing), nave (length west), w, h (nave), d (dome diameter), y } — the church faces west. */
function duomo(el, { bag, col }) {
  const [cx, cz] = el.c, L = el.nave ?? 90, W = el.w ?? 40, H = el.h ?? 40, D = el.d ?? 45, y = el.y ?? 0, R0 = D / 2;
  const nave = [cx - L - R0, cz - W / 2, cx - R0, cz + W / 2];
  bag.add(M, box(nave[0], y - 0.5, nave[1], nave[2], y + H * 0.7, nave[3])); col.rect(nave, y, y + H * 0.7);
  bag.add(M, box(nave[0], y + H * 0.7, cz - W * 0.25, nave[2], y + H, cz + W * 0.25));
  bag.add(R, frustum([nave[0], cz - W * 0.27, nave[2], cz + W * 0.27], y + H, y + H + W * 0.15, 0, 0, W * 0.26, W * 0.26));
  for (const s of [-1, 1]) bag.add(R, frustum([nave[0], s < 0 ? nave[1] : cz + W * 0.25, nave[2], s < 0 ? cz - W * 0.25 : nave[3]], y + H * 0.7, y + H * 0.76, 0, 0, s < 0 ? 0 : W * 0.24, s < 0 ? W * 0.24 : 0));
  // the green and white panels: bands on the walls
  // the marble skin of the aisles' walls (north and south), with the tall windows of the bays
  inlay(bag, [nave[0], nave[1]], [nave[2], nave[1]], y, y + H * 0.7, { pitch: 4.4, bands: 3, windows: 2 });
  inlay(bag, [nave[2], nave[3]], [nave[0], nave[3]], y, y + H * 0.7, { pitch: 4.4, bands: 3, windows: 2 });
  inlay(bag, [nave[0], cz - W * 0.25], [nave[2], cz - W * 0.25], y + H * 0.7 + 0.3, y + H, { pitch: 4.4, bands: 1, pink: false });
  inlay(bag, [nave[2], cz + W * 0.25], [nave[0], cz + W * 0.25], y + H * 0.7 + 0.3, y + H, { pitch: 4.4, bands: 1, pink: false });
  // the west front
  bag.add('rubble', box(nave[0] - 1.5, y - 0.5, nave[1], nave[0], y + H * 1.05, nave[3]));
  // the front as it stood in 1480: Arnolfo's lower third in marble with its three portals and niches, the rough wall above
  bag.add(M, box(nave[0] - 1.9, y - 0.5, nave[1] - 0.4, nave[0] - 1.45, y + H * 0.38, nave[3] + 0.4));
  inlay(bag, [nave[0] - 1.9, nave[3] + 0.4], [nave[0] - 1.9, nave[1] - 0.4], y, y + H * 0.38, { pitch: 4.6, bands: 2, pink: true });
  for (const [k, w] of [[-W * 0.3, 3.2], [0, 4.6], [W * 0.3, 3.2]]) {
    bag.add(M, box(nave[0] - 2.7, y - 0.3, cz + k - w / 2 - 0.9, nave[0] - 1.8, y + w * 2.4 + 1.2, cz + k + w / 2 + 0.9));
    bag.add('opening', box(nave[0] - 2.75, y, cz + k - w / 2, nave[0] - 2.65, y + w * 2.1, cz + k + w / 2));
    bag.add(G, box(nave[0] - 2.8, y + w * 2.1 + 0.2, cz + k - w / 2 - 0.6, nave[0] - 2.65, y + w * 2.1 + 0.6, cz + k + w / 2 + 0.6));
  }
  for (let i = 0; i < 6; i++) { const zz = cz - W * 0.45 + i * W * 0.18; if (Math.abs(zz - cz) < 4 || Math.abs(Math.abs(zz - cz) - W * 0.3) < 2.6) continue; bag.add(M, box(nave[0] - 2.4, y + H * 0.2, zz - 0.9, nave[0] - 1.85, y + H * 0.33, zz + 0.9)); bag.add('opening', box(nave[0] - 2.45, y + H * 0.21, zz - 0.6, nave[0] - 2.38, y + H * 0.32, zz + 0.6)); bag.add('marble', lathe([[0.35, 0], [0.3, 1.4], [0.18, 1.6], [0.001, 1.9]], 8, null, nave[0] - 2.1, y + H * 0.21, zz)); }
  bag.add('stained_glass', box(nave[0] - 1.6, y + H * 0.66, cz - 3.5, nave[0] - 1.5, y + H * 0.86, cz + 3.5));   // the west rose
  // the crossing: the octagon and three apses with their small domes
  oct(bag, M, cx, y - 0.5, cz, R0 + 2, H + 0.5); col.circle(cx, cz, R0 + 2, y, y + H);
  const octInlay = (ox, oz, r, y0, y1, o) => { for (let k = 0; k < 8; k++) { const a0 = k / 8 * Math.PI * 2, a1 = (k + 1) / 8 * Math.PI * 2; inlay(bag, [ox + Math.cos(a0) * r * 0.99, oz + Math.sin(a0) * r * 0.99], [ox + Math.cos(a1) * r * 0.99, oz + Math.sin(a1) * r * 0.99], y0, y1, o); } };
  for (const [ax, az] of [[cx + R0 + 9, cz], [cx, cz - R0 - 9], [cx, cz + R0 + 9]]) octInlay(ax, az, 11, y, y + H * 0.75, { pitch: 4, bands: 3, windows: 2 });
  octInlay(cx, cz, R0 + 1.5, y + H, y + H + 13, { pitch: 6, bands: 1, pink: false });
  for (const [ax, az] of [[cx + R0 + 9, cz], [cx, cz - R0 - 9], [cx, cz + R0 + 9]]) { oct(bag, M, ax, y - 0.5, az, 11, H * 0.75); bag.add(R, lathe([[11.5, 0], [6, 4], [0.001, 6]], 8, null, ax, y + H * 0.75, az)); col.circle(ax, az, 11, y, y + H * 0.75); }
  // the drum with its round windows, the dome in eight ribbed sails, the lantern
  const dy = y + H + 4;
  oct(bag, M, cx, y + H, cz, R0 + 1.5, 13);
  for (let k = 0; k < 8; k++) { const a = (k + 0.5) / 8 * Math.PI * 2; bag.add('opening', box(cx + Math.cos(a) * (R0 + 1.55) - 1.5, dy + 3, cz + Math.sin(a) * (R0 + 1.55) - 1.5, cx + Math.cos(a) * (R0 + 1.55) + 1.5, dy + 6, cz + Math.sin(a) * (R0 + 1.55) + 1.5)); }
  const dome = [[R0 + 1, 0], [R0 + 0.6, R0 * 0.35], [R0 * 0.92, R0 * 0.62], [R0 * 0.72, R0 * 0.88], [R0 * 0.42, R0 * 1.08], [R0 * 0.16, R0 * 1.18]];
  bag.add(R, lathe(dome, 8, null, cx, y + H + 13, cz));
  for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; for (let i = 0; i + 1 < dome.length; i++) { const [r0, h0] = dome[i], [r1, h1] = dome[i + 1]; const g = box(-0.7, 0, -0.7, 0.7, Math.hypot(r1 - r0, h1 - h0) + 0.3, 0.7); g.rotateZ(Math.atan2(r0 - r1, h1 - h0)); g.translate(r0 + 0.2, h0, 0); g.rotateY(-a); g.translate(cx, y + H + 13, cz); bag.add(M, g); } }
  const ly = y + H + 13 + R0 * 1.18;
  oct(bag, M, cx, ly, cz, R0 * 0.18, 9); bag.add(M, lathe([[R0 * 0.2, 0], [0.4, 7], [0.001, 8]], 8, null, cx, ly + 9, cz));
  bag.add('gilt_bronze', lathe([[0.9, 0], [0.9, 0.3], [0.001, 1.8]], 12, null, cx, ly + 17, cz));
}
/** campanile: { c, s (side), h, y } — a square tower in white, green and pink marble, with its storeys of windows and cornice. */
function campanile(el, { bag, col }) {
  const [x, z] = el.c, s = el.s ?? 14.5, h = el.h ?? 84, y = el.y ?? 0, r = [x - s / 2, z - s / 2, x + s / 2, z + s / 2];
  bag.add(M, box(r[0], y - 0.5, r[1], r[2], y + h, r[3])); col.rect(r, y, y + h);
  // the marble skin storey by storey: the lower two in panels, the upper with their pointed windows
  const faces = [[[r[0], r[1]], [r[2], r[1]]], [[r[2], r[1]], [r[2], r[3]]], [[r[2], r[3]], [r[0], r[3]]], [[r[0], r[3]], [r[0], r[1]]]];
  for (const [a, b] of faces) { inlay(bag, a, b, y, y + h * 0.47, { pitch: s / 3, bands: 4 }); inlay(bag, a, b, y + h * 0.47, y + h, { pitch: s, bands: 3, pink: false }); }
  for (const [x0, x1, z0, z1] of [[r[0] - 0.4, r[0] + 0.6, r[1] - 0.4, r[1] + 0.6], [r[2] - 0.6, r[2] + 0.4, r[1] - 0.4, r[1] + 0.6], [r[0] - 0.4, r[0] + 0.6, r[3] - 0.6, r[3] + 0.4], [r[2] - 0.6, r[2] + 0.4, r[3] - 0.6, r[3] + 0.4]]) bag.add(M, box(x0, y, z0, x1, y + h, z1));
  for (const f of 'nsew') for (const [yy, hh] of [[h * 0.52, 7], [h * 0.68, 8], [h * 0.84, 10]]) { const m = f === 'n' || f === 's' ? x : z; const q = f === 'n' ? [m - 2, r[1] - 0.06, m + 2, r[1] + 0.02] : f === 's' ? [m - 2, r[3] - 0.02, m + 2, r[3] + 0.06] : f === 'w' ? [r[0] - 0.06, m - 2, r[0] + 0.02, m + 2] : [r[2] - 0.02, m - 2, r[2] + 0.06, m + 2]; bag.add('opening', box(q[0], y + yy, q[1], q[2], y + yy + hh, q[3])); }
  bag.add(M, box(r[0] - 1, y + h, r[1] - 1, r[2] + 1, y + h + 1.2, r[3] + 1));
}
/** baptistery: { c, r, h, y } — the octagon in white and green marble, its pyramidal roof and lantern. */
function baptistery(el, { bag, col }) {
  const [x, z] = el.c, r = el.r ?? 13.5, h = el.h ?? 26, y = el.y ?? 0;
  oct(bag, M, x, y - 0.5, z, r, h + 0.5); col.circle(x, z, r, y, y + h);
  for (let k = 0; k < 8; k++) { const a0 = k / 8 * Math.PI * 2, a1 = (k + 1) / 8 * Math.PI * 2; inlay(bag, [x + Math.cos(a0) * r, z + Math.sin(a0) * r], [x + Math.cos(a1) * r, z + Math.sin(a1) * r], y, y + h * 0.78, { pitch: r * 0.765 / 3, bands: 2, windows: 3 }); inlay(bag, [x + Math.cos(a0) * r, z + Math.sin(a0) * r], [x + Math.cos(a1) * r, z + Math.sin(a1) * r], y + h * 0.78, y + h, { pitch: r * 0.765, bands: 1, pink: false }); }
  bag.add(M, lathe([[r, 0], [r * 0.25, r * 0.55], [0.001, r * 0.55]], 8, null, x, y + h, z));
  oct(bag, M, x, y + h + r * 0.55, z, r * 0.2, 4);
}
/** palazzo: { rect, h, tower: { c, s, h }, y } — the rusticated block with its crenellated gallery and tower. */
function palazzo(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, h = el.h ?? 30, y = el.y ?? 0;
  bag.add('rubble', box(x0, y - 0.5, z0, x1, y + h, z1)); col.rect(el.rect, y, y + h); col.floor(el.rect, y + h);
  bag.add('rubble', box(x0 - 1.2, y + h, z0 - 1.2, x1 + 1.2, y + h + 2.5, z1 + 1.2));
  for (let x = x0 - 1; x < x1 + 1; x += 2.4) for (const zz of [z0 - 1.2, z1 + 0.6]) bag.add('rubble', box(x, y + h + 2.5, zz, x + 1.2, y + h + 3.8, zz + 0.6));
  for (const f of 'nsew') { const along = f === 'n' || f === 's', L = along ? x1 - x0 : z1 - z0, n = Math.floor(L / 5); for (let i = 0; i < n; i++) for (const yy of [y + 10, y + 19]) { const u = (along ? x0 : z0) + (i + 0.5) * L / n; const q = f === 'n' ? [u - 0.9, z0 - 0.06, u + 0.9, z0 + 0.02] : f === 's' ? [u - 0.9, z1 - 0.02, u + 0.9, z1 + 0.06] : f === 'w' ? [x0 - 0.06, u - 0.9, x0 + 0.02, u + 0.9] : [x1 - 0.02, u - 0.9, x1 + 0.06, u + 0.9]; bag.add('opening', box(q[0], yy, q[1], q[2], yy + 3, q[3])); } }
  if (el.tower) { const [tx, tz] = el.tower.c, s = el.tower.s ?? 7, th = el.tower.h ?? 94; bag.add('rubble', box(tx - s / 2, y + h, tz - s / 2, tx + s / 2, y + th - 12, tz + s / 2)); bag.add('rubble', box(tx - s / 2 - 1, y + th - 14, tz - s / 2 - 1, tx + s / 2 + 1, y + th - 10, tz + s / 2 + 1)); for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) bag.add('rubble', box(tx + dx * s * 0.4 - 0.4, y + th - 10, tz + dz * s * 0.4 - 0.4, tx + dx * s * 0.4 + 0.4, y + th - 4, tz + dz * s * 0.4 + 0.4)); bag.add(R, frustum([tx - s / 2 - 0.5, tz - s / 2 - 0.5, tx + s / 2 + 0.5, tz + s / 2 + 0.5], y + th - 4, y + th, s / 2, s / 2, s / 2, s / 2)); }
}
/** loggia: an open arcade { rect, h, y, n }. */
function loggia(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, h = el.h ?? 12, y = el.y ?? 0, n = el.n ?? 3;
  for (let i = 0; i <= n; i++) for (const z of [z0, z1]) { const x = x0 + (x1 - x0) * i / n; bag.add(ST, box(x - 0.8, y, z - 0.8, x + 0.8, y + h, z + 0.8)); col.rect([x - 0.8, z - 0.8, x + 0.8, z + 0.8], y, y + h); }
  bag.add(ST, box(x0 - 1, y + h, z0 - 1, x1 + 1, y + h + 2.5, z1 + 1)); bag.add(R, box(x0 - 1.2, y + h + 2.5, z0 - 1.2, x1 + 1.2, y + h + 3, z1 + 1.2));
  bag.add('flagstone', box(x0, y - 0.3, z0, x1, y + 0.6, z1)); col.floor([x0, z0, x1, z1], y + 0.6);
}
registerStyle('renaissance', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.qing.elements, duomo, campanile, baptistery, palazzo, loggia },
  objects: {},
});
