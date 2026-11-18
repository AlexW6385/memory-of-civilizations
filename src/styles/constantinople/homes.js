// The houses of Constantinople's lanes (docs/settlements/constantinople.md §4.10, §12): the working and family houses you can walk
// into, drawn from their seeds by rule (the wall's skin, the door's frame and place, the kind of gallery, the roof's pitch, the
// trade of the ground floor's west half). A copy of the byzantine style's single house, grown into a family of them; registered
// into the `roman` style as `cn_home`. Only this settlement uses it.

import { Matrix4 } from '../../core/three.js';
import { STYLES, orientedBox, subtractRects } from '../../core/build.js';
import { box, frustum, lathe, rod, disc, fromTriangles } from '../../core/geom.js';
import { solid8, rng } from '../byzantine/houses.js';
import '../roman/town.js';
import '../../objects/index.js';
import { upperFloor, terrace, upWalks, hasTerrace, STAIR2 } from './upper.js';

// ── small things ──────────────────────────────────────────────────────────────
class Parts {
  constructor() { this.l = []; }
  add(m, g) { this.l.push([m, g]); return this; }
  emit(bag, x, y, z, yaw = 0) {
    const M = new Matrix4().makeRotationY(yaw).setPosition(x, y, z);
    for (const [m, g] of this.l) { g.applyMatrix4(M); bag.add(m, g); }
  }
}
const put = (bag, build, x, y, z, yaw = 0, ...a) => { const Q = new Parts(); build(Q, ...a); Q.emit(bag, x, y, z, yaw); };
const ly = (p, n = 12) => lathe(p, n);
const amphora = (Q, s = 1) => Q.add('terracotta', ly([[0.04 * s, 0], [0.1 * s, 0.1 * s], [0.2 * s, 0.32 * s], [0.21 * s, 0.44 * s], [0.12 * s, 0.62 * s], [0.06 * s, 0.7 * s], [0.08 * s, 0.76 * s], [0.001, 0.76 * s]], 10));
const pithos = (Q) => Q.add('terracotta', ly([[0.2, 0], [0.38, 0.25], [0.45, 0.6], [0.38, 1.0], [0.24, 1.15], [0.27, 1.22], [0.001, 1.22]], 12));
const bowlP = (Q, m = 'glaze_green') => Q.add(m, ly([[0.001, 0], [0.05, 0], [0.11, 0.06], [0.12, 0.09], [0.1, 0.09], [0.001, 0.03]], 8));
/** A table w × d × h of painted wood. */
const table = (Q, w, d, h, m = 'wood_painted') => {
  Q.add(m, box(-w / 2, h - 0.05, -d / 2, w / 2, h, d / 2));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) Q.add('wood_dark', box(sx * (w / 2 - 0.1) - 0.04, 0, sz * (d / 2 - 0.1) - 0.04, sx * (w / 2 - 0.1) + 0.04, h - 0.05, sz * (d / 2 - 0.1) + 0.04));
};
/** A couch (kline): frame, mattress, bolster at the head (−x end). */
const kline = (Q, w = 1.9, d = 0.8, c = 'cloth_red') => {
  Q.add('wood_dark', box(-w / 2, 0.18, -d / 2, w / 2, 0.38, d / 2));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) Q.add('wood_dark', box(sx * (w / 2 - 0.08) - 0.04, 0, sz * (d / 2 - 0.08) - 0.04, sx * (w / 2 - 0.08) + 0.04, 0.18, sz * (d / 2 - 0.08) + 0.04));
  Q.add(c, box(-w / 2 + 0.03, 0.38, -d / 2 + 0.03, w / 2 - 0.03, 0.5, d / 2 - 0.03));
  Q.add('cloth_white', box(-w / 2 + 0.03, 0.5, -d / 2 + 0.05, -w / 2 + 0.3, 0.66, d / 2 - 0.05));
};
const chest = (Q, w = 0.9, d = 0.5, h = 0.55) => { Q.add('wood_dark', box(-w / 2, 0, -d / 2, w / 2, h, d / 2)); Q.add('iron', box(-w / 2 - 0.01, 0.12, -0.04, w / 2 + 0.01, 0.2, 0.04)); Q.add('iron', box(-0.06, h - 0.2, -d / 2 - 0.01, 0.06, h - 0.08, -d / 2 + 0.02)); };
const stool = (Q, h = 0.45) => { Q.add('timber', box(-0.18, h - 0.05, -0.18, 0.18, h, 0.18)); for (const sx of [-1, 1]) for (const sz of [-1, 1]) Q.add('wood_dark', box(sx * 0.13 - 0.025, 0, sz * 0.13 - 0.025, sx * 0.13 + 0.025, h - 0.05, sz * 0.13 + 0.025)); };
const bench = (Q, w = 1.8, h = 0.45) => { Q.add('timber', box(-w / 2, h - 0.06, -0.17, w / 2, h, 0.17)); for (const s of [-1, 1]) Q.add('wood_dark', box(s * (w / 2 - 0.15) - 0.04, 0, -0.14, s * (w / 2 - 0.15) + 0.04, h - 0.06, 0.14)); };
const lampstand = (Q, h = 1.5) => { Q.add('bronze', ly([[0.14, 0], [0.12, 0.05], [0.04, 0.12], [0.03, h - 0.1], [0.1, h - 0.05], [0.12, h]], 10)); Q.add('flame', ly([[0.001, h], [0.035, h + 0.04], [0.001, h + 0.14]], 6)); };
const brazier = (Q) => { Q.add('iron', ly([[0.05, 0], [0.16, 0.38], [0.3, 0.52], [0.26, 0.54], [0.001, 0.46]], 10)); Q.add('flame', ly([[0.001, 0.5], [0.2, 0.5], [0.12, 0.62], [0.001, 0.68]], 8)); for (const a of [0, 2.1, 4.2]) Q.add('iron', rod([Math.cos(a) * 0.2, 0.44, Math.sin(a) * 0.2], [Math.cos(a) * 0.3, 0, Math.sin(a) * 0.3], 0.018, 5)); };
/** An icon on a wall (face −z): a painted panel in a gilt frame, the halo in gold. */
const icon = (Q, w = 0.55, h = 0.75) => { Q.add('gilt_bronze', box(-w / 2 - 0.05, 0, -0.03, w / 2 + 0.05, h + 0.1, 0.03)); Q.add('paint_blue', box(-w / 2, 0.05, -0.04, w / 2, h + 0.05, 0.035)); Q.add('mosaic_gold', ly([[0.001, 0], [0.16, 0]], 12).rotateX(Math.PI / 2).translate(0, h * 0.68, -0.05)); Q.add('cloth_maroon', box(-w * 0.28, 0.1, -0.05, w * 0.28, h * 0.5, -0.04)); Q.add('skin_light', box(-0.06, h * 0.55, -0.05, 0.06, h * 0.62, -0.04)); };
const shelves = (Q, w, h = 2.0, rows = 4) => { for (const s of [-1, 1]) Q.add('wood_dark', box(s * w / 2 - 0.03, 0, -0.18, s * w / 2 + 0.03, h, 0.18)); const ys = []; for (let i = 0; i < rows; i++) { const y = 0.25 + i * (h - 0.3) / (rows - 1); ys.push(y); Q.add('timber', box(-w / 2, y - 0.03, -0.18, w / 2, y, 0.18)); } return ys; };

