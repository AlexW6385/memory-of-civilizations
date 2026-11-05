// Joseon architecture (15th c.; docs/settlements/joseon-seoul.md §4): palace halls of the qing/ming
// vocabulary with a Joseon palette — grey tiles, red columns, dancheong in green and blue, granite
// platforms — Gyeonghoeru on its 48 stone pillars, and hanok houses: L- and U-shaped wings round a
// yard in a walled lot, tiled or thatched.

import { registerStyle, STYLES } from '../../core/build.js';
import { box, lathe, fromTriangles } from '../../core/geom.js';
import { rectRoof, beamTris, withPal } from '../ming/index.js';
import '../qing/index.js';

export const JPAL = { wood: 'paint_dancheong', column: 'lacquer_red', soffit: 'paint_dancheong', base: 'granite_korea', floor: 'granite_korea', lattice: 'lattice_red', leaky: 'lattice_red', plaster: 'plaster_white', plinth: 'granite_korea', roof: 'tile_grey' };
const withJ = (fn) => (el, ctx) => fn({ ...el, pal: { ...JPAL, ...(el.pal || {}) } }, ctx);
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
function roof(bag, [x0, z0, x1, z1], y, o, kind, rise, mat, alongZ, soffit = 'paint_dancheong') {
  const w = x1 - x0 + 2 * o, d = z1 - z0 + 2 * o, az = alongZ ?? d > w;
  rectRoof({ c: [(x0 + x1) / 2, (z0 + z1) / 2], A: (az ? d : w) / 2, B: (az ? w : d) / 2, y, rise: rise ?? Math.min(w, d) * 0.3, kind, sweep: 0.6, p: 1.5, alongZ: az, curl: false, mat, soffit }, bag);
}

/** nu: Gyeonghoeru { rect, y (the island's top), bays: [7, 5], h1 (the stone storey), h2 }: 48 stone pillars (square outside, round inside), the timber upper floor open on all sides with its railing and columns, the hip-and-gable roof. */
function nu(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y, [nx, nz] = el.bays, h1 = el.h1 ?? 4.8, h2 = el.h2 ?? 4.6;
  for (let i = 0; i <= nx; i++) for (let j = 0; j <= nz; j++) {
    if (i > 1 && i < nx - 1 && j > 1 && j < nz - 1) continue;      // the innermost bays carried by the floor's beams
    const x = x0 + (x1 - x0) * i / nx, z = z0 + (z1 - z0) * j / nz, outer = i === 0 || i === nx || j === 0 || j === nz;
    if (outer) bag.add('granite_korea', box(x - 0.5, y, z - 0.5, x + 0.5, y + h1, z + 0.5));
    else bag.add('granite_korea', lathe([[0.5, 0], [0.5, h1]], 16, null, x, y, z));
    col.rect([x - 0.5, z - 0.5, x + 0.5, z + 0.5], y, y + h1);
  }
  const y2 = y + h1;
  bag.add('paint_dancheong', box(x0 - 0.6, y2, z0 - 0.6, x1 + 0.6, y2 + 0.7, z1 + 0.6)); col.floor([x0 - 0.6, z0 - 0.6, x1 + 0.6, z1 + 0.6], y2 + 0.7);
  for (let i = 0; i <= nx; i++) for (const z of [z0, z1]) { const x = x0 + (x1 - x0) * i / nx; bag.add('lacquer_red', lathe([[0.28, 0], [0.26, h2]], 10, null, x, y2 + 0.7, z)); col.circle(x, z, 0.3, y2 + 0.7, y2 + 0.7 + h2); }
  for (let j = 1; j < nz; j++) for (const x of [x0, x1]) { const z = z0 + (z1 - z0) * j / nz; bag.add('lacquer_red', lathe([[0.28, 0], [0.26, h2]], 10, null, x, y2 + 0.7, z)); col.circle(x, z, 0.3, y2 + 0.7, y2 + 0.7 + h2); }
  for (const [a, b] of [[[x0 - 0.4, z0 - 0.4], [x1 + 0.4, z0 - 0.4]], [[x0 - 0.4, z1 + 0.4], [x1 + 0.4, z1 + 0.4]], [[x0 - 0.4, z0 - 0.4], [x0 - 0.4, z1 + 0.4]], [[x1 + 0.4, z0 - 0.4], [x1 + 0.4, z1 + 0.4]]]) { const t = []; beamTris(t, [a[0], y2 + 1.5, a[1]], [b[0], y2 + 1.5, b[1]], 0.06, 0.1); bag.add('lacquer_red', fromTriangles(t)); col.segment(a, b, 0.2, y2 + 0.7, y2 + 1.6); }
  bag.add('paint_dancheong', box(x0 - 0.3, y2 + 0.7 + h2 - 0.6, z0 - 0.3, x1 + 0.3, y2 + 0.7 + h2, z1 + 0.3));
  roof(bag, [x0, z0, x1, z1], y2 + 0.7 + h2 - 0.1, 2.6, 'xieshan', (z1 - z0) * 0.42, 'tile_grey', false);
}

