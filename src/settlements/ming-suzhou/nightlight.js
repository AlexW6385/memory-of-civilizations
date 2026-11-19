// Ming Suzhou by night, the light the lanterns and the lit rooms throw (docs/settlements/ming-suzhou.md §22).
// The glow shades of lamps.js are lit from within by their own material; what they lack, where the lamps'
// pool of real lights is off (the low preset), is the light they give the things round them. Here it is
// made of geometry in one material, `halo` (palette.js, materials.js 'halo'): light ADDED over what is behind
// it, at night only, by the glow shades' own switch (ENV.night), with no light, no shadow and no collision.
// The shape of each piece is carried by its normals (materials.js): a glow round each lantern (three crossed
// discs), a pool of light on the paving, the water or a floor under it, a wash on the wall behind it, a
// reflection broken into ripples on the canal and the pond, a sheet in front of the paper of a window (the
// lamp of the room within). The discs are 8 to 24 triangles, the panes 4. The garden's go into its plan's one
// mesh of the material, the street's are `suzhou_halo` elements of the street life (instanced).
// Everything is a function of the lantern's own place: no counters, no Math.random.

import { BufferGeometry, Float32BufferAttribute, Matrix4, Quaternion, Vector3 } from '../../core/three.js';
import { placeHanging, box, lathe } from '../../core/geom.js';
import { STYLES } from '../../core/build.js';
import { assembly } from '../../objects/kit.js';
import { LEVEL, CANALS, POND, pondDistance } from './layout.js';

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
  floor(x, y, z, r, rz = r, yaw = 0, segs = 8, water = false) {
    const s = Math.sin(yaw), c = Math.cos(yaw);
    this.disc([x, y, z], [c, 0, -s], [s, 0, c], r, rz, null, segs, [1, 0.42, 0], [0, 0.5, 1], water ? -1 : 1);
  }
  /** A disc standing on a wall at (x, y, z), the wall's outward normal nh = [x, z]; rw wide and rh high (semi-axes). */
  wall(x, y, z, nh, rw, rh, segs = 8) {
    this.disc([x, y, z], [-nh[1], 0, nh[0]], [0, 1, 0], rw, rh, nh, segs, [0.9, 0], [0, 1]);
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
  H.ball(x, cy, z, 0.95 * s);
  H.floor(x, gy + 0.03, z, pool * s);
  if (wall) H.wall(x - wall.n[0] * wall.d, cy, z - wall.n[1] * wall.d, wall.n, 1.9 * s, 1.5 * s);
}
/** The reflection streak on water at (x, z) (a lantern's own place), the water surface at wy: toward the nearest water within `reach` m. Returns whether one was laid. */
export function waterStreak(H, x, z, wy, s = 1, reach = 7) {
  let best = null;
  // the canals: the nearest point of the rectangle of water
  for (const [x0, z0, x1, z1] of CANALS) {
    const qx = Math.max(x0, Math.min(x, x1)), qz = Math.max(z0, Math.min(z, z1)), d = Math.hypot(qx - x, qz - z);
    if (d > 0.05 && d < reach && (!best || d < best.d)) best = { d, dx: (qx - x) / d, dz: (qz - z) / d, qx, qz, y: LEVEL.canal };
    else if (d <= 0.05 && wy <= LEVEL.canal + 0.5 && (!best || 0 < best.d)) best = { d: 0, dx: 0, dz: 1, qx: x, qz: z, y: LEVEL.canal };
  }
  if (!best && POND) {
    // the pond: rays outward from the lantern, the first sample in the water
    for (let k = 0; k < 16 && !best; k++) {
      const a = k / 16 * TAU + 0.2, dx = Math.cos(a), dz = Math.sin(a);
      for (let d = 0; d <= reach; d += 0.5) if (pondDistance(x + dx * d, z + dz * d) < -0.5) { best = { d, dx, dz, qx: x + dx * d, qz: z + dz * d, y: LEVEL.pond }; break; }
    }
  }
  if (!best) return false;
  const a = 2.1 * s, cx = best.qx + best.dx * (a + 0.15), cz = best.qz + best.dz * (a + 0.15);
  if (best.y === LEVEL.pond && (pondDistance(cx, cz) > -0.3 || pondDistance(best.qx + best.dx * (2 * a), best.qz + best.dz * (2 * a)) > 0)) return false;
  H.floor(cx, best.y + 0.02, cz, 0.62 * s, a, Math.atan2(best.dx, best.dz), 10, true);
  return true;
}

