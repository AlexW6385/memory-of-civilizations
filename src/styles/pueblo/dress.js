// Pueblo dress (docs/settlements/taos.md §4.5): what stands at the foot of the house fronts, on the plaza, by the creek and in the
// fields — benches of adobe, strings of maize on the viga ends, hides stretched in frames, blankets airing on poles, jars, squash
// drying on mats, hearth rings, shade ramadas, turkey pens, middens, cattails, washing places, field watchers' platforms. Each kind is
// built once per variant at the origin (local +z the way it faces) and placed by a matrix, so that copies are instanced.

import { box, lathe, rod, fromTriangles } from '../../core/geom.js';
import { Matrix4 } from '../../core/three.js';

const A = 'adobe_taos', V = 'viga';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }
const JAR = {
  olla: [[0.001, 0], [0.1, 0.02], [0.2, 0.12], [0.23, 0.24], [0.19, 0.36], [0.12, 0.42], [0.125, 0.47], [0.11, 0.47], [0.1, 0.43], [0.001, 0.42]],
  cook: [[0.001, 0], [0.09, 0.03], [0.16, 0.12], [0.17, 0.2], [0.15, 0.27], [0.155, 0.3], [0.14, 0.3], [0.13, 0.27], [0.001, 0.25]],
  bowl: [[0.001, 0], [0.06, 0.005], [0.14, 0.05], [0.17, 0.1], [0.16, 0.1], [0.13, 0.06], [0.001, 0.03]],
};
const lumpG = (rx, ry, rz, rot, x, y, z, seg = 7) => { const g = lathe([[0.001, 0], [0.88, 0.06], [1, 0.3], [0.82, 0.68], [0.45, 0.93], [0.001, 1]], seg); g.scale(rx, ry, rz).rotateY(rot).translate(x, y, z); return g; };
/** A collector with the bag's `add`; `solid` the colliders, in local metres: ['c', x, z, r, h] circles and ['s', x0, z0, x1, z1, w, h] segments. */
const mk = () => ({ parts: {}, solid: [], add(m, g) { (this.parts[m] ||= []).push(g); } });
const jar = (P, kind, x, y, z, k = 1, mat = 'terracotta') => P.add(mat, lathe(JAR[kind].map(([r, h]) => [r * k, h * k]), 12, null, x, y, z));
/** A cloth hung over a rail, front and back, its hem a little uneven. */
function hung(P, mat, x, yTop, z, w, d, rand) {
  const N = 4;
  for (let i = 0; i < N; i++) { const x0 = x - w + (2 * w * i) / N, x1 = x0 + (2 * w) / N, dd = d * (0.92 + rand() * 0.16); for (const sd of [-1, 1]) P.add(mat, box(x0, yTop - dd, z + sd * 0.012 - 0.008, x1, yTop + 0.02, z + sd * 0.012 + 0.008)); }
  P.add(mat, box(x - w, yTop, z - 0.02, x + w, yTop + 0.03, z + 0.02));
}
const strings = (P, x, yTop, z, len, rand) => {
  P.add('linen', rod([x, yTop, z], [x, yTop - len, z], 0.012, 4));
  for (let e = 0; e * 0.17 < len - 0.15; e++) { const a = e * 2.1; P.add(e % 5 === 3 ? 'paint_ochre' : e % 7 === 5 ? 'cloth_red' : 'cloth_ochre', lathe([[0.001, 0], [0.035, 0.04], [0.045, 0.11], [0.03, 0.17], [0.001, 0.19]], 6, null, x + Math.cos(a) * 0.06, yTop - 0.34 - e * 0.17, z + Math.sin(a) * 0.06)); }
  void rand;
};

