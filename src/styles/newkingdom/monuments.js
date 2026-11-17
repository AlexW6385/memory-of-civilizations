// Monuments of the Karnak axis (docs/settlements/thebes.md §2, §5): the ram-headed sphinxes of the avenue, the seated
// colossi at the gate, the obelisks, the cedar flagstaffs with their banners.
import { lathe, box, frustum, fromTriangles, addCloth, place } from '../../core/geom.js';
import { glyphs, keep } from './kit.js';
import { figure } from '../egyptian/objects.js';

/** An ellipsoid (unit sphere scaled): centre, radii. */
function ellip(cx, cy, cz, rx, ry, rz, seg = 14) {
  const prof = Array.from({ length: 9 }, (_, i) => { const t = Math.PI * i / 8; return [Math.max(0.001, Math.sin(t)), -Math.cos(t)]; });
  const g = lathe(prof, seg); g.scale(rx, ry, rz); g.translate(cx, cy, cz); return g;
}

export { ram } from './sphinx.js';
export { colossus } from './statue.js';
/**
 * obelisk: { at, y, h, w (base width) } — one monolith of red granite, tapering to a gilded pyramidion: on a stepped base of sandstone, the lines of the dedication
 * round the foot, one column of signs down the middle of each face between its ruled borders, under the pyramidion the king offering to Amun on each face.
 */
export function obelisk(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, h = el.h, w = el.w ?? h / 10.9, top = 0.62, ph = w * top * 1.4;
  const half = (v) => w / 2 * (1 - (1 - top) * v / (h - ph));
  const st = Math.min(0.5, w * 0.2);
  bag.add('sandstone_floor', box(x - w * 1.25, y, z - w * 1.25, x + w * 1.25, y + st, z + w * 1.25));
  bag.add('sandstone_dressed', box(x - w * 0.95, y + st, z - w * 0.95, x + w * 0.95, y + st * 2, z + w * 0.95));
  const y0 = y + st * 2, hs = h - ph - st * 2;
  bag.add('granite_red', frustum([x - w / 2, z - w / 2, x + w / 2, z + w / 2], y0, y0 + hs, w / 2 * (1 - top), w / 2 * (1 - top), w / 2 * (1 - top), w / 2 * (1 - top), { noBottom: true }));
  bag.add('gold', frustum([x - w * top / 2, z - w * top / 2, x + w * top / 2, z + w * top / 2], y0 + hs, y0 + hs + ph, w * top / 2 - 0.02, w * top / 2 - 0.02, w * top / 2 - 0.02, w * top / 2 - 0.02));
  bag.add('gold', box(x - w * top / 2 - 0.03, y0 + hs - 0.06, z - w * top / 2 - 0.03, x + w * top / 2 + 0.03, y0 + hs + 0.06, z + w * top / 2 + 0.03));       // the gilded collar where the pyramidion sits
  const T = [], F = [];
  const gw = w * 0.1, sc = w * 0.6;                                                         // a sign's width; the scenes' height
  for (let f = 0; f < 4; f++) {
    const a = f * Math.PI / 2, c = Math.cos(a), s = Math.sin(a), N = [c, s];
    const pl = (u, v, d) => { const r = half(v) + 0.012 + d; return [x + c * r - s * u, y0 + v, z + s * r + c * u]; };
    const FT = [];
    // the column down the middle (ruled either side) from over the foot's lines to under the scene
    const vTop = hs - sc * 1.9 - 0.8, vLow = Math.min(4.2, hs * 0.18) + 0.5;
    glyphs(FT, pl, 0, vLow, vTop, gw, f * 31 + 5, 0.028);
    for (const sd of [-1, 1]) glyphs(FT, pl, sd * w * 0.27, vLow, vTop - sc * 0.3, gw * 0.75, f * 31 + 9 + sd, 0.026);
    for (const sd of [-1, 1]) for (const du of [0.02]) { const u = sd * gw * 0.7; FT.push(...pl(u - du, vLow, 0.028), ...pl(u + du, vLow, 0.028), ...pl(u + du, vTop, 0.028), ...pl(u - du, vLow, 0.028), ...pl(u + du, vTop, 0.028), ...pl(u - du, vTop, 0.028)); }
    // the lines of the dedication about the foot, a row of small signs each (read round the four faces)
    const lines = 5, lh = Math.min(4.0, hs * 0.14) / lines;
    for (let k = 0; k < lines; k++) { const v = 0.6 + k * lh; glyphs(FT, (u, vv, d) => pl(vv, u + v, d), 0, -half(v) * 0.86, half(v) * 0.86, lh * 0.5, f * 7 + k, 0.02); }
    T.push(...keep(FT, N));
    // the scene under the pyramidion: Amun seated, the king standing before him, ruled ground line, a column of text over each
    const vs = hs - sc * 1.35, sf = [];
    const fp = (u, v, d) => pl(u, v, d + 0.012);
    figure({ add: (m, g) => sf.push(g) }, 'x', 'seated', fp, -w * 0.12, vs, sc * 0.95, 1, 0.026);
    figure({ add: (m, g) => sf.push(g) }, 'x', 'offer', fp, w * 0.12, vs, sc * 0.95, -1, 0.026);
    for (const g of sf) { const q = g.index ? g.toNonIndexed() : g; F.push(...keep(Array.from(q.attributes.position.array), N)); }
    const GT = []; glyphs(GT, fp, -w * 0.02, vs + sc * 0.5, vs + sc * 0.98, gw * 0.7, f * 5 + 2, 0.026); F.push(...keep(GT, N));
  }
  if (T.length) bag.add('lacquer_black', fromTriangles(T));
  if (F.length) bag.add('lacquer_black', fromTriangles(F));
  col.rect([x - w * 1.25, z - w * 1.25, x + w * 1.25, z + w * 1.25], y, y + h);
}
/** A ribbon of cloth hanging from `top`, `L` long, tapering from w0 to w1, its end cut in a swallow-tail; the plane faces +z (both sides drawn). */
function streamer(x, z, top, L, w0, w1) {
  const n = Math.max(4, Math.round(L / 0.4)), T = [];
  const row = (i) => { const f = i / n, y = top - L * f, w = w0 + (w1 - w0) * f; return [y, w]; };
  for (let i = 0; i < n; i++) {
    const [ya, wa] = row(i), [yb, wb] = row(i + 1), fork = i >= n - 2 ? (i - (n - 3)) / 2 : 0;    // the last two rows pulled to a notch
    const a = [x - wa / 2, ya, z], b = [x + wa / 2, ya, z], c = [x + wb / 2, yb, z], d = [x - wb / 2, yb, z];
    if (fork > 0) { c[1] += 0.0; d[1] += 0.0; }
    T.push(...a, ...d, ...c, ...a, ...c, ...b, ...a, ...c, ...d, ...a, ...b, ...c);
  }
  return fromTriangles(T);
}

