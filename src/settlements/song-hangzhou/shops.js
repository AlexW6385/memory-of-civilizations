// Southern Song Lin'an's shop fronts (docs/settlements/song-hangzhou.md §15): what the town's
// shophouses lack — the coloured-silk gate frames (cailou huanmen) before the wine houses, the wine
// flags of blue-and-white cloth strips, the standing lantern signs, the signboards hung from the
// posts, and the goods of each trade out on the apron and on trestles: silk bolts and hung lengths
// (Lin'an's cloth shops), tea cakes and black tea bowls on lacquer stands, stitched books, the
// pharmacy's drug mill and drawers, round silk fans, lacquerware, flowers in stepped racks, incense
// and candles, steamed buns and noodles, wine in lidded jars.
//
// An element of the street life (`hz_shop`, one per shop, in style `life`): every piece goes in as an
// instance of a shape shared by all shops, so a street of shops costs matrices, not geometry.
// Local frame of a shop: x along the front, z out into the street, y up from the street.

import { box, lathe, fromTriangles, rod, hangFrom, windMat } from '../../core/geom.js';
import { placer, assembly, rng } from '../../objects/kit.js';
import { STYLES } from '../../core/build.js';
import '../../objects/index.js';

// ── the shapes (built once, shared by every shop) ─────────────────────────────────────────────────
const U = {}, DEF = {};
function unit(name, defaults, build) { DEF[name] = defaults; U[name] = assembly(`hz-shop|${name}`, build); }
const ly = (prof, seg = 10, x = 0, y = 0, z = 0) => lathe(prof, seg, null, x, y, z);
const drum = (r0, r1, h, seg, x, y, z) => ly([[0.001, 0], [r0, 0], [r1, h], [0.001, h]], seg, x, y, z);
const rodG = (a, b, r, seg = 6) => rod(a, b, r, seg);
const bowl = (x, y, z, k = 1) => ly([[0.001, 0], [0.036 * k, 0], [0.07 * k, 0.026 * k], [0.088 * k, 0.07 * k], [0.082 * k, 0.072 * k], [0.064 * k, 0.034 * k], [0.001, 0.014 * k]], 8, x, y, z);
const jar = (r, h, x, y, z) => ly([[0.001, 0], [r * 0.5, 0], [r, h * 0.22], [r * 1.12, h * 0.5], [r * 0.9, h * 0.78], [r * 0.55, h * 0.93], [r * 0.6, h], [0.001, h]], 10, x, y, z);
/** A thin cloth quad hanging from y = top: polygon of [x, y] points in the plane z = zc (both faces: a thin slab). */
function slab(poly, zc, th = 0.008) {
  const t = [], n = poly.length;
  for (let i = 1; i + 1 < n; i++) { t.push(poly[0][0], poly[0][1], zc + th, poly[i][0], poly[i][1], zc + th, poly[i + 1][0], poly[i + 1][1], zc + th); t.push(poly[0][0], poly[0][1], zc - th, poly[i + 1][0], poly[i + 1][1], zc - th, poly[i][0], poly[i][1], zc - th); }
  for (let i = 0; i < n; i++) { const p = poly[i], q = poly[(i + 1) % n]; t.push(p[0], p[1], zc - th, q[0], q[1], zc - th, q[0], q[1], zc + th, p[0], p[1], zc - th, q[0], q[1], zc + th, p[0], p[1], zc + th); }
  return fromTriangles(t);
}
const WINDY = new Set();
const windy = (name, role) => WINDY.add(`${name}.${role}`);

