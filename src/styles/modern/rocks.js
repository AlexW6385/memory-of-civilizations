// The Rocks in 1973 (docs/settlements/sydney.md §5a): the nineteenth-century terraces — two storeys on sandstone
// foundations, walls of face brick, stucco or dressed sandstone, 15-foot frontages, corrugated-iron roofs between
// party walls carried up as fire walls with their chimneys, panelled doors under fanlights, sash windows with
// sandstone sills, and at many a balcony over the footpath with a cast-iron railing under a skillion roof; and
// the sandstone bond stores of the harbour front, three storeys under a gable, the loading doors stacked one
// over another under the hoist beam.

import { box, fromTriangles, rod, lathe } from '../../core/geom.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const both = (t) => { const o = [...t]; for (let i = 0; i < t.length; i += 9) o.push(...t.slice(i, i + 3), ...t.slice(i + 6, i + 9), ...t.slice(i + 3, i + 6)); return o; };
const WALLS = ['brick', 'brick', 'stucco_cream', 'sandstone_dressed', 'lime_plaster'], DOORS = ['shutter_green', 'wood_painted', 'car_black', 'shutter_brown'];

/**
 * rocks_terrace: { rect, y (floor), y0 (lowest ground under it), front ('n'|'s'|'e'|'w'), kind ('terrace'|'store'), seed }
 */
