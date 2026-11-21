// Conques about 1120 by night — what lit the village and the abbey, and the light it throws (docs/settlements/conques.md §20.2).
// In the Rouergue of the early twelfth century light is fire: the hearth (every house's one fire, its glow through the smoke-hole and the
// open door), the rushlight (a peeled rush dipped in fat, burning in an iron clip; the poor man's lamp), tallow and oil lamps, wax candles
// only in the church (wax was dear; the candle-seller at the church door sold it to pilgrims), the forge and the baker's oven mouth, and the
// abbey's hanging lamps before the shrine of the saint. Nobody walked the lanes after the last bell without a torch or a lantern; the shops
// had put their boards up. [inferred throughout, from the period's habits; no Conques source speaks of its night]
// Everything here is geometry in one material, `halo` (palette.js, materials.js 'halo'): light ADDED over what is behind it, at night only,
// with no light, no shadow and no collision, so the day view is unchanged and it shows at the low preset. The shape of each piece is carried by
// its normals (y: 1 at a disc's middle, 0 at its rim): a glow round each flame (three crossed discs), a pool on the floor, a pane before a lit
// window. The houses' `maison` element is wrapped from here (the style file stays as it was); each light is a function of its own place
// (no counters, no Math.random). The method is that of the Suzhou reference, written for Conques' fires; nothing of Suzhou's is imported.

import '../../styles/romanesque/index.js';
import '../../buildings/sainte-foy-conques/style.js';
import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';
import { STYLES } from '../../core/build.js';
import { shopPoint, doorU } from '../../styles/romanesque/village.js';

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
export function lightHalo(H, l, floor) {
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
 * Wrap a house's bag so that the openings of its walls that are windows (a slab under 0.05 m thick, 0.4–1.0 m high, in a wall's plane within 0.2 m of
 * the house's outer face) glow with the hearth or the rushlight behind them in `share` of the cases (by the hash of the window's own place: fat is dear,
 * most households slept at dark), on the outward face only. The hearth mouths inside are not windows: they lie deeper than 0.2 m from a wall face.
 */
