// Shang Yinxu, c. 1200 BC, by night — what burned and the light it threw (docs/settlements/shang-yinxu.md §10).
// The light of the time is fire: the hearth in every house and the hearths of the courtyards; the braziers of the diviners (the plastron is heated at a fire) and of the
// ancestral hall; the bronze tripod stands of the axis with their flames; the burnt offering (liao) stacked in the court; the crucible furnaces and the kiln of the
// foundry, which worked through the night. [inferred throughout from the dossier's own plans; no lamp is invented: the bronze lamp is a later thing.]
// Everything here is geometry in one material, `halo` (palette.js, materials.js 'halo'): light ADDED over what is behind it, at night only, with no light, no shadow and no
// collision, so the day view is unchanged and the glow reads at the low preset, where the pools of real light are off. The shape of each piece is carried by its normals
// (y: 1 at a disc's middle, 0 at its rim): a glow round each fire (three crossed discs), a pool on the floor, a sheet before a lit window or doorway. The elements of the
// `shang` style that make fire are wrapped here (the style files stay as they were, but for two hooks in houses.js that say where a window and a doorway are); a household
// is lit or dark by the hash of its own place. Each light is a function of its own place: no counters, no Math.random. The method is the Suzhou reference's, written for
// the fires of Yinxu; nothing of Suzhou's is imported.

import '../../styles/shang/index.js';
import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';
import { lathe, box } from '../../core/geom.js';
import { STYLES } from '../../core/build.js';
import { HOOK } from '../../styles/shang/houses.js';
import { TOMB, ARCHIVE, HALL, inRect } from './layout.js';

/** A number in [0, 1) from a position alone. */
export function hashAt(x, z, s = 0) {
  let h = (Math.round(x * 16) * 73856093) ^ (Math.round(z * 16) * 19349663) ^ Math.imul(s + 1, 83492791);
  h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

const TAU = Math.PI * 2;
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
  /** A flat sheet (a lit window or doorway) of brightness f, facing n = [x, z]. */
  quad(a, b, c, d, n, f) { const q = Math.sqrt(1 - f * f), N = [n[0] * q, f, n[1] * q]; this.tri(a, N, b, N, c, N); this.tri(a, N, c, N, d, N); }
  flush(bag) {
    if (!this.pos.length) return;
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute(this.pos, 3)); g.setAttribute('normal', new Float32BufferAttribute(this.nor, 3));
    bag.add('halo', g); this.pos = []; this.nor = [];
  }
}

const bounds = (g) => {
  const P = g.attributes.position.array, b = [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity];
  for (let i = 0; i < P.length; i += 3) for (let k = 0; k < 3; k++) { if (P[i + k] < b[k]) b[k] = P[i + k]; if (P[i + k] > b[k + 3]) b[k + 3] = P[i + k]; }
  return b;
};
const unit = (a, b) => { const x = b[0] - a[0], z = b[1] - a[1], l = Math.hypot(x, z) || 1; return [x / l, z / l]; };

/** The halo of one real light of a plan (`lights` entries: { at, distance, intensity }). */
function lightHalo(H, l, floor) {
  const [x, y, z] = l.at, d = l.distance ?? 6, k = Math.min(1, (l.intensity ?? 2) / 2.4);
  H.ball(x, y, z, Math.max(0.5, Math.min(1.0, d * 0.1)) * (0.8 + 0.2 * k), 0.6);
  if (floor !== undefined) H.floor(x, floor + 0.03, z, Math.max(1.5, Math.min(3.6, d * 0.4)), Math.max(1.5, Math.min(3.6, d * 0.4)), 10, 0.75);
}
/** The halo of one flame mesh (bounds b): a small fire (hearth, tripod, brazier) or a great one (a furnace's mouth), and the pool on the floor under it. */
function flameHalo(H, b, floor) {
  const x = (b[0] + b[3]) / 2, z = (b[2] + b[5]) / 2, h = b[4] - b[1], w = Math.max(b[3] - b[0], b[5] - b[2]), big = w > 0.4;
  H.ball(x, b[1] + h * 0.45, z, big ? 1.2 : 0.55 + h * 0.8, big ? 0.72 : 0.6);
  if (floor !== undefined) H.floor(x, floor + 0.03, z, big ? 2.8 : 1.4 + h * 2.2, big ? 2.8 : 1.4 + h * 2.2, 10, big ? 0.85 : 0.68);
}

