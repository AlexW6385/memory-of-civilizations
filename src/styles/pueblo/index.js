// Pueblo architecture of Taos (c. 1000–1500; docs/settlements/taos.md §4): rooms of sun-dried adobe
// stacked in terraces of up to five storeys, each storey set back from the one below; thick walls
// plastered red-brown, roofs of packed earth on vigas whose ends show on the faces, low parapets,
// ladders leaning up to the terraces and poking out of the roof hatches; kivas round and half sunk;
// drying racks of poles; the perimeter wall.

import { registerStyle, STYLES } from '../../core/build.js';
import { box, lathe, fromTriangles, rod } from '../../core/geom.js';
import { beamTris, flipTris } from '../ming/index.js';
import { Matrix4 } from '../../core/three.js';
import '../qing/index.js';
import { YARD_ELEMENTS } from './yards.js';
import { dress } from './dress.js';

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
function hatch(bag, col, x, top, z, rand, over = 2.0) {
  const r = 0.5, t = 0.16, hc = 0.22;
  for (const [x0, z0, x1, z1] of [[x - r - t, z - r - t, x + r + t, z - r], [x - r - t, z + r, x + r + t, z + r + t], [x - r - t, z - r, x - r, z + r], [x + r, z - r, x + r + t, z + r]]) bag.add(A, box(x0, top - 0.05, z0, x1, top + hc, z1));
  bag.add('lacquer_black', box(x - r, top - 0.4, z - r, x + r, top + 0.025, z + r));
  col.rect([x - r - t, z - r - t, x + r + t, z + r + t], top, top + hc);
  ladder(bag, x - 0.15, top - 2.2, z, 2.2, 0, rand() < 0.5 ? 1 : -1, 0.5, over);
}

/**
 * pueblo_block: a terraced house block { x0, z0, cell, heights: [[storeys by column] by row], front
 * ('s'|'n': the side the terraces step down to), seed }: each cell a stack of rooms; parapets on the
 * edges of every roof; the round ends of the vigas, which span the rooms north–south, standing out
 * of the north and south faces; few, small windows and hardly a door; ladders up to the next
 * terrace and through the hatches in the roofs.
 */
function pueblo(el, ctx) {
  const { bag, col } = ctx, rand = rng(el.seed || 1), c = el.cell, H = el.heights, rows = H.length, cols = H[0].length;
  const at = (i, j) => (i >= 0 && i < rows && j >= 0 && j < cols ? H[i][j] : 0);
  const roomAt = (i, j) => (el.rooms ?? []).find((r) => r.i === i && r.j === j);
  for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) {
    const n = H[i][j]; if (!n) continue;
    const x0 = el.x0 + j * c, z0 = el.z0 + i * c, x1 = x0 + c, z1 = z0 + c, top = n * ST, room = roomAt(i, j);
    if (room) {
      // a ground-storey room opened and furnished (pueblo_room); any storeys over it solid
      puebloRoom({ rect: [x0, z0, x1, z1], door: room.door, store: room.store, kind: room.kind, seed: el.seed * 31 + j, out: { n: at(i - 1, j) < 1, s: at(i + 1, j) < 1 } }, ctx);
      if (n > 1) { bag.add(A, box(x0, ST, z0, x1, top, z1)); col.rect([x0, z0, x1, z1], ST, top); col.floor([x0, z0, x1, z1], top); }
    } else { bag.add(A, box(x0, 0, z0, x1, top, z1)); col.rect([x0, z0, x1, z1], 0, top); col.floor([x0, z0, x1, z1], top); }
    // the edges where this roof stands above its neighbour: a parapet; the faces below: vigas, openings
    for (const [di, dj, a, b, nx, nz] of [[-1, 0, [x0, z0], [x1, z0], 0, -1], [1, 0, [x0, z1], [x1, z1], 0, 1], [0, -1, [x0, z0], [x0, z1], -1, 0], [0, 1, [x1, z0], [x1, z1], 1, 0]]) {
      const m = at(i + di, j + dj);
      if (m >= n) continue;
      const t = []; beamTris(t, [a[0] - nx * 0.15, top, a[1] - nz * 0.15], [b[0] - nx * 0.15, top, b[1] - nz * 0.15], 0.15, 0.5); bag.add(A, fromTriangles(t));
      for (let s = m + 1; s <= n; s++) {
        const y = s * ST - 0.3;
        // the vigas: 15–25 cm logs about a metre apart, their ends left long and uneven [stated: Wikipedia "Viga"]
        if (nz && !room) for (let k = 0; k < 5; k++) {
          const f = (k + 0.5) / 5 + (rand() - 0.5) * 0.05, out = 0.25 + rand() * 0.65, r = 0.08 + rand() * 0.04, px = a[0] + (b[0] - a[0]) * f, pz = a[1] + (b[1] - a[1]) * f;
          bag.add(V, rod([px, y, pz - nz * 0.3], [px, y - out * 0.03, pz + nz * out], r, 7));
          // rain running off the viga ends washes a pale streak down the plaster under them
          if (rand() < 0.5) { const sx = nx ? 0 : 0.07; void sx; bag.add('kahgel', box(Math.min(px - 0.07, px + 0.07), y - 0.5 - rand() * 0.9, Math.min(pz, pz + nz * 0.014), Math.max(px - 0.07, px + 0.07), y - 0.18, Math.max(pz, pz + nz * 0.014))); }
        }
        // now and then a small window under its lintel pole; on the ground storey, rarely, a low doorway
        const opening = !room && rand() < 0.45, door = opening && s === 1 && rand() < 0.2;
        // the wear of the plaster: the foot of a ground-storey face eroded by splash and re-mudded in a
        // thicker, coarser band (run on round the corners); here and there a patch of new plaster,
        // lighter on the old, kept below the windows
        const L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L;
        const along = (u0, u1, y0, y1, off, mat) => {
          const ax = a[0] + ux * u0, az = a[1] + uz * u0, bx = a[0] + ux * u1, bz = a[1] + uz * u1;
          bag.add(mat, box(Math.min(ax, bx, ax + nx * off), y0, Math.min(az, bz, az + nz * off), Math.max(ax, bx, ax + nx * off), y1, Math.max(az, bz, az + nz * off)));
        };
        if (s === 1 && m === 0 && !room && !door && rand() < 0.45) {
          // fallen plaster and crumbled mud heaped at the foot of the wall where the rain has bitten
          const ul = rand() * L * 0.6, un = 3 + Math.floor(rand() * 3);
          for (let q = 0; q < un; q++) {
            const u = ul + q * 0.55 + rand() * 0.2, px = a[0] + ux * Math.min(u, L - 0.2) + nx * (0.18 + rand() * 0.14), pz = a[1] + uz * Math.min(u, L - 0.2) + nz * (0.18 + rand() * 0.14);
            const g = lathe([[0.001, -0.02], [0.9, 0], [1, 0.2], [0.6, 0.7], [0.001, 1]], 6); g.scale(0.3 + rand() * 0.15, 0.12 + rand() * 0.1, 0.22 + rand() * 0.1).rotateY(rand() * 6).translate(px, 0, pz); bag.add('banco_rough', g);
          }
        }
        // hairline cracks where the earth has shrunk, and the damp dark band under the parapet where the roof sheds its water
        if (!room && rand() < 0.35) {
          let cu = (0.1 + rand() * 0.8) * L, cy = (s - 1) * ST + 0.3 + rand() * 1.4;
          const segs = 3 + Math.floor(rand() * 3);
          for (let q = 0; q < segs; q++) {
            const nu = Math.max(0.05, Math.min(L - 0.05, cu + (rand() - 0.5) * 0.35)), ny = cy + 0.25 + rand() * 0.3;
            const ax = a[0] + ux * cu, az = a[1] + uz * cu, bx = a[0] + ux * nu, bz = a[1] + uz * nu;
            bag.add('pottery_dark', box(Math.min(ax, bx) - 0.012, cy, Math.min(az, bz) - 0.012, Math.max(ax, bx) + 0.012 + Math.abs(nx) * 0.012, ny, Math.max(az, bz) + 0.012 + Math.abs(nz) * 0.012));
            cu = nu; cy = ny;
          }
        }
        if (s === n && !room && rand() < 0.5) along(rand() * L * 0.5, rand() * L * 0.4 + L * 0.5, s * ST - 0.2, s * ST - 0.03, 0.045, 'mud_plaster');
        if (s === 1 && m === 0 && !room && !door) {
          const k = 3;
          for (let q = 0; q < k; q++) along(q ? q * L / k : -0.05, q < k - 1 ? (q + 1) * L / k : L + 0.05, -0.15, 0.34 + rand() * 0.24, 0.05 - q * 0.004, 'banco_rough');
        }
        if (rand() < 0.3 && !room && !door) {
          const u0 = (0.08 + rand() * 0.45) * L, u1 = Math.min(0.92 * L, u0 + (0.18 + rand() * 0.3) * L), yb = (s - 1) * ST + (s === 1 ? 0.72 : 0.25);
          along(u0, u1, yb, Math.min((s - 1) * ST + 1.15, yb + 0.3 + rand() * 0.55), 0.014, 'kahgel');
        }
        if (opening) {
          const w = door ? 0.4 : 0.26, hh = door ? 1.45 : 0.45, yy = (s - 1) * ST + (door ? 0.15 : 1.25);
          const f = 0.3 + rand() * 0.4, px = a[0] + (b[0] - a[0]) * f, pz = a[1] + (b[1] - a[1]) * f, ux = Math.abs(nz), uz = Math.abs(nx);
          bag.add('lacquer_black', box(Math.min(px - ux * w, px + nx * 0.02), yy, Math.min(pz - uz * w, pz + nz * 0.02), Math.max(px + ux * w, px + nx * 0.02), yy + hh, Math.max(pz + uz * w, pz + nz * 0.02)));
          // the soot of the smoke and the rain's stain above and below; a hide hung in a doorway, a skin laced over some windows
          if (!door) bag.add('lacquer_black', box(Math.min(px - ux * (w + 0.06), px + nx * 0.012), yy + hh + 0.1, Math.min(pz - uz * (w + 0.06), pz + nz * 0.012), Math.max(px + ux * (w + 0.06), px + nx * 0.012), yy + hh + 0.1 + 0.12 + rand() * 0.25, Math.max(pz + uz * (w + 0.06), pz + nz * 0.012)));
          const flap = door ? rand() < 0.6 : rand() < 0.22;
          if (flap) { const sh = door ? 0.5 + rand() * 0.45 : 1, fa = [px - ux * (w + 0.04) + nx * 0.025, pz - uz * (w + 0.04) + nz * 0.025], fb = [px + ux * (w + 0.04) + nx * 0.05, pz + uz * (w + 0.04) + nz * 0.05]; bag.add(rand() < 0.5 ? 'hide_tan' : 'hide_brown', box(Math.min(fa[0], fb[0]), door ? 0.05 : yy + 0.05, Math.min(fa[1], fb[1]), Math.max(fa[0], fb[0]), yy + hh + 0.05 - (door ? 0 : 0.1) - (door ? hh * (1 - sh) * 0 : 0), Math.max(fa[1], fb[1]))); }
          const ly = yy + hh + 0.07;
          bag.add(V, rod([px - ux * (w + 0.22) + nx * 0.03, ly, pz - uz * (w + 0.22) + nz * 0.03], [px + ux * (w + 0.22) + nx * 0.03, ly, pz + uz * (w + 0.22) + nz * 0.03], 0.06, 6));
        }
      }
    }
    // a ladder on this roof up to the next storey; or a hatch in the roof with its ladder poking out
    const f = el.front === 'n' ? -1 : 1, up = at(i - f, j);
    if (room) continue;
    if (up > n && rand() < 0.45) ladder(bag, x0 + c * (0.3 + rand() * 0.4), top, el.front === 'n' ? z0 + 1.1 : z1 - 1.1, ST + 0.5, 0, -f, 0.75, 1.4);
    else if (n >= at(i + f, j) && n >= up && rand() < 0.28) hatch(bag, col, x0 + c * (0.35 + rand() * 0.3), top, z0 + c * (0.35 + rand() * 0.3), rand);
  }
}

