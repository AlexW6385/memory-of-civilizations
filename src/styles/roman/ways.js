// The ways of Hadrian's Rome (docs/settlements/rome.md §4.9–§4.10): streets paved with polygonal basalt blocks and
// marked at the footway by a travertine kerb, with stepping stones across them at the alley mouths; the street's own
// furniture (the fuller's urine jars at the corners, heaps of sherds, water tubs, bollards, a lararium at a
// crossing); the alleys between the rows closed at the street by a wall with an arched passage or the back of a
// fountain's recess; the walled gardens (horti) with their pool, pergola, beds and statue. Registered into `roman`.

import { STYLES, orientedBox } from '../../core/build.js';
import { box, lathe, fromTriangles } from '../../core/geom.js';
import '../../objects/index.js';
import './index.js';
import { tools, hip } from './street.js';
import * as D_ from './dress.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const lz = (p, n) => lathe(p, n);
const PUT = (bag, mat, g, x, y, z, yaw = 0) => D_.putAt(bag, mat, g, x, y, z, yaw);

/**
 * paving: { rect, y } — a street of basalt blocks 0.03 m proud of the ground (a floor to walk on), a travertine kerb
 * line 1.15 m in from each long edge (where the footway under the awnings ends), and the drain: a darker groove down
 * the middle of the way. A `cross` list ([[x or z, half-width]]) cuts the kerbs where another street crosses.
 */
function paving(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, alongZ = z1 - z0 >= x1 - x0;
  bag.add('basalt', box(x0, y - 0.3, z0, x1, y + 0.03, z1));
  col.floor(el.rect, y + 0.03);
  const cuts = (el.cross ?? []).slice().sort((a, b) => a[0] - b[0]);
  const run = (a0, a1, fn) => {
    let s = a0;
    for (const [c, h] of cuts) { if (c - h > s) fn(s, Math.min(a1, c - h)); s = Math.max(s, c + h); }
    if (a1 > s) fn(s, a1);
  };
  if (alongZ) {
    for (const x of [x0 + 1.15, x1 - 1.15]) run(z0, z1, (a, b) => { if (b > a) bag.add('travertine', box(x - 0.12, y + 0.03, a, x + 0.12, y + 0.07, b)); });
    const mx = (x0 + x1) / 2; bag.add('granite_grey', box(mx - 0.09, y + 0.03, z0, mx + 0.09, y + 0.045, z1));
  } else {
    for (const z of [z0 + 1.15, z1 - 1.15]) run(x0, x1, (a, b) => { if (b > a) bag.add('travertine', box(a, y + 0.03, z - 0.12, b, y + 0.07, z + 0.12)); });
    const mz = (z0 + z1) / 2; bag.add('granite_grey', box(x0, y + 0.03, mz - 0.09, x1, y + 0.045, mz + 0.09));
  }
}
/** crossing: { at, along ('x' | 'z': the way the row of stones runs, across the street), w (the street's width) } — the stepping stones of a street, with the gaps for the carts' wheels between them. */
function crossing(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, ax = el.along !== 'z', w = el.w ?? 10, n = Math.max(3, Math.round(w / 2.1)), sp = w / n;
  for (let k = 0; k < n; k++) {
    const o = (k - (n - 1) / 2) * sp, px = ax ? x + o : x, pz = ax ? z : z + o;
    const r = ax ? [px - 0.45, pz - 0.4, px + 0.45, pz + 0.4] : [px - 0.4, pz - 0.45, px + 0.4, pz + 0.45];
    bag.add('basalt_ahu', box(r[0], y + 0.03, r[1], r[2], y + 0.22, r[3])); bag.add('travertine', box(r[0] + 0.02, y + 0.22, r[1] + 0.02, r[2] - 0.02, y + 0.25, r[3] - 0.02));
    col.floor(r, y + 0.25);
  }
}
/**
 * street_kit: { at, along ('x' | 'z'), len, half (the street's half-width), seed } — the furniture of a stretch of street
 * on both footways, by seed: the fuller's jars (two amphorae cut short on a stand, at the corners, to which passers-by
 * brought their urine), heaps of sherds and sweepings, water tubs, bollards, a bench of travertine, and now and then a
 * lararium (a shrine of the crossroads' guardian spirits: a pier with a painted niche and an altar).
 */
