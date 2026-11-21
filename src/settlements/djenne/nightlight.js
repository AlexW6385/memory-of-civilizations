// Djenné, 14th c., by night (docs/settlements/djenne.md §20.2). What lit the town: small clay oil lamps (a dish with a cotton wick, shea butter or
// sesame oil) set in a niche or on a counter, the fire of the three-stone hearth in the court and kitchen, no street lighting; the mosque's lamps in
// the niches of the qibla wall and by the north door. [inferred: no source records the lamps of Djenné at this date; the forms are the Sahel's.]
// All of it is geometry in the one additive `halo` material (palette.js): light ADDED over what is behind, at night only, no light, no shadow, no
// collision, so the day view is unchanged and it reads at the low preset. Each light is a function of its own place (no counters, no Math.random).
// The method is that of the Suzhou reference; nothing of Suzhou's is imported.
import '../../styles/sahel/index.js';
import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';
import { STYLES } from '../../core/build.js';
import { hashAt } from './furniture.js';
import { courtAt } from './walk.js';

const TAU = Math.PI * 2, MAT = 'halo';
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
  ball(x, y, z, r, k = 0.62) { for (let i = 0; i < 3; i++) { const a = i * Math.PI / 3 + 0.37, c = Math.cos(a), s = Math.sin(a); this.disc([x, y, z], [c, 0, s], [0, 1, 0], r, r, [-s, c], 8, [k, 0], [0, 1]); } }
  quad(a, b, c, d, n, f) { const q = Math.sqrt(1 - f * f), N = [n[0] * q, f, n[1] * q]; this.tri(a, N, b, N, c, N); this.tri(a, N, c, N, d, N); }
  flush(bag) {
    if (!this.pos.length) return;
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute(this.pos, 3)); g.setAttribute('normal', new Float32BufferAttribute(this.nor, 3));
    bag.add(MAT, g); this.pos = []; this.nor = [];
  }
}
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
/** The upper windows of a solid house (dark thin slabs, 'lacquer_black', 0.45-1.0 m high, above 3.4 m) glow in a share of cases, on the outward face. */
function litWindows(ctx, el, share) {
  const H = new Halo(), real = ctx.bag, [x0, z0, x1, z1] = el.rect, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  const bag = new Proxy(real, {
    get(t, k) {
      if (k === 'add') return (mat, g, ...r) => {
        if (mat === 'lacquer_black' && g?.attributes?.position) {
          const b = bounds(g), dx = b[3] - b[0], dz = b[5] - b[2], dy = b[4] - b[1], th = Math.min(dx, dz), w = Math.max(dx, dz);
          if (th < 0.12 && dy > 0.4 && dy < 1.1 && w > 0.3 && b[1] > 3.4) {
            const mx = (b[0] + b[3]) / 2, mz = (b[2] + b[5]) / 2;
            if (hashAt(mx, mz, 31) < share) {
              const f = 0.45 + 0.35 * hashAt(mx, mz, 7), m = 0.04, o = 0.02;
              if (dx < dz) { const s = mx > cx ? 1 : -1, x = (s > 0 ? b[3] : b[0]) + s * o; H.quad([x, b[1] + m, b[2] + m], [x, b[1] + m, b[5] - m], [x, b[4] - m, b[5] - m], [x, b[4] - m, b[2] + m], [s, 0], f); }
              else { const s = mz > cz ? 1 : -1, z = (s > 0 ? b[5] : b[2]) + s * o; H.quad([b[0] + m, b[1] + m, z], [b[3] - m, b[1] + m, z], [b[3] - m, b[4] - m, z], [b[0] + m, b[4] - m, z], [0, s], f); }
            }
          }
        }
        return t.add(mat, g, ...r);
      };
      const v = t[k]; return typeof v === 'function' ? v.bind(t) : v;
    },
  });
  return { ctx: { ...ctx, bag }, H };
}

