// Tibetan architecture (17th c.; docs/settlements/lhasa.md §4): blocks of stone with battered walls,
// limewashed white or red, their faces cut by rows of windows in black trapezoid frames, crowned
// with a dark frieze of tamarisk (pembe) and a parapet; gilded roofs with victory banners; stairs up
// the hill; flat-roofed whitewashed houses with prayer-flag poles.

import { registerStyle, STYLES } from '../../core/build.js';
import { box, frustum, lathe, fromTriangles } from '../../core/geom.js';
import { rectRoof, beamTris } from '../ming/index.js';
import '../qing/index.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
/**
 * A Tibetan window on a face at (px, pz), u along the face, n out of it: the black trapezoid
 * surround (wider at the foot), the dark opening with its red frame and lattice, the painted lintel
 * of stacked beams, and the pleated cloth awning (shambu) in stripes above.
 */
function win(bag, [px, pz], [ux, uz], [nx, nz], y, s = 1, rand = Math.random) {
  const P = (u, v, d) => [px + ux * u + nx * d, y + v, pz + uz * u + nz * d];
  const quad = (mat, a, b, c, d) => bag.add(mat, fromTriangles([...a, ...b, ...c, ...a, ...c, ...d, ...a, ...c, ...b, ...a, ...d, ...c]));
  const w0 = 0.95 * s, w1 = 0.68 * s, h = 1.5 * s;
  quad('lacquer_black', P(-w0, -0.1, 0.03), P(w0, -0.1, 0.03), P(w1, h + 0.1, 0.03), P(-w1, h + 0.1, 0.03));
  quad('limewash_red', P(-0.5 * s, 0.05, 0.05), P(0.5 * s, 0.05, 0.05), P(0.5 * s, h - 0.05, 0.05), P(-0.5 * s, h - 0.05, 0.05));
  quad('opening', P(-0.42 * s, 0.12, 0.06), P(0.42 * s, 0.12, 0.06), P(0.42 * s, h - 0.12, 0.06), P(-0.42 * s, h - 0.12, 0.06));
  for (const t of [-0.14, 0.14]) quad('limewash_red', P(t * s - 0.025, 0.12, 0.07), P(t * s + 0.025, 0.12, 0.07), P(t * s + 0.025, h - 0.12, 0.07), P(t * s - 0.025, h - 0.12, 0.07));
  // the lintel: two courses of beam ends, red and green
  for (const [k, m] of [[0, 'limewash_red'], [1, 'paint_dancheong']]) { const yy = h + 0.12 + k * 0.13; quad(m, P(-0.8 * s, yy, 0.05 + k * 0.05), P(0.8 * s, yy, 0.05 + k * 0.05), P(0.8 * s, yy + 0.12, 0.05 + k * 0.05), P(-0.8 * s, yy + 0.12, 0.05 + k * 0.05)); }
  // the awning: stripes of cloth sloping out from the lintel
  const cols = [['cloth_white', 'cloth_red', 'paint_blue'], ['cloth_white', 'cloth_ochre', 'cloth_red'], ['cloth_indigo', 'cloth_white', 'cloth_red']][Math.floor(rand() * 3)];
  for (let i = 0; i < 3; i++) { const v0 = h + 0.42 - i * 0.1, v1 = v0 - 0.1, d0 = 0.12 + i * 0.12, d1 = d0 + 0.12; quad(cols[i], P(-0.82 * s, v0, d0), P(0.82 * s, v0, d0), P(0.82 * s, v1, d1), P(-0.82 * s, v1, d1)); }
}
/** Windows in black trapezoid frames on the faces of a battered block. */
function windows(bag, [x0, z0, x1, z1], y0, y1, b, faces = 'nesw', rand = Math.random, step = 3.2, rowH = 3.4) {
  const H = y1 - y0;
  for (const f of faces) {
    const [ax, az, bx, bz, nx, nz] = { s: [x0, z1, x1, z1, 0, 1], n: [x0, z0, x1, z0, 0, -1], e: [x1, z0, x1, z1, 1, 0], w: [x0, z0, x0, z1, -1, 0] }[f];
    const L = Math.hypot(bx - ax, bz - az), n = Math.floor(L / step);
    // columns of windows in bands with plain wall between, the bands' widths varying; the top two rows
    // larger (the halls and chapels), the lower walls sparsely lit
    const band = []; { let on = rand() < 0.7, left = 2 + Math.floor(rand() * 4); for (let k = 0; k <= n; k++) { band.push(on); if (--left <= 0) { on = !on; left = on ? 3 + Math.floor(rand() * 5) : 1 + Math.floor(rand() * 3); } } }
    const rows = Math.floor((H - 3) / rowH);
    for (let r = 1; r * rowH < H - 3; r++) {
      const y = y0 + r * rowH, inset = b * (y - y0) / H, upper = y > y0 + H * 0.45, top = r >= rows - 1;
      for (let k = 1; k < n; k++) {
        if (!upper && rand() < 0.8) continue;
        if (upper && !top && (!band[k] || rand() < 0.12)) continue;
        if (top && k % 2 === 0 && L > 30) continue;
        const s = k * L / n, px = ax + (bx - ax) * s / L - nx * (inset - 0.03), pz = az + (bz - az) * s / L - nz * (inset - 0.03), ux = (bx - ax) / L, uz = (bz - az) / L;
        win(bag, [px, pz], [ux, uz], [nx, nz], y, top ? 1.35 : upper ? 1.0 : 0.8, rand);
      }
    }
  }
}
/** dzong: a battered block { rect, y0, y1, batter, mat, windows ('nesw'), pembe (frieze depth), seed }. */
function dzong(el, { bag, col }) {
  const rand = rng(el.seed || 1), [x0, z0, x1, z1] = el.rect, y0 = el.y0, y1 = el.y1, b = el.batter ?? (y1 - y0) * 0.06, pe = el.pembe ?? 1.8;
  bag.add(el.mat || 'limewash_white', frustum([x0, z0, x1, z1], y0, y1 - pe, b, b, b, b));
  const r1 = [x0 + b, z0 + b, x1 - b, z1 - b];
  bag.add('pembe', box(r1[0] - 0.05, y1 - pe, r1[1] - 0.05, r1[2] + 0.05, y1 - 0.3, r1[3] + 0.05));
  bag.add(el.mat || 'limewash_white', box(r1[0] - 0.2, y1 - 0.3, r1[1] - 0.2, r1[2] + 0.2, y1, r1[3] + 0.2));
  col.rect([x0 + b / 2, z0 + b / 2, x1 - b / 2, z1 - b / 2], y0, y1); col.floor(r1, y1);
  if (el.windows !== '') windows(bag, [x0, z0, x1, z1], Math.max(y0, el.wy ?? y0), y1 - pe, b, el.windows ?? 's', rand);
}
/** golden_roof: a gilded hip-and-gable roof { rect, y } on a short red drum, banners at its corners. */
function goldenRoof(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y, w = x1 - x0, d = z1 - z0, az = d > w;
  bag.add('limewash_red', box(x0, y, z0, x1, y + 2.2, z1)); col.rect([x0, z0, x1, z1], y, y + 2.2);
  rectRoof({ c: [(x0 + x1) / 2, (z0 + z1) / 2], A: (az ? d : w) / 2 + 1.2, B: (az ? w : d) / 2 + 1.2, y: y + 2.1, rise: Math.min(w, d) * 0.4, kind: 'xieshan', sweep: 0.8, p: 1.4, alongZ: az, curl: true, mat: 'gilt_bronze', soffit: 'limewash_red' }, bag);
  for (const [x, z] of [[x0, z0], [x1, z0], [x0, z1], [x1, z1]]) bag.add('gilt_bronze', lathe([[0.5, 0], [0.55, 1.6], [0.25, 2.4], [0.001, 2.8]], 8, null, x, y + 2.2, z));
}
/** banner_pole: a prayer-flag pole { c, y, h }. */
function bannerPole(el, { bag }) { const [x, z] = el.c; bag.add('timber', lathe([[0.08, 0], [0.06, el.h ?? 4]], 6, null, x, el.y ?? 0, z)); bag.add('paint_blue', box(x, (el.y ?? 0) + (el.h ?? 4) - 1.6, z - 0.02, x + 0.9, (el.y ?? 0) + (el.h ?? 4) - 0.2, z + 0.02)); }
/** tibetan_house: { rect, seed, y }: a whitewashed house of two or three storeys, battered a little, black-framed windows, a parapet with a dark band, a flag pole on the roof. */
function house(el, ctx) {
  const rand = rng(el.seed || 1), st = rand() < 0.5 ? 2 : 3, y = el.y ?? 0;
  dzong({ rect: el.rect, y0: y - 0.5, y1: y + st * 3, batter: 0.35, mat: 'limewash_white', windows: '', pembe: 0.6, seed: el.seed }, ctx);
  const [x0, z0, x1, z1] = el.rect, H = st * 3, b = 0.35;
  // windows on each storey of the street sides, a door with its black frame below on the front
  for (const [f, ax, az, bx, bz, nx, nz] of [['s', x0, z1, x1, z1, 0, 1], ['n', x1, z0, x0, z0, 0, -1], ['e', x1, z1, x1, z0, 1, 0], ['w', x0, z0, x0, z1, -1, 0]]) {
    const L = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / L, uz = (bz - az) / L, n = Math.max(1, Math.floor(L / 3));
    for (let k = 0; k < st; k++) for (let i = 0; i < n; i++) {
      if (k === 0 && (f !== 's' || rand() < 0.6)) continue;
      const yy = y + k * 3 + 1.0, ins = b * (yy - y) / H, u = (i + 0.5) * L / n;
      win(ctx.bag, [ax + ux * u - nx * (ins - 0.03), az + uz * u - nz * (ins - 0.03)], [ux, uz], [nx, nz], yy, k === st - 1 ? 0.9 : 0.75, rand);
    }
    if (f === 's') { const u = L / 2, px = ax + ux * u - nx * 0.0, pz = az + uz * u; ctx.bag.add('lacquer_black', box(px - 0.75, y, pz - 0.02, px + 0.75, y + 2.3, pz + 0.06)); ctx.bag.add('wood_painted', box(px - 0.55, y + 0.03, pz + 0.05, px + 0.55, y + 2.1, pz + 0.08)); }
  }
  bannerPole({ c: [x0 + 1, z0 + 1], y: y + st * 3, h: 3.5 }, ctx);
  // strings of prayer flags in the five colours, from the pole to the far corners of the roof
  const FL = ['paint_blue', 'cloth_white', 'cloth_red', 'cloth_green', 'glaze_yellow'];
  for (const [ex, ez] of [[x1 - 0.4, z0 + 0.4], [x0 + 0.4, z1 - 0.4]]) {
    const ax = x0 + 1, az = z0 + 1, ay = y + H + 3.3, ey = y + H + 0.9, L = Math.hypot(ex - ax, ez - az), n = Math.floor(L / 0.45);
    for (let i = 1; i < n; i++) { const t = i / n, px = ax + (ex - ax) * t, pz = az + (ez - az) * t, py = ay + (ey - ay) * t - Math.sin(Math.PI * t) * 0.4, ux = (ex - ax) / L * 0.14, uz = (ez - az) / L * 0.14; ctx.bag.add(FL[i % 5], fromTriangles([px - ux, py, pz - uz, px + ux, py, pz + uz, px + ux, py - 0.32, pz + uz, px - ux, py, pz - uz, px + ux, py - 0.32, pz + uz, px - ux, py - 0.32, pz - uz, px - ux, py, pz - uz, px + ux, py - 0.32, pz + uz, px + ux, py, pz + uz, px - ux, py, pz - uz, px - ux, py - 0.32, pz - uz, px + ux, py - 0.32, pz + uz])); }
  }
}

registerStyle('tibetan', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.qing.elements, dzong, golden_roof: goldenRoof, banner_pole: bannerPole, tibetan_house: house },
  objects: {},
});
