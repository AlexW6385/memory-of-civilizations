// Pueblo yards (docs/settlements/taos.md §4.3): the working places of the plaza and the creek —
// the cook yard (a steaming pit and a hot-stone griddle for thin cornmeal bread), the mud yard where
// puddled adobe is made and a wall is raised and re-mudded, woodpiles and stacked vigas at the feet of
// the houses, the stepping stones and cobbled banks of Red Willow Creek. Pure geometry from the
// palette's own materials; each element sits on the ground it is given.

import { box, lathe, fromTriangles, rod } from '../../core/geom.js';
import { Matrix4 } from '../../core/three.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const A = 'adobe_taos', V = 'viga';
/** A rounded lump (a stone, a loaf of mud): the dome profile squashed to rx × ry × rz, turned, at (x, y, z). */
function lump(bag, mat, x, y, z, rx, ry, rz, rot = 0, seg = 8) {
  const g = lathe([[0.001, 0], [0.88, 0.06], [1, 0.3], [0.82, 0.68], [0.45, 0.93], [0.001, 1]], seg);
  g.scale(rx, ry, rz).rotateY(rot).translate(x, y, z);
  bag.add(mat, g);
}
/** A local frame: (u across, v along) at yaw → world. */
const frame = (cx, cz, yaw) => { const c = Math.cos(yaw), s = Math.sin(yaw); return (u, v) => [cx + u * c + v * s, cz - u * s + v * c]; };

/**
 * cook_yard: { c, yaw, seed } — a steaming pit and a griddle hearth side by side on the plaza.
 * [stated: no ovens before the Spanish, "the enclosures that resembled ovens — pit ovens — were steaming
 * chambers" — Native American Foods (ckbk); inferred: the hot-stone griddle for thin cornmeal bread, as
 * the Pueblos' piki, and the layout]. Left, the pit: a ring of river stones round a mound of wet husks
 * under a heap of earth, steam rising; right, the griddle: a smooth slab on two stone cheeks over a
 * fire, the thin sheets of bread stacked beside it, a bowl of batter, the meal basket and split wood.
 */
export function cookYard(el, { bag, col }) {
  const [cx, cz] = el.c, yaw = el.yaw ?? 0, rand = rng(el.seed || Math.round(cx * 7 + cz * 3) >>> 0), W = frame(cx, cz, yaw);
  // the steaming pit, at u = −1.5
  const [px, pz] = W(-1.5, 0);
  bag.add('opening', lathe([[0.001, 0.012], [0.62, 0.012]], 18, null, px, 0, pz));
  const N = 13;
  for (let k = 0; k < N; k++) {
    const a = k / N * Math.PI * 2, r = 0.74 + (rand() - 0.5) * 0.06, s = 0.17 + rand() * 0.08;
    lump(bag, 'rock_boulder', px + Math.cos(a) * r, -0.04, pz + Math.sin(a) * r, s, 0.11 + rand() * 0.08, s * 0.85, rand() * 6, 7);
  }
  lump(bag, 'thatch', px, 0.0, pz, 0.62, 0.3, 0.62, 0, 14);                             // the husks over the corn
  lump(bag, 'mud_plaster', px + 0.05, 0.16, pz - 0.04, 0.5, 0.17, 0.5, 0.6, 12);           // the earth thrown over them
  col.circle(px, pz, 0.95, 0, 0.3);
  // the griddle, at u = +1.3: two cheeks of stone, the slab on them, the fire under it
  const [gx, gz] = W(1.3, 0);
  // local boxes about the griddle's centre
  const G = (u0, v0, u1, v1, y0, y1, mat) => { const p = W(1.3 + u0, v0), q = W(1.3 + u1, v1); bag.add(mat, box(Math.min(p[0], q[0]), y0, Math.min(p[1], q[1]), Math.max(p[0], q[0]), y1, Math.max(p[1], q[1]))); };
  G(-0.38, -0.3, -0.2, 0.3, 0, 0.3, 'flagstone');
  G(0.2, -0.3, 0.38, 0.3, 0, 0.26, 'flagstone');
  G(-0.5, -0.4, 0.5, 0.4, 0.3, 0.345, 'basalt');                                          // the smooth slab
  G(-0.2, -0.3, 0.2, 0.3, 0.0, 0.01, 'opening');                                          // the dark hearth between the cheeks
  for (let k = 0; k < 3; k++) { const a = W(-0.15, -0.22 + k * 0.22), b = W(0.15, -0.18 + k * 0.22 + (rand() - 0.5) * 0.06); bag.add('bark_dark', rod([a[0], 0.07, a[1]], [b[0], 0.07, b[1]], 0.035, 5)); }
  bag.add('flame', lathe([[0.12, 0], [0.09, 0.07], [0.04, 0.16], [0.001, 0.22]], 8, (t) => 1 + 0.2 * Math.sin(t * 3), gx, 0.03, gz));
  col.rect([gx - 0.6, gz - 0.6, gx + 0.6, gz + 0.6], 0, 0.345);
  // the thin bread: sheets on the slab, a stack beside it, a bowl of batter, the basket of meal
  for (let k = 0; k < 2; k++) { const [x, z] = W(1.3 - 0.2 + k * 0.38, (rand() - 0.5) * 0.3); bag.add('cloth_grey', box(x - 0.15, 0.345, z - 0.18, x + 0.15, 0.352, z + 0.18)); }
  const [sx, sz] = W(1.3, 0.85);
  for (let k = 0; k < 7; k++) { const j = (rand() - 0.5) * 0.02; bag.add('cloth_grey', box(sx - 0.17 + j, k * 0.012, sz - 0.2, sx + 0.17 + j, k * 0.012 + 0.011, sz + 0.2)); }
  const [bx, bz] = W(1.3 + 0.55, 0.85);
  bag.add('pottery_dark', lathe([[0.001, 0], [0.07, 0.01], [0.17, 0.08], [0.2, 0.15], [0.18, 0.15], [0.15, 0.1], [0.001, 0.05]], 12, null, bx, 0, bz));
  const [mx, mz] = W(1.3 - 0.7, -0.75);
  bag.add('wicker', lathe([[0.001, 0], [0.16, 0.01], [0.24, 0.1], [0.27, 0.2], [0.24, 0.2], [0.21, 0.11], [0.001, 0.08]], 14, null, mx, 0, mz));
  bag.add('linen', lathe([[0.2, 0.19], [0.1, 0.23], [0.001, 0.24]], 10, null, mx, 0, mz));
  // split piñon beside, a few sticks across one another
  const [wx, wz] = W(2.55, -0.1);
  for (let k = 0; k < 9; k++) { const a = (rand() - 0.5) * 0.7, y = 0.05 + Math.floor(k / 3) * 0.09; const p = [wx + (k % 3 - 1) * 0.1, y, wz - 0.4], q = W(2.55 + (k % 3 - 1) * 0.1, 0.4 + a * 0.1); bag.add('log_pine', rod(p, [q[0], y, q[1]], 0.04 + rand() * 0.015, 5)); }
}

