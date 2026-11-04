// Uji in 1053: the Phoenix Hall of Byōdō-in across its pond, the Uji River and its bridge, the village.
import '../../styles/byzantine/index.js';
import '../../styles/chinese/index.js';
import '../../styles/japanese/index.js';
import '../../styles/vernacular/index.js';
import '../../styles/ming/index.js';
import { hall, bridge, river } from './plan.js';
import music from './music.js';
import { houses } from './town.js';
export { music };
export const landmarks = [{ plan: hall, music }];
export async function town() { return [bridge, river, ...(await houses())]; }
