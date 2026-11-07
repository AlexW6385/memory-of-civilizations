// Plants of Mesoamerica built as solids (the flora catalogue has none of them): the maguey (Agave
// salmiana, the pulque agave of the highlands — a rosette of thick, channelled, spine-tipped leaves),
// the nopal (Opuntia, the prickly pear — a shrub of jointed flat pads, a woody trunk at its foot, its
// fruit on the pads' rims). Each in three variants, laid as instances (one prototype per variant
// whatever its turn). Used by the teotihuacano, aztec and maya styles.

import { fromTriangles, orientOutward, lathe } from '../../core/geom.js';
import { Matrix4, Vector3 } from '../../core/three.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
/** The triangles of a closed solid of eight corners (bottom four, top four), turned outward. */
function hexTris(P) {
  const t = [], q = (a, b, c, d) => t.push(...P[a], ...P[b], ...P[c], ...P[a], ...P[c], ...P[d]);
  q(0, 1, 2, 3); q(4, 5, 6, 7); q(0, 1, 5, 4); q(1, 2, 6, 5); q(2, 3, 7, 6); q(3, 0, 4, 7);
  return orientOutward(t);
}

const MAGUEY = new Map();
/**
 * A maguey rosette, about 1.6 m high and 2.6 m across at s = 1: some 26 leaves in three whorls, the
 * inner ones nearly upright and folded round the heart, the outer spreading and bowed under their
 * own weight; each leaf thick at its foot, widest at a third of its length, channelled, ending in a
 * dark terminal spine. { leaves (geometry), spines (geometry) }.
 */
function magueyGeo(v) {
  if (MAGUEY.has(v)) return MAGUEY.get(v);
  const rand = rng(91 + v * 17), L = [], S = [];
  const whorls = [[10, 0.62, 1.45, 1.0], [9, 0.95, 1.3, 0.85], [8, 1.28, 0.95, 0.62]];        // count, rise (rad from the horizontal), length, width
  whorls.forEach(([n, rise0, len0, w0], wi) => {
    for (let i = 0; i < n; i++) {
      const az = (i + wi * 0.5) * 2 * Math.PI / n + (rand() - 0.5) * 0.3, rise = rise0 + (rand() - 0.5) * 0.18, len = len0 * (0.85 + rand() * 0.3), wd = 0.17 * w0 * (0.9 + rand() * 0.2);
      const c = Math.cos(az), s = Math.sin(az), droop = wi === 0 ? 0.42 : wi === 1 ? 0.22 : 0.08;
      // the leaf's spine, from its foot in the heart outward and up, bowing down toward the tip
      const N = 5, pts = [];
      for (let k = 0; k <= N; k++) {
        const t = k / N, a = rise - droop * t * t, r = 0.08 + len * t * Math.cos(rise - droop * t * 0.5), y = 0.06 + len * t * Math.sin(a + droop * t * 0.4);
        pts.push([c * r, y, s * r]);
      }
      // cross-sections: width across (tangent to the rosette), the channel's depth up
      const W = (t) => wd * (t < 0.33 ? 0.7 + t * 0.9 : 1.0 - (t - 0.33) * 1.2) * (t >= 1 ? 0.12 : 1), Th = (t) => 0.07 * (1 - t * 0.75);
      const ax = [-s, 0, c];
      for (let k = 0; k < N; k++) {
        const t0 = k / N, t1 = (k + 1) / N, a = pts[k], b = pts[k + 1];
        // a channelled section: the two edges raised over the midrib, the back a narrower keel below
        const sec = (p, t) => {
          const w = W(t), h = Th(t);
          return [[p[0] - ax[0] * w, p[1] + h * 0.4, p[2] - ax[2] * w], [p[0] + ax[0] * w, p[1] + h * 0.4, p[2] + ax[2] * w],
            [p[0] + ax[0] * w * 0.4, p[1] - h * 0.6, p[2] + ax[2] * w * 0.4], [p[0] - ax[0] * w * 0.4, p[1] - h * 0.6, p[2] - ax[2] * w * 0.4]];
        };
        const A = sec(a, t0), B = sec(b, t1);
        L.push(...hexTris([A[3], A[2], B[2], B[3], A[0], A[1], B[1], B[0]]));
      }
      // the terminal spine, dark, out of the tip
      const tip = pts[N], pre = pts[N - 1], d = [tip[0] - pre[0], tip[1] - pre[1], tip[2] - pre[2]], dl = Math.hypot(...d);
      const e = [tip[0] + d[0] / dl * 0.05, tip[1] + d[1] / dl * 0.05, tip[2] + d[2] / dl * 0.05], o = 0.008;
      S.push(...hexTris([[tip[0] - ax[0] * o, tip[1] - o, tip[2] - ax[2] * o], [tip[0] + ax[0] * o, tip[1] - o, tip[2] + ax[2] * o], [tip[0] + ax[0] * o, tip[1] + o, tip[2] + ax[2] * o], [tip[0] - ax[0] * o, tip[1] + o, tip[2] - ax[2] * o], e, e, e, e]));
    }
  });
  // the heart: the tight cone of the youngest leaves
  const heart = lathe([[0.16, 0], [0.13, 0.5], [0.06, 1.0], [0.001, 1.25]], 9);
  const hp = heart.attributes.position.array; for (let i = 0; i < hp.length; i++) L.push(hp[i]);
  const g = { leaves: fromTriangles(L), spines: fromTriangles(S) };
  MAGUEY.set(v, g);
  return g;
}
/** Plant a maguey at (x, y, z), scale s, turned by yaw; `col` keeps the walker out of its leaves. */
export function maguey(bag, col, x, y, z, s = 1, yaw = 0, v = 0) {
  const g = magueyGeo(v % 3), m = new Matrix4().makeRotationY(yaw).scale(new Vector3(s, s, s)).setPosition(x, y, z);
  if (bag.addInstance) { bag.addInstance('clay_green', g.leaves.clone(), m, { reach: 260 }); bag.addInstance('bark_dark', g.spines.clone(), m, { reach: 60 }); }
  else { bag.add('clay_green', g.leaves.clone().applyMatrix4(m)); bag.add('bark_dark', g.spines.clone().applyMatrix4(m)); }
  if (col) col.circle(x, z, 0.9 * s, y, y + 1.4 * s);
}

