// Marinid Fez by night (docs/settlements/fez.md §16.3): the light of the lamps, the ovens and the lit rooms, readable at the low preset.
// The pattern is that of Suzhou's and Cairo's nightlight.js (copied and adapted, nothing imported from them): light ADDED over what is behind it, at night
// only, made of geometry in the engine's one additive material `halo` (palette.js, materials.js 'halo'): a glow round each flame (three crossed discs),
// a pool on the paving, a wash on the wall behind, the lamp-lit sheet in a cedar lattice. No light, no shadow, no collision. Everything is a function of
// the lamp's own place (a hash of x and z): no counters, no Math.random.
//
// Where the lights are is read from the buildings themselves wherever they have them: the houses, the madrasa, the Qarawiyyin, the funduq and the
// quarter mosque are run once into a recording bag, and the `lights` they push (the brass lamps of their rooms) and the lattice windows they build
// are the places lit. The door lamps of the houses (styles/marinid/house.js wallLamp), the lamps of the dukkans, the lanterns hung under the souks'
// roofs, the coppersmiths' braziers and the madrasa's court lamps are placed by the same rules their builders use. The lamps' bodies (the dukkan's, the souk's lantern) are in the builders.
//
// Budget: the halos go into night plans in 48 m tiles shown only within 55 m of the viewer (`near`), batched by the viewer with every other near tile,
// so the one `halo` material is one draw wherever a lit tile is shown and none where none is. No body is made here (a fine piece in a plan of its own is a
// detail mesh per material of its own); the lamps' bodies are in house.js and souk.js, whose plans have iron and bronze already.

import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';
import { STYLES } from '../../core/build.js';
import { RADIUS, SITES, SOUKS, ground0, siteY, height } from './layout.js';
import { houseList } from './houses.js';
import { planOf } from '../../styles/marinid/house.js';
import { frame } from '../../styles/mamluk/kit.js';
import '../../styles/marinid/index.js';
import bou from './plan.js';
import qar from './qar.js';

/** A number in [0, 1) from a position alone. */
export function hashAt(x, z, s = 0) {
  let h = (Math.round(x * 16) * 73856093) ^ (Math.round(z * 16) * 19349663) ^ Math.imul(s + 1, 83492791);
  h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
/** The share of the house doors whose lamp burns [inferred: a lamp at the door was a wealth, and a few kept it lit all night]. */
export const DOOR_LIT = 0.6;
/** The share of the dukkans with a lamp lit into the evening [inferred: the souks shut at dusk, the lanes' shops kept a lamp for the late buyers]. */
export const SHOP_LIT = 0.5;
/** The share of the houses whose lattice windows show a lamp behind them, and of the lattices lit in such a house [inferred]. */
export const WINDOW_HOUSES = 0.1, WINDOW_LIT = 0.45;

const TAU = Math.PI * 2, MAT = 'halo';
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
  /** A disc lying on a horizontal plane (the paving, a floor) at height y. */
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
  flush(bag) {
    if (!this.pos.length) return;
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute(this.pos, 3));
    g.setAttribute('normal', new Float32BufferAttribute(this.nor, 3));
    bag.add(MAT, g);
    this.pos = []; this.nor = [];
  }
}

// ── reading the buildings ──────────────────────────────────────────────────────────────────────────────
const nop = new Proxy(function () {}, { get: () => nop, apply: () => nop });
const SLAB = (g) => {
  const P = (g.index ? g.toNonIndexed() : g).attributes.position.array;
  const b = { x0: Infinity, y0: Infinity, z0: Infinity, x1: -Infinity, y1: -Infinity, z1: -Infinity };
  for (let i = 0; i < P.length; i += 3) { b.x0 = Math.min(b.x0, P[i]); b.x1 = Math.max(b.x1, P[i]); b.y0 = Math.min(b.y0, P[i + 1]); b.y1 = Math.max(b.y1, P[i + 1]); b.z0 = Math.min(b.z0, P[i + 2]); b.z1 = Math.max(b.z1, P[i + 2]); }
  return b;
};
/** Runs an element of the style into a recording bag: the lights it pushes and (with `panes`) the slabs of its lattice windows. */
function record(el, panes = false) {
  const lights = [], slabs = [];
  const bag = {
    add(mat, g) {
      if (!panes || mat !== 'lattice' || !g?.attributes?.position) return;
      const b = SLAB(g), dx = b.x1 - b.x0, dz = b.z1 - b.z0, th = Math.min(dx, dz), w = Math.max(dx, dz), dy = b.y1 - b.y0;
      if (th <= 0.06 && w >= 0.55 && w <= 1.4 && dy >= 0.9 && dy <= 2.0) slabs.push(b);
    },
    addInstance() {}, get() { return nop; },
  };
  try { STYLES.marinid.elements[el.t](el, { bag, col: nop, lights }); } catch (e) { /* an element that fails to build has no lights */ }
  return { lights, slabs };
}

