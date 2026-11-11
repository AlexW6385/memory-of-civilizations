// The posad's timber work (docs/settlements/muscovy.md §5.2): the carved window surrounds of the izby
// (nalichniki) with their hanging valances (polotentsa), the porch (kryltso), the yard fence of pointed logs
// (tyn) with its roofed gate, the plank-and-log street paving (mostovaya), the stalls (lotki) of Red Square's
// market and the tented log church (shatrovaya tserkov) of a posad parish.

import { box, lathe } from '../../core/geom.js';
import { Shape, Path } from '../../core/three.js';
import { slab, hexa, pitched, pyr } from '../norse/index.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const LOG = 'log_pine';

// ── the window surround ─────────────────────────────────────────────────────
const NW = 1.1;
let CROWN = null, TOWEL = null;
/** The platband: side boards, a sill and a lintel under a carved crown (a keel arch with a finial and a sun-hole), the window's opening cut through. Local u 0…1.1, v 0…1.46. */
function crownShape() {
  if (CROWN) return CROWN;
  const s = new Shape(), W = NW;
  s.moveTo(0, 0); s.lineTo(W, 0); s.lineTo(W, 1.0); s.lineTo(W - 0.04, 1.0);
  s.quadraticCurveTo(W - 0.02, 1.26, W / 2 + 0.12, 1.37); s.lineTo(W / 2, 1.46); s.lineTo(W / 2 - 0.12, 1.37);
  s.quadraticCurveTo(0.02, 1.26, 0.04, 1.0); s.lineTo(0, 1.0); s.lineTo(0, 0);
  const op = new Path(); op.moveTo(0.2, 0.15); op.lineTo(0.2, 0.85); op.lineTo(W - 0.2, 0.85); op.lineTo(W - 0.2, 0.15); op.lineTo(0.2, 0.15); s.holes.push(op);
  const sun = new Path(); sun.absarc(W / 2, 1.14, 0.07, 0, Math.PI * 2, true); s.holes.push(sun);
  return (CROWN = s);
}
/** The valance under the sill: a board hung from it, its lower edge cut in teeth, round holes along it. */
function towelShape() {
  if (TOWEL) return TOWEL;
  const s = new Shape(), W = NW + 0.1, n = 7, tw = W / n;
  s.moveTo(0, 0.26); s.lineTo(W, 0.26); s.lineTo(W, 0.14);
  for (let i = n; i > 0; i--) { s.lineTo(i * tw - tw * 0.5, 0); s.lineTo((i - 1) * tw, 0.14); }
  s.lineTo(0, 0.26);
  for (let i = 0; i < n; i++) { const h = new Path(); h.absarc((i + 0.5) * tw, 0.19, 0.028, 0, Math.PI * 2, true); s.holes.push(h); }
  return (TOWEL = s);
}
/**
 * One window's carved surround on a log front. `A(u, w)` the point [x, z] of the face frame; c the window's middle (u),
 * sy the y of the sill board's underside, mat the surround's material, w the depth of the surround's middle out from the face.
 */
export function nalichnik(bag, A, c, sy, mat, w = 0.2) {
  bag.add(mat, slab(crownShape(), 0.1, A(c - NW / 2, w), A(c + NW / 2, w), sy, 3));
  bag.add(mat, slab(towelShape(), 0.045, A(c - NW / 2 - 0.05, w + 0.03), A(c + NW / 2 + 0.05, w + 0.03), sy - 0.36, 1));
}

// ── the yard fence and its gate ─────────────────────────────────────────────
const fenceShapes = new Map();
function fenceShape(L, H) {
  const key = Math.round(L * 10) + '|' + Math.round(H * 10);
  let s = fenceShapes.get(key);
  if (s) return s;
  s = new Shape();
  const n = Math.max(2, Math.round(L / 0.3)), tw = L / n;
  s.moveTo(0, 0); s.lineTo(L, 0);
  for (let i = n; i > 0; i--) { s.lineTo(i * tw, H - 0.18); s.lineTo(i * tw - tw / 2, H); s.lineTo((i - 1) * tw, H - 0.18); }
  s.lineTo(0, 0);
  fenceShapes.set(key, s);
  return s;
}
/**
 * A fence of pointed logs along a→b ([x, z] ends), on ground yf(x, z), 1.9 m high, with a roofed gate in the middle
 * (gap of gw): two stout posts, a small gabled roof of planks over them, the two leaves swung back against the fence.
 */