function streetKit(el, { bag, col }) {
  const [cx, cz] = el.at, y = el.y ?? 0, rand = rng(el.seed || 1), zz = el.along !== 'x', len = el.len ?? 50, half = el.half ?? 5;
  const P = (s, off) => (zz ? [cx + off, cz + s] : [cx + s, cz + off]);
  for (let s = -len / 2 + 3; s < len / 2 - 2; s += 5 + rand() * 7) {
    const side = rand() < 0.5 ? -1 : 1, off = side * (half - 0.45 - rand() * 0.25), [x, z] = P(s, off), r = rand();
    if (r < 0.2) {                                                                  // the fuller's jars
      for (const k of [0, 1]) PUT(bag, 'terracotta', lz([[0.001, 0], [0.12, 0.0], [0.22, 0.12], [0.25, 0.3], [0.2, 0.5], [0.17, 0.62], [0.2, 0.64], [0.2, 0.68], [0.14, 0.68], [0.14, 0.62]], 10), x + (zz ? 0.5 * side * (k ? 1 : 0) : 0), y, z + (zz ? 0 : 0.5 * side * (k ? 1 : 0)));
      col.circle(x, z, 0.28, y, y + 0.7);
    } else if (r < 0.4) {                                                           // sherds and sweepings against the kerb
      for (let k = 0; k < 7; k++) {
        const a = rand() * 6.28, d = rand() * 0.55, w = 0.1 + rand() * 0.18, h = 0.03 + rand() * 0.07;
        bag.add(['terracotta', 'pottery_dark', 'schist_rubble'][k % 3], box(x + Math.cos(a) * d - w / 2, y + 0.03, z + Math.sin(a) * d - w / 2, x + Math.cos(a) * d + w / 2, y + 0.03 + h, z + Math.sin(a) * d + w / 2));
      }
    } else if (r < 0.55) {                                                          // a water tub
      PUT(bag, 'timber', lz([[0.001, 0], [0.4, 0], [0.43, 0.7], [0.4, 0.7], [0.4, 0.62], [0.001, 0.62]], 14), x, y, z);
      PUT(bag, 'water', lz([[0.001, 0.58], [0.38, 0.58], [0.001, 0.58]], 12), x, y, z);
      col.circle(x, z, 0.43, y, y + 0.7);
    } else if (r < 0.7) {                                                           // bollards
      for (const k of [0, 1]) { const [bx, bz] = P(s + k * 1.3, off); bag.add('travertine', box(bx - 0.14, y + 0.03, bz - 0.14, bx + 0.14, y + 0.62, bz + 0.14)); col.circle(bx, bz, 0.16, y, y + 0.62); }
    } else if (r < 0.82) {                                                          // a bench
      const [bx, bz] = P(s, off), w = zz ? [0.25, 0.9] : [0.9, 0.25];
      bag.add('travertine', box(bx - w[0], y + 0.03, bz - w[1], bx + w[0], y + 0.45, bz + w[1]));
      col.rect([bx - w[0], bz - w[1], bx + w[0], bz + w[1]], y, y + 0.45);
    }
  }
  if (el.shrine) {
    const [x, z] = P(el.shrine[0], el.shrine[1] * (half - 0.6)), a = el.shrine[1] > 0 ? Math.PI : 0, M = (g) => { g.rotateY(zz ? (el.shrine[1] > 0 ? -Math.PI / 2 : Math.PI / 2) : a); g.translate(x, y, z); return g; };
    void a;
    bag.add('travertine', M(box(-0.4, 0.03, -0.4, 0.4, 0.3, 0.4))); bag.add('stucco_rome', M(box(-0.32, 0.3, -0.32, 0.32, 1.9, 0.32)));
    bag.add('wall_red', M(box(-0.2, 0.9, 0.325, 0.2, 1.7, 0.335))); bag.add('opening', M(box(-0.15, 1.0, 0.335, 0.15, 1.5, 0.34)));
    bag.add('travertine', M(box(-0.4, 1.9, -0.4, 0.4, 2.05, 0.4))); bag.add('roof_tile', M(box(-0.5, 2.05, -0.5, 0.5, 2.15, 0.5)));
    bag.add('stucco_rome', M(box(-0.34, 0.3, 0.32, 0.34, 0.9, 0.5))); bag.add('travertine', M(box(-0.38, 0.9, 0.3, 0.38, 0.96, 0.54)));
    bag.add('bronze', M(lz([[0.001, 0], [0.06, 0], [0.05, 0.1], [0.001, 0.12]], 8).translate(0, 0.96, 0.42)));
    bag.add('wall_red', M(box(-0.3, 1.75, 0.325, 0.3, 1.85, 0.332)));
    col.circle(x, z, 0.5, y, y + 2.1);
  }
}

