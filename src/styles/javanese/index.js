// Sailendra Javanese architecture (c. 800–825; docs/settlements/borobudur.md §4): Borobudur —
// redented square terraces of grey andesite with walled galleries, balustrades lined with niches
// and small stupas, steep stairs through the middle of each side, circular terraces of latticed
// bell stupas, the crowning stupa — and the timber building of the reliefs: houses raised on posts
// with walls of woven bamboo under steep thatched saddle roofs, open pavilions on platforms.

import { registerStyle, STYLES } from '../../core/build.js';
import { box, lathe, fromTriangles, orientOutward } from '../../core/geom.js';
import { rectRoof, beamTris } from '../ming/index.js';
import '../qing/index.js';

const A = 'andesite';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
function roof(bag, [x0, z0, x1, z1], y, o, kind, rise, mat, alongZ) {
  const w = x1 - x0 + 2 * o, d = z1 - z0 + 2 * o, az = alongZ ?? d > w;
  rectRoof({ c: [(x0 + x1) / 2, (z0 + z1) / 2], A: (az ? d : w) / 2, B: (az ? w : d) / 2, y, rise, kind, sweep: kind === 'gable' ? 0 : 0.4, p: 1.1, alongZ: az, curl: false, mat, soffit: 'timber' }, bag);
}
/** The outline of a redented square (half a; the middle third of each side set out by p), as points round it. */
function redent(cx, cz, a, p) {
  const t = a / 3, pts = [[-a, -a], [-t, -a], [-t, -a - p], [t, -a - p], [t, -a], [a, -a], [a, -t], [a + p, -t], [a + p, t], [a, t], [a, a], [t, a], [t, a + p], [-t, a + p], [-t, a], [-a, a], [-a, t], [-a - p, t], [-a - p, -t], [-a, -t]];
  return pts.map(([x, z]) => [cx + x, cz + z]);
}
function slab(bag, mat, a, b, y, th, h) { const t = []; beamTris(t, [a[0], y, a[1]], [b[0], y, b[1]], th / 2, h); bag.add(mat, fromTriangles(t)); }
/** A small stupa (bell, harmika, spire) of radius r at (x, y, z); `lattice` for the pierced ones. */
function stupa(bag, x, y, z, r, lattice = false) {
  if (lattice) return latticeStupa(bag, x, y, z, r, lattice);
  const S = r < 1 ? 8 : r < 3 ? 14 : 32, NR = r < 1 ? 4 : 10;
  bag.add(A, lathe([[r * 1.18, 0], [r * 1.18, r * 0.18], [r * 1.05, r * 0.3], [r * 1.0, r * 0.32]], S, null, x, y, z));
  const bell = []; for (let i = 0; i <= NR; i++) { const t = i / NR; bell.push([Math.max(0.001, r * (1 - 0.18 * t) * Math.cos(t * Math.PI / 2) ** 0.7), r * 0.32 + r * 1.25 * Math.sin(t * Math.PI / 2)]); }
  bag.add(A, lathe(bell, S, null, x, y, z));
  const hy = y + r * 1.5;
  bag.add(A, box(x - r * 0.28, hy, z - r * 0.28, x + r * 0.28, hy + r * 0.32, z + r * 0.28));
  bag.add(A, lathe([[r * 0.16, 0], [r * 0.03, r * 0.7], [0.001, r * 0.72]], r < 1 ? 4 : 8, null, x, hy + r * 0.32, z));
}

// ---- the pierced stupas of the round terraces ---------------------------------------------------

/** The bell's outer surface: radius and height at t (0 at its foot, 1 at its crown). */
const bellR = (r, t) => Math.max(0.001, r * (1 - 0.18 * t) * Math.cos(t * Math.PI / 2) ** 0.7);
const bellY = (r, t) => r * 0.32 + r * 1.25 * Math.sin(t * Math.PI / 2);
/** A double lotus cushion (padma) of radius r: two rings of petals, the upper turned up, the lower down. */
function padma(r, h, n) {
  const petals = (th) => 1 + 0.045 * Math.abs(Math.cos(th * n / 2));
  return lathe([[r * 1.02, 0], [r * 1.06, h * 0.12], [r * 1.0, h * 0.38], [r * 0.93, h * 0.45], [r * 0.93, h * 0.55], [r * 0.98, h * 0.62], [r * 1.04, h * 0.88], [r * 1.0, h], [0.001, h]], n * 2, petals);
}
/**
 * A pierced stupa (kind 'diamond' — the two lower round terraces — or 'square' — the top one): on
 * a double lotus cushion, a bell whose middle is an open lattice of stone, its holes diamonds in
 * staggered rows or squares in rows, a solid band below and the solid crown above; inside, seen
 * through the holes, the Buddha seated on his lotus; on top the harmika (square below, octagonal on
 * the top terrace) and the octagonal spire. Built at the origin and moved, so that all the stupas of
 * a terrace are one shape (drawn as instances).
 */
