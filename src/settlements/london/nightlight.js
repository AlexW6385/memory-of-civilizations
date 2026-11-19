// London by night about 1870 (docs/settlements/london.md §10.1): gas. The streets were lit by gas lamps at the kerbs, the shops stood open into the
// evening with gas jets behind their plate glass, the public houses (open until half past midnight) were the brightest fronts of all with their
// great gas lamps over the doors and their etched glass, the costers' stalls of the markets burned naphtha flares, the Commons sat in the evening
// with the river front's windows lit, the lamp standards of the bridge and the dolphins of the new embankment were gas too. Each is made here of
// geometry in one material, `halo` (palette.js 'halo'): light ADDED over what is behind it, at night only (ENV.night), no light, no shadow, no
// collision; the shape of each piece is carried by its normals (the scheme of Ming Suzhou's nightlight.js, of which `Halo` is a copy: that file
// imports Suzhou's layout). Where the real fronts stand is read off the builders' own measures (shops.js, upstairs.js, palace.js, bridge.js), so
// a glow is on a window that is there. Pure functions of places: no counters, no Math.random.

import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';
import { STYLES } from '../../core/build.js';
import { GROUND, BRIDGE, RADIUS } from './layout.js';
import { nightSites, nightLots } from './town.js';
import { westminster, bridge } from './plan.js';
import { rng, terraceWindows, shopSpec, shopWindows, pubWindows } from '../../styles/victorian/upstairs.js';

const TAU = Math.PI * 2;
/** A number in [0, 1) from numbers alone. */
export function hash(a, b = 0, c = 0) {
  let h = Math.imul(Math.floor(a) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(Math.floor(b * 7.31) + 0x7f4a7c15, 0xc2b2ae35) ^ Math.imul(Math.floor(c * 5.9) + 0x165667b1, 0x27d4eb2f);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}

/** Triangles (position and a normal per corner) of the halo material (a copy of Ming Suzhou's `Halo`, as Paris's). */
export class Halo {
  constructor() { this.pos = []; this.nor = []; }
  tri(p0, n0, p1, n1, p2, n2) { this.pos.push(...p0, ...p1, ...p2); this.nor.push(...n0, ...n1, ...n2); }
  /** A flat disc (ellipse) at c spanned by the unit axes U and V, semi-axes su and sv, in rings R of brightness F (carried by the normal's y). */
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
  /** A disc lying on a horizontal plane (the paving) at height y; yaw turns its first semi-axis r from +x toward −z. */
  floor(x, y, z, r, rz = r, yaw = 0, segs = 8, F = [1, 0.42, 0]) {
    const s = Math.sin(yaw), c = Math.cos(yaw);
    this.disc([x, y, z], [c, 0, -s], [s, 0, c], r, rz, null, segs, F, [0, 0.5, 1]);
  }
  /** The glow round a flame at (x, y, z), radius r: three upright discs crossed at 60 degrees. */
  ball(x, y, z, r) {
    for (let k = 0; k < 3; k++) { const a = k * Math.PI / 3, c = Math.cos(a), s = Math.sin(a); this.disc([x, y, z], [c, 0, s], [0, 1, 0], r, r, [-s, c], 8, [0.62, 0], [0, 1]); }
  }
  /** A flat sheet of brightness f (0..1), facing n = [x, z] (both faces are seen). */
  quad(a, b, c, d, n, f) {
    const q = Math.sqrt(1 - f * f), N = [n[0] * q, f, n[1] * q];
    this.tri(a, N, b, N, c, N); this.tri(a, N, c, N, d, N);
  }
  flush(bag) {
    if (!this.pos.length) return;
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute(this.pos, 3));
    g.setAttribute('normal', new Float32BufferAttribute(this.nor, 3));
    bag.add('halo', g);
    this.pos = []; this.nor = [];
  }
}

// ── what the builders themselves put up ─────────────────────────────────────────────────────────────────
/** Run a victorian builder on a throw-away bag and give the boxes of the geometries in the materials `want`: [[material, Box3]]. */
function capture(el, want) {
  const out = [], bag = { add(m, g) { if (want.includes(m)) { g.computeBoundingBox(); out.push([m, g.boundingBox.clone()]); } } };
  STYLES.victorian.elements[el.t](el, { bag, col: new Proxy({}, { get: () => () => {} }) });
  return out;
}
/** The river front's panes (the tall windows of the Commons' range and the palace's west ranges), by palace.js riverFront's own measures: each bay of about
 *  4.4 m has one window of two lights, four storeys, set in a reveal 0.5 m deep; { x (the glass's face), y0, y1, z0, z1, out: ±1 }. */
