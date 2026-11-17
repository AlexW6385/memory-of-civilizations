// The ordinary courtyard house of Ur with its front varied by rule (docs/settlements/ur.md §5.8): the same plan and court
// as the town's first houses (src/styles/sumerian urHouse), but the street face is drawn by a class of house — plain,
// framed, arched or grand — chosen from the lot's seed and its nearness to the temple, and by the window rule of the
// class. Also `frontOuter`, the class's features that stand outside the wall (frame, step, pilasters, crown, rafter
// ends), for the houses that can be entered.

import { box, fromTriangles } from '../../core/geom.js';
import { beamTris } from '../ming/index.js';
import { stairs } from '../sumerian/index.js';
import { dressFront, roofLife } from '../sumerian/dress.js';
import { rng, prism, sideFrame, sideBox } from './util.js';

const BB = 'brick_baked', MP = 'mud_plaster';
const DOOR = { w: 1.0, h: 2.1, spring: 1.6, depth: 0.3 };

/** The class of a house's front: 0 plain, 1 framed, 2 arched, 3 grand — by a stream of the seed and the nearness to the temenos (richer by it). */
export function frontClass(rect, seed) {
  const r = rng((seed || 1) * 31 + 7), [x0, z0, x1, z1] = rect, d = Math.hypot((x0 + x1) / 2, (z0 + z1) / 2 + 120);
  const wealth = r() * 0.6 + (1 - Math.min(1, d / 330)) * 0.5, big = Math.min(x1 - x0, z1 - z0) >= 11;
  return wealth > 0.66 && big ? 3 : wealth > 0.5 ? 2 : wealth > 0.34 ? 1 : 0;
}

/** A solid wing r = [x0, z0, x1, z1] from 0 to h with niches cut into its face f (see src/styles/sumerian niched). */
function niched(bag, r, h, f, niches, low, up, base) {
  const [x0, z0, x1, z1] = r, alongX = f === 'n' || f === 's', A = alongX ? x0 : z0, Bn = alongX ? x1 : z1;
  const add = (q, y0, y1) => {
    if (y1 - y0 < 1e-3) return;
    if (y0 < base) bag.add(low, box(q[0], y0, q[1], q[2], Math.min(base, y1), q[3]));
    if (y1 > base) bag.add(up, box(q[0], Math.max(base, y0), q[1], q[2], y1, q[3]));
  };
  const slab = (u0, u1, d0, d1) => {
    if (f === 'n') return [u0, z0 + d0, u1, z0 + d1]; if (f === 's') return [u0, z1 - d1, u1, z1 - d0];
    if (f === 'w') return [x0 + d0, u0, x0 + d1, u1]; return [x1 - d1, u0, x1 - d0, u1];
  };
  const T = alongX ? z1 - z0 : x1 - x0, list = niches.filter((o) => o.u0 > A && o.u1 < Bn).sort((p, q) => p.u0 - q.u0);
  let u = A;
  for (const o of list) {
    add(slab(u, o.u0, 0, T), -0.3, h);
    add(slab(o.u0, o.u1, o.depth, T), -0.3, h);
    add(slab(o.u0, o.u1, 0, o.depth), -0.3, o.v0); add(slab(o.u0, o.u1, 0, o.depth), o.v1, h);
    u = o.u1;
  }
  add(slab(u, Bn, 0, T), -0.3, h);
}

/** The arch of baked-brick wedges over a doorway uc ± 0.5 springing at DOOR.spring, on frame P: the ring of voussoirs proud of the face and the plaster filling the corners above its curve. */
function archOver(bag, P, uc, up) {
  const r = DOOR.w / 2, sp = DOOR.spring, top = DOOR.h, N = 11, pt = (k, rr) => [uc + rr * Math.cos(Math.PI - Math.PI * k / N), sp + rr * Math.sin(Math.PI - Math.PI * k / N)];
  for (let k = 0; k < N; k++) {
    const a = pt(k, r), b = pt(k + 1, r), c = pt(k + 1, r + 0.2), d = pt(k, r + 0.2);
    bag.add(k % 2 ? 'brick' : BB, prism(P, [a, d, c, b], -0.05, 0.08));
  }
  // the corners above the curve, between it and the niche's rectangle (plaster, as the wall)
  const M = 12;
  for (let k = 0; k < M; k++) {
    const ua = uc - r + 2 * r * k / M, ub = uc - r + 2 * r * (k + 1) / M, ya = sp + Math.sqrt(Math.max(0, r * r - (ua - uc) ** 2)), yb = sp + Math.sqrt(Math.max(0, r * r - (ub - uc) ** 2));
    if (top - Math.max(ya, yb) < 0.012) continue;
    bag.add(up, prism(P, [[ua, ya], [ub, yb], [ub, top], [ua, top]], 0, DOOR.depth));
  }
}

