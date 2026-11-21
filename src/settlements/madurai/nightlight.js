// Madurai by night about 1650: the light of the oil lamps (docs/settlements/madurai.md §20). The flames the temple's builders already
// set (`flame`: the wicks of the lamp stands, the rows of clay lamps on the tank's top steps) glow of themselves; what they lack,
// where the pool of real lights is off (the low preset), is the light they give what is round them. Here it is made of geometry in the
// engine's one additive material `halo` (palette.js, materials.js 'halo'): light ADDED over what is behind it, at night only, with
// no light, no shadow and no collision. The pattern is that of Suzhou's and Bhaktapur's nightlight.js, copied and adapted (nothing
// imported from them): a glow round each flame (three crossed discs), a pool on the paving. Every piece is a `madurai_halo` element of
// one street-life plan (instanced, drawn within 60 m of the eye). Everything is a function of the lamp's or the lot's own place.

import { BufferGeometry, Float32BufferAttribute, Matrix4, Quaternion, Vector3 } from '../../core/three.js';
import { placeHanging } from '../../core/geom.js';
import { STYLES } from '../../core/build.js';
import '../../objects/index.js';
import { assembly } from '../../objects/kit.js';
import { RADIUS, WALL, GATES, SUNDARA, MEENAKSHI, TANK, HALL, lots, lotMap, outside } from './layout.js';

/** A number in [0, 1) from a position alone. */
export function hashAt(x, z, s = 0) {
  let h = (Math.round(x * 16) * 73856093) ^ (Math.round(z * 16) * 19349663) ^ Math.imul(s + 1, 83492791);
  h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
/** The share of the houses with the lamp lit by their door, and of the shops open into the evening with theirs [inferred: oil is dear; the temple streets' trades kept to the lamp until the closing of the shrines]. */
export const HOUSE_LIT = 0.45, SHOP_LIT = 0.5;
const TAU = Math.PI * 2, MAT = 'halo', HALO_REACH = 60, NIGHT_RICH = 175;

class Halo {
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
  /** A disc lying on a horizontal plane at height y. */
  floor(x, y, z, r, rz = r, yaw = 0, segs = 8, k = 1) {
    const s = Math.sin(yaw), c = Math.cos(yaw);
    this.disc([x, y, z], [c, 0, -s], [s, 0, c], r, rz, null, segs, [k, 0.42 * k, 0], [0, 0.5, 1]);
  }
  /** The glow round a flame at (x, y, z), radius r: three upright discs crossed at 60 degrees. */
  ball(x, y, z, r) {
    for (let k = 0; k < 3; k++) { const a = k * Math.PI / 3, c = Math.cos(a), s = Math.sin(a); this.disc([x, y, z], [c, 0, s], [0, 1, 0], r, r, [-s, c], 8, [0.62, 0], [0, 1]); }
  }
}

// ── the units: built at the lamp's foot (the origin), +z outward from the wall behind (at −z) ─────────────────
function unitOf(kind) {
  return assembly(`mdu-halo|${kind}`, (a) => {
    const H = new Halo();
    if (kind === 'door') { H.ball(0, 1.62, 0.5, 1.25); H.floor(0, 0.6, 1.2, 2.1, 1.7, 0, 10, 1); H.floor(0, 0.05, 3.6, 2.7, 2.2, 0, 10, 0.75); }   // the lamp by a door or under a shop's awning: its ball, the pool on the thinnai, the spill on the street
    else if (kind === 'stand') { H.ball(0, 1.35, 0, 1.3); H.floor(0, 0.03, 0, 2.4, 2.4, 0, 8, 1); }                 // a tall bronze lamp with its five wicks
    else if (kind === 'diya') { H.ball(0, 0.12, 0, 0.5); H.floor(0, 0.03, 0, 1.1, 1.1, 0, 8, 0.7); }                  // two clay lamps of a row on a step
    else if (kind === 'row') { H.ball(0, 0.2, 0, 0.8); H.floor(0, 0.03, 0, 1.0, 1.7, 0, 8, 0.85); }                    // the five lamps before a flagstaff
    const g = new BufferGeometry(); g.setAttribute('position', new Float32BufferAttribute(H.pos, 3)); g.setAttribute('normal', new Float32BufferAttribute(H.nor, 3)); a(MAT, g);
  });
}
/** madurai_halo { kind, at, y, rot (+z outward) }: one piece of lamp light, instanced like the lamps themselves. */
function maduraiHalo(el, { bag }) {
  const U = unitOf(el.kind), [x, z] = el.at;
  const M = new Matrix4().compose(new Vector3(x, el.y ?? 0, z), new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), el.rot ?? 0), new Vector3(1, 1, 1));
  for (const [mat, g] of Object.entries(U)) { if (bag.addInstance) bag.addInstance(mat, g.clone(), M, { reach: HALO_REACH }); else bag.add(mat, placeHanging(g.clone(), M)); }
}

