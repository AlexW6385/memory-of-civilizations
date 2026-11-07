// The cloud forest's undergrowth at Machu Picchu (docs/settlements/machu-picchu.md §7.1), built as instanced
// solids since the flora catalogue has neither: the tree fern (Cyathea) — a slender dark trunk rough with old
// frond bases, a crown of arching fronds cut into pinnae — and the terrestrial bromeliad, a rosette of stiff
// strap leaves round a red heart, on the slopes' rocks and soil.

import { fromTriangles, lathe } from '../../core/geom.js';
import { Matrix4, Vector3 } from '../../core/three.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const push = (out, g) => { const a = g.attributes.position.array; for (let i = 0; i < a.length; i++) out.push(a[i]); };

const FERN = new Map();
/** A tree fern 4 m high at s = 1: { trunk, fronds }. */
function fernGeo(v) {
  if (FERN.has(v)) return FERN.get(v);
  const rand = rng(511 + v * 37), T = [], F = [], H = 3.4 + v * 0.4;
  push(T, lathe([[0.2, -0.3], [0.17, 0.2], [0.13, H * 0.5], [0.12, H - 0.2], [0.16, H], [0.06, H + 0.15], [0.001, H + 0.18]], 8, (th, i) => 1 + 0.08 * Math.sin(th * 4 + i * 1.7)));
  // the fronds: a rachis rising out of the crown and arching over, pinnae either side shrinking to the tip; one face (the leaf material is drawn two-sided)
  const n = 11;
  for (let i = 0; i < n; i++) {
    const az = i * 2 * Math.PI / n + (rand() - 0.5) * 0.3, c = Math.cos(az), s = Math.sin(az), len = 2.0 + rand() * 0.6, rise = 0.75 + rand() * 0.35;
    const N = 16, pts = [];
    for (let k = 0; k <= N; k++) { const t = k / N; pts.push([c * len * t * 0.85, H + 0.1 + len * 0.55 * (Math.sin(rise) * t - 0.55 * t * t * (2 - rise)), s * len * t * 0.85]); }
    const px = -s, pz = c;
    for (let k = 0; k < N; k++) {
      const a = pts[k], b = pts[k + 1], t = (k + 0.5) / N, w = 0.38 * Math.sin(Math.PI * Math.min(1, t * 1.1)) + 0.04;
      // the rachis strip, and two pinnae on each side, angled forward
      for (const sd of [-1, 1]) {
        const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2], tip = [m[0] + px * sd * w + (b[0] - a[0]) * 0.6, m[1] - w * 0.18, m[2] + pz * sd * w + (b[2] - a[2]) * 0.6];
        F.push(...a, ...b, ...tip);
      }
    }
  }
  const g = { trunk: fromTriangles(T), fronds: fromTriangles(F) };
  FERN.set(v, g);
  return g;
}
const BROM = new Map();
/** A bromeliad 0.6 m across at s = 1: { leaves, heart }. */
function bromGeo(v) {
  if (BROM.has(v)) return BROM.get(v);
  const rand = rng(733 + v * 13), L = [], Hh = [];
  for (let i = 0; i < 16; i++) {
    const az = i * 2.4 + rand() * 0.3, c = Math.cos(az), s = Math.sin(az), len = 0.32 + rand() * 0.14, rise = 0.5 + (i % 3) * 0.3, w = 0.03;
    const p0 = [0, 0.02, 0], p1 = [c * len * 0.6 * Math.cos(rise * 0.7), len * 0.6 * Math.sin(rise), s * len * 0.6 * Math.cos(rise * 0.7)], p2 = [c * len * Math.cos(rise * 0.4), len * Math.sin(rise) * 0.7, s * len * Math.cos(rise * 0.4)];
    const q = [-s * w, 0, c * w];
    const a0 = [p0[0] - q[0], p0[1], p0[2] - q[2]], a1 = [p0[0] + q[0], p0[1], p0[2] + q[2]], b0 = [p1[0] - q[0], p1[1], p1[2] - q[2]], b1 = [p1[0] + q[0], p1[1], p1[2] + q[2]];
    L.push(...a0, ...a1, ...b1, ...a0, ...b1, ...b0, ...b0, ...b1, ...p2);
  }
  push(Hh, lathe([[0.05, 0], [0.045, 0.08], [0.02, 0.16], [0.001, 0.18]], 7));
  const g = { leaves: fromTriangles(L), heart: fromTriangles(Hh) };
  BROM.set(v, g);
  return g;
}
/** inca_plants { plants: [[kind ('fern' | 'bromeliad'), x, z, y, s, yaw, v]] }. */
export function incaPlants(el, { bag, col }) {
  for (const [kind, x, z, y, s, yaw, v] of el.plants) {
    const m = new Matrix4().makeRotationY(yaw).scale(new Vector3(s, s, s)).setPosition(x, y, z);
    const parts = kind === 'fern' ? (({ trunk, fronds }) => [['bark_dark', trunk, 200], ['palm_leaf', fronds, 240]])(fernGeo(v % 3)) : (({ leaves, heart }) => [['palm_leaf', leaves, 90], ['stucco_red', heart, 60]])(bromGeo(v % 3));
    for (const [mat, g, reach] of parts) { if (bag.addInstance) bag.addInstance(mat, g.clone(), m, { reach }); else bag.add(mat, g.clone().applyMatrix4(m)); }
    if (kind === 'fern' && col) col.circle(x, z, 0.25 * s, y, y + 3 * s);
  }
}
