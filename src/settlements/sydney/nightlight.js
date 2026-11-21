// Sydney by night, 1973 (docs/settlements/sydney.md §13): the electric light of the street and the shops, made of geometry in the
// engine's one `halo` material (palette.js, materials.js 'halo': light ADDED over what is behind it, at night only, no light, no
// shadow, no collision), as Ming Suzhou's lanterns and New York's windows are (ming-suzhou/nightlight.js, new-york/nightlight.js; `Halo`
// here is a copy of theirs). It shows at the low preset, where the pool of real lamps is off. The halo has one warm colour, so the
// mercury-vapour white of the cobra-head lamps and the tungsten of the shop windows are not told apart [inferred: a glow, not a measure].
// What is lit, and where, is read off the builders' own numbers (lots(), streets(), sceneLife(), styles/modern shops.js and rocks.js),
// so a glow is on a window that is there. One plan, always shown, one draw; kept under the merge's cell limit (80 000 triangles).
// Pure functions of places: no counters, no Math.random.
import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';
import { registerStyle } from '../../core/build.js';
import { MATERIALS } from '../../core/palette.js';
import { frame } from '../../styles/modern/rooms.js';
import { KINDS } from '../../styles/modern/shops.js';
import { shopGeom, layoutRooms } from '../../styles/modern/upper.js';
import { RADIUS, LEVEL, BRIDGE, QUAY, height, lots } from './layout.js';
import { streets } from './street.js';
import { sceneLife } from './scene.js';

