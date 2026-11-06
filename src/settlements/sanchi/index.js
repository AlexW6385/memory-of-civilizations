// Sanchi in the 1st century: the Great Stupa on its hill and the village below.
import '../../styles/chinese/index.js';
import '../../styles/indian/index.js';
import '../../styles/vernacular/index.js';
import { stupa, stupa2, site, pilgrims } from './plan.js';
import music from './music.js';
import { town as houses } from './town.js';
export async function town() { return [stupa2, site, pilgrims, ...(await houses())]; }
export { music };
export const landmarks = [{ plan: stupa, music }];
