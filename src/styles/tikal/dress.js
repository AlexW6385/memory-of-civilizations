// Tikal's dressing: weathering of the stucco and plaster in the humid lowlands (rain runnels, lost paint, moss at the foot), the stucco
// masks flanking the stairs, murals and door curtains in the vaulted rooms, and the small things of the town — the kitchen shed,
// the maize granary, the hammock, the incense burner, the chultun (the bell-shaped cistern of the courts), the market awning.
// Everything is a closed solid or a flat patch, merged into the plan's bags (docs/settlements/maya-tikal.md §4–§5, §8).

import { box, lathe, rod } from '../../core/geom.js';
import { patch, soot, put, hearthKit, ollaKit, metateKit, waterJarKit, storeJarKit } from '../maya/household.js';
import { frame, slab, frust, hex, rng, L, RED, LIME } from './kit.js';

/** Stains on a battered tier face: a rain runnel, a patch where the paint has gone, moss low down; `skip` {nx, nz, w} keeps the stair's face clear. */
export function tierWeather(bag, cx, cz, a0, b0, af, bf, y0, th, rand, skip = null) {
  const tilt = Math.atan2(a0 - af, th * 0.86);
  for (const [nx, nz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const A = nx ? a0 : b0, across = nx ? b0 : a0, Af = nx ? af : bf;
    const at = (y, u) => { const h = A - (A - Af) * (y - y0) / (th * 0.86); return [cx + nx * h + (nz ? u : 0), y, cz + nz * h + (nx ? u : 0)]; };
    const free = (u) => !(skip && skip.nx === nx && skip.nz === nz && Math.abs(u) < skip.w);
    const span = across - 1.4;
    if (span < 0.5) continue;
    const u1 = (rand() * 2 - 1) * span;
    if (rand() < 0.8 && free(u1)) patch(bag, 'plaster_damp', at(y0 + th * 0.46, u1), [nx, 0, nz], 0.2 + rand() * 0.25, th * (0.5 + rand() * 0.3), Math.floor(rand() * 1e6), 0.012, tilt);
    const u2 = (rand() * 2 - 1) * span;
    if (rand() < 0.5 && free(u2)) patch(bag, 'limestone_maya', at(y0 + th * (0.3 + rand() * 0.3), u2), [nx, 0, nz], 0.9 + rand() * 1.4, 0.4 + rand() * 0.5, Math.floor(rand() * 1e6), 0.016, tilt);
    const u3 = (rand() * 2 - 1) * span;
    if (rand() < 0.4 && free(u3)) patch(bag, 'stucco_leaf', at(y0 + th * 0.16, u3), [nx, 0, nz], 0.7 + rand() * 1.1, 0.22 + rand() * 0.2, Math.floor(rand() * 1e6), 0.02, tilt);
  }
}

/** The same on a sheer face of a platform or a wall: runnels from the top, a green foot, bare core where the plaster has fallen. */
export function wallWeather(bag, F, v0, v1, y0, y1, rand, n = 6, front = 0) {
  const nrm = [-F.U[0], 0, -F.U[1]], H = y1 - y0;
  for (let i = 0; i < n; i++) {
    const v = v0 + (v1 - v0) * (i + rand()) / n, p = F.P(front, v), r = rand();
    if (r < 0.45) patch(bag, 'plaster_damp', [p[0], y1 - H * 0.4, p[1]], nrm, 0.2 + rand() * 0.3, H * (0.45 + rand() * 0.35), Math.floor(rand() * 1e6), 0.012);
    else if (r < 0.75) patch(bag, 'stucco_leaf', [p[0], y0 + 0.2 + rand() * 0.2, p[1]], nrm, 0.8 + rand(), 0.25 + rand() * 0.2, Math.floor(rand() * 1e6), 0.015);
    else patch(bag, 'rubble', [p[0], y0 + H * (0.3 + rand() * 0.4), p[1]], nrm, 0.5 + rand() * 0.8, 0.35 + rand() * 0.4, Math.floor(rand() * 1e6), 0.015);
  }
}

/** k_mask { c [x, z] (the middle of its foot on the face), face, y, s }: the stucco mask of the Sun God or of a god of the earth, in red and blue with a bared mouth. */
export function mask(el, { bag }) {
  const F = frame(el.face, ...el.c), y = el.y ?? 0, s = el.s ?? 1, R = (u0, u1, v0, v1) => F.R(u0 * s, u1 * s, v0 * s, v1 * s);
  const add = (m, r, y0, y1) => bag.add(m, box(r[0], y + y0 * s, r[1], r[2], y + y1 * s, r[3]));
  add(RED, R(-0.45, 0.2, -1.3, 1.3), 0, 2.5);                                     // the panel
  add(L, R(-0.5, 0.2, -1.4, -1.25), 0, 2.6); add(L, R(-0.5, 0.2, 1.25, 1.4), 0, 2.6);   // its frame
  add(L, R(-0.5, 0.2, -1.4, 1.4), 2.5, 2.65);
  add('maya_blue', R(-0.6, -0.4, -0.95, -0.35), 1.4, 1.95); add('maya_blue', R(-0.6, -0.4, 0.35, 0.95), 1.4, 1.95);   // the eyes
  add(L, R(-0.66, -0.5, -0.7, -0.55), 1.55, 1.8); add(L, R(-0.66, -0.5, 0.55, 0.7), 1.55, 1.8);                         // the pupils
  add(L, R(-0.85, -0.45, -0.28, 0.28), 0.85, 1.55);                                // the nose
  add(L, R(-0.6, -0.42, -0.8, 0.8), 0.35, 0.75);                                    // the mouth
  for (const v of [-0.55, -0.2, 0.2, 0.55]) add('limestone_carved', R(-0.66, -0.55, v - 0.07, v + 0.07), 0.42, 0.72);   // the teeth
  for (const sg of [-1, 1]) { add('maya_blue', R(-0.55, -0.35, sg * 1.05 - 0.2, sg * 1.05 + 0.2), 0.7, 1.3); add(L, R(-0.6, -0.4, sg * 1.05 - 0.1, sg * 1.05 + 0.1), 1.0, 1.15); }  // the ear flares
  add('maya_blue', R(-0.55, -0.4, -0.7, 0.7), 2.0, 2.3);                          // the headband
}

/** A hanging mat across a doorway, rolled up to a third. */
export function curtain(bag, F, v, y, w = 1.2, h = 0.9) {
  const r = F.R(-0.12, -0.06, v - w / 2, v + w / 2);
  bag.add('reed_mat', box(r[0], y - h, r[1], r[2], y, r[3]));
}

/** A hammock hung between (a) and (b), a net of cotton cord sagging; the end cords gathered to the posts. */
export function hammock(bag, a, b, sag = 0.5, mat = 'cloth_white') {
  const n = 9, dx = b[0] - a[0], dz = b[2] - a[2], len = Math.hypot(dx, dz), th = -Math.atan2(dz, dx), pts = [];
  for (let i = 0; i <= n; i++) { const t = i / n; pts.push([a[0] + dx * t, a[1] + (b[1] - a[1]) * t - sag * 4 * t * (1 - t), a[2] + dz * t]); }
  for (let i = 0; i < n; i++) {
    const p = pts[i], q = pts[i + 1], l = Math.hypot(q[0] - p[0], q[2] - p[2]), dy = q[1] - p[1], sl = Math.atan2(dy, l), seg = Math.hypot(l, dy);
    const g = box(-seg / 2 - 0.01, -0.025, -0.34, seg / 2 + 0.01, 0.025, 0.34); g.rotateZ(sl); g.rotateY(th);
    bag.add(mat, g.translate((p[0] + q[0]) / 2, (p[1] + q[1]) / 2, (p[2] + q[2]) / 2));
  }
  for (const [e, m] of [[a, pts[1]], [b, pts[n - 1]]]) bag.add('rope_fibre', rod([e[0], e[1] + 0.02, e[2]], [m[0], m[1] + 0.02, m[2]], 0.025, 5));
  void len;
}

/** k_shed { c, w, d, seed }: the open kitchen under its own thatch — four posts, a hipped roof, a hearth and a metate on the earth floor, jars. */
export function shed(el, { bag, col }) {
  const [cx, cz] = el.c, w = el.w ?? 3.6, d = el.d ?? 3, rand = rng(el.seed ?? 5), P = 0.2;
  bag.add('rubble', box(cx - w / 2 - 0.3, -0.1, cz - d / 2 - 0.3, cx + w / 2 + 0.3, P, cz + d / 2 + 0.3));
  col.floor([cx - w / 2 - 0.3, cz - d / 2 - 0.3, cx + w / 2 + 0.3, cz + d / 2 + 0.3], P);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const x = cx + sx * w / 2, z = cz + sz * d / 2; bag.add('timber', rod([x, P, z], [x, P + 2.1, z], 0.075, 6)); col.circle(x, z, 0.1, P, P + 2.1); }
  frust(bag, 'thatch_palm', cx, cz, w / 2 + 0.7, d / 2 + 0.7, 0.35, 0.35, P + 1.95, P + 3.4);
  bag.add('timber', box(cx - w / 2, P + 1.9, cz - 0.05, cx + w / 2, P + 2.0, cz + 0.05));
  put(bag, hearthKit('rubble'), cx - 0.3, P, cz, 0); col.circle(cx - 0.3, cz, 0.42, P, P + 0.3);
  put(bag, ollaKit(), cx - 0.6, P, cz - 0.7, 0);
  put(bag, metateKit(), cx + w / 2 - 1.0, P, cz + 0.4, Math.PI);
  put(bag, waterJarKit(), cx + w / 2 - 0.35, P, cz - d / 2 + 0.4, 0); col.circle(cx + w / 2 - 0.35, cz - d / 2 + 0.4, 0.33, P, P + 0.8);
  put(bag, storeJarKit(), cx - w / 2 + 0.4, P, cz + d / 2 - 0.4, 0);
  soot(bag, [cx - 0.3, P + 2.6, cz], [0, -1, 0], 1.6, 1.6, Math.floor(rand() * 1e6));
  void rand;
}

