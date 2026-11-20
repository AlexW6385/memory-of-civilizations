// Mamluk Cairo by night (docs/settlements/mamluk-cairo.md §18.2): the light of the lamps and the lit rooms, readable at the low preset.
// The pattern is that of Suzhou's nightlight.js (copied and adapted, nothing imported from it): light ADDED over what is behind it, at night only, made
// of geometry in the engine's one additive material `halo` (palette.js, materials.js 'halo'): a glow round each flame (three crossed discs), a pool on
// the paving, a wash on the wall behind, the lamp-lit sheet in front of a mashrabiya's lattice. No light, no shadow, no collision.
// Everything is a function of the lamp's own place (a hash of x and z): no counters, no Math.random.
//
// Budget: the halos and the lamps' small bodies go into night plans in 48 m tiles that are shown only within 55 m of the viewer (`near`), batched by the
// viewer with every other near tile, so the one `halo` material is one draw wherever a lit tile is shown and none where none is: no lamp stands within
// 90 m of the arrival (the Rumayla has none), where the main draws are at the budget's edge.

import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';
import { STYLES } from '../../core/build.js';
import { box, lathe, rod } from '../../core/geom.js';
import { RADIUS, CITADEL, ROAD, SUQ, SUQ2, SUQ3, KHAN, tradeOf, height } from './layout.js';
import { pickHomes } from './homes.js';
import './house.js';

/** A number in [0, 1) from a position alone. */
export function hashAt(x, z, s = 0) {
  let h = (Math.round(x * 16) * 73856093) ^ (Math.round(z * 16) * 19349663) ^ Math.imul(s + 1, 83492791);
  h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
/** The share of the shop fronts whose lamp burns into the evening [inferred: the market closed at dusk, a few kept open]. */
export const SHOP_LIT = 0.4;
/** The share of the shop fronts' lattice windows with a lamp behind them [inferred]. */
export const WINDOW_LIT = 0.35;

const TAU = Math.PI * 2, MAT = 'halo';
/** Triangles (position and a normal per corner) of the halo material (the normal's y is the brightness, 1 at a disc's middle, 0 at its rim). */
export class Halo {
  constructor() { this.pos = []; this.nor = []; }
  tri(p0, n0, p1, n1, p2, n2) { this.pos.push(...p0, ...p1, ...p2); this.nor.push(...n0, ...n1, ...n2); }
  disc(c, U, V, su, sv, nh = null, segs = 8, F = [1, 0.42, 0], R = [0, 0.5, 1]) {
    const at = (r, k) => { const a = k / segs * TAU, u = Math.cos(a) * su * R[r], v = Math.sin(a) * sv * R[r]; return [c[0] + U[0] * u + V[0] * v, c[1] + U[1] * u + V[1] * v, c[2] + U[2] * u + V[2] * v]; };
    const nm = (r, k) => { const a = k / segs * TAU, f = F[r], q = Math.sqrt(1 - f * f); return nh ? [nh[0] * q, f, nh[1] * q] : [Math.cos(a) * q, f, Math.sin(a) * q]; };
    const n = R.length - 1;
    for (let k = 0; k < segs; k++) {
      this.tri(at(0, k), nm(0, k), at(1, k), nm(1, k), at(1, k + 1), nm(1, k + 1));
      for (let r = 1; r < n; r++) {
        this.tri(at(r, k), nm(r, k), at(r + 1, k), nm(r + 1, k), at(r + 1, k + 1), nm(r + 1, k + 1));
        this.tri(at(r, k), nm(r, k), at(r + 1, k + 1), nm(r + 1, k + 1), at(r, k + 1), nm(r, k + 1));
      }
    }
  }
  /** A disc lying on a horizontal plane (the paving, a floor) at height y. */
  floor(x, y, z, r, rz = r, yaw = 0, segs = 8, k = 1) {
    const s = Math.sin(yaw), c = Math.cos(yaw);
    this.disc([x, y, z], [c, 0, -s], [s, 0, c], r, rz, null, segs, [k, 0.42 * k, 0], [0, 0.5, 1]);
  }
  /** A disc standing on a wall at (x, y, z), the wall's outward normal nh = [x, z]; rw wide and rh high (semi-axes). */
  wall(x, y, z, nh, rw, rh, segs = 8, k = 1) {
    this.disc([x, y, z], [-nh[1], 0, nh[0]], [0, 1, 0], rw, rh, nh, segs, [0.9 * k, 0], [0, 1]);
  }
  /** The glow round a flame at (x, y, z), radius r: three upright discs crossed at 60 degrees. */
  ball(x, y, z, r) {
    for (let k = 0; k < 3; k++) { const a = k * Math.PI / 3, c = Math.cos(a), s = Math.sin(a); this.disc([x, y, z], [c, 0, s], [0, 1, 0], r, r, [-s, c], 8, [0.62, 0], [0, 1]); }
  }
  /** A flat sheet (a window's lamp-lit lattice) of brightness f, facing n = [x, z] (both faces are seen). */
  quad(a, b, c, d, n, f) {
    const q = Math.sqrt(1 - f * f), N = [n[0] * q, f, n[1] * q];
    this.tri(a, N, b, N, c, N); this.tri(a, N, c, N, d, N);
  }
  flush(bag) {
    if (!this.pos.length) return;
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute(this.pos, 3));
    g.setAttribute('normal', new Float32BufferAttribute(this.nor, 3));
    bag.add(MAT, g);
    this.pos = []; this.nor = [];
  }
}

