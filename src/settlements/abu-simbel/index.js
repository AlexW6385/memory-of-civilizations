// Abu Simbel, c. 1255 BC: the Great Temple of Ramesses II and the Small Temple of Nefertari cut in the cliff above the Nile, the terrace and the quay,
// the priests' and workmen's camp.
import '../../styles/ramesside/index.js';
import { great, small } from './plan.js';
import music from './music.js';
export { town } from './town.js';
export { music };
export const landmarks = [{ plan: great, music }, { plan: small, music }];
