// Māori building of the 18th century (docs/settlements/maori.md §4): palisades of split timber with
// taller carved posts; fighting stages on posts; houses (whare) with low walls, a steep gabled roof
// of raupō thatch, a front porch under carved bargeboards (maihi) meeting at a carved face
// (koruru), red ochre (kōkōwai); storehouses (pātaka) raised on posts; kūmara pits under low
// pitched roofs; gateways (waharoa); canoes (waka) on the shore.

import { registerStyle, STYLES, orientedBox } from '../../core/build.js';
import { box, lathe, fromTriangles } from '../../core/geom.js';
import { Matrix4 } from 'three';
import '../qing/index.js';

const K = 'kokowai', P = 'palisade', TH = 'raupo';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const post = (bag, x, y, z, r, h, mat = P) => bag.add(mat, lathe([[r, 0], [r * 0.9, h], [0.001, h + r]], 7, null, x, y, z));

/** palisade: { a, b, y, h } — close-set posts with taller carved posts and two rails. */
function palisade(el, { bag, col }) {
  const [ax, az] = el.a, [bx, bz] = el.b, y = el.y ?? 0, h = el.h ?? 4, L = Math.hypot(bx - ax, bz - az);
  if (L < 0.5) return;
  const ux = (bx - ax) / L, uz = (bz - az) / L, n = Math.round(L / (el.simple ? 1.2 : 0.45));
  for (let i = 0; i <= n; i++) {
    const x = ax + ux * L * i / n, z = az + uz * L * i / n, big = i % 9 === 0;
    post(bag, x, y - 0.5, z, big ? 0.22 : 0.12, (big ? h + 1.4 : h) + 0.5 + ((i * 37) % 5) * 0.06, big ? K : P);
    if (big && !el.simple) bag.add(K, box(x - 0.24, y + h + 0.4, z - 0.24, x + 0.24, y + h + 1.0, z + 0.24));
  }
  for (const yy of [y + 1.0, y + h - 0.6]) bag.add(P, orientedBox(el.a, el.b, 0.12, yy, yy + 0.12));
  col.segment(el.a, el.b, 0.4, y - 0.5, y + h);
}

