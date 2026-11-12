// The dressing of Nandauwas's courts and walls (docs/settlements/nan-madol.md §4, §11): the coral gravel raked in lines, mats of offerings
// (yams, breadfruit, coconuts), seats of laid columns at the walls' feet, oil lamps on poles at the gates, tabu markers of braided palm
// fronds, ferns and hanging roots on the walls' tops, moss on their feet, offerings on the tomb.
import { box, lathe, rod, fromTriangles } from '../../core/geom.js';
import { Matrix4 } from '../../core/three.js';
import { rng, laid } from './crib.js';

const coconut = (r = 0.12) => lathe([[0.001, 0], [r * 0.8, r * 0.3], [r, r * 0.9], [r * 0.8, r * 1.6], [0.001, r * 1.9]], 6);
const frameOf = (c, yaw) => { const ca = Math.cos(yaw), sa = Math.sin(yaw); return { W: (u, v) => [c[0] + u * ca + v * sa, c[1] - u * sa + v * ca], M: new Matrix4().makeRotationY(yaw).setPosition(c[0], 0, c[1]) }; };
const frond = (len, wid, rise, droop, n = 4) => {
  const t = [], row = (k) => { const s = k / n, w = wid * Math.sin(Math.PI * Math.min(0.97, s * 0.9 + 0.08)) * (k === n ? 0.05 : 1), y = rise * s - droop * s * s; return [[-w / 2, y, len * s], [w / 2, y, len * s]]; };
  for (let k = 0; k < n; k++) { const [a0, a1] = row(k), [b0, b1] = row(k + 1); t.push(...a0, ...a1, ...b1, ...a0, ...b1, ...b0, ...a0, ...b1, ...a1, ...a0, ...b0, ...b1); }
  return fromTriangles(t);
};

/**
 * court { kind, … }:
 *   rake { rect, skip: [rects], step }  — lines of raked gravel running east–west across rect, clear of the skip rectangles;
 *   offering { c, yaw, seed }           — a mat with piles of yams, breadfruit and coconuts, a bowl of sakau;
 *   seat { a, b }                       — a seat of laid columns, two courses, from a to b;
 *   lamp { c }                          — a pole with a coconut-shell lamp;
 *   tabu { c, yaw }                     — two posts with braided fronds hung between them;
 *   topdress { a, b, top, seed }        — ferns and roots along the top of a wall from a to b, top(u, L) its height;
 *   foot { a, b, seed, out }            — moss and salt at a wall's foot;
 *   tombgift { c, yaw, seed }           — bark cloth laid over the bier and offerings on the crypt's floor.
 */
