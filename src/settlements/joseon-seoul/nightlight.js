// Hanyang by night, c. 1888: the light its lanterns, watch fires, hearths, lit rooms and the first electric lamps throw (docs/settlements/joseon-seoul.md §19).
// The shades (lamp_paper, lamp_white, lamp_glass) are lit from within by their own material; what they lack, where the pool of real lamps is off
// (the low preset), is the light they give the things round them. It is made here of geometry in one material, `halo` (palette.js, materials.js
// 'halo'): light ADDED over what is behind it, at night only, with no light, no shadow and no collision, so the day view is unchanged. The shape of
// each piece is carried by its normals (y: 1 at a disc's middle, 0 at its rim): a glow round each flame (three crossed discs), a pool on the ground
// or a floor, a sheet in front of the paper of a lit window. The method is that of the Suzhou reference (the same material), written here for
// Hanyang's lamps; nothing of Suzhou's is imported. Everything is a function of the lamp's own place (hashAt): no counters, no Math.random.
// What lit Hanyang at night is in the dossier §19: oil lamps behind the hanji of the windows, silk lanterns (sachorong) at the palace gates, the
// guards' fire baskets, the hearths of the kitchens and the ondol, paper lanterns at the shops until the bell; and, from 1887, the electric lamps
// of Geoncheonggung.

import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';
import { lathe, rod } from '../../core/geom.js';
import { STYLES } from '../../core/build.js';
import { Parts } from '../../styles/qing/carving.js';
import { homeLayout, classOf } from '../../styles/joseon/home.js';
import { rangeFrame } from '../../styles/joseon/house.js';

