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
import { procCross, gonfalone, baldachin } from './feast.js';
import { merge, ext } from '../renaissance/face.js';
import { stPeterFacade, entrances } from './facade.js';
import { stPeterInterior } from './interior.js';
import { socle, sagrato } from './sagrato.js';
import { borgoRow } from './borgo.js';
import { sistina } from './sistina.js';
import { palaceApostolic } from './apostolic.js';
import { colonnade } from './colonnade.js';
import { cupola } from './cupola.js';
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
  const dy = y + H + 2.5, domeY = dy + 24;   // (the inner dome springs at 24 m; the outer drum is 29 m, cupola.js)
  cupola(bag, { cx, cz, dy, R0, IN });
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
/** paving: { rect, y } — travertine flags. */
function paving(el, { bag }) { const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0; bag.add('flagstone', box(x0, y - 0.4, z0, x1, y + 0.02, z1)); }
registerStyle('baroque', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.qing.elements, ...STYLES.renaissance.elements, st_peter: stPeter, colonnade, obelisk, fountain, castel: castelRich, piazza_lines: piazzaLines, nave_dress: naveDress, ship_mill: shipMill, tiber_landing: tiberLanding, parterre, passetto, paving, ponte_angeli: ponteAngeli, palace_roman: palaceRoman, coach, sedan_chair: sedanChair, proc_cross: procCross, gonfalone, baldachin, borgo_row: borgoRow, sistina, palace_apostolic: palaceApostolic },
  objects: {},
});
