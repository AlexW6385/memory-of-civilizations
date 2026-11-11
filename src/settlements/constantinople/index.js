// Justinian's Constantinople, about 562: Hagia Sophia on the first hill and the city round it.
import '../../styles/greek/index.js';
import '../../styles/byzantine/index.js';
import '../../styles/roman/town.js';
import '../../styles/byzantine/city.js';
import '../../styles/byzantine/augustaion.js';
import '../../styles/byzantine/houses.js';
import { sophia, city } from './plan.js';
import music from './music.js';
import { houses } from './town.js';
import { lifePlan } from './life.js';
import { processionPlan } from './procession.js';
import { interiorPlan, interiorLifePlan } from './interiors.js';
export { music };
export const landmarks = [{ plan: sophia, music }];
export async function town() { return [city, lifePlan(), processionPlan(), interiorPlan(), interiorLifePlan(), ...(await houses())]; }
