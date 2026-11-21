// Mughal Agra by night (docs/settlements/mughal-agra.md §17.2): the light the lamps and the lit rooms throw. The glow shades of lamps.js (lamp_white, lamp_paper)
// are lit from within by their own material; what they lack, where the pool of real lamps is off (the low preset), is the light they give the things round them.
// Here it is made of geometry in the engine's one additive material `halo` (palette.js, materials.js 'halo'): light ADDED over what is behind it, at night
// only, no light, no shadow, no collision. The pattern is that of Suzhou's nightlight.js, copied and adapted (nothing imported from it): a glow round each
// flame (three crossed discs), a pool on the paving, the sheet of a lit window's lattice. All of it a function of the lamp's own place: no counters, no
// Math.random. The street's halos are `agra_halo` elements of the street life (instanced, drawn within 60 m of the eye), the houses' lit windows go into the
// houses' own meshes.

import { BufferGeometry, Float32BufferAttribute, Matrix4, Quaternion, Vector3 } from '../../core/three.js';
import { placeHanging } from '../../core/geom.js';
import { STYLES } from '../../core/build.js';
import { assembly } from '../../objects/kit.js';
import { houses, KATRAS, STREETS, FORECOURT, GATE, RADIUS, PLINTH, GARDEN } from './layout.js';
import { layoutOf, FH } from '../../styles/mughal/townhouse.js';
import { rows, cells, BZ } from './cells.js';

/** A number in [0, 1) from a position alone. */
export function hashAt(x, z, s = 0) {
  let h = (Math.round(x * 16) * 73856093) ^ (Math.round(z * 16) * 19349663) ^ Math.imul(s + 1, 83492791);
  h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
/** The share of the bazaar's shops whose lamps are lit and whose fronts throw light on the street in the evening [inferred: the bazaars kept open after dusk]. */
export const SHOP_LIT = 0.7;
/** The share of the lattice windows of the houses with a lamp behind them [inferred: a household's lamp burns in some rooms, not all]. */
export const WINDOW_LIT = 0.3;
/** Off: the lit windows put the halo material into the houses' merged plans, one more main draw at the arrival (+3, the budget allows +2). Built and checked; switch on when the budget has room. */
export const LIT_WINDOWS = false;

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
  /** A disc lying on a horizontal plane at height y. */
  floor(x, y, z, r, rz = r, yaw = 0, segs = 8, k = 1) {
    const s = Math.sin(yaw), c = Math.cos(yaw);
    this.disc([x, y, z], [c, 0, -s], [s, 0, c], r, rz, null, segs, [k, 0.42 * k, 0], [0, 0.5, 1]);
  }
  /** The glow round a flame at (x, y, z), radius r: three upright discs crossed at 60 degrees. */
  ball(x, y, z, r) {
    for (let k = 0; k < 3; k++) { const a = k * Math.PI / 3, c = Math.cos(a), s = Math.sin(a); this.disc([x, y, z], [c, 0, s], [0, 1, 0], r, r, [-s, c], 8, [0.62, 0], [0, 1]); }
  }
  /** A flat sheet (a window's lit lattice) of brightness f, facing n = [x, z] (both faces are seen). */
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

// ── the street's halos: one instanced element per lamp ────────────────────────────────────────────────────────
// { t: 'agra_halo', at, y, rot, kind }: 'ball' a hanging lamp (the glow at the origin, its pool 2.5 m below); 'torch' the mashal on its stand (flame 2.2 m up);
// 'low' a brazier of coals; 'spill' the lamp-light of an open front across the step (a pool on the ground, out along +z)
function unitOf(kind) {
  return assembly(`agra-halo|${kind}`, (a) => {
    const H = new Halo();
    if (kind === 'ball') { H.ball(0, 0, 0, 0.9 * 0.95); H.floor(0, -2.47, 0, 2.5 * 0.9 * 0.55, 2.5 * 0.9 * 0.55, 0, 8, 0.8); }
    else if (kind === 'torch') { H.ball(0, 2.25, 0, 1.2); H.floor(0, 0.05, 0, 2.3, 2.3, 0, 8, 0.85); }
    else if (kind === 'chirag') { H.ball(0.05, 0.07, 0, 0.32); H.floor(0.05, 0.02, 0, 0.9, 0.9, 0, 8, 0.7); }
    else if (kind === 'low') { H.ball(0, 0.42, 0, 0.8); H.floor(0, 0.04, 0, 2.0, 2.0, 0, 8, 0.8); }
    else H.floor(0, 0.06, 1.2, 1.7, 1.3, 0, 10, 0.85);
    const g = new BufferGeometry(); g.setAttribute('position', new Float32BufferAttribute(H.pos, 3)); g.setAttribute('normal', new Float32BufferAttribute(H.nor, 3)); a(MAT, g);
  });
}
const HALO_REACH = 60;
function agraHalo(el, { bag }) {
  const U = unitOf(el.kind), [x, z] = el.at;
  const M = new Matrix4().compose(new Vector3(x, el.y ?? 0, z), new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), el.rot ?? 0), new Vector3(1, 1, 1));
  for (const [mat, g] of Object.entries(U)) { if (bag.addInstance) bag.addInstance(mat, g.clone(), M, { reach: HALO_REACH }); else bag.add(mat, placeHanging(g.clone(), M)); }
}