// ── where the lamps are ──────────────────────────────────────────────────────────────────────────────────
// { k: 'hang' | 'chain' | 'stand' | 'brazier' | 'iwan' | 'pane', x, y, z, n: [x, z] (outward), ... }
/** The shop fronts that are built as fronts (not the enterable shops, not the sabils' lots). */
const fronts = () => { const { frontSet, taken } = pickHomes(); return [...frontSet].filter((l) => !taken.has(l)); };
const OUT = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] };
const rect = (r, m = 0) => ({ cx: (r[0] + r[2]) / 2, cz: (r[1] + r[3]) / 2, x0: r[0] - m, z0: r[1] - m, x1: r[2] + m, z1: r[3] + m });

/** The shop fronts' lamps: one on a pier between two cells of each front (the cells as styles/mamluk/dress.js cairo_shopfront lays them), lit on a share of the fronts. */
export function shopLamps() {
  const out = [];
  for (const l of fronts()) {
    const [x0, z0, x1, z1] = l.rect, f = l.front || 's', along = f === 'n' || f === 's', L = along ? x1 - x0 : z1 - z0;
    const P = (u, v) => (f === 's' ? [x1 - u, z1 - v] : f === 'n' ? [x0 + u, z0 + v] : f === 'e' ? [x1 - v, z0 + u] : [x0 + v, z1 - u]);
    const dm = L > 7 ? 0.8 : -1, c0 = dm > 0 ? 1.6 : 0.3, N = Math.max(2, Math.floor((L - c0 - 0.3) / 2.8)), cw = (L - c0 - 0.3) / N;
    const i = 1 + Math.floor(hashAt((x0 + x1) / 2, (z0 + z1) / 2, 3) * (N - 1)), u = c0 + i * cw, p = P(u, -0.38), w = P(u, 0);
    out.push({ k: 'hang', x: p[0], z: p[1], wx: w[0], wz: w[1], y: 2.6, n: OUT[f], lit: hashAt(p[0], p[1], 5) < SHOP_LIT, trade: tradeOf(l) });
  }
  return out;
}
/** The lamps hung over the covered streets from the beams of the roof, every 12 m along the middle. */
export function chainLamps() {
  const out = [];
  for (const S of [SUQ, SUQ2, SUQ3]) {
    const x = (S[0] + S[2]) / 2;
    for (let z = S[1] + 12; z < S[3] - 6; z += 12) out.push({ k: 'chain', x, z, y: 3.75, top: 6.95, n: [0, 0], lit: true });
  }
  return out;
}
/** The mashal stands (an iron stand with a cresset of burning rag and oil) at the covered streets' gates, the madrasa's portal and the Citadel's gate. */
export function stands() {
  const out = [], st = (x, z, n) => out.push({ k: 'stand', x, z, y: height(x, z), n, lit: true });
  for (const S of [SUQ, SUQ2, SUQ3]) {
    const D = (S[2] - S[0] - 5) / 2, xa = S[0] + D, xb = S[2] - D;
    for (const [z, d] of [[S[1], -1], [S[3], 1]]) { st(xa + 0.45, z + d * 1.3, [0, d]); st(xb - 0.45, z + d * 1.3, [0, d]); }
  }
  for (const s of [-1, 1]) st(-37.5 + s * 6.2, 3.2, [0, -1]);
  // the Citadel's gate in the north-west curtain: where the ray at the road's last angle crosses the side (layout and plan.js agree)
  const [cx, cz] = CITADEL.c, R = CITADEL.r - 8, n = 10, D2R = Math.PI / 180, gateK = Math.floor(ROAD.a1 / 360 * n);
  const v = (k) => [cx + Math.cos(k / n * TAU) * R, cz + Math.sin(k / n * TAU) * R], a = v(gateK), b = v(gateK + 1);
  const dx = Math.cos(ROAD.a1 * D2R), dz = Math.sin(ROAD.a1 * D2R), ex = b[0] - a[0], ez = b[1] - a[1], t = ((a[0] - cx) * dz - (a[1] - cz) * dx) / (ez * dx - ex * dz);
  const g = [a[0] + ex * t, a[1] + ez * t], el = Math.hypot(ex, ez), tx = ex / el, tz = ez / el, ox = -tz, oz = tx, sg = (ox * (g[0] - cx) + oz * (g[1] - cz)) > 0 ? 1 : -1;
  for (const s of [-1, 1]) st(g[0] + tx * s * 6.2 + ox * sg * 1.2, g[1] + tz * s * 6.2 + oz * sg * 1.2, [ox * sg, oz * sg]);
  return out;
}
/** The braziers of the khan's court: coals under the merchants' pots. */
export function braziers() {
  return [[KHAN[0] + 14, KHAN[1] + 16], [KHAN[2] - 14, KHAN[3] - 16]].map(([x, z]) => ({ k: 'brazier', x, z, y: 0, n: [0, 0], lit: true }));
}
/** The glass lamps of the iwans (mamluk/index.js iwan: the grid of lamps at one height, 4.6 m up): the glow of each, and its pool on the marble. */
const IWANS = [{ r: [-10, 56, 10, 72], open: 'n', W: 20, D: 16 }, { r: [-7, 15, 7, 24], open: 's', W: 14, D: 9 }, { r: [-24, 34, -17, 46], open: 'e', W: 12, D: 7 }, { r: [17, 34, 24, 46], open: 'w', W: 12, D: 7 }];
export function iwanLamps() {
  const out = [];
  for (const { r, open, W, D } of IWANS) {
    const cols = Math.max(2, Math.round(W / 5)), rows = Math.max(2, Math.round(D / 3.2));
    for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
      const u = -W / 2 + (i + 0.5) * W / cols, d = (j + 0.6) * D / (rows + 0.2), cx = (r[0] + r[2]) / 2, cz = (r[1] + r[3]) / 2;
      const [x, z] = open === 'n' ? [cx + u, r[1] + d] : open === 's' ? [cx + u, r[3] - d] : open === 'e' ? [r[2] - d, cz + u] : [r[0] + d, cz + u];
      out.push({ k: 'iwan', x, z, y: 4.85, n: [0, 0], lit: true });
    }
  }
  out.push({ k: 'iwan', x: -37.5, z: 10, y: 4.4, n: [0, 0], lit: true });                          // the vestibule's lamp from the crown
  return out;
}
/** The sabil-kuttabs' lamps: at each street corner, over the marble column where the sabil's windows meet. */
export function sabilLamps() {
  const out = [];
  for (const [l, p] of pickHomes().taken) {
    const [x0, z0, x1, z1] = l.rect, sx = Math.abs(p[0] - x1) < Math.abs(p[0] - x0) ? 1 : -1, sz = Math.abs(p[1] - z1) < Math.abs(p[1] - z0) ? 1 : -1;
    const w = Math.min(8, x1 - x0), d = Math.min(8, z1 - z0), r = [sx > 0 ? x1 - w : x0, sz > 0 ? z1 - d : z0, sx > 0 ? x1 : x0 + w, sz > 0 ? z1 : z0 + d];
    out.push({ k: 'hang', x: (sx > 0 ? r[2] : r[0]) + sx * 0.55, z: (sz > 0 ? r[3] : r[1]) + sz * 0.55, y: 3.3, n: [sx * 0.707, sz * 0.707], lit: true, wx: null });
  }
  return out;
}

