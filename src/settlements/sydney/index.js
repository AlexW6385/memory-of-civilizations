// Modern Sydney, 1973: the Opera House, the Harbour Bridge, Circular Quay, the city.
import '../../styles/modern/index.js';
import '../../styles/ming/index.js';
import { opera, harbour, water } from './plan.js';
import music from './music.js';
import { buildings } from './town.js';
export { music };
export const landmarks = [{ plan: opera, music }];
export async function town() { return [harbour, water, ...(await buildings())]; }
