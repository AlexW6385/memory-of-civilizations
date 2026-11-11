// Rapa Nui — more of the place (docs/settlements/rapa-nui.md §4d): the tupa, a stone tower near the
// coast; slabs of basalt pecked with the sea's creatures (petroglyphs); the carvers' camps at the
// foot of the quarry's bays; and the chief's long house, a hare paenga of the great kind that can be
// walked into, with its mats, hearth, gourds, spears, nets and a moai kavakava.

import { Matrix4 } from '../../core/three.js';
import { orientedBox } from '../../core/build.js';
import { box, lathe, fromTriangles, orientOutward, rod } from '../../core/geom.js';
import { merge, tube } from '../../objects/kit.js';
import { rope } from './scenes.js';

const B = 'basalt_ahu', T = 'tuff_moai';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const flip = (t) => { const o = []; for (let i = 0; i < t.length; i += 9) o.push(t[i], t[i + 1], t[i + 2], t[i + 6], t[i + 7], t[i + 8], t[i + 3], t[i + 4], t[i + 5]); return o; };
/** A convex solid from eight corner points (bottom four, then top four), faced outward. */
function hull8(p) {
  const F = [[0, 1, 2, 3], [4, 7, 6, 5], [0, 4, 5, 1], [1, 5, 6, 2], [2, 6, 7, 3], [3, 7, 4, 0]], t = [];
  for (const [a, b, c, d] of F) t.push(...p[a], ...p[b], ...p[c], ...p[a], ...p[c], ...p[d]);
  return fromTriangles(orientOutward(t));
}
/** Rounded stones: three shapes at unit radius, instanced where the bag allows. */
const ROUND = [0, 1, 2].map((k) => lathe([[1, -0.6], [1.06, 0.05], [0.78, 0.6], [0.35, 0.85], [0.001, 0.9]], 7, (th) => 1 + 0.12 * Math.sin(th * (2 + k) + k) + 0.06 * Math.cos(th * 5 + k * 2)));
function stoneAt(bag, mat, x, y, z, r, seed = 0, flat = 1) {
  const k = Math.abs(Math.floor(seed * 7.3)) % 3, m = new Matrix4().makeRotationY(seed * 2.1).premultiply(new Matrix4().makeTranslation(x, y, z)).multiply(new Matrix4().makeScale(r, r * (0.7 + 0.1 * k) * flat, r));
  if (bag.addInstance) bag.addInstance(mat, ROUND[k], m, { reach: 240 }); else bag.add(mat, ROUND[k].clone().applyMatrix4(m));
}

// ---- tupa --------------------------------------------------------------------------------------
/**
 * tupa: a stone tower { c, y, r (outer radius), h, yaw, seed } of dry-laid basalt in courses, the wall
 * rising straight and then drawn in course by course (corbelled) to a small opening closed by a slab;
 * two low doors opposite each other, a lintel over each [stated: a tupa had two doors, one for bad
 * spirits to enter and one for the ancestral spirits to leave — German excavators, 1882 (murrayfoote.com);
 * near the coast, closely related to the hare oka — Wikipedia "Easter Island"].
 */
