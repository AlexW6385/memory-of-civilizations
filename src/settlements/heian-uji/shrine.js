// The Ujigami shrine on the far bank (docs/settlements/heian-uji.md §17): at the foot of the hill beyond the Uji River, on a
// levelled terrace of gravel, a torii and a stone path, a fence of planks round the court, and the honden — an outer hall
// of five bays under one long roof of cypress bark whose front slope sweeps down over a veranda (nagare-zukuri), and in it,
// side by side, three small inner shrines (naiden), each with its own gabled roof and its red door. Built on the 1052–1060
// timber of the real honden (the oldest standing shrine building in Japan); the forms and sizes are ours [inferred].
// The shrine faces west, to the river. World coordinates, +x east, +z south.
import '../../styles/japanese/index.js';
import { STYLES } from '../../core/build.js';
import { box, lathe, fromTriangles, rod } from '../../core/geom.js';
import { hexa } from '../../styles/chinese/index.js';
import { SHRINE, RADIUS } from './layout.js';

const Z = SHRINE.axis, Y0 = SHRINE.level, FL = Y0 + 0.9;               // the court's level, the honden's floor
const X = { posts: 214.4, wall: 219.5, eaveF: 212.2, ridge: 217.0, eaveB: 221.0 };
const Y = { eaveF: FL + 2.3, ridge: FL + 4.3, eaveB: FL + 2.4 };
const roofTop = (x) => (x <= X.ridge ? Y.eaveF + (x - X.eaveF) * (Y.ridge - Y.eaveF) / (X.ridge - X.eaveF) : Y.ridge - (x - X.ridge) * (Y.ridge - Y.eaveB) / (X.eaveB - X.ridge));
const TH = 0.16, HZ = 4.5;                                              // the roof's thickness; the hall's half width (five bays of 1.8 m)

