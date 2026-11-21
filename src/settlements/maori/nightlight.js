// The pā by night (docs/settlements/maori.md §4i): fire is the only light. The hearth of every house (no chimney: its glow shows through the
// door, the window and the thatch), the cooking places' fires, the watch fires inside the gates, a torch (rama) at the bow of each fishing canoe
// on the lake. No lamp, no candle, no glass. Everything here is geometry in one material, `halo` (palette.js): light ADDED over what is behind
// it, at night only, with no light, shadow or collision, so the day view is unchanged and it shows at the low preset. The shape of each piece is
// carried by its normals (y: 1 at a disc's middle, 0 at its rim). The style's elements are wrapped from here (the style files stay as they were);
// each light is a function of its own place (no counters, no Math.random).
import '../../styles/maori/index.js';
import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';
import { STYLES } from '../../core/build.js';
import { lathe, rod } from '../../core/geom.js';
import { HILL, LAKE, height } from './layout.js';

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
/** A frame at (cx, cz) turned by yaw: (u, v) of the thing -> world (x, z) (as `whare`'s W2). */
const frame = (cx, cz, yaw) => { const c = Math.cos(yaw), s = Math.sin(yaw); return (u, v) => [cx + u * c + v * s, cz - u * s + v * c]; };

let depth = 0;
/** The glow of one house: the fire on the hearth (its ball and the pool on the floor), the door and the window shining out, the thatch lit from within by the smoke, the spill on the ground before the door. */
function houseGlow(H, el) {
  const w = el.w ?? 4, l = el.l ?? 6, h = el.h ?? 1.2, rise = el.rise ?? w * 0.55, pr = el.porch ?? 1.6, y0 = el.y ?? 0, rank = el.rank ?? 0;
  const [cx, cz] = el.c, W = frame(cx, cz, el.yaw ?? 0), s = Math.sin(el.yaw ?? 0), c = Math.cos(el.yaw ?? 0);
  const zf = -l / 2 + pr, ridge = h + rise;
  const lit = hashAt(cx, cz, 5) < 0.88, k = 0.55 + 0.35 * hashAt(cx, cz, 9);
  if (!lit && rank < 2) return;
  const dl = -w * 0.18 - 0.32, dr = dl + 0.95, dh = rank > 1 ? Math.min(1.15, h - 0.45) : Math.min(1.15, h - 0.08);
  const wl = w * 0.16, wr = wl + 0.5, wb = 0.6, wt = Math.min(1.05, h - 0.05), out = [-s, -c];
  const hz = rank > 1 ? zf + 0.7 : (zf + 0.3 + l / 2 - 0.35) / 2, hx = rank > 1 ? 0 : 0.06;
  const [fx, fz] = W(hx, hz);
  const far = el.furnished === false;
  const q = (x0, y0q, x1, y1q, zz, f) => { const a = W(x0, zz), b = W(x1, zz), o = 0.03; H.quad([a[0] + out[0] * o, y0 + y0q, a[1] + out[1] * o], [b[0] + out[0] * o, y0 + y0q, b[1] + out[1] * o], [b[0] + out[0] * o, y0 + y1q, b[1] + out[1] * o], [a[0] + out[0] * o, y0 + y1q, a[1] + out[1] * o], out, f); };
  if (!far) {
    H.ball(fx, y0 + 0.45, fz, rank > 1 ? 0.95 : 0.75, 0.7 * k + 0.1); H.floor(fx, y0 + 0.06, fz, rank > 1 ? 1.7 : 1.35, rank > 1 ? 1.4 : 1.15, 10, 0.9 * k + 0.1);
  }
  q(dl + 0.06, 0.04, dr - 0.06, dh - 0.06, zf, 0.4 + 0.3 * k);                     // the doorway, the fire seen through it
  if (rank < 2 || true) q(wl + 0.04, wb + 0.04, wr - 0.04, wt - 0.04, zf, 0.3 + 0.3 * k);   // the window (an opening, no glass)
  // the smoke leaves by the thatch: the roof glowing faintly over the hearth
  const [rx, rz] = W(0, hz); H.ball(rx, y0 + ridge + 0.1, rz, 0.9, 0.3 * k + 0.08);
  // the spill before the door, on the ground (the porch's yard)
  const [sx, sz] = W((dl + dr) / 2, zf - 1.4), gy = height(sx, sz) + 0.07;
  H.floor(sx, Math.max(gy, y0 + 0.05) + 0.0, sz, 2.0, 1.5, 10, 0.55 * k + 0.1);
}
const wrapWhare = (fn) => function lit(el, ctx) {
  const r = fn.call(this, el, ctx);
  if (depth === 0 && ctx?.lights && ctx.bag && !(el.w < 3)) {
    const H = new Halo(); houseGlow(H, el); H.flush(ctx.bag);
  }
  return r;
};
const wrapHangi = (fn) => function lit(el, ctx) {
  const r = fn.call(this, el, ctx);
  if (ctx?.lights && ctx.bag) {
    const H = new Halo(), yaw = el.yaw ?? 0, W = frame(el.c[0], el.c[1], yaw), [px, pz] = W(-1.4, 0), y = el.y ?? 0, k = 0.8 + 0.2 * hashAt(el.c[0], el.c[1], 2);
    H.ball(px, y + 0.5, pz, 1.1, 0.7 * k); H.floor(px, y + 0.06, pz, 2.6, 2.4, 10, 0.85 * k);
    const [kx, kz] = W(-2.6, -1.9); H.floor(kx, y + 0.06, kz, 1.2, 1.0, 8, 0.3);     // the kāuta's floor, lit by it
    H.flush(ctx.bag);
  }
  return r;
};
/** A canoe on the lake with a crew of two (not the war canoe): a torch at the bow, its glow and its streak on the water. */
const wrapWaka = (fn) => function lit(el, ctx) {
  const r = fn.call(this, el, ctx);
  if (ctx?.lights && ctx.bag && (el.y ?? 0) < LAKE.level + 0.5 && (el.l ?? 12) < 8) {
    const H = new Halo(), L = el.l, W = frame(el.c[0], el.c[1], el.yaw ?? 0), [tx, tz] = W(0, -L / 2 + 1.3), y = el.y ?? 0;
    H.ball(tx, y + 1.45, tz, 1.1, 0.7); H.floor(tx, y + 0.5, tz, 1.8, 1.6, 8, 0.45);
    const [wx, wz] = W(0, -L / 2 - 0.2); H.floor(wx, LAKE.level + 0.05, wz, 3.0, 2.4, 10, 0.55);        // the torch's reflection and its light on the water round the bow
    // the torch itself: a bound bundle of dry flax or reed stalks on a stick, burning at its head
    ctx.bag.add('timber', rod([tx, y + 0.45, tz], [tx, y + 1.25, tz], 0.025, 5));
    ctx.bag.add('flame', lathe([[0.001, 0], [0.06, 0.02], [0.05, 0.14], [0.001, 0.3]], 6, null, tx, y + 1.22, tz));
    H.flush(ctx.bag);
  }
  return r;
};
/** watchfire: a fire inside a gate for the sentries: a ring of basalt, logs, a flame, its glow and pool. { c, y, seed } (the style has no such element; added from here) */
function watchfire(el, { bag, col, lights }) {
  const [x, z] = el.c, y = el.y ?? 0, a0 = hashAt(x, z, 3) * TAU;
  for (let k = 0; k < 9; k++) { const a = k / 9 * TAU + a0, px = x + Math.cos(a) * 0.5, pz = z + Math.sin(a) * 0.5; bag.add('basalt', lathe([[0.001, 0], [0.13, 0.01], [0.15, 0.1], [0.001, 0.2]], 5, null, px, y - 0.02, pz)); }
  for (let k = 0; k < 4; k++) { const a = k * 1.57 + a0; bag.add('bark_dark', rod([x + Math.cos(a) * 0.4, y + 0.1, z + Math.sin(a) * 0.4], [x - Math.cos(a) * 0.1, y + 0.2, z - Math.sin(a) * 0.1], 0.04, 5)); }
  bag.add('flame', lathe([[0.001, 0.1], [0.12, 0.12], [0.07, 0.35], [0.001, 0.6]], 6, null, x, y, z));
  col.circle(x, z, 0.65, y, y + 0.3);
  if (lights && bag) {
    const H = new Halo(); H.ball(x, y + 0.45, z, 1.2, 0.72); H.floor(x, y + 0.07, z, 2.8, 2.6, 10, 0.85);
    // the sentry's place: a faint pool of the fire's light on the palisade side
    H.flush(bag);
  }
}
let done = false;
export function registerNight() {
  if (done) return; done = true;
  const E = STYLES.maori.elements;
  E.whare = wrapWhare(E.whare); E.hangi = wrapHangi(E.hangi); E.waka = wrapWaka(E.waka); E.watchfire = watchfire;
}
registerNight();
void HILL;
