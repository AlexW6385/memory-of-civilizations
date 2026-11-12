// Sailendra Javanese architecture (c. 800–825; docs/settlements/borobudur.md §4): Borobudur —
// redented square terraces of grey andesite with walled galleries, balustrades lined with niches
// and small stupas, steep stairs through the middle of each side, circular terraces of latticed
// bell stupas, the crowning stupa — and the timber building of the reliefs: houses raised on posts
// with walls of woven bamboo under steep thatched saddle roofs, open pavilions on platforms.

import { registerStyle, STYLES } from '../../core/build.js';
import { rite } from '../indian/rites.js';
import { box, lathe, fromTriangles, orientOutward } from '../../core/geom.js';
import { Matrix4, Vector3 } from '../../core/three.js';
import { rectRoof, beamTris } from '../ming/index.js';
import '../qing/index.js';
import '../../objects/index.js';

const A = 'andesite';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
function roof(bag, [x0, z0, x1, z1], y, o, kind, rise, mat, alongZ, hole) {
  const w = x1 - x0 + 2 * o, d = z1 - z0 + 2 * o, az = alongZ ?? d > w;
  rectRoof({ c: [(x0 + x1) / 2, (z0 + z1) / 2], A: (az ? d : w) / 2, B: (az ? w : d) / 2, y, rise, kind, sweep: kind === 'gable' ? 0 : 0.4, p: 1.1, alongZ: az, curl: false, mat, soffit: 'timber', hole }, bag);
}
/** The outline of a redented square (half a; the middle third of each side set out by p), as points round it. */
function redent(cx, cz, a, p) {
  const t = a / 3, pts = [[-a, -a], [-t, -a], [-t, -a - p], [t, -a - p], [t, -a], [a, -a], [a, -t], [a + p, -t], [a + p, t], [a, t], [a, a], [t, a], [t, a + p], [-t, a + p], [-t, a], [-a, a], [-a, t], [-a - p, t], [-a - p, -t], [-a, -t]];
  return pts.map(([x, z]) => [cx + x, cz + z]);
}
function slab(bag, mat, a, b, y, th, h) { const t = []; beamTris(t, [a[0], y, a[1]], [b[0], y, b[1]], th / 2, h); bag.add(mat, fromTriangles(t)); }
/** A small stupa (bell, harmika, spire) of radius r at (x, y, z); `lattice` for the pierced ones. */
function stupa(bag, x, y, z, r, lattice = false, face = null) {
  if (lattice) return latticeStupa(bag, x, y, z, r, lattice, face);
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
function latticeStupa(bag, x, y, z, r, kind, face) {
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
  bag.add(A, lathe([[r * 0.4, 0], [r * 0.42, r * 0.08], [r * 0.38, r * 0.14], [0.001, r * 0.14]], 12, null, x, y + r * 0.3, z));
  // the Buddha within, turning the wheel of the law (dharmacakra), facing out by the quarter he sits in
  buddha(bag, 'teaching', x, y + r * 0.43, z, face ?? [1, 0], r * 0.6);
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

// ---- the Buddhas of the niches, the relief panels ------------------------------------------------

/** A rod a→b of radius r with rounded, closed ends. */
function limb(a, b, r, seg = 8) {
  const P = new Vector3(...a), Q = new Vector3(...b), L = P.distanceTo(Q), e = Math.min(r * 0.6, L * 0.3);
  const g = lathe([[0.001, -e], [r * 0.8, -e * 0.55], [r, 0], [r, L], [r * 0.8, L + e * 0.55], [0.001, L + e]], seg);
  const dir = Q.clone().sub(P).normalize(), up = new Vector3(0, 1, 0), axis = up.clone().cross(dir), m = new Matrix4();
  if (axis.lengthSq() < 1e-9) { if (dir.y < 0) m.makeRotationX(Math.PI); } else m.makeRotationAxis(axis.normalize(), Math.acos(Math.min(1, Math.max(-1, up.dot(dir)))));
  m.setPosition(P);
  return g.applyMatrix4(m);
}
/** An ellipsoid of radii (rx, ry, rz) centred at c. */
function ellipsoid(c, rx, ry, rz, n = 10) {
  const p = []; for (let i = 0; i <= 6; i++) { const t = i / 6 * Math.PI; p.push([Math.max(0.001, Math.sin(t)), -Math.cos(t)]); }
  return lathe(p, n).scale(rx, ry, rz).translate(...c);
}
/**
 * The seated Buddha of the niches (seated height about 1.05 at scale 1, facing +z), in padmasana on a
 * double lotus, differing only by the gesture of the hands (mudra): 'earth' (bhumisparsa, the right
 * hand over the right knee touching the ground — the east), 'giving' (vara, the right hand on the knee
 * palm out — the south), 'meditation' (dhyana, both hands in the lap — the west), 'fearless' (abhaya,
 * the right hand raised palm out — the north), 'discussion' (vitarka, the right hand raised, thumb and
 * finger joined — the fifth balustrade), 'teaching' (dharmacakra, both hands before the chest — the
 * round terraces). The left hand rests in the lap but in the last. Pieces cached by mudra.
 */
const BUDDHAS = new Map();
function buddhaPieces(mudra) {
  if (BUDDHAS.has(mudra)) return BUDDHAS.get(mudra);
  const G = [];
  G.push(padma(0.5, 0.16, 12));
  G.push(ellipsoid([0, 0.27, 0.05], 0.46, 0.11, 0.29, 12));                                             // the crossed legs
  for (const s of [-1, 1]) G.push(ellipsoid([s * 0.14, 0.34, 0.2], 0.08, 0.03, 0.05, 6));              // the soles turned up on the thighs
  G.push(lathe([[0.19, 0], [0.21, 0.12], [0.24, 0.3], [0.25, 0.36], [0.19, 0.42], [0.001, 0.43]], 12).scale(1, 1, 0.62).translate(0, 0.3, 0));   // the body
  G.push(ellipsoid([0, 0.67, 0], 0.27, 0.06, 0.14, 10));                                                 // the shoulders
  G.push(lathe([[0.065, 0], [0.06, 0.1], [0.001, 0.1]], 8, null, 0, 0.71, 0));                           // the neck
  G.push(ellipsoid([0, 0.86, 0.01], 0.1, 0.125, 0.11, 10));                                              // the head
  G.push(ellipsoid([0, 0.985, -0.005], 0.07, 0.055, 0.07, 8));                                           // the ushnisha
  for (const s of [-1, 1]) G.push(limb([s * 0.1, 0.89, 0], [s * 0.105, 0.78, 0], 0.017, 5));           // the long earlobes
  // the arms: upper arms to the elbows; then each forearm and hand by the mudra (the right arm at −x)
  for (const s of [-1, 1]) G.push(limb([s * 0.24, 0.66, 0], [s * 0.27, 0.45, 0.05], 0.048));
  const fore = (s, w, r = 0.04) => G.push(limb([s * 0.27, 0.45, 0.05], w, r));
  const lap = () => { fore(1, [0.06, 0.35, 0.17]); G.push(ellipsoid([0.02, 0.345, 0.18], 0.075, 0.022, 0.05, 8)); };
  if (mudra === 'meditation') { fore(1, [0.05, 0.35, 0.17]); fore(-1, [-0.05, 0.36, 0.17]); G.push(ellipsoid([0, 0.355, 0.18], 0.1, 0.028, 0.06, 8)); }
  else if (mudra === 'teaching') { fore(1, [0.06, 0.56, 0.17]); fore(-1, [-0.06, 0.57, 0.17]); G.push(ellipsoid([0.04, 0.58, 0.19], 0.03, 0.05, 0.03, 6), ellipsoid([-0.04, 0.6, 0.19], 0.03, 0.05, 0.03, 6)); }
  else {
    lap();
    if (mudra === 'earth') { fore(-1, [-0.3, 0.31, 0.25]); G.push(limb([-0.3, 0.31, 0.25], [-0.31, 0.2, 0.3], 0.032, 6)); }
    else if (mudra === 'giving') { fore(-1, [-0.29, 0.33, 0.26]); G.push(ellipsoid([-0.29, 0.28, 0.29], 0.045, 0.07, 0.02, 8)); }
    else if (mudra === 'fearless') { fore(-1, [-0.24, 0.6, 0.15]); G.push(ellipsoid([-0.24, 0.68, 0.16], 0.045, 0.075, 0.02, 8)); }
    else { fore(-1, [-0.22, 0.58, 0.16]); G.push(ellipsoid([-0.215, 0.645, 0.175], 0.04, 0.055, 0.025, 8)); }   // vitarka
  }
  BUDDHAS.set(mudra, G);
  return G;
}
/** A seated Buddha of the given mudra at (x, y, z) facing N (a unit vector in plan), scale s. */
function buddha(bag, mudra, x, y, z, N, s) {
  const m = new Matrix4().makeRotationY(Math.atan2(N[0], N[1])).premultiply(new Matrix4().makeScale(s, s, s)).premultiply(new Matrix4().makeTranslation(x, y, z));
  for (const g of buddhaPieces(mudra)) bag.add(A, g.clone().applyMatrix4(m));
}

/**
 * A guardian lion (singa) seated upright on its haunches on a low plinth, facing +z, about 1.25 m to the
 * top of the head at scale 1: the haunches and the hind paws, the straight forelegs, the chest, the head
 * with its mane in rows of curls, the open jaws, the tail curled up the back. Pieces cached.
 */
let LION = null;
function lionPieces() {
  if (LION) return LION;
  const G = [];
  G.push(lathe([[0.36, 0], [0.36, 0.14], [0.32, 0.16], [0.32, 0.2], [0.001, 0.2]], 4).rotateY(Math.PI / 4).scale(1, 1, 1.25));   // the plinth, square
  G.push(ellipsoid([0, 0.4, -0.12], 0.25, 0.2, 0.26, 10));                                                    // the haunches
  for (const s of [-1, 1]) { G.push(ellipsoid([s * 0.17, 0.28, -0.02], 0.08, 0.1, 0.18, 8)); G.push(ellipsoid([s * 0.15, 0.24, 0.17], 0.06, 0.04, 0.08, 6)); }   // the thighs, the hind paws
  G.push(lathe([[0.18, 0], [0.2, 0.2], [0.17, 0.42], [0.001, 0.46]], 10).scale(1, 1, 0.8).rotateX(-0.25).translate(0, 0.45, 0.02));   // the body rising to the chest
  for (const s of [-1, 1]) { G.push(limb([s * 0.12, 0.82, 0.12], [s * 0.11, 0.24, 0.2], 0.05, 7)); G.push(ellipsoid([s * 0.11, 0.23, 0.24], 0.055, 0.035, 0.07, 6)); }   // the forelegs and forepaws
  G.push(ellipsoid([0, 0.97, 0.06], 0.24, 0.22, 0.2, 12));                                                    // the mane
  for (let r = 0; r < 3; r++) for (let k = 0; k < 7; k++) { const a = -1.2 + k * 0.4; G.push(ellipsoid([Math.sin(a) * (0.2 + r * 0.02), 0.82 + r * 0.12 + Math.cos(a) * 0.04, 0.12 + Math.cos(a) * 0.1], 0.045, 0.045, 0.04, 6)); }   // its curls
  G.push(ellipsoid([0, 1.02, 0.2], 0.14, 0.12, 0.12, 10));                                                    // the face
  for (const s of [-1, 1]) G.push(ellipsoid([s * 0.06, 1.07, 0.3], 0.035, 0.03, 0.025, 6));                  // the bulging eyes
  G.push(ellipsoid([0, 0.99, 0.31], 0.06, 0.035, 0.05, 6));                                                   // the snout
  G.push(ellipsoid([0, 0.93, 0.27], 0.08, 0.025, 0.06, 6));                                                   // the lower jaw, open
  G.push(limb([0, 0.25, -0.36], [0, 0.6, -0.4], 0.03, 5)); G.push(ellipsoid([0, 0.66, -0.38], 0.06, 0.07, 0.05, 6));   // the tail and its tuft
  LION = G;
  return G;
}
/** A guardian lion at (x, y, z) facing N, scale s. */
function lion(bag, x, y, z, N, s = 1) {
  const m = new Matrix4().makeRotationY(Math.atan2(N[0], N[1])).premultiply(new Matrix4().makeScale(s, s, s)).premultiply(new Matrix4().makeTranslation(x, y, z));
  for (const g of lionPieces()) bag.add(A, g.clone().applyMatrix4(m));
}

/** The mudra of a niche whose face looks along N: east earth-touching, south giving, west meditation, north fearlessness. */
const mudraOf = (N) => (N[0] > 0.5 ? 'earth' : N[0] < -0.5 ? 'meditation' : N[1] > 0.5 ? 'giving' : 'fearless');
/**
 * A niche on a wall face at p (the face's plan point) looking along N, its opening w wide and h high
 * from y0: a dark recess between pilasters on a sill, a lintel stepped in over the opening as a
 * corbelled arch, the kala's head over it, and the Buddha seated within on his lotus.
 */
function niche(bag, p, N, y0, w, h, mudra) {
  const U = [-N[1], N[0]], hw = w / 2;
  const R = (u0, u1, d0, d1, ya, yb) => { const a = [p[0] + U[0] * u0 + N[0] * d0, p[1] + U[1] * u0 + N[1] * d0], b = [p[0] + U[0] * u1 + N[0] * d1, p[1] + U[1] * u1 + N[1] * d1]; return box(Math.min(a[0], b[0]), ya, Math.min(a[1], b[1]), Math.max(a[0], b[0]), yb, Math.max(a[1], b[1])); };
  bag.add('opening', R(-hw, hw, -0.01, 0.03, y0 + 0.1, y0 + h));                                  // the dark of the recess
  bag.add(A, R(-hw - 0.22, hw + 0.22, -0.01, 0.5, y0 - 0.02, y0 + 0.1));                          // the sill
  for (const s of [-1, 1]) {
    bag.add(A, R(s < 0 ? -hw - 0.2 : hw, s < 0 ? -hw : hw + 0.2, -0.01, 0.42, y0 + 0.1, y0 + h));                  // the pilasters
    bag.add(A, R(s < 0 ? -hw - 0.24 : hw - 0.02, s < 0 ? -hw + 0.02 : hw + 0.24, -0.01, 0.46, y0 + 0.1, y0 + 0.2)); // their feet
    for (let k = 0; k < 2; k++) bag.add(A, R(s < 0 ? -hw - 0.01 : hw - 0.07 * (k + 1), s < 0 ? -hw + 0.07 * (k + 1) : hw + 0.01, -0.01, 0.36, y0 + h - 0.09 * (k + 1), y0 + h - 0.09 * k));  // the arch stepping in
  }
  bag.add(A, R(-hw - 0.26, hw + 0.26, -0.01, 0.44, y0 + h, y0 + h + 0.18));                       // the lintel
  // the kala's mask on the lintel's face, over the arch: the face plate, the brows, the bulging eyes, the fangs at the arch's crown
  const t = [], O = [p[0] + N[0] * 0.43, y0 + h - 0.06, p[1] + N[1] * 0.43], kw = w * 0.5;
  prism(t, [[-kw / 2, 0.02], [kw / 2, 0.02], [kw / 2 + 0.05, 0.12], [kw / 2, 0.24], [-kw / 2, 0.24], [-kw / 2 - 0.05, 0.12]], O, U, N, 0.06);
  for (const sg of [-1, 1]) {
    prism(t, RND(sg * kw * 0.22, 0.14, 0.035, 6), [O[0] + N[0] * 0.04, O[1], O[2] + N[1] * 0.04], U, N, 0.05);
    prism(t, [[sg * 0.03, 0.02], [sg * 0.07, 0.02], [sg * 0.05, -0.06]], [O[0] + N[0] * 0.01, O[1], O[2] + N[1] * 0.01], U, N, 0.04);
  }
  prism(t, [[-0.035, 0.06], [0.035, 0.06], [0.03, 0.16], [-0.03, 0.16]], [O[0] + N[0] * 0.04, O[1], O[2] + N[1] * 0.04], U, N, 0.06);
  bag.add(A, fromTriangles(t));
  const s = Math.min((h - 0.2) / 1.05, w / 1.1);
  buddha(bag, mudra, p[0] + N[0] * 0.2, y0 + 0.1, p[1] + N[1] * 0.2, N, s);
}

// the narrative panels: compositions of figures in low relief (u across the panel from −0.5 to 0.5, v up from 0 to 1)
const RND = (cu, cv, r, m = 8, sx = 1) => Array.from({ length: m }, (_, i) => [cu + Math.cos(i / m * Math.PI * 2) * r * sx, cv + Math.sin(i / m * Math.PI * 2) * r]);
const MOVE = (o, du, k = 1) => o.map(([u, v]) => [du + u * k, v * k]);
function standing(u, k = 1) {
  return [
    [[-0.05, 0.04], [0.05, 0.04], [0.065, 0.42], [-0.065, 0.42]],                       // the kain, to the ankles
    [[-0.06, 0], [0.06, 0], [0.05, 0.04], [-0.05, 0.04]],                              // the feet
    [[-0.06, 0.42], [0.06, 0.42], [0.08, 0.62], [-0.08, 0.62]],                        // the body
    [[0.075, 0.61], [0.105, 0.58], [0.095, 0.43], [0.07, 0.45]], [[-0.075, 0.61], [-0.07, 0.45], [-0.095, 0.43], [-0.105, 0.58]],   // the arms
    RND(0, 0.675, 0.048),                                                                // the head
    [[-0.042, 0.71], [0.042, 0.71], [0.024, 0.81], [-0.024, 0.81]],                     // the tall headdress
  ].map((o) => MOVE(o, u, k));
}
function seated(u, k = 1) {
  return [
    [[-0.13, 0], [0.13, 0], [0.11, 0.1], [-0.11, 0.1]],                                 // the crossed legs
    [[-0.06, 0.1], [0.06, 0.1], [0.075, 0.32], [-0.075, 0.32]],
    [[0.07, 0.31], [0.1, 0.29], [0.09, 0.14], [0.065, 0.16]], [[-0.07, 0.31], [-0.065, 0.16], [-0.09, 0.14], [-0.1, 0.29]],
    RND(0, 0.375, 0.046), [[-0.04, 0.41], [0.04, 0.41], [0.022, 0.5], [-0.022, 0.5]],
  ].map((o) => MOVE(o, u, k));
}
function tree(u, k = 1) {
  return [[[-0.022, 0], [0.022, 0], [0.016, 0.55], [-0.016, 0.55]], RND(0, 0.66, 0.15, 10, 1.1), RND(-0.13, 0.55, 0.08, 8), RND(0.13, 0.57, 0.08, 8)].map((o) => MOVE(o, u, k));
}
function pavilion(u, k = 1) {
  return [
    [[-0.2, 0], [0.2, 0], [0.19, 0.06], [-0.19, 0.06]],                                 // its platform
    [[-0.18, 0.06], [-0.155, 0.06], [-0.155, 0.6], [-0.18, 0.6]], [[0.155, 0.06], [0.18, 0.06], [0.18, 0.6], [0.155, 0.6]],
    [[-0.24, 0.6], [0.24, 0.6], [0.2, 0.66], [-0.2, 0.66]], [[-0.2, 0.66], [0.2, 0.66], [0.07, 0.86], [-0.07, 0.86]],   // the eave, the steep roof
  ].map((o) => MOVE(o, u, k));
}
/** The compositions: an audience (a lord seated in a pavilion, attendants), a procession under a tree, a hermitage in the forest. */
const SCENES = [
  [...pavilion(-0.25), ...seated(-0.25, 1).map((o) => o.map(([u, v]) => [u, v + 0.06])), ...standing(0.05, 0.85), ...standing(0.2, 0.85), ...seated(0.38, 0.9)],
  [...standing(-0.38), ...standing(-0.22), ...standing(-0.06, 0.95), ...standing(0.1), ...tree(0.33, 1.05)],
  [...tree(-0.32), ...seated(-0.05, 1.1), ...standing(0.17, 0.9), ...tree(0.36, 0.9)],
];
/**
 * A relief panel on a face at c looking along N (its plane at c), w wide and h high from y0: the
 * panel stands a little proud, in a frame of flat bands, with the scene's figures standing out of it.
 */
function panel(bag, c, N, y0, w, h, scene) {
  const U = [-N[1], N[0]], t = [];
  prism(t, [[-w / 2, 0], [w / 2, 0], [w / 2, h], [-w / 2, h]], [c[0], y0, c[1]], U, N, 0.05);
  for (const o of [[[-w / 2, 0], [w / 2, 0], [w / 2, 0.07], [-w / 2, 0.07]], [[-w / 2, h - 0.07], [w / 2, h - 0.07], [w / 2, h], [-w / 2, h]], [[-w / 2, 0.07], [-w / 2 + 0.07, 0.07], [-w / 2 + 0.07, h - 0.07], [-w / 2, h - 0.07]], [[w / 2 - 0.07, 0.07], [w / 2, 0.07], [w / 2, h - 0.07], [w / 2 - 0.07, h - 0.07]]]) prism(t, o, [c[0] + N[0] * 0.04, y0, c[1] + N[1] * 0.04], U, N, 0.09);
  // the scene as tall as the panel; a wide panel holds two or three scenes side by side
  const sv = (h - 0.16) / 0.86, iw = w - 0.16, nC = Math.max(1, Math.round(iw / (sv * 1.15))), su = iw / nC;
  for (let i = 0; i < nC; i++) {
    const du = -iw / 2 + (i + 0.5) * su;
    for (const o of SCENES[(scene + i) % SCENES.length]) prism(t, o.map(([u, v]) => [du + u * su, 0.08 + v * sv]), [c[0] + N[0] * 0.04, y0, c[1] + N[1] * 0.04], U, N, 0.085);
  }
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
        // on its inner face, toward the gallery it encloses, the balustrade's own register of reliefs
        const nin = [-uz, ux], L2 = s1 - s0 - 1.4, np2 = Math.floor((L2 + 0.3) / 2.3);
        for (let i = 0; i < np2 && withSpouts !== 'plain'; i++) {
          const sm = s0 + 0.7 + (L2 - np2 * 2.3 + 0.3) / 2 + i * 2.3 + 1.0;
          panel(bag, [q0[0] + ux * sm + nin[0] * 0.45, q0[1] + uz * sm + nin[1] * 0.45], nin, y + 0.2, 2.0, h - 0.5, i & 1);
        }
        const n = Math.floor((s1 - s0) / 3.6);
        for (let i = 0; i < n; i++) { const s = s0 + (i + 0.5) * (s1 - s0) / n, c = [q0[0] + ux * s, q0[1] + uz * s]; stupa(bag, c[0], y + h, c[1], 0.42); }
      }
    }
  };
  balustrade(B.a + 0.2, B.h);
  let prevY = B.h;
  for (const s of el.squares) {
    level(s.a, prevY, s.y);
    // the main wall's face along each straight side of this terrace: above, the niches of the
    // balustrade over it, each with its Buddha — the mudra by the side the face looks to, and on the
    // last (the fifth balustrade) the gesture of discussion on all four; below, the narrative reliefs
    const last = s === el.squares[el.squares.length - 1];
    for (const [sx, sz, nx, nz] of [[1, 0, 0, -1], [1, 0, 0, 1], [0, 1, -1, 0], [0, 1, 1, 0]]) {
      const H = s.y - prevY, N = [nx, nz], mudra = last ? 'discussion' : mudraOf(N);
      const nh = H >= 2.3 ? Math.min(1.5, H * 0.38) : 0;
      // the face steps out by p over the middle third of the side (the projection)
      const face = (u, m) => (Math.abs(Math.abs(u) - s.a / 3) < m ? null : Math.abs(u) < s.a / 3 ? s.a + p : s.a);
      if (nh) for (let u = -s.a + 3; u < s.a - 2; u += 4.5) {
        const d = face(u, 1.1);
        if (d == null || Math.abs(u) < 3) continue;
        niche(bag, [cx + sx * u + nx * d, cz + sz * u + nz * d], N, s.y - nh - 0.4, 1.15, nh, mudra);
      }
      // the narrative reliefs below them: one or two registers of framed panels, a scene in each
      const regs = H - nh > 2.4 ? 2 : 1, rh = (H - nh - 0.4 - 0.45) / regs - 0.12;
      if (rh < 0.5) continue;
      for (let r2 = 0; r2 < regs; r2++) {
        const y0 = prevY + 0.35 + r2 * (rh + 0.12);
        let k = 0;
        for (let u = -s.a + 1.6; u < s.a - 1.6; u += 2.7) {
          const d = face(u, 1.35);
          if (d == null || Math.abs(u) < 2.4) continue;                      // the stair passes in the middle
          panel(bag, [cx + sx * u + nx * d, cz + sz * u + nz * d], N, y0, 2.5, rh, (k++ & 1) + r2);
        }
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
    // the 32 guardian lions: a pair beyond the foot of the ground flight and a pair beside the head of each of the next three, on every side, facing out
    if (i < 4) for (const [nx, nz] of [[0, -1], [0, 1], [-1, 0], [1, 0]]) for (const k of [-1, 1]) {
      const d = i === 0 ? e1 + 0.75 : e0 + 0.75, ux = -nz, uz = nx, lx = cx + nx * d + ux * k * 2.4, lz = cz + nz * d + uz * k * 2.4;
      lion(bag, lx, y0, lz, [nx, nz], 0.95); col.rect([lx - 0.36, lz - 0.36, lx + 0.36, lz + 0.36], y0, y0 + 1.2);
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
      const ca = Math.cos(a), sa = Math.sin(a), face = Math.abs(ca) > Math.abs(sa) ? [Math.sign(ca), 0] : [0, Math.sign(sa)];
      stupa(bag, px, c.y, pz, sr, kind, face); col.circle(px, pz, foot + 0.02, c.y, c.y + sr * 2.6);
    }
    y = c.y;
  }
  col.floor([cx - 30, cz - 30, cx + 30, cz + 30], y);
  crownStupa(bag, cx, y, cz, el.crown.r, el.crown.top ?? 42);
  col.circle(cx, cz, el.crown.r * 1.18, y, y + el.crown.r * 2.4);
}

// ---- the timber buildings of the reliefs: houses and granaries on posts, the monastery's halls ------

/** A convex solid from eight points (the bottom quad 0–3, the top quad 4–7 above it), faces turned outward. */
function hexa(P) {
  const t = [], q = (a, b, c, d) => t.push(...P[a], ...P[b], ...P[c], ...P[a], ...P[c], ...P[d]);
  q(0, 1, 2, 3); q(4, 5, 6, 7); q(0, 1, 5, 4); q(1, 2, 6, 5); q(2, 3, 7, 6); q(3, 0, 4, 7);
  return orientOutward(t);
}
/** A building's own frame: u along its ridge, v toward its front (its stair), from a rectangle and the side it fronts. */
function frame(el) {
  const [x0, z0, x1, z1] = el.rect, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, f = el.front || 's', ew = f === 'e' || f === 'w';
  const P = (u, v) => (f === 's' ? [cx + u, cz + v] : f === 'n' ? [cx - u, cz - v] : f === 'e' ? [cx + v, cz - u] : [cx - v, cz + u]);
  const R = (u0, v0, u1, v1) => { const a = P(u0, v0), b = P(u1, v1); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; };
  const P3 = (u, v, y) => { const q = P(u, v); return [q[0], y, q[1]]; };
  return { W: ew ? z1 - z0 : x1 - x0, D: ew ? x1 - x0 : z1 - z0, P, R, P3, f, up: { s: 'n', n: 's', e: 'w', w: 'e' }[f] };
}
/**
 * A steep saddle roof of thatch over a footprint u ∈ ±W/2, v ±D/2 in a frame F: two thick planes meeting at
 * a ridge, the gable ends overhanging, the ridge capped and its ends flaring up in horns; eaves at the level
 * where the wall tops (yw) meet the roof's underside. Returns the ridge's height.
 */
function thatch(bag, F, mat, W, D, yw, rise, { ov = 0.6, th = 0.3, horns = true } = {}) {
  const Bh = D / 2 + ov, L = W / 2 + 0.55, R = rise * Bh, yE = yw + th - R * ov / Bh, yR = yE + R, P3 = F.P3;
  for (const s of [-1, 1]) bag.add(mat, fromTriangles(hexa([P3(-L, 0, yR - th), P3(L, 0, yR - th), P3(L, s * Bh, yE - th), P3(-L, s * Bh, yE - th), P3(-L, 0, yR), P3(L, 0, yR), P3(L, s * Bh, yE), P3(-L, s * Bh, yE)])));
  const t = [];
  beamTris(t, P3(-L - 0.05, 0, yR + 0.02), P3(L + 0.05, 0, yR + 0.02), 0.2, 0.16);
  if (horns) for (const s of [-1, 1]) {
    beamTris(t, P3(s * (L - 0.4), 0, yR + 0.12), P3(s * (L + 0.12), 0, yR + 0.4), 0.07, 0.1);
    beamTris(t, P3(s * (L + 0.12), 0, yR + 0.4), P3(s * (L + 0.58), 0, yR + 0.92), 0.06, 0.09);
  }
  bag.add('ijuk', fromTriangles(t));
  return yR;
}
/** The woven-bamboo wall (gedhek) pieces: a plaited panel in a frame, with bamboo battens on its outer face. */
function gedhek(bag, col, F, u0, v0, u1, v1, y0, y1, outer) {
  const r = F.R(u0, v0, u1, v1);
  bag.add(F.plank ? 'planks_grey' : 'reed_mat', box(r[0], y0, r[1], r[2], y1, r[3])); col.rect(r, y0, y1);
  const L = Math.max(u1 - u0, v1 - v0), alongU = u1 - u0 > v1 - v0;
  for (let k = 1; k <= 3; k++) {
    const y = y0 + (y1 - y0) * k / 4, e = 0.03, rr = alongU ? F.R(u0, outer > 0 ? v1 : v0 - e, u1, outer > 0 ? v1 + e : v0) : F.R(outer > 0 ? u1 : u0 - e, v0, outer > 0 ? u1 + e : u0, v1);
    if (L > 0.3) bag.add('bamboo_culm', box(rr[0], y - 0.025, rr[1], rr[2], y + 0.025, rr[3]));
  }
}
/**
 * rumah: a house on posts { rect, seed, front, interior }: stone footings (umpak) and posts, a plank floor, a veranda
 * across the front with a rail and a stair up to it, walls of plaited bamboo with the door, shuttered windows and
 * battens, under a steep thatched saddle roof flaring at the ridge ends; `interior`: a hearth, a sleeping platform
 * of bamboo, mats, jars and baskets.
 */
function rumah(el, ctx) {
  const { bag, col } = ctx;
  if (el.kind === 'lumbung') return lumbung(el, ctx);
  const rand = rng(el.seed || 1), wr = rng((el.seed || 1) + 7), F = frame(el), { W, D, R, P } = F, fl = 1.25 + rand() * 0.35, H = 2.25, ve = 1.45, vw = D / 2 - ve, wt = 0.12, e = W / 2 - 0.16;
  const bx = (mat, u0, v0, u1, v1, y0, y1) => { const r = R(u0, v0, u1, v1); bag.add(mat, box(r[0], y0, r[1], r[2], y1, r[3])); return r; };
  F.plank = wr() < 0.28;                                   // some houses of grey sawn planks, the rest plaited bamboo
  // footings, posts, the floor
  const us = [-W / 2 + 0.2, -W / 6, W / 6, W / 2 - 0.2].slice(0, W > 6 ? 4 : 3), vs = [-D / 2 + 0.2, vw, D / 2 - 0.2];
  for (const u of W > 6 ? us : [-W / 2 + 0.2, 0, W / 2 - 0.2]) for (const v of vs) {
    bx(A, u - 0.26, v - 0.26, u + 0.26, v + 0.26, 0, 0.2);
    if (wr() < 0.55) bx('sod', u - 0.2, v - 0.2, u + 0.2, v + 0.2, 0.2, 0.235);                               // moss on the footing's shaded top
    bx('timber', u - 0.11, v - 0.11, u + 0.11, v + 0.11, 0.2, fl - 0.2);
    const [x, z] = P(u, v); col.circle(x, z, 0.28, 0, fl);
  }
  for (const u of [-W / 2 + 0.2, W / 2 - 0.2]) bx('timber', u - 0.08, -D / 2 + 0.1, u + 0.08, D / 2 - 0.1, fl - 0.34, fl - 0.2);       // the bearers
  const fr = bx('timber', -W / 2 - 0.1, -D / 2 - 0.1, W / 2 + 0.1, D / 2 + 0.1, fl - 0.2, fl); col.floor(fr, fl);
  // the walls, the door (offset by the seed), the plates and posts
  const u0 = (rand() - 0.5) * W * 0.4, dw = 1.0, dh = 1.95;
  gedhek(bag, col, F, -e, -D / 2 + 0.16, e, -D / 2 + 0.16 + wt, fl, fl + H, -1);                                       // the back
  gedhek(bag, col, F, -e, -D / 2 + 0.16, -e + wt, vw, fl, fl + H, -1); gedhek(bag, col, F, e - wt, -D / 2 + 0.16, e, vw, fl, fl + H, 1);   // the ends
  gedhek(bag, col, F, -e, vw - wt, u0 - dw / 2, vw, fl, fl + H, 1); gedhek(bag, col, F, u0 + dw / 2, vw - wt, e, vw, fl, fl + H, 1);        // the front, the door between
  gedhek(bag, col, F, u0 - dw / 2, vw - wt, u0 + dw / 2, vw, fl + dh, fl + H, 1);                                       // over the door
  for (const [a, b] of [[-e, -D / 2 + 0.16], [e, -D / 2 + 0.16], [-e, vw], [e, vw], [u0 - dw / 2, vw], [u0 + dw / 2, vw]]) bx('bamboo_culm', a - 0.06, b - 0.06 - (b === vw ? wt - 0.12 : 0), a + 0.06, b + 0.06, fl, fl + H + 0.06);
  bx('timber', -e - 0.08, -D / 2 + 0.08, e + 0.08, vw + 0.08, fl + H - 0.1, fl + H + 0.1);                               // the wall plate
  bx('timber', u0 - dw / 2 - 0.07, vw - wt - 0.02, u0 + dw / 2 + 0.07, vw + 0.08, fl + dh - 0.1, fl + dh);            // the lintel
  // windows with their frames: one in each end, one at the back
  for (const [wu0, wv0, wu1, wv1, o] of [[-e - 0.02, -D / 2 + 1.1, -e + wt + 0.02, -D / 2 + 1.9, 0], [e - wt - 0.02, -D / 2 + 1.1, e + 0.02, -D / 2 + 1.9, 0], [W * 0.18 - 0.4, -D / 2 + 0.12, W * 0.18 + 0.4, -D / 2 + 0.16 + wt + 0.02, 1]]) {
    bx('opening', wu0, wv0, wu1, wv1, fl + 1.0, fl + 1.7);
    bx('timber', wu0 - (o ? 0.05 : 0), wv0 - (o ? 0 : 0.05), wu1 + (o ? 0.05 : 0), wv1 + (o ? 0 : 0.05), fl + 0.94, fl + 1.0);
    bx('timber', wu0 - (o ? 0.05 : 0), wv0 - (o ? 0 : 0.05), wu1 + (o ? 0.05 : 0), wv1 + (o ? 0 : 0.05), fl + 1.7, fl + 1.76);
  }
  // the veranda: posts at the front corners and by the stair, the front beam, the rail with a gap at the stair
  const vu = [-W / 2 + 0.2, W / 2 - 0.2];
  for (const u of vu) bx('timber', u - 0.1, D / 2 - 0.3, u + 0.1, D / 2 - 0.1, fl, fl + H + 0.1);
  bx('timber', -W / 2 + 0.1, D / 2 - 0.3, W / 2 - 0.1, D / 2 - 0.1, fl + H - 0.1, fl + H + 0.1);
  const rail = (ua, va, ub, vb) => { const q = R(ua, va, ub, vb); bag.add('bamboo_culm', box(q[0], fl + 0.85, q[1], q[2], fl + 0.92, q[3])); bag.add('bamboo_culm', box(q[0], fl + 0.45, q[1], q[2], fl + 0.5, q[3])); col.rect(q, fl, fl + 0.95); };
  const g = 0.75, su = Math.max(-W / 2 + 1.2, Math.min(W / 2 - 1.2, u0));
  rail(-W / 2 + 0.1, D / 2 - 0.3, su - g, D / 2 - 0.24); rail(su + g, D / 2 - 0.3, W / 2 - 0.1, D / 2 - 0.24);
  rail(-W / 2 + 0.1, vw, -W / 2 + 0.16, D / 2 - 0.3); rail(W / 2 - 0.16, vw, W / 2 - 0.1, D / 2 - 0.3);
  for (const u of [-W / 2 + 0.1 + (su - g + W / 2) / 2, su + g + (W / 2 - 0.1 - su - g) / 2]) bx('bamboo_culm', u - 0.04, D / 2 - 0.3, u + 0.04, D / 2 - 0.24, fl, fl + 0.88);
  // the stair to the veranda, down to the yard
  const sr = R(su - 0.55, D / 2 + 0.0, su + 0.55, D / 2 + fl * 1.05);
  STYLES.qing.elements.stairs({ rect: sr, y0: 0, y1: fl, dir: F.up, mat: 'timber' }, ctx);
  thatch(bag, F, rand() < 0.5 ? 'thatch_palm' : 'ijuk', W, D, fl + H, 0.9);
  dressFront(el, ctx, F, { fl, vw, H, su, wr });
  if (el.interior) houseFit(el, ctx, F, { fl, vw, e, wt, rand });
}
/** What hangs and stands on a house's veranda: a bamboo bench against the wall, a bird cage, a half-lowered blind, strings of corn and chillies drying under the eaves. */
function dressFront(el, ctx, F, { fl, vw, H, su, wr }) {
  const { bag, col } = ctx, { W, D, R, P } = F, bx = (mat, u0, v0, u1, v1, y0, y1) => { const r = R(u0, v0, u1, v1); bag.add(mat, box(r[0], y0, r[1], r[2], y1, r[3])); return r; };
  const side = su > 0 ? -1 : 1, top = fl + H - 0.1;
  if (W > 5.2 && wr() < 0.7) {
    const bu = side * (W / 2 - 1.15), v0 = vw + 0.12, v1 = vw + 0.72;
    bx('bamboo_culm', bu - 0.7, v0, bu + 0.7, v1, fl + 0.4, fl + 0.45);
    for (const u of [bu - 0.62, bu + 0.62]) for (const v of [v0 + 0.06, v1 - 0.06]) bx('timber', u - 0.03, v - 0.03, u + 0.03, v + 0.03, fl, fl + 0.4);
    col.rect(R(bu - 0.7, v0, bu + 0.7, v1), fl, fl + 0.45);
    if (wr() < 0.5) bx('cloth_brown', bu - 0.4, v0 + 0.1, bu + 0.1, v1 - 0.1, fl + 0.45, fl + 0.5);           // a folded sarong on it
  }
  if (wr() < 0.4) {                                              // the bird cage on its cord from the front beam
    const [x, z] = P(-side * (W / 2 - 1.2), D / 2 - 0.5);
    bx('bamboo_culm', -side * (W / 2 - 1.2) - 0.01, D / 2 - 0.51, -side * (W / 2 - 1.2) + 0.01, D / 2 - 0.49, top - 0.6, top);
    bag.add('bamboo_culm', lathe([[0.001, 0], [0.12, 0.03], [0.13, 0.26], [0.07, 0.38], [0.001, 0.42]], 10, null, x, top - 1.02, z));
  }
  if (wr() < 0.4) { const bu = side * (W / 2 - 1.3); bx('reed_mat', bu - 0.75, D / 2 - 0.3, bu + 0.75, D / 2 - 0.26, top - 1.0, top - 0.05); bx('timber', bu - 0.77, D / 2 - 0.32, bu + 0.77, D / 2 - 0.24, top - 0.08, top); }   // the blind (tirai)
  if (wr() < 0.5) for (let k = 0; k < 5; k++) {                   // corn and chillies in strings under the front beam
    const u = -side * (W / 2 - 0.9) + (k - 2) * 0.22 * -side, hang = 0.3 + wr() * 0.25;
    bx(wr() < 0.6 ? 'cloth_ochre' : 'cloth_red', u - 0.04, D / 2 - 0.2, u + 0.04, D / 2 - 0.12, top - hang, top);
  }
}
/**
 * The inside of a house, in one of three ways (el.variant): 0 the hearth in the back corner with its firestones and pot, a sleeping
 * platform of bamboo, mats, jars and baskets; 1 the hearth, a standing loom with its half-woven cloth and a store of rice (sacks and a
 * great wicker bin); 2 the sleeping platform and a household shrine on a shelf in the corner, a small stone Buddha with flowers and
 * lamps before it, a rack of palm-leaf books.
 */
function houseFit(el, ctx, F, { fl, vw, e, wt, rand }) {
  const { bag, col } = ctx, { W, D, R, P } = F, life = STYLES.life.elements, bx = (mat, u0, v0, u1, v1, y0, y1) => { const r = R(u0, v0, u1, v1); bag.add(mat, box(r[0], y0, r[1], r[2], y1, r[3])); return r; };
  const at = (u, v) => P(u, v), y0 = fl, variant = el.variant > 0 ? el.variant : 0, sx = e - 0.2 - 1.0, hu = -e + 0.9, hv = -D / 2 + 0.85;
  bx('reed_mat', -e + 0.5, -D / 2 + 0.9, e - 0.5, vw - 0.5, y0, y0 + 0.025);        // the plaited mat on the floor
  const platform = () => {
    bx('bamboo_culm', sx - 0.9, -D / 2 + 0.35, sx + 0.9, -D / 2 + 1.55, y0 + 0.3, y0 + 0.37);
    for (const [u, v] of [[sx - 0.85, -D / 2 + 0.4], [sx + 0.85, -D / 2 + 0.4], [sx - 0.85, -D / 2 + 1.5], [sx + 0.85, -D / 2 + 1.5]]) bx('timber', u - 0.04, v - 0.04, u + 0.04, v + 0.04, y0, y0 + 0.3);
    for (let k = 0; k < 10; k++) bx('reed_mat', sx - 0.88 + k * 0.176, -D / 2 + 0.36, sx - 0.88 + k * 0.176 + 0.12, -D / 2 + 1.54, y0 + 0.37, y0 + 0.39);
    bx('cloth_ochre', sx - 0.5, -D / 2 + 0.55, sx + 0.6, -D / 2 + 1.1, y0 + 0.39, y0 + 0.5);                   // a rolled mat on it
    bx('cloth_white', sx + 0.1, -D / 2 + 1.15, sx + 0.8, -D / 2 + 1.5, y0 + 0.39, y0 + 0.43);                   // a folded sheet
  };
  const hearth = () => {
    bx('mudbrick', hu - 0.5, hv - 0.5, hu + 0.5, hv + 0.5, y0, y0 + 0.14);
    for (const a of [0, 2.1, 4.2]) bx(A, hu + Math.cos(a) * 0.2 - 0.07, hv + Math.sin(a) * 0.2 - 0.07, hu + Math.cos(a) * 0.2 + 0.07, hv + Math.sin(a) * 0.2 + 0.07, y0 + 0.14, y0 + 0.3);
    life.pot({ t: 'pot', kind: 'dark_pot', n: 1, at: at(hu, hv), y: y0 + 0.3, seed: el.seed }, ctx);
    life.firewood({ t: 'firewood', at: at(hu + 0.1, -D / 2 + 0.3), y: y0, rot: 0, len: 0.9, seed: el.seed + 1 }, ctx);
    for (const u of [hu - 0.55, hu + 0.55]) bx('bamboo_culm', u - 0.03, hv - 0.03, u + 0.03, hv + 0.03, y0 + 1.5, y0 + 2.2);
    bx('bamboo_culm', hu - 0.6, hv - 0.45, hu + 0.6, hv - 0.4, y0 + 1.5, y0 + 1.55); bx('bamboo_culm', hu - 0.6, hv + 0.4, hu + 0.6, hv + 0.45, y0 + 1.5, y0 + 1.55);
    for (let k = 0; k < 7; k++) bx('bamboo_culm', hu - 0.6 + k * 0.2, hv - 0.45, hu - 0.56 + k * 0.2, hv + 0.45, y0 + 1.55, y0 + 1.6);
    bx('ijuk', hu - 0.6, hv - 0.45, hu + 0.6, hv + 0.45, y0 + 1.6, y0 + 1.63);                                   // the soot-black underside above the fire
    for (let k = 0; k < 3; k++) bx('cloth_red', hu - 0.4 + k * 0.4 - 0.04, hv - 0.04, hu - 0.4 + k * 0.4 + 0.04, hv + 0.04, y0 + 1.15, y0 + 1.5);   // chillies strung from the rack
  };
  if (variant === 0) { platform(); hearth(); }
  if (variant === 1) {
    hearth();
    // the standing loom against the back wall: two uprights, the beams, the warp, the cloth woven below it, a seat board in front
    const lu = sx - 0.2, lv = -D / 2 + 0.38;
    for (const s of [-1, 1]) bx('timber', lu + s * 0.8 - 0.05, lv - 0.05, lu + s * 0.8 + 0.05, lv + 0.05, y0, y0 + 1.75);
    bx('timber', lu - 0.85, lv - 0.05, lu + 0.85, lv + 0.05, y0 + 1.65, y0 + 1.75); bx('timber', lu - 0.85, lv - 0.05, lu + 0.85, lv + 0.05, y0 + 0.25, y0 + 0.33);
    bx('cloth_white', lu - 0.72, lv - 0.012, lu + 0.72, lv + 0.012, y0 + 0.9, y0 + 1.65);
    for (let k = 0; k < 6; k++) bx(k % 2 ? 'cloth_red' : 'cloth_indigo', lu - 0.72 + k * 0.24, lv - 0.016, lu - 0.72 + k * 0.24 + 0.2, lv + 0.016, y0 + 0.33, y0 + 0.9);
    bx('timber', lu - 0.3, lv + 0.55, lu + 0.3, lv + 0.85, y0 + 0.2, y0 + 0.24);
    for (const [u, v] of [[lu - 0.25, lv + 0.6], [lu + 0.25, lv + 0.6], [lu - 0.25, lv + 0.8], [lu + 0.25, lv + 0.8]]) bx('timber', u - 0.02, v - 0.02, u + 0.02, v + 0.02, y0, y0 + 0.2);
    // the rice store along the end wall: sacks, and the wicker bin with its lid
    life.sacks({ t: 'sacks', n: 4, at: at(e - 0.6, vw - 1.4), y: y0, seed: el.seed + 5, rot: 0.3 }, ctx);
    const [bxx, bzz] = at(-e + 0.6, vw - 1.0);
    bag.add('wicker', lathe([[0.001, 0], [0.42, 0], [0.5, 0.45], [0.44, 0.95], [0.001, 0.95]], 14, null, bxx, y0, bzz)); bag.add('timber', lathe([[0.001, 0.97], [0.46, 0.95], [0.4, 1.04], [0.001, 1.08]], 14, null, bxx, y0, bzz)); col.circle(bxx, bzz, 0.5, y0, y0 + 1.05);
  }
  if (variant === 2) {
    platform();
    // the shrine on a shelf in the back corner: a bracketed board, the Buddha in stone, flowers and lamps, incense in a pot
    const su = -e + 0.9, sv = -D / 2 + 0.3, sy = y0 + 1.15;
    bx('timber', su - 0.6, sv - 0.2, su + 0.6, sv + 0.2, sy - 0.04, sy); for (const s of [-1, 1]) bx('timber', su + s * 0.5 - 0.03, sv - 0.2, su + s * 0.5 + 0.03, sv + 0.05, sy - 0.4, sy - 0.04);
    const [sxw, szw] = at(su, sv), n0 = P(0, 0), n1 = P(0, 1);
    buddha(bag, 'meditation', sxw, sy, szw, [n1[0] - n0[0], n1[1] - n0[1]], 0.3);
    rite({ kind: 'plate', at: at(su - 0.35, sv + 0.1), y: sy, s: 0.6, mats: ['cloth_white', 'cloth_red'] }, { bag });
    rite({ kind: 'lamps', at: at(su + 0.3, sv + 0.12), to: at(su + 0.5, sv + 0.12), y: sy, count: 2, s: 0.8 }, { bag });
    life.pot({ t: 'pot', kind: 'dark_pot', n: 1, at: at(su + 0.1, sv + 0.15), y: y0, seed: el.seed + 6 }, ctx);
    // the rack of palm-leaf books on the wall by the door end
    const ru = e - 1.4; bx('timber', ru - 0.5, -D / 2 + 0.2, ru + 0.5, -D / 2 + 0.5, y0 + 1.3, y0 + 1.34);
    for (let k = 0; k < 4; k++) bx('reed_mat', ru - 0.45 + k * 0.23, -D / 2 + 0.24, ru - 0.45 + k * 0.23 + 0.18, -D / 2 + 0.46, y0 + 1.34, y0 + 1.38 + k * 0.01);
    bx('mudbrick', hu + 0.55, hv - 0.2, hu + 1.05, hv + 0.3, y0, y0 + 0.1);                                      // a small cooking-pit by the shrine's side
  }
  // storage: jars and baskets along the front wall inside, a water pot by the door
  life.pot({ t: 'pot', kind: 'water_pot', n: 3, at: at(-0.4, vw - 0.5), y: y0, seed: el.seed + 2 }, ctx);
  life.basket({ t: 'basket', at: at(0.9, -D / 2 + 0.4), y: y0, n: 2, seed: el.seed + 3, goods: 'cloth_white' }, ctx);
  life.basket({ t: 'basket', at: at(-e + 0.5, vw - 0.5), y: y0, n: 1, seed: el.seed + 4, goods: 'cloth_ochre' }, ctx);
}
/**
 * A granary (lumbung) { rect, seed, front }: four posts a man's height with a rat-guard disc on each, a plank
 * floor, a small woven body with a hatch under a deep thatched roof (the omega-shaped roof of the Javanese barn, here a
 * saddle with flaring ridge ends), and the notched log leaning to the hatch.
 */
function lumbung(el, { bag, col }) {
  const rand = rng(el.seed || 1), F = frame(el), { W, D, R, P } = F, fl = 1.55 + rand() * 0.25, H = 1.35, e = W / 2 - 0.3, d = D / 2 - 0.3;
  const bx = (mat, u0, v0, u1, v1, y0, y1) => { const r = R(u0, v0, u1, v1); bag.add(mat, box(r[0], y0, r[1], r[2], y1, r[3])); return r; };
  for (const [u, v] of [[-e, -d], [e, -d], [-e, d], [e, d]]) {
    bx(A, u - 0.2, v - 0.2, u + 0.2, v + 0.2, 0, 0.16);
    bx('timber', u - 0.09, v - 0.09, u + 0.09, v + 0.09, 0.16, fl - 0.16);
    const [x, z] = P(u, v); bag.add('timber', lathe([[0.001, 0.02], [0.4, 0.0], [0.4, 0.04], [0.001, 0.07]], 10, null, x, 0.9, z)); col.circle(x, z, 0.4, 0, fl);   // the rat guard
  }
  const fr = bx('timber', -W / 2 + 0.1, -D / 2 + 0.1, W / 2 - 0.1, D / 2 - 0.1, fl - 0.16, fl); col.floor(fr, fl);
  const wr = bx('reed_mat', -e - 0.05, -d - 0.05, e + 0.05, d + 0.05, fl, fl + H); col.rect(wr, fl, fl + H);
  for (const k of [1, 2, 3]) { const y = fl + H * k / 4; bx('bamboo_culm', -e - 0.08, -d - 0.08, e + 0.08, d + 0.08, y - 0.025, y + 0.025); }
  bx('timber', -e - 0.1, -d - 0.1, e + 0.1, d + 0.1, fl + H - 0.08, fl + H + 0.06);
  bx('opening', -0.28, d + 0.04, 0.28, d + 0.052, fl + 0.45, fl + 1.0);
  bx('timber', -0.34, d + 0.04, 0.34, d + 0.07, fl + 1.0, fl + 1.07); bx('timber', -0.34, d + 0.04, -0.28, d + 0.07, fl + 0.4, fl + 1.0); bx('timber', 0.28, d + 0.04, 0.34, d + 0.07, fl + 0.4, fl + 1.0);
  const t = [], a = P3b(F, 0.2, d + 0.9, 0), b = P3b(F, 0.2, d + 0.25, fl + 0.45);
  beamTris(t, a, b, 0.11, 0.08); bag.add('timber', fromTriangles(t));
  thatch(bag, F, 'thatch_palm', W + 0.2, D + 0.2, fl + H, 1.05, { ov: 0.55, th: 0.28 });
}
const P3b = (F, u, v, y) => F.P3(u, v, y);
/**
 * pendopo: an open hall { rect, y, h, tiers, steps } of the monastery on a plinth of andesite (two moulded steps, a stair on
 * each of `steps` sides), the posts on stone footings (umpak) round the edge and, with `tiers`, four tall posts inside
 * carrying a raised upper roof over the middle (a hip roof in two tiers, the clerestory between open), thatch, a timber rail.
 */
function pendopo(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, h = el.h ?? 3.4, fy = y + 0.8, tiers = !!el.tiers, W = x1 - x0, D = z1 - z0, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  bag.add(A, box(x0 - 1.25, y, z0 - 1.25, x1 + 1.25, y + 0.38, z1 + 1.25)); col.rect([x0 - 1.25, z0 - 1.25, x1 + 1.25, z1 + 1.25], y, y + 0.38);
  bag.add(A, box(x0 - 1.0, y + 0.38, z0 - 1.0, x1 + 1.0, y + 0.8, z1 + 1.0)); col.rect([x0 - 1.0, z0 - 1.0, x1 + 1.0, z1 + 1.0], y + 0.38, y + 0.8); col.floor([x0 - 1.0, z0 - 1.0, x1 + 1.0, z1 + 1.0], fy);
  bag.add(A, box(x0 - 1.05, y + 0.76, z0 - 1.05, x1 + 1.05, y + 0.84, z1 + 1.05));       // the cornice
  const sides = el.steps ?? ['e', 'w'];
  for (const sd of sides) {
    const sw = Math.min(1.6, (sd === 'e' || sd === 'w' ? D : W) * 0.12);
    const rect = sd === 'e' ? [x1 + 1.0, cz - sw, x1 + 1.0 + 0.9, cz + sw] : sd === 'w' ? [x0 - 1.9, cz - sw, x0 - 1.0, cz + sw] : sd === 's' ? [cx - sw, z1 + 1.0, cx + sw, z1 + 1.9] : [cx - sw, z0 - 1.9, cx + sw, z0 - 1.0];
    STYLES.qing.elements.stairs({ rect, y0: y, y1: fy, dir: { e: 'w', w: 'e', s: 'n', n: 's' }[sd], mat: A }, { bag, col });
  }
  const nx = Math.max(2, Math.round(W / 3) + 1), nz = Math.max(2, Math.round(D / 3) + 1), doors = new Set(sides);
  const gap = (x, z) => (doors.has('e') && x === x1 && Math.abs(z - cz) < 1.8) || (doors.has('w') && x === x0 && Math.abs(z - cz) < 1.8) || (doors.has('s') && z === z1 && Math.abs(x - cx) < 1.8) || (doors.has('n') && z === z0 && Math.abs(x - cx) < 1.8);
  const post = (x, z, top, r = 0.15) => { bag.add(A, box(x - 0.3, fy, z - 0.3, x + 0.3, fy + 0.2, z + 0.3)); bag.add('timber', box(x - r, fy + 0.2, z - r, x + r, top, z + r)); col.circle(x, z, r + 0.05, fy, top); };
  const top = fy + h;
  for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) {
    if (i > 0 && i < nx - 1 && j > 0 && j < nz - 1) continue;
    const x = x0 + W * i / (nx - 1), z = z0 + D * j / (nz - 1);
    post(x, z, top);
  }
  // the beams on the posts' heads, the rail between the posts (open at the stairs)
  for (const [a, b, c, d2] of [[x0 - 0.15, z0 - 0.15, x1 + 0.15, z0 + 0.15], [x0 - 0.15, z1 - 0.15, x1 + 0.15, z1 + 0.15], [x0 - 0.15, z0 - 0.15, x0 + 0.15, z1 + 0.15], [x1 - 0.15, z0 - 0.15, x1 + 0.15, z1 + 0.15]]) bag.add('timber', box(a, top - 0.28, b, c, top, d2));
  const railSeg = (xa, za, xb, zb) => { slab(bag, 'timber', [xa, za], [xb, zb], fy + 0.85, 0.1, 0.1); slab(bag, 'timber', [xa, za], [xb, zb], fy + 0.4, 0.07, 0.07); };
  for (const [ax, az, bx2, bz] of [[x0, z0, x1, z0], [x0, z1, x1, z1], [x0, z0, x0, z1], [x1, z0, x1, z1]]) {
    const horiz = az === bz, len = horiz ? bx2 - ax : bz - az, mid = (horiz ? cx : cz), gp = (horiz ? (az === z0 ? doors.has('n') : doors.has('s')) : (ax === x0 ? doors.has('w') : doors.has('e')));
    if (gp) { const m = horiz ? [ax, mid - 1.8, bx2, mid + 1.8] : [az, mid - 1.8, bz, mid + 1.8]; if (horiz) { railSeg(ax, az, m[1], az); railSeg(m[3], az, bx2, az); col.segment([ax, az], [m[1], az], 0.3, fy, fy + 0.9); col.segment([m[3], az], [bx2, az], 0.3, fy, fy + 0.9); } else { railSeg(ax, az, ax, m[1]); railSeg(ax, m[3], ax, bz); col.segment([ax, az], [ax, m[1]], 0.3, fy, fy + 0.9); col.segment([ax, m[3]], [ax, bz], 0.3, fy, fy + 0.9); } }
    else { railSeg(ax, az, bx2, bz); col.segment([ax, az], [bx2, bz], 0.3, fy, fy + 0.9); }
    void len;
  }
  const R1 = Math.min(W, D) * (tiers ? 0.4 : 0.7), p = 1.1;
  if (!tiers) { roof(bag, [x0, z0, x1, z1], top, 1.4, 'hip', R1, el.mat || 'ijuk'); return; }
  // the tall posts and the two-tier roof: the lower hip with a hole over the middle, the upper hip raised over it
  const iu = W / 6, iv = D / 6, hole = [cx - iu - 0.4, cz - iv - 0.4, cx + iu + 0.4, cz + iv + 0.4];
  const B = Math.min(W, D) / 2 + 1.4, near = (W > D ? iv : iu) + 0.4, ts = Math.max(0, Math.min(1, (B - near) / B)), yh = top + R1 * Math.pow(ts, p);
  const yUp = yh + 2.2;
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) post(cx + sx * iu, cz + sz * iv, yUp + 0.1, 0.19);
  const rr = [cx - iu, cz - iv, cx + iu, cz + iv];
  for (const [a, b, c, d2] of [[rr[0] - 0.2, rr[1] - 0.2, rr[2] + 0.2, rr[1] + 0.2], [rr[0] - 0.2, rr[3] - 0.2, rr[2] + 0.2, rr[3] + 0.2], [rr[0] - 0.2, rr[1] - 0.2, rr[0] + 0.2, rr[3] + 0.2], [rr[2] - 0.2, rr[1] - 0.2, rr[2] + 0.2, rr[3] + 0.2]]) { bag.add('timber', box(a, yUp - 0.3, b, c, yUp, d2)); bag.add('timber', box(a, top - 0.3, b, c, top - 0.02, d2)); }
  // the ceiling over the middle: beams laid in squares, each smaller than the one above, an inverted stepped pyramid
  for (let k = 0; k < 3; k++) { const s = 1 - k * 0.25; bag.add('timber', box(cx - iu * s, yUp - 0.42 - 0.12 * k, cz - iv * s, cx + iu * s, yUp - 0.3 - 0.12 * k, cz + iv * s)); }
  roof(bag, [x0, z0, x1, z1], top, 1.4, 'hip', R1, el.mat || 'ijuk', undefined, hole);
  roof(bag, [rr[0] - 0.1, rr[1] - 0.1, rr[2] + 0.1, rr[3] + 0.1], yUp, 1.0, 'hip', Math.min(iu, iv) * 1.6, el.mat || 'ijuk');
}
/**
 * hallfit: the furnishing of the great hall { rect, y (the floor) }: at the west end the stone seat with the Buddha in
 * meditation before his stone aureole and bronze lamp stands, before it the teacher's low dais; long reed mats in
 * rows for the monks, a lectern with palm-leaf books, a bronze gong on its frame and a drum on a stand by the east end.
 */
