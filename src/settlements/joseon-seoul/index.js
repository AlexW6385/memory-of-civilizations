// Joseon Hanyang, c. 1888: Gyeongbokgung as rebuilt in 1865–68, the ministries, Jongno and the hanok quarters.
import '../../styles/joseon/index.js';
import palace from './plan.js';
import music from './music.js';
import { seoulWalks } from './openwalk.js';
// the routes into the opened places of the visitor's walk (openwalk.js, docs §18)
palace.walks.push(...seoulWalks());
export { town } from './town.js';
export { music };
export const landmarks = [{ plan: palace, music }];
