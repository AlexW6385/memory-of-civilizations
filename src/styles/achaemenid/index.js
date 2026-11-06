// Achaemenid architecture (6th–5th c. BC; docs/settlements/persepolis.md §4): a stone terrace with
// a crenellated parapet; hypostyle halls on tall, slender fluted stone columns with bell bases and
// double-protome capitals (bulls, lions, griffins) carrying cedar beams; thick mudbrick walls,
// plastered, with dark stone door and window frames; corner towers; gates guarded by winged bulls;
// stepped merlons; the town's flat-roofed mudbrick houses.

import { registerStyle, STYLES } from '../../core/build.js';
import { Matrix4, Vector3 } from '../../core/three.js';
import { box, frustum, lathe, fromTriangles, rod, orientOutward } from '../../core/geom.js';
import { relief, strip, rosette } from './reliefs.js';
import { jambScene } from './throne.js';
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
  const doors = el.doors ?? 'nesw', dw0 = Math.min(5, (x1 - x0) * 0.12), dh = Math.min(h * 0.6, 12);
  let dw = dw0;
  const fd = 0.12, jw = 0.75;
  const wallSeg = (r, door, face) => {
    dw = el.doorW?.[face] ?? dw0;
    if (!door) { bag.add(W, box(r[0], y, r[1], r[2], y + h + 1.2, r[3])); col.rect(r, y, y + h + 1.2); return; }
    const alongX = r[2] - r[0] > r[3] - r[1], m = alongX ? (r[0] + r[2]) / 2 : (r[1] + r[3]) / 2;
    const A = alongX ? [r[0], r[1], m - dw / 2, r[3]] : [r[0], r[1], r[2], m - dw / 2], B = alongX ? [m + dw / 2, r[1], r[2], r[3]] : [r[0], m + dw / 2, r[2], r[3]];
    for (const q of [A, B]) { bag.add(W, box(q[0], y, q[1], q[2], y + h + 1.2, q[3])); col.rect(q, y, y + h + 1.2); }
    const L = alongX ? [m - dw / 2, r[1], m + dw / 2, r[3]] : [r[0], m - dw / 2, r[2], m + dw / 2];
    bag.add(W, box(L[0], y + dh + 0.1, L[1], L[2], y + h + 1.2, L[3]));
    doorFrame(bag, alongX, m, alongX ? r[1] : r[0], alongX ? r[3] : r[2], y, dw, dh, el.reliefs && !el.simple, face);
  };
  // the frame of polished stone round a door: two jambs the depth of the wall, the lintel, the
  // Egyptian cornice above it (a roll, the flaring gorge of upright leaves, a fillet); on the
  // jambs' inner faces, where `reliefs`, the royal hero stabbing a rearing lion
  const doorFrame = (bag, alongX, m, c0, c1, y, dw, dh, rel, face) => {
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
      // the north doorways: the audience; the south: the king on the throne the peoples carry
      if (face === 'n' || face === 's') { const out = face === 'n' ? b0 : b1; jambScene(bag, face === 'n' ? 'audience' : 'throne', place, out, out === b0 ? b1 : b0, dh - 0.02); continue; }
      const dir = sg, u0 = cu - dir * 0.235 * size;
      relief(bag, 'marble_dark', 'hero', place, u0, 0.35, size, dir, 0.08);
      relief(bag, 'marble_dark', 'rampant', place, u0, 0.35, size, dir, 0.07);
      strip(bag, 'gilt_bronze', place, u0 + dir * 0.21 * size, 0.35 + 0.6 * size, u0 + dir * 0.36 * size, 0.35 + 0.47 * size, 0.022 * size, 0.1);
    }
  };
  if (th > 0) {
    wallSeg([x0 - th, z0 - th, x1 + th, z0], doors.includes('n'), 'n');
    wallSeg([x0 - th, z1, x1 + th, z1 + th], doors.includes('s'), 's');
    wallSeg([x0 - th, z0, x0, z1], doors.includes('w'), 'w');
    wallSeg([x1, z0, x1 + th, z1], doors.includes('e'), 'e');
  }
  // the colossal bulls flanking the north portico on its antae (the Hundred-Column Hall), painted blue
  if (el.bulls && port.includes('n') && th > 0 && !el.simple) for (const xc of [x0 - th / 2, x1 + th / 2]) {
    const zc = P[1] + 2.9;
    lamassu(bag, xc, zc, y, [0, -1], { kind: 'bull', skin: 'paint_blue' }); col.rect([xc - 1, zc - 3.2, xc + 1, zc + 3.2], y, y + 6.5);
    const a = [xc - th / 2, zc + 3.2, xc + th / 2, z0 - th];
    bag.add(W, box(a[0], y, a[1], a[2], y + h + 1.2, a[3])); col.rect(a, y, y + h + 1.2);
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

/**
 * lamassu_gate: the Gate of All Nations { c, s (side), h } (docs/settlements/persepolis.md §11): a square
 * hall of four columns, great doors west and east and a third on the south; the west doorway guarded
 * by a pair of bulls, the east by a pair of winged bulls with men's heads, their foreparts out past the
 * facade, their bodies lining the passage; above each colossus on the jamb the trilingual inscription
 * of Xerxes; a stone bench round the inner walls.
 */
function gate(el, ctx) {
  const { bag, col } = ctx, [cx, cz] = el.c, s = el.s, h = el.h, th = 4, y = el.y ?? 0, pw = 1.9, half = pw + 1.88;
  hall({ rect: [cx - s / 2, cz - s / 2, cx + s / 2, cz + s / 2], y, h, grid: [2, 2], walls: th, doors: 'wes', d: 1.3, simple: el.simple, doorW: { w: 2 * half, e: 2 * half } }, ctx);
  if (el.simple) return;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const bx = cx + sx * (s / 2 + 3.2), bz = cz + sz * (pw + 0.98);
    lamassu(bag, bx, bz, y, [sx, 0], { kind: sx < 0 ? 'bull' : 'man' });
    col.rect([bx - 3.2, bz - 1, bx + 3.2, bz + 1], y, y + 6.5);
    // the inscription panel on the jamb's face above it: three columns of lines (Old Persian, Elamite, Babylonian)
    const fz = cz + sz * half, xa = cx + sx * (s / 2 + 0.25), xb = cx + sx * (s / 2 + th - 0.25), x0 = Math.min(xa, xb), x1 = Math.max(xa, xb), w = sz < 0 ? 1 : -1;
    bag.add(C, box(x0, y + 7.2, Math.min(fz, fz + w * 0.03), x1, y + 9.6, Math.max(fz, fz + w * 0.03)));
    for (let c = 0; c < 3; c++) for (let r = 0; r < 14; r++) {
      const u0 = x0 + 0.15 + c * (x1 - x0 - 0.3) / 3 + 0.08, u1 = u0 + (x1 - x0 - 0.3) / 3 - 0.16, v = y + 7.38 + r * 0.15;
      bag.add(C, box(u0, v, Math.min(fz + w * 0.03, fz + w * 0.045), u1 - ((r * 7 + c * 3) % 5) * 0.06, v + 0.05, Math.max(fz + w * 0.03, fz + w * 0.045)));
    }
  }
  // the bench round the inner walls, broken at the doors
  const r = [cx - s / 2, cz - s / 2, cx + s / 2, cz + s / 2], bd = 0.6, bh = 0.5, dS = Math.min(5, s * 0.12) / 2 + 0.75;
  for (const q of [[r[0], r[1], r[2], r[1] + bd], [r[0], r[3] - bd, cx - dS, r[3]], [cx + dS, r[3] - bd, r[2], r[3]], [r[0], r[1] + bd, r[0] + bd, cz - half - 0.75], [r[0], cz + half + 0.75, r[0] + bd, r[3] - bd], [r[2] - bd, r[1] + bd, r[2], cz - half - 0.75], [r[2] - bd, cz + half + 0.75, r[2], r[3] - bd]]) {
    bag.add(S, box(q[0], y + 0.15, q[1], q[2], y + bh, q[3])); col.rect(q, y, y + bh);
  }
}

