// Great Zimbabwe about 1350 by night — what lit the town, and the light it throws (docs/settlements/great-zimbabwe.md §19.2).
// The light of the time is fire: the hearth of three stones in every house and the cooking fires in the yards, the fire kept at the cattle kraal through the
// night, the forge's embers, the watch-fires at the Great Enclosure's entrance. No lamp is made: no oil lamp, no wax candle is known on the plateau [inferred].
// Everything here is geometry in one material, `halo` (palette.js, materials.js 'halo'): light ADDED over what is behind it, at night only, with no light, no
// shadow and no collision, so the day view is unchanged and the pools of real light (off at the low preset) are not needed. The shape of each piece is carried by
// its normals (y: 1 at a disc's middle, 0 at its rim): a glow round each fire (three crossed discs), a pool on the floor, a pane in a lit doorway. The elements of
// the zimbabwe style that put a light into their plan are wrapped here (the style file stays as it was), the closed houses' doors and the yards' hearths glow by
// the hash of their own place, and the few new fires are `gz_nightfire` elements. Every light is a function of its own place: no counters, no Math.random.
// The method is that of the Suzhou reference, written for this place's fires; nothing of Suzhou's is imported.

import '../../styles/zimbabwe/index.js';
import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';
import { lathe, fromTriangles } from '../../core/geom.js';
import { STYLES } from '../../core/build.js';
import { beamTris } from '../../styles/ming/index.js';

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
  /** A flat sheet (a lit doorway) of brightness f, facing n = [x, z]. */
  quad(a, b, c, d, n, f) { const q = Math.sqrt(1 - f * f), N = [n[0] * q, f, n[1] * q]; this.tri(a, N, b, N, c, N); this.tri(a, N, c, N, d, N); }
  flush(bag) {
    if (!this.pos.length) return;
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute(this.pos, 3)); g.setAttribute('normal', new Float32BufferAttribute(this.nor, 3));
    bag.add(MAT, g); this.pos = []; this.nor = [];
  }
}

/** The halo of one light of a plan (`lights` entries: { at, distance, intensity }); `floor` the height of the floor or ground it stands over, if known. */
function lightHalo(H, l, floor) {
  const [x, y, z] = l.at, d = l.distance ?? 6, k = Math.min(1, (l.intensity ?? 2) / 2.4);
  H.ball(x, y, z, Math.max(0.42, Math.min(0.95, d * 0.11)) * (0.8 + 0.2 * k));
  if (floor !== undefined && y - floor < 3.0 && y - floor > 0.1) H.floor(x, floor + 0.03, z, Math.max(1.3, Math.min(3.4, d * 0.42)), Math.max(1.3, Math.min(3.4, d * 0.42)), 10, 0.8);
}

let depth = 0;
/** The hut's own numbers (zimbabwe/index.js hut): the door's angle and the wall's radius. */
const hutFrame = (el) => { const [x, z] = el.c, r = el.r ?? 3, a = (((el.seed ?? Math.floor(Math.abs(x * 13 + z * 7))) % 628) / 100); return { x, z, r, a, y: el.y ?? 0, ux: Math.cos(a), uz: Math.sin(a) }; };

