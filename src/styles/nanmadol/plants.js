// The planting of Nan Madol's islets at true heights (docs/settlements/nan-madol.md §8): coconut palms 9–13 m on a leaning trunk,
// breadfruit trees 5–7 m with a dense dark crown, ivory palms (Metroxylon, the thatch palm) 4–6 m with a crown of arched fronds,
// banana clumps, hibiscus (the bark's sakau wrap), pandanus on prop roots at the shore, taro beds in their stone-ringed mud.
// Each kind is built once per variant and placed as instances (the bag merges them where there are too few to instance).
import { box, lathe, rod, fromTriangles } from '../../core/geom.js';
import { Matrix4 } from '../../core/three.js';
import { rng } from './crib.js';

/** A leaf blade along +z from the origin: length len, width wid at its widest, rising `rise` then drooping `droop`; both faces. */
function blade(len, wid, rise, droop, n = 4, taper = 0.7) {
  const t = [], row = (k) => { const s = k / n, w = wid * Math.pow(Math.sin(Math.PI * Math.min(0.97, s * 0.9 + 0.08)), taper) * (k === n ? 0.05 : 1), y = rise * s - droop * s * s; return [[-w / 2, y, len * s], [w / 2, y, len * s]]; };
  for (let k = 0; k < n; k++) {
    const [a0, a1] = row(k), [b0, b1] = row(k + 1);
    const lo = (q) => [q[0], q[1] - 0.12, q[2]];
    t.push(...a0, ...a1, ...b1, ...a0, ...b1, ...b0, ...lo(a0), ...lo(b1), ...lo(a1), ...lo(a0), ...lo(b0), ...lo(b1));
  }
  return t;
}
const merge = (list) => list.flat();
/** fronds round a crown at (cx, cy, cz): count, length, width, rise, droop. */
function crown(cx, cy, cz, count, len, wid, rise, droop, rand, spread = 1) {
  const out = [];
  for (let i = 0; i < count; i++) {
    const a = i / count * Math.PI * 2 + rand() * 0.4, l = len * (0.8 + rand() * 0.4), g = fromTriangles(blade(l, wid, rise * (0.7 + rand() * 0.6), droop * (0.8 + rand() * 0.5), 4));
    g.rotateY(a); g.translate(cx, cy, cz); out.push(g);
    void spread;
  }
  return out;
}
const ball = (r, x, y, z, n = 6) => lathe([[0.001, -r], [r * 0.9, -r * 0.45], [r, 0], [r * 0.9, r * 0.45], [0.001, r]], n, null, x, y, z);

