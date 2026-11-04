// Victorian London about 1870: Westminster — the Palace, the Abbey, the bridge, the Thames, the terraces.
import '../../styles/victorian/index.js';
import '../../styles/ming/index.js';
import { westminster, bridge, river } from './plan.js';
import music from './music.js';
import { houses } from './town.js';
export { music };
export const landmarks = [{ plan: westminster, music }];
export async function town() { return [bridge, river, ...(await houses())]; }
