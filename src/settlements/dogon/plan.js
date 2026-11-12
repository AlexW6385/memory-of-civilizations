// A Dogon village at the foot of the Bandiagara Escarpment, c. 1930 (docs/settlements/dogon.md §2–§5): the compounds in three terraced
// rows on the talus, the one opened to walk into (its ginna's rooms and round kitchen), the toguna on the place at the village's lower
// middle, the altars, the punulu at the edges, the Tellem dwellings on their ledges in the cliff, the baobabs.

import { COMPOUNDS, LANDMARK, TOGUNA, PUNULU, ALTARS, LEDGES, BAOBABS, SHADE, FORGE, DYE, THRESH, PENS, WALL_DX, WALL_DY, WALL_X, wallFace, wallZ, wallBase, wallTop, inCompound, height, RADIUS } from './layout.js';
import { houseOf } from '../../styles/dogon/compound.js';

const E = [];
for (const c of COMPOUNDS) {
  if (c.landmark) E.push({ t: 'dogon_landmark', rect: c.rect, y: c.y, seed: c.seed, hw: c.hw, ginna: c.ginna });
  else if (c.open) E.push({ t: 'dogon_landmark', rect: c.rect, y: c.y, seed: c.seed, hw: c.hw, lite: true, ginna: c.ginna });
  else E.push({ t: 'dogon_compound', rect: c.rect, y: c.y, seed: c.seed, ginna: c.ginna });
}
E.push({ t: 'toguna', c: TOGUNA.c, w: TOGUNA.w, d: TOGUNA.d, y: TOGUNA.y, seed: 31 });
for (const [x, z] of PUNULU) E.push({ t: 'punulu', c: [x, z], y: height(x, z), seed: Math.round(x) });
for (const a of ALTARS) E.push({ t: 'dogon_altar', at: a.at, y: height(a.at[0], a.at[1]), kind: a.kind, seed: Math.round(a.at[0] + 50) });
E.push({ t: 'cliff_wall', seed: 19, L: { wallFace, wallZ, wallBase, wallTop, DX: WALL_DX, DY: WALL_DY, X: WALL_X, ledges: LEDGES, ground: height } });
for (const [i, l] of LEDGES.entries()) E.push({ t: 'tellem', c: [l.x, wallZ(l.x, l.y + 3)], y: l.y, w: l.w, seed: 5 + i });
for (const t of SHADE) E.push({ t: 'shade_tree', at: t.at, y: height(t.at[0], t.at[1]), r: t.r, h: t.h, seed: t.seed });
E.push({ t: 'forge', at: FORGE.at, y: height(FORGE.at[0], FORGE.at[1] - 1.9), seed: FORGE.seed });
E.push({ t: 'dye_yard', at: DYE.at, y: height(DYE.at[0], DYE.at[1]), seed: DYE.seed });
for (const t of THRESH) E.push({ t: 'threshing', at: t.at, y: height(t.at[0], t.at[1]), r: t.r, seed: t.seed });
for (const t of PENS) E.push({ t: 'pen', at: t.at, y: height(t.at[0], t.at[1]), r: t.r, seed: t.seed, gap: t.gap });
E.push({ t: 'lane_stones', rects: [[-1.8, -34, 1.8, 34, 0.55], [-62, -34, 62, 12, 0.1], [-26, 21, 24, 33, 0.07]], yAt: height, skip: (x, z) => inCompound(x, z, 0.4), seed: 6 });
for (const b of BAOBABS) E.push({ t: 'baobab', at: b.at, y: height(b.at[0], b.at[1]), r: b.r, seed: Math.round(b.at[0]) });
// small plots of standing millet at the village's foot, between it and the fields
for (const [i, r] of [[-60, 34, -34, 44], [30, 33, 58, 43]].entries()) E.push({ t: 'millet_plot', rect: r, yAt: height, seed: 40 + i });

// the opened ginnas (compound.js house(): the pad's west or east part, walls 0.45 m, rooms 6.5 × 4.5 m inside)
const F = LANDMARK.y + 0.05;
const room = (id, rect, y, kind) => ({ id, rect, y, kind });
const houseRooms = (c, tag) => {
  const [hx0, , , hz1] = houseOf(c).rect, hz0 = hz1 - 5.4, ix0 = hx0 + 0.45, iz0 = hz0 + 0.45, ix1 = hx0 + 7.4 - 0.45, iz1 = hz1 - 0.45, f = c.y + 0.05;
  return [
    room(`${tag}hall`, [ix0 + 0.2, iz0 + 2.9, ix0 + 2.9, iz1 - 0.2], f, 'hall'),
    room(`${tag}store`, [ix0 + 3.3, iz0 + 2.9, ix1 - 0.2, iz1 - 0.2], f, 'hall'),
    room(`${tag}central room`, [ix0 + 0.2, iz0 + 0.2, ix1 - 0.2, iz0 + 2.3], f, 'hall'),
    room(`${tag}kitchen`, [ix0 + 5.45 - 0.7, hz0 - 1.55 + 0.9, ix0 + 5.45 + 0.7, hz0 - 1.55 + 1.3], f, 'hall'),   // the kitchen's floor by its door (the ladder's ramp takes the middle)
  ];
};
const rooms = [room('place', [-24, 22, 22, 32], 1.2, 'open'), ...houseRooms(LANDMARK, '')];
let nOpen = 1;
for (const c of COMPOUNDS) if (c.open && !c.landmark) rooms.push(...houseRooms(c, `house ${++nOpen}: `));
const [lx0] = houseOf(LANDMARK).rect, hz1L = houseOf(LANDMARK).rect[3], hz0L = hz1L - 5.4, iz0L = hz0L + 0.45;
const doorX = lx0 + 0.45 + 1.5;
const walks = [Object.assign([[-1.0, 36], [-1.0, 26], [-1.0, 14], [-1.0, 12.6], [doorX - 4, 12.6], [doorX, 12.6], [doorX, hz1L - 1.2], [doorX, iz0L + 1.2]], { y0: 1.2 })];
void F;

export const dogon = {
  id: 'dogon-village',
  name: { en: 'A Dogon village', zh: '多贡村落' },
  era: { en: 'Bandiagara Escarpment, about 1930', zh: '邦贾加拉悬崖，约1930年' },
  style: 'dogon',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [doorX, hz1L + 1.0], facing: 'n', y: LANDMARK.y },
  bounds: [-RADIUS + 4, -60, RADIUS - 4, 60],
  bakeBounds: [-80, -60, 80, 55],
  view: [-72, -50, 72, 40],
  bakeTop: 60,
  elements: E,
  rooms,
  walks,
};
export default dogon;
