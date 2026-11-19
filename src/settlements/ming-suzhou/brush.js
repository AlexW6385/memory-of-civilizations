// The brush: how a stroke of a character is drawn as a tapered ribbon, and raised from a board.
// A character is a list of strokes [kind, x0, y0, x1, y1, ...] on a 100-unit grid (y up, regular script
// proportions); each kind is a way the brush moves (brush-data.js lists the characters). A stroke becomes
// one or more ribbons: a centre line (straight, or bent through the tangent angles the kind gives it) and
// the width on either side of it at chosen places along it, in units of the character's own weight W (a
// dense character gets a thinner W, so that it stays open). The ribbon starts and ends the way a brush
// does: a press and a thin lift for the horizontal, a dewdrop or a needle for the vertical, a
// thick head and a hair tip for the falling-left, a thin start and a pressed foot for the falling-right, a
// teardrop for the dot, hooks that flick up and away.
import { fromTriangles } from '../../core/geom.js';

const D2R = Math.PI / 180, hyp = Math.hypot;

// ── centre lines ────────────────────────────────────────────────────────────────────────────────────
/** A polyline with its lengths; `smooth`: its bends are a sampled curve (normals blended), else its corners are sharp (mitred). */
function pathOf(pts, smooth = false) {
  const cum = [0], dir = [];
  for (let i = 0; i + 1 < pts.length; i++) {
    const dx = pts[i + 1][0] - pts[i][0], dy = pts[i + 1][1] - pts[i][1], d = hyp(dx, dy) || 1e-6;
    cum.push(cum[i] + d); dir.push([dx / d, dy / d]);
  }
  return { pts, cum, dir, L: cum[cum.length - 1], smooth };
}
/** The curve from A to B that leaves A at angle a0 and arrives at angle a1 (degrees; a quadratic through the tangents' meeting); straight if they do not meet. */
function bent(A, B, a0, a1, n = 9) {
  const d0 = [Math.cos(a0 * D2R), Math.sin(a0 * D2R)], d1 = [Math.cos(a1 * D2R), Math.sin(a1 * D2R)];
  const dx = B[0] - A[0], dy = B[1] - A[1], det = d0[0] * d1[1] - d0[1] * d1[0];
  let C = null;
  if (Math.abs(det) > 1e-3) {
    const a = (dx * d1[1] - dy * d1[0]) / det, b = (d0[0] * dy - d0[1] * dx) / det;
    if (a > 0 && b > 0) C = [A[0] + a * d0[0], A[1] + a * d0[1]];
  }
  if (!C) return [A, B];
  const out = [];
  for (let i = 0; i <= n; i++) { const t = i / n, u = 1 - t; out.push([u * u * A[0] + 2 * u * t * C[0] + t * t * B[0], u * u * A[1] + 2 * u * t * C[1] + t * t * B[1]]); }
  return out;
}
/** A smooth curve through points (Catmull-Rom), k samples per span. */
function through(pts, k = 5) {
  const out = [], n = pts.length, p = (i) => pts[Math.max(0, Math.min(n - 1, i))];
  for (let i = 0; i + 1 < n; i++) {
    const a = p(i - 1), b = p(i), c = p(i + 1), d = p(i + 2);
    for (let j = 0; j < k; j++) {
      const t = j / k, t2 = t * t, t3 = t2 * t, f = (u, v, w, z) => 0.5 * (2 * v + (-u + w) * t + (2 * u - 5 * v + 4 * w - z) * t2 + (-u + 3 * v - 3 * w + z) * t3);
      out.push([f(a[0], b[0], c[0], d[0]), f(a[1], b[1], c[1], d[1])]);
    }
  }
  out.push(pts[n - 1]);
  return out;
}
const unit = (A, B) => { const l = hyp(B[0] - A[0], B[1] - A[1]) || 1; return [(B[0] - A[0]) / l, (B[1] - A[1]) / l]; };
const ang = (A, B) => Math.atan2(B[1] - A[1], B[0] - A[0]) / D2R;