function tupa(el, { bag, col }) {
  const [x, z] = el.c, y0 = el.y ?? 0, R = el.r ?? 2.6, H = el.h ?? 3, yaw = el.yaw ?? 0, rand = rng(el.seed ?? 3);
  const M = new Matrix4().makeRotationY(yaw).setPosition(x, y0, z), add = (m, g) => { g.applyMatrix4(M); bag.add(m, g); };
  const ch = 0.27, N = Math.round(H / ch), th = 0.55, doorH = 4;      // the doors fill the lowest four courses
  const rad = (t) => R * (t < 0.3 ? 1 : 1 - 0.66 * ((t - 0.3) / 0.7) ** 1.4);
  for (let k = 0; k < N; k++) {
    const t = (k + 0.5) / N, rc = rad(t) - th / 2, n = Math.max(8, Math.round(2 * Math.PI * rc / 0.78)), off = k * 0.43 + rand();
    const ya = k === 0 ? -0.3 : k * ch, yb = (k + 1) * ch - 0.012;
    for (let i = 0; i < n; i++) {
      const a0 = off + i / n * Math.PI * 2, a1 = a0 + Math.PI * 2 / n * 0.97, am = (a0 + a1) / 2;
      if (k < doorH && (Math.abs(Math.sin(am)) * rc < 0.42 + 0.3 * (k === doorH - 1 ? 1 : 0)) && Math.abs(Math.cos(am)) > 0.5) continue;
      const w = th * (0.82 + rand() * 0.3);
      add(B, orientedBox([Math.cos(a0) * rc, Math.sin(a0) * rc], [Math.cos(a1) * rc, Math.sin(a1) * rc], w, ya, yb - rand() * 0.03, 0.02));
    }
  }
  // the lintels over the doors, the sills
  const rl = rad(0.1) - th / 2;
  for (const s of [-1, 1]) {
    add(B, box(s * rl - th * 0.62, doorH * ch - 0.02, -0.62, s * rl + th * 0.62, doorH * ch + 0.2, 0.62));
    add(B, box(s * rl - th * 0.7, -0.3, -0.5, s * rl + th * 0.7, 0.1, 0.5));
    for (const q of [-1, 1]) add(B, box(s * rl - th * 0.5, -0.3, q * 0.52 - 0.1, s * rl + th * 0.5, doorH * ch - 0.02, q * 0.52 + 0.1));
  }
  // the capstone over the opening, a flat slab set a little askew
  add(B, orientedBox([-0.95, -0.15], [0.95, 0.2], 1.7, H - 0.04, H + 0.2, 0));
  // the earth floor inside and rubble fallen at the foot
  add('pebbles', lathe([[R - th, -0.2], [R - th, 0.03], [0.001, 0.05]], 14));
  for (let k = 0; k < 16; k++) { const a = rand() * 6.283, d = R + 0.3 + rand() * 0.9; stoneAt(bag, B, x + Math.cos(a + yaw) * d, y0 - 0.05, z - Math.sin(a + yaw) * d, 0.1 + rand() * 0.14, k + x); }
  col.circle(x, z, R + 0.1, y0 - 0.5, y0 + H + 0.3);
}

// ---- petroglyphs -------------------------------------------------------------------------------
// Motifs in unit coordinates (the shape about 1 long, head toward +x), drawn as lines.
const arc = (cx, cy, rx, ry, a0, a1, n) => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + (a1 - a0) * i / n; return [cx + rx * Math.cos(a), cy + ry * Math.sin(a)]; });
const MOTIFS = {
  tuna() {      // the fish (kahi) in outline: a lens, a forked tail, a dorsal fin, an eye
    const top = Array.from({ length: 15 }, (_, i) => { const t = i / 14; return [t - 0.5, 0.13 * Math.sin(Math.PI * t) ** 0.85]; });
    const bot = top.map(([a, b]) => [a, -b]);
    return [top, bot, [[-0.5, 0], [-0.64, 0.15]], [[-0.5, 0], [-0.64, -0.15]], [[-0.1, 0.12], [-0.2, 0.22], [-0.3, 0.1]], [[0.33, 0.04], [0.34, 0.055], [0.35, 0.04]]];
  },
  canoe() {     // a double canoe seen from above: two hulls rising at the ends, the beams between them, a mast
    const hull = (y) => Array.from({ length: 15 }, (_, i) => { const t = i / 14 * 2 - 1; return [t * 0.5, y + 0.03 * (t * t) * (y > 0 ? 1 : -1)]; });
    return [hull(0.11), hull(-0.11), [[-0.3, 0.1], [-0.3, -0.1]], [[0, 0.11], [0, -0.11]], [[0.3, 0.1], [0.3, -0.1]], [[0, 0], [0.02, 0.42], [0.2, 0.05]]];
  },
  hook() {      // a fish hook (mangai): shank, bend, barb
    return [[[0, 0.32], [0, 0.0]], arc(0.11, 0, 0.11, 0.11, Math.PI, Math.PI * 2.0, 8), [[0.22, 0], [0.22, 0.1], [0.17, 0.06]], [[-0.04, 0.32], [0.04, 0.32]]];
  },
  turtle() {    // a sea turtle: shell, head, four flippers
    return [arc(0, 0, 0.19, 0.14, 0, Math.PI * 2, 16), arc(0.26, 0, 0.06, 0.05, 0, Math.PI * 2, 8), [[0.1, 0.13], [0.2, 0.3]], [[0.1, -0.13], [0.2, -0.3]], [[-0.1, 0.13], [-0.18, 0.24]], [[-0.1, -0.13], [-0.18, -0.24]]];
  },
  octopus() {   // an octopus (heke): the head, eight arms curling
    const L = [arc(0.14, 0, 0.09, 0.08, 0, Math.PI * 2, 10)];
    for (let k = 0; k < 8; k++) { const a = Math.PI * (0.62 + 0.76 * k / 7), pts = []; for (let i = 0; i <= 6; i++) { const t = i / 6; pts.push([0.05 - 0.5 * t * Math.cos(a - Math.PI * 0.5) * 0.9 - t * 0.12, 0.07 * Math.sin(a) * 2 * t + 0.045 * Math.sin(t * 7 + k) * t]); } L.push(pts); }
    return L;
  },
};
/**
 * carved_rock: a slab of basalt lying a little tilted { c, y, w, d, motifs: [name…], seed, ground } with
 * the creatures of the sea pecked into its face — the pecked lines show as light lines inlaid in the dark
 * stone (carvings of canoes, tuna, fish hooks, turtles and octopus are among the commonest on the island —
 * imaginarapanui.com "Papa Vaka"; Wikipedia "Easter Island"). You can step up onto it.
 */
