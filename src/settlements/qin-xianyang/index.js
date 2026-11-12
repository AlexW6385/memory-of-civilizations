// Qin Xianyang and the First Emperor's mausoleum, c. 210 BC: Pit 1 of the terracotta army and the Xianyang palace hall, the market, the road, the town.
import '../../styles/qin/index.js';
import { pit, palace } from './plan.js';
import music, { pitMusic } from './music.js';
export { town } from './town.js';
export { music };
export const landmarks = [{ plan: pit, music: pitMusic }, { plan: palace, music }];
