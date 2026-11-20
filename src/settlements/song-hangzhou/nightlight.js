// Southern Song Lin'an by night: the light the lamps and the lit rooms throw (docs/settlements/song-hangzhou.md §31).
// The paper lanterns of the night markets, the lamp strings over the Imperial Way, the open shop fronts and the rooms behind
// their lattices are lit by geometry in the engine's `halo` material (palette.js; materials.js 'halo': light ADDED over what
// lies behind it, at night only, with no light, no shadow and no collision; invisible by day), so that they read at the low
// preset, where no pool of real lights is made. The pieces are the pattern of Suzhou's nightlight.js, copied and adapted
// (Suzhou's file is not imported: it carries Suzhou's layout): a glow round each lamp (three crossed discs), a pool on the
// paving, a wash on the wall behind, a ripple-broken streak on the canal and the lake, a sheet before the paper of a window.
// All of it goes into ONE static plan (`song-hangzhou-night`, one mesh of one material, one draw), made from the finished
// plans' own lamp elements by `nightPlan(plans)`; the lit windows are made by wrapping the town's own house builders.
// Everything is a function of a lamp's own place: no counters, no Math.random.

import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';
import { STYLES } from '../../core/build.js';
import { box, rod, lathe } from '../../core/geom.js';
import { LEVEL, CANAL, WALL, WEST_LAKE, PAGODA, RADIUS } from './layout.js';
import { shopFront } from './shops.js';

const TAU = Math.PI * 2;
const MAT = 'halo';
/** A number in [0, 1) from a position alone. */
export function hashAt(x, z, s = 0) {
  let h = (Math.round(x * 16) * 73856093) ^ (Math.round(z * 16) * 19349663) ^ Math.imul(s + 1, 83492791);
  h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

/** Triangles (position and a normal per corner) of the halo material; a corner's brightness is its normal's y (materials.js). */
export class Halo {
  constructor() { this.pos = []; this.nor = []; }
  tri(p0, n0, p1, n1, p2, n2) { this.pos.push(...p0, ...p1, ...p2); this.nor.push(...n0, ...n1, ...n2); }
  /** A flat disc (an ellipse) at c spanned by the unit axes U, V with semi-axes su, sv, in rings R of brightness F; nh: the horizontal part of the normals ([x, z], a wall's outward) or radial; sign −1: water. */
  disc(c, U, V, su, sv, nh = null, segs = 8, F = [1, 0.42, 0], R = [0, 0.5, 1], sign = 1) {
    const at = (r, k) => { const a = k / segs * TAU, u = Math.cos(a) * su * R[r], v = Math.sin(a) * sv * R[r]; return [c[0] + U[0] * u + V[0] * v, c[1] + U[1] * u + V[1] * v, c[2] + U[2] * u + V[2] * v]; };
    const nm = (r, k) => { const a = k / segs * TAU, f = F[r], q = Math.sqrt(1 - f * f); return nh ? [nh[0] * q, f * sign, nh[1] * q] : [Math.cos(a) * q, f * sign, Math.sin(a) * q]; };
    const n = R.length - 1;
    for (let k = 0; k < segs; k++) {
      this.tri(at(0, k), nm(0, k), at(1, k), nm(1, k), at(1, k + 1), nm(1, k + 1));
      for (let r = 1; r < n; r++) {
        this.tri(at(r, k), nm(r, k), at(r + 1, k), nm(r + 1, k), at(r + 1, k + 1), nm(r + 1, k + 1));
        this.tri(at(r, k), nm(r, k), at(r + 1, k + 1), nm(r + 1, k + 1), at(r, k + 1), nm(r, k + 1));
      }
    }
  }
  /** A disc lying on a horizontal plane at height y; water: the ripple-broken kind. */
  floor(x, y, z, r, rz = r, yaw = 0, segs = 8, water = false, k = 1) {
    const s = Math.sin(yaw), c = Math.cos(yaw);
    this.disc([x, y, z], [c, 0, -s], [s, 0, c], r, rz, null, segs, [k, 0.42 * k, 0], [0, 0.5, 1], water ? -1 : 1);
  }
  /** A disc standing on a wall at (x, y, z), the wall's outward normal nh = [x, z]; rw wide and rh high (semi-axes). */
  wall(x, y, z, nh, rw, rh, segs = 8, k = 1) {
    this.disc([x, y, z], [-nh[1], 0, nh[0]], [0, 1, 0], rw, rh, nh, segs, [0.9 * k, 0], [0, 1]);
  }
  /** The glow round a flame at (x, y, z), radius r: three upright discs crossed at 60 degrees. */
  ball(x, y, z, r, k = 0.62) {
    for (let j = 0; j < 3; j++) { const a = j * Math.PI / 3, c = Math.cos(a), s = Math.sin(a); this.disc([x, y, z], [c, 0, s], [0, 1, 0], r, r, [-s, c], 8, [k, 0], [0, 1]); }
  }
  /** A flat sheet (a window's lamp-lit paper) of brightness f (0..1), facing n = [x, z] (both faces are seen). */
  quad(a, b, c, d, n, f) {
    const q = Math.sqrt(1 - f * f), N = [n[0] * q, f, n[1] * q];
    this.tri(a, N, b, N, c, N); this.tri(a, N, c, N, d, N);
  }
  /** Into the bag, one geometry. */
  flush(bag) {
    if (!this.pos.length) return;
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute(this.pos, 3));
    g.setAttribute('normal', new Float32BufferAttribute(this.nor, 3));
    bag.add(MAT, g);
    this.pos = []; this.nor = [];
  }
}