// ── which household is lit tonight (the whole of a house: its hearth, windows and doorway) ──
const SHARE = { shang_court_house: 0.62, shang_pit_yard: 0.5, shang_row_house: 0.45, shang_workshop: 0.4 };
const mid = (r) => [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];
const litOf = (name, el) => { const c = mid(el.rect); return hashAt(c[0], c[1], 3) < SHARE[name] + (name === 'shang_workshop' && el.trade === 'pottery' ? 0.4 : 0); };
/** The floor under a fire: the ground, a platform's top, a room's floor. */
function floorOf(name, el, b) {
  const x = (b[0] + b[3]) / 2, z = (b[2] + b[5]) / 2;
  if (name === 'shang_hall') return inRect(el.plat, x, z) ? el.h : 0;
  if (name === 'shang_tomb') return inRect(TOMB.plat, x, z) ? TOMB.h : 0;
  if (name === 'shang_archive') return inRect(ARCHIVE.rect, x, z) ? ARCHIVE.h : 0;
  if (name === 'shang_court_house') return b[1] > 0.4 ? b[1] - 0.13 : Math.max(0, b[1] - 0.12);
  if (name === 'shang_pit_yard') return Math.max(0, b[1] - 0.12);
  return 0;
}

let depth = 0, cur = null;
/** Wrap one element builder: the halo of every fire it makes (flames, real lights), and for a house the lit windows and the light of its door. */
const wrap = (name, fn) => function haloed(el, ctx) {
  if (depth > 0 || el.simple || !ctx?.lights) { depth++; try { return fn.call(this, el, ctx); } finally { depth--; } }
  const house = SHARE[name] !== undefined, lit = house ? litOf(name, el) : true, n0 = ctx.lights.length, flames = [], H = new Halo();
  const bag = new Proxy(ctx.bag, {
    get(t, k) {
      if (k === 'add') return (mat, g, ...r) => { if (mat === 'flame' && g?.attributes?.position) flames.push(bounds(g)); return t.add(mat, g, ...r); };
      const v = t[k];
      return typeof v === 'function' ? v.bind(t) : v;
    },
  });
  const prev = cur; cur = { H, lit, el }; depth++;
  try { var r = fn.call(this, el, { ...ctx, bag }); } finally { depth--; cur = prev; }
  if (!lit) { ctx.lights.length = n0; return r; }
  const L = ctx.lights.slice(n0), spots = [];
  for (const l of L) { lightHalo(H, l, floorOf(name, el, [l.at[0], l.at[1] - 0.9, l.at[2], l.at[0], l.at[1], l.at[2]])); spots.push(l.at); }
  for (const b of flames) {
    const x = (b[0] + b[3]) / 2, z = (b[2] + b[5]) / 2;
    if (spots.some((p) => Math.hypot(p[0] - x, p[2] - z) < 1.3 && Math.abs(p[1] - b[1]) < 1.6)) continue;       // the real light's halo already stands there
    flameHalo(H, b, floorOf(name, el, b));
  }
  if (name === 'shang_foundry') H.ball(-62, 0.55, 138.4, 1.15, 0.78), H.floor(-62, 0.04, 139.6, 2.6, 2.2, 10, 0.8);           // the kiln's mouth (foundry.js: the mould kiln at (-62, 136))
  H.flush(ctx.bag);
  return r;
};

/** The hooks houses.js calls where it puts a window, a doorway or a kiln's mouth (local frame coordinates; the lit household only). */
HOOK.win = (F, a0, y0, b0, a1, y1) => {
  if (!cur || !cur.lit || !cur.el.rect) return;
  const am = (a0 + a1) / 2, p = F.P(am, b0), q = F.P(am, b0 - 1), n = unit(p, q), m = 0.05, o = 0.046;
  const kiln = cur.el.trade === 'pottery' && y0 < 0.2 && y1 - y0 > 0.6;
  const at = (a, y) => { const c = F.P(a, b0 - o); return [c[0], y, c[1]]; };
  cur.H.quad(at(a0 + m, y0 + m), at(a1 - m, y0 + m), at(a1 - m, y1 - m), at(a0 + m, y1 - m), n, kiln ? 0.82 : 0.34 + 0.3 * hashAt(p[0], p[1], 7));
  if (kiln) cur.H.floor(F.P(am, b0 - 0.9)[0], 0.04, F.P(am, b0 - 0.9)[1], 2.2, 1.7, 8, 0.7);
};
HOOK.door = (F, dc, b, y0, wid, ht, th) => {
  if (!cur || !cur.lit || !cur.el.rect) return;
  const a = F.P(dc - wid / 2 + 0.12, b + th * 0.5), c = F.P(dc + wid / 2 - 0.12, b + th * 0.5), p = F.P(dc, b), q = F.P(dc, b - 1), n = unit(p, q);
  cur.H.quad([a[0], y0 + 0.1, a[1]], [c[0], y0 + 0.1, c[1]], [c[0], y0 + ht - 0.15, c[1]], [a[0], y0 + ht - 0.15, a[1]], n, 0.4 + 0.2 * hashAt(p[0], p[1], 9));
  if (y0 === 0) { const o = F.P(dc, b - 1.0); cur.H.floor(o[0], 0.04, o[1], 1.7, 1.3, 8, 0.55); }
};

