// Justinian's Constantinople, about 562: Hagia Sophia on the first hill and the city round it.
import '../../styles/greek/index.js';
import '../../styles/byzantine/index.js';
import '../../styles/roman/town.js';
import '../../styles/byzantine/city.js';
import '../../styles/byzantine/augustaion.js';
import '../../styles/byzantine/houses.js';
import '../../styles/byzantine/lanes.js';
import '../../styles/constantinople/fronts.js';
import '../../styles/constantinople/homes.js';
import { sophia, city } from './plan.js';
import music from './music.js';
import { houses } from './town.js';
import { lifePlan } from './life.js';
import { processionPlan } from './procession.js';
import { laneLifePlans } from './lanelife.js';
import { outerLifePlans } from './outerlife.js';
import { hippodromePlan } from './hippodrome.js';
import { interiorPlan, interiorLifePlan } from './interiors.js';
export { music };
export const landmarks = [{ plan: sophia, music }];
export async function town() { return [city, lifePlan(), processionPlan(), interiorPlan(), interiorLifePlan(), ...laneLifePlans(), ...outerLifePlans(), hippodromePlan(), ...(await houses())]; }
