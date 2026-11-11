// The garden's furniture at the size of a walker (docs/settlements/versailles.md §1h): the parterres de broderie of the
// north and south with their scrolls of clipped box on coloured sands, the tall palissades of clipped hornbeam that wall
// the walks (with their niches and gates), the marble statues and vases on their pedestals along the Allée Royale and
// the terrace, the clipped yews, the stone benches. Every item stands on the ground under it (`el.h` the height function).

import { box, lathe, rod, fromTriangles, orientOutward } from '../../core/geom.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const S = 'sandstone_dressed';

/** A line of clipped box laid on the ground between two points (a thin rod); `h` its height. */
function hedgeSeg(bag, a, b, y, r = 0.15, h = 0.3) {
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
  if (len < 0.05) return;
  bag.add('lotus_leaf', rod([a[0], y + h * 0.5, a[1]], [b[0], y + h * 0.5, b[1]], r, 5));
}
/** broderie: { rect, h (ground), seed, sand: [mat, mat] } — the embroidered parterre: a border, scrolls in mirror pairs. */
export function broderie(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, H = el.h, rand = rng(el.seed ?? 7);
  const y = H((x0 + x1) / 2, (z0 + z1) / 2), [m1, m2] = el.sand ?? ['sandstone_red', 'slate'];
  bag.add('pebbles', box(x0, y - 0.3, z0, x1, y + 0.03, z1)); col.floor([x0, z0, x1, z1], y + 0.03);
  // the cut-out beds: a lawn of 'ground' under the scrolls (a green bed), a border round it
  const bx0 = x0 + 2.5, bz0 = z0 + 2.5, bx1 = x1 - 2.5, bz1 = z1 - 2.5;
  bag.add('terrain', box(bx0, y - 0.1, bz0, bx1, y + 0.06, bz1));
  for (const q of [[bx0, bz0, bx1, bz0 + 0.3], [bx0, bz1 - 0.3, bx1, bz1], [bx0, bz0, bx0 + 0.3, bz1], [bx1 - 0.3, bz0, bx1, bz1]]) bag.add('lotus_leaf', box(q[0], y, q[1], q[2], y + 0.34, q[3]));
  // the axes (gravel), the scrolls: in each quarter a spiral pair with its sand-filled eyes
  const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  const qw = (bx1 - bx0) / 2, qd = (bz1 - bz0) / 2;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const qx = cx + sx * qw / 2, qz = cz + sz * qd / 2;
    for (const [dx, dz, turn] of [[-0.45, -0.12, 1], [0.45, 0.12, -1], [-0.3, 0.55, -1], [0.3, -0.55, 1]]) {
      const ux = qx + dx * qw * 0.8, uz = qz + dz * qd * 0.8, R0 = Math.min(qw, qd) * 0.2 * (0.8 + rand() * 0.3);
      let prev = null; const ph = rand() * 6;
      for (let t = 0; t <= 9; t += 0.45) {
        const r = R0 * Math.exp(-0.2 * t), a = ph + turn * t * 0.9, p = [ux + Math.cos(a) * r, uz + Math.sin(a) * r];
        if (prev) hedgeSeg(bag, prev, p, y + 0.05, 0.12, 0.25);
        prev = p;
      }
      bag.add(rand() < 0.5 ? m1 : m2, lathe([[0.001, 0.05], [R0 * 0.5, 0.05], [R0 * 0.5, 0.075], [0.001, 0.075]], 10, null, ux, y, uz));
      // the tail running out of the scroll toward the border
      const a0 = ph, tail = [ux + Math.cos(a0) * R0, uz + Math.sin(a0) * R0], end = [tail[0] + Math.cos(a0 + turn) * R0 * 2.2, tail[1] + Math.sin(a0 + turn) * R0 * 2.2];
      hedgeSeg(bag, tail, end, y + 0.05, 0.12, 0.25);
    }
  }
  for (const [px, pz] of [[bx0, bz0], [bx1, bz0], [bx0, bz1], [bx1, bz1], [cx, bz0], [cx, bz1]]) bag.add('lotus_leaf', lathe([[0.001, 0], [0.35, 0.05], [0.32, 0.6], [0.2, 0.9], [0.001, 1.0]], 8, null, px, y, pz));   // clipped yew cones at the corners
  void fromTriangles; void orientOutward;
}