export function yardFence(bag, col, a, b, yf, o = {}) {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L, gw = o.gate ?? 2.3, H = o.h ?? 1.5, m = o.mat ?? 'planks_grey';
  const g0 = L / 2 - gw / 2 + (o.shift ?? 0), g1 = g0 + gw, P = (u) => [a[0] + ux * u, a[1] + uz * u];
  const low = (u0, u1) => Math.min(yf(...P(u0)), yf(...P((u0 + u1) / 2)), yf(...P(u1)));
  const run = (u0, u1) => {
    if (u1 - u0 < 0.5) return;
    const y0 = low(u0, u1) - 0.35, top = Math.max(yf(...P(u0)), yf(...P(u1))) + H - y0;
    bag.add(m, slab(fenceShape(u1 - u0, top), 0.14, P(u0), P(u1), y0, 1));
    col.rect([Math.min(...[P(u0)[0], P(u1)[0]]) - 0.1, Math.min(P(u0)[1], P(u1)[1]) - 0.1, Math.max(P(u0)[0], P(u1)[0]) + 0.1, Math.max(P(u0)[1], P(u1)[1]) + 0.1], y0, y0 + top);
  };
  run(0, g0 - 0.12); run(g1 + 0.12, L);
  // the gate: posts, the roof over them, the leaves open
  const yg = Math.max(yf(...P(g0)), yf(...P(g1))), at = (u, y, d) => [P(u)[0] - uz * d, y, P(u)[1] + ux * d];
  const post = (u) => { bag.add('timber', box(P(u)[0] - 0.13 - Math.abs(uz) * 0.0, yg - 0.5, P(u)[1] - 0.13, P(u)[0] + 0.13, yg + 2.55, P(u)[1] + 0.13)); col.rect([P(u)[0] - 0.13, P(u)[1] - 0.13, P(u)[0] + 0.13, P(u)[1] + 0.13], yg - 0.5, yg + 2.55); };
  post(g0 - 0.02); post(g1 + 0.02);
  const r = 0.62, y1 = yg + 2.5, ru = [g0 - 0.35, g1 + 0.35];
  // (the roof's two slopes meeting in a ridge above the gate)
  const ridge = y1 + 0.5;
  bag.add('planks_grey', hexa([at(ru[0], y1 - 0.02, -r), at(ru[1], y1 - 0.02, -r), at(ru[1], ridge - 0.04, 0), at(ru[0], ridge - 0.04, 0), at(ru[0], y1 + 0.02, -r), at(ru[1], y1 + 0.02, -r), at(ru[1], ridge, 0), at(ru[0], ridge, 0)]));
  bag.add('planks_grey', hexa([at(ru[0], y1 - 0.02, r), at(ru[1], y1 - 0.02, r), at(ru[1], ridge - 0.04, 0), at(ru[0], ridge - 0.04, 0), at(ru[0], y1 + 0.02, r), at(ru[1], y1 + 0.02, r), at(ru[1], ridge, 0), at(ru[0], ridge, 0)]));
  // the leaves, swung open against the fence on the yard side
  for (const [u, s] of [[g0 - 0.15, -1], [g1 + 0.15, 1]]) {
    void s; bag.add('wood_painted', hexa([at(u, yg + 0.1, 0.16), at(u + s * 1.1, yg + 0.1, 0.16), at(u + s * 1.1, yg + 0.1, 0.22), at(u, yg + 0.1, 0.22), at(u, yg + 1.85, 0.16), at(u + s * 1.1, yg + 1.85, 0.16), at(u + s * 1.1, yg + 1.85, 0.22), at(u, yg + 1.85, 0.22)]));
  }
  return { gate: [g0, g1], P };
}