// ── the lit windows of the shop fronts: the lattice slabs the style builds, found as it builds them ──────────
const SLAB = (g) => {
  const P = (g.index ? g.toNonIndexed() : g).attributes.position.array;
  const b = { x0: Infinity, y0: Infinity, z0: Infinity, x1: -Infinity, y1: -Infinity, z1: -Infinity };
  for (let i = 0; i < P.length; i += 3) { b.x0 = Math.min(b.x0, P[i]); b.x1 = Math.max(b.x1, P[i]); b.y0 = Math.min(b.y0, P[i + 1]); b.y1 = Math.max(b.y1, P[i + 1]); b.z0 = Math.min(b.z0, P[i + 2]); b.z1 = Math.max(b.z1, P[i + 2]); }
  return b;
};
/** The panes of the lattice windows (mashrabiya screens and the smaller oriels) of the shop fronts: [{ b, n }] with b the slab's box. */
export function windowSlabs() {
  const base = STYLES.mamluk.elements.cairo_shopfront, out = [], nop = new Proxy({}, { get: () => () => {} });
  for (const l of fronts()) {
    const bag = { add(mat, g) { if (mat !== 'koshi' || !g?.attributes?.position) return; const b = SLAB(g), dx = b.x1 - b.x0, dz = b.z1 - b.z0, th = Math.min(dx, dz), w = Math.max(dx, dz), dy = b.y1 - b.y0; if (th <= 0.06 && w >= 0.7 && dy >= 0.9) out.push({ b, lot: l }); }, addInstance() {} };
    try { base({ rect: l.rect, front: l.front, storeys: l.storeys, seed: l.seed, trade: tradeOf(l), plaster: l.plaster, y: 0 }, { bag, col: nop, lights: [] }); } catch (e) { /* a front that fails to build has no windows lit */ }
  }
  return out;
}

