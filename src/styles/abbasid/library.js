// The House of Wisdom, as it stood about 800 (docs/settlements/abbasid-baghdad.md §6): Harun al-Rashid's Khizanat al-Hikma, a library
// before it was an academy. A walled compound of 40 × 34 m: a gate hall on the south, a court with a pool, ranges of copyists'
// rooms east and west with shaded porticos, and on the north the barrel-vaulted reading hall with its cupboards of books.
// Built in a local frame, the gate to +z.

import { box, fromTriangles, lathe } from '../../core/geom.js';
import { local, wallRun, barrel, stuccoPanel, merlons, rng, archBand, spandrel, polyGeo, archCurve } from './kit.js';
import { archway } from './palace.js';

const YAW = { s: 0, n: Math.PI, e: Math.PI / 2, w: -Math.PI / 2 };
const BOOK = ['hide_brown', 'cloth_maroon', 'hide_tan', 'cloth_green', 'hide_black', 'cloth_indigo', 'hide_brown', 'cloth_ochre'];

/** A cupboard of books against a wall at (x, z), facing +z, 1.7 m wide, 2.3 high: four shelves of codices lying flat in stacks and scrolls in a rack. */
export function bookcase(bag, col, rand, x, z, y, wd = 1.7, face = 1) {
  const dp = 0.5, h = 2.3, f = face;
  bag.add('timber', box(x - wd / 2, y, z - dp / 2, x - wd / 2 + 0.05, y + h, z + dp / 2)); bag.add('timber', box(x + wd / 2 - 0.05, y, z - dp / 2, x + wd / 2, y + h, z + dp / 2));
  bag.add('timber', box(x - wd / 2, y, z - dp / 2 + (f > 0 ? 0 : dp - 0.04), x + wd / 2, y + h, z - dp / 2 + (f > 0 ? 0.04 : dp)));
  bag.add('timber', box(x - wd / 2 - 0.03, y + h, z - dp / 2 - 0.03, x + wd / 2 + 0.03, y + h + 0.06, z + dp / 2 + 0.03));
  for (let s = 0; s < 5; s++) bag.add('timber', box(x - wd / 2, y + 0.08 + s * 0.55, z - dp / 2, x + wd / 2, y + 0.12 + s * 0.55, z + dp / 2));
  for (let s = 0; s < 4; s++) {
    const sy = y + 0.12 + s * 0.55;
    if (s === 2) {   // a rack of scrolls: rolls laid in a pile
      for (let k = 0; k < 7; k++) bag.add(k % 2 ? 'cloth_white' : 'plaster', lathe([[0.04, 0], [0.04, wd * 0.8]], 8, null, 0, 0, 0).rotateZ(Math.PI / 2).translate(x - wd * 0.4, sy + 0.05 + (k % 3) * 0.075, z - 0.12 + Math.floor(k / 3) * 0.12 * f));
      continue;
    }
    let u = x - wd / 2 + 0.08;
    for (let st = 0; st < 3; st++) {
      const n = 3 + Math.floor(rand() * 4), bw = 0.18 + rand() * 0.07, bd = 0.26 + rand() * 0.08;
      if (u + bw > x + wd / 2 - 0.05) break;
      for (let k = 0; k < n; k++) bag.add(BOOK[Math.floor(rand() * BOOK.length)], box(u, sy + k * 0.05, z - bd / 2 + (f > 0 ? 0 : 0), u + bw, sy + (k + 1) * 0.05 - 0.004, z + bd / 2));
      u += bw + 0.05;
      if (rand() < 0.5) { const hb = 0.3 + rand() * 0.15; for (let k = 0; k < 3; k++) { const mat = BOOK[Math.floor(rand() * BOOK.length)]; bag.add(mat, box(u, sy, z - 0.12, u + 0.045, sy + hb, z + 0.12)); u += 0.05; } u += 0.04; }
    }
  }
  col.rect([x - wd / 2, z - dp / 2, x + wd / 2, z + dp / 2], y, y + h);
}