// ── the street's lanterns: one element of the street life per lantern ──────────────────────────────────
// { t: 'suzhou_halo', at, y (the ground), rot (+z out, the wall behind at −z), kind }
const KINDS = {
  hang:  { cy: 2.32, s: 0.9, wall: 0.2, pool: 2.3, gy: 0.1 },     // the lantern hung from an eave over a shop front (objects: hang_lantern, its hook 2.95 m up)
  inn:   { cy: 2.57, s: 1.25, wall: 0.25, pool: 2.9, gy: 0.1 },   // the tall drum lantern over the door of an inn (suzhou_lamp 'inn', its hook 3.25 m up)
  pole:  { cy: 2.38, s: 1.0, wall: 0, pool: 3.4, gy: 0.03, z: 0.62 }, // the lamp on its pole at a bridge head
  post:  { cy: 2.17, s: 0.9, wall: 0, pool: 3.0, gy: 0.03, z: 0.42 }, // a lantern on a post or bracket (objects: lantern)
  spill: {},                                                       // the light from a shop's open front on the street
  streak: {},
  stern: {},                                                       // the lantern on a post at a moored boat's stern
};
function unitOf(kind, v) {
  const key = `suzhou-halo|${kind}|${v ?? ''}`;
  return assembly(key, (a) => {
    const H = new Halo(), K = KINDS[kind];
    if (kind === 'stern') {
      // the lantern on a post at a boat's stern (origin: the deck at the post's foot): the post, a bracket, the paper lantern, its glow, a pool on the deck and its streak on the water (0.72 m below)
      a('timber', box(-0.025, 0, -0.025, 0.025, 1.05, 0.025)); a('timber', box(-0.02, 0.98, -0.02, 0.02, 1.02, 0.3));
      a('lacquer_black', lathe([[0.001, 0.93], [0.07, 0.93], [0.06, 0.9], [0.001, 0.9]], 8, null, 0, 0, 0.3));
      a('lamp_paper', lathe([[0.07, 0.9], [0.12, 0.84], [0.13, 0.74], [0.12, 0.64], [0.07, 0.58]], 8, null, 0, 0, 0.3));
      a('lacquer_black', lathe([[0.07, 0.58], [0.07, 0.55], [0.001, 0.55]], 8, null, 0, 0, 0.3));
      H.ball(0, 0.75, 0.3, 0.7); H.floor(0, 0.03, 0.3, 1.5); H.floor(0, -0.70, 0.3, 0.62, 1.7, 0, 10, true);
    } else if (kind === 'streak') H.floor(0, 0, 0, 0.62, 2.1, 0, 10, true);
    else if (kind === 'spill') H.floor(0, 0.06, 1.3, 2.4, 1.9, 0, 10);
    else lanternLight(H, 0, K.z ?? 0, K.cy, K.gy, K.s, K.wall ? { n: [0, 1], d: K.wall } : null, K.pool / K.s);
    const g = new BufferGeometry(); g.setAttribute('position', new Float32BufferAttribute(H.pos, 3)); g.setAttribute('normal', new Float32BufferAttribute(H.nor, 3)); a(MAT, g);
  });
}
/** suzhou_halo: the light of a lantern or of a shop front, instanced like the lanterns themselves. */
function suzhouHalo(el, { bag }) {
  const U = unitOf(el.kind, el.v), [x, z] = el.at;
  const M = new Matrix4().compose(new Vector3(x, el.y ?? 0, z), new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), el.rot ?? 0), new Vector3(1, 1, 1));
  // (drawn within 60 m of the eye: farther off a lantern is a point of light, which its own shade already gives, and the pool of light under it is too small to read)
  for (const [mat, g] of Object.entries(U)) { if (bag.addInstance) bag.addInstance(mat, g.clone(), M, { reach: HALO_REACH }); else bag.add(mat, placeHanging(g.clone(), M)); }
}
const HALO_REACH = 60;

