// Kilwa about 1330 by night — what lit the town and the palace, and the light it throws (docs/settlements/kilwa.md §22.2).
// What burned at Kilwa then [inferred: the coast's sources give no lamp of this town; the general record of the Swahili coast and of Songo Mnara's niches "for
// imported ceramics, glass and lamps" (§12) is all we have]: a small oil lamp (coconut or sesame oil, a wick in a clay or bronze bowl; glass lamps traded in from
// Egypt and Persia) set in the niche over the baraza and hung in the front room; the hearth's embers in the court; hanging glass lamps (kandil) in the mosque's
// bays; stands of bronze with a lamp before the sultan's doors; a fire by each landing place of the beach where the porters watch the goods; the lantern at the
// stern of a dhow at anchor. No candle, no glass-chimney lamp, no electric light.
// Everything here is geometry in one material, `halo` (palette.js, materials.js 'halo'): light ADDED over what is behind it, at night only, with no light, no
// shadow and no collision, so the day view is unchanged and it shows at the low preset. The shape of each piece is carried by its normals (y: 1 at a disc's
// middle, 0 at its rim): a glow round each flame (three crossed discs), a pool on the floor or the lane, a pane before a lit window. The style's lamps are found
// where the style makes them (a `lamp_glass` or a `flame` added to the bag) and every element of the style that holds one is wrapped here (the style files stay
// as they were); the few new elements (kw_stand, kw_fire, kw_glow) are registered into the style from here. Each light is a function of its own place: no
// counters, no Math.random. The method is that of the Suzhou reference; nothing of Suzhou's is imported.

import '../../styles/swahili/index.js';
import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';
import { box, lathe } from '../../core/geom.js';
import { STYLES } from '../../core/build.js';
import { height } from './layout.js';
import { houseFacts } from '../../styles/swahili/house.js';

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

const bounds = (g) => {
  const P = g.attributes.position.array, b = [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity];
  for (let i = 0; i < P.length; i += 3) for (let k = 0; k < 3; k++) { if (P[i + k] < b[k]) b[k] = P[i + k]; if (P[i + k] > b[k + 3]) b[k + 3] = P[i + k]; }
  return b;
};

/**
 * One element's bag, watched: every `flame` (the lamp hanging in a room) and `lamp_glass` (a lamp in a niche, a hanging glass lamp, a lamp on a floor) added through
 * it gets its halo from its own place; the windows (a thin `opening` slab 0.5–1.3 m high on a house wall above the floor) glow in `share` of the cases.
 */