function hallfit(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0.8, zc = (z0 + z1) / 2;
  // the seat of the image: two steps, the Buddha in dhyana on his own lotus, his aureole behind
  bag.add(A, box(x0 + 0.4, y, zc - 1.6, x0 + 3.2, y + 0.3, zc + 1.6)); col.rect([x0 + 0.4, zc - 1.6, x0 + 3.2, zc + 1.6], y, y + 0.3);
  bag.add(A, box(x0 + 0.65, y + 0.3, zc - 1.3, x0 + 2.65, y + 0.5, zc + 1.3)); col.rect([x0 + 0.65, zc - 1.3, x0 + 2.65, zc + 1.3], y + 0.3, y + 0.5);
  buddha(bag, 'meditation', x0 + 1.45, y + 0.5, zc, [1, 0], 1.55);
  { const t = [], O = [x0 + 0.85, y + 0.7, zc], r = 1.15; prism(t, RND(0, 1.55, r, 24), O, [0, 1], [1, 0], 0.14); bag.add(A, fromTriangles(t)); }     // the aureole
  { const t = [], O = [x0 + 0.99, y + 0.7, zc]; prism(t, RND(0, 1.55, 0.72, 20), O, [0, 1], [1, 0], 0.06); bag.add('gold', fromTriangles(t)); }       // …its gilt disc
  // bronze lamp stands at the sides of the seat
  for (const s of [-1, 1]) {
    const lx = x0 + 3.55, lz = zc + s * 2.1;
    bag.add('bronze', lathe([[0.2, 0], [0.2, 0.05], [0.07, 0.12], [0.04, 0.3], [0.05, 0.9], [0.14, 1.05], [0.2, 1.12], [0.17, 1.15], [0.001, 1.15]], 12, null, lx, y, lz));
    col.circle(lx, lz, 0.22, y, y + 1.15);
  }
  // the teacher's dais: low, of timber, a red mat on it
  bag.add('timber', box(x0 + 3.6, y, zc - 0.85, x0 + 4.9, y + 0.22, zc + 0.85)); col.rect([x0 + 3.6, zc - 0.85, x0 + 4.9, zc + 0.85], y, y + 0.22);
  bag.add('cloth_red', box(x0 + 3.7, y + 0.22, zc - 0.7, x0 + 4.8, y + 0.245, zc + 0.7));
  // the monks' mats in rows (the seated monks of the town plan sit on them)
  for (let r = 0; r < 3; r++) { const mx = x0 + 10 + r * 2.4; bag.add('reed_mat', box(mx - 0.55, y, zc - 7.6, mx + 0.55, y + 0.03, zc + 7.6)); bag.add('timber', box(mx - 0.57, y, zc - 7.65, mx + 0.57, y + 0.035, zc - 7.6)); bag.add('timber', box(mx - 0.57, y, zc + 7.6, mx + 0.57, y + 0.035, zc + 7.65)); }
  // the lectern with its palm-leaf books (lontar): a stand and a stack of narrow leaves, tied
  { const lx = x0 + 5.6, lz = zc - 1.9;
    bag.add('timber', box(lx - 0.35, y, lz - 0.2, lx + 0.35, y + 0.3, lz + 0.2)); col.rect([lx - 0.35, lz - 0.2, lx + 0.35, lz + 0.2], y, y + 0.3);
    for (let k = 0; k < 3; k++) bag.add('reed_mat', box(lx - 0.3, y + 0.3 + k * 0.03, lz - 0.14 + k * 0.02, lx + 0.3, y + 0.33 + k * 0.03, lz + 0.14 + k * 0.02));
    bag.add('cloth_red', box(lx - 0.02, y + 0.3, lz - 0.16, lx + 0.02, y + 0.4, lz + 0.16)); }
  // the gong on its frame and the drum on its stand, at the east end by the north corner
  { const gx = x1 - 3.0, gz = z0 + 2.2;
    for (const s of [-1, 1]) { bag.add('timber', box(gx - 0.1, y, gz + s * 0.85 - 0.06, gx + 0.1, y + 1.55, gz + s * 0.85 + 0.06)); col.circle(gx, gz + s * 0.85, 0.12, y, y + 1.55); }
    bag.add('timber', box(gx - 0.08, y + 1.5, gz - 0.95, gx + 0.08, y + 1.6, gz + 0.95));
    const t = [], O = [gx - 0.04, y + 0.4, gz]; prism(t, RND(0, 0.5, 0.45, 20), O, [0, 1], [1, 0], 0.08); prism(t, RND(0, 0.5, 0.14, 12), [gx + 0.04, y + 0.4, gz], [0, 1], [1, 0], 0.07); bag.add('bronze', fromTriangles(t));
    const dx = gx, dz = gz + 3.0;
    for (const s of [-1, 1]) bag.add('timber', box(dx - 0.5, y, dz + s * 0.35 - 0.05, dx + 0.5, y + 0.35, dz + s * 0.35 + 0.05));
    bag.add('timber', ellipsoid([dx, y + 0.62, dz], 0.28, 0.28, 0.5, 12));
    for (const sg of [-1, 1]) bag.add('hide_tan', ellipsoid([dx, y + 0.62, dz + sg * 0.47], 0.25, 0.25, 0.04, 12));
    col.rect([dx - 0.5, dz - 0.5, dx + 0.5, dz + 0.5], y, y + 0.95); }
}