/** gable house frame: a house { c, yaw, w, l, h (walls), rise, porch, carved, rank } in its own frame, facing −z (the porch). */
function whare(el, { bag, col }) {
  const [cx, cz] = el.c, yaw = el.yaw ?? 0, w = el.w ?? 4, l = el.l ?? 6, h = el.h ?? 1.2, rise = el.rise ?? w * 0.55, pr = el.porch ?? 1.6, y0 = el.y ?? 0;
  const m = new Matrix4().makeRotationY(yaw).setPosition(cx, y0, cz), parts = [];
  const add = (mat, g) => { g.applyMatrix4(m); bag.add(mat, g); };
  // the walls (the front wall set back behind the porch)
  add(TH, box(-w / 2, -0.2, -l / 2 + pr, -w / 2 + 0.25, h, l / 2)); add(TH, box(w / 2 - 0.25, -0.2, -l / 2 + pr, w / 2, h, l / 2));
  add(TH, box(-w / 2, -0.2, l / 2 - 0.25, w / 2, h + rise * 0.98, l / 2));
  add('timber', box(-w / 2, -0.2, -l / 2 + pr, -0.35, h + rise * 0.9, -l / 2 + pr + 0.15)); add('timber', box(0.35, -0.2, -l / 2 + pr, w / 2, h + rise * 0.9, -l / 2 + pr + 0.15));
  add('timber', box(-0.35, 1.3, -l / 2 + pr, 0.35, h + rise * 0.9, -l / 2 + pr + 0.15));
  // the roof: two slopes running the house's length, porch included, eaves low
  const t = [], ov = 0.4, e = h - 0.1;
  const R = (x, yy, z) => [x, yy, z];
  for (const s of [-1, 1]) {
    const a = R(s * (w / 2 + ov), e, -l / 2 - 0.1), b = R(s * (w / 2 + ov), e, l / 2 + 0.2), c = R(0, h + rise, l / 2 + 0.2), d = R(0, h + rise, -l / 2 - 0.1);
    t.push(...a, ...b, ...c, ...a, ...c, ...d, ...a, ...c, ...b, ...a, ...d, ...c);
  }
  add(TH, fromTriangles(t));
  // the carved front: the porch posts (amo), the bargeboards (maihi), the face at the apex (koruru)
  if (el.carved !== false) {
    for (const s of [-1, 1]) {
      add(K, box(s * w / 2 - 0.2, -0.2, -l / 2 - 0.15, s * w / 2 + 0.2, e, -l / 2 + 0.15));
      const g = orientedBox([s * (w / 2 + ov), 0], [0, 0], 0.08, -0.3, 0.3);
      const ang = Math.atan2(rise + 0.1, w / 2 + ov);
      g.applyMatrix4(new Matrix4().makeTranslation(-s * (w / 2 + ov) / 2, 0, 0));
      g.applyMatrix4(new Matrix4().makeRotationZ(s * ang));
      g.applyMatrix4(new Matrix4().makeTranslation(s * (w / 2 + ov) / 2, e + (rise + 0.1) / 2, -l / 2 - 0.15));
      add(K, g);
    }
    add(K, box(-0.3, h + rise - 0.6, -l / 2 - 0.3, 0.3, h + rise + 0.5, -l / 2 - 0.05));
    if ((el.rank ?? 0) > 0) add(K, lathe([[0.25, 0], [0.18, 0.9], [0.001, 1.2]], 6, null, 0, h + rise + 0.5, -l / 2 - 0.18));
  }
  const ca = Math.cos(yaw), sa = Math.sin(yaw);
  const P2 = (x, z) => [cx + x * ca + z * sa, cz - x * sa + z * ca];
  col.segment(P2(-w / 2, -l / 2 + pr), P2(-w / 2, l / 2), 0.3, y0, y0 + h + rise * 0.5);
  col.segment(P2(w / 2, -l / 2 + pr), P2(w / 2, l / 2), 0.3, y0, y0 + h + rise * 0.5);
  col.segment(P2(-w / 2, l / 2), P2(w / 2, l / 2), 0.3, y0, y0 + h + rise);
}

/** pataka: a storehouse raised on posts { c, yaw, w, l, lift }. */
function pataka(el, ctx) {
  const { bag, col } = ctx, [cx, cz] = el.c, yaw = el.yaw ?? 0, w = el.w ?? 1.8, l = el.l ?? 2.6, lift = el.lift ?? 1.8, y0 = el.y ?? 0;
  const ca = Math.cos(yaw), sa = Math.sin(yaw), P2 = (x, z) => [cx + x * ca + z * sa, cz - x * sa + z * ca];
  for (const [x, z] of [[-w / 2 + 0.2, -l / 2 + 0.3], [w / 2 - 0.2, -l / 2 + 0.3], [-w / 2 + 0.2, l / 2 - 0.2], [w / 2 - 0.2, l / 2 - 0.2]]) { const [px, pz] = P2(x, z); post(bag, px, y0 - 0.3, pz, 0.12, lift + 0.3, K); col.circle(px, pz, 0.14, y0, y0 + lift); }
  const [fx, fz] = P2(0, 0);
  bag.add('timber', box(fx - Math.max(w, l) / 2 * 0.7, y0 + lift - 0.1, fz - Math.max(w, l) / 2 * 0.7, fx + Math.max(w, l) / 2 * 0.7, y0 + lift + 0.05, fz + Math.max(w, l) / 2 * 0.7));
  whare({ c: el.c, yaw, w, l, h: 1.0, rise: w * 0.5, porch: 0.5, y: y0 + lift, rank: 1 }, ctx);
}

