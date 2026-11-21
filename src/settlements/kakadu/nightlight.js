// Ubirr by night, about AD 1000 — what lit it and the light it throws (docs/settlements/kakadu.md §15.2).
// Fire is the only light of the place: the family's hearths on the apron and the floors of the shelters, the fires inside the bark houses, domes and
// brush shades, a few earth ovens with their stones still hot, and a small fire on the clay pad of a canoe on the billabong (fishing by firelight [inferred]).
// No lamp, no candle. Everything here is geometry in one material, `halo` (palette.js): light ADDED over what is behind it, at night only, with no
// light, shadow or collision, so the day view is unchanged and it shows at the low preset. The shape of each piece is carried by its normals (y: 1 at a
// disc's middle, 0 at its rim; negative on water). The style's elements are wrapped from here (the style files stay as they were); each light is a
// function of its own place (no counters, no Math.random).
import '../../styles/kakadu/index.js';
import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';
import { STYLES } from '../../core/build.js';
import { ceilY } from '../../styles/kakadu/rock.js';
import { HOUSE } from '../../styles/kakadu/house.js';
import { MAIN, SMALL, HOUSES, houseRot, POOL } from './layout.js';

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
  /** A disc on a horizontal plane (ground, floor, a ceiling's underside, the water) at height y; water: the ripple-broken kind. */
  floor(x, y, z, r, rz = r, yaw = 0, segs = 8, k = 1, water = false) {
    const s = Math.sin(yaw), c = Math.cos(yaw);
    this.disc([x, y, z], [c, 0, -s], [s, 0, c], r, rz, null, segs, [k, 0.42 * k, 0], [0, 0.5, 1], water ? -1 : 1);
  }
  /** The glow round a flame: three upright discs crossed at 60 degrees. */
  ball(x, y, z, r, k = 0.62) {
    for (let i = 0; i < 3; i++) { const a = i * Math.PI / 3 + 0.37, c = Math.cos(a), s = Math.sin(a); this.disc([x, y, z], [c, 0, s], [0, 1, 0], r, r, [-s, c], 8, [k, 0], [0, 1]); }
  }
  /** A wash on a wall at (x, y, z), the wall's outward normal nh = [x, z]; rw wide and rh high (semi-axes). */
  wall(x, y, z, nh, rw, rh, segs = 8, k = 1) { this.disc([x, y, z], [-nh[1], 0, nh[0]], [0, 1, 0], rw, rh, nh, segs, [0.9 * k, 0], [0, 1]); }
  flush(bag) {
    if (!this.pos.length) return;
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute(this.pos, 3)); g.setAttribute('normal', new Float32BufferAttribute(this.nor, 3));
    bag.add('halo', g); this.pos = []; this.nor = [];
  }
}

const inShelter = (S, x, z) => x > S.x0 - 1 && x < S.x1 + 1 && z > S.zb && z < S.zl;
const shelterOf = (x, z) => (inShelter(MAIN, x, z) ? MAIN : inShelter(SMALL, x, z) ? SMALL : null);
const houseAt = (x, z) => HOUSES.find((Hs) => { const r = houseRot(Hs), c = Math.cos(r), s = Math.sin(r), dx = x - Hs.at[0], dz = z - Hs.at[1], B = HOUSE[Hs.kind]; return Math.abs(dx * c - dz * s) < B.hw && Math.abs(dx * s + dz * c) < B.hd; });
const ROOF = { bark: 3.3, dome: 2.6, shade: 2.6 };

/** A fire: its pool on the ground and the ball of light round the flame; under an overhang the roof's soot-black underside and the painted wall lit by it; inside a shelter a smaller pool, the glow at the smoke's way out. */
function fireGlow(el, base) {
  const [x, z] = el.at, y = el.y ?? 0, H = new Halo(), S = shelterOf(x, z), Hs = houseAt(x, z);
  const q = 0.85 + 0.15 * hashAt(x, z, 3);
  if (Hs) {
    H.ball(x, y + 0.5, z, 0.75, 0.7 * q); H.floor(x, y + 0.08, z, 2.1, 1.9, 0, 10, 0.9);
    const r = houseRot(Hs), s = Math.sin(r), c = Math.cos(r), B = HOUSE[Hs.kind], w = (lx, lz) => [Hs.at[0] + lx * c + lz * s, Hs.at[1] - lx * s + lz * c];
    const [rx, rz] = w(0, 0); H.ball(rx, y + ROOF[Hs.kind] + 0.35, rz, 0.9, 0.38);                  // the smoke taking the light out through the roof
    const [dx, dz] = w(0, B.hd + 1.1); H.floor(dx, y + 0.12, dz, 2.0, 1.5, r, 10, 0.5);               // the doorway's spill on the ground outside
    if (Hs.kind !== 'dome') { const zw = Hs.kind === 'bark' ? -2.0 + 0.1 : -1.7 + 0.22, [px, pz] = w(0, zw); H.wall(px, y + 1.05, pz, [s, c], 1.15, 0.7, 8, 0.42); }   // the painting on the inner wall in the firelight
  } else {
    H.ball(x, y + 0.5, z, 0.95, 0.72 * q); H.floor(x, y + 0.08, z, 3.3, 3.0, 0, 12, 0.88);
    H.floor(x, y + 0.1, z, 7.5, 6.5, 0, 12, 0.3);                                                      // the wide faint spill: the apron round a camp, firelit as far as the next
    if (S) {
      const cy = ceilY(S, x, z) - 0.06;
      H.floor(x, cy, z, 3.6, 2.4, 0, 10, 0.5);                                                         // the roof over the hearth, black with soot, lit from below
      H.wall(x, 1.7, S.zb + 0.12, [0, 1], 3.6, 1.5, 10, 0.34);                                         // the painted back wall, a long way off but the nearest thing to catch it
    }
  }
  H.flush(base);
}
let done = false;
export function registerNight() {
  if (done) return; done = true;
  const E = STYLES.kakadu.elements, fire0 = E.ka_fire, canoe0 = E.ka_canoe, use0 = E.ka_use;
  E.ka_fire = function lit(el, ctx) { const r = fire0.call(this, el, ctx); if (ctx?.bag) fireGlow(el, ctx.bag); return r; };
  // a small fire on the clay pad of a canoe that is afloat: fishing by firelight, its reflection broken by the water
  E.ka_canoe = function litCanoe(el, ctx) {
    const r = canoe0.call(this, el, ctx);
    if (ctx?.bag && (el.y ?? 0) < POOL.water + 0.15) {
      const [x, z] = el.at, y = el.y ?? 0, rot = el.rot ?? 0, s = Math.sin(rot), c = Math.cos(rot), px = x + 0.2 * s, pz = z + 0.2 * c, H = new Halo();
      H.ball(px, y + 0.4, pz, 0.7, 0.62); H.floor(px, y + 0.03, pz, 2.2, 2.0, 0, 10, 0.7, true);
      H.flush(ctx.bag);
    }
    return r;
  };
  // the open earth ovens, their stones still hot after the day's cooking (variant 0)
  E.ka_use = function litUse(el, ctx) {
    const r = use0.call(this, el, ctx);
    if (ctx?.bag && el.kind === 'oven' && (el.seed ?? 0) % 3 === 0) { const [x, z] = el.at, y = el.y ?? 0, H = new Halo(); H.ball(x, y + 0.2, z, 0.5, 0.4); H.floor(x, y + 0.05, z, 1.3, 1.3, 0, 8, 0.5); H.flush(ctx.bag); }
    return r;
  };
}
registerNight();
