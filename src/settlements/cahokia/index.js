// Mississippian Cahokia about 1175: Monks Mound, the Grand Plaza, the palisade, Woodhenge, the town.
import '../../styles/mississippian/index.js';
import '../../styles/ming/index.js';
import { monks, precinct } from './plan.js';
import music from './music.js';
import { houses } from './town.js';
import { RADIUS, CREEK, creekZ } from './layout.js';
export { music };
export const landmarks = [{ plan: monks, music }];
const creek = {
  id: 'cahokia-creek', style: 'ming', origin: [0, 0], base: 0, yaw: 0, feature: true,
  entrance: { at: [0, 0], facing: 'n' }, bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], rooms: [],
  elements: [{ t: 'water_cells', rect: [-(RADIUS - 45), CREEK.z - 40, RADIUS - 45, CREEK.z + 40], y: CREEK.level, cell: 1.5, inside: (x, z) => Math.abs(z - creekZ(x)) < CREEK.w / 2 - 1.5 && Math.hypot(x, z) < RADIUS - 45 }],
};
export async function town() { return [precinct, creek, ...(await houses())]; }
