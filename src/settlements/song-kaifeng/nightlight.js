// Bianjing by night, c. 1120 (docs/settlements/song-kaifeng.md §19.3). What lit the city: the lantern boxes and gardenia lamps of the
// inns, tea houses and wine houses (the scroll's night trade), the shops open into the evening by the lamp on their counters, the
// monastery's hall lamps, the torches of the gate's guard, and the lamp-lit lattices of the houses. The light is geometry in the one
// additive `halo` material (palette.js, materials.js 'halo': light ADDED over what is behind, at night only, no light, no shadow, no
// collision), so it reads at the low preset. The pieces and their normals follow Suzhou's nightlight.js (the same engine material);
// everything is a function of the place: no counters, no Math.random.

import { BufferGeometry, Float32BufferAttribute, Matrix4, Quaternion, Vector3 } from '../../core/three.js';
import { placeHanging } from '../../core/geom.js';
import { STYLES } from '../../core/build.js';
import { assembly } from '../../objects/kit.js';
import { GATE, PAGODA } from './layout.js';
import { shopElements } from './shops.js';
import { TEMPLE } from './soundmap.js';

/** The share of the ordinary shops open into the evening, their counter lamp lit (the night market of the scroll's age: Dongjing Meng Hua Lu). [inferred share] */
export const SHOP_LIT = 0.8;
/** A number in [0, 1) from a position alone. */
export function hashAt(x, z, s = 0) {
  let h = (Math.round(x * 16) * 73856093) ^ (Math.round(z * 16) * 19349663) ^ Math.imul(s + 1, 83492791);
  h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

const TAU = Math.PI * 2;
const MAT = 'halo';
/** Triangles (position and a normal per corner) of the halo material. */
export class Halo {
  constructor() { this.pos = []; this.nor = []; }
  tri(p0, n0, p1, n1, p2, n2) { this.pos.push(...p0, ...p1, ...p2); this.nor.push(...n0, ...n1, ...n2); }
  /**
   * A flat disc (an ellipse) at c, spanned by the unit axes U and V with the semi-axes su and sv, in rings R
   * (fractions of the radius, from 0 for the middle) of brightness F: the vertex normals carry it in their y
   * (materials.js 'halo'; a negative y marks water), their horizontal part pointing along `nh` ([x, z], a wall's
   * outward) or radially.
   */
  disc(c, U, V, su, sv, nh = null, segs = 8, F = [1, 0.42, 0], R = [0, 0.5, 1], sign = 1) {
    const at = (r, k) => { const a = k / segs * TAU, u = Math.cos(a) * su * R[r], v = Math.sin(a) * sv * R[r]; return [c[0] + U[0] * u + V[0] * v, c[1] + U[1] * u + V[1] * v, c[2] + U[2] * u + V[2] * v]; };
    const nm = (r, k) => { const a = k / segs * TAU, f = F[r], q = Math.sqrt(1 - f * f); return nh ? [nh[0] * q, f * sign, nh[1] * q] : [Math.cos(a) * q, f * sign, Math.sin(a) * q]; };
    const n = R.length - 1;
    for (let k = 0; k < segs; k++) {
      this.tri(at(0, k), nm(0, k), at(1, k), nm(1, k), at(1, k + 1), nm(1, k + 1));
      for (let r = 1; r < n; r++) {
        this.tri(at(r, k), nm(r, k), at(r + 1, k), nm(r + 1, k), at(r + 1, k + 1), nm(r + 1, k + 1));
        this.tri(at(r, k), nm(r, k), at(r + 1, k + 1), nm(r + 1, k + 1), at(r, k + 1), nm(r, k + 1));
      }
    }
  }
  /** A disc lying on a horizontal plane (the paving, the water, a floor, an eave's underside) at height y; water: the ripple-broken kind. */
  floor(x, y, z, r, rz = r, yaw = 0, segs = 8, water = false, k = 1) {
    const s = Math.sin(yaw), c = Math.cos(yaw);
    this.disc([x, y, z], [c, 0, -s], [s, 0, c], r, rz, null, segs, [k, 0.42 * k, 0], [0, 0.5, 1], water ? -1 : 1);
  }
  /** A disc standing on a wall at (x, y, z), the wall's outward normal nh = [x, z]; rw wide and rh high (semi-axes). */
  wall(x, y, z, nh, rw, rh, segs = 8, k = 1) {
    this.disc([x, y, z], [-nh[1], 0, nh[0]], [0, 1, 0], rw, rh, nh, segs, [0.9 * k, 0], [0, 1]);
  }
  /** The glow round a flame at (x, y, z), radius r: three upright discs crossed at 60° (brightness varies by 7 % with the view), each a cone of light from its middle. */
  ball(x, y, z, r) {
    for (let k = 0; k < 3; k++) { const a = k * Math.PI / 3, c = Math.cos(a), s = Math.sin(a); this.disc([x, y, z], [c, 0, s], [0, 1, 0], r, r, [-s, c], 8, [0.62, 0], [0, 1]); }
  }
  /** A flat sheet (a window's lamp-lit paper) of brightness f (0..1), facing n = [x, z] (both faces are seen). */
  quad(a, b, c, d, n, f) {
    const q = Math.sqrt(1 - f * f), N = [n[0] * q, f, n[1] * q];
    this.tri(a, N, b, N, c, N); this.tri(a, N, c, N, d, N);
  }
  /** Into the bag, one geometry. */
  flush(bag) {
    if (!this.pos.length) return;
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute(this.pos, 3));
    g.setAttribute('normal', new Float32BufferAttribute(this.nor, 3));
    bag.add(MAT, g);
    this.pos = []; this.nor = [];
  }
}

