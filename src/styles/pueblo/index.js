// Pueblo architecture of Taos (c. 1000–1500; docs/settlements/taos.md §4): rooms of sun-dried adobe
// stacked in terraces of up to five storeys, each storey set back from the one below; thick walls
// plastered red-brown, roofs of packed earth on vigas whose ends show on the faces, low parapets,
// ladders leaning up to the terraces and poking out of the roof hatches; kivas round and half sunk;
// drying racks of poles; the perimeter wall.

import { registerStyle, STYLES } from '../../core/build.js';
import { box, lathe, fromTriangles } from '../../core/geom.js';
import { beamTris } from '../ming/index.js';
import '../qing/index.js';

const A = 'adobe_taos', V = 'viga';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const ST = 2.7;
function ladder(bag, x, y, z, h, dx, dz) {
  for (const s of [-0.28, 0.28]) { const t = []; beamTris(t, [x - dz * s, y, z + dx * s], [x - dz * s + dx * 0.6, y + h, z + dx * s + dz * 0.6], 0.04, 0.08); bag.add(V, fromTriangles(t)); }
  for (let k = 1; k < h / 0.4; k++) { const f = k * 0.4 / h, t = []; beamTris(t, [x - dz * 0.28 + dx * 0.6 * f, y + h * f, z + dx * 0.28 + dz * 0.6 * f], [x + dz * 0.28 + dx * 0.6 * f, y + h * f, z - dx * 0.28 + dz * 0.6 * f], 0.025, 0.05); bag.add(V, fromTriangles(t)); }
}

/**
 * pueblo_block: a terraced house block { x0, z0, cell, heights: [[storeys by column] by row], front
 * ('s'|'n': the side the terraces step down to), seed }: each cell a stack of rooms; parapets on the
 * edges of every roof; viga ends along the faces; ladders on the terraces; doors and windows.
 */
function pueblo(el, { bag, col }) {
  const rand = rng(el.seed || 1), c = el.cell, H = el.heights, rows = H.length, cols = H[0].length;
  const at = (i, j) => (i >= 0 && i < rows && j >= 0 && j < cols ? H[i][j] : 0);
  for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) {
    const n = H[i][j]; if (!n) continue;
    const x0 = el.x0 + j * c, z0 = el.z0 + i * c, x1 = x0 + c, z1 = z0 + c, top = n * ST;
    bag.add(A, box(x0, 0, z0, x1, top, z1)); col.rect([x0, z0, x1, z1], 0, top); col.floor([x0, z0, x1, z1], top);
    // the edges where this roof stands above its neighbour: a parapet; the faces below: vigas, openings
    for (const [di, dj, a, b, nx, nz] of [[-1, 0, [x0, z0], [x1, z0], 0, -1], [1, 0, [x0, z1], [x1, z1], 0, 1], [0, -1, [x0, z0], [x0, z1], -1, 0], [0, 1, [x1, z0], [x1, z1], 1, 0]]) {
      const m = at(i + di, j + dj);
      if (m >= n) continue;
      const t = []; beamTris(t, [a[0] - nx * 0.15, top, a[1] - nz * 0.15], [b[0] - nx * 0.15, top, b[1] - nz * 0.15], 0.15, 0.55); bag.add(A, fromTriangles(t));
      for (let s = m + 1; s <= n; s++) {
        const y = s * ST - 0.35;
        for (let k = 0; k < 4; k++) { const f = (k + 0.5) / 4, px = a[0] + (b[0] - a[0]) * f + nx * 0.2, pz = a[1] + (b[1] - a[1]) * f + nz * 0.2; bag.add(V, box(px - 0.1, y - 0.1, pz - 0.1, px + 0.1, y + 0.1, pz + 0.1)); }
        if (rand() < 0.6) { const f = 0.3 + rand() * 0.4, px = a[0] + (b[0] - a[0]) * f + nx * 0.03, pz = a[1] + (b[1] - a[1]) * f + nz * 0.03, w = s === m + 1 && rand() < 0.4 ? 0.45 : 0.3, hh = w > 0.4 ? 1.7 : 0.55, yy = (s - 1) * ST + (w > 0.4 ? 0.1 : 1.2), tt = []; beamTris(tt, [px - Math.abs(nz) * w, yy, pz - Math.abs(nx) * w], [px + Math.abs(nz) * w, yy, pz + Math.abs(nx) * w], 0.03, hh); bag.add('lacquer_black', fromTriangles(tt)); }
      }
    }
    // a ladder on this roof up to the next storey, or poking out of a hatch
    const f = el.front === 'n' ? -1 : 1, up = at(i - f, j);
    if (up > n && rand() < 0.45) ladder(bag, x0 + c * (0.3 + rand() * 0.4), top, el.front === 'n' ? z0 + 0.7 : z1 - 0.7, ST + 0.8, 0, -f);
    else if (n === at(i + f, j) + 0 && rand() < 0.15) { const hx = x0 + c / 2, hz = z0 + c / 2; ladder(bag, hx, top - 1, hz, 3, 0, 1); }
  }
}

