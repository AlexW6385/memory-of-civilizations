// The hamlet of the Hakka valley (docs/settlements/hakka-tulou.md §4.4): the ordinary two-storey house of rammed earth on a granite
// foot with a deep front eave on posts, whose ground floor can be walked (a hall in front, the ancestors' altar on the back wall
// of its middle bay, a kitchen and a second room behind the partitions, a back door to the garden); the earth-god shrine by the road;
// the bamboo noria turning in the stream; granite washing steps; the kitchen gardens behind the rows.
// All houses are built in a frame turned by a quarter turn (yaw), so that their colliders are axis-aligned.
import { STYLES } from '../../core/build.js';
import '../../objects/index.js';
import { box, lathe, rod, fromTriangles } from '../../core/geom.js';
import { Matrix4 } from '../../core/three.js';
import { lbox, frameOf } from './geo.js';
import { zslab } from './hall.js';
import { fillRoom } from './rooms.js';

const EARTH = 'mud_plaster', TIMBER = 'timber', TILE = 'tile_grey';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/** hakka_house: { c, yaw (quarter turn; +z of the house faces the street), w, d, seed } */
export function hakkaHouse(el, ctx) {
  const { bag, col } = ctx, LF = STYLES.life.elements, [cx, cz] = el.c, phi = el.yaw ?? 0, w = el.w ?? 7.8, d = el.d ?? 8.6, rand = rng((el.seed ?? 1) * 97 + 13);
  const hx = w / 2, hz = d / 2, t = 0.42, H = 4.5, topF = H + 0.4, topB = H + 0.2, CE = 3.15;
  const W = frameOf(cx, cz, phi);
  const wr = (x0, z0, x1, z1) => { const a = W(x0, z0), b = W(x1, z1); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; };
  const B = (m, x0, y0, z0, x1, y1, z1) => bag.add(m, lbox(cx, cz, phi, x0, y0, z0, x1, y1, z1));
  const S = (m, x0, y0, z0, x1, y1, z1) => { B(m, x0, y0, z0, x1, y1, z1); col.rect(wr(x0, z0, x1, z1), y0, y1); };
  const obj = (type, x, z, o = {}) => { LF[type]({ t: type, at: W(x, z), y: 0, rot: phi, ...o }, ctx); };
  const sd = el.seed ?? 1;

  // the foot, the floors
  B('granite_block', -hx - 0.04, 0, -hz - 0.04, hx + 0.04, 0.12, hz);
  B('flagstone', -hx + t, 0, 0.2, hx - t, 0.03, hz - t); B('ground', -hx + t, 0, -hz + t, hx - t, 0.025, 0.2);
  // the front wall: window cells, the door, the hay-loft shutter above it
  const win = [[-2.8, -1.9], [1.9, 2.8]], dw = 0.85, fz0 = hz - t;
  S(EARTH, -hx, 0, fz0, -2.8, topF, hz); S(EARTH, 2.8, 0, fz0, hx, topF, hz); S(EARTH, -1.9, 0, fz0, -dw, topF, hz); S(EARTH, dw, 0, fz0, 1.9, topF, hz);
  for (const [a, b] of win) {
    S(EARTH, a, 0, fz0, b, 1.15, hz); S(EARTH, a, 2.0, fz0, b, topF, hz);
    B('lattice', a + 0.04, 1.15, hz - 0.26, b - 0.04, 2.0, hz - 0.2); B(TIMBER, a - 0.02, 1.1, hz - 0.3, b + 0.02, 1.15, hz + 0.06); B(TIMBER, a - 0.02, 2.0, hz - 0.3, b + 0.02, 2.06, hz + 0.04);
    col.rect(wr(a, fz0, b, hz), 1.15, 2.0);
  }
  S(EARTH, -dw, 2.4, fz0, dw, 3.6, hz); S(EARTH, -dw, 3.6, fz0, -0.4, 4.2, hz); S(EARTH, 0.4, 3.6, fz0, dw, 4.2, hz); S(EARTH, -dw, 4.2, fz0, dw, topF, hz);
  B('lattice', -0.4, 3.6, hz - 0.26, 0.4, 4.2, hz - 0.2); B(TIMBER, -0.44, 3.55, hz - 0.3, 0.44, 3.6, hz + 0.05); B('wood_dark', -0.4, 3.6, hz + 0.0, -0.05, 4.2, hz + 0.04);
  B('granite_block', -hx - 0.04, 0, fz0, -dw - 0.1, 0.7, hz + 0.04); B('granite_block', dw + 0.1, 0, fz0, hx + 0.04, 0.7, hz + 0.04);
  // the door: red-brown jambs and lintel, the leaves standing open against the hall's wall, a threshold stone, the name board and the couplets
  for (const s of [-1, 1]) {
    B('timber_red', s > 0 ? dw : -dw - 0.1, 0, fz0, s > 0 ? dw + 0.1 : -dw, 2.4, hz + 0.02);
    B('wood_dark', s > 0 ? dw - 0.07 : -dw + 0.0, 0, fz0 - 0.85, s > 0 ? dw : -dw + 0.07, 2.3, fz0 - 0.05);
    B('iron', s > 0 ? dw - 0.09 : -dw - 0.02, 0.5, fz0 - 0.8, s > 0 ? dw + 0.02 : -dw + 0.09, 0.58, fz0 - 0.1); B('iron', s > 0 ? dw - 0.09 : -dw - 0.02, 1.7, fz0 - 0.8, s > 0 ? dw + 0.02 : -dw + 0.09, 1.78, fz0 - 0.1);
    B('lacquer_red', s * 1.0 - 0.08, 0.9, hz, s * 1.0 + 0.08, 2.3, hz + 0.035);
    B('lacquer_red', s * 2.3 - 0.07, 2.4, hz, s * 2.3 + 0.07, 3.6, hz + 0.03);
  }
  B('timber_red', -dw - 0.1, 2.4, fz0, dw + 0.1, 2.5, hz + 0.04); B('granite_block', -dw - 0.05, 0, hz - 0.5, dw + 0.05, 0.1, hz + 0.1);
  B('lacquer_black', -0.7, 2.6, hz, 0.7, 3.1, hz + 0.045); B('gilt_bronze', -0.5, 2.75, hz + 0.045, 0.5, 2.95, hz + 0.065);
  // side walls and the back wall (a back door to the garden)
  S(EARTH, -hx, 0, -hz, -hx + t, H, hz); S(EARTH, hx - t, 0, -hz, hx, H, hz);
  S(EARTH, -hx + t, 0, -hz, hx - t, topB, -hz + t);
  B('granite_block', -hx, 0, -hz - 0.04, hx, 0.7, -hz); B('granite_block', -hx - 0.04, 0, -hz - 0.04, -hx, 0.7, hz); B('granite_block', hx, 0, -hz - 0.04, hx + 0.04, 0.7, hz);
  // the gables: plaster between the wall tops and the roof, on both sides
  for (const s of [-1, 1]) {
    const tri = [];
    const L = (z, y) => { const a = W(s * (hx - t / 2), z); return [a[0], y, a[1]]; };
    const p = [L(-hz, H), L(hz, H), L(hz, topF), L(0, H + 1.85), L(-hz, topB)];
    for (const [a, b, c] of [[0, 1, 2], [0, 2, 3], [0, 3, 4]]) tri.push(...p[a], ...p[b], ...p[c], ...p[b], ...p[a], ...p[c]);
    bag.add('lime_plaster_rough', fromTriangles(tri));
  }
  // the roof: two slopes from the ridge, the front one carried out over the porch on two posts and a beam; ridge cap
  const ye = H + 0.1, yr = H + 2.0, zf = hz + 1.3, zb = -hz - 0.7, rt = (g) => { g.applyMatrix4(new Matrix4().makeRotationY(phi).setPosition(cx, 0, cz)); return g; };
  bag.add(TILE, rt(zslab(-hx - 0.04, hx + 0.04, zf, ye, 0, yr, 0.12))); bag.add(TILE, rt(zslab(-hx - 0.04, hx + 0.04, zb, ye, 0, yr, 0.12)));
  bag.add(TIMBER, rt(zslab(-hx - 0.04, hx + 0.04, zf, ye - 0.12, 0, yr - 0.12, 0.05))); bag.add(TIMBER, rt(zslab(-hx - 0.04, hx + 0.04, zb, ye - 0.12, 0, yr - 0.12, 0.05)));
  B('tile_dark', -hx - 0.1, yr - 0.05, -0.28, hx + 0.1, yr + 0.22, 0.28);
  // the courses of the tiles: darker bands now and then (replaced tiles), one lighter patch of moss-grey
  for (let k = 0; k < 3; k++) { const x0 = -hx + rand() * (w - 1.8), zz = 0.6 + rand() * 3.6, yy = yr - (yr - ye) * zz / zf; B('tile_dark', x0, yy + 0.01, zz, x0 + 1.2, yy + 0.04, zz + 0.5); }
  for (let k = 0; k < 3; k++) { const x0 = -hx + rand() * (w - 1.8), zz = 0.6 + rand() * 3.0, yy = yr - (yr - ye) * zz / -zb; B('plaster_damp', x0, yy + 0.01, -zz - 0.5, x0 + 1.0, yy + 0.04, -zz); }
  for (const x of [-hx + 0.4, hx - 0.4]) {
    B('timber_red', x - 0.09, 0.1, hz + 1.0, x + 0.09, H + 0.04, hz + 1.2); col.circle(W(x, hz + 1.1)[0], W(x, hz + 1.1)[1], 0.16, 0, H);
    B('granite_block', x - 0.18, 0.1, hz + 0.92, x + 0.18, 0.3, hz + 1.28);
  }
  B('timber_red', -hx, H - 0.28, hz + 1.0, hx, H - 0.06, hz + 1.2);
  for (const x of [-hx + 0.4, hx - 0.4]) B('timber', x - 0.06, H - 0.5, hz + 0.0, x + 0.06, H - 0.28, hz + 1.1);          // the brackets
  // inside: the partitions of the back rooms, their ceilings, the altar bay
  const pz = 0.2, roomX = [[-hx + t, -1.2], [1.2, hx - t]];
  for (const [a, b] of roomX) {
    const dc = (a + b) / 2;
    S(TIMBER, a, 0, pz - 0.05, dc - 0.62, CE, pz + 0.05); S(TIMBER, dc + 0.62, 0, pz - 0.05, b, CE, pz + 0.05); B(TIMBER, dc - 0.62, 2.1, pz - 0.05, dc + 0.62, CE, pz + 0.05);
    B(TIMBER, a, CE - 0.1, -hz + t, b, CE, pz + 0.05);
    for (const x of [dc - 0.62, dc + 0.62]) B('wood_dark', x - 0.045, 0, pz - 0.045, x + 0.045, 2.1, pz + 0.045);
  }
  S(TIMBER, -1.2 - 0.05, 0, -hz + t, -1.2 + 0.05, CE, pz); S(TIMBER, 1.2 - 0.05, 0, -hz + t, 1.2 + 0.05, CE, pz);
  // the altar bay at the back: the table, the cabinet of tablets with red paper and gilt, lamps, an incense burner, couplets either side
  const az = -hz + t;
  S('timber_red', -1.0, 0, az, 1.0, 1.0, az + 0.5); B('timber_red', -1.05, 1.0, az, 1.05, 1.08, az + 0.55);
  B('lacquer_black', -0.9, 1.1, az, 0.9, 2.5, az + 0.3); B('cloth_red', -0.8, 1.2, az + 0.3, 0.8, 2.4, az + 0.32);
  for (let q = 0; q < 7; q++) { const x = (q - 3) * 0.23; B('lacquer_black', x - 0.07, 1.25, az + 0.32, x + 0.07, 1.75, az + 0.35); B('gilt_bronze', x - 0.03, 1.35, az + 0.35, x + 0.03, 1.65, az + 0.36); }
  B('gilt_bronze', -0.85, 2.5, az, 0.85, 2.58, az + 0.34);
  { const p = W(0, az + 0.3); bag.add('bronze', lathe([[0.001, 0], [0.12, 0.02], [0.13, 0.08], [0.11, 0.14], [0.14, 0.17], [0.001, 0.17]], 12, null, p[0], 1.08, p[1])); }
  for (const x of [-0.7, -0.45, 0.45, 0.7]) { const p = W(x, az + 0.3); bag.add('flame', lathe([[0.03, 0], [0.01, 0.07], [0.001, 0.1]], 6, null, p[0], 1.14, p[1])); B('cloth_red', x - 0.015, 1.08, az + 0.28, x + 0.015, 1.3, az + 0.32); }
  for (const s of [-1, 1]) B('lacquer_red', s * 1.12 - 0.07, 0.9, az, s * 1.12 + 0.07, 2.4, az + 0.03);
  // the hall: a tie-beam with two lanterns, the table with stools, benches along the walls, a rain tub and a winnowing basket at the door
  B('timber_red', -hx + t, 3.8, 2.15, hx - t, 4.0, 2.35);
  for (const x of [-1.5, 1.5]) LF.hang_lantern({ t: 'hang_lantern', at: W(x, 2.25), y: 3.8, rot: 0, seed: sd }, ctx);
  obj('tea_table', 0, 1.4, { seed: sd }); { const a = W(0, 1.4); col.circle(a[0], a[1], 0.75, 0, 0.9); }
  for (const [x, z, r] of [[-hx + t + 0.3, 2.4, 0], [hx - t - 0.3, 2.4, 0]]) { obj('bench', x, z, { len: 1.6, rot: phi + Math.PI / 2, mat: 'timber' }); const a = W(x, z); col.circle(a[0], a[1], 0.55, 0, 0.5); void r; }
  // the rooms
  const rc = (pz - (hz - t)) / 2 + 0.0, roomC = (pz + (-hz + t)) / 2, kinds = ['bedroom', 'tools', 'loom', 'tea'];
  fillRoom(ctx, { ox: W(-2.34, roomC)[0], oz: W(-2.34, roomC)[1], phi: phi + Math.PI, y: 0 }, 'kitchen', { mirror: sd % 2 === 0, seed: sd });
  fillRoom(ctx, { ox: W(2.34, roomC)[0], oz: W(2.34, roomC)[1], phi: phi + Math.PI, y: 0 }, kinds[sd % 4], { mirror: sd % 3 === 0, seed: sd + 5 });
  void rc;

  // the front: the dressing of every house differs (goods by its seed): firewood against the wall, a bench, a rain tub, baskets, a tray of peppers,
  // a pole of washing from the loft shutter, hens, a lantern at each end of the porch beam
  for (const x of [-hx + 0.9, hx - 0.9]) LF.hang_lantern({ t: 'hang_lantern', at: W(x, hz + 1.1), y: H - 0.28, rot: 0, seed: sd }, ctx);
  const left = [() => obj('firewood', -hx + 0.8, hz + 0.45, { len: 1.2, seed: sd, rot: phi }), () => obj('rain_tub', -hx + 0.6, hz + 0.6), () => obj('basket', -hx + 0.8, hz + 0.6, { n: 3, seed: sd })];
  const mid = [() => obj('bench', -1.6, hz + 0.5, { len: 1.8, rot: phi }), () => obj('stool', -1.6, hz + 0.6, { seed: sd }), () => obj('goods_mat', -1.9, hz + 0.7, { seed: sd })];
  const right = [() => obj('drying_tray', 2.3, hz + 0.95, { seed: sd, rot: 0.3 }), () => obj('sacks', hx - 0.7, hz + 0.5, { n: 3, seed: sd }), () => obj('basket', hx - 0.9, hz + 0.6, { n: 2, seed: sd + 3 })];
  left[sd % 3](); mid[(sd >> 1) % 3](); right[(sd >> 2) % 3]();
  if (sd % 2) obj('drying_tray', 1.5, hz + 1.9, { seed: sd + 7, rot: 0.2 });
  LF.laundry_pole({ t: 'laundry_pole', at: W(0.0, hz + 0.02), y: 4.3, rot: phi, len: 1.5, seed: sd * 3 }, ctx);
  if (sd % 3 !== 1) LF.chickens({ t: 'chickens', n: 3 + (sd % 3), kind: 'hen', at: W(1.0 - (sd % 3), hz + 2.3), y: 0, seed: sd }, ctx);

  // weathering: the splashed foot, lichen, the rain tails below the roof and the shutter, a mended patch
  const wz = (x0, x1, y0, y1, m) => B(m, x0, y0, hz, x1, y1, hz + 0.02);
  wz(-hx, -dw - 0.1, 0.7, 1.15 + rand() * 0.4, 'banco_rough'); wz(dw + 0.1, hx, 0.7, 1.15 + rand() * 0.4, 'banco_rough');
  wz(-hx + 0.3, -hx + 1.3 + rand(), 1.2, 1.9, 'plaster_damp'); wz(1.9 + rand(), hx - 0.2, 2.6, 3.8, 'lime_plaster_rough');
  wz(-0.5, 0.5, 2.0, 3.55, 'plaster_streak');
  for (const s of [-1, 1]) { const x = s > 0 ? hx : -hx - 0.02; B('banco_rough', x, 0.7, -hz + 0.5, x + 0.02, 1.3 + rand() * 0.4, hz - 0.5); }
  void box; void rod;
}