/**
 * kiva: a round kiva { c, r, gate (the angle of the palisade's way in) }: sunk in the ground, only
 * its low earthen rim and roof showing, the hatch in the middle with its raised rim and the tall
 * ladder standing up out of it; round it a palisade of poles set close in the ground and tied to two
 * rails, a way left through it [stated: "circular, subterranean structures … protected by palisades
 * of poles and entered through the roof by tall ladders" — SAH Archipedia].
 */
function kiva(el, { bag, col }) {
  const [x, z] = el.c, r = el.r, rand = rng(Math.round(x * 7 + z * 13) >>> 0);
  bag.add(A, lathe([[r + 0.25, -0.5], [r + 0.2, 0.35], [r - 0.05, 0.62], [r - 0.4, 0.74], [0.001, 0.78]], 32, (t, i) => (i > 1 ? 1 : 1 + 0.015 * Math.sin(t * 5 + i)), x, 0, z));
  col.circle(x, z, r + 0.2, 0, 0.78); col.floor([x - r * 0.7, z - r * 0.7, x + r * 0.7, z + r * 0.7], 0.78);
  hatch(bag, col, x, 0.78, z, rand, 3.6);
  // the palisade: poles of unpeeled pine, a little uneven, a gap for the way in
  const R = r + 1.6, gate = el.gate ?? Math.PI / 2, gw = 1.1 / R, H = 2.1;
  const n = Math.round(2 * Math.PI * R / 0.17);
  const inGate = (a) => Math.abs(((a - gate + Math.PI * 3) % (Math.PI * 2)) - Math.PI) < gw;
  for (let k = 0; k < n; k++) {
    const a = k / n * Math.PI * 2; if (inGate(a)) continue;
    const pr = R + (rand() - 0.5) * 0.06, px = x + Math.cos(a) * pr, pz = z + Math.sin(a) * pr, h = H + (rand() - 0.5) * 0.35;
    bag.add('log_pine', rod([px, -0.3, pz], [px + (rand() - 0.5) * 0.05, h, pz + (rand() - 0.5) * 0.05], 0.065 + rand() * 0.02, 6));
    bag.add('log_pine', lathe([[0.07, 0], [0.05, 0.08], [0.001, 0.12]], 6, null, px, h - 0.01, pz));
  }
  // the two rails, in short straight lengths lashed to the poles on the outside
  for (const yy of [0.55, 1.65]) {
    const m = 24;
    for (let k = 0; k < m; k++) {
      const a0 = k / m * Math.PI * 2, a1 = (k + 1) / m * Math.PI * 2;
      if (inGate(a0) || inGate(a1) || inGate((a0 + a1) / 2)) continue;
      const q = R + 0.13;
      bag.add(V, rod([x + Math.cos(a0) * q, yy, z + Math.sin(a0) * q], [x + Math.cos(a1) * q, yy + 0.02, z + Math.sin(a1) * q], 0.045, 5));
    }
  }
  const m2 = 36;
  for (let k = 0; k < m2; k++) {
    const a0 = k / m2 * Math.PI * 2, a1 = (k + 1) / m2 * Math.PI * 2;
    if (inGate(a0) || inGate(a1)) continue;
    col.segment([x + Math.cos(a0) * R, z + Math.sin(a0) * R], [x + Math.cos(a1) * R, z + Math.sin(a1) * R], 0.2, 0, H);
  }
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

/**
 * adobe_wall: the perimeter wall a→b { h }: adobe laid thick at the foot and battered, its head
 * rounded by the rain, its height and line a little uneven, worn lower here and there [inferred: the adobe as
 * the houses'; the wall once "taller and punctuated by fortified towers" — SAH Archipedia — later].
 */
function adobeWall(el, { bag, col }) {
  const [a, b] = [el.a, el.b], L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L, nx = -uz, nz = ux;
  const H = el.h ?? 2.2, rand = rng(Math.round(a[0] * 13 + a[1] * 7 + b[0] * 3) >>> 0), n = Math.max(2, Math.ceil(L / 0.8));
  // stations along the wall: height, lateral wobble, thickness
  const st = [];
  let hw = 0;
  for (let i = 0; i <= n; i++) {
    hw += (rand() - 0.5) * 0.12; hw *= 0.85;
    const f = i / n, worn = Math.sin(f * L / 7.3 + a[0]) > 0.93 ? 0.35 : 0;
    st.push({ u: f * L, h: H + 0.12 * Math.sin(f * L / 3.1 + a[1]) + hw - worn, o: 0.06 * Math.sin(f * L / 5.7 + b[0]), t: 0.42 + 0.03 * Math.sin(f * L / 2.3) });
  }
  // the section: foot, batter, the shoulders of the rounded head, the crown
  const prof = (s) => [[-s.t - 0.06, -0.4], [-s.t, 0.5], [-s.t * 0.72, s.h - 0.2], [-s.t * 0.4, s.h - 0.04], [0, s.h], [s.t * 0.4, s.h - 0.04], [s.t * 0.72, s.h - 0.2], [s.t, 0.5], [s.t + 0.06, -0.4]];
  const P = (s, [k, y]) => [a[0] + ux * s.u + nx * (k + s.o), y, a[1] + uz * s.u + nz * (k + s.o)];
  const up = [], lo = [];
  for (let i = 0; i < n; i++) {
    const p0 = prof(st[i]), p1 = prof(st[i + 1]);
    for (let j = 0; j + 1 < p0.length; j++) {
      const T = j === 0 || j === p0.length - 2 ? lo : up, mk = (p0[j][0] + p0[j + 1][0]) / 2, want = [nx * mk, (p0[j][1] + p0[j + 1][1]) > 2 * st[i].h - 0.5 ? 1 : 0.1, nz * mk];
      const q = [P(st[i], p0[j]), P(st[i + 1], p1[j]), P(st[i + 1], p1[j + 1]), P(st[i], p0[j + 1])];
      tri(T, q[0], q[1], q[2], want); tri(T, q[0], q[2], q[3], want);
    }
  }
  for (const [i, sg] of [[0, -1], [n, 1]]) {
    const p = prof(st[i]).map((v) => P(st[i], v)), c = P(st[i], [0, st[i].h * 0.4]);
    for (let j = 0; j + 1 < p.length; j++) tri(up, c, p[j], p[j + 1], [ux * sg, 0, uz * sg]);
    tri(up, c, p[p.length - 1], p[0], [ux * sg, 0, uz * sg]);
  }
  bag.add(A, fromTriangles(up.concat(lo)));
  col.segment(a, b, 1.0, 0, H);
}

/** Push triangle a b c, turned to face `want`. */
function tri(out, a, b, c, want) {
  const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
  const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
  if (nx * want[0] + ny * want[1] + nz * want[2] < 0) out.push(...a, ...c, ...b); else out.push(...a, ...b, ...c);
}

/**
 * log_bridge: a footbridge across the creek { a, b }: three peeled logs side by side, their ends
 * bedded on sill logs laid along each bank and pegged; the middle log flattened on top for the foot
 * [inferred: the valley's timber, as the vigas].
 */
function logBridge(el, { bag, col }) {
  const L = Math.hypot(el.b[0] - el.a[0], el.b[1] - el.a[1]), ux = (el.b[0] - el.a[0]) / L, uz = (el.b[1] - el.a[1]) / L, nx = -uz, nz = ux;
  const rand = rng(Math.round(el.a[0] * 17 + el.a[1] * 5) >>> 0), ext = 1.0;
  const at = (u, k, y) => [el.a[0] + ux * u + nx * k, y, el.a[1] + uz * u + nz * k];
  // the sills on the banks
  for (const u of [0.3, L - 0.3]) bag.add(V, rod(at(u, -1.1, 0.02), at(u, 1.1, 0.04), 0.14, 8));
  // the logs, resting on the sills, sagging a little over the water
  for (const k of [-0.34, 0, 0.34]) {
    const r = 0.15 + rand() * 0.03, y0 = 0.16 + r - 0.15, pts = [];
    for (let i = 0; i <= 4; i++) { const f = i / 4, u = -ext + (L + 2 * ext) * f; pts.push(at(u, k + (rand() - 0.5) * 0.04, y0 + r - 0.04 * Math.sin(f * Math.PI) - (u < 0 || u > L ? 0.12 : 0))); }
    for (let i = 0; i < 4; i++) bag.add(V, rod(pts[i], pts[i + 1], r, 9));
  }
  // pegs driven beside the logs at the sills, keeping them from rolling
  for (const u of [0.3, L - 0.3]) for (const k of [-0.62, 0.62]) bag.add(V, rod(at(u, k, -0.1), at(u, k, 0.55), 0.045, 6));
  col.segment(el.a, el.b, 1.0, -1, 0.42);
  col.floor([Math.min(at(0, -0.5, 0)[0], at(L, 0.5, 0)[0]), Math.min(at(0, -0.5, 0)[2], at(L, 0.5, 0)[2]), Math.max(at(0, -0.5, 0)[0], at(L, 0.5, 0)[0]), Math.max(at(0, -0.5, 0)[2], at(L, 0.5, 0)[2])], 0.42);
}

/**
 * mealing_bin: a row of three bins { c, yaw }, each lined with slabs of stone set on edge, a slab
 * metate in each leaning at the grinding angle — coarse to fine — and its two-hand mano on it; the
 * meal gathered at the foot; a jar of water and a basket of shelled ears beside the row [stated:
 * slab metates in stone bins "built specifically to hold the metate at the proper angle", two-hand
 * manos, rows of three — Crow Canyon; micaceous jars — Wikipedia "Taos Pueblo"].
 */
function mealingBin(el, { bag, col }) {
  const [cx, cz] = el.c, yaw = el.yaw ?? 0, cs = Math.cos(yaw), sn = Math.sin(yaw), rand = rng(Math.round(cx * 11 + cz * 3) >>> 0);
  // local x across the row, z toward where the grinder kneels (+z)
  const W = (x, y, z) => [cx + x * cs + z * sn, y, cz - x * sn + z * cs];
  const slabT = (t, x0, x1, z0, z1, y0, y1) => { const c = [W(x0, 0, z0), W(x1, 0, z0), W(x1, 0, z1), W(x0, 0, z1)]; const T = []; const p = (q, y) => [q[0], y, q[2]];
    const want = (i) => { const m = [(c[i][0] + c[(i + 1) % 4][0]) / 2 - (c[0][0] + c[2][0]) / 2, 0, (c[i][2] + c[(i + 1) % 4][2]) / 2 - (c[0][2] + c[2][2]) / 2]; return m; };
    tri(T, p(c[0], y1), p(c[1], y1), p(c[2], y1), [0, 1, 0]); tri(T, p(c[0], y1), p(c[2], y1), p(c[3], y1), [0, 1, 0]);
    for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; tri(T, p(c[i], y0), p(c[j], y0), p(c[j], y1), want(i)); tri(T, p(c[i], y0), p(c[j], y1), p(c[i], y1), want(i)); }
    t.push(...T); };
  const S = [], M = [];
  const bw = 0.62, bd = 0.85, t = 0.06;
  for (let i = 0; i <= 3; i++) slabT(S, -1.5 * bw + i * bw - t / 2, -1.5 * bw + i * bw + t / 2, -bd / 2, bd / 2, -0.1, 0.3 + rand() * 0.04);
  slabT(S, -1.5 * bw - t / 2, 1.5 * bw + t / 2, -bd / 2 - t, -bd / 2, -0.1, 0.36);
  slabT(S, -1.5 * bw - t / 2, 1.5 * bw + t / 2, bd / 2, bd / 2 + t, -0.1, 0.14);
  bag.add('flagstone', fromTriangles(S));
  for (let i = 0; i < 3; i++) {
    const x = -bw + i * bw, mw = bw - t - 0.06, ml = bd - 0.12, ang = 0.32;
    // the metate: a slab raised at the back, its face worn hollow
    const c = (dx, dz, k) => { const zz = -ml / 2 + dz * ml, yy = 0.05 + (ml - dz * ml) * Math.sin(ang) * 0.5 + k; return W(x + dx * mw / 2, yy, zz * Math.cos(ang)); };
    const top = [c(-1, 0, 0.07), c(1, 0, 0.07), c(1, 1, 0.07), c(-1, 1, 0.07)], bot = [c(-1, 0, 0), c(1, 0, 0), c(1, 1, 0), c(-1, 1, 0)];
    const nUp = [0, 1, 0];
    tri(M, top[0], top[1], top[2], nUp); tri(M, top[0], top[2], top[3], nUp);
    for (let e = 0; e < 4; e++) { const f = (e + 1) % 4, m = [(top[e][0] + top[f][0]) / 2 - (top[0][0] + top[2][0]) / 2, 0, (top[e][2] + top[f][2]) / 2 - (top[0][2] + top[2][2]) / 2]; tri(M, bot[e], bot[f], top[f], m); tri(M, bot[e], top[f], top[e], m); }
    // the mano lying across it, partway down
    const mz = -ml / 2 + (0.35 + rand() * 0.3) * ml, my = 0.05 + (ml / 2 - mz) * Math.sin(ang) * 0.5 + 0.07 + 0.045;
    const g = rod(W(x - mw / 2 + 0.03, my, mz * Math.cos(ang)), W(x + mw / 2 - 0.03, my, mz * Math.cos(ang)), 0.045, 7);
    bag.add('basalt', g);
    // the meal at the foot
    bag.add('linen', lathe([[0.16, 0], [0.1, 0.035], [0.001, 0.05]], 9, null, ...W(x, 0.04, bd / 2 - 0.1)));
  }
  bag.add('basalt', fromTriangles(M));
  // a micaceous jar of water, a basket of shelled ears
  const jp = W(1.5 * bw + 0.45, 0, 0.1);
  bag.add('terracotta', lathe([[0.001, 0], [0.12, 0.03], [0.22, 0.16], [0.24, 0.3], [0.17, 0.44], [0.11, 0.5], [0.12, 0.55], [0.001, 0.52]], 14, null, jp[0], 0, jp[2]));
  const bp = W(-1.5 * bw - 0.45, 0, 0.2);
  bag.add('wicker', lathe([[0.001, 0], [0.16, 0.01], [0.24, 0.1], [0.27, 0.2], [0.24, 0.2], [0.21, 0.11], [0.001, 0.08]], 14, null, bp[0], 0, bp[2]));
  for (let k = 0; k < 7; k++) { const a = k * 0.9, rr = 0.06 + (k % 3) * 0.05; bag.add(k % 4 === 1 ? 'paint_ochre' : 'cloth_ochre', rod([bp[0] + Math.cos(a) * rr - 0.06, 0.15, bp[2] + Math.sin(a) * rr], [bp[0] + Math.cos(a) * rr + 0.07, 0.17, bp[2] + Math.sin(a) * rr + 0.03], 0.03, 6)); }
  const e0 = W(-1.5 * bw, 0, -bd / 2), e1 = W(1.5 * bw, 0, -bd / 2);
  col.segment([e0[0], e0[2]], [e1[0], e1[2]], bd, 0, 0.36);
}

