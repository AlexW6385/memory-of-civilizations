// Bhaktapur by night: the light the lamps and the lit rooms throw (docs/settlements/bhaktapur.md §17). The flames of the style (`flame`: the diyas on the
// Nyatapola's treads, the niche lamps, the sanctum's lamps) glow of themselves; what they lack, where the pool of real lights is off (the low preset),
// is the light they give the things round them. Here it is made of geometry in the engine's one additive material `halo` (palette.js, materials.js
// 'halo'): light ADDED over what is behind it, at night only, with no light, no shadow and no collision. The pattern is that of Suzhou's nightlight.js,
// copied and adapted (nothing imported from it): a glow round each flame (three crossed discs), a pool on the brick, the spill of an open shop front across its
// step, the wash of a niche lamp on the wall, a sheet over the lattice of a window with a lamp behind it. Every piece is a `bhaktapur_halo` element of the
// street life, so that the whole town's halo is one merged mesh (one draw) and is drawn within 60 m of the eye. Everything is a function of the lamp's own
// place or the lot's seed: no counters, no Math.random. The lit windows come from a replay of the house builder (the lattices it makes, collected in
// `el.__win`), so that each pane sits on a real window.

import { BufferGeometry, Float32BufferAttribute, Matrix4, Quaternion, Vector3 } from '../../core/three.js';
import { placeHanging } from '../../core/geom.js';
import { STYLES } from '../../core/build.js';
import '../../objects/index.js';
import { assembly } from '../../objects/kit.js';
import { hipRoof } from '../../styles/newar/index.js';
import { houseParts } from '../../styles/newar/house.js';
import { offeringLamps } from '../../styles/newar/dress.js';
import { lots, waysides, HOUSE, SHI, CHAITYA, PATI, BHA, NYA, NYATAPOLA, fp } from './layout.js';
import { openedLots } from './upstairs.js';
import { POT_KILNS } from './plan.js';

/** A number in [0, 1) from a position alone. */
export function hashAt(x, z, s = 0) {
  let h = (Math.round(x * 16) * 73856093) ^ (Math.round(z * 16) * 19349663) ^ Math.imul(s + 1, 83492791);
  h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
/** The share of the open shop-houses still open into the evening, their lamp lit [inferred: shops in the valley's towns kept to dusk and a little beyond]. */
export const SHOP_LIT = 0.6;
/** The share of the dwellings' low doors with the hearth's or a lamp's light spilling from them. */
export const HOME_LIT = 0.35;
/** The share of the rooms (a storey of a house) with a lamp lit behind their lattice; the kitchens under the roof more. */
export const ROOM_LIT = 0.3, KITCHEN_LIT = 0.55;
/** Windows are lit within this distance of the square (m): beyond it the houses are far and dark at a glance. */
const WIN_REACH = 105;

const TAU = Math.PI * 2, MAT = 'halo', HALO_REACH = 60;
/** Triangles (position and a normal per corner) of the halo material (the normal's y is the brightness, 1 at a disc's middle, 0 at its rim). */
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
  /** A disc lying on a horizontal plane at height y. */
  floor(x, y, z, r, rz = r, yaw = 0, segs = 8, k = 1) {
    const s = Math.sin(yaw), c = Math.cos(yaw);
    this.disc([x, y, z], [c, 0, -s], [s, 0, c], r, rz, null, segs, [k, 0.42 * k, 0], [0, 0.5, 1]);
  }
  /** A disc standing on a wall at (x, y, z), the wall's outward normal nh = [x, z]; rw wide and rh high (semi-axes). */
  wall(x, y, z, nh, rw, rh, segs = 8, k = 1) {
    this.disc([x, y, z], [-nh[1], 0, nh[0]], [0, 1, 0], rw, rh, nh, segs, [0.9 * k, 0], [0, 1]);
  }
  /** The glow round a flame at (x, y, z), radius r: three upright discs crossed at 60 degrees. */
  ball(x, y, z, r) {
    for (let k = 0; k < 3; k++) { const a = k * Math.PI / 3, c = Math.cos(a), s = Math.sin(a); this.disc([x, y, z], [c, 0, s], [0, 1, 0], r, r, [-s, c], 8, [0.62, 0], [0, 1]); }
  }
  /** A flat sheet (a window's lamp-lit lattice) of brightness f, facing n = [x, z] (both faces are seen). */
  quad(a, b, c, d, n, f) {
    const q = Math.sqrt(1 - f * f), N = [n[0] * q, f, n[1] * q];
    this.tri(a, N, b, N, c, N); this.tri(a, N, c, N, d, N);
  }
}

