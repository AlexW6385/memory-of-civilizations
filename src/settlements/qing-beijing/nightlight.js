// Ming–Qing Beijing by night: the light the lanterns, the braziers and the lit rooms throw (docs/settlements/qing-beijing.md §39).
// The glow shades (lamp_paper, lamp_white) are lit from within by their own material; what they lack, where the lamps'
// pool of real lights is off (the low preset), is the light they give the things round them. It is made here of
// geometry in one material, `halo` (palette.js, materials.js 'halo'): light ADDED over what is behind it, at night only,
// by the glow shades' own switch (ENV.night), with no light, no shadow and no collision. The shape of each piece is
// carried by its normals: a glow round each flame (three crossed discs), a pool on the paving or a floor, a wash on the
// wall behind, a sheet before the paper of a lit window. The pattern is that of Suzhou's nightlight.js (copied, not
// imported: that file reads Suzhou's layout); Beijing has no canal lights, its water is the moat (not lit).
// Everything is a function of the lamp's own place: no counters, no Math.random.

import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';

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
  get empty() { return !this.pos.length; }
  tri(p0, n0, p1, n1, p2, n2) { this.pos.push(...p0, ...p1, ...p2); this.nor.push(...n0, ...n1, ...n2); }
  /**
   * A flat disc (an ellipse) at c, spanned by the unit axes U and V with the semi-axes su and sv, in rings R (fractions of
   * the radius, from 0 for the middle) of brightness F: the vertex normals carry it in their y (materials.js 'halo'), their
   * horizontal part pointing along `nh` ([x, z], a wall's outward) or radially.
   */
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
  /** A disc lying on a horizontal plane (the paving, a floor) at height y, semi-axes r and rz, turned by yaw. */
  floor(x, y, z, r, rz = r, yaw = 0, segs = 8) {
    const s = Math.sin(yaw), c = Math.cos(yaw);
    this.disc([x, y, z], [c, 0, -s], [s, 0, c], r, rz, null, segs);
  }
  /** A disc standing on a wall at (x, y, z), the wall's outward normal nh = [x, z]; rw wide and rh high (semi-axes). */
  wall(x, y, z, nh, rw, rh, segs = 8) {
    this.disc([x, y, z], [-nh[1], 0, nh[0]], [0, 1, 0], rw, rh, nh, segs, [0.9, 0], [0, 1]);
  }
  /** The glow round a flame at (x, y, z), radius r: three upright discs crossed at 60° (a cone of light from each middle). */
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

/**
 * The light of one lantern into `H`: at (x, z), `cy` the height of the lantern's body, `gy` the ground (or floor) below it,
 * `s` its size; a wall `wall` = { n: [x, z] (outward), d (behind the lantern, m) } if one stands behind it.
 */
export function lanternLight(H, x, z, cy, gy, s, wall = null, pool = 2.6) {
  H.ball(x, cy, z, 0.95 * s);
  H.floor(x, gy + 0.03, z, pool * s);
  if (wall) H.wall(x - wall.n[0] * wall.d, cy, z - wall.n[1] * wall.d, wall.n, 1.9 * s, 1.5 * s);
}

// ── the lit windows ───────────────────────────────────────────────────────────────────────────────────────
/**
 * The leaves of a geometry that are windows: groups of touching triangles that make a thin upright slab, in a plane along x
 * or z, at least 0.3 m wide and high. Each: { x0, y0, z0, x1, y1, z1 }.
 */