function latticeStupa(bag, x, y, z, r, kind) {
  const sq = kind === 'square', M = sq ? 12 : 14, K = sq ? 3 : 2, t0 = 0.08, t1 = sq ? 0.58 : 0.62, th = r * 0.08, bar = sq ? 0.26 : 0.3;
  const out = [], inn = [];
  const P = (a, b, o = 0) => { const t = t0 + (t1 - t0) * b / K, ang = a / M * Math.PI * 2, R = bellR(r, t) - o; return [x + Math.cos(ang) * R, y + bellY(r, t), z + Math.sin(ang) * R]; };
  const q = (T, a, b, c, d) => T.push(...a, ...b, ...c, ...a, ...c, ...d);
  // turn each triangle to face along want(centroid): out of the bell, into it, or into a hole
  const orient = (T, want) => {
    for (let i = 0; i < T.length; i += 9) {
      const ux = T[i + 3] - T[i], uy = T[i + 4] - T[i + 1], uz = T[i + 5] - T[i + 2], vx = T[i + 6] - T[i], vy = T[i + 7] - T[i + 1], vz = T[i + 8] - T[i + 2];
      const n = [uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx], c = [(T[i] + T[i + 3] + T[i + 6]) / 3, (T[i + 1] + T[i + 4] + T[i + 7]) / 3, (T[i + 2] + T[i + 5] + T[i + 8]) / 3], w = want(c);
      if (n[0] * w[0] + n[1] * w[1] + n[2] * w[2] < 0) for (let k = 0; k < 3; k++) { const tmp = T[i + 3 + k]; T[i + 3 + k] = T[i + 6 + k]; T[i + 6 + k] = tmp; }
    }
    return T;
  };
  const radial = (c) => [c[0] - x, 0, c[2] - z];
  // a cell of the lattice: its outline V (param points), the hole shrunk into it; the rim outside and in, the hole's sides
  const cell = (V, hole = true) => {
    const cu = V.reduce((s, v) => s + v[0], 0) / V.length, cv = V.reduce((s, v) => s + v[1], 0) / V.length, m = V.length;
    if (!hole) { const o = [], ii = []; for (let i = 1; i + 1 < m; i++) { o.push(...P(...V[0]), ...P(...V[i + 1]), ...P(...V[i])); ii.push(...P(...V[0], th), ...P(...V[i], th), ...P(...V[i + 1], th)); } out.push(...orient(o, radial)); inn.push(...orient(ii, (c) => radial(c).map((v) => -v))); return; }
    const Hh = V.map(([a, b]) => [cu + (a - cu) * (1 - bar), cv + (b - cv) * (1 - bar)]), hc = P(cu, cv, th / 2), o = [], ii = [], sd = [];
    for (let i = 0; i < m; i++) {
      const j = (i + 1) % m;
      q(o, P(...V[i]), P(...Hh[i]), P(...Hh[j]), P(...V[j]));
      q(ii, P(...V[i], th), P(...V[j], th), P(...Hh[j], th), P(...Hh[i], th));
      q(sd, P(...Hh[i]), P(...Hh[i], th), P(...Hh[j], th), P(...Hh[j]));
    }
    out.push(...orient(o, radial)); inn.push(...orient(ii, (c) => radial(c).map((v) => -v)), ...orient(sd, (c) => [hc[0] - c[0], hc[1] - c[1], hc[2] - c[2]]));
  };
  if (sq) {
    for (let j = 0; j < K; j++) for (let i = 0; i < M; i++) cell([[i, j], [i + 1, j], [i + 1, j + 1], [i, j + 1]]);
  } else {
    for (let i = 0; i < M; i++) {
      for (let j = 0; j < K; j++) cell([[i + 1, j + 0.5], [i + 0.5, j + 1], [i, j + 0.5], [i + 0.5, j]].reverse());
      for (let j = 1; j < K; j++) cell([[i + 0.5, j], [i + 1, j - 0.5], [i + 1.5, j], [i + 1, j + 0.5]]);
      cell([[i + 0.5, 0], [i + 1.5, 0], [i + 1, 0.5]], false);
      cell([[i + 0.5, K], [i + 1, K - 0.5], [i + 1.5, K]], false);
    }
  }
  // the solid band below and the crown above, outside and in (the inner surfaces face inward)
  const seg = sq ? M : 2 * M, prof = (a, b, n, o) => Array.from({ length: n + 1 }, (_, i) => { const t = a + (b - a) * i / n; return [Math.max(0.001, bellR(r, t) - o), bellY(r, t)]; });
  const tc = 0.83, lowO = prof(0, t0, 2, 0), lowI = prof(0, t0, 2, th).reverse(), topO = prof(t1, tc, 5, 0), topI = prof(t1, tc - 0.04, 5, th).reverse();
  topO.push([0.001, bellY(r, tc)]); topI.unshift([0.001, bellY(r, tc - 0.04)]);
  bag.add(A, lathe(lowO, seg, null, x, y, z)); bag.add(A, lathe(lowI, seg, null, x, y, z));
  bag.add(A, lathe(topO, seg, null, x, y, z)); bag.add(A, lathe(topI, seg, null, x, y, z));
  bag.add(A, fromTriangles(out.concat(inn)));
  // the floor inside, the lotus cushion, the Buddha
  bag.add(A, padma(r * 1.15, r * 0.32, 16).translate(x, y, z));
  bag.add(A, lathe([[r * 0.4, 0], [r * 0.42, r * 0.08], [r * 0.38, r * 0.14]], 12, null, x, y + r * 0.3, z));
  const b = r * 0.62, by = y + r * 0.44;
  bag.add(A, lathe([[b * 0.62, 0], [b * 0.6, b * 0.22], [b * 0.36, b * 0.34], [b * 0.33, b * 0.62], [b * 0.27, b * 0.78], [b * 0.2, b * 0.82], [b * 0.2, b * 0.86], [b * 0.17, b * 1.02], [b * 0.1, b * 1.1], [0.001, b * 1.13]], 10, null, x, by, z));
  // the harmika and the spire
  const hy = y + bellY(r, tc);
  if (sq) bag.add(A, lathe([[r * 0.3, 0], [r * 0.3, r * 0.22], [r * 0.34, r * 0.26], [r * 0.34, r * 0.32], [0.001, r * 0.32]], 8, null, x, hy - 0.02, z));
  else {
    bag.add(A, box(x - r * 0.27, hy - 0.02, z - r * 0.27, x + r * 0.27, hy + r * 0.22, z + r * 0.27));
    bag.add(A, box(x - r * 0.31, hy + r * 0.22, z - r * 0.31, x + r * 0.31, hy + r * 0.32, z + r * 0.31));
  }
  bag.add(A, lathe([[r * 0.15, 0], [r * 0.12, r * 0.25], [r * 0.14, r * 0.3], [r * 0.05, r * 0.72], [0.001, r * 0.76]], 8, null, x, hy + r * 0.32, z));
}

