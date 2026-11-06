// Paris in 1248: the Sainte-Chapelle in the palace on the Île de la Cité, Notre-Dame, the Seine.
import '../../styles/greek/index.js';
import '../../styles/byzantine/index.js';
import '../../styles/gothic/index.js';
import '../../styles/gothic/town.js';
import '../../styles/gothic/notre-dame.js';
import '../../styles/vernacular/index.js';
import '../../styles/ming/index.js';
import { chapel, city, bridges, bridgeHouses, boats, river } from './plan.js';
import music from './music.js';
import { houses } from './town.js';
export { music };
export const landmarks = [{ plan: chapel, music }];
export async function town() { return [city, river, ...bridges, bridgeHouses(), boats, ...(await houses())]; }