// ── the units: built at the lamp's foot (the origin), +z outward from the wall behind (at −z) ───────────────
function unitOf(kind, w = 1, h = 1, f = 0.55) {
  return assembly(`bhk-halo|${kind}|${w}|${h}|${f}`, (a) => {
    const H = new Halo();
    if (kind === 'door') { H.ball(0, 1.45, -0.9, 0.95); H.floor(0, 0.07, 1.3, 1.9, 1.5, 0, 10, 0.85); H.floor(0, 0.07, -1.2, 1.5, 1.3, 0, 8, 0.7); }   // an open front: the lamp within, the spill across the step, the lit floor inside
    else if (kind === 'niche') { H.ball(0, 0, 0.12, 0.5); H.wall(0, 0, -0.02, [0, 1], 0.62, 0.55, 8, 0.7); H.floor(0, -1.3, 0.55, 0.95, 0.95, 0, 8, 0.6); }   // a lamp in a wall niche, 1.3 m up
    else if (kind === 'diya') { H.ball(0, 0.09, 0, 0.3); H.floor(0, 0.025, 0, 0.55, 0.55, 0, 6, 0.8); }
    else if (kind === 'lamp') { H.ball(0, 0, 0, 0.9); H.floor(0, -1.9, 0, 2.0, 2.0, 0, 8, 0.75); }       // a lamp hung under a roof, 1.9 m up
    else if (kind === 'kiln') { H.ball(0, 0.7, 0, 1.3); H.floor(0, 0.04, 0, 3.0, 3.0, 0, 8, 0.85); }
    else if (kind === 'sanctum') { H.ball(0, 1.3, -1.5, 1.4); H.floor(0, 0.04, 0.45, 1.0, 1.4, 0, 8, 0.8); H.floor(0, 0.04, -1.6, 1.9, 1.9, 0, 8, 0.8); }   // the door of the sanctum (the lamps within; the porch is narrow)
    else if (kind === 'pane') { H.quad([-w / 2, 0, 0], [w / 2, 0, 0], [w / 2, h, 0], [-w / 2, h, 0], [0, 1], f); }
    const g = new BufferGeometry(); g.setAttribute('position', new Float32BufferAttribute(H.pos, 3)); g.setAttribute('normal', new Float32BufferAttribute(H.nor, 3)); a(MAT, g);
  });
}
/** bhaktapur_halo { kind, at, y, rot (+z outward), w, h, f (a pane's size and strength) }: one piece of lamp light, instanced like the lamps themselves. */
function bhaktapurHalo(el, { bag }) {
  const U = unitOf(el.kind, el.w, el.h, el.f), [x, z] = el.at;
  const M = new Matrix4().compose(new Vector3(x, el.y ?? 0, z), new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), el.rot ?? 0), new Vector3(1, 1, 1));
  for (const [mat, g] of Object.entries(U)) { if (bag.addInstance) bag.addInstance(mat, g.clone(), M, { reach: HALO_REACH }); else bag.add(mat, placeHanging(g.clone(), M)); }
}

// ── where the light is ──────────────────────────────────────────────────────────────────────────────────────────
const OUT = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] };
/** The rotation about y that turns the unit's +z to a lot front's outward. */
const outRot = (f) => Math.atan2(OUT[f][0], OUT[f][1]);
const dimsOf = (l) => (l.front === 'n' || l.front === 's' ? [l.rect[2] - l.rect[0], l.rect[3] - l.rect[1]] : [l.rect[3] - l.rect[1], l.rect[2] - l.rect[0]]);
const ctr = (l) => [(l.rect[0] + l.rect[2]) / 2, (l.rect[1] + l.rect[3]) / 2];
const STOREY = [2.9, 2.4, 2.25, 2.1];

/** The windows of a lot as the builder makes them: [{ lx, y, w, h, storey }], by a replay of the house builder with a spy in place of its bag (cached per lot). */
const WINS = new Map();
function windowsOf(el) {
  const key = el.rect.join(',');
  if (WINS.has(key)) return WINS.get(key);
  const spy = new Proxy({}, { get: () => () => {} });
  const rec = { ...el, t: 'newar_house', __win: [] };
  try { houseParts(rec, { bag: spy, col: spy, lights: [] }, { hipRoof }); } catch { rec.__win = []; }
  const n = el.n ?? 3, Y = [0]; for (let i = 0; i < n; i++) Y.push(Y[i] + STOREY[i]);
  const out = rec.__win.map(([lx, y, w, h]) => { let s = 0; for (let i = 0; i < n; i++) if (Y[i] <= y + 0.05) s = i; return { lx, y, w, h, storey: s }; });
  WINS.set(key, out);
  return out;
}

