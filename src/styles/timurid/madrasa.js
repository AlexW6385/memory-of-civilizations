// The Ulugh Beg Madrasa (1417–1420; docs/settlements/timurid-samarkand.md §2, §7): a block { rect: [x0, z0, x1, z1] } whose front
// faces east (x1) on the Registan. Pishtaq over the middle two thirds of the front, twice the height of the two-storey
// building; four tiled minarets at the corners; domed halls at the corners (the north-east one the classroom, entered
// and furnished); a court of 48 × 36 m with a two-storey arcade, an iwan at the middle of each side, ground-floor cells
// (hujra) behind the arcade (the third from the entrance on the north side furnished); the mosque at the west.

import { box, lathe } from '../../core/geom.js';
import { orientedBox } from '../../core/build.js';
import { arcadeWall } from '../mughal/index.js';
import * as F from '../mughal/furnish.js';
import { B, LAP, TUR, CRE, WHI, solid, wallRun, bannai, tiledMinaret, pishtaqOf } from './kit.js';
import { nicheWall, domeBlock } from './monuments.js';
import { frame } from './frame.js';
import { prayerHall } from './interiors.js';

const H1 = 6.5, TOP = 14.5, FLOOR2 = 7.0;

export function madrasa(el, ctx) {
  const { bag, col, lights } = ctx, [X0, Z0, X1, Z1] = el.rect;
  const E = 14, W = 14, NS = 10, cx0 = X0 + W, cx1 = X1 - E, cz0 = Z0 + NS, cz1 = Z1 - NS, zm = (Z0 + Z1) / 2;
  const court = [cx0, cz0, cx1, cz1], centre = [(cx0 + cx1) / 2, zm];
  // ---- the court: paved, a low marble curb round a bed of paving
  bag.add('brick_paving', box(cx0, 0, cz0, cx1, 0.06, cz1));
  // ---- the outer faces: two tiers of niches under a Kufic band, the marble plinth
  nicheWall({ a: [X0 + 0.6, Z0], b: [X0 + 0.6, Z1], facing: centre, h: TOP, th: 1.2, bay: 3.9 }, ctx);
  nicheWall({ a: [X0, Z0 + 0.6], b: [X1, Z0 + 0.6], facing: centre, h: TOP, th: 1.2, bay: 3.8 }, ctx);
  nicheWall({ a: [X0, Z1 - 0.6], b: [X1, Z1 - 0.6], facing: centre, h: TOP, th: 1.2, bay: 3.8 }, ctx);
  // the front: wings north and south of the pishtaq (its width two thirds of the front)
  const pw = (Z1 - Z0) * 2 / 3, pz0 = zm - pw / 2, pz1 = zm + pw / 2;
  nicheWall({ a: [X1 - 0.6, Z0], b: [X1 - 0.6, pz0], facing: centre, h: TOP, th: 1.2, bay: 4.6 }, ctx);
  nicheWall({ a: [X1 - 0.6, pz1], b: [X1 - 0.6, Z1], facing: centre, h: TOP, th: 1.2, bay: 4.6 }, ctx);
  // the great pishtaq: 30 m, its iwan 22 m, passing through to the court
  pishtaqOf({ a: [X1 - 0.6, pz1], b: [X1 - 0.6, pz0], facing: [X1 + 50, zm], y: 0, h: 30, depth: E - 0.6, th: 1.2, iwan: { w: 13, h: 22, depth: 8, pass: true, doorH: 6.2 } }, ctx);
  // ---- the four corner minarets
  for (const [x, z] of [[X1, Z0], [X1, Z1], [X0, Z0], [X0, Z1]]) tiledMinaret(bag, col, { c: [x, z], y: 0, h: 33, r: 2.3 });
  // ---- the wings round the court: solid ranges of rooms under the roof, the roof's parapet
  for (const s of [-1, 1]) {
    const sz = s < 0 ? [Z0 + 2.4, cz0] : [cz1, Z1 - 2.4];
    // cells and gallery: floors, partitions, front walls with doors, ceilings
    const zb = s < 0 ? Z0 + 2.4 : Z1 - 2.4, zc = s < 0 ? zb + 3.6 : zb - 3.6;            // the cells' back and front
    const zf = s < 0 ? zc + 0.5 : zc - 0.5, zg = s < 0 ? cz0 - 0.8 : cz1 + 0.8;            // front wall's other face; the gallery's court side
    const iw = [centre[0] - 4.5, centre[0] + 4.5];                                         // the iwan at the wing's middle
    const ranges = [[cx0, iw[0]], [iw[1], cx1]];
    for (const [xa, xb] of ranges) solid(bag, col, B, [xa, Math.min(zb, zg), xb, Math.max(zb, zg)], FLOOR2 - 0.5, TOP - 1.0);
    const bays = [];
    for (const [xa, xb] of [[cx0, iw[0]], [iw[1], cx1]]) {
      const n = Math.round((xb - xa) / 3.9), w = (xb - xa) / n;
      for (let i = 0; i < n; i++) bays.push([xa + i * w, xa + (i + 1) * w]);
    }
    for (const [i0, i1] of bays) {
      const xc = (i0 + i1) / 2;
      // the cell: partition either side (shared), door in the front wall
      solid(bag, col, B, [i0 - 0.2, Math.min(zb, zf), i0 + 0.2, Math.max(zb, zf)], 0, 4.4);
      wallRun(bag, col, B, 'x', i0 + 0.2, i1 - 0.2, (zc + zf) / 2, 0.5, 0, 4.4, [[xc, 1.2, 2.3]]);
      if (Math.abs(i1 - cx1) < 1e-6 || Math.abs(i1 - iw[0]) < 1e-6) solid(bag, col, B, [i1 - 0.2, Math.min(zb, zf), i1 + 0.2, Math.max(zb, zf)], 0, 4.4);
      // the door leaf, folded open against the jamb, and a small window grille over it
      bag.add('wood_dark', box(xc - 0.55, 0, (zc + zf) / 2 - 0.04 + (s < 0 ? 0.3 : -0.3), xc - 0.5, 2.25, (zc + zf) / 2 + 0.04 + (s < 0 ? 0.3 : -0.3)));
      bag.add('lattice', box(xc - 0.5, 2.5, Math.min(zc, zf) + 0.1, xc + 0.5, 3.4, Math.max(zc, zf) - 0.1));
      bag.add('brick_paving', box(i0 + 0.2, 0.0, Math.min(zb, zc), i1 - 0.2, 0.05, Math.max(zb, zc)));
      // the cell's things, by the cell
      const k = bays.findIndex((q) => q === bays.find((p) => p[0] === i0)), yaw = s < 0 ? 0 : Math.PI, zin = s < 0 ? zb + 0.5 : zb - 0.5;
      F.kilim(bag, xc, 0.05, (zb + zc) / 2, 2.4, 2.2, yaw, ['cloth_red', 'cloth_indigo', 'cloth_ochre', 'cloth_white']);
      F.cushion(bag, xc - 1.0, 0.07, zin, 0.9, 0.5, 0.14, yaw, k % 2 ? 'cloth_indigo' : 'cloth_red');
      F.rahle(bag, xc + 0.5, 0.05, (zb + zc) / 2 + (s < 0 ? 0.3 : -0.3), yaw + Math.PI / 2);
      if (k % 3 === 0) F.waterJar(bag, xc + 1.2, 0.05, zin, 0.8);
      F.oilLamp(bag, lights, xc - 1.1, 1.3, zb + (s < 0 ? 0.08 : -0.08), 'terracotta', 0.8);
      // the niche (taqcha) with the books on the back wall
      bag.add('wood_dark', box(xc + 0.2, 1.0, Math.min(zb, zb + (s < 0 ? 0.12 : -0.12)), xc + 1.2, 1.9, Math.max(zb, zb + (s < 0 ? 0.12 : -0.12))));
      for (let j = 0; j < 4; j++) bag.add(j % 2 ? 'hide_brown' : 'linen', box(xc + 0.28 + j * 0.2, 1.32, zb + (s < 0 ? 0.12 : -0.2), xc + 0.42 + j * 0.2, 1.62, zb + (s < 0 ? 0.2 : -0.12)));
    }
    // the cells' roof (the floor of the upper storey) and the gallery's ceiling
    for (const [xa, xb] of ranges) {
      bag.add(B, box(xa, 4.4, Math.min(zb, zf), xb, FLOOR2 - 0.5, Math.max(zb, zf)));
      bag.add('ceiling_painted', box(xa, H1 - 0.5, Math.min(zf, zg), xb, H1, Math.max(zf, zg)));
      bag.add(B, box(xa, H1, Math.min(zf, zg), xb, FLOOR2, Math.max(zf, zg)));
      col.rect([xa, Math.min(zf, zg), xb, Math.max(zf, zg)], H1, FLOOR2);
    }
    // the arcade on the court, two tiers; the lower tier open (walked through), the upper's niches blind
    for (const [xa, xb] of [[cx0, iw[0]], [iw[1], cx1]]) {
      const a = [xa, zg + (s < 0 ? 0.4 : -0.4)], b = [xb, a[1]], L = xb - xa, n = Math.round(L / 3.9), w = L / n, ar = [];
      for (let i = 0; i < n; i++) ar.push({ at: (i + 0.5) * w, w: w * 0.7, h: 5.0, pass: true }, { at: (i + 0.5) * w, w: w * 0.56, h: 4.4, sill: FLOOR2 + 0.7, depth: 0.2, back: 'tile_lapis' });
      arcadeWall(bag, col, a, b, 0, TOP, 0.8, B, ar, [a[0], a[1] + (s < 0 ? -50 : 50)]);
      bannai(bag, { a, b, n: [0, s < 0 ? 1 : -1], d: 0.4, s0: 0.2, s1: L - 0.2, v0: TOP - 1.5, v1: TOP - 0.5, kind: 'kufic', base: LAP, ink: WHI, alt: CRE, ink2: TUR, cell: 0.5, seed: Math.round(xa) });
      bannai(bag, { a, b, n: [0, s < 0 ? 1 : -1], d: 0.4, s0: 0.2, s1: L - 0.2, v0: 5.3, v1: 6.0, kind: 'checker', base: LAP, ink: TUR, alt: WHI, cell: 0.3 });
    }
    // the iwan of the wing: a small pishtaq on the court, its mass through the wing
    const a = [iw[1], (s < 0 ? cz0 : cz1) + (s < 0 ? -0.6 : 0.6)], b = [iw[0], a[1]];
    pishtaqOf({ a, b, facing: [centre[0], centre[1]], y: 0, h: 16, depth: Math.abs((s < 0 ? Z0 : Z1) - a[1]) - 1.8, th: 1.2, iwan: { w: 6.4, h: 11, depth: 5 } }, ctx);
  }
  // ---- the east wing (the entrance's range) beside the pishtaq's passage: the corner halls, the lecture room
  const classroom = [cx1 + 1.0, Z0 + 2.4, X1 - 2.4, cz0 - 0.5];                              // x −58 … −47.4, z −25.6 … −18.5
  // the rest of the east range: solid; the classroom (north) and the south corner hall hollow only for the north one
  solid(bag, col, B, [cx1, cz1 + 0.5, X1 - 2.4, Z1 - 2.4], 0, TOP - 1.0);
  solid(bag, col, B, [cx1 - 0.5, cz1 - 0.1, X1 - 2.4, cz1 + 0.5], 0, TOP - 1.0);
  {
    // the classroom: walls (the door on the court's gallery side at its west), a painted ceiling, the furnishings
    const [rx0, rz0, rx1, rz1] = classroom, th = 0.6;
    wallRun(bag, col, 'plaster_persian', 'z', rz0, rz1, rx0 - th / 2, th, 0, 5.8, [[rz1 - 1.4, 1.5, 2.8]]);
    wallRun(bag, col, 'plaster_persian', 'x', rx0 - th, rx1 + 1.2, rz1 + th / 2, th, 0, 5.8);
    solid(bag, col, B, [rx1, rz0 - 0.2, rx1 + 1.2, rz1], 0, 5.8);
    solid(bag, col, B, [rx0 - th, rz0 - 2.4, rx1 + 1.2, rz0], 0, TOP - 1.0);
    bag.add('ceiling_painted', box(rx0, 5.8, rz0, rx1, 6.1, rz1));
    solid(bag, null, B, [rx0 - th, rz0 - 2.4, rx1 + 1.2, rz1 + th], 6.1, TOP - 1.0);
    bag.add('brick_paving', box(rx0, 0, rz0, rx1, 0.06, rz1));
    // a carpet over the floor, bolsters along the walls, the teacher's seat and the pupils' stands
    F.carpet(bag, (rx0 + rx1) / 2, 0.06, (rz0 + rz1) / 2, (rx1 - rx0) - 1.2, (rz1 - rz0) - 1.0, Math.PI / 2, 'persian');
    for (let i = 0; i < 5; i++) F.bolster(bag, rx0 + 1.3 + i * 2.0, 0.08, rz0 + 0.5, 1.2, 0.13, 0, i % 2 ? 'cloth_red' : 'cloth_indigo', 'cloth_ochre');
    for (let i = 0; i < 5; i++) F.rahle(bag, rx0 + 1.5 + i * 2.0, 0.08, (rz0 + rz1) / 2 + 0.6, Math.PI / 2);
    F.divan(bag, null, [rx1 - 0.6, rz0 + 0.8], [rx1 - 0.6, rz1 - 0.8], 0.06, [rx0, (rz0 + rz1) / 2], { h: 0.35, depth: 0.9, mattress: 'cloth_ochre' });
    F.rahle(bag, rx1 - 1.6, 0.4, (rz0 + rz1) / 2, -Math.PI / 2, { h: 0.5 });
    // a board with a geometer's figure (a circle in a square, the arcs and chords) on the north wall
    bag.add('wood_dark', box(rx0 + 2.2, 1.5, rz0 + 0.02, rx0 + 5.2, 3.5, rz0 + 0.1));
    bag.add('plaster_persian', box(rx0 + 2.3, 1.6, rz0 + 0.1, rx0 + 5.1, 3.4, rz0 + 0.12));
    for (const [xa, za, xb, zb2] of [[2.4, 1.7, 5.0, 1.78], [2.4, 3.22, 5.0, 3.3], [2.4, 1.7, 2.48, 3.3], [4.92, 1.7, 5.0, 3.3]]) bag.add('lacquer_black', box(rx0 + xa, za, rz0 + 0.12, rx0 + xb, zb2, rz0 + 0.14));
    bag.add('lacquer_black', box(rx0 + 2.4, 2.46, rz0 + 0.12, rx0 + 5.0, 2.54, rz0 + 0.14));
    bag.add('lacquer_black', box(rx0 + 3.66, 1.7, rz0 + 0.12, rx0 + 3.74, 3.3, rz0 + 0.14));
    for (const [x, z] of [[rx0 + 2, rz1 - 0.6], [rx0 + 6, rz1 - 0.6], [rx0 + 10, rz1 - 0.6]]) F.oilLamp(bag, lights, x, 1.5, z, 'bronze', 1.2);
    F.mosqueLamp(bag, lights, (rx0 + rx1) / 2, 3.3, (rz0 + rz1) / 2, 5.8, { k: 1.2, glow: 4, reach: 10 });
  }
  // ---- domes over the corner halls and the mosque; the north-east hall's dome stands over the classroom
  domeBlock({ c: [(classroom[0] + classroom[2]) / 2 + 0.6, (classroom[1] + classroom[3]) / 2 - 1.2], half: 4.6, y: TOP - 1.5, walls: false, wallH: 1.0, trans: 1.4, drum: { r: 3.8, h: 4.6 }, dome: { r: 4.6, h: 5.8, ribs: 20 } }, ctx);
  domeBlock({ c: [cx1 + 5.6, cz1 + 4.2], half: 4.6, y: TOP - 1.5, walls: false, wallH: 1.0, trans: 1.4, drum: { r: 3.8, h: 4.6 }, dome: { r: 4.6, h: 5.8, ribs: 20 } }, ctx);
  domeBlock({ c: [cx0 - 5.6, cz0 - 4.5], half: 4.6, y: TOP - 1.5, walls: false, wallH: 1.0, trans: 1.4, drum: { r: 3.8, h: 4.6 }, dome: { r: 4.6, h: 5.8, ribs: 20 } }, ctx);
  domeBlock({ c: [cx0 - 5.6, cz1 + 4.5], half: 4.6, y: TOP - 1.5, walls: false, wallH: 1.0, trans: 1.4, drum: { r: 3.8, h: 4.6 }, dome: { r: 4.6, h: 5.8, ribs: 20 } }, ctx);
  // ---- the west range: the mosque, a long hall (3.4 × 34.8 m) behind the west iwan, whose door leads into its middle bay; the mihrab on the west wall
  const hx0 = X0 + 3.6, hx1 = cx0 - 0.6 - 6.4, hz = 17.4;
  solid(bag, col, B, [hx1, cz0 - 0.1, cx0, zm - 11], 0, TOP - 1.0); solid(bag, col, B, [hx1, zm + 11, cx0, cz1 + 0.1], 0, TOP - 1.0);
  solid(bag, col, B, [hx0, zm - hz - 0.6, hx1, zm - hz], 0, TOP - 1.0); solid(bag, col, B, [hx0, zm + hz, hx1, zm + hz + 0.6], 0, TOP - 1.0);
  solid(bag, col, B, [X0 + 2.4, cz0 - 0.1, hx0, zm - hz - 0.6], 0, TOP - 1.0); solid(bag, col, B, [X0 + 2.4, zm + hz + 0.6, hx0, cz1 + 0.1], 0, TOP - 1.0);
  bag.add('ceiling_painted', box(hx0, 5.5, zm - hz, hx1 + 0.2, 5.6, zm + hz)); solid(bag, null, B, [hx0, zm - hz - 0.6, hx1 + 0.2, zm + hz + 0.6], 5.6, TOP - 1.0); col.rect([hx0, zm - hz, hx1, zm + hz], 5.6, TOP - 1.0);
  bag.add('brick_paving', box(hx0, 0, zm - hz, hx1 + 0.2, 0.06, zm + hz));
  pishtaqOf({ a: [cx0, zm - 11], b: [cx0, zm + 11], facing: centre, y: 0, h: 21, depth: 6.6, th: 1.2, iwan: { w: 10, h: 16, depth: 6, pass: true, doorH: 5 } }, ctx);
  {
    // the mosque's finish: tile dado, a lapis band and a Kufic frieze on the long walls, the mihrab on the west wall, rugs in a row facing it, lamps
    const fr = frame(ctx, 0, 0, 3), HM = zm;                                   // local (x, z) = world (z, −x): the hall's long axis is local x, the qibla local +z
    const zq = -hx0, zin = -hx1, xa = HM - hz, xb = HM + hz;
    const put = (m, x0_, y0_, x1_, y1_, zz, d) => fr.bag.add(m, box(x0_, y0_, Math.min(zz, zz + d), x1_, y1_, Math.max(zz, zz + d)));
    put('tile_turquoise', xa, 0.06, xb, 1.3, zq, -0.04); put('mosaic_gold', xa, 1.3, xb, 1.38, zq, -0.05); put('tile_lapis', xa, 1.38, xb, 1.9, zq, -0.045);
    put('tile_turquoise', xa, 0.06, xb, 1.3, zin, 0.04); put('mosaic_gold', xa, 1.3, xb, 1.38, zin, 0.05); put('tile_lapis', xa, 1.38, xb, 1.9, zin, 0.045);
    bannai(fr.bag, { a: [xa, zq], b: [xb, zq], n: [0, -1], d: 0.02, y: 0, s0: 0.2, s1: xb - xa - 0.2, v0: 4.2, v1: 5.2, kind: 'kufic', base: LAP, ink: WHI, alt: CRE, ink2: TUR, cell: 0.5, seed: 91 });
    prayerHall(fr, { c: [HM, (zq + zin) / 2], hx: hz, hz: (zq - zin) / 2, single: true, mh: 4.3, steps: 3, lampY: 3.7, lampTop: 5.5 }, fr.lights);
  }
  domeBlock({ c: [X0 + 9, zm], half: 8.5, y: TOP - 1.5, walls: false, wallH: 1.0, trans: 2.2, drum: { r: 6.2, h: 7 }, dome: { r: 7.4, h: 9, ribs: 24 } }, ctx);
  void orientedBox;
}
