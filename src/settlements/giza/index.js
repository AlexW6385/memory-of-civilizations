// Giza, c. 2560 BC: the Great Pyramid and its complex, the cemeteries, the workers' town.
import '../../styles/oldkingdom-giza/index.js';
import pyramid from './plan.js';
import music from './music.js';
import { walkRoutes } from './walk.js';
pyramid.walks.push(...walkRoutes());                  // the visitor's walk and the routes into the town's places (walk.js)
export { town } from './town.js';
export { music };
export const landmarks = [{ plan: pyramid, music }];
