// Conques about 1120: the abbey church of Sainte-Foy on its hillside village over the Dourdou.
import '../../styles/greek/index.js';
import '../../styles/byzantine/index.js';
import '../../styles/romanesque/index.js';
import '../../styles/vernacular/index.js';
import '../../styles/ming/index.js';
import { abbey, terrace, bridge, river } from './plan.js';
import music from './music.js';
import { houses } from './town.js';
export { music };
export const landmarks = [{ plan: abbey, music }];
export async function town() { return [terrace, bridge, river, ...(await houses())]; }
