// The yards of the Khmer village and the workshops of its trades (docs/settlements/angkor.md §19–§21): banana
// clumps, the areca palm, fences of woven bamboo, drying racks, a hammock slung under a house, a weaver's
// backstrap loom, open workshops (the potter, the smith, the palm-sugar boiler, the rice-husker's pestle),
// the low dykes of the dry paddies, the offering stand and the banner of the temple. Pieces that repeat are
// built once (assembly) and placed as instances; each stands on the ground it is given.

import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';
import { box, lathe, fromTriangles } from '../../core/geom.js';
import { rectRoof, beamTris } from '../ming/index.js';
import { assembly, placer, tube, slathe } from '../../objects/kit.js';
import { frame, boxR, jar } from './village.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
/** Triangles (flat array) as a geometry with flat normals, both faces. */
function twoSided(T) {
  const P = [...T];
  for (let i = 0; i < T.length; i += 9) P.push(T[i], T[i + 1], T[i + 2], T[i + 6], T[i + 7], T[i + 8], T[i + 3], T[i + 4], T[i + 5]);
  const g = new BufferGeometry();
  g.setAttribute('position', new Float32BufferAttribute(P, 3));
  g.computeVertexNormals();
  return g;
}
/**
 * A broad arching leaf from p0 (azimuth az, rising by `el`, length L, widest W, drooping by `droop`), folded a little along its midrib;
 * the blade's edge torn between the ribs where `torn` (some segments narrower).
 */
function arch(T, p0, az, el, L, W, droop, torn = 0, r = Math.random) {
  const dx = Math.cos(az), dz = Math.sin(az), px = -dz, pz = dx, n = 5;
  const P = (t, s, f = 0) => [p0[0] + dx * L * t + px * s, p0[1] + Math.sin(el) * L * t * (1 - t * 0.2) - droop * L * t * t + f, p0[2] + dz * L * t + pz * s];
  for (let k = 0; k < n; k++) {
    const t0 = k / n, t1 = (k + 1) / n, w0 = W * Math.sin(Math.PI * (0.12 + 0.88 * t0)) * 0.5, w1 = W * Math.sin(Math.PI * (0.12 + 0.88 * t1)) * 0.5, c = torn && r() < torn ? 0.55 : 1;
    // the two halves of the blade, the midrib a hair higher than the edges
    T.push(...P(t0, 0, 0.03), ...P(t1, 0, 0.03), ...P(t1, w1 * c, -0.02), ...P(t0, 0, 0.03), ...P(t1, w1 * c, -0.02), ...P(t0, w0 * c, -0.02));
    T.push(...P(t0, 0, 0.03), ...P(t1, -w1 * c, -0.02), ...P(t1, 0, 0.03), ...P(t0, 0, 0.03), ...P(t0, -w0 * c, -0.02), ...P(t1, -w1 * c, -0.02));
  }
}

/** k_banana: { at, y, s, seed } — a clump of banana plants: pseudostems 2.5–3.5 m, five broad leaves each, now and then a hanging bunch. */
export function banana(el, { bag, col }) {
  const v = (el.seed ?? 1) % 3, A = assembly(`k-banana|${v}`, (a) => {
    const r = rng(77 + v * 31), stems = 2 + (v % 2) + (v === 2 ? 1 : 0);
    for (let k = 0; k < stems; k++) {
      const ang = k / stems * 6.28 + r(), d = k ? 0.45 + r() * 0.3 : 0, x = Math.cos(ang) * d, z = Math.sin(ang) * d, H = 2.3 + r() * 1.2 - (k ? 0.5 : 0);
      a('stem', tube([[x, 0, z, 0.15], [x + 0.03, H * 0.5, z, 0.12], [x, H, z, 0.1]], 7));
      for (let q = 0; q < 5; q++) {
        const az = q * 1.26 + r() * 0.5 + k, torn = q > 1 ? 0.45 : 0.15;
        const T = []; arch(T, [x + Math.cos(az) * 0.08, H - 0.05 - (q % 2) * 0.15, z + Math.sin(az) * 0.08], az, 0.5 - q * 0.12 + r() * 0.2, 1.9 + r() * 0.6, 0.9 + r() * 0.8, torn, r);
        a('leaf', twoSided(T));
        if (q === 4) a('stem', tube([[x, H - 0.1, z, 0.03], [x + Math.cos(az) * 0.9, H - 0.05 + 0.5, z + Math.sin(az) * 0.9, 0.012]], 3));
      }
      if (k === 0 && v !== 1) {
        // a hanging bunch: the stalk curving down from the crown, hands of fingers one over another, the purple bud at its end
        const bx = x + 0.22, by = H - 0.25;
        a('stem', tube([[x, H - 0.05, z, 0.04], [bx, H, z, 0.04], [bx + 0.1, by, z, 0.035], [bx + 0.15, by - 0.9, z, 0.03]], 5));
        for (let h = 0; h < 4; h++) for (let f = 0; f < 5; f++) { const yy = by - 0.12 - h * 0.17, aa = f / 5 * 6.28 + h; a('fruit', tube([[bx + 0.12 + Math.cos(aa) * 0.04, yy, z + Math.sin(aa) * 0.04, 0.026], [bx + 0.12 + Math.cos(aa) * 0.1, yy - 0.12, z + Math.sin(aa) * 0.1, 0.022], [bx + 0.12 + Math.cos(aa) * 0.13, yy - 0.2, z + Math.sin(aa) * 0.13, 0.008]], 4)); }
        a('bud', slathe([[0.001, 0], [0.06, 0.05], [0.07, 0.15], [0.001, 0.3]], 6).translate(bx + 0.15, by - 1.15, z));
      }
    }
  });
  const put = placer({ at: el.at, y: el.y ?? 0, rot: (el.seed ?? 1) * 1.7, s: el.s ?? 1 }, bag);
  put('stucco_leaf', A.stem.clone()); put('palm_leaf', A.leaf.clone());
  if (A.fruit) { put('glaze_yellow', A.fruit.clone()); put('lacquer_red', A.bud.clone()); }
  col.circle(el.at[0], el.at[1], 0.4 * (el.s ?? 1), el.y ?? 0, (el.y ?? 0) + 2.5);
}

