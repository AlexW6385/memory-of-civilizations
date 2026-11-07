// The traffic of the Beijing streets (docs/settlements/qing-beijing.md §15): the Peking cart, the
// two-wheeled covered cart of the city, and the strings of camels that brought coal and goods in
// from the hills to the west, five to seven to a string, roped nose to tail, a bell at each neck.

import { box, lathe, fromTriangles, rod } from '../../core/geom.js';
import { animal } from '../../objects/animals.js';

const yawTo = ([dx, dz]) => Math.atan2(-dx, -dz);
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/** Turn local [x, y, z] (forward −z) by yaw about the point at, lifted by y0. */
const place = (at, y0, yaw) => { const c = Math.cos(yaw), s = Math.sin(yaw); return ([x, y, z]) => [at[0] + c * x + s * z, y0 + y, at[1] - s * x + c * z]; };
function moved(g, at, y0, yaw) { g.rotateY(yaw); g.translate(at[0], y0, at[1]); return g; }

/** A spoked wheel in the plane x = xw (local), radius r, its hub at height r. */
function wheel(add, xw, r, spokes = 14) {
  const rim = lathe([[r, -0.04], [r, 0.04], [r - 0.07, 0.04], [r - 0.07, -0.04], [r, -0.04]], 24); rim.rotateZ(Math.PI / 2); rim.translate(xw, r, 0); add('wood_dark', rim);
  const tyre = lathe([[r + 0.012, -0.035], [r + 0.012, 0.035], [r, 0.035], [r, -0.035], [r + 0.012, -0.035]], 24); tyre.rotateZ(Math.PI / 2); tyre.translate(xw, r, 0); add('iron', tyre);
  const hub = lathe([[0.07, -0.16], [0.11, -0.08], [0.11, 0.08], [0.07, 0.16], [0.001, 0.16]], 10); hub.rotateZ(Math.PI / 2); hub.translate(xw, r, 0); add('wood_dark', hub);
  for (let k = 0; k < spokes; k++) { const g = box(-0.018, 0.08, -0.022, 0.018, r - 0.06, 0.022); g.rotateX(k / spokes * Math.PI * 2); g.translate(xw, r, 0); add('wood_dark', g); }
}

/**
 * peking_cart: { at, y, rot, beast ('horse' | 'donkey' for the mule), hood (cloth) } — after the Qing
 * cart in the Art Gallery of Greater Victoria: two iron-tyred wheels 1.24 m across on a wide axle,
 * the cab 1.22 long, 0.81 wide and 1.26 high with lattice sides, under a blue cotton top; two shafts,
 * 5.3 m overall; the beast in the shafts.
 */