/**
 * alley_fill: { rect (the gap between two rows), front, fountain } — a wall closing the alley at the street, up to the
 * rows' height, in plaster over brick, with an arched passage 2.3 m wide (a lamp over it, a notice beside), a window
 * above in two storeys, the cornice and a tiled roof; or, where a fountain stands in the gap, the back of its recess
 * 2.8 m behind the front of the rows.
 */
function alleyFill(el, ctx) {
  const T = tools(el, ctx), { W, D, B } = T, rand = rng(el.seed >>> 0), H = 13.0, fountain = !!el.fountain, rec = fountain ? 2.8 : 0.0;
  B('brick', 0.0, W, rec, D, -0.4, H, true);
  if (fountain) {
    B('stucco_rome', 0.0, W, rec - 0.03, rec, 0.0, H - 0.5);
    B('travertine', 0.1, W - 0.1, rec - 0.05, rec, 0.0, 0.5);
    B('opening', W / 2 - 0.45, W / 2 + 0.45, rec - 0.04, rec - 0.02, 4.4, 5.6);                       // a window in the back of the recess
    B('travertine', W / 2 - 0.55, W / 2 + 0.55, rec - 0.07, rec - 0.02, 4.3, 4.4);
    for (let k = 0; k < 2; k++) { B('opening', W / 2 - 0.45, W / 2 + 0.45, rec - 0.04, rec - 0.02, 7.6 + k * 3.1, 8.8 + k * 3.1); B('travertine', W / 2 - 0.55, W / 2 + 0.55, rec - 0.07, rec - 0.02, 7.5 + k * 3.1, 7.6 + k * 3.1); }
    T.B('brick', 0.0, 0.4, 0.0, rec, 0.0, 4.0);
  } else {
    const u = W / 2;
    B('stucco_rome', 0.0, W, -0.03, 0.0, 0.0, H - 0.5);
    B('opening', u - 1.15, u + 1.15, -0.06, 0.0, 0.0, 3.2);
    B('travertine', u - 1.45, u - 1.15, -0.1, 0.1, 0.0, 3.4); B('travertine', u + 1.15, u + 1.45, -0.1, 0.1, 0.0, 3.4);
    B('travertine', u - 1.5, u + 1.5, -0.12, 0.1, 3.2, 3.5);
    B('opening', u - 1.15, u + 1.15, 0.0, D, 0.0, 3.2);
    for (let k = 0; k < 3; k++) { B('opening', u - 0.5, u + 0.5, -0.06, 0.0, 5.0 + k * 2.9, 6.4 + k * 2.9); B('travertine', u - 0.62, u + 0.62, -0.1, 0.0, 4.9 + k * 2.9, 5.0 + k * 2.9); if (rand() < 0.5) { B('shutter_brown', u - 1.0, u - 0.53, -0.1, -0.06, 5.0 + k * 2.9, 6.4 + k * 2.9); B('shutter_brown', u + 0.53, u + 1.0, -0.1, -0.06, 5.0 + k * 2.9, 6.4 + k * 2.9); } }
    D_.lampBracket(T, u + 1.7 > W - 0.3 ? W - 0.3 : u + 1.7, 3.0);
    D_.notice(T, u - 1.7 < 0.4 ? 0.4 : u - 1.7, 1.2, 0.35, 0.9, rand);
    D_.weather(T, 0.2, W - 0.2, 3.6, H - 1.0, rand, 0.7);
  }
  B('brick', -0.05, W + 0.05, -0.06, 0.2, H - 0.34, H - 0.12);
  B('travertine', -0.1, W + 0.1, -0.1, 0.3, H - 0.12, H);
  ctx.bag.add('roof_tile', box(...(() => { const r = T.R(-0.2, W + 0.2, -0.3, D + 0.3); return [r[0], T.y + H, r[1], r[2], T.y + H + 0.12, r[3]]; })()));
  void hip;
}