/** The street life's elements for the night: every halo of the town and the temples. */
export function nightElements() {
  openedLots();
  const out = [], put = (kind, at, y, rot, o = {}) => out.push({ t: 'bhaktapur_halo', kind, at, y, rot, ...o });
  const all = [{ ...HOUSE, open: true, detail: 2, seed: 77, light: true, trade: 'home', shop: false, dx: 4.5, pid: false, floors: true, balcony: true, home: false }, ...lots().filter((l) => !l.use)];
  for (const l of all) {
    const [cx, cz] = ctr(l), d = Math.hypot(cx, cz);
    if (d > WIN_REACH + 20) continue;
    const [W] = dimsOf(l), rot = outRot(l.front), seed = l.seed ?? 0;
    // the door: an open front lit (shops by their share, dwellings by theirs) and the lamp niche of a closed one
    if (l.open) {
      const share = l.home ? HOME_LIT : SHOP_LIT;
      if (l.light !== false && hashAt(cx, cz, 5) < share) {
        const T = 0.55, home = !!l.door, OW = home ? 1.3 : Math.min(4.6, W - 2.4), ox = home ? Math.max(T + 0.45, Math.min(l.dpos ?? 1.2, W - T - 3.65 - OW)) : (W - OW) / 2;
        put('door', fp(l, ox + OW / 2, -0.1), 0, rot);
      }
    } else if (!l.shop && (l.detail ?? 0) > 1 && hashAt(cx, cz, 6) < 0.7) {
      put('niche', fp(l, (l.dx ?? W / 2) + 1.5, -0.1), 1.28, rot);
    }
    if (!l.open && W > 7 && ((seed || 1) * 40503 >>> 0) % 100 < 28 && hashAt(cx, cz, 8) < 0.8) put('niche', fp(l, W - 0.6, -0.1), 1.4, rot);
    // the lit rooms: a pane on each lattice of a storey whose lamp is lit (the whole storey's windows together)
    if (d > WIN_REACH) continue;
    const n = l.n ?? 3, litSt = (s) => hashAt(cx, cz, 20 + s) < (s === n - 1 && n > 2 ? KITCHEN_LIT : ROOM_LIT);
    if (![1, 2, 3].some((s) => s < n && litSt(s))) continue;           // (no lit room: the builder is not replayed)
    for (const w of windowsOf(l)) {
      if (w.storey < 1 || !litSt(w.storey)) continue;                  // the ground floor's lattices (the shop-front) are lit by their door
      const kitchen = w.storey === n - 1 && n > 2;
      const wr = Math.round(w.w * 20) / 20, hr = Math.round(w.h * 20) / 20, f = kitchen ? 0.7 : 0.5, c = fp(l, w.lx + w.w / 2, -0.115);
      put('pane', c, w.y, rot, { w: wr, h: hr, f });
    }
  }
  // the temples: the Nyatapola's rows of oil lamps and the tray at its door (the stream of newar_offerings), the Bhairabnath's sanctum and its tridents' lamps
  for (const [x, y, z] of offeringLamps({ pagoda: NYATAPOLA, seed: 11 })) put('diya', [x, z], y, 0);
  put('sanctum', [BHA.c[0] - 3.3, BHA.c[1]], 2.7, -Math.PI / 2);
  // the stone shrine, the chaitya, the pati (a lamp hung under its roof at the bhajan), the kilns' mouths, the vermilion stones at the crossings
  put('diya', [SHI.c[0] + 1.6, SHI.c[1] + 0.4], 0.5, 0); put('diya', [CHAITYA.c[0] + 0.6, CHAITYA.c[1] + 0.9], 0.45, 0);
  put('lamp', [(PATI[0] + PATI[2]) / 2, (PATI[1] + PATI[3]) / 2], 2.6, 0);
  for (const [x, z] of POT_KILNS) put('kiln', [x, z + 1.2], 0, 0);
  for (const [x, z, type] of waysides()) if (type === 0 && hashAt(x, z, 3) < 0.85) put('diya', [x - 0.27, z + 0.12], 0.55, 0);
  void NYA;
  return out;
}

/** Register the street life's halo element. */
export function registerNight() { if (STYLES.life) STYLES.life.elements.bhaktapur_halo = bhaktapurHalo; }
registerNight();
