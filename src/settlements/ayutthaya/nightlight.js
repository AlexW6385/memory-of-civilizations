// Ayutthaya about 1687 by night — what lit the city and the light it throws (docs/settlements/ayutthaya.md §13.2).
// The light of the place and date is the oil lamp (a wick in a dish of coconut or fish oil, the clay lamp of the house and the shrine), the candle of tallow
// or beeswax before the images of the wats, the lantern of paper or glass hung at a shop's lintel or a gate, the cooking fire in the kitchen house, the lamp
// on a boat's awning [all inferred, §13.2; no electric light]. Everything here is geometry in one material, `halo` (palette.js, materials.js 'halo'): light
// ADDED over what is behind it, at night only, with no light, no shadow and no collision, so the day view is unchanged and it reads at the low preset
// (where the pools of real light are off). The shape of each piece is carried by its normals (y: 1 at a disc's middle, 0 at its rim): a glow round each
// flame (three crossed discs), a pool on the floor, a pane before a lit door or window. Every element of the siamese style that makes a light is wrapped
// here (the style files stay as they were); each light is a function of its own place (no counters, no Math.random). The method is that of the Suzhou
// reference and of Knossos; the Halo class is copied and adapted, nothing of another settlement is imported.
import '../../styles/siamese/index.js';
import './walkwork.js';
import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';
import { STYLES } from '../../core/build.js';
import { frame } from '../../styles/khmer/village.js';
import { rng } from '../../styles/siamese/houses.js';

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
  /** A flat sheet (a lit door or window) of brightness f, facing n = [x, z]. */
  quad(a, b, c, d, n, f) { const q = Math.sqrt(1 - f * f), N = [n[0] * q, f, n[1] * q]; this.tri(a, N, b, N, c, N); this.tri(a, N, c, N, d, N); }
  /** A lit pane from local-frame corners: P(u, v) the world point, u0..u1 across, y0..y1 up, at depth v, facing n. */
  pane(P, u0, u1, v, y0, y1, n, f) { const a = P(u0, v), b = P(u1, v); this.quad([a[0], y0, a[1]], [b[0], y0, b[1]], [b[0], y1, b[1]], [a[0], y1, a[1]], n, f); }
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
  if (floor !== undefined && y - floor < 3.0 && y - floor > 0.2) H.floor(x, floor + 0.03, z, Math.max(1.3, Math.min(3.4, d * 0.42)), Math.max(1.3, Math.min(3.4, d * 0.42)), 10, 0.8);
}

