// Rapa Nui about 1500 by night — what lit it and the light it throws (docs/settlements/rapa-nui.md §10.2).
// Fire is the light of the island: the hearth inside a hare paenga, glowing through the thatch and out of the low door; the earth ovens (umu) banked
// with embers on the forecourts and the plaza; a driftwood fire at the canoe builders' shed; the cooking hearth of the yards by the way up. No lamp,
// no candle, no glass, no lantern: nothing else lit it [inferred; the island was nearly treeless, so wood was dear and the fires small].
// Everything is geometry in one material, `halo` (palette.js): light ADDED over what is behind it, at night only, with no light, shadow or
// collision, so the day view is unchanged and it shows at the low preset. A disc's shape is carried by its normals (y: 1 at its middle, 0 at its
// rim). The style's elements are wrapped from here (the style files stay as they were); each light is a function of its own place (no counters, no Math.random).
import '../../styles/rapanui/index.js';
import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';
import { STYLES } from '../../core/build.js';
import { lathe } from '../../core/geom.js';
import { orientedBox } from '../../core/build.js';

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
  /** The glow round a flame or an ember bed: three upright discs crossed at 60 degrees. */
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
const frame = (c, yaw) => { const ca = Math.cos(yaw), sa = Math.sin(yaw); return (u, v) => [c[0] + u * ca + v * sa, c[1] - u * sa + v * ca]; };
/** The kinds of room and how bright their hearth burns at night: cooking highest, sleeping banked [inferred]. */
const HEARTH = { cook: 0.95, net: 0.7, tapa: 0.7, carver: 0.72, sleep: 0.5 };
/** The glow of an earth oven's embers at (x, y, z): a bed of red stones under ash, a low ball, a pool on the ground. */
function embers(H, x, y, z, k = 0.55, r = 1.5) { H.ball(x, y + 0.25, z, r * 0.45, k * 0.8); H.floor(x, y + 0.2, z, r, r * 0.9, 10, k); }

