// Dunhuang c. 850 by night — what lit the town and the caves, and the light it throws (docs/settlements/dunhuang.md §15.2).
// Oil lamps of bronze and clay (sesame and other seed oils, tallow), the hearth and the kang's stove glowing through a door, paper lanterns
// at the shop fronts, the watch's braziers at the gate, the signal hearth on the beacon, the lamps of the caves seen through their doors.
// Everything here is geometry in one material, `halo` (palette.js 'halo'): light ADDED over what is behind it, at night only, with no light, no
// shadow and no collision, so the day view is unchanged and the real pools of light (off at the low preset) are not needed. The shape of each piece
// is carried by its normals (y: 1 at a disc's middle, 0 at its rim). Every element of the dunhuang style that puts a light into its plan is wrapped
// here (the style files stay as they were); the windows glow by the hash of their own place; each light is a function of its own place (no counters,
// no Math.random). The method is that of the Suzhou reference; nothing of Suzhou's is imported.
import '../../styles/dunhuang/index.js';
import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';
import { lathe } from '../../core/geom.js';
import { STYLES } from '../../core/build.js';
import { frame } from '../../styles/dunhuang/town.js';
import { doorU } from '../../styles/dunhuang/homes.js';
import { XF, FLOOR, CAVES, GATE, rng } from './layout.js';

/** A number in [0, 1) from a position alone. */
export function hashAt(x, z, s = 0) {
  let h = (Math.round(x * 16) * 73856093) ^ (Math.round(z * 16) * 19349663) ^ Math.imul(s + 1, 83492791);
  h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

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
  /** A flat sheet (a lit window or doorway) of brightness f, facing n = [x, z]. */
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
  if (floor !== undefined && y - floor < 3.0 && y - floor > 0.2) H.floor(x, floor + 0.03, z, Math.max(1.3, Math.min(3.4, d * 0.42)), Math.max(1.3, Math.min(3.4, d * 0.42)), 10, 0.8);
}

const bounds = (g) => {
  const P = g.attributes.position.array, b = [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity];
  for (let i = 0; i < P.length; i += 3) for (let k = 0; k < 3; k++) { if (P[i + k] < b[k]) b[k] = P[i + k]; if (P[i + k] > b[k + 3]) b[k + 3] = P[i + k]; }
  return b;
};

/**
 * Wrap a plan's bag so that what is lit shows: the lattice windows (a slab under 0.1 m thick, 0.6–1.3 m high, in a wall's plane) glow with the lamp behind them in
 * `share` of the cases (by the hash of the window's own place: oil is dear), on the outward face; the paper lantern at a shop front (`lamp_paper`) glows;
 * `top` (beacon) a bowl of iron high on a tower glows as the signal hearth of the watch. Returns { ctx, H, finish }.
 */