/** The frame at arclength s (beyond the ends: continued straight): point and the offset vector for a unit half-width on the left. */
function frame(P, s) {
  const { pts, cum, dir, L, smooth } = P, n = pts.length, nrm = (d) => [-d[1], d[0]];
  if (s <= 0) { const d = dir[0]; return { x: pts[0][0] + d[0] * s, y: pts[0][1] + d[1] * s, nx: -d[1], ny: d[0] }; }
  if (s >= L) { const d = dir[n - 2]; return { x: pts[n - 1][0] + d[0] * (s - L), y: pts[n - 1][1] + d[1] * (s - L), nx: -d[1], ny: d[0] }; }
  let i = 0; while (cum[i + 1] < s - 1e-9) i++;
  const vertexN = (j) => {                     // the mitred normal at vertex j (0 < j < n-1)
    const a = nrm(dir[j - 1]), b = nrm(dir[j]), den = Math.max(0.45, 1 + a[0] * b[0] + a[1] * b[1]);
    return [(a[0] + b[0]) / den, (a[1] + b[1]) / den];
  };
  const u = (s - cum[i]) / (cum[i + 1] - cum[i]), x = pts[i][0] + (pts[i + 1][0] - pts[i][0]) * u, y = pts[i][1] + (pts[i + 1][1] - pts[i][1]) * u;
  if (!smooth) {
    if (Math.abs(s - cum[i + 1]) < 1e-6 && i + 1 < n - 1) { const m = vertexN(i + 1); return { x, y, nx: m[0], ny: m[1] }; }
    if (Math.abs(s - cum[i]) < 1e-6 && i > 0) { const m = vertexN(i); return { x, y, nx: m[0], ny: m[1] }; }
    const d = dir[i]; return { x, y, nx: -d[1], ny: d[0] };
  }
  const a = i === 0 ? nrm(dir[0]) : vertexN(i), b = i + 1 === n - 1 ? nrm(dir[n - 2]) : vertexN(i + 1);
  let nx = a[0] + (b[0] - a[0]) * u, ny = a[1] + (b[1] - a[1]) * u; const l = hyp(nx, ny) || 1;
  return { x, y, nx: nx / l, ny: ny / l };
}

// ── the profiles: width on the left and the right of the centre line, by place along the stroke ───────
// A place is a fraction of the length (a number), or 's0.6' (0.6 W from the start) or 'e0.6' (0.6 W before the end).
// [place, left, right]: distances from the centre line in W; the line runs the way the brush goes and "left" is
// the left of that way (above, for a stroke going right; the side the thumb lies, for one going down).
const PROFILE = {
  // heng: a slanted press at the start, a thin body, a pad under the end
  h: [['s-0.12', 0.06, 0.06], ['s0', 0.36, 0.26], ['s0.45', 0.52, 0.58], ['s1.3', 0.34, 0.36], [0.5, 0.3, 0.32], ['e1.5', 0.31, 0.37], ['e0.75', 0.3, 0.74], ['e0.12', 0.22, 0.6], ['e-0.1', 0.05, 0.1]],
  // shu with a dewdrop end
  s: [['s-0.1', 0.08, 0.08], ['s0', 0.42, 0.34], ['s0.4', 0.56, 0.5], ['s1.5', 0.44, 0.44], [0.55, 0.4, 0.42], ['e1.3', 0.44, 0.48], ['e0.35', 0.4, 0.44], ['e-0.08', 0.12, 0.14]],
  // shu with a needle end
  x: [['s-0.1', 0.08, 0.08], ['s0', 0.42, 0.34], ['s0.4', 0.56, 0.5], ['s1.5', 0.46, 0.46], [0.6, 0.34, 0.36], [1, 0.0, 0.0]],
  // pie: thick head, a belly, a hair tip
  p: [['s-0.08', 0.08, 0.08], ['s0', 0.34, 0.3], ['s0.45', 0.52, 0.46], [0.3, 0.5, 0.46], [0.6, 0.34, 0.32], [0.84, 0.18, 0.16], [1, 0.0, 0.0]],
  // na: a thin start swelling to the pressed foot, a flat tail
  n: [['s-0.05', 0.0, 0.0], ['s0.6', 0.14, 0.12], [0.36, 0.3, 0.3], [0.62, 0.5, 0.52], [0.78, 0.7, 0.78], [0.9, 0.5, 0.52], [1, 0.0, 0.0]],
  // dian: a teardrop, round head
  d: [['s-0.4', 0.14, 0.14], ['s0', 0.44, 0.44], [0.28, 0.68, 0.68], [0.62, 0.5, 0.5], [1, 0.0, 0.0]],
  // ti: a short rising stroke, thick start
  t: [['s-0.1', 0.06, 0.06], ['s0', 0.34, 0.32], [0.14, 0.5, 0.46], [0.6, 0.3, 0.28], [1, 0.0, 0.0]],
  // the hook that flicks away from a corner
  k: [[0, 0.46, 0.5], [0.4, 0.34, 0.36], [0.78, 0.18, 0.18], [1, 0.0, 0.0]],
  // the bottom hook of the heart, a long curve rising to a tip
  w: [['s-0.05', 0.06, 0.06], ['s0', 0.34, 0.34], [0.2, 0.5, 0.52], [0.55, 0.52, 0.52], [0.82, 0.34, 0.34], [1, 0.0, 0.0]],
  // the sweep under a walking radical: thin where it leaves the bend, fullest in the long flat run, a pad at the end
  z: [['s-0.05', 0.04, 0.04], ['s0', 0.14, 0.14], [0.18, 0.4, 0.4], [0.5, 0.52, 0.52], [0.86, 0.5, 0.5], ['e0.5', 0.42, 0.62], ['e0.1', 0.3, 0.5], ['e-0.1', 0.06, 0.08]],
  // a plain level stroke of even weight (rims, frames)
  e: [[0, 0.3, 0.3], [1, 0.3, 0.3]],
};
const place = (p, L, Wg) => {
  if (typeof p === 'number') return p * L;
  const k = parseFloat(p.slice(1)) * Wg;
  return p[0] === 's' ? k : L - k;
};
/** A ribbon: its centre line P, its profile rows [t (arclength), left, right] in grid units. */
function ribbon(P, prof, Wg, mul = 1) {
  const rows = [];
  let last = -1e9;
  for (const [p, l, r] of prof) {
    let s = place(p, P.L, Wg);
    if (typeof p === 'string' && p[0] === 'e') s = Math.max(s, -1e9);
    rows.push([s, l * Wg * mul, r * Wg * mul]);
  }
  // keep the rows in order (a short stroke squeezes the press and the pad together)
  const out = [];
  for (const row of rows) { if (row[0] < last + 0.02) { row[0] = last + 0.02; } last = row[0]; out.push(row); }
  if (P.smooth) {                                           // a curve gets a row at least every 9 units (a polygon of the few rows would show its corners)
    const dense = [out[0]];
    for (let i = 1; i < out.length; i++) {
      const a = out[i - 1], b = out[i], k = Math.floor((b[0] - a[0]) / 9);
      for (let j = 1; j <= k; j++) { const u = j / (k + 1); dense.push([a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u]); }
      dense.push(b);
    }
    return { P, rows: dense };
  }
  return { P, rows: out };
}
/** The row positions of a stroke on both levels: [{ cx, cy, nx, ny, hl, hr }]. */
function sections(rb) {
  return rb.rows.map(([s, hl, hr]) => { const f = frame(rb.P, s); return { cx: f.x, cy: f.y, nx: f.nx, ny: f.ny, hl, hr }; });
}