/** The crowning stupa (radius r) at (x, y, z): solid, on its lotus cushion; the harmika; the octagonal shaft (yasti) carrying three parasols (chattra), the tallest point 42 m above the ground. */
function crownStupa(bag, x, y, z, r, top) {
  bag.add(A, padma(r * 1.16, r * 0.34, 32).translate(x, y, z));
  const tc = 0.81, bell = []; for (let i = 0; i <= 14; i++) { const t = tc * i / 14; bell.push([bellR(r, t), bellY(r, t)]); }
  bell.push([0.001, bellY(r, tc)]);
  bag.add(A, lathe(bell, 40, null, x, y, z));
  bag.add(A, lathe([[r * 0.95, r * 0.48], [r * 1.03, r * 0.54], [r * 1.03, r * 0.58], [r * 0.94, r * 0.64]], 40, null, x, y, z));
  const hy = y + bellY(r, tc) - 0.05, h = r * 0.5;
  for (const [a, y0, y1] of [[0.34, 0, 0.62], [0.4, 0.62, 0.78], [0.44, 0.78, 1.0]]) bag.add(A, box(x - r * a, hy + h * y0, z - r * a, x + r * a, hy + h * y1, z + r * a));
  const ys = hy + h, L = top - ys;
  bag.add(A, lathe([[r * 0.12, 0], [r * 0.1, L * 0.95], [0.001, L]], 8, null, x, ys, z));
  for (const [f, w] of [[0.25, 0.46], [0.5, 0.36], [0.72, 0.27]]) bag.add(A, lathe([[0.001, 0], [r * w, L * 0.02], [r * w, L * 0.05], [r * w * 0.35, L * 0.11], [0.001, L * 0.12]], 16, null, x, ys + L * f, z));
}

