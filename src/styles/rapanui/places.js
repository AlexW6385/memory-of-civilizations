// Rapa Nui — what dresses the open places (docs/settlements/rapa-nui.md §4g): the plaza before the ahu
// (feast ovens, offerings, marking poles, slabs to sit on, stones strewn), the shore (drying racks,
// a net on its poles, the canoe builders' shed) and the crater lake (reed rafts, cut reed).
import { Matrix4 } from '../../core/three.js';
import { box, lathe, fromTriangles, rod } from '../../core/geom.js';
import { rope } from './scenes.js';
import { GOURD, tokiGeometry } from './works.js';

const B = 'basalt_ahu';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const ROUND = [0, 1, 2].map((k) => lathe([[1, -0.6], [1.06, 0.05], [0.78, 0.6], [0.35, 0.85], [0.001, 0.9]], 7, (th) => 1 + 0.12 * Math.sin(th * (2 + k) + k) + 0.06 * Math.cos(th * 5 + k * 2)));
function stoneAt(bag, mat, x, y, z, r, seed = 0, flat = 1) {
  const k = Math.abs(Math.floor(seed * 7.3)) % 3, m = new Matrix4().makeRotationY(seed * 2.1).premultiply(new Matrix4().makeTranslation(x, y, z)).multiply(new Matrix4().makeScale(r, r * (0.7 + 0.1 * k) * flat, r));
  if (bag.addInstance) bag.addInstance(mat, ROUND[k], m, { reach: 220 }); else bag.add(mat, ROUND[k].clone().applyMatrix4(m));
}
const basket = (r = 0.27, h = 0.36) => [lathe([[r * 0.74, 0], [r, 0.1], [r * 1.04, h * 0.8], [r * 0.85, h], [0.001, h]], 11), lathe([[r * 0.86, h], [r * 0.7, h + 0.07], [0.001, h + 0.11]], 11)];
const lump = () => lathe([[0.001, 0], [0.05, 0.02], [0.07, 0.06], [0.05, 0.11], [0.001, 0.12]], 6).scale(1, 0.8, 1.7);
const banana = () => { const g = []; for (let k = 0; k < 7; k++) g.push(lathe([[0.001, 0], [0.025, 0.02], [0.03, 0.12], [0.001, 0.16]], 5).rotateZ(-0.5).rotateY(k * 0.7).translate(Math.cos(k * 0.7) * 0.04, 0.2 - k * 0.012, Math.sin(k * 0.7) * 0.04)); return g; };

/**
 * plaza_dress: the plaza before the ahu { rect, y, seed } — three feast ovens (umu tahu): a ring of stones
 * round a pit, hot stones heaped, a cover of banana leaves and a heap of wood beside; rows of offerings
 * laid on mats at the foot of the ramp (baskets of sweet potato, gourds, bunches of bananas, fish on
 * leaves); tall poles hung with white bark cloth along the clear walk to the ramp; flat slabs set to sit on
 * along the plaza's edge; stones strewn on the pavement [inferred: the ceremonies the ahu stood for; the
 * pit-oven is the island's way of cooking (umu) — easterisland.travel "Hare Paenga"].
 */
