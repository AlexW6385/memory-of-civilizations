// A Dogon village, c. 1930, by night (docs/settlements/dogon.md §16.2). What lit it: the hearth fires of the ginnas and the kitchens (millet-stalk and wood
// fires on three stones), the smith's charcoal furnace at the edge, a small fire at the foot of each watchmen's platform in the ripe millet, the glow of
// the fires through the open doors and the kitchens' roof hatches; no lamp, no street light. [inferred: the sources read give the houses and their
// hearths but not the village at night; the forms are those of an unelectrified Sahel village.]
// All of it is geometry in the one additive `halo` material (palette.js): light ADDED over what is behind, at night only, no light, no shadow, no
// collision, so the day view is unchanged and it reads at the low preset. Each light is a function of its own place (no counters, no Math.random).
// The method is that of the Suzhou reference; nothing of Suzhou's is imported.
import '../../styles/dogon/index.js';
import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';
import { STYLES } from '../../core/build.js';
import { houseOf } from '../../styles/dogon/compound.js';
import { hv } from './furniture.js';
import { lathe, rod } from '../../core/geom.js';

const TAU = Math.PI * 2, MAT = 'halo';
export class Halo {
  constructor() { this.pos = []; this.nor = []; }
  tri(p0, n0, p1, n1, p2, n2) { this.pos.push(...p0, ...p1, ...p2); this.nor.push(...n0, ...n1, ...n2); }
  disc(c, U, V, su, sv, nh = null, segs = 8, F = [1, 0.42, 0], R = [0, 0.5, 1]) {
    const at = (r, k) => { const a = k / segs * TAU, u = Math.cos(a) * su * R[r], v = Math.sin(a) * sv * R[r]; return [c[0] + U[0] * u + V[0] * v, c[1] + U[1] * u + V[1] * v, c[2] + U[2] * u + V[2] * v]; };
    const nm = (r, k) => { const a = k / segs * TAU, f = F[r], q = Math.sqrt(1 - f * f); return nh ? [nh[0] * q, f, nh[1] * q] : [Math.cos(a) * q, f, Math.sin(a) * q]; };
    const n = R.length - 1;
    for (let k = 0; k < segs; k++) {
      this.tri(at(0, k), nm(0, k), at(1, k), nm(1, k), at(1, k + 1), nm(1, k + 1));
      for (let r = 1; r < n; r++) { this.tri(at(r, k), nm(r, k), at(r + 1, k), nm(r + 1, k), at(r + 1, k + 1), nm(r + 1, k + 1)); this.tri(at(r, k), nm(r, k), at(r + 1, k + 1), nm(r + 1, k + 1), at(r, k + 1), nm(r, k + 1)); }
    }
  }
  floor(x, y, z, r, rz = r, segs = 8, k = 1) { this.disc([x, y, z], [1, 0, 0], [0, 0, 1], r, rz, null, segs, [k, 0.42 * k, 0]); }
  ball(x, y, z, r, k = 0.62) { for (let i = 0; i < 3; i++) { const a = i * Math.PI / 3 + 0.37, c = Math.cos(a), s = Math.sin(a); this.disc([x, y, z], [c, 0, s], [0, 1, 0], r, r, [-s, c], 14, [k, 0], [0, 1]); } }
  quad(a, b, c, d, n, f) { const q = Math.sqrt(1 - f * f), N = [n[0] * q, f, n[1] * q]; this.tri(a, N, b, N, c, N); this.tri(a, N, c, N, d, N); }
  flush(bag) {
    if (!this.pos.length) return;
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute(this.pos, 3)); g.setAttribute('normal', new Float32BufferAttribute(this.nor, 3));
    bag.add(MAT, g); this.pos = []; this.nor = [];
  }
}
function lightHalo(H, l, floor) {
  const [x, y, z] = l.at, d = l.distance ?? 6, k = Math.min(1, (l.intensity ?? 2) / 2.4);
  H.ball(x, y, z, Math.max(0.42, Math.min(0.95, d * 0.11)) * (0.8 + 0.2 * k));
  if (floor !== undefined && y - floor < 3.0 && y - floor > 0.2) H.floor(x, floor + 0.03, z, Math.max(1.3, Math.min(3.4, d * 0.42)), Math.max(1.3, Math.min(3.4, d * 0.42)), 10, 0.8);
}

