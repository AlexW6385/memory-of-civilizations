// A Dogon village at the foot of the Bandiagara Escarpment, c. 1930 (docs/settlements/dogon.md §2–§5): the compounds in three terraced
// rows on the talus, the one opened to walk into (its ginna's rooms and round kitchen), the toguna on the place at the village's lower
// middle, the altars, the punulu at the edges, the Tellem dwellings on their ledges in the cliff, the baobabs.

import { COMPOUNDS, LANDMARK, TOGUNA, PUNULU, ALTARS, LEDGES, BAOBABS, height, faceZ, RADIUS } from './layout.js';

const E = [];
for (const c of COMPOUNDS) {
  if (c.landmark) E.push({ t: 'dogon_landmark', rect: c.rect, y: c.y, seed: c.seed });
  else E.push({ t: 'dogon_compound', rect: c.rect, y: c.y, seed: c.seed, ginna: c.ginna });
}
E.push({ t: 'toguna', c: TOGUNA.c, w: TOGUNA.w, d: TOGUNA.d, y: TOGUNA.y, seed: 31 });
for (const [x, z] of PUNULU) E.push({ t: 'punulu', c: [x, z], y: height(x, z), seed: Math.round(x) });
for (const a of ALTARS) E.push({ t: 'dogon_altar', at: a.at, y: height(a.at[0], a.at[1]), kind: a.kind, seed: Math.round(a.at[0] + 50) });
for (const [i, l] of LEDGES.entries()) E.push({ t: 'tellem', c: [l.x, faceZ(l.x, l.y)], y: l.y, w: l.w, seed: 5 + i });
for (const b of BAOBABS) E.push({ t: 'baobab', at: b.at, y: height(b.at[0], b.at[1]), r: b.r, seed: Math.round(b.at[0]) });
// small plots of standing millet at the village's foot, between it and the fields
for (const [i, r] of [[-60, 34, -34, 44], [30, 33, 58, 43]].entries()) E.push({ t: 'millet_plot', rect: r, yAt: height, seed: 40 + i });

// the opened ginna (compound.js house(): the pad's west part, walls 0.45 m, rooms 6.5 × 4.5 m inside)
const [lx0, , , lz1] = LANDMARK.rect, hx0 = lx0 + 0.5, hz1 = lz1 - 0.2, hz0 = hz1 - 5.4, ix0 = hx0 + 0.45, iz0 = hz0 + 0.45, ix1 = hx0 + 7.4 - 0.45, iz1 = hz1 - 0.45;
const F = LANDMARK.y + 0.05;
const room = (id, rect, y, kind) => ({ id, rect, y, kind });
const rooms = [
  room('place', [-24, 22, 22, 32], 1.2, 'open'),
  room('hall', [ix0 + 0.2, iz0 + 2.9, ix0 + 2.9, iz1 - 0.2], F, 'hall'),
  room('store', [ix0 + 3.3, iz0 + 2.9, ix1 - 0.2, iz1 - 0.2], F, 'hall'),
  room('central room', [ix0 + 0.2, iz0 + 0.2, ix1 - 0.2, iz0 + 2.3], F, 'hall'),
  room('kitchen', [ix0 + 5.45 - 0.8, hz0 - 1.55 - 0.6, ix0 + 5.45 + 0.8, hz0 - 1.55 + 0.6], F, 'hall'),
];
const doorX = ix0 + 1.5;
const walks = [Object.assign([[0, 36], [0, 26], [0, 14], [0, 12.6], [doorX - 4, 12.6], [doorX, 12.6], [doorX, hz1 - 1.2], [doorX, iz0 + 1.2]], { y0: 1.2 })];

export const dogon = {
  id: 'dogon-village',
  name: { en: 'A Dogon village', zh: '多贡村落' },
  era: { en: 'Bandiagara Escarpment, about 1930', zh: '邦贾加拉悬崖，约1930年' },
  style: 'dogon',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [doorX, hz1 + 1.0], facing: 'n', y: LANDMARK.y },
  bounds: [-RADIUS + 4, -60, RADIUS - 4, 60],
  bakeBounds: [-80, -60, 80, 55],
  view: [-72, -50, 72, 40],
  bakeTop: 30,
  elements: E,
  rooms,
  walks,
};
export default dogon;
