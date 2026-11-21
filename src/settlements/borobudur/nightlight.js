// Sailendra Java (Borobudur), c. 825, by night — what lit the monument, the way, the houses and the monastery, and the light it throws (docs/settlements/borobudur.md §20.2).
// Lit by oil lamps (the clay dipa of the shrines and offerings, the bronze lamp stands of the hall), resin torches on bamboo poles along the pilgrims' way, hearth fires
// through the doors and window shutters of the houses, the smith's forge, a lamp over a stall's counter [all inferred: ethnographic Java, §13 offerings; no source describes
// the light of c. 825].
// Everything here is geometry in one material, `halo` (palette.js, materials.js 'halo'): light ADDED over what is behind it, at night only, with no light, no shadow and no
// collision, so the day view is unchanged and the lamps read as lit at the low preset. Each piece's shape is carried by its normals (y: 1 at a disc's middle, 0 at its rim):
// a glow round each flame (three crossed discs), a pool on the floor, a lit pane in a window or doorway. The javanese style's elements are wrapped from here (the style file
// stays as it was): every `flame` the element adds (the clay lamps of the offerings and shrines) gets its glow, and the houses' windows, doors and hearths, the stalls' hearths and
// hanging lamps, the halls' lamp stands get theirs; `bb_torch` is a new element. The method is that of the Suzhou reference; nothing of Suzhou's is imported. Each light is a
// function of its own place: no counters, no Math.random.

