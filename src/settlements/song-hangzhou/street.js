// The things of the street (docs/settlements/song-hangzhou.md §18; Wu Zimu, Mengliang lu, chs. 13, 16, 19): at eye level
// on the Imperial Way, the canal streets, the lanes, the canal banks and the lake's landings — each shop front's
// apron by its trade (tea houses' stoves and kettles, wine jars, herb trays, flowers), potted plants, benches, hung
// lanterns and the lamp posts of the night market, hawkers' stands and their carrying poles set down, sedan chairs
// at rest with their bearers, laundry poles; on the banks the boatmen's gear (nets on racks, coiled ropes, mooring
// stones, planks, pole stacks, fish traps, rolled sails, oar racks); at the lake the boatmen's things on the jetties.
// Every small shape is shared (an instance of one assembly), the things go into 100 m tiles of the street life.
// Owned by the street-life pass (docs/batches.md B1).

import { box, lathe, rod, fromTriangles, hangFrom, windMat } from '../../core/geom.js';
import { placer, assembly, rng } from '../../objects/kit.js';
import { STYLES } from '../../core/build.js';
import '../../objects/index.js';
import { frontOf, tradeOf } from './life.js';
import { lots, streetEntries, imperialRects, LEVEL, RADIUS } from './ways.js';
import { CANAL, CANAL_BRIDGES, CITY, inLot } from './layout.js';

// ── the shapes (built once, shared) ───────────────────────────────────────────────────────────────
const U = {}, DEF = {};
function unit(name, defaults, build) { DEF[name] = defaults; U[name] = assembly(`hz-street|${name}`, build); }
const ly = (prof, seg = 10, x = 0, y = 0, z = 0) => lathe(prof, seg, null, x, y, z);
const drum = (r0, r1, h, seg, x, y, z) => ly([[0.001, 0], [r0, 0], [r1, h], [0.001, h]], seg, x, y, z);
const rodG = (a, b, r, seg = 5) => rod(a, b, r, seg);
const bowl = (x, y, z, k = 1) => ly([[0.001, 0], [0.036 * k, 0], [0.07 * k, 0.026 * k], [0.088 * k, 0.07 * k], [0.082 * k, 0.072 * k], [0.064 * k, 0.034 * k], [0.001, 0.014 * k]], 8, x, y, z);
const jar = (r, h, x, y, z) => ly([[0.001, 0], [r * 0.5, 0], [r, h * 0.22], [r * 1.12, h * 0.5], [r * 0.9, h * 0.78], [r * 0.55, h * 0.93], [r * 0.6, h], [0.001, h]], 10, x, y, z);
function slab(poly, zc, th = 0.008) {
  const t = [], n = poly.length;
  for (let i = 1; i + 1 < n; i++) { t.push(poly[0][0], poly[0][1], zc + th, poly[i][0], poly[i][1], zc + th, poly[i + 1][0], poly[i + 1][1], zc + th); t.push(poly[0][0], poly[0][1], zc - th, poly[i + 1][0], poly[i + 1][1], zc - th, poly[i][0], poly[i][1], zc - th); }
  for (let i = 0; i < n; i++) { const p = poly[i], q = poly[(i + 1) % n]; t.push(p[0], p[1], zc - th, q[0], q[1], zc - th, q[0], q[1], zc + th, p[0], p[1], zc - th, q[0], q[1], zc + th, p[0], p[1], zc + th); }
  return fromTriangles(t);
}
const WINDY = new Set();
const windy = (name, role) => WINDY.add(`${name}.${role}`);

