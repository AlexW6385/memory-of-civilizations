// The shared library of objects of use and of life (DESIGN §5, §9): pots, baskets, sacks, barrels,
// crates, firewood, benches, market stalls, carts and barrows, ladders, laundry, troughs, wells;
// animals and still figures; boats; for the modern settlements cars, lamps and benches. Generated
// geometry, parameterised by kind and material, registered as the style `life`. Every builder
// takes { at: [x, z], y, rot (radians about +y), s (scale), seed, … } in its plan's coordinates.

import { registerStyle } from '../core/build.js';
import { box, lathe, fromTriangles } from '../core/geom.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
/** A placer: builds at the origin, then scales, turns and moves each piece to the object's place. */
function placer(el, bag) {
  const [x, z] = el.at, y = el.y ?? 0, rot = el.rot ?? 0, s = el.s ?? 1;
  return (mat, g) => { if (s !== 1) g.scale(s, s, s); g.rotateY(rot); g.translate(x, y, z); bag.add(mat, g); };
}
const at = (g, x, y, z) => { g.translate(x, y, z); return g; };
const lz = (profile, seg = 12) => lathe(profile, seg);
/** A cylinder lying along x (wheels, logs, rolls). */
function lying(r, len, seg = 12) { const g = lathe([[r, 0], [r, len], [0.001, len]], seg); g.translate(0, -len / 2, 0); g.rotateZ(Math.PI / 2); return g; }
/** An ellipsoid-ish body along z, half-length a, radius b, raised to y. */
function body(a, b, seg = 10) { const g = lathe([[0.001, -a], [b * 0.6, -a * 0.85], [b, -a * 0.3], [b, a * 0.3], [b * 0.65, a * 0.85], [0.001, a]], seg); g.rotateX(Math.PI / 2); return g; }
const turn = (g, ang) => { g.rotateY(ang); return g; };

// ---- pots, baskets, stores --------------------------------------------------------------------
const POTS = {
  amphora: { m: 'terracotta', p: [[0.04, 0], [0.09, 0.08], [0.2, 0.3], [0.21, 0.42], [0.12, 0.6], [0.06, 0.68], [0.07, 0.75], [0.001, 0.75]] },
  pithos: { m: 'terracotta', p: [[0.2, 0], [0.38, 0.25], [0.45, 0.6], [0.38, 1.0], [0.24, 1.15], [0.27, 1.22], [0.001, 1.22]] },
  water_pot: { m: 'terracotta', p: [[0.08, 0], [0.2, 0.08], [0.24, 0.22], [0.18, 0.36], [0.08, 0.42], [0.1, 0.46], [0.001, 0.46]] },
  dark_pot: { m: 'pottery_dark', p: [[0.1, 0], [0.22, 0.1], [0.25, 0.25], [0.16, 0.38], [0.14, 0.44], [0.001, 0.44]] },
  glazed_jar: { m: 'glaze_green', p: [[0.16, 0], [0.3, 0.2], [0.34, 0.45], [0.26, 0.7], [0.16, 0.78], [0.17, 0.84], [0.001, 0.84]] },
  blue_jar: { m: 'glaze_blue', p: [[0.12, 0], [0.24, 0.15], [0.27, 0.38], [0.18, 0.58], [0.1, 0.62], [0.11, 0.68], [0.001, 0.68]] },
};
/** pot: { kind, n (a cluster of n) } */
function pot(el, { bag }) {
  const put = placer(el, bag), rand = rng(el.seed), P = POTS[el.kind] ?? POTS.water_pot, n = el.n ?? 1;
  for (let i = 0; i < n; i++) { const a = rand() * 6.28, r = i ? 0.35 + rand() * 0.35 : 0, k = 0.75 + rand() * 0.35; const g = lz(P.p.map(([pr, py]) => [pr * k, py * k])); put(P.m, at(g, Math.cos(a) * r, 0, Math.sin(a) * r)); }
}
function basket(el, { bag }) {
  const put = placer(el, bag), rand = rng(el.seed), n = el.n ?? 1;
  for (let i = 0; i < n; i++) {
    const r = 0.22 + rand() * 0.18, h = 0.2 + rand() * 0.25, a = rand() * 6.28, d = i ? 0.45 + rand() * 0.2 : 0, x = Math.cos(a) * d, z = Math.sin(a) * d;
    put('wicker', at(lz([[r * 0.75, 0], [r, h], [r * 0.92, h], [r * 0.7, 0.03], [0.001, 0.03]], 12), x, 0, z));
    if (rand() < 0.6) put(el.goods ?? ['cloth_ochre', 'cloth_red', 'cloth_green', 'hide_tan'][Math.floor(rand() * 4)], at(lz([[r * 0.9, 0], [r * 0.5, 0.1], [0.001, 0.13]], 10), x, h - 0.06, z));
  }
}
function sacks(el, { bag }) {
  const put = placer(el, bag), rand = rng(el.seed), n = el.n ?? 3;
  for (let i = 0; i < n; i++) { const x = (i % 3 - 1) * 0.55 + (rand() - 0.5) * 0.1, z = Math.floor(i / 3) * 0.5, top = i >= 3 ? 0.55 : 0; const g = lz([[0.25, 0], [0.3, 0.15], [0.27, 0.45], [0.12, 0.6], [0.001, 0.62]], 9); g.scale(1, 1, 0.8); put(el.mat ?? 'sacking', at(g, x, top, z)); }
}
function barrel(el, { bag }) {
  const put = placer(el, bag), rand = rng(el.seed), n = el.n ?? 1;
  for (let i = 0; i < n; i++) {
    const x = i * 0.7 - (n - 1) * 0.35, z = (rand() - 0.5) * 0.2;
    put('timber', at(lz([[0.27, 0], [0.32, 0.25], [0.33, 0.45], [0.32, 0.65], [0.27, 0.9], [0.001, 0.9]], 14), x, 0, z));
    for (const yy of [0.12, 0.78]) put('iron', at(lz([[0.315, 0], [0.315, 0.05], [0.001, 0.05]], 14), x, yy, z));
  }
}
function crates(el, { bag }) {
  const put = placer(el, bag), rand = rng(el.seed), n = el.n ?? 2;
  for (let i = 0; i < n; i++) { const w = 0.5 + rand() * 0.3, x = (i % 2) * 0.75, y = i >= 2 ? 0.6 : 0; put('timber', turn(at(box(-w / 2, 0, -w / 2, w / 2, 0.55, w / 2), 0, 0, 0), (rand() - 0.5) * 0.3).translate(x, y, 0)); }
}
function firewood(el, { bag }) {
  const put = placer(el, bag), rand = rng(el.seed), L = el.len ?? 1.6;
  for (let row = 0; row < 4; row++) for (let k = 0; k < 6 - row; k++) { const g = lying(0.07 + rand() * 0.03, L * (0.85 + rand() * 0.2), 6); g.rotateY(Math.PI / 2); put('bark_pine', at(g, 0, 0.07 + row * 0.13, (k - (5 - row) / 2) * 0.15 + (rand() - 0.5) * 0.03)); }
}
function bench(el, { bag, col }) {
  const put = placer(el, bag), L = el.len ?? 1.8, m = el.mat ?? 'timber';
  put(m, box(-L / 2, 0.42, -0.18, L / 2, 0.47, 0.18));
  for (const x of [-L / 2 + 0.15, L / 2 - 0.15]) put(m, box(x - 0.05, 0, -0.15, x + 0.05, 0.42, 0.15));
  if (el.back) put(m, box(-L / 2, 0.47, 0.14, L / 2, 0.85, 0.18));
}
function trough(el, { bag, col }) {
  const put = placer(el, bag), m = el.mat ?? 'limestone';
  put(m, box(-0.9, 0, -0.3, 0.9, 0.55, -0.24)); put(m, box(-0.9, 0, 0.24, 0.9, 0.55, 0.3)); put(m, box(-0.9, 0, -0.3, -0.84, 0.55, 0.3)); put(m, box(0.84, 0, -0.3, 0.9, 0.55, 0.3)); put(m, box(-0.9, 0, -0.3, 0.9, 0.1, 0.3));
  put('water', box(-0.84, 0.4, -0.24, 0.84, 0.42, 0.24));
}
function well(el, { bag, col }) {
  const put = placer(el, bag), m = el.mat ?? 'limestone', [x, z] = el.at, y = el.y ?? 0;
  put(m, lz([[0.75, 0], [0.75, 0.75], [0.55, 0.75], [0.55, 0.1], [0.001, 0.1]], 16));
  put('water', at(lz([[0.55, 0], [0.001, 0]], 12), 0, 0.25, 0));
  for (const s of [-1, 1]) put('timber', box(s * 0.7 - 0.06, 0, -0.06, s * 0.7 + 0.06, 2, 0.06));
  put('timber', at(lying(0.05, 1.5, 6), 0, 1.85, 0));
  put('timber', at(lz([[0.14, 0], [0.16, 0.25], [0.001, 0.25]], 8), 0.3, 0.75, 0));
  col.circle(x, z, 0.8, y, y + 0.75);
}

