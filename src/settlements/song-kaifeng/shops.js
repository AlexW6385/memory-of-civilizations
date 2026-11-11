// Bianjing's shop fronts (dossier §11, "The trades of the scroll"): what the houses' shop fronts lack —
// the trade's sign on its pole (the wine flag of blue and white cloth, the physician's gourd and
// signboard, the grain measure, hung pork, the saddle, bundles of incense, the pan of the smith, the
// lantern box of the inn and the tea house), the vertical signboard on its stone feet, the goods of
// each trade on the apron and on trestles in the street, not one shop the same as its neighbour.
// (The horizontal name boards are the scroll's own: styles/song/scroll.js shop_plaque.)
//
// An element of the street life (`kaifeng_shop`, style life), one per shop, every piece an instance
// of a shared shape. Local frame: x along the front, z out into the street, y up from the street.
// `shopElements()` lists the elements for layout.js's lots; town.js adds them with
// `plans.push(base('song-kaifeng-shops', shopElements(), 'life'))`.
import { STYLES } from '../../core/build.js';
import { hangFrom, windMat, fromTriangles } from '../../core/geom.js';
import '../../objects/index.js';
import { placer, assembly } from '../../objects/kit.js';
import { box, rod, ly, drum, bowl, jar, prismX, rng, limb } from './props.js';
import { lots } from './layout.js';
import { tradeOf, wineShops, teaHouses } from './trades.js';

// ── the writing: strokes [kind, x0, y0, x1, y1] on a 100 grid (as the other brush-stroke signs) ──
const GLYPHS = {
  酒: [['d', 16, 92, 26, 84], ['d', 10, 70, 20, 62], ['t', 10, 32, 26, 46], ['h', 42, 90, 92, 90], ['s', 48, 90, 48, 14], ['s', 86, 90, 86, 14], ['h', 48, 14, 86, 14], ['h', 48, 52, 86, 52], ['s', 67, 90, 67, 52]],
  茶: [['h', 12, 92, 88, 92], ['s', 34, 100, 34, 82], ['s', 66, 100, 66, 82], ['p', 50, 80, 22, 54], ['n', 50, 80, 80, 54], ['h', 16, 40, 84, 40], ['s', 50, 52, 50, 4], ['p', 46, 34, 16, 8], ['n', 54, 34, 84, 8]],
  米: [['d', 30, 88, 42, 78], ['p', 70, 88, 60, 78], ['h', 12, 62, 88, 62], ['s', 50, 96, 50, 6], ['p', 46, 58, 14, 12], ['n', 54, 58, 86, 12]],
  药: [['h', 12, 92, 88, 92], ['s', 32, 100, 32, 84], ['s', 68, 100, 68, 84], ['p', 36, 72, 12, 52], ['p', 34, 52, 12, 32], ['t', 10, 24, 30, 36], ['p', 60, 74, 48, 56], ['h', 48, 74, 86, 74], ['s', 86, 74, 86, 24], ['d', 66, 50, 74, 42]],
  书: [['h', 12, 78, 66, 78], ['s', 66, 78, 66, 56], ['h', 8, 56, 90, 56], ['s', 48, 98, 48, 8], ['d', 72, 88, 82, 76], ['h', 10, 30, 48, 30]],
  金: [['p', 50, 98, 12, 66], ['n', 50, 98, 88, 66], ['h', 28, 72, 72, 72], ['h', 20, 56, 80, 56], ['s', 50, 72, 50, 14], ['d', 32, 44, 40, 36], ['d', 68, 44, 60, 36], ['h', 8, 16, 92, 16]],
  店: [['d', 50, 98, 58, 90], ['h', 14, 84, 90, 84], ['p', 30, 84, 14, 14], ['s', 44, 66, 44, 8], ['h', 44, 66, 88, 66], ['s', 88, 66, 88, 40], ['h', 44, 40, 88, 40], ['h', 44, 8, 88, 8]],
  肉: [['s', 20, 90, 20, 10], ['h', 20, 90, 82, 90], ['s', 82, 90, 82, 20], ['p', 54, 76, 28, 44], ['n', 56, 76, 80, 44], ['p', 52, 50, 26, 20], ['n', 54, 50, 78, 20]],
};
const STROKE = { h: [0.05, 0.065, 0.02, 0.035], s: [0.07, 0.04, 0.02, 0.05], p: [0.075, 0.012, 0.02, 0.06], n: [0.02, 0.1, 0.01, 0.045], d: [0.1, 0.06, 0.02, 0.03], t: [0.06, 0.02, 0.02, 0.05] };
function stroke(out, [k, ax, ay, bx, by], grow, z0, z1) {
  const [wa, wb, ca, cb] = STROKE[k], dx = bx - ax, dy = by - ay, l = Math.hypot(dx, dy) / 100, ux = dx / 100 / l, uy = dy / 100 / l, nx = -uy, ny = ux;
  const A = [ax / 100 - 0.5, ay / 100 - 0.5], B = [bx / 100 - 0.5, by / 100 - 0.5], g = grow;
  const P = [[A[0] - ux * (ca + g), A[1] - uy * (ca + g)], [A[0] - nx * (wa / 2 + g), A[1] - ny * (wa / 2 + g)], [B[0] - nx * (wb / 2 + g), B[1] - ny * (wb / 2 + g)],
    [B[0] + ux * (cb + g), B[1] + uy * (cb + g)], [B[0] + nx * (wb / 2 + g), B[1] + ny * (wb / 2 + g)], [A[0] + nx * (wa / 2 + g), A[1] + ny * (wa / 2 + g)]];
  for (let i = 1; i < 5; i++) out.push(P[0][0], P[0][1], z1, P[i][0], P[i][1], z1, P[i + 1][0], P[i + 1][1], z1);
  for (let i = 0; i < 6; i++) { const p = P[i], q = P[(i + 1) % 6]; out.push(p[0], p[1], z0, q[0], q[1], z0, q[0], q[1], z1, p[0], p[1], z0, q[0], q[1], z1, p[0], p[1], z1); }
}

