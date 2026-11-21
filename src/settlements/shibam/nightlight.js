// Shibam c. 1700 by night — what lit the walled town of mudbrick towers, and the light it throws (docs/settlements/shibam.md §17).
// Lit by oil lamps (sesame or castor oil in a clay saucer with a wick), a niche with a lamp beside the street door, a lamp hung in every shop and
// in the coffee houses, resinous torches and iron baskets of burning wood (cressets) at the gate, the palace's door and the mosque's door, and
// a lamp in the lantern of the minaret for the night prayers; the high rooms show a lamp through the lattice. Nothing electric: 1700.
// Everything here is geometry in the engine's additive `halo` material (palette.js 'halo'): light ADDED over what is behind it, at night only, with
// no light, no shadow and no collision, so the day view is unchanged and the glow shows at the low preset. The shape of each piece is carried by its
// normals (y: 1 at a disc's middle, 0 at its rim). The style's elements are wrapped from here (the style files stay as they were): the windows glow
// by the hash of their own place, the lamps in the niches and the lights of the shops get their halos. Each light is a function of its own place:
// no counters, no Math.random. The method is that of the Suzhou reference, written for Shibam's lamps; nothing of Suzhou's is imported.

import '../../styles/hadhrami/index.js';
import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';
import { lathe, rod } from '../../core/geom.js';
import { STYLES } from '../../core/build.js';
import { windowPieces, nichePieces } from '../../styles/hadhrami/parts.js';
import { GH, houseDims } from '../../styles/hadhrami/dims.js';

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
  /** A disc lying flat at height y, rx by rz across, k its strength. */
  floor(x, y, z, r, rz = r, segs = 8, k = 1) { this.disc([x, y, z], [1, 0, 0], [0, 0, 1], r, rz, null, segs, [k, 0.42 * k, 0]); }
  /** The glow round a flame: three upright discs crossed at 60 degrees. */
  ball(x, y, z, r, k = 0.62) {
    for (let i = 0; i < 3; i++) { const a = i * Math.PI / 3 + 0.37, c = Math.cos(a), s = Math.sin(a); this.disc([x, y, z], [c, 0, s], [0, 1, 0], r, r, [-s, c], 8, [k, 0], [0, 1]); }
  }
  /** A flat sheet (a lit window) of brightness f, facing n = [x, z]. */
  quad(a, b, c, d, n, f) { const q = Math.sqrt(1 - f * f), N = [n[0] * q, f, n[1] * q]; this.tri(a, N, b, N, c, N); this.tri(a, N, c, N, d, N); }
  flush(bag) {
    if (!this.pos.length) return;
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute(this.pos, 3)); g.setAttribute('normal', new Float32BufferAttribute(this.nor, 3));
    bag.add(MAT, g); this.pos = []; this.nor = [];
  }
}

const bounds = (g) => {
  const P = g.attributes.position.array, b = [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity];
  for (let i = 0; i < P.length; i += 3) for (let k = 0; k < 3; k++) { if (P[i + k] < b[k]) b[k] = P[i + k]; if (P[i + k] > b[k + 3]) b[k + 3] = P[i + k]; }
  return b;
};

/** The halo of one light of a plan (`lights` entries: { at, distance, intensity }). */
function lightHalo(H, l, floor) {
  const [x, y, z] = l.at, d = l.distance ?? 6, k = Math.min(1, (l.intensity ?? 2) / 2.4);
  H.ball(x, y, z, Math.max(0.42, Math.min(0.95, d * 0.11)) * (0.8 + 0.2 * k));
  if (floor !== undefined && y - floor < 3.0 && y - floor > 0.2) H.floor(x, floor + 0.03, z, Math.max(1.3, Math.min(3.4, d * 0.42)), Math.max(1.3, Math.min(3.4, d * 0.42)), 10, 0.8);
}

let WINS = null;
/** The geometry of the dark opening of each window kind, to tell the style's instanced windows apart: Map(geometry -> [w, h, lit share]). */
function winMap() {
  if (WINS) return WINS;
  WINS = new Map();
  for (const [kind, w, h, share] of [['small', 0.5, 0.8, 0.2], ['big', 0.8, 1.25, 0.3], ['white', 0.85, 1.3, 0.36]]) WINS.set(windowPieces(kind)[0][1], [w, h, share]);
  WINS.set(nichePieces()[0][1], [0.3, 0.38, -1]);
  return WINS;
}

/**
 * A bag that adds, beside everything the element puts in, the glow of its lit windows and niche lamps: the instanced windows of the style (by the
 * geometry of their opening) and the loose quads of the climbable houses (a planar piece 0.45–1.3 m high in a wall's plane). `H` collects the halo.
 */