function honden(el, { bag, col }) {
  const post = (x, z, h, m = 'timber') => { bag.add('limestone', box(x - 0.2, Y0 - 0.3, z - 0.2, x + 0.2, FL - 0.7, z + 0.2)); bag.add(m, lathe([[0.14, 0], [0.14, h]], 10, null, x, FL - 0.7, z)); col.circle(x, z, 0.17, Y0, FL + h - 0.7); };
  // the floor: a raised deck of planks on posts, the veranda in front
  bag.add('timber', box(X.posts - 0.3, FL - 0.14, Z - HZ - 0.3, X.wall + 0.1, FL, Z + HZ + 0.3));
  col.floor([X.posts - 0.3, Z - HZ - 0.3, X.wall + 0.1, Z + HZ + 0.3], FL);
  bag.add('wood_dark', box(X.posts - 0.36, FL - 0.34, Z - HZ - 0.36, X.posts - 0.3, FL - 0.14, Z + HZ + 0.36));
  const top = FL + 2.55;
  for (let i = 0; i <= 5; i++) { const z = Z - HZ + i * 1.8; post(X.posts, z, top - FL + 0.7, 'lacquer_red'); post(X.wall, z, top - FL + 0.7 + 0.25); }
  for (const x of [X.posts + 1.0, X.posts + 2.2]) for (const z of [Z - HZ, Z + HZ]) post(x, z, top - FL + 0.7);
  // beams along the head of the posts, the brackets up to the roof, the tie beams back to the wall
  bag.add('lacquer_red', box(X.posts - 0.14, top, Z - HZ - 0.2, X.posts + 0.14, top + 0.28, Z + HZ + 0.2));
  bag.add('lacquer_red', box(X.wall - 0.14, top, Z - HZ - 0.2, X.wall + 0.14, top + 0.28, Z + HZ + 0.2));
  for (let i = 0; i <= 5; i++) { const z = Z - HZ + i * 1.8; bag.add('wood_dark', box(X.posts - 0.1, top + 0.28, z - 0.1, X.posts + 0.1, roofTop(X.posts) - TH, z + 0.1)); bag.add('lacquer_red', box(X.posts, top, z - 0.07, X.wall, top + 0.2, z + 0.07)); }
  // the roof: a long front slope over the veranda, a short back one; bark of cypress; the ridge; the verges
  const T = (x0, x1) => { const out = [], p = (x, z, d) => [x, roofTop(x) - d, z]; for (const [za, zb] of [[Z - HZ - 0.5, Z + HZ + 0.5]]) hexa(out, [p(x0, za, TH), p(x0, zb, TH), p(x1, zb, TH), p(x1, za, TH)], [p(x0, za, 0), p(x0, zb, 0), p(x1, zb, 0), p(x1, za, 0)]); return fromTriangles(out); };
  bag.add('roof_bark', T(X.eaveF, X.ridge)); bag.add('roof_bark', T(X.ridge, X.eaveB));
  bag.add('roof_ridge', box(X.ridge - 0.2, Y.ridge - 0.02, Z - HZ - 0.55, X.ridge + 0.2, Y.ridge + 0.2, Z + HZ + 0.55));
  for (const [x0, x1] of [[X.eaveF, X.ridge], [X.ridge, X.eaveB]]) for (const sz of [-1, 1]) bag.add('wood_dark', rod([x0, roofTop(x0) - TH * 0.5, Z + sz * (HZ + 0.5)], [x1, roofTop(x1) - TH * 0.5, Z + sz * (HZ + 0.5)], 0.07, 5));
  // the walls under the roof: the back wall of planks, the sides closed up to the roof's underside
  bag.add('timber', box(X.wall - 0.08, FL, Z - HZ, X.wall + 0.08, top + 0.0, Z + HZ)); col.rect([X.wall - 0.08, Z - HZ, X.wall + 0.08, Z + HZ], FL, FL + 3);
  const ub = (x) => roofTop(x) - TH - 0.02;
  for (const sz of [-1, 1]) {
    const z = Z + sz * HZ, A = [X.posts, FL, z], B = [X.wall, FL, z], C = [X.wall, ub(X.wall), z], D = [X.ridge, ub(X.ridge), z], E = [X.posts, ub(X.posts), z];
    bag.add('timber', fromTriangles([...A, ...B, ...C, ...A, ...C, ...D, ...A, ...D, ...E, ...A, ...C, ...B, ...A, ...D, ...C, ...A, ...E, ...D]));
    col.segment([X.posts, z], [X.wall, z], 0.1, FL, FL + 3);
  }
  // the back wall above the beam, closed to the back slope
  { const out = []; for (let z = 0; z < 1; z++) out.push(...[X.wall, top + 0.28, Z - HZ, X.wall, top + 0.28, Z + HZ, X.wall, ub(X.wall), Z + HZ, X.wall, top + 0.28, Z - HZ, X.wall, ub(X.wall), Z + HZ, X.wall, ub(X.wall), Z - HZ]); bag.add('timber', fromTriangles(out)); }
  // the three inner shrines (naiden): a box on a low base, a door with a lintel, a gabled roof of bark, a little stair
  for (let k = -1; k <= 1; k++) {
    const zc = Z + k * 2.7, x0 = X.posts + 2.5, x1 = X.wall - 0.25, w = 1.1;
    bag.add('lacquer_red', box(x0, FL, zc - w, x1, FL + 0.18, zc + w));
    bag.add('timber', box(x0 + 0.1, FL + 0.18, zc - w + 0.1, x1 - 0.1, FL + 1.9, zc + w - 0.1));
    bag.add('lacquer_red', box(x0 + 0.03, FL + 0.3, zc - 0.55, x0 + 0.1, FL + 1.7, zc + 0.55));
    for (const s of [-1, 1]) bag.add('gilt_bronze', box(x0 + 0.02, FL + 0.9, zc + s * 0.28 - 0.04, x0 + 0.04, FL + 1.04, zc + s * 0.28 + 0.04));
    bag.add('wood_dark', box(x0 + 0.0, FL + 1.7, zc - 0.65, x0 + 0.12, FL + 1.82, zc + 0.65));
    // the little roof: a gable along x
    const ya = FL + 1.9, yr = ya + 0.75, a0 = x0 - 0.35, a1 = x1 + 0.1, out = [];
    for (const s of [-1, 1]) hexa(out, [[a0, ya - 0.07, zc + s * (w + 0.22)], [a1, ya - 0.07, zc + s * (w + 0.22)], [a1, yr - 0.07, zc], [a0, yr - 0.07, zc]], [[a0, ya, zc + s * (w + 0.22)], [a1, ya, zc + s * (w + 0.22)], [a1, yr, zc], [a0, yr, zc]]);
    bag.add('roof_bark', fromTriangles(out));
    bag.add('roof_ridge', box(a0, yr - 0.02, zc - 0.1, a1, yr + 0.1, zc + 0.1));
    for (let i = 1; i <= 3; i++) bag.add('timber', box(x0 - 0.2 * i, FL, zc - 0.5, x0, FL + 0.18 - i * 0.045, zc + 0.5));
  }
  // the veranda's rails: red-lacquer, open at the stair
  for (const [a, b] of [[Z - HZ - 0.3, Z - 1.3], [Z + 1.3, Z + HZ + 0.3]]) { bag.add('lacquer_red', box(X.posts - 0.05, FL + 0.84, a, X.posts + 0.05, FL + 0.92, b)); bag.add('lacquer_red', box(X.posts - 0.035, FL + 0.4, a, X.posts + 0.035, FL + 0.46, b)); col.segment([X.posts, a], [X.posts, b], 0.1, FL, FL + 0.95); }
  for (const sz of [-1, 1]) { const z = Z + sz * (HZ + 0.25); bag.add('lacquer_red', box(X.posts, FL + 0.84, z - 0.05, X.posts + 2.5, FL + 0.92, z + 0.05)); col.segment([X.posts, z], [X.posts + 2.5, z], 0.1, FL, FL + 0.95); }
  // the stair: five steps of stone down to the court in the middle bays
  const n = 5, sh = (FL - Y0) / n;
  for (let k = 1; k <= n; k++) bag.add('limestone', box(X.posts - 0.3 - k * 0.32, Y0 - 0.2, Z - 1.2, X.posts - 0.3 - (k - 1) * 0.32, FL - k * sh + sh, Z + 1.2));
  col.ramp([X.posts - 0.3 - n * 0.32, Z - 1.2, X.posts - 0.3, Z + 1.2], Y0, FL - 0.02, 'e');
}

