// The lanes and gardens of Justinian's Constantinople (docs/settlements/constantinople.md §14): the walled gardens that fill some
// blocks (a brick wall with a gate, a well-head, a vine pergola, beds, a store), the house-bridges that span a lane
// between two tenements (a passage on a brick arch with a window), cloth awnings strung across a lane, wall shrines with
// their lamps and niche fountains against garden walls. Registered into the `roman` style.

import { STYLES } from '../../core/build.js';
import { box, frustum, lathe } from '../../core/geom.js';
import { solid8, rng } from './houses.js';
import '../roman/town.js';

/** byz_garden: { rect, y, seed, gate ('n'|'s'|'e'|'w') } — the walled garden of a whole block. */
function garden(el, { bag, col }) {
  const rand = rng(el.seed || 1), [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, th = 0.5, wh = 2.6 + rand() * 0.4, far = !!el.simple;
  const gate = el.gate ?? 'sens'[Math.floor(rand() * 4)], gc = (a, b) => (a + b) / 2 + (rand() - 0.5) * 6, gw = 2.2;
  const wall = (a, b, c, d, hh = wh) => { bag.add('brick', box(a, y - 0.6, b, c, y + hh, d)); col.rect([a, b, c, d], y - 0.6, y + hh);
    if (!far) { bag.add('limestone', box(a - 0.07, y + hh, b - 0.07, c + 0.07, y + hh + 0.1, d + 0.07)); } };
  const sides = { n: [x0, z0, x1, z0 + th, 'x'], s: [x0, z1 - th, x1, z1, 'x'], w: [x0, z0, x0 + th, z1, 'z'], e: [x1 - th, z0, x1, z1, 'z'] };
  for (const [k, [a, b, c, d, ax]] of Object.entries(sides)) {
    if (k !== gate) { wall(a, b, c, d); continue; }
    const m = ax === 'x' ? gc(a, c) : gc(b, d);
    if (ax === 'x') { wall(a, b, m - gw / 2, d); wall(m + gw / 2, b, c, d); bag.add('timber', box(m - gw / 2 - 0.1, y + 2.4, b - 0.05, m + gw / 2 + 0.1, y + 2.65, d + 0.05)); if (!far) bag.add('wood_dark', box(m - gw / 2 + 0.05, y, b + 0.1, m - 0.1, y + 2.4, b + 0.2)); }
    else { wall(a, b, c, m - gw / 2); wall(a, m + gw / 2, c, d); bag.add('timber', box(a - 0.05, y + 2.4, m - gw / 2 - 0.1, c + 0.05, y + 2.65, m + gw / 2 + 0.1)); if (!far) bag.add('wood_dark', box(a + 0.1, y, m - gw / 2 + 0.05, a + 0.2, y + 2.4, m - 0.1)); }
  }
  if (far) return;
  // buttresses along the long walls
  for (let u = x0 + 4; u < x1 - 2; u += 6) for (const zz of [z0, z1 - th]) bag.add('brick', box(u, y - 0.6, zz < z0 + 1 ? zz - 0.15 : zz, u + 0.5, y + wh - 0.3, zz < z0 + 1 ? zz + th : zz + th + 0.15));
  // the well-head
  const cx = (x0 + x1) / 2 + (rand() - 0.5) * 6, cz = (z0 + z1) / 2 + (rand() - 0.5) * 4;
  bag.add('marble', lathe([[0.7, 0], [0.7, 0.9], [0.55, 0.92], [0.55, 0.2]], 14, null, cx, y, cz)); bag.add('water', lathe([[0.001, 0.4], [0.55, 0.4]], 10, null, cx, y, cz)); col.circle(cx, cz, 0.75, y, y + 0.9);
  for (const s of [-1, 1]) bag.add('limestone', box(cx + s * 0.85 - 0.08, y, cz - 0.08, cx + s * 0.85 + 0.08, y + 1.9, cz + 0.08));
  bag.add('timber', box(cx - 0.95, y + 1.9, cz - 0.07, cx + 0.95, y + 2.02, cz + 0.07));
  // a vine pergola along the north inside wall: posts, beams, the leaves overhead
  const pa = x0 + 4, pb = Math.min(x1 - 4, pa + 16), pz = z0 + th + 2.6;
  for (let u = pa; u <= pb + 0.1; u += 3.2) for (const zz of [z0 + th + 0.3, pz]) { bag.add('timber', box(u - 0.07, y, zz - 0.07, u + 0.07, y + 2.5, zz + 0.07)); col.circle(u, zz, 0.1, y, y + 2.5); }
  for (let u = pa; u <= pb + 0.1; u += 3.2) bag.add('timber', box(u - 0.06, y + 2.5, z0 + th + 0.2, u + 0.06, y + 2.58, pz + 0.1));
  for (let zz = z0 + th + 0.4; zz < pz; zz += 0.9) bag.add('timber', box(pa - 0.1, y + 2.58, zz, pb + 0.1, y + 2.64, zz + 0.05));
  bag.add('mosaic_green', box(pa - 0.2, y + 2.64, z0 + th + 0.1, pb + 0.2, y + 2.8, pz + 0.2));
  bag.add('wood_painted', box(pa + 2, y, z0 + th + 0.6, pa + 4.2, y + 0.45, z0 + th + 1.0));   // a bench under it
  // the beds: low ridges of earth in rows, the store with its tiled roof
  for (let zz = cz + 3; zz < z1 - th - 3; zz += 1.7) for (const [a, b] of [[x0 + 3, cx - 3], [cx + 3, x1 - 3]]) if (b > a) bag.add('earth_wall', box(a, y, zz, b, y + 0.22, zz + 0.7));
  const sx = x1 - th - 8, sz = z0 + th + 1.5;
  bag.add('plaster', box(sx, y - 0.4, sz, sx + 5.5, y + 2.8, sz + 4)); col.rect([sx, sz, sx + 5.5, sz + 4], y - 0.4, y + 2.8);
  bag.add('opening', box(sx + 2.2, y, sz + 3.95, sx + 3.3, y + 2.1, sz + 4.02));
  bag.add('roof_tile', frustum([sx - 0.5, sz - 0.5, sx + 6, sz + 4.5], y + 2.8, y + 4.0, 0.3, 0.3, 2.2, 2.2));
}

/** byz_bridge: { at, y, along ('x'|'z'), w (the lane, 5), len (along the lane, 4), h (the passage's height, 4.3) } — a house-bridge over a lane. */
function bridge(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, w = el.w ?? 5, L = el.len ?? 4, h = el.h ?? 4.3, top = el.top ?? 6.9, ax = el.along === 'x';
  const R = (a0, a1, b0, b1) => (ax ? [x + a0, z + b0, x + a1, z + b1] : [x + b0, z + a0, x + b1, z + a1]);   // a along the lane, b across it
  const add = (m, a0, a1, b0, b1, y0, y1) => { const r = R(a0, a1, b0, b1); bag.add(m, box(r[0], y0, r[1], r[2], y1, r[3])); return r; };
  // the arch's springers are the house walls themselves; the passage sits on a lintel beam under a plastered box with a window
  add('timber', -L / 2, L / 2, -w / 2 - 0.3, w / 2 + 0.3, y + h, y + h + 0.3);
  const r = add('plaster', -L / 2 + 0.1, L / 2 - 0.1, -w / 2 - 0.3, w / 2 + 0.3, y + h + 0.3, y + top); col.rect(r, y + h, y + top);
  for (const s of [-1, 1]) {
    add('limestone', -L / 2, L / 2, s * (w / 2 - 0.05) - 0.1, s * (w / 2 - 0.05) + 0.1, y + h - 0.3, y + h);   // a cornice course each side
    add('opening', -0.5, 0.5, s * (w / 2 + 0.3) - 0.02, s * (w / 2 + 0.3) + 0.02, y + h + 0.9, y + h + 1.9);
    add('shutter_brown', -0.9, -0.5, s * (w / 2 + 0.3) - 0.04, s * (w / 2 + 0.3) + 0.04, y + h + 0.9, y + h + 1.9);
  }
  // brackets of timber at the soffit
  for (const a of [-L / 2 + 0.4, L / 2 - 0.4]) add('timber', a - 0.1, a + 0.1, -w / 2 + 0.05, w / 2 - 0.05, y + h - 0.2, y + h);
  const t = R(-L / 2 - 0.3, L / 2 + 0.3, -w / 2 - 0.5, w / 2 + 0.5);
  bag.add('roof_tile', solid8([[t[0], y + top + 0.7, t[1]], [t[2], y + top + 0.7, t[1]], [t[2], y + top + 0.1, t[3]], [t[0], y + top + 0.1, t[3]], [t[0], y + top + 0.85, t[1]], [t[2], y + top + 0.85, t[1]], [t[2], y + top + 0.25, t[3]], [t[0], y + top + 0.25, t[3]]]));
}

/** byz_awning: { at, y, along, w, len } — a cloth strung across a lane from the eaves of one front to the other, at 3.7 m, a lamp hung below. */
function awning(el, { bag }) {
  const [x, z] = el.at, y = el.y ?? 0, w = el.w ?? 5, L = el.len ?? 2.4, ax = el.along === 'x', m = el.mat ?? 'cloth_ochre';
  const R = (a0, a1, b0, b1) => (ax ? [x + a0, z + b0, x + a1, z + b1] : [x + b0, z + a0, x + b1, z + a1]);
  const r = R(-L / 2, L / 2, -w / 2, w / 2);
  bag.add(m, solid8([[r[0], y + 3.75, r[1]], [r[2], y + 3.75, r[1]], [r[2], y + 3.55, r[3]], [r[0], y + 3.55, r[3]], [r[0], y + 3.8, r[1]], [r[2], y + 3.8, r[1]], [r[2], y + 3.6, r[3]], [r[0], y + 3.6, r[3]]]));
  bag.add('timber', box(x - 0.04, y + 3.2, z - 0.04, x + 0.04, y + 3.55, z + 0.04)); bag.add('glass_lamp', box(x - 0.1, y + 2.95, z - 0.1, x + 0.1, y + 3.2, z + 0.1));
}

/** byz_shrine: { at, y, rot } — a pier of limestone with a niche holding an icon, a lamp before it, a step. */
function shrine(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, a = el.rot ?? 0, c = Math.cos(a), s = Math.sin(a), P = (u, v) => [x + u * c - v * s, z + u * s + v * c];
  const part = (u0, v0, u1, v1, y0, y1, m) => { const p = P(u0, v0), q = P(u1, v1); const r = [Math.min(p[0], q[0]), Math.min(p[1], q[1]), Math.max(p[0], q[0]), Math.max(p[1], q[1])]; bag.add(m, box(r[0], y0, r[1], r[2], y1, r[3])); return r; };
  col.rect(part(-0.45, -0.35, 0.45, 0.35, y, y + 2.2, 'limestone'), y, y + 2.2);
  part(-0.55, -0.45, 0.55, 0.45, y + 2.2, y + 2.4, 'marble'); part(-0.3, -0.3, 0.3, 0.3, y + 2.4, y + 2.6, 'roof_tile');
  part(-0.25, 0.33, 0.25, 0.37, y + 1.2, y + 1.9, 'paint_blue'); part(-0.28, 0.35, 0.28, 0.4, y + 1.15, y + 1.2, 'gilt_bronze'); part(-0.28, 0.35, 0.28, 0.4, y + 1.9, y + 1.95, 'gilt_bronze');
  part(-0.05, 0.4, 0.05, 0.6, y + 0.95, y + 1.0, 'bronze'); part(-0.03, 0.46, 0.03, 0.52, y + 1.0, y + 1.1, 'flame');
  part(-0.6, 0.35, 0.6, 0.8, y, y + 0.15, 'limestone');
}

Object.assign(STYLES.roman.elements, { byz_garden: garden, byz_bridge: bridge, byz_awning: awning, byz_shrine: shrine });