// ── what each lantern throws: its glow ball, the pool on the ground, the wash on the wall behind ─────
/**
 * The light of one lantern into `H`: at (x, z), `cy` the height of the lantern's body, `gy` the ground (or floor)
 * below it, `s` its size; a wall `wall` = { n: [x, z] (outward), d (behind the lantern, m) } if one stands behind it.
 */
export function lanternLight(H, x, z, cy, gy, s, wall = null, pool = 2.6) {
  // (the pool and the wash are kept small and soft, so that two lanterns of a gate leave dark between their pools: the whole front washed orange was too much)
  H.ball(x, cy, z, 0.95 * s);
  H.floor(x, gy + 0.03, z, pool * s * 0.55, pool * s * 0.55, 0, 8, false, 0.8);
  if (wall) H.wall(x - wall.n[0] * wall.d, cy, z - wall.n[1] * wall.d, wall.n, 1.25 * s, 1.0 * s, 8, 0.6);
}

// ── the lamps of the street: one element of the street life, instanced ───────────────────────────────
// { t: 'kf_halo', at, y (the ground), rot (+z out, the wall behind at −z), kind }
const KINDS = {
  box:   { cy: 3.3, s: 1.1, wall: 0, pool: 3.2, gy: 0.04 },       // the lantern box on its pole before a tea house, an inn or a wine house
  gate:  { cy: 3.0, s: 1.2, wall: 0.3, pool: 3.0, gy: 0.04 },     // the red gardenia lamps of a wine house's colour gate
  hall:  { cy: 1.8, s: 1.3, wall: 0.4, pool: 3.4, gy: 0.28 },     // the lamp at a monastery hall's door (the hall's floor is 0.28 up)
  torch: { cy: 2.1, s: 1.15, wall: 0, pool: 3.6, gy: 0.04 },      // the torch at the city gate, a camel train's night halt
  post:  { cy: 2.6, s: 1.25, wall: 0, pool: 4.6, gy: 0.04 },       // a lantern post of the night market street and the monastery approach (a pole, a lantern box)
  spill: {},                                                       // the counter lamp of a shop open into the evening, across its doorstep
};
/** A closed box w × h × d centred at height y (flat-shaded triangles). */
function boxGeo(w, h, d, y) {
  const x = w / 2, z = d / 2, y0 = y - h / 2, y1 = y + h / 2, P = [], N = [];
  const f = (a, b, c, e, n) => { P.push(...a, ...b, ...c, ...a, ...c, ...e); for (let i = 0; i < 6; i++) N.push(...n); };
  f([-x, y0, z], [x, y0, z], [x, y1, z], [-x, y1, z], [0, 0, 1]); f([x, y0, -z], [-x, y0, -z], [-x, y1, -z], [x, y1, -z], [0, 0, -1]);
  f([x, y0, z], [x, y0, -z], [x, y1, -z], [x, y1, z], [1, 0, 0]); f([-x, y0, -z], [-x, y0, z], [-x, y1, z], [-x, y1, -z], [-1, 0, 0]);
  f([-x, y1, z], [x, y1, z], [x, y1, -z], [-x, y1, -z], [0, 1, 0]); f([-x, y0, -z], [x, y0, -z], [x, y0, z], [-x, y0, z], [0, -1, 0]);
  const g = new BufferGeometry(); g.setAttribute('position', new Float32BufferAttribute(P, 3)); g.setAttribute('normal', new Float32BufferAttribute(N, 3)); return g;
}
function unitOf(kind) {
  return assembly(`kf-halo|${kind}`, (a) => {
    const H = new Halo(), K = KINDS[kind];
    if (kind === 'spill') { H.floor(0, 0.06, 1.4, 3.4, 2.6, 0, 10); H.ball(0, 2.0, 0.6, 1.1); }
    else if (kind === 'post') {
      lanternLight(H, 0, 0, K.cy, K.gy, K.s, null, K.pool / K.s);
      const bx = (w, h, d, y) => boxGeo(w, h, d, y);
      a('wood_dark', bx(0.12, 2.3, 0.12, 1.15)); a('wood_dark', bx(0.5, 0.06, 0.5, 2.43)); a('wood_painted', bx(0.34, 0.4, 0.34, 2.2 + 0.0));
    }
    else lanternLight(H, 0, 0, K.cy, K.gy, K.s, K.wall ? { n: [0, 1], d: K.wall } : null, K.pool / K.s);
    const g = new BufferGeometry(); g.setAttribute('position', new Float32BufferAttribute(H.pos, 3)); g.setAttribute('normal', new Float32BufferAttribute(H.nor, 3)); a(MAT, g);
  });
}
const HALO_REACH = 60;
function kfHalo(el, { bag }) {
  const U = unitOf(el.kind), [x, z] = el.at;
  const M = new Matrix4().compose(new Vector3(x, el.y ?? 0, z), new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), el.rot ?? 0), new Vector3(1, 1, 1));
  for (const [mat, g] of Object.entries(U)) { if (bag.addInstance) bag.addInstance(mat, g.clone(), M, { reach: HALO_REACH }); else bag.add(mat, placeHanging(g.clone(), M)); }
}

