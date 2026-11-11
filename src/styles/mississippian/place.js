// The places and goods of Cahokia outside the houses (docs/settlements/cahokia.md §5.8): the yard
// fire and the woodpile in the town's gaps, the trading mats and shade arbors of the Grand Plaza, the
// fields of maize, the dugout canoes, the landing, nets and weir at the creek, the terrace fence of
// Monks Mound. All [inferred] in arrangement; the things after the dossier's sources.
import { box, lathe, fromTriangles, rod } from '../../core/geom.js';
import { Matrix4 } from '../../core/three.js';
import { WALL, TH, rng } from './kit.js';
import { jar, slab, ears, wattle } from './dress.js';

const yAt = (el, x, z) => (typeof el.y === 'function' ? el.y(x, z) : el.y ?? 0);
const flip = (t) => { const o = []; for (let i = 0; i < t.length; i += 9) o.push(t[i], t[i + 1], t[i + 2], t[i + 6], t[i + 7], t[i + 8], t[i + 3], t[i + 4], t[i + 5]); return o; };

/** yard_fire: { c, y, seed } — a ring of stones round a fire with two logs to sit on, a pot beside it. */
function yardFire(el, { bag, col, lights }) {
  const [cx, cz] = el.c, rand = rng(el.seed || 3), y = yAt(el, cx, cz);
  for (let k = 0; k < 8; k++) { const a = k / 8 * 6.283; bag.add('granite_grey', lathe([[0.001, 0], [0.15, 0.03], [0.13, 0.13], [0.001, 0.16]], 6, null, cx + Math.cos(a) * 0.55, y - 0.02, cz + Math.sin(a) * 0.55)); }
  bag.add('bark_dark', lathe([[0.5, 0], [0.4, 0.03], [0.001, 0.03]], 10, null, cx, y, cz));
  for (let k = 0; k < 4; k++) { const a = k * 1.7 + rand(); bag.add('timber', rod([cx + Math.cos(a) * 0.4, y + 0.06, cz + Math.sin(a) * 0.4], [cx, y + 0.12, cz], 0.04, 5)); }
  if (el.flame !== false) bag.add('flame', lathe([[0.14, 0], [0.1, 0.1], [0.05, 0.26], [0.001, 0.38]], 8, (th) => 1 + 0.25 * Math.sin(th * 3), cx, y + 0.06, cz));
  col.circle(cx, cz, 0.7, y, y + 0.2);
  for (let s = 0; s < 2; s++) { const a = rand() * 6.28 + s * 3.1, bx = cx + Math.cos(a) * 2.0, bz = cz + Math.sin(a) * 2.0, ux = -Math.sin(a), uz = Math.cos(a), yb = yAt(el, bx, bz); bag.add('log_pine', rod([bx - ux * 0.8, yb + 0.2, bz - uz * 0.8], [bx + ux * 0.8, yb + 0.2, bz + uz * 0.8], 0.17, 7)); col.segment([bx - ux * 0.8, bz - uz * 0.8], [bx + ux * 0.8, bz + uz * 0.8], 0.34, yb, yb + 0.4); }
  jar(bag, cx + 0.95, y, cz - 0.55, 1.1);
  void lights;
}

/** woodpile: { c, y, rot, seed } — a long stack of split logs between two stakes, cut ends toward the viewer, a heap of bark and chips by it. */
function woodpile(el, { bag, col }) {
  const [cx, cz] = el.c, rand = rng(el.seed || 4), y = yAt(el, cx, cz), L = 2.4 + rand() * 1.0, rows = 5, ca = Math.cos(el.rot || 0), sa = Math.sin(el.rot || 0);
  for (let r = 0; r < rows; r++) for (let k = 0; k < rows + 2 - r; k++) {
    const u = (k - (rows + 1 - r) / 2) * 0.2, yy = y + 0.08 + r * 0.17, ax = cx + ca * u - sa * 0, az = cz + sa * u;
    bag.add('log_pine', rod([ax - sa * L / 2, yy, az + ca * L / 2], [ax + sa * L / 2, yy, az - ca * L / 2], 0.085, 6));
  }
  for (const s of [-1, 1]) { const px = cx + ca * s * 0.62, pz = cz + sa * s * 0.62; bag.add('timber', rod([px, y - 0.1, pz], [px, y + 1.1, pz], 0.04, 5)); }
  col.rect([cx - L / 2, cz - 0.7, cx + L / 2, cz + 0.7], y, y + 0.9);
  bag.add('bark_dark', lathe([[0.45, 0], [0.4, 0.05], [0.001, 0.14]], 7, null, cx + 1.8, y, cz + 0.6));
}