/** k_areca: { at, y, s, seed } — an areca palm (the betel nut): a slim ringed trunk of 8–11 m, a green crownshaft, a dozen drooping fronds, the nuts in orange bunches. */
export function areca(el, { bag, col }) {
  const v = (el.seed ?? 1) % 2, A = assembly(`k-areca|${v}`, (a) => {
    const r = rng(41 + v * 17), H = 9 + v * 1.8;
    a('trunk', tube([[0, -0.1, 0, 0.12], [0.05, H * 0.4, 0, 0.085], [-0.03, H * 0.8, 0, 0.08], [0, H, 0, 0.085]], 6));
    a('shaft', slathe([[0.085, H - 0.1], [0.11, H + 0.1], [0.1, H + 0.55], [0.06, H + 0.75]], 7));
    for (let k = 0; k < 9; k++) {
      const az = k * 2.4 + r() * 0.3, el2 = 0.9 - (k % 3) * 0.4 + r() * 0.2, L = 2.3 + r() * 0.6, dx = Math.cos(az), dz = Math.sin(az), px = -dz, pz = dx;
      const F = (t) => [dx * L * t * Math.cos(el2 * 0.6), H + 0.6 + Math.sin(el2) * L * t * 0.8 - 1.0 * L * t * t * 0.45, dz * L * t * Math.cos(el2 * 0.6)];
      const T = [];
      a('trunk', tube([[...F(0), 0.025], [...F(0.5), 0.02], [...F(1), 0.006]], 3));
      for (let q = 1; q <= 9; q++) {
        const t = q / 10, c = F(t), w = 0.55 * Math.sin(Math.PI * (0.1 + 0.9 * (1 - t))) + 0.1;
        for (const s of [-1, 1]) T.push(...c, c[0] + px * s * w * 0.8, c[1] - 0.5 * w, c[2] + pz * s * w * 0.8, c[0] + dx * 0.16 + px * s * w * 0.9, c[1] - 0.6 * w, c[2] + dz * 0.16 + pz * s * w * 0.9);
      }
      a('leaf', twoSided(T));
    }
    for (let k = 0; k < 3; k++) { const az = k * 2.1; a('nuts', slathe([[0.001, 0], [0.09, 0.08], [0.12, 0.2], [0.001, 0.36]], 5).translate(Math.cos(az) * 0.16, H - 0.5, Math.sin(az) * 0.16)); }
  });
  const put = placer({ at: el.at, y: el.y ?? 0, rot: (el.seed ?? 1) * 1.3, s: el.s ?? 1 }, bag);
  put('palm_trunk', A.trunk.clone()); put('stucco_leaf', A.shaft.clone()); put('palm_leaf', A.leaf.clone()); put('glaze_yellow', A.nuts.clone());
  col.circle(el.at[0], el.at[1], 0.14 * (el.s ?? 1), el.y ?? 0, (el.y ?? 0) + 4);
}

