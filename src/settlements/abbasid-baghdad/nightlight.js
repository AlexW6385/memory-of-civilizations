// Abbasid Baghdad by night: the light the lamps, braziers and open doors throw (docs/settlements/abbasid-baghdad.md §18).
// The glass lamps and the embers of the style's own pieces glow by their materials (lamp_glass, lamp_white, flame: lit from within from dusk,
// present and unlit by day); what they lack, where the lamps' pool of real lights is off (the low preset), is the light they give the things round
// them. Here it is made of geometry in one material, `halo` (palette.js, materials.js 'halo'): light ADDED over what is behind it, at night only,
// with no light, no shadow and no collision. The shape of each piece is carried by its normals (materials.js): a glow round each flame (three
// crossed discs), a pool of light on the paving, a wash on the wall behind. The pattern is Suzhou's nightlight.js (the Halo class is copied: it
// holds no Suzhou data); the places and kinds are Baghdad's. The pieces are `bag_halo` elements of the street life, instanced.
// Everything is a function of the lamp's own place: no counters, no Math.random.

import { BufferGeometry, Float32BufferAttribute, Matrix4, Quaternion, Vector3 } from '../../core/three.js';
import { box, lathe } from '../../core/geom.js';
import { STYLES } from '../../core/build.js';
import { assembly } from '../../objects/kit.js';
import { C, RC, ESPLANADE, ALL_SUQS, lots } from './layout.js';
import { doorOf } from './fronts.js';
import { houseToWorld } from './town.js';

/** A number in [0, 1) from a position alone. */
export function hashAt(x, z, s = 0) {
  let h = (Math.round(x * 16) * 73856093) ^ (Math.round(z * 16) * 19349663) ^ Math.imul(s + 1, 83492791);
  h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
const TAU = Math.PI * 2;
const MAT = 'halo';
/** Triangles (position and a normal per corner) of the halo material. */
export class Halo {
  constructor() { this.pos = []; this.nor = []; }
  tri(p0, n0, p1, n1, p2, n2) { this.pos.push(...p0, ...p1, ...p2); this.nor.push(...n0, ...n1, ...n2); }
  /** A flat disc at c spanned by the unit axes U and V, semi-axes su, sv, in rings R (fractions of the radius) of brightness F (carried by the normals' y). */
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
  /** A pool of light on a horizontal plane (paving, floor) at height y. */
  floor(x, y, z, r, rz = r, yaw = 0, segs = 8, k = 1) {
    const s = Math.sin(yaw), c = Math.cos(yaw);
    this.disc([x, y, z], [c, 0, -s], [s, 0, c], r, rz, null, segs, [k, 0.42 * k, 0], [0, 0.5, 1]);
  }
  /** A wash on a wall at (x, y, z), the wall's outward normal nh = [x, z]; rw wide and rh high (semi-axes). */
  wall(x, y, z, nh, rw, rh, segs = 8, k = 1) {
    this.disc([x, y, z], [-nh[1], 0, nh[0]], [0, 1, 0], rw, rh, nh, segs, [0.9 * k, 0], [0, 1]);
  }
  /** The glow round a flame at (x, y, z), radius r: three upright discs crossed at 60°. */
  ball(x, y, z, r) {
    for (let k = 0; k < 3; k++) { const a = k * Math.PI / 3, c = Math.cos(a), s = Math.sin(a); this.disc([x, y, z], [c, 0, s], [0, 1, 0], r, r, [-s, c], 8, [0.62, 0], [0, 1]); }
  }
  geometry() {
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute(this.pos, 3));
    g.setAttribute('normal', new Float32BufferAttribute(this.nor, 3));
    return g;
  }
}
/** The light of one lamp into `H`: at (x, z), `cy` the height of the flame, `gy` the ground below it, `s` its size; a wall behind (n outward, d metres behind). */
export function lampLight(H, x, z, cy, gy, s, wall = null, pool = 2.6) {
  H.ball(x, cy, z, 0.95 * s);
  H.floor(x, gy + 0.03, z, pool * s * 0.55, pool * s * 0.55, 0, 8, 0.8);
  if (wall) H.wall(x - wall.n[0] * wall.d, cy, z - wall.n[1] * wall.d, wall.n, 1.25 * s, 1.0 * s, 8, 0.6);
}