function plazaDress(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y0 = el.y ?? 0.12, rand = rng(el.seed ?? 8), cx = (x0 + x1) / 2;
  // the feast ovens
  for (const [ox, oz] of [[-34, 71], [37, 69], [-16, 94]]) {
    const R = 1.15;
    for (let k = 0; k < 9; k++) { const a = k / 9 * 6.283; stoneAt(bag, B, ox + Math.cos(a) * R, y0 - 0.02, oz + Math.sin(a) * R, 0.2 + rand() * 0.06, k + ox); }
    bag.add('opening', lathe([[R - 0.15, y0 + 0.01], [0.001, y0 + 0.02]], 12, null, ox, 0, oz));
    for (let k = 0; k < 16; k++) { const a = rand() * 6.283, r = rand() * (R - 0.35); stoneAt(bag, 'scoria_red', ox + Math.cos(a) * r, y0 + 0.02, oz + Math.sin(a) * r, 0.09 + rand() * 0.05, k + oz); }
    bag.add('palm_leaf', lathe([[0.001, 0.0], [0.9, 0.0], [0.95, 0.06], [0.001, 0.22]], 9, null, ox + 3.2, y0 + 0.02, oz + 0.2));
    for (let r = 0; r < 4; r++) for (let q = 0; q < 5 - r; q++) bag.add('timber', rod([ox - 3.6 + q * 0.28 + r * 0.14, y0 + 0.08 + r * 0.13, oz - 1.0], [ox - 3.6 + q * 0.28 + r * 0.14, y0 + 0.08 + r * 0.13, oz + 0.8], 0.06, 5));
    col.circle(ox, oz, R + 0.2, y0, y0 + 0.4); col.circle(ox - 3.0, oz - 0.1, 0.9, y0, y0 + 0.7);
  }
  // offerings at the foot of the ramp, on mats, in four groups
  for (const gx of [-30, -14, 14, 30]) {
    const gz = 84.5 + (gx > 0 ? 0 : 0.4);
    bag.add('reed_mat', box(gx - 1.6, y0, gz - 0.9, gx + 1.6, y0 + 0.03, gz + 0.9));
    bag.add(gx % 4 ? 'hide_white' : 'cloth_ochre', box(gx - 1.2, y0 + 0.03, gz - 0.6, gx + 0.2, y0 + 0.045, gz + 0.5));
    for (let q = 0; q < 4; q++) {
      const [b0, b1] = basket(0.26, 0.34), bx = gx - 1.2 + q * 0.62, bz = gz - 0.3 + (q % 2) * 0.55;
      bag.add('wicker', b0.translate(bx, y0 + 0.03, bz));
      if (q % 2) bag.add('wicker', b1.translate(bx, y0 + 0.03, bz)); else for (let t = 0; t < 7; t++) bag.add('hide_tan', lump().rotateY(t * 1.9).translate(bx + Math.cos(t * 2.3) * 0.1, y0 + 0.37 + (t > 4 ? 0.07 : 0), bz + Math.sin(t * 2.3) * 0.1));
    }
    for (let q = 0; q < 3; q++) bag.add('pottery_dark', GOURD().translate(gx + 1.0 + q * 0.28, y0 + 0.03, gz - 0.2 + (q % 2) * 0.3));
    for (const g of banana()) bag.add('palm_leaf', g.clone().translate(gx + 0.3, y0 + 0.03, gz + 0.6));
    for (let q = 0; q < 2; q++) bag.add('hide_grey', lathe([[0.001, -0.2], [0.05, -0.1], [0.07, 0], [0.05, 0.1], [0.001, 0.2]], 5).scale(1, 0.14, 1).rotateY(q * 0.6).translate(gx - 0.2 + q * 0.5, y0 + 0.06, gz + 0.1));
  }
  // marking poles with white cloth, either side of the walk to the ramp
  for (const s of [-1, 1]) for (let k = 0; k < 4; k++) {
    const px = s * 6.5, pz = 66 + k * 7, hgt = 4.2;
    bag.add('timber', rod([px, y0 - 0.2, pz], [px, y0 + hgt, pz], 0.06, 6));
    bag.add('hide_white', box(px + 0.0, y0 + hgt - 1.9, pz - 0.015, px + 0.55, y0 + hgt - 0.1, pz + 0.015));
    bag.add('cloth_ochre', box(px - 0.4, y0 + hgt - 1.5, pz - 0.015, px, y0 + hgt - 0.5, pz + 0.015));
    stoneAt(bag, B, px, y0, pz, 0.28, k + s);
    col.circle(px, pz, 0.1, y0, y0 + hgt);
  }
  // slabs to sit on along the edges
  for (let k = 0; k < 10; k++) {
    const s = k % 2 ? 1 : -1, sx = s * (50 + rand() * 7), sz = 62 + (k >> 1) * 7 + rand() * 2;
    bag.add(B, box(sx - 0.8, y0 + 0.28, sz - 0.4, sx + 0.8, y0 + 0.4, sz + 0.4));
    for (const d of [-0.5, 0.5]) bag.add(B, box(sx + d - 0.14, y0, sz - 0.3, sx + d + 0.14, y0 + 0.28, sz + 0.3));
    col.circle(sx, sz, 0.8, y0, y0 + 0.4);
  }
  // stones strewn on the pavement and tufts of grass in its joints
  for (let k = 0; k < 520; k++) { const px = x0 + 1 + rand() * (x1 - x0 - 2), pz = z0 + 1 + rand() * (z1 - z0 - 2); stoneAt(bag, rand() < 0.5 ? 'pebbles' : B, px, y0 - 0.01, pz, 0.04 + rand() ** 2 * 0.1, k * 0.37, 0.8); }
  void cx;
}