/**
 * hortus: { rect, seed } — a walled garden in a block between the insulae: a wall 2.8 m high of brick under a tiled coping
 * with an arched gate on one side, gravel paths, beds with hedges of box, a pool with a fountain jet, a pergola of timber
 * posts with a vine over it, a bench and a statue. (The trees are the planting's, src/settlements/rome/ground.js.)
 */
function hortus(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, rand = rng(el.seed || 1), t = 0.5, H = 2.8, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  const gate = Math.floor(rand() * 4), gw = 1.6;
  const wall = (a0, b0, a1, b1, side) => {          // side: 0 n, 1 s, 2 w, 3 e; the gate is cut at the middle of its side
    const along = side < 2, lo = along ? a0 : b0, hi = along ? a1 : b1, mid = (lo + hi) / 2, cut = gate === side;
    const seg = (u0, u1, ya, yb) => { const r = along ? [u0, a1 - 0 + 0, u1, a1] : [a1, u0, a1, u1]; void r; };
    void seg;
    const put = (u0, u1, ya, yb) => {
      if (u1 - u0 < 0.01) return;
      const q = side === 0 ? [u0, z0, u1, z0 + t] : side === 1 ? [u0, z1 - t, u1, z1] : side === 2 ? [x0, u0, x0 + t, u1] : [x1 - t, u0, x1, u1];
      bag.add('brick', box(q[0], y + ya, q[1], q[2], y + yb, q[3])); if (ya < 0.1) col.rect(q, y, y + yb);
    };
    if (cut) { put(lo, mid - gw / 2, -0.4, H); put(mid + gw / 2, hi, -0.4, H); put(mid - gw / 2, mid + gw / 2, 2.4, H); }
    else put(lo, hi, -0.4, H);
    const c = (u0, u1) => { const q = side === 0 ? [u0 - 0.1, z0 - 0.1, u1 + 0.1, z0 + t + 0.1] : side === 1 ? [u0 - 0.1, z1 - t - 0.1, u1 + 0.1, z1 + 0.1] : side === 2 ? [x0 - 0.1, u0 - 0.1, x0 + t + 0.1, u1 + 0.1] : [x1 - t - 0.1, u0 - 0.1, x1 + 0.1, u1 + 0.1]; bag.add('roof_tile', box(q[0], y + H, q[1], q[2], y + H + 0.15, q[3])); };
    c(lo, hi);
  };
  wall(x0, z0, x1, z1, 0); wall(x0, z0, x1, z1, 1); wall(x0, z0, x1, z1, 2); wall(x0, z0, x1, z1, 3);
  // gravel ground, cross paths, the pool
  bag.add('pebbles', box(x0 + t, y - 0.2, z0 + t, x1 - t, y + 0.02, z1 - t));
  const pr = Math.min(x1 - x0, z1 - z0) * 0.14;
  bag.add('travertine', lz([[pr + 0.35, 0], [pr + 0.35, 0.45], [pr + 0.1, 0.45], [pr, 0.45], [pr, 0.05], [0.001, 0.05]], 20).translate(cx, y, cz));
  bag.add('water', lz([[0.001, 0], [pr, 0], [0.001, 0]], 16).translate(cx, y + 0.38, cz));
  bag.add('marble', lz([[0.2, 0], [0.1, 0.2], [0.1, 0.9], [0.2, 1.1], [0.001, 1.1]], 10).translate(cx, y + 0.05, cz));
  bag.add('water', lz([[0.001, 0], [0.025, 0.0], [0.03, 0.7], [0.001, 0.7]], 6).translate(cx, y + 1.1, cz));
  col.circle(cx, cz, pr + 0.35, y, y + 0.45);
  // beds with low hedges of box along the paths
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    const bx0 = cx + sx * (pr + 1.2) - (sx > 0 ? 0 : 3.2), bz0 = cz + sz * (pr + 1.2) - (sz > 0 ? 0 : 3.2), bx1 = bx0 + 3.2, bz1 = bz0 + 3.2;
    if (bx0 < x0 + t + 0.6 || bx1 > x1 - t - 0.6 || bz0 < z0 + t + 0.6 || bz1 > z1 - t - 0.6) continue;
    bag.add('silt', box(bx0, y, bz0, bx1, y + 0.12, bz1));
    for (const [a, b, c, d] of [[bx0, bz0, bx1, bz0 + 0.3], [bx0, bz1 - 0.3, bx1, bz1], [bx0, bz0, bx0 + 0.3, bz1], [bx1 - 0.3, bz0, bx1, bz1]]) bag.add('palm_leaf', box(a, y + 0.02, b, c, y + 0.55, d));
    for (let k = 0; k < 5; k++) bag.add(['cloth_red', 'cloth_ochre', 'cloth_white', 'cloth_indigo', 'cloth_red'][k], box(bx0 + 0.7 + (k % 3) * 0.8, y + 0.12, bz0 + 0.7 + Math.floor(k / 3) * 1.2, bx0 + 0.9 + (k % 3) * 0.8, y + 0.4 + rand() * 0.2, bz0 + 0.9 + Math.floor(k / 3) * 1.2));
  }
  // the pergola along the side opposite the gate: timber posts and rafters, a vine on them
  const pw = Math.min(x1 - x0, z1 - z0) - 2 * t - 2.0, onx = gate < 2 ? true : false;
  const pa = gate === 0 ? [x0 + t + 1.0, z1 - t - 2.4, x1 - t - 1.0, z1 - t - 0.6] : gate === 1 ? [x0 + t + 1.0, z0 + t + 0.6, x1 - t - 1.0, z0 + t + 2.4] : gate === 2 ? [x1 - t - 2.4, z0 + t + 1.0, x1 - t - 0.6, z1 - t - 1.0] : [x0 + t + 0.6, z0 + t + 1.0, x0 + t + 2.4, z1 - t - 1.0];
  void pw; void onx;
  const pl = gate < 2 ? pa[2] - pa[0] : pa[3] - pa[1];
  for (let u = 0; u <= pl + 0.01; u += pl / Math.max(1, Math.round(pl / 2.2))) for (const s of [0, 1]) {
    const px = gate < 2 ? pa[0] + u : pa[0] + s * (pa[2] - pa[0]), pz = gate < 2 ? pa[1] + s * (pa[3] - pa[1]) : pa[1] + u;
    bag.add('timber', box(px - 0.08, y, pz - 0.08, px + 0.08, y + 2.5, pz + 0.08));
  }
  bag.add('timber', box(pa[0] - 0.1, y + 2.5, pa[1] - 0.1, pa[2] + 0.1, y + 2.62, pa[3] + 0.1));
  bag.add('palm_leaf', box(pa[0], y + 2.62, pa[1], pa[2], y + 2.8, pa[3]));
  // a bench under it and a statue on a plinth
  const bm = [(pa[0] + pa[2]) / 2, (pa[1] + pa[3]) / 2];
  bag.add('travertine', box(bm[0] - (gate < 2 ? 1.0 : 0.25), y, bm[1] - (gate < 2 ? 0.25 : 1.0), bm[0] + (gate < 2 ? 1.0 : 0.25), y + 0.45, bm[1] + (gate < 2 ? 0.25 : 1.0)));
  const sx = cx + (rand() < 0.5 ? -1 : 1) * (pr + 2.6), sz = cz + (rand() < 0.5 ? -1 : 1) * 0.5;
  if (sx > x0 + t + 1 && sx < x1 - t - 1) {
    bag.add('marble', box(sx - 0.35, y, sz - 0.35, sx + 0.35, y + 1.0, sz + 0.35));
    bag.add('marble', lz([[0.001, 0], [0.22, 0.02], [0.24, 0.4], [0.2, 0.9], [0.1, 1.05], [0.06, 1.1], [0.08, 1.2], [0.08, 1.35], [0.05, 1.42], [0.001, 1.42]], 12).translate(sx, y + 1.0, sz));
    col.rect([sx - 0.35, sz - 0.35, sx + 0.35, sz + 0.35], y, y + 1.4);
  }
}
/**
 * quay: { edge: [[x, z]…] (the water's edge, running along z), land (+1 if the land lies at +x, else −1), level (the water), top }
 * — the embankment of the Tiber: a wall of travertine ashlar from the bed to the quay, a coping, a paved quay 10 m wide
 * behind it (over the slope of the bank), mooring stones along the edge with rings of bronze.
 */