/** The light of one lamp: its glow at height cy (the body), the pool on the ground gy under it, the wash on a wall `wall` = { n, d } behind it. */
export function lanternLight(H, x, z, cy, gy, s, wall = null, pool = 2.6) {
  H.ball(x, cy, z, 0.95 * s);
  H.floor(x, gy + 0.03, z, pool * s * 0.55, pool * s * 0.55, 0, 8, false, 0.8);
  if (wall) H.wall(x - wall.n[0] * wall.d, cy, z - wall.n[1] * wall.d, wall.n, 1.25 * s, 1.0 * s, 8, 0.6);
}

/** The waters a lamp's streak can lie on: the canal and the West Lake (rects [x0, z0, x1, z1] and the level). */
const WATERS = [[[CANAL.x0, CANAL.z0, CANAL.x1, WALL.z0 + 3], LEVEL.canal], [WEST_LAKE.rect, WEST_LAKE.level]];
/** The reflection streak at a lamp's own place, toward the nearest water within `reach` m. Returns whether one was laid. */
export function waterStreak(H, x, z, s = 1, reach = 7) {
  let best = null;
  for (const [[x0, z0, x1, z1], y] of WATERS) {
    const qx = Math.max(x0, Math.min(x, x1)), qz = Math.max(z0, Math.min(z, z1)), d = Math.hypot(qx - x, qz - z);
    if (d > 0.05 && d < reach && (!best || d < best.d)) best = { d, dx: (qx - x) / d, dz: (qz - z) / d, qx, qz, y };
  }
  if (!best) return false;
  const a = 2.1 * s;
  H.floor(best.qx + best.dx * (a + 0.15), best.y + 0.02, best.qz + best.dz * (a + 0.15), 0.62 * s, a, Math.atan2(best.dx, best.dz), 10, true);
  return true;
}

