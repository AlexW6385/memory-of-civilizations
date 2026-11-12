// The Oba's palace of Benin, c. 1600 (docs/settlements/benin-city.md §3): the gatehouse in the south wall, the outer court of audience
// between two long galleries, the great gallery of the Oba on brass pillars with its dais, the three inner courts behind with their
// impluvia and the ancestral altars, the turrets with spires, brass snakes and birds, the red clay wall round all.
// Authored in world coordinates (origin 0, yaw 0); the front faces south on the king's square.
import { PALACE, GATE_X } from './layout.js';

const [X0, Z0, X1, Z1] = PALACE;
const HALL = [-112, -76, -18, -64], OC = [-130, -64, -6, -2];
const COURTS = [[-130, -123.8, -90, -82], [-86, -123.8, -46, -82], [-42, -123.8, -6, -82]];
const E = [];
// the wall round the palace, with the gate in the south side
const WALL = { th: 1.0, h: 3.8 };
E.push({ t: 'benin_wall', a: [X0 + 0.5, Z1 - 0.6], b: [X1 - 0.5, Z1 - 0.6], ...WALL, openings: [{ at: GATE_X - X0 - 0.5, w: 5.4, h: 4.2 }], seed: 1 });
E.push({ t: 'benin_wall', a: [X0 + 0.5, Z0 + 0.6], b: [X1 - 0.5, Z0 + 0.6], ...WALL, seed: 2 });
E.push({ t: 'benin_wall', a: [X0 + 0.5, Z0 + 0.6], b: [X0 + 0.5, Z1 - 0.6], ...WALL, seed: 3 });
E.push({ t: 'benin_wall', a: [X1 - 0.5, Z0 + 0.6], b: [X1 - 0.5, Z1 - 0.6], ...WALL, seed: 4 });
E.push({ t: 'benin_gatehouse', c: [GATE_X, Z1], seed: 7 });
// the outer court between its galleries (an open earthen court: no impluvium), the great gallery on its north side
E.push({ t: 'benin_court', rect: OC, sides: { n: false, s: false }, impluvium: false, doors: { w: [14, 46], e: [14, 46] }, seed: 11 });
E.push({ t: 'benin_hall', rect: HALL, doors: [-95, -35], seed: 12 });
// the inner courts: impluvia, galleries, altars along the north galleries
COURTS.forEach((r, i) => E.push({ t: 'benin_court', rect: r, noWall: ['n'], altars: { side: 'n', n: i === 1 ? 5 : 3 }, doors: { s: [(r[2] - r[0]) / 2], w: i === 0 ? [20] : false, e: i === 2 ? [20] : false }, seed: 21 + i }));
// the turrets: the great ones (new bright brass python down the clay, a large bird on the point) on the two ends of the audience gallery and
// beside the gate, the lesser at the corners; the long front galleries behind the south wall with their steep shingled roofs between them
E.push({ t: 'benin_tower', c: [-121, -70], h: 22, bh: 9, r: 1.9, big: true, snake: 's', seed: 31 });
E.push({ t: 'benin_tower', c: [-9, -70], h: 22, bh: 9, r: 1.9, big: true, snake: 's', seed: 32 });
for (const s of [-1, 1]) E.push({ t: 'benin_tower', c: [GATE_X + s * 17, -5.2], h: 19, bh: 8, r: 1.8, big: true, snake: 's', seed: 33 + s });
for (const [c, s] of [[[X0 + 4.5, Z1 - 4.5], 'e'], [[X1 - 4.5, Z1 - 4.5], 'w'], [[X0 + 4.5, Z0 + 4.5], 'e'], [[X1 - 4.5, Z0 + 4.5], 'w']]) E.push({ t: 'benin_tower', c, h: 12.5, snake: s, seed: 40 + Math.round(c[0]) });
E.push({ t: 'benin_frontrange', xs: [X0 + 11, GATE_X - 20], seed: 61 });
E.push({ t: 'benin_frontrange', xs: [GATE_X + 20, X1 - 11], seed: 62 });

// the servants' and stores' ranges in the two strips of the compound beside the outer court: their rooms open to a lane before the court's side walls
for (const [z0, z1] of [[-118, -90], [-88, -60], [-58, -30], [-26, -10]]) {
  E.push({ t: 'benin_range', rect: [-1.5, z0, 8.7, z1], front: 'w', seed: Math.round(-z0), kinds: ['store', 'kitchen', 'sleep', 'brass', 'sleep', 'store'] });
  E.push({ t: 'benin_range', rect: [-138.6, z0, -133.0, z1], front: 'e', seed: Math.round(-z0) + 50, kinds: ['sleep', 'store', 'kitchen', 'sleep', 'brass', 'kitchen'] });
}
// the cast leopards at the gate
for (const s of [-1, 1]) E.push({ t: 'benin_leopard', at: [GATE_X + s * 3.6, 6.2], y: 0.45, s, plinth: true });

const room = (id, rect, y, kind) => ({ id, rect, y, kind });
const rooms = [
  room('outer court', [-124, -63, -12, -3], 0.03, 'open'),
  room('great gallery', [-111, -75, -19, -65], 0.35, 'hall'),
  room('west gallery', [-129, -62, -125.2, -4], 0.3, 'inner'),
  room('east gallery', [-10.8, -62, -6.2, -4], 0.3, 'inner'),
  room('court of the queen mother', [-125, -118, -95, -87], 0.03, 'inner'),
  room('court of the altars', [-81, -118, -51, -87], 0.03, 'inner'),
  room('court of the pages', [-37, -118, -11, -87], 0.03, 'inner'),
];
const walks = [Object.assign([[GATE_X, 12], [GATE_X, -6], [GATE_X, -30], [-64.6, -62], [-64.6, -66], [-80, -68.5], [-95, -70], [-95, -75], [-95, -79], [-68, -79], [-66, -85], [-66, -100]], { y0: 0 })];

export const palace = {
  id: 'benin-palace',
  name: { en: "The Oba's Palace", zh: '奥巴王宫' },
  era: { en: 'Benin City, about 1600', zh: '贝宁城，约1600年' },
  style: 'benin',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [GATE_X, 12], facing: 'n' },
  bounds: [X0 - 8, Z0 - 8, X1 + 8, Z1 + 12],
  view: [X0, Z0, X1, Z1 + 30],
  bakeTop: 22,
  elements: E,
  rooms,
  walks,
};