function quay(el, { bag, col }) {
  const E = el.edge, L = el.land ?? 1, top = el.top ?? 0.06, lev = el.level ?? -5, bed = lev - 3.4, W = 10;
  const at = (p, d) => [p[0] + L * d, p[1]];
  for (let i = 0; i + 1 < E.length; i++) {
    const a = E[i], b = E[i + 1];
    bag.add('travertine', orientedBox(at(a, 0.5), at(b, 0.5), 1.0, bed, top, 0.5));
    col.segment(at(a, 0.5), at(b, 0.5), 1.0, bed, top);
    bag.add('limestone', orientedBox(at(a, 0.35), at(b, 0.35), 1.3, top - 0.0, top + 0.16, 0.5));
    bag.add('flagstone', orientedBox(at(a, 1.0 + W / 2), at(b, 1.0 + W / 2), W, bed, top, 0.6));
    col.segment(at(a, 1.0 + W / 2), at(b, 1.0 + W / 2), W, bed, top - 0.2);
    col.floor([Math.min(a[0], b[0], a[0] + L * (1 + W), b[0] + L * (1 + W)), Math.min(a[1], b[1]), Math.max(a[0], b[0], a[0] + L * (1 + W), b[0] + L * (1 + W)), Math.max(a[1], b[1])].map((v) => v), top);
  }
  // mooring stones every 14 m with a ring
  for (let i = 1; i + 1 < E.length; i += 2) {
    const p = at(E[i], 1.5);
    bag.add('limestone', box(p[0] - 0.2, top + 0.0, p[1] - 0.2, p[0] + 0.2, top + 0.55, p[1] + 0.2)); col.circle(p[0], p[1], 0.22, top, top + 0.55);
    bag.add('bronze', box(p[0] - L * 0.22 - 0.02, top + 0.3, p[1] - 0.08, p[0] - L * 0.22 + 0.02, top + 0.5, p[1] + 0.08));
  }
}
/** landing: { at: [x, z] (on the edge), land (+1 | −1), level, top, w } — a flight of steps down into the water, 0.3 high and 0.45 deep, with a low wall each side. */
function landing(el, { bag, col }) {
  const [x, z] = el.at, L = el.land ?? 1, lev = el.level ?? -5, top = el.top ?? 0.06, w = el.w ?? 4, n = Math.ceil((top - (lev - 1.0)) / 0.3);
  for (let k = 0; k < n; k++) {
    const yt = top - 0.3 * (k + 1) + 0.3, xa = x - L * (0.45 * k), xb = x - L * (0.45 * (k + 1));
    bag.add('travertine', box(Math.min(xa, xb), lev - 3.4, z - w / 2, Math.max(xa, xb), yt, z + w / 2));
    col.floor([Math.min(xa, xb), z - w / 2, Math.max(xa, xb), z + w / 2], yt);
  }
  for (const s of [-1, 1]) bag.add('limestone', box(x - L * 0.45 * n, lev - 3.4, z + s * (w / 2 + 0.2) - 0.2, x, top + 0.35, z + s * (w / 2 + 0.2) + 0.2));
}
/** crane: { at, rot, y } — a treadwheel crane of the harbour: a mast with a jib, the great wheel, a rope and a hook, a pallet of amphorae under it. */
function crane(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, M = (g) => { g.rotateY(el.rot ?? 0); g.translate(x, y, z); return g; };
  bag.add('timber', M(box(-0.3, 0, -0.3, 0.3, 9.0, 0.3)));
  for (const s of [-1, 1]) { bag.add('timber', M(box(s * 1.6 - 0.12, 0, -0.9, s * 1.6 + 0.12, 5.2, -0.66))); bag.add('timber', M(box(s * 1.6 - 0.12, 0, 0.66, s * 1.6 + 0.12, 5.2, 0.9))); }
  bag.add('timber', M(box(-1.8, 2.0, -0.12, 1.8, 2.2, 0.12)));
  bag.add('timber', M(box(-0.15, 8.2, -0.12, 0.15, 8.4, 5.5)));                       // the jib
  bag.add('timber', M(box(-0.15, 6.5, 0.0, 0.15, 6.6, 0.6)));
  bag.add('timber', M(lathe([[2.4, -0.18], [2.4, 0.18], [2.2, 0.18], [2.2, -0.18]], 18).rotateZ(Math.PI / 2).translate(0, 3.0, 0.0)));
  for (let k = 0; k < 12; k++) { const a = k * Math.PI / 6; bag.add('timber', M(box(-0.06, 3.0 + Math.sin(a) * 1.15 - 0.05, Math.cos(a) * 1.15 - 0.05 - 0.0, 0.06, 3.0 + Math.sin(a) * 1.15 + 0.05, Math.cos(a) * 1.15 + 0.05)));
    bag.add('timber', M(box(-0.2, 3.0 + Math.sin(a) * 2.2 - 0.04, Math.cos(a) * 2.2 - 0.04, -0.1, 3.0 + Math.sin(a) * 2.2 + 0.04, Math.cos(a) * 2.2 + 0.04))); }
  bag.add('rope_fibre', M(box(-0.02, 3.0, 5.35, 0.02, 8.2, 5.39)));
  bag.add('iron', M(box(-0.08, 2.0, 5.3, 0.08, 2.1, 5.44)));
  bag.add('timber', M(box(-0.9, 0, 4.6, 0.9, 0.18, 6.0)));
  for (let k = 0; k < 6; k++) bag.add('terracotta', M(lathe([[0.001, 0], [0.1, 0.1], [0.19, 0.4], [0.17, 0.62], [0.07, 0.78], [0.06, 0.95], [0.001, 0.95]], 8).translate(-0.5 + (k % 3) * 0.5, 0.18, 4.95 + Math.floor(k / 3) * 0.5)));
  col.rect([x - 2.2, z - 0.9, x + 2.2, z + 0.9], y, y + 5.2);
}
/**
 * forum_kit: { rect (the square), temple ([x0, z0, x1, z1] the podium), seed } — what stands in a Roman square besides its
 * monuments: two altars of marble before the temple (a block with horns and a bowl), benches under the colonnades, tubs of
 * laurel and myrtle, the album (a white board on posts with the notices painted on it), steles in pairs, a low rostrum.
 */