/** The torii: two round posts, the lower tie (nuki), the lintel (kasagi) with its lower board (shimaki). */
function torii(el, { bag, col }) {
  const [x, z] = el.at, y = el.y, w = 1.7, h = 3.6;
  for (const s of [-1, 1]) { bag.add('limestone', box(x - 0.3, y - 0.3, z + s * w - 0.3, x + 0.3, y + 0.2, z + s * w + 0.3)); bag.add('lacquer_red', lathe([[0.19, 0], [0.17, h]], 12, null, x, y + 0.2, z + s * w)); col.circle(x, z + s * w, 0.2, y, y + h); }
  bag.add('lacquer_red', box(x - 0.1, y + h - 0.7, z - w - 0.25, x + 0.1, y + h - 0.55, z + w + 0.25));
  bag.add('lacquer_black', box(x - 0.2, y + h + 0.05, z - w - 0.7, x + 0.2, y + h + 0.3, z + w + 0.7));
  bag.add('lacquer_red', box(x - 0.15, y + h - 0.12, z - w - 0.5, x + 0.15, y + h + 0.05, z + w + 0.5));
}

/** A fence of planks (tamagaki) { a, b, h }: posts every 2 m, upright boards, a rail on top. */
function tamagaki(el, { bag, col }) {
  const [ax, az] = el.a, [bx, bz] = el.b, h = el.h ?? 1.5, L = Math.hypot(bx - ax, bz - az), n = Math.max(1, Math.round(L / 2));
  bag.add('timber', box(Math.min(ax, bx) - 0.03, el.y, Math.min(az, bz) - 0.03, Math.max(ax, bx) + 0.03, el.y + h - 0.1, Math.max(az, bz) + 0.03));
  for (let i = 0; i <= n; i++) { const x = ax + (bx - ax) * i / n, z = az + (bz - az) * i / n; bag.add('wood_dark', box(x - 0.08, el.y, z - 0.08, x + 0.08, el.y + h + 0.1, z + 0.08)); }
  bag.add('wood_dark', box(Math.min(ax, bx) - 0.07, el.y + h - 0.1, Math.min(az, bz) - 0.07, Math.max(ax, bx) + 0.07, el.y + h + 0.02, Math.max(az, bz) + 0.07));
  col.segment([ax, az], [bx, bz], 0.14, el.y, el.y + h);
}
STYLES.japanese.elements.ujigami_honden = honden;
STYLES.japanese.elements.ujigami_torii = torii;
STYLES.japanese.elements.ujigami_fence = tamagaki;