// ---- a room of the pueblo, furnished ---------------------------------------------------------
/**
 * Boxes for a wall along one axis with openings cut through it: { along: 'x'|'z', u0, u1 (its run),
 * t0, t1 (its thickness, across), y0, y1, holes: [{ a, b (along), lo, hi }] } → [[x0, y0, z0, x1, y1, z1]].
 */
function wallPieces({ along, u0, u1, t0, t1, y0, y1, holes = [] }) {
  const cuts = [...new Set([u0, u1, ...holes.flatMap((h) => [h.a, h.b])])].filter((u) => u >= u0 && u <= u1).sort((p, q) => p - q), out = [];
  for (let k = 0; k + 1 < cuts.length; k++) {
    const p = cuts[k], q = cuts[k + 1];
    if (q - p < 1e-4) continue;
    const over = holes.filter((h) => h.a <= p + 1e-6 && h.b >= q - 1e-6).sort((g, h) => g.lo - h.lo);
    let y = y0;
    for (const h of over) { if (h.lo > y + 1e-4) out.push([p, q, y, h.lo]); y = Math.max(y, h.hi); }
    if (y1 > y + 1e-4) out.push([p, q, y, y1]);
  }
  return out.map(([p, q, ya, yb]) => (along === 'x' ? [p, ya, t0, q, yb, t1] : [t0, ya, p, t1, yb, q]));
}
/** A micaceous jar or bowl: a lathed profile at (x, y, z), scaled. */
const JARS = {
  olla: [[0.001, 0], [0.1, 0.02], [0.2, 0.12], [0.23, 0.24], [0.19, 0.36], [0.12, 0.42], [0.125, 0.47], [0.11, 0.47], [0.1, 0.43], [0.001, 0.42]],
  cook: [[0.001, 0], [0.09, 0.03], [0.16, 0.12], [0.17, 0.2], [0.15, 0.27], [0.155, 0.3], [0.14, 0.3], [0.13, 0.27], [0.001, 0.25]],
  bowl: [[0.001, 0], [0.06, 0.005], [0.14, 0.05], [0.17, 0.1], [0.16, 0.1], [0.13, 0.06], [0.001, 0.03]],
};
const jar = (bag, kind, x, y, z, k = 1, mat = 'terracotta') => bag.add(mat, lathe(JARS[kind].map(([r, h]) => [r * k, h * k]), 14, null, x, y, z));
/** A blanket or hide hung over a pole along x at height h: two drapes either side of the pole, a little apart at the hem. */
function drape(bag, mat, x, h, z, w, d, dirX = true) {
  const g = [];
  const P = (u, y, v) => (dirX ? [x + u, y, z + v] : [x + v, y, z + u]);
  // in soft vertical folds, deeper toward the hem, the hem a little uneven
  const N = 10, V = 4, Q = (sd, i, j) => { const u = -w + 2 * w * i / N, t = j / V, f = 0.035 * t * Math.sin(i * 2.1 + sd); return P(u * (1 - 0.04 * t), h + 0.04 - d * t * (1 - 0.04 * Math.cos(i * 1.3)), sd * (0.012 + 0.06 * t) + sd * f); };
  for (const sd of [-1, 1]) for (let i = 0; i < N; i++) for (let j = 0; j < V; j++) g.push(...Q(sd, i, j), ...Q(sd, i + 1, j), ...Q(sd, i + 1, j + 1), ...Q(sd, i, j), ...Q(sd, i + 1, j + 1), ...Q(sd, i, j + 1));
  bag.add(mat, fromTriangles(g.concat(flipTris(g))));
}
/**
 * pueblo_room: a ground-storey room opened and furnished { rect (the cell), door ('n'|'s'|'e'|'w'),
 * seed } — the walls of adobe 0.5 m thick plastered inside with a lighter mud, two niches in them
 * holding jars [stated: "carved and plastered niches, probably for storing pots and household items"
 * — NPS Bandelier]; a floor of smoothed earth; the vigas across, a layer of branches over them blackened
 * by the smoke, the roof of earth above with its hatch, which is the smoke hole too, a ladder up
 * through it [stated: entry through roof hatches — Wikipedia "Taos Pueblo"; the soot on ceiling and
 * walls — Crow Canyon]; under it the fire pit lined with slabs; the mealing bins against the back
 * wall [stated: rooms for "grinding corn, and storage" — NPS Bandelier]; an upright loom against a
 * side wall, its frame held in the ceiling and the floor [stated: "Sockets in the ceiling, along with
 * anchors set in the floor, held supports for looms" — NPS Bandelier]; a pole hung from the vigas
 * with blankets of turkey feathers and rabbit fur and a deerskin over it, bedding rolled along the
 * wall [inferred: blankets stated in the dossier, §4.2]; jars of water and for cooking, bowls, a
 * basket. The doorway is made a man's height so the room can be walked into [inferred: §4.2].
 */
