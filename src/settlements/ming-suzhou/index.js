// Ming Suzhou, c. 1530: the Humble Administrator's Garden and the canal quarter round it.
import '../../styles/ming/index.js';
import './style.js';
import garden from './plan.js';
import music from './music.js';
import { gardenLanterns } from './lamps.js';
import { wenElements, wenWalks } from './wenscenes.js';
import { northWalks } from './north.js';
// the night's lanterns of the garden and the residence (lamps.js)
garden.elements.push({ t: 'garden_lanterns', list: gardenLanterns() });
// the scenes of Wen Zhengming's record (wenscenes.js)
garden.elements.push(...wenElements());
garden.walks.push(...wenWalks());
// the climb of the Bao'en pagoda and the walks on the north wall (north.js)
garden.walks.push(...northWalks());
export { town } from './town.js';
import { registerNight } from './nightlight.js';
registerNight();                  // (idempotent; after every style file, the same whatever the import order)
export { music };
export const landmarks = [{ plan: garden, music }];
