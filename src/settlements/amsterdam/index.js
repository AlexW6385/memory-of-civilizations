// Amsterdam about 1670: the canal rings, the Dam and its Town Hall, the Westerkerk, the IJ.
import '../../styles/dutch/index.js';
import '../../styles/ming/index.js';
import { dam, canals } from './plan.js';
import music from './music.js';
import { houses, damLife, warehouses } from './town.js';
import { quayLife } from './quay.js';
import { damDress } from './dam-dress.js';
export { music };
export const landmarks = [{ plan: dam, music }];
export async function town() { return [canals, ...(await houses()), ...warehouses(), ...damLife(), ...damDress(), ...quayLife()]; }