// ── what each element adds to its own lights ──────────────────────────────────────────────────────────────────
const EXTRA = {
  // the timber house: the lamp in the room seen through the door, the doorway lit, the terrace's spill, the lantern at the door; the shophouse: its lintel lanterns, the lane before it, the upper windows
  thai_house(el, H) {
    const { W, F, hF, hS, cx, cz } = frame(el.rect, el.front), n = [F[0], F[1]], P = (u, v) => W(u, v);
    if (el.kind === 'shop') {
      const y0 = 0.3, gh = 3.1, uy = y0 + gh + 0.25;
      for (const s of [-1, 1]) { const c = W(s * (hS - 0.3), hF + 0.3); H.ball(c[0], y0 + gh - 0.12, c[1], 0.5, 0.66); }
      const p = W(0, hF + 1.3); H.floor(p[0], 0.03, p[1], 2.4, 1.5, 10, 0.55);
      for (const [a, b, sill, head] of [[-0.5, 0.5, uy, uy + 1.9], [-hS + 0.7, -hS + 1.7, uy + 0.2, uy + 2.0], [hS - 1.7, hS - 0.7, uy + 0.2, uy + 2.0]]) {
        const m = (a + b) / 2, q = W(m, hF);
        if (hashAt(q[0], q[1], 41) < 0.6) H.pane(P, a, b, hF - 0.17, sill + 0.03, head - 0.03, n, 0.42 + 0.3 * hashAt(q[0], q[1], 42));
      }
      return true;
    }
    const lit = hashAt(cx, cz, 3) < 0.7;
    if (!lit) return false;
    const r = rng(el.seed || 1), up = 1.9 + r() * 0.6; r(); r();
    const door = (r() < 0.5 ? -1 : 1) * hS * 0.38, small = el.kind === 'small', td = small ? 0.9 : el.kind === 'big' ? 2.3 : 1.6, vb = hF - td;
    H.pane(P, door - 0.46, door + 0.46, vb - 0.05, up + 0.05, up + 1.85, n, 0.5 + 0.3 * hashAt(cx, cz, 4));
    const t = W(door, (vb + hF) / 2); H.floor(t[0], up + 0.03, t[1], 1.4, 1.0, 8, 0.6);
    if (!small) { const c = W(door, hF + 0.05); H.ball(c[0], up + 1.65, c[1], 0.38, 0.62); }
    return true;
  },
  // the three chedis and the small ones at the cloister's corners: a lamp in each porch's niche, before the standing image
  chedi(el, H) {
    if (el.mini || (el.w ?? 14) <= 3) return;
    const [cx, cz] = el.c, y = el.y ?? 0, w = el.w ?? 14, k = w / 14, v = (el.h ?? 36) / 36, a = w / 2;
    for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const d = a + 0.9 * k + 1.1 * k + 0.15 * k;
      H.ball(cx + dx * d, y + 1.1 * v, cz + dz * d, Math.max(0.28, 0.5 * k), 0.66);
      if (w > 8) H.floor(cx + dx * (d + 0.7 * k), y + 0.03, cz + dz * (d + 0.7 * k), 1.2 * k, 1.2 * k, 8, 0.5);
    }
  },
  // the candle stands and the offering tables of the court: the candles and the lamp on each
  wat_court(el, H) {
    const y = el.y ?? 0;
    for (const [x, z] of el.candles ?? []) { H.ball(x, y + 1.34, z, 0.5, 0.66); H.floor(x, y + 0.03, z, 1.7, 1.7, 10, 0.6); }
    for (const [x, z, rot] of el.tables ?? []) { const c = Math.cos(rot ?? 0), s = Math.sin(rot ?? 0); H.ball(x + 0.58 * c + 0.2 * s, y + 0.9, z - 0.58 * s + 0.2 * c, 0.4, 0.62); }
  },
  // the palace gate's paper lanterns, one each side of the way on both faces
  palace_gate(el, H) {
    const [cx, cz] = el.c, o = el.open ?? 4, a = 3.6;
    for (const sx of [-1, 1]) for (const s of [-1, 1]) H.ball(cx + sx * (a + 0.1), 3.95, cz + s * (o / 2 + 0.1), 0.5, 0.66);
  },
  // a floating house: the lamp in its room, the lit doorway, the small lamp on the shrine shelf of its platform
  floating_house(el, H) {
    const [cx, cz] = el.c, y = el.y ?? -0.8, w = el.w ?? 4.4, d = el.d ?? 5.6, rot = el.rot ?? 0, deck = y + 0.28, hw = w / 2, hd = d / 2, c = Math.cos(rot), s = Math.sin(rot);
    if (hashAt(cx, cz, 5) > 0.65) return;
    const P = (u, v) => [cx + u * c + v * s, cz - u * s + v * c];
    const m = P(0, 0); H.ball(m[0], deck + 1.25, m[1], 0.6, 0.62);
    H.pane(P, -0.46, 0.46, -hd + 0.04, deck + 0.05, deck + 1.85, [-s, -c], 0.55);
    const l = P(-hw + 0.1, -hd - 1.75); H.ball(l[0], deck + 1.15, l[1], 0.26, 0.66);
  },
  // a floating shop: its lamp over the counter and the glow on the water before it
  floating_shop(el, H) {
    const [cx, cz] = el.c, y = el.y ?? -0.8, rot = el.rot ?? 0, deck = y + 0.28, c = Math.cos(rot), s = Math.sin(rot);
    const m = [cx + 0 * c + (el.d ?? 5.2) / 2 * 0.0 * s, cz]; void m;
    const hd = (el.d ?? 5.2) / 2, l = [cx + (hd - 0.6) * s, cz + (hd - 0.6) * c];
    H.ball(l[0], deck + 2.0, l[1], 0.55, 0.66);
    const w = [cx - (hd + 1.2) * s * 0 + 0, cz]; void w;
  },
  // a boat under an awning at night: the lamp hung from its mat, a share of them
  boat(el, H) {
    if (!(el.vendor || el.awning) || hashAt(el.at[0], el.at[1], 6) > 0.55) return;
    H.ball(el.at[0], (el.y ?? -0.8) + 1.15, el.at[1], 0.34, 0.6);
  },
};
const NEEDS_FLOOR = { thai_house: (el) => (el.kind === 'shop' ? 0.3 : undefined), wihan: (el) => (el.y ?? 0) + 1.2 };

let depth = 0;
/** Wrap one element builder: the halo of every light it adds, and its own extras. */
const wrap = (name, fn) => function haloed(el, ctx) {
  const lights = ctx?.lights, n = lights ? lights.length : 0;
  if (depth > 0 || !lights || el.simple) { depth++; try { return fn.call(this, el, ctx); } finally { depth--; } }
  depth++;
  let r; try { r = fn.call(this, el, ctx); } finally { depth--; }
  const H = new Halo(), ex = EXTRA[name] ? EXTRA[name](el, H) : undefined, floor = NEEDS_FLOOR[name] ? NEEDS_FLOOR[name](el) : undefined;
  if (ex !== false) for (const l of lights.slice(n)) lightHalo(H, l, name === 'thai_house' && el.kind !== 'shop' ? undefined : floor);
  H.flush(ctx.bag);
  return r;
};

let done = false;
/** Wraps the siamese style's elements that make lights (once, after the walk's wrapper). */
export function registerNight() {
  if (done) return; done = true;
  const E = STYLES.siamese.elements;
  for (const k of Object.keys(E)) if (typeof E[k] === 'function' && (EXTRA[k] || ['wihan', 'voc_lodge', 'voc_house', 'voc_shed', 'bell_tower', 'prasat', 'mandapa', 'cloister'].includes(k))) E[k] = wrap(k, E[k]);
}
registerNight();
