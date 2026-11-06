// Rapa Nui — the things of daily life round the monuments (docs/settlements/rapa-nui.md §4b): the
// small plank canoes (vaka) drawn up on the shore, the bananas sheltered in the manavai, and the
// rope of hau-bark fibre with which a statue was walked.

import { Matrix4 } from '../../core/three.js';
import { box, lathe, fromTriangles } from '../../core/geom.js';
import { tube } from '../../objects/kit.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/** A rope through world points [[x, y, z], …], of radius r, sagging a little between them. */
export function rope(bag, pts, r = 0.025, mat = 'sacking') {
  const P = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1], L = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]), sag = Math.min(0.25, L * 0.02);
    const n = Math.max(2, Math.ceil(L / 1.2));
    for (let k = 0; k < n; k++) { const t = k / n; P.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t - sag * 4 * t * (1 - t), a[2] + (b[2] - a[2]) * t, r]); }
  }
  P.push([...pts[pts.length - 1], r]);
  bag.add(mat, tube(P, 6));
}

/**
 * vaka: a small canoe drawn up on the shore { c, y, yaw (bow toward −z turned by yaw), l } — the
 * hull of short planks (none much over a metre long) sewn edge to edge, the seams caulked and
 * covered with battens, the sewing showing as rows of lashings; a light outrigger float on two
 * booms to port; a paddle across the thwart.
 */
function vaka(el, { bag, col }) {
  const [x, z] = el.c, L = el.l ?? 3.6, yaw = el.yaw ?? 0, y0 = el.y ?? 0, B = 0.48, D = 0.42;
  const M = new Matrix4().makeRotationY(yaw).setPosition(x, y0, z), add = (mat, g) => { g.applyMatrix4(M); bag.add(mat, g); };
  const beam = (u) => B / 2 * Math.max(0.002, 1 - Math.abs(2 * u / L) ** 2.4) ** 0.55, sheer = (u) => D + 0.12 * (2 * u / L) ** 4, rock = (u) => 0.12 * Math.abs(2 * u / L) ** 3;
  const NU = 20, NS = 8;
  const pt = (i, j, inner) => {
    const u = -L / 2 + L * i / NU, a = Math.PI * j / NS, b = beam(u) * (inner ? 0.86 : 1), top = sheer(u), bot = rock(u) + (inner ? 0.035 : 0);
    return [-Math.cos(a) * b, top - (top - bot) * Math.sin(a) ** 0.8, u];
  };
  const t = [];
  for (let i = 0; i < NU; i++) for (let j = 0; j < NS; j++) {
    const a = pt(i, j, false), b = pt(i + 1, j, false), c = pt(i + 1, j + 1, false), d = pt(i, j + 1, false);
    t.push(...a, ...c, ...b, ...a, ...d, ...c);
    const a2 = pt(i, j, true), b2 = pt(i + 1, j, true), c2 = pt(i + 1, j + 1, true), d2 = pt(i, j + 1, true);
    t.push(...a2, ...b2, ...c2, ...a2, ...c2, ...d2);
  }
  for (let i = 0; i < NU; i++) for (const j of [0, NS]) {
    const a = pt(i, j, false), b = pt(i + 1, j, false), c = pt(i + 1, j, true), d = pt(i, j, true);
    if (j === 0) t.push(...a, ...b, ...c, ...a, ...c, ...d); else t.push(...a, ...c, ...b, ...a, ...d, ...c);
  }
  add('wood_dark', fromTriangles(t));
  // the seams: battens along the strakes outside, and across them where plank meets plank; the
  // sewing a row of lashings along each batten
  const out = (u, a, k = 1.0) => { const b = beam(u) * k, top = sheer(u), bot = rock(u); return [-Math.cos(a) * b, top - (top - bot) * Math.sin(a) ** 0.8, u]; };
  for (const a of [Math.PI * 0.22, Math.PI * 0.5, Math.PI * 0.78]) {
    const P = [];
    for (let i = 1; i < NU; i++) { const p = out(-L / 2 + L * i / NU, a, 1.03); P.push([...p, 0.012]); }
    add('timber', tube(P, 4));
  }
  const rand = rng(Math.floor(x * 13 + z * 7));
  for (let u = -L / 2 + 0.55; u < L / 2 - 0.4; u += 0.8 + rand() * 0.25) for (const half of [0, 1]) {
    const P = [];
    for (let k = 0; k <= 4; k++) { const a = half * Math.PI / 2 + Math.PI / 2 * k / 4 + (half ? 0 : 0.02); P.push([...out(u, Math.min(Math.PI - 0.02, Math.max(0.02, a)), 1.03), 0.01]); }
    add('timber', tube(P, 4));
  }
  // thwarts, the outrigger's booms across the hull and the float to port
  for (const u of [-L * 0.22, L * 0.18]) add('timber', box(-beam(u) + 0.02, sheer(u) - 0.09, u - 0.05, beam(u) - 0.02, sheer(u) - 0.04, u + 0.05));
  const bo = 1.5;
  for (const u of [-L * 0.2, L * 0.16]) {
    const h = sheer(u) + 0.03;
    add('timber', tube([[beam(u) + 0.1, h, u, 0.03], [-beam(u) - 0.1, h + 0.02, u, 0.032], [-bo + 0.15, h - 0.05, u, 0.03], [-bo, 0.22, u, 0.025]], 5));
    add('sacking', lathe([[0.045, 0], [0.045, 0.08]], 6, null, 0, 0, 0).translate(beam(u) - 0.005, h - 0.04, u));
  }
  const fl = L * 0.62;
  add('timber', tube([[-bo, 0.12, -fl / 2, 0.03], [-bo, 0.1, -fl / 2 + 0.3, 0.07], [-bo, 0.1, fl / 2 - 0.3, 0.07], [-bo, 0.12, fl / 2, 0.03]], 7));
  // a paddle laid across
  add('timber', tube([[0.75, sheer(0) + 0.08, -0.1, 0.018], [-0.85, sheer(0) + 0.08, 0.1, 0.018]], 5));
  add('timber', box(0.75, sheer(0) + 0.06, -0.22, 1.25, sheer(0) + 0.09, 0.02));
  const ca = Math.cos(yaw), sa = Math.sin(yaw);
  for (const s of [-1, 0, 1]) col.circle(x + sa * s * L / 3, z + ca * s * L / 3, 0.4, y0, y0 + D);
}