/** The lamps of the city: [{ t: 'kf_halo', ... }]. Shops by their fronts (shops.js), the monastery's halls (soundmap.js TEMPLE), the gate. */
export function nightLamps() {
  const out = [], put = (kind, at, y, rot = 0) => out.push({ t: 'kf_halo', kind, at, y, rot });
  for (const e of shopElements()) {
    const [x, z] = e.at, c = Math.cos(e.rot), s = Math.sin(e.rot), W = (lx, lz) => [x + lx * c + lz * s, z - lx * s + lz * c];
    if (e.trade === 'tea' || e.trade === 'wine' || e.trade === 'inn') {
      put('box', W(e.poleX, e.poleZ), 0.04, e.rot);
      if (e.trade === 'wine') for (const k of [-0.36, 0, 0.36]) put('gate', W(e.L * k, 1.0), 0.04, e.rot);     // (the red gardenia lamps along the gate)
    }
    if (e.trade !== 'wine' && hashAt(x, z, 5) < SHOP_LIT) put('spill', W(0, 0.2), 0.04, e.rot);
  }
  for (const r of Object.values(TEMPLE.rects)) {
    const [x0, , x1, , ] = r, zf = r[3];
    if (r === TEMPLE.rects.gate) continue;
    put('hall', [(x0 + x1) / 2 - (x1 - x0) * 0.2, zf + 0.9], 0, 0); put('hall', [(x0 + x1) / 2 + (x1 - x0) * 0.2, zf + 0.9], 0, 0);
  }
  put('hall', [PAGODA[0], PAGODA[1] + 7], 0, 0);
  // the approach and the court (the visitor arrives here): lantern posts down both sides, round the pagoda's base
  for (let z = -126; z <= -84; z += 7) for (const dx of [-4.5, 4.5]) put('post', [160 + dx, z], 0.04, 0);
  for (const [dx, dz] of [[-9, 9], [9, 9], [-9, -9], [9, -9]]) put('post', [PAGODA[0] + dx, PAGODA[1] + dz], 0, 0);
  // the shop street and the main street: a lantern post every 14 m on the walk (the night markets)
  for (let x = -280; x <= 150; x += 14) put('post', [x, -80 + (x % 28 === 0 ? 5.2 : -5.2)], 0.04, 0);
  for (let z = -70; z <= -20; z += 14) put('post', [(z % 28 === 0 ? 5.2 : -5.2), z], 0.04, 0);
  for (const dz of [-6, 6]) put('torch', [GATE.rect[2] + 1.2, GATE.z + dz], 0.04, Math.PI / 2);
  return out;
}

