// Versailles about 1690: the château, its gardens and canal, the town.
import '../../styles/vernacular/houses-med.js';
import '../../styles/classical_fr/index.js';
import '../../styles/vernacular/index.js';
import '../../styles/ming/index.js';
import { chateau, canal } from './plan.js';
import music from './music.js';
import { houses } from './town.js';
import { gardenPlans } from './garden.js';
export { music };
export const landmarks = [{ plan: chateau, music }];
export async function town() { return [canal, ...gardenPlans(), ...(await houses())]; }
