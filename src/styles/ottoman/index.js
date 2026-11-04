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
  bag.add(S, box(hall[0], y - 0.5, hall[1], hall[2], y + wallH, hall[3])); col.rect(hall, y, y + wallH);
  // rows of windows in the walls
  for (const f of 'nsew') { const along = f === 'n' || f === 's', Lw = along ? W : Dp, n = Math.floor(Lw / 4); for (let i = 1; i < n; i++) for (const yy of [y + 3, y + wallH * 0.55]) { const u = (along ? hall[0] : hall[1]) + i * Lw / n; const q = f === 'n' ? [u - 0.8, hall[1] - 0.06, u + 0.8, hall[1] + 0.02] : f === 's' ? [u - 0.8, hall[3] - 0.02, u + 0.8, hall[3] + 0.06] : f === 'w' ? [hall[0] - 0.06, u - 0.8, hall[0] + 0.02, u + 0.8] : [hall[2] - 0.02, u - 0.8, hall[2] + 0.06, u + 0.8]; bag.add('opening', box(q[0], yy, q[1], q[2], yy + 2.6, q[3])); } }
  // the drum and the central dome; the semidomes on the axis; the small domes and the weight towers
  const dy = H - R * 1.2;
  bag.add(S, box(cx - R - 1.5, y + wallH, cz - R - 1.5, cx + R + 1.5, y + dy - R * 0.1, cz + R + 1.5));
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
