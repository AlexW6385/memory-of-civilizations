// Tibetan architecture (17th c.; docs/settlements/lhasa.md §4): blocks of stone with battered walls,
// limewashed white or red, their faces cut by rows of windows in black trapezoid frames, crowned
// with a dark frieze of tamarisk (pembe) and a parapet; gilded roofs with victory banners; stairs up
// the hill; flat-roofed whitewashed houses with prayer-flag poles.

import { registerStyle, STYLES } from '../../core/build.js';
import { box, frustum, lathe, fromTriangles } from '../../core/geom.js';
import { rectRoof, beamTris } from '../ming/index.js';
import '../qing/index.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
/** Windows in black trapezoid frames on the faces of a battered block. */
function windows(bag, [x0, z0, x1, z1], y0, y1, b, faces = 'nesw', rand = Math.random, step = 3.2, rowH = 3.4) {
  const H = y1 - y0;
  for (const f of faces) {
    const [ax, az, bx, bz, nx, nz] = { s: [x0, z1, x1, z1, 0, 1], n: [x0, z0, x1, z0, 0, -1], e: [x1, z0, x1, z1, 1, 0], w: [x0, z0, x0, z1, -1, 0] }[f];
    const L = Math.hypot(bx - ax, bz - az), n = Math.floor(L / step);
    for (let r = 1; r * rowH < H - 3; r++) {
      const y = y0 + r * rowH, inset = b * (y - y0) / H, upper = y > y0 + H * 0.45;
      for (let k = 1; k < n; k++) {
        if (!upper && rand() < 0.75) continue;
        const s = k * L / n, px = ax + (bx - ax) * s / L - nx * (inset - 0.03), pz = az + (bz - az) * s / L - nz * (inset - 0.03), ux = (bx - ax) / L, uz = (bz - az) / L, t = [];
        beamTris(t, [px - ux * 0.55, y, pz - uz * 0.55], [px + ux * 0.55, y, pz + uz * 0.55], 0.06, 1.3); bag.add('lacquer_black', fromTriangles(t));
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
  dzong({ rect: el.rect, y0: y - 0.5, y1: y + st * 3, batter: 0.35, mat: 'limewash_white', windows: 'ns', pembe: 0.6, seed: el.seed }, ctx);
  const [x0, z0, x1, z1] = el.rect;
  bannerPole({ c: [x0 + 1, z0 + 1], y: y + st * 3, h: 3.5 }, ctx);
}

registerStyle('tibetan', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.qing.elements, dzong, golden_roof: goldenRoof, banner_pole: bannerPole, tibetan_house: house },
  objects: {},
});
