// Abu Simbel by night (docs/settlements/abu-simbel.md §19): the light of what burned there then — the bronze tripod braziers on the terrace and in the halls,
// the oil lamps before the gods of the sanctuary, the stone lamp-stands at the temples' doors and the gates, the watch-fires on the quay, at the ramp and in
// the masons' yard, the clay lamps of the houses (a wick in oil, seen through the door), the lamps of the shops that kept open into the evening, the bakers'
// ovens lit before dawn, the lamps of the camp's chapel. No electric light, no lanterns of paper. Light as geometry in the engine's one material `halo`
// (materials.js: light added over what is behind, at night only, no light, no shadow, no collision; brightness carried by the normals' y), so that it
// shows at the low preset. Same construction as Giza's (its files are not imported). Every place is a function of the lots' own seeds: no counters, no Math.random.
import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';
import { box as box3, lathe } from '../../core/geom.js';
import { STYLES } from '../../core/build.js';
import { FX, FXS, ZS, TERRACE, GATE, SGATE, QUAY, QUAY_Y, BANK_X, CHAPEL, lots } from './layout.js';
import { greatRooms, FLOOR } from '../../styles/ramesside/dims.js';
import { doorX } from './walk.js';
import { ground } from './ground.js';

const TAU = Math.PI * 2;
const hash = (a, b) => { let h = Math.imul(Math.floor(a * 131.07) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(Math.floor(b * 97.31) + 0x7f4a7c15, 0xc2b2ae35); h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; return (h >>> 0) / 4294967296; };

/** Triangles (position and a normal per corner) of the halo material. */
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
  floor(x, y, z, r, segs = 8) { this.disc([x, y, z], [1, 0, 0], [0, 0, 1], r, r, null, segs, [1, 0.42, 0], [0, 0.5, 1]); }
  ball(x, y, z, r) { for (let k = 0; k < 3; k++) { const a = k * Math.PI / 3, c = Math.cos(a), s = Math.sin(a); this.disc([x, y, z], [c, 0, s], [0, 1, 0], r, r, [-s, c], 8, [0.62, 0], [0, 1]); } }
  /** The wash of a lit slit on the wall round it: an upright disc facing (nx, nz). */
  spill(x, y, z, nx, nz, r) { const U = nx ? [0, 0, 1] : [1, 0, 0]; this.disc([x + nx * 0.02, y, z + nz * 0.02], U, [0, 1, 0], r, r * 0.7, [nx, nz], 8, [0.5, 0], [0, 1]); }
  flush(bag) {
    if (!this.pos.length) return;
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute(this.pos, 3));
    g.setAttribute('normal', new Float32BufferAttribute(this.nor, 3));
    bag.add('halo', g);
    this.pos = []; this.nor = [];
  }
}
/** A flame's glow ball and the pool it throws on the floor (y of the floor fy). */
const lamp = (H, x, y, z, fy, r = 0.5, pool = 1.5) => { H.ball(x, y, z, r); H.floor(x, fy + 0.03, z, pool, 10); };


