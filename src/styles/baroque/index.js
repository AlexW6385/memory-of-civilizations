// Roman Baroque (17th c.; docs/settlements/baroque-rome.md §4): St Peter's — Michelangelo's
// Greek-cross block with its giant pilasters and attic, Maderno's nave and front with its columns,
// pediment and statues, the drum with paired columns, the ribbed lead dome and the lantern; Bernini's
// colonnade of four rows of Tuscan columns under an entablature with statues; the obelisk and the
// fountains; Castel Sant'Angelo's drum; travertine palaces and stuccoed houses.

import { registerStyle, STYLES, orientedBox } from '../../core/build.js';
import { box, lathe } from '../../core/geom.js';
import '../qing/index.js';
import '../renaissance/index.js';
import { obelisk, fountain, saint, ponteAngeli, palaceRoman } from './piazza.js';
import { coach, sedanChair } from './street.js';
import { merge, ext } from '../renaissance/face.js';
import { stPeterFacade, entrances } from './facade.js';
import { stPeterInterior } from './interior.js';
import { socle, sagrato } from './sagrato.js';
import { borgoRow } from './borgo.js';
import { piazzaLines, parterre, passetto, castel as castelRich, naveDress, shipMill, tiberLanding } from './dress.js';

const T = 'travertine', L = 'lead', ST = 'stucco_ochre';
/** st_peter: { c (the crossing), s (side of the central block), nave (length east), w, h, d (dome diameter), y } — the church faces east. */
function stPeter(el, { bag, col }) {
  const [cx, cz] = el.c, S = el.s ?? 110, N = el.nave ?? 70, W = el.w ?? 56, H = el.h ?? 45, D = el.d ?? 42, y = el.y ?? 0, R0 = D / 2;
  // Michelangelo's block: a Greek cross of four arms with apses
  const arm = S / 2, aw = S * 0.42;
  const IN = !!el.interior, n0 = cx + arm, n1 = n0 + N, fw = W * 1.05;
  if (!IN) for (const r of [[cx - arm, cz - aw / 2, cx + arm, cz + aw / 2], [cx - aw / 2, cz - arm, cx + aw / 2, cz + arm]]) { bag.add(T, box(r[0], y - 0.5, r[1], r[2], y + H, r[3])); col.rect(r, y, y + H); }
  else shell(bag, col, { cx, cz, y, H, arm, aw, n0, n1, W, fw, R0 });
  for (const [ax, az] of [[cx - arm, cz], [cx, cz - arm], [cx, cz + arm]]) {
    if (IN && az !== cz) {
      // hollow where a transept's apse opens inside: only the outer half beyond the arm's end, a metre thick, and its roof
      const sz = Math.sign(az - cz), r = aw / 2, half = (r0, r1, y0, y1) => { const pts = []; for (let i = 0; i <= 24; i++) pts.push([Math.cos(Math.PI * i / 24) * r1, Math.sin(Math.PI * i / 24) * r1]); for (let i = 24; i >= 0; i--) pts.push([Math.cos(Math.PI * i / 24) * r0, Math.sin(Math.PI * i / 24) * r0]); const g = ext(pts.map(([u, v]) => [ax + u, -(az + sz * v)]), [], y0, y1, 1); g.rotateX(-Math.PI / 2); return g; };
      bag.add(T, half(r - 1, r, y - 0.5, y + H)); bag.add(T, half(0.001, r, y + H - 1, y + H));
      for (let k = 0; k < 12; k++) { const a0 = Math.PI * k / 12, a1 = Math.PI * (k + 1) / 12; col.segment([ax + Math.cos(a0) * (r - 0.5), az + sz * Math.sin(a0) * (r - 0.5)], [ax + Math.cos(a1) * (r - 0.5), az + sz * Math.sin(a1) * (r - 0.5)], 1.0, y, y + H); }
    } else { bag.add(T, lathe([[aw / 2, 0], [aw / 2, H], [0.001, H]], 16, null, ax, y - 0.5, az)); col.circle(ax, az, aw / 2, y, y + H); }
  }
  for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const r = [cx + dx * aw / 2, cz + dz * aw / 2, cx + dx * arm * 0.85, cz + dz * arm * 0.85]; const q = [Math.min(r[0], r[2]), Math.min(r[1], r[3]), Math.max(r[0], r[2]), Math.max(r[1], r[3])]; bag.add(T, box(q[0], y - 0.5, q[1], q[2], y + H * 0.8, q[3])); col.rect(q, y, y + H * 0.8); bag.add(L, lathe([[8, 0], [5, 6], [0.001, 9]], 12, null, (q[0] + q[2]) / 2, y + H * 0.8, (q[1] + q[3]) / 2)); }
  // the attic and giant pilasters
  if (!IN) bag.add(T, box(cx - arm - 1, y + H, cz - aw / 2 - 1, cx + arm + 1, y + H + 2.5, cz + aw / 2 + 1));
  else bag.add(T, slab([[cx - arm - 1, cz - aw / 2 - 1], [cx + arm + 1, cz - aw / 2 - 1], [cx + arm + 1, cz + aw / 2 + 1], [cx - arm - 1, cz + aw / 2 + 1]], y + H, y + H + 2.5, cx, cz, R0));
  for (let k = -5; k <= 5; k++) for (const s of [-1, 1]) bag.add(T, box(cx + k * arm / 5 - 0.9, y, cz + s * (aw / 2 + 0.6) - 0.6, cx + k * arm / 5 + 0.9, y + H, cz + s * (aw / 2 + 0.6) + 0.6));
  // Maderno's nave to the east, its front with eight columns, the pediment and the statues
  if (!IN) { bag.add(T, box(n0 - 1, y - 0.5, cz - W / 2, n1, y + H, cz + W / 2)); col.rect([n0 - 1, cz - W / 2, n1, cz + W / 2], y, y + H); }
  bag.add(L, box(n0, y + H, cz - W * 0.3, n1, y + H + 6, cz + W * 0.3));
  if (!IN) { bag.add(T, box(n1, y - 0.5, cz - fw, n1 + 4, y + H, cz + fw)); col.rect([n1, cz - fw, n1 + 4, cz + fw], y, y + H); }
  else {
    // the front wall pierced by the five entrances to the portico
    const ent = entrances(H).map((e) => [cz + e.dz - e.w / 2, cz + e.dz + e.w / 2, e.h]).sort((p, q) => p[0] - q[0]);
    let z = cz - fw;
    for (const [z0, z1, eh] of ent) { bag.add(T, box(n1, y - 0.5, z, n1 + 4, y + H, z0)); col.rect([n1, z, n1 + 4, z0], y, y + H); bag.add(T, box(n1, y + eh, z0, n1 + 4, y + H, z1)); z = z1; }
    bag.add(T, box(n1, y - 0.5, z, n1 + 4, y + H, cz + fw)); col.rect([n1, z, n1 + 4, cz + fw], y, y + H);
  }
  // the front: the giant order, the entrances, the balconies and the Loggia of the Blessings, the inscription, the pediment, the attic and the statues (facade.js)
  stPeterFacade(bag, col, { fx: n1 + 4, cz, fw, y, top: H, open: IN });
  // the drum with paired columns, the ribbed dome, the lantern
  const dy = y + H + 2.5;
  bag.add(T, lathe([[R0 + 3, 0], [R0 + 3, 4], [R0 + 1.5, 4], [R0 + 1.5, 20], [R0 + 2.5, 22], [R0 + 1, 24], ...(IN ? [] : [[0.001, 24]])], 32, null, cx, dy, cz));
  for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2; for (const d of [-0.05, 0.05]) { const b = a + d, x = cx + Math.cos(b) * (R0 + 2.4), z = cz + Math.sin(b) * (R0 + 2.4); bag.add(T, lathe([[0.7, 0], [0.7, 16], [0.001, 16]], 8, null, x, dy + 4, z)); } bag.add('opening', box(cx + Math.cos(a + Math.PI / 16) * (R0 + 1.5) - 1, dy + 8, cz + Math.sin(a + Math.PI / 16) * (R0 + 1.5) - 1, cx + Math.cos(a + Math.PI / 16) * (R0 + 1.5) + 1, dy + 15, cz + Math.sin(a + Math.PI / 16) * (R0 + 1.5) + 1)); }
  const domeY = dy + 24, dome = [[R0 + 1, 0], [R0 * 0.98, R0 * 0.3], [R0 * 0.88, R0 * 0.62], [R0 * 0.68, R0 * 0.92], [R0 * 0.4, R0 * 1.14], [R0 * 0.15, R0 * 1.24]];
  bag.add(L, lathe(dome, 32, null, cx, domeY, cz));
  for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2; for (let i = 0; i + 1 < dome.length; i++) { const [r0, h0] = dome[i], [r1, h1] = dome[i + 1]; const g = box(-0.6, 0, -0.6, 0.6, Math.hypot(r1 - r0, h1 - h0) + 0.3, 0.6); g.rotateZ(Math.atan2(r0 - r1, h1 - h0)); g.translate(r0 + 0.15, h0, 0); g.rotateY(-a); g.translate(cx, domeY, cz); bag.add(T, g); } }
  const ly = domeY + R0 * 1.24;
  bag.add(T, lathe([[R0 * 0.2, 0], [R0 * 0.2, 9], [R0 * 0.24, 10], [0.001, 10]], 16, null, cx, ly, cz));
  bag.add(L, lathe([[R0 * 0.16, 0], [0.5, 6], [0.001, 7]], 16, null, cx, ly + 10, cz));
  bag.add('gilt_bronze', lathe([[0.9, 0], [0.9, 1.8], [0.2, 2], [0.2, 4.5], [0.001, 4.5]], 10, null, cx, ly + 17, cz));
  // raised above the piazza: the socle under the walls, the sagrato and Bernini's steps (sagrato.js)
  if (y > 0.3) {
    const corners = [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([dx, dz]) => { const r = [cx + dx * aw / 2, cz + dz * aw / 2, cx + dx * arm * 0.85, cz + dz * arm * 0.85]; return [Math.min(r[0], r[2]), Math.min(r[1], r[3]), Math.max(r[0], r[2]), Math.max(r[1], r[3])]; });
    socle(bag, col, { y, rects: [[cx - arm, cz - aw / 2, cx + arm, cz + aw / 2], [cx - aw / 2, cz - arm, cx + aw / 2, cz + arm], ...corners, [n0 - 1, cz - W / 2, n1, cz + W / 2], [n1 - 9.2, cz - 41.2, n1, cz + 41.2], [n1, cz - fw, n1 + 4, cz + fw]], circles: [[cx - arm, cz, aw / 2], [cx, cz - arm, aw / 2], [cx, cz + arm, aw / 2]] });
    sagrato(bag, col, { fx: n1 + 4, cz, fw, y });
  }
  // inside (interior.js): the arms 27.5 m wide under barrel vaults springing at 30 m, the crossing's arches 21 m from its centre
  if (IN) stPeterInterior(bag, col, { cx, cz, y, A: R0, b: 13.75, ys: 30, R0, yDrum1: dy + 24 - y, yDome: domeY - y, domeH: R0 * 1.1, xFront: n1 - 8, xWest: cx - arm + aw / 2 + 1.6, zEnd: arm - 5, apse: true });
}
/** A horizontal slab of the outline pts ([[x, z], …]) from y0 to y1, with a round hole of radius r at (hx, hz) if r. */
function slab(pts, y0, y1, hx, hz, r) {
  const hole = []; if (r) for (let i = 0; i < 48; i++) { const a = i / 48 * Math.PI * 2; hole.push([hx + Math.cos(a) * r, -(hz + Math.sin(a) * r)]); }
  const g = ext(pts.map(([x, z]) => [x, -z]), r ? [hole] : [], y0, y1, 1); g.rotateX(-Math.PI / 2); return g;
}
/**
 * The church's outer skin when it is hollow: the walls of Michelangelo's two arms and of Maderno's nave a metre
 * thick, only where they face the outside; the roofs over them with the crossing open to the drum; the portico's
 * part of the nave walls only above the portico's roof.
 */