// ── where the lamps are ────────────────────────────────────────────────────────────────────────────────
// { k: 'door' | 'shop' | 'oven' | 'souk' | 'brazier' | 'court' | 'room' | 'chandelier', x, y, z, n: [x, z] (outward), ... }
const cx = (r) => (r[0] + r[2]) / 2, cz = (r) => (r[1] + r[3]) / 2;

/** The lamps bracketed beside the house doors: where wallLamp (marinid/front.js) is put by house.js (a gap between the door and the dukkans' bays). */
export function doorLamps() {
  const out = [];
  for (const h of houseList()) {
    const P = planOf(h), fr = frame(h.rect, h.door);
    const uB = P.ud + P.dw / 2, uA = P.ud - P.dw / 2, uL = uB + 0.55 < P.Lw - 0.3 ? uB + 0.55 : uA - 0.55;
    if (P.bays.some((b) => uL > b.u0 - 0.3 && uL < b.u1 + 0.3)) continue;
    const [x, z] = fr.P(uL, 0.28), [fx, fz] = fr.P(uL, 0.95), n = fr.N;
    out.push({ k: 'door', x, z, y: h.y + 2.21, fx, fz, gy: height(fx, fz), n: [n[0], n[1]], lit: hashAt(x, z, 5) < DOOR_LIT });
  }
  return out;
}
/** The dukkans' lamps: one hung in the cell of each dukkan (lit on a share; the bakers' ovens always), as the cell's own light into the lane. */
export function shopLamps() {
  const out = [];
  for (const h of houseList()) {
    if (!h.shops) continue;
    const P = planOf(h), fr = frame(h.rect, h.door);
    for (const b of P.bays) {
      const um = (b.u0 + b.u1) / 2, oven = b.trade === 'bread', [x, z] = fr.P(um, oven ? -0.9 : -0.55), [fx, fz] = fr.P(um, 1.0), n = fr.N;
      out.push({ k: oven ? 'oven' : 'shop', x, z, y: h.y + (oven ? 0.8 : 2.0), fx, fz, gy: height(fx, fz), n: [n[0], n[1]], lit: oven || hashAt(x, z, 7) < SHOP_LIT });
    }
  }
  return out;
}
/** The lanterns hung under the roofs of the covered souks, every 9 m along the middle, from the beams (marinid/souk.js: the roof is 4.7 m over the lane). */
export function soukLamps() {
  const out = [];
  for (const s of SOUKS) {
    const [ax, az] = s.a, [bx, bz] = s.b, alongX = Math.abs(az - bz) < 0.1, L = Math.hypot(bx - ax, bz - az), y0 = ground0(ax, az), slope = (ground0(bx, bz) - y0) / L;
    for (let t = 6; t < L - 4; t += 9) {
      const x = alongX ? ax + t : ax, z = alongX ? az : az + t;
      if (s.gaps?.some(([g0, g1]) => (alongX ? x : z) > g0 - 1 && (alongX ? x : z) < g1 + 1)) continue;
      out.push({ k: 'souk', x, z, y: y0 + slope * t + 4.0, gy: y0 + slope * t, n: [0, 0], lit: true });
    }
  }
  return out;
}
/** The coppersmiths' braziers of the Place Seffarine (marinid/souk.js square: F.brazier before every second shop, either side). */
export function brazierLamps() {
  const [x0, z0, x1, z1] = SITES.seffarine, y = ground0(102, 39) + 0.05, out = [], sw = 2.7;
  for (let z = z0 + 4.2; z + sw < z1 - 1; z += sw * 2) for (const [x, dir] of [[x0 + 1.0, 1], [x1 - 1.0, -1]]) out.push({ k: 'brazier', x: x + dir * 1.0, z: z + 0.9, y, gy: y, n: [0, 0], lit: true });
  return out;
}
/** The brass lamps hung from the lintels of the madrasa's galleries (marinid/court.js; no light of their own there, so placed by its numbers). */
export function courtLamps() {
  const [x0, z0, x1, z1] = SITES.bou, y = siteY('bou'), t = 1.0, G = 2.4, R = 5.4, zN = z0 + 8.0, cz0 = zN + G, cz1 = z1 - 9.6 - 0.7, gx0 = x0 + t + R, gx1 = x1 - t - R;
  const zm = (cz0 + cz1) / 2, mx = (x0 + x1) / 2, out = [], at = (x, z) => out.push({ k: 'court', x, z, y: y + 2.92, gy: y, n: [0, 0], lit: true });
  for (const dx of [-9, -3, 3, 9]) at(mx + dx, zN + 1.2);
  for (const dz of [-6, 0, 6]) { at(gx0 + 1.2, zm + dz); at(gx1 - 1.2, zm + dz); }
  return out;
}