// ── the street paving ───────────────────────────────────────────────────────
/**
 * street_log: { a: [x, z], b: [x, z], w (width), y (fn of x, z), skip (fn of x, z → true to leave out), step } — a Muscovite
 * street paved with logs: half-round logs laid across two long stringers, the flat face up, a hand's width above the ground
 * (the mostovaya: "bridges" of logs laid in the streets of Moscow, renewed again and again; the earth between the ruts below).
 */
export function streetLog(el, { bag }) {
  const [ax, az] = el.a, [bx, bz] = el.b, L = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / L, uz = (bz - az) / L, nx = -uz, nz = ux;
  const w = el.w ?? 5, h = el.w2 ?? w / 2, yf = el.y, skip = el.skip ?? (() => false), step = el.step ?? 0.34, rand = rng(el.seed ?? 7);
  const on = (u) => { const p = [ax + ux * u, az + uz * u]; return !skip(p[0], p[1]); };
  // runs between the skipped stretches (logs only where the street is open)
  for (let u0 = 0, run = null; u0 <= L + 0.01; u0 += step) {
    const ok = u0 < L && on(u0) && on(Math.min(L, u0 + step));
    if (ok) { if (!run) run = [u0, u0]; run[1] = u0 + step; }
    if ((!ok || u0 + step > L) && run) {
      const [r0, r1] = run, n = Math.max(1, Math.round((r1 - r0) / step)), out = [];
      for (let k = 0; k < n; k++) {
        const u = r0 + (k + 0.5) * (r1 - r0) / n, cx = ax + ux * u, cz = az + uz * u, y = yf(cx, cz), d = 0.17 + rand() * 0.04, hw = h + (rand() - 0.5) * 0.3, lw = (r1 - r0) / n * 0.5 - 0.012;
        // a half-round log: the flat face up, rounded under, ends toward both sides; as a hexa (a prism of five faces)
        const P = (du, dn, dy) => [cx + ux * du + nx * dn, y + dy, cz + uz * du + nz * dn];
        out.push(hexa([P(-lw, -hw, -0.06), P(lw, -hw, -0.06), P(lw, hw, -0.06), P(-lw, hw, -0.06), P(-lw * 0.8, -hw, d), P(lw * 0.8, -hw, d), P(lw * 0.8, hw, d), P(-lw * 0.8, hw, d)]));
      }
      for (const g of out) bag.add(LOG, g);
      // the two stringers under the ends of the logs, and the edge logs that hold them in
      for (const s of [-1, 1]) {
        const p = [ax + ux * r0 + nx * s * (h - 0.25), az + uz * r0 + nz * s * (h - 0.25)], q = [ax + ux * r1 + nx * s * (h - 0.25), az + uz * r1 + nz * s * (h - 0.25)];
        void p; void q;
      }
      run = null;
    }
  }
}

// ── the stalls of the market ────────────────────────────────────────────────
const WARES = ['cloth_red', 'cloth_indigo', 'cloth_ochre', 'cloth_green', 'linen', 'cloth_brown'];
/**
 * stalls: { c: [x, z], y (fn of x, z), n (stalls), along ('z' | 'x'), face (±1: the side the stalls open to), seed, gap } — a row of market stalls (lotki):
 * a counter of planks on trestles, two posts and a back board, a pent roof of boards over it, a cloth awning hung from its edge,
 * and the wares of the kind of trade: cloth, pots, loaves in baskets, hung furs, candles, fish.
 */