// a tub with a clipped bush, a bamboo clump or a low chrysanthemum bed: the potted plants of the fronts
unit('planter', { p: 'glaze_blue', l: 'flax_leaf', e: 'terracotta' }, (a) => {
  a('p', ly([[0.001, 0], [0.15, 0], [0.22, 0.28], [0.25, 0.31], [0.21, 0.3], [0.001, 0.27]], 10));
  a('l', ly([[0.001, 0.28], [0.2, 0.36], [0.27, 0.55], [0.21, 0.78], [0.001, 0.86]], 8));
});
unit('planter2', { p: 'terracotta', l: 'palm_leaf', s: 'bamboo_culm' }, (a) => {
  a('p', ly([[0.001, 0], [0.17, 0], [0.24, 0.34], [0.27, 0.36], [0.22, 0.34], [0.001, 0.3]], 10));
  for (let k = 0; k < 5; k++) { const t = k / 5 * 6.28, x = Math.cos(t) * 0.07, z = Math.sin(t) * 0.07; a('s', rodG([x, 0.3, z], [x * 3.5, 1.45 + (k % 2) * 0.3, z * 3.5], 0.014, 4)); a('l', ly([[0.001, 0], [0.12, 0.05], [0.001, 0.2]], 6, x * 3.5, 1.3 + (k % 2) * 0.3, z * 3.5)); }
});
unit('planter3', { p: 'glaze_white', l: 'flax_leaf', f: 'cloth_ochre' }, (a) => {
  a('p', ly([[0.001, 0], [0.2, 0], [0.26, 0.2], [0.3, 0.24], [0.001, 0.22]], 10));
  a('l', ly([[0.001, 0.22], [0.3, 0.26], [0.26, 0.42], [0.001, 0.46]], 8));
  for (let k = 0; k < 6; k++) { const t = k * 1.05, r = 0.12 + (k % 2) * 0.07; a('f', ly([[0.001, 0], [0.05, 0.02], [0.001, 0.06]], 6, Math.cos(t) * r, 0.42 + (k % 3) * 0.03, Math.sin(t) * r)); }
});
// the tea hawker's stand: a low table with a brick stove, a copper kettle, cups, a tea flag, two stools
unit('teastall', { t: 'timber', b: 'brick_grey', i: 'iron', k: 'bronze', c: 'glaze_white', f: 'cloth_white', s: 'bamboo_culm' }, (a) => {
  a('t', box(-0.65, 0.74, -0.25, 0.65, 0.79, 0.25));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) a('t', box(sx * 0.6 - 0.025, 0, sz * 0.2 - 0.025, sx * 0.6 + 0.025, 0.74, sz * 0.2 + 0.025));
  a('b', box(-0.6, 0.79, -0.2, -0.15, 1.0, 0.2)); a('i', drum(0.12, 0.12, 0.03, 10, -0.375, 1.0, 0));
  a('k', ly([[0.001, 0], [0.12, 0], [0.16, 0.08], [0.12, 0.2], [0.07, 0.24], [0.001, 0.25]], 10, -0.375, 1.03, 0));
  a('k', rodG([-0.22, 1.12, 0], [-0.1, 1.2, 0], 0.016, 4)); a('k', rodG([-0.55, 1.32, 0], [-0.2, 1.32, 0], 0.012, 4));
  a('b', box(-0.45, 1.0, -0.06, -0.3, 1.5, 0.06));
  for (let k = 0; k < 5; k++) a('c', bowl(-0.02 + k * 0.14, 0.79, -0.05 + (k % 2) * 0.1, 0.9));
  a('i', ly([[0.001, 0], [0.08, 0], [0.1, 0.12], [0.001, 0.14]], 8, 0.55, 0.79, 0.05));
  a('s', rodG([0.7, 0, -0.22], [0.7, 2.5, -0.22], 0.02, 5)); a('f', hangFrom(slab([[0.7, 2.45], [1.25, 2.45], [1.25, 1.85], [0.7, 1.85]], -0.22), 2.45)); windy('teastall', 'f');
  for (const x of [-0.45, 0.2]) { a('t', box(x - 0.17, 0.36, 0.5, x + 0.17, 0.4, 0.8)); for (const dx of [-0.12, 0.12]) for (const dz of [0.54, 0.76]) a('t', box(x + dx - 0.02, 0, dz - 0.02, x + dx + 0.02, 0.36, dz + 0.02)); }
});
// a tea house's stove at its front: a big brick stove with its chimney, two kettles, a water jar, firewood and a bucket
unit('kettlestove', { b: 'brick_grey', i: 'iron', k: 'bronze', j: 'pottery_dark', w: 'bark_pine', t: 'timber', c: 'glaze_white' }, (a) => {
  a('b', box(-0.45, 0, -0.3, 0.45, 0.78, 0.3)); a('b', box(-0.12, 0.78, -0.26, 0.12, 2.1, -0.05));
  for (const x of [-0.22, 0.22]) { a('i', drum(0.14, 0.14, 0.03, 10, x, 0.78, 0.05)); a('k', ly([[0.001, 0], [0.13, 0], [0.19, 0.1], [0.15, 0.25], [0.08, 0.31], [0.001, 0.32]], 10, x, 0.81, 0.05)); a('k', rodG([x + 0.1, 1.0, 0.05], [x + 0.28, 1.14, 0.05], 0.02, 4)); }
  a('j', jar(0.26, 0.7, 0.85, 0, 0.0)); a('t', box(0.6, 0.7, -0.2, 1.1, 0.76, 0.2).translate(0, 0, 0));
  for (let k = 0; k < 5; k++) a('w', rodG([-1.0, 0.07 + (k > 2 ? 0.14 : 0), -0.25 + (k % 3) * 0.17], [-0.62, 0.07 + (k > 2 ? 0.14 : 0), -0.25 + (k % 3) * 0.17], 0.045, 5));
  for (let k = 0; k < 4; k++) a('c', bowl(0.7 + k * 0.1, 0.76, 0.0, 0.9));
  a('t', ly([[0.001, 0], [0.12, 0], [0.14, 0.26], [0.001, 0.26]], 8, -0.1, 0, 0.55));
});
// a hawker's carrying pole at rest: two baskets (with a heap of goods under a cloth) joined by the pole laid across their rims, a stool
unit('hawkpole', { w: 'wicker', s: 'bamboo_culm', r: 'rope_fibre', g: 'cloth_red', h: 'cloth_ochre', t: 'timber' }, (a) => {
  for (const [x, c] of [[-0.62, 'g'], [0.62, 'h']]) {
    a('w', ly([[0.001, 0], [0.2, 0], [0.26, 0.2], [0.29, 0.38], [0.26, 0.38], [0.22, 0.22], [0.17, 0.04], [0.001, 0.04]], 12, x, 0, 0));
    a(c, ly([[0.26, 0.3], [0.2, 0.42], [0.001, 0.5]], 9, x, 0, 0));
    for (const dz of [-0.2, 0.2]) a('r', rodG([x * 1.3, 0.44, 0.0], [x, 0.38, dz * 0.9], 0.006, 3));
  }
  a('s', rodG([-1.15, 0.5, 0.0], [1.15, 0.47, 0.0], 0.024, 5));
  a('t', box(1.35 - 0.17, 0.2, -0.1, 1.35 + 0.17, 0.24, 0.1)); for (const dx of [-0.12, 0.12]) for (const dz of [-0.06, 0.06]) a('t', box(1.35 + dx - 0.02, 0, dz - 0.02, 1.35 + dx + 0.02, 0.2, dz + 0.02));
});
// a sedan chair (jiaozi) set down on its two stands: the cabin with its stepped roof, side cloths, the front curtain, two long poles
unit('sedan', { t: 'timber', k: 'lacquer_black', c: 'cloth_green', w: 'wood_dark', g: 'gilt_bronze' }, (a) => {
  const y0 = 0.5;
  a('w', box(-0.5, y0 - 0.05, -0.5, 0.5, y0 + 0.05, 0.5));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) a('w', box(sx * 0.46 - 0.03, y0, sz * 0.46 - 0.03, sx * 0.46 + 0.03, y0 + 1.0, sz * 0.46 + 0.03));
  a('k', box(-0.62, y0 + 1.0, -0.62, 0.62, y0 + 1.06, 0.62)); a('k', box(-0.46, y0 + 1.06, -0.46, 0.46, y0 + 1.16, 0.46)); a('g', drum(0.05, 0.001, 0.12, 8, 0, y0 + 1.16, 0));
  for (const sx of [-1, 1]) a('c', box(sx * 0.46 - 0.012, y0 + 0.2, -0.46, sx * 0.46 + 0.012, y0 + 1.0, 0.46));
  a('c', box(-0.46, y0 + 0.2, -0.47, 0.46, y0 + 1.0, -0.45));
  a('c', hangFrom(slab([[-0.46, y0 + 1.0], [0.46, y0 + 1.0], [0.46, y0 + 0.28], [-0.46, y0 + 0.28]], 0.5), y0 + 1.0)); windy('sedan', 'c');
  a('t', box(-0.4, y0 + 0.05, -0.4, 0.4, y0 + 0.14, 0.3));
  for (const sx of [-1, 1]) { a('t', rodG([sx * 0.58, y0 - 0.1, -1.7], [sx * 0.58, y0 - 0.1, 1.7], 0.032, 6)); for (const z of [-1.3, 1.3]) { a('w', box(sx * 0.58 - 0.07, 0, z - 0.07, sx * 0.58 + 0.07, y0 - 0.13, z + 0.07)); } }
  for (const z of [-1.3, 1.3]) a('w', box(-0.58, 0.14, z - 0.025, 0.58, 0.2, z + 0.025));
});
// the wine houses' jars stacked in a pyramid with their red cloth lids, and a pickle-jar heap for the daily-wares shops
unit('jarheap', { j: 'pottery_dark', g: 'glaze_green', c: 'cloth_red' }, (a) => {
  const row = [[-0.3, 0], [0.3, 0], [0, 0.4]], r = 0.26;
  for (let k = 0; k < 3; k++) a(k === 1 ? 'g' : 'j', jar(r, 0.62, row[k][0], k === 2 ? 0.5 : 0, k === 2 ? 0.0 : 0));
  a('j', jar(r * 0.9, 0.55, 0.0, 0.0, -0.45).translate(0, 0, 0)); a('c', ly([[0.001, 0.58], [0.15, 0.58], [0.001, 0.68]], 8, 0, 0.5, 0));
});
// the net rack on the banks: two forked bamboo posts, a pole across, the drying net hung from it (scalloped, swaying), floats
unit('netrack', { s: 'bamboo_culm', n: 'rope_fibre', f: 'sacking' }, (a) => {
  for (const x of [-1.3, 1.3]) { a('s', rodG([x, 0, 0], [x, 2.2, 0], 0.035, 5)); a('s', rodG([x, 2.0, 0], [x - 0.1, 2.35, 0.05], 0.02, 4)); a('s', rodG([x, 2.0, 0], [x + 0.1, 2.35, -0.05], 0.02, 4)); a('s', rodG([x, 0, 0], [x - 0.5, 0, 0.3], 0.02, 4)); }
  a('s', rodG([-1.45, 2.2, 0], [1.45, 2.2, 0], 0.025, 5));
  for (let k = 0; k < 6; k++) { const x0 = -1.3 + k * 0.433, x1 = x0 + 0.433, d = 1.0 + ((k * 7) % 5) * 0.12; a('n', hangFrom(slab([[x0, 2.2], [x1, 2.2], [x1 - 0.05, 2.2 - d * 0.7], [(x0 + x1) / 2, 2.2 - d], [x0 + 0.05, 2.2 - d * 0.7]], 0.02 * (k % 2), 0.006), 2.2)); }
  windy('netrack', 'n');
  for (let k = 0; k < 5; k++) a('f', drum(0.03, 0.03, 0.12, 6, -1.0 + k * 0.5, 0.9 + (k % 2) * 0.2, 0.04));
});
unit('ropecoil', { r: 'rope_fibre' }, (a) => { for (let k = 0; k < 4; k++) a('r', ly([[0.14 + k * 0.012, 0], [0.26, 0], [0.26, 0.05], [0.14 + k * 0.012, 0.05]], 12, 0, k * 0.05, 0)); a('r', rodG([0.2, 0.05, 0.0], [0.5, 0.0, 0.1], 0.016, 4)); });
unit('bollard', { g: 'granite_block', r: 'rope_fibre' }, (a) => { a('g', ly([[0.001, 0], [0.17, 0], [0.15, 0.3], [0.2, 0.38], [0.2, 0.45], [0.001, 0.46]], 8)); a('r', ly([[0.15, 0.26], [0.17, 0.26], [0.17, 0.32], [0.15, 0.32]], 8)); });
unit('plankpile', { t: 'timber', w: 'wood_dark' }, (a) => {
  for (const z of [-0.8, 0.8]) a('w', box(-0.4, 0, z - 0.06, 0.4, 0.12, z + 0.06));
  for (let k = 0; k < 4; k++) a(k % 2 ? 't' : 'w', box(-0.32 + (k % 2) * 0.05, 0.12 + k * 0.06, -1.5, 0.12 + (k % 2) * 0.05 - 0.0, 0.18 + k * 0.06, 1.5 + k * 0.1));
});
unit('polestack', { s: 'bamboo_culm', r: 'rope_fibre' }, (a) => { for (let k = 0; k < 6; k++) { const x = -0.12 + (k % 3) * 0.1, y = 0.1 + Math.floor(k / 3) * 0.1; a('s', rodG([0.9 + x * 0.1, y, 0.0], [0.15 + x * 0.1, 2.6 + (k % 3) * 0.15, 0.05 + x], 0.022, 4)); } a('r', rodG([0.75, 0.3, -0.04], [0.8, 0.3, 0.14], 0.012, 3)); });
unit('fishtrap', { w: 'wicker', r: 'rope_fibre' }, (a) => {
  a('w', ly([[0.001, 0], [0.16, 0], [0.2, 0.2], [0.18, 0.5], [0.12, 0.62], [0.06, 0.6]], 9, 0, 0, 0));
  a('w', ly([[0.2, 0.2], [0.17, 0.22], [0.001, 0.2]], 9, 0.45, 0, 0).translate(0, 0, 0)); a('w', ly([[0.001, 0], [0.14, 0], [0.18, 0.18], [0.16, 0.45], [0.1, 0.58], [0.05, 0.56]], 9, 0.45, 0, 0.1));
  a('r', rodG([0.06, 0.6, 0], [0.45, 0.58, 0.1], 0.008, 3));
});
unit('sailroll', { t: 'thatch', s: 'bamboo_culm', r: 'rope_fibre' }, (a) => { a('t', rodG([-1.2, 0.17, 0], [1.2, 0.17, 0], 0.17, 8)); a('s', rodG([-1.3, 0.38, 0], [1.3, 0.38, 0], 0.02, 4)); for (const x of [-0.6, 0.5]) a('r', ly([[0.176, 0], [0.19, 0], [0.19, 0.04], [0.176, 0.04]], 8).rotateZ(Math.PI / 2).translate(x, 0.17, 0)); });
unit('oarrack', { t: 'timber', w: 'wood_dark' }, (a) => {
  a('t', box(-0.8, 0.9, -0.05, 0.8, 0.96, 0.05)); for (const x of [-0.78, 0.78]) a('t', box(x - 0.04, 0, -0.05, x + 0.04, 1.0, 0.05));
  for (let k = 0; k < 4; k++) { const x = -0.5 + k * 0.33; a('w', rodG([x, 0.0, 0.4], [x + 0.02, 1.35, 0.0], 0.025, 4)); a('t', box(x - 0.09, 0.0, 0.42, x + 0.09, 0.5, 0.5).rotateX(0.25).translate(0, 0, -0.12)); }
});
unit('stoolpair', { t: 'timber' }, (a) => { for (const x of [-0.3, 0.3]) { a('t', box(x - 0.17, 0.2, -0.08, x + 0.17, 0.24, 0.12)); for (const dx of [-0.12, 0.12]) for (const dz of [-0.04, 0.08]) a('t', box(x + dx - 0.02, 0, dz - 0.02, x + dx + 0.02, 0.2, dz + 0.02)); } });
unit('lampstand', { t: 'timber', i: 'iron', c: 'lamp_paper', r: 'cloth_red' }, (a) => {
  a('t', box(-0.04, 0, -0.04, 0.04, 2.9, 0.04)); a('t', box(-0.04, 2.5, -0.04, 0.04, 2.58, 0.9)); a('t', box(-0.04, 2.5, -0.9, 0.04, 2.58, 0.04));
  for (const z of [-0.8, -0.4, 0.4, 0.8]) { a('i', rodG([0, 2.5, z], [0, 2.34, z], 0.006, 3)); a('c', ly([[0.07, 0], [0.16, 0.07], [0.19, 0.2], [0.16, 0.33], [0.07, 0.4], [0.001, 0.4]], 10, 0, 1.94, z)); a('r', rodG([0, 1.94, z], [0, 1.78, z], 0.012, 3)); }
  a('t', box(-0.2, 0, -0.2, 0.2, 0.12, 0.2));
});