/** stage: a fighting stage (pūwhara) { c, h, s } — a platform on tall posts by the palisade. */
function stage(el, { bag, col }) {
  const [x, z] = el.c, h = el.h ?? 6, s = el.s ?? 2.4, y0 = el.y ?? 0;
  for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { post(bag, x + dx * s / 2, y0 - 0.5, z + dz * s / 2, 0.15, h + 1.6); col.circle(x + dx * s / 2, z + dz * s / 2, 0.16, y0, y0 + h); }
  bag.add('timber', box(x - s / 2 - 0.3, y0 + h - 0.15, z - s / 2 - 0.3, x + s / 2 + 0.3, y0 + h, z + s / 2 + 0.3));
  for (const [a, b] of [[[x - s / 2, z - s / 2], [x + s / 2, z - s / 2]], [[x - s / 2, z + s / 2], [x + s / 2, z + s / 2]]]) bag.add(P, orientedBox(a, b, 0.1, y0 + h, y0 + h + 0.9));
}

/** waharoa: a gateway { c, yaw, w, h } — two carved posts and a carved lintel figure. */
function waharoa(el, { bag, col }) {
  const [x, z] = el.c, yaw = el.yaw ?? 0, w = el.w ?? 2.6, h = el.h ?? 4.6, y0 = el.y ?? 0, ca = Math.cos(yaw), sa = Math.sin(yaw);
  for (const s of [-1, 1]) { const px = x + s * w / 2 * ca, pz = z - s * w / 2 * sa; bag.add(K, box(px - 0.3, y0 - 0.4, pz - 0.3, px + 0.3, y0 + h, pz + 0.3)); col.circle(px, pz, 0.35, y0, y0 + h); }
  bag.add(K, orientedBox([x - (w / 2 + 0.4) * ca, z + (w / 2 + 0.4) * sa], [x + (w / 2 + 0.4) * ca, z - (w / 2 + 0.4) * sa], 0.5, y0 + h, y0 + h + 0.6));
  bag.add(K, box(x - 0.35, y0 + h + 0.6, z - 0.25, x + 0.35, y0 + h + 1.8, z + 0.25));
}

/** rua: a kūmara pit { c, yaw, w, l } — a low pitched roof over a pit, its ridge at knee height. */
function rua(el, { bag }) {
  const [x, z] = el.c, w = el.w ?? 2.2, l = el.l ?? 3, y0 = el.y ?? 0, t = [];
  for (const s of [-1, 1]) {
    const a = [x + s * w / 2, y0 - 0.05, z - l / 2], b = [x + s * w / 2, y0 - 0.05, z + l / 2], c = [x, y0 + 0.8, z + l / 2], d = [x, y0 + 0.8, z - l / 2];
    t.push(...a, ...b, ...c, ...a, ...c, ...d, ...a, ...c, ...b, ...a, ...d, ...c);
  }
  bag.add(TH, fromTriangles(t));
}

/** waka: a canoe { c, yaw, l } drawn up on the shore. */
function waka(el, { bag }) {
  const [x, z] = el.c, l = el.l ?? 12, yaw = el.yaw ?? 0, y0 = el.y ?? 0;
  const g = lathe([[0.001, 0], [0.45, 0.15], [0.55, 0.5], [0.5, 0.75]], 10, null, 0, 0, 0);
  g.applyMatrix4(new Matrix4().makeScale(1, 1, l / 1.1)); g.applyMatrix4(new Matrix4().makeRotationY(yaw).setPosition(x, y0, z));
  bag.add(K, g);
  const bow = box(-0.12, 0.4, -l / 2 - 0.2, 0.12, 1.8, -l / 2 + 0.3); bow.applyMatrix4(new Matrix4().makeRotationY(yaw).setPosition(x, y0, z)); bag.add(K, bow);
}

registerStyle('maori', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.qing.elements, palisade, whare, pataka, stage, waharoa, rua, waka },
  objects: {},
});