const KINDS = {
  /** A bench of adobe along the wall, a hide or blanket folded on it, a jar at its end. [inferred: the banco of the Pueblos] */
  banco(P, rand, v) {
    const L = 1.5 + (v % 3) * 0.6, d = 0.42, h = 0.42;
    P.add(A, box(0, 0, 0.0, L, h, d)); P.add(A, box(-0.03, h - 0.07, -0.02, L + 0.03, h, d + 0.04));
    if (v % 2 === 0) P.add(['hide_tan', 'cloth_brown', 'hide_white', 'cloth_ochre'][v % 4], box(0.2, h, 0.06, 0.2 + 0.7, h + 0.07, d - 0.04));
    if (v % 3 === 1) jar(P, 'cook', L - 0.25, h, d / 2, 0.8, 'pottery_dark');
    if (v % 4 === 3) P.add('wicker', lathe([[0.001, 0], [0.16, 0.01], [0.22, 0.1], [0.2, 0.17], [0.001, 0.15]], 10, null, 0.5, h, d / 2));
    P.solid.push(['s', 0, d / 2, L, d / 2, d, h]);
  },
  /** A viga end with strings of maize hung from it: a peg of pole stands out of the wall at head height. */
  maize(P, rand, v) {
    const n = 2 + (v % 2);
    P.add(V, rod([0, 2.1, -0.05], [0, 2.07, 0.55], 0.06, 6));
    for (let k = 0; k < n; k++) strings(P, 0.0, 2.05, 0.1 + k * 0.15, 0.9 + rand() * 0.5, rand);
  },
  /** A hide stretched in a pole frame, laced, a scraper leaning against it, a pot of tanning brains by it [stated: hide clothing, taos.org; inferred]. */
  hide(P, rand) {
    const W = 1.2, H = 1.7;
    for (const x of [-W / 2, W / 2]) P.add(V, rod([x, -0.2, 0], [x + (rand() - 0.5) * 0.04, H + 0.1, 0], 0.045, 6));
    for (const y of [0.3, H]) P.add(V, rod([-W / 2 - 0.05, y, 0], [W / 2 + 0.05, y, 0], 0.04, 6));
    P.add(rand() < 0.5 ? 'hide_tan' : 'hide_white', box(-W / 2 + 0.1, 0.42, -0.012, W / 2 - 0.1, H - 0.12, 0.012));
    for (let k = 0; k < 7; k++) { const x = -W / 2 + 0.12 + k * (W - 0.24) / 6; P.add('hide_brown', rod([x, H - 0.12, 0], [x, H, 0], 0.007, 4)); P.add('hide_brown', rod([x, 0.42, 0], [x, 0.3, 0], 0.007, 4)); }
    P.add(V, rod([W / 2 + 0.4, 0, 0.25], [W / 2 + 0.1, 0.95, 0.04], 0.03, 5)); P.add('basalt', box(W / 2 + 0.03, 0.9, 0.0, W / 2 + 0.14, 0.99, 0.06));
    jar(P, 'cook', -W / 2 - 0.4, 0, 0.3, 1, 'pottery_dark');
    P.solid.push(['s', -W / 2, 0, W / 2, 0, 0.25, H]);
  },
  /** Blankets and robes airing on a rail between two forked posts. */
  clothes(P, rand, v) {
    const W = 1.5 + (v % 2) * 0.5, H = 1.75;
    for (const x of [-W, W]) { P.add(V, rod([x, -0.25, 0], [x, H, 0], 0.05, 6)); P.add(V, rod([x, H - 0.1, 0], [x - 0.1, H + 0.08, 0.05], 0.03, 5)); P.add(V, rod([x, H - 0.1, 0], [x + 0.1, H + 0.08, -0.05], 0.03, 5)); }
    P.add(V, rod([-W - 0.1, H - 0.02, 0], [W + 0.1, H - 0.02, 0], 0.035, 6));
    const mats = ['cloth_white', 'cloth_red', 'hide_brown', 'cloth_indigo', 'hide_white', 'cloth_ochre', 'hide_grey'];
    let x = -W + 0.45;
    for (let k = 0; k < 2 + (v % 2); k++) { const w = 0.3 + rand() * 0.25; hung(P, mats[Math.floor(rand() * mats.length)], x + w, H - 0.02, 0, w, 0.8 + rand() * 0.45, rand); x += 2 * w + 0.08; if (x > W - 0.3) break; }
    for (const px of [-W, W]) P.solid.push(['c', px, 0, 0.1, H]);
  },
  /** A few jars of water and cooking, a gourd, a basket — the household's things set down by the door. */
  jars(P, rand, v) {
    const k = ['olla', 'cook', 'bowl', 'olla'];
    jar(P, 'olla', 0, 0, 0, 1.15 + rand() * 0.3, v % 2 ? 'pottery_dark' : 'terracotta');
    jar(P, k[v % 4], 0.5, 0, 0.12, 0.9 + rand() * 0.2, rand() < 0.4 ? 'pottery_dark' : 'terracotta');
    jar(P, 'cook', -0.4, 0, 0.3, 1.0, 'pottery_dark');
    if (v % 3 === 0) P.add('cloth_ochre', lathe([[0.001, 0], [0.09, 0.02], [0.12, 0.09], [0.07, 0.16], [0.001, 0.17]], 8, null, 0.15, 0, 0.5));
    if (v % 3 === 1) P.add('wicker', lathe([[0.001, 0], [0.16, 0.01], [0.24, 0.1], [0.27, 0.2], [0.24, 0.2], [0.21, 0.11], [0.001, 0.08]], 12, null, -0.05, 0, 0.55));
    P.solid.push(['c', 0.05, 0.1, 0.7, 0.55]);
  },
  /** A mat with rings of squash and pumpkin drying in the sun, heaps of seed, ears of corn. */
  squash(P, rand, v) {
    P.add('reed_mat', box(-0.7, 0, -0.5, 0.7, 0.025, 0.5));
    for (let k = 0; k < 16; k++) { const x = -0.6 + (k % 8) * 0.17, z = -0.3 + Math.floor(k / 8) * 0.3 + (rand() - 0.5) * 0.1; P.add(k % 3 ? 'cloth_ochre' : 'paint_ochre', lathe([[0.04, 0], [0.085, 0], [0.085, 0.012], [0.04, 0.012]], 10, null, x, 0.025, z)); }
    P.add('cloth_green', lumpG(0.14, 0.12, 0.14, 0, 0.45, 0.025, 0.42)); P.add('cloth_ochre', lumpG(0.12, 0.1, 0.12, 1, -0.45, 0.025, -0.42));
    if (v % 2) for (let e = 0; e < 5; e++) P.add(e % 2 ? 'paint_ochre' : 'cloth_ochre', rod([-0.5 + e * 0.15, 0.06, 0.45], [-0.4 + e * 0.15, 0.06, 0.38], 0.03, 5));
  },
  /** A ring of stones with a fire and a tripod of poles over it, a cooking pot hung from it. */
  hearth(P, rand, v) {
    const N = 11;
    for (let k = 0; k < N; k++) { const a = k / N * 6.28; P.add('rock_boulder', lumpG(0.15, 0.1, 0.13, rand() * 6, Math.cos(a) * 0.52, -0.02, Math.sin(a) * 0.52)); }
    P.add('opening', lathe([[0.001, 0.01], [0.42, 0.01]], 12));
    for (let k = 0; k < 4; k++) { const a = k * 1.7; P.add('bark_dark', rod([Math.cos(a) * 0.3, 0.03, Math.sin(a) * 0.3], [Math.cos(a) * 0.02, 0.1, Math.sin(a) * 0.02], 0.03, 5)); }
    if (v % 2 === 0) P.add('flame', lathe([[0.1, 0], [0.08, 0.08], [0.04, 0.18], [0.001, 0.26]], 8, (t) => 1 + 0.2 * Math.sin(t * 3), 0, 0.04, 0));
    for (let k = 0; k < 3; k++) { const a = k * 2.09 + 0.4; P.add(V, rod([Math.cos(a) * 0.9, 0, Math.sin(a) * 0.9], [Math.cos(a) * 0.04, 1.55, Math.sin(a) * 0.04], 0.035, 6)); }
    P.add('linen', rod([0, 1.5, 0], [0, 0.62, 0], 0.01, 4)); jar(P, 'cook', 0, 0.38, 0, 1.0, 'pottery_dark');
    for (let k = 0; k < 4; k++) P.add('bark_pine', rod([-1.1 + k * 0.1, 0.06 + (k % 2) * 0.08, 0.95], [-0.2 + k * 0.1, 0.06 + (k % 2) * 0.08, 0.88], 0.05, 6));
    P.solid.push(['c', 0, 0, 0.7, 0.4]);
  },
  /** A ramada: a shade of four forked posts, a roof of poles with brush over it, a mat and a grinding stone under it [inferred: the Pueblos' brush shade]. */
  ramada(P, rand, v) {
    const W = 1.7, D = 1.4, H = 2.25;
    for (const [x, z] of [[-W, -D], [W, -D], [-W, D], [W, D]]) {
      P.add(V, rod([x, -0.35, z], [x + (rand() - 0.5) * 0.05, H, z], 0.075, 7)); P.add(V, rod([x, H - 0.05, z], [x - 0.12, H + 0.15, z + 0.05], 0.035, 5)); P.solid.push(['c', x, z, 0.1, H]);
    }
    for (const x of [-W, W]) P.add(V, rod([x, H + 0.04, -D - 0.2], [x, H + 0.04, D + 0.2], 0.06, 7));
    for (let k = 0; k <= 8; k++) { const z = -D - 0.2 + (2 * D + 0.4) * k / 8; P.add(V, rod([-W - 0.35, H + 0.13, z], [W + 0.35, H + 0.13 + (rand() - 0.5) * 0.03, z], 0.035, 5)); }
    for (let k = 0; k < 14; k++) { const x = -W - 0.3 + (2 * W + 0.6) * k / 13; P.add('thatch', rod([x, H + 0.2, -D - 0.25], [x + (rand() - 0.5) * 0.1, H + 0.2 + rand() * 0.05, D + 0.25], 0.075, 5)); }
    P.add('reed_mat', box(-1.1, 0, -0.9, 1.1, 0.025, 0.9));
    if (v % 2) { P.add('basalt', box(-0.4, 0.0, -0.5, 0.4, 0.14, 0.2)); P.add('flagstone', box(-0.3, 0.14, -0.4, 0.3, 0.24, 0.1)); P.solid.push(['s', -0.4, -0.15, 0.4, -0.15, 0.7, 0.25]); }
    else { jar(P, 'olla', -0.8, 0.025, 0.4, 1.2); jar(P, 'bowl', -0.3, 0.025, 0.55, 1); P.add('wicker', lathe([[0.001, 0], [0.16, 0.01], [0.24, 0.1], [0.27, 0.2], [0.24, 0.2], [0.21, 0.11], [0.001, 0.08]], 12, null, 0.6, 0.025, 0.3)); }
    P.add('linen', rod([1.3, H + 0.04, 1.0], [1.3, H - 0.6, 1.0], 0.01, 4)); strings(P, -1.0, H + 0.02, -0.7, 0.9, rand);
  },
  /** A pen of stakes and rails for the turkeys, a roost pole and a heap of straw; a gap for a gate. */
  pen(P, rand) {
    const R = 2.0, N = 40;
    for (let k = 0; k < N; k++) {
      const a = 0.35 + (k / N) * (6.28 - 0.7);
      P.add(V, rod([Math.cos(a) * R, -0.2, Math.sin(a) * R], [Math.cos(a) * R + (rand() - 0.5) * 0.03, 1.0 + rand() * 0.2, Math.sin(a) * R], 0.045, 5));
    }
    for (const y of [0.45, 0.85]) for (let k = 0; k < 18; k++) { const a0 = 0.35 + (k / 18) * (6.28 - 0.7), a1 = 0.35 + ((k + 1) / 18) * (6.28 - 0.7); P.add(V, rod([Math.cos(a0) * (R + 0.05), y, Math.sin(a0) * (R + 0.05)], [Math.cos(a1) * (R + 0.05), y, Math.sin(a1) * (R + 0.05)], 0.028, 5)); }
    P.add(V, rod([-1.0, 0.7, -0.3], [0.7, 0.7, -0.5], 0.04, 6)); for (const x of [-1.0, 0.7]) P.add(V, rod([x, 0, x === -1.0 ? -0.3 : -0.5], [x, 0.7, x === -1.0 ? -0.3 : -0.5], 0.04, 5));
    P.add('thatch', lumpG(0.6, 0.12, 0.5, 0.3, 0.6, 0, 0.8)); jar(P, 'bowl', -0.7, 0, 0.9, 1.1, 'pottery_dark');
    for (let k = 0; k < 40; k++) { const a = 0.35 + (k / 40) * (6.28 - 0.7); if (k % 3 === 0) P.solid.push(['c', Math.cos(a) * R, Math.sin(a) * R, 0.1, 1.0]); }
  },
  /** A midden: ash, sherds, bones and cobs thrown out behind the houses. */
  midden(P, rand) {
    P.add('cloth_grey', lumpG(1.5, 0.45, 1.2, 0.4, 0, -0.05, 0, 9)); P.add('hide_grey', lumpG(0.9, 0.3, 0.8, 1.5, 0.5, 0.1, 0.35, 8));
    for (let k = 0; k < 16; k++) { const a = rand() * 6.28, r = 0.2 + rand() * 1.2, g = box(-0.05, 0, -0.04, 0.05, 0.012, 0.04); g.rotateY(rand() * 6).rotateZ((rand() - 0.5) * 0.6).translate(Math.cos(a) * r, 0.25 + 0.2 * (1 - r / 1.4) * 0.5, Math.sin(a) * r); P.add(k % 3 ? 'terracotta' : 'pottery_dark', g); }
    for (let k = 0; k < 6; k++) { const a = rand() * 6.28, r = 0.3 + rand() * 1.0; P.add('hide_white', rod([Math.cos(a) * r, 0.3, Math.sin(a) * r], [Math.cos(a) * r + 0.15, 0.32, Math.sin(a) * r + 0.06], 0.014, 4)); }
    P.solid.push(['c', 0, 0, 1.2, 0.4]);
  },
  /** A clump of cattails at the water's edge: stems, long blades, the brown heads. */
  cattail(P, rand) {
    for (let k = 0; k < 9; k++) {
      const a = rand() * 6.28, r = rand() * 0.35, lean = 0.08 + rand() * 0.2, h = 1.2 + rand() * 0.8, x = Math.cos(a) * r, z = Math.sin(a) * r, dx = Math.cos(a + 0.5) * lean, dz = Math.sin(a + 0.5) * lean;
      P.add('papyrus', rod([x, -0.1, z], [x + dx * h * 0.4, h, z + dz * h * 0.4], 0.012, 4));
      if (k % 2 === 0) { P.add('hide_brown', rod([x + dx * h * 0.37, h * 0.8, z + dz * h * 0.37], [x + dx * h * 0.4, h * 0.97, z + dz * h * 0.4], 0.025, 5)); }
      else P.add('papyrus', rod([x, 0, z], [x - dx * h * 0.6, h * 0.8, z - dz * h * 0.6], 0.008, 3));
    }
  },
  /** A washing place on the bank: a flat stone, a blanket over a log, jars and a basket by it. */
  wash(P, rand) {
    P.add('flagstone', lumpG(0.55, 0.12, 0.38, 0.4, 0, 0, 0, 8)); P.add(V, rod([-0.9, 0.12, 0.55], [0.9, 0.14, 0.62], 0.1, 7));
    P.add('cloth_white', box(-0.4, 0.09, 0.5, 0.35, 0.22, 0.68)); P.add('cloth_red', box(0.0, 0.0, 0.3, 0.5, 0.012, 0.8));
    jar(P, 'olla', -0.9, 0, -0.2, 1.1); jar(P, 'cook', 0.9, 0, -0.1, 1, 'pottery_dark'); P.add('wicker', lathe([[0.001, 0], [0.16, 0.01], [0.24, 0.1], [0.27, 0.2], [0.24, 0.2], [0.21, 0.11], [0.001, 0.08]], 12, null, 1.2, 0, 0.5));
    P.solid.push(['c', 0, 0, 0.6, 0.2]);
  },
  /** A rack on a roof: two forked poles and a rail, strings of maize and squash hung from it. */
  roofrack(P, rand) {
    const W = 1.0, H = 1.35;
    for (const x of [-W, W]) P.add(V, rod([x, 0, 0], [x, H, 0], 0.04, 6));
    P.add(V, rod([-W - 0.1, H, 0], [W + 0.1, H, 0], 0.035, 6));
    for (let k = 0; k < 4; k++) strings(P, -W + 0.3 + k * 0.5, H, 0, 0.6 + rand() * 0.4, rand);
    P.add('hide_tan', box(-0.2, H - 0.7, 0.01, 0.3, H - 0.02, 0.035));
  },
  /** A watcher's platform in the fields: four posts, a floor of poles, a brush shade over it, a ladder. */
  watch(P, rand) {
    const W = 1.3, H = 2.2;
    for (const [x, z] of [[-W, -W], [W, -W], [-W, W], [W, W]]) { P.add(V, rod([x, -0.3, z], [x, H + 1.0, z], 0.07, 7)); P.solid.push(['c', x, z, 0.1, H + 1]); }
    for (let k = 0; k < 11; k++) P.add(V, rod([-W - 0.15, H, -W + k * 2 * W / 10], [W + 0.15, H, -W + k * 2 * W / 10], 0.05, 6));
    for (const y of [H + 0.9]) for (const x of [-W, W]) P.add(V, rod([x, y, -W - 0.15], [x, y, W + 0.15], 0.05, 6));
    for (let k = 0; k < 12; k++) P.add('thatch', rod([-W - 0.25 + k * (2 * W + 0.5) / 11, H + 1.05, -W - 0.3], [-W - 0.25 + k * (2 * W + 0.5) / 11, H + 1.0, W + 0.3], 0.075, 5));
    for (const s of [-0.25, 0.25]) P.add(V, rod([s - 0.2, 0, W + 0.9], [s - 0.2, H + 0.9, W + 0.1], 0.04, 6));
    for (let k = 1; k * 0.36 < H + 0.5; k++) P.add(V, rod([-0.45, k * 0.36, W + 0.9 - 0.8 * k * 0.36 / (H + 0.9)], [0.05, k * 0.36, W + 0.9 - 0.8 * k * 0.36 / (H + 0.9)], 0.022, 5));
    jar(P, 'olla', 0.7, H, 0.3, 1.0);
  },
};