// an ellipsoid in a frame: centre c, radii along f (forward), y, l (lateral)
// the ellipsoid's profile; with p < 1 it squares toward a block (the carved forms of the capitals)
const ELLS = {};
const ellProfile = (p) => (ELLS[p] ??= Array.from({ length: 13 }, (_, i) => { const a = -Math.PI / 2 + i * Math.PI / 12, c = Math.cos(a), sn = Math.sin(a); return [Math.max(0.001, Math.abs(c) ** p), Math.sign(sn) * Math.abs(sn) ** p]; }));
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
 * A colossus at a portal (docs/settlements/persepolis.md §11), standing on its plinth and facing out
 * along the axis direction fd ([1, 0], [0, -1], …). kind 'man': the winged bull with a bearded man's
 * head under the tall horned crown (the east doorway of the Gate of All Nations); 'bull': the bull
 * (its west doorway; wingless, as at the north portico of the Hundred-Column Hall). Carved square in
 * the Achaemenid manner: the four columnar legs with their hooves and dewclaws, the forequarters, the
 * barrel and the haunches, the belly fringe of curls, the tail with its tuft; the wings on both
 * flanks — a plate set with covert feathers in rows and long primaries sweeping up and curving
 * forward at the tips; the head. `skin`: the material of the hide (the stone, or the blue paint whose
 * traces survive on the portico bull).
 */
