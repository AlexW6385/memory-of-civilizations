// The great halls of Daci'en (docs/settlements/tang-changan.md §17): the Tang hall of the style (src/styles/tang/hall.js), rebuilt with what
// that module leaves plain, for the temple's main halls: a two-tier platform with a front terrace, moulded and ringed with a stone
// balustrade (posts with lotus caps, carved panels, dragon-head spouts), bracket sets of the Tang manner (a capital block, stepped arms with
// their blocks, the slanting lever arm (ang) and the diagonal sets at the corners), posts along the side walls with the white walls between,
// a stone-footed wall, a name board over the door, the door's planked leaves with their studs, framed windows, the owl tails of the ridge
// drawn full, the round tile ends along the eaves. Same frame and parameters as `tang_hall`; plus terrace, wadang, board, lanterns.
import { box, frustum, fromTriangles, lathe } from '../../core/geom.js';
import { inFrame, YAW, wallRun, tangRoof } from '../../styles/tang/kit.js';

/** A convex solid from two rings of four vertices (bottom ring, top ring), faces oriented outward. */
function hull(bag, mat, v) {
  const cen = [0, 1, 2].map((i) => v.reduce((s, p) => s + p[i], 0) / v.length), out = [];
  const T = (a, b, c) => {
    const e1 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], e2 = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
    const n = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]];
    const m = [(a[0] + b[0] + c[0]) / 3 - cen[0], (a[1] + b[1] + c[1]) / 3 - cen[1], (a[2] + b[2] + c[2]) / 3 - cen[2]];
    if (n[0] * m[0] + n[1] * m[1] + n[2] * m[2] >= 0) out.push(...a, ...b, ...c); else out.push(...a, ...c, ...b);
  };
  for (const [i, j, k, l] of [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]]) { T(v[i], v[j], v[k]); T(v[i], v[k], v[l]); }
  bag.add(mat, fromTriangles(out));
}
/** A beam from s to e (the bottom's centre line, 3D points), half-width hw across (horizontal, perpendicular), height h0 at s, h1 at e. */
function beam(bag, mat, s, e, hw, h0, h1) {
  const dx = e[0] - s[0], dz = e[2] - s[2], L = Math.hypot(dx, dz) || 1, tx = -dz / L * hw, tz = dx / L * hw;
  const ring = (y0, y1) => [[s[0] - tx, s[1] + y0, s[2] - tz], [s[0] + tx, s[1] + y0, s[2] + tz], [e[0] + tx, e[1] + y1, e[2] + tz], [e[0] - tx, e[1] + y1, e[2] - tz]];
  hull(bag, mat, [...ring(0, 0), ...ring(h0, h1)]);
}

/**
 * One bracket set (puzuo) on a column head at (x, z) looking out along u (a unit axis); k scales it (1 for a bay 1.9 m deep). A capital block
 * with a narrow neck; the first tier: the arm out (huagong) with the cross arm (lingong) and blocks at their ends; the second tier the same, longer;
 * the lever arm (ang), a slanting bar whose outer end dips and thins; a long top arm under the eave purlin.
 */
