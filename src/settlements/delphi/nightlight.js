// Delphi about 400 BC by night — what lit the sanctuary and the village, and the light it throws (docs/settlements/delphi.md §15.2).
// What burned at Delphi: the fire of pine on the hearth of Apollo in the temple, which was never let go out [stated: Plutarch, Moralia 385c, "On the E
// at Delphi" (the fire is of the god's hearth); Wikipedia "Temple of Apollo (Delphi)" and "Pythia": the altar with the pine-wood fire where bay leaves
// and barley meal were burned]; the clay oil lamps (lychnoi) of olive oil on their stands, in the cella and the treasuries [stated: Pindar's iron chair
// and the hearth, Pausanias 10.24.5; the lamp is the lamp of Greek life, inferred]; the pitch-pine torch in its stand or in the hand [inferred; Sophocles,
// Antigone 1126–1130 has the torch-smoke of the Bacchants on Parnassus above the Castalian spring, recalled from memory, unchecked]; the braziers of the
// forecourt and the terrace; and in each house the hearth of the kitchen and one lamp. Shops put up their shutters at dusk; a few stay lit.
// Everything here is geometry in one material, `halo` (palette.js, materials.js 'halo'): light ADDED over what is behind it, at night only, with no light,
// no shadow and no collision, so the day view is unchanged and the real pools (off at the low preset) are not needed. The shape of each piece is carried
// by its normals (y: 1 at a disc's middle, 0 at its rim): a glow round each flame (three crossed discs), a pool on the floor, a pane before a lit opening.
// Each light is a function of its own place: no counters, no Math.random. The method is the Suzhou reference's, written for Delphi; nothing of Suzhou's
// is imported. Wraps the delphi style's elements from here (the style files stay as they were).

import '../../styles/delphi/index.js';
import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';
import { lathe, rod } from '../../core/geom.js';
import { STYLES } from '../../core/build.js';
import { frame } from '../../styles/greek/agora.js';
import { houseDoors } from '../../styles/delphi/house.js';

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
  /** A flat sheet (a lit opening) of brightness f, facing n = [x, z]. */
  quad(a, b, c, d, n, f) { const q = Math.sqrt(1 - f * f), N = [n[0] * q, f, n[1] * q]; this.tri(a, N, b, N, c, N); this.tri(a, N, c, N, d, N); }
  flush(bag) {
    if (!this.pos.length) return;
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute(this.pos, 3)); g.setAttribute('normal', new Float32BufferAttribute(this.nor, 3));
    bag.add(MAT, g); this.pos = []; this.nor = [];
  }
}

/** The halo of one light (`{ at, distance, intensity }`); `floor` the height of the floor or ground it stands over, if known. */
export function lightHalo(H, l, floor) {
  const [x, y, z] = l.at, d = l.distance ?? 6, k = Math.min(1, (l.intensity ?? 2) / 2.4);
  H.ball(x, y, z, Math.max(0.42, Math.min(0.95, d * 0.11)) * (0.8 + 0.2 * k));
  if (floor !== undefined && y - floor < 3.0 && y - floor > 0.2) H.floor(x, floor + 0.03, z, Math.max(1.3, Math.min(3.4, d * 0.42)), Math.max(1.3, Math.min(3.4, d * 0.42)), 10, 0.8);
}

/** The lights some elements give that the style does not push as lights (their flames are a material only): [(el) → [{ at, distance, intensity, color }]]. */
const EXTRA = {
  brazier: (el) => [{ at: [el.at[0], (el.y ?? 0) + 1.3, el.at[1]], color: '#ff9a48', intensity: 2.2, distance: 7 }],
  hearth: (el) => [{ at: [el.c[0], (el.y ?? 0) + 1.5, el.c[1]], color: '#ffa050', intensity: 3.2, distance: 11 }],
  adyton: (el) => [{ at: [el.c[0] + 2.0, (el.y ?? 0) + 1.3, el.c[1] + 3.4], color: '#ff9a48', intensity: 2.4, distance: 8 }],
};

