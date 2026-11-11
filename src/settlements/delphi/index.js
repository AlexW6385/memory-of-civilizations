// Delphi, about 400 BC: the Temple of Apollo and the oracle, the Sacred Way with its treasuries, the theatre, the stadium, the
// Castalian spring, the village of the Delphians.
import '../../styles/delphi/index.js';
import { temple_plan, sanctuary } from './plan.js';
import music from './music.js';
export { town } from './town.js';
export { music };
export const landmarks = [{ plan: temple_plan, music }, { plan: sanctuary, music }];
