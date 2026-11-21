// The Campus Martius under Hadrian (docs/settlements/rome.md §2–§4): the Pantheon (the full
// building of the previous design, src/buildings/pantheon) with its forecourt; the Baths of
// Agrippa; the Saepta Julia; the Stadium of Domitian.

import { BATHS, SAEPTA, STADIUM, SAEPTA_GATES } from './layout.js';
import '../../styles/roman/saepta.js';
import '../../styles/roman/baths.js';
import pantheonPlan from '../../buildings/pantheon/plan.js';
import { UPPER_WALKS, SHOP_WALKS } from './walks.js';
import { forecourtElements } from './forecourt.js';
import { nightElements, wearElements } from './pantheon-night.js';

const E = [];
E.push({ t: 'baths_agrippa', rect: BATHS });
E.push({ t: 'saepta', rect: SAEPTA, depth: 7, gates: SAEPTA_GATES });
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
// Wear of the landmark (docs/settlements/rome.md §4.22): the seven steps of the portico trodden pale in the middle, as thin slabs 5 mm proud of the marble, no collision.
// (Patches of greyed paving down the forecourt's axis were tried and read as dark rectangles: left out.)
const hz = (a, b) => { let h = Math.imul(Math.round(a * 8) ^ 0x9e3779b1, 73856093) ^ Math.imul(Math.round(b * 8) + 17, 19349663); h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
const WEAR = [];
for (let i = 0; i < 7; i++) {
  const zA = -51.2 + 0.3 * i, top = 0.18571 * (i + 1);
  WEAR.push({ t: 'slab', rect: [-3.2 + hz(i, 1) * 0.6, zA + 0.02, 3.2 - hz(i, 2) * 0.6, zA + 0.28 - 0.04 * hz(i, 3)], y0: top, y1: top + 0.005, mat: 'plaster_damp' });
}
export const pantheon = { ...pantheonPlan, elements: [...pantheonPlan.elements, ...WEAR, ...forecourtElements(), ...nightElements(), ...wearElements()], origin: [0, 0], base: 0, district: undefined, view: [-30, -70, 30, -40], walks: [...(pantheonPlan.walks || []), ...UPPER_WALKS, ...SHOP_WALKS] };
export default pantheon;
