// Small built things of the town's open ground (docs/settlements/kilwa.md §18): the ablution tank (the mosque's
// kerbed basin of water, steps down, a jar and a ladle), the tombs of the graveyard (a plastered slab with a
// headstone, or the pillar tomb: a square coral pillar with a pointed head and a niche on a stepped plinth),
// a low bench of coral rag along a wall, a raised well with its rope and pot, and fish-drying racks on the beach.
import { box, lathe, fromTriangles } from '../../core/geom.js';
import { beamTris } from '../ming/index.js';

const C = 'lime_plaster_rough', DR = 'limestone';

/** swahili_tank: { rect, y } — a basin sunk into a kerbed platform with steps down and a jar. */
export function tank(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, k = 0.45;
  for (const r of [[x0, z0, x1, z0 + k], [x0, z1 - k, x1, z1], [x0, z0 + k, x0 + k, z1 - k], [x1 - k, z0 + k, x1, z1 - k]]) { bag.add(C, box(r[0], y - 0.3, r[1], r[2], y + 0.5, r[3])); col.rect(r, y - 0.3, y + 0.5); }
  bag.add(DR, box(x0 - 0.04, y + 0.5, z0 - 0.04, x1 + 0.04, y + 0.56, z0 + k + 0.04)); bag.add(DR, box(x0 - 0.04, y + 0.5, z1 - k - 0.04, x1 + 0.04, y + 0.56, z1 + 0.04));
  bag.add(DR, box(x0 - 0.04, y + 0.5, z0 + k, x0 + k + 0.04, y + 0.56, z1 - k)); bag.add(DR, box(x1 - k - 0.04, y + 0.5, z0 + k, x1 + 0.04, y + 0.56, z1 - k));
  bag.add('opening', box(x0 + k, y - 0.28, z0 + k, x1 - k, y - 0.26, z1 - k));
  bag.add('water', fromTriangles([x0 + k, y + 0.18, z0 + k, x0 + k, y + 0.18, z1 - k, x1 - k, y + 0.18, z1 - k, x0 + k, y + 0.18, z0 + k, x1 - k, y + 0.18, z1 - k, x1 - k, y + 0.18, z0 + k]));
  bag.add('terracotta', lathe([[0.001, 0], [0.16, 0.02], [0.2, 0.2], [0.14, 0.38], [0.15, 0.42], [0.001, 0.42]], 8, null, x1 + 0.5, y, z0 + 0.4));
}

/** swahili_tomb: { at, y, rot, kind ('pillar' | 'slab'), seed } — facing the qibla (north: −z when rot is 0). */
export function tomb(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, rot = el.rot ?? 0, c = Math.cos(rot), s = Math.sin(rot);
  const P = (u, v) => [x + u * c - v * s, z + u * s + v * c];
  const rect = (u0, v0, u1, v1, y0, y1, m) => {
    const a = P(u0, v0), b = P(u1, v1), x0 = Math.min(a[0], b[0]), x1 = Math.max(a[0], b[0]), z0 = Math.min(a[1], b[1]), z1 = Math.max(a[1], b[1]);
    bag.add(m, box(x0, y0, z0, x1, y1, z1)); col.rect([x0, z0, x1, z1], y0, y1);
  };
  if (el.kind === 'pillar') {
    // a stepped plinth, the square shaft, a niche's dark hollow in the face to the road, the pyramid head
    rect(-1.0, -0.6, 1.0, 0.6, y - 0.2, y + 0.25, C); rect(-0.8, -0.45, 0.8, 0.45, y + 0.25, y + 0.55, C);
    rect(-0.28, -0.28, 0.28, 0.28, y + 0.55, y + 3.3, 'lime_plaster');
    const q = P(0, 0.285); bag.add('opening', box(q[0] - 0.12 * Math.abs(s) - 0.12 * Math.abs(c), y + 1.4, q[1] - 0.12 * Math.abs(c) - 0.12 * Math.abs(s), q[0] + 0.12 * Math.abs(s) + 0.12 * Math.abs(c), y + 1.9, q[1] + 0.001));
    const T = [], h = [P(-0.3, -0.3), P(0.3, -0.3), P(0.3, 0.3), P(-0.3, 0.3)], top = [x, y + 3.9, z];
    for (let i = 0; i < 4; i++) { const a = h[i], b = h[(i + 1) % 4]; T.push(a[0], y + 3.3, a[1], b[0], y + 3.3, b[1], top[0], top[1], top[2]); }
    bag.add('lime_plaster', fromTriangles(T));
    for (let k = 0; k < 3; k++) rect(-0.3, -0.3, 0.3, 0.3, y + 1.0 + k * 0.9, y + 1.04 + k * 0.9, DR);
  } else {
    rect(-0.45, -1.0, 0.45, 1.0, y - 0.15, y + 0.35, 'lime_plaster'); rect(-0.45, -1.05, 0.45, -0.9, y + 0.35, y + 0.95, DR);
    rect(-0.3, 0.9, 0.3, 0.98, y + 0.35, y + 0.55, DR);
  }
  void el.seed;
}

/** swahili_bench: { rect, y } — a bench of coral rag with a plaster top, along a wall. */
export function benchRag(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0;
  bag.add(C, box(x0, y - 0.2, z0, x1, y + 0.42, z1)); bag.add(DR, box(x0 - 0.02, y + 0.42, z0 - 0.02, x1 + 0.02, y + 0.47, z1 + 0.02)); col.rect(el.rect, y - 0.2, y + 0.47);
}

/** fish_rack: { at, y, rot, len } — a drying rack of mangrove poles, split fish hung in rows, a net over the lower rail. */
export function fishRack(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, L = el.len ?? 3.4, rot = el.rot ?? 0, c = Math.cos(rot), s = Math.sin(rot);
  const W = (u, v, h) => [x + u * c - v * s, y + h, z + u * s + v * c];
  const T = [];
  for (const u of [-L / 2, L / 2]) for (const v of [-0.3, 0.3]) beamTris(T, W(u, v, 0), W(u, v, 1.7), 0.04, 0.035);
  for (const h of [1.65, 1.0]) for (const v of [-0.3, 0.3]) beamTris(T, W(-L / 2 - 0.1, v, h), W(L / 2 + 0.1, v, h), 0.03, 0.03);
  bag.add('wood_dark', fromTriangles(T));
  const F = [];
  for (let u = -L / 2 + 0.2; u < L / 2 - 0.1; u += 0.28) for (const v of [-0.3, 0.3]) { const a = W(u, v, 1.65), b = W(u + 0.1, v, 1.65), cc = W(u + 0.05, v, 1.2); F.push(...a, ...b, ...cc, ...a, ...cc, ...b); }
  bag.add('hide_grey', fromTriangles(F));
  bag.add('rope_fibre', box(Math.min(W(-L / 2, 0.31, 0)[0], W(L / 2, 0.31, 0)[0]) - 0.02, y + 0.35, Math.min(W(-L / 2, 0.31, 0)[2], W(L / 2, 0.31, 0)[2]) - 0.02, Math.max(W(-L / 2, 0.31, 0)[0], W(L / 2, 0.31, 0)[0]) + 0.02, y + 0.37, Math.max(W(-L / 2, 0.31, 0)[2], W(L / 2, 0.31, 0)[2]) + 0.02));
  col.circle(x, z, L / 2, y, y + 1.7);
}