/** A wall run a→b (thickness th, y0…y1) with openings [{ s0, s1, y0, y1 }] (distances from a). */
function wallRun(bag, col, a, b, th, y0, y1, mat, ops = []) {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]), u = [(b[0] - a[0]) / L, (b[1] - a[1]) / L], at = (s) => [a[0] + u[0] * s, a[1] + u[1] * s];
  const piece = (s0, s1, ya, yb) => { if (s1 - s0 < 1e-3 || yb - ya < 1e-3) return; bag.add(mat, orientedBox(at(s0), at(s1), th, ya, yb)); col.segment(at(s0), at(s1), th, ya, yb); };
  let s = 0;
  for (const o of [...ops].sort((p, q) => p.s0 - q.s0)) {
    piece(s, o.s0, y0, y1); if (o.y0 > y0) piece(o.s0, o.s1, y0, o.y0); piece(o.s0, o.s1, o.y1, y1); s = o.s1;
  }
  piece(s, L, y0, y1);
}
/** Stair rising toward `dir` ('s': toward +z) across rect from y0 to y1, treads of timber on a stone core. */
function stair(bag, col, rect, y0, y1, dir, mat = 'timber') {
  const [x0, z0, x1, z1] = rect, n = Math.round((y1 - y0) / 0.18);
  for (let i = 0; i < n; i++) {
    const f0 = i / n, f1 = (i + 1) / n, yt = y0 + (y1 - y0) * f1;
    const r = dir === 's' ? [x0, z0 + (z1 - z0) * f0, x1, z1] : dir === 'n' ? [x0, z0, x1, z1 - (z1 - z0) * f0] : dir === 'e' ? [x0 + (x1 - x0) * f0, z0, x1, z1] : [x0, z0, x1 - (x1 - x0) * f0, z1];
    bag.add(mat, box(r[0], y0 - 0.01, r[1], r[2], yt, r[3]));
    void f1;
  }
  col.ramp(rect, y0, y1, dir);
}
const pushLight = (ctx, at, intensity = 5, distance = 8) => ctx.lights?.push({ at, color: '#ffb46b', intensity, distance });

/** The ground floor's west half of a working house by its trade (the east half, the store and the stair, stay): a cook-shop (popina) with
 * benches, a counter, a hearth and wine jars; a bakery with its dome oven, kneading trough and bread racks; a weaver's with two looms. */
