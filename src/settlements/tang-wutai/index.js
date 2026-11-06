// Mount Wutai in 857: Foguang Monastery's Great East Hall on its terraces, the valley village.
import '../../styles/greek/index.js';
import '../../styles/byzantine/index.js';
import '../../styles/chinese/index.js';
import '../../styles/song/index.js';
import '../../styles/vernacular/index.js';
import { hall, pagoda, people } from './plan.js';
import music from './music.js';
import { houses } from './town.js';
export { music };
export const landmarks = [{ plan: hall, music }];
export async function town() { return [pagoda, people, ...(await houses())]; }
