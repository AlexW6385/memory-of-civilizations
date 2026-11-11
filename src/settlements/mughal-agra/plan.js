// The Taj Mahal complex as completed under Shah Jahan, 1632–1653 (docs/settlements/mughal-agra.md
// §4): the riverfront terrace with the mausoleum on its marble plinth, the four minarets, the
// mosque (west) and its twin (east); the charbagh with its raised channels, walks and central
// pool; the walls and their octagonal towers; the great gate; the forecourt.

import { TERRACE, PLINTH, GARDEN, GATE, FORECOURT, POOL, GWALKS, GW, GRIM } from './layout.js';

const E = [];
const [tx0, tz0, tx1, tz1] = TERRACE.rect, ty = TERRACE.y;
// the riverfront terrace of red sandstone, the plinth of marble, stairs up to it
E.push({ t: 'block', walk: true, rect: TERRACE.rect, y0: -4, y1: ty, mat: 'sandstone_red' });
E.push({ t: 'block', walk: true, rect: [PLINTH.c[0] - PLINTH.a, PLINTH.c[1] - PLINTH.a, PLINTH.c[0] + PLINTH.a, PLINTH.c[1] + PLINTH.a], y0: ty, y1: PLINTH.y, mat: 'marble' });
E.push({ t: 'stairs', rect: [-6, PLINTH.c[1] + PLINTH.a, 6, PLINTH.c[1] + PLINTH.a + 9], y0: ty, y1: PLINTH.y, dir: 'n', mat: 'marble' });
E.push({ t: 'stairs', rect: [-10, tz1, 10, tz1 + 4], y0: 0, y1: ty, dir: 'n', mat: 'sandstone_red' });
// the mausoleum: 56.6 m square with chamfered corners, its dome rising 73 m above the plinth
E.push({ t: 'mausoleum', c: PLINTH.c, y: PLINTH.y, a: 28.3, chamfer: 8.5, h: 33, dome: { r: 17.7, h: 28, drum: 7 }, interior: true });
for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) E.push({ t: 'minaret', c: [PLINTH.c[0] + sx * (PLINTH.a - 3), PLINTH.c[1] + sz * (PLINTH.a - 3)], y: PLINTH.y, h: 40, r: 2.6 });
// the mosque (west, facing east) and its twin (east, facing west), on the terrace
E.push({ t: 'red_hall', rect: [-138, -232, -115, -174], y: ty, h: 12, front: 'e', decor: 'calligraphy', interior: 'mosque' });
E.push({ t: 'red_hall', rect: [115, -232, 138, -174], y: ty, h: 12, front: 'w', decor: 'flowers', interior: 'jawab' });
// the garden: walks of red sandstone along the axes and round the quarters, raised channels of
// marble along the axes, the central pool on its platform
const [gx0, gz0, gx1, gz1] = GARDEN;
for (const r of [[-12, gz0, -3.6, gz1], [3.6, gz0, 12, gz1], [gx0, -12, -3.6, -3.6], [3.6, -12, gx1, -3.6], [gx0, 3.6, -3.6, 12], [3.6, 3.6, gx1, 12], [-3.6, -12, 3.6, -3.6], [-3.6, 3.6, 3.6, 12]]) E.push({ t: 'lane', rect: r, y: 0.35, mat: 'sandstone_red' });
E.push({ t: 'water_rect', rect: [-3, gz0 + 2, 3, gz1 - 2], y: 0.25 });
E.push({ t: 'water_rect', rect: [gx0 + 2, -3, gx1 - 2, 3], y: 0.25 });
for (const r of [[-3.6, gz0 + 2, -3, gz1 - 2], [3, gz0 + 2, 3.6, gz1 - 2], [gx0 + 2, -3.6, gx1 - 2, -3], [gx0 + 2, 3, gx1 - 2, 3.6]]) E.push({ t: 'block', walk: true, rect: r, y0: 0, y1: 0.55, mat: 'marble_smooth' });
// the raised walks of stone that cut each quarter into sixteen sunken beds, and the walk round the inside of the walls
// (docs/settlements/mughal-agra.md §4): red sandstone with a kerb of white marble on each side
{
  const WY = 0.55, raised = (r) => {
    E.push({ t: 'block', walk: true, rect: r, y0: -0.3, y1: WY, mat: 'sandstone_red' });
    const along = r[2] - r[0] > r[3] - r[1];
    for (const k of along ? [[r[0], r[1] - 0.12, r[2], r[1]], [r[0], r[3], r[2], r[3] + 0.12]] : [[r[0] - 0.12, r[1], r[0], r[3]], [r[2], r[1], r[2] + 0.12, r[3]]]) E.push({ t: 'block', rect: k, y0: -0.3, y1: WY + 0.06, mat: 'marble', collide: false });
  };
  const R0 = 12.15, R1 = GRIM - 2;
  for (const s of [-1, 1]) for (const q of [-1, 1]) for (const c of GWALKS) {
    const lo = q > 0 ? R0 : -R1, hi = q > 0 ? R1 : -R0;
    raised([s * c - GW, lo, s * c + GW, hi]);                       // north–south, in the quarter on side s
    raised([lo, s * c - GW, hi, s * c + GW]);                       // east–west
  }
  raised([-GRIM - 2, R1, GRIM + 2, GRIM + 2]); raised([-GRIM - 2, -GRIM - 2, GRIM + 2, -R1]);
  raised([R1, -R1, GRIM + 2, R1]); raised([-GRIM - 2, -R1, -R1, R1]);
}
// the riverfront: the terrace's face to the Yamuna, an arcade of blind arches with a parapet over it, between the towers
for (const [xa, xb] of [[tx0 + 4.2, tx1 - 4.2]]) E.push({ t: 'mughal_wall', a: [xa, tz0], b: [xb, tz0], y: -4.6, h: 7.1, inside: [0, 0] });
// the walls round the garden and the forecourt, their octagonal towers, the pavilions on the east and west walls
const wall = (a, b) => E.push({ t: 'mughal_wall', a, b, h: 7 });
wall([gx0, gz0], [gx0, gz1]); wall([gx1, gz0], [gx1, gz1]);
wall([gx0, gz1], [-GATE.w / 2, gz1]); wall([GATE.w / 2, gz1], [gx1, gz1]);
for (const [x, z] of [[gx0, gz1], [gx1, gz1], [tx0, tz0], [tx1, tz0]]) E.push({ t: 'octa_tower', c: [x, z], h: 12, r: 4 });
for (const s of [-1, 1]) E.push({ t: 'red_hall', rect: s < 0 ? [gx0 - 10, -14, gx0 + 2, 14] : [gx1 - 2, -14, gx1 + 10, 14], y: 0.2, h: 9, front: s < 0 ? 'e' : 'w', interior: 'pavilion' });
E.push({ t: 'great_gate', c: GATE.c, y: 0, w: GATE.w, d: GATE.d, h: GATE.h, rooms: true });
const [fx0, fz0, fx1, fz1] = FORECOURT;
E.push({ t: 'lane', rect: FORECOURT, y: 0.05, mat: 'sandstone_red' });
// the forecourt's three gates and the two bazaar streets from the east and west gates toward its middle, each lined on
// both sides with cells behind arcaded verandahs (docs/settlements/mughal-agra.md §5)
const BZ = 200, BW = 4.5, GTW = 20;
wall([fx0, fz0], [fx0, BZ - GTW / 2]); wall([fx0, BZ + GTW / 2], [fx0, fz1]); wall([fx1, fz0], [fx1, BZ - GTW / 2]); wall([fx1, BZ + GTW / 2], [fx1, fz1]);
wall([fx0, fz1], [-GTW / 2, fz1]); wall([GTW / 2, fz1], [fx1, fz1]);
for (const sx of [-1, 1]) {
  E.push({ t: 'bazaar_gate', c: [sx * fx1, BZ], axis: 'x', w: GTW, d: 8, h: 11 });
  for (const sz of [-1, 1]) E.push({ t: 'bazaar_row', x0: sx < 0 ? fx0 + 4.2 : 48, x1: sx < 0 ? -48 : fx1 - 4.2, z: BZ + sz * BW, facing: sz < 0 ? 's' : 'n', cell: 3.2, deep: 4, ver: 3 });
  E.push({ t: 'lane', rect: sx < 0 ? [-170, BZ - BW, fx0 - 4, BZ + BW] : [fx1 + 4, BZ - BW, 170, BZ + BW], y: 0.04, mat: 'sandstone_red' });
}
E.push({ t: 'bazaar_gate', c: [0, fz1], axis: 'z', w: GTW, d: 8, h: 11 });

const room = (id, rect, y, kind) => ({ id, rect, y, kind });
const rooms = [room('tomb chamber', [-11, -214, 11, -192], PLINTH.y, 'hall'), room('plinth', [-47.5, -250.5, 47.5, -155.5], PLINTH.y, 'open'), room('garden', GARDEN, 0, 'open')];
const walks = [[[0, 240], [0, 200], [0, 172], [0, 140], [0, 18], [0, -18], [0, -146], [0, -152], [0, -158]]];
walks[0].y0 = 0;

export const taj = {
  id: 'mughal-agra-taj',
  name: { en: 'The Taj Mahal', zh: '泰姬陵' },
  era: { en: 'Mughal, 1632–1653', zh: '莫卧儿，1632–1653年' },
  style: 'mughal',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [0, 245], facing: 'n' },
  bounds: [-160, -262, 160, 232],
  bakeBounds: [-48, -251, 48, -155],
  view: [-30, -232, 30, -174],
  bakeTop: 80,
  elements: E,
  rooms,
  walks,
};
export default taj;