/** hare_house (a house to enter): the hearth within (its pool on the mat floor, the glow in the room), the thatch lit over it from inside, the spill of the open door on the forecourt, the oven's embers. */
const wrapHouse = (fn) => function lit(el, ctx) {
  const r = fn.call(this, el, ctx);
  if (!ctx?.lights) return r;
  const H = new Halo(), [L, W, Hh] = [el.len ?? 13, el.w ?? 3.1, el.h ?? 2.9], y0 = el.y ?? 0, P = frame(el.c, el.yaw ?? 0), k = HEARTH[el.kind] ?? 0.6;
  const hu = -1.9, [hx, hz] = P(hu, 0), hh = Hh * Math.max(0, 1 - (2 * hu / L) ** 2) ** 0.4;
  H.floor(hx, y0 + 0.27, hz, 1.6, 1.3, 10, k);                                  // the hearth's pool on the mat floor
  H.ball(hx, y0 + 0.55, hz, 0.8, k * 0.85);                                      // the flame's glow in the room
  H.ball(hx, y0 + 0.2 + hh + 0.15, hz, 1.0, k * 0.45);                           // the thatch lit through from within
  const [dx, dz] = P(0, -W / 2 - 1.4);
  H.floor(dx, y0 + 0.2, dz, 2.0, 1.5, 10, k * 0.8);                              // the door's spill on the forecourt
  const [mx, mz] = P(0, -W / 2 + 0.2); H.ball(mx, y0 + 0.7, mz, 0.7, k * 0.5);   // and the glow in the doorway itself
  const [ox, oz] = P(L * 0.3 * ((el.seed ?? 11) % 2 ? -1 : 1), -W / 2 - 3.25);
  if (el.kind === 'cook' || hashAt(ox, oz, 4) < 0.5) embers(H, ox, y0, oz, el.kind === 'cook' ? 0.65 : 0.5);
  H.flush(ctx.bag);
  return r;
};
/** hare_paenga (a house that is shut): some with a fire within (the thatch faintly lit, a small spill at the crawl-door), some oven embers on the forecourt; the house being thatched is dark. */
const wrapPaenga = (fn) => function lit(el, ctx) {
  const r = fn.call(this, el, ctx);
  if (!ctx?.lights || el.strip) return r;
  const H = new Halo(), [L, W, Hh] = [el.len ?? 12, el.w ?? 2.6, el.h ?? 2.2], y0 = el.y ?? 0, P = frame(el.c, el.yaw ?? 0);
  const [cx, cz] = el.c;
  if (hashAt(cx, cz, 1) < 0.55) {
    const u = (hashAt(cx, cz, 2) - 0.5) * L * 0.3, [gx, gz] = P(u, 0), hh = Hh * Math.max(0, 1 - (2 * u / L) ** 2) ** 0.4;
    H.ball(gx, y0 + 0.2 + hh + 0.12, gz, 0.95, 0.34 + 0.12 * hashAt(cx, cz, 3));
    const [dx, dz] = P(0, -W / 2 - 1.5); H.floor(dx, y0 + 0.2, dz, 1.5, 1.2, 8, 0.4);
  }
  const [ox, oz] = P(L * 0.3 * ((el.seed ?? 11) % 2 ? -1 : 1), -W / 2 - 2.4);
  if (hashAt(ox, oz, 4) < 0.45) embers(H, ox, y0, oz, 0.5, 1.4);
  H.flush(ctx.bag);
  return r;
};
/** The chief's long house: the great hearth between the sleeping halves, the ridge lit over it, the spill of its door, the oven's embers. */
const wrapLong = (fn) => function lit(el, ctx) {
  const r = fn.call(this, el, ctx);
  if (!ctx?.lights) return r;
  const H = new Halo(), [L, W, Hh] = [el.len ?? 26, el.w ?? 4.4, el.h ?? 3.6], y0 = el.y ?? 0, P = frame(el.c, el.yaw ?? 0);
  const [hx, hz] = P(-3, 0), hh = Hh * Math.max(0, 1 - (6 / L) ** 2) ** 0.4;
  H.floor(hx, y0 + 0.27, hz, 2.6, 1.7, 12, 0.9);
  H.ball(hx, y0 + 0.65, hz, 1.1, 0.78);
  H.ball(hx, y0 + 0.2 + hh + 0.2, hz, 1.4, 0.5);
  const [dx, dz] = P(0, -W / 2 - 1.8); H.floor(dx, y0 + 0.2, dz, 2.8, 2.2, 12, 0.8);
  const [mx, mz] = P(0, -W / 2 + 0.3); H.ball(mx, y0 + 0.8, mz, 0.9, 0.55);
  const [ox, oz] = P(L * 0.16, -W / 2 - 0.55 - 3.2); embers(H, ox, y0, oz, 0.65, 1.7);
  H.flush(ctx.bag);
  return r;
};
/** The plaza: the three feast ovens banked with embers after the day's cooking. */
const wrapPlaza = (fn) => function lit(el, ctx) {
  const r = fn.call(this, el, ctx);
  if (!ctx?.lights) return r;
  const H = new Halo(), y0 = el.y ?? 0.12;
  for (const [x, z] of [[-34, 71], [37, 69], [-16, 94]]) embers(H, x, y0, z, 0.6, 2.1);
  H.flush(ctx.bag);
  return r;
};
/** The yards by the way up: the cooking hearth at (8, 60) kept alight. */
const wrapApproach = (fn) => function lit(el, ctx) {
  const r = fn.call(this, el, ctx);
  if (!ctx?.lights) return r;
  const H = new Halo(), y = el.ground(8, 60);
  H.ball(8, y + 0.4, 60, 0.9, 0.7); H.floor(8, y + 0.08, 60, 2.4, 2.1, 10, 0.85);
  H.flush(ctx.bag);
  return r;
};
/** The working shore: a driftwood fire of stones beside the canoe builders' shed, where the work and the night's fishing are got ready [inferred]. */
const wrapShore = (fn) => function lit(el, ctx) {
  const r = fn.call(this, el, ctx);
  if (!ctx?.lights) return r;
  const [sx, sz] = el.c, fx = sx - 3.5, fz = sz - 1.2, y = el.ground(fx, fz), H = new Halo();
  for (let k = 0; k < 8; k++) {            // a ring of beach stones round the fire, and sticks laid across the embers
    const a = k / 8 * TAU, b = (k + 1) / 8 * TAU, rr = 0.55;
    ctx.bag.add('basalt_ahu', orientedBox([fx + Math.cos(a) * rr, fz + Math.sin(a) * rr], [fx + Math.cos(b) * rr, fz + Math.sin(b) * rr], 0.12, y - 0.2, y + 0.14 + (k % 2) * 0.05, -0.02));
  }
  ctx.bag.add('opening', lathe([[0.46, 0.012], [0.001, 0.02]], 10, null, fx, y, fz));
  H.ball(fx, y + 0.45, fz, 1.0, 0.75); H.floor(fx, y + 0.1, fz, 2.8, 2.5, 10, 0.9);
  H.flush(ctx.bag);
  return r;
};
let done = false;
export function registerNight() {
  if (done) return; done = true;
  const E = STYLES.rapanui.elements;
  E.hare_house = wrapHouse(E.hare_house); E.hare_paenga = wrapPaenga(E.hare_paenga); E.hare_paenga_long = wrapLong(E.hare_paenga_long);
  E.plaza_dress = wrapPlaza(E.plaza_dress); E.approach_dress = wrapApproach(E.approach_dress); E.shore_works = wrapShore(E.shore_works);
}
registerNight();
