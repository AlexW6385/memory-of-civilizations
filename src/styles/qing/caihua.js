// Hexi caihua (和玺彩画), the painting of the palace's beams (docs/settlements/qing-beijing.md §12):
// on every architrave between two columns, the bay is cut into three — the central panel (fangxin)
// and, either side, the zhaotou with the band (gutou) at the column; the panel's ends and the
// zhaotou are divided by the zigzag "M" lines of the hexi kind; gold dragons on the blue fields,
// gold dragons (the jinlong hexi of the greatest halls) or phoenixes (the longfeng hexi) on the
// green; blue and green alternating bay by bay and beam over beam; all the lines and figures gilt.
// Laid as films a few millimetres off the beam's face: the ground, the fields over it, the gilt
// over them (nothing coplanar).

import { fromTriangles } from '../../core/geom.js';

const BLUE = 'paint_blue', GREEN = 'paint_caihua', GILT = 'gilt_bronze';

/**
 * A painter for one face: A the face's start point [x, y, z] (its foot at the beam's underside),
 * t the unit direction along the beam, n the outward normal (both horizontal), off the face's
 * distance from A's line. put(u, v, d) is the point at u along, v up, d off the face.
 */
function painter(A, t, n, off) {
  const put = (u, v, d) => [A[0] + t[0] * u + n[0] * (off + d), A[1] + v, A[2] + t[2] * u + n[2] * (off + d)];
  // which way round the triangles go so that they face n
  const flip = (t[0] * n[2] - t[2] * n[0]) < 0;
  return { put, flip };
}
function tri(out, P, a, b, c) { out.push(...a, ...(P.flip ? c : b), ...(P.flip ? b : c)); }
/** A convex polygon [[u, v], …] laid d off the face. */
function poly(out, P, pts, d) {
  const q = pts.map(([u, v]) => P.put(u, v, d));
  for (let i = 1; i + 1 < q.length; i++) tri(out, P, q[0], q[i], q[i + 1]);
}
/** A line of width w along the points [[u, v], …] (mitred), d off the face. */
function line(out, P, pts, w, d, taper = null) {
  const N = pts.length, side = [];
  for (let i = 0; i < N; i++) {
    const p = pts[Math.max(0, i - 1)], q = pts[Math.min(N - 1, i + 1)];
    let du = q[0] - p[0], dv = q[1] - p[1]; const l = Math.hypot(du, dv) || 1; du /= l; dv /= l;
    const ww = (taper ? taper(i / (N - 1)) : 1) * w / 2;
    side.push([[pts[i][0] - dv * ww, pts[i][1] + du * ww], [pts[i][0] + dv * ww, pts[i][1] - du * ww]]);
  }
  for (let i = 0; i + 1 < N; i++) {
    const a = P.put(...side[i][0], d), b = P.put(...side[i][1], d), c = P.put(...side[i + 1][1], d), e = P.put(...side[i + 1][0], d);
    tri(out, P, b, c, e); tri(out, P, b, e, a);
  }
}
const ring = (cu, cv, r, n = 10, ry = r) => Array.from({ length: n }, (_, k) => { const a = k / n * Math.PI * 2; return [cu + Math.cos(a) * r, cv + Math.sin(a) * ry]; });

/**
 * A gold dragon striding along the panel from u0 to u1 (head at u1 when dir > 0) in a band of
 * height h about v = vc: the body a ribbon in one and a half waves, thick at the shoulders, thin at
 * the tail; four legs with spread claws; the head with its horns and the open jaw; the flaming pearl
 * before it; a few flames along the back.
 */