function bracket(bag, mat, x, z, y, u, k, light) {
  const t = [-u[1], u[0]];
  const P = (a, b) => [x + u[0] * a * k + t[0] * b * k, z + u[1] * a * k + t[1] * b * k];
  const B = (a0, a1, b0, b1, y0, y1) => { const p = P(a0, b0), q = P(a1, b1); bag.add(mat, box(Math.min(p[0], q[0]), y + y0 * k, Math.min(p[1], q[1]), Math.max(p[0], q[0]), y + y1 * k, Math.max(p[1], q[1]))); };
  B(-0.26, 0.26, -0.26, 0.26, 0, 0.1); B(-0.42, 0.42, -0.42, 0.42, 0.1, 0.32);                   // the capital block
  B(-0.5, 1.05, -0.2, 0.2, 0.32, 0.62); B(-0.2, 0.2, -0.78, 0.78, 0.32, 0.6);                     // tier 1: the arm out, the cross arm
  B(0.88, 1.24, -0.26, 0.26, 0.62, 0.86); for (const s of [-1, 1]) B(-0.26, 0.26, s * 0.5, s * 0.88, 0.6, 0.84);
  B(-0.3, 1.65, -0.18, 0.18, 0.86, 1.12); B(-0.18, 0.18, -1.2, 1.2, 0.86, 1.1);                   // tier 2
  B(1.4, 1.82, -0.24, 0.24, 1.12, 1.34); for (const s of [-1, 1]) B(-0.24, 0.24, s * 0.95, s * 1.34, 1.1, 1.32);
  B(1.3, 1.95, -1.45, 1.45, 1.34, 1.62);                                                           // the top arm under the purlin
  const a = P(-0.25, 0), b = P(2.0, 0), ya = y + 1.22 * k, yb = y + 0.34 * k;                      // the lever arm, high inside, dipping out
  beam(bag, mat, [a[0], ya, a[1]], [b[0], yb, b[1]], 0.15 * k, 0.34 * k, 0.14 * k);
  if (light) return;
  for (const s of [-1, 1]) { const c = P(0.5, s * 0.13), d = P(1.4, s * 0.62); beam(bag, mat, [c[0], y + 0.3 * k, c[1]], [d[0], y + 0.3 * k, d[1]], 0.07 * k, 0.26 * k, 0.2 * k); }   // the splayed arms
}
/** The diagonal set at a corner column: a long lever arm and a stepped arm along the diagonal. (sx, sz): which corner. */
function cornerBracket(bag, mat, x, z, y, sx, sz, k) {
  const q = Math.SQRT1_2, d = [sx * q, sz * q];
  const at = (a, yy) => [x + d[0] * a * k, y + yy * k, z + d[1] * a * k];
  beam(bag, mat, at(-0.1, 0.3), at(1.5, 0.3), 0.13 * k, 0.3 * k, 0.3 * k);
  beam(bag, mat, at(0.6, 0.62), at(2.0, 0.62), 0.14 * k, 0.28 * k, 0.28 * k);
  beam(bag, mat, at(-0.3, 1.3), at(2.7, 0.4), 0.15 * k, 0.34 * k, 0.15 * k);
}

/** The owl tail (chiwei): a thick horn that curls inward, an outer comb of fins, a spike. ex: the ridge end's x, s: +1 east / −1 west. */
function owlTail(bag, mat, ex, s, y0, h, hw) {
  const N = 9, dh = h / N;
  bag.add(mat, box(ex - 0.42, y0 - 0.1, -hw - 0.08, ex + 0.42, y0 + 0.28, hw + 0.08));
  for (let k = 0; k < N; k++) {
    const f = k / (N - 1), cx = ex - s * f * f * 0.42 * h, th = 0.7 * (1 - 0.66 * f) + 0.12, w = hw * (1 - 0.42 * f), ya = y0 + 0.28 + k * dh;
    bag.add(mat, box(cx - th / 2, ya, -w, cx + th / 2, ya + dh + 0.01, w));
    if (k >= 1 && k <= 6 && k % 2 === 1) bag.add(mat, box(s > 0 ? cx + th / 2 : cx - th / 2 - 0.14, ya, -0.13, s > 0 ? cx + th / 2 + 0.14 : cx - th / 2, ya + dh * 0.7, 0.13));
  }
  const cx = ex - s * 0.42 * h;
  bag.add(mat, box(cx - 0.08, y0 + 0.28 + N * dh, -0.1, cx + 0.08, y0 + 0.28 + N * dh + 0.28, 0.1));
}