/**
 * shore_works: the working shore east of the ahu { y (ground at (x, z)), ground } — fish racks (as at the houses, longer),
 * a net hung to dry on a line of poles, the canoe builders' shed (thatch on four posts over a hull of planks
 * not yet sewn, planks stacked, an adze and sewing cord laid out), heaps of driftwood and baskets, stones with
 * a hole (sinkers) [stated: canoes were small and of sewn planks — Hōkūleʻa archive; inferred: the rest of the
 * work]. Everything on the ground by `ground(x, z)`.
 */
function shoreWorks(el, { bag, col }) {
  const gy = el.ground, rand = rng(el.seed ?? 31), [sx, sz] = el.c;
  const G = (x, z) => gy(x, z);
  // two long drying racks with fish, the line of poles with a net
  for (const [rx, rz, w] of [[sx - 18, sz - 6, 4.4], [sx + 20, sz - 7, 3.6]]) {
    const y = G(rx, rz);
    for (const du of [-w / 2, w / 2]) { bag.add('timber', rod([rx + du, y - 0.1, rz], [rx + du, y + 1.7, rz], 0.05, 6)); col.circle(rx + du, rz, 0.12, y, y + 1.7); }
    for (const hy of [1.7, 1.15]) bag.add('timber', rod([rx - w / 2 - 0.1, y + hy, rz], [rx + w / 2 + 0.1, y + hy, rz], 0.035, 6));
    for (let q = 0; q < Math.round(w * 4); q++) { const fx = rx - w / 2 + 0.2 + q * 0.23, hi = q % 2; bag.add(hi ? 'hide_grey' : 'hide_tan', lathe([[0.001, -0.17], [0.05, -0.1], [0.07, 0], [0.05, 0.1], [0.001, 0.17]], 5).scale(1, 0.12, 1).rotateZ(Math.PI).rotateY(rand() * 0.6).translate(fx, y + (hi ? 1.7 : 1.15) - 0.2, rz)); }
    for (let q = 0; q < 3; q++) bag.add('hide_brown', lathe([[0.001, 0], [0.06, 0.03], [0.05, 0.2], [0.02, 0.5], [0.001, 0.55]], 5).translate(rx - w / 2 + 0.6 + q * 1.2, y + 1.15 - 0.55, rz + 0.1));
  }
  { // the net on a line of five poles
    const nx = sx - 2, nz = sz - 12;
    for (let k = 0; k < 5; k++) { const x = nx + k * 2.4, y = G(x, nz); bag.add('timber', rod([x, y - 0.1, nz], [x, y + 2.0, nz], 0.045, 6)); col.circle(x, nz, 0.12, y, y + 2.0); }
    for (let r = 0; r <= 6; r++) for (let k = 0; k < 4; k++) { const x0 = nx + k * 2.4, x1 = x0 + 2.4, xm = (x0 + x1) / 2; rope(bag, [[x0, G(x0, nz) + 0.55 + r * 0.22, nz], [xm, G(xm, nz) + 0.45 + r * 0.22, nz], [x1, G(x1, nz) + 0.55 + r * 0.22, nz]], 0.009); }
    for (let q = 0; q <= 38; q++) { const x = nx + q * 0.25, y = G(x, nz); rope(bag, [[x, y + 0.55, nz], [x, y + 1.1, nz], [x, y + 1.85, nz]], 0.008); }
    for (let q = 0; q < 12; q++) { const x = nx + 0.4 + q * 0.75, y = G(x, nz); bag.add('pottery_dark', GOURD().scale(0.4, 0.4, 0.4).translate(x, y + 1.88 - 0.19, nz - 0.05)); }
  }
  { // the canoe builders' shed
    const cx = sx + 2, cz = sz - 3, y = G(cx, cz), W = 2.6, D = 2.0, hi = 2.3, lo = 1.6;
    for (const [u, v, h] of [[-W, -D, hi], [W, -D, hi], [-W, D, lo], [W, D, lo]]) { bag.add('timber', rod([cx + u, y - 0.25, cz + v], [cx + u, y + h - 0.1, cz + v], 0.06, 6)); col.circle(cx + u, cz + v, 0.14, y, y + h); }
    const roof = (a, b) => [a, b];
    void roof;
    const q = (x, yy, z) => [cx + x, y + yy, cz + z];
    const tri = [], top = [q(-W - 0.2, hi, -D - 0.1), q(W + 0.2, hi, -D - 0.1), q(W + 0.2, lo, D + 0.1), q(-W - 0.2, lo, D + 0.1)];
    tri.push(...top[0], ...top[3], ...top[2], ...top[0], ...top[2], ...top[1]);
    const dn = top.map((p) => [p[0], p[1] - 0.2, p[2]]);
    tri.push(...dn[0], ...dn[2], ...dn[3], ...dn[0], ...dn[1], ...dn[2]);
    for (const [a, b] of [[0, 1], [1, 2], [2, 3], [3, 0]]) tri.push(...top[a], ...dn[b], ...dn[a], ...top[a], ...top[b], ...dn[b]);
    bag.add('thatch', fromTriangles(tri));
    // a hull of planks on keel and ribs, not yet closed; planks stacked, an adze, sewing cord
    bag.add('wood_dark', rod(q(-1.7, 0.25, 0), q(1.7, 0.25, 0), 0.07, 6));
    for (let k = -3; k <= 3; k++) { const r = 0.5 * Math.sqrt(Math.max(0.05, 1 - (k / 3.6) ** 2)); bag.add('timber', rod(q(k * 0.5, 0.25, -r), q(k * 0.5, 0.55, -r - 0.12), 0.03, 5)); bag.add('timber', rod(q(k * 0.5, 0.25, r), q(k * 0.5, 0.55, r + 0.12), 0.03, 5)); }
    for (const s of [-1, 1]) for (let k = 0; k < 4; k++) bag.add('wood_dark', box(cx - 1.7 + k * 0.85, y + 0.35 + (k % 2) * 0.04, cz + s * 0.55 - 0.06, cx - 1.7 + k * 0.85 + 0.82, y + 0.39 + (k % 2) * 0.04, cz + s * 0.55 + 0.06));
    for (let k = 0; k < 6; k++) bag.add('timber', box(cx + 1.9 - (k % 2) * 0.05, y + 0.04 + k * 0.05, cz + 1.0 - 0.0, cx + 2.4, y + 0.09 + k * 0.05, cz + 1.0 + 0.9 - k * 0.05));
    bag.add('basalt_ahu', tokiGeometry().clone().translate(cx - 0.4, y + 0.05, cz - 1.3));
    bag.add('rope_fibre', lathe([[0.2, 0], [0.26, 0.04], [0.2, 0.08], [0.14, 0.04], [0.2, 0]], 10).translate(cx + 0.6, y + 0.03, cz - 1.4));
    for (let k = 0; k < 30; k++) bag.add('thatch', box(cx - 2 + rand() * 3, y + 0.005, cz - 1.6 + rand() * 1.4, cx - 2 + rand() * 3 + 0.12, y + 0.016, cz - 1.6 + rand() * 1.4 + 0.03));
    bag.add('reed_mat', box(cx - 2.3, y + 0.0, cz - 1.8, cx + 2.2, y + 0.03, cz + 0.2));
  }
  // driftwood, baskets, sinkers, stones of the shore
  for (let k = 0; k < 7; k++) { const x = sx - 30 + rand() * 70, z = sz - 2 + rand() * 6, y = G(x, z); if (y < -0.5) continue; bag.add('wood_dark', rod([x, y + 0.06, z], [x + (rand() - 0.5) * 3, y + 0.07, z + (rand() - 0.5) * 1.4], 0.07 + rand() * 0.05, 5)); }
  for (let k = 0; k < 160; k++) { const x = sx - 40 + rand() * 90, z = sz - 8 + rand() * 12, y = G(x, z); if (y < -0.3) continue; stoneAt(bag, rand() < 0.7 ? B : 'pebbles', x, y - 0.01, z, 0.05 + rand() ** 2 * 0.16, k * 0.41, 0.8); }
  for (let k = 0; k < 3; k++) { const [b0, b1] = basket(0.28, 0.4), x = sx - 8 + k * 0.7, z = sz - 5, y = G(x, z); bag.add('wicker', b0.translate(x, y, z)); bag.add('wicker', b1.translate(x, y, z)); }
}