/** The lights the buildings push (rooms' brass lamps, chandeliers) and the lattice windows of the houses nearest the viewer's first walk. */
export function readBuildings() {
  const lamps = [], panes = [];
  const lampOf = (at, base, big = false, upper = false) => ({ k: big ? 'chandelier' : 'room', x: at[0], y: at[1], z: at[2], gy: base, n: [0, 0], lit: true, big, upper });
  // the landmarks and the civic buildings
  const civic = [...bou.elements.filter((e) => ['bou_inania', 'fez_darmagana'].includes(e.t)), ...qar.elements,
    { t: 'fez_funduq', rect: SITES.funduq, y: siteY('funduq'), seed: 31 }, { t: 'fez_mosque', rect: SITES.mosque, y: siteY('mosque') }];
  for (const el of civic) for (const l of record(el).lights) lamps.push(lampOf(l.at, el.y, l.intensity >= 3.5, l.at[1] - el.y > 5));
  // the open houses' brass lamps (the salon's, the side rooms'): placed by the plan's numbers as house.js hangs them; the ten with an open upper floor
  // are read from their own build, as are the lattice windows of the share of houses whose windows are lit
  for (const h of houseList()) {
    const wh = hashAt(cx(h.rect), cz(h.rect), 41) < WINDOW_HOUSES;
    if (h.open && !h.up) {
      const P = planOf(h), fr = frame(h.rect, h.door);
      if (P.Dc1 - P.Dc0 < 3) continue;
      for (const q of P.rooms) { const [x, z] = fr.P((q.u0 + q.u1) / 2, -(q.d0 + q.d1) / 2); lamps.push(lampOf([x, h.y + 2.64, z], h.y)); }
      if (P.Dp - P.t - P.Dc1 >= 3.0) { const [x, z] = fr.P((P.cu0 + P.cu1) / 2, -(P.Dc1 + P.Dp - P.t - 0.05) / 2); lamps.push(lampOf([x, h.y + 2.64, z], h.y)); }
    }
    if (!h.up && !(wh && !h.open)) continue;
    const { lights, slabs } = record(h, true);
    for (const l of lights) lamps.push(lampOf(l.at, h.y, false, l.at[1] - h.y > 4.2));
    for (const b of slabs) {
      const x = (b.x0 + b.x1) / 2, z = (b.z0 + b.z1) / 2;
      if (hashAt(x, z, 11) >= (wh ? WINDOW_LIT : 0.3)) continue;
      panes.push({ b, f: 0.42 + 0.36 * hashAt(x, z, 23) });
    }
  }
  return { lamps, panes };
}