// ---- stalls, carts, tools ---------------------------------------------------------------------
/** stall: { awning (cloth material), goods: [pot kinds or 'basket' | 'cloth' | 'produce'] } — a table on posts under a cloth awning, goods laid out. */
function stall(el, { bag, col }) {
  const put = placer(el, bag), rand = rng(el.seed), W = el.w ?? 2.6, D = el.d ?? 1.4, aw = el.awning ?? 'cloth_white';
  for (const [px, pz] of [[-W / 2, -D / 2], [W / 2, -D / 2], [-W / 2, D / 2 + 0.6], [W / 2, D / 2 + 0.6]]) put('timber', box(px - 0.05, 0, pz - 0.05, px + 0.05, pz > 0 ? 2.1 : 2.4, pz + 0.05));
  put('timber', box(-W / 2, 0.75, -D / 2, W / 2, 0.8, D / 2)); put('timber', box(-W / 2 + 0.05, 0, -D / 2 + 0.05, W / 2 - 0.05, 0.75, -D / 2 + 0.1));
  const g = box(-W / 2 - 0.2, -0.02, -D / 2 - 0.2, W / 2 + 0.2, 0.02, D / 2 + 0.8); g.rotateX(-0.2); g.translate(0, 2.3, 0); put(aw, g);
  const goods = el.goods ?? ['basket', 'produce', 'cloth'];
  for (let i = 0; i < 4; i++) {
    const kind = goods[Math.floor(rand() * goods.length)], x = -W / 2 + 0.4 + i * (W - 0.8) / 3, z = (rand() - 0.5) * 0.4;
    if (kind === 'cloth') for (let k = 0; k < 3; k++) put(['cloth_red', 'cloth_indigo', 'cloth_ochre', 'cloth_white', 'cloth_green'][Math.floor(rand() * 5)], at(lying(0.08, 0.6, 8), x, 0.88 + k * 0.15, z));
    else if (kind === 'produce') { put('wicker', at(lz([[0.22, 0], [0.26, 0.12], [0.001, 0.12]], 10), x, 0.8, z)); put(['cloth_green', 'cloth_red', 'cloth_ochre'][Math.floor(rand() * 3)], at(lz([[0.22, 0], [0.12, 0.12], [0.001, 0.15]], 8), x, 0.9, z)); }
    else if (kind === 'basket') put('wicker', at(lz([[0.16, 0], [0.22, 0.2], [0.001, 0.2]], 10), x, 0.8, z));
    else { const P = POTS[kind] ?? POTS.water_pot; put(P.m, at(lz(P.p.map(([r, h]) => [r * 0.6, h * 0.6])), x, 0.8, z)); }
  }
  const [x, z] = el.at, y = el.y ?? 0, c = Math.cos(el.rot ?? 0), s = Math.sin(el.rot ?? 0), R = Math.hypot(W, D) / 2;
  col.circle(x, z, Math.min(W, D) / 2 + 0.2, y, y + 0.8);
}
/** A spoked wheel in the x = 0 plane, radius r. */
function wheel(r, w = 0.08, spokes = 8) {
  const parts = [];
  const rim = lathe([[r, 0], [r, w], [r - 0.06, w], [r - 0.06, 0], [r, 0]], 20); rim.translate(0, -w / 2, 0); rim.rotateZ(Math.PI / 2); parts.push(rim);
  const hub = lying(0.08, w + 0.12, 8); parts.push(hub);
  for (let k = 0; k < spokes; k++) { const g = box(-0.02, 0, -0.025, 0.02, r - 0.05, 0.025); g.rotateX(k / spokes * Math.PI * 2); parts.push(g); }
  return parts;
}
/** cart: { kind ('two' | 'four' | 'ox'), load ('sacks' | 'barrels' | 'hay' | 'empty') } */
function cart(el, { bag, col }) {
  const put = placer(el, bag), rand = rng(el.seed), four = el.kind === 'four', L = four ? 3 : 2.2, W = 1.3, r = four ? 0.45 : 0.62, yb = r + 0.15;
  put('timber', box(-W / 2, yb, -L / 2, W / 2, yb + 0.08, L / 2));
  for (const s of [-1, 1]) put('timber', box(s * W / 2 - 0.05, yb, -L / 2, s * W / 2 + 0.05, yb + 0.45, L / 2));
  put('timber', box(-W / 2, yb, L / 2 - 0.05, W / 2, yb + 0.45, L / 2 + 0.05));
  for (const s of [-1, 1]) { const g = box(s * 0.45 - 0.04, 0, -0.04, s * 0.45 + 0.04, 0.08, 1.8); g.rotateX(0.18); g.translate(0, yb, -L / 2 - 1.6); put('timber', g); }
  const axles = four ? [-L / 2 + 0.5, L / 2 - 0.5] : [0.1];
  for (const az of axles) { put('timber', at(lying(0.05, W + 0.4, 6), 0, r, az)); for (const s of [-1, 1]) for (const g of wheel(r)) put('timber', at(g, s * (W / 2 + 0.12), r, az)); }
  const load = el.load ?? ['sacks', 'barrels', 'hay', 'empty'][Math.floor(rand() * 4)];
  if (load === 'sacks') for (let i = 0; i < 4; i++) { const g = lz([[0.22, 0], [0.26, 0.12], [0.22, 0.35], [0.001, 0.42]], 8); g.rotateX(Math.PI / 2); put('sacking', at(g, (i % 2 - 0.5) * 0.55, yb + 0.3, (Math.floor(i / 2) - 0.5) * 0.7 - 0.2)); }
  else if (load === 'barrels') for (let i = 0; i < 2; i++) put('timber', at(lz([[0.24, 0], [0.28, 0.3], [0.24, 0.65], [0.001, 0.65]], 12), 0, yb + 0.08, (i - 0.5) * 0.7));
  else if (load === 'hay') put('thatch', at(lz([[W / 2, 0], [W / 2 - 0.05, 0.5], [0.3, 0.8], [0.001, 0.85]], 8).scale(1, 1, L / W), 0, yb + 0.08, 0));
  const [x, z] = el.at, y = el.y ?? 0, c = Math.cos(el.rot ?? 0), s = Math.sin(el.rot ?? 0);
  col.circle(x, z, 1.1, y, y + yb + 0.45);
}
/** barrow: the Chinese wheelbarrow — one large central wheel, a frame either side, handles. */
function barrow(el, { bag }) {
  const put = placer(el, bag), r = 0.45;
  for (const g of wheel(r, 0.06, 10)) { g.rotateY(Math.PI / 2); put('timber', at(g, 0, r, 0)); }
  for (const s of [-1, 1]) { put('timber', box(s * 0.3 - 0.04, r + 0.05, -0.8, s * 0.3 + 0.04, r + 0.12, 0.9)); const g = box(s * 0.35 - 0.03, 0, -0.03, s * 0.35 + 0.03, 0.03, 0.8); g.rotateX(-0.35); g.translate(0, r + 0.1, 0.9); put('timber', g); put('timber', box(s * 0.32 - 0.03, 0, -0.65, s * 0.32 + 0.03, r + 0.1, -0.6)); put('sacking', at(lz([[0.18, 0], [0.2, 0.2], [0.001, 0.3]], 8), s * 0.45, r + 0.12, 0.1)); }
  put('timber', box(-0.36, r + 0.12, -0.6, 0.36, r + 0.16, 0.6));
}
function ladder(el, { bag }) {
  const put = placer(el, bag), L = el.len ?? 3, lean = 0.28, parts = [];
  for (const s of [-1, 1]) parts.push(box(s * 0.22 - 0.03, 0, -0.03, s * 0.22 + 0.03, L, 0.03));
  for (let k = 1; k < L / 0.32; k++) parts.push(box(-0.22, k * 0.32 - 0.02, -0.02, 0.22, k * 0.32 + 0.02, 0.02));
  for (const g of parts) { g.rotateX(-lean); put('timber', g); }
}
/** laundry: two posts and a line, cloths hanging. */
function laundry(el, { bag }) {
  const put = placer(el, bag), rand = rng(el.seed), L = el.len ?? 3.2;
  for (const s of [-1, 1]) put('timber', box(s * L / 2 - 0.04, 0, -0.04, s * L / 2 + 0.04, 2, 0.04));
  put('timber', box(-L / 2, 1.9, -0.008, L / 2, 1.915, 0.008));
  const n = 3 + Math.floor(rand() * 3), cl = ['cloth_white', 'cloth_white', 'cloth_indigo', 'cloth_red', 'cloth_ochre', 'cloth_grey'];
  for (let i = 0; i < n; i++) { const w = 0.35 + rand() * 0.45, x = -L / 2 + 0.3 + i * (L - 0.6) / n, h = 0.4 + rand() * 0.5; put(cl[Math.floor(rand() * cl.length)], box(x, 1.9 - h, -0.01, x + w, 1.9, 0.01)); }
}
function haystack(el, { bag, col }) {
  const put = placer(el, bag), [x, z] = el.at, y = el.y ?? 0;
  put('thatch', lz([[1.3, 0], [1.4, 1], [1.1, 2], [0.4, 2.8], [0.001, 3]], 12)); col.circle(x, z, 1.3, y, y + 3);
}