// ---- the gateways, the spouts -----------------------------------------------------------------

/** A convex outline [[u, v]] stood at O (u along the horizontal unit U, v up), thick t along N. */
function prism(out, outline, O, U, N, t) {
  const P = (u, v, w) => [O[0] + U[0] * u + N[0] * w, O[1] + v, O[2] + U[1] * u + N[1] * w], T = [], m = outline.length;
  for (let i = 1; i + 1 < m; i++) { T.push(...P(...outline[0], 0), ...P(...outline[i], 0), ...P(...outline[i + 1], 0)); T.push(...P(...outline[0], t), ...P(...outline[i], t), ...P(...outline[i + 1], t)); }
  for (let i = 0; i < m; i++) { const a = outline[i], b = outline[(i + 1) % m]; T.push(...P(...a, 0), ...P(...b, 0), ...P(...b, t), ...P(...a, 0), ...P(...b, t), ...P(...a, t)); }
  for (const v of orientOutward(T)) out.push(v);
  return out;
}
/** The kala's face (width 1, height 1, centred): brow and crown, bulging eyes, the broad nose, the upper jaw with its fangs (it has no lower jaw). */
const KALA = [
  [[-0.5, 0.55], [0.5, 0.55], [0.42, 0.82], [0.2, 0.98], [-0.2, 0.98], [-0.42, 0.82]],
  [[-0.46, 0.18], [0.46, 0.18], [0.5, 0.55], [-0.5, 0.55]],
  [[-0.38, -0.02], [0.38, -0.02], [0.46, 0.18], [-0.46, 0.18]],
];
const KALA_FRONT = [
  { o: [[-0.12, 0.3], [0.12, 0.3], [0.1, 0.5], [-0.1, 0.5]], d: 0.16 },                           // the nose
  { o: [[-0.36, 0.44], [-0.18, 0.44], [-0.16, 0.6], [-0.38, 0.6]], d: 0.12 }, { o: [[0.18, 0.44], [0.36, 0.44], [0.38, 0.6], [0.16, 0.6]], d: 0.12 }, // the eyes
  { o: [[-0.42, 0.62], [0.42, 0.62], [0.3, 0.72], [-0.3, 0.72]], d: 0.08 },                          // the brow
  { o: [[-0.3, 0.05], [-0.22, 0.05], [-0.24, -0.12], [-0.27, -0.12]], d: 0.06 }, { o: [[0.22, 0.05], [0.3, 0.05], [0.27, -0.12], [0.24, -0.12]], d: 0.06 }, // fangs
  { o: [[-0.3, 0.12], [0.3, 0.12], [0.26, 0.22], [-0.26, 0.22]], d: 0.07 },                          // the upper lip and teeth
];
/**
 * A kala–makara gateway across a stair where it passes a balustrade: at c, its faces along ±N, the
 * passage w wide. Jambs, a corbelled arch stepping in over the passage, the mass above it with the
 * kala's head on both faces, makaras turned outward at the springing of the arch, their trunks
 * curled up, and small stupas on top.
 */