/**
 * mud_yard: { c, yaw, seed } — where the adobe is made and the wall raised [stated: "Pueblo builders
 * first used puddled adobe until they learned to build with adobe bricks", bricks coming with the
 * Spanish — Terrain.org; walls re-mudded by hand every year — ICT News]. A mud pit with a low bank of
 * trodden earth round it and the wet mud in it, a heap of straw-grass, loaves of puddled mud ready
 * stacked, a length of new wall one course higher than its old end — the fresh courses paler — and the
 * tools of the work: digging sticks, baskets of mud, a water jar, a hide to smooth with.
 */
export function mudYard(el, { bag, col }) {
  const [cx, cz] = el.c, yaw = el.yaw ?? 0, rand = rng(el.seed || Math.round(cx * 5 + cz * 11) >>> 0), W = frame(cx, cz, yaw);
  // the pit: a ring of trodden earth, the wet mud inside
  const [px, pz] = W(-1.4, 0);
  bag.add('banco_rough', lathe([[1.55, 0], [1.4, 0.13], [1.0, 0.16], [0.9, 0.04], [0.001, 0.04]], 20, (t) => 1 + 0.06 * Math.sin(t * 3 + 1) + 0.04 * Math.sin(t * 7), px, 0, pz));
  bag.add('banco_smooth', lathe([[0.9, 0.035], [0.001, 0.035]], 20, (t) => 1 + 0.06 * Math.sin(t * 3 + 1), px, 0.012, pz));
  for (let k = 0; k < 4; k++) { const a = rand() * 6.28, r = 0.2 + rand() * 0.5; lump(bag, 'banco', px + Math.cos(a) * r, 0.04, pz + Math.sin(a) * r, 0.14, 0.05, 0.12, rand() * 6, 6); }
  col.circle(px, pz, 1.5, 0, 0.16);
  // the heap of dry grass for the temper, beside the pit
  const [hx, hz] = W(-1.4, -2.0);
  lump(bag, 'ichu', hx, 0, hz, 0.8, 0.45, 0.7, 0.4, 10);
  col.circle(hx, hz, 0.7, 0, 0.4);
  // loaves of puddled mud stacked ready: three, two, one
  const [lx, lz] = W(0.2, -1.4);
  let n = 0;
  for (const [row, cnt] of [[0, 4], [1, 3], [2, 2]]) for (let k = 0; k < cnt; k++, n++) {
    const u = (k - (cnt - 1) / 2) * 0.36, p = W(0.2 + u, -1.4 + (rand() - 0.5) * 0.05);
    lump(bag, 'banco', p[0], row * 0.17, p[1], 0.2 + rand() * 0.03, 0.17, 0.15, yaw + (rand() - 0.5) * 0.3, 8);
  }
  col.rect([lx - 0.8, lz - 0.3, lx + 0.8, lz + 0.3], 0, 0.5);
  // the new wall: its old end 1.2 m high, built on in courses of puddled mud, each a hand's breadth thick, the fresh ones paler
  const wl = 3.2, ww = 0.55, wa = W(-0.2, 0.6), wb = W(-0.2 + wl, 0.6);
  const run = (u0, u1, y0, y1, mat) => { const p = W(u0, 0.6 - ww / 2), q = W(u1, 0.6 + ww / 2); bag.add(mat, box(Math.min(p[0], q[0]), y0, Math.min(p[1], q[1]), Math.max(p[0], q[0]), y1, Math.max(p[1], q[1]))); };
  void wa; void wb;
  run(-0.2, -0.2 + wl, -0.2, 0.62, A);
  run(-0.2, -0.2 + wl * 0.78, 0.62, 0.86, 'banco_rough');
  run(-0.2, -0.2 + wl * 0.52, 0.86, 1.1, 'kahgel');                                         // the newest course, paler and not yet dry
  for (let k = 0; k < 6; k++) { const u = -0.1 + rand() * (wl * 0.5 - 0.2), p = W(u, 0.6 + (rand() < 0.5 ? -1 : 1) * (ww / 2 + 0.01)); lump(bag, 'kahgel', p[0], 0.9 + rand() * 0.15, p[1], 0.12, 0.05, 0.09, rand() * 6, 6); }   // a loaf pressed in, its edge showing
  col.rect([Math.min(...[W(-0.2, 0.6 - ww / 2)[0], W(wl, 0.6 + ww / 2)[0]]), Math.min(W(-0.2, 0.6 - ww / 2)[1], W(wl, 0.6 + ww / 2)[1]), Math.max(W(-0.2, 0.6 - ww / 2)[0], W(wl, 0.6 + ww / 2)[0]), Math.max(W(-0.2, 0.6 - ww / 2)[1], W(wl, 0.6 + ww / 2)[1])], 0, 1.1);
  // tools: digging sticks leaning on the wall, two baskets of mud, a water jar, a hide to smooth with
  for (let k = 0; k < 2; k++) { const f = W(0.3 + k * 0.25, 0.28), t = W(0.3 + k * 0.25, 0.4); bag.add(V, rod([f[0], 0, f[1]], [t[0], 1.15 + k * 0.1, t[1]], 0.022, 5)); }
  for (const [u, v] of [[1.6, -0.5], [2.1, -0.15]]) {
    const [bx, bz] = W(u, v);
    bag.add('wicker', lathe([[0.001, 0], [0.16, 0.01], [0.24, 0.1], [0.27, 0.2], [0.24, 0.2], [0.21, 0.11], [0.001, 0.08]], 14, null, bx, 0, bz));
    bag.add('banco', lathe([[0.2, 0.18], [0.12, 0.27], [0.001, 0.29]], 10, null, bx, 0, bz));
  }
  const [jx, jz] = W(2.6, -0.8);
  bag.add('terracotta', lathe([[0.001, 0], [0.12, 0.03], [0.22, 0.16], [0.24, 0.3], [0.17, 0.44], [0.11, 0.5], [0.12, 0.55], [0.001, 0.52]], 14, null, jx, 0, jz));
  const [kx, kz] = W(1.0, -0.55);
  bag.add('hide_tan', box(kx - 0.22, 0, kz - 0.18, kx + 0.22, 0.012, kz + 0.18));
}