function dragon(out, P, u0, u1, vc, h, dir, d) {
  const L = u1 - u0, N = 12, body = [];
  const at = (s) => { const u = dir > 0 ? u0 + L * 0.06 + L * 0.7 * s : u1 - L * 0.06 - L * 0.7 * s; return [u, vc + h * 0.17 * Math.sin(Math.PI * 3 * s + 0.6)]; };
  for (let i = 0; i <= N; i++) body.push(at(i / N));
  line(out, P, body, h * 0.3, d, (s) => 0.25 + 0.75 * Math.min(1, s * 1.6) * (1 - 0.25 * s));
  // the legs: at the shoulders and the hips, one up and one down each
  for (const [s, up] of [[0.82, 1], [0.7, -1], [0.38, 1], [0.27, -1]]) {
    const [u, v] = at(s), ku = u - dir * h * 0.08, kv = v + up * h * 0.2, fu = ku + dir * h * 0.1, fv = kv + up * h * 0.06;
    line(out, P, [[u, v], [ku, kv], [fu, fv]], h * 0.1, d + 0.001);
  }
  // the head at the front: the snout, the jaw open, the horns swept back, the mane
  const [hu, hv] = at(1), f = (du, dv) => [hu + dir * du * 1.4, hv + dv * 1.3];
  poly(out, P, [f(-h * 0.08, -h * 0.1), f(h * 0.1, -h * 0.08), f(h * 0.2, -h * 0.02), f(h * 0.18, h * 0.06), f(h * 0.02, h * 0.12), f(-h * 0.1, h * 0.06)].map((p) => (dir > 0 ? p : p)), d + 0.001);
  poly(out, P, [f(h * 0.08, -h * 0.1), f(h * 0.24, -h * 0.17), f(h * 0.12, -h * 0.03)], d + 0.001);
  for (const k of [0, 1]) line(out, P, [f(-h * 0.02, h * 0.1), f(-h * 0.12 - k * 0.04 * h, h * (0.22 + k * 0.06)), f(-h * 0.24, h * (0.25 + k * 0.05))], h * 0.035, d + 0.002);
  // the pearl before it, with its flames
  const pu = hu + dir * h * 0.55, pv = vc + h * 0.04;
  poly(out, P, ring(pu, pv, h * 0.08, 8), d);
  for (const a of [0.5, 1.6, 2.7]) line(out, P, [[pu + Math.cos(a) * h * 0.09, pv + Math.sin(a) * h * 0.09], [pu + Math.cos(a) * h * 0.17, pv + Math.sin(a) * h * 0.17 + h * 0.03]], h * 0.03, d, (s) => 1 - s * 0.8);
  // flames along the spine
  for (const s of [0.15, 0.5, 0.62]) { const [u, v] = at(s); line(out, P, [[u, v + h * 0.06], [u - dir * h * 0.08, v + h * 0.16]], h * 0.035, d + 0.001, (q) => 1 - q * 0.8); }
}
/** A phoenix in flight along the panel: the body, the spread wings, the long tail plumes trailing behind. */
function phoenix(out, P, u0, u1, vc, h, dir, d) {
  const L = u1 - u0, c = dir > 0 ? u0 + L * 0.62 : u1 - L * 0.62, f = (du, dv) => [c + dir * du, vc + dv];
  line(out, P, [f(-h * 0.25, -h * 0.02), f(0, h * 0.02), f(h * 0.2, h * 0.08), f(h * 0.3, h * 0.16)], h * 0.12, d, (s) => 0.6 + 0.4 * Math.sin(s * Math.PI));
  poly(out, P, [f(h * 0.28, h * 0.12), f(h * 0.4, h * 0.14), f(h * 0.33, h * 0.2)], d + 0.001);   // the head and beak
  line(out, P, [f(h * 0.3, h * 0.18), f(h * 0.22, h * 0.3)], h * 0.03, d + 0.001);                 // the crest
  for (const up of [1, -1]) poly(out, P, [f(-h * 0.05, up * h * 0.02), f(h * 0.1, up * h * 0.04), f(-h * 0.1, up * h * 0.36), f(-h * 0.22, up * h * 0.3)], d + 0.001);
  for (const [k, a] of [[0, 0.1], [1, -0.08], [2, 0.24]]) {
    const pts = []; for (let i = 0; i <= 8; i++) { const s = i / 8; pts.push(f(-h * 0.25 - s * L * 0.45, -h * 0.02 + Math.sin(s * Math.PI * 1.4 + k) * h * 0.14 + a * h * s)); }
    line(out, P, pts, h * 0.06, d + 0.0005 * (k + 1), (s) => 1 - s * 0.7);
  }
}
/** A dragon coiled in a roundel (the zhaotou's box): a spiral of a turn and a half, its head at the middle. */
function coiled(out, P, cu, cv, r, d) {
  const pts = []; for (let i = 0; i <= 10; i++) { const s = i / 10, a = s * Math.PI * 3, rr = r * (0.85 - 0.6 * s); pts.push([cu + Math.cos(a) * rr, cv + Math.sin(a) * rr]); }
  line(out, P, pts, r * 0.28, d, (s) => 0.4 + 0.6 * s);
  poly(out, P, ring(cu, cv, r * 0.22, 6), d + 0.001);
}

