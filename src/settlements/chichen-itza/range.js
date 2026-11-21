// The long house of a better family, as the style's maya_range but with doorways 1.8 m wide and a lintel 2.05 m over the floor so that a
// visitor can walk in (docs/settlements/chichen-itza.md §19): the style's own file is shared and stays as it was. Registered on the maya style from here.
import '../../styles/maya/index.js';
import { STYLES } from '../../core/build.js';
import { box, place } from '../../core/geom.js';
import { hearthKit, waterJarKit, bedKit, storeJarKit, put } from '../../styles/maya/household.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/** cz_range: { c, a (half-length), b (half-width), rot (0, 90, 180, 270 deg: the front toward +z at 0), seed, y }: see the style's maya_range. */
function czRange(el, ctx) {
  const { bag, col } = ctx, rand = rng(el.seed >>> 0), [cx, cz] = el.c, a = el.a, b = el.b, rot = el.rot ?? 0, y0 = el.y ?? 0, c = Math.cos(rot), sn = Math.sin(rot);
  const W = (u, v) => [cx + u * c + v * sn, cz - u * sn + v * c];      // local (u along the long side, v toward the front) to world
  const piece = (mat, u0, u1, v0, v1, ya, yb) => { const g = box(Math.min(u0, u1), ya, Math.min(v0, v1), Math.max(u0, u1), yb, Math.max(v0, v1)); place(g, cx, 0, cz, rot); bag.add(mat, g); };
  const F = y0 + 0.9, wt = 0.55, H = 2.9, ib = b - wt, ia = a - wt;
  piece('rubble', -a - 1.2, a + 1.2, -b - 1.2, b + 2.6, y0 - 0.2, F);
  piece('limestone', -a - 1.3, a + 1.3, b + 2.5, b + 2.7, F - 0.04, F + 0.04);                       // the lip
  // the platform's stair at the front, walked
  piece('rubble', -2, 2, b + 2.6, b + 3.9, y0 - 0.2, y0 + 0.3); piece('rubble', -2, 2, b + 2.6, b + 3.3, y0 - 0.2, y0 + 0.6); piece('pottery_dark', -0.15, 0.15, b + 3.45, b + 3.75, y0 + 0.28, y0 + 0.315); piece('pottery_dark', -0.15, 0.15, b + 2.8, b + 3.1, y0 + 0.58, y0 + 0.615);   // the stair's treads worn pale where the feet go (§19.5)
  col.ramp(rotRect(c, sn, cx, cz, -2, b + 2.6, 2, b + 4.0), y0, F, Math.abs(sn) > 0.5 ? (-sn > 0 ? 'e' : 'w') : (-c > 0 ? 's' : 'n'));
  const plat = rotRect(c, sn, cx, cz, -a - 1.2, -b - 1.2, a + 1.2, b + 2.6);
  col.rect(plat, y0 - 0.2, F - 0.31); col.floor(plat, F);
  // walls: the back, the two ends, the front in four pieces round three doors
  const wall = (u0, u1, v0, v1, mat = 'stucco') => { piece(mat, u0, u1, v0, v1, F, F + H); const p = W((u0 + u1) / 2, (v0 + v1) / 2), r = rotRect(c, sn, cx, cz, u0, v0, u1, v1); col.rect(r, F, F + H); void p; };
  wall(-a, a, -b, -b + wt); wall(-a, -a + wt, -b, b); wall(a - wt, a, -b, b);
  const dw = 1.8, doors = [-a * 0.62, 0, a * 0.62];
  let u = -a;
  for (const d of doors) { wall(u, d - dw / 2, b - wt, b); u = d + dw / 2; }
  wall(u, a, b - wt, b);
  for (const d of doors) piece('timber', d - dw / 2 - 0.1, d + dw / 2 + 0.1, b - wt - 0.05, b + 0.05, F + 2.05, F + 2.3);     // the lintels
  // the roof of beams and plaster, its painted band, the cornice
  piece('limestone_core', -a - 0.3, a + 0.3, -b - 0.3, b + 0.5, F + 2.3, F + H + 0.25);
  piece('stucco_red', -a - 0.35, a + 0.35, -b - 0.35, b + 0.55, F + H - 0.35, F + H - 0.05);
  piece('maya_blue', -a - 0.37, a + 0.37, b + 0.5, b + 0.57, F + H - 0.3, F + H - 0.1);
  col.floor(rotRect(c, sn, cx, cz, -a - 0.3, -b - 0.3, a + 0.3, b + 0.5), F + H + 0.25);
  // inside: the masonry bench along the back with mats, jars, a hearth stone, a woman sitting
  piece('stucco', -ia + 0.3, ia - 0.3, -ib, -ib + 0.95, F, F + 0.5); col.rect(rotRect(c, sn, cx, cz, -ia + 0.3, -ib, ia - 0.3, -ib + 0.95), F, F + 0.5);
  for (const [uu, cl] of [[-ia * 0.55, 'cloth_white'], [ia * 0.1, 'cloth_ochre'], [ia * 0.62, 'cloth_white']]) {
    const [bx, bz] = W(uu, -ib + 0.5); put(bag, bedKit(cl, 'cloth_red'), bx, F + 0.5, bz, rot + Math.PI / 2 * 0);
  }
  for (const uu of [-ia + 0.9, ia - 0.9]) { const [jx, jz] = W(uu, -ib + 1.4); put(bag, storeJarKit(), jx, F, jz, 0); col.circle(jx, jz, 0.28, F, F + 0.6); }
  { const [wx, wz] = W(ia * 0.35, -ib + 1.6); put(bag, waterJarKit(), wx, F, wz, 0); col.circle(wx, wz, 0.33, F, F + 0.8); }
  if (rand() < 0.7) { const [hx, hz] = W(a + 0.6, b + 0.4); put(bag, hearthKit('rubble'), hx, F, hz, 0); col.circle(hx, hz, 0.45, F, F + 0.3); }
  { const [lx, lz] = W(0, 0); ctx.lights?.push({ at: [lx, F + 1.7, lz], color: '#ffb46b', intensity: 2.4, distance: 7 }); }      // a lamp of resinous wood (a torch of ocote) lights the long room
  const L2 = STYLES.life.elements;
  if (rand() < 0.6) { const [px, pz] = W(-ia * 0.2, -ib + 1.3); L2.figure({ at: [px, pz], y: F, rot: rot, seed: Math.floor(rand() * 1e9), pose: 'sit_ground', dress: 'robe', cloth: 'cloth_white', cloth2: 'cloth_red', skin: 'skin_dark', hair: 'bun', hairMat: 'hair_dark', feet: 'bare', legs: 'bare', over: 'none' }, ctx); }
}
/** The axis-aligned rectangle covering a rotated local rectangle (for the collision floors and blocks). */
function rotRect(c, sn, cx, cz, u0, v0, u1, v1) {
  const P = [[u0, v0], [u1, v0], [u0, v1], [u1, v1]].map(([u, v]) => [cx + u * c + v * sn, cz - u * sn + v * c]);
  return [Math.min(...P.map((p) => p[0])), Math.min(...P.map((p) => p[1])), Math.max(...P.map((p) => p[0])), Math.max(...P.map((p) => p[1]))];
}


Object.assign(STYLES.maya.elements, { cz_range: czRange });