/** The halos for a plan's list of street elements (a life plan's `elements`): one `suzhou_halo` for each lantern and the lit shop fronts; `inDisc` keeps them within the settlement. */
export function streetHalos(elements, inDisc = () => true) {
  const out = [];
  const near = (x, z) => { const s = streakPose(x, z); if (s) out.push({ t: 'suzhou_halo', kind: 'streak', at: [s.x, s.z], y: s.y + 0.02, rot: s.rot }); };
  for (const e of elements) {
    if (!e.at || !inDisc(e.at)) continue;
    const [x, z] = e.at;
    if (e.t === 'hang_lantern') { out.push({ t: 'suzhou_halo', kind: 'hang', at: e.at, y: e.y - 2.95, rot: e.rot }); near(x, z); }
    else if (e.t === 'suzhou_lamp') {
      if (e.kind === 'inn') out.push({ t: 'suzhou_halo', kind: 'inn', at: e.at, y: e.y - 3.25, rot: e.rot });
      else out.push({ t: 'suzhou_halo', kind: 'pole', at: e.at, y: e.y, rot: e.rot });
      near(x, z);
    } else if (e.t === 'lantern' && (e.kind === 'paper' || e.kind === 'white')) out.push({ t: 'suzhou_halo', kind: 'post', at: e.at, y: e.y ?? 0, rot: e.rot });
    else if (e.t === 'boat' && e.moor && e.dir && hashAt(x, z, 9) < 0.8) {
      // a moored boat: a lantern on a post at the stern (the style's boat has its stern at +dir), on the side the hash chooses
      const [dx, dz] = e.dir, L = e.len ?? 7, o = (hashAt(x, z, 3) < 0.5 ? -1 : 1) * 0.6, s = L / 2 - 0.4;
      out.push({ t: 'suzhou_halo', kind: 'stern', at: [x + dx * s - dz * o, z + dz * s + dx * o], y: (e.y ?? LEVEL.canal) + 0.72, rot: Math.atan2(dx, dz) });
    } else if (e.t === 'suzhou_shop' && !e.water && hashAt(x, z, 5) < 0.55) {
      // the shop front stays open into the evening: its lamp-light across the doorstep (a shop is facing out along rot)
      const r = e.rot ?? 0, s = Math.sin(r), c = Math.cos(r);
      out.push({ t: 'suzhou_halo', kind: 'spill', at: [x + s * 0.2, z + c * 0.2], y: e.y ?? 0, rot: r });
    }
  }
  return out;
}
/** Where and how the streak lies for a lantern at (x, z): { x, z, y, rot } or null. */
function streakPose(x, z, reach = 7) {
  let best = null;
  for (const [x0, z0, x1, z1] of CANALS) {
    const qx = Math.max(x0, Math.min(x, x1)), qz = Math.max(z0, Math.min(z, z1)), d = Math.hypot(qx - x, qz - z);
    if (d > 0.05 && d < reach && (!best || d < best.d)) best = { d, dx: (qx - x) / d, dz: (qz - z) / d, qx, qz };
  }
  if (!best) return null;
  const a = 2.1;
  return { x: best.qx + best.dx * (a + 0.15), z: best.qz + best.dz * (a + 0.15), y: LEVEL.canal, rot: Math.atan2(best.dx, best.dz) };
}

// ── the lit windows ───────────────────────────────────────────────────────────────────────────────────────
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
  const f = 0.6 + 0.4 * hashAt((b.x0 + b.x1) / 2, (b.z0 + b.z1) / 2, 23 + Math.floor(b.y0 / 2.5));
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
        if (typeof mat === 'string' && g?.attributes?.position && ((mat.startsWith('lattice') && mat !== 'lattice_red') || mat === 'plaster_white')) {
          const paper = mat === 'plaster_white', n = g.attributes.position.count;
          if (!paper || n <= 36) for (const b of slabsOf(g, paper ? 0.02 : 0.2)) if (lit(b)) panesOf(H, b, 0.03);
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
/** Wrap a style's element so its windows glow at night: STYLES[style].elements[name] */
function wrapElement(style, name, share) {
  const S = STYLES[style];
  if (!S?.elements[name] || S.elements[name].__lit) return;
  const base = S.elements[name];
  const f = (el, ctx) => { const L = litWindows(ctx, el.litShare ?? share); base(el, L.ctx); L.finish(); };
  f.__lit = true;
  S.elements[name] = f;
}
/** Register the street life's element and the lit windows of the houses and halls. */
export function registerNight() {
  if (STYLES.life) STYLES.life.elements.suzhou_halo = suzhouHalo;
  for (const [style, name, share] of [['suzhou-quarter', 'house_jiangnan', 0.42], ['suzhou-quarter', 'house_walk', 0.42], ['suzhou-town', 'house_up', 0.5], ['suzhou-site', 'ming_hall', 0.7], ['suzhou-site', 'ming_pavilion', 0.5], ['suzhou-site', 'lou', 0.6]]) wrapElement(style, name, share);
}