/** A stretched awning of hide on four poles. */
function awning(bag, col, x0, z0, x1, z1, y, H, mat) {
  for (const [px, pz] of [[x0, z0], [x1, z0], [x1, z1], [x0, z1]]) { bag.add('timber', rod([px, y - 0.3, pz], [px, y + H + 0.05, pz], 0.045, 6)); col.circle(px, pz, 0.05, y - 0.3, y + H); }
  slab(bag, mat, [x0 - 0.2, y + H, z0 - 0.2], [x1 + 0.2, y + H, z0 - 0.2], [x1 + 0.2, y + H - 0.28, z1 + 0.2], [x0 - 0.2, y + H - 0.28, z1 + 0.2], 0.04);
}

/**
 * trade_mat: { c, y, rot, kind: 'shell'|'pots'|'hides'|'chert'|'maize'|'salt'|'copper', seed } — a trader's mat on the plaza under
 * an awning of hide: Cahokia drew shell from the Gulf, copper from Lake Superior, chert from the
 * hills, salt from the salines, and made its own pottery and beads [stated: Wikipedia "Cahokia"; the
 * Illinois State Museum RiverWeb on shell beads and craft specialists]; the goods' arrangement [inferred].
 */
function tradeMat(el, { bag, col }) {
  const [cx, cz] = el.c, rand = rng(el.seed || 6), y = yAt(el, cx, cz), kind = el.kind || 'pots';
  const R = (u, v) => { const a = el.rot || 0; return [cx + u * Math.cos(a) - v * Math.sin(a), cz + u * Math.sin(a) + v * Math.cos(a)]; };
  const M = (u0, v0, u1, v1, yy, th, mat) => { const p = R(u0, v0), q = R(u1, v1); bag.add(mat, box(Math.min(p[0], q[0]), yy, Math.min(p[1], q[1]), Math.max(p[0], q[0]), yy + th, Math.max(p[1], q[1]))); };
  M(-1.2, -0.8, 1.2, 0.8, y, 0.03, 'reed_mat');
  { const a = R(-1.2, -0.8), b = R(1.2, 0.8); awning(bag, col, Math.min(a[0], b[0]) - 0.25, Math.min(a[1], b[1]) - 0.25, Math.max(a[0], b[0]) + 0.25, Math.max(a[1], b[1]) + 0.25, y, 2.2, kind === 'hides' ? 'hide_white' : kind === 'maize' ? 'hide_brown' : 'hide_tan'); }
  const at = (u, v, f) => { const p = R(u, v); f(p[0], p[1]); };
  if (kind === 'pots') for (let k = 0; k < 9; k++) at(-0.95 + (k % 5) * 0.46 + rand() * 0.1, -0.5 + Math.floor(k / 5) * 0.55, (x, z) => jar(bag, x, y + 0.03, z, 0.6 + rand() * 0.8, k % 4 === 0 ? 'terracotta' : 'pottery_dark'));
  else if (kind === 'shell') {
    for (let k = 0; k < 10; k++) at(-0.9 + rand() * 1.0, -0.6 + rand() * 0.6, (x, z) => bag.add(k % 2 ? 'chalk' : 'ivory', lathe([[0.001, 0], [0.08, 0.02], [0.1, 0.09], [0.06, 0.17], [0.001, 0.22]], 7, null, x, y + 0.03, z)));
    const a = R(-1.0, 0.7), b = R(1.0, 0.7); bag.add('timber', rod([a[0], y + 1.55, a[1]], [b[0], y + 1.55, b[1]], 0.02, 5));
    for (let k = 0; k < 8; k++) at(-0.9 + k * 0.26, 0.7, (x, z) => { bag.add('linen', rod([x, y + 1.55, z], [x, y + 0.95, z], 0.007, 4)); for (let b2 = 0; b2 < 6; b2++) bag.add(b2 % 3 ? 'chalk' : 'ivory', lathe([[0.001, 0], [0.02, 0], [0.02, 0.012], [0.001, 0.012]], 8, null, x, y + 0.98 + b2 * 0.09, z)); });
  } else if (kind === 'hides') for (let k = 0; k < 5; k++) at(-0.6 + k * 0.05, -0.2 + (k % 2) * 0.1, () => { const mat = ['hide_tan', 'hide_brown', 'hide_white', 'hide_grey', 'hide_tan'][k]; M(-0.9, -0.5, 0.6, 0.45, y + 0.03 + k * 0.07, 0.07, mat); });
  else if (kind === 'chert') {
    for (let k = 0; k < 14; k++) at(-0.9 + rand() * 1.8, -0.6 + rand() * 1.0, (x, z) => bag.add(k % 3 ? 'flagstone' : 'granite_red', box(x, y + 0.03, z, x + 0.1 + rand() * 0.12, y + 0.08 + rand() * 0.09, z + 0.1 + rand() * 0.1)));
    at(0.9, 0.4, (x, z) => bag.add('flagstone', lathe([[0.001, 0], [0.18, 0.02], [0.2, 0.14], [0.12, 0.26], [0.001, 0.3]], 7, null, x, y + 0.03, z)));
  } else if (kind === 'maize') for (let k = 0; k < 4; k++) at(-0.8 + k * 0.5, -0.1 + (k % 2) * 0.4, (x, z) => { bag.add('wicker', lathe([[0.001, 0], [0.22, 0.01], [0.28, 0.2], [0.25, 0.2], [0.001, 0.05]], 10, null, x, y + 0.03, z)); ears(bag, x, y + 0.2, z, 4, rand); });
  else if (kind === 'salt') for (let k = 0; k < 6; k++) at(-0.8 + (k % 3) * 0.62, -0.4 + Math.floor(k / 3) * 0.7, (x, z) => { bag.add('pottery_dark', lathe([[0.001, 0], [0.12, 0.01], [0.28, 0.1], [0.26, 0.1], [0.001, 0.03]], 10, null, x, y + 0.03, z)); bag.add('chalk', lathe([[0.001, 0.0], [0.23, 0.0], [0.2, 0.07], [0.001, 0.09]], 8, null, x, y + 0.1, z)); });
  else if (kind === 'copper') for (let k = 0; k < 4; k++) at(-0.6 + k * 0.4, -0.2 + (k % 2) * 0.3, (x, z) => bag.add('clay_gilt', box(x, y + 0.03, z, x + 0.22, y + 0.045, z + 0.3)));
  // the trader's seat: a log
  at(-1.45, 0.95, (x, z) => { bag.add('log_pine', rod([x - 0.4, y + 0.18, z], [x + 0.4, y + 0.18, z], 0.14, 7)); });
}

