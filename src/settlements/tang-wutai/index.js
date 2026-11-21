// Mount Wutai in 857: Foguang Monastery's Great East Hall on its terraces, the valley village.
import '../../styles/greek/index.js';
import '../../styles/byzantine/index.js';
import '../../styles/chinese/index.js';
import '../../buildings/foguang-east-hall/roofwork.js';
import '../../buildings/foguang-east-hall/sculpture.js';
import '../../styles/song/index.js';
import '../../styles/vernacular/index.js';
import './nightlight.js';
import { hall, pagoda, people, sengfang, gate, monastery, courts } from './plan.js';
import music from './music.js';
import { houses } from './town.js';
export { music };
export const landmarks = [{ plan: hall, music }];
export async function town() { return [pagoda, sengfang, gate, gate, monastery, courts, people, ...(await houses())]; }