/** k_fence: { a, b, y, h, seed } — a fence of woven bamboo: round posts every 2 m, panels of woven matting between a top and a foot rail. */
export function fence(el, { bag, col }) {
  const [x0, z0] = el.a, [x1, z1] = el.b, y = el.y ?? 0, h = el.h ?? 1.15, L = Math.hypot(x1 - x0, z1 - z0), n = Math.max(1, Math.round(L / 2)), r = rng(el.seed || 1);
  const ux = (x1 - x0) / L, uz = (z1 - z0) / L, along = Math.abs(ux) > Math.abs(uz);
  const pt = (t) => [x0 + (x1 - x0) * t, z0 + (z1 - z0) * t];
  const rail = (ta, tb, yy, mat) => { const a = pt(ta), b = pt(tb); bag.add(mat, along ? box(Math.min(a[0], b[0]), y + yy, a[1] - 0.025, Math.max(a[0], b[0]), y + yy + 0.05, a[1] + 0.025) : box(a[0] - 0.025, y + yy, Math.min(a[1], b[1]), a[0] + 0.025, y + yy + 0.05, Math.max(a[1], b[1]))); };
  for (let i = 0; i <= n; i++) { const [x, z] = pt(i / n), hh = h + 0.12 + r() * 0.15; bag.add('bamboo_culm', lathe([[0.045, 0], [0.04, hh]], 5, null, x, y, z)); }
  for (let i = 0; i < n; i++) {
    const a = pt((i + 0.06) / n), b = pt((i + 0.94) / n);
    const lo = h * 0.12, hi = h;
    bag.add('reed_mat', along ? box(Math.min(a[0], b[0]), y + lo, a[1] - 0.02, Math.max(a[0], b[0]), y + hi, a[1] + 0.02) : box(a[0] - 0.02, y + lo, Math.min(a[1], b[1]), a[0] + 0.02, y + hi, Math.max(a[1], b[1])));
  }
  rail(0, 1, h, 'bamboo_culm'); rail(0, 1, h * 0.1, 'bamboo_culm');
  col.segment(el.a, el.b, 0.1, y, y + h);
}

/** k_rack: { at, y, rot, kind ('fish' | 'cloth' | 'rice'), seed } — a frame of bamboo on which fish are dried in rows, cloth is spread, or sheaves of rice are hung; 2.4 m long, along its local x. */
export function rack(el, { bag }) {
  const kind = el.kind ?? 'fish', v = (el.seed ?? 1) % 3, A = assembly(`k-rack|${kind}|${v}`, (a) => {
    const r = rng(9 + v * 5);
    for (const s of [-1, 1]) { a('pole', tube([[s * 1.2, 0, -0.18, 0.03], [s * 1.2, 1.5, 0, 0.026]], 4)); a('pole', tube([[s * 1.2, 0, 0.18, 0.03], [s * 1.2, 1.5, 0, 0.026]], 4)); }
    const rows = kind === 'cloth' ? [1.45] : [0.9, 1.15, 1.4];
    for (const yy of rows) a('pole', tube([[-1.3, yy, 0, 0.022], [1.3, yy, 0, 0.022]], 4));
    if (kind === 'fish') for (const yy of rows) for (let k = 0; k < 9; k++) if (r() < 0.85) { const x = -1.05 + k * 0.26; a('fish', box(x - 0.012, yy - 0.34, -0.03, x + 0.012, yy, 0.03)); a('fish', box(x - 0.02, yy - 0.3, -0.05, x + 0.02, yy - 0.1, 0.05)); }
    if (kind === 'rice') for (let k = 0; k < 7; k++) { const x = -1.0 + k * 0.33; a('rice', slathe([[0.02, 0], [0.09, 0.1], [0.12, 0.3], [0.06, 0.5], [0.001, 0.55]], 6).translate(x, 0.5, 0)); }
    if (kind === 'cloth') for (let k = 0; k < 3; k++) { const x = -0.7 + k * 0.7 + (r() - 0.5) * 0.1; a(`c${k}`, box(x - 0.3, 0.45, -0.02, x + 0.3, 1.45, 0.02)); }
  });
  const put = placer({ at: el.at, y: el.y ?? 0, rot: el.rot ?? 0 }, bag);
  put('bamboo_culm', A.pole.clone());
  if (A.fish) put('silver', A.fish.clone());
  if (A.rice) put('thatch', A.rice.clone());
  const cl = ['cloth_indigo', 'cloth_red', 'cloth_ochre'];
  for (let k = 0; k < 3; k++) if (A[`c${k}`]) put(cl[(k + v) % 3], A[`c${k}`].clone());
}

