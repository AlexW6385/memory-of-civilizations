// Çatalhöyük by night — what lit it and the light it throws (docs/settlements/catalhoyuk.md §14.2).
// Fire is the only light of the place: the hearth under each hatch (the smoke lit from beneath as it leaves), the mouth of an oven with
// embers, the fire pits of the courts and the town's yards. No lamp is shown (§14.2: none is certain), no glass, no window (the houses
// have none, §12). Everything here is geometry in one material, `halo` (palette.js): light ADDED over what is behind it, at night
// only, with no light, shadow or collision, so the day view is unchanged and it shows at the low preset. The shape of each piece is
// carried by its normals (y: 1 at a disc's middle, 0 at its rim). The style's elements are wrapped from here (the style files stay as
// they were); each light is a function of its own place (no counters, no Math.random).
import '../../styles/catal/index.js';
import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';
import { STYLES } from '../../core/build.js';
import { cellGeom } from '../../styles/catal/cell.js';

const TAU = Math.PI * 2;
/** A number in [0, 1) from a position alone. */
export function hashAt(x, z, s = 0) {
  let h = (Math.round(x * 16) * 73856093) ^ (Math.round(z * 16) * 19349663) ^ Math.imul(s + 1, 83492791);
  h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
/** Triangles of the halo material (position and a normal per corner). */
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
  /** A disc lying flat at height y: the pool of a fire on the ground or a floor. */
  floor(x, y, z, r, rz = r, segs = 8, k = 1) { this.disc([x, y, z], [1, 0, 0], [0, 0, 1], r, rz, null, segs, [k, 0.42 * k, 0]); }
  /** The glow round a flame: three upright discs crossed at 60 degrees. */
  ball(x, y, z, r, k = 0.62) {
    for (let i = 0; i < 3; i++) { const a = i * Math.PI / 3 + 0.37, c = Math.cos(a), s = Math.sin(a); this.disc([x, y, z], [c, 0, s], [0, 1, 0], r, r, [-s, c], 8, [k, 0], [0, 1]); }
  }
  flush(bag) {
    if (!this.pos.length) return;
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute(this.pos, 3)); g.setAttribute('normal', new Float32BufferAttribute(this.nor, 3));
    bag.add('halo', g); this.pos = []; this.nor = [];
  }
}
const bounds = (g) => {
  const P = g.attributes.position.array, b = [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity];
  for (let i = 0; i < P.length; i += 3) for (let k = 0; k < 3; k++) { if (P[i + k] < b[k]) b[k] = P[i + k]; if (P[i + k] > b[k + 3]) b[k + 3] = P[i + k]; }
  return b;
};
/** The share of the closed houses that keep a fire in (the rest let it die: the hatch dark) and of the court and yard fires still burning. */
export const HEARTH_LIT = 0.62, YARD_LIT = 0.7;
/** Glow over a hatch: the smoke of the hearth below, lit from beneath, standing over the hole. */
function hatchGlow(H, x, y, z, k = 0.5) { H.ball(x, y + 0.45, z, 0.95, k); H.floor(x, y + 0.2, z, 0.8, 0.8, 8, 0.35); }
/** A hearth in a room: the ball of the fire and the pool of it on the plaster floor. */
function hearthGlow(H, x, F, z) { H.ball(x, F + 0.4, z, 0.8, 0.7); H.floor(x, F + 0.03, z, 1.7, 1.5, 10, 0.9); }