/** shade_arbor: { rect, y } — a roofed shade of posts and thatch on the plaza, log benches under it, a water jar. */
function shadeArbor(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = yAt(el, (x0 + x1) / 2, (z0 + z1) / 2), H = 2.6, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  for (const [px, pz] of [[x0, z0], [x1, z0], [x1, z1], [x0, z1], [cx, z0], [cx, z1]]) { bag.add('timber', rod([px, y - 0.4, pz], [px, y + H, pz], 0.1, 7)); col.circle(px, pz, 0.1, y - 0.4, y + H); }
  for (const z of [z0, z1]) bag.add('timber', rod([x0 - 0.3, y + H, z], [x1 + 0.3, y + H, z], 0.08, 6));
  for (let k = 0; k < 9; k++) { const x = x0 - 0.2 + (x1 - x0 + 0.4) * k / 8; bag.add('timber', rod([x, y + H + 0.08, z0 - 0.4], [x, y + H + 0.08, z1 + 0.4], 0.04, 5)); }
  slab(bag, TH, [x0 - 0.5, y + H + 0.1, z0 - 0.5], [x1 + 0.5, y + H + 0.1, z0 - 0.5], [x1 + 0.5, y + H + 0.1, z1 + 0.5], [x0 - 0.5, y + H + 0.1, z1 + 0.5], 0.28);
  for (const z of [z0 + 0.7, z1 - 0.7]) { bag.add('log_pine', rod([x0 + 0.5, y + 0.24, z], [x1 - 0.5, y + 0.24, z], 0.18, 8)); for (const x of [x0 + 0.7, cx, x1 - 0.7]) bag.add('timber', rod([x, y - 0.1, z], [x, y + 0.2, z], 0.06, 5)); col.segment([x0 + 0.5, z], [x1 - 0.5, z], 0.36, y, y + 0.44); }
  jar(bag, x1 - 0.5, y, cz, 2.0); bag.add('wicker', lathe([[0.001, 0], [0.14, 0.01], [0.18, 0.1], [0.001, 0.12]], 8, null, x1 - 0.5, y + 0.78, cz));
}

