// Nan Madol c. 1300 by night — what lit it and the light it throws (docs/settlements/nan-madol.md §14.2).
// Oil lamps (a coconut shell of oil and a wick), the stones of the earth ovens and the cook-shed's fires, the lamps on poles at the courts' gates, the
// offering lamp in the crypt, a torch on some canoes for night fishing on the reef: all [inferred], no source describes the place at night. No candle, no
// lantern, no glass. Everything here is geometry in one material, `halo` (palette.js): light ADDED over what is behind it, at night only, with no light,
// shadow or collision, so the day view is unchanged and it shows at the low preset. The shape of each piece is carried by its normals (y: 1 at a disc's
// middle, 0 at its rim). The style's own flames (material 'flame') are the sources: every one the style draws gets its glow, so that the glow and the
// lamp agree; the elements are wrapped from here, each light a function of its own place (no counters, no Math.random).
import '../../styles/nanmadol/index.js';
import { BufferGeometry, Float32BufferAttribute, Matrix4 } from '../../core/three.js';
import { lathe, rod } from '../../core/geom.js';
import { STYLES } from '../../core/build.js';

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
  /** A flat sheet (a lit opening) of brightness f, facing n = [x, z]. */
  quad(a, b, c, d, n, f) { const q = Math.sqrt(1 - f * f), N = [n[0] * q, f, n[1] * q]; this.tri(a, N, b, N, c, N); this.tri(a, N, c, N, d, N); }
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
const frameAt = (c, yaw) => { const ca = Math.cos(yaw), sa = Math.sin(yaw); return (u, v) => [c[0] + u * ca + v * sa, c[1] - u * sa + v * ca]; };

/** One piece of halo: `fn(H)` draws it, it is added to `bag` whole (a repeated shape is then drawn instanced, in one draw with all its copies). */
const piece = (bag, fn) => { const H = new Halo(); fn(H); H.flush(bag); };
/** The standard low flame (an oil lamp on a mat, the stones of an oven, the lamp in a store): one shape everywhere, so that all of them are one instanced draw. */
const lowFlame = (bag, x, fy, z) => piece(bag, (H) => { H.ball(x, fy + 0.3, z, 0.9, 0.5); H.floor(x, fy + 0.04, z, 1.6, 1.5, 10, 0.75); });
/** The lamp on a pole (1.9 m): the ball at the flame, the pool on the ground under it. */
const poleFlame = (bag, x, fy, z) => piece(bag, (H) => { H.ball(x, fy + 0.1, z, 1.0, 0.55); H.floor(x, 0.05, z, 2.2, 2.0, 10, 0.7); });
/** A window of a closed nah (a thin slab 0.45 × 0.56): the lamp shows through the lashed reed [inferred]. */
const windowSheets = (bag, g) => {
  const b = bounds(g), dx = b[3] - b[0], dz = b[5] - b[2], dy = b[4] - b[1], th = Math.min(dx, dz), w = Math.max(dx, dz);
  if (!(th < 0.2 && dy > 0.4 && dy < 0.5 && w > 0.5 && w < 0.62)) return;
  piece(bag, (H) => {
    const f = 0.42 + 0.2 * hashAt((b[0] + b[3]) / 2, (b[2] + b[5]) / 2, 5), m = 0.04, o = 0.04;
    if (dx < dz) for (const sgn of [1, -1]) { const x = (sgn > 0 ? b[3] : b[0]) + sgn * o; H.quad([x, b[1] + m, b[2] + m], [x, b[1] + m, b[5] - m], [x, b[4] - m, b[5] - m], [x, b[4] - m, b[2] + m], [sgn, 0], f); }
    else for (const sgn of [1, -1]) { const z = (sgn > 0 ? b[5] : b[2]) + sgn * o; H.quad([b[0] + m, b[1] + m, z], [b[3] - m, b[1] + m, z], [b[3] - m, b[4] - m, z], [b[0] + m, b[4] - m, z], [0, sgn], f); }
  });
};

let depth = 0;
/**
 * Wrap one style element: each flame it draws (material 'flame') gets its glow, of the shape `glow(bag, x, y, z)` says; in a nah, the window openings
 * glow too once a lamp burns in it. `extra(el, real)` adds what the element carries besides (ovens, a torch). Not in the landmark's plan (its lamps are
 * the islets plan's, from `nm_glow`: one halo mesh for the settlement, not one more draw).
 */