/** The door's leaf of cedar with its top rounded to the arch, at the back of the reveal. */
function archLeaf(bag, P, uc) {
  const r = DOOR.w / 2 - 0.01, sp = DOOR.spring, w0 = DOOR.depth - 0.06, w1 = DOOR.depth;
  bag.add('cedar', sideBox(P, uc - r, 0.12, uc + r, sp, w0, w1));
  const poly = [];
  for (let k = 0; k <= 10; k++) poly.push([uc + r * Math.cos(Math.PI - Math.PI * k / 10), sp + (r) * Math.sin(Math.PI - Math.PI * k / 10)]);
  bag.add('cedar', prism(P, poly, w0, w1));
  bag.add('bronze', sideBox(P, uc - r, 0.9, uc + r, 0.98, w0 - 0.012, w0)); bag.add('bronze', sideBox(P, uc - r, 1.4, uc + r, 1.48, w0 - 0.012, w0));
}

/**
 * The features of a class's front that stand outside the wall, on the side f of rect: the door's middle uc (world, along the side), the wall's
 * top H, its parapet's half-thickness 0.15. 1: a plastered frame and a brick step, merlons at the corners; 2: also the ends of the palm-trunk
 * rafters under the parapet; 3: also two pilasters beside the door rising above the parapet and a crown block over it.
 * `arched` says the door is drawn by the house itself (an arch), else a frame is set round a flat door.
 */
export function frontOuter({ bag, col }, { rect, f, uc, H, cls, seed, flat = true, near = true }) {
  const P = sideFrame(rect, f), [x0, z0, x1, z1] = rect, [a0, a1] = f === 'n' || f === 's' ? [x0, x1] : [z0, z1], r = rng((seed || 1) * 17 + 5);
  const put = (mat, u0, v0, u1, v1, w0, w1) => bag.add(mat, sideBox(P, u0, v0, u1, v1, w0, w1));
  if (cls >= 1) put(BB, uc - 0.75, -0.3, uc + 0.75, 0.12, -0.45, -0.05);              // the step before the door
  if (flat && cls >= 1) {                                                                // a plastered frame round the flat door
    for (const s of [-1, 1]) put('limewash_white', s < 0 ? uc - 0.72 : uc + 0.5, -0.3, s < 0 ? uc - 0.5 : uc + 0.72, DOOR.h + 0.22, -0.1, 0.0);
    put('limewash_white', uc - 0.72, DOOR.h, uc + 0.72, DOOR.h + 0.22, -0.1, 0.0);
  }
  if (!near) return;
  if (cls >= 2) {                                                                       // the ends of the palm-trunk rafters under the parapet
    for (let u = a0 + 0.7 + (r() * 0.3); u < a1 - 0.5; u += 0.6) if (Math.abs(u - uc) > 0.5 || H > 4) put('palm_trunk', u - 0.06, H - 0.46, u + 0.06, H - 0.34, -0.3, 0.1);
  }
  if (cls >= 1) for (const u of [a0, a1]) put(MP, u - 0.22, H + 0.5, u + 0.22, H + 0.95, -0.15, 0.3);   // merlons at the corners
  if (cls === 3) {
    for (const s of [-1, 1]) { const u = uc + s * 1.05; put(MP, u - 0.3, -0.3, u + 0.3, H + 0.75, -0.26, 0.2); put('brick_buff', u - 0.36, H + 0.75, u + 0.36, H + 0.88, -0.32, 0.26); col?.rect(boxRect(P, u - 0.3, u + 0.3, -0.26, 0.2), 0, H + 0.75); }
    put('limewash_white', uc - 0.8, H + 0.5, uc + 0.8, H + 1.15, -0.15, 0.15);       // the crown block over the door
    put('brick_buff', uc - 0.88, H + 1.15, uc + 0.88, H + 1.27, -0.2, 0.2);
  }
}
const boxRect = (P, u0, u1, w0, w1) => { const a = P(u0, 0, w0), b = P(u1, 0, w1); return [Math.min(a[0], b[0]), Math.min(a[2], b[2]), Math.max(a[0], b[0]), Math.max(a[2], b[2])]; };

