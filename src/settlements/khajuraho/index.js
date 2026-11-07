// Khajuraho about 1050: the Western Group of Chandela temples, the tank, the village.
import '../../styles/nagara/index.js';
import '../../styles/vernacular/index.js';
import '../../styles/ming/index.js';
import { temples, tank, life } from './plan.js';
import music from './music.js';
import { houses } from './town.js';
export { music };
export const landmarks = [{ plan: temples, music }];
export async function town() { return [tank, life, ...(await houses())]; }