function carvedRock(el, { bag, col }) {
  const [x, z] = el.c, y0 = el.y ?? 0, W = el.w ?? 4.4, D = el.d ?? 3.2, rand = rng(el.seed ?? 9);
  const t0 = 0.34, tilt = 0.12;                                     // the face's height at its north edge; its rise to the south
  const top = (u, v) => t0 + tilt * (v / D + 0.5);
  const I = 0.18;
  const c = (u, v, yy) => [x + u, y0 + yy, z + v];
  bag.add(B, hull8([c(-W / 2 + I, -D / 2 + I, -0.7), c(W / 2 - I, -D / 2 + I, -0.7), c(W / 2 - I, D / 2 - I, -0.7), c(-W / 2 + I, D / 2 - I, -0.7),
    c(-W / 2, -D / 2, top(0, -D / 2)), c(W / 2, -D / 2, top(0, -D / 2)), c(W / 2, D / 2, top(0, D / 2)), c(-W / 2, D / 2, top(0, D / 2))]));
  // the carvings: each motif placed on its own part of the face, turned this way and that
  const spots = [[-W * 0.26, -D * 0.2], [W * 0.24, -D * 0.12], [0, D * 0.26], [-W * 0.28, D * 0.28], [W * 0.28, D * 0.28]];
  (el.motifs ?? []).forEach((name, k) => {
    const lines = MOTIFS[name]?.(); if (!lines) return;
    const [cu, cv] = spots[k % spots.length], s = (name === 'canoe' ? 1.7 : name === 'hook' ? 1.0 : 1.2) * Math.min(W, D) * 0.42, a = rand() * 6.283 * 0.25 + (k % 2 ? 0.5 : -0.4);
    const ca = Math.cos(a), sa = Math.sin(a), place = ([p, q]) => { const u = cu + (p * ca - q * sa) * s, v = cv + (p * sa + q * ca) * s; return [u, v]; };
    for (const line of lines) for (let i = 0; i < line.length - 1; i++) {
      const A = place(line[i]), Bq = place(line[i + 1]), mu = (A[0] + Bq[0]) / 2, mv = (A[1] + Bq[1]) / 2;
      if (Math.abs(mu) > W / 2 - 0.12 || Math.abs(mv) > D / 2 - 0.12) continue;
      const yt = top(mu, mv);
      bag.add('pebbles', orientedBox([x + A[0], z + A[1]], [x + Bq[0], z + Bq[1]], 0.045, y0 + yt - 0.03, y0 + yt + 0.006, 0.012));
    }
  });
  // small boulders about its foot, the little holes (unknown meaning) pecked beside the figures
  for (let k = 0; k < 9; k++) { const a = rand() * 6.283, d = Math.max(W, D) * 0.5 + rand() * 0.8; stoneAt(bag, B, x + Math.cos(a) * d * 1.05, y0 - 0.05, z + Math.sin(a) * d * 0.8, 0.12 + rand() * 0.16, k + x); }
  col.ramp([x - W / 2, z - D / 2, x + W / 2, z + D / 2], y0 + top(0, -D / 2), y0 + top(0, D / 2), 's');
}

// ---- the carvers' camp ------------------------------------------------------------------------
let TOKI = null;
/** A basalt adze (toki) laid on its side, about 0.3 m long: a tapering blade with a rounded butt. */
function tokiGeometry() {
  return (TOKI ??= lathe([[0.001, 0], [0.045, 0.02], [0.07, 0.09], [0.06, 0.2], [0.028, 0.3], [0.001, 0.31]], 6).scale(1, 1, 0.6).rotateX(Math.PI / 2));
}
const GOURD = () => lathe([[0.001, 0], [0.1, 0.03], [0.16, 0.13], [0.15, 0.25], [0.08, 0.34], [0.045, 0.42], [0.06, 0.47], [0.001, 0.47]], 10);
/**
 * quarry_camp: the working place at the foot of a bay { at (the bay's foot), facing (its head's way), hw
 * (the statue's half-width), ground, seed }: the chips of tuff heaped down the slope, basalt toki lying
 * about, a lean-to of thatch on poles with mats, gourds of water, a coil of rope and a stack of poles
 * [stated: carvers worked the tuff with basalt toki, splashing water on it to soften it; a statue took
 * five or six men about a year — Wikipedia "Easter Island"; inferred: the camp's furnishings].
 */