/** pagar: a low wall a→b { h } of brick with a coping. */
function pagar(el, { bag, col }) { slab(bag, 'brick', el.a, el.b, 0, 0.6, el.h ?? 2); slab(bag, A, el.a, el.b, el.h ?? 2, 0.8, 0.25); col.segment(el.a, el.b, 0.6, 0, (el.h ?? 2) + 0.25); }

// ---- the way, the fields, the yards: stalls, gates, fences, huts ---------------------------------------

/** A frame for a small building from a centre, a width along the ridge and a depth, its front toward `face` ('n' | 's' | 'e' | 'w'). */
const smallFrame = (c, W, D, face) => { const ew = face === 'e' || face === 'w', hx = (ew ? D : W) / 2, hz = (ew ? W : D) / 2; return frame({ rect: [c[0] - hx, c[1] - hz, c[0] + hx, c[1] + hz], front: face }); };
/**
 * warung: a stall of the pilgrims' way { at, face (the side toward the way), w, kind: 'warung' (food and drink) | 'pasar' (offerings), seed }:
 * a plank floor 0.4 m up on posts, a woven back and ends, a counter of bamboo across the front with the goods on it (flowers in baskets,
 * clay lamps, bundles of incense; or a big pot on a hearth with cups, rice in leaves, fruit), a thatched roof sloping to the front,
 * a bamboo bench for the buyers, a cloth sign pole.
 */