// ── shapes (built once, shared by every shop) ───────────────────────────────────
const U = {}, DEF = {}, WINDY = new Set();
function unit(name, defaults, build) { DEF[name] = defaults; U[name] = assembly(`kaifeng-shop|${name}`, build); }
const mv = (g, x = 0, y = 0, z = 0) => { g.translate(x, y, z); return g; };
for (const ch of Object.keys(GLYPHS)) unit(`g${ch}`, { g: 'gilt_bronze' }, (a) => { const t = []; for (const s of GLYPHS[ch]) stroke(t, s, 0.004, 0, 0.09); a('g', fromTriangles(t)); });
for (const ch of ['酒', '茶', '店']) { unit(`f${ch}`, { g: 'cloth_black' }, (a) => { const t = []; for (const s of GLYPHS[ch]) stroke(t, s, 0.004, 0, 0.09); a('g', hangFrom(fromTriangles(t), 1.04)); }); WINDY.add(`f${ch}.g`); }
for (const n of ['flag.c', 'flag.e', 'streamers.c', 'pork.c']) WINDY.add(n);

// the pole for the sign: bamboo on a stone foot, leaning a little out, a cross-arm along +z at its top
unit('pole', { p: 'bamboo_culm', s: 'granite_grey', w: 'timber' }, (a) => {
  a('s', box(-0.22, 0, -0.22, 0.22, 0.12, 0.22)); a('s', box(-0.18, 0.12, -0.18, 0.18, 0.26, 0.18)); a('s', box(-0.14, 0.26, -0.14, 0.14, 0.34, 0.14));
  a('p', rod([0, 0.3, 0], [0, 4.6, 0.12], 0.05, 8)); a('p', rod([0, 4.6, 0.12], [0, 4.7, 0.13], 0.034, 6));
  a('w', box(-0.03, 4.28, 0.1, 0.03, 4.34, 0.95)); a('w', rod([0, 4.0, 0.1], [0, 4.3, 0.6], 0.018, 6));
  for (const y of [1.2, 2.4, 3.4]) a('p', box(-0.056, y - 0.012, -0.056, 0.056, y + 0.012, 0.056).translate(0, 0, y * 0.028));
});
// the wine flag: a long swallow-tailed banner of blue and white cloth (the scroll's wine flags), the characters sewn on
unit('flag', { c: 'cloth_indigo', w: 'timber', e: 'cloth_white' }, (a) => {
  a('w', box(-0.02, -0.05, 0.12, 0.02, 0.02, 0.88));
  a('c', hangFrom(prismX([[0.14, -0.04], [0.86, -0.04], [0.86, -1.5], [0.5, -1.2], [0.14, -1.5]], -0.008, 0.008), -0.04));
  a('e', hangFrom(prismX([[0.14, -0.04], [0.86, -0.04], [0.86, -0.12], [0.14, -0.12]], -0.011, 0.011), -0.04));
});
unit('gourd', { g: 'lacquer_chestnut', t: 'cloth_red' }, (a) => {       // the physician's gourd
  a('g', ly([[0.001, -0.62], [0.11, -0.64], [0.2, -0.76], [0.21, -0.9], [0.14, -1.0], [0.1, -1.02], [0.12, -1.12], [0.2, -1.26], [0.21, -1.4], [0.13, -1.5], [0.001, -1.52]], 10, 0, 0, 0.5));
  a('g', ly([[0.001, -0.5], [0.03, -0.5], [0.035, -0.62], [0.001, -0.62]], 6, 0, 0, 0.5)); a('t', rod([0, -0.02, 0.5], [0, -0.5, 0.5], 0.012, 4)); a('t', rod([0, -1.52, 0.5], [0, -1.78, 0.5], 0.02, 5));
});
unit('dou', { w: 'timber', i: 'iron', t: 'cloth_white' }, (a) => {         // the grain measure (dou) hung on its cord
  a('w', rod([0, -0.02, 0.5], [0, -0.55, 0.5], 0.012, 4)); a('w', box(-0.17, -0.95, 0.33, 0.17, -0.55, 0.67)); a('i', box(-0.18, -0.67, 0.32, 0.18, -0.64, 0.68)); a('i', box(-0.18, -0.87, 0.32, 0.18, -0.84, 0.68)); a('t', box(-0.19, -1.28, 0.38, -0.178, -0.95, 0.62));
});
unit('hbowl', { g: 'lacquer_red', t: 'cloth_red' }, (a) => { a('g', ly([[0.001, -0.5], [0.09, -0.5], [0.2, -0.62], [0.27, -0.76], [0.28, -0.8], [0.25, -0.8], [0.18, -0.68], [0.001, -0.58]], 10, 0, 0, 0.5)); a('t', rod([0, -0.02, 0.5], [0, -0.5, 0.5], 0.012, 4)); });
unit('hvase', { g: 'glaze_blue', t: 'cloth_red' }, (a) => { a('g', ly([[0.001, -1.16], [0.1, -1.16], [0.17, -0.98], [0.2, -0.82], [0.12, -0.64], [0.07, -0.58], [0.1, -0.5], [0.001, -0.5]], 10, 0, 0, 0.5)); a('t', rod([0, -0.02, 0.5], [0, -0.5, 0.5], 0.012, 4)); });
unit('hpan', { g: 'iron', t: 'timber' }, (a) => { a('t', rod([0, -0.02, 0.5], [0, -0.45, 0.5], 0.012, 4)); a('g', ly([[0.001, -1.0], [0.12, -1.02], [0.26, -0.9], [0.34, -0.74], [0.35, -0.7], [0.32, -0.7], [0.001, -0.9]], 12, 0, 0, 0.5)); a('t', rod([0, -0.45, 0.5], [0.0, -0.7, 0.77], 0.014, 4)); });
unit('hbook', { c: 'cloth_indigo', p: 'paint_white', w: 'timber' }, (a) => {   // a hung bundle of volumes (the book shop)
  a('w', rod([0, -0.02, 0.5], [0, -0.4, 0.5], 0.012, 4));
  for (let k = 0; k < 4; k++) { const y = -0.42 - k * 0.2; a('c', box(-0.15, y - 0.17, 0.35, 0.15, y, 0.67)); a('p', box(-0.13, y - 0.16, 0.36, 0.13, y - 0.01, 0.37)); }
});
unit('hlantern', { l: 'lamp_paper', b: 'lacquer_black', t: 'cloth_red' }, (a) => {   // the lantern box (the inn's and the tea house's), a tall box of paper on a frame with a cap and a tassel
  a('b', rod([0, -0.02, 0.5], [0, -0.3, 0.5], 0.012, 4)); a('b', box(-0.2, -0.36, 0.3, 0.2, -0.3, 0.7));
  a('l', box(-0.17, -1.05, 0.33, 0.17, -0.36, 0.67)); for (const dx of [-0.17, 0.17]) for (const dz of [0.33, 0.67]) a('b', box(dx - 0.015, -1.05, dz - 0.015, dx + 0.015, -0.36, dz + 0.015)); a('b', box(-0.2, -1.1, 0.3, 0.2, -1.05, 0.7)); a('t', rod([0, -1.1, 0.5], [0, -1.36, 0.5], 0.02, 5));
});
unit('hlamp', { l: 'cloth_red', b: 'lacquer_black', t: 'cloth_red' }, (a) => {   // the red gardenia lamp (zhizi deng) at an inn's or a wine shop's door
  a('b', rod([0, -0.02, 0.5], [0, -0.25, 0.5], 0.012, 4)); a('l', ly([[0.001, -0.25], [0.12, -0.3], [0.2, -0.5], [0.12, -0.72], [0.001, -0.76]], 10, 0, 0, 0.5)); a('t', rod([0, -0.76, 0.5], [0, -1.0, 0.5], 0.018, 5));
});
unit('hsaddle', { l: 'hide_brown', s: 'iron', t: 'cloth_red' }, (a) => {   // a saddle hung over the arm, stirrups below
  a('l', prismX([[0.2, -0.12], [0.5, -0.04], [0.8, -0.12], [0.8, -0.2], [0.5, -0.14], [0.2, -0.2]], -0.14, 0.14)); a('l', box(-0.14, -0.2, 0.2, 0.14, -0.04, 0.24)); a('l', box(-0.14, -0.2, 0.76, 0.14, -0.04, 0.8));
  for (const x of [-0.17, 0.17]) { a('t', rod([x, -0.2, 0.5], [x, -0.55, 0.5], 0.01, 4)); a('s', box(x - 0.07, -0.65, 0.44, x + 0.07, -0.55, 0.56)); }
  a('t', rod([0, -0.04, 0.5], [0, -0.0, 0.5], 0.01, 4));
});
unit('hincense', { s: 'cloth_ochre', r: 'cloth_red', t: 'timber' }, (a) => {   // bundles of incense sticks hung by a red cord (the incense and paper shop's sign)
  a('t', rod([0, -0.02, 0.5], [0, -0.3, 0.5], 0.012, 4));
  for (const dz of [-0.07, 0.07]) { a('s', box(-0.09, -0.9, 0.5 + dz - 0.01, 0.09, -0.3, 0.5 + dz + 0.01)); a('r', box(-0.1, -0.5, 0.5 + dz - 0.02, 0.1, -0.44, 0.5 + dz + 0.02)); }
  a('s', box(-0.18, -1.15, 0.45, -0.04, -0.7, 0.55)); a('r', box(-0.19, -0.78, 0.44, -0.03, -0.74, 0.56));
});
unit('pork', { m: 'cloth_red', f: 'cloth_white', i: 'iron', b: 'timber' }, (a) => {   // the butcher's hung joints on iron hooks from a rail across the front (at the pole's arm)
  a('b', box(-0.02, -0.04, 0.1, 0.02, 0.0, 0.9));
  for (const [z, h, w] of [[0.22, 0.7, 0.14], [0.42, 0.55, 0.12], [0.62, 0.78, 0.15], [0.8, 0.5, 0.11]]) { a('i', rod([0, -0.02, z], [0, -0.14, z], 0.01, 4)); a('m', ly([[0.001, -0.14], [w, -0.2], [w * 1.1, -0.2 - h * 0.5], [w * 0.7, -0.14 - h], [0.001, -0.18 - h]], 8, 0, 0, z)); a('f', ly([[w * 1.02, -0.2], [w * 1.12, -0.2 - h * 0.5], [w * 1.04, -0.2 - h * 0.7]], 8, 0, 0, z)); }
});
// the standing signboard on stone feet (a board 0.4 × 1.6 between two posts, a little tiled hood)
unit('sboard', { w: 'timber', b: 'lacquer_black', f: 'gilt_bronze', r: 'tile_dark', s: 'granite_grey' }, (a) => {
  a('s', box(-0.3, 0, -0.2, 0.3, 0.16, 0.2)); a('s', box(-0.2, 0.16, -0.12, 0.2, 0.26, 0.12));
  for (const z of [-0.29, 0.29]) a('w', box(-0.04, 0.26, z - 0.04, 0.04, 2.0, z + 0.04));
  a('b', box(-0.025, 0.46, -0.27, 0.025, 1.94, 0.27)); a('w', box(-0.05, 0.4, -0.31, 0.05, 0.46, 0.31));
  for (const [y0, y1] of [[0.46, 0.5], [1.9, 1.94]]) a('f', box(-0.032, y0, -0.27, 0.032, y1, 0.27));
  a('r', prismX([[-0.4, 2.0], [0.4, 2.0], [0.28, 2.16], [-0.28, 2.16]], -0.14, 0.14));
});
// the trestle and the things on it ------------------------------------------------
unit('trestle', { t: 'lacquer_chestnut' }, (a) => {
  a('t', box(-0.65, 0.76, -0.3, 0.65, 0.81, 0.3));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) a('t', box(sx * 0.58 - 0.025, 0, sz * 0.24 - 0.025, sx * 0.58 + 0.025, 0.76, sz * 0.24 + 0.025));
  for (const sz of [-1, 1]) a('t', box(-0.58, 0.22, sz * 0.24 - 0.012, 0.58, 0.26, sz * 0.24 + 0.012));
});
unit('stacks', { c: 'cloth_white' }, (a) => {       // bolts and folded cloth (silk and hemp), three stacks
  const r = rng(11);
  for (const [x, n] of [[-0.4, 6], [0, 5], [0.4, 4]]) for (let k = 0; k < n; k++) a('c', box(x - 0.17 + (r() - 0.5) * 0.03, k * 0.052, -0.22 + (r() - 0.5) * 0.03, x + 0.17 + (r() - 0.5) * 0.03, k * 0.052 + 0.048, 0.22 + (r() - 0.5) * 0.03));
});
unit('bowls', { b: 'glaze_white' }, (a) => { for (const [x, z, n] of [[-0.4, -0.08, 3], [0.0, 0.1, 3], [0.4, -0.06, 3], [-0.2, 0.18, 1]]) for (let k = 0; k < n; k++) a('b', bowl(x, k * 0.052, z, 1)); });
unit('jars', { j: 'pottery_dark', c: 'cloth_red', l: 'wood_dark' }, (a) => {   // wine jars on the ground, mouths bound with red cloth
  for (const [x, z, r, h, cap] of [[-0.5, -0.1, 0.2, 0.58, 1], [-0.05, -0.15, 0.22, 0.64, 1], [0.42, -0.08, 0.19, 0.52, 1], [-0.28, 0.24, 0.16, 0.42, 0], [0.2, 0.22, 0.17, 0.46, 0]]) {
    a('j', jar(r, h, x, 0, z));
    if (cap) a('c', ly([[r * 0.62, h - 0.02], [r * 0.7, h + 0.03], [r * 0.66, h + 0.06], [r * 0.5, h + 0.1], [r * 0.3, h + 0.12], [0.001, h + 0.13]], 14, x, 0, z)); else a('l', drum(r * 0.6, r * 0.52, 0.05, 12, x, h, z));
  }
});
unit('baskets', { w: 'wicker', g: 'cloth_ochre' }, (a) => { for (const [x, z, r, h] of [[-0.42, 0, 0.3, 0.34], [0.12, 0.1, 0.26, 0.3], [0.5, -0.06, 0.22, 0.26]]) { a('w', ly([[0.001, 0], [r * 0.7, 0], [r, h], [r * 0.95, h], [r * 0.66, 0.03], [0.001, 0.03]], 12, x, 0, z)); a('g', ly([[r * 0.9, h - 0.04], [r * 0.6, h + 0.05], [r * 0.25, h + 0.1], [0.001, h + 0.12]], 10, x, 0, z)); } });
unit('sacks', { s: 'sacking' }, (a) => {
  const sk = (x, y, z) => { const g = ly([[0.001, 0], [0.22, 0], [0.28, 0.14], [0.25, 0.42], [0.12, 0.56], [0.001, 0.58]], 10); g.scale(1, 1, 0.8); return mv(g, x, y, z); };
  for (const x of [-0.5, 0, 0.5]) a('s', sk(x, 0, 0)); for (const x of [-0.25, 0.25]) a('s', sk(x, 0.4, 0.02));
});
unit('bin', { w: 'timber', r: 'plaster', m: 'wood_dark' }, (a) => { a('w', box(-0.5, 0, -0.3, 0.5, 0.62, 0.3)); a('r', drum(0.46, 0.2, 0.2, 10, 0, 0.62, 0).scale(1, 1, 0.6)); a('w', box(-0.52, 0.55, -0.32, 0.52, 0.6, 0.32)); a('m', box(0.1, 0.8, -0.1, 0.3, 0.98, 0.1)); });
unit('mortar', { i: 'iron', w: 'timber', g: 'granite_grey', c: 'cloth_white', j: 'pottery_dark' }, (a) => {   // the physician's iron roller in its trough (yanchuan), packets and jars
  a('w', box(-0.5, 0, -0.16, 0.5, 0.3, 0.16)); a('i', prismX([[-0.14, 0.3], [0.14, 0.3], [0.2, 0.42], [0.14, 0.5], [-0.14, 0.5], [-0.2, 0.42]], -0.46, 0.46));
  a('i', ly([[0.001, -0.18], [0.14, -0.18], [0.14, 0.18], [0.001, 0.18]], 12).rotateZ(Math.PI / 2).translate(0, 0.64, 0)); a('w', rod([-0.9, 0.64, 0], [0.9, 0.64, 0], 0.02, 5)); a('g', drum(0.14, 0.1, 0.2, 8, 0.7, 0, 0.25));
  for (let k = 0; k < 3; k++) a('c', box(-0.7 + k * 0.1, 0, 0.3, -0.62 + k * 0.1, 0.1 + k * 0.02, 0.4)); a('j', jar(0.1, 0.26, -0.3, 0, 0.35));
});
unit('woks', { i: 'iron', w: 'timber', b: 'bronze' }, (a) => {   // pans, an anvil on its block, tongs
  for (const [x, z, r, y] of [[-0.55, 0.06, 0.3, 0], [-0.55, 0.06, 0.27, 0.1], [-0.05, -0.06, 0.28, 0], [-0.05, -0.06, 0.25, 0.09]]) a('i', ly([[0.001, 0], [0.06, 0], [r * 0.6, 0.06], [r, 0.18], [r * 0.95, 0.19], [r * 0.5, 0.1], [0.001, 0.07]], 12, x, y, z));
  a('w', drum(0.2, 0.22, 0.4, 8, 0.55, 0, 0)); a('i', box(0.4, 0.4, -0.1, 0.7, 0.5, 0.1)); a('i', box(0.46, 0.5, -0.06, 0.64, 0.58, 0.06)); a('i', rod([0.15, 0, 0.3], [0.15, 0.7, 0.35], 0.012, 4)); a('i', rod([0.25, 0, 0.3], [0.25, 0.7, 0.35], 0.012, 4));
});
unit('steamers', { b: 'brick_grey', i: 'iron', w: 'wicker', l: 'bamboo_culm', k: 'bronze', c: 'glaze_white', d: 'paint_white' }, (a) => {   // the cake-seller's stove with stacked steamers (steamed cakes: the scroll's food stalls), a kettle, bowls
  a('b', box(-0.4, 0, -0.3, 0.4, 0.62, 0.3)); a('i', drum(0.3, 0.32, 0.12, 12, 0, 0.62, -0.02));
  for (let k = 0; k < 4; k++) a('w', drum(0.29, 0.29, 0.1, 10, 0, 0.74 + k * 0.1, -0.02)); a('l', ly([[0.001, 1.14], [0.31, 1.14], [0.28, 1.18], [0.001, 1.24]], 12, 0, 0, -0.02));
  a('k', ly([[0.001, 0], [0.12, 0], [0.14, 0.1], [0.08, 0.2], [0.001, 0.22]], 9, 0.62, 0, -0.04)); for (const [x, z] of [[-0.62, 0], [-0.62, 0.17], [-0.62, -0.17]]) a('c', bowl(x, 0, z, 1.1));
  for (let k = 0; k < 5; k++) a('d', ly([[0.001, 0], [0.05, 0.005], [0.04, 0.04], [0.001, 0.05]], 8, -0.62 + (k % 2) * 0.12, 0.42, -0.25 + k * 0.1));
});
unit('teajars', { j: 'glaze_white', l: 'wood_dark', s: 'bamboo_culm', c: 'bark_dark' }, (a) => {   // tea in lidded jars, cakes of tea (Song tea was pressed into cakes and ground), a scoop
  for (const [x, z, r, h] of [[-0.45, 0, 0.12, 0.3], [-0.2, 0.06, 0.1, 0.24], [0.04, -0.02, 0.12, 0.32]]) { a('j', jar(r, h, x, 0, z)); a('l', drum(r * 0.6, r * 0.5, 0.05, 12, x, h, z)); }
  for (let k = 0; k < 4; k++) a('c', ly([[0.001, 0], [0.09, 0], [0.09, 0.025], [0.001, 0.025]], 10, 0.3 + (k % 2) * 0.05, k * 0.026, 0.0));
  a('s', rod([0.5, 0, 0.22], [0.5, 0, 0.34], 0.02, 5));
});
unit('lacquer', { r: 'lacquer_red', k: 'lacquer_black', g: 'gilt_bronze' }, (a) => {   // lacquerware: nested boxes, trays, bowls
  for (const [x, z, w, h] of [[-0.4, 0, 0.36, 0.2], [0.05, 0.05, 0.3, 0.26], [0.45, -0.04, 0.24, 0.18]]) { a('r', box(x - w / 2, 0, z - w / 2, x + w / 2, h, z + w / 2)); a('k', box(x - w / 2 - 0.01, h, z - w / 2 - 0.01, x + w / 2 + 0.01, h + 0.04, z + w / 2 + 0.01)); }
  for (const [x, z, n] of [[-0.18, 0.2, 2], [0.28, 0.22, 2]]) for (let k = 0; k < n; k++) a('k', bowl(x, k * 0.05, z, 1.15));
});
unit('scrolls', { w: 'bamboo_culm', p: 'paint_white', t: 'timber', c: 'cloth_indigo' }, (a) => {   // volumes (stitched books, thread-bound) and rolls, a stand
  a('t', box(-0.4, 0, -0.18, 0.4, 0.06, 0.18)); a('t', box(-0.4, 0.5, -0.18, 0.4, 0.54, 0.18));
  for (let k = 0; k < 8; k++) { const x = -0.45 + k * 0.12; a('p', drum(0.034, 0.034, 0.46, 8, x, 0.06, (k % 2) * 0.05 - 0.02)); a('w', drum(0.012, 0.012, 0.5, 6, x, 0.06, (k % 2) * 0.05 - 0.02)); }
  for (let k = 0; k < 4; k++) a('c', box(-0.3 + k * 0.1, 0.54, -0.1, -0.22 + k * 0.1, 0.54 + 0.2, 0.1));
});
unit('saddles', { l: 'hide_brown', t: 'timber', i: 'iron', b: 'hide_black' }, (a) => {   // saddles on a rack, a bridle, stirrups (the scroll's saddle shop)
  a('t', box(-0.5, 0, -0.2, 0.5, 0.06, 0.2)); for (const x of [-0.5, 0.5]) a('t', box(x - 0.03, 0, -0.04, x + 0.03, 1.0, 0.04)); a('t', box(-0.5, 0.94, -0.04, 0.5, 1.0, 0.04));
  for (const x of [-0.25, 0.25]) { a('l', prismX([[-0.3, 1.0], [0, 1.1], [0.3, 1.0], [0.3, 0.94], [0, 1.0], [-0.3, 0.94]], x - 0.15, x + 0.15)); a('l', box(x - 0.15, 0.94, -0.3, x + 0.15, 1.1, -0.26)); a('l', box(x - 0.15, 0.94, 0.26, x + 0.15, 1.08, 0.3)); a('b', rod([x + 0.1, 0.94, 0], [x + 0.1, 0.5, 0], 0.01, 4)); a('i', box(x + 0.03, 0.42, -0.06, x + 0.17, 0.5, 0.06)); }
  a('b', rod([0.02, 1.0, 0], [0.02, 0.4, 0.02], 0.008, 4));
});
unit('porkblock', { b: 'timber', m: 'cloth_red', f: 'cloth_white', i: 'iron', r: 'timber' }, (a) => {   // the butcher's block with a cleaver, joints on it, hooks on a rail overhead
  a('b', drum(0.3, 0.32, 0.6, 10, 0, 0, 0)); a('i', box(-0.05, 0.62, -0.12, 0.08, 0.7, 0.12)); a('r', rod([0.08, 0.66, 0], [0.22, 0.66, 0], 0.012, 4));
  a('m', box(-0.22, 0.6, -0.14, 0.04, 0.68, 0.14)); a('f', box(-0.22, 0.6, 0.12, 0.04, 0.68, 0.14));
  for (const x of [-0.45, 0.45]) a('r', box(x - 0.03, 0, -0.03, x + 0.03, 2.1, 0.03)); a('r', box(-0.5, 2.06, -0.03, 0.5, 2.12, 0.03));
  for (const [x, h, w] of [[-0.3, 0.6, 0.11], [-0.1, 0.5, 0.1], [0.12, 0.65, 0.12], [0.32, 0.45, 0.1]]) { a('i', rod([x, 2.06, 0], [x, 1.94, 0], 0.01, 4)); a('m', ly([[0.001, 1.94], [w, 1.88], [w * 1.1, 1.88 - h * 0.5], [w * 0.7, 1.94 - h], [0.001, 1.9 - h]], 8, x, 0, 0)); }
});
unit('incenseblock', { t: 'timber', s: 'cloth_ochre', r: 'cloth_red', p: 'paint_white', y: 'cloth_ochre' }, (a) => {   // the incense shop's table: bundles of sticks standing in a rack, stacks of joss paper, a tray of cones
  a('t', box(-0.5, 0, -0.18, 0.5, 0.06, 0.18)); a('t', box(-0.5, 0.5, -0.18, 0.5, 0.54, 0.18)); for (const x of [-0.5, 0.5]) a('t', box(x - 0.025, 0, -0.18, x + 0.025, 0.5, 0.18));
  for (let k = 0; k < 4; k++) a('s', box(-0.4 + k * 0.11, 0.54, -0.04, -0.34 + k * 0.11, 1.0, 0.04)); for (let k = 0; k < 3; k++) a('p', box(0.1, 0.54 + k * 0.06, -0.14, 0.4, 0.58 + k * 0.06, 0.14)); a('r', box(0.1, 0.54, -0.03, 0.4, 0.8, -0.0));
  for (let k = 0; k < 5; k++) a('y', ly([[0.001, 0], [0.04, 0], [0.001, 0.09]], 6, -0.35 + k * 0.1, 0.06, 0.1));
});
unit('tavernjars', { j: 'pottery_dark', c: 'cloth_red', t: 'timber', b: 'glaze_white', i: 'bronze' }, (a) => {   // the wine shop's counter: jars with red-bound mouths, a dipper, cups and a pewter pot
  a('t', box(-0.6, 0, -0.25, 0.6, 0.86, 0.25)); a('t', box(-0.64, 0.86, -0.29, 0.64, 0.9, 0.29));
  for (const [x, r, h] of [[-0.42, 0.15, 0.34], [-0.05, 0.17, 0.38], [0.36, 0.14, 0.32]]) { a('j', jar(r, h, x, 0.9, 0)); a('c', ly([[r * 0.62, h - 0.02], [r * 0.7, h + 0.03], [r * 0.3, h + 0.1], [0.001, h + 0.11]], 12, x, 0.9, 0)); }
  for (let k = 0; k < 4; k++) a('b', bowl(0.15 + k * 0.1, 0.9, -0.15, 0.6)); a('i', ly([[0.001, 0], [0.05, 0], [0.06, 0.12], [0.03, 0.16], [0.001, 0.17]], 8, -0.25, 0.9, -0.15));
});