function litWindows(ctx, el, share) {
  const H = new Halo(), real = ctx.bag, [x0, z0, x1, z1] = el.rect, y0 = el.y ?? 0;
  const bag = new Proxy(real, {
    get(t, k) {
      if (k === 'add') return (mat, g, ...r) => {
        if (mat === 'opening' && g?.attributes?.position) {
          const b = bounds(g), dx = b[3] - b[0], dz = b[5] - b[2], dy = b[4] - b[1], th = Math.min(dx, dz), w = Math.max(dx, dz);
          if (th < 0.05 && dy > 0.4 && dy < 1.0 && w > 0.3 && b[1] > y0 + 0.9) {
            const mx = (b[0] + b[3]) / 2, mz = (b[2] + b[5]) / 2;
            const side = dx < dz ? (Math.abs(mx - x1) < 0.2 ? [1, 0] : Math.abs(mx - x0) < 0.2 ? [-1, 0] : null) : (Math.abs(mz - z1) < 0.2 ? [0, 1] : Math.abs(mz - z0) < 0.2 ? [0, -1] : null);
            const up = b[1] > y0 + 2.4;
            if (side && hashAt(mx, mz, 31 + Math.floor(b[1] / 2.5)) < share * (up ? 1 : 0.8)) {
              const f = 0.4 + 0.3 * hashAt(mx, mz, 7), m = 0.03, o = 0.012;
              if (side[0]) { const x = (side[0] > 0 ? b[3] : b[0]) + side[0] * o; H.quad([x, b[1] + m, b[2] + m], [x, b[1] + m, b[5] - m], [x, b[4] - m, b[5] - m], [x, b[4] - m, b[2] + m], side, f); }
              else { const z = (side[1] > 0 ? b[5] : b[2]) + side[1] * o; H.quad([b[0] + m, b[1] + m, z], [b[3] - m, b[1] + m, z], [b[3] - m, b[4] - m, z], [b[0] + m, b[4] - m, z], side, f); }
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

/** The point on a house's front at u along it and v out from the wall (negative v is the lane), as the style's frame gives it. */
const frameP = (el) => {
  const [x0, z0, x1, z1] = el.rect, f = el.front || 's';
  return (u, v) => (f === 's' ? [x1 - u, z1 - v] : f === 'n' ? [x0 + u, z0 + v] : f === 'e' ? [x1 - v, z0 + u] : [x0 + v, z1 - u]);
};
const dims = (el) => { const [x0, z0, x1, z1] = el.rect, f = el.front || 's', along = f === 's' || f === 'n'; return { L: along ? x1 - x0 : z1 - z0, D: along ? z1 - z0 : x1 - x0 }; };

let depth = 0;
const wrapMaison = (fn) => function haloed(el, ctx) {
  const lights = ctx?.lights, n = lights ? lights.length : 0;
  if (depth > 0 || !lights || el.simple) { depth++; try { return fn.call(this, el, ctx); } finally { depth--; } }
  const poor = (el.storeys ?? 2) < 2 || el.kind === 'fisher' || el.kind === 'herder';
  const L = litWindows(ctx, el, el.shop ? 0.12 : poor ? 0.2 : 0.3);
  depth++;
  try { var r = fn.call(this, el, L.ctx); } finally { depth--; }
  const H = L.H, y = el.y ?? 0, P = frameP(el), { L: Lw, D } = dims(el);
  for (const l of lights.slice(n)) lightHalo(H, l, l.at[1] - y < 3.2 ? y : undefined);
  if (el.open && !el.hostel) {
    // the door ajar (the shop's arch with its board let down): the rushlight's light spilling over the step into the lane
    const u = el.shop ? shopPoint(el).a0 : el.kind === 'grange' ? Lw / 2 : doorU(el).du, [px, pz] = P(u, -1.2);
    H.floor(px, y + 0.05, pz, 2.1, 1.5, 8, 0.62);
    if (el.trade === 'smith') { const [fx, fz] = P(Lw / 2, D - 1.2); H.ball(fx, y + 1.1, fz, 0.9, 0.85); H.floor(fx, y + 0.05, fz, 1.8, 1.8, 8, 0.7); }
    if (el.trade === 'bread') { const [ox, oz] = P(Lw - 1.45, D - 2.3); H.ball(ox, y + 1.2, oz, 0.7, 0.8); }
  }
  if (el.hostel) { const [px, pz] = P(el.hostelDoor ?? Lw * 0.5, -1.4); H.floor(px, y + 0.05, pz, 2.8, 1.8, 8, 0.7); }
  H.flush(ctx.bag);
  return r;
};

/**
 * conques_halo: { at: [x, y, z], r?, floor?, k? } — the glow of a flame the plan draws elsewhere (a candle, a lantern, a lamp, a brazier): a ball at the
 * flame and, when `floor` is given, its pool on the floor or the ground.
 */
function haloElement(el, { bag }) {
  const [x, y, z] = el.at, H = new Halo();
  const q = 0.9 + 0.2 * hashAt(x, z, 3);          // (no two alike: twelve identical shapes would be an instanced draw of their own)
  H.ball(x, y, z, (el.r ?? 0.6) * q, el.k ?? 0.62);
  if (el.floor !== undefined && y - el.floor > 0.1) H.floor(x, el.floor + 0.03, z, (el.pool ?? 1.8) * q, (el.pool ?? 1.8) * (2 - q), 10, el.pk ?? 0.7);
  H.flush(bag);
}

let done = false;
/** Wraps the style's houses and registers the glow element (once, after every file of the style has registered its own). */
export function registerNight() {
  if (done) return; done = true;
  const E = STYLES.romanesque.elements;
  if (typeof E.maison === 'function') E.maison = wrapMaison(E.maison);
  for (const s of ['romanesque', 'romanesque-foy']) if (STYLES[s]) (STYLES[s].elements ??= {}).conques_halo = haloElement;
}
registerNight();
