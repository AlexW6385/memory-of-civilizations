// The Hakka tulou by night, c. 1710 — what lit it (docs/settlements/hakka-tulou.md §10). [inferred: a hill clan's night: vegetable-oil lamps (a wick in a
// saucer of tea-seed or peanut oil), pine-splinter torches, paper lanterns at the gate and on the galleries, the kitchen hearths banked but red, the altar's
// candles and the incense of the ancestral hall and of every house; no electric light, nothing from a fetched page.]
// All of it is geometry in the one material `halo` (palette.js 'halo': light ADDED over what is behind, at night only, no light, shadow or collision), so the
// day view is unchanged and the low preset shows it. The method is that of the Suzhou reference (a glow of crossed discs round each flame, a pool on the floor,
// a pane before a lit window); nothing of Suzhou's is imported. Each light is a function of its own place (a hash): no counters, no Math.random.
import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';
import { STYLES } from '../../core/build.js';
import { frameOf } from './geo.js';

export const hashAt = (x, z, s = 0) => { let h = (Math.round(x * 16) * 73856093) ^ (Math.round(z * 16) * 19349663) ^ Math.imul(s + 1, 83492791); h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return (h >>> 0) / 4294967296; };
const TAU = Math.PI * 2, MAT = 'halo';
/** Triangles of the halo material; the brightness is the normal's y (1 at a disc's middle, 0 at its rim). */
export class Halo {
  constructor() { this.pos = []; this.nor = []; }
  tri(p0, n0, p1, n1, p2, n2) { this.pos.push(...p0, ...p1, ...p2); this.nor.push(...n0, ...n1, ...n2); }
  disc(c, U, V, su, sv, nh = null, segs = 8, F = [1, 0.42, 0], R = [0, 0.5, 1]) {
    const at = (r, k) => { const a = k / segs * TAU, u = Math.cos(a) * su * R[r], v = Math.sin(a) * sv * R[r]; return [c[0] + U[0] * u + V[0] * v, c[1] + U[1] * u + V[1] * v, c[2] + U[2] * u + V[2] * v]; };
    const nm = (r, k) => { const a = k / segs * TAU, f = F[r], q = Math.sqrt(1 - f * f); return nh ? [nh[0] * q, f, nh[1] * q] : [Math.cos(a) * q, f, Math.sin(a) * q]; };
    const n = R.length - 1;
    for (let k = 0; k < segs; k++) {
      this.tri(at(0, k), nm(0, k), at(1, k), nm(1, k), at(1, k + 1), nm(1, k + 1));
      for (let r = 1; r < n; r++) { this.tri(at(r, k), nm(r, k), at(r + 1, k), nm(r + 1, k), at(r + 1, k + 1), nm(r + 1, k + 1)); this.tri(at(r, k), nm(r, k), at(r + 1, k + 1), nm(r + 1, k + 1), at(r, k + 1), nm(r, k + 1)); }
    }
  }
  floor(x, y, z, r, rz = r, segs = 8, k = 1) { this.disc([x, y, z], [1, 0, 0], [0, 0, 1], r, rz, null, segs, [k, 0.42 * k, 0]); }
  wall(x, y, z, nh, rw, rh, segs = 8, k = 1) { this.disc([x, y, z], [-nh[1], 0, nh[0]], [0, 1, 0], rw, rh, nh, segs, [0.9 * k, 0], [0, 1]); }
  ball(x, y, z, r, k = 0.62, segs = 8) { for (let i = 0; i < 3; i++) { const a = i * Math.PI / 3 + 0.37, c = Math.cos(a), s = Math.sin(a); this.disc([x, y, z], [c, 0, s], [0, 1, 0], r, r, [-s, c], segs, [k, 0], [0, 1]); } }
  quad(a, b, c, d, n, f) { const q = Math.sqrt(1 - f * f), N = [n[0] * q, f, n[1] * q]; this.tri(a, N, b, N, c, N); this.tri(a, N, c, N, d, N); }
  flush(bag) {
    if (!this.pos.length) return;
    const g = new BufferGeometry(); g.setAttribute('position', new Float32BufferAttribute(this.pos, 3)); g.setAttribute('normal', new Float32BufferAttribute(this.nor, 3));
    bag.add(MAT, g); this.pos = []; this.nor = [];
  }
}
const sides = (x, z, s) => 6 + Math.floor(hashAt(x, z, s) * 4);
/** A hanging paper lantern whose hook is at (x, y, z): the glow round it and, when the floor is near, a pool. */
function lantern(H, x, y, z, floor = null) {
  H.ball(x, y - 0.63, z, 0.72, 0.62, sides(x, z, 11));
  if (floor !== null && y - floor < 3.4) H.floor(x, floor + 0.03, z, 2.0, 2.0, sides(x, z, 12) + 2, 0.6);
}
const DEG = Math.PI / 180;

