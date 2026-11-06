// Pueblo architecture of Taos (c. 1000–1500; docs/settlements/taos.md §4): rooms of sun-dried adobe
// stacked in terraces of up to five storeys, each storey set back from the one below; thick walls
// plastered red-brown, roofs of packed earth on vigas whose ends show on the faces, low parapets,
// ladders leaning up to the terraces and poking out of the roof hatches; kivas round and half sunk;
// drying racks of poles; the perimeter wall.

import { registerStyle, STYLES } from '../../core/build.js';
import { box, lathe, fromTriangles, rod } from '../../core/geom.js';
import { beamTris, flipTris } from '../ming/index.js';
import '../qing/index.js';

const A = 'adobe_taos', V = 'viga';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const ST = 2.7;
/**
 * A ladder of two peeled poles and lashed rungs, its foot at (x, y, z), leaning by `lean` metres
 * toward (dx, dz) over its height h, the poles running on `over` metres past the top — the long
 * ladders of the pueblo, their poles standing high above the roof edge.
 */
function ladder(bag, x, y, z, h, dx, dz, lean = 0.6, over = 1.3) {
  const px = -dz, pz = dx, len = h + over, top = (f) => [x + dx * lean * f, y + h * f, z + dz * lean * f];
  for (const s of [-0.27, 0.27]) {
    const a = top(0), b = top(len / h);
    bag.add(V, rod([a[0] + px * s, a[1], a[2] + pz * s], [b[0] + px * s * 0.85, b[1], b[2] + pz * s * 0.85], 0.045, 6));
  }
  for (let k = 1; k * 0.36 < h - 0.1; k++) { const c = top(k * 0.36 / h); bag.add(V, rod([c[0] - px * 0.3, c[1], c[2] - pz * 0.3], [c[0] + px * 0.3, c[1], c[2] + pz * 0.3], 0.025, 5)); }
}
/** A roof hatch at (x, top, z): a low coaming of adobe round the square hole, the dark room below, a ladder standing up out of it. */
function hatch(bag, col, x, top, z, rand) {
  const r = 0.5, t = 0.16, hc = 0.22;
  for (const [x0, z0, x1, z1] of [[x - r - t, z - r - t, x + r + t, z - r], [x - r - t, z + r, x + r + t, z + r + t], [x - r - t, z - r, x - r, z + r], [x + r, z - r, x + r + t, z + r]]) bag.add(A, box(x0, top - 0.05, z0, x1, top + hc, z1));
  bag.add('lacquer_black', box(x - r, top - 0.4, z - r, x + r, top + 0.025, z + r));
  col.rect([x - r - t, z - r - t, x + r + t, z + r + t], top, top + hc);
  ladder(bag, x - 0.15, top - 2.2, z, 2.2, 0, rand() < 0.5 ? 1 : -1, 0.5, 2.0);
}

/**
 * pueblo_block: a terraced house block { x0, z0, cell, heights: [[storeys by column] by row], front
 * ('s'|'n': the side the terraces step down to), seed }: each cell a stack of rooms; parapets on the
 * edges of every roof; the round ends of the vigas, which span the rooms north–south, standing out
 * of the north and south faces; few, small windows and hardly a door; ladders up to the next
 * terrace and through the hatches in the roofs.
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
      const t = []; beamTris(t, [a[0] - nx * 0.15, top, a[1] - nz * 0.15], [b[0] - nx * 0.15, top, b[1] - nz * 0.15], 0.15, 0.5); bag.add(A, fromTriangles(t));
      for (let s = m + 1; s <= n; s++) {
        const y = s * ST - 0.3;
        // the vigas: 15–25 cm logs about a metre apart, their ends left long and uneven [stated: Wikipedia "Viga"]
        if (nz) for (let k = 0; k < 5; k++) {
          const f = (k + 0.5) / 5 + (rand() - 0.5) * 0.05, out = 0.25 + rand() * 0.65, r = 0.08 + rand() * 0.04, px = a[0] + (b[0] - a[0]) * f, pz = a[1] + (b[1] - a[1]) * f;
          bag.add(V, rod([px, y, pz - nz * 0.3], [px, y - out * 0.03, pz + nz * out], r, 7));
        }
        // now and then a small window under its lintel pole; on the ground storey, rarely, a low doorway
        if (rand() < 0.45) {
          const door = s === 1 && rand() < 0.2, w = door ? 0.4 : 0.26, hh = door ? 1.45 : 0.45, yy = (s - 1) * ST + (door ? 0.15 : 1.25);
          const f = 0.3 + rand() * 0.4, px = a[0] + (b[0] - a[0]) * f, pz = a[1] + (b[1] - a[1]) * f, ux = Math.abs(nz), uz = Math.abs(nx);
          bag.add('lacquer_black', box(Math.min(px - ux * w, px + nx * 0.02), yy, Math.min(pz - uz * w, pz + nz * 0.02), Math.max(px + ux * w, px + nx * 0.02), yy + hh, Math.max(pz + uz * w, pz + nz * 0.02)));
          const ly = yy + hh + 0.07;
          bag.add(V, rod([px - ux * (w + 0.22) + nx * 0.03, ly, pz - uz * (w + 0.22) + nz * 0.03], [px + ux * (w + 0.22) + nx * 0.03, ly, pz + uz * (w + 0.22) + nz * 0.03], 0.06, 6));
        }
      }
    }
    // a ladder on this roof up to the next storey; or a hatch in the roof with its ladder poking out
    const f = el.front === 'n' ? -1 : 1, up = at(i - f, j);
    if (up > n && rand() < 0.45) ladder(bag, x0 + c * (0.3 + rand() * 0.4), top, el.front === 'n' ? z0 + 1.1 : z1 - 1.1, ST + 0.5, 0, -f, 0.75, 1.4);
    else if (n >= at(i + f, j) && n >= up && rand() < 0.28) hatch(bag, col, x0 + c * (0.35 + rand() * 0.3), top, z0 + c * (0.35 + rand() * 0.3), rand);
  }
}

/**
 * kiva: a round kiva { c, r }: a low round wall a little above the ground, its earthen roof, the
 * hatch in the middle with its raised rim, and the ladder standing up out of it, its poles tall.
 */