/** The stone balustrade round a terrace: posts with lotus caps, panels with a raised border and a lozenge, spouts; gaps [[s0, s1]] on the run. */
function balustrade(L, y, a, b, o, gaps = [], ends = true) {
  const { bag, col } = L, alongX = Math.abs(b[0] - a[0]) > Math.abs(b[1] - a[1]);
  const len = alongX ? Math.abs(b[0] - a[0]) : Math.abs(b[1] - a[1]), c0 = alongX ? a[1] : a[0], s0 = alongX ? Math.min(a[0], b[0]) : Math.min(a[1], b[1]);
  const R = (u0, u1, hc, y0, y1, m, off = 0) => bag.add(m, alongX ? box(s0 + u0, y + y0, c0 + off - hc, s0 + u1, y + y1, c0 + off + hc) : box(c0 + off - hc, y + y0, s0 + u0, c0 + off + hc, y + y1, s0 + u1));
  // the posts: evenly spaced, and a post at each side of a gap
  const edges = [0, ...gaps.flatMap((g) => g), len].sort((p, q) => p - q), runs = [];
  for (let i = 0; i < edges.length; i += 2) if (edges[i + 1] - edges[i] > 0.5) runs.push([edges[i], edges[i + 1]]);
  for (const [r0, r1] of runs) {
    const n = Math.max(1, Math.round((r1 - r0) / 2.3)), step = (r1 - r0) / n;
    for (let i = 0; i <= n; i++) {
      const u = r0 + i * step;
      if (!ends && (i === 0 || i === n)) continue;
      R(u - 0.16, u + 0.16, 0.16, 0, 0.3, 'limestone');                                                    // the foot
      R(u - 0.11, u + 0.11, 0.11, 0.3, 1.0, 'limestone');                                                  // the shaft
      R(u - 0.15, u + 0.15, 0.15, 1.0, 1.1, 'limestone'); R(u - 0.2, u + 0.2, 0.2, 1.1, 1.2, 'granite_block'); R(u - 0.12, u + 0.12, 0.12, 1.2, 1.32, 'limestone'); R(u - 0.06, u + 0.06, 0.06, 1.32, 1.4, 'limestone');   // the lotus cap
      if (i % 2 === 0 && i < n + 1) R(u - 0.07, u + 0.07, 0.24, 0.1, 0.22, 'granite_block', o * 0.25);   // the dragon-head spout at the foot, projecting
    }
    for (let i = 0; i < n; i++) {
      const p0 = r0 + i * step + 0.11, p1 = r0 + (i + 1) * step - 0.11;
      R(p0, p1, 0.07, 0.22, 0.88, 'limestone'); R(p0, p1, 0.1, 0.88, 1.0, 'limestone'); R(p0, p1, 0.09, 0.14, 0.22, 'limestone');   // the panel, the top rail, the bottom rail
      for (const [q0, q1] of [[p0, p0 + 0.08], [p1 - 0.08, p1]]) R(q0, q1, 0.095, 0.24, 0.86, 'limestone');                             // the border's sides
      R(p0, p1, 0.095, 0.24, 0.31, 'limestone'); R(p0, p1, 0.095, 0.79, 0.86, 'limestone');
      const m = (p0 + p1) / 2; R(m - 0.3, m + 0.3, 0.09, 0.45, 0.69, 'bluestone');                                                         // the lozenge field
    }
    const q0 = alongX ? [s0 + r0, c0] : [c0, s0 + r0], q1 = alongX ? [s0 + r1, c0] : [c0, s0 + r1];
    col.segment(q0, q1, 0.3, y, y + 1.1);
  }
}