// ── the shop: its parts, laid out by trade and by seed ──────────────────────────
const TRADE_CHAR = { wine: '酒', tea: '茶', rice: '米', medicine: '药', books: '书', iron: '金', food: '店', inn: '店', butcher: '肉' };
/** The sign each trade hangs from its pole. */
const BANNER = { wine: 'flag', tea: 'hlantern', inn: 'hlamp', food: 'flag', cloth: 'hbowl', medicine: 'gourd', rice: 'dou', lacquer: 'hbowl', books: 'hbook', pottery: 'hvase', iron: 'hpan', incense: 'hincense', saddlery: 'hsaddle', butcher: 'pork' };
/** What each trade shows: [unit, materials, top (on a trestle)]. */
const GOODS = {
  cloth: [['stacks', { c: 'cloth' }, true], ['stacks', { c: 'cloth' }, true]], tea: [['teajars', {}, true], ['baskets', { g: 'cloth_green' }, false]],
  rice: [['sacks', {}, false], ['bin', {}, false], ['baskets', { g: 'cloth_white' }, false]], medicine: [['mortar', {}, false], ['stacks', { c: 'cloth_white' }, true]],
  lacquer: [['lacquer', {}, true], ['lacquer', {}, true]], books: [['scrolls', {}, false], ['stacks', { c: 'book' }, true]],
  wine: [['jars', { j: 'pottery_dark', c: 'cloth_red' }, false], ['tavernjars', {}, false]], pottery: [['bowls', { b: 'glaze_blue' }, true], ['jars', { j: 'glaze_blue', c: 'cloth_white' }, false], ['bowls', { b: 'glaze_white' }, true]],
  iron: [['woks', {}, false]], food: [['steamers', {}, false], ['bowls', { b: 'glaze_white' }, true], ['baskets', { g: 'cloth_ochre' }, false]],
  inn: [['baskets', { g: 'cloth_ochre' }, false]], incense: [['incenseblock', {}, false]], saddlery: [['saddles', {}, false]], butcher: [['porkblock', {}, false]],
};
const CLOTHS = ['cloth_indigo', 'cloth_red', 'cloth_white', 'cloth_ochre', 'cloth_grey', 'cloth_brown', 'cloth_green', 'cloth_black'];
const WIDE = new Set(['umbrellas', 'mortar', 'woks', 'tavernjars', 'incenseblock', 'saddles', 'porkblock', 'bin', 'steamers']);

