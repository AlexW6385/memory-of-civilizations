// Ayutthaya's houses (docs/settlements/ayutthaya.md §5.1, §12): the timber house on posts with its terrace (chan) before the door, a roof of
// thatch or tile with crossed horns (kalae) at the gable ends, shutters, a household altar on the back wall, the space under the floor in
// use (jars, a mortar, firewood, a loom, a drying rack, a small boat); and the Chinese brick shophouse on the canal, its ground floor open to
// the lane with a counter, shelves of goods and a stair to the sleeping floor above, a sign board, lanterns, hung wares. Everything is
// walkable: floors, doors, stairs. Far off, a plain box on posts under a roof.

import { box, lathe, rod, fromTriangles } from '../../core/geom.js';
import { rectRoof, beamTris } from '../ming/index.js';
import { frame, boxR, jar } from '../khmer/village.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const DIRW = { '1,0': 'e', '-1,0': 'w', '0,1': 's', '0,-1': 'n' };
const CLOTH = ['cloth_red', 'cloth_ochre', 'cloth_indigo', 'cloth_white', 'cloth_brown', 'cloth_green', 'cloth_maroon'];

/** The local toolkit of one building: boxes, colliders and walls by the front's frame (u across, v out of the front). */
function kit(el, ctx) {
  const { bag, col } = ctx, fr = frame(el.rect, el.front), { R, W } = fr;
  const B = (m, u0, u1, v0, v1, y0, y1) => bag.add(m, boxR(R(u0, u1, v0, v1), y0, y1));
  const C = (u0, u1, v0, v1, y0, y1) => col.rect(R(u0, u1, v0, v1), y0, y1);
  const F = (u0, u1, v0, v1, y) => col.floor(R(u0, u1, v0, v1), y);
  const BC = (m, u0, u1, v0, v1, y0, y1) => { B(m, u0, u1, v0, v1, y0, y1); C(u0, u1, v0, v1, y0, y1); };
  /** A wall along u at v (thickness th) from u0 to u1, openings ops [{a, b, sill, head}] (u from a to b, y from sill to head, all absolute y). */
  const wallU = (m, u0, u1, v, th, y0, y1, ops = []) => {
    let u = u0;
    for (const o of [...ops].sort((p, q) => p.a - q.a)) {
      if (o.a > u) BC(m, u, o.a, v - th / 2, v + th / 2, y0, y1);
      if (o.sill > y0) BC(m, o.a, o.b, v - th / 2, v + th / 2, y0, o.sill);
      if (o.head < y1) BC(m, o.a, o.b, v - th / 2, v + th / 2, o.head, y1);
      u = o.b;
    }
    if (u < u1) BC(m, u, u1, v - th / 2, v + th / 2, y0, y1);
  };
  const wallV = (m, v0, v1, u, th, y0, y1, ops = []) => {
    let v = v0;
    for (const o of [...ops].sort((p, q) => p.a - q.a)) {
      if (o.a > v) BC(m, u - th / 2, u + th / 2, v, o.a, y0, y1);
      if (o.sill > y0) BC(m, u - th / 2, u + th / 2, o.a, o.b, y0, o.sill);
      if (o.head < y1) BC(m, u - th / 2, u + th / 2, o.a, o.b, o.head, y1);
      v = o.b;
    }
    if (v < v1) BC(m, u - th / 2, u + th / 2, v, v1, y0, y1);
  };
  /** A cylinder (lathe) at local (u, v). */
  const L = (m, prof, u, v, y, seg = 8) => { const [x, z] = W(u, v); bag.add(m, lathe(prof, seg, null, x, y, z)); };
  /** A thin sheet of cloth hanging between two local points at heights ya (top) .. yb (bottom). */
  const sheet = (m, u0, v0, u1, v1, ya, yb) => { const a = W(u0, v0), b = W(u1, v1), t = []; const q = (p0, p1, p2, p3) => t.push(...p0, ...p1, ...p2, ...p0, ...p2, ...p3, ...p0, ...p2, ...p1, ...p0, ...p3, ...p2); q([a[0], ya, a[1]], [b[0], ya, b[1]], [b[0], yb, b[1]], [a[0], yb, a[1]]); bag.add(m, fromTriangles(t)); };
  const post = (u, v, y0, y1, r = 0.11) => { const [x, z] = W(u, v); bag.add('timber', lathe([[r * 1.15, 0], [r, 0.4], [r * 0.96, y1 - y0]], 6, null, x, y0, z)); col.circle(x, z, r + 0.04, y0, y1); };
  /** The post's flood line: a band of dark algae at the foot. */
  const foot = (u, v, r = 0.11) => { const [x, z] = W(u, v); bag.add('plaster_damp', lathe([[r * 1.2, 0], [r * 1.13, 0.75], [r * 1.0, 0.9]], 6, null, x, 0, z)); };
  const tri = (a, b, c, out) => out.push(...a, ...b, ...c, ...a, ...c, ...b);
  return { ...fr, B, C, F, BC, wallU, wallV, L, sheet, post, foot, tri, bag, col, ctx };
}

/** Crossed horns (kalae) at both ends of a ridge: centre c [x, z], half-length A along the axis (long: x, else z), ridge height ry. */
function kalae(bag, c, A, ry, long, mat = 'timber') {
  const d = long ? [1, 0] : [0, 1], t = [];
  for (const sg of [-1, 1]) for (const lean of [-1, 1]) {
    const ex = c[0] + d[0] * sg * A, ez = c[1] + d[1] * sg * A;
    beamTris(t, [ex - d[0] * sg * 0.15 + (long ? 0 : lean * 0.04), ry - 0.45, ez - d[1] * sg * 0.15 + (long ? lean * 0.04 : 0)], [ex + d[0] * sg * 0.35 + (long ? 0 : lean * 0.5), ry + 0.8, ez + d[1] * sg * 0.35 + (long ? lean * 0.5 : 0)], 0.03, 0.1);
  }
  bag.add(mat, fromTriangles(t));
}

