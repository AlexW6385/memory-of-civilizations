// Taos Pueblo c. 1500 by night — what lit it and the light it throws (docs/settlements/taos.md §10.2).
// Fire is the light of the place: the hearth of a room under its smoke hole, the fires of the plaza's hearth rings, the cook yard's griddle,
// the glow out of a kiva's hatch. No lamp, no candle, no glass (§10.2). Everything here is geometry in one material, `halo` (palette.js): light
// ADDED over what is behind it, at night only, with no light, shadow or collision, so the day view is unchanged and it shows at the low preset.
// The shape of each piece is carried by its normals (y: 1 at a disc's middle, 0 at its rim). The pueblo style's elements are wrapped from here
// (the style files stay as they were); each light is a function of its own place (no counters, no Math.random).
import '../../styles/pueblo/index.js';
import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';
import { STYLES } from '../../core/build.js';

const ST = 2.7, TAU = Math.PI * 2;
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
const FIRE_KINDS = new Set(['home', 'sleep', 'weave']);
/** The glow of one room: the fire under the smoke hole (its pool on the floor, the ball of light), the glow of the smoke hole on the roof, the spill of the doorway on the ground or terrace. */
function roomGlow(H, x0, z0, door, kind, y0) {
  const cx = x0 + 2.5, cz = z0 + 2.5, hx = cx + 0.35, hz = cz - 0.25, fz = hz + 0.15, F = y0 + 0.06, s = door === 's';
  if (FIRE_KINDS.has(kind)) {
    H.ball(hx, F + 0.45, fz, 0.8, 0.7); H.floor(hx, F + 0.03, fz, 1.5, 1.3, 10, 0.9);
    H.ball(hx, y0 + ST + 0.55, hz, 0.9, 0.45);                       // the smoke hole glowing on the roof (the smoke lit from under)
    const du = cx + 0.3, wall = s ? z0 + 5 : z0, g = s ? 1 : -1;
    H.floor(du, y0 + 0.07, wall + g * 1.3, 2.5, 1.9, 10, 0.8);       // the doorway's spill, the door being open (no door but a hide)
  } else {
    // no fire in a store or work room: a faint glow at the doorway from the neighbours' fires only
    const du = cx + 0.3, wall = s ? z0 + 5 : z0, g = s ? 1 : -1;
    H.floor(du, y0 + 0.07, wall + g * 0.8, 1.2, 1.0, 8, 0.28);
  }
}
const frame = (cx, cz, yaw) => { const c = Math.cos(yaw), s = Math.sin(yaw); return (u, v) => [cx + u * c + v * s, cz - u * s + v * c]; };

let depth = 0;
const wrapBlock = (fn) => function lit(el, ctx) {
  if (depth > 0 || !ctx?.lights) { depth++; try { return fn.call(this, el, ctx); } finally { depth--; } }
  const H = new Halo(), real = ctx.bag, mid = el.x0 + (el.heights[0].length * el.cell) / 2;
  void mid;
  // the small windows and the low doorways of the free faces (the style's black openings, a slab under 5 cm thick): some glow with the fire behind them
  const bag = new Proxy(real, {
    get(t, k) {
      if (k === 'add') return (mat, g, ...r) => {
        if (mat === 'lacquer_black' && g?.attributes?.position) {
          const b = bounds(g), dx = b[3] - b[0], dz = b[5] - b[2], dy = b[4] - b[1], th = Math.min(dx, dz), w = Math.max(dx, dz);
          const win = dy > 0.4 && dy < 0.5 && w > 0.45 && w < 0.6, door = dy > 1.4 && dy < 1.5 && w > 0.7 && w < 0.9;
          if (th < 0.05 && (win || door)) {
            const mx = (b[0] + b[3]) / 2, mz = (b[2] + b[5]) / 2;
            if (hashAt(mx, mz, 17 + Math.floor(b[1] / 2.5)) < (win ? 0.24 : 0.4)) {
              const f = 0.4 + 0.3 * hashAt(mx, mz, 7), m = 0.03, o = 0.04;
              // one sheet on each side of the slab (the one inside the wall is hidden by it): the style does not say which way the face looks
              if (dx < dz) for (const sgn of [1, -1]) { const x = (sgn > 0 ? b[3] : b[0]) + sgn * o; H.quad([x, b[1] + m, b[2] + m], [x, b[1] + m, b[5] - m], [x, b[4] - m, b[5] - m], [x, b[4] - m, b[2] + m], [sgn, 0], f); }
              else for (const sgn of [1, -1]) { const z = (sgn > 0 ? b[5] : b[2]) + sgn * o; H.quad([b[0] + m, b[1] + m, z], [b[3] - m, b[1] + m, z], [b[3] - m, b[4] - m, z], [b[0] + m, b[4] - m, z], [0, sgn], f); }
            }
          }
        }
        return t.add(mat, g, ...r);
      };
      const v = t[k];
      return typeof v === 'function' ? v.bind(t) : v;
    },
  });
  depth++;
  try { var r = fn.call(this, el, { ...ctx, bag }); } finally { depth--; }
  for (const q of el.rooms ?? []) roomGlow(H, el.x0 + q.j * el.cell, el.z0 + q.i * el.cell, q.door, q.kind ?? (q.store ? 'store' : 'home'), 0);
  for (const q of el.upper ?? []) roomGlow(H, el.x0 + q.j * el.cell, el.z0 + q.i * el.cell, q.door, q.kind, (q.storey - 1) * ST);
  H.flush(real);
  return r;
};
const wrapCook = (fn) => function lit(el, ctx) {
  const r = fn.call(this, el, ctx);
  if (depth === 0 && ctx?.lights) {
    const H = new Halo(), W = frame(el.c[0], el.c[1], el.yaw ?? 0), [gx, gz] = W(1.3, 0);
    H.ball(gx, 0.4, gz, 0.9, 0.7); H.floor(gx, 0.04, gz, 2.2, 2.0, 10, 0.85);
    H.flush(ctx.bag);
  }
  return r;
};
const wrapKiva = (fn) => function lit(el, ctx) {
  const r = fn.call(this, el, ctx);
  if (depth === 0 && ctx?.lights) {
    const H = new Halo(), [x, z] = el.c;      // the glow out of the hatch of the kiva (its fire lit within; the inside itself is not built, §4.1)
    H.ball(x, 1.2, z, 0.8, 0.5);
    H.flush(ctx.bag);
  }
  return r;
};
const wrapDress = (fn) => function lit(el, ctx) {
  const r = fn.call(this, el, ctx);
  if (depth === 0 && ctx?.lights) {
    const H = new Halo();
    for (const it of el.items) if (it.k === 'hearth' && (it.v ?? 0) % 2 === 0) { const [x, z] = it.at, y = it.y ?? 0; H.ball(x, y + 0.5, z, 0.8, 0.7); H.floor(x, y + 0.04, z, 2.6, 2.4, 10, 0.85); }
    H.flush(ctx.bag);
  }
  return r;
};
let done = false;
export function registerNight() {
  if (done) return; done = true;
  const E = STYLES.pueblo.elements;
  E.pueblo_block = wrapBlock(E.pueblo_block); E.cook_yard = wrapCook(E.cook_yard); E.kiva = wrapKiva(E.kiva); E.pueblo_dress = wrapDress(E.pueblo_dress);
}
registerNight();