function gateway(bag, col, c, N, y, bh = 1.5, w = 3.4, th = 1.1) {
  const U = [-N[1], N[0]], hw = w / 2, jw = 0.8, H0 = 2.7, steps = 3, sh = 0.3, H = H0 + steps * sh + 0.9;
  const R = (u0, u1, y0, y1, t = th) => { const a = [c[0] + U[0] * u0 - N[0] * t / 2, c[1] + U[1] * u0 - N[1] * t / 2], b = [c[0] + U[0] * u1 + N[0] * t / 2, c[1] + U[1] * u1 + N[1] * t / 2]; return box(Math.min(a[0], b[0]), y + y0, Math.min(a[1], b[1]), Math.max(a[0], b[0]), y + y1, Math.max(a[1], b[1])); };
  for (const s of [-1, 1]) {
    bag.add(A, R(s < 0 ? -hw - jw : hw, s < 0 ? -hw : hw + jw, 0, H0));
    bag.add(A, R(s < 0 ? -hw - jw - 0.08 : hw - 0.04, s < 0 ? -hw + 0.04 : hw + jw + 0.08, 0, 0.35, th + 0.14));     // the jamb's foot moulding
    for (let k = 0; k < steps; k++) { const i0 = hw - (k + 1) * 0.28; bag.add(A, s < 0 ? R(-hw - jw, -i0, H0 + k * sh - 0.01, H0 + (k + 1) * sh) : R(i0, hw + jw, H0 + k * sh - 0.01, H0 + (k + 1) * sh)); }
    const p = [c[0] + U[0] * s * (hw + jw), c[1] + U[1] * s * (hw + jw)], sp = [c[0] + U[0] * s * hw, c[1] + U[1] * s * hw];
    col.rect([Math.min(p[0], sp[0]) - th / 2, Math.min(p[1], sp[1]) - th / 2, Math.max(p[0], sp[0]) + th / 2, Math.max(p[1], sp[1]) + th / 2], y, y + H);
  }
  bag.add(A, R(-hw - jw, hw + jw, H0 + steps * sh - 0.01, H));
  bag.add(A, R(-hw - jw - 0.12, hw + jw + 0.12, H - 0.25, H, th + 0.2));
  // the kala on both faces, over the arch
  const kw = Math.min(1.6, w * 0.62), kh = 1.25, ky = y + H0 + steps * sh - 0.35;
  for (const f of [1, -1]) {
    const Nf = [N[0] * f, N[1] * f], Uf = [-Nf[1], Nf[0]], O = [c[0] + Nf[0] * (th / 2 - 0.05), ky, c[1] + Nf[1] * (th / 2 - 0.05)], t = [];
    for (const o of KALA) prism(t, o.map(([u, v]) => [u * kw, v * kh]), O, Uf, Nf, 0.2);
    for (const { o, d } of KALA_FRONT) prism(t, o.map(([u, v]) => [u * kw, v * kh]), [O[0] + Nf[0] * 0.15, ky, O[2] + Nf[1] * 0.15], Uf, Nf, d + 0.05);
    bag.add(A, fromTriangles(t));
    // on the outer face, the makaras turned outward from the jambs, resting on the balustrade, trunks curled up
    if (f > 0) for (const s of [-1, 1]) {
      const m = [], mo = [c[0] + U[0] * s * (hw + jw - 0.1) + Nf[0] * (th / 2 - 0.1), y + bh - 0.02, c[1] + U[1] * s * (hw + jw - 0.1) + Nf[1] * (th / 2 - 0.1)];
      const Us = [U[0] * s, U[1] * s];
      prism(m, [[0, 0], [0.55, 0.08], [0.7, 0.3], [0.55, 0.5], [0, 0.55]], mo, Us, Nf, 0.32);                       // the head
      prism(m, [[0.55, 0.32], [0.72, 0.36], [0.8, 0.7], [0.66, 0.78], [0.6, 0.5]].slice(0, 4), mo, Us, Nf, 0.22);    // the trunk rising
      prism(m, [[0.66, 0.7], [0.8, 0.7], [0.72, 0.86], [0.58, 0.84]], mo, Us, Nf, 0.18);                              // its curl
      prism(m, [[0.2, 0.3], [0.32, 0.3], [0.32, 0.42], [0.2, 0.42]], [mo[0] + Nf[0] * 0.3, mo[1], mo[2] + Nf[1] * 0.3], Us, Nf, 0.06); // the eye
      bag.add(A, fromTriangles(m));
    }
  }
  // the stupikas on top
  for (const u of [-hw - jw * 0.5, 0, hw + jw * 0.5]) stupa(bag, c[0] + U[0] * u, y + H, c[1] + U[1] * u, u === 0 ? 0.42 : 0.3);
}
/** A makara spout at the corner p of a terrace, pointing along dir (a unit vector in plan), its mouth open to throw the water clear of the wall. */
function spout(bag, p, y, dir) {
  const U = [-dir[1], dir[0]], t = [];
  prism(t, [[-0.3, -0.18], [0.3, -0.18], [0.32, 0.12], [-0.32, 0.12]], [p[0] - dir[0] * 0.3, y, p[1] - dir[1] * 0.3], U, dir, 1.0);  // the channel's block
  prism(t, [[-0.26, 0.12], [0.26, 0.12], [0.2, 0.32], [-0.2, 0.32]], [p[0] + dir[0] * 0.1, y, p[1] + dir[1] * 0.1], U, dir, 0.6);    // the brow
  prism(t, [[-0.2, -0.36], [0.2, -0.36], [0.24, -0.18], [-0.24, -0.18]], [p[0] + dir[0] * 0.2, y, p[1] + dir[1] * 0.2], U, dir, 0.42); // the lower jaw, hanging
  for (const s of [-1, 1]) prism(t, [[s * 0.1, 0.32], [s * 0.2, 0.32], [s * 0.15, 0.44]], [p[0] + dir[0] * 0.35, y, p[1] + dir[1] * 0.35], U, dir, 0.12); // the eyes
  prism(t, [[-0.12, -0.08], [0.12, -0.08], [0.12, 0.3], [-0.12, 0.3]], [p[0] + dir[0] * 0.7, y, p[1] + dir[1] * 0.7], U, dir, 0.25);   // the snout, rising
  bag.add(A, fromTriangles(t));
}