/** A small spirit house (san phra phum) on its post, with offerings: the lot's guardian, at the corner of the yard. */
function spiritHouse(k, u, v, y = 0) {
  const { bag, col, W } = k, [x, z] = W(u, v);
  bag.add('timber', lathe([[0.1, 0], [0.08, 1.45]], 6, null, x, y, z)); col.circle(x, z, 0.14, y, y + 1.6);
  bag.add('plaster_white', box(x - 0.34, y + 1.45, z - 0.34, x + 0.34, y + 1.5, z + 0.34));
  bag.add('plaster_white', box(x - 0.24, y + 1.5, z - 0.24, x + 0.24, y + 1.92, z + 0.24));
  bag.add('opening', box(x - 0.12, y + 1.55, z - 0.255, x + 0.12, y + 1.82, z - 0.23));
  bag.add('tile_dark', lathe([[0.4, 0], [0.3, 0.1], [0.001, 0.38]], 4, null, x, y + 1.92, z).rotateY(Math.PI / 4));
  bag.add('gold', rod([x, y + 2.28, z], [x, y + 2.52, z], 0.025, 4));
  bag.add('cloth_red', box(x - 0.3, y + 1.5, z - 0.46, x - 0.1, y + 1.56, z - 0.36));
  bag.add('cloth_ochre', lathe([[0.001, 0], [0.07, 0.01], [0.05, 0.1], [0.001, 0.13]], 6, null, x + 0.18, y + 1.5, z - 0.42));
  bag.add('lamp_paper', lathe([[0.001, 0], [0.05, 0.01], [0.04, 0.06]], 6, null, x + 0.05, y + 1.5, z - 0.43));
}

/** A lean-to roof sheet from the high edge (u0..u1 at v0, height yh) to the low edge (at v1, height yl). */
function leanTo(k, mat, u0, u1, v0, v1, yh, yl) {
  const { W, bag } = k, T = [], q = (a, b, c, d) => T.push(...a, ...b, ...c, ...a, ...c, ...d, ...a, ...c, ...b, ...a, ...d, ...c);
  const P = (u, v, y) => { const [x, z] = W(u, v); return [x, y, z]; };
  q(P(u0, v0, yh), P(u1, v0, yh), P(u1, v1, yl), P(u0, v1, yl));
  bag.add(mat, fromTriangles(T));
}