/** earth_shrine: { at, rot } — the earth god's little stone house by the road: granite walls on three sides, a tiled gable, the tablet, an incense burner and sticks, a lamp. */
export function earthShrine(el, ctx) {
  const { bag, col } = ctx, [x, z] = el.at, phi = el.rot ?? 0, y = el.y ?? 0;
  const B = (m, x0, y0, z0, x1, y1, z1) => bag.add(m, lbox(x, z, phi, x0, y + y0, z0, x1, y + y1, z1));
  const W = frameOf(x, z, phi);
  B('granite_block', -0.6, 0, -0.45, 0.6, 0.28, 0.45); B('granite_block', -0.55, 0.28, -0.45, 0.55, 1.2, -0.33); B('granite_block', -0.55, 0.28, -0.45, -0.43, 1.2, 0.4); B('granite_block', 0.43, 0.28, -0.45, 0.55, 1.2, 0.4);
  B('granite_block', -0.6, 1.2, -0.5, 0.6, 1.26, 0.5);
  const roof = (zA, zB) => { const g = zslab(-0.72, 0.72, zA, 1.26, zB, 1.62, 0.07); g.applyMatrix4(new Matrix4().makeRotationY(phi).setPosition(x, y, z)); bag.add(TILE, g); };
  roof(0.62, 0); roof(-0.62, 0); B('tile_dark', -0.74, 1.6, -0.1, 0.74, 1.7, 0.1);
  B('granite_block', -0.14, 0.28, -0.25, 0.14, 0.85, -0.17); B('cloth_red', -0.2, 0.85, -0.3, 0.2, 1.1, -0.28); B('cloth_red', -0.1, 0.4, -0.17, 0.1, 0.8, -0.16);
  { const p = W(0, 0.0); bag.add('bronze', lathe([[0.001, 0], [0.09, 0.02], [0.1, 0.07], [0.08, 0.11], [0.001, 0.11]], 10, null, p[0], y + 0.28, p[1])); }
  for (const q of [-0.04, 0, 0.04]) B('cloth_red', q - 0.004, 0.39, 0.0, q + 0.004, 0.62, 0.008);
  B('bluestone', -0.8, 0, 0.45, 0.8, 0.06, 1.5); B('granite_block', -0.3, 0, 0.5, 0.3, 0.2, 0.8);
  B('pottery_dark', 0.25, 0.28, 0.12, 0.35, 0.34, 0.22); B('cloth_red', 0.27, 0.34, 0.14, 0.33, 0.4, 0.2);
  col.circle(x, z, 0.65, y, y + 1.7);
}

