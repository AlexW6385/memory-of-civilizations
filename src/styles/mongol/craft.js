// Karakorum's objects (docs/settlements/mongol-karakorum.md §4, §6): the silver tree of William Buchier, the nine-tailed banner,
// the stone tortoise, kilns and forges of the Cathayan quarter, pens.
import { box, rod, lathe, obox, rng, TAU } from './util.js';
import { tube, blob } from '../chinese/statues.js';
import { fromTriangles, addCloth, clothBox } from '../../core/geom.js';

const S = 'silver', GILT = 'gilt_bronze';
/**
 * silver_tree: the drink-flowing tree [stated: Rubruck / William Buchier, Public Domain Review]: a silver trunk wrapped in four silver serpents
 * with branches, leaves and fruit; an angel with a trumpet above; four silver lions at the root belching white mare's milk; four pipes from
 * the branches pouring wine, qara qumiss, rice wine and mead into silver basins. { c, y, h (default 5.2) }
 */
export function silverTree(el, { bag, col }) {
  const [cx, cz] = el.c, y = el.y ?? 0, h = el.h ?? 5.2, rand = rng(el.seed || 3);
  // the low platform of boards, eight-sided, edged in silver; a drain-lip of silver round the foot of the trunk where the lions' milk and the four drinks gather
  bag.add('timber', lathe([[2.95, 0], [2.95, 0.18], [2.8, 0.2], [0.001, 0.2]], 8, null, cx, y, cz));
  bag.add(S, lathe([[2.99, 0.14], [2.99, 0.2], [2.93, 0.2], [2.93, 0.14]], 8, null, cx, y, cz));
  bag.add(S, lathe([[2.2, 0.2], [2.2, 0.24], [2.14, 0.24], [2.14, 0.2]], 8, null, cx, y, cz));
  const Y = y + 0.2;
  col.floor([cx - 1.55, cz - 1.55, cx + 1.55, cz + 1.55], Y);
  // the trunk: a flared root on a stepped plinth, collars at the foot of each stage, swelling between, the crown of the tree a cup of leaves
  const T = h * 0.7;
  bag.add(S, lathe([[0.62, 0], [0.62, 0.08], [0.54, 0.1], [0.5, 0.16], [0.34, 0.5], [0.25, 1.0], [0.27, 1.06], [0.23, 1.12], [0.21, T * 0.5], [0.24, T * 0.5 + 0.05], [0.2, T * 0.5 + 0.1], [0.19, T], [0.22, T + 0.05], [0.17, h * 0.84], [0.001, h * 0.86]], 14, null, cx, Y, cz));
  col.circle(cx, cz, 0.62, Y, Y + h);
  const topY = Y + T, branchEnd = 1.75, leaves = [];
  // a leaf: a pointed blade from its base b along dir d (unit, plan) tilted up by lift, width w, length l, drooping at the tip; two-sided
  const leaf = (b, ang, lift, l, w) => {
    const dx = Math.cos(ang) * Math.cos(lift), dz = Math.sin(ang) * Math.cos(lift), dy = Math.sin(lift), nx = -Math.sin(ang), nz = Math.cos(ang);
    const m = [b[0] + dx * l * 0.45, b[1] + dy * l * 0.45 + 0.01, b[2] + dz * l * 0.45], t = [b[0] + dx * l, b[1] + dy * l - l * 0.18, b[2] + dz * l];
    const L = [m[0] + nx * w, m[1], m[2] + nz * w], R = [m[0] - nx * w, m[1], m[2] - nz * w];
    leaves.push(...b, ...L, ...m, ...b, ...m, ...R, ...m, ...L, ...t, ...m, ...t, ...R);
    leaves.push(...b, ...m, ...L, ...b, ...R, ...m, ...m, ...t, ...L, ...m, ...R, ...t);
  };
  const fruit = (p, mat) => bag.add(mat, lathe([[0.001, 0], [0.045, 0.04], [0.05, 0.09], [0.03, 0.14], [0.001, 0.15]], 6, null, p[0], p[1] - 0.15, p[2]));
  // four main branches, each carrying one of the four pipes; the serpent coiled about the trunk is the pipe: it leaves the trunk along its branch and ends in a head bent over the basin, pouring [stated: Rubruck: four pipes, each by a serpent whose tail twines the tree]
  for (let k = 0; k < 4; k++) {
    const a = k * TAU / 4 + TAU / 8, ux = Math.cos(a), uz = Math.sin(a);
    const P = [[0, -0.35, 0.12], [0.45, 0.05, 0.1], [0.95, 0.3, 0.085], [1.45, 0.34, 0.07], [branchEnd, 0.12, 0.055]].map(([u, v, r]) => [cx + ux * u, topY + v, cz + uz * u, r]);
    bag.add(S, tube(P, 7));
    // the serpent: coils up the trunk (two and a bit turns), then along the branch's upper side, the head turned down at its tip
    const path = [], N = 20;
    for (let i = 0; i <= N; i++) { const t = i / N, an = a - (1 - t) * TAU * 2.1, rho = 0.3 - t * 0.1; path.push([cx + Math.cos(an) * rho, Y + 0.55 + t * (T - 0.95), cz + Math.sin(an) * rho, 0.055 - t * 0.012]); }
    for (const [u, v] of [[0.4, 0.17], [0.95, 0.43], [1.45, 0.46], [1.72, 0.3], [1.86, 0.1]]) path.push([cx + ux * u, topY + v, cz + uz * u, 0.04]);
    bag.add(S, tube(path, 6));
    const hx = cx + ux * 1.9, hz = cz + uz * 1.9, hy = topY + 0.02;
    bag.add(S, blob([hx, hy, hz], 0.08, 0.075, 0.09, 8, 5));
    bag.add(S, tube([[hx + ux * 0.06, hy - 0.04, hz + uz * 0.06, 0.05], [hx + ux * 0.13, hy - 0.2, hz + uz * 0.13, 0.04]], 6));
    bag.add(GILT, blob([hx + ux * 0.04 - uz * 0.06, hy + 0.04, hz + uz * 0.04 + ux * 0.06], 0.018, 0.018, 0.018, 5, 3)); bag.add(GILT, blob([hx + ux * 0.04 + uz * 0.06, hy + 0.04, hz + uz * 0.04 - ux * 0.06], 0.018, 0.018, 0.018, 5, 3));
    const sx = hx + ux * 0.13, sz = hz + uz * 0.13, sy = hy - 0.2;
    bag.add('water_jet', rod([sx, sy, sz], [sx, Y + 0.62, sz], 0.014, 4));
    // the basin on the platform below, its drink brimming
    bag.add(S, lathe([[0.001, 0], [0.2, 0.02], [0.46, 0.4], [0.5, 0.5], [0.44, 0.5], [0.38, 0.4], [0.001, 0.1]], 14, null, sx, Y, sz));
    bag.add(S, lathe([[0.15, 0], [0.12, 0.08], [0.26, 0.12], [0.001, 0.12]], 10, null, sx, Y + 0.0, sz));
    bag.add(['cloth_red', 'cloth_white', 'cloth_ochre', 'water_jet'][k], lathe([[0.001, 0], [0.42, 0]], 12, null, sx, Y + 0.47, sz));
    col.circle(sx, sz, 0.5, Y, Y + 0.5);
    // twigs along the branch: silver wires forking, each with leaves in pairs and a hanging fruit (about 130 leaves a branch with the crown's)
    for (let q = 0; q < 5; q++) {
      const f = 0.2 + q * 0.17, i0 = Math.min(3, Math.floor(f * 4)), fr = f * 4 - i0, A0 = P[i0], A1 = P[i0 + 1];
      const bp = [A0[0] + (A1[0] - A0[0]) * fr, A0[1] + (A1[1] - A0[1]) * fr, A0[2] + (A1[2] - A0[2]) * fr];
      for (const sd of [-1, 1]) {
        const ta = a + sd * (0.5 + rand() * 0.6), ln = 0.45 + rand() * 0.3, e = [bp[0] + Math.cos(ta) * ln, bp[1] + 0.16 + rand() * 0.34, bp[2] + Math.sin(ta) * ln], mid = [(bp[0] + e[0]) / 2, (bp[1] + e[1]) / 2 + 0.06, (bp[2] + e[2]) / 2];
        bag.add(S, tube([[bp[0], bp[1], bp[2], 0.026], [mid[0], mid[1], mid[2], 0.02], [e[0], e[1], e[2], 0.012]], 4));
        for (let m = 0; m < 4; m++) { const u = 0.25 + m * 0.25, lp = [bp[0] + (e[0] - bp[0]) * u, bp[1] + (e[1] - bp[1]) * u + 0.03, bp[2] + (e[2] - bp[2]) * u]; leaf(lp, ta + (m % 2 ? 1 : -1) * (0.7 + rand() * 0.3), 0.15 + rand() * 0.3, 0.2 + rand() * 0.06, 0.05); }
        leaf(e, ta, 0.2, 0.26, 0.06);
        if ((q + (sd > 0 ? 1 : 0)) % 2) fruit([e[0], e[1] - 0.02, e[2]], (q + k) % 3 ? S : GILT);
      }
    }
  }
  // the crown: a cup of leaves round the angel's feet, and four hanging fruit
  const cy = Y + h * 0.84;
  for (let m = 0; m < 14; m++) { const an = m / 14 * TAU + rand() * 0.2; leaf([cx + Math.cos(an) * 0.14, cy + 0.02, cz + Math.sin(an) * 0.14], an, 0.8 + rand() * 0.3, 0.34 + rand() * 0.1, 0.07); }
  bag.add(S, lathe([[0.2, 0], [0.34, 0.08], [0.3, 0.16], [0.16, 0.26], [0.001, 0.3]], 10, null, cx, cy - 0.04, cz));
  for (let q = 0; q < 4; q++) fruit([cx + Math.cos(q * TAU / 4) * 0.4, cy - 0.08, cz + Math.sin(q * TAU / 4) * 0.4], GILT);
  bag.add(S, fromTriangles(leaves));
  angel(bag, cx, cy + 0.26, cz);
  // the four lions at the roots, each belching a white stream; the stream falls beyond the drain-lip into the platform's gutter
  for (let k = 0; k < 4; k++) {
    const a = k * TAU / 4, ux = Math.cos(a), uz = Math.sin(a);
    lion(bag, cx + ux * 1.65, Y, cz + uz * 1.65, Math.atan2(ux, uz), k);
    col.circle(cx + ux * 1.65, cz + uz * 1.65, 0.5, Y, Y + 1.2);
  }
}
/** The angel on the crown, about 0.9 m tall: a belted robe with folds, bare arms (one raised to the trumpet), a head with a gilt cap of hair and a halo, six-feathered wings, the trumpet at the lips. */
function angel(bag, x, y, z) {
  const G = 'gilt_bronze', at = (g) => g.translate(x, y, z);
  bag.add(G, lathe([[0.001, 0], [0.17, 0], [0.19, 0.04], [0.13, 0.3], [0.1, 0.46], [0.12, 0.5], [0.09, 0.52], [0.09, 0.6], [0.001, 0.62]], 10, (th) => 1 + 0.12 * Math.sin(th * 7), x, y, z));
  bag.add('skin_light', blob([x, y + 0.72, z], 0.065, 0.08, 0.07, 8, 5));
  bag.add(G, blob([x, y + 0.76, z - 0.01], 0.072, 0.07, 0.075, 8, 4));
  bag.add(G, lathe([[0.11, 0], [0.11, 0.012], [0.095, 0.012], [0.095, 0]], 12).rotateX(Math.PI / 2 - 0.1).translate(x, y + 0.77, z - 0.1));
  // arms: the right bent up to the lips with the trumpet, the left holding the robe
  bag.add('skin_light', tube([[x + 0.09, y + 0.58, z + 0.01, 0.032], [x + 0.17, y + 0.52, z + 0.12, 0.026], [x + 0.06, y + 0.66, z + 0.2, 0.022]], 5));
  bag.add('skin_light', tube([[x - 0.09, y + 0.58, z + 0.01, 0.032], [x - 0.16, y + 0.46, z + 0.08, 0.026], [x - 0.05, y + 0.38, z + 0.14, 0.022]], 5));
  // the trumpet: a slim tube at the lips rising forward and up, flaring to a bell
  bag.add('silver', tube([[x + 0.05, y + 0.68, z + 0.17, 0.012], [x + 0.1, y + 1.0, z + 0.4, 0.014], [x + 0.14, y + 1.25, z + 0.58, 0.02]], 6));
  bag.add('silver', lathe([[0.001, 0], [0.02, 0.02], [0.05, 0.1], [0.065, 0.14], [0.05, 0.14], [0.001, 0.05]], 10).rotateX(0.9).translate(x + 0.14, y + 1.25, z + 0.58));
  // the wings: six feathers a side, fanned from the shoulder, longer toward the tips
  for (const s of [-1, 1]) for (let f = 0; f < 6; f++) {
    const ang = 0.7 + f * 0.17, len = 0.42 + f * 0.04 - (f > 4 ? 0.06 : 0);
    bag.add(G, tube([[x + s * 0.06, y + 0.5 + f * 0.012, z - 0.06, 0.035], [x + s * (0.06 + Math.sin(ang) * len * 0.55), y + 0.5 + Math.cos(ang) * len * 0.55 + 0.1, z - 0.1 - f * 0.012, 0.032], [x + s * (0.06 + Math.sin(ang) * len), y + 0.5 + Math.cos(ang) * len + 0.1 - f * 0.02, z - 0.14 - f * 0.012, 0.006]], 4, 0.3));
  }
  void at;
}
/** A silver lion couchant about 1.2 m long at (x, y, z) facing yaw (0 = +z): body, haunch, chest, head with a mane of tufts, open jaws with the pipe in the throat, fore-paws with claws, tail; a white stream from the mouth. */
function lion(bag, x, y, z, yaw, k = 0) {
  const put = (g) => g.rotateY(yaw).translate(x, y, z), m = k * 0.004;
  const body = blob([0, 0.5, -0.1], 0.28 + m, 0.32, 0.55, 12, 7), chest = blob([0, 0.58, 0.32], 0.26, 0.34, 0.26, 10, 6), hind = blob([0, 0.42, -0.5], 0.3, 0.3, 0.3, 10, 6);
  const head = blob([0, 0.84, 0.62], 0.2, 0.22, 0.22, 10, 6), muzzle = blob([0, 0.76, 0.82], 0.11, 0.1, 0.13, 8, 5), jaw = blob([0, 0.68, 0.84], 0.085, 0.04, 0.12, 7, 4);
  for (const g of [body, chest, hind, head, muzzle, jaw]) bag.add('silver', put(g));
  // the mane: a ring of flame-shaped tufts round the head and down the chest
  for (let i = 0; i < 12; i++) {
    const a = i / 12 * TAU, r0 = 0.2;
    bag.add('silver', put(tube([[Math.cos(a) * r0, 0.84 + Math.sin(a) * r0 * 1.05, 0.5, 0.06], [Math.cos(a) * (r0 + 0.12), 0.84 + Math.sin(a) * (r0 + 0.12) * 1.05, 0.46, 0.04], [Math.cos(a) * (r0 + 0.2), 0.84 + Math.sin(a) * (r0 + 0.2) * 1.05 - 0.03, 0.42, 0.012]], 4)));
  }
  for (const s of [-1, 1]) {
    bag.add('gilt_bronze', put(blob([s * 0.09, 0.9, 0.78], 0.025, 0.025, 0.025, 5, 3)));
    bag.add('silver', put(blob([s * 0.2, 0.96, 0.58], 0.04, 0.05, 0.03, 6, 4)));
    bag.add('silver', put(tube([[s * 0.14, 0.4, 0.3, 0.07], [s * 0.14, 0.12, 0.62, 0.06], [s * 0.14, 0.05, 0.8, 0.06]], 6)));
    for (const c of [-0.04, 0, 0.04]) bag.add('silver', put(tube([[s * 0.14 + c, 0.05, 0.84, 0.014], [s * 0.14 + c, 0.015, 0.92, 0.008]], 4)));
    bag.add('silver', put(tube([[s * 0.2, 0.3, -0.5, 0.1], [s * 0.2, 0.06, -0.3, 0.07]], 6)));
  }
  bag.add('silver', put(tube([[0, 0.4, -0.8, 0.04], [0, 0.3, -1.05, 0.035], [0.08, 0.5, -1.2, 0.05]], 5)));
  bag.add('silver', put(blob([0.09, 0.56, -1.22], 0.05, 0.09, 0.06, 6, 4)));
  // the milk: a white stream from the open mouth to the platform
  bag.add('foam', put(tube([[0, 0.7, 0.9, 0.02], [0, 0.52, 1.03, 0.022], [0, 0.22, 1.1, 0.026]], 5)));
}
/** tug: the nine-tailed white banner of the Mongols: a tall pole with an iron spear head and a boss of horsehair, tassels streaming in the wind. { at, y, h } */
export function tug(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, h = el.h ?? 7;
  bag.add('timber', lathe([[0.1, 0], [0.07, h]], 8, null, x, y, z)); col.circle(x, z, 0.12, y, y + h);
  bag.add('granite_grey', lathe([[0.4, 0], [0.4, 0.2]], 8, null, x, y, z));
  bag.add('iron', lathe([[0.001, 0], [0.09, 0.05], [0.04, 0.3], [0.001, 0.6]], 6, null, x, y + h, z));
  bag.add('hide_black', lathe([[0.2, 0], [0.26, 0.15], [0.2, 0.3], [0.001, 0.34]], 8, null, x, y + h - 0.4, z));
  for (let k = 0; k < 9; k++) {
    const a = k / 9 * TAU, g = clothBox(x + Math.cos(a) * 0.2 - 0.03, y + h - 2.6, z + Math.sin(a) * 0.2 - 0.03, x + Math.cos(a) * 0.2 + 0.03, y + h - 0.4, z + Math.sin(a) * 0.2 + 0.03, 0.3);
    addCloth(bag, k % 3 === 0 ? 'hide_black' : 'hide_white', g, y + h - 0.4);
  }
}
/**
 * tortoise: the stone tortoise (bixi) that carried a stele [stated: UW: a stone tortoise plinth is one of the few surface traces; inferred: the Chinese type of the Yuan: a dragon-headed tortoise
 * with a plated shell and clawed flippers, a socket on its back for the stele, the stele with its inscription panel and a cap of two entwined dragons]. { at, y, yaw }
 */
