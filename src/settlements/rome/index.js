// Rome under Hadrian, about AD 128: the Pantheon and the Campus Martius.
import '../../styles/roman/town.js';
import '../../styles/roman/street.js';
import './domus.js';
import { pantheon, campus } from './plan.js';
import music from './music.js';
import { town as insulae } from './town.js';
export { music };
export const landmarks = [{ plan: pantheon, music }];
export async function town() { return [campus, ...(await insulae())]; }