/** k_granary { c, seed }: the maize crib on posts — a wattle bin under a pointed thatch, a notched log up to its door. */
export function granary(el, { bag, col }) {
  const [cx, cz] = el.c, r = 0.85, h0 = 0.8;
  for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { const x = cx + sx * (r - 0.15), z = cz + sz * (r - 0.15); bag.add('timber', rod([x, 0, z], [x, h0, z], 0.07, 6)); bag.add('limestone_maya', box(x - 0.14, h0 - 0.08, z - 0.14, x + 0.14, h0 - 0.02, z + 0.14)); }
  bag.add('timber', box(cx - r, h0, cz - r, cx + r, h0 + 0.1, cz + r));
  bag.add('reed_mat', box(cx - r + 0.04, h0 + 0.1, cz - r + 0.04, cx + r - 0.04, h0 + 1.25, cz + r - 0.04));
  for (const y of [h0 + 0.45, h0 + 0.85]) bag.add('wood_ochre', box(cx - r, y, cz - r, cx + r, y + 0.04, cz + r));
  bag.add('wood_dark', box(cx - 0.25, h0 + 0.5, cz + r - 0.02, cx + 0.25, h0 + 1.0, cz + r + 0.03));
  frust(bag, 'thatch_palm', cx, cz, r + 0.45, r + 0.45, 0.12, 0.12, h0 + 1.2, h0 + 2.5);
  bag.add('timber', rod([cx + 0.6, 0, cz + r + 0.9], [cx + 0.35, h0 + 0.5, cz + r + 0.05], 0.07, 5));
  col.circle(cx, cz, r + 0.1, 0, h0 + 2.4);
}