/** k_hammock: { a: [x, z], b: [x, z], y } — a cloth hammock slung between two posts at height y, sagging into a cradle. */
export function hammock(el, { bag }) {
  const [x0, z0] = el.a, [x1, z1] = el.b, y = el.y ?? 1.0, L = Math.hypot(x1 - x0, z1 - z0), ux = (x1 - x0) / L, uz = (z1 - z0) / L, px = -uz, pz = ux, n = 8, T = [];
  const P = (t, s) => { const sag = 0.55 * Math.sin(Math.PI * t) * (1 - 0.35 * Math.abs(s) / 0.35) + 0.05 * Math.abs(s), w = (0.12 + 0.35 * Math.sin(Math.PI * Math.min(1, t * 1.1 + 0.05))) * s / 0.35; return [x0 + ux * L * t + px * w, y - sag * 1.0, z0 + uz * L * t + pz * w]; };
  for (let k = 0; k < n; k++) for (const [s0, s1] of [[-0.35, 0], [0, 0.35]]) { const t0 = k / n, t1 = (k + 1) / n; T.push(...P(t0, s0), ...P(t1, s0), ...P(t1, s1), ...P(t0, s0), ...P(t1, s1), ...P(t0, s1)); }
  bag.add(el.cloth ?? 'cloth_ochre', twoSided(T));
  for (const [x, z, s] of [[x0, z0, 1], [x1, z1, -1]]) bag.add('rope_fibre', tube([[x, y + 0.02, z, 0.015], [x + s * ux * 0.25, y - 0.12, z + s * uz * 0.25, 0.012]], 3));
}

/**
 * k_loom: { at, y, rot, seed } — the weaver's backstrap loom (Zhou Daguan: "wind one end of the cloth around their waist, hang the other
 * end over a window, and use a bamboo tube as a shuttle"): the warp stretched along local x from a post at x = −1.7 to the sitter's
 * waist at x = +0.15 at 0.4 m, striped, a part of it woven cloth; the beams at both ends, a sword of wood, a bamboo shuttle; the sitter
 * is placed by the plan on the mat.
 */
export function loom(el, { bag, col }) {
  const A = assembly(`k-loom|${(el.seed ?? 1) % 3}`, (a) => {
    const r = rng(5 + (el.seed ?? 1) % 3);
    a('post', tube([[-1.85, 0, 0, 0.07], [-1.85, 1.2, 0, 0.06]], 6));
    a('post', box(-1.8, 0.33, -0.3, -1.7, 0.4, 0.3));
    a('post', box(0.1, 0.34, -0.3, 0.18, 0.4, 0.3));
    // the warp threads in bands, the woven end near the sitter
    for (let k = 0; k < 6; k++) { const z = -0.26 + k * 0.104; a(k % 2 ? 'warp2' : 'warp1', box(-1.7, 0.39, z, -0.55, 0.4, z + 0.1)); a(k % 2 ? 'cloth2' : 'cloth1', box(-0.55, 0.385, z, 0.1, 0.395, z + 0.1)); }
    a('post', box(-0.56, 0.4, -0.3, -0.5, 0.44, 0.3));
    a('post', tube([[-0.4, 0.45, -0.34, 0.012], [-0.3, 0.45, 0.34, 0.012]], 4));
    for (let k = 0; k < 3; k++) { const x = -1.3 + k * 0.3; a('skein', slathe([[0.001, 0], [0.07, 0.03], [0.001, 0.1]], 6).translate(x + r() * 0.1, 0, 0.55 + r() * 0.2)); }
  });
  const put = placer({ at: el.at, y: el.y ?? 0, rot: el.rot ?? 0 }, bag);
  put('timber', A.post.clone()); put('cloth_red', A.warp1.clone()); put('cloth_white', A.warp2.clone()); put('cloth_indigo', A.cloth1.clone()); put('cloth_ochre', A.cloth2.clone()); put('cloth_white', A.skein.clone());
  const c = Math.cos(el.rot ?? 0), s = Math.sin(el.rot ?? 0);
  col.circle(el.at[0] + (-1.85) * c + 0, el.at[1] - (-1.85) * s, 0.1, el.y ?? 0, (el.y ?? 0) + 1.2);
}

// ---- the open workshops ------------------------------------------------------------------------------------------

/**
 * k_workshop: { rect, front, trade ('potter' | 'smith' | 'sugar' | 'mill'), seed } — an open workshop: a floor of planks 0.55 m up
 * on round posts, no walls, a hipped roof of palm thatch; steps at the front; the tools and work of the trade on the floor and about it.
 * Walkable: the floor is a floor, the steps ramp.
 */