function puebloRoom(el, { bag, col, lights }) {
  const [x0, z0, x1, z1] = el.rect, T = 0.5, rand = rng(el.seed || 3), door = el.door ?? 's', kind = el.kind ?? (el.store ? 'store' : 'home'), store = kind === 'store', home = kind === 'home', fire = home || kind === 'sleep' || kind === 'weave';
  const ix0 = x0 + T, iz0 = z0 + T, ix1 = x1 - T, iz1 = z1 - T, cx = (ix0 + ix1) / 2, cz = (iz0 + iz1) / 2, F = 0.06, PL = 0.025, LIN = 'earth_wall';
  const dw = 0.8, dh = 1.95, du = (door === 's' || door === 'n') ? cx + 0.3 : cz - 0.3;     // the doorway, off the middle
  const nicheH = (u, lo) => ({ a: u - 0.22, b: u + 0.22, lo, hi: lo + 0.36, niche: 0.28 });
  // the four walls: [side, along, run, outer, inner]
  const W = { n: ['x', [x0, x1], z0, iz0], s: ['x', [x0, x1], z1, iz1], w: ['z', [iz0, iz1], x0, ix0], e: ['z', [iz0, iz1], x1, ix1] };
  const niches = { w: [nicheH(cz - 0.7, 1.05), nicheH(cz + 0.6, 1.15)], e: [], n: [], s: [] };
  if (door !== 'n') niches.n.push(nicheH(ix1 - 0.6, 1.2));
  for (const [side, [along, [u0, u1], outer, inner]] of Object.entries(W)) {
    const holes = [...niches[side]];
    if (side === door) holes.push({ a: du - dw / 2, b: du + dw / 2, lo: -0.2, hi: dh });
    // the wall itself, with the niches cut only part way in (their backs added)
    const thr = holes.filter((h) => !h.niche);
    for (const p of wallPieces({ along, u0, u1, t0: Math.min(outer, inner), t1: Math.max(outer, inner), y0: -0.2, y1: ST, holes: thr.concat(holes.filter((h) => h.niche)) })) {
      bag.add(A, box(...p)); col.rect([p[0], p[2], p[3], p[5]], p[1], p[4]);
    }
    for (const h of holes.filter((q) => q.niche)) {
      const back = inner + Math.sign(outer - inner) * h.niche, tA = Math.min(back, outer), tB = Math.max(back, outer);
      bag.add(A, along === 'x' ? box(h.a, h.lo, tA, h.b, h.hi, tB) : box(tA, h.lo, h.a, tB, h.hi, h.b));
      // a jar in the niche
      const nu = (h.a + h.b) / 2, nt = inner + Math.sign(outer - inner) * h.niche * 0.5;
      jar(bag, rand() < 0.5 ? 'cook' : 'bowl', along === 'x' ? nu : nt, h.lo, along === 'x' ? nt : nu, 0.75, rand() < 0.5 ? 'terracotta' : 'pottery_dark');
    }
    // the plaster lining inside, cut round the same holes
    const lin = inner + Math.sign(inner - outer) * PL, lr = along === 'x' ? [ix0, ix1] : [iz0 + PL, iz1 - PL];
    for (const p of wallPieces({ along, u0: lr[0], u1: lr[1], t0: Math.min(inner, lin), t1: Math.max(inner, lin), y0: F, y1: ST - 0.26, holes })) bag.add(LIN, box(...p));
  }
  // the floor, and the sill of the doorway
  bag.add(LIN, box(ix0, -0.25, iz0, ix1, F, iz1)); col.floor([ix0, iz0, ix1, iz1], F);
  const sill = door === 's' ? [du - dw / 2, iz1, du + dw / 2, z1 + 0.06] : door === 'n' ? [du - dw / 2, z0 - 0.06, du + dw / 2, iz0] : door === 'e' ? [ix1, du - dw / 2, x1 + 0.06, du + dw / 2] : [x0 - 0.06, du - dw / 2, ix0, du + dw / 2];
  bag.add(A, box(sill[0], -0.2, sill[1], sill[2], 0.05, sill[3])); col.floor(sill, 0.05);
  // the lintel over the doorway: short poles laid across the wall's thickness
  for (let k = 0; k < 5; k++) {
    const u = du - dw / 2 + 0.08 + k * (dw - 0.16) / 4;
    if (door === 's' || door === 'n') { const [za, zb] = door === 's' ? [iz1 - 0.02, z1 + 0.04] : [z0 - 0.04, iz0 + 0.02]; bag.add(V, rod([u, dh - 0.05, za], [u + (rand() - 0.5) * 0.03, dh - 0.05, zb], 0.05, 6)); }
    else { const [xa, xb] = door === 'e' ? [ix1 - 0.02, x1 + 0.04] : [x0 - 0.04, ix0 + 0.02]; bag.add(V, rod([xa, dh - 0.05, u], [xb, dh - 0.05, u + (rand() - 0.5) * 0.03], 0.05, 6)); }
  }
  // the hatch: a square hole in the roof off the middle; under it the fire pit
  const hx = cx + 0.35, hz = cz - 0.25, hr = 0.5;
  // the vigas across the room (north–south), clear of the hatch; the branches over them, cut round it; the earth roof
  // (their ends run out through the faces that stand free, left long and uneven, as on every face)
  const vx = [ix0 + 0.45, hx - hr - 0.4, hx + hr + 0.25, ix1 - 0.25];
  for (const x of vx) {
    const za = el.out?.n ? z0 - 0.25 - rand() * 0.6 : z0 + 0.2, zb = el.out?.s ? z1 + 0.25 + rand() * 0.6 : z1 - 0.2;
    bag.add(V, rod([x, ST - 0.42, za], [x + (rand() - 0.5) * 0.05, ST - 0.42 - (el.out?.s ? 0.02 : 0), zb], 0.085 + rand() * 0.025, 8));
  }
  for (let z = iz0 + 0.04; z < iz1 - 0.02; z += 0.095) {
    const y = ST - 0.29 + (rand() - 0.5) * 0.01, r = 0.026 + rand() * 0.008, w = rand() * 0.04;
    if (z > hz - hr - 0.03 && z < hz + hr + 0.03) { bag.add('bark_dark', rod([ix0 - 0.05, y, z], [hx - hr, y, z + w], r, 5)); bag.add('bark_dark', rod([hx + hr, y, z], [ix1 + 0.05, y, z + w], r, 5)); }
    else bag.add('bark_dark', rod([ix0 - 0.05, y, z], [ix1 + 0.05, y, z + w], r, 5));
  }
  for (const r of [[ix0, iz0, ix1, hz - hr], [ix0, hz + hr, ix1, iz1], [ix0, hz - hr, hx - hr, hz + hr], [hx + hr, hz - hr, ix1, hz + hr]]) { bag.add(A, box(r[0], ST - 0.26, r[1], r[2], ST, r[3])); col.floor(r, ST); }
  for (const [a0, b0] of [[[x0, z0], [x1, iz0]], [[x0, iz1], [x1, z1]], [[x0, iz0], [ix0, iz1]], [[ix1, iz0], [x1, iz1]]]) col.floor([a0[0], a0[1], b0[0], b0[1]], ST);
  // the hatch's frame of poles, its coaming on the roof, the ladder from the floor up through it
  for (const s of [-1, 1]) bag.add(V, rod([hx - hr - 0.1, ST - 0.3, hz + s * (hr + 0.06)], [hx + hr + 0.1, ST - 0.3, hz + s * (hr + 0.06)], 0.06, 6));
  for (const [a0, b0, a1, b1] of [[hx - hr - 0.16, hz - hr - 0.16, hx + hr + 0.16, hz - hr], [hx - hr - 0.16, hz + hr, hx + hr + 0.16, hz + hr + 0.16], [hx - hr - 0.16, hz - hr, hx - hr, hz + hr], [hx + hr, hz - hr, hx + hr + 0.16, hz + hr]]) bag.add(A, box(a0, ST - 0.05, b0, a1, ST + 0.22, b1));
  col.rect([hx - hr - 0.16, hz - hr - 0.16, hx + hr + 0.16, hz + hr + 0.16], ST, ST + 0.22);
  ladder(bag, hx - 0.15, F, hz - 0.62, ST - F, 0, 1, 0.5, 1.8);
  col.segment([hx - 0.45, hz - 0.62], [hx + 0.15, hz - 0.62], 0.12, F, ST);
  const fx = hx, fz = hz + 0.15, fr = 0.3;
  if (fire) {
  // the fire pit: four slabs on edge round a square of ash, the embers, a small fire
  for (const [a0, b0, a1, b1] of [[fx - fr - 0.05, fz - fr - 0.05, fx + fr + 0.05, fz - fr], [fx - fr - 0.05, fz + fr, fx + fr + 0.05, fz + fr + 0.05], [fx - fr - 0.05, fz - fr, fx - fr, fz + fr], [fx + fr, fz - fr, fx + fr + 0.05, fz + fr]]) bag.add('flagstone', box(a0, F - 0.15, b0, a1, F + 0.08, b1));
  bag.add('opening', box(fx - fr, F - 0.06, fz - fr, fx + fr, F + 0.005, fz + fr));
  for (let k = 0; k < 4; k++) { const a = k * 1.7 + 0.4; bag.add('bark_dark', rod([fx + Math.cos(a) * 0.26, F + 0.02, fz + Math.sin(a) * 0.26], [fx + Math.cos(a) * 0.03, F + 0.07, fz + Math.sin(a) * 0.03], 0.03, 5)); }
  bag.add('flame', lathe([[0.1, 0], [0.08, 0.08], [0.04, 0.2], [0.001, 0.3]], 8, (th) => 1 + 0.25 * Math.sin(th * 3), fx, F + 0.04, fz));
  col.rect([fx - fr - 0.05, fz - fr - 0.05, fx + fr + 0.05, fz + fr + 0.05], F, F + 0.1);
  if (lights) lights.push({ at: [fx, F + 0.5, fz], color: '#ff9a4a', intensity: 3, distance: 6 });
  }
  const RC = { bag, col, ST, ix0, iz0, ix1, iz1, cx, cz, hx, hz, hr, F, PL, vx, rand, door, fx, fz, fr, lights };
  if (store) storeFurniture(bag, col, ST, RC);
  else if (kind === 'weave') weaveFurniture(RC);
  else if (kind === 'sleep') sleepFurniture(RC);
  else if (kind === 'work') workFurniture(RC);
  else if (kind === 'pottery') potteryFurniture(RC);
  else {
  // the mealing bins against the back wall, the grinder's side toward the room
  const back = door === 's' ? 'n' : door === 'n' ? 's' : door === 'e' ? 'w' : 'e', byaw = { n: 0, s: Math.PI, w: -Math.PI / 2, e: Math.PI / 2 }[back];
  const bc = back === 'n' ? [cx - 0.1, iz0 + PL + 0.48] : back === 's' ? [cx + 0.1, iz1 - PL - 0.48] : back === 'w' ? [ix0 + PL + 0.48, cz] : [ix1 - PL - 0.48, cz];
  mealingBin({ c: bc, yaw: byaw }, { bag, col });
  // the loom against the east wall: two uprights from floor to ceiling, the beams, the cloth half woven
  const lx = ix1 - PL - 0.18, lz0 = cz - 0.2, lz1 = cz + 1.0;
  for (const z of [lz0, lz1]) bag.add(V, rod([lx, F - 0.1, z], [lx, ST - 0.3, z], 0.045, 6));
  for (const y of [0.35, 1.85, 2.0]) bag.add(V, rod([lx, y, lz0 - 0.08], [lx, y, lz1 + 0.08], y === 2.0 ? 0.035 : 0.03, 6));
  bag.add('cloth_white', box(lx - 0.006, 0.38, lz0 + 0.08, lx + 0.006, 1.05, lz1 - 0.08));
  for (const y of [0.52, 0.6, 0.86]) bag.add('cloth_black', box(lx - 0.009, y, lz0 + 0.08, lx + 0.009, y + 0.035, lz1 - 0.08));
  bag.add('linen', box(lx - 0.003, 1.05, lz0 + 0.08, lx + 0.003, 1.82, lz1 - 0.08));         // the warp, bare above the weaving
  bag.add(V, rod([lx - 0.05, 1.1, lz0 + 0.02], [lx - 0.05, 1.1, lz1 - 0.02], 0.018, 5));         // the batten
  col.segment([lx, lz0], [lx, lz1], 0.15, F, ST - 0.3);
  // the pole hung from the vigas by thongs along the west wall, the blankets over it
  const px = ix0 + PL + 0.35, pz0 = cz - 1.2, pz1 = cz + 1.0, py = 1.72;
  bag.add(V, rod([px, py, pz0], [px, py, pz1], 0.035, 6));
  for (const z of [pz0 + 0.15, pz1 - 0.15]) bag.add('hide_tan', rod([px, py, z], [vx[0], ST - 0.5, z], 0.008, 4));
  drape(bag, 'hide_grey', px, py, pz0 + 0.55, 0.42, 0.95, false);           // a blanket of turkey feathers
  drape(bag, 'hide_white', px, py, pz0 + 1.45, 0.38, 0.8, false);           // a blanket of rabbit fur
  drape(bag, 'hide_tan', px, py, pz1 - 0.25, 0.2, 0.6, false);              // a deerskin
  }
  if (home) {
  // bedding rolled along the south-west wall; a basket; the water jar with its gourd dipper; the cooking pot by the fire
  for (const [z, mat, r] of [[iz1 - PL - 0.2, 'hide_white', 0.13], [iz1 - PL - 0.47, 'hide_tan', 0.12]]) bag.add(mat, rod([ix0 + PL + 0.1, F + r, z], [ix0 + PL + 1.25, F + r, z], r, 9));
  }
  jar(bag, 'olla', ix1 - PL - 0.35, F, iz1 - PL - 0.4, 1.2);
  bag.add('wicker', lathe([[0.001, 0], [0.06, 0.005], [0.075, 0.04], [0.07, 0.045], [0.05, 0.012], [0.001, 0.01]], 10, null, ix1 - PL - 0.35, F + 0.565, iz1 - PL - 0.4));
  if (fire) { jar(bag, 'cook', fx - fr - 0.3, F, fz + 0.2, 1, 'pottery_dark'); jar(bag, 'bowl', fx + fr + 0.25, F, fz + 0.35, 1); }
  if (!fire && lights) lights.push({ at: [hx, ST - 0.7, hz], color: '#ffe6bd', intensity: 1.6, distance: 6 });
  if (home) bag.add('wicker', lathe([[0.001, 0], [0.12, 0.005], [0.2, 0.09], [0.24, 0.2], [0.21, 0.2], [0.18, 0.1], [0.001, 0.07]], 14, null, ix0 + PL + 0.4, F, iz0 + PL + 0.4));
}

