// Babylon about 570 BC: Etemenanki, the Ishtar Gate and the Processional Way, the inner city.
import '../../styles/babylonian/index.js';
import '../../styles/ming/index.js';
import { babylon, river } from './plan.js';
import music from './music.js';
import { houses, people } from './town.js';
export { music };
export const landmarks = [{ plan: babylon, music }];
export async function town() { return [river, ...(await houses()), people()]; }