// ── the stroke kinds ─────────────────────────────────────────────────────────────────────────────────
/** A stroke [kind, ...numbers] as its ribbons, for a character of weight W (a fraction of the cell). */
function ribbonsOf(st, W) {
  const [kind, ...a] = st, Wg = W * 100, R = [];
  const seg = (A, B, prof, mul = 1) => R.push(ribbon(pathOf([A, B]), prof, Wg, mul));
  const curve = (pts, prof, mul = 1) => R.push(ribbon(pathOf(pts, true), prof, Wg, mul));
  const A = [a[0], a[1]], B = [a[2], a[3]];
  const flick = (E, len) => curve(bent([E[0] + 0.1 * Wg, E[1] - 0.2 * Wg], [E[0] - len, E[1] + len * 0.36], 178, 128, 4), PROFILE.k);
  switch (kind) {
    case 'h': seg(A, B, PROFILE.h); break;
    case 's': seg(A, B, PROFILE.s); break;
    case 'x': seg(A, B, PROFILE.x); break;
    case 'p': { const th = ang(A, B), bend = a[4] ?? 1; curve(bent(A, B, a[5] ?? th + 24 * bend, a[6] ?? th - 24 * bend), PROFILE.p); break; }
    case 'n': { const th = ang(A, B), bend = a[4] ?? 1; curve(bent(A, B, a[5] ?? th - 22 * bend, a[6] ?? th + 26 * bend), PROFILE.n); break; }
    case 'd': { const th = ang(A, B), b = a[4] ?? 0; curve(bent(A, B, th - 14 * b, th + 14 * b, 5), PROFILE.d); break; }
    case 't': seg(A, B, PROFILE.t); break;
    case 'e': seg(A, B, PROFILE.e); break;
    case 'sg': {                                           // shu-gou: a stem ending in a pivot, a hook flicking up and away to the left
      const hl = a[4] ?? 9, stem = [['s-0.1', 0.08, 0.08], ['s0', 0.42, 0.34], ['s0.4', 0.56, 0.5], ['s1.5', 0.44, 0.44], [0.55, 0.4, 0.42], ['e0.5', 0.42, 0.46], ['e0', 0.48, 0.52]];
      seg(A, B, stem);
      flick(B, hl);
      break;
    }
    case 'hz': case 'hzg': {                               // heng-zhe (-gou): across, then down from a shoulder; the -gou ends in a hook
      const C = [a[2], a[3]], E = [a[4], a[5]], d1 = unit(A, C), d2 = unit(C, E);
      const C1 = [C[0] + d1[0] * 0.5 * Wg, C[1] + d1[1] * 0.5 * Wg];
      seg(A, C1, [['s-0.12', 0.06, 0.06], ['s0', 0.36, 0.26], ['s0.45', 0.52, 0.58], ['s1.3', 0.3, 0.32], [0.5, 0.26, 0.28], ['e0.5', 0.3, 0.32], ['e0', 0.32, 0.34]]);
      const C2 = [C[0] - d2[0] * 0.3 * Wg, C[1] - d2[1] * 0.3 * Wg];
      if (kind === 'hz') seg(C2, E, [['s0', 0.46, 0.46], ['s0.6', 0.5, 0.5], ['s1.6', 0.44, 0.46], [0.6, 0.4, 0.42], ['e1.3', 0.44, 0.48], ['e0.35', 0.4, 0.44], ['e-0.08', 0.12, 0.14]]);
      else {
        seg(C2, E, [['s0', 0.46, 0.46], ['s0.6', 0.5, 0.5], ['s1.6', 0.44, 0.46], [0.6, 0.4, 0.42], ['e0.5', 0.42, 0.46], ['e0', 0.48, 0.52]]);
        flick(E, a[6] ?? 8);
      }
      break;
    }
    case 'sz': {                                           // shu-zhe: down, then across from a shoulder, ending in a pad
      const C = [a[2], a[3]], E = [a[4], a[5]], d1 = unit(A, C), d2 = unit(C, E);
      seg(A, [C[0] + d1[0] * 0.5 * Wg, C[1] + d1[1] * 0.5 * Wg], [['s-0.1', 0.08, 0.08], ['s0', 0.42, 0.34], ['s0.4', 0.56, 0.5], ['s1.5', 0.44, 0.44], [0.55, 0.4, 0.42], ['e0.5', 0.44, 0.48], ['e0', 0.46, 0.5]]);
      seg([C[0] - d2[0] * 0.42 * Wg, C[1] - d2[1] * 0.42 * Wg], E, [['s0', 0.32, 0.32], ['s1.5', 0.3, 0.32], [0.6, 0.26, 0.28], ['e1.5', 0.27, 0.33], ['e0.75', 0.3, 0.74], ['e0.12', 0.22, 0.6], ['e-0.1', 0.05, 0.1]]);
      break;
    }
    case 'hg': {                                           // heng-gou: across, a small hook down at the end
      seg(A, B, PROFILE.h);
      const hl = a[4] ?? 4;
      curve(bent([B[0] - 0.1 * Wg, B[1] + 0.2 * Wg], [B[0] - hl * 0.45, B[1] - hl], -95, -140, 4), PROFILE.k);
      break;
    }
    case 'wg': {                                           // wo-gou: through the points, the last the tip of the hook
      const pts = through(a.reduce((o, v, i) => (i % 2 ? (o[o.length - 1].push(v), o) : (o.push([v]), o)), []), 4);
      curve(pts, PROFILE.w);
      break;
    }
    case 'hp': {                                           // heng-pie: across, then falling left
      const C = [a[2], a[3]], E = [a[4], a[5]];
      seg(A, C, [['s-0.12', 0.06, 0.06], ['s0', 0.36, 0.26], ['s0.45', 0.52, 0.58], ['s1.3', 0.3, 0.32], ['e0.4', 0.28, 0.3], ['e-0.1', 0.4, 0.4]]);
      const th = ang(C, E); curve(bent([C[0] + 0.1 * Wg, C[1]], E, th + 12, th - 12), PROFILE.p);
      break;
    }
    case 'z': {                                            // a sweep through points (the run under a walking radical)
      const pts = through(a.reduce((o, v, i) => (i % 2 ? (o[o.length - 1].push(v), o) : (o.push([v]), o)), []), 5);
      curve(pts, PROFILE.z);
      break;
    }
    case 'c': {                                            // a free curve of even weight through points
      const pts = through(a.reduce((o, v, i) => (i % 2 ? (o[o.length - 1].push(v), o) : (o.push([v]), o)), []), 4);
      curve(pts, PROFILE.e);
      break;
    }
    default: throw new Error('brush: stroke kind ' + kind);
  }
  return R;
}