/**
 * storeFurniture: what a pueblo storeroom holds [stated: rooms served "weaving, grinding corn, and
 * storage" — NPS Bandelier; "carved and plastered niches, probably for storing pots" — same; maize,
 * beans and squash the crops of the valley — dossier §7; inferred: the arrangement]. Along the west
 * wall three low adobe bins heaped with shelled corn, beans and dried squash rings; big storage jars
 * along the east wall; strings of maize ears hanging from the vigas; folded hides and baskets.
 */
function storeFurniture(bag, col, ST, { ix0, iz0, ix1, iz1, F, PL, vx, rand }) {
  const bx0 = ix0 + PL + 0.02, bx1 = bx0 + 0.85, T = 0.09, H = 0.62;
  const heaps = [['cloth_ochre', 0.3], ['pottery_dark', 0.26], ['paint_ochre', 0.28]];
  for (let k = 0; k < 3; k++) {
    const z0 = iz0 + 0.3 + k * 1.0, z1 = z0 + 0.85;
    for (const [a, b, c, d] of [[bx0, z0, bx1, z0 + T], [bx0, z1 - T, bx1, z1], [bx0, z0 + T, bx0 + T, z1 - T], [bx1 - T, z0 + T, bx1, z1 - T]]) bag.add(A, box(a, F, b, c, H, d));
    const [mat, hh] = heaps[k], mx = (bx0 + bx1) / 2, mz = (z0 + z1) / 2;
    bag.add(mat, lathe([[0.001, H - 0.12], [0.34, H - 0.12], [0.3, H - 0.02], [0.18, H + hh * 0.35], [0.001, H + hh * 0.5]], 12, (t) => 1 + 0.05 * Math.sin(t * 5 + k), mx, 0, mz));
    if (k === 0) for (let e = 0; e < 5; e++) { const a = e * 1.3; bag.add('paint_ochre', rod([mx + Math.cos(a) * 0.12 - 0.06, H + 0.16, mz + Math.sin(a) * 0.1], [mx + Math.cos(a) * 0.12 + 0.07, H + 0.2, mz + Math.sin(a) * 0.1 + 0.03], 0.03, 5)); }
    col.rect([bx0, z0, bx1, z1], F, H);
  }
  // large storage jars along the east wall, their mouths stopped with a flat stone
  for (let k = 0; k < 3; k++) {
    const jx = ix1 - PL - 0.4, jz = iz0 + 0.5 + k * 0.85, sc = 1.5 + 0.25 * (k % 2);
    bag.add(rand() < 0.5 ? 'terracotta' : 'pottery_dark', lathe([[0.001, 0], [0.1, 0.02], [0.2, 0.12], [0.23, 0.24], [0.19, 0.36], [0.12, 0.42], [0.125, 0.47], [0.11, 0.47], [0.1, 0.43], [0.001, 0.42]].map(([r, h]) => [r * sc, h * sc]), 14, null, jx, F, jz));
    bag.add('flagstone', lathe([[0.001, 0.47 * sc], [0.15 * sc, 0.47 * sc], [0.15 * sc, 0.49 * sc], [0.001, 0.49 * sc]], 10, null, jx, F, jz));
    col.circle(jx, jz, 0.34 * sc, F, 0.7);
  }
  // strings of maize hung from two vigas
  for (const x of [vx[0], vx[3]]) for (let k = 0; k < 3; k++) {
    const z = iz0 + 0.8 + k * 1.1 + (rand() - 0.5) * 0.2, top = ST - 0.5, len = 0.7 + rand() * 0.3;
    bag.add('linen', rod([x, top + 0.05, z], [x, top - len, z], 0.012, 4));
    for (let e = 0; e * 0.16 < len - 0.1; e++) { const a = e * 2.1; bag.add(e % 4 === 2 ? 'paint_ochre' : 'cloth_ochre', lathe([[0.001, 0], [0.035, 0.04], [0.045, 0.11], [0.03, 0.17], [0.001, 0.19]], 6, null, x + Math.cos(a) * 0.06, top - 0.15 - e * 0.16 - 0.19, z + Math.sin(a) * 0.06)); }
  }
  // folded hides and baskets in the south-west corner, a stack of cotton bags of meal
  for (let k = 0; k < 4; k++) bag.add(k % 2 ? 'hide_tan' : 'hide_brown', box(ix0 + PL + 1.0, F + k * 0.07, iz1 - PL - 0.8, ix0 + PL + 1.75, F + k * 0.07 + 0.065, iz1 - PL - 0.2));
  col.rect([ix0 + PL + 1.0, iz1 - PL - 0.8, ix0 + PL + 1.75, iz1 - PL - 0.2], F, 0.3);
  for (let k = 0; k < 3; k++) bag.add('cloth_white', lathe([[0.001, 0], [0.2, 0.03], [0.24, 0.14], [0.17, 0.26], [0.06, 0.3], [0.001, 0.29]], 9, (t) => 1 + 0.06 * Math.sin(t * 3 + k), ix0 + PL + 2.5 + k * 0.5, F, iz1 - PL - 0.35));
}