function watch(ctx, el, o) {
  const real = ctx.bag, H = new Halo(), [x0, z0, x1, z1] = el.rect || [0, 0, 0, 0], cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, y0 = el.y ?? 0, lights = ctx.lights;
  const lamp = (g, glass) => {
    const b = bounds(g), x = (b[0] + b[3]) / 2, z = (b[2] + b[5]) / 2, yb = b[1], top = b[4];
    const rel = yb - y0;
    if (glass && o.street && Math.abs(z - (el.flip ? z1 : z0)) < 0.5 && rel > 0.8 && rel < 3.4) {
      // the lamp in the niche over the baraza: it burns in some of the niches (oil is dear), and lights the lane before it
      if (hashAt(x, z, 41) > 0.62) return;
      const out = el.flip ? 1 : -1, lz = z + out * 1.3;
      H.ball(x, top + 0.02, z + out * 0.05, 0.42, 0.7);
      H.floor(x, Math.max(height(x, lz) + 0.25, y0 + 0.3), lz, 2.6, 2.1, 10, 0.75);
      if (lights) lights.push({ at: [x, top + 0.05, z + out * 0.3], color: '#ffb46b', intensity: 1.6, distance: 5 });
      return;
    }
    if (rel > 1.6 && yb - y0 < 7) {
      // a lamp hung in a room or a bay: the glow round it and its pool on the floor 2 m below
      const hung = !glass, fl = hung ? top - 2.05 : y0 + 0.1;
      H.ball(x, top + 0.04, z, glass ? 0.6 : 0.55, glass ? 0.66 : 0.62);
      H.floor(x, hung ? fl + 0.06 : y0 + 0.13, z, glass ? 2.7 : 2.2, glass ? 2.7 : 2.2, 10, glass ? 0.55 : 0.7);
      if (lights) lights.push({ at: [x, top + 0.1, z], color: '#ffb46b', intensity: glass ? 2.2 : 2.6, distance: glass ? 7 : 6 });
      return;
    }
    // a lamp standing low (the palace rooms): its glow and a pool on the floor
    H.ball(x, top + 0.04, z, 0.4, 0.62); H.floor(x, yb - 0.02, z, 1.6, 1.6, 8, 0.7);
    if (lights) lights.push({ at: [x, top + 0.2, z], color: '#ffb46b', intensity: 1.8, distance: 5 });
  };
  const bag = new Proxy(real, {
    get(t, k) {
      if (k === 'add') return (mat, g, ...r) => {
        if ((mat === 'flame' || mat === 'lamp_glass') && g?.attributes?.position) lamp(g, mat === 'lamp_glass');
        else if (o.windows && mat === 'opening' && g?.attributes?.position) {
          const b = bounds(g), dx = b[3] - b[0], dz = b[5] - b[2], dy = b[4] - b[1], th = Math.min(dx, dz), w = Math.max(dx, dz);
          if (th < 0.05 && dy > 0.5 && dy < 1.3 && w > 0.14 && b[1] > y0 + 0.9) {
            const mx = (b[0] + b[3]) / 2, mz = (b[2] + b[5]) / 2;
            if (hashAt(mx, mz, 31 + Math.floor(b[1] / 2.5)) < o.windows) {
              const f = 0.45 + 0.35 * hashAt(mx, mz, 7), m = 0.03, e = 0.033;
              if (dx < dz) { const s = mx > cx ? 1 : -1, x = (s > 0 ? b[3] : b[0]) + s * e; H.quad([x, b[1] + m, b[2] + m], [x, b[1] + m, b[5] - m], [x, b[4] - m, b[5] - m], [x, b[4] - m, b[2] + m], [s, 0], f); }
              else { const s = mz > cz ? 1 : -1, z = (s > 0 ? b[5] : b[2]) + s * e; H.quad([b[0] + m, b[1] + m, z], [b[3] - m, b[1] + m, z], [b[3] - m, b[4] - m, z], [b[0] + m, b[4] - m, z], [0, s], f); }
            }
          }
        }
        return t.add(mat, g, ...r);
      };
      const v = t[k];
      return typeof v === 'function' ? v.bind(t) : v;
    },
  });
  return { ctx: { ...ctx, bag }, H, finish: () => H.flush(real) };
}

/** The doorways of the mosque's four walls (the style's own rule: every other bay), for the light they spill outside. */
function mosqueDoors(el) {
  const [x0, z0, x1, z1] = el.rect, b = el.bay ?? 4.5, out = [];
  for (const [a, c, alongX, zz, sg] of [[x0, x1, true, z0, -1], [x0, x1, true, z1, 1], [z0, z1, false, x0, -1], [z0, z1, false, x1, 1]]) {
    const L = c - a, n = Math.floor(L / (b * 2));
    for (let i = 0; i < n; i += 2) { const u = a + (i + 0.5) * L / n; out.push(alongX ? [u, zz + sg * 1.5] : [zz + sg * 1.5, u]); }
  }
  return out;
}

let depth = 0;
const KINDS = {
  swahili_house: (el) => ({ street: true, windows: el.open ? 0.3 : el.simple ? 0 : 0.2 }),
  swahili_mosque: () => ({}),
  husuni_core: () => ({}), husuni_south: () => ({}), beach_mosque: () => ({}),
};
/** Wrap one element builder of the swahili style. */
const wrap = (name, fn) => function lit(el, ctx) {
  if (depth > 0) { depth++; try { return fn.call(this, el, ctx); } finally { depth--; } }
  const W = watch(ctx, el, KINDS[name](el));
  depth++;
  try { var r = fn.call(this, el, W.ctx); } finally { depth--; }
  if (name === 'swahili_mosque') for (const [x, z] of mosqueDoors(el)) { W.H.floor(x, height(x, z) + 0.25, z, 2.6, 2.6, 10, 0.55); }
  if (name === 'swahili_house' && el.open && !el.simple) {
    // the street door ajar on the lit court: the lamp's light over the step into the lane
    const f = houseFacts(el), lz = f.front + f.out * 1.2;
    W.H.floor(f.doorX, Math.max(height(f.doorX, lz) + 0.26, (el.y ?? 0) + 0.31), lz, 1.9, 1.5, 8, 0.5);
  }
  W.finish();
  return r;
};