/** kaifeng_shop { at (the middle of its front on the lot's edge), y, rot (out into the street), L (the front's width), trade, seed, water }: the sign pole, the standing signboard and the goods. */
function kaifengShop(el, { bag, col }) {
  const rand = rng(el.seed || 1), pick = (a) => a[Math.floor(rand() * a.length)];
  const [cx, cz] = el.at, y0 = el.y ?? 0, rot = el.rot, L = el.L, trade = el.trade, c = Math.cos(rot), s = Math.sin(rot);
  const loc = (lx, lz) => [cx + lx * c + lz * s, cz - lx * s + lz * c];
  const put = (name, { mats = {}, x = 0, z = 0, y = 0, ry = 0, k = 1 } = {}) => {
    const P = placer({ t: el.t, at: loc(x, z), y: y0 + y, rot: rot + ry, s: k }, bag);
    for (const [role, g] of Object.entries(U[name])) { let m = mats[role] ?? DEF[name][role]; if (WINDY.has(`${name}.${role}`)) m = windMat(m); P(m, g.clone()); }
  };
  const tc = TRADE_CHAR[trade];
  const side = rand() < 0.5 ? -1 : 1, bn = BANNER[trade];
  // the pole with the trade's sign at one end of the front
  { const x = -side * (L / 2 - 0.25), zp = 0.25; put('pole', { x, z: zp });
    const hang = { x, z: zp, y: 4.28 };
    if (bn === 'flag') { const blue = rand() < 0.7; put('flag', { mats: { c: blue ? 'cloth_indigo' : 'cloth_white', e: blue ? 'cloth_white' : 'cloth_indigo' }, ...hang }); for (const ry of [Math.PI / 2, -Math.PI / 2]) put(`f${tc}`, { mats: { g: blue ? 'cloth_white' : 'cloth_indigo' }, x: x + Math.sin(ry) * 0.012, z: zp + 0.5, y: 4.28 - 0.62, ry, k: 0.5 }); }
    else if (bn) put(bn, bn === 'hbook' ? { mats: { c: pick(['cloth_white', 'cloth_indigo', 'cloth_brown']) }, ...hang } : hang);
    col?.circle(...loc(x, zp), 0.22, y0, y0 + 4.6); }
  // the standing signboard on stone feet at the other end (the physician's, the inn's, the tea house's, some wine shops'), by the front's end
  if ((trade === 'medicine' || trade === 'inn' || trade === 'tea' || trade === 'wine' || rand() < 0.1) && L > 4.2 && !el.water) { const x = side * (L / 2 - 0.5), zp = 0.7; put('sboard', { x, z: zp, ry: Math.PI / 2 }); col?.circle(...loc(x, zp), 0.4, y0, y0 + 2.1); }
  // the goods on the apron and on trestles, between the sign pole and the board
  if (!el.water) {
    const list = GOODS[trade] || GOODS.cloth, free0 = -L / 2 + 0.75, free1 = L / 2 - 0.75;
    let x = side > 0 ? free0 : free1; const dir = side > 0 ? 1 : -1; let first = true;
    for (const [name, m, top] of list) {
      const w = top ? 1.35 : WIDE.has(name) ? 1.4 : 1.2, xc = x + dir * w / 2;
      if (!first && (xc - w / 2 < free0 - 0.25 || xc + w / 2 > free1 + 0.25)) break;
      first = false;
      const mats = { ...m }; if (mats.c === 'cloth') mats.c = pick(CLOTHS); else if (mats.c === 'book') mats.c = pick(['cloth_white', 'cloth_indigo', 'cloth_brown']);
      const zc = 0.1 + rand() * 0.12, ry = (rand() - 0.5) * 0.25;
      if (top) { put('trestle', { x: xc, z: zc, ry }); put(name, { mats, x: xc, z: zc, y: 0.81, ry }); col?.circle(...loc(xc, zc), 0.5, y0, y0 + 0.85); }
      else { put(name, { mats, x: xc, z: zc, ry: WIDE.has(name) ? 0 : ry * 2 }); col?.circle(...loc(xc, zc), 0.45, y0, y0 + 0.8); }
      x += dir * (w + 0.12);
    }
  }
}
STYLES.life.elements.kaifeng_shop = kaifengShop;

const FR = { s: [0, 1, 0], n: [0, -1, Math.PI], e: [1, 0, Math.PI / 2], w: [-1, 0, -Math.PI / 2] };
/** The shop elements of layout.js's lots (style life), one per shop; the wine shops' and tea houses' fronts are as the others'. */
export function shopElements() {
  const out = [];
  for (const l of lots()) {
    const trade = tradeOf(l);
    if (!l.shop || !trade) continue;
    const [x0, z0, x1, z1] = l.rect, f = l.front, [, , rot] = FR[f], along = f === 'n' || f === 's';
    const at = f === 's' ? [(x0 + x1) / 2, z1] : f === 'n' ? [(x0 + x1) / 2, z0] : f === 'e' ? [x1, (z0 + z1) / 2] : [x0, (z0 + z1) / 2];
    const w = along ? x1 - x0 : z1 - z0;
    out.push({ t: 'kaifeng_shop', at, y: 0.04, rot, L: w, trade, seed: l.seed + 7 });
  }
  return out;
}
void wineShops; void teaHouses; void limb;
export { kaifengShop, U as __units };
