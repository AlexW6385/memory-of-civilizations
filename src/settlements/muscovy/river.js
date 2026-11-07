// The Moskva (docs/settlements/muscovy.md §6).
import { RADIUS, RIVER, MOAT, KREMLIN, riverZ, inMoat } from './layout.js';
export const river = {
  id: 'muscovy-moskva', style: 'ming', origin: [0, 0], base: 0, yaw: 0, feature: true,
  entrance: { at: [0, 0], facing: 'n' }, bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], rooms: [],
  // (the river's water is the planet's sea: ground.js, sea) the water in the moat along the wall
  elements: [{ t: 'water_cells', rect: [KREMLIN[0][0], MOAT.z0, KREMLIN[1][0] + MOAT.d1 + 2, MOAT.z1], y: MOAT.level, cell: 0.5, inside: (x, z) => inMoat(x, z, -0.25) }],
};