/**
 * pora: a raft of totora reed on the crater lake { c, y (the water), yaw, seed } — three long bundles tapering to
 * the bow, lashed across at three places, a heap of cut reed at the stern, a short paddle [stated: the reed
 * of Rano Raraku's lake: "reed-filled lake in the crater", Wikipedia "Rano Raraku"; inferred: the raft of its
 * bundles, a common watercraft of the reed lakes of the Pacific coast and known to the island].
 */
function pora(el, { bag }) {
  const [x, z] = el.c, y = el.y ?? 0, yaw = el.yaw ?? 0, c = Math.cos(yaw), s = Math.sin(yaw), W = (u, v) => [x + u * c + v * s, z - u * s + v * c];
  const L = 3.2;
  for (const v of [-0.34, 0, 0.34]) {
    const g = lathe([[0.001, -L / 2], [0.12, -L / 2 + 0.2], [0.17, -L / 2 + 0.7], [0.17, L / 2 - 0.6], [0.12, L / 2 - 0.2], [0.04, L / 2 + 0.25], [0.001, L / 2 + 0.4]], 8).rotateZ(-Math.PI / 2).rotateY(yaw), [px, pz] = W(0, v);
    g.translate(px, y + 0.02, pz);
    bag.add('reed_mat', g);
  }
  for (const u of [-1.0, 0, 1.0]) { const a = W(u, -0.55), b = W(u, 0.55); bag.add('rope_fibre', rod([a[0], y + 0.17, a[1]], [b[0], y + 0.17, b[1]], 0.02, 5)); }
  for (let k = 0; k < 9; k++) { const a = W(-1.3 + (k % 3) * 0.25, -0.2 + (k >> 2) * 0.2), b = W(-0.2 + (k % 2) * 0.1, 0.0 + (k % 3) * 0.12); bag.add('papyrus', rod([a[0], y + 0.3 + k * 0.02, a[1]], [b[0], y + 0.34 + k * 0.02, b[1]], 0.03, 4)); }
  const a = W(0.4, 0.5), b = W(1.2, 0.9); bag.add('timber', rod([a[0], y + 0.25, a[1]], [b[0], y + 0.2, b[1]], 0.018, 5));
}

export const PLACES = { plaza_dress: plazaDress, shore_works: shoreWorks, pora };
