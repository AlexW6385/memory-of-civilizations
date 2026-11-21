// What the sellers of Chichén Itzá's markets lay out (docs/settlements/chichen-itza.md §19.1): cotton mantles folded in stacks, cacao beans heaped
// with their pods (the beans were the market's small money), cakes of salt, jars of honey sealed with leaves, bundles of quetzal and green-parrot
// feathers, strings of chile, heaps of maize. Registered on the maya style as `cz_wares` { at: [x, z], y, rot, kind, seed } from here. Only
// materials the market already shows are used (so the near detail costs no new draw); every shape is varied by a hash of its own place.
import '../../styles/maya/index.js';
import '../../objects/index.js';
import { STYLES } from '../../core/build.js';
import { box, lathe } from '../../core/geom.js';
import { hashAt } from './hash.js';

export const KINDS = ['cloth', 'cacao', 'salt', 'honey', 'feathers', 'chile', 'maize'];
/** Local (u along the mat, v toward the seller's front) to world. */
const frame = (x, z, rot) => { const c = Math.cos(rot), s = Math.sin(rot); return (u, v) => [x + u * c + v * s, z - u * s + v * c]; };
/** A box over a local rectangle, cut into pieces under 0.3 m (so that all of it is fine detail: one mesh per material and plan, drawn only near). */
const slab = (bag, mat, W, y, u0, u1, v0, v1, y1) => {
  const nu = Math.max(1, Math.ceil((u1 - u0) / 0.3)), nv = Math.max(1, Math.ceil((v1 - v0) / 0.3)), nh = Math.max(1, Math.ceil((y1 - y) / 0.3));
  for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) for (let k = 0; k < nh; k++) {
    const a = W(u0 + (u1 - u0) * i / nu, v0 + (v1 - v0) * j / nv), b = W(u0 + (u1 - u0) * (i + 1) / nu, v0 + (v1 - v0) * (j + 1) / nv);
    bag.add(mat, box(Math.min(a[0], b[0]), y + (y1 - y) * k / nh, Math.min(a[1], b[1]), Math.max(a[0], b[0]), y + (y1 - y) * (k + 1) / nh, Math.max(a[1], b[1])));
  }
};
function wares(el, { bag }) {
  const [x, z] = el.at, y = el.y ?? 0, rot = el.rot ?? 0, W = frame(x, z, rot), h = (s) => hashAt(x, z, s + (el.seed | 0) % 97), kind = el.kind || 'cloth';
  const at = (u, v) => W(u, v);
  if (kind === 'cloth') {
    // mantles folded in two stacks, a third laid open; a coil of cord
    const cols = ['cloth_white', 'cloth_red', 'cloth_ochre', 'cloth_white'];
    for (let s = 0; s < 2; s++) for (let k = 0; k < 3 + Math.floor(h(s) * 3); k++) {
      const w = 0.28 + 0.03 * h(10 + k + s), d = 0.24 + 0.04 * h(20 + k), j = (h(30 + k + s) - 0.5) * 0.05;
      slab(bag, cols[(k + s + Math.floor(h(5) * 4)) % 4], W, y + 0.02 + k * 0.07, -0.55 + s * 0.7 - w / 2 + j, -0.55 + s * 0.7 + w / 2 + j, -d / 2, d / 2, y + 0.09 + k * 0.07);
    }
    slab(bag, 'cloth_red', W, y + 0.02, 0.62, 0.98, -0.2, 0.2, y + 0.045);
    slab(bag, 'cloth_ochre', W, y + 0.045, 0.66, 0.92, -0.16, 0.16, y + 0.06);
    const c = at(1.15, 0.15); bag.add('cloth_ochre', lathe([[0.16, 0], [0.16, 0.05], [0.09, 0.07], [0.001, 0.07]], 10, null, c[0], y + 0.015, c[1]));
  } else if (kind === 'cacao') {
    // a heap of beans on a mat, pods (ochre and red, ribbed) beside it, a pottery measure
    const c = (u, v) => { const p = at(-0.3 + u, 0.1 + v); return [p[0], p[1]]; };
    for (let k = 0; k < 5; k++) { const a = k * 2.4, d = k ? 0.2 : 0, p = c(Math.cos(a) * d, Math.sin(a) * d), q = 0.85 + 0.3 * h(1 + k); bag.add('pottery_dark', lathe([[0.15 * q, 0], [0.12 * q, 0.04], [0.075 * q, 0.1], [0.001, 0.14]], 8, null, p[0], y + 0.015, p[1])); }
    for (let k = 0; k < 4; k++) {
      const p = at(0.5 + (k % 2) * 0.22 + 0.04 * h(40 + k), -0.18 + Math.floor(k / 2) * 0.3 + 0.05 * h(50 + k));
      bag.add(k % 3 ? 'paint_ochre' : 'cloth_red', lathe([[0.001, 0], [0.04, 0.03], [0.055, 0.09], [0.04, 0.17], [0.001, 0.2]], 8, null, p[0], y + 0.02, p[1]));
    }
    const m = at(0.1, -0.42); bag.add('pottery_dark', lathe([[0.1, 0], [0.12, 0.12], [0.1, 0.14], [0.08, 0.14], [0.08, 0.04], [0.001, 0.04]], 10, null, m[0], y + 0.015, m[1]));
  } else if (kind === 'salt') {
    // cakes of salt (the salt of the coast, packed in cakes, was one of the Maya's great trades), stacked
    let n = 0;
    for (let row = 0; row < 3; row++) for (let i = 0; i < 4 - row; i++) {
      const u = -0.5 + (i + row * 0.5) * 0.3 + (h(60 + n) - 0.5) * 0.02, yy = y + 0.02 + row * 0.1;
      slab(bag, 'cloth_white', W, yy, u - 0.13, u + 0.13, -0.1, 0.1, yy + 0.09); n++;
    }
    slab(bag, 'cloth_white', W, y + 0.02, 0.8, 1.06, -0.1, 0.1, y + 0.11);
  } else if (kind === 'honey') {
    // small jars, their mouths stopped with a leaf and tied (the honey of the stingless bees, wax and honey a staple of Yucatán's trade)
    for (let k = 0; k < 5; k++) {
      const p = at(-0.6 + k * 0.32 + 0.05 * h(70 + k), (k % 2 ? 0.18 : -0.12) + 0.05 * h(80 + k)), r = 0.1 + 0.02 * h(90 + k);
      bag.add('pottery_dark', lathe([[0.001, 0], [r * 0.7, 0], [r, 0.07], [r * 1.05, 0.14], [r * 0.7, 0.2], [r * 0.5, 0.23], [r * 0.55, 0.26], [r * 0.5, 0.26], [0.001, 0.24]], 10, null, p[0], y + 0.015, p[1]));
      bag.add('fresco_green', lathe([[r * 0.6, 0.25], [r * 0.7, 0.27], [0.001, 0.29]], 8, null, p[0], y + 0.015, p[1]));
    }
    const p = at(1.0, 0.0); bag.add('pottery_dark', lathe([[0.001, 0], [0.1, 0], [0.16, 0.1], [0.18, 0.2], [0.14, 0.3], [0.1, 0.34], [0.12, 0.37], [0.09, 0.37], [0.09, 0.32], [0.001, 0.3]], 12, null, p[0], y + 0.015, p[1]));
  } else if (kind === 'feathers') {
    // bundles of long green tail feathers and shorter parrot plumes laid across a mat, the finest tied with a red cord
    for (let k = 0; k < 3; k++) {
      const v = -0.3 + k * 0.3, L = 0.62 + 0.14 * h(100 + k), u0 = -L / 2 + (h(110 + k) - 0.5) * 0.15;
      slab(bag, 'fresco_green', W, y + 0.02, u0, u0 + L, v - 0.06, v + 0.06, y + 0.055 + 0.01 * k);
      slab(bag, 'fresco_green', W, y + 0.02, u0 + L * 0.2, u0 + L * 0.8, v - 0.13, v + 0.13, y + 0.04);
      slab(bag, 'cloth_red', W, y + 0.02, u0 + L * 0.5 - 0.03, u0 + L * 0.5 + 0.03, v - 0.09, v + 0.09, y + 0.07 + 0.01 * k);
    }
    slab(bag, 'cloth_red', W, y + 0.02, 0.5, 0.9, -0.15, 0.15, y + 0.05);
  } else if (kind === 'chile') {
    // strings of dried chile hung over a pole between two forked posts, and a heap in a basket's place on the mat
    for (const u of [-0.7, 0.7]) { const p = at(u, 0.0); for (const [y0, y1] of [[0, 0.26], [0.26, 0.52], [0.52, 0.78]]) bag.add('cloth_ochre', box(p[0] - 0.035, y + y0, p[1] - 0.035, p[0] + 0.035, y + y1, p[1] + 0.035)); }
    const a = at(-0.72, 0), b = at(0.72, 0);
    for (let i = 0; i < 5; i++) { const p = at(-0.72 + i * 0.288, 0), q = at(-0.72 + (i + 1) * 0.288, 0); bag.add('cloth_ochre', box(Math.min(p[0], q[0]) - 0.03, y + 0.76, Math.min(p[1], q[1]) - 0.03, Math.max(p[0], q[0]) + 0.03, y + 0.8, Math.max(p[1], q[1]) + 0.03)); }
    for (let k = 0; k < 6; k++) {
      const p = at(-0.5 + k * 0.2 + 0.03 * h(120 + k), 0.04 * (k % 2)), len = 0.25 + 0.06 * h(130 + k);
      bag.add('cloth_red', box(p[0] - 0.035, y + 0.76 - len, p[1] - 0.03, p[0] + 0.035, y + 0.76, p[1] + 0.03));
      bag.add('cloth_ochre', box(p[0] - 0.008, y + 0.76 - len - 0.04, p[1] - 0.008, p[0] + 0.008, y + 0.76, p[1] + 0.008));
    }
    for (let k = 0; k < 3; k++) { const c = at(-0.2 + k * 0.2, 0.5 + 0.04 * (k % 2)); bag.add('cloth_red', lathe([[0.17, 0], [0.12, 0.05], [0.001, 0.1]], 8, null, c[0], y + 0.02, c[1])); }
  } else {
    // maize in heaps: shelled grain in a mound, cobs in a pile, a woven measure
    for (let k = 0; k < 5; k++) { const a = k * 2.4, d = k ? 0.22 : 0, c = at(-0.4 + Math.cos(a) * d, Math.sin(a) * d), q = 0.85 + 0.3 * h(140 + k); bag.add('paint_ochre', lathe([[0.15 * q, 0], [0.15 * q, 0.05], [0.075 * q, 0.13], [0.001, 0.17]], 8, null, c[0], y + 0.015, c[1])); }
    for (let k = 0; k < 6; k++) {
      const p = at(0.45 + (k % 3) * 0.14 + 0.03 * h(150 + k), -0.15 + Math.floor(k / 3) * 0.2), r2 = 0.03;
      bag.add('paint_ochre', lathe([[0.001, 0], [r2, 0.01], [r2 * 1.1, 0.09], [r2 * 0.7, 0.17], [0.001, 0.19]], 6, null, p[0], y + 0.02 + 0.04 * (k > 2 ? 1 : 0), p[1]));
    }
  }
}

Object.assign(STYLES.maya.elements, { cz_wares: wares });
if (STYLES.life) Object.assign(STYLES.life.elements, { cz_wares: wares });