function lamassu(bag, x, z, y, fd, { kind = 'man', wings = kind === 'man', skin = C } = {}) {
  const S = C;
  const f = fd, l = [-fd[1], fd[0]], P = (a, b) => [x + f[0] * a + l[0] * b, z + f[1] * a + l[1] * b];
  const yb = y + 0.6, Q = (a, b, v) => { const [px, pz] = P(a, b); return [px, yb + v, pz]; };
  const E = (mat, a, b, v, rf, ry, rl, seg = 14, p = 1) => bag.add(mat, ell(Q(a, b, v), f, l, rf, ry, rl, seg, p));
  // an upright box in the frame: a0…a1 along, b0…b1 across
  const RB = (mat, a0, a1, b0, b1, y0, y1) => { const p = P(a0, b0), q = P(a1, b1); bag.add(mat, box(Math.min(p[0], q[0]), y0, Math.min(p[1], q[1]), Math.max(p[0], q[0]), y1, Math.max(p[1], q[1]))); };
  RB('limestone_persian', -3.2, 3.2, -1, 1, y, yb - 0.08); RB(C, -3.25, 3.25, -1.04, 1.04, yb - 0.08, yb);
  // the legs: the forelegs together, the hind legs a little apart; hoof, pastern, fetlock and dewclaw, cannon, knee, forearm
  const LEG = [[0.33, 0], [0.32, 0.05], [0.28, 0.3], [0.23, 0.36], [0.21, 0.5], [0.27, 0.6], [0.235, 0.72], [0.225, 1.15], [0.29, 1.28], [0.27, 1.42], [0.33, 1.62], [0.42, 1.9], [0.47, 2.2]];
  for (const [a, b, hind] of [[1.85, -0.44, 0], [1.85, 0.44, 0], [-1.95, -0.44, 1], [-1.45, 0.44, 1]]) {
    const [lx, lz] = P(a, b);
    bag.add(skin, lathe(hind ? LEG.map(([r, v], i) => [r * (i > 9 ? 1.18 : 1), v]) : LEG, 12, null, lx, yb, lz));
    bag.add(C, lathe([[0.34, 0], [0.33, 0.04], [0.29, 0.29], [0.001, 0.3]], 12, null, lx, yb, lz));                    // the hoof
    RB('opening', a + 0.2, a + 0.32, b - 0.015, b + 0.015, yb + 0.02, yb + 0.24);                                    // the cleft between the claws
    E(C, a - 0.2, b, 0.5, 0.08, 0.1, 0.09, 8);                                                                       // the dewclaw
  }
  // the forequarters, the barrel, the haunches, carved square
  E(skin, 0, 0, 2.75, 2.45, 0.98, 0.8, 18, 0.72);
  E(skin, 1.62, 0, 3.05, 0.86, 1.18, 0.84, 16, 0.68);
  E(skin, -1.9, 0, 2.9, 0.92, 1.12, 0.8, 16, 0.75);
  // the belly fringe: a row of locks along the underside
  for (let i = 0; i < 15; i++) for (const b of [-0.56, 0.56]) E(skin, -1.2 + i * 0.17, b, 1.86 + 0.02 * Math.sin(i * 1.7), 0.06, 0.17, 0.06, 8);
  // the tail down the back of the haunch to its tuft
  taper(bag, skin, Q(-2.78, 0, 3.3), Q(-2.95, 0, 1.6), 0.09, 0.06);
  E(skin, -2.95, 0, 1.35, 0.13, 0.3, 0.13, 10, 0.8);
  for (let k = 0; k < 4; k++) E(skin, -2.95 + (k - 1.5) * 0.04, (k - 1.5) * 0.06, 1.05, 0.05, 0.12, 0.05, 6);
  if (wings) for (const side of [-1, 1]) {
    const lo = side * 0.5, la = side * 0.84, lf = side * 0.9;
    // the plate of the wing on the flank
    const outline = [[1.55, 3.3], [0.2, 3.25], [-1.5, 3.3], [-2.45, 3.55], [-2.55, 4.4], [-2.2, 5.3], [-1.4, 6.0], [-0.3, 6.35], [0.8, 6.15], [1.3, 5.5], [1.55, 4.4]];
    const tri = [], W3 = (a, v, o) => Q(a, o, v), cA = 0, cY = 4.6;
    for (let i = 0; i < outline.length; i++) {
      const [a0, v0] = outline[i], [a1, v1] = outline[(i + 1) % outline.length];
      tri.push(...W3(cA, cY, la), ...W3(a0, v0, la), ...W3(a1, v1, la), ...W3(cA, cY, lo), ...W3(a1, v1, lo), ...W3(a0, v0, lo));
      tri.push(...W3(a0, v0, lo), ...W3(a1, v1, lo), ...W3(a1, v1, la), ...W3(a0, v0, lo), ...W3(a1, v1, la), ...W3(a0, v0, la));
    }
    bag.add(skin, fromTriangles(orientOutward(tri)));
    // the long primaries: slats from the coverts up to the crest, curving forward at their tips
    const N = 12;
    for (let k = 0; k < N; k++) {
      const t = k / (N - 1), ab = 1.15 - t * 3.45, vb = 3.95 + t * 0.15, at = ab + 0.35 + 0.75 * t, vt = 5.05 + 1.15 * Math.sin(Math.PI * (0.15 + 0.75 * t)) - 0.25 * t;
      const w0 = 0.17, w1 = 0.12, o0 = la + side * (k % 2 ? 0.035 : 0.005), o1 = o0 + side * 0.05;
      const dv = [at - ab, vt - vb], L = Math.hypot(...dv), n = [-dv[1] / L, dv[0] / L];
      const tip = [at + dv[0] / L * 0.22, vt + dv[1] / L * 0.22];
      const quad = [[ab - n[0] * w0, vb - n[1] * w0], [ab + n[0] * w0, vb + n[1] * w0], [at + n[0] * w1, vt + n[1] * w1], [tip[0], tip[1]], [at - n[0] * w1, vt - n[1] * w1]];
      const T = [];
      for (let i = 1; i < quad.length - 1; i++) { T.push(...W3(...quad[0], o1), ...W3(...quad[i], o1), ...W3(...quad[i + 1], o1)); T.push(...W3(...quad[0], o0), ...W3(...quad[i + 1], o0), ...W3(...quad[i], o0)); }
      for (let i = 0; i < quad.length; i++) { const p = quad[i], q = quad[(i + 1) % quad.length]; T.push(...W3(...p, o0), ...W3(...q, o0), ...W3(...q, o1), ...W3(...p, o0), ...W3(...q, o1), ...W3(...p, o1)); }
      bag.add(skin, fromTriangles(orientOutward(T)));
      const mid = (s) => [ab + (at - ab) * s, vb + (vt - vb) * s];
      taper(bag, skin, W3(...mid(0.05), o1), W3(...mid(0.98), o1), 0.025, 0.012);                                      // the shaft
    }
    // the coverts: three rows of rounded feathers over the slats' roots, and the small feathers along the front
    for (let r = 0; r < 4; r++) for (let i = 0; i < 15 - r; i++) {
      const a = 1.3 - r * 0.1 - i * 0.25, v = 3.5 + r * 0.17 + 0.03 * Math.sin(i);
      E(skin, a, lf + side * (0.02 + r * 0.025), v, 0.15, 0.1, 0.04, 8);
    }
    for (let i = 0; i < 8; i++) E(skin, 1.36 - i * 0.03, lf + side * 0.02, 4.25 + i * 0.2, 0.1, 0.1, 0.04, 8);
  }
  if (kind === 'man') {
    // the neck; the face, the nose, the eyes under the brows; the bull's ears with their rings
    E(skin, 2.0, 0, 3.95, 0.58, 0.72, 0.52, 14, 0.8);
    E(S, 2.32, 0, 4.82, 0.4, 0.5, 0.39, 16, 0.85);
    E(S, 2.72, 0, 4.86, 0.09, 0.17, 0.07, 10, 0.8);                                                                    // the nose
    for (const b of [-0.15, 0.15]) {
      E(C, 2.66, b, 4.99, 0.04, 0.045, 0.085, 8);                                                                     // the eyes, almond-shaped
      E(S, 2.64, b, 5.07, 0.08, 0.035, 0.14, 8);                                                                      // the brows
      E(S, 2.6, b * 1.35, 4.72, 0.1, 0.12, 0.1, 10);                                                                  // the cheeks
    }
    E(S, 2.66, 0, 4.6, 0.06, 0.035, 0.11, 8); E(C, 2.7, 0, 4.6, 0.02, 0.012, 0.07, 6);                                  // the lips
    for (const b of [-0.4, 0.4]) { E(S, 2.15, b, 4.95, 0.11, 0.24, 0.07, 10); taper(bag, 'gilt_bronze', Q(2.2, b * 1.02, 4.74), Q(2.2, b * 1.02, 4.52), 0.035, 0.035); }
    // the long square beard in rows of curls, the moustache, the hair falling in curls at the nape
    const bA = 2.6, bw = 0.34;
    RB(S, bA - 0.45, bA, -bw, bw, yb + 3.55, yb + 4.48);
    for (let r = 0; r < 6; r++) for (let i = 0; i < 7; i++) E(S, bA + 0.01, -0.28 + i * 0.093 + (r % 2) * 0.03, 3.66 + r * 0.155, 0.04, 0.06, 0.04, 6);
    for (let r = 0; r < 5; r++) for (const b of [-bw - 0.01, bw + 0.01]) for (let i = 0; i < 3; i++) E(S, bA - 0.08 - i * 0.13, b, 3.68 + r * 0.19, 0.06, 0.07, 0.04, 6);
    for (const b of [-1, 1]) taper(bag, S, Q(2.66, b * 0.03, 4.67), Q(2.58, b * 0.3, 4.58), 0.04, 0.015);
    for (let r = 0; r < 3; r++) for (let i = 0; i < 6; i++) E(S, 1.98 - r * 0.05, -0.32 + i * 0.13, 4.3 + r * 0.17, 0.07, 0.08, 0.06, 6);
    // the crown: the tall drum on its band of horns, a band of rosettes, a crest of feathers round its top
    const [hx, hz] = P(2.28, 0);
    bag.add(S, lathe([[0.42, 0], [0.44, 0.78], [0.47, 0.82], [0.47, 0.9], [0.001, 0.9]], 20, null, hx, yb + 5.18, hz));
    for (let k = 0; k < 3; k++) for (const b of [-1, 1]) {
      const yh = 5.26 + k * 0.17, pts = [];
      for (let i = 0; i <= 6; i++) { const a = Math.PI * (0.92 - i * 0.14); pts.push(Q(2.28 + Math.cos(a) * 0.45, b * Math.sin(a) * 0.45, yh + i * 0.01)); }
      for (let i = 0; i < 6; i++) taper(bag, S, pts[i], pts[i + 1], 0.05 - i * 0.006, 0.044 - i * 0.006);
    }
    for (let i = 0; i < 10; i++) { const a = i * Math.PI / 5; bag.add(S, ell([hx + Math.cos(a) * 0.45, yb + 5.82, hz + Math.sin(a) * 0.45], [Math.cos(a), Math.sin(a)], [-Math.sin(a), Math.cos(a)], 0.03, 0.09, 0.09, 8)); }
    for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8; bag.add(S, frustum([hx + Math.cos(a) * 0.43 - 0.05, hz + Math.sin(a) * 0.43 - 0.05, hx + Math.cos(a) * 0.43 + 0.05, hz + Math.sin(a) * 0.43 + 0.05], yb + 6.08, yb + 6.3, 0.03, 0.03, 0.03, 0.03)); }
  } else {
    // the bull's head: the neck and dewlap, the skull, the muzzle with its nostrils, the eyes, the ears set level, the horns
    E(skin, 2.0, 0, 3.95, 0.66, 0.8, 0.58, 14, 0.8);
    E(skin, 2.25, 0, 3.25, 0.36, 0.55, 0.22, 10);
    E(skin, 2.5, 0, 4.5, 0.72, 0.5, 0.45, 16, 0.8);
    E(skin, 3.1, 0, 4.15, 0.32, 0.34, 0.36, 14, 0.8);
    for (const b of [-0.16, 0.16]) E(C, 3.38, b, 4.18, 0.05, 0.06, 0.06, 8);
    for (const b of [-0.38, 0.38]) { E(C, 2.68, b, 4.66, 0.09, 0.06, 0.05, 8); E(skin, 2.68, b * 0.95, 4.74, 0.13, 0.04, 0.08, 8); }
    for (const b of [-1, 1]) {
      E(skin, 2.2, b * 0.58, 4.72, 0.15, 0.09, 0.26, 10);
      taper(bag, C, Q(2.25, b * 0.34, 4.85), Q(2.38, b * 0.72, 4.98), 0.1, 0.08);
      taper(bag, C, Q(2.38, b * 0.72, 4.98), Q(2.7, b * 0.8, 5.3), 0.08, 0.012);
    }
    for (let i = 0; i < 6; i++) E(skin, 2.3 + (i % 2) * 0.05, -0.3 + i * 0.12, 4.95, 0.09, 0.07, 0.07, 6);                          // the curls of the brow
  }
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