/** ur_house: a courtyard house { rect, seed, lod, trade } with the front of its class (§5.8). */
export function urHouse(el, ctx) {
  const { bag, col } = ctx;
  const rand = rng(el.seed || 1), [x0, z0, x1, z1] = el.rect, W = x1 - x0, D = z1 - z0, cls = frontClass(el.rect, el.seed);
  const d = Math.min(3.8, Math.min(W, D) * 0.3), two = rand() < 0.45 || cls === 3, H = two ? 6 : 3.4;
  const up = rand() < 0.3 || cls === 3 ? 'limewash_white' : MP, base = 0.8 + Math.round(rand() * 3) * 0.15;
  const side = Math.floor(rand() * 4), faces = ['n', 's', 'w', 'e'];
  const wings = { n: [x0, z0, x1, z0 + d], s: [x0, z1 - d, x1, z1], w: [x0, z0 + d, x0 + d, z1 - d], e: [x1 - d, z0 + d, x1, z1 - d] };
  const span = (f) => (f === 'n' || f === 's' ? [x0 + 0.8, x1 - 0.8] : [z0 + d + 0.8, z1 - d - 0.8]);
  const [s0, s1] = span(faces[side]), du = s0 + (rand() < 0.5 ? 0.25 : 0.75) * (s1 - s0);
  const arched = cls >= 2, lod = el.lod ?? 1;
  const door = { u0: du - 0.5, u1: du + 0.5, v0: -0.3, v1: DOOR.h, depth: DOOR.depth };
  for (const f of faces) {
    const r = wings[f], niches = [];
    if (f === faces[side]) niches.push(door);
    if (two && (f === 'n' || f === 's' ? W : D) > 7 && rand() < 0.7) {
      const [a, b] = span(f), ks = cls === 2 ? [0.1, 0.5, 0.9] : cls === 3 ? [0.1, 0.9] : [0.1, 0.9];
      for (const k of ks) { const c = a + k * (b - a); if (f === faces[side] && Math.abs(c - du) < 1.2) continue; niches.push({ u0: c - 0.3, u1: c + 0.3, v0: 4.1, v1: 4.75, depth: 0.12, win: true }); }
      if (cls === 3 && f === faces[side]) for (const s of [-0.85, 0, 0.85]) niches.push({ u0: du + s - 0.27, u1: du + s + 0.27, v0: 4.1, v1: 4.75, depth: 0.12, win: true });   // the triple window over the door
    }
    niched(bag, r, H, f, niches, BB, up, base);
    col.rect(r, 0, H); col.floor(r, H);
    const P = sideFrame(el.rect, f), pl = (mat, u0, v0, u1, v1, w0, w1) => bag.add(mat, sideBox(P, u0, v0, u1, v1, w0, w1));
    for (const o of niches) {
      if (o.win) { pl('lattice', o.u0, o.v0, o.u1, o.v1, o.depth - 0.04, o.depth); pl('cedar', o.u0 - 0.06, o.v0 - 0.08, o.u1 + 0.06, o.v0, -0.06, 0.02); continue; }
      if (arched) { archOver(bag, P, du, up); archLeaf(bag, P, du); }
      else {
        pl('cedar', o.u0 + 0.01, 0.12, o.u1 - 0.01, o.v1, o.depth - 0.06, o.depth);        // the door, at the back of its reveal
        if (cls === 0) pl('cedar', o.u0 - 0.15, o.v1, o.u1 + 0.15, o.v1 + 0.16, -0.03, 0.02);   // the lintel, set in the wall face
      }
      pl(BB, o.u0, -0.3, o.u1, 0.12, 0, o.depth);                                       // the threshold
      if (lod > 0) frontOuter(ctx, { rect: el.rect, f, uc: du, H, cls, seed: el.seed, flat: !arched, near: lod > 1 });
    }
  }
  for (const [a, b] of [[[x0, z0], [x1, z0]], [[x0, z1], [x1, z1]], [[x0, z0], [x0, z1]], [[x1, z0], [x1, z1]]]) { const t = []; beamTris(t, [a[0], H, a[1]], [b[0], H, b[1]], 0.15, 0.5); bag.add(up, fromTriangles(t)); }
  if (lod > 0) dressFront(ctx, { rect: el.rect, face: faces[side], dc: du, trade: el.trade, seed: el.seed, foot: base, H, near: lod > 1 });
  if (lod > 1) roofLife(ctx, { wings: Object.values(wings), y: H, seed: el.seed });
  for (const f of faces) {
    if (rand() < 0.35) continue;
    const l = f === 'n' || f === 's' ? W : D, a = (f === 'n' || f === 's' ? x0 : z0) + (0.35 + rand() * 0.3) * l, y = H + 0.05;
    const q = f === 'n' ? [a - 0.08, z0 - 0.55, a + 0.08, z0 + 0.2] : f === 's' ? [a - 0.08, z1 - 0.2, a + 0.08, z1 + 0.55] : f === 'w' ? [x0 - 0.55, a - 0.08, x0 + 0.2, a + 0.08] : [x1 - 0.2, a - 0.08, x1 + 0.55, a + 0.08];
    bag.add('terracotta', box(q[0], y, q[1], q[2], y + 0.13, q[3]));
  }
  const ci = [x0 + d, z0 + d, x1 - d, z1 - d], cw = ci[2] - ci[0], cd = ci[3] - ci[1], cx = (ci[0] + ci[2]) / 2, cz = (ci[1] + ci[3]) / 2;
  bag.add(BB, box(ci[0], 0, ci[1], ci[2], 0.06, ci[3]));
  bag.add('opening', box(cx - 0.18, 0.06, cz - 0.18, cx + 0.18, 0.065, cz + 0.18));
  if (Math.max(cw, cd) < 2.6) return;
  const alongX = cw >= cd, top = two ? 3.0 : H, run = alongX ? cw : cd;
  if (run >= top / 0.85) {
    const sr = alongX ? [ci[0], ci[1], ci[2] - (two ? 0.9 : 0), ci[1] + 0.8] : [ci[0], ci[1], ci[0] + 0.8, ci[3] - (two ? 0.9 : 0)];
    stairs({ rect: sr, y0: 0.06, y1: top, dir: alongX ? 'e' : 's', mat: BB }, { bag, col });
  }
  if (!two || Math.min(cw, cd) < 3.4) return;
  const g = 0.9, Y = 3.0, ring = alongX
    ? [[ci[0], ci[3] - g, ci[2], ci[3]], [ci[0], ci[1] + 0.8, ci[0] + g, ci[3] - g], [ci[2] - g, ci[1], ci[2], ci[3] - g]]
    : [[ci[0], ci[3] - g, ci[2], ci[3]], [ci[2] - g, ci[1], ci[2], ci[3] - g], [ci[0] + 0.8, ci[1], ci[2] - g, ci[1] + g]];
  for (const r of ring) { bag.add('timber', box(r[0], Y - 0.12, r[1], r[2], Y, r[3])); col.floor(r, Y); }
  const inner = alongX ? [ci[0] + g, ci[1] + 0.92, ci[2] - g, ci[3] - g] : [ci[0] + 0.92, ci[1] + g, ci[2] - g, ci[3] - g];
  for (const [px, pz] of [[inner[0], inner[1]], [inner[2], inner[1]], [inner[0], inner[3]], [inner[2], inner[3]]]) {
    bag.add('timber', box(px - 0.09, 0.06, pz - 0.09, px + 0.09, Y + 0.95, pz + 0.09)); col.rect([px - 0.09, pz - 0.09, px + 0.09, pz + 0.09], 0, Y + 0.95);
  }
  for (const [a, b] of [[[inner[0], inner[1]], [inner[2], inner[1]]], [[inner[0], inner[3]], [inner[2], inner[3]]], [[inner[0], inner[1]], [inner[0], inner[3]]], [[inner[2], inner[1]], [inner[2], inner[3]]]]) {
    if (alongX ? a[1] === inner[1] && b[1] === inner[1] : a[0] === inner[0] && b[0] === inner[0]) continue;
    const t = []; beamTris(t, [a[0], Y + 0.85, a[1]], [b[0], Y + 0.85, b[1]], 0.05, 0.1); bag.add('timber', fromTriangles(t));
  }
}