// ── the lit windows ────────────────────────────────────────────────────────────────────
/**
 * The leaves of a geometry that are windows: groups of touching triangles that make a thin upright slab, in a
 * plane along x or z, at least 0.3 m wide and high. Each: { x0, y0, z0, x1, y1, z1 }.
 */
function slabsOf(g, thick = 0.2) {
  const gg = g.index ? g.toNonIndexed() : g, P = gg.attributes.position.array, n = P.length / 9;
  const par = new Int32Array(n).map((_, i) => i), find = (i) => { while (par[i] !== i) { par[i] = par[par[i]]; i = par[i]; } return i; };
  const seen = new Map();
  for (let t = 0; t < n; t++) for (let v = 0; v < 3; v++) {
    const k = `${Math.round(P[t * 9 + v * 3] * 400)},${Math.round(P[t * 9 + v * 3 + 1] * 400)},${Math.round(P[t * 9 + v * 3 + 2] * 400)}`;
    const o = seen.get(k);
    if (o === undefined) seen.set(k, t); else { const a = find(o), b = find(t); if (a !== b) par[b] = a; }
  }
  const box = new Map();
  for (let t = 0; t < n; t++) {
    const r = find(t);
    let b = box.get(r);
    if (!b) box.set(r, (b = { x0: Infinity, y0: Infinity, z0: Infinity, x1: -Infinity, y1: -Infinity, z1: -Infinity }));
    for (let v = 0; v < 3; v++) {
      const x = P[t * 9 + v * 3], y = P[t * 9 + v * 3 + 1], z = P[t * 9 + v * 3 + 2];
      if (x < b.x0) b.x0 = x; if (x > b.x1) b.x1 = x; if (y < b.y0) b.y0 = y; if (y > b.y1) b.y1 = y; if (z < b.z0) b.z0 = z; if (z > b.z1) b.z1 = z;
    }
  }
  const out = [];
  for (const b of box.values()) {
    const dx = b.x1 - b.x0, dz = b.z1 - b.z0, dy = b.y1 - b.y0, th = Math.min(dx, dz), w = Math.max(dx, dz);
    if (th > thick || w < 0.3 || dy < 0.3 || th < 0.002) continue;
    out.push(b);
  }
  return out;
}
/** The lit panes for one slab: a sheet a hair off each of its two faces (full leaf less a frame's width). */
function panesOf(H, b, off) {
  const thinX = b.x1 - b.x0 < b.z1 - b.z0, m = 0.035, y0 = b.y0 + m, y1 = b.y1 - m;
  if (y1 - y0 < 0.15) return;
  // (each room its own strength, by the hash of its place: a lamp near the window or far back)
  const f = 0.42 + 0.36 * hashAt((b.x0 + b.x1) / 2, (b.z0 + b.z1) / 2, 23 + Math.floor(b.y0 / 2.5));
  if (thinX) {
    const z0 = b.z0 + m, z1 = b.z1 - m;
    for (const [x, nx] of [[b.x1 + off, 1], [b.x0 - off, -1]]) H.quad([x, y0, z0], [x, y0, z1], [x, y1, z1], [x, y1, z0], [nx, 0], f);
  } else {
    const x0 = b.x0 + m, x1 = b.x1 - m;
    for (const [z, nz] of [[b.z1 + off, 1], [b.z0 - off, -1]]) H.quad([x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z], [0, nz], f);
  }
}
/**
 * Wrap a builder context so that the windows it makes glow at night: each latticed leaf (a slab of a `lattice*`
 * material, or the thin sheet of paper `plaster_white` of the halls' real lattice) gets a pane of lamp-light on
 * each face if its room (a cell of the settlement by hash: 4 m × 3 m storeys) is one of those lit, `share` of them.
 * Returns { ctx, finish } — call finish() once the element has been built.
 */
