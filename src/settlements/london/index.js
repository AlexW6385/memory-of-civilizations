// Victorian London about 1870: Westminster — the Palace, the Abbey, the bridge, the Thames, the terraces.
import '../../styles/victorian/index.js';
import '../../styles/ming/index.js';
import { westminster, bridge, insidePlans } from './plan.js';
import music from './music.js';
import { houses } from './town.js';
import { nightPlan } from './nightlight.js';
export { music };
export const landmarks = [{ plan: westminster, music }];
// (the Thames is the planet's sea: ground.js, sea)
export async function town() { return [bridge, ...insidePlans(), nightPlan(), ...(await houses())]; }