/** An opened ginna (landmark or lite): the halo of each of its lights (hearth, hall, store, kitchen), the glow in the kitchen's roof hatch, the fire's light spilling over the step from the open doors. */
const ginna = (fn) => function haloed(el, ctx) {
  const lights = ctx?.lights, n = lights ? lights.length : 0;
  const r = fn.call(this, el, ctx);
  if (!lights) return r;
  const H = new Halo(), h = houseOf({ rect: el.rect, hw: el.hw ?? true }), [hx0, , hx1, hz1] = h.rect, y = el.y, F = y + 0.05;
  for (const l of lights.slice(n)) lightHalo(H, l, F);
  for (const [k, u] of [1.5, 4.9].entries()) {
    const dx = hx0 + 0.45 + u;
    if (hv(dx, hz1, 11 + k) < 0.7) H.floor(dx, y + 0.07, hz1 + 1.0, 1.7, 1.4, 8, 0.55 + 0.2 * hv(dx, hz1, 5));      // the fire's light over the step, from a door ajar
  }
  const kx = hx0 + 0.45 + 5.45, kz = hz1 - 5.4 - 1.55;
  H.ball(kx, y + 3.0, kz, 0.55, 0.5);                                                                                 // the kitchen's hatch, red from below
  void hx1;
  H.flush(ctx.bag);
  return r;
};

/** The forge: the furnace's glow, the charcoal bed, the pool before the shelter. */
const forge = (fn) => function haloed(el, ctx) {
  const lights = ctx?.lights, n = lights ? lights.length : 0;
  const r = fn.call(this, el, ctx);
  if (!lights) return r;
  const H = new Halo(), [fx, fz] = el.at;
  for (const l of lights.slice(n)) lightHalo(H, l, el.y);
  H.floor(fx, el.y + 0.06, fz + 0.6, 2.4, 1.8, 10, 0.7);
  H.flush(ctx.bag);
  return r;
};

/** field_hut: the small fire of the night watchman at the foot of the platform (a glow low over the ground, its pool on the stubble). */
const fieldHut = (fn) => function haloed(el, ctx) {
  const r = fn.call(this, el, ctx);
  const H = new Halo(), [x, z] = el.at, y = el.y ?? 0, fx = x + 2.2, fz = z + 1.4;
  H.ball(fx, y + 0.35, fz, 0.6, 0.55); H.floor(fx, y + 0.06, fz, 2.2, 2.0, 8, 0.7);
  H.flush(ctx.bag);
  return r;
};

/**
 * dg_fire: { at: [x, z], y, seed }: an evening fire on the place, three stones' worth of ring (rubble), crossed logs and a low halo; the
 * people sat round it are town.js figures with `nightKeep: 1`. Collides as nothing (a stone ring, 0.9 m across). [inferred: millet-stalk and wood
 * fires of an unelectrified village; no source read describes the place at night]
 */
function fire(el, { bag }) {
  const [x, z] = el.at, y = el.y ?? 0;
  for (let k = 0; k < 9; k++) { const a = k / 9 * TAU + 0.3 * hv(x, z, k), r = 0.42 + 0.04 * hv(x, z, k + 9), sz = 0.12 + 0.05 * hv(x + k, z, 3); bag.add('schist_rubble', lathe([[sz, 0], [sz * 0.85, 0.1], [0.001, 0.16]], 6, null, x + Math.cos(a) * r, y, z + Math.sin(a) * r)); }
  for (let k = 0; k < 4; k++) { const a = k * 1.57 + 0.4 + hv(x, z, 20) * 0.5; bag.add('wood_dark', rod([x + Math.cos(a) * 0.38, y + 0.12, z + Math.sin(a) * 0.38], [x - Math.cos(a) * 0.1, y + 0.2, z - Math.sin(a) * 0.1], 0.045, 5)); }
  const H = new Halo();
  H.ball(x, y + 0.45, z, 0.7, 0.8); H.floor(x, y + 0.04, z, 3.2, 3.2, 12, 0.9);
  H.flush(bag);
}

let done = false;
export function registerNight() {
  if (done) return; done = true;
  const E = STYLES.dogon.elements;
  E.dogon_landmark = ginna(E.dogon_landmark); E.dogon_house = ginna(E.dogon_house);
  E.dg_fire = fire;
  E.forge = forge(E.forge); E.field_hut = fieldHut(E.field_hut);
}
registerNight();
