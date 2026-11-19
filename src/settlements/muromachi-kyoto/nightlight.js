// Muromachi Kyoto by night: the light the lanterns, the shop fronts and the lit rooms throw (docs/settlements/muromachi-kyoto.md §12).
// The glow shades (lamp_paper, lamp_white: the hanging lanterns, the lamps of the rooms) are lit from within by their own
// material; what they lack, where the pool of real lamps is off (the low preset), is the light they give the things round them.
// Here it is made of geometry in one material, `halo` (palette.js, materials.js 'halo'): light ADDED over what is behind it, at night
// only (by the glow shades' own switch, ENV.night), with no light, no shadow and no collision, so that the day view is unchanged.
// The shape of each piece is carried by its normals: a glow round each flame (three crossed discs), a pool of light on the street
// or the gravel, a wash on the wall behind a hanging lantern, a streak on the pond under a lantern at its bank, and a sheet in
// front of the paper (shoji) or the bamboo lattice (koshi) of a window, the lamp of the room within. Everything is a function of
// the lamp's own place (hashAt): no counters, no Math.random. The street's pieces are `kyoto_halo` elements of the street life
// (instanced, drawn within 60 m of the eye), the temples' and the shrine's go into their plan's mesh of the material.
// The method is that of the Suzhou reference (the same material), written here for the Kyoto lamps; nothing of Suzhou's is imported.

import { BufferGeometry, Float32BufferAttribute, Matrix4, Quaternion, Vector3 } from '../../core/three.js';
import { placeHanging } from '../../core/geom.js';
import { STYLES } from '../../core/build.js';
import { assembly } from '../../objects/kit.js';
import { GINKAKU, RYOAN } from './layout.js';

/** A number in [0, 1) from a position alone. */
export function hashAt(x, z, s = 0) {
  let h = (Math.round(x * 16) * 73856093) ^ (Math.round(z * 16) * 19349663) ^ Math.imul(s + 1, 83492791);
  h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

const TAU = Math.PI * 2, MAT = 'halo', HALO_REACH = 60;
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
  /** A disc lying flat at height y (the street, the gravel, the water: the ripple-broken kind). */
  floor(x, y, z, r, rz = r, yaw = 0, segs = 8, water = false) {
    const s = Math.sin(yaw), c = Math.cos(yaw);
    this.disc([x, y, z], [c, 0, -s], [s, 0, c], r, rz, null, segs, [1, 0.42, 0], [0, 0.5, 1], water ? -1 : 1);
  }
  /** A disc standing on a wall at (x, y, z), the wall's outward normal nh = [x, z]. */
  wall(x, y, z, nh, rw, rh, segs = 8) { this.disc([x, y, z], [-nh[1], 0, nh[0]], [0, 1, 0], rw, rh, nh, segs, [0.9, 0], [0, 1]); }
  /** The glow round a flame: three upright discs crossed at 60 degrees. */
  ball(x, y, z, r) {
    for (let k = 0; k < 3; k++) { const a = k * Math.PI / 3, c = Math.cos(a), s = Math.sin(a); this.disc([x, y, z], [c, 0, s], [0, 1, 0], r, r, [-s, c], 8, [0.62, 0], [0, 1]); }
  }
  /** A flat sheet (a window's lamp-lit paper) of brightness f, facing n = [x, z]. */
  quad(a, b, c, d, n, f) { const q = Math.sqrt(1 - f * f), N = [n[0] * q, f, n[1] * q]; this.tri(a, N, b, N, c, N); this.tri(a, N, c, N, d, N); }
  flush(bag) {
    if (!this.pos.length) return;
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute(this.pos, 3)); g.setAttribute('normal', new Float32BufferAttribute(this.nor, 3));
    bag.add(MAT, g); this.pos = []; this.nor = [];
  }
}