/**
 * One bay of an architrave: the face from A along t for L metres, h high, facing n at `off` from
 * A's line. blue: whether the zhaotou's ground (and the central panel's field) is blue — the panel's
 * field takes the other colour; kind: 'jinlong' (dragons in every panel) or 'longfeng' (dragons on
 * blue, phoenixes on green). Adds triangles to T = { [mat]: [] }.
 */
export function hexiBay(T, A, t, n, off, L, h, blue, kind = 'jinlong', dir = 1) {
  if (L < 0.9 || h < 0.25) return;
  const P = painter(A, t, n, off), add = (m) => (T[m] ||= []);
  const g1 = blue ? BLUE : GREEN, g2 = blue ? GREEN : BLUE;
  const gb = Math.min(0.3, Math.max(0.1, L * 0.055)), d0 = 0.003, d1 = 0.007, d2 = 0.016;
  // the ground (zhaotou) and the gutou bands at the columns (the other colour, a gilt line each side)
  poly(add(g1), P, [[0, 0], [L, 0], [L, h], [0, h]], d0);
  for (const u of [0, L - gb]) poly(add(g2), P, [[u, 0], [u + gb, 0], [u + gb, h], [u, h]], d1);
  for (const u of [gb, L - gb]) poly(add(GILT), P, [[u - 0.012, 0.01], [u + 0.012, 0.01], [u + 0.012, h - 0.01], [u - 0.012, h - 0.01]], d2);
  // gilt borders along the top and the foot of the whole bay
  for (const v of [0.02, h - 0.02]) line(add(GILT), P, [[0.01, v], [L - 0.01, v]], 0.018, d2);
  // the central panel: a third of the bay, its ends pointed, framed in gold
  const m = L / 2, half = L / 6, p = Math.min(half * 0.6, h * 0.35), v0 = h * 0.14, v1 = h * 0.86;
  const fx = [[m - half, v0], [m + half, v0], [m + half + p, h / 2], [m + half, v1], [m - half, v1], [m - half - p, h / 2]];
  poly(add(g2), P, fx, d1);
  line(add(GILT), P, [...fx, fx[0], fx[1]], 0.026, d2);
  // the "M" lines: two more chevrons outside each pointed end, running from the beam's top to its foot
  for (const s of [-1, 1]) for (const k of [1, 2]) {
    const tip = m + s * (half + p + k * 0.11 * Math.max(1, h / 0.5)), back = tip - s * (p + 0.04);
    line(add(GILT), P, [[back, h - 0.03], [tip, h / 2], [back, 0.03]], 0.022, d2);
  }
  // the zhaotou's figures: in a long bay a coiled dragon in its roundel between the gutou and the M lines
  for (const s of [-1, 1]) {
    const inner = m + s * (half + p + 0.22 * Math.max(1, h / 0.5) + 0.06), outer = s < 0 ? gb : L - gb, span = Math.abs(inner - outer);
    if (span < h * 0.75) continue;
    const cu = (inner + outer) / 2, r = Math.min(span * 0.4, h * 0.36);
    const rg = ring(cu, h / 2, r * 1.15, 10);
    poly(add(g2), P, rg, d1);
    line(add(GILT), P, [...rg, rg[0], rg[1]], 0.02, d2);
    coiled(add(GILT), P, cu, h / 2, r * 0.85, d2);
  }
  // the panel's figure: a dragon striding to the pearl on blue; on green a dragon too (jinlong) or a phoenix (longfeng)
  const fu0 = m - half - p * 0.4, fu1 = m + half + p * 0.4, fh = v1 - v0;
  if (g2 === GREEN && kind === 'longfeng') phoenix(add(GILT), P, fu0, fu1, h / 2, fh, dir, d2);
  else dragon(add(GILT), P, fu0, fu1, h / 2, fh, dir, d2);
}