export function workshop(el, ctx) {
  const { bag, col } = ctx, [x0, z0, x1, z1] = el.rect, up = 0.55, hgt = 2.5, rand = rng(el.seed || 1), trade = el.trade ?? 'potter';
  const { F, W, R, hF, hS } = frame(el.rect, el.front ?? 's');
  const nx = Math.max(2, Math.round(2 * hS / 2.4)), nv = Math.max(2, Math.round(2 * hF / 2.4));
  for (let i = 0; i <= nx; i++) for (let j = 0; j <= nv; j++) {
    if (!(i === 0 || i === nx || j === 0 || j === nv)) continue;
    const [x, z] = W(-hS + 2 * hS * i / nx, -hF + 2 * hF * j / nv);
    bag.add('timber', lathe([[0.13, 0], [0.11, up + hgt]], 6, null, x, 0, z)); col.circle(x, z, 0.15, 0, up + hgt);
  }
  bag.add('timber', boxR(R(-hS - 0.15, hS + 0.15, -hF - 0.15, hF + 0.15), up - 0.16, up));
  bag.add('reed_mat', boxR(R(-hS + 0.1, hS - 0.1, -hF + 0.1, hF - 0.1), up, up + 0.012));
  col.floor(R(-hS - 0.15, hS + 0.15, -hF - 0.15, hF + 0.15), up);
  for (const [u0, u1, v0, v1] of [[-hS - 0.1, hS + 0.1, -hF - 0.1, -hF + 0.1], [-hS - 0.1, hS + 0.1, hF - 0.1, hF + 0.1], [-hS - 0.1, -hS + 0.1, -hF, hF], [hS - 0.1, hS + 0.1, -hF, hF]]) bag.add('timber', boxR(R(u0, u1, v0, v1), up + hgt - 0.2, up + hgt));
  // a low rail along the back
  bag.add('timber', boxR(R(-hS, hS, -hF + 0.04, -hF + 0.1), up + 0.85, up + 0.9)); col.segment(W(-hS, -hF + 0.07), W(hS, -hF + 0.07), 0.1, up, up + 0.95);
  // steps at the front (two), their ramp
  for (let k = 1; k <= 2; k++) {
    const v0 = hF + 0.15 + (2 - k) * 0.35, y = up * (3 - k) / 3;
    bag.add('timber', boxR(R(-0.8, 0.8, v0, v0 + 0.35), y - 0.07, y)); col.floor(R(-0.8, 0.8, v0, v0 + 0.35), y);
  }
  col.floor(R(-0.8, 0.8, hF + 0.85, hF + 1.6), 0);
  const roof = { c: [(x0 + x1) / 2, (z0 + z1) / 2], A: (x1 - x0) / 2 + 1.1, B: (z1 - z0) / 2 + 1.1, y: up + hgt, rise: Math.min(x1 - x0, z1 - z0) * 0.5 + 0.5, kind: 'hip', sweep: 0, curl: false, p: 1.05, mat: 'thatch_palm', soffit: 'thatch_palm' };
  rectRoof(roof, bag);
  const at = (u, v) => W(u, v), solid = (u, v, r, h, y = up) => { const [x, z] = at(u, v); col.circle(x, z, r, y, y + h); };
  const cyl = (mat, u, v, y, pts, n = 10) => { const [x, z] = at(u, v); bag.add(mat, lathe(pts, n, null, x, y, z)); };
  if (trade === 'potter') {
    // the wheel: a heavy disc turning on a post, a pot rising on it, a bowl of water beside; unfired pots on a board; the clay heap; finished pots
    cyl('timber', -hS * 0.35, -hF * 0.2, up, [[0.08, 0], [0.07, 0.3]], 6); cyl('wood_dark', -hS * 0.35, -hF * 0.2, up + 0.3, [[0.001, 0], [0.36, 0], [0.38, 0.05], [0.001, 0.05]], 14);
    cyl('terracotta', -hS * 0.35, -hF * 0.2, up + 0.35, [[0.001, 0], [0.14, 0], [0.2, 0.1], [0.16, 0.2], [0.09, 0.26], [0.1, 0.28], [0.001, 0.28]], 10); solid(-hS * 0.35, -hF * 0.2, 0.35, 0.4);
    cyl('pottery_dark', -hS * 0.35 + 0.65, -hF * 0.2 + 0.3, up, [[0.001, 0], [0.15, 0], [0.2, 0.08], [0.2, 0.12], [0.001, 0.12]], 8);
    bag.add('timber', boxR(R(hS * 0.2, hS - 0.3, -hF + 0.25, -hF + 0.6), up + 0.5, up + 0.55)); for (const s of [0.3, hS - 0.5]) bag.add('timber', boxR(R(s + hS * 0.2 - 0.3, s + hS * 0.2 - 0.25, -hF + 0.3, -hF + 0.55), up, up + 0.5));
    for (let k = 0; k < 6; k++) { const u = hS * 0.2 + 0.15 + k * 0.3; if (u < hS - 0.35) cyl('terracotta', u, -hF + 0.42, up + 0.55, [[0.001, 0], [0.09, 0], [0.13, 0.08], [0.1, 0.17], [0.07, 0.2], [0.001, 0.2]], 8); }
    bag.add('laterite', lathe([[0.001, 0], [0.5, 0], [0.4, 0.2], [0.2, 0.3], [0.001, 0.32]], 8, null, ...(() => { const [x, z] = at(hS * 0.5, 0.2); return [x, up, z]; })()));
    // the kiln behind the shop: a dome of laterite and clay with a stoke hole and a chimney
    const [kx, kz] = at(0, -hF - 2.4);
    bag.add('laterite', lathe([[1.5, 0], [1.45, 0.4], [1.25, 0.9], [0.9, 1.3], [0.45, 1.55], [0.001, 1.62]], 14, null, kx, 0, kz)); col.circle(kx, kz, 1.55, 0, 1.6);
    const [hx, hz] = at(0, -hF - 2.4 + 1.4); bag.add('pottery_dark', boxR([hx - 0.3, hz - 0.1, hx + 0.3, hz + 0.1].map((q, i) => (i % 2 ? q : q)), 0.1, 0.65));
    bag.add('laterite', lathe([[0.22, 1.3], [0.2, 2.2], [0.24, 2.3], [0.001, 2.3]], 8, null, kx, 0, kz));
    for (let k = 0; k < 7; k++) { const [x, z] = at(-hS + 0.5 + (k % 4) * 0.5, hF + 1.6 + Math.floor(k / 4) * 0.5 + rand() * 0.2); jar(bag, x, z, 0, 0.7 + rand() * 0.4, k % 3 ? 'terracotta' : 'pottery_dark'); }
  } else if (trade === 'smith') {
    // the hearth of laterite and clay with its tuyere, two bamboo bellows worked by hand, the anvil on a log, quench trough, tongs and bars on the rack, charcoal
    const [hx, hz] = at(-hS * 0.3, -hF + 0.9); bag.add('laterite', box(hx - 0.55, up, hz - 0.45, hx + 0.55, up + 0.65, hz + 0.45)); bag.add('wood_dark', box(hx - 0.3, up + 0.65, hz - 0.25, hx + 0.3, up + 0.69, hz + 0.25)); solid(-hS * 0.3, -hF + 0.9, 0.7, 0.7);
    for (const s of [-0.2, 0.2]) { const [bx, bz] = at(-hS * 0.3 + s, -hF + 0.45); bag.add('bamboo_culm', lathe([[0.06, 0], [0.06, 0.9]], 7, null, bx, up, bz)); bag.add('timber', tube([[bx, up + 0.85, bz, 0.012], [bx, up + 1.3, bz, 0.012]], 3)); bag.add('timber', box(bx - 0.04, up + 1.28, bz - 0.04, bx + 0.04, up + 1.34, bz + 0.04)); }
    const [ax, az] = at(hS * 0.3, 0.1); bag.add('timber', lathe([[0.3, 0], [0.26, 0.36]], 8, null, ax, up, az)); bag.add('iron', box(ax - 0.12, up + 0.36, az - 0.07, ax + 0.12, up + 0.44, az + 0.07)); bag.add('iron', box(ax + 0.1, up + 0.4, az - 0.02, ax + 0.26, up + 0.43, az + 0.02)); solid(hS * 0.3, 0.1, 0.35, 0.45);
    const [tx, tz] = at(hS * 0.3, 0.9); bag.add('wood_dark', boxR([tx - 0.35, tz - 0.2, tx + 0.35, tz + 0.2], up, up + 0.28));
    const [rx, rz] = at(0, -hF + 0.1); void rx; void rz;
    for (let k = 0; k < 6; k++) { const [x, z] = at(hS * 0.35 + (k - 3) * 0.18, -hF + 0.14); bag.add('iron', box(x - 0.012, up + 0.5, z - 0.012, x + 0.012, up + 1.3 - (k % 2) * 0.15, z + 0.012)); }
    cyl('wicker', hS * 0.55, hF * 0.3, up, [[0.2, 0], [0.26, 0.2], [0.24, 0.28], [0.001, 0.28]], 8); cyl('pottery_dark', hS * 0.55, hF * 0.3, up + 0.18, [[0.001, 0], [0.22, 0.02], [0.001, 0.1]], 8);
    // iron goods for sale on the steps' side: hoes, sickles, knives
    for (let k = 0; k < 5; k++) { const [x, z] = at(-hS + 0.5 + k * 0.28, hF - 0.45); bag.add('iron', box(x - 0.1, up + 0.012, z - 0.012, x + 0.1, up + 0.03, z + 0.012)); }
  } else if (trade === 'sugar') {
    // the boiling of palm sap: a trench-fire under three round pans in a clay stove, ladles of coconut shell on bamboo, tubes of sap fresh from the palms, jars, a stack of leaves for fuel and fans
    const [sx, sz] = at(0, -hF + 1.15); bag.add('laterite', box(sx - hS * 0.7, up, sz - 0.5, sx + hS * 0.7, up + 0.45, sz + 0.5)); solid(0, -hF + 1.15, hS * 0.75, 0.5);
    const np = 3; for (let k = 0; k < np; k++) { const [px, pz] = at(-hS * 0.5 + k * hS * 0.5, -hF + 1.15); bag.add('pottery_dark', lathe([[0.5, 0], [0.62, 0.08], [0.58, 0.16], [0.001, 0.16]], 12, null, px, up + 0.45, pz)); bag.add('rubble', lathe([[0.001, 0.12], [0.55, 0.12], [0.001, 0.13]], 12, null, px, up + 0.45, pz)); }
    for (let k = 0; k < 4; k++) { const [x, z] = at(-hS + 0.5 + k * 0.4, hF - 0.6); bag.add('bamboo_culm', lathe([[0.05, 0], [0.05, 0.9]], 6, null, x, up, z)); }
    const [lx, lz] = at(hS * 0.45, 0.3); const T = []; beamTris(T, [lx, up + 0.2, lz], [lx - 0.4, up + 1.2, lz - 0.4], 0.02, 0.04); bag.add('bamboo_culm', fromTriangles(T));
    jar(bag, ...(() => { const q = at(hS * 0.6, hF - 0.5); return [q[0], q[1], up]; })(), 1.0, 'pottery_dark'); jar(bag, ...(() => { const q = at(hS * 0.35, hF - 0.45); return [q[0], q[1], up]; })(), 0.9, 'terracotta');
    for (let k = 0; k < 8; k++) { const [x, z] = at(-hS + 0.4 + (k % 4) * 0.12, -hF + 0.4 + Math.floor(k / 4) * 0.12); bag.add('palm_leaf', box(x - 0.5, up + k * 0.04, z - 0.1, x + 0.5, up + k * 0.04 + 0.04, z + 0.1)); }
  } else {
    // the husker: a beam on two posts, a pestle hanging from its long end over a stone mortar sunk in the floor, a step at the short end to tread on; winnowing trays, a heap of paddy in sacks
    const [px, pz] = at(-hS * 0.3, 0), [qx, qz] = at(hS * 0.35, 0);
    for (const s of [-0.5, 0.5]) { const [bx, bz] = at(-hS * 0.05, s); bag.add('timber', lathe([[0.1, 0], [0.09, 1.1]], 6, null, bx, up, bz)); col.circle(bx, bz, 0.12, up, up + 1.1); }
    const B = []; beamTris(B, [...(() => { const q = at(-hS * 0.7, 0); return [q[0], up + 0.95, q[1]]; })()], [...(() => { const q = at(hS * 0.7, 0); return [q[0], up + 0.85, q[1]]; })()], 0.1, 0.13); bag.add('timber', fromTriangles(B));
    bag.add('laterite', lathe([[0.001, 0], [0.34, 0], [0.4, 0.12], [0.34, 0.3], [0.2, 0.3], [0.2, 0.16], [0.001, 0.14]], 10, null, qx, up, qz)); col.circle(qx, qz, 0.4, up, up + 0.3);
    const P = []; beamTris(P, [qx, up + 0.3, qz], [qx, up + 0.9, qz], 0.06, 0.07); bag.add('timber', fromTriangles(P));
    bag.add('timber', boxR(R(-hS * 0.7 - 0.2, -hS * 0.7 + 0.35, -0.2, 0.2), up, up + 0.2)); void px; void pz;
    for (let k = 0; k < 3; k++) { const [x, z] = at(-hS + 0.7 + k * 0.7, hF - 0.6); bag.add('wicker', lathe([[0.001, 0.0], [0.38, 0.0], [0.4, 0.05], [0.001, 0.05]], 12, null, x, up + 0.012, z)); if (k < 2) bag.add('thatch', lathe([[0.001, 0.0], [0.3, 0.0], [0.15, 0.1], [0.001, 0.12]], 8, null, x, up + 0.06, z)); }
    for (let k = 0; k < 4; k++) { const [x, z] = at(hS - 0.5 - (k % 2) * 0.5, -hF + 0.5 + Math.floor(k / 2) * 0.5); bag.add('sacking', lathe([[0.2, 0], [0.26, 0.15], [0.2, 0.35], [0.001, 0.38]], 7, null, x, up, z)); }
  }
}