// ── the kinds (one element of the street life each; the unit's origin is the lamp's foot, +z toward the street) ──
const KINDS = {
  bay: { cy: 2.15, s: 0.85, z: 0, wall: 0.55, pool: 2.7 },       // the oil lamp on the bracket by a bay's pier (market.js frontDress: 0.5 m out, 2.03–2.25 high)
  post: { cy: 2.3, s: 0.9, z: 0.42, wall: 0.45, pool: 3.0 },     // the oil lamp on a post by a door (objects lantern 'oil', its flame 0.42 out, h + 0.02)
  door: {},                                                       // the light of a lamp in a house's entrance passage, spilling over the doorstep
  spill: {},                                                      // the lamp-light of an open shop front across the street
  brazier: {},                                                    // a coal brazier at a gate, with its glowing embers and its geometry
};
function unitOf(kind) {
  return assembly(`baghdad-halo|${kind}`, (a) => {
    const H = new Halo(), K = KINDS[kind];
    if (kind === 'brazier') {
      // a clay brazier on a tripod of timber, embers glowing in it: its own geometry (terracotta, timber, lamp_white as the embers), the glow and a pool of red light
      a('terracotta', lathe([[0.001, 0.62], [0.26, 0.62], [0.34, 0.8], [0.36, 0.84], [0.3, 0.84], [0.22, 0.7], [0.001, 0.7]], 10));
      a('lamp_white', lathe([[0.001, 0.82], [0.31, 0.82], [0.001, 0.86]], 10));
      for (let i = 0; i < 3; i++) { const t = i * 2.094 + 0.4, x = Math.cos(t) * 0.2, z = Math.sin(t) * 0.2; a('timber', box(x - 0.03, 0, z - 0.03, x + 0.03, 0.66, z + 0.03)); }
      H.ball(0, 0.95, 0, 1.0); H.floor(0, 0.05, 0, 1.9);
    } else if (kind === 'door') { H.floor(0, 0.06, 1.4, 1.3, 1.9); H.ball(0, 1.2, 0.1, 0.9); }
    else if (kind === 'spill') H.floor(0, 0.06, 1.6, 2.6, 2.0, 0, 10);
    else lampLight(H, 0, K.z, K.cy, 0.05, K.s, K.wall ? { n: [0, 1], d: K.wall } : null, K.pool / K.s);
    a(MAT, H.geometry());
  });
}
/** bag_halo: { at, y (the ground), rot (+z out), kind } — instanced like the lamps themselves; within 60 m of the eye (farther off a lamp is a point its own glass already gives). */
function bagHalo(el, { bag, col }) {
  const U = unitOf(el.kind), [x, z] = el.at;
  const M = new Matrix4().compose(new Vector3(x, el.y ?? 0, z), new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), el.rot ?? 0), new Vector3(1, 1, 1));
  if (el.kind === 'brazier') col?.circle(x, z, 0.4, el.y ?? 0, (el.y ?? 0) + 0.9);
  for (const [mat, g] of Object.entries(U)) { if (bag.addInstance) bag.addInstance(mat, g.clone(), M, { reach: 60 }); else bag.add(mat, g.clone().applyMatrix4(M)); }
}
/** The lit doors of the houses: a lamp in the entrance passage spilling over the doorstep, one house in five (by the lot's own seed), the door as fronts.js puts it. */
export function doorGlows() {
  const out = [], YAW = { s: 0, n: Math.PI, e: Math.PI / 2, w: -Math.PI / 2 };
  for (const l of lots()) {
    if (l.plot < 0 || hashAt(l.rect[0], l.rect[1], 17) > 0.2) continue;
    const { ox, hd } = doorOf(l);
    out.push({ t: 'bag_halo', kind: 'door', at: houseToWorld(l, ox, hd + 0.2), y: 0, rot: YAW[l.face] });
  }
  return out;
}
export function registerNight() { if (STYLES.life) STYLES.life.elements.bag_halo = bagHalo; }
registerNight();