export function court(el, { bag, col }) {
  const rand = rng(el.seed ?? 1);
  if (el.kind === 'rake') {
    const [x0, z0, x1, z1] = el.rect, st = el.step ?? 1.3;
    for (let z = z0; z <= z1; z += st) {
      let spans = [[x0, x1]];
      for (const s of el.skip ?? []) {
        if (z < s[1] || z > s[3]) continue;
        spans = spans.flatMap(([a, b]) => (s[2] <= a || s[0] >= b ? [[a, b]] : [[a, Math.min(b, s[0])], [Math.max(a, s[2]), b]].filter(([p, q]) => q - p > 0.5)));
      }
      for (const [a, b] of spans) {
        bag.add('coral', box(a, 0.0, z - 0.035, b, 0.045, z + 0.035));
      }
    }
  } else if (el.kind === 'offering') {
    const F = frameOf(el.c, el.yaw ?? 0), put = (m, g) => { g.applyMatrix4(F.M); bag.add(m, g); };
    put('reed_mat', box(-1.0, 0.0, -0.7, 1.0, 0.03, 0.7));
    for (let i = 0; i < 9; i++) put('timber', lathe([[0.05, 0], [0.06, 0.4], [0.04, 0.5]], 6).rotateZ(Math.PI / 2).rotateY(rand() * 0.6).translate(-0.8 + (i % 3) * 0.12, 0.08 + (i / 3 | 0) * 0.1, -0.4 + rand() * 0.2));
    for (let i = 0; i < 7; i++) put('cloth_green', lathe([[0.001, 0], [0.13, 0.08], [0.13, 0.2], [0.001, 0.26]], 7, null, 0.05 + (i % 4) * 0.2, 0.03 + (i > 3 ? 0.2 : 0), -0.3 + (i % 2) * 0.2));
    for (let i = 0; i < 5; i++) put('bark_dark', coconut(0.1).translate(-0.2 + i * 0.16, 0.03, 0.4));
    put('bark_dark', lathe([[0.001, 0], [0.12, 0.01], [0.17, 0.1], [0.001, 0.1]], 8, null, 0.7, 0.03, 0.3));
    put('timber', rod([0.7, 0.03, 0.5], [0.45, 0.24, 0.65], 0.012, 4));
  } else if (el.kind === 'seat') {
    const dx = el.b[0] - el.a[0], dz = el.b[1] - el.a[1], L = Math.hypot(dx, dz), ux = dx / L, uz = dz / L;
    for (let s = 0; s < L - 0.3; s += 3.1) {
      const len = Math.min(3.0, L - s);
      laid(bag, 'granite_black', len, el.a[0] + ux * s - uz * 0.0, 0.3, el.a[1] + uz * s, ux, uz, 200, 0.3);
      laid(bag, 'dolerite_spotted', len, el.a[0] + ux * s - uz * 0.0, 0.0, el.a[1] + uz * s, ux, uz, 200, 0.3);
    }
    col.segment(el.a, el.b, 0.7, 0, 0.7);
  } else if (el.kind === 'lamp') {
    const [x, z] = el.c;
    bag.add('timber', lathe([[0.05, 0], [0.04, 1.7]], 6, null, x, 0, z));
    bag.add('bark_dark', lathe([[0.001, 1.7], [0.1, 1.72], [0.12, 1.8], [0.001, 1.8]], 7, null, x, 0, z));
    bag.add('flame', lathe([[0.001, 1.78], [0.02, 1.8], [0.001, 1.9]], 5, null, x, 0, z));
    col.circle(x, z, 0.08, 0, 1.8);
  } else if (el.kind === 'tabu') {
    const F = frameOf(el.c, el.yaw ?? 0), put = (m, g) => { g.applyMatrix4(F.M); bag.add(m, g); };
    for (const x of [-0.8, 0.8]) put('timber', lathe([[0.06, 0], [0.05, 2.4]], 6, null, x, 0, 0));
    put('timber', box(-0.85, 2.2, -0.03, 0.85, 2.26, 0.03));
    for (let i = 0; i < 7; i++) put('palm_leaf', frond(0.9 + rand() * 0.2, 0.12, 0.0, -0.1).rotateX(Math.PI / 2 + 0.1).translate(-0.7 + i * 0.23, 2.2, 0));
    for (let i = 0; i < 5; i++) put('flax_leaf', rod([-0.5 + i * 0.25, 2.2, 0], [-0.5 + i * 0.25 + (rand() - 0.5) * 0.1, 1.5 + rand() * 0.2, 0.02], 0.012, 3));
  } else if (el.kind === 'topdress') {
    const dx = el.b[0] - el.a[0], dz = el.b[1] - el.a[1], L = Math.hypot(dx, dz), ux = dx / L, uz = dz / L, nz = ux, nx = -uz;
    for (let u = 0.6; u < L - 0.6; u += 1.5 + rand() * 3.5) {
      const y = el.top(u, L), side = rand() < 0.5 ? -1 : 1, v = side * (1.0 + rand() * 0.15), x = el.a[0] + ux * u + nx * v, z = el.a[1] + uz * u + nz * v;
      for (let i = 0; i < 6; i++) { const a = i / 6 * 6.28 + rand(); bag.add('flax_leaf', rod([x, y, z], [x + Math.cos(a) * 0.45, y + 0.35 + rand() * 0.25, z + Math.sin(a) * 0.45], 0.014, 3)); }
      if (rand() < 0.35) { const hx = x + nx * side * 0.3, hz = z + nz * side * 0.3; bag.add('bark_dark', rod([hx, y, hz], [hx + nx * side * 0.35, y - 1.5 - rand() * 2.5, hz + nz * side * 0.35], 0.012, 3)); }
    }
  } else if (el.kind === 'foot') {
    const dx = el.b[0] - el.a[0], dz = el.b[1] - el.a[1], L = Math.hypot(dx, dz), ux = dx / L, uz = dz / L, [nx, nz] = el.out;
    for (let u = 0.4; u < L - 1.0; u += 1.2 + rand() * 2.5) {
      const w = 0.5 + rand() * 1.3, h = 0.4 + rand() * 1.4, y = rand() * 1.2, o = 1.32;
      const p = [el.a[0] + ux * u + nx * o, el.a[1] + uz * u + nz * o], q = [p[0] + ux * w + nx * 0.03, p[1] + uz * w + nz * 0.03];
      bag.add(rand() < 0.75 ? 'palm_leaf' : 'chalk', box(Math.min(p[0], q[0]), y, Math.min(p[1], q[1]), Math.max(p[0], q[0]), y + h * (y < 0.5 ? 1 : 0.3), Math.max(p[1], q[1])));
    }
  } else if (el.kind === 'tombgift') {
    const [x, z] = el.c;
    bag.add('cloth_white', box(x - 0.5, 0.5, z - 1.35, x + 0.5, 0.56, z + 1.35));
    bag.add('cloth_ochre', box(x - 0.52, 0.2, z - 0.7, x - 0.46, 0.56, z + 0.7));
    for (let i = 0; i < 4; i++) bag.add('cloth_green', lathe([[0.001, 0], [0.1, 0.07], [0.1, 0.16], [0.001, 0.2]], 6, null, x - 0.9 + i * 0.12, 0, z + 0.2 + (i % 2) * 0.25));
    for (let i = 0; i < 5; i++) bag.add('bark_dark', coconut(0.09).translate(x + 0.9 - (i % 2) * 0.1, 0, z - 0.5 + i * 0.2));
  }
}
