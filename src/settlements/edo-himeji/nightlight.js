// Edo Himeji by night, the light its lanterns, watch fires and lit rooms throw (docs/settlements/edo-himeji.md §10).
// The paper lanterns (lamp_paper: chōchin at the eaves, at the samurai gates, in the storehouses; lamp_white: the standing
// andon of the rooms) are lit from within by their own material; what they lack, where the pool of real lamps is off (the
// low preset), is the light they give the things round them. Here it is made of geometry in one material, `halo` (palette.js,
// materials.js 'halo'): light ADDED over what is behind it, at night only, with no light, no shadow and no collision, so the
// day view is unchanged. The shape of each piece is carried by its normals (y: 1 at a disc's middle, 0 at its rim): a glow
// round each flame (three crossed discs), a pool on the ground under it, a streak on the moat under a watch fire at its
// edge, and a sheet in front of the paper (shoji) or the lattice (koshi) of a window, the lamp of the room within.
// Everything is a function of the lamp's own place (hashAt): no counters, no Math.random.
// What lit an Edo castle town at night is in the dossier §10; electric light has no place here.
// The method is that of the Suzhou reference (the same material), written here for the Himeji lamps; nothing of Suzhou's is imported.

import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';
import { box, lathe, rod } from '../../core/geom.js';
import { STYLES } from '../../core/build.js';
import { chochin } from '../../styles/edo/town.js';
import { LEVEL } from './layout.js';

/** A number in [0, 1) from a position alone. */
export function hashAt(x, z, s = 0) {
  let h = (Math.round(x * 16) * 73856093) ^ (Math.round(z * 16) * 19349663) ^ Math.imul(s + 1, 83492791);
  h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

const TAU = Math.PI * 2, MAT = 'halo';
/** Triangles (position and a normal per corner) of the halo material; the brightness is the normal's y (1 at a disc's middle, 0 at its rim; negative on water). */
export class Halo {
  constructor() { this.pos = []; this.nor = []; }
  tri(p0, n0, p1, n1, p2, n2) { this.pos.push(...p0, ...p1, ...p2); this.nor.push(...n0, ...n1, ...n2); }
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
  /** A disc lying flat at height y (the ground, a floor, the water: the ripple-broken kind), k its strength. */
  floor(x, y, z, r, rz = r, yaw = 0, segs = 8, water = false, k = 1) {
    const s = Math.sin(yaw), c = Math.cos(yaw);
    this.disc([x, y, z], [c, 0, -s], [s, 0, c], r, rz, null, segs, [k, 0.42 * k, 0], [0, 0.5, 1], water ? -1 : 1);
  }
  /** The glow round a flame: three upright discs crossed at 60 degrees. */
  ball(x, y, z, r, k = 0.62) {
    for (let i = 0; i < 3; i++) { const a = i * Math.PI / 3 + 0.37, c = Math.cos(a), s = Math.sin(a); this.disc([x, y, z], [c, 0, s], [0, 1, 0], r, r, [-s, c], 8, [k, 0], [0, 1]); }
  }
  /** A flat sheet (a window's lamp-lit paper) of brightness f, facing n = [x, z] (both faces are seen). */
  quad(a, b, c, d, n, f) { const q = Math.sqrt(1 - f * f), N = [n[0] * q, f, n[1] * q]; this.tri(a, N, b, N, c, N); this.tri(a, N, c, N, d, N); }
  flush(bag) {
    if (!this.pos.length) return;
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute(this.pos, 3)); g.setAttribute('normal', new Float32BufferAttribute(this.nor, 3));
    bag.add(MAT, g); this.pos = []; this.nor = [];
  }
}

// ── the watch fire (kagaribi): an iron basket on a tripod, split pine in it ───────────────────────────
/**
 * The kagaribi of the castle's gates (docs §10): a basket of iron straps on three legs, pine billets in it, the glow, its pool
 * on the ground and, where the moat lies beside it (`water`: [dx, dz] toward it, d metres off), its streak on the water.
 * Unlit by day (the cold billets); the fire is the halo, shown at night only.
 */