/** noria: { x, zc, r, axle } — the bamboo water-lifting wheel (筒车) turning in the stream, axle across the stream on two stone piers,
 *  a ring of tubes on the rim, a bamboo trough from its top to the bank. */
export function noria(el, { bag, col }) {
  const x0 = el.x, zc = el.zc, r = el.r ?? 3.2, ay = el.axle ?? 2.3, n = 24, hw = 0.85;
  bag.add(TIMBER, rod([x0, ay, zc - 3.9], [x0, ay, zc + 3.9], 0.12, 8));
  bag.add(TIMBER, lathe([[0.001, 0], [0.3, 0], [0.3, 0.9], [0.001, 0.9]], 12).rotateX(Math.PI / 2).translate(x0, ay, zc - 0.45));
  const P = (a, rr, z) => [x0 + Math.cos(a) * rr, ay + Math.sin(a) * rr, z];
  for (const z of [zc - hw, zc + hw]) for (let i = 0; i < n; i++) {
    const a0 = i / n * Math.PI * 2, a1 = (i + 1) / n * Math.PI * 2;
    bag.add('bamboo_culm', rod(P(a0, r, z), P(a1, r, z), 0.05, 5));
    if (i % 3 === 0) bag.add(TIMBER, rod(P(a0, 0.3, z), P(a0, r, z), 0.035, 5));
  }
  for (let i = 0; i < n; i++) {
    const a = i / n * Math.PI * 2, c1 = P(a, r, zc - hw - 0.1), c2 = P(a, r, zc + hw + 0.1), tip = P(a + 0.35, r + 0.55, zc - hw - 0.1), tip2 = P(a + 0.35, r + 0.55, zc + hw + 0.1);
    bag.add('bamboo_culm', rod(c1, c2, 0.04, 5));
    if (i % 2 === 0) { bag.add('bamboo_culm', rod(c1, tip, 0.07, 6)); bag.add('bamboo_culm', rod(c2, tip2, 0.07, 6)); }
  }
  for (const s of [-1, 1]) {
    const z = zc + s * 3.9;
    bag.add('granite_block', box(x0 - 0.5, -1.0, z - 0.45, x0 + 0.5, ay - 0.2, z + 0.45)); bag.add('timber_red', box(x0 - 0.3, ay - 0.2, z - 0.35, x0 + 0.3, ay - 0.05, z + 0.35));
    col.rect([x0 - 0.5, z - 0.45, x0 + 0.5, z + 0.45], -1.0, ay);
  }
  // the trough from the top of the wheel to the north bank, on bamboo trestles; the water running in it
  const yt = ay + r - 0.15, zn = zc - 6.8;
  bag.add('bamboo_culm', box(x0 - 0.22, yt, zn, x0 + 0.22, yt + 0.06, zc + 0.3)); bag.add('bamboo_culm', box(x0 - 0.24, yt, zn, x0 - 0.2, yt + 0.28, zc + 0.3)); bag.add('bamboo_culm', box(x0 + 0.2, yt, zn, x0 + 0.24, yt + 0.28, zc + 0.3));
  bag.add('water', box(x0 - 0.2, yt + 0.06, zn, x0 + 0.2, yt + 0.16, zc + 0.3));
  for (let z = zn + 0.5; z < zc - 3.5; z += 2.0) { bag.add('bamboo_culm', rod([x0 - 0.2, -0.3, z], [x0 - 0.2, yt, z], 0.05, 5)); bag.add('bamboo_culm', rod([x0 + 0.2, -0.3, z], [x0 + 0.2, yt, z], 0.05, 5)); col.circle(x0, z, 0.3, 0, yt); }
}

