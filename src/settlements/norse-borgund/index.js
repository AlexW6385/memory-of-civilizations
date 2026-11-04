// Norse Norway about 1250: Borgund's stave church in the Lærdal valley, its farms and fields.
import '../../styles/norse/index.js';
import { church, farms } from './plan.js';
import music from './music.js';
export { music };
export const landmarks = [{ plan: church, music }];
export async function town() { return farms(); }