// ---- the dykes of the paddies ---------------------------------------------------------------------------------------

/** k_bund: { a, b } — a low dyke of earth between two paddies, 0.5 m wide and 0.28 m high (the paths of the field and the stand of the sugar palms). */
export function bund(el, { bag }) {
  const [x0, z0] = el.a, [x1, z1] = el.b, along = Math.abs(x1 - x0) >= Math.abs(z1 - z0), h = el.h ?? 0.28, y = el.y ?? 0;
  bag.add('mud_plaster', along ? box(Math.min(x0, x1), y, z0 - 0.26, Math.max(x0, x1), y + h, z0 + 0.26) : box(x0 - 0.26, y, Math.min(z0, z1), x0 + 0.26, y + h, Math.max(z0, z1)));
}

// ---- the temple's offerings and banners -----------------------------------------------------------------------------

/** k_offering: { at, y, rot, seed } — a stone offering table with a bronze bowl of lotus flowers, two oil lamps, a bowl of incense with its sticks upright. */
export function offering(el, { bag, col }) {
  const A = assembly('k-offering', (a) => {
    a('stone', box(-0.45, 0, -0.28, 0.45, 0.12, 0.28)); a('stone', box(-0.38, 0.12, -0.22, 0.38, 0.62, 0.22)); a('stone', box(-0.46, 0.62, -0.3, 0.46, 0.7, 0.3));
    a('bronze', slathe([[0.001, 0], [0.1, 0], [0.18, 0.08], [0.2, 0.14], [0.001, 0.14]], 10).translate(-0.18, 0.7, 0));
    for (let k = 0; k < 7; k++) { const t = k / 7 * 6.28, x = -0.18 + Math.cos(t) * 0.1, z = Math.sin(t) * 0.1; a('bud', slathe([[0.001, 0], [0.04, 0.03], [0.05, 0.1], [0.001, 0.2]], 6).translate(x, 0.84, z)); a('lotus_leaf', tube([[x, 0.84, z, 0.006], [x * 1.1, 0.9, z * 1.1, 0.004]], 3)); }
    for (const z of [-0.14, 0.14]) a('bronze', slathe([[0.001, 0], [0.05, 0], [0.07, 0.03], [0.05, 0.05], [0.001, 0.05]], 8).translate(0.2, 0.7, z));
    a('bronze', slathe([[0.001, 0], [0.09, 0], [0.12, 0.07], [0.001, 0.07]], 8).translate(0.2, 0.7, 0));
    for (let k = 0; k < 9; k++) { const t = k / 9 * 6.28; a('stick', tube([[0.2 + Math.cos(t) * 0.04, 0.76, Math.sin(t) * 0.04, 0.004], [0.2 + Math.cos(t) * 0.05, 1.05, Math.sin(t) * 0.05, 0.003]], 3)); }
  });
  const put = placer({ at: el.at, y: el.y ?? 0, rot: el.rot ?? 0 }, bag);
  put('sandstone_khmer', A.stone.clone()); put('bronze', A.bronze.clone()); put('stucco_rose', A.bud.clone()); put('lotus_leaf', A.lotus_leaf.clone()); put('timber', A.stick.clone());
  col.circle(el.at[0], el.at[1], 0.55, el.y ?? 0, (el.y ?? 0) + 0.75);
}