// the coloured-silk gate frame (cailou huanmen) of a wine house: two lacquered posts, a lintel, a second tier
// above it stepped in, the silk swags and drops hung in rows from both, tassels — Dongjing meng Hua lu: "门首皆缚彩楼欢门"
function huanmen(W) {
  const name = `huanmen${W}`;
  unit(name, { p: 'lacquer_red', c: 'cloth_red', w: 'cloth_white', g: 'gilt_bronze', t: 'timber' }, (a) => {
    const H = 3.9, h2 = 4.75, half = W / 2;
    for (const s of [-1, 1]) {
      a('p', box(s * half - 0.09, 0, -0.09, s * half + 0.09, H, 0.09));
      a('g', box(s * half - 0.12, 0, -0.12, s * half + 0.12, 0.1, 0.12));                           // the foot
      a('p', box(s * (half - 0.9) - 0.06, H, -0.06, s * (half - 0.9) + 0.06, h2, 0.06));            // the upper tier's posts
    }
    a('p', box(-half - 0.2, H - 0.16, -0.1, half + 0.2, H + 0.06, 0.1));                            // the lintel
    a('p', box(-half + 0.7, h2 - 0.12, -0.08, half - 0.7, h2 + 0.04, 0.08));
    a('t', box(-half + 0.85, h2 + 0.04, -0.05, half - 0.85, h2 + 0.1, 0.05));
    // bamboo laths binding the frame, the ridge ornament
    a('g', ly([[0.001, h2 + 0.1], [0.07, h2 + 0.1], [0.05, h2 + 0.3], [0.001, h2 + 0.45]], 8, 0, 0, 0));
    // the swags: a row of scallops hung along each lintel (one cloth piece each, swaying), with white drops between
    const draw = (x0, x1, y0, depth, role, n) => {
      for (let k = 0; k < n; k++) {
        const xa = x0 + (x1 - x0) * k / n, xb = x0 + (x1 - x0) * (k + 1) / n, xm = (xa + xb) / 2;
        const poly = [[xa, y0], [xb, y0], [xb - 0.03, y0 - depth * 0.55], [xm + 0.1, y0 - depth * 0.9], [xm, y0 - depth], [xm - 0.1, y0 - depth * 0.9], [xa + 0.03, y0 - depth * 0.55]];
        a(role, hangFrom(slab(poly, k % 2 ? 0.03 : 0.05), y0));
      }
    };
    draw(-half, half, H - 0.16, 0.55, 'c', Math.max(4, Math.round(W / 0.55)));
    draw(-half + 0.7, half - 0.7, h2 - 0.12, 0.42, 'c', Math.max(3, Math.round((W - 1.4) / 0.5)));
    for (let k = 0; k <= Math.round(W / 1.1); k++) { const x = -half + 0.3 + (W - 0.6) * k / Math.max(1, Math.round(W / 1.1)); a('w', hangFrom(slab([[x - 0.05, H - 0.16], [x + 0.05, H - 0.16], [x + 0.05, H - 1.25], [x, H - 1.4], [x - 0.05, H - 1.25]], -0.03), H - 0.16)); }
    for (const s of [-1, 1]) a('g', ly([[0.001, H - 0.45], [0.05, H - 0.5], [0.06, H - 0.62], [0.001, H - 0.7]], 8, s * (half - 0.2), 0, 0.0));        // tassels at the posts
  });
  for (const r of ['c', 'w']) windy(name, r);
  return name;
}
const HUANMEN = { 4: huanmen(4), 6: huanmen(6) };

// the pole with the wine flag (jiuqi): "several widths of blue and white cloth" (Rongzhai xubi); the flag long and narrow, three strips
unit('winepole', { p: 'bamboo_culm', s: 'granite_grey', a: 'cloth_indigo', b: 'cloth_white', w: 'timber' }, (a) => {
  a('s', box(-0.2, 0, -0.2, 0.2, 0.12, 0.2)); a('s', box(-0.15, 0.12, -0.15, 0.15, 0.3, 0.15));
  a('p', rodG([0, 0.3, 0], [0, 5.1, 0.1], 0.05, 8)); a('w', box(-0.03, 4.9, 0.08, 0.03, 4.96, 0.82));
  for (const y of [1.3, 2.5, 3.6]) a('p', box(-0.056, y - 0.012, -0.056 + y * 0.02, 0.056, y + 0.012, 0.056 + y * 0.02));
  const strips = [['a', 0.12], ['b', 0.32], ['a', 0.52]];
  for (const [r, z0] of strips) a(r, hangFrom(slab([[z0, 4.9], [z0 + 0.2, 4.9], [z0 + 0.2, 2.4], [z0 + 0.1, 2.25], [z0, 2.4]], 0, 0.006).rotateY(-Math.PI / 2), 4.9));
});
windy('winepole', 'a'); windy('winepole', 'b');