function trade(ctx, V, { x0, z0, x1, z1, Y0, zc, th }) {
  const { bag, col } = ctx, bk = (r, h) => col.rect(r, Y0, Y0 + h);
  const rand = rng(x0 * 31 + z0);
  if (V === 'tavern') {
    for (const [dx, dz] of [[2.3, 3.3], [2.3, 7.4], [5.6, 3.3], [5.6, 7.4]]) {
      put(bag, (Q) => table(Q, 1.6, 0.8, 0.78), x0 + dx + 0.5, Y0, z0 + dz); bk([x0 + dx - 0.4, z0 + dz - 0.5, x0 + dx + 1.4, z0 + dz + 0.5], 0.8);
      put(bag, bench, x0 + dx + 0.5, Y0, z0 + dz - 0.75, 0, 1.6); put(bag, bench, x0 + dx + 0.5, Y0, z0 + dz + 0.75, 0, 1.6);
      put(bag, (Q) => { bowlP(Q, 'glaze_white'); }, x0 + dx + 0.2, Y0 + 0.78, z0 + dz); put(bag, (Q) => bowlP(Q, 'glaze_green'), x0 + dx + 0.9, Y0 + 0.78, z0 + dz + 0.1);
    }
    put(bag, (Q) => { Q.add('wood_painted', box(-1.6, 0, -0.35, 1.6, 1.0, 0.35)); Q.add('marble', box(-1.65, 1.0, -0.4, 1.65, 1.05, 0.4)); for (let a = -1.3; a < 1.4; a += 0.5) Q.add(a < 0 ? 'terracotta' : 'glaze_green', ly([[0.04, 1.05], [0.1, 1.15], [0.1, 1.3], [0.001, 1.38]], 8).translate(a, 0, 0)); }, x0 + 6.0, Y0, z1 - 2.4);
    bk([x0 + 4.3, z1 - 2.85, x0 + 7.7, z1 - 1.95], 1.1);
    for (const a of [0.6, 1.4, 2.2]) { put(bag, pithos, x0 + a + 0.6, Y0, z0 + th + 0.55); bk([x0 + a + 0.15, z0 + th + 0.1, x0 + a + 1.05, z0 + th + 1.0], 1.2); }
    put(bag, (Q) => { Q.add('brick', box(-0.8, 0, -0.5, 0.8, 0.8, 0.5)); Q.add('iron', box(-0.5, 0.8, -0.3, 0.5, 0.86, 0.3)); Q.add('flame', box(-0.3, 0.86, -0.15, 0.3, 0.92, 0.15)); }, x0 + 1.6, Y0, zc + 3.0); bk([x0 + 0.8, zc + 2.5, x0 + 2.4, zc + 3.5], 0.9);
    put(bag, lampstand, x0 + 4.0, Y0, zc - 0.4, 0, 1.8); pushLight(ctx, [x0 + 4.0, Y0 + 2.0, zc - 0.4], 4, 9);
    put(bag, icon, x0 + 4.2, Y0 + 1.5, z0 + th + 0.04, Math.PI, 0.6, 0.8);
  } else if (V === 'bakery') {
    put(bag, (Q) => { Q.add('brick', box(-1.1, 0, -1.0, 1.1, 0.95, 1.0)); Q.add('brick', ly([[1.0, 0.95], [0.9, 1.5], [0.5, 1.95], [0.001, 2.1]], 12)); Q.add('opening', box(-0.35, 1.05, -1.05, 0.35, 1.5, -0.9)); Q.add('flame', box(-0.3, 1.05, -0.95, 0.3, 1.2, -0.85)); }, x0 + 2.6, Y0, z0 + th + 1.3, 0.0); bk([x0 + 1.5, z0 + th + 0.3, x0 + 3.7, z0 + th + 2.3], 2.1);
    put(bag, (Q) => { Q.add('wood_dark', box(-0.9, 0.55, -0.4, 0.9, 0.62, 0.4)); Q.add('wood_dark', box(-0.95, 0.5, -0.45, -0.88, 0.95, 0.45)); Q.add('wood_dark', box(0.88, 0.5, -0.45, 0.95, 0.95, 0.45)); for (const s of [-1, 1]) for (const t of [-1, 1]) Q.add('wood_dark', box(s * 0.8 - 0.05, 0, t * 0.3 - 0.05, s * 0.8 + 0.05, 0.55, t * 0.3 + 0.05)); Q.add('linen', box(-0.7, 0.62, -0.3, 0.1, 0.7, 0.3)); }, x0 + 6.2, Y0, z0 + th + 1.2); bk([x0 + 5.2, z0 + th + 0.6, x0 + 7.2, z0 + th + 1.8], 0.95);
    put(bag, (Q) => table(Q, 2.2, 0.9, 0.85), x0 + 4.6, Y0, zc + 0.4); bk([x0 + 3.4, zc - 0.1, x0 + 5.8, zc + 0.9], 0.9);
    for (let i = 0; i < 6; i++) put(bag, (Q) => { Q.add('wicker', ly([[0.001, 0], [0.17, 0.02], [0.2, 0.08], [0.001, 0.12]], 10)); }, x0 + 3.8 + (i % 3) * 0.7, Y0 + 0.85, zc + 0.2 + Math.floor(i / 3) * 0.4);
    put(bag, (Q) => { const ys = shelves(Q, 2.0, 2.0, 4); for (const yy of ys) for (let a = -0.8; a < 0.9; a += 0.3) Q.add('wicker', ly([[0.001, 0], [0.12, 0.02], [0.14, 0.07], [0.001, 0.1]], 8).translate(a, yy, 0)); }, x0 + 2.2, Y0, z1 - th - 0.25, Math.PI); bk([x0 + 1.1, z1 - th - 0.5, x0 + 3.3, z1 - th], 2.0);
    for (const a of [-0.3, 0.3, 0.9]) put(bag, (Q) => Q.add('sacking', box(-0.3, 0, -0.2, 0.3, 0.7, 0.2)), x0 + 0.9 + a, Y0, zc + 3.3 + a * 0.3);
    put(bag, lampstand, x0 + 4.0, Y0, z1 - 1.2, 0, 1.6); pushLight(ctx, [x0 + 4.0, Y0 + 1.9, z1 - 1.2], 3.5, 8);
  } else if (V === 'potter') {
    // a kiln (a brick beehive with its stoke-hole), a kick-wheel with a stool, shelves of ware drying and fired, clay in sacks, a water jar
    put(bag, (Q) => { Q.add('brick', box(-1.2, 0, -1.2, 1.2, 1.1, 1.2)); Q.add('brick', ly([[1.15, 1.1], [1.0, 1.7], [0.6, 2.2], [0.001, 2.45]], 14)); Q.add('opening', box(-0.35, 0.25, -1.25, 0.35, 0.85, -1.15)); Q.add('flame', box(-0.3, 0.3, -1.2, 0.3, 0.45, -1.12)); Q.add('iron', box(-0.08, 2.3, -0.08, 0.08, 2.6, 0.08)); }, x0 + 2.0, Y0, z0 + th + 1.4, 0.0); bk([x0 + 0.8, z0 + th + 0.2, x0 + 3.2, z0 + th + 2.6], 2.4);
    put(bag, (Q) => { Q.add('wood_dark', box(-0.3, 0, -0.3, 0.3, 0.06, 0.3)); Q.add('timber', ly([[0.04, 0.06], [0.04, 0.62]], 6)); Q.add('terracotta', ly([[0.001, 0.62], [0.3, 0.62], [0.3, 0.68], [0.001, 0.68]], 14)); Q.add('terracotta', ly([[0.001, 0.4], [0.32, 0.4], [0.3, 0.46], [0.001, 0.46]], 14)); Q.add('terracotta', ly([[0.12, 0.68], [0.17, 0.78], [0.14, 0.9], [0.09, 0.92], [0.001, 0.9]], 10)); }, x0 + 5.6, Y0, z0 + 3.2); bk([x0 + 5.2, z0 + 2.8, x0 + 6.0, z0 + 3.6], 0.9);
    put(bag, stool, x0 + 5.6, Y0, z0 + 4.1);
    for (const dx of [2.0, 6.2]) put(bag, (Q) => { const ys = shelves(Q, 1.8, 2.0, 4); for (const yy of ys) for (let a = -0.7; a < 0.8; a += 0.3) Q.add(rand() < 0.5 ? 'terracotta' : 'glaze_green', ly([[0.001, 0], [0.07, 0], [0.1, 0.1], [0.07, 0.2], [0.001, 0.2]], 8).translate(a, yy, 0)); }, x0 + dx, Y0, z1 - th - 0.25, Math.PI), bk([x0 + dx - 0.9, z1 - th - 0.5, x0 + dx + 0.9, z1 - th], 2.0);
    for (const a of [0, 0.7, 1.4]) { put(bag, (Q) => Q.add('sacking', box(-0.3, 0, -0.2, 0.3, 0.7, 0.2)), x0 + 0.9 + a, Y0, zc + 1.0); } bk([x0 + 0.5, zc + 0.7, x0 + 3.0, zc + 1.3], 0.7);
    put(bag, pithos, x0 + 7.4, Y0, z0 + th + 0.7); bk([x0 + 6.9, z0 + th + 0.2, x0 + 7.9, z0 + th + 1.2], 1.2);
    put(bag, table, x0 + 4.8, Y0, zc + 0.9, 0, 2.0, 0.9, 0.8); bk([x0 + 3.8, zc + 0.4, x0 + 5.8, zc + 1.4], 0.8);
    for (let i = 0; i < 5; i++) put(bag, (Q) => bowlP(Q, i % 2 ? 'glaze_white' : 'glaze_green'), x0 + 4.0 + i * 0.35, Y0 + 0.8, zc + 0.9);
    put(bag, lampstand, x0 + 4.0, Y0, z1 - 1.2, 0, 1.6); pushLight(ctx, [x0 + 4.0, Y0 + 1.9, z1 - 1.2], 3.5, 8);
  } else if (V === 'smith') {
    // a forge (a brick hearth with a hood, bellows, a glowing bed), an anvil on its stump, a quenching trough, tools on the wall, charcoal in sacks, bars of iron stacked
    put(bag, (Q) => { Q.add('brick', box(-1.1, 0, -0.9, 1.1, 0.9, 0.9)); Q.add('iron', box(-0.8, 0.9, -0.6, 0.8, 0.95, 0.6)); Q.add('flame', box(-0.5, 0.95, -0.35, 0.5, 1.05, 0.35)); Q.add('brick', box(-0.8, 0.95, 0.45, 0.8, 2.6, 0.9)); Q.add('brick', box(-0.55, 2.6, 0.5, 0.55, 3.4, 0.85)); Q.add('iron', box(-0.8, 2.0, -0.6, 0.8, 2.08, 0.45)); Q.add('iron', box(-0.8, 1.2, -0.6, -0.72, 2.08, 0.45)); Q.add('iron', box(0.72, 1.2, -0.6, 0.8, 2.08, 0.45)); }, x0 + 2.0, Y0, z0 + th + 1.0, 0.0); bk([x0 + 0.9, z0 + th + 0.1, x0 + 3.1, z0 + th + 1.9], 3.4);
    put(bag, (Q) => { Q.add('wood_dark', box(-0.4, 0.2, -0.2, 0.4, 0.5, 0.2)); Q.add('cloth_brown', box(-0.38, 0.5, -0.18, 0.38, 0.6, 0.18)); Q.add('iron', rod([0.4, 0.4, 0], [0.9, 0.3, 0], 0.04, 6)); }, x0 + 4.0, Y0, z0 + th + 0.9, 0.0); bk([x0 + 3.5, z0 + th + 0.5, x0 + 4.9, z0 + th + 1.3], 0.7);
    put(bag, (Q) => { Q.add('timber', ly([[0.3, 0], [0.28, 0.7], [0.001, 0.7]], 8)); Q.add('iron', box(-0.35, 0.7, -0.12, 0.35, 0.85, 0.12)); Q.add('iron', box(-0.2, 0.85, -0.09, 0.2, 0.93, 0.09)); Q.add('iron', box(0.35, 0.78, -0.04, 0.6, 0.85, 0.04)); }, x0 + 4.6, Y0, zc - 0.6); bk([x0 + 4.1, zc - 0.9, x0 + 5.1, zc - 0.3], 0.95);
    put(bag, (Q) => { Q.add('wood_dark', box(-0.6, 0, -0.25, 0.6, 0.6, 0.25)); Q.add('water', box(-0.52, 0.55, -0.17, 0.52, 0.58, 0.17)); }, x0 + 6.6, Y0, zc - 0.2); bk([x0 + 6.0, zc - 0.45, x0 + 7.2, zc + 0.05], 0.65);
    put(bag, (Q) => { for (let a = -0.9; a < 1.0; a += 0.3) Q.add('iron', rod([a, 0.2, 0], [a + 0.05, 1.3 + (a * 7 % 3) * 0.1, 0.05], 0.025, 5)); Q.add('wood_dark', box(-1.0, 1.55, -0.04, 1.0, 1.62, 0.04)); }, x0 + 4.4, Y0, z0 + th + 0.1, 0.0);
    for (const a of [0, 0.6, 1.2]) put(bag, (Q) => Q.add('sacking', box(-0.3, 0, -0.2, 0.3, 0.7, 0.2)), x0 + 0.9 + a, Y0, z1 - th - 0.4); bk([x0 + 0.5, z1 - th - 0.7, x0 + 2.4, z1 - th - 0.1], 0.7);
    for (let i = 0; i < 6; i++) put(bag, (Q) => Q.add('iron', box(-0.5, 0, -0.04, 0.5, 0.05, 0.04)), x0 + 7.0, Y0 + i * 0.05, z1 - th - 0.5 - (i % 2) * 0.01); bk([x0 + 6.5, z1 - th - 0.7, x0 + 7.5, z1 - th - 0.3], 0.3);
    pushLight(ctx, [x0 + 2.0, Y0 + 1.6, z0 + th + 1.5], 5, 9);
  } else {   // weaver
    for (const [dx, dz] of [[2.6, 2.2], [6.2, 2.2]]) {
      put(bag, (Q) => { for (const s of [-1, 1]) Q.add('timber', box(s * 0.8 - 0.06, 0, -0.06, s * 0.8 + 0.06, 1.9, 0.06)); Q.add('timber', box(-0.86, 1.8, -0.08, 0.86, 1.9, 0.08)); Q.add('timber', box(-0.86, 0.9, -0.08, 0.86, 0.96, 0.08)); for (let a = -0.7; a < 0.75; a += 0.07) Q.add('cloth_white', box(a - 0.008, 0.96, -0.02, a + 0.008, 1.8, 0.02)); Q.add(rand() < 0.5 ? 'cloth_red' : 'cloth_indigo', box(-0.7, 0.96, -0.03, 0.7, 1.15, 0.03)); }, x0 + dx, Y0, z0 + dz);
      bk([x0 + dx - 0.9, z0 + dz - 0.2, x0 + dx + 0.9, z0 + dz + 0.2], 1.9); put(bag, stool, x0 + dx, Y0, z0 + dz + 0.9);
    }
    put(bag, (Q) => { for (const [i, c] of ['cloth_red', 'cloth_indigo', 'cloth_ochre', 'cloth_green', 'cloth_maroon', 'cloth_white'].entries()) Q.add(c, box(-0.4 + (i % 3) * 0.5 - 0.2, Math.floor(i / 3) * 0.3, -0.35, -0.4 + (i % 3) * 0.5 + 0.2, Math.floor(i / 3) * 0.3 + 0.28, 0.35)); }, x0 + 4.4, Y0, zc + 3.2); bk([x0 + 3.5, zc + 2.7, x0 + 5.3, zc + 3.8], 0.6);
    put(bag, (Q) => table(Q, 2.4, 1.0, 0.85), x0 + 4.2, Y0, zc + 0.9); bk([x0 + 3.0, zc + 0.4, x0 + 5.4, zc + 1.4], 0.9);
    for (const [i, a] of [0, 0.5, 1.0, 1.5].entries()) put(bag, (Q) => Q.add(['cloth_red', 'cloth_indigo', 'cloth_ochre', 'cloth_green'][i], ly([[0.001, 0.85], [0.07, 0.86], [0.1, 0.95], [0.001, 1.0]], 8)), x0 + 3.4 + a, Y0, zc + 0.9);
    put(bag, (Q) => { for (let i = 0; i < 3; i++) Q.add('terracotta', ly([[0.2, i * 0.5], [0.34, i * 0.5 + 0.25], [0.3, i * 0.5 + 0.5]], 10).translate(0, 0, 0)); }, x0 + 1.1, Y0, z1 - 1.2);   // the dye jars
    put(bag, (Q) => { Q.add('pottery_dark', ly([[0.3, 0], [0.5, 0.4], [0.5, 0.75], [0.001, 0.75]], 12)); Q.add('cloth_indigo', ly([[0.001, 0.7], [0.45, 0.7]], 12)); }, x0 + 1.2, Y0, z1 - 2.6); bk([x0 + 0.6, z1 - 3.2, x0 + 1.8, z1 - 2.0], 0.8);
    put(bag, lampstand, x0 + 4.0, Y0, z1 - 1.0, 0, 1.7); pushLight(ctx, [x0 + 4.0, Y0 + 2.0, z1 - 1.0], 3.5, 8);
  }
}