// the pieces of the style's elements that mean a fire, found by their own shape in the bag (the style files are not edited):
//   a hatch's black opening, 0.9 x 0.9 m and 0.32 high, on a closed house's roof
//   an oven's mouth (an 'opening' 0.28-0.36 m high, not wider than 0.5 m)
//   a hearth's flame (a 'flame' lathe, 0.3 m high)
//   a fire pit's bed of ash (a 'pottery_dark' disc 0.6-0.7 m across and 0.02 high)
function watch(real, H, state) {
  return new Proxy(real, {
    get(t, k) {
      if (k === 'add') return (mat, g, ...r) => {
        if (g?.attributes?.position) {
          if (mat === 'opening') {
            const b = bounds(g), dx = b[3] - b[0], dz = b[5] - b[2], dy = b[4] - b[1], mx = (b[0] + b[3]) / 2, mz = (b[2] + b[5]) / 2;
            if (Math.abs(dx - 0.9) < 0.02 && Math.abs(dz - 0.9) < 0.02 && Math.abs(dy - 0.32) < 0.02) { if (hashAt(mx, mz, 3) < HEARTH_LIT) hatchGlow(H, mx, b[4], mz, 0.3 + 0.25 * hashAt(mx, mz, 4)); }
            else if (dy > 0.27 && dy < 0.36 && Math.max(dx, dz) < 0.5 && Math.min(dx, dz) < 0.46 && hashAt(mx, mz, 9) < 0.8) { H.ball(mx, (b[1] + b[4]) / 2, mz, 0.5, 0.55); H.floor(mx, b[1] - 0.08, mz, 0.9, 0.9, 8, 0.45); }
          } else if (mat === 'pottery_dark') {
            const b = bounds(g), dx = b[3] - b[0], dz = b[5] - b[2], dy = b[4] - b[1], mx = (b[0] + b[3]) / 2, mz = (b[2] + b[5]) / 2;
            if (dx > 0.59 && dx < 0.69 && Math.abs(dx - dz) < 0.02 && dy > 0.015 && dy < 0.025 && b[1] < 0.05 && hashAt(mx, mz, 11) < YARD_LIT) { H.ball(mx, 0.3, mz, 0.7, 0.62); H.floor(mx, 0.04, mz, 2.1, 2.1, 10, 0.85); state.pits++; }
          } else if (mat === 'flame') {
            const b = bounds(g), dy = b[4] - b[1];
            if (dy > 0.28 && dy < 0.32) { hearthGlow(H, (b[0] + b[3]) / 2, b[1] - 0.08, (b[2] + b[5]) / 2); state.hearths++; }
          }
        }
        return t.add(mat, g, ...r);
      };
      const v = t[k];
      return typeof v === 'function' ? v.bind(t) : v;
    },
  });
}

let depth = 0;
/** Wrap an element builder: the same element, its bag watched for fires, and `extra(H, el)` for what the element does not show in its bag. */
const wrap = (fn, extra) => function lit(el, ctx) {
  if (depth > 0 || !ctx?.lights) { depth++; try { return fn.call(this, el, ctx); } finally { depth--; } }
  const H = new Halo(), real = ctx.bag, state = { pits: 0, hearths: 0 };
  depth++;
  let r;
  try { r = fn.call(this, el, { ...ctx, bag: watch(real, H, state) }); } finally { depth--; }
  extra?.(H, el);
  H.flush(real);
  return r;
};

/** The opened houses' hatches (the ladder's way out, and the smoke of the hearth below it): the glow over each hole (their fire is the flame found in the bag). */
function quarterExtra(H, el) {
  const X = (j) => el.x0 + el.cols.slice(0, j).reduce((a, b) => a + b, 0), Z = (i) => el.z0 + el.rows.slice(0, i).reduce((a, b) => a + b, 0);
  // rooftop cooking fires: on about one house roof in five a small fire burns on the roof by night (the roof is the yard) [inferred]
  for (let i = 0; i < el.rows.length; i++) for (let j = 0; j < el.cols.length; j++) {
    if (el.kind[i][j] !== 'h') continue;
    const x0 = X(j), z0 = Z(i);
    if (hashAt(x0, z0, 21) >= 0.22) continue;
    const fx = x0 + el.cols[j] * (0.3 + 0.4 * hashAt(x0, z0, 22)), fz = z0 + el.rows[i] * (0.62 + 0.2 * hashAt(x0, z0, 23)), ty = el.tops[i][j] + 0.09;
    H.ball(fx, ty + 0.3, fz, 0.65, 0.62); H.floor(fx, ty + 0.04, fz, 1.9, 1.9, 10, 0.8);
  }
  for (const e of el.enter || []) {
    const x0 = X(e.j), z0 = Z(e.i), g = cellGeom([x0, z0, x0 + el.cols[e.j], z0 + el.rows[e.i]], e.mirror), top = el.tops[e.i][e.j];
    hatchGlow(H, (g.hole[0] + g.hole[2]) / 2, top + 0.09, (g.hole[1] + g.hole[3]) / 2, 0.55);
  }
}
/** The landmark house: the hatch over the hearth (hole 0.8–2.4 m from the west wall, 3.9–4.9 m from the north), the storeroom dark beyond the partition. */
function houseExtra(H, el) {
  const [x0, z0] = el.rect, T = 0.45, top = el.top ?? 2.5;
  hatchGlow(H, x0 + T + 1.6, top + 0.09, z0 + T + 4.4, 0.6);
}
let done = false;
export function registerNight() {
  if (done) return; done = true;
  const E = STYLES.catal.elements;
  E.catal_quarter = wrap(E.catal_quarter, quarterExtra);
  E.catal_house = wrap(E.catal_house, houseExtra);
  E.catal_edge = wrap(E.catal_edge);
}
registerNight();
