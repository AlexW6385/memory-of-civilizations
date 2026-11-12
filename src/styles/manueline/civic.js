// The civic buildings of Lisbon about 1520: the Ribeira palace with its loggia and the Tower of the King (the Casa da Índia), the
// Sé with its two crenellated towers, São Jorge's castle, the monastery's plain ranges, the pelourinho, a fountain, and the
// Ribeira das Naus: hulls on the stocks, timber stacks, the rope-walk, a crane. docs/settlements/manueline-lisbon.md §6.
import { box, lathe, rod, frustum, fromTriangles } from '../../core/geom.js';
import { archWall } from '../gothic/nd-interior.js';
import { tube } from '../../objects/kit.js';
import { rng, gable, armillary, orderCross, ropeColumn, wallRun, addBox, pinnacle, prism } from './util.js';

const LIME = 'limestone', WALL = 'limewash_white';
/** An arcaded face: wall of thickness th on the line from a to b (a, b plan), y0..y1, round openings; dark panel behind. */
function arcade(ctx, a, b, th, y0, y1, openings, mat, dark = true) {
  const { bag } = ctx, L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L, nx = uz, nz = -ux;
  const T = [];
  archWall(T, (u, yy, d) => [a[0] + ux * u - nx * d, yy, a[1] + uz * u - nz * d], { u0: 0, u1: L, d0: 0, d1: th, y0, y1, openings, n: 8 });
  bag.add(mat, fromTriangles(T));
  if (dark) for (const o of openings) { const c = [a[0] + ux * o.uc - nx * (th + 0.02), a[1] + uz * o.uc - nz * (th + 0.02)]; const w = o.r; bag.add('opening', box(Math.min(c[0] - Math.abs(ux) * w, c[0] - 0.04), o.sill, Math.min(c[1] - Math.abs(uz) * w, c[1] - 0.04), Math.max(c[0] + Math.abs(ux) * w, c[0] + 0.04), o.spring + o.r, Math.max(c[1] + Math.abs(uz) * w, c[1] + 0.04))); }
}
export function palace(el, ctx) {
  const { bag, col } = ctx, [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, rand = rng(el.seed ?? 7), H = 14.5;
  const wings = [[x1 - 16, z0, x1, z1, 'e'], [x0, z1 - 14, x1, z1, 's'], [x0, z0, x0 + 16, z1, 'w'], [x0, z0, x1, z0 + 14, 'n']];
  for (const [a, b, c, d, f] of wings) {
    bag.add(WALL, box(a, y - 1, b, c, y + H, d)); col.rect([a, b, c, d], y - 1, y + H + 3);
    gable(bag, 'roof_tile', [a, b, c, d], y + H, 4.2, f === 'n' || f === 's', 0.9);
    bag.add(LIME, box(a - 0.08, y + H - 0.4, b - 0.08, c + 0.08, y + H + 0.1, d + 0.08));
  }
  // the courtyard (shut): paved, with a fountain
  bag.add('flagstone', box(x0 + 16, y - 0.2, z0 + 14, x1 - 16, y, z1 - 14));
  // the east front on the Terreiro: ground storey with arched doors, the loggia above (nine arches on slender columns), stone window courses
  const n = 9, len = z1 - z0 - 8, pitch = len / n, ops = Array.from({ length: n }, (_, k) => ({ uc: 4 + pitch * (k + 0.5), r: pitch * 0.32, sill: y, spring: y + 3.2, f: 0.5 }));
  const east = [x1 + 0.0, z0];
  arcade(ctx, [x1 + 0.9, z0 + 0.0], [x1 + 0.9, z1], 0.6, y - 0.2, y + 6.4, ops.map((o) => ({ ...o, uc: o.uc })), LIME, true);
  const up = Array.from({ length: n }, (_, k) => ({ uc: 4 + pitch * (k + 0.5), r: pitch * 0.34, sill: y + 8.0, spring: y + 9.6, f: 0.5 }));
  arcade(ctx, [x1 + 0.9, z0], [x1 + 0.9, z1], 0.6, y + 6.4, y + 12.6, up, LIME, true);
  bag.add(LIME, box(x1, y + 6.2, z0, x1 + 1.5, y + 6.6, z1)); bag.add(LIME, box(x1, y + 12.6, z0, x1 + 1.5, y + 13.0, z1));
  col.rect([x1, z0, x1 + 1.5, z1], y, y + 13);
  void east; void rand;
  for (let k = 0; k < n; k++) { const zc = z0 + 4 + pitch * (k + 0.5); if (k % 2 === 0) armillary(bag, 'limestone_carved', x1 + 1.55, y + 12.0, zc, 0.4); }
  // window rows on the south front facing the river, with the great arms over the middle
  for (let u = x0 + 3; u < x1 - 20; u += 4.2) { for (const yy of [1.4, 7.4]) { addBox(bag, 'opening', u, y + yy, z1, u + 1.2, y + yy + 2.2, z1 + 0.1); addBox(bag, LIME, u - 0.2, y + yy + 2.2, z1, u + 1.4, y + yy + 2.5, z1 + 0.18); } }
  for (let u = x0 + 3; u < x1 - 20; u += 8.4) { addBox(bag, 'wood_dark', u, y, z1, u + 2.6, y + 3.4, z1 + 0.12); addBox(bag, LIME, u - 0.3, y + 3.4, z1, u + 2.9, y + 3.8, z1 + 0.2); }
  // the Tower of the King (the Casa da Índia): three storeys over the river corner, a loggia, a hipped roof, the royal arms on the river face
  const tx0 = x1 - 24, tx1 = x1 + 1.0, tz0 = z1 - 24, tz1 = z1 + 1.0, TH = 21;
  bag.add(WALL, box(tx0, y - 1, tz0, tx1, y + TH, tz1)); col.rect([tx0, tz0, tx1, tz1], y - 1, y + TH + 4);
  for (const yy of [6.8, 13.6]) bag.add('limestone_carved', box(tx0 - 0.1, y + yy, tz0 - 0.1, tx1 + 0.1, y + yy + 0.4, tz1 + 0.1));
  bag.add('roof_tile', frustum([tx0 - 1, tz0 - 1, tx1 + 1, tz1 + 1], y + TH, y + TH + 7, 11, 11, 11, 11));
  const lg = Array.from({ length: 5 }, (_, k) => ({ uc: 4.2 + k * 4.2, r: 1.2, sill: y + 15.3, spring: y + 17.2, f: 0.5 }));
  arcade(ctx, [tx0 + 0.0, tz1 + 0.35], [tx1 - 0.0, tz1 + 0.35], 0.45, y + 14.0, y + 20.6, lg, 'limestone_carved', true);
  for (let u = tx0 + 3; u < tx1 - 2; u += 4.2) for (const yy of [1.8, 8.6]) { addBox(bag, 'opening', u, y + yy, tz1, u + 1.3, y + yy + 2.4, tz1 + 0.1); addBox(bag, LIME, u - 0.2, y + yy + 2.4, tz1, u + 1.5, y + yy + 2.7, tz1 + 0.18); }
  addBox(bag, 'limestone_carved', (tx0 + tx1) / 2 - 2.2, y + 3.0, tz1, (tx0 + tx1) / 2 + 2.2, y + 6.4, tz1 + 0.2);                 // the royal arms
  orderCross(bag, 'wall_red', (tx0 + tx1) / 2 - 1.0, y + 4.7, tz1 + 0.22, 0.7, 's', 0.04); armillary(bag, 'limestone_carved', (tx0 + tx1) / 2 + 1.1, y + 4.7, tz1 + 0.35, 0.8);
  addBox(bag, 'wood_dark', (tx0 + tx1) / 2 - 1.4, y, tz1, (tx0 + tx1) / 2 + 1.4, y + 3.0, tz1 + 0.1);                                // the Casa da Índia's door on the quay
}
export function se(el, ctx) {
  const { bag, col } = ctx, [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, zc = (z0 + z1) / 2;
  bag.add(LIME, box(x0 - 0.5, y - 6, z0 - 0.5, x1 + 0.5, y, z1 + 0.5));
  // aisles, nave, the transept and the lantern over the crossing, the apse
  bag.add(LIME, box(x0 + 8, y, z0, x1 - 6, y + 11, z1)); col.rect([x0 + 8, z0, x1 - 6, z1], y, y + 12);
  bag.add(LIME, box(x0 + 8, y + 11, zc - 10, x1 - 6, y + 17, zc + 10));
  gable(bag, 'roof_tile', [x0 + 8, zc - 10, x1 - 6, zc + 10], y + 17, 3.2, true, 0.5);
  for (const s of [-1, 1]) bag.add('roof_tile', box(x0 + 8, y + 11, zc + s * 10 - (s > 0 ? 0 : 0), x1 - 6, y + 11.2, zc + s * 10 + s * 0.1).translate(0, 0, 0));
  const tx = (x0 + x1) / 2 + 6;
  bag.add(LIME, box(tx - 6, y + 11, z0 - 4, tx + 6, y + 20, z1 + 4)); col.rect([tx - 6, z0 - 4, tx + 6, z1 + 4], y, y + 20);
  gable(bag, 'roof_tile', [tx - 6, z0 - 4, tx + 6, z1 + 4], y + 20, 2.6, false, 0.4);
  bag.add(LIME, lathe([[4.2, 0], [4.2, 5]], 8, null, tx, y + 20, zc)); bag.add('roof_tile', lathe([[4.5, 0], [3.0, 1.4], [0.001, 3.6]], 8, null, tx, y + 25, zc));
  bag.add(LIME, lathe([[5.5, 0], [5.0, 6]], 10, null, x1 - 1, y, zc));
  // the west front: two square towers with merlons, the rose window, the portal
  for (const [a, b] of [[z0, z0 + 10], [z1 - 10, z1]]) {
    bag.add(LIME, box(x0, y, a, x0 + 10, y + 27, b)); col.rect([x0, a, x0 + 10, b], y, y + 27);
    bag.add('limestone_carved', box(x0 - 0.1, y + 26.4, a - 0.1, x0 + 10.1, y + 27.2, b + 0.1));
    for (let u = 0.6; u < 10; u += 1.8) for (const [mx, mz] of [[x0 + u, a - 0.1], [x0 + u, b - 0.9], [x0 - 0.1, a + u], [x0 + 9.1, a + u]]) addBox(bag, LIME, mx, y + 27.2, mz, mx + 1.0, y + 28.6, mz + 1.0);
    for (const yy of [9, 17]) addBox(bag, 'opening', x0 - 0.05, y + yy, (a + b) / 2 - 0.4, x0 + 0.05, y + yy + 2.6, (a + b) / 2 + 0.4);
  }
  bag.add('stained_glass', lathe([[2.4, 0], [0.001, 0]], 16, null, x0 + 0.02, y + 16, zc).rotateZ(Math.PI / 2).translate(0, 0, 0));
  addBox(bag, 'stained_glass', x0 - 0.04, y + 14.2, zc - 1.8, x0 + 0.02, y + 17.8, zc + 1.8);
  addBox(bag, LIME, x0 - 0.2, y + 11.4, zc - 2.6, x0 + 0.1, y + 20.6, zc - 2.3); addBox(bag, LIME, x0 - 0.2, y + 11.4, zc + 2.3, x0 + 0.1, y + 20.6, zc + 2.6);
  addBox(bag, 'wood_dark', x0 - 0.1, y, zc - 1.4, x0 + 0.1, y + 3.6, zc + 1.4);
  const T = [];
  archWall(T, (u, yy, d) => [x0 - 0.7 + d, yy, zc - 3 + u], { u0: 0, u1: 6, d0: 0, d1: 0.7, y0: y, y1: y + 8, openings: [{ uc: 3, r: 1.9, sill: y, spring: y + 3.6, f: 0.5 }], n: 8 });
  bag.add('limestone_carved', fromTriangles(T));
  for (let k = 0; k < 7; k++) { const zz = z0 + 11 + k * (z1 - z0 - 22) / 6; pinnacle(bag, 'limestone_carved', x0 + 8.5, y + 11, zz, 0.3, 1.6, 6); }
}
export function castle(el, ctx) {
  const { bag, col } = ctx, [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, rand = rng(el.seed ?? 3);
  bag.add('limestone', box(x0 - 3, y - 9, z0 - 3, x1 + 3, y - 0.2, z1 + 3));
  const run = (a, b, gap) => { wallRun(ctx, a, b, 2.8, y - 0.2, y + 9.5, 'limestone', gap ?? []); const L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.floor(L / 2.4); for (let k = 0; k < n; k++) { const t = (k + 0.5) / n; addBox(bag, 'limestone', a[0] + (b[0] - a[0]) * t - 0.55, y + 9.5, a[1] + (b[1] - a[1]) * t - 0.55, a[0] + (b[0] - a[0]) * t + 0.55, y + 11, a[1] + (b[1] - a[1]) * t + 0.55); } };
  const xm = (x0 + x1) / 2, zm = (z0 + z1) / 2;
  run([x0, z0], [x1, z0]); run([x0, z0], [x0, z1]); run([x1, z0], [x1, z1]);
  run([x0, z1], [x1, z1], [{ at: xm - x0, w: 4, h: 5 }]);
  for (const [tx, tz] of [[x0, z0], [x1, z0], [x0, z1], [x1, z1], [xm, z0], [x0, zm], [x1, zm]]) {
    bag.add('limestone', box(tx - 4, y - 0.2, tz - 4, tx + 4, y + 15, tz + 4)); col.rect([tx - 4, tz - 4, tx + 4, tz + 4], y, y + 15);
    for (let u = -3.4; u < 4; u += 1.8) for (const [mx, mz] of [[tx + u, tz - 4], [tx + u, tz + 3.2], [tx - 4, tz + u], [tx + 3.2, tz + u]]) addBox(bag, 'limestone', mx - 0.4, y + 15, mz - 0.4, mx + 0.4, y + 16.4, mz + 0.4);
  }
  // the gate's towers, a keep (the alcáçova's tower) in the middle, the roofs of the barracks
  bag.add('limestone', box(xm - 8, y, zm - 6, xm + 8, y + 12, zm + 6)); col.rect([xm - 8, zm - 6, xm + 8, zm + 6], y, y + 12);
  bag.add('roof_tile', frustum([xm - 9, zm - 7, xm + 9, zm + 7], y + 12, y + 16, 0, 0, 7, 7));
  orderCross(bag, 'cloth_red', xm, y + 18.5, zm, 1.6, 's', 0.05); bag.add('timber', rod([xm, y + 14, zm], [xm, y + 21, zm], 0.08, 5));
  addBox(bag, 'cloth_white', xm - 0.0, y + 19.5, zm, xm + 3, y + 21, zm + 0.05);
  void rand;
}
/** monastery_range: { rect, y, h } a plain two-storey range with a tile roof, regular windows. */
export function range(el, ctx) {
  const { bag, col } = ctx, [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, h = el.h ?? 11;
  bag.add(LIME, box(x0, y - 0.6, z0, x1, y + 1.0, z1)); bag.add(WALL, box(x0, y + 1.0, z0, x1, y + h, z1)); col.rect([x0, z0, x1, z1], y - 0.6, y + h + 3);
  gable(bag, 'roof_tile', el.rect, y + h, Math.min(3.6, (Math.min(x1 - x0, z1 - z0)) * 0.3), x1 - x0 > z1 - z0, 0.7);
  bag.add('limestone_carved', box(x0 - 0.1, y + h - 0.35, z0 - 0.1, x1 + 0.1, y + h + 0.1, z1 + 0.1));
  const long = x1 - x0 > z1 - z0;
  for (let u = 3; u < (long ? x1 - x0 : z1 - z0) - 2; u += 4) for (const yy of [2.2, 6.4]) for (const s of [0, 1]) {
    if (long) { const zz = s ? z1 : z0; addBox(bag, 'opening', x0 + u, y + yy, zz - (s ? 0.05 : 0.0) - 0.0, x0 + u + 1.0, y + yy + 2.0, zz + (s ? 0.05 : 0.0) + (s ? 0 : 0.05)); addBox(bag, LIME, x0 + u - 0.15, y + yy + 2.0, zz - (s ? 0.0 : 0.12), x0 + u + 1.15, y + yy + 2.25, zz + (s ? 0.12 : 0.0)); }
    else { const xx = s ? x1 : x0; addBox(bag, 'opening', xx - (s ? 0.0 : 0.05), y + yy, z0 + u, xx + (s ? 0.05 : 0.0), y + yy + 2.0, z0 + u + 1.0); addBox(bag, LIME, xx - (s ? 0.0 : 0.12), y + yy + 2.0, z0 + u - 0.15, xx + (s ? 0.12 : 0.0), y + yy + 2.25, z0 + u + 1.15); }
  }
}
export function pelourinho(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0;
  for (let k = 0; k < 3; k++) bag.add(LIME, box(x - 1.6 + k * 0.3, y + k * 0.22, z - 1.6 + k * 0.3, x + 1.6 - k * 0.3, y + (k + 1) * 0.22, z + 1.6 - k * 0.3));
  col.rect([x - 1.6, z - 1.6, x + 1.6, z + 1.6], y, y + 0.66);
  ropeColumn({ bag, col }, x, z, y + 0.66, 6.2, 0.32, { mat: 'limestone_yellow', carved: 'limestone_carved', turns: 6, capital: true });
  bag.add('limestone_carved', lathe([[0.7, 0], [0.5, 0.5], [0.1, 1.1], [0.001, 1.3]], 8, null, x, y + 6.9, z));
  for (let k = 0; k < 4; k++) { const t = k / 4 * Math.PI * 2; bag.add('iron', rod([x + Math.cos(t) * 0.4, y + 6.7, z + Math.sin(t) * 0.4], [x + Math.cos(t) * 0.75, y + 6.5, z + Math.sin(t) * 0.75], 0.03, 4)); }
}
export function fountain(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0;
  bag.add(LIME, lathe([[4.2, 0], [4.2, 0.9], [3.7, 0.9], [3.7, 0.4], [0.001, 0.4]], 18, null, x, y, z)); col.circle(x, z, 4.2, y, y + 0.9);
  bag.add('water', lathe([[3.65, 0.45], [0.001, 0.45]], 18, null, x, y, z));
  bag.add('limestone_carved', lathe([[0.7, 0], [0.5, 0.5], [0.3, 1.2], [0.45, 1.6], [0.2, 2.0], [0.001, 2.2]], 10, null, x, y + 0.4, z));
  armillary(bag, 'limestone_carved', x, y + 3.2, z, 0.6);
}
// ── the shipyard ──
/** hull_stocks: { rect: [x0, z0, x1, z1] (long along x), y } a hull on the stocks: keel, stem and sternpost, ribs, part planked. */
export function hullOnStocks(el, ctx) {
  const { bag, col } = ctx, [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, L = x1 - x0, zc = (z0 + z1) / 2, W = (z1 - z0) / 2;
  for (let k = 0; k <= 8; k++) { const x = x0 + 2 + k * (L - 4) / 8; bag.add('timber', box(x - 0.3, y, zc - W - 0.5, x + 0.3, y + 0.5, zc + W + 0.5)); }
  const ky = y + 1.1;
  bag.add('wood_dark', box(x0 + 1, y + 0.5, zc - 0.25, x1 - 1, ky + 0.35, zc + 0.25));
  bag.add('wood_dark', rod([x0 + 1, ky, zc], [x0 - 0.8, ky + 5.2, zc], 0.22, 5)); bag.add('wood_dark', rod([x1 - 1, ky, zc], [x1 + 0.2, ky + 6.2, zc], 0.22, 5));
  const nR = Math.floor(L / 1.5);
  for (let k = 1; k < nR; k++) {
    const u = k / nR, x = x0 + 1 + u * (L - 2), f = Math.sin(Math.PI * (0.06 + 0.88 * u)), w = W * (0.15 + 0.85 * f), h = 1.6 + 3.2 * f + (u > 0.8 ? 3 * (u - 0.8) / 0.2 : 0);
    for (const s of [-1, 1]) bag.add('timber', tube(Array.from({ length: 7 }, (_, j) => { const t = j / 6; return [x, ky + t * h, zc + s * w * (Math.sin(t * Math.PI / 2) * 0.95 + 0.05 * t), 0.09]; }), 4, { capA: false, capB: false }));
    if (u < 0.45) for (const s of [-1, 1]) bag.add('wood_ochre', box(x - 0.75, ky + 0.2, zc + s * w * 0.7 - (s > 0 ? 0.0 : 0.04), x + 0.75, ky + h * 0.55, zc + s * w * 0.7 + (s > 0 ? 0.04 : 0.0)));
  }
  col.rect([x0 - 0.5, zc - W - 0.5, x1 + 0.5, zc + W + 0.5], y, y + 3);
  for (const x of [x0 + 6, x0 + L / 2, x1 - 6]) for (const s of [-1, 1]) { bag.add('timber', rod([x, y, zc + s * (W + 1.5)], [x, y + 8, zc + s * (W + 1.5)], 0.08, 4)); }
  for (const s of [-1, 1]) for (const yy of [3, 6]) bag.add('timber', rod([x0 + 6, y + yy, zc + s * (W + 1.5)], [x1 - 6, y + yy, zc + s * (W + 1.5)], 0.06, 4));
}
export function timberStack(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, rand = rng(el.seed ?? 1), n = 5;
  for (let k = 0; k < n; k++) bag.add('timber', box(x0, y + k * 0.34 + (k % 2) * 0, z0 + (k % 2) * 0.3, x1 - rand() * 0.8, y + k * 0.34 + 0.3, z1 - 0.3 + (k % 2) * 0.3));
  col.rect(el.rect, y, y + n * 0.34);
}
export function ropeWalk(el, ctx) {
  const { bag, col } = ctx, [x0, z0, x1, z1] = el.rect, y = el.y ?? 0;
  for (let x = x0; x <= x1 + 0.01; x += 4) for (const z of [z0, z1]) { bag.add('timber', box(x - 0.15, y, z - 0.15, x + 0.15, y + 3.4, z + 0.15)); col.circle(x, z, 0.2, y, y + 3.4); }
  gable(bag, 'roof_tile', [x0, z0, x1, z1], y + 3.4, 1.6, true, 0.6);
  for (let x = x0 + 2; x < x1; x += 14) bag.add('rope_fibre', rod([x, y + 1.0, (z0 + z1) / 2], [x + 12, y + 1.0, (z0 + z1) / 2], 0.05, 4));
}
export function crane(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0;
  bag.add('timber', box(x - 0.35, y, z - 0.35, x + 0.35, y + 9, z + 0.35)); col.rect([x - 0.35, z - 0.35, x + 0.35, z + 0.35], y, y + 9);
  bag.add('timber', rod([x, y + 8.6, z], [x + 6.5 * (el.dir ?? 1), y + 7.0, z], 0.12, 5)); bag.add('timber', rod([x, y + 9.2, z], [x + 6.5 * (el.dir ?? 1), y + 7.0, z], 0.07, 4));
  bag.add('rope_fibre', rod([x + 6.4 * (el.dir ?? 1), y + 7.0, z], [x + 6.4 * (el.dir ?? 1), y + 2.2, z], 0.03, 4));
  bag.add('iron', box(x + 6.2 * (el.dir ?? 1), y + 1.9, z - 0.2, x + 6.6 * (el.dir ?? 1), y + 2.3, z + 0.2));
  bag.add('wood_dark', lathe([[1.3, 0], [1.3, 1.0]], 10, null, x + 2.5, y, z + 1.6));
}
/**
 * masons_yard: { rect: [x0, z0, x1, z1], y, seed } — the lodge of the masons at the church's west end, where the works of the Jerónimos
 * went on for decades (docs/settlements/manueline-lisbon.md §3): blocks of lioz in ranked stacks and single ones squared on trestles,
 * chips of stone on the ground, an open shed of posts and planks over the banker benches, a tripod hoist with a block slung under it,
 * a ladder and a heap of lime.
 */
export function masonsYard(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, rand = rng(el.seed ?? 1), M = 'limestone_yellow';
  // the stacks of rough blocks along the north side, in ranks of different heights
  for (let k = 0, x = x0 + 0.5; x < x1 - 3; k++) {
    const w = 1.8 + rand() * 1.4, h = 0.5 + Math.floor(rand() * 3) * 0.5, d = 1.1 + rand() * 0.4;
    for (let r = 0; r < Math.round(h / 0.5); r++) bag.add(r % 2 ? 'limestone' : M, box(x + r * 0.05, y + r * 0.5, z0 + 0.4, x + w - r * 0.05, y + r * 0.5 + 0.48, z0 + 0.4 + d));
    col.rect([x, z0 + 0.4, x + w, z0 + 0.4 + d], y, y + h);
    x += w + 0.35 + rand() * 0.5;
  }
  // the open shed: four posts, a pent roof of planks, the bankers (working benches) with a block each
  const sx0 = x0 + 1.0, sz0 = z0 + 3.6, sx1 = sx0 + 6.5, sz1 = sz0 + 4.2;
  for (const [px, pz, h] of [[sx0, sz0, 3.2], [sx1, sz0, 3.2], [sx0, sz1, 2.6], [sx1, sz1, 2.6]]) { bag.add('timber', box(px - 0.1, y, pz - 0.1, px + 0.1, y + h, pz + 0.1)); col.rect([px - 0.12, pz - 0.12, px + 0.12, pz + 0.12], y, y + h); }
  bag.add('timber', frustum([sx0 - 0.5, sz0 - 0.4, sx1 + 0.5, sz1 + 0.5], y + 2.6, y + 3.35, 0, 0, 0, 0, { noBottom: true }));
  for (const bx of [sx0 + 1.6, sx0 + 4.9]) { bag.add('timber', box(bx - 0.9, y, sz0 + 1.6, bx + 0.9, y + 0.8, sz0 + 2.4)); bag.add(M, box(bx - 0.65, y + 0.8, sz0 + 1.7, bx + 0.65, y + 1.25, sz0 + 2.3)); col.rect([bx - 0.9, sz0 + 1.6, bx + 0.9, sz0 + 2.4], y, y + 1.25); }
  // chips and dust on the ground under the shed
  for (let k = 0; k < 16; k++) { const cx = sx0 + 0.6 + rand() * 5.4, cz = sz0 + 0.8 + rand() * 3, s = 0.08 + rand() * 0.1; bag.add('limestone', box(cx, y, cz, cx + s * 1.6, y + s, cz + s)); }
  // the tripod hoist, a block slung under it by a rope, and a ladder against the stacks
  const hx = x1 - 3.0, hz = z0 + 6.8;
  for (const [dx, dz] of [[-1.5, -1.1], [1.5, -1.1], [0, 1.6]]) bag.add('timber', rod([hx + dx, y, hz + dz], [hx, y + 5.2, hz], 0.09, 5));
  bag.add('iron', box(hx - 0.2, y + 5.1, hz - 0.1, hx + 0.2, y + 5.3, hz + 0.1)); bag.add('rope_fibre', rod([hx, y + 5.1, hz], [hx, y + 1.7, hz], 0.03, 4)); bag.add(M, box(hx - 0.55, y + 1.05, hz - 0.4, hx + 0.55, y + 1.7, hz + 0.4));
  col.circle(hx, hz, 1.8, y, y + 1.2);
  bag.add('timber', rod([x0 + 4.0, y, z0 + 1.6], [x0 + 3.7, y + 2.8, z0 + 0.5], 0.04, 4)); bag.add('timber', rod([x0 + 4.3, y, z0 + 1.6], [x0 + 4.0, y + 2.8, z0 + 0.5], 0.04, 4));
  bag.add('limewash_white', lathe([[0.9, 0], [0.7, 0.3], [0.001, 0.6]], 8, null, x1 - 1.2, y, z1 - 1.2));
}
void prism;