export function stalls(el, { bag, col }) {
  const rand = rng(el.seed ?? 3), n = el.n ?? 6, sw = 2.3, d = 1.5, gap = el.gap ?? 0.35, ax = el.along === 'x', f = el.face ?? 1;
  for (let i = 0; i < n; i++) {
    const t = (i - (n - 1) / 2) * (sw + gap), cx = el.c[0] + (ax ? t : 0), cz = el.c[1] + (ax ? 0 : t), y = typeof el.y === 'function' ? el.y(cx, cz) : (el.y ?? 0);
    // frame (u across the stall, w out toward the buyer)
    const B = (u0, u1, v0, v1, w0, w1) => { const wa = Math.min(w0, w1) * f, wb = Math.max(w0, w1) * f; return ax ? box(cx + u0, y + v0, cz + Math.min(wa, wb), cx + u1, y + v1, cz + Math.max(wa, wb)) : box(cx + Math.min(wa, wb), y + v0, cz + u0, cx + Math.max(wa, wb), y + v1, cz + u1); };
    const C = (u0, u1, w0, w1, v0, v1) => { const wa = Math.min(w0, w1) * f, wb = Math.max(w0, w1) * f; col.rect(ax ? [cx + u0, cz + Math.min(wa, wb), cx + u1, cz + Math.max(wa, wb)] : [cx + Math.min(wa, wb), cz + u0, cx + Math.max(wa, wb), cz + u1], y + v0, y + v1); };
    const hs = sw / 2;
    // posts, back board, the counter on trestles, a shelf behind it
    for (const u of [-hs + 0.06, hs - 0.06]) { bag.add('timber', B(u - 0.06, u + 0.06, -0.3, 2.35, -0.06, 0.06)); bag.add('timber', B(u - 0.06, u + 0.06, -0.3, 1.9, d - 0.12, d)); }
    bag.add('planks_grey', B(-hs, hs, 0.1, 2.0, -0.1, -0.03));
    bag.add('timber', B(-hs, hs, 0.84, 0.9, 0.2, d - 0.05));
    for (const u of [-hs + 0.2, hs - 0.2]) bag.add('timber', B(u - 0.05, u + 0.05, -0.3, 0.84, d - 0.3, d - 0.2));
    bag.add('timber', B(-hs + 0.1, hs - 0.1, 0.0, 0.84, d - 0.06, d - 0.02));
    bag.add('timber', B(-hs, hs, 1.3, 1.34, 0.1, 0.5));
    // the pent roof of boards, sloping to the front, and the awning's cloth hanging from its edge
    const r = (u, v, w) => (ax ? [cx + u, y + v, cz + f * w] : [cx + f * w, y + v, cz + u]);
    bag.add('planks_grey', hexa([r(-hs - 0.1, 2.3, -0.2), r(hs + 0.1, 2.3, -0.2), r(hs + 0.1, 1.98, d + 0.45), r(-hs - 0.1, 1.98, d + 0.45), r(-hs - 0.1, 2.38, -0.2), r(hs + 0.1, 2.38, -0.2), r(hs + 0.1, 2.06, d + 0.45), r(-hs - 0.1, 2.06, d + 0.45)]));
    const cl = WARES[Math.floor(rand() * WARES.length)];
    bag.add(cl, box(...(ax ? [cx - hs, y + 1.62, cz + f * (d + 0.38) - 0.02, cx + hs, y + 1.98, cz + f * (d + 0.38) + 0.02] : [cx + f * (d + 0.38) - 0.02, y + 1.62, cz - hs, cx + f * (d + 0.38) + 0.02, y + 1.98, cz + hs])));
    // the wares by trade
    const kind = Math.floor(rand() * 6), gu = (k) => -hs + 0.35 + k * 0.42;
    for (let k = 0; k < 5; k++) {
      const u = gu(k), w = 0.5 + (k % 2) * 0.35, g = (m, ge) => bag.add(m, ge);
      if (kind === 0) g(WARES[(k + i) % WARES.length], box(...(ax ? [cx + u - 0.15, y + 0.9, cz + f * 0.5 - 0.15 + (f < 0 ? -0.3 : 0), cx + u + 0.15, y + 1.2, cz + f * 0.5 + 0.15 + (f < 0 ? -0.3 : 0)] : [cx + f * 0.5 - 0.15 + (f < 0 ? -0.3 : 0), y + 0.9, cz + u - 0.15, cx + f * 0.5 + 0.15 + (f < 0 ? -0.3 : 0), y + 1.2, cz + u + 0.15])));
      else { const p = r(u, 0.9, w); g(kind === 1 ? 'terracotta' : kind === 2 ? 'wicker' : kind === 3 ? 'hide_brown' : kind === 4 ? 'paint_ochre' : 'hide_grey', lathe([[0.001, 0], [0.11, 0.02], [0.14, 0.1], [0.1, 0.18], [0.001, 0.2]], 8, null, p[0], p[1], p[2])); }
    }
    if (kind === 3) for (let k = 0; k < 4; k++) { const u = gu(k) + 0.1, p = r(u, 1.3, 0.12); bag.add(k % 2 ? 'hide_tan' : 'hide_brown', box(p[0] - 0.14, p[1] - 0.7, p[2] - 0.05, p[0] + 0.14, p[1], p[2] + 0.05)); }       // furs hung on the back pole
    C(-hs, hs, 0.1, d, 0, 1.0);
  }
}

