// The town of Machu Picchu as Pachacuti's estate, c. 1450–1530 (docs/settlements/machu-picchu.md §4):
// the Temple of the Sun (the Torreón) on its rock, the Sacred Plaza with the Main Temple and the
// Temple of the Three Windows, the Intihuatana on its terraced hill, the Main Plaza; the terraces'
// walls round the saddle, with stairs down them.

import { SITE, NECK, TERRACE, HILL, KNOLL, hillRing, PLAZA, TOWN_WALL, DITCH, STORES, KALLANKA, SACRED_ROCK, waterworks } from './layout.js';
import { ground } from './ground.js';

const E = [];
// the terraces' retaining walls: rings round the saddle, broken by stairs to the east, west and south
const rings = [];
for (let k = 0; k < TERRACE.n; k++) {
  const s = k * TERRACE.w, a = SITE.a + s, b = SITE.b + s, y1 = -TERRACE.h * k, y0 = y1 - TERRACE.h;
  // the wall runs on to the very sides of the stairs (they are 2.2 m wide), not leaving banks of earth beside them
  const cut = 1.12, tz = Math.asin(cut / b), tx = Math.asin(cut / a);
  const inGap = (p) => (Math.abs(p[1]) < cut - 1e-6 && Math.abs(p[0]) > a * 0.5) || (p[1] > b * 0.5 && Math.abs(p[0]) < cut - 1e-6);
  // the saddle's shape: the ellipse cut to the neck, so the ellipse's ring stands only where this holds
  const zc = NECK.z0 + s, wn = NECK.w + s, keep = (p) => p[1] <= zc + 1e-6 || Math.abs(p[0] - NECK.xc) <= wn + 1e-6;
  const n = 96, ts = [];
  for (let i = 0; i <= n; i++) ts.push(-Math.PI + 2 * Math.PI * i / n);
  ts.push(tz, -tz, Math.PI - tz, -Math.PI + tz, Math.PI / 2 - tx, Math.PI / 2 + tx);
  // the exact places the ring meets the shoulder line and the neck's edges
  { const q = Math.asin(Math.min(1, zc / b)); ts.push(q, Math.PI - q);
    for (const sg of [-1, 1]) { const c = (NECK.xc + sg * wn) / a; if (Math.abs(c) <= 1) ts.push(Math.acos(c)); } }
  ts.sort((p, q) => p - q);
  let pts = [];
  ts.forEach((t, i) => {
    const p = [Math.cos(t) * a, Math.sin(t) * b], buried = ground.height(p[0], p[1]) > y1 + 1;     // under a peak's slope
    if (inGap(p) || buried || !keep(p)) { if (pts.length > 1) E.push({ t: 'ring_wall', pts, y0, y1 }); pts = []; return; }
    if (pts.length && Math.hypot(p[0] - pts[pts.length - 1][0], p[1] - pts[pts.length - 1][1]) < 0.05) return;
    pts.push(p);
    // now and then a flight of stones standing out of the wall, climbing across its face
    if (pts.length > 1 && (i + k * 7) % 19 === 3 && Math.hypot(p[0] - pts[pts.length - 2][0], p[1] - pts[pts.length - 2][1]) > 4) E.push({ t: 'flying_stair', a: pts[pts.length - 2], b: p, from: 0.9, y0, y1, dir: 1 });
  });
  if (pts.length > 1) E.push({ t: 'ring_wall', pts, y0, y1 });
  // the shoulders' walls, straight across (z = z0 + s) from the neck's edge to the ellipse, and the neck's own, down its edges to the ellipse again
  const ez = (x) => b * Math.sqrt(Math.max(0, 1 - (x / a) ** 2)), ex = (z) => a * Math.sqrt(Math.max(0, 1 - (z / b) ** 2));
  const line = (P, Q, side) => { const L = Math.hypot(Q[0] - P[0], Q[1] - P[1]), m = Math.max(2, Math.ceil(L / 6)); if (L < 0.5) return; E.push({ t: 'ring_wall', pts: Array.from({ length: m + 1 }, (_, i) => [P[0] + (Q[0] - P[0]) * i / m, P[1] + (Q[1] - P[1]) * i / m]), y0, y1, side });
    // a flight of long stones standing out of the wall's face, the way down to the terrace below (the outside is the normal of Q→P here)
    if (L > 12 && (k + Math.round(P[0])) % 3 === 0) { const f = (u) => [P[0] + (Q[0] - P[0]) * u, P[1] + (Q[1] - P[1]) * u]; E.push({ t: 'flying_stair', a: f(0.7), b: f(0.3), from: 0.8, y0, y1, dir: 1 }); } };
  if (zc < b) {
    const xe = ex(zc);
    if (NECK.xc - wn > -xe) line([-xe, zc], [NECK.xc - wn, zc], 1);          // west shoulder, going east: its outside is the south
    if (NECK.xc + wn < xe) line([NECK.xc + wn, zc], [xe, zc], 1);             // east shoulder
  }
  for (const sg of [-1, 1]) {
    const x = NECK.xc + sg * wn;
    if (Math.abs(x) < a) { const ze = ez(x); if (ze > zc) line(sg < 0 ? [x, zc] : [x, ze], sg < 0 ? [x, ze] : [x, zc], 1); }
  }
  // the stairs down through the gaps
  for (const g of [0, Math.PI, Math.PI / 2]) {
    const x = Math.round(Math.cos(g)), z = Math.round(Math.sin(g)), r0 = [x * a, z * b], r1 = [x * (a + TERRACE.w), z * (b + TERRACE.w)];
    const rect = [Math.min(r0[0], r1[0]) - (z ? 1.1 : 0), Math.min(r0[1], r1[1]) - (x ? 1.1 : 0), Math.max(r0[0], r1[0]) + (z ? 1.1 : 0), Math.max(r0[1], r1[1]) + (x ? 1.1 : 0)];
    E.push({ t: 'stairs', rect, y0, y1, dir: x > 0.5 ? 'w' : x < -0.5 ? 'e' : 'n', mat: 'granite_rough' });
  }
  rings.push(k);
}
// the terraced hills: the Intihuatana's, the stone on its top; the Guardhouse's knoll at the south end. Each
// ring wall stands on the radius its terrace's edge has in the ground (layout hillRing), left open for the stair.
function hill(H, stairSide, mat) {
  for (let k = 0; k < H.n; k++) {
    const r = hillRing(H, k), y0 = 2.2 * k, y1 = 2.2 * (k + 1), gap = Math.asin(1.2 / r) + 0.01;
    let pts = [];
    const flush = () => { if (pts.length > 1) E.push({ t: 'ring_wall', pts, y0, y1, mat }); pts = []; };
    for (let i = 0; i <= 72; i++) {
      const t = stairSide + gap + i / 72 * (Math.PI * 2 - 2 * gap), p = [H.c[0] + Math.cos(t) * r, H.c[1] + Math.sin(t) * r];
      if (ground.height(p[0], p[1]) > y1 + 1 || ground.height(H.c[0] + Math.cos(t) * (r + 1.2), H.c[1] + Math.sin(t) * (r + 1.2)) > y0 + 0.3) { flush(); continue; }   // in the mountain's slope
      pts.push(p);
    }
    flush();
  }
}
hill(HILL, 0, 'granite_inca');
E.push({ t: 'intihuatana', c: HILL.c, y: 2.2 * HILL.n });
E.push({ t: 'stairs', rect: [HILL.c[0] + hillRing(HILL, HILL.n - 1) - 0.6, HILL.c[1] - 1.1, HILL.c[0] + HILL.r + 6, HILL.c[1] + 1.1], y0: 0, y1: 2.2 * HILL.n, dir: 'w', mat: 'granite_rough' });
hill(KNOLL, -Math.PI / 2, 'granite_rough');
{
  const top = 2.2 * KNOLL.n, ri = hillRing(KNOLL, KNOLL.n - 1);
  // the stair up the knoll's north face, starting out on the level ground
  E.push({ t: 'stairs', rect: [KNOLL.c[0] - 1.1, KNOLL.c[1] - KNOLL.r - 10, KNOLL.c[0] + 1.1, KNOLL.c[1] - ri + 0.6], y0: 0, y1: top, dir: 's', mat: 'granite_rough' });
  // the Guardhouse at the top of the agricultural sector: three walls and one open long side, of rough stones, thatched
  // [stated: theonlyperuguide], three windows over the site [stated: imachupicchu]; open to the north over the town [inferred]
  E.push({ t: 'inca_temple', rect: [KNOLL.c[0] - 5.5, KNOLL.c[1] + 1, KNOLL.c[0] + 2.5, KNOLL.c[1] + 5], y: top + 0.3, h: 2.7, th: 0.75, open: 'n', roof: 'thatch', windowSide: 's', windows: 3, win: { w: 0.55, h: 0.6, sill: 1.15 }, niches: { e: 1, w: 1 }, seed: 71 });
  // the Funerary Rock a few steps from it: a square-cut monolith with a little stair cut in the same rock [stated: imachupicchu]
  E.push({ t: 'funerary_rock', c: [KNOLL.c[0] + 8, KNOLL.c[1] + 3], y: top, yaw: 0.4 });
  // the yard: an apacheta (cairn with its offerings) at the knoll's edge, a brazier, firewood, water jars and a stone seat for the watch
  E.push({ t: 'inca_guardpost', y: top, cairn: [KNOLL.c[0] - 6.8, KNOLL.c[1] - 4.9], brazier: [KNOLL.c[0] + 2.2, KNOLL.c[1] - 1.8], wood: [KNOLL.c[0] - 7.6, KNOLL.c[1] + 2.2, 0.3], jars: [[KNOLL.c[0] + 3.6, KNOLL.c[1] + 4.2], [KNOLL.c[0] + 4.2, KNOLL.c[1] + 4.6]], seat: [KNOLL.c[0] - 2, KNOLL.c[1] - 1.2, 0], seed: 77 });
}
// the Temple of the Sun on its rock south of the Sacred Plaza, the royal residence beside it, the first fountain's
// stair between: the Torreón stands on its rock over the cave of the Royal Tomb, the mouth in the rock's east face; a stair up beside it
E.push({ t: 'torreon', c: [-36, 22], r: 5.5, y: 3.0, h: 4.6, tomb: { at: 11.5, w: 2.4, d: 4 } });
E.push({ t: 'stair', rect: [-27.35, 14.4, -22.85, 16.6], y0: 0, y1: 3.0, dir: 'w', riser: 0.2, mat: 'granite_inca' });
E.push({ t: 'inca_house', rect: [-52, -4, -42, 8], y: 0, h: 3.0, front: 'e', mat: 'granite_inca', jamb: true, seed: 9 });
E.push({ t: 'inca_house', rect: [-56, 34, -46, 46], y: 0, h: 3.0, front: 'e', mat: 'granite_inca', jamb: true, seed: 10 });
// the way in: from the fields down into the dry ditch and up out of it to the main gate (the wall is built with the kanchas')
{ const g = TOWN_WALL.gate, zb = DITCH.z;
  E.push({ t: 'stairs', rect: [g - 1.1, zb + DITCH.bottom - 0.4, g + 1.1, zb + DITCH.top + 0.3], y0: -DITCH.depth, y1: 0, dir: 's', mat: 'granite_rough' });
  E.push({ t: 'stairs', rect: [g - 1.1, zb - DITCH.top - 0.3, g + 1.1, zb - DITCH.bottom + 0.4], y0: -DITCH.depth, y1: 0, dir: 'n', mat: 'granite_rough' });
  E.push({ t: 'lane', rect: [g - 1.1, zb - DITCH.bottom + 0.4, g + 1.1, zb + DITCH.bottom - 0.4], y: -DITCH.depth + 0.02, mat: 'granite_rough' }); }