// ── what each lamp throws ───────────────────────────────────────────────────────────────────────────
/** The lantern hung from an eave (chōchin; body centre at height cy above the street), the wall of the house 0.82 m behind it. */
function hangLight(H, cy) { H.ball(0, cy, 0, 0.76); H.floor(0, 0.04, 0, 2.5, 2.2, 0, 8); H.wall(0, cy, -0.82, [0, 1], 1.5, 1.2); }
/** The stone lantern of a temple or shrine (the fire box at 0.78 s above the ground), s its size. */
function stoneLight(H, s) { H.ball(0, 0.78 * s, 0, 0.55 * s); H.floor(0, 0.03, 0, 1.9 * s, 1.9 * s, 0, 8); }
/** Where the pond lies from (x, z): the nearest of the two ponds within `reach` m, as { dx, dz, qx, qz, y } or null (rays outward, the first sample in the water). */
function pondFrom(x, z, reach = 7) {
  for (const P of [GINKAKU.pond, RYOAN.pond]) {
    const d = (px, pz) => Math.hypot((px - P.c[0]) / P.r[0], (pz - P.c[1]) / P.r[1]);
    if (d(x, z) < 1) continue;
    for (let k = 0; k < 16; k++) {
      const a = k / 16 * TAU + 0.2, dx = Math.cos(a), dz = Math.sin(a);
      for (let t = 0; t <= reach; t += 0.5) if (d(x + dx * t, z + dz * t) < 1 - 0.5 / Math.min(P.r[0], P.r[1])) {
        const cx = x + dx * (t + 2.2), cz = z + dz * (t + 2.2);
        if (d(cx, cz) > 0.96 || d(x + dx * (t + 4.2), z + dz * (t + 4.2)) > 1) break;
        return { dx, dz, qx: x + dx * t, qz: z + dz * t, y: P.level };
      }
    }
  }
  return null;
}

// ── the street's lamps: one element of the street life per lamp ─────────────────────────────────────
// { t: 'kyoto_halo', at, y (the ground), rot (+z out, the wall behind at -z), kind, v }
function unitOf(kind, v) {
  return assembly(`kyoto-halo|${kind}|${v ?? ''}`, (a) => {
    const H = new Halo();
    if (kind === 'hang') hangLight(H, v);
    else if (kind === 'stone') stoneLight(H, v);
    else if (kind === 'spill') H.floor(0, 0.06, 1.3, 2.3, 1.8, 0, 10);       // an open shop's lamp-light across its threshold and the gutter
    else if (kind === 'streak') H.floor(0, 0, 0, 0.62, 2.1, 0, 10, true);
    const g = new BufferGeometry(); g.setAttribute('position', new Float32BufferAttribute(H.pos, 3)); g.setAttribute('normal', new Float32BufferAttribute(H.nor, 3)); a(MAT, g);
  });
}
function kyotoHalo(el, { bag }) {
  const U = unitOf(el.kind, el.v), [x, z] = el.at;
  const M = new Matrix4().compose(new Vector3(x, el.y ?? 0, z), new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), el.rot ?? 0), new Vector3(1, 1, 1));
  // (within 60 m of the eye: farther off a lantern is a point of light, which its own shade already gives)
  for (const [mat, g] of Object.entries(U)) { if (bag.addInstance) bag.addInstance(mat, g.clone(), M, { reach: HALO_REACH }); else bag.add(mat, placeHanging(g.clone(), M)); }
}
/** The light of a hanging lantern for the life plan (its element: at, y = the hook, rot = outward heading): body height quantised to 0.25 m. */
export const hangHalo = (e, rot) => ({ t: 'kyoto_halo', kind: 'hang', at: e.at, y: 0, rot, v: Math.round((e.y - (e.drop ?? 0.35) - 0.28) * 4) / 4 });
/** The light of an open shop's front (at its doorway, rot = outward heading), by the hash of its place. */
export const spillHalo = (at, rot) => (hashAt(at[0], at[1], 5) < 0.7 ? { t: 'kyoto_halo', kind: 'spill', at, y: 0, rot } : null);
/** The lit stone lanterns of a plan's elements (the shrine's and the temples'; the tea garden's lantern is a later fashion), and the streak of one at the pond's bank. */
export function stoneHalos(elements, skip = () => false) {
  const out = [];
  for (const e of elements) {
    if (e.t !== 'ishidoro' || skip(e)) continue;
    const s = Math.round((e.s ?? 1) * 10) / 10;
    out.push({ t: 'kyoto_halo', kind: 'stone', at: e.at, y: e.y ?? 0, rot: 0, v: s });
    const p = pondFrom(e.at[0], e.at[1]);
    if (p) out.push({ t: 'kyoto_halo', kind: 'streak', at: [p.qx + p.dx * 2.35, p.qz + p.dz * 2.35], y: p.y + 0.02, rot: Math.atan2(p.dx, p.dz) });
  }
  return out;
}