function quarryCamp(el, { bag }) {
  const [x, z] = el.at, f = el.facing ?? 0, gy = el.ground ?? (() => el.y ?? 0), hw = el.hw ?? 3, rand = rng(el.seed ?? 6);
  const sf = Math.sin(f), cf = Math.cos(f), W = (u, v) => [x + u * cf + v * sf, z - u * sf + v * cf];
  // the spoil: chips of tuff thrown down the slope from the cutting, a few of basalt from broken toki
  for (let k = 0; k < 150; k++) {
    const u = (rand() * 2 - 1) * (hw + 2.4), v = -1.2 - rand() ** 1.4 * 9, [px, pz] = W(u, v), r = 0.05 + rand() ** 3 * 0.3;
    stoneAt(bag, rand() < 0.1 ? B : T, px, gy(px, pz) - 0.02 + r * 0.1, pz, r, k * 0.7 + x, 0.7);
  }
  // the lean-to, a little to one side of the bay: roof of thatch on four poles, mats beneath
  const side = el.side ?? 1, [cx, cz] = W(side * (hw + 6.5), 1.5), cy = gy(cx, cz), ya = f + 0.4 * side;
  const Mc = new Matrix4().makeRotationY(ya).setPosition(cx, cy, cz), add = (m, g) => { g.applyMatrix4(Mc); bag.add(m, g); };
  const hi = 1.85, lo = 1.15, rw = 1.35, rd = 1.0;
  add('thatch', hull8([[-rw, hi - 0.12, -rd], [rw, hi - 0.12, -rd], [rw, lo - 0.12, rd], [-rw, lo - 0.12, rd], [-rw - 0.1, hi, -rd - 0.05], [rw + 0.1, hi, -rd - 0.05], [rw + 0.1, lo, rd + 0.05], [-rw - 0.1, lo, rd + 0.05]]));
  for (const [u, v, h] of [[-rw + 0.1, -rd + 0.1, hi - 0.1], [rw - 0.1, -rd + 0.1, hi - 0.1], [-rw + 0.1, rd - 0.1, lo - 0.1], [rw - 0.1, rd - 0.1, lo - 0.1]]) add('timber', rod([u, -0.25, v], [u, h, v], 0.045, 6));
  add('timber', rod([-rw, hi - 0.16, -rd + 0.05], [rw, hi - 0.16, -rd + 0.05], 0.04, 6));
  add('reed_mat', box(-rw + 0.2, 0.0, -rd + 0.3, rw - 0.2, 0.05, rd - 0.1));
  add('hide_white', box(-0.4, 0.05, -0.5, 0.55, 0.08, 0.3));
  // gourds of water, a coil of rope, a stack of poles with a toki or two and the stone chips
  for (const [u, v] of [[-0.9, -0.5], [-0.75, -0.15], [0.9, -0.4]]) add('pottery_dark', GOURD().translate(u, 0.05, v));
  add('rope_fibre', lathe([[0.2, 0], [0.26, 0.04], [0.2, 0.08], [0.14, 0.04], [0.2, 0]], 10).translate(0.7, 0.05, 0.4));
  for (let k = 0; k < 5; k++) add('timber', rod([-1.7 + k * 0.05, 0.1 + k * 0.06, 1.6], [-1.6 + k * 0.05, 0.1 + k * 0.06, -0.8], 0.035, 5).translate(-0.3, 0, 0));
  const tk = tokiGeometry();
  for (let k = 0; k < 9; k++) {
    const u = (rand() * 2 - 1) * (hw + 1), v = -0.5 + rand() * 4.6, [px, pz] = W(u + side * 1.2, v), m = new Matrix4().makeRotationY(rand() * 6.283).setPosition(px, gy(px, pz) + 0.03, pz);
    if (bag.addInstance) bag.addInstance(B, tk, m, { reach: 160 }); else bag.add(B, tk.clone().applyMatrix4(m));
  }
}

// ---- the chief's long house -------------------------------------------------------------------
let KAVA = null;
/**
 * A moai kavakava, 0.5 m: the stooped, ribbed figure of toromiro wood, its head long with a goatee,
 * the arms down, hung round the neck at ceremonies [stated: Wikipedia "Moai kavakava": a standing,
 * slightly stooped male figure with an emaciated body and visible ribs, worn at public ceremonies].
 */
