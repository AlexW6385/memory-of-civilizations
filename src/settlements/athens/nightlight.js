// Athens by night, the light of its fires and lamps (docs/settlements/athens.md §19).
// The flames of the plans' lights are small cones; what they lack, where the real lights are off (the low preset),
// is the light they give to what is round them. It is made of geometry in the one material `halo` (palette.js,
// materials.js 'halo'): light ADDED over what is behind it, at night only, with no light, no shadow and no
// collision. The shape of each piece is carried by its normals: a glow round the flame (three crossed discs) and a
// pool of light on the floor under it. Every element of the greek style that puts a light into its plan is wrapped
// here, so the hearths of the houses, the forge, the kilns and the lamps of the rooms gain their halo without
// touching the style files; the few new fires (the lamp of the Erechtheion, the torches of the Academy's altar,
// the Tholos' door) are `athens_flame` elements. Everything is a function of the light's own place.

import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';
import { STYLES } from '../../core/build.js';
import { lathe, rod } from '../../core/geom.js';
import { ACRO } from './layout.js';
import { ALTAR_PROMETHEUS } from './quarters.js';

const TAU = Math.PI * 2;
const MAT = 'halo';

/** Triangles (position and a normal per corner) of the halo material; the same construction as Suzhou's (its own file is not imported). */
export class Halo {
  constructor() { this.pos = []; this.nor = []; }
  tri(p0, n0, p1, n1, p2, n2) { this.pos.push(...p0, ...p1, ...p2); this.nor.push(...n0, ...n1, ...n2); }
  /** A flat disc at c spanned by the unit axes U and V (semi-axes su, sv), in rings R of brightness F; the vertex normals carry the brightness in their y. */
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
  /** A disc lying on the floor at height y. */
  floor(x, y, z, r, segs = 8) { this.disc([x, y, z], [1, 0, 0], [0, 0, 1], r, r, null, segs, [1, 0.42, 0], [0, 0.5, 1]); }
  /** The glow round a flame at (x, y, z), radius r: three upright discs crossed at 60 degrees, each a cone of light from its middle. */
  ball(x, y, z, r) {
    for (let k = 0; k < 3; k++) { const a = k * Math.PI / 3, c = Math.cos(a), s = Math.sin(a); this.disc([x, y, z], [c, 0, s], [0, 1, 0], r, r, [-s, c], 8, [0.62, 0], [0, 1]); }
  }
  /** Into the bag, one geometry. */
  flush(bag) {
    if (!this.pos.length) return;
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute(this.pos, 3));
    g.setAttribute('normal', new Float32BufferAttribute(this.nor, 3));
    bag.add(MAT, g);
    this.pos = []; this.nor = [];
  }
}

/** The halo of one light of a plan (`lights` entries: { at, distance, intensity }) over the ground `g` (the element's floor, if it has one). */
function lightHalo(H, l, g) {
  const [x, y, z] = l.at, d = l.distance ?? 6, k = Math.min(1, (l.intensity ?? 2) / 2.4);
  H.ball(x, y, z, Math.max(0.42, Math.min(0.95, d * 0.11)) * (0.8 + 0.2 * k));
  const fy = Math.min(g ?? y - 0.5, y - 0.2);
  if (y - fy < 3) H.floor(x, fy + 0.03, z, Math.max(1.3, Math.min(3.4, d * 0.42)), 10);
}

let depth = 0;
const wrap = (fn) => function haloed(el, ctx) {
  const mine = /^athens/.test(ctx?.plan?.id ?? ''), lights = mine ? ctx.lights : null, n = lights ? lights.length : 0;       // (the style's table is shared: only Athens' plans gain a halo)
  depth++;
  try { var r = fn.call(this, el, ctx); } finally { depth--; }
  if (depth === 0 && lights && lights.length > n) {
    const H = new Halo();
    for (const l of lights.slice(n)) lightHalo(H, l, el.y);
    H.flush(ctx.bag);
  }
  return r;
};

/**
 * athens_flame: { at: [x, y, z], r?, intensity?, distance?, floor? } — a fire or a lamp that is already modelled (a bronze stand, an iron torch, a hearth
 * with no flame of its own): the light and its halo, no body. `floor` is the ground's height under it.
 */
function flame(el, { lights, bag }) {
  const [x, y, z] = el.at, l = { at: [x, y, z], color: el.color ?? '#ffb46b', intensity: el.intensity ?? 3, distance: el.distance ?? 8 };
  lights.push(l);
  const H = new Halo(); lightHalo(H, l, el.floor); H.flush(bag);
}

/** athens_brazier: { at: [x, z], y } — an iron bowl on three legs, charcoal glowing in it: the fire kept at a door at night (the light and its halo with it). */
function brazier(el, { lights, bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, k = Math.floor(((Math.sin(x * 12.9898 + z * 78.233) * 43758.5453) % 1 + 1) % 1 * 3), top = y + 0.82 + 0.04 * k;
  for (let i = 0; i < 3; i++) { const a = i * TAU / 3 + 0.4 + 0.3 * k; bag.add('iron', rod([x + Math.cos(a) * 0.3, y, z + Math.sin(a) * 0.3], [x + Math.cos(a) * 0.15, top - 0.14, z + Math.sin(a) * 0.15], 0.018, 5)); }
  bag.add('iron', lathe([[0.001, 0], [0.15, 0.0], [0.27, 0.12], [0.29, 0.14], [0.25, 0.14], [0.14, 0.03], [0.001, 0.03]], 10, null, x, top - 0.14, z));
  bag.add('lacquer_black', lathe([[0.001, 0.1], [0.23, 0.1], [0.2, 0.15], [0.001, 0.17]], 8, null, x, top - 0.14, z));
  col.circle(x, z, 0.3, y, top);
  const l = { at: [x, top + 0.12, z], color: '#ff9a4a', intensity: 3, distance: 8 };
  lights.push(l);
  const H = new Halo(); lightHalo(H, l, y); H.flush(bag);
}

/**
 * The few fires of the night that no style element makes (docs §19): the braziers either side of the Tholos' door, where the prytaneis of the day kept
 * their watch [inferred]; Kallimachos' golden lamp before Athena Polias in the Erechtheion's cella [stated, Pausanias 1.26.6]; the torches either side of
 * the altar of Prometheus in the Academy, lit for the night race's end [stated, the race; inferred, that they burn at night].
 */
export function fires() {
  const T = ACRO.top, [ax, az] = ALTAR_PROMETHEUS;
  return [
    { t: 'athens_brazier', at: [-268.2, -136.4], y: 0 }, { t: 'athens_brazier', at: [-268.2, -129.6], y: 0 },
    { t: 'athens_flame', at: [38.64, T + 0.9 + 1.68, -44.05], floor: T + 0.9, intensity: 2.4, distance: 7 },
    ...[-2.8, 2.8].map((o) => ({ t: 'athens_flame', at: [ax + o, 2.34, az], floor: 0, intensity: 2.6, distance: 8 })),
  ];
}

let done = false;
/** Wraps the greek style's elements that make lights (once, after every file of the settlement has registered its own). */
export function registerNight() {
  if (done) return; done = true;
  const E = STYLES.greek.elements;
  for (const k of Object.keys(E)) if (typeof E[k] === 'function' && k !== 'athens_flame' && k !== 'athens_brazier') E[k] = wrap(E[k]);
  E.athens_flame = flame; E.athens_brazier = brazier;
}
