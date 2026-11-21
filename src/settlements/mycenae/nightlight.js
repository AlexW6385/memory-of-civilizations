// Mycenae about 1250 BC by night — what lit the citadel and the lower town, and the light it throws (docs/settlements/mycenae.md §16.2).
// What lit the place then: the hearth of every house (the round clay hearth of the front room, the one fire a family kept), the great round hearth of the megaron
// ("a large round hearth at the centre", Dartmouth, Aegean Prehistory, lesson 20), the forge of the smith and the lamp of the workshop, the torches of pitch pine on the walls and in
// the court (the pine is the hills' own), braziers of bronze on three legs, small clay lamps of olive oil with a pinched spout (the oil is the palace's own trade, the Linear B
// tablets list it), and the drovers' fire at the halt. [inferred throughout: no light source is named by the pages the dossier reads; the lamps and the torch are those the Aegean
// Late Bronze Age is known to have used; the placing is ours.]
// Everything here is geometry in one material, `halo` (palette.js, materials.js 'halo'): light ADDED over what is behind it, at night only, with no light, no shadow and no collision,
// so the day view is unchanged and it shows at the low preset (the pools of real light are off there). The shape of each piece is carried by its normals (y: 1 at a disc's middle,
// 0 at its rim): a glow round each flame (three crossed discs), a pool on the floor, a pane before a lit window. Every element of the mycenaean style that puts a light into its
// plan is wrapped here (the style's own files only report their windows through `ctx.onWindow`), the new lights are `my_torch`, `my_brazier`, `my_fire` and `my_lamp` elements, and
// each light is a function of its own place: no counters, no Math.random. The method is that of the Suzhou reference; nothing of Suzhou's is imported.

import '../../styles/mycenaean/index.js';
import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';
import { lathe, box } from '../../core/geom.js';
import { STYLES } from '../../core/build.js';
import { mapper } from '../../styles/mycenaean/furnish.js';
import { mergeG } from '../../styles/mycenaean/util.js';

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
  /** A flat sheet (a lit window) of brightness f, facing n = [x, z]. */
  quad(a, b, c, d, n, f) { const q = Math.sqrt(1 - f * f), N = [n[0] * q, f, n[1] * q]; this.tri(a, N, b, N, c, N); this.tri(a, N, c, N, d, N); }
  flush(bag) {
    if (!this.pos.length) return;
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute(this.pos, 3)); g.setAttribute('normal', new Float32BufferAttribute(this.nor, 3));
    bag.add(MAT, g); this.pos = []; this.nor = [];
  }
}

/** The halo of one light of a plan (`lights` entries: { at, distance, intensity }); `floor` the height of the floor or ground it stands over, if known. */
function lightHalo(H, l, floor) {
  const [x, y, z] = l.at, d = l.distance ?? 6, k = Math.min(1, (l.intensity ?? 2) / 2.4);
  H.ball(x, y, z, Math.max(0.42, Math.min(0.95, d * 0.11)) * (0.8 + 0.2 * k));
  if (floor !== undefined && y - floor < 3.0 && y - floor > 0.2) H.floor(x, floor + 0.07, z, Math.max(1.3, Math.min(3.4, d * 0.42)), Math.max(1.3, Math.min(3.4, d * 0.42)), 10, 0.8);
}

let depth = 0;
/** The lit windows of a house: `share` of them glow with the lamp or the hearth behind them (by the hash of the window's own place: oil and fuel are dear), on the outward face only. */
function windows(ctx, el, H) {
  const share = el.kind === 'workshop' ? 0.55 : el.kind === 'cult' ? 0.6 : el.kind === 'store' ? 0 : 0.6;
  if (!el.lit || share <= 0) return ctx;
  return {
    ...ctx, onWindow: (w) => {
      const mx = (w.a[0] + w.b[0]) / 2, mz = (w.a[1] + w.b[1]) / 2;
      if (hashAt(mx, mz, 31 + Math.floor(w.y0 / 2.5)) >= share) return;
      const nl = Math.hypot(w.n[0], w.n[1]) || 1, n = [w.n[0] / nl, w.n[1] / nl], o = 0.014, m = 0.035, f = 0.45 + 0.35 * hashAt(mx, mz, 7);
      const a = [w.a[0] + n[0] * o, w.a[1] + n[1] * o], b = [w.b[0] + n[0] * o, w.b[1] + n[1] * o];
      H.quad([a[0], w.y0 + m, a[1]], [b[0], w.y0 + m, b[1]], [b[0], w.y1 - m, b[1]], [a[0], w.y1 - m, a[1]], n, f);
    },
  };
}