// ── the tented log church ───────────────────────────────────────────────────
/**
 * log_church: { c: [x, z], y, yaw (axis: the altar toward +x at 0), s } — a parish church of the posad in logs: the cage (klet) of
 * about 5 m a side, a lower altar apse (prirub) on the east, a refectory and porch (trapeza, paperť) on the west with its stair
 * and little hipped roof, an octagon on the cage, and over it the tall octagonal tent (shater) of aspen shingles, the neck, the
 * small onion-cap and its iron cross. Logs with their ends at the corners; the shingles silver-grey.
 */
export function logChurch(el, { bag, col }) {
  const [cx, cz] = el.c, y = el.y ?? 0, s = el.s ?? 1, yaw = el.yaw ?? 0, co = Math.cos(yaw), si = Math.sin(yaw);
  // a point in the church's frame (x east along the axis, z south) → the world
  const T = (x, v, z) => [cx + (x * co - z * si) * s, y + v * s, cz + (x * si + z * co) * s];
  const lg = (x0, z0, x1, z1, v0, v1, mat = LOG) => {
    const p = [T(x0, v0, z0), T(x1, v0, z0), T(x1, v0, z1), T(x0, v0, z1)], q = [T(x0, v1, z0), T(x1, v1, z0), T(x1, v1, z1), T(x0, v1, z1)];
    bag.add(mat, hexa([...p, ...q]));
  };
  const rect = (x0, z0, x1, z1, v0, v1) => {
    const pts = [T(x0, 0, z0), T(x1, 0, z0), T(x1, 0, z1), T(x0, 0, z1)];
    col.rect([Math.min(...pts.map((p) => p[0])), Math.min(...pts.map((p) => p[2])), Math.max(...pts.map((p) => p[0])), Math.max(...pts.map((p) => p[2]))], y + v0 * s, y + v1 * s);
  };
  const course = (x0, z0, x1, z1, v0, v1) => {            // the logs of a cage, a course at a time, the corners cross
    for (let v = v0; v < v1 - 0.05; v += 0.3) {
      lg(x0 - 0.22, z0, x1 + 0.22, z0 + 0.28, v, v + 0.28); lg(x0 - 0.22, z1 - 0.28, x1 + 0.22, z1, v, v + 0.28);
      lg(x0, z0 + 0.28, x0 + 0.28, z1 - 0.28, v + 0.15, v + 0.43 > v1 ? v1 : v + 0.43); lg(x1 - 0.28, z0 + 0.28, x1, z1 - 0.28, v + 0.15, v + 0.43 > v1 ? v1 : v + 0.43);
    }
  };
  const H = 5.2, hw = 2.6;
  lg(-hw - 0.15, -hw - 0.15, hw + 0.15, hw + 0.15, -0.5, 0.5, 'limestone');                            // the foundation of rubble
  course(-hw, -hw, hw, hw, 0.5, H);
  rect(-hw - 0.2, -hw - 0.2, hw + 0.2, hw + 0.2, -0.5, H);
  // the altar apse (prirub) on the east, lower, with its own roof
  const ah = 3.5, aw = 1.7;
  course(hw, -aw, hw + 2.6, aw, 0.5, ah); rect(hw, -aw, hw + 2.6, aw, -0.5, ah);
  const hip = (x0, z0, x1, z1, v, rise, o, mat) => {
    const m = [(x0 + x1) / 2, (z0 + z1) / 2];
    bag.add(mat, hexa([T(x0 - o, v, z0 - o), T(x1 + o, v, z0 - o), T(x1 + o, v, z1 + o), T(x0 - o, v, z1 + o), T(m[0], v + rise, m[1]), T(m[0], v + rise, m[1]), T(m[0], v + rise, m[1]), T(m[0], v + rise, m[1])]));
  };
  hip(hw, -aw, hw + 2.6, aw, ah, 1.4, 0.35, 'planks_grey');
  // the west porch and its refectory: a lower cage, a wide-eaved roof, the stair up to its door
  course(-hw - 2.8, -hw + 0.3, -hw, hw - 0.3, 0.5, 3.4); rect(-hw - 2.8, -hw + 0.3, -hw, hw - 0.3, -0.5, 3.4);
  hip(-hw - 2.8, -hw + 0.3, -hw, hw - 0.3, 3.4, 1.6, 0.45, 'planks_grey');
  for (let k = 0; k < 5; k++) lg(-hw - 4.0 + k * 0.28 + 0.0, -0.7, -hw - 3.72 + k * 0.28, 0.7, 0, 0.18 + k * 0.18, 'planks_grey');       // the stair
  lg(-hw - 4.0, -0.7, -hw - 2.78, 0.7, 0.9, 0.95, 'planks_grey');
  // the cage's roof: a cross of shingled gables under the octagon, then the octagon on its base, the tent and the cap
  hip(-hw, -hw, hw, hw, H, 1.7, 0.4, 'planks_grey');
  const cen = T(0, 0, 0);
  const lat = (prof, mat) => bag.add(mat, lathe(prof.map(([r, v]) => [r * s, v * s]), 8, null, cen[0], cen[1], cen[2]));
  lat([[2.0, H + 1.2], [1.55, H + 1.25], [1.55, H + 3.6], [0.001, H + 3.6]], LOG);                       // the octagon's logs
  lat([[1.55, H + 3.6], [2.05, H + 3.75], [2.1, H + 3.9], [0.001, H + 3.9]], 'planks_grey');            // its flared eave
  lat([[1.45, H + 3.9], [1.3, H + 5.2], [0.001, H + 5.2]], LOG);                                         // the second, narrower storey
  lat([[1.7, H + 5.1], [1.45, H + 5.25], [1.4, H + 5.4], [0.001, H + 5.4]], 'planks_grey');             // the eave under the tent
  lat([[1.35, H + 5.4], [1.12, H + 8.4], [0.7, H + 11.0], [0.46, H + 12.4], [0.001, H + 12.4]], 'planks_grey');   // the tent, slightly bellied
  lat([[0.46, H + 12.4], [0.5, H + 12.7], [0.001, H + 12.7]], LOG);
  lat([[0.001, H + 12.7], [0.3, H + 13.0], [0.34, H + 13.4], [0.2, H + 13.9], [0.001, H + 14.3]], 'planks_grey');   // the small onion cap
  { const p = T(0, H + 14.3, 0); bag.add('iron', box(p[0] - 0.03, p[1], p[2] - 0.03, p[0] + 0.03, p[1] + 1.1 * s, p[2] + 0.03)); bag.add('iron', box(p[0] - 0.28 * s, p[1] + 0.65 * s, p[2] - 0.025, p[0] + 0.28 * s, p[1] + 0.7 * s, p[2] + 0.025)); }
  void pitched; void pyr;
}
