// The Serapeum on the rock of Rhakotis (docs/settlements/alexandria.md §7), founded by Ptolemy III Euergetes: a walled precinct, an
// Egyptian pylon gate on the east with a pair of sphinxes before it, and the temple of Serapis — a Doric prostyle front of marble
// with the Egyptian cavetto cornice over the cella — on its podium. The form is [inferred]. Registered into the `ptolemaic` style.

import { STYLES } from '../../core/build.js';
import { box, lathe, frustum, rod } from '../../core/geom.js';
import { wallSeg, steps } from './util.js';

/** A cavetto cornice (the Egyptian hollow) with its torus roll along a straight run: x0…x1 at z0…z1, its top at y. */
function cavetto(bag, mat, [x0, z0, x1, z1], y, h = 0.7, out = 0.45) {
  const n = 4;
  for (let k = 0; k < n; k++) { const f = k / n, g = (k + 1) / n, o0 = out * (1 - Math.cos(f * Math.PI / 2)), o1 = out * (1 - Math.cos(g * Math.PI / 2)); void o1; bag.add(mat, box(x0 - o0 - 0.02, y - h + f * h, z0 - o0 - 0.02, x1 + o0 + 0.02, y - h + g * h, z1 + o0 + 0.02)); }
  bag.add(mat, box(x0 - 0.12, y - h - 0.35, z0 - 0.12, x1 + 0.12, y - h, z1 + 0.12));       // the torus
}
/** pylon: { c [x, z], y, face ('e' | 'w' | 'n' | 's': where the gate looks), w (the gate's width, 5), h (14) } — two battered towers of dressed sandstone and the passage between, a cavetto cornice, flagpole slots. */
function pylon(el, ctx) {
  const { bag, col } = ctx, [cx, cz] = el.c, y = el.y ?? 0, gw = el.w ?? 5, h = el.h ?? 14, tw = el.tower ?? 9, td = 4.5;
  const alongX = el.face === 'n' || el.face === 's';
  const R = (u0, v0, u1, v1) => (alongX ? [cx + u0, cz + v0, cx + u1, cz + v1] : [cx + v0, cz + u0, cx + v1, cz + u1]);
  for (const s of [-1, 1]) {
    const u0 = s > 0 ? gw / 2 : -gw / 2 - tw, u1 = u0 + tw, r = R(u0, -td / 2, u1, td / 2), b = 0.5;
    bag.add('sandstone_dressed', frustum([r[0], r[1], r[2], r[3]], y - 0.5, y + h, b, b, b, b)); col.rect(r, y - 0.5, y + h);
    cavetto(bag, 'sandstone', [r[0] + b, r[1] + b, r[2] - b, r[3] - b], y + h + 0.7, 0.7, 0.4);
    for (const v of [-td / 2 + 0.1, td / 2 - 0.1]) { const q = R(u0 + 1.2, v - 0.15, u0 + 1.6, v + 0.15); bag.add('wood_dark', box(q[0], y + 5, q[1], q[2], y + h - 1, q[3])); }
  }
  const p = R(-gw / 2, -td / 2, gw / 2, td / 2);
  bag.add('sandstone_dressed', box(p[0], y + 7.2, p[1], p[2], y + h, p[3]));
  cavetto(bag, 'sandstone', p, y + h + 0.7, 0.7, 0.4);
  const dl = alongX ? [cx - gw / 2, y, cz - 0.1, cx + gw / 2, y + 7.2, cz + 0.1] : [cx - 0.1, y, cz - gw / 2, cx + 0.1, y + 7.2, cz + gw / 2];
  bag.add('wood_dark', box(...dl));
}
function sphinx(el, ctx) {
  const { bag, col } = ctx, [x, z] = el.at, y = el.y ?? 0, yaw = el.yaw ?? 0, s = el.s ?? 1, m = el.mat ?? 'sandstone';
  const g = (a, b, c, d, e, f, mat) => { const bx = box(a * s, b * s, c * s, d * s, e * s, f * s); bx.rotateY(yaw); bx.translate(x, y, z); bag.add(mat ?? m, bx); };
  g(-0.7, 0.0, -2.0, 0.7, 1.4, 1.6);                                  // the body, lying
  g(-0.65, 0.0, 1.0, 0.65, 1.7, 2.0); g(-0.55, 0.0, -3.1, -0.3, 0.6, -2.0); g(0.3, 0.0, -3.1, 0.55, 0.6, -2.0);    // haunch, forepaws
  g(-0.6, 1.4, -2.2, 0.6, 2.9, -1.2); g(-0.8, 1.7, -2.15, -0.55, 2.8, -1.1, 'egyptian_blue'); g(0.55, 1.7, -2.15, 0.8, 2.8, -1.1, 'egyptian_blue');   // chest, the nemes headcloth
  const h = lathe([[0.001, -0.5], [0.42, -0.35], [0.5, 0], [0.42, 0.4], [0.001, 0.5]], 10); h.scale(s, s, s * 0.9); h.rotateY(yaw); h.translate(x - Math.sin(yaw) * 1.6 * s, y + 2.9 * s, z - Math.cos(yaw) * 1.6 * s); bag.add(m, h);
  const R = [x - 1.2 * s, z - 3.2 * s, x + 1.2 * s, z + 2.1 * s];
  col.circle(x, z, 1.6 * s, y, y + 2.5 * s); void R; void rod;
}
/** serapeum_temple: { rect [x0, z0, x1, z1] (the stylobate; the front on the east), y } */
function temple(el, ctx) {
  const { bag, col } = ctx, [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, G = STYLES.greek.elements;
  const st = 4, rise = 0.28, tread = 0.5, y1 = y + st * rise, colH = 7.4, d = 1.05, nC = 6;
  G.krepis({ rect: [x0, z0, x1, z1], y0: y, steps: st, rise, tread, mat: 'marble', cut: [[x1 - 0.1, (z0 + z1) / 2 - 3, x1 + st * tread + 0.1, (z0 + z1) / 2 + 3]] }, ctx);
  steps(ctx, [x1 - 0.1 - st * tread * 0, (z0 + z1) / 2 - 3, x1 + st * tread + 0.0, (z0 + z1) / 2 + 3], 'w', y + 0.0, y1, y - 0.3, 'marble', rise);
  const zs = Array.from({ length: nC }, (_, i) => z0 + 1.6 + i * ((z1 - z0 - 3.2) / (nC - 1)));
  const xf = x1 - 1.6;
  for (const z of zs) STYLES.greek.column({ at: [xf, z], y: y1, h: colH, d, mat: 'marble_column', flutes: 20 }, ctx);
  // the cella behind the front: walls with a door facing east, the cavetto cornice over them
  const xc0 = x0 + 1.4, xc1 = x1 - 5.4, zc0 = z0 + 2.0, zc1 = z1 - 2.0, hc = colH + 1.6;
  for (const [a, b] of [[[xc0, zc0], [xc1, zc0]], [[xc0, zc1], [xc1, zc1]], [[xc0, zc0], [xc0, zc1]]]) wallSeg(ctx, a, b, 1.0, y1, y1 + hc, 'marble');
  wallSeg(ctx, [xc1, zc0], [xc1, zc1], 1.0, y1, y1 + hc, 'marble', [{ at: (zc1 - zc0) / 2, w: 2.6, h: 5.2, y0: y1 }]);
  // the front: architrave, frieze with blue triglyphs, geison, and the pediment; the cavetto over the cella's door
  const ya = y1 + colH, ent = 1.0, fr = 1.0;
  bag.add('marble', box(xf - 0.9, ya, z0 + 0.4, xf + 0.9, ya + ent, z1 - 0.4));
  bag.add('marble_smooth', box(xf - 0.8, ya + ent, z0 + 0.4, xf + 0.8, ya + ent + fr, z1 - 0.4));
  for (let k = 0; k < nC * 2; k++) { const z = z0 + 1.0 + k * ((z1 - z0 - 2.0) / (nC * 2 - 1)); bag.add('egyptian_blue', box(xf + 0.78, ya + ent + 0.05, z - 0.28, xf + 0.86, ya + ent + fr - 0.05, z + 0.28)); }
  bag.add('marble', box(xf - 1.2, ya + ent + fr, z0 + 0.2, xf + 1.2, ya + ent + fr + 0.45, z1 - 0.2));
  const sx = [x0 + 0.6, xf + 0.9];
  bag.add('marble', box(sx[0], ya, z0 + 0.4, xf - 0.9, ya + ent + fr + 0.45, z0 + 1.6)); bag.add('marble', box(sx[0], ya, z1 - 1.6, xf - 0.9, ya + ent + fr + 0.45, z1 - 0.4));
  G.pediment_roof({ rect: [x0 + 0.2, z0 + 0.1, x1 - 1.0, z1 - 0.1], y: ya + ent + fr + 0.45, rise: (z1 - z0) * 0.13, tympanumInset: 0.5, rakingGeison: 0.4, mat: 'marble', tileMat: 'roof_tile', ridge: 'x' }, ctx);
  cavetto(bag, 'marble', [xc1 - 0.5, (zc0 + zc1) / 2 - 1.8, xc1 + 0.5, (zc0 + zc1) / 2 + 1.8], y1 + 5.9, 0.6, 0.35);
  // the cella's door stands open; inside: the cult image of Serapis enthroned at the west wall, two rows of columns, lamps, altars, stelae
  const zm = (zc0 + zc1) / 2, ci = xc0 + 1.4;
  for (const s of [-1, 1]) bag.add('cedar', box(xc1 - 0.68, y1, zm + s * 1.3 - (s > 0 ? 0 : 1.3), xc1 - 0.52, y1 + 5.2, zm + s * 1.3 + (s > 0 ? 1.3 : 0)));
  bag.add('marble_floor', box(xc0 + 0.6, y1 - 0.02, zc0 + 0.6, xc1 - 0.6, y1 + 0.02, zc1 - 0.6));
  bag.add('marble', box(ci - 1.0, y1, zm - 2.6, ci + 3.2, y1 + 1.0, zm + 2.6)); col.rect([ci - 1.0, zm - 2.6, ci + 3.2, zm + 2.6], y1, y1 + 1.0);   // the base
  bag.add('timber', box(ci, y1 + 1.0, zm - 1.7, ci + 2.2, y1 + 1.8, zm + 1.7)); bag.add('timber', box(ci, y1 + 1.8, zm - 1.7, ci + 0.4, y1 + 5.0, zm + 1.7));    // the throne and its back
  for (const s of [-1, 1]) bag.add('timber', box(ci + 0.2, y1 + 1.8, zm + s * 1.6 - 0.12, ci + 2.2, y1 + 2.6, zm + s * 1.6 + 0.12));
  bag.add('ivory', lathe([[0.001, 0], [0.62, 0.05], [0.7, 0.8], [0.6, 1.6], [0.5, 2.2], [0.3, 2.5], [0.001, 2.6]], 10, null, ci + 1.2, y1 + 1.8, zm));        // the god: the robed body
  bag.add('ivory', lathe([[0.001, 0], [0.3, 0.1], [0.34, 0.45], [0.2, 0.7], [0.001, 0.8]], 10, null, ci + 1.2, y1 + 4.3, zm));                                       // the head
  bag.add('gilt_bronze', lathe([[0.001, 0], [0.34, 0], [0.4, 0.5], [0.36, 0.85], [0.001, 0.85]], 10, null, ci + 1.2, y1 + 5.0, zm));                                   // the modius on the head (wheat-measure)
  bag.add('ivory', rod([ci + 1.6, y1 + 3.4, zm - 0.7], [ci + 2.3, y1 + 4.0, zm - 1.8], 0.12, 5));
  bag.add('bronze', rod([ci + 2.6, y1 + 1.0, zm + 2.0], [ci + 2.6, y1 + 5.6, zm + 2.0], 0.06, 5));       // the sceptre
  for (const dz of [-0.5, 0, 0.5]) bag.add('granite_black', lathe([[0.001, 0], [0.16, 0.03], [0.18, 0.3], [0.001, 0.38]], 6, null, ci + 3.1, y1 + 1.0 + 0.22, zm + 2.0 + dz * 0.3));   // Cerberus's three heads at his side
  bag.add('granite_black', box(ci + 2.7, y1 + 1.0, zm + 1.6, ci + 3.4, y1 + 1.5, zm + 2.4));
  // two rows of columns down the nave (simple Doric, painted), their beams
  for (const sz of [-9, 9]) for (let x = xc0 + 9; x < xc1 - 3; x += 6.2) STYLES.greek.column({ at: [x, zm + sz], y: y1, h: colH - 0.4, d: 0.9, mat: 'marble_column', flutes: 0, simple: true }, ctx);
  for (const sz of [-9, 9]) { bag.add('cedar', box(xc0 + 8, y1 + colH - 0.4, zm + sz - 0.45, xc1 - 2, y1 + colH + 0.2, zm + sz + 0.45)); }
  // the altar of offerings before the god, tables of offerings, incense, lampstands (two lit), stelae and benches along the walls
  bag.add('limestone', box(ci + 6.2, y1, zm - 1.0, ci + 8.0, y1 + 1.0, zm + 1.0)); bag.add('bronze', lathe([[0.001, 0], [0.5, 0.05], [0.55, 0.3], [0.001, 0.3]], 8, null, ci + 7.1, y1 + 1.0, zm)); bag.add('flame', lathe([[0.001, 0], [0.2, 0.02], [0.001, 0.5]], 6, null, ci + 7.1, y1 + 1.3, zm)); col.rect([ci + 6.2, zm - 1.0, ci + 8.0, zm + 1.0], y1, y1 + 1.0);
  for (const [lx, lz] of [[ci + 4.6, zm - 3.4], [ci + 4.6, zm + 3.4]]) { bag.add('bronze', lathe([[0.001, 0], [0.2, 0], [0.12, 0.08], [0.03, 0.12], [0.025, 1.7], [0.1, 1.75], [0.001, 1.75]], 8, null, lx, y1, lz)); bag.add('flame', lathe([[0.001, 0], [0.05, 0.01], [0.001, 0.2]], 5, null, lx, y1 + 1.75, lz)); col.circle(lx, lz, 0.2, y1, y1 + 1.8); if (ctx.lights) ctx.lights.push({ at: [lx, y1 + 2.0, lz], color: '#ffb46b', intensity: 4, distance: 16 }); }
  for (const sz of [-1, 1]) for (let k = 0; k < 4; k++) { const x = xc0 + 6 + k * 9, z = sz > 0 ? zc1 - 1.2 : zc0 + 1.2; bag.add('marble_smooth', box(x - 0.3, y1, z - 0.12, x + 0.3, y1 + 1.8, z + 0.12)); bag.add('limestone', box(x - 0.4, y1, z - 0.2, x + 0.4, y1 + 0.3, z + 0.2)); col.rect([x - 0.4, z - 0.2, x + 0.4, z + 0.2], y1, y1 + 1.8); }
  for (let k = 0; k < 5; k++) { const x = xc0 + 12 + k * 7.5, z = zm + (k % 2 ? 3 : -3); bag.add('cedar', box(x - 0.6, y1 + 0.7, z - 0.4, x + 0.6, y1 + 0.78, z + 0.4)); for (const dx of [-0.5, 0.5]) bag.add('wood_dark', box(x + dx - 0.04, y1, z - 0.35, x + dx + 0.04, y1 + 0.7, z + 0.35)); col.rect([x - 0.6, z - 0.4, x + 0.6, z + 0.4], y1, y1 + 0.78); bag.add('bronze', lathe([[0.001, 0], [0.1, 0.01], [0.12, 0.09], [0.001, 0.08]], 6, null, x, y1 + 0.78, z)); }
  // the altar before the front: a block of limestone with horns, where the incense burns
  const ax = x1 + st * tread + 4, az = (z0 + z1) / 2;
  bag.add('limestone', box(ax - 1.0, y, az - 0.8, ax + 1.0, y + 1.2, az + 0.8)); bag.add('limestone', box(ax - 1.2, y + 1.2, az - 1.0, ax + 1.2, y + 1.4, az + 1.0)); col.rect([ax - 1.2, az - 1.0, ax + 1.2, az + 1.0], y, y + 1.4);
  bag.add('flame', lathe([[0.001, 0], [0.25, 0.02], [0.1, 0.4], [0.001, 0.6]], 6, null, ax, y + 1.4, az));
  void rod;
}
export const SERAPEUM = { pylon, sphinx, serapeum_temple: temple };
