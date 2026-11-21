// Knossos about 1600 BC by night — what lit the palace and the town, and the light it throws (docs/settlements/knossos.md §20.2).
// The lamp of the time is a bowl of olive oil (or animal fat, or wax) with two or more wicks, of serpentine or other stone on a tall columnar foot
// "probably used as fixed lighting devices for interior spaces" (Late Minoan I, found in palaces and houses; camu.gr), or of clay; torches stand
// before the palace's doors (§4e: the torch stands of the West Court); a house is lit by its hearth and one lamp.
// Everything here is geometry in one material, `halo` (palette.js, materials.js 'halo'): light ADDED over what is behind it, at night only, with no
// light, no shadow and no collision, so the day view is unchanged and the pools of real light (off at the low preset) are not needed. The shape of each
// piece is carried by its normals (y: 1 at a disc's middle, 0 at its rim): a glow round each flame (three crossed discs), a pool on the floor, and a pane
// before a lit window. Every element of the minoan style that puts a light into its plan is wrapped here (the style files stay as they were), the houses'
// windows glow by the hash of their own place, and the few new lamps are `kn_lampstand` elements. Each light is a function of its own place: no
// counters, no Math.random. The method is that of the Suzhou reference, written for Knossos' lamps; nothing of Suzhou's is imported.

import '../../styles/minoan/index.js';
import '../../styles/minoan/rooms.js';
import '../../styles/minoan/interiors.js';
import '../../styles/minoan/town.js';
import '../../styles/minoan/court.js';
import '../../styles/minoan/upper.js';
import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';
import { lathe } from '../../core/geom.js';
import { STYLES } from '../../core/build.js';
import { dwellingFrame } from '../../styles/minoan/town.js';