let PANES = null;
export function palacePanes() {
  if (PANES) return PANES;
  PANES = [];
  for (const el of westminster.elements.filter((e) => e.t === 'river_front')) {
    const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, k = (el.h ?? 22) / 22, east = (el.face ?? 'e') === 'e', L = z1 - z0, n = Math.max(2, Math.round(L / 4.4)), bw = L / n, pav = el.pavilions ?? [];
    const rows = [[1.8, 4.9], [6.3, 10.0], [11.5, 14.9], [16.4, 18.9]].map(([a, b]) => [y + a * k, y + b * k]);
    for (let i = 0; i < n; i++) {
      const u = (i + 0.5) * bw, p = pav.some(([a, b]) => u > a + 0.01 && u < b - 0.01) ? 2.4 : 0, ww = Math.min(0.72, bw / 2 - 0.8), zm = z0 + u;
      for (const [y0, y1] of rows) PANES.push({ x: east ? x1 + p - 0.44 : x0 - p + 0.44, y0, y1, z0: zm - 2 * ww, z1: zm + 2 * ww, out: east ? 1 : -1 });
    }
  }
  return PANES;
}
/** The lamps of the bridge's standards and the embankments' dolphins: { bridge: [{ c: [x, y, z], side }], dolphins: [[x, y, z]] }. */
let LAMPS = null;
export function riverLamps() {
  if (LAMPS) return LAMPS;
  LAMPS = { bridge: [], dolphins: [] };
  for (const el of bridge.elements) {
    if (el.t === 'iron_bridge') for (const [, b] of capture(el, ['lamp_glass'])) LAMPS.bridge.push({ c: [(b.min.x + b.max.x) / 2, (b.min.y + b.max.y) / 2, (b.min.z + b.max.z) / 2], hw: (b.max.x - b.min.x) / 2, side: (b.min.z + b.max.z) / 2 < BRIDGE.z ? 1 : -1 });
    else if (el.t === 'embankment') for (const [, b] of capture(el, ['lamp_white'])) LAMPS.dolphins.push([(b.min.x + b.max.x) / 2, (b.min.y + b.max.y) / 2, (b.min.z + b.max.z) / 2]);
  }
  return LAMPS;
}

// ── the windows of the lots ─────────────────────────────────────────────────────────────────────────────
/** The type of a terrace house's front, as shops.js terraceRich draws it from the seed (the same draws in the same order). */
export function terraceType(l, open) {
  const r = rng(l.seed || 1);
  r();                                                                                     // (brickOf)
  const t0 = r() < 0.33 ? 'bay' : r() < 0.3 ? 'stucco' : 'plain';
  return open && t0 === 'bay' ? (l.seed % 3 ? 'plain' : 'stucco') : t0;
}
const ST = 3.2;
/**
 * The panes of a lot that may be lit, in the lot's frame (u along the front from its west edge, d outward from the front wall): [{ u, w (half),
 * y0, y1, d, k: 'shop' | 'house' | 'upper' | 'side', fl: the storey (0 ground) }].
 */