// ---- animals -------------------------------------------------------------------------------------
// L body length, H height of the back, B body radius, neck length and angle (degrees above level),
// head length and angle, leg thickness
const BEASTS = {
  horse: { L: 1.6, H: 1.55, B: 0.31, neck: 0.8, na: 52, head: 0.58, ha: -55, leg: 0.06, mats: ['hide_brown', 'hide_black', 'hide_tan', 'hide_grey'], ears: 0.12, tail: 'hair', mane: 1 },
  donkey: { L: 1.1, H: 1.12, B: 0.24, neck: 0.5, na: 40, head: 0.48, ha: -50, leg: 0.045, mats: ['hide_grey', 'hide_brown'], ears: 0.24, tail: 'thin', mane: 1 },
  ox: { L: 1.9, H: 1.45, B: 0.42, neck: 0.42, na: 12, head: 0.5, ha: -62, leg: 0.08, mats: ['hide_tan', 'hide_brown', 'hide_white', 'hide_black'], horns: 0.32, tail: 'thin', dewlap: 1 },
  buffalo: { L: 1.9, H: 1.4, B: 0.45, neck: 0.38, na: 8, head: 0.52, ha: -45, leg: 0.085, mats: ['hide_black', 'hide_grey'], horns: 0.6, sweep: 1, tail: 'thin' },
  zebu: { L: 1.6, H: 1.35, B: 0.35, neck: 0.38, na: 15, head: 0.45, ha: -60, leg: 0.065, mats: ['hide_white', 'hide_grey'], horns: 0.28, hump: 0.28, tail: 'thin', dewlap: 1 },
  camel: { L: 1.6, H: 1.95, B: 0.36, neck: 1.05, na: 30, head: 0.5, ha: -15, leg: 0.065, mats: ['hide_tan'], hump: 0.45, ears: 0.06, tail: 'thin', bend: 1 },
  llama: { L: 1.0, H: 1.1, B: 0.25, neck: 0.75, na: 78, head: 0.3, ha: -25, leg: 0.045, mats: ['hide_white', 'hide_tan', 'hide_brown'], ears: 0.14, tail: 'stub' },
  goat: { L: 0.85, H: 0.72, B: 0.17, neck: 0.3, na: 50, head: 0.28, ha: -50, leg: 0.03, mats: ['hide_white', 'hide_black', 'hide_brown'], horns: 0.18, ears: 0.08, tail: 'stub' },
  sheep: { L: 0.95, H: 0.72, B: 0.26, neck: 0.22, na: 30, head: 0.27, ha: -55, leg: 0.032, mats: ['hide_white', 'cloth_white'], ears: 0.06, tail: 'stub' },
  pig: { L: 1.05, H: 0.68, B: 0.27, neck: 0.12, na: 0, head: 0.34, ha: -15, leg: 0.045, mats: ['hide_black', 'hide_tan'], ears: 0.08, tail: 'stub' },
  dog: { L: 0.72, H: 0.55, B: 0.13, neck: 0.24, na: 50, head: 0.24, ha: -15, leg: 0.03, mats: ['hide_tan', 'hide_brown', 'hide_black'], ears: 0.08, tail: 'up' },
};
/** A tapered limb along +y turned to point along a direction (angle `deg` above level, toward −z), its base at (x, y, z). */
function limb(profile, deg, x, y, z) { const g = lathe(profile, 10); g.rotateX(-(Math.PI / 2 - deg * Math.PI / 180)); g.translate(x, y, z); return g; }
/** animal: { kind, mat } — a still figure of a beast, head toward −z: body, legs, neck, head, ears, horns, hump, tail. */
function animal(el, { bag, col }) {
  const put = placer(el, bag), rand = rng(el.seed), K = BEASTS[el.kind] ?? BEASTS.goat, m = el.mat ?? K.mats[Math.floor(rand() * K.mats.length)];
  const a = K.L / 2, B = K.B, by = K.H - B * 1.1;                       // body centre
  const bod = lathe([[0.001, -a], [B * 0.55, -a * 0.94], [B * 0.92, -a * 0.7], [B, -a * 0.3], [B, a * 0.35], [B * 0.88, a * 0.72], [B * 0.5, a * 0.95], [0.001, a]], 14);
  bod.rotateX(Math.PI / 2); bod.scale(0.86, 1.1, 1); put(m, at(bod, 0, by, 0));
  // the legs: a thick upper leg out of the body, a thin lower leg, a hoof or paw
  const knee = by * 0.48;
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    const x = sx * B * 0.5, z = sz * a * 0.7, front = sz < 0;
    put(m, at(lz([[K.leg * 1.25, 0], [K.leg * (front ? 1.7 : 2.3), (by - knee) * 0.6], [K.leg * (front ? 2.2 : 3), by - knee + B * 0.3], [0.001, by - knee + B * 0.3]], 8), x, knee, z));
    put(m, at(lz([[K.leg * 1.15, 0], [K.leg * 0.95, knee * 0.5], [K.leg * 1.2, knee + 0.02], [0.001, knee + 0.02]], 8), x, 0, z));
    put(K.L > 1.4 ? 'hide_black' : m, at(lz([[K.leg * 1.35, 0], [K.leg * 1.2, 0.07], [0.001, 0.07]], 8), x, 0, z));
  }
  // the neck from the shoulders, the head at its end
  const nx = 0, ny = by + B * 0.35, nz = -a * 0.78, na = K.na, nl = K.neck;
  if (K.bend) {                                                        // the camel's neck: down, then up to the head
    put(m, limb([[B * 0.55, 0], [B * 0.38, nl * 0.55], [0.001, nl * 0.55]], -20, nx, ny, nz));
    const mx = nz - Math.cos(20 * Math.PI / 180) * nl * 0.55, my = ny - Math.sin(20 * Math.PI / 180) * nl * 0.55;
    put(m, limb([[B * 0.38, 0], [B * 0.3, nl * 0.6], [0.001, nl * 0.6]], 70, nx, my, mx));
    var hx = nx, hy = my + Math.sin(70 * Math.PI / 180) * nl * 0.6, hz = mx - Math.cos(70 * Math.PI / 180) * nl * 0.6;
  } else {
    if (nl > 0.15) put(m, limb([[B * 0.62, 0], [B * 0.42, nl * 0.7], [B * 0.34, nl], [0.001, nl]], na, nx, ny, nz));
    var hx = nx, hy = ny + Math.sin(na * Math.PI / 180) * nl, hz = nz - Math.cos(na * Math.PI / 180) * nl;
  }
  const hl = K.head, hr = B * (K.L > 1.4 ? 0.38 : 0.45);
  put(m, limb([[hr * 0.95, 0], [hr, hl * 0.25], [hr * 0.75, hl * 0.7], [hr * 0.6, hl * 0.95], [0.001, hl]], K.ha, hx, hy, hz));
  if (K.mane) put('hide_black', limb([[0.03, 0], [0.03, nl * 0.95], [0.001, nl * 0.95]], na, nx, ny + B * 0.42, nz + 0.02));
  if (K.dewlap) put(m, limb([[B * 0.3, 0], [B * 0.15, nl * 0.8], [0.001, nl * 0.8]], na - 25, nx, ny - B * 0.5, nz));
  if (K.ears) for (const s of [-1, 1]) put(m, at(lz([[0.025 + K.ears * 0.12, 0], [0.001, K.ears]], 5).rotateZ(-s * 0.35).rotateX(0.35), hx + s * hr * 0.55, hy + hr * 0.5, hz + 0.02));
  if (K.horns) for (const s of [-1, 1]) { const g = lz([[0.03 + K.horns * 0.05, 0], [0.001, K.horns]], 6); if (K.sweep) { g.rotateZ(-s * 1.45); g.rotateX(0.35); } else { g.rotateZ(-s * 0.9); g.rotateX(-0.2); } put('glaze_white', at(g, hx + s * hr * 0.5, hy + hr * 0.45, hz + 0.03)); }
  if (K.hump) put(m, at(lz([[B * 0.75, 0], [B * 0.55, K.hump * 0.6], [B * 0.25, K.hump * 0.95], [0.001, K.hump]], 10).scale(0.8, 1, 1.15), 0, by + B * 0.8, el.kind === 'zebu' ? -a * 0.55 : 0));
  // the tail
  const tz = a * 0.95, ty = by + B * 0.55;
  if (K.tail === 'hair') { const g = lz([[0.07, 0], [0.09, 0.4], [0.03, 0.85], [0.001, 0.9]], 6); g.rotateX(Math.PI - 0.25); put('hide_black', at(g, 0, ty, tz)); }
  else if (K.tail === 'thin') { const g = lz([[0.03, 0], [0.02, K.H * 0.5], [0.06, K.H * 0.55], [0.001, K.H * 0.62]], 5); g.rotateX(Math.PI - 0.12); put(m, at(g, 0, ty, tz)); }
  else if (K.tail === 'up') { const g = lz([[0.025, 0], [0.001, 0.3]], 5); g.rotateX(0.7); put(m, at(g, 0, ty, tz)); }
  else put(m, at(lz([[0.04, 0], [0.001, 0.1]], 5).rotateX(2), 0, ty, tz));
  const [x, z] = el.at, y = el.y ?? 0;
  if (K.L > 0.9) col.circle(x, z, a * 0.75, y, y + K.H);
}
/** chickens: { n } — a few hens pecking. */
function chickens(el, { bag }) {
  const put = placer(el, bag), rand = rng(el.seed), n = el.n ?? 4;
  for (let i = 0; i < n; i++) {
    const x = (rand() - 0.5) * 1.6, z = (rand() - 0.5) * 1.6, m = ['hide_white', 'hide_brown', 'hide_tan', 'hide_black'][Math.floor(rand() * 4)], a = rand() * 6.28;
    const g = body(0.15, 0.1, 8); g.rotateY(a); put(m, at(g, x, 0.18, z));
    const h = lz([[0.05, 0], [0.04, 0.08], [0.001, 0.1]], 6); put(m, at(h, x - Math.sin(a) * 0.14, 0.22, z - Math.cos(a) * 0.14));
    put('cloth_red', at(box(-0.01, 0, -0.02, 0.01, 0.035, 0.02), x - Math.sin(a) * 0.14, 0.31, z - Math.cos(a) * 0.14));
    for (const s of [-1, 1]) put('hide_tan', box(x + s * 0.03 - 0.008, 0, z - 0.008, x + s * 0.03 + 0.008, 0.1, z + 0.008));
  }
}

