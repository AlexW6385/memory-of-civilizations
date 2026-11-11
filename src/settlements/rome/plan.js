// The Campus Martius under Hadrian (docs/settlements/rome.md §2–§4): the Pantheon (the full
// building of the previous design, src/buildings/pantheon) with its forecourt; the Baths of
// Agrippa; the Saepta Julia; the Stadium of Domitian.

import { BATHS, SAEPTA, STADIUM } from './layout.js';
import '../../styles/roman/baths.js';
import pantheonPlan from '../../buildings/pantheon/plan.js';

const E = [];
E.push({ t: 'baths_agrippa', rect: BATHS });
E.push({ t: 'porticus', rect: SAEPTA, h: 9, depth: 7 });
E.push({ t: 'stadium', rect: STADIUM, h: 20, depth: 28, rows: 14 });

export const campus = {
  id: 'rome-campus',
  name: { en: 'The Campus Martius', zh: '战神广场' },
  era: { en: 'Imperial Rome, about AD 128', zh: '罗马帝国，约公元128年' },
  style: 'roman',
  origin: [0, 0], base: 0, yaw: 0, feature: true,
  entrance: { at: [0, -200], facing: 's' },
  bounds: [STADIUM[0] - 2, SAEPTA[1] - 2, SAEPTA[2] + 2, BATHS[3] + 2],
  elements: E,
  rooms: (() => {
    const [x0, z0, x1, z1] = BATHS, cx = (x0 + x1) / 2, bz = z0 + 6;
    return [
      { id: 'frigidarium', rect: [cx - 29, bz + 1, cx + 29, z0 + 43], y: 0, kind: 'hall', market: false },
      { id: 'tepidarium', rect: [cx - 13, z0 + 39, cx + 13, z0 + 55], y: 0, kind: 'hall', market: false },
      { id: 'apodyterium-w', rect: [cx - 29, z0 + 39, cx - 15, z0 + 55], y: 0, kind: 'hall', market: false },
      { id: 'apodyterium-e', rect: [cx + 15, z0 + 39, cx + 29, z0 + 55], y: 0, kind: 'hall', market: false },
      { id: 'caldarium', rect: [cx - 14, z0 + 58, cx + 14, z0 + 86], y: 0, kind: 'hall', market: false },
    ];
  })(),
};
export const pantheon = { ...pantheonPlan, origin: [0, 0], base: 0, district: undefined, view: [-30, -70, 30, -40] };
export default pantheon;