function kiva(el, { bag, col }) {
  const [x, z] = el.c, r = el.r, rand = rng(Math.round(x * 7 + z * 13));
  bag.add(A, lathe([[r, -0.5], [r, 1.0], [r - 0.12, 1.18], [r - 0.35, 1.28], [0.001, 1.3]], 28, (t, i) => (i > 1 ? 1 : 1 + 0.012 * Math.sin(t * 5)), x, 0, z));
  col.circle(x, z, r, 0, 1.3); col.floor([x - r * 0.7, z - r * 0.7, x + r * 0.7, z + r * 0.7], 1.3);
  hatch(bag, col, x, 1.3, z, rand);
}

/**
 * rack: a drying rack of poles { a, b, h }: pairs of uprights, two long rails, cross poles; on it
 * the harvest — strings of maize ears hanging, hides and meat laid over the rails.
 */
function rack(el, { bag, col }) {
  const [a, b] = [el.a, el.b], h = el.h ?? 3, L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(2, Math.round(L / 3) + 1), rand = rng(Math.round(a[0] * 31 + a[1] * 17) >>> 0);
  for (let k = 0; k < n; k++) {
    const f = k / (n - 1), x = a[0] + (b[0] - a[0]) * f, z = a[1] + (b[1] - a[1]) * f;
    for (const o of [-1.2, 1.2]) { bag.add(V, rod([x, -0.4, z + o], [x + (rand() - 0.5) * 0.08, h + 0.3, z + o * 0.97], 0.075, 7)); col.circle(x, z + o, 0.1, 0, h); }
  }
  for (const zo of [-1.2, 1.2]) bag.add(V, rod([a[0] - 0.3, h, a[1] + zo], [b[0] + 0.3, h, b[1] + zo], 0.06, 6));
  for (let k = 0; k < L / 0.8; k++) { const f = k * 0.8 / L, x = a[0] + (b[0] - a[0]) * f + (rand() - 0.5) * 0.15, z = a[1] + (b[1] - a[1]) * f; bag.add(V, rod([x, h + 0.1, z - 1.45], [x + (rand() - 0.5) * 0.2, h + 0.1, z + 1.45], 0.035, 5)); }
  // the harvest hung on the rails: strings of maize ears, hides folded over, strips of meat
  for (let s = 0.6; s < L - 0.4; s += 0.55 + rand() * 0.5) {
    const f = s / L, x = a[0] + (b[0] - a[0]) * f, z = a[1] + (b[1] - a[1]) * f, zo = rand() < 0.5 ? -1.2 : 1.2, kind = rand();
    if (kind < 0.55) {
      // a string of maize: ears tied in a hanging cluster
      const len = 0.8 + rand() * 0.9;
      bag.add('linen', rod([x, h - 0.05, z + zo], [x, h - len, z + zo], 0.012, 4));
      for (let e = 0; e * 0.17 < len - 0.15; e++) {
        const yy = h - 0.15 - e * 0.17, ang = e * 2.1, ox = Math.cos(ang) * 0.06, oz = Math.sin(ang) * 0.06;
        bag.add(e % 5 === 3 ? 'paint_ochre' : 'cloth_ochre', lathe([[0.001, 0], [0.035, 0.04], [0.045, 0.11], [0.03, 0.17], [0.001, 0.19]], 6, null, x + ox, yy - 0.19, z + zo + oz));
      }
    } else if (kind < 0.8) {
      // a hide folded over the rail
      const w = 0.5 + rand() * 0.35, d = 0.7 + rand() * 0.4, g = [], mat = rand() < 0.5 ? 'hide_tan' : 'hide_brown';
      for (const sd of [-1, 1]) g.push(x - w, h + 0.06, z + zo, x + w, h + 0.06, z + zo, x + w * 0.9, h - d, z + zo + sd * 0.09, x - w, h + 0.06, z + zo, x + w * 0.9, h - d, z + zo + sd * 0.09, x - w * 0.85, h - d * 0.9, z + zo + sd * 0.09);
      bag.add(mat, fromTriangles(g.concat(flipTris(g))));
    } else {
      // strips of meat drying
      for (let q = 0; q < 4; q++) { const xx = x + (q - 1.5) * 0.09, ln = 0.35 + rand() * 0.25; bag.add('hide_brown', box(xx - 0.03, h - ln, z + zo + 0.065, xx + 0.03, h - 0.06, z + zo + 0.08)); }
    }
  }
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