/** The street life's elements for the night: every halo of the temple and the temple streets. */
export function nightElements() {
  const out = [], put = (kind, at, y, rot = 0) => out.push({ t: 'madurai_halo', kind, at, y, rot });
  // the houses and shops of the first rings: the lamp at the door of those that keep one lit (the lamp at u = middle + 1.0, at the front wall)
  for (const l of lots()) {
    if (l.kind === 'yard' || l.kind === 'hut') continue;
    const cx = (l.rect[0] + l.rect[2]) / 2, cz = (l.rect[1] + l.rect[3]) / 2, o = outside(cx, cz);
    if (o > NIGHT_RICH) continue;
    const shop = l.kind === 'shop', share = (shop ? SHOP_LIT : HOUSE_LIT) * (o < 100 ? 1 : 0.7);
    if (hashAt(cx, cz, 5) >= share) continue;
    const { W, map } = lotMap(l), ver = shop ? 2.3 : 2.0, a = map(0, 0), b = map(0, -1), rot = Math.atan2(b[0] - a[0], b[1] - a[1]);
    put('door', map(W / 2 + (shop ? 0 : 1.0), ver - 0.1), 0, rot);
  }
  // the temple: the lamp stands before the shrines' gopurams (plan.js `rite`), the five lamps before the flagstaffs, the rows of clay lamps along the tank's top steps, the stands before the Nataraja
  for (const [gx, gz, d] of [[SUNDARA[2], (SUNDARA[1] + SUNDARA[3]) / 2, 12], [MEENAKSHI[2], (MEENAKSHI[1] + MEENAKSHI[3]) / 2, 9]]) for (const s of [-1, 1]) put('stand', [gx - d / 2 - 0.9, gz + s * 1.7], 0, 0);
  for (const [x, z] of [[SUNDARA[2] + 10, (SUNDARA[1] + SUNDARA[3]) / 2], [MEENAKSHI[2] + 8, (MEENAKSHI[1] + MEENAKSHI[3]) / 2]]) put('row', [x + 1.3, z], 0, 0);
  for (const zz of [TANK[1] + 0.17, TANK[3] - 0.17]) for (let i = 0; i < 12; i++) put('diya', [TANK[0] + 2 + (i + 0.5) * (TANK[2] - TANK[0] - 4) / 12, zz], 0, 0);
  for (const sx of [-1, 1]) put('stand', [(HALL[0] + HALL[2]) / 2 + sx * 2.3, HALL[1] + 4.4], 0.5, 0);
  // the great gopurams' passages: a lamp stand each side of the mouth and one inside, where the pilgrims entered after dark [inferred: the temple never closed its gates to the lamp-lit evening services]
  for (const [gx, gz, dz] of [[GATES.s[0], GATES.s[1], 1], [GATES.n[0], GATES.n[1], -1], [GATES.e[0], GATES.e[1], 0], [GATES.w[0], GATES.w[1], 0]]) {
    const out_ = dz ? [0, dz] : [gx > 0 ? 1 : -1, 0];
    for (const s of [-1, 1]) put('stand', [gx + (dz ? s * 3.2 : out_[0] * 5), gz + (dz ? out_[1] * 5 : s * 3.2)], 0, 0);
    put('row', [gx + out_[0] * 0, gz - out_[1] * 3], 0, 0);
  }
  void RADIUS; void WALL; void GATES;
  return out;
}

/** Register the street life's halo element. */
export function registerNight() { if (STYLES.life) STYLES.life.elements.madurai_halo = maduraiHalo; }
registerNight();