const CACHE = new Map();
const build = (kind, v) => {
  const key = kind + ':' + v;
  if (!CACHE.has(key)) { const P = mk(); KINDS[kind](P, rng(1000 + v * 77 + kind.length * 13), v); CACHE.set(key, P); }
  return CACHE.get(key);
};

/**
 * pueblo_dress: { items: [{ k (kind), at: [x, z], y, rot (yaw: local +z → (sin, cos)), v (variant) }] } — the things of the
 * houses' feet, the plaza, the creek and the fields, built once per kind and variant and placed by matrix (instanced).
 */
export function dress(el, { bag, col }) {
  for (const it of el.items) {
    const P = build(it.k, it.v ?? 0), y = it.y ?? 0, th = it.rot ?? 0, c = Math.cos(th), s = Math.sin(th);
    const m = new Matrix4().makeRotationY(th).setPosition(it.at[0], y, it.at[1]);
    for (const [mat, gs] of Object.entries(P.parts)) for (const g of gs) {
      if (bag.addInstance) bag.addInstance(mat, g, m.clone(), { reach: it.reach ?? 110 }); else bag.add(mat, g.clone().applyMatrix4(m));
    }
    const W = (u, v) => [it.at[0] + u * c + v * s, it.at[1] - u * s + v * c];
    for (const q of P.solid) {
      if (q[0] === 'c') { const p = W(q[1], q[2]); col.circle(p[0], p[1], q[3], y, y + q[4]); }
      else col.segment(W(q[1], q[2]), W(q[3], q[4]), q[5], y, y + q[6]);
    }
  }
}
export const DRESS_KINDS = Object.keys(KINDS);
void fromTriangles;