// ── the timber house on posts ───────────────────────────────────────────────────────────────────────────────────
function stilt(el, ctx) {
  const rand = rng(el.seed || 1), k = kit(el, ctx), { hF, hS, B, BC, C, F, wallU, wallV, L, sheet, post, foot, W, R, bag, col } = k;
  const kind = el.kind ?? 'plain', big = kind === 'big', small = kind === 'small';
  const up = 1.9 + rand() * 0.6, wallH = 2.35, top = up + wallH, th = 0.07;
  const tile = big ? rand() < 0.75 : rand() < 0.3, wallM = ['timber', 'planks_grey', 'reed_mat', 'wood_ochre'][Math.floor(rand() * 4)];
  const td = small ? 0.9 : big ? 2.3 : 1.6, vb = hF - td, door = (rand() < 0.5 ? -1 : 1) * hS * 0.38;
  // posts: the perimeter rise to the eaves, the inner carry the floor; each with its flood-line band
  const nu = hS > 2.3 ? 3 : 2, nv = hF > 3 ? 4 : 3;
  for (let i = 0; i <= nv; i++) for (let j = 0; j <= nu; j++) {
    const v = -hF + 2 * hF * i / nv, u = -hS + 2 * hS * j / nu, edge = i === 0 || j === 0 || j === nu || (i === nv && !small);
    if (v > vb + 0.2 && !(i === nv && edge)) continue;
    post(u, v, 0, edge && v <= vb + 0.1 ? top : up - 0.02); foot(u, v);
  }
  // floor: bearers, boards, an overhang; terrace the same level
  for (let j = 0; j <= nu; j++) { const u = -hS + 2 * hS * j / nu; B('timber', u - 0.08, u + 0.08, -hF - 0.05, hF + 0.05, up - 0.32, up - 0.15); }
  B('timber', -hS - 0.12, hS + 0.12, -hF - 0.12, hF + 0.12, up - 0.15, up); F(-hS - 0.1, hS + 0.1, -hF - 0.1, hF + 0.1, up);
  // walls with windows (shutters propped open) and the door onto the terrace
  const win = (c, w = 0.46) => ({ a: c - w, b: c + w, sill: up + 0.9, head: up + 1.7 });
  wallV(wallM, -hF, vb, -hS, th, up, top, [win((-hF + vb) / 2 + (rand() - 0.5))]);
  wallV(wallM, -hF, vb, hS, th, up, top, vb - -hF > 3.4 ? [win((-hF + vb) / 2 + (rand() - 0.5))] : []);
  wallU(wallM, -hS, hS, -hF, th, up, top, rand() < 0.6 ? [{ a: -0.4, b: 0.4, sill: up + 0.9, head: up + 1.6 }] : []);
  const dOp = { a: door - 0.5, b: door + 0.5, sill: up, head: up + 1.9 };
  const wOp = { a: -door * 0.55 - 0.42, b: -door * 0.55 + 0.42, sill: up + 0.9, head: up + 1.65 };
  wallU(wallM, -hS, hS, vb, th, up, top, [dOp, ...(hS > 2.0 ? [wOp] : [])]);
  B('timber', door - 0.62, door + 0.62, vb - 0.1, vb + 0.1, up + 1.9, up + 2.02);
  // the leaf of the shutter propped on a stick, at the front window
  if (hS > 2.0) { const t = [], c = W(-door * 0.55, vb + 0.06), c2 = W(-door * 0.55, vb + 0.78); beamTris(t, [c[0], up + 1.67, c[1]], [c2[0], up + 1.98, c2[1]], 0.8, 0.035); bag.add('shutter_brown', fromTriangles(t)); }
  for (const y of [up, top - 0.12]) for (const [u0, u1, v0, v1] of [[-hS - 0.05, hS + 0.05, -hF - 0.06, -hF + 0.06], [-hS - 0.05, hS + 0.05, vb - 0.06, vb + 0.06], [-hS - 0.06, -hS + 0.06, -hF, vb], [hS - 0.06, hS + 0.06, -hF, vb]]) B('timber', u0, u1, v0, v1, y, y + 0.1);
  // a partition in the large house: a second room behind, with a doorway
  if (big) wallU('timber', -hS, hS, (-hF + vb) / 2, th, up, top - 0.35, [{ a: -0.45, b: 0.45, sill: up, head: up + 1.85 }]);
  // ── the terrace (chan): rail along the front and sides, a bench by the wall, jars, flowers, laundry, a hung lantern
  const dw = Math.min(hS, 1.9);
  for (const s of [-1, 1]) {
    post(s * (hS - 0.05), hF - 0.05, 0, up + 1.0, 0.09); foot(s * (hS - 0.05), hF - 0.05, 0.09);
    B('timber', s * hS - 0.045, s * hS + 0.045, vb, hF, up + 0.88, up + 0.96); B('timber', s * hS - 0.025, s * hS + 0.025, vb, hF, up + 0.4, up + 0.45);
    k.col.segment(W(s * hS, vb), W(s * hS, hF), 0.1, up, up + 1.0);
    const g0 = s * 0.55, g1 = s * (hS - 0.05);
    B('timber', Math.min(g0, g1), Math.max(g0, g1), hF - 0.045, hF + 0.045, up + 0.88, up + 0.96);
    k.col.segment(W(g0, hF), W(g1, hF), 0.1, up, up + 1.0);
  }
  bag.add('timber', boxR(R(-0.55, 0.55, hF - 0.12, hF + 0.12), up - 0.05, up));   // the stair's head
  // the stair, rails, treads on stringers
  const run = 0.34, nSteps = Math.ceil(up / 0.3), rise = up / nSteps, vd = hF + 0.02;
  { const t = [];
    for (const s of [-1, 1]) { const a = W(s * 0.5, vd), b = W(s * 0.5, vd + run * nSteps); beamTris(t, [a[0], up - 0.05, a[1]], [b[0], 0.1, b[1]], 0.035, 0.17); beamTris(t, [a[0], up + 0.85, a[1]], [b[0], 0.95, b[1]], 0.03, 0.06); }
    bag.add('timber', fromTriangles(t));
    for (let n = 1; n < nSteps; n++) { const v0 = vd + (n - 1) * run, y = up - n * rise; B('timber', -0.5, 0.5, v0, v0 + run + 0.02, y - 0.05, y); F(-0.5, 0.5, v0, v0 + run + 0.02, y); }
    F(-0.5, 0.5, vd + (nSteps - 1) * run, vd + nSteps * run + 0.5, 0);
    for (const s of [-1, 1]) { const [x, z] = W(s * 0.5, vd + run * nSteps - 0.04); bag.add('timber', lathe([[0.06, 0], [0.05, 1.0]], 5, null, x, 0, z)); }
  }
  // the bench against the house wall, a water jar with its dipper at the stair head, potted plants, a hung cage
  if (!small) {
    const bu = -door * 0.55, bw = Math.min(1.2, hS * 0.55);
    B('timber', bu - bw, bu + bw, vb + 0.08, vb + 0.5, up + 0.38, up + 0.44); B('timber', bu - bw + 0.05, bu - bw + 0.12, vb + 0.12, vb + 0.46, up, up + 0.38); B('timber', bu + bw - 0.12, bu + bw - 0.05, vb + 0.12, vb + 0.46, up, up + 0.38);
    jar({ add: (m, g) => bag.add(m, g) }, ...W(door + Math.sign(door || 1) * 0.9, hF - 0.4), up, 0.85, 'pottery_dark');
    for (const [u, v] of [[-hS + 0.35, hF - 0.35], [hS - 0.35, vb + 0.4]]) { L('terracotta', [[0.001, 0], [0.12, 0], [0.18, 0.28], [0.001, 0.28]], u, v, up, 8); L('glaze_green', [[0.02, 0.28], [0.3, 0.45], [0.34, 0.7], [0.12, 0.85], [0.001, 0.9]], u, v, up, 7); }
    if (rand() < 0.7) { const c = W(hS * 0.5, vb + 0.5); bag.add('wicker', lathe([[0.001, 0], [0.16, 0.0], [0.2, 0.25], [0.12, 0.5], [0.001, 0.52]], 8, null, c[0], up + 1.35, c[1])); bag.add('timber', rod([c[0], up + 1.8, c[1]], [c[0], up + 2.35, c[1]], 0.01, 3)); }
  }
  // laundry: a bamboo pole across the terrace's front posts with the family's cloths and a sash hung over it
  if (rand() < 0.75) {
    const u0 = -hS + 0.2, u1 = hS - 0.2, n = 2 + Math.floor(rand() * 3);
    { const p = W(u0, hF + 0.12), q = W(u1, hF + 0.12); bag.add('bamboo_culm', rod([p[0], up + 1.55, p[1]], [q[0], up + 1.55, q[1]], 0.025, 4)); }
    for (let n2 = 0; n2 < n; n2++) { const uu = u0 + (u1 - u0) * (n2 + 0.5) / n; sheet(CLOTH[Math.floor(rand() * CLOTH.length)], uu - 0.2, hF + 0.12, uu + 0.2, hF + 0.12, up + 1.53, up + 0.75 + rand() * 0.3); }
  }
  if (!small) { const c = W(door, hF + 0.05); bag.add('lamp_paper', lathe([[0.001, 0], [0.12, 0.05], [0.14, 0.18], [0.1, 0.32], [0.001, 0.34]], 8, null, c[0], up + 1.95 - 0.3, c[1])); bag.add('timber', rod([c[0], up + 2.1, c[1]], [c[0], up + 2.3, c[1]], 0.008, 3)); }
  // the roof over the block (thatch or tile), horns, a lean-to over the terrace on the big house
  const rb = R(-hS, hS, -hF, vb), long = rb[2] - rb[0] >= rb[3] - rb[1], c0 = [(rb[0] + rb[2]) / 2, (rb[1] + rb[3]) / 2];
  const A = (long ? rb[2] - rb[0] : rb[3] - rb[1]) / 2 + 0.85, Bh = (long ? rb[3] - rb[1] : rb[2] - rb[0]) / 2 + 0.95, rise2 = Bh * (tile ? 0.85 : 1.15);
  rectRoof({ c: c0, A, B: Bh, y: top, rise: rise2, kind: 'gable', sweep: 0, curl: false, p: 1.05, alongZ: !long, mat: tile ? 'roof_tile' : 'thatch_palm', soffit: tile ? 'timber' : 'thatch_palm' }, bag);
  kalae(bag, c0, A, top + rise2, long, tile ? 'timber_red' : 'timber');
  if (!small) { leanTo(k, tile ? 'roof_tile' : 'thatch_palm', -hS - 0.2, hS + 0.2, vb - 0.1, hF + 0.35, top - 0.15, up + 2.05); for (const s of [-1, 1]) post(s * (hS - 0.05), hF - 0.05, up, up + 2.05, 0.07); }
  // ── under the house: the floor's space in use
  const use = rand();
  const un = (u, v) => W(u, v);
  if (use < 0.25) { // a small boat drawn up (a sampan on its side) and an oar
    const [x, z] = un(-hS * 0.4, -hF * 0.2); bag.add('wood_ochre', lathe([[0.001, 0], [0.45, 0.05], [0.5, 0.35], [0.001, 0.3]], 8, null, 0, 0.0, 0).scale(0.9, 1, 3.3).translate(x, 0, z)); bag.add('timber', rod([x - 0.5, 0.1, z - 1.9], [x + 0.2, 1.6, z + 1.2], 0.03, 4));
    col.circle(x, z, 0.5, 0, 0.5);
  } else if (use < 0.5) { // a loom with its warp
    const [x, z] = un(hS * 0.2, -hF * 0.3); for (const s of [-1, 1]) bag.add('timber', box(x + s * 0.55 - 0.04, 0.0, z - 0.4, x + s * 0.55 + 0.04, 1.1, z - 0.32)); bag.add('timber', box(x - 0.55, 1.05, z - 0.4, x + 0.55, 1.12, z - 0.32)); bag.add('cloth_indigo', box(x - 0.5, 0.4, z - 0.37, x + 0.5, 1.05, z - 0.35)); bag.add('timber', box(x - 0.5, 0.35, z - 0.4, x + 0.5, 0.4, z - 0.32));
  } else if (use < 0.75) { // fish on a drying rack and a net hung over a pole
    const [x, z] = un(-hS * 0.3, -hF * 0.25); for (const s of [-1, 1]) bag.add('bamboo_culm', rod([x + s * 0.9, 0, z], [x + s * 0.9, 1.5, z], 0.03, 4)); bag.add('bamboo_culm', rod([x - 0.9, 1.4, z], [x + 0.9, 1.4, z], 0.025, 4));
    for (let n = 0; n < 7; n++) bag.add('silver', box(x - 0.8 + n * 0.26, 0.85, z - 0.02, x - 0.7 + n * 0.26, 1.4, z + 0.02));
    const [nx, nz] = un(hS * 0.45, -hF * 0.55); bag.add('timber', rod([nx - 0.5, 1.5, nz], [nx + 0.5, 1.5, nz], 0.025, 4)); bag.add('rope_fibre', box(nx - 0.45, 0.6, nz - 0.02, nx + 0.45, 1.5, nz + 0.02));
  } else { // mortar and pestle, a hammock slung between two posts
    const [x, z] = un(hS * 0.3, -hF * 0.3); bag.add('laterite', lathe([[0.001, 0], [0.2, 0], [0.23, 0.12], [0.2, 0.34], [0.26, 0.4], [0.2, 0.4], [0.12, 0.3], [0.001, 0.3]], 8, null, x, 0, z)); bag.add('timber', rod([x + 0.05, 0.3, z], [x + 0.3, 1.2, z + 0.1], 0.035, 4));
    const a = un(-hS * 0.6, 0), b = un(-hS * 0.6, hF * 0.5), m = [(a[0] + b[0]) / 2, 0.9, (a[1] + b[1]) / 2], hm = []; k.tri([a[0], 1.4, a[1]], [b[0], 1.4, b[1]], [m[0] + 0.25, m[1], m[2]], hm); k.tri([a[0], 1.4, a[1]], [b[0], 1.4, b[1]], [m[0] - 0.25, m[1], m[2]], hm); bag.add('cloth_ochre', fromTriangles(hm));
  }
  for (const s of [-1, 1]) if (rand() < 0.8) { const [x, z] = W(s * 1.1, vd + 0.5 + rand() * 0.5); jar({ add: (m, g) => bag.add(m, g) }, x, z, 0, 0.9 + rand() * 0.25, rand() < 0.5 ? 'terracotta' : 'pottery_dark'); col.circle(x, z, 0.3, 0, 0.7); }
  { const [x, z] = W(-hS * 0.7, vb - 0.4); for (let n = 0; n < 4; n++) bag.add('timber', box(x - 0.25, n * 0.13, z - 0.45 + n * 0.01, x + 0.25, n * 0.13 + 0.1, z + 0.45)); }
  // ── inside: sleeping mats under a net, the hearth, the altar shelf with its image, a shelf of baskets, a chest
  const iu0 = -hS + 0.15, iu1 = hS - 0.15, iv0 = -hF + 0.15, iv1 = vb - 0.15;
  { const m = (rand() < 0.5 ? -1 : 1), mu = m * (hS - 0.8);
    B('reed_mat', mu - 0.4, mu + 0.4, iv0 + 0.3, iv0 + 2.0, up, up + 0.015); B(CLOTH[Math.floor(rand() * 5)], mu - 0.2, mu + 0.2, iv0 + 0.3, iv0 + 0.55, up + 0.015, up + 0.13);
    if (rand() < 0.7) sheet('cloth_white', mu - 0.5, iv0 + 0.25, mu + 0.5, iv0 + 0.25, up + 1.7, up + 0.9);
    const hu = -m * (hS - 0.6), hv = iv1 - 0.55; B('terracotta', hu - 0.35, hu + 0.35, hv - 0.35, hv + 0.35, up, up + 0.1);
    L('pottery_dark', [[0.001, 0.1], [0.14, 0.12], [0.2, 0.24], [0.17, 0.36], [0.2, 0.38]], hu, hv, up, 9); C(hu - 0.38, hu + 0.38, hv - 0.38, hv + 0.38, up, up + 0.4);
  }
  // the household altar on the back wall: a shelf with a gilded image, flowers and a candle
  { const au = hS * 0.0 + (rand() - 0.5) * hS * 0.6; B('timber', au - 0.5, au + 0.5, iv0, iv0 + 0.3, up + 1.45, up + 1.5); B('timber_red', au - 0.5, au + 0.5, iv0 + 0.28, iv0 + 0.3, up + 1.1, up + 1.45);
    L('gold', [[0.001, 0], [0.12, 0.01], [0.1, 0.12], [0.07, 0.24], [0.05, 0.34], [0.001, 0.4]], au, iv0 + 0.15, up + 1.5, 8); L('lotus_leaf', [[0.001, 0], [0.06, 0.02], [0.04, 0.1], [0.001, 0.14]], au - 0.3, iv0 + 0.15, up + 1.5, 6); L('flame', [[0.001, 0], [0.012, 0.1], [0.001, 0.14]], au + 0.3, iv0 + 0.15, up + 1.5, 4); }
  for (let n = 0; n < 3; n++) L('wicker', [[0.001, 0], [0.18, 0.0], [0.24, 0.2], [0.26, 0.3], [0.001, 0.3]], iu0 + 0.55 + n * 0.55, iv1 - 0.1, up + 1.5, 8);
  B('timber', iu0, iu1, iv1 - 0.4, iv1, up + 1.45, up + 1.5);
  if (hS > 1.9) { const cu = (rand() < 0.5 ? -1 : 1) * (hS - 0.55); BC('timber_red', cu - 0.4, cu + 0.4, -hF * 0.1 - 0.3, -hF * 0.1 + 0.3, up, up + 0.55); B('clay_gilt', cu - 0.42, cu + 0.42, -hF * 0.1 - 0.32, -hF * 0.1 - 0.28, up + 0.3, up + 0.38); }
  // the lamp: a wick in a dish of oil on the hearth's rim, the room lit by it
  { const [lx, lz] = W(0.0, (iv0 + iv1) / 2);
    bag.add('rope_fibre', rod([lx, top - 0.05, lz], [lx, up + 2.08, lz], 0.007, 3));
    bag.add('lamp_paper', lathe([[0.001, 0], [0.1, 0.04], [0.13, 0.15], [0.09, 0.27], [0.001, 0.3]], 8, null, lx, up + 1.8, lz));
    if (ctx.lights) ctx.lights.push({ at: [lx, up + 1.75, lz], color: '#ffb25a', intensity: 2.6, distance: 6.5 }); }
  // the yard: the spirit house at the lot's corner, a bamboo fence at the lane's edge
  spiritHouse(k, -hS - 0.55, hF + 1.1, 0);
  if (rand() < 0.6) { const t = []; for (let u = -hS - 0.6; u <= hS + 0.6; u += 1.0) { const [x, z] = W(u, hF + 1.9); if (Math.abs(u) > 0.7) bag.add('timber', lathe([[0.04, 0], [0.04, 1.05]], 5, null, x, 0, z)); } void t; const g0 = [-hS - 0.6, hF + 1.9], g1 = [-0.75, hF + 1.9], h0 = [0.75, hF + 1.9], h1 = [hS + 0.6, hF + 1.9]; for (const [p, q] of [[g0, g1], [h0, h1]]) { B('reed_mat', p[0], q[0], p[1] - 0.02, p[1] + 0.02, 0.1, 0.95); k.col.segment(W(p[0], p[1]), W(q[0], q[1]), 0.08, 0, 1.0); } }
}