// the chaski's hut (chaskiwasi) by the road south of the fields, its door to the road (§5.3)
E.push({ t: 'inca_house', rect: [6.5, 118.6, 10.9, 123.2], y: ground.height(8.7, 120.9), h: 2.3, th: 0.55, front: 'w', roof: 'thatch', seed: 401 });
// the five storehouses (qollqa) in the fields: small stone rooms in a row, thatched, their doors to the path
for (const [i, r] of STORES.entries()) E.push({ t: 'inca_house', rect: r, y: 0, h: 2.4, th: 0.6, front: 'n', empty: true, seed: 300 + i });
// the quarry between the Sacred Plaza and the Temple of the Sun, west of the Main Plaza
E.push({ t: 'quarry', rect: [-40, -21, -24, -7], y: 0, seed: 41 });
// the Sacred Plaza at the Intihuatana hill's foot: the Main Temple on its north side (three walls, open to the south), the
// Temple of the Three Windows on its east (open to the west, its windows looking east over the Main Plaza)
// the Main Temple: seventeen niches, six great pegs on the rear wall, its base of great stones, the altar block [stated: theonlyperuguide]
E.push({ t: 'inca_temple', rect: [-50, -56, -34, -44], y: 0.6, h: 3.8, open: 's', jamb: true, niches: { n: 7, e: 5, w: 5 }, pegs: { n: 6 }, altar: { side: 'n', w: 4.2, d: 0.9, h: 0.95 }, stones: 0.9, seed: 3 });
// the Temple of the Three Windows: the windows and, either side of them, two blind windows like niches [stated: imachupicchu]
E.push({ t: 'inca_temple', rect: [-30, -56, -20, -42], y: 0.6, h: 3.6, open: 'w', windowSide: 'e', windows: 3, blind: true, stones: 0.85, seed: 4 });
// four low steps up to each temple's raised floor (0.6 m), before its open side
E.push({ t: 'stair', rect: [-46, -43, -38, -41.8], y0: 0, y1: 0.6, dir: 'n', riser: 0.15, mat: 'granite_inca' });
E.push({ t: 'stair', rect: [-32.2, -53, -31, -45], y0: 0, y1: 0.6, dir: 'e', riser: 0.15, mat: 'granite_inca' });
// the house of the priest closing the plaza on the south
E.push({ t: 'inca_house', rect: [-46, -34, -36, -26], y: 0.2, h: 2.8, front: 'n', mat: 'granite_inca', roof: 'thatch', seed: 11 });
// the kallanka on the plaza's east side: a long undivided hall of rough granite, seven equally spaced doors on the long side
// to the plaza, windows and niches on the back wall, gables with their pegs, a steep ichu roof [stated: Wikipedia, "Kallanka"]
E.push({ t: 'inca_house', rect: KALLANKA, y: 0, h: 3.3, th: 0.8, front: 'w', doors: 7, roof: 'thatch', mat: 'granite_rough', seed: 61 });
// the Main Plaza sunk in two tiers of 1.5 m, each tier's edge a wall of rough stones, stairs down at the road, at the west and at the kallanka's middle door
{
  const [X0, Z0, X1, Z1] = PLAZA, gaps = { s: [0.9, 3.1], w: [-25.1, -22.9], e: [-26.1, -23.9] };
  const run = (a, b, fixed, axis, gap, y0, y1) => {      // a wall along `axis` ('x' | 'z') from a to b at `fixed`, open at the stair
    const seg = (u, v) => { if (v - u > 0.3) E.push({ t: 'stone_block', a: axis === 'x' ? [u, fixed] : [fixed, u], b: axis === 'x' ? [v, fixed] : [fixed, v], w: 0.3, y0, y1 }); };
    if (!gap) { seg(a, b); return; }
    seg(a, gap[0]); seg(gap[1], b);
  };
  for (const [c, y1] of [[0.35, 0.05], [2.75, -1.45]]) {
    const y0 = y1 - 1.65;
    run(X0 + c, X1 - c, Z1 - c, 'x', gaps.s, y0, y1);
    run(X0 + c, X1 - c, Z0 + c, 'x', null, y0, y1);
    run(Z0 + c, Z1 - c, X0 + c, 'z', gaps.w, y0, y1);
    run(Z0 + c, Z1 - c, X1 - c, 'z', gaps.e, y0, y1);
  }
  E.push({ t: 'stairs', rect: [gaps.s[0], Z1 - 3.2, gaps.s[1], Z1 + 0.2], y0: -3, y1: 0, dir: 's', mat: 'granite_rough' });
  E.push({ t: 'stairs', rect: [X0 - 0.2, gaps.w[0], X0 + 3.2, gaps.w[1]], y0: -3, y1: 0, dir: 'w', mat: 'granite_rough' });
  E.push({ t: 'stairs', rect: [X1 - 3.2, gaps.e[0], X1 + 0.2, gaps.e[1]], y0: -3, y1: 0, dir: 'e', mat: 'granite_rough' });
}
// the Main Plaza's edge: a low wall with stairs down into it
E.push({ t: 'lane', rect: [PLAZA[0] - 4, PLAZA[1] - 4, PLAZA[0] - 1, PLAZA[3] + 4], y: 0.02, mat: 'granite_rough' });

