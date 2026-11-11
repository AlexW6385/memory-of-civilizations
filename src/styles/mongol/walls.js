// Karakorum's walls, gates and the houses of its quarters (docs/settlements/mongol-karakorum.md §3, §6): the rammed-earth
// town wall with its four gates [stated: Rubruck: a mud wall and four gates], the brick wall of the palace compound, courtyard houses of
// sun-dried brick (the Saracen quarter), the mosques, the Nestorian church, rows of shops.
import { rectRoof } from '../ming/index.js';
import { box, rod, lathe, obox, rng, TAU } from './util.js';
import { frustum, fromTriangles, orientOutward, addCloth, clothBox } from '../../core/geom.js';
import { wallRun, podium } from './hall.js';

const EARTH = 'earth_wall';
const R4 = (a, b) => [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])];

/**
 * earth_wall: a run of the town wall, axis-aligned, a→b: rammed earth, battered, th at the foot, 3 m wide on top, h high; the walk on top, an outer
 * parapet of merlons, rain-gullies, rammed layers shown as pale courses. { a, b, h, th }
 */
export function earthWall(el, { bag, col }) {
  const [a, b] = [el.a, el.b], h = el.h ?? 5.8, th = el.th ?? 5, inset = (th - 3) / 2, alongX = Math.abs(b[1] - a[1]) < 1e-6;
  const [x0, z0, x1, z1] = R4(a, b), out = el.out ?? 1;
  const rect = alongX ? [x0, z0 - th / 2, x1, z0 + th / 2] : [x0 - th / 2, z0, x0 + th / 2, z1];
  bag.add(EARTH, alongX ? frustum(rect, 0, h, 0, 0, inset, inset, { noBottom: true }) : frustum(rect, 0, h, inset, inset, 0, 0, { noBottom: true }));
  col.rect(rect, 0, h);
  const top = alongX ? [rect[0], rect[1] + inset, rect[2], rect[3] - inset] : [rect[0] + inset, rect[1], rect[2] - inset, rect[3]];
  col.floor(top, h);
  // the pale courses of the rammed layers (a course every 0.9 m) on both faces; a stain at the foot
  const L = alongX ? x1 - x0 : z1 - z0;
  for (let k = 1; k < 6; k++) {
    const yy = k * 0.95, f = 1 - yy / h * inset / (th / 2) * 0.0, inN = inset * yy / h;
    void f;
    if (alongX) for (const s of [-1, 1]) bag.add('mud_plaster', box(x0 + 0.01, yy, z0 + s * (th / 2 - inN) - (s > 0 ? 0.03 : -0.0), x1 - 0.01, yy + 0.05, z0 + s * (th / 2 - inN) + (s > 0 ? 0.0 : 0.03)));
    else for (const s of [-1, 1]) bag.add('mud_plaster', box(x0 + s * (th / 2 - inN) - (s > 0 ? 0.03 : 0), yy, z0 + 0.01, x0 + s * (th / 2 - inN) + (s > 0 ? 0 : 0.03), yy + 0.05, z1 - 0.01));
  }
  // the outer parapet: merlons along the outer edge of the walk (out = +1: the +z / +x side)
  const n = Math.max(1, Math.floor(L / 1.9));
  for (let i = 0; i < n; i++) {
    const u = (i + 0.5) * L / n, m0 = u - 0.5, m1 = u + 0.5;
    if (alongX) { const zz = z0 + out * (th / 2 - inset) - (out > 0 ? 0.55 : 0); bag.add('mud_plaster', box(x0 + m0, h, zz, x0 + m1, h + 1.15, zz + 0.55)); }
    else { const xx = x0 + out * (th / 2 - inset) - (out > 0 ? 0.55 : 0); bag.add('mud_plaster', box(xx, h, z0 + m0, xx + 0.55, h + 1.15, z0 + m1)); }
  }
  if (alongX) { const zz = z0 + out * (th / 2 - inset) - (out > 0 ? 0.3 : -0.3); col.segment([x0, zz], [x1, zz], 0.6, h, h + 1.15); }
  else { const xx = x0 + out * (th / 2 - inset) - (out > 0 ? 0.3 : -0.3); col.segment([xx, z0], [xx, z1], 0.6, h, h + 1.15); }
}
/** town_gate: { c: [x, z], along ('x' for a wall running east–west | 'z'), inward (+1/−1: which way the town lies across the wall), w (the passage) }: piers, lintel, the gate pavilion on top, ramps up the inner side. */
export function townGate(el, { bag, col }) {
  const [cx, cz] = el.c, along = el.along ?? 'x', inw = el.inward ?? 1, w = el.w ?? 4.6, h = el.h ?? 5.8, U = 7.5, V = 4.2, bt = 0.8;
  const W = (u, v) => (along === 'x' ? [cx + u, cz + v] : [cx + v, cz + u]);
  const rectUV = (u0, v0, u1, v1) => R4(W(u0, v0), W(u1, v1));
  const fr = (u0, v0, u1, v1, y0, y1, bu, bv, noB = true) => { const r = rectUV(u0, v0, u1, v1); return along === 'x' ? frustum(r, y0, y1, bu, bu, bv, bv, { noBottom: noB }) : frustum(r, y0, y1, bv, bv, bu, bu, { noBottom: noB }); };
  // the piers either side of the passage (full height), the earth over the passage on a timber lintel
  for (const s of [-1, 1]) {
    const u0 = s > 0 ? w / 2 : -U, u1 = s > 0 ? U : -w / 2;
    bag.add(EARTH, along === 'x' ? frustum(rectUV(u0, -V, u1, V), 0, h, s > 0 ? 0 : bt, s > 0 ? bt : 0, bt, bt, { noBottom: true }) : frustum(rectUV(u0, -V, u1, V), 0, h, bt, bt, s > 0 ? 0 : bt, s > 0 ? bt : 0, { noBottom: true }));
    col.rect(rectUV(u0, -V, u1, V), 0, h);
  }
  { const r = rectUV(-w / 2 - 0.01, -V + 0.3, w / 2 + 0.01, V - 0.3); bag.add(EARTH, box(r[0], 4.4, r[1], r[2], h, r[3])); col.rect(r, 4.4, h); }
  { const r = rectUV(-w / 2 - 0.5, -V + 0.2, w / 2 + 0.5, V - 0.2); bag.add('timber', box(r[0], 3.95, r[1], r[2], 4.4, r[3])); }
  // the passage's floor of stones, the door leaves standing open against the piers
  { const r = rectUV(-w / 2, -V, w / 2, V); bag.add('flagstone', box(r[0], -0.3, r[1], r[2], 0.03, r[3])); col.floor(r, 0.03); }
  // the terrace and the pavilion on top: eight posts, a hip roof of grey tiles, a great drum
  const top = h;
  const t = rectUV(-U + bt, -V + bt, U - bt, V - bt);
  col.floor(t, top);
  const us = [-4.6, -1.5, 1.5, 4.6], vs = [-2.3, 2.3];
  for (const u of us) for (const v of vs) { const p = W(u, v); bag.add('lacquer_red', lathe([[0.2, 0], [0.18, 3.6], [0.001, 3.6]], 10, null, p[0], top, p[1])); bag.add('granite_grey', lathe([[0.32, 0], [0.3, 0.2], [0.001, 0.2]], 8, null, p[0], top, p[1])); col.circle(p[0], p[1], 0.2, top, top + 3.6); }
  for (const v of vs) { const a = W(-5.2, v), b = W(5.2, v); bag.add('lacquer_red', obox(a, b, 0.3, top + 3.2, top + 3.6)); }
  for (const u of us) { const a = W(u, -2.6), b = W(u, 2.6); bag.add('lacquer_red', obox(a, b, 0.3, top + 3.2, top + 3.6)); }
  rectRoof({ c: W(0, 0), A: 7.4, B: 4.4, y: top + 3.7, rise: 3.0, kind: 'xieshan', sweep: 0.9, alongZ: along === 'z', mat: 'tile_grey', soffit: 'lacquer_red' }, bag);
  { const p = W(0, 0); bag.add('lacquer_red', lathe([[0.7, 0], [0.82, 0.5], [0.82, 1.0], [0.7, 1.5]], 14, null, p[0], top, p[1])); bag.add('hide_tan', lathe([[0.7, 0.2], [0.7, 1.3]], 14, null, p[0], top, p[1])); bag.add('wood_dark', box(p[0] - 0.9, top, p[1] - 0.9, p[0] + 0.9, top + 0.12, p[1] + 0.9)); col.circle(p[0], p[1], 0.9, top, top + 1.5); }
  // the ramps up the inner face of the wall on both sides of the gate, a landing at the terrace
  for (const s of [-1, 1]) {
    const L = 22, v0 = inw * 2.5, v1 = inw * 4.9, vin = inw * 1.5, u0 = s * U, u1 = s * (U + L);
    const P = (u, v, y) => { const q = W(u, v); return [q[0], y, q[1]]; };
    const tris = [];
    const pts = [P(u0, vin, 0), P(u0, v1, 0), P(u1, v1, 0), P(u1, vin, 0), P(u0, vin, h), P(u0, v1, h)];
    const q = (A, B, C) => tris.push(...A, ...B, ...C);
    q(pts[0], pts[1], pts[2]); q(pts[0], pts[2], pts[3]);                 // bottom
    q(pts[4], pts[5], pts[1]); q(pts[4], pts[1], pts[0]);                 // the end face at the terrace
    q(pts[4], pts[0], pts[3]);                                            // the wall side (a triangle)
    q(pts[5], pts[2], pts[1]);                                            // the outer side (a triangle)
    q(pts[4], pts[3], pts[2]); q(pts[4], pts[2], pts[5]);                 // the slope
    bag.add(EARTH, fromTriangles(orientOutward(tris)));
    const r = R4(W(u0, v0), W(u1, v1)), dir = along === 'x' ? (s > 0 ? 'w' : 'e') : (s > 0 ? 'n' : 's');
    col.ramp(r, 0, h, dir);
    // a low kerb of rammed earth along the open side
    col.segment(W(u0, v1 + inw * 0.1), W(u1, v1 + inw * 0.1), 0.2, 0, 0.9);
  }
}
/** corner_tower: a square tower on the wall's corner with a hip roof. { c, h } */
export function cornerTower(el, { bag, col }) {
  const [cx, cz] = el.c, h = el.h ?? 8.4, r = 4.4;
  bag.add(EARTH, frustum([cx - r, cz - r, cx + r, cz + r], 0, h, 0.9, 0.9, 0.9, 0.9, { noBottom: true })); col.rect([cx - r, cz - r, cx + r, cz + r], 0, h);
  for (const [dx, dz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { bag.add('lacquer_red', lathe([[0.18, 0], [0.16, 3.0], [0.001, 3.0]], 8, null, cx + dx * 2.8, h, cz + dz * 2.8)); }
  bag.add('lacquer_red', box(cx - 3.1, h + 2.9, cz - 3.1, cx + 3.1, h + 3.2, cz + 3.1));
  rectRoof({ c: [cx, cz], A: 4.6, B: 4.6, y: h + 3.3, rise: 2.4, kind: 'hip', sweep: 0.7, mat: 'tile_grey', soffit: 'lacquer_red' }, bag);
}
/** brick_wall: the wall of the palace compound [stated: Rubruck: enclosed by a brick wall like a monastery's] a→b, h, th: grey brick with a tiled coping. */
export function brickWall(el, { bag, col }) {
  const [a, b] = [el.a, el.b], h = el.h ?? 4.2, th = el.th ?? 0.9, y = el.y ?? 0, L = Math.hypot(b[0] - a[0], b[1] - a[1]);
  bag.add('brick_grey', obox(a, b, th, y - 0.2, y + h)); col.segment(a, b, th, y - 0.2, y + h);
  const ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L;
  bag.add('tile_grey', obox([a[0] - ux * 0.05, a[1] - uz * 0.05], [b[0] + ux * 0.05, b[1] + uz * 0.05], th + 0.34, y + h, y + h + 0.1));
  bag.add('tile_dark', obox(a, b, th + 0.1, y + h + 0.1, y + h + 0.3));
  for (let s = 6; s < L - 3; s += 6) bag.add('plaster_white', obox([a[0] + ux * (s - 0.2), a[1] + uz * (s - 0.2)], [a[0] + ux * (s + 0.2), a[1] + uz * (s + 0.2)], th + 0.08, y, y + h - 0.2));
}
/** gate_hall: the three-door gate of the palace compound { c: [cx, z], y }: along x 15 m, deep 6 m, three passages, a tiled roof. */
export function gateHall(el, { bag, col }) {
  const [cx, zc] = el.c, Y = el.y ?? 0.9, W = 15, D = 6.4, x0 = cx - W / 2, x1 = cx + W / 2, z0 = zc - D / 2, z1 = zc + D / 2, H = 4.6, F = Y + 0.04;
  podium(bag, col, [x0 - 1.2, z0 - 1.2, x1 + 1.2, z1 + 1.2], Y, [{ side: 's', c: cx, w: 4 }, { side: 'n', c: cx, w: 4 }]);
  bag.add('flagstone', box(x0, Y - 0.1, z0, x1, F, z1)); col.floor([x0, z0, x1, z1], F);
  const ops = [{ at: 2.5, w: 2.2, h: 3.6 }, { at: 7.5, w: 3.6, h: 4.0 }, { at: 12.5, w: 2.2, h: 3.6 }];
  wallRun(bag, col, [x0, z1], [x1, z1], 0.4, F, Y + H, 'timber_red', ops);
  wallRun(bag, col, [x0, z0], [x1, z0], 0.4, F, Y + H, 'timber_red', ops);
  for (const X of [x0, x1]) wallRun(bag, col, [X, z0], [X, z1], 0.4, F, Y + H, 'timber_red');
  // partitions between the passages: the doors' posts and the plastered walls between
  for (const x of [x0 + 5, x0 + 10]) wallRun(bag, col, [x, z0], [x, z1], 0.4, F, Y + H, 'plaster_white');
  for (const x of [x0 + 5, x0 + 10, x0, x1]) for (const z of [z0, z1]) bag.add('lacquer_red', lathe([[0.3, 0], [0.26, H], [0.001, H]], 10, null, x, F, z));
  bag.add('ceiling_painted', box(x0, Y + H, z0, x1, Y + H + 0.12, z1));
  rectRoof({ c: [cx, zc], A: W / 2 + 1.8, B: D / 2 + 1.8, y: Y + H + 0.2, rise: 3.4, kind: 'xieshan', sweep: 0.9, mat: 'tile_green', soffit: 'lacquer_red' }, bag);
}

/**
 * mud_compound: a courtyard house of sun-dried brick [stated: Hyperallergic: collapsed mud-brick compounds; inferred: the form]: a wall round the court (gate
 * in the side `gate`), the house along the back with a flat roof on beams, a parapet, a few small windows; some with a dome over the kitchen or the iwan,
 * an oven and a heap of fuel in the court. { rect, gate ('s'|'n'|'e'|'w'), seed, floors, dome }
 */
export function mudCompound(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, rand = rng(el.seed || 5), gate = el.gate ?? 's', T = 0.45, WH = 2.9, floors = el.floors ?? 1, mat = rand() < 0.5 ? 'mudbrick' : 'mud_plaster';
  const gu = (gate === 's' || gate === 'n') ? (x0 + x1) / 2 + (rand() - 0.5) * (x1 - x0) * 0.3 : (z0 + z1) / 2 + (rand() - 0.5) * (z1 - z0) * 0.3;
  const gw = 2.2, gh = 2.5;
  const run = (a, b, side) => { const along = side === 's' || side === 'n'; const pos = along ? a[0] : a[1]; const ops = side === gate ? [{ at: gu - pos, w: gw, h: gh }] : []; wallRun(bag, col, a, b, T, 0, WH, mat, ops); };
  run([x0, z0], [x1, z0], 'n'); run([x0, z1], [x1, z1], 's'); run([x0, z0], [x0, z1], 'w'); run([x1, z0], [x1, z1], 'e');
  // the gate's lintel beam and its low roofed hood
  { const o = gate === 's' ? [gu - 1.4, z1 - 0.3, gu + 1.4, z1 + 0.5] : gate === 'n' ? [gu - 1.4, z0 - 0.5, gu + 1.4, z0 + 0.3] : gate === 'e' ? [x1 - 0.3, gu - 1.4, x1 + 0.5, gu + 1.4] : [x0 - 0.5, gu - 1.4, x0 + 0.3, gu + 1.4]; bag.add('timber', box(o[0], gh, o[1], o[2], gh + 0.2, o[3])); bag.add('wood_dark', box(o[0] - 0.1, gh + 0.2, o[1] - 0.1, o[2] + 0.1, gh + 0.3, o[3] + 0.1)); }
  // coping of the court wall: a course of laid brick
  for (const [a, b] of [[[x0, z0], [x1, z0]], [[x0, z1], [x1, z1]], [[x0, z0], [x0, z1]], [[x1, z0], [x1, z1]]]) bag.add('brick_buff', obox(a, b, T + 0.12, WH, WH + 0.1));
  // the house: along the side opposite the gate, depth 40 % of the compound
  const d = gate === 's' ? [x0 + T, z0 + T, x1 - T, z0 + (z1 - z0) * 0.42] : gate === 'n' ? [x0 + T, z1 - (z1 - z0) * 0.42, x1 - T, z1 - T] : gate === 'e' ? [x0 + T, z0 + T, x0 + (x1 - x0) * 0.42, z1 - T] : [x1 - (x1 - x0) * 0.42, z0 + T, x1 - T, z1 - T];
  const hh = floors > 1 ? 6.2 : 3.6;
  bag.add(mat, box(d[0], 0, d[1], d[2], hh, d[3])); col.rect(d, 0, hh);
  bag.add('brick_buff', box(d[0] - 0.05, hh, d[1] - 0.05, d[2] + 0.05, hh + 0.12, d[3] + 0.05));
  bag.add('mud_plaster', box(d[0], hh + 0.12, d[1], d[2], hh + 0.7, d[1] + 0.35)); bag.add('mud_plaster', box(d[0], hh + 0.12, d[3] - 0.35, d[2], hh + 0.7, d[3])); bag.add('mud_plaster', box(d[0], hh + 0.12, d[1] + 0.35, d[0] + 0.35, hh + 0.7, d[3] - 0.35)); bag.add('mud_plaster', box(d[2] - 0.35, hh + 0.12, d[1] + 0.35, d[2], hh + 0.7, d[3] - 0.35));
  // the ends of the roof beams (poplar poles) through the face toward the court
  const face = gate === 's' ? [d[0], d[3], d[2], d[3], 0, 1] : gate === 'n' ? [d[0], d[1], d[2], d[1], 0, -1] : gate === 'e' ? [d[2], d[1], d[2], d[3], 1, 0] : [d[0], d[1], d[0], d[3], -1, 0];
  const Lf = Math.hypot(face[2] - face[0], face[3] - face[1]);
  for (let s = 0.6; s < Lf - 0.3; s += 0.7) { const px = face[0] + (face[2] - face[0]) * s / Lf, pz = face[1] + (face[3] - face[1]) * s / Lf; bag.add('cedar', rod([px, hh - 0.25, pz], [px + face[4] * 0.35, hh - 0.25, pz + face[5] * 0.35], 0.07, 5)); }
  // the doors and windows on the court face: dark recesses with lattice and a timber door
  const nw = Math.max(2, Math.floor(Lf / 3.2));
  for (let i = 0; i < nw; i++) {
    const s = (i + 0.5) * Lf / nw, px = face[0] + (face[2] - face[0]) * s / Lf, pz = face[1] + (face[3] - face[1]) * s / Lf, nx = face[4], nz = face[5], isDoor = i === Math.floor(nw / 2);
    const w = isDoor ? 1.0 : 0.8, y0 = isDoor ? 0 : 1.3, y1 = isDoor ? 2.3 : 2.2;
    const tx = nz ? 1 : 0, tz = nx ? 1 : 0;
    const a = [px - tx * w / 2 + nx * 0.015, pz - tz * w / 2 + nz * 0.015], b = [px + tx * w / 2 + nx * 0.015, pz + tz * w / 2 + nz * 0.015];
    bag.add(isDoor ? 'wood_dark' : 'opening', obox(a, b, 0.03, y0, y1)); if (!isDoor) bag.add('lattice', obox([a[0] + nx * 0.02, a[1] + nz * 0.02], [b[0] + nx * 0.02, b[1] + nz * 0.02], 0.02, y0 + 0.05, y1 - 0.05));
    if (floors > 1 && !isDoor) bag.add('opening', obox([a[0], a[1]], [b[0], b[1]], 0.03, 4.2, 5.3));
  }
  if (el.dome) {
    const cx = (d[0] + d[2]) / 2 + (rand() - 0.5), cz = (d[1] + d[3]) / 2, r = Math.min(2.6, Math.min(d[2] - d[0], d[3] - d[1]) * 0.35);
    bag.add('brick_buff', lathe([[r, 0], [r, 0.5], [r * 0.9, 1.0], [r * 0.62, 1.7], [r * 0.2, 2.15], [0.001, 2.2]], 14, null, cx, hh + 0.12, cz));
    bag.add('gilt_bronze', lathe([[0.001, 0], [0.1, 0.04], [0.02, 0.5]], 6, null, cx, hh + 2.3, cz));
  }
  // in the court: a tandoor-like oven and a heap of dung fuel, a felt-roofed store, a trough
  const ox = gate === 's' || gate === 'n' ? x0 + 1.6 : (gate === 'e' ? x1 - 1.4 : x0 + 1.4), oz = gate === 's' ? z1 - 1.6 : gate === 'n' ? z0 + 1.6 : z0 + 1.6;
  bag.add('mudbrick', lathe([[0.6, 0], [0.5, 0.5], [0.42, 0.85], [0.28, 1.0], [0.001, 1.02]], 10, null, ox, 0, oz)); col.circle(ox, oz, 0.62, 0, 1.0);
  bag.add('bark_dark', lathe([[0.7, 0], [0.45, 0.4], [0.001, 0.55]], 8, null, ox + 1.6, 0, oz + 0.3)); col.circle(ox + 1.6, oz + 0.3, 0.6, 0, 0.4);
  void TAU;
}

/** mosque: a brick mosque of the Saracen quarter: a court with an ablution pool, the prayer hall with a dome and a pishtaq of turquoise tile, a square minaret. { rect, seed } faces south. */
export function mosque(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, cx = (x0 + x1) / 2, T = 0.6, WH = 3.4, hz1 = z0 + (z1 - z0) * 0.55;
  // the court wall with its gate, the prayer hall along the back (north)
  wallRun(bag, col, [x0, z1], [x1, z1], T, 0, WH, 'brick_buff', [{ at: cx - x0, w: 2.6, h: 2.9 }]);
  wallRun(bag, col, [x0, z0], [x1, z0], T, 0, WH, 'brick_buff'); wallRun(bag, col, [x0, z0], [x0, z1], T, 0, WH, 'brick_buff'); wallRun(bag, col, [x1, z0], [x1, z1], T, 0, WH, 'brick_buff');
  for (const [a, b] of [[[x0, z1], [x1, z1]], [[x0, z0], [x1, z0]], [[x0, z0], [x0, z1]], [[x1, z0], [x1, z1]]]) bag.add('brick_buff', obox(a, b, T + 0.1, WH, WH + 0.12));
  const hw = x1 - x0 - 2 * T, hallH = 6.2;
  bag.add('brick_buff', box(x0 + T, 0, z0 + T, x1 - T, hallH, hz1)); col.rect([x0 + T, z0 + T, x1 - T, hz1], 0, hallH);
  bag.add('plaster_white', box(x0 + T, hallH, z0 + T, x1 - T, hallH + 0.3, hz1));
  // the pishtaq: a tall frame in front of the hall with a pointed niche, bands of turquoise tile
  const pw = Math.min(6.4, hw * 0.45);
  bag.add('brick_buff', box(cx - pw / 2, 0, hz1, cx + pw / 2, hallH + 1.6, hz1 + 0.5)); col.rect([cx - pw / 2, hz1, cx + pw / 2, hz1 + 0.5], 0, hallH + 1.6);
  bag.add('tile_turquoise', box(cx - pw / 2 + 0.2, hallH - 0.4, hz1 + 0.5, cx + pw / 2 - 0.2, hallH + 1.2, hz1 + 0.53));
  bag.add('opening', box(cx - 1.1, 0, hz1 + 0.5, cx + 1.1, 4.4, hz1 + 0.53));
  for (const s of [-1, 1]) bag.add('tile_turquoise', box(cx + s * (pw / 2 - 0.45) - 0.12, 0, hz1 + 0.5, cx + s * (pw / 2 - 0.45) + 0.12, hallH + 1.2, hz1 + 0.53));
  // the dome behind it, on a drum, turquoise
  const dr = Math.min(hw, hz1 - z0) * 0.3, dcx = cx, dcz = (z0 + T + hz1) / 2;
  bag.add('brick_buff', lathe([[dr * 1.1, 0], [dr * 1.1, 1.0], [dr, 1.2]], 18, null, dcx, hallH + 0.3, dcz));
  bag.add('tile_turquoise', lathe([[dr, 0], [dr * 1.12, 0.8], [dr * 0.8, 2.0], [dr * 0.4, 2.7], [0.001, 3.0]], 18, null, dcx, hallH + 1.5, dcz));
  bag.add('gilt_bronze', lathe([[0.001, 0], [0.14, 0.05], [0.04, 0.8]], 6, null, dcx, hallH + 4.5, dcz));
  // the minaret at the corner: a square shaft tapering, bands of tile, a balcony, a lantern
  const mx = x1 - T - 1.0, mz = hz1 + 1.4;
  bag.add('brick_buff', frustum([mx - 1.2, mz - 1.2, mx + 1.2, mz + 1.2], 0, 13, 0.35, 0.35, 0.35, 0.35, { noBottom: true })); col.rect([mx - 1.2, mz - 1.2, mx + 1.2, mz + 1.2], 0, 13);
  for (const y of [4, 8, 11.4]) bag.add('tile_turquoise', frustum([mx - 1.05 + y * 0.0265, mz - 1.05 + y * 0.0265, mx + 1.05 - y * 0.0265, mz + 1.05 - y * 0.0265], y, y + 0.5, 0, 0, 0, 0));
  bag.add('brick_buff', box(mx - 1.2, 13, mz - 1.2, mx + 1.2, 13.25, mz + 1.2)); bag.add('brick_buff', lathe([[0.7, 0], [0.7, 1.6], [0.001, 2.4]], 8, null, mx, 13.25, mz));
  // the ablution pool in the court
  const px = cx, pz = (hz1 + z1) / 2 + 0.8;
  bag.add('flagstone', box(px - 2.2, 0, pz - 1.6, px + 2.2, 0.35, pz + 1.6)); bag.add('water_jet', box(px - 1.9, 0.355, pz - 1.3, px + 1.9, 0.365, pz + 1.3)); col.rect([px - 2.2, pz - 1.6, px + 2.2, pz + 1.6], 0, 0.35);
}
/** church: the Nestorian church [stated: Rubruck: one church of Christians at the extreme end of the city]: a plastered nave with a gabled roof of tiles, an apse to the east, a cross on the gable, small arched windows. { rect } */
export function church(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, H = 4.6, T = 0.7;
  bag.add('flagstone', box(x0, -0.1, z0, x1, 0.03, z1)); col.floor([x0, z0, x1, z1], 0.03);
  wallRun(bag, col, [x0, z1], [x1, z1], T, 0.03, H, 'plaster_white', [{ at: cx - x0, w: 1.8, h: 2.8 }]);
  wallRun(bag, col, [x0, z0], [x1, z0], T, 0.03, H, 'plaster_white', [{ at: cx - x0, w: 0.7, h: 1.4, y0: 2.0 }]);
  for (const X of [x0, x1]) wallRun(bag, col, [X, z0], [X, z1], T, 0.03, H, 'plaster_white', [0.3, 0.7].map((f) => ({ at: (z1 - z0) * f, w: 0.7, h: 1.5, y0: 1.8 })));
  // the apse on the east end: a half-round, a semi-dome
  bag.add('plaster_white', lathe([[2.0, 0.55], [2.0, H - 0.2], [1.8, H]], 12, null, x1 + 0.5, 0, cz));
  col.circle(x1 + 0.5, cz, 2.0, 0, H);
  rectRoof({ c: [cx, cz], A: (x1 - x0) / 2 + 0.9, B: (z1 - z0) / 2 + 0.9, y: H, rise: 2.8, kind: 'gable', sweep: 0, mat: 'tile_grey', soffit: 'wood_dark' }, bag);
  // the cross on the gable ridge and over the apse
  for (const [x, y] of [[x0 - 0.2, H + 2.8], [x1 + 0.5, H + 0.3]]) { bag.add('gilt_bronze', box(x - 0.05, y, cz - 0.05, x + 0.05, y + 1.1, cz + 0.05)); bag.add('gilt_bronze', box(x - 0.05, y + 0.65, cz - 0.4, x + 0.05, y + 0.78, cz + 0.4)); }
  // the semantron hung at the door (a board struck for the hours) and a lamp
  { const sx = cx - 2.4; bag.add('wood_dark', box(sx - 0.3, 3.0, z1 + 0.36, sx + 0.3, 3.9, z1 + 0.41)); bag.add('timber', rod([sx - 0.7, 3.95, z1 + 0.4], [sx + 0.7, 3.95, z1 + 0.4], 0.03, 4)); }
  // inside: the altar at the east end under the apse, a cross, a lamp, benches along the nave
  bag.add('timber', box(x1 - 2.0, 0.03, cz - 0.9, x1 - 1.2, 1.0, cz + 0.9)); bag.add('cloth_white', box(x1 - 2.04, 0.9, cz - 0.95, x1 - 1.16, 1.03, cz + 0.95));
  col.rect([x1 - 2.0, cz - 0.9, x1 - 1.2, cz + 0.9], 0.03, 1.0);
  bag.add('gilt_bronze', box(x1 - 1.62, 1.03, cz - 0.03, x1 - 1.58, 1.6, cz + 0.03)); bag.add('gilt_bronze', box(x1 - 1.62, 1.35, cz - 0.22, x1 - 1.58, 1.4, cz + 0.22));
  for (const dz of [-0.6, 0.6]) bag.add('bronze', lathe([[0.001, 0], [0.05, 0.02], [0.04, 0.2], [0.001, 0.22]], 6, null, x1 - 1.5, 1.03, cz + dz));
  for (let k = 0; k < 3; k++) for (const s of [-1, 1]) { bag.add('timber', box(x0 + 2.2 + k * 2.2, 0.03, cz + s * 1.0 - 0.18, x0 + 3.5 + k * 2.2, 0.45, cz + s * 1.0 + 0.18)); col.rect([x0 + 2.2 + k * 2.2, cz + s * 1.0 - 0.18, x0 + 3.5 + k * 2.2, cz + s * 1.0 + 0.18], 0.03, 0.45); }
}
/**
 * shop_row: a row of open-fronted shops [inferred] of sun-dried brick with flat roofs: n bays of w m along x from a, depth d, the front to the south (face 's') or north; a
 * counter, a cloth awning in the wind, goods and rolled felts or carpets on shelves. { a, n, w, d, face, seed }
 */
export function shopRow(el, { bag, col }) {
  const [ax, az] = el.a, n = el.n ?? 4, w = el.w ?? 3.6, d = el.d ?? 4.4, rand = rng(el.seed || 9), face = el.face ?? 's', H = 3.2, y = el.y ?? 0, f = face === 's' ? 1 : -1;
  const zf = face === 's' ? az + d : az, zb = face === 's' ? az : az + d;
  const x1 = ax + n * w;
  bag.add('mudbrick', box(ax, y, Math.min(zb, zb + f * -0.4), x1, y + H, Math.max(zb, zb - f * 0.4))); col.rect([ax, Math.min(zb, zb - f * 0.4), x1, Math.max(zb, zb - f * 0.4)], y, y + H);
  bag.add('mud_plaster', box(ax, y + H, Math.min(az, zf), x1, y + H + 0.14, Math.max(az, zf)));
  bag.add('mud_plaster', box(ax, y + H + 0.14, Math.min(zf, zf - f * 0.3), x1, y + H + 0.8, Math.max(zf, zf - f * 0.3)));
  const goods = ['cloth_red', 'cloth_blue', 'cloth_ochre', 'cloth_green', 'hide_tan', 'cloth_white', 'cloth_maroon'], awn = ['cloth_red', 'cloth_blue', 'cloth_ochre', 'cloth_white', 'cloth_green'];
  for (let i = 0; i <= n; i++) { const x = ax + i * w, xa = Math.min(x - 0.2, ax), xb = x; void xa; bag.add('mudbrick', box(x - 0.2 + (i === n ? -0.0 : 0), y, Math.min(az, zf), x + 0.2, y + H, Math.max(az, zf))); col.rect([x - 0.2, Math.min(az, zf), x + 0.2, Math.max(az, zf)], y, y + H); void xb; }
  for (let i = 0; i < n; i++) {
    const xa = ax + i * w + 0.2, xb = ax + (i + 1) * w - 0.2, mx = (xa + xb) / 2, zc = zf - f * 0.6;
    // the counter at the front, a shelf at the back with goods
    bag.add('timber', box(xa, y, Math.min(zc, zc - f * 0.5), xb, y + 0.95, Math.max(zc, zc - f * 0.5))); col.rect([xa, Math.min(zc, zc - f * 0.5), xb, Math.max(zc, zc - f * 0.5)], y, y + 0.95);
    bag.add('wood_dark', box(xa, y + 0.95, Math.min(zc, zc - f * 0.5), xb, y + 1.0, Math.max(zc, zc - f * 0.5)));
    const gm = goods[Math.floor(rand() * goods.length)];
    for (let k = 0; k < 4; k++) { const gx = xa + 0.25 + k * (xb - xa - 0.5) / 3; bag.add(goods[Math.floor(rand() * goods.length)], lathe([[0.001, 0], [0.16, 0.02], [0.2, 0.12], [0.1, 0.22], [0.001, 0.23]], 8, null, gx, y + 1.0, zc - f * 0.25)); }
    for (const sy of [1.2, 1.9]) { bag.add('timber', box(xa + 0.05, y + sy, Math.min(zb, zb - f * 0.5) , xb - 0.05, y + sy + 0.05, Math.max(zb, zb - f * 0.5))); for (let k = 0; k < 4; k++) bag.add(goods[Math.floor(rand() * goods.length)], box(xa + 0.15 + k * 0.7, y + sy + 0.05, zb - f * 0.45, xa + 0.7 + k * 0.7, y + sy + 0.45, zb - f * 0.05)); }
    bag.add(gm, box(mx - 0.8, y + 0.0, zc + f * 0.4, mx + 0.8, y + 0.03, zc + f * 1.3));
    // the awning: cloth sloping from the roof edge down and out, in the wind
    const am = awn[Math.floor(rand() * awn.length)];
    const g = clothBox(xa - 0.05, y + H - 0.5, Math.min(zf, zf + f * 1.7), xb + 0.05, y + H - 0.43, Math.max(zf, zf + f * 1.7), 0.35);
    addCloth(bag, am, g, y + H);
    for (const x of [xa, xb]) { bag.add('timber', rod([x, y, zf + f * 1.7], [x, y + H - 0.4, zf + f * 1.7], 0.05, 5)); col.circle(x, zf + f * 1.7, 0.06, y, y + H); }
  }
}
void rectRoof;