// ---- the fields ------------------------------------------------------------------------------------
let PLANTS = null;
function maizePlants() {
  if (PLANTS) return PLANTS;
  PLANTS = [1.7, 2.0, 2.3].map((h) => {
    const T = [], r = 0.012;
    const stem = rod([0, 0, 0], [0.02, h, 0], r * 1.6, 4), sg = stem.index ? stem.toNonIndexed() : stem; T.push(...sg.attributes.position.array);
    for (let k = 0; k < 6; k++) { const a = k * 1.05, dx = Math.cos(a), dz = Math.sin(a), ly = h * (0.3 + 0.1 * k), nx = -dz * 0.05, nz = dx * 0.05;
      T.push(0.01, ly, 0, dx * 0.55, ly - 0.2, dz * 0.55, dx * 0.25 + nx, ly + 0.02, dz * 0.25 + nz, 0.01, ly, 0, dx * 0.25 + nx, ly + 0.02, dz * 0.25 + nz, dx * 0.55, ly - 0.2, dz * 0.55); }
    T.push(0, h, 0, 0.18, h + 0.1, 0.02, 0, h + 0.3, 0, 0, h, 0, 0, h + 0.3, 0, -0.18, h + 0.1, -0.02);
    return fromTriangles(T);
  });
  return PLANTS;
}
/** field: { rect, y (fn), seed, step } — maize in rows, planted in hills, with squash leaves along the rows, the stalks all instances of three. */
function field(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, rand = rng(el.seed || 5), step = el.step ?? 1.15, shapes = maizePlants(), M = new Matrix4(), S = new Matrix4();
  for (let x = x0 + 0.5; x < x1; x += step) for (let z = z0 + 0.5; z < z1; z += step) {
    if (rand() < 0.07) continue;
    const px = x + (rand() - 0.5) * 0.2, pz = z + (rand() - 0.5) * 0.2, k = Math.floor(rand() * 3), sc = 0.85 + rand() * 0.3;
    M.makeRotationY(rand() * 6.283).premultiply(S.makeScale(sc, sc, sc)).setPosition(px, yAt(el, px, pz) - 0.02, pz);
    if (bag.addInstance) bag.addInstance('flax_leaf', shapes[k].clone(), M.clone(), { reach: 170 }); else bag.add('flax_leaf', shapes[k].clone().applyMatrix4(M));
  }
  // the hills' ridges of earth; a scarecrow's platform of poles for the watcher at the field's edge
  const m = yAt(el, (x0 + x1) / 2, (z0 + z1) / 2);
  for (const [px, pz] of [[x0 + 0.5, z0 + 0.5], [x0 + 2.5, z0 + 0.5], [x0 + 0.5, z0 + 2.5], [x0 + 2.5, z0 + 2.5]]) bag.add('timber', rod([px, yAt(el, px, pz) - 0.2, pz], [px, m + 2.3, pz], 0.05, 5));
  slab(bag, 'timber', [x0 + 0.3, m + 2.3, z0 + 0.3], [x0 + 2.7, m + 2.3, z0 + 0.3], [x0 + 2.7, m + 2.3, z0 + 2.7], [x0 + 0.3, m + 2.3, z0 + 2.7], 0.06);
  col.rect([x0 + 0.4, z0 + 0.4, x0 + 2.6, z0 + 2.6], m - 0.2, m + 2.3);
}

