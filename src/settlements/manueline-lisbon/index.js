// Manueline Lisbon, about 1520: the Jerónimos church and cloister, the Belém Tower, the Ribeira palace and the shipyard, the town.
import '../../styles/manueline/index.js';
import { jeronimos, belem } from './plan.js';
import music from './music.js';
export { town } from './town.js';
export { music };
export const landmarks = [{ plan: jeronimos, music }, { plan: belem, music }];
