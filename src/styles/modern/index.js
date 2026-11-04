// Modern (1930s–1970s; docs/settlements/sydney.md §4): the Opera House — the granite-clad podium
// and its broad stair, the two halls' rows of white-tiled shells rising toward the harbour, glazed
// at their mouths; the Harbour Bridge's steel arch of two trussed ribs, its deck hung beneath, the
// granite pylons; the Cahill Expressway and the quay; towers of concrete and glass; the Rocks'
// sandstone terraces.

import { registerStyle, STYLES } from '../../core/build.js';
import { box, lathe, fromTriangles } from '../../core/geom.js';
import '../qing/index.js';
import '../artdeco/index.js';

/** Both faces of a triangle. */
const tri2 = (t, a, b, c) => t.push(...a, ...b, ...c, ...a, ...c, ...b);
/** One shell: from the south base at z0 to the mouth at z1 (z1 < z0: it opens north), half-width hw, height H, on y. */
function shell(bag, cx, z0, z1, hw, H, y) {
  const nu = 14, nv = 12, P = (i, j) => {
    const s = -1 + 2 * i / nu, t = j / nv, h = H * (1 - (1 - t) ** 2), w = hw * (1 - 0.22 * t);
    return [cx + s * w, y + h * Math.pow(Math.max(0, 1 - Math.abs(s) ** 1.35), 0.75), z0 + (z1 - z0) * t + (z1 - z0) * 0.12 * t * t * (1 - Math.abs(s))];
  };
  const T = [];
  for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) { tri2(T, P(i, j), P(i + 1, j), P(i + 1, j + 1)); tri2(T, P(i, j), P(i + 1, j + 1), P(i, j + 1)); }
  bag.add('tile_opera', fromTriangles(T));
  // the glazed mouth: a fan down to the podium, set back a little
  const G = [], base = [cx, y, z1 + (z0 - z1) * 0.08];
  for (let i = 0; i < nu; i++) { const a = P(i, nv), b = P(i + 1, nv); tri2(G, base, [a[0], a[1], a[2] + (z0 - z1) * 0.04], [b[0], b[1], b[2] + (z0 - z1) * 0.04]); }
  bag.add('glass_outer', fromTriangles(G));
}
/** opera_house: { rect (the podium), y, h (podium height), halls: [{ x, hw, shells: [[z0, z1, H]] }], stair (depth, on the south) } */
function operaHouse(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, h = el.h ?? 9, st = el.stair ?? 22;
  bag.add('granite_podium', box(x0, y - 4, z0, x1, y + h, z1)); col.rect(el.rect, y - 4, y + h); col.floor(el.rect, y + h);
  // the monumental stair up the south side
  const n = 18;
  for (let k = 0; k < n; k++) { const zz = z1 + st * (1 - k / n), yy = y + h * (k + 1) / n; bag.add('granite_podium', box(x0 + 8, y - 0.5, zz - st / n, x1 - 8, yy - 0.04, zz)); bag.add('granite_grey', box(x0 + 8, yy - 0.04, zz - st / n, x1 - 8, yy, zz + 0.04)); col.floor([x0 + 8, zz - st / n, x1 - 8, zz], yy); }
  // the stair's cheeks: low granite walls stepping down with it
  for (const sx of [x0 + 6.6, x1 - 8]) {
    // a prism: its top sloping with the stair, 1 m above the treads
    const a = sx, b = sx + 1.4, zA = z1, zB = z1 + st, yA = y + h + 1.0, yB = y + 1.0, yb = y - 0.5, T = [];
    const q = (p1, p2, p3, p4) => T.push(...p1, ...p2, ...p3, ...p1, ...p3, ...p4, ...p1, ...p3, ...p2, ...p1, ...p4, ...p3);
    q([a, yb, zA], [a, yA, zA], [a, yB, zB], [a, yb, zB]); q([b, yb, zA], [b, yA, zA], [b, yB, zB], [b, yb, zB]);
    q([a, yA, zA], [b, yA, zA], [b, yB, zB], [a, yB, zB]); q([a, yb, zB], [a, yB, zB], [b, yB, zB], [b, yb, zB]);
    bag.add('granite_grey', fromTriangles(T));
  }
  // the podium's sides: granite in courses, the long bands of the foyers' and the concourse's glazing under the broadwalk
  for (const [xa, sg] of [[x0, -1], [x1, 1]]) {
    for (let k = 1; k < 4; k++) bag.add('granite_grey', box(sg < 0 ? xa - 0.08 : xa, y + k * h / 4 - 0.05, z0, sg < 0 ? xa : xa + 0.08, y + k * h / 4 + 0.05, z1));
    for (let zz = z0 + 6; zz < z1 - 6; zz += 7) bag.add('glass_outer', box(sg < 0 ? xa - 0.06 : xa, y + 1.2, zz, sg < 0 ? xa : xa + 0.06, y + h / 2 - 0.4, zz + 5.4));
  }
  for (let xx = x0 + 6; xx < x1 - 6; xx += 7) bag.add('glass_outer', box(xx, y + 1.2, z0 - 0.06, xx + 5.4, y + h / 2 - 0.4, z0));
  // the broadwalk round the podium's foot
  bag.add('granite_grey', box(x0 - 6, y - 4, z0 - 6, x1 + 6, y + 0.2, z1 + st + 2));
  for (const hall of el.halls ?? []) for (const [a, b, H, hw] of hall.shells) shell(bag, hall.x, a, b, hw ?? hall.hw, H, y + h);
  // the small restaurant shells at the south-west corner
  shell(bag, x0 + 14, z1 - 4, z1 - 20, 9, 12, y + h);
  shell(bag, x0 + 14, z1 - 18, z1 - 30, 8, 9, y + h);
}
/** A straight beam from a to b (3-D points), w wide (x) and d deep, for a bridge running along z. */
function beam(bag, mat, a, b, w, d) {
  const dy = b[1] - a[1], dz = b[2] - a[2], L = Math.hypot(dy, dz);
  const g = box(-w / 2, -d / 2, 0, w / 2, d / 2, L); g.rotateX(-Math.atan2(dy, dz)); g.translate(a[0], a[1], a[2]); bag.add(mat, g);
}
/** arch_bridge: { x, z0, z1 (the springings), rise (crown of the lower chord), depth0, depth1 (truss depth at the ends, crown), deck, w (deck width), approach, pylon } */
function archBridge(el, { bag, col }) {
  const { x, z0, z1 } = el, rise = el.rise ?? 62, dE = el.depth0 ?? 15, dC = el.depth1 ?? 8, deck = el.deck ?? 26, w = el.w ?? 25, ap = el.approach ?? 60, py = el.pylon ?? 46, L = z1 - z0, S = 'steel_grey';
  const yb = (t) => rise * (1 - (2 * t - 1) ** 2), dep = (t) => dE + (dC - dE) * (1 - (2 * t - 1) ** 2), N = 28;
  for (const sx of [-w / 2 + 1, w / 2 - 1]) {
    for (let i = 0; i < N; i++) {
      const t0 = i / N, t1 = (i + 1) / N, za = z0 + L * t0, zb = z0 + L * t1;
      beam(bag, S, [x + sx, yb(t0), za], [x + sx, yb(t1), zb], 1.6, 1.8);
      beam(bag, S, [x + sx, yb(t0) + dep(t0), za], [x + sx, yb(t1) + dep(t1), zb], 1.6, 1.8);
      beam(bag, S, [x + sx, yb(t0), za], [x + sx, yb(t1) + dep(t1), zb], 0.8, 0.8);                 // the diagonals
      bag.add(S, box(x + sx - 0.4, yb(t0), za - 0.4, x + sx + 0.4, yb(t0) + dep(t0), za + 0.4));      // the posts
      // the hangers down to the deck where the arch is above it, the posts up to it where below
      const top = yb(t0);
      if (top > deck + 1) bag.add(S, box(x + sx - 0.25, deck, za - 0.25, x + sx + 0.25, top, za + 0.25));
      else bag.add(S, box(x + sx - 0.5, top, za - 0.5, x + sx + 0.5, deck, za + 0.5));
    }
    // the bracing between the two ribs
  }
  for (let i = 1; i < N; i += 2) { const t = i / N, z = z0 + L * t, yy = yb(t) + dep(t); bag.add(S, box(x - w / 2 + 1, yy - 0.6, z - 0.4, x + w / 2 - 1, yy + 0.3, z + 0.4)); }
  // the deck through the arch and on to the shores
  const za = z0 - ap, zb = z1 + ap;
  bag.add(S, box(x - w / 2, deck - 2.5, Math.min(za, zb), x + w / 2, deck, Math.max(za, zb)));
  bag.add('asphalt', box(x - w / 2 + 1.5, deck, Math.min(za, zb), x + w / 2 - 1.5, deck + 0.05, Math.max(za, zb)));
  col.floor([x - w / 2, Math.min(za, zb), x + w / 2, Math.max(za, zb)], deck + 0.05);
  for (const [zz, sg] of [[z0, -1], [z1, 1]]) {
    // the granite pylons, a pair at each end
    for (const sx of [-w / 2 - 2, w / 2 + 2]) { bag.add('granite_grey', box(x + sx - 5, -8, zz + sg * 2 - 6, x + sx + 5, py, zz + sg * 2 + 6)); col.rect([x + sx - 5, zz + sg * 2 - 6, x + sx + 5, zz + sg * 2 + 6], -8, py); bag.add('granite_grey', box(x + sx - 4, py, zz + sg * 2 - 5, x + sx + 4, py + 3, zz + sg * 2 + 5)); }
    // the approach piers
    for (let k = 1; k * 15 < ap; k++) { const z = zz + sg * k * 15; for (const sx of [-w / 2 + 2, w / 2 - 2]) bag.add('granite_grey', box(x + sx - 1, -8, z - 1, x + sx + 1, deck - 2.5, z + 1)); }
    // the railings
  }
  for (const sx of [-w / 2 + 0.1, w / 2 - 0.1]) bag.add(S, box(x + sx - 0.1, deck, Math.min(za, zb), x + sx + 0.1, deck + 1.2, Math.max(za, zb)));
}
/** round_tower: { c, r, h, y } — a round office tower of concrete fins and glass (Australia Square). */
function roundTower(el, { bag, col }) {
  const [x, z] = el.c, r = el.r ?? 21, h = el.h ?? 170, y = el.y ?? 0;
  bag.add('facade_grey', lathe([[r, 0], [r, h], [0.001, h]], 32, null, x, y - 0.5, z)); col.circle(x, z, r, y, y + h);
  for (let k = 0; k < 24; k++) { const a = k / 24 * Math.PI * 2; bag.add('plaster_white', box(x + Math.cos(a) * (r + 0.3) - 0.4, y, z + Math.sin(a) * (r + 0.3) - 0.4, x + Math.cos(a) * (r + 0.3) + 0.4, y + h, z + Math.sin(a) * (r + 0.3) + 0.4)); }
  bag.add('plaster_white', lathe([[r + 1, 0], [r + 1, 2], [0.001, 2]], 32, null, x, y + h, z));
}
/** wharf: { rect, y } — a ferry wharf on piles with its shelter. */
function wharf(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 1.2;
  bag.add('timber', box(x0, y - 0.4, z0, x1, y, z1)); col.floor(el.rect, y);
  for (let z = z0 + 2; z < z1; z += 5) for (const x of [x0 + 0.5, x1 - 0.5]) bag.add('timber', box(x - 0.25, -6, z - 0.25, x + 0.25, y - 0.4, z + 0.25));
  bag.add('plaster_white', box(x0 + 1, y, z1 - 12, x1 - 1, y + 3.5, z1 - 2)); bag.add('steel_grey', box(x0 + 0.5, y + 3.5, z1 - 12.5, x1 - 0.5, y + 4, z1 - 1.5));
}
/** viaduct: { rect (along x), y (deck), w } — the Cahill Expressway over the quay's station. */
function viaduct(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 13;
  bag.add('plaster_grey', box(x0, y - 1.5, z0, x1, y, z1)); col.floor(el.rect, y);
  bag.add('plaster_grey', box(x0, -0.5, z0 + 2, x1, y - 6, z1 - 2)); col.rect([x0, z0 + 2, x1, z1 - 2], -0.5, y - 6);
  for (let x = x0 + 6; x < x1; x += 12) bag.add('opening', box(x - 3, 0.5, z0 + 1.95, x + 3, y - 8, z0 + 2.02));
  for (let x = x0; x <= x1; x += 9) for (const z of [z0 + 0.6, z1 - 0.6]) bag.add('plaster_grey', box(x - 0.5, y - 6, z - 0.5, x + 0.5, y - 1.5, z + 0.5));
}
registerStyle('modern', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.qing.elements, ...STYLES.artdeco.elements, opera_house: operaHouse, arch_bridge: archBridge, round_tower: roundTower, wharf, viaduct },
  objects: {},
});
