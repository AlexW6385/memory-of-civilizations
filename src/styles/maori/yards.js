// The dressing of the kāinga at eye level and the planting of the pā (docs/settlements/maori.md §4e): before each
// house the things of the household — firewood, a line with cloaks drying, kete of kūmara and fern root, gourds
// (hue), an adze leaning on the wall, a beating stone with fern root, strung fish on a gallows, a windbreak of
// reed — and the trees of the place at their true heights: the cabbage tree (tī kōuka) and the tree fern (ponga).

import { Matrix4 } from '../../core/three.js';
import { box, lathe, fromTriangles, rod } from '../../core/geom.js';
import { tube } from '../../objects/kit.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const lathePut = (add, mat, prof, n, x, y, z, f) => add(mat, lathe(prof, n, f, x, y, z));

// ---- the household things (house-local: the door at the origin, the yard toward −z) --------------------
const ITEMS = {
  /** firewood: a stack of split logs, three layers, against a pair of stakes */
  wood(add, r, x, z) {
    for (let row = 0; row < 3; row++) for (let k = 0; k < 5 - row; k++) add(r() < 0.5 ? 'bark_dark' : 'timber', rod([x - 0.7 + row * 0.11 + k * 0.28, 0.1 + row * 0.2, z], [x - 0.7 + row * 0.11 + k * 0.28, 0.1 + row * 0.2, z - 0.85], 0.075, 5).rotateY(0));
    for (const sx of [-0.85, 0.8]) add('timber', rod([x + sx, 0, z + 0.05], [x + sx, 0.85, z + 0.05], 0.035, 5));
  },
  /** a drying line between two posts, two or three cloaks hung over it */
  line(add, r, x, z) {
    const L = 2.4 + r() * 0.8;
    for (const sx of [0, L]) add('timber', rod([x + sx, 0, z], [x + sx, 1.75, z], 0.045, 5));
    add('rope_fibre', rod([x, 1.65, z], [x + L, 1.6, z], 0.012, 4));
    for (let k = 0, u = 0.25; u < L - 0.5 && k < 3; k++, u += 0.75 + r() * 0.35) {
      const w = 0.55 + r() * 0.2, mat = ['cloth_ochre', 'cloth_brown', 'hide_tan', 'cloth_ochre'][Math.floor(r() * 4)];
      add(mat, box(x + u, 0.82 + r() * 0.1, z - 0.04, x + u + w, 1.64, z + 0.04));
      add('cloth_black', box(x + u, 0.82 + r() * 0.1, z - 0.045, x + u + w, 0.9 + r() * 0.1, z + 0.045));   // the taniko border
    }
  },
  /** kete of kūmara and fern root, a bowl, a gourd or two */
  kete(add, r, x, z) {
    for (let k = 0; k < 3; k++) {
      const a = r() * 6.28, bx = x + Math.cos(a) * 0.45, bz = z + Math.sin(a) * 0.45, s = 0.9 + r() * 0.3;
      lathePut(add, 'wicker', [[0.001, 0], [0.19 * s, 0.02], [0.23 * s, 0.2 * s], [0.18 * s, 0.38 * s], [0.001, 0.38 * s]], 9, bx, 0.02, bz);
      if (k < 2) lathePut(add, 'hide_brown', [[0.17 * s, 0.37 * s], [0.14 * s, 0.44 * s], [0.001, 0.46 * s]], 8, bx, 0.02, bz);   // the kūmara heaped in the mouth
    }
    lathePut(add, 'wood_dark', [[0.001, 0], [0.2, 0.01], [0.28, 0.12], [0.26, 0.13], [0.18, 0.04], [0.001, 0.04]], 10, x - 0.8, 0, z + 0.2);
  },
  /** gourds (hue): a few of them on the ground and one on a stake */
  hue(add, r, x, z) {
    for (let k = 0; k < 4; k++) {
      const gx = x + k * 0.4 + r() * 0.1, gz = z + r() * 0.4, s = 0.8 + r() * 0.5;
      lathePut(add, 'wood_ochre', [[0.001, 0], [0.12 * s, 0.03], [0.15 * s, 0.14 * s], [0.08 * s, 0.26 * s], [0.045 * s, 0.34 * s], [0.001, 0.36 * s]], 8, gx, 0, gz);
    }
    add('timber', rod([x - 0.4, 0, z], [x - 0.4, 1.0, z], 0.025, 5));
    lathePut(add, 'wood_ochre', [[0.001, 0], [0.1, 0.03], [0.13, 0.13], [0.07, 0.24], [0.001, 0.3]], 8, x - 0.4, 1.0, z);
  },
  /** an adze (toki) leaning on a stump, a beating stone with bundles of fern root */
  toki(add, r, x, z) {
    lathePut(add, 'bark_dark', [[0.3, 0], [0.26, 0.42], [0.001, 0.44]], 8, x, 0, z, (th) => 1 + 0.12 * Math.sin(th * 3));
    add('timber', rod([x + 0.12, 0.45, z], [x + 0.4, 0.05, z - 0.7], 0.022, 5));
    add('basalt', box(x + 0.34, 0.03, z - 0.78, x + 0.46, 0.08, z - 0.6));
    lathePut(add, 'basalt', [[0.001, 0], [0.34, 0.01], [0.3, 0.15], [0.001, 0.18]], 8, x - 0.9, 0, z - 0.2, (th) => 1 + 0.15 * Math.sin(th * 2.3));
    for (let k = 0; k < 3; k++) add('rope_fibre', rod([x - 1.3 + k * 0.1, 0.04, z - 0.6 - k * 0.12], [x - 0.6 + k * 0.1, 0.07, z - 0.55 - k * 0.12], 0.045, 5));
  },
  /** strung fish on a small gallows of crossed poles */
  gallows(add, r, x, z) {
    for (const sx of [-0.7, 0.7]) { add('timber', rod([x + sx, 0, z - 0.3], [x + sx * 0.25, 1.9, z], 0.04, 5)); add('timber', rod([x + sx, 0, z + 0.3], [x + sx * 0.25, 1.9, z], 0.04, 5)); }
    add('timber', rod([x - 0.45, 1.75, z], [x + 0.45, 1.75, z], 0.035, 5));
    for (let k = 0; k < 6; k++) {
      const fx = x - 0.4 + k * 0.16, len = 0.28 + r() * 0.1;
      add('rope_fibre', rod([fx, 1.74, z], [fx, 1.74 - 0.2, z], 0.006, 3));
      add(k % 2 ? 'hide_tan' : 'hide_grey', lathe([[0.001, 0], [0.05, len * 0.3], [0.04, len * 0.8], [0.001, len]], 6, null, fx, 1.74 - 0.2 - len, z).scale(1, 1, 0.35));
    }
  },
  /** a windbreak (pākaru) of reed stems lashed between stakes, with a gap */
  pakaru(add, r, x, z) {
    for (let k = 0; k <= 6; k++) add('timber', rod([x + k * 0.5, 0, z], [x + k * 0.5, 1.15 + r() * 0.12, z], 0.03, 5));
    for (const yy of [0.35, 0.7, 1.0]) add('rope_fibre', rod([x, yy, z], [x + 3, yy + 0.03, z], 0.015, 4));
    add('raupo', box(x, 0.12, z - 0.04, x + 3, 1.1, z + 0.04));
  },
  /** a mat laid in the yard with a bowl, a kete and a carved box on it, where a family sits */
  mat(add, r, x, z) {
    add('reed_mat', box(x - 0.8, 0.0, z - 0.6, x + 0.8, 0.03, z + 0.6));
    lathePut(add, 'wood_dark', [[0.001, 0.03], [0.17, 0.04], [0.23, 0.13], [0.21, 0.14], [0.14, 0.07], [0.001, 0.07]], 10, x - 0.3, 0, z);
    lathePut(add, 'wicker', [[0.001, 0.03], [0.14, 0.05], [0.17, 0.22], [0.001, 0.25]], 8, x + 0.35, 0, z + 0.15);
    add('kokowai', box(x + 0.1, 0.03, z - 0.45, x + 0.4, 0.2, z - 0.2));
  },
};
const KEYS = Object.keys(ITEMS);