/**
 * borobudur: the monument { c, base: { a, p, h, foot }, squares: [{ a, y }] (the five terraces'
 * half-widths and top heights), circles: [{ r, y, n }], crown: { r, y, h } }.
 */
function borobudur(el, { bag, col }) {
  const [cx, cz] = el.c, B = el.base, p = B.p;
  // the plinth and the base
  const level = (a, y0, y1, mat = A) => {
    const t = a / 3;
    for (const r of [[-a, -a, a, a], [-t, -a - p, t, -a], [-t, a, t, a + p], [-a - p, -t, -a, t], [a, -t, a + p, t]]) {
      const R = [cx + r[0], cz + r[1], cx + r[2], cz + r[3]];
      bag.add(mat, box(R[0], y0, R[1], R[2], y1, R[3])); col.rect(R, y0, y1); col.floor(R, y1);
    }
  };
  level(B.a + B.foot, 0, 1.5); level(B.a, 1.5, B.h);
  // balustrade round an outline at height y, broken for the four stairs; niches and small stupas on it
  const balustrade = (a, y, h = 1.7, withSpouts = true) => {
    const P = redent(cx, cz, a, p);
    for (let k = 0; k < P.length; k++) {
      const q0 = P[k], q1 = P[(k + 1) % P.length], L = Math.hypot(q1[0] - q0[0], q1[1] - q0[1]);
      const ux = (q1[0] - q0[0]) / L, uz = (q1[1] - q0[1]) / L, mx = (q0[0] + q1[0]) / 2 - cx, mz = (q0[1] + q1[1]) / 2 - cz;
      // the middle segment of each side's projection holds the stair: leave a 4 m gap
      const stair = (Math.abs(ux) > 0.5 && Math.abs(mx) < 1) || (Math.abs(uz) > 0.5 && Math.abs(mz) < 1);
      const pieces = stair ? [[0, L / 2 - 2], [L / 2 + 2, L]] : [[0, L]];
      // the stair passes through a kala–makara gateway
      if (stair) { const gn = Math.abs(mx) < 1 ? [0, Math.sign(mz)] : [Math.sign(mx), 0]; gateway(bag, col, [cx + mx - gn[0] * 0.6, cz + mz - gn[1] * 0.6], gn, y, h); }
      // a makara spout at each outer corner, throwing the terrace's rain clear of the wall below
      const q2 = P[(k + 2) % P.length], e2 = [q2[0] - q1[0], q2[1] - q1[1]], l2 = Math.hypot(...e2);
      if (ux * e2[1] / l2 - uz * e2[0] / l2 > 0.5 && withSpouts) { const b = [uz + e2[1] / l2, -ux - e2[0] / l2], lb = Math.hypot(...b); spout(bag, q1, y - 0.55, [b[0] / lb, b[1] / lb]); }
      for (const [s0, s1] of pieces) {
        if (s1 - s0 < 0.5) continue;
        const a0 = [q0[0] + ux * s0, q0[1] + uz * s0], a1 = [q0[0] + ux * s1, q0[1] + uz * s1];
        slab(bag, A, a0, a1, y, 0.9, h); col.segment(a0, a1, 0.9, y, y + h);
        const n = Math.floor((s1 - s0) / 3.6);
        for (let i = 0; i < n; i++) { const s = s0 + (i + 0.5) * (s1 - s0) / n, c = [q0[0] + ux * s, q0[1] + uz * s]; stupa(bag, c[0], y + h, c[1], 0.42); }
      }
    }
  };
  balustrade(B.a + 0.2, B.h);
  let prevY = B.h;
  for (const s of el.squares) {
    level(s.a, prevY, s.y);
    // the main wall's niches (dark) along each straight side of this terrace's face
    for (const [sx, sz, nx, nz] of [[1, 0, 0, -1], [1, 0, 0, 1], [0, 1, -1, 0], [0, 1, 1, 0]]) {
      const H = s.y - prevY;
      if (H < 2.6) continue;
      // the niches with their seated Buddhas in the upper part of the wall
      for (let u = -s.a + 3; u < s.a - 2; u += 4.5) {
        if (Math.abs(u) < s.a / 3 + 1) continue;
        const px = cx + sx * u + nx * (s.a + 0.02), pz = cz + sz * u + nz * (s.a + 0.02), t = [], nh = Math.min(1.5, H * 0.32), ny0 = s.y - nh - 0.35;
        beamTris(t, [px - sx * 0.7, ny0, pz - sz * 0.7], [px + sx * 0.7, ny0, pz + sz * 0.7], 0.05, nh);
        bag.add('lacquer_black', fromTriangles(t));
        bag.add(A, lathe([[0.42, 0], [0.4, 0.25], [0.24, 0.45], [0.26, 0.75], [0.14, 0.95], [0.001, 1.0]], 8, null, px + nx * 0.25, ny0 + 0.05, pz + nz * 0.25));
      }
      // the narrative reliefs below them: two registers of framed panels, figures standing out in each
      const regs = H > 3.6 ? 2 : 1, rh = (H - Math.min(1.5, H * 0.32) - 0.9) / regs;
      for (let r2 = 0; r2 < regs; r2++) {
        const y0 = prevY + 0.35 + r2 * rh, t = [], fig = [];
        for (let u = -s.a + 1.6; u < s.a - 1.6; u += 2.7) {
          if (Math.abs(u) < s.a / 3 + 1.2 && Math.abs(u) > 2.4) { /* the projections are plain where the stair passes */ }
          if (Math.abs(u) < 2.4) continue;
          const px = cx + sx * u + nx * (s.a + 0.04), pz = cz + sz * u + nz * (s.a + 0.04);
          beamTris(t, [px - sx * 1.25, y0, pz - sz * 1.25], [px + sx * 1.25, y0, pz + sz * 1.25], 0.06, rh - 0.25);
          for (const d of [-0.75, -0.2, 0.4, 0.85]) { const fx = px + sx * d + nx * 0.07, fz = pz + sz * d + nz * 0.07, fh = (rh - 0.6) * (d === 0.4 ? 0.7 : 1); beamTris(fig, [fx - sx * 0.14, y0 + 0.12, fz - sz * 0.14], [fx + sx * 0.14, y0 + 0.12, fz + sz * 0.14], 0.05, fh); }
        }
        bag.add(A, fromTriangles(t)); bag.add(A, fromTriangles(fig));
      }
    }
    balustrade(s.a, s.y, 1.5);
    prevY = s.y;
  }
  // the stairs on the four sides, level by level
  const levels = [[B.a + p + B.foot, 0], [B.a + p, B.h], ...el.squares.map((s) => [s.a + p, s.y])];
  for (let i = 0; i + 1 < levels.length; i++) {
    const [aOut, y0] = levels[i], [aIn, y1] = levels[i + 1], run = Math.max(2.4, (y1 - y0) * 1.0);
    const e0 = aIn, e1 = aIn + run;
    for (const [dir, rect] of [['s', [cx - 1.6, cz - e1, cx + 1.6, cz - e0]], ['n', [cx - 1.6, cz + e0, cx + 1.6, cz + e1]], ['e', [cx - e1, cz - 1.6, cx - e0, cz + 1.6]], ['w', [cx + e0, cz - 1.6, cx + e1, cz + 1.6]]]) {
      STYLES.qing.elements.stairs({ rect, y0, y1, dir, mat: A }, { bag, col });
    }
    void aOut;
  }
  // the circular terraces with their latticed stupas, the crowning stupa
  let y = prevY;
  for (const c of el.circles) {
    bag.add(A, lathe([[c.r + 1.6, 0], [c.r + 1.6, c.y - y], [0.001, c.y - y]], 48, null, cx, y, cz));
    col.circle(cx, cz, c.r + 1.6, y, c.y);
    // the stupas stand back from the terrace's edge, their lotus cushion (whose petals reach 1.28 r)
    // 0.25 m clear of it; the top terrace's a little smaller; in each quarter they are spaced evenly
    // between the stair axes, where 2.2 m is left between the cushions for the stairs coming up
    const top = c === el.circles[el.circles.length - 1], kind = top ? 'square' : 'diamond', sr = top ? 1.35 : 1.45, foot = sr * 1.28;
    const R = c.r + 1.6 - foot - 0.25, per = c.n / 4, th = Math.asin((foot + 2.2 / 2) / R), step = (Math.PI / 2 - 2 * th) / (per - 1);
    for (let q = 0; q < 4; q++) for (let i = 0; i < per; i++) {
      const a = q * Math.PI / 2 + th + i * step, px = cx + Math.cos(a) * R, pz = cz + Math.sin(a) * R;
      stupa(bag, px, c.y, pz, sr, kind); col.circle(px, pz, foot + 0.02, c.y, c.y + sr * 2.6);
    }
    y = c.y;
  }
  col.floor([cx - 30, cz - 30, cx + 30, cz + 30], y);
  crownStupa(bag, cx, y, cz, el.crown.r, el.crown.top ?? 42);
  col.circle(cx, cz, el.crown.r * 1.18, y, y + el.crown.r * 2.4);
}