// ── building a lamp ────────────────────────────────────────────────────────────────────────────────────────
/** The lamp's body (iron and bronze: the materials already in the near tiles, so no new draw) and its light, into `bag` and `H`. */
function addLamp(bag, H, l) {
  const { x, z, y } = l, gy = l.k === 'iwan' ? 0.06 : (l.y0 ?? 0);
  if (l.k === 'hang') {
    // an iron bracket from the pier, the lamp (a bronze oil lamp with a glass chimney) on a short chain
    if (l.wx !== undefined && l.wx !== null) bag.add('iron', rod([l.wx, y + 0.12, l.wz], [x, y + 0.12, z], 0.012, 4));
    bag.add('iron', rod([x, y + 0.12, z], [x, y - 0.1, z], 0.006, 3));
    bag.add('bronze', lathe([[0.001, 0], [0.05, 0.01], [0.09, 0.07], [0.07, 0.14], [0.001, 0.15]], 8, null, x, y - 0.25, z));
    if (!l.lit) return;
    H.ball(x, y - 0.13, z, 0.85);
    H.floor(x, gy + 0.03, z, 1.5, 1.5, 0, 8, 0.8);
    if (l.wx !== undefined && l.wx !== null) H.wall(l.wx + l.n[0] * 0.05, y - 0.1, l.wz + l.n[1] * 0.05, l.n, 1.1, 0.9, 8, 0.6);
  } else if (l.k === 'chain') {
    bag.add('iron', rod([x, l.top, z], [x, y + 0.15, z], 0.008, 3));
    bag.add('bronze', lathe([[0.001, 0], [0.05, 0.01], [0.1, 0.07], [0.08, 0.15], [0.001, 0.16]], 8, null, x, y - 0.02, z));
    H.ball(x, y + 0.08, z, 1.0);
    H.floor(x, 0.03, z, 2.3, 2.3, 0, 8, 0.75);
  } else if (l.k === 'stand') {
    // the mashal: a pole of iron on a foot, a cresset with the burning rag at its head
    bag.add('iron', lathe([[0.001, 0], [0.16, 0], [0.14, 0.05], [0.03, 0.12], [0.001, 0.12]], 8, null, x, y, z));
    bag.add('iron', rod([x, y + 0.1, z], [x, y + 1.95, z], 0.025, 5));
    bag.add('iron', lathe([[0.001, 1.9], [0.1, 1.95], [0.15, 2.1], [0.12, 2.1], [0.001, 2.0]], 8, null, x, y, z));
    H.ball(x, y + 2.2, z, 1.25);
    H.floor(x, y + 0.04, z, 2.6, 2.6, 0, 8, 0.85);
  } else if (l.k === 'brazier') {
    bag.add('iron', lathe([[0.001, 0.12], [0.18, 0.12], [0.26, 0.22], [0.29, 0.26], [0.001, 0.2]], 10, null, x, 0, z));
    for (let i = 0; i < 3; i++) { const t = i / 3 * TAU; bag.add('iron', rod([x + Math.cos(t) * 0.14, 0.13, z + Math.sin(t) * 0.14], [x + Math.cos(t) * 0.22, 0, z + Math.sin(t) * 0.22], 0.014, 4)); }
    H.ball(x, 0.45, z, 0.85);
    H.floor(x, 0.04, z, 2.2, 2.2, 0, 8, 0.85);
  } else if (l.k === 'iwan') {
    H.ball(x, y, z, 0.9);
    H.floor(x, gy, z, 1.7, 1.7, 0, 8, 0.45);
  }
}

