// Benin City about 1600 by night — what lit the town and the palace, and the light it throws (docs/settlements/benin-city.md §15.2).
// What burned at Benin then [stated, weakly: This is Africa, large metal street lamps are reported on the streets; inferred: palm oil (the oil palm is the forest belt's
// own) in a bronze bowl with a wick of twisted fibre is what the lamps burned; the three-stone hearth in every house, its embers and its fire at the three meals; the
// cooking fires of the waiting sheds; the casters' furnaces, whose glow the dossier records for the guild (§8) and which burn charcoal; the guards' fires at the gates
// of the Iya; the embers of the incense braziers at the palace gate]. No candle, no glass, no electric light, no Chinese lantern.
// Everything here is geometry in one material, `halo` (palette.js, materials.js 'halo'): light ADDED over what is behind it, at night only, with no light, no shadow and
// no collision, so the day view is unchanged and it shows at the low preset. The shape of each piece is carried by its normals (y: 1 at a disc's middle, 0 at its rim): a
// glow round each flame (three crossed discs), a pool on the ground or the floor, a pane before a lit window. The house's hearth lights are found where the style pushes
// them (`ctx.lights`), the lattice of a window where it is added to the bag; the elements that hold a fire are wrapped here (the style's files stay as they were); the new
// stand (bn_stand) is registered into the style from here. Each light is a function of its own place: no counters, no Math.random. The method is that of the Suzhou
// reference; nothing of Suzhou's is imported.

import '../../styles/benin/index.js';
import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';
import { lathe } from '../../core/geom.js';
import { STYLES } from '../../core/build.js';
import { frame } from '../../styles/greek/agora.js';

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
function lightHalo(H, l, floor, off = 0.03) {
  const [x, y, z] = l.at, d = l.distance ?? 6, k = Math.min(1, (l.intensity ?? 2) / 2.4);
  H.ball(x, y + 0.1, z, Math.max(0.42, Math.min(0.95, d * 0.1)) * (0.8 + 0.2 * k), 0.58);
  if (floor !== undefined && y - floor < 3.0 && y - floor > 0.05) H.floor(x, floor + off, z, Math.max(1.3, Math.min(3.2, d * 0.38)), Math.max(1.3, Math.min(3.2, d * 0.38)), 10, 0.8);
}

const bounds = (g) => {
  const P = g.attributes.position.array, b = [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity];
  for (let i = 0; i < P.length; i += 3) for (let k = 0; k < 3; k++) { if (P[i + k] < b[k]) b[k] = P[i + k]; if (P[i + k] > b[k + 3]) b[k + 3] = P[i + k]; }
  return b;
};

/**
 * A house's bag, watched: the lattice grilles of its walls (a `lattice` box, 0.4–1.2 m high, thin, on a wall) glow with the lamp or the fire behind them in `share` of the
 * cases (by the hash of the grille's own place: palm oil is dear), on the outward face only.
 */
function watch(ctx, el, share) {
  const H = new Halo(), real = ctx.bag, [x0, z0, x1, z1] = el.rect, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, y0 = el.y ?? 0;
  const bag = new Proxy(real, {
    get(t, k) {
      if (k === 'add') return (mat, g, ...r) => {
        if (mat === 'lattice' && g?.attributes?.position) {
          const b = bounds(g), dx = b[3] - b[0], dz = b[5] - b[2], dy = b[4] - b[1], th = Math.min(dx, dz), w = Math.max(dx, dz);
          if (th < 0.16 && dy > 0.35 && dy < 1.25 && w > 0.4 && b[1] > y0 + 0.9) {
            const mx = (b[0] + b[3]) / 2, mz = (b[2] + b[5]) / 2, up = b[1] > y0 + 3.2;
            if (hashAt(mx, mz, 31 + (up ? 1 : 0)) < (up ? 0.65 : share)) {
              const f = 0.45 + 0.3 * hashAt(mx, mz, 7), m = 0.03, o = 0.02;
              if (dx < dz) { const s = mx > cx ? 1 : -1, x = (s > 0 ? b[3] : b[0]) + s * o; H.quad([x, b[1] + m, b[2] + m], [x, b[1] + m, b[5] - m], [x, b[4] - m, b[5] - m], [x, b[4] - m, b[2] + m], [s, 0], f); }
              else { const s = mz > cz ? 1 : -1, z = (s > 0 ? b[5] : b[2]) + s * o; H.quad([b[0] + m, b[1] + m, z], [b[3] - m, b[1] + m, z], [b[3] - m, b[4] - m, z], [b[0] + m, b[4] - m, z], [0, s], f); }
            }
          }
        }
        return t.add(mat, g, ...r);
      };
      const v = t[k];
      return typeof v === 'function' ? v.bind(t) : v;
    },
  });
  return { ctx: { ...ctx, bag }, H };
}