/** The weight of a character: thinner as the ink adds up (so that 20 strokes stay open). */
export function weightOf(strokes, thick = 1) {
  let L = 0;
  for (const [kind, ...v] of strokes) {
    const n = ({ hz: 6, hzg: 6, sz: 6, hp: 6 })[kind] ?? (kind === 'wg' || kind === 'z' || kind === 'c' ? v.length : 4);
    for (let i = 2; i + 1 < n; i += 2) L += hyp(v[i] - v[i - 2], v[i + 1] - v[i - 1]);
  }
  return Math.max(0.036, Math.min(0.066, 0.155 / Math.sqrt(L / 100 + 1e-3))) * thick;
}

// ── outlines and relief ──────────────────────────────────────────────────────────────────────────────
/** The outline of a ribbon's rows as a closed polygon [[x, y]…] (right edge forward, left edge back), `k` scaling the half-widths. */
function outline(sec, k = 1) {
  const R = [], L = [];
  for (const s of sec) { R.push([s.cx - s.nx * s.hr * k, s.cy - s.ny * s.hr * k]); L.push([s.cx + s.nx * s.hl * k, s.cy + s.ny * s.hl * k]); }
  return R.concat(L.reverse());
}
/** The 2D outlines of a character (grid units), for checking against a typeface. */
export function outlines(strokes, thick = 1) {
  const W = weightOf(strokes, thick), out = [];
  strokes.forEach((st, i) => { for (const rb of ribbonsOf(st, W)) out.push({ stroke: i, kind: st[0], poly: outline(sections(rb)) }); });
  return out;
}

