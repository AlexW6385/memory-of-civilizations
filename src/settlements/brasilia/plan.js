// Brasília about 1970 (docs/settlements/brasilia.md §1a–1c, §8): two landmarks. The Congress with the Three Powers Square, the Planalto and
// the Supreme Court — entered from the Esplanade's lawn, up the ramp to the roof deck and into the Senate's dome and the Chamber's bowl;
// and the Cathedral, entered down its open ramp and the tunnel under the pool to the sunken nave.
import { PRACA, PLANALTO, STF, PLATFORM, DECK, DOME, BOWL, RAMP, CATH, TUNNEL, LAWN } from './layout.js';

const room = (id, rect, y, kind) => ({ id, rect, y, kind });
const E1 = [
  { t: 'congress' },
  { t: 'praca', rect: PRACA, flag: [296, 0], pillory: [206, 0], warriors: [150, 96], justice: [206, 124] },
  { t: 'colonnade_palace', rect: PLANALTO, floors: 3, face: 'x', name: 'Planalto' },
  { t: 'colonnade_palace', rect: STF, floors: 2, face: 'x', name: 'Supremo' },
];
const dome = [DOME.c[0] - DOME.R, DOME.c[1] - DOME.R, DOME.c[0] + DOME.R, DOME.c[1] + DOME.R];
const bowl = [BOWL.c[0] - BOWL.R, BOWL.c[1] - BOWL.R, BOWL.c[0] + BOWL.R, BOWL.c[1] + BOWL.R];
const rooms1 = [
  room('lawn', [LAWN[0], -30, RAMP.x0, 30], 0, 'open'),
  room('deck', PLATFORM, DECK, 'open'),
  room('senate', [DOME.c[0] - DOME.r, DOME.c[1] - DOME.r, DOME.c[0] + DOME.r, DOME.c[1] + DOME.r], DECK, 'hall'),
  room('chamber', [BOWL.c[0] - 20, BOWL.c[1] - 20, BOWL.c[0] + 20, BOWL.c[1] + 20], DECK, 'hall'),
  room('praca', [PRACA[0] + 4, -60, PRACA[2] - 4, 60], 0, 'open'),
];
// from the lawn up the ramp, across the deck, into the Chamber by its west door and down the tiers to the table; and the Senate's
const walks1 = [
  Object.assign([[-110, 0], [-96, 0], [-52, 0], [-12, 0], [0, 0], [0, 72], [8, 72], [20, 72], [30, 72]], { y0: 0 }),
  Object.assign([[-110, 0], [-12, 0], [0, 0], [0, -72], [10, -72], [22, -72]], { y0: 0 }),
];
void dome; void bowl;
export const congress = {
  id: 'brasilia-congress',
  name: { en: 'The National Congress and the Three Powers Square', zh: '国会大厦与三权广场' },
  era: { en: 'Brasília, 1960s', zh: '巴西利亚，1960年代' },
  style: 'brasilia',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [-110, 0], facing: 'e' },
  bounds: [-120, -190, 335, 180],
  view: [-100, -190, 335, 180],
  bakeTop: 105,
  elements: E1,
  rooms: rooms1,
  walks: walks1,
};
const [cx, cz] = CATH.c;
export const cathedral = {
  id: 'brasilia-cathedral',
  name: { en: 'The Metropolitan Cathedral', zh: '大都会主教座堂' },
  era: { en: 'Brasília, 1970', zh: '巴西利亚，1970年' },
  style: 'brasilia',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [cx, TUNNEL.zR - 2], facing: 's' },
  bounds: [cx - CATH.pool - 10, cz - CATH.pool - 30, cx + CATH.pool + 10, cz + CATH.pool + 10],
  view: [cx - 60, cz - 80, cx + 60, cz + 50],
  bakeTop: 32,
  elements: [{ t: 'cathedral' }],
  rooms: [
    room('nave', [cx - 32, cz - 32, cx + 32, cz + 32], CATH.floor, 'hall'),
    room('ramp', [TUNNEL.x0, TUNNEL.zR - 6, TUNNEL.x1, TUNNEL.z0], 0, 'open'),
    room('plaza', [cx - 60, cz - 70, cx + 60, TUNNEL.zR], 0, 'open'),
  ],
  walks: [Object.assign([[cx, TUNNEL.zR - 2], [cx, TUNNEL.zR + 6], [cx, TUNNEL.z0 + 4], [cx, cz - 30], [cx, cz - 10], [cx, cz + 8], [cx, cz + 20]], { y0: 0 })],
};
export default congress;