// ── building a lamp ────────────────────────────────────────────────────────────────────────────────────────
/** The light of a lamp into `H` (the bodies are the buildings' own: a body made here would be a detail mesh of its own in every night tile). */
function addLamp(H, l) {
  const { x, y, z } = l;
  if (l.k === 'door') {
    // (the lamp itself is the house's; only its light is made here)
    if (!l.lit) return;
    H.ball(x + l.n[0] * 0.05, y + 0.02, z + l.n[1] * 0.05, 0.6);
    H.floor(l.fx, l.gy + 0.05, l.fz, 1.5, 1.5, 0, 8, 0.7);
    H.wall(x - l.n[0] * 0.27 + l.n[0] * 0.04, y - 0.1, z - l.n[1] * 0.27 + l.n[1] * 0.04, l.n, 1.0, 0.9, 8, 0.55);
  } else if (l.k === 'shop' || l.k === 'oven') {
    const oven = l.k === 'oven';
    // (the lamp's body is the house's: marinid/house.js hangs it in the cell)
    if (!l.lit) return;
    H.ball(x, y + (oven ? 0.1 : 0.06), z, oven ? 0.95 : 0.65);
    H.floor(l.fx, l.gy + 0.05, l.fz, oven ? 2.3 : 1.5, oven ? 2.3 : 1.5, 0, 8, oven ? 0.85 : 0.65);
  } else if (l.k === 'souk') {
    // (the lantern's body is the souk's: marinid/souk.js hangs it from the beam)
    H.ball(x, y + 0.08, z, 1.0);
    H.floor(x, l.gy + 0.05, z, 2.2, 2.2, 0, 8, 0.75);
  } else if (l.k === 'brazier') {
    H.ball(x, y + 0.4, z, 0.75);
    H.floor(x, y + 0.03, z, 2.0, 2.0, 0, 8, 0.85);
  } else if (l.k === 'court') {
    H.ball(x, y, z, 0.8);
    H.floor(x, l.gy + 0.03, z, 2.0, 2.0, 0, 8, 0.45);
  } else if (l.k === 'room' || l.k === 'chandelier') {
    H.ball(x, y, z, l.big ? 1.5 : 0.9);
    if (!l.upper) H.floor(x, l.gy + 0.04, z, l.big ? 3.2 : 1.9, l.big ? 3.2 : 1.9, 0, 8, l.big ? 0.5 : 0.4);
  }
}

/** fez_night: { list: [lamps], panes: [{ b, f }] }: the light of a tile, in the plan's bag. */
function fezNight(el, { bag }) {
  const H = new Halo();
  for (const l of el.list) addLamp(H, l);
  for (const p of el.panes || []) {
    const { b } = p, thinX = b.x1 - b.x0 < b.z1 - b.z0, m = 0.035, y0 = b.y0 + m, y1 = b.y1 - m;
    if (thinX) { const z0 = b.z0 + m, z1 = b.z1 - m; for (const [x, nx] of [[b.x1 + 0.03, 1], [b.x0 - 0.03, -1]]) H.quad([x, y0, z0], [x, y0, z1], [x, y1, z1], [x, y1, z0], [nx, 0], p.f); }
    else { const x0 = b.x0 + m, x1 = b.x1 - m; for (const [zz, nz] of [[b.z1 + 0.03, 1], [b.z0 - 0.03, -1]]) H.quad([x0, y0, zz], [x1, y0, zz], [x1, y1, zz], [x0, y1, zz], [0, nz], p.f); }
  }
  H.flush(bag);
}
STYLES.marinid.elements.fez_night = fezNight;

// ── the night plans: 48 m tiles, shown within 55 m ─────────────────────────────────────────────────────────
export const NIGHT_TILE = 48, NIGHT_NEAR = 55;
let TILES = null;
/** Everything lit, as the tiles' elements: [{ id, center, el }]. */
export function nightTiles() {
  if (TILES) return TILES;
  const { lamps: bl, panes } = readBuildings();
  const lamps = [...doorLamps(), ...shopLamps(), ...soukLamps(), ...brazierLamps(), ...courtLamps(), ...bl];
  const m = new Map(), at = (x, z) => { const k = Math.floor(x / NIGHT_TILE) + ',' + Math.floor(z / NIGHT_TILE); let t = m.get(k); if (!t) m.set(k, (t = { k, list: [], panes: [] })); return t; };
  for (const l of lamps) if (Math.hypot(l.x, l.z) < RADIUS - 14 && (l.lit !== false)) at(l.x, l.z).list.push(l);
  for (const p of panes) { const x = (p.b.x0 + p.b.x1) / 2, z = (p.b.z0 + p.b.z1) / 2; if (Math.hypot(x, z) < RADIUS - 14) at(x, z).panes.push(p); }
  return (TILES = [...m.values()].map((t) => { const [i, j] = t.k.split(',').map(Number); return { id: t.k, center: [i * NIGHT_TILE + NIGHT_TILE / 2, j * NIGHT_TILE + NIGHT_TILE / 2], el: { t: 'fez_night', list: t.list, panes: t.panes } }; }));
}
