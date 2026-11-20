// Uji by night (docs/settlements/heian-uji.md §19.2): the light of the fires and lamps of 1053, as geometry in the engine's one additive
// material `halo` (palette.js, materials.js 'halo'): light ADDED over what is behind it, at night only, with no light, no shadow and no
// collision, so the day view is unchanged and the low preset shows it. A piece's shape is carried by its normals (y: 1 at a disc's middle,
// 0 at its rim; negative on water): a glow round each flame (three crossed discs), a pool on the ground or floor, a streak on the water.
// What lit Uji: the hearth through the open front, pine torches and the basket fire (kagaribi) at gates, bridge heads and piers, the oil
// lamp on its stand (tōdai), the candles of the hall. No paper lanterns and no lit paper windows: neither existed (§19).
// Everything is a function of the thing's own place (hashAt): no counters, no Math.random.

import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';
import { box, lathe, rod, fromTriangles } from '../../core/geom.js';
import { STYLES } from '../../core/build.js';
import '../../styles/japanese/index.js';
import '../../buildings/byodo-in-phoenix-hall/style.js';
import { RIVER, POND_LEVEL, HALL } from './layout.js';
import { riverX, fireSpots, sanNoMa, deckY } from './fires.js';
import { tiled } from './street.js';

/** A number in [0, 1) from a position alone. */
export function hashAt(x, z, s = 0) {
  let h = (Math.round(x * 16) * 73856093) ^ (Math.round(z * 16) * 19349663) ^ Math.imul(s + 1, 83492791);
  h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

const TAU = Math.PI * 2, MAT = 'halo';
/** Triangles (position and a normal per corner) of the halo material; the brightness is the normal's y. */
export class Halo {
  constructor() { this.pos = []; this.nor = []; }
  tri(p0, n0, p1, n1, p2, n2) { this.pos.push(...p0, ...p1, ...p2); this.nor.push(...n0, ...n1, ...n2); }
  disc(c, U, V, su, sv, nh = null, segs = 8, F = [1, 0.42, 0], R = [0, 0.5, 1], sign = 1) {
    const at = (r, k) => { const a = k / segs * TAU, u = Math.cos(a) * su * R[r], v = Math.sin(a) * sv * R[r]; return [c[0] + U[0] * u + V[0] * v, c[1] + U[1] * u + V[1] * v, c[2] + U[2] * u + V[2] * v]; };
    const nm = (r, k) => { const a = k / segs * TAU, f = F[r], q = Math.sqrt(1 - f * f); return nh ? [nh[0] * q, f * sign, nh[1] * q] : [Math.cos(a) * q, f * sign, Math.sin(a) * q]; };
    const n = R.length - 1;
    for (let k = 0; k < segs; k++) {
      this.tri(at(0, k), nm(0, k), at(1, k), nm(1, k), at(1, k + 1), nm(1, k + 1));
      for (let r = 1; r < n; r++) {
        this.tri(at(r, k), nm(r, k), at(r + 1, k), nm(r + 1, k), at(r + 1, k + 1), nm(r + 1, k + 1));
        this.tri(at(r, k), nm(r, k), at(r + 1, k + 1), nm(r + 1, k + 1), at(r, k + 1), nm(r, k + 1));
      }
    }
  }
  /** A disc lying flat at height y (the ground, a floor, the water), radii r along yaw and rz across; k its strength. */
  floor(x, y, z, r, rz = r, yaw = 0, segs = 8, water = false, k = 1) {
    const s = Math.sin(yaw), c = Math.cos(yaw);
    this.disc([x, y, z], [c, 0, -s], [s, 0, c], r, rz, null, segs, [k, 0.42 * k, 0], [0, 0.5, 1], water ? -1 : 1);
  }
  /** The glow round a flame: three upright discs crossed at 60 degrees. */
  ball(x, y, z, r, k = 0.62) {
    for (let i = 0; i < 3; i++) { const a = i * Math.PI / 3 + 0.37, c = Math.cos(a), s = Math.sin(a); this.disc([x, y, z], [c, 0, s], [0, 1, 0], r, r, [-s, c], 8, [k, 0], [0, 1]); }
  }
  flush(bag) {
    if (!this.pos.length) return;
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute(this.pos, 3)); g.setAttribute('normal', new Float32BufferAttribute(this.nor, 3));
    bag.add(MAT, g); this.pos = []; this.nor = [];
  }
}

