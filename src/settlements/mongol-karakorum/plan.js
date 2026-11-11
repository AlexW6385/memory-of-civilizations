// The palace compound of Möngke Khan, Karakorum, 1254 (docs/settlements/mongol-karakorum.md §4): enclosed by a brick wall "like a monastery's",
// the great hall with its nave and two aisles between two rows of pillars and three doors to the south, the silver tree inside at the middle
// door, the dais at the north; the court before it with the khan's great ger and a wagon-house, the nine-tailed banners, the stone tortoise;
// the storehouses and the cellar for the drinks along the walls.

import { PALACE, HALL, HALL_RECT, TREE, PALACE_GATE, STORES, COURT_GER, COURT_CART, BANNERS, TORTOISE } from './layout.js';

const E = [];
const [px0, pz0, px1, pz1] = PALACE;
const gx = PALACE_GATE.c[0], gate = 7.5 + 1.2;
// the wall of the compound: brick, 4.2 m, a tiled coping; the south side open at the gate hall
E.push({ t: 'brick_wall', a: [px0, pz0], b: [px1, pz0] }, { t: 'brick_wall', a: [px1, pz0], b: [px1, pz1] }, { t: 'brick_wall', a: [px0, pz0], b: [px0, pz1] });
E.push({ t: 'brick_wall', a: [px0, pz1], b: [gx - gate, pz1] }, { t: 'brick_wall', a: [gx + gate, pz1], b: [px1, pz1] });
E.push({ t: 'gate_hall', c: PALACE_GATE.c, y: PALACE_GATE.y });
// Möngke's hall and the silver tree before the middle door, inside
E.push({ t: 'palace_hall', c: HALL.c, y: HALL.y });
E.push({ t: 'silver_tree', c: TREE, y: HALL.y + 0.04, seed: 3, h: 4.5 });
// the court
E.push({ t: 'ger', c: COURT_GER.c, r: COURT_GER.r, open: true, rich: true, seed: 11 });
E.push({ t: 'ger', c: COURT_CART.c, r: COURT_CART.r, cart: true, rich: true, seed: 12, door: Math.PI / 2 });
for (const at of BANNERS) E.push({ t: 'tug', at, h: 7.5 });
E.push({ t: 'tortoise', at: TORTOISE, yaw: 0.4 });
// the storehouses (provisions and treasure "in great barns" [stated: Rubruck via UW]) and, on the west, the kitchens and the cellar of the drinks
STORES.forEach((r, i) => E.push({ t: 'tile_hall', rect: r, y: 0.6, nx: 3, H: 4.0, kind: i < 2 ? 'gable' : 'hip', mat: 'tile_grey', wallMat: 'brick_grey', altar: null }));
// the cellar's mouth: a low brick vault set into the ground north of the hall, from which the drink is carried
E.push({ t: 'tile_stack', rect: [96, -90, 100, -88], y: 0, rows: 3 });

const room = (id, rect, y, kind) => ({ id, rect, y, kind });
const F = HALL.y + 0.04;
const rooms = [
  room('palace-hall', [HALL_RECT[0] + 0.2, HALL_RECT[1] + 0.2, HALL_RECT[2] - 0.2, HALL_RECT[3] - 0.2], F, 'hall'),
  room('khan-ger', [COURT_GER.c[0] - COURT_GER.r + 0.3, COURT_GER.c[1] - COURT_GER.r + 0.3, COURT_GER.c[0] + COURT_GER.r - 0.3, COURT_GER.c[1] + COURT_GER.r - 0.3], 0, 'hall'),
  room('court', PALACE, 0, 'open'),
];
const walks = [[[70, -4], [70, -18], [70, -38], [70, -43], [76, -60], [70, -70]], [[104, -18], [104, -24]]];
walks[0].y0 = 0; walks[1].y0 = 0;

export const palace = {
  id: 'karakorum-palace',
  name: { en: 'The Palace of Möngke Khan', zh: '蒙哥汗的宫殿' },
  era: { en: 'Mongol Empire, 1254', zh: '蒙古帝国，1254年' },
  style: 'mongol',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [70, -4], facing: 'n' },
  bounds: [PALACE[0] - 3, PALACE[1] - 3, PALACE[2] + 3, PALACE[3] + 3],
  bakeBounds: [PALACE[0], PALACE[1], PALACE[2], PALACE[3] + 8],
  view: [HALL_RECT[0] - 4, HALL_RECT[1] - 2, HALL_RECT[2] + 4, HALL_RECT[3] + 2],
  bakeTop: 18,
  elements: E,
  rooms,
  walks,
};
export default palace;