// ---- the creek -------------------------------------------------------------------------------------
/** dugout: { c, y, rot, len, seed } — a canoe hollowed from one log, pointed at both ends, with its paddles; afloat at y. */
function dugout(el, { bag }) {
  const [cx, cz] = el.c, L = el.len ?? 5.2, y = el.y ?? 0, a = el.rot ?? 0, ca = Math.cos(a), sa = Math.sin(a), T = [], N = 10, wmax = 0.36;
  const ring = (t, inner) => {
    const s = t * 2 - 1, w = wmax * Math.sqrt(Math.max(0, 1 - s * s ** 3)) * (inner ? 0.78 : 1) + 0.03, lift = 0.1 * s * s, top = 0.3 + lift * 2.4 - (inner ? 0.02 : 0), bot = inner ? 0.07 : -0.03 + lift * 0.5;
    return [[-w, top], [-w * 0.86, 0.1 + lift], [-w * 0.45, bot], [w * 0.45, bot], [w * 0.86, 0.1 + lift], [w, top]].map(([u, v]) => { const along = (t - 0.5) * L; return [cx + ca * along - sa * u, y + v - 0.05, cz + sa * along + ca * u]; });
  };
  for (let i = 0; i < N; i++) for (const inner of [false, true]) {
    const A = ring(i / N, inner), B = ring((i + 1) / N, inner);
    for (let k = 0; k < 5; k++) T.push(...A[k], ...B[k], ...B[k + 1], ...A[k], ...B[k + 1], ...A[k + 1]);
  }
  for (let i = 0; i < N; i++) for (const k of [0, 5]) { const o0 = ring(i / N, false)[k], o1 = ring((i + 1) / N, false)[k], i0 = ring(i / N, true)[k], i1 = ring((i + 1) / N, true)[k]; T.push(...o0, ...o1, ...i1, ...o0, ...i1, ...i0); }
  bag.add('log_pine', fromTriangles(T.concat(flip(T))));
  for (let s = 0; s < 2; s++) { const u = (s ? 0.9 : -0.3), px = cx + ca * u, pz = cz + sa * u; bag.add('timber', rod([px, y + 0.12, pz], [px + ca * 0.9 - sa * 0.35, y + 0.2, pz + sa * 0.9 + ca * 0.35], 0.02, 5)); bag.add('timber', box(px + ca * 0.9 - sa * 0.35 - 0.06, y + 0.17, pz + sa * 0.9 + ca * 0.35 - 0.06, px + ca * 0.9 - sa * 0.35 + 0.06, y + 0.21, pz + sa * 0.9 + ca * 0.35 + 0.06)); }
}

/** landing: { c, y (fn), rot (the way to the water), seed } — where the people of the creek come down to it: log steps, two posts to tie to, a net spread on poles, a rack of split fish, a basket trap. */
function landing(el, { bag, col }) {
  const [cx, cz] = el.c, a = el.rot ?? 0, ca = Math.cos(a), sa = Math.sin(a), rand = rng(el.seed || 8);
  const P = (u, v) => [cx + ca * u - sa * v, cz + sa * u + ca * v], yy = (u, v) => yAt(el, ...P(u, v));
  for (let k = 0; k < 4; k++) for (const s of [-1, 1]) { const p = P(k * 0.8, s * 0.9), q = P(k * 0.8, s * 0.9 + 0.001); bag.add('timber', rod([p[0], yy(k * 0.8, s * 0.9) - 0.3, p[1]], [p[0], yy(k * 0.8, s * 0.9) + 0.3, p[1]], 0.05, 5)); void q; }
  for (let k = 0; k < 4; k++) { const p = P(k * 0.8, -0.9), q = P(k * 0.8, 0.9); bag.add('log_pine', rod([p[0], yy(k * 0.8, 0) + 0.1, p[1]], [q[0], yy(k * 0.8, 0) + 0.1, q[1]], 0.12, 7)); }
  for (const s of [-1, 1]) { const p = P(2.6, s * 2.0), y0 = yy(2.6, s * 2.0); bag.add('timber', rod([p[0], y0 - 0.5, p[1]], [p[0], y0 + 1.1, p[1]], 0.09, 7)); col.circle(p[0], p[1], 0.1, y0, y0 + 1.1); }
  // the net spread to dry on two poles
  const n0 = P(-2.0, -2.8), n1 = P(-2.0, 0.8), yn = yy(-2.0, -1);
  for (const p of [n0, n1]) bag.add('timber', rod([p[0], yn - 0.2, p[1]], [p[0], yn + 1.5, p[1]], 0.04, 5));
  bag.add('timber', rod([n0[0], yn + 1.45, n0[1]], [n1[0], yn + 1.45, n1[1]], 0.025, 5));
  for (let k = 0; k <= 12; k++) { const f = k / 12, x = n0[0] + (n1[0] - n0[0]) * f, z = n0[1] + (n1[1] - n0[1]) * f; bag.add('linen', rod([x, yn + 1.45, z], [x, yn + 0.55 + 0.25 * Math.sin(f * 3.14), z], 0.006, 4)); }
  for (let r = 0; r < 4; r++) bag.add('linen', rod([n0[0], yn + 1.3 - r * 0.2, n0[1]], [n1[0], yn + 1.3 - r * 0.2 - 0.12, n1[1]], 0.005, 4));
  // a rack of split fish
  const r0 = P(-1.5, 2.2), r1 = P(1.5, 2.8), yr = yy(0, 2.5);
  for (const p of [r0, r1]) bag.add('timber', rod([p[0], yr - 0.2, p[1]], [p[0], yr + 1.6, p[1]], 0.04, 5));
  bag.add('timber', rod([r0[0], yr + 1.5, r0[1]], [r1[0], yr + 1.5, r1[1]], 0.03, 5));
  for (let k = 0; k < 9; k++) { const f = (k + 0.5) / 9, x = r0[0] + (r1[0] - r0[0]) * f, z = r0[1] + (r1[1] - r0[1]) * f; bag.add(k % 3 ? 'hide_grey' : 'hide_brown', box(x - 0.04, yr + 0.95, z - 0.01, x + 0.04, yr + 1.48, z + 0.01)); }
  // a basket trap of withies
  const q = P(0.6, -2.0); bag.add('wicker', lathe([[0.16, 0], [0.2, 0.3], [0.14, 0.6], [0.001, 0.62]], 8, null, q[0], yy(0.6, -2.0), q[1]));
  void rand;
}