// the standing lantern sign (a box of oiled-paper panels with a hood, on two posts; candle-lit at night): Sun Yang's "three signs"
unit('lightbox', { f: 'lacquer_black', l: 'lamp_paper', r: 'tile_dark', s: 'granite_grey', g: 'gilt_bronze' }, (a) => {
  a('s', box(-0.34, 0, -0.2, 0.34, 0.14, 0.2));
  for (const x of [-0.26, 0.26]) a('f', box(x - 0.035, 0.14, -0.035, x + 0.035, 1.35, 0.035));
  a('f', box(-0.3, 0.55, -0.08, 0.3, 0.6, 0.08)); a('f', box(-0.3, 1.5, -0.08, 0.3, 1.55, 0.08));
  a('l', box(-0.26, 0.6, -0.055, 0.26, 1.5, 0.055));
  for (const y of [0.9, 1.2]) a('f', box(-0.26, y - 0.01, -0.058, 0.26, y + 0.01, 0.058));
  for (const x of [-0.26, 0.26]) a('f', box(x - 0.02, 0.6, -0.06, x + 0.02, 1.5, 0.06));
  a('r', box(-0.36, 1.55, -0.16, 0.36, 1.6, 0.16)); a('r', box(-0.28, 1.6, -0.1, 0.28, 1.68, 0.1)); a('g', box(-0.03, 1.68, -0.03, 0.03, 1.78, 0.03));
});
// the signboard hung from a bracket on the post
unit('hsign', { w: 'timber', b: 'lacquer_black', f: 'gilt_bronze', t: 'cloth_red' }, (a) => {
  a('w', box(-0.03, 0, 0, 0.03, 0.07, 0.9)); a('w', rodG([0, -0.4, 0.04], [0, 0.0, 0.58], 0.02, 6));
  a('b', box(-0.018, -1.3, 0.62, 0.018, -0.2, 0.9));
  for (const [y0, y1] of [[-1.34, -1.27], [-0.23, -0.16]]) a('f', box(-0.045, y0, 0.6, 0.045, y1, 0.92));
  for (const z of [0.62, 0.89]) a('f', box(-0.045, -1.34, z - 0.03, 0.045, -0.16, z + 0.03));
  for (const z of [0.69, 0.76, 0.83]) a('t', rodG([0, -1.3, z], [0, -1.52 - (z === 0.76 ? 0.08 : 0), z], 0.01, 4));
});

// silk: trestle with stacked bolts in three colours, and a rack with lengths hung to show the weave
unit('silk', { w: 'timber', c1: 'cloth_red', c2: 'cloth_ochre', c3: 'cloth_indigo' }, (a) => {
  for (const x of [-0.55, 0.55]) a('w', box(x - 0.03, 0, -0.2, x + 0.03, 0.8, 0.2));
  a('w', box(-0.6, 0.8, -0.24, 0.6, 0.85, 0.24));
  const roles = ['c1', 'c2', 'c3', 'c2', 'c1', 'c3'];
  for (let k = 0; k < 6; k++) { const x = -0.45 + (k % 3) * 0.45, y = 0.85 + Math.floor(k / 3) * 0.17; a(roles[k], ly([[0.001, -0.3], [0.08, -0.3], [0.08, 0.3], [0.001, 0.3]], 8).rotateX(Math.PI / 2).translate(x, y + 0.08, 0)); }
});
unit('silkrack', { w: 'timber', c1: 'cloth_red', c2: 'cloth_white', c3: 'cloth_green', g: 'cloth_ochre' }, (a) => {
  for (const x of [-0.7, 0.7]) a('w', box(x - 0.03, 0, -0.03, x + 0.03, 2.2, 0.03));
  a('w', box(-0.74, 2.14, -0.04, 0.74, 2.2, 0.04));
  const lens = [['c1', 1.5], ['c2', 1.2], ['g', 1.7], ['c3', 1.35], ['c1', 1.1]];
  lens.forEach(([r, h], k) => { const x = -0.54 + k * 0.27; a(r, hangFrom(slab([[x - 0.11, 2.14], [x + 0.11, 2.14], [x + 0.11, 2.14 - h], [x - 0.11, 2.14 - h]], 0.0, 0.006), 2.14)); });
});
for (const r of ['c1', 'c2', 'c3', 'g']) windy('silkrack', r);

