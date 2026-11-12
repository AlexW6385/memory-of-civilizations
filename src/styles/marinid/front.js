// Eye-level dressing of the Fassi house fronts (docs/settlements/fez.md §5.2): the dukkan (a shop cut into the ground floor of a house
// on a main street: a raised cell open to the lane under a cedar lintel and an awning, the goods of its trade), the wall lamp and the
// dukkana bench by a door, the plinth or the salt-stained foot, the patches where the lime has fallen from the mud wall, the rows of
// cedar beam ends under the first floor, the shuttered windows, the roofs' jars and washing, the green-tiled menzeh, and the potted
// orange tree in the court. Everything adds to a GeoBag; sized for the near level only.
import { box, lathe, rod } from '../../core/geom.js';
import { frame } from '../mamluk/kit.js';
import { q4, dbl } from './kit.js';
import { GOODS } from './souk.js';
import * as F from '../mughal/furnish.js';

const AWN = [['cloth_white', 'cloth_indigo'], ['cloth_ochre', 'cloth_white'], ['cloth_red', 'cloth_white'], ['cloth_green', 'cloth_white'], ['cloth_brown', 'cloth_ochre']];
const PATCH = ['mud_plaster', 'mud_plaster', 'brick_baked', 'plaster_white', 'limewash_white', 'plaster_ochre'];

/** A dukkan in a recess of a house's front: rr the recess's world rect, e the face it opens on, y the lane's floor. Returns where the keeper sits. */
export function dukkan(bag, col, rr, e, y, trade, rand, o = {}) {
  const fr = frame(rr, e), al = e === 'n' || e === 's', L = al ? rr[2] - rr[0] : rr[3] - rr[1], D = al ? rr[3] - rr[1] : rr[2] - rr[0];
  const I = (u0, u1, y0, y1, d0, d1) => fr.B(u0, u1, y0, y1, -d1, -d0), P = (u, d) => fr.P(u, -d), fy = y + 0.3;
  // the cell: a raised floor of boards, the lintel beam, jambs of dressed stone, the ceiling of boards
  bag.add('wood_dark', I(0, L, y - 0.3, fy, 0, D)); col.floor(rr, fy);
  bag.add('timber', I(-0.02, L + 0.02, fy - 0.04, fy + 0.03, -0.12, 0.1));
  bag.add('wood_dark', I(0, L, y + 2.72, y + 2.8, 0.05, D));
  bag.add('cedar', I(-0.16, L + 0.16, y + 2.78, y + 3.2, -0.14, 0.3));
  for (const u of [-0.16, L]) bag.add('limestone', I(u, u + 0.16, y, y + 2.78, -0.1, D));
  for (let k = 0; k < 2; k++) bag.add('cedar', I(L * (0.2 + 0.6 * k) - 0.05, L * (0.2 + 0.6 * k) + 0.05, y + 2.45, y + 2.78, -0.2, 0));
  // the shutter folded up under the lintel
  bag.add('wood_dark', I(0.05, L - 0.05, y + 2.5, y + 2.72, 0.02, 0.07));
  // the awning: striped cloth from the wall above the lintel out over the lane, held on two poles
  const [c1, c2] = AWN[Math.floor(rand() * AWN.length)], ext = Math.min(1.5, (o.laneW ?? 3) * 0.4), n = Math.max(3, Math.round((L + 0.4) / 0.28));
  const yTop = y + 3.35, yLow = y + 2.45, T = [[], []];
  for (let i = 0; i < n; i++) {
    const u0 = -0.2 + (L + 0.4) * i / n, u1 = -0.2 + (L + 0.4) * (i + 1) / n;
    const a = P(u0, -0.05), b = P(u1, -0.05), c = P(u1, -ext), d = P(u0, -ext);
    q4(T[i % 2], [a[0], yTop, a[1]], [b[0], yTop, b[1]], [c[0], yLow, c[1]], [d[0], yLow, d[1]]);
  }
  bag.add(c1, dbl(T[0])); bag.add(c2, dbl(T[1]));
  for (const u of [-0.15, L + 0.15]) { const a = P(u, -ext), b = P(u, -0.05); bag.add('cedar', rod([a[0], yLow - 0.01, a[1]], [b[0], yTop - 0.7, b[1]], 0.018, 4)); }
  // the goods, the keeper's cushion
  GOODS[trade]?.(bag, fr, P, I, fy, L, D, rand, o);
  { const [cx, cz] = P(L * 0.5, D - 0.45); F.cushion(bag, cx, fy, cz, 0.7, 0.6, 0.1, 0, rand() < 0.5 ? 'cloth_red' : 'cloth_indigo'); }
  const k = P(L * 0.5, D - 0.75);
  return { at: k, y: fy, dir: Math.atan2(fr.N[0], fr.N[1]) };
}