/** The hearth and the light of an opened house (house.js, near form): the glow at the fire, its pool on the earth floor, the spill out of the door onto the lane. */
export function hearthLight(bag, hearth, ry, door, fy, strength = 1) {
  const H = new Halo(), k = 0.5 + 0.2 * hashAt(hearth[0], hearth[1], 3);
  H.ball(hearth[0], ry + 0.75, hearth[1], 0.85, 0.62 * strength * (0.85 + k * 0.3));
  H.floor(hearth[0], ry + 0.03, hearth[1], 1.5, 1.5, 0, 8, false, 0.7 * strength);
  H.floor(door[0], fy + 0.03, door[1], 2.0, 2.0, 0, 8, false, k * 0.7 * strength);
  H.flush(bag);
}

// ── the basket fire (kagaribi): an iron basket on a tripod of wood, split pine in it ──────────────────
/** { at, y, water: [dx, dz] unit toward the water, d metres to it, wy the water's level }: the basket, the glow, its pool, and the streak on the water. */
export function kagaribi(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, H = new Halo();
  for (let k = 0; k < 3; k++) { const a = k * TAU / 3 + 0.5, c = Math.cos(a), s = Math.sin(a); bag.add('wood_dark', rod([x + c * 0.5, y, z + s * 0.5], [x + c * 0.2, y + 0.98, z + s * 0.2], 0.035, 5)); }
  bag.add('iron', lathe([[0.001, 0], [0.14, 0], [0.3, 0.2], [0.34, 0.34], [0.32, 0.36], [0.28, 0.34], [0.12, 0.05], [0.001, 0.05]], 8, null, x, y + 0.93, z));
  for (let k = 0; k < 4; k++) bag.add('iron', rod([x + Math.cos(k * 1.57) * 0.16, y + 0.98, z + Math.sin(k * 1.57) * 0.16], [x + Math.cos(k * 1.57) * 0.33, y + 1.27, z + Math.sin(k * 1.57) * 0.33], 0.014, 4));
  for (let k = 0; k < 5; k++) { const a = k * 1.26 + 0.3, c = Math.cos(a), s = Math.sin(a); bag.add('wood_dark', rod([x + c * 0.15, y + 1.04, z + s * 0.15], [x - c * 0.05 + s * 0.05, y + 1.4 + (k % 2) * 0.06, z - s * 0.05 - c * 0.05], 0.045, 5)); }
  H.ball(x, y + 1.5, z, 1.25, 0.7); H.floor(x, y + 0.04, z, 3.4, 3.4, 0, 10, false, 0.85);
  if (el.water) {
    const [dx, dz] = el.water, d = el.d ?? 3, a = 2.6;
    H.floor(x + dx * (d + a * 0.5), (el.wy ?? RIVER.level) + 0.02, z + dz * (d + a * 0.5), 0.8, a, Math.atan2(dx, dz), 10, true);
  }
  H.flush(bag);
  col.circle(x, z, 0.5, y, y + 1.4);
}

// ── the oil lamp on its stand (tōdai) ───────────────────────────────────────────────────────────────────
/** { at, y, h }: a stand of dark wood (a post on a crossed foot) with the oil saucer and its wick, 1.2 m, and its small glow. */
export function todai(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, h = el.h ?? 1.2, H = new Halo();
  bag.add('wood_dark', box(x - 0.22, y, z - 0.03, x + 0.22, y + 0.05, z + 0.03)); bag.add('wood_dark', box(x - 0.03, y, z - 0.22, x + 0.03, y + 0.05, z + 0.22));
  bag.add('wood_dark', rod([x, y, z], [x, y + h, z], 0.025, 5));
  bag.add('pottery_dark', lathe([[0.001, 0], [0.09, 0.01], [0.12, 0.04], [0.1, 0.045], [0.001, 0.03]], 8, null, x, y + h, z));
  H.ball(x, y + h + 0.12, z, 0.5, 0.58); H.floor(x, y + 0.04, z, 1.5, 1.5, 0, 8, false, 0.5);
  H.flush(bag);
  col.circle(x, z, 0.24, y, y + 0.5);
}