const base = (id, style, elements, extra = {}) => ({ id, style, origin: [0, 0], base: 0, yaw: 0, feature: true, rooms: [], elements, bounds: [SHRINE.terrace[0] - 12, SHRINE.terrace[1] - 12, SHRINE.terrace[2] + 12, SHRINE.terrace[3] + 12], entrance: { at: [196, Z], facing: 'e' }, ...extra });
const FX = [206, 232], FZ = [Z - 14, Z + 14];
export const shrine = base('heian-uji-ujigami', 'japanese', [
  { t: 'ujigami_honden' },
  { t: 'ujigami_torii', at: [197.5, Z], y: SHRINE.level - 0.1 },
  { t: 'floor', rect: [199, Z - 1.1, 206, Z + 1.1], y: SHRINE.level + 0.02, mat: 'limestone', th: 0.2 },
  { t: 'floor', rect: [206, Z - 1.1, 211.5, Z + 1.1], y: SHRINE.level + 0.02, mat: 'limestone', th: 0.2 },
  { t: 'ujigami_fence', a: [FX[0], FZ[0]], b: [FX[0], Z - 2.2], y: SHRINE.level, h: 1.4 }, { t: 'ujigami_fence', a: [FX[0], Z + 2.2], b: [FX[0], FZ[1]], y: SHRINE.level, h: 1.4 },
  { t: 'ujigami_fence', a: [FX[0], FZ[0]], b: [FX[1], FZ[0]], y: SHRINE.level, h: 1.4 }, { t: 'ujigami_fence', a: [FX[0], FZ[1]], b: [FX[1], FZ[1]], y: SHRINE.level, h: 1.4 },
  { t: 'ujigami_fence', a: [FX[1], FZ[0]], b: [FX[1], FZ[1]], y: SHRINE.level, h: 1.4 },
  { t: 'obj', kind: 'lantern', at: [209.5, Z - 2.6], y: SHRINE.level }, { t: 'obj', kind: 'lantern', at: [209.5, Z + 2.6], y: SHRINE.level },
]);
export const shrineFolk = base('heian-uji-ujigami-folk', 'life', [
  { t: 'figure', at: [208.5, Z + 4.5], y: SHRINE.level, rot: 1.2, seed: 6101, dress: 'robe', cloth: 'cloth_white', cloth2: 'cloth_white', hat: 'cap', hatMat: 'lacquer_black', skin: 'skin_medium', carry: 'none', pose: 'stand' },
  { t: 'figure', at: [203.5, Z - 0.6], y: SHRINE.level, rot: Math.PI / 2, seed: 6102, dress: 'robe', cloth: 'cloth_red', cloth2: 'cloth_white', hair: 'long', hat: 'none', skin: 'skin_light', carry: 'none', pose: 'stand', arms: 'pray' },
], { bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS] });
