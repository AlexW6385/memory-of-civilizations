// Ottoman architecture of Sinan (16th c.; docs/settlements/ottoman-istanbul.md §4): the mosque's
// central dome on a square of piers, buttressed by semidomes before and behind and cascading small
// domes, all in lead over cut stone; the arcaded courtyard of domed bays with its fountain; pencil
// minarets with balconies and lead cones; madrasas of domed cells round courts; the city's timber
// houses (src/styles/vernacular's jettied tiled house).

import { registerStyle, STYLES } from '../../core/build.js';
import { box, lathe } from '../../core/geom.js';
import '../qing/index.js';

const S = 'limestone', L = 'lead';
const dome = (bag, x, y, z, r, mat = L) => {
  bag.add(S, lathe([[r * 1.04, 0], [r * 1.04, r * 0.22], [r * 0.98, r * 0.28]], 24, null, x, y, z));
  bag.add(mat, lathe([[r, 0], [r * 0.94, r * 0.3], [r * 0.78, r * 0.6], [r * 0.5, r * 0.85], [0.001, r * 0.95]], 24, null, x, y + r * 0.26, z));
  bag.add('gilt_bronze', lathe([[0.06 * r, 0], [0.03 * r, 0.25 * r], [0.001, 0.3 * r]], 6, null, x, y + r * 1.2, z));
};
function semidome(bag, x, y, z, r, dir) {
  // a half dome opening toward the centre, as a quarter-lathe approximated by a lathe clipped with a box
  const g = lathe([[r, 0], [r * 0.92, r * 0.38], [r * 0.7, r * 0.7], [0.001, r * 0.86]], 24, null, 0, 0, 0);
  const P = g.attributes.position.array;
  for (let i = 0; i < P.length; i += 3) { const k = dir === 'n' ? 2 : dir === 's' ? 2 : 0, s = dir === 'n' || dir === 'w' ? -1 : 1; if (P[i + k] * s < 0) P[i + k] = 0; }
  g.attributes.position.needsUpdate = true;
  g.translate(x, y, z); bag.add(L, g);
}
/** minaret: { c, h, y, r, balconies } — a fluted shaft on a square base, balconies, a lead cone. */
function minaret(el, { bag, col }) {
  const [x, z] = el.c, y = el.y ?? 0, h = el.h ?? 60, r = el.r ?? 1.9, n = el.balconies ?? 3;
  bag.add(S, box(x - r * 1.3, y - 0.5, z - r * 1.3, x + r * 1.3, y + h * 0.12, z + r * 1.3)); col.rect([x - r * 1.3, z - r * 1.3, x + r * 1.3, z + r * 1.3], y, y + h * 0.85);
  bag.add(S, lathe([[r, 0], [r * 0.92, h * 0.78]], 16, null, x, y + h * 0.12, z));
  for (let k = 0; k < n; k++) { const yy = y + h * (0.42 + k * 0.17); bag.add(S, lathe([[r * 0.9, 0], [r * 1.55, 0.7], [r * 1.55, 1.6], [r * 0.9, 1.6]], 16, null, x, yy, z)); }
  bag.add(S, lathe([[r * 0.8, 0], [r * 0.8, h * 0.06]], 16, null, x, y + h * 0.9, z));
  bag.add(L, lathe([[r * 1.0, 0], [0.001, h * 0.16]], 16, null, x, y + h * 0.96, z));
}
/** sinan_mosque: { c, d (the central dome's diameter), h (the dome's crown), y, court (depth of the courtyard, north) } — the prayer hall facing south-east (here: the qibla on +z). */
function mosque(el, ctx) {
  const { bag, col } = ctx, [cx, cz] = el.c, D = el.d, R = D / 2, y = el.y ?? 0, H = el.h, W = D * 2.2, Dp = D * 2.0, cd = el.court ?? D * 1.8;
  const hall = [cx - W / 2, cz - Dp / 2, cx + W / 2, cz + Dp / 2], wallH = H * 0.42;
  // the prayer hall, hollow: its walls (the door from the court in the north wall), the roof over the side
  // spaces, four great piers carrying the drum, the dome seen from inside
  const T = 2.6, dw = 2.4, dh = 6.5, [hx0, hz0, hx1, hz1] = hall;
  const wall = (r) => { bag.add(S, box(r[0], y - 0.5, r[1], r[2], y + wallH, r[3])); col.rect(r, y, y + wallH); };
  wall([hx0, hz1 - T, hx1, hz1]); wall([hx0, hz0 + T, hx0 + T, hz1 - T]); wall([hx1 - T, hz0 + T, hx1, hz1 - T]);
  wall([hx0, hz0, cx - dw, hz0 + T]); wall([cx + dw, hz0, hx1, hz0 + T]);
  bag.add(S, box(cx - dw, y + dh, hz0, cx + dw, y + wallH, hz0 + T));
  bag.add('opening', box(cx - dw * 0.8, y, hz0 + T - 0.05, cx + dw * 0.8, y + dh, hz0 + T - 0.02));
  // the windows: rows in the walls, seen from both sides
  for (const f of 'nsew') { const along = f === 'n' || f === 's', Lw = along ? W : Dp, n = Math.floor(Lw / 4); for (let i = 1; i < n; i++) for (const yy of [y + 3, y + wallH * 0.55]) { const u = (along ? hx0 : hz0) + i * Lw / n; if (f === 'n' && Math.abs(u - cx) < dw + 1) continue; for (const [o0, o1, wm] of [[-0.06, 0.02, 'opening'], [T - 0.02, T + 0.02, 'daylight']]) { const q = f === 'n' ? [u - 0.8, hz0 + o0, u + 0.8, hz0 + o1] : f === 's' ? [u - 0.8, hz1 - o1, u + 0.8, hz1 - o0] : f === 'w' ? [hx0 + o0, u - 0.8, hx0 + o1, u + 0.8] : [hx1 - o1, u - 0.8, hx1 - o0, u + 0.8]; bag.add(wm, box(q[0], yy, q[1], q[2], yy + 2.6, q[3])); } } }
  const dy = H - R * 1.2, q = R + 1.5;
  // the roof over the side spaces (the hall less the central square), its ceiling painted
  for (const r of [[hx0 + T, hz0 + T, cx - q, hz1 - T], [cx + q, hz0 + T, hx1 - T, hz1 - T], [cx - q, hz0 + T, cx + q, cz - q], [cx - q, cz + q, cx + q, hz1 - T]]) { bag.add(S, box(r[0], y + wallH - 1.2, r[1], r[2], y + wallH, r[3])); bag.add('stucco', box(r[0], y + wallH - 1.24, r[1], r[2], y + wallH - 1.2, r[3])); }
  // the piers at the square's corners and the arches between them; the drum as four walls round the dome's foot
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const px = cx + sx * q, pz = cz + sz * q; bag.add(S, box(px - 2.2, y - 0.5, pz - 2.2, px + 2.2, y + dy, pz + 2.2)); col.rect([px - 2.2, pz - 2.2, px + 2.2, pz + 2.2], y, y + dy); }
  for (const r of [[cx - q - 1.5, cz - q - 1.5, cx + q + 1.5, cz - q], [cx - q - 1.5, cz + q, cx + q + 1.5, cz + q + 1.5], [cx - q - 1.5, cz - q, cx - q, cz + q], [cx + q, cz - q, cx + q + 1.5, cz + q]]) bag.add(S, box(r[0], y + wallH - 1.2, r[1], r[2], y + dy + R * 0.26, r[3]));
  // the pendentives' place: a flat ring from the dome's foot out to the square's corners, seen from below and above
  const yr = y + dy + R * 0.26 - 0.02;
  bag.add('stucco', lathe([[R * 0.99, 0], [q * 1.45, 0]], 32, null, cx, yr, cz));
  bag.add(S, lathe([[q * 1.45, 0.02], [R * 0.99, 0.02]], 32, null, cx, yr, cz));
  // the inner shell of the dome, painted; its ring of windows; the great chandelier ring on chains
  const inner = [[0.001, R * 0.92], [R * 0.5, R * 0.82], [R * 0.78, R * 0.58], [R * 0.94, R * 0.28], [R * 0.99, 0], [R * 0.99, -R * 0.1]];
  bag.add('stucco', lathe(inner, 32, null, cx, y + dy + R * 0.26, cz));
  for (let k = 0; k < 24; k++) { const a = k / 24 * Math.PI * 2, xx = cx + Math.cos(a) * R * 0.97, zz = cz + Math.sin(a) * R * 0.97; bag.add('daylight', box(xx - 0.5, y + dy + R * 0.02, zz - 0.5, xx + 0.5, y + dy + R * 0.22, zz + 0.5)); }
  bag.add('glaze_blue', lathe([[0.001, R * 0.9], [R * 0.18, R * 0.86], [R * 0.18, R * 0.85], [0.001, R * 0.89]], 24, null, cx, y + dy + R * 0.26, cz));
  const ly = y + 5.2;
  bag.add('iron', lathe([[R * 0.72, 0], [R * 0.72, 0.15], [R * 0.7, 0.15], [R * 0.7, 0]], 48, null, cx, ly, cz));
  for (let k = 0; k < 48; k++) { const a = k / 48 * Math.PI * 2; bag.add('lamp_glass', lathe([[0.001, 0], [0.12, 0.08], [0.1, 0.3], [0.001, 0.32]], 6, null, cx + Math.cos(a) * R * 0.71, ly + 0.15, cz + Math.sin(a) * R * 0.71)); }
  for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; bag.add('iron', box(cx + Math.cos(a) * R * 0.71 - 0.02, ly, cz + Math.sin(a) * R * 0.71 - 0.02, cx + Math.cos(a) * R * 0.71 + 0.02, y + dy, cz + Math.sin(a) * R * 0.71 + 0.02)); }
  // the floor in carpets; the mihrab in the qibla (south) wall with its tiled frame, the marble minbar beside it
  bag.add('marble', box(hx0 + T, y - 0.3, hz0 + T, hx1 - T, y + 0.05, hz1 - T)); col.floor([hx0 + T, hz0 + T, hx1 - T, hz1 - T], y + 0.05);
  bag.add('cloth_red', box(hx0 + T + 0.6, y + 0.05, hz0 + T + 0.6, hx1 - T - 0.6, y + 0.07, hz1 - T - 0.6));
  const qz = hz1 - T;
  bag.add('glaze_white', box(cx - 3.2, y, qz - 0.3, cx + 3.2, y + 9, qz));
  bag.add('glaze_blue', box(cx - 2.6, y + 0.4, qz - 0.34, cx + 2.6, y + 8.4, qz - 0.3));
  bag.add('marble', box(cx - 1.8, y, qz - 0.6, cx + 1.8, y + 6.6, qz - 0.34));
  bag.add('opening', box(cx - 1.1, y + 0.1, qz - 0.64, cx + 1.1, y + 4.6, qz - 0.6));
  for (let k = 0; k < 5; k++) { const w = 1.1 * (1 - k * 0.19); bag.add('opening', box(cx - w, y + 4.6 + k * 0.3, qz - 0.64, cx + w, y + 4.9 + k * 0.3, qz - 0.6)); }
  for (let k = 0; k < 10; k++) bag.add('marble', box(cx + 4, y, qz - 1.2 - k * 0.55, cx + 5.2, y + 0.3 + k * 0.3, qz - 0.65 - k * 0.55));
  bag.add('marble', box(cx + 4, y, qz - 1.4, cx + 5.2, y + 3.3, qz - 0.65)); bag.add('marble', lathe([[0.75, 0], [0.001, 2.0]], 8, null, cx + 4.6, y + 3.3, qz - 1.0));
  col.rect([cx + 4, qz - 6.8, cx + 5.2, qz - 0.6], y, y + 3.4);
  // outside: the drum's crown band, the weight towers, the domes and semidomes
  bag.add(S, lathe([[R + 1.5, 0], [R + 1.5, R * 0.1]], 24, null, cx, y + dy - R * 0.1, cz));
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const tx = cx + sx * (R + 1.5), tz = cz + sz * (R + 1.5); bag.add(S, box(tx - 2, y + wallH, tz - 2, tx + 2, y + dy + 1, tz + 2)); bag.add(L, lathe([[2.2, 0], [0.001, 3.5]], 8, null, tx, y + dy + 1, tz)); }
  dome(bag, cx, y + dy, cz, R);
  semidome(bag, cx, y + dy - R * 0.25, cz - R, R, 'n'); semidome(bag, cx, y + dy - R * 0.25, cz + R, R, 's');
  for (const sx of [-1, 1]) for (const sz of [-0.55, 0, 0.55]) dome(bag, cx + sx * (R + R * 0.55), y + wallH, cz + sz * D, R * 0.42);
  // the courtyard: domed arcades round a court, the fountain, four minarets at its and the hall's corners
  const court = [cx - W * 0.42, hall[1] - cd, cx + W * 0.42, hall[1]];
  const bay = 6.5;
  for (const [a, b] of [[[court[0], court[1]], [court[2], court[1]]], [[court[0], court[1]], [court[0], court[3]]], [[court[2], court[1]], [court[2], court[3]]]]) {
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.floor(len / bay), ux = (b[0] - a[0]) / len, uz = (b[1] - a[1]) / len;
    for (let i = 0; i < n; i++) { const x = a[0] + ux * (i + 0.5) * len / n, z = a[1] + uz * (i + 0.5) * len / n; dome(bag, x, y + 7, z, bay * 0.42); bag.add(S, box(x - 0.6, y - 0.3, z - 0.6, x + 0.6, y + 7, z + 0.6)); col.rect([x - 0.6, z - 0.6, x + 0.6, z + 0.6], y, y + 7); }
  }
  bag.add('marble', box(court[0], y - 0.3, court[1], court[2], y + 0.08, court[3])); col.floor(court, y + 0.08);
  bag.add('marble', lathe([[3.2, 0], [3.2, 1.2], [2.6, 1.2]], 8, null, cx, y, (court[1] + court[3]) / 2));
  bag.add(L, lathe([[3.6, 0], [0.001, 2.6]], 8, null, cx, y + 3.6, (court[1] + court[3]) / 2));
  for (const [mx, mz, h] of [[court[0], court[1], 56], [court[2], court[1], 56], [hall[0] + 1, hall[1] + 1, 72], [hall[2] - 1, hall[1] + 1, 72]]) minaret({ c: [mx, mz], y, h, r: 1.9 }, ctx);
}
/** madrasa: { rect, y } — domed cells round a court with an arcade. */
function madrasa(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, d = 5.5;
  for (const r of [[x0, z0, x1, z0 + d], [x0, z1 - d, x1, z1], [x0, z0 + d, x0 + d, z1 - d], [x1 - d, z0 + d, x1, z1 - d]]) {
    bag.add(S, box(r[0], y - 0.5, r[1], r[2], y + 5, r[3])); col.rect(r, y, y + 5);
    const along = r[2] - r[0] > r[3] - r[1], len = along ? r[2] - r[0] : r[3] - r[1], n = Math.floor(len / d);
    for (let i = 0; i < n; i++) { const u = (along ? r[0] : r[1]) + (i + 0.5) * len / n; dome(bag, along ? u : (r[0] + r[2]) / 2, y + 5, along ? (r[1] + r[3]) / 2 : u, d * 0.42); }
  }
}
registerStyle('ottoman', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.qing.elements, sinan_mosque: mosque, minaret, madrasa },
  objects: {},
});