export function pekingCart(el, { bag, col }) {
  const yaw = el.rot ?? 0, at = el.at, y0 = el.y ?? 0, rand = rng(el.seed ?? 1);
  const L = [], add = (m, g) => L.push([m, g]);
  const r = 0.62, axW = 0.98, fy = r + 0.12;
  for (const s of [-1, 1]) wheel(add, s * axW, r);
  add('wood_dark', lathe([[0.045, -axW - 0.18], [0.045, axW + 0.18]].map(([a, b]) => [a, b]), 8).rotateZ(Math.PI / 2).translate(0, r, 0));
  // the shafts, from behind the axle forward to the beast's shoulders, rising a little
  for (const s of [-1, 1]) {
    const t = []; const a = [s * 0.46, fy - 0.02, 1.15], b = [s * 0.42, fy + 0.25, -4.15];
    add('wood_dark', rod(a, b, 0.045, 6));
    void t;
  }
  // the cab: its floor, the frame posts, the lattice sides and back, the arched top of blue cotton
  const hw = 0.405, z0 = -0.7, z1 = 0.52, yb = fy + 0.04, H = 1.26;
  add('wood_dark', box(-hw - 0.04, fy - 0.04, z0 - 0.1, hw + 0.04, yb, z1 + 0.05));
  for (const sx of [-1, 1]) for (const zz of [z0, z1]) add('wood_dark', box(sx * hw - 0.03, yb, zz - 0.03, sx * hw + 0.03, yb + H * 0.62, zz + 0.03));
  for (const sx of [-1, 1]) add('koshi', box(sx * hw - 0.012, yb + 0.12, z0 + 0.03, sx * hw + 0.012, yb + H * 0.6, z1 - 0.03));
  add('koshi', box(-hw + 0.03, yb + 0.12, z1 - 0.012, hw - 0.03, yb + H * 0.6, z1 + 0.012));
  const tris = [], N = 10, rr = hw + 0.05, yc = yb + H * 0.62, za = z0 - 0.35, zb = z1 + 0.06;
  for (let k = 0; k < N; k++) {
    const a0 = Math.PI * k / N, a1 = Math.PI * (k + 1) / N, p = (a, z, o = 0) => [Math.cos(a) * (rr + o), yc + Math.sin(a) * (rr * 0.95 + o), z];
    tris.push(...p(a0, za, 0.012), ...p(a1, zb, 0.012), ...p(a0, zb, 0.012), ...p(a0, za, 0.012), ...p(a1, za, 0.012), ...p(a1, zb, 0.012));     // outside
    tris.push(...p(a0, za), ...p(a0, zb), ...p(a1, zb), ...p(a0, za), ...p(a1, zb), ...p(a1, za));                                       // inside
  }
  add(el.hood ?? 'cloth_indigo', fromTriangles(tris));
  // the curtain hung at the front, rolled half up; a cushion within
  add('cloth_indigo', box(-hw + 0.04, yb + H * 0.32, z0 - 0.02, hw - 0.04, yb + H * 0.62, z0 + 0.0));
  add('cloth_red', box(-hw + 0.05, yb, z0 + 0.1, hw - 0.05, yb + 0.1, z1 - 0.1));
  for (const [m, g] of L) bag.add(m, moved(g, at, y0, yaw));
  if (el.beast !== 'none') {
    const P = place(at, y0, yaw), p = P([0, 0, -2.95]);
    animal({ t: 'animal', kind: el.beast ?? 'horse', at: [p[0], p[2]], y: y0, rot: yaw, gear: false, graze: false, seed: (el.seed ?? 1) + 7, mat: el.coat }, { bag, col });
  }
  col.circle(at[0], at[1], 1.1, y0, y0 + 2.2);
}

/**
 * camel_string: { at (the leader's place), dir, n, y, seed } — n camels one behind another 2.9 m
 * apart, each with its pack saddle and two bales (the coal in sacks), a bell under its neck, a rope
 * from each one's nose peg back to the saddle of the one before it.
 */
export function camelString(el, { bag, col }) {
  const [dx, dz] = el.dir ?? [0, -1], l = Math.hypot(dx, dz), u = [dx / l, dz / l], yaw = yawTo(u), y0 = el.y ?? 0, n = el.n ?? 6, rand = rng(el.seed ?? 3);
  const R = [];
  for (let k = 0; k < n; k++) {
    const c = [el.at[0] - u[0] * 2.9 * k + (rand() - 0.5) * 0.25, el.at[1] - u[1] * 2.9 * k + (rand() - 0.5) * 0.25], yk = yaw + (rand() - 0.5) * 0.12;
    animal({ t: 'animal', kind: 'camel', at: c, y: y0, rot: yk, gear: true, graze: false, seed: (el.seed ?? 3) * 31 + k, mat: rand() < 0.7 ? 'hide_tan' : 'hide_brown' }, { bag, col });
    const P = place(c, y0, yk);
    // the bell, hung from a strap under the throat
    const b = P([0, 1.2, -1.0]);
    bag.add('bronze', lathe([[0.001, 0], [0.06, 0.01], [0.075, 0.08], [0.06, 0.16], [0.03, 0.2], [0.001, 0.21]], 10, null, b[0], b[1] - 0.2, b[2]));
    bag.add('hide_brown', rod(P([0, 1.46, -1.0]), [b[0], b[1], b[2]], 0.012, 4));
    // the lead rope from the nose back to the saddle of the camel in front, sagging between
    if (k > 0) {
      const nose = P([0, 1.95, -1.75]), prev = place([el.at[0] - u[0] * 2.9 * (k - 1), el.at[1] - u[1] * 2.9 * (k - 1)], y0, yaw)([0.0, 1.55, 0.75]);
      const mid = [(nose[0] + prev[0]) / 2, Math.min(nose[1], prev[1]) - 0.35, (nose[2] + prev[2]) / 2];
      R.push(rod(nose, mid, 0.012, 4), rod(mid, prev, 0.012, 4));
    }
  }
  for (const g of R) bag.add('hide_tan', g);
}