/** Wrap one element builder: the halo of every light it adds, and by element kind the extra glow. */
const wrap = (name, fn) => function haloed(el, ctx) {
  const lights = ctx?.lights, n = lights ? lights.length : 0;
  if (depth > 0 || !lights || el.simple) { depth++; try { return fn.call(this, el, ctx); } finally { depth--; } }
  depth++;
  try { var r = fn.call(this, el, ctx); } finally { depth--; }
  const H = new Halo();
  const hut = name === 'daga_hut';
  const floor = hut ? (el.y ?? 0) + (el.open ? 0.24 : 0) : (el.y ?? undefined);
  for (const l of lights.slice(n)) lightHalo(H, l, floor);
  if (hut) {
    const F = hutFrame(el), px = F.x + F.ux * (F.r + 0.9), pz = F.z + F.uz * (F.r + 0.9);
    if (el.open) {
      // the open house's fire shows through its wide door: the light spilling over the sill into the yard, and a pane of it in the doorway
      H.floor(px, F.y + 0.115, pz, 2.0, 1.5, 8, 0.7);
      const tx = -F.uz, tz = F.ux, o = F.r + 0.12;
      H.quad([F.x + F.ux * o - tx * 0.8, F.y + 0.3, F.z + F.uz * o - tz * 0.8], [F.x + F.ux * o + tx * 0.8, F.y + 0.3, F.z + F.uz * o + tz * 0.8], [F.x + F.ux * o + tx * 0.8, F.y + 2.0, F.z + F.uz * o + tz * 0.8], [F.x + F.ux * o - tx * 0.8, F.y + 2.0, F.z + F.uz * o - tz * 0.8], [F.ux, F.uz], 0.5);
    } else if (hashAt(F.x, F.z, 11) < 0.5) {
      // a closed house with its family at the fire: the dark door slab glows
      const tx = -F.uz, tz = F.ux, o = F.r + 0.07;
      H.quad([F.x + F.ux * o - tx * 0.42, F.y + 0.4, F.z + F.uz * o - tz * 0.42], [F.x + F.ux * o + tx * 0.42, F.y + 0.4, F.z + F.uz * o + tz * 0.42], [F.x + F.ux * o + tx * 0.42, F.y + 1.83, F.z + F.uz * o + tz * 0.42], [F.x + F.ux * o - tx * 0.42, F.y + 1.83, F.z + F.uz * o - tz * 0.42], [F.ux, F.uz], 0.28 + 0.3 * hashAt(F.x, F.z, 12));
      H.floor(px, F.y + 0.115, pz, 1.5, 1.1, 8, 0.45);
    }
  }
  if (name === 'homestead_goods') {
    // the cooking fire of the yard (in the style at (-0.8, 0.6) of the yard's frame): lit in two yards of three (the evening meal), nearer the gate it shows from outside
    const [x, z] = el.c, a = el.a ?? ((el.seed ?? 3) % 628) / 100, c = Math.cos(a), s = Math.sin(a), hx = x + c * -0.8 - s * 0.6, hz = z + s * -0.8 + c * 0.6, y = (el.yAt ? el.yAt(x, z) : el.y ?? 0) + 0.06;
    if (hashAt(x, z, 21) < 0.66) { H.ball(hx, y + 0.35, hz, 0.7, 0.7); H.floor(hx, y + 0.055, hz, 2.6, 2.6, 10, 0.7); }
  }
  H.flush(ctx.bag);
  return r;
};

/**
 * gz_nightfire: { at: [x, z], y, seed } — a fire of logs laid like the spokes of a wheel, the ends burnt in the middle where they meet (the way a fire is
 * kept going by pushing the logs in as they burn: later Shona practice [inferred]), a ring of granite stones, a low flame and a bed of ash; its glow and its
 * pool on the ground. A watch-fire at the entrance of the Great Enclosure, the fire at the trader's court, the fire at the kraal's gate.
 */
function nightfire({ at, y = 0, seed = 1 }, { bag, col, lights }) {
  const [x, z] = at, H = new Halo(), a0 = hashAt(x, z, 3) * TAU + seed, T = [];
  bag.add('plaster_grey', lathe([[0.62, 0], [0.62, 0.012], [0.001, 0.012]], 14, null, x, y + 0.02, z));
  for (let k = 0; k < 9; k++) { const t = a0 + k * TAU / 9, rr = 0.78 + 0.08 * hashAt(x + k, z, 4), s = 0.11 + 0.04 * hashAt(x, z + k, 5); bag.add('granite_grey', lathe([[0.001, 0], [s, 0.01], [s * 1.05, s * 0.7], [s * 0.6, s * 1.1], [0.001, s * 1.2]], 7, null, x + Math.cos(t) * rr, y, z + Math.sin(t) * rr)); }
  for (let k = 0; k < 5; k++) { const t = a0 + 0.4 + k * TAU / 5; beamTris(T, [x + Math.cos(t) * 0.7, y + 0.05 + 0.02 * (k % 2), z + Math.sin(t) * 0.7], [x + Math.cos(t) * 0.08, y + 0.14, z + Math.sin(t) * 0.08], 0.05, 0.09); }
  bag.add('tar_wood', fromTriangles(T));
  bag.add('flame', lathe([[0.001, 0], [0.12, 0.04], [0.09, 0.22], [0.045, 0.4], [0.001, 0.52 + 0.12 * hashAt(x, z, 6)]], 7, null, x, y + 0.14, z));
  col.circle(x, z, 0.95, y, y + 0.3);
  const l = { at: [x, y + 0.5, z], color: '#ff9a4a', intensity: 3.0, distance: 9 };
  lights.push(l);
  lightHalo(H, l, y);
  H.ball(x, y + 0.45, z, 1.0, 0.7);
  H.flush(bag);
}

let done = false;
/** Wraps the zimbabwe style's elements that make lights (once, after the style has registered its own). */
export function registerNight() {
  if (done) return; done = true;
  const E = STYLES.zimbabwe.elements;
  for (const k of ['daga_hut', 'smithy', 'dara_house', 'homestead_goods']) if (typeof E[k] === 'function') E[k] = wrap(k, E[k]);
  E.gz_nightfire = nightfire;
}
registerNight();