// ── the lit windows ─────────────────────────────────────────────────────────────────────────────────
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
/** The lit panes for one slab: a sheet a hair off each of its two faces (the leaf less a frame's width), each room its own strength by the hash of its place. */
function panesOf(H, b, off) {
  const thinX = b.x1 - b.x0 < b.z1 - b.z0, m = 0.035, y0 = b.y0 + m, y1 = b.y1 - m;
  if (y1 - y0 < 0.15) return;
  const f = 0.5 + 0.4 * hashAt((b.x0 + b.x1) / 2, (b.z0 + b.z1) / 2, 23 + Math.floor(b.y0 / 2.5));     // (oil is dear: the lamp is a small one, 0.5 to 0.9)
  if (thinX) {
    const z0 = b.z0 + m, z1 = b.z1 - m;
    for (const [x, nx] of [[b.x1 + off, 1], [b.x0 - off, -1]]) H.quad([x, y0, z0], [x, y0, z1], [x, y1, z1], [x, y1, z0], [nx, 0], f);
  } else {
    const x0 = b.x0 + m, x1 = b.x1 - m;
    for (const [z, nz] of [[b.z1 + off, 1], [b.z0 - off, -1]]) H.quad([x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z], [0, nz], f);
  }
}
/** Materials whose slabs are windows (paper and bamboo lattice) and the sheet's distance off them. */
const WINDOW = { shoji: 0.006, koshi: 0.004 };
/**
 * Wrap a builder context so that the windows it makes glow at night: each leaf of paper (shoji) or latticed bamboo (koshi) gets
 * a pane of lamp-light on each face if its room (a cell of the town by hash: 8 m squares, by storey) is one of those lit, `share` of them.
 * Returns { ctx, finish }: call finish() once the element has been built.
 */
export function litWindows(ctx, share = 0.4) {
  const H = new Halo(), real = ctx.bag;
  const lit = (b) => hashAt(Math.floor((b.x0 + b.x1) / 8) * 4, Math.floor((b.z0 + b.z1) / 8) * 4, 11 + Math.floor((b.y0 + b.y1) / 6)) < share;
  const bag = new Proxy(real, {
    get(t, k) {
      if (k === 'add') return (mat, g, ...r) => {
        const off = typeof mat === 'string' ? WINDOW[mat] : undefined;
        if (off !== undefined && g?.attributes?.position) for (const b of slabsOf(g, 0.2)) if (lit(b)) panesOf(H, b, off);
        return t.add(mat, g, ...r);
      };
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
  const f = (el, ctx) => { const L = litWindows(ctx, el.litShare ?? share); base(el, L.ctx); L.finish(); };
  f.__lit = true;
  S.elements[name] = f;
}
/** Register the halo element (street life and the style's own plans) and the lit windows of the houses and the temples' halls. */
export function registerNight() {
  if (STYLES.life) STYLES.life.elements.kyoto_halo = kyotoHalo;
  if (STYLES.muromachi) STYLES.muromachi.elements.kyoto_halo = kyotoHalo;
  for (const [name, share] of [['machiya_m', 0.4], ['kannon_den', 0.5], ['togudo', 0.7], ['hojo', 0.7], ['tea_hut', 0.6], ['shrine_hall', 0.5]]) wrapElement('muromachi', name, share);
}
registerNight();