/** rumah: a house on posts { rect, seed }: posts, a raised floor, walls of woven bamboo, a steep thatched saddle roof flaring at the ridge. */
function rumah(el, { bag, col }) {
  const rand = rng(el.seed || 1), [x0, z0, x1, z1] = el.rect, fl = 1.4 + rand() * 0.6, H = 2.4;
  for (const [x, z] of [[x0, z0], [x1, z0], [x0, z1], [x1, z1], [(x0 + x1) / 2, z0], [(x0 + x1) / 2, z1]]) { bag.add('timber', box(x - 0.13, 0, z - 0.13, x + 0.13, fl, z + 0.13)); col.circle(x, z, 0.15, 0, fl); }
  bag.add('timber', box(x0 - 0.2, fl, z0 - 0.2, x1 + 0.2, fl + 0.2, z1 + 0.2)); col.floor([x0 - 0.2, z0 - 0.2, x1 + 0.2, z1 + 0.2], fl + 0.2);
  bag.add('reed_mat', box(x0 + 0.3, fl + 0.2, z0 + 0.3, x1 - 0.3, fl + H, z1 - 0.3)); col.rect([x0 + 0.3, z0 + 0.3, x1 - 0.3, z1 - 0.3], fl, fl + H);
  const alongX = x1 - x0 >= z1 - z0;
  roof(bag, [x0, z0, x1, z1], fl + H - 0.1, 0.9, 'gable', Math.min(x1 - x0, z1 - z0) * 0.85, rand() < 0.5 ? 'thatch_palm' : 'ijuk', !alongX);
  // a ladder to the door
  const zf = z1 + 0.25, xc = (x0 + x1) / 2;
  for (let k = 0; k < 4; k++) bag.add('timber', box(xc - 0.4, fl * k / 4, zf + 0.9 - k * 0.22, xc + 0.4, fl * k / 4 + 0.06, zf + 1.1 - k * 0.22));
}
/** pendopo: an open pavilion { rect, y } on a stone platform, posts, a steep hipped roof. */
function pendopo(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, h = el.h ?? 3.4;
  bag.add(A, box(x0 - 1, y, z0 - 1, x1 + 1, y + 0.8, z1 + 1)); col.rect([x0 - 1, z0 - 1, x1 + 1, z1 + 1], y, y + 0.8); col.floor([x0 - 1, z0 - 1, x1 + 1, z1 + 1], y + 0.8);
  const nx = Math.max(2, Math.round((x1 - x0) / 3) + 1), nz = Math.max(2, Math.round((z1 - z0) / 3) + 1);
  for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) { if (i > 0 && i < nx - 1 && j > 0 && j < nz - 1) continue; const x = x0 + (x1 - x0) * i / (nx - 1), z = z0 + (z1 - z0) * j / (nz - 1); bag.add('timber', box(x - 0.15, y + 0.8, z - 0.15, x + 0.15, y + 0.8 + h, z + 0.15)); col.circle(x, z, 0.18, y + 0.8, y + 0.8 + h); }
  roof(bag, [x0, z0, x1, z1], y + 0.8 + h, 1.4, 'hip', Math.min(x1 - x0, z1 - z0) * 0.7, el.mat || 'ijuk');
}
/** pagar: a low wall a→b { h } of brick with a coping. */
function pagar(el, { bag, col }) { slab(bag, 'brick', el.a, el.b, 0, 0.6, el.h ?? 2); slab(bag, A, el.a, el.b, el.h ?? 2, 0.8, 0.25); col.segment(el.a, el.b, 0.6, 0, (el.h ?? 2) + 0.25); }

registerStyle('javanese', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.qing.elements, borobudur, rumah, pendopo, pagar },
  objects: {},
});