/** palissades: { runs: [[x0, z0, x1, z1, gates?]], h, hgt } — the hornbeam walls of the walks: a 1.1 m wall of clipped leaf 3.2 m high with niches, gates in the gaps. */
export function palissades(el, { bag, col }) {
  const H = el.h, ht = el.hgt ?? 3.2, rand = rng(el.seed ?? 11);
  for (const [x0, z0, x1, z1, gates] of el.runs) {
    const alongX = Math.abs(x1 - x0) > Math.abs(z1 - z0), L = alongX ? Math.abs(x1 - x0) : Math.abs(z1 - z0), a = alongX ? Math.min(x0, x1) : Math.min(z0, z1), c = alongX ? z0 : x0, w = 0.55;
    const seg = 4, gate = gates ?? [];
    for (let u = 0; u < L; u += seg) {
      const u1 = Math.min(L, u + seg), um = (u + u1) / 2, X = alongX ? a + um : c, Z = alongX ? c : a + um;
      if (gate.some((g) => um > g - 2 && um < g + 2)) continue;
      const yb = Math.min(H(alongX ? a + u : c, alongX ? c : a + u), H(alongX ? a + u1 : c, alongX ? c : a + u1)), yt = Math.max(H(alongX ? a + u : c, alongX ? c : a + u), H(alongX ? a + u1 : c, alongX ? c : a + u1));
      const r = alongX ? [a + u, c - w, a + u1, c + w] : [c - w, a + u, c + w, a + u1];
      bag.add('lotus_leaf', box(r[0], yb - 0.5, r[1], r[2], yt + ht - 0.4, r[3]));
      // the clipped top: a rounded crest, narrower; a hedge is never quite flat
      const k = 0.15, q = alongX ? [r[0], c - w + k, r[2], c + w - k] : [c - w + k, r[1], c + w - k, r[3]];
      bag.add('lotus_leaf', box(q[0], yt + ht - 0.4, q[1], q[2], yt + ht + 0.05 + rand() * 0.06, q[3]));
      col.rect(r, yb - 0.5, yt + ht);
      void X; void Z;
    }
    // the gates: two stone piers with ball finials and a gilt-tipped iron grille between, the walk beyond
    for (const g of gate) {
      const X = alongX ? a + g : c, Z = alongX ? c : a + g, y = H(X, Z);
      for (const s of [-1, 1]) {
        const px = alongX ? X + s * 1.6 : X, pz = alongX ? Z : Z + s * 1.6;
        bag.add(S, box(px - 0.3, y - 0.2, pz - 0.3, px + 0.3, y + 2.4, pz + 0.3)); bag.add(S, box(px - 0.38, y + 2.4, pz - 0.38, px + 0.38, y + 2.55, pz + 0.38));
        bag.add(S, lathe([[0.001, 0], [0.26, 0.06], [0.28, 0.28], [0.18, 0.5], [0.001, 0.54]], 10, null, px, y + 2.55, pz));
        col.rect([px - 0.3, pz - 0.3, px + 0.3, pz + 0.3], y - 0.2, y + 2.6);
      }
      for (let d = -1.3; d <= 1.3; d += 0.2) { const bx = alongX ? X + d : X, bz = alongX ? Z : Z + d; bag.add('iron', box(bx - 0.012, y, bz - 0.012, bx + 0.012, y + 2.1, bz + 0.012)); bag.add('gilt_bronze', lathe([[0.03, 0], [0.001, 0.12]], 4, null, bx, y + 2.1, bz)); }
      const ax = alongX ? [X - 1.4, Z - 0.02, X + 1.4, Z + 0.02] : [X - 0.02, Z - 1.4, X + 0.02, Z + 1.4];
      bag.add('iron', box(ax[0], y + 0.1, ax[1], ax[2], y + 0.16, ax[3])); bag.add('iron', box(ax[0], y + 2.0, ax[1], ax[2], y + 2.06, ax[3]));
    }
    // niches in the green wall every 14 m: a shallow bay with a stone seat
    for (let u = 7; u < L - 4; u += 14) {
      if (gate.some((g) => Math.abs(u - g) < 5)) continue;
      const X = alongX ? a + u : c, Z = alongX ? c : a + u, y = H(X, Z), off = alongX ? (z0 < 0 ? 1 : -1) : (x0 < 0 ? 1 : -1);
      const r2 = alongX ? [X - 0.9, off > 0 ? Z + 0.6 : Z - 1.1, X + 0.9, off > 0 ? Z + 1.1 : Z - 0.6] : [off > 0 ? X + 0.6 : X - 1.1, Z - 0.9, off > 0 ? X + 1.1 : X - 0.6, Z + 0.9];
      bag.add(S, box(r2[0], y, r2[1], r2[2], y + 0.45, r2[3])); col.rect(r2, y, y + 0.45);
    }
  }
}

