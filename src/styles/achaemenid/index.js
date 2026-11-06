// Achaemenid architecture (6th–5th c. BC; docs/settlements/persepolis.md §4): a stone terrace with
// a crenellated parapet; hypostyle halls on tall, slender fluted stone columns with bell bases and
// double-protome capitals (bulls, lions, griffins) carrying cedar beams; thick mudbrick walls,
// plastered, with dark stone door and window frames; corner towers; gates guarded by winged bulls;
// stepped merlons; the town's flat-roofed mudbrick houses.

import { registerStyle, STYLES } from '../../core/build.js';
import { Matrix4, Vector3 } from '../../core/three.js';
import { box, frustum, lathe, fromTriangles, rod, orientOutward } from '../../core/geom.js';
import { relief, strip, rosette } from './reliefs.js';
import '../qing/index.js';

const S = 'limestone_persian', W = 'plaster_persian', C = 'marble_dark';     // C: the polished stone of the columns, frames and sculpture
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/**
 * A column (docs/settlements/persepolis.md §4): the square plinth, the bell base hung with petals and
 * its torus, the shaft of 40 or 48 shallow flutes, and the capital — the bell of drooping leaves and
 * the palm crown, the tall square zone of fluted volutes (tall columns only), and the two kneeling
 * bulls back to back whose saddle carries the main beam (set across `beam`, 'x' or 'z': the bulls'
 * axis). The beam itself is the hall's; the capital ends at y + h − 0.7 s under it.
 */