/** The rules a house is drawn by, from its seed (shared with the walk routes of its way up). */
export function homeRules(el) {
  const [x0, , x1] = el.rect;
  const sd = rng((el.seed || 1) * 7919 + 17), pk = (a) => a[Math.floor(sd() * a.length)];
  const wall = el.wall ?? pk(['brick', 'brick', 'plaster', 'stucco_warm']), doorK = pk(['arch', 'lintel', 'pilasters']), galK = el.gallery ?? pk(['open', 'closed', 'rail', 'open']);
  const banded = wall === 'brick' && sd() < 0.7, upperM = wall === 'brick' ? pk(['plaster', 'stucco_warm', 'brick']) : wall;
  const dc = x0 + (x1 - x0) * (0.22 + 0.09 * sd());
  return { sd, wall, doorK, galK, banded, upperM, dc };
}
/** The walk-check routes up a house (street, door, store, stair, hall, rooms, maenianum; the roof terrace) in world coordinates. */
export function homeWalks(el) {
  const r = homeRules(el);
  return upWalks({ x0: el.rect[0], z0: el.rect[1], dc: r.dc, variant: el.variant || 'home', kind: el.up, y: el.y ?? 0 });
}

// ── the house you can enter ───────────────────────────────────────────────────
/**
 * byz_home: { rect (about 18 × 13), y, seed } — an enterable two-storey house: the door in the south wall under a
 * lintel; at the west a dining room (triclinium) with the sigma table, three couches, a brazier, a lamp, an icon; at
 * the east a store with pithoi and shelves and the stair (timber, rising to the south) to the upper floor with a
 * bedroom (bed, chest, loom), a dayroom and the maenianum gallery over the street (walkable). Beamed ceilings,
 * tiled hip roof. The door's step is 0.2 m.
 */