let depth = 0;
/** A house (solid or enterable): lit upper windows, the halo of each lamp and hearth of the plan, the lamplight spilling from the open door. */
const house = (fn) => function haloed(el, ctx) {
  const lights = ctx?.lights, n = lights ? lights.length : 0;
  if (depth > 0 || !lights || el.simple) { depth++; try { return fn.call(this, el, ctx); } finally { depth--; } }
  const L = litWindows(ctx, el, 0.3);
  depth++;
  try { var r = fn.call(this, el, L.ctx); } finally { depth--; }
  const H = L.H;
  for (const l of lights.slice(n)) lightHalo(H, l, 0);
  if (el.home || el.storeys !== undefined && el.enter) {
    const [x0, z0, x1, z1] = el.rect, mid = (x1 - x0) / 2, s = (el.front || 's') === 's';
    if (el.front === 's' || el.front === 'n') H.floor(s ? x0 + mid : x1 - mid, 0.06, s ? z1 + 1.1 : z0 - 1.1, 2.0, 1.5, 8, 0.6);   // the door ajar: lamplight over the step
  }
  H.flush(ctx.bag);
  return r;
};

/** The shop row: a lamp on the counter of about half the shops, its glow and the pool before the opening. */
const shops = (fn) => function haloed(el, ctx) {
  const r = fn.call(this, el, ctx);
  const H = new Halo(), [x0, z0, x1, z1] = el.rect, n = el.n ?? 8, W = (x1 - x0) / n;
  for (let i = 0; i < n; i++) {
    const c = x0 + i * W + W / 2;
    if (hashAt(c, z1, 3) > 0.55) continue;
    H.ball(c - 0.8, 1.2, z1 - 0.55, 0.5); H.floor(c, 0.06, z1 + 1.1, 2.3, 1.7, 8, 0.75); H.floor(c - 0.2, 0.05, z1 - 1.3, 1.4, 1.1, 8, 0.6);
  }
  H.flush(ctx.bag);
  return r;
};

/** The court house: the hearth's embers in the court, the lamps of the vestibule and the workshop, the light over the step. */
const courtHouse = (fn) => function haloed(el, ctx) {
  const r = fn.call(this, el, ctx);
  const H = new Halo(), C = courtAt(), hx = C.xw + 1.2, hz = C.zp - 2.6;
  H.ball(hx, 0.5, hz, 0.8, 0.7); H.floor(hx, 0.05, hz, 2.6, 2.4, 10, 0.85);
  H.ball(C.xm, 1.9, (C.zp + C.zf) / 2, 0.55); H.floor(C.xm, 0.05, (C.zp + C.zf) / 2, 1.6, 1.8, 8, 0.7);
  H.ball((C.x0 + 0.5 + C.xm - 3.25) / 2, 1.5, C.zf - 1.0, 0.5); H.floor(C.xm, 0.06, C.z1 + 1.2, 2.2, 1.6, 8, 0.65);
  H.flush(ctx.bag);
  return r;
};

/** dj_glow: { at: [x, z], y, r?, pool? } — the glow of a lamp in the hall, drawn as halo only (a `box` footprint, never a `rect`). */
function glow({ at, y = 0, r = 0.55, pool = 1.6 }, { bag }) {
  const H = new Halo(); H.ball(at[0], y, at[1], r);
  if (pool) H.floor(at[0], 0.0 + (y > 2.5 ? 3.03 : 0.06), at[1], pool, pool, 8, 0.6);
  H.flush(bag);
}

let done = false;
export function registerNight() {
  if (done) return; done = true;
  const E = STYLES.sahel.elements;
  E.sahel_near_wall = house(E.sahel_near_wall); E.sahel_house = house(E.sahel_house); E.sahel_home = house(E.sahel_home);
  E.sahel_shops = shops(E.sahel_shops); E.sahel_court_house = courtHouse(E.sahel_court_house);
  E.dj_glow = glow;
}
registerNight();
