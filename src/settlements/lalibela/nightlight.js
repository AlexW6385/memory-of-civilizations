// Lalibela c. 1220 by night (docs/settlements/lalibela.md §19): what lit the churches and the village, and the light it throws. Lamps of clay with a cotton or
// fibre wick in butter or oil, the hearth's embers glowing through the low door, braziers at the church doors where the pilgrims keep the night's vigil, lamps in the
// niches the masons cut in the trench walls. Everything is the `halo` material (light ADDED at night only; no light, no shadow, no collision), so the day is unchanged
// and it reads at the low preset. Every zagwe element that puts a light into its plan is wrapped from here (the style files stay as they were); each light is a
// function of its own place (no counters, no Math.random). The method is the Suzhou reference's; nothing of Suzhou's is imported.
import '../../styles/zagwe/index.js';
import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';
import { lathe, box } from '../../core/geom.js';
import { STYLES } from '../../core/build.js';
import { stallFrame } from '../../styles/zagwe/stall.js';

export function hashAt(x, z, s = 0) {
  let h = (Math.round(x * 16) * 73856093) ^ (Math.round(z * 16) * 19349663) ^ Math.imul(s + 1, 83492791);
  h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
const TAU = Math.PI * 2, MAT = 'halo';
/** Triangles of the halo material; brightness is the normal's y (1 at a disc's middle, 0 at its rim). */
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
  floor(x, y, z, r, rz = r, segs = 8, k = 1) { this.disc([x, y, z], [1, 0, 0], [0, 0, 1], r, rz, null, segs, [k, 0.42 * k, 0]); }
  ball(x, y, z, r, k = 0.62) {
    for (let i = 0; i < 3; i++) { const a = i * Math.PI / 3 + 0.37, c = Math.cos(a), s = Math.sin(a); this.disc([x, y, z], [c, 0, s], [0, 1, 0], r, r, [-s, c], 8, [k, 0], [0, 1]); }
  }
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

let depth = 0;
/** Wrap one element builder: the halo of every light it adds, then `extra(el, H)` (the glow of what the element shows without a light). */
const wrap = (fn, extra) => function haloed(el, ctx) {
  const lights = ctx?.lights, n = lights ? lights.length : 0;
  if (depth > 0 || !lights || el.simple) { depth++; try { return fn.call(this, el, ctx); } finally { depth--; } }
  depth++;
  try { var r = fn.call(this, el, ctx); } finally { depth--; }
  const H = new Halo();
  for (const l of lights.slice(n)) lightHalo(H, l, el.y ?? undefined);
  if (extra) extra(el, H);
  H.flush(ctx.bag);
  return r;
};
/** The frame of a round house: P(side, d) with d from the middle toward the door. */
const frame = (el) => { const da = el.door ?? Math.PI, n = [Math.cos(da), Math.sin(da)], t = [-n[1], n[0]], mir = (el.seed || 7) & 1 ? -1 : 1; return (sx, sd) => [el.c[0] + n[0] * sd + t[0] * sx * mir, el.c[1] + n[1] * sd + t[1] * sx * mir]; };

/** The embers of the hearth glowing through the low door of an opened house, and the light spilling over its threshold. */
function hutGlow(el, H) {
  const W = frame(el), y = el.y ?? 0, r = el.r ?? 3.8, [hx, hz] = W(0, 1.15), [dx, dz] = W(0, r + 0.5);
  H.ball(hx, y + 0.5, hz, 0.7, 0.55); H.floor(hx, y + 0.08, hz, 1.5, 1.5, 8, 0.7);
  H.floor(dx, y + 0.06, dz, 1.9, 1.5, 8, 0.6);
}
/** The door of a closed house: in a share of them (by the hash of its place) a glimmer of the fire inside and its spill on the step. */
function tukulGlow(el, H) {
  if (hashAt(el.c[0], el.c[1], 11) > 0.4) return;
  const da = el.door ?? Math.PI, y = el.y ?? 0, r = el.r ?? 3, [x, z] = [el.c[0] + Math.cos(da) * (r + 0.4), el.c[1] + Math.sin(da) * (r + 0.4)];
  H.ball(x, y + 0.9, z, 0.45, 0.5); H.floor(x + Math.cos(da) * 0.5, y + 0.05, z + Math.sin(da) * 0.5, 1.4, 1.1, 8, 0.55);
}
/** A lamp in a niche cut in a trench wall (the masons left them for lamps): a small flame in the pointed arch. */
function nicheGlow(el, H) {
  if (el.floor !== -99) return;
  const [x, z] = el.c, n = el.n ?? [0, 1];
  H.ball(x + n[0] * 0.15, el.y + 0.25, z + n[1] * 0.15, 0.4, 0.6);
}

/** The lamp on a candle seller's counter (it has no engine light: a light would make a flame mesh of its plan, a draw): its glow and the pool on the counter. */
function stallGlow(el, H) {
  if (el.kind !== 'candles') return;
  const [lx, lz] = stallFrame(el).P(-0.1, -0.35), y = (el.y ?? 0) + 0.87;
  H.ball(lx, y + 0.18, lz, 0.55, 0.6); H.floor(lx, y + 0.02, lz, 0.9, 0.9, 8, 0.6);
}
/** lal_brazier: { at: [x, z], y } — a clay-and-iron bowl on a tripod with embers and a flame, where the pilgrims keep the vigil at a church door. */
function brazier({ at, y = 0 }, { bag, col, lights }) {
  const [x, z] = at, q = hashAt(x, z, 5), s = 0.9 + 0.2 * q;
  bag.add('iron', lathe([[0.001, 0.62 * s], [0.22 * s, 0.62 * s], [0.34 * s, 0.82 * s], [0.31 * s, 0.84 * s], [0.2 * s, 0.7 * s], [0.001, 0.68 * s]], 10, null, x, y, z));
  for (let k = 0; k < 3; k++) { const a = k * TAU / 3 + q; bag.add('iron', lathe([[0.001, 0], [0.025, 0], [0.022, 0.64 * s], [0.001, 0.66 * s]], 5, null, x + Math.cos(a) * 0.17, y, z + Math.sin(a) * 0.17)); }
  bag.add('hide_grey', lathe([[0.001, 0.8 * s], [0.28 * s, 0.8 * s], [0.001, 0.82 * s]], 8, null, x, y, z));          // the embers (their glow is the halo)
  col.circle(x, z, 0.36, y, y + 0.85);
  const l = { at: [x, y + 1.1 * s, z], color: '#ffb468', intensity: 3.0, distance: 10 };
  lights.push(l);
  const H = new Halo(); lightHalo(H, l, y); H.flush(bag);
}

/** lal_glow: { houses: [{ c, door, r, seed, y, enter }] } — the glow of every house's door, in ONE element of the churches' plan so that the whole village's halo is a single mesh. */
function glow({ houses }, { bag }) {
  const H = new Halo();
  for (const h of houses) (h.enter ? hutGlow : tukulGlow)(h, H);
  H.flush(bag);
}

/** lal_winglow: { wins: [{ c: [x, z], n: [nx, nz], u: [ux, uz], y (sill), w, h }] } — the lamps and candles within seen through the pierced windows of a church:
 *  a warm halo in the opening (brightest in the middle), a softer ball just inside, and the spill on the sill's outer ledge. One halo mesh per plan. */
function winGlow({ wins }, { bag }) {
  const H = new Halo();
  for (const q of wins) {
    const k = 0.75 + 0.25 * hashAt(q.c[0], q.c[1], 31), yc = q.y + q.h / 2, o = 0.32;
    const c = [q.c[0] + q.n[0] * o, yc, q.c[1] + q.n[1] * o];
    H.disc(c, [q.u[0], 0, q.u[1]], [0, 1, 0], q.w * 1.5, q.h * 0.95, q.n, 8, [k, 0.55 * k, 0], [0, 0.55, 1]);
    H.ball(q.c[0] - q.n[0] * 0.5, yc, q.c[1] - q.n[1] * 0.5, Math.min(q.w, q.h) * 0.8, 0.5 * k);
  }
  H.flush(bag);
}
let done = false;
export function registerNight() {
  if (done) return; done = true;
  const E = STYLES.zagwe.elements;
  for (const k of ['lamp', 'aksumite']) E[k] = wrap(E[k]);
  E.pilgrim_stall = wrap(E.pilgrim_stall, stallGlow);
  E.cave = wrap(E.cave, nicheGlow);
  E.lal_brazier = brazier; E.lal_glow = glow; E.lal_winglow = winGlow;
}
registerNight();
void box;