export function litWindows(ctx, share = 0.42) {
  // (one layer only: a wrapped builder called from inside another wrapped one, as the opened lots' shells call the town's house, must not pane its windows twice)
  if (ctx.bag?.[LIT]) return { ctx, finish: () => {} };
  const H = new Halo(), real = ctx.bag;
  const lit = (b) => hashAt(Math.floor((b.x0 + b.x1) / 8) * 4, Math.floor((b.z0 + b.z1) / 8) * 4, 11 + Math.floor((b.y0 + b.y1) / 6)) < share;
  const bag = new Proxy(real, {
    get(t, k) {
      if (k === LIT) return true;
      if (k === 'add') return (mat, g) => {
        if (typeof mat === 'string' && g?.attributes?.position && ((mat.startsWith('lattice') && mat !== 'lattice_red'))) {
          const paper = mat === 'plaster_white', n = g.attributes.position.count;
          if (!paper || n <= 36) for (const b of slabsOf(g, paper ? 0.02 : 0.2)) if (lit(b)) panesOf(H, b, 0.07);
        }
        return t.add(mat, g);
      };
      const v = t[k];
      return typeof v === 'function' ? v.bind(t) : v;
    },
  });
  return { ctx: { ...ctx, bag }, finish: () => H.flush(real) };
}
const LIT = Symbol('lit windows');
function wrapElement(style, name, share) {
  const S = STYLES[style];
  if (!S?.elements[name] || S.elements[name].__lit) return;
  const base = S.elements[name];
  const f = (el, ctx) => { const L = litWindows(ctx, el.litShare ?? share); base(el, L.ctx); L.finish(); };
  f.__lit = true;
  S.elements[name] = f;
}
/** Register the street life's element and the lit lattices of the houses (after the style files have registered). */
export function registerNight() {
  if (STYLES.life) STYLES.life.elements.kf_halo = kfHalo;
  for (const [style, name, share] of [['kaifeng-site', 'house_song', 0.4], ['kaifeng-site', 'kf_mid_wall', 0.4], ['kaifeng-site', 'kf_outer', 0.3]]) wrapElement(style, name, share);
}