function kavakava() {
  if (KAVA) return KAVA;
  const ribs = [[0.001, 0.2], [0.03, 0.21], [0.05, 0.225], [0.04, 0.24], [0.052, 0.255], [0.04, 0.27], [0.052, 0.285], [0.04, 0.3], [0.052, 0.315], [0.04, 0.33], [0.05, 0.345], [0.032, 0.36], [0.02, 0.375], [0.001, 0.38]];
  const parts = [lathe(ribs, 10).scale(1, 1, 0.62),
    lathe([[0.001, 0.36], [0.03, 0.375], [0.045, 0.41], [0.043, 0.45], [0.03, 0.49], [0.001, 0.5]], 10).scale(0.9, 1, 1.1).translate(0, 0, -0.012),
    rod([0, 0.4, -0.03], [0, 0.34, -0.075], 0.012, 5), rod([-0.04, 0.36, 0.0], [-0.05, 0.22, -0.02], 0.012, 5), rod([0.04, 0.36, 0.0], [0.05, 0.22, -0.02], 0.012, 5),
    rod([-0.02, 0.2, 0], [-0.026, 0.0, 0], 0.018, 6), rod([0.02, 0.2, 0], [0.026, 0.0, 0], 0.018, 6)];
  return (KAVA = merge(parts));
}
/**
 * hare_paenga_long: the chief's long house { c, y, len, w, h, yaw, seed } — a hare paenga of the great
 * kind [stated: some reached about 45 m — Wikipedia "Easter Island"] with its boat-shaped curb of dressed
 * basalt, the thatch over arched poles laid on purlins to a ridge pole, the poles showing inside on a
 * second skin of thatch; the door (raised here so that it can be entered: the common house's was a
 * crawl, [stated: easterisland.travel]) on the long side, before it a half-moon of poro and an earth
 * oven. Inside: the reed-mat floor, a ring-of-stones hearth, mats and bark-cloth bedding with headrests,
 * gourds, baskets, spears tipped with obsidian, nets and bundles hung from the poles, a moai kavakava
 * and a rongorongo tablet [inferred: the furnishing, from what is known of Polynesian houses and the
 * objects the island is known for].
 */
