// Ming–Qing Beijing: the Outer Court of the Forbidden City and the lanes of courtyard houses round it.
// Music: the palace's courts keep the court's ritual music (courtMusic); the lanes and the avenue the street's (streetMusic).
import '../../styles/qing/index.js';
import './style.js';
import palace from './plan.js';
import { courtMusic, streetMusic } from './music.js';
export { town } from './town.js';
export const music = streetMusic;
export const landmarks = [{ plan: palace, music: courtMusic }];
