// Ming Suzhou by night, the light the lanterns and the lit rooms throw (docs/settlements/ming-suzhou.md §22).
// The glow shades of lamps.js are lit from within by their own material; what they lack, where the lamps'
// pool of real lights is off (the low preset), is the light they give the things round them. Here it is
// made of geometry in the four `halo` materials (palette.js, materials.js 'halo'): light ADDED over what
// is behind it, at night only, by the glow shades' own switch (ENV.night), with no light, no shadow and no
// collision:
//   halo_ball    a low shell round a lantern, soft at its rim: the bloom the eye sees round a flame;
//   halo_wash    a flat disc on the paving, the water or a wall under a lantern: a warm pool;
//   halo_streak  the same broken into ripples, on the water: the lantern's reflection in the canal and the pond;
//   halo_pane    a sheet in front of the paper of a window: the lamp of the room within.
// All pieces here are in the same few materials, merged per plan (the garden's) or per shape (the street
// life's instances); the discs are 24 triangles, the shells 48, the panes 4.
// Everything is a function of the lantern's own place: no counters, no Math.random.

import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';
import { STYLES } from '../../core/build.js';
import { assembly, placer } from '../../objects/kit.js';
import { LEVEL, CANALS, POND, pondDistance } from './layout.js';

/** A number in [0, 1) from a position alone. */
export function hashAt(x, z, s = 0) {
  let h = (Math.round(x * 16) * 73856093) ^ (Math.round(z * 16) * 19349663) ^ Math.imul(s + 1, 83492791);
  h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

const TAU = Math.PI * 2;
/** Triangles (position and a normal per corner) gathered by material. */
export class Halo {
  constructor() { this.m = new Map(); }
  arr(mat) { let a = this.m.get(mat); if (!a) this.m.set(mat, (a = { pos: [], nor: [] })); return a; }
  tri(mat, p0, n0, p1, n1, p2, n2) { const a = this.arr(mat); a.pos.push(...p0, ...p1, ...p2); a.nor.push(...n0, ...n1, ...n2); }
  /**
   * A flat disc (an ellipse) at c, spanned by the unit axes U and V with the semi-axes su and sv, in three
   * rings (the middle, half way out, the rim): the vertex normals carry the falloff in their y (1, 0.42, 0:
   * materials.js 'halo'), their horizontal part pointing along `nh` ([x, z], a wall's outward) or radially.
   */
  disc(mat, c, U, V, su, sv, nh = null, segs = 8) {
    const F = [1, 0.42, 0], R = [0, 0.5, 1];
    const at = (r, k) => { const a = k / segs * TAU, u = Math.cos(a) * su * R[r], v = Math.sin(a) * sv * R[r]; return [c[0] + U[0] * u + V[0] * v, c[1] + U[1] * u + V[1] * v, c[2] + U[2] * u + V[2] * v]; };
    const nm = (r, k) => { const a = k / segs * TAU, f = F[r], s = Math.sqrt(1 - f * f); return nh ? [nh[0] * s, f, nh[1] * s] : [Math.cos(a) * s, f, Math.sin(a) * s]; };
    for (let k = 0; k < segs; k++) {
      this.tri(mat, at(0, k), nm(0, k), at(1, k), nm(1, k), at(1, k + 1), nm(1, k + 1));
      for (const [r0, r1] of [[1, 2]]) {
        this.tri(mat, at(r0, k), nm(r0, k), at(r1, k), nm(r1, k), at(r1, k + 1), nm(r1, k + 1));
        this.tri(mat, at(r0, k), nm(r0, k), at(r1, k + 1), nm(r1, k + 1), at(r0, k + 1), nm(r0, k + 1));
      }
    }
  }
  /** A disc lying on a horizontal plane (the paving, the water, a floor, an eave's underside) at height y. */
  floor(mat, x, y, z, r, rz = r, yaw = 0, segs = 8) {
    const s = Math.sin(yaw), c = Math.cos(yaw);
    this.disc(mat, [x, y, z], [c, 0, -s], [s, 0, c], r, rz, null, segs);
  }
  /** A disc standing on a wall at (x, y, z), the wall's outward normal nh = [x, z]; rw wide and rh high (semi-axes). */
  wall(mat, x, y, z, nh, rw, rh, segs = 8) {
    this.disc(mat, [x, y, z], [-nh[1], 0, nh[0]], [0, 1, 0], rw, rh, nh, segs);
  }
  /** A shell round (x, y, z) of radius r: 8 sides, four bands; true normals. */
  ball(mat, x, y, z, r, segs = 8) {
    const lat = [-90, -45, 0, 45, 90].map((d) => d * Math.PI / 180);
    const P = (i, k) => { const a = k / segs * TAU, cl = Math.cos(lat[i]); return [x + Math.cos(a) * cl * r, y + Math.sin(lat[i]) * r, z + Math.sin(a) * cl * r]; };
    const N = (i, k) => { const a = k / segs * TAU, cl = Math.cos(lat[i]); return [Math.cos(a) * cl, Math.sin(lat[i]), Math.sin(a) * cl]; };
    for (let i = 0; i < 4; i++) for (let k = 0; k < segs; k++) {
      if (i > 0) this.tri(mat, P(i, k), N(i, k), P(i, k + 1), N(i, k + 1), P(i + 1, k), N(i + 1, k));
      if (i < 3) { this.tri(mat, P(i, k + 1), N(i, k + 1), P(i + 1, k + 1), N(i + 1, k + 1), P(i + 1, k), N(i + 1, k)); }
    }
  }
  /** A flat sheet (a window's lamp-lit paper): the four corners, both faces seen (the material is double-sided). */
  quad(mat, a, b, c, d, n) { this.tri(mat, a, n, b, n, c, n); this.tri(mat, a, n, c, n, d, n); }
  /** One geometry per material into the bag. */
  flush(bag) {
    for (const [mat, a] of this.m) {
      if (!a.pos.length) continue;
      const g = new BufferGeometry();
      g.setAttribute('position', new Float32BufferAttribute(a.pos, 3));
      g.setAttribute('normal', new Float32BufferAttribute(a.nor, 3));
      bag.add(mat, g);
    }
    this.m.clear();
  }
}

// ── what each lantern throws: its glow ball, the pool on the ground, the wash on the wall behind ─────
/**
 * The light of one lantern into `H`: at (x, z), `cy` the height of the lantern's body, `gy` the ground (or floor)
 * below it, `s` its size; a wall `wall` = { n: [x, z] (outward), d (behind the lantern, m) } if one stands behind it.
 */
export function lanternLight(H, x, z, cy, gy, s, wall = null, pool = 2.6) {
  H.ball('halo_ball', x, cy, z, 0.85 * s);
  H.floor('halo_wash', x, gy + 0.03, z, pool * s);
  if (wall) H.wall('halo_wash', x - wall.n[0] * wall.d, cy, z - wall.n[1] * wall.d, wall.n, 1.9 * s, 1.5 * s);
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
  H.floor('halo_streak', cx, best.y + 0.02, cz, 0.62 * s, a, Math.atan2(best.dx, best.dz), 10);
  return true;
}

// ── the street's lanterns: one element of the street life per lantern ──────────────────────────────────
// { t: 'suzhou_halo', at, y (the ground), rot (+z out, the wall behind at −z), kind }
const KINDS = {
  hang:  { cy: 2.32, s: 0.9, wall: 0.2, pool: 2.7, gy: 0.1 },     // the lantern hung from an eave over a shop front (objects: hang_lantern, its hook 2.95 m up)
  inn:   { cy: 2.57, s: 1.25, wall: 0.25, pool: 2.8, gy: 0.1 },   // the tall drum lantern over the door of an inn (suzhou_lamp 'inn', its hook 3.25 m up)
  pole:  { cy: 2.38, s: 1.0, wall: 0, pool: 3.4, gy: 0.03, z: 0.62 }, // the lamp on its pole at a bridge head
  post:  { cy: 2.17, s: 0.9, wall: 0, pool: 3.0, gy: 0.03, z: 0.42 }, // a lantern on a post or bracket (objects: lantern)
  spill: {},                                                       // the light from a shop's open front on the street
  streak: {},
};
function unitOf(kind, v) {
  const key = `suzhou-halo|${kind}|${v ?? ''}`;
  return assembly(key, (a) => {
    const H = new Halo(), K = KINDS[kind];
    if (kind === 'streak') H.floor('halo_streak', 0, 0, 0, 0.62, 2.1, 0, 10);
    else if (kind === 'spill') H.floor('halo_wash', 0, 0.06, 1.3, 2.4, 1.9, 0, 10);
    else lanternLight(H, 0, K.z ?? 0, K.cy, K.gy, K.s, K.wall ? { n: [0, 1], d: K.wall } : null, K.pool / K.s);
    for (const [mat, d] of H.m) { const g = new BufferGeometry(); g.setAttribute('position', new Float32BufferAttribute(d.pos, 3)); g.setAttribute('normal', new Float32BufferAttribute(d.nor, 3)); a(mat, g); }
  });
}
/** suzhou_halo: the light of a lantern or of a shop front, instanced like the lanterns themselves. */
function suzhouHalo(el, { bag }) {
  const put = placer(el, bag), U = unitOf(el.kind, el.v);
  for (const [mat, g] of Object.entries(U)) put(mat, g.clone());
}

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
    else if (e.t === 'suzhou_shop' && !e.water && hashAt(x, z, 5) < 0.55) {
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
  if (thinX) {
    const z0 = b.z0 + m, z1 = b.z1 - m;
    for (const [x, nx] of [[b.x1 + off, 1], [b.x0 - off, -1]]) H.quad('halo_pane', [x, y0, z0], [x, y0, z1], [x, y1, z1], [x, y1, z0], [nx, 0, 0]);
  } else {
    const x0 = b.x0 + m, x1 = b.x1 - m;
    for (const [z, nz] of [[b.z1 + off, 1], [b.z0 - off, -1]]) H.quad('halo_pane', [x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z], [0, 0, nz]);
  }
}
/**
 * Wrap a builder context so that the windows it makes glow at night: each latticed leaf (a slab of a `lattice*`
 * material, or the thin sheet of paper `plaster_white` of the halls' real lattice) gets a pane of lamp-light on
 * each face if its room (a cell of the settlement by hash: 4 m × 3 m storeys) is one of those lit, `share` of them.
 * Returns { ctx, finish } — call finish() once the element has been built.
 */
export function litWindows(ctx, share = 0.42) {
  const H = new Halo(), real = ctx.bag;
  const lit = (b) => hashAt(Math.floor((b.x0 + b.x1) / 8) * 4, Math.floor((b.z0 + b.z1) / 8) * 4, 11 + Math.floor((b.y0 + b.y1) / 6)) < share;
  const bag = new Proxy(real, {
    get(t, k) {
      if (k === 'add') return (mat, g) => {
        if (typeof mat === 'string' && g?.attributes?.position && ((mat.startsWith('lattice') && mat !== 'lattice_red') || mat === 'plaster_white')) {
          const paper = mat === 'plaster_white', n = g.attributes.position.count;
          if (!paper || n <= 36) for (const b of slabsOf(g, paper ? 0.02 : 0.2)) if (lit(b)) panesOf(H, b, paper ? 0.006 : 0.004);
        }
        return t.add(mat, g);
      };
      const v = t[k];
      return typeof v === 'function' ? v.bind(t) : v;
    },
  });
  return { ctx: { ...ctx, bag }, finish: () => H.flush(real) };
}
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
  for (const [style, name, share] of [['suzhou-quarter', 'house_jiangnan', 0.42], ['suzhou-town', 'house_up', 0.5], ['suzhou-site', 'ming_hall', 0.7], ['suzhou-site', 'ming_pavilion', 0.5], ['suzhou-site', 'lou', 0.6]]) wrapElement(style, name, share);
}
