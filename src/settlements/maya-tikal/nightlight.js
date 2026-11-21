// Tikal c. 750 by night — what lit the Great Plaza and the town, and the light it throws (docs/settlements/maya-tikal.md §17).
// What lit a Classic Maya night: torches of pitch-pine (ocote, resinous pine splinters bound in bundles) and small clay lamps/bowls burning pitch or fat, the hearth of every
// house (a three-stone fire never wholly out), and copal (pom) burning in tripod censers before the temples and shrines at the rites [inferred: the dossier §17; no lamp
// of oil or wax is known for the Classic lowlands]. Windows: none (the houses and vaulted rooms have only their doors), so the lit places show as lit doorways.
// Everything is geometry in one material, `halo` (palette.js): light ADDED over what is behind it, at night only, no light, no shadow, no collision, so the day view is
// unchanged and the effect shows at the low preset. The method is that of the Suzhou reference (and Knossos' copy of it): each flame has three crossed discs, each lit room a
// pool on its floor and a pane in its doorway. Every light is a function of its own place; no counters, no Math.random. Nothing of another settlement is imported.

import '../../styles/tikal/index.js';
import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';
import { lathe } from '../../core/geom.js';
import { STYLES } from '../../core/build.js';
import { hashAt, houseFrame, frame, rangeRooms, PLATFORM } from './walk.js';

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


/** The halo of one light of a plan (`lights` entries: { at, distance, intensity }); `floor` the height of the floor it stands over. */
function lightHalo(H, l, floor) {
  const [x, y, z] = l.at, d = l.distance ?? 6, k = Math.min(1, (l.intensity ?? 2) / 2.4);
  H.ball(x, y, z, Math.max(0.42, Math.min(0.95, d * 0.11)) * (0.8 + 0.2 * k));
  if (floor !== undefined && y - floor < 3.0 && y - floor > 0.2) H.floor(x, floor + 0.06, z, Math.max(1.3, Math.min(2.6, d * 0.4)), Math.max(1.3, Math.min(2.6, d * 0.4)), 10, 0.8);
}
/** A lit doorway: a pane in the door's plane (u = -0.012 outside the wall's face), width 2 hw, from y0 to y1, brightness f; the pool of light on the floor outside it. */
function litDoor(H, F, v, y0, y1, hw, f, pool = true, poolY = y0) {
  const n = [-F.U[0], -F.U[1]], a = F.P(-0.04, v - hw), b = F.P(-0.04, v + hw);
  H.quad([a[0], y0, a[1]], [b[0], y0, b[1]], [b[0], y1, b[1]], [a[0], y1, a[1]], n, f);
  if (pool) { const p = F.P(-1.0, v); H.floor(p[0], poolY + 0.06, p[1], 1.9, 1.5, 9, 0.62 * (f / 0.5)); }
}

let depth = 0;
/** Wrap one element builder: the halo of every light it adds, plus what its kind adds (the lit doorways, the torches before a shrine, the censers' glow). */
const wrap = (name, fn) => function haloed(el, ctx) {
  const lights = ctx?.lights, n = lights ? lights.length : 0;
  if (depth > 0 || !lights || el.simple) { depth++; try { return fn.call(this, el, ctx); } finally { depth--; } }
  depth++;
  try { var r = fn.call(this, el, ctx); } finally { depth--; }
  const H = new Halo(), y = el.y ?? 0;
  if (name === 'k_range') {
    for (const l of lights.slice(n)) lightHalo(H, l, y);
    if (el.furn && el.lit !== false) for (const room of rangeRooms(el)) litDoor(H, room.F, room.vc, y + 0.1, y + 2.3, 0.62, 0.34 + 0.3 * hashAt(room.vc, el.c[0], 2), true, y);
  } else if (name === 'k_house') {
    for (const l of lights.slice(n)) lightHalo(H, l, PLATFORM);
    { const { F } = houseFrame(el); litDoor(H, F, 0, PLATFORM + 0.05, PLATFORM + 2.05, 0.75, el.kitchen ? 0.62 : 0.4, !el.lite, PLATFORM); }   // beyond 150 m too, a pane without its pool
  } else if (name === 'k_brazier') {
    const [x, z] = el.at, k = el.r ?? 1;
    H.ball(x, y + 0.98 * k, z, 0.8 * k, 0.7); H.floor(x, y + 0.07, z, 2.1 * k, 2.1 * k, 10, 0.75);
  } else if (name === 'k_eshrine' && Math.hypot(el.at[0], el.at[1]) < 150) {
    const [sx, sz] = el.at, F = frame('w', sx - 2.3, sz), c = F.P(1.0, -0.8);   // the lineage shrine: the censer's coals seen through its door
    litDoor(H, F, 0, 1.4, 3.3, 0.6, 0.3, false); H.ball(c[0], 2.2, c[1], 0.55, 0.5);
  } else if (name === 'k_pyramid' && el.shrine) {
    const dir = { w: [1, 0], e: [-1, 0], n: [0, 1], s: [0, -1] }[el.face], Y = (el.y0 ?? 0) + el.H, [cx, cz] = el.c;
    const sc = el.shrine.c ?? (dir[0] ? [cx - dir[0] * (el.top[0] - 1.8), cz] : [cx, cz - dir[1] * (el.top[1] - 1.8)]), F = frame(el.face, ...sc);
    litDoor(H, F, 0, Y + 0.1, Y + 2.4, 0.7, 0.55, true, Y);                                         // the first chamber's lamp, seen through the door
    for (const v of [-2.2, 2.2]) { const p = F.P(-1.3, v); H.ball(p[0], Y + 1.75, p[1], 0.85, 0.75); H.floor(p[0], Y + 0.07, p[1], 2.3, 2.3, 10, 0.7); }   // the torches either side of it
  }
  H.flush(ctx.bag);
  return r;
};

/**
 * mt_torch: { at: [x, z], y } — a post of timber with a bundle of pitch-pine splinters bound at its top, burning (the torches that stood at stairs and doors; the "pitch pine" of
 * §17). The post is 1.9 m; the flame, its glow and the pool on the ground.
 */
function torch({ at, y = 0 }, { bag, col }) {
  const [x, z] = at, H = new Halo(), q = hashAt(x, z, 5);
  bag.add('timber', lathe([[0.001, 0], [0.045, 0], [0.045, 1.75], [0.085, 1.82], [0.07, 1.98], [0.001, 2.0]], 7, null, x, y, z));   // the post and the bundle of splinters bound at its top, one piece
  bag.add('flame', lathe([[0.001, 0], [0.05 * (0.8 + 0.4 * q), 0.05], [0.03, 0.16], [0.001, 0.26 + 0.08 * q]], 6, null, x, y + 1.98, z));
  col.circle(x, z, 0.14, y, y + 2.0);
  H.ball(x, y + 2.18, z, 0.9, 0.78); H.floor(x, y + 0.07, z, 2.4, 2.4, 10, 0.72);
  H.flush(bag);
}

let done = false;
/** Wraps the tikal style's elements that make lights (once, after the style has registered). */
export function registerNight() {
  if (done) return; done = true;
  const E = STYLES.tikal.elements;
  for (const k of ['k_range', 'k_house', 'k_brazier', 'k_pyramid', 'k_eshrine']) E[k] = wrap(k, E[k]);
  E.mt_torch = torch;
}
registerNight();