function warung(el, ctx) {
  const { bag, col } = ctx, rand = rng(el.seed || 1), W = el.w ?? 4, D = 3.0, F = smallFrame(el.at, W, D, el.face), { R, P } = F, life = STYLES.life.elements;
  const bx = (mat, u0, v0, u1, v1, y0, y1) => { const r = R(u0, v0, u1, v1); bag.add(mat, box(r[0], y0, r[1], r[2], y1, r[3])); return r; };
  const fl = 0.4, H = 2.1, food = el.kind === 'warung';
  col.floor(bx('timber', -W / 2, -D / 2, W / 2, D / 2 - 0.3, fl - 0.12, fl), fl);
  for (const u of [-W / 2 + 0.1, 0, W / 2 - 0.1]) for (const v of [-D / 2 + 0.1, D / 2 - 0.4]) { bx(A, u - 0.17, v - 0.17, u + 0.17, v + 0.17, 0, 0.1); bx('timber', u - 0.07, v - 0.07, u + 0.07, v + 0.07, 0.1, fl - 0.12); }
  // back wall and ends (the ends half-height), the corner posts to the roof
  const F2 = { ...F, plank: false };
  gedhek(bag, col, F2, -W / 2 + 0.1, -D / 2 + 0.1, W / 2 - 0.1, -D / 2 + 0.22, fl, fl + H, -1);
  for (const s of [-1, 1]) gedhek(bag, col, F2, s * (W / 2 - 0.22) - 0.06, -D / 2 + 0.22, s * (W / 2 - 0.22) + 0.06, D / 2 - 0.3, fl, fl + 1.1, s);
  for (const [u, v] of [[-W / 2 + 0.1, -D / 2 + 0.1], [W / 2 - 0.1, -D / 2 + 0.1], [-W / 2 + 0.1, D / 2 - 0.4], [W / 2 - 0.1, D / 2 - 0.4]]) { bx('bamboo_culm', u - 0.06, v - 0.06, u + 0.06, v + 0.06, fl, fl + H + 0.1); const [x, z] = P(u, v); col.circle(x, z, 0.1, fl, fl + H); }
  bx('timber', -W / 2, -D / 2 + 0.05, W / 2, D / 2 - 0.3, fl + H, fl + H + 0.12);
  // the counter across the front, the shelf behind it, the goods
  const cv = D / 2 - 0.62;
  col.rect(bx('timber', -W / 2 + 0.3, cv, W / 2 - 0.3, cv + 0.36, fl, fl + 0.9), fl, fl + 0.95);
  bx('bamboo_culm', -W / 2 + 0.25, cv - 0.04, W / 2 - 0.25, cv + 0.4, fl + 0.9, fl + 0.95);
  bx('timber', -W / 2 + 0.2, -D / 2 + 0.22, W / 2 - 0.2, -D / 2 + 0.55, fl + 1.2, fl + 1.25);
  const n = Math.max(3, Math.floor((W - 1) / 0.75));
  for (let k = 0; k < n; k++) {
    const u = -W / 2 + 0.55 + (k + 0.5) * (W - 1.1) / n, [x, z] = P(u, cv + 0.18);
    if (food) {
      const j = (k + (el.seed | 0)) % 4;
      if (j === 0) life.pot({ t: 'pot', kind: 'water_pot', n: 1, at: [x, z], y: fl + 0.95, seed: el.seed + k }, ctx);
      else if (j === 1) life.basket({ t: 'basket', at: [x, z], y: fl + 0.95, n: 1, seed: el.seed + k, goods: 'cloth_white' }, ctx);          // rice in leaves
      else if (j === 2) bag.add('pottery_dark', lathe([[0.001, 0], [0.09, 0], [0.11, 0.1], [0.08, 0.14], [0.001, 0.14]], 8, null, x, fl + 0.95, z));      // a bowl
      else bag.add('terracotta', ellipsoid([x, fl + 1.05, z], 0.1, 0.09, 0.1, 8));                                                              // a fruit
    } else {
      const j = k % 3;
      if (j === 0) life.basket({ t: 'basket', at: [x, z], y: fl + 0.95, n: 1, seed: el.seed + k, goods: rand() < 0.5 ? 'cloth_red' : 'cloth_white' }, ctx);   // flowers
      else if (j === 1) rite({ kind: 'lamps', at: [x - 0.12, z], to: [x + 0.12, z], y: fl + 0.95, count: 3, s: 0.8 }, { bag });
      else bx('bamboo_culm', u - 0.1, cv + 0.12, u + 0.1, cv + 0.26, fl + 0.95, fl + 1.2);                                                       // a bundle of incense
    }
  }
  if (food) {
    const [x, z] = P(-W / 2 + 0.9, -D / 2 + 0.8);                       // the hearth in the back corner, a big pot on it
    bx('mudbrick', -W / 2 + 0.5, -D / 2 + 0.45, -W / 2 + 1.3, -D / 2 + 1.15, fl, fl + 0.3);
    life.pot({ t: 'pot', kind: 'dark_pot', n: 1, at: [x, z], y: fl + 0.3, seed: el.seed + 9 }, ctx);
  } else bx('cloth_red', -W / 2 + 0.35, -D / 2 + 0.25, -W / 2 + 0.95, -D / 2 + 0.7, fl, fl + 0.4);                                              // the stock of cloth
  // the bench in front for the buyers
  { const [x, z] = P(W / 2 - 1.1, D / 2 + 0.25); life.bench({ t: 'bench', at: [x, z], y: 0, rot: ({ n: Math.PI, s: 0, e: -Math.PI / 2, w: Math.PI / 2 })[el.face] ?? 0, len: 1.6, mat: 'bamboo_culm', seed: el.seed }, ctx); }
  thatch(bag, F, rand() < 0.6 ? 'thatch_palm' : 'ijuk', W - 0.3, D - 0.2, fl + H, 0.75, { ov: 0.65, th: 0.26, horns: false });
  // from a bamboo rail under the front eave: bunches of bananas and hanging baskets for the food stalls, strings of flower garlands and lamps for the offerings
  {
    const yr = fl + H - 0.22, vr = D / 2 - 0.5;
    bx('bamboo_culm', -W / 2 + 0.1, vr - 0.03, W / 2 - 0.1, vr + 0.03, yr, yr + 0.06);
    const m = Math.max(2, Math.floor((W - 0.8) / 1.0));
    for (let k = 0; k < m; k++) {
      const u = -W / 2 + 0.5 + (k + 0.5) * (W - 1.0) / m + (rand() - 0.5) * 0.2, [x, z] = P(u, vr), j = (k + (el.seed | 0)) % 3;
      bag.add('rope_fibre', box(x - 0.008, yr - 0.35, z - 0.008, x + 0.008, yr, z + 0.008));
      if (food && j !== 2) { for (let b = 0; b < 4; b++) bag.add('glaze_yellow', ellipsoid([x + (b - 1.5) * 0.045, yr - 0.5 - (b % 2) * 0.05, z + (b % 2 ? 0.04 : -0.04)], 0.045, 0.16, 0.045, 6)); bag.add('palm_leaf', ellipsoid([x, yr - 0.3, z], 0.07, 0.05, 0.07, 6)); }
      else if (food) bag.add('wicker', lathe([[0.001, 0], [0.12, 0.03], [0.16, 0.16], [0.001, 0.18]], 8, null, x, yr - 0.55, z));
      else { for (let f = 0; f < 6; f++) bag.add(f % 2 ? 'cloth_white' : 'cloth_ochre', ellipsoid([x, yr - 0.1 - f * 0.1, z], 0.05, 0.045, 0.05, 6)); }
    }
  }
  // a sign: a pole with a hanging cloth (red for the food, white for the offerings)
  { const u = -W / 2 - 0.15, v = D / 2 - 0.4; bx('bamboo_culm', u - 0.03, v - 0.03, u + 0.03, v + 0.03, 0, 3.0); bx('cloth_ochre', u - 0.02, v - 0.5, u + 0.02, v, 1.9, 2.7); }
}
/** A pyramidal gate of the precinct { at, axis ('z': pylons at ±z of `at`, the way along x | 'x': the way along z), half (to the passage), h }: two stepped pylons of andesite with moulded feet and caps, a small stupa on each, lions and flowers at the foot. */
function gapura(el, ctx) {
  const { bag, col } = ctx, [cx, cz] = el.at, half = el.half ?? 2.6, h = el.h ?? 5.6, ax = el.axis !== 'x';
  for (const s of [-1, 1]) {
    const px = ax ? cx : cx + s * (half + 1.55), pz = ax ? cz + s * (half + 1.55) : cz;
    const T = (hw, y0, y1) => { bag.add(A, box(px - hw, y0, pz - hw, px + hw, y1, pz + hw)); };
    T(1.55, 0, 0.35); T(1.38, 0.35, 0.55); T(1.25, 0.55, h * 0.45);
    T(1.3, h * 0.45, h * 0.45 + 0.14);                                                            // the moulding at the middle
    for (let k = 0; k < 4; k++) T(1.1 - k * 0.2, h * 0.45 + 0.14 + k * (h * 0.55 - 0.9) / 4, h * 0.45 + 0.14 + (k + 1) * (h * 0.55 - 0.9) / 4);   // the corbelled top, stepping in
    T(0.95, h - 0.76, h - 0.62); stupa(bag, px, h - 0.62, pz, 0.62);
    col.rect([px - 1.55, pz - 1.55, px + 1.55, pz + 1.55], 0, h);
    for (const t of [-1, 1]) {                                                                    // a lion on each outer side of the pylon, facing out along the way
      const lx = ax ? px + t * 2.3 : px, lz = ax ? pz : pz + t * 2.3;
      bag.add(A, box(lx - 0.45, 0, lz - 0.45, lx + 0.45, 0.22, lz + 0.45));
      lion(bag, lx, 0.22, lz, ax ? [t, 0] : [0, t], 0.7); col.circle(lx, lz, 0.5, 0, 1.2);
    }
  }
}
/** cetiya: a small stupa shrine { at, y, r } on a square andesite plinth in two steps, a row of lamps before it. */
function cetiya(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, r = el.r ?? 0.95, a = r * 2.3;
  bag.add(A, box(x - a, y, z - a, x + a, y + 0.3, z + a)); bag.add(A, box(x - a + 0.3, y + 0.3, z - a + 0.3, x + a - 0.3, y + 0.55, z + a - 0.3));
  stupa(bag, x, y + 0.55, z, r);
  col.rect([x - a, z - a, x + a, z + a], y, y + 0.55); col.circle(x, z, r * 1.2, y + 0.55, y + 0.55 + r * 2.4);
  rite({ kind: 'lamps', at: [x - 0.8, z + a + 0.4], to: [x + 0.8, z + a + 0.4], y, count: 4 }, { bag });
}
/** lesung: a rice mortar { at, rot, seed } — a hollowed log, two pestles leaning in it, a winnowing tray beside it. */
function lesung(el, ctx) {
  const { bag, col } = ctx, [x, z] = el.at, c = Math.cos(el.rot ?? 0), sn = Math.sin(el.rot ?? 0), P = (u, v) => [x + c * u + sn * v, z - sn * u + c * v];
  const a = P(-0.9, 0), b = P(0.9, 0), t = [];
  beamTris(t, [a[0], 0, a[1]], [b[0], 0, b[1]], 0.3, 0.44); bag.add('timber', fromTriangles(t));
  const a2 = P(-0.65, 0), b2 = P(0.65, 0), t2 = []; beamTris(t2, [a2[0], 0.43, a2[1]], [b2[0], 0.43, b2[1]], 0.2, 0.02); bag.add('bark_dark', fromTriangles(t2));
  const t3 = [];
  for (const [u, dv] of [[-0.25, -0.12], [0.3, 0.1]]) { const p = P(u, dv), q = P(u + 0.15, dv + 0.55); beamTris(t3, [p[0], 0.4, p[1]], [q[0], 1.4, q[1]], 0.04, 0.05); }
  bag.add('timber', fromTriangles(t3));
  const k0 = P(-0.9, -0.3), k1 = P(0.9, 0.3); col.rect([Math.min(k0[0], k1[0]), Math.min(k0[1], k1[1]), Math.max(k0[0], k1[0]), Math.max(k0[1], k1[1])], 0, 0.45);
  const w = P(0.3, 1.2); bag.add('wicker', lathe([[0.001, 0], [0.4, 0.02], [0.45, 0.07], [0.001, 0.07]], 12, null, w[0], 0.0, w[1])); bag.add('cloth_white', lathe([[0.001, 0.075], [0.32, 0.075], [0.32, 0.09], [0.001, 0.09]], 10, null, w[0], 0.0, w[1]));
}
/** gubuk: a hut in the paddies { at, rot, seed } — a platform on four bamboo posts 1.5 m up, a small steep thatched roof, a ladder, a drum of tin... a rattle line of bamboo clappers to scare the birds. */
function gubuk(el, ctx) {
  const { bag, col } = ctx, rand = rng(el.seed || 1), F = smallFrame(el.at, 2.4, 2.4, 's'), { R, P } = F, fl = 1.5;
  const rot = el.rot ?? 0, Rr = (u, v) => { const [x, z] = P(u, v), c = Math.cos(rot), s = Math.sin(rot), dx = x - el.at[0], dz = z - el.at[1]; return [el.at[0] + c * dx + s * dz, el.at[1] - s * dx + c * dz]; };
  const bxr = (mat, u0, v0, u1, v1, y0, y1) => { const a = Rr(u0, v0), b = Rr(u1, v1); bag.add(mat, box(Math.min(a[0], b[0]), y0, Math.min(a[1], b[1]), Math.max(a[0], b[0]), y1, Math.max(a[1], b[1]))); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; };
  for (const u of [-1, 1]) for (const v of [-1, 1]) { const r = bxr('bamboo_culm', u * 1.0 - 0.06, v * 1.0 - 0.06, u * 1.0 + 0.06, v * 1.0 + 0.06, 0, 2.9); col.rect(r, 0, 2.9); }
  col.floor(bxr('bamboo_culm', -1.15, -1.15, 1.15, 1.15, fl - 0.1, fl), fl);
  for (let k = 0; k < 9; k++) bxr('timber', -1.1 + k * 0.25, -1.1, -1.1 + k * 0.25 + 0.03, 1.1, fl, fl + 0.02);
  bxr('reed_mat', -1.0, -1.0, 1.0, -0.96, fl, fl + 0.9);                                         // the screen at the back
  bxr('timber', -1.0, 0.9, 1.0, 0.94, fl + 0.85, fl + 0.9);
  // the roof: a pyramid of thatch on a hip frame, from the posts' heads
  const t = [], apex = Rr(0, 0), c = [[-1.5, -1.5], [1.5, -1.5], [1.5, 1.5], [-1.5, 1.5]].map(([u, v]) => Rr(u, v));
  for (let i = 0; i < 4; i++) { const a = c[i], b = c[(i + 1) % 4]; t.push(a[0], 2.75, a[1], b[0], 2.75, b[1], apex[0], 3.7, apex[1], a[0], 2.69, a[1], apex[0], 3.64, apex[1], b[0], 2.69, b[1]); }
  bag.add('thatch_palm', fromTriangles(t));
  const l = []; const a = Rr(0.4, 1.9), b = Rr(0.4, 1.0); beamTris(l, [a[0], 0, a[1]], [b[0], fl, b[1]], 0.07, 0.05); bag.add('timber', fromTriangles(l));    // the ladder pole
  // the clapper line: a cord from the hut's corner out over the paddy with bamboo clappers hanging
  const e0 = Rr(1.0, 1.0), e1 = Rr(1.0, 9.0), cl = []; beamTris(cl, [e0[0], 2.4, e0[1]], [e1[0], 1.4, e1[1]], 0.008, 0.008); bag.add('rope_fibre', fromTriangles(cl));
  for (let k = 1; k <= 4; k++) { const p = Rr(1.0, 1.0 + k * 2), y = 2.4 - k * 0.25; bag.add('bamboo_culm', box(p[0] - 0.03, y - 0.5, p[1] - 0.03, p[0] + 0.03, y, p[1] + 0.03)); }
  void rand;
}
/** orang: a scarecrow { at, rot, seed } — a pole with a cross bar, a rag shirt, a straw hat, a clay pot for a head. */
function orang(el, { bag }) {
  const [x, z] = el.at, rand = rng(el.seed || 1), c = Math.cos(el.rot ?? 0), s = Math.sin(el.rot ?? 0), P = (u) => [x + c * u, z - s * u];
  bag.add('bamboo_culm', box(x - 0.035, 0, z - 0.035, x + 0.035, 1.85, z + 0.035)); const t = [], a = P(-0.6), b = P(0.6); beamTris(t, [a[0], 1.4, a[1]], [b[0], 1.4, b[1]], 0.025, 0.04); bag.add('bamboo_culm', fromTriangles(t));
  bag.add(rand() < 0.5 ? 'cloth_brown' : 'cloth_indigo', lathe([[0.001, 0.75], [0.3, 0.78], [0.2, 1.35], [0.001, 1.4]], 8, null, 0, 0, 0).scale(1, 1, 0.5).translate(x, 0, z));
  const sl = P(-0.55), sr = P(0.55); bag.add('cloth_ochre', box(sl[0] - 0.04, 1.05, sl[1] - 0.04, sl[0] + 0.04, 1.4, sl[1] + 0.04)); bag.add('cloth_ochre', box(sr[0] - 0.04, 1.0, sr[1] - 0.04, sr[0] + 0.04, 1.4, sr[1] + 0.04));
  bag.add('pottery_dark', ellipsoid([x, 1.7, z], 0.14, 0.17, 0.14, 8));
  bag.add('thatch_palm', lathe([[0.001, 1.95], [0.4, 1.8], [0.38, 1.78], [0.001, 1.84]], 12, null, x, 0, z));
}
/** pagarbambu: a fence of plaited bamboo palings between posts a→b { h }, a rail over it. */
function pagarbambu(el, { bag, col }) {
  const h = el.h ?? 1.05, [ax, az] = el.a, [bx2, bz] = el.b, L = Math.hypot(bx2 - ax, bz - az), n = Math.max(1, Math.round(L / 1.6));
  slab(bag, 'reed_mat', el.a, el.b, 0.12, 0.05, h - 0.2);
  slab(bag, 'bamboo_culm', el.a, el.b, h - 0.1, 0.07, 0.07); slab(bag, 'bamboo_culm', el.a, el.b, 0.3, 0.06, 0.05);
  for (let i = 0; i <= n; i++) { const x = ax + (bx2 - ax) * i / n, z = az + (bz - az) * i / n; bag.add('timber', box(x - 0.045, 0, z - 0.045, x + 0.045, h + 0.08, z + 0.045)); }
  col.segment(el.a, el.b, 0.12, 0, h);
}
/** gamelan: a set of bronze instruments { at, y, rot } — two keyed metallophones on carved frames, a big hung gong and two kettle gongs, a drum — for the village hall. */
function gamelan(el, ctx) {
  const { bag, col } = ctx, [x, z] = el.at, y = el.y ?? 0, c = Math.cos(el.rot ?? 0), s = Math.sin(el.rot ?? 0), P = (u, v) => [x + c * u + s * v, z - s * u + c * v];
  const rb = (mat, u0, v0, u1, v1, y0, y1) => { const a = P(u0, v0), b = P(u1, v1); bag.add(mat, box(Math.min(a[0], b[0]), y0, Math.min(a[1], b[1]), Math.max(a[0], b[0]), y1, Math.max(a[1], b[1]))); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; };
  for (const [u, n] of [[-1.3, 7], [0.2, 6]]) {                                      // metallophones: a trough frame, the keys laid on cords
    col.rect(rb('timber_red', u - 0.45, -0.4, u + 0.45, 0.4, y + 0.0, y + 0.3), y, y + 0.35);
    rb('timber', u - 0.5, -0.45, u + 0.5, -0.38, y, y + 0.34); rb('timber', u - 0.5, 0.38, u + 0.5, 0.45, y, y + 0.34);
    for (let k = 0; k < n; k++) { const w = 0.1 - k * 0.004, v0 = -0.34 + k * (0.68 / n); rb('bronze', u - 0.34, v0, u + 0.34, v0 + w, y + 0.34, y + 0.37); }
  }
  for (const [u, v, r] of [[1.4, -0.5, 0.2], [1.4, 0.5, 0.2]]) {                      // kettle gongs on cords across a low frame
    const p = P(u, v); bag.add('bronze', lathe([[0.001, 0.0], [r, 0.0], [r * 1.05, 0.08], [r * 0.4, 0.12], [0.001, 0.14]], 12, null, p[0], y + 0.25, p[1]));
    const f = rb('timber', u - 0.3, v - 0.28, u + 0.3, v + 0.28, y + 0.05, y + 0.25); col.rect(f, y, y + 0.3);
  }
  const gp = P(-0.2, 1.7);                                                          // the great gong on its frame
  for (const t of [-1, 1]) { const q = P(-0.2 + t * 0.95, 1.7); bag.add('timber_red', box(q[0] - 0.06, y, q[1] - 0.06, q[0] + 0.06, y + 1.7, q[1] + 0.06)); col.circle(q[0], q[1], 0.1, y, y + 1.7); }
  rb('timber_red', -1.2, 1.64, 0.8, 1.76, y + 1.6, y + 1.72);
  { const t = []; prism(t, RND(0, 0.95, 0.5, 22), [gp[0], y, gp[1]], [c, -s], [s, c], 0.07); bag.add('bronze', fromTriangles(t)); const t2 = []; prism(t2, RND(0, 0.95, 0.15, 12), [gp[0] + s * 0.05, y, gp[1] + c * 0.05], [c, -s], [s, c], 0.07); bag.add('gold', fromTriangles(t2)); }
  const dr = P(1.0, 1.7); bag.add('timber_red', ellipsoid([dr[0], y + 0.5, dr[1]], 0.26, 0.26, 0.42, 12)); col.circle(dr[0], dr[1], 0.4, y, y + 0.8);
}