/** cairo_night: { list: [lamps], panes: [{ b, n, f }] } — the lamps' bodies and the light of a tile, in the plan's bag. */
function cairoNight(el, { bag }) {
  const H = new Halo();
  for (const l of el.list) addLamp(bag, H, l);
  for (const p of el.panes || []) {
    const { b } = p, thinX = b.x1 - b.x0 < b.z1 - b.z0, m = 0.035, y0 = b.y0 + m, y1 = b.y1 - m;
    if (thinX) { const z0 = b.z0 + m, z1 = b.z1 - m; for (const [x, nx] of [[b.x1 + 0.03, 1], [b.x0 - 0.03, -1]]) H.quad([x, y0, z0], [x, y0, z1], [x, y1, z1], [x, y1, z0], [nx, 0], p.f); }
    else { const x0 = b.x0 + m, x1 = b.x1 - m; for (const [zz, nz] of [[b.z1 + 0.03, 1], [b.z0 - 0.03, -1]]) H.quad([x0, y0, zz], [x1, y0, zz], [x1, y1, zz], [x0, y1, zz], [0, nz], p.f); }
  }
  H.flush(bag);
}
STYLES['mamluk-cairo'].elements.cairo_night = cairoNight;

// ── the night plans: 48 m tiles, shown within 55 m ─────────────────────────────────────────────────────────
export const NIGHT_TILE = 48, NIGHT_NEAR = 55;
/** Everything lit, as the tiles' elements: [{ id, center, el }]. */
export function nightTiles() {
  const lamps = [...shopLamps(), ...chainLamps(), ...stands(), ...braziers(), ...iwanLamps(), ...sabilLamps()];
  const panes = [];
  for (const s of windowSlabs()) {
    const cx = (s.b.x0 + s.b.x1) / 2, cz = (s.b.z0 + s.b.z1) / 2;
    if (hashAt(cx, cz, 11) >= WINDOW_LIT) continue;
    panes.push({ b: s.b, f: 0.42 + 0.36 * hashAt(cx, cz, 23) });
  }
  const m = new Map(), at = (x, z) => { const k = Math.floor(x / NIGHT_TILE) + ',' + Math.floor(z / NIGHT_TILE); let t = m.get(k); if (!t) m.set(k, (t = { k, list: [], panes: [] })); return t; };
  for (const l of lamps) if (Math.hypot(l.x, l.z) < RADIUS - 14) at(l.x, l.z).list.push(l);
  for (const p of panes) { const x = (p.b.x0 + p.b.x1) / 2, z = (p.b.z0 + p.b.z1) / 2; if (Math.hypot(x, z) < RADIUS - 14) at(x, z).panes.push(p); }
  return [...m.values()].map((t) => { const [i, j] = t.k.split(',').map(Number); return { id: t.k, center: [i * NIGHT_TILE + NIGHT_TILE / 2, j * NIGHT_TILE + NIGHT_TILE / 2], el: { t: 'cairo_night', list: t.list, panes: t.panes } }; });
}
void box;
