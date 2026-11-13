// Venetian architecture about 1500 (docs/settlements/venice.md §4): San Marco — a Greek cross under
// five domes on drums with tall lead-covered outer shells and lanterns, the west front of arches;
// the brick campanile with its belfry and green spire; the Doge's Palace — two storeys of white
// arcades carrying a wall of pink and white diamond-patterned stone; the long arcaded Procuratie;
// the two columns of the Piazzetta; canals, houses and bridges.

import { registerStyle, STYLES } from '../../core/build.js';
import { box, frustum, lathe, rod } from '../../core/geom.js';
import '../qing/index.js';
import { dogesPalace } from './palace.js';
import { gondola, palo } from './boats.js';
import { pennone } from './masts.js';
import { clockTower, procuratieOld, columnStatue } from './piazza.js';
import { horse, limb } from '../greek/sculpture.js';
import { basilicaInterior, vestibule } from './interior.js';
import { rive, rialto } from './rive.js';
import { palazzo } from './palazzo.js';
import { ponte, pozzo, squero } from './ponte.js';
import { venRoom, venFront } from './rooms.js';

const M = 'marble', B = 'brick', L = 'lead', I = 'limestone';
/** basilica: { c, s (arm length), w (arm width), h, y } — the Greek cross with its five domes, the west front. */
function basilica(el, { bag, col, lights }) {
  const [cx, cz] = el.c, S = el.s ?? 38, Wd = el.w ?? 22, H = el.h ?? 22, y = el.y ?? 0, IN = !!el.interior;
  if (!IN) for (const r of [[cx - S, cz - Wd / 2, cx + S, cz + Wd / 2], [cx - Wd / 2, cz - S * 0.8, cx + Wd / 2, cz + S * 0.8]]) { bag.add(B, box(r[0], y - 0.5, r[1], r[2], y + H, r[3])); col.rect(r, y, y + H); col.floor(r, y + H); }
  else basilicaInterior(bag, col, lights, { cx, cz, y, S, Wd, H, DX: S * 0.62, DZ: S * 0.55 });
  // the narthex and the west front of five great arches with their gables
  const f = [cx - S - 10, cz - S * 0.85, cx - S, cz + S * 0.85];
  if (!IN) { bag.add(M, box(f[0], y - 0.5, f[1], f[2], y + H * 0.7, f[3])); col.rect(f, y, y + H * 0.7); }
  // B2(z0, z1, y0, y1, d0, d1): a box on the west front, d measured outward (toward -x) from its face
  const fx = f[0], B2 = (z0, z1, y0, y1, d0, d1) => box(fx - d1, y0, z0, fx - d0, y1, z1);
  const P = (zz, yy, d) => [fx - d, yy, zz];
  const ring = (zc, yc, r0, r1, d0, d1, mat) => {                        // a round arch ring in segments
    const N = 12, t = r1 - r0, rr = (r0 + r1) / 2, len = rr * Math.PI / N + 0.04;
    for (let i = 0; i < N; i++) {
      const am = Math.PI * (i + 0.5) / N, zc2 = zc + Math.cos(am) * rr, yc2 = yc + Math.sin(am) * rr;
      const g = box(fx - d1, -t / 2, -len / 2, fx - d0, t / 2, len / 2);
      g.translate(-fx, 0, 0); g.rotateX(-(am - Math.PI / 2)); g.translate(fx, yc2, zc2);
      bag.add(mat, g);
    }
  };
  const PW = (f[3] - f[1]) / 5, spring = H * 0.38;
  for (let k = 0; k < 5; k++) {
    const zc = f[1] + (k + 0.5) * PW, big = k === 2, w = PW * (big ? 0.8 : 0.66), r = w / 2;
    // the recess: stepped archivolts, a dark door below, the gold lunette above it
    for (let st = 0; st < 3; st++) {
      const rr = r + 0.4 + st * 0.55, dd = 2.4 - st * 0.8;
      for (const sz of [-1, 1]) bag.add(M, B2(sz < 0 ? zc - rr : zc + rr - 0.55, sz < 0 ? zc - rr + 0.55 : zc + rr, y, y + spring, dd - 0.8, dd));
      ring(zc, y + spring, rr - 0.55, rr, dd - 0.8, dd, st === 1 ? 'marble_pink' : M);
    }
    if (IN && big) {                                                        // open: the vestibule behind, the porch's soffit over the way in
      vestibule(bag, col, f, zc, y, y + H * 0.7, r * 0.62, spring * 0.62);
      bag.add(M, B2(zc - (r - 0.15), zc + (r - 0.15), y + spring * 0.62, y + spring * 0.64, 0, 2.38));
      for (const sz of [-1, 1]) bag.add(M, B2(sz < 0 ? zc - r + 0.15 : zc + r * 0.62, sz < 0 ? zc - r * 0.62 : zc + r - 0.15, y - 0.3, y + spring * 0.62, 0, 0.3));
    } else bag.add('opening', B2(zc - r * 0.62, zc + r * 0.62, y, y + spring * 0.62, 2.35, 2.42));
    for (let i = 0; i < 8; i++) { const t0 = i / 8, t1 = (i + 1) / 8, hw = r * Math.sqrt(1 - t0 * t0); bag.add('mosaic_gold', B2(zc - hw, zc + hw, y + spring + r * t0, y + spring + r * t1, 2.36, 2.44)); }
    bag.add('mosaic_gold', B2(zc - r + 0.2, zc + r - 0.2, y + spring * 0.64, y + spring - 0.02, 2.36, 2.44));
    // two tiers of colonnettes on the piers between the portals
    if (k > 0) { const zp = f[1] + k * PW; for (const dz of [-0.5, 0, 0.5]) for (const [y0, y1] of [[0.6, spring * 0.5], [spring * 0.52, spring]]) bag.add(dz === 0 ? 'verde_antico' : 'marble_pink', rod(P(zp + dz, y + y0, 2.9), P(zp + dz, y + y1, 2.9), 0.18, 8)); }
    // the upper arch over the loggia: a lunette of gold mosaic under an ogee crown of crockets, a statue at its tip
    const uy = y + H * 0.72, ur = PW * 0.44;
    for (let i = 0; i < 8; i++) { const t0 = i / 8, t1 = (i + 1) / 8, hw = ur * Math.sqrt(1 - t0 * t0); bag.add('mosaic_gold', B2(zc - hw, zc + hw, uy + ur * 0.4 + ur * t0, uy + ur * 0.4 + ur * t1, -0.1, 0)); }
    bag.add('mosaic_gold', B2(zc - ur, zc + ur, uy, uy + ur * 0.4, -0.1, 0));
    for (let i = 0; i < 10; i++) {                                           // the ogee: convex then concave to a point
      const t = i / 10, t1 = (i + 1) / 10, prof = (u) => (u < 0.5 ? Math.sqrt(1 - (1 - 2 * u) ** 2) * 0.5 : 1 - Math.sqrt(1 - (2 - 2 * u) ** 2) * 0.5);
      const hw0 = (ur + 0.7) * (1 - prof(t) * 0.5 - t * 0.5), yy0 = uy + ur * 1.4 + t * ur * 1.3, yy1 = uy + ur * 1.4 + t1 * ur * 1.3;
      bag.add(M, B2(zc - hw0, zc + hw0, yy0, yy1, -0.2, 0.5));
      for (const sz of [-1, 1]) bag.add(M, lathe([[0.22, 0], [0.1, 0.35], [0.001, 0.55]], 6, null, fx - 0.2, yy0 + 0.1, zc + sz * hw0));
    }
    const tip = uy + ur * 2.7;
    bag.add(M, lathe([[0.45, 0], [0.4, 1.4], [0.25, 1.7], [0.001, 2.1]], 8, null, fx - 0.15, tip, zc));
    // tabernacles (pinnacles with a statue) between the upper arches
    if (k < 4) { const zp = f[1] + (k + 1) * PW; bag.add(M, box(fx - 1.2, uy, zp - 0.9, fx + 0.4, uy + ur * 1.5, zp + 0.9)); bag.add(M, lathe([[0.95, 0], [0.001, ur * 1.2]], 4, null, fx - 0.4, uy + ur * 1.5, zp)); }
  }
  // the loggia over the narthex: a balustrade along the top of the lower storey, the four horses in the middle
  bag.add(M, B2(f[1], f[3], y + H * 0.7 - 0.3, y + H * 0.7, 0, 1.2));
  const zm = (f[1] + f[3]) / 2, ht = 5.6;                                                 // the terrace of the horses: deeper in the middle
  for (let zz = f[1] + 0.3; zz < f[3]; zz += 0.5) if (Math.abs(zz - zm) > ht) bag.add(M, lathe([[0.1, 0], [0.16, 0.4], [0.08, 0.9]], 6, null, fx - 1.0, y + H * 0.7, zz));
  bag.add(M, B2(zm - ht, zm + ht, y + H * 0.7 - 0.45, y + H * 0.7, 1.2, 2.5));
  for (let zz = zm - ht + 0.25; zz < zm + ht; zz += 0.5) bag.add(M, lathe([[0.1, 0], [0.16, 0.4], [0.08, 0.9]], 6, null, fx - 2.3, y + H * 0.7, zz));
  bag.add(M, B2(zm - ht, zm + ht, y + H * 0.7 + 0.95, y + H * 0.7 + 1.1, 2.1, 2.5));
  for (const sz of [-1, 1]) bag.add(M, B2(zm + sz * ht - 0.2, zm + sz * ht + 0.2, y + H * 0.7, y + H * 0.7 + 1.1, 0.8, 2.5));
  bag.add(M, B2(f[1], f[3], y + H * 0.7 + 0.95, y + H * 0.7 + 1.1, 0.8, 1.2));
  // the four horses of gilt bronze on their pedestals, facing the Piazza, the outer pair turned toward the inner
  for (const [dz, turn, lift] of [[-3.9, 0.22, 1], [-1.3, 0.08, 0], [1.3, -0.08, 1], [3.9, -0.22, 0]]) {
    const hz = (f[1] + f[3]) / 2 + dz, hy = y + H * 0.7 + 0.1;
    bag.add(M, box(fx - 2.05, hy - 0.1, hz - 0.6, fx - 0.15, hy + 0.55, hz + 0.6));
    const hs = horse({ pose: 'stand', h: 1.65, mirror: true }).stone;
    // one foreleg raised (each horse lifts one): the last two pieces of a front leg bent forward
    if (lift) { hs.splice(hs.length - 8, 2, limb([-0.35 * 1.1, 1.0 * 1.1, 0.14], [-0.55 * 1.1, 0.72 * 1.1, 0.14], 0.085 * 1.1, 0.05 * 1.1, 6), limb([-0.55 * 1.1, 0.72 * 1.1, 0.14], [-0.5 * 1.1, 0.42 * 1.1, 0.14], 0.05 * 1.1, 0.035 * 1.1, 6)); }
    for (const g of hs) { g.rotateY(turn); g.translate(fx - 1.1, hy + 0.55, hz); bag.add('gilt_bronze', g); }
  }
  // the five domes: drum with windows, the tall lead outer shell, the lantern and cross
  for (const [dx, dz, r] of [[0, 0, 7.5], [-S * 0.62, 0, 6.5], [S * 0.62, 0, 6.5], [0, -S * 0.55, 6.5], [0, S * 0.55, 6.5]]) {
    const x = cx + dx, z = cz + dz;
    bag.add(B, lathe([[r, 0], [r, 3]], 16, null, x, y + H, z));
    if (IN) for (let k = 0; k < 16; k++) { const a = (k + 0.5) / 16 * Math.PI * 2, g = box(-0.03, 0, -0.32, 0.03, 1.2, 0.32); g.rotateY(-a); g.translate(x + Math.cos(a) * (r + 0.01), y + H + 0.6, z + Math.sin(a) * (r + 0.01)); bag.add('opening', g); }
    bag.add(L, lathe([[r * 1.05, 0], [r * 1.05, r * 0.4], [r * 0.95, r * 0.95], [r * 0.6, r * 1.45], [r * 0.2, r * 1.7], [0.001, r * 1.75]], 16, null, x, y + H + 3, z));
    bag.add(L, lathe([[1, 0], [1, 2], [0.4, 3.2], [0.001, 3.6]], 8, null, x, y + H + 3 + r * 1.72, z));
    bag.add('gilt_bronze', box(x - 0.08, y + H + 6.5 + r * 1.72, z - 0.08, x + 0.08, y + H + 8.5 + r * 1.72, z + 0.08));
  }
}
/** bell_tower: { c, s, h, y } — brick shaft with pilaster strips, the belfry's arches, the attic and the pyramidal green spire with its angel. */
function bellTower(el, { bag, col }) {
  const [x, z] = el.c, s = el.s ?? 12, h = el.h ?? 98, y = el.y ?? 0, sh = h * 0.5;
  bag.add(B, box(x - s / 2, y - 0.5, z - s / 2, x + s / 2, y + sh, z + s / 2)); col.rect([x - s / 2, z - s / 2, x + s / 2, z + s / 2], y, y + h);
  for (let k = -2; k <= 2; k++) for (const [ax, az] of [[1, 0], [0, 1]]) bag.add(B, box(x + (ax ? k * s / 5 - 0.3 : -s / 2 - 0.15), y, z + (az ? k * s / 5 - 0.3 : -s / 2 - 0.15), x + (ax ? k * s / 5 + 0.3 : s / 2 + 0.15), y + sh, z + (az ? k * s / 5 + 0.3 : s / 2 + 0.15)));
  bag.add(I, box(x - s / 2 - 0.3, y + sh, z - s / 2 - 0.3, x + s / 2 + 0.3, y + sh + 1.2, z + s / 2 + 0.3));
  for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) bag.add(I, box(x + dx * s * 0.42 - 0.5, y + sh + 1.2, z + dz * s * 0.42 - 0.5, x + dx * s * 0.42 + 0.5, y + sh + 10, z + dz * s * 0.42 + 0.5));
  bag.add(I, box(x - s / 2 - 0.3, y + sh + 10, z - s / 2 - 0.3, x + s / 2 + 0.3, y + sh + 11.5, z + s / 2 + 0.3));
  bag.add(B, box(x - s / 2 + 0.5, y + sh + 11.5, z - s / 2 + 0.5, x + s / 2 - 0.5, y + sh + 19, z + s / 2 - 0.5));
  bag.add('tile_green', frustum([x - s / 2 + 0.5, z - s / 2 + 0.5, x + s / 2 - 0.5, z + s / 2 - 0.5], y + sh + 19, y + h - 2, s / 2 - 0.6, s / 2 - 0.6, s / 2 - 0.6, s / 2 - 0.6));
  bag.add('gilt_bronze', lathe([[0.4, 0], [0.3, 1.5], [0.001, 2.5]], 8, null, x, y + h - 2, z));
}
registerStyle('venetian', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.qing.elements, basilica, bell_tower: bellTower, doges_palace: dogesPalace, procuratie: procuratieOld, clock_tower: clockTower, column_statue: columnStatue, gondola, palo, pennone, rive, rialto, palazzo, ponte, pozzo, squero, ven_room: venRoom, ven_front: venFront },
  objects: {},
});
