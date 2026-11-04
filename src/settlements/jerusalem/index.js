// Umayyad Jerusalem, about 700: the Dome of the Rock on the Haram, the al-Aqsa, the city.
import '../../styles/greek/index.js';
import '../../styles/roman/index.js';
import '../../styles/byzantine/index.js';
import '../../styles/islamic/index.js';
import '../../styles/islamic/town.js';
import '../../styles/roman/town.js';
import { dome, haram, sepulchre } from './plan.js';
import music from './music.js';
import { houses } from './town.js';
export { music };
export const landmarks = [{ plan: dome, music }];
export async function town() { return [haram, sepulchre, ...(await houses())]; }