const wrap = (fn, glow, extra = null, win = false) => function lit(el, ctx) {
  if (depth > 0 || !ctx?.bag) return fn.call(this, el, ctx);
  const real = ctx.bag, landmark = ctx.plan?.id === 'nandauwas';
  let flame = false;
  const bag = new Proxy(real, {
    get(t, k) {
      if (k === 'add') return (mat, g, ...r) => {
        if (mat === 'flame' && g?.attributes?.position && !landmark) { const b = bounds(g); flame = true; glow(real, (b[0] + b[3]) / 2, b[1], (b[2] + b[5]) / 2); }
        else if (mat === 'flame') flame = true;
        else if (mat === 'opening' && win && flame && g?.attributes?.position) windowSheets(real, g);
        return t.add(mat, g, ...r);
      };
      const v = t[k];
      return typeof v === 'function' ? v.bind(t) : v;
    },
  });
  depth++;
  let r;
  try { r = fn.call(this, el, { ...ctx, bag }); } finally { depth--; }
  if (!landmark) extra?.(el, real);
  return r;
};

let done = false;
export function registerNight() {
  if (done) return; done = true;
  const E = STYLES.nanmadol.elements, put = (real, M, mat, g) => { g.applyMatrix4(M); real.add(mat, g); };
  E.nah = wrap(E.nah, lowFlame, null, true);
  E.court = wrap(E.court, poleFlame, (el, real) => {
    // the offering lamp in the crypt, lit beside the bier [inferred]; the tomb court's gate lamps are the court lamps
    if (el.kind === 'tombgift') { const [x, z] = el.c; real.add('bark_dark', lathe([[0.001, 0], [0.07, 0.01], [0.08, 0.06], [0.001, 0.06]], 6, null, x + 0.75, 0.56, z)); real.add('flame', lathe([[0.001, 0.06], [0.015, 0.075], [0.001, 0.13]], 5, null, x + 0.75, 0.56, z)); lowFlame(real, x + 0.75, 0.62, z); }
  });
  E.works = wrap(E.works, lowFlame, (el, real) => {
    if (el.kind !== 'cookshed') return;
    // the stones of each earth oven glow under the leaves; the cook-shed's fires burn on through the night
    const W = frameAt(el.c, el.yaw ?? 0), n = Math.max(3, Math.floor(el.l / 4));
    for (let i = 0; i < n; i++) { const [x, z] = W(-el.l / 2 + (i + 0.5) * el.l / n, 0); lowFlame(real, x, 0, z); }
  });
  E.cookhouse = wrap(E.cookhouse, lowFlame, (el, real) => { lowFlame(real, el.c[0], 0, el.c[1]); });
  E.canoe = wrap(E.canoe, lowFlame, (el, real) => {
    // a torch for night fishing at the bow of every third canoe at a landing (by its place): a pole, a bundle of dry frond, the flame [inferred]
    if (el.afloat || hashAt(el.at[0], el.at[1], 3) > 0.34) return;
    const L = el.len ?? 7, yaw = el.yaw ?? 0, y0 = el.y ?? 0, D = 0.62, M = new Matrix4().makeRotationY(yaw).setPosition(el.at[0], y0, el.at[1]), u = -L / 2 + 1.0;
    put(real, M, 'timber', rod([0, D, u], [0.05, D + 1.35, u], 0.02, 5));
    put(real, M, 'bark_dark', lathe([[0.001, 0], [0.07, 0.04], [0.06, 0.2], [0.001, 0.24]], 6, null, 0.05, D + 1.3, u));
    put(real, M, 'flame', lathe([[0.001, 0.2], [0.035, 0.26], [0.001, 0.44]], 5, null, 0.05, D + 1.3, u));
    const ca = Math.cos(yaw), sa = Math.sin(yaw), q = [el.at[0] + 0.05 * ca + u * sa, y0 + D + 1.85, el.at[1] - 0.05 * sa + u * ca];
    piece(real, (H) => { H.ball(q[0], q[1], q[2], 1.1, 0.6); H.floor(q[0], y0 + 0.25, q[2], 2.6, 2.6, 10, 0.5); });
  });
  // the lamps of the landmark's courts and gates, in the islets' plan (the landmark's plan is not given a halo mesh of its own)
  E.nm_glow = (el, { bag }) => { for (const [x, z] of el.list) poleFlame(bag, x, 1.78, z); };
}
registerNight();
