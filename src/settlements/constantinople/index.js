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
import './rider.js';
import './chalke.js';
import { sophia, city, JUSTINIAN } from './plan.js';
import music from './music.js';
import { houses } from './town.js';
import { CHALKE } from './layout.js';
import { lifePlan } from './life.js';
import { processionPlan } from './procession.js';
import { laneLifePlans } from './lanelife.js';
import { outerLifePlans } from './outerlife.js';
import { hippodromePlan } from './hippodrome.js';
import { interiorPlan, interiorLifePlan } from './interiors.js';
export { music };
export const landmarks = [{ plan: sophia, music }];
// the Column of Justinian's rider in two forms by distance: the old statue beyond 110 m, the modelled bronze rider within (the column's capital tops at y = 45.1)
const riderPlans = () => {
  const mk = (id, t, o) => ({ id, style: 'roman', origin: [0, 0], base: 0, yaw: 0, feature: true, elements: [{ t, at: JUSTINIAN, y: 0, h: 34, d: 3.2, ...(t === 'cn_rider' ? { y: 45.12, s: 3.4 } : {}) }], rooms: [], bounds: [-400, -160, 262, 362], entrance: { at: [-150, 110], facing: 'e' }, center: JUSTINIAN, nocollide: true, ...o });
  return [mk('cn-rider-far', 'cn_old_rider', { far: 110 }), mk('cn-rider-near', 'cn_rider', { near: 110 })];
};
const chalkePlan = () => ({ id: 'cn-chalke-mosaic', style: 'roman', origin: [0, 0], base: 0, yaw: 0, feature: true, elements: [{ t: 'cn_chalke_lunette', c: CHALKE.c, y: 0 }], rooms: [], bounds: [-400, -160, 262, 362], entrance: { at: [-150, 110], facing: 'e' }, center: CHALKE.c, near: 70, nocollide: true });
export async function town() { return [city, ...riderPlans(), chalkePlan(), lifePlan(), processionPlan(), interiorPlan(), interiorLifePlan(), ...laneLifePlans(), ...outerLifePlans(), hippodromePlan(), ...(await houses())]; }