/** A bracket lamp on the wall beside a door at u, y above the floor. */
export function wallLamp(bag, f, u, y) {
  const a = f.R(0, 0.34, u - 0.014, u + 0.014); bag.add('iron', box(a[0], y, a[1], a[2], y + 0.035, a[3]));
  const b = f.R(0.2, 0.36, u - 0.07, u + 0.07);
  bag.add('iron', box(b[0], y - 0.26, b[1], b[2], y - 0.23, b[3])); bag.add('lamp_glass', box(b[0], y - 0.23, b[1], b[2], y - 0.05, b[3])); bag.add('iron', box(b[0], y - 0.05, b[1], b[2], y - 0.02, b[3]));
}
/** The bench of masonry (dukkana) by a door, u0..u1 along the face. */
export function bench(bag, col, f, u0, u1, y) {
  const r = f.R(0, 0.5, u0, u1); bag.add('limestone', box(r[0], y, r[1], r[2], y + 0.42, r[3])); col.rect(r, y, y + 0.44);
  const t = f.R(0, 0.54, u0 - 0.02, u1 + 0.02); bag.add('sandstone', box(t[0], y + 0.42, t[1], t[2], y + 0.46, t[3]));
}

/** The foot of a wall and its weathering: plinth of rubble or salt-stained plaster, patches of bare mud and fresh lime. holes = [[u0, u1], ..] kept clear at the foot. */
export function weather(bag, f, a, b, y, H, rand, { plinth = true, holes = [], patches = true, seed = 0 } = {}) {
  const segs = []; let s = a;
  for (const [h0, h1] of [...holes].sort((p, q) => p[0] - q[0])) { if (h0 - s > 0.4) segs.push([s, h0]); s = Math.max(s, h1); }
  if (b - s > 0.4) segs.push([s, b]);
  for (const [u0, u1] of segs) {
    if (plinth) { const r = f.R(0, 0.07, u0, u1); bag.add('rubble', box(r[0], y - 0.3, r[1], r[2], y + 0.5, r[3])); const t = f.R(0, 0.1, u0, u1); bag.add('limestone', box(t[0], y + 0.5, t[1], t[2], y + 0.55, t[3])); }
    else { const r = f.R(0, 0.012, u0, u1); bag.add('plaster_damp', box(r[0], y, r[1], r[2], y + 0.35 + rand() * 0.5, r[3])); }
  }
  if (!patches) return;
  const n = Math.max(1, Math.round((b - a) / 3.4));
  for (let k = 0; k < n; k++) {
    const w = 0.5 + rand() * 0.9, hh = 0.35 + rand() * 0.7, u = a + 0.4 + rand() * Math.max(0.1, b - a - 0.8 - w), v = y + 0.6 + rand() * Math.max(0.2, H - 2.4);
    if (holes.some(([h0, h1]) => u + w > h0 - 0.3 && u < h1 + 0.3 && v < y + 3.2)) continue;
    const d = 0.016 + 0.004 * ((k + seed) % 7), r = f.R(d, d + 0.006, u, u + w);
    bag.add(PATCH[Math.floor(rand() * PATCH.length)], box(r[0], v, r[1], r[2], v + hh, r[3]));
  }
}
/** Rows of cedar beam ends under a floor line at y (the first floor's joists carried through the wall). */
export function beamEnds(bag, f, a, b, y, holes = [], step = 1.0) {
  for (let u = a + 0.5; u < b - 0.3; u += step) { if (holes.some(([h0, h1]) => u > h0 - 0.1 && u < h1 + 0.1)) continue; const r = f.R(0, 0.26, u - 0.06, u + 0.06); bag.add('cedar', box(r[0], y, r[1], r[2], y + 0.15, r[3])); }
}
/** A window's shutters, folded back each side: u the centre, yk the sill, w the opening's width. */
export function shutters(bag, f, u, yk, w, h = 0.85, mat = 'shutter_brown') {
  for (const s of [-1, 1]) { const c = u + s * (w / 2 + 0.14), r = f.R(0.045, 0.085, c - 0.13, c + 0.13); bag.add(mat, box(r[0], yk - 0.02, r[1], r[2], yk + h + 0.02, r[3])); }
  const sl = f.R(0, 0.14, u - w / 2 - 0.04, u + w / 2 + 0.04); bag.add('limestone', box(sl[0], yk - 0.07, sl[1], sl[2], yk - 0.015, sl[3]));
}
/** A drain spout (a cedar gutter) at the parapet's foot, projecting over the lane. */
export function spout(bag, f, u, yT) {
  const r = f.R(0, 0.5, u - 0.08, u + 0.08); bag.add('cedar', box(r[0], yT + 0.25, r[1], r[2], yT + 0.33, r[3]));
}