// the water: the canal from the spring on the mountain to the south, along the saddle's west edge,
// and the stairway of sixteen fountains down beside the west stair
E.push(...waterworks(ground.height));
// the Sacred Rock at the north end, between two wayronas facing each other across its court [stated: Tierras Vivas]
E.push({ t: 'sacred_rock', c: SACRED_ROCK.c, y: 0, yaw: 0, w: 6.8, h: 3.0 });
for (const [r, open] of SACRED_ROCK.wayronas) E.push({ t: 'inca_temple', rect: r, y: 0.3, h: 2.8, th: 0.8, open, roof: 'thatch', niches: { n: 2, s: 2, e: 4, w: 4 }, seed: r[0] + 50 });

const room = (id, rect, y, kind) => ({ id, rect, y, kind });
const rooms = [room('sacred-plaza', [-52, -62, -18, -24], 0.6, 'open'), room('town', [-95, -175, 95, 175], 0, 'open')];
const walks = [[[2, 110], [2, 80], [2, 14], [-12, 12], [-21, 15.5]]];
walks[0].y0 = 0;

export const town = {
  id: 'machu-picchu-town',
  name: { en: 'Machu Picchu', zh: '马丘比丘' },
  era: { en: 'Inca, c. 1450–1530', zh: '印加，约1450–1530年' },
  style: 'inca',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [2, 110], facing: 'n' },
  bounds: [-140, -220, 140, 220],
  bakeBounds: [-60, -70, -10, 40],
  view: [-56, -62, -18, 32],
  bakeTop: 12,
  elements: E,
  rooms,
  walks,
};
export default town;
