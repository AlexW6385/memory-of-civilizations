// SG̱ang Gwaay Llnagaay by night — what lit it and the light it throws (docs/settlements/sgang-gwaay.md §11b).
// Fire is the light of the place: the hearth in the pit of each house under its smoke hole (never let out in the wet), the open fires
// of the street, the torch of a night fisher in a canoe. No lamp, no candle, no glass in 1850's village [inferred]. Everything here is
// geometry in one material, `halo` (palette.js): light ADDED over what is behind it, at night only, with no light, shadow or
// collision, so the day view is unchanged and it shows at the low preset. Each piece's shape is carried by its normals (|y| is the
// brightness: 1 at a disc's middle, 0 at its rim). The haida style's elements are wrapped from here (the style file stays as it was);
// each light is a function of its own place (no counters, no Math.random).
import '../../styles/haida/index.js';
import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';
import { STYLES } from '../../core/build.js';
import { height } from './layout.js';

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
  /** A pool of light lying flat at height y, its long axis turned by yaw (rz along the turned z). */
  floor(x, y, z, r, rz = r, yaw = 0, segs = 8, k = 1) { const c = Math.cos(yaw), s = Math.sin(yaw); this.disc([x, y, z], [c, 0, -s], [s, 0, c], r, rz, null, segs, [k, 0.42 * k, 0]); }
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

/** The glow of one plank house: the fire in the pit and the ball of light round it, the smoke hole glowing on the roof (the smoke lit from below),
 *  the doorway's lit opening in the pole's foot and its spill on the street, and the glow of the fire through the gaps of the roof planks along the ridge. */
function houseGlow(H, el) {
  const g = el.g ?? 1, yP = g - 1.2, cs = Math.cos(el.yaw), sn = Math.sin(el.yaw), hd = el.d / 2, ridgeY = g + el.ridge;
  const W = (u, v) => [el.c[0] + u * cs + v * sn, el.c[1] - u * sn + v * cs];
  // some hearths are banked low for the night, the landmark's burns high (its people are awake with the drum)
  const strong = el.landmark ? 1 : 0.62 + 0.38 * hashAt(el.c[0], el.c[1], 11);
  const [hx, hz] = W(0, 0);
  H.ball(hx, yP + 0.55, hz, 1.0 * strong + 0.2, 0.74 * strong);
  H.floor(hx, yP + 0.09, hz, 2.0, 1.8, el.yaw, 10, 0.9 * strong);
  const [sx, sz] = W(0.75, 0);
  H.ball(sx, g + el.ridge - 1.1, sz, 1.9, 0.3 * strong);                    // the roof's under-side and the beams, lit
  H.ball(sx, ridgeY + 0.55, sz, 1.1 * strong + 0.3, 0.5 * strong);          // the smoke hole's glow on the roof, in the smoke
  // the door: the lit opening (a sheet inside the wall's thickness, seen through the carved oval) and the light on the street before it
  const f = 0.45 * strong + 0.1, ul = 0.42, v = -hd + 0.28, yb = g + 0.06, yt = g + 1.7;
  const a = W(-ul, v), b = W(ul, v);
  H.quad([a[0], yb, a[1]], [b[0], yb, b[1]], [b[0], yt, b[1]], [a[0], yt, a[1]], [sn, -cs] , f);
  const [dx, dz] = W(0, -hd - 3.0);
  H.floor(dx, height(dx, dz) + 0.05, dz, 2.6, 3.4, el.yaw, 10, 0.55 * strong);
}
const lit = (fn, add) => function glowing(el, ctx) {
  const r = fn.call(this, el, ctx);
  if (ctx?.lights) { const H = new Halo(); add(H, el); H.flush(ctx.bag); }
  return r;
};
let done = false;
export function registerNight() {
  if (done) return; done = true;
  const E = STYLES.haida.elements;
  E.haida_house = lit(E.haida_house, houseGlow);
  // the open fires of the street (split salmon on stakes about them) and the torch at a canoe's bow
  E.haida_prop = lit(E.haida_prop, (H, el) => {
    if (el.kind !== 'fire') return;
    const y = el.y ?? height(...el.c), [x, z] = el.c;
    H.ball(x, y + 0.5, z, 1.0, 0.7); H.floor(x, y + 0.05, z, 2.8, 2.6, 0, 10, 0.85);
  });
  E.haida_canoe = lit(E.haida_canoe, (H, el) => {
    // a night fisher's pitch torch at the bow of some of the moored canoes, its light on the water (a negative normal is the water's ripple)
    if (!el.moored || hashAt(el.c[0], el.c[1], 5) > 0.55) return;
    const s = Math.sin(el.yaw), c = Math.cos(el.yaw), bx = el.c[0] - s * (el.l / 2 - 0.5), bz = el.c[1] - c * (el.l / 2 - 0.5);
    H.ball(bx, el.y + 1.7, bz, 0.7, 0.62);
    H.floor(bx, el.y + 0.32, bz, 2.4, 2.4, 0, 10, 0.5);
  });
}
registerNight();