// ── the new fire: the burnt offering ──
/**
 * shang_liao: { at: [x, z], y? } — the stack of split billets in crossed layers stood beside the pits (court.js) burning for the burnt offering (liao): three tongues of flame
 * (present at night only: 'flame+night') over the stack, its glow, its pool on the court, a real light. A fire of the rite, lit at night [inferred].
 */
function liao({ at, y = 0 }, { bag, lights }) {
  const [x, z] = at, H = new Halo(), top = y + 1.05;
  for (let k = 0; k < 3; k++) { const a = k * 2.1 + hashAt(x, z, 2) * 3, dx = Math.cos(a) * 0.32, dz = Math.sin(a) * 0.32, s = 0.85 + 0.3 * hashAt(x + k, z, 4); bag.add('flame+night', lathe([[0.001, 0], [0.26 * s, 0.04], [0.2 * s, 0.4 * s], [0.001, 0.95 * s]], 7, null, x + dx, top - 0.02, z + dz)); }
  const l = { at: [x, top + 0.7, z], color: '#ff8a3c', intensity: 4.4, distance: 16 };
  lights.push(l);
  H.ball(x, top + 0.5, z, 1.5, 0.72); H.floor(x, y + 0.04, z, 4.4, 4.4, 12, 0.85);
  H.flush(bag);
}

/**
 * shang_watchfire: { at: [x, z] } — a fire of the night watch in a ring of stones on the rammed court (a small stack of billets, flames at night only, glow, pool, a real light).
 * The ring stands by day too; the keepers beside it are figures with nightKeep: 1 (town.js). [inferred: no source names a watch fire; fire is the only light of the time]
 */
function watchfire({ at, y = 0 }, { bag, lights }) {
  const [x, z] = at, H = new Halo();
  for (let k = 0; k < 12; k++) { const a = k / 12 * TAU + hashAt(x, z, 5), r = 0.5, s = 0.08 + 0.04 * hashAt(x + k, z, 6); bag.add('earth_wall', box(x + Math.cos(a) * r - s, y, z + Math.sin(a) * r - s, x + Math.cos(a) * r + s, y + 0.2 + 0.1 * hashAt(x, z + k, 8), z + Math.sin(a) * r + s)); }
  for (let k = 0; k < 3; k++) { const a = k * 2.1 + hashAt(x, z, 2) * 3, s = 0.8 + 0.3 * hashAt(x + k, z, 4); bag.add('flame+night', lathe([[0.001, 0], [0.17 * s, 0.05], [0.16 * s, 0.22 * s], [0.07 * s, 0.4 * s], [0.001, 0.5 * s]], 8, null, x + Math.cos(a) * 0.16, y + 0.12, z + Math.sin(a) * 0.16)); }
  lights.push({ at: [x, y + 1.1, z], color: '#ff8a3c', intensity: 3.2, distance: 13 });
  H.ball(x, y + 0.55, z, 1.1, 0.7); H.floor(x, y + 0.04, z, 3.6, 3.6, 12, 0.8);
  H.flush(bag);
}

let done = false;
/** Wraps the Shang style's fire-making elements (once, after every file of the style has registered its own). */
export function registerNight() {
  if (done) return; done = true;
  const E = STYLES.shang?.elements;
  if (!E) return;
  for (const k of ['shang_hall', 'shang_court', 'shang_tomb', 'shang_archive', 'shang_foundry', 'shang_court_house', 'shang_pit_yard', 'shang_row_house', 'shang_workshop']) if (typeof E[k] === 'function') E[k] = wrap(k, E[k]);
  E.shang_liao = liao;
  E.shang_watchfire = watchfire;
}
registerNight();
void HALL;