function home(el, ctx) {
  const { bag, col } = ctx, [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, Y0 = y + 0.2, H1 = 3.7, Yf = Y0 + H1 + 0.3, H2 = 3.1, th = 0.6;
  // the house's own rules (each is drawn from its seed): the wall's skin, the door's frame and place, the kind of gallery, the roof's pitch
  const { sd, wall, doorK, galK, banded, upperM, dc } = homeRules(el);
  const xp = x0 + (x1 - x0) * 0.5, xs = x1 - 2.1, zs1 = z0 + 6.8;
  const UP = el.up, TERR = UP && hasTerrace(UP);
  bag.add('flagstone', box(x0, y - 0.4, z0, x1, Y0, z1)); col.floor([x0 + th, z0 + th, x1 - th, z1 - th], Y0);
  bag.add('limestone', box(dc - 1.0, y - 0.1, z1, dc + 1.0, Y0 - 0.02, z1 + 0.7)); col.floor([dc - 1.0, z1, dc + 1.0, z1 + 0.7], Y0 - 0.02);
  // ground-floor walls
  const dr = { s0: dc - x0 - 0.7 + th / 2 - th / 2, s1: dc - x0 + 0.7, y0: Y0, y1: Y0 + 2.6 }, wn = (c, w = 0.5, ya = 1.7, yb = 2.7) => ({ s0: c - w, s1: c + w, y0: Y0 + ya, y1: Y0 + yb });
  wallRun(bag, col, [x0, z1 - th / 2], [x1, z1 - th / 2], th, y - 0.3, Yf, wall, [{ ...dr, s0: dc - x0 - 0.7, s1: dc - x0 + 0.7 }, wn(xp - x0 + 1.5, 0.4, 1.6, 2.6), wn(x1 - x0 - 3.2, 0.4, 1.6, 2.6)]);
  wallRun(bag, col, [x0, z0 + th / 2], [x1, z0 + th / 2], th, y - 0.3, Yf + H2, wall, [wn(3, 0.4), wn(10, 0.4), wn(14, 0.4)].map((o) => ({ ...o })));
  wallRun(bag, col, [x0 + th / 2, z0], [x0 + th / 2, z1], th, y - 0.3, Yf + H2, wall, [wn(6.5, 0.45, 1.5, 2.6)]);
  wallRun(bag, col, [x1 - th / 2, z0], [x1 - th / 2, z1], th, y - 0.3, Yf + H2, wall, [wn(5, 0.4, 1.5, 2.6)]);
  wallRun(bag, col, [xp, z0 + th], [xp, z1 - th], 0.4, Y0, Yf, wall, [{ s0: 5.0, s1: 6.2, y0: Y0, y1: Y0 + 2.5 }]);   // the partition, a door in it
  // upper walls south, with the gallery door-windows and windows
  wallRun(bag, col, [x0 + th, z1 - th / 2], [x1 - th, z1 - th / 2], th, Yf, Yf + H2, upperM, [{ s0: 2.2, s1: 3.6, y0: Yf, y1: Yf + 2.5 }, { s0: 5.2, s1: 6.2, y0: Yf + 0.9, y1: Yf + 2.4 }, { s0: 8.3, s1: 9.7, y0: Yf, y1: Yf + 2.5 }, { s0: 11.7, s1: 12.7, y0: Yf + 0.9, y1: Yf + 2.4 }]);
  // inside faces of the upper south wall seen from the room: the wall's own; the ground-floor south wall is brick to Yf
  // the floor between the storeys: beams and boards, the stair's hole
  for (const r of subtractRects([x0 + th, z0 + th, x1 - th, z1 - th], [[xs - (UP ? 0.4 : 0), z0 + th, x1 - th, zs1]])) { bag.add('timber', box(r[0], Yf - 0.3, r[1], r[2], Yf - 0.02, r[3])); bag.add('wood_ochre', box(r[0], Yf - 0.02, r[1], r[2], Yf, r[3])); col.floor(r, Yf); }
  for (let x = x0 + 1.5; x < x1 - 1; x += 1.5) bag.add('wood_dark', box(x - 0.1, Yf - 0.55, z0 + th, x + 0.1, Yf - 0.3, z1 - th));
  stair(bag, col, [xs, z0 + th, x1 - th, zs1], Y0, Yf, 's');
  // the ceiling and the roof
  if (!TERR) bag.add('ceiling_painted', box(x0 + th, Yf + H2 - 0.1, z0 + th, x1 - th, Yf + H2, z1 - th));
  for (let x = x0 + 1.5; x < x1 - 1; x += 1.5) { if (TERR && x + 0.1 > x0 + STAIR2.u0 && x - 0.1 < x0 + STAIR2.u1) continue; bag.add('wood_dark', box(x - 0.1, Yf + H2 - 0.35, z0 + th, x + 0.1, Yf + H2 - 0.1, z1 - th)); }
  const ov = 0.7, rise = 2.5 + sd() * 1.0;
  if (!TERR) bag.add('roof_tile', frustum([x0 - ov, z0 - ov, x1 + ov, z1 + 1.9 + ov], Yf + H2, Yf + H2 + rise, (x1 - x0) * 0.14, (x1 - x0) * 0.14, (z1 - z0 + 1.9) / 2 + ov - 0.05, (z1 - z0 + 1.9) / 2 + ov - 0.05, { noBottom: true }));
  // the front's dressing by rule: a plinth, the door's frame (arch, lintel or pilasters), lintels and sills at the windows, courses of travertine
  { const f = 0.12, dx0 = dc - 0.7, dx1 = dc + 0.7, face = (u0, u1, ya, yb, d, mat) => bag.add(mat, box(u0, ya, z1, u1, yb, z1 + d));
    const seg = (ya, yb, d, mat, avoid = [[dx0 - 0.4, dx1 + 0.4]]) => { let a = x0; for (const [g0, g1] of [...avoid, [x1 + 1, x1 + 2]]) { if (g0 > a) face(a, Math.min(g0, x1), ya, yb, d, mat); a = Math.max(a, g1); } };
    seg(y - 0.3, Y0 + 0.45, 0.08, 'limestone');
    if (banded) for (const yy of [Y0 + 1.0, Y0 + 3.1]) seg(yy, yy + 0.12, 0.04, 'travertine');
    seg(Yf - 0.95, Yf - 0.8, 0.1, 'limestone', [[x0 + 100, x0 + 101]]);
    for (const s2 of [-1, 1]) face(s2 < 0 ? dx0 - 0.32 : dx1, s2 < 0 ? dx0 : dx1 + 0.32, y - 0.1, Y0 + 2.6, f + 0.04, 'limestone');
    if (doorK === 'arch') {
      const N = 10, Q = [], r0 = 0.7, r1 = 1.02, ys = Y0 + 2.6, P = (k, r) => [dc + r * Math.cos(Math.PI * k / N), ys + r * Math.sin(Math.PI * k / N), z1 + 0.04];
      for (let k = 0; k < N; k++) { const a0 = P(k, r0), b0 = P(k, r1), b1 = P(k + 1, r1), a1 = P(k + 1, r0); Q.push(...a0, ...b0, ...b1, ...a0, ...b1, ...a1); }
      bag.add('limestone', fromTriangles(Q));
    } else if (doorK === 'lintel') { face(dx0 - 0.4, dx1 + 0.4, Y0 + 2.6, Y0 + 2.88, f + 0.06, 'limestone'); face(dx0 - 0.5, dx1 + 0.5, Y0 + 2.88, Y0 + 3.04, f + 0.16, 'marble'); }
    else { face(dx0 - 0.4, dx1 + 0.4, Y0 + 2.6, Y0 + 3.0, f + 0.06, 'limestone'); face(dx0 - 0.6, dx1 + 0.6, Y0 + 3.0, Y0 + 3.16, f + 0.2, 'marble'); for (const s2 of [-1, 1]) face(s2 < 0 ? dx0 - 0.5 : dx1 + 0.32, s2 < 0 ? dx0 - 0.32 : dx1 + 0.5, y - 0.1, Y0 + 2.6, f + 0.1, 'marble'); }
    for (const c of [xp - x0 + 1.5, x1 - x0 - 3.2]) { face(x0 + c - 0.55, x0 + c + 0.55, Y0 + 1.7 - 0.14, Y0 + 1.7, 0.2, 'limestone'); face(x0 + c - 0.55, x0 + c + 0.55, Y0 + 2.6, Y0 + 2.78, 0.16, 'limestone'); }
  }
  // the maenianum over the street, of one of three kinds: an open gallery on posts under a lean-to, a closed timber box with shuttered windows, or a corbelled balcony with an iron rail
  { const ga = x0 + 1.2, gb = x1 - 1.2, d = galK === 'rail' ? 1.2 : galK === 'closed' ? 1.5 : 1.8, brk = galK === 'open' ? 1.5 : 1.2;
    for (let x = ga + 0.3; x < gb - 0.2; x += brk) bag.add('limestone', box(x - 0.13, Yf - 0.6, z1, x + 0.13, Yf - 0.1, z1 + d - 0.1));
    bag.add('timber', box(ga, Yf - 0.1, z1, gb, Yf, z1 + d)); col.floor([ga, z1, gb, z1 + d], Yf);
    if (galK === 'open') {
      const np = Math.round((gb - ga) / 1.7);
      for (let i = 0; i <= np; i++) { const x = ga + 0.08 + i * (gb - ga - 0.16) / np; bag.add('timber', box(x - 0.07, Yf, z1 + d - 0.2, x + 0.07, Yf + 2.55, z1 + d - 0.06)); col.circle(x, z1 + d - 0.13, 0.1, Yf, Yf + 2.55); }
      for (let i = 0; i < np; i++) { const u0 = ga + 0.08 + i * (gb - ga - 0.16) / np, u1 = u0 + (gb - ga - 0.16) / np; bag.add('timber', box(u0 + 0.07, Yf + 0.95, z1 + d - 0.2, u1 - 0.07, Yf + 1.03, z1 + d - 0.08)); for (let b = u0 + 0.25; b < u1 - 0.1; b += 0.2) bag.add('timber', box(b - 0.025, Yf, z1 + d - 0.16, b + 0.025, Yf + 0.95, z1 + d - 0.1)); }
      bag.add('timber', box(ga - 0.1, Yf + 2.55, z1, gb + 0.1, Yf + 2.7, z1 + d + 0.1));
      bag.add('roof_tile', solid8([[ga - 0.3, Yf + 3.2, z1 - 0.0], [gb + 0.3, Yf + 3.2, z1], [gb + 0.3, Yf + 2.7, z1 + d + 0.4], [ga - 0.3, Yf + 2.7, z1 + d + 0.4], [ga - 0.3, Yf + 3.34, z1], [gb + 0.3, Yf + 3.34, z1], [gb + 0.3, Yf + 2.84, z1 + d + 0.4], [ga - 0.3, Yf + 2.84, z1 + d + 0.4]]));
    } else if (galK === 'closed') {
      // a timber-framed box: boards, a shuttered window to each bay, a pent roof; its ends walled up to the roof's underside
      const nwin = Math.max(2, Math.floor((gb - ga) / 2.4)), sw = (gb - ga) / nwin, tt = 0.16, ops = [];
      for (let i = 0; i < nwin; i++) { const c = (i + 0.5) * sw; ops.push({ s0: c - 0.5, s1: c + 0.5, y0: Yf + 0.85, y1: Yf + 2.05 }); }
      wallRun(bag, col, [ga, z1 + d - tt / 2], [gb, z1 + d - tt / 2], tt, Yf, Yf + 2.7, 'wood_ochre', ops);
      for (let i = 0; i < nwin; i++) { const c = ga + (i + 0.5) * sw; for (const s2 of [-1, 1]) bag.add('shutter_brown', box(s2 < 0 ? c - 0.74 : c + 0.5, Yf + 0.85, z1 + d, s2 < 0 ? c - 0.5 : c + 0.74, Yf + 2.05, z1 + d + 0.05)); bag.add('timber', box(c - 0.55, Yf + 0.75, z1 + d, c + 0.55, Yf + 0.85, z1 + d + 0.12)); }
      for (const xe of [ga, gb - tt]) bag.add('wood_ochre', solid8([[xe, Yf, z1], [xe + tt, Yf, z1], [xe + tt, Yf, z1 + d], [xe, Yf, z1 + d], [xe, Yf + 2.96, z1], [xe + tt, Yf + 2.96, z1], [xe + tt, Yf + 2.7, z1 + d], [xe, Yf + 2.7, z1 + d]])), col.rect([xe, z1, xe + tt, z1 + d], Yf, Yf + 2.7);
      bag.add('roof_tile', solid8([[ga - 0.3, Yf + 2.95, z1], [gb + 0.3, Yf + 2.95, z1], [gb + 0.3, Yf + 2.62, z1 + d + 0.35], [ga - 0.3, Yf + 2.62, z1 + d + 0.35], [ga - 0.3, Yf + 3.1, z1], [gb + 0.3, Yf + 3.1, z1], [gb + 0.3, Yf + 2.77, z1 + d + 0.35], [ga - 0.3, Yf + 2.77, z1 + d + 0.35]]));
    } else {
      for (let u = ga + 0.05; u < gb - 0.2; u += 0.3) { bag.add('iron', box(u, Yf, z1 + d - 0.07, u + 0.05, Yf + 1.0, z1 + d - 0.02)); }
      bag.add('iron', box(ga, Yf + 1.0, z1 + d - 0.08, gb, Yf + 1.06, z1 + d)); bag.add('iron', box(ga, Yf, z1 + d - 0.08, ga + 0.05, Yf + 1.06, z1 + d)); bag.add('iron', box(gb - 0.05, Yf, z1 + d - 0.08, gb, Yf + 1.06, z1 + d));
      col.rect([ga, z1 + d - 0.08, gb, z1 + d], Yf, Yf + 1.06);
      for (const xe of [ga, gb - 0.05]) col.rect([xe, z1, xe + 0.05, z1 + d], Yf, Yf + 1.06);
    }
  }
  // furnishing: the dining room (west), the store (east), upstairs
  const zc = (z0 + z1) / 2;
  const V = el.variant || 'home';
  if (V === 'home') {
  put(bag, (Q) => { Q.add('marble_smooth', lathe([[0.001, 0.72], [1.15, 0.72], [1.15, 0.78], [0.001, 0.78]], 24)); Q.add('wood_dark', ly([[0.2, 0], [0.12, 0.3], [0.14, 0.7], [0.001, 0.7]], 10)); bowlP(Q); }, x0 + 5.5, Y0, zc + 0.2);
  for (const [a, r] of [[-0.9, 0], [0.9, 0.0], [Math.PI, 0]]) {
    void r; const cx = x0 + 5.5 + Math.cos(a - Math.PI / 2) * 2.1, cz = zc + 0.2 + Math.sin(a - Math.PI / 2) * 2.1;
    put(bag, (Q) => kline(Q, 1.9, 0.8, a === Math.PI ? 'cloth_maroon' : 'cloth_green'), cx, Y0, cz, -(a - Math.PI / 2) + Math.PI / 2);
  }
  col.circle(x0 + 5.5, zc + 0.2, 1.1, Y0, Y0 + 0.8);
  put(bag, brazier, x0 + 1.5, Y0, z0 + 1.7); col.circle(x0 + 1.5, z0 + 1.7, 0.35, Y0, Y0 + 0.6);
  put(bag, lampstand, x0 + 1.4, Y0, zc + 3.4, 0, 1.6); put(bag, icon, x0 + 4.2, Y0 + 1.4, z0 + th + 0.04, Math.PI, 0.7, 0.9);
  put(bag, (Q) => Q.add('cloth_maroon', box(-1.1, 0, -0.03, 1.1, 2.4, 0.03)), x0 + 5.5, Y0 + 0.0, z0 + th + 0.06);
  pushLight(ctx, [x0 + 1.4, Y0 + 1.9, zc + 3.4], 4, 9);
  } else trade(ctx, V, { x0, z0, x1, z1, Y0, zc, th, y });
  for (const [dx, dz] of [[1.2, 1.4], [2.4, 1.0], [3.5, 2.0]]) { put(bag, pithos, xp + dx, Y0, z0 + th + 0.7 + dz * 0.8); col.circle(xp + dx, z0 + th + 0.7 + dz * 0.8, 0.45, Y0, Y0 + 1.2); }
  put(bag, (Q) => { const ys = shelves(Q, 1.8, 2.0, 4); for (const yy of ys.slice(0, 3)) for (let a = -0.7; a < 0.8; a += 0.45) amphora(Q, 0.5), void a; }, xp + 2.0, Y0, z1 - th - 0.3, Math.PI);
  put(bag, amphora, xp + 1.0, Y0, z1 - 1.0, 0, 1.2);
  put(bag, (Q) => { Q.add('brick', box(-0.7, 0, -0.5, 0.7, 0.9, 0.5)); Q.add('flame', box(-0.3, 0.9, -0.2, 0.3, 0.97, 0.2)); }, x0 + 8.2, Y0, z1 - 1.3, 0); col.rect([x0 + 7.5, z1 - 1.8, x0 + 8.9, z1 - 0.8], Y0, Y0 + 0.9);
  // upstairs: the single room of the houses whose floor is not laid out (el.up unset), else the rooms of upper.js
  if (UP) {
    const K = { put, kline, table, chest, stool, bench, lampstand, brazier, icon, shelves, pithos, amphora, bowlP, wallRun, ly, solid8, pushLight, stair };
    const G = { x0, z0, x1, z1, Yf, H2, kind: UP, seed: el.seed || 1, variant: V, upperM };
    upperFloor(ctx, G, K);
    if (TERR) terrace(ctx, G, K);
  } else {
  put(bag, (Q) => { Q.add('wood_dark', box(-0.55, 0.2, -1.0, 0.55, 0.45, 1.0)); Q.add('cloth_white', box(-0.5, 0.45, -0.95, 0.5, 0.6, 0.95)); Q.add('cloth_indigo', box(-0.52, 0.55, -0.1, 0.52, 0.62, 0.95)); Q.add('cloth_white', box(-0.4, 0.6, -0.9, 0.4, 0.72, -0.5)); }, x0 + 2.2, Yf, z0 + 3.0);
  col.rect([x0 + 1.6, z0 + 2.0, x0 + 2.8, z0 + 4.0], Yf, Yf + 0.6);
  put(bag, chest, x0 + 4.5, Yf, z0 + 1.1, 0.1); put(bag, chest, x0 + 8.5, Yf, z0 + 1.1, 0);
  col.rect([x0 + 4.0, z0 + th, x0 + 5.0, z0 + th + 1.0], Yf, Yf + 0.55);
  put(bag, (Q) => { for (const s of [-1, 1]) Q.add('timber', box(s * 0.8 - 0.05, 0, -0.1, s * 0.8 + 0.05, 1.9, 0.1)); Q.add('timber', box(-0.85, 1.8, -0.1, 0.85, 1.9, 0.1)); for (let a = -0.7; a < 0.75; a += 0.08) Q.add('cloth_white', box(a - 0.01, 0.4, 0.0, a + 0.01, 1.8, 0.02)); Q.add('cloth_ochre', box(-0.7, 0.2, 0.05, 0.7, 0.8, 0.16)); }, x0 + 8.5, Yf, z0 + 5.5, 0);
  col.rect([x0 + 7.6, z0 + 5.3, x0 + 9.4, z0 + 5.8], Yf, Yf + 1.9);
  put(bag, (Q) => table(Q, 1.2, 0.7, 0.75), xp + 1.6, Yf, z1 - 2.0); put(bag, bench, xp + 1.6, Yf, z1 - 2.9);
  col.rect([xp + 1.0, z1 - 2.35, xp + 2.2, z1 - 1.65], Yf, Yf + 0.75);
  put(bag, icon, xp + 3.0, Yf + 1.3, z1 - th - 0.04, 0, 0.5, 0.7);
  put(bag, lampstand, x0 + 1.2, Yf, z1 - 1.3, 0, 1.5); pushLight(ctx, [x0 + 1.2, Yf + 1.8, z1 - 1.3], 3.5, 8);
  }
}


Object.assign(STYLES.roman.elements, { cn_home: home });
export { home };
