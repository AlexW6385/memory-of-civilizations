// Edfu, 1st century BC: the Temple of Horus in its precinct, the town, the Nile.
import '../../styles/egyptian/index.js';
import '../../styles/oldkingdom/index.js';
import '../../styles/ming/index.js';
import { temple, precinct, lake, mammisi } from './plan.js';
import music from './music.js';
import { houses, quay } from './town.js';
export { music };
export const landmarks = [{ plan: temple, music }];
export async function town() { return [precinct, mammisi, lake, ...quay(), ...(await houses())]; }
