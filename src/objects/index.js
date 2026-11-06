// The shared library of objects of use and of life (DESIGN §5, §9): pots, baskets, sacks, barrels,
// crates, firewood, benches, market stalls, carts and barrows, ladders, laundry, troughs, wells;
// animals and still figures; boats; for the modern settlements cars, lamps and benches. Generated
// geometry, parameterised by kind and material, registered as the style `life`. Every builder
// takes { at: [x, z], y, rot (radians about +y), s (scale), seed, … } in its plan's coordinates.

import { registerStyle } from '../core/build.js';
import { box, lathe, fromTriangles } from '../core/geom.js';

import { rng, placer, assembly, tube, slathe, folded } from './kit.js';
import { Matrix4 } from '../core/three.js';
import { figure } from './figures.js';
import { animal, BEASTS } from './animals.js';
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
  for (let i = 0; i < n; i++) { const a = rand() * 6.28, r = i ? 0.35 + rand() * 0.35 : 0, k = 0.75 + Math.floor(rand() * 4) * 0.115; const g = lz(P.p.map(([pr, py]) => [pr * k, py * k])); put(P.m, at(g, Math.cos(a) * r, 0, Math.sin(a) * r)); }
}
function basket(el, { bag }) {
  const put = placer(el, bag), rand = rng(el.seed), n = el.n ?? 1;
  for (let i = 0; i < n; i++) {
    const q = Math.floor(rand() * 4), r = 0.22 + q * 0.06, h = 0.2 + ((q * 3 + 1) % 4) * 0.083, a = rand() * 6.28, d = i ? 0.45 + rand() * 0.2 : 0, x = Math.cos(a) * d, z = Math.sin(a) * d;
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
  // the stack is one of two of each length (its logs uneven within it), so that stacks share their shape
  const put = placer(el, bag), L = Math.round((el.len ?? 1.6) * 4) / 4, v = (el.seed ?? 1) % 2;
  const A = assembly(`firewood|${L}|${v}`, (a) => { const rand = rng(17 + v * 31); for (let row = 0; row < 4; row++) for (let k = 0; k < 6 - row; k++) { const g = lying(0.07 + rand() * 0.03, L * (0.85 + rand() * 0.2), 6); g.rotateY(Math.PI / 2); a('w', at(g, (rand() - 0.5) * 0.08, 0.07 + row * 0.13, (k - (5 - row) / 2) * 0.15 + (rand() - 0.5) * 0.03)); } });
  put('bark_pine', A.w.clone());
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
/** A thin cloth sheet over a grid (both faces): f(u, v) → [x, y, z], u, v in 0..1; `keep(i, j)` picks the cells (stripes). */
function sheet(f, nu, nv, keep = null, th = 0.008) {
  const T = [];
  for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) {
    if (keep && !keep(i, j)) continue;
    const a = f(i / nu, j / nv), b = f((i + 1) / nu, j / nv), c = f((i + 1) / nu, (j + 1) / nv), d = f(i / nu, (j + 1) / nv);
    const up = (p) => [p[0], p[1] + th, p[2]];
    T.push(...up(a), ...up(c), ...up(b), ...up(a), ...up(d), ...up(c));      // the upper face
    T.push(...a, ...b, ...c, ...a, ...c, ...d);                               // the lower face
  }
  return T.length ? fromTriangles(T) : null;
}
/**
 * stall: { awning (cloth material), stripe (a second cloth, or none), goods: [pot kinds or 'basket' | 'cloth' |
 * 'produce'], w, d } — a trestle table under a cloth awning on four poles, the awning sloping down
 * toward the buyers in front (+z) and ending in a scalloped valance, the seller's side behind (−z).
 */
function stall(el, { bag, col }) {
  const put = placer(el, bag), rand = rng(el.seed), W = el.w ?? 2.6, D = el.d ?? 1.4, aw = el.awning ?? 'cloth_white';
  const zb = -D / 2 - 0.25, zf = D / 2 + 0.75, yb = 2.45, yf = 2.08, ov = 0.18;
  const frame = assembly(`stall-frame|${W}|${D}`, (a) => {
    // the poles, with the cross bars that carry the awning, and the table on its trestles
    for (const [px, pz, h] of [[-W / 2, zb, yb], [W / 2, zb, yb], [-W / 2, zf, yf], [W / 2, zf, yf]]) a('timber', box(px - 0.045, 0, pz - 0.045, px + 0.045, h + 0.06, pz + 0.045));
    a('timber', box(-W / 2 - 0.1, yb - 0.06, zb - 0.03, W / 2 + 0.1, yb, zb + 0.03));
    a('timber', box(-W / 2 - 0.1, yf - 0.06, zf - 0.03, W / 2 + 0.1, yf, zf + 0.03));
    for (const sx of [-1, 1]) { const g = box(-0.025, -0.025, 0, 0.025, 0.025, Math.hypot(zf - zb, yb - yf)); g.rotateX(Math.atan2(yb - yf, zf - zb)); g.translate(sx * W / 2, yb - 0.03, zb); a('timber', g); }
    a('timber', box(-W / 2 + 0.05, 0.74, -D / 2 + 0.02, W / 2 - 0.05, 0.79, D / 2 - 0.02));
    for (const xx of [-W / 2 + 0.25, W / 2 - 0.25]) for (const s of [-1, 1]) { const g = box(-0.03, 0, -0.03, 0.03, 0.78, 0.03); g.rotateX(s * 0.32); g.translate(xx, 0, s * D * 0.32); a('timber', g); }
    for (const xx of [-W / 2 + 0.25, W / 2 - 0.25]) a('timber', box(xx - 0.035, 0.68, -D / 2 + 0.06, xx + 0.035, 0.74, D / 2 - 0.06));
  });
  put('timber', frame.timber.clone());
  // the awning: sagging between the bars, a scalloped valance along the front; plain or striped
  const stripe = el.stripe ?? (rand() < 0.4 ? ['cloth_white', 'cloth_ochre', 'cloth_red', 'cloth_indigo'].find((c) => c !== aw) : null);
  const f = (u, v) => { const x = -W / 2 - ov + (W + 2 * ov) * u, z = zb - 0.06 + (zf - zb + 0.12) * v; return [x, yb + 0.005 + (yf - yb) * v - 0.1 * Math.sin(Math.PI * v) * (0.4 + 0.6 * Math.sin(Math.PI * u)), z]; };
  const val = (u, v) => { const x = -W / 2 - ov + (W + 2 * ov) * u, sc = Math.abs(Math.sin(u * Math.PI * 7)); return [x, yf + 0.005 - v * (0.2 + 0.08 * sc), zf + 0.065]; };
  const A = assembly(`stall-awning|${W}|${D}|${stripe ? 's' : ''}`, (a) => {
    const keepA = stripe ? (i) => i % 2 === 0 : null, keepB = (i) => i % 2 === 1;
    a('a', sheet(f, 14, 6, keepA)); a('a', sheet((u, v) => { const p = val(u, v); return [p[0], p[1], p[2]]; }, 14, 1, keepA, 0));
    if (stripe) { a('b', sheet(f, 14, 6, keepB)); a('b', sheet(val, 14, 1, keepB, 0)); }
  });
  put(aw, A.a.clone());
  if (A.b) put(stripe, A.b.clone());
  // the cloth on the table, hanging down in front
  const tc = ['cloth_white', 'cloth_indigo', 'cloth_red', 'sacking', 'cloth_green'][Math.floor(rand() * 5)];
  const C = assembly(`stall-cloth|${W}|${D}`, (a) => { a('c', box(-W / 2, 0.79, -D / 2, W / 2, 0.805, D / 2 + 0.02)); a('c', box(-W / 2, 0.52, D / 2 + 0.02, W / 2, 0.805, D / 2 + 0.035)); });
  put(tc, C.c.clone());
  const goods = el.goods ?? ['basket', 'produce', 'cloth'];
  // stores behind the table, on the seller's side, and a basket or two beside it
  for (let i = 0; i < 3; i++) { const x = -W / 2 + 0.35 + rand() * (W - 0.7); put(rand() < 0.5 ? 'wicker' : 'sacking', at(lz([[0.2, 0], [0.24, 0.25], [0.18, 0.4], [0.001, 0.42]], 8), x, 0, -D / 2 - 0.25 - rand() * 0.25)); }
  for (let i = 0; i < 7; i++) {
    const kind = goods[Math.floor(rand() * goods.length)], x = -W / 2 + 0.3 + (i % 4) * (W - 0.6) / 3 + (i >= 4 ? (W - 0.6) / 6 : 0), z = (i >= 4 ? -0.25 : 0.3) + (rand() - 0.5) * 0.1;
    if (x > W / 2 - 0.2) continue;
    if (kind === 'cloth') for (let k = 0; k < 3; k++) put(['cloth_red', 'cloth_indigo', 'cloth_ochre', 'cloth_white', 'cloth_green'][Math.floor(rand() * 5)], at(lying(0.08, 0.6, 8), x, 0.885 + k * 0.155, z));
    else if (kind === 'produce') { put('wicker', at(lz([[0.22, 0], [0.26, 0.12], [0.001, 0.12]], 10), x, 0.805, z)); const pm = ['cloth_green', 'cloth_red', 'cloth_ochre', 'glaze_yellow'][Math.floor(rand() * 4)]; for (let q = 0; q < 5; q++) { const a = q * 1.26, r2 = q ? 0.11 : 0; put(pm, at(ball(0.06, 6), x + Math.cos(a) * r2, 0.87 + (q ? 0 : 0.07), z + Math.sin(a) * r2)); } }
    else if (kind === 'basket') { put('wicker', at(lz([[0.16, 0], [0.22, 0.2], [0.2, 0.2], [0.14, 0.03], [0.001, 0.03]], 10), x, 0.805, z)); put(['cloth_ochre', 'hide_tan', 'cloth_brown', 'cloth_white'][Math.floor(rand() * 4)], at(lz([[0.2, 0], [0.13, 0.07], [0.001, 0.1]], 8), x, 0.985, z)); }
    else { const P = POTS[kind] ?? POTS.water_pot; put(P.m, at(lz(P.p.map(([r, h]) => [r * 0.6, h * 0.6])), x, 0.805, z)); }
  }
  const [x, z] = el.at, y = el.y ?? 0;
  col.circle(x, z, Math.min(W, D) / 2 + 0.2, y, y + 0.8);
}
/** A spoked wheel in the x = 0 plane, radius r: felloes, a turned nave, round spokes (the old flat one for the barrow). */
function wheel(r, w = 0.08, spokes = 8) {
  const parts = [];
  const rim = lathe([[r, 0], [r, w], [r - 0.06, w], [r - 0.06, 0], [r, 0]], 20); rim.translate(0, -w / 2, 0); rim.rotateZ(Math.PI / 2); parts.push(rim);
  const hub = lying(0.08, w + 0.12, 8); parts.push(hub);
  for (let k = 0; k < spokes; k++) { const g = box(-0.02, 0, -0.025, 0.02, r - 0.05, 0.025); g.rotateX(k / spokes * Math.PI * 2); parts.push(g); }
  return parts;
}
function cartWheel(a, r, spokes) {
  const w = 0.075, fr = r - 0.075, n = 24;
  // the rim of felloes: a ring of square section, slightly faceted where the felloes meet
  a('timber', tube(Array.from({ length: n + 1 }, (_, k) => { const t = k / n * Math.PI * 2, rr = r - 0.035 - (k % (n / spokes * 2) === 0 ? 0.004 : 0); return [0, Math.cos(t) * rr, Math.sin(t) * rr, w / 2, 0.038]; }), 4, { capA: false, capB: false }));
  // the nave, turned and bulging, through which the axle runs
  a('timber', slathe([[0.001, -0.17], [0.06, -0.17], [0.085, -0.12], [0.11, -0.04], [0.11, 0.04], [0.085, 0.12], [0.06, 0.17], [0.001, 0.17]], 12).rotateZ(Math.PI / 2));
  for (let k = 0; k < spokes; k++) { const t = (k + 0.5) / spokes * Math.PI * 2; a('timber', tube([[k % 2 ? 0.02 : -0.02, Math.cos(t) * 0.09, Math.sin(t) * 0.09, 0.024, 0.02], [0, Math.cos(t) * fr * 0.55, Math.sin(t) * fr * 0.55, 0.021, 0.018], [0, Math.cos(t) * (fr + 0.01), Math.sin(t) * (fr + 0.01), 0.018, 0.016]], 5, { capA: false })); }
  a('iron', tube(Array.from({ length: n + 1 }, (_, k) => { const t = k / n * Math.PI * 2; return [0, Math.cos(t) * (r + 0.004), Math.sin(t) * (r + 0.004), w / 2 + 0.004, 0.008]; }), 4, { capA: false, capB: false }));
}
/**
 * cart: { kind ('two' | 'four'), load ('sacks' | 'barrels' | 'hay' | 'empty'), beast (a kind of animal for a
 * two-wheeled cart: harnessed in its shafts) } — a cart of plank floor and staked sides on its frame,
 * the shafts running on from the frame to the front (−z). Unharnessed, a two-wheeled cart tips forward
 * on its shaft ends; a four-wheeled wagon rests level, its pole on the ground.
 */
function cart(el, { bag, col }) {
  const rand = rng(el.seed), four = el.kind === 'four', L = four ? 3 : 2.2, W = 1.25, r = four ? 0.5 : 0.65, yb = r + 0.12, beast = !four ? el.beast : null;
  const load = el.load ?? ['sacks', 'barrels', 'hay', 'empty'][Math.floor(rand() * 4)];
  const axles = four ? [-L / 2 + 0.55, L / 2 - 0.55] : [0.1];
  // the tilt: a two-wheeled cart unharnessed rests on its shaft ends (turned about its axle); harnessed, its shafts rise to the beast's sides
  const tipZ = -L / 2 - 1.75, Bk = beast ? BEASTS[beast] : null, sideY = Bk ? Bk.H * 0.6 : 0.06;
  const tiltM = new Matrix4().makeTranslation(0, r, axles[0]).multiply(new Matrix4().makeRotationX(Bk ? Math.atan2(sideY - yb, axles[0] - tipZ) : -Math.atan2(yb - sideY, axles[0] - tipZ))).multiply(new Matrix4().makeTranslation(0, -r, -axles[0]));
  const put = placer(el, bag);
  const tf = (a) => (four ? (role, g) => a(role, g) : (role, g) => a(role, g.applyMatrix4(tiltM)));
  const frame = assembly(`cart|${four ? 4 : 2}|${Bk ? beast : ''}`, (a) => {
    const t = tf(a);
    // the frame's two side beams, running on as the shafts (or a pole for the wagon)
    for (const s of [-1, 1]) {
      t('timber', box(s * (W / 2 - 0.06) - 0.05, yb - 0.1, -L / 2, s * (W / 2 - 0.06) + 0.05, yb, L / 2 + 0.1));
      if (!four) t('timber', tube([[s * (W / 2 - 0.06), yb - 0.05, -L / 2 + 0.05, 0.045, 0.05], [s * 0.42, yb - 0.05, -L / 2 - 0.9, 0.04, 0.045], [s * 0.36, yb - 0.04, tipZ, 0.03, 0.035]], 6));
    }
    if (four) { t('timber', tube([[0, r * 0.9, -L / 2 + 0.55, 0.05], [0, 0.28, -L / 2 - 0.9, 0.045], [0, 0.06, -L / 2 - 2.2, 0.035]], 6)); t('timber', box(-0.35, r - 0.04, -L / 2 + 0.5, 0.35, r + 0.04, -L / 2 + 0.6)); }
    // the floor of planks with gaps, the cross bearers under it
    for (let k = 0; k < 6; k++) { const x0 = -W / 2 + k * W / 6; t('timber', box(x0 + 0.008, yb, -L / 2, x0 + W / 6 - 0.008, yb + 0.035, L / 2)); }
    for (let k = 0; k < 3; k++) t('timber', box(-W / 2, yb - 0.17, -L / 2 + 0.2 + k * (L - 0.4) / 2 - 0.04, W / 2, yb - 0.1, -L / 2 + 0.2 + k * (L - 0.4) / 2 + 0.04));
    // the staked sides: stakes in the side beams, a rail along their tops, a lower board; a board across the back
    const n = four ? 6 : 5;
    for (const s of [-1, 1]) {
      for (let k = 0; k < n; k++) { const z = -L / 2 + 0.06 + k * (L - 0.12) / (n - 1); t('timber', box(s * W / 2 - 0.035, yb, z - 0.03, s * W / 2 + 0.035, yb + 0.52, z + 0.03)); }
      t('timber', box(s * W / 2 - 0.04, yb + 0.47, -L / 2 - 0.02, s * W / 2 + 0.04, yb + 0.54, L / 2 + 0.02));
      t('timber', box(s * W / 2 - 0.025, yb + 0.035, -L / 2, s * W / 2 + 0.025, yb + 0.22, L / 2));
    }
    t('timber', box(-W / 2, yb + 0.035, L / 2 - 0.03, W / 2, yb + 0.4, L / 2 + 0.01));
    // the axles under the frame
    for (const az of axles) t('timber', box(-W / 2 - 0.2, r - 0.05, az - 0.05, W / 2 + 0.2, r + 0.05, az + 0.05));
  });
  const cargo = assembly(`cart-load|${four ? 4 : 2}|${Bk ? beast : ''}|${load}`, (a) => {
    const t = tf(a);
    if (load === 'sacks') for (let i = 0; i < (four ? 6 : 4); i++) { const x = (i % 2 - 0.5) * 0.52, z = (Math.floor(i / 2) - (four ? 1 : 0.5)) * 0.62, rr = 0.2; t('sacking', tube([[x, yb + 0.035 + rr * 0.8, z - 0.3, 0.06, 0.05], [x, yb + 0.035 + rr * 0.85, z - 0.24, rr, rr * 0.8], [x, yb + 0.035 + rr * 0.85, z + 0.1, rr * 1.05, rr * 0.85], [x, yb + 0.035 + rr * 0.8, z + 0.24, rr * 0.8, rr * 0.7], [x, yb + 0.035 + rr * 0.8, z + 0.3, 0.05, 0.05]], 8)); }
    else if (load === 'barrels') for (let i = 0; i < (four ? 4 : 2); i++) { const z = (i - ((four ? 4 : 2) - 1) / 2) * 0.68; t('timber', slathe([[0.001, 0], [0.24, 0], [0.28, 0.16], [0.29, 0.31], [0.28, 0.46], [0.24, 0.62], [0.001, 0.62]], 12).translate(0, yb + 0.035, z)); for (const yy of [0.08, 0.54]) t('iron', slathe([[0.272, 0], [0.272, 0.04], [0.001, 0.04]], 12).translate(0, yb + 0.035 + yy, z)); }
    else if (load === 'hay') t('thatch', folded([[W / 2 + 0.05, 0], [W / 2 + 0.1, 0.25], [W / 2, 0.55], [0.35, 0.85], [0.001, 0.92]], 12, 5, 0.06, 3).scale(1, 1, (L + 0.1) / (W + 0.2)).translate(0, yb + 0.035, 0));
  });
  put('timber', frame.timber.clone());
  for (const [role, g] of Object.entries(cargo)) put(role, g.clone());
  const Wh = assembly(`cart-wheel|${r}|${four ? 10 : 12}`, (a) => cartWheel(a, r, four ? 10 : 12));
  for (const az of axles) for (const s of [-1, 1]) {
    const M = new Matrix4().makeTranslation(s * (W / 2 + 0.16), r, az);
    put('timber', Wh.timber.clone().applyMatrix4(M)); put('iron', Wh.iron.clone().applyMatrix4(M));
  }
  // the beast in the shafts, its head forward
  if (Bk) { const oz = -L / 2 - 0.35 - Bk.L / 2, ro = el.rot ?? 0; animal({ t: 'animal', kind: beast, gear: false, graze: false, seed: el.seed + 1, y: el.y, rot: ro, at: [el.at[0] + oz * Math.sin(ro), el.at[1] + oz * Math.cos(ro)] }, { bag, col }); }
  const [x, z] = el.at, y = el.y ?? 0;
  col.circle(x, z, 1.1, y, y + yb + 0.5);
}
/**
 * barrow: the Chinese wheelbarrow — one large wheel in the middle under a slatted arch, a platform on
 * either side of it for the load, two long rails running back into the handles, two legs it rests on.
 */
function barrow(el, { bag }) {
  const put = placer(el, bag), rand = rng(el.seed), r = 0.42;
  const A = assembly('barrow', (a) => {
    const y = r + 0.08;
    for (const s of [-1, 1]) {
      // the rails, from the front over the wheel back to the handles, which the barrowman lifts
      a('timber', tube([[s * 0.27, y + 0.02, -0.62, 0.03], [s * 0.3, y, 0.3, 0.032], [s * 0.3, y + 0.03, 0.75, 0.03], [s * 0.27, y + 0.08, 1.25, 0.022]], 6));
      a('timber', tube([[s * 0.3, y, 0.48, 0.028], [s * 0.3, 0.02, 0.56, 0.026]], 5));                        // a leg
      a('timber', box(s * 0.62 - 0.03, y - 0.02, -0.45, s * 0.62 + 0.03, y + 0.02, 0.45));                       // the platform's outer rail
      for (const z of [-0.4, -0.13, 0.13, 0.4]) a('timber', box(Math.min(s * 0.3, s * 0.62) - 0.01, y + 0.02, z - 0.06, Math.max(s * 0.3, s * 0.62) + 0.01, y + 0.045, z + 0.06));
    }
    for (const z of [-0.6, 0.62]) a('timber', box(-0.3, y - 0.02, z - 0.025, 0.3, y + 0.03, z + 0.025));
    // the arch over the wheel: slats bent over it
    for (let k = 0; k < 6; k++) { const t = Math.PI * (k + 0.5) / 6, g = box(-0.11, -0.012, -0.14, 0.11, 0.012, 0.14); g.rotateX(t - Math.PI / 2); g.translate(0, r + Math.sin(t) * (r + 0.07), -Math.cos(t) * (r + 0.07)); a('timber', g); }
    for (const g of wheel(r, 0.06, 10)) a("timber", at(g, 0, r, 0));
  });
  put('timber', A.timber.clone());
  // the load: a sack or a basket on each platform
  for (const s of [-1, 1]) if (rand() < 0.75) put(rand() < 0.6 ? 'sacking' : 'wicker', at(lz([[0.17, 0], [0.2, 0.18], [0.16, 0.34], [0.001, 0.36]], 8), s * 0.46, r + 0.125, (rand() - 0.5) * 0.3));
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
/** chickens: { n } — a few hens pecking. */
function chickens(el, { bag }) {
  const put = placer(el, bag), rand = rng(el.seed), n = el.n ?? 4;
  for (let i = 0; i < n; i++) {
    const x = (rand() - 0.5) * 1.6, z = (rand() - 0.5) * 1.6, m = ['hide_white', 'hide_brown', 'hide_tan', 'hide_black'][Math.floor(rand() * 4)], a = Math.floor(rand() * 8) * Math.PI / 4;
    const g = body(0.15, 0.1, 8); g.rotateY(a); put(m, at(g, x, 0.18, z));
    const h = lz([[0.05, 0], [0.04, 0.08], [0.001, 0.1]], 6); put(m, at(h, x - Math.sin(a) * 0.14, 0.22, z - Math.cos(a) * 0.14));
    put('cloth_red', at(box(-0.01, 0, -0.02, 0.01, 0.035, 0.02), x - Math.sin(a) * 0.14, 0.31, z - Math.cos(a) * 0.14));
    for (const s of [-1, 1]) put('hide_tan', box(x + s * 0.03 - 0.008, 0, z - 0.008, x + s * 0.03 + 0.008, 0.1, z + 0.008));
  }
}

// ---- figures -----------------------------------------------------------------------------------
/** A limb from a to b (3-D), radius r0 at a, r1 at b. */
function seg(a, b, r0, r1, n = 6) {
  const dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2], L = Math.hypot(dx, dy, dz) || 1e-6;
  const g = lathe([[r0, 0], [r1, L], [0.001, L]], n);
  // turn +y onto the direction a→b
  const ax = Math.atan2(Math.hypot(dx, dz), dy), ay = Math.atan2(dx, dz);
  g.rotateX(ax); g.rotateY(ay); g.translate(a[0], a[1], a[2]);
  return g;
}
const ball = (r, n = 10) => lathe(Array.from({ length: 7 }, (_, i) => { const t = i / 6 * Math.PI; return [Math.max(0.001, Math.sin(t) * r), r - Math.cos(t) * r]; }), n);
// ---- boats -----------------------------------------------------------------------------------
/** boat: { kind ('rowboat' | 'canoe' | 'sampan' | 'gondola' | 'dhow' | 'barge' | 'reed' | 'ferry'), len } — a hull (both
 * faces) with its gunwales, wale, stem and stern posts, thwarts and floor; by kind an awning, oars or paddles,
 * the gondola's ferro and forcola, the dhow's raked mast, yard and lateen sail. Sits with its sheer 0.3 above y. */
const BOATS = {
  rowboat: { L: 4.5, B: 1.5, D: 0.6, m: 'timber', sheer: 0.25, flat: 0.3, thwarts: 3 }, canoe: { L: 6, B: 0.8, D: 0.45, m: 'wood_dark', sheer: 0.35, flat: 0, thwarts: 0 },
  sampan: { L: 7, B: 1.8, D: 0.6, m: 'timber', sheer: 0.4, flat: 0.5, awning: 'reed_mat', thwarts: 2 }, gondola: { L: 10.8, B: 1.4, D: 0.55, m: 'lacquer_black', sheer: 0.9, flat: 0.3, thwarts: 2 },
  dhow: { L: 13, B: 3.6, D: 1.6, m: 'timber', sheer: 0.8, flat: 0.2, mast: 9, sail: 'cloth_white', thwarts: 4 }, barge: { L: 12, B: 3, D: 1, m: 'timber', sheer: 0.2, flat: 0.8, awning: 'thatch', thwarts: 3 },
  reed: { L: 4, B: 0.9, D: 0.4, m: 'reed_mat', sheer: 0.6, flat: 0, thwarts: 0 }, ferry: { L: 22, B: 6, D: 1.6, m: 'plaster_white', sheer: 0.4, flat: 0.8, cabin: 'cloth_ochre', thwarts: 0 },
};
function boatParts(kind, L, a) {
  const K = BOATS[kind], B = K.B * L / K.L, D = K.D, n = 16, m = 6, T = [];
  const P = (i, j) => { const t = i / n, u = j / m, half = Math.pow(Math.sin(Math.PI * t), 0.6) * B / 2, sh = K.sheer * (2 * t - 1) ** 4, s = u * 2 - 1; return [half * s, sh + 0.3 - D * (1 - Math.abs(s) ** (1 + K.flat * 3)) * Math.pow(Math.sin(Math.PI * t), 0.3), -L / 2 + L * t]; };
  for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) { const p = P(i, j), b = P(i + 1, j), c = P(i + 1, j + 1), d = P(i, j + 1); T.push(...p, ...b, ...c, ...p, ...c, ...b, ...p, ...c, ...d, ...p, ...d, ...c); }
  a('hull', fromTriangles(T));
  const wood = kind === 'gondola' ? 'trim' : 'timber', big = L > 9 ? 1.6 : 1;
  // the gunwales along the sheer, a wale below them; the stem and stern posts
  if (kind !== 'reed') for (const j of [0, m]) {
    a(wood, tube(Array.from({ length: n - 1 }, (_, i) => [...P(i + 1, j), 0.03 * big, 0.028 * big]), 5));
    a(wood, tube(Array.from({ length: n - 3 }, (_, i) => { const p = P(i + 2, j), q = P(i + 2, j === 0 ? 1 : m - 1); return [p[0] * 0.75 + q[0] * 0.25 + (j ? 0.012 : -0.012), p[1] * 0.75 + q[1] * 0.25, p[2], 0.022 * big, 0.02 * big]; }), 4));
  }
  for (const [e, f] of [[0, 1], [n, n - 1]]) { const top = P(e, m / 2), k = P(f, m / 2); a(wood, tube([[k[0], k[1] + 0.02, k[2], 0.03 * big], [0, top[1], top[2], 0.035 * big], [0, top[1] + 0.07, top[2] * 1.004, 0.03 * big]], 5)); }
  // a reed boat: its bundles bound round at intervals
  if (kind === 'reed') for (let i = 2; i < n - 1; i += 2) a('cloth', tube(Array.from({ length: m + 1 }, (_, j) => { const p = P(i, j); return [p[0] * 1.02, p[1] - 0.01, p[2], 0.012, 0.025]; }), 4, { capA: false, capB: false }));
  // the thwarts, the floor boards
  for (let k = 1; k <= K.thwarts; k++) { const t = k / (K.thwarts + 1), half = Math.pow(Math.sin(Math.PI * t), 0.6) * B / 2 * 0.94; a('timber', box(-half, 0.2, -L / 2 + L * t - 0.11, half, 0.25, -L / 2 + L * t + 0.11)); }
  if (K.flat > 0.25 && kind !== 'ferry') { const fy = 0.3 - D + D * 0.18, fw = B * 0.3; a('timber', box(-fw, fy, -L * 0.33, fw, fy + 0.03, L * 0.33)); }
  if (K.awning) { const g = slathe([[0.001, 0], [B * 0.42, 0], [B * 0.42, L * 0.3], [0.001, L * 0.3]], 12, (th) => (Math.sin(th) > 0.05 ? 0.001 : 1)); g.rotateX(Math.PI / 2); g.translate(0, 0.3, -L * 0.1); a('awning', g);
    for (const z of [-L * 0.1, L * 0.05, L * 0.2]) a('timber', tube(Array.from({ length: 9 }, (_, k) => { const th = Math.PI * k / 8; return [Math.cos(th) * B * 0.43, 0.3 + Math.sin(th) * B * 0.43, z, 0.025]; }), 4)); }
  // oars, paddles
  if (kind === 'rowboat') for (const s of [-1, 1]) { a('timber', tube([[s * 0.32, 0.29, -L * 0.36, 0.022], [s * 0.3, 0.3, L * 0.18, 0.026]], 5)); a('timber', box(s * 0.3 - 0.07, 0.28, L * 0.18, s * 0.3 + 0.07, 0.3, L * 0.32)); for (const z of [-0.05, 0.08]) a('timber', box(s * B * 0.47 - 0.015, 0.3, z - 0.015, s * B * 0.47 + 0.015, 0.42, z + 0.015)); }
  if (kind === 'canoe') { a('timber', tube([[0.12, 0.05, -1.2, 0.02], [0.08, 0.06, 0.2, 0.02]], 5)); a('timber', slathe([[0.001, 0], [0.08, 0.06], [0.08, 0.35], [0.001, 0.45]], 6).scale(1, 1, 0.2).rotateX(Math.PI / 2).translate(0.08, 0.06, 0.2)); }
  // the gondola: the ferro at the bow (its six teeth forward, the comb above), the forcola and the oar at the stern
  if (kind === 'gondola') {
    const bow = P(0, m / 2), zb = bow[2], yb = bow[1];
    a('ferro', box(-0.015, yb - 0.25, zb - 0.12, 0.015, yb + 0.55, zb + 0.08));
    a('ferro', box(-0.015, yb + 0.45, zb - 0.32, 0.015, yb + 0.62, zb + 0.08));
    for (let k = 0; k < 6; k++) a('ferro', box(-0.015, yb - 0.15 + k * 0.1, zb - 0.32, 0.015, yb - 0.1 + k * 0.1, zb - 0.1));
    a('ferro', box(-0.015, yb - 0.32, zb - 0.22, 0.015, yb - 0.22, zb + 0.02));
    a('timber', tube([[B * 0.32, 0.3, L * 0.3, 0.05], [B * 0.34, 0.65, L * 0.3, 0.045], [B * 0.36, 0.72, L * 0.3 - 0.08, 0.04]], 5));
    a('timber', tube([[B * 0.2, 1.0, L * 0.3 + 1.1, 0.03], [B * 0.36, 0.73, L * 0.3, 0.035], [B * 0.5 + 1.5, -0.2, L * 0.3 - 1.2, 0.03]], 5));
    a('timber', slathe([[0.001, 0], [0.08, 0.05], [0.08, 0.5], [0.001, 0.55]], 6).scale(1, 1, 0.25).rotateX(Math.PI / 2).rotateY(Math.atan2(1.5 + B * 0.14, -1.2)).translate(B * 0.5 + 1.5, -0.2, L * 0.3 - 1.2));
    a('trim', box(-B * 0.3, 0.28, -L * 0.06, B * 0.3, 0.42, L * 0.06)); a('trim', box(-B * 0.3, 0.42, L * 0.05, B * 0.3, 0.75, L * 0.065));
  }
  // the dhow: the mast raked forward, the long yard slung from its head, the lateen sail between the yard and the bow
  if (K.mast) {
    const mz = -L * 0.12, top = [0, 0.2 + K.mast, mz - K.mast * 0.12];
    a('timber', tube([[0, 0.2 - D * 0.6, mz, 0.14], [0, 0.6, mz - 0.05, 0.13], [...top, 0.08]], 6));
    // the yard crosses the masthead: its fore end down near the stem, its after end high over the stern
    const y0 = [0, 1.5, -L * 0.46], y1 = top.map((v, i) => v + (v - y0[i]) * 0.6), cl = [0, 1.7, L * 0.33], sx = 0.25;
    a('timber', tube([[...y0, 0.05], [...top.map((v, i) => (i === 1 ? v + 0.12 : i === 0 ? sx * 0.4 : v)), 0.09], [...y1, 0.04]], 5));
    // the sail hangs from the yard to the clew, bellied out a little to one side
    const S = [], N = 6, Q = (u, v) => { const p = y0.map((c, i) => c + (y1[i] - c) * u), q = y0.map((c, i) => c + (cl[i] - c) * u); return [sx * 0.5 + Math.sin(Math.PI * u) * Math.sin(Math.PI * v) * 0.6, p[1] + (q[1] - p[1]) * v, p[2] + (q[2] - p[2]) * v]; };
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) { const p = Q(i / N, j / N), b = Q((i + 1) / N, j / N), c = Q((i + 1) / N, (j + 1) / N), d = Q(i / N, (j + 1) / N); S.push(...p, ...b, ...c, ...p, ...c, ...d, ...p, ...c, ...b, ...p, ...d, ...c); }
    a('sail', fromTriangles(S));
    a('rope', tube([[sx * 0.5, cl[1], cl[2], 0.012], [0, 0.4, L * 0.42, 0.012]], 3)); a('rope', tube([[...y0, 0.014], [0, 0.45, -L * 0.47, 0.014]], 3));
    a('rope', tube([[0, top[1] - 0.2, top[2], 0.015], [0, 0.4, L * 0.1, 0.015]], 3));
  }
  if (K.cabin) a('cabin', box(-B * 0.35, 0.3, -L * 0.3, B * 0.35, 2.6, L * 0.3));
}
function boat(el, { bag }) {
  const put = placer(el, bag), kind = BOATS[el.kind] ? el.kind : 'rowboat', K = BOATS[kind], L = el.len ?? K.L;
  const A = assembly(`boat|${kind}|${L}`, (a) => boatParts(kind, L, a));
  const mats = { hull: K.m, timber: 'timber', trim: 'wood_dark', awning: K.awning, sail: K.sail, cabin: K.cabin, ferro: 'steel_chrome', rope: 'sacking', cloth: 'thatch' };
  for (const [role, g] of Object.entries(A)) put(mats[role] ?? 'timber', g.clone());
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
// ---- the life of a street front and a canal ----------------------------------------------------
/** shop_sign: a shop's cloth banner hanging from a bracket out of the wall (the bracket along +z), turned edge-on to the wall so it reads along the street; h the bracket's height; cloth, letters. */
function shopSign(el, { bag }) {
  if (el.board) return boardSign(el, bag);
  const put = placer(el, bag), h = el.h ?? 2.9, c = el.cloth ?? 'cloth_indigo', len = el.len ?? 1.5, out = el.out ?? 0.95, z0 = 0.3, z1 = out - 0.05, zm = (z0 + z1) / 2;
  put('timber', box(-0.04, h - 0.05, 0, 0.04, h + 0.04, out));
  put('timber', seg([0, h - 0.6, 0.02], [0, h, out * 0.6], 0.025, 0.025, 4));
  put('timber', box(-0.035, h - 0.13, z0 - 0.04, 0.035, h - 0.07, z1 + 0.04));
  put(c, box(-0.012, h - 0.13 - len, z0, 0.012, h - 0.13, z1));
  put(el.trim ?? 'cloth_white', box(-0.014, h - 0.13 - len - 0.1, z0, 0.014, h - 0.13 - len, z1));
  const letters = el.letters ?? 3;
  for (let k = 0; k < letters; k++) { const yy = h - 0.32 - k * (len - 0.25) / letters, hh = Math.min(0.28, (len - 0.3) / letters - 0.08); put(el.ink ?? 'cloth_white', box(-0.016, yy - hh, zm - 0.13, 0.016, yy, zm + 0.13)); put(c, box(-0.019, yy - hh + 0.04, zm - 0.025, 0.019, yy - 0.04, zm + 0.025)); put(c, box(-0.019, yy - hh / 2 - 0.02, zm - 0.09, 0.019, yy - hh / 2 + 0.02, zm + 0.09)); }
  for (const zz of [z0 + 0.05, z1 - 0.05]) put('cloth_red', seg([0, h - 0.13 - len - 0.1, zz], [0, h - 0.13 - len - 0.4, zz], 0.02, 0.012, 4));
}
/** The European shop sign: an iron bracket with a scroll out of the wall (along +z), a painted board hanging edge-on to the wall, a device on it. */
function boardSign(el, bag) {
  const put = placer(el, bag), rand = rng(el.seed), h = el.h ?? 3.2, out = 1.1, c = el.cloth ?? ['wood_painted', 'stucco_red', 'stucco_leaf', 'stucco_sky', 'stucco_saffron'][Math.floor(rand() * 5)];
  put('iron', box(-0.02, h - 0.02, 0, 0.02, h + 0.02, out));
  put('iron', seg([0, h - 0.5, 0.02], [0, h, out * 0.55], 0.015, 0.015, 4));
  for (let k = 0; k < 6; k++) { const a0 = k / 6 * Math.PI * 1.6, a1 = (k + 1) / 6 * Math.PI * 1.6, r = 0.12; put('iron', seg([0, h + 0.14 + Math.sin(a0) * r, out * 0.35 + Math.cos(a0) * r], [0, h + 0.14 + Math.sin(a1) * r, out * 0.35 + Math.cos(a1) * r], 0.01, 0.01, 3)); }
  for (const zz of [0.42, 0.98]) put('iron', box(-0.006, h - 0.25, zz - 0.006, 0.006, h, zz + 0.006));
  put(c, box(-0.025, h - 0.85, 0.36, 0.025, h - 0.25, 1.04));
  put('gilt_bronze', box(-0.045, h - 0.81, 0.4, 0.045, h - 0.78, 1.0)); put('gilt_bronze', box(-0.045, h - 0.32, 0.4, 0.045, h - 0.29, 1.0));
  const dev = Math.floor(rand() * 3);
  if (dev === 0) put('gilt_bronze', at(lz([[0.001, 0], [0.12, 0.05], [0.13, 0.15], [0.06, 0.3], [0.001, 0.32]], 8).rotateZ(Math.PI / 2).rotateY(Math.PI / 2), 0, h - 0.55, 0.7));
  else if (dev === 1) put('cloth_white', box(-0.06, h - 0.7, 0.55, 0.06, h - 0.4, 0.85));
  else put('pottery_dark', at(lz([[0.07, 0], [0.12, 0.08], [0.12, 0.2], [0.05, 0.26], [0.001, 0.26]], 8), 0.04, h - 0.7, 0.7));
}
/** hang_lantern: a lantern on a cord from an eave { kind ('paper' | 'white'), drop }; y is the hook. */
function hangLantern(el, { bag }) {
  const put = placer(el, bag), d = el.drop ?? 0.35, m = el.kind === 'white' ? 'lamp_white' : 'lamp_paper';
  put('timber', box(-0.006, -d, -0.006, 0.006, 0, 0.006));
  put('lacquer_black', at(lz([[0.08, 0], [0.08, 0.05], [0.001, 0.05]], 10), 0, -d - 0.05, 0));
  put(m, at(lz([[0.07, 0], [0.18, 0.07], [0.21, 0.22], [0.18, 0.37], [0.07, 0.44], [0.001, 0.44]], 12), 0, -d - 0.5, 0));
  put('lacquer_black', at(lz([[0.07, 0], [0.07, 0.05], [0.001, 0.05]], 10), 0, -d - 0.55, 0));
  put('cloth_red', seg([0, -d - 0.55, 0], [0, -d - 0.85, 0], 0.025, 0.01, 4));
}
/** laundry_pole: a bamboo pole pushed out of a window over the street or the water (along +z), clothes hanging from it; y is the window sill. */
function laundryPole(el, { bag }) {
  // (lengths and the cloths' sizes in steps, so that poles and cloths share their shapes)
  const put = placer(el, bag), rand = rng(el.seed), L = Math.max(1, Math.round((el.len ?? 2.4) * 4) / 4), CL = ['cloth_indigo', 'cloth_white', 'cloth_grey', 'cloth_red', 'cloth_brown', 'cloth_indigo', 'cloth_green'];
  const yb = 0.1, ye = 0.45;
  put('bamboo_culm', seg([0, yb, -0.3], [0, ye, L], 0.025, 0.02, 6));
  const n = 2 + Math.floor(rand() * 3);
  for (let k = 0; k < n; k++) {
    const t = 0.25 + k * 0.7 / n + rand() * 0.05, zz = -0.3 + (L + 0.3) * t, yy = yb + (ye - yb) * t, w = 0.25 + Math.floor(rand() * 4) * 0.11, h = 0.4 + Math.floor(rand() * 4) * 0.19, c = CL[Math.floor(rand() * CL.length)];
    const xo = (k % 2 ? 1 : -1) * 0.045;                                      // alternate sides of the pole, so neighbours never share a plane
    put(c, box(xo - 0.015, yy - h, zz - w / 2, xo + 0.015, yy, zz + w / 2));
    if (rand() < 0.4) for (const s of [-1, 1]) put(c, box(xo - 0.014, yy - h * 0.55, zz + s * (w / 2 + 0.1) - 0.08, xo + 0.014, yy - 0.05, zz + s * (w / 2 + 0.1) + 0.08));   // a jacket's sleeves
  }
  if (el.prop !== false) put('bamboo_culm', seg([0, -1.6, L * 0.8], [0, ye - 0.02, L * 0.8], 0.018, 0.018, 5));
}
/** tea_table: a square table with stools (or benches) round it, a teapot and cups. */
function teaTable(el, { bag, col }) {
  const put = placer(el, bag), rand = rng(el.seed);
  put('wood_dark', box(-0.45, 0.74, -0.45, 0.45, 0.8, 0.45));
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) put('wood_dark', box(sx * 0.4 - 0.03, 0, sz * 0.4 - 0.03, sx * 0.4 + 0.03, 0.74, sz * 0.4 + 0.03));
  put('wood_dark', box(-0.42, 0.62, -0.42, 0.42, 0.66, 0.42));
  for (const [dx, dz] of [[0, -0.85], [0, 0.85], [-0.85, 0], [0.85, 0]]) {
    if (rand() < 0.2) continue;
    const b = dx === 0 ? box(-0.5, 0.42, dz - 0.13, 0.5, 0.46, dz + 0.13) : box(dx - 0.13, 0.42, -0.5, dx + 0.13, 0.46, 0.5);
    put('timber', b);
    for (const s of [-1, 1]) put('timber', dx === 0 ? box(s * 0.42 - 0.025, 0, dz - 0.1, s * 0.42 + 0.025, 0.42, dz + 0.1) : box(dx - 0.1, 0, s * 0.42 - 0.025, dx + 0.1, 0.42, s * 0.42 + 0.025));
  }
  put('pottery_dark', at(lz([[0.06, 0], [0.09, 0.04], [0.09, 0.09], [0.04, 0.13], [0.05, 0.15], [0.001, 0.15]], 10), 0.05, 0.8, 0.05));
  put('pottery_dark', seg([0.14, 0.86, 0.05], [0.21, 0.92, 0.05], 0.012, 0.008, 4));
  for (const [cx2, cz2] of [[-0.25, -0.2], [0.25, -0.22], [-0.22, 0.25], [0.2, 0.26]]) if (rand() < 0.8) put('glaze_white', at(lz([[0.025, 0], [0.04, 0.05], [0.001, 0.05]], 8), cx2, 0.8, cz2));
  if (rand() < 0.5) put('wicker', at(lz([[0.1, 0], [0.13, 0.08], [0.001, 0.08]], 8), -0.2, 0.8, 0.12));
  const [x, z] = el.at, y = el.y ?? 0; col.circle(x, z, 0.55, y, y + 0.8);
}
/** drying_tray: a round flat bamboo tray on a trestle, things laid out to dry (greens, red peppers, beans). */
function dryingTray(el, { bag }) {
  const put = placer(el, bag), rand = rng(el.seed), r = 0.45 + rand() * 0.15, h = el.h ?? 0.55;
  for (const s of [-1, 1]) { put('bamboo_culm', seg([s * 0.35, 0, -0.3], [s * 0.25, h, 0.3], 0.02, 0.02, 4)); put('bamboo_culm', seg([s * 0.35, 0, 0.3], [s * 0.25, h, -0.3], 0.02, 0.02, 4)); }
  put('wicker', lz([[0.001, h], [r, h], [r, h + 0.06], [r - 0.03, h + 0.06], [r - 0.03, h + 0.025], [0.001, h + 0.025]], 14));
  const goods = ['cloth_green', 'cloth_red', 'cloth_ochre', 'cloth_brown'][Math.floor(rand() * 4)];
  for (let k = 0; k < 14; k++) { const a = rand() * 6.28, d = Math.sqrt(rand()) * (r - 0.08); put(goods, box(Math.cos(a) * d - 0.05, h + 0.025, Math.sin(a) * d - 0.03, Math.cos(a) * d + 0.05, h + 0.045, Math.sin(a) * d + 0.03)); }
}
/** oar: the long sculling oar (yuloh) over a boat's stern, its blade in the water, along −z from the pin. */
function oar(el, { bag }) {
  const put = placer(el, bag);
  put('timber', seg([0, 0.95, 0.9], [0, 0.05, -0.9], 0.035, 0.03, 5));
  put('timber', seg([0, 0.05, -0.9], [0, -0.4, -2.2], 0.03, 0.03, 5));
  put('timber', box(-0.09, -0.6, -2.6, 0.09, -0.3, -1.9));
  put('cloth_brown', seg([0, 0.95, 0.9], [0, 0.1, 0.4], 0.006, 0.006, 3));
}

registerStyle('life', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { pot, basket, sacks, barrel, crates, firewood, bench, trough, well, stall, cart, barrow, ladder, laundry, haystack, animal, chickens, figure, boat, car, street_lamp: streetLamp, lantern, shop_sign: shopSign, hang_lantern: hangLantern, laundry_pole: laundryPole, tea_table: teaTable, drying_tray: dryingTray, oar },
  objects: {},
});
export const LIFE_KINDS = ['pot', 'basket', 'sacks', 'barrel', 'crates', 'firewood', 'bench', 'trough', 'well', 'stall', 'cart', 'barrow', 'ladder', 'laundry', 'haystack', 'animal', 'chickens', 'figure', 'boat', 'car', 'street_lamp', 'lantern', 'shop_sign', 'hang_lantern', 'laundry_pole', 'tea_table', 'drying_tray', 'oar'];
