// Ptolemaic Alexandria, about 250 BC: the Pharos, the Great Harbour, the Museion and the Library, the Canopic Way, the town.
import '../../styles/ptolemaic/index.js';
import { pharos, museion } from './plan.js';
import music from './music.js';
export { town } from './town.js';
export { music };
export const landmarks = [{ plan: pharos, music }, { plan: museion, music }];
