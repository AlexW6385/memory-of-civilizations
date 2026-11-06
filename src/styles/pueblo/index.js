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

registerStyle('pueblo', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.qing.elements, pueblo_block: pueblo, kiva, rack, adobe_wall: adobeWall, log_bridge: logBridge, mealing_bin: mealingBin },
  objects: {},
});