/** A low writing table with a slanted top and a rahla (the X-shaped book stand) bearing a codex; pens, an inkwell, paper. */
export function desk(bag, col, rand, x, z, y, w = 2.2, d = 0.9) {
  bag.add('cedar', box(x - w / 2, y + 0.42, z - d / 2, x + w / 2, y + 0.48, z + d / 2));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) bag.add('cedar', box(x + sx * (w / 2 - 0.1) - 0.04, y, z + sz * (d / 2 - 0.1) - 0.04, x + sx * (w / 2 - 0.1) + 0.04, y + 0.42, z + sz * (d / 2 - 0.1) + 0.04));
  col.rect([x - w / 2, z - d / 2, x + w / 2, z + d / 2], y, y + 0.5);
  // the rahla: two crossed boards, the codex open on them
  bag.add('cedar', box(x - 0.3, y + 0.48, z - 0.22, x + 0.3, y + 0.5, z + 0.22)); bag.add('cedar', box(x - 0.28, y + 0.5, z - 0.2, x + 0.28, y + 0.62, z - 0.12));
  bag.add('plaster', box(x - 0.24, y + 0.5, z - 0.1, x + 0.24, y + 0.53, z + 0.18)); bag.add('hide_brown', box(x - 0.27, y + 0.49, z - 0.12, x + 0.27, y + 0.5, z + 0.2));
  // paper in a stack, an inkwell of bronze, a jar of reed pens
  for (let k = 0; k < 4; k++) bag.add('plaster_white', box(x + 0.55, y + 0.48 + k * 0.012, z - 0.2, x + 0.85, y + 0.492 + k * 0.012, z + 0.1));
  bag.add('bronze', lathe([[0.001, 0], [0.05, 0], [0.05, 0.06], [0.03, 0.07], [0.001, 0.07]], 8, null, x - 0.7, y + 0.48, z + 0.1));
  bag.add('pottery_dark', lathe([[0.001, 0], [0.05, 0], [0.045, 0.14], [0.05, 0.15], [0.001, 0.15]], 8, null, x - 0.9, y + 0.48, z - 0.1));
  for (let k = 0; k < 5; k++) bag.add('bamboo_culm', box(x - 0.92 + k * 0.012, y + 0.62, z - 0.1 + (k % 2) * 0.015, x - 0.9 + k * 0.012, y + 0.74 + (k % 3) * 0.015, z - 0.09 + (k % 2) * 0.015));
  void rand;
}

/** A celestial globe: a bronze sphere on a wooden tripod, with ecliptic and horizon bands. */
function globe(bag, col, x, z, y) {
  const R = 0.34, cy = y + 0.9;
  for (let k = 0; k < 3; k++) { const a = k / 3 * Math.PI * 2; bag.add('cedar', box(x + Math.cos(a) * 0.3 - 0.03, y, z + Math.sin(a) * 0.3 - 0.03, x + Math.cos(a) * 0.3 + 0.03, y + 0.9, z + Math.sin(a) * 0.3 + 0.03)); }
  bag.add('cedar', lathe([[0.36, 0], [0.36, 0.06], [0.3, 0.06], [0.001, 0.06]], 12, null, x, y + 0.82, z));
  bag.add('bronze', lathe(Array.from({ length: 11 }, (_, i) => { const t = i / 10 * Math.PI; return [Math.max(0.001, Math.sin(t) * R), R - Math.cos(t) * R]; }), 16, null, x, cy - R, z));
  bag.add('gilt_bronze', lathe([[R + 0.02, -0.02], [R + 0.02, 0.02]], 20).rotateZ(0.41).translate(x, cy, z));
  bag.add('gilt_bronze', lathe([[R + 0.04, -0.015], [R + 0.04, 0.015]], 20, null, x, cy, z));
  bag.add('gilt_bronze', lathe([[0.012, -R - 0.12], [0.012, R + 0.12]], 6).rotateZ(0.3).translate(x, cy, z));
  col.circle(x, z, 0.4, y, y + 1.4);
}