export function kagaribi(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, H = new Halo();
  for (let k = 0; k < 3; k++) { const a = k * TAU / 3 + 0.5, c = Math.cos(a), s = Math.sin(a); bag.add('iron', rod([x + c * 0.5, y, z + s * 0.5], [x + c * 0.22, y + 0.95, z + s * 0.22], 0.025, 5)); }
  bag.add('iron', lathe([[0.001, 0], [0.14, 0], [0.3, 0.2], [0.34, 0.34], [0.32, 0.36], [0.28, 0.34], [0.12, 0.05], [0.001, 0.05]], 8, null, x, y + 0.93, z));
  for (let k = 0; k < 4; k++) bag.add('iron', rod([x + Math.cos(k * 1.57) * 0.16, y + 0.98, z + Math.sin(k * 1.57) * 0.16], [x + Math.cos(k * 1.57) * 0.33, y + 1.27, z + Math.sin(k * 1.57) * 0.33], 0.014, 4));
  for (let k = 0; k < 5; k++) { const a = k * 1.26 + 0.3, c = Math.cos(a), s = Math.sin(a); bag.add('wood_dark', rod([x + c * 0.15, y + 1.04, z + s * 0.15], [x - c * 0.05 + s * 0.05, y + 1.4 + (k % 2) * 0.06, z - s * 0.05 - c * 0.05], 0.045, 5)); }
  bag.add('iron', box(x - 0.2, y + 1.0, z - 0.2, x + 0.2, y + 1.07, z + 0.2));
  H.ball(x, y + 1.5, z, 1.25, 0.7); H.floor(x, y + 0.04, z, 3.4, 3.4, 0, 10, false, 0.85);
  if (el.water) {
    const [dx, dz] = el.water, d = el.d ?? 3, a = 2.4;
    H.floor(x + dx * (d + a * 0.5), (el.wy ?? LEVEL.water) + 0.02, z + dz * (d + a * 0.5), 0.75, a, Math.atan2(dx, dz), 10, true);
  }
  H.flush(bag);
  col.rect([x - 0.45, z - 0.45, x + 0.45, z + 0.45], y, y + 1.4);
}

// ── lamps found in what a builder makes: a halo for each paper lantern ───────────────────────────────
const bounds = (g) => {
  const P = g.attributes.position.array, b = [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity];
  for (let i = 0; i < P.length; i += 3) for (let k = 0; k < 3; k++) { if (P[i + k] < b[k]) b[k] = P[i + k]; if (P[i + k] > b[k + 3]) b[k + 3] = P[i + k]; }
  return b;
};
/**
 * The light of one lamp (the bounds of its shade) into H: `base` the ground or floor of the element it is in. A lantern hung at an eave or a
 * gate (1.9 to 3.1 m up) lights the ground below it; one higher up (an upper room) or lower (the andon on a floor) only its own glow.
 */
function lampLight(H, b, base) {
  const cx = (b[0] + b[3]) / 2, cz = (b[2] + b[5]) / 2, cy = (b[1] + b[4]) / 2, r = Math.max(b[3] - b[0], b[5] - b[2]) / 2, s = Math.max(0.7, Math.min(1.5, r / 0.16)), h = cy - base;
  if (h > 1.9 && h < 3.1) { H.ball(cx, cy, cz, 0.85 * s); H.floor(cx, base + 0.04, cz, 1.9 * s, 1.9 * s, 0, 8, false, 0.7); }
  else H.ball(cx, cy, cz, h > 3.1 ? 0.7 : 0.5, 0.55);
}

// ── the lit windows ──────────────────────────────────────────────────────────────────────────────
/** The leaves of a geometry that are windows: groups of touching triangles that make a thin upright slab, in a plane along x or z, at least 0.3 m wide and high. */
function slabsOf(g, thick = 0.2) {
  const gg = g.index ? g.toNonIndexed() : g, P = gg.attributes.position.array, n = P.length / 9;
  const par = new Int32Array(n).map((_, i) => i), find = (i) => { while (par[i] !== i) { par[i] = par[par[i]]; i = par[i]; } return i; };
  const seen = new Map();
  for (let t = 0; t < n; t++) for (let v = 0; v < 3; v++) {
    const k = `${Math.round(P[t * 9 + v * 3] * 400)},${Math.round(P[t * 9 + v * 3 + 1] * 400)},${Math.round(P[t * 9 + v * 3 + 2] * 400)}`;
    const o = seen.get(k);
    if (o === undefined) seen.set(k, t); else { const a = find(o), b = find(t); if (a !== b) par[b] = a; }
  }
  const bx = new Map();
  for (let t = 0; t < n; t++) {
    const r = find(t);
    let b = bx.get(r);
    if (!b) bx.set(r, (b = { x0: Infinity, y0: Infinity, z0: Infinity, x1: -Infinity, y1: -Infinity, z1: -Infinity }));
    for (let v = 0; v < 3; v++) {
      const x = P[t * 9 + v * 3], y = P[t * 9 + v * 3 + 1], z = P[t * 9 + v * 3 + 2];
      if (x < b.x0) b.x0 = x; if (x > b.x1) b.x1 = x; if (y < b.y0) b.y0 = y; if (y > b.y1) b.y1 = y; if (z < b.z0) b.z0 = z; if (z > b.z1) b.z1 = z;
    }
  }
  const out = [];
  for (const b of bx.values()) {
    const dx = b.x1 - b.x0, dz = b.z1 - b.z0, dy = b.y1 - b.y0, th = Math.min(dx, dz), w = Math.max(dx, dz);
    if (th > thick || w < 0.3 || dy < 0.3 || th < 0.002) continue;
    out.push(b);
  }
  return out;
}
/** The lit panes for one slab: a sheet a hair off each of its two faces (the leaf less a frame's width), each room its own strength by the hash of its place. */
function panesOf(H, b, off) {
  const thinX = b.x1 - b.x0 < b.z1 - b.z0, m = 0.035, y0 = b.y0 + m, y1 = b.y1 - m;
  if (y1 - y0 < 0.15) return;
  const f = 0.5 + 0.4 * hashAt((b.x0 + b.x1) / 2, (b.z0 + b.z1) / 2, 23 + Math.floor(b.y0 / 2.5));     // (oil is dear: a small andon, 0.5 to 0.9)
  if (thinX) {
    const z0 = b.z0 + m, z1 = b.z1 - m;
    for (const [x, nx] of [[b.x1 + off, 1], [b.x0 - off, -1]]) H.quad([x, y0, z0], [x, y0, z1], [x, y1, z1], [x, y1, z0], [nx, 0], f);
  } else {
    const x0 = b.x0 + m, x1 = b.x1 - m;
    for (const [z, nz] of [[b.z1 + off, 1], [b.z0 - off, -1]]) H.quad([x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z], [0, nz], f);
  }
}
/** Materials whose slabs are windows (paper and the lattice of the houses) and the sheet's distance off them. */
const WINDOW = { shoji: 0.03, koshi: 0.055 };
const LAMP = new Set(['lamp_paper', 'lamp_white']);
const LIT = Symbol('lit');
/**
 * Wrap a builder context so that what it makes glows at night: each leaf of paper (shoji) or lattice (koshi) gets a pane of lamp-light on each
 * face if its room (a cell of the town by hash: 8 m squares, by storey) is one of those lit, `share` of them; each lantern and andon (a glow
 * shade) gets its halo, `lanterns` of them. `base` is the element's ground. Returns { ctx, finish }: call finish() once the element is built.
 */