// ── where the lights are ─────────────────────────────────────────────────────────────────────────
/** The lit bays of the suq rows: market.js gives an oil lamp to every second bay of each side (k even), at its pier's near edge, 0.5 m out into the street. */
export function bayLamps() {
  const out = [];
  for (const s of ALL_SUQS) {
    const horiz = s.rect[2] - s.rect[0] > s.rect[3] - s.rect[1], L = horiz ? s.rect[2] - s.rect[0] : s.rect[3] - s.rect[1], cx = (s.rect[0] + s.rect[2]) / 2, cz = (s.rect[1] + s.rect[3]) / 2;
    const nb = Math.max(1, Math.floor((L - 4) / 3.2)), bw = (L - 4) / nb, S = 6;
    for (const sd of [-1, 1]) for (let k = 0; k < nb; k += 2) {
      const u = -L / 2 + 2 + k * bw + 0.2, v = sd * (S / 2 - 0.5);
      // (the lamp stands 0.5 m out from the front line, into the street; the street's direction from the bay is −sd along the local z)
      const at = horiz ? [cx + u, cz + v] : [cx + v, cz - u], dir = horiz ? [0, -sd] : [-sd, 0];
      out.push({ t: 'bag_halo', kind: 'bay', at, y: 0, rot: Math.atan2(dir[0], dir[1]) });
    }
  }
  return out;
}
/** The halos for a plan's street elements (the life plan's): a post lamp for each oil lantern, a few lit doors, the lit fronts of the esplanade's rooms. */
export function streetHalos(elements) {
  const out = [];
  for (const e of elements) {
    if (!e.at) continue;
    if (e.t === 'lantern' && e.kind === 'oil') out.push({ t: 'bag_halo', kind: 'post', at: e.at, y: e.y ?? 0, rot: e.rot ?? 0 });
  }
  return out;
}
/** The open fronts of the south gate road's twelve rooms: the lamp-light across the street, by the hash of each room's place (two in three stay lit). */
export function roomSpills() {
  const out = [];
  for (const b of ESPLANADE) {
    const [x0, z0, x1, z1] = b.rect, zc = (z0 + z1) / 2;
    if (hashAt(x0, z0, 5) > 0.67) continue;
    const e = b.face === 'e';
    out.push({ t: 'bag_halo', kind: 'spill', at: [e ? x1 + 0.2 : x0 - 0.2, zc], y: 0, rot: e ? Math.PI / 2 : -Math.PI / 2 });
  }
  return out;
}
/** Braziers at the Golden Gate's outer face and at the four gates of the main wall, either side of the portal, clear of the guards. */
export function gateBraziers() {
  const out = [], put = (x, z, rot) => out.push({ t: 'bag_halo', kind: 'brazier', at: [x, z], y: 0, rot });
  for (const sx of [-1, 1]) put(C[0] + sx * 7.5, C[1] + 41.5, 0);
  for (const f of RC.gates) {
    const a = f * Math.PI / 180, r = RC.main + 11, t = [-Math.sin(a), Math.cos(a)];
    for (const s of [-1, 1]) put(C[0] + Math.cos(a) * r + t[0] * s * 7.5, C[1] + Math.sin(a) * r + t[1] * s * 7.5, Math.atan2(Math.cos(a), Math.sin(a)));
  }
  return out;
}
/** Braziers of the camp before the Golden Gate (the visitor's own ground, docs §20): the petitioners' fire, the caravan's, the letter-writer's, and two by the water-sellers' stalls. */
export function campBraziers() {
  const gx = C[0], gz = C[1] + 36;
  return [[-8, 34], [8, 34], [-21, 10.5], [12.5, 10], [-6.5, 11.5], [0, 20.5]].map(([dx, dz]) => ({ t: 'bag_halo', kind: 'brazier', at: [gx + dx, gz + dz], y: 0, rot: 0 }));
}