/**
 * nk_flagstaff: a cedar mast with its bronze-bound joints, set on a stone base in the pylon's niche and held to the wall by wooden clamps run out to
 * stone holdfasts, a gilded cap and four streamers hanging from a crossbar at the top { at, y, h, side, wall (v → the wall face's z at height v), clamps (heights) }.
 */
export function flagstaff(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, h = el.h ?? 40, side = el.side ?? 1;
  const rAt = (v) => 0.42 - 0.26 * (v / h);
  const prof = []; for (let i = 0; i <= 8; i++) { const v = h * i / 8; prof.push([rAt(v), v]); }
  bag.add('cedar', lathe(prof, 10, null, x, y, z));
  bag.add('sandstone_dressed', box(x - 0.75, y, z - 0.75, x + 0.75, y + 0.42, z + 0.75));                           // the stone base in its notch
  bag.add('sandstone_dressed', lathe([[0.62, 0.42], [0.55, 0.55], [0.46, 0.7]], 12, null, x, y, z));
  // the bronze binding: a band over the base, then every few metres a pair of bands at the joints of the timber (the mast is of pieces scarfed together)
  bag.add('bronze', lathe([[rAt(0.7) + 0.03, 0.7], [rAt(0.7) + 0.05, 0.75], [rAt(1.4) + 0.05, 1.4], [rAt(1.4) + 0.03, 1.45]], 12, null, x, y, z));
  for (let v = 4; v < h - 3; v += Math.max(4, h / 7)) {
    const r = rAt(v) + 0.045;
    bag.add('bronze', lathe([[r, v], [r + 0.025, v + 0.05], [r + 0.025, v + 0.55], [r, v + 0.6]], 10, null, x, y, z));
    bag.add('gold', lathe([[r, v + 0.7], [r + 0.02, v + 0.74], [r + 0.02, v + 0.86], [r, v + 0.9]], 10, null, x, y, z));
  }
  bag.add('gold', lathe([[0.17, 0], [0.2, 0.3], [0.1, 0.9], [0.001, 1.6]], 8, null, x, y + h, z));                   // the gilded cap
  // the holdfasts: a timber from the wall to the pole at each height, ending in a bronze collar about the pole on a block of stone set in the wall
  if (el.wall) for (const v of el.clamps ?? []) {
    const zw = el.wall(v), zp = z - rAt(v) - 0.05;
    if (zp - zw < 0.2) continue;
    bag.add('sandstone_dressed', box(x - 0.45, y + v - 0.4, zw - 0.15, x + 0.45, y + v + 0.4, zw + 0.35));
    bag.add('cedar', box(x - 0.2, y + v - 0.25, zw + 0.3, x + 0.2, y + v + 0.25, zp + 0.05));
    bag.add('bronze', lathe([[rAt(v) + 0.06, v - 0.4], [rAt(v) + 0.1, v - 0.35], [rAt(v) + 0.1, v + 0.35], [rAt(v) + 0.06, v + 0.4]], 10, null, x, y, z));
  }
  // the crossbar, and four pennants hanging from it, red, white, blue and green, of unequal length
  const top = y + h - 2.4;
  bag.add('cedar', box(x - 1.45, top, z + 0.2, x + 1.45, top + 0.1, z + 0.32));
  bag.add('gold', lathe([[0.1, 0], [0.1, 0.04], [0.04, 0.12]], 6, null, x - 1.45, top + 0.1, z + 0.26)); bag.add('gold', lathe([[0.1, 0], [0.1, 0.04], [0.04, 0.12]], 6, null, x + 1.45, top + 0.1, z + 0.26));
  [['cloth_red', -1.05, 0.62, 12.5], ['cloth_white', -0.35, 0.62, 14.5], ['cloth_blue', 0.35, 0.62, 13.5], ['cloth_white', 1.05, 0.62, 11.0]].forEach(([mat, dx, w, L], k) => {
    const Ls = Math.min(L, h * 0.45) * (el.poleH ? 1 : 1);
    addCloth(bag, mat, streamer(x + dx, z + 0.26 + 0.01 * k, top, Ls, w, w * 0.28), top);
  });
  col.circle(x, z, 0.5, y, y + h);
}