export function tortoise(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, yaw = el.yaw ?? 0, G = 'granite_grey';
  const put = (g) => g.rotateY(yaw).translate(x, y, z);
  // a plinth slab under the beast
  bag.add(G, put(box(-1.45, 0, -2.0, 1.45, 0.14, 2.9)));
  bag.add(G, put(blob([0, 0.5, 0], 0.95, 0.5, 1.5, 16, 9)));
  // the shell's plates: the grooves between them stand as low ridges on the dome — three rows of plates (the spine's five, the four of each flank) and the marginal ring
  const sh = (u, v) => 0.5 + 0.5 * Math.sqrt(Math.max(0, 1 - (u / 0.95) ** 2 - (v / 1.5) ** 2));
  const ridge = (pts, r = 0.028) => { for (let i = 0; i + 1 < pts.length; i++) bag.add(G, put(rod(pts[i], pts[i + 1], r, 4))); };
  const on = (u, v, lift = 0.012) => [u, sh(u, v) + lift, v];
  for (const u0 of [-0.3, 0.3, -0.62, 0.62]) { const pts = []; for (let v = -1.15; v <= 1.151; v += 0.23) { const uu = u0 * (1 - Math.abs(v) * 0.12); if ((uu / 0.95) ** 2 + (v / 1.5) ** 2 < 0.93) pts.push(on(uu, v)); } ridge(pts); }
  for (let v = -1.05; v <= 1.06; v += 0.42) { const pts = [], w = 0.9 * Math.sqrt(Math.max(0, 1 - (v / 1.5) ** 2 / 0.95)); for (let k = -4; k <= 4; k++) { const uu = w * k / 4 * 0.97; if ((uu / 0.95) ** 2 + (v / 1.5) ** 2 < 0.93) pts.push(on(uu, v + Math.abs(uu) * 0.08)); } ridge(pts); }
  { const pts = []; for (let a = 0; a <= TAU + 0.01; a += TAU / 28) { const u = Math.cos(a) * 0.86, v = Math.sin(a) * 1.35; pts.push(on(u, v)); } ridge(pts, 0.04); }
  // the rim of the shell, a rolled lip
  { const pts = []; for (let a = 0; a <= TAU + 0.01; a += TAU / 28) pts.push([Math.cos(a) * 0.96, 0.46, Math.sin(a) * 1.47]); ridge(pts, 0.06); }
  // the socket on the back: a stepped mortise block of the stele, with a chamfered lip
  bag.add(G, put(box(-0.78, 0.95, -0.3, 0.78, 1.14, 0.3))); bag.add(G, put(box(-0.7, 1.14, -0.24, 0.7, 1.2, 0.24)));
  // the head: a dragon's — a long neck rising from the shell, brow, snout, open jaws with teeth, nostrils, horns swept back, ears, a beard
  bag.add(G, put(tube([[0, 0.55, 1.1, 0.34], [0, 0.62, 1.6, 0.28], [0, 0.82, 2.05, 0.25]], 10)));
  bag.add(G, put(blob([0, 0.9, 2.3, ], 0.27, 0.25, 0.36, 12, 8)));
  bag.add(G, put(blob([0, 0.78, 2.62], 0.17, 0.1, 0.24, 9, 5))); bag.add(G, put(blob([0, 0.62, 2.6], 0.14, 0.05, 0.22, 8, 4)));
  for (const s of [-1, 1]) {
    bag.add(G, put(blob([s * 0.12, 0.9, 2.84], 0.045, 0.04, 0.04, 6, 4)));
    bag.add(G, put(blob([s * 0.2, 1.1, 2.28], 0.1, 0.07, 0.12, 7, 5)));
    bag.add(G, put(blob([s * 0.22, 0.99, 2.18], 0.05, 0.05, 0.05, 6, 4)));
    bag.add(G, put(tube([[s * 0.14, 1.12, 2.2, 0.055], [s * 0.26, 1.32, 1.9, 0.045], [s * 0.3, 1.38, 1.55, 0.02]], 6)));
    bag.add(G, put(tube([[s * 0.26, 0.95, 2.18, 0.1], [s * 0.4, 0.98, 2.0, 0.07], [s * 0.42, 0.9, 1.88, 0.01]], 5, 0.3)));
    for (let t = 0; t < 4; t++) { bag.add(G, put(tube([[s * (0.09 + t * 0.012), 0.69, 2.5 + t * 0.07, 0.025], [s * (0.09 + t * 0.012), 0.76, 2.52 + t * 0.07, 0.003]], 4))); bag.add(G, put(tube([[s * (0.08 + t * 0.012), 0.66, 2.5 + t * 0.07, 0.022], [s * (0.08 + t * 0.012), 0.6, 2.5 + t * 0.07, 0.003]], 4))); }
  }
  bag.add(G, put(tube([[0, 0.58, 2.6, 0.05], [0, 0.4, 2.62, 0.04], [0, 0.26, 2.55, 0.008]], 5)));
  // the four flippers, each with four claws; the short tail curled to one side
  for (const [sx, sz] of [[-1, 0.85], [1, 0.85], [-1, -0.85], [1, -0.85]]) {
    bag.add(G, put(blob([sx * 1.0, 0.2, sz], 0.3, 0.16, 0.4, 9, 5)));
    for (let c = 0; c < 4; c++) bag.add(G, put(tube([[sx * (1.0 + 0.12), 0.1 - 0, sz + 0.32 + (c - 1.5) * 0.001 + 0.0, 0.001], [sx * (1.0 + 0.05 + (c - 1.5) * 0.09), 0.12, sz + 0.3 + (c - 1.5) * 0.02 + 0.2, 0.03], [sx * (1.0 + 0.05 + (c - 1.5) * 0.11), 0.15, sz + 0.62, 0.006]], 4)));
  }
  bag.add(G, put(tube([[0, 0.3, -1.4, 0.12], [0.2, 0.22, -1.8, 0.07], [0.45, 0.2, -1.95, 0.015]], 6)));
  // the stele: the tablet in its socket, a framed panel of ruled columns of text, the cap of two entwined dragons about a pearl
  const H0 = 1.2, H1 = 3.5;
  bag.add(G, put(box(-0.55, H0, -0.15, 0.55, H1, 0.15)));
  bag.add(G, put(box(-0.5, H0 + 0.1, 0.15, 0.5, H1 - 0.1, 0.18)));
  const cols = 9, rows = 16;
  for (let c = 0; c < cols; c++) for (let r = 0; r < rows; r++) {
    const u = -0.4 + c * 0.1, v = H0 + 0.25 + r * 0.125, j = ((c * 7 + r * 13) % 5) * 0.004;
    if ((c * 3 + r * 5) % 11 === 0) continue;                     // a gap: a space in the line
    bag.add(G, put(box(u - 0.03 - j, v, 0.18, u + 0.03, v + 0.085 - j * 2, 0.2)));
  }
  bag.add(G, put(box(-0.34, H1 - 0.02, -0.15, 0.34, H1 + 0.0, 0.15)));
  bag.add(G, put(box(-0.66, H1, -0.2, 0.66, H1 + 0.18, 0.2)));
  // the cap: an arch of stepped slabs, the plaque for the title at its middle, and on its face the two dragons whose bodies cross over it
  for (let i = 0; i < 5; i++) { const w = 0.62 - i * 0.12, y0 = H1 + 0.18 + i * 0.14; bag.add(G, put(box(-w - 0.004 * i, y0, -0.19, w, y0 + 0.14, 0.19))); }
  bag.add(G, put(box(-0.16, H1 + 0.3, 0.19, 0.16, H1 + 0.62, 0.22)));
  for (const s of [-1, 1]) {
    const pts = []; for (let k = 0; k <= 8; k++) { const t = k / 8, u = s * (0.62 - t * 0.6), v = H1 + 0.22 + Math.sin(t * Math.PI * 0.62) * 0.62 + Math.sin(t * Math.PI * 3) * 0.04; pts.push([u, v, 0.25 + (k % 2) * 0.02, 0.07 - t * 0.02]); }
    bag.add(G, put(tube(pts, 6)));
    bag.add(G, put(blob([s * 0.66, H1 + 0.14, 0.27], 0.09, 0.08, 0.11, 7, 4)));
    for (let c = 0; c < 3; c++) bag.add(G, put(tube([[s * (0.6 - c * 0.14), H1 + 0.3 + c * 0.1, 0.3, 0.02], [s * (0.6 - c * 0.14) + s * 0.05, H1 + 0.24 + c * 0.1, 0.34, 0.004]], 4)));
  }
  bag.add(G, put(blob([0, H1 + 0.82, 0.24], 0.07, 0.07, 0.07, 7, 5)));
  col.circle(x, z, 1.3, y, y + 1);
}
/** kiln: a domed updraught kiln for tiles [stated: UW/finds: kilns for roof tiles, pipes, tableware] with its stoke-hole, flue and stacked tiles. { at, y, r, yaw } */
export function kiln(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, r = el.r ?? 2.1, yaw = el.yaw ?? 0, c = Math.cos(yaw), s = Math.sin(yaw);
  bag.add('brick_grey', lathe([[r + 0.3, 0], [r, 0.4], [r * 0.95, 1.5], [r * 0.65, 2.4], [r * 0.3, 2.9], [0.001, 3.0]], 16, null, x, y, z));
  bag.add('brick_grey', lathe([[0.5, 0], [0.4, 3.6], [0.32, 4.4]], 8, null, x + c * r * 0.0 - s * (r + 0.7), y, z + s * 0.0 + c * (r + 0.7)));
  // the stoke-hole: a low arch with embers
  const sx = x + s * (r + 0.1), sz = z + c * (r + 0.1);
  bag.add('opening', obox([sx - c * 0.4, sz + s * 0.4], [sx + c * 0.4, sz - s * 0.4], 0.3, y, y + 0.8));
  bag.add('flame', obox([sx - c * 0.25 + s * 0.12, sz + s * 0.25 + c * 0.12], [sx + c * 0.25 + s * 0.12, sz - s * 0.25 + c * 0.12], 0.04, y + 0.1, y + 0.4));
  col.circle(x, z, r + 0.4, y, y + 3);
}
/** tile_stack: roof tiles stacked on edge in rows, and a heap of clay. { rect, y, n } */
export function tileStack(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, rows = el.rows ?? 5;
  for (let k = 0; k < rows; k++) bag.add(k % 2 ? 'tile_grey' : 'tile_dark', box(x0, y + k * 0.24, z0, x1, y + (k + 1) * 0.24 - 0.01, z1));
  col.rect(el.rect, y, y + rows * 0.24);
}
/** forge: an open smithy [stated: UW: metalworking with water-powered bellows] — four posts, a plank roof, a clay hearth with embers, bellows, an anvil on a block, a quenching tub, charcoal. { rect, y, seed } */
export function forge(el, { bag, col, lights }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, H = 2.7;
  for (const [px, pz] of [[x0, z0], [x1, z0], [x0, z1], [x1, z1]]) { bag.add('timber', rod([px, y, pz], [px, y + H, pz], 0.1, 6)); col.circle(px, pz, 0.1, y, y + H); }
  bag.add('timber', box(x0 - 0.3, y + H, z0 - 0.3, x1 + 0.3, y + H + 0.14, z1 + 0.3));
  bag.add('planks_grey', box(x0 - 0.4, y + H + 0.14, z0 - 0.4, x1 + 0.4, y + H + 0.26, z1 + 0.4));
  bag.add('brick_grey', box(x0 + 0.3, y, z0 + 0.2, x0 + 1.5, y + 0.9, z0 + 1.2)); col.rect([x0 + 0.3, z0 + 0.2, x0 + 1.5, z0 + 1.2], y, y + 0.9);
  bag.add('flame', box(x0 + 0.55, y + 0.9, z0 + 0.4, x0 + 1.25, y + 0.97, z0 + 1.0));
  bag.add('hide_brown', lathe([[0.001, 0], [0.25, 0.05], [0.28, 0.25], [0.12, 0.45], [0.001, 0.5]], 8, null, x0 + 1.9, y + 0.4, z0 + 0.7));
  bag.add('log_pine', lathe([[0.3, 0], [0.28, 0.6]], 8, null, cx + 0.5, y, cz + 0.4)); bag.add('iron', box(cx + 0.28, y + 0.6, cz + 0.3, cx + 0.72, y + 0.72, cz + 0.5)); col.circle(cx + 0.5, cz + 0.4, 0.34, y, y + 0.7);
  bag.add('wood_dark', lathe([[0.4, 0], [0.4, 0.5], [0.001, 0.5]], 10, null, x1 - 0.8, y, z1 - 0.7)); col.circle(x1 - 0.8, z1 - 0.7, 0.42, y, y + 0.5);
  bag.add('bark_dark', lathe([[0.7, 0], [0.5, 0.35], [0.001, 0.5]], 8, null, x1 - 0.9, y, z0 + 0.8));
  lights?.push({ at: [x0 + 0.9, y + 1.3, z0 + 0.7], color: '#ff8a3a', intensity: 2, distance: 7 });
}
/** pen: a pen of poles and rails (hurdles), { rect, y, gate ('s' etc), h }; posts every 2 m, two rails, a gap for the gate. */
export function pen(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, h = el.h ?? 1.1, gate = el.gate ?? 's';
  const sides = [['n', [x0, z0], [x1, z0]], ['s', [x0, z1], [x1, z1]], ['w', [x0, z0], [x0, z1]], ['e', [x1, z0], [x1, z1]]];
  for (const [sd, a, b] of sides) {
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.round(L / 2));
    const gap = sd === gate ? [L / 2 - 1.1, L / 2 + 1.1] : null;
    for (let i = 0; i <= n; i++) { const u = L * i / n; if (gap && u > gap[0] + 0.05 && u < gap[1] - 0.05) continue; const p = [a[0] + (b[0] - a[0]) * u / L, a[1] + (b[1] - a[1]) * u / L]; bag.add('timber', rod([p[0], y, p[1]], [p[0], y + h + 0.1, p[1]], 0.06, 5)); }
    for (const hh of [h * 0.45, h * 0.85]) {
      const seg = gap ? [[0, gap[0]], [gap[1], L]] : [[0, L]];
      for (const [u0, u1] of seg) { const pa = [a[0] + (b[0] - a[0]) * u0 / L, a[1] + (b[1] - a[1]) * u0 / L], pb = [a[0] + (b[0] - a[0]) * u1 / L, a[1] + (b[1] - a[1]) * u1 / L]; bag.add('timber', rod([pa[0], y + hh, pa[1]], [pb[0], y + hh, pb[1]], 0.035, 5)); }
    }
    const seg = gap ? [[0, gap[0]], [gap[1], L]] : [[0, L]];
    for (const [u0, u1] of seg) col.segment([a[0] + (b[0] - a[0]) * u0 / L, a[1] + (b[1] - a[1]) * u0 / L], [a[0] + (b[0] - a[0]) * u1 / L, a[1] + (b[1] - a[1]) * u1 / L], 0.1, y, y + h);
  }
}
void blob;

