// The gangs' camps on the plateau (docs/settlements/giza.md §14): the quarrymen and haulers who did not sleep in the town
// slept where they worked — under shelters of reed mats on palm poles, round a hearth of three stones, with their water jars
// in a shaded row, their bread, their tools and the rollers and ropes of the hauling. Elements:
// ok_camp { items: [{ kind, x, z, rot, seed }], y } with kind 'hut' (a shelter of two reed-mat slopes on a ridge pole, open at
// both ends, a mat and a headrest inside), 'fire' (a hearth of three stones with a pot, ash and a stack of sticks), 'jars' (a row
// of water jars in a trench of damp sand under a mat), 'sacks' (grain sacks and a basket), 'rollers' (log rollers and a coil
// of rope beside a lever), 'trough' (a mortar trough of gypsum with two hoes), 'mats' (sleeping mats with bundles);
// ok_chips { at: [[x, z, r]] }: spoil of chips of white limestone and rubble heaps about the dressing places.

import { box, lathe, fromTriangles } from '../../core/geom.js';
import { beamTris } from '../ming/index.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const JAR = [[0.001, 0], [0.1, 0.02], [0.2, 0.2], [0.19, 0.38], [0.1, 0.5], [0.11, 0.55], [0.001, 0.55]];

export function camp(el, { bag, col }) {
  const y0 = el.y ?? 0;
  for (const { kind, x, z, rot = 0, seed = 1 } of el.items) {
    const rand = rng(seed * 5 + 3), c = Math.cos(rot), s = Math.sin(rot);
    const P = (u, v, h) => [x + c * u - s * v, y0 + h, z + s * u + c * v];
    const at = (u, v) => [x + c * u - s * v, z + s * u + c * v];
    if (kind === 'hut') {
      // two sloping mats meeting on a ridge pole 1.75 m up, 2.7 m across at the foot, 3.4 m long; the ends open
      const R = [], T = [], M = [];
      for (const sg of [-1, 1]) beamTris(R, P(sg * 1.35, 0, 0.02), P(0, 0, 1.75), 1.7, 0.07);
      bag.add('reed_mat', fromTriangles(R));
      for (const e of [-1.7, 1.7]) { beamTris(T, P(-1.2, e, 0), P(-1.2, e, 1.2), 0.045, 0.045); beamTris(T, P(1.2, e, 0), P(1.2, e, 1.2), 0.045, 0.045); }
      beamTris(T, P(0, -1.8, 1.72), P(0, 1.8, 1.72), 0.05, 0.1);
      for (const v of [-1.7, 1.7]) beamTris(T, P(0, v, 0), P(0, v, 1.72), 0.05, 0.05);          // the end posts
      bag.add('palm_trunk', fromTriangles(T));
      // inside: a mat laid on the sand, a headrest of limestone, a bundle, a jar
      const [mx, mz] = at(0.1, 0.3);
      bag.add('reed_mat', box(mx - 0.8, y0, mz - 0.45, mx + 0.8, y0 + 0.03, mz + 0.45));
      const [hx, hz] = at(0.1, -0.9);
      bag.add('limestone_carved', box(hx - 0.12, y0, hz - 0.08, hx + 0.12, y0 + 0.14, hz + 0.08));
      bag.add('cloth_ochre', lathe([[0.001, 0], [0.22, 0.02], [0.2, 0.2], [0.001, 0.26]], 7, null, ...(() => { const q = at(-0.6, 0.6); return [q[0], y0, q[1]]; })()));
      for (let i = 0; i < 2; i++) { const q = at(-0.9 + i * 0.5, -1.2); bag.add('terracotta', lathe(JAR.map(([r, h]) => [r * 0.8, h * 0.8]), 8, null, q[0], y0, q[1])); }
      // blocks the walker: the low slopes
      const hx2 = Math.abs(c) * 1.7 + Math.abs(s) * 1.9, hz2 = Math.abs(s) * 1.7 + Math.abs(c) * 1.9;
      col.rect([x - hx2, z - hz2, x + hx2, z + hz2], y0, y0 + 1.8);
    } else if (kind === 'fire') {
      for (let k = 0; k < 3; k++) { const a = k * 2.1 + rand(), q = at(Math.cos(a) * 0.3, Math.sin(a) * 0.3); bag.add('limestone_core', lathe([[0.17, 0], [0.13, 0.2], [0.001, 0.22]], 6, null, q[0], y0, q[1])); }
      bag.add('plaster_grey', lathe([[0.75, 0], [0.5, 0.03], [0.001, 0.05]], 9, null, x, y0, z));
      bag.add('pottery_dark', lathe([[0.001, 0], [0.2, 0.01], [0.3, 0.22], [0.25, 0.4], [0.2, 0.44], [0.001, 0.44]], 9, null, x, y0 + 0.12, z));
      const W = [];
      for (let k = 0; k < 6; k++) { const a = rand() * 6.28, r1 = 0.8 + rand() * 0.3; beamTris(W, P(Math.cos(a) * r1, Math.sin(a) * r1, 0.02), P(Math.cos(a) * (r1 + 0.7), Math.sin(a) * (r1 + 0.7), 0.05), 0.02, 0.03); }
      bag.add('timber', fromTriangles(W));
    } else if (kind === 'jars') {
      // a row of eight jars set to their middle in a trench of damp sand, a mat on two poles over them against the sun
      const n = 8;
      for (let i = 0; i < n; i++) { const q = at(0, (i - (n - 1) / 2) * 0.5); bag.add(i % 3 ? 'terracotta' : 'pottery_dark', lathe(JAR.map(([r, h]) => [r * 1.15, h * 1.15 - 0.2]), 9, null, q[0], y0 + 0.0, q[1])); }
      const T = [];
      for (const v of [-n * 0.25 - 0.1, n * 0.25 + 0.1]) beamTris(T, P(-0.3, v, 0), P(-0.3, v, 1.5), 0.045, 0.045);
      bag.add('palm_trunk', fromTriangles(T));
      const Mt = [];
      beamTris(Mt, P(-0.3, -n * 0.25 - 0.3, 1.5), P(-0.3, n * 0.25 + 0.3, 1.52), 0.7, 0.04);
      bag.add('reed_mat', fromTriangles(Mt));
    } else if (kind === 'sacks') {
      for (let i = 0; i < 5; i++) { const q = at((i % 3) * 0.55 - 0.5, Math.floor(i / 3) * 0.5 - 0.2); bag.add('cloth_ochre', lathe([[0.001, 0], [0.24, 0.02], [0.27, 0.2], [0.18, 0.38], [0.06, 0.46], [0.001, 0.46]], 7, null, q[0], y0 + (i > 2 ? 0.36 : 0), q[1])); }
      const q = at(1.0, 0.1); bag.add('wicker', lathe([[0.001, 0], [0.22, 0.01], [0.28, 0.28], [0.25, 0.3], [0.001, 0.05]], 9, null, q[0], y0, q[1]));
      col.circle(x, z, 0.9, y0, y0 + 0.6);
    } else if (kind === 'rollers') {
      const L = [];
      for (let r = 0; r < 3; r++) for (let i = 0; i < 4 - r; i++) beamTris(L, P(-0.9 + i * 0.28 + r * 0.14, -0.6, 0.12 + r * 0.22), P(-0.9 + i * 0.28 + r * 0.14, 0.6, 0.12 + r * 0.22), 0.1, 0.2);
      bag.add('palm_trunk', fromTriangles(L));
            for (let k = 0; k < 3; k++) { const q = at(0.7 + 0.02 * k, 0), rr = 0.32 - k * 0.0; bag.add('rope_fibre', lathe([[rr, 0], [rr, 0.07], [rr * 0.6, 0.08], [rr * 0.6, 0]], 8, null, q[0], y0 + k * 0.07, q[1])); }
      const Lv = []; beamTris(Lv, P(1.1, -1.0, 0.04), P(1.1, 1.4, 0.12), 0.05, 0.08); bag.add('timber', fromTriangles(Lv));
      col.rect([x - 1.1, z - 0.8, x + 1.1, z + 0.8], y0, y0 + 0.6);
    } else if (kind === 'trough') {
      bag.add('plaster_white', box(...(() => { const q = at(0, 0); return [q[0] - 0.9, y0, q[1] - 0.45, q[0] + 0.9, y0 + 0.35, q[1] + 0.45]; })()));
      bag.add('plaster_grey', box(...(() => { const q = at(0, 0); return [q[0] - 0.8, y0 + 0.3, q[1] - 0.35, q[0] + 0.8, y0 + 0.36, q[1] + 0.35]; })()));
      const H = [];
      for (const v of [-0.3, 0.3]) { beamTris(H, P(-1.5, v + 0.9, 0.0), P(-1.2, v + 0.9, 0.7), 0.025, 0.04); }
      bag.add('timber', fromTriangles(H));
      col.rect([x - 1.0, z - 0.6, x + 1.0, z + 0.6], y0, y0 + 0.4);
    } else if (kind === 'mats') {
      for (let i = 0; i < 3; i++) { const q = at(0, i * 1.0 - 1); bag.add('reed_mat', box(q[0] - 0.8, y0, q[1] - 0.35, q[0] + 0.8, y0 + 0.025, q[1] + 0.35)); const h = at(-0.7, i * 1.0 - 1); bag.add('limestone_carved', box(h[0] - 0.1, y0, h[1] - 0.07, h[0] + 0.1, y0 + 0.12, h[1] + 0.07)); }
    }
  }
}

/** ok_chips { at: [[x, z, r]] }: scatter of limestone chips and a low heap of rubble in a circle of radius r. */
export function chips({ at, y = 0 }, { bag }) {
  for (const [x, z, r = 3, seed = 1] of at.map((a, i) => [a[0], a[1], a[2], a[3] ?? i + 1])) {
    const rand = rng(Math.floor(x * 7 + z * 13 + seed * 17));
    const n = Math.round(6 + r * 2.4);
    for (let i = 0; i < n; i++) {
      const a = rand() * 6.283, d = Math.sqrt(rand()) * r, s = 0.07 + rand() * 0.12;
      bag.add(rand() < 0.7 ? 'tura_limestone' : 'limestone_core', lathe([[s * 1.6, 0], [s, s * 0.5], [0.001, s * 0.75]], 5, null, x + Math.cos(a) * d, y, z + Math.sin(a) * d));
    }
    if (r > 2.5) bag.add('rubble', lathe([[r * 0.35, 0], [r * 0.22, 0.2], [0.001, 0.32]], 7, null, x + (rand() - 0.5) * r * 0.5, y, z + (rand() - 0.5) * r * 0.5));
  }
}
