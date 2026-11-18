// Ming Suzhou, c. 1530: the Humble Administrator's Garden and the canal quarter round it.
import '../../styles/ming/index.js';
import './style.js';
import garden from './plan.js';
import music from './music.js';
import { gardenLanterns } from './lamps.js';
// the night's lanterns of the garden and the residence (lamps.js)
garden.elements.push({ t: 'garden_lanterns', list: gardenLanterns() });
export { town } from './town.js';
export { music };
export const landmarks = [{ plan: garden, music }];