const CACHE = new Map();
/** The pieces of a plant: [[material, geometry], …] at the origin, at its own scale (1 = true size). */
function proto(kind, v) {
  const key = kind + v;
  if (CACHE.has(key)) return CACHE.get(key);
  const rand = rng(900 + v * 17 + kind.length * 31), P = [];
  if (kind === 'coconut') {
    const h = 9.5 + rand() * 3.5, lean = 0.05 + rand() * 0.1, ang = rand() * 6.28, N = 5;
    let prev = [0, 0, 0];
    for (let i = 1; i <= N; i++) {
      const s = i / N, bend = lean * h * s * s, q = [Math.cos(ang) * bend, h * s, Math.sin(ang) * bend];
      P.push(['bark_grey', rod(prev, q, 0.2 - 0.09 * s, 7)]); prev = q;
    }
    P.push(['bark_dark', lathe([[0.3, 0], [0.22, 0.25], [0.19, 0.5]], 7, null, 0, 0, 0)]);
    const [cx, cy, cz] = prev;
    const f = crown(cx, cy, cz, 11 + (v % 3), 3.6, 0.7, 1.3, 2.4, rand);
    P.push(['palm_leaf', fromTriangles(merge(f.map((g) => Array.from(g.attributes.position.array))))]);
    for (let i = 0; i < 5; i++) P.push(['bark_dark', ball(0.13, cx + (rand() - 0.5) * 0.5, cy - 0.25 - rand() * 0.2, cz + (rand() - 0.5) * 0.5)]);
  } else if (kind === 'breadfruit') {
    const h = 4.2 + rand() * 1.8;
    P.push(['bark_grey', lathe([[0.32, 0], [0.22, h * 0.4], [0.17, h]], 8)]);
    for (let i = 0; i < 3; i++) { const a = i * 2.1 + rand(); P.push(['bark_grey', rod([0, h * 0.8, 0], [Math.cos(a) * 1.3, h + 0.6, Math.sin(a) * 1.3], 0.07, 5)]); }
    for (let i = 0; i < 6; i++) {
      const a = i * 1.05 + rand() * 0.5, d = i === 0 ? 0 : 1.3 + rand() * 0.8, r = 1.5 + rand() * 0.8;
      P.push(['palm_leaf', lathe([[0.001, 0], [r * 0.7, r * 0.2], [r, r * 0.65], [r * 0.7, r * 1.1], [0.001, r * 1.35]], 8, null, Math.cos(a) * d, h - 0.2 + rand() * 1.2, Math.sin(a) * d)]);
    }
    for (let i = 0; i < 6; i++) { const a = rand() * 6.28, d = 0.8 + rand() * 1.8; P.push(['cloth_green', ball(0.17, Math.cos(a) * d, h + 0.1 + rand() * 1.4, Math.sin(a) * d)]); }
  } else if (kind === 'ivory') {
    const h = 4 + rand() * 2, lean = rand() * 0.3, ang = rand() * 6.28, top = [Math.cos(ang) * lean * 2, h, Math.sin(ang) * lean * 2];
    P.push(['bark_dark', rod([0, 0, 0], top, 0.24, 8)]);
    P.push(['bark_dark', lathe([[0.4, 0], [0.26, 0.3]], 8)]);
    const f = crown(top[0], top[1], top[2], 14, 5.0, 0.8, 2.6, 3.6, rand);
    P.push(['palm_leaf', fromTriangles(merge(f.map((g) => Array.from(g.attributes.position.array))))]);
    for (let i = 0; i < 7; i++) P.push(['thatch_palm', ball(0.2, top[0] + (rand() - 0.5) * 0.7, top[1] - 0.4, top[2] + (rand() - 0.5) * 0.7)]);
  } else if (kind === 'banana') {
    const n = 2 + (v % 2);
    for (let s = 0; s < n; s++) {
      const a = s * 2.3 + rand(), d = s ? 0.5 + rand() * 0.3 : 0, h = 2.6 + rand() * 1.0, x = Math.cos(a) * d, z = Math.sin(a) * d;
      P.push(['bark_grey', lathe([[0.12, 0], [0.09, h * 0.6], [0.07, h]], 7, null, x, 0, z)]);
      const f = crown(x, h, z, 6 + (s % 2), 1.9, 0.5, 0.8, 0.8, rand);
      P.push(['palm_leaf', fromTriangles(merge(f.map((g) => Array.from(g.attributes.position.array))))]);
      if (s === 0) { P.push(['bark_dark', rod([x, h - 0.1, z], [x + 0.15, h - 0.7, z], 0.02, 4)]); for (let i = 0; i < 6; i++) P.push(['glaze_yellow', lathe([[0.001, 0], [0.045, 0.1], [0.04, 0.2], [0.001, 0.24]], 5, null, x + 0.15 + Math.cos(i) * 0.1, h - 1.0 + (i % 3) * 0.08, z + Math.sin(i) * 0.1)]); }
    }
  } else if (kind === 'hibiscus') {
    const R = 1.4 + rand() * 0.6;
    for (let i = 0; i < 4; i++) { const a = i * 1.6 + rand(); P.push(['bark_grey', rod([Math.cos(a) * 0.2, 0, Math.sin(a) * 0.2], [Math.cos(a) * 0.9, 1.9 + rand() * 0.6, Math.sin(a) * 0.9], 0.05, 5)]); }
    for (let i = 0; i < 5; i++) { const a = i * 1.3 + rand(); P.push(['palm_leaf', lathe([[0.001, 0], [R * 0.6, R * 0.2], [R * 0.7, R * 0.5], [R * 0.4, R * 0.8], [0.001, R * 0.95]], 7, null, Math.cos(a) * 0.7, 2.1 + rand() * 0.5, Math.sin(a) * 0.7)]); }
    for (let i = 0; i < 5; i++) { const a = rand() * 6.28, d = 0.8 + rand() * 0.8; P.push(['glaze_yellow', lathe([[0.001, 0], [0.09, 0.02], [0.001, 0.07]], 6, null, Math.cos(a) * d, 2.8 + rand() * 1.0, Math.sin(a) * d)]); }
  } else if (kind === 'pandanus') {
    const h = 2.6 + rand() * 1.2;
    P.push(['bark_grey', lathe([[0.14, 0], [0.12, h]], 7)]);
    for (let i = 0; i < 7; i++) { const a = i / 7 * 6.28 + rand() * 0.3; P.push(['bark_dark', rod([Math.cos(a) * 0.1, h * 0.55, Math.sin(a) * 0.1], [Math.cos(a) * 0.9, 0, Math.sin(a) * 0.9], 0.035, 4)]); }
    for (let c = 0; c < 3; c++) {
      const a = c * 2.1 + rand(), cx = Math.cos(a) * 0.7, cz = Math.sin(a) * 0.7, cy = h + c * 0.3 - 0.3;
      P.push(['flax_leaf', fromTriangles(merge(crown(cx, cy, cz, 9, 1.9, 0.2, 0.9, 1.0, rand).map((g) => Array.from(g.attributes.position.array))))]);
      P.push(['bark_dark', rod([0, h * 0.8, 0], [cx, cy, cz], 0.05, 4)]);
    }
  } else if (kind === 'taro') {
    for (let i = 0; i < 5; i++) {
      const a = i * 1.3 + rand(), d = 0.15 + rand() * 0.25, h = 0.55 + rand() * 0.3, x = Math.cos(a) * d, z = Math.sin(a) * d;
      P.push(['palm_leaf', rod([x, 0, z], [x + 0.05, h, z], 0.012, 4)]);
      P.push(['palm_leaf', lathe([[0.001, 0.04], [0.2, 0.0], [0.26, -0.05], [0.12, -0.14], [0.001, -0.2]], 7, null, x + 0.05, h + 0.12, z).rotateX(0.0)]);
    }
  }
  CACHE.set(key, P);
  return P;
}
const M = new Matrix4();
/**
 * plants { list: [{ k, at: [x, z], y, s, yaw, v }] }: k one of coconut, breadfruit, ivory, banana, hibiscus, pandanus, taro.
 * Trunks stop the visitor (a small circle).
 */