/**
 * umbul: a pennant pole { at, y, h, rot, seed, cloth } — a bamboo pole leaning a little, a crossbar near the top, long tapering streamers of
 * cloth hanging from it and stirring to one side, a bronze finial; on a small andesite footing. The pilgrims' way is hung with them.
 */
function umbul(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, rand = rng(el.seed || 1), h = el.h ?? 5.2, rot = el.rot ?? 0, c = Math.cos(rot), sn = Math.sin(rot);
  const lean = (rand() - 0.5) * 0.3, P = (u, v) => [x + c * u + sn * v, z - sn * u + c * v];
  bag.add(A, box(x - 0.3, y, z - 0.3, x + 0.3, y + 0.22, z + 0.3));
  const t = []; const top = P(lean, 0); beamTris(t, [x, y + 0.2, z], [top[0], y + h, top[1]], 0.035, 0.035); bag.add('bamboo_culm', fromTriangles(t));
  const cb = [], yb = y + h - 0.35, e0 = P(lean - 0.5, 0), e1 = P(lean + 0.5, 0); beamTris(cb, [e0[0], yb, e0[1]], [e1[0], yb, e1[1]], 0.02, 0.02); bag.add('bamboo_culm', fromTriangles(cb));
  bag.add('bronze', ellipsoid([top[0], y + h + 0.07, top[1]], 0.05, 0.1, 0.05, 6));
  const cl = el.cloth ?? ['cloth_red', 'cloth_white', 'cloth_ochre', 'cloth_indigo'][Math.floor(rand() * 4)];
  const flag = (u, len, w0, sway, mat) => {
    const tri = [], n = 7;
    let prev = null;
    for (let i = 0; i <= n; i++) {
      const f = i / n, w = w0 * (1 - 0.85 * f), off = Math.sin(f * 2.6 + u) * sway * f, p = P(lean + u + off, 0), yy = yb - 0.04 - f * len;
      const a = P(lean + u + off - w / 2, 0), b = P(lean + u + off + w / 2, 0);
      void p;
      const cur = [[a[0], yy, a[1]], [b[0], yy, b[1]]];
      if (prev) { const [a0, b0] = prev, [a1, b1] = cur; tri.push(...a0, ...b0, ...a1, ...b0, ...b1, ...a1, ...a0, ...a1, ...b0, ...b0, ...a1, ...b1); }
      prev = cur;
    }
    bag.add(mat, fromTriangles(tri));
  };
  flag(-0.34, h * 0.5, 0.36, 0.14, cl); flag(0, h * 0.62, 0.42, -0.12, cl === 'cloth_white' ? 'cloth_red' : 'cloth_white'); flag(0.34, h * 0.44, 0.34, 0.16, cl);
  col.circle(x, z, 0.12, y, y + h);
}
registerStyle('javanese', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.qing.elements, borobudur, rumah, pendopo, hallfit, pagar, rite, warung, gapura, cetiya, lesung, gubuk, orang, pagarbambu, gamelan, umbul },
  objects: {},
});
