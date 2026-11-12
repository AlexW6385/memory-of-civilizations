// Newar architecture of the Kathmandu Valley, Bhaktapur about 1710 (docs/settlements/bhaktapur.md §4):
// the pagoda temple (a brick core under stepped tile roofs on carved struts, standing on a stepped
// plinth with its guardians), the Newar brick house with its carved timber windows and deep eaves,
// the stone shikhara, the dabali, the pati, the chaitya, the stone spout, and the potters' court.
// Everything is built from palette materials; repeated pieces are identical shapes so that they
// instance.

import { registerStyle, STYLES } from '../../core/build.js';
import { box, lathe, fromTriangles, rod, quad } from '../../core/geom.js';
import '../qing/index.js';
import { houseParts } from './house.js';
import { pagoda, shikhara, chaitya } from './temples.js';
import { potCourt, potterWheel, kiln, pot } from './pottery.js';
import { lane, makeCourt, yard } from './street.js';
import { inlay, offerings, trisul, bunting } from './dress.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const bx = (x0, y0, z0, x1, y1, z1) => box(Math.min(x0, x1), Math.min(y0, y1), Math.min(z0, z1), Math.max(x0, x1), Math.max(y0, y1), Math.max(z0, z1));

/** newar_paving { rect, y, th, mat }: brick laid flat; the top at y (default 0.05), walkable. */
function paving(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0.05, th = el.th ?? 0.3;
  bag.add(el.mat ?? 'brick_paving', box(x0, y - th, z0, x1, y, z1));
  col.floor([x0, z0, x1, z1], y);
}

/**
 * A hipped tile roof over the rectangle r at height y, rising `rise`, eaves out by o = [−x, −z, +x, +z]; the ridge runs along x when `ridgeX`
 * (default: along the longer side). The ridge is as long as the roof's long side exceeds its short side (a point on a square).
 */
export function hipRoof(bag, r, y, rise, o = [0.5, 0.5, 0.5, 0.5], mat = 'roof_tile', ridgeX = null) {
  let [x0, z0, x1, z1] = r;
  x0 -= o[0]; z0 -= o[1]; x1 += o[2]; z1 += o[3];
  const alongX = ridgeX ?? (x1 - x0) >= (z1 - z0), out = [], yt = y + rise, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  if (alongX) {
    const hw = Math.max(0, ((x1 - x0) - (z1 - z0)) / 2), a = cx - hw, b = cx + hw;
    quad(out, [x0, y, z1], [x1, y, z1], [b, yt, cz], [a, yt, cz]);
    quad(out, [x1, y, z0], [x0, y, z0], [a, yt, cz], [b, yt, cz]);
    out.push(x0, y, z0, x0, y, z1, a, yt, cz);
    out.push(x1, y, z1, x1, y, z0, b, yt, cz);
  } else {
    const hw = Math.max(0, ((z1 - z0) - (x1 - x0)) / 2), a = cz - hw, b = cz + hw;
    quad(out, [x1, y, z1], [x1, y, z0], [cx, yt, a], [cx, yt, b]);
    quad(out, [x0, y, z0], [x0, y, z1], [cx, yt, b], [cx, yt, a]);
    out.push(x0, y, z1, x1, y, z1, cx, yt, b);
    out.push(x1, y, z0, x0, y, z0, cx, yt, a);
  }
  bag.add(mat, fromTriangles(out));
  bag.add('wood_dark', bx(x0, y - 0.07, z0, x1, y - 0.02, z1));                  // the soffit under the eaves
  // the eave's edge: a fascia board all round
  const f = 0.14, t = 0.07;
  bag.add('wood_dark', bx(x0, y - f, z0, x1, y + 0.02, z0 + t)); bag.add('wood_dark', bx(x0, y - f, z1 - t, x1, y + 0.02, z1));
  bag.add('wood_dark', bx(x0, y - f, z0 + t, x0 + t, y + 0.02, z1 - t)); bag.add('wood_dark', bx(x1 - t, y - f, z0 + t, x1, y + 0.02, z1 - t));
}