// tea: cakes of tea stacked, black tea bowls on lacquer stands (zhan tuo) on a table, a brazier with an ewer, a lidded jar
unit('tea', { t: 'lacquer_chestnut', r: 'lacquer_red', k: 'lacquer_black', c: 'cloth_brown', i: 'iron', e: 'bronze', j: 'glaze_white' }, (a) => {
  a('t', box(-0.6, 0.7, -0.28, 0.6, 0.75, 0.28)); for (const sx of [-1, 1]) for (const sz of [-1, 1]) a('t', box(sx * 0.55 - 0.025, 0, sz * 0.23 - 0.025, sx * 0.55 + 0.025, 0.7, sz * 0.23 + 0.025));
  for (let k = 0; k < 3; k++) for (let m = 0; m < 4; m++) a('c', box(-0.55 + m * 0.11, 0.75 + k * 0.03, -0.14, -0.46 + m * 0.11, 0.78 + k * 0.03, 0.0));
  for (const x of [-0.05, 0.12, 0.29]) { a('r', ly([[0.001, 0], [0.05, 0], [0.065, 0.025], [0.04, 0.05], [0.015, 0.045], [0.001, 0.04]], 8, x, 0.75, 0.05)); a('k', bowl(x, 0.79, 0.05, 0.9)); }
  a('i', box(0.34, 0.75, -0.2, 0.52, 0.9, -0.02)); a('e', ly([[0.001, 0], [0.07, 0], [0.09, 0.08], [0.06, 0.16], [0.03, 0.18], [0.001, 0.18]], 9, 0.43, 0.9, -0.11)); a('e', rodG([0.51, 1.0, -0.11], [0.57, 1.06, -0.11], 0.012, 4));
  a('j', jar(0.1, 0.28, -0.4, 0.75, 0.15));
});
// a stepped rack of potted flowers and pines (Mengliang lu: "flower racks with rare pines and junipers"), flowers in buckets
unit('flowers', { w: 'timber', g: 'glaze_green', l: 'bark_pine', f1: 'cloth_red', f2: 'cloth_white', f3: 'cloth_ochre' }, (a) => {
  for (let s = 0; s < 3; s++) { a('w', box(-0.6 + s * 0.12, s * 0.38, -0.3 + s * 0.2, 0.6 - s * 0.12, s * 0.38 + 0.04, -0.1 + s * 0.2)); a('w', box(-0.6 + s * 0.12, 0, -0.3 + s * 0.2, -0.57 + s * 0.12, s * 0.38, -0.1 + s * 0.2)); a('w', box(0.57 - s * 0.12, 0, -0.3 + s * 0.2, 0.6 - s * 0.12, s * 0.38, -0.1 + s * 0.2)); }
  const ff = ['f1', 'f2', 'f3'];
  for (let s = 0; s < 3; s++) for (let k = 0; k < 4 - s; k++) {
    const x = -0.42 + s * 0.12 + k * (0.84 - s * 0.24) / Math.max(1, 3 - s), y = s * 0.38 + 0.04, z = -0.2 + s * 0.2;
    a('g', ly([[0.001, 0], [0.06, 0], [0.08, 0.04], [0.085, 0.13], [0.07, 0.15], [0.001, 0.14]], 8, x, y, z));
    a('l', rodG([x, y + 0.13, z], [x + 0.02 * (k - 1), y + 0.3 + 0.05 * s, z], 0.012, 4));
    a(ff[(s + k) % 3], ly([[0.001, 0.22], [0.09, 0.28], [0.1, 0.33], [0.001, 0.4]], 7, x + 0.02 * (k - 1), y + 0.1, z));
  }
});
// books: a case of stitched volumes (white paper, blue-cloth covers) on a table, a few open on a stand
unit('books', { t: 'timber', p: 'paint_white', c: 'cloth_indigo', b: 'cloth_brown' }, (a) => {
  a('t', box(-0.6, 0.7, -0.3, 0.6, 0.75, 0.3)); for (const sx of [-1, 1]) for (const sz of [-1, 1]) a('t', box(sx * 0.55 - 0.025, 0, sz * 0.25 - 0.025, sx * 0.55 + 0.025, 0.7, sz * 0.25 + 0.025));
  for (let r = 0; r < 3; r++) for (let k = 0; k < 4; k++) { const x = -0.5 + k * 0.27, y = 0.75 + r * 0.075; a(k % 2 ? 'c' : 'b', box(x, y, -0.2, x + 0.24, y + 0.07, 0.02)); a('p', box(x + 0.01, y + 0.005, 0.02, x + 0.23, y + 0.065, 0.026)); }
});
// the pharmacy: a drawer cabinet (baizi chu), a boat-shaped drug mill with its iron wheel, jars, a hung bunch of herbs
unit('medicine', { t: 'lacquer_chestnut', i: 'iron', j: 'pottery_dark', h: 'thatch', k: 'lacquer_black' }, (a) => {
  a('t', box(-0.55, 0, -0.2, 0.55, 1.2, 0.0));
  for (let r = 0; r < 6; r++) for (let k = 0; k < 8; k++) { const x = -0.5 + k * 0.125, y = 0.06 + r * 0.19; a('k', box(x, y, 0.0, x + 0.11, y + 0.17, 0.012)); a('i', box(x + 0.045, y + 0.08, 0.012, x + 0.065, y + 0.1, 0.02)); }
  a('i', box(0.65, 0.3, -0.12, 1.25, 0.42, 0.12)); a('i', box(0.62, 0.42, -0.14, 0.68, 0.5, 0.14)); a('i', box(1.22, 0.42, -0.14, 1.28, 0.5, 0.14));
  a('i', ly([[0.001, 0.0], [0.22, 0.0], [0.22, 0.04], [0.001, 0.04]], 14).rotateX(Math.PI / 2).translate(0.95, 0.55, 0.0)); a('i', rodG([0.95, 0.55, -0.05], [0.95, 0.55, 0.05], 0.02, 5));
  for (const x of [0.7, 1.15]) a('t', box(x - 0.03, 0, -0.1, x + 0.03, 0.3, 0.1));
  a('j', jar(0.1, 0.3, 1.1, 0.0, 0.2)); a('j', jar(0.09, 0.26, 0.85, 0.0, 0.24));
  for (const x of [-0.3, 0, 0.3]) a('h', ly([[0.001, -0.35], [0.06, -0.3], [0.09, -0.15], [0.001, 0.0]], 6, x, 2.0, 0.1));
});
// fans: a rack of round silk fans (tuanshan) with their bamboo handles, a stack of paper fans
unit('fans', { c: 'paint_white', w: 'bamboo_culm', r: 'cloth_red', t: 'timber', g: 'cloth_green' }, (a) => {
  a('t', box(-0.55, 0, -0.1, 0.55, 0.05, 0.1)); for (const x of [-0.53, 0.53]) a('t', box(x - 0.02, 0, -0.1, x + 0.02, 1.15, 0.1)); a('t', box(-0.55, 1.11, -0.1, 0.55, 1.15, 0.1));
  for (let k = 0; k < 4; k++) for (let m = 0; m < 2; m++) {
    const x = -0.38 + k * 0.25, y = 0.78 + m * 0.2 - 0.0;
    a(k % 2 ? 'c' : 'g', ly([[0.001, 0], [0.11, 0], [0.11, 0.012], [0.001, 0.012]], 10).rotateX(Math.PI / 2).translate(x, y, 0.0));
    a('r', ly([[0.11, 0.0], [0.116, 0.0], [0.116, 0.014], [0.11, 0.014]], 10).rotateX(Math.PI / 2).translate(x, y, 0.0)); a('w', rodG([x, y - 0.2, 0.0], [x, y - 0.1, 0.0], 0.01, 4));
  }
});
// lacquerware: boxes, trays and bowls in red and black lacquer
unit('lacquer', { r: 'lacquer_red', k: 'lacquer_black', g: 'gilt_bronze', t: 'timber' }, (a) => {
  a('t', box(-0.6, 0.62, -0.28, 0.6, 0.67, 0.28)); for (const sx of [-1, 1]) for (const sz of [-1, 1]) a('t', box(sx * 0.55 - 0.025, 0, sz * 0.23 - 0.025, sx * 0.55 + 0.025, 0.62, sz * 0.23 + 0.025));
  for (const [x, z, w, h] of [[-0.4, 0, 0.36, 0.2], [0.05, 0.05, 0.3, 0.26], [0.45, -0.04, 0.24, 0.18]]) { a('r', box(x - w / 2, 0.67, z - w / 2, x + w / 2, 0.67 + h, z + w / 2)); a('k', box(x - w / 2 - 0.01, 0.67 + h, z - w / 2 - 0.01, x + w / 2 + 0.01, 0.71 + h, z + w / 2 + 0.01)); a('g', box(x - w / 2 + 0.03, 0.67 + h * 0.35, z + w / 2, x + w / 2 - 0.03, 0.67 + h * 0.65, z + w / 2 + 0.006)); }
  for (const [x, z, n] of [[-0.18, 0.2, 2], [0.28, 0.22, 2]]) for (let k = 0; k < n; k++) a('k', bowl(x, 0.67 + k * 0.05, z, 1.15));
});
// incense and candles: bundles of sticks in a rack, coiled incense hung, candles in a box, a burner
unit('incense', { t: 'timber', s: 'bamboo_culm', c: 'cloth_red', b: 'bronze', w: 'paint_white', k: 'thatch' }, (a) => {
  a('t', box(-0.5, 0.7, -0.25, 0.5, 0.75, 0.25)); for (const sx of [-1, 1]) for (const sz of [-1, 1]) a('t', box(sx * 0.46 - 0.025, 0, sz * 0.2 - 0.025, sx * 0.46 + 0.025, 0.7, sz * 0.2 + 0.025));
  for (let k = 0; k < 5; k++) { const x = -0.38 + k * 0.17; a(k % 2 ? 'c' : 'k', drum(0.04, 0.04, 0.26, 8, x, 0.75, 0.0)); for (let m = 0; m < 3; m++) a('s', rodG([x + (m - 1) * 0.015, 0.99, 0.0], [x + (m - 1) * 0.03, 1.12, 0.0], 0.004, 3)); }
  a('b', ly([[0.001, 0], [0.07, 0], [0.1, 0.07], [0.12, 0.1], [0.1, 0.12], [0.001, 0.11]], 10, 0.35, 0.75, 0.15));
  for (let k = 0; k < 6; k++) a('w', rodG([-0.3 + k * 0.025, 0.75, 0.17], [-0.3 + k * 0.025, 0.92, 0.17], 0.008, 4));
  for (const x of [-0.25, 0.1]) a('k', ly([[0.001, -0.02], [0.14, -0.04], [0.15, -0.14], [0.001, -0.2]], 10, x, 2.2, 0.1));
});
// the bun stall: a stove with stacked bamboo steamers, bowls, a basket of buns
unit('buns', { b: 'brick_grey', i: 'iron', w: 'wicker', l: 'bamboo_culm', c: 'glaze_white', e: 'bronze' }, (a) => {
  a('b', box(-0.4, 0, -0.3, 0.4, 0.62, 0.3)); a('b', box(-0.12, 0.62, 0.18, 0.12, 1.25, 0.3));
  a('i', drum(0.3, 0.32, 0.12, 12, 0, 0.62, -0.02));
  for (let k = 0; k < 4; k++) { a('w', drum(0.29, 0.29, 0.1, 10, 0, 0.74 + k * 0.1, -0.02)); a('w', ly([[0.292, 0.77 + k * 0.1], [0.3, 0.78 + k * 0.1], [0.292, 0.79 + k * 0.1]], 14, 0, 0, -0.02)); }
  a('l', ly([[0.001, 1.14], [0.31, 1.14], [0.28, 1.18], [0.001, 1.24]], 12, 0, 0, -0.02));
  for (const [x, z] of [[-0.62, 0.0], [-0.62, 0.17], [-0.62, -0.17]]) a('c', bowl(x, 0, z, 1.1));
  a('e', ly([[0.001, 0], [0.12, 0], [0.14, 0.1], [0.08, 0.2], [0.001, 0.22]], 9, 0.62, 0.0, -0.04));
});
// noodles: a great pot on a hearth, a stack of bowls, hanging ladles, stools
unit('noodles', { b: 'brick_grey', i: 'iron', c: 'glaze_white', t: 'timber', w: 'cloth_white' }, (a) => {
  a('b', box(-0.45, 0, -0.35, 0.45, 0.55, 0.35)); a('i', ly([[0.001, 0.4], [0.34, 0.5], [0.4, 0.72], [0.38, 0.74], [0.001, 0.52]], 14, 0, 0.0, 0.0));
  a('b', box(-0.14, 0.55, 0.2, 0.14, 1.3, 0.35));
  for (let k = 0; k < 6; k++) a('c', bowl(0.72, k * 0.06, 0.0, 1.15));
  a('t', box(-0.8, 0.9, -0.3, -0.5, 0.94, 0.3)); for (const z of [-0.26, 0.26]) a('i', rodG([-0.65, 0.9, z], [-0.65, 1.2, z], 0.012, 4));
  for (const [x, z] of [[-0.9, 0.5], [0.0, 0.6]]) { a('t', box(x - 0.17, 0.38, z - 0.17, x + 0.17, 0.42, z + 0.17)); for (const dx of [-0.13, 0.13]) for (const dz of [-0.13, 0.13]) a('t', box(x + dx - 0.02, 0, z + dz - 0.02, x + dx + 0.02, 0.38, z + dz + 0.02)); }
});
// wine: lidded jars in a row with red cloth lids, wine measures on a counter
unit('winejars', { j: 'pottery_dark', c: 'cloth_red', t: 'timber', g: 'glaze_white' }, (a) => {
  for (let k = 0; k < 5; k++) { const x = -0.6 + k * 0.3, r = 0.14 + (k % 2) * 0.02; a('j', jar(r, 0.5, x, 0, 0)); a('c', ly([[0.001, 0.5], [r * 0.7, 0.5], [r * 0.72, 0.56], [0.001, 0.6]], 8, x, 0, 0)); }
  a('t', box(-0.7, 0.58, 0.28, 0.7, 0.62, 0.58)); for (const x of [-0.65, 0.65]) a('t', box(x - 0.02, 0, 0.3, x + 0.02, 0.58, 0.56));
  for (let k = 0; k < 4; k++) a('g', ly([[0.001, 0], [0.04, 0], [0.05, 0.12], [0.03, 0.2], [0.02, 0.24], [0.001, 0.24]], 8, -0.4 + k * 0.25, 0.62, 0.43));
});
// hardware and pottery: pots, pans, ironware on a table (a shop of daily wares)
unit('wares', { t: 'timber', i: 'iron', p: 'pottery_dark', g: 'glaze_blue' }, (a) => {
  a('t', box(-0.6, 0.5, -0.28, 0.6, 0.55, 0.28)); for (const sx of [-1, 1]) for (const sz of [-1, 1]) a('t', box(sx * 0.55 - 0.025, 0, sz * 0.23 - 0.025, sx * 0.55 + 0.025, 0.5, sz * 0.23 + 0.025));
  for (const x of [-0.4, 0.0, 0.4]) a('i', ly([[0.001, 0], [0.14, 0.02], [0.2, 0.1], [0.18, 0.12], [0.001, 0.04]], 10, x, 0.55, -0.1));
  for (let k = 0; k < 4; k++) a(k % 2 ? 'p' : 'g', jar(0.1, 0.24, -0.45 + k * 0.3, 0.55, 0.14));
});
// the trestle bench for loose goods and the stool
unit('basketpile', { w: 'wicker', g: 'cloth_ochre' }, (a) => {
  for (const [x, z, r, h] of [[-0.4, 0, 0.3, 0.24], [0.2, 0.1, 0.34, 0.26], [0.7, -0.05, 0.26, 0.2]]) { a('w', ly([[0.001, 0], [r * 0.85, 0], [r, h], [r * 0.95, h + 0.01], [r * 0.9, h - 0.02], [0.001, 0.02]], 10, x, 0, z)); a('g', ly([[0.001, h - 0.03], [r * 0.9, h - 0.03], [r * 0.6, h + 0.09], [0.001, h + 0.12]], 8, x, 0, z)); }
});
// the counter: where the shop's front is shut, a plank counter on trestles (the Qingming scroll's shops)
unit('counter', { t: 'timber', d: 'wood_dark' }, (a) => {
  a('t', box(-0.9, 0.85, -0.26, 0.9, 0.9, 0.26)); for (const x of [-0.85, 0.85]) a('d', box(x - 0.03, 0, -0.22, x + 0.03, 0.85, 0.22)); a('d', box(-0.85, 0.2, -0.02, 0.85, 0.24, 0.02));
});