// ── the lamps of the town: what each element of the finished plans gives ────────────────────────────────────────────
const FR = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] };
/** The place at `off` m out from the middle of a lot's front edge (rect, front) and the outward unit vector. */
function frontPoint(rect, front, t = 0.5, off = 0) {
  const [x0, z0, x1, z1] = rect, n = FR[front], along = front === 'n' || front === 's';
  const p = along ? [x0 + (x1 - x0) * t, (front === 'n' ? z0 : z1) + n[1] * off] : [(front === 'e' ? x1 : x0) + n[0] * off, z0 + (z1 - z0) * t];
  return { p, n, L: along ? x1 - x0 : z1 - z0 };
}
const inDisc = (x, z) => Math.hypot(x, z) < RADIUS - 30;
/** A lamp's light by the kind of its element, into H (positions in the world; the plans' origin is the world's). */
function lampsOf(H, e) {
  const at = e.at;
  const rotated = (lx, lz, r) => [at[0] + lx * Math.cos(r) + lz * Math.sin(r), at[1] - lx * Math.sin(r) + lz * Math.cos(r)];
  if (e.t === 'hang_lantern' && at && inDisc(...at)) {
    // a lantern on a cord from an eave over a shop front: body 0.28 m under the cord's foot (objects hang_lantern, drop 0.35), the shop's wall behind it
    const gy = (e.y ?? 3) - 2.95, cy = (e.y ?? 3) - 0.63, [x, z] = at, r = e.rot ?? 0, n = [Math.sin(r), Math.cos(r)];
    lanternLight(H, x, z, cy, gy, 0.9, { n, d: 0.25 }, 2.3 / 0.9); waterStreak(H, x, z, 0.8, 7);
  } else if (e.t === 'lantern' && (e.kind === 'paper' || e.kind === 'white') && at && inDisc(...at)) {
    // a lantern on a post: the body 0.42 m out along +z of the element, h - 0.03 high
    const h = e.h ?? 2.2, [x, z] = rotated(0, 0.42, e.rot ?? 0);
    lanternLight(H, x, z, h - 0.03, e.y ?? 0, 0.9, null, 3.0 / 0.9); waterStreak(H, x, z, 0.8, 7);
  } else if (e.t === 'hz_street_set') {
    for (const it of e.items) {
      if (it.u !== 'lampstand' || !inDisc(...it.at)) continue;
      // four lanterns on a rail along z at 2.14 m; one glow for each pair, a long pool under them
      for (const lz of [-0.6, 0.6]) { const [x, z] = (() => { const r = it.rot ?? 0; return [it.at[0] + lz * Math.sin(r), it.at[1] + lz * Math.cos(r)]; })(); H.ball(x, (it.y ?? 0) + 2.14, z, 1.0); H.floor(x, (it.y ?? 0) + 0.03, z, 1.6, 1.6, 0, 8, false, 0.8); }
    }
  } else if (e.t === 'hz_span' && e.kind === 'lamps') {
    // the string of lanterns over the Way: odd stations of fourteen along the rope (wazi.js span: sag 0.35, top 5.4 up), the lantern's body 0.2 m under the rope
    const y = (e.y0 ?? 0) + (e.y ?? 5.4);
    for (let i = 1; i < 14; i += 2) { const t = i / 14, x = e.x0 + (e.x1 - e.x0) * t, ly = y - 0.35 * 4 * t * (1 - t) - 0.2; H.ball(x, ly, e.z, 0.95); H.floor(x, (e.y0 ?? 0) + 0.03, e.z, 1.7, 1.7, 0, 8, false, 0.55); }
  } else if (e.t === 'hz_fanggate' && at) {
    for (const s of [-1, 1]) lanternLight(H, at[0] + 0.45, at[1] + s * (3.7 - 0.7), (e.y ?? 0) + 3.2, e.y ?? 0, 1.1, null, 2.6);
  } else if (e.t === 'hz_shop' && at && inDisc(...at)) {
    // the standing lantern sign (lightbox, candle-lit: Sun Yang's signs, shops.js) and the wine houses' gate of coloured silk
    const F = shopFront(e), r = e.rot, c = Math.cos(r), s = Math.sin(r), loc = (lx, lz) => [at[0] + lx * c + lz * s, at[1] - lx * s + lz * c];
    if (F.lightbox) { const x = F.side * (e.L / 2 - 0.3), [wx, wz] = loc(x, 0.6); H.ball(wx, (e.y ?? 0) + 1.0, wz, 0.9); H.floor(wx, (e.y ?? 0) + 0.03, wz, 1.6, 1.6, 0, 8, false, 0.8); }
  }
}