/** k_brazier { at, y }: the tripod censer of baked clay, copal burning in its bowl. */
export function brazier(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, r = el.r ?? 1;
  bag.add('pottery_dark', lathe([[0.001, 0.62 * r], [0.2 * r, 0.6 * r], [0.34 * r, 0.76 * r], [0.38 * r, 0.9 * r], [0.33 * r, 0.9 * r], [0.29 * r, 0.78 * r], [0.001, 0.7 * r]], 14, null, x, y, z));
  bag.add('cloth_black', lathe([[0.001, 0.86 * r], [0.3 * r, 0.88 * r], [0.001, 0.9 * r]], 10, null, x, y, z));
  for (let i = 0; i < 3; i++) { const a = i * 2.094 + (el.rot ?? 0), x1 = x + Math.cos(a) * 0.3 * r, z1 = z + Math.sin(a) * 0.3 * r; bag.add(RED, rod([x1, y, z1], [x + Math.cos(a) * 0.1 * r, y + 0.66 * r, z + Math.sin(a) * 0.1 * r], 0.05 * r, 5)); }
  bag.add(L, lathe([[0.001, 0], [0.5 * r, 0], [0.5 * r, 0.05], [0.001, 0.05]], 12, null, x, y, z));
  col.circle(x, z, 0.4 * r, y, y + 0.9 * r);
}

