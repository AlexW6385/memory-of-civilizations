// Stonehenge about 2500 BC by night — what lit it and the light it throws (docs/settlements/stonehenge.md §12).
// Fire is the only light the place had: the hearth of each house seen through its door and breaking through the thatch as smoke, the open fires
// of the midwinter feast and of the camps with the pigs roasting over them, the fire at the heart of the Southern Circle, the fire in a camp hut.
// No lamp, no candle, no torch is known [inferred: none is attested for the Late Neolithic of Wessex]. Everything here is geometry in one material,
// `halo` (palette.js): light ADDED over what is behind it, at night only, with no light, shadow or collision, so the day view is unchanged and it
// shows at the low preset. The shape of each piece is carried by its normals (y: 1 at a disc's middle, 0 at its rim). The neolithic style's elements
// are wrapped from here (the style file is not touched for this); each light is a function of its own place (no counters, no Math.random).
import '../../styles/neolithic/index.js';
import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';
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
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

let depth = 0;
/**
 * A house at night (§12): the glow of its hearth as the style draws it (a flame, where one is drawn; else, in the open houses and in half the others,
 * the banked embers: a faint red pool), the pool of the fire's light on the floor, the doorway's spill on the trodden chalk outside (the door being open:
 * a bare doorway, or a hide rolled up), and the smoke breaking through the thatch over the hearth, lit from beneath.
 */
const wrapHouse = (fn) => function lit(el, ctx) {
  if (depth > 0 || !ctx?.lights) { depth++; try { return fn.call(this, el, ctx); } finally { depth--; } }
  const H = new Halo(), real = ctx.bag, [x, z] = el.c, y = el.y ?? 0, a = el.yaw ?? 0, c = Math.cos(a), s = Math.sin(a), hw = (el.s ?? 5) / 2;
  let flame = null;
  const bag = new Proxy(real, {
    get(t, k) {
      if (k === 'add') return (mat, g, ...r) => {
        if (mat === 'flame' && g?.attributes?.position && !flame) { const b = bounds(g); flame = [(b[0] + b[3]) / 2, b[1], (b[2] + b[5]) / 2]; }
        return t.add(mat, g, ...r);
      };
      const v = t[k];
      return typeof v === 'function' ? v.bind(t) : v;
    },
  });
  depth++;
  try { var r = fn.call(this, el, { ...ctx, bag }); } finally { depth--; }
  const hearth = [x + 0.1 * s, z - 0.1 * c], doorU = (rng(el.seed || 1)() - 0.5) * 0.8 * (el.open ? 0.7 : 1), th = 0.16;
  const door = [x + doorU * c - (hw + th) * s, z + doorU * s + (hw + th) * c], out = [-s, c];           // the doorway's middle, and the way out
  const lit1 = !!flame, ember = el.open || hashAt(x, z, 31) < 0.5;
  if (lit1 || ember) {
    const k = lit1 ? 1 : 0.34;
    if (lit1) H.ball(flame[0], flame[1] + 0.28, flame[2], 0.8, 0.7);
    H.floor(hearth[0], y + 0.07, hearth[1], lit1 ? 1.9 : 1.2, lit1 ? 1.9 : 1.2, 10, 0.9 * k);                                  // the pool of light on the chalk floor
    H.ball(x, y + (el.open ? 3.9 : 3.2) + (el.s ?? 5) * 0.55, z, 0.9, 0.3 * k);                                                // the smoke breaking through the thatch over the hearth
    H.floor(door[0] + out[0] * 1.5, y + 0.05, door[1] + out[1] * 1.5, 2.3, 1.8, 10, 0.75 * k);                               // the spill of the doorway
  }
  H.flush(real);
  return r;
};
/** A feast fire at night: the great glow of the fire and its pool on the trodden ground, wider where a pig is on the spit. */
const wrapFire = (fn) => function lit(el, ctx) {
  const r = fn.call(this, el, ctx);
  if (depth === 0 && ctx?.lights) {
    const H = new Halo(), [x, z] = el.c ?? el.at, y = el.y ?? 0, big = el.pig !== false ? 1 : 0.8;
    H.ball(x, y + 0.5, z, 1.5 * big, 0.75); H.floor(x, y + 0.06, z, 4.6 * big, 4.3 * big, 12, 0.95);
    if (el.pig !== false) H.ball(x, y + 1.2, z, 1.0, 0.35);                                                                     // the light on the roasting pig
    H.flush(ctx.bag);
  }
  return r;
};
/** A camp hut with its fire lit: the glow of the hearth through the doorway and through the smoke hole, the spill outside. */
const wrapHut = (fn) => function lit(el, ctx) {
  const r = fn.call(this, el, ctx);
  if (depth === 0 && ctx?.lights && el.fire) {
    const H = new Halo(), [x, z] = el.c, y = el.y ?? 0, a = el.yaw ?? 0, c = Math.cos(a), s = Math.sin(a), R = el.r ?? 2.3;
    H.ball(x, y + 0.5, z, 0.8, 0.7); H.floor(x, y + 0.07, z, R * 0.85, R * 0.85, 10, 0.85);
    H.ball(x, y + (el.h ?? 3.9) - 0.1, z, 0.9, 0.35);
    H.floor(x - R * s * 1.6, y + 0.05, z + R * c * 1.6, 2.2, 1.7, 10, 0.7);
    H.flush(ctx.bag);
  }
  return r;
};
let done = false;
export function registerNight() {
  if (done) return; done = true;
  const E = STYLES.neolithic.elements;
  E.neolithic_house = wrapHouse(E.neolithic_house); E.feast_fire = wrapFire(E.feast_fire); E.camp_hut = wrapHut(E.camp_hut);
}
registerNight();