/** A jar of baked clay on a roof or a step. */
export const jar = (bag, x, y, z, k = 1, mat = 'terracotta') => bag.add(mat, lathe([[0.001, 0], [0.12 * k, 0.01], [0.2 * k, 0.3 * k], [0.17 * k, 0.6 * k], [0.1 * k, 0.78 * k], [0.12 * k, 0.9 * k], [0.001, 0.9 * k]], 8, null, x, y, z));

/** What stands on a house's terrace roof: jars, a washing line, a stack of wood, now and then a green-tiled menzeh. The court's rim (+1.1) is kept free. */
export function roofTop(bag, r, yT, court, rand, rich, gable) {
  const [x0, z0, x1, z1] = r, cr = [court[0] - 1.1, court[1] - 1.1, court[2] + 1.1, court[3] + 1.1];
  const free = (x, z, m = 0.3) => !(x > cr[0] - m && x < cr[2] + m && z > cr[1] - m && z < cr[3] + m) && x > x0 + 0.6 && x < x1 - 0.6 && z > z0 + 0.6 && z < z1 - 0.6;
  const yr = yT + 0.2, pick = () => [x0 + 0.7 + rand() * (x1 - x0 - 1.4), z0 + 0.7 + rand() * (z1 - z0 - 1.4)];
  for (let k = 0, m = 1 + Math.floor(rand() * 3); k < m; k++) { const [x, z] = pick(); if (free(x, z)) jar(bag, x, yr, z, 0.9 + rand() * 0.5, k % 3 ? 'terracotta' : 'pottery_dark'); }
  if (rand() < 0.55) {
    // a line of washing between two posts, parallel to the longer side
    const alongX = x1 - x0 > z1 - z0, [px, pz] = pick(), len = Math.min(3.4, (alongX ? x1 - x0 : z1 - z0) - 2.0);
    if (len > 1.5 && free(px, pz) && free(alongX ? px + len : px, alongX ? pz : pz + len)) {
      const a = [px, pz], b = alongX ? [px + len, pz] : [px, pz + len];
      for (const p of [a, b]) bag.add('wood_dark', box(p[0] - 0.04, yr, p[1] - 0.04, p[0] + 0.04, yr + 1.9, p[1] + 0.04));
      bag.add('iron', rod([a[0], yr + 1.85, a[1]], [b[0], yr + 1.85, b[1]], 0.008, 3));
      const n = Math.floor(len / 0.55);
      for (let i = 0; i < n; i++) {
        const t = (i + 0.5) / n, cx = a[0] + (b[0] - a[0]) * t, cz = a[1] + (b[1] - a[1]) * t, m = ['cloth_white', 'cloth_ochre', 'cloth_indigo', 'cloth_red', 'cloth_white'][Math.floor(rand() * 5)], h = 0.7 + rand() * 0.6;
        bag.add(m, alongX ? box(cx - 0.22, yr + 1.85 - h, cz - 0.012, cx + 0.22, yr + 1.85, cz + 0.012) : box(cx - 0.012, yr + 1.85 - h, cz - 0.22, cx + 0.012, yr + 1.85, cz + 0.22));
      }
    }
  }
  if (rand() < 0.3) { const [x, z] = pick(); if (free(x, z, 0.6)) for (let k = 0; k < 3; k++) bag.add('log_pine', box(x - 0.4, yr + k * 0.12, z - 0.15 + k * 0.02, x + 0.4, yr + k * 0.12 + 0.11, z + 0.15 + k * 0.02)); }
  if (rich && x1 - x0 > 8 && z1 - z0 > 8) {
    // a menzeh: four posts and a pyramid of green tiles over a corner of the terrace
    for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
      const cx = sx > 0 ? x1 - 2.4 : x0 + 2.4, cz = sz > 0 ? z1 - 2.4 : z0 + 2.4; if (!free(cx, cz, 0.2)) continue;
      const k = 1.1; for (const [a, b] of [[-k, -k], [k, -k], [k, k], [-k, k]]) bag.add('cedar', box(cx + a - 0.06, yr, cz + b - 0.06, cx + a + 0.06, yr + 2.4, cz + b + 0.06));
      bag.add('cedar', box(cx - k - 0.12, yr + 2.4, cz - k - 0.12, cx + k + 0.12, yr + 2.52, cz + k + 0.12));
      gable(bag, [cx - k - 0.25, cz - k - 0.25, cx + k + 0.25, cz + k + 0.25], yr + 2.52, 0.9, 0.2, 'x');
      F.carpet(bag, cx, yr + 0.01, cz, 1.8, 1.8, 0); break;
    }
  }
}
/** A bitter-orange tree in a terracotta tub (the courts' planting), its crown of three blobs; fruit when `fruit`. */
export function orangeTree(bag, col, x, z, y, r = 1.0, fruit = false, seed = 1) {
  bag.add('terracotta', lathe([[0.001, 0], [0.3, 0], [0.36, 0.5], [0.4, 0.55], [0.34, 0.57], [0.001, 0.5]], 10, null, x, y, z));
  bag.add('bark_olive', lathe([[0.07, 0], [0.05, 1.0], [0.001, 1.02]], 6, null, x, y + 0.5, z));
  const blob = (cx, cy, cz, rr) => bag.add('palm_leaf', lathe(Array.from({ length: 7 }, (_, i) => { const t = i / 6 * Math.PI; return [Math.max(0.001, Math.sin(t) * rr), rr - Math.cos(t) * rr * 0.85]; }), 8, null, cx, cy, cz));
  blob(x, y + 1.35, z, r); blob(x + r * 0.45, y + 1.15, z + r * 0.2, r * 0.7); blob(x - r * 0.4, y + 1.2, z - r * 0.3, r * 0.65);
  if (fruit) for (let k = 0; k < 6; k++) { const a = seed * 1.7 + k * 1.05; bag.add('glaze_yellow', lathe([[0.001, 0], [0.07, 0.07], [0.001, 0.14]], 6, null, x + Math.cos(a) * r * 0.85, y + 1.6 + (k % 3) * 0.28, z + Math.sin(a) * r * 0.85)); }
  col.circle(x, z, 0.36, y, y + 0.5);
}
/** Pots along a wall: geranium and basil (leaf-green blobs on terracotta). */
export function potRow(bag, pts, y) {
  for (const [x, z] of pts) {
    bag.add('terracotta', lathe([[0.001, 0], [0.12, 0], [0.17, 0.3], [0.19, 0.33], [0.15, 0.33], [0.001, 0.28]], 8, null, x, y, z));
    bag.add('palm_leaf', lathe([[0.001, 0.32], [0.2, 0.36], [0.22, 0.5], [0.12, 0.62], [0.001, 0.66]], 7, null, x, y, z));
  }
}
