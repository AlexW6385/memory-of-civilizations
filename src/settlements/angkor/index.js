// Angkor, c. 1150: Angkor Wat, its moat, and a village of houses on stilts round it.
import '../../styles/khmer/index.js';
import './library.js';
import './dress.js';
import './relief.js';
import './uses.js';
import temple from './plan.js';
import music from './music.js';
import { walkRoutes } from './walk.js';
export { town } from './town.js';
export { music };
temple.walks.push(...walkRoutes());
export const landmarks = [{ plan: temple, music }];
