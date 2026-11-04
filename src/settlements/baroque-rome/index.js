// Baroque Rome about 1670: St Peter's, Bernini's colonnade, the Borgo, Castel Sant'Angelo, the Tiber.
import '../../styles/baroque/index.js';
import '../../styles/vernacular/index.js';
import '../../styles/ming/index.js';
import { stpeter, vatican, passetto, bridge, river } from './plan.js';
import music from './music.js';
import { houses } from './town.js';
export { music };
export const landmarks = [{ plan: stpeter, music }];
export async function town() { return [vatican, passetto, bridge, river, ...(await houses())]; }
