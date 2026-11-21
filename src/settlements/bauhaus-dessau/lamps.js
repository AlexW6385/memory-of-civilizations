// Where the street lamps stand (docs/settlements/bauhaus-dessau.md §11, §15.2): on the outer edge of each pavement, 32 m apart. Read by town.js (the lamp
// posts) and nightlight.js (their light), so a glow is on a post that is there.
import { RADIUS, ROAD_M, ROAD_KV, ROAD_K, ROAD_E, FOOT, inSchool, inLot } from './layout.js';

let L = null;
/** The lamps: [[x, z]...]. */
export function lampSites() {
  if (L) return L;
  L = [];
  const F = RADIUS - 14, lamp = (x, z) => { if (!inSchool(x, z, 2) && !inLot(x, z, 0.5) && Math.hypot(x, z) < F) L.push([x, z]); };
  for (let z = -170; z <= 170; z += 32) { lamp(ROAD_M[0] - FOOT + 0.3, z); lamp(ROAD_M[2] + FOOT - 0.3, z + 16); lamp(ROAD_KV[0] - FOOT + 0.3, z + 8); lamp(ROAD_KV[2] + FOOT - 0.3, z + 24); }
  for (let x = -170; x <= 180; x += 32) { lamp(x, ROAD_K[1] - FOOT + 0.3); lamp(x + 16, ROAD_K[3] + FOOT - 0.3); lamp(x + 8, ROAD_E[3] + FOOT - 0.3); }
  return L;
}
export const LAMP_H = 4.6;