// ---- the other rooms of the plaza faces (docs/settlements/taos.md §4.5) ---------------------------------------------------
/** The frame of a room's furniture: Z(d) the z at d from the back wall, D(d) at d from the door wall, boxes and colliders with sorted corners. */
function roomFrame(RC) {
  const { bag, col, door, iz0, iz1, PL } = RC, south = door === 's';
  const Z = (d) => (south ? iz0 + PL + d : iz1 - PL - d), D = (d) => (south ? iz1 - PL - d : iz0 + PL + d);
  const bx = (mat, x0, y0, z0, x1, y1, z1) => bag.add(mat, box(Math.min(x0, x1), y0, Math.min(z0, z1), Math.max(x0, x1), y1, Math.max(z0, z1)));
  const cr = (x0, z0, x1, z1, y0, y1) => col.rect([Math.min(x0, x1), Math.min(z0, z1), Math.max(x0, x1), Math.max(z0, z1)], y0, y1);
  return { Z, D, bx, cr, sg: south ? -1 : 1 };
}
/** An upright loom against a side wall (lx), the warp from z0 to z1, the woven cloth in bands from the bottom up. */
function loomUp({ bag, col, F, ST }, lx, z0, z1, bands, upTo) {
  for (const z of [z0, z1]) bag.add(V, rod([lx, F - 0.1, z], [lx, ST - 0.3, z], 0.045, 6));
  for (const y of [0.35, 1.85, 2.0]) bag.add(V, rod([lx, y, z0 - 0.08], [lx, y, z1 + 0.08], y === 2.0 ? 0.035 : 0.03, 6));
  bag.add(bands[0], box(lx - 0.006, 0.38, z0 + 0.08, lx + 0.006, upTo, z1 - 0.08));
  bands.slice(1).forEach((m, k) => bag.add(m, box(lx - 0.009, 0.45 + k * 0.13, z0 + 0.08, lx + 0.009, 0.485 + k * 0.13, z1 - 0.08)));
  bag.add('linen', box(lx - 0.003, upTo, z0 + 0.08, lx + 0.003, 1.82, z1 - 0.08));
  bag.add(V, rod([lx - 0.05, upTo + 0.04, z0 + 0.02], [lx - 0.05, upTo + 0.04, z1 - 0.02], 0.018, 5));
  col.segment([lx, z0], [lx, z1], 0.15, F, ST - 0.3);
}
/** A basket with a heap in it (cotton, shelled corn, clay): at (x, y, z), radius k. */
function basketOf(bag, col, mat, x, y, z, k = 1) {
  bag.add('wicker', lathe([[0.001, 0], [0.16, 0.01], [0.24, 0.1], [0.27, 0.2], [0.24, 0.2], [0.21, 0.11], [0.001, 0.08]].map(([r, h]) => [r * k, h * k]), 12, null, x, y, z));
  bag.add(mat, lathe([[0.001, 0.15], [0.22 * k, 0.17 * k], [0.2 * k, 0.26 * k], [0.1 * k, 0.33 * k], [0.001, 0.35 * k]], 9, null, x, y, z));
  col.circle(x, z, 0.28 * k, y, y + 0.3);
}
/**
 * A weaving room [stated: rooms served "weaving, grinding corn, and storage", looms held by "sockets in the ceiling … anchors set
 * in the floor" — NPS Bandelier; the Pueblos wove cotton and turkey-feather blankets — Archaeology, "In Full Plume"]: an upright
 * loom against each side wall (one with a half-woven white blanket banded in black, one in red and blue), a pole hung from the
 * vigas with finished blankets and skeins of dyed cotton, baskets of raw cotton, spindles on a mat [inferred: the arrangement].
 */
function weaveFurniture(RC) {
  const { bag, col, F, PL, ST, ix0, ix1, cx, cz, rand } = RC, { Z, D, bx, cr, sg } = roomFrame(RC);
  const za = Math.min(cz + sg * 0.1, cz + sg * 1.3), zb = Math.max(cz + sg * 0.1, cz + sg * 1.3);
  loomUp(RC, ix1 - PL - 0.18, za, zb, ['cloth_white', 'cloth_black', 'cloth_black', 'cloth_black'], 1.0);
  loomUp(RC, ix0 + PL + 0.18, za, zb, ['cloth_ochre', 'cloth_red', 'cloth_indigo', 'cloth_red'], 0.85);
  // the pole on thongs, blankets and skeins over it
  const pz = Z(0.35), py = 1.78;
  bag.add(V, rod([cx - 1.3, py, pz], [cx + 1.2, py, pz], 0.035, 6));
  for (const x of [cx - 1.25, cx + 1.15]) bag.add('hide_tan', rod([x, py, pz], [x, ST - 0.42, pz], 0.008, 4));
  drape(bag, 'cloth_indigo', cx - 0.85, py, pz, 0.4, 0.9); drape(bag, 'cloth_white', cx - 0.0, py, pz, 0.42, 1.05); drape(bag, 'cloth_red', cx + 0.85, py, pz, 0.36, 0.8);
  for (const [x, m] of [[cx - 0.42, 'cloth_ochre'], [cx + 0.42, 'cloth_brown'], [cx - 1.2, 'cloth_red'], [cx + 1.15, 'cloth_ochre']]) bag.add(m, box(x - 0.04, py - 0.42, pz - 0.025, x + 0.04, py - 0.02, pz + 0.025));
  // baskets of raw cotton by the back wall; the spindles on a mat by the door
  basketOf(bag, col, 'cloth_white', ix0 + PL + 0.55, F, Z(1.55), 1.0);
  basketOf(bag, col, 'cloth_white', ix1 - PL - 0.55, F, Z(1.7), 0.85);
  const mz = D(0.6);
  bx('wicker', ix0 + PL + 0.1, F, mz - 0.3, ix0 + PL + 1.0, F + 0.02, mz + 0.3);
  for (let k = 0; k < 4; k++) { const z = mz - 0.22 + k * 0.15, x = ix0 + PL + 0.25 + rand() * 0.2; bag.add(V, rod([x, F + 0.03, z], [x + 0.4, F + 0.03, z + (rand() - 0.5) * 0.08], 0.008, 4)); bag.add('basalt', lathe([[0.001, 0], [0.035, 0.0], [0.035, 0.012], [0.001, 0.012]], 8, null, x + 0.12, F + 0.025, z)); }
}
/**
 * A sleeping room [inferred: the platform and hides of the pueblos' bedding; "rooms … for sleeping" with rolled bedding — the home room, §4.2]:
 * a low platform of adobe along the back wall under hides and a folded blanket, a cradleboard hung over it from the vigas, a pole of
 * garments along the east wall, bedding rolled on the floor, a jar and a basket.
 */