// ---- banana -----------------------------------------------------------------------------------
/** One leaf at unit length along +x, rising and drooping, the blade torn into strips by the wind past `tear`. */
function leafGeometry(seed) {
  const rand = rng(seed), t = [], N = 14, cut = new Set();
  for (let k = 0; k < 4; k++) cut.add(2 + Math.floor(rand() * (N - 3)));
  const mid = (u) => [0.22 + u * 0.78, 0.3 * Math.sin(Math.min(1, u * 1.4) * Math.PI * 0.55) - 0.55 * Math.max(0, u - 0.35) ** 2, 0];
  const half = (u) => 0.13 * Math.sin(Math.PI * Math.min(1, 0.06 + u * 0.97)) ** 0.6;
  for (let i = 0; i < N; i++) {
    const u0 = i / N, u1 = (i + 1) / N, m0 = mid(u0), m1 = mid(u1);
    for (const s of [-1, 1]) {
      const d0 = half(u0), d1 = cut.has(i) && s > 0 ? half(u1) * 0.92 : half(u1);
      const sl = (d) => -0.35 * d;                                  // the halves fold down from the midrib
      const a = [m0[0], m0[1], 0], b = [m1[0], m1[1], 0], c = [m1[0] + 0.01, m1[1] + sl(d1), s * d1], e = [m0[0] - (cut.has(i) ? 0.008 : 0), m0[1] + sl(d0), s * d0];
      t.push(...a, ...b, ...c, ...a, ...c, ...e);
    }
  }
  // the petiole from the stem's top to the blade
  t.push(0, 0, -0.015, 0.22, 0.04, -0.012, 0.22, 0.04, 0.012, 0, 0, -0.015, 0.22, 0.04, 0.012, 0, 0, 0.015);
  return fromTriangles(t);
}
const LEAVES = [1, 2, 3].map((k) => leafGeometry(k * 977));
/** banana: a clump { at, y, h (the stem's height), n (stems), seed } — pseudostems with their crowns of broad, wind-torn leaves, a dead leaf hanging. */
function banana(el, { bag, col }) {
  const [x0, z0] = el.at, y0 = el.y ?? 0, rand = rng(el.seed ?? 5), n = el.n ?? 2;
  for (let s = 0; s < n; s++) {
    const a = rand() * 6.28, d = s === 0 ? 0 : 0.35 + rand() * 0.3, x = x0 + Math.cos(a) * d, z = z0 + Math.sin(a) * d;
    const h = (el.h ?? 2.2) * (s === 0 ? 1 : 0.55 + rand() * 0.35), r = 0.1 + 0.04 * h / 2.2;
    bag.add('papyrus', lathe([[r * 1.25, -0.1], [r * 1.15, 0.2], [r, h * 0.5], [r * 0.8, h], [r * 0.4, h + 0.08], [0.001, h + 0.1]], 9, null, x, y0, z));
    const L = 1.3 + h * 0.4, nl = 6 + Math.floor(rand() * 3);
    for (let k = 0; k < nl; k++) {
      const yaw = k / nl * 6.28 + rand() * 0.6, up = (k % 3) * 0.12;
      const m = new Matrix4().makeTranslation(x, y0 + h - 0.05, z).multiply(new Matrix4().makeRotationY(yaw)).multiply(new Matrix4().makeRotationZ(0.35 - up - (k === 0 ? -0.5 : 0))).multiply(new Matrix4().makeScale(L, L, L * (0.9 + rand() * 0.25)));
      if (bag.addInstance) bag.addInstance('palm_leaf', LEAVES[k % 3], m, { reach: 200 }); else bag.add('palm_leaf', LEAVES[k % 3].clone().applyMatrix4(m));
    }
    // a dead leaf hanging against the stem
    const dy = rand() * 6.28, cx = Math.cos(dy), cz = Math.sin(dy);
    const dl = [];
    for (let k = 0; k < 4; k++) {
      const p = (j, side) => { const t = j / 4, w = (0.13 - 0.07 * t) * side, rr = r + 0.03 + 0.1 * t; return [x + cx * rr - cz * w, y0 + h * (0.95 - 0.5 * t), z + cz * rr + cx * w]; };
      const A = p(k, -1), Bq = p(k + 1, -1), C = p(k + 1, 1), D = p(k, 1);
      dl.push(...A, ...Bq, ...C, ...A, ...C, ...D);
    }
    bag.add('palm_trunk', fromTriangles(dl));
    col.circle(x, z, r * 1.3, y0, y0 + h);
  }
}

export const SCENES = { vaka, banana };