/** A number in [0, 1) from a position alone. */
export function hashAt(x, z, s = 0) {
  let h = (Math.round(x * 16) * 73856093) ^ (Math.round(z * 16) * 19349663) ^ Math.imul(s + 1, 83492791);
  h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

const TAU = Math.PI * 2, MAT = 'halo';
/** Triangles (position and a normal per corner) of the halo material; the brightness is the normal's y (1 at a disc's middle, 0 at its rim). */
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
  /** A disc lying flat at height y (the ground or a floor), rx by rz across, k its strength. */
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

/** The halo of one light of a plan (`lights` entries: { at, distance, intensity }); `floor` the height of the floor or ground it stands over, if known. */
function lightHalo(H, l, floor) {
  const [x, y, z] = l.at, d = l.distance ?? 6, k = Math.min(1, (l.intensity ?? 2) / 2.4);
  H.ball(x, y, z, Math.max(0.42, Math.min(0.95, d * 0.11)) * (0.8 + 0.2 * k));
  if (floor !== undefined && y - floor < 3.0 && y - floor > 0.2) H.floor(x, floor + 0.03, z, Math.max(1.3, Math.min(3.4, d * 0.42)), Math.max(1.3, Math.min(3.4, d * 0.42)), 10, 0.8);
}

const bounds = (g) => {
  const P = g.attributes.position.array, b = [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity];
  for (let i = 0; i < P.length; i += 3) for (let k = 0; k < 3; k++) { if (P[i + k] < b[k]) b[k] = P[i + k]; if (P[i + k] > b[k + 3]) b[k + 3] = P[i + k]; }
  return b;
};

/**
 * Wrap a dwelling's bag so that the openings of its walls that are windows (the upper-floor panes in red frames, the slits of the ground floor: a slab
 * under 0.05 m thick, 0.5–1.3 m high, in a wall's plane) glow with the lamp behind them in `share` of the cases (by the hash of the window's own place:
 * oil is dear), on the outward face only. Returns { ctx, H, finish }.
 */
function litWindows(ctx, el, share) {
  const H = new Halo(), real = ctx.bag, [x0, z0, x1, z1] = el.rect, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, y0 = el.y ?? 0;
  const bag = new Proxy(real, {
    get(t, k) {
      if (k === 'add') return (mat, g, ...r) => {
        if (mat === 'opening' && g?.attributes?.position) {
          const b = bounds(g), dx = b[3] - b[0], dz = b[5] - b[2], dy = b[4] - b[1], th = Math.min(dx, dz), w = Math.max(dx, dz);
          if (th < 0.05 && dy > 0.5 && dy < 1.3 && w > 0.14 && b[1] > y0 + 0.9) {
            const mx = (b[0] + b[3]) / 2, mz = (b[2] + b[5]) / 2, slit = w < 0.3, up = b[1] > y0 + 2.4;
            if (hashAt(mx, mz, 31 + Math.floor(b[1] / 2.5)) < (slit ? share * 0.6 : share) * (up ? 1 : 0.85)) {
              const f = 0.45 + 0.35 * hashAt(mx, mz, 7), m = 0.03, o = 0.012;
              const my = (b[1] + b[4]) / 2, sx = dx < dz ? (mx > cx ? 1 : -1) : 0, sz = dx < dz ? 0 : (mz > cz ? 1 : -1);
              H.ball(mx + sx * 0.35, my, mz + sz * 0.35, 0.8, 0.34);   // the glow of the lamp spilling out of the opening, not a flat pane alone
              if (dx < dz) { const s = mx > cx ? 1 : -1, x = (s > 0 ? b[3] : b[0]) + s * o; H.quad([x, b[1] + m, b[2] + m], [x, b[1] + m, b[5] - m], [x, b[4] - m, b[5] - m], [x, b[4] - m, b[2] + m], [s, 0], f); }
              else { const s = mz > cz ? 1 : -1, z = (s > 0 ? b[5] : b[2]) + s * o; H.quad([b[0] + m, b[1] + m, z], [b[3] - m, b[1] + m, z], [b[3] - m, b[4] - m, z], [b[0] + m, b[4] - m, z], [0, s], f); }
            }
          }
        }
        return t.add(mat, g, ...r);
      };
      const v = t[k];
      return typeof v === 'function' ? v.bind(t) : v;
    },
  });
  return { ctx: { ...ctx, bag }, H, finish: () => H.flush(real) };
}

let depth = 0;
/** Wrap one element builder: the halo of every light it adds, the lit windows and the spill of the door of a dwelling. */
const wrap = (name, fn) => function haloed(el, ctx) {
  const lights = ctx?.lights, n = lights ? lights.length : 0;
  if (depth > 0 || !lights || el.simple) { depth++; try { return fn.call(this, el, ctx); } finally { depth--; } }
  const dw = name === 'dwelling', L = dw ? litWindows(ctx, el, el.cls === 'poor' ? 0.2 : 0.3) : null;
  depth++;
  try { var r = fn.call(this, el, L ? L.ctx : ctx); } finally { depth--; }
  const H = L ? L.H : new Halo(), floor = dw ? (el.y ?? 0) + (el.enter ? 0.2 : 0) : (el.y ?? undefined);
  for (const l of lights.slice(n)) lightHalo(H, l, floor);
  if (dw && el.enter) {
    // the door ajar: the lamp's light spilling over the step into the lane
    const F = dwellingFrame(el), [px, pz] = F.P(F.du, -1.1);
    H.floor(px, (el.y ?? 0) + 0.06, pz, 2.2, 1.6, 8, 0.7);
    const [qx, qz] = F.P(F.du, 0.2);
    H.ball(qx, (el.y ?? 0) + 1.3, qz, 0.9, 0.5);   // the lamp seen in the doorway
  }
  H.flush(ctx.bag);
  return r;
};

/**
 * kn_lampstand: { at: [x, z], y, h? } — a lamp of serpentine on its tall columnar foot (the lamps of the palaces and houses: a central cavity for the oil,
 * two or more wick cuttings; 27 to 50 cm high on a foot up to a metre and more [stated: camu.gr, Minoan stone lamp, LM I]): the foot with its swelling
 * and its base, the bowl with two wicks burning; the glow and its pool on the floor.
 */
function lampstand({ at, y = 0, h = 1.1 }, { bag, col, lights }) {
  const [x, z] = at, H = new Halo(), q = hashAt(x, z, 5), s = (h / 1.1) * (0.94 + 0.12 * q), w = 0.9 + 0.2 * hashAt(x, z, 6);   // (no two feet alike: a shape repeated twelve times would be an instanced draw of its own)
  bag.add('serpentine', lathe([[0.001, 0], [0.16 * w, 0], [0.16 * w, 0.05], [0.07 * w, 0.12], [0.055 * w, 0.5 * s], [0.075 * w, (0.58 + 0.08 * q) * s], [0.055 * w, 0.7 * s], [0.052 * w, 0.92 * s], [0.14 * w, 1.02 * s], [0.17 * w, 1.08 * s], [0.15 * w, 1.1 * s], [0.11 * w, 1.07 * s], [0.001, 1.03 * s]], 14, null, x, y, z));
  for (const dx of [-0.07, 0.07]) bag.add('flame', lathe([[0.001, 0], [0.014 * (0.8 + 0.4 * hashAt(x + dx, z, 8)), 0.012], [0.01, 0.05], [0.001, 0.07 + 0.04 * hashAt(x, z + dx, 9)]], 6, null, x + dx * w, y + 1.09 * s, z));
  col.circle(x, z, 0.2, y, y + 1.1 * s);
  const l = { at: [x, y + 1.25 * s, z], color: '#ffb46b', intensity: 3.2, distance: 9 };
  lights.push(l);
  lightHalo(H, l, y);
  H.flush(bag);
}

let done = false;
/** Wraps the minoan style's elements that make lights (once, after every file of the style has registered its own). */
export function registerNight() {
  if (done) return; done = true;
  const E = STYLES.minoan.elements;
  if (!globalThis.process?.env?.KN_NONIGHT) for (const k of Object.keys(E)) if (typeof E[k] === 'function') E[k] = wrap(k, E[k]);
  E.kn_lampstand = lampstand;
}
registerNight();