/** wash_steps: { x, z } — granite steps down into the stream (z of the stream's middle), a flat beating stone at the water. */
export function washSteps(el, { bag }) {
  const x = el.x, sz = el.z, tops = [0.02, -0.28, -0.58, -0.86];
  tops.forEach((top, k) => { const z0 = sz - 4.4 + k * 0.6; bag.add('granite_block', box(x - 0.8, -1.4, z0, x + 0.8, top, z0 + 0.6)); });
  bag.add('granite_block', box(x + 0.9, -1.4, sz - 2.9, x + 1.9, -0.84, sz - 2.3));
}

/** veg_plot: { rect } — a kitchen garden of raised beds with greens, beans on bamboo poles, a bamboo fence. */
export function vegPlot(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, rand = rng((el.seed ?? 3) * 71 + 1), long = z1 - z0 > x1 - x0;
  const bedW = 0.8, pitch = 1.3, from = (long ? x0 : z0) + 0.9, to = (long ? x1 : z1) - 0.9, s0 = (long ? z0 : x0) + 0.9, s1 = (long ? z1 : x1) - 0.9;
  const at = (a, b) => (long ? [a, b] : [b, a]);
  for (let a = from; a + bedW <= to; a += pitch) {
    const [bx, bz] = at(a, s0), [ex, ez] = at(a + bedW, s1);
    bag.add('ground', box(Math.min(bx, ex), 0, Math.min(bz, ez), Math.max(bx, ex), 0.14, Math.max(bz, ez)));
    const kind = Math.floor(rand() * 3);
    for (let b = s0 + 0.3; b < s1 - 0.2; b += kind === 2 ? 1.4 : 0.62) {
      const [px, pz] = at(a + bedW / 2, b);
      if (kind === 2) {                                                       // beans: a tripod of poles with the vine on it
        for (const [dx, dz] of [[-0.3, -0.2], [0.3, -0.2], [0, 0.3]]) bag.add('bamboo_culm', rod([px + dx, 0.14, pz + dz], [px, 1.9, pz], 0.02, 4));
        bag.add('cloth_green', box(px - 0.2, 0.5, pz - 0.15, px + 0.2, 1.7, pz + 0.15));
      } else {
        const h = kind === 0 ? 0.22 + rand() * 0.12 : 0.4 + rand() * 0.2;
        bag.add('cloth_green', box(px - 0.2, 0.14, pz - 0.2, px + 0.2, 0.14 + h, pz + 0.2));
        if (rand() < 0.1) bag.add('cloth_ochre', box(px - 0.06, 0.14 + h, pz - 0.06, px + 0.06, 0.14 + h + 0.08, pz + 0.06));
      }
    }
  }
  // the fence: bamboo posts every 1.6 m, two rails
  const fence = (ax, az, bx, bz) => {
    const L = Math.hypot(bx - ax, bz - az), n = Math.max(1, Math.round(L / 1.6));
    for (let k = 0; k <= n; k++) { const px = ax + (bx - ax) * k / n, pz = az + (bz - az) * k / n; bag.add('bamboo_culm', rod([px, 0, pz], [px, 1.1, pz], 0.035, 4)); }
    for (const y of [0.45, 0.9]) bag.add('bamboo_culm', rod([ax, y, az], [bx, y, bz], 0.022, 4));
    col.segment([ax, az], [bx, bz], 0.1, 0, 1.1);
  };
  fence(x0, z0, x1, z0); fence(x1, z0, x1, z1); fence(x1, z1, x0, z1); fence(x0, z1, x0, z0);
}