/** The night's fires: [{ k, x, y, z, fy, r, pool }] computed from the layout (pure). */
let SITES = null;
export function sites() {
  if (SITES) return SITES;
  const S = SITES = [], g = (x, z) => ground.height(x, z);
  const R = greatRooms(), y1 = R[1].y0, y3 = R[3].y0, y7 = R[7].y0, T = FLOOR;
  // the terrace: the tripod braziers between the colossi's tables (bowl 0.8 m up)
  for (const zc of [-9.8, 9.8]) S.push({ k: 'brazier', x: TERRACE[0] + 14.5, y: T + 0.9, z: zc, fy: T, r: 0.75, pool: 2.6 });
  // the first hall's two braziers, the second hall's lamps between the pillars, the sanctuary's lamps before the four gods
  S.push({ k: 'brazier', x: FX - 12.6, y: y1 + 0.9, z: -2.3, fy: y1, r: 0.7, pool: 2.4 }, { k: 'brazier', x: FX - 24.6, y: y1 + 0.9, z: 2.3, fy: y1, r: 0.7, pool: 2.4 });
  for (const z of [-2.6, 2.6]) S.push({ k: 'lamp', x: FX - 36, y: y3 + 1.1, z, fy: y3, r: 0.4, pool: 1.6 });
  for (const z of [-1.0, 1.0]) S.push({ k: 'lamp', x: FX - 57.4, y: y7 + 1.1, z, fy: y7, r: 0.4, pool: 1.5 });
  // the Small Temple's braziers in its hall
  for (const s of [-1, 1]) S.push({ k: 'brazier', x: FXS - 7.4, y: T + 0.9, z: ZS + s * 3.4, fy: T, r: 0.7, pool: 2.4 });
  // the lamp-stands at the Small Temple's door (the south gate is lit by the shops' lamps, the Great Temple's door is lit by the terrace's braziers)
  for (const [x, z, fy] of [[FXS + 4, ZS - 3.2, T], [FXS + 4, ZS + 3.2, T]])
    S.push({ k: 'stand', x, y: fy + 1.5, z, fy, r: 0.55, pool: 1.9 });
  // the visitor's end of the terrace: four stone lamp-stands where the way from the south meets the forecourt (docs §23)
  for (const [x, z] of [[-9, 10], [-9, 24], [3, 11], [3, 23]]) S.push({ k: 'stand', x, y: T + 1.5, z, fy: T, r: 0.65, pool: 3.2 });
  // the watch-fires: on the quay, in the masons' yard
  for (const [x, z] of [[QUAY[0] + 9, -10.5], [QUAY[0] + 9, 10.5], [-13, 152]]) { const fy = x > 40 ? QUAY_Y : g(x, z); S.push({ k: 'fire', x, y: fy + 0.6, z, fy, r: 0.95, pool: 2.8 }); }
  // the camp's chapel: the lamps flanking the shrine (the forecourt's by a pedestal)
  { const zc = (CHAPEL[1] + CHAPEL[3]) / 2, ix0 = CHAPEL[0] + 0.225; for (const k of [-1, 1]) S.push({ k: 'lamp', x: ix0 + 1.3, y: 1.35, z: zc + k * 0.85, fy: 0, r: 0.4, pool: 1.5 }); S.push({ k: 'lamp', x: CHAPEL[0] + 12, y: 1.1, z: zc, fy: 0, r: 0.35, pool: 1.2 }); }
  // the lots: the houses' lamps (a lit door), the shops that kept open into the evening, the bakers' ovens lit before dawn
  for (const l of lots()) {
    const [x0, z0, x1, z1] = l.rect, n = l.front === 'n', zf = n ? z0 : z1, s = n ? -1 : 1, xd = doorX(l), fy = 0, cz = (a) => (n ? z0 + z1 - a : a);
    if (hash(l.seed, 3) < 0.4) continue;                                           // the household asleep, the lamp out
    if (l.kind === 'house') {
      S.push({ k: 'lamp', x: l.dm ? (x0 + x1) / 2 : x1 - 0.8, y: 1.15, z: cz(l.dm ? z1 - 1.4 : z0 + 0.6), fy, r: 0.35, pool: 1.3 });
      S.push({ k: 'door', x: xd, y: 1.3, z: zf + s * 0.22, nz: s, r: 0.7 });
    } else if (l.kind === 'shop') {
      S.push({ k: 'lamp', x: (x0 + x1) / 2, y: 2.3, z: cz((z0 + z1) / 2 - 0.4), fy, r: 0.4, pool: 1.5 });
      S.push({ k: 'door', x: xd, y: 1.4, z: zf + s * 0.24, nz: s, r: 0.8 });
    } else if (l.kind === 'bakery') {
      S.push({ k: 'fire', x: x0 + 1.0, y: 0.55, z: z0 + 1.0, fy, r: 0.8, pool: 2.2 });
      S.push({ k: 'ember', x: (x0 + x1) / 2, y: 0.6, z: z1 - 1.0, fy, r: 0.5, pool: 1.6 });
    }
  }
  return S;
}

/** abu_halo { }: the whole night's glow in one plan, one draw. */
function haloEl(el, { bag }) {
  const H = new Halo();
  for (const s of sites()) {
    if (s.k === 'door') { H.spill(s.x, s.y, s.z, 0, s.nz, s.r); continue; }
    lamp(H, s.x, s.y, s.z, s.fy, s.r, s.pool);
  }
  H.flush(bag);
}
/** A stone lamp-stand with its bowl of oil at the doors and the gates (the place of its flame is sites()'). */
function stand(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0;
  bag.add('sandstone_dressed', box3(x - 0.3, y, z - 0.3, x + 0.3, y + 0.2, z + 0.3));
  bag.add('sandstone_dressed', box3(x - 0.1, y + 0.2, z - 0.1, x + 0.1, y + 1.2, z + 0.1));
  bag.add('bronze', box3(x - 0.17, y + 1.2, z - 0.17, x + 0.17, y + 1.3, z + 0.17));
  bag.add('flame', box3(x - 0.09, y + 1.3, z - 0.09, x + 0.09, y + 1.4, z + 0.09));
  col.rect([x - 0.3, z - 0.3, x + 0.3, z + 0.3], y, y + 1.4);
}
/** A watch-fire: a ring of stones with logs on end and the flame. */
function watchFire(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0;
  for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; bag.add('sandstone_dressed', box3(x + Math.cos(a) * 0.55 - 0.13, y, z + Math.sin(a) * 0.55 - 0.13, x + Math.cos(a) * 0.55 + 0.13, y + 0.22, z + Math.sin(a) * 0.55 + 0.13)); }
  bag.add('palm_trunk', lathe([[0.001, 0], [0.12, 0.02], [0.1, 0.32], [0.001, 0.34]], 6, null, x - 0.12, y, z));
  bag.add('palm_trunk', lathe([[0.001, 0], [0.1, 0.02], [0.09, 0.3], [0.001, 0.32]], 6, null, x + 0.14, y, z + 0.08));
  bag.add('flame', lathe([[0.001, 0.3], [0.22, 0.31], [0.12, 0.62], [0.001, 0.8]], 8, null, x, y, z));
  col.circle(x, z, 0.7, y, y + 0.3);
}
/** The lamp-stands' and fires' places (docs §19), for the plan that builds them. */
export const STANDS = sites().filter((s) => s.k === 'stand').map((s) => [s.x, s.z, s.fy]);
export const FIRES = sites().filter((s) => s.k === 'fire' && s.fy < 1 && s.pool > 2.7).map((s) => [s.x, s.z, s.fy]);

let done = false;
export function registerNight() {
  if (done) return; done = true;
  const E = STYLES.ramesside.elements;
  E.abu_halo = haloEl; E.abu_stand = stand; E.abu_fire = watchFire;
}