function column(bag, col, x, z, y, h, d, beam = 'x', simple = false) {
  const r = d / 2, s = r / 0.8;
  col.circle(x, z, r * 1.2, y, y + h);
  if (simple) {
    bag.add(C, lathe([[r * 1.6, 0], [r * 1.5, 0.3], [r * 1.2, 0.6]], 8, null, x, y, z));
    bag.add(C, lathe([[r, 0], [r * 0.92, h - 0.6 - r * 1.6]], 8, null, x, y + 0.6, z));
    bag.add(C, box(x - r * 1.6, y + h - r * 1.6, z - r * 1.6, x + r * 1.6, y + h, z + r * 1.6));
    return;
  }
  // the base: a square plinth, the bell with its hanging petals, the torus
  bag.add(C, box(x - r * 1.95, y, z - r * 1.95, x + r * 1.95, y + 0.3 * s, z + r * 1.95));
  bag.add(C, lathe([[r * 1.78, 0], [r * 1.72, 0.1 * s], [r * 1.48, 0.42 * s], [r * 1.28, 0.72 * s], [r * 1.2, 0.86 * s]], 96, (th, i) => (i >= 1 && i <= 3 ? 1 + 0.09 * Math.abs(Math.cos(th * 16)) ** 3 : 1), x, y + 0.3 * s, z));
  bag.add(C, lathe([[r * 1.2, 0], [r * 1.31, 0.08 * s], [r * 1.34, 0.16 * s], [r * 1.26, 0.26 * s], [r * 0.98, 0.3 * s]], 24, null, x, y + 1.16 * s, z));
  const tall = h >= 16, yS = y + h - 0.7 * s, yP = yS - 1.55 * s, yV = tall ? yP - 2.6 * s : yP, yB = yV - 1.8 * s, y0 = y + 1.46 * s;
  // the fluted shaft (flutes of a nearly constant width: more on the thicker shafts)
  const N = d > 1.4 ? 48 : 40;
  bag.add(C, lathe([[r, 0], [r * 0.93, yB - y0]], N * 2, (th) => 1 - 0.035 * Math.abs(Math.sin(th * N / 2)), x, y0, z));
  // the bell of drooping leaves, then the palm crown spreading upward
  bag.add(C, lathe([[r * 0.93, 0], [r * 1.32, 0.14 * s], [r * 1.28, 0.5 * s], [r * 1.02, 0.84 * s], [r * 0.86, 0.9 * s]], 72, (th, i) => (i === 1 || i === 2 ? 1 + 0.1 * Math.abs(Math.cos(th * 12)) ** 3 : 1), x, yB, z));
  bag.add(C, lathe([[r * 0.86, 0], [r * 0.96, 0.3 * s], [r * 1.28, 0.68 * s], [r * 1.5, 0.86 * s], [r * 1.36, 0.9 * s], [r * 0.7, 0.9 * s], [0.001, 0.9 * s]], 72, (th, i) => (i >= 2 && i <= 4 ? 1 + (i === 4 ? 0.16 : 0.11) * Math.abs(Math.cos(th * 12)) ** 3 : 1), x, yB + 0.9 * s, z));
  if (tall) {
    // the tall square zone: fluted faces, a pair of volutes at the top of each face and an inverted pair at its foot
    const q = 0.66 * s;
    bag.add(C, box(x - q, yV, z - q, x + q, yP, z + q));
    for (const [fx, fz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const lx = -fz, lz = fx;
      for (let i = 1; i <= 5; i++) { const o = -q + i * (2 * q) / 6, cx = x + fx * (q + 0.02) + lx * o, cz = z + fz * (q + 0.02) + lz * o; bag.add(C, box(cx - (fx ? 0.03 : 0.045 * s), yV + 0.65 * s, cz - (fz ? 0.03 : 0.045 * s), cx + (fx ? 0.03 : 0.045 * s), yP - 0.65 * s, cz + (fz ? 0.03 : 0.045 * s))); }
      for (const vy of [yV + 0.33 * s, yP - 0.33 * s]) for (const o of [-0.33 * s, 0.33 * s]) {
        const c = [x + fx * q + lx * o, vy, z + fz * q + lz * o], out = (k) => [c[0] + fx * k, c[1], c[2] + fz * k];
        bag.add(C, rod(out(-0.05), out(0.1 * s), 0.31 * s, 14));
        bag.add(C, rod(out(0.09 * s), out(0.16 * s), 0.2 * s, 12));
        bag.add(C, rod(out(0.15 * s), out(0.21 * s), 0.08 * s, 8));
      }
    }
  }
  bullProtomes(bag, x, z, yS, s, beam === 'x');
}

/** The two kneeling bulls back to back on a capital, their saddle's top at yS, their axis along x (or z). */
function bullProtomes(bag, x, z, yS, s, axisX) {
  const l = axisX ? [0, 1] : [1, 0], Y = (v) => yS + v * s;
  bag.add(C, axisX ? box(x - 1.5 * s, Y(-1.55), z - 0.6 * s, x + 1.5 * s, Y(-1.45), z + 0.6 * s) : box(x - 0.6 * s, Y(-1.55), z - 1.5 * s, x + 0.6 * s, Y(-1.45), z + 1.5 * s));
  // the saddle between the two necks, where the beam lies
  bag.add(C, axisX ? box(x - 0.5 * s, Y(-1.45), z - 0.5 * s, x + 0.5 * s, Y(0), z + 0.5 * s) : box(x - 0.5 * s, Y(-1.45), z - 0.5 * s, x + 0.5 * s, Y(0), z + 0.5 * s));
  for (const side of [-1, 1]) {
    const f = axisX ? [side, 0] : [0, side], P = (a, b, v) => [x + (f[0] * a + l[0] * b) * s, Y(v), z + (f[1] * a + l[1] * b) * s];
    const E = (a, b, v, rf, ry, rl, seg = 12, p = 1) => bag.add(C, ell(P(a, b, v), f, l, rf * s, ry * s, rl * s, seg, p));
    E(0.85, 0, -0.72, 1.0, 0.6, 0.55, 16, 0.6);         // the forepart of the body, carved square
    E(1.5, 0, -0.62, 0.36, 0.5, 0.48);                  // the dewlap and chest
    E(1.45, 0, -0.2, 0.42, 0.46, 0.38, 16, 0.8);        // the neck, short and thick
    E(1.98, 0, 0.16, 0.52, 0.28, 0.27, 16, 0.7);        // the head held level, long-faced,
    E(2.4, 0, 0.03, 0.17, 0.2, 0.22, 12, 0.8);          // the muzzle
    for (const b of [-1, 1]) {
      E(1.8, b * 0.32, 0.38, 0.12, 0.07, 0.17, 8);        // the ears
      taper(bag, S, P(1.82, b * 0.2, 0.48), P(1.9, b * 0.4, 0.56), 0.065 * s, 0.05 * s);        // the horns, curving out and forward
      taper(bag, S, P(1.9, b * 0.4, 0.56), P(2.12, b * 0.42, 0.62), 0.05 * s, 0.006 * s);
      E(1.25, b * 0.28, -1.0, 0.22, 0.38, 0.16, 10);       // the forelegs folded under the chest, hooves forward
      E(1.68, b * 0.28, -1.31, 0.42, 0.13, 0.14, 10);
      E(2.08, b * 0.28, -1.32, 0.11, 0.12, 0.14, 8);
      for (const k of [0, 1, 2]) E(1.72 + k * 0.05, b * (0.12 + k * 0.1), -0.5 - k * 0.14, 0.12, 0.1, 0.1, 8);   // the curls of the chest
    }
  }
}

/** A stepped (crenellated) parapet of merlons along a segment: each merlon in three steps. */
function merlons(bag, a, b, y, h = 1.4, w = 1.1, mat = S, th = 0.7) {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.floor(L / (w * 2)), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L;
  for (let i = 0; i < n; i++) {
    const s = (i + 0.5) * L / n, cx = a[0] + ux * s, cz = a[1] + uz * s, hw = w / 2;
    const hx = Math.abs(ux) > 0.5 ? hw : th / 2, hz = Math.abs(ux) > 0.5 ? th / 2 : hw, ax = Math.abs(ux) > 0.5;
    for (let k = 0; k < 3; k++) {
      const f = 1 - k / 3, ex = ax ? hx * f : hx, ez = ax ? hz : hz * f;
      bag.add(mat, box(cx - ex, y + h * k / 3, cz - ez, cx + ex, y + h * (k + 1) / 3, cz + ez));
    }
  }
}

/** terrace: the great platform { rect, y0, y1 } of dressed stone, its parapet of merlons (skip `open` segments as [x0,z0,x1,z1] gaps). */
function terrace(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect;
  bag.add(S, box(x0, el.y0, z0, x1, el.y1, z1)); col.rect(el.rect, el.y0, el.y1); col.floor(el.rect, el.y1);
  if (el.simple) return;
  const gaps = el.gaps || [], inGap = (x, z) => gaps.some((g) => x >= g[0] && x <= g[2] && z >= g[1] && z <= g[3]);
  for (const [a, b] of [[[x0, z0], [x1, z0]], [[x1, z0], [x1, z1]], [[x1, z1], [x0, z1]], [[x0, z1], [x0, z0]]]) {
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.ceil(L / 20);
    for (let i = 0; i < n; i++) {
      const p = [a[0] + (b[0] - a[0]) * i / n, a[1] + (b[1] - a[1]) * i / n], q = [a[0] + (b[0] - a[0]) * (i + 1) / n, a[1] + (b[1] - a[1]) * (i + 1) / n];
      if (inGap((p[0] + q[0]) / 2, (p[1] + q[1]) / 2)) continue;
      merlons(bag, p, q, el.y1);
    }
  }
}

/** hall: a hypostyle hall { rect, y, h (column height), grid [nx, nz], porticoes ('nwe…'), towers, walls (thick mudbrick), plinth (height of its own platform) }. */
function hall(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, pl = el.plinth ?? 0, y = (el.y ?? 0) + pl, h = el.h, [nx, nz] = el.grid, d = el.d ?? Math.min(1.6, h * 0.09);
  const port = el.porticoes ?? '', pd = el.portDepth ?? (x1 - x0) / (nx + 1) * 2.2, th = el.walls ?? 5;
  const P = [x0 - (port.includes('w') ? pd : 0), z0 - (port.includes('n') ? pd : 0), x1 + (port.includes('e') ? pd : 0), z1 + (port.includes('s') ? pd : 0)];
  if (pl > 0) {
    bag.add(S, box(P[0] - 3, el.y ?? 0, P[1] - 3, P[2] + 3, y, P[3] + 3)); col.rect([P[0] - 3, P[1] - 3, P[2] + 3, P[3] + 3], el.y ?? 0, y);
    col.floor([P[0] - 3, P[1] - 3, P[2] + 3, P[3] + 3], y);
  }
  bag.add(S, box(P[0], y, P[1], P[2], y + 0.15, P[3])); col.floor(P, y + 0.15);
  // the columns of the hall
  const sx = (x1 - x0) / nx, sz = (z1 - z0) / nz;
  for (let i = 0; i < nx; i++) for (let k = 0; k < nz; k++) column(bag, col, x0 + (i + 0.5) * sx, z0 + (k + 0.5) * sz, y + 0.15, h, d, 'x', el.simple);
  // the porticoes: two rows of columns the width of the hall
  for (const f of port) {
    const alongX = f === 'n' || f === 's', n = alongX ? nx : nz;
    for (let r = 0; r < 2; r++) for (let i = 0; i < n; i++) {
      const off = (r + 0.5) * pd / 2;
      const x = alongX ? x0 + (i + 0.5) * sx : (f === 'w' ? x0 - off : x1 + off), z = alongX ? (f === 'n' ? z0 - off : z1 + off) : z0 + (i + 0.5) * sz;
      column(bag, col, x, z, y + 0.15, h, d, alongX ? 'z' : 'x', el.simple);
    }
  }
  // the thick walls with a great door in the middle of each side (open toward porticoes and where `doors` say)
  const doors = el.doors ?? 'nesw', dw = Math.min(5, (x1 - x0) * 0.12), dh = Math.min(h * 0.6, 12);
  const fd = 0.12, jw = 0.75;
  const wallSeg = (r, door) => {
    if (!door) { bag.add(W, box(r[0], y, r[1], r[2], y + h + 1.2, r[3])); col.rect(r, y, y + h + 1.2); return; }
    const alongX = r[2] - r[0] > r[3] - r[1], m = alongX ? (r[0] + r[2]) / 2 : (r[1] + r[3]) / 2;
    const A = alongX ? [r[0], r[1], m - dw / 2, r[3]] : [r[0], r[1], r[2], m - dw / 2], B = alongX ? [m + dw / 2, r[1], r[2], r[3]] : [r[0], m + dw / 2, r[2], r[3]];
    for (const q of [A, B]) { bag.add(W, box(q[0], y, q[1], q[2], y + h + 1.2, q[3])); col.rect(q, y, y + h + 1.2); }
    const L = alongX ? [m - dw / 2, r[1], m + dw / 2, r[3]] : [r[0], m - dw / 2, r[2], m + dw / 2];
    bag.add(W, box(L[0], y + dh + 0.1, L[1], L[2], y + h + 1.2, L[3]));
    doorFrame(bag, alongX, m, alongX ? r[1] : r[0], alongX ? r[3] : r[2], y, dw, dh, el.reliefs && !el.simple);
  };
  // the frame of polished stone round a door: two jambs the depth of the wall, the lintel, the
  // Egyptian cornice above it (a roll, the flaring gorge of upright leaves, a fillet); on the
  // jambs' inner faces, where `reliefs`, the royal hero stabbing a rearing lion
  const doorFrame = (bag, alongX, m, c0, c1, y, dw, dh, rel) => {
    const Bx = (a0, a1, b0, b1, y0, y1, mat = 'marble_dark') => bag.add(mat, alongX ? box(a0, y0, b0, a1, y1, b1) : box(b0, y0, a0, b1, y1, a1));
    const a0 = m - dw / 2, a1 = m + dw / 2, b0 = c0 - fd, b1 = c1 + fd;
    Bx(a0 - jw, a0 + 0.06, b0, b1, y, y + dh); Bx(a1 - 0.06, a1 + jw, b0, b1, y, y + dh);
    Bx(a0 - jw, a1 + jw, b0, b1, y + dh, y + dh + 0.7);
    const yc = y + dh + 0.7;
    Bx(a0 - jw - 0.06, a1 + jw + 0.06, b0 - 0.08, b1 + 0.08, yc, yc + 0.18);
    const g = alongX ? frustum([a0 - jw - 0.04, b0 - 0.04, a1 + jw + 0.04, b1 + 0.04], yc + 0.18, yc + 0.78, -0.12, -0.12, -0.38, -0.38)
      : frustum([b0 - 0.04, a0 - jw - 0.04, b1 + 0.04, a1 + jw + 0.04], yc + 0.18, yc + 0.78, -0.38, -0.38, -0.12, -0.12);
    bag.add('marble_dark', g);
    // the leaves on the gorge's two broad faces
    const nL = Math.round((a1 - a0 + 2 * jw) / 0.26);
    for (let i = 0; i < nL; i++) {
      const u = a0 - jw + (i + 0.5) * (a1 - a0 + 2 * jw) / nL;
      for (const [bb, sg] of [[b0 - 0.04, -1], [b1 + 0.04, 1]]) {
        const lf = alongX ? frustum([u - 0.045, sg < 0 ? bb - 0.03 : bb - 0.01, u + 0.045, sg < 0 ? bb + 0.01 : bb + 0.03], yc + 0.2, yc + 0.74, 0, 0, sg < 0 ? -0.34 : 0, sg < 0 ? 0 : -0.34)
          : frustum([sg < 0 ? bb - 0.03 : bb - 0.01, u - 0.045, sg < 0 ? bb + 0.01 : bb + 0.03, u + 0.045], yc + 0.2, yc + 0.74, sg < 0 ? -0.34 : 0, sg < 0 ? 0 : -0.34, 0, 0);
        bag.add('marble_dark', lf);
      }
    }
    Bx(a0 - jw - 0.2, a1 + jw + 0.2, b0 - 0.5, b1 + 0.5, yc + 0.78, yc + 0.92);
    if (!rel) return;
    const size = Math.min(2.6, dh * 0.62, (b1 - b0) * 0.95 / 0.93), cu = (b0 + b1) / 2;
    for (const [fx, sg] of [[a0 + 0.06, 1], [a1 - 0.06, -1]]) {
      const place = (u, v, w) => (alongX ? [fx + sg * w, y + v, u] : [u, y + v, fx + sg * w]);
      const dir = sg, u0 = cu - dir * 0.235 * size;
      relief(bag, 'marble_dark', 'hero', place, u0, 0.35, size, dir, 0.08);
      relief(bag, 'marble_dark', 'rampant', place, u0, 0.35, size, dir, 0.07);
      strip(bag, 'gilt_bronze', place, u0 + dir * 0.21 * size, 0.35 + 0.6 * size, u0 + dir * 0.36 * size, 0.35 + 0.47 * size, 0.022 * size, 0.1);
    }
  };
  if (th > 0) {
    wallSeg([x0 - th, z0 - th, x1 + th, z0], doors.includes('n'));
    wallSeg([x0 - th, z1, x1 + th, z1 + th], doors.includes('s'));
    wallSeg([x0 - th, z0, x0, z1], doors.includes('w'));
    wallSeg([x1, z0, x1 + th, z1], doors.includes('e'));
  }
  // the corner towers
  if (el.towers && th > 0) for (const [cx, cz] of [[P[0], P[1]], [P[2], P[1]], [P[0], P[3]], [P[2], P[3]]]) {
    const t = el.towers, q = [cx - t / 2, cz - t / 2, cx + t / 2, cz + t / 2];
    bag.add(W, box(q[0], el.y ?? 0, q[1], q[2], y + h + 3, q[3])); col.rect(q, el.y ?? 0, y + h + 3);         // from the terrace: they stand out past the plinth
    if (!el.simple) merlons(bag, [q[0], q[1]], [q[2], q[1]], y + h + 3, 1.6, 1.2, W), merlons(bag, [q[0], q[3]], [q[2], q[3]], y + h + 3, 1.6, 1.2, W);
  }
  // the main beams lying in the capitals' saddles (across the bulls), then the cedar ceiling and a flat earth roof over all, porticoes included
  if (!el.simple) {
    const bs = (d / 2) / 0.8, bw = 0.38 * bs, by = y + h - 0.7 * bs + 0.15;
    for (let i = 0; i < nx; i++) { const x = x0 + (i + 0.5) * sx; bag.add('cedar', box(x - bw, by, z0, x + bw, y + h + 0.15, z1)); }
    for (const f of port) for (let r = 0; r < 2; r++) {
      const off = (r + 0.5) * pd / 2;
      if (f === 'n' || f === 's') { const z = f === 'n' ? z0 - off : z1 + off; bag.add('cedar', box(P[0], by, z - bw, P[2], y + h + 0.15, z + bw)); }
      else { const x = f === 'w' ? x0 - off : x1 + off; bag.add('cedar', box(x - bw, by, z0, x + bw, y + h + 0.15, z1)); }
    }
  }
  bag.add('cedar', box(P[0] - 0.3, y + h, P[1] - 0.3, P[2] + 0.3, y + h + 0.8, P[3] + 0.3));
  bag.add(W, box(P[0] - 0.6, y + h + 0.8, P[1] - 0.6, P[2] + 0.6, y + h + 1.6, P[3] + 0.6)); col.floor(P, y + h + 1.6);
  if (!el.simple) for (const [a, b] of [[[P[0], P[1]], [P[2], P[1]]], [[P[0], P[3]], [P[2], P[3]]], [[P[0], P[1]], [P[0], P[3]]], [[P[2], P[1]], [P[2], P[3]]]]) merlons(bag, a, b, y + h + 1.6, 1.4, 1.1, W);
}

/**
 * apadana_stair: a stairway up the face of the Apadana's plinth { face ('n' | 'e'), line (the face's
 * x or z), span [a0, a1] (the face between the towers), c (the stair's centre along it), W (its
 * width), D (its depth out from the face), y (the terrace), h (the plinth), wings ('nobles' |
 * 'tribute', the west/north wing and the east/south wing) } (docs/settlements/persepolis.md §1, §4):
 * a block projecting from the face with two flights rising toward its middle, their parapets
 * stepping up under rows of stepped merlons; on its front the central panel — the winged disc
 * between two sphinxes over eight guards, four from either side — and under each flight, in the
 * triangle, the lion leaping on the bull; along the face either side the three registers of the
 * procession between bands of rosettes, Persians and Medes or the delegations with their gifts
 * divided by cypresses; guards climbing the parapets.
 */
function apadanaStair(el, { bag, col }) {
  const { face, line, c, y, h } = el, [s0, s1] = el.span, W = el.W ?? 32, D = el.D ?? 7.5, Lf = el.flight ?? 10, pt = 0.8, ph = 1.0;
  const M = face === 'n' ? (a, o) => [a, line - o] : (a, o) => [line + o, a];
  const R = (a0, a1, o0, o1) => { const p = M(a0, o0), q = M(a1, o1); return [Math.min(p[0], q[0]), Math.min(p[1], q[1]), Math.max(p[0], q[0]), Math.max(p[1], q[1])]; };
  const Box = (mat, a0, a1, o0, o1, y0, y1) => { const r = R(a0, a1, o0, o1); bag.add(mat, box(r[0], y0, r[1], r[2], y1, r[3])); return r; };
  // a prism with the convex outline [[a, y], …] across o0…o1
  const prismAY = (mat, pts, o0, o1) => {
    const t = [], V = ([a, yy], o) => { const [x, z] = M(a, o); return [x, yy, z]; }, n = pts.length;
    for (let k = 0; k < n; k++) { const p = pts[k], q = pts[(k + 1) % n]; t.push(...V(p, o0), ...V(q, o0), ...V(q, o1), ...V(p, o0), ...V(q, o1), ...V(p, o1)); }
    for (let k = 1; k < n - 1; k++) { t.push(...V(pts[0], o0), ...V(pts[k], o0), ...V(pts[k + 1], o0)); t.push(...V(pts[0], o1), ...V(pts[k + 1], o1), ...V(pts[k], o1)); }
    bag.add(mat, fromTriangles(orientOutward(t)));
  };
  const front = (u, v, w) => { const [x, z] = M(u, D + w); return [x, y + v, z]; };
  const wall = (u, v, w) => { const [x, z] = M(u, w); return [x, y + v, z]; };
  const L0 = c - W / 2 + Lf, L1 = c + W / 2 - Lf;
  // the middle block (the landing at the top) and its parapet
  const mr = Box(S, L0, L1, 0, D, y - 0.2, y + h); col.rect(mr, y, y + h); col.floor(mr, y + h);
  const pr = Box(S, L0, L1, D - pt, D, y + h, y + h + ph); col.rect(pr, y + h, y + h + ph);
  merlonsAlong(bag, M, L0, L1, D - pt / 2, y + h + ph);
  // the two flights, each rising toward the middle, with its sloping parapet on the open side
  const steps = Math.round(h / 0.1), tread = Lf / steps;
  for (const sg of [-1, 1]) {
    const aOut = sg < 0 ? c - W / 2 : c + W / 2, aIn = sg < 0 ? L0 : L1, up = -sg;            // up: the way the flight rises along a
    for (let k = 0; k < steps; k++) {
      const a = aOut + up * k * tread;
      Box(S, Math.min(a, aIn), Math.max(a, aIn), 0, D - pt, y - 0.2, y + (k + 1) * h / steps);
    }
    const fr = R(aOut, aIn, 0, D - pt); col.ramp(fr, y, y + h, face === 'n' ? (up > 0 ? 'e' : 'w') : (up > 0 ? 's' : 'n'));
    prismAY(S, [[aOut, y - 0.2], [aIn, y - 0.2], [aIn, y + h + ph], [aOut, y + ph]], D - pt, D);
    for (let k = 0; k < 8; k++) { const a = aOut + up * (k + 0.5) * Lf / 8; col.segment(M(a - Lf / 16, D - pt / 2), M(a + Lf / 16, D - pt / 2), pt, y, y + ph + h * (k + 1) / 8); }
    // stepped merlons along the slope, each set on the parapet at its lower edge
    for (let k = 0; k < 9; k++) {
      const a = aOut + up * (k + 0.6) * Lf / 9.4, lo = a - up * 0.35;
      merlon(bag, M, a, D - pt / 2, y + ph + h * Math.abs(lo - aOut) / Lf, 0.9, 0.7, 0.55, face);
    }
    // the band of the parapet's front, its guards climbing toward the top; the lion and the bull in the triangle below
    const top = (a) => y + ph + h * Math.abs(a - aOut) / Lf - y;
    strip(bag, S, front, aOut, top(aOut) - 0.95, aIn, top(aIn) - 0.95, 0.07, 0.05);
    for (let k = 0; k < 6; k++) {
      const a = aOut + up * (k + 0.8) * Lf / 7;
      relief(bag, C, 'persian', front, a, top(a) - 0.88, 0.7, up, 0.05);
      strip(bag, C, front, a + up * 0.115 * 0.7, top(a) - 0.88, a + up * 0.115 * 0.7, top(a) - 0.88 + 0.75, 0.018, 0.065);
    }
    const size = 1.45, u0 = aIn - up * (0.5 * size + 0.35);
    relief(bag, C, 'bull', front, u0, 0.12, size, up, 0.07);
    relief(bag, C, 'lion', front, u0, 0.12, size, up, 0.09);
  }
  // the central panel: rosette borders, the winged disc between sphinxes, the guards below
  for (let a = L0 + 0.25; a < L1 - 0.1; a += 0.32) { rosette(bag, S, front, a, h - 0.13, 0.1); rosette(bag, S, front, a, 0.1, 0.07); }
  relief(bag, C, 'disc', front, c, 1.4, 1.35, 1, 0.07);
  for (const sg of [-1, 1]) {
    relief(bag, C, 'sphinx', front, c + sg * 2.7, 1.48, 0.85, -sg, 0.07);
    for (let k = 0; k < 4; k++) {
      const a = c + sg * (1.4 + k * 0.95);
      relief(bag, C, 'persian', front, a, 0.2, 1.1, -sg, 0.07);
      strip(bag, C, front, a - sg * 0.13 * 1.1, 0.2, a - sg * 0.13 * 1.1, 0.2 + 1.2, 0.025, 0.085);
    }
  }
  // the wings: three registers of the procession, all walking toward the stair
  const reg = [0.2, 0.93, 1.66], rh = 0.66;
  for (const [w0, w1, kind] of [[s0, c - W / 2, el.wings?.[0] ?? 'nobles'], [c + W / 2, s1, el.wings?.[1] ?? 'nobles']]) {
    const toward = w1 <= c ? 1 : -1;
    for (let a = w0 + 0.2; a < w1 - 0.1; a += 0.32) { rosette(bag, S, wall, a, h - 0.12, 0.1); rosette(bag, S, wall, a, 0.09, 0.07); }
    for (const v of [0.88, 1.61]) strip(bag, S, wall, w0 + 0.1, v, w1 - 0.1, v, 0.06, 0.05);
    reg.forEach((v, ri) => {
      let a = toward > 0 ? w1 - 0.6 : w0 + 0.6, i = 0;
      const end = (q) => (toward > 0 ? q > w0 + 0.5 : q < w1 - 0.5);
      while (end(a)) {
        if (kind === 'tribute') {
          // a delegation: an usher, three bearers and their animal, then a cypress
          const k = i % 6;
          if (k === 5) { relief(bag, C, 'cypress', wall, a, v, rh, 1, 0.05); a -= toward * 0.55; }
          else if (k === 4) { relief(bag, C, 'ram', wall, a - toward * 0.1, v, rh * 0.95, toward, 0.05); a -= toward * 0.75; }
          else { relief(bag, C, k === 0 ? 'persian' : 'bearer', wall, a, v, rh * 0.96, toward, 0.05); a -= toward * 0.52; }
        } else {
          // Persians and Medes by turns, a cypress now and then
          if (i % 9 === 8) { relief(bag, C, 'cypress', wall, a, v, rh, 1, 0.05); a -= toward * 0.5; }
          else { relief(bag, C, (i + ri) % 2 ? 'mede' : 'persian', wall, a, v, rh * 0.96, toward, 0.05); a -= toward * 0.5; }
        }
        i++;
      }
    });
    // the wing's parapet of stepped merlons along the plinth's edge
    merlonsAlong(bag, M, w0 + 0.3, w1 - 0.3, 0.3, y + h);
  }
}
/** One stepped merlon at (a, o) in a stair's frame, its base at yb. */
function merlon(bag, M, a, o, yb, hgt, w, th, face) {
  for (let k = 0; k < 3; k++) {
    const f = 1 - k / 3, [x, z] = M(a, o), ex = face === 'n' ? w / 2 * f : th / 2, ez = face === 'n' ? th / 2 : w / 2 * f;
    bag.add(S, box(x - ex, yb + hgt * k / 3, z - ez, x + ex, yb + hgt * (k + 1) / 3, z + ez));
  }
}
function merlonsAlong(bag, M, a0, a1, o, yb) {
  const n = Math.max(1, Math.floor((a1 - a0) / 1.25)), probe = M(1, 0), face = probe[0] === 1 ? 'n' : 'e';
  for (let i = 0; i < n; i++) merlon(bag, M, a0 + (i + 0.5) * (a1 - a0) / n, o, yb, 0.9, 0.7, 0.55, face);
}

/** lamassu_gate: the Gate of All Nations { c, s (side), h }: a square hall of four columns, great doors west and east guarded by winged bulls. */
function gate(el, ctx) {
  const { bag } = ctx, [cx, cz] = el.c, s = el.s, h = el.h;
  hall({ rect: [cx - s / 2, cz - s / 2, cx + s / 2, cz + s / 2], y: el.y, h, grid: [2, 2], walls: 4, doors: 'we', d: 1.3, simple: el.simple }, ctx);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) lamassu(bag, cx + sx * (s / 2 + 3.2), cz + sz * 3.4, el.y ?? 0, sx, sz);
}