/**
 * woodpile: { at, yaw, len, rows, seed } — split piñon and juniper stacked against a wall: logs along
 * the wall's depth, their cut ends toward the viewer, held at each end by two stakes.
 */
export function woodpile(el, { bag, col }) {
  const [cx, cz] = el.at, yaw = el.yaw ?? 0, rand = rng(el.seed || Math.round(cx * 3 + cz * 5) >>> 0), W = frame(cx, cz, yaw);
  const L = el.len ?? 2.0, rows = el.rows ?? 4, cols = Math.max(3, Math.round(L / 0.2)), D = 0.8;
  for (let r = 0; r < rows; r++) for (let k = 0; k < cols - (r % 2); k++) {
    const u = -L / 2 + (k + 0.5 + (r % 2) * 0.5) * L / cols + (rand() - 0.5) * 0.015, y = 0.08 + r * 0.165, rad = 0.07 + rand() * 0.02;
    if (r > 0 && rand() < 0.07) continue;
    const a = W(u, -D / 2 + (rand() - 0.5) * 0.06), b = W(u + (rand() - 0.5) * 0.02, D / 2 + (rand() - 0.5) * 0.06);
    bag.add(rand() < 0.2 ? 'bark_dark' : 'log_pine', rod([a[0], y, a[1]], [b[0], y, b[1]], rad, 6));
  }
  for (const u of [-L / 2 - 0.04, L / 2 + 0.04]) for (const v of [-D / 2 + 0.05, D / 2 - 0.05]) { const p = W(u, v); bag.add(V, rod([p[0], -0.1, p[1]], [p[0], 0.18 + rows * 0.165, p[1]], 0.035, 5)); }
  const p = W(-L / 2 - 0.1, -D / 2), q = W(L / 2 + 0.1, D / 2);
  col.rect([Math.min(p[0], q[0]), Math.min(p[1], q[1]), Math.max(p[0], q[0]), Math.max(p[1], q[1])], 0, 0.15 + rows * 0.165);
}

