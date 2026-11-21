// The landmark: the cedar-plank house with its frontal pole at z = 0 (docs/settlements/sgang-gwaay.md §4): the stepped sunk
// floor, the hearth, four carved house posts under two beams, the smoke hole, sleeping places with screens, the painted
// house screen and the chief's room behind it, bentwood boxes and the stores. The other sixteen houses are the town's.

import { RADIUS, G, LANDMARK, houses, tiers, toWorld } from './layout.js';


const h = houses()[LANDMARK];
const hd = h.d / 2;
const E = [{ t: 'haida_house', c: h.c, yaw: h.yaw, w: h.w, d: h.d, age: h.age, ridge: h.ridge, eave: h.eave, seed: h.seed, g: G, landmark: true, tiers: tiers(h) }];

const room = (id, rect, y, kind) => ({ id, rect, y, kind });
const [ax, az] = toWorld(h, -h.w / 2 + 0.5, -hd + 0.5), [bx, bz] = toWorld(h, h.w / 2 - 0.5, hd - 0.5);
const rooms = [room('house', [Math.min(ax, bx), Math.min(az, bz), Math.max(ax, bx), Math.max(az, bz)], G - 1.2, 'hall'), room('street', [20, -40, 60, 40], G, 'open')];
const P = (u, v) => toWorld(h, u, v);
const walks = [[P(0, -hd - 6), P(0, -hd - 1.5), P(0, -hd + 1.0), P(0, -hd + 3.2), P(0, 0), P(0, 3.9), P(0, hd - 2.6)]];
walks[0].y0 = G;
// the visitor's walk into nine more of the row's houses: from the street before the frontal pole, through the oval door at its foot, down the tiers to the hearth and on to the back
for (const k of [2, 3, 5, 6, 10, 11, 4, 7, 9, 12]) {
  const o = houses()[k], Q = (u, v) => toWorld(o, u, v), od = o.d / 2;
  const w = [Q(0, -od - 6), Q(0, -od - 1.5), Q(0, -od + 1.0), Q(0, -od + 3.2), Q(-1.5, -od + 4.4)];
  w.y0 = G; walks.push(w);
}

export const house = {
  id: 'sgang-gwaay-house',
  name: { en: 'A Haida house at SG̱ang Gwaay', zh: '斯冈瓜伊的海达木屋' },
  era: { en: 'Haida Gwaii, c. 1850', zh: '海达瓜依，约1850年' },
  style: 'haida',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: P(0, -hd - 6), facing: 'w' },
  bounds: [h.c[0] - 14, h.c[1] - 16, h.c[0] + 17, h.c[1] + 16],
  bakeBounds: [h.c[0] - 12, h.c[1] - 14, h.c[0] + 14, h.c[1] + 14],
  view: [h.c[0] - 12, h.c[1] - 12, h.c[0] + 14, h.c[1] + 12],
  viewY: G,
  bakeTop: 12,
  elements: E,
  rooms,
  walks,
};
void RADIUS;
export default house;