/** weir: { c (centre), a: [x, z], b: [x, z] arms of a V of stakes in the water, y (the water), h } — a fish weir: two rows of stakes meeting downstream with a trap basket at the point. */
function weir(el, { bag }) {
  const [cx, cz] = el.c, tip = [cx + (el.tip?.[0] ?? 0), cz + (el.tip?.[1] ?? 0)], y = el.y ?? 0;
  for (const arm of [el.a, el.b]) {
    const n = 14;
    for (let k = 0; k <= n; k++) { const f = k / n, x = arm[0] + (tip[0] - arm[0]) * f, z = arm[1] + (tip[1] - arm[1]) * f; bag.add('timber', rod([x, y - 1.2, z], [x, y + 0.7 + (k % 3) * 0.07, z], 0.03, 5)); }
  }
  bag.add('wicker', lathe([[0.3, 0], [0.34, 0.5], [0.2, 0.9], [0.001, 1.0]], 8, null, tip[0], y - 0.1, tip[1]));
}

/** terrace_fence: { from, to, y (fn) } — a low fence of posts and rails at the edge of a mound's terrace, with a painted post every 6 m. */
function terraceFence(el, { bag, col }) {
  const [ax, az] = el.from, [bx, bz] = el.to, L = Math.hypot(bx - ax, bz - az), n = Math.max(1, Math.round(L / 1.6)), ux = (bx - ax) / L, uz = (bz - az) / L;
  for (let k = 0; k <= n; k++) { const x = ax + (bx - ax) * k / n, z = az + (bz - az) * k / n, y = yAt(el, x, z); const red = k % 4 === 0; bag.add(red ? 'timber_red' : 'timber', rod([x, y - 0.3, z], [x, y + (red ? 1.9 : 1.15), z], red ? 0.09 : 0.055, 6)); if (red) bag.add('paint_white', lathe([[0.095, 0], [0.095, 0.15], [0.001, 0.15]], 7, null, x, y + 1.3, z)); }
  for (const h of [0.45, 0.9]) for (let k = 0; k < n; k++) { const x0 = ax + (bx - ax) * k / n, z0 = az + (bz - az) * k / n, x1 = ax + (bx - ax) * (k + 1) / n, z1 = az + (bz - az) * (k + 1) / n, y = yAt(el, x0, z0); bag.add('timber', rod([x0, y + h, z0], [x1, yAt(el, x1, z1) + h, z1], 0.03, 5)); }
  col.segment([ax, az], [bx, bz], 0.14, yAt(el, ax, az) - 0.2, yAt(el, ax, az) + 1.1);
  void ux; void uz;
}

/** wattle_fence: { pts: [[x, z], …], y } — a fence of stakes and woven withies along the points. */
function wattleFence(el, { bag, col }) { for (let k = 0; k + 1 < el.pts.length; k++) wattle(bag, col, el.pts[k], el.pts[k + 1], (x, z) => yAt(el, x, z)); }
export const placeElements = { wattle_fence: wattleFence, yard_fire: yardFire, woodpile, trade_mat: tradeMat, shade_arbor: shadeArbor, field, dugout, landing, weir, terrace_fence: terraceFence };
void WALL;
