// Umayyad Jerusalem, about 700: the Dome of the Rock on the Haram, the al-Aqsa, the city with its walls,
// gates, Cardo and markets, and the Church of the Holy Sepulchre.
import '../../styles/greek/index.js';
import '../../styles/roman/index.js';
import '../../styles/byzantine/index.js';
import '../../styles/islamic/index.js';
import '../../styles/islamic/town.js';
import '../../styles/islamic/city.js';
import { dome, haram } from './plan.js';
import { city } from './city.js';
import music from './music.js';
import { houses } from './town.js';
export { music };
export const landmarks = [{ plan: dome, music }];
export async function town() { return [haram, ...city(), ...(await houses())]; }
