// Uji in 1053: the Phoenix Hall of Byōdō-in across its pond, the Uji River and its bridge, the village.
import '../../styles/byzantine/index.js';
import '../../styles/chinese/index.js';
import '../../styles/japanese/index.js';
import '../../styles/vernacular/index.js';
import '../../styles/ming/index.js';
import { hall, bridge, weirs, riverPeople, dais, worshippers, mats } from './plan.js';
import music from './music.js';
import { houses } from './town.js';
import { lanesPlan } from './street.js';
import { garden, belfry } from './garden.js';
import { viewPier, courtBoat, courtBoatPeople, shoreFolk } from './shore.js';
import { villaPlan, noblePlan, villaFolk, pier, players, precinct } from './compound.js';
export { music };
export const landmarks = [{ plan: hall, music }];
export async function town() { return [bridge, garden, belfry, weirs, riverPeople, dais, worshippers, mats, villaPlan, noblePlan, villaFolk, pier, players, precinct, viewPier, courtBoat, courtBoatPeople, shoreFolk, ...(await houses()), ...lanesPlan()]; }
