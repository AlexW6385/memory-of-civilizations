// Amsterdam about 1670: the canal rings, the Dam and its Town Hall, the Westerkerk, the IJ.
import '../../styles/dutch/index.js';
import '../../styles/ming/index.js';
import { dam, canals } from './plan.js';
import music from './music.js';
import { houses, damLife, warehouses, upperWalks } from './town.js';
import { quayLife } from './quay.js';
import { damDress } from './dam-dress.js';
import { shopPlans, hallWalks } from './shops.js';
export { music };
export const landmarks = [{ plan: { ...dam, walks: [...dam.walks, ...upperWalks(), ...hallWalks()] }, music }];
export async function town() { return [canals, ...(await houses()), ...warehouses(), ...damLife(), ...damDress(), ...quayLife(), ...shopPlans()]; }