/** Wrap one element builder: the halo of every light it adds, the lit windows and the spill of the door of a house. */
const wrap = (name, fn) => function haloed(el, ctx) {
  const lights = ctx?.lights, n = lights ? lights.length : 0;
  if (depth > 0 || !lights || el.simple) { depth++; try { return fn.call(this, el, ctx); } finally { depth--; } }
  const H = new Halo(), isHouse = name === 'house' || name === 'granary';
  depth++;
  let r;
  try { r = fn.call(this, el, isHouse ? windows(ctx, el, H) : ctx); } finally { depth--; }
  const floor = el.y;
  for (const l of lights.slice(n)) lightHalo(H, l, floor);
  if (isHouse && el.lit && el.rect) {
    // the door: the hearth's light spilling over the step into the lane
    const m = mapper(el.rect, el.face ?? 'n'), du = el.du ?? m.W / 2, [px, pz] = m.P(du, -1.2);
    H.floor(px, el.y + 0.11, pz, 2.2, 1.6, 8, 0.7);
    if (el.open) {
      // an opened door by night: the front room's hearth seen through the doorway, a lit pane across the opening (a hand inside the wall's face) and a pool on the floor within
      const nl0 = (v) => v, dw = el.dw ?? 1.8, dh = el.dh ?? 2.45, a = m.P(du - dw / 2 + 0.08, 0.3), b = m.P(du + dw / 2 - 0.08, 0.3), o = m.P(du, -1), c = m.P(du, 0), nn = [nl0(o[0] - c[0]), nl0(o[1] - c[1])], nm = Math.hypot(nn[0], nn[1]) || 1; nn[0] /= nm; nn[1] /= nm;
      const cx = (a[0] + b[0]) / 2, cz = (a[1] + b[1]) / 2, U = [b[0] - a[0], 0, b[1] - a[1]], ul = Math.hypot(U[0], U[2]) || 1;
      H.disc([cx, el.y + dh / 2, cz], [U[0] / ul, 0, U[2] / ul], [0, 1, 0], ul / 2, dh / 2 - 0.08, nn, 12, [0.85, 0.5, 0], [0, 0.75, 1]);
      const [ix, iz] = m.P(du, 1.4);
      H.floor(ix, el.y + 0.1, iz, 1.3, 1.1, 8, 0.8);
    }
  }
  H.flush(ctx.bag);
  return r;
};

const flameG = (x, y, z, h, w, seed) => lathe([[0.001, 0], [w, 0.02 * h], [w * 0.7, 0.4 * h], [0.001, h + 0.05 * hashAt(x, z, seed)]], 7, null, x, y, z);

/**
 * my_torch: { at: [x, z], y, mount: [nx, nz] (a bracket on a wall whose face looks that way) | none (a stand) } — a torch of pitch pine bound with rope in a clay or bronze cresset: on a
 * timber stand 1.7 m high with a collision circle, or on a bracket 2.3 m up a wall face, a hand out from it; the flame, its glow and its pool on the ground.
 */
function torch({ at, y = 0, mount = null }, { bag, col, lights }) {
  const [x, z] = at, H = new Halo(), q = hashAt(x, z, 5);
  if (mount) {
    const [nx, nz] = mount, px = -nz, pz = nx, yy = y + 2.3, w = 0.05;
    const piece = (a0, a1, b0, b1, y0, y1) => box(Math.min(x + nx * a0 + px * b0, x + nx * a1 + px * b1), y0, Math.min(z + nz * a0 + pz * b0, z + nz * a1 + pz * b1), Math.max(x + nx * a0 + px * b0, x + nx * a1 + px * b1), y1, Math.max(z + nz * a0 + pz * b0, z + nz * a1 + pz * b1));
    bag.add('timber', mergeG([piece(0.01, 0.34, -w, w, yy - 0.06, yy), piece(0.28, 0.34, -w, w, yy - 0.5, yy), piece(0.02, 0.3, -w * 0.8, w * 0.8, yy - 0.5, yy - 0.44)]));
    const cx = x + nx * 0.31, cz = z + nz * 0.31;
    bag.add('terracotta', lathe([[0.001, 0], [0.07, 0.01], [0.1, 0.1], [0.12, 0.17], [0.09, 0.16], [0.001, 0.04]], 8, null, cx, yy, cz));
    bag.add('flame', flameG(cx, yy + 0.1, cz, 0.3 + 0.08 * q, 0.07, 9));
    const l = { at: [cx, yy + 0.32, cz], color: '#ffa24d', intensity: 3.4, distance: 9 };
    lights.push(l); lightHalo(H, l, y);
  } else {
    bag.add('timber', lathe([[0.001, 0], [0.08, 0.0], [0.065, 0.2], [0.045, 1.55], [0.001, 1.55]], 8, null, x, y, z));
    bag.add('rubble', lathe([[0.001, 0], [0.26, 0], [0.24, 0.16], [0.001, 0.2]], 8, null, x, y, z));
    bag.add('bronze', lathe([[0.001, 0], [0.07, 0.01], [0.13, 0.13], [0.16, 0.2], [0.13, 0.19], [0.001, 0.05]], 8, null, x, y + 1.52, z));
    bag.add('flame', flameG(x, y + 1.62, z, 0.36 + 0.1 * q, 0.08, 9));
    col.circle(x, z, 0.24, y, y + 1.7);
    const l = { at: [x, y + 1.95, z], color: '#ffa24d', intensity: 3.6, distance: 10 };
    lights.push(l); lightHalo(H, l, y);
  }
  H.flush(bag);
}