// ── the shop: its parts, laid out by trade and by seed ────────────────────────────────────────────
/** The trades of Lin'an's streets and what each shows: [unit, materials]. */
export const GOODS = {
  silk: [['silkrack', {}], ['silk', { c1: 'cloth_red', c2: 'cloth_ochre', c3: 'cloth_indigo' }], ['silk', { c1: 'cloth_green', c2: 'cloth_white', c3: 'cloth_red' }]],
  tea: [['tea', {}], ['basketpile', { g: 'cloth_green' }]],
  books: [['books', {}], ['books', { c: 'cloth_brown', b: 'cloth_indigo' }]],
  medicine: [['medicine', {}]],
  fans: [['fans', {}], ['fans', { c: 'cloth_ochre', g: 'cloth_red' }]],
  lacquer: [['lacquer', {}], ['wares', {}]],
  wine: [['winejars', {}], ['winejars', {}]],
  food: [['buns', {}], ['noodles', {}]],
  incense: [['incense', {}], ['incense', {}]],
  flowers: [['flowers', {}], ['flowers', { f1: 'cloth_ochre', f2: 'cloth_red', f3: 'cloth_white' }]],
  wares: [['wares', {}], ['basketpile', {}]],
  pawn: [['counter', {}]],
};
const WIDTH = { winejars: 1.5, medicine: 1.4, silkrack: 1.5, noodles: 2.0, buns: 1.6, counter: 1.9, flowers: 1.3, basketpile: 1.5 };
const NAMEBOARD = { silk: 'cloth_white', tea: 'cloth_green', wine: 'cloth_red' };
void NAMEBOARD;
const CLOTHS = ['cloth_indigo', 'cloth_red', 'cloth_white', 'cloth_ochre', 'cloth_grey', 'cloth_brown', 'cloth_green'];