import '../../styles/javanese/index.js';
import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';
import { box, lathe } from '../../core/geom.js';
import { STYLES } from '../../core/build.js';
import { rumahPlace } from '../../styles/javanese/index.js';

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
  /** A disc lying flat at height y (a floor or the ground), rx by rz across, k its strength. */
  floor(x, y, z, r, rz = r, segs = 8, k = 1) { this.disc([x, y, z], [1, 0, 0], [0, 0, 1], r, rz, null, segs, [k, 0.42 * k, 0]); }
  /** The glow round a flame: three upright discs crossed at 60 degrees. */
  ball(x, y, z, r, k = 0.62) {
    for (let i = 0; i < 3; i++) { const a = i * Math.PI / 3 + 0.37, c = Math.cos(a), s = Math.sin(a); this.disc([x, y, z], [c, 0, s], [0, 1, 0], r, r, [-s, c], 8, [k, 0], [0, 1]); }
  }
  /** A flat sheet (a lit window or doorway) of brightness f, facing n = [x, z]. */
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
 * Wrap a bag: the `flame` pieces added through it are gathered (a lamp stand's five wicks, a row of lamps are clustered within 0.4 m), and the `opening` slabs that are windows
 * (a thin slab 0.5–1.0 m high, 0.6–1.0 m wide, over a floor) are given to `onWindow`. Returns { bag, flames() }.
 */
function spy(real, onWindow) {
  const F = new Map();
  const bag = new Proxy(real, {
    get(t, k) {
      if (k === 'add') return (mat, g, ...r) => {
        if (mat === 'flame' && g?.attributes?.position) {
          const b = bounds(g), x = (b[0] + b[3]) / 2, y = (b[1] + b[4]) / 2, z = (b[2] + b[5]) / 2, key = Math.round(x / 0.4) + ',' + Math.round(y / 0.4) + ',' + Math.round(z / 0.4);
          const c = F.get(key) || F.set(key, { n: 0, x: 0, y: 0, z: 0 }).get(key);
          c.n++; c.x += x; c.y += y; c.z += z;
        } else if (mat === 'opening' && onWindow && g?.attributes?.position) onWindow(bounds(g));
        return t.add(mat, g, ...r);
      };
      const v = t[k];
      return typeof v === 'function' ? v.bind(t) : v;
    },
  });
  return { bag, flames: () => [...F.values()].map((c) => ({ n: c.n, at: [c.x / c.n, c.y / c.n, c.z / c.n] })) };
}

/** The glow of the flames gathered: a ball (bigger for a cluster), and a pool on the surface under a low lamp (`floor`: the height of the floor or ground the element stands on). */
function flameHalos(H, flames, floor) {
  for (const { n, at: [x, y, z] } of flames) {
    const r = Math.min(0.78, 0.3 + 0.07 * n) * (0.9 + 0.2 * hashAt(x, z, 3));
    H.ball(x, y + 0.04, z, r, 0.62);
    const up = y - floor;
    if (up < 0.5) H.floor(x, y - 0.03, z, 0.55 + 0.1 * n, 0.55 + 0.1 * n, 8, 0.7);
    else if (up < 1.5) H.floor(x, floor + 0.03, z, 1.2 + 0.2 * n, 1.2 + 0.2 * n, 10, 0.55);
  }
}

/** Geometries (position and normal, not indexed) joined into one: a pole with its head is one piece, not a fine one (a fine piece, under 0.4 m, makes a detail mesh of its material per cell in view). */
function joined(list) {
  const P = [], N = [];
  for (const g of list) { P.push(...g.attributes.position.array); N.push(...g.attributes.normal.array); }
  const g = new BufferGeometry();
  g.setAttribute('position', new Float32BufferAttribute(P, 3)); g.setAttribute('normal', new Float32BufferAttribute(N, 3));
  return g;
}

let depth = 0;
const wrap = (name, fn) => function haloed(el, ctx) {
  if (depth > 0 || el.simple) { depth++; try { return fn.call(this, el, ctx); } finally { depth--; } }
  const H = new Halo(), house = name === 'rumah' && el.kind !== 'lumbung';
  const Pl = house ? rumahPlace(el) : null;
  const [x0, z0, x1, z1] = el.rect || [0, 0, 0, 0], cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  const lit = house ? (el.interior ? 0.85 : 0.3) : 0;
  const S = spy(ctx.bag, house ? (b) => {
    const dx = b[3] - b[0], dz = b[5] - b[2], dy = b[4] - b[1], th = Math.min(dx, dz), w = Math.max(dx, dz);
    if (th < 0.25 && dy > 0.5 && dy < 1.0 && w > 0.6 && w < 1.0 && b[1] > Pl.fl + 0.8) {
      const mx = (b[0] + b[3]) / 2, mz = (b[2] + b[5]) / 2;
      if (hashAt(mx, mz, 31) < lit) {
        const f = 0.4 + 0.3 * hashAt(mx, mz, 7), m = 0.05, o = 0.012;
        if (dx < dz) { const s = mx > cx ? 1 : -1, x = (s > 0 ? b[3] : b[0]) + s * o; H.quad([x, b[1] + m, b[2] + m], [x, b[1] + m, b[5] - m], [x, b[4] - m, b[5] - m], [x, b[4] - m, b[2] + m], [s, 0], f); }
        else { const s = mz > cz ? 1 : -1, z = (s > 0 ? b[5] : b[2]) + s * o; H.quad([b[0] + m, b[1] + m, z], [b[3] - m, b[1] + m, z], [b[3] - m, b[4] - m, z], [b[0] + m, b[4] - m, z], [0, s], f); }
      }
    }
  } : null);
  depth++;
  let r;
  try { r = fn.call(this, el, { ...ctx, bag: S.bag }); } finally { depth--; }
  const flames = S.flames();
  if (name === 'rumah' && house) {
    const { fl, u0, su, vw, D, P, run } = Pl, o = [P(0, 1)[0] - P(0, 0)[0], P(0, 1)[1] - P(0, 0)[1]];
    flameHalos(H, flames, fl);
    if (hashAt(cx, cz, 11) < (el.interior ? 0.95 : 0.4)) {
      // the door ajar on a lit room: a sheet of light in the doorway, its pool over the veranda and, fainter, at the stair's foot
      const k = el.interior ? 0.55 : 0.35, a = P(u0 - 0.8, vw - 0.05), b = P(u0 + 0.8, vw - 0.05);
      H.quad([a[0], fl + 0.05, a[1]], [b[0], fl + 0.05, b[1]], [b[0], fl + 2.0, b[1]], [a[0], fl + 2.0, a[1]], o, k);
      const v = P(u0, vw + 0.7); H.floor(v[0], fl + 0.04, v[1], 1.5, 1.1, 8, k + 0.15);
      const g = P(su, D / 2 + run + 0.7); H.floor(g[0], 0.04, g[1], 1.9, 1.9, 8, k * 0.75);
    }
    if (el.interior && el.variant !== 2 && el.variant !== 4) {
      // the hearth fire in the back corner (the corner of `houseFit`'s hearth)
      const e = Pl.W / 2 - 0.16, h = P(-e + 0.9, -D / 2 + 0.85);
      H.ball(h[0], fl + 0.45, h[1], 0.55, 0.62); H.floor(h[0], fl + 0.04, h[1], 1.4, 1.4, 8, 0.6);
    }
  } else if (name === 'warung') {
    flameHalos(H, flames, 0.4);
    if (el.kind === 'warung' && hashAt(el.at[0], el.at[1], 5) < 0.7) {
      // the hearth's glow in the back corner, the lamp hung over the counter (a flame on a cord from the front beam)
      const ew = el.face === 'e' || el.face === 'w', W = el.w ?? 4, D = 3.0, hx = (ew ? D : W) / 2, hz = (ew ? W : D) / 2;
      const f = { s: (u, v) => [el.at[0] + u, el.at[1] + v], n: (u, v) => [el.at[0] - u, el.at[1] - v], e: (u, v) => [el.at[0] + v, el.at[1] - u], w: (u, v) => [el.at[0] - v, el.at[1] + u] }[el.face || 's'];
      const hth = f(-W / 2 + 0.9, -D / 2 + 0.8), lamp = f(0.3, D / 2 - 0.5);
      H.ball(hth[0], 0.4 + 0.55, hth[1], 0.5, 0.62); H.floor(hth[0], 0.45, hth[1], 1.1, 1.1, 8, 0.5);
      ctx.bag.add('bamboo_culm', joined([box(lamp[0] - 0.008, 2.0, lamp[1] - 0.008, lamp[0] + 0.008, 2.3, lamp[1] + 0.008), lathe([[0.04, 0], [0.07, 0.03], [0.075, 0.12], [0.04, 0.17], [0.001, 0.18]], 8, null, lamp[0], 1.82, lamp[1])]));    // the lamp hung from the front beam: a bamboo lantern on its cord
      H.ball(lamp[0], 1.93, lamp[1], 0.16, 1.0);
      H.ball(lamp[0], 1.95, lamp[1], 0.6, 0.62);
      const o = { s: [0, 1], n: [0, -1], e: [1, 0], w: [-1, 0] }[el.face || 's'], fp = f(0.3, D / 2 + 1.4);
      H.floor(fp[0], 0.04, fp[1], 2.4, 1.8, 8, 0.45);
      void hx; void hz; void o;
    }
  } else if (name === 'hallfit') {
    // a flame on each bronze lamp stand of the hall (the stands stand at x0 + 3.55, 2.1 m either side of the hall's middle line) and a flame at the foot of the stone Buddha's aureole
    const y = (el.y ?? 0), zc = (z0 + z1) / 2;
    for (const s of [-1, 1]) {
      const lx = x0 + 3.55, lz = zc + s * 2.1;
      H.ball(lx, y + 1.2, lz, 0.2, 1.0); H.ball(lx, y + 1.22, lz, 0.75, 0.68); H.floor(lx, y + 0.03, lz, 2.6, 2.6, 10, 0.6);
    }
    flameHalos(H, flames, y);
  } else if (name === 'pendopo' && !el.tiers) {
    // an open hall without the tall roof (a rest hall by the way, a village hall) has one clay lamp on a bamboo stand at its back corner, clear of the stairs
    const y = (el.y ?? 0) + 0.8, st = el.steps ?? ['e', 'w'], bz = st.includes('s') && !st.includes('n') ? z0 + 0.95 : st.includes('n') && !st.includes('s') ? z1 - 0.95 : z0 + 0.95, bxx = st.includes('e') ? x0 + 0.95 : x1 - 0.95;
    ctx.bag.add('bamboo_culm', joined([box(bxx - 0.04, y, bz - 0.04, bxx + 0.04, y + 0.85, bz + 0.04), lathe([[0.001, 0], [0.09, 0.01], [0.1, 0.05], [0.001, 0.05]], 8, null, bxx, y + 0.85, bz)]));
    H.ball(bxx, y + 0.95, bz, 0.16, 1.0);
    H.ball(bxx + 0.06, y + 0.92, bz, 0.85, 0.66); H.floor(bxx, y + 0.03, bz, 2.4, 2.4, 10, 0.55);
  } else flameHalos(H, flames, el.y ?? 0);
  H.flush(ctx.bag);
  return r;
};

/** The resin torch of the way: bb_torch { at: [x, z], y?, h?, seed? } — a bamboo pole with a head of resin-soaked fibre bound to it, the flame as a glow only; its pool on the ground. */
function torch({ at, y = 0, h = 2.3, seed = 0 }, { bag, col }) {
  const [x, z] = at, H = new Halo(), q = hashAt(x, z, 21 + seed), hh = h * (0.94 + 0.1 * q), lean = (q - 0.5) * 0.06;
  bag.add('bamboo_culm', joined([box(x - 0.035 + lean, y, z - 0.035, x + 0.035 + lean, y + hh, z + 0.035),
    lathe([[0.001, 0], [0.07, 0.01], [0.085, 0.08], [0.075, 0.16], [0.045, 0.2], [0.001, 0.2]], 8, null, x + lean, y + hh - 0.08, z)]));        // the pole and the head of resin-soaked fibre bound to it, one piece
  H.ball(x + lean, y + hh + 0.14, z, 0.2, 1.0);                                                                                                        // the flame's core (no mesh of its own: the glow carries it)
  col.circle(x, z, 0.12, y, y + hh);
  H.ball(x + lean, y + hh + 0.2, z, 0.95 + 0.15 * q, 0.7); H.floor(x, y + 0.04, z, 2.8 + 0.5 * q, 2.8 + 0.5 * q, 10, 0.6);
  H.flush(bag);
}

let done = false;
/** Wraps the javanese style's elements that carry flames or windows (once, after the style has registered), and adds bb_torch. */
export function registerNight() {
  if (done) return; done = true;
  const E = STYLES.javanese.elements;
  for (const k of ['rite', 'rumah', 'warung', 'pendopo', 'hallfit', 'cetiya']) if (typeof E[k] === 'function') E[k] = wrap(k, E[k]);
  E.bb_torch = torch;
}
registerNight();
