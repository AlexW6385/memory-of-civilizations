// Muscovy about 1600: the Kremlin, Red Square, St Basil's, the Moskva, the log houses.
import '../../styles/muscovite/index.js';
import '../../styles/ming/index.js';
import { square, kremlin, dormition } from './plan.js';
import { river } from './river.js';
import music from './music.js';
import { houses } from './town.js';
export { music };
export const landmarks = [{ plan: square, music }, { plan: dormition, music }];
export async function town() { return [kremlin, river, ...(await houses())]; }