let depth = 0;
/** Wrap one element builder: the halo of every light it adds (and of the extra lights above), and for a walk-in house the lit shop opening and the spill of the street door. */
const wrap = (name, fn) => function haloed(el, ctx) {
  const lights = ctx?.lights, n = lights ? lights.length : 0;
  if (depth > 0 || !lights || el.simple) { depth++; try { return fn.call(this, el, ctx); } finally { depth--; } }
  depth++;
  try { var r = fn.call(this, el, ctx); } finally { depth--; }
  const H = new Halo(), house = name === 'delphi_house', floor = house ? el.y ?? 0 : el.y ?? undefined;
  for (const l of lights.slice(n)) lightHalo(H, l, floor);
  if (EXTRA[name]) for (const l of EXTRA[name](el)) { lights.push(l); lightHalo(H, l, el.y); }
  if (house) {
    const F = frame(el.rect, 's'), D = houseDoors(el.rect, el.seed || 1), y = el.y ?? 0;
    // the street door ajar: the lamp of the passage spilling over the step into the lane
    const [px, pz] = F.P(D.du, -1.1);
    H.floor(px, y + 0.06, pz, 2.0, 1.5, 8, 0.6);
    // the shop kept open into the evening: a lit sheet in the opening, and the spill on the lane before it
    const mx = F.P((D.so[0] + D.so[1]) / 2, 0)[0], mz = F.P(0, 0)[1];
    if (hashAt(mx, mz, 11) < 0.45) {
      const a = F.P(D.so[0] + 0.1, -0.07), b = F.P(D.so[1] - 0.1, -0.07), f = 0.5 + 0.3 * hashAt(mx, mz, 12);
      H.quad([a[0], y + 1.0, a[1]], [b[0], y + 1.0, b[1]], [b[0], y + 2.05, b[1]], [a[0], y + 2.05, a[1]], [0, 1], f);
      const [sx, sz] = F.P((D.so[0] + D.so[1]) / 2, -1.2); H.floor(sx, y + 0.06, sz, 2.0, 1.3, 8, 0.7);
    }
  }
  H.flush(ctx.bag);
  return r;
};

/** dl_halo: { at: [x, y, z], distance?, intensity?, floor? } — the halo of a light the plan makes some other way (the generic `lamp` element). `box`, never `rect`. */
function haloEl({ at, distance, intensity, floor }, { bag }) {
  const H = new Halo(); lightHalo(H, { at, distance, intensity }, floor); H.flush(bag);
}

/**
 * dl_torch: { at: [x, z], y, h? } — a pitch-pine torch in an iron stand (a pole, a ring and the bundle of pine splints burning; the torch of the festival and
 * the road at night [inferred]): the glow and its pool on the ground, a real light.
 */
function torch({ at, y = 0, h = 1.75 }, { bag, col, lights }) {
  const [x, z] = at, q = hashAt(x, z, 5), s = h / 1.75 * (0.95 + 0.1 * q), H = new Halo();
  bag.add('iron', rod([x, y, z], [x, y + 1.5 * s, z], 0.028, 6));
  bag.add('iron', lathe([[0.001, 0], [0.16, 0], [0.16, 0.04], [0.04, 0.09], [0.001, 0.09]], 8, null, x, y, z));
  bag.add('iron', lathe([[0.1, 0], [0.15, 0.12], [0.13, 0.13], [0.09, 0.03], [0.001, 0.02]], 8, null, x, y + 1.4 * s, z));
  bag.add('flame', lathe([[0.001, 0], [0.09, 0.02], [0.05, 0.2 + 0.08 * q], [0.001, 0.34 + 0.1 * q]], 6, null, x, y + 1.52 * s, z));
  col.circle(x, z, 0.16, y, y + 1.6 * s);
  const l = { at: [x, y + 1.85 * s, z], color: '#ffa04a', intensity: 3.0, distance: 9 };
  lights.push(l); lightHalo(H, l, y); H.flush(bag);
}

/** The halo elements for the generic `lamp` elements of a list (the cella's lamps and the others: build.js GENERIC makes the light, the style cannot wrap it). */
export function lampHalos(list) {
  return list.filter((e) => e.t === 'lamp').map((e) => ({ t: 'dl_halo', at: e.at, distance: e.distance, intensity: e.intensity, floor: e.stand }));
}

let done = false;
/** Wraps the delphi style's elements that make lights (once, after the style has registered everything). */
export function registerNight() {
  if (done) return; done = true;
  const E = STYLES.delphi.elements;
  for (const k in E) if (typeof E[k] === 'function' && k !== 'ribbon') E[k] = wrap(k, E[k]);
  E.dl_halo = haloEl; E.dl_torch = torch;
}
registerNight();