let depth = 0;
/** Wrap one element builder: what it lights, by its kind. */
const wrap = (name, fn) => function lit(el, ctx) {
  if (depth > 0 || el.simple) { depth++; try { return fn.call(this, el, ctx); } finally { depth--; } }
  const lights = ctx?.lights, n = lights ? lights.length : 0;
  const W = name === 'benin_house' ? watch(ctx, el, el.kind === 'trade' ? 0.55 : 0.4) : null, H = W ? W.H : new Halo();
  depth++;
  try { var r = fn.call(this, el, W ? W.ctx : ctx); } finally { depth--; }
  const y = el.y ?? 0;
  if (name === 'benin_house') {
    for (const l of (lights ?? []).slice(n)) lightHalo(H, l, y + 0.25, 0.08);
    // the street door open on the lit front room: the fire's light over the step into the street, in some of the houses (by the hash of the lot's place)
    const F = frame(el.rect, el.front ?? 's'), dc = el.kind === 'trade' ? F.L / 2 : (el.du ?? F.L * 0.4) + 1.2, [px, pz] = F.P(dc, -1.3);
    if (hashAt(px, pz, 11) < (el.kind === 'trade' ? 0.9 : 0.6)) H.floor(px, y + 0.15, pz, 2.1, 1.5, 8, 0.6);
  } else if (name === 'benin_lamp') {
    const [x, z] = el.at; H.ball(x, y + 3.95, z, 0.6, 0.7); H.floor(x, y + 0.03, z, 4.2, 4.2, 12, 0.55);
  } else if (name === 'benin_brazier') {
    const [x, z] = el.at; H.ball(x, y + 1.05, z, 0.55, 0.62); H.floor(x, y + 0.03, z, 2.0, 2.0, 10, 0.55);
  } else if (name === 'benin_shelter' && el.fire) {
    const [fx, fz] = el.fire; H.ball(fx, 0.45, fz, 0.6, 0.66); H.floor(fx, 0.03, fz, 2.8, 2.8, 10, 0.8);
  } else if (name === 'caster_yard') {
    const F = frame(el.rect, el.front), { D, L, P } = F;
    if ((el.kind ?? 'cast') === 'cast') {
      // the furnace's mouth and its chimney glow, the forge hearth beside it, the lit shed
      const [fx, fz] = P(4.2, D - 9), [hx, hz] = P(7.6, D - 8);
      H.ball(fx, 1.0, fz, 1.1, 0.78); H.floor(fx, 0.08, fz, 3.8, 3.8, 12, 0.85);
      H.ball(hx, 0.55, hz, 0.7, 0.66); H.floor(hx, 0.08, hz, 2.4, 2.4, 10, 0.7);
    } else {
      // a small lamp in the shed by the bench or the loom, in some of the yards
      const [lx, lz] = P(L / 2 + 1, D - 3.8);
      if (hashAt(lx, lz, 3) < 0.6) { H.ball(lx, 1.9, lz, 0.5, 0.6); H.floor(lx, 0.08, lz, 2.4, 2.4, 10, 0.55); }
    }
  } else if (name === 'benin_gate') {
    // the guards' fire inside the gate of the Iya, on the side of the leaf
    const [gx, gz] = el.at, th = el.th, dx = Math.cos(th), dz = Math.sin(th), fx = gx - dx * 4.6 - dz * 3.6, fz = gz - dz * 4.6 + dx * 3.6, gy = el.y ?? 0;
    H.ball(fx, gy + 0.45, fz, 0.7, 0.68); H.floor(fx, gy + 0.05, fz, 3.4, 3.4, 10, 0.8);
  }
  H.flush(ctx.bag);
  return r;
};

/**
 * bn_stand: { at: [x, z], y } — a standing lamp of the palace: a bronze foot of three splayed legs, a stem with a rope-twist, a dish of palm oil with a wick burning [stated, weakly:
 * large metal lamps are reported in the streets; inferred: the form, the palace's use]; the glow and its pool on the floor.
 */
function stand({ at, y = 0, simple }, { bag, col }) {
  const [x, z] = at, H = new Halo(), q = hashAt(x, z, 5), s = 0.95 + 0.1 * q, w = 0.9 + 0.2 * hashAt(x, z, 6);
  bag.add('bronze', lathe([[0.001, 0], [0.2 * w, 0], [0.2 * w, 0.05], [0.09 * w, 0.14], [0.05 * w, 0.5 * s], [0.075 * w, 0.62 * s], [0.045 * w, 0.8 * s], [0.04 * w, 1.35 * s], [0.14 * w, 1.46 * s], [0.18 * w, 1.54 * s], [0.15 * w, 1.56 * s], [0.001, 1.5 * s]], 10, null, x, y, z));
  col.circle(x, z, 0.22, y, y + 1.55 * s);
  if (simple) return;
  H.ball(x, y + 1.7 * s, z, 0.75, 0.68); H.floor(x, y + 0.03, z, 3.0, 3.0, 12, 0.7);
  H.flush(bag);
}

let done = false;
/** Wraps the benin style's elements that hold a fire (once, after the style has registered); registers the new stand. */
export function registerNight() {
  if (done) return; done = true;
  const E = STYLES.benin.elements;
  for (const k of ['benin_house', 'benin_lamp', 'benin_brazier', 'benin_shelter', 'caster_yard', 'benin_gate']) if (typeof E[k] === 'function') E[k] = wrap(k, E[k]);
  E.bn_stand = stand;
}
registerNight();
