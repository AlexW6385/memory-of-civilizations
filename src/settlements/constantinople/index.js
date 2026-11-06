// Justinian's Constantinople, about 562: Hagia Sophia on the first hill and the city round it.
import '../../styles/greek/index.js';
import '../../styles/byzantine/index.js';
import '../../styles/roman/town.js';
import '../../styles/byzantine/city.js';
import { sophia, city } from './plan.js';
import music from './music.js';
import { houses } from './town.js';
export { music };
export const landmarks = [{ plan: sophia, music }];
export async function town() { return [city, ...(await houses())]; }