/** A number in [0, 1) from a position alone. */
export function hashAt(x, z, s = 0) {
  let h = (Math.round(x * 16) * 73856093) ^ (Math.round(z * 16) * 19349663) ^ Math.imul(s + 1, 83492791);
  h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

const TAU = Math.PI * 2, MAT = 'halo';
/** Triangles (position and a normal per corner) of the halo material; the brightness is the normal's y. */
export class Halo {
  constructor() { this.pos = []; this.nor = []; }
  get empty() { return !this.pos.length; }
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
  /** A disc lying flat at height y (the ground, a floor), k its strength. */
  floor(x, y, z, r, rz = r, yaw = 0, segs = 8, k = 1) {
    const s = Math.sin(yaw), c = Math.cos(yaw);
    this.disc([x, y, z], [c, 0, -s], [s, 0, c], r, rz, null, segs, [k, 0.42 * k, 0], [0, 0.5, 1]);
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

// ── the lamps of the palace ──────────────────────────────────────────────────────────────────────
/** A silk lantern (sachorong) hung from its hook at the origin: a six-sided body of red silk with blue silk at its cap and foot, a tassel; about 0.62 m from hook to tassel at k = 1. [inferred: the form of the palace's silk lanterns] */
function sachorong(P, k = 1) {
  P.add('lacquer_black', rod([0, 0, 0], [0, -0.1 * k, 0], 0.006 * k, 3));
  P.add('lacquer_black', lathe([[0.001, -0.1 * k], [0.09 * k, -0.1 * k], [0.1 * k, -0.14 * k], [0.001, -0.14 * k]], 6));
  P.add('lamp_paper', lathe([[0.1 * k, -0.14 * k], [0.17 * k, -0.2 * k], [0.18 * k, -0.34 * k], [0.17 * k, -0.48 * k], [0.1 * k, -0.54 * k]], 6));
  P.add('lacquer_black', lathe([[0.001, -0.54 * k], [0.1 * k, -0.54 * k], [0.09 * k, -0.58 * k], [0.001, -0.58 * k]], 6));
  P.add('lacquer_red', rod([0, -0.58 * k, 0], [0, -0.72 * k, 0], 0.012 * k, 4));
}
/** An electric lamp of 1887 (an Edison incandescent bulb, bare, on its twisted cord): a glass bulb 0.07 m across and a brass cap; hook at the origin, 0.34 m long. [inferred: bare bulbs on flex] */
function bulb(P) {
  P.add('lacquer_black', rod([0, 0, 0], [0, -0.16, 0], 0.005, 3));
  P.add('bronze', lathe([[0.001, -0.16], [0.022, -0.16], [0.022, -0.2], [0.001, -0.2]], 6));
  P.add('lamp_glass', lathe([[0.022, -0.2], [0.05, -0.25], [0.062, -0.29], [0.05, -0.33], [0.02, -0.35], [0.001, -0.35]], 8));
}
/** A fire basket (a brazier of iron straps on three legs, split pine in it), on the ground at the origin; 1.0 m high. */
function basket(P) {
  for (let k = 0; k < 3; k++) { const a = k * TAU / 3 + 0.5, c = Math.cos(a), s = Math.sin(a); P.add('iron', rod([c * 0.4, 0, s * 0.4], [c * 0.18, 0.7, s * 0.18], 0.022, 5)); }
  P.add('iron', lathe([[0.001, 0.68], [0.12, 0.68], [0.26, 0.86], [0.3, 0.98], [0.28, 1.0], [0.24, 0.98], [0.1, 0.74], [0.001, 0.74]], 8));
  for (let k = 0; k < 4; k++) { const a = k * 1.57 + 0.3, c = Math.cos(a), s = Math.sin(a); P.add('wood_dark', rod([c * 0.12, 0.76, s * 0.12], [-c * 0.04 + s * 0.04, 1.12 + (k % 2) * 0.05, -s * 0.04 - c * 0.04], 0.04, 5)); }
}

/**
 * seoul_lanterns { list: [{ x, y (the hook), z, k, fy (the floor under it), wall? ({ n: [x, z] outward, d }) , kind ('silk' | 'bulb') }] }: the lanterns the palace hung, each with its
 * light. Merged per material into the plan's one piece; each one's turn from the hash of its own place.
 */
function lanternsEl(el, { bag }) {
  const all = new Parts(), H = new Halo();
  for (const l of el.list) {
    const P = new Parts(), bulbs = l.kind === 'bulb';
    if (bulbs) bulb(P); else sachorong(P, l.k ?? 1);
    P.emit(all, l.x, l.y, l.z, hashAt(l.z, l.x) * TAU);
    const k = l.k ?? 1, body = bulbs ? 0.3 : 0.34 * k;
    H.ball(l.x, l.y - body, l.z, bulbs ? 0.9 : 0.95 * k, bulbs ? 0.75 : 0.62);
    H.floor(l.x, l.fy + 0.03, l.z, bulbs ? 2.8 : 2.6 * k, bulbs ? 2.8 : 2.6 * k, 0, 8, bulbs ? 0.9 : 1);
  }
  all.emit(bag, 0, 0, 0);
  H.flush(bag);
}
/** seoul_fires { list: [{ x, z, y }] }: fire baskets of the guards, standing, with their glow and the pool on the ground. */
function firesEl(el, { bag, col }) {
  const all = new Parts(), H = new Halo();
  for (const f of el.list) {
    const P = new Parts(); basket(P);
    P.emit(all, f.x, f.y ?? 0, f.z, hashAt(f.x, f.z) * TAU);
    H.ball(f.x, (f.y ?? 0) + 1.25, f.z, 1.25, 0.7); H.floor(f.x, (f.y ?? 0) + 0.04, f.z, 3.6, 3.6, 0, 10, 0.85);
    col.circle(f.x, f.z, 0.34, f.y ?? 0, (f.y ?? 0) + 1.0);
  }
  all.emit(bag, 0, 0, 0);
  H.flush(bag);
}
/** seoul_halo { list: [{ x, y, z, s?, fy? }] }: only the light of lanterns another element hangs (the life plans' lanterns): a glow, and a pool on the ground below. */
function haloEl(el, { bag }) {
  const H = new Halo();
  for (const l of el.list) { const s = l.s ?? 1; H.ball(l.x, l.y, l.z, 0.8 * s, 0.55); H.floor(l.x, (l.fy ?? 0) + 0.04, l.z, 1.9 * s, 1.9 * s, 0, 8, 0.6); }
  H.flush(bag);
}

// ── lamps found in what a builder makes: a halo for each shade ──────────────────────────────────
const bounds = (g) => {
  const P = g.attributes.position.array, b = [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity];
  for (let i = 0; i < P.length; i += 3) for (let k = 0; k < 3; k++) { if (P[i + k] < b[k]) b[k] = P[i + k]; if (P[i + k] > b[k + 3]) b[k + 3] = P[i + k]; }
  return b;
};
/** The light of one lamp (the bounds of its shade): a lantern at an eave or a gate (1.9 to 3.2 m over the ground of its element) lights the ground below; a lamp lower (a stand in a room) or higher only itself. */
function lampLight(H, b, base) {
  const cx = (b[0] + b[3]) / 2, cz = (b[2] + b[5]) / 2, cy = (b[1] + b[4]) / 2, r = Math.max(b[3] - b[0], b[5] - b[2]) / 2, s = Math.max(0.7, Math.min(1.5, r / 0.14)), h = cy - base;
  if (h > 1.9 && h < 3.2) { H.ball(cx, cy, cz, 0.85 * s, 0.6); H.floor(cx, base + 0.04, cz, 1.9 * s, 1.9 * s, 0, 8, 0.7); }
  else H.ball(cx, cy, cz, h > 3.2 ? 0.7 : 0.55, 0.55);
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
/** The lit panes for one slab: a sheet a hair off each of its two faces (the leaf less a frame's width), each room its own strength by the hash of its place (an oil lamp: 0.5 to 0.9). */
function panesOf(H, b, off) {
  const thinX = b.x1 - b.x0 < b.z1 - b.z0, m = 0.035, y0 = b.y0 + m, y1 = b.y1 - m;
  if (y1 - y0 < 0.15) return;
  const f = 0.5 + 0.4 * hashAt((b.x0 + b.x1) / 2, (b.z0 + b.z1) / 2, 23 + Math.floor(b.y0 / 2.5));
  if (thinX) {
    const z0 = b.z0 + m, z1 = b.z1 - m;
    for (const [x, nx] of [[b.x1 + off, 1], [b.x0 - off, -1]]) H.quad([x, y0, z0], [x, y0, z1], [x, y1, z1], [x, y1, z0], [nx, 0], f);
  } else {
    const x0 = b.x0 + m, x1 = b.x1 - m;
    for (const [z, nz] of [[b.z1 + off, 1], [b.z0 - off, -1]]) H.quad([x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z], [0, nz], f);
  }
}
const isWindow = (mat) => mat === 'shoji' || mat === 'lattice_red' || mat === 'lattice';
const LAMP = new Set(['lamp_paper', 'lamp_white']);
const LIT = Symbol('lit');
/**
 * Wrap a builder context so that what it makes glows at night: each leaf of paper (shoji) or lattice gets a pane of lamp-light on each face if its
 * room (a cell of the town by hash: 8 m squares, by storey) is one of those lit, `share` of them; each lantern and lamp stand (a glow shade) gets its
 * halo, `lanterns` of them. `base` is the element's ground. Returns { ctx, finish, H }: call finish() once the element is built.
 */
export function litWindows(ctx, share = 0.4, base = 0, lanterns = 0.65) {
  if (ctx.bag?.[LIT]) return { ctx, finish: () => {}, H: new Halo() };
  const H = new Halo(), real = ctx.bag;
  const lit = (b) => hashAt(Math.floor((b.x0 + b.x1) / 8) * 4, Math.floor((b.z0 + b.z1) / 8) * 4, 11 + Math.floor((b.y0 + b.y1) / 6)) < share;
  const bag = new Proxy(real, {
    get(t, k) {
      if (k === LIT) return true;
      if (k === 'add') return (mat, g, ...r) => {
        if (typeof mat === 'string' && g?.attributes?.position) {
          if (isWindow(mat)) { if (share > 0) for (const b of slabsOf(g, 0.2)) if (lit(b)) panesOf(H, b, 0.03); }
          else if (LAMP.has(mat)) { const b = bounds(g); if (hashAt((b[0] + b[3]) / 2, (b[2] + b[5]) / 2, 31) < lanterns) lampLight(H, b, base); }
        }
        return t.add(mat, g, ...r);
      };
      const v = t[k];
      return typeof v === 'function' ? v.bind(t) : v;
    },
  });
  return { ctx: { ...ctx, bag }, finish: () => H.flush(real), H };
}

/** The kitchen fires: where a range has a kitchen, the glow of the stove's mouth (the firing hole low in the stove's front, toward the yard side) and its pool on the earth floor, in the evening's embers for a part of the houses (by the hash of their place). */
function stoves(H, ranges, share) {
  for (const r of ranges) {
    const f = rangeFrame(r), kit = f.spans.find((s) => s.kind === 'kitchen');
    if (!kit) continue;
    const [x, z] = f.P(kit.a1 - 0.8, 1.95);
    if (hashAt(x, z, 41) >= share) continue;
    H.ball(x, 0.3, z, 0.55, 0.7); H.floor(x, 0.04, z, 1.5, 1.5, 0, 8, 0.8);
  }
}

function wrap(S, name, share, lanterns, extra = null) {
  const base = S?.elements[name];
  if (!base || base.__lit) return;
  const f = (el, ctx) => { const L = litWindows(ctx, el.litShare ?? share, el.y ?? 0, lanterns); base(el, L.ctx); if (extra) extra(el, L.H); L.finish(); };
  f.__lit = true;
  S.elements[name] = f;
}

/** Register the elements, and the lit windows and lamps of the houses, the offices, the shops, the bell pavilion and the inner halls. */
export function registerNight() {
  const J = STYLES.joseon, Lf = STYLES.life;
  if (J) {
    J.elements.seoul_lanterns = lanternsEl; J.elements.seoul_fires = firesEl;
    wrap(J, 'hanok_home', 0.42, 0.85, (el, H) => { const L = homeLayout({ ...el, cls: el.cls || classOf(el) }); stoves(H, L.ranges, 0.55); });
    wrap(J, 'hanok', 0.34, 0.6);
    wrap(J, 'yangban_house', 0.6, 0.9, (el, H) => { const [x0, z0] = el.rect; stoves(H, [{ org: [x0 + 5.5, z0 + 1.6], face: 's', L: 5 * 2.75, kinds: [['kitchen', 1], ['anbang', 2], ['daecheong', 1], ['room', 1]] }], 1); });
    wrap(J, 'joseon_precinct_range', 0.55, 0.9, (el, H) => { stoves(H, [el], 0.6); });
    wrap(J, 'sijeon', 0, 1);
    wrap(J, 'bell_pavilion', 0.3, 1);
    wrap(J, 'joseon_inner', 0.5, 0.9);
    wrap(J, 'ming_hall', 0, 0.8);
  }
  if (Lf) Lf.elements.seoul_halo = haloEl;
}
registerNight();

// ── where the palace's lamps hang ────────────────────────────────────────────────────────────────
/**
 * The silk lanterns of the palace at night [inferred: the gates, the cloister of the throne court and the guard posts were lit by silk lanterns and
 * fire baskets; the dossier §19]: under the vaults of Gwanghwamun (a pair in each of the three ways), along the inner side of the throne court's
 * cloister under its eave; and the electric lamps of Geoncheonggung (1887) under the eaves of the king's and the queen's halls [stated: Asiae 2023].
 * Returns { lanterns: [...], fires: [...] } for the palace plan's `seoul_lanterns` and `seoul_fires`.
 */
export function palaceLamps() {
  const lanterns = [], add = (x, y, z, fy, k = 1, kind = 'silk') => lanterns.push({ x, y, z, fy, k, kind });
  // Gwanghwamun: in each of the three ways, a pair at the quarter points of the arch, hung from the vault (the painted boards are at the crown)
  for (const c of [-8, 0, 8]) for (const dx of [-1.7, 1.7]) for (const z of [233, 239]) add(c + dx, 5.2, z, 0, 1);
  // the cloister of the throne court (cx −62…62, z −18…88): along the inner side of each run under the eave, one every 11 m
  for (const s of [-1, 1]) for (let z = -8; z <= 80; z += 11) add(s * 60.4, 3.0, z, 0.3, 0.95);
  for (let x = -50; x <= 50; x += 10) { if (Math.abs(x) < 14) continue; add(x, 3.0, -16.4, 0.3, 0.95); add(x, 3.0, 86.4, 0.3, 0.95); }
  // Geoncheonggung's electric lamps: three under the south eave of each hall
  for (const x of [-160, -150, -140]) add(x, 3.25, -254.2, 0.75, 1, 'bulb');
  for (const x of [-104, -96, -88]) add(x, 3.25, -262.2, 0.75, 1, 'bulb');
  // the guards' fire baskets before the gates
  const fires = [];
  for (const s of [-1, 1]) { fires.push({ x: s * 17, z: 247 }); fires.push({ x: s * 10.5, z: 98 }); fires.push({ x: s * 10.5, z: 166 }); }
  return { lanterns, fires };
}

/** The lanterns of a list of life elements (`hang_lantern`) as the halo list for `seoul_halo`: { x, y (the shade's middle), z, fy }. */
export function lanternHalos(list) {
  const out = [];
  for (const e of list) if (e.t === 'hang_lantern') out.push({ x: e.at[0], y: (e.y ?? 2.5) - 0.3, z: e.at[1], fy: 0, s: 0.9 });
  return out;
}