// ── a moored boat with a fire basket at its bow (the fishing boat of the river by night) ──────────────
/** { at, y (the water), rot (the bow toward +z turned by rot) }: a plank boat 4.4 m long, a pine-wood fire basket on an iron holder at the bow. */
export function hibune(el, { bag }) {
  const [x, z] = el.at, y = el.y ?? 0, a = el.rot ?? 0, c = Math.cos(a), s = Math.sin(a), H = new Halo();
  const W = (u, v) => [x + u * c + v * s, z - u * s + v * c];
  const B = (m, u0, v0, u1, v1, y0, y1) => { const p = W(u0, v0), q = W(u1, v1); bag.add(m, box(Math.min(p[0], q[0]), y + y0, Math.min(p[1], q[1]), Math.max(p[0], q[0]), y + y1, Math.max(p[1], q[1]))); };
  B('timber', -0.45, -2.1, 0.45, 2.1, -0.1, 0.02);                                              // the bottom
  B('timber', -0.55, -1.9, -0.45, 1.9, 0.0, 0.42); B('timber', 0.45, -1.9, 0.55, 1.9, 0.0, 0.42);   // the sides
  B('timber', -0.4, 1.9, 0.4, 2.2, 0.0, 0.5); B('timber', -0.4, -2.2, 0.4, -1.9, 0.0, 0.34);        // the raised bow, the stern
  B('wood_dark', -0.5, -0.3, 0.5, -0.2, 0.2, 0.26);                                              // a thwart
  const f = W(0, 1.55);
  bag.add('iron', rod([f[0], y + 0.4, f[1]], [f[0], y + 1.15, f[1]], 0.02, 5));
  bag.add('iron', lathe([[0.001, 0], [0.12, 0.03], [0.2, 0.2], [0.18, 0.22], [0.001, 0.05]], 8, null, f[0], y + 1.1, f[1]));
  for (let k = 0; k < 4; k++) bag.add('wood_dark', rod([f[0] + Math.cos(k * 1.6) * 0.08, y + 1.15, f[1] + Math.sin(k * 1.6) * 0.08], [f[0], y + 1.4 + (k % 2) * 0.05, f[1]], 0.03, 4));
  H.ball(f[0], y + 1.5, f[1], 1.1, 0.68);
  H.floor(f[0] + s * 0.5, y + 0.02, f[1] + c * 0.5, 2.4, 2.4, 0, 10, true, 0.8);                 // the fire's disc on the water round the bow
  H.flush(bag);
}

// ── the hall: the candles and the light in its open doors, and their reflection in the pond ───────────
/** The hall's night (plan-local coordinates; the offering table's two candles at (1.5, ±0.24), the floor 1.1): glow at the flames, the pool on the floor, the doors' spill, the reflection. */
export function hallLight(el, { bag }) {
  const H = new Halo(), F = 1.1;
  for (const s of [-1, 1]) H.ball(1.5, F + 0.82, s * 0.24, 0.9, 0.6);
  H.floor(1.5, F + 0.04, 0, 3.2, 3.2, 0, 10, false, 0.75);
  H.ball(-0.35, F + 3.0, 0, 1.7, 0.34);                                                          // the gilt Amida's face, caught by the candles
  H.ball(3.9, F + 1.4, 0, 2.3, 0.3);                                                             // the spill in the open middle door
  H.floor(7.5, F + 0.03, 0, 3.6, 2.6, 0, 8, false, 0.32);                                        // on the veranda before it
  H.floor(17, POND_LEVEL + 0.02, 0, 10.5, 1.5, 0, 12, true, 0.5);                                 // its streak on the pond, east of the hall
  H.flush(bag);
}

/** Register the elements (idempotent). */
export function registerNight() {
  const J = STYLES.japanese, B = STYLES['japanese-byodo'];
  if (J) { J.elements.uji_kagaribi = kagaribi; J.elements.uji_todai = todai; J.elements.uji_hibune = hibune; }
  if (B) B.elements.uji_hall_light = hallLight;
}
registerNight();

// ── where they stand ──────────────────────────────────────────────────────────────────────────────────
const rx = riverX;
/** The night's elements: world coordinates (the hall's own is in plan.js). */
export function nightElements() {
  const E = [];
  for (const f of fireSpots()) E.push({ t: 'uji_kagaribi', at: f.at, y: f.y });
  const [sx, sz] = sanNoMa();
  E.push({ t: 'uji_todai', at: [sx, sz], y: deckY(sx), h: 1.1 });             // at Hashihime's place on the san-no-ma
  // the fire boats of the river, moored in the shallows of the west bank (the fishers' craft, not fishing: §19.2)
  for (const [z, xo, rot] of [[-70, -17, 0.25], [-30, -19, -0.2], [20, -18, 0.1]]) E.push({ t: 'uji_hibune', at: [rx(z) + xo, z], y: RIVER.level, rot });
  return E;
}
export function nightPlans() {
  const J = nightElements();
  return tiled('heian-uji-night', 'japanese', J, 230);
}
void HALL; void fromTriangles;
