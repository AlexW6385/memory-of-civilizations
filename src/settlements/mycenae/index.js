// Mycenae, c. 1250 BC: the citadel with the Lion Gate, Grave Circle A and the palace megaron, the Treasury of Atreus, the lower town.
import '../../styles/mycenaean/index.js';
import citadel from './plan.js';
import treasury from './treasury.js';
import music from './music.js';
export { town } from './town.js';
export { music };
export const landmarks = [{ plan: citadel, music }, { plan: treasury, music }];