/** A marble statue on a pedestal (a youthful god, a nymph: the figure in drapery, an arm raised), facing yaw. */
function statue(bag, col, x, z, y, yaw, kind, rand) {
  const c = Math.cos(yaw), s = Math.sin(yaw);
  bag.add(S, box(x - 0.55, y, z - 0.55, x + 0.55, y + 0.25, z + 0.55)); bag.add(S, box(x - 0.42, y + 0.25, z - 0.42, x + 0.42, y + 1.35, z + 0.42)); bag.add(S, box(x - 0.5, y + 1.35, z - 0.5, x + 0.5, y + 1.5, z + 0.5));
  col.circle(x, z, 0.62, y, y + 1.6);
  const M = 'marble_smooth', y1 = y + 1.5;
  if (kind === 'vase') {
    bag.add('marble', lathe([[0.001, 0], [0.3, 0.05], [0.34, 0.3], [0.28, 0.6], [0.34, 0.85], [0.42, 1.0], [0.36, 1.05], [0.001, 1.05]], 14, (th, i) => (i > 1 && i < 5 ? 1 + 0.06 * Math.cos(6 * th) : 1), x, y1 + 0.02, z));
    for (const sd of [-1, 1]) bag.add('marble', lathe([[0.001, 0], [0.07, 0.02], [0.07, 0.28], [0.001, 0.32]], 6, null, x + c * 0.4 * sd, y1 + 0.55, z - s * 0.4 * sd));
    bag.add('gilt_bronze', lathe([[0.001, 0], [0.12, 0.04], [0.1, 0.28], [0.001, 0.36]], 8, null, x, y1 + 1.07, z));
    return;
  }
  const h = 1.45 + rand() * 0.15;
  bag.add(M, lathe([[0.001, 0], [0.26, 0.02], [0.3, 0.3], [0.2, 0.9], [0.22, h * 0.78], [0.12, h * 0.9], [0.001, h * 0.91]], 10, (th, i) => (i > 0 && i < 4 ? 1 + 0.1 * Math.cos(5 * th + x) : 1), x, y1, z));   // the draped body
  bag.add(M, lathe([[0.001, 0], [0.1, 0.03], [0.11, 0.14], [0.07, 0.22], [0.001, 0.24]], 8, null, x, y1 + h * 0.9, z));                    // the head
  const ax = x + c * 0.2, az = z - s * 0.2;
  bag.add(M, rod([x + c * 0.1, y1 + h * 0.76, z - s * 0.1], [ax + c * 0.1, y1 + h * (kind === 'raised' ? 1.15 : 0.5), az - s * 0.1], 0.05, 6));    // an arm
  bag.add(M, rod([x - c * 0.1, y1 + h * 0.76, z + s * 0.1], [x - c * 0.2, y1 + h * 0.45, z + s * 0.2], 0.05, 6));
  if (kind === 'raised') bag.add('bronze', rod([ax + c * 0.1, y1 + h * 1.15, az - s * 0.1], [ax + c * 0.1, y1 + h * 1.45, az - s * 0.1], 0.02, 4));   // a staff
}
/** statues: { at: [[x, z, yaw, kind]], h, seed } — statues and vases on their pedestals. */
export function statues(el, { bag, col }) {
  const rand = rng(el.seed ?? 3);
  for (const [x, z, yaw, kind] of el.at) statue(bag, col, x, z, el.h(x, z), yaw ?? 0, kind ?? 'stand', rand);
}

/** yews: { at: [[x, z, s]], h } — clipped yews: a cone on a short stem, or a stack of balls; the odd one in a green tub. */
export function yews(el, { bag, col }) {
  const rand = rng(el.seed ?? 5);
  for (const [x, z, sc] of el.at) {
    const y = el.h(x, z), s = sc ?? 1, ball = rand() < 0.3;
    bag.add('bark_dark', lathe([[0.1, 0], [0.08, 0.5]], 6, null, x, y, z));
    if (ball) { bag.add('lotus_leaf', lathe([[0.001, 0.4], [0.5 * s, 0.7], [0.55 * s, 1.2 * s], [0.4 * s, 1.7 * s], [0.001, 1.9 * s]], 9, null, x, y, z)); bag.add('lotus_leaf', lathe([[0.001, 1.7 * s], [0.38 * s, 1.95 * s], [0.34 * s, 2.35 * s], [0.001, 2.6 * s]], 9, null, x, y, z)); }
    else bag.add('lotus_leaf', lathe([[0.001, 0.3], [0.8 * s, 0.4], [0.7 * s, 1.0 * s], [0.45 * s, 2.0 * s], [0.2 * s, 2.7 * s], [0.001, 3.1 * s]], 10, (th, i) => 1 + 0.04 * Math.sin(th * 5 + i), x, y, z));
    col.circle(x, z, 0.45, y, y + 2.5);
  }
}

