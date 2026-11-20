// Joseon Hanyang, c. 1888: Gyeongbokgung as rebuilt in 1865–68, the ministries, Jongno and the hanok quarters.
import '../../styles/joseon/index.js';
import palace from './plan.js';
import music from './music.js';
import { seoulWalks } from './openwalk.js';
import './streetwork.js';
import { PALACE } from './layout.js';
// the routes into the opened places of the visitor's walk (openwalk.js, docs §18)
palace.walks.push(...seoulWalks());
// the hamabi before Gwanghwamun: the stone that told those on horseback to dismount
for (const s of [-1, 1]) palace.elements.push({ t: 'hamabi', at: [s * 25, PALACE[3] + 12], face: [0, 1], y: 0.03 });
export { town } from './town.js';
export { music };
export const landmarks = [{ plan: palace, music }];