export function slabsOf(g, thick = 0.2) {
  const out = [];
  for (const b of boxesOf(g)) {
    const dx = b.x1 - b.x0, dz = b.z1 - b.z0, dy = b.y1 - b.y0, th = Math.min(dx, dz), w = Math.max(dx, dz);
    if (th > thick || w < 0.3 || dy < 0.3 || th < 0.002) continue;
    out.push(b);
  }
  return out;
}
/** The boxes of the connected pieces of a geometry (triangles that share a corner are one piece): { x0, y0, z0, x1, y1, z1 } each. */
export function boxesOf(g) {
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
  return [...box.values()];
}
/** The lit panes for one slab: a sheet a hair off each of its two faces (full leaf less a frame's width). */
function panesOf(H, b, off) {
  const thinX = b.x1 - b.x0 < b.z1 - b.z0, m = 0.035, y0 = b.y0 + m, y1 = b.y1 - m;
  if (y1 - y0 < 0.15) return;
  // (each room its own strength, by the hash of its place: a lamp near the window or far back)
  const f = 0.55 + 0.4 * hashAt((b.x0 + b.x1) / 2, (b.z0 + b.z1) / 2, 23 + Math.floor(b.y0 / 2.5));
  if (thinX) {
    const z0 = b.z0 + m, z1 = b.z1 - m;
    for (const [x, nx] of [[b.x1 + off, 1], [b.x0 - off, -1]]) H.quad([x, y0, z0], [x, y0, z1], [x, y1, z1], [x, y1, z0], [nx, 0], f);
  } else {
    const x0 = b.x0 + m, x1 = b.x1 - m;
    for (const [z, nz] of [[b.z1 + off, 1], [b.z0 - off, -1]]) H.quad([x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z], [0, nz], f);
  }
}
/**
 * Wrap a builder context so that the windows it makes glow at night: each latticed leaf (a slab of a `lattice*` material, or a
 * thin sheet of paper `plaster_white`) gets a pane of lamp-light on each face if its room (a cell of the settlement by hash:
 * 4 m × 3 m storeys) is one of those lit, `share` of them. Returns { ctx, finish } — call finish() once the element is built.
 */
export function litWindows(ctx, share = 0.35, seed = 11) {
  const H = new Halo(), real = ctx.bag;
  const lit = (b) => hashAt(Math.floor((b.x0 + b.x1) / 8) * 4, Math.floor((b.z0 + b.z1) / 8) * 4, seed + Math.floor((b.y0 + b.y1) / 6)) < share;
  const bag = new Proxy(real, {
    get(t, k) {
      if (k === 'add') return (mat, g) => {
        if (typeof mat === 'string' && g?.attributes?.position && (mat.startsWith('lattice') || mat === 'plaster_white')) {
          const paper = mat === 'plaster_white', n = g.attributes.position.count;
          if (!paper || n <= 36) for (const b of slabsOf(g, paper ? 0.02 : 0.2)) if (lit(b)) panesOf(H, b, paper ? 0.006 : 0.004);
        }
        return t.add(mat, g);
      };
      const v = t[k];
      return typeof v === 'function' ? v.bind(t) : v;
    },
  });
  return { ctx: { ...ctx, bag }, finish: () => H.flush(real), halo: H };
}

/**
 * Wrap a builder context so that every glow shade it makes (`lamp_paper`, `lamp_white`, `lamp_glass`) throws its light: the glow round it,
 * a pool on the floor `floor` under it (the element's floor; a shade hung under 0.9 m of the floor gives none) and, for the lanterns of a
 * street front, nothing on a wall (the front is open). `s` scales the light (a small lantern 0.25 m across gives s 1).
 * Returns { ctx, finish }.
 */
export function lampLights(ctx, floor, { pool = 2.2, scale = 1, max = 24 } = {}) {
  const H = new Halo(), real = ctx.bag;
  let n = 0;
  const bag = new Proxy(real, {
    get(t, k) {
      if (k === 'add') return (mat, g) => {
        if ((mat === 'lamp_paper' || mat === 'lamp_white' || mat === 'lamp_glass') && g?.attributes?.position && n < max) {
          for (const b of boxesOf(g)) {
            const w = Math.max(b.x1 - b.x0, b.z1 - b.z0), h = b.y1 - b.y0;
            if (n >= max || w < 0.12 || w > 1.6 || h < 0.1 || h > 2.2) continue;
            const cx = (b.x0 + b.x1) / 2, cz = (b.z0 + b.z1) / 2, cy = (b.y0 + b.y1) / 2, s = Math.max(0.5, Math.min(1.7, w / 0.3)) * scale;
            H.ball(cx, cy, cz, 0.95 * s);
            if (cy - floor > 0.9 && cy - floor < 5.5) H.floor(cx, floor + 0.03, cz, pool * s * (0.7 + 0.3 * Math.min(1, (cy - floor) / 2.4)));
            n++;
          }
        }
        return t.add(mat, g);
      };
      const v = t[k];
      return typeof v === 'function' ? v.bind(t) : v;
    },
  });
  return { ctx: { ...ctx, bag }, finish: () => H.flush(real), halo: H };
}