export function rocksTerrace(el, { bag, col }) {
  const rand = rng(el.seed || 1), [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, y0 = Math.min(y, el.y0 ?? y), f = el.front ?? 'n';
  const along = f === 'n' || f === 's', L = along ? x1 - x0 : z1 - z0, Dp = along ? z1 - z0 : x1 - x0, a0 = along ? x0 : z0;
  const o = f === 'n' ? z0 : f === 's' ? z1 : f === 'w' ? x0 : x1, sg = f === 'n' || f === 'w' ? -1 : 1;
  // local frame: u along the front (from a0), d inward from the front face (0 … Dp), up y
  const W = (u, d, yy) => { const q = o - sg * d; return along ? [a0 + u, yy, q] : [q, yy, a0 + u]; };
  const B = (u0, u1, d0, d1, ya, yb) => { const p = W(u0, d0, ya), q = W(u1, d1, yb); return box(Math.min(p[0], q[0]), ya, Math.min(p[2], q[2]), Math.max(p[0], q[0]), yb, Math.max(p[2], q[2])); };
  const T = (m, pts) => bag.add(m, fromTriangles(both(pts.flat())));
  bag.add('sandstone', B(0, L, 0, Dp, y0 - 0.4, y + 0.5));                                    // the sandstone footings
  if (el.kind === 'store') return store(el, { bag, col }, { B, W, T, L, Dp, y, rand });
  const n = Math.max(1, Math.round(L / 4.6)), fw = L / n, wall = WALLS[Math.floor(rand() * WALLS.length)], H1 = 3.5, H2 = 3.2, top = y + 0.5 + H1 + H2;
  const balcony = rand() < 0.55, roofM = 'iron_galv';
  bag.add(wall, B(0, L, 0.3, Dp, y + 0.5, top)); col.rect(el.rect, y0 - 0.4, top + 3);
  // the front wall, 0.3 m proud of the core: built round the openings
  const PR = 0.3, rise = Math.min(Dp / 2 * 0.58, 3.4);
  for (let i = 0; i < n; i++) {
    const u0 = i * fw, door = rand() < 0.5 ? 0.35 : fw - 1.35, win = door < 1 ? fw - 1.7 : 0.6;
    const dm = DOORS[Math.floor(rand() * DOORS.length)];
    // the front wall: piers and spandrels round the ground floor's door and window and the upper floor's two windows
    const openings = [[u0 + door, u0 + door + 1.0, y + 0.5, y + 2.75], [u0 + win, u0 + win + 1.1, y + 1.3, y + 3.1]];
    const uw = balcony ? [[u0 + 0.6, u0 + 1.6, y + 0.5 + H1 + 0.1, y + 0.5 + H1 + 2.5], [u0 + fw - 1.6, u0 + fw - 0.6, y + 0.5 + H1 + 0.1, y + 0.5 + H1 + 2.5]]
      : [[u0 + 0.7, u0 + 1.6, y + 0.5 + H1 + 0.6, y + 0.5 + H1 + 2.4], [u0 + fw - 1.6, u0 + fw - 0.7, y + 0.5 + H1 + 0.6, y + 0.5 + H1 + 2.4]];
    const all = [...openings, ...uw].sort((a, b) => a[0] - b[0]);
    // vertical strips between the openings' columns, full height; spandrels above and below each opening
    const cuts = [u0]; for (const [a, b] of all) cuts.push(a, b); cuts.push(u0 + fw);
    const xs = [...new Set(cuts)].sort((a, b) => a - b);
    for (let k = 0; k + 1 < xs.length; k++) {
      const a = xs[k], b = xs[k + 1]; if (b - a < 0.01) continue;
      const here = all.filter(([p, q]) => p < b - 0.005 && q > a + 0.005).sort((p, q) => p[2] - q[2]);
      let yy = y + 0.5;
      for (const [, , ya, yb] of here) { if (ya > yy + 0.005) bag.add(wall, B(a, b, 0, PR, yy, ya)); yy = yb; }
      if (top > yy + 0.005) bag.add(wall, B(a, b, 0, PR, yy, top));
    }
    // the door: panelled leaf, a fanlight over it, a sandstone step
    const [da, db] = openings[0];
    bag.add(dm, B(da, db, PR - 0.12, PR - 0.08, y + 0.5, y + 2.25)); bag.add('glass_outer', B(da, db, PR - 0.12, PR - 0.08, y + 2.3, y + 2.75));
    bag.add('paint_white', B(da, db, PR - 0.12, PR - 0.06, y + 2.25, y + 2.3));
    for (const [pa, pb] of [[0.55, 1.15], [1.3, 2.1]]) for (const s of [0.15, 0.55]) bag.add(dm, B(da + s, da + s + 0.3, PR - 0.14, PR - 0.12, y + 0.5 + pa, y + 0.5 + pb));
    bag.add('sandstone_dressed', B(da - 0.15, db + 0.15, -0.35, 0, y0 > y - 0.3 ? y + 0.15 : y0, y + 0.5));
    // the sash windows: glass, the white frame and the meeting rail, the sandstone sill and lintel
    for (const [wa, wb, ya, yb] of [openings[1], ...uw]) {
      const french = balcony && ya > y + 2;
      bag.add('glass_outer', B(wa, wb, PR - 0.1, PR - 0.08, ya, yb));
      bag.add('paint_white', B(wa, wb, PR - 0.12, PR - 0.06, (ya + yb) / 2 - 0.04, (ya + yb) / 2 + 0.04));
      bag.add('paint_white', B((wa + wb) / 2 - 0.03, (wa + wb) / 2 + 0.03, PR - 0.12, PR - 0.06, ya, yb));
      if (!french) bag.add('sandstone_dressed', B(wa - 0.1, wb + 0.1, -0.08, PR, ya - 0.12, ya));
      bag.add('sandstone_dressed', B(wa - 0.12, wb + 0.12, -0.04, PR, yb, yb + 0.25));
      if (!french && rand() < 0.5) for (const s of [-1, 1]) bag.add(DOORS[Math.floor(rand() * 2)], B(s < 0 ? wa - 0.55 : wb + 0.03, s < 0 ? wa - 0.03 : wb + 0.55, -0.05, 0, ya, yb));   // shutters
    }
    // the balcony: cantilevered over the footpath, a cast-iron railing of balusters, a skillion roof on posts
    if (balcony) {
      const by = y + 0.5 + H1;
      bag.add('timber', B(u0 + 0.05, u0 + fw - 0.05, -1.2, 0, by - 0.18, by));
      for (let k = 0; k < 3; k++) { const u = u0 + 0.3 + k * (fw - 0.6) / 2; bag.add('iron', rod(W(u, 0, by - 0.9), W(u, -1.1, by - 0.2), 0.04, 4)); }
      bag.add('iron', B(u0 + 0.05, u0 + fw - 0.05, -1.2, -1.12, by + 0.95, by + 1.02));
      bag.add('iron', B(u0 + 0.05, u0 + fw - 0.05, -1.2, -1.12, by + 0.05, by + 0.12));
      for (let u = u0 + 0.12; u < u0 + fw - 0.1; u += 0.13) bag.add('iron', B(u - 0.012, u + 0.012, -1.17, -1.15, by + 0.12, by + 0.95));
      for (let u = u0 + 0.3; u < u0 + fw - 0.2; u += 0.52) bag.add('iron', lathe([[0.001, -0.09], [0.07, 0], [0.001, 0.09]], 4, null, ...W(u, -1.16, by + 0.53)));   // the lace's rosettes
      for (const u of [u0 + 0.1, u0 + fw - 0.1]) { bag.add('iron', B(u - 0.04, u + 0.04, -1.2, -1.12, by, by + 2.6)); }
      const ry = by + 2.6, T2 = [];
      T2.push(W(u0, -1.35, ry), W(u0 + fw, -1.35, ry), W(u0 + fw, 0, ry + 0.45), W(u0, -1.35, ry), W(u0 + fw, 0, ry + 0.45), W(u0, 0, ry + 0.45));
      T(roofM, T2);
      bag.add('wood_painted', B(u0, u0 + fw, -1.35, -1.3, ry - 0.2, ry));
      // the side screens of the balcony, boarded
      for (const u of [u0 + 0.04, u0 + fw - 0.04]) bag.add(wall, B(u - 0.04, u + 0.04, -1.2, 0, by, ry + 0.4));
    }
  }
  // the roof: two pitches along the row, ridge parallel to the street, eaves gutters; party walls as fire walls
  // rising through it, a chimney stack on each with its pots
  const dm = Dp / 2, ov = 0.25, R = [];
  R.push(W(0, -ov, top - 0.1), W(L, -ov, top - 0.1), W(L, dm, top + rise), W(0, -ov, top - 0.1), W(L, dm, top + rise), W(0, dm, top + rise));
  R.push(W(0, Dp + ov, top - 0.1), W(0, dm, top + rise), W(L, dm, top + rise), W(0, Dp + ov, top - 0.1), W(L, dm, top + rise), W(L, Dp + ov, top - 0.1));
  T(roofM, R);
  bag.add('iron_galv', B(0, L, -ov - 0.15, -ov, top - 0.35, top - 0.1));                        // the gutter
  bag.add('iron_galv', B(0, L, Dp + ov, Dp + ov + 0.15, top - 0.35, top - 0.1));
  bag.add('lead', B(0.26, L - 0.26, dm - 0.12, dm + 0.12, top + rise - 0.05, top + rise + 0.08));          // the ridge capping
  for (let i = 0; i <= n; i++) {
    const u = i * fw, a = Math.max(0, u - 0.2), b = Math.min(L, u + 0.2), G = [];
    // the party wall's gable, carried 0.35 above the roof
    for (const s of [a, b]) G.push(W(s, 0, top), W(s, Dp, top), W(s, dm, top + rise + 0.35));
    G.push(W(a, 0, top), W(b, 0, top), W(b, dm, top + rise + 0.35), W(a, 0, top), W(b, dm, top + rise + 0.35), W(a, dm, top + rise + 0.35));
    G.push(W(a, Dp, top), W(a, dm, top + rise + 0.35), W(b, dm, top + rise + 0.35), W(a, Dp, top), W(b, dm, top + rise + 0.35), W(b, Dp, top));
    T(wall === 'stucco_cream' || wall === 'lime_plaster' ? wall : 'brick', G);
    if (i > 0 && i < n || n === 1) {
      const cu = n === 1 ? (i === 0 ? 0.45 : L - 0.45) : u, c0 = Math.max(0, cu - 0.45), c1 = Math.min(L, cu + 0.45);
      if (n === 1 && i > 0) continue;
      bag.add('brick', B(c0, c1, dm + 0.6, dm + 1.6, top + rise * (1 - 1.7 / (dm + ov)) - 0.15, top + rise + 1.3));
      bag.add('sandstone_dressed', B(c0 - 0.05, c1 + 0.05, dm + 0.55, dm + 1.65, top + rise + 1.3, top + rise + 1.45));
      for (const s of [-0.22, 0.22]) bag.add('terracotta', lathe([[0.11, 0], [0.09, 0.3], [0.12, 0.38], [0.08, 0.4]], 8, null, ...W(cu + s, dm + 1.1, top + rise + 1.45)));
    }
  }
}
/** A bond store of the harbour front: three storeys of sandstone, a gable to the street, the loading doors stacked under a hoist beam, barred windows. */
function store(el, { bag, col }, { B, W, T, L, Dp, y }) {
  const H = 10.5, top = y + 0.5 + H, rise = Math.min(L / 2 * 0.55, 4);
  bag.add('sandstone_dressed', B(0, L, 0, Dp, y + 0.5, top)); col.rect(el.rect, y - 1, top + rise);
  const G = [W(0, -0.01, top), W(L, -0.01, top), W(L / 2, -0.01, top + rise), W(0, Dp + 0.01, top), W(L / 2, Dp + 0.01, top + rise), W(L, Dp + 0.01, top)];
  T('sandstone_dressed', G);
  const R = [W(-0.2, -0.3, top - 0.1), W(L / 2, -0.3, top + rise), W(L / 2, Dp + 0.3, top + rise), W(-0.2, -0.3, top - 0.1), W(L / 2, Dp + 0.3, top + rise), W(-0.2, Dp + 0.3, top - 0.1),
    W(L + 0.2, -0.3, top - 0.1), W(L + 0.2, Dp + 0.3, top - 0.1), W(L / 2, Dp + 0.3, top + rise), W(L + 0.2, -0.3, top - 0.1), W(L / 2, Dp + 0.3, top + rise), W(L / 2, -0.3, top + rise)];
  T('iron_galv', R);
  for (let k = 0; k < 3; k++) {
    const yy = y + 0.5 + k * 3.5;
    bag.add('wood_painted', B(L / 2 - 1.0, L / 2 + 1.0, -0.02, 0, yy + (k ? 0.6 : 0), yy + 3.0));                        // the loading doors
    bag.add('sandstone', B(L / 2 - 1.2, L / 2 + 1.2, -0.1, 0, yy + 3.0, yy + 3.4));
    for (const s of [-1, 1]) for (let u = L / 2 + s * 3; u > 0.8 && u < L - 0.8; u += s * 2.6) {
      bag.add('glass_outer', B(u - 0.5, u + 0.5, -0.02, 0, yy + 1.0, yy + 2.5));
      for (let b = -0.3; b <= 0.31; b += 0.2) bag.add('iron', B(u + b - 0.015, u + b + 0.015, -0.06, -0.02, yy + 1.0, yy + 2.5));
      bag.add('sandstone', B(u - 0.65, u + 0.65, -0.12, 0, yy + 0.88, yy + 1.0));
    }
  }
  bag.add('timber', B(L / 2 - 0.15, L / 2 + 0.15, -1.6, 0, top + rise * 0.35, top + rise * 0.35 + 0.3));                 // the hoist beam
  bag.add('iron', rod(W(L / 2, -1.45, top + rise * 0.35), W(L / 2, -1.45, y + 7.2), 0.015, 3));
  bag.add('iron', lathe([[0.001, -0.15], [0.15, -0.1], [0.15, 0.1], [0.001, 0.15]], 8, null, ...W(L / 2, -1.45, top + rise * 0.35 - 0.15)));
}