// an ellipsoid in a frame: centre c, radii along f (forward), y, l (lateral)
// the ellipsoid's profile; with p < 1 it squares toward a block (the carved forms of the capitals)
const ELLS = {};
const ellProfile = (p) => (ELLS[p] ??= Array.from({ length: 9 }, (_, i) => { const a = -Math.PI / 2 + i * Math.PI / 8, c = Math.cos(a), sn = Math.sin(a); return [Math.max(0.001, Math.abs(c) ** p), Math.sign(sn) * Math.abs(sn) ** p]; }));
function ell(c, f, l, rf, ry, rl, seg = 12, p = 1) {
  if (f[0] * l[1] - f[1] * l[0] < 0) l = [-l[0], -l[1]];             // keep the frame right-handed (the faces wound outward)
  const n = 2 / p, g = lathe(ellProfile(p), seg, p < 1 ? (th) => (Math.abs(Math.cos(th)) ** n + Math.abs(Math.sin(th)) ** n) ** (-1 / n) : null);
  g.scale(rf, ry, rl);
  // the lathe's x is along f, its z along l
  g.applyMatrix4(new Matrix4().fromArray([f[0], 0, f[1], 0, 0, 1, 0, 0, l[0], 0, l[1], 0, c[0], c[1], c[2], 1]));
  return g;
}
/** A tapering round piece from a to b (radii r0 → r1), its tip closed: horns. */
function taper(bag, mat, a, b, r0, r1) {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]), g = lathe([[r0, 0], [r1, L], [0.001, L + r1]], 8);
  const dir = [(b[0] - a[0]) / L, (b[1] - a[1]) / L, (b[2] - a[2]) / L], ax = [dir[2], 0, -dir[0]], al = Math.hypot(ax[0], ax[2]), ang = Math.acos(Math.max(-1, Math.min(1, dir[1])));
  const M4 = new Matrix4();
  if (al > 1e-9) M4.makeRotationAxis(new Vector3(ax[0] / al, 0, ax[2] / al), ang); else if (dir[1] < 0) M4.makeRotationX(Math.PI);
  M4.setPosition(a[0], a[1], a[2]);
  g.applyMatrix4(M4); bag.add(mat, g);
}
/**
 * A winged bull with a man's head (lamassu) standing at a portal, facing out along x (sx), its outer
 * side toward sz: the plinth, the body and its four legs, the chest, the great wing sweeping up and
 * back along the outer flank in rows of feathers, the bearded head under its tall horned crown.
 */
