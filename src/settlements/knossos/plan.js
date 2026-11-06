// The palace of Knossos about 1600 BC (docs/settlements/knossos.md §2–§4): the West Wing of three
// storeys with its magazines and, on the court, the Throne Room's antechamber and the Tripartite
// Shrine; the North Wing split by the North Entrance Passage under the bastion's portico; the East
// Wing of four storeys (the residential quarter, the Grand Staircase) with its portico on the
// court; the South Wing and the south propylon; the West Court; the theatral area.

import { COURT, THEATRAL } from './layout.js';

const E = [];
// the Central Court's paving
E.push({ t: 'floor', rect: COURT, y: 0.05, th: 0.3, mat: 'flagstone' });
// the wings
// the West Wing, with the Throne Room cut into it behind its antechamber: the room, the lustral basin sunk in its
// south-west corner under a light well open to the sky, the two double doors from the antechamber
const TR = [-25.8, -19.6, -19.8, -12.6], PIT = [-25.8, -15.4, -22.8, -12.6];
E.push({ t: 'wing', rect: [-62, -60, -19, 58], storeys: 3, windows: 'w', seed: 1,
  holes: [{ rect: TR, h: 3.6 }, { rect: PIT, h: 99 }, { rect: [-19.8, -18.2, -19.0, -16.6], h: 2.6, lintel: true }, { rect: [-19.8, -15.6, -19.0, -14.0], h: 2.6, lintel: true }],
  pits: [{ rect: PIT, depth: 1.0 }] });
E.push({ t: 'throne_room', rect: TR, y: 0, throne: [-23.2, -19.6], pit: PIT, pitDepth: 1.0 });
E.push({ t: 'stair', rect: [-24.0, -14.1, -22.8, -12.6], dir: 'e', y0: -1.0, y1: 0, riser: 0.25, base: -1.0, mat: 'gypsum_minoan' });
// the west façade in setbacks: blocks standing forward of the line by a metre or three, at different heights,
// so that the long front breaks into sun and shadow; the west entrance with its porch in the south part
for (const [z0, z1, out, st, sd] of [[-60, -38, 2.4, 3, 11], [-30, -12, 1.2, 2, 12], [-4, 14, 3.0, 3, 13], [22, 30, 1.6, 2, 14], [48, 58, 2.2, 3, 15]]) E.push({ t: 'wing', rect: [-62 - out, z0, -62, z1], storeys: st, windows: 'wns', seed: sd, horns: st === 3 });
E.push({ t: 'portico', a: [-62, 34], b: [-62, 44], n: 1, depth: 4, side: -1, h: 3.6 });
E.push({ t: 'wing', rect: [-19, -62, -3, -28], storeys: 2, windows: 'n', seed: 2 }, { t: 'wing', rect: [3, -62, 40, -28], storeys: 2, windows: 'ne', seed: 3 });
// the East Wing of four storeys: the light well of the Grand Staircase, its colonnades storey above storey; the
// Queen's Megaron opening off it with the dolphins on its wall; a passage in from the court's portico
const LW = [23, -2, 29, 6], QM = [23, 6, 31, 13];
E.push({ t: 'wing', rect: [19, -28, 62, 58], storeys: 4, windows: 'es', seed: 4,
  holes: [{ rect: LW, h: 99 }, { rect: QM, h: 3.6 }, { rect: [19, 0, 23, 2], h: 2.6, lintel: true }] });
E.push({ t: 'lightwell_tiers', rect: LW, y: 0, storeys: 4, sh: 3.6 });
E.push({ t: 'fresco', kind: 'dolphins', at: [27, 13], face: 'n', y0: 1.4, w: 3.6, h: 1.3, bg: 'plaster_white' });
// the bull-leaping fresco on the back wall of the east portico, toward its north end
E.push({ t: 'fresco', kind: 'bull_leaping', at: [19, -12], face: 'w', y0: 1.1, w: 1.9, h: 1.0, bg: 'egyptian_blue' });
E.push({ t: 'wing', rect: [-19, 28, -3, 58], storeys: 2, windows: 's', seed: 5 }, { t: 'wing', rect: [3, 28, 19, 58], storeys: 2, windows: 's', seed: 6 });
// porticoes on the court: the Throne Room's antechamber, the Tripartite Shrine, the east side, the south
E.push({ t: 'portico', a: [-14.2, -20], b: [-14.2, -8], n: 4, depth: 4.6, side: -1, h: 3.4 });
E.push({ t: 'portico', a: [-14.2, 0], b: [-14.2, 12], n: 3, depth: 4.6, side: -1, h: 3.4 });
E.push({ t: 'portico', a: [14.2, -22], b: [14.2, 22], n: 10, depth: 4.6, side: 1, h: 3.6 });
// the North Entrance: the passage between the wings, the bastion's portico above its ramp
E.push({ t: 'portico', a: [-6, -66], b: [6, -66], n: 4, depth: 4, side: -1, h: 3.4 });
// the West Bastion: a portico raised over the passage, the charging bull in painted relief on its back wall
E.push({ t: 'bastion', rect: [-12, -72, -6, -62], y: 0, podium: 2.4, front: 'e' }, { t: 'wing', rect: [6, -72, 12, -62], storeys: 1, sh: 4.4, windows: '' });
// the south propylon
E.push({ t: 'portico', a: [-3, 60], b: [3, 60], n: 2, depth: 3, side: 1, h: 3.4 });
// the West Court's raised walks and the theatral area
E.push({ t: 'floor', rect: [-120, -50, -64, 50], y: 0.05, th: 0.3, mat: 'flagstone' });
E.push({ t: 'steps', rect: [THEATRAL[0], THEATRAL[1], THEATRAL[2], THEATRAL[1] + 8], n: 8, rise: 0.3, dir: 'n' });
E.push({ t: 'steps', rect: [THEATRAL[2] - 8, THEATRAL[1], THEATRAL[2], THEATRAL[3]], n: 6, rise: 0.3, dir: 'e' });

const room = (id, rect, y, kind) => ({ id, rect, y, kind });
const rooms = [room('central court', COURT, 0.05, 'open'), room('west court', [-120, -50, -64, 50], 0.05, 'open'), room('throne room antechamber', [-19, -20, -14, -8], 0, 'hall'),
  room('throne room', TR, 0, 'inner'), room('grand staircase light well', LW, 0, 'open'), room("queen's megaron", QM, 0, 'inner')];
const walks = [[[-100, 0], [-90, -70], [-60, -89], [0, -89], [0, -60], [0, 0]]];
walks[0].y0 = 0;

export const palace = {
  id: 'knossos-palace',
  name: { en: 'The Palace of Knossos', zh: '克诺索斯王宫' },
  era: { en: 'Minoan Crete, about 1600 BC', zh: '米诺斯克里特，约公元前1600年' },
  style: 'minoan',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [-100, 0], facing: 'e' },
  bounds: [-125, -100, 66, 64],
  view: COURT,
  bakeTop: 18,
  elements: E,
  rooms,
  walks,
};
export default palace;