// ── where the lamps are ─────────────────────────────────────────────────────────────────────────────────────────
function rngOf(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
/** The side of a shop front the hanging lamp is on, as styles/mughal/fronts.js chooses it (the first draw of the lot's own stream). */
const lampSide = (h) => (rngOf((((h.seed | 0) * 13 + 5) >>> 0))() < 0.5 ? -1 : 1);
/** The shop fronts' hanging lamps: { at, y (the hook), rot, lit, spill: [x, z, rot] }. */
export function shopLamps() {
  const out = [];
  for (const h of houses()) {
    if (!h.shop) continue;
    const L = layoutOf(h), { f, hw } = L, side = lampSide(h), at = f.pt(-side * (hw * 0.5), 0.04), lit = hashAt(at[0], at[1], 5) < SHOP_LIT;
    out.push({ at, y: FH - 0.4, rot: f.yaw, lit, spill: f.pt(0, 0.3), spillRot: f.yaw });
  }
  return out;
}
/** The doors of the houses that stand open, and whether a hearth's light spills from them. */
export function doorGlows() {
  const out = [];
  for (const h of houses()) {
    if (h.shop) continue;
    const L = layoutOf(h); if (!L.enter) continue;
    const p = L.f.pt(L.dx, 0.2);
    if (hashAt(p[0], p[1], 7) < 0.45) out.push({ at: p, rot: L.f.yaw });
  }
  return out;
}
/** The mashal stands either side of each gate's arch, on both faces: [{ at, rot }]. */
export function mashals() {
  const out = [], put = (cx, cz, axis, w, d, aw) => {
    for (const sg of [-1, 1]) for (const side of [-1, 1]) {
      const t = sg * (d / 2 + 0.45), c = side * (aw / 2 + 0.75), at = axis === 'x' ? [cx + t, cz + c] : [cx + c, cz + t];
      out.push({ at, rot: axis === 'x' ? (sg > 0 ? Math.PI / 2 : -Math.PI / 2) : (sg > 0 ? 0 : Math.PI) });
    }
  };
  const [fx0, , fx1, fz1] = FORECOURT;
  put(fx1, BZ, 'x', 20, 8, 6); put(fx0, BZ, 'x', 20, 8, 6); put(0, fz1, 'z', 20, 8, 6);
  for (const k of KATRAS) { const zc = (k.rect[1] + k.rect[3]) / 2; put(k.gate === 'e' ? k.rect[2] : k.rect[0], zc, 'x', 12, 8, 4.4); }
  // the great gate's south face: a stand either side of the iwan
  for (const s of [-1, 1]) out.push({ at: [s * 8.4, GATE.c[1] + GATE.d / 2 + 1.0], rot: 0 });
  return out;
}
/** The braziers of the caravanserais' courts: coals under the merchants' pots, one in each court, by the north verandah. */
export function braziers() { return KATRAS.map((k) => { const cx = (k.rect[0] + k.rect[2]) / 2, zc = (k.rect[1] + k.rect[3]) / 2; return { at: [cx - (k.gate === 'e' ? 1 : -1) * 1.2, zc - 4.6] }; }); }

/**
 * The chirags (clay oil lamps) of the garden: a row along the coping of each arm of the central channel's long arm (the marble kerb, 0.55 m up), and a row on the
 * plinth's south edge either side of the stairs. [inferred: Mughal gardens were lit with rows of clay lamps on the channels' kerbs and in niches on festival nights, the
 * Taj's own yearly urs of Mumtaz Mahal among them; no 1653 account of the Taj's lamps was found, and the tomb's chamber and the mosque keep their own lighting.]
 */
export function chirags() {
  const out = [], z0 = GARDEN[1] + 6, z1 = -16;
  for (let z = z0; z <= z1; z += 5) for (const s of [-1, 1]) out.push({ at: [s * 3.3, z], y: 0.55 });
  const pz = PLINTH.c[1] + PLINTH.a - 0.7;
  for (let x = 9; x <= 44; x += 5) for (const s of [-1, 1]) out.push({ at: [s * x, pz], y: PLINTH.y });
  return out;
}

/** The street life's elements for the night: the lamps themselves (agra_lamp, lamps.js) and their halos. `inDisc` keeps them within the settlement. */
export function nightElements(inDisc = () => true) {
  const out = [];
  for (const l of shopLamps()) {
    if (!inDisc(l.at)) continue;
    if (l.lit) { out.push({ t: 'agra_halo', kind: 'ball', at: l.at, y: 0.02 + 2.5, rot: l.rot }); out.push({ t: 'agra_halo', kind: 'spill', at: l.spill, y: 0.04, rot: l.spillRot }); }
  }
  for (const d of doorGlows()) if (inDisc(d.at)) out.push({ t: 'agra_halo', kind: 'spill', at: d.at, y: 0.04, rot: d.rot });
  for (const m of mashals()) if (inDisc(m.at)) { out.push({ t: 'agra_lamp', kind: 'stand', at: m.at, y: 0, rot: m.rot }); out.push({ t: 'agra_halo', kind: 'torch', at: m.at, y: 0, rot: m.rot }); }
  for (const c of chirags()) { out.push({ t: 'agra_lamp', kind: 'chirag', at: c.at, y: c.y, rot: 0 }); out.push({ t: 'agra_halo', kind: 'chirag', at: c.at, y: c.y, rot: 0 }); }
  for (const b of braziers()) { out.push({ t: 'agra_lamp', kind: 'brazier', at: b.at, y: 0.04, rot: 0 }); out.push({ t: 'agra_halo', kind: 'low', at: b.at, y: 0.04, rot: 0 }); }
  // the opened cells of the forecourt: the lamp on its chain inside (cells.js hangs it 1.75 m below the beam) and the light across the verandah
  for (const r of rows()) for (const c of cells(r)) {
    out.push({ t: 'agra_halo', kind: 'ball', at: [c.xc, c.zc - r.s * 1.85], y: 0.35 + 2.48, rot: 0 });
    out.push({ t: 'agra_halo', kind: 'spill', at: [c.xc, r.z + r.s * 0.2], y: 0.4, rot: r.s > 0 ? 0 : Math.PI });
  }
  // the shut cells of the forecourt's bazaar rows: the keeper's clay lamp (a chirag) set on the verandah beside the door, and its light across the step
  // [inferred: the bazaar's cells "were used to sell goods" (Wikipedia, Origins and architecture of the Taj Mahal) and stayed open into the evening]
  for (const r of rows()) for (let k = 0; k < r.n; k++) {
    if (k >= r.open[0] && k < r.open[1]) continue;
    const xc = r.x0 + (k + 0.5) * r.bw;
    if (hashAt(xc, r.z, 31) >= 0.75) continue;
    const side = hashAt(xc, r.z, 33) < 0.5 ? -1 : 1, at = [xc + side * 0.95, r.z - r.s * 1.6];
    out.push({ t: 'agra_lamp', kind: 'chirag', at, y: 0.35, rot: 0 }); out.push({ t: 'agra_halo', kind: 'chirag', at, y: 0.35, rot: 0 });
    out.push({ t: 'agra_halo', kind: 'spill', at: [xc, r.z + r.s * 0.2], y: 0.4, rot: r.s > 0 ? 0 : Math.PI });
  }
  return out;
}

// ── the lit windows ───────────────────────────────────────────────────────────────────────────────────────────
/** The leaves of a geometry that are windows: groups of touching triangles that make a thin upright slab at least 0.3 m wide and high, each { x0, y0, z0, x1, y1, z1 }. */
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
function panesOf(H, b, off, share) {
  const thinX = b.x1 - b.x0 < b.z1 - b.z0, m = 0.035, y0 = b.y0 + m, y1 = b.y1 - m;
  if (y1 - y0 < 0.15) return;
  const lit = hashAt(Math.floor((b.x0 + b.x1) / 8) * 4, Math.floor((b.z0 + b.z1) / 8) * 4, 11 + Math.floor((b.y0 + b.y1) / 6)) < share;
  if (!lit) return;
  const f = 0.42 + 0.36 * hashAt((b.x0 + b.x1) / 2, (b.z0 + b.z1) / 2, 23 + Math.floor(b.y0 / 2.5));
  if (thinX) { const z0 = b.z0 + m, z1 = b.z1 - m; for (const [x, nx] of [[b.x1 + off, 1], [b.x0 - off, -1]]) H.quad([x, y0, z0], [x, y0, z1], [x, y1, z1], [x, y1, z0], [nx, 0], f); }
  else { const x0 = b.x0 + m, x1 = b.x1 - m; for (const [z, nz] of [[b.z1 + off, 1], [b.z0 - off, -1]]) H.quad([x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z], [0, nz], f); }
}
const LIT = Symbol('lit windows');
/** Wrap a builder context so that the lattice windows it makes (`lattice` slabs: the jali of the jharokhas and the windows) glow at night where their room is lit. */
export function litWindows(ctx, share = WINDOW_LIT) {
  if (ctx.bag?.[LIT]) return { ctx, finish: () => {} };
  const H = new Halo(), real = ctx.bag;
  const bag = new Proxy(real, {
    get(t, k) {
      if (k === LIT) return true;
      if (k === 'add') return (mat, g) => { if (mat === 'lattice' && g?.attributes?.position) for (const b of slabsOf(g, 0.2)) panesOf(H, b, 0.03, share); return t.add(mat, g); };
      const v = t[k];
      return typeof v === 'function' ? v.bind(t) : v;
    },
  });
  return { ctx: { ...ctx, bag }, finish: () => H.flush(real) };
}
function wrapElement(style, name, share) {
  const S = STYLES[style];
  if (!S?.elements[name] || S.elements[name].__lit) return;
  const base = S.elements[name];
  const f = (el, ctx) => { const L = litWindows(ctx, share); base(el, L.ctx); L.finish(); };
  f.__lit = true;
  S.elements[name] = f;
}
/** Register the street life's halo element and the lit windows of the town houses. */
export function registerNight() {
  if (STYLES.life) STYLES.life.elements.agra_halo = agraHalo;
  if (LIT_WINDOWS) wrapElement('mughal', 'haveli', WINDOW_LIT);
}
void STREETS; void RADIUS;
registerNight();
