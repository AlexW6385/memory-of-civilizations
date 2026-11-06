// The town of Machu Picchu as Pachacuti's estate, c. 1450–1530 (docs/settlements/machu-picchu.md §4):
// the Temple of the Sun (the Torreón) on its rock, the Sacred Plaza with the Main Temple and the
// Temple of the Three Windows, the Intihuatana on its terraced hill, the Main Plaza; the terraces'
// walls round the saddle, with stairs down them.

import { SITE, TERRACE, HILL, PLAZA } from './layout.js';
import { ground } from './ground.js';

const E = [];
// the terraces' retaining walls: rings round the saddle, broken by stairs to the east, west and south
const rings = [];
for (let k = 0; k < TERRACE.n; k++) {
  const s = k * TERRACE.w, a = SITE.a + s, b = SITE.b + s, y1 = -TERRACE.h * k, y0 = y1 - TERRACE.h;
  const gaps = [0, Math.PI, Math.PI / 2].map((g) => [g - 0.035 * 95 / a, g + 0.035 * 95 / a]);
  const n = 96;
  let pts = [];
  for (let i = 0; i <= n; i++) {
    const t = -Math.PI + 2 * Math.PI * i / n, inGap = gaps.some(([g0, g1]) => { const u = ((t - g0 + Math.PI * 3) % (Math.PI * 2)) - Math.PI; return u > 0 && u < g1 - g0; });
    const p = [Math.cos(t) * a, Math.sin(t) * b], buried = ground.height(p[0], p[1]) > y1 + 1;     // under a peak's slope
    if (inGap || buried) { if (pts.length > 1) E.push({ t: 'ring_wall', pts, y0, y1 }); pts = []; continue; }
    pts.push(p);
    // now and then a flight of stones standing out of the wall, climbing across its face
    if (pts.length > 1 && (i + k * 7) % 19 === 3) E.push({ t: 'flying_stair', a: pts[pts.length - 2], b: p, from: 0.9, y0, y1, dir: 1 });
  }
  if (pts.length > 1) E.push({ t: 'ring_wall', pts, y0, y1 });
  // the stairs down through the gaps
  for (const g of [0, Math.PI, Math.PI / 2]) {
    const x = Math.cos(g), z = Math.sin(g), r0 = [x * a, z * b], r1 = [x * (a + TERRACE.w), z * (b + TERRACE.w)];
    const rect = [Math.min(r0[0], r1[0]) - (z ? 1.1 : 0), Math.min(r0[1], r1[1]) - (x ? 1.1 : 0), Math.max(r0[0], r1[0]) + (z ? 1.1 : 0), Math.max(r0[1], r1[1]) + (x ? 1.1 : 0)];
    E.push({ t: 'stairs', rect, y0, y1, dir: x > 0.5 ? 'w' : x < -0.5 ? 'e' : 'n', mat: 'granite_rough' });
  }
  rings.push(k);
}
// the Intihuatana's hill: its little terraces and the stone on top
for (let k = 0; k < Math.floor(HILL.h / 2.2); k++) {
  const r = HILL.r + 6 - (k + 1) * 2.4, pts = [];
  for (let i = 0; i <= 36; i++) { const t = i / 36 * Math.PI * 2; pts.push([HILL.c[0] + Math.cos(t) * r, HILL.c[1] + Math.sin(t) * r]); }
  E.push({ t: 'ring_wall', pts, y0: k * 2.2, y1: (k + 1) * 2.2, mat: 'granite_inca' });
}
E.push({ t: 'intihuatana', c: HILL.c, y: Math.floor(HILL.h / 2.2) * 2.2 });
E.push({ t: 'stairs', rect: [HILL.c[0] + 4, HILL.c[1] - 1.2, HILL.c[0] + HILL.r + 6, HILL.c[1] + 1.2], y0: 0, y1: Math.floor(HILL.h / 2.2) * 2.2, dir: 'w', mat: 'granite_rough' });
// the Temple of the Sun on its rock, the royal residence beside it
E.push({ t: 'torreon', c: [-36, -22], r: 5.5, y: 1.2, h: 4.6 });
E.push({ t: 'inca_house', rect: [-52, -10, -42, 2], y: 0, h: 3.0, front: 'e', mat: 'granite_inca', jamb: true, seed: 9 });
E.push({ t: 'inca_house', rect: [-56, -32, -46, -20], y: 0, h: 3.0, front: 'e', mat: 'granite_inca', jamb: true, seed: 10 });
// the Sacred Plaza: the Main Temple (three walls, open to the south), the Temple of the Three Windows (open to the west)
E.push({ t: 'inca_temple', rect: [-50, 34, -34, 46], y: 0.6, h: 3.8, open: 's', jamb: true });
E.push({ t: 'inca_temple', rect: [-30, 34, -20, 48], y: 0.6, h: 3.6, open: 'w', windowSide: 'e', windows: 3 });
// four low steps up to each temple's raised floor (0.6 m), before its open side
E.push({ t: 'stair', rect: [-46, 47, -38, 48.2], y0: 0, y1: 0.6, dir: 'n', riser: 0.15, mat: 'granite_inca' });
E.push({ t: 'stair', rect: [-32.2, 37, -31, 45], y0: 0, y1: 0.6, dir: 'e', riser: 0.15, mat: 'granite_inca' });
E.push({ t: 'inca_house', rect: [-46, 52, -36, 60], y: 0.2, h: 2.8, front: 's', mat: 'granite_inca', roof: 'thatch', seed: 11 });
// the Main Plaza's edge: a low wall with stairs down into it
E.push({ t: 'lane', rect: [PLAZA[0] - 4, PLAZA[1] - 4, PLAZA[0] - 1, PLAZA[3] + 4], y: 0.02, mat: 'granite_rough' });

const room = (id, rect, y, kind) => ({ id, rect, y, kind });
const rooms = [room('sacred-plaza', [-52, 30, -18, 62], 0.6, 'open'), room('town', [-95, -175, 95, 175], 0, 'open')];
const walks = [[[2, 110], [-6, 60], [-20, 10], [-30, -12]]];
walks[0].y0 = 0;

export const town = {
  id: 'machu-picchu-town',
  name: { en: 'Machu Picchu', zh: '马丘比丘' },
  era: { en: 'Inca, c. 1450–1530', zh: '印加，约1450–1530年' },
  style: 'inca',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [2, 110], facing: 'n' },
  bounds: [-140, -220, 140, 220],
  bakeBounds: [-60, -40, -10, 65],
  view: [-56, -30, -18, 62],
  bakeTop: 12,
  elements: E,
  rooms,
  walks,
};
export default town;
