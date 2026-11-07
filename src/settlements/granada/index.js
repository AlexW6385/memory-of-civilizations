// Nasrid Granada about 1390: the Alhambra on its hill, the Generalife across the ravine, the Albaicín across the Darro.
import '../../styles/vernacular/houses-med.js';
import '../../styles/nasrid/index.js';
import '../../styles/vernacular/index.js';
import alhambra from './plan.js';
import generalife from './generalife.js';
import music from './music.js';
export { town } from './town.js';
export { music };
export const landmarks = [{ plan: alhambra, music }, { plan: generalife, music }];