function shell(bag, col, { cx, cz, y, H, arm, aw, n0, n1, W, fw, R0 }) {
  const t = 1.0, a2 = aw / 2, w2 = W / 2, xp = n1 - 8;
  const wallX = (x, z0, z1, inward, y0 = y - 0.5) => { const r = inward > 0 ? [x, z0, x + t, z1] : [x - t, z0, x, z1]; bag.add(T, box(r[0], y0, r[1], r[2], y + H, r[3])); col.rect(r, Math.max(y, y0), y + H); };
  const wallZ = (z, x0, x1, inward, y0 = y - 0.5) => { const r = inward > 0 ? [x0, z, x1, z + t] : [x0, z - t, x1, z]; bag.add(T, box(r[0], y0, r[1], r[2], y + H, r[3])); col.rect(r, Math.max(y, y0), y + H); };
  for (const s of [-1, 1]) {
    // the east–west arm's long sides (the crossing's part belongs to the north–south arm), the north–south arm's sides
    wallZ(cz + s * a2, cx - arm, cx - a2, -s); wallZ(cz + s * a2, cx + a2, n0 - 1, -s);
    wallX(cx - a2, s < 0 ? cz - arm : cz + a2, s < 0 ? cz - a2 : cz + arm, 1); wallX(cx + a2, s < 0 ? cz - arm : cz + a2, s < 0 ? cz - a2 : cz + arm, -1);
    wallZ(cz + s * arm, cx - a2, cx - 15, -s); wallZ(cz + s * arm, cx + 15, cx + a2, -s);   // (the inner apse passes between)
    // the nave's sides, the step where it meets the arm, and above the portico
    wallZ(cz + s * w2, n0 - 1, xp - 1.2, -s); wallZ(cz + s * w2, xp - 1.2, n1, -s, y + 19.6);
    wallX(n0 - 1, s < 0 ? cz - w2 : cz + a2, s < 0 ? cz - a2 : cz + w2, 1);
  }
  wallX(cx - arm, cz - a2, cz + a2, 1);
  // the roofs: the east–west arm's (open over the crossing), the north–south arm's ends, the nave's
  bag.add(T, slab([[cx - arm, cz - a2], [n0 - 1, cz - a2], [n0 - 1, cz + a2], [cx - arm, cz + a2]], y + H - 1, y + H, cx, cz, R0));
  for (const s of [-1, 1]) bag.add(T, box(cx - a2, y + H - 1, s < 0 ? cz - arm : cz + a2, cx + a2, y + H, s < 0 ? cz - a2 : cz + arm));
  bag.add(T, box(n0 - 1, y + H - 1, cz - w2, n1, y + H, cz + w2));
}
/** colonnade: { c (centre of the oval), ax, bz (semi-axes), rows, depth, h, y, from, to (angle of each arm, rad from +x) } — two curved arms of four rows of columns. */
function colonnade(el, { bag, col }) {
  const [ox, oz] = el.c, ax = el.ax ?? 70, bz = el.bz ?? 95, rows = el.rows ?? 4, depth = el.depth ?? 14, h = el.h ?? 13, y = el.y ?? 0;
  const arms = el.arms ?? [[0.35, Math.PI - 0.55], [-Math.PI + 0.55, -0.35]];
  for (const [a0, a1] of arms) {
    const n = Math.round(Math.abs(a1 - a0) * (ax + bz) / 2 / 4.2);
    const pt = (a, off) => { const s = 1 + off / ((ax + bz) / 2); return [ox + Math.cos(a) * ax * s, oz - Math.sin(a) * bz * s]; };
    for (let i = 0; i <= n; i++) {
      const a = a0 + (a1 - a0) * i / n;
      for (let r = 0; r < rows; r++) { const [x, z] = pt(a, r * depth / (rows - 1)); bag.add(T, lathe([[0.9, 0], [0.9, 0.6], [0.75, 0.9], [0.65, h - 1.2], [0.95, h - 0.6], [0.95, h]], 10, null, x, y, z)); col.circle(x, z, 0.8, y, y + h); bag.add('plaster_damp', lathe([[0.935, 0], [0.935, 0.45], [0.84, 0.5]], 10, null, x, y, z)); }
      if (i < n) {
        const b = a0 + (a1 - a0) * (i + 1) / n, [px, pz] = pt(a, depth / 2), [qx, qz] = pt(b, depth / 2);
        bag.add(T, orientedBox([px, pz], [qx, qz], depth + 2.5, y + h, y + h + 3.2, 0.05));
        bag.add(L, orientedBox([px, pz], [qx, qz], depth + 1.6, y + h + 3.2, y + h + 4.6, 0.05));
        // the balustrade along the inner edge, a saint on a pedestal over every bay, facing the piazza
        const [sx, sz] = pt(a, -1.05), [tx, tz] = pt(b, -1.05), yt = y + h + 3.2;
        bag.add(T, orientedBox([sx, sz], [tx, tz], 0.45, yt, yt + 0.2, 0.02)); bag.add(T, orientedBox([sx, sz], [tx, tz], 0.4, yt + 1.0, yt + 1.15, 0.02));
        for (let j = 1; j < 8; j++) { const t = j / 8; bag.add(T, lathe([[0.09, 0], [0.15, 0.3], [0.08, 0.6], [0.11, 0.78], [0.1, 0.8]], 6, null, sx + (tx - sx) * t, yt + 0.2, sz + (tz - sz) * t)); }
        bag.add(T, box(sx - 0.45, yt, sz - 0.45, sx + 0.45, yt + 1.3, sz + 0.45));
        const yaw = Math.atan2(ox - sx, oz - sz), k = (i * 7 + (a0 < 0 ? 3 : 0)) % 20;
        const fig = merge(saint(k)); fig.rotateY(yaw); fig.translate(sx, yt + 1.3, sz); bag.add('limestone_carved', fig);   // travertine, carved from one block
      }
    }
    // the end pavilions
    for (const a of [a0, a1]) { const [px, pz] = pt(a, depth / 2), [qx, qz] = pt(a + (a1 > a0 ? -1 : 1) * 0.04, depth / 2); bag.add(T, orientedBox([px, pz], [qx, qz], depth + 4, y - 0.3, y + h + 5.5, 1.5)); col.segment([px, pz], [qx, qz], depth + 4, y, y + h + 5.5); }
  }
  bag.add('flagstone', box(ox - ax * 1.05, y - 0.4, oz - bz * 1.05, ox + ax * 1.05, y + 0.02, oz + bz * 1.05));
}
/** paving: { rect, y } — travertine flags. */
function paving(el, { bag }) { const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0; bag.add('flagstone', box(x0, y - 0.4, z0, x1, y + 0.02, z1)); }
registerStyle('baroque', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.qing.elements, ...STYLES.renaissance.elements, st_peter: stPeter, colonnade, obelisk, fountain, castel: castelRich, piazza_lines: piazzaLines, nave_dress: naveDress, ship_mill: shipMill, tiber_landing: tiberLanding, parterre, passetto, paving, ponte_angeli: ponteAngeli, palace_roman: palaceRoman, coach, sedan_chair: sedanChair, borgo_row: borgoRow },
  objects: {},
});