// ---- figures -----------------------------------------------------------------------------------
/** figure: { dress ('robe' | 'tunic' | 'trousers' | 'wrap'), cloth, cloth2, skin, hat ('none' | 'cap' | 'turban' | 'straw' | 'veil' | 'brim'), h (height), carry ('none' | 'pot' | 'basket' | 'pole') } — a still figure standing in its place. */
function figure(el, { bag, col }) {
  const put = placer(el, bag), rand = rng(el.seed), H = el.h ?? 1.6 + rand() * 0.15, k = H / 1.65, c1 = el.cloth ?? 'cloth_white', c2 = el.cloth2 ?? c1, sk = el.skin ?? 'skin_medium', dress = el.dress ?? 'robe';
  if (dress === 'robe' || dress === 'wrap') put(c1, lz([[0.24 * k, 0], [0.22 * k, 0.5 * k], [0.18 * k, 1.0 * k], [0.2 * k, 1.3 * k], [0.12 * k, 1.42 * k], [0.001, 1.42 * k]], 12));
  else {
    for (const s of [-1, 1]) put(dress === 'trousers' ? c2 : sk, at(lz([[0.07 * k, 0], [0.075 * k, 0.8 * k], [0.001, 0.8 * k]], 6), s * 0.09 * k, 0, 0));
    put(c1, at(lz([[0.22 * k, 0], [0.19 * k, 0.25 * k], [0.18 * k, 0.55 * k], [0.21 * k, 0.65 * k], [0.12 * k, 0.72 * k], [0.001, 0.72 * k]], 12), 0, dress === 'tunic' ? 0.55 * k : 0.72 * k, 0));
  }
  // arms hanging, hands; the neck and head
  for (const s of [-1, 1]) { const g = lz([[0.055 * k, 0], [0.045 * k, 0.6 * k], [0.001, 0.6 * k]], 6); g.rotateX(Math.PI); g.rotateZ(s * 0.12); put(c1, at(g, s * 0.22 * k, 1.36 * k, 0)); put(sk, at(lz([[0.04 * k, 0], [0.045 * k, 0.06 * k], [0.001, 0.1 * k]], 6), s * 0.29 * k, 0.68 * k, 0)); }
  put(sk, at(lz([[0.05 * k, 0], [0.05 * k, 0.1 * k], [0.001, 0.1 * k]], 6), 0, 1.4 * k, 0));
  put(sk, at(lz([[0.001, 0], [0.075 * k, 0.04 * k], [0.095 * k, 0.12 * k], [0.085 * k, 0.2 * k], [0.04 * k, 0.25 * k], [0.001, 0.26 * k]], 10), 0, 1.47 * k, 0));
  const hat = el.hat ?? 'none', hy = 1.47 * k + 0.17 * k;
  if (hat === 'cap') put(el.hatMat ?? c2, at(lz([[0.1 * k, 0], [0.09 * k, 0.08 * k], [0.001, 0.1 * k]], 10), 0, hy, 0));
  else if (hat === 'turban') put(el.hatMat ?? 'cloth_white', at(lz([[0.11 * k, 0], [0.12 * k, 0.08 * k], [0.08 * k, 0.15 * k], [0.001, 0.16 * k]], 10), 0, hy - 0.02, 0));
  else if (hat === 'straw') put('thatch', at(lz([[0.3 * k, 0], [0.06 * k, 0.15 * k], [0.001, 0.18 * k]], 12), 0, hy - 0.02, 0));
  else if (hat === 'brim') { put(el.hatMat ?? 'cloth_black', at(lz([[0.17 * k, 0], [0.17 * k, 0.015], [0.1 * k, 0.02], [0.09 * k, 0.13 * k], [0.001, 0.13 * k]], 12), 0, hy - 0.02, 0)); }
  else if (hat === 'veil') put(el.hatMat ?? c1, at(lz([[0.14 * k, -0.25 * k], [0.12 * k, 0], [0.11 * k, 0.1 * k], [0.001, 0.16 * k]], 10), 0, hy - 0.05, 0.01));
  else put('hair_dark', at(lz([[0.09 * k, 0], [0.07 * k, 0.07 * k], [0.001, 0.1 * k]], 10), 0, hy - 0.06, 0.01));
  const carry = el.carry ?? 'none';
  if (carry === 'pot') put('terracotta', at(lz(POTS.water_pot.p.map(([r, y]) => [r * 0.7, y * 0.7])), 0, 1.73 * k, 0));
  else if (carry === 'basket') put('wicker', at(lz([[0.18, 0], [0.24, 0.18], [0.001, 0.18]], 10), 0, 1.73 * k, 0));
  else if (carry === 'pole') { put('bamboo_culm', at(lying(0.025, 1.8, 6), 0, 1.38 * k, 0)); for (const s of [-1, 1]) { put('timber', box(s * 0.85 - 0.004, 0.45 * k, -0.004, s * 0.85 + 0.004, 1.38 * k, 0.004)); put('wicker', at(lz([[0.17, 0], [0.22, 0.25], [0.001, 0.25]], 10), s * 0.85, 0.3 * k, 0)); } }
  const [x, z] = el.at, y = el.y ?? 0;
  col.circle(x, z, 0.25, y, y + H);
}