/**
 * The painting on a run of architrave from a to b ([x, z]) between column centres `ticks` (distances
 * along it), the beam's underside at y, h high, its face `off` out from the line on the side of
 * `n`; columns of radius r cut the bays. first: whether the first bay is blue (alternating after).
 */
export function hexiRun(T, a, b, ticks, y, h, n, off, r, first = true, kind = 'jinlong') {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]), t = [(b[0] - a[0]) / L, 0, (b[1] - a[1]) / L];
  const cut = r > off ? Math.sqrt(r * r - off * off) : 0;
  for (let i = 0; i + 1 < ticks.length; i++) {
    const u0 = ticks[i] + cut + 0.01, u1 = ticks[i + 1] - cut - 0.01;
    const A = [a[0] + t[0] * u0, y, a[1] + t[2] * u0];
    // each bay's films added on their own, at the origin and then moved: the bays repeated along a
    // face are then copies of one shape (drawn as instances)
    const B = {};
    hexiBay(B, [0, 0, 0], t, n, off, u1 - u0, h, (i % 2 === 0) === first, kind, i < (ticks.length - 1) / 2 ? 1 : -1);
    for (const [m, tris] of Object.entries(B)) { if (!tris.length) continue; const g = fromTriangles(tris); g.translate(A[0], A[1], A[2]); (T[m] ||= []).push(g); }
  }
}

// ── the bracket sets (dougong) under the eaves of the palace halls ──
// A row of sets on the plate over the frieze beam, at every column and, between the columns, about
// one to a metre (the Qing halls crowd them: the Hall of Supreme Harmony's middle bay carries eight):
// a great bearing block, then in each tier a cross arm along the wall and a tongue stepping out
// toward the eave, small blocks on the arms' ends and the tongues' tips; the outer purlin over the
// last tips; between the sets the boards (gongdian ban), red. The timbers painted green, the blocks
// blue, as the hexi programme has them [inferred: the colours by alternation from photographs].
// Each set is one shape per side (instanced).
import { box as _box, fromTriangles as _fromTriangles } from '../../core/geom.js';
import { beamTris as _beam } from '../ming/index.js';

const AH = 0.15, AW = 0.055;
export const dougongShape = (o) => setShape(o, [0, 1]);
export const dougongHeight = (o = {}) => 0.3 + (o.tiers ?? 3) * AH + 0.16 + 0.12;
const SETS = new Map();
/** One set's triangles by material, its tongue pointing along n ([nx, nz]), its foot at y = 0, its centre at the origin. */
function setShape(o, n) {
  const key = `${o.tiers}|${o.step}|${n}`;
  if (SETS.has(key)) return SETS.get(key);
  const t = [-n[1], n[0]], P = (s, d) => [t[0] * s + n[0] * d, t[1] * s + n[1] * d];
  const G = [], B = [], tiers = o.tiers ?? 3, step = o.step ?? 0.24;
  const bx = (arr, s0, d0, s1, d1, y0, y1) => { const p = P(s0, d0), q = P(s1, d1); const g = _box(Math.min(p[0], q[0]), y0, Math.min(p[1], q[1]), Math.max(p[0], q[0]), y1, Math.max(p[1], q[1])); const A = g.attributes.position.array, I = g.index?.array; if (I) for (const i of I) arr.push(A[i * 3], A[i * 3 + 1], A[i * 3 + 2]); else arr.push(...A); };
  bx(B, -0.15, -0.15, 0.15, 0.15, 0, 0.18);                                      // the bearing block (zuodou)
  for (let k = 0; k < tiers; k++) {
    const y = 0.18 + k * AH, lat = 0.3 + k * 0.12, proj = (k + 1) * step;
    _beam(G, [...P(-lat, 0).slice(0, 1), y, P(-lat, 0)[1]], [P(lat, 0)[0], y, P(lat, 0)[1]], AW, AH - 0.04);       // the cross arm (gong)
    _beam(G, [P(0, -0.2)[0], y, P(0, -0.2)[1]], [P(0, proj)[0], y, P(0, proj)[1]], AW, AH - 0.04);                  // the tongue (qiao / ang)
    for (const s of [-lat, lat]) bx(B, s - 0.065, -0.065, s + 0.065, 0.065, y + AH - 0.04, y + AH);                // the small blocks (sheng)
    bx(B, -0.075, proj - 0.075, 0.075, proj + 0.075, y + AH - 0.04, y + AH);
  }
  const r = { gilt: null, G, B };
  SETS.set(key, r);
  return r;
}
/**
 * The sets along the four sides of rect, on the plate at yf (the frieze beam's top), posts =
 * [xs, zs] the column lines, soffit(d) the roof's underside d out from the wall line.
 */