// ── the lantern recorder: the elements hang their lanterns through the life style's `hang_lantern`; during a wrapped call it also notes where ──
let rec = null;
function recording(fn, el, ctx) {
  const LF = STYLES.life.elements, orig = LF.hang_lantern;
  const prev = rec; rec = [];
  LF.hang_lantern = function (e, c) { if (rec) rec.push(e); return orig.call(this, e, c); };
  try { return { r: fn(el, ctx), lanterns: rec }; } finally { LF.hang_lantern = orig; rec = prev; }
}

// ── the great ring and the neighbouring round tulou ──
// The lit rooms: kitchens (the hearth's red through the door), bedrooms and sitting rooms (the oil lamp), looms (a lamp over the work); a window of a lit room
// of the third and fourth floors glows on the outer wall; a pool of lamp-light lies on the gallery before its door.
const LIT = { kitchen: 0.55, bedroom: 0.42, tea: 0.5, loom: 0.3, granary: 0.06, tools: 0.1, pen: 0.04 };
function ringHalo(el, H) {
  const c = el.c, R = el.R, n = el.n, da = 2 * Math.PI / n, fl = el.floors, K = fl.length, wallIn = el.wallIn ?? R - 1.5, front = el.front ?? wallIn - 4, rail = el.rail ?? front - 1.7, lean = el.lean ?? 0.38;
  const H0 = fl[K - 1] + 3.6, ro = (y) => R - lean * Math.min(y, H0) / H0, wi = el.windowsFrom ?? 2, P = (r, a) => [c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)];
  for (const f of el.furnish ?? []) {
    const a = f.i * da, y = fl[f.k], [mx, mz] = P(front - 0.35, a);
    if (hashAt(mx, mz, 31 + f.k) >= (LIT[f.kind] ?? 0.2)) continue;
    // the glow in the doorway and the pool on the gallery floor in front of it
    H.ball(...[mx, y + 1.25, mz], 0.62, 0.55, sides(mx, mz, 13));
    const [gx, gz] = P((front + rail) / 2, a); H.floor(gx, y + 0.03, gz, 1.5, 1.2, sides(gx, gz, 14) + 2, 0.6);
    // a window of the lit room shows outside (third and fourth floors; the lower floors have none)
    if ((el.full || el.windows) && f.k >= wi) { const yy = y + 1.32, [wx, wz] = P(ro(yy) + 0.07, a); H.wall(wx, yy, wz, [Math.cos(a), Math.sin(a)], 0.34, 0.42, 8, 0.8); }
  }
  // the second ring's upper rooms that keep a lamp (T.ring2.light) and the balcony before them
  const U = el.ring2;
  if (U?.light) for (let i = 0; i < U.n; i++) {
    if (!U.light[i] || U.kinds?.[i] === 'granary') continue;
    const a = i * 2 * Math.PI / U.n, y = U.floors[1], [bx, bz] = P(U.r0 - 0.8, a);
    H.floor(bx, y + 0.03, bz, 1.4, 1.1, sides(bx, bz, 15) + 2, 0.6); H.ball(bx, y + 1.3, bz, 0.5, 0.55, sides(bx, bz, 16));
  }
  // the gates: a pool of light under the hood where the two lanterns hang
  for (const g of el.gates ?? []) { const [gx, gz] = P(R + 1.8, g * DEG); H.floor(gx, 0.04, gz, 3.2, 3.2, 10, 0.55); }
}
function wrapRing(fn) {
  return function ring(el, ctx) {
    const { r, lanterns } = recording(fn, el, ctx), H = new Halo();
    for (const e of lanterns) lantern(H, e.at[0], e.y, e.at[1], e.y > 3.6 ? null : 0);
    ringHalo(el, H); H.flush(ctx.bag); return r;
  };
}

// ── the ancestral hall: the candles and incense on the altar, burning all night; a lamp before it ──
function wrapHall(fn) {
  return function hall(el, ctx) {
    const r = fn(el, ctx), H = new Halo(), [cx, cz] = el.c ?? [0, 0], zb = -5.5;
    for (const x of [-1.6, -1.2, 1.2, 1.6]) H.ball(cx + x, 1.62, cz + zb + 0.9, 0.5, 0.7, sides(cx + x, cz, 17));
    H.floor(cx, 0.37, cz + zb + 2.4, 3.6, 2.2, 12, 0.7);
    H.wall(cx, 2.2, cz + zb + 0.8, [0, 1], 2.4, 1.1, 10, 0.5);
    H.flush(ctx.bag); return r;
  };
}