function lit(ctx, el, share, top = false) {
  const H = new Halo(), real = ctx.bag, [x0, z0, x1, z1] = el.rect ?? [0, 0, 0, 0], cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  const bag = new Proxy(real, {
    get(t, k) {
      if (k === 'add') return (mat, g, ...r) => {
        if (g?.attributes?.position) {
          if (mat === 'lattice') {
            const b = bounds(g), dx = b[3] - b[0], dz = b[5] - b[2], dy = b[4] - b[1], th = Math.min(dx, dz), w = Math.max(dx, dz);
            if (th < 0.1 && dy > 0.55 && dy < 1.3 && w > 0.5 && w < 1.3 && b[1] > 0.8) {
              const mx = (b[0] + b[3]) / 2, mz = (b[2] + b[5]) / 2;
              if (hashAt(mx, mz, 31 + Math.floor(b[1] / 2.5)) < share) {
                const f = 0.42 + 0.35 * hashAt(mx, mz, 7), m = 0.03, o = 0.012;
                if (dx < dz) { const s = mx > cx ? 1 : -1, x = (s > 0 ? b[3] : b[0]) + s * o; H.quad([x, b[1] + m, b[2] + m], [x, b[1] + m, b[5] - m], [x, b[4] - m, b[5] - m], [x, b[4] - m, b[2] + m], [s, 0], f); }
                else { const s = mz > cz ? 1 : -1, z = (s > 0 ? b[5] : b[2]) + s * o; H.quad([b[0] + m, b[1] + m, z], [b[3] - m, b[1] + m, z], [b[3] - m, b[4] - m, z], [b[0] + m, b[4] - m, z], [0, s], f); }
              }
            }
          } else if (mat === 'lamp_paper') {
            const b = bounds(g), mx = (b[0] + b[3]) / 2, mz = (b[2] + b[5]) / 2;
            if (hashAt(mx, mz, 11) < 0.7) { H.ball(mx, (b[1] + b[4]) / 2, mz, 0.5, 0.6); H.floor(mx, 0.04, mz, 1.5, 1.5, 8, 0.45); }
          } else if (top && mat === 'iron') {
            const b = bounds(g);
            if (b[1] > 5 && b[3] - b[0] > 1) { const mx = (b[0] + b[3]) / 2, mz = (b[2] + b[5]) / 2; H.ball(mx, b[4] + 0.45, mz, 1.15, 0.7); H.ball(mx, b[4] + 0.2, mz, 0.6, 0.75); }
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

/** The lit doorways of the enterable caves (a lamp burns in each: the hall caves and pillar caves richer than the monks' cells), on the plane of the cliff's face, and the pools they throw on the apron's stone. */
function caveGlows(H) {
  for (const c of CAVES) {
    if (!['hall', 'pillar', 'cell'].includes(c.kind)) continue;
    const y = FLOOR[c.tier], z = c.z, k = c.kind === 'cell' ? 0.36 : 0.55, hh = c.kind === 'cell' ? 2.2 : 2.5, x = XF + 0.135, f = k + 0.12 * hashAt(c.z, c.tier, 3);
    H.quad([x, y + 0.08, z - 0.92], [x, y + 0.08, z + 0.92], [x, y + hh, z + 0.92], [x, y + hh, z - 0.92], [1, 0], f);
    if (c.tier <= 1) H.floor(XF + 1.5, y + 0.03, z, 1.7, 1.2, 8, 0.4);
  }
}

let depth = 0;
const FLOORS = FLOOR;
/** Wrap one element builder: the halo of every light it adds, the lit windows, the spill of a door, and the lights of the places the style does not light by itself. */
const wrap = (name, fn) => function haloed(el, ctx) {
  const lights = ctx?.lights, n = lights ? lights.length : 0;
  if (depth > 0 || !lights || el.simple) { depth++; try { return fn.call(this, el, ctx); } finally { depth--; } }
  const house = name === 'dh_house', L = house || name === 'dh_beacon' ? lit(ctx, el, el.tiled ? 0.55 : 0.35, name === 'dh_beacon') : null;
  depth++;
  try { var r = fn.call(this, el, L ? L.ctx : ctx); } finally { depth--; }
  const H = L ? L.H : new Halo(), cliff = name === 'dh_cliff';
  for (const l of lights.slice(n)) {
    const fl = cliff ? FLOORS.reduce((a, f) => (f <= l.at[1] - 0.2 ? f : a), undefined) : house ? 0.08 : l.at[1] < 2.2 ? 0.045 : undefined;
    lightHalo(H, l, fl);
  }
  if (house) {
    // the door: some lamps spill light over the step (a shop's lamp is out at the counter, a home's door is ajar on the lamp's side)
    const f = frame(el.rect, el.front), W = f.W, du = doorU(W, !!el.trade, rng((el.seed || 1) * 7 + 3)()), [px, pz] = f.P(du, -1.1);
    if (hashAt(px, pz, 5) < (el.trade ? 0.55 : 0.3)) H.floor(px, 0.06, pz, 2.2, 1.6, 8, 0.6);
  }
  if (cliff) caveGlows(H);
  if (name === 'dh_gate') { const [cx, cz] = el.at ?? [GATE.x, GATE.z]; H.ball(cx - 3.2, 3.5, cz, 0.6, 0.6); H.floor(cx - 3.2, 0.075, cz, 3.2, 2.6, 10, 0.5); }
  if (name === 'dh_serai') { const gx = (el.x0 + el.x1) / 2; H.ball(gx, 3.3, el.z0 + 1.7, 0.6, 0.6); H.floor(gx, 0.075, el.z0 + 1.7, 3.0, 2.4, 10, 0.5); H.ball(gx, 1.1, (el.z0 + el.z1) / 2 + 2.5, 0.5, 0.5); }
  H.flush(ctx.bag);
  return r;
};

/**
 * dh_lamprow { at: [x, z], y, n, dz }: small clay lamp dishes in a row on the apron before the Great Buddha's hall, each with its flame (lamp offerings:
 * lighting lamps before the Buddha is a rite of the Buddhist laity [inferred; the manuscripts of Dunhuang record lamp-lighting rites on the fifteenth of
 * the first month: not checked here]). No two dishes alike (a shape repeated twelve times would be an instanced draw of its own).
 */
function lamprow({ at, y = 0, n = 9, dz = 1.5 }, { bag, lights }) {
  const [x, z] = at, H = new Halo();
  for (let i = 0; i < n; i++) {
    const zz = z + (i - (n - 1) / 2) * dz, q = hashAt(x, zz, 2), r = 0.07 + 0.025 * q, xx = x + (hashAt(x, zz, 3) - 0.5) * 0.3;
    bag.add('pottery_dark', lathe([[0.001, 0], [r, 0], [r * 1.25, 0.025], [r * 1.1, 0.05], [r * 0.8, 0.045], [0.001, 0.03]], 8, null, xx, y, zz));
    bag.add('flame', lathe([[0.001, 0], [0.012 * (0.8 + 0.4 * q), 0.012], [0.001, 0.05 + 0.03 * q]], 5, null, xx, y + 0.045, zz));
    if (hashAt(x, zz, 4) < 0.85) { H.ball(xx, y + 0.12, zz, 0.28, 0.5); if (i % 3 === 1) H.floor(xx, y + 0.02, zz, 0.9, 0.9, 7, 0.45); }
  }
  void lights;
  H.flush(bag);
}

let done = false;
/** Wraps the dunhuang style's elements that make lights (once, after every file of the style has registered its own). */
export function registerNight() {
  if (done) return; done = true;
  const E = STYLES.dunhuang.elements;
  for (const k of Object.keys(E)) if (typeof E[k] === 'function' && /^(dh_|hall|great)/.test(k) && !['dh_clear_track', 'dh_lamprow'].includes(k)) E[k] = wrap(k, E[k]);
  E.dh_lamprow = lamprow;
}
registerNight();