function lamassu(bag, x, z, y, sx, sz) {
  const f = [sx, 0], l = [0, sz], P = (a, b) => [x + f[0] * a + l[0] * b, z + f[1] * a + l[1] * b];
  bag.add(S, box(x - 3.0, y, z - 1.0, x + 3.0, y + 0.6, z + 1.0));
  const yb = y + 0.6;
  // legs: the forelegs together under the chest, the hind legs striding
  for (const [a, b] of [[1.9, -0.42], [1.9, 0.42], [-1.9, -0.42], [-1.3, 0.42]]) { const [lx, lz] = P(a, b); bag.add(S, lathe([[0.4, 0], [0.3, 0.3], [0.27, 1.6], [0.36, 2.2]], 10, null, lx, yb, lz)); }
  const [bx, bz] = P(0, 0);
  bag.add(S, ell([bx, yb + 3.0, bz], f, l, 2.6, 1.15, 0.85));
  const [chx, chz] = P(1.85, 0);
  bag.add(S, ell([chx, yb + 3.3, chz], f, l, 0.95, 1.35, 0.8));
  // the wing: one great curved plate along the outer flank, sweeping up behind the head, with the
  // ridges of its rows of feathers
  const outline = [[1.7, 3.0], [0.2, 2.75], [-1.6, 2.85], [-2.55, 3.3], [-2.5, 4.3], [-1.9, 5.4], [-0.9, 6.0], [0.3, 6.05], [1.1, 5.5], [1.6, 4.3]];
  const tri = [], cA = outline.reduce((q, p) => q + p[0], 0) / outline.length, cY = outline.reduce((q, p) => q + p[1], 0) / outline.length;
  const W3 = (a, yy, o) => { const [px, pz] = P(a, o); return [px, yb + yy, pz]; };
  for (let i = 0; i < outline.length; i++) {
    const [a0, y0] = outline[i], [a1, y1] = outline[(i + 1) % outline.length];
    for (const o of [0.78, 1.0]) tri.push(...W3(cA, cY, o), ...W3(a0, y0, o), ...W3(a1, y1, o));
    tri.push(...W3(a0, y0, 0.78), ...W3(a0, y0, 1.0), ...W3(a1, y1, 1.0), ...W3(a0, y0, 0.78), ...W3(a1, y1, 1.0), ...W3(a1, y1, 0.78));
  }
  const both = []; for (let i = 0; i < tri.length; i += 9) both.push(...tri.slice(i, i + 9), ...tri.slice(i, i + 3), ...tri.slice(i + 6, i + 9), ...tri.slice(i + 3, i + 6));
  bag.add(S, fromTriangles(both));
  for (let r = 0; r < 4; r++) {
    const yy = 3.5 + r * 0.6, a0 = 1.4 - r * 0.1, a1 = -2.3 + r * 0.35, [p0x, p0z] = P(a0, 1.04), [p1x, p1z] = P(a1, 1.04);
    const L = Math.hypot(p1x - p0x, p1z - p0z), g = box(-L / 2, 0, -0.04, L / 2, 0.1, 0.04);
    g.translate((p0x + p1x) / 2, yb + yy, (p0z + p1z) / 2); bag.add(S, g);
  }
  // the head: neck, the face, the long square beard tapering to the chest, the tall horned crown
  const [hx, hz] = P(2.3, 0);
  bag.add(S, lathe([[0.55, 0], [0.48, 0.6], [0.001, 0.62]], 10, null, hx, yb + 4.0, hz));
  bag.add(S, ell([hx, yb + 4.95, hz], f, l, 0.42, 0.55, 0.4));
  const [bdx, bdz] = P(2.55, 0);
  bag.add(S, frustum([bdx - 0.18, bdz - 0.32, bdx + 0.18, bdz + 0.32], yb + 3.7, yb + 4.75, 0.02, 0.02, -0.04, -0.04));
  for (let k = 0; k < 5; k++) bag.add(S, box(bdx - 0.2, yb + 3.8 + k * 0.19, bdz - 0.33, bdx + 0.2, yb + 3.85 + k * 0.19, bdz + 0.33));     // the beard's curled rows
  bag.add(S, lathe([[0.36, 0], [0.4, 0.75], [0.45, 0.8], [0.45, 0.88], [0.001, 0.88]], 12, null, hx, yb + 5.35, hz));
  for (const k of [0.2, 0.45, 0.68]) bag.add(S, lathe([[0.4, 0], [0.4, 0.06], [0.001, 0.06]], 12, null, hx, yb + 5.35 + k, hz));
}

