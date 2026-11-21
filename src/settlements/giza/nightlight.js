// Giza by night (docs/settlements/giza.md §20): the light of what burned there then — the clay lamps of the houses (a wick in oil or fat), the banked
// ovens in the courts, the bakeries' hearths (the bread was baked before dawn), the gangs' camp fires, the hearths of the galleries' porches, the lamps
// of the works' lodgings, the watch-fires at the gate and the quay and the lamp-stands at the temples' doors. No electric light, no lanterns of paper.
// Light as geometry in the engine's one material `halo` (materials.js: light added over what is behind, at night only, no light, no shadow, no
// collision; the brightness carried by the normals' y), so that it shows at the low preset. Same construction as Thebes' (its files are not imported).
import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';
import { STYLES } from '../../core/build.js';
import { town as townLots, furnished, QUARRY, HARBOUR, ENCLOSURE, CROW_WALL, TEMPLE, VALLEY_TEMPLE, VALLEY } from './layout.js';
import { plan as housePlan, bakeryFires } from '../../styles/oldkingdom-giza/walkhouse.js';
import { CAMP_ITEMS } from './camps.js';
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

/** The work-fires of the plateau near the arrival (242, -50): the watch-fire of the hauling gang, the stall's two hearths; and the watch-fires along the town's gate street. */
export const WORK_FIRES = [[235, -54], [236, -41.5], [249.5, -63], [255.5, -63.5], [6.5, 182], [14.8, 197], [6.5, 214], [14.8, 230]];

/** The night's fires of the town and the works: { sites: [{ k, x, y, z, fy, r, pool }] }, computed from the layout (pure). */
let SITES = null;
export function sites() {
  if (SITES) return SITES;
  const S = SITES = [], g = (x, z) => ground.height(x, z);
  for (const l of townLots()) {
    const [x0, z0, x1, z1] = l.rect, fy = g((x0 + x1) / 2, (z0 + z1) / 2);
    if (l.kind === 'house' && furnished(l)) {
      if (hash(l.seed, 3) < 0.35) continue;                                                // the household asleep, the lamp out
      const P = housePlan(l), [lx, ly, lz] = P.lamp;
      S.push({ k: 'lamp', x: lx, y: fy + ly + 0.1, z: lz, fy, r: 0.4, pool: 1.5 });
      S.push({ k: 'slit', x: x0 + (x1 - x0) * 0.3, y: fy + 2.12, z: z0 - 0.24, nx: 0, nz: -1 });
      if (P.oven) S.push({ k: 'ember', x: P.oven[0], y: fy + 0.25, z: P.oven[1] + 0.7, fy, r: 0.3, pool: 0.9 });
    } else if (l.kind === 'bakery') {
      const F = bakeryFires(l);
      S.push({ k: 'fire', x: F.stack[0], y: fy + 0.55, z: F.stack[1], fy, r: 0.85, pool: 2.4 });
      S.push({ k: 'ember', x: F.bed[0], y: fy + 0.55, z: F.bed[1], fy, r: 0.55, pool: 1.8 });
    } else if (l.kind === 'gallery' && hash(l.seed, l.rect[0]) < 0.5) S.push({ k: 'fire', x: x0 + 1.0, y: fy + 0.35, z: (z0 + z1) / 2 - 0.9, fy, r: 0.55, pool: 1.8 });
  }
  for (const c of CAMP_ITEMS) if (c.kind === 'fire') S.push({ k: 'fire', x: c.x, y: g(c.x, c.z) + 0.5, z: c.z, fy: g(c.x, c.z), r: 0.9, pool: 2.6 });
  // the watch-fires: at the Wall of the Crow's gate on either side, on the quay at the landing and the north quay, and the lamp-stands at the temples' east doors
  const gx = CROW_WALL.a[0] + CROW_WALL.gate.at;
  for (const [x, z] of [[gx - 4, CROW_WALL.a[1] - 7], [gx + 4, CROW_WALL.a[1] + 7], [HARBOUR[0] + 2.5, 50], [HARBOUR[0] + 2.5, 24], [HARBOUR[0] + 2.5, 90]]) { const fy = x > 300 ? VALLEY + 0.02 : g(x, z); S.push({ k: 'fire', x, y: fy + 0.6, z, fy, r: 0.95, pool: 2.8 }); }
  for (const [x, z, fy] of [[VALLEY_TEMPLE[2] + 1.2, 47, VALLEY + 0.02], [VALLEY_TEMPLE[2] + 1.2, 57, VALLEY + 0.02]]) S.push({ k: 'stand', x, y: fy + 1.5, z, fy, r: 0.55, pool: 1.8 });
  // the fires of the arrival's plateau: the watch-fire by the hauling gang's road and the cooking-fires at the works' ration stall (docs §23)
  for (const [x, z] of WORK_FIRES) { const fy = g(x, z); S.push({ k: 'fire', x, y: fy + 0.5, z, fy, r: 0.9, pool: 2.8 }); }
  void QUARRY; void ENCLOSURE; void VALLEY;
  return S;
}

/** giza_halo { }: the whole night's glow in one plan, one draw. */
function haloEl(el, { bag }) {
  const H = new Halo();
  for (const s of sites()) {
    if (s.k === 'slit') { H.spill(s.x, s.y, s.z, s.nx, s.nz, 0.5); continue; }
    lamp(H, s.x, s.y, s.z, s.fy, s.r, s.pool);
  }
  H.flush(bag);
}
/** A stone lamp-stand with its bowl of oil at the doors of the temples. */
function stand(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0;
  bag.add('limestone_core', box3(x - 0.3, y, z - 0.3, x + 0.3, y + 0.2, z + 0.3));
  bag.add('limestone_core', box3(x - 0.1, y + 0.2, z - 0.1, x + 0.1, y + 1.2, z + 0.1));
  bag.add('terracotta', box3(x - 0.17, y + 1.2, z - 0.17, x + 0.17, y + 1.3, z + 0.17));
  col.rect([x - 0.3, z - 0.3, x + 0.3, z + 0.3], y, y + 1.4);
}
import { box as box3 } from '../../core/geom.js';
/** A hearth of three stones with ash and a few logs (the plateau's work-fires). */
function hearth(el, { bag }) {
  const [x, z] = el.at, y = el.y ?? 0;
  for (let k = 0; k < 3; k++) { const a = k * 2.094 + 0.4, sx = x + Math.cos(a) * 0.42, sz = z + Math.sin(a) * 0.42; bag.add('limestone_core', box3(sx - 0.14, y, sz - 0.12, sx + 0.14, y + 0.24, sz + 0.12)); }
}
/** The lamp-stands' places (docs §20). */
export const STANDS = sites().filter((s) => s.k === 'stand').map((s) => [s.x, s.z, s.fy]);

let done = false;
export function registerNight() {
  if (done) return; done = true;
  const E = STYLES['oldkingdom-giza'].elements;
  E.giza_halo = haloEl; E.giza_stand = stand; E.giza_hearth = hearth;
}