/** dabali { rect, h, stair ('n'|'s'|'e'|'w') }: a raised platform of brick with a stone coping and a stair on one side; walkable. */
function dabali(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, h = el.h ?? 0.8, n = Math.round(h / 0.2), st = el.stair ?? 's';
  bag.add('brick', box(x0, 0, z0, x1, h - 0.1, z1)); bag.add('sandstone', box(x0 - 0.08, h - 0.1, z0 - 0.08, x1 + 0.08, h, z1 + 0.08));
  col.rect([x0 - 0.08, z0 - 0.08, x1 + 0.08, z1 + 0.08], 0, h); col.floor([x0, z0, x1, z1], h);
  const w = Math.min(2.2, (st === 'n' || st === 's' ? x1 - x0 : z1 - z0) * 0.5), mx = (x0 + x1) / 2, mz = (z0 + z1) / 2;
  for (let k = 1; k <= n; k++) {
    const d = (n - k + 1) * 0.3, t = k * h / n;
    const r = st === 's' ? [mx - w / 2, z1, mx + w / 2, z1 + d] : st === 'n' ? [mx - w / 2, z0 - d, mx + w / 2, z0] : st === 'e' ? [x1, mz - w / 2, x1 + d, mz + w / 2] : [x0 - d, mz - w / 2, x0, mz + w / 2];
    bag.add('sandstone', box(r[0], 0, r[1], r[2], t, r[3]));
    col.rect(r, 0, t); col.floor(r, t);
  }
}

/** pati { rect, y }: the open rest-house — a raised platform, posts, a tile roof; one can walk in and sit. */
function pati(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, h = 0.55, hh = 3.1;
  bag.add('brick', box(x0, 0, z0, x1, h - 0.08, z1)); bag.add('sandstone', box(x0 - 0.06, h - 0.08, z0 - 0.06, x1 + 0.06, h, z1 + 0.06));
  col.rect([x0 - 0.06, z0 - 0.06, x1 + 0.06, z1 + 0.06], 0, h); col.floor([x0, z0, x1, z1], h);
  const n = Math.max(2, Math.round((x1 - x0) / 2.4)), m = Math.max(2, Math.round((z1 - z0) / 2.4));
  for (let i = 0; i <= n; i++) for (const z of [z0 + 0.3, z1 - 0.3]) { const x = x0 + 0.3 + (x1 - x0 - 0.6) * i / n; bag.add('timber', box(x - 0.13, h, z - 0.13, x + 0.13, h + hh, z + 0.13)); col.circle(x, z, 0.16, h, h + hh); }
  for (let j = 1; j < m; j++) for (const x of [x0 + 0.3, x1 - 0.3]) { const z = z0 + 0.3 + (z1 - z0 - 0.6) * j / m; bag.add('timber', box(x - 0.13, h, z - 0.13, x + 0.13, h + hh, z + 0.13)); col.circle(x, z, 0.16, h, h + hh); }
  bag.add('wood_painted', box(x0, h + hh, z0, x1, h + hh + 0.25, z1));
  hipRoof(bag, [x0, z0, x1, z1], h + hh + 0.25, 1.6, [0.9, 0.9, 0.9, 0.9]);
  bag.add('wood_ochre', box(x0 + 0.9, h, z1 - 0.9, x1 - 0.9, h + 0.04, z1 - 0.3));
}

/** dhara { c, yaw }: the stone water spout — a back wall with three spouts and a basin; ~3.2 m wide. */
function dhara(el, { bag, col }) {
  const [cx, cz] = el.c, yaw = el.yaw ?? 0, co = Math.cos(yaw), si = Math.sin(yaw);
  const P = (u, v) => [cx + u * co + v * si, cz - u * si + v * co];
  const B = (u0, y0, v0, u1, y1, v1, mat) => { const a = P(u0, v0), b = P(u1, v1); bag.add(mat, bx(a[0], y0, a[1], b[0], y1, b[1])); };
  B(-1.6, 0, -0.25, 1.6, 1.7, 0.25, 'sandstone'); B(-1.7, 1.7, -0.3, 1.7, 1.85, 0.3, 'sandstone_dressed');
  B(-1.1, 0, 0.25, 1.1, 0.5, 1.2, 'granite_grey'); B(-0.95, 0.35, 0.4, 0.95, 0.52, 1.05, 'water');
  for (const u of [-0.7, 0, 0.7]) { const a = P(u, 0.25), b = P(u, 0.55); bag.add('bronze', rod([a[0], 1.05, a[1]], [b[0], 0.95, b[1]], 0.045, 6)); }
  { const a = P(-1.7, -0.3), b = P(1.7, 1.2); col.rect([Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])], 0, 1.8); }
}

