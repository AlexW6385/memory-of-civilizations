// Manueline Lisbon about 1520: the two landmarks (docs/settlements/manueline-lisbon.md §3–§5) — the Jerónimos church and cloister on
// their plaza, and the Belém Tower on its bastion in the river.
import { GROUND, CHURCH, CLOISTER, MONASTERY, PLAZA, PORTAL_X, TOWER, CAUSEWAY } from './layout.js';
import { churchFrame } from '../../styles/manueline/church.js';
import { cloisterFrame } from '../../styles/manueline/cloister.js';

const g = GROUND + 0.05;
const CF = churchFrame(CHURCH), KF = cloisterFrame(CLOISTER);
const [X0, Z0, X1, Z1] = CLOISTER;
const rings = [[X0, Z0, X1, Z0 + 7], [X0, Z1 - 7, X1, Z1], [X0, Z0 + 7, X0 + 7, Z1 - 7], [X1 - 7, Z0 + 7, X1, Z1 - 7]];
export const jeronimos = {
  id: 'manueline-jeronimos',
  name: { en: 'The Jerónimos church and cloister', zh: '热罗尼莫斯修道院教堂与回廊' },
  era: { en: 'Lisbon, about 1520', zh: '里斯本，约1520年' },
  style: 'manueline',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [PORTAL_X, PLAZA[3] - 6], facing: 'n' },
  bounds: [MONASTERY[0] - 8, MONASTERY[1] - 8, MONASTERY[2] + 8, PLAZA[3] + 2],
  view: [CHURCH[0] - 20, CHURCH[3] + 20, CHURCH[2] + 20, CHURCH[3] + 90],
  bakeTop: 30,
  elements: [
    { t: 'floor', rect: PLAZA, y: g, th: 0.3, mat: 'flagstone' },
    { t: 'jeron_church', rect: CHURCH, y: g, portalX: PORTAL_X },
    { t: 'cloister', rect: CLOISTER, y: g },
    { t: 'range', rect: [MONASTERY[0], MONASTERY[1], MONASTERY[2] - 0, CLOISTER[1] - 0.0], y: g, h: 12 },
    { t: 'range', rect: [MONASTERY[0], CLOISTER[1], CLOISTER[0], CHURCH[1]], y: g, h: 11 },
    { t: 'range', rect: [CLOISTER[2], CLOISTER[1], MONASTERY[2], CHURCH[1] + 0.0], y: g, h: 11 },
  ],
  rooms: [
    { id: 'plaza', rect: [PORTAL_X - 20, 44, PORTAL_X + 20, 110], y: g, kind: 'open' },
    { id: 'nave', rect: [CF.bays[1] + 1, CF.zi0 + 1, CF.chancel - 1, CF.zi1 - 1], y: g, kind: 'hall' },
    { id: 'main chapel', rect: [CF.chancel + 1, CF.zi0 + 1, CF.xi1 - 6, CF.zi1 - 1], y: g + 1.2, kind: 'hall' },
    { id: 'cloister court', rect: [KF.court[0] + 2, KF.court[1] + 2, KF.court[2] - 2, KF.court[3] - 2], y: g, kind: 'open' },
    ...['north', 'south', 'west', 'east'].map((n, i) => ({ id: `cloister gallery ${n}`, rect: [rings[i][0] + 1, rings[i][1] + 1, rings[i][2] - 1, rings[i][3] - 1], y: g, kind: 'inner' })),
    { id: 'upper gallery north', rect: [rings[0][0] + 1, rings[0][1] + 1, rings[0][2] - 1, rings[0][3] - 1], y: g + 7, kind: 'inner' },
    { id: 'upper gallery west', rect: [rings[2][0] + 1, rings[2][1] + 1, rings[2][2] - 1, rings[2][3] - 1], y: g + 7, kind: 'inner' },
  ],
  walks: [
    Object.assign([[PORTAL_X, PLAZA[3] - 6], [PORTAL_X, 46], [PORTAL_X + 1.8, 39], [PORTAL_X + 1.8, CF.zc + 3], [CF.bays[3] - 5, CF.zc + 3], [CF.chancel - 4, CF.zc], [CF.bays[3] + 5, CF.zc - 7], [(CF.bays[3] + CF.bays[4]) / 2, CF.zi0 + 2], [(CF.bays[3] + CF.bays[4]) / 2, CHURCH[1] - 3], [(CF.bays[3] + CF.bays[4]) / 2, Z1 - 3.5],
      [X1 - 3.5, Z1 - 3.5], [X1 - 3.5, Z0 + 23.5], [X1 - 5.15, Z0 + 21], [X1 - 5.15, Z0 + 10], [X1 - 5.15, Z0 + 7.5], [X1 - 3.5, Z0 + 3.5], [X0 + 3.5, Z0 + 3.5], [X0 + 3.5, Z1 - 3.5]], { y0: g }),
  ],
};
export const belem = {
  id: 'manueline-belem',
  name: { en: 'The Belém Tower', zh: '贝伦塔' },
  era: { en: 'Lisbon, about 1520', zh: '里斯本，约1520年' },
  style: 'manueline',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [CAUSEWAY[0] + 1.6, CAUSEWAY[1] + 2], facing: 's' },
  bounds: [TOWER.c[0] - 30, CAUSEWAY[1] - 4, TOWER.c[0] + 30, TOWER.c[1] + 22],
  view: [TOWER.c[0] - 60, TOWER.c[1] - 80, TOWER.c[0] + 60, TOWER.c[1] - 20],
  bakeTop: 36,
  elements: [{ t: 'belem_tower', c: TOWER.c, y: TOWER.deck, causeway: CAUSEWAY }],
  rooms: [{ id: 'bastion deck', rect: [TOWER.c[0] - 11, TOWER.c[1] - 5, TOWER.c[0] + 11, TOWER.c[1] + 9], y: TOWER.deck, kind: 'open' }],
  walks: [Object.assign([[CAUSEWAY[0] + 1.6, CAUSEWAY[1] + 2], [CAUSEWAY[0] + 1.6, CAUSEWAY[3] - 1], [TOWER.c[0] - 9, TOWER.c[1] + 2], [TOWER.c[0], TOWER.c[1] + 9], [TOWER.c[0] + 9, TOWER.c[1] + 2]], { y0: GROUND })],
};