export function buildDaciHall(L, p) {
  const { w, d, y = 0, H = 3.6, nb = 3, kind = 'hall', over = 1.9, det = 2, interior = false } = p;
  const plat = p.plat ?? 0.45, F = y + plat, bh = p.bh ?? 0.9, pal = p.pal || {}, k = bh / 1.9;
  const gable = p.roof ? p.roof === 'gable' : w < d + 0.5, bag = L.bag, col = L.col;
  const colMat = pal.column || 'timber_red', wallMat = pal.wall || 'plaster_white', brk = pal.bracket || 'timber_red';
  const xs = Array.from({ length: nb + 1 }, (_, i) => -w / 2 + (w * i) / nb);
  const nz = Math.max(2, Math.round(d / 4.6)), zs = Array.from({ length: nz + 1 }, (_, i) => -d / 2 + (d * i) / nz);
  const px = w / 2 + 0.8, pz = d / 2 + 0.8, sw = Math.min(p.big ? 4.4 : 3.4, w / nb), dp = 0.42;
  // ── the platform: one tier (steps in front), or two with a front terrace and the balustrade (p.terrace)
  const upper = [-px, -pz, px, pz];
  bag.add('brick_grey', frustum(upper, y - 0.05, F, 0, 0, 0, 0, { noBottom: y <= 0.01 }));
  bag.add('limestone', frustum([-px - 0.08, -pz - 0.08, px + 0.08, pz + 0.08], F - 0.13, F, 0, 0, 0, 0));       // the coping
  bag.add('granite_block', frustum([-px - 0.1, -pz - 0.1, px + 0.1, pz + 0.1], y - 0.05, y + 0.16, 0, 0, 0, 0, { noBottom: y <= 0.01 }));   // the foot course
  col.rect(upper, y - 0.05, F); col.floor(upper, F);
  if (p.terrace) {
    const h1 = plat * 0.5, mS = 1.6, mF = 3.4, low = [-px - mS, -pz - mS, px + mS, pz + mF];
    bag.add('brick_grey', frustum(low, y - 0.05, y + h1, 0, 0, 0, 0, { noBottom: y <= 0.01 }));
    bag.add('limestone', frustum([low[0] - 0.08, low[1] - 0.08, low[2] + 0.08, low[3] + 0.08], y + h1 - 0.12, y + h1, 0, 0, 0, 0));
    bag.add('granite_block', frustum([low[0] - 0.1, low[1] - 0.1, low[2] + 0.1, low[3] + 0.1], y - 0.05, y + 0.14, 0, 0, 0, 0, { noBottom: y <= 0.01 }));
    col.rect(low, y - 0.05, y + h1); col.floor(low, y + h1);
    // the two flights on the axis: the upper down to the terrace, the lower to the court
    const n2 = Math.max(2, Math.ceil((plat - h1) / 0.2)), n1 = Math.max(2, Math.ceil(h1 / 0.2)), zf = low[3];
    for (let i = 0; i < n2 - 1; i++) bag.add('granite_block', box(-sw / 2, y + h1, pz + i * dp, sw / 2, F - ((i + 1) * (plat - h1)) / n2, pz + (i + 1) * dp));
    col.ramp([-sw / 2, pz, sw / 2, pz + n2 * dp], y + h1, F, 'n');
    for (let i = 0; i < n1 - 1; i++) bag.add('granite_block', box(-sw / 2, y - 0.02, zf + i * dp, sw / 2, y + h1 - ((i + 1) * h1) / n1, zf + (i + 1) * dp));
    col.ramp([-sw / 2, zf, sw / 2, zf + n1 * dp], y, y + h1, 'n');
    // the balustrade round the terrace, open at the flight
    const X = low[2] - 0.22, X0 = low[0] + 0.22, Zn = low[1] + 0.22, Zs = low[3] - 0.22;
    balustrade(L, y + h1, [X0, Zn], [X, Zn], -1); balustrade(L, y + h1, [X0, Zs], [X, Zs], 1, [[(X - X0) / 2 - sw / 2 - 0.25, (X - X0) / 2 + sw / 2 + 0.25]]);
    balustrade(L, y + h1, [X0, Zn], [X0, Zs], -1, [], false); balustrade(L, y + h1, [X, Zn], [X, Zs], 1, [], false);
    // the stairs' cheeks: stone blocks each side of the lower flight, as high as the first step above them
    for (const s of [-1, 1]) bag.add('limestone', box(s * (sw / 2 + 0.1) - 0.1, y - 0.02, zf, s * (sw / 2 + 0.1) + 0.1, y + h1 * 0.55, zf + n1 * dp * 0.7));
  } else if (plat > 0.2 && p.steps !== false) {
    const ns = Math.max(2, Math.ceil(plat / 0.22));
    for (let i = 0; i < ns - 1; i++) bag.add('granite_block', box(-sw / 2, y - 0.02, pz + i * dp, sw / 2, F - ((i + 1) * plat) / ns, pz + (i + 1) * dp));
    col.ramp([-sw / 2, pz, sw / 2, pz + ns * dp], y, F, 'n');
  }
  // ── columns on stone bases, the side posts too, the architrave, the frieze, the bracket sets
  const top = F + H;
  const post = (x, z) => {
    bag.add('granite_block', box(x - 0.42, F, z - 0.42, x + 0.42, F + 0.16, z + 0.42));
    bag.add('limestone', box(x - 0.34, F + 0.16, z - 0.34, x + 0.34, F + 0.26, z + 0.34));           // the moulded base's upper course
    if (det >= 2 && p.big && L.style.column) L.style.column({ at: [x, z], y: F + 0.26, h: H - 0.26, d: 0.56 }, L);
    else bag.add(colMat, box(x - 0.2, F + 0.26, z - 0.2, x + 0.2, top, z + 0.2));
    col.circle(x, z, 0.3, F, top);
  };
  if (det >= 1) {
    for (const z of [-d / 2, d / 2]) for (const x of xs) post(x, z);
    for (const x of [-w / 2, w / 2]) for (const z of zs.slice(1, -1)) post(x, z);              // the side walls' posts between the corners
    for (const z of [-d / 2, d / 2]) bag.add(colMat, box(-w / 2 - 0.2, top - 0.4, z - 0.17, w / 2 + 0.2, top, z + 0.17));
    for (const x of [-w / 2, w / 2]) bag.add(colMat, box(x - 0.17, top - 0.4, -d / 2 - 0.2, x + 0.17, top, d / 2 + 0.2));
    for (const z of [-d / 2, d / 2]) bag.add(wallMat, box(-w / 2 - 0.1, top, z - 0.13, w / 2 + 0.1, top + bh - 0.03, z + 0.13));
    for (const x of [-w / 2, w / 2]) bag.add(wallMat, box(x - 0.13, top, -d / 2 - 0.1, x + 0.13, top + bh - 0.03, d / 2 + 0.1));
    const dbay = kind === 'hall' ? (nb - 1) / 2 : -1;
    for (const x of xs) for (const [z, uz] of [[-d / 2, -1], [d / 2, 1]]) bracket(bag, brk, x, z, top, [0, uz], k, !p.big);
    for (const z of zs) for (const [x, ux] of [[-w / 2, -1], [w / 2, 1]]) if (Math.abs(z) < d / 2 - 0.01) bracket(bag, brk, x, z, top, [ux, 0], k, !p.big);
    for (const z of [-d / 2, d / 2]) for (const [x, ux] of [[-w / 2, -1], [w / 2, 1]]) bracket(bag, brk, x, z, top, [ux, 0], k, !p.big);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) cornerBracket(bag, brk, sx * w / 2, sz * d / 2, top, sx, sz, k);
    if (p.big) for (let i = 0; i < nb; i++) { if (i === dbay) continue; const x = (xs[i] + xs[i + 1]) / 2; for (const [z, uz] of [[-d / 2, -1], [d / 2, 1]]) bracket(bag, brk, x, z, top + 0.1, [0, uz], k * 0.9, true); }
  }
  // ── the walls: stone-footed, white between the posts
  const wh = top - 0.4, bay = w / nb;
  const sideWall = (x) => wallRun(L, wallMat, [x, -d / 2], [x, d / 2], 0.36, F, wh);
  if (p.sides !== false) { sideWall(-w / 2); sideWall(w / 2); }
  if (!p.through) wallRun(L, wallMat, [-w / 2, -d / 2], [w / 2, -d / 2], 0.36, F, wh);
  const dw = Math.min(bay - 0.9, p.doorW ?? 2.6), front = [];
  if (kind === 'hall') {
    for (let i = 0; i < nb; i++) {
      const mid = (i + 0.5) * bay;
      if (i === (nb - 1) / 2) front.push({ at: mid, w: dw, h: Math.min(H - 0.8, 3.3), y0: F });
      else front.push({ at: mid, w: Math.min(bay - 1.2, 1.8), h: 1.35, y0: F + 1.05 });
    }
    wallRun(L, wallMat, [-w / 2, d / 2], [w / 2, d / 2], 0.36, F, wh, front);
  } else if (kind === 'closed') wallRun(L, wallMat, [-w / 2, d / 2], [w / 2, d / 2], 0.36, F, wh);
  if (det >= 1 && kind !== 'open') {
    // the stone footing of the wall (0.5 m) outside, interrupted at the door
    const sf = (a, b, z) => { if (b - a > 0.05) bag.add('brick_grey', box(a, F, z - 0.21, b, F + 0.5, z + 0.21)); };
    sf(-w / 2, w / 2, -d / 2);
    if (kind === 'hall') { sf(-w / 2, -dw / 2 - 0.05, d / 2); sf(dw / 2 + 0.05, w / 2, d / 2); } else sf(-w / 2, w / 2, d / 2);
    for (const x of [-w / 2, w / 2]) bag.add('brick_grey', box(x - 0.21, F, -d / 2, x + 0.21, F + 0.5, d / 2));
  }
  if (kind === 'hall' && det >= 1) for (const o of front) {
    const x = -w / 2 + o.at, z = d / 2;
    if (o.y0 > F + 0.5) {   // a window: red frame, the barred lattice, a stone sill
      bag.add('lattice_red', box(x - o.w / 2, o.y0, z - 0.05, x + o.w / 2, o.y0 + o.h, z + 0.05));
      bag.add('timber_red', box(x - o.w / 2 - 0.1, o.y0 - 0.06, z - 0.12, x + o.w / 2 + 0.1, o.y0 + 0.04, z + 0.12)); bag.add('timber_red', box(x - o.w / 2 - 0.1, o.y0 + o.h - 0.04, z - 0.12, x + o.w / 2 + 0.1, o.y0 + o.h + 0.08, z + 0.12));
      for (const s of [-1, 1]) bag.add('timber_red', box(x + s * (o.w / 2 + 0.05) - 0.06, o.y0, z - 0.12, x + s * (o.w / 2 + 0.05) + 0.06, o.y0 + o.h, z + 0.12));
      bag.add('limestone', box(x - o.w / 2 - 0.16, o.y0 - 0.14, z - 0.18, x + o.w / 2 + 0.16, o.y0 - 0.06, z + 0.2));
    } else {                // the door: jambs, a heavy lintel, the threshold, two planked leaves swung back inside with their studs, the name board above
      const hd = o.w / 2;
      for (const s of [-1, 1]) bag.add('timber_red', box(x + s * hd - (s > 0 ? 0 : 0.2), F, z - 0.14, x + s * hd + (s > 0 ? 0.2 : 0), F + o.h, z + 0.14));
      bag.add('timber_red', box(x - hd - 0.2, F + o.h, z - 0.15, x + hd + 0.2, F + o.h + 0.34, z + 0.15));
      bag.add('limestone', box(x - hd, F, z - 0.3, x + hd, F + 0.1, z + 0.3));
      for (const s of [-1, 1]) {
        const lx = x + s * (hd - 0.06), lz0 = z - 0.12, lz1 = lz0 - Math.min(1.7, hd), hh = o.h - 0.1;
        bag.add('wood_dark', box(lx - 0.05, F + 0.1, lz1, lx + 0.05, F + 0.1 + hh, lz0));
        for (let q = 0; q < 4; q++) for (let r = 0; r < 6; r++) {   // the studs, in rows
          const zz = lz0 - 0.2 - q * (lz0 - lz1 - 0.3) / 3, yy = F + 0.5 + r * (hh - 0.7) / 5, sg = s > 0 ? 1 : -1;
          bag.add('gilt_bronze', box(lx - 0.075 * 1 - 0.0, yy, zz - 0.045, lx + 0.075, yy + 0.09, zz + 0.045)); void sg;
        }
        col.segment([lx, lz0], [lx, lz1], 0.1, F, F + hh);
      }
      const bw = Math.min(2.6, hd * 1.5);   // the name board (bian): black lacquer, a gilt rim, three gilt marks
      bag.add('wood_dark', box(x - bw / 2, top + 0.18, z + 0.13, x + bw / 2, top + bh - 0.3, z + 0.2));
      for (const [a0, a1, b0, b1] of [[-bw / 2, bw / 2, 0.18, 0.24], [-bw / 2, bw / 2, bh - 0.36, bh - 0.3]]) bag.add('gilt_bronze', box(x + a0, top + b0, z + 0.2, x + a1, top + b1, z + 0.23));
      for (const s of [-1, 1]) bag.add('gilt_bronze', box(x + s * bw / 2 - (s > 0 ? 0.06 : 0), top + 0.18, z + 0.2, x + s * bw / 2 + (s > 0 ? 0 : 0.06), top + bh - 0.3, z + 0.23));
      for (let q = -1; q <= 1; q++) bag.add('gilt_bronze', box(x + q * bw * 0.28 - 0.17, top + 0.38, z + 0.2, x + q * bw * 0.28 + 0.17, top + bh - 0.5, z + 0.22));
      if (p.lanterns) for (const s of [-1, 1]) {   // two great red lanterns hung from the architrave beside the door
        const lx = x + s * (hd + 0.2), lz = d / 2 + 0.8;
        bag.add('iron', box(lx - 0.01, F + H - 0.9, lz - 0.01, lx + 0.01, top - 0.4, lz + 0.01));
        bag.add('lamp_paper', lathe([[0.001, 0], [0.22, 0.05], [0.34, 0.3], [0.36, 0.45], [0.3, 0.7], [0.16, 0.8], [0.001, 0.82]], 12, null, lx, F + H - 1.7, lz));
        bag.add('lacquer_red', box(lx - 0.2, F + H - 0.95, lz - 0.2, lx + 0.2, F + H - 0.9, lz + 0.2)); bag.add('lacquer_red', box(lx - 0.16, F + H - 1.75, lz - 0.16, lx + 0.16, F + H - 1.7, lz + 0.16));
      }
    }
  }
  // ── the ceiling of a walkable room
  if (interior) bag.add('ceiling_grid', box(-w / 2 + 0.18, top + 0.02, -d / 2 + 0.18, w / 2 - 0.18, top + 0.1, d / 2 - 0.18));
  // ── the roof, the owl tails drawn here, the round tile ends along the eave
  const rise = Math.max(1.2, (d / 2 + over) * (p.pitch ?? 0.27)), B = d / 2 + over, A = w / 2 + over, t0 = over / B;
  const yE = top + bh + 0.24 - rise * Math.pow(t0, 1.35), Ar = gable ? A : Math.max(A, B);
  const ridge = pal.ridge || 'roof_ridge';
  tangRoof(bag, { cx: 0, cz: 0, A: Ar, B, y: yE, rise, gable, tile: pal.roof || 'tile_grey', ridge, chi: p.chi, chiwei: false });
  const Yr = yE + rise, Lr = gable ? Ar : Math.max(0.2, Ar - B), chi = p.chi ?? Math.min(1.5, 0.7 + rise * 0.15);
  for (const s of [-1, 1]) owlTail(bag, ridge, s * (gable ? Ar - 0.4 : Lr + 0.1), s, Yr + 0.12, chi * 1.15, 0.36 + chi * 0.07);
  if (p.wadang) {
    const tm = 'tile_dark', ds = 0.5;
    for (let x = -Ar + 0.3; x < Ar - 0.2; x += ds) for (const sz of [-1, 1]) bag.add(tm, box(x - 0.09, yE - 0.22, sz > 0 ? B : B * -1 - 0.05, x + 0.09, yE - 0.03, sz > 0 ? B + 0.05 : -B));
    if (!gable) for (let z = -B + 0.3; z < B - 0.2; z += ds) for (const sx of [-1, 1]) bag.add(tm, box(sx > 0 ? Ar : -Ar - 0.05, yE - 0.22, z - 0.09, sx > 0 ? Ar + 0.05 : -Ar, yE - 0.03, z + 0.09));
  }
}

/** The element: the hall in its own frame turned to face `face` ('s', 'n', 'e' or 'w'). */
export function daciHall(el, ctx) {
  inFrame(ctx, el.c, YAW[el.face || 's'], (L) => buildDaciHall(L, el));
}
