// Timurid Samarkand, c. 1420: the Registan and Ulugh Beg's madrasa, Bibi-Khanym, Gur-e Amir, the observatory, the bazaar and the town.
import '../../styles/timurid/index.js';
import registan from './plan.js';
import music from './music.js';
import { registerNight } from './nightlight.js';
export { town } from './town.js';
registerNight();                  // lamps, lit windows (nightlight.js); after the style's own registration
export { music };
export const landmarks = [{ plan: registan, music }];