/** coffer_cart: the tall cart of the Mongols [stated: Rubruck: felt-covered coffers on tall carts, an axle like a ship's mast]: two great spoked wheels, a plank bed, a chest roofed with black felt, the pole forward (+z). { at, y, yaw, goods } */
export function cofferCart(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, yaw = el.yaw ?? 0, c = Math.cos(yaw), s = Math.sin(yaw);
  const P = (u, v) => [x + c * u + s * v, z - s * u + c * v];      // u across, v along (+ forward)
  for (const sd of [-1, 1]) {
    const o = P(sd * 1.05, 0);
    for (let k = 0; k < 12; k++) { const a = k / 12 * TAU; bag.add('wood_dark', rod([o[0] + s * Math.cos(a) * 0.1, y + 0.9 + Math.sin(a) * 0.1, o[1] + c * Math.cos(a) * 0.1], [o[0] + s * Math.cos(a) * 0.84, y + 0.9 + Math.sin(a) * 0.84, o[1] + c * Math.cos(a) * 0.84], 0.028, 5)); }
    for (let k = 0; k < 20; k++) { const a0 = k / 20 * TAU, a1 = (k + 1) / 20 * TAU; bag.add('wood_dark', rod([o[0] + s * Math.cos(a0) * 0.9, y + 0.9 + Math.sin(a0) * 0.9, o[1] + c * Math.cos(a0) * 0.9], [o[0] + s * Math.cos(a1) * 0.9, y + 0.9 + Math.sin(a1) * 0.9, o[1] + c * Math.cos(a1) * 0.9], 0.06, 4)); }
    col.circle(o[0], o[1], 0.35, y, y + 1.8);
  }
  const a = P(-1.15, 0), b = P(1.15, 0); bag.add('timber', rod([a[0], y + 0.9, a[1]], [b[0], y + 0.9, b[1]], 0.1, 7));
  bag.add('wood_dark', obox(P(0, -1.6), P(0, 1.6), 1.9, y + 1.05, y + 1.2));
  bag.add('hide_black', obox(P(0, -1.0), P(0, 1.0), 1.5, y + 1.2, y + 2.2));
  const f1 = P(0, -1.0), f2 = P(0, 1.0);
  bag.add('hide_black', obox(f1, f2, 1.0, y + 2.2, y + 2.6));
  bag.add('cloth_white', obox(P(0, -0.6), P(0, 0.6), 0.5, y + 2.6, y + 2.7));
  for (const sd of [-0.4, 0.4]) { const p = P(sd, 1.6), q = P(sd, 4.2); bag.add('timber', rod([p[0], y + 1.1, p[1]], [q[0], y + 0.5, q[1]], 0.05, 6)); }
  col.segment(P(0, -1.6), P(0, 1.6), 1.9, y, y + 2.7);
}