/** house_of_wisdom: { rect, y, face, seed } */
function houseOfWisdom(el, ctx) {
  const [cx, cz] = [(el.rect[0] + el.rect[2]) / 2, (el.rect[1] + el.rect[3]) / 2], y = el.y ?? 0, rand = rng(el.seed ?? 786), X = (el.rect[2] - el.rect[0]) / 2, Z = (el.rect[3] - el.rect[1]) / 2;
  local(ctx, [cx, cz], YAW[el.face || 's'], (c) => {
    const { bag, col, lights } = c, T = 0.9, WH = 6.2;
    // the enclosure; the gate on the south, 3.2 m wide
    wallRun(c, { a: [-X, -Z], b: [X, -Z], th: T, y0: y, y1: y + WH + 1.5, mat: 'brick_buff' });
    wallRun(c, { a: [X, -Z], b: [X, Z], th: T, y0: y, y1: y + WH, mat: 'brick_buff' });
    wallRun(c, { a: [-X, Z], b: [-X, -Z], th: T, y0: y, y1: y + WH, mat: 'brick_buff' });
    wallRun(c, { a: [-X, Z], b: [X, Z], th: T, y0: y, y1: y + WH, mat: 'brick_buff', ops: [{ at: X, w: 3.4, h: 4.6 }] });
    archBand(bag, { O: [-1.7, Z], U: [1, 0], N: [0, 1] }, 0, y, 3.4, 4.6, 0.4, T / 2, T / 2 + 0.1);
    merlons(bag, 'brick_buff', [-X, Z], [X, Z], T, y + WH, { w: 0.8, gap: 0.8, h: 0.9 });
    // gate hall deepening: a vaulted passage 4 m deep (the porter's room by it)
    bag.add('brick_buff', box(-X + 0.4, y, Z - 4, -4.0, y + WH, Z - T / 2)); bag.add('brick_buff', box(4.0, y, Z - 4, X - 0.4, y + WH, Z - T / 2));
    col.rect([-X + 0.4, Z - 4, -4.0, Z - T / 2], y, y + WH); col.rect([4.0, Z - 4, X - 0.4, Z - T / 2], y, y + WH);
    // the court: paved, a pool 4 × 9 m in the middle with a rim, paths between four beds of earth with pots of orange and pomegranate
    const cz0 = -Z + 12.4, cz1 = Z - 4.2;
    bag.add('brick_paving', box(-X + 0.45, y - 0.2, cz0, X - 0.45, y + 0.02, cz1));
    const pz = (cz0 + cz1) / 2;
    bag.add('limestone', box(-2.4, y, pz - 5.2, 2.4, y + 0.4, pz + 5.2)); bag.add('water', fromTriangles([-2.0, y + 0.3, pz - 4.8, -2.0, y + 0.3, pz + 4.8, 2.0, y + 0.3, pz + 4.8, -2.0, y + 0.3, pz - 4.8, 2.0, y + 0.3, pz + 4.8, 2.0, y + 0.3, pz - 4.8])); col.rect([-2.4, pz - 5.2, 2.4, pz + 5.2], y, y + 0.4);
    for (const sx of [-1, 1]) { bag.add('silt', box(sx * 6.5 - 2.6, y, pz - 5, sx * 6.5 + 2.6, y + 0.18, pz + 5)); col.rect([sx * 6.5 - 2.6, pz - 5, sx * 6.5 + 2.6, pz + 5], y, y + 0.18); }
    // the reading hall: x −19…19, z −Z+…: inner 10 m deep, the front arcade on the court (five arches), the vault along x
    const hz0 = -Z + 0.45, hz1 = -Z + 11.2, spring = y + 5.0, rise = 4.4;
    const fr = wallRun(c, { a: [-X + 0.45, hz1], b: [X - 0.45, hz1], th: 0.9, y0: y, y1: spring, mat: 'brick_buff', ops: [-15.5, -7.8, 0, 7.8, 15.5].map((at) => ({ at: at + X - 0.45, w: 3.8, h: 4.6 })) });
    void fr;
    for (const at of [-15.5, -7.8, 0, 7.8, 15.5]) archBand(bag, { O: [at - 1.9, hz1], U: [1, 0], N: [0, 1] }, 0, y, 3.8, 4.6, 0.38, 0.45, 0.55);
    // (a plaster sill-wall and the hall's rear wall)
    wallRun(c, { a: [-X + 0.45, hz0 + 0.45], b: [X - 0.45, hz0 + 0.45], th: 0.9, y0: y, y1: spring, mat: 'brick_buff' });
    for (const sx of [-1, 1]) { const ex = sx * (X - 0.45); const hw = (hz1 - hz0) / 2; const frE = { O: [ex, hz0], U: [0, 1], N: [sx, 0] };
      bag.add('brick_buff', polyGeo(frE, [[0, y], [hz1 - hz0, y], [hz1 - hz0, spring], ...Array.from({ length: 9 }, (_, i) => { const t = i / 8 * Math.PI; return [hw + Math.cos(t) * hw, spring + Math.sin(t) * rise]; }).reverse(), [0, spring]], -0.45, 0.45)); col.rect([Math.min(ex - 0.45, ex + 0.45), hz0, Math.max(ex - 0.45, ex + 0.45), hz1], y, y + 12); }
    barrel(bag, 'plaster_white', [-X + 0.45, hz0, X - 0.45, hz1], spring, 'x', 12, rise);
    // transverse ribs of baked brick under the vault, every 7.6 m
    for (let k = 0; k <= 5; k++) { const x = -X + 0.45 + 0.4 + k * (2 * X - 1.7) / 5; for (let i = 0; i < 10; i++) { const t0 = i / 10 * Math.PI, t1 = (i + 1) / 10 * Math.PI, hw = (hz1 - hz0) / 2, zc = (hz0 + hz1) / 2;
      const P = (t, dz) => [x, spring + Math.sin(t) * (rise - dz), zc + Math.cos(t) * (hw - dz)]; const A = P(t0, 0), B = P(t1, 0), A2 = P(t0, 0.22), B2 = P(t1, 0.22);
      bag.add('brick_baked', fromTriangles([...A, ...B, ...B2, ...A, ...B2, ...A2, ...A, ...B2, ...B, ...A, ...A2, ...B2])); } }
    bag.add('reed_mat', box(-X + 0.9, y, hz0 + 0.9, X - 0.9, y + 0.03, hz1 - 0.5));
    // the books: cupboards along the rear wall (twelve) and ends (two each), two long tables in the middle with copyists' places, rugs
    for (let k = 0; k < 12; k++) bookcase(bag, col, rand, -X + 2.4 + k * 3.1, hz0 + 0.9 + 0.3, y + 0.03, 1.7);
    for (const sx of [-1, 1]) for (let k = 0; k < 2; k++) bookcase(bag, col, rand, sx * (X - 1.4), hz0 + 3.2 + k * 3.6, y + 0.03, 1.7, 1);
    for (const sx of [-1, 1]) desk(bag, col, rand, sx * 8.5, (hz0 + hz1) / 2 + 0.4, y + 0.03, 3.2, 1.0);
    desk(bag, col, rand, 0, (hz0 + hz1) / 2 + 1.5, y + 0.03, 2.6, 0.9);
    globe(bag, col, -13.5, (hz0 + hz1) / 2 + 1.2, y + 0.03); globe(bag, col, 13.5, (hz0 + hz1) / 2 + 1.2, y + 0.03);
    for (const sx of [-1, 1]) { bag.add('cloth_maroon', box(sx * 8.5 - 2.4, y + 0.03, (hz0 + hz1) / 2 + 1.0, sx * 8.5 + 2.4, y + 0.05, (hz0 + hz1) / 2 + 3.4)); for (let k = 0; k < 3; k++) bag.add('cloth_indigo', box(sx * 8.5 - 1.8 + k * 1.3, y + 0.05, (hz0 + hz1) / 2 + 3.5, sx * 8.5 - 1.2 + k * 1.3, y + 0.2, (hz0 + hz1) / 2 + 4.1)); }
    // the hanging lamps along the vault's crown
    for (let k = 0; k < 6; k++) { const lx = -16 + k * 6.4, lz = (hz0 + hz1) / 2; bag.add('iron', box(lx - 0.01, y + 6.6, lz - 0.01, lx + 0.01, y + 9.2, lz + 0.01)); bag.add('lamp_glass', lathe([[0.001, 0], [0.13, 0.05], [0.15, 0.22], [0.001, 0.32]], 10, null, lx, y + 6.3, lz)); lights.push({ at: [lx, y + 6.4, lz], color: '#ffc27a', intensity: 5, distance: 10 }); }
    // daylight in the end walls' lunettes
    for (const sx of [-1, 1]) bag.add('daylight', box(sx * (X - 0.45) - 0.02, y + 5.4, (hz0 + hz1) / 2 - 1.2, sx * (X - 0.45) + 0.02, y + 8.0, (hz0 + hz1) / 2 + 1.2));
    // stucco in the hall: panels between the cupboards' tops and the vault's springing is left plain; the court-side piers are panelled
    for (const at of [-11.65, -3.9, 3.9, 11.65]) stuccoPanel(bag, { O: [at - 1.5, hz1], U: [1, 0], N: [0, 1] }, 0, 3.0, y + 0.4, y + 4.4, 0.04, 'stucco', 0.38);
    // east and west ranges: copyists' cells on a portico of teak posts shading the court's sides
    for (const sx of [-1, 1]) {
      const x0 = sx < 0 ? -X + 0.45 : X - 5.2, x1 = sx < 0 ? -X + 5.2 : X - 0.45, zA = hz1 + 0.6, zB = Z - 4.4;
      bag.add('brick_buff', box(x0, y - 0.3, zA, x1, y + 4.6, zB)); col.rect([x0, zA, x1, zB], y, y + 4.6);
      bag.add('plaster_white', box(x0 - 0.05, y + 4.3, zA - 0.05, x1 + 0.05, y + 4.6, zB + 0.05));
      const inner = sx < 0 ? x1 : x0, nb = 4, bw = (zB - zA) / nb;
      for (let k = 0; k < nb; k++) { const u0 = zA + k * bw + 0.5; bag.add('opening', box(sx < 0 ? inner : inner - 0.06, y, u0, sx < 0 ? inner + 0.06 : inner, y + 2.5, u0 + bw - 1.0)); }
      const px = sx < 0 ? x1 + 2.0 : x0 - 2.0;
      for (let k = 0; k <= nb; k++) { const z = zA + k * bw; bag.add('cedar', lathe([[0.2, 0], [0.17, 0.2], [0.15, 3.0], [0.2, 3.1], [0.001, 3.1]], 8, null, px, y, z)); col.circle(px, z, 0.2, y, y + 3.1); }
      bag.add('cedar', box(Math.min(inner, px) - 0.1, y + 3.1, zA - 0.1, Math.max(inner, px) + 0.1, y + 3.35, zB + 0.1));
      bag.add('palm_trunk', box(Math.min(inner, px) - 0.4, y + 3.35, zA - 0.1, Math.max(inner, px) + 0.4, y + 3.5, zB + 0.1));
      bag.add('mud_plaster', box(Math.min(inner, px) - 0.4, y + 3.5, zA - 0.1, Math.max(inner, px) + 0.4, y + 3.65, zB + 0.1));
      for (let k = 0; k < nb; k += 2) { bag.add('reed_mat', box(Math.min(inner, px) + 0.2, y, zA + k * bw + 0.3, Math.max(inner, px) - 0.2, y + 0.03, zA + (k + 1) * bw - 0.1)); desk(bag, col, rand, (inner + px) / 2, zA + k * bw + bw / 2, y + 0.03, 1.5, 0.7); }
    }
    void spandrel; void archway; void archCurve;
  });
}

export const libraryElements = { house_of_wisdom: houseOfWisdom };
