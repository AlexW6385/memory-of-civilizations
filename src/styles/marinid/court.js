// The Bou Inania's court as it is used (docs/settlements/fez.md §4.1): the reed mats and the book-stands where the students sit in the galleries, the lamps
// of brass hung from the lintels, the babouches left at the threshold of the prayer hall and the classrooms, the ewers and the jars at the ablution basin,
// the wet marble round it. Geometry numbers follow madrasa.js (the same rect); everything is a few boxes and lathes, merged by the bag.
import { box, lathe } from '../../core/geom.js';
import * as F from '../mughal/furnish.js';

/** A pair of babouches (slippers of yellow leather, the heel folded down) at (x, z), toes toward yaw. */
function babouche(bag, x, y, z, yaw, mat = 'hide_tan') {
  const c = Math.cos(yaw), s = Math.sin(yaw), at = (u, v) => [x + u * c + v * s, z - u * s + v * c];
  for (const side of [-1, 1]) {
    const [px, pz] = at(side * 0.065, 0);
    const g = box(-0.04, 0, -0.12, 0.04, 0.012, 0.14); g.rotateY(yaw); g.translate(px, y, pz); bag.add('hide_brown', g);
    const u = box(-0.038, 0.012, -0.0, 0.038, 0.05, 0.14); u.rotateY(yaw); u.translate(px, y, pz); bag.add(mat, u);
    const h = box(-0.036, 0.012, -0.1, 0.036, 0.022, -0.02); h.rotateY(yaw); h.translate(px, y, pz); bag.add(mat, h);
  }
}
const ring = (bag, x, y, z, r, mat, h = 0.006) => bag.add(mat, lathe([[r, 0], [r, h], [0.001, h]], 14, null, x, y, z));

export function court(el, { bag }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y, cx = (x0 + x1) / 2, t = 1.0, G = 2.4, R = 5.4;
  const cw0 = x0 + t + R + G, cw1 = x1 - t - R - G, zN = z0 + 8.0, cz0 = zN + G, cz1 = z1 - 9.6 - 0.7, zH = cz1 + 0.7, gx0 = x0 + t + R, gx1 = x1 - t - R;
  const zm = (cz0 + cz1) / 2, bx = (cw0 + cw1) / 2;
  // the students' places in the north gallery: a long mat, the book-stands before them, the master's cushion and mat at the east end
  F.reedMat(bag, cx - 4.3, y, zN + 1.25, 5.2, 1.7, 0);
  F.reedMat(bag, cx + 7.3, y, zN + 1.25, 1.9, 1.6, 0);
  for (let k = 0; k < 4; k++) F.rahle(bag, cx - 6 + k * 1.1, y + 0.01, zN + 1.2 + 0.62, Math.PI);
  F.rahle(bag, cx + 7.3, y + 0.01, zN + 1.2 + 0.6, Math.PI, { cover: 'hide_tan' });
  F.cushion(bag, cx + 7.3, y + 0.012, zN + 1.25, 0.8, 0.7, 0.14, 0.2, 'cloth_green');
  // the east gallery's circle round its reader, the west gallery's two pairs
  F.reedMat(bag, gx1 - 1.2, y, zm, 1.8, 4.2, 0);
  for (let k = 0; k < 3; k++) F.rahle(bag, gx1 - 1.9, y + 0.01, zm - 1.0 + k * 1.1, -Math.PI / 2);
  F.reedMat(bag, gx0 + 1.2, y, zm - 6.0, 1.8, 3.2, 0); F.reedMat(bag, gx0 + 1.2, y, zm + 6.0, 1.8, 3.2, 0);
  for (const dz of [-6.6, -5.4, 5.4, 6.6]) F.rahle(bag, gx0 + 0.6, y + 0.01, zm + dz, Math.PI / 2);
  F.chest(bag, gx0 + 0.45, y, zm + 8.8, 0.9, 0.5, 0.55, Math.PI / 2); F.chest(bag, gx1 - 0.45, y, zm - 8.8, 0.9, 0.5, 0.55, -Math.PI / 2);
  // the lamps of brass hung from the lintels of the galleries
  for (const dx of [-9, -3, 3, 9]) F.mosqueLamp(bag, [], cx + dx, y + 2.75, zN + 1.2, y + 3.7, { k: 0.8, glow: 0, reach: 5 });
  for (const dz of [-6, 0, 6]) { F.mosqueLamp(bag, [], gx0 + 1.2, y + 2.75, zm + dz, y + 3.7, { k: 0.8, glow: 0, reach: 5 }); F.mosqueLamp(bag, [], gx1 - 1.2, y + 2.75, zm + dz, y + 3.7, { k: 0.8, glow: 0, reach: 5 }); }
  // the babouches: left in rows at the prayer hall's bridges and on the gallery's edge at the classroom arches and the doors of the north rooms
  for (const s of [-1, 1]) for (let k = 0; k < 5; k++) if ((k + (s > 0 ? 1 : 0)) % 4 !== 3) babouche(bag, cx + s * (2.35 + k * 0.28), y + 0.02, cz1 - 0.5 - (k % 2) * 0.12, Math.PI + (k % 3 - 1) * 0.15, k % 2 ? 'hide_tan' : 'hide_brown');
  for (const [xx, yaw] of [[gx0 + 0.5, Math.PI / 2], [gx1 - 0.5, -Math.PI / 2]]) for (let k = 0; k < 3; k++) babouche(bag, xx, y + 0.01, zm - 1.2 + k * 1.1, yaw + (k - 1) * 0.2, k === 1 ? 'hide_brown' : 'hide_tan');
  for (const u of [cx - 7.2, cx + 7.2]) babouche(bag, u + 0.3, y + 0.01, zN - 0.35, 0, 'hide_tan');
  // the ablution basin: ewers on the kerb, the jars at its feet, the marble dark where the water runs
  for (const k of [1, 4, 6]) { const a = k / 8 * Math.PI * 2 + 0.39; F.ewer(bag, bx + Math.cos(a) * 1.5, y + 0.06, zm + Math.sin(a) * 1.5, 0.9, a, 'bronze'); }
  F.waterJar(bag, bx - 2.4, y, zm + 2.1, 1); F.waterJar(bag, bx + 2.3, y, zm - 2.0, 1);
  bag.add('plaster_damp', lathe([[2.25, 0], [2.25, 0.004], [1.75, 0.004]], 20, null, bx, y + 0.014, zm)); ring(bag, bx - 1.5, y + 0.016, zm + 1.9, 0.55, 'plaster_damp'); ring(bag, bx + 1.9, y + 0.016, zm - 1.4, 0.45, 'plaster_damp'); ring(bag, bx + 0.4, y + 0.016, zm + 2.2, 0.35, 'plaster_damp');
  // wear: the marble's soft grey path worn from the portal's vestibule to the hall's bridge
  bag.add('plaster_damp', box(cx - 0.6, y + 0.004, cz0, cx + 0.6, y + 0.009, cz0 + 1.6));
}