const NOPAL = new Map();
/** A pad: a flat ellipse 2r × 2.8r, 2t thick, its foot at the origin, standing in the xy plane. */
function pad(r, t) {
  const g = lathe([[0.001, -t], [r * 0.6, -t * 0.85], [r * 0.92, -t * 0.4], [r, 0], [r * 0.92, t * 0.4], [r * 0.6, t * 0.85], [0.001, t]], 12);
  g.scale(1, 1, 1.4); g.rotateX(Math.PI / 2); g.translate(0, r * 1.4, 0);
  return g;
}
/**
 * A nopal, about 1.8 m high at s = 1: a short woody trunk, pads branching from the rims of the pads
 * below in three or four tiers, each turned and leaning out; red and yellow fruit (tunas) on the rims
 * of the topmost. { pads, trunk, fruit }.
 */
function nopalGeo(v) {
  if (NOPAL.has(v)) return NOPAL.get(v);
  const rand = rng(301 + v * 29), P = [], T = [], F = [];
  const put = (g, out, M) => { g.applyMatrix4(M); const a = g.attributes.position.array; for (let i = 0; i < a.length; i++) out.push(a[i]); };
  // the trunk: two old pads gone woody, round in section
  put(lathe([[0.09, 0], [0.08, 0.3], [0.06, 0.42], [0.001, 0.45]], 8), T, new Matrix4());
  const grow = (M, depth) => {
    const r = 0.13 + rand() * 0.04;
    put(pad(r, 0.022), P, M.clone());
    if (depth >= 3) {
      if (rand() < 0.7) for (let i = 0; i < 2 + Math.floor(rand() * 3); i++) {
        const a = -0.9 + rand() * 1.8, p = new Vector3(Math.sin(a) * r * 0.95, r * 1.4 + Math.cos(a) * r * 1.3, 0).applyMatrix4(M);
        put(lathe([[0.001, 0], [0.028, 0.01], [0.034, 0.04], [0.026, 0.07], [0.001, 0.075]], 7), F, new Matrix4().makeTranslation(p.x, p.y - 0.01, p.z));
      }
      return;
    }
    const kids = depth === 0 ? 3 : 1 + Math.floor(rand() * 2.2);
    for (let i = 0; i < kids; i++) {
      const a = (kids === 1 ? 0 : -0.7 + 1.4 * i / (kids - 1)) + (rand() - 0.5) * 0.3;          // where on the rim, from the top
      const lean = a * 0.8 + (rand() - 0.5) * 0.4, turn = (rand() - 0.5) * 1.6;
      const C = new Matrix4().makeTranslation(Math.sin(a) * r * 0.9, r * 1.4 + Math.cos(a) * r * 1.26 - 0.03, 0)
        .multiply(new Matrix4().makeRotationZ(-lean)).multiply(new Matrix4().makeRotationY(turn));
      grow(M.clone().multiply(C), depth + 1);
    }
  };
  for (let i = 0; i < 2; i++) grow(new Matrix4().makeTranslation(0, 0.4, 0).multiply(new Matrix4().makeRotationY(i * 1.6 + v)).multiply(new Matrix4().makeRotationZ((i ? 1 : -1) * 0.25)), 0);
  const g = { pads: fromTriangles(P), trunk: fromTriangles(T), fruit: fromTriangles(F) };
  NOPAL.set(v, g);
  return g;
}
/** Plant a nopal at (x, y, z), scale s, turned by yaw. */
export function nopal(bag, col, x, y, z, s = 1, yaw = 0, v = 0) {
  const g = nopalGeo(v % 3), m = new Matrix4().makeRotationY(yaw).scale(new Vector3(s, s, s)).setPosition(x, y, z);
  const fr = v % 2 ? 'stucco_red' : 'paint_ochre';
  for (const [mat, geo, reach] of [['palm_leaf', g.pads, 240], ['bark_grey', g.trunk, 120], [fr, g.fruit, 70]]) {
    if (!geo.attributes.position.count) continue;
    if (bag.addInstance) bag.addInstance(mat, geo.clone(), m, { reach }); else bag.add(mat, geo.clone().applyMatrix4(m));
  }
  if (col) col.circle(x, z, 0.6 * s, y, y + 1.6 * s);
}

/** meso_plants { plants: [[kind ('maguey' | 'nopal'), x, z, y, s, yaw, v]] }: plants laid where the plan's builder found room for them. */
export function mesoPlants(el, { bag, col }) {
  for (const [kind, x, z, y, s, yaw, v] of el.plants) (kind === 'nopal' ? nopal : maguey)(bag, el.collide === false ? null : col, x, y, z, s, yaw, v);
}