function litBag(ctx, el, scale = 1) {
  const H = new Halo(), real = ctx.bag, [x0, z0, x1, z1] = el.rect, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  const W = winMap();
  const bag = new Proxy(real, {
    get(t, k) {
      if (k === 'addInstance') return (mat, g, m, o) => {
        const spec = mat === 'opening' ? W.get(g) : null;
        if (spec) {
          const e = m.elements, [w, h, share] = spec, px = e[12], py = e[13], pz = e[14], nx = e[8], nz = e[10], hw = w / 2;
          if (share < 0) {
            // the niche's lamp: a small glow before the wall
            if (hashAt(px, pz, 21) < 0.8) H.ball(px + nx * 0.14, py + 0.2, pz + nz * 0.14, 0.34, 0.5);
          } else if (py > GH + 0.5 && hashAt(px, pz, 31 + Math.floor(py / 2.5)) < share * scale) {
            const f = 0.4 + 0.34 * hashAt(px, pz, 7), m0 = 0.04, z = 0.06;
            const P = (lx, ly) => [e[0] * lx + e[4] * ly + e[8] * z + px, py + ly, e[2] * lx + e[6] * ly + e[10] * z + pz];
            H.quad(P(-hw + m0, m0), P(hw - m0, m0), P(hw - m0, h - m0), P(-hw + m0, h - m0), [nx, nz], f);
          }
        }
        return t.addInstance(mat, g, m, o);
      };
      if (k === 'add') return (mat, g, ...r) => {
        if (mat === 'opening' && g?.attributes?.position) {
          const b = bounds(g), dx = b[3] - b[0], dz = b[5] - b[2], dy = b[4] - b[1], th = Math.min(dx, dz), w = Math.max(dx, dz);
          if (th < 0.02 && dy > 0.6 && dy < 1.4 && w > 0.4 && w < 0.95 && b[1] > GH + 0.5) {
            const mx = (b[0] + b[3]) / 2, mz = (b[2] + b[5]) / 2;
            if (hashAt(mx, mz, 33 + Math.floor(b[1] / 2.5)) < 0.26 * scale) {
              const f = 0.4 + 0.34 * hashAt(mx, mz, 9), m0 = 0.04, o = 0.2 + 0.02;
              if (dx < dz) { const s = mx > cx ? 1 : -1, x = (s > 0 ? b[3] : b[0]) + s * o; H.quad([x, b[1] + m0, b[2] + m0], [x, b[1] + m0, b[5] - m0], [x, b[4] - m0, b[5] - m0], [x, b[4] - m0, b[2] + m0], [s, 0], f); }
              else { const s = mz > cz ? 1 : -1, z = (s > 0 ? b[5] : b[2]) + s * o; H.quad([b[0] + m0, b[1] + m0, z], [b[3] - m0, b[1] + m0, z], [b[3] - m0, b[4] - m0, z], [b[0] + m0, b[4] - m0, z], [0, s], f); }
            }
          }
        }
        return t.add(mat, g, ...r);
      };
      const v = t[k];
      return typeof v === 'function' ? v.bind(t) : v;
    },
  });
  return { ctx: { ...ctx, bag }, H };
}

let depth = 0;
/** Wrap one element builder of the hadhrami style: the lit windows and niche lamps, the halo of every light it adds, the spill of an open door. */
const wrap = (name, fn) => function haloed(el, ctx) {
  const lights = ctx?.lights, n = lights ? lights.length : 0;
  if (depth > 0 || !lights || el.simple || !el.rect) { depth++; try { return fn.call(this, el, ctx); } finally { depth--; } }
  const L = litBag(ctx, el, el.hall ? 0.8 : 1);
  depth++;
  try { var r = fn.call(this, el, L.ctx); } finally { depth--; }
  const H = L.H, [x0, z0, x1, z1] = el.rect;
  for (const l of lights.slice(n)) lightHalo(H, l, (l.at[1] < GH ? 0.06 : undefined));
  // the open front of a shop, the palace's hall: the lamp's light spilling over the sill into the street
  if (name === 'tower_house' && (el.shop || el.hall) && el.door !== undefined) {
    const nn = el.front === 'n', out = nn ? -1 : 1, zf = nn ? z0 : z1, w = el.hall ? 3.2 : (el.shop?.doorW ?? 1.5);
    H.floor(el.door, 0.07, zf + out * 1.1, 1.1 + w * 0.6, 1.5, 8, 0.7);
  }
  if (name === 'tower_open') H.floor(x0 - 1.2, 0.07, houseDims(el.rect).doorZ, 1.5, 1.1, 8, 0.55);
  H.flush(ctx.bag);
  return r;
};

