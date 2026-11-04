// The Sacred Precinct of Tenochtitlan in 1519 (docs/settlements/tenochtitlan.md §2–§4): the
// serpent wall and its three gates, the Templo Mayor at true size, Ehecatl's round temple on its
// axis, the temples of Tezcatlipoca and the Sun, the ballcourt, the tzompantli, the House of the
// Eagles, the calmecac; the palace of Moctezuma; the causeway west over the lake; the canals,
// their walls, bridges and canoes.

import { RADIUS, PRECINCT, TM, PALACE, LEVEL, ISLAND, CAUSEWAY, CANALS } from './layout.js';

const E = [];
const [px0, pz0, px1, pz1] = PRECINCT;
// ---- the serpent wall with gates north, west and south
const sw = (a, b, out) => E.push({ t: 'serpent_wall', a, b, h: 3, out });
sw([px0, pz0], [-8, pz0], -1); sw([8, pz0], [px1, pz0], -1); sw([px0, pz1], [-8, pz1], 1); sw([8, pz1], [px1, pz1], 1);
sw([px0, pz0], [px0, -8], 1); sw([px0, 8], [px0, pz1], 1); sw([px1, pz0], [px1, pz1], -1);
E.push({ t: 'lane', rect: [px0 + 2, pz0 + 2, px1 - 2, pz1 - 2], y: 0.03, mat: 'stucco' });
// ---- the temples
E.push({ t: 'templo_mayor', c: TM.c, w: TM.w, d: TM.d, h: TM.h, terraces: 4, top: TM.top });
E.push({ t: 'round_temple', c: [10, 0], r: 9, h: 8 });
E.push({ t: 'm_pyramid', c: [-55, 75], base: 17, top: 8, h: 15, tiers: 4, stairs: 'e', steps: 60, stairW: 7, serpents: 'e', temple: { w: 10, d: 10, h: 5, doors: 'e' } });
E.push({ t: 'm_pyramid', c: [25, -95], base: 15, top: 7, h: 13, tiers: 3, stairs: 's', steps: 50, stairW: 6, serpents: 's', temple: { w: 9, d: 9, h: 5, doors: 's' } });
E.push({ t: 'm_pyramid', c: [25, 95], base: 12, top: 6, h: 10, tiers: 3, stairs: 'n', steps: 40, stairW: 5, temple: { w: 8, d: 8, h: 4.5, doors: 'n' } });
E.push({ t: 'ballcourt', c: [-50, -65], len: 60, w: 9, h: 4 });
E.push({ t: 'm_platform', c: [-30, 40], a: 9, h: 2.4, serpents: 'w' });
E.push({ t: 'court_house', rect: [100, -135, 140, -72], h: 4.2, ring: 7, band: true, seed: 3 });
E.push({ t: 'court_house', rect: [-138, -138, -82, -100], h: 3.8, ring: 8, seed: 5 });
E.push({ t: 'court_house', rect: [-138, 100, -90, 138], h: 3.8, ring: 8, seed: 6 });
// ---- the palace of Moctezuma
E.push({ t: 'court_house', rect: PALACE, h: 6, ring: 16, band: true, seed: 9 });
// ---- the causeway west over the lake
const cw = Math.sqrt((RADIUS - 26) ** 2 - CAUSEWAY.z1 ** 2);
E.push({ t: 'block', walk: true, rect: [-cw, CAUSEWAY.z0, -ISLAND + 6, CAUSEWAY.z1], y0: LEVEL.lakeBed, y1: 0.4, mat: 'basalt' });
// ---- the canals: water, walls, bridges at the avenues, canoes
const clip = ([x0, z0, x1, z1]) => { const h = (v) => Math.sqrt(Math.max(0, (ISLAND - 6) ** 2 - v * v)); return x1 - x0 > z1 - z0 ? [Math.max(x0, -h(z1)), z0, Math.min(x1, h(z1)), z1] : [x0, Math.max(z0, -h(x1)), x1, Math.min(z1, h(x1))]; };
for (const c of CANALS) {
  const r = clip(c), horiz = r[2] - r[0] > r[3] - r[1];
  E.push({ t: 'water_rect', rect: r, y: LEVEL.water });
  for (const [a, b] of horiz ? [[[r[0], r[1]], [r[2], r[1]]], [[r[0], r[3]], [r[2], r[3]]]] : [[[r[0], r[1]], [r[0], r[3]]], [[r[2], r[1]], [r[2], r[3]]]]) E.push({ t: 'canal_wall', a, b, y: 0.05, bed: LEVEL.canalBed, th: 0.7 });
  for (const s of [0]) E.push({ t: 'ming_arch_bridge', at: horiz ? [s, (r[1] + r[3]) / 2] : [(r[0] + r[2]) / 2, s], across: horiz ? 'z' : 'x', span: 8.4, width: 4, rise: 1.6, landing: 3.5, y: 0.04, water: LEVEL.water, bed: LEVEL.canalBed });
  for (let k = 0; k < 4; k++) { const t = (k + 0.5) / 4; const at = horiz ? [r[0] + (r[2] - r[0]) * t, (r[1] + r[3]) / 2] : [(r[0] + r[2]) / 2, r[1] + (r[3] - r[1]) * t]; if (Math.abs(at[0]) > 12 && Math.abs(at[1]) > 12) E.push({ t: 'boat', at, dir: horiz ? [1, 0] : [0, 1], len: 6, y: LEVEL.water }); }
}
// the lake: water round the island, canoes
E.push({ t: 'water_cells', rect: [-RADIUS + 24, -RADIUS + 24, RADIUS - 24, RADIUS - 24], y: LEVEL.water, cell: 3, inside: (x, z) => { const r = Math.hypot(x, z); return r > ISLAND + 2 && r < RADIUS - 27 && !(x < 0 && z > CAUSEWAY.z0 - 1 && z < CAUSEWAY.z1 + 1); } });
for (const [x, z, d] of [[-300, -60, 1], [250, -230, -1], [-120, 330, 1], [320, 120, -1], [80, -345, 1]]) E.push({ t: 'boat', at: [x, z], dir: [d, 0], len: 6, y: LEVEL.water });

const room = (id, rect, y, kind) => ({ id, rect, y, kind });
const rooms = [room('precinct', PRECINCT, 0, 'open')];
const walks = [[[-260, 0], [-150, 0], [-60, 0], [10, 0], [50, 0]]];
walks[0].y0 = 0;

export const precinct = {
  id: 'tenochtitlan-precinct',
  name: { en: 'The Sacred Precinct and the Templo Mayor', zh: '圣域与大神庙' },
  era: { en: 'Mexica, 1519', zh: '墨西加，1519年' },
  style: 'aztec',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [-60, 0], facing: 'e' },
  bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS],
  bakeBounds: [-150, -150, 270, 260],
  view: [55, -50, 135, 50],
  bakeTop: 56,
  elements: E,
  rooms,
  walks,
};
export default precinct;
