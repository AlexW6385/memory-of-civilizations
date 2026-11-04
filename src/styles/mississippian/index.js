// Mississippian (11th–12th c.; docs/settlements/cahokia.md §4): earthen platform mounds (built in the
// ground itself) carrying buildings of poles set in wall trenches, plastered with clay and thatched
// with grass; the chief's great house on Monks Mound; the palisade of logs with its bastions; the
// woodhenge of red cedar posts; the houses of the town round their courtyards.

import { registerStyle, STYLES } from '../../core/build.js';
import { box, frustum, lathe } from '../../core/geom.js';
import '../qing/index.js';

const WALL = 'mud_plaster', TH = 'thatch';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
/** A steep hipped thatch roof over rect from y, rising rise. */
function hip(bag, [x0, z0, x1, z1], y, rise, o = 0.5) {
  const w = x1 - x0 + 2 * o, d = z1 - z0 + 2 * o, m = Math.min(w, d) / 2 - 0.05;
  bag.add(TH, frustum([x0 - o, z0 - o, x1 + o, z1 + o], y, y + rise, m, m, m, m, { noBottom: true }));
}
/** great_house: { rect, y, h, rise } — a large pole-and-thatch building: plastered walls, a tall hipped roof with ridge ornaments, a door on the south. */
function greatHouse(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, h = el.h ?? 4, rise = el.rise ?? 10;
  bag.add(WALL, box(x0, y - 0.6, z0, x1, y + h, z1)); col.rect(el.rect, y - 0.6, y + h);
  hip(bag, el.rect, y + h, rise, 0.8);
  const mx = (x0 + x1) / 2;
  bag.add('opening', box(mx - 0.8, y, z1, mx + 0.8, y + 2.2, z1 + 0.05));
  for (const x of [x0 + 1.5, x1 - 1.5]) bag.add('timber', box(x - 0.15, y + h + rise - 1.5, (z0 + z1) / 2 - 0.15, x + 0.15, y + h + rise + 2.5, (z0 + z1) / 2 + 0.15));
}
/** house: { rect, y, foot, seed } — a wall-trench house: low clay walls, a steep thatched hip or gable. */
function house(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, foot = el.foot ?? y - 0.4, rand = rng(el.seed || 1);
  bag.add(WALL, box(x0, foot, z0, x1, y + 2, z1)); col.rect(el.rect, foot, y + 2);
  const along = (x1 - x0) >= (z1 - z0), rise = 2.6 + rand() * 1.2, o = 0.4;
  if (rand() < 0.5) hip(bag, el.rect, y + 2, rise, o);
  else { const r = [x0 - o, z0 - o, x1 + o, z1 + o]; if (along) { const hz = (z1 - z0) / 2 + o; bag.add(TH, frustum(r, y + 2, y + 2 + rise, 0, 0, hz, hz, { noBottom: true, noTop: true })); } else { const hx = (x1 - x0) / 2 + o; bag.add(TH, frustum(r, y + 2, y + 2 + rise, hx, hx, 0, 0, { noBottom: true, noTop: true })); } }
  const f = rand() < 0.5 ? z0 : z1, sg = f === z0 ? -1 : 1, mx = (x0 + x1) / 2;
  bag.add('opening', box(mx - 0.4, y, f + sg * 0.01, mx + 0.4, y + 1.5, f + sg * 0.05));
}
/** palisade: { rect, y (fn), every (bastion spacing), gates: [[side, t]] } — a wall of logs plastered with clay, square bastions at intervals, screened gaps. */
function palisade(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, yf = el.y ?? (() => 0), every = el.every ?? 25, h = el.h ?? 4.5, gates = el.gates ?? [];
  const sides = [[[x0, z0], [x1, z0]], [[x1, z0], [x1, z1]], [[x1, z1], [x0, z1]], [[x0, z1], [x0, z0]]];
  sides.forEach(([a, b], si) => {
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L, n = Math.round(L / every);
    const gaps = gates.filter(([s]) => s === si).map(([, t]) => t * L);
    for (let k = 0; k < n; k++) {
      const s0 = k * L / n, s1 = (k + 1) * L / n, mid = (s0 + s1) / 2;
      if (gaps.some((g) => Math.abs(g - mid) < L / n / 2)) {
        // the gate: the wall steps aside behind a screen
        const p = [a[0] + ux * mid, a[1] + uz * mid], nx = -uz, nz = ux;
        bag.add('palisade', box(Math.min(p[0] - ux * 6 + nx * 4, p[0] + ux * 6 + nx * 4.6) - 0.3, yf(...p) - 0.6, Math.min(p[1] - uz * 6 + nz * 4, p[1] + uz * 6 + nz * 4.6) - 0.3, Math.max(p[0] - ux * 6 + nx * 4, p[0] + ux * 6 + nx * 4.6) + 0.3, yf(...p) + h, Math.max(p[1] - uz * 6 + nz * 4, p[1] + uz * 6 + nz * 4.6) + 0.3));
        continue;
      }
      const pa = [a[0] + ux * s0, a[1] + uz * s0], pb = [a[0] + ux * s1, a[1] + uz * s1], yy = Math.min(yf(...pa), yf(...pb));
      const r = [Math.min(pa[0], pb[0]) - 0.4, Math.min(pa[1], pb[1]) - 0.4, Math.max(pa[0], pb[0]) + 0.4, Math.max(pa[1], pb[1]) + 0.4];
      bag.add('palisade', box(r[0], yy - 1, r[1], r[2], yy + h, r[3])); col.rect(r, yy - 1, yy + h);
      for (let q = 0; q < Math.floor(L / n / 0.6); q++) { const t = s0 + (q + 0.5) * 0.6, x = a[0] + ux * t, z = a[1] + uz * t; bag.add('palisade', lathe([[0.32, 0], [0.32, 0.5], [0.001, 0.9]], 6, null, x, yy + h, z)); }
      // the bastion at the end of the stretch
      const bx = pb[0] - uz * 2.5, bz = pb[1] + ux * 2.5, yb = yf(bx, bz);
      bag.add('palisade', box(bx - 2.6, yb - 1, bz - 2.6, bx + 2.6, yb + h + 1.5, bz + 2.6)); col.rect([bx - 2.6, bz - 2.6, bx + 2.6, bz + 2.6], yb - 1, yb + h + 1.5);
      hip(bag, [bx - 2.6, bz - 2.6, bx + 2.6, bz + 2.6], yb + h + 1.5, 2, 0.3);
    }
  });
}
/** woodhenge: { c, r, n, y, h } — a circle of red cedar posts, a central observing post. */
function woodhenge(el, { bag, col }) {
  const [cx, cz] = el.c, r = el.r ?? 45, n = el.n ?? 48, y = el.y ?? 0, h = el.h ?? 6;
  for (let k = 0; k < n; k++) { const a = k / n * Math.PI * 2, x = cx + Math.cos(a) * r, z = cz + Math.sin(a) * r; bag.add('timber_red', lathe([[0.4, 0], [0.38, h], [0.001, h + 0.3]], 8, null, x, y - 0.6, z)); col.circle(x, z, 0.4, y, y + h); }
  bag.add('timber_red', lathe([[0.5, 0], [0.45, h + 1.5], [0.001, h + 1.8]], 8, null, cx, y - 0.6, cz)); col.circle(cx, cz, 0.5, y, y + h + 1.5);
}
/** chunkey_post: { c, y, h } — the tall pole at the plaza's centre. */
function pole(el, { bag, col }) {
  const [x, z] = el.c, y = el.y ?? 0, h = el.h ?? 12;
  bag.add('timber_red', lathe([[0.45, 0], [0.3, h], [0.001, h + 0.2]], 8, null, x, y - 0.6, z)); col.circle(x, z, 0.45, y, y + h);
}
registerStyle('mississippian', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.qing.elements, great_house: greatHouse, miss_house: house, palisade, woodhenge, plaza_pole: pole },
  objects: {},
});