/** benches: { at: [[x, z, yaw]], h } — a stone seat on two carved supports. */
export function benches(el, { bag, col }) {
  for (const [x, z, yaw] of el.at) {
    const y = el.h(x, z), c = Math.cos(yaw), s = Math.sin(yaw);
    const B = (u0, v0, u1, v1, ya, yb) => { const p = [x + c * u0 + s * v0, z - s * u0 + c * v0], q = [x + c * u1 + s * v1, z - s * u1 + c * v1]; const r = [Math.min(p[0], q[0]), Math.min(p[1], q[1]), Math.max(p[0], q[0]), Math.max(p[1], q[1])]; bag.add(S, box(r[0], y + ya, r[1], r[2], y + yb, r[3])); col.rect(r, y + ya, y + yb); };
    B(-0.85, -0.25, 0.85, 0.25, 0.42, 0.5); for (const u of [-0.7, 0.7]) B(u - 0.12, -0.22, u + 0.12, 0.22, 0, 0.42); B(-0.85, 0.2, 0.85, 0.27, 0.5, 0.95);
  }
}

/** guerites: { at: [[x, z, yaw]], y } — sentry boxes of painted boards (the king's colours in stripes), a pitched roof, the door open. */
export function guerites(el, { bag, col }) {
  for (const [x, z, yaw] of el.at) {
    const y = el.y, c = Math.cos(yaw), s = Math.sin(yaw);
    const B = (mat, u0, v0, u1, v1, ya, yb, cc = false) => { const p = [x + c * u0 + s * v0, z - s * u0 + c * v0], q = [x + c * u1 + s * v1, z - s * u1 + c * v1]; const r = [Math.min(p[0], q[0]), Math.min(p[1], q[1]), Math.max(p[0], q[0]), Math.max(p[1], q[1])]; bag.add(mat, box(r[0], y + ya, r[1], r[2], y + yb, r[3])); if (cc) col.rect(r, y + ya, y + yb); };
    B('timber', -0.55, -0.55, 0.55, 0.55, 0.0, 0.12, true);
    for (let k = 0; k < 6; k++) { const m = ['paint_blue', 'paint_white', 'cloth_red'][k % 3]; B(m, -0.5 + k * (1 / 6), -0.5, -0.5 + (k + 1) / 6, -0.45, 0.12, 2.3); B(m, -0.5 + k * (1 / 6), 0.45, -0.5 + (k + 1) / 6, 0.5, 0.12, 2.3); }
    B('wood_painted', -0.5, -0.5, -0.45, 0.5, 0.12, 2.3, true); B('wood_painted', 0.45, -0.5, 0.5, 0.5, 0.12, 2.3, true);
    B('wood_painted', -0.5, 0.45, 0.5, 0.5, 0.12, 2.3, true); B('opening', -0.35, -0.5, 0.35, -0.44, 0.12, 2.0);
    B('slate', -0.7, -0.7, 0.7, 0.7, 2.3, 2.4); B('slate', -0.55, -0.55, 0.55, 0.55, 2.4, 2.6); B('slate', -0.35, -0.35, 0.35, 0.35, 2.6, 2.75);
    bag.add('iron', lathe([[0.001, 0], [0.03, 0.01], [0.025, 0.3]], 5, null, x, y + 2.75, z));
  }
}
/** bornes: { at: [[x, z]], h } — stone posts joined by iron chains along the Place's edge. */
export function bornes(el, { bag, col }) {
  const pts = el.at;
  pts.forEach(([x, z], i) => {
    const y = el.h(x, z);
    bag.add(S, lathe([[0.2, 0], [0.24, 0.1], [0.19, 0.4], [0.2, 0.75], [0.14, 0.85], [0.001, 0.92]], 8, null, x, y, z)); col.circle(x, z, 0.24, y, y + 0.9);
    const n = pts[i + 1];
    if (n && !n[2] && Math.hypot(n[0] - x, n[1] - z) < 7) bag.add('iron', rod([x, y + 0.7, z], [(x + n[0]) / 2, y + 0.55, (z + n[1]) / 2], 0.012, 4)), bag.add('iron', rod([(x + n[0]) / 2, y + 0.55, (z + n[1]) / 2], [n[0], el.h(n[0], n[1]) + 0.7, n[1]], 0.012, 4));
  });
}