/** k_banner: { at, y, rot, h, cloth } — a tall pole of bamboo with a long pennant of cloth edged in gilt hanging from a crosspiece, its foot in a stone socket. */
export function banner(el, { bag, col }) {
  const H = el.h ?? 6, A = assembly(`k-banner|${H}`, (a) => {
    a('stone', slathe([[0.28, 0], [0.26, 0.4], [0.2, 0.5], [0.001, 0.5]], 8));
    a('pole', tube([[0, 0, 0, 0.045], [0, H * 0.5, 0, 0.04], [0, H, 0, 0.03]], 6));
    a('pole', tube([[-0.5, H - 0.4, 0, 0.02], [0.5, H - 0.4, 0, 0.02]], 4));
    a('gilt', slathe([[0.04, H], [0.06, H + 0.1], [0.001, H + 0.35]], 6));
    const T = []; for (let k = 0; k < 8; k++) { const y0 = H - 0.45 - k * 0.5, y1 = y0 - 0.5, w0 = 0.34 * (1 - k * 0.07), w1 = 0.34 * (1 - (k + 1) * 0.07); T.push(-w0, y0, 0, w0, y0, 0, w1, y1, 0, -w0, y0, 0, w1, y1, 0, -w1, y1, 0); }
    a('cloth', twoSided(T));
    a('edge', box(-0.37, H - 0.47, -0.012, 0.37, H - 0.43, 0.012));
  });
  const put = placer({ at: el.at, y: el.y ?? 0, rot: el.rot ?? 0 }, bag);
  put('sandstone_khmer', A.stone.clone()); put('bamboo_culm', A.pole.clone()); put('clay_gilt', A.gilt.clone()); put(el.cloth ?? 'cloth_red', A.cloth.clone()); put('clay_gilt', A.edge.clone());
  col.circle(el.at[0], el.at[1], 0.3, el.y ?? 0, (el.y ?? 0) + 0.5);
}
void boxR; void beamTris;
