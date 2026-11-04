// Modern New York, 1931: the Empire State Building, Chrysler, Grand Central, the Library, Midtown's grid.
import '../../styles/artdeco/index.js';
import { esb, midtown } from './plan.js';
import music from './music.js';
import { buildings } from './town.js';
export { music };
export const landmarks = [{ plan: esb, music }];
export async function town() { return [midtown, ...(await buildings())]; }