// ── the open fronts: the lamp-light of a room across its doorstep, and the glow of the room through the door ──
function frontLight(H, e) {
  const { p, n, L } = frontPoint(e.rect, e.front || 's', 0.5, 0), y = e.y ?? 0;
  if (!inDisc(...p)) return;
  // (the share of the fronts that are lit, by the place's hash: the rest are dark rooms or shuttered)
  const kind = e.kind || 'shop', share = kind === 'winehouse' ? 1 : kind === 'teahouse' ? 0.9 : kind === 'house' ? 0 : 0.7;
  if (hashAt(p[0], p[1], 5) >= share) return;
  const hw = Math.min(L * 0.5, 4.2);
  // across the doorstep (the apron before the front) and, on the room's floor, a pool; the wash on the room's back, seen through the open front
  H.floor(p[0] + n[0] * 1.4, y + 0.08, p[1] + n[1] * 1.4, hw, 1.9, Math.atan2(n[0], n[1]) + Math.PI / 2, 10, false, 0.7);
  H.wall(p[0] - n[0] * 1.2, y + 1.9, p[1] - n[1] * 1.2, n, hw * 0.9, 1.1, 8, 0.55);
  H.floor(p[0] - n[0] * 2.5, y + 0.5, p[1] - n[1] * 2.5, hw * 0.8, 1.6, Math.atan2(n[0], n[1]) + Math.PI / 2, 8, false, 0.5);
}

// ── the pagoda and the temple by night ───────────────────────────────────────────────────────────────────────────
/** The Liuhe Pagoda was a navigational light (§1): lanterns on brackets at the gallery posts of the upper storeys, and its top storey lit. */
function pagodaLamps(H, bag, tiers, base) {
  const [cx, cz] = PAGODA.c, ang = (k) => Math.PI / 8 + k * Math.PI / 4;
  let y = PAGODA.y + base;
  tiers.forEach((t, i) => {
    if (i >= 1) for (const k of [1, 2]) {
      // the south corners' posts of the gallery (radius r + 2.4 at the corner), the bracket 2.6 m above the floor, the lantern out beyond
      const g = t.r + 2.4, a = ang(k), px = cx + Math.cos(a) * g, pz = cz + Math.sin(a) * g, ux = Math.cos(a), uz = Math.sin(a), lx = px + ux * 0.5, lz = pz + uz * 0.5, ly = y + 2.45;
      bag.add('iron', rod([px, y + 2.6, pz], [px + ux * 0.5, y + 2.6, pz + uz * 0.5], 0.015, 4));
      bag.add('lamp_paper', lathe([[0.06, 0], [0.14, 0.06], [0.16, 0.18], [0.14, 0.3], [0.06, 0.36], [0.001, 0.36]], 8, null, lx, ly + 0.0, lz));
      H.ball(lx, ly + 0.18, lz, 1.5); if (i > 4) H.ball(lx, ly + 0.18, lz, 2.2, 0.4);
    }
    y += t.h;
  });
  // the top storey's lamp, glowing through its lattice windows and doors (a beacon for the river's boats)
  const top = tiers[tiers.length - 1], yt = y - top.h;
  H.ball(cx, yt + top.h * 0.55, cz, 5.2, 0.5);
}

/**
 * The night plan: every lamp of the finished `plans` as halo geometry, and the lamps of the pagoda's galleries, in one
 * static plan (one mesh of one material). The element carries data only (the lamps' own elements, trimmed); the geometry
 * is made by its builder. `base(id, elements, style)` is the town's own plan maker.
 */