function sleepFurniture(RC) {
  const { bag, col, F, PL, ST, ix0, ix1, cx, cz, vx, rand } = RC, { Z, D, bx, cr, sg } = roomFrame(RC);
  const px1 = cx - 0.4, h = 0.45;
  bx(A, ix0 + PL, F, Z(0), px1, h, Z(1.05)); cr(ix0 + PL, Z(0), px1, Z(1.05), F, h);
  bx('hide_tan', ix0 + PL + 0.03, h, Z(0.05), px1 - 0.03, h + 0.045, Z(1.0));
  bx('hide_white', ix0 + PL + 0.05, h + 0.045, Z(0.08), ix0 + PL + 0.85, h + 0.1, Z(0.95));
  bx('cloth_brown', px1 - 0.9, h + 0.045, Z(0.08), px1 - 0.05, h + 0.12, Z(0.95));
  bag.add('hide_grey', rod([ix0 + PL + 0.1, h + 0.17, Z(0.25)], [ix0 + PL + 0.1, h + 0.17, Z(0.8)], 0.11, 8));
  // the cradleboard over the bed: a board, the baby wrapped on it, thongs to the viga
  const cxr = vx[0] + 0.02, cz0 = Z(0.55), cy = 1.0;
  bx('log_pine', cxr - 0.14, cy, cz0 - 0.02, cxr + 0.14, cy + 0.72, cz0 + 0.02);
  bag.add('cloth_white', lathe([[0.001, 0], [0.12, 0.05], [0.13, 0.3], [0.09, 0.5], [0.001, 0.52]], 9, null, cxr, cy + 0.04, cz0 - 0.05));
  bag.add('cloth_red', lathe([[0.001, 0], [0.1, 0.01], [0.1, 0.05], [0.001, 0.06]], 8, null, cxr, cy + 0.02, cz0 - 0.07));
  for (const o of [-0.12, 0.12]) bag.add('hide_tan', rod([cxr + o, cy + 0.7, cz0], [cxr + o * 0.4, ST - 0.42, cz0], 0.007, 4));
  // the pole of garments along the east wall
  const gx = ix1 - PL - 0.3, gy = 1.72, g0 = cz - 1.0, g1 = cz + 1.0;
  bag.add(V, rod([gx, gy, g0], [gx, gy, g1], 0.035, 6));
  for (const z of [g0 + 0.1, g1 - 0.1]) bag.add('hide_tan', rod([gx, gy, z], [gx, ST - 0.42, z], 0.008, 4));
  drape(bag, 'hide_brown', gx, gy, cz - 0.55, 0.36, 1.0, false); drape(bag, 'cloth_ochre', gx, gy, cz + 0.05, 0.3, 0.75, false); drape(bag, 'hide_white', gx, gy, cz + 0.65, 0.3, 0.9, false);
  // bedding rolled on the floor by the east wall, a water jar, a basket
  for (const [k, m] of [[0, 'hide_white'], [1, 'hide_tan'], [2, 'cloth_brown']]) bag.add(m, rod([ix1 - PL - 0.2 - k * 0.27, F + 0.12, D(0.25)], [ix1 - PL - 0.2 - k * 0.27, F + 0.12, D(1.25)], 0.12, 9));
  cr(ix1 - PL - 0.82, D(0.1), ix1 - PL - 0.05, D(1.4), F, 0.26);
  basketOf(bag, col, 'cloth_ochre', ix0 + PL + 0.5, F, D(0.5), 0.9);
  jar(bag, 'cook', ix0 + PL + 1.2, F, D(0.4), 1, 'pottery_dark');
  void rand; void sg;
}
/**
 * A workroom of hunting and hide work [inferred: the valley's deer, elk and bison-hunting economy and hide clothing — taos.org; deerskin
 * dress, rabbit-fur blankets — §4.2]: a hide stretched in a pole frame, laced, in the back corner; bows and a quiver with arrows on pegs along the
 * west wall, a hide shield; a pad on the floor where a stone point is knapped, the chips and cores; a stack of folded robes.
 */
function workFurniture(RC) {
  const { bag, col, F, PL, ST, ix0, ix1, cx, cz, rand } = RC, { Z, D, bx, cr } = roomFrame(RC);
  // the hide in its frame against the east side of the back wall
  const fx = ix1 - 0.8, f0 = Z(0.35), f1 = Z(1.65), fy0 = 0.5, fy1 = 1.95;
  for (const z of [f0, f1]) bag.add(V, rod([fx, F - 0.05, z], [fx, fy1 + 0.05, z], 0.045, 6));
  for (const y of [fy0, fy1]) bag.add(V, rod([fx, y, f0 - 0.05], [fx, y, f1 + 0.05], 0.04, 6));
  bag.add('hide_tan', box(fx - 0.012, fy0 + 0.1, Math.min(f0, f1) + 0.1, fx + 0.012, fy1 - 0.1, Math.max(f0, f1) - 0.1));
  for (let k = 0; k < 7; k++) { const z = Math.min(f0, f1) + 0.1 + k * (Math.abs(f1 - f0) - 0.2) / 6; bag.add('hide_brown', rod([fx, fy1 - 0.1, z], [fx, fy1, z], 0.007, 4)); bag.add('hide_brown', rod([fx, fy0 + 0.1, z], [fx, fy0, z], 0.007, 4)); }
  cr(fx - 0.1, f0 - 0.1, fx + 0.1, f1 + 0.1, F, fy1);
  // the pegged board along the west wall: two bows, a quiver of arrows, a shield
  const wx = ix0 + PL, wz0 = cz - 1.3, wz1 = cz + 0.6;
  bag.add('log_pine', box(wx, 1.65, wz0, wx + 0.06, 1.72, wz1));
  for (const [z, bow] of [[cz - 0.95, 1], [cz - 0.55, 1], [cz + 0.05, 0]]) {
    if (bow) { const pts = []; for (let i = 0; i <= 5; i++) { const t = i / 5; pts.push([wx + 0.1 + 0.18 * Math.sin(t * Math.PI), 0.45 + 1.25 * t, z + 0.02 * Math.sin(t * 5)]); } for (let i = 0; i < 5; i++) bag.add('log_pine', rod(pts[i], pts[i + 1], 0.02, 5)); bag.add('linen', rod([wx + 0.1, 0.45, z], [wx + 0.1, 1.7, z], 0.005, 3)); }
    else {
      bag.add('hide_brown', lathe([[0.001, 0], [0.065, 0.01], [0.075, 0.55], [0.06, 0.6], [0.001, 0.6]], 8, null, wx + 0.12, 1.05, z));
      for (let k = 0; k < 7; k++) bag.add('log_pine', rod([wx + 0.12 + (rand() - 0.5) * 0.05, 1.5, z + (rand() - 0.5) * 0.05], [wx + 0.12 + (rand() - 0.5) * 0.12, 1.88, z + (rand() - 0.5) * 0.12], 0.006, 3));
    }
  }
  const sh = lathe([[0.001, 0], [0.34, 0.01], [0.33, 0.03], [0.001, 0.04]], 18); sh.rotateZ(Math.PI / 2).translate(wx + 0.07, 1.35, cz + 0.25); bag.add('hide_tan', sh);
  const sr = lathe([[0.12, 0], [0.24, 0.0], [0.24, 0.045], [0.12, 0.045]], 18); sr.rotateZ(Math.PI / 2).translate(wx + 0.075, 1.35, cz + 0.25); bag.add('cloth_red', sr);
  // the knapping pad by the door side: a hide, the chips round it, two cores and an antler tine
  const kx = ix0 + 1.4, kz = D(0.8);
  bx('hide_brown', kx - 0.4, F, kz - 0.4, kx + 0.4, F + 0.02, kz + 0.4);
  for (let k = 0; k < 16; k++) { const a = rand() * 6.28, r = 0.1 + rand() * 0.45; const g = lathe([[0.001, 0], [0.5, 0.0], [1, 0.4], [0.001, 1]], 5); g.scale(0.02 + rand() * 0.02, 0.012, 0.015 + rand() * 0.015).rotateY(rand() * 6).translate(kx + Math.cos(a) * r, F + 0.02, kz + Math.sin(a) * r); bag.add(rand() < 0.5 ? 'basalt' : 'flagstone', g); }
  for (const [dx, dz] of [[-0.15, 0.1], [0.12, -0.12]]) { const g = lathe([[0.001, 0], [0.9, 0.1], [1, 0.5], [0.7, 0.9], [0.001, 1]], 7); g.scale(0.1, 0.1, 0.08).translate(kx + dx, F + 0.02, kz + dz); bag.add('basalt', g); }
  bag.add('hide_white', rod([kx + 0.2, F + 0.04, kz + 0.15], [kx + 0.45, F + 0.06, kz + 0.3], 0.014, 5));
  // folded robes stacked in the corner behind the door
  for (let k = 0; k < 5; k++) bx(['hide_brown', 'hide_grey', 'hide_white', 'hide_tan', 'hide_brown'][k], ix0 + PL + 0.05 + (k % 2) * 0.03, F + k * 0.1, D(0.05), ix0 + PL + 0.85, F + k * 0.1 + 0.095, D(0.8));
  cr(ix0 + PL, D(0), ix0 + PL + 0.9, D(0.85), F, 0.5);
  void cx; void ST;
}
/**
 * A potter's room [stated: Taos pottery is of micaceous clay, sturdy and plain — Wikipedia "Taos Pueblo"; inferred: the work of coiling,
 * drying and polishing]: unfired jars and bowls drying in rows on mats, a heap of prepared clay, coils, polishing stones, slip and paint
 * in bowls, finished pots on an adobe shelf along the east wall.
 */
