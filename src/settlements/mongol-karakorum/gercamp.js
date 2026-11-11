// The landmark of the camp: a ger of the court's camp opened and furnished (docs/settlements/mongol-karakorum.md §6), with the camp of gers and wagons round it.
import { CAMPS } from './layout.js';
import { campElements } from './camp.js';

const OPEN = 4, SEED = 1254;
const { E, G } = campElements(CAMPS.sw, SEED, OPEN);
const g = G[OPEN];
E.push({ t: 'tug', at: [CAMPS.sw[0] - 30, CAMPS.sw[1] - 16], h: 6.5 });
const room = (id, rect, y, kind) => ({ id, rect, y, kind });
const rooms = [room('ger', [g.c[0] - g.r + 0.3, g.c[1] - g.r + 0.3, g.c[0] + g.r - 0.3, g.c[1] + g.r - 0.3], 0, 'hall'), room('camp', [CAMPS.sw[0] - 44, CAMPS.sw[1] - 24, CAMPS.sw[0] + 44, CAMPS.sw[1] + 30], 0, 'open')];
const walks = [[[g.c[0], g.c[1] + g.r + 6], [g.c[0], g.c[1] + g.r + 1], [g.c[0], g.c[1] + 1.2], [g.c[0] + 1.6, g.c[1] - 1.4]]];
walks[0].y0 = 0;
export const gerCamp = {
  id: 'karakorum-ger-camp',
  name: { en: 'The Court\'s Ger Camp', zh: '汗庭的毡帐营地' },
  era: { en: 'Mongol Empire, 1254', zh: '蒙古帝国，1254年' },
  style: 'mongol',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [g.c[0], g.c[1] + g.r + 6], facing: 'n' },
  bounds: [CAMPS.sw[0] - 46, CAMPS.sw[1] - 26, CAMPS.sw[0] + 46, CAMPS.sw[1] + 32],
  bakeBounds: [g.c[0] - g.r - 2, g.c[1] - g.r - 2, g.c[0] + g.r + 2, g.c[1] + g.r + 4],
  view: [g.c[0] - 8, g.c[1] - 8, g.c[0] + 8, g.c[1] + 8],
  bakeTop: 8,
  elements: E,
  rooms,
  walks,
};
export default gerCamp;