export function nightPlan(plans, base, pagoda) {
  const lamps = [], fronts = [], stones = [];
  const lampTypes = new Set(['hang_lantern', 'lantern', 'hz_span', 'hz_fanggate', 'hz_shop', 'hz_street_set']);
  for (const p of plans) {
    if (!p.elements) continue;
    for (const e of p.elements) {
      if (lampTypes.has(e.t)) {
        if (e.t === 'hz_street_set') { const items = e.items.filter((it) => it.u === 'lampstand').map(({ u, at, y, rot }) => ({ u, at, y, rot })); if (items.length) lamps.push({ t: e.t, items }); }
        else if (e.t === 'hz_shop') lamps.push({ t: e.t, at: e.at, y: e.y, rot: e.rot, L: e.L, trade: e.trade, seed: e.seed, imperial: e.imperial });
        else if (e.t === 'hz_span') { if (e.kind === 'lamps') lamps.push({ t: e.t, kind: e.kind, x0: e.x0, x1: e.x1, z: e.z, y: e.y, y0: e.y0 }); }
        else lamps.push({ t: e.t, at: e.at, y: e.y, rot: e.rot, kind: e.kind, h: e.h });
      } else if (e.t === 'hz_shell' || e.t === 'tea_house') fronts.push({ rect: e.rect, front: e.front, y: e.y, kind: e.kind || (e.t === 'tea_house' ? 'teahouse' : 'shop') });
      else if (e.t === 'stone_lamp' && e.at) stones.push([e.at[0] + (p.origin?.[0] ?? 0), e.at[1] + (p.origin?.[1] ?? 0), (e.y ?? 0) + (p.base ?? 0)]);
    }
  }
  return base('song-hangzhou-night', [{ t: 'hz_night', lamps, fronts, stones, tiers: pagoda.tiers, tbase: pagoda.base }]);
}

/** hz_night { lamps, fronts, stones, tiers, tbase }: the night plan's one element. */
function nightElement(el, { bag }) {
  const H = new Halo();
  for (const e of el.lamps) lampsOf(H, e);
  for (const e of el.fronts) frontLight(H, e);
  for (const [x, z, y] of el.stones) { H.ball(x, y + 1.35, z, 1.2); H.floor(x, y + 0.03, z, 1.6, 1.6, 0, 8, false, 0.7); }
  pagodaLamps(H, bag, el.tiers, el.tbase);
  H.flush(bag);
}
STYLES.song.elements.hz_night = nightElement;