export function dougong(bag, rect, [xs, zs], yf, o = {}, soffit = null) {
  const [x0, z0, x1, z1] = rect, tiers = o.tiers ?? 3, step = o.step ?? 0.24, yTop = yf + 0.12 + 0.18 + tiers * AH;
  const out = tiers * step + 0.08, G = [], R = [];
  const sides = [[[x0, z0], [x1, z0], xs.map((x) => x - x0), [0, -1]], [[x1, z1], [x0, z1], xs.map((x) => x1 - x).reverse(), [0, 1]], [[x0, z1], [x0, z0], zs.map((z) => z1 - z).reverse(), [-1, 0]], [[x1, z0], [x1, z1], zs.map((z) => z - z0), [1, 0]]];
  for (const [a, b, ps, n] of sides) {
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L;
    const P = (s, d) => [a[0] + ux * s + n[0] * d, a[1] + uz * s + n[1] * d];
    _beam(G, [P(-0.25, 0)[0], yf, P(-0.25, 0)[1]], [P(L + 0.25, 0)[0], yf, P(L + 0.25, 0)[1]], 0.16, 0.12);       // the plate (pingban fang)
    _beam(G, [P(-out, out)[0], yTop, P(-out, out)[1]], [P(L + out, out)[0], yTop, P(L + out, out)[1]], 0.08, 0.16);  // the outer purlin
    _beam(G, [P(-0.2, 0)[0], yTop, P(-0.2, 0)[1]], [P(L + 0.2, 0)[0], yTop, P(L + 0.2, 0)[1]], 0.08, 0.16);
    // the red boards between the sets, from the plate up to the roof's underside
    const yb = soffit ? soffit(0) + 0.06 : yTop + 0.3;
    _beam(R, [P(0, 0)[0], yf + 0.12, P(0, 0)[1]], [P(L, 0)[0], yf + 0.12, P(L, 0)[1]], 0.025, yb - yf - 0.12);
    const shape = setShape({ tiers, step }, n), at = [];
    for (let i = 0; i < ps.length; i++) { at.push(ps[i]); if (i + 1 < ps.length) { const sp = ps[i + 1] - ps[i], k = Math.max(1, Math.round(sp / (o.pitch ?? 1.0)) - 1); for (let j = 1; j <= k; j++) at.push(ps[i] + sp * j / (k + 1)); } }
    for (const s of at) {
      const p = P(s, 0), y = yf + 0.12;
      for (const [m, tris] of [['paint_caihua', shape.G], ['paint_blue', shape.B]]) { const g = _fromTriangles(tris); g.translate(p[0], y, p[1]); bag.add(m, g); }
    }
  }
  bag.add('paint_caihua', _fromTriangles(G));
  bag.add('lacquer_red', _fromTriangles(R));
}