/** my_brazier: { at, y } — a bronze bowl on three legs, the coals and a low flame (the court's braziers, the circle's, the guard's): 0.9 m high. */
function brazier({ at, y = 0 }, { bag, col, lights }) {
  const [x, z] = at, H = new Halo(), q = hashAt(x, z, 4), legs = [];
  for (let i = 0; i < 3; i++) { const a = i * TAU / 3 + q * 2, lx = x + Math.cos(a) * 0.3, lz = z + Math.sin(a) * 0.3; legs.push(box(lx - 0.025, y, lz - 0.025, lx + 0.025, y + 0.62, lz + 0.025)); }
  bag.add('bronze', mergeG(legs));
  bag.add('bronze', lathe([[0.001, 0], [0.22, 0.02], [0.42, 0.2], [0.46, 0.27], [0.43, 0.28], [0.36, 0.2], [0.001, 0.06]], 12, null, x, y + 0.62, z));
  bag.add('pottery_dark', lathe([[0.001, 0.2], [0.34, 0.2], [0.001, 0.26]], 10, null, x, y + 0.62, z));
  bag.add('flame', flameG(x, y + 0.86, z, 0.34 + 0.1 * q, 0.15, 10));
  col.circle(x, z, 0.45, y, y + 0.9);
  const l = { at: [x, y + 1.15, z], color: '#ffa24d', intensity: 3.6, distance: 11 };
  lights.push(l); lightHalo(H, l, y);
  H.flush(bag);
}

/** my_fire: { at, y, r? } — an open cooking fire of the drovers at the halt: a ring of stones, logs set like spokes, the flames, a pot on three stones; a wide glow and pool. */
function fire({ at, y = 0, r = 0.55 }, { bag, lights }) {
  const [x, z] = at, H = new Halo(), q = hashAt(x, z, 3), ring = [], logs = [];
  for (let i = 0; i < 9; i++) { const a = i * TAU / 9 + q, sx = x + Math.cos(a) * r, sz = z + Math.sin(a) * r, s = 0.07 + 0.03 * hashAt(sx, sz, 2); ring.push(box(sx - s, y - 0.05, sz - s, sx + s, y + 0.14 + 0.05 * hashAt(sx, sz, 6), sz + s)); }
  bag.add('rock_boulder', mergeG(ring));
  for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + q * 3, c = Math.cos(a), s = Math.sin(a); logs.push(box(x + Math.min(0, c) * 0.5 - 0.04, y + 0.05, z + Math.min(0, s) * 0.5 - 0.04, x + Math.max(0, c) * 0.5 + 0.04, y + 0.12, z + Math.max(0, s) * 0.5 + 0.04)); }
  bag.add('timber', mergeG(logs));
  bag.add('flame', flameG(x, y + 0.1, z, 0.55, 0.26, 11));
  bag.add('pottery_dark', lathe([[0.001, 0], [0.13, 0.02], [0.2, 0.15], [0.17, 0.27], [0.001, 0.27]], 9, null, x + 0.1, y + 0.22, z - 0.05));
  const l = { at: [x, y + 0.8, z], color: '#ff9a45', intensity: 4.2, distance: 12 };
  lights.push(l); lightHalo(H, l, y);
  H.floor(x, y + 0.05, z, 3.4, 3.4, 12, 0.9);
  H.flush(bag);
}

/** my_lamp: { at, y, h? } — a clay lamp of olive oil with a pinched spout on a stand or a counter, one flame: the stalls' and the shops' light. */
function lamp({ at, y = 0, h = 0.9 }, { bag, lights }) {
  const [x, z] = at, H = new Halo(), q = hashAt(x, z, 8), a = q * TAU;
  bag.add('timber', lathe([[0.001, 0], [0.09, 0], [0.04, 0.1], [0.035, h - 0.05], [0.07, h], [0.001, h]], 7, null, x, y, z));
  bag.add('terracotta', lathe([[0.001, 0], [0.08, 0.005], [0.1, 0.03], [0.09, 0.05], [0.001, 0.025]], 8, null, x, y + h, z));
  bag.add('terracotta', box(x + Math.cos(a) * 0.1 - 0.015, y + h + 0.025, z + Math.sin(a) * 0.1 - 0.015, x + Math.cos(a) * 0.13 + 0.015, y + h + 0.045, z + Math.sin(a) * 0.13 + 0.015));
  bag.add('flame', flameG(x + Math.cos(a) * 0.12, y + h + 0.04, z + Math.sin(a) * 0.12, 0.06, 0.012, 12));
  const l = { at: [x, y + h + 0.16, z], color: '#ffb46b', intensity: 2.6, distance: 6 };
  lights.push(l); lightHalo(H, l, y);
  H.flush(bag);
}

let done = false;
/** Wraps the mycenaean style's elements that make lights (once, after every file of the style has registered its own) and adds the new light-giving elements. */
export function registerNight() {
  if (done) return; done = true;
  const E = STYLES.mycenaean.elements;
  for (const k of Object.keys(E)) if (typeof E[k] === 'function') E[k] = wrap(k, E[k]);
  E.my_torch = torch; E.my_brazier = brazier; E.my_fire = fire; E.my_lamp = lamp;
}
registerNight();