function forumKit(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, rand = rng(el.seed || 5), T = el.temple, my = (z0 + z1) / 2;
  const blk = (r, ya, yb, m) => { bag.add(m, box(r[0], y + ya, r[1], r[2], y + yb, r[3])); col.rect(r, y + ya, y + yb); };
  // altars before the temple (it faces east)
  for (const dz of [-6, 6]) {
    const ax = T[2] + 7, az = my + dz;
    blk([ax - 0.9, az - 0.7, ax + 0.9, az + 0.7], 0, 0.3, 'marble'); blk([ax - 0.7, az - 0.5, ax + 0.7, az + 0.5], 0.3, 1.4, 'travertine'); blk([ax - 0.85, az - 0.65, ax + 0.85, az + 0.65], 1.4, 1.6, 'marble');
    for (const [hx, hz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) bag.add('marble', lz([[0.001, 0], [0.1, 0.03], [0.07, 0.2], [0.001, 0.26]], 6).translate(ax + hx * 0.75, y + 1.6, az + hz * 0.55));
    bag.add('bronze', lz([[0.3, 0], [0.4, 0.05], [0.38, 0.12], [0.001, 0.1]], 10).translate(ax, y + 1.6, az));
  }
  // benches in front of the colonnades
  for (let x = T[2] + 12; x < x1 - 10; x += 12) for (const z of [z0 + 8.8, z1 - 8.8]) blk([x - 1.0, z - 0.3, x + 1.0, z + 0.3], 0, 0.46, 'marble');
  // tubs with shrubs
  for (let k = 0; k < 8; k++) {
    const x = T[2] + 16 + k * 9, z = k % 2 ? z0 + 11.5 : z1 - 11.5;
    PUT(bag, 'terracotta', lz([[0.001, 0], [0.5, 0.0], [0.6, 0.55], [0.55, 0.6], [0.001, 0.58]], 12), x, y, z); col.circle(x, z, 0.6, y, y + 0.6);
    for (let j = 0; j < 7; j++) PUT(bag, j % 2 ? 'palm_leaf' : 'papyrus', lz([[0.001, 0], [0.35, 0.3], [0.4, 0.9], [0.2, 1.5], [0.001, 1.7]], 7).scale(0.5 + rand() * 0.3, 0.8 + rand() * 0.3, 0.5 + rand() * 0.3), x + (rand() - 0.5) * 0.7, y + 0.5, z + (rand() - 0.5) * 0.7);
  }
  // the album: a white board on two posts with the notices painted on it
  for (const dz of [-24, 22]) {
    const ax = x1 - 14, az = my + dz;
    for (const s of [-1, 1]) blk([ax - 1.4 + (s > 0 ? 2.7 : 0), az - 0.07, ax - 1.3 + (s > 0 ? 2.7 : 0), az + 0.07], 0, 2.7, 'timber');
    bag.add('plaster_white', box(ax - 1.3, y + 1.0, az - 0.05, ax + 1.3, y + 2.5, az + 0.05));
    for (let r = 0; r < 7; r++) for (const sd of [-1, 1]) bag.add(r % 3 ? 'lacquer_black' : 'wall_red', box(ax - 1.1 + rand() * 0.2, y + 1.15 + r * 0.19, az + sd * 0.052 - (sd > 0 ? 0 : 0.004), ax + 1.0 - rand() * 0.6, y + 1.25 + r * 0.19, az + sd * 0.058 + (sd > 0 ? 0.004 : 0)));
    bag.add('timber', box(ax - 1.5, y + 2.5, az - 0.1, ax + 1.5, y + 2.6, az + 0.1)); bag.add('roof_tile', box(ax - 1.6, y + 2.6, az - 0.25, ax + 1.6, y + 2.75, az + 0.25));
    col.rect([ax - 1.5, az - 0.15, ax + 1.5, az + 0.15], y, y + 2.6);
  }
  // pairs of steles with their rounded tops
  for (let k = 0; k < 6; k++) { const x = T[2] + 20 + k * 10, z = my + (k % 2 ? 13 : -13); blk([x - 0.4, z - 0.12, x + 0.4, z + 0.12], 0, 1.3, 'marble'); bag.add('marble', lz([[0.4, 0], [0.001, 0.25]], 10).scale(1, 1, 0.3).translate(x, y + 1.3, z)); }
  // the rostrum: a low platform with steps, a ship's beaks of bronze along its front
  const rx = x1 - 22, rz = my; blk([rx - 4, rz - 6, rx + 4, rz + 6], 0, 1.8, 'travertine'); blk([rx - 4.2, rz - 6.2, rx + 4.2, rz + 6.2], 1.8, 2.0, 'marble');
  for (let k = 0; k < 4; k++) bag.add('bronze', box(rx - 4.6, y + 1.0, rz - 4.5 + k * 3, rx - 4.0, y + 1.2, rz - 3.5 + k * 3));
  for (let k = 0; k < 4; k++) blk([rx - 5.6 + k * 0.4, rz - 1.5, rx - 4.2, rz + 1.5], 0, 0.4 * (k + 1) * 0.5, 'travertine');
}
/**
 * arena_kit: { rect (the track), y } — the sand of a stadium: the starting sill of stone with its grooves, the turning posts at
 * the ends, a row of herms along the edge, the water jars for the runners.
 */
function arenaKit(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, mx = (x0 + x1) / 2;
  bag.add('travertine', box(x0 + 2, y, z1 - 4, x1 - 2, y + 0.08, z1 - 3.4));
  for (let u = x0 + 3; u < x1 - 2.5; u += 1.2) bag.add('granite_grey', box(u, y + 0.08, z1 - 4, u + 0.06, y + 0.1, z1 - 3.4));
  for (const z of [z0 + 6, z1 - 4]) for (const s of [-1, 1]) { PUT(bag, 'marble', lz([[0.5, 0], [0.4, 0.1], [0.3, 1.2], [0.001, 1.8]], 10), mx + s * 6, y, z); col.circle(mx + s * 6, z, 0.45, y, y + 1.5); }
  for (let z = z0 + 20; z < z1 - 14; z += 22) for (const s of [-1, 1]) {
    const x = mx + s * (x1 - x0) / 2 * 0.97;
    bag.add('marble', box(x - 0.2, y, z - 0.2, x + 0.2, y + 1.4, z + 0.2)); bag.add('marble', lz([[0.18, 0], [0.16, 0.2], [0.001, 0.3]], 8).translate(x, y + 1.4, z)); col.circle(x, z, 0.25, y, y + 1.7);
  }
  for (const s of [-1, 1]) for (const z of [z0 + 40, z0 + 100, z0 + 160]) { PUT(bag, 'terracotta', lz([[0.001, 0], [0.12, 0.1], [0.2, 0.4], [0.17, 0.6], [0.08, 0.76], [0.001, 0.78]], 8), mx + s * ((x1 - x0) / 2 - 1.4), y, z); }
}
Object.assign(STYLES.roman.elements, { forum_kit: forumKit, arena_kit: arenaKit, quay, landing, crane, paving, crossing, street_kit: streetKit, alley_fill: alleyFill, hortus });
void fromTriangles;
