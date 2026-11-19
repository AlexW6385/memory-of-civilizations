// Classical Athens, about 410 BC: the Acropolis with the Parthenon, the Agora, the town.
import '../../styles/greek/town.js';
import '../../styles/greek/house-interior.js';
import '../../styles/greek/quarter.js';
import '../../styles/greek/gymnasium.js';
import { acropolis, parthenon } from './plan.js';
import music from './music.js';
import { registerNight } from './nightlight.js';
export { town } from './town.js';
registerNight();                      // after every file has put its elements into the style: those that make lights gain their halo (docs §19)
export { music };
export const landmarks = [{ plan: parthenon, music }, { plan: acropolis, music }];