// ---- boats -----------------------------------------------------------------------------------
/** boat: { kind ('rowboat' | 'canoe' | 'sampan' | 'gondola' | 'dhow' | 'barge' | 'reed'), len } — a hull (both faces), thwarts, an awning, a mast and sail. Sits with its sheer just above y. */
function boat(el, { bag }) {
  const put = placer(el, bag), kind = el.kind ?? 'rowboat', K = {
    rowboat: { L: 4.5, B: 1.5, D: 0.6, m: 'timber', sheer: 0.25, flat: 0.3 }, canoe: { L: 6, B: 0.8, D: 0.45, m: 'wood_dark', sheer: 0.35, flat: 0 },
    sampan: { L: 7, B: 1.8, D: 0.6, m: 'timber', sheer: 0.4, flat: 0.5, awning: 'reed_mat' }, gondola: { L: 10.8, B: 1.4, D: 0.55, m: 'lacquer_black', sheer: 0.9, flat: 0.3 },
    dhow: { L: 13, B: 3.6, D: 1.6, m: 'timber', sheer: 0.8, flat: 0.2, mast: 9, sail: 'cloth_white' }, barge: { L: 12, B: 3, D: 1, m: 'timber', sheer: 0.2, flat: 0.8, awning: 'thatch' },
    reed: { L: 4, B: 0.9, D: 0.4, m: 'reed_mat', sheer: 0.6, flat: 0 }, ferry: { L: 22, B: 6, D: 1.6, m: 'plaster_white', sheer: 0.4, flat: 0.8, cabin: 'cloth_ochre' },
  }[kind] ?? {}; const L = el.len ?? K.L, B = K.B * L / K.L, D = K.D, n = 14, m = 6, T = [];
  const P = (i, j) => { const t = i / n, u = j / m, half = Math.pow(Math.sin(Math.PI * t), 0.6) * B / 2, sh = K.sheer * (2 * t - 1) ** 4, s = u * 2 - 1; const flat = K.flat; return [half * s, sh + 0.3 - D * (1 - Math.abs(s) ** (1 + flat * 3)) * Math.pow(Math.sin(Math.PI * t), 0.3), -L / 2 + L * t]; };
  for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) { const a = P(i, j), b = P(i + 1, j), c = P(i + 1, j + 1), d = P(i, j + 1); T.push(...a, ...b, ...c, ...a, ...c, ...b, ...a, ...c, ...d, ...a, ...d, ...c); }
  put(K.m, fromTriangles(T));
  for (let k = 1; k < 4; k++) { const t = k / 4, half = Math.pow(Math.sin(Math.PI * t), 0.6) * B / 2 * 0.92; put('timber', box(-half, 0.2, -L / 2 + L * t - 0.1, half, 0.25, -L / 2 + L * t + 0.1)); }
  if (K.awning) { const g = lathe([[B * 0.42, 0], [B * 0.42, L * 0.3], [0.001, L * 0.3]], 10, (th) => (Math.sin(th) > 0.05 ? 0.001 : 1)); g.rotateX(Math.PI / 2); g.translate(0, 0.3, -L * 0.1); put(K.awning, g); }
  if (K.mast) { put('timber', at(lz([[0.12, 0], [0.08, K.mast], [0.001, K.mast]], 6), 0, 0.2, -L * 0.15)); const S = []; S.push(0, 1.5, -L * 0.45, 0, K.mast + 1, L * 0.05, 0, 1.8, L * 0.25); S.push(0, 1.5, -L * 0.45, 0, 1.8, L * 0.25, 0, K.mast + 1, L * 0.05); put(K.sail, fromTriangles(S)); }
  if (K.cabin) put(K.cabin, box(-B * 0.35, 0.3, -L * 0.3, B * 0.35, 2.6, L * 0.3));
  if (kind === 'gondola') put('steel_chrome', box(-0.02, 0.5, -L / 2 - 0.1, 0.02, 1.4, -L / 2 + 0.3));
}

