// The interiors of Justinian's Constantinople (docs/settlements/constantinople.md §12): the furnished shops
// behind the Mese's porticoes, a house you can walk into (a dining room with its sigma table and couches, a
// store with its jars and the stair, a bedroom, the maenianum gallery over the street), a neighbourhood
// chapel (nave, aisles on columns, templon, altar under a ciborium, ambo, a gold half-dome) and a small
// public bath (dressing hall, warm room, hot room with its plunge pool). Registered into the `roman` style.

import { Matrix4 } from '../../core/three.js';
import { STYLES, orientedBox, subtractRects } from '../../core/build.js';
import { box, frustum, lathe, rod, disc } from '../../core/geom.js';
import { spherePatch, arcSolid } from './index.js';
import { solid8, rng } from './houses.js';
import '../roman/town.js';
import '../../objects/index.js';

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

// ── the shop's fitting ────────────────────────────────────────────────────────
const TRADES = ['grocer', 'cloth', 'potter', 'silver', 'cook', 'painter'];
/**
 * The frame of the k-th shop of a stoa (Mese: augustaion.js `stoa`): a world point of local (a across, b from the door's plane inward),
 * the yaw that turns a builder (front −z) to face the street, the width and depth of the room, and the floor.
 */
export function shopFrame(st, k, ns) {
  const [ax, az] = st.a, [bx, bz] = st.b, L = Math.hypot(bx - ax, bz - az), u = [(bx - ax) / L, (bz - az) / L], side = st.side ?? 1, D = st.depth ?? 5, Sd = st.shops ?? 5;
  const sw = L / ns, c = (k + 0.5) * sw, f1 = D + 0.6, yaw = Math.atan2(-u[1], u[0]) + (side < 0 ? Math.PI : 0);
  const W = (a, b) => { const s = c + a * side, t = (f1 + b) * side; return [ax + s * u[0] - t * u[1], az + s * u[1] + t * u[0]]; };
  return { W, yaw, sw, depth: Sd - 0.6 - 0.6, y: (st.y ?? 0) + 0.18, trade: null };
}
/** byz_shopfit: { st (the stoa), k, ns, trade, seed } — the counter, shelves with the trade's goods, a lamp. */
function shopFit(el, ctx) {
  const { bag, col } = ctx, rand = rng(el.seed || 1), F = shopFrame(el.st, el.k, el.ns), trade = el.trade, y = F.y;
  const hw = F.sw / 2 - 0.55, bd = F.depth - 0.15;
  const at = (build, a, b, yw = 0, up = 0, ...args) => { const p = F.W(a, b); put(bag, build, p[0], y + up, p[1], F.yaw + yw, ...args); };
  const blk = (a0, b0, a1, b1, h) => { const p = F.W(a0, b0), q = F.W(a1, b1); col.rect([Math.min(p[0], q[0]), Math.min(p[1], q[1]), Math.max(p[0], q[0]), Math.max(p[1], q[1])], y, y + h); };
  const goods = (Q, y0, w) => {
    for (let a = -w / 2 + 0.2; a < w / 2 - 0.1; a += 0.3) {
      if (trade === 'cloth') Q.add(['cloth_red', 'cloth_indigo', 'cloth_ochre', 'cloth_green', 'cloth_white', 'cloth_maroon'][Math.floor(rand() * 6)], box(a - 0.12, y0, -0.14, a + 0.12, y0 + 0.3, 0.14));
      else if (trade === 'silver') { Q.add('silver', ly([[0.001, 0], [0.06, 0], [0.09, 0.1], [0.001, 0.1]], 8).translate(a, y0, 0)); }
      else if (trade === 'painter') Q.add(['paint_blue', 'cloth_maroon', 'mosaic_gold'][Math.floor(rand() * 3)], box(a - 0.1, y0, -0.03, a + 0.1, y0 + 0.28, 0.03));
      else if (trade === 'potter') Q.add(['glaze_green', 'glaze_white', 'terracotta'][Math.floor(rand() * 3)], ly([[0.001, 0], [0.08, 0], [0.11, 0.1], [0.08, 0.2], [0.001, 0.2]], 8).translate(a, y0, 0));
      else Q.add('terracotta', ly([[0.04, 0], [0.1, 0.1], [0.12, 0.2], [0.001, 0.3]], 8).translate(a, y0, 0));
    }
  };
  // shelves along the back wall (two bays), the counter just inside the door on one side
  const nb = F.sw > 4 ? 2 : 1, wb = Math.min(1.9, (hw * 2) / nb - 0.1);
  for (let i = 0; i < nb; i++) {
    const a = nb === 1 ? 0 : (i ? 1 : -1) * (wb / 2 + 0.05);
    at((Q) => { const ys = shelves(Q, wb, 2.0, 4); for (const yy of ys) goods(Q, yy, wb); }, a, bd - 0.2, Math.PI);
    blk(a - wb / 2, bd - 0.4, a + wb / 2, bd, 2.0);
  }
  const cs = rand() < 0.5 ? -1 : 1;
  at((Q) => { Q.add('wood_painted', box(-0.95, 0, -0.3, 0.95, 0.95, 0.3)); Q.add('marble', box(-1.0, 0.95, -0.34, 1.0, 1.0, 0.34)); }, cs * (hw - 0.95), 0.7);
  blk(cs * (hw - 0.95) - 1.0, 0.35, cs * (hw - 0.95) + 1.0, 1.05, 1.0);
  // on the counter: the steelyard and weights, a lamp, a bowl; by the trade: jars, a bench, bolts
  at((Q) => { Q.add('bronze', rod([-0.25, 0.25, 0], [0.45, 0.25, 0], 0.012, 5)); Q.add('bronze', rod([0, 0.25, 0], [0, 0.55, 0], 0.012, 5)); Q.add('bronze', ly([[0.001, 0], [0.08, 0], [0.001, 0.07]], 8).translate(-0.3, 0.05, 0)); }, cs * (hw - 0.95) - 0.3, 0.7, 0, 1.0);
  at(lampstand, cs * (hw - 0.95) + 0.65, 0.65, 0, 1.0, 0.35);
  if (trade === 'grocer' || trade === 'cook') { for (const a of [-hw + 0.45, -hw + 1.05, hw - 0.45]) { at(pithos, a, bd - 0.6); blk(a - 0.4, bd - 1.0, a + 0.4, bd - 0.2, 1.2); } at(amphora, hw - 1.0, bd - 0.5, 0, 0, 1.2); }
  else if (trade === 'potter') for (let i = 0; i < 6; i++) at((Q) => bowlP(Q, i % 2 ? 'glaze_white' : 'glaze_green'), -hw + 0.4 + i * 0.28, 1.2, 0, 0.0);
  else at(chest, -cs * (hw - 0.6), 1.6, 0.3);
  at(stool, -cs * (hw - 0.4), 2.2, rand() * 6);
  at(lampstand, 0, bd - 0.25, 0, 0, 1.9);
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
  const { bag, col } = ctx, [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, Y0 = y + 0.2, H1 = 3.7, Yf = Y0 + H1 + 0.3, H2 = 3.1, th = 0.6, wall = 'brick';
  const xp = x0 + (x1 - x0) * 0.5, xs = x1 - 2.1, zs1 = z0 + 6.8, dc = x0 + (x1 - x0) * 0.27;
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
  wallRun(bag, col, [x0 + th, z1 - th / 2], [x1 - th, z1 - th / 2], th, Yf, Yf + H2, 'plaster', [{ s0: 2.2, s1: 3.6, y0: Yf, y1: Yf + 2.5 }, { s0: 5.2, s1: 6.2, y0: Yf + 0.9, y1: Yf + 2.4 }, { s0: 8.3, s1: 9.7, y0: Yf, y1: Yf + 2.5 }, { s0: 11.7, s1: 12.7, y0: Yf + 0.9, y1: Yf + 2.4 }]);
  // inside faces of the upper south wall seen from the room: the wall's own; the ground-floor south wall is brick to Yf
  // the floor between the storeys: beams and boards, the stair's hole
  for (const r of subtractRects([x0 + th, z0 + th, x1 - th, z1 - th], [[xs, z0 + th, x1 - th, zs1]])) { bag.add('timber', box(r[0], Yf - 0.3, r[1], r[2], Yf - 0.02, r[3])); bag.add('wood_ochre', box(r[0], Yf - 0.02, r[1], r[2], Yf, r[3])); col.floor(r, Yf); }
  for (let x = x0 + 1.5; x < x1 - 1; x += 1.5) bag.add('wood_dark', box(x - 0.1, Yf - 0.55, z0 + th, x + 0.1, Yf - 0.3, z1 - th));
  stair(bag, col, [xs, z0 + th, x1 - th, zs1], Y0, Yf, 's');
  // the ceiling and the roof
  bag.add('ceiling_painted', box(x0 + th, Yf + H2 - 0.1, z0 + th, x1 - th, Yf + H2, z1 - th));
  for (let x = x0 + 1.5; x < x1 - 1; x += 1.5) bag.add('wood_dark', box(x - 0.1, Yf + H2 - 0.35, z0 + th, x + 0.1, Yf + H2 - 0.1, z1 - th));
  const ov = 0.7, rise = 3.0;
  bag.add('roof_tile', frustum([x0 - ov, z0 - ov, x1 + ov, z1 + 1.9 + ov], Yf + H2, Yf + H2 + rise, (x1 - x0) * 0.14, (x1 - x0) * 0.14, (z1 - z0 + 1.9) / 2 + ov - 0.05, (z1 - z0 + 1.9) / 2 + ov - 0.05, { noBottom: true }));
  // the maenianum gallery over the street: brackets, floor, posts, rail, lean-to roof
  { const ga = x0 + 1.2, gb = x1 - 1.2, d = 1.8;
    for (let x = ga + 0.3; x < gb - 0.2; x += 1.5) bag.add('limestone', box(x - 0.13, Yf - 0.6, z1, x + 0.13, Yf - 0.1, z1 + d - 0.1));
    bag.add('timber', box(ga, Yf - 0.1, z1, gb, Yf, z1 + d)); col.floor([ga, z1, gb, z1 + d], Yf);
    const np = Math.round((gb - ga) / 1.7);
    for (let i = 0; i <= np; i++) { const x = ga + 0.08 + i * (gb - ga - 0.16) / np; bag.add('timber', box(x - 0.07, Yf, z1 + d - 0.2, x + 0.07, Yf + 2.55, z1 + d - 0.06)); col.circle(x, z1 + d - 0.13, 0.1, Yf, Yf + 2.55); }
    for (let i = 0; i < np; i++) { const u0 = ga + 0.08 + i * (gb - ga - 0.16) / np, u1 = u0 + (gb - ga - 0.16) / np; bag.add('timber', box(u0 + 0.07, Yf + 0.95, z1 + d - 0.2, u1 - 0.07, Yf + 1.03, z1 + d - 0.08)); for (let b = u0 + 0.25; b < u1 - 0.1; b += 0.2) bag.add('timber', box(b - 0.025, Yf, z1 + d - 0.16, b + 0.025, Yf + 0.95, z1 + d - 0.1)); }
    bag.add('timber', box(ga - 0.1, Yf + 2.55, z1, gb + 0.1, Yf + 2.7, z1 + d + 0.1));
    bag.add('roof_tile', solid8([[ga - 0.3, Yf + 3.2, z1 - 0.0], [gb + 0.3, Yf + 3.2, z1], [gb + 0.3, Yf + 2.7, z1 + d + 0.4], [ga - 0.3, Yf + 2.7, z1 + d + 0.4], [ga - 0.3, Yf + 3.34, z1], [gb + 0.3, Yf + 3.34, z1], [gb + 0.3, Yf + 2.84, z1 + d + 0.4], [ga - 0.3, Yf + 2.84, z1 + d + 0.4]]));
  }
  // furnishing: the dining room (west), the store (east), upstairs
  const zc = (z0 + z1) / 2;
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
  for (const [dx, dz] of [[1.2, 1.4], [2.4, 1.0], [3.5, 2.0]]) { put(bag, pithos, xp + dx, Y0, z0 + th + 0.7 + dz * 0.8); col.circle(xp + dx, z0 + th + 0.7 + dz * 0.8, 0.45, Y0, Y0 + 1.2); }
  put(bag, (Q) => { const ys = shelves(Q, 1.8, 2.0, 4); for (const yy of ys.slice(0, 3)) for (let a = -0.7; a < 0.8; a += 0.45) amphora(Q, 0.5), void a; }, xp + 2.0, Y0, z1 - th - 0.3, Math.PI);
  put(bag, amphora, xp + 1.0, Y0, z1 - 1.0, 0, 1.2);
  put(bag, (Q) => { Q.add('brick', box(-0.7, 0, -0.5, 0.7, 0.9, 0.5)); Q.add('flame', box(-0.3, 0.9, -0.2, 0.3, 0.97, 0.2)); }, x0 + 8.2, Y0, z1 - 1.3, 0); col.rect([x0 + 7.5, z1 - 1.8, x0 + 8.9, z1 - 0.8], Y0, Y0 + 0.9);
  // upstairs
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

// ── the chapel ────────────────────────────────────────────────────────────────
/**
 * byz_chapel: { rect (about 19 × 17), y } — a neighbourhood church of the 6th century: narthex on the west, a nave of
 * five bays with an aisle each side on columns of verde antico, a chancel screen (templon) of silver-capped columns
 * and marble parapets with a door, the altar under a ciborium, an ambo, an apse with a half-dome of gold mosaic
 * and a cross, revetted lower walls, a painted ceiling, a gable of tiles; three doors in the west.
 */
function chapel(el, ctx) {
  const { bag, col } = ctx, [lx0, lz0, lx1, lz1] = el.rect, y = el.y ?? 0, Y0 = y + 0.25, zc = (lz0 + lz1) / 2;
  const x0 = lx0 + 0.5, x1 = lx1 - 3.6, hw = 5.5, z0 = zc - hw, z1 = zc + hw, th = 0.8, H = 7.4, Yc = Y0 + 6.2, r = 2.7, xa = x1;
  bag.add('opus_sectile', box(x0, y - 0.4, z0, x1, Y0, z1)); col.floor([x0 + th, z0 + th, x1, z1 - th], Y0);
  bag.add('opus_sectile', box(x1, y - 0.4, zc - r, x1 + r, Y0, zc + r)); col.floor([x1, zc - r + 0.4, x1 + r - 0.5, zc + r - 0.4], Y0);
  const ops = (cs, w, ya, yb) => cs.map((c) => ({ s0: c - w / 2, s1: c + w / 2, y0: Y0 + ya, y1: Y0 + yb }));
  const wins = [3.4, 6.4, 9.4, 12.4];
  wallRun(bag, col, [x0, z0 + th / 2], [x1, z0 + th / 2], th, y - 0.3, Y0 + H, 'brick', ops(wins.map((w) => w), 0.9, 3.2, 5.6));
  wallRun(bag, col, [x0, z1 - th / 2], [x1, z1 - th / 2], th, y - 0.3, Y0 + H, 'brick', ops(wins, 0.9, 3.2, 5.6));
  wallRun(bag, col, [x0 + th / 2, z0], [x0 + th / 2, z1], th, y - 0.3, Y0 + H, 'brick', [{ s0: hw - 0.9 - 2.6, s1: hw - 0.9 - 0.8, y0: Y0, y1: Y0 + 2.7 }, { s0: hw - 0.9, s1: hw + 0.9, y0: Y0, y1: Y0 + 3.4 }, { s0: hw + 0.9 + 0.8, s1: hw + 0.9 + 2.6, y0: Y0, y1: Y0 + 2.7 }]);
  bag.add('timber', box(x0 - 0.05, Y0 + 3.4, zc - 1.0, x0 + th + 0.05, Y0 + 3.6, zc + 1.0));
  // the apse: a wall round the half circle, the half-dome inside, a window each side
  bag.add('brick', arcSolid(xa, zc, r, r + th, -90, 90, y - 0.3, Y0 + H, 4));
  for (let a = -90; a < 90; a += 12) { const p = (q) => [xa + (r + th / 2) * Math.cos(q * Math.PI / 180), zc + (r + th / 2) * Math.sin(q * Math.PI / 180)]; col.segment(p(a), p(a + 12), th, y, Y0 + H); }
  bag.add('mosaic_gold', spherePatch({ c: [xa, Y0 + 4.2, zc], R: r, e0: 0, e1: 90, a0: -90, a1: 90, segA: 36, segE: 12, inward: true }));
  bag.add('revetment_byz', arcSolid(xa, zc, r - 0.04, r, -90, 90, Y0, Y0 + 3.0, 8));
  bag.add('marble_smooth', arcSolid(xa, zc, r - 0.12, r - 0.04, -90, 90, Y0 + 3.0, Y0 + 3.2, 8));
  bag.add('gold', box(xa + r - 0.14, Y0 + 3.4, zc - 0.07, xa + r - 0.06, Y0 + 4.4, zc + 0.07)); bag.add('gold', box(xa + r - 0.14, Y0 + 3.9, zc - 0.4, xa + r - 0.06, Y0 + 4.05, zc + 0.4));
  // the east wall's arch over the chancel into the apse: the wall above the apse's springing, the gable
  bag.add('brick', box(x1 - th, Y0 + 4.2, z0, x1, Y0 + H, z1)); col.rect([x1 - th, z0, x1, zc - r], y, Y0 + H); col.rect([x1 - th, zc + r, x1, z1], y, Y0 + H);
  bag.add('brick', box(x1 - th, Y0 + 3.2, z0 + th, x1, Y0 + 4.2, zc - r)); bag.add('brick', box(x1 - th, Y0 + 3.2, zc + r, x1, Y0 + 4.2, z1 - th));
  // the nave's arcades: columns and the beam over them, the aisles' lower ceilings carried to the wall
  const colX = []; for (let i = 0; i < 5; i++) colX.push(x0 + 3.6 + i * 2.8);
  for (const sz of [-1, 1]) for (const cx of colX) STYLES.byzantine.column({ at: [cx, zc + sz * 2.3], y: Y0, h: 3.6, d: 0.55, shaftMat: 'verde_antico', capMat: 'marble_smooth' }, ctx);
  for (const sz of [-1, 1]) { bag.add('marble', box(colX[0] - 0.4, Y0 + 3.6, zc + sz * 2.3 - 0.3, colX[4] + 0.4, Y0 + 4.2, zc + sz * 2.3 + 0.3)); bag.add('revetment_byz', box(colX[0] - 0.4, Y0 + 4.2, zc + sz * 2.3 - 0.2, colX[4] + 0.4, Y0 + 5.9, zc + sz * 2.3 + 0.2)); }
  // the revetment of the walls to 3 m, the painted ceiling, the roof
  for (const [a, b, c, d] of [[x0 + th, z0 + th, x1 - th, z0 + th + 0.04], [x0 + th, z1 - th - 0.04, x1 - th, z1 - th], [x0 + th, z0 + th, x0 + th + 0.04, z1 - th]]) bag.add('revetment_byz', box(a, Y0, b, c, Y0 + 3.0, d));
  bag.add('ceiling_painted', box(x0 + th, Yc, z0 + th, x1 - th, Yc + 0.15, z1 - th));
  for (let x = x0 + 1.4; x < x1; x += 1.4) bag.add('timber', box(x - 0.12, Yc - 0.3, z0 + th, x + 0.12, Yc, z1 - th));
  bag.add('plaster', box(x0 + th, Y0 + 3.0, z0 + th, x1 - th, Yc - 0.3, z0 + th + 0.03)); bag.add('plaster', box(x0 + th, Y0 + 3.0, z1 - th - 0.03, x1 - th, Yc - 0.3, z1 - th));
  bag.add('roof_tile', frustum([x0 - 0.7, z0 - 0.7, x1 + 0.7, z1 + 0.7], Y0 + H, Y0 + H + 3.2, 0.3, 0.3, hw + 0.7 - 0.05, hw + 0.7 - 0.05, { noBottom: true }));
  bag.add('roof_tile', lathe([[r + th + 0.5, 0], [r + th + 0.1, 0.8], [0.2, 2.4]], 16, null, xa, Y0 + H - 0.9, zc).rotateY(0));
  // the templon: six columns with silver capitals, marble parapets, a door, the architrave with a cross, curtains
  const tx = colX[3] + 1.4, tz0 = zc - 3.8, tz1 = zc + 3.8, nT = 6;
  for (let i = 0; i <= nT; i++) { const z = tz0 + i * (tz1 - tz0) / nT; STYLES.byzantine.column({ at: [tx, z], y: Y0, h: 3.0, d: 0.32, shaftMat: 'proconnesian', capMat: 'silver', impost: false }, ctx); }
  for (let i = 0; i < nT; i++) { if (i === 2) continue; const a = tz0 + i * (tz1 - tz0) / nT + 0.17, b = tz0 + (i + 1) * (tz1 - tz0) / nT - 0.17; bag.add('revetment_green', box(tx - 0.08, Y0, a, tx + 0.08, Y0 + 1.0, b)); col.segment([tx, a], [tx, b], 0.16, Y0, Y0 + 1.0); }
  bag.add('silver', box(tx - 0.2, Y0 + 3.0, tz0 - 0.2, tx + 0.2, Y0 + 3.4, tz1 + 0.2)); bag.add('gold', box(tx - 0.22, Y0 + 3.4, zc - 0.07, tx + 0.22, Y0 + 4.0, zc + 0.07)); bag.add('gold', box(tx - 0.22, Y0 + 3.6, zc - 0.3, tx + 0.22, Y0 + 3.75, zc + 0.3));
  for (const z of [zc - 0.5, zc + 0.5]) bag.add('cloth_maroon', box(tx - 0.03, Y0 + 1.0, z - 0.42, tx + 0.03, Y0 + 2.95, z + 0.42));
  for (let i = 0; i < nT; i++) if (i !== 2) { const zz = tz0 + (i + 0.5) * (tz1 - tz0) / nT; put(bag, (Q) => icon(Q, 0.5, 0.65), tx - 0.1, Y0 + 1.15, zz, Math.PI / 2 * 0 + Math.PI); }
  col.rect([tx - 0.5, tz0 - 0.3, tx + 0.5, zc - 0.5], Y0, Y0 + 4); col.rect([tx - 0.5, zc + 0.5, tx + 0.5, tz1 + 0.3], Y0, Y0 + 4); col.rect([tx - 0.02, zc - 0.5, tx + 0.02, zc + 0.5], Y0 + 3.0, Y0 + 4);
  // the altar under its ciborium, the bishop's seat in the apse, an ambo in the nave, lamps
  STYLES.byzantine.objects.ciborium({ at: [x1 - 1.6, zc], y: Y0, s: 1.1, h: 3.2 }, ctx);
  bag.add('marble', box(xa - 0.2, Y0, zc - 0.5, xa + 1.4, Y0 + 0.9, zc + 0.5)); col.rect([xa - 0.2, zc - 0.5, xa + 1.4, zc + 0.5], Y0, Y0 + 0.9);
  bag.add('marble_smooth', arcSolid(xa, zc, r - 0.9, r - 0.12, -70, 70, Y0, Y0 + 0.4, 8)); bag.add('marble_smooth', arcSolid(xa, zc, r - 1.6, r - 0.9, -70, 70, Y0, Y0 + 0.2, 8));
  put(bag, (Q) => { Q.add('marble', box(-0.6, 0, -0.5, 0.6, 1.2, 0.5)); Q.add('marble_smooth', box(-0.7, 1.2, -0.6, 0.7, 1.3, 0.6)); Q.add('gold', box(-0.1, 1.3, -0.04, 0.1, 1.45, 0.04)); }, colX[1], Y0, zc - 1.1); col.rect([colX[1] - 0.7, zc - 1.7, colX[1] + 0.7, zc - 0.5], Y0, Y0 + 1.3);
  stair(bag, col, [colX[1] - 0.7, zc - 2.0 + 0.4, colX[1] + 0.7, zc - 1.7 + 0.4], Y0, Y0 + 0.0 + 0.5, 's', 'marble');
  for (const [cx, sz] of [[colX[0], -1], [colX[2], 1], [colX[3] - 1.0, -1]]) { put(bag, lampstand, cx, Y0, zc + sz * 3.9, 0, 1.9); }
  STYLES.byzantine.objects.polykandelon({ at: [colX[2], zc], y: Y0 + 4.7, r: 0.8, n: 12, top: Yc, light: 6, distance: 12 }, ctx);
  pushLight(ctx, [xa - 0.6, Y0 + 2.4, zc], 6, 10);
  for (const [cx, sz] of [[colX[1], 1], [colX[4], -1]]) put(bag, bench, cx, Y0, zc + sz * 3.7, Math.PI / 2 * 0);
  // the narthex and the west door's step; a stoup
  bag.add('limestone', box(x0 - 1.2, y - 0.1, zc - 1.3, x0, Y0 - 0.02, zc + 1.3)); col.floor([x0 - 1.2, zc - 1.3, x0, zc + 1.3], Y0 - 0.02);
  put(bag, (Q) => Q.add('marble', ly([[0.2, 0], [0.12, 0.25], [0.2, 0.9], [0.001, 0.9]], 12)), x0 + 1.2, Y0, zc - 3.6); col.circle(x0 + 1.2, zc - 3.6, 0.22, Y0, Y0 + 0.9);
}

// ── the small bath ────────────────────────────────────────────────────────────
/**
 * byz_bath: { rect (about 15 × 17), y } — a neighbourhood public bath: from the street (south) the dressing hall (benches,
 * niches for clothes, a fountain), the warm room (marble benches), the hot room with a plunge pool, a basin (labrum)
 * and the furnace's glow behind; a brick mass with high arched windows, a dome over the hot room.
 */
function bath(el, ctx) {
  const { bag, col } = ctx, [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, Y0 = y + 0.2, th = 0.7, H = 6.0, xm = (x0 + x1) / 2;
  const zA = z1 - 7.0, zB = zA - 5.0;
  bag.add('opus_sectile', box(x0, y - 0.4, z0, x1, Y0, z1)); col.floor([x0 + th, z0 + th, x1 - th, z1 - th], Y0);
  const high = (cs) => cs.map((c) => ({ s0: c - 0.5, s1: c + 0.5, y0: Y0 + 3.4, y1: Y0 + 5.0 }));
  wallRun(bag, col, [x0, z1 - th / 2], [x1, z1 - th / 2], th, y - 0.3, Y0 + H, 'brick', [{ s0: xm - x0 - 1.0, s1: xm - x0 + 1.0, y0: Y0, y1: Y0 + 2.7 }, ...high([2.5, x1 - x0 - 2.5])]);
  wallRun(bag, col, [x0, z0 + th / 2], [x1, z0 + th / 2], th, y - 0.3, Y0 + H + 1.5, 'brick', []);
  wallRun(bag, col, [x0 + th / 2, z0], [x0 + th / 2, z1], th, y - 0.3, Y0 + H + 0.8, 'brick', [...high([z1 - z0 - 3.5, z1 - z0 - 9.5])].map((o) => ({ ...o })));
  wallRun(bag, col, [x1 - th / 2, z0], [x1 - th / 2, z1], th, y - 0.3, Y0 + H + 0.8, 'brick', [...high([z1 - z0 - 3.5, z1 - z0 - 9.5])].map((o) => ({ ...o })));
  for (const z of [zA, zB]) wallRun(bag, col, [x0 + th, z], [x1 - th, z], 0.5, Y0, Y0 + H, 'brick', [{ s0: (x1 - x0) / 2 - th - 0.9, s1: (x1 - x0) / 2 - th + 0.9, y0: Y0, y1: Y0 + 2.5 }]);
  bag.add('timber', box(x0 + th, Y0 + H - 0.2, z0 + th, x1 - th, Y0 + H, z1 - th));
  bag.add('roof_tile', frustum([x0 - 0.5, zA - 0.5, x1 + 0.5, z1 + 0.5], Y0 + H, Y0 + H + 2.4, 0.2, 0.2, (z1 - zA) / 2 + 0.45, (z1 - zA) / 2 + 0.45, { noBottom: true }));
  bag.add('brick', box(x0 - 0.1, Y0 + H, zB, x1 + 0.1, Y0 + H + 0.8, zA)); bag.add('brick', box(x0 - 0.1, Y0 + H, z0, x1 + 0.1, Y0 + H + 1.5, zB)); col.floor([x0 - 0.1, zB, x1 + 0.1, zA], Y0 + H + 0.8);
  bag.add('dome_stucco', lathe([[4.2, 0], [4.0, 0.8], [3.3, 1.9], [2.2, 2.8], [1.0, 3.3], [0.001, 3.45]], 24, null, xm, Y0 + H + 1.5, (z0 + zB) / 2));
  bag.add('brick', lathe([[4.6, 0], [4.6, 0.3]], 24, null, xm, Y0 + H + 1.4, (z0 + zB) / 2));
  // dressing hall: benches along both side walls, niches, a basin
  for (const sx of [-1, 1]) for (const z of [z1 - 2.8, z1 - 5.0]) { put(bag, (Q) => bench(Q, 2.4), sx < 0 ? x0 + th + 0.4 : x1 - th - 0.4, Y0, z, Math.PI / 2); col.rect([sx < 0 ? x0 + th : x1 - th - 0.8, z - 1.2, sx < 0 ? x0 + th + 0.8 : x1 - th, z + 1.2], Y0, Y0 + 0.45); }
  for (const sx of [-1, 1]) for (const z of [z1 - 2.5, z1 - 4.0, z1 - 5.5]) bag.add('wood_dark', box(sx < 0 ? x0 + th : x1 - th - 0.1, Y0 + 1.1, z - 0.3, sx < 0 ? x0 + th + 0.1 : x1 - th, Y0 + 2.2, z + 0.3));
  STYLES.byzantine.objects.phiale({ at: [xm, z1 - 3.4], y: Y0, r: 0.9 }, ctx);
  // warm room: marble benches, a sunk floor of tesserae
  for (const sx of [-1, 1]) { bag.add('marble', box(sx < 0 ? x0 + th : x1 - th - 0.7, Y0, zB + 0.8, sx < 0 ? x0 + th + 0.7 : x1 - th, Y0 + 0.5, zA - 0.8)); col.rect([sx < 0 ? x0 + th : x1 - th - 0.7, zB + 0.8, sx < 0 ? x0 + th + 0.7 : x1 - th, zA - 0.8], Y0, Y0 + 0.5); }
  // hot room: the plunge pool, the labrum, the furnace
  const zh = (z0 + zB) / 2;
  bag.add('marble_smooth', box(x0 + th, Y0, z0 + th, x0 + th + 3.4, Y0 + 0.7, z0 + th + 3.0)); bag.add('water', box(x0 + th + 0.3, Y0 + 0.5, z0 + th + 0.3, x0 + th + 3.1, Y0 + 0.52, z0 + th + 2.7)); col.rect([x0 + th, z0 + th, x0 + th + 3.4, z0 + th + 3.0], Y0, Y0 + 0.7);
  bag.add('marble', lathe([[0.001, 0], [0.4, 0], [0.5, 0.5], [0.9, 0.95], [0.82, 1.0], [0.001, 0.8]], 18, null, xm, Y0, zh + 1.2)); col.circle(xm, zh + 1.2, 0.9, Y0, Y0 + 1.0);
  for (const sx of [-1, 1]) { bag.add('marble', box(sx < 0 ? x0 + th : x1 - th - 0.7, Y0, zB - 3.8, sx < 0 ? x0 + th + 0.7 : x1 - th, Y0 + 0.5, zB - 0.8)); col.rect([sx < 0 ? x0 + th : x1 - th - 0.7, zB - 3.8, sx < 0 ? x0 + th + 0.7 : x1 - th, zB - 0.8], Y0, Y0 + 0.5); }
  bag.add('flame', box(x1 - th - 0.6, Y0 + 0.2, zh - 0.5, x1 - th - 0.4, Y0 + 0.8, zh + 0.5)); pushLight(ctx, [x1 - th - 1.0, Y0 + 1.0, zh], 4, 8);
}

Object.assign(STYLES.roman.elements, { byz_shopfit: shopFit, byz_home: home, byz_chapel: chapel, byz_bath: bath });
export { TRADES, Parts, put };
void disc;