// ── the element: a set of those shapes at places (world x, z; local y up) ───────────────────────────────
/** hz_street_set { items: [{ u, at: [x, z], y, rot, k, mats, r (collision radius) }] } — style life. */
function streetSet(el, { bag, col }) {
  for (const it of el.items) {
    const P = placer({ t: el.t, at: it.at, y: it.y ?? 0, rot: it.rot ?? 0, s: it.k ?? 1 }, bag);
    for (const [role, g] of Object.entries(U[it.u])) { let m = it.mats?.[role] ?? DEF[it.u][role]; if (WINDY.has(`${it.u}.${role}`)) m = windMat(m); P(m, g.clone()); }
    if (it.r) col?.circle(it.at[0], it.at[1], it.r, it.y ?? 0, (it.y ?? 0) + 1.6);
  }
}
STYLES.life.elements.hz_street_set = streetSet;

// ── where things go ───────────────────────────────────────────────────────────────────────────────────────
const CLOTH = ['cloth_indigo', 'cloth_white', 'cloth_grey', 'cloth_brown', 'cloth_white', 'cloth_black', 'cloth_green'];
const GOOD = ['cloth_red', 'cloth_ochre', 'cloth_green', 'cloth_white'];
const y0 = LEVEL.street;
const inDisc = (p, m = 24) => Math.hypot(p[0], p[1]) < RADIUS - m;
const faceTo = ([dx, dz]) => Math.atan2(-dx, -dz);