// ---- the modern street -----------------------------------------------------------------------
/** car: { era (1930 | 1970), mat } */
function car(el, { bag, col }) {
  const put = placer(el, bag), rand = rng(el.seed), old = (el.era ?? 1930) < 1950, m = el.mat ?? (old ? ['car_black', 'car_black', 'car_cream', 'car_blue'] : ['car_red', 'car_blue', 'car_cream', 'car_black', 'hide_tan'])[Math.floor(rand() * 5) % (old ? 4 : 5)];
  const L = old ? 4.4 : 4.6, W = old ? 1.7 : 1.75, r = old ? 0.36 : 0.32;
  if (old) {
    put(m, box(-W / 2 + 0.25, 0.42, -L / 2 + 0.15, W / 2 - 0.25, 1.05, -0.55));                    // the hood
    put('steel_chrome', box(-W / 2 + 0.3, 0.45, -L / 2 + 0.08, W / 2 - 0.3, 1.0, -L / 2 + 0.16));     // the radiator
    put(m, box(-W / 2 + 0.12, 0.42, -0.6, W / 2 - 0.12, 1.15, L / 2 - 0.2));                        // the body
    put(m, box(-W / 2 + 0.16, 1.15, -0.5, W / 2 - 0.16, 1.72, 1.35));                               // the cabin
    put('glass_outer', box(-W / 2 + 0.14, 1.22, -0.45, W / 2 - 0.14, 1.6, 1.25));
    put(m, box(-W / 2 + 0.2, 0.55, 1.35, W / 2 - 0.2, 1.25, L / 2 - 0.05));                          // the boot
    for (const sx of [-1, 1]) {
      put('rubber', box(sx * (W / 2 + 0.02) - 0.08, 0.38, -0.5, sx * (W / 2 + 0.02) + 0.08, 0.42, 1.05));   // the running boards
      for (const zz of [-L / 2 + 0.75, L / 2 - 0.8]) { const g = lathe([[r + 0.12, 0], [r + 0.12, 0.26], [0.001, 0.26]], 12, (th) => (Math.sin(th) < -0.1 ? 0.001 : 1)); g.translate(0, -0.13, 0); g.rotateZ(Math.PI / 2); put(m, at(g, sx * (W / 2 - 0.06), r, zz)); }
      for (const zz of [-L / 2 + 0.75, L / 2 - 0.8]) put('steel_chrome', at(lying(0.12, 0.24, 8), sx * (W / 2 - 0.06), r, zz));
    }
    for (const sx of [-0.55, 0.55]) put('lamp_glass', at(lz([[0.1, 0], [0.12, 0.08], [0.001, 0.16]], 8).rotateX(-Math.PI / 2), sx, 1.0, -L / 2 + 0.2));
  }
  else { put(m, box(-W / 2, 0.35, -L / 2, W / 2, 0.95, L / 2)); put(m, box(-W / 2 + 0.1, 0.95, -0.6, W / 2 - 0.1, 1.35, 1.2)); put('glass_outer', box(-W / 2 + 0.08, 1.0, -0.55, W / 2 - 0.08, 1.3, 1.15)); }
  for (const s of [-1, 1]) for (const zz of [-L / 2 + 0.75, L / 2 - 0.8]) put('rubber', at(lying(r, 0.22, 12), s * (W / 2 - 0.08), r, zz));
  put('steel_chrome', box(-W / 2 + 0.1, 0.3, -L / 2 - 0.05, W / 2 - 0.1, 0.42, -L / 2 + 0.02));
  const [x, z] = el.at, y = el.y ?? 0; col.circle(x, z, 1.2, y, y + 1.5);
}
function streetLamp(el, { bag }) {
  const put = placer(el, bag), h = el.h ?? 4.5;
  put('iron', lz([[0.12, 0], [0.1, 0.4], [0.06, 0.5], [0.05, h], [0.001, h]], 8));
  put('lamp_glass', at(lz([[0.12, 0], [0.2, 0.35], [0.18, 0.5], [0.001, 0.55]], 8), 0, h, 0));
  put('iron', at(lz([[0.2, 0], [0.001, 0.15]], 8), 0, h + 0.55, 0));
}

