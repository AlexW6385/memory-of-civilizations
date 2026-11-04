// Florence about 1480: the cathedral and its dome, the Baptistery and campanile, the Signoria, the Arno.
import '../../styles/renaissance/index.js';
import '../../styles/vernacular/index.js';
import '../../styles/ming/index.js';
import { centre, bridge, river } from './plan.js';
import music from './music.js';
import { houses } from './town.js';
export { music };
export const landmarks = [{ plan: centre, music }];
export async function town() { return [bridge, river, ...(await houses())]; }