/** hanok: a house in its walled lot { rect, seed, thatch }: an L- or U-shaped range of rooms on a stone base, white walls between timber posts, tiled (or thatched) roofs, the lot's wall with a gate. */
function hanok(el, { bag, col }) {
  const rand = rng(el.seed || 1), [x0, z0, x1, z1] = el.rect, W = x1 - x0, D = z1 - z0, thatch = el.thatch ?? rand() < 0.35;
  const d = Math.min(5, D * 0.32), mat = thatch ? 'thatch' : 'tile_grey', h = 2.6;
  const wings = [[x0 + 1.5, z0 + 1.5, x1 - 1.5, z0 + 1.5 + d]];                    // the main range along the north side
  if (rand() < 0.7) wings.push([x0 + 1.5, z0 + 1.5 + d, x0 + 1.5 + d * 0.9, z1 - 3]);
  if (!thatch && rand() < 0.5) wings.push([x1 - 1.5 - d * 0.9, z0 + 1.5 + d, x1 - 1.5, z1 - 4]);
  for (const r of wings) {
    bag.add('granite_korea', box(r[0] - 0.3, 0, r[1] - 0.3, r[2] + 0.3, 0.6, r[3] + 0.3));
    bag.add('plaster_white', box(r[0], 0.6, r[1], r[2], 0.6 + h, r[3]));
    col.rect(r, 0, 0.6 + h);
    const along = r[2] - r[0] > r[3] - r[1];
    const n = Math.max(2, Math.round((along ? r[2] - r[0] : r[3] - r[1]) / 2.4));
    for (let k = 0; k <= n; k++) {
      const f = k / n, px = along ? r[0] + (r[2] - r[0]) * f : r[2] + 0.02, pz = along ? r[3] + 0.02 : r[1] + (r[3] - r[1]) * f;
      bag.add('timber', box(px - 0.1, 0.6, pz - 0.1, px + 0.1, 0.6 + h, pz + 0.1));
    }
    roof(bag, r, 0.6 + h - 0.05, 0.9, thatch ? 'hip' : 'xieshan', Math.min(r[2] - r[0], r[3] - r[1]) * (thatch ? 0.5 : 0.42), mat, !along, 'timber');
  }
  // the lot's wall (stone below, plaster above, a tiled coping) and its gate on the south
  const xc = (x0 + x1) / 2;
  for (const [a, b] of [[[x0, z0], [x1, z0]], [[x0, z0], [x0, z1]], [[x1, z0], [x1, z1]], [[x0, z1], [xc - 1.2, z1]], [[xc + 1.2, z1], [x1, z1]]]) {
    const t = []; beamTris(t, [a[0], 0, a[1]], [b[0], 0, b[1]], 0.25, 1.9); bag.add('plaster_grey', fromTriangles(t));
    const c = []; beamTris(c, [a[0], 1.9, a[1]], [b[0], 1.9, b[1]], 0.4, 0.25); bag.add(thatch ? 'thatch' : 'tile_grey', fromTriangles(c));
    col.segment(a, b, 0.5, 0, 2.1);
  }
}

registerStyle('joseon', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: {
    ...STYLES.qing.elements,
    ...Object.fromEntries(['ming_hall', 'qing_hall', 'ming_gallery', 'palace_wall', 'terrace', 'stairs', 'ming_pavilion', 'corner_tower', 'throne_hall'].filter((k) => STYLES.qing.elements[k]).map((k) => [k, withJ(STYLES.qing.elements[k])])),
    nu: withJ(nu), hanok: withPal(hanok),
  },
  objects: {},
});
