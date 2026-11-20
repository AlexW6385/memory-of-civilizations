// Barcelona about 1910: the Sagrada Família rising, La Pedrera, Casa Batlló, the Eixample.
import '../../styles/modernisme/index.js';
import sagrada from './plan.js';
import music from './music.js';
import { town as blocks } from './town.js';
import { nightPlan } from './nightlight.js';
export { music };
export const landmarks = [{ plan: sagrada, music }];
/** The town's plans and the night's lights (one plan of one material: nightlight.js). */
export async function town() { return [...(await blocks()), nightPlan()]; }
