// Conques about 1120: the abbey church of Sainte-Foy on its hillside village over the Dourdou.
import '../../styles/greek/index.js';
import '../../styles/byzantine/index.js';
import '../../styles/romanesque/index.js';
import '../../styles/romanesque/parvis.js';
import '../../styles/vernacular/index.js';
import '../../styles/ming/index.js';
import { abbey, terrace, bridge, river } from './plan.js';
import music from './music.js';
import { houses, works, goods, people } from './town.js';
import { extras } from './extras.js';
import { lots, ABBEY } from './layout.js';
import { upRoute } from '../../styles/romanesque/upper.js';
export { music };
// the walk-check routes from the lane up each open house's stair to its upper room ride on the landmark's plan (local to its origin)
const houseWalks = () => lots().filter((l) => l.up).map((l) => Object.assign(upRoute(l).map(([x, z]) => [x - ABBEY.origin[0], z - ABBEY.origin[1]]), { y0: l.y }));
export const landmarks = [{ plan: { ...abbey, walks: [...(abbey.walks ?? []), ...houseWalks()] }, music }];
export async function town() { return [terrace, bridge, river, works(), ...goods(), ...people(), ...extras(), ...(await houses())]; }