// ── the lit windows ────────────────────────────────────────────────────────────────────────────────────────────────
/** The leaves of a geometry that are windows: groups of touching triangles that make a thin upright slab at least 0.3 m wide and high. Each: { x0, y0, z0, x1, y1, z1 }. */
function slabsOf(g, thick = 0.2) {
  const gg = g.index ? g.toNonIndexed() : g, P = gg.attributes.position.array, n = P.length / 9;
  const par = new Int32Array(n).map((_, i) => i), find = (i) => { while (par[i] !== i) { par[i] = par[par[i]]; i = par[i]; } return i; };
  const seen = new Map();
  for (let t = 0; t < n; t++) for (let v = 0; v < 3; v++) {
    const k = `${Math.round(P[t * 9 + v * 3] * 400)},${Math.round(P[t * 9 + v * 3 + 1] * 400)},${Math.round(P[t * 9 + v * 3 + 2] * 400)}`;
    const o = seen.get(k);
    if (o === undefined) seen.set(k, t); else { const a = find(o), b = find(t); if (a !== b) par[b] = a; }
  }
  const boxes = new Map();
  for (let t = 0; t < n; t++) {
    const r = find(t);
    let b = boxes.get(r);
    if (!b) boxes.set(r, (b = { x0: Infinity, y0: Infinity, z0: Infinity, x1: -Infinity, y1: -Infinity, z1: -Infinity }));
    for (let v = 0; v < 3; v++) {
      const x = P[t * 9 + v * 3], y = P[t * 9 + v * 3 + 1], z = P[t * 9 + v * 3 + 2];
      if (x < b.x0) b.x0 = x; if (x > b.x1) b.x1 = x; if (y < b.y0) b.y0 = y; if (y > b.y1) b.y1 = y; if (z < b.z0) b.z0 = z; if (z > b.z1) b.z1 = z;
    }
  }
  const out = [];
  for (const b of boxes.values()) {
    const dx = b.x1 - b.x0, dz = b.z1 - b.z0, dy = b.y1 - b.y0, th = Math.min(dx, dz), w = Math.max(dx, dz);
    if (th > thick || w < 0.3 || dy < 0.3 || th < 0.002) continue;
    out.push(b);
  }
  return out;
}
/** The lit panes for one slab: a sheet a hair off each of its two faces (the leaf less a frame's width). */
function panesOf(H, b, off) {
  const thinX = b.x1 - b.x0 < b.z1 - b.z0, m = 0.035, y0 = b.y0 + m, y1 = b.y1 - m;
  if (y1 - y0 < 0.15) return;
  const f = 0.42 + 0.36 * hashAt((b.x0 + b.x1) / 2, (b.z0 + b.z1) / 2, 23 + Math.floor(b.y0 / 2.5));
  if (thinX) { const z0 = b.z0 + m, z1 = b.z1 - m; for (const [x, nx] of [[b.x1 + off, 1], [b.x0 - off, -1]]) H.quad([x, y0, z0], [x, y0, z1], [x, y1, z1], [x, y1, z0], [nx, 0], f); }
  else { const x0 = b.x0 + m, x1 = b.x1 - m; for (const [z, nz] of [[b.z1 + off, 1], [b.z0 - off, -1]]) H.quad([x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z], [0, nz], f); }
}
const LIT = Symbol('lit windows');
/**
 * Wrap a builder context so that the windows it makes glow at night: each latticed leaf (a slab of a `lattice*` material,
 * not the red lattice of fronts) gets a pane of lamp-light on each face if its room (a cell of the town by hash: 4 m by 3 m
 * storeys) is one of those lit, `share` of them. Returns { ctx, finish } — call finish() once the element has been built.
 */
export function litWindows(ctx, share = 0.5) {
  if (ctx.bag?.[LIT]) return { ctx, finish: () => {} };
  const H = new Halo(), real = ctx.bag;
  const lit = (b) => hashAt(Math.floor((b.x0 + b.x1) / 8) * 4, Math.floor((b.z0 + b.z1) / 8) * 4, 11 + Math.floor((b.y0 + b.y1) / 6)) < share;
  const bag = new Proxy(real, {
    get(t, k) {
      if (k === LIT) return true;
      if (k === 'add') return (mat, g) => {
        if (typeof mat === 'string' && g?.attributes?.position && mat.startsWith('lattice') && mat !== 'lattice_red') for (const b of slabsOf(g, 0.2)) if (lit(b)) panesOf(H, b, 0.03);
        return t.add(mat, g);
      };
      const v = t[k];
      return typeof v === 'function' ? v.bind(t) : v;
    },
  });
  return { ctx: { ...ctx, bag }, finish: () => H.flush(real) };
}
function wrapElement(name, share) {
  const S = STYLES.song, base = S?.elements[name];
  if (!base || base.__lit) return;
  const f = (el, ctx) => { const L = litWindows(ctx, el.litShare ?? share); base(el, L.ctx); L.finish(); };
  f.__lit = true;
  S.elements[name] = f;
}
/** Register the lit windows of the town's houses (the elements are the settlement's own: hz_*). Call after the elements exist. */
export function registerNight() {
  for (const [name, share] of [['hz_house', 0.5], ['hz_shell', 0.5], ['hz_dwelling', 0.45], ['hz_upstairs', 0.55], ['hz_pagoda_upper', 0.6], ['liuhe_pagoda', 0.5]]) wrapElement(name, share);
}
export { box };