// ── the shophouse on the canal ──────────────────────────────────────────────────────────────────────────────────
function shop(el, ctx) {
  const rand = rng(el.seed || 1), k = kit(el, ctx), { hF, hS, B, BC, C, F, wallU, wallV, L, sheet, W, R, bag, col } = k;
  const y0 = 0.3, gh = 3.1, y1 = y0 + gh + 0.25, uh = 2.4, top = y1 + uh, th = 0.28;
  const pl = rand() < 0.5 ? 'brick_baked' : 'plaster_white', up = rand() < 0.5 ? 'timber' : 'planks_grey';
  // the plinth and the lane step; the party walls of brick, whitewashed above a damp band
  BC('brick_baked', -hS, hS, -hF, hF + 0.25, 0, y0);
  for (const s of [-1, 1]) { const wu = s * (hS - th / 2); wallV(pl, -hF, hF, wu, th, y0, y1, []); B('plaster_damp', wu - th / 2 - 0.01, wu + th / 2 + 0.01, -hF, hF, y0, y0 + 0.8); }
  // back wall with a door to the yard
  wallU(pl, -hS, hS, -hF + th / 2, th, y0, y1, [{ a: -0.5, b: 0.5, sill: y0, head: y0 + 2.0 }]);
  // the front: two brick piers, a lintel beam, the shutter boards stacked at one side, the counter across, an entry gap at the other
  const pu = hS - th - 0.1;
  BC(pl, -hS, -hS + th + 0.45, hF - 0.45, hF, y0, y1); BC(pl, hS - th - 0.45, hS, hF - 0.45, hF, y0, y1);
  B('timber_red', -hS, hS, hF - 0.3, hF + 0.05, y0 + gh - 0.5, y0 + gh); B('clay_gilt', -hS, hS, hF - 0.02, hF + 0.06, y0 + gh - 0.12, y0 + gh - 0.07);
  const side = rand() < 0.5 ? -1 : 1;
  for (let n = 0; n < 7; n++) B('planks_grey', side * (hS - th - 0.5) - 0.02 - (side > 0 ? 0.0 : -0.0) * 0, side * (hS - th - 0.5) + 0.02, hF - 0.25 + n * 0.0, hF - 0.1, y0 - 0.02, y0 + gh - 0.53);   // the shutter boards stacked in their slot
  const cu0 = side > 0 ? -pu : -pu + 1.2, cu1 = side > 0 ? pu - 1.2 : pu;
  BC('timber', Math.min(cu0, cu1), Math.max(cu0, cu1), hF - 0.95, hF - 0.45, y0 - 0.02, y0 + 0.95); B('planks_grey', Math.min(cu0, cu1) - 0.05, Math.max(cu0, cu1) + 0.05, hF - 1.0, hF - 0.4, y0 + 0.95, y0 + 1.02);
  // goods on the counter: bowls and baskets, a balance, rolls of cloth; and hung from the lintel: strings of dried fish, baskets, gourds, a lantern
  const gl = Math.min(cu0, cu1) + 0.3, gr = Math.max(cu0, cu1) - 0.3;
  for (let u = gl; u < gr; u += 0.5) { const r = rand(); if (r < 0.35) L('terracotta', [[0.001, 0], [0.13, 0], [0.19, 0.18], [0.001, 0.2]], u, hF - 0.7, y0 + 1.02, 8); else if (r < 0.65) L('wicker', [[0.001, 0], [0.16, 0], [0.2, 0.14], [0.001, 0.15]], u, hF - 0.7, y0 + 1.02, 8); else if (r < 0.85) { const p = W(u - 0.2, hF - 0.7), q = W(u + 0.2, hF - 0.7); bag.add(CLOTH[Math.floor(rand() * CLOTH.length)], rod([p[0], y0 + 1.12, p[1]], [q[0], y0 + 1.12, q[1]], 0.07, 6)); } }
  for (let u = -hS + 0.9; u < hS - 0.7; u += 0.42 + rand() * 0.2) { const h = 0.5 + rand() * 0.9, [x, z] = W(u, hF + 0.05); bag.add('rope_fibre', rod([x, y0 + gh - 0.5, z], [x, y0 + gh - 0.5 - h, z], 0.006, 3)); const r = rand(); bag.add(r < 0.4 ? 'silver' : r < 0.7 ? 'wicker' : 'glaze_yellow', lathe(r < 0.4 ? [[0.001, 0], [0.04, 0.0], [0.05, 0.3], [0.001, 0.32]] : [[0.001, 0], [0.1, 0.02], [0.13, 0.14], [0.001, 0.2]], 6, null, x, y0 + gh - 0.5 - h - (r < 0.4 ? 0.32 : 0.2), z)); }
  // shelves along both side walls: jars, sacks, baskets, bolts of cloth
  for (const s of [-1, 1]) for (const sy of [0.5, 1.2, 1.9]) {
    const su = s * (hS - th - 0.18); B('timber', su - 0.18, su + 0.18, -hF + 0.6, hF - 1.2, y0 + sy, y0 + sy + 0.04);
    for (let v = -hF + 0.8; v < hF - 1.4; v += 0.46) { const r = rand(); const m = r < 0.3 ? 'terracotta' : r < 0.5 ? 'sacking' : r < 0.7 ? 'wicker' : r < 0.85 ? 'pottery_dark' : CLOTH[Math.floor(rand() * 4)]; L(m, [[0.001, 0], [0.1, 0], [0.14, 0.12], [0.11, 0.26], [0.001, 0.28]], su, v, y0 + sy + 0.04, 7); }
    col.segment(W(s * (hS - th - 0.18), -hF + 0.6), W(s * (hS - th - 0.18), hF - 1.2), 0.3, y0 + 0.05, y0 + 2.1);
  }
  // the stair along the right wall rising toward the front to the sleeping floor
  const ns = 14, rise = (y1 - y0) / ns, run = 0.25, sv0 = -hF + 0.7, su0 = -side * (hS - th - 0.45), sv1 = sv0 + ns * run;
  if (sv1 < hF - 1.3) {
    for (let n = 0; n < ns; n++) B('timber', su0 - 0.45, su0 + 0.45, sv0 + n * run, sv0 + n * run + run + 0.01, y0 - 0.02, y0 + rise * (n + 1) - 0.035);
    col.ramp(R(su0 - 0.45, su0 + 0.45, sv0, sv1), y0, y1, DIRW[`${k.F[0]},${k.F[1]}`]);
    // the floor of the upper room, with the stair's well open
    const wl = su0 - 0.45, wr = su0 + 0.45, ul = Math.min(wl, wr), ur = Math.max(wl, wr);
    B('timber', -hS + th, hS - th, -hF + th, hF - 0.1, y1 - 0.22, y1 - 0.04);
    void ul; void ur;
    F(-hS, side > 0 ? ul : hS, -hF, hF, y1);
    const [fa, fb] = side > 0 ? [ur, hS] : [-hS, ul]; F(Math.min(fa, fb), Math.max(fa, fb), sv1, hF, y1); F(Math.min(fa, fb), Math.max(fa, fb), -hF, sv0, y1);
    if (side > 0) F(-hS, ul, -hF, hF, y1);
    else F(ur, hS, -hF, hF, y1);
  } else { B('timber', -hS + th, hS - th, -hF + th, hF - 0.1, y1 - 0.22, y1 - 0.04); F(-hS, hS, -hF, hF, y1); }
  // ── the upper storey: timber walls, shuttered windows to the lane, a balcony with a rail, the sleeping place behind
  const uy = y1, ut = y1 + uh, uw = uy - 0.03;
  for (const s of [-1, 1]) wallV(up, -hF + 0.04, hF - 0.04, s * (hS - th / 2), th - 0.1, uw, ut, [{ a: -0.4, b: 0.4, sill: uy + 0.9, head: uy + 1.75 }]);
  wallU(up, -hS + 0.04, hS - 0.04, -hF + 0.1, 0.12, uw, ut, [{ a: -0.4, b: 0.4, sill: uy + 0.9, head: uy + 1.75 }]);
  const fw = [{ a: -0.5, b: 0.5, sill: uy, head: uy + 1.9 }, { a: -hS + 0.7, b: -hS + 1.7, sill: uy + 0.2, head: uy + 2.0 }, { a: hS - 1.7, b: hS - 0.7, sill: uy + 0.2, head: uy + 2.0 }];
  wallU(up, -hS + 0.04, hS - 0.04, hF - 0.1, 0.12, uw, ut, fw);
  for (const o of fw) { const m = (o.a + o.b) / 2; B('timber', m - 0.52, m + 0.52, hF - 0.14, hF + 0.2, uy + 0.2, uy + 0.26); for (const s of [-1, 1]) B('shutter_green', m + s * 0.55 - 0.02, m + s * 0.55 + 0.02, hF + 0.02, hF + 0.62, uy + 0.3, uy + 1.95); for (const s of [-1, 1]) B('timber', m + s * 0.42 - 0.025, m + s * 0.42 + 0.025, hF + 0.1, hF + 0.18, uy + 0.26, uy + 0.95); B('timber', m - 0.5, m + 0.5, hF + 0.15, hF + 0.19, uy + 0.9, uy + 0.95); }
  const [x, z] = W(0, hF + 0.9); void x; void z;
  B('timber', -0.8, 0.8, hF - 0.05, hF + 0.85, uy - 0.14, uy - 0.03); col.rect(R(-0.8, 0.8, hF - 0.05, hF + 0.85), uy - 1.0, uy - 0.1);
  // balcony via the middle window? the door: a leaf opening at the centre
  
  B('timber', -0.78, 0.78, hF + 0.8, hF + 0.86, uy + 0.88, uy + 0.96); for (const s of [-1, 1]) B('timber', s * 0.78 - 0.03, s * 0.78 + 0.03, hF - 0.05, hF + 0.86, uy + 0.88, uy + 0.96);
  F(-0.8, 0.8, hF - 0.05, hF + 0.85, uy);
  // inside upstairs: mats, a chest, an altar shelf, a hung net
  const mu = -side * (hS - 1.6); B('reed_mat', mu - 0.5, mu + 0.5, -hF + 0.5, -hF + 2.3, uy, uy + 0.015); B(CLOTH[Math.floor(rand() * 5)], mu - 0.2, mu + 0.2, -hF + 0.55, -hF + 0.8, uy + 0.015, uy + 0.13); sheet('cloth_white', mu - 0.55, -hF + 0.4, mu + 0.55, -hF + 0.4, uy + 1.8, uy + 0.9);
  BC('timber_red', hS - 1.5, hS - 0.6, -hF + 0.5, -hF + 1.1, uy, uy + 0.6);
  B('timber', -0.5, 0.5, -hF + 0.12, -hF + 0.42, uy + 1.4, uy + 1.45); L('gold', [[0.001, 0], [0.12, 0.01], [0.09, 0.14], [0.05, 0.3], [0.001, 0.36]], 0, -hF + 0.27, uy + 1.45, 8);
  // sign board and lanterns: a vertical board standing out from the pier, hung from a bracket, with a pennant; red lanterns at the corners
  const sgn = -side; { const [bx, bz] = W(sgn * (hS - 0.1), hF + 0.0); void bx; void bz;
    const t = []; const a = W(sgn * (hS - 0.05), hF + 0.05), b = W(sgn * (hS - 0.05), hF + 1.15); beamTris(t, [a[0], uy + 0.4, a[1]], [b[0], uy + 0.4, b[1]], 0.06, 0.06); bag.add('timber', fromTriangles(t));
    B('timber_red', sgn * (hS - 0.05) - 0.02, sgn * (hS - 0.05) + 0.02, hF + 0.8, hF + 1.1, uy - 1.5, uy + 0.35); B('clay_gilt', sgn * (hS - 0.05) - 0.03, sgn * (hS - 0.05) + 0.03, hF + 0.84, hF + 1.06, uy - 1.1, uy - 0.2); }
  for (const s of [-1, 1]) { const c = W(s * (hS - 0.3), hF + 0.3); bag.add('lamp_paper', lathe([[0.001, 0], [0.13, 0.05], [0.16, 0.2], [0.12, 0.36], [0.001, 0.4]], 8, null, c[0], y0 + gh - 0.45 - 0.4 + 0.5, c[1])); bag.add('timber', rod([c[0], y0 + gh - 0.45, c[1]], [c[0], y0 + gh + 0.05, c[1]], 0.008, 3)); }
  if (ctx.lights) { const [lx, lz] = W(0, hF - 1.6), [ux, uz] = W(0, 0); ctx.lights.push({ at: [lx, y0 + 2.5, lz], color: '#ffb25a', intensity: 3, distance: 8 }, { at: [ux, uy + 1.5, uz], color: '#ffb25a', intensity: 2.2, distance: 6 }); }
  // the roof of tile with the gable to the lane, horns, a hanging board at the gable
  const rb = R(-hS, hS, -hF, hF), long = rb[2] - rb[0] >= rb[3] - rb[1], c0 = [(rb[0] + rb[2]) / 2, (rb[1] + rb[3]) / 2];
  const alongV = Math.abs(k.F[1]) > 0 ? !long : long;     // ridge along the depth when the front is n/s
  const Al = (Math.abs(k.F[1]) > 0 ? rb[3] - rb[1] : rb[2] - rb[0]) / 2 + 0.7, Bh = (Math.abs(k.F[1]) > 0 ? rb[2] - rb[0] : rb[3] - rb[1]) / 2 + 0.5, rise2 = Bh * 0.7;
  void alongV;
  rectRoof({ c: c0, A: Al, B: Bh, y: ut, rise: rise2, kind: 'gable', sweep: 0, curl: false, p: 1.05, alongZ: Math.abs(k.F[1]) > 0, mat: 'roof_tile', soffit: 'timber' }, bag);
  kalae(bag, c0, Al, ut + rise2, Math.abs(k.F[1]) === 0, 'timber_red');
  // eaves' stains and the damp line (flood marks on the lane side of the plinth)
  B('plaster_streak', -hS + 0.4, -hS + 1.2, hF + 0.0, hF + 0.02, y0 + 0.2, y0 + 1.4);
}