/** k_chultun { at, y, seed }: the mouth of a bell-shaped cistern cut in the court's floor — a plastered kerb and a stone lid pushed aside. */
export function chultun(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, rand = rng(el.seed ?? 3);
  bag.add(LIME, lathe([[0.62, 0], [0.62, 0.14], [0.42, 0.14], [0.4, 0], [0.001, 0], [0.001, 0.0]], 14, null, x, y, z));
  bag.add('cloth_black', lathe([[0.001, 0.145], [0.4, 0.145], [0.001, 0.145]], 12, null, x, y, z));
  const a = rand() * 6.28;
  bag.add(L, lathe([[0.001, 0], [0.45, 0], [0.45, 0.09], [0.001, 0.09]], 12, null, x + Math.cos(a) * 0.75, y + 0.005, z + Math.sin(a) * 0.75));
  col.circle(x, z, 0.62, y, y + 0.14);
}

/** k_awning { at, y, w, d, rot }: a market shade of four poles under a sloping roof of palm thatch, high at the back (−z), the seller's mat under it. */
export function awning(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, w = el.w ?? 2.8, d = el.d ?? 2.4, rot = el.rot ?? 0, c = Math.cos(rot), s = Math.sin(rot);
  const T = (u, v) => [x + u * c + v * s, z - u * s + v * c];
  for (const [u, v, h] of [[-w / 2, -d / 2, 2.3], [w / 2, -d / 2, 2.3], [-w / 2, d / 2, 1.75], [w / 2, d / 2, 1.75]]) { const p = T(u, v); bag.add('timber', rod([p[0], y, p[1]], [p[0], y + h, p[1]], 0.045, 5)); col.circle(p[0], p[1], 0.07, y, y + h); }
  const e = 0.35, q = [[-w / 2 - e, -d / 2 - e, 2.3], [w / 2 + e, -d / 2 - e, 2.3], [w / 2 + e, d / 2 + e, 1.7], [-w / 2 - e, d / 2 + e, 1.7]];
  const P = (k, lo) => { const p = T(q[k][0], q[k][1]); return [p[0], y + q[k][2] - (lo ? 0.14 : 0), p[1]]; };
  hex(bag, 'thatch_palm', [P(0, 1), P(1, 1), P(2, 1), P(3, 1), P(0, 0), P(1, 0), P(2, 0), P(3, 0)]);
  const m = T(0, 0.1); bag.add('reed_mat', box(-w / 2 + 0.2, 0.002, -d / 2 + 0.5, w / 2 - 0.2, 0.018, d / 2 - 0.3).rotateY(rot).translate(m[0], y, m[1]));
}

/** k_stains { rect, y, n, seed, skip?: (x, z) => bool }: the damp, moss in the joints and worn patches on a plastered floor. */
export function stains(el, { bag }) {
  const [x0, z0, x1, z1] = el.rect, rand = rng(el.seed ?? 3), y = el.y ?? 0.05;
  for (let i = 0; i < (el.n ?? 30); i++) {
    const x = x0 + rand() * (x1 - x0), z = z0 + rand() * (z1 - z0);
    if (el.skip && el.skip(x, z)) continue;
    const r = rand();
    if (r < 0.5) patch(bag, 'plaster_damp', [x, y, z], [0, 1, 0], 1.2 + rand() * 2.6, 0.8 + rand() * 1.6, Math.floor(rand() * 1e6), 0.004);
    else if (r < 0.85) for (let k = 0; k < 3; k++) patch(bag, 'stucco_leaf', [x + (rand() - 0.5) * 0.9, y, z + (rand() - 0.5) * 0.9], [0, 1, 0], 0.25 + rand() * 0.4, 0.2 + rand() * 0.3, Math.floor(rand() * 1e6), 0.012, 0, 8);
    else patch(bag, 'rubble', [x, y, z], [0, 1, 0], 0.4 + rand() * 0.6, 0.3 + rand() * 0.4, Math.floor(rand() * 1e6), 0.02, 0, 8);
  }
}

export const DRESS = { k_stains: stains, k_mask: mask, k_shed: shed, k_granary: granary, k_brazier: brazier, k_chultun: chultun, k_awning: awning };
export { slab };