/**
 * hz_shop: the signs and goods of one shop front { at (the middle of its front, on the lot's edge), y, rot
 * (out into the street), L (the front's width), trade, seed, v0 (how far in the shutter line stands: 0.5),
 * imperial (on the Imperial Way: grander signs) }.
 */
function hzShop(el, { bag, col }) {
  const rand = rng(el.seed || 1), pick = (a) => a[Math.floor(rand() * a.length)];
  const [cx, cz] = el.at, y0 = el.y ?? 0, rot = el.rot, L = el.L, trade = el.trade && GOODS[el.trade] ? el.trade : 'wares', c = Math.cos(rot), s = Math.sin(rot);
  const loc = (lx, lz) => [cx + lx * c + lz * s, cz - lx * s + lz * c];
  const put = (name, { mats = {}, x = 0, z = 0, y = 0, ry = 0, k = 1 } = {}) => {
    const P = placer({ t: el.t, at: loc(x, z), y: y0 + y, rot: rot + ry, s: k }, bag);
    for (const [role, g] of Object.entries(U[name])) { let m = mats[role] ?? DEF[name][role]; if (WINDY.has(`${name}.${role}`)) m = windMat(m); P(m, g.clone()); }
  };
  const side = rand() < 0.5 ? -1 : 1;
  // the wine houses' coloured-silk gate (wide fronts, most on the Imperial Way)
  if (trade === 'wine' && L >= 4.6 && (el.imperial || rand() < 0.5)) {
    const W = L >= 6.4 ? 6 : 4;
    put(HUANMEN[W], { x: 0, z: 1.3, mats: { c: pick(['cloth_red', 'cloth_red', 'cloth_ochre']), w: 'cloth_white' } });
    col?.circle(...loc(-W / 2, 1.3), 0.14, y0, y0 + 3.9); col?.circle(...loc(W / 2, 1.3), 0.14, y0, y0 + 3.9);
  } else if (trade === 'wine' || trade === 'food') {
    const x = -side * (L / 2 - 0.2);
    put('winepole', { x, z: 0.35, mats: trade === 'food' ? { a: 'cloth_red', b: 'cloth_white' } : {} });
    col?.circle(...loc(x, 0.35), 0.22, y0, y0 + 5);
  }
  // the lantern sign (lightbox) standing at the end of the front on the grander streets, the hung signboard on a post
  if (el.imperial || rand() < 0.35) { const x = side * (L / 2 - 0.3); put('lightbox', { x, z: 0.6 }); col?.circle(...loc(x, 0.6), 0.35, y0, y0 + 1.7); }
  if (rand() < 0.7) put('hsign', { x: side * (L / 2 - 0.12), z: 0.04, y: 3.2 });
  // goods along the front, from one end
  const list = GOODS[trade], free0 = -L / 2 + 0.7, free1 = L / 2 - 0.7;
  let x = side > 0 ? free0 : free1; const dir = side > 0 ? 1 : -1;
  for (const [name, m] of list) {
    const w = WIDTH[name] ?? 1.3, xc = x + dir * w / 2;
    if (xc - w / 2 < free0 - 0.2 || xc + w / 2 > free1 + 0.2) break;
    const mats = { ...m };
    for (const k of Object.keys(mats)) if (mats[k] === 'cloth') mats[k] = pick(CLOTHS);
    put(name, { mats, x: xc, z: 0.55 + rand() * 0.15, ry: (rand() - 0.5) * 0.2 });
    col?.circle(...loc(xc, 0.6), w * 0.4, y0, y0 + 0.9);
    x += dir * (w + 0.1);
  }
}
/** Register the element into the street life (call once). */
STYLES.life.elements.hz_shop = hzShop;
export { hzShop, U as __units };