/**
 * audience: the king's place in a hall { c (the throne), y (floor), dir: [x, z] (the way he faces), aisle (its
 * length) }: a dais of two steps, the throne with its lion feet and high back, the footstool, the canopy on
 * four posts with its fringe, two incense burners on tall stands, and the long carpet down the aisle.
 */
function audience(el, { bag, col }) {
  const [cx, cz] = el.c, y = el.y, d = el.dir ?? [0, -1], u = [-d[1], d[0]], L = el.aisle ?? 40;
  const P = (a, b) => [cx + d[0] * a + u[0] * b, cz + d[1] * a + u[1] * b];
  const Bx = (a0, a1, b0, b1, y0, y1, m) => { const p = P(a0, b0), q = P(a1, b1); bag.add(m, box(Math.min(p[0], q[0]), y0, Math.min(p[1], q[1]), Math.max(p[0], q[0]), y1, Math.max(p[1], q[1]))); };
  // the carpet down the aisle, a border of another colour
  Bx(2.6, 2.6 + L, -1.6, 1.6, y, y + 0.03, 'cloth_indigo');
  Bx(2.6, 2.6 + L, -1.3, 1.3, y + 0.03, y + 0.045, 'cloth_red');
  // the dais in two steps
  Bx(-2.6, 2.6, -3, 3, y, y + 0.35, S); Bx(-2.0, 2.0, -2.4, 2.4, y + 0.35, y + 0.7, S);
  const r = [P(-2.6, -3), P(2.6, 3)]; col.rect([Math.min(r[0][0], r[1][0]), Math.min(r[0][1], r[1][1]), Math.max(r[0][0], r[1][0]), Math.max(r[0][1], r[1][1])], y, y + 0.7);
  const dy = y + 0.7;
  // the throne: lion feet, the seat, the high back, cushions; the footstool before it
  for (const [a, b] of [[0.45, -0.6], [0.45, 0.6], [-0.35, -0.6], [-0.35, 0.6]]) { const p = P(a, b); bag.add('gilt_bronze', lathe([[0.12, 0], [0.09, 0.15], [0.07, 0.5]], 8, null, p[0], dy, p[1])); }
  Bx(-0.45, 0.55, -0.7, 0.7, dy + 0.5, dy + 0.62, 'gilt_bronze');
  Bx(-0.4, 0.5, -0.62, 0.62, dy + 0.62, dy + 0.72, 'cloth_red');
  Bx(-0.55, -0.42, -0.7, 0.7, dy + 0.5, dy + 1.9, 'gilt_bronze');
  for (const b of [-0.7, 0.7]) { const p = P(-0.48, b); bag.add('gilt_bronze', lathe([[0.001, 0], [0.08, 0.04], [0.05, 0.15], [0.001, 0.2]], 6, null, p[0], dy + 1.9, p[1])); }
  Bx(0.75, 1.25, -0.4, 0.4, dy, dy + 0.25, 'gilt_bronze');
  // the canopy on four posts, its fringe hanging all round
  const ch = dy + 3.8;
  for (const [a, b] of [[-1.7, -2.1], [-1.7, 2.1], [1.7, -2.1], [1.7, 2.1]]) { const p = P(a, b); bag.add('gilt_bronze', lathe([[0.1, 0], [0.08, ch - dy]], 8, null, p[0], dy, p[1])); }
  Bx(-1.9, 1.9, -2.3, 2.3, ch, ch + 0.12, 'cloth_red');
  for (const [a0, a1, b0, b1] of [[-1.9, 1.9, -2.3, -2.25], [-1.9, 1.9, 2.25, 2.3], [-1.9, -1.85, -2.3, 2.3], [1.85, 1.9, -2.3, 2.3]]) Bx(a0, a1, b0, b1, ch - 0.45, ch, 'cloth_ochre');
  // the incense burners on their tall stands, before the dais
  for (const b of [-3.6, 3.6]) { const p = P(3.2, b); bag.add('bronze', lathe([[0.3, 0], [0.12, 0.2], [0.07, 1.1], [0.32, 1.25], [0.36, 1.5], [0.12, 1.65], [0.18, 1.9], [0.001, 2.1]], 10, null, p[0], y, p[1])); col.circle(p[0], p[1], 0.3, y, y + 2.1); }
}