/** kiva: a round kiva { c, r }: a low round wall a little above the ground, the earthen roof, the ladder's poles out of its hatch. */
function kiva(el, { bag, col }) {
  const [x, z] = el.c, r = el.r;
  bag.add(A, lathe([[r, -0.5], [r, 1.1], [r - 0.3, 1.3], [0.001, 1.3]], 24, null, x, 0, z)); col.circle(x, z, r, 0, 1.3); col.floor([x - r * 0.7, z - r * 0.7, x + r * 0.7, z + r * 0.7], 1.3);
  bag.add('lacquer_black', box(x - 0.8, 1.31, z - 0.8, x + 0.8, 1.33, z + 0.8));
  for (const s of [-0.4, 0.4]) { const t = []; beamTris(t, [x + s, 0.5, z], [x + s * 1.4, 5.5, z + 0.5], 0.06, 0.1); bag.add(V, fromTriangles(t)); }
}

/** rack: a drying rack of poles { a, b, h } with cross poles. */
function rack(el, { bag, col }) {
  const [a, b] = [el.a, el.b], h = el.h ?? 3, L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(2, Math.round(L / 3) + 1);
  for (let k = 0; k < n; k++) { const f = k / (n - 1), x = a[0] + (b[0] - a[0]) * f, z = a[1] + (b[1] - a[1]) * f; for (const o of [-1, 1]) bag.add(V, lathe([[0.08, 0], [0.07, h]], 6, null, x + o * 0, h * 0, z + o * 1.2)); col.circle(x, z - 1.2, 0.1, 0, h); col.circle(x, z + 1.2, 0.1, 0, h); }
  for (const zo of [-1.2, 1.2]) { const t = []; beamTris(t, [a[0], h, a[1] + zo], [b[0], h, b[1] + zo], 0.06, 0.12); bag.add(V, fromTriangles(t)); }
  for (let k = 0; k < L / 0.8; k++) { const f = k * 0.8 / L, x = a[0] + (b[0] - a[0]) * f, z = a[1] + (b[1] - a[1]) * f, t = []; beamTris(t, [x, h + 0.12, z - 1.4], [x, h + 0.12, z + 1.4], 0.04, 0.06); bag.add(V, fromTriangles(t)); }
}

/** adobe_wall: the perimeter wall a→b { h }. */
function adobeWall(el, { bag, col }) { const t = []; beamTris(t, [el.a[0], 0, el.a[1]], [el.b[0], 0, el.b[1]], 0.45, el.h ?? 2); bag.add(A, fromTriangles(t)); col.segment(el.a, el.b, 0.9, 0, el.h ?? 2); }

/** log_bridge: logs laid across the creek { a, b }. */
function logBridge(el, { bag, col }) {
  const L = Math.hypot(el.b[0] - el.a[0], el.b[1] - el.a[1]), nx = -(el.b[1] - el.a[1]) / L, nz = (el.b[0] - el.a[0]) / L;
  for (const o of [-0.6, -0.2, 0.2, 0.6]) { const t = []; beamTris(t, [el.a[0] + nx * o, 0, el.a[1] + nz * o], [el.b[0] + nx * o, 0, el.b[1] + nz * o], 0.18, 0.3); bag.add(V, fromTriangles(t)); }
  col.segment(el.a, el.b, 1.6, -1, 0.3);
}

registerStyle('pueblo', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.qing.elements, pueblo_block: pueblo, kiva, rack, adobe_wall: adobeWall, log_bridge: logBridge },
  objects: {},
});
