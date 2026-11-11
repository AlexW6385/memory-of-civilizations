// Small things of Northern Song Bianjing, built in a local frame (y up, the sitter's front −z) and put
// by the shop fronts (shops.js) and the room builders (interiors.js): geometry helpers, the furniture
// of the period (high furniture was usual by the Northern Song: tables, benches and stools, chairs
// with backs, the folding chair, couches and screens, lacquered and plain), and vessels.
import { box, lathe, rod } from '../../core/geom.js';
import { Shape, ExtrudeGeometry } from '../../core/three.js';
import { ball, limb, T, Parts } from '../../styles/qing/carving.js';
export { box, lathe, rod, ball, limb, T, Parts };

export const WD = 'timber', LQ = 'lacquer_chestnut', DK = 'wood_dark';
export function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
/** A polygon [[u, y], …] extruded by depth along z, centred on z = 0. */
export function prism(pts, depth) {
  const s = new Shape(); pts.forEach(([u, y], i) => (i ? s.lineTo(u, y) : s.moveTo(u, y)));
  const g = new ExtrudeGeometry(s, { depth, bevelEnabled: false, curveSegments: 1 });
  g.translate(0, 0, -depth / 2);
  return g;
}
/** A profile [[z, y], …] extruded along x from x0 to x1. */
export function prismX(pts, x0, x1) { const g = prism(pts, x1 - x0); g.rotateY(-Math.PI / 2); g.translate((x0 + x1) / 2, 0, 0); return g; }
export const ly = (prof, seg = 10, x = 0, y = 0, z = 0) => lathe(prof, seg, null, x, y, z);
export const drum = (r0, r1, h, seg, x, y, z) => ly([[0.001, 0], [r0, 0], [r1, h], [0.001, h]], Math.round(seg * 1.5), x, y, z);
export const bowl = (x, y, z, k = 1) => ly([[0.001, 0], [0.036 * k, 0], [0.07 * k, 0.026 * k], [0.088 * k, 0.07 * k], [0.082 * k, 0.072 * k], [0.064 * k, 0.034 * k], [0.001, 0.014 * k]], 8, x, y, z);
export const jar = (r, h, x, y, z) => ly([[0.001, 0], [r * 0.5, 0], [r, h * 0.22], [r * 1.12, h * 0.5], [r * 0.9, h * 0.78], [r * 0.55, h * 0.93], [r * 0.6, h], [0.001, h]], 10, x, y, z);