function longHouse(el, { bag, col }) {
  const [x, z] = el.c, y0 = el.y ?? 0, L = el.len ?? 26, W = el.w ?? 4.4, H = el.h ?? 3.6, yaw = el.yaw ?? 0, rand = rng(el.seed ?? 5);
  const ca = Math.cos(yaw), sa = Math.sin(yaw), P = (u, v) => [x + u * ca + v * sa, z - u * sa + v * ca];
  const M = new Matrix4().makeRotationY(yaw).setPosition(x, y0, z), add = (m, g) => { g.applyMatrix4(M); bag.add(m, g); };
  const w3 = (u, y, v) => { const [a, b] = P(u, v); return [a, y0 + y, b]; };
  const half = (u) => (W / 2) * Math.max(0, 1 - (2 * u / L) ** 2) ** 0.62;
  const FL = 0.07;                                                   // the floor's height
  // the curb, with the threshold left open at the door
  const n = Math.round(L * 2.1 / 1.1), pts = [];
  for (let i = 0; i < n; i++) { const t = i / n * Math.PI * 2, u = -Math.cos(t) * (L / 2 + 0.12); pts.push([u, Math.sin(t) >= 0 ? half(u) + 0.14 : -half(u) - 0.14]); }
  for (let i = 0; i < n; i++) {
    const a = pts[i], b = pts[(i + 1) % n];
    if (a[1] < 0 && b[1] < 0 && Math.abs(a[0]) < 0.9 && Math.abs(b[0]) < 0.9) continue;
    add(B, orientedBox(a, b, 0.24, -0.35, 0.22 + rand() * 0.04, -0.03));
  }
  add(B, box(-0.62, -0.35, -half(0) - 0.4, 0.62, 0.08, -half(0) + 0.1));    // the threshold stone
  // the hull
  const arch = (c) => (1 - Math.abs(c) ** 1.3) ** 0.62;
  const NU = 44, NS = 16, G = [], Gi = [], I0 = NU / 2 - 1, I1 = NU / 2 + 1, JD = 3;
  for (let i = 0; i <= NU; i++) {
    const u = -L / 2 + L * i / NU, w = half(u) + 0.02, hh = H * Math.max(0, 1 - (2 * u / L) ** 2) ** 0.4, r = [], ri = [];
    for (let j = 0; j <= NS; j++) {
      const c = 1 - 2 * j / NS, yy = hh * arch(c), v = -c * w;
      r.push([u, 0.2 + yy, v]);
      ri.push([u, Math.max(0.2, 0.2 + yy - 0.1), Math.sign(v) * Math.max(0, Math.abs(v) - 0.1)]);
    }
    G.push(r); Gi.push(ri);
  }
  const outer = [], inner = [];
  for (let i = 0; i < NU; i++) for (let j = 0; j < NS; j++) {
    if (i >= I0 && i < I1 && j < JD) continue;                       // the doorway
    const a = G[i][j], b = G[i + 1][j], c = G[i + 1][j + 1], d = G[i][j + 1];
    outer.push(...a, ...d, ...c, ...a, ...c, ...b);
    const e = Gi[i][j], f = Gi[i + 1][j], g = Gi[i + 1][j + 1], h = Gi[i][j + 1];
    inner.push(...e, ...g, ...h, ...e, ...f, ...g);
  }
  add('thatch', fromTriangles(outer));
  add('thatch', fromTriangles(inner));
  // the reveals of the doorway: the thatch's thickness at its sides and head
  const rev = [];
  for (const i of [I0, I1]) for (let j = 0; j < JD; j++) { const a = G[i][j], b = G[i][j + 1], c = Gi[i][j + 1], d = Gi[i][j]; rev.push(...a, ...b, ...c, ...a, ...c, ...d); }
  for (let i = I0; i < I1; i++) { const a = G[i][JD], b = G[i + 1][JD], c = Gi[i + 1][JD], d = Gi[i][JD]; rev.push(...a, ...b, ...c, ...a, ...c, ...d); }
  add('thatch', fromTriangles(rev.concat(flip(rev))));
  // the frame: arched poles every third step, purlins between them, the ridge pole, the door's jambs and lintel
  for (let i = 2; i < NU; i += 3) for (let j = 0; j < NS; j++) add('timber', rod(Gi[i][j], Gi[i][j + 1], 0.034, 5));
  for (let j = 2; j < NS - 1; j += 2) for (let i = 0; i < NU; i++) {
    if (i >= I0 && i < I1 && j < JD + 1) continue;
    add('timber', rod(Gi[i][j], Gi[i + 1][j], 0.02, 4));
  }
  for (let i = 1; i < NU - 1; i++) add('timber', rod(Gi[i][NS / 2], Gi[i + 1][NS / 2], 0.055, 5));
  for (const i of [I0, I1]) add('timber', rod([G[i][0][0], G[i][0][1] - 0.2, G[i][0][2]], G[i][JD], 0.055, 6));
  add('timber', rod(G[I0][JD], G[I1][JD], 0.07, 6));
  // the ridge bundles on the outside
  const ridge = (u) => [u, 0.2 + H * Math.max(0, 1 - (2 * u / L) ** 2) ** 0.4 + 0.03, 0];
  for (let k = 0; k < 11; k++) add('thatch', rod(ridge(-L * 0.45 + L * 0.9 * k / 11), ridge(-L * 0.45 + L * 0.9 * (k + 1) / 11), 0.12, 6));
  // the half-moon of poro before the door, the earth oven to one side
  const R = 3.3, cv = -half(0) - 0.55, nseg = 14, fan = [];
  for (let k = 0; k < nseg; k++) {
    const a0 = Math.PI * k / nseg, a1 = Math.PI * (k + 1) / nseg;
    const p0 = [Math.cos(a0) * R, -Math.sin(a0) * R * 0.75 + cv], p1 = [Math.cos(a1) * R, -Math.sin(a1) * R * 0.75 + cv];
    fan.push(0, 0.09, cv, p1[0], 0.09, p1[1], p0[0], 0.09, p0[1]);
    fan.push(p0[0], 0.09, p0[1], p1[0], 0.09, p1[1], p1[0], -0.35, p1[1], p0[0], 0.09, p0[1], p1[0], -0.35, p1[1], p0[0], -0.35, p0[1]);
    const am = (a0 + a1) / 2, [sx, sz] = P(Math.cos(am) * (R + 0.05), -Math.sin(am) * (R + 0.05) * 0.75 + cv);
    stoneAt(bag, 'pebbles', sx, y0 + 0.02, sz, 0.17 + rand() * 0.08, k);
  }
  fan.push(-R, 0.09, cv, R, 0.09, cv, R, -0.35, cv, -R, 0.09, cv, R, -0.35, cv, -R, -0.35, cv);
  for (let k = 0; k < nseg; k++) fan.push(0, -0.35, cv, Math.cos(Math.PI * k / nseg) * R, -0.35, -Math.sin(Math.PI * k / nseg) * R * 0.75 + cv, Math.cos(Math.PI * (k + 1) / nseg) * R, -0.35, -Math.sin(Math.PI * (k + 1) / nseg) * R * 0.75 + cv);
  add('pebbles', fromTriangles(orientOutward(fan)));
  for (let k = 0; k < 34; k++) { const a = rand() * Math.PI, rr = Math.sqrt(rand()) * (R - 0.3), [sx, sz] = P(Math.cos(a) * rr, -Math.sin(a) * rr * 0.75 + cv); stoneAt(bag, 'pebbles', sx, y0 + 0.07, sz, 0.08 + rand() * 0.07, k * 1.3); }
  const ov = cv - 3.2, ou = L * 0.16;
  for (let k = 0; k < 8; k++) {
    const a = k / 8 * Math.PI * 2, b = (k + 1) / 8 * Math.PI * 2, rr = 0.7;
    add(B, orientedBox([ou + Math.cos(a) * rr, ov + Math.sin(a) * rr], [ou + Math.cos(b) * rr, ov + Math.sin(b) * rr], 0.14, -0.3, 0.2 + (k % 2) * 0.06, -0.04));
  }
  add('opening', lathe([[0.62, 0.02], [0.001, 0.03]], 12, null, ou, 0, ov));
  // ---- inside
  const strips = [];
  for (let i = 1; i < NU - 1; i++) {
    const u0 = -L / 2 + L * i / NU, u1 = -L / 2 + L * (i + 1) / NU, h0 = half(u0) * 0.86, h1 = half(u1) * 0.86;
    strips.push(u0, FL, -h0, u1, FL, h1 * -1, u1, FL, h1, u0, FL, -h0, u1, FL, h1, u0, FL, h0);
  }
  // (the strips are laid facing up: (a, b, c) was wound downward, so each quad is rewound)
  const up = []; for (let i = 0; i < strips.length; i += 18) { const q = strips.slice(i, i + 18); up.push(...q.slice(0, 3), ...q.slice(6, 9), ...q.slice(3, 6), ...q.slice(9, 12), ...q.slice(15, 18), ...q.slice(12, 15)); }
  add('reed_mat', fromTriangles(up));
  // the hearth, a ring of stones round a bed of ash, in the middle between the two sleeping halves
  for (let k = 0; k < 9; k++) { const a = k / 9 * Math.PI * 2, [sx, sz] = P(-3 + Math.cos(a) * 0.55, Math.sin(a) * 0.55); stoneAt(bag, B, sx, y0 + FL - 0.03, sz, 0.12 + rand() * 0.04, k + 3); }
  add('opening', lathe([[0.46, FL + 0.005], [0.001, FL + 0.012]], 12, null, -3, 0, 0));
  // sleeping places down both sides: a mat, a folded blanket of bark cloth, a wooden headrest
  for (const s of [-1, 1]) for (let k = 0; k < 5; k++) {
    const u = (s < 0 ? -9.2 : 3.2) + k * 1.35, v = s * 0.55;
    add('reed_mat', box(u, FL, v - 0.42, u + 1.1, FL + 0.05, v + 0.42));
    if ((k + (s > 0 ? 1 : 0)) % 2 === 0) add('hide_white', box(u + 0.15, FL + 0.05, v - 0.34, u + 0.9, FL + 0.085, v + 0.34));
    else add('cloth_ochre', box(u + 0.2, FL + 0.05, v - 0.3, u + 0.85, FL + 0.08, v + 0.3));
    const hv = s * 0.98;
    add('timber', box(u + 0.3, FL + 0.05, hv - 0.04, u + 0.75, FL + 0.1, hv + 0.04));
    add('timber', box(u + 0.3, FL + 0.1, hv - 0.06, u + 0.75, FL + 0.14, hv + 0.06));
  }
  // gourds and baskets along the foot of the walls at both ends
  for (let k = 0; k < 6; k++) add('pottery_dark', GOURD().scale(1 + 0.2 * (k % 3), 1 + 0.15 * (k % 2), 1).translate(-10.6 + (k % 3) * 0.55, FL, -0.5 + Math.floor(k / 3) * 0.55));
  for (let k = 0; k < 4; k++) {
    const u = 10.3 + (k % 2) * 0.7, v = -0.45 + Math.floor(k / 2) * 0.85;
    add('wicker', lathe([[0.2, 0], [0.27, 0.1], [0.28, 0.3], [0.23, 0.36], [0.001, 0.36]], 12).translate(u, FL, v));
    add('wicker', lathe([[0.26, 0.36], [0.2, 0.44], [0.05, 0.5], [0.001, 0.5]], 12).translate(u, FL, v));
  }
  // the spears leaning at the wall on the north side, their heads of obsidian (mataa)
  const wallV = (u, y) => { const hh = H * Math.max(0, 1 - (2 * u / L) ** 2) ** 0.4, t = Math.max(0.01, Math.min(0.99, (y - 0.2) / hh)), c = (1 - t ** (1 / 0.62)) ** (1 / 1.3); return c * (half(u) + 0.02); };
  for (let k = 0; k < 4; k++) {
    const u = 6.1 + k * 0.26, a = [u, FL, wallV(u, 0.3) - 0.14], b = [u + 0.1, 2.1, wallV(u + 0.1, 2.1) - 0.14];
    add('timber', rod(a, b, 0.017, 5));
    const dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2], L2 = Math.hypot(dx, dy, dz), e = [b[0] + dx / L2 * 0.2, b[1] + dy / L2 * 0.2, b[2] + dz / L2 * 0.2];
    add('obsidian', rod(b, e, 0.022, 4));
  }
  // nets and bundles hung from the ridge: festoons of fibre cord between the poles, rolls of bark cloth
  for (let k = 0; k < 5; k++) {
    const u0 = -9 + k * 3.8, y = 0.2 + H * Math.max(0, 1 - (2 * (u0 + 1.9) / L) ** 2) ** 0.4 - 0.25;
    rope(bag, [w3(u0, y, -0.3), w3(u0 + 1.9, y - 0.1, -0.15), w3(u0 + 3.8, y, -0.3)], 0.016);
    rope(bag, [w3(u0, y - 0.05, 0.35), w3(u0 + 1.9, y - 0.18, 0.2), w3(u0 + 3.8, y - 0.05, 0.35)], 0.016);
    if (k % 2 === 0) { add('hide_white', lathe([[0.001, 0], [0.1, 0.04], [0.11, 0.5], [0.001, 0.54]], 8).translate(u0 + 1.9, y - 0.75, 0.0)); add('rope_fibre', rod([u0 + 1.9, y - 0.2, 0], [u0 + 1.9, y - 0.2 - 0.0 + 0.2, 0], 0.012, 4)); rope(bag, [w3(u0 + 1.9, y - 0.2, 0), w3(u0 + 1.9, y - 0.22, 0)], 0.012); }
  }
  // the kavakava on a flat stone at the east end, a tablet of rongorongo on bark cloth by the bedding
  add(B, box(11.1, FL - 0.1, -0.2, 11.6, FL + 0.08, 0.2));
  add('timber', kavakava().clone().rotateY(Math.PI / 2).translate(11.35, FL + 0.08, 0));
  add('hide_white', box(9.0, FL, 0.2, 9.9, FL + 0.03, 0.62));
  add('timber', box(9.1, FL + 0.03, 0.27, 9.8, FL + 0.065, 0.55));
  for (let r = 0; r < 6; r++) for (let q = 0; q < 12; q++) if (rand() < 0.8) add('bark_dark', box(9.14 + q * 0.055, FL + 0.065, 0.29 + r * 0.04, 9.14 + q * 0.055 + 0.03, FL + 0.071, 0.29 + r * 0.04 + 0.012));
  // colliders: a loop at the height where the roof is a head's height, open at the door; a floor
  const ring = [];
  for (let i = 0; i < 44; i++) { const t = i / 44 * Math.PI * 2, u = -Math.cos(t) * (L / 2 - 0.4), sg = Math.sin(t) >= 0 ? 1 : -1; ring.push([u, sg * half(u) * 0.74]); }
  for (let i = 0; i < ring.length; i++) {
    const a = ring[i], b = ring[(i + 1) % ring.length];
    if (a[1] < 0 && b[1] < 0 && Math.abs(a[0]) < 1.4 && Math.abs(b[0]) < 1.4) continue;
    col.segment(P(a[0], a[1]), P(b[0], b[1]), 0.3, y0 - 0.5, y0 + H);
  }
  col.circle(...P(-3, 0), 0.5, y0, y0 + 0.3);
  const fx = x - L / 2 + 0.9, fz = z - W * 0.3;
  col.floor([fx, fz, x + L / 2 - 0.9, z + W * 0.3], y0 + FL);
  void H;
}

export { kavakava, tokiGeometry, GOURD };
export const WORKS = { tupa, carved_rock: carvedRock, quarry_camp: quarryCamp, hare_paenga_long: longHouse };
void tube;