// ── a house of the hamlet: the altar's lamps (always), the porch lanterns, and — in the share that is awake, most of the shops — the lit lattice windows and the pool of the open door ──
function wrapHouse(fn) {
  return function house(el, ctx) {
    const { r, lanterns } = recording(fn, el, ctx), H = new Halo();
    const [cx, cz] = el.c, phi = el.yaw ?? 0, w = el.w ?? 7.8, d = el.d ?? 8.6, hx = w / 2, hz = d / 2, W = frameOf(cx, cz, phi), sd = el.seed ?? 1;
    for (const e of lanterns) if (e.y > 3.0) lantern(H, e.at[0], e.y, e.at[1], 0);
    const az = -hz + 0.42 + 0.3;
    for (const x of [-0.7, -0.45, 0.45, 0.7]) { const p = W(x, az); H.ball(p[0], 1.26, p[1], 0.34, 0.6, sides(p[0], p[1], 18)); }
    const awake = el.trade ? hashAt(cx, cz, 3) < 0.9 : hashAt(cx, cz, 3) < 0.38;
    if (awake) {
      const nf = [Math.sin(phi), Math.cos(phi)];
      for (const [a, b] of [[-2.8, -1.9], [1.9, 2.8]]) {
        const A = W(a + 0.05, hz - 0.12), B = W(b - 0.05, hz - 0.12), f = 0.5 + 0.3 * hashAt(A[0], A[1], 19);
        H.quad([A[0], 1.17, A[1]], [B[0], 1.17, B[1]], [B[0], 1.98, B[1]], [A[0], 1.98, A[1]], nf, f);
      }
      const p = W(0, hz + 1.2); H.floor(p[0], 0.05, p[1], 1.9 + 0.5 * hashAt(p[0], p[1], 5), 1.4 + 0.4 * hashAt(p[0], p[1], 6), 7 + Math.floor(hashAt(p[0], p[1], 8) * 5), 0.6);
      const q = W(0, 1.4); H.ball(q[0], 1.7, q[1], 0.75, 0.55, 9);      // the oil lamp over the tea table, seen through the door
    }
    if (el.trade) { const p = W(-2.3, hz + 0.9); H.ball(p[0], 1.3, p[1], 0.7, 0.62, sides(p[0], p[1], 21)); H.floor(p[0], 0.05, p[1], 1.8, 1.4, 10, 0.55); }
    void sd; H.flush(ctx.bag); return r;
  };
}

// ── the earth-god's shrine: a lamp and sticks of incense burning at its mouth ──
function wrapShrine(fn) {
  return function shrine(el, ctx) {
    const r = fn(el, ctx), H = new Halo(), [x, z] = el.at, y = el.y ?? 0, phi = el.rot ?? 0, W = frameOf(x, z, phi), p = W(0, 0.05);
    H.ball(p[0], y + 0.5, p[1], 0.55, 0.7, 8); H.floor(p[0], y + 0.04, p[1], 1.3, 1.3, 8, 0.5);
    H.flush(ctx.bag); return r;
  };
}

// ── the square tulou and the farm sheds: the lanterns on the galleries, the tea shed's firing stove ──
function wrapLanterns(fn) {
  return function lit(el, ctx) {
    const { r, lanterns } = recording(fn, el, ctx), H = new Halo();
    for (const e of lanterns) lantern(H, e.at[0], e.y, e.at[1], e.y > 3.6 ? null : 0);
    if (el.t === 'tulou_enclosure') { const [cx, cz] = el.c, h = el.half; H.floor(cx, 0.04, cz + h + 1.8, 3.0, 3.0, 10, 0.5); }
    if (el.t === 'farmhouse' && el.kind === 2) { const [x, z] = el.c; H.ball(x, 1.0, z + 0.4, 0.8, 0.6, 8); H.floor(x, 0.05, z + el.d / 2 + 0.8, 1.8, 1.2, 8, 0.5); }
    H.flush(ctx.bag); return r;
  };
}

let done = false;
export function registerNight() {
  if (done) return; done = true;
  const E = STYLES.tulou.elements;
  E.tulou_ring = wrapRing(E.tulou_ring); E.tulou_hall = wrapHall(E.tulou_hall); E.hakka_house = wrapHouse(E.hakka_house); E.earth_shrine = wrapShrine(E.earth_shrine);
  E.tulou_enclosure = wrapLanterns(E.tulou_enclosure); E.farmhouse = wrapLanterns(E.farmhouse);
}