export function plants(el, { bag, col }) {
  for (const p of el.list) {
    const parts = proto(p.k, (p.v ?? 0) % 4), s = p.s ?? 1;
    M.makeRotationY(p.yaw ?? 0).scale({ x: s, y: s, z: s }).setPosition(p.at[0], p.y ?? 0, p.at[1]);
    for (const [mat, g] of parts) bag.addInstance(mat, g, M.clone(), { reach: p.k === 'taro' || p.k === 'hibiscus' ? 120 : 260 });
    if (p.k === 'coconut' || p.k === 'ivory') col.circle(p.at[0], p.at[1], 0.24 * s, p.y ?? 0, (p.y ?? 0) + 4);
    else if (p.k === 'breadfruit') col.circle(p.at[0], p.at[1], 0.28 * s, p.y ?? 0, (p.y ?? 0) + 4);
  }
}
/**
 * taro_bed { c, yaw, w, l, seed }: a sunken-looking bed of mud ringed with basalt, a skin of water, taro in rows (w across, l along).
 */
export function taro_bed(el, { bag, col }) {
  const [cx, cz] = el.c, w = el.w ?? 2.4, l = el.l ?? 3.2, yaw = el.yaw ?? 0, ca = Math.cos(yaw), sa = Math.sin(yaw), rand = rng(el.seed ?? 3);
  const W = (u, v) => [cx + u * ca + v * sa, cz - u * sa + v * ca], Mt = new Matrix4().makeRotationY(yaw).setPosition(cx, 0, cz), put = (m, g) => { g.applyMatrix4(Mt); bag.add(m, g); };
  for (const [x0, z0, x1, z1] of [[-w / 2 - 0.2, -l / 2 - 0.2, w / 2 + 0.2, -l / 2], [-w / 2 - 0.2, l / 2, w / 2 + 0.2, l / 2 + 0.2], [-w / 2 - 0.2, -l / 2, -w / 2, l / 2], [w / 2, -l / 2, w / 2 + 0.2, l / 2]]) put('basalt', box(x0, 0, z0, x1, 0.28, z1));
  put('silt', box(-w / 2, 0, -l / 2, w / 2, 0.16, l / 2));
  put('water', box(-w / 2 + 0.02, 0.16, -l / 2 + 0.02, w / 2 - 0.02, 0.19, l / 2 - 0.02));
  const list = [];
  for (let u = -w / 2 + 0.4; u < w / 2 - 0.2; u += 0.6) for (let v = -l / 2 + 0.4; v < l / 2 - 0.2; v += 0.6) { const q = W(u + (rand() - 0.5) * 0.12, v + (rand() - 0.5) * 0.12); list.push({ k: 'taro', at: q, y: 0.17, s: 0.8 + rand() * 0.4, yaw: rand() * 6.28, v: Math.floor(rand() * 4) }); }
  plants({ list }, { bag, col });
  const a = W(-w / 2 - 0.2, -l / 2 - 0.2), b = W(w / 2 + 0.2, l / 2 + 0.2);
  col.rect([Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])], 0, 0.3);
}