/** kw_stand: { at: [x, z], y } — a lampstand of bronze before the sultan's doors: a baluster foot on a stepped base, a dish with the oil and a wick burning. */
function stand({ at, y = 0 }, { bag, col, lights }) {
  const [x, z] = at, H = new Halo(), q = hashAt(x, z, 5), s = 0.94 + 0.12 * q, w = 0.9 + 0.2 * hashAt(x, z, 6);
  bag.add('bronze', lathe([[0.001, 0], [0.17 * w, 0], [0.17 * w, 0.04], [0.08 * w, 0.1], [0.045 * w, 0.4 * s], [0.07 * w, (0.55 + 0.08 * q) * s], [0.045 * w, 0.8 * s], [0.04 * w, 1.15 * s], [0.13 * w, 1.24 * s], [0.15 * w, 1.3 * s], [0.12 * w, 1.29 * s], [0.001, 1.25 * s]], 12, null, x, y, z));
  bag.add('flame', lathe([[0.001, 0], [0.018 * (0.8 + 0.4 * q), 0.015], [0.012, 0.06], [0.001, 0.1 + 0.04 * hashAt(x, z, 9)]], 6, null, x, y + 1.29 * s, z));
  col.circle(x, z, 0.2, y, y + 1.3 * s);
  H.ball(x, y + 1.42 * s, z, 0.7, 0.66); H.floor(x, y + 0.04, z, 2.8, 2.8, 10, 0.7);
  if (lights) lights.push({ at: [x, y + 1.5 * s, z], color: '#ffb46b', intensity: 3, distance: 9 });
  H.flush(bag);
}
/** kw_fire: { at: [x, z], y } — the porters' fire by a landing place: three coral stones, split logs, embers and the flame; the glow and the pool on the sand. */
function fire({ at, y = 0 }, { bag, lights }) {
  const [x, z] = at, H = new Halo();
  for (let k = 0; k < 3; k++) { const a = k * 2.094 + 0.5 + hashAt(x, z, 3) * 2; bag.add('rubble', box(x + Math.cos(a) * 0.4 - 0.12, y, z + Math.sin(a) * 0.4 - 0.12, x + Math.cos(a) * 0.4 + 0.12, y + 0.2 + 0.05 * k, z + Math.sin(a) * 0.4 + 0.12)); }
  for (let k = 0; k < 3; k++) { const a = k * 1.05 + hashAt(x, z, 4); bag.add('wood_dark', box(-0.3, 0.1 + k * 0.045, -0.05, 0.3, 0.15 + k * 0.045, 0.05).rotateY(a).translate(x, y, z)); }
  bag.add('flame', lathe([[0.001, 0.2], [0.14, 0.24], [0.09, 0.5], [0.001, 0.75]], 7, null, x, y, z));
  H.ball(x, y + 0.5, z, 1.2, 0.7); H.floor(x, y + 0.04, z, 4.4, 4.4, 12, 0.85);
  if (lights) lights.push({ at: [x, y + 0.7, z], color: '#ff9a4a', intensity: 4, distance: 11 });
  H.flush(bag);
}
/** kw_glow: { at: [x, z], y, r? } — only the glow of a lantern (the stern lamp of a dhow at anchor, its pool on the water). */
function glow({ at, y = 0, r = 0.9 }, { bag }) {
  const H = new Halo();
  H.ball(at[0], y, at[1], r, 0.7); H.floor(at[0], y - 1.6, at[1], r * 4, r * 4, 10, 0.4);
  H.flush(bag);
}

let done = false;
/** Wraps the swahili style's elements that hold lamps (once); registers the new elements. */
export function registerNight() {
  if (done) return; done = true;
  const E = STYLES.swahili.elements;
  for (const k of Object.keys(KINDS)) if (typeof E[k] === 'function') E[k] = wrap(k, E[k]);
  E.kw_stand = stand; E.kw_fire = fire; E.kw_glow = glow;
}
registerNight();