export function litWindows(ctx, share = 0.4, base = 0, lanterns = 0.65) {
  if (ctx.bag?.[LIT]) return { ctx, finish: () => {} };
  const H = new Halo(), real = ctx.bag;
  const lit = (b) => hashAt(Math.floor((b.x0 + b.x1) / 8) * 4, Math.floor((b.z0 + b.z1) / 8) * 4, 11 + Math.floor((b.y0 + b.y1) / 6)) < share;
  const bag = new Proxy(real, {
    get(t, k) {
      if (k === LIT) return true;
      if (k === 'add') return (mat, g, ...r) => {
        if (typeof mat === 'string' && g?.attributes?.position) {
          const off = WINDOW[mat];
          if (off !== undefined) { for (const b of slabsOf(g, 0.2)) if (lit(b)) panesOf(H, b, off); }
          else if (LAMP.has(mat)) { const b = bounds(g); if (hashAt((b[0] + b[3]) / 2, (b[2] + b[5]) / 2, 31) < lanterns) lampLight(H, b, base); }
        }
        return t.add(mat, g, ...r);
      };
      const v = t[k];
      return typeof v === 'function' ? v.bind(t) : v;
    },
  });
  return { ctx: { ...ctx, bag }, finish: () => H.flush(real) };
}
function wrapElement(name, share, lanterns = 0.65, extra = null) {
  const S = STYLES.edo, base = S?.elements[name];
  if (!base || base.__lit) return;
  const f = (el, ctx) => { const L = litWindows(ctx, el.litShare ?? share, el.y ?? 0, lanterns); base(el, L.ctx); if (extra) extra(el, L.ctx); L.finish(); };
  f.__lit = true;
  S.elements[name] = f;
}

/** The fire-watch tower's lamp: a paper lantern hung under its little roof, at the platform. */
function watchLamp(el, ctx) {
  const [x, z] = el.at, y = el.y ?? 0, ph = y + (el.h ?? 9), s = 1.5, e = s * 0.75 + 0.35;
  chochin(ctx.bag, x + e - 0.35, ph + 2.15, z, 0.15, 0.38);
}
/** A votive lamp (tōmyō) lit at a roadside Jizō's and the Inari shrine: a little glow at the front. */
function votive(el, ctx) {
  const [x, z] = el.at, y = el.y ?? 0, a = el.rot ?? 0, c = Math.cos(a), s = Math.sin(a), H = new Halo();
  const q = el.t === 'inari' ? 1.0 : 0.5, v = el.t === 'inari' ? 1.0 : 0.55, u = el.t === 'inari' ? 0.45 : 0;
  const px = x + u * c + q * s, pz = z - u * s + q * c;
  H.ball(px, y + v, pz, 0.55, 0.6); H.floor(px, y + 0.04, pz, 1.6, 1.6, 0, 8, false, 0.55);
  H.flush(ctx.bag);
}
/** Register the elements and the lit windows and lanterns of the houses, the halls, the gates, the stores and the turrets. */
export function registerNight() {
  if (!STYLES.edo) return;
  STYLES.edo.elements.kagaribi = kagaribi;
  for (const [name, share, lanterns] of [['machiya', 0.42, 0.75], ['yashiki', 0.4, 0.8], ['goten', 0.6, 0.9], ['kura_in', 0.5, 0.9], ['yagura', 0.35, 0.9], ['yagura_mon', 0.35, 1], ['hishi_mon', 0.4, 1], ['kabuki_mon', 0.3, 1], ['watari', 0.3, 0.9]]) wrapElement(name, share, lanterns);
  wrapElement('hinomi_yagura', 0, 1, watchLamp);
  wrapElement('jizo', 0, 0, votive); wrapElement('inari', 0, 0, votive);
}
registerNight();