/** yard: the household dressing before a house { c: the door point, y, yaw, seed, items } — local x across, −z the yard. */
export function yard(el, { bag }) {
  const [cx, cz] = el.c, rand = rng(el.seed ?? 1), y0 = el.y ?? 0;
  const M = new Matrix4().makeRotationY(el.yaw ?? 0).setPosition(cx, y0, cz);
  const add = (mat, g) => { g.applyMatrix4(M); bag.add(mat, g); };
  const n = el.items ?? 2 + (rand() < 0.5 ? 1 : 0), used = new Set();
  const side = rand() < 0.5 ? -1 : 1;
  for (let k = 0; k < n; k++) {
    let name; do { name = KEYS[Math.floor(rand() * KEYS.length)]; } while (used.has(name) && used.size < KEYS.length);
    used.add(name);
    const x = side * (1.6 + k * 1.5) + (rand() - 0.5) * 0.4, z = -1.2 - rand() * 1.2 - (k % 2) * 0.5;
    ITEMS[name](add, rand, x * (k % 2 ? -1 : 1) * (name === 'line' || name === 'pakaru' ? 0.5 : 1), z);
  }
}

// ---- the trees ---------------------------------------------------------------------------------------
/** A rosette of strap leaves (cabbage tree): 16 blades, the outer drooping, 1 m long at unit scale. */
function rosette(N, len, droop, wd) {
  const t = [], S = 6;
  for (let i = 0; i < N; i++) {
    const a = i / N * 6.283 + (i % 3) * 0.2, up = 0.95 - (i % 4) * 0.28, ca = Math.cos(a), sa = Math.sin(a);
    const c = (u) => { const rr = u * len * Math.cos(up * (1 - u * droop)), yy = u * len * Math.sin(up) - droop * len * u * u * 0.55; return [ca * rr, yy, sa * rr]; };
    for (let j = 0; j < S; j++) {
      const u0 = j / S, u1 = (j + 1) / S, p = c(u0), q = c(u1), w0 = wd * (1 - u0 * 0.8), w1 = wd * (1 - u1 * 0.95);
      const a0 = [p[0] - sa * w0, p[1], p[2] + ca * w0], a1 = [p[0] + sa * w0, p[1], p[2] - ca * w0], b0 = [q[0] - sa * w1, q[1], q[2] + ca * w1], b1 = [q[0] + sa * w1, q[1], q[2] - ca * w1];
      t.push(...a0, ...b0, ...b1, ...a0, ...b1, ...a1, ...a0, ...b1, ...b0, ...a0, ...a1, ...b1);
    }
  }
  return fromTriangles(t);
}
const TUFT = rosette(18, 0.95, 0.9, 0.035);
const FROND = (() => {
  const t = [], S = 8;
  for (let i = 0; i < 11; i++) {
    const a = i / 11 * 6.283, ca = Math.cos(a), sa = Math.sin(a);
    const c = (u) => [ca * u * 1.5, 0.5 * Math.sin(u * 2.2) - u * u * 0.9 + 0.1, sa * u * 1.5];
    for (let j = 0; j < S; j++) {
      const u0 = j / S, u1 = (j + 1) / S, p = c(u0), q = c(u1), w0 = 0.26 * Math.sin(Math.min(1, u0 * 3 + 0.3) * 1.5) * (1 - u0 * 0.7), w1 = 0.26 * Math.sin(Math.min(1, u1 * 3 + 0.3) * 1.5) * (1 - u1 * 0.8);
      const a0 = [p[0] - sa * w0, p[1], p[2] + ca * w0], a1 = [p[0] + sa * w0, p[1], p[2] - ca * w0], b0 = [q[0] - sa * w1, q[1], q[2] + ca * w1], b1 = [q[0] + sa * w1, q[1], q[2] - ca * w1];
      t.push(...a0, ...b0, ...b1, ...a0, ...b1, ...a1, ...a0, ...b1, ...b0, ...a0, ...a1, ...b1);
    }
  }
  return fromTriangles(t);
})();
function inst(bag, geom, x, y, z, s, ry) {
  const m = new Matrix4().makeTranslation(x, y, z).multiply(new Matrix4().makeRotationY(ry)).multiply(new Matrix4().makeScale(s, s, s));
  if (bag.addInstance) bag.addInstance('flax_leaf', geom, m, { reach: 260 }); else bag.add('flax_leaf', geom.clone().applyMatrix4(m));
}
/** tikouka: a cabbage tree { at, y, h, seed } — a stout pale trunk forking into a few limbs, each ending in a drooping head of strap leaves. */
export function tikouka(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, h = el.h ?? 5, rand = rng(el.seed ?? 5), lean = (rand() - 0.5) * 0.3;
  const fork = h * (0.45 + rand() * 0.15);
  bag.add('bark_grey', lathe([[0.2, -0.15], [0.17, fork * 0.5], [0.13, fork], [0.001, fork + 0.02]], 8, (th) => 1 + 0.1 * Math.sin(th * 5), x, y, z));
  const n = 2 + Math.floor(rand() * 3);
  for (let k = 0; k < n; k++) {
    const a = k / n * 6.28 + rand(), reach = h * (0.14 + rand() * 0.12), top = h * (0.72 + rand() * 0.28) - fork;
    const ex = x + Math.cos(a) * reach + lean * fork, ez = z + Math.sin(a) * reach, ey = y + fork + top;
    bag.add('bark_grey', tube([[x + lean * fork * 0.3, y + fork - 0.05, z, 0.1], [(x + ex) / 2, y + fork + top * 0.55, (z + ez) / 2, 0.075], [ex, ey, ez, 0.05]], 6));
    inst(bag, TUFT, ex, ey, ez, 0.9 + rand() * 0.5, rand() * 6.28);
  }
  col.circle(x, z, 0.28, y, y + h);
}
/** ponga: a tree fern { at, y, h, seed } — a slender dark trunk scarred by old fronds, a crown of arching fronds. */
export function ponga(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, h = el.h ?? 3.5, rand = rng(el.seed ?? 5);
  bag.add('bark_dark', lathe([[0.17, -0.1], [0.11, h * 0.5], [0.09, h], [0.001, h + 0.02]], 7, (th) => 1 + 0.12 * Math.sin(th * 6 + 1), x + (rand() - 0.5) * 0.2, y, z));
  inst(bag, FROND, x, y + h, z, 0.8 + rand() * 0.5, rand() * 6.28);
  col.circle(x, z, 0.18, y, y + h);
}
export const YARDS = { yard, tikouka, ponga };