export function windowsOf(l, open, up) {
  const [x0, , x1] = l.rect, Wd = x1 - x0, y = l.y ?? GROUND, out = [];
  const el = { rect: l.rect, seed: l.seed, front: l.front, storeys: l.storeys, y, mirror: l.mirror };
  if (l.pub) {
    const g0 = 4.0, n = 3, st = 3.3, nw = Math.max(2, Math.round(Wd / 2.6));
    for (let s = 1; s < n; s++) for (let i = 0; i < nw; i++) {
      const u = (i + 0.5) * Wd / nw, hh = s === 1 ? 2.3 : 1.9;
      let y0 = y + g0 + (s - 1) * st + 0.6, y1 = y0 + hh;
      if (up) { const h = pubWindows({ ...el, corner: l.corner }, s)[i]; y0 = h.y0; y1 = h.y1; }
      out.push({ u, w: 0.4, y0: y0 + 0.2, y1: y1 - 0.2, d: up ? 0.03 : 0.1, k: 'upper', fl: s });
    }
  } else if (l.shop) {
    const g0 = 3.8, n = l.storeys ?? 3, S = shopSpec(el), left = S.left, dw = 1.0;
    const wu0 = left ? 0.42 + dw + 0.2 : 0.5, wu1 = left ? Wd - 0.5 : Wd - 0.42 - dw - 0.2;
    out.push({ u: (wu0 + wu1) / 2, w: (wu1 - wu0) / 2 - 0.08, y0: y + 0.82, y1: y + g0 - 1.2, d: 0.46, k: 'shop', fl: 0 });
    for (let s = 1; s < n; s++) {
      if (up) { const w = shopWindows(el, s); for (const h of [w.hall, w.room]) out.push({ u: left ? h.u : Wd - h.u, w: 0.42, y0: h.y0 + 0.15, y1: h.y1 - 0.15, d: 0.03, k: 'upper', fl: s }); continue; }
      const hh = s === 1 ? 2.2 : 1.8, y0 = y + g0 + (s - 1) * ST + 0.55;
      for (const u of [Wd * 0.27, Wd * 0.73]) out.push({ u, w: 0.4, y0: y0 + 0.12, y1: y0 + hh - 0.1, d: 0.1, k: 'upper', fl: s });
    }
  } else {
    const n = l.storeys ?? 3, type = terraceType(l, open), uD = l.mirror ? 3 * Wd / 4 : Wd / 4, uW = l.mirror ? Wd / 4 : 3 * Wd / 4;
    for (let s = 0; s < n; s++) for (let i = 0; i < 2; i++) {
      const u = i === 0 ? uD : uW, hh = s === 0 ? 1.8 : s === 1 ? 2.2 : 1.8, y0 = y + s * ST + (s === 0 ? 0.6 : 0.9);
      if (s === 0 && i === 0) continue;
      if (s === 0 && open) { out.push({ u, w: 0.42, y0: y0 + 0.1, y1: y0 + hh - 0.1, d: 0.03, k: 'house', fl: 0 }); continue; }
      if (s === 0 && type === 'bay') { out.push({ u, w: 0.8, y0: y + 0.8, y1: y + 2.5, d: 0.8, k: 'house', fl: 0 }); continue; }
      if (up && s >= 1) { const w = terraceWindows(el, type, s), sp = i === 0 ? w.door : w.room; out.push({ u, w: 0.42, y0: sp.y0 + 0.15, y1: sp.y1 - 0.15, d: 0.03, k: 'upper', fl: s }); continue; }
      const tall = type === 'stucco' && s === 1 && i === 1 ? 2.6 : hh;
      out.push({ u, w: 0.4, y0: y0 + 0.1, y1: y0 + tall - 0.1, d: 0.1, k: s === 0 ? 'house' : 'upper', fl: s });
    }
  }
  return out;
}
/** Does this pane burn? A share by the storey and the kind, by a hash of the lot and the pane; the shops' fronts mostly, the pubs' rooms often. */
function lit(l, w, i) {
  const base = w.k === 'shop' ? 0.88 : l.pub ? 0.55 : l.shop ? (w.fl === 1 ? 0.5 : 0.28) : w.fl === 0 ? 0.42 : w.fl === 1 ? 0.45 : w.fl === 2 ? 0.28 : 0.12;
  return hash(l.seed, w.fl * 3 + i, 17) < base;
}
const poor = (l) => (l.rect[0] + l.rect[2]) / 2 > 262;                                  // the Lambeth side: a candle or one oil lamp behind the blind
const bright = (l, w, i) => (w.k === 'shop' ? 0.62 + 0.28 * hash(l.seed, i, 3) : l.pub ? 0.55 + 0.25 * hash(l.seed, i, 4) : (poor(l) ? 0.34 : 0.46) + 0.26 * hash(l.seed, w.fl, 5));