/** persian_house: { rect, seed }: a flat-roofed mudbrick house round a small court, a parapet. */
function house(el, { bag, col }) {
  const rand = rng(el.seed || 1), [x0, z0, x1, z1] = el.rect, h = 3.2 + rand() * 0.8, t = 0.6;
  const yard = rand() < 0.6, mx = (x0 + x1) / 2;
  const parts = yard ? [[x0, z0, x1, z0 + (z1 - z0) * 0.5], [x0, z0 + (z1 - z0) * 0.5, x0 + t, z1], [x1 - t, z0 + (z1 - z0) * 0.5, x1, z1], [x0, z1 - t, mx - 0.6, z1], [mx + 0.6, z1 - t, x1, z1]] : [[x0, z0, x1, z1]];
  parts.forEach((r, i) => { const hh = i === 0 ? h : 2.2; bag.add('mudbrick', box(r[0], -0.3, r[1], r[2], hh, r[3])); col.rect(r, 0, hh); });
  bag.add('mud_plaster', box(x0 - 0.05, h, z0 - 0.05, x1 + 0.05, h + 0.3, z0 + (yard ? (z1 - z0) * 0.5 : z1 - z0) + 0.05));
}

registerStyle('achaemenid', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.qing.elements, terrace, hall, lamassu_gate: gate, audience, persian_house: house, apadana_stair: apadanaStair },
  objects: {},
});