/**
 * viga_stack: { at, yaw, n, seed } — new vigas, peeled and pale, cut in the mountains and hauled down,
 * lying on two sleeper logs in a pyramid, their ends uneven [stated: vigas of spruce hauled from the
 * mountains — ICT News/taos.org, dossier §4.1].
 */
export function vigaStack(el, { bag, col }) {
  const [cx, cz] = el.at, yaw = el.yaw ?? 0, rand = rng(el.seed || Math.round(cx * 7 + cz) >>> 0), W = frame(cx, cz, yaw);
  const L = 4.6, n = el.n ?? 6, rows = n >= 6 ? [3, 2, 1] : n >= 3 ? [2, 1] : [1];
  for (const s of [-1.5, 1.5]) { const a = W(-1.3, s), b = W(1.3, s); bag.add(V, rod([a[0], 0.1, a[1]], [b[0], 0.1, b[1]], 0.1, 7)); }
  rows.forEach((cnt, r) => {
    for (let k = 0; k < cnt; k++) {
      const u = (k - (cnt - 1) / 2) * 0.44, y = 0.3 + r * 0.38, off = (rand() - 0.5) * 0.7, rad = 0.095 + rand() * 0.035;
      const a = W(u, -L / 2 + off), b = W(u + (rand() - 0.5) * 0.03, L / 2 + off + (rand() - 0.5) * 0.3);
      bag.add(V, rod([a[0], y, a[1]], [b[0], y, b[1]], rad, 8));
    }
  });
  const p = W(-0.8, -L / 2 - 0.4), q = W(0.8, L / 2 + 0.4);
  col.rect([Math.min(p[0], q[0]), Math.min(p[1], q[1]), Math.max(p[0], q[0]), Math.max(p[1], q[1])], 0, 0.3 + rows.length * 0.38);
}

/**
 * creek_stones: { stones: [{ x, y, z, r, flat }], cobbles: [{ x, y, z, r }] } — the stepping stones
 * across Red Willow Creek (flat-topped boulders standing out of the water on the bed) and the cobbles
 * strewn on its banks [inferred: a snowmelt stream in a shallow bed; the positions are computed from
 * the ground in plan.js].
 */
export function creekStones(el, { bag, col }) {
  const rand = rng(77);
  for (const s of el.stones ?? []) {
    const rx = s.r * (0.95 + rand() * 0.15), rz = s.r * (0.85 + rand() * 0.2), top = s.top, h = top - s.y;
    const g = lathe([[0.001, 0], [0.9, 0.02], [1, 0.4], [0.93, 0.82], [0.78, 0.98], [0.001, 1]], 9);
    g.scale(rx, h, rz).rotateY(rand() * 6).translate(s.x, s.y, s.z);
    bag.add('rock_boulder', g);
    col.circle(s.x, s.z, Math.max(rx, rz) * 0.9, s.y, top);
  }
  for (const c of el.cobbles ?? []) lump(bag, rand() < 0.4 ? 'pebbles' : 'rock_boulder', c.x, c.y - c.r * 0.35, c.z, c.r * (1 + rand() * 0.4), c.r * 0.7, c.r * (0.8 + rand() * 0.3), rand() * 6, 6);
}

export const YARD_ELEMENTS = { cook_yard: cookYard, mud_yard: mudYard, woodpile, viga_stack: vigaStack, creek_stones: creekStones };
void fromTriangles; void Matrix4;