/** newar_goods: a front stall's goods { at, yaw, kind: 'pots' | 'cloth' | 'grain' | 'fruit' }: instanced small shapes on a plank counter. */
function stall(el, { bag, col }) {
  const [cx, cz] = el.at, yaw = el.yaw ?? 0, co = Math.cos(yaw), si = Math.sin(yaw), rand = rng(el.seed ?? 3);
  const P = (u, v) => [cx + u * co + v * si, cz - u * si + v * co];
  const a = P(-0.9, -0.4), b = P(0.9, 0.4);
  bag.add('wood_ochre', bx(a[0], 0.62, a[1], b[0], 0.68, b[1]));
  for (const u of [-0.85, 0.85]) for (const v of [-0.35, 0.35]) { const p = P(u, v); bag.add('wood_dark', bx(p[0] - 0.04, 0, p[1] - 0.04, p[0] + 0.04, 0.62, p[1] + 0.04)); }
  col.rect([Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])], 0, 0.7);
  // two poles and a cloth awning over the seller's end
  const aw = ['cloth_red', 'cloth_ochre', 'cloth_indigo', 'cloth_white'][(el.seed ?? 0) % 4];
  for (const u of [-1.0, 1.0]) { const p = P(u, -0.5); bag.add('timber', bx(p[0] - 0.03, 0, p[1] - 0.03, p[0] + 0.03, 2.25, p[1] + 0.03)); }
  { const q0 = P(-1.2, -0.65), q1 = P(1.2, 0.75); bag.add(aw, bx(q0[0], 2.2, q0[1], q1[0], 2.26, q1[1])); }
  const kind = el.kind ?? 'pots';
  for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) {
    const p = P(-0.65 + i * 0.43, -0.18 + j * 0.36);
    if (kind === 'pots') pot(bag, p[0], 0.68, p[1], j ? 'cup' : 'round', 0.8 + rand() * 0.2);
    else if (kind === 'cloth') bag.add(['cloth_red', 'cloth_indigo', 'cloth_white', 'cloth_ochre'][(i + j) % 4], bx(p[0] - 0.17, 0.68, p[1] - 0.14, p[0] + 0.17, 0.68 + 0.08 + 0.05 * ((i * 3 + j) % 3), p[1] + 0.14));
    else if (kind === 'grain') bag.add(['cloth_ochre', 'sacking', 'paint_ochre'][(i + j) % 3], lathe([[0.001, 0.68], [0.2, 0.68], [0.17, 0.76], [0.001, 0.85]], 8, null, p[0], 0, p[1]));
    else bag.add(['cloth_red', 'cloth_ochre', 'cloth_green'][(i + j) % 3], lathe([[0.001, 0.68], [0.09, 0.7], [0.1, 0.77], [0.05, 0.82], [0.001, 0.82]], 7, null, p[0], 0, p[1]));
  }
}

/** newar_tree { at, h, kind }: a shade tree stand-in for the squares: a pipal's bole and crown (a placed shape). */
function pipalTree(el, { bag, col }) {
  const [x, z] = el.at, h = el.h ?? 9;
  bag.add('bark_grey', lathe([[0.5, 0], [0.38, 0.8], [0.3, h * 0.3], [0.26, h * 0.5]], 9, null, x, 0, z));
  for (let k = 0; k < 3; k++) { const a = k * 2.1 + (el.seed ?? 0); bag.add('bark_grey', rod([x, h * 0.4, z], [x + Math.cos(a) * h * 0.32, h * 0.72, z + Math.sin(a) * h * 0.32], 0.14, 6)); }
  col.circle(x, z, 0.5, 0, 3);
  bag.add('lotus_leaf', lathe([[0.001, h * 0.55], [h * 0.38, h * 0.62], [h * 0.42, h * 0.78], [h * 0.3, h * 0.98], [0.001, h * 1.08]], 10, (t, i) => 1 + 0.12 * Math.sin(t * 5 + (el.seed ?? 0)), x, 0, z));
  // the platform round the bole (a Newar tree stands on its brick seat)
  bag.add('brick', box(x - 1.5, 0, z - 1.5, x + 1.5, 0.45, z + 1.5)); col.rect([x - 1.5, z - 1.5, x + 1.5, z + 1.5], 0, 0.45); col.floor([x - 1.5, z - 1.5, x + 1.5, z + 1.5], 0.45);
}

const newarCourt = makeCourt({ dhara, pati, tree: pipalTree });

registerStyle('newar', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: {
    ...STYLES.qing.elements,
    newar_paving: paving, newar_pagoda: pagoda, newar_shikhara: shikhara, newar_chaitya: chaitya,
    newar_house: (el, ctx) => houseParts(el, ctx, { hipRoof }),
    newar_dabali: dabali, newar_pati: pati, newar_dhara: dhara, newar_stall: stall, newar_tree: pipalTree,
    newar_inlay: inlay, newar_offerings: offerings, newar_trisul: trisul, newar_bunting: bunting,
    newar_lane: lane, newar_yard: yard, newar_court: newarCourt, newar_pot_court: potCourt, newar_wheel: potterWheel, newar_kiln: kiln,
  },
  objects: {},
});