function potteryFurniture(RC) {
  const { bag, col, F, PL, ix0, ix1, cx, cz, rand } = RC, { Z, D, bx, cr } = roomFrame(RC);
  // two mats with the drying pots in rows
  for (const [x0, x1, kinds] of [[ix0 + PL + 0.1, ix0 + PL + 1.2, ['olla', 'cook', 'bowl']], [ix0 + PL + 1.3, ix0 + PL + 2.4, ['cook', 'bowl', 'olla']]]) {
    bx('wicker', x0, F, Z(0.15), x1, F + 0.02, Z(1.35));
    for (let r = 0; r < 3; r++) for (let c = 0; c < 2; c++) { const k = kinds[r], sc = 0.85 + rand() * 0.45; jar(bag, k, x0 + 0.27 + c * 0.55, F + 0.02, Z(0.32 + r * 0.4), sc, rand() < 0.25 ? 'pottery_dark' : 'terracotta'); }
    cr(x0, Z(0.15), x1, Z(1.35), F, 0.35);
  }
  // the heap of clay, coils laid ready, the polishing stones
  const hx = ix1 - PL - 0.65, hz = Z(0.65);
  bag.add('mud_plaster', lathe([[0.001, 0], [0.55, 0.02], [0.5, 0.2], [0.3, 0.38], [0.001, 0.45]], 11, (t) => 1 + 0.06 * Math.sin(t * 4), hx, F, hz)); col.circle(hx, hz, 0.55, F, 0.45);
  for (let k = 0; k < 4; k++) bag.add('mud_plaster', rod([hx - 0.9, F + 0.04 + (k % 2) * 0.05, hz + 0.2 + k * 0.08 - 0.15], [hx - 0.55, F + 0.04 + (k % 2) * 0.05, hz + 0.2 + k * 0.08 - 0.15], 0.035, 6));
  for (let k = 0; k < 3; k++) { const g = lathe([[0.001, 0], [0.9, 0.05], [1, 0.4], [0.5, 0.9], [0.001, 1]], 7); g.scale(0.05, 0.035, 0.04).translate(hx - 0.3 + k * 0.13, F, hz - 0.75); bag.add('basalt', g); }
  // slip and paint in bowls, brushes of yucca by them
  jar(bag, 'bowl', ix1 - PL - 0.4, F, D(0.5), 0.9, 'pottery_dark'); bag.add('paint_ochre', lathe([[0.001, 0], [0.12, 0], [0.12, 0.006], [0.001, 0.006]], 10, null, ix1 - PL - 0.4, F + 0.075, D(0.5)));
  jar(bag, 'bowl', ix1 - PL - 0.4, F, D(1.0), 0.9, 'terracotta'); bag.add('cloth_white', lathe([[0.001, 0], [0.12, 0], [0.12, 0.006], [0.001, 0.006]], 10, null, ix1 - PL - 0.4, F + 0.075, D(1.0)));
  bag.add('thatch', rod([ix1 - PL - 0.62, F + 0.02, D(0.75)], [ix1 - PL - 0.9, F + 0.04, D(0.9)], 0.01, 4));
  // the shelf of finished jars along the east wall, above the clay (adobe on two stubs)
  const sx = ix1 - PL - 0.3, s0 = cz - 0.5, s1 = cz + 1.1, sy = 1.05;
  bag.add(A, box(sx, sy - 0.06, Math.min(s0, s1), ix1 - PL, sy, Math.max(s0, s1)));
  for (const z of [s0 + 0.1, s1 - 0.1]) bag.add(A, box(sx + 0.05, sy - 0.5, z - 0.05, ix1 - PL, sy - 0.06, z + 0.05));
  for (let k = 0; k < 5; k++) jar(bag, ['olla', 'cook', 'bowl', 'cook', 'olla'][k], sx + 0.15, sy, Math.min(s0, s1) + 0.2 + k * 0.3, 0.55, k % 2 ? 'pottery_dark' : 'terracotta');
  void cx; void col;
}

/**
 * turkey: a domestic turkey { at, y, rot, tom (a male, its tail fanned), seed } — the turkey kept by
 * the Pueblo peoples for its feathers [stated: the turkey-feather blankets of the Ancestral Puebloans
 * — Archaeology, "In Full Plume"; inferred: kept loose about the plaza]. Bronze-black body, bare head,
 * red wattle, long legs; about 0.9 m long.
 */
const TURKEY = {};
function turkeyGeo(tom) {
  if (TURKEY[tom]) return TURKEY[tom];
  const k = tom ? 1 : 0.8, parts = { hide_black: [], hide_brown: [], cloth_red: [], hide_tan: [] };
  const body = lathe([[0.001, 0], [0.11, 0.05], [0.17, 0.17], [0.18, 0.3], [0.13, 0.42], [0.001, 0.47]].map(([r, y]) => [r * k, y * k]), 12);
  body.rotateX(Math.PI / 2).scale(1, 0.9, 1).translate(0, 0.42 * k, -0.24 * k);
  parts.hide_black.push(body);
  for (const s of [-1, 1]) {                                                 // the wings folded along the sides, browner
    const w = lathe([[0.001, 0], [0.07, 0.06], [0.08, 0.2], [0.04, 0.32], [0.001, 0.36]].map(([r, y]) => [r * k, y * k]), 8);
    w.rotateX(Math.PI / 2 + 0.25).scale(0.5, 1, 1).translate(s * 0.15 * k, 0.45 * k, -0.17 * k); parts.hide_brown.push(w);
    parts.hide_tan.push(rod([s * 0.06 * k, 0.33 * k, 0], [s * 0.07 * k, 0.02, 0.02 * k], 0.014 * k, 5));
    parts.hide_tan.push(rod([s * 0.07 * k, 0.02, 0.02 * k], [s * 0.07 * k, 0.01, -0.1 * k], 0.01 * k, 4));
  }
  parts.hide_black.push(rod([0, 0.5 * k, -0.2 * k], [0, 0.72 * k, -0.27 * k], 0.045 * k, 6));          // the neck
  parts.cloth_red.push(lathe([[0.001, 0], [0.035, 0.02], [0.04, 0.06], [0.025, 0.09], [0.001, 0.1]].map(([r, y]) => [r * k, y * k]), 8, null, 0, 0.7 * k, -0.28 * k));   // the bare head
  parts.cloth_red.push(rod([0, 0.74 * k, -0.31 * k], [0, 0.63 * k, -0.31 * k], 0.016 * k, 5));      // the wattle
  parts.hide_tan.push(rod([0, 0.75 * k, -0.31 * k], [0, 0.74 * k, -0.36 * k], 0.01 * k, 4));        // the beak
  if (tom) {                                                                  // the tail fanned up behind
    const t = [], n = 9, R = 0.42;
    for (let i = 0; i < n; i++) { const a0 = Math.PI * (0.08 + 0.84 * i / n), a1 = Math.PI * (0.08 + 0.84 * (i + 1) / n); t.push(0, 0.45, 0.2, Math.cos(a0) * R, 0.45 + Math.sin(a0) * R, 0.26, Math.cos(a1) * R, 0.45 + Math.sin(a1) * R, 0.26); }
    parts.hide_black.push(fromTriangles(t.concat(flipTris(t))));
  } else parts.hide_black.push(rod([0, 0.45 * k, 0.15 * k], [0, 0.4 * k, 0.32 * k], 0.07 * k, 6));
  return (TURKEY[tom] = parts);
}
function turkey(el, { bag }) {
  const [x, z] = el.at, y = el.y ?? 0, m = new Matrix4().makeRotationY(el.rot ?? 0).setPosition(x, y, z);
  for (const [mat, gs] of Object.entries(turkeyGeo(!!el.tom))) for (const g of gs) {
    if (bag.addInstance) bag.addInstance(mat, g, m.clone(), { reach: 120 }); else bag.add(mat, g.clone().applyMatrix4(m));
  }
}

registerStyle('pueblo', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.qing.elements, pueblo_block: pueblo, kiva, rack, adobe_wall: adobeWall, log_bridge: logBridge, mealing_bin: mealingBin, pueblo_room: puebloRoom, turkey, pueblo_dress: dress, ...YARD_ELEMENTS },
  objects: {},
});