// ── the halos ───────────────────────────────────────────────────────────────────────────────────────────
export function halos() {
  const H = new Halo();
  const { lamps, stalls } = nightSites(), { all, open, ups } = nightLots(), R2 = (RADIUS - 40) ** 2;
  // the gas lamps of the streets: the lantern's glow and the pool on the paving
  for (const [x, z, y] of lamps) { H.ball(x, y + 3.65, z, 1.35); H.floor(x, y + 0.17, z, 3.4, 3.0, 0, 8); }
  // the costers' stalls by their flares
  for (const [x, z, y] of stalls) { H.ball(x, y + 1.75, z, 1.0); H.floor(x, y + 0.15, z, 2.3, 1.9, 0, 6); }
  // the lamp standards of the bridge (three lanterns each) and the embankments' dolphins
  const RL = riverLamps();
  for (const b of RL.bridge) {
    const [cx, cy, cz] = b.c;
    for (const dx of [-b.hw * 0.78, 0, b.hw * 0.78]) H.ball(cx + dx, cy, cz, 1.15);
    H.floor(cx, GROUND + 0.4 + 0.12, cz + b.side * 2.6, 4.2, 3.4, 0, 8);
  }
  for (const [x, y, z] of RL.dolphins) H.ball(x, y, z, 1.35);
  // the Commons' windows and the palace's other river ranges
  for (const p of palacePanes()) {
    const i = Math.round((p.z0 + p.z1) * 5), j = Math.round(p.y0 * 3);
    if (hash(i, j, 29) > 0.3 + (p.y0 < 8 ? 0.1 : 0) || Math.hypot(p.x, (p.z0 + p.z1) / 2) > RADIUS - 40) continue;
    const f = 0.42 + 0.34 * hash(i, j, 31), x = p.x + p.out * 0.06, m = 0.18;
    H.quad([x, p.y0 + m, p.z0 + m], [x, p.y0 + m, p.z1 - m], [x, p.y1 - m, p.z1 - m], [x, p.y1 - m, p.z0 + m], [p.out, 0], f);
  }
  // the lots
  for (const l of all) {
    if (((l.rect[0] + l.rect[2]) / 2) ** 2 + ((l.rect[1] + l.rect[3]) / 2) ** 2 > R2) continue;
    const [x0, z0, x1, z1] = l.rect, Wd = x1 - x0, y = l.y ?? GROUND, sg = l.front === 's' ? 1 : -1, zf = l.front === 's' ? z1 : z0, isOpen = open.has(l), isUp = ups.has(l);
    const P = (u, yy, d) => [x0 + u, yy, zf + sg * d];
    const ws = windowsOf(l, isOpen, isUp);
    ws.forEach((w, i) => {
      if (!lit(l, w, i)) return;
      const f = bright(l, w, i);
      H.quad(P(w.u - w.w, w.y0, w.d), P(w.u + w.w, w.y0, w.d), P(w.u + w.w, w.y1, w.d), P(w.u - w.w, w.y1, w.d), [0, sg], f);
      if (w.k === 'shop') H.floor(x0 + w.u, y + 0.15, zf + sg * 1.0, w.w + 0.5, 0.95, 0, 6);          // the shop window's light on the pavement
    });
    if (l.pub) {
      // the great gas lamp over the door on its bracket and the pools before the front, brightest of the street
      const east = l.corner === 'e', uDoor = east ? Wd - 1.3 : 1.3, g0 = 4.0, c = P(uDoor, y + g0 + 0.65, 1.0);
      H.ball(c[0], c[1], c[2], 1.7); H.floor(c[0], y + 0.15, zf + sg * 1.5, 2.8, 2.0, 0, 8);
      H.floor(x0 + Wd / 2, y + 0.15, zf + sg * 0.95, Wd * 0.55, 0.95, 0, 8);
      // the side along the cross street: a few of its rooms lit
      const sx = east ? x1 : x0, so = east ? 1 : -1, D = z1 - z0;
      for (let s = 1; s < 3; s++) for (let v = 1.0, k = 0; v < D - 0.8; v += 3.1, k++) {
        if (hash(l.seed, s * 9 + k, 23) > 0.5) continue;
        const ya = y + g0 + (s - 1) * 3.3 + 0.8, yb = ya + (s === 1 ? 2.0 : 1.5), za = l.front === 's' ? z1 - v - 0.9 : z0 + v, zb = za + 0.9, xx = sx + so * 0.08;
        H.quad([xx, ya, za + 0.1], [xx, ya, zb - 0.1], [xx, yb, zb - 0.1], [xx, yb, za + 0.1], [so, 0], 0.5);
      }
    }
  }
  return H;
}

/** { t: 'london_night' }: the halos of the whole town, in one geometry of one material. */
function londonNight(el, ctx) { halos().flush(ctx.bag); }
Object.assign(STYLES.victorian.elements, { london_night: londonNight });

/** The night plan: one plan, one material's draw. */
export function nightPlan() {
  return { id: 'london-night', style: 'victorian', origin: [0, 0], base: 0, yaw: 0, feature: true, entrance: { at: [0, -180], facing: 'e' }, bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], rooms: [], elements: [{ t: 'london_night' }], nocollide: true };
}