let STREET_RECTS = null;
function streetRects() { return STREET_RECTS ??= streetEntries(); }
/** Is (x, z) clear: not in a house's lot, and no street but `host` within `m`. */
function clear(p, host, m = 3.5) {
  if (inLot(p[0], p[1], 0.4)) return false;
  for (const e of streetRects()) { if (e === host) continue; const r = e.r, dx = Math.max(r[0] - p[0], 0, p[0] - r[2]), dz = Math.max(r[1] - p[1], 0, p[1] - r[3]); if (Math.hypot(dx, dz) < m && e.kind !== 'canal') return false; }
  return true;
}

/** The street's plans. base(id, elements, style) is town.js's plan maker. */
export function streetPlans(base) {
  const rand = rng(1177), pick = (a) => a[Math.floor(rand() * a.length)], seed = () => Math.floor(rand() * 1e9);
  const tiles = new Map();
  const put = (e) => { const k = `${Math.floor(e.at[0] / 100)},${Math.floor(e.at[1] / 100)}`; if (!tiles.has(k)) tiles.set(k, []); tiles.get(k).push(e); };
  // items go into one hz_street_set per tile; the rest are plain life elements
  const sets = new Map();
  const item = (it) => { const k = `${Math.floor(it.at[0] / 100)},${Math.floor(it.at[1] / 100)}`; if (!sets.has(k)) sets.set(k, []); sets.get(k).push(it); };
  const person = (at, y, rot, extra = {}) => put({ t: 'figure', at, y, rot, seed: seed(), dress: rand() < 0.7 ? 'robe' : 'trousers', cloth: pick(CLOTH), cloth2: pick(CLOTH), skin: rand() < 0.75 ? 'skin_light' : 'skin_medium', hat: pick(['none', 'cap', 'cap', 'straw']), carry: 'none', ...extra });
  const iw = imperialRects();
  const onWay = (p) => iw.some((r) => p[0] > r[0] - 2 && p[0] < r[2] + 2 && p[1] > r[1] && p[1] < r[3]);
  // the Way's own width is kept free in its middle: the king's way, 4 m, is not built on
  const sedanAt = (p, rot, host) => {
    item({ u: 'sedan', at: p, y: y0, rot, mats: { c: pick(['cloth_green', 'cloth_indigo', 'cloth_ochre', 'cloth_red']) }, r: 0.8 });
    const dx = Math.cos(rot), dz = -Math.sin(rot);   // along the poles' end: local +x of the chair → world
    void host;
    const b = [p[0] + Math.sin(rot) * 2.3 + dx * 0.4, p[1] + Math.cos(rot) * 2.3 + dz * 0.4];
    for (const s of [-0.3, 0.3]) person([b[0] + dx * s, b[1] + dz * s], y0, rot + Math.PI + (rand() - 0.5) * 0.6, { pose: 'sit', dress: 'trousers', cloth: pick(['cloth_brown', 'cloth_grey', 'cloth_indigo']), hat: pick(['none', 'cap']) });
    item({ u: 'stoolpair', at: [b[0] + dx * 0.0, b[1] + dz * 0.0], y: y0, rot: rot + Math.PI / 2 });
  };

  // ---- each shop front ----
  for (const l of lots()) {
    const F = frontOf(l), at0 = F.P(0.5, 0);
    if (!inDisc(at0, 20)) continue;
    const R = rng(l.seed * 3 + 11), r = () => R(), pk = (a) => a[Math.floor(r() * a.length)];
    const way = onWay(F.P(0.5, 3)), where = l.where || (way ? 'imperial' : 'lane');
    const rich = way ? 1 : where === 'canal' || (!l.where && F.n[1] > 0 && l.rect[3] > 120) ? 0.7 : l.detail >= 1 ? 0.45 : 0.25;
    const out = F.n, P = F.P, rot = F.rot, along = [out[1], -out[0]];   // along: the front's direction
    const W = F.L;
    if (l.shop) {
      const trade = l.trade || tradeOf(l);
      // lanterns hung at the front (the night market's: lit at night)
      if (W > 3.4 && r() < 0.4 + 0.5 * rich) for (const t of [0.27, 0.73]) put({ t: 'hang_lantern', at: P(t, -0.15), y: y0 + 2.95, rot, kind: r() < 0.85 ? 'paper' : 'white', seed: 1 });
      // by trade
      if (trade === 'tea' && W > 4.5 && r() < 0.9) {
        item({ u: 'kettlestove', at: P(r() < 0.5 ? 0.14 : 0.86, 1.25), y: y0, rot, r: 0.6 });
        if (r() < 0.6 + 0.3 * rich) { const c = P(0.5, 2.9); put({ t: 'tea_table', at: c, c, r: 1.1, y: y0, rot, seed: seed() }); for (const [dx, dz] of [[0.85, 0], [-0.85, 0], [0, 0.85]]) if (r() < 0.7) person([c[0] + dx, c[1] + dz], y0, faceTo([-dx, -dz]), { pose: 'sit', dress: 'robe', hat: pk(['cap', 'none']) }); }
      } else if (trade === 'wine' && W > 3.2) {
        item({ u: 'jarheap', at: P(r() < 0.5 ? 0.1 : 0.9, 1.0), y: y0, rot: rot + (r() - 0.5), mats: { c: 'cloth_red' }, r: 0.5 });
      } else if (trade === 'food' && W > 3.2) {
        const c = P(0.5 + (r() - 0.5) * 0.3, 2.5); put({ t: 'tea_table', at: c, c, r: 1.1, y: y0, rot, seed: seed() });
        for (const [dx, dz] of [[0.85, 0], [-0.85, 0]]) if (r() < 0.7) person([c[0] + dx, c[1] + dz], y0, faceTo([-dx, -dz]), { pose: 'sit', dress: 'robe' });
      } else if (trade === 'medicine' && r() < 0.7) put({ t: 'drying_tray', at: P(0.2 + r() * 0.6, 1.9), y: y0, rot: r() * 6.28, seed: seed() });
      else if ((trade === 'wares' || trade === 'pawn') && r() < 0.8) item({ u: 'jarheap', at: P(0.15 + r() * 0.7, 1.7), y: y0, rot, mats: { c: 'cloth_white' } });
      else if (trade === 'flowers') for (let k = 0; k < 3; k++) item({ u: pk(['planter', 'planter3', 'planter2']), at: P(0.15 + k * 0.3 + r() * 0.1, 1.9 + r() * 0.5), y: y0, rot: r() * 6, k: 0.9 + r() * 0.3 });
      // the potted plants beside the door
      if (r() < 0.25 + 0.55 * rich && W > 3.4) for (const t of [0.04 + r() * 0.04, 0.96 - r() * 0.04]) if (r() < 0.75) item({ u: pk(['planter', 'planter', 'planter2', 'planter3']), at: P(t, 1.1 + r() * 0.3), y: y0, rot: r() * 6, k: 0.85 + r() * 0.35 });
      // a bench by the door, someone sitting on it
      if (W > 3.6 && r() < 0.18 + 0.25 * rich) { const t = 0.2 + r() * 0.6, c = P(t, 2.0); put({ t: 'bench', at: c, y: y0, rot: rot + Math.PI, len: 1.5, seed: seed() }); if (r() < 0.6) person([c[0] + along[0] * 0.3, c[1] + along[1] * 0.3], y0, faceTo(out), { pose: 'sit', dress: 'robe', hat: pk(['cap', 'none']), cloth: pk(['cloth_grey', 'cloth_indigo', 'cloth_black']) }); }
      // a shopkeeper at the door, a customer, two talking
      if (W > 4 && r() < 0.25 + 0.35 * rich) person(P(0.3 + r() * 0.4, 0.5), y0, faceTo(out), { pose: 'stand', dress: 'robe', cloth: 'cloth_white', cloth2: 'cloth_black', hat: 'cap' });
      if (r() < 0.2 + 0.3 * rich) { const c = P(0.2 + r() * 0.6, 2.4); for (let q = 0; q < 2; q++) person([c[0] + along[0] * (q - 0.5) * 0.9, c[1] + along[1] * (q - 0.5) * 0.9], y0, faceTo([along[0] * (q ? 1 : -1) * 0.3 + out[0], along[1] * (q ? 1 : -1) * 0.3 + out[1]]) + Math.PI, { pose: q ? 'stand' : 'talk', carry: r() < 0.3 ? 'basket' : 'none' }); }
    } else {
      // homes: a pot or two, a basket, firewood, a bucket, now and then a bench or a dog
      if (r() < 0.55) put({ t: 'pot', kind: pk(['glazed_jar', 'water_pot', 'dark_pot', 'blue_jar']), at: P(0.1 + r() * 0.8, 0.7), y: y0, rot: r() * 6.28, n: 1 + Math.floor(r() * 2), seed: seed() });
      if (r() < 0.35) put({ t: 'firewood', at: P(r() < 0.5 ? 0.12 : 0.88, 0.5), y: y0, rot, len: 1.2, seed: seed() });
      if (r() < 0.45) item({ u: pk(['planter', 'planter2', 'planter3']), at: P(0.2 + r() * 0.6, 0.9), y: y0, rot: r() * 6, k: 0.9 + r() * 0.3 });
      if (r() < 0.2) put({ t: 'basket', at: P(0.3 + r() * 0.4, 0.8), y: y0, rot: r() * 6.28, n: 1 + Math.floor(r() * 2), seed: seed() });
      if (r() < 0.12) put({ t: 'animal', kind: pk(['dog', 'cat']), at: P(0.2 + r() * 0.6, 1.2), y: y0, rot: r() * 6.28, seed: seed() });
      if (r() < 0.1) person(P(0.3 + r() * 0.4, 1.2), y0, faceTo(out), { pose: 'squat', dress: 'robe', woman: true, hat: 'none' });
    }
    // washing out of an upper window
    if (l.storeys > 1 && r() < (way ? 0.1 : where === 'canal' ? 0.4 : 0.25)) put({ t: 'laundry_pole', at: P(0.25 + r() * 0.5, -0.5), y: y0 + 4.95, rot, len: 1.6, prop: false, seed: seed() });
  }

  // ---- the streets: lamp posts, hawkers, sedan chairs, stalls ----
  for (const e of streetRects()) {
    const [x0, z0, x1, z1] = e.r, horiz = x1 - x0 > z1 - z0, len = horiz ? x1 - x0 : z1 - z0, width = horiz ? z1 - z0 : x1 - x0;
    const isWay = iw.some((q) => q[0] === x0 && q[1] === z0 && q[2] === x1 && q[3] === z1);
    if (e.kind === 'road' || e.kind === 'canal' && false) continue;
    if (width < 5.5 || len < 12) continue;
    // a point at s along the street, d in from edge `side` (-1: the low edge, 1: the high edge); out: its direction into the street
    const pt = (s, d, side) => (horiz ? [x0 + s, side < 0 ? z0 + d : z1 - d] : [side < 0 ? x0 + d : x1 - d, z0 + s]);
    const outDir = (side) => (horiz ? [0, -side] : [-side, 0]);
    const step = isWay ? 5.5 : e.kind === "canal" ? 11 : 17, dens = isWay ? 1 : e.kind === 'canal' ? 0.8 : e.kind === 'lane-ns' ? 0.45 : 0.55;
    for (let s = 5 + rand() * step; s < len - 4; s += step * (0.6 + rand() * 0.8)) {
      const side = rand() < 0.5 ? -1 : 1, d = 1.9 + rand() * 0.9, p = pt(s, d, side), o = outDir(side), rot = Math.atan2(o[0], o[1]);
      if (!inDisc(p, 30) || !clear(p, e)) continue;
      if (e.kind === 'canal' && side === (horiz ? 1 : (x1 > 140 ? -1 : 1)) && false) continue;
      const tIn = (a) => (horiz ? [Math.cos(0), 0] : [0, 1]);
      void tIn;
      const k = rand();
      if (k > dens) continue;
      const alongV = horiz ? [1, 0] : [0, 1];
      const q = rand();
      if (q < 0.26) { item({ u: 'hawkpole', at: p, y: y0, rot: horiz ? 0 : Math.PI / 2, mats: { g: pick(GOOD), h: pick(GOOD) } }); person([p[0] + o[0] * 0.2 + alongV[0] * 0.2, p[1] + o[1] * 0.2 + alongV[1] * 0.2 + (horiz ? 0.5 * o[1] : 0)], y0, faceTo(o), { pose: 'squat', dress: 'trousers', hat: pick(['straw', 'none']), cloth: pick(['cloth_brown', 'cloth_grey', 'cloth_indigo']) }); }
      else if (q < 0.42) { item({ u: 'teastall', at: p, y: y0, rot, r: 0.9 }); person([p[0] + o[0] * 0.2, p[1] + o[1] * 0.2], y0, faceTo(o) + Math.PI, { pose: 'stand', dress: 'robe', cloth: 'cloth_white', hat: 'cap' }); }
      else if (q < 0.54 && (isWay || e.kind === 'canal')) sedanAt([p[0], p[1]], horiz ? Math.PI / 2 + (rand() < 0.5 ? 0 : Math.PI) : (rand() < 0.5 ? 0 : Math.PI), e);
      else if (q < 0.68) { put({ t: 'stall', at: p, y: y0, rot, w: 2.2 + rand() * 0.8, d: 1.3, awning: pick(['cloth_white', 'cloth_indigo', 'cloth_ochre', 'cloth_white']), stripe: rand() < 0.4 ? pick(['cloth_red', 'cloth_indigo']) : undefined, goods: pick([['produce', 'basket'], ['dark_pot', 'water_pot', 'basket'], ['cloth', 'basket'], ['produce', 'produce', 'basket']]), seed: seed() }); person([p[0] - o[0] * 0.5, p[1] - o[1] * 0.5], y0, faceTo(o), { pose: 'stand', dress: pick(['robe', 'trousers']), hat: pick(['none', 'cap']) }); if (rand() < 0.6) person([p[0] + o[0] * 1.6, p[1] + o[1] * 1.6], y0, faceTo([-o[0], -o[1]]), { pose: rand() < 0.5 ? 'talk' : 'stand', carry: rand() < 0.3 ? 'basket' : 'none' }); }
      else if (q < 0.78) put({ t: 'goods_mat', at: p, y: y0, rot, goods: pick([['heap', 'baskets'], ['pottery', 'baskets'], ['bolts', 'heap']]), seed: seed() });
      else if (q < 0.88) put({ t: 'handcart', at: p, y: y0, rot: horiz ? Math.PI / 2 : 0, seed: seed() });
      else if (q < 0.94) put({ t: 'animal', kind: pick(['dog', 'dog', 'cat']), at: p, y: y0, rot: rand() * 6.28, seed: seed() });
      else put({ t: 'chickens', at: p, y: y0, rot: rand() * 6.28, seed: seed() });
    }
    // the night market's lamp posts along the Way (lanterns at the shop aprons' edge), every ~11 m both sides
    if (isWay && len > 20) for (const side of [-1, 1]) for (let s = 6 + (side > 0 ? 5 : 0); s < len - 5; s += 11) {
      const p = pt(s, 3.1, side); if (!clear(p, e, 4)) continue;
      const o = outDir(side);
      put({ t: 'lantern', at: p, y: y0, rot: Math.atan2(o[0], o[1]) + Math.PI / 2, kind: 'paper', h: 2.7, seed: 1 });
    }
    // the way's night-market string of lanterns on stands, one to a block, a pair of tea-stands where lanes meet: lampstands in the middle of each flank
    if (isWay && len > 30) for (const side of [-1, 1]) for (let s = 12; s < len - 8; s += 33) { const p = pt(s + (side > 0 ? 9 : 0), 4.2, side); if (clear(p, e, 4)) item({ u: 'lampstand', at: p, y: y0, rot: Math.atan2(...outDir(side)) + (horiz ? 0 : -Math.PI / 2) }); }
  }

  // ---- the canal banks: the boatmen's gear along both banks of the canal ----
  const banks = [[CANAL.x0 - 0.9, -1, Math.PI / 2], [CANAL.x1 + 0.9, 1, -Math.PI / 2]];
  for (const [x, side, rot] of banks) {
    for (let z = CANAL.z0 + 14 + rand() * 6; z < CANAL.z1 - 26; z += 7 + rand() * 7) {
      if (CANAL_BRIDGES.some((b) => Math.abs(b - z) < 11) || Math.abs(z - CITY.zs) < 16 || Math.abs(z - CITY.zn) < 16) continue;
      const p = [x + (rand() - 0.5) * 0.3, z];
      if (!inDisc(p, 30)) continue;
      const toWater = rot + Math.PI, k = rand();
      if (k < 0.2) item({ u: 'netrack', at: [x + side * -0.0 - side * 0.5, z], y: y0, rot: Math.PI / 2 + 0, r: 0.5 });
      else if (k < 0.34) item({ u: 'ropecoil', at: p, y: y0, rot: rand() * 6.28 });
      else if (k < 0.5) item({ u: 'bollard', at: [x + side * 0.2, z], y: y0, rot: 0, r: 0.25 });
      else if (k < 0.6) item({ u: 'plankpile', at: [x - side * 0.5, z], y: y0, rot: Math.PI / 2 });
      else if (k < 0.7) item({ u: 'polestack', at: [x - side * 0.6, z], y: y0, rot: rand() * 0.6 });
      else if (k < 0.8) item({ u: 'fishtrap', at: p, y: y0, rot: rand() * 6.28 });
      else if (k < 0.87) item({ u: 'sailroll', at: [x - side * 0.5, z], y: y0, rot: Math.PI / 2 + (rand() - 0.5) * 0.2 });
      else if (k < 0.94) { put({ t: 'sacks', at: p, y: y0, rot, n: 3 + Math.floor(rand() * 3), seed: seed() }); }
      else { put({ t: 'basket', at: p, y: y0, rot: rand() * 6, n: 2, goods: 'cloth_white', seed: seed() }); }
      void toWater;
      // a boatman by the gear: sitting, mending, smoking his pipe — Song: a hand with a rope
      if (rand() < 0.3) person([x - side * 1.3, z + (rand() - 0.5) * 1.5], y0, faceTo([side, 0]), { pose: pick(['sit', 'squat']), dress: 'trousers', hat: pick(['straw', 'none']), cloth: pick(['cloth_brown', 'cloth_grey', 'cloth_indigo']), skin: 'skin_medium' });
    }
  }

  // ---- the lake's landings (westlake.js: two timber jetties on the causeway's west side, boats moored along them) ----
  const jet = (x, z, rot) => ({ x, z, rot });
  void jet;
  for (const z of [-360, -350]) {
    const zc = z + 1.2, ya = 0.04;
    item({ u: 'oarrack', at: [14.5, zc - 0.35], y: ya, rot: 0 });
    item({ u: 'ropecoil', at: [9.5, zc + 0.3], y: ya, rot: 1 });
    for (const x of [5.0, 16.0]) item({ u: 'bollard', at: [x, zc], y: ya, r: 0.25 });
    item({ u: 'stoolpair', at: [11.5, zc - 0.5], y: ya, rot: 0 });
    person([11.2, zc - 0.5], ya, faceTo([0, 1]), { pose: 'sit', dress: 'trousers', hat: 'straw', cloth: 'cloth_brown', skin: 'skin_medium' });
    put({ t: 'basket', at: [7.4, zc - 0.5], y: ya, rot: 0.3, n: 2, seed: seed() });
  }
  // the pleasure boats' waiting shed on the bank: a tea stand, benches, a boatman calling
  item({ u: 'teastall', at: [20.5, -354.5], y: y0, rot: -Math.PI / 2, r: 0.9 });
  person([19.8, -354.5], y0, faceTo([1, 0]), { pose: 'stand', dress: 'robe', cloth: 'cloth_white', hat: 'cap' });
  put({ t: 'bench', at: [21.5, -352], y: y0, rot: -Math.PI / 2 + Math.PI, len: 1.5, seed: 3 }); put({ t: 'bench', at: [21.5, -357], y: y0, rot: Math.PI / 2 + Math.PI, len: 1.5, seed: 4 });
  put({ t: 'lantern', at: [22.0, -350], y: y0, rot: Math.PI / 2, kind: 'paper', h: 2.8, seed: 1 }); put({ t: 'lantern', at: [22.0, -360], y: y0, rot: Math.PI / 2, kind: 'paper', h: 2.8, seed: 1 });
  for (const q of [[22.5, -354.4, 1], [22.8, -355.7, -1]]) person([q[0], q[1]], y0, faceTo([-1, 0]), { pose: 'sit', dress: 'robe', hat: 'cap' });

  // ---- the plans, by tile ----
  const plans = [], keys = new Set([...tiles.keys(), ...sets.keys()]);
  for (const k of keys) {
    const [i, j] = k.split(',').map(Number), list = [...(tiles.get(k) || [])];
    if (sets.has(k)) list.unshift({ t: 'hz_street_set', at: [i * 100 + 50, j * 100 + 50], items: sets.get(k) });
    plans.push({ ...base(`song-hangzhou-street-${k}`, list, 'life'), center: [i * 100 + 50, j * 100 + 50], near: 230 });
  }
  return plans;
}
