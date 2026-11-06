// Norse Norway about 1250: Borgund's stave church in the Lærdal valley, its farms and fields.
import '../../styles/norse/index.js';
import { church } from './plan.js';
import { farms } from './town.js';
import music from './music.js';
export { music };
export const landmarks = [{ plan: church, music }];
export async function town() { return farms(); }