/** The far version: a box on posts under a roof, or a shop's two-storey box. */
function simple(el, bag) {
  const [x0, z0, x1, z1] = [Math.min(el.rect[0], el.rect[2]), Math.min(el.rect[1], el.rect[3]), Math.max(el.rect[0], el.rect[2]), Math.max(el.rect[1], el.rect[3])], rand = rng(el.seed || 1);
  const alongX = (x1 - x0) >= (z1 - z0), shop = el.kind === 'shop', up = shop ? 0.3 : 2.1, h = shop ? 5.8 : 2.3, tile = shop || rand() < 0.35;
  bag.add(shop ? 'plaster_white' : 'timber', box(x0, up - (shop ? 0.3 : 0.2), z0, x1, up, z1));
  bag.add(shop ? 'plaster_white' : rand() < 0.5 ? 'reed_mat' : 'timber', box(x0 + 0.1, up, z0 + 0.1, x1 - 0.1, up + h, z1 - 0.1));
  if (!shop) for (const [x, z] of [[x0 + 0.3, z0 + 0.3], [x1 - 0.3, z0 + 0.3], [x0 + 0.3, z1 - 0.3], [x1 - 0.3, z1 - 0.3]]) bag.add('timber', box(x - 0.1, 0, z - 0.1, x + 0.1, up, z + 0.1));
  const rise = Math.min(x1 - x0, z1 - z0) * (tile ? 0.4 : 0.55) + 0.3;
  rectRoof({ c: [(x0 + x1) / 2, (z0 + z1) / 2], A: (alongX ? x1 - x0 : z1 - z0) / 2 + 0.7, B: (alongX ? z1 - z0 : x1 - x0) / 2 + 0.7, y: up + h, rise, kind: 'gable', sweep: 0, curl: false, p: 1.05, alongZ: !alongX, mat: tile ? 'roof_tile' : 'thatch_palm', soffit: 'timber' }, bag);
}

/** thai_house: { rect, front, seed, kind ('plain' | 'big' | 'small' | 'shop'), simple } */
export function thaiHouse(el, ctx) {
  if (el.simple) return simple(el, ctx.bag);
  return el.kind === 'shop' ? shop(el, ctx) : stilt(el, ctx);
}
export { rng, kit, kalae, spiritHouse, leanTo, CLOTH };