/**
 * nk_barque: the processional barque of Amun { at, y, yaw (0 = prow toward +z), len }: the gilded hull with a ram's head at prow and stern, the
 * cabin (naos) amidships under a blue canopy with its curtain, the carrying poles through the hull's sides on a pedestal of black granite.
 */
export function barque(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, yaw = el.yaw ?? 0, L = el.len ?? 4.4, hl = L / 2;
  const add = (mat, g) => { place(g, x, y, z, yaw); bag.add(mat, g); };
  add('granite_black', box(-0.9, 0, -hl - 0.1, 0.9, 0.55, hl + 0.1));                                                // the pedestal
  add('sandstone_dressed', box(-1.0, 0, -hl - 0.2, 1.0, 0.1, hl + 0.2));
  const hy = 0.55;
  for (const s of [-1, 1]) {                                                                                         // the hull's sides, rising to the two ends
    for (let i = 0; i < 6; i++) {
      const z0 = -hl + i * L / 6, z1 = z0 + L / 6, t0 = Math.abs(z0 / hl), t1 = Math.abs(z1 / hl);
      add('gold', box(s * 0.36 - 0.05, hy + 0.15 + 0.5 * t0 * t0, z0, s * 0.36 + 0.05, hy + 0.62 + 0.5 * t1 * t1, z1));
    }
  }
  add('gold', box(-0.36, hy, -hl, 0.36, hy + 0.2, hl));
  for (const s of [-1, 1]) {                                                                                         // ram heads on tall necks at both ends
    const zz = s * (hl - 0.05);
    add('gold', box(-0.07, hy + 0.5, zz - 0.07, 0.07, hy + 1.05, zz + 0.07));
    add('gold', ellip(0, hy + 1.1, zz + s * 0.1, 0.14, 0.17, 0.22, 8));
    add('gold', ellip(0, hy + 1.04, zz + s * 0.3, 0.09, 0.1, 0.16, 8));
    for (const q of [-1, 1]) add('gold', ellip(q * 0.17, hy + 1.1, zz + s * 0.05, 0.05, 0.12, 0.1, 6));
    add('egyptian_blue', lathe([[0.001, 0], [0.2, 0], [0.001, 0.05]], 8, null, 0, hy + 1.3, zz));
  }
  add('cedar', box(-0.55, hy + 0.1, -hl * 0.55, 0.55, hy + 0.2, -hl * 0.55 + 0.1)); add('cedar', box(-0.55, hy + 0.1, hl * 0.55 - 0.1, 0.55, hy + 0.2, hl * 0.55));   // the carrying poles' crossbars
  for (const s of [-1, 1]) add('cedar', box(s * 0.55 - 0.05, hy + 0.1, -hl - 0.3, s * 0.55 + 0.05, hy + 0.2, hl + 0.3));
  add('gold', box(-0.3, hy + 0.2, -0.6, 0.3, hy + 1.0, 0.6));                                                        // the naos
  add('cloth_blue', box(-0.32, hy + 1.0, -0.62, 0.32, hy + 1.08, 0.62));
  add('cloth_red', box(-0.31, hy + 0.28, -0.62, 0.31, hy + 0.95, -0.58));                                           // its curtain
  col.rect([x - hl - 0.3, z - hl - 0.3, x + hl + 0.3, z + hl + 0.3], y, y + 1.5);
}