/** lantern: { kind ('paper' | 'white' | 'iron' | 'oil'), h } — a lantern on its post or bracket, lit at night. */
function lantern(el, { bag }) {
  const put = placer(el, bag), kind = el.kind ?? 'iron', h = el.h ?? 2.2;
  put('timber', box(-0.05, 0, -0.05, 0.05, h + 0.3, 0.05));
  put('timber', box(-0.03, h + 0.25, -0.03, 0.03, h + 0.31, 0.45));
  if (kind === 'paper' || kind === 'white') { put(kind === 'paper' ? 'lamp_paper' : 'lamp_white', at(lz([[0.08, 0], [0.17, 0.08], [0.18, 0.25], [0.16, 0.38], [0.08, 0.45], [0.001, 0.45]], 12), 0, h - 0.25, 0.42)); put('lacquer_black', at(lz([[0.09, 0], [0.09, 0.04], [0.001, 0.04]], 10), 0, h + 0.2, 0.42)); }
  else if (kind === 'oil') { put('terracotta', at(lz([[0.05, 0], [0.09, 0.04], [0.07, 0.07], [0.001, 0.07]], 10), 0, h - 0.05, 0.42)); put('lamp_white', at(lz([[0.02, 0], [0.001, 0.07]], 6), 0.06, h + 0.02, 0.42)); }
  else { put('iron', box(-0.13, h - 0.25, 0.29, 0.13, h - 0.22, 0.55)); put('lamp_glass', box(-0.1, h - 0.22, 0.32, 0.1, h + 0.08, 0.52)); put('iron', at(lz([[0.17, 0], [0.001, 0.15]], 4), 0, h + 0.08, 0.42)); }
}
registerStyle('life', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { pot, basket, sacks, barrel, crates, firewood, bench, trough, well, stall, cart, barrow, ladder, laundry, haystack, animal, chickens, figure, boat, car, street_lamp: streetLamp, lantern },
  objects: {},
});
export const LIFE_KINDS = ['pot', 'basket', 'sacks', 'barrel', 'crates', 'firewood', 'bench', 'trough', 'well', 'stall', 'cart', 'barrow', 'ladder', 'laundry', 'haystack', 'animal', 'chickens', 'figure', 'boat', 'car', 'street_lamp', 'lantern'];
