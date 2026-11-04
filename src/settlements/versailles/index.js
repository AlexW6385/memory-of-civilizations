// Versailles about 1690: the château, its gardens and canal, the town.
import '../../styles/classical_fr/index.js';
import '../../styles/vernacular/index.js';
import '../../styles/ming/index.js';
import { chateau, canal } from './plan.js';
import music from './music.js';
import { houses } from './town.js';
export { music };
export const landmarks = [{ plan: chateau, music }];
export async function town() { return [canal, ...(await houses())]; }
