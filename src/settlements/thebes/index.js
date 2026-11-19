// New Kingdom Thebes, c. 1250 BC: Karnak's Great Hypostyle Hall, the temple and its lake, the town and the Nile quay.
import '../../styles/newkingdom/index.js';
import karnak from './plan.js';
import music from './music.js';
import { walkRoutes } from './walk.js';
karnak.walks.push(...walkRoutes());                   // routes into the shops and houses of the first streets (walk.js)
export { town } from './town.js';
import { registerNight } from './nightlight.js';
registerNight();                   // (idempotent; the night's halo of every lamp of the plans)
export { music };
export const landmarks = [{ plan: karnak, music }];