/**
 * shb_cresset: { at: [x, z], y, h? } — an iron basket on a tall post, filled with burning wood and resinous splinters (the light of a gate, a palace door
 * and the mosque's door at night [inferred]); the post with its three braces, the basket's ribs, the flames; the glow and its pool on the ground.
 */
function cresset({ at, y = 0, h = 1.7 }, { bag, col, lights }) {
  const [x, z] = at, H = new Halo(), q = hashAt(x, z, 5), s = (h / 1.7) * (0.95 + 0.1 * q);
  bag.add('iron', rod([x, y, z], [x, y + 1.45 * s, z], 0.035, 6));
  for (let i = 0; i < 3; i++) { const a = i * TAU / 3 + q * 2; bag.add('iron', rod([x + Math.cos(a) * 0.3, y, z + Math.sin(a) * 0.3], [x, y + 0.5 * s, z], 0.02, 4)); }
  bag.add('iron', lathe([[0.001, 0], [0.07, 0.02], [0.17, 0.14], [0.2, 0.2], [0.19, 0.21], [0.16, 0.17], [0.001, 0.05]], 10, null, x, y + 1.42 * s, z));
  for (let i = 0; i < 4; i++) { const a = i * TAU / 4 + 0.4; bag.add('iron', rod([x + Math.cos(a) * 0.07, y + 1.45 * s, z + Math.sin(a) * 0.07], [x + Math.cos(a) * 0.2, y + 1.62 * s, z + Math.sin(a) * 0.2], 0.008, 3)); }
  bag.add('flame', lathe([[0.001, 0], [0.11, 0.03], [0.09, 0.18], [0.04, 0.34 + 0.08 * q], [0.001, 0.46 + 0.1 * q]], 7, null, x, y + 1.6 * s, z));
  col.circle(x, z, 0.22, y, y + 1.65 * s);
  const l = { at: [x, y + 1.9 * s, z], color: '#ff9a4a', intensity: 3.4, distance: 10 };
  lights.push(l);
  H.ball(x, y + 1.95 * s, z, 1.0, 0.7); H.floor(x, y + 0.03, z, 3.4, 3.4, 10, 0.8);
  H.flush(bag);
}

/** shb_minaretlamp: { c: [x, z], y } — the lamp lit in the lantern of the minaret for the night prayers [inferred]: a glow in its four pointed openings. */
function minaretLamp({ c, y }, { bag }) {
  const H = new Halo();
  H.ball(c[0], y, c[1], 1.5, 0.6);
  H.flush(bag);
}

/**
 * shb_stalllamps: { pts: [[x, z], ...], y?, h? } — the oil lamp hung from the front pole of a stall for the evening market [inferred]: a clay saucer's
 * flame under the awning's edge, its glow and a pool of light on the ground and the goods.
 */
function stallLamps({ pts, y = 0, h = 1.95 }, { bag }) {
  const H = new Halo();
  for (const [x, z] of pts) {
    const q = hashAt(x, z, 8), yy = y + h + 0.1 * q;
    bag.add('flame', lathe([[0.001, 0], [0.03, 0.02], [0.02, 0.07], [0.001, 0.13]], 6, null, x, yy, z));
    H.ball(x, yy + 0.06, z, 0.5 + 0.1 * q, 0.6); H.floor(x, y + 0.05, z, 2.1, 1.7, 10, 0.55);
  }
  H.flush(bag);
}

/**
 * shb_walllamps: { pts: [[x, z, s]], y? } — a clay lamp on an iron bracket from a street wall (s = +1: the wall lies to the east of the point, -1: west), lit at
 * night; the lamps that light the main street between the gate and the square [inferred].
 */
function wallLamps({ pts, y = 2.3 }, { bag }) {
  const H = new Halo();
  for (const [x, z, s] of pts) {
    H.ball(x, y + 0.06, z, 0.55, 0.6); H.floor(x - s * 0.9, 0.05, z, 2.4, 2.4, 10, 0.5);
  }
  H.flush(bag);
}

let done = false;
/** Wraps the hadhrami style's house builders (once, after the style has registered itself). */
export function registerNight() {
  if (done) return; done = true;
  const E = STYLES.hadhrami.elements;
  for (const k of ['tower_house', 'tower_open', 'tower_up']) if (typeof E[k] === 'function') E[k] = wrap(k, E[k]);
  E.shb_cresset = cresset; E.shb_stalllamps = stallLamps; E.shb_walllamps = wallLamps; E.shb_minaretlamp = minaretLamp;
}
registerNight();