// ── furniture (P: a Parts; faces −z) ───────────────────────────────────────────
/** A table w × d, h high: top, apron, square legs with stretchers (the Song table: plain, the legs set in from the corners). */
export function table(P, w, d, h, m = LQ) {
  P.add(m, box(-w / 2, h - 0.045, -d / 2, w / 2, h, d / 2));
  for (const s of [-1, 1]) { P.add(m, box(-w / 2 + 0.07, h - 0.12, s * (d / 2 - 0.06) - 0.012, w / 2 - 0.07, h - 0.045, s * (d / 2 - 0.06) + 0.012)); P.add(m, box(s * (w / 2 - 0.07) - 0.012, h - 0.12, -d / 2 + 0.06, s * (w / 2 - 0.07) + 0.012, h - 0.045, d / 2 - 0.06)); }
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) P.add(m, box(sx * (w / 2 - 0.08) - 0.025, 0, sz * (d / 2 - 0.07) - 0.025, sx * (w / 2 - 0.08) + 0.025, h - 0.12, sz * (d / 2 - 0.07) + 0.025));
  for (const sx of [-1, 1]) P.add(m, box(sx * (w / 2 - 0.08) - 0.012, 0.16, -d / 2 + 0.07, sx * (w / 2 - 0.08) + 0.012, 0.19, d / 2 - 0.07));
}
/** A long bench (ban deng) l × 0.26, 0.46 high, its legs splayed. */
export function bench(P, l = 1.4, m = WD) {
  P.add(m, box(-l / 2, 0.42, -0.13, l / 2, 0.46, 0.13));
  for (const s of [-1, 1]) for (const z of [-0.09, 0.09]) P.add(m, limb([s * (l / 2 - 0.12), 0, z * 1.5], [s * (l / 2 - 0.15), 0.42, z], 0.027, 0.023, 5));
  P.add(m, box(-l / 2 + 0.15, 0.2, -0.012, l / 2 - 0.15, 0.23, 0.012));
}
/** A stool (a square or round seat 0.34, 0.45 high). */
export function stool(P, m = WD, round = false) {
  if (round) P.add(m, drum(0.17, 0.17, 0.04, 8, 0, 0.41, 0)); else P.add(m, box(-0.17, 0.41, -0.17, 0.17, 0.45, 0.17));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) P.add(m, limb([sx * 0.13, 0, sz * 0.13], [sx * 0.11, 0.41, sz * 0.11], 0.022, 0.02, 5));
  P.add(m, box(-0.12, 0.18, -0.012, 0.12, 0.2, 0.012)); P.add(m, box(-0.12, 0.18, 0.1, 0.12, 0.2, 0.124).translate(0, 0, -0.112));
}
/** The Song chair with a back (yi), its top rail's ends turned out beyond the posts (the "lotus-leaf" yoke): seat 0.5, back 1.0. */
export function chair(P, m = LQ, arms = false) {
  const sw = 0.25, sd = 0.24, sh = 0.5;
  P.add(m, box(-sw, sh - 0.04, -sd, sw, sh, sd)); P.add('reed_mat', box(-sw + 0.03, sh, -sd + 0.03, sw - 0.03, sh + 0.006, sd - 0.03));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) P.add(m, limb([sx * (sw - 0.03), 0, sz * (sd - 0.03)], [sx * (sw - 0.03), sh - 0.04, sz * (sd - 0.03)], 0.019, 0.017, 5));
  for (const sx of [-1, 1]) P.add(m, limb([sx * (sw - 0.03), sh, sd - 0.03], [sx * (sw - 0.03), 1.0, sd - 0.03], 0.018, 0.016, 5));
  P.add(m, box(-sw + 0.03, 0.9, sd - 0.045, sw - 0.03, 0.96, sd - 0.015)); P.add(m, box(-sw - 0.07, 0.98, sd - 0.05, sw + 0.07, 1.03, sd - 0.01));
  P.add(m, box(-0.07, 0.56, sd - 0.04, 0.07, 0.9, sd - 0.02));
  P.add(m, box(-sw + 0.03, 0.12, -sd + 0.03, sw - 0.03, 0.15, -sd + 0.05)); 
  if (arms) for (const sx of [-1, 1]) { P.add(m, limb([sx * (sw - 0.03), sh, -sd + 0.04], [sx * (sw - 0.03), sh + 0.2, -sd + 0.04], 0.014, 0.014, 5)); P.add(m, box(sx * (sw - 0.03) - 0.016, sh + 0.2, -sd + 0.04, sx * (sw - 0.03) + 0.016, sh + 0.226, sd - 0.03)); }
}
/** A couch / luohan bed (ta): a wide low platform with a carved apron, a rail on three sides; l × d, 0.46 high. */
export function couch(P, l = 1.9, d = 0.95, m = LQ) {
  P.add(m, box(-l / 2, 0.38, -d / 2, l / 2, 0.46, d / 2)); P.add('reed_mat', box(-l / 2 + 0.04, 0.46, -d / 2 + 0.04, l / 2 - 0.04, 0.462, d / 2 - 0.04));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) P.add(m, box(sx * (l / 2 - 0.08) - 0.04, 0, sz * (d / 2 - 0.08) - 0.04, sx * (l / 2 - 0.08) + 0.04, 0.38, sz * (d / 2 - 0.08) + 0.04));
  P.add(m, box(-l / 2 + 0.1, 0.3, -d / 2 + 0.01, l / 2 - 0.1, 0.38, -d / 2 + 0.05));
  P.add(m, box(-l / 2 + 0.02, 0.46, d / 2 - 0.05, l / 2 - 0.02, 0.76, d / 2 - 0.02)); for (const s of [-1, 1]) P.add(m, box(s * (l / 2 - 0.06) - 0.03, 0.46, -d / 2 + 0.04, s * (l / 2 - 0.06) + 0.03, 0.7, d / 2 - 0.04));
}
/** A bed with a canopy frame (a screen bed, jia zi chuang): couch, four posts, a top frame and a hung curtain of white cloth. */
export function bed(P, l = 2.0, d = 1.2) {
  couch(P, l, d, LQ);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) P.add(LQ, limb([sx * (l / 2 - 0.05), 0.46, sz * (d / 2 - 0.05)], [sx * (l / 2 - 0.05), 1.95, sz * (d / 2 - 0.05)], 0.025, 0.022, 5));
  P.add(LQ, box(-l / 2, 1.95, -d / 2, l / 2, 2.0, d / 2));
  P.add('cloth_white', box(-l / 2 + 0.1, 0.7, -d / 2 + 0.03, 0.1 - l / 2 + 0.5, 1.9, -d / 2 + 0.045));
  P.add('cloth_indigo', box(-l / 2 + 0.1, 0.462, -d / 2 + 0.15, l / 2 - 0.5, 0.52, d / 2 - 0.12));    // the quilt
  P.add('cloth_white', box(l / 2 - 0.46, 0.462, -0.12, l / 2 - 0.12, 0.58, 0.12));                    // the pillow
}
/** A chest (xiang), 0.9 × 0.5 × 0.5, with iron fittings. */
export function chest(P, w = 0.9, h = 0.5, d = 0.5, m = WD) {
  P.add(m, box(-w / 2, 0.06, -d / 2, w / 2, h, d / 2)); for (const sx of [-1, 1]) for (const sz of [-1, 1]) P.add(DK, box(sx * (w / 2 - 0.04) - 0.03, 0, sz * (d / 2 - 0.04) - 0.03, sx * (w / 2 - 0.04) + 0.03, 0.06, sz * (d / 2 - 0.04) + 0.03));
  P.add('iron', box(-0.05, h - 0.18, -d / 2 - 0.012, 0.05, h - 0.06, -d / 2)); for (const sx of [-1, 1]) P.add('iron', box(sx * (w / 2 - 0.1) - 0.02, 0.06, -d / 2 - 0.008, sx * (w / 2 - 0.1) + 0.02, h, -d / 2 + 0.004));
}
/** A cupboard / shelves (ge): w × d × h, open shelves every 0.4 m; goods are put on them by the caller (returns the shelf heights). */
export function shelves(P, w, d, h, m = WD) {
  for (const s of [-1, 1]) P.add(m, box(s * (w / 2 - 0.02) - 0.02, 0, -d / 2, s * (w / 2 - 0.02) + 0.02, h, d / 2));
  const ys = []; for (let y = 0.15; y < h - 0.1; y += 0.4) { P.add(m, box(-w / 2, y, -d / 2, w / 2, y + 0.03, d / 2)); ys.push(y + 0.03); }
  P.add(m, box(-w / 2, 0, d / 2 - 0.015, w / 2, h, d / 2)); P.add(m, box(-w / 2, h, -d / 2 - 0.03, w / 2, h + 0.04, d / 2 + 0.03));
  return ys;
}
/** A free-standing screen (pingfeng) of three panels with a painting (a landscape in ink): w × h. */
export function screen(P, w = 2.2, h = 1.7) {
  for (let k = 0; k < 3; k++) { const x0 = -w / 2 + k * w / 3 + 0.01, x1 = x0 + w / 3 - 0.02, a = k - 1; P.add(LQ, box(x0, 0.16, a * 0.05 - 0.02, x1, h, a * 0.05 + 0.02)); P.add('paint_white', box(x0 + 0.05, 0.28, a * 0.05 - 0.026, x1 - 0.05, h - 0.1, a * 0.05 - 0.02)); P.add('lacquer_black', box(x0 + 0.1, 0.5 + 0.08 * k, a * 0.05 - 0.03, x1 - 0.1, 0.62 + 0.08 * k, a * 0.05 - 0.026)); P.add('slate', box(x0 + 0.2, 0.9 - 0.06 * k, a * 0.05 - 0.03, x1 - 0.05, 1.05 - 0.06 * k, a * 0.05 - 0.026)); }
  for (const s of [-1, 1]) P.add(LQ, box(s * w / 2 - 0.04, 0, -0.1, s * w / 2 + 0.04, 0.16, 0.1));
}
/** A brazier on a stand with a kettle (the tea man's and the tavern's): charcoal in an iron bowl; kettle of bronze with a spout. */
export function brazier(P, kettle = true) {
  P.add('granite_grey', drum(0.24, 0.2, 0.1, 10, 0, 0, 0)); P.add('iron', ly([[0.001, 0.1], [0.2, 0.1], [0.24, 0.3], [0.22, 0.31], [0.17, 0.12], [0.001, 0.12]], 12));
  P.add('flame', drum(0.16, 0.12, 0.03, 8, 0, 0.14, 0));
  if (kettle) { P.add('bronze', ly([[0.001, 0.31], [0.13, 0.31], [0.16, 0.38], [0.14, 0.48], [0.07, 0.52], [0.001, 0.53]], 12)); P.add('bronze', limb([0.1, 0.42, 0], [0.26, 0.55, 0], 0.025, 0.016, 6)); P.add(DK, limb([-0.12, 0.45, 0], [-0.3, 0.52, 0], 0.014, 0.014, 5)); P.add('bronze', ly([[0.001, 0.52], [0.04, 0.52], [0.03, 0.57], [0.001, 0.58]], 6)); }
}
/** A tea set on the table (y 0): a tray with a ewer, a stand with a bowl (Song tea bowls: dark, conical — "jian" ware), a whisk. */
export function teaSet(P, seed = 1) {
  const r = rng(seed);
  P.add('lacquer_black', box(-0.2, 0, -0.12, 0.2, 0.02, 0.12));
  P.add('glaze_white', ly([[0.001, 0.02], [0.05, 0.02], [0.06, 0.14], [0.04, 0.2], [0.03, 0.26], [0.001, 0.27]], 10, -0.1, 0, 0)); P.add('glaze_white', limb([-0.04, 0.17, 0], [0.0, 0.1, 0], 0.01, 0.012, 4));
  for (const [x, z] of [[0.04, -0.04], [0.12, 0.03], [0.02, 0.07]]) { P.add('lacquer_red', ly([[0.001, 0], [0.04, 0], [0.05, 0.012], [0.03, 0.03], [0.001, 0.03]], 8, x, 0.02, z)); P.add(r() < 0.5 ? 'lacquer_black' : 'glaze_white', bowl(x, 0.042, z, 0.8)); }
}
/** A hanging scroll on a wall (faces −z): w × h, a mounted painting with a roller at the foot. */
export function hanging(P, w, h, seed = 1) {
  const r = rng(seed);
  P.add('cloth_ochre', box(-w / 2 - 0.05, 0, -0.012, w / 2 + 0.05, h + 0.04, 0));
  P.add('paint_white', box(-w / 2, 0.08, -0.016, w / 2, h - 0.04, -0.012));
  const hz = 0.2 + r() * 0.2; P.add('slate', box(-w / 2 + 0.05, 0.1, -0.02, w / 2 - 0.05, 0.1 + h * hz, -0.016));
  P.add('slate', box(-w * 0.2, 0.1 + h * hz, -0.02, w * 0.3, 0.1 + h * (hz + 0.18), -0.016)); P.add('lacquer_black', box(w * 0.05, h * 0.55, -0.02, w * 0.12, h * 0.6, -0.016));
  P.add(DK, drum(0.015, 0.015, w + 0.14, 6, 0, 0, 0).rotateZ(Math.PI / 2).translate(0, 0.0, -0.01));
}
/** A lantern, hung by a chain: a red or white paper lantern with timber ends (palace-lantern shape, 0.4 high). */
export function lantern(P, mat = 'lamp_paper', chain = 0.4) {
  P.add(DK, box(-0.01, 0, -0.01, 0.01, chain, 0.01)); P.add(DK, drum(0.12, 0.12, 0.03, 8, 0, -0.03, 0).translate(0, 0, 0));
  P.add(mat, ly([[0.001, -0.07], [0.13, -0.07], [0.15, -0.25], [0.13, -0.43], [0.001, -0.43]], 12, 0, 0.0, 0)); P.add(DK, drum(0.1, 0.1, 0.025, 8, 0, -0.46, 0));
  P.add('cloth_red', rod([0, -0.48, 0], [0, -0.7, 0], 0.012, 4));
}
/** A lamp on a stand (a tall wooden stand with a dish of oil and a wick; 1.3 high). */
export function lampStand(P, h = 1.3) {
  P.add(WD, limb([0, 0, 0], [0, h, 0], 0.03, 0.02, 6)); P.add(WD, box(-0.18, 0, -0.18, 0.18, 0.05, 0.18)); P.add('bronze', ly([[0.001, h], [0.07, h], [0.09, h + 0.04], [0.001, h + 0.04]], 10)); P.add('flame', ly([[0.001, h + 0.04], [0.015, h + 0.05], [0.001, h + 0.1]], 5));
}
/** A plum vase (meiping) with a plum branch (y 0): a tall glazed vase, a branch with blossom. */
export function plumVase(P, seed = 5) {
  const r = rng(seed);
  P.add('glaze_white', ly([[0.001, 0], [0.06, 0], [0.11, 0.1], [0.13, 0.2], [0.08, 0.3], [0.045, 0.34], [0.05, 0.37], [0.001, 0.37]], 10));
  for (let k = 0; k < 3; k++) { const a = (k - 1) * 0.5 + r() * 0.2; const tip = [Math.sin(a) * 0.3, 0.8 + r() * 0.25, Math.cos(a) * 0.12]; P.add('bark_dark', limb([0, 0.34, 0], tip, 0.01, 0.004, 4)); for (let j = 0; j < 5; j++) P.add('marble_pink', ball(0.025, 0.02, 0.025, 6, 4).translate(tip[0] * (0.5 + j * 0.1), tip[1] * (0.6 + j * 0.08) + 0.1, tip[2] * (0.6 + j * 0.1))); }
}
/** Goods on a table or shelf: a stack of bowls, a row of cups, a covered jar, a bundle of tea cakes (y 0): small clutter for the rooms. */
export function crockery(P, seed = 1) {
  const r = rng(seed);
  for (let k = 0; k < 3; k++) P.add('glaze_white', bowl(-0.15 + k * 0.15, 0, r() * 0.06, 0.9));
  P.add('pottery_dark', jar(0.06, 0.16, 0.3, 0, 0)); P.add(DK, drum(0.04, 0.035, 0.02, 6, 0.3, 0.16, 0));
}
/** The floor: square bricks laid (the plan's floor 0.02 thick, y), a plain one for the poorer rooms; returns nothing (the caller's floor collider stands). */
export function brickFloor(P, x0, z0, x1, z1, y = 0, m = 'brick_paving') { P.add(m, box(x0, y - 0.04, z0, x1, y, z1)); }
