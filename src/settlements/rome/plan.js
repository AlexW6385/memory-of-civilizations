// The Campus Martius under Hadrian (docs/settlements/rome.md §2–§4): the Pantheon (the full
// building of the previous design, src/buildings/pantheon) with its forecourt; the Baths of
// Agrippa; the Saepta Julia; the Stadium of Domitian.

import { BATHS, SAEPTA, STADIUM } from './layout.js';
import pantheonPlan from '../../buildings/pantheon/plan.js';

const E = [];
E.push({ t: 'thermae', rect: BATHS, h: 24 });
E.push({ t: 'porticus', rect: SAEPTA, h: 9, depth: 7 });
E.push({ t: 'stadium', rect: STADIUM, h: 16, depth: 28, rows: 12 });

export const campus = {
  id: 'rome-campus',
  name: { en: 'The Campus Martius', zh: '战神广场' },
  era: { en: 'Imperial Rome, about AD 128', zh: '罗马帝国，约公元128年' },
  style: 'roman',
  origin: [0, 0], base: 0, yaw: 0, feature: true,
  entrance: { at: [0, -200], facing: 's' },
  bounds: [STADIUM[0] - 2, SAEPTA[1] - 2, SAEPTA[2] + 2, BATHS[3] + 2],
  elements: E,
  rooms: [],
};
export const pantheon = { ...pantheonPlan, origin: [0, 0], base: 0, district: undefined, view: [-30, -70, 30, -40] };
export default pantheon;