/**
 * A character as relief: triangles pushed to `out` (flat xyz), the cell `size` m across centred at (cx, cy),
 * its foot at z0 and its face at z1 (z0 = z1 gives a flat form, front faces only); the walls slope in as a
 * bevel (the top at `top` of the foot's width). `rows`: 'full' every section, 'lite' fewer (the far form).
 */
export function relief(out, strokes, cx, cy, size, z0, z1, { thick = 1, top = 0.55, flat = false } = {}) {
  const W = weightOf(strokes, thick), k = size / 100, X = (x) => cx + (x - 50) * k, Y = (y) => cy + (y - 50) * k;
  for (const st of strokes) for (const rb of ribbonsOf(st, W)) {
    const sec = sections(rb), m = sec.length, hi = flat ? z0 : z1;
    const B = [], T = [];                                    // the outline loop at the foot and at the face
    for (const q of [[1, B], [flat ? 1 : top, T]]) {
      const kk = q[0], arr = q[1], R = [], L = [];
      for (const s of sec) { R.push([X(s.cx - s.nx * s.hr * kk), Y(s.cy - s.ny * s.hr * kk)]); L.push([X(s.cx + s.nx * s.hl * kk), Y(s.cy + s.ny * s.hl * kk)]); }
      arr.push(R, L);
    }
    const [BR, BL] = B, [TR, TL] = T, tri = (a, b, c, z) => { if (Math.abs((b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])) > 1e-12) out.push(a[0], a[1], z, b[0], b[1], z, c[0], c[1], z); };
    for (let i = 0; i + 1 < m; i++) { tri(TR[i], TR[i + 1], TL[i + 1], hi); tri(TR[i], TL[i + 1], TL[i], hi); }
    if (flat) continue;
    // the walls, round the loop R0…R(m-1), L(m-1)…L0 (counter-clockwise), from the foot (z0) up to the face (z1)
    const loopB = BR.concat(BL.slice().reverse()), loopT = TR.concat(TL.slice().reverse()), n = loopB.length;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n, p0 = loopB[i], q0 = loopB[j], p1 = loopT[i], q1 = loopT[j];
      if (Math.abs(p0[0] - q0[0]) + Math.abs(p0[1] - q0[1]) + Math.abs(p1[0] - q1[0]) + Math.abs(p1[1] - q1[1]) < 1e-9) continue;
      out.push(p0[0], p0[1], z0, q0[0], q0[1], z0, q1[0], q1[1], z1, p0[0], p0[1], z0, q1[0], q1[1], z1, p1[0], p1[1], z1);
    }
  }
}
/** relief as a geometry. */
export const reliefGeometry = (strokes, cx, cy, size, z0, z1, o) => { const out = []; relief(out, strokes, cx, cy, size, z0, z1, o); return fromTriangles(out); };