const TAU = Math.PI * 2;
/** A number in [0, 1) from numbers alone. */
export function hashAt(x, z, s = 0) {
  let h = (Math.round(x * 16) * 73856093) ^ (Math.round(z * 16) * 19349663) ^ Math.imul(s + 1, 83492791);
  h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
const smooth = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

/** Triangles (position and a normal per corner) of the halo material (a copy of Ming Suzhou's `Halo`). */
export class Halo {
  constructor() { this.pos = []; this.nor = []; }
  get tris() { return this.pos.length / 9; }
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
  /** A pool of light on the paving (a disc lying at height y); yaw turns its first semi-axis r from +x toward −z. */
  floor(x, y, z, r, rz = r, yaw = 0, segs = 8, k = 1) {
    const s = Math.sin(yaw), c = Math.cos(yaw);
    this.disc([x, y, z], [c, 0, -s], [s, 0, c], r, rz, null, segs, [k, 0.42 * k, 0], [0, 0.5, 1]);
  }
  /** The glow round a lamp: three upright discs crossed at 60 degrees. */
  ball(x, y, z, r, k = 0.62) {
    for (let j = 0; j < 3; j++) { const a = j * Math.PI / 3, c = Math.cos(a), s = Math.sin(a); this.disc([x, y, z], [c, 0, s], [0, 1, 0], r, r, [-s, c], 6, [k, 0], [0, 1]); }
  }
  /** A flat sheet a b c d of brightness f (0…1) facing n = [x, z] (both faces are seen): a lit window. */
  quad(a, b, c, d, n, f) {
    const q = Math.sqrt(1 - f * f), N = [n[0] * q, f, n[1] * q];
    this.tri(a, N, b, N, c, N); this.tri(a, N, c, N, d, N);
  }
  geometry() { const g = new BufferGeometry(); g.setAttribute('position', new Float32BufferAttribute(this.pos, 3)); g.setAttribute('normal', new Float32BufferAttribute(this.nor, 3)); return g; }
}

const OPEN_EVE = { pub: 0.85, milkbar: 0.78, espresso: 0.85, fish_chips: 0.8 };
const ARR = [222, -116], POINTS = [[222, -116], [100, -110], [0, 0], [-190, -40], [60, 40]];
const nearest = (x, z) => Math.min(...POINTS.map(([a, b]) => Math.hypot(x - a, z - b)));
const OUT = { n: [0, -1], s: [0, 1], w: [-1, 0], e: [1, 0] };

/** The cobra-head lamps of the roads (the street kit's 'cobra': the head 2.6 m out from the pole at 8.5 m), the Rocks' park-type lamp standards, the lamps of the Point, the Garden and the forecourt. */
function lamps(H) {
  const { tiles } = streets();
  for (const t of tiles.values()) {
    for (const e of t.kit) {
      if (e.kind !== 'cobra') continue;
      const s = Math.sin(e.rot), c = Math.cos(e.rot), x = e.at[0] + 2.6 * s, z = e.at[1] + 2.6 * c, g = height(x, z);
      H.ball(x, e.y + 8.2, z, 1.5, 0.66); H.floor(x, g + 0.08, z, 8, 8, 0, 10, 0.78);
    }
    for (const e of t.items) if (e.k === 'lampost') { H.ball(e.at[0], e.y + 3.9, e.at[1], 0.9, 0.6); H.floor(e.at[0], e.y + 0.08, e.at[1], 3.2, 3.2, 0, 8, 0.7); }
  }
  for (const e of sceneLife()) if (e.t === 'street_lamp') { H.ball(e.at[0], e.y + (e.h ?? 4.5) + 0.3, e.at[1], 1.0, 0.6); H.floor(e.at[0], e.y + 0.08, e.at[1], 3.8, 3.8, 0, 8, 0.7); }
}

/** The shops one can enter (the eight near the arrival and the eight of the streets): the plate glass lit, the door's spill on the footpath, the pool before the window. */
function shops(H) {
  for (const l of lots()) {
    if ((l.t !== 'shop_room' && l.t !== 'espresso_bar') || l.front == null) continue;
    const f = l.front, K = KINDS[l.kind] ?? KINDS.newsagent, { L, Dp, W } = frame(l.rect, f), F = l.y + 0.12, fy1 = F + 2.7, n = OUT[f];
    const dw = 1.2, du = l.t === 'espresso_bar' ? L * 0.62 : L * K.door + (K.door > 0.4 ? 0 : 0.3);
    // (the hotel, the milk bar, the espresso bar and the fish-and-chip shop are open in the evening; the other trades shut at about half past five, their window lights left dim: Thursday night trading to 9 pm began only as a Christmas measure in 1971)
    const k = (OPEN_EVE[l.t === 'espresso_bar' ? 'espresso' : l.kind] ?? 0.26) * (0.85 + 0.3 * hashAt(l.rect[0], l.rect[1], 51));
    // the glass in its panes as the shop front's aluminium frames divide it (styles/modern/shops.js `front`): a mullion's gap between them,
    // the shelves' band below the transom dimmer than the ceiling lamps' band above it
    const sheet = (a, b) => {
      if (b - a < 0.3) return;
      const np = Math.max(1, Math.round((b - a) / 1.4)), pw = (b - a) / np, ft = F + 1.95;
      for (let i = 0; i < np; i++) {
        const u0 = a + i * pw + 0.05, u1 = a + (i + 1) * pw - 0.05, q = (y0, y1, kk) => H.quad(W(u0, -0.14, y0), W(u1, -0.14, y0), W(u1, -0.14, y1), W(u0, -0.14, y1), n, Math.min(0.95, kk));
        q(F + 0.65, ft - 0.04, k * 0.85); q(ft + 0.04, fy1 - 0.05, k * 1.12);
      }
    };
    sheet(0.45, du - dw / 2); sheet(du + dw / 2, L - 0.45);
    // the fascia's board lit from the shop's tubes under the awning, the lettering catching it
    H.quad(W(0.55, -0.1, fy1 + 0.1), W(L - 0.55, -0.1, fy1 + 0.1), W(L - 0.55, -0.1, F + K.H1 - 0.06), W(0.55, -0.1, F + K.H1 - 0.06), n, Math.min(0.5, 0.18 + k * 0.4));
    // the flat over the shop (the shops whose upper floor is open): a lit window or two behind the curtains, by the rooms' own places
    if (l.up) {
      const G = shopGeom(L, Dp, F, K.H1, 0.3);
      for (const rm of layoutRooms(G, l.t === 'espresso_bar' ? 'espresso' : l.kind)) {
        if (rm.zone !== 'front') continue;
        const w = rm.rect[1] - rm.rect[0], nW = Math.max(1, Math.floor(w / 2.2));
        for (let j = 0; j < nW; j++) {
          const uc = rm.rect[0] + w * (j + 0.5) / nW, door = rm.door === j;
          if (hashAt(uc + l.rect[0], l.rect[1] + l.rect[2], 71) > 0.62) continue;
          const ya = G.Y + (door ? 0.05 : 0.9), yb = G.Y + (door ? 2.3 : 2.6), kk = 0.34 + 0.3 * hashAt(uc, l.rect[1], 72);
          H.quad(W(uc - 0.5, 0.2, ya), W(uc + 0.5, 0.2, ya), W(uc + 0.5, 0.2, yb), W(uc - 0.5, 0.2, yb), n, kk);
        }
      }
    }
    // the open door: the room's light on the step and the footpath; the pools of the two windows
    const gy = l.gy ?? l.y, p = W(du, -1.0, 0);
    H.floor(p[0], gy + 0.1, p[2], 2.2, 2.6, 0, 8, 0.85);
    for (const [a, b] of [[0.45, du - dw / 2], [du + dw / 2, L - 0.45]]) if (b - a > 1) { const q = W((a + b) / 2, -1.6, 0); H.floor(q[0], gy + 0.1, q[2], Math.min((b - a) * 0.7, 4.2), 3.0, f === 'n' || f === 's' ? 0 : Math.PI / 2, 8, 0.6 * k); }
  }
}

/** The tenants' terrace houses one can enter (rocks.js: the open door 1 m wide at 0.35 m from the house's left, the ground-floor window 1.1 m wide beside it, the two upper windows): the passage's light, the front room's lamp behind the curtain, a bedroom light upstairs in the four open houses. */
function terraces(H) {
  for (const l of lots()) {
    if (l.t !== 'rocks_terrace' || l.enter !== 0) continue;
    const f = l.front, { L, W } = frame(l.rect, f), n = OUT[f], nn = Math.max(1, Math.round(L / 4.6)), fw = L / nn, y = l.y;
    const H1 = 3.5, k = 0.45 + 0.3 * hashAt(l.rect[0], l.rect[1], 61);
    const quad = (a, b, y0, y1, d, kk) => H.quad(W(a, d, y0), W(b, d, y0), W(b, d, y1), W(a, d, y1), n, kk);
    quad(0.4, 1.3, y + 0.55, y + 2.7, 0.2, 0.55);                                             // the passage, seen through the open door
    if (hashAt(l.rect[0], l.rect[1], 62) < 0.8) quad(fw - 1.65, fw - 0.65, y + 1.35, y + 3.05, -0.05, k);   // the front room's window
    if (l.up) for (const [a, b] of [[0.6, 1.6], [fw - 1.6, fw - 0.6]]) if (hashAt(a + l.rect[0], l.rect[1], 63) < 0.55) quad(a + 0.05, b - 0.05, y + 0.5 + H1 + 0.15, y + 0.5 + H1 + 2.4, -0.05, 0.4);
    const p = W(0.85, -1.0, 0), gy = l.gy ?? y;
    H.floor(p[0], gy + 0.08, p[2], 1.4, 1.6, 0, 8, 0.7);
    const q = W(fw - 1.1, -1.4, 0); H.floor(q[0], gy + 0.08, q[2], 1.6, 1.4, 0, 8, 0.45 * k);
  }
}

/** The offices' and blocks' windows above the street: the facade shader's grid (windows `wu` of a bay wide, `wv` of a storey high, centred 0.55 up), a share of them lit. */
function windows(H, budget) {
  const rects = lots().filter((l) => !l.t && l.shops).map((l) => ({ rect: l.rect, y: l.y, h: l.h, mat: l.mat, shops: l.shops }));
  rects.push({ rect: [-30, 40, 10, 66], y: height(-10, 53), h: 117, mat: 'facade_glass', shops: 'nsew' });         // the AMP Building
  rects.sort((p, q) => nearest((p.rect[0] + p.rect[2]) / 2, (p.rect[1] + p.rect[3]) / 2) - nearest((q.rect[0] + q.rect[2]) / 2, (q.rect[1] + q.rect[3]) / 2));
  for (const l of rects) {
    const [x0, z0, x1, z1] = l.rect, d0 = nearest((x0 + x1) / 2, (z0 + z1) / 2), spec = MATERIALS[l.mat];
    if (!spec || spec.kind !== 'facade') continue;
    const share = (l.mat === 'facade_glass' ? 0.34 : 0.2) * (1 - smooth(200, 440, d0));
    if (share < 0.01 || H.tris > budget) continue;
    const bay = spec.bay ?? 1.6, st = spec.storey ?? 3.6, hw = (spec.wu ?? 0.55) * bay / 2, hh = (spec.wv ?? 0.6) * st / 2;
    const top = l.y + (l.h >= 70 ? 25 : Math.min(l.h, 70) - 1.8);
    for (const f of l.shops) {
      const along = f === 'n' || f === 's', n = OUT[f], o = f === 'n' ? z0 : f === 's' ? z1 : f === 'w' ? x0 : x1, lo = along ? x0 : z0, hi = along ? x1 : z1;
      const P = (u, yy) => (along ? [u, yy, o + n[1] * 0.04] : [o + n[0] * 0.04, yy, u]);
      for (let kk = Math.ceil(lo / bay - 0.5); (kk + 0.5) * bay < hi; kk++) {
        const uc = (kk + 0.5) * bay; if (uc - hw < lo + 0.3 || uc + hw > hi - 0.3) continue;
        for (let j = Math.ceil((l.y + 4.6) / st - 0.55); (j + 0.55) * st + hh < top; j++) {
          if (hashAt(uc, (j + 0.55) * st, 41 + (along ? 0 : 1)) > share) continue;
          const vc = (j + 0.55) * st, fb = 0.36 + 0.4 * hashAt(uc, vc, 43);
          H.quad(P(uc - hw, vc - hh), P(uc + hw, vc - hh), P(uc + hw, vc + hh), P(uc - hw, vc + hh), n, fb);
        }
      }
    }
  }
}

/** The harbour: the Bridge's deck lamps both sides, the Cahill Expressway's, the quay's promenade and the wharves' sheds. */
function harbour(H) {
  const bx = BRIDGE.x, hwid = BRIDGE.w / 2 + 0.3;
  for (let z = BRIDGE.z0 + 10; z < BRIDGE.z1 + BRIDGE.approach - 10; z += 20) for (const sx of [-1, 1]) {
    H.ball(bx + sx * hwid, BRIDGE.deck + 5.2, z, 1.2, 0.62); H.floor(bx + sx * 5.5, BRIDGE.deck + 0.1, z, 4.5, 6.5, 0, 8, 0.55);
  }
  for (let x = QUAY[0] + 6; x < QUAY[2]; x += 16) { H.ball(x, 13 + 5.6, 16, 1.3, 0.64); H.floor(x, 13.1, 16, 5, 6, 0, 8, 0.6); }
  for (let x = -40; x <= 36; x += 13) { H.ball(x, height(x, -3) + 4.4, -4.2, 1.1, 0.62); H.floor(x, height(x, -3) + 0.08, -4, 4.2, 3.4, 0, 8, 0.7); }
  // the wharves' waiting sheds (styles/modern/wharf.js: walls 0.25 m, windows 1.6 m wide at 1.1 to 2.6 m up every 2.4 m from 1.5 m in, the gates at the north end, the way out at the south): the lit windows on both sides, the tubes' light on the floor, the doorways' spill
  for (const x of [-36, -18, 0, 18]) {
    const s0 = -8 - 12, s1 = -8 - 1.5, y = 1.2;
    for (let z = s0 + 1.5; z < s1 - 1; z += 2.4) for (const [xx, nx] of [[x - 4.2 - 0.02, -1], [x + 4.2 + 0.02, 1]]) H.quad([xx, y + 1.15, z - 0.75], [xx, y + 1.15, z + 0.75], [xx, y + 2.55, z + 0.75], [xx, y + 2.55, z - 0.75], [nx, 0], 0.58 + 0.2 * hashAt(x, z, 91));
    H.floor(x, y + 0.08, s0 - 1.6, 2.6, 2.4, 0, 8, 0.7); H.floor(x, y + 0.08, s1 + 1.2, 2.6, 1.8, 0, 8, 0.7);
    H.floor(x, y + 0.05, (s0 + s1) / 2, 3.2, 4.6, 0, 8, 0.5);
    H.floor(x - 5.9, y + 0.08, (s0 + s1) / 2, 1.8, 5, 0, 8, 0.42); H.floor(x + 5.9, y + 0.08, (s0 + s1) / 2, 1.8, 5, 0, 8, 0.42);
  }
  // the stands on the promenade, open of an evening: the kiosk's hatch, the flower seller's bulb, the pie cart's window
  for (const [kind, x] of [['news', -27], ['flowers', -9], ['pies', 9], ['news', 29]]) {
    const g = height(x, 0.2);
    if (kind === 'news') H.quad([x - 1.0, g + 1.1, -0.62], [x + 1.0, g + 1.1, -0.62], [x + 1.0, g + 1.95, -0.62], [x - 1.0, g + 1.95, -0.62], [0, -1], 0.55);
    else if (kind === 'flowers') { H.ball(x, g + 2.05, 0.7, 0.7, 0.6); }
    else H.quad([x - 1.0, g + 1.2, -0.02], [x + 1.0, g + 1.2, -0.02], [x + 1.0, g + 2.0, -0.02], [x - 1.0, g + 2.0, -0.02], [0, -1], 0.8);
    H.floor(x, g + 0.08, -1.2, 2.6, 2.0, 0, 8, kind === 'pies' ? 0.8 : 0.65);
  }
  for (const x of [-36, -18, 0, 18]) for (const z of [-15, -26, -40]) { H.ball(x, 1.2 + 3.1, z, 0.9, 0.58); H.floor(x, 1.3, z, 3.6, 3.6, 0, 8, 0.62); }
}

/** sydney_night: nothing but the plan's style hook; the light is made here from the places. */
function sydneyNight(el, { bag }) {
  const H = new Halo();
  lamps(H); shops(H); terraces(H); harbour(H);
  windows(H, 62000);
  if (H.pos.length) bag.add('halo', H.geometry());
}
registerStyle('sydney_night', { trim: () => {}, opening: () => {}, column: () => {}, elements: { sydney_night: sydneyNight }, objects: {} });

/** The night plan: always shown (one draw), all in the city's frame. */
export function nightPlan(base) {
  return { ...base('sydney-night', [{ t: 'sydney_night', seed: 1973 }]), style: 'sydney_night' };
}
void ARR; void LEVEL; void RADIUS;
